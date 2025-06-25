use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::fs;
use tokio::io::{AsyncWriteExt, AsyncReadExt};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use sqlx::{PgPool, Row};
use flate2::write::GzEncoder;
use flate2::read::GzDecoder;
use flate2::Compression;
use std::io::{Write, Read};

use crate::config::Config;
use crate::error::AppError;
use super::{RawDataRecord, PublicationRecord, DataSource};

/// High-performance data storage system
pub struct DataStorage {
    config: Arc<Config>,
    db_pool: PgPool,
    base_path: PathBuf,
    compression_level: u32,
}

/// Storage statistics
#[derive(Debug, Serialize, Deserialize)]
pub struct StorageStats {
    pub total_records: u64,
    pub total_size_bytes: u64,
    pub compressed_size_bytes: u64,
    pub compression_ratio: f64,
    pub oldest_record: Option<DateTime<Utc>>,
    pub newest_record: Option<DateTime<Utc>>,
    pub sources_count: u32,
    pub publications_count: u32,
}

/// Data file metadata
#[derive(Debug, Serialize, Deserialize)]
pub struct DataFileMetadata {
    pub file_id: Uuid,
    pub source_id: Uuid,
    pub file_path: String,
    pub file_size: u64,
    pub compressed_size: u64,
    pub record_count: u32,
    pub checksum: String,
    pub created_at: DateTime<Utc>,
    pub time_range_start: DateTime<Utc>,
    pub time_range_end: DateTime<Utc>,
    pub parameters: Vec<String>,
}

impl DataStorage {
    pub async fn new(config: Arc<Config>, db_pool: PgPool) -> Result<Self, AppError> {
        let base_path = PathBuf::from(&config.data_storage_path);
        
        // Create directory structure
        fs::create_dir_all(&base_path).await
            .map_err(|e| AppError::internal(format!("Failed to create storage directory: {}", e)))?;
        
        // Create subdirectories for organization
        for subdir in &["raw", "processed", "publications", "metadata", "temp", "backups"] {
            fs::create_dir_all(base_path.join(subdir)).await
                .map_err(|e| AppError::internal(format!("Failed to create subdirectory {}: {}", subdir, e)))?;
        }
        
        Ok(Self {
            config,
            db_pool,
            base_path,
            compression_level: 6, // Good balance of speed vs compression
        })
    }
    
    /// Store raw data record with compression and indexing
    pub async fn store_raw_data(&self, record: &RawDataRecord) -> Result<String, AppError> {
        let file_path = self.generate_file_path(record).await?;
        
        // Serialize and compress data
        let serialized = serde_json::to_vec(record)
            .map_err(|e| AppError::internal(format!("Failed to serialize record: {}", e)))?;
        
        let compressed = self.compress_data(&serialized)?;
        
        // Write to file
        let full_path = self.base_path.join(&file_path);
        if let Some(parent) = full_path.parent() {
            fs::create_dir_all(parent).await
                .map_err(|e| AppError::internal(format!("Failed to create parent directory: {}", e)))?;
        }
        
        fs::write(&full_path, &compressed).await
            .map_err(|e| AppError::internal(format!("Failed to write data file: {}", e)))?;
        
        // Calculate checksum
        let checksum = self.calculate_checksum(&compressed)?;
        
        // Store metadata in database
        let file_metadata = DataFileMetadata {
            file_id: Uuid::new_v4(),
            source_id: record.source_id,
            file_path: file_path.clone(),
            file_size: serialized.len() as u64,
            compressed_size: compressed.len() as u64,
            record_count: 1,
            checksum,
            created_at: Utc::now(),
            time_range_start: record.timestamp,
            time_range_end: record.timestamp,
            parameters: record.metadata.parameters.keys().cloned().collect(),
        };
        
        self.store_file_metadata(&file_metadata).await?;
        
        // Index the record for fast searching
        self.index_record(record, &file_path).await?;
        
        Ok(file_path)
    }
    
    /// Store multiple records in a batch for efficiency
    pub async fn store_raw_data_batch(&self, records: &[RawDataRecord]) -> Result<Vec<String>, AppError> {
        if records.is_empty() {
            return Ok(vec![]);
        }
        
        // Group records by source and time bucket for efficient storage
        let grouped = self.group_records_for_storage(records).await?;
        let mut file_paths = Vec::new();
        
        for (batch_key, batch_records) in grouped {
            let file_path = self.generate_batch_file_path(&batch_key, &batch_records).await?;
            
            // Serialize all records in batch
            let serialized = serde_json::to_vec(&batch_records)
                .map_err(|e| AppError::internal(format!("Failed to serialize batch: {}", e)))?;
            
            let compressed = self.compress_data(&serialized)?;
            
            // Write batch file
            let full_path = self.base_path.join(&file_path);
            if let Some(parent) = full_path.parent() {
                fs::create_dir_all(parent).await
                    .map_err(|e| AppError::internal(format!("Failed to create parent directory: {}", e)))?;
            }
            
            fs::write(&full_path, &compressed).await
                .map_err(|e| AppError::internal(format!("Failed to write batch file: {}", e)))?;
            
            // Calculate metadata
            let checksum = self.calculate_checksum(&compressed)?;
            let time_range = self.get_time_range(&batch_records)?;
            let parameters = self.get_unique_parameters(&batch_records)?;
            
            let file_metadata = DataFileMetadata {
                file_id: Uuid::new_v4(),
                source_id: batch_records[0].source_id,
                file_path: file_path.clone(),
                file_size: serialized.len() as u64,
                compressed_size: compressed.len() as u64,
                record_count: batch_records.len() as u32,
                checksum,
                created_at: Utc::now(),
                time_range_start: time_range.0,
                time_range_end: time_range.1,
                parameters,
            };
            
            self.store_file_metadata(&file_metadata).await?;
            
            // Index all records in the batch
            for record in &batch_records {
                self.index_record(record, &file_path).await?;
            }
            
            file_paths.push(file_path);
        }
        
        Ok(file_paths)
    }
    
    /// Store publication record
    pub async fn store_publication(&self, publication: &PublicationRecord) -> Result<(), AppError> {
        let query = r#"
            INSERT INTO publications (
                id, title, authors, journal, publication_date, doi, url, 
                abstract_text, keywords, associated_data_sources, publication_type, 
                citation_count, relevance_score, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                authors = EXCLUDED.authors,
                journal = EXCLUDED.journal,
                publication_date = EXCLUDED.publication_date,
                doi = EXCLUDED.doi,
                url = EXCLUDED.url,
                abstract_text = EXCLUDED.abstract_text,
                keywords = EXCLUDED.keywords,
                associated_data_sources = EXCLUDED.associated_data_sources,
                publication_type = EXCLUDED.publication_type,
                citation_count = EXCLUDED.citation_count,
                relevance_score = EXCLUDED.relevance_score,
                updated_at = EXCLUDED.updated_at
        "#;
        
        let now = Utc::now();
        let authors_json = serde_json::to_value(&publication.authors)?;
        let keywords_json = serde_json::to_value(&publication.keywords)?;
        let sources_json = serde_json::to_value(&publication.associated_data_sources)?;
        let pub_type_str = serde_json::to_string(&publication.publication_type)?;
        
        sqlx::query(query)
            .bind(&publication.id)
            .bind(&publication.title)
            .bind(&authors_json)
            .bind(&publication.journal)
            .bind(&publication.publication_date)
            .bind(&publication.doi)
            .bind(&publication.url)
            .bind(&publication.abstract_text)
            .bind(&keywords_json)
            .bind(&sources_json)
            .bind(&pub_type_str)
            .bind(&publication.citation_count.map(|c| c as i32))
            .bind(&publication.relevance_score)
            .bind(&now)
            .bind(&now)
            .execute(&self.db_pool)
            .await
            .map_err(|e| AppError::database(e))?;
        
        Ok(())
    }
    
    /// Retrieve raw data records by query
    pub async fn get_raw_data(
        &self,
        source_id: Option<Uuid>,
        time_start: Option<DateTime<Utc>>,
        time_end: Option<DateTime<Utc>>,
        parameters: Option<Vec<String>>,
        limit: Option<u32>,
    ) -> Result<Vec<RawDataRecord>, AppError> {
        // First, find relevant files from metadata
        let file_paths = self.find_relevant_files(source_id, time_start, time_end, parameters).await?;
        
        let mut all_records = Vec::new();
        let limit = limit.unwrap_or(1000) as usize;
        
        for file_path in file_paths {
            if all_records.len() >= limit {
                break;
            }
            
            let records = self.load_records_from_file(&file_path).await?;
            
            // Filter records based on criteria
            for record in records {
                if all_records.len() >= limit {
                    break;
                }
                
                // Apply filters
                if let Some(sid) = source_id {
                    if record.source_id != sid {
                        continue;
                    }
                }
                
                if let Some(start) = time_start {
                    if record.timestamp < start {
                        continue;
                    }
                }
                
                if let Some(end) = time_end {
                    if record.timestamp > end {
                        continue;
                    }
                }
                
                if let Some(params) = &parameters {
                    let record_params: Vec<String> = record.metadata.parameters.keys().cloned().collect();
                    if !params.iter().any(|p| record_params.contains(p)) {
                        continue;
                    }
                }
                
                all_records.push(record);
            }
        }
        
        Ok(all_records)
    }
    
    /// Get storage statistics
    pub async fn get_storage_stats(&self) -> Result<StorageStats, AppError> {
        let query = r#"
            SELECT 
                COUNT(*) as total_records,
                SUM(file_size) as total_size,
                SUM(compressed_size) as compressed_size,
                MIN(time_range_start) as oldest,
                MAX(time_range_end) as newest,
                COUNT(DISTINCT source_id) as sources_count
            FROM data_file_metadata
        "#;
        
        let row = sqlx::query(query)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| AppError::database(e))?;
        
        let total_records: i64 = row.get("total_records");
        let total_size: Option<i64> = row.get("total_size");
        let compressed_size: Option<i64> = row.get("compressed_size");
        let oldest: Option<DateTime<Utc>> = row.get("oldest");
        let newest: Option<DateTime<Utc>> = row.get("newest");
        let sources_count: i64 = row.get("sources_count");
        
        let publications_count = sqlx::query("SELECT COUNT(*) as count FROM publications")
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| AppError::database(e))?
            .get::<i64, _>("count");
        
        let total_size_bytes = total_size.unwrap_or(0) as u64;
        let compressed_size_bytes = compressed_size.unwrap_or(0) as u64;
        let compression_ratio = if total_size_bytes > 0 {
            compressed_size_bytes as f64 / total_size_bytes as f64
        } else {
            0.0
        };
        
        Ok(StorageStats {
            total_records: total_records as u64,
            total_size_bytes,
            compressed_size_bytes,
            compression_ratio,
            oldest_record: oldest,
            newest_record: newest,
            sources_count: sources_count as u32,
            publications_count: publications_count as u32,
        })
    }
    
    // Helper methods
    
    async fn generate_file_path(&self, record: &RawDataRecord) -> Result<String, AppError> {
        let date = record.timestamp.format("%Y/%m/%d");
        let hour = record.timestamp.format("%H");
        let filename = format!("{}_{}.json.gz", record.source_id, record.id);
        Ok(format!("raw/{}/{}/{}", date, hour, filename))
    }
    
    async fn generate_batch_file_path(&self, batch_key: &str, records: &[RawDataRecord]) -> Result<String, AppError> {
        if records.is_empty() {
            return Err(AppError::internal("Empty batch"));
        }
        
        let date = records[0].timestamp.format("%Y/%m/%d");
        let hour = records[0].timestamp.format("%H");
        let filename = format!("batch_{}_{}.json.gz", batch_key, Uuid::new_v4());
        Ok(format!("raw/{}/{}/{}", date, hour, filename))
    }
    
    fn compress_data(&self, data: &[u8]) -> Result<Vec<u8>, AppError> {
        let mut encoder = GzEncoder::new(Vec::new(), Compression::new(self.compression_level));
        encoder.write_all(data)
            .map_err(|e| AppError::internal(format!("Compression failed: {}", e)))?;
        encoder.finish()
            .map_err(|e| AppError::internal(format!("Compression finalization failed: {}", e)))
    }
    
    fn calculate_checksum(&self, data: &[u8]) -> Result<String, AppError> {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(data);
        Ok(format!("{:x}", hasher.finalize()))
    }
    
    async fn group_records_for_storage(&self, records: &[RawDataRecord]) -> Result<std::collections::HashMap<String, Vec<RawDataRecord>>, AppError> {
        let mut groups = std::collections::HashMap::new();
        
        for record in records {
            // Group by source_id and hour
            let key = format!("{}_{}", 
                record.source_id, 
                record.timestamp.format("%Y%m%d%H")
            );
            
            groups.entry(key).or_insert_with(Vec::new).push(record.clone());
        }
        
        Ok(groups)
    }
    
    // Additional helper methods would be implemented here...
    
    async fn store_file_metadata(&self, metadata: &DataFileMetadata) -> Result<(), AppError> {
        let query = r#"
            INSERT INTO data_file_metadata (
                file_id, source_id, file_path, file_size, compressed_size,
                record_count, checksum, created_at, time_range_start, 
                time_range_end, parameters
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (file_id) DO UPDATE SET
                file_size = EXCLUDED.file_size,
                compressed_size = EXCLUDED.compressed_size,
                record_count = EXCLUDED.record_count,
                checksum = EXCLUDED.checksum,
                time_range_start = EXCLUDED.time_range_start,
                time_range_end = EXCLUDED.time_range_end,
                parameters = EXCLUDED.parameters
        "#;
        
        sqlx::query(query)
            .bind(metadata.file_id)
            .bind(metadata.source_id)
            .bind(&metadata.file_path)
            .bind(metadata.file_size as i64)
            .bind(metadata.compressed_size as i64)
            .bind(metadata.record_count as i32)
            .bind(&metadata.checksum)
            .bind(metadata.created_at)
            .bind(metadata.time_range_start)
            .bind(metadata.time_range_end)
            .bind(&metadata.parameters)
            .execute(&self.db_pool)
            .await
            .map_err(|e| AppError::database(e))?;
        
        Ok(())
    }
    
    async fn index_record(&self, record: &RawDataRecord, file_path: &str) -> Result<(), AppError> {
        let query = r#"
            INSERT INTO data_record_index (
                record_id, source_id, timestamp, file_path, parameters
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (record_id) DO NOTHING
        "#;
        
        let parameters: Vec<String> = record.metadata.parameters.keys().cloned().collect();
        
        sqlx::query(query)
            .bind(record.id)
            .bind(record.source_id)
            .bind(record.timestamp)
            .bind(file_path)
            .bind(&parameters)
            .execute(&self.db_pool)
            .await
            .map_err(|e| AppError::database(e))?;
        
        Ok(())
    }
    
    fn get_time_range(&self, records: &[RawDataRecord]) -> Result<(DateTime<Utc>, DateTime<Utc>), AppError> {
        if records.is_empty() {
            return Err(AppError::internal("Empty records"));
        }
        
        let mut min_time = records[0].timestamp;
        let mut max_time = records[0].timestamp;
        
        for record in records {
            if record.timestamp < min_time {
                min_time = record.timestamp;
            }
            if record.timestamp > max_time {
                max_time = record.timestamp;
            }
        }
        
        Ok((min_time, max_time))
    }
    
    fn get_unique_parameters(&self, records: &[RawDataRecord]) -> Result<Vec<String>, AppError> {
        let mut all_params = std::collections::HashSet::new();
        
        for record in records {
            for param in record.metadata.parameters.keys() {
                all_params.insert(param.clone());
            }
        }
        
        Ok(all_params.into_iter().collect())
    }
    
    async fn find_relevant_files(
        &self,
        source_id: Option<Uuid>,
        time_start: Option<DateTime<Utc>>,
        time_end: Option<DateTime<Utc>>,
        parameters: Option<Vec<String>>,
    ) -> Result<Vec<String>, AppError> {
        let mut query = "SELECT file_path FROM data_file_metadata WHERE 1=1".to_string();
        let mut bind_count = 0;
        
        if source_id.is_some() {
            bind_count += 1;
            query.push_str(&format!(" AND source_id = ${}", bind_count));
        }
        
        if time_start.is_some() {
            bind_count += 1;
            query.push_str(&format!(" AND time_range_end >= ${}", bind_count));
        }
        
        if time_end.is_some() {
            bind_count += 1;
            query.push_str(&format!(" AND time_range_start <= ${}", bind_count));
        }
        
        if parameters.is_some() {
            bind_count += 1;
            query.push_str(&format!(" AND parameters && ${}", bind_count));
        }
        
        query.push_str(" ORDER BY time_range_start");
        
        let mut query_builder = sqlx::query(&query);
        
        if let Some(sid) = source_id {
            query_builder = query_builder.bind(sid);
        }
        
        if let Some(start) = time_start {
            query_builder = query_builder.bind(start);
        }
        
        if let Some(end) = time_end {
            query_builder = query_builder.bind(end);
        }
        
        if let Some(params) = parameters {
            query_builder = query_builder.bind(params);
        }
        
        let rows = query_builder
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| AppError::database(e))?;
        
        let mut file_paths = Vec::new();
        for row in rows {
            file_paths.push(row.get::<String, _>("file_path"));
        }
        
        Ok(file_paths)
    }
    
    async fn load_records_from_file(&self, file_path: &str) -> Result<Vec<RawDataRecord>, AppError> {
        let full_path = self.base_path.join(file_path);
        
        // Read compressed file
        let compressed_data = fs::read(&full_path).await
            .map_err(|e| AppError::internal(format!("Failed to read file {}: {}", file_path, e)))?;
        
        // Decompress data
        let mut decoder = flate2::read::GzDecoder::new(&compressed_data[..]);
        let mut decompressed = Vec::new();
        decoder.read_to_end(&mut decompressed)
            .map_err(|e| AppError::internal(format!("Failed to decompress file {}: {}", file_path, e)))?;
        
        // Deserialize records
        let records: Vec<RawDataRecord> = serde_json::from_slice(&decompressed)
            .map_err(|e| AppError::internal(format!("Failed to deserialize records from {}: {}", file_path, e)))?;
        
        Ok(records)
    }
} 
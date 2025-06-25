use anyhow::Result;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use reqwest::Client;

use crate::config::Config;
use crate::error::AppError;
use super::{DataSource, RawDataRecord, DataCollector, DataSourceCategory, DataMetadata, Coordinates};
use super::sources::satellite::{SatelliteImagingCollector, SatelliteRadarCollector, SatelliteLidarCollector};

/// Weather station data collector
pub struct WeatherStationCollector {
    config: Arc<Config>,
    http_client: Client,
}

/// Agricultural sensor network collector
pub struct AgriculturalSensorCollector {
    config: Arc<Config>,
    http_client: Client,
}

/// Ground-based radar collector
pub struct GroundRadarCollector {
    config: Arc<Config>,
    http_client: Client,
}

/// Flux tower data collector
pub struct FluxTowerCollector {
    config: Arc<Config>,
    http_client: Client,
}

/// Soil monitoring network collector
pub struct SoilMonitoringCollector {
    config: Arc<Config>,
    http_client: Client,
}

/// Ocean observation collector
pub struct OceanObservationCollector {
    config: Arc<Config>,
    http_client: Client,
}

/// Atmospheric profiling collector
pub struct AtmosphericProfilingCollector {
    config: Arc<Config>,
    http_client: Client,
}

/// Global model data collector
pub struct GlobalModelCollector {
    config: Arc<Config>,
    http_client: Client,
}

/// Regional model data collector
pub struct RegionalModelCollector {
    config: Arc<Config>,
    http_client: Client,
}

/// Reanalysis data collector
pub struct ReanalysisDataCollector {
    config: Arc<Config>,
    http_client: Client,
}

/// Collector registry that manages all data collectors
pub struct CollectorRegistry {
    collectors: HashMap<DataSourceCategory, Box<dyn DataCollector + Send + Sync>>,
}

impl CollectorRegistry {
    pub async fn new(config: Arc<Config>) -> Result<Self, AppError> {
        let mut collectors: HashMap<DataSourceCategory, Box<dyn DataCollector + Send + Sync>> = HashMap::new();
        
        // Satellite collectors
        collectors.insert(
            DataSourceCategory::SatelliteImaging,
            Box::new(SatelliteImagingCollector::new(config.clone()).await?),
        );
        collectors.insert(
            DataSourceCategory::SatelliteRadar,
            Box::new(SatelliteRadarCollector::new(config.clone()).await?),
        );
        collectors.insert(
            DataSourceCategory::SatelliteLidar,
            Box::new(SatelliteLidarCollector::new(config.clone()).await?),
        );
        
        // Ground-based collectors
        collectors.insert(
            DataSourceCategory::WeatherStations,
            Box::new(WeatherStationCollector::new(config.clone()).await?),
        );
        collectors.insert(
            DataSourceCategory::AgriculturalSensors,
            Box::new(AgriculturalSensorCollector::new(config.clone()).await?),
        );
        collectors.insert(
            DataSourceCategory::GroundBasedRadar,
            Box::new(GroundRadarCollector::new(config.clone()).await?),
        );
        collectors.insert(
            DataSourceCategory::FluxTowers,
            Box::new(FluxTowerCollector::new(config.clone()).await?),
        );
        collectors.insert(
            DataSourceCategory::SoilMonitoring,
            Box::new(SoilMonitoringCollector::new(config.clone()).await?),
        );
        
        // Ocean and atmospheric collectors
        collectors.insert(
            DataSourceCategory::OceanObservations,
            Box::new(OceanObservationCollector::new(config.clone()).await?),
        );
        collectors.insert(
            DataSourceCategory::AtmosphericProfiling,
            Box::new(AtmosphericProfilingCollector::new(config.clone()).await?),
        );
        
        // Model data collectors
        collectors.insert(
            DataSourceCategory::GlobalModels,
            Box::new(GlobalModelCollector::new(config.clone()).await?),
        );
        collectors.insert(
            DataSourceCategory::RegionalModels,
            Box::new(RegionalModelCollector::new(config.clone()).await?),
        );
        collectors.insert(
            DataSourceCategory::ReanalysisData,
            Box::new(ReanalysisDataCollector::new(config.clone()).await?),
        );
        
        Ok(Self { collectors })
    }
    
    pub fn get_collector(&self, category: &DataSourceCategory) -> Option<&Box<dyn DataCollector + Send + Sync>> {
        self.collectors.get(category)
    }
    
    pub async fn collect_from_all_sources(&self, sources: &[DataSource]) -> Result<Vec<RawDataRecord>, AppError> {
        let mut all_records = Vec::new();
        
        for source in sources {
            if let Some(collector) = self.get_collector(&source.category) {
                match collector.collect_data(source).await {
                    Ok(records) => all_records.extend(records),
                    Err(e) => {
                        eprintln!("Failed to collect data from source {}: {}", source.name, e);
                        continue;
                    }
                }
            }
        }
        
        Ok(all_records)
    }
}

impl WeatherStationCollector {
    pub async fn new(config: Arc<Config>) -> Result<Self, AppError> {
        let http_client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .map_err(|e| AppError::internal(format!("Failed to create HTTP client: {}", e)))?;
        
        Ok(Self { config, http_client })
    }

    async fn collect_noaa_data(&self, source: &DataSource) -> Result<Vec<RawDataRecord>, AppError> {
        let mut records = Vec::new();
        
        if let Some(endpoint) = &source.api_endpoint {
            let url = format!("{}?startdate={}&enddate={}&datasetid=GHCND&limit=1000",
                endpoint,
                chrono::Utc::now().format("%Y-%m-%d"),
                chrono::Utc::now().format("%Y-%m-%d")
            );
            
            let response = self.http_client
                .get(&url)
                .header("token", self.config.noaa_api_key.as_ref().unwrap_or(&"".to_string()))
                .send()
                .await
                .map_err(|e| AppError::external_service("NOAA", &format!("Request failed: {}", e)))?;
            
            if response.status().is_success() {
                let data: serde_json::Value = response.json().await
                    .map_err(|e| AppError::external_service("NOAA", &format!("JSON parse failed: {}", e)))?;
                
                if let Some(results) = data.get("results").and_then(|r| r.as_array()) {
                    for result in results {
                        let record = RawDataRecord {
                            id: Uuid::new_v4(),
                            source_id: source.id,
                            timestamp: self.parse_timestamp(result.get("date"))?,
                            ingestion_time: Utc::now(),
                            data: result.clone(),
                            metadata: self.extract_metadata(result)?,
                            quality_flags: vec![],
                            file_path: None,
                        };
                        records.push(record);
                    }
                }
            }
        }
        Ok(records)
    }

    fn parse_timestamp(&self, date_value: Option<&serde_json::Value>) -> Result<DateTime<Utc>, AppError> {
        if let Some(date_str) = date_value.and_then(|v| v.as_str()) {
            chrono::DateTime::parse_from_rfc3339(date_str)
                .map(|dt| dt.with_timezone(&Utc))
                .map_err(|e| AppError::internal(format!("Failed to parse timestamp: {}", e)))
        } else {
            Ok(Utc::now())
        }
    }

    fn extract_metadata(&self, data: &serde_json::Value) -> Result<DataMetadata, AppError> {
        let mut parameters = HashMap::new();
        let mut units = HashMap::new();
        
        if let Some(datatype) = data.get("datatype").and_then(|v| v.as_str()) {
            parameters.insert("datatype".to_string(), datatype.to_string());
        }
        
        if let Some(value) = data.get("value").and_then(|v| v.as_f64()) {
            parameters.insert("value".to_string(), value.to_string());
        }
        
        Ok(DataMetadata {
            parameters,
            units,
            coordinates: None,
            elevation: None,
            instrument_info: Some("Weather Station".to_string()),
            processing_level: Some("Raw".to_string()),
            version: Some("1.0".to_string()),
        })
    }
}

#[async_trait]
impl DataCollector for WeatherStationCollector {
    async fn collect_data(&self, source: &DataSource) -> Result<Vec<RawDataRecord>, AppError> {
        match source.provider.as_str() {
            "NOAA" => self.collect_noaa_data(source).await,
            _ => Err(AppError::external_service(&source.provider, "Unsupported provider")),
        }
    }
    
    async fn validate_connection(&self, source: &DataSource) -> Result<bool, AppError> {
        if let Some(endpoint) = &source.api_endpoint {
            let response = self.http_client.get(endpoint).send().await;
            Ok(response.map(|r| r.status().is_success()).unwrap_or(false))
        } else {
            Ok(false)
        }
    }
    
    async fn get_available_parameters(&self, _source: &DataSource) -> Result<Vec<String>, AppError> {
        Ok(vec![
            "temperature".to_string(),
            "precipitation".to_string(),
            "wind_speed".to_string(),
            "humidity".to_string(),
        ])
    }
    
    async fn estimate_data_volume(&self, _source: &DataSource) -> Result<u64, AppError> {
        Ok(24 * 1024 * 2) // ~48KB per day
    }
}

// Implement similar patterns for other collectors
impl AgriculturalSensorCollector {
    pub async fn new(config: Arc<Config>) -> Result<Self, AppError> {
        let http_client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .map_err(|e| AppError::internal(format!("Failed to create HTTP client: {}", e)))?;
        
        Ok(Self { config, http_client })
    }
}

#[async_trait]
impl DataCollector for AgriculturalSensorCollector {
    async fn collect_data(&self, source: &DataSource) -> Result<Vec<RawDataRecord>, AppError> {
        let mut records = Vec::new();
        
        match source.provider.as_str() {
            "ARC" => {
                records.extend(self.collect_arc_data(source).await?);
            },
            _ => {
                return Err(AppError::external_service(
                    &source.provider,
                    "Unsupported agricultural sensor provider"
                ));
            }
        }
        
        Ok(records)
    }
    
    async fn validate_connection(&self, source: &DataSource) -> Result<bool, AppError> {
        if let Some(endpoint) = &source.api_endpoint {
            let response = self.http_client.get(endpoint).send().await;
            match response {
                Ok(resp) => Ok(resp.status().is_success()),
                Err(_) => Ok(false),
            }
        } else {
            Ok(false)
        }
    }
    
    async fn get_available_parameters(&self, _source: &DataSource) -> Result<Vec<String>, AppError> {
        Ok(vec![
            "soil_moisture".to_string(),
            "soil_temperature".to_string(),
            "leaf_wetness".to_string(),
            "canopy_temperature".to_string(),
            "ndvi".to_string(),
            "crop_height".to_string(),
        ])
    }
    
    async fn estimate_data_volume(&self, _source: &DataSource) -> Result<u64, AppError> {
        // Agricultural sensor data is moderate - typically 5-10KB per hour per sensor
        Ok(24 * 1024 * 10) // ~240KB per day per sensor
    }
}

impl AgriculturalSensorCollector {
    async fn collect_arc_data(&self, source: &DataSource) -> Result<Vec<RawDataRecord>, AppError> {
        let mut records = Vec::new();
        
        if let Some(endpoint) = &source.api_endpoint {
            let response = self.http_client
                .get(endpoint)
                .send()
                .await
                .map_err(|e| AppError::external_service("ARC", &format!("Request failed: {}", e)))?;
            
            if response.status().is_success() {
                let csv_data = response.text().await
                    .map_err(|e| AppError::external_service("ARC", &format!("Text parse failed: {}", e)))?;
                
                let mut reader = csv::Reader::from_reader(csv_data.as_bytes());
                for result in reader.deserialize() {
                    let record_data: serde_json::Value = result
                        .map_err(|e| AppError::external_service("ARC", &format!("CSV parse failed: {}", e)))?;
                    
                    let record = RawDataRecord {
                        id: Uuid::new_v4(),
                        source_id: source.id,
                        timestamp: self.parse_arc_timestamp(&record_data)?,
                        ingestion_time: Utc::now(),
                        data: record_data.clone(),
                        metadata: self.extract_arc_metadata(&record_data)?,
                        quality_flags: vec![],
                        file_path: None,
                    };
                    records.push(record);
                }
            }
        }
        
        Ok(records)
    }
    
    fn parse_arc_timestamp(&self, data: &serde_json::Value) -> Result<DateTime<Utc>, AppError> {
        if let Some(date_str) = data.get("date").and_then(|v| v.as_str()) {
            chrono::NaiveDateTime::parse_from_str(date_str, "%Y-%m-%d %H:%M:%S")
                .map(|dt| dt.and_utc())
                .or_else(|_| {
                    chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d")
                        .map(|d| d.and_hms_opt(0, 0, 0).unwrap().and_utc())
                })
                .map_err(|e| AppError::internal(format!("Failed to parse ARC timestamp: {}", e)))
        } else {
            Ok(Utc::now())
        }
    }
    
    fn extract_arc_metadata(&self, data: &serde_json::Value) -> Result<DataMetadata, AppError> {
        let mut parameters = HashMap::new();
        let mut units = HashMap::new();
        
        // Extract all available parameters
        for (key, value) in data.as_object().unwrap_or(&serde_json::Map::new()) {
            if let Some(v) = value.as_str() {
                parameters.insert(key.clone(), v.to_string());
            } else if let Some(v) = value.as_f64() {
                parameters.insert(key.clone(), v.to_string());
            }
        }
        
        // Set typical units for ARC data
        units.insert("soil_moisture".to_string(), "percent".to_string());
        units.insert("soil_temperature".to_string(), "celsius".to_string());
        units.insert("rainfall".to_string(), "mm".to_string());
        units.insert("solar_radiation".to_string(), "MJ/m2/day".to_string());
        
        Ok(DataMetadata {
            parameters,
            units,
            coordinates: None, // Would need to be enriched with station metadata
            elevation: None,
            instrument_info: Some("ARC Agricultural Sensor".to_string()),
            processing_level: Some("Raw".to_string()),
            version: Some("1.0".to_string()),
        })
    }
}

// Implement stub implementations for other collectors with similar patterns
macro_rules! impl_basic_collector {
    ($collector:ident, $provider:expr) => {
        impl $collector {
            pub async fn new(config: Arc<Config>) -> Result<Self, AppError> {
                let http_client = Client::builder()
                    .timeout(std::time::Duration::from_secs(30))
                    .build()
                    .map_err(|e| AppError::internal(format!("Failed to create HTTP client: {}", e)))?;
                
                Ok(Self { config, http_client })
            }
        }
        
        #[async_trait]
        impl DataCollector for $collector {
            async fn collect_data(&self, _source: &DataSource) -> Result<Vec<RawDataRecord>, AppError> {
                // Implementation would be similar to above patterns
                Ok(vec![])
            }
            
            async fn validate_connection(&self, source: &DataSource) -> Result<bool, AppError> {
                if let Some(endpoint) = &source.api_endpoint {
                    let response = self.http_client.get(endpoint).send().await;
                    match response {
                        Ok(resp) => Ok(resp.status().is_success()),
                        Err(_) => Ok(false),
                    }
                } else {
                    Ok(false)
                }
            }
            
            async fn get_available_parameters(&self, _source: &DataSource) -> Result<Vec<String>, AppError> {
                Ok(vec![])
            }
            
            async fn estimate_data_volume(&self, _source: &DataSource) -> Result<u64, AppError> {
                Ok(1024 * 1024) // 1MB default
            }
        }
    };
}

impl_basic_collector!(GroundRadarCollector, "Ground Radar");
impl_basic_collector!(FluxTowerCollector, "Flux Tower");
impl_basic_collector!(SoilMonitoringCollector, "Soil Monitoring");
impl_basic_collector!(OceanObservationCollector, "Ocean Observation");
impl_basic_collector!(AtmosphericProfilingCollector, "Atmospheric Profiling");
impl_basic_collector!(GlobalModelCollector, "Global Model");
impl_basic_collector!(RegionalModelCollector, "Regional Model");
impl_basic_collector!(ReanalysisDataCollector, "Reanalysis Data"); 
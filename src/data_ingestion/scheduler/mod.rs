use anyhow::Result;
use chrono::{DateTime, Utc, Duration as ChromoDuration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{RwLock, mpsc};
use tokio::time::{sleep, Duration, Instant};
use uuid::Uuid;
use sqlx::PgPool;

use crate::config::Config;
use crate::error::AppError;
use super::{DataSource, RawDataRecord, UpdateFrequency, IngestionStatus, DataCollector};
use super::collectors::CollectorRegistry;
use super::storage::DataStorage;

/// Ingestion scheduler that orchestrates data collection
pub struct IngestionScheduler {
    config: Arc<Config>,
    db_pool: PgPool,
    sources: Arc<RwLock<HashMap<Uuid, DataSource>>>,
    collectors: Arc<CollectorRegistry>,
    storage: Arc<DataStorage>,
    task_queue: Arc<RwLock<HashMap<Uuid, ScheduledTask>>>,
    control_channel: mpsc::Sender<SchedulerCommand>,
    stats: Arc<RwLock<SchedulerStats>>,
}

/// Scheduled ingestion task
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduledTask {
    pub id: Uuid,
    pub source_id: Uuid,
    pub next_execution: DateTime<Utc>,
    pub frequency: UpdateFrequency,
    pub priority: u8,
    pub retry_count: u32,
    pub max_retries: u32,
    pub last_success: Option<DateTime<Utc>>,
    pub last_error: Option<String>,
    pub status: TaskStatus,
    pub estimated_duration: Duration,
    pub consecutive_failures: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskStatus {
    Scheduled,
    Running,
    Completed,
    Failed,
    Retrying,
    Paused,
    Cancelled,
}

/// Scheduler command for controlling operations
#[derive(Debug)]
pub enum SchedulerCommand {
    Start,
    Stop,
    Pause,
    Resume,
    ForceCollection(Uuid), // source_id
    UpdateSource(DataSource),
    RemoveSource(Uuid),
    GetStats,
}

/// Scheduler performance statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerStats {
    pub total_tasks: u64,
    pub successful_tasks: u64,
    pub failed_tasks: u64,
    pub average_execution_time: Duration,
    pub data_volume_collected: u64,
    pub records_processed: u64,
    pub last_collection_time: Option<DateTime<Utc>>,
    pub active_sources: u32,
    pub error_sources: u32,
    pub uptime: Duration,
    pub memory_usage: u64,
}

/// Task execution result
#[derive(Debug)]
pub struct TaskResult {
    pub task_id: Uuid,
    pub source_id: Uuid,
    pub success: bool,
    pub records_collected: u32,
    pub data_volume: u64,
    pub execution_time: Duration,
    pub error: Option<String>,
}

impl IngestionScheduler {
    pub async fn new(
        config: Arc<Config>,
        db_pool: PgPool,
        sources: Arc<RwLock<HashMap<Uuid, DataSource>>>,
        collectors: Arc<CollectorRegistry>,
        storage: Arc<DataStorage>,
    ) -> Result<Self, AppError> {
        let (tx, _rx) = mpsc::channel(1000);
        
        Ok(Self {
            config,
            db_pool,
            sources,
            collectors,
            storage,
            task_queue: Arc::new(RwLock::new(HashMap::new())),
            control_channel: tx,
            stats: Arc::new(RwLock::new(SchedulerStats {
                total_tasks: 0,
                successful_tasks: 0,
                failed_tasks: 0,
                average_execution_time: Duration::from_secs(0),
                data_volume_collected: 0,
                records_processed: 0,
                last_collection_time: None,
                active_sources: 0,
                error_sources: 0,
                uptime: Duration::from_secs(0),
                memory_usage: 0,
            })),
        })
    }
    
    /// Start the scheduler
    pub async fn start(&self) -> Result<(), AppError> {
        // Initialize scheduled tasks for all sources
        self.initialize_tasks().await?;
        
        // Start the main scheduler loop
        self.run_scheduler_loop().await
    }
    
    /// Initialize scheduled tasks for all data sources
    async fn initialize_tasks(&self) -> Result<(), AppError> {
        let sources = self.sources.read().await;
        let mut task_queue = self.task_queue.write().await;
        
        for (source_id, source) in sources.iter() {
            if source.status == IngestionStatus::Active {
                let task = ScheduledTask {
                    id: Uuid::new_v4(),
                    source_id: *source_id,
                    next_execution: self.calculate_next_execution(&source.update_frequency)?,
                    frequency: source.update_frequency.clone(),
                    priority: source.priority,
                    retry_count: 0,
                    max_retries: self.get_max_retries_for_frequency(&source.update_frequency),
                    last_success: None,
                    last_error: None,
                    status: TaskStatus::Scheduled,
                    estimated_duration: self.estimate_task_duration(&source.update_frequency),
                    consecutive_failures: 0,
                };
                
                task_queue.insert(task.id, task);
            }
        }
        
        Ok(())
    }
    
    /// Main scheduler execution loop
    async fn run_scheduler_loop(&self) -> Result<(), AppError> {
        let start_time = Instant::now();
        let mut ticker = tokio::time::interval(Duration::from_secs(60)); // Check every minute
        
        loop {
            ticker.tick().await;
            
            // Update uptime
            {
                let mut stats = self.stats.write().await;
                stats.uptime = start_time.elapsed();
            }
            
            // Process due tasks
            if let Err(e) = self.process_due_tasks().await {
                eprintln!("Error processing scheduled tasks: {}", e);
            }
            
            // Update scheduler statistics
            if let Err(e) = self.update_stats().await {
                eprintln!("Error updating scheduler stats: {}", e);
            }
            
            // Clean up completed tasks
            self.cleanup_completed_tasks().await;
        }
    }
    
    /// Process tasks that are due for execution
    async fn process_due_tasks(&self) -> Result<(), AppError> {
        let now = Utc::now();
        let mut due_tasks = Vec::new();
        
        // Find due tasks
        {
            let task_queue = self.task_queue.read().await;
            for task in task_queue.values() {
                if task.next_execution <= now && 
                   matches!(task.status, TaskStatus::Scheduled | TaskStatus::Retrying) {
                    due_tasks.push(task.clone());
                }
            }
        }
        
        // Sort by priority (highest first)
        due_tasks.sort_by(|a, b| b.priority.cmp(&a.priority));
        
        // Execute tasks concurrently (with limit)
        let max_concurrent = self.config.max_concurrent_ingestions.unwrap_or(10);
        let semaphore = Arc::new(tokio::sync::Semaphore::new(max_concurrent));
        
        let mut handles = Vec::new();
        for task in due_tasks {
            let permit = semaphore.clone().acquire_owned().await;
            if permit.is_err() {
                continue;
            }
            
            let scheduler = self.clone();
            let handle = tokio::spawn(async move {
                let _permit = permit.unwrap();
                scheduler.execute_task(task).await
            });
            handles.push(handle);
        }
        
        // Wait for all tasks to complete
        for handle in handles {
            if let Ok(result) = handle.await {
                if let Ok(task_result) = result {
                    self.handle_task_result(task_result).await?;
                }
            }
        }
        
        Ok(())
    }
    
    /// Execute a single ingestion task
    async fn execute_task(&self, mut task: ScheduledTask) -> Result<TaskResult, AppError> {
        let start_time = Instant::now();
        
        // Update task status to running
        {
            let mut task_queue = self.task_queue.write().await;
            if let Some(t) = task_queue.get_mut(&task.id) {
                t.status = TaskStatus::Running;
            }
        }
        
        // Get the data source
        let source = {
            let sources = self.sources.read().await;
            sources.get(&task.source_id).cloned()
        };
        
        let source = match source {
            Some(s) => s,
            None => {
                return Ok(TaskResult {
                    task_id: task.id,
                    source_id: task.source_id,
                    success: false,
                    records_collected: 0,
                    data_volume: 0,
                    execution_time: start_time.elapsed(),
                    error: Some("Data source not found".to_string()),
                });
            }
        };
        
        // Get the appropriate collector
        let collector = self.collectors.get_collector(&source.category);
        let collector = match collector {
            Some(c) => c,
            None => {
                return Ok(TaskResult {
                    task_id: task.id,
                    source_id: task.source_id,
                    success: false,
                    records_collected: 0,
                    data_volume: 0,
                    execution_time: start_time.elapsed(),
                    error: Some("No collector available for source category".to_string()),
                });
            }
        };
        
        // Validate connection first
        match collector.validate_connection(&source).await {
            Ok(true) => {},
            Ok(false) => {
                return Ok(TaskResult {
                    task_id: task.id,
                    source_id: task.source_id,
                    success: false,
                    records_collected: 0,
                    data_volume: 0,
                    execution_time: start_time.elapsed(),
                    error: Some("Connection validation failed".to_string()),
                });
            },
            Err(e) => {
                return Ok(TaskResult {
                    task_id: task.id,
                    source_id: task.source_id,
                    success: false,
                    records_collected: 0,
                    data_volume: 0,
                    execution_time: start_time.elapsed(),
                    error: Some(format!("Connection validation error: {}", e)),
                });
            }
        }
        
        // Collect data
        let records = match collector.collect_data(&source).await {
            Ok(records) => records,
            Err(e) => {
                return Ok(TaskResult {
                    task_id: task.id,
                    source_id: task.source_id,
                    success: false,
                    records_collected: 0,
                    data_volume: 0,
                    execution_time: start_time.elapsed(),
                    error: Some(format!("Data collection failed: {}", e)),
                });
            }
        };
        
        // Store collected data
        let stored_files = match self.storage.store_raw_data_batch(&records).await {
            Ok(files) => files,
            Err(e) => {
                return Ok(TaskResult {
                    task_id: task.id,
                    source_id: task.source_id,
                    success: false,
                    records_collected: records.len() as u32,
                    data_volume: 0,
                    execution_time: start_time.elapsed(),
                    error: Some(format!("Data storage failed: {}", e)),
                });
            }
        };
        
        // Calculate data volume
        let data_volume = records.iter()
            .map(|r| serde_json::to_vec(r).unwrap_or_default().len() as u64)
            .sum();
        
        Ok(TaskResult {
            task_id: task.id,
            source_id: task.source_id,
            success: true,
            records_collected: records.len() as u32,
            data_volume,
            execution_time: start_time.elapsed(),
            error: None,
        })
    }
    
    /// Handle the result of a task execution
    async fn handle_task_result(&self, result: TaskResult) -> Result<(), AppError> {
        let mut task_queue = self.task_queue.write().await;
        
        if let Some(task) = task_queue.get_mut(&result.task_id) {
            if result.success {
                task.status = TaskStatus::Completed;
                task.last_success = Some(Utc::now());
                task.retry_count = 0;
                task.consecutive_failures = 0;
                task.last_error = None;
                
                // Schedule next execution
                task.next_execution = self.calculate_next_execution(&task.frequency)?;
                task.status = TaskStatus::Scheduled;
                
                // Update statistics
                let mut stats = self.stats.write().await;
                stats.successful_tasks += 1;
                stats.records_processed += result.records_collected as u64;
                stats.data_volume_collected += result.data_volume;
                stats.last_collection_time = Some(Utc::now());
                
                // Update average execution time
                let total_time = stats.average_execution_time.as_secs() * stats.successful_tasks;
                stats.average_execution_time = Duration::from_secs(
                    (total_time + result.execution_time.as_secs()) / (stats.successful_tasks + 1)
                );
                
            } else {
                task.status = TaskStatus::Failed;
                task.retry_count += 1;
                task.consecutive_failures += 1;
                task.last_error = result.error;
                
                if task.retry_count < task.max_retries {
                    // Schedule retry with exponential backoff
                    let backoff_minutes = 2_u64.pow(task.retry_count.min(6));
                    task.next_execution = Utc::now() + ChromoDuration::minutes(backoff_minutes as i64);
                    task.status = TaskStatus::Retrying;
                } else {
                    // Max retries reached - disable source temporarily
                    if let Some(source_id) = task_queue.get(&result.task_id).map(|t| t.source_id) {
                        if let Some(source) = self.sources.write().await.get_mut(&source_id) {
                            source.status = IngestionStatus::Error;
                        }
                    }
                }
                
                // Update statistics
                let mut stats = self.stats.write().await;
                stats.failed_tasks += 1;
            }
            
            stats.total_tasks += 1;
        }
        
        Ok(())
    }
    
    /// Calculate next execution time based on frequency
    fn calculate_next_execution(&self, frequency: &UpdateFrequency) -> Result<DateTime<Utc>, AppError> {
        let now = Utc::now();
        let next = match frequency {
            UpdateFrequency::RealTime => now + ChromoDuration::minutes(1),
            UpdateFrequency::HighFrequency => now + ChromoDuration::minutes(15),
            UpdateFrequency::Hourly => now + ChromoDuration::hours(1),
            UpdateFrequency::ThreeHourly => now + ChromoDuration::hours(3),
            UpdateFrequency::SixHourly => now + ChromoDuration::hours(6),
            UpdateFrequency::Daily => now + ChromoDuration::days(1),
            UpdateFrequency::Weekly => now + ChromoDuration::weeks(1),
            UpdateFrequency::Monthly => now + ChromoDuration::days(30),
            UpdateFrequency::Seasonal => now + ChromoDuration::days(90),
            UpdateFrequency::Annual => now + ChromoDuration::days(365),
            UpdateFrequency::Irregular => now + ChromoDuration::hours(24), // Default to daily
        };
        
        Ok(next)
    }
    
    /// Get maximum retries based on frequency
    fn get_max_retries_for_frequency(&self, frequency: &UpdateFrequency) -> u32 {
        match frequency {
            UpdateFrequency::RealTime => 5,
            UpdateFrequency::HighFrequency => 4,
            UpdateFrequency::Hourly => 3,
            UpdateFrequency::ThreeHourly => 3,
            UpdateFrequency::SixHourly => 2,
            UpdateFrequency::Daily => 2,
            UpdateFrequency::Weekly => 1,
            UpdateFrequency::Monthly => 1,
            UpdateFrequency::Seasonal => 1,
            UpdateFrequency::Annual => 1,
            UpdateFrequency::Irregular => 2,
        }
    }
    
    /// Estimate task duration based on frequency
    fn estimate_task_duration(&self, frequency: &UpdateFrequency) -> Duration {
        match frequency {
            UpdateFrequency::RealTime => Duration::from_secs(30),
            UpdateFrequency::HighFrequency => Duration::from_secs(60),
            UpdateFrequency::Hourly => Duration::from_secs(120),
            UpdateFrequency::ThreeHourly => Duration::from_secs(180),
            UpdateFrequency::SixHourly => Duration::from_secs(300),
            UpdateFrequency::Daily => Duration::from_secs(600),
            UpdateFrequency::Weekly => Duration::from_secs(1200),
            UpdateFrequency::Monthly => Duration::from_secs(1800),
            UpdateFrequency::Seasonal => Duration::from_secs(3600),
            UpdateFrequency::Annual => Duration::from_secs(3600),
            UpdateFrequency::Irregular => Duration::from_secs(300),
        }
    }
    
    /// Update scheduler statistics
    async fn update_stats(&self) -> Result<(), AppError> {
        let task_queue = self.task_queue.read().await;
        let sources = self.sources.read().await;
        
        let mut stats = self.stats.write().await;
        
        stats.active_sources = sources.values()
            .filter(|s| s.status == IngestionStatus::Active)
            .count() as u32;
        
        stats.error_sources = sources.values()
            .filter(|s| s.status == IngestionStatus::Error)
            .count() as u32;
        
        // Get memory usage (approximate)
        stats.memory_usage = (task_queue.len() * std::mem::size_of::<ScheduledTask>()) as u64;
        
        Ok(())
    }
    
    /// Clean up completed tasks older than 24 hours
    async fn cleanup_completed_tasks(&self) {
        let cutoff = Utc::now() - ChromoDuration::hours(24);
        let mut task_queue = self.task_queue.write().await;
        
        task_queue.retain(|_, task| {
            !matches!(task.status, TaskStatus::Completed | TaskStatus::Failed) ||
            task.next_execution > cutoff
        });
    }
    
    /// Force collection from a specific source
    pub async fn force_collection(&self, source_id: Uuid) -> Result<(), AppError> {
        let mut task_queue = self.task_queue.write().await;
        
        // Find the task for this source
        for task in task_queue.values_mut() {
            if task.source_id == source_id {
                task.next_execution = Utc::now();
                task.status = TaskStatus::Scheduled;
                break;
            }
        }
        
        Ok(())
    }
    
    /// Get scheduler statistics
    pub async fn get_stats(&self) -> SchedulerStats {
        self.stats.read().await.clone()
    }
    
    /// Add a new source to the scheduler
    pub async fn add_source(&self, source: DataSource) -> Result<(), AppError> {
        if source.status == IngestionStatus::Active {
            let task = ScheduledTask {
                id: Uuid::new_v4(),
                source_id: source.id,
                next_execution: self.calculate_next_execution(&source.update_frequency)?,
                frequency: source.update_frequency.clone(),
                priority: source.priority,
                retry_count: 0,
                max_retries: self.get_max_retries_for_frequency(&source.update_frequency),
                last_success: None,
                last_error: None,
                status: TaskStatus::Scheduled,
                estimated_duration: self.estimate_task_duration(&source.update_frequency),
                consecutive_failures: 0,
            };
            
            let mut task_queue = self.task_queue.write().await;
            task_queue.insert(task.id, task);
        }
        
        Ok(())
    }
    
    /// Remove a source from the scheduler
    pub async fn remove_source(&self, source_id: Uuid) -> Result<(), AppError> {
        let mut task_queue = self.task_queue.write().await;
        task_queue.retain(|_, task| task.source_id != source_id);
        Ok(())
    }
}

impl Clone for IngestionScheduler {
    fn clone(&self) -> Self {
        Self {
            config: self.config.clone(),
            db_pool: self.db_pool.clone(),
            sources: self.sources.clone(),
            collectors: self.collectors.clone(),
            storage: self.storage.clone(),
            task_queue: self.task_queue.clone(),
            control_channel: self.control_channel.clone(),
            stats: self.stats.clone(),
        }
    }
} 
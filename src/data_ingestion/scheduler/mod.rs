use anyhow::Result;
use chrono::{DateTime, Utc, Duration as ChronoDuration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{RwLock, mpsc};
use tokio::time::{sleep, Duration, Instant};
use uuid::Uuid;
use sqlx::PgPool;

use crate::config::Config;
use crate::error::AppError;
use super::{DataSource, RawDataRecord, UpdateFrequency, IngestionStatus};
use super::collectors::CollectorRegistry;
use super::storage::DataStorage;

/// Ingestion scheduler
pub struct IngestionScheduler {
    config: Arc<Config>,
    db_pool: PgPool,
    sources: Arc<RwLock<HashMap<Uuid, DataSource>>>,
    collectors: Arc<CollectorRegistry>,
    storage: Arc<DataStorage>,
    task_queue: Arc<RwLock<HashMap<Uuid, ScheduledTask>>>,
    stats: Arc<RwLock<SchedulerStats>>,
}

/// Scheduled task
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
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskStatus {
    Scheduled,
    Running,
    Completed,
    Failed,
    Retrying,
}

/// Scheduler statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerStats {
    pub total_tasks: u64,
    pub successful_tasks: u64,
    pub failed_tasks: u64,
    pub records_processed: u64,
    pub data_volume_collected: u64,
    pub last_collection_time: Option<DateTime<Utc>>,
}

impl IngestionScheduler {
    pub async fn new(
        config: Arc<Config>,
        db_pool: PgPool,
        sources: Arc<RwLock<HashMap<Uuid, DataSource>>>,
        collectors: Arc<CollectorRegistry>,
        storage: Arc<DataStorage>,
    ) -> Result<Self, AppError> {
        Ok(Self {
            config,
            db_pool,
            sources,
            collectors,
            storage,
            task_queue: Arc::new(RwLock::new(HashMap::new())),
            stats: Arc::new(RwLock::new(SchedulerStats {
                total_tasks: 0,
                successful_tasks: 0,
                failed_tasks: 0,
                records_processed: 0,
                data_volume_collected: 0,
                last_collection_time: None,
            })),
        })
    }
    
    /// Start the scheduler
    pub async fn start(&self) -> Result<(), AppError> {
        self.initialize_tasks().await?;
        self.run_scheduler_loop().await
    }
    
    /// Initialize tasks for all sources
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
                    max_retries: 3,
                    last_success: None,
                    last_error: None,
                    status: TaskStatus::Scheduled,
                };
                
                task_queue.insert(task.id, task);
            }
        }
        
        Ok(())
    }
    
    /// Main scheduler loop
    async fn run_scheduler_loop(&self) -> Result<(), AppError> {
        let mut ticker = tokio::time::interval(Duration::from_secs(60));
        
        loop {
            ticker.tick().await;
            
            if let Err(e) = self.process_due_tasks().await {
                eprintln!("Error processing tasks: {}", e);
            }
        }
    }
    
    /// Process due tasks
    async fn process_due_tasks(&self) -> Result<(), AppError> {
        let now = Utc::now();
        let mut due_tasks = Vec::new();
        
        {
            let task_queue = self.task_queue.read().await;
            for task in task_queue.values() {
                if task.next_execution <= now && matches!(task.status, TaskStatus::Scheduled) {
                    due_tasks.push(task.clone());
                }
            }
        }
        
        for task in due_tasks {
            self.execute_task(task).await?;
        }
        
        Ok(())
    }
    
    /// Execute a single task
    async fn execute_task(&self, mut task: ScheduledTask) -> Result<(), AppError> {
        // Update task status
        {
            let mut task_queue = self.task_queue.write().await;
            if let Some(t) = task_queue.get_mut(&task.id) {
                t.status = TaskStatus::Running;
            }
        }
        
        // Get source
        let source = {
            let sources = self.sources.read().await;
            sources.get(&task.source_id).cloned()
        };
        
        let source = match source {
            Some(s) => s,
            None => return Ok(()),
        };
        
        // Get collector
        let collector = self.collectors.get_collector(&source.category);
        let collector = match collector {
            Some(c) => c,
            None => return Ok(()),
        };
        
        // Collect data
        let result = collector.collect_data(&source).await;
        
        match result {
            Ok(records) => {
                // Store data
                if !records.is_empty() {
                    let _ = self.storage.store_raw_data_batch(&records).await;
                }
                
                // Update task as successful
                {
                    let mut task_queue = self.task_queue.write().await;
                    if let Some(t) = task_queue.get_mut(&task.id) {
                        t.status = TaskStatus::Completed;
                        t.last_success = Some(Utc::now());
                        t.retry_count = 0;
                        t.next_execution = self.calculate_next_execution(&t.frequency)?;
                        t.status = TaskStatus::Scheduled;
                    }
                }
                
                // Update stats
                {
                    let mut stats = self.stats.write().await;
                    stats.successful_tasks += 1;
                    stats.records_processed += records.len() as u64;
                    stats.last_collection_time = Some(Utc::now());
                }
            },
            Err(_) => {
                // Update task as failed
                {
                    let mut task_queue = self.task_queue.write().await;
                    if let Some(t) = task_queue.get_mut(&task.id) {
                        t.status = TaskStatus::Failed;
                        t.retry_count += 1;
                        
                        if t.retry_count < t.max_retries {
                            t.next_execution = Utc::now() + ChronoDuration::minutes(5);
                            t.status = TaskStatus::Retrying;
                        }
                    }
                }
                
                // Update stats
                {
                    let mut stats = self.stats.write().await;
                    stats.failed_tasks += 1;
                }
            }
        }
        
        Ok(())
    }
    
    /// Calculate next execution time
    fn calculate_next_execution(&self, frequency: &UpdateFrequency) -> Result<DateTime<Utc>, AppError> {
        let now = Utc::now();
        let next = match frequency {
            UpdateFrequency::RealTime => now + ChronoDuration::minutes(1),
            UpdateFrequency::HighFrequency => now + ChronoDuration::minutes(15),
            UpdateFrequency::Hourly => now + ChronoDuration::hours(1),
            UpdateFrequency::Daily => now + ChronoDuration::days(1),
            UpdateFrequency::Weekly => now + ChronoDuration::weeks(1),
            UpdateFrequency::Monthly => now + ChronoDuration::days(30),
            _ => now + ChronoDuration::hours(24),
        };
        
        Ok(next)
    }
    
    /// Get scheduler statistics
    pub async fn get_stats(&self) -> SchedulerStats {
        self.stats.read().await.clone()
    }
} 
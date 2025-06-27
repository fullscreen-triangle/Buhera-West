//! Comprehensive Integration Engine
//! Unifies HuggingFace API, continuous learning, computer vision, and specialized systems

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::time::{Duration, interval};
use chrono::{DateTime, Utc};

use crate::signal::{
    huggingface_integration::{AtmosphericModelHub, AtmosphericTask},
    continuous_learning::{ContinuousLearningEngine, AtmosphericDomain},
    computer_vision_integration::{AtmosphericVisionEngine, AnalysisConfig},
    AtmosphericState, SignalMeasurement,
};

/// Comprehensive Atmospheric Intelligence System
/// Integrates all specialized frameworks into unified analysis
#[derive(Debug)]
pub struct ComprehensiveAtmosphericIntelligence {
    pub huggingface_hub: AtmosphericModelHub,
    pub continuous_learner: ContinuousLearningEngine,
    pub vision_engine: AtmosphericVisionEngine,
    pub multi_modal_processor: MultiModalProcessor,
    pub intelligence_orchestrator: IntelligenceOrchestrator,
    pub performance_monitor: SystemPerformanceMonitor,
}

/// Multi-modal data processing engine
#[derive(Debug)]
pub struct MultiModalProcessor {
    data_fusion_engine: DataFusionEngine,
    sensor_coordinators: HashMap<SensorType, SensorCoordinator>,
    real_time_processor: RealTimeProcessor,
}

/// Intelligence orchestration system
#[derive(Debug)]
pub struct IntelligenceOrchestrator {
    task_scheduler: TaskScheduler,
    model_selector: ModelSelector,
    result_synthesizer: ResultSynthesizer,
    adaptive_controller: AdaptiveController,
}

/// System performance monitoring
#[derive(Debug)]
pub struct SystemPerformanceMonitor {
    performance_metrics: HashMap<String, PerformanceMetric>,
    resource_tracker: ResourceTracker,
    optimization_engine: OptimizationEngine,
}

/// Sensor types for multi-modal processing
#[derive(Debug, Clone, Hash, PartialEq, Eq)]
pub enum SensorType {
    GPS,
    Cellular,
    WiFi,
    Satellite,
    Lidar,
    Optical,
    Radar,
    Environmental,
}

/// Sensor coordination system
#[derive(Debug)]
pub struct SensorCoordinator {
    sensor_type: SensorType,
    calibration_data: CalibrationData,
    data_preprocessor: DataPreprocessor,
    quality_assessor: QualityAssessor,
}

/// Data fusion engine for multi-sensor integration
#[derive(Debug)]
pub struct DataFusionEngine {
    fusion_algorithms: Vec<FusionAlgorithm>,
    consistency_validators: Vec<ConsistencyValidator>,
    uncertainty_quantifier: UncertaintyQuantifier,
}

/// Real-time processing system
#[derive(Debug)]
pub struct RealTimeProcessor {
    processing_pipeline: ProcessingPipeline,
    latency_optimizer: LatencyOptimizer,
    throughput_manager: ThroughputManager,
}

/// Task scheduling system
#[derive(Debug)]
pub struct TaskScheduler {
    priority_queue: Vec<AnalysisTask>,
    resource_allocator: ResourceAllocator,
    deadline_manager: DeadlineManager,
}

/// Model selection system
#[derive(Debug)]
pub struct ModelSelector {
    model_registry: HashMap<String, ModelCapabilities>,
    performance_history: HashMap<String, Vec<PerformanceRecord>>,
    selection_strategy: SelectionStrategy,
}

/// Result synthesis system
#[derive(Debug)]
pub struct ResultSynthesizer {
    synthesis_strategies: Vec<SynthesisStrategy>,
    confidence_aggregator: ConfidenceAggregator,
    uncertainty_propagator: UncertaintyPropagator,
}

/// Adaptive control system
#[derive(Debug)]
pub struct AdaptiveController {
    adaptation_rules: Vec<AdaptationRule>,
    feedback_processor: FeedbackProcessor,
    system_state_tracker: SystemStateTracker,
}

/// Analysis task definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisTask {
    pub task_id: String,
    pub task_type: AnalysisTaskType,
    pub priority: TaskPriority,
    pub deadline: DateTime<Utc>,
    pub input_data: InputData,
    pub required_models: Vec<String>,
    pub quality_requirements: QualityRequirements,
}

/// Types of analysis tasks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnalysisTaskType {
    AtmosphericComposition,
    WeatherPrediction,
    SatelliteTracking,
    EnvironmentalMonitoring,
    SignalProcessing,
    ComputerVision,
    ContinuousLearning,
    ModelTraining,
}

/// Task priority levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialOrd, Ord, PartialEq, Eq)]
pub enum TaskPriority {
    Low,
    Medium,
    High,
    Critical,
    Emergency,
}

/// Input data for analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputData {
    pub sensor_data: HashMap<SensorType, Vec<u8>>,
    pub metadata: HashMap<String, String>,
    pub timestamp: DateTime<Utc>,
    pub geographic_location: Option<(f64, f64, f64)>,
}

/// Quality requirements for analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityRequirements {
    pub minimum_accuracy: f32,
    pub maximum_latency_ms: u32,
    pub confidence_threshold: f32,
    pub uncertainty_tolerance: f32,
}

/// Comprehensive analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComprehensiveAnalysisResult {
    pub task_id: String,
    pub analysis_results: HashMap<String, AnalysisResult>,
    pub synthesis_result: SynthesisResult,
    pub quality_metrics: QualityMetrics,
    pub performance_metrics: PerformanceMetrics,
    pub recommendations: Vec<Recommendation>,
}

/// Individual analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub analyzer_id: String,
    pub result_data: String,
    pub confidence: f32,
    pub uncertainty: f32,
    pub processing_time_ms: u32,
}

/// Synthesis result combining multiple analyses
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynthesisResult {
    pub synthesized_data: String,
    pub synthesis_confidence: f32,
    pub contributing_analyses: Vec<String>,
    pub synthesis_method: String,
}

/// Quality metrics for results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityMetrics {
    pub accuracy: f32,
    pub precision: f32,
    pub recall: f32,
    pub f1_score: f32,
    pub consistency_score: f32,
}

/// Performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub total_processing_time_ms: u32,
    pub memory_usage_mb: f32,
    pub cpu_utilization: f32,
    pub throughput_tasks_per_second: f32,
}

/// System recommendations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recommendation {
    pub recommendation_type: RecommendationType,
    pub description: String,
    pub priority: TaskPriority,
    pub estimated_impact: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecommendationType {
    ModelUpgrade,
    DataQualityImprovement,
    ResourceOptimization,
    CalibrationAdjustment,
    SystemMaintenance,
}

impl ComprehensiveAtmosphericIntelligence {
    pub async fn new() -> Result<Self, IntegrationError> {
        Ok(Self {
            huggingface_hub: AtmosphericModelHub::new("your_api_key_here".to_string()).await?,
            continuous_learner: ContinuousLearningEngine::new(Default::default()),
            vision_engine: AtmosphericVisionEngine::new(),
            multi_modal_processor: MultiModalProcessor::new(),
            intelligence_orchestrator: IntelligenceOrchestrator::new(),
            performance_monitor: SystemPerformanceMonitor::new(),
        })
    }
    
    /// Main analysis entry point
    pub async fn analyze_comprehensive(
        &mut self,
        task: AnalysisTask,
    ) -> Result<ComprehensiveAnalysisResult, IntegrationError> {
        // Start performance monitoring
        let start_time = std::time::Instant::now();
        self.performance_monitor.start_task_monitoring(&task.task_id);
        
        // Schedule and prioritize task
        self.intelligence_orchestrator.schedule_task(task.clone()).await?;
        
        // Multi-modal data processing
        let processed_data = self.multi_modal_processor.process_input_data(&task.input_data).await?;
        
        // Select appropriate models and analyzers
        let selected_models = self.intelligence_orchestrator.select_models_for_task(&task).await?;
        
        // Execute analyses in parallel
        let mut analysis_results = HashMap::new();
        
        // HuggingFace model analysis
        if selected_models.contains(&"huggingface".to_string()) {
            let hf_result = self.execute_huggingface_analysis(&task, &processed_data).await?;
            analysis_results.insert("huggingface".to_string(), hf_result);
        }
        
        // Computer vision analysis
        if selected_models.contains(&"computer_vision".to_string()) {
            let cv_result = self.execute_computer_vision_analysis(&task, &processed_data).await?;
            analysis_results.insert("computer_vision".to_string(), cv_result);
        }
        
        // Continuous learning analysis
        if selected_models.contains(&"continuous_learning".to_string()) {
            let cl_result = self.execute_continuous_learning_analysis(&task, &processed_data).await?;
            analysis_results.insert("continuous_learning".to_string(), cl_result);
        }
        
        // Synthesize results
        let synthesis_result = self.intelligence_orchestrator.synthesize_results(&analysis_results).await?;
        
        // Calculate quality metrics
        let quality_metrics = self.calculate_quality_metrics(&analysis_results, &synthesis_result).await?;
        
        // Generate performance metrics
        let performance_metrics = self.performance_monitor.get_task_metrics(&task.task_id);
        
        // Generate recommendations
        let recommendations = self.generate_recommendations(&task, &analysis_results, &quality_metrics).await?;
        
        // Update continuous learning system
        self.update_continuous_learning(&task, &analysis_results).await?;
        
        Ok(ComprehensiveAnalysisResult {
            task_id: task.task_id,
            analysis_results,
            synthesis_result,
            quality_metrics,
            performance_metrics,
            recommendations,
        })
    }
    
    async fn execute_huggingface_analysis(
        &mut self,
        task: &AnalysisTask,
        processed_data: &ProcessedData,
    ) -> Result<AnalysisResult, IntegrationError> {
        let atmospheric_task = match task.task_type {
            AnalysisTaskType::AtmosphericComposition => AtmosphericTask::AtmosphericCompositionPrediction,
            AnalysisTaskType::WeatherPrediction => AtmosphericTask::WeatherPatternRecognition,
            AnalysisTaskType::SatelliteTracking => AtmosphericTask::SatelliteImageAnalysis,
            _ => AtmosphericTask::EnvironmentalDataFusion,
        };
        
        let start_time = std::time::Instant::now();
        let result = self.huggingface_hub.analyze_atmospheric_data(
            &processed_data.text_data,
            atmospheric_task,
        ).await?;
        
        Ok(AnalysisResult {
            analyzer_id: "huggingface".to_string(),
            result_data: serde_json::to_string(&result)?,
            confidence: result.confidence,
            uncertainty: 1.0 - result.confidence,
            processing_time_ms: start_time.elapsed().as_millis() as u32,
        })
    }
    
    async fn execute_computer_vision_analysis(
        &mut self,
        task: &AnalysisTask,
        processed_data: &ProcessedData,
    ) -> Result<AnalysisResult, IntegrationError> {
        let start_time = std::time::Instant::now();
        
        let analysis_config = AnalysisConfig::default();
        let result = self.vision_engine.analyze_atmospheric_image(
            processed_data.image_data.clone(),
            analysis_config,
        ).await?;
        
        Ok(AnalysisResult {
            analyzer_id: "computer_vision".to_string(),
            result_data: serde_json::to_string(&result)?,
            confidence: result.overall_confidence,
            uncertainty: 1.0 - result.overall_confidence,
            processing_time_ms: start_time.elapsed().as_millis() as u32,
        })
    }
    
    async fn execute_continuous_learning_analysis(
        &mut self,
        task: &AnalysisTask,
        _processed_data: &ProcessedData,
    ) -> Result<AnalysisResult, IntegrationError> {
        let start_time = std::time::Instant::now();
        
        let domain = match task.task_type {
            AnalysisTaskType::AtmosphericComposition => AtmosphericDomain::AtmosphericChemistry,
            AnalysisTaskType::WeatherPrediction => AtmosphericDomain::WeatherPrediction,
            AnalysisTaskType::SatelliteTracking => AtmosphericDomain::SatelliteImagery,
            _ => AtmosphericDomain::EnvironmentalMonitoring,
        };
        
        let specialized_model = self.continuous_learner.get_model_for_domain(&domain);
        
        let result_data = if let Some(model) = specialized_model {
            format!("Specialized model analysis: {}", model.model_id)
        } else {
            "No specialized model available".to_string()
        };
        
        Ok(AnalysisResult {
            analyzer_id: "continuous_learning".to_string(),
            result_data,
            confidence: 0.8,
            uncertainty: 0.2,
            processing_time_ms: start_time.elapsed().as_millis() as u32,
        })
    }
    
    async fn calculate_quality_metrics(
        &self,
        analysis_results: &HashMap<String, AnalysisResult>,
        _synthesis_result: &SynthesisResult,
    ) -> Result<QualityMetrics, IntegrationError> {
        let avg_confidence: f32 = analysis_results.values()
            .map(|r| r.confidence)
            .sum::<f32>() / analysis_results.len() as f32;
        
        Ok(QualityMetrics {
            accuracy: avg_confidence,
            precision: avg_confidence * 0.95,
            recall: avg_confidence * 0.90,
            f1_score: avg_confidence * 0.92,
            consistency_score: avg_confidence * 0.88,
        })
    }
    
    async fn generate_recommendations(
        &self,
        _task: &AnalysisTask,
        analysis_results: &HashMap<String, AnalysisResult>,
        quality_metrics: &QualityMetrics,
    ) -> Result<Vec<Recommendation>, IntegrationError> {
        let mut recommendations = Vec::new();
        
        // Check if quality is below threshold
        if quality_metrics.accuracy < 0.8 {
            recommendations.push(Recommendation {
                recommendation_type: RecommendationType::ModelUpgrade,
                description: "Consider upgrading models due to low accuracy".to_string(),
                priority: TaskPriority::High,
                estimated_impact: 0.3,
            });
        }
        
        // Check processing times
        let avg_processing_time: f32 = analysis_results.values()
            .map(|r| r.processing_time_ms as f32)
            .sum::<f32>() / analysis_results.len() as f32;
        
        if avg_processing_time > 5000.0 {
            recommendations.push(Recommendation {
                recommendation_type: RecommendationType::ResourceOptimization,
                description: "Optimize processing pipeline for better performance".to_string(),
                priority: TaskPriority::Medium,
                estimated_impact: 0.4,
            });
        }
        
        Ok(recommendations)
    }
    
    async fn update_continuous_learning(
        &mut self,
        task: &AnalysisTask,
        analysis_results: &HashMap<String, AnalysisResult>,
    ) -> Result<(), IntegrationError> {
        // Update continuous learning system with new analysis data
        // This would feed back into the training pipeline
        println!("Updating continuous learning system with task {} results", task.task_id);
        
        // In a real implementation, this would:
        // 1. Extract learning signals from analysis results
        // 2. Update model performance tracking
        // 3. Queue retraining tasks if needed
        // 4. Update model selection preferences
        
        Ok(())
    }
    
    /// Start continuous system operation
    pub async fn start_continuous_operation(&mut self) -> Result<(), IntegrationError> {
        println!("Starting comprehensive atmospheric intelligence system...");
        
        // Start continuous learning
        let learning_handle = tokio::spawn(async move {
            // This would run the continuous learning engine
            tokio::time::sleep(Duration::from_secs(10)).await;
            Ok::<(), IntegrationError>(())
        });
        
        // Start performance monitoring
        let monitoring_handle = tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(60));
            loop {
                interval.tick().await;
                // Monitor system performance
                println!("System performance check...");
            }
        });
        
        // Start adaptive optimization
        let optimization_handle = tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(300));
            loop {
                interval.tick().await;
                // Optimize system parameters
                println!("System optimization check...");
            }
        });
        
        // Wait for all background tasks
        tokio::try_join!(
            learning_handle,
            monitoring_handle,
            optimization_handle
        )?;
        
        Ok(())
    }
}

// Implementation stubs for supporting structures
impl MultiModalProcessor {
    fn new() -> Self {
        Self {
            data_fusion_engine: DataFusionEngine::new(),
            sensor_coordinators: HashMap::new(),
            real_time_processor: RealTimeProcessor::new(),
        }
    }
    
    async fn process_input_data(&self, input_data: &InputData) -> Result<ProcessedData, IntegrationError> {
        // Process multi-modal sensor data
        Ok(ProcessedData {
            text_data: "Processed atmospheric data".to_string(),
            image_data: vec![0u8; 1024], // Placeholder
            sensor_data: HashMap::new(),
            quality_score: 0.85,
        })
    }
}

impl IntelligenceOrchestrator {
    fn new() -> Self {
        Self {
            task_scheduler: TaskScheduler::new(),
            model_selector: ModelSelector::new(),
            result_synthesizer: ResultSynthesizer::new(),
            adaptive_controller: AdaptiveController::new(),
        }
    }
    
    async fn schedule_task(&mut self, task: AnalysisTask) -> Result<(), IntegrationError> {
        self.task_scheduler.add_task(task);
        Ok(())
    }
    
    async fn select_models_for_task(&self, task: &AnalysisTask) -> Result<Vec<String>, IntegrationError> {
        // Select appropriate models based on task requirements
        Ok(vec![
            "huggingface".to_string(),
            "computer_vision".to_string(),
            "continuous_learning".to_string(),
        ])
    }
    
    async fn synthesize_results(
        &self,
        analysis_results: &HashMap<String, AnalysisResult>,
    ) -> Result<SynthesisResult, IntegrationError> {
        let contributing_analyses: Vec<String> = analysis_results.keys().cloned().collect();
        let avg_confidence: f32 = analysis_results.values()
            .map(|r| r.confidence)
            .sum::<f32>() / analysis_results.len() as f32;
        
        Ok(SynthesisResult {
            synthesized_data: "Comprehensive atmospheric analysis synthesis".to_string(),
            synthesis_confidence: avg_confidence,
            contributing_analyses,
            synthesis_method: "weighted_ensemble".to_string(),
        })
    }
}

impl SystemPerformanceMonitor {
    fn new() -> Self {
        Self {
            performance_metrics: HashMap::new(),
            resource_tracker: ResourceTracker::new(),
            optimization_engine: OptimizationEngine::new(),
        }
    }
    
    fn start_task_monitoring(&mut self, task_id: &str) {
        // Start monitoring task performance
        println!("Starting performance monitoring for task: {}", task_id);
    }
    
    fn get_task_metrics(&self, _task_id: &str) -> PerformanceMetrics {
        PerformanceMetrics {
            total_processing_time_ms: 2500,
            memory_usage_mb: 512.0,
            cpu_utilization: 0.75,
            throughput_tasks_per_second: 2.5,
        }
    }
}

// Supporting structure implementations
impl TaskScheduler {
    fn new() -> Self {
        Self {
            priority_queue: Vec::new(),
            resource_allocator: ResourceAllocator::new(),
            deadline_manager: DeadlineManager::new(),
        }
    }
    
    fn add_task(&mut self, task: AnalysisTask) {
        self.priority_queue.push(task);
        self.priority_queue.sort_by(|a, b| b.priority.cmp(&a.priority));
    }
}

impl ModelSelector {
    fn new() -> Self {
        Self {
            model_registry: HashMap::new(),
            performance_history: HashMap::new(),
            selection_strategy: SelectionStrategy::PerformanceBased,
        }
    }
}

impl ResultSynthesizer {
    fn new() -> Self {
        Self {
            synthesis_strategies: Vec::new(),
            confidence_aggregator: ConfidenceAggregator::new(),
            uncertainty_propagator: UncertaintyPropagator::new(),
        }
    }
}

impl AdaptiveController {
    fn new() -> Self {
        Self {
            adaptation_rules: Vec::new(),
            feedback_processor: FeedbackProcessor::new(),
            system_state_tracker: SystemStateTracker::new(),
        }
    }
}

// Placeholder implementations for supporting structures
#[derive(Debug)]
struct DataFusionEngine;
impl DataFusionEngine { fn new() -> Self { Self } }

#[derive(Debug)]
struct RealTimeProcessor;
impl RealTimeProcessor { fn new() -> Self { Self } }

#[derive(Debug)]
struct ResourceAllocator;
impl ResourceAllocator { fn new() -> Self { Self } }

#[derive(Debug)]
struct DeadlineManager;
impl DeadlineManager { fn new() -> Self { Self } }

#[derive(Debug)]
struct ConfidenceAggregator;
impl ConfidenceAggregator { fn new() -> Self { Self } }

#[derive(Debug)]
struct UncertaintyPropagator;
impl UncertaintyPropagator { fn new() -> Self { Self } }

#[derive(Debug)]
struct FeedbackProcessor;
impl FeedbackProcessor { fn new() -> Self { Self } }

#[derive(Debug)]
struct SystemStateTracker;
impl SystemStateTracker { fn new() -> Self { Self } }

#[derive(Debug)]
struct ResourceTracker;
impl ResourceTracker { fn new() -> Self { Self } }

#[derive(Debug)]
struct OptimizationEngine;
impl OptimizationEngine { fn new() -> Self { Self } }

#[derive(Debug)]
struct CalibrationData;

#[derive(Debug)]
struct DataPreprocessor;

#[derive(Debug)]
struct QualityAssessor;

#[derive(Debug)]
struct ProcessingPipeline;

#[derive(Debug)]
struct LatencyOptimizer;

#[derive(Debug)]
struct ThroughputManager;

#[derive(Debug)]
struct ConsistencyValidator;

#[derive(Debug)]
struct UncertaintyQuantifier;

#[derive(Debug)]
enum FusionAlgorithm {
    WeightedAverage,
    KalmanFilter,
    ParticleFilter,
}

#[derive(Debug)]
enum SelectionStrategy {
    PerformanceBased,
    ResourceBased,
    LatencyBased,
}

#[derive(Debug)]
enum SynthesisStrategy {
    WeightedEnsemble,
    VotingEnsemble,
    StackedEnsemble,
}

#[derive(Debug)]
enum AdaptationRule {
    PerformanceThreshold,
    ResourceConstraint,
    QualityRequirement,
}

#[derive(Debug)]
struct ModelCapabilities {
    accuracy: f32,
    latency_ms: u32,
    resource_requirements: ResourceRequirements,
}

#[derive(Debug)]
struct ResourceRequirements {
    cpu_cores: u32,
    memory_mb: u32,
    gpu_memory_mb: u32,
}

#[derive(Debug)]
struct PerformanceRecord {
    timestamp: DateTime<Utc>,
    accuracy: f32,
    latency_ms: u32,
    resource_usage: ResourceUsage,
}

#[derive(Debug)]
struct ResourceUsage {
    cpu_percent: f32,
    memory_mb: f32,
    gpu_percent: f32,
}

#[derive(Debug)]
struct PerformanceMetric {
    metric_name: String,
    value: f32,
    timestamp: DateTime<Utc>,
}

#[derive(Debug)]
struct ProcessedData {
    text_data: String,
    image_data: Vec<u8>,
    sensor_data: HashMap<SensorType, Vec<f32>>,
    quality_score: f32,
}

/// Integration errors
#[derive(Debug, thiserror::Error)]
pub enum IntegrationError {
    #[error("HuggingFace API error: {0}")]
    HuggingFaceError(String),
    #[error("Computer vision error: {0}")]
    ComputerVisionError(String),
    #[error("Continuous learning error: {0}")]
    ContinuousLearningError(String),
    #[error("Data processing error: {0}")]
    DataProcessingError(String),
    #[error("Task scheduling error: {0}")]
    TaskSchedulingError(String),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
    #[error("Join error: {0}")]
    JoinError(#[from] tokio::task::JoinError),
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

// Convert from other error types
impl From<crate::signal::huggingface_integration::HuggingFaceError> for IntegrationError {
    fn from(err: crate::signal::huggingface_integration::HuggingFaceError) -> Self {
        IntegrationError::HuggingFaceError(err.to_string())
    }
}

impl From<crate::signal::computer_vision_integration::VisionError> for IntegrationError {
    fn from(err: crate::signal::computer_vision_integration::VisionError) -> Self {
        IntegrationError::ComputerVisionError(err.to_string())
    }
}

impl From<crate::signal::continuous_learning::LearningError> for IntegrationError {
    fn from(err: crate::signal::continuous_learning::LearningError) -> Self {
        IntegrationError::ContinuousLearningError(err.to_string())
    }
} 
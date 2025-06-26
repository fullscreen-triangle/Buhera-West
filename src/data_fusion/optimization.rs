use std::collections::HashMap;
use std::sync::Arc;
use chrono::{DateTime, Utc};
use nalgebra::{DMatrix, DVector};
use tokio::sync::RwLock;
use rand::Rng;
use rand_distr::{Normal, Distribution};

use crate::error::AppError;
use super::{
    SensorType, FusionResult, FusedState, AgriculturalInsights,
    bayesian_network::NetworkState
};

/// Multi-objective Bayesian optimizer for agricultural weather prediction
#[derive(Debug)]
pub struct BayesianOptimizer {
    /// Gaussian Process models for each objective
    gaussian_processes: HashMap<ObjectiveType, GaussianProcess>,
    
    /// Acquisition function for multi-objective optimization
    acquisition_function: AcquisitionFunction,
    
    /// Agricultural-specific objective functions
    agricultural_objectives: AgriculturalObjectives,
    
    /// Optimization history for learning
    optimization_history: OptimizationHistory,
    
    /// Hyperparameter optimization
    hyperparameter_optimizer: HyperparameterOptimizer,
    
    /// Performance monitoring
    performance_monitor: PerformanceMonitor,
}

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
pub enum ObjectiveType {
    /// Minimize prediction error
    PredictionAccuracy,
    
    /// Maximize agricultural yield prediction
    YieldOptimization,
    
    /// Minimize irrigation water usage
    WaterEfficiency,
    
    /// Maximize crop health indicators
    CropHealthOptimization,
    
    /// Minimize environmental impact
    EnvironmentalSustainability,
    
    /// Maximize economic return
    EconomicOptimization,
    
    /// Minimize computational cost
    ComputationalEfficiency,
    
    /// Maximize sensor fusion quality
    FusionQuality,
}

#[derive(Debug)]
pub struct AgriculturalObjectives {
    /// Objective weights based on agricultural priorities
    objective_weights: HashMap<ObjectiveType, f64>,
    
    /// Crop-specific optimization parameters
    crop_specific_params: HashMap<String, CropOptimizationParams>,
    
    /// Seasonal optimization adjustments
    seasonal_adjustments: HashMap<String, f64>,
    
    /// Growth stage specific objectives
    growth_stage_objectives: HashMap<String, Vec<ObjectiveType>>,
    
    /// Multi-objective trade-off preferences
    pareto_preferences: ParetoPreferences,
}

#[derive(Debug, Clone)]
pub struct CropOptimizationParams {
    pub yield_weight: f64,
    pub water_efficiency_weight: f64,
    pub quality_weight: f64,
    pub sustainability_weight: f64,
    pub economic_weight: f64,
    pub risk_tolerance: f64,
}

#[derive(Debug)]
pub struct ParetoPreferences {
    /// Preferred trade-offs between objectives
    trade_off_matrix: DMatrix<f64>,
    
    /// Minimum acceptable performance for each objective
    minimum_thresholds: HashMap<ObjectiveType, f64>,
    
    /// Maximum acceptable trade-off ratios
    max_trade_off_ratios: HashMap<(ObjectiveType, ObjectiveType), f64>,
}

#[derive(Debug)]
pub struct GaussianProcess {
    /// Kernel function for the GP
    kernel: KernelFunction,
    
    /// Training data (input-output pairs)
    training_data: Vec<(DVector<f64>, f64)>,
    
    /// Hyperparameters
    hyperparameters: GPHyperparameters,
    
    /// Covariance matrix
    covariance_matrix: DMatrix<f64>,
    
    /// Agricultural domain knowledge integration
    domain_knowledge: AgriculturalDomainKnowledge,
}

#[derive(Debug, Clone)]
pub enum KernelFunction {
    /// Radial Basis Function kernel
    RBF { length_scale: f64, variance: f64 },
    
    /// Matern kernel for agricultural time series
    Matern { length_scale: f64, variance: f64, nu: f64 },
    
    /// Periodic kernel for seasonal patterns
    Periodic { length_scale: f64, variance: f64, period: f64 },
    
    /// Agricultural composite kernel
    AgriculturalComposite {
        seasonal_kernel: Box<KernelFunction>,
        trend_kernel: Box<KernelFunction>,
        noise_kernel: Box<KernelFunction>,
    },
}

#[derive(Debug, Clone)]
pub struct GPHyperparameters {
    pub noise_variance: f64,
    pub signal_variance: f64,
    pub length_scales: Vec<f64>,
    pub agricultural_specific_params: HashMap<String, f64>,
}

#[derive(Debug)]
pub struct AcquisitionFunction {
    /// Type of acquisition function
    function_type: AcquisitionFunctionType,
    
    /// Multi-objective scalarization method
    scalarization_method: ScalarizationMethod,
    
    /// Exploration-exploitation balance
    exploration_weight: f64,
    
    /// Agricultural risk preferences
    agricultural_risk_profile: AgriculturalRiskProfile,
}

#[derive(Debug, Clone)]
pub enum AcquisitionFunctionType {
    /// Expected Improvement
    ExpectedImprovement,
    
    /// Upper Confidence Bound
    UpperConfidenceBound { beta: f64 },
    
    /// Probability of Improvement
    ProbabilityOfImprovement,
    
    /// Agricultural Expected Utility
    AgriculturalExpectedUtility,
    
    /// Multi-objective Expected Hypervolume Improvement
    ExpectedHypervolumeImprovement,
}

#[derive(Debug, Clone)]
pub enum ScalarizationMethod {
    /// Weighted sum of objectives
    WeightedSum(HashMap<ObjectiveType, f64>),
    
    /// Chebyshev scalarization
    Chebyshev { weights: HashMap<ObjectiveType, f64>, reference_point: DVector<f64> },
    
    /// Achievement scalarization function
    Achievement { aspiration_levels: HashMap<ObjectiveType, f64> },
    
    /// Agricultural utility function
    AgriculturalUtility { utility_function: UtilityFunction },
}

#[derive(Debug, Clone)]
pub struct AgriculturalRiskProfile {
    /// Risk aversion level (0 = risk neutral, 1 = highly risk averse)
    pub risk_aversion: f64,
    
    /// Uncertainty tolerance for different agricultural decisions
    pub uncertainty_tolerance: HashMap<String, f64>,
    
    /// Acceptable loss thresholds
    pub loss_thresholds: HashMap<ObjectiveType, f64>,
    
    /// Time horizon for risk assessment
    pub risk_time_horizon: std::time::Duration,
}

#[derive(Debug)]
pub struct OptimizationHistory {
    /// Historical evaluations
    evaluations: Vec<OptimizationEvaluation>,
    
    /// Performance trends
    performance_trends: HashMap<ObjectiveType, Vec<f64>>,
    
    /// Convergence metrics
    convergence_metrics: ConvergenceMetrics,
    
    /// Agricultural season correlations
    seasonal_performance: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Clone)]
pub struct OptimizationEvaluation {
    pub parameters: DVector<f64>,
    pub objective_values: HashMap<ObjectiveType, f64>,
    pub agricultural_context: AgriculturalContext,
    pub timestamp: DateTime<Utc>,
    pub evaluation_cost: f64,
}

#[derive(Debug, Clone)]
pub struct AgriculturalContext {
    pub crop_type: String,
    pub growth_stage: String,
    pub season: String,
    pub weather_conditions: HashMap<String, f64>,
    pub soil_conditions: HashMap<String, f64>,
    pub irrigation_status: String,
}

#[derive(Debug, Clone)]
pub struct ConvergenceMetrics {
    pub hypervolume_progression: Vec<f64>,
    pub pareto_front_stability: f64,
    pub objective_improvement_rate: HashMap<ObjectiveType, f64>,
    pub agricultural_satisfaction_score: f64,
}

#[derive(Debug)]
pub struct HyperparameterOptimizer {
    /// Method for hyperparameter optimization
    optimization_method: HyperparameterOptimizationMethod,
    
    /// Cross-validation strategy
    cross_validation: CrossValidationStrategy,
    
    /// Agricultural domain constraints
    agricultural_constraints: AgriculturalHyperparameterConstraints,
}

#[derive(Debug, Clone)]
pub enum HyperparameterOptimizationMethod {
    /// Grid search
    GridSearch { grid_resolution: usize },
    
    /// Random search
    RandomSearch { num_samples: usize },
    
    /// Bayesian optimization for hyperparameters
    BayesianOptimization { iterations: usize },
    
    /// Agricultural domain-guided optimization
    AgriculturalGuided { domain_priors: HashMap<String, f64> },
}

#[derive(Debug, Clone)]
pub enum CrossValidationStrategy {
    /// K-fold cross-validation
    KFold { k: usize },
    
    /// Time series cross-validation for agricultural data
    TimeSeriesCV { window_size: usize, step_size: usize },
    
    /// Seasonal cross-validation
    SeasonalCV { seasons: Vec<String> },
    
    /// Leave-one-crop-out validation
    LeaveOneCropOut,
}

#[derive(Debug)]
pub struct AgriculturalHyperparameterConstraints {
    /// Minimum and maximum values for hyperparameters
    parameter_bounds: HashMap<String, (f64, f64)>,
    
    /// Agricultural domain knowledge constraints
    domain_constraints: Vec<DomainConstraint>,
    
    /// Crop-specific parameter preferences
    crop_specific_preferences: HashMap<String, HashMap<String, f64>>,
}

#[derive(Debug, Clone)]
pub struct DomainConstraint {
    pub name: String,
    pub constraint_type: ConstraintType,
    pub parameters: Vec<String>,
    pub constraint_function: String, // Mathematical expression
}

#[derive(Debug, Clone)]
pub enum ConstraintType {
    Equality,
    Inequality,
    Agricultural, // Custom agricultural constraints
}

#[derive(Debug)]
pub struct PerformanceMonitor {
    /// Real-time performance metrics
    current_metrics: HashMap<String, f64>,
    
    /// Historical performance data
    historical_metrics: Vec<PerformanceSnapshot>,
    
    /// Agricultural performance indicators
    agricultural_kpis: AgriculturalKPIs,
    
    /// Anomaly detection
    anomaly_detector: AnomalyDetector,
}

#[derive(Debug, Clone)]
pub struct PerformanceSnapshot {
    pub timestamp: DateTime<Utc>,
    pub metrics: HashMap<String, f64>,
    pub agricultural_context: AgriculturalContext,
    pub optimization_iteration: usize,
}

#[derive(Debug)]
pub struct AgriculturalKPIs {
    /// Yield prediction accuracy
    pub yield_prediction_accuracy: f64,
    
    /// Irrigation efficiency
    pub irrigation_efficiency: f64,
    
    /// Water usage optimization
    pub water_usage_reduction: f64,
    
    /// Crop health improvement
    pub crop_health_score: f64,
    
    /// Economic return on investment
    pub economic_roi: f64,
    
    /// Environmental sustainability score
    pub sustainability_score: f64,
}

#[derive(Debug)]
pub struct AnomalyDetector {
    /// Statistical anomaly detection
    statistical_detector: StatisticalAnomalyDetector,
    
    /// Machine learning based detection
    ml_detector: MLAnomalyDetector,
    
    /// Agricultural domain-specific anomaly patterns
    agricultural_anomaly_patterns: HashMap<String, AnomalyPattern>,
}

#[derive(Debug, Clone)]
pub struct AnomalyPattern {
    pub pattern_name: String,
    pub detection_threshold: f64,
    pub agricultural_significance: f64,
    pub recommended_action: String,
}

/// Optimization trace for recording the optimization process
#[derive(Debug, Clone, Default)]
pub struct OptimizationTrace {
    pub iterations: usize,
    pub final_cost: f64,
    pub convergence_achieved: bool,
    pub algorithm_specific_data: HashMap<String, f64>,
}

impl BayesianOptimizer {
    pub async fn new_agricultural_multi_objective() -> Result<Self, AppError> {
        let agricultural_objectives = AgriculturalObjectives::new_with_defaults().await?;
        let gaussian_processes = Self::initialize_gaussian_processes(&agricultural_objectives).await?;
        
        Ok(Self {
            gaussian_processes,
            acquisition_function: AcquisitionFunction::new_agricultural_default(),
            agricultural_objectives,
            optimization_history: OptimizationHistory::new(),
            hyperparameter_optimizer: HyperparameterOptimizer::new_agricultural(),
            performance_monitor: PerformanceMonitor::new_with_agricultural_metrics().await?,
        })
    }

    pub async fn optimize_agricultural_objectives(&self, network_state: &NetworkState) -> Result<FusedState, AppError> {
        // Extract current state parameters
        let current_parameters = self.extract_optimization_parameters(network_state)?;
        
        // Evaluate current objectives
        let current_objectives = self.evaluate_agricultural_objectives(&current_parameters, network_state).await?;
        
        // Update Gaussian Process models
        self.update_gaussian_processes(&current_parameters, &current_objectives).await?;
        
        // Optimize acquisition function to find next evaluation point
        let next_parameters = self.optimize_acquisition_function(&current_parameters).await?;
        
        // Apply optimized parameters to create improved fused state
        let optimized_state = self.apply_optimized_parameters(&next_parameters, network_state).await?;
        
        // Update optimization history
        self.update_optimization_history(&next_parameters, &current_objectives, network_state).await?;
        
        Ok(optimized_state)
    }

    async fn evaluate_agricultural_objectives(
        &self,
        parameters: &DVector<f64>,
        network_state: &NetworkState
    ) -> Result<HashMap<ObjectiveType, f64>, AppError> {
        let mut objectives = HashMap::new();
        
        // Evaluate each agricultural objective
        for (objective_type, weight) in &self.agricultural_objectives.objective_weights {
            let objective_value = match objective_type {
                ObjectiveType::PredictionAccuracy => {
                    self.evaluate_prediction_accuracy(parameters, network_state).await?
                },
                ObjectiveType::YieldOptimization => {
                    self.evaluate_yield_optimization(parameters, network_state).await?
                },
                ObjectiveType::WaterEfficiency => {
                    self.evaluate_water_efficiency(parameters, network_state).await?
                },
                ObjectiveType::CropHealthOptimization => {
                    self.evaluate_crop_health_optimization(parameters, network_state).await?
                },
                ObjectiveType::EnvironmentalSustainability => {
                    self.evaluate_environmental_sustainability(parameters, network_state).await?
                },
                ObjectiveType::EconomicOptimization => {
                    self.evaluate_economic_optimization(parameters, network_state).await?
                },
                ObjectiveType::ComputationalEfficiency => {
                    self.evaluate_computational_efficiency(parameters, network_state).await?
                },
                ObjectiveType::FusionQuality => {
                    self.evaluate_fusion_quality(parameters, network_state).await?
                },
            };
            
            objectives.insert(*objective_type, objective_value * weight);
        }
        
        Ok(objectives)
    }

    async fn optimize_acquisition_function(&self, current_parameters: &DVector<f64>) -> Result<DVector<f64>, AppError> {
        match &self.acquisition_function.function_type {
            AcquisitionFunctionType::ExpectedImprovement => {
                self.optimize_expected_improvement(current_parameters).await
            },
            AcquisitionFunctionType::UpperConfidenceBound { beta } => {
                self.optimize_upper_confidence_bound(current_parameters, *beta).await
            },
            AcquisitionFunctionType::AgriculturalExpectedUtility => {
                self.optimize_agricultural_expected_utility(current_parameters).await
            },
            AcquisitionFunctionType::ExpectedHypervolumeImprovement => {
                self.optimize_expected_hypervolume_improvement(current_parameters).await
            },
            _ => {
                // Default to expected improvement
                self.optimize_expected_improvement(current_parameters).await
            }
        }
    }

    async fn optimize_expected_improvement(&self, current_parameters: &DVector<f64>) -> Result<DVector<f64>, AppError> {
        // Implement Expected Improvement optimization
        // This is a simplified placeholder - full implementation would use gradient-based optimization
        
        let mut best_parameters = current_parameters.clone();
        let mut best_ei = 0.0;
        
        // Simple grid search for demonstration (in practice, use more sophisticated optimization)
        for _ in 0..100 {
            let candidate = self.generate_candidate_parameters(current_parameters)?;
            let ei = self.compute_expected_improvement(&candidate).await?;
            
            if ei > best_ei {
                best_ei = ei;
                best_parameters = candidate;
            }
        }
        
        Ok(best_parameters)
    }

    async fn compute_expected_improvement(&self, parameters: &DVector<f64>) -> Result<f64, AppError> {
        // Compute Expected Improvement using Gaussian Process predictions
        let mut total_ei = 0.0;
        
        for (objective_type, gp) in &self.gaussian_processes {
            let (mean, variance) = gp.predict(parameters)?;
            let best_observed = self.get_best_observed_value(objective_type);
            
            let improvement = (mean - best_observed).max(0.0);
            let std_dev = variance.sqrt();
            
            if std_dev > 1e-10 {
                let z = improvement / std_dev;
                let ei = improvement * self.standard_normal_cdf(z) + std_dev * self.standard_normal_pdf(z);
                total_ei += ei * self.agricultural_objectives.objective_weights[objective_type];
            }
        }
        
        Ok(total_ei)
    }

    fn generate_candidate_parameters(&self, current: &DVector<f64>) -> Result<DVector<f64>, AppError> {
        // Generate candidate parameters with agricultural constraints
        let mut candidate = current.clone();
        
        // Add Gaussian noise with agricultural domain constraints
        for i in 0..candidate.len() {
            let noise = self.sample_gaussian_noise() * 0.1; // 10% perturbation
            candidate[i] += noise;
            
            // Apply agricultural domain constraints
            candidate[i] = self.apply_agricultural_constraints(candidate[i], i);
        }
        
        Ok(candidate)
    }

    fn apply_agricultural_constraints(&self, value: f64, parameter_index: usize) -> f64 {
        // Apply agricultural domain-specific constraints
        match parameter_index {
            0 => value.max(0.0).min(1.0), // Irrigation efficiency [0, 1]
            1 => value.max(0.0).min(100.0), // Fertilizer amount [0, 100]
            2 => value.max(-1.0).min(1.0), // Soil pH adjustment [-1, 1]
            _ => value.max(0.0).min(10.0), // General positive constraint
        }
    }
}

impl AgriculturalObjectives {
    async fn new_with_defaults() -> Result<Self, AppError> {
        let mut objective_weights = HashMap::new();
        objective_weights.insert(ObjectiveType::YieldOptimization, 0.3);
        objective_weights.insert(ObjectiveType::WaterEfficiency, 0.2);
        objective_weights.insert(ObjectiveType::CropHealthOptimization, 0.2);
        objective_weights.insert(ObjectiveType::EnvironmentalSustainability, 0.15);
        objective_weights.insert(ObjectiveType::EconomicOptimization, 0.1);
        objective_weights.insert(ObjectiveType::PredictionAccuracy, 0.05);
        
        Ok(Self {
            objective_weights,
            crop_specific_params: HashMap::new(),
            seasonal_adjustments: HashMap::new(),
            growth_stage_objectives: HashMap::new(),
            pareto_preferences: ParetoPreferences::default(),
        })
    }
}

impl GaussianProcess {
    fn predict(&self, input: &DVector<f64>) -> Result<(f64, f64), AppError> {
        // Simplified GP prediction - in practice, this would be much more sophisticated
        let mean = self.predict_mean(input)?;
        let variance = self.predict_variance(input)?;
        Ok((mean, variance))
    }

    fn predict_mean(&self, _input: &DVector<f64>) -> Result<f64, AppError> {
        // Placeholder implementation
        Ok(0.5)
    }

    fn predict_variance(&self, _input: &DVector<f64>) -> Result<f64, AppError> {
        // Placeholder implementation
        Ok(0.1)
    }
}

impl AcquisitionFunction {
    fn new_agricultural_default() -> Self {
        Self {
            function_type: AcquisitionFunctionType::AgriculturalExpectedUtility,
            scalarization_method: ScalarizationMethod::AgriculturalUtility {
                utility_function: UtilityFunction::default(),
            },
            exploration_weight: 0.1,
            agricultural_risk_profile: AgriculturalRiskProfile::default(),
        }
    }
}

impl OptimizationHistory {
    fn new() -> Self {
        Self {
            evaluations: Vec::new(),
            performance_trends: HashMap::new(),
            convergence_metrics: ConvergenceMetrics::default(),
            seasonal_performance: HashMap::new(),
        }
    }
}

impl HyperparameterOptimizer {
    fn new_agricultural() -> Self {
        Self {
            optimization_method: HyperparameterOptimizationMethod::AgriculturalGuided {
                domain_priors: HashMap::new(),
            },
            cross_validation: CrossValidationStrategy::SeasonalCV {
                seasons: vec!["spring".to_string(), "summer".to_string(), "fall".to_string(), "winter".to_string()],
            },
            agricultural_constraints: AgriculturalHyperparameterConstraints {
                parameter_bounds: HashMap::new(),
                domain_constraints: Vec::new(),
                crop_specific_preferences: HashMap::new(),
            },
        }
    }
}

impl PerformanceMonitor {
    async fn new_with_agricultural_metrics() -> Result<Self, AppError> {
        Ok(Self {
            current_metrics: HashMap::new(),
            historical_metrics: Vec::new(),
            agricultural_kpis: AgriculturalKPIs::default(),
            anomaly_detector: AnomalyDetector::new(),
        })
    }
}

impl AnomalyDetector {
    fn new() -> Self {
        Self {
            statistical_detector: StatisticalAnomalyDetector::default(),
            ml_detector: MLAnomalyDetector::default(),
            agricultural_anomaly_patterns: HashMap::new(),
        }
    }
}

// Default implementations for supporting types
impl Default for ParetoPreferences {
    fn default() -> Self {
        Self {
            trade_off_matrix: DMatrix::identity(8, 8), // 8 objectives
            minimum_thresholds: HashMap::new(),
            max_trade_off_ratios: HashMap::new(),
        }
    }
}

impl Default for AgriculturalRiskProfile {
    fn default() -> Self {
        Self {
            risk_aversion: 0.5,
            uncertainty_tolerance: HashMap::new(),
            loss_thresholds: HashMap::new(),
            risk_time_horizon: std::time::Duration::from_days(30),
        }
    }
}

impl Default for ConvergenceMetrics {
    fn default() -> Self {
        Self {
            hypervolume_progression: Vec::new(),
            pareto_front_stability: 0.0,
            objective_improvement_rate: HashMap::new(),
            agricultural_satisfaction_score: 0.0,
        }
    }
}

impl Default for AgriculturalKPIs {
    fn default() -> Self {
        Self {
            yield_prediction_accuracy: 0.0,
            irrigation_efficiency: 0.0,
            water_usage_reduction: 0.0,
            crop_health_score: 0.0,
            economic_roi: 0.0,
            sustainability_score: 0.0,
        }
    }
}

// Placeholder implementations for supporting types
#[derive(Debug, Clone, Default)]
pub struct AgriculturalDomainKnowledge;

#[derive(Debug, Clone, Default)]
pub struct UtilityFunction;

#[derive(Debug, Default)]
pub struct StatisticalAnomalyDetector;

#[derive(Debug, Default)]
pub struct MLAnomalyDetector;

// Placeholder method implementations
impl BayesianOptimizer {
    async fn initialize_gaussian_processes(_objectives: &AgriculturalObjectives) -> Result<HashMap<ObjectiveType, GaussianProcess>, AppError> {
        Ok(HashMap::new()) // Placeholder
    }

    fn extract_optimization_parameters(&self, _network_state: &NetworkState) -> Result<DVector<f64>, AppError> {
        Ok(DVector::zeros(4)) // Placeholder
    }

    async fn update_gaussian_processes(&self, _parameters: &DVector<f64>, _objectives: &HashMap<ObjectiveType, f64>) -> Result<(), AppError> {
        Ok(()) // Placeholder
    }

    async fn apply_optimized_parameters(&self, _parameters: &DVector<f64>, network_state: &NetworkState) -> Result<FusedState, AppError> {
        Ok(FusedState::default()) // Placeholder - would apply optimized parameters to create improved state
    }

    async fn update_optimization_history(&self, _parameters: &DVector<f64>, _objectives: &HashMap<ObjectiveType, f64>, _network_state: &NetworkState) -> Result<(), AppError> {
        Ok(()) // Placeholder
    }

    // Objective evaluation methods (placeholders)
    async fn evaluate_prediction_accuracy(&self, _parameters: &DVector<f64>, _network_state: &NetworkState) -> Result<f64, AppError> {
        Ok(0.8) // Placeholder
    }

    async fn evaluate_yield_optimization(&self, _parameters: &DVector<f64>, _network_state: &NetworkState) -> Result<f64, AppError> {
        Ok(0.7) // Placeholder
    }

    async fn evaluate_water_efficiency(&self, _parameters: &DVector<f64>, _network_state: &NetworkState) -> Result<f64, AppError> {
        Ok(0.6) // Placeholder
    }

    async fn evaluate_crop_health_optimization(&self, _parameters: &DVector<f64>, _network_state: &NetworkState) -> Result<f64, AppError> {
        Ok(0.75) // Placeholder
    }

    async fn evaluate_environmental_sustainability(&self, _parameters: &DVector<f64>, _network_state: &NetworkState) -> Result<f64, AppError> {
        Ok(0.65) // Placeholder
    }

    async fn evaluate_economic_optimization(&self, _parameters: &DVector<f64>, _network_state: &NetworkState) -> Result<f64, AppError> {
        Ok(0.7) // Placeholder
    }

    async fn evaluate_computational_efficiency(&self, _parameters: &DVector<f64>, _network_state: &NetworkState) -> Result<f64, AppError> {
        Ok(0.8) // Placeholder
    }

    async fn evaluate_fusion_quality(&self, _parameters: &DVector<f64>, _network_state: &NetworkState) -> Result<f64, AppError> {
        Ok(0.85) // Placeholder
    }

    // Acquisition function optimization methods (placeholders)
    async fn optimize_upper_confidence_bound(&self, current_parameters: &DVector<f64>, _beta: f64) -> Result<DVector<f64>, AppError> {
        Ok(current_parameters.clone()) // Placeholder
    }

    async fn optimize_agricultural_expected_utility(&self, current_parameters: &DVector<f64>) -> Result<DVector<f64>, AppError> {
        Ok(current_parameters.clone()) // Placeholder
    }

    async fn optimize_expected_hypervolume_improvement(&self, current_parameters: &DVector<f64>) -> Result<DVector<f64>, AppError> {
        Ok(current_parameters.clone()) // Placeholder
    }

    fn get_best_observed_value(&self, _objective_type: &ObjectiveType) -> f64 {
        0.5 // Placeholder
    }

    fn standard_normal_cdf(&self, z: f64) -> f64 {
        0.5 * (1.0 + (z / 2.0_f64.sqrt()).erf())
    }

    fn standard_normal_pdf(&self, z: f64) -> f64 {
        (-0.5 * z * z).exp() / (2.0 * std::f64::consts::PI).sqrt()
    }

    fn sample_gaussian_noise(&self) -> f64 {
        // Simplified Box-Muller transform
        use std::f64::consts::PI;
        let u1: f64 = rand::random();
        let u2: f64 = rand::random();
        (-2.0 * u1.ln()).sqrt() * (2.0 * PI * u2).cos()
    }
}

// Add the erf function for the normal CDF calculation
trait Erf {
    fn erf(self) -> Self;
}

impl Erf for f64 {
    fn erf(self) -> f64 {
        // Abramowitz and Stegun approximation
        let a1 = 0.254829592;
        let a2 = -0.284496736;
        let a3 = 1.421413741;
        let a4 = -1.453152027;
        let a5 = 1.061405429;
        let p = 0.3275911;

        let sign = if self < 0.0 { -1.0 } else { 1.0 };
        let x = self.abs();

        let t = 1.0 / (1.0 + p * x);
        let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * (-x * x).exp();

        sign * y
    }
}

/// EM-Based Multi-Sensor Calibration Algorithm
/// Learns sensor biases, noise parameters, and correlations simultaneously
pub struct EMCalibration {
    /// Current parameter estimates: biases, noise, correlations
    pub parameters: CalibrationParameters,
    /// Convergence threshold for EM algorithm
    pub convergence_threshold: f64,
    /// Maximum number of EM iterations
    pub max_iterations: usize,
    /// Learning rate for parameter updates
    pub learning_rate: f64,
}

#[derive(Debug, Clone)]
pub struct CalibrationParameters {
    /// Sensor-specific bias estimates
    pub sensor_biases: HashMap<SensorType, f64>,
    /// Sensor-specific noise parameters (variance)
    pub noise_parameters: HashMap<SensorType, f64>,
    /// Cross-sensor correlation matrix
    pub correlation_matrix: DMatrix<f64>,
    /// Sensor reliability weights
    pub reliability_weights: HashMap<SensorType, f64>,
}

impl EMCalibration {
    pub fn new(sensors: &[SensorType]) -> Self {
        let mut sensor_biases = HashMap::new();
        let mut noise_parameters = HashMap::new();
        let mut reliability_weights = HashMap::new();
        
        // Initialize parameters
        for sensor in sensors {
            sensor_biases.insert(*sensor, 0.0);
            noise_parameters.insert(*sensor, 1.0);
            reliability_weights.insert(*sensor, 1.0);
        }
        
        let n_sensors = sensors.len();
        let correlation_matrix = DMatrix::identity(n_sensors, n_sensors);
        
        Self {
            parameters: CalibrationParameters {
                sensor_biases,
                noise_parameters,
                correlation_matrix,
                reliability_weights,
            },
            convergence_threshold: 1e-6,
            max_iterations: 100,
            learning_rate: 0.1,
        }
    }
    
    /// Execute EM algorithm for sensor calibration
    pub fn calibrate(&mut self, measurement_sets: &[HashMap<SensorType, Vec<TimestampedMeasurement>>]) -> Result<CalibrationResult, OptimizationError> {
        let mut log_likelihood = f64::NEG_INFINITY;
        let mut prev_log_likelihood = f64::NEG_INFINITY;
        
        for iteration in 0..self.max_iterations {
            // E-Step: Compute posterior over latent states
            let posterior_states = self.expectation_step(measurement_sets)?;
            
            // M-Step: Update parameters
            self.maximization_step(measurement_sets, &posterior_states)?;
            
            // Compute log-likelihood for convergence check
            log_likelihood = self.compute_log_likelihood(measurement_sets, &posterior_states)?;
            
            // Check convergence
            if iteration > 0 && (log_likelihood - prev_log_likelihood).abs() < self.convergence_threshold {
                return Ok(CalibrationResult {
                    converged: true,
                    iterations: iteration + 1,
                    final_log_likelihood: log_likelihood,
                    calibrated_parameters: self.parameters.clone(),
                });
            }
            
            prev_log_likelihood = log_likelihood;
        }
        
        Ok(CalibrationResult {
            converged: false,
            iterations: self.max_iterations,
            final_log_likelihood: log_likelihood,
            calibrated_parameters: self.parameters.clone(),
        })
    }
    
    /// E-Step: Compute posterior distributions over latent true states
    fn expectation_step(&self, measurement_sets: &[HashMap<SensorType, Vec<TimestampedMeasurement>>]) -> Result<Vec<StatePosteriori>, OptimizationError> {
        let mut posterior_states = Vec::new();
        
        for measurement_set in measurement_sets {
            // For each time step, compute posterior over true state given measurements and current parameters
            let posterior = self.gaussian_belief_propagation(measurement_set)?;
            posterior_states.push(posterior);
        }
        
        Ok(posterior_states)
    }
    
    /// M-Step: Update parameter estimates
    fn maximization_step(&mut self, measurement_sets: &[HashMap<SensorType, Vec<TimestampedMeasurement>>], posterior_states: &[StatePosteriori]) -> Result<(), OptimizationError> {
        // Update sensor biases
        self.update_sensor_biases(measurement_sets, posterior_states)?;
        
        // Update noise parameters
        self.update_noise_parameters(measurement_sets, posterior_states)?;
        
        // Update cross-correlation matrix
        self.update_correlation_matrix(measurement_sets, posterior_states)?;
        
        Ok(())
    }
    
    fn gaussian_belief_propagation(&self, measurements: &HashMap<SensorType, Vec<TimestampedMeasurement>>) -> Result<StatePosteriori, OptimizationError> {
        // Simplified Gaussian belief propagation
        let mut mean_estimate = 0.0;
        let mut precision_sum = 0.0;
        let mut measurement_count = 0;
        
        for (sensor_type, sensor_measurements) in measurements {
            let bias = self.parameters.sensor_biases.get(sensor_type).unwrap_or(&0.0);
            let noise_var = self.parameters.noise_parameters.get(sensor_type).unwrap_or(&1.0);
            let reliability = self.parameters.reliability_weights.get(sensor_type).unwrap_or(&1.0);
            
            for measurement in sensor_measurements {
                if let MeasurementValue::Scalar(value) = measurement.value {
                    let corrected_value = value - bias;
                    let precision = reliability / noise_var;
                    
                    mean_estimate += precision * corrected_value;
                    precision_sum += precision;
                    measurement_count += 1;
                }
            }
        }
        
        if precision_sum > 0.0 {
            mean_estimate /= precision_sum;
        }
        
        let variance = if precision_sum > 0.0 { 1.0 / precision_sum } else { 1.0 };
        
        Ok(StatePosteriori {
            mean: mean_estimate,
            variance,
            measurement_count,
        })
    }
    
    fn update_sensor_biases(&mut self, measurement_sets: &[HashMap<SensorType, Vec<TimestampedMeasurement>>], posterior_states: &[StatePosteriori]) -> Result<(), OptimizationError> {
        let mut bias_updates = HashMap::new();
        let mut bias_counts = HashMap::new();
        
        for (measurement_set, posterior) in measurement_sets.iter().zip(posterior_states.iter()) {
            for (sensor_type, measurements) in measurement_set {
                let mut residual_sum = 0.0;
                let mut count = 0;
                
                for measurement in measurements {
                    if let MeasurementValue::Scalar(value) = measurement.value {
                        let residual = value - posterior.mean;
                        residual_sum += residual;
                        count += 1;
                    }
                }
                
                if count > 0 {
                    let avg_residual = residual_sum / count as f64;
                    *bias_updates.entry(*sensor_type).or_insert(0.0) += avg_residual;
                    *bias_counts.entry(*sensor_type).or_insert(0) += 1;
                }
            }
        }
        
        // Apply bias updates
        for (sensor_type, total_bias) in bias_updates {
            let count = bias_counts.get(&sensor_type).unwrap_or(&1);
            let new_bias = total_bias / (*count as f64);
            let current_bias = self.parameters.sensor_biases.get(&sensor_type).unwrap_or(&0.0);
            
            // Exponential moving average update
            let updated_bias = (1.0 - self.learning_rate) * current_bias + self.learning_rate * new_bias;
            self.parameters.sensor_biases.insert(sensor_type, updated_bias);
        }
        
        Ok(())
    }
    
    fn update_noise_parameters(&mut self, measurement_sets: &[HashMap<SensorType, Vec<TimestampedMeasurement>>], posterior_states: &[StatePosteriori]) -> Result<(), OptimizationError> {
        let mut variance_updates = HashMap::new();
        let mut variance_counts = HashMap::new();
        
        for (measurement_set, posterior) in measurement_sets.iter().zip(posterior_states.iter()) {
            for (sensor_type, measurements) in measurement_set {
                let bias = self.parameters.sensor_biases.get(sensor_type).unwrap_or(&0.0);
                let mut squared_residuals = 0.0;
                let mut count = 0;
                
                for measurement in measurements {
                    if let MeasurementValue::Scalar(value) = measurement.value {
                        let corrected_value = value - bias;
                        let residual = corrected_value - posterior.mean;
                        squared_residuals += residual.powi(2);
                        count += 1;
                    }
                }
                
                if count > 0 {
                    let empirical_variance = squared_residuals / count as f64;
                    *variance_updates.entry(*sensor_type).or_insert(0.0) += empirical_variance;
                    *variance_counts.entry(*sensor_type).or_insert(0) += 1;
                }
            }
        }
        
        // Apply variance updates
        for (sensor_type, total_variance) in variance_updates {
            let count = variance_counts.get(&sensor_type).unwrap_or(&1);
            let new_variance = total_variance / (*count as f64);
            let current_variance = self.parameters.noise_parameters.get(&sensor_type).unwrap_or(&1.0);
            
            // Exponential moving average update
            let updated_variance = (1.0 - self.learning_rate) * current_variance + self.learning_rate * new_variance;
            self.parameters.noise_parameters.insert(sensor_type, updated_variance.max(1e-6)); // Avoid zero variance
        }
        
        Ok(())
    }
    
    fn update_correlation_matrix(&mut self, measurement_sets: &[HashMap<SensorType, Vec<TimestampedMeasurement>>], posterior_states: &[StatePosteriori]) -> Result<(), OptimizationError> {
        // Compute empirical correlations between sensor residuals
        let sensors: Vec<SensorType> = self.parameters.sensor_biases.keys().copied().collect();
        let n_sensors = sensors.len();
        
        if n_sensors < 2 {
            return Ok(());
        }
        
        let mut residual_matrix = DMatrix::zeros(measurement_sets.len(), n_sensors);
        
        // Collect residuals for each sensor at each time step
        for (time_idx, (measurement_set, posterior)) in measurement_sets.iter().zip(posterior_states.iter()).enumerate() {
            for (sensor_idx, sensor_type) in sensors.iter().enumerate() {
                if let Some(measurements) = measurement_set.get(sensor_type) {
                    let bias = self.parameters.sensor_biases.get(sensor_type).unwrap_or(&0.0);
                    let mut residual_sum = 0.0;
                    let mut count = 0;
                    
                    for measurement in measurements {
                        if let MeasurementValue::Scalar(value) = measurement.value {
                            let corrected_value = value - bias;
                            residual_sum += corrected_value - posterior.mean;
                            count += 1;
                        }
                    }
                    
                    if count > 0 {
                        residual_matrix[(time_idx, sensor_idx)] = residual_sum / count as f64;
                    }
                }
            }
        }
        
        // Compute correlation matrix
        let new_correlation = self.compute_correlation_matrix(&residual_matrix)?;
        
        // Update with exponential moving average
        self.parameters.correlation_matrix = (1.0 - self.learning_rate) * &self.parameters.correlation_matrix + 
                                            self.learning_rate * &new_correlation;
        
        Ok(())
    }
    
    fn compute_correlation_matrix(&self, residual_matrix: &DMatrix<f64>) -> Result<DMatrix<f64>, OptimizationError> {
        let n_sensors = residual_matrix.ncols();
        let mut correlation = DMatrix::identity(n_sensors, n_sensors);
        
        for i in 0..n_sensors {
            for j in i+1..n_sensors {
                let col_i = residual_matrix.column(i);
                let col_j = residual_matrix.column(j);
                
                let mean_i = col_i.mean();
                let mean_j = col_j.mean();
                
                let mut covariance = 0.0;
                let mut var_i = 0.0;
                let mut var_j = 0.0;
                
                for k in 0..residual_matrix.nrows() {
                    let diff_i = col_i[k] - mean_i;
                    let diff_j = col_j[k] - mean_j;
                    
                    covariance += diff_i * diff_j;
                    var_i += diff_i.powi(2);
                    var_j += diff_j.powi(2);
                }
                
                let std_i = (var_i / residual_matrix.nrows() as f64).sqrt();
                let std_j = (var_j / residual_matrix.nrows() as f64).sqrt();
                
                if std_i > 1e-10 && std_j > 1e-10 {
                    let corr = covariance / (residual_matrix.nrows() as f64 * std_i * std_j);
                    correlation[(i, j)] = corr;
                    correlation[(j, i)] = corr;
                }
            }
        }
        
        Ok(correlation)
    }
    
    fn compute_log_likelihood(&self, measurement_sets: &[HashMap<SensorType, Vec<TimestampedMeasurement>>], posterior_states: &[StatePosteriori]) -> Result<f64, OptimizationError> {
        let mut log_likelihood = 0.0;
        
        for (measurement_set, posterior) in measurement_sets.iter().zip(posterior_states.iter()) {
            for (sensor_type, measurements) in measurement_set {
                let bias = self.parameters.sensor_biases.get(sensor_type).unwrap_or(&0.0);
                let noise_var = self.parameters.noise_parameters.get(sensor_type).unwrap_or(&1.0);
                
                for measurement in measurements {
                    if let MeasurementValue::Scalar(value) = measurement.value {
                        let corrected_value = value - bias;
                        let residual = corrected_value - posterior.mean;
                        
                        // Gaussian log-likelihood
                        log_likelihood -= 0.5 * (residual.powi(2) / noise_var + noise_var.ln() + (2.0 * std::f64::consts::PI).ln());
                    }
                }
            }
        }
        
        Ok(log_likelihood)
    }
}

/// Levenberg-Marquardt Optimizer for nonlinear least squares
pub struct LevenbergMarquardtOptimizer {
    pub damping_parameter: f64,
    pub max_iterations: usize,
    pub convergence_threshold: f64,
    pub damping_update_factor: f64,
}

impl LevenbergMarquardtOptimizer {
    pub fn new() -> Self {
        Self {
            damping_parameter: 1e-3,
            max_iterations: 100,
            convergence_threshold: 1e-6,
            damping_update_factor: 10.0,
        }
    }
    
    /// Optimize nonlinear least squares problem
    pub fn optimize<F, J>(&mut self, 
                         initial_params: &DVector<f64>,
                         residual_func: F,
                         jacobian_func: J) -> Result<OptimizationResult, OptimizationError>
    where
        F: Fn(&DVector<f64>) -> Result<DVector<f64>, OptimizationError>,
        J: Fn(&DVector<f64>) -> Result<DMatrix<f64>, OptimizationError>,
    {
        let mut current_params = initial_params.clone();
        let mut current_cost = f64::INFINITY;
        let mut lambda = self.damping_parameter;
        
        for iteration in 0..self.max_iterations {
            // Compute residuals and Jacobian
            let residuals = residual_func(&current_params)?;
            let jacobian = jacobian_func(&current_params)?;
            
            // Compute cost
            let cost = 0.5 * residuals.dot(&residuals);
            
            // Check convergence
            if iteration > 0 && (current_cost - cost).abs() < self.convergence_threshold {
                return Ok(OptimizationResult {
                    final_parameters: current_params,
                    final_cost: cost,
                    iterations: iteration,
                    converged: true,
                });
            }
            
            // Compute Hessian approximation: H = J^T * J
            let hessian = jacobian.transpose() * &jacobian;
            let gradient = jacobian.transpose() * &residuals;
            
            // Add Levenberg-Marquardt damping
            let damped_hessian = &hessian + lambda * DMatrix::identity(hessian.nrows(), hessian.ncols());
            
            // Solve for parameter update
            match damped_hessian.lu().solve(&(-gradient)) {
                Some(delta) => {
                    let test_params = &current_params + &delta;
                    let test_residuals = residual_func(&test_params)?;
                    let test_cost = 0.5 * test_residuals.dot(&test_residuals);
                    
                    if test_cost < cost {
                        // Accept update
                        current_params = test_params;
                        current_cost = cost;
                        lambda /= self.damping_update_factor;
                    } else {
                        // Reject update, increase damping
                        lambda *= self.damping_update_factor;
                    }
                },
                None => {
                    lambda *= self.damping_update_factor;
                    if lambda > 1e6 {
                        return Err(OptimizationError::SingularMatrix);
                    }
                }
            }
        }
        
        Ok(OptimizationResult {
            final_parameters: current_params,
            final_cost: current_cost,
            iterations: self.max_iterations,
            converged: false,
        })
    }
}

/// Agricultural-specific objectives for multi-objective optimization
pub struct AgriculturalObjectives {
    pub crop_model: CropModel,
    pub weather_impact_model: WeatherImpactModel,
    pub resource_efficiency_model: ResourceEfficiencyModel,
}

impl AgriculturalObjectives {
    pub fn new() -> Self {
        Self {
            crop_model: CropModel::new(),
            weather_impact_model: WeatherImpactModel::new(),
            resource_efficiency_model: ResourceEfficiencyModel::new(),
        }
    }
    
    /// Evaluate agricultural objectives for given parameters
    pub fn evaluate(&self, parameters: &DVector<f64>) -> Result<DVector<f64>, OptimizationError> {
        let mut objectives = DVector::zeros(3);
        
        // Objective 1: Maximize yield
        objectives[0] = self.crop_model.predict_yield(parameters)?;
        
        // Objective 2: Minimize water usage
        objectives[1] = -self.resource_efficiency_model.water_efficiency(parameters)?; // Negative for minimization
        
        // Objective 3: Minimize cost
        objectives[2] = -self.resource_efficiency_model.cost_efficiency(parameters)?; // Negative for minimization
        
        Ok(objectives)
    }
}

/// Crop yield prediction model
pub struct CropModel {
    /// Growth parameters
    pub growth_parameters: HashMap<String, f64>,
    /// Environmental stress thresholds
    pub stress_thresholds: HashMap<String, (f64, f64)>,
}

impl CropModel {
    pub fn new() -> Self {
        let mut growth_parameters = HashMap::new();
        growth_parameters.insert("temperature_optimum".to_string(), 25.0);
        growth_parameters.insert("moisture_optimum".to_string(), 0.6);
        growth_parameters.insert("light_requirement".to_string(), 300.0);
        
        let mut stress_thresholds = HashMap::new();
        stress_thresholds.insert("temperature".to_string(), (10.0, 35.0));
        stress_thresholds.insert("moisture".to_string(), (0.2, 0.9));
        
        Self {
            growth_parameters,
            stress_thresholds,
        }
    }
    
    pub fn predict_yield(&self, parameters: &DVector<f64>) -> Result<f64, OptimizationError> {
        if parameters.len() < 3 {
            return Err(OptimizationError::InvalidParameters("Insufficient parameters for yield prediction".to_string()));
        }
        
        let temperature = parameters[0];
        let moisture = parameters[1];
        let light = parameters[2];
        
        // Simplified yield model based on environmental factors
        let temp_opt = self.growth_parameters.get("temperature_optimum").unwrap_or(&25.0);
        let moisture_opt = self.growth_parameters.get("moisture_optimum").unwrap_or(&0.6);
        let light_req = self.growth_parameters.get("light_requirement").unwrap_or(&300.0);
        
        let temp_factor = 1.0 - ((temperature - temp_opt) / 10.0).powi(2);
        let moisture_factor = 1.0 - ((moisture - moisture_opt) / 0.5).powi(2);
        let light_factor = (light / light_req).min(1.0);
        
        let yield_potential = temp_factor.max(0.0) * moisture_factor.max(0.0) * light_factor.max(0.0);
        
        Ok(yield_potential * 100.0) // Scale to realistic yield values
    }
}

pub struct WeatherImpactModel;

impl WeatherImpactModel {
    pub fn new() -> Self {
        Self
    }
}

pub struct ResourceEfficiencyModel;

impl ResourceEfficiencyModel {
    pub fn new() -> Self {
        Self
    }
    
    pub fn water_efficiency(&self, parameters: &DVector<f64>) -> Result<f64, OptimizationError> {
        // Simplified water efficiency calculation
        if parameters.len() < 2 {
            return Ok(0.5);
        }
        
        let irrigation_intensity = parameters[1];
        Ok(1.0 / (1.0 + irrigation_intensity))
    }
    
    pub fn cost_efficiency(&self, parameters: &DVector<f64>) -> Result<f64, OptimizationError> {
        // Simplified cost efficiency calculation
        let total_cost = parameters.iter().sum::<f64>();
        Ok(1.0 / (1.0 + total_cost * 0.1))
    }
}

// Supporting structures

#[derive(Debug, Clone)]
pub struct StatePosteriori {
    pub mean: f64,
    pub variance: f64,
    pub measurement_count: usize,
}

#[derive(Debug, Clone)]
pub struct CalibrationResult {
    pub converged: bool,
    pub iterations: usize,
    pub final_log_likelihood: f64,
    pub calibrated_parameters: CalibrationParameters,
}

#[derive(Debug, Clone)]
pub struct OptimizationResult {
    pub final_parameters: DVector<f64>,
    pub final_cost: f64,
    pub iterations: usize,
    pub converged: bool,
}

pub struct GaussianProcess {
    dimension: usize,
    kernel: RBFKernel,
    noise_variance: f64,
}

impl GaussianProcess {
    pub fn new(dimension: usize) -> Self {
        Self {
            dimension,
            kernel: RBFKernel::new(1.0, 1.0),
            noise_variance: 1e-6,
        }
    }
    
    pub fn update(&mut self, _observations: &[(DVector<f64>, f64)]) -> Result<(), OptimizationError> {
        // Update GP hyperparameters (simplified)
        Ok(())
    }
    
    pub fn predict(&self, _point: &DVector<f64>) -> Result<(f64, f64), OptimizationError> {
        // Simplified GP prediction - returns (mean, variance)
        Ok((0.0, 1.0))
    }
}

pub struct RBFKernel {
    length_scale: f64,
    signal_variance: f64,
}

impl RBFKernel {
    pub fn new(length_scale: f64, signal_variance: f64) -> Self {
        Self { length_scale, signal_variance }
    }
}

#[derive(Debug, Clone)]
pub enum AcquisitionFunction {
    ExpectedImprovement,
    UpperConfidenceBound,
}

#[derive(Debug, Clone)]
pub struct Solution {
    pub parameters: DVector<f64>,
    pub objectives: DVector<f64>,
    pub rank: usize,
    pub crowding_distance: f64,
}

#[derive(Debug, thiserror::Error)]
pub enum OptimizationError {
    #[error("Singular matrix encountered")]
    SingularMatrix,
    #[error("Invalid parameters: {0}")]
    InvalidParameters(String),
    #[error("Convergence failed")]
    ConvergenceFailed,
    #[error("Optimization error: {0}")]
    OptimizationFailed(String),
} 
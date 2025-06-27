use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use num_complex::Complex64;

// =============================================================================
// CORE ENUMERATION TYPES FOR SIGNAL PROCESSING
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BackscatterModel {
    RayleighScattering,
    MieScattering,
    ResonantScattering,
    AerosolScattering,
    MolecularScattering,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NoiseFilter {
    AdaptiveKalman,
    WaveletDenoising,
    SpectralFiltering,
    CoherentAveraging,
    IncoherentIntegration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AtmosphericCorrectionAlgorithm {
    KlettInversion,
    FernaldMethod,
    RamanCorrection,
    DopplerCorrection,
    AtmosphericTransmissionCorrection,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrackingLoop {
    PhaseLockedLoop { bandwidth_hz: f64, order: u32 },
    FrequencyLockedLoop { bandwidth_hz: f64, discriminator: String },
    DelayLockedLoop { bandwidth_hz: f64, correlator_spacing: f64 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CodeCorrelator {
    EarlyMinusLate { spacing_chips: f64 },
    DoubleDoubleCorrelator { spacing_chips: f64 },
    StroverCorrelator { taps: u32 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CarrierPhaseProcessor {
    PrecisePhaseTracking { resolution_cycles: f64 },
    CycleSlipDetection { threshold: f64 },
    PhaseAmbiguityResolution { method: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AtmosphericDelayEstimator {
    KlobucharModel,
    SaastamoinenModel,
    RayTracingModel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FusionAlgorithm {
    WeightedAveraging,
    KalmanFusion,
    BayesianFusion,
    DempsterShaferFusion,
    NeuralNetworkFusion,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OrbitalDynamicsModel {
    TwoBodyProblem,
    RestrictedThreeBody,
    GeneralRelativisticCorrections,
    TidalEffects,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PerturbationModel {
    GravitationalPerturbations,
    SolarRadiationPressure,
    AtmosphericDrag,
    EarthAlbedo,
    ThermalReradiation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OrbitEstimationAlgorithm {
    ExtendedKalmanFilter,
    UnscentedKalmanFilter,
    ParticleFilter,
    SequentialLeastSquares,
    BatchLeastSquares,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RealTimeProcessor {
    ParallelProcessor { cores: u32 },
    GPUAccelerator { memory_gb: u32 },
    FPGAProcessor { gates: u32 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MeasurablePredictor {
    AtmosphericScattering,
    ElectromagneticPropagation,
    GeometricEffects,
    InstrumentalEffects,
    KnownAtmosphericPhenomena,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SignalComparator {
    SpectralComparator,
    TemporalComparator,
    SpatialComparator,
    PolarizationComparator,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DifferenceAnalyzer {
    QuantumEffectAnalyzer,
    DarkMatterAnalyzer,
    NonLinearAnalyzer,
    ExoticParticleAnalyzer,
    UnknownPhenomenaAnalyzer,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UnmeasurableExtractor {
    DarkMatterExtractor,
    QuantumEffectExtractor,
    NonLinearExtractor,
    ExoticParticleExtractor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValidationSystem {
    ConsistencyValidator,
    PhysicsConstraintValidator,
    StatisticalValidator,
    CrossCorrelationValidator,
}

// =============================================================================
// SOPHISTICATED MEASUREMENT STRUCTURES
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LaserParameters {
    pub wavelength_nm: f64,
    pub pulse_energy_mj: f64,
    pub pulse_duration_ns: f64,
    pub repetition_rate_hz: f64,
    pub beam_quality_m2: f64,
    pub polarization_state: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MeasurementGeometry {
    pub azimuth_angle_deg: f64,
    pub elevation_angle_deg: f64,
    pub range_resolution_m: f64,
    pub angular_resolution_mrad: f64,
    pub scan_pattern: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct QualityIndicators {
    pub signal_to_noise_ratio: f64,
    pub measurement_uncertainty: f64,
    pub atmospheric_transmission: f64,
    pub system_stability: f64,
    pub calibration_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TrackingState {
    pub lock_status: String,
    pub tracking_duration_s: f64,
    pub phase_lock_indicator: bool,
    pub frequency_lock_indicator: bool,
    pub bit_sync_status: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CorrelatorOutputs {
    pub early_correlator: Complex64,
    pub prompt_correlator: Complex64,
    pub late_correlator: Complex64,
    pub correlation_peak_sharpness: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RadarTarget {
    pub range_m: f64,
    pub velocity_ms: f64,
    pub radar_cross_section_dbm2: f64,
    pub target_type_probability: HashMap<String, f64>,
    pub detection_confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ClutterMap {
    pub range_bins: Vec<f64>,
    pub clutter_power_dbm: Vec<f64>,
    pub clutter_velocity_ms: Vec<f64>,
    pub clutter_classification: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AtmosphericConditions {
    pub temperature_k: f64,
    pub pressure_pa: f64,
    pub humidity_percent: f64,
    pub visibility_km: f64,
    pub precipitation_type: String,
    pub wind_speed_ms: f64,
    pub wind_direction_deg: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ImageData {
    pub pixel_data: Vec<Vec<Vec<u16>>>, // [row][col][band]
    pub image_width: u32,
    pub image_height: u32,
    pub bit_depth: u32,
    pub compression_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpectralChannel {
    pub center_wavelength_nm: f64,
    pub bandwidth_nm: f64,
    pub radiometric_resolution: f64,
    pub calibration_coefficients: Vec<f64>,
    pub quantum_efficiency: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ViewingGeometry {
    pub satellite_zenith_angle: f64,
    pub satellite_azimuth_angle: f64,
    pub solar_zenith_angle: f64,
    pub solar_azimuth_angle: f64,
    pub phase_angle: f64,
    pub scattering_angle: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CalibrationData {
    pub dark_current_correction: Vec<f64>,
    pub flat_field_correction: Vec<Vec<f64>>,
    pub radiometric_calibration_coefficients: Vec<f64>,
    pub geometric_calibration_parameters: GeometricCalibrationParameters,
    pub calibration_timestamp: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GeometricCalibrationParameters {
    pub focal_length_mm: f64,
    pub principal_point_x: f64,
    pub principal_point_y: f64,
    pub radial_distortion_coefficients: Vec<f64>,
    pub tangential_distortion_coefficients: Vec<f64>,
}

// =============================================================================
// PROCESSING RESULT STRUCTURES
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LidarProcessingResult {
    pub processed_measurements: Vec<ProcessedLidarMeasurement>,
    pub atmospheric_profile: AtmosphericProfile,
    pub quality_metrics: QualityMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProcessedLidarMeasurement {
    pub original_measurement: crate::signal::LidarMeasurement,
    pub backscatter_coefficient: f64,
    pub extinction_coefficient: f64,
    pub atmospheric_parameters: AtmosphericParameters,
    pub processing_quality: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AtmosphericProfile {
    pub altitude_levels_m: Vec<f64>,
    pub temperature_profile_k: Vec<f64>,
    pub pressure_profile_pa: Vec<f64>,
    pub humidity_profile_percent: Vec<f64>,
    pub aerosol_optical_depth: Vec<f64>,
    pub molecular_scattering_coefficient: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AtmosphericParameters {
    pub aerosol_optical_depth: f64,
    pub water_vapor_content: f64,
    pub particle_size_distribution: Vec<f64>,
    pub refractive_index: Complex64,
    pub atmospheric_transmission: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GPSProcessingResult {
    pub processed_measurements: Vec<ProcessedGPSMeasurement>,
    pub differential_corrections: DifferentialCorrections,
    pub atmospheric_estimates: AtmosphericEstimates,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProcessedGPSMeasurement {
    pub satellite_prn: String,
    pub precise_pseudorange: f64,
    pub precise_carrier_phase: f64,
    pub atmospheric_delays: AtmosphericDelays,
    pub signal_quality: SignalQuality,
    pub multipath_indicators: MultipathIndicators,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AtmosphericDelays {
    pub ionospheric_delay: f64,
    pub tropospheric_delay: f64,
    pub delay_uncertainty: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SignalQuality {
    pub carrier_to_noise_ratio: f64,
    pub phase_lock_quality: f64,
    pub code_lock_quality: f64,
    pub measurement_precision: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MultipathIndicators {
    pub multipath_error_estimate: f64,
    pub correlation_distortion: f64,
    pub signal_reflection_strength: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DifferentialCorrections {
    pub position_corrections: Vec<f64>,
    pub clock_corrections: Vec<f64>,
    pub atmospheric_corrections: Vec<f64>,
    pub correction_uncertainties: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AtmosphericEstimates {
    pub ionospheric_total_electron_content: f64,
    pub tropospheric_wet_delay: f64,
    pub tropospheric_dry_delay: f64,
    pub estimation_uncertainty: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RadarProcessingResult {
    pub processed_measurements: Vec<ProcessedRadarMeasurement>,
    pub target_tracks: Vec<TargetTrack>,
    pub atmospheric_profiles: Vec<RadarAtmosphericProfile>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProcessedRadarMeasurement {
    pub range_measurements: Vec<f64>,
    pub velocity_measurements: Vec<f64>,
    pub target_signatures: Vec<TargetSignature>,
    pub atmospheric_effects: AtmosphericEffects,
    pub signal_quality: RadarSignalQuality,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TargetSignature {
    pub radar_cross_section: f64,
    pub doppler_signature: Vec<f64>,
    pub polarization_signature: PolarizationSignature,
    pub signature_confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PolarizationSignature {
    pub hh_polarization: f64,
    pub vv_polarization: f64,
    pub hv_polarization: f64,
    pub vh_polarization: f64,
    pub polarization_ratio: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AtmosphericEffects {
    pub path_loss_db: f64,
    pub phase_delay_ns: f64,
    pub scintillation_variance: f64,
    pub ducting_effects: DuctingEffects,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DuctingEffects {
    pub ducting_strength: f64,
    pub duct_height_m: f64,
    pub propagation_enhancement_db: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RadarSignalQuality {
    pub signal_to_noise_ratio: f64,
    pub signal_to_clutter_ratio: f64,
    pub range_resolution: f64,
    pub velocity_resolution: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TargetTrack {
    pub track_id: u32,
    pub positions: Vec<Position3D>,
    pub velocities: Vec<Velocity3D>,
    pub timestamps: Vec<f64>,
    pub track_quality: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Position3D {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Velocity3D {
    pub vx: f64,
    pub vy: f64,
    pub vz: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RadarAtmosphericProfile {
    pub altitude_levels: Vec<f64>,
    pub refractive_index_profile: Vec<f64>,
    pub humidity_profile: Vec<f64>,
    pub temperature_profile: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct OpticalProcessingResult {
    pub processed_images: Vec<ProcessedOpticalImage>,
    pub atmospheric_retrievals: Vec<AtmosphericRetrieval>,
    pub surface_reflectance: SurfaceReflectance,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProcessedOpticalImage {
    pub corrected_image: CorrectedImage,
    pub spectral_data: SpectralData,
    pub atmospheric_parameters: AtmosphericParameters,
    pub quality_metrics: ImageQualityMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CorrectedImage {
    pub corrected_pixel_data: Vec<Vec<Vec<f64>>>,
    pub correction_flags: Vec<Vec<u8>>,
    pub uncertainty_map: Vec<Vec<f64>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpectralData {
    pub spectral_curves: Vec<SpectralCurve>,
    pub spectral_indices: HashMap<String, f64>,
    pub classification_results: ClassificationResults,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpectralCurve {
    pub wavelengths: Vec<f64>,
    pub reflectances: Vec<f64>,
    pub uncertainties: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ClassificationResults {
    pub land_cover_classes: HashMap<String, f64>,
    pub vegetation_indices: HashMap<String, f64>,
    pub water_indices: HashMap<String, f64>,
    pub classification_confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ImageQualityMetrics {
    pub signal_to_noise_ratio: f64,
    pub spatial_resolution: f64,
    pub spectral_resolution: f64,
    pub radiometric_accuracy: f64,
    pub geometric_accuracy: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AtmosphericRetrieval {
    pub aerosol_optical_depth: f64,
    pub water_vapor_content: f64,
    pub atmospheric_visibility: f64,
    pub particle_size_distribution: ParticleSizeDistribution,
    pub retrieval_uncertainty: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ParticleSizeDistribution {
    pub size_bins: Vec<f64>,
    pub number_density: Vec<f64>,
    pub volume_density: Vec<f64>,
    pub effective_radius: f64,
    pub variance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SurfaceReflectance {
    pub reflectance_spectra: Vec<SpectralCurve>,
    pub bidirectional_reflectance_distribution: BRDF,
    pub surface_type_classification: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BRDF {
    pub kernel_parameters: Vec<f64>,
    pub angular_reflectance: Vec<Vec<f64>>,
    pub model_fit_quality: f64,
}

// =============================================================================
// FUSION AND PREDICTION STRUCTURES
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FusedMeasurements {
    pub temporal_measurements: TemporalMeasurements,
    pub spatial_measurements: SpatialMeasurements,
    pub spectral_measurements: SpectralMeasurements,
    pub polarization_measurements: PolarizationMeasurements,
    pub quality_metrics: QualityMetrics,
    pub consistency_metrics: ConsistencyMetrics,
    pub fusion_timestamp: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TemporalMeasurements {
    pub time_series_data: Vec<TimeSeriesPoint>,
    pub temporal_correlations: Vec<f64>,
    pub temporal_resolution: f64,
    pub temporal_coverage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TimeSeriesPoint {
    pub timestamp: f64,
    pub value: f64,
    pub uncertainty: f64,
    pub quality_flag: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpatialMeasurements {
    pub spatial_grid: SpatialGrid,
    pub spatial_correlations: SpatialCorrelationMatrix,
    pub spatial_resolution: f64,
    pub spatial_coverage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpatialGrid {
    pub grid_points: Vec<GridPoint>,
    pub grid_resolution: f64,
    pub coordinate_system: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GridPoint {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub value: f64,
    pub uncertainty: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpatialCorrelationMatrix {
    pub correlation_coefficients: Vec<Vec<f64>>,
    pub correlation_distances: Vec<f64>,
    pub decorrelation_length: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpectralMeasurements {
    pub spectral_data: Vec<SpectralMeasurement>,
    pub spectral_resolution: f64,
    pub spectral_range: (f64, f64),
    pub calibration_accuracy: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpectralMeasurement {
    pub wavelength: f64,
    pub intensity: f64,
    pub uncertainty: f64,
    pub atmospheric_transmission: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PolarizationMeasurements {
    pub stokes_parameters: StokesParameters,
    pub degree_of_polarization: f64,
    pub polarization_angle: f64,
    pub measurement_uncertainty: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StokesParameters {
    pub i: f64,  // Total intensity
    pub q: f64,  // Linear polarization (0°/90°)
    pub u: f64,  // Linear polarization (45°/135°)
    pub v: f64,  // Circular polarization
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct QualityMetrics {
    pub overall_quality_score: f64,
    pub reliability_indicators: HashMap<String, f64>,
    pub data_completeness: f64,
    pub measurement_accuracy: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ConsistencyMetrics {
    pub cross_sensor_consistency: f64,
    pub temporal_consistency: f64,
    pub spatial_consistency: f64,
    pub physical_consistency: f64,
}

// =============================================================================
// PREDICTION AND ORBIT STRUCTURES
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PreciseVelocity {
    pub vx: f64,
    pub vy: f64,
    pub vz: f64,
    pub velocity_accuracy_mms: f64,
    pub coordinate_system: String,
    pub timestamp: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct OrbitalUncertainty {
    pub position_uncertainty_m: f64,
    pub velocity_uncertainty_ms: f64,
    pub orbital_period_uncertainty_s: f64,
    pub covariance_matrix: Vec<Vec<f64>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PredictedSpectrum {
    pub spectral_bands: Vec<PredictedSpectralBand>,
    pub atmospheric_effects: SpectralAtmosphericEffects,
    pub surface_contribution: SpectralSurfaceContribution,
    pub prediction_uncertainty: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PredictedSpectralBand {
    pub wavelength: f64,
    pub predicted_radiance: f64,
    pub atmospheric_transmission: f64,
    pub surface_reflectance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpectralAtmosphericEffects {
    pub rayleigh_scattering: f64,
    pub aerosol_scattering: f64,
    pub molecular_absorption: f64,
    pub water_vapor_absorption: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpectralSurfaceContribution {
    pub surface_albedo: f64,
    pub bidirectional_effects: f64,
    pub surface_temperature_emission: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AtmosphericPath {
    pub path_segments: Vec<PathSegment>,
    pub total_optical_depth: f64,
    pub effective_temperature: f64,
    pub pressure_profile: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PathSegment {
    pub altitude_start: f64,
    pub altitude_end: f64,
    pub optical_depth: f64,
    pub atmospheric_density: f64,
    pub molecular_composition: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SurfaceInteractions {
    pub surface_type: String,
    pub surface_roughness: f64,
    pub surface_temperature: f64,
    pub surface_emissivity: f64,
    pub vegetation_fraction: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ReconstructionAccuracy {
    pub position_accuracy_m: f64,
    pub velocity_accuracy_ms: f64,
    pub temporal_accuracy_s: f64,
    pub overall_accuracy_score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictionHorizon {
    pub duration_hours: f64,
    pub accuracy_requirement: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AccuracyMetrics {
    pub position_rms_error: f64,
    pub velocity_rms_error: f64,
    pub prediction_confidence: f64,
    pub convergence_rate: f64,
}

impl AccuracyMetrics {
    pub fn new() -> Self {
        Self {
            position_rms_error: 0.001, // 1 mm
            velocity_rms_error: 1e-6,  // 1 µm/s
            prediction_confidence: 0.95,
            convergence_rate: 0.99,
        }
    }
}

// =============================================================================
// HELPER FUNCTIONS FOR TESTING
// =============================================================================

pub fn create_test_lidar_measurement() -> crate::signal::LidarMeasurement {
    crate::signal::LidarMeasurement {
        timestamp: 1000.0,
        range_profile: (0..100).map(|i| i as f64 * 100.0).collect(),
        backscatter_profile: (0..100).map(|i| 1e-6 * (-i as f64 / 50.0).exp()).collect(),
        atmospheric_returns: vec![
            crate::signal::AtmosphericReturn {
                altitude_m: 1000.0,
                backscatter_coefficient: 1e-6,
                extinction_coefficient: 1e-4,
                depolarization_ratio: 0.1,
                particle_type_probability: [("aerosol".to_string(), 0.7), ("cloud".to_string(), 0.3)].into(),
            }
        ],
        laser_parameters: LaserParameters {
            wavelength_nm: 355.0,
            pulse_energy_mj: 100.0,
            pulse_duration_ns: 10.0,
            repetition_rate_hz: 20.0,
            beam_quality_m2: 1.2,
            polarization_state: "linear".to_string(),
        },
        measurement_geometry: MeasurementGeometry::default(),
        quality_indicators: QualityIndicators::default(),
    }
}

pub fn create_test_gps_measurement() -> crate::signal::GPSRawMeasurement {
    crate::signal::GPSRawMeasurement {
        timestamp: 1000.0,
        satellite_prn: "01".to_string(),
        raw_pseudorange: 20000000.0,
        raw_carrier_phase: 157542000.0,
        doppler_frequency: -2000.0,
        signal_strength_cn0: 45.0,
        tracking_state: TrackingState::default(),
        raw_navigation_bits: vec![0x01, 0x02, 0x03, 0x04],
        correlator_outputs: CorrelatorOutputs::default(),
    }
}

pub fn create_test_radar_measurement() -> crate::signal::RadarMeasurement {
    crate::signal::RadarMeasurement {
        timestamp: 1000.0,
        range_bins: (0..256).map(|i| i as f64 * 100.0).collect(),
        doppler_bins: (-128..128).map(|i| i as f64 * 0.5).collect(),
        complex_returns: vec![vec![Complex64::new(1.0, 0.5); 256]; 256],
        target_detections: vec![
            RadarTarget {
                range_m: 5000.0,
                velocity_ms: 50.0,
                radar_cross_section_dbm2: 10.0,
                target_type_probability: [("aircraft".to_string(), 0.8)].into(),
                detection_confidence: 0.9,
            }
        ],
        clutter_map: ClutterMap::default(),
        atmospheric_conditions: AtmosphericConditions::default(),
    }
}

pub fn create_test_optical_measurement() -> crate::signal::OpticalMeasurement {
    crate::signal::OpticalMeasurement {
        timestamp: 1000.0,
        image_data: ImageData {
            pixel_data: vec![vec![vec![1000; 10]; 1024]; 1024],
            image_width: 1024,
            image_height: 1024,
            bit_depth: 16,
            compression_type: "lossless".to_string(),
        },
        spectral_channels: (400..=700).step_by(50).map(|wl| {
            SpectralChannel {
                center_wavelength_nm: wl as f64,
                bandwidth_nm: 50.0,
                radiometric_resolution: 0.1,
                calibration_coefficients: vec![1.0, 0.0],
                quantum_efficiency: 0.8,
            }
        }).collect(),
        viewing_geometry: ViewingGeometry::default(),
        calibration_data: CalibrationData::default(),
        atmospheric_conditions: AtmosphericConditions::default(),
    }
}

/// Test helper functions
pub fn create_test_measurement_data() -> (f64, f64, f64, f64) {
    (1000.0, 45.0, 0.95, 1e-6)
} 
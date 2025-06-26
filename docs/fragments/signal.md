#[derive(Debug, Clone)]
pub struct AtmosphericSignalSensing {
    pub cellular_signal_collectors: HashMap<String, CellularSignalCollector>,
    pub satellite_signal_collectors: HashMap<String, SatelliteSignalCollector>,
    pub signal_propagation_models: Vec<Box<dyn SignalPropagationModel>>,
    pub atmospheric_inference_engines: Vec<Box<dyn AtmosphericInferenceEngine>>,
    pub ml_models: AtmosphericMLModels,
    pub signal_quality_analyzers: SignalQualityAnalyzerSuite,
}

#[derive(Debug, Clone)]
pub struct CellularSignalCollector {
    pub tower_id: String,
    pub tower_location: Point3D,
    pub coverage_area: CoverageArea,
    pub signal_measurements: Vec<CellularSignalMeasurement>,
    pub connected_devices: HashMap<String, DeviceSignalProfile>,
    pub temporal_resolution: f64, // measurements per second
}

#[derive(Debug, Clone)]
pub struct CellularSignalMeasurement {
    pub timestamp: f64,
    pub signal_strength_dbm: f64,
    pub signal_to_noise_ratio: f64,
    pub bit_error_rate: f64,
    pub packet_loss_rate: f64,
    pub latency_ms: f64,
    pub frequency_band: FrequencyBand,
    pub atmospheric_path_length: f64,
    pub elevation_angle: f64,
    pub azimuth_angle: f64,
    pub weather_conditions: WeatherSnapshot,
}

#[derive(Debug, Clone)]
pub struct SatelliteSignalCollector {
    pub satellite_id: String,
    pub satellite_orbit: OrbitParameters,
    pub ground_stations: Vec<GroundStation>,
    pub signal_measurements: Vec<SatelliteSignalMeasurement>,
    pub atmospheric_penetration_data: AtmosphericPenetrationData,
}

#[derive(Debug, Clone)]
pub struct SatelliteSignalMeasurement {
    pub timestamp: f64,
    pub uplink_signal_quality: SignalQuality,
    pub downlink_signal_quality: SignalQuality,
    pub atmospheric_delay: f64, // ionospheric and tropospheric delay
    pub scintillation_index: f64, // atmospheric turbulence effect
    pub faraday_rotation: f64, // ionospheric effect
    pub atmospheric_absorption: f64,
    pub multipath_effects: MultipathCharacteristics,
    pub doppler_shift: f64,
}

pub trait SignalPropagationModel {
    fn compute_atmospheric_effects(&self, 
                                 signal_params: &SignalParameters,
                                 atmospheric_state: &AtmosphericState) -> PropagationEffects;
    
    fn infer_atmospheric_composition(&self,
                                   observed_signal_effects: &ObservedSignalEffects) -> AtmosphericCompositionEstimate;
}

#[derive(Debug, Clone)]
pub struct ComprehensiveSignalPropagationModel {
    pub ionospheric_model: IonosphericPropagationModel,
    pub tropospheric_model: TroposphericPropagationModel,
    pub molecular_absorption_model: MolecularAbsorptionModel,
    pub scattering_models: Vec<Box<dyn ScatteringModel>>,
    pub multipath_models: Vec<Box<dyn MultipathModel>>,
}

impl SignalPropagationModel for ComprehensiveSignalPropagationModel {
    fn compute_atmospheric_effects(&self,
                                 signal_params: &SignalParameters,
                                 atmospheric_state: &AtmosphericState) -> PropagationEffects {
        
        let mut total_effects = PropagationEffects::new();
        
        // Ionospheric effects (HF, VHF, UHF, L-band)
        if signal_params.frequency < 3e9 { // Below 3 GHz
            let ionospheric_effects = self.ionospheric_model.compute_effects(
                signal_params,
                &atmospheric_state.ionospheric_state
            );
            total_effects.add_ionospheric_effects(ionospheric_effects);
        }
        
        // Tropospheric effects (all frequencies, especially higher)
        let tropospheric_effects = self.tropospheric_model.compute_effects(
            signal_params,
            &atmospheric_state.tropospheric_state
        );
        total_effects.add_tropospheric_effects(tropospheric_effects);
        
        // Molecular absorption (frequency-specific)
        let absorption_effects = self.molecular_absorption_model.compute_absorption(
            signal_params,
            &atmospheric_state.molecular_composition
        );
        total_effects.add_absorption_effects(absorption_effects);
        
        // Scattering effects (Rayleigh, Mie, etc.)
        for scattering_model in &self.scattering_models {
            let scattering_effects = scattering_model.compute_scattering(
                signal_params,
                &atmospheric_state.particle_distribution
            );
            total_effects.add_scattering_effects(scattering_effects);
        }
        
        total_effects
    }
    
    fn infer_atmospheric_composition(&self,
                                   observed_effects: &ObservedSignalEffects) -> AtmosphericCompositionEstimate {
        
        // This is the key inverse problem: given signal effects, infer atmosphere
        let mut composition_estimates = Vec::new();
        
        // Infer water vapor from tropospheric delay
        if let Some(tropospheric_delay) = observed_effects.tropospheric_delay {
            let water_vapor_estimate = self.infer_water_vapor_from_delay(tropospheric_delay);
            composition_estimates.push(("H2O", water_vapor_estimate));
        }
        
        // Infer electron density from ionospheric effects
        if let Some(ionospheric_delay) = observed_effects.ionospheric_delay {
            let electron_density = self.infer_electron_density_from_delay(ionospheric_delay);
            composition_estimates.push(("electron_density", electron_density));
        }
        
        // Infer molecular composition from absorption
        if let Some(absorption_spectrum) = &observed_effects.frequency_dependent_absorption {
            let molecular_composition = self.infer_molecules_from_absorption(absorption_spectrum);
            composition_estimates.extend(molecular_composition);
        }
        
        // Infer particle distribution from scattering
        if let Some(scattering_effects) = &observed_effects.scattering_characteristics {
            let particle_estimates = self.infer_particles_from_scattering(scattering_effects);
            composition_estimates.extend(particle_estimates);
        }
        
        AtmosphericCompositionEstimate {
            molecular_concentrations: composition_estimates.into_iter().collect(),
            confidence_intervals: self.compute_confidence_intervals(&observed_effects),
            spatial_resolution: self.estimate_spatial_resolution(&observed_effects),
            temporal_resolution: self.estimate_temporal_resolution(&observed_effects),
        }
    }
}
pub trait SignalPropagationModel {
    fn compute_atmospheric_effects(&self, 
                                 signal_params: &SignalParameters,
                                 atmospheric_state: &AtmosphericState) -> PropagationEffects;
    
    fn infer_atmospheric_composition(&self,
                                   observed_signal_effects: &ObservedSignalEffects) -> AtmosphericCompositionEstimate;
}

#[derive(Debug, Clone)]
pub struct ComprehensiveSignalPropagationModel {
    pub ionospheric_model: IonosphericPropagationModel,
    pub tropospheric_model: TroposphericPropagationModel,
    pub molecular_absorption_model: MolecularAbsorptionModel,
    pub scattering_models: Vec<Box<dyn ScatteringModel>>,
    pub multipath_models: Vec<Box<dyn MultipathModel>>,
}

impl SignalPropagationModel for ComprehensiveSignalPropagationModel {
    fn compute_atmospheric_effects(&self,
                                 signal_params: &SignalParameters,
                                 atmospheric_state: &AtmosphericState) -> PropagationEffects {
        
        let mut total_effects = PropagationEffects::new();
        
        // Ionospheric effects (HF, VHF, UHF, L-band)
        if signal_params.frequency < 3e9 { // Below 3 GHz
            let ionospheric_effects = self.ionospheric_model.compute_effects(
                signal_params,
                &atmospheric_state.ionospheric_state
            );
            total_effects.add_ionospheric_effects(ionospheric_effects);
        }
        
        // Tropospheric effects (all frequencies, especially higher)
        let tropospheric_effects = self.tropospheric_model.compute_effects(
            signal_params,
            &atmospheric_state.tropospheric_state
        );
        total_effects.add_tropospheric_effects(tropospheric_effects);
        
        // Molecular absorption (frequency-specific)
        let absorption_effects = self.molecular_absorption_model.compute_absorption(
            signal_params,
            &atmospheric_state.molecular_composition
        );
        total_effects.add_absorption_effects(absorption_effects);
        
        // Scattering effects (Rayleigh, Mie, etc.)
        for scattering_model in &self.scattering_models {
            let scattering_effects = scattering_model.compute_scattering(
                signal_params,
                &atmospheric_state.particle_distribution
            );
            total_effects.add_scattering_effects(scattering_effects);
        }
        
        total_effects
    }
    
    fn infer_atmospheric_composition(&self,
                                   observed_effects: &ObservedSignalEffects) -> AtmosphericCompositionEstimate {
        
        // This is the key inverse problem: given signal effects, infer atmosphere
        let mut composition_estimates = Vec::new();
        
        // Infer water vapor from tropospheric delay
        if let Some(tropospheric_delay) = observed_effects.tropospheric_delay {
            let water_vapor_estimate = self.infer_water_vapor_from_delay(tropospheric_delay);
            composition_estimates.push(("H2O", water_vapor_estimate));
        }
        
        // Infer electron density from ionospheric effects
        if let Some(ionospheric_delay) = observed_effects.ionospheric_delay {
            let electron_density = self.infer_electron_density_from_delay(ionospheric_delay);
            composition_estimates.push(("electron_density", electron_density));
        }
        
        // Infer molecular composition from absorption
        if let Some(absorption_spectrum) = &observed_effects.frequency_dependent_absorption {
            let molecular_composition = self.infer_molecules_from_absorption(absorption_spectrum);
            composition_estimates.extend(molecular_composition);
        }
        
        // Infer particle distribution from scattering
        if let Some(scattering_effects) = &observed_effects.scattering_characteristics {
            let particle_estimates = self.infer_particles_from_scattering(scattering_effects);
            composition_estimates.extend(particle_estimates);
        }
        
        AtmosphericCompositionEstimate {
            molecular_concentrations: composition_estimates.into_iter().collect(),
            confidence_intervals: self.compute_confidence_intervals(&observed_effects),
            spatial_resolution: self.estimate_spatial_resolution(&observed_effects),
            temporal_resolution: self.estimate_temporal_resolution(&observed_effects),
        }
    }
}
#[derive(Debug, Clone)]
pub struct AtmosphericMLModels {
    pub signal_to_composition_models: HashMap<String, Box<dyn MLModel>>,
    pub temporal_pattern_models: Vec<Box<dyn TemporalPatternModel>>,
    pub spatial_correlation_models: Vec<Box<dyn SpatialCorrelationModel>>,
    pub multi_frequency_fusion_models: Vec<Box<dyn MultiFusionModel>>,
    pub anomaly_detection_models: Vec<Box<dyn AnomalyDetectionModel>>,
}

#[derive(Debug, Clone)]
pub struct SignalAtmosphereNeuralNetwork {
    pub input_features: SignalFeatureExtractor,
    pub hidden_layers: Vec<NeuralLayer>,
    pub output_layers: AtmosphericOutputLayer,
    pub training_data: SignalAtmosphereDataset,
    pub validation_metrics: ValidationMetrics,
}

impl SignalAtmosphereNeuralNetwork {
    pub fn train_on_signal_atmosphere_correlations(&mut self,
                                                  training_data: &SignalAtmosphereDataset) -> TrainingResult {
        
        // Extract features from signal measurements
        let signal_features = training_data.signal_measurements
            .iter()
            .map(|measurement| self.input_features.extract_features(measurement))
            .collect::<Vec<_>>();
        
        // Ground truth atmospheric compositions (from weather stations, radiosondes, etc.)
        let atmospheric_targets = training_data.atmospheric_ground_truth
            .iter()
            .map(|composition| self.encode_atmospheric_composition(composition))
            .collect::<Vec<_>>();
        
        // Train neural network
        let training_pairs: Vec<_> = signal_features
            .into_iter()
            .zip(atmospheric_targets.into_iter())
            .collect();
        
        let mut training_loss = Vec::new();
        let mut validation_loss = Vec::new();
        
        for epoch in 0..self.training_config.max_epochs {
            // Forward pass
            let predictions = training_pairs
                .iter()
                .map(|(features, _)| self.forward_pass(features))
                .collect::<Vec<_>>();
            
            // Compute loss
            let epoch_loss = training_pairs
                .iter()
                .zip(predictions.iter())
                .map(|((_, target), prediction)| self.compute_loss(prediction, target))
                .sum::<f64>() / training_pairs.len() as f64;
            
            training_loss.push(epoch_loss);
            
            // Backward pass and optimization
            self.backward_pass_and_optimize(&training_pairs);
            
            // Validation
            if epoch % 10 == 0 {
                let val_loss = self.validate_on_holdout_set();
                validation_loss.push(val_loss);
                
                println!("Epoch {}: Training Loss = {:.6}, Validation Loss = {:.6}", 
                        epoch, epoch_loss, val_loss);
            }
        }
        
        TrainingResult {
            final_training_loss: *training_loss.last().unwrap(),
            final_validation_loss: *validation_loss.last().unwrap(),
            training_history: training_loss,
            validation_history: validation_loss,
            learned_correlations: self.extract_learned_correlations(),
        }
    }
    
    pub fn predict_atmospheric_composition(&self,
                                         signal_measurements: &[SignalMeasurement]) -> AtmosphericPrediction {
        
        // Extract features from signal measurements
        let signal_features = signal_measurements
            .iter()
            .map(|measurement| self.input_features.extract_features(measurement))
            .collect::<Vec<_>>();
        
        // Predict atmospheric composition
        let raw_predictions = signal_features
            .iter()
            .map(|features| self.forward_pass(features))
            .collect::<Vec<_>>();
        
        // Post-process predictions
        let atmospheric_composition = self.decode_atmospheric_predictions(&raw_predictions);
        
        // Estimate uncertainty
        let prediction_uncertainty = self.estimate_prediction_uncertainty(&raw_predictions);
        
        AtmosphericPrediction {
            molecular_concentrations: atmospheric_composition,
            prediction_uncertainty,
            confidence_score: self.compute_confidence_score(&raw_predictions),
            spatial_coverage: self.estimate_spatial_coverage(&signal_measurements),
            temporal_resolution: self.estimate_temporal_resolution(&signal_measurements),
        }
    }
}
#[derive(Debug, Clone)]
pub struct SignalFeatureExtractor {
    pub temporal_feature_extractors: Vec<Box<dyn TemporalFeatureExtractor>>,
    pub frequency_feature_extractors: Vec<Box<dyn FrequencyFeatureExtractor>>,
    pub spatial_feature_extractors: Vec<Box<dyn SpatialFeatureExtractor>>,
    pub signal_quality_feature_extractors: Vec<Box<dyn SignalQualityFeatureExtractor>>,
}

impl SignalFeatureExtractor {
    pub fn extract_features(&self, signal_measurement: &SignalMeasurement) -> SignalFeatureVector {
        let mut features = SignalFeatureVector::new();
        
        // Temporal features
        features.extend(self.extract_temporal_features(signal_measurement));
        
        // Frequency-domain features
        features.extend(self.extract_frequency_features(signal_measurement));
        
        // Spatial propagation features
        features.extend(self.extract_spatial_features(signal_measurement));
        
        // Signal quality features
        features.extend(self.extract_signal_quality_features(signal_measurement));
        
        features
    }
    
    fn extract_temporal_features(&self, measurement: &SignalMeasurement) -> Vec<f64> {
        let mut temporal_features = Vec::new();
        
        // Signal strength variations over time
        temporal_features.push(measurement.signal_strength_variation);
        temporal_features.push(measurement.signal_strength_trend);
        temporal_features.push(measurement.signal_strength_periodicity);
        
        // Latency variations (atmospheric delay changes)
        temporal_features.push(measurement.latency_variation);
        temporal_features.push(measurement.latency_trend);
        
        // Scintillation patterns (atmospheric turbulence)
        temporal_features.push(measurement.scintillation_frequency);
        temporal_features.push(measurement.scintillation_amplitude);
        temporal_features.push(measurement.scintillation_coherence_time);
        
        temporal_features
    }
    
    fn extract_frequency_features(&self, measurement: &SignalMeasurement) -> Vec<f64> {
        let mut frequency_features = Vec::new();
        
        // Frequency-dependent absorption
        frequency_features.extend(measurement.absorption_spectrum.clone());
        
        // Dispersion characteristics
        frequency_features.push(measurement.group_delay_dispersion);
        frequency_features.push(measurement.phase_delay_dispersion);
        
        // Doppler effects
        frequency_features.push(measurement.doppler_shift);
        frequency_features.push(measurement.doppler_spread);
        
        // Faraday rotation (ionospheric)
        frequency_features.push(measurement.faraday_rotation_angle);
        
        frequency_features
    }
    
    fn extract_spatial_features(&self, measurement: &SignalMeasurement) -> Vec<f64> {
        let mut spatial_features = Vec::new();
        
        // Path geometry
        spatial_features.push(measurement.elevation_angle);
        spatial_features.push(measurement.azimuth_angle);
        spatial_features.push(measurement.atmospheric_path_length);
        spatial_features.push(measurement.geometric_path_length);
        
        // Multipath characteristics
        spatial_features.push(measurement.multipath_delay_spread);
        spatial_features.push(measurement.multipath_amplitude_variations);
        spatial_features.push(measurement.coherence_bandwidth);
        
        // Spatial correlation with nearby measurements
        spatial_features.extend(measurement.spatial_correlation_coefficients.clone());
        
        spatial_features
    }
    
    fn extract_signal_quality_features(&self, measurement: &SignalMeasurement) -> Vec<f64> {
        let mut quality_features = Vec::new();
        
        // Basic signal quality metrics
        quality_features.push(measurement.signal_to_noise_ratio);
        quality_features.push(measurement.bit_error_rate);
        quality_features.push(measurement.packet_loss_rate);
        quality_features.push(measurement.signal_strength_dbm);
        
        // Advanced quality metrics
        quality_features.push(measurement.error_vector_magnitude);
        quality_features.push(measurement.channel_capacity);
        quality_features.push(measurement.spectral_efficiency);
        
        // Atmospheric-specific quality indicators
        quality_features.push(measurement.atmospheric_noise_temperature);
        quality_features.push(measurement.sky_temperature);
        quality_features.push(measurement.rain_attenuation);
        
        quality_features
    }
}
pub struct GlobalSignalAtmosphericNetwork {
    pub cellular_networks: HashMap<String, CellularNetworkCluster>,
    pub satellite_networks: HashMap<String, SatelliteNetworkCluster>,
    pub signal_fusion_engine: SignalFusionEngine,
    pub atmospheric_reconstruction_engine: AtmosphericReconstructionEngine,
    pub real_time_processing_pipeline: RealTimeProcessingPipeline,
}

impl GlobalSignalAtmosphericNetwork {
    pub fn create_global_atmospheric_map(&mut self, timestamp: f64) -> GlobalAtmosphericMap {
        // Step 1: Collect signal measurements from all networks
        let cellular_measurements = self.collect_cellular_measurements(timestamp);
        let satellite_measurements = self.collect_satellite_measurements(timestamp);
        
        // Step 2: Fuse multi-network signal data
        let fused_signal_data = self.signal_fusion_engine.fuse_multi_network_signals(
            &cellular_measurements,
            &satellite_measurements
        );
        
        // Step 3: Apply ML models to infer atmospheric composition
        let atmospheric_predictions = self.apply_ml_models_to_signal_data(&fused_signal_data);
        
        // Step 4: Reconstruct 3D atmospheric composition field
        let atmospheric_3d_field = self.atmospheric_reconstruction_engine
            .reconstruct_3d_atmospheric_field(&atmospheric_predictions);
        
        // Step 5: Validate against known atmospheric physics
        let validated_field = self.validate_against_atmospheric_physics(&atmospheric_3d_field);
        
        GlobalAtmosphericMap {
            timestamp,
            molecular_concentration_fields: validated_field.molecular_fields,
            particle_distribution_fields: validated_field.particle_fields,
            ionospheric_state: validated_field.ionospheric_state,
            tropospheric_state: validated_field.tropospheric_state,
            spatial_resolution: self.compute_spatial_resolution(),
            temporal_resolution: self.compute_temporal_resolution(),
            coverage_percentage: self.compute_global_coverage_percentage(),
            measurement_confidence: validated_field.confidence_map,
        }
    }
    
    pub fn detect_atmospheric_anomalies(&self,
                                      current_map: &GlobalAtmosphericMap,
                                      historical_maps: &[GlobalAtmosphericMap]) -> AtmosphericAnomalyReport {
        
        let mut detected_anomalies = Vec::new();
        
        // Detect composition anomalies
        for (molecule, current_field) in &current_map.molecular_concentration_fields {
            let historical_fields: Vec<_> = historical_maps
                .iter()
                .filter_map(|map| map.molecular_concentration_fields.get(molecule))
                .collect();
            
            let anomalies = self.detect_composition_anomalies(current_field, &historical_fields);
            detected_anomalies.extend(anomalies);
        }
        
        // Detect ionospheric anomalies
        let ionospheric_anomalies = self.detect_ionospheric_anomalies(
            &current_map.ionospheric_state,
            &historical_maps.iter().map(|m| &m.ionospheric_state).collect::<Vec<_>>()
        );
        detected_anomalies.extend(ionospheric_anomalies);
        
        AtmosphericAnomalyReport {
            timestamp: current_map.timestamp,
            detected_anomalies,
            anomaly_confidence_scores: self.compute_anomaly_confidence_scores(&detected_anomalies),
            potential_causes: self.analyze_potential_anomaly_causes(&detected_anomalies),
            recommended_actions: self.generate_anomaly_response_recommendations(&detected_anomalies),
        }
    }
}
pub struct SignalEnhancedWeatherSystem {
    pub signal_atmospheric_network: GlobalSignalAtmosphericNetwork,
    pub traditional_weather_models: Vec<Box<dyn WeatherModel>>,
    pub signal_weather_fusion_engine: SignalWeatherFusionEngine,
    pub enhanced_prediction_models: Vec<Box<dyn EnhancedPredictionModel>>,
}

impl SignalEnhancedWeatherSystem {
    pub fn create_enhanced_weather_forecast(&mut self,
                                          forecast_horizon_hours: f64) -> EnhancedWeatherForecast {
        
        // Step 1: Get current atmospheric state from signal network
        let current_atmospheric_state = self.signal_atmospheric_network
            .create_global_atmospheric_map(SystemTime::now().as_secs_f64());
        
        // Step 2: Get traditional weather model predictions
        let traditional_forecasts = self.traditional_weather_models
            .iter()
            .map(|model| model.predict_weather(forecast_horizon_hours))
            .collect::<Vec<_>>();
        
        // Step 3: Fuse signal-derived data with traditional models
        let fused_forecast = self.signal_weather_fusion_engine.fuse_signal_and_traditional_data(
            &current_atmospheric_state,
            &traditional_forecasts
        );
        
        // Step 4: Apply enhanced prediction models
        let enhanced_forecast = self.enhanced_prediction_models
            .iter()
            .map(|model| model.predict_with_signal_enhancement(&fused_forecast))
            .fold(fused_forecast, |acc, prediction| acc.merge_with(prediction));
        
        EnhancedWeatherForecast {
            traditional_forecast_component: traditional_forecasts,
            signal_derived_component: current_atmospheric_state,
            enhanced_prediction: enhanced_forecast,
            forecast_improvement_metrics: self.compute_improvement_metrics(&enhanced_forecast),
            signal_contribution_percentage: self.compute_signal_contribution(&enhanced_forecast),
        }
    }
}

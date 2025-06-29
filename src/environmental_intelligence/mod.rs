pub mod geological;
pub mod oceanic;
pub mod solar;
pub mod agricultural_enhanced;
pub mod computational_engine;

use tokio::sync::RwLock;
use std::sync::Arc;
use ndarray::{Array3, Array2};
use serde::{Serialize, Deserialize};
use tokio::task;

pub use geological::{GeologicalSimulationEngine, GeologicalState};
pub use oceanic::{OceanicSimulationEngine, OceanicState};
pub use solar::{SolarSimulationEngine, SolarState};
pub use agricultural_enhanced::{AgriculturalEcosystemEngine, AgriculturalState};
pub use computational_engine::{ComputationalEngine, ComputationalEngineState};

/// Unified Environmental Intelligence System
/// High-performance multi-domain earth system simulation engine
#[derive(Debug)]
pub struct EnvironmentalIntelligenceSystem {
    computational_engine: computational_engine::ComputationalEngine,
    
    // Cross-domain coupling systems
    coupling_manager: CrossDomainCouplingManager,
    
    // Performance optimization
    performance_manager: PerformanceManager,
}

/// Cross-domain coupling between environmental systems
#[derive(Debug)]
pub struct CrossDomainCouplingManager {
    ocean_atmosphere_coupling: OceanAtmosphereCoupling,
    geological_hydrosphere_coupling: GeologicalHydrosphereCoupling,
    solar_atmosphere_coupling: SolarAtmosphereCoupling,
    ecosystem_atmosphere_coupling: EcosystemAtmosphereCoupling,
}

/// Real-time performance management and optimization
#[derive(Debug)]
pub struct PerformanceManager {
    target_fps: f32,
    current_fps: f32,
    adaptive_quality: AdaptiveQualityController,
    gpu_utilization: f32,
    memory_usage: usize,
}

/// Simulation state across all environmental domains
#[derive(Debug, Serialize, Deserialize)]
pub struct EnvironmentalState {
    geological_state: geological::GeologicalState,
    oceanic_state: oceanic::OceanicState,
    solar_state: solar::SolarState,
    agricultural_state: agricultural_enhanced::AgriculturalState,
    atmospheric_state: AtmosphericState,
    timestamp: f64,
}

/// Rendering data optimized for Three.js/React Three Fiber
#[derive(Debug, Serialize, Deserialize)]
pub struct RenderingDataPacket {
    geological_mesh: geological::GeologicalMeshData,
    oceanic_surface: oceanic::OceanSurfaceData,
    solar_visualization: solar::SolarVisualizationData,
    agricultural_fields: agricultural_enhanced::AgriculturalFieldData,
    atmospheric_volumes: AtmosphericVolumeData,
    performance_metrics: PerformanceMetrics,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    fps: f32,
    frame_time_ms: f32,
    memory_usage_mb: f32,
    gpu_utilization: f32,
    simulation_quality: f32,
}

#[derive(Debug)]
pub struct AtmosphericState {
    temperature: Array3<f32>,
    pressure: Array3<f32>,
    humidity: Array3<f32>,
    wind_velocity: Array3<[f32; 3]>,
    cloud_coverage: Array2<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AtmosphericVolumeData {
    temperature_field: Vec<f32>,
    pressure_field: Vec<f32>,
    humidity_field: Vec<f32>,
    wind_vectors: Vec<[f32; 3]>,
    cloud_positions: Vec<[f32; 3]>,
}

/// Adaptive quality control for performance optimization
#[derive(Debug)]
pub struct AdaptiveQualityController {
    geological_quality: f32,
    oceanic_quality: f32,
    solar_quality: f32,
    agricultural_quality: f32,
    atmospheric_quality: f32,
}

/// Ocean-atmosphere coupling physics
#[derive(Debug)]
pub struct OceanAtmosphereCoupling {
    heat_flux_coefficient: f64,
    moisture_flux_coefficient: f64,
    momentum_transfer_coefficient: f64,
}

/// Geological-hydrosphere coupling physics
#[derive(Debug)]
pub struct GeologicalHydrosphereCoupling {
    groundwater_coupling: f64,
    mineral_leaching_rate: f64,
    soil_atmosphere_exchange: f64,
}

/// Solar-atmosphere coupling physics
#[derive(Debug)]
pub struct SolarAtmosphereCoupling {
    radiation_absorption: f64,
    ionospheric_heating: f64,
    atmospheric_ionization: f64,
}

/// Ecosystem-atmosphere coupling physics
#[derive(Debug)]
pub struct EcosystemAtmosphereCoupling {
    evapotranspiration_rate: f64,
    carbon_flux: f64,
    albedo_modification: f64,
}

impl EnvironmentalIntelligenceSystem {
    /// Create new high-performance environmental intelligence system
    pub fn new() -> Self {
        Self {
            computational_engine: computational_engine::ComputationalEngine::new(),
            coupling_manager: CrossDomainCouplingManager::new(),
            performance_manager: PerformanceManager::new(60.0), // 60 FPS target
        }
    }
    
    /// Execute high-performance simulation step with cross-domain coupling
    pub async fn simulation_step(&mut self, dt: f64) -> Result<EnvironmentalState, Box<dyn std::error::Error>> {
        // Execute unified computational engine simulation
        let engine_state = self.computational_engine.simulate_step(dt).await?;
        
        // Execute cross-domain coupling
        let atmospheric_state = self.update_atmospheric_coupling(
            &engine_state.geological_state,
            &engine_state.oceanic_state,
            &engine_state.solar_state,
            &engine_state.agricultural_state,
            dt,
        ).await?;
        
        // Update performance metrics and adaptive quality
        self.performance_manager.update_metrics(dt);
        self.adaptive_quality_control();
        
        Ok(EnvironmentalState {
            geological_state: engine_state.geological_state,
            oceanic_state: engine_state.oceanic_state,
            solar_state: engine_state.solar_state,
            agricultural_state: engine_state.agricultural_state,
            atmospheric_state,
            timestamp: chrono::Utc::now().timestamp() as f64,
        })
    }
    
    /// Prepare optimized rendering data for Three.js
    pub fn prepare_rendering_data(&self, state: &EnvironmentalState) -> RenderingDataPacket {
        RenderingDataPacket {
            geological_mesh: self.geological_engine.get_rendering_mesh(&state.geological_state),
            oceanic_surface: self.oceanic_engine.get_surface_data(&state.oceanic_state),
            solar_visualization: self.solar_engine.get_visualization_data(&state.solar_state),
            agricultural_fields: self.agricultural_engine.get_field_data(&state.agricultural_state),
            atmospheric_volumes: self.get_atmospheric_volume_data(&state.atmospheric_state),
            performance_metrics: self.performance_manager.get_metrics(),
        }
    }
    
    /// Cross-domain atmospheric coupling computation
    async fn update_atmospheric_coupling(
        &mut self,
        geological_state: &geological::GeologicalState,
        oceanic_state: &oceanic::OceanicState,
        solar_state: &solar::SolarState,
        agricultural_state: &agricultural_enhanced::AgriculturalState,
        dt: f64,
    ) -> Result<AtmosphericState, Box<dyn std::error::Error>> {
        // Ocean-atmosphere heat and moisture exchange
        let ocean_heat_flux = self.coupling_manager.ocean_atmosphere_coupling
            .calculate_heat_flux(oceanic_state, dt);
        let ocean_moisture_flux = self.coupling_manager.ocean_atmosphere_coupling
            .calculate_moisture_flux(oceanic_state, dt);
        
        // Solar-atmosphere ionization and heating
        let solar_heating = self.coupling_manager.solar_atmosphere_coupling
            .calculate_atmospheric_heating(solar_state, dt);
        let ionospheric_effects = self.coupling_manager.solar_atmosphere_coupling
            .calculate_ionospheric_coupling(solar_state, dt);
        
        // Geological-atmospheric exchange (groundwater evaporation, soil moisture)
        let geological_moisture = self.coupling_manager.geological_hydrosphere_coupling
            .calculate_soil_atmosphere_exchange(geological_state, dt);
        
        // Ecosystem-atmosphere exchange (evapotranspiration, carbon flux)
        let ecosystem_fluxes = self.coupling_manager.ecosystem_atmosphere_coupling
            .calculate_ecosystem_atmosphere_fluxes(agricultural_state, dt);
        
        // Integrate all coupling effects into atmospheric state
        self.computational_engine.integrate_atmospheric_state(
            ocean_heat_flux,
            ocean_moisture_flux,
            solar_heating,
            ionospheric_effects,
            geological_moisture,
            ecosystem_fluxes,
            dt,
        ).await
    }
    
    /// Adaptive quality control based on performance
    fn adaptive_quality_control(&mut self) {
        let current_fps = self.performance_manager.current_fps;
        let target_fps = self.performance_manager.target_fps;
        let quality_factor = current_fps / target_fps;
        
        if quality_factor < 0.9 {
            // Reduce quality to maintain performance
            self.performance_manager.adaptive_quality.reduce_quality(quality_factor);
            self.geological_engine.set_quality(self.performance_manager.adaptive_quality.geological_quality);
            self.oceanic_engine.set_quality(self.performance_manager.adaptive_quality.oceanic_quality);
            self.solar_engine.set_quality(self.performance_manager.adaptive_quality.solar_quality);
            self.agricultural_engine.set_quality(self.performance_manager.adaptive_quality.agricultural_quality);
        } else if quality_factor > 1.1 {
            // Increase quality when performance allows
            self.performance_manager.adaptive_quality.increase_quality(quality_factor);
            self.geological_engine.set_quality(self.performance_manager.adaptive_quality.geological_quality);
            self.oceanic_engine.set_quality(self.performance_manager.adaptive_quality.oceanic_quality);
            self.solar_engine.set_quality(self.performance_manager.adaptive_quality.solar_quality);
            self.agricultural_engine.set_quality(self.performance_manager.adaptive_quality.agricultural_quality);
        }
    }
    
    /// Convert atmospheric state to volume data for Three.js
    fn get_atmospheric_volume_data(&self, atmospheric_state: &AtmosphericState) -> AtmosphericVolumeData {
        AtmosphericVolumeData {
            temperature_field: atmospheric_state.temperature.as_slice().unwrap().to_vec(),
            pressure_field: atmospheric_state.pressure.as_slice().unwrap().to_vec(),
            humidity_field: atmospheric_state.humidity.as_slice().unwrap().to_vec(),
            wind_vectors: atmospheric_state.wind_velocity.as_slice().unwrap().to_vec(),
            cloud_positions: self.extract_cloud_positions(&atmospheric_state.cloud_coverage),
        }
    }
    
    /// Extract cloud positions for Three.js visualization
    fn extract_cloud_positions(&self, cloud_coverage: &Array2<f32>) -> Vec<[f32; 3]> {
        let mut positions = Vec::new();
        
        for ((x, y), &coverage) in cloud_coverage.indexed_iter() {
            if coverage > 0.5 {
                positions.push([x as f32, coverage * 1000.0, y as f32]);
            }
        }
        
        positions
    }
}

impl CrossDomainCouplingManager {
    pub fn new() -> Self {
        Self {
            ocean_atmosphere_coupling: OceanAtmosphereCoupling {
                heat_flux_coefficient: 1.2e-3,
                moisture_flux_coefficient: 1.5e-5,
                momentum_transfer_coefficient: 2.4e-3,
            },
            geological_hydrosphere_coupling: GeologicalHydrosphereCoupling {
                groundwater_coupling: 0.15,
                mineral_leaching_rate: 1e-6,
                soil_atmosphere_exchange: 0.08,
            },
            solar_atmosphere_coupling: SolarAtmosphereCoupling {
                radiation_absorption: 0.85,
                ionospheric_heating: 2.1e-4,
                atmospheric_ionization: 1.8e-7,
            },
            ecosystem_atmosphere_coupling: EcosystemAtmosphereCoupling {
                evapotranspiration_rate: 0.12,
                carbon_flux: 4.2e-8,
                albedo_modification: 0.05,
            },
        }
    }
}

impl PerformanceManager {
    pub fn new(target_fps: f32) -> Self {
        Self {
            target_fps,
            current_fps: 0.0,
            adaptive_quality: AdaptiveQualityController::new(),
            gpu_utilization: 0.0,
            memory_usage: 0,
        }
    }
    
    pub fn update_metrics(&mut self, frame_time: f64) {
        self.current_fps = 1.0 / frame_time as f32;
        // Update GPU and memory metrics (would interface with system APIs)
    }
    
    pub fn get_metrics(&self) -> PerformanceMetrics {
        PerformanceMetrics {
            fps: self.current_fps,
            frame_time_ms: 1000.0 / self.current_fps,
            memory_usage_mb: self.memory_usage as f32 / 1024.0 / 1024.0,
            gpu_utilization: self.gpu_utilization,
            simulation_quality: self.adaptive_quality.get_overall_quality(),
        }
    }
}

impl AdaptiveQualityController {
    pub fn new() -> Self {
        Self {
            geological_quality: 1.0,
            oceanic_quality: 1.0,
            solar_quality: 1.0,
            agricultural_quality: 1.0,
            atmospheric_quality: 1.0,
        }
    }
    
    pub fn reduce_quality(&mut self, factor: f32) {
        let reduction = 0.9_f32.max(factor);
        self.geological_quality *= reduction;
        self.oceanic_quality *= reduction;
        self.solar_quality *= reduction;
        self.agricultural_quality *= reduction;
        self.atmospheric_quality *= reduction;
        
        // Clamp to minimum quality
        self.geological_quality = self.geological_quality.max(0.1);
        self.oceanic_quality = self.oceanic_quality.max(0.1);
        self.solar_quality = self.solar_quality.max(0.1);
        self.agricultural_quality = self.agricultural_quality.max(0.1);
        self.atmospheric_quality = self.atmospheric_quality.max(0.1);
    }
    
    pub fn increase_quality(&mut self, factor: f32) {
        let increase = 1.1_f32.min(factor);
        self.geological_quality *= increase;
        self.oceanic_quality *= increase;
        self.solar_quality *= increase;
        self.agricultural_quality *= increase;
        self.atmospheric_quality *= increase;
        
        // Clamp to maximum quality
        self.geological_quality = self.geological_quality.min(2.0);
        self.oceanic_quality = self.oceanic_quality.min(2.0);
        self.solar_quality = self.solar_quality.min(2.0);
        self.agricultural_quality = self.agricultural_quality.min(2.0);
        self.atmospheric_quality = self.atmospheric_quality.min(2.0);
    }
    
    pub fn get_overall_quality(&self) -> f32 {
        (self.geological_quality + self.oceanic_quality + self.solar_quality + 
         self.agricultural_quality + self.atmospheric_quality) / 5.0
    }
} 
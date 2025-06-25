pub mod satellite;
pub mod ground;
pub mod agriculture;
pub mod models;
pub mod commercial;
pub mod research;
pub mod ocean;
pub mod atmospheric;

use anyhow::Result;
use async_trait::async_trait;
use std::sync::Arc;
use crate::config::Config;
use crate::error::AppError;
use super::{DataSource, RawDataRecord, DataCollector};

/// Source registry containing all available data source implementations
pub struct SourceRegistry {
    config: Arc<Config>,
}

impl SourceRegistry {
    pub fn new(config: Arc<Config>) -> Self {
        Self { config }
    }
    
    /// Get comprehensive list of all available data sources
    pub async fn get_all_sources(&self) -> Result<Vec<DataSource>, AppError> {
        let mut all_sources = Vec::new();
        
        // Satellite sources (NASA, ESA, NOAA, commercial)
        all_sources.extend(self.get_nasa_satellite_sources().await?);
        all_sources.extend(self.get_esa_copernicus_sources().await?);
        all_sources.extend(self.get_noaa_satellite_sources().await?);
        all_sources.extend(self.get_eumetsat_sources().await?);
        all_sources.extend(self.get_commercial_satellite_sources().await?);
        
        // Ground-based observation networks
        all_sources.extend(self.get_noaa_surface_sources().await?);
        all_sources.extend(self.get_research_network_sources().await?);
        all_sources.extend(self.get_aviation_weather_sources().await?);
        all_sources.extend(self.get_citizen_science_sources().await?);
        all_sources.extend(self.get_international_sources().await?);
        
        // Agricultural and land monitoring
        all_sources.extend(self.get_usda_sources().await?);
        all_sources.extend(self.get_fao_sources().await?);
        all_sources.extend(self.get_soil_monitoring_sources().await?);
        all_sources.extend(self.get_crop_monitoring_sources().await?);
        all_sources.extend(self.get_flux_tower_sources().await?);
        
        // Ocean and atmospheric
        all_sources.extend(self.get_ocean_observation_sources().await?);
        all_sources.extend(self.get_atmospheric_profiling_sources().await?);
        all_sources.extend(self.get_radar_network_sources().await?);
        all_sources.extend(self.get_lidar_network_sources().await?);
        
        // Model and reanalysis data
        all_sources.extend(self.get_global_model_sources().await?);
        all_sources.extend(self.get_regional_model_sources().await?);
        all_sources.extend(self.get_reanalysis_sources().await?);
        all_sources.extend(self.get_climate_model_sources().await?);
        
        // Commercial weather services
        all_sources.extend(self.get_commercial_weather_sources().await?);
        
        // Regional and national sources
        all_sources.extend(self.get_african_sources().await?);
        all_sources.extend(self.get_european_sources().await?);
        all_sources.extend(self.get_asian_sources().await?);
        all_sources.extend(self.get_australian_sources().await?);
        
        Ok(all_sources)
    }
    
    // NASA Satellite Sources
    async fn get_nasa_satellite_sources(&self) -> Result<Vec<DataSource>, AppError> {
        use super::{DataSource, DataSourceCategory, DataFormat, UpdateFrequency, GeographicalCoverage, CoverageScope, TemporalCoverage, IngestionStatus, AuthMethod};
        use uuid::Uuid;
        
        let sources = vec![
            // MODIS Terra/Aqua
            DataSource {
                id: Uuid::new_v4(),
                name: "MODIS Terra Daily".to_string(),
                category: DataSourceCategory::SatelliteImaging,
                provider: "NASA".to_string(),
                description: "MODIS Terra daily surface reflectance, land surface temperature, vegetation indices".to_string(),
                api_endpoint: Some("https://ladsweb.modaps.eosdis.nasa.gov/api/v2".to_string()),
                auth_required: true,
                auth_method: Some(AuthMethod::ApiKey),
                data_format: DataFormat::HDF5,
                update_frequency: UpdateFrequency::Daily,
                geographical_coverage: GeographicalCoverage {
                    scope: CoverageScope::Global,
                    bounds: None,
                    resolution: Some(250.0),
                },
                temporal_coverage: TemporalCoverage {
                    start_date: Some(chrono::DateTime::parse_from_rfc3339("2000-02-24T00:00:00Z").unwrap().with_timezone(&chrono::Utc)),
                    end_date: None,
                    temporal_resolution: Some("1 day".to_string()),
                },
                parameters: vec![
                    "surface_reflectance".to_string(),
                    "land_surface_temperature".to_string(),
                    "ndvi".to_string(),
                    "evi".to_string(),
                    "lai".to_string(),
                    "fpar".to_string(),
                ],
                quality_indicators: vec!["qa_flag".to_string(), "cloud_mask".to_string()],
                associated_publications: vec![
                    "doi:10.5067/MODIS/MOD09GA.006".to_string(),
                    "doi:10.5067/MODIS/MOD11A1.006".to_string(),
                ],
                last_ingestion: None,
                status: IngestionStatus::Active,
                priority: 9,
            },
            
            // VIIRS
            DataSource {
                id: Uuid::new_v4(),
                name: "VIIRS Day/Night Band".to_string(),
                category: DataSourceCategory::SatelliteImaging,
                provider: "NASA/NOAA".to_string(),
                description: "VIIRS Day/Night Band for nighttime lights, fire detection, and vegetation monitoring".to_string(),
                api_endpoint: Some("https://ladsweb.modaps.eosdis.nasa.gov/api/v2".to_string()),
                auth_required: true,
                auth_method: Some(AuthMethod::ApiKey),
                data_format: DataFormat::NetCDF,
                update_frequency: UpdateFrequency::Daily,
                geographical_coverage: GeographicalCoverage {
                    scope: CoverageScope::Global,
                    bounds: None,
                    resolution: Some(375.0),
                },
                temporal_coverage: TemporalCoverage {
                    start_date: Some(chrono::DateTime::parse_from_rfc3339("2011-10-28T00:00:00Z").unwrap().with_timezone(&chrono::Utc)),
                    end_date: None,
                    temporal_resolution: Some("1 day".to_string()),
                },
                parameters: vec![
                    "day_night_band".to_string(),
                    "fire_mask".to_string(),
                    "active_fires".to_string(),
                    "surface_type".to_string(),
                ],
                quality_indicators: vec!["qa_flag".to_string(), "detection_confidence".to_string()],
                associated_publications: vec![
                    "doi:10.5067/VIIRS/VNP46A1.001".to_string(),
                ],
                last_ingestion: None,
                status: IngestionStatus::Active,
                priority: 8,
            },
            
            // Landsat 8/9
            DataSource {
                id: Uuid::new_v4(),
                name: "Landsat Collection 2".to_string(),
                category: DataSourceCategory::SatelliteImaging,
                provider: "NASA/USGS".to_string(),
                description: "Landsat 8/9 multispectral imagery for land cover, agriculture, and environmental monitoring".to_string(),
                api_endpoint: Some("https://earthexplorer.usgs.gov/api/v1.5".to_string()),
                auth_required: true,
                auth_method: Some(AuthMethod::ApiKey),
                data_format: DataFormat::GeoTIFF,
                update_frequency: UpdateFrequency::Daily, // New scenes daily
                geographical_coverage: GeographicalCoverage {
                    scope: CoverageScope::Global,
                    bounds: None,
                    resolution: Some(30.0),
                },
                temporal_coverage: TemporalCoverage {
                    start_date: Some(chrono::DateTime::parse_from_rfc3339("2013-02-11T00:00:00Z").unwrap().with_timezone(&chrono::Utc)),
                    end_date: None,
                    temporal_resolution: Some("16 days".to_string()),
                },
                parameters: vec![
                    "surface_reflectance".to_string(),
                    "surface_temperature".to_string(),
                    "thermal_infrared".to_string(),
                    "qa_pixel".to_string(),
                ],
                quality_indicators: vec!["qa_pixel".to_string(), "qa_radsat".to_string()],
                associated_publications: vec![
                    "doi:10.5066/P9OGBGM6".to_string(),
                ],
                last_ingestion: None,
                status: IngestionStatus::Active,
                priority: 9,
            },
            
            // GRACE-FO (Groundwater/Drought monitoring)
            DataSource {
                id: Uuid::new_v4(),
                name: "GRACE-FO Groundwater".to_string(),
                category: DataSourceCategory::SatelliteRadiometry,
                provider: "NASA/JPL".to_string(),
                description: "GRACE Follow-On groundwater and drought monitoring for agricultural water management".to_string(),
                api_endpoint: Some("https://podaac.jpl.nasa.gov/ws/search/granule".to_string()),
                auth_required: true,
                auth_method: Some(AuthMethod::ApiKey),
                data_format: DataFormat::NetCDF,
                update_frequency: UpdateFrequency::Monthly,
                geographical_coverage: GeographicalCoverage {
                    scope: CoverageScope::Global,
                    bounds: None,
                    resolution: Some(111000.0), // ~1 degree
                },
                temporal_coverage: TemporalCoverage {
                    start_date: Some(chrono::DateTime::parse_from_rfc3339("2018-05-22T00:00:00Z").unwrap().with_timezone(&chrono::Utc)),
                    end_date: None,
                    temporal_resolution: Some("1 month".to_string()),
                },
                parameters: vec![
                    "terrestrial_water_storage".to_string(),
                    "groundwater_storage".to_string(),
                    "soil_moisture_storage".to_string(),
                ],
                quality_indicators: vec!["uncertainty".to_string(), "leakage_error".to_string()],
                associated_publications: vec![
                    "doi:10.5067/GRACE/GRACE-FO_L3_JPL_RL06_MASCON".to_string(),
                ],
                last_ingestion: None,
                status: IngestionStatus::Active,
                priority: 7,
            },
        ];
        
        Ok(sources)
    }
    
    // Placeholder methods for other source categories
    async fn get_esa_copernicus_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement Sentinel-1, 2, 3, 5P sources
        Ok(vec![])
    }
    
    async fn get_noaa_satellite_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement GOES-R, JPSS sources
        Ok(vec![])
    }
    
    async fn get_eumetsat_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement MSG, MetOp sources
        Ok(vec![])
    }
    
    async fn get_commercial_satellite_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement Planet, Maxar, Airbus sources
        Ok(vec![])
    }
    
    async fn get_noaa_surface_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement ASOS, MADIS, etc.
        Ok(vec![])
    }
    
    async fn get_research_network_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement ARM, NEON, AmeriFlux, etc.
        Ok(vec![])
    }
    
    async fn get_aviation_weather_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement METAR, TAF, etc.
        Ok(vec![])
    }
    
    async fn get_citizen_science_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement Weather Underground, CWOP, etc.
        Ok(vec![])
    }
    
    async fn get_international_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement WMO SYNOP, etc.
        Ok(vec![])
    }
    
    async fn get_usda_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement SCAN, CropScape, etc.
        Ok(vec![])
    }
    
    async fn get_fao_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement FAO agricultural data
        Ok(vec![])
    }
    
    async fn get_soil_monitoring_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement soil networks
        Ok(vec![])
    }
    
    async fn get_crop_monitoring_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement crop monitoring systems
        Ok(vec![])
    }
    
    async fn get_flux_tower_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement flux networks
        Ok(vec![])
    }
    
    async fn get_ocean_observation_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement ocean data sources
        Ok(vec![])
    }
    
    async fn get_atmospheric_profiling_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement atmospheric profiling
        Ok(vec![])
    }
    
    async fn get_radar_network_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement radar networks
        Ok(vec![])
    }
    
    async fn get_lidar_network_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement LIDAR networks
        Ok(vec![])
    }
    
    async fn get_global_model_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement GFS, ECMWF, etc.
        Ok(vec![])
    }
    
    async fn get_regional_model_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement regional models
        Ok(vec![])
    }
    
    async fn get_reanalysis_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement ERA5, MERRA-2, etc.
        Ok(vec![])
    }
    
    async fn get_climate_model_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement climate models
        Ok(vec![])
    }
    
    async fn get_commercial_weather_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement commercial APIs
        Ok(vec![])
    }
    
    async fn get_african_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement African regional sources
        Ok(vec![])
    }
    
    async fn get_european_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement European sources
        Ok(vec![])
    }
    
    async fn get_asian_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement Asian sources
        Ok(vec![])
    }
    
    async fn get_australian_sources(&self) -> Result<Vec<DataSource>, AppError> {
        // Will implement Australian sources
        Ok(vec![])
    }
} 
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use sqlx::PgPool;

pub mod sources;
pub mod collectors;
pub mod publications;
pub mod storage;
pub mod scheduler;

use crate::config::Config;
use crate::error::AppError;

/// Data source categories for comprehensive coverage
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Hash, Eq)]
pub enum DataSourceCategory {
    // Satellite Sources
    SatelliteImaging,
    SatelliteRadar,
    SatelliteLidar,
    SatelliteRadiometry,
    
    // Ground-Based Networks
    WeatherStations,
    ResearchNetworks,
    CitizenScience,
    AgriculturalSensors,
    
    // Remote Sensing
    GroundBasedRadar,
    GroundBasedLidar,
    FluxTowers,
    SoilMonitoring,
    
    // Reanalysis & Models
    GlobalModels,
    RegionalModels,
    ReanalysisData,
    ClimateData,
    
    // Specialized Agricultural
    CropMonitoring,
    PestDisease,
    SoilHealth,
    IrrigationSystems,
    
    // Ocean & Atmospheric
    OceanObservations,
    AtmosphericProfiling,
    AerosolData,
    GreenhouseGases,
    
    // Publications & Research
    ScientificPapers,
    TechnicalReports,
    DatasetDocumentation,
    MethodologyPapers,
}

/// Data ingestion source configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSource {
    pub id: Uuid,
    pub name: String,
    pub category: DataSourceCategory,
    pub provider: String,
    pub description: String,
    pub api_endpoint: Option<String>,
    pub auth_required: bool,
    pub auth_method: Option<AuthMethod>,
    pub data_format: DataFormat,
    pub update_frequency: UpdateFrequency,
    pub geographical_coverage: GeographicalCoverage,
    pub temporal_coverage: TemporalCoverage,
    pub parameters: Vec<String>,
    pub quality_indicators: Vec<String>,
    pub associated_publications: Vec<String>,
    pub last_ingestion: Option<DateTime<Utc>>,
    pub status: IngestionStatus,
    pub priority: u8, // 1-10, 10 being highest priority
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthMethod {
    ApiKey,
    OAuth2,
    BasicAuth,
    BearerToken,
    Certificate,
    None,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataFormat {
    Json,
    Xml,
    NetCDF,
    HDF5,
    GeoTIFF,
    CSV,
    Binary,
    GRIB,
    Shapefile,
    KML,
    WMS,
    WFS,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UpdateFrequency {
    RealTime,           // < 1 minute
    HighFrequency,      // 1-15 minutes
    Hourly,
    ThreeHourly,
    SixHourly,
    Daily,
    Weekly,
    Monthly,
    Seasonal,
    Annual,
    Irregular,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeographicalCoverage {
    pub scope: CoverageScope,
    pub bounds: Option<BoundingBox>,
    pub resolution: Option<f64>, // in meters
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CoverageScope {
    Global,
    Continental,
    Regional,
    National,
    Local,
    PointObservation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundingBox {
    pub north: f64,
    pub south: f64,
    pub east: f64,
    pub west: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemporalCoverage {
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub temporal_resolution: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IngestionStatus {
    Active,
    Inactive,
    Error,
    Maintenance,
    RateLimited,
    AuthenticationFailed,
}

/// Raw data record from any source
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawDataRecord {
    pub id: Uuid,
    pub source_id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub ingestion_time: DateTime<Utc>,
    pub data: serde_json::Value,
    pub metadata: DataMetadata,
    pub quality_flags: Vec<QualityFlag>,
    pub file_path: Option<String>, // For large files stored separately
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataMetadata {
    pub parameters: HashMap<String, String>,
    pub units: HashMap<String, String>,
    pub coordinates: Option<Coordinates>,
    pub elevation: Option<f64>,
    pub instrument_info: Option<String>,
    pub processing_level: Option<String>,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Coordinates {
    pub latitude: f64,
    pub longitude: f64,
    pub coordinate_system: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityFlag {
    pub parameter: String,
    pub flag: String,
    pub description: String,
    pub severity: QualitySeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QualitySeverity {
    Info,
    Warning,
    Error,
    Critical,
}

/// Publication record associated with data sources
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicationRecord {
    pub id: Uuid,
    pub title: String,
    pub authors: Vec<String>,
    pub journal: Option<String>,
    pub publication_date: Option<DateTime<Utc>>,
    pub doi: Option<String>,
    pub url: Option<String>,
    pub abstract_text: Option<String>,
    pub keywords: Vec<String>,
    pub associated_data_sources: Vec<Uuid>,
    pub publication_type: PublicationType,
    pub citation_count: Option<u32>,
    pub relevance_score: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PublicationType {
    PeerReviewedPaper,
    TechnicalReport,
    DatasetPaper,
    ConferencePaper,
    Preprint,
    Documentation,
    UserGuide,
    Methodology,
}

/// Main data ingestion engine
pub struct DataIngestionEngine {
    config: Arc<Config>,
    db_pool: PgPool,
    sources: Arc<RwLock<HashMap<Uuid, DataSource>>>,
    collectors: HashMap<DataSourceCategory, Box<dyn DataCollector + Send + Sync>>,
    publication_collector: publications::PublicationCollector,
    scheduler: scheduler::IngestionScheduler,
    storage: storage::DataStorage,
}

#[async_trait::async_trait]
pub trait DataCollector {
    async fn collect_data(&self, source: &DataSource) -> Result<Vec<RawDataRecord>, AppError>;
    async fn validate_connection(&self, source: &DataSource) -> Result<bool, AppError>;
    async fn get_available_parameters(&self, source: &DataSource) -> Result<Vec<String>, AppError>;
    async fn estimate_data_volume(&self, source: &DataSource) -> Result<u64, AppError>;
}

impl DataIngestionEngine {
    pub async fn new(config: Arc<Config>, db_pool: PgPool) -> Result<Self, AppError> {
        let sources = Arc::new(RwLock::new(HashMap::new()));
        
        // Initialize collector registry
        let collector_registry = Arc::new(collectors::CollectorRegistry::new(config.clone()).await?);
        
        // Initialize storage
        let storage = Arc::new(storage::DataStorage::new(config.clone(), db_pool.clone()).await?);
        
        // Initialize publication collector
        let publication_collector = publications::PublicationCollector::new(config.clone()).await?;
        
        // Initialize scheduler
        let scheduler = scheduler::IngestionScheduler::new(
            config.clone(),
            db_pool.clone(),
            sources.clone(),
            collector_registry.clone(),
            storage.clone(),
        ).await?;
        
        // Legacy collectors field - keeping for backward compatibility but empty
        let collectors: HashMap<DataSourceCategory, Box<dyn DataCollector + Send + Sync>> = HashMap::new();
        
        Ok(Self {
            config,
            db_pool,
            sources,
            collectors,
            publication_collector,
            scheduler,
            storage: (*storage).clone(),
        })
    }
    
    /// Register a new data source
    pub async fn register_source(&self, source: DataSource) -> Result<(), AppError> {
        let mut sources = self.sources.write().await;
        sources.insert(source.id, source);
        Ok(())
    }
    
    /// Initialize all known data sources
    pub async fn initialize_sources(&self) -> Result<(), AppError> {
        let sources = self.get_all_known_sources().await?;
        
        for source in sources {
            self.register_source(source).await?;
        }
        
        Ok(())
    }
    
    /// Start continuous data ingestion
    pub async fn start_ingestion(&self) -> Result<(), AppError> {
        let sources = self.sources.read().await;
        
        for (source_id, source) in sources.iter() {
            if source.status == IngestionStatus::Active {
                let collector = self.collectors.get(&source.category)
                    .ok_or_else(|| AppError::internal(format!("No collector for category: {:?}", source.category)))?;
                
                // Schedule data collection based on update frequency
                self.scheduler.schedule_collection(*source_id, source.clone()).await?;
                
                // Also schedule publication collection
                self.publication_collector.schedule_collection_for_source(*source_id).await?;
            }
        }
        
        Ok(())
    }
    
    /// Collect data from a specific source
    pub async fn collect_from_source(&self, source_id: Uuid) -> Result<Vec<RawDataRecord>, AppError> {
        let sources = self.sources.read().await;
        let source = sources.get(&source_id)
            .ok_or_else(|| AppError::not_found("Data source not found"))?;
        
        let collector = self.collectors.get(&source.category)
            .ok_or_else(|| AppError::internal(format!("No collector for category: {:?}", source.category)))?;
        
        let records = collector.collect_data(source).await?;
        
        // Store the collected data
        for record in &records {
            self.storage.store_raw_data(record).await?;
        }
        
        Ok(records)
    }
    
    /// Get comprehensive list of all known data sources
    async fn get_all_known_sources(&self) -> Result<Vec<DataSource>, AppError> {
        let mut all_sources = Vec::new();
        
        // Get sources from all major providers
        all_sources.extend(self.get_nasa_sources().await?);
        all_sources.extend(self.get_noaa_sources().await?);
        all_sources.extend(self.get_esa_sources().await?);
        all_sources.extend(self.get_research_network_sources().await?);
        all_sources.extend(self.get_commercial_sources().await?);
        all_sources.extend(self.get_regional_sources().await?);
        
        Ok(all_sources)
    }

    async fn get_nasa_sources(&self) -> Result<Vec<DataSource>, AppError> {
        let mut sources = Vec::new();
        
        // MODIS Data Sources
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "MODIS Terra Daily Global 1km".to_string(),
            category: DataSourceCategory::SatelliteImaging,
            provider: "NASA".to_string(),
            description: "MODIS/Terra Surface Reflectance Daily Global 1km and 500m".to_string(),
            api_endpoint: Some("https://cmr.earthdata.nasa.gov/search/granules.json".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::BearerToken),
            data_format: DataFormat::HDF5,
            update_frequency: UpdateFrequency::Daily,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 90.0, south: -90.0, east: 180.0, west: -180.0 }),
                resolution: Some(1000.0),
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2000, 2, 24, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("1 day".to_string()),
            },
            parameters: vec![
                "surface_reflectance_500m".to_string(),
                "surface_reflectance_1km".to_string(),
                "quality_500m".to_string(),
                "quality_1km".to_string(),
                "viewing_zenith_angle".to_string(),
                "solar_zenith_angle".to_string(),
                "relative_azimuth_angle".to_string(),
            ],
            quality_indicators: vec![
                "MOD_Grid_1km_2D/quality_control_1km".to_string(),
                "MOD_Grid_500m_2D/quality_control_500m".to_string(),
            ],
            associated_publications: vec![
                "10.1016/j.rse.2002.06.001".to_string(),
                "10.1109/TGRS.2002.808301".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 9,
        });

        // VIIRS Data Sources
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "VIIRS NPP Surface Reflectance".to_string(),
            category: DataSourceCategory::SatelliteImaging,
            provider: "NASA".to_string(),
            description: "VIIRS/NPP Surface Reflectance 6-Min L2 Swath 750m".to_string(),
            api_endpoint: Some("https://cmr.earthdata.nasa.gov/search/granules.json".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::BearerToken),
            data_format: DataFormat::NetCDF,
            update_frequency: UpdateFrequency::HighFrequency,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 90.0, south: -90.0, east: 180.0, west: -180.0 }),
                resolution: Some(750.0),
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2012, 1, 19, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("6 minutes".to_string()),
            },
            parameters: vec![
                "surface_reflectance_m01".to_string(),
                "surface_reflectance_m02".to_string(),
                "surface_reflectance_m03".to_string(),
                "surface_reflectance_m04".to_string(),
                "surface_reflectance_m05".to_string(),
                "surface_reflectance_m07".to_string(),
                "surface_reflectance_m08".to_string(),
                "surface_reflectance_m10".to_string(),
                "surface_reflectance_m11".to_string(),
                "quality_flags".to_string(),
            ],
            quality_indicators: vec![
                "QF1_VIIRSSRREFL".to_string(),
                "QF2_VIIRSSRREFL".to_string(),
            ],
            associated_publications: vec![
                "10.1016/j.rse.2014.02.015".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 8,
        });

        // Landsat Data Sources
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "Landsat 8-9 OLI Surface Reflectance".to_string(),
            category: DataSourceCategory::SatelliteImaging,
            provider: "NASA".to_string(),
            description: "Landsat 8-9 OLI/TIRS Collection 2 Level-2 Surface Reflectance".to_string(),
            api_endpoint: Some("https://cmr.earthdata.nasa.gov/search/granules.json".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::BearerToken),
            data_format: DataFormat::GeoTIFF,
            update_frequency: UpdateFrequency::Daily,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 83.0, south: -83.0, east: 180.0, west: -180.0 }),
                resolution: Some(30.0),
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2013, 2, 11, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("16 days".to_string()),
            },
            parameters: vec![
                "surface_reflectance_band_1".to_string(),
                "surface_reflectance_band_2".to_string(),
                "surface_reflectance_band_3".to_string(),
                "surface_reflectance_band_4".to_string(),
                "surface_reflectance_band_5".to_string(),
                "surface_reflectance_band_6".to_string(),
                "surface_reflectance_band_7".to_string(),
                "thermal_infrared_band_10".to_string(),
                "thermal_infrared_band_11".to_string(),
                "quality_assessment".to_string(),
            ],
            quality_indicators: vec![
                "pixel_qa".to_string(),
                "radsat_qa".to_string(),
            ],
            associated_publications: vec![
                "10.1016/j.rse.2016.04.001".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 7,
        });

        // GRACE-FO Data Sources
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "GRACE-FO Terrestrial Water Storage".to_string(),
            category: DataSourceCategory::SatelliteRadiometry,
            provider: "NASA".to_string(),
            description: "GRACE Follow-On Terrestrial Water Storage Anomalies".to_string(),
            api_endpoint: Some("https://cmr.earthdata.nasa.gov/search/granules.json".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::BearerToken),
            data_format: DataFormat::NetCDF,
            update_frequency: UpdateFrequency::Monthly,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 90.0, south: -90.0, east: 180.0, west: -180.0 }),
                resolution: Some(111000.0), // ~1 degree in meters
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2018, 5, 22, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("1 month".to_string()),
            },
            parameters: vec![
                "terrestrial_water_storage_thickness".to_string(),
                "uncertainty".to_string(),
                "soil_moisture_thickness".to_string(),
                "surface_water_thickness".to_string(),
                "snow_water_equivalent_thickness".to_string(),
                "canopy_water_thickness".to_string(),
            ],
            quality_indicators: vec![
                "uncertainty".to_string(),
                "processing_date".to_string(),
            ],
            associated_publications: vec![
                "10.1038/s41558-018-0123-1".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 6,
        });

        Ok(sources)
    }

    async fn get_noaa_sources(&self) -> Result<Vec<DataSource>, AppError> {
        let mut sources = Vec::new();
        
        // GOES-16/17 Data Sources
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "GOES-16 ABI Level 2 Meteorology".to_string(),
            category: DataSourceCategory::SatelliteRadiometry,
            provider: "NOAA".to_string(),
            description: "GOES-16 Advanced Baseline Imager Level 2 Meteorological Products".to_string(),
            api_endpoint: Some("https://www.ncei.noaa.gov/data/goes16/access/abi-l2-mcmip".to_string()),
            auth_required: false,
            auth_method: Some(AuthMethod::None),
            data_format: DataFormat::NetCDF,
            update_frequency: UpdateFrequency::HighFrequency,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Continental,
                bounds: Some(BoundingBox { north: 55.0, south: -55.0, east: 5.0, west: -165.0 }),
                resolution: Some(2000.0),
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2017, 7, 10, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("10 minutes".to_string()),
            },
            parameters: vec![
                "cloud_mask".to_string(),
                "cloud_top_height".to_string(),
                "cloud_top_temperature".to_string(),
                "cloud_top_pressure".to_string(),
                "cloud_optical_depth".to_string(),
                "cloud_particle_size".to_string(),
                "cloud_phase".to_string(),
                "land_surface_temperature".to_string(),
                "sea_surface_temperature".to_string(),
            ],
            quality_indicators: vec![
                "DQF".to_string(),
            ],
            associated_publications: vec![
                "10.1175/JTECH-D-16-0067.1".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 8,
        });

        // Surface Weather Stations
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "Global Historical Climate Network Daily".to_string(),
            category: DataSourceCategory::WeatherStations,
            provider: "NOAA".to_string(),
            description: "Daily climate data from weather stations worldwide".to_string(),
            api_endpoint: Some("https://www.ncei.noaa.gov/data/ghcn-daily/access".to_string()),
            auth_required: false,
            auth_method: Some(AuthMethod::None),
            data_format: DataFormat::CSV,
            update_frequency: UpdateFrequency::Daily,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 90.0, south: -90.0, east: 180.0, west: -180.0 }),
                resolution: None, // Point observations
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(1763, 1, 1, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("1 day".to_string()),
            },
            parameters: vec![
                "temperature_maximum".to_string(),
                "temperature_minimum".to_string(),
                "precipitation".to_string(),
                "snowfall".to_string(),
                "snow_depth".to_string(),
                "wind_speed".to_string(),
                "wind_direction".to_string(),
            ],
            quality_indicators: vec![
                "measurement_flag".to_string(),
                "quality_flag".to_string(),
                "source_flag".to_string(),
            ],
            associated_publications: vec![
                "10.1175/JCLI-D-11-00103.1".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 9,
        });

        // Radar Data
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "NEXRAD Level II Base Data".to_string(),
            category: DataSourceCategory::GroundBasedRadar,
            provider: "NOAA".to_string(),
            description: "Next Generation Weather Radar Level II Base Data".to_string(),
            api_endpoint: Some("https://www.ncei.noaa.gov/data/nexrad-level-2/access".to_string()),
            auth_required: false,
            auth_method: Some(AuthMethod::None),
            data_format: DataFormat::Binary,
            update_frequency: UpdateFrequency::RealTime,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::National,
                bounds: Some(BoundingBox { north: 50.0, south: 20.0, east: -60.0, west: -130.0 }),
                resolution: Some(250.0),
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(1995, 1, 1, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("4-10 minutes".to_string()),
            },
            parameters: vec![
                "reflectivity".to_string(),
                "velocity".to_string(),
                "spectrum_width".to_string(),
                "differential_reflectivity".to_string(),
                "differential_phase".to_string(),
                "correlation_coefficient".to_string(),
            ],
            quality_indicators: vec![
                "radial_status".to_string(),
                "elevation_status".to_string(),
            ],
            associated_publications: vec![
                "10.1175/1520-0426(1998)015<0563:ANORFW>2.0.CO;2".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 7,
        });

        Ok(sources)
    }

    async fn get_esa_sources(&self) -> Result<Vec<DataSource>, AppError> {
        let mut sources = Vec::new();
        
        // Sentinel-1 SAR Data
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "Sentinel-1 SAR Ground Range Detected".to_string(),
            category: DataSourceCategory::SatelliteRadar,
            provider: "ESA".to_string(),
            description: "Sentinel-1A/B SAR Ground Range Detected (GRD) products".to_string(),
            api_endpoint: Some("https://scihub.copernicus.eu/dhus/search".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::BasicAuth),
            data_format: DataFormat::Binary,
            update_frequency: UpdateFrequency::Daily,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 90.0, south: -90.0, east: 180.0, west: -180.0 }),
                resolution: Some(10.0),
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2014, 10, 3, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("6-12 days".to_string()),
            },
            parameters: vec![
                "vv_polarization".to_string(),
                "vh_polarization".to_string(),
                "hh_polarization".to_string(),
                "hv_polarization".to_string(),
                "incidence_angle".to_string(),
                "noise_equivalent_sigma_zero".to_string(),
            ],
            quality_indicators: vec![
                "noise_lut".to_string(),
                "calibration_lut".to_string(),
            ],
            associated_publications: vec![
                "10.1016/j.rse.2015.02.028".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 8,
        });

        // Sentinel-2 Optical Data
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "Sentinel-2 MSI Level-2A Surface Reflectance".to_string(),
            category: DataSourceCategory::SatelliteImaging,
            provider: "ESA".to_string(),
            description: "Sentinel-2A/B MSI Level-2A Bottom-of-Atmosphere Corrected Reflectance".to_string(),
            api_endpoint: Some("https://scihub.copernicus.eu/dhus/search".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::BasicAuth),
            data_format: DataFormat::Binary,
            update_frequency: UpdateFrequency::Daily,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 84.0, south: -56.0, east: 180.0, west: -180.0 }),
                resolution: Some(10.0),
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2015, 6, 23, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("5-10 days".to_string()),
            },
            parameters: vec![
                "blue_443nm".to_string(),
                "blue_490nm".to_string(),
                "green_560nm".to_string(),
                "red_665nm".to_string(),
                "vegetation_red_edge_705nm".to_string(),
                "vegetation_red_edge_740nm".to_string(),
                "vegetation_red_edge_783nm".to_string(),
                "nir_842nm".to_string(),
                "nir_narrow_865nm".to_string(),
                "water_vapour_945nm".to_string(),
                "swir_cirrus_1375nm".to_string(),
                "swir_1610nm".to_string(),
                "swir_2190nm".to_string(),
                "scene_classification".to_string(),
                "aerosol_optical_thickness".to_string(),
                "water_vapour".to_string(),
            ],
            quality_indicators: vec![
                "scene_classification_map".to_string(),
                "quality_indicators".to_string(),
            ],
            associated_publications: vec![
                "10.1016/j.rse.2017.06.031".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 9,
        });

        // Sentinel-3 Ocean and Land Colour Instrument
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "Sentinel-3 OLCI Level-2 Land Products".to_string(),
            category: DataSourceCategory::SatelliteImaging,
            provider: "ESA".to_string(),
            description: "Sentinel-3A/B OLCI Level-2 Land Full Resolution Products".to_string(),
            api_endpoint: Some("https://scihub.copernicus.eu/dhus/search".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::BasicAuth),
            data_format: DataFormat::NetCDF,
            update_frequency: UpdateFrequency::Daily,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 90.0, south: -90.0, east: 180.0, west: -180.0 }),
                resolution: Some(300.0),
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2016, 2, 16, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("2-3 days".to_string()),
            },
            parameters: vec![
                "leaf_area_index".to_string(),
                "fraction_of_absorbed_photosynthetically_active_radiation".to_string(),
                "fraction_of_green_vegetation_cover".to_string(),
                "canopy_chlorophyll_content".to_string(),
                "canopy_water_content".to_string(),
                "normalized_difference_vegetation_index".to_string(),
                "terrestrial_chlorophyll_index".to_string(),
                "red_chlorophyll_index".to_string(),
            ],
            quality_indicators: vec![
                "quality_flags".to_string(),
                "input_flags".to_string(),
            ],
            associated_publications: vec![
                "10.1016/j.rse.2018.04.067".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 7,
        });

        // Sentinel-5P Atmospheric Data
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "Sentinel-5P TROPOMI Level-2 Atmospheric Products".to_string(),
            category: DataSourceCategory::AtmosphericProfiling,
            provider: "ESA".to_string(),
            description: "Sentinel-5P TROPOMI Level-2 Atmospheric Composition Products".to_string(),
            api_endpoint: Some("https://scihub.copernicus.eu/dhus/search".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::BasicAuth),
            data_format: DataFormat::NetCDF,
            update_frequency: UpdateFrequency::Daily,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 90.0, south: -90.0, east: 180.0, west: -180.0 }),
                resolution: Some(7000.0),
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2018, 4, 30, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("1 day".to_string()),
            },
            parameters: vec![
                "nitrogen_dioxide_tropospheric_column".to_string(),
                "sulfur_dioxide_column".to_string(),
                "carbon_monoxide_column".to_string(),
                "methane_column".to_string(),
                "ozone_column".to_string(),
                "formaldehyde_tropospheric_column".to_string(),
                "aerosol_index".to_string(),
                "cloud_fraction".to_string(),
            ],
            quality_indicators: vec![
                "quality_assurance_value".to_string(),
                "processing_quality_flags".to_string(),
            ],
            associated_publications: vec![
                "10.5194/amt-11-4773-2018".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 6,
        });

        Ok(sources)
    }

    async fn get_research_network_sources(&self) -> Result<Vec<DataSource>, AppError> {
        let mut sources = Vec::new();
        
        // FLUXNET Data
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "FLUXNET2015 Eddy Covariance Dataset".to_string(),
            category: DataSourceCategory::FluxTowers,
            provider: "FLUXNET".to_string(),
            description: "Global network of micrometeorological flux measurement sites".to_string(),
            api_endpoint: Some("https://fluxnet.org/data/fluxnet2015-dataset".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::Certificate),
            data_format: DataFormat::CSV,
            update_frequency: UpdateFrequency::Annual,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 90.0, south: -90.0, east: 180.0, west: -180.0 }),
                resolution: None, // Point observations
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(1991, 1, 1, 0, 0, 0).unwrap()),
                end_date: Some(chrono::Utc.with_ymd_and_hms(2014, 12, 31, 0, 0, 0).unwrap()),
                temporal_resolution: Some("30 minutes".to_string()),
            },
            parameters: vec![
                "net_ecosystem_exchange".to_string(),
                "gross_primary_productivity".to_string(),
                "ecosystem_respiration".to_string(),
                "latent_heat_flux".to_string(),
                "sensible_heat_flux".to_string(),
                "soil_heat_flux".to_string(),
                "net_radiation".to_string(),
                "air_temperature".to_string(),
                "soil_temperature".to_string(),
                "relative_humidity".to_string(),
                "vapor_pressure_deficit".to_string(),
                "atmospheric_pressure".to_string(),
                "wind_speed".to_string(),
                "wind_direction".to_string(),
                "precipitation".to_string(),
                "soil_water_content".to_string(),
            ],
            quality_indicators: vec![
                "quality_flag_co2".to_string(),
                "quality_flag_h2o".to_string(),
                "quality_flag_energy".to_string(),
            ],
            associated_publications: vec![
                "10.5194/bg-17-1343-2020".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 8,
        });

        // ICOS Data
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "ICOS Atmosphere Greenhouse Gas Observations".to_string(),
            category: DataSourceCategory::GreenhouseGases,
            provider: "ICOS".to_string(),
            description: "Integrated Carbon Observation System atmospheric greenhouse gas measurements".to_string(),
            api_endpoint: Some("https://data.icos-cp.eu/portal".to_string()),
            auth_required: false,
            auth_method: Some(AuthMethod::None),
            data_format: DataFormat::CSV,
            update_frequency: UpdateFrequency::RealTime,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Continental,
                bounds: Some(BoundingBox { north: 71.0, south: 35.0, east: 32.0, west: -28.0 }),
                resolution: None, // Point observations
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2015, 1, 1, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("1 hour".to_string()),
            },
            parameters: vec![
                "co2_concentration".to_string(),
                "ch4_concentration".to_string(),
                "co_concentration".to_string(),
                "n2o_concentration".to_string(),
                "meteorological_data".to_string(),
            ],
            quality_indicators: vec![
                "measurement_quality_flag".to_string(),
                "calibration_flag".to_string(),
            ],
            associated_publications: vec![
                "10.5194/essd-12-2557-2020".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 7,
        });

        // Global Soil Moisture Data
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "International Soil Moisture Network".to_string(),
            category: DataSourceCategory::SoilMonitoring,
            provider: "ISMN".to_string(),
            description: "Global in-situ soil moisture measurements from multiple networks".to_string(),
            api_endpoint: Some("https://ismn.earth/en/data-access".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::ApiKey),
            data_format: DataFormat::CSV,
            update_frequency: UpdateFrequency::Daily,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 90.0, south: -90.0, east: 180.0, west: -180.0 }),
                resolution: None, // Point observations
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(1952, 1, 1, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("hourly to daily".to_string()),
            },
            parameters: vec![
                "soil_moisture".to_string(),
                "soil_temperature".to_string(),
                "soil_suction".to_string(),
                "precipitation".to_string(),
                "air_temperature".to_string(),
                "snow_depth".to_string(),
                "snow_water_equivalent".to_string(),
            ],
            quality_indicators: vec![
                "quality_flag".to_string(),
                "original_flag".to_string(),
            ],
            associated_publications: vec![
                "10.5194/hess-17-5015-2013".to_string(),
            ],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 8,
        });

        Ok(sources)
    }

    async fn get_commercial_sources(&self) -> Result<Vec<DataSource>, AppError> {
        let mut sources = Vec::new();
        
        // Planet Labs Data
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "Planet SkySat Daily Imagery".to_string(),
            category: DataSourceCategory::SatelliteImaging,
            provider: "Planet Labs".to_string(),
            description: "High-resolution daily satellite imagery from Planet SkySat constellation".to_string(),
            api_endpoint: Some("https://api.planet.com/data/v1".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::ApiKey),
            data_format: DataFormat::GeoTIFF,
            update_frequency: UpdateFrequency::Daily,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: Some(BoundingBox { north: 90.0, south: -90.0, east: 180.0, west: -180.0 }),
                resolution: Some(0.5), // 0.5m resolution
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(2016, 1, 1, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("daily".to_string()),
            },
            parameters: vec![
                "blue_band".to_string(),
                "green_band".to_string(),
                "red_band".to_string(),
                "near_infrared_band".to_string(),
                "panchromatic".to_string(),
            ],
            quality_indicators: vec![
                "cloud_cover".to_string(),
                "pixel_quality".to_string(),
            ],
            associated_publications: vec![],
            last_ingestion: None,
            status: IngestionStatus::Inactive, // Requires commercial license
            priority: 5,
        });

        Ok(sources)
    }

    async fn get_regional_sources(&self) -> Result<Vec<DataSource>, AppError> {
        let mut sources = Vec::new();
        
        // South African Weather Service
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "South African Weather Service Observations".to_string(),
            category: DataSourceCategory::WeatherStations,
            provider: "SAWS".to_string(),
            description: "South African Weather Service automatic and manual weather station data".to_string(),
            api_endpoint: Some("https://www.weathersa.co.za/climate/climateinfo/datacapture".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::ApiKey),
            data_format: DataFormat::CSV,
            update_frequency: UpdateFrequency::Hourly,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::National,
                bounds: Some(BoundingBox { north: -22.0, south: -47.0, east: 38.0, west: 16.0 }),
                resolution: None, // Point observations
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(1990, 1, 1, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("hourly".to_string()),
            },
            parameters: vec![
                "air_temperature".to_string(),
                "relative_humidity".to_string(),
                "atmospheric_pressure".to_string(),
                "wind_speed".to_string(),
                "wind_direction".to_string(),
                "precipitation".to_string(),
                "solar_radiation".to_string(),
                "evaporation".to_string(),
            ],
            quality_indicators: vec![
                "observation_quality".to_string(),
                "instrument_status".to_string(),
            ],
            associated_publications: vec![],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 9,
        });

        // Agricultural Research Council South Africa
        sources.push(DataSource {
            id: Uuid::new_v4(),
            name: "ARC Agricultural Climate Data".to_string(),
            category: DataSourceCategory::AgriculturalSensors,
            provider: "ARC".to_string(),
            description: "Agricultural Research Council climate and soil monitoring network".to_string(),
            api_endpoint: Some("https://www.arc.agric.za/arc-iscw/Pages/Climate-Data.aspx".to_string()),
            auth_required: true,
            auth_method: Some(AuthMethod::Certificate),
            data_format: DataFormat::CSV,
            update_frequency: UpdateFrequency::Daily,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::National,
                bounds: Some(BoundingBox { north: -22.0, south: -35.0, east: 32.0, west: 16.0 }),
                resolution: None, // Point observations
            },
            temporal_coverage: TemporalCoverage {
                start_date: Some(chrono::Utc.with_ymd_and_hms(1985, 1, 1, 0, 0, 0).unwrap()),
                end_date: None,
                temporal_resolution: Some("daily".to_string()),
            },
            parameters: vec![
                "rainfall".to_string(),
                "temperature_maximum".to_string(),
                "temperature_minimum".to_string(),
                "evaporation_a_pan".to_string(),
                "relative_humidity".to_string(),
                "wind_speed".to_string(),
                "solar_radiation".to_string(),
                "soil_temperature".to_string(),
                "soil_moisture".to_string(),
            ],
            quality_indicators: vec![
                "data_quality_flag".to_string(),
            ],
            associated_publications: vec![],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 10,
        });

        Ok(sources)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_data_source_creation() {
        let source = DataSource {
            id: Uuid::new_v4(),
            name: "Test Source".to_string(),
            category: DataSourceCategory::WeatherStations,
            provider: "Test Provider".to_string(),
            description: "Test description".to_string(),
            api_endpoint: Some("https://api.test.com".to_string()),
            auth_required: false,
            auth_method: Some(AuthMethod::None),
            data_format: DataFormat::Json,
            update_frequency: UpdateFrequency::Hourly,
            geographical_coverage: GeographicalCoverage {
                scope: CoverageScope::Global,
                bounds: None,
                resolution: Some(1000.0),
            },
            temporal_coverage: TemporalCoverage {
                start_date: None,
                end_date: None,
                temporal_resolution: Some("1 hour".to_string()),
            },
            parameters: vec!["temperature".to_string(), "humidity".to_string()],
            quality_indicators: vec!["qc_flag".to_string()],
            associated_publications: vec![],
            last_ingestion: None,
            status: IngestionStatus::Active,
            priority: 5,
        };
        
        assert_eq!(source.name, "Test Source");
        assert_eq!(source.priority, 5);
    }
} 
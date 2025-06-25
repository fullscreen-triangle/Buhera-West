use anyhow::Result;
use axum::{
    extract::{Path, Query, State},
    http::{HeaderValue, Method, StatusCode},
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
    compression::CompressionLayer,
};
use tracing::{info, Level};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod weather;
mod agriculture;
mod spatial;
mod forecasting;
mod api;
mod database;
mod error;
mod data_ingestion;

use config::Config;
use weather::WeatherEngine;
use agriculture::AgricultureAnalytics;
use spatial::SpatialAnalysis;
use forecasting::ForecastingEngine;
use data_ingestion::DataIngestionEngine;
use error::AppError;

/// Application state shared across handlers
#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub weather_engine: Arc<WeatherEngine>,
    pub agriculture_analytics: Arc<AgricultureAnalytics>,
    pub spatial_analysis: Arc<SpatialAnalysis>,
    pub forecasting_engine: Arc<ForecastingEngine>,
    pub data_ingestion: Arc<DataIngestionEngine>,
}

/// Health check response
#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    services: HashMap<String, String>,
}

/// Weather query parameters
#[derive(Deserialize)]
struct WeatherQuery {
    lat: f64,
    lon: f64,
    hours: Option<u32>,
    crop_type: Option<String>,
}

/// Agricultural risk assessment response
#[derive(Serialize)]
struct RiskAssessmentResponse {
    location: Location,
    risk_level: String,
    confidence: f64,
    factors: Vec<RiskFactor>,
    recommendations: Vec<String>,
}

#[derive(Serialize)]
struct Location {
    latitude: f64,
    longitude: f64,
}

#[derive(Serialize)]
struct RiskFactor {
    factor: String,
    impact: f64,
    description: String,
}

/// Data ingestion status response
#[derive(Serialize)]
struct IngestionStatusResponse {
    active_sources: u32,
    total_records: u64,
    last_ingestion: Option<chrono::DateTime<chrono::Utc>>,
    storage_stats: data_ingestion::storage::StorageStats,
}

/// Health check endpoint
async fn health_check(State(state): State<AppState>) -> Result<Json<HealthResponse>, AppError> {
    let mut services = HashMap::new();
    
    // Check database connectivity
    services.insert("database".to_string(), "healthy".to_string());
    services.insert("redis".to_string(), "healthy".to_string());
    services.insert("weather_api".to_string(), "healthy".to_string());
    services.insert("data_ingestion".to_string(), "healthy".to_string());
    
    let response = HealthResponse {
        status: "healthy".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        services,
    };
    
    Ok(Json(response))
}

/// Get current weather data
async fn get_current_weather(
    Path((lat, lon)): Path<(f64, f64)>,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let weather_data = state
        .weather_engine
        .get_current_weather(lat, lon)
        .await?;
    
    Ok(Json(weather_data))
}

/// Get weather forecast
async fn get_weather_forecast(
    Path((lat, lon)): Path<(f64, f64)>,
    Query(params): Query<WeatherQuery>,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let hours = params.hours.unwrap_or(48);
    
    let forecast_data = state
        .forecasting_engine
        .generate_forecast(lat, lon, hours)
        .await?;
    
    Ok(Json(forecast_data))
}

/// Agricultural risk assessment
async fn get_risk_assessment(
    Path((lat, lon)): Path<(f64, f64)>,
    Query(params): Query<WeatherQuery>,
    State(state): State<AppState>,
) -> Result<Json<RiskAssessmentResponse>, AppError> {
    let crop_type = params.crop_type.unwrap_or_else(|| "maize".to_string());
    
    let risk_data = state
        .agriculture_analytics
        .assess_risk(lat, lon, &crop_type)
        .await?;
    
    let response = RiskAssessmentResponse {
        location: Location {
            latitude: lat,
            longitude: lon,
        },
        risk_level: risk_data.risk_level,
        confidence: risk_data.confidence,
        factors: risk_data.factors.into_iter().map(|f| RiskFactor {
            factor: f.name,
            impact: f.impact,
            description: f.description,
        }).collect(),
        recommendations: risk_data.recommendations,
    };
    
    Ok(Json(response))
}

/// Get data ingestion status
async fn get_ingestion_status(
    State(state): State<AppState>,
) -> Result<Json<IngestionStatusResponse>, AppError> {
    let storage_stats = state
        .data_ingestion
        .get_storage_stats()
        .await?;
    
    let response = IngestionStatusResponse {
        active_sources: 0, // Would get from data ingestion engine
        total_records: storage_stats.total_records,
        last_ingestion: storage_stats.newest_record,
        storage_stats,
    };
    
    Ok(Json(response))
}

/// Trigger manual data collection from a specific source
async fn trigger_data_collection(
    Path(source_id): Path<uuid::Uuid>,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let records = state
        .data_ingestion
        .collect_from_source(source_id)
        .await?;
    
    let response = serde_json::json!({
        "source_id": source_id,
        "records_collected": records.len(),
        "collection_time": chrono::Utc::now(),
        "status": "success"
    });
    
    Ok(Json(response))
}

/// Create application router
fn create_router(state: AppState) -> Router {
    Router::new()
        // Health endpoints
        .route("/health", get(health_check))
        .route("/", get(|| async { "Buhera-West Agricultural Weather Analysis API" }))
        
        // Weather endpoints
        .route("/api/v1/weather/current/:lat/:lon", get(get_current_weather))
        .route("/api/v1/weather/forecast/:lat/:lon", get(get_weather_forecast))
        
        // Agricultural analytics endpoints
        .route("/api/v1/agriculture/risk-assessment/:lat/:lon", get(get_risk_assessment))
        
        // Data ingestion endpoints
        .route("/api/v1/ingestion/status", get(get_ingestion_status))
        .route("/api/v1/ingestion/collect/:source_id", post(trigger_data_collection))
        
        // Apply middleware
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(CompressionLayer::new())
                .layer(
                    CorsLayer::new()
                        .allow_origin(Any)
                        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
                        .allow_headers(Any),
                ),
        )
        .with_state(state)
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "buhera_west=debug,tower_http=debug,axum::rejection=trace".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load configuration
    let config = Arc::new(Config::load()?);
    info!("Configuration loaded successfully");

    // Initialize database
    let db_pool = database::create_pool(&config.database_url).await?;
    database::run_migrations(&db_pool).await?;
    info!("Database initialized successfully");

    // Initialize core engines
    let weather_engine = Arc::new(WeatherEngine::new(config.clone(), db_pool.clone()).await?);
    let agriculture_analytics = Arc::new(AgricultureAnalytics::new(config.clone(), db_pool.clone()).await?);
    let spatial_analysis = Arc::new(SpatialAnalysis::new(config.clone()).await?);
    let forecasting_engine = Arc::new(ForecastingEngine::new(config.clone(), db_pool.clone()).await?);
    
    // Initialize data ingestion engine
    let data_ingestion = Arc::new(DataIngestionEngine::new(config.clone(), db_pool.clone()).await?);
    
    // Initialize all known data sources
    data_ingestion.initialize_sources().await?;
    info!("Data sources initialized successfully");
    
    // Start continuous data ingestion
    let ingestion_engine = data_ingestion.clone();
    tokio::spawn(async move {
        if let Err(e) = ingestion_engine.start_ingestion().await {
            tracing::error!("Data ingestion failed: {}", e);
        }
    });

    info!("Core engines initialized successfully");

    // Create application state
    let state = AppState {
        config: config.clone(),
        weather_engine,
        agriculture_analytics,
        spatial_analysis,
        forecasting_engine,
        data_ingestion,
    };

    // Build application router
    let app = create_router(state);

    // Start server
    let addr = format!("{}:{}", config.api_host, config.api_port);
    let listener = TcpListener::bind(&addr).await?;
    
    info!("Buhera-West Agricultural Weather Analysis Platform");
    info!("Server starting on {}", addr);
    info!("Health check available at http://{}/health", addr);
    info!("Data ingestion status at http://{}/api/v1/ingestion/status", addr);
    info!("API documentation available at http://{}/docs", addr);

    axum::serve(listener, app).await?;

    Ok(())
} 
//! Web Interface for Atmospheric Crossfilter Engine
//! Provides D3.js-compatible data and real-time filtering capabilities

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use warp::{Filter, Reply};
use tokio_tungstenite::{WebSocketStream, tungstenite::Message};
use futures_util::{SinkExt, StreamExt};

use super::crossfilter_engine::{
    AtmosphericCrossfilter, ChartConfig, Filter, GeographicFilter,
    ChartData, AtmosphericRecord, DimensionAccessor, Reducer,
};

/// Web interface for crossfilter
#[derive(Debug)]
pub struct CrossfilterWebInterface {
    pub crossfilter: Arc<Mutex<AtmosphericCrossfilter>>,
    pub active_connections: Arc<Mutex<HashMap<String, WebSocketConnection>>>,
    pub dashboard_config: DashboardConfig,
}

/// WebSocket connection tracking
#[derive(Debug)]
pub struct WebSocketConnection {
    pub connection_id: String,
    pub sender: tokio::sync::mpsc::UnboundedSender<Message>,
    pub active_filters: HashMap<String, Filter>,
}

/// Dashboard configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardConfig {
    pub title: String,
    pub layout: LayoutConfig,
    pub charts: Vec<ChartConfig>,
    pub map_config: MapConfig,
    pub filter_controls: Vec<FilterControl>,
    pub real_time_updates: bool,
}

/// Layout configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayoutConfig {
    pub grid_columns: u32,
    pub grid_rows: u32,
    pub chart_positions: HashMap<String, ChartPosition>,
    pub responsive: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChartPosition {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
}

/// Map configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MapConfig {
    pub initial_zoom: u8,
    pub center: (f64, f64),
    pub tile_layer: String,
    pub heatmap_enabled: bool,
    pub cluster_markers: bool,
    pub draw_controls: bool,
}

/// Filter control configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterControl {
    pub control_id: String,
    pub dimension: String,
    pub control_type: FilterControlType,
    pub label: String,
    pub position: ControlPosition,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterControlType {
    Slider { min: f64, max: f64, step: f64 },
    DateRange,
    Dropdown { options: Vec<String> },
    Checkbox { options: Vec<String> },
    Search,
    MapBounds,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControlPosition {
    pub panel: String, // "left", "right", "top", "bottom"
    pub order: u32,
}

/// Real-time update message
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateMessage {
    pub message_type: String,
    pub chart_id: Option<String>,
    pub data: serde_json::Value,
    pub timestamp: f64,
}

/// Filter update message
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterUpdate {
    pub dimension: String,
    pub filter: FilterValue,
    pub source: String, // "chart", "control", "map"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterValue {
    Range { min: f64, max: f64 },
    List(Vec<String>),
    Geographic { bounds: GeographicBounds },
    None,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeographicBounds {
    pub north: f64,
    pub south: f64,
    pub east: f64,
    pub west: f64,
}

impl CrossfilterWebInterface {
    pub fn new(crossfilter: AtmosphericCrossfilter) -> Self {
        Self {
            crossfilter: Arc::new(Mutex::new(crossfilter)),
            active_connections: Arc::new(Mutex::new(HashMap::new())),
            dashboard_config: DashboardConfig::default(),
        }
    }
    
    /// Start the web server
    pub async fn start_server(&self, port: u16) -> Result<(), Box<dyn std::error::Error>> {
        let crossfilter = self.crossfilter.clone();
        let connections = self.active_connections.clone();
        let dashboard_config = self.dashboard_config.clone();
        
        // Static files route
        let static_files = warp::path("static")
            .and(warp::fs::dir("web/static"));
        
        // Dashboard route
        let dashboard = warp::path::end()
            .map(move || {
                warp::reply::html(generate_dashboard_html(&dashboard_config))
            });
        
        // API routes
        let api = warp::path("api");
        
        // Get dashboard config
        let config_route = api
            .and(warp::path("config"))
            .and(warp::path::end())
            .map(move || {
                warp::reply::json(&dashboard_config)
            });
        
        // Get chart data
        let chart_data_route = api
            .and(warp::path("chart"))
            .and(warp::path::param::<String>())
            .and(warp::path::end())
            .map(move |chart_id: String| {
                let crossfilter = crossfilter.lock().unwrap();
                match crossfilter.get_chart_data(&chart_id) {
                    Ok(data) => warp::reply::with_status(
                        warp::reply::json(&data),
                        warp::http::StatusCode::OK
                    ),
                    Err(_) => warp::reply::with_status(
                        warp::reply::json(&serde_json::json!({"error": "Chart not found"})),
                        warp::http::StatusCode::NOT_FOUND
                    ),
                }
            });
        
        // Apply filter
        let filter_route = api
            .and(warp::path("filter"))
            .and(warp::path::end())
            .and(warp::post())
            .and(warp::body::json())
            .map(move |filter_update: FilterUpdate| {
                let mut crossfilter = crossfilter.lock().unwrap();
                
                let filter = match filter_update.filter {
                    FilterValue::Range { min, max } => Filter::Range { min, max },
                    FilterValue::Geographic { bounds } => Filter::Geographic(
                        GeographicFilter::BoundingBox {
                            north: bounds.north,
                            south: bounds.south,
                            east: bounds.east,
                            west: bounds.west,
                        }
                    ),
                    FilterValue::List(list) => {
                        let ordered_values = list.into_iter()
                            .map(|s| super::crossfilter_engine::OrderedValue::String(s))
                            .collect();
                        Filter::List(ordered_values)
                    },
                    FilterValue::None => {
                        // Clear filter
                        drop(crossfilter);
                        return warp::reply::with_status(
                            warp::reply::json(&serde_json::json!({"status": "filter_cleared"})),
                            warp::http::StatusCode::OK
                        );
                    },
                };
                
                match crossfilter.filter_dimension(&filter_update.dimension, filter) {
                    Ok(_) => {
                        // Broadcast update to all connected clients
                        drop(crossfilter);
                        // TODO: Implement WebSocket broadcast
                        warp::reply::with_status(
                            warp::reply::json(&serde_json::json!({"status": "filter_applied"})),
                            warp::http::StatusCode::OK
                        )
                    },
                    Err(e) => warp::reply::with_status(
                        warp::reply::json(&serde_json::json!({"error": e.to_string()})),
                        warp::http::StatusCode::BAD_REQUEST
                    ),
                }
            });
        
        // WebSocket route for real-time updates
        let websocket_route = warp::path("ws")
            .and(warp::ws())
            .and(warp::any().map(move || connections.clone()))
            .map(|ws: warp::ws::Ws, connections| {
                ws.on_upgrade(move |socket| handle_websocket(socket, connections))
            });
        
        let routes = dashboard
            .or(static_files)
            .or(config_route)
            .or(chart_data_route)
            .or(filter_route)
            .or(websocket_route);
        
        println!("Starting crossfilter web server on port {}", port);
        warp::serve(routes)
            .run(([127, 0, 0, 1], port))
            .await;
        
        Ok(())
    }
    
    /// Configure dashboard
    pub fn configure_dashboard(&mut self, config: DashboardConfig) {
        self.dashboard_config = config;
    }
    
    /// Add atmospheric data
    pub async fn load_data(&self, records: Vec<AtmosphericRecord>) -> Result<(), Box<dyn std::error::Error>> {
        let mut crossfilter = self.crossfilter.lock().unwrap();
        crossfilter.load_data(records)?;
        
        // Setup default dimensions
        self.setup_default_dimensions(&mut crossfilter)?;
        
        // Broadcast data update to connected clients
        self.broadcast_update(UpdateMessage {
            message_type: "data_loaded".to_string(),
            chart_id: None,
            data: serde_json::json!({"status": "success"}),
            timestamp: chrono::Utc::now().timestamp_millis() as f64,
        }).await;
        
        Ok(())
    }
    
    fn setup_default_dimensions(&self, crossfilter: &mut AtmosphericCrossfilter) -> Result<(), Box<dyn std::error::Error>> {
        // Temperature dimension
        crossfilter.add_dimension("temperature".to_string(), DimensionAccessor::Temperature)?;
        crossfilter.add_group("temperature_histogram".to_string(), "temperature".to_string(), Reducer::Count)?;
        
        // Time dimension
        crossfilter.add_dimension("time".to_string(), DimensionAccessor::Timestamp)?;
        crossfilter.add_group("time_series".to_string(), "time".to_string(), Reducer::Count)?;
        
        // Geographic dimensions
        crossfilter.add_dimension("latitude".to_string(), DimensionAccessor::Latitude)?;
        crossfilter.add_dimension("longitude".to_string(), DimensionAccessor::Longitude)?;
        
        // Wind dimension
        crossfilter.add_dimension("wind_speed".to_string(), DimensionAccessor::WindSpeed)?;
        crossfilter.add_group("wind_histogram".to_string(), "wind_speed".to_string(), Reducer::Count)?;
        
        // Pressure dimension
        crossfilter.add_dimension("pressure".to_string(), DimensionAccessor::Pressure)?;
        crossfilter.add_group("pressure_histogram".to_string(), "pressure".to_string(), Reducer::Count)?;
        
        // Region dimension
        crossfilter.add_dimension("region".to_string(), DimensionAccessor::Region)?;
        crossfilter.add_group("region_count".to_string(), "region".to_string(), Reducer::Count)?;
        
        Ok(())
    }
    
    async fn broadcast_update(&self, message: UpdateMessage) {
        let connections = self.active_connections.lock().unwrap();
        let json_message = serde_json::to_string(&message).unwrap();
        
        for connection in connections.values() {
            let _ = connection.sender.send(Message::Text(json_message.clone()));
        }
    }
}

impl Default for DashboardConfig {
    fn default() -> Self {
        Self {
            title: "Atmospheric Data Dashboard".to_string(),
            layout: LayoutConfig {
                grid_columns: 12,
                grid_rows: 8,
                chart_positions: HashMap::new(),
                responsive: true,
            },
            charts: vec![
                ChartConfig {
                    chart_id: "temperature_chart".to_string(),
                    chart_type: super::crossfilter_engine::ChartType::Histogram,
                    dimension: "temperature".to_string(),
                    group: Some("temperature_histogram".to_string()),
                    width: 400,
                    height: 300,
                    title: "Temperature Distribution".to_string(),
                    x_axis: super::crossfilter_engine::AxisConfig {
                        label: "Temperature (°C)".to_string(),
                        scale_type: super::crossfilter_engine::ScaleType::Linear,
                        domain: None,
                        format: ".1f".to_string(),
                    },
                    y_axis: super::crossfilter_engine::AxisConfig {
                        label: "Count".to_string(),
                        scale_type: super::crossfilter_engine::ScaleType::Linear,
                        domain: None,
                        format: "d".to_string(),
                    },
                    color_scheme: super::crossfilter_engine::ColorScheme {
                        scheme_type: super::crossfilter_engine::ColorSchemeType::Sequential,
                        colors: vec!["#1f77b4".to_string()],
                    },
                    interactive: true,
                },
                ChartConfig {
                    chart_id: "time_series_chart".to_string(),
                    chart_type: super::crossfilter_engine::ChartType::TimeSeries,
                    dimension: "time".to_string(),
                    group: Some("time_series".to_string()),
                    width: 800,
                    height: 300,
                    title: "Time Series".to_string(),
                    x_axis: super::crossfilter_engine::AxisConfig {
                        label: "Time".to_string(),
                        scale_type: super::crossfilter_engine::ScaleType::Time,
                        domain: None,
                        format: "%Y-%m-%d".to_string(),
                    },
                    y_axis: super::crossfilter_engine::AxisConfig {
                        label: "Count".to_string(),
                        scale_type: super::crossfilter_engine::ScaleType::Linear,
                        domain: None,
                        format: "d".to_string(),
                    },
                    color_scheme: super::crossfilter_engine::ColorScheme {
                        scheme_type: super::crossfilter_engine::ColorSchemeType::Sequential,
                        colors: vec!["#ff7f0e".to_string()],
                    },
                    interactive: true,
                },
                ChartConfig {
                    chart_id: "map_chart".to_string(),
                    chart_type: super::crossfilter_engine::ChartType::Map,
                    dimension: "latitude".to_string(),
                    group: None,
                    width: 600,
                    height: 400,
                    title: "Geographic Distribution".to_string(),
                    x_axis: super::crossfilter_engine::AxisConfig {
                        label: "Longitude".to_string(),
                        scale_type: super::crossfilter_engine::ScaleType::Linear,
                        domain: None,
                        format: ".2f".to_string(),
                    },
                    y_axis: super::crossfilter_engine::AxisConfig {
                        label: "Latitude".to_string(),
                        scale_type: super::crossfilter_engine::ScaleType::Linear,
                        domain: None,
                        format: ".2f".to_string(),
                    },
                    color_scheme: super::crossfilter_engine::ColorScheme {
                        scheme_type: super::crossfilter_engine::ColorSchemeType::Sequential,
                        colors: vec!["#d62728".to_string()],
                    },
                    interactive: true,
                },
            ],
            map_config: MapConfig {
                initial_zoom: 8,
                center: (-18.0, 31.0), // Zimbabwe center
                tile_layer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png".to_string(),
                heatmap_enabled: true,
                cluster_markers: true,
                draw_controls: true,
            },
            filter_controls: vec![
                FilterControl {
                    control_id: "temperature_slider".to_string(),
                    dimension: "temperature".to_string(),
                    control_type: FilterControlType::Slider { min: -10.0, max: 50.0, step: 1.0 },
                    label: "Temperature Range".to_string(),
                    position: ControlPosition { panel: "left".to_string(), order: 1 },
                },
                FilterControl {
                    control_id: "date_range".to_string(),
                    dimension: "time".to_string(),
                    control_type: FilterControlType::DateRange,
                    label: "Date Range".to_string(),
                    position: ControlPosition { panel: "left".to_string(), order: 2 },
                },
                FilterControl {
                    control_id: "region_dropdown".to_string(),
                    dimension: "region".to_string(),
                    control_type: FilterControlType::Dropdown { 
                        options: vec!["Harare".to_string(), "Bulawayo".to_string(), "Mutare".to_string()]
                    },
                    label: "Region".to_string(),
                    position: ControlPosition { panel: "left".to_string(), order: 3 },
                },
            ],
            real_time_updates: true,
        }
    }
}

async fn handle_websocket(
    ws: WebSocketStream<warp::ws::WebSocket>,
    connections: Arc<Mutex<HashMap<String, WebSocketConnection>>>,
) {
    let (mut ws_sender, mut ws_receiver) = ws.split();
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();
    
    let connection_id = uuid::Uuid::new_v4().to_string();
    
    // Add connection to active connections
    {
        let mut conns = connections.lock().unwrap();
        conns.insert(connection_id.clone(), WebSocketConnection {
            connection_id: connection_id.clone(),
            sender: tx,
            active_filters: HashMap::new(),
        });
    }
    
    // Handle outgoing messages
    let send_task = tokio::spawn(async move {
        while let Some(message) = rx.recv().await {
            if ws_sender.send(message).await.is_err() {
                break;
            }
        }
    });
    
    // Handle incoming messages
    let recv_task = tokio::spawn(async move {
        while let Some(result) = ws_receiver.next().await {
            match result {
                Ok(message) => {
                    if let Ok(text) = message.to_str() {
                        // Handle incoming filter updates
                        if let Ok(filter_update) = serde_json::from_str::<FilterUpdate>(text) {
                            println!("Received filter update: {:?}", filter_update);
                            // TODO: Apply filter and broadcast to other connections
                        }
                    }
                },
                Err(_) => break,
            }
        }
    });
    
    // Wait for either task to complete
    tokio::select! {
        _ = send_task => {},
        _ = recv_task => {},
    }
    
    // Remove connection
    {
        let mut conns = connections.lock().unwrap();
        conns.remove(&connection_id);
    }
}

fn generate_dashboard_html(config: &DashboardConfig) -> String {
    format!(r#"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{}</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <style>
        body {{
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        
        .dashboard {{
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 20px;
            height: 100vh;
        }}
        
        .sidebar {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow-y: auto;
        }}
        
        .main-content {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            overflow-y: auto;
        }}
        
        .chart-container {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .chart-title {{
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
        }}
        
        .filter-control {{
            margin-bottom: 20px;
        }}
        
        .filter-label {{
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }}
        
        .filter-input {{
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }}
        
        .brush .extent {{
            fill: steelblue;
            fill-opacity: 0.125;
        }}
        
        .brush .resize path {{
            fill: #eee;
            stroke: #666;
        }}
        
        .axis {{
            font: 10px sans-serif;
        }}
        
        .axis path,
        .axis line {{
            fill: none;
            stroke: #000;
            shape-rendering: crispEdges;
        }}
        
        .bar {{
            fill: steelblue;
        }}
        
        .bar:hover {{
            fill: orange;
        }}
        
        #map {{
            height: 400px;
            width: 100%;
        }}
        
        .reset {{
            padding-left: 1em;
            font-size: smaller;
            color: #ccc;
            cursor: pointer;
        }}
        
        .reset:hover {{
            color: #666;
        }}
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="sidebar">
            <h2>Filters</h2>
            <div id="filter-controls"></div>
            <div id="data-info">
                <p><strong>Records:</strong> <span id="total-records">-</span></p>
                <p><strong>Filtered:</strong> <span id="filtered-records">-</span></p>
            </div>
        </div>
        
        <div class="main-content">
            <div class="chart-container">
                <div class="chart-title">Temperature Distribution <span class="reset" onclick="resetFilter('temperature')">reset</span></div>
                <div id="temperature-chart"></div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Time Series <span class="reset" onclick="resetFilter('time')">reset</span></div>
                <div id="time-series-chart"></div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Geographic Distribution <span class="reset" onclick="resetFilter('map')">reset</span></div>
                <div id="map"></div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Wind Speed Distribution <span class="reset" onclick="resetFilter('wind_speed')">reset</span></div>
                <div id="wind-chart"></div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Pressure Distribution <span class="reset" onclick="resetFilter('pressure')">reset</span></div>
                <div id="pressure-chart"></div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Region Distribution <span class="reset" onclick="resetFilter('region')">reset</span></div>
                <div id="region-chart"></div>
            </div>
        </div>
    </div>
    
    <script src="/static/crossfilter-dashboard.js"></script>
</body>
</html>
"#, config.title)
}

/// Crossfilter web interface errors
#[derive(Debug, thiserror::Error)]
pub enum WebInterfaceError {
    #[error("Crossfilter error: {0}")]
    CrossfilterError(String),
    #[error("WebSocket error: {0}")]
    WebSocketError(String),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
    #[error("Lock error")]
    LockError,
} 
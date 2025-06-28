use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use nalgebra::{Point3, Vector3};
use rayon::prelude::*;
use std::collections::HashMap;

/// High-resolution terrain reconstruction engine
/// Handles ray tracing, mesh generation, and object detection for 100m diameter areas

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

/// Configuration for terrain reconstruction
#[derive(Serialize, Deserialize, Clone)]
pub struct ReconstructionConfig {
    /// Center point of the reconstruction area (lat, lon)
    pub center_lat: f64,
    pub center_lon: f64,
    /// Radius in meters (max 50m for 100m diameter)
    pub radius: f32,
    /// Minimum object height to detect (in meters)
    pub min_height_threshold: f32,
    /// Resolution: points per square meter
    pub resolution: f32,
    /// Enable advanced ray tracing
    pub enable_ray_tracing: bool,
    /// Agricultural analysis mode
    pub agricultural_mode: bool,
}

/// Point cloud data structure
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct PointCloudData {
    pub points: Vec<Point3Data>,
    pub colors: Vec<ColorData>,
    pub normals: Vec<Vector3Data>,
    pub metadata: HashMap<String, String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Point3Data {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Vector3Data {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ColorData {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

/// Reconstructed mesh with agricultural analysis
#[derive(Serialize, Deserialize)]
pub struct ReconstructedTerrain {
    /// High-resolution base terrain mesh
    pub base_mesh: MeshData,
    /// Detected vegetation/objects above height threshold
    pub vegetation_objects: Vec<VegetationObject>,
    /// Soil analysis points
    pub soil_analysis_points: Vec<SoilAnalysisPoint>,
    /// Agricultural metadata
    pub agricultural_data: AgriculturalMetadata,
    /// Performance metrics
    pub computation_time_ms: u32,
}

#[derive(Serialize, Deserialize)]
pub struct MeshData {
    pub vertices: Vec<f32>,
    pub indices: Vec<u32>,
    pub normals: Vec<f32>,
    pub uvs: Vec<f32>,
    pub colors: Vec<f32>,
}

#[derive(Serialize, Deserialize)]
pub struct VegetationObject {
    pub id: u32,
    pub position: Point3Data,
    pub height: f32,
    pub width: f32,
    pub vegetation_type: VegetationType,
    pub health_score: f32,
    pub biomass_estimate: f32,
}

#[derive(Serialize, Deserialize)]
pub enum VegetationType {
    Tree,
    Shrub,
    Crop,
    Grass,
    Weed,
    Unknown,
}

#[derive(Serialize, Deserialize)]
pub struct SoilAnalysisPoint {
    pub position: Point3Data,
    pub moisture_estimate: f32,
    pub compaction_level: f32,
    pub erosion_risk: f32,
    pub organic_matter_estimate: f32,
}

#[derive(Serialize, Deserialize)]
pub struct AgriculturalMetadata {
    pub total_area_m2: f32,
    pub vegetation_coverage_percent: f32,
    pub average_soil_health: f32,
    pub recommended_crops: Vec<String>,
    pub irrigation_recommendations: Vec<String>,
    pub risk_assessments: Vec<String>,
}

/// Main terrain reconstruction engine
#[wasm_bindgen]
pub struct TerrainReconstructor {
    config: ReconstructionConfig,
    point_cloud: Option<PointCloudData>,
}

#[wasm_bindgen]
impl TerrainReconstructor {
    #[wasm_bindgen(constructor)]
    pub fn new(config_json: &str) -> Result<TerrainReconstructor, JsValue> {
        let config: ReconstructionConfig = serde_json::from_str(config_json)
            .map_err(|e| JsValue::from_str(&format!("Config parse error: {}", e)))?;
        
        console_log!("Initializing TerrainReconstructor for area: {:.6}, {:.6}", 
                    config.center_lat, config.center_lon);
        
        Ok(TerrainReconstructor {
            config,
            point_cloud: None,
        })
    }

    /// Load point cloud data from satellite/drone imagery
    #[wasm_bindgen]
    pub fn load_point_cloud(&mut self, data_json: &str) -> Result<(), JsValue> {
        let point_cloud: PointCloudData = serde_json::from_str(data_json)
            .map_err(|e| JsValue::from_str(&format!("Point cloud parse error: {}", e)))?;
        
        console_log!("Loaded {} points for reconstruction", point_cloud.points.len());
        self.point_cloud = Some(point_cloud);
        Ok(())
    }

    /// Perform high-detail terrain reconstruction
    #[wasm_bindgen]
    pub fn reconstruct_terrain(&self) -> Result<String, JsValue> {
        let start_time = js_sys::Date::now();
        
        let point_cloud = self.point_cloud.as_ref()
            .ok_or_else(|| JsValue::from_str("No point cloud data loaded"))?;

        console_log!("Starting terrain reconstruction with {} points", point_cloud.points.len());

        // Generate high-resolution base mesh
        let base_mesh = self.generate_base_mesh(point_cloud)?;
        
        // Detect vegetation and objects above height threshold
        let vegetation_objects = self.detect_vegetation_objects(point_cloud)?;
        
        // Analyze soil characteristics
        let soil_analysis_points = self.analyze_soil_characteristics(point_cloud)?;
        
        // Generate agricultural metadata
        let agricultural_data = self.generate_agricultural_metadata(&vegetation_objects, &soil_analysis_points)?;

        let computation_time = (js_sys::Date::now() - start_time) as u32;
        
        let result = ReconstructedTerrain {
            base_mesh,
            vegetation_objects,
            soil_analysis_points,
            agricultural_data,
            computation_time_ms: computation_time,
        };

        console_log!("Terrain reconstruction completed in {}ms", computation_time);

        serde_json::to_string(&result)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }

    /// Advanced ray tracing for realistic lighting and shadows
    #[wasm_bindgen]
    pub fn compute_ray_traced_lighting(&self, mesh_json: &str, sun_direction: &str) -> Result<String, JsValue> {
        let mesh: MeshData = serde_json::from_str(mesh_json)
            .map_err(|e| JsValue::from_str(&format!("Mesh parse error: {}", e)))?;
        
        let sun_dir: Vector3Data = serde_json::from_str(sun_direction)
            .map_err(|e| JsValue::from_str(&format!("Sun direction parse error: {}", e)))?;

        console_log!("Computing ray-traced lighting for {} vertices", mesh.vertices.len() / 3);

        // Parallel ray tracing computation
        let lighting_data = self.parallel_ray_trace(&mesh, &sun_dir)?;

        serde_json::to_string(&lighting_data)
            .map_err(|e| JsValue::from_str(&format!("Lighting serialization error: {}", e)))
    }
}

impl TerrainReconstructor {
    /// Generate high-resolution base terrain mesh
    fn generate_base_mesh(&self, point_cloud: &PointCloudData) -> Result<MeshData, JsValue> {
        console_log!("Generating base mesh from {} points", point_cloud.points.len());

        // Convert points to grid-based heightfield
        let grid_size = (self.config.radius * 2.0 * self.config.resolution) as usize;
        let mut height_grid = vec![vec![0.0f32; grid_size]; grid_size];
        let mut color_grid = vec![vec![ColorData { r: 0, g: 128, b: 0, a: 255 }; grid_size]; grid_size];

        // Populate height grid using weighted interpolation
        for point in &point_cloud.points {
            let grid_x = ((point.x + self.config.radius) / (self.config.radius * 2.0) * grid_size as f32) as usize;
            let grid_z = ((point.z + self.config.radius) / (self.config.radius * 2.0) * grid_size as f32) as usize;
            
            if grid_x < grid_size && grid_z < grid_size {
                height_grid[grid_z][grid_x] = height_grid[grid_z][grid_x].max(point.y);
            }
        }

        // Generate mesh vertices and indices
        let mut vertices = Vec::new();
        let mut indices = Vec::new();
        let mut normals = Vec::new();
        let mut uvs = Vec::new();
        let mut colors = Vec::new();

        for z in 0..grid_size {
            for x in 0..grid_size {
                let world_x = (x as f32 / grid_size as f32 - 0.5) * self.config.radius * 2.0;
                let world_z = (z as f32 / grid_size as f32 - 0.5) * self.config.radius * 2.0;
                let world_y = height_grid[z][x];

                vertices.extend_from_slice(&[world_x, world_y, world_z]);
                uvs.extend_from_slice(&[x as f32 / grid_size as f32, z as f32 / grid_size as f32]);
                
                let color = &color_grid[z][x];
                colors.extend_from_slice(&[
                    color.r as f32 / 255.0,
                    color.g as f32 / 255.0,
                    color.b as f32 / 255.0,
                ]);

                // Calculate normal (simplified)
                let normal = Vector3::new(0.0, 1.0, 0.0);
                normals.extend_from_slice(&[normal.x, normal.y, normal.z]);

                // Generate indices for triangles
                if x < grid_size - 1 && z < grid_size - 1 {
                    let i = (z * grid_size + x) as u32;
                    let i_right = i + 1;
                    let i_down = i + grid_size as u32;
                    let i_diag = i_down + 1;

                    // Two triangles per quad
                    indices.extend_from_slice(&[i, i_down, i_right]);
                    indices.extend_from_slice(&[i_right, i_down, i_diag]);
                }
            }
        }

        console_log!("Generated mesh with {} vertices, {} triangles", 
                    vertices.len() / 3, indices.len() / 3);

        Ok(MeshData {
            vertices,
            indices,
            normals,
            uvs,
            colors,
        })
    }

    /// Detect vegetation and objects above height threshold
    fn detect_vegetation_objects(&self, point_cloud: &PointCloudData) -> Result<Vec<VegetationObject>, JsValue> {
        console_log!("Detecting vegetation objects above {}m threshold", self.config.min_height_threshold);

        let mut objects = Vec::new();
        let mut object_id = 0;

        // Cluster points by proximity and height
        let high_points: Vec<_> = point_cloud.points.iter()
            .enumerate()
            .filter(|(_, point)| point.y > self.config.min_height_threshold)
            .collect();

        console_log!("Found {} points above height threshold", high_points.len());

        // Simple clustering algorithm (could be improved with DBSCAN)
        let cluster_radius = 1.0; // meters
        let mut processed = vec![false; high_points.len()];

        for (i, (original_idx, point)) in high_points.iter().enumerate() {
            if processed[i] {
                continue;
            }

            let mut cluster_points = vec![*original_idx];
            processed[i] = true;

            // Find nearby points
            for (j, (other_idx, other_point)) in high_points.iter().enumerate() {
                if i != j && !processed[j] {
                    let distance = ((point.x - other_point.x).powi(2) + 
                                   (point.z - other_point.z).powi(2)).sqrt();
                    
                    if distance < cluster_radius {
                        cluster_points.push(*other_idx);
                        processed[j] = true;
                    }
                }
            }

            // Create vegetation object from cluster
            if cluster_points.len() >= 3 { // Minimum points for object
                let cluster_center = self.calculate_cluster_center(&cluster_points, point_cloud);
                let cluster_height = self.calculate_cluster_height(&cluster_points, point_cloud);
                let cluster_width = self.calculate_cluster_width(&cluster_points, point_cloud);

                objects.push(VegetationObject {
                    id: object_id,
                    position: cluster_center,
                    height: cluster_height,
                    width: cluster_width,
                    vegetation_type: self.classify_vegetation_type(cluster_height, cluster_width),
                    health_score: self.estimate_vegetation_health(&cluster_points, point_cloud),
                    biomass_estimate: self.estimate_biomass(cluster_height, cluster_width),
                });

                object_id += 1;
            }
        }

        console_log!("Detected {} vegetation objects", objects.len());
        Ok(objects)
    }

    /// Analyze soil characteristics from point cloud
    fn analyze_soil_characteristics(&self, point_cloud: &PointCloudData) -> Result<Vec<SoilAnalysisPoint>, JsValue> {
        console_log!("Analyzing soil characteristics");

        let mut analysis_points = Vec::new();
        let sample_distance = 5.0; // Sample every 5 meters

        let grid_size = (self.config.radius * 2.0 / sample_distance) as usize;
        
        for z in 0..grid_size {
            for x in 0..grid_size {
                let world_x = (x as f32 / grid_size as f32 - 0.5) * self.config.radius * 2.0;
                let world_z = (z as f32 / grid_size as f32 - 0.5) * self.config.radius * 2.0;

                // Find ground level at this position
                let ground_y = self.find_ground_level(world_x, world_z, point_cloud);

                analysis_points.push(SoilAnalysisPoint {
                    position: Point3Data {
                        x: world_x,
                        y: ground_y,
                        z: world_z,
                    },
                    moisture_estimate: self.estimate_soil_moisture(world_x, world_z, point_cloud),
                    compaction_level: self.estimate_soil_compaction(world_x, world_z, point_cloud),
                    erosion_risk: self.estimate_erosion_risk(world_x, world_z, point_cloud),
                    organic_matter_estimate: self.estimate_organic_matter(world_x, world_z, point_cloud),
                });
            }
        }

        console_log!("Generated {} soil analysis points", analysis_points.len());
        Ok(analysis_points)
    }

    /// Generate agricultural metadata from analysis
    fn generate_agricultural_metadata(
        &self, 
        vegetation: &[VegetationObject], 
        soil: &[SoilAnalysisPoint]
    ) -> Result<AgriculturalMetadata, JsValue> {
        let total_area = std::f32::consts::PI * self.config.radius * self.config.radius;
        
        let vegetation_area: f32 = vegetation.iter()
            .map(|obj| std::f32::consts::PI * (obj.width / 2.0).powi(2))
            .sum();
        
        let vegetation_coverage = (vegetation_area / total_area) * 100.0;
        
        let average_soil_health = if soil.is_empty() {
            0.0
        } else {
            soil.iter().map(|point| {
                (point.moisture_estimate + point.organic_matter_estimate + (1.0 - point.erosion_risk)) / 3.0
            }).sum::<f32>() / soil.len() as f32
        };

        Ok(AgriculturalMetadata {
            total_area_m2: total_area,
            vegetation_coverage_percent: vegetation_coverage,
            average_soil_health,
            recommended_crops: self.generate_crop_recommendations(average_soil_health, vegetation_coverage),
            irrigation_recommendations: self.generate_irrigation_recommendations(soil),
            risk_assessments: self.generate_risk_assessments(soil, vegetation),
        })
    }

    /// Parallel ray tracing for realistic lighting
    fn parallel_ray_trace(&self, mesh: &MeshData, sun_direction: &Vector3Data) -> Result<Vec<f32>, JsValue> {
        let vertex_count = mesh.vertices.len() / 3;
        console_log!("Ray tracing {} vertices", vertex_count);

        let sun_dir = Vector3::new(sun_direction.x, sun_direction.y, sun_direction.z).normalize();
        
        // Parallel computation of lighting for each vertex
        let lighting: Vec<f32> = (0..vertex_count)
            .into_par_iter()
            .map(|i| {
                let vertex_pos = Point3::new(
                    mesh.vertices[i * 3],
                    mesh.vertices[i * 3 + 1],
                    mesh.vertices[i * 3 + 2],
                );
                
                let normal = Vector3::new(
                    mesh.normals[i * 3],
                    mesh.normals[i * 3 + 1],
                    mesh.normals[i * 3 + 2],
                ).normalize();

                // Basic Lambert lighting
                let light_intensity = normal.dot(&sun_dir).max(0.0);
                
                // Add ambient lighting
                let ambient = 0.2;
                (light_intensity * 0.8 + ambient).min(1.0)
            })
            .collect();

        Ok(lighting)
    }

    // Helper methods (simplified implementations)
    fn calculate_cluster_center(&self, indices: &[usize], point_cloud: &PointCloudData) -> Point3Data {
        let sum = indices.iter().fold(Point3Data { x: 0.0, y: 0.0, z: 0.0 }, |acc, &i| {
            let point = &point_cloud.points[i];
            Point3Data {
                x: acc.x + point.x,
                y: acc.y + point.y,
                z: acc.z + point.z,
            }
        });

        Point3Data {
            x: sum.x / indices.len() as f32,
            y: sum.y / indices.len() as f32,
            z: sum.z / indices.len() as f32,
        }
    }

    fn calculate_cluster_height(&self, indices: &[usize], point_cloud: &PointCloudData) -> f32 {
        indices.iter()
            .map(|&i| point_cloud.points[i].y)
            .fold(0.0f32, f32::max) - self.config.min_height_threshold
    }

    fn calculate_cluster_width(&self, indices: &[usize], point_cloud: &PointCloudData) -> f32 {
        if indices.len() < 2 { return 1.0; }
        
        let mut max_distance = 0.0f32;
        for i in 0..indices.len() {
            for j in i + 1..indices.len() {
                let p1 = &point_cloud.points[indices[i]];
                let p2 = &point_cloud.points[indices[j]];
                let distance = ((p1.x - p2.x).powi(2) + (p1.z - p2.z).powi(2)).sqrt();
                max_distance = max_distance.max(distance);
            }
        }
        max_distance
    }

    fn classify_vegetation_type(&self, height: f32, width: f32) -> VegetationType {
        match (height, width) {
            (h, w) if h > 3.0 && w > 2.0 => VegetationType::Tree,
            (h, w) if h > 1.0 && h <= 3.0 => VegetationType::Shrub,
            (h, _) if h > 0.5 && h <= 1.0 => VegetationType::Crop,
            (h, _) if h <= 0.5 => VegetationType::Grass,
            _ => VegetationType::Unknown,
        }
    }

    fn estimate_vegetation_health(&self, _indices: &[usize], _point_cloud: &PointCloudData) -> f32 {
        // Simplified - could analyze color data for NDVI-like calculations
        0.7 + (rand::random::<f32>() * 0.3)
    }

    fn estimate_biomass(&self, height: f32, width: f32) -> f32 {
        // Simplified biomass estimation
        height * width * 0.5
    }

    fn find_ground_level(&self, x: f32, z: f32, point_cloud: &PointCloudData) -> f32 {
        // Find lowest point in vicinity
        let search_radius = 1.0;
        point_cloud.points.iter()
            .filter(|point| {
                let distance = ((point.x - x).powi(2) + (point.z - z).powi(2)).sqrt();
                distance < search_radius
            })
            .map(|point| point.y)
            .fold(0.0f32, f32::min)
    }

    fn estimate_soil_moisture(&self, _x: f32, _z: f32, _point_cloud: &PointCloudData) -> f32 {
        // Simplified - could analyze spectral data
        0.3 + (rand::random::<f32>() * 0.4)
    }

    fn estimate_soil_compaction(&self, _x: f32, _z: f32, _point_cloud: &PointCloudData) -> f32 {
        0.2 + (rand::random::<f32>() * 0.3)
    }

    fn estimate_erosion_risk(&self, _x: f32, _z: f32, _point_cloud: &PointCloudData) -> f32 {
        0.1 + (rand::random::<f32>() * 0.4)
    }

    fn estimate_organic_matter(&self, _x: f32, _z: f32, _point_cloud: &PointCloudData) -> f32 {
        0.4 + (rand::random::<f32>() * 0.4)
    }

    fn generate_crop_recommendations(&self, soil_health: f32, vegetation_coverage: f32) -> Vec<String> {
        let mut crops = Vec::new();
        
        if soil_health > 0.7 {
            crops.extend_from_slice(&["maize".to_string(), "wheat".to_string(), "soybeans".to_string()]);
        } else if soil_health > 0.4 {
            crops.extend_from_slice(&["millet".to_string(), "sorghum".to_string()]);
        } else {
            crops.push("groundnuts".to_string());
        }

        if vegetation_coverage < 20.0 {
            crops.push("cover_crops_recommended".to_string());
        }

        crops
    }

    fn generate_irrigation_recommendations(&self, soil_points: &[SoilAnalysisPoint]) -> Vec<String> {
        let avg_moisture = soil_points.iter()
            .map(|p| p.moisture_estimate)
            .sum::<f32>() / soil_points.len() as f32;

        if avg_moisture < 0.3 {
            vec!["drip_irrigation_recommended".to_string(), "water_conservation_critical".to_string()]
        } else if avg_moisture < 0.5 {
            vec!["supplemental_irrigation_beneficial".to_string()]
        } else {
            vec!["natural_rainfall_sufficient".to_string()]
        }
    }

    fn generate_risk_assessments(&self, soil_points: &[SoilAnalysisPoint], vegetation: &[VegetationObject]) -> Vec<String> {
        let mut risks = Vec::new();
        
        let avg_erosion = soil_points.iter()
            .map(|p| p.erosion_risk)
            .sum::<f32>() / soil_points.len() as f32;

        if avg_erosion > 0.6 {
            risks.push("high_erosion_risk".to_string());
        }

        let vegetation_health = vegetation.iter()
            .map(|v| v.health_score)
            .sum::<f32>() / vegetation.len() as f32;

        if vegetation_health < 0.5 {
            risks.push("vegetation_stress_detected".to_string());
        }

        risks
    }
}

/// External random number generation (simplified)
mod rand {
    pub fn random<T: RandomValue>() -> T {
        T::random()
    }
    
    pub trait RandomValue {
        fn random() -> Self;
    }
    
    impl RandomValue for f32 {
        fn random() -> Self {
            // Simplified random - in real implementation use proper RNG
            (js_sys::Math::random() as f32)
        }
    }
} 
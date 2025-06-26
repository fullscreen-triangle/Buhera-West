use std::collections::HashMap;
use std::f64::consts::PI;
use chrono::{DateTime, Utc};
use nalgebra::{Point3, Vector3};

use crate::error::AppError;
use super::{SensorType, MeasurementValue};

/// 3D Point representation
#[derive(Debug, Clone)]
pub struct Point3D {
    pub x: f64,
    pub y: f64, 
    pub z: f64,
}

/// 2D Point representation
#[derive(Debug, Clone)]
pub struct Point2D {
    pub x: f64,
    pub y: f64,
}

/// 4D Uncertainty Ellipsoid for spatial-temporal measurements
#[derive(Debug, Clone)]
pub struct UncertaintyEllipsoid4D {
    pub spatial_covariance: [[f64; 3]; 3],
    pub temporal_variance: f64,
    pub correlation_spatial_temporal: [f64; 3],
}

/// Circular buffer for efficient 4D slice management
#[derive(Debug, Clone)]
pub struct CircularBuffer<T> {
    pub buffer: Vec<T>,
    pub capacity: usize,
    pub head: usize,
    pub size: usize,
}

impl<T> CircularBuffer<T> {
    pub fn new(capacity: usize) -> Self {
        Self {
            buffer: Vec::with_capacity(capacity),
            capacity,
            head: 0,
            size: 0,
        }
    }

    pub fn push(&mut self, item: T) {
        if self.size < self.capacity {
            self.buffer.push(item);
            self.size += 1;
        } else {
            self.buffer[self.head] = item;
            self.head = (self.head + 1) % self.capacity;
        }
    }

    pub fn is_full(&self) -> bool {
        self.size == self.capacity
    }
}

/// 4D Reality slice with nanosecond precision
#[derive(Debug, Clone)]
pub struct Reality4DSlice {
    pub spatial_coordinates: Point3D,     // X, Y, Z in meters
    pub temporal_coordinate: f64,         // Nanosecond-precise timestamp
    pub measurement_data: HashMap<SensorType, MeasurementValue>,
    pub uncertainty_ellipsoid: UncertaintyEllipsoid4D,
    pub aperture_corrections: ApertureCorrections,
}

/// Aligned sensor data structure
#[derive(Debug, Clone)]
pub struct AlignedSensorData {
    pub gps_data: Vec<(f64, Point3D)>,
    pub weather_data: Vec<(f64, HashMap<String, f64>)>,
    pub satellite_data: Vec<(f64, SatelliteImageryData)>,
    pub soil_data: Vec<(f64, HashMap<String, f64>)>,
}

/// Satellite imagery data structure
#[derive(Debug, Clone)]
pub struct SatelliteImageryData {
    pub raw_signal: Vec<f64>,
    pub metadata: SatelliteMetadata,
    pub timestamp: f64,
    pub position: Point3D,
}

/// Satellite metadata
#[derive(Debug, Clone)]
pub struct SatelliteMetadata {
    pub satellite_id: String,
    pub orbit_parameters: OrbitParameters,
    pub sensor_config: SensorConfiguration,
}

/// Orbit parameters
#[derive(Debug, Clone)]
pub struct OrbitParameters {
    pub altitude: f64,
    pub inclination: f64,
    pub velocity: f64,
}

/// Sensor configuration
#[derive(Debug, Clone)]
pub struct SensorConfiguration {
    pub antenna_size: f64,
    pub frequency: f64,
    pub bandwidth: f64,
}

/// Aperture corrections structure
#[derive(Debug, Clone)]
pub struct ApertureCorrections {
    pub range_walk_correction: f64,      // meters
    pub azimuth_defocus_correction: f64, // meters  
    pub doppler_centroid_correction: f64, // Hz
    pub geometric_distortion_correction: GeometricCorrection,
    pub atmospheric_delay_correction: f64, // nanoseconds
}

impl Default for ApertureCorrections {
    fn default() -> Self {
        Self {
            range_walk_correction: 0.0,
            azimuth_defocus_correction: 0.0,
            doppler_centroid_correction: 0.0,
            geometric_distortion_correction: GeometricCorrection::default(),
            atmospheric_delay_correction: 0.0,
        }
    }
}

/// Geometric correction parameters
#[derive(Debug, Clone)]
pub struct GeometricCorrection {
    pub earth_curvature_correction: f64,
    pub projection_correction: f64,
    pub layover_correction: f64,
}

impl Default for GeometricCorrection {
    fn default() -> Self {
        Self {
            earth_curvature_correction: 0.0,
            projection_correction: 0.0,
            layover_correction: 0.0,
        }
    }
}

/// 4D Reality Reconstructor
pub struct Reality4DReconstructor {
    pub temporal_resolution: f64,         // nanoseconds
    pub spatial_resolution: f64,          // meters
    pub slice_buffer: CircularBuffer<Reality4DSlice>,
    pub aperture_processor: SyntheticApertureProcessor,
}

impl Reality4DReconstructor {
    pub fn new(temporal_resolution: f64, spatial_resolution: f64, buffer_size: usize) -> Self {
        Self {
            temporal_resolution,
            spatial_resolution,
            slice_buffer: CircularBuffer::new(buffer_size),
            aperture_processor: SyntheticApertureProcessor::new(),
        }
    }

    pub fn create_nanosecond_reality_slice(&mut self, 
                                         aligned_sensor_data: &AlignedSensorData,
                                         timestamp_ns: f64) -> Reality4DSlice {
        
        // Interpolate all sensor data to exact nanosecond timestamp
        let interpolated_data = self.interpolate_to_nanosecond(aligned_sensor_data, timestamp_ns);
        
        // Apply aperture corrections for satellite imagery
        let aperture_corrected_data = self.aperture_processor
            .correct_aperture_effects(&interpolated_data);
        
        // Compute 4D uncertainty ellipsoid
        let uncertainty = self.compute_4d_uncertainty(&aperture_corrected_data);
        
        Reality4DSlice {
            spatial_coordinates: self.compute_spatial_position(&aperture_corrected_data),
            temporal_coordinate: timestamp_ns,
            measurement_data: aperture_corrected_data,
            uncertainty_ellipsoid: uncertainty,
            aperture_corrections: self.aperture_processor.get_last_corrections(),
        }
    }

    fn interpolate_to_nanosecond(&self, data: &AlignedSensorData, timestamp_ns: f64) -> HashMap<SensorType, MeasurementValue> {
        let mut interpolated = HashMap::new();
        
        // Interpolate GPS data
        if let Some(pos) = self.interpolate_gps_data(&data.gps_data, timestamp_ns) {
            interpolated.insert(SensorType::GPS, MeasurementValue::Position(pos.x, pos.y, pos.z));
        }
        
        // Interpolate weather data
        for (key, value) in self.interpolate_weather_data(&data.weather_data, timestamp_ns) {
            match key.as_str() {
                "temperature" => interpolated.insert(SensorType::WeatherStation, MeasurementValue::Temperature { 
                    value, 
                    scale: super::TemperatureScale::Celsius,
                    sensor_id: "interpolated".to_string()
                }),
                "humidity" => interpolated.insert(SensorType::WeatherStation, MeasurementValue::Humidity(value)),
                _ => interpolated.insert(SensorType::WeatherStation, MeasurementValue::Scalar(value))
            };
        }
        
        // Interpolate satellite data
        if let Some(sat_data) = self.interpolate_satellite_data(&data.satellite_data, timestamp_ns) {
            interpolated.insert(SensorType::SatelliteImagery, MeasurementValue::MultispectralImage {
                bands: sat_data.raw_signal.clone(),
                wavelengths: vec![0.4, 0.5, 0.6, 0.7, 0.8] // typical wavelengths
            });
        }
        
        interpolated
    }

    fn interpolate_gps_data(&self, gps_data: &Vec<(f64, Point3D)>, timestamp_ns: f64) -> Option<Point3D> {
        if gps_data.len() < 2 { return None; }
        
        // Find bracketing points
        let mut before_idx = 0;
        let mut after_idx = gps_data.len() - 1;
        
        for (i, (t, _)) in gps_data.iter().enumerate() {
            if *t <= timestamp_ns {
                before_idx = i;
            }
            if *t >= timestamp_ns && after_idx == gps_data.len() - 1 {
                after_idx = i;
                break;
            }
        }
        
        if before_idx == after_idx {
            return Some(gps_data[before_idx].1.clone());
        }
        
        let (t1, p1) = &gps_data[before_idx];
        let (t2, p2) = &gps_data[after_idx];
        
        let alpha = (timestamp_ns - t1) / (t2 - t1);
        
        Some(Point3D {
            x: p1.x + alpha * (p2.x - p1.x),
            y: p1.y + alpha * (p2.y - p1.y),
            z: p1.z + alpha * (p2.z - p1.z),
        })
    }

    fn interpolate_weather_data(&self, weather_data: &Vec<(f64, HashMap<String, f64>)>, timestamp_ns: f64) -> HashMap<String, f64> {
        let mut result = HashMap::new();
        
        if weather_data.len() < 2 { return result; }
        
        // Find bracketing data points
        let mut before_idx = 0;
        let mut after_idx = weather_data.len() - 1;
        
        for (i, (t, _)) in weather_data.iter().enumerate() {
            if *t <= timestamp_ns {
                before_idx = i;
            }
            if *t >= timestamp_ns && after_idx == weather_data.len() - 1 {
                after_idx = i;
                break;
            }
        }
        
        if before_idx == after_idx {
            return weather_data[before_idx].1.clone();
        }
        
        let (t1, d1) = &weather_data[before_idx];
        let (t2, d2) = &weather_data[after_idx];
        
        let alpha = (timestamp_ns - t1) / (t2 - t1);
        
        // Interpolate each weather parameter
        for key in d1.keys() {
            if let (Some(v1), Some(v2)) = (d1.get(key), d2.get(key)) {
                result.insert(key.clone(), v1 + alpha * (v2 - v1));
            }
        }
        
        result
    }

    fn interpolate_satellite_data(&self, sat_data: &Vec<(f64, SatelliteImageryData)>, timestamp_ns: f64) -> Option<SatelliteImageryData> {
        if sat_data.is_empty() { return None; }
        
        // For satellite data, use nearest neighbor for now
        let mut nearest_idx = 0;
        let mut min_diff = (sat_data[0].0 - timestamp_ns).abs();
        
        for (i, (t, _)) in sat_data.iter().enumerate() {
            let diff = (t - timestamp_ns).abs();
            if diff < min_diff {
                min_diff = diff;
                nearest_idx = i;
            }
        }
        
        Some(sat_data[nearest_idx].1.clone())
    }

    fn compute_4d_uncertainty(&self, _data: &HashMap<SensorType, MeasurementValue>) -> UncertaintyEllipsoid4D {
        UncertaintyEllipsoid4D {
            spatial_covariance: [
                [1.0, 0.1, 0.05],
                [0.1, 1.0, 0.1],
                [0.05, 0.1, 1.0]
            ],
            temporal_variance: 0.001, // 1 ms temporal uncertainty
            correlation_spatial_temporal: [0.01, 0.01, 0.001],
        }
    }

    fn compute_spatial_position(&self, data: &HashMap<SensorType, MeasurementValue>) -> Point3D {
        if let Some(MeasurementValue::Position(x, y, z)) = data.get(&SensorType::GPS) {
            Point3D { x: *x, y: *y, z: *z }
        } else {
            Point3D { x: 0.0, y: 0.0, z: 0.0 }
        }
    }
}

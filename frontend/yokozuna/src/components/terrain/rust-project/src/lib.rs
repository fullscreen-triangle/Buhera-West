//! # Terrain Reconstructor
//! 
//! A high-performance terrain reconstruction and agricultural analysis engine
//! designed for 100m diameter areas with sub-centimeter precision.
//! 
//! This library combines advanced 3D reconstruction algorithms with agricultural
//! intelligence to create photorealistic digital twins of farmland.

use wasm_bindgen::prelude::*;

// Re-export core types
pub use crate::reconstruction::TerrainReconstructor;
pub use crate::types::*;
pub use crate::analysis::AgriculturalAnalyzer;

// Core modules
pub mod reconstruction;
pub mod analysis;
pub mod types;
pub mod utils;
pub mod ray_tracing;

#[cfg(feature = "web")]
mod web;

#[cfg(feature = "native")]
mod native;

// Initialize WASM module
#[cfg(feature = "web")]
#[wasm_bindgen(start)]
pub fn init() {
    // Set up panic hook for better error messages
    console_error_panic_hook::set_once();
    
    // Initialize logger
    wasm_logger::init(wasm_logger::Config::default());
    
    log::info!("Terrain Reconstructor WASM module initialized");
}

// Version information
#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// Feature detection
#[wasm_bindgen]
pub fn get_capabilities() -> JsValue {
    let capabilities = serde_json::json!({
        "ray_tracing": cfg!(feature = "ray-tracing"),
        "machine_learning": cfg!(feature = "ml"),
        "agriculture": cfg!(feature = "agriculture"),
        "native": cfg!(feature = "native"),
        "web": cfg!(feature = "web"),
        "version": env!("CARGO_PKG_VERSION"),
        "max_area_diameter": 100.0,
        "min_height_threshold": 0.01,
        "max_resolution": 100.0
    });
    
    serde_wasm_bindgen::to_value(&capabilities).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_version() {
        let version = version();
        assert!(!version.is_empty());
        assert!(version.contains('.'));
    }
    
    #[test]
    fn test_capabilities() {
        let caps = get_capabilities();
        assert!(!caps.is_undefined());
    }
} 
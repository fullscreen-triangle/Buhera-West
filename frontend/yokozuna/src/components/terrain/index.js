// Terrain Components Index
// Exports all terrain-related components for agricultural weather analysis

// Basic terrain components
export { default as BasicTerrain } from './BasicTerrain';
export { default as TexturedTerrain } from './TexturedTerrain';
export { default as LODTerrain } from './LODTerrain';
export { default as BaseGeoViewer } from './BaseGeoViewer';

// Advanced analysis components
export { default as TerrainDemo } from './TerrainDemo';

// Analysis and classification utilities
export {
  SoilClassifier,
  CropSuitabilityAnalyzer,
  WeatherPatternAnalyzer,
  AgriculturalTerrainAnalyzer
} from './Classifier';

// Main terrain component (if tsconfig issues are resolved)
// export { default as AgriculturalTerrainAnalysis } from './AgriculturalTerrainAnalysis';

/**
 * Terrain Analysis System Overview:
 * 
 * 1. Basic Components:
 *    - BasicTerrain: Simple ground plane with grid
 *    - TexturedTerrain: Multi-texture terrain with heightmaps
 *    - LODTerrain: Level-of-detail optimized terrain
 *    - BaseGeoViewer: 3D viewer wrapper
 * 
 * 2. Analysis System:
 *    - SoilClassifier: Analyzes soil types and characteristics
 *    - CropSuitabilityAnalyzer: Determines crop suitability
 *    - WeatherPatternAnalyzer: Seasonal weather analysis
 *    - AgriculturalTerrainAnalyzer: Comprehensive terrain analysis
 * 
 * 3. Interactive Features:
 *    - Click-to-analyze terrain functionality
 *    - Real-time agricultural recommendations
 *    - Annotation and marking system
 *    - Weather data overlay
 * 
 * 4. Agricultural Focus:
 *    - Soil type classification (clay, sand, loam, silt)
 *    - Crop suitability scoring for multiple crops
 *    - Erosion risk assessment
 *    - Seasonal planting recommendations
 *    - Weather pattern analysis for farming decisions
 */

// Default export for convenience
export default {
  BasicTerrain: require('./BasicTerrain').default,
  TexturedTerrain: require('./TexturedTerrain').default,
  LODTerrain: require('./LODTerrain').default,
  BaseGeoViewer: require('./BaseGeoViewer').default,
  TerrainDemo: require('./TerrainDemo').default,
  Classifier: require('./Classifier').default
}; 
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Stats } from '@react-three/drei';
import * as THREE from 'three';
import BaseGeoViewer from './BaseGeoViewer';
import AgriculturalTerrainAnalysis from './AgriculturalTerrainAnalysis';
import { AgriculturalTerrainAnalyzer } from './Classifier';

/**
 * Enhanced terrain viewer configuration
 */
interface TerrainViewerConfig {
  /** Terrain type and settings */
  terrain: {
    type: 'basic' | 'textured' | 'lod';
    size: [number, number, number];
    position: [number, number, number];
    heightMap?: string;
    textures?: {
      base?: string;
      detail?: string;
      normal?: string;
      splat?: string;
    };
    resolution?: number;
  };
  /** Camera settings */
  camera: {
    position: [number, number, number];
    fov: number;
    near: number;
    far: number;
  };
  /** Lighting configuration */
  lighting: {
    ambientIntensity: number;
    directionalIntensity: number;
    directionalPosition: [number, number, number];
    enableShadows: boolean;
  };
  /** UI settings */
  ui: {
    showStats: boolean;
    showControls: boolean;
    enableDrawing: boolean;
    theme: 'light' | 'dark';
  };
}

/**
 * Terrain analysis data structure
 */
interface TerrainAnalysisData {
  position: THREE.Vector3;
  elevation: number;
  slope: number;
  aspect: number;
  drainageIndex: number;
  analysis?: any;
}

/**
 * Agricultural annotation interface
 */
interface AgriculturalAnnotation {
  id: string;
  type: 'soil_analysis' | 'crop_area' | 'irrigation' | 'weather_station' | 'drainage' | 'custom';
  shape: 'circle' | 'square' | 'polygon';
  position: THREE.Vector3;
  size: number | [number, number];
  data: {
    title: string;
    description: string;
    soilType?: string;
    cropType?: string;
    moistureLevel?: number;
    temperature?: number;
    ph?: number;
    nutrients?: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
    lastUpdated: Date;
    [key: string]: any;
  };
  color: string;
  opacity: number;
}

/**
 * Weather data point
 */
interface WeatherDataPoint {
  position: THREE.Vector3;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  soilMoisture: number;
  timestamp: Date;
}

/**
 * Props for the enhanced terrain viewer
 */
export interface EnhancedTerrainViewerProps {
  /** Initial terrain configuration */
  config?: Partial<TerrainViewerConfig>;
  /** Agricultural annotations */
  annotations?: AgriculturalAnnotation[];
  /** Weather data points */
  weatherData?: WeatherDataPoint[];
  /** Initial terrain analysis points */
  analysisPoints?: TerrainAnalysisData[];
  /** Callback when new annotation is created */
  onAnnotationCreate?: (annotation: AgriculturalAnnotation) => void;
  /** Callback when annotation is updated */
  onAnnotationUpdate?: (annotation: AgriculturalAnnotation) => void;
  /** Callback when annotation is deleted */
  onAnnotationDelete?: (id: string) => void;
  /** Callback when terrain analysis is performed */
  onTerrainAnalysis?: (analysis: TerrainAnalysisData) => void;
  /** Callback when crop suitability is analyzed */
  onCropSuitabilityAnalysis?: (analysis: any) => void;
  /** Custom style for the container */
  style?: React.CSSProperties;
  /** Container className */
  className?: string;
}

/**
 * Enhanced Terrain Viewer Component
 * Comprehensive agricultural terrain analysis with 3D visualization
 */
const EnhancedTerrainViewer: React.FC<EnhancedTerrainViewerProps> = ({
  config = {},
  annotations = [],
  weatherData = [],
  analysisPoints = [],
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
  onTerrainAnalysis,
  onCropSuitabilityAnalysis,
  style = {},
  className = ''
}) => {
  // Default configuration
  const defaultConfig: TerrainViewerConfig = {
    terrain: {
      type: 'lod',
      size: [200, 50, 200],
      position: [0, 0, 0],
      resolution: 128,
      textures: {
        base: '/textures/terrain/grass.jpg',
        detail: '/textures/terrain/soil.jpg',
        normal: '/textures/terrain/normal.jpg'
      }
    },
    camera: {
      position: [50, 30, 50],
      fov: 60,
      near: 0.1,
      far: 2000
    },
    lighting: {
      ambientIntensity: 0.4,
      directionalIntensity: 0.8,
      directionalPosition: [100, 100, 50],
      enableShadows: true
    },
    ui: {
      showStats: false,
      showControls: true,
      enableDrawing: true,
      theme: 'light'
    }
  };

  // Merge configurations
  const viewerConfig = useMemo(() => ({
    terrain: { ...defaultConfig.terrain, ...config.terrain },
    camera: { ...defaultConfig.camera, ...config.camera },
    lighting: { ...defaultConfig.lighting, ...config.lighting },
    ui: { ...defaultConfig.ui, ...config.ui }
  }), [config]);

  // Component state
  const [selectedAnnotation, setSelectedAnnotation] = useState<AgriculturalAnnotation | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'soil' | 'crop' | 'weather' | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [localAnnotations, setLocalAnnotations] = useState<AgriculturalAnnotation[]>(annotations);
  const [viewMode, setViewMode] = useState<'3d' | 'satellite' | 'topographic'>('3d');

  // Sample weather data for demonstration
  const sampleWeatherData = useMemo(() => {
    if (weatherData.length > 0) return weatherData;
    
    // Generate sample weather data points across the terrain
    const points: WeatherDataPoint[] = [];
    for (let i = 0; i < 5; i++) {
      points.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * viewerConfig.terrain.size[0] * 0.8,
          2,
          (Math.random() - 0.5) * viewerConfig.terrain.size[2] * 0.8
        ),
        temperature: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        windSpeed: Math.random() * 10,
        windDirection: Math.random() * 360,
        precipitation: Math.random() * 100,
        soilMoisture: 30 + Math.random() * 40,
        timestamp: new Date()
      });
    }
    return points;
  }, [weatherData, viewerConfig.terrain.size]);

  // Handle terrain click for analysis
  const handleTerrainAnalysis = useCallback((position: THREE.Vector3, terrainAnalysis: any) => {
    const analysisData: TerrainAnalysisData = {
      position,
      elevation: position.y,
      slope: terrainAnalysis.slope || Math.random() * 30,
      aspect: terrainAnalysis.aspect || Math.random() * 360,
      drainageIndex: Math.random(),
      analysis: terrainAnalysis
    };

    // Perform comprehensive agricultural analysis
    if (sampleWeatherData.length > 0) {
      const comprehensiveAnalysis = AgriculturalTerrainAnalyzer.analyzeTerrainForAgriculture(
        analysisData,
        sampleWeatherData,
        ['maize', 'wheat', 'soybeans']
      );
      
      analysisData.analysis = comprehensiveAnalysis;
      setCurrentAnalysis(comprehensiveAnalysis);
      setShowAnalysisPanel(true);
      
      if (onTerrainAnalysis) {
        onTerrainAnalysis(analysisData);
      }
    }
  }, [sampleWeatherData, onTerrainAnalysis]);

  // Handle annotation creation
  const handleAnnotationCreate = useCallback((annotation: AgriculturalAnnotation) => {
    setLocalAnnotations(prev => [...prev, annotation]);
    if (onAnnotationCreate) {
      onAnnotationCreate(annotation);
    }
  }, [onAnnotationCreate]);

  // Handle annotation selection
  const handleAnnotationSelect = useCallback((annotation: AgriculturalAnnotation | null) => {
    setSelectedAnnotation(annotation);
    if (annotation && annotation.data.soilType) {
      // Show detailed analysis for the annotation
      setCurrentAnalysis({
        soilAnalysis: {
          type: annotation.data.soilType,
          ph_range: [6.0, 7.5],
          characteristics: ['balanced_drainage', 'good_structure']
        },
        cropSuitability: {
          maize: { suitable: true, suitabilityScore: 85 },
          wheat: { suitable: true, suitabilityScore: 78 }
        }
      });
      setShowAnalysisPanel(true);
    }
  }, []);

  // Crop suitability analysis
  const performCropSuitabilityAnalysis = useCallback((cropType: string) => {
    if (selectedAnnotation && currentAnalysis) {
      const analysis = {
        crop: cropType,
        position: selectedAnnotation.position,
        suitability: currentAnalysis.cropSuitability?.[cropType] || { suitable: false, suitabilityScore: 0 },
        recommendations: ['Implement irrigation system', 'Monitor soil pH', 'Apply fertilizer']
      };
      
      if (onCropSuitabilityAnalysis) {
        onCropSuitabilityAnalysis(analysis);
      }
    }
  }, [selectedAnnotation, currentAnalysis, onCropSuitabilityAnalysis]);

  // Container style
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    position: 'relative',
    backgroundColor: viewerConfig.ui.theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    ...style
  };

  return (
    <div className={`enhanced-terrain-viewer ${className}`} style={containerStyle}>
      {/* 3D Terrain Visualization */}
      <Canvas
        camera={{
          position: viewerConfig.camera.position,
          fov: viewerConfig.camera.fov,
          near: viewerConfig.camera.near,
          far: viewerConfig.camera.far
        }}
        shadows={viewerConfig.lighting.enableShadows}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={viewerConfig.lighting.ambientIntensity} />
        <directionalLight
          position={viewerConfig.lighting.directionalPosition}
          intensity={viewerConfig.lighting.directionalIntensity}
          castShadow={viewerConfig.lighting.enableShadows}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={500}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
        />

        {/* Environment */}
        <Sky
          distance={450000}
          sunPosition={[100, 20, 100]}
          inclination={0}
          azimuth={0.25}
        />

        {/* Agricultural Terrain Analysis Component */}
        <AgriculturalTerrainAnalysis
          terrainConfig={viewerConfig.terrain}
          annotations={localAnnotations}
          weatherData={sampleWeatherData}
          enableDrawing={viewerConfig.ui.enableDrawing}
          enable3D={true}
          showWeatherOverlay={true}
          showSoilAnalysis={true}
          showCropZones={true}
          onCreateAnnotation={handleAnnotationCreate}
          onSelectAnnotation={handleAnnotationSelect}
          onTerrainAnalysis={handleTerrainAnalysis}
        />

        {/* Controls */}
        {viewerConfig.ui.showControls && (
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={10}
            maxDistance={500}
            maxPolarAngle={Math.PI / 2}
          />
        )}

        {/* Performance Stats */}
        {viewerConfig.ui.showStats && <Stats />}
      </Canvas>

      {/* UI Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '200px',
        zIndex: 1000
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Terrain Analysis</h3>
        
        {/* View Mode Selector */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>View Mode:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            style={{ width: '100%', padding: '4px', marginTop: '4px' }}
          >
            <option value="3d">3D Terrain</option>
            <option value="satellite">Satellite View</option>
            <option value="topographic">Topographic</option>
          </select>
        </div>

        {/* Analysis Mode Selector */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Analysis Mode:</label>
          <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
            <button
              onClick={() => setAnalysisMode(analysisMode === 'soil' ? null : 'soil')}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                background: analysisMode === 'soil' ? '#0066cc' : '#f0f0f0',
                color: analysisMode === 'soil' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Soil
            </button>
            <button
              onClick={() => setAnalysisMode(analysisMode === 'crop' ? null : 'crop')}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                background: analysisMode === 'crop' ? '#0066cc' : '#f0f0f0',
                color: analysisMode === 'crop' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Crop
            </button>
            <button
              onClick={() => setAnalysisMode(analysisMode === 'weather' ? null : 'weather')}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                background: analysisMode === 'weather' ? '#0066cc' : '#f0f0f0',
                color: analysisMode === 'weather' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Weather
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Quick Actions:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            <button
              onClick={() => performCropSuitabilityAnalysis('maize')}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🌽 Analyze Maize Suitability
            </button>
            <button
              onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📊 Toggle Analysis Panel
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results Panel */}
      {showAnalysisPanel && currentAnalysis && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          maxHeight: '300px',
          overflow: 'auto',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Analysis Results</h3>
            <button
              onClick={() => setShowAnalysisPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>

          {/* Soil Analysis */}
          {currentAnalysis.soilAnalysis && (
            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#8B4513' }}>
                🌱 Soil Analysis
              </h4>
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                <div><strong>Type:</strong> {currentAnalysis.soilAnalysis.type}</div>
                <div><strong>pH Range:</strong> {currentAnalysis.soilAnalysis.ph_range?.join(' - ')}</div>
                {currentAnalysis.soilAnalysis.characteristics && (
                  <div><strong>Characteristics:</strong> {currentAnalysis.soilAnalysis.characteristics.join(', ')}</div>
                )}
              </div>
            </div>
          )}

          {/* Crop Suitability */}
          {currentAnalysis.cropSuitability && (
            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#228B22' }}>
                🌾 Crop Suitability
              </h4>
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                {Object.entries(currentAnalysis.cropSuitability).map(([crop, analysis]: [string, any]) => (
                  <div key={crop} style={{ marginBottom: '4px' }}>
                    <strong>{crop.toUpperCase()}:</strong>{' '}
                    <span style={{ color: analysis.suitable ? 'green' : 'red' }}>
                      {analysis.suitable ? '✓' : '✗'} {analysis.suitabilityScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {currentAnalysis.recommendations && (
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#FF6B35' }}>
                💡 Recommendations
              </h4>
              <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                {currentAnalysis.recommendations.map((rec: any, index: number) => (
                  <div key={index} style={{ marginBottom: '6px' }}>
                    <strong>{rec.category}:</strong>
                    <ul style={{ margin: '2px 0', paddingLeft: '15px' }}>
                      {rec.items.map((item: string, itemIndex: number) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Bar */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        zIndex: 1000
      }}>
        Annotations: {localAnnotations.length} | Weather Stations: {sampleWeatherData.length} | 
        Mode: {analysisMode || 'Explore'}
      </div>
    </div>
  );
};

export default EnhancedTerrainViewer; 
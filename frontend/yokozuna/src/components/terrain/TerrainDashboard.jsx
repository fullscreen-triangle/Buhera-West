import React, { useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Html } from '@react-three/drei';
import * as THREE from 'three';
import BasicTerrain from './BasicTerrain';
import TexturedTerrain from './TexturedTerrain';
import { AgriculturalTerrainAnalyzer, SoilClassifier, CropSuitabilityAnalyzer } from './Classifier';

/**
 * Comprehensive Agricultural Terrain Dashboard
 * Demonstrates sophisticated terrain analysis for agricultural weather forecasting
 */
const TerrainDashboard = ({
  width = '100%',
  height = '600px',
  showControls = true,
  enableAnalysis = true,
  initialTerrain = 'textured'
}) => {
  // State management
  const [terrainType, setTerrainType] = useState(initialTerrain);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [drawingMode, setDrawingMode] = useState(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

  // Sample weather data for analysis
  const weatherData = useMemo(() => [
    {
      position: new THREE.Vector3(10, 0, 10),
      temperature: 25.5,
      humidity: 65,
      windSpeed: 8.2,
      windDirection: 180,
      precipitation: 45,
      soilMoisture: 35,
      timestamp: new Date()
    },
    {
      position: new THREE.Vector3(-15, 0, 20),
      temperature: 23.8,
      humidity: 72,
      windSpeed: 6.5,
      windDirection: 220,
      precipitation: 52,
      soilMoisture: 42,
      timestamp: new Date()
    },
    {
      position: new THREE.Vector3(25, 0, -10),
      temperature: 27.2,
      humidity: 58,
      windSpeed: 9.8,
      windDirection: 160,
      precipitation: 38,
      soilMoisture: 28,
      timestamp: new Date()
    }
  ], []);

  // Handle terrain click for analysis
  const handleTerrainClick = useCallback((event) => {
    if (!enableAnalysis) return;

    const position = event.point;
    const elevation = position.y;
    const slope = 5 + Math.random() * 25; // Simulated slope
    const aspect = Math.random() * 360; // Simulated aspect
    const drainageIndex = Math.random(); // Simulated drainage

    // Create terrain analysis data
    const terrainData = {
      position,
      elevation,
      slope,
      aspect,
      drainageIndex
    };

    // Perform comprehensive agricultural analysis
    const analysis = AgriculturalTerrainAnalyzer.analyzeTerrainForAgriculture(
      terrainData,
      weatherData,
      ['maize', 'wheat', 'soybeans', 'groundnuts']
    );

    setSelectedPoint(position);
    setAnalysisResults(analysis);
    setShowAnalysisPanel(true);

    console.log('Agricultural Terrain Analysis:', analysis);
  }, [enableAnalysis, weatherData]);

  // Add annotation at selected point
  const addAnnotation = useCallback((type, title) => {
    if (!selectedPoint) return;

    const newAnnotation = {
      id: `annotation_${Date.now()}`,
      type,
      position: selectedPoint.clone(),
      title: title || `${type} annotation`,
      data: analysisResults?.soilAnalysis || {},
      color: getAnnotationColor(type),
      timestamp: new Date()
    };

    setAnnotations(prev => [...prev, newAnnotation]);
  }, [selectedPoint, analysisResults]);

  // Get color for annotation type
  const getAnnotationColor = (type) => {
    const colors = {
      soil_analysis: '#8B4513',
      crop_area: '#228B22',
      irrigation: '#4169E1',
      weather_station: '#FF6347',
      drainage: '#20B2AA',
      custom: '#9370DB'
    };
    return colors[type] || '#666666';
  };

  // Render terrain based on type
  const renderTerrain = () => {
    const commonProps = {
      onClick: handleTerrainClick,
      receiveShadow: true,
      position: [0, 0, 0]
    };

    switch (terrainType) {
      case 'textured':
        return (
          <TexturedTerrain
            {...commonProps}
            size={[100, 15, 100]}
            resolution={64}
            textures={{
              base: '/textures/terrain/grass.jpg',
              r: '/textures/terrain/rock.jpg',
              g: '/textures/terrain/dirt.jpg',
              b: '/textures/terrain/snow.jpg',
              normal: '/textures/terrain/normal.jpg'
            }}
          />
        );
      
      case 'basic':
      default:
        return (
          <BasicTerrain
            {...commonProps}
            size={100}
            color="#3a7e3d"
            showGrid={true}
          >
            {/* Additional terrain features can be added here */}
          </BasicTerrain>
        );
    }
  };

  // Render annotations
  const renderAnnotations = () => {
    return annotations.map(annotation => (
      <group key={annotation.id} position={[annotation.position.x, annotation.position.y + 0.5, annotation.position.z]}>
        {/* Annotation marker */}
        <mesh>
          <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
          <meshStandardMaterial color={annotation.color} />
        </mesh>
        
        {/* Annotation label */}
        <Html position={[0, 2, 0]} center>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            border: `2px solid ${annotation.color}`,
            whiteSpace: 'nowrap'
          }}>
            {annotation.title}
          </div>
        </Html>
      </group>
    ));
  };

  // Render weather stations
  const renderWeatherStations = () => {
    return weatherData.map((station, index) => (
      <group key={index} position={[station.position.x, station.position.y + 1, station.position.z]}>
        {/* Weather station marker */}
        <mesh>
          <boxGeometry args={[1, 3, 1]} />
          <meshStandardMaterial color="#00aaff" />
        </mesh>
        
        {/* Weather data display */}
        <Html position={[0, 2.5, 0]} center>
          <div style={{
            background: 'rgba(0, 170, 255, 0.9)',
            color: 'white',
            padding: '6px',
            borderRadius: '6px',
            fontSize: '10px',
            minWidth: '100px',
            textAlign: 'center'
          }}>
            <div>🌡️ {station.temperature.toFixed(1)}°C</div>
            <div>💧 {station.humidity}%</div>
            <div>💨 {station.windSpeed.toFixed(1)} m/s</div>
            <div>🌱 {station.soilMoisture}%</div>
          </div>
        </Html>
      </group>
    ));
  };

  // Render selected point indicator
  const renderSelectedPoint = () => {
    if (!selectedPoint) return null;

    return (
      <group position={[selectedPoint.x, selectedPoint.y + 0.1, selectedPoint.z]}>
        <mesh>
          <ringGeometry args={[2, 3, 16]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  };

  return (
    <div style={{ width, height, position: 'relative', background: '#f5f5f5' }}>
      {/* 3D Terrain View */}
      <Canvas
        camera={{ position: [30, 20, 30], fov: 60 }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        {/* Environment */}
        <Sky distance={450000} sunPosition={[50, 10, 50]} />

        {/* Terrain */}
        {renderTerrain()}

        {/* Annotations */}
        {renderAnnotations()}

        {/* Weather Stations */}
        {renderWeatherStations()}

        {/* Selected Point Indicator */}
        {renderSelectedPoint()}

        {/* Controls */}
        {showControls && (
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={200}
            maxPolarAngle={Math.PI / 2}
          />
        )}
      </Canvas>

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '250px',
        zIndex: 1000
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Agricultural Terrain Analysis</h3>
        
        {/* Terrain Type Selector */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Terrain Type:
          </label>
          <select
            value={terrainType}
            onChange={(e) => setTerrainType(e.target.value)}
            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="basic">Basic Terrain</option>
            <option value="textured">Textured Terrain</option>
          </select>
        </div>

        {/* Analysis Tools */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Analysis Tools:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <button
              onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
              style={{
                padding: '6px',
                fontSize: '11px',
                background: showAnalysisPanel ? '#0066cc' : '#f0f0f0',
                color: showAnalysisPanel ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Analysis Panel
            </button>
            <button
              onClick={() => setAnnotations([])}
              style={{
                padding: '6px',
                fontSize: '11px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Quick Annotations */}
        {selectedPoint && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Add Annotation:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              <button
                onClick={() => addAnnotation('soil_analysis', 'Soil Sample')}
                style={{
                  padding: '6px',
                  fontSize: '11px',
                  background: '#8B4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🌱 Soil
              </button>
              <button
                onClick={() => addAnnotation('crop_area', 'Crop Zone')}
                style={{
                  padding: '6px',
                  fontSize: '11px',
                  background: '#228B22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🌾 Crop
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
          <strong>Instructions:</strong><br/>
          • Click on terrain to analyze soil and crop suitability<br/>
          • Use annotation tools to mark important areas<br/>
          • Weather stations show real-time data<br/>
          • Toggle analysis panel for detailed results
        </div>
      </div>

      {/* Analysis Results Panel */}
      {showAnalysisPanel && analysisResults && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '350px',
          maxHeight: '400px',
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
          {analysisResults.soilAnalysis && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#8B4513' }}>
                🌱 Soil Analysis
              </h4>
              <div style={{ fontSize: '12px', lineHeight: '1.4', background: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
                <div><strong>Type:</strong> {analysisResults.soilAnalysis.type}</div>
                <div><strong>pH Range:</strong> {analysisResults.soilAnalysis.ph_range?.join(' - ')}</div>
                <div><strong>Organic Matter:</strong> {analysisResults.soilAnalysis.organic_matter}</div>
                {analysisResults.soilAnalysis.characteristics && (
                  <div><strong>Characteristics:</strong> {analysisResults.soilAnalysis.characteristics.join(', ')}</div>
                )}
              </div>
            </div>
          )}

          {/* Erosion Risk */}
          {analysisResults.erosionRisk && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#DC143C' }}>
                ⚠️ Erosion Risk
              </h4>
              <div style={{ fontSize: '12px', lineHeight: '1.4', background: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
                <div><strong>Risk Level:</strong> {analysisResults.erosionRisk.level}</div>
                <div><strong>Mitigation:</strong> {analysisResults.erosionRisk.mitigation?.join(', ')}</div>
              </div>
            </div>
          )}

          {/* Crop Suitability */}
          {analysisResults.cropSuitability && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#228B22' }}>
                🌾 Crop Suitability
              </h4>
              <div style={{ fontSize: '12px', lineHeight: '1.4', background: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
                {Object.entries(analysisResults.cropSuitability).map(([crop, analysis]) => (
                  <div key={crop} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>{crop.toUpperCase()}:</strong></span>
                    <span style={{ color: analysis.suitable ? '#28a745' : '#dc3545' }}>
                      {analysis.suitable ? '✓' : '✗'} {analysis.suitabilityScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall Suitability Score */}
          {analysisResults.overallSuitability !== undefined && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6f42c1' }}>
                📊 Overall Suitability
              </h4>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '10px',
                borderRadius: '4px',
                background: `linear-gradient(90deg, #dc3545 0%, #ffc107 50%, #28a745 100%)`,
                color: 'white',
                position: 'relative'
              }}>
                {analysisResults.overallSuitability.toFixed(0)}%
                <div style={{
                  position: 'absolute',
                  left: `${analysisResults.overallSuitability}%`,
                  top: '-5px',
                  width: '0',
                  height: '0',
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '10px solid white'
                }} />
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysisResults.recommendations && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#FF6B35' }}>
                💡 Recommendations
              </h4>
              <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                {analysisResults.recommendations.map((rec, index) => (
                  <div key={index} style={{ marginBottom: '8px', background: '#f8f9fa', padding: '6px', borderRadius: '4px' }}>
                    <strong>{rec.category}:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: '15px' }}>
                      {rec.items.map((item, itemIndex) => (
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
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        zIndex: 1000
      }}>
        Terrain: {terrainType} | Annotations: {annotations.length} | Weather Stations: {weatherData.length}
        {selectedPoint && ` | Selected: (${selectedPoint.x.toFixed(1)}, ${selectedPoint.z.toFixed(1)})`}
      </div>
    </div>
  );
};

export default TerrainDashboard; 
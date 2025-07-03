import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import AgriculturalTerrainAnalysis from './AgriculturalTerrainAnalysis';

/**
 * Enhanced Terrain Viewer with Agricultural Analysis capabilities
 */
const EnhancedTerrainViewer = ({
  terrainConfig = {
    type: 'basic',
    size: [100, 20, 100],
    position: [0, 0, 0],
    resolution: 64,
    textures: {}
  },
  initialAnnotations = [],
  weatherStations = [],
  enableInteraction = true,
  enableWeatherOverlay = true,
  enableSoilAnalysis = true,
  enableCropZones = true,
  showStats = false,
  backgroundColor = '#87CEEB',
  ambientLightIntensity = 0.4,
  directionalLightIntensity = 1.0,
  cameraPosition = [50, 30, 50],
  onTerrainClick,
  onAnnotationCreate,
  onAnnotationSelect,
  onWeatherDataRequest
}) => {
  // Component state
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [terrainAnalysisData, setTerrainAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Control states
  const [viewMode, setViewMode] = useState('3d');
  const [analysisMode, setAnalysisMode] = useState('none');
  const [showGrid, setShowGrid] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  
  // Refs
  const canvasRef = useRef();
  const controlsRef = useRef();
  
  // Weather data state (simulated)
  const [weatherData, setWeatherData] = useState(weatherStations.map(station => ({
    ...station,
    temperature: 20 + Math.random() * 15, // 20-35°C
    humidity: 40 + Math.random() * 40,     // 40-80%
    windSpeed: Math.random() * 10,         // 0-10 m/s
    soilMoisture: 20 + Math.random() * 60, // 20-80%
    lastUpdated: new Date()
  })));
  
  // Handlers
  const handleAnnotationCreate = useCallback((annotationData) => {
    const newAnnotation = {
      ...annotationData,
      id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    
    if (onAnnotationCreate) {
      onAnnotationCreate(newAnnotation);
    }
  }, [onAnnotationCreate]);
  
  const handleAnnotationSelect = useCallback((annotation) => {
    setSelectedAnnotation(annotation);
    
    if (onAnnotationSelect) {
      onAnnotationSelect(annotation);
    }
  }, [onAnnotationSelect]);
  
  const handleTerrainAnalysis = useCallback((position, analysisData) => {
    setTerrainAnalysisData({
      position,
      data: analysisData,
      timestamp: new Date()
    });
    
    if (onTerrainClick) {
      onTerrainClick(position, analysisData);
    }
  }, [onTerrainClick]);
  
  // Update weather data periodically
  useEffect(() => {
    if (!enableWeatherOverlay) return;
    
    const interval = setInterval(() => {
      setWeatherData(prev => prev.map(station => ({
        ...station,
        temperature: Math.max(10, Math.min(40, station.temperature + (Math.random() - 0.5) * 2)),
        humidity: Math.max(20, Math.min(100, station.humidity + (Math.random() - 0.5) * 5)),
        windSpeed: Math.max(0, Math.min(15, station.windSpeed + (Math.random() - 0.5) * 1)),
        soilMoisture: Math.max(10, Math.min(90, station.soilMoisture + (Math.random() - 0.5) * 3)),
        lastUpdated: new Date()
      })));
      
      if (onWeatherDataRequest) {
        onWeatherDataRequest();
      }
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [enableWeatherOverlay, onWeatherDataRequest]);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '200px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Terrain Controls</h4>
        
        {/* View Mode */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="view-mode" style={{ fontSize: '12px', fontWeight: 'bold' }}>View Mode:</label>
          <select
            id="view-mode"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{ width: '100%', padding: '4px', marginTop: '2px' }}
            title="Select viewing mode"
          >
            <option value="3d">3D View</option>
            <option value="topdown">Top Down</option>
            <option value="side">Side View</option>
          </select>
        </div>
        
        {/* Analysis Mode */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="analysis-mode" style={{ fontSize: '12px', fontWeight: 'bold' }}>Analysis:</label>
          <select
            id="analysis-mode"
            value={analysisMode}
            onChange={(e) => setAnalysisMode(e.target.value)}
            style={{ width: '100%', padding: '4px', marginTop: '2px' }}
            title="Select analysis mode"
          >
            <option value="none">None</option>
            <option value="elevation">Elevation</option>
            <option value="slope">Slope Analysis</option>
            <option value="drainage">Drainage</option>
            <option value="soil">Soil Analysis</option>
          </select>
        </div>
        
        {/* Toggle Options */}
        <div style={{ fontSize: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            Show Grid
          </label>
          
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="checkbox"
              checked={showWireframe}
              onChange={(e) => setShowWireframe(e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            Wireframe
          </label>
          
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="checkbox"
              checked={enableWeatherOverlay}
              onChange={() => {}}
              disabled
              style={{ marginRight: '5px' }}
            />
            Weather Overlay
          </label>
          
          <label style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={enableSoilAnalysis}
              onChange={() => {}}
              disabled
              style={{ marginRight: '5px' }}
            />
            Soil Analysis
          </label>
        </div>
      </div>
      
      {/* Analysis Results Panel */}
      {terrainAnalysisData && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '300px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Terrain Analysis</h4>
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            <div>📍 Position: ({terrainAnalysisData.position.x.toFixed(1)}, {terrainAnalysisData.position.z.toFixed(1)})</div>
            <div>⛰️ Elevation: {terrainAnalysisData.data.elevation.toFixed(2)}m</div>
            <div>📐 Slope: {terrainAnalysisData.data.slope.toFixed(1)}°</div>
            <div>🧭 Aspect: {terrainAnalysisData.data.aspect.toFixed(0)}°</div>
            <div>🏔️ Soil Type: {terrainAnalysisData.data.soilType}</div>
            <div>💧 Drainage: {terrainAnalysisData.data.drainageClass}</div>
            <div>⚠️ Erosion Risk: {terrainAnalysisData.data.erosionRisk}</div>
          </div>
          <button
            onClick={() => setTerrainAnalysisData(null)}
            style={{
              marginTop: '10px',
              padding: '4px 8px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
      
      {/* Selected Annotation Panel */}
      {selectedAnnotation && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '10px',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          maxWidth: '250px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{selectedAnnotation.data.title}</h4>
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            <div><strong>Type:</strong> {selectedAnnotation.type}</div>
            <div><strong>Shape:</strong> {selectedAnnotation.shape}</div>
            {selectedAnnotation.data.description && (
              <div style={{ marginTop: '8px' }}>
                <strong>Description:</strong><br/>
                {selectedAnnotation.data.description}
              </div>
            )}
            {selectedAnnotation.data.soilType && (
              <div style={{ marginTop: '8px' }}>
                <strong>Soil Type:</strong> {selectedAnnotation.data.soilType}<br/>
                {selectedAnnotation.data.ph && <><strong>pH:</strong> {selectedAnnotation.data.ph.toFixed(1)}</>}
              </div>
            )}
          </div>
          <button
            onClick={() => setSelectedAnnotation(null)}
            style={{
              marginTop: '10px',
              padding: '4px 8px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
      
      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', background: backgroundColor }}
        camera={{ position: cameraPosition, fov: 75 }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={ambientLightIntensity} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={directionalLightIntensity}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        {/* Environment */}
        <Environment preset="sunset" />
        
        {/* Grid Helper */}
        {showGrid && (
          <gridHelper args={[100, 50, '#888888', '#aaaaaa']} position={[0, 0.1, 0]} />
        )}
        
        {/* Agricultural Terrain Analysis Component */}
        <AgriculturalTerrainAnalysis
          terrainConfig={terrainConfig}
          annotations={annotations}
          weatherData={weatherData}
          enableDrawing={enableInteraction}
          enable3D={viewMode === '3d'}
          showWeatherOverlay={enableWeatherOverlay}
          showSoilAnalysis={enableSoilAnalysis}
          showCropZones={enableCropZones}
          onAnnotationsChange={setAnnotations}
          onCreateAnnotation={handleAnnotationCreate}
          onSelectAnnotation={handleAnnotationSelect}
          onTerrainAnalysis={handleTerrainAnalysis}
        />
        
        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={viewMode === '3d'}
          minDistance={10}
          maxDistance={200}
          minPolarAngle={viewMode === 'topdown' ? 0 : Math.PI / 6}
          maxPolarAngle={viewMode === 'topdown' ? 0.1 : Math.PI / 2}
        />
        
        {/* Stats */}
        {showStats && <Stats />}
      </Canvas>
      
      {/* Loading indicator */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div>Loading terrain data...</div>
          <div style={{ marginTop: '10px', fontSize: '12px' }}>Please wait</div>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          background: 'rgba(255, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 'bold' }}>Error</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>{error}</div>
          <button
            onClick={() => setError(null)}
            style={{
              marginTop: '10px',
              padding: '4px 8px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedTerrainViewer; 
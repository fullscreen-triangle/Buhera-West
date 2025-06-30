import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Sky } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { GeologicalVisualization } from './geological/GeologicalVisualization';
import { OceanicVisualization } from './ocean/OceanicVisualization';
import { SolarVisualization } from './solar/SolarVisualization';
import { AgriculturalVisualization } from './agricultural/AgriculturalVisualization';
import { AtmosphericVisualization } from './atmospheric/AtmosphericVisualization';
import { PerformanceMonitor } from './performance/PerformanceMonitor';

/**
 * Environmental Intelligence Viewer - Main visualization component
 * Integrates geological, oceanic, solar, agricultural, and atmospheric visualizations
 */
export const EnvironmentalIntelligenceViewer = ({ 
  geologicalData,
  oceanicData, 
  solarData,
  agriculturalData,
  atmosphericData,
  enabled = true,
  targetFPS = 60,
  onPerformanceUpdate,
  debugMode = false
}) => {
  const canvasRef = useRef();
  const performanceMonitorRef = useRef();
  
  // Component visibility state
  const [componentVisibility, setComponentVisibility] = useState({
    geological: true,
    oceanic: true,
    solar: true,
    agricultural: true,
    atmospheric: true
  });
  
  // Performance and quality state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    qualityLevel: 1.0,
    memoryUsage: 0
  });
  
  // Auto-adjust quality based on data complexity
  const qualityLevel = useMemo(() => {
    if (!enabled) return 0.1;
    
    const baseQuality = performanceMetrics.qualityLevel;
    
    // Adjust based on data size
    const geologicalComplexity = geologicalData?.subsurfaceMesh?.length || 0;
    const oceanicComplexity = oceanicData?.surfaceMesh?.length || 0;
    const agriculturalComplexity = agriculturalData?.cropPositions?.length || 0;
    
    const totalComplexity = geologicalComplexity + oceanicComplexity + agriculturalComplexity;
    
    if (totalComplexity > 100000) {
      return Math.max(0.3, baseQuality * 0.7);
    } else if (totalComplexity > 50000) {
      return Math.max(0.5, baseQuality * 0.85);
    }
    
    return baseQuality;
  }, [performanceMetrics.qualityLevel, geologicalData, oceanicData, agriculturalData, enabled]);
  
  // Performance monitoring callback
  const handlePerformanceUpdate = useCallback((metrics) => {
    setPerformanceMetrics(metrics);
    
    // Auto-disable components if performance is critical
    if (metrics.fps < targetFPS * 0.3) {
      setComponentVisibility(prev => ({
        geological: true, // Keep most important
        oceanic: prev.oceanic && metrics.fps > 15,
        solar: prev.solar && metrics.fps > 20,
        agricultural: true, // Keep most important
        atmospheric: prev.atmospheric && metrics.fps > 25
      }));
    }
    
    if (onPerformanceUpdate) {
      onPerformanceUpdate(metrics);
    }
  }, [targetFPS, onPerformanceUpdate]);
  
  // Lighting configuration based on time and solar data
  const lightingConfig = useMemo(() => {
    const solarActivity = solarData?.activityLevel || 'moderate';
    const baseIntensity = 0.8;
    
    const intensityMultiplier = {
      quiet: 0.7,
      moderate: 1.0,
      active: 1.2,
      severe: 1.4,
      extreme: 1.6
    }[solarActivity] || 1.0;
    
    return {
      ambientIntensity: 0.2 * intensityMultiplier,
      directionalIntensity: baseIntensity * intensityMultiplier,
      directionalColor: solarActivity === 'extreme' ? 0xff8888 : 0xffffff
    };
  }, [solarData?.activityLevel]);
  
  // Camera position based on active visualizations
  const cameraPosition = useMemo(() => {
    const activeComponents = Object.entries(componentVisibility)
      .filter(([_, visible]) => visible)
      .map(([component, _]) => component);
    
    if (activeComponents.length === 1) {
      // Focus on single component
      const positions = {
        geological: [0, 50, 100],
        oceanic: [0, 100, 200],
        solar: [2200, 300, 200],
        agricultural: [0, 100, 150],
        atmospheric: [0, 200, 300]
      };
      return positions[activeComponents[0]] || [0, 100, 200];
    }
    
    // Multi-component overview
    return [500, 300, 800];
  }, [componentVisibility]);
  
  if (!enabled) return null;
  
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        ref={canvasRef}
        camera={{ 
          position: cameraPosition, 
          fov: 60,
          near: 0.1,
          far: 10000
        }}
        shadows={qualityLevel > 0.5}
        gl={{ 
          antialias: qualityLevel > 0.7,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true
        }}
        dpr={Math.min(2, window.devicePixelRatio * qualityLevel)}
      >
        {/* Performance Monitor */}
        <PerformanceMonitor
          ref={performanceMonitorRef}
          targetFPS={targetFPS}
          onPerformanceUpdate={handlePerformanceUpdate}
          enableAdaptiveQuality={true}
          debugMode={debugMode}
        />
        
        {/* Lighting Setup */}
        <ambientLight intensity={lightingConfig.ambientIntensity} />
        <directionalLight
          position={[100, 100, 50]}
          intensity={lightingConfig.directionalIntensity}
          color={lightingConfig.directionalColor}
          castShadow={qualityLevel > 0.5}
          shadow-mapSize={qualityLevel > 0.8 ? [2048, 2048] : [1024, 1024]}
        />
        
        {/* Sky and Environment */}
        {qualityLevel > 0.4 && (
          <Sky
            distance={450000}
            sunPosition={[0, 1, 0]}
            inclination={0}
            azimuth={0.25}
          />
        )}
        
        {/* Main Visualization Components */}
        {componentVisibility.geological && (
          <GeologicalVisualization
            data={geologicalData}
            qualityLevel={qualityLevel}
            enabled={componentVisibility.geological}
          />
        )}
        
        {componentVisibility.oceanic && (
          <OceanicVisualization
            data={oceanicData}
            qualityLevel={qualityLevel}
            enabled={componentVisibility.oceanic}
          />
        )}
        
        {componentVisibility.solar && (
          <SolarVisualization
            data={solarData}
            qualityLevel={qualityLevel}
            enabled={componentVisibility.solar}
          />
        )}
        
        {componentVisibility.agricultural && (
          <AgriculturalVisualization
            data={agriculturalData}
            qualityLevel={qualityLevel}
            enabled={componentVisibility.agricultural}
          />
        )}
        
        {componentVisibility.atmospheric && (
          <AtmosphericVisualization
            data={atmosphericData}
            qualityLevel={qualityLevel}
            enabled={componentVisibility.atmospheric}
          />
        )}
        
        {/* Ground Plane for Reference */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[4000, 4000]} />
          <meshLambertMaterial color="#8D6E63" transparent opacity={0.3} />
        </mesh>
        
        {/* Reference Objects for Scale */}
        {debugMode && (
          <>
            <mesh position={[0, 5, 0]} castShadow>
              <boxGeometry args={[10, 10, 10]} />
              <meshStandardMaterial color="#FF5722" />
            </mesh>
            <mesh position={[100, 5, 0]} castShadow>
              <sphereGeometry args={[5, 16, 16]} />
              <meshStandardMaterial color="#4CAF50" />
            </mesh>
          </>
        )}
        
        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={5000}
          maxPolarAngle={Math.PI / 1.8}
        />
        
        {/* Performance Stats */}
        {debugMode && <Stats />}
      </Canvas>
      
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        zIndex: 1000,
        minWidth: '200px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Environmental Intelligence</h3>
        
        {/* Component Toggles */}
        {Object.entries(componentVisibility).map(([component, visible]) => (
          <label key={component} style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setComponentVisibility(prev => ({
                ...prev,
                [component]: e.target.checked
              }))}
              style={{ marginRight: '8px' }}
            />
            {component.charAt(0).toUpperCase() + component.slice(1)}
          </label>
        ))}
        
        {/* Performance Info */}
        <div style={{ marginTop: '15px', borderTop: '1px solid #444', paddingTop: '10px' }}>
          <div>FPS: {performanceMetrics.fps?.toFixed(1) || 60}</div>
          <div>Quality: {Math.round((qualityLevel) * 100)}%</div>
          <div>Memory: {performanceMetrics.memoryUsage?.toFixed(0) || 0}MB</div>
        </div>
      </div>
    </div>
  );
};

EnvironmentalIntelligenceViewer.propTypes = {
  geologicalData: PropTypes.shape({
    subsurfaceMesh: PropTypes.instanceOf(Float32Array),
    mineralDeposits: PropTypes.array,
    groundwaterFlow: PropTypes.array,
  }),
  oceanicData: PropTypes.shape({
    surfaceMesh: PropTypes.instanceOf(Float32Array),
    currentVectors: PropTypes.array,
    temperatureField: PropTypes.instanceOf(Float32Array),
    waveData: PropTypes.object,
  }),
  solarData: PropTypes.shape({
    solarSurface: PropTypes.instanceOf(Float32Array),
    coronaParticles: PropTypes.array,
    magneticFieldLines: PropTypes.array,
    solarWindFlow: PropTypes.array,
    activityLevel: PropTypes.string,
  }),
  agriculturalData: PropTypes.shape({
    fieldMesh: PropTypes.instanceOf(Float32Array),
    cropPositions: PropTypes.array,
    sensorNetwork: PropTypes.array,
    irrigationCoverage: PropTypes.array,
    yieldPrediction: PropTypes.array,
  }),
  atmosphericData: PropTypes.shape({
    pressureField: PropTypes.instanceOf(Float32Array),
    temperatureField: PropTypes.instanceOf(Float32Array),
    humidityField: PropTypes.instanceOf(Float32Array),
    windVectors: PropTypes.array,
    gpsSignalData: PropTypes.object,
  }),
  enabled: PropTypes.bool,
  targetFPS: PropTypes.number,
  onPerformanceUpdate: PropTypes.func,
  debugMode: PropTypes.bool,
};

export default EnvironmentalIntelligenceViewer; 
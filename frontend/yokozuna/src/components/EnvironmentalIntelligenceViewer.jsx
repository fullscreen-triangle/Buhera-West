import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Sky } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

// TODO: Create these component modules
// import { GeologicalVisualization } from './geological/GeologicalVisualization';
// import { OceanicVisualization } from './oceanic/OceanicVisualization';
// import { SolarVisualization } from './solar/SolarVisualization';
// import { AgriculturalVisualization } from './agricultural/AgriculturalVisualization';
// import { AtmosphericVisualization } from './atmospheric/AtmosphericVisualization';
// import { PerformanceMonitor } from './performance/PerformanceMonitor';

/**
 * Main Environmental Intelligence Viewer Component
 * Integrates all environmental domains with high-performance 60 FPS rendering
 */
export const EnvironmentalIntelligenceViewer = ({
  environmentalData,
  websocketUrl,
  targetFPS = 60,
  enabledDomains = {
    geological: true,
    oceanic: true,
    solar: true,
    agricultural: true,
    atmospheric: true
  },
  qualitySettings = {
    particleCount: 10000,
    meshResolution: 256,
    shadowQuality: 'medium',
    enableAdvancedEffects: true
  },
  cameraConfig = {
    position: [100, 50, 100],
    target: [0, 0, 0],
    fov: 60
  },
  onPerformanceUpdate,
  focusDomain = null
}) => {
  // Performance monitoring state
  const [currentFPS, setCurrentFPS] = useState(60);
  const [adaptiveQuality, setAdaptiveQuality] = useState(1.0);
  const [isPerformanceOptimized, setIsPerformanceOptimized] = useState(false);
  
  // Real-time data state
  const [liveData, setLiveData] = useState(environmentalData || null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Refs for Three.js objects
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const performanceRef = useRef(null);
  
  // WebSocket connection for real-time data
  useEffect(() => {
    if (!websocketUrl) return;
    
    const ws = new WebSocket(websocketUrl);
    setConnectionStatus('connecting');
    
    ws.onopen = () => {
      setConnectionStatus('connected');
      console.log('Connected to Rust computational engine');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLiveData(data);
        
        // Update performance metrics
        if (data.performance && onPerformanceUpdate) {
          onPerformanceUpdate(data.performance);
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };
    
    ws.onclose = () => {
      setConnectionStatus('disconnected');
      console.log('Disconnected from Rust computational engine');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };
    
    return () => {
      ws.close();
    };
  }, [websocketUrl, onPerformanceUpdate]);
  
  // Adaptive quality management based on performance
  const adaptiveQualityManager = useCallback(() => {
    const frameBudget = 1000 / targetFPS; // ms per frame
    const performanceData = liveData?.performance;
    
    if (performanceData) {
      const currentFrameTime = 1000 / performanceData.fps;
      
      if (currentFrameTime > frameBudget * 1.2) {
        // Reduce quality if performance is below target
        setAdaptiveQuality(prev => Math.max(0.1, prev * 0.9));
        setIsPerformanceOptimized(true);
      } else if (currentFrameTime < frameBudget * 0.8 && adaptiveQuality < 1.0) {
        // Increase quality if performance allows
        setAdaptiveQuality(prev => Math.min(2.0, prev * 1.1));
      }
      
      setCurrentFPS(performanceData.fps);
    }
  }, [targetFPS, liveData?.performance, adaptiveQuality]);
  
  // Apply adaptive quality management
  useEffect(() => {
    const interval = setInterval(adaptiveQualityManager, 1000);
    return () => clearInterval(interval);
  }, [adaptiveQualityManager]);
  
  // Optimized quality settings based on adaptive quality
  const optimizedQualitySettings = useMemo(() => ({
    particleCount: Math.floor(qualitySettings.particleCount * adaptiveQuality),
    meshResolution: Math.floor(qualitySettings.meshResolution * adaptiveQuality),
    shadowQuality: adaptiveQuality > 0.7 ? qualitySettings.shadowQuality : 'low',
    enableAdvancedEffects: qualitySettings.enableAdvancedEffects && adaptiveQuality > 0.5
  }), [qualitySettings, adaptiveQuality]);
  
  // Domain-specific quality optimization
  const domainQualitySettings = useMemo(() => {
    const baseQuality = adaptiveQuality;
    
    // Boost quality for focused domain, reduce for others
    if (focusDomain) {
      return {
        geological: focusDomain === 'geological' ? baseQuality * 1.5 : baseQuality * 0.5,
        oceanic: focusDomain === 'oceanic' ? baseQuality * 1.5 : baseQuality * 0.5,
        solar: focusDomain === 'solar' ? baseQuality * 1.5 : baseQuality * 0.5,
        agricultural: focusDomain === 'agricultural' ? baseQuality * 1.5 : baseQuality * 0.5,
        atmospheric: focusDomain === 'atmospheric' ? baseQuality * 1.5 : baseQuality * 0.5
      };
    }
    
    return {
      geological: baseQuality,
      oceanic: baseQuality,
      solar: baseQuality,
      agricultural: baseQuality,
      atmospheric: baseQuality
    };
  }, [adaptiveQuality, focusDomain]);
  
  return (
    <div className="environmental-intelligence-viewer w-full h-screen relative">
      {/* Performance HUD */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded">
        <div>FPS: {currentFPS.toFixed(1)}</div>
        <div>Quality: {(adaptiveQuality * 100).toFixed(0)}%</div>
        <div>Status: {connectionStatus}</div>
        {isPerformanceOptimized && (
          <div className="text-yellow-400">Performance Optimized</div>
        )}
      </div>
      
      {/* Main 3D Canvas */}
      <Canvas
        ref={canvasRef}
        camera={{
          position: cameraConfig.position,
          fov: cameraConfig.fov,
          near: 0.1,
          far: 10000
        }}
        shadows={optimizedQualitySettings.shadowQuality !== 'low'}
        gl={{
          antialias: adaptiveQuality > 0.5,
          alpha: false,
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: true,
          powerPreference: 'high-performance'
        }}
        onCreated={({ gl }) => {
          // Optimize WebGL settings for high performance
          gl.setPixelRatio(Math.min(window.devicePixelRatio, adaptiveQuality * 2));
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        {/* Lighting Setup */}
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[100, 100, 50]}
          intensity={0.8}
          castShadow={optimizedQualitySettings.shadowQuality !== 'low'}
          shadow-mapSize-width={optimizedQualitySettings.shadowQuality === 'high' ? 2048 : 1024}
          shadow-mapSize-height={optimizedQualitySettings.shadowQuality === 'high' ? 2048 : 1024}
        />
        
        {/* Environmental Visualizations - TODO: Uncomment when components are created */}
        {/* {enabledDomains.geological && liveData?.geological && (
          <GeologicalVisualization
            data={liveData.geological}
            qualityLevel={domainQualitySettings.geological}
            enabled={enabledDomains.geological}
          />
        )}
        
        {enabledDomains.oceanic && liveData?.oceanic && (
          <OceanicVisualization
            data={liveData.oceanic}
            qualityLevel={domainQualitySettings.oceanic}
            enabled={enabledDomains.oceanic}
          />
        )}
        
        {enabledDomains.solar && liveData?.solar && (
          <SolarVisualization
            data={liveData.solar}
            qualityLevel={domainQualitySettings.solar}
            enabled={enabledDomains.solar}
          />
        )}
        
        {enabledDomains.agricultural && liveData?.agricultural && (
          <AgriculturalVisualization
            data={liveData.agricultural}
            qualityLevel={domainQualitySettings.agricultural}
            enabled={enabledDomains.agricultural}
          />
        )}
        
        {enabledDomains.atmospheric && liveData?.atmospheric && (
          <AtmosphericVisualization
            data={liveData.atmospheric}
            qualityLevel={domainQualitySettings.atmospheric}
            enabled={enabledDomains.atmospheric}
          />
        )} */}
        
        {/* Placeholder visualization mesh */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        
        {/* Environment and Sky */}
        <Sky
          distance={450000}
          sunPosition={[100, 20, 100]}
          inclination={0}
          azimuth={0.25}
        />
        
        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          target={cameraConfig.target}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={5000}
          minDistance={1}
        />
        
        {/* Performance Monitor - TODO: Create PerformanceMonitor component */}
        {/* <PerformanceMonitor
          ref={performanceRef}
          targetFPS={targetFPS}
          onPerformanceUpdate={setCurrentFPS}
        /> */}
        
        {/* Debug Stats (development only) */}
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
    </div>
  );
};

// PropTypes for type checking
EnvironmentalIntelligenceViewer.propTypes = {
  environmentalData: PropTypes.object,
  websocketUrl: PropTypes.string,
  targetFPS: PropTypes.number,
  enabledDomains: PropTypes.shape({
    geological: PropTypes.bool,
    oceanic: PropTypes.bool,
    solar: PropTypes.bool,
    agricultural: PropTypes.bool,
    atmospheric: PropTypes.bool,
  }),
  qualitySettings: PropTypes.shape({
    particleCount: PropTypes.number,
    meshResolution: PropTypes.number,
    shadowQuality: PropTypes.oneOf(['low', 'medium', 'high']),
    enableAdvancedEffects: PropTypes.bool,
  }),
  cameraConfig: PropTypes.shape({
    position: PropTypes.array,
    target: PropTypes.array,
    fov: PropTypes.number,
  }),
  onPerformanceUpdate: PropTypes.func,
  focusDomain: PropTypes.oneOf(['geological', 'oceanic', 'solar', 'agricultural', 'atmospheric', null]),
};

export default EnvironmentalIntelligenceViewer; 
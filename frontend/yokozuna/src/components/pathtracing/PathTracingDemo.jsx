import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { 
  PathTracingOrchestrator, 
  PathTracingControls, 
  RENDERING_MODES 
} from './PathTracingOrchestrator';

/**
 * Path Tracing Demo Component
 * Complete demonstration of the path tracing system with all modes and controls
 * Showcases the conversion of THREE.js-PathTracing-Renderer inspiration to React Three Fiber
 */

export const PathTracingDemo = ({ 
  initialMode = RENDERING_MODES.OCEAN_SKY,
  showStats = true,
  autoRotate = false 
}) => {
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [parameters, setParameters] = useState({});
  const [renderStats, setRenderStats] = useState({});
  const [globalQuality, setGlobalQuality] = useState(1.0);

  // Handle mode changes
  const handleModeChange = useCallback((newMode) => {
    console.log(`Switching to path tracing mode: ${newMode}`);
    setCurrentMode(newMode);
  }, []);

  // Handle parameter updates
  const handleParameterChange = useCallback((newParams) => {
    setParameters(prev => ({
      ...prev,
      ...newParams
    }));
  }, []);

  // Handle render updates
  const handleRenderUpdate = useCallback((updateData) => {
    setRenderStats(updateData.stats || {});
  }, []);

  // Sample environmental data (would come from Rust backend in real app)
  const sampleData = {
    surfaceMesh: new Float32Array(1000).fill(0).map(() => Math.random()),
    currentVectors: Array(50).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 100,
      y: 0,
      z: (Math.random() - 0.5) * 100
    })),
    temperatureField: new Float32Array(100).fill(15).map(() => 15 + Math.random() * 10),
    waveData: {
      amplitude: [1, 2, 3],
      frequency: [0.5, 1.0, 1.5]
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Three.js Canvas with Path Tracing */}
      <Canvas
        camera={{ 
          position: [0, 100, 400], 
          fov: 45,
          near: 0.1,
          far: 10000
        }}
        dpr={globalQuality}
        gl={{ 
          antialias: false, // Disabled for path tracing
          alpha: false,
          powerPreference: "high-performance"
        }}
      >
        {/* Camera Controls */}
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI}
          minDistance={10}
          maxDistance={2000}
        />

        {/* Performance Stats */}
        {showStats && <Stats />}

        {/* Path Tracing Orchestrator - Main System */}
        <PathTracingOrchestrator
          initialMode={currentMode}
          enabled={true}
          globalQualityLevel={globalQuality}
          showDebugInfo={true}
          onModeChange={handleModeChange}
          onRenderUpdate={handleRenderUpdate}
          data={sampleData}
        />

        {/* Ambient lighting for fallback rendering */}
        <ambientLight intensity={0.2} />
        <pointLight position={[100, 100, 100]} intensity={0.5} />
      </Canvas>

      {/* UI Controls */}
      <PathTracingControls
        currentMode={currentMode}
        onModeChange={handleModeChange}
        parameters={parameters}
        onParameterChange={handleParameterChange}
        renderStats={renderStats}
      />

      {/* Global Quality Control */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Performance</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Global Quality:</label>
          <input 
            type="range" 
            min="0.25" 
            max="1.0" 
            step="0.05"
            value={globalQuality}
            onChange={(e) => setGlobalQuality(parseFloat(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
          <span style={{ marginLeft: '10px' }}>{(globalQuality * 100).toFixed(0)}%</span>
        </div>
        
        <div style={{ fontSize: '10px', color: '#ccc' }}>
          <div>Resolution: {Math.floor(1024 * globalQuality)}x{Math.floor(1024 * globalQuality)}</div>
          <div>Pixel Ratio: {globalQuality.toFixed(2)}</div>
          <div>Auto-rotate: {autoRotate ? 'On' : 'Off'}</div>
        </div>
        
        <button 
          onClick={() => setCurrentMode(prev => {
            const modes = Object.values(RENDERING_MODES);
            const currentIndex = modes.indexOf(prev);
            return modes[(currentIndex + 1) % modes.length];
          })}
          style={{
            marginTop: '10px',
            padding: '5px 10px',
            backgroundColor: '#444',
            color: 'white',
            border: '1px solid #666',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Next Mode
        </button>
      </div>

      {/* Mode Information */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '11px',
        zIndex: 1000,
        maxWidth: '400px'
      }}>
        <h4 style={{ margin: '0 0 5px 0' }}>Current Mode: {currentMode.replace(/_/g, ' ').toUpperCase()}</h4>
        <div style={{ color: '#ccc' }}>
          {getModeDescription(currentMode)}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '11px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <h4 style={{ margin: '0 0 5px 0' }}>Controls</h4>
        <div style={{ color: '#ccc' }}>
          • Left Mouse: Rotate camera<br/>
          • Right Mouse: Pan camera<br/>
          • Wheel: Zoom in/out<br/>
          • Controls: Switch modes & adjust parameters<br/>
          • Wait for convergence when camera stops moving
        </div>
      </div>
    </div>
  );
};

// Helper function to get mode descriptions
function getModeDescription(mode) {
  const descriptions = {
    [RENDERING_MODES.OCEAN_SKY]: "Realistic ocean surface with animated waves, sky atmosphere, and floating objects. Features Perlin noise waves and Fresnel reflections.",
    [RENDERING_MODES.WATER]: "Path-traced water rendering with refraction, reflection, caustics, and underwater effects. Supports camera above/below water.",
    [RENDERING_MODES.TERRAIN]: "Procedural terrain with multiple octaves of Perlin noise, height-based materials, and atmospheric fog effects.",
    [RENDERING_MODES.PLANET]: "Planetary rendering with atmosphere scattering, surface materials, and space environment with star field.",
    [RENDERING_MODES.VOLUMETRIC]: "Volumetric cloud rendering with single scattering, phase functions, and realistic atmospheric effects.",
    [RENDERING_MODES.FRACTAL]: "3D fractal rendering including Mandelbulb, Julia sets, and Menger sponge with distance estimation ray marching.",
    [RENDERING_MODES.BVH_TERRAIN]: "Complex geometry rendering using Bounding Volume Hierarchy acceleration for high-polygon terrain models.",
    [RENDERING_MODES.CORNELL_BOX]: "Classic Cornell Box scene for path tracing validation with area lights, colored walls, and perfect diffuse materials."
  };
  
  return descriptions[mode] || "Advanced path tracing demonstration.";
}

export default PathTracingDemo; 
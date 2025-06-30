import React, { useState, useMemo, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';

// Import all path tracing components
import { PathTracingCore } from './PathTracingCore';
import { OceanicVisualization } from '../ocean/OceanicVisualization';
import { WaterRenderer } from './WaterRenderer';
import { TerrainRenderer } from './TerrainRenderer';
import { PlanetRenderer } from './PlanetRenderer';
import { VolumetricRenderer } from './VolumetricRenderer';
import { FractalRenderer } from './FractalRenderer';
import { BVHRenderer } from './BVHRenderer';
import { CornellBoxRenderer } from './CornellBoxRenderer';

/**
 * Path Tracing Orchestrator
 * Master component that manages and switches between different path tracing renderers
 * Based on all the inspiration JS files converted to React Three Fiber
 */

// Available rendering modes
export const RENDERING_MODES = {
  OCEAN_SKY: 'ocean_sky',
  WATER: 'water',
  TERRAIN: 'terrain',
  PLANET: 'planet',
  VOLUMETRIC: 'volumetric',
  FRACTAL: 'fractal',
  BVH_TERRAIN: 'bvh_terrain',
  CORNELL_BOX: 'cornell_box',
  MATERIAL_SHOWCASE: 'material_showcase',
  GEOMETRY_SHOWCASE: 'geometry_showcase'
};

// Default parameters for each mode
const DEFAULT_PARAMETERS = {
  [RENDERING_MODES.OCEAN_SKY]: {
    qualityLevel: 0.8,
    animationSpeed: 1.0
  },
  [RENDERING_MODES.WATER]: {
    waterLevel: 0.0,
    qualityLevel: 1.0
  },
  [RENDERING_MODES.TERRAIN]: {
    waterLevel: 400.0,
    terrainScale: 1.0,
    qualityLevel: 0.8
  },
  [RENDERING_MODES.PLANET]: {
    planetPosition: [0, 0, -500],
    planetRadius: 200,
    atmosphereHeight: 50,
    qualityLevel: 1.0
  },
  [RENDERING_MODES.VOLUMETRIC]: {
    density: 0.5,
    scattering: 1.0,
    qualityLevel: 1.0
  },
  [RENDERING_MODES.FRACTAL]: {
    fractalScale: 1.0,
    fractalPower: 8.0,
    qualityLevel: 1.0
  },
  [RENDERING_MODES.BVH_TERRAIN]: {
    modelPath: "/models/terrain.glb",
    modelScale: 1.0,
    qualityLevel: 0.8
  },
  [RENDERING_MODES.CORNELL_BOX]: {
    lightIntensity: 15.0,
    qualityLevel: 1.0
  }
};

export const PathTracingOrchestrator = ({ 
  initialMode = RENDERING_MODES.OCEAN_SKY,
  enabled = true,
  globalQualityLevel = 1.0,
  showDebugInfo = false,
  onModeChange,
  onRenderUpdate,
  data
}) => {
  const { camera, size } = useThree();
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [renderStats, setRenderStats] = useState({
    frameCounter: 0,
    sampleCounter: 0,
    isMoving: false,
    frameTime: 0
  });

  // Handle mode switching
  const switchMode = useCallback((newMode) => {
    if (Object.values(RENDERING_MODES).includes(newMode)) {
      setCurrentMode(newMode);
      if (onModeChange) {
        onModeChange(newMode);
      }
    }
  }, [onModeChange]);

  // Update parameters for current mode
  const updateParameters = useCallback((newParams) => {
    setParameters(prev => ({
      ...prev,
      [currentMode]: {
        ...prev[currentMode],
        ...newParams
      }
    }));
  }, [currentMode]);

  // Combined render update handler
  const handleRenderUpdate = useCallback((stats) => {
    setRenderStats(prev => ({
      ...prev,
      ...stats
    }));
    
    if (onRenderUpdate) {
      onRenderUpdate({
        mode: currentMode,
        stats,
        parameters: parameters[currentMode]
      });
    }
  }, [currentMode, parameters, onRenderUpdate]);

  // Get current mode parameters
  const currentParams = useMemo(() => ({
    ...parameters[currentMode],
    qualityLevel: (parameters[currentMode]?.qualityLevel || 1.0) * globalQualityLevel
  }), [parameters, currentMode, globalQualityLevel]);

  // Adaptive quality based on performance
  const adaptiveQuality = useMemo(() => {
    if (!showDebugInfo) return currentParams.qualityLevel;
    
    // Reduce quality if frame time is too high
    const targetFrameTime = 1000 / 60; // 60 FPS target
    const qualityMultiplier = renderStats.frameTime > targetFrameTime ? 0.8 : 1.0;
    
    return Math.max(0.25, currentParams.qualityLevel * qualityMultiplier);
  }, [currentParams.qualityLevel, renderStats.frameTime, showDebugInfo]);

  if (!enabled) return null;

  return (
    <group name="path-tracing-orchestrator">
      {/* Ocean and Sky Rendering */}
      {currentMode === RENDERING_MODES.OCEAN_SKY && (
        <OceanicVisualization
          data={data}
          qualityLevel={adaptiveQuality}
          enabled={true}
          onRenderUpdate={handleRenderUpdate}
        />
      )}

      {/* Water Rendering */}
      {currentMode === RENDERING_MODES.WATER && (
        <WaterRenderer
          waterLevel={currentParams.waterLevel}
          qualityLevel={adaptiveQuality}
          enabled={true}
          onRenderUpdate={handleRenderUpdate}
        />
      )}

      {/* Terrain Rendering */}
      {currentMode === RENDERING_MODES.TERRAIN && (
        <TerrainRenderer
          waterLevel={currentParams.waterLevel}
          terrainScale={currentParams.terrainScale}
          qualityLevel={adaptiveQuality}
          enabled={true}
          onRenderUpdate={handleRenderUpdate}
        />
      )}

      {/* Planet Rendering */}
      {currentMode === RENDERING_MODES.PLANET && (
        <PlanetRenderer
          planetPosition={currentParams.planetPosition}
          planetRadius={currentParams.planetRadius}
          atmosphereHeight={currentParams.atmosphereHeight}
          qualityLevel={adaptiveQuality}
          enabled={true}
          onRenderUpdate={handleRenderUpdate}
        />
      )}

      {/* Volumetric Rendering */}
      {currentMode === RENDERING_MODES.VOLUMETRIC && (
        <VolumetricRenderer
          density={currentParams.density}
          scattering={currentParams.scattering}
          qualityLevel={adaptiveQuality}
          enabled={true}
          onRenderUpdate={handleRenderUpdate}
        />
      )}

      {/* Fractal Rendering */}
      {currentMode === RENDERING_MODES.FRACTAL && (
        <FractalRenderer
          fractalScale={currentParams.fractalScale}
          fractalPower={currentParams.fractalPower}
          qualityLevel={adaptiveQuality}
          enabled={true}
          onRenderUpdate={handleRenderUpdate}
        />
      )}

      {/* BVH Terrain Rendering */}
      {currentMode === RENDERING_MODES.BVH_TERRAIN && (
        <BVHRenderer
          modelPath={currentParams.modelPath}
          modelScale={currentParams.modelScale}
          qualityLevel={adaptiveQuality}
          enabled={true}
          onRenderUpdate={handleRenderUpdate}
        />
      )}

      {/* Cornell Box Rendering */}
      {currentMode === RENDERING_MODES.CORNELL_BOX && (
        <CornellBoxRenderer
          lightIntensity={currentParams.lightIntensity}
          qualityLevel={adaptiveQuality}
          enabled={true}
          onRenderUpdate={handleRenderUpdate}
        />
      )}

      {/* Debug Information */}
      {showDebugInfo && (
        <group name="debug-info">
          {/* Debug info will be rendered as HTML overlay by parent component */}
        </group>
      )}
    </group>
  );
};

// Export mode controls component
export const PathTracingControls = ({ 
  currentMode, 
  onModeChange, 
  parameters, 
  onParameterChange,
  renderStats 
}) => {
  return (
    <div className="path-tracing-controls" style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Path Tracing Controls</h3>
      
      {/* Mode Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label>Rendering Mode:</label>
        <select 
          value={currentMode} 
          onChange={(e) => onModeChange(e.target.value)}
          style={{ 
            marginLeft: '10px', 
            padding: '2px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555'
          }}
        >
          {Object.entries(RENDERING_MODES).map(([key, value]) => (
            <option key={value} value={value}>
              {key.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Render Statistics */}
      <div style={{ marginBottom: '15px' }}>
        <div>Samples: {renderStats?.sampleCounter || 0}</div>
        <div>Frame: {renderStats?.frameCounter || 0}</div>
        <div>Moving: {renderStats?.isMoving ? 'Yes' : 'No'}</div>
        <div>Frame Time: {(renderStats?.frameTime || 0).toFixed(2)}ms</div>
      </div>

      {/* Mode-specific Parameters */}
      {currentMode === RENDERING_MODES.WATER && (
        <div>
          <label>Water Level:</label>
          <input 
            type="range" 
            min="-100" 
            max="100" 
            value={parameters?.waterLevel || 0}
            onChange={(e) => onParameterChange({ waterLevel: parseFloat(e.target.value) })}
            style={{ marginLeft: '10px' }}
          />
          <span style={{ marginLeft: '10px' }}>{parameters?.waterLevel || 0}</span>
        </div>
      )}

      {currentMode === RENDERING_MODES.VOLUMETRIC && (
        <div>
          <div style={{ marginBottom: '5px' }}>
            <label>Density:</label>
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="0.1"
              value={parameters?.density || 0.5}
              onChange={(e) => onParameterChange({ density: parseFloat(e.target.value) })}
              style={{ marginLeft: '10px' }}
            />
            <span style={{ marginLeft: '10px' }}>{parameters?.density || 0.5}</span>
          </div>
          <div>
            <label>Scattering:</label>
            <input 
              type="range" 
              min="0" 
              max="3" 
              step="0.1"
              value={parameters?.scattering || 1.0}
              onChange={(e) => onParameterChange({ scattering: parseFloat(e.target.value) })}
              style={{ marginLeft: '10px' }}
            />
            <span style={{ marginLeft: '10px' }}>{parameters?.scattering || 1.0}</span>
          </div>
        </div>
      )}

      {currentMode === RENDERING_MODES.CORNELL_BOX && (
        <div>
          <label>Light Intensity:</label>
          <input 
            type="range" 
            min="1" 
            max="30" 
            step="1"
            value={parameters?.lightIntensity || 15}
            onChange={(e) => onParameterChange({ lightIntensity: parseFloat(e.target.value) })}
            style={{ marginLeft: '10px' }}
          />
          <span style={{ marginLeft: '10px' }}>{parameters?.lightIntensity || 15}</span>
        </div>
      )}

      {/* Quality Control */}
      <div style={{ marginTop: '15px' }}>
        <label>Quality Level:</label>
        <input 
          type="range" 
          min="0.25" 
          max="1.0" 
          step="0.05"
          value={parameters?.qualityLevel || 1.0}
          onChange={(e) => onParameterChange({ qualityLevel: parseFloat(e.target.value) })}
          style={{ marginLeft: '10px' }}
        />
        <span style={{ marginLeft: '10px' }}>{((parameters?.qualityLevel || 1.0) * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};

PathTracingOrchestrator.propTypes = {
  initialMode: PropTypes.string,
  enabled: PropTypes.bool,
  globalQualityLevel: PropTypes.number,
  showDebugInfo: PropTypes.bool,
  onModeChange: PropTypes.func,
  onRenderUpdate: PropTypes.func,
  data: PropTypes.object
};

PathTracingControls.propTypes = {
  currentMode: PropTypes.string.isRequired,
  onModeChange: PropTypes.func.isRequired,
  parameters: PropTypes.object,
  onParameterChange: PropTypes.func.isRequired,
  renderStats: PropTypes.object
};

export default PathTracingOrchestrator; 
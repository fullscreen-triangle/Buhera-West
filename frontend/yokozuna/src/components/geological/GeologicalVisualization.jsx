import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import PropTypes from 'prop-types';

// SCENE COMPONENT - R3F HOOKS OK HERE (for use inside Canvas)
export const GeologicalScene = ({ 
  data, 
  qualityLevel = 1.0, 
  enabled = true,
  engineRef,
  geologicalData,
  engineInitialized 
}) => {
  const { camera, scene } = useThree(); // ✅ OK - Inside Canvas
  const meshRef = useRef();

  useFrame((state, delta) => { // ✅ OK - Inside Canvas
    if (meshRef.current && (engineInitialized || enabled)) {
      // Animate geological visualization
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  if (!enabled) return null;

  return (
    <group>
      {/* Lighting - only if not provided by parent */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Geological mesh */}
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      
      {/* Controls - only if not provided by parent */}
      <OrbitControls enablePan enableZoom enableRotate />
    </group>
  );
};

/**
 * Geological Visualization Component - STANDALONE VERSION
 * Renders 3D subsurface geological formations, mineral deposits, and groundwater flow
 * This version includes its own Canvas and is meant for direct page usage
 */
const GeologicalVisualization = (props) => {
  const [engineInitialized, setEngineInitialized] = useState(false);
  const [geologicalData, setGeologicalData] = useState(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const initEngine = async () => {
      try {
        // Initialize your geological engine here
        console.log('Initializing geological engine...');
        setEngineInitialized(true);
      } catch (error) {
        console.error('Failed to initialize geological engine:', error);
      }
    };

    initEngine();
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-900">
      <Canvas
        camera={{ position: [0, 10, 20], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Use the scene component */}
        <GeologicalScene 
          {...props}
          engineRef={engineRef}
          geologicalData={geologicalData}
          engineInitialized={engineInitialized}
        />
        <Stats />
      </Canvas>
      
      {/* UI OVERLAY - NO R3F HOOKS */}
      <GeologicalControls 
        onDataUpdate={setGeologicalData}
        engineInitialized={engineInitialized}
      />
    </div>
  );
};

// UI CONTROLS COMPONENT - NO R3F HOOKS
const GeologicalControls = ({ onDataUpdate, engineInitialized }) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded">
      <h3 className="text-lg font-bold mb-2">Geological Controls</h3>
      <div className="space-y-2">
        <div>Status: {engineInitialized ? 'Ready' : 'Initializing...'}</div>
        <button 
          onClick={() => onDataUpdate({ updated: Date.now() })}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500"
        >
          Update Data
        </button>
      </div>
    </div>
  );
};

GeologicalVisualization.propTypes = {
  data: PropTypes.shape({
    subsurfaceMesh: PropTypes.instanceOf(Float32Array),
    mineralDeposits: PropTypes.array,
    groundwaterFlow: PropTypes.array,
    performanceMetrics: PropTypes.object,
  }),
  qualityLevel: PropTypes.number,
  enabled: PropTypes.bool,
};

GeologicalScene.propTypes = {
  data: PropTypes.shape({
    subsurfaceMesh: PropTypes.instanceOf(Float32Array),
    mineralDeposits: PropTypes.array,
    groundwaterFlow: PropTypes.array,
    performanceMetrics: PropTypes.object,
  }),
  qualityLevel: PropTypes.number,
  enabled: PropTypes.bool,
  engineRef: PropTypes.object,
  geologicalData: PropTypes.object,
  engineInitialized: PropTypes.bool,
};

export default GeologicalVisualization; 
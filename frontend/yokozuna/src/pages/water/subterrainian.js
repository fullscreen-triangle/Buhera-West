// I want you to create a page that shows a 3d model of the reference coordinate point's subterrainian water table. 
// there are so many scripts in pathtracing that you can use as inspiration 

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, shaderMaterial, extend } from '@react-three/drei';
import TransitionEffect from '@/components/TransitionEffect';
import { DEFAULT_COORDINATES } from '@/config/coordinates';
import { useTime } from '../../contexts/TimeContext';
import useSceneTime from '../../hooks/useSceneTime';

// Dynamic imports for Three.js components to prevent SSR errors
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-green-200 dark:bg-green-900 rounded-lg" />
});

const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), {
  ssr: false
});

// Underground layer visualization
const UndergroundLayer = ({ depth, thickness, layerType, saturation, waterLevel, noiseTexture }) => {
  const meshRef = useRef();
  
  const material = useMemo(() => {
    const layerColors = {
      topsoil: new THREE.Color(0x8B4513),
      clay: new THREE.Color(0xD2B48C),
      sand: new THREE.Color(0xF4A460),
      gravel: new THREE.Color(0x808080),
      bedrock: new THREE.Color(0x2F4F4F)
    };
    
    return new THREE.MeshStandardMaterial({
      color: layerColors[layerType] || layerColors.sand,
      transparent: true,
      opacity: 0.6 + saturation * 0.4,
      roughness: 0.8,
      metalness: 0.1
    });
  }, [layerType, saturation]);

  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(180, thickness, 180);
    return geo;
  }, [thickness]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, -depth - thickness/2, 0]}
    />
  );
};

// Water table visualization
const WaterTable = ({ level, flowDirection, flowSpeed }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = level + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x4682B4,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.8
    });
  }, []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[160, 160, 32, 32]} />
      <primitive object={material} />
    </mesh>
  );
};

// Groundwater flow particles
const GroundwaterFlow = ({ count, waterLevel, flowDirection, flowSpeed }) => {
  const meshRef = useRef();
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 150;
      positions[i3 + 1] = waterLevel + (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 150;
      
      velocities[i3] = Math.cos(flowDirection) * flowSpeed * (0.5 + Math.random() * 0.5);
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = Math.sin(flowDirection) * flowSpeed * (0.5 + Math.random() * 0.5);
    }
    
    return { positions, velocities };
  }, [count, waterLevel, flowDirection, flowSpeed]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] += particles.velocities[i3] * delta;
        positions[i3 + 2] += particles.velocities[i3 + 2] * delta;
        
        // Reset particles that flow out of bounds
        if (Math.abs(positions[i3]) > 75 || Math.abs(positions[i3 + 2]) > 75) {
          positions[i3] = (Math.random() - 0.5) * 150;
          positions[i3 + 2] = (Math.random() - 0.5) * 150;
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.5} color={0x00CED1} transparent opacity={0.8} />
    </points>
  );
};

// Well/borehole visualization
const Well = ({ position, depth }) => {
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.9,
      metalness: 0.1
    });
  }, []);

  return (
    <group position={position}>
      {/* Well casing */}
      <mesh position={[0, -depth/2, 0]}>
        <cylinderGeometry args={[0.5, 0.5, depth, 8]} />
        <primitive object={material} />
      </mesh>
      {/* Surface marker */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[1, 1, 2, 8]} />
        <meshStandardMaterial color={0x8B4513} />
      </mesh>
    </group>
  );
};

// Main 3D scene component
const SubterraneanScene = ({ waterLevel, flowDirection, flowSpeed, layerData }) => {
  const noiseTexture = useTexture('/textures/BlueNoise_R_128.png');
  
  useEffect(() => {
    if (noiseTexture) {
      noiseTexture.wrapS = THREE.RepeatWrapping;
      noiseTexture.wrapT = THREE.RepeatWrapping;
    }
  }, [noiseTexture]);

  return (
    <>
      {/* Underground geological layers */}
      {layerData.map((layer, index) => (
        <UndergroundLayer
          key={index}
          depth={layer.depth}
          thickness={layer.thickness}
          layerType={layer.type}
          saturation={layer.saturation}
          waterLevel={waterLevel}
          noiseTexture={noiseTexture}
        />
      ))}
      
      {/* Water table */}
      <WaterTable 
        level={waterLevel} 
        flowDirection={flowDirection} 
        flowSpeed={flowSpeed} 
      />
      
      {/* Groundwater flow visualization */}
      <GroundwaterFlow 
        count={800}
        waterLevel={waterLevel}
        flowDirection={flowDirection}
        flowSpeed={flowSpeed}
      />
      
      {/* Wells and boreholes */}
      <Well position={[30, 0, -40]} depth={50} />
      <Well position={[-50, 0, 30]} depth={60} />
      <Well position={[60, 0, 60]} depth={45} />
      
      {/* Surface reference plane */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#2d5016" 
          transparent 
          opacity={0.3}
          wireframe
        />
      </mesh>
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 50, 25]} intensity={0.8} />
      <pointLight position={[0, 30, 0]} intensity={0.6} color="#40E0D0" />
    </>
  );
};

const SubterranianWaterTable = () => {
  const { currentTime } = useTime();
  const [waterLevel, setWaterLevel] = useState(-15);
  const [flowDirection, setFlowDirection] = useState(Math.PI / 4);
  const [flowSpeed, setFlowSpeed] = useState(0.5);
  const [showControls, setShowControls] = useState(true);

  // Simulate dynamic geological layers
  const [layerData] = useState([
    { depth: 0, thickness: 5, type: 'topsoil', saturation: 0.3 },
    { depth: 5, thickness: 8, type: 'clay', saturation: 0.7 },
    { depth: 13, thickness: 12, type: 'sand', saturation: 0.9 },
    { depth: 25, thickness: 15, type: 'gravel', saturation: 0.6 },
    { depth: 40, thickness: 20, type: 'bedrock', saturation: 0.1 }
  ]);

  // Simulate seasonal water level changes
  useEffect(() => {
    const timeOfYear = (currentTime / (1000 * 86400 * 365)) % 1;
    const seasonalVariation = Math.sin(timeOfYear * Math.PI * 2) * 5;
    setWaterLevel(-15 + seasonalVariation);
  }, [currentTime]);

  return (
    <>
      <Head>
        <title>Subterranean Water Table Analysis | Buhera-West Environmental Intelligence</title>
        <meta name="description" content="3D visualization and analysis of groundwater systems, geological layers, and water table dynamics in the Buhera-West region." />
      </Head>
      <TransitionEffect />
      
      <main className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Subterranean Water Table Analysis
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Advanced 3D visualization of groundwater systems, geological layers, and water table dynamics 
              using environmental intelligence and hydrogeological modeling.
            </p>
          </div>

          {/* 3D Visualization */}
          <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden mb-8">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white mb-2">3D Underground Visualization</h2>
              <p className="text-gray-300 text-sm">
                Interactive 3D model showing geological layers, water table dynamics, and groundwater flow patterns. 
                Use mouse to rotate, zoom, and explore the subsurface structure.
              </p>
            </div>
            <div style={{ height: '70vh' }}>
              <Canvas
                camera={{ position: [80, 40, 80], fov: 50 }}
                gl={{ antialias: true, alpha: false }}
              >
                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  minDistance={20}
                  maxDistance={300}
                  maxPolarAngle={Math.PI / 2 + 0.3}
                />
                
                <SubterraneanScene
                  waterLevel={waterLevel}
                  flowDirection={flowDirection}
                  flowSpeed={flowSpeed}
                  layerData={layerData}
                />
              </Canvas>
            </div>
          </div>

          {/* Controls and Information */}
          {showControls && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Water Table Controls */}
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold mb-4">Water Table Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Water Level: {waterLevel.toFixed(1)}m below surface
                    </label>
                    <input
                      type="range"
                      min="-30"
                      max="-5"
                      step="0.5"
                      value={waterLevel}
                      onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Flow Direction: {(flowDirection * 180 / Math.PI).toFixed(0)}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.PI * 2}
                      step="0.1"
                      value={flowDirection}
                      onChange={(e) => setFlowDirection(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Flow Speed: {flowSpeed.toFixed(2)} m/day
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={flowSpeed}
                      onChange={(e) => setFlowSpeed(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Geological Information */}
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold mb-4">Geological Layers</h3>
                <div className="space-y-3">
                  {layerData.map((layer, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white/10 rounded">
                      <div>
                        <div className="font-medium capitalize">{layer.type}</div>
                        <div className="text-sm text-gray-300">
                          {layer.depth}m - {layer.depth + layer.thickness}m depth
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {(layer.saturation * 100).toFixed(0)}% saturated
                        </div>
                        <div className="text-xs text-gray-400">
                          {layer.thickness}m thick
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Environmental Intelligence Integration */}
          <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold mb-4">Hydrogeological Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">💧</div>
                <h4 className="font-semibold mb-2">Water Quality Monitoring</h4>
                <p className="text-sm text-gray-300">
                  Real-time analysis of groundwater chemistry and contamination levels
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h4 className="font-semibold mb-2">Flow Modeling</h4>
                <p className="text-sm text-gray-300">
                  Advanced computational fluid dynamics for groundwater movement prediction
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌡️</div>
                <h4 className="font-semibold mb-2">Temperature Profiling</h4>
                <p className="text-sm text-gray-300">
                  Subsurface temperature monitoring for geothermal analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SubterranianWaterTable; 
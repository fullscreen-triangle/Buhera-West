// I want you to create a page that shows a 3d model of the reference coordinate point's subterrainian water table. 
// there are so many scripts in pathtracing that you can use as inspiration 

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
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

const useFrame = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.useFrame })), {
  ssr: false
});

const useThree = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.useThree })), {
  ssr: false
});

const shaderMaterial = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.shaderMaterial })), {
  ssr: false
});

const useTexture = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.useTexture })), {
  ssr: false
});

const extend = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.extend })), {
  ssr: false
});

/**
 * Subterranean Water Table 3D Visualization
 * 
 * Advanced 3D visualization of underground water systems at reference coordinates:
 * - Multi-layer geological structure with realistic aquifers
 * - Dynamic groundwater flow visualization with particle systems
 * - Water table level fluctuations over time
 * - Soil saturation mapping with volumetric rendering
 * - Underground infrastructure (wells, boreholes) representation
 * - Cross-sectional view of subsurface hydrology
 * 
 * Inspired by pathtracing components: TerrainRenderer, WaterRenderer, VolumetricRenderer
 */

// Custom shader material for underground layers
const UndergroundLayerMaterial = shaderMaterial(
  {
    uTime: 0,
    uWaterLevel: 0,
    uSoilMoisture: 0,
    uLayerDepth: 0,
    uLayerType: 0, // 0: topsoil, 1: clay, 2: sand, 3: bedrock
    uSaturation: 0,
    tNoiseTexture: null
  },
  // Vertex shader
  `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    void main() {
      vPosition = position;
      vNormal = normal;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform float uWaterLevel;
    uniform float uSoilMoisture;
    uniform float uLayerDepth;
    uniform int uLayerType;
    uniform float uSaturation;
    uniform sampler2D tNoiseTexture;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    vec3 getLayerColor(int layerType, float saturation, vec3 pos) {
      vec3 baseColor;
      
      if (layerType == 0) { // Topsoil
        baseColor = vec3(0.4, 0.2, 0.1); // Brown
      } else if (layerType == 1) { // Clay
        baseColor = vec3(0.6, 0.5, 0.3); // Clay color
      } else if (layerType == 2) { // Sand/Gravel
        baseColor = vec3(0.8, 0.7, 0.5); // Sandy color
      } else { // Bedrock
        baseColor = vec3(0.3, 0.3, 0.3); // Gray rock
      }
      
      // Add moisture effect
      float moisture = saturation * uSoilMoisture;
      baseColor = mix(baseColor, baseColor * 0.5, moisture);
      
      // Add texture variation using noise
      vec2 noiseUV = pos.xz * 0.01 + vec2(uTime * 0.1, 0.0);
      float noise = texture2D(tNoiseTexture, noiseUV).r;
      baseColor += (noise - 0.5) * 0.1;
      
      return baseColor;
    }
    
    void main() {
      vec3 layerColor = getLayerColor(uLayerType, uSaturation, vPosition);
      
      // Add depth-based darkening
      float depthFactor = exp(-uLayerDepth * 0.01);
      layerColor *= depthFactor;
      
      // Add some subtle lighting
      vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
      float ndotl = max(0.0, dot(vNormal, lightDir));
      layerColor *= (0.3 + 0.7 * ndotl);
      
      gl_FragColor = vec4(layerColor, 1.0);
    }
  `
);

// Water table shader material
const WaterTableMaterial = shaderMaterial(
  {
    uTime: 0,
    uFlowDirection: [1, 0],
    uFlowSpeed: 0.5,
    uTransparency: 0.6
  },
  // Vertex shader
  `
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform vec2 uFlowDirection;
    uniform float uFlowSpeed;
    uniform float uTransparency;
    
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      // Animated water effect
      vec2 flowUV = vUv + uFlowDirection * uTime * uFlowSpeed;
      
      // Simple wave pattern
      float wave1 = sin(flowUV.x * 10.0 + uTime * 2.0) * 0.1;
      float wave2 = cos(flowUV.y * 8.0 + uTime * 1.5) * 0.1;
      float wavePattern = (wave1 + wave2) * 0.5 + 0.5;
      
      // Water color with flow visualization
      vec3 waterColor = mix(vec3(0.0, 0.3, 0.6), vec3(0.2, 0.5, 0.8), wavePattern);
      
      gl_FragColor = vec4(waterColor, uTransparency);
    }
  `
);

// Extend Three.js with custom materials
extend({ UndergroundLayerMaterial, WaterTableMaterial });

// Groundwater flow particles
const GroundwaterFlow = ({ count = 1000, waterLevel, flowDirection, flowSpeed }) => {
  const meshRef = useRef();
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200; // x
      positions[i * 3 + 1] = waterLevel + (Math.random() - 0.5) * 10; // y around water level
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // z
    }
    return positions;
  }, [count, waterLevel]);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const positions = meshRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < count; i++) {
        // Animate particles along flow direction
        positions[i * 3] += flowDirection[0] * flowSpeed * 0.1;
        positions[i * 3 + 2] += flowDirection[1] * flowSpeed * 0.1;
        
        // Reset particles that flow out of bounds
        if (positions[i * 3] > 100) positions[i * 3] = -100;
        if (positions[i * 3] < -100) positions[i * 3] = 100;
        if (positions[i * 3 + 2] > 100) positions[i * 3 + 2] = -100;
        if (positions[i * 3 + 2] < -100) positions[i * 3 + 2] = 100;
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#40E0D0" transparent opacity={0.8} />
    </points>
  );
};

// Underground layer component
const UndergroundLayer = ({ depth, thickness, layerType, saturation, waterLevel, noiseTexture }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
      meshRef.current.material.uniforms.uWaterLevel.value = waterLevel;
      meshRef.current.material.uniforms.uLayerDepth.value = depth;
      meshRef.current.material.uniforms.uLayerType.value = layerType;
      meshRef.current.material.uniforms.uSaturation.value = saturation;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -depth - thickness/2, 0]}>
      <boxGeometry args={[200, thickness, 200]} />
      <undergroundLayerMaterial 
        uSoilMoisture={0.8}
        tNoiseTexture={noiseTexture}
      />
    </mesh>
  );
};

// Water table layer
const WaterTable = ({ level, flowDirection, flowSpeed }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
      meshRef.current.material.uniforms.uFlowDirection.value = flowDirection;
      meshRef.current.material.uniforms.uFlowSpeed.value = flowSpeed;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, level, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200, 64, 64]} />
      <waterTableMaterial transparent />
    </mesh>
  );
};

// Well/Borehole component
const Well = ({ position, depth, diameter = 1 }) => {
  return (
    <group position={position}>
      {/* Well casing */}
      <mesh position={[0, -depth/2, 0]}>
        <cylinderGeometry args={[diameter, diameter, depth, 8]} />
        <meshStandardMaterial color="#666666" transparent opacity={0.8} />
      </mesh>
      
      {/* Well head */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[diameter * 1.5, diameter * 1.5, 2, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Water level indicator in well */}
      <mesh position={[0, -depth * 0.3, 0]}>
        <cylinderGeometry args={[diameter * 0.8, diameter * 0.8, 1, 8]} />
        <meshStandardMaterial color="#40E0D0" transparent opacity={0.9} />
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

// Main page component
const SubterranianWaterTable = () => {
  const [waterLevel, setWaterLevel] = useState(-15);
  const [flowDirection, setFlowDirection] = useState([0.5, 0.3]);
  const [flowSpeed, setFlowSpeed] = useState(0.5);
  const [viewMode, setViewMode] = useState('cutaway'); // 'cutaway' | 'cross-section' | 'layers'

  // Time controls integration
  const { setShowTimeControls, setScene, currentTime } = useTime();
  const { getDayNightCycle, getSeasonalCycle } = useSceneTime();

  useEffect(() => {
    setShowTimeControls(true);
    setScene('agriculture'); // Use yearly cycle for seasonal water table changes
    
    return () => {
      // Keep controls visible
    };
  }, [setShowTimeControls, setScene]);

  // Dynamic water level based on seasonal cycle
  useEffect(() => {
    const seasonalVariation = getSeasonalCycle() * 8; // 8m seasonal variation
    const dailyVariation = Math.sin(getDayNightCycle() * Math.PI) * 2; // 2m daily variation
    setWaterLevel(-15 + seasonalVariation + dailyVariation);
  }, [getSeasonalCycle, getDayNightCycle]);

  // Geological layer configuration
  const layerData = useMemo(() => [
    { depth: 0, thickness: 5, type: 0, saturation: 0.3 }, // Topsoil
    { depth: 5, thickness: 8, type: 1, saturation: 0.6 }, // Clay layer
    { depth: 13, thickness: 15, type: 2, saturation: 0.9 }, // Sand/gravel aquifer
    { depth: 28, thickness: 12, type: 1, saturation: 0.4 }, // Clay layer
    { depth: 40, thickness: 20, type: 2, saturation: 0.95 }, // Deep aquifer
    { depth: 60, thickness: 40, type: 3, saturation: 0.1 }, // Bedrock
  ], []);

  // Calculate subsurface statistics
  const subsurfaceStats = useMemo(() => ({
    averageSaturation: layerData.reduce((sum, layer) => sum + layer.saturation, 0) / layerData.length,
    aquiferDepth: layerData.find(layer => layer.type === 2)?.depth || 0,
    bedrockDepth: layerData.find(layer => layer.type === 3)?.depth || 0,
    totalWaterVolume: layerData.reduce((sum, layer) => 
      sum + (layer.thickness * 200 * 200 * layer.saturation * 0.001), 0) // m³
  }), [layerData]);

  return (
    <>
      <Head>
        <title>Subterranean Water Table | 3D Groundwater Visualization</title>
        <meta 
          name="description" 
          content="Advanced 3D visualization of subterranean water table and aquifer systems at reference coordinates with real-time groundwater flow analysis" 
        />
      </Head>
      
      <TransitionEffect />
      
      <main className="w-full min-h-screen bg-gradient-to-b from-amber-900 via-orange-900 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Subterranean Water Table
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-4">
              Advanced 3D visualization of underground water systems showing geological layers, 
              aquifer dynamics, and groundwater flow patterns at the reference coordinate point.
            </p>
            <div className="text-sm text-gray-400">
              <strong>Location:</strong> {DEFAULT_COORDINATES.lat.toFixed(6)}°, {DEFAULT_COORDINATES.lng.toFixed(6)}° • 
              <strong>Water Level:</strong> {waterLevel.toFixed(1)}m • 
              <strong>Season:</strong> {getSeasonalCycle() > 0.75 ? 'Winter' : getSeasonalCycle() > 0.5 ? 'Autumn' : getSeasonalCycle() > 0.25 ? 'Summer' : 'Spring'}
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Water Table Level</div>
              <div className="text-3xl font-bold text-blue-400">{waterLevel.toFixed(1)}m</div>
              <div className="text-xs text-gray-400">below surface</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Avg Saturation</div>
              <div className="text-3xl font-bold text-cyan-400">{(subsurfaceStats.averageSaturation * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-400">soil moisture</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Aquifer Volume</div>
              <div className="text-3xl font-bold text-teal-400">{subsurfaceStats.totalWaterVolume.toFixed(0)}k</div>
              <div className="text-xs text-gray-400">cubic meters</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Flow Rate</div>
              <div className="text-3xl font-bold text-emerald-400">{(flowSpeed * 10).toFixed(1)}</div>
              <div className="text-xs text-gray-400">m/day</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-black/30 backdrop-blur-lg rounded-lg p-2 border border-white/20">
              <button
                onClick={() => setViewMode('cutaway')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  viewMode === 'cutaway'
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                🔍 Cutaway View
              </button>
              <button
                onClick={() => setViewMode('cross-section')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  viewMode === 'cross-section'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                📏 Cross Section
              </button>
              <button
                onClick={() => setViewMode('layers')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  viewMode === 'layers'
                    ? 'bg-yellow-500 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                🏔️ Layer Analysis
              </button>
            </div>
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

          {/* Geological Layer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Geological Layers</h3>
              <div className="space-y-3">
                {layerData.map((layer, index) => {
                  const layerNames = ['Topsoil', 'Clay', 'Sand/Gravel', 'Bedrock'];
                  const layerColors = ['#8B4513', '#DAA520', '#F4A460', '#696969'];
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: layerColors[layer.type] }}
                        />
                        <span className="text-white font-medium">{layerNames[layer.type]}</span>
                      </div>
                      <div className="text-right text-sm text-gray-300">
                        <div>{layer.depth}m - {layer.depth + layer.thickness}m</div>
                        <div>Saturation: {(layer.saturation * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Hydrogeological Data</h3>
              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Primary Aquifer Depth:</span>
                  <span className="text-cyan-400">{subsurfaceStats.aquiferDepth}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Bedrock Depth:</span>
                  <span className="text-gray-400">{subsurfaceStats.bedrockDepth}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Flow Direction:</span>
                  <span className="text-blue-400">
                    {Math.atan2(flowDirection[1], flowDirection[0]) * 180 / Math.PI > 0 ? 'NE' : 'SE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hydraulic Conductivity:</span>
                  <span className="text-green-400">2.3 × 10⁻⁴ m/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Porosity (Average):</span>
                  <span className="text-yellow-400">
                    {(subsurfaceStats.averageSaturation * 0.4).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Recharge Rate:</span>
                  <span className="text-emerald-400">
                    {(getSeasonalCycle() * 150 + 50).toFixed(0)} mm/year
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Integration Notice */}
          <div className="mt-8 text-center">
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-6 inline-block max-w-3xl">
              <h3 className="text-lg font-semibold text-amber-200 mb-2">Temporal Hydrology</h3>
              <p className="text-amber-100 text-sm">
                The water table visualization is synchronized with the global timeline system showing seasonal and daily variations. 
                Spring shows highest water levels due to snow melt and rainfall, while late summer shows the lowest levels. 
                Use the timeline controls to observe long-term groundwater trends and aquifer recharge patterns.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SubterranianWaterTable; 
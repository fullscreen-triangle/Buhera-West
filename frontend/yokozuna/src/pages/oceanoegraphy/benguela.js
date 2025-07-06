import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";
import CrossfilterCharts from "@/components/information/CrossfilterCharts";
import { SOUTHERN_AFRICA_CENTER } from '@/config/coordinates';

// Dynamic imports for Three.js components
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-blue-200 dark:bg-blue-900 rounded-lg" />
});

const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), {
  ssr: false
});

const PerspectiveCamera = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.PerspectiveCamera })), {
  ssr: false
});

const Environment = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.Environment })), {
  ssr: false
});

const OceanicVisualization = dynamic(() => import('@/components/ocean/OceanicVisualization'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-blue-200 dark:bg-blue-900 rounded-lg" />
});

const TerrainRenderer = dynamic(() => import('@/components/pathtracing/TerrainRenderer'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-green-200 dark:bg-green-900 rounded-lg" />
});

// Benguela Current coordinates (Atlantic Ocean)
const BENGUELA_COORDINATES = {
  center: [-23.0, 14.0], // Benguela Current region
  bounds: [
    [-33, 8],   // Southwest
    [-15, 20]   // Northeast
  ]
};

// Upwelling zone visualization
const UpwellingZone = ({ data }) => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(15, 15, 64, 64);
    const vertices = geo.attributes.position.array;
    
    // Generate upwelling patterns
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      
      // Create upwelling ridges and valleys
      let height = 0;
      height += Math.sin(x * 0.8) * 0.3; // Main upwelling ridges
      height += Math.cos(z * 1.2) * 0.2; // Cross current variation
      
      // Add coastal shelf features
      const distFromCoast = Math.abs(x + 5); // Distance from "coast"
      if (distFromCoast < 3) {
        height += (3 - distFromCoast) * 0.5; // Shelf effect
      }
      
      vertices[i + 1] = height;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [data]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1e40af',
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.8
    });
  }, []);

  return (
    <mesh geometry={geometry} material={material} position={[0, -0.5, 0]} />
  );
};

// Coastal upwelling particles
const UpwellingParticles = ({ count = 1000 }) => {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;     // x
      positions[i3 + 1] = Math.random() * 5;          // y (upwelling)
      positions[i3 + 2] = (Math.random() - 0.5) * 10; // z
    }
    
    return positions;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#00ff88" transparent opacity={0.6} />
    </points>
  );
};

const BenguelaAnalysis = () => {
  const [terrainQuality, setTerrainQuality] = useState(0.7);
  const [showUpwelling, setShowUpwelling] = useState(true);
  const [timeRange, setTimeRange] = useState('current');
  const [dataLoading, setDataLoading] = useState(true);
  const [oceanData, setOceanData] = useState([]);

  // Simulate Benguela Current data
  useEffect(() => {
    setDataLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const simulatedData = Array.from({ length: 250 }, (_, i) => ({
        id: i,
        latitude: BENGUELA_COORDINATES.center[0] + (Math.random() - 0.5) * 18,
        longitude: BENGUELA_COORDINATES.center[1] + (Math.random() - 0.5) * 12,
        temperature: 12 + Math.random() * 10, // 12-22°C typical for Benguela
        salinity: 34.5 + Math.random() * 0.8, // Lower salinity due to upwelling
        currentSpeed: 0.3 + Math.random() * 0.7, // Slower than Agulhas
        currentDirection: 315 + (Math.random() - 0.5) * 60, // Northwest direction
        depth: Math.random() * 300, // 0-300m depth
        chlorophyll: 2.0 + Math.random() * 8.0, // High productivity
        oxygen: 4.0 + Math.random() * 3.0, // Oxygen minimum zone
        nutrients: 10 + Math.random() * 30, // High nutrient content
        upwellingIntensity: Math.random() * 1.0,
        waveHeight: 2.0 + Math.random() * 3.0,
        timestamp: Date.now() - Math.random() * 86400000 // Within last 24h
      }));
      
      setOceanData(simulatedData);
      setDataLoading(false);
    }, 1200);
  }, [timeRange]);

  return (
    <>
      <Head>
        <title>Benguela Current Analysis | Buhera-West Environmental Intelligence</title>
        <meta name="description" content="Comprehensive analysis of the Benguela Current upwelling system in the Atlantic Ocean, including biological productivity, nutrient cycling, and fisheries ecology." />
      </Head>
      <TransitionEffect />
      
      <main className="w-full min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-blue-900">
        <Layout>
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <AnimatedText text="Benguela Current Upwelling System" className="!text-6xl xl:!text-6xl lg:!text-5xl md:!text-4xl sm:!text-3xl xs:!text-2xl !text-white mb-8" />
              <p className="text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Analysis of the Benguela Current upwelling system along the west coast of southern Africa, 
                one of the world's most productive marine ecosystems and a major fisheries region.
              </p>
            </div>

            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-sm text-gray-300 mb-2">Upwelling Intensity</div>
                <div className="text-3xl font-bold text-emerald-400">High</div>
                <div className="text-xs text-gray-400">Current season</div>
              </div>
              
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-sm text-gray-300 mb-2">Water Temperature</div>
                <div className="text-3xl font-bold text-blue-400">16°C</div>
                <div className="text-xs text-gray-400">Surface average</div>
              </div>
              
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-sm text-gray-300 mb-2">Productivity</div>
                <div className="text-3xl font-bold text-green-400">Very High</div>
                <div className="text-xs text-gray-400">Chlorophyll-a</div>
              </div>
              
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-sm text-gray-300 mb-2">Nutrient Levels</div>
                <div className="text-3xl font-bold text-yellow-400">25 μM</div>
                <div className="text-xs text-gray-400">Nitrate</div>
              </div>
            </div>

            {/* Main 3D Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 mb-12">
              <div className="lg:col-span-5">
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl">
                  <div className="h-96 lg:h-80 md:h-64 relative overflow-hidden rounded-2xl">
                    <Canvas camera={{ position: [0, 40, 80], fov: 60 }}>
                      <PerspectiveCamera makeDefault position={[0, 40, 80]} />
                      <Environment preset="ocean" />
                      
                      {/* Lighting */}
                      <ambientLight intensity={0.5} />
                      <directionalLight
                        position={[80, 80, 40]}
                        intensity={1.2}
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                      />
                      
                      <Suspense fallback={null}>
                        {/* Main ocean and upwelling visualization */}
                        <group position={[0, 0, 0]}>
                          <OceanicVisualization
                            data={{
                              surfaceMesh: new Float32Array(oceanData.slice(0, 100).flatMap(d => [d.longitude, 0, d.latitude])),
                              currentVectors: oceanData.slice(0, 40).map(d => ({
                                position: [d.longitude, 0, d.latitude],
                                direction: [Math.cos(d.currentDirection * Math.PI / 180), 0, Math.sin(d.currentDirection * Math.PI / 180)],
                                speed: d.currentSpeed
                              })),
                              temperatureField: new Float32Array(oceanData.slice(0, 100).map(d => d.temperature)),
                              waveData: {
                                height: oceanData[0]?.waveHeight || 2.5,
                                frequency: 0.025,
                                speed: 0.3
                              }
                            }}
                            qualityLevel={terrainQuality}
                            enabled={true}
                          />
                          
                          {showUpwelling && (
                            <>
                              <UpwellingZone data={oceanData} />
                              <UpwellingParticles count={800} />
                            </>
                          )}
                          
                          <TerrainRenderer
                            waterLevel={0.0}
                            terrainScale={0.8}
                            qualityLevel={terrainQuality}
                            enabled={true}
                          />
                        </group>
                      </Suspense>
                      
                      <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        maxPolarAngle={Math.PI / 2}
                        minDistance={10}
                        maxDistance={500}
                      />
                    </Canvas>
                    
                    {/* Overlay controls */}
                    <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md rounded-lg p-3">
                      <h3 className="text-sm font-bold text-white mb-2">Atlantic Ocean - Benguela Current</h3>
                      <div className="space-y-2">
                        <label className="flex items-center text-xs text-white">
                          <input
                            type="range"
                            min="0.2"
                            max="1.0"
                            step="0.1"
                            value={terrainQuality}
                            onChange={(e) => setTerrainQuality(parseFloat(e.target.value))}
                            className="w-20 mr-2"
                          />
                          Quality: {Math.round(terrainQuality * 100)}%
                        </label>
                        
                        <label className="flex items-center text-xs text-white">
                          <input
                            type="checkbox"
                            checked={showUpwelling}
                            onChange={(e) => setShowUpwelling(e.target.checked)}
                            className="mr-2"
                          />
                          Show Upwelling
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side panels */}
              <div className="lg:col-span-3 space-y-6">
                {/* Upwelling Profile */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Upwelling Profile</h3>
                  <div className="h-32 bg-gradient-to-r from-blue-800 via-green-500 to-yellow-400 rounded-lg relative">
                    <div className="absolute inset-0 flex items-center justify-between p-2 text-xs text-white">
                      <div className="text-center">
                        <div>Deep</div>
                        <div>Cold</div>
                        <div>Nutrient-rich</div>
                      </div>
                      <div className="text-center">
                        <div>Surface</div>
                        <div>Warm</div>
                        <div>Productive</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-300">
                    Cold, nutrient-rich water rises to surface, supporting high biological productivity
                  </div>
                </div>

                {/* Ecosystem Characteristics */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Ecosystem Features</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sardine Biomass:</span>
                      <span className="text-white">High</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Anchovy Stocks:</span>
                      <span className="text-white">Variable</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Plankton Density:</span>
                      <span className="text-white">Very High</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Oxygen Levels:</span>
                      <span className="text-white">Low (OMZ)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Analysis Dashboard */}
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-6 mb-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Benguela Current Data Analysis</h3>
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-black/20 border border-white/20 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="current">Current Conditions</option>
                  <option value="seasonal">Seasonal Patterns</option>
                  <option value="annual">Annual Trends</option>
                  <option value="decadal">Decadal Variability</option>
                </select>
              </div>
              
              {dataLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
                  <span className="ml-4 text-emerald-200">Loading Benguela Current data...</span>
                </div>
              ) : (
                <CrossfilterCharts 
                  data={oceanData} 
                  locationData={SOUTHERN_AFRICA_CENTER}
                  chartTypes={['temperature', 'chlorophyll', 'nutrients', 'upwelling_intensity']}
                  height={400}
                />
              )}
            </div>

            {/* Environmental Intelligence Integration */}
            <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 backdrop-blur-lg rounded-2xl border border-emerald-400/20 p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Environmental Intelligence: Benguela Upwelling System</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-5xl mb-4">🌊</div>
                  <h3 className="text-xl font-semibold text-emerald-300 mb-3">Upwelling Dynamics</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Wind-driven coastal upwelling brings cold, nutrient-rich water to the surface, 
                    creating one of the most productive marine ecosystems in the world.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-5xl mb-4">🐠</div>
                  <h3 className="text-xl font-semibold text-emerald-300 mb-3">Fisheries Production</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Supports major commercial fisheries including sardines, anchovies, and hake, 
                    providing critical economic resources for the region.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-5xl mb-4">🌍</div>
                  <h3 className="text-xl font-semibold text-emerald-300 mb-3">Climate Impact</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Influences regional climate through ocean-atmosphere interactions, 
                    affecting weather patterns and coastal fog formation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
};

export default BenguelaAnalysis;

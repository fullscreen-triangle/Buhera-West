import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";
import CrossfilterCharts from "@/components/information/CrossfilterCharts";
import { SOUTHERN_AFRICA_CENTER } from '@/config/coordinates';

// Dynamic imports for performance - ALL Three.js components must be dynamic
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

const WaterRenderer = dynamic(() => import('@/components/pathtracing/WaterRenderer'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-blue-200 dark:bg-blue-900 rounded-lg" />
});

// Agulhas Current coordinates (Indian Ocean)
const AGULHAS_COORDINATES = {
  center: [-34.8, 20.0], // Agulhas Current region
  bounds: [
    [-45, 10],  // Southwest
    [-25, 35]   // Northeast
  ]
};

// Simplified underwater terrain component
const UnderwaterTerrain = ({ data }) => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 10, 64, 64);
    const vertices = geo.attributes.position.array;
    
    // Generate underwater terrain with seamounts and ridges
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      
      // Simulate ocean floor with seamounts
      let height = -2.0; // Base ocean floor depth
      height += Math.sin(x * 0.5) * Math.cos(z * 0.3) * 0.8; // Ridge pattern
      height += Math.sin(x * 2.0) * Math.sin(z * 2.0) * 0.3; // Smaller features
      
      // Add some seamounts
      const dist1 = Math.sqrt((x - 2) ** 2 + (z - 2) ** 2);
      const dist2 = Math.sqrt((x + 3) ** 2 + (z - 1) ** 2);
      
      if (dist1 < 1.5) height += (1.5 - dist1) * 1.2; // Seamount 1
      if (dist2 < 2.0) height += (2.0 - dist2) * 0.8; // Seamount 2
      
      vertices[i + 1] = height;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [data]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#2d4a36',
      roughness: 0.8,
      metalness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.8
    });
  }, []);

  return (
    <mesh geometry={geometry} material={material} />
  );
};

const AgulhasAnalysis = () => {
  const [terrainQuality, setTerrainQuality] = useState(0.7);
  const [showCurrents, setShowCurrents] = useState(true);
  const [timeRange, setTimeRange] = useState('current');
  const [dataLoading, setDataLoading] = useState(true);
  const [oceanData, setOceanData] = useState([]);

  // Simulate Agulhas Current data
  useEffect(() => {
    setDataLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const simulatedData = Array.from({ length: 200 }, (_, i) => ({
        id: i,
        latitude: AGULHAS_COORDINATES.center[0] + (Math.random() - 0.5) * 20,
        longitude: AGULHAS_COORDINATES.center[1] + (Math.random() - 0.5) * 25,
        temperature: 18 + Math.random() * 8, // 18-26°C typical for Agulhas
        salinity: 35.0 + Math.random() * 0.5, // High salinity characteristic
        currentSpeed: 0.5 + Math.random() * 1.5, // m/s
        currentDirection: 225 + (Math.random() - 0.5) * 90, // Southwest direction
        depth: Math.random() * 200, // 0-200m depth
        chlorophyll: Math.random() * 2.0, // mg/m³
        waveHeight: 1.5 + Math.random() * 2.0,
        timestamp: Date.now() - Math.random() * 86400000 // Within last 24h
      }));
      
      setOceanData(simulatedData);
      setDataLoading(false);
    }, 1000);
  }, [timeRange]);

  return (
    <>
      <Head>
        <title>Agulhas Current Analysis | Buhera-West Environmental Intelligence</title>
        <meta name="description" content="Advanced analysis of the Agulhas Current system in the Indian Ocean, including thermal structure, biological productivity, and ocean-atmosphere interactions." />
      </Head>
      <TransitionEffect />
      
      <main className="w-full min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900">
        <Layout>
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <AnimatedText text="Agulhas Current System Analysis" className="!text-6xl xl:!text-6xl lg:!text-5xl md:!text-4xl sm:!text-3xl xs:!text-2xl !text-white mb-8" />
              <p className="text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Comprehensive analysis of the Agulhas Current, one of the world's strongest ocean currents, 
                flowing along the east coast of South Africa and playing a crucial role in global ocean circulation.
              </p>
            </div>

            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-sm text-gray-300 mb-2">Current Velocity</div>
                <div className="text-3xl font-bold text-cyan-400">1.8 m/s</div>
                <div className="text-xs text-gray-400">Peak flow rate</div>
              </div>
              
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-sm text-gray-300 mb-2">Water Temperature</div>
                <div className="text-3xl font-bold text-orange-400">24°C</div>
                <div className="text-xs text-gray-400">Surface average</div>
              </div>
              
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-sm text-gray-300 mb-2">Transport Volume</div>
                <div className="text-3xl font-bold text-blue-400">70 Sv</div>
                <div className="text-xs text-gray-400">Sverdrups</div>
              </div>
              
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-sm text-gray-300 mb-2">Biological Activity</div>
                <div className="text-3xl font-bold text-green-400">High</div>
                <div className="text-xs text-gray-400">Chlorophyll-a levels</div>
              </div>
            </div>

            {/* Main 3D Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 mb-12">
              <div className="lg:col-span-5">
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl">
                  <div className="h-96 lg:h-80 md:h-64 relative overflow-hidden rounded-2xl">
                    <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
                      <PerspectiveCamera makeDefault position={[0, 50, 100]} />
                      <Environment preset="ocean" />
                      
                      {/* Lighting */}
                      <ambientLight intensity={0.4} />
                      <directionalLight
                        position={[100, 100, 50]}
                        intensity={1.0}
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                      />
                      
                      <Suspense fallback={null}>
                        {/* Main ocean and terrain */}
                        <group position={[0, 0, 0]}>
                          <OceanicVisualization
                            data={{
                              surfaceMesh: new Float32Array(oceanData.slice(0, 100).flatMap(d => [d.longitude, 0, d.latitude])),
                              currentVectors: oceanData.slice(0, 50).map(d => ({
                                position: [d.longitude, 0, d.latitude],
                                direction: [Math.cos(d.currentDirection * Math.PI / 180), 0, Math.sin(d.currentDirection * Math.PI / 180)],
                                speed: d.currentSpeed
                              })),
                              temperatureField: new Float32Array(oceanData.slice(0, 100).map(d => d.temperature)),
                              waveData: {
                                height: oceanData[0]?.waveHeight || 2.0,
                                frequency: 0.02,
                                speed: 0.5
                              }
                            }}
                            qualityLevel={terrainQuality}
                            enabled={true}
                          />
                          
                          <TerrainRenderer
                            waterLevel={0.0}
                            terrainScale={1.0}
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
                      <h3 className="text-sm font-bold text-white mb-2">Indian Ocean - Agulhas Current</h3>
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
                            checked={showCurrents}
                            onChange={(e) => setShowCurrents(e.target.checked)}
                            className="mr-2"
                          />
                          Show Current Vectors
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side panels */}
              <div className="lg:col-span-3 space-y-6">
                {/* Temperature Profile */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Temperature Profile</h3>
                  <div className="h-32 bg-gradient-to-b from-red-500 via-yellow-500 to-blue-500 rounded-lg relative">
                    <div className="absolute inset-0 flex flex-col justify-between p-2 text-xs text-white">
                      <span>26°C - Surface</span>
                      <span>20°C - Thermocline</span>
                      <span>4°C - Deep Water</span>
                    </div>
                  </div>
                </div>

                {/* Current Characteristics */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Current Characteristics</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Width:</span>
                      <span className="text-white">100-200 km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Max Depth:</span>
                      <span className="text-white">2000 m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Direction:</span>
                      <span className="text-white">Southwest</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Seasonality:</span>
                      <span className="text-white">Year-round</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary visualization and analysis */}
            <div className="grid grid-cols-1 xl:grid-cols-8 gap-8 mb-12">
              <div className="col-span-4 xl:col-span-3 lg:col-span-12 space-y-4">
                {/* Underwater view - small square */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl">
                  <div className="h-48 md:h-40 sm:h-32 relative overflow-hidden rounded-xl">
                    <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
                      <PerspectiveCamera makeDefault position={[0, 2, 8]} />
                      
                      {/* Underwater lighting */}
                      <ambientLight intensity={0.6} color="#4a90e2" />
                      <directionalLight
                        position={[0, 10, 0]}
                        intensity={0.8}
                        color="#87ceeb"
                        castShadow
                      />
                      <pointLight position={[5, 0, 5]} intensity={0.5} color="#1e90ff" />
                      
                      <Suspense fallback={null}>
                        <UnderwaterTerrain data={oceanData} />
                      </Suspense>
                      
                      <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={3}
                        maxDistance={20}
                      />
                    </Canvas>
                    
                    <div className="absolute top-2 left-2 bg-black/20 backdrop-blur-md rounded px-2 py-1">
                      <span className="text-xs font-bold text-white">Seafloor Analysis</span>
                    </div>
                  </div>
                </div>
                
                {/* Data loading indicator */}
                {dataLoading && (
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                      <span className="text-blue-200">Loading Agulhas Current data...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-4 xl:col-span-5 lg:col-span-12 space-y-4">
                {/* Crossfilter charts section */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Data Analysis Dashboard</h3>
                    <select 
                      value={timeRange} 
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="bg-black/20 border border-white/20 rounded px-3 py-1 text-white text-sm"
                    >
                      <option value="current">Current Conditions</option>
                      <option value="daily">Daily Trend</option>
                      <option value="weekly">Weekly Pattern</option>
                      <option value="monthly">Monthly Average</option>
                    </select>
                  </div>
                  
                  {!dataLoading && oceanData.length > 0 && (
                    <CrossfilterCharts 
                      data={oceanData} 
                      locationData={SOUTHERN_AFRICA_CENTER}
                      chartTypes={['temperature', 'current_speed', 'depth', 'salinity']}
                      height={300}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Environmental Impact Section */}
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 backdrop-blur-lg rounded-2xl border border-cyan-400/20 p-8 mb-12">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Environmental Intelligence: Agulhas Current Impact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-5xl mb-4">🌊</div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-3">Ocean Circulation</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The Agulhas Current is a key component of the global thermohaline circulation, 
                    transporting warm, salty Indian Ocean water and influencing regional climate patterns.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-5xl mb-4">🐟</div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-3">Marine Ecosystems</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Rich upwelling zones and thermal gradients create diverse marine habitats, 
                    supporting high biodiversity and important commercial fisheries.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-5xl mb-4">🌡️</div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-3">Climate Regulation</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Heat transport and moisture supply significantly impact South African coastal climate, 
                    affecting precipitation patterns and temperature extremes.
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

export default AgulhasAnalysis;

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

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

// Underwater terrain visualization using Three.js - wrapped in dynamic loading
const UnderwaterTerrainComponent = dynamic(() => 
  import('three').then(THREE => {
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
    
    return { default: UnderwaterTerrain };
  }), 
  { ssr: false }
);

// Main Agulhas analysis component
const AgulhasAnalysis = () => {
  const [selectedDataset, setSelectedDataset] = useState('current');
  const [terrainQuality, setTerrainQuality] = useState(0.8);
  const [showUnderwater, setShowUnderwater] = useState(true);

  // Generate sample oceanographic data for the Agulhas Current
  const oceanData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < 1000; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Daily data for ~3 years
      
      data.push({
        timestamp: date,
        latitude: AGULHAS_COORDINATES.center[0] + (Math.random() - 0.5) * 10,
        longitude: AGULHAS_COORDINATES.center[1] + (Math.random() - 0.5) * 15,
        temperature: 18 + Math.sin(i * 0.017) * 4 + Math.random() * 2, // Seasonal variation
        salinity: 35.0 + Math.random() * 0.5,
        currentSpeed: 0.5 + Math.random() * 1.5, // m/s
        currentDirection: Math.random() * 360,
        depth: Math.random() * 200, // Surface to 200m
        chlorophyll: Math.random() * 2.5,
        phytoplankton: Math.random() * 100,
        fishBiomass: Math.random() * 50,
        oxygenLevel: 6 + Math.random() * 2,
        turbulence: Math.random() * 0.8,
        waveHeight: 1 + Math.random() * 3,
        windSpeed: Math.random() * 15,
        precipitation: Math.random() * 10
      });
    }
    
    return data;
  }, []);

  const crossfilterData = useMemo(() => {
    return oceanData.map(d => ({
      ...d,
      month: d.timestamp.getMonth(),
      year: d.timestamp.getFullYear(),
      season: Math.floor(d.timestamp.getMonth() / 3),
      temperatureCategory: d.temperature < 16 ? 'Cold' : d.temperature < 20 ? 'Moderate' : 'Warm',
      currentCategory: d.currentSpeed < 0.8 ? 'Slow' : d.currentSpeed < 1.3 ? 'Moderate' : 'Fast',
      depthCategory: d.depth < 50 ? 'Surface' : d.depth < 100 ? 'Shallow' : 'Deep'
    }));
  }, [oceanData]);

  return (
    <>
      <Head>
        <title>Agulhas Current Analysis - Buhera West</title>
        <meta
          name="description"
          content="Comprehensive analysis of the Agulhas Current system in the Indian Ocean"
        />
      </Head>
      
      <TransitionEffect />
      
      <main className="flex w-full flex-col items-center justify-center min-h-screen dark:text-light bg-light dark:bg-dark">
        <Layout className="pt-16">
          <AnimatedText
            text="Agulhas Current Analysis"
            className="mb-8 !text-6xl !leading-tight lg:!text-5xl sm:!text-4xl xs:!text-3xl"
          />
          
          <div className="w-full grid grid-cols-12 gap-6 xl:gap-4 lg:gap-3">
            {/* Main terrain/ocean view - spans 8 columns */}
            <div className="col-span-8 xl:col-span-7 lg:col-span-12">
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
                      
                      <select
                        value={selectedDataset}
                        onChange={(e) => setSelectedDataset(e.target.value)}
                        className="text-xs bg-black/30 text-white rounded px-2 py-1"
                      >
                        <option value="current">Current Velocity</option>
                        <option value="temperature">Temperature</option>
                        <option value="salinity">Salinity</option>
                        <option value="chlorophyll">Chlorophyll</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right panel - spans 4 columns */}
            <div className="col-span-4 xl:col-span-5 lg:col-span-12 space-y-4">
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
                      <UnderwaterTerrainComponent data={oceanData} />
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
              
              {/* Crossfilter charts section */}
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-4">
                <h3 className="text-lg font-bold mb-4 text-dark dark:text-light">
                  Agulhas Current Analytics
                </h3>
                
                <div className="max-h-96 overflow-y-auto">
                  <CrossfilterCharts
                    data={crossfilterData}
                    compact={true}
                    dimensions={{
                      timestamp: d => d.timestamp,
                      temperature: d => d.temperature,
                      salinity: d => d.salinity,
                      currentSpeed: d => d.currentSpeed,
                      depth: d => d.depth,
                      chlorophyll: d => d.chlorophyll,
                      latitude: d => d.latitude,
                      longitude: d => d.longitude,
                      month: d => d.month,
                      temperatureCategory: d => d.temperatureCategory,
                      currentCategory: d => d.currentCategory,
                      depthCategory: d => d.depthCategory,
                      oxygenLevel: d => d.oxygenLevel,
                      phytoplankton: d => d.phytoplankton,
                      fishBiomass: d => d.fishBiomass
                    }}
                    colorScheme="ocean"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom info panel */}
          <div className="mt-8 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-lg font-bold mb-3 text-dark dark:text-light">Agulhas Current System</h4>
                <p className="text-sm text-dark/80 dark:text-light/80">
                  The Agulhas Current is one of the strongest western boundary currents in the world, 
                  flowing southwestward along the east coast of South Africa. It plays a crucial role 
                  in global ocean circulation and climate regulation.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold mb-3 text-dark dark:text-light">Key Characteristics</h4>
                <ul className="text-sm text-dark/80 dark:text-light/80 space-y-1">
                  <li>• Current speed: 0.5-2.0 m/s</li>
                  <li>• Temperature: 16-24°C</li>
                  <li>• Depth range: 0-2000m</li>
                  <li>• High biodiversity zone</li>
                  <li>• Major fisheries region</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold mb-3 text-dark dark:text-light">Research Focus</h4>
                <ul className="text-sm text-dark/80 dark:text-light/80 space-y-1">
                  <li>• Current velocity mapping</li>
                  <li>• Temperature variations</li>
                  <li>• Marine ecosystem health</li>
                  <li>• Climate change impacts</li>
                  <li>• Fisheries management</li>
                </ul>
              </div>
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
};

export default AgulhasAnalysis;

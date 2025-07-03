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

// Benguela Current coordinates (Atlantic Ocean)
const BENGUELA_COORDINATES = {
  center: [-25.0, 14.0], // Benguela Current region
  bounds: [
    [-35, 8],   // Southwest
    [-15, 20]   // Northeast
  ]
};

// Upwelling visualization using Three.js - wrapped in dynamic loading
const UpwellingVisualizationComponent = dynamic(() => 
  import('three').then(THREE => {
    const UpwellingVisualization = ({ data }) => {
      const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(8, 8, 32, 32);
        const vertices = geo.attributes.position.array;
        
        // Generate upwelling patterns
        for (let i = 0; i < vertices.length; i += 3) {
          const x = vertices[i];
          const z = vertices[i + 2];
          
          // Simulate upwelling with cold water rising
          let height = -1.5; // Base depth
          height += Math.sin(x * 0.8) * Math.cos(z * 0.6) * 0.5; // Upwelling pattern
          
          // Add nutrient rich areas
          const dist = Math.sqrt(x ** 2 + z ** 2);
          if (dist < 2.0) height += (2.0 - dist) * 0.3; // Central upwelling
          
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
          wireframe: false,
          transparent: true,
          opacity: 0.7
        });
      }, []);

      return (
        <mesh geometry={geometry} material={material} />
      );
    };
    
    return { default: UpwellingVisualization };
  }), 
  { ssr: false }
);

// Main Benguela analysis component
const BenguelaAnalysis = () => {
  const [selectedDataset, setSelectedDataset] = useState('upwelling');
  const [terrainQuality, setTerrainQuality] = useState(0.8);
  const [showUpwelling, setShowUpwelling] = useState(true);

  // Generate sample Benguela upwelling system data
  const benguelaData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < 1200; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const season = Math.floor(date.getMonth() / 3); // 0=summer, 1=autumn, 2=winter, 3=spring
      
      data.push({
        timestamp: date,
        latitude: BENGUELA_COORDINATES.center[0] + (Math.random() - 0.5) * 12,
        longitude: BENGUELA_COORDINATES.center[1] + (Math.random() - 0.5) * 8,
        temperature: 14 + Math.sin(i * 0.017) * 3 + Math.random() * 2, // Colder due to upwelling
        salinity: 34.8 + Math.random() * 0.4,
        currentSpeed: 0.3 + Math.random() * 1.2, // Generally slower than Agulhas
        currentDirection: 180 + Math.random() * 60 - 30, // Northward flow
        depth: Math.random() * 300,
        chlorophyll: 1.5 + Math.random() * 4.0, // Higher due to upwelling
        phytoplankton: 50 + Math.random() * 150, // Much higher productivity
        fishBiomass: 20 + Math.random() * 80, // Rich fisheries
        oxygenLevel: 4 + Math.random() * 3, // Lower due to upwelling
        nutrientLevel: 15 + Math.random() * 25, // High nutrients from upwelling
        upwellingIntensity: Math.random() * 10,
        windSpeed: 8 + Math.random() * 12, // Trade winds
        windDirection: 200 + Math.random() * 40 - 20, // SE trade winds
        seaSurfaceHeight: -0.2 + Math.random() * 0.4,
        thermalFront: Math.random() < 0.3, // Thermal fronts common
        sardineAbundance: Math.random() * 100,
        anchovyAbundance: Math.random() * 80,
        hakeAbundance: Math.random() * 60
      });
    }
    
    return data;
  }, []);

  const crossfilterData = useMemo(() => {
    return benguelaData.map(d => ({
      ...d,
      month: d.timestamp.getMonth(),
      year: d.timestamp.getFullYear(),
      season: Math.floor(d.timestamp.getMonth() / 3),
      temperatureCategory: d.temperature < 13 ? 'Very Cold' : d.temperature < 16 ? 'Cold' : d.temperature < 19 ? 'Moderate' : 'Warm',
      upwellingCategory: d.upwellingIntensity < 3 ? 'Weak' : d.upwellingIntensity < 7 ? 'Moderate' : 'Strong',
      productivityCategory: d.phytoplankton < 75 ? 'Low' : d.phytoplankton < 150 ? 'Moderate' : 'High',
      depthCategory: d.depth < 50 ? 'Surface' : d.depth < 150 ? 'Shallow' : 'Deep',
      nutrientCategory: d.nutrientLevel < 20 ? 'Low' : d.nutrientLevel < 30 ? 'Moderate' : 'High',
      fisheryCategory: d.fishBiomass < 40 ? 'Poor' : d.fishBiomass < 70 ? 'Good' : 'Excellent'
    }));
  }, [benguelaData]);

  return (
    <>
      <Head>
        <title>Benguela Current Analysis - Buhera West</title>
        <meta
          name="description"
          content="Comprehensive analysis of the Benguela Current upwelling system in the Atlantic Ocean"
        />
      </Head>
      
      <TransitionEffect />
      
      <main className="flex w-full flex-col items-center justify-center min-h-screen dark:text-light bg-light dark:bg-dark">
        <Layout className="pt-16">
          <AnimatedText
            text="Benguela Current Analysis"
            className="mb-8 !text-6xl !leading-tight lg:!text-5xl sm:!text-4xl xs:!text-3xl"
          />
          
          <div className="w-full grid grid-cols-12 gap-6 xl:gap-4 lg:gap-3">
            {/* Main terrain/ocean view - spans 8 columns */}
            <div className="col-span-8 xl:col-span-7 lg:col-span-12">
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl">
                <div className="h-96 lg:h-80 md:h-64 relative overflow-hidden rounded-2xl">
                  <Canvas camera={{ position: [0, 60, 120], fov: 55 }}>
                    <PerspectiveCamera makeDefault position={[0, 60, 120]} />
                    <Environment preset="dawn" />
                    
                    {/* Lighting optimized for Atlantic waters */}
                    <ambientLight intensity={0.5} />
                    <directionalLight
                      position={[-100, 100, 50]}
                      intensity={1.2}
                      castShadow
                      shadow-mapSize-width={2048}
                      shadow-mapSize-height={2048}
                    />
                    
                    <Suspense fallback={null}>
                      {/* Main ocean and terrain */}
                      <group position={[0, 0, 0]}>
                        <OceanicVisualization
                          data={{
                            surfaceMesh: new Float32Array(benguelaData.slice(0, 120).flatMap(d => [d.longitude, 0, d.latitude])),
                            currentVectors: benguelaData.slice(0, 60).map(d => ({
                              position: [d.longitude, 0, d.latitude],
                              direction: [Math.cos(d.currentDirection * Math.PI / 180), 0, Math.sin(d.currentDirection * Math.PI / 180)],
                              speed: d.currentSpeed
                            })),
                            temperatureField: new Float32Array(benguelaData.slice(0, 120).map(d => d.temperature)),
                            waveData: {
                              height: 1.5, // Typically calmer than Indian Ocean
                              frequency: 0.025,
                              speed: 0.4
                            }
                          }}
                          qualityLevel={terrainQuality}
                          enabled={true}
                        />
                        
                        <WaterRenderer
                          waterLevel={-0.5}
                          qualityLevel={terrainQuality}
                          enabled={showUpwelling}
                        />
                        
                        <TerrainRenderer
                          waterLevel={-1.0}
                          terrainScale={1.2}
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
                      minDistance={15}
                      maxDistance={400}
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
                      
                      <select
                        value={selectedDataset}
                        onChange={(e) => setSelectedDataset(e.target.value)}
                        className="text-xs bg-black/30 text-white rounded px-2 py-1"
                      >
                        <option value="upwelling">Upwelling Intensity</option>
                        <option value="temperature">Temperature</option>
                        <option value="chlorophyll">Chlorophyll</option>
                        <option value="nutrients">Nutrients</option>
                        <option value="fisheries">Fish Biomass</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right panel - spans 4 columns */}
            <div className="col-span-4 xl:col-span-5 lg:col-span-12 space-y-4">
              {/* Upwelling visualization - small square */}
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl">
                <div className="h-48 md:h-40 sm:h-32 relative overflow-hidden rounded-xl">
                  <Canvas camera={{ position: [-8, 4, 8], fov: 50 }}>
                    <PerspectiveCamera makeDefault position={[-8, 4, 8]} />
                    
                    {/* Upwelling-specific lighting */}
                    <ambientLight intensity={0.7} color="#5aa3d0" />
                    <directionalLight
                      position={[-10, 8, 5]}
                      intensity={1.0}
                      color="#87ceeb"
                      castShadow
                    />
                    <pointLight position={[3, 2, 3]} intensity={0.6} color="#20b2aa" />
                    
                    <Suspense fallback={null}>
                      <UpwellingVisualizationComponent data={benguelaData} />
                    </Suspense>
                    
                    <OrbitControls
                      enablePan={true}
                      enableZoom={true}
                      enableRotate={true}
                      minDistance={5}
                      maxDistance={25}
                    />
                  </Canvas>
                  
                  <div className="absolute top-2 left-2 bg-black/20 backdrop-blur-md rounded px-2 py-1">
                    <span className="text-xs font-bold text-white">Upwelling Dynamics</span>
                  </div>
                </div>
              </div>
              
              {/* Crossfilter charts section */}
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-4">
                <h3 className="text-lg font-bold mb-4 text-dark dark:text-light">
                  Benguela System Analytics
                </h3>
                
                <div className="max-h-96 overflow-y-auto">
                  <CrossfilterCharts
                    data={crossfilterData}
                    compact={true}
                    dimensions={{
                      timestamp: d => d.timestamp,
                      temperature: d => d.temperature,
                      chlorophyll: d => d.chlorophyll,
                      upwellingIntensity: d => d.upwellingIntensity,
                      nutrientLevel: d => d.nutrientLevel,
                      phytoplankton: d => d.phytoplankton,
                      fishBiomass: d => d.fishBiomass,
                      latitude: d => d.latitude,
                      longitude: d => d.longitude,
                      month: d => d.month,
                      temperatureCategory: d => d.temperatureCategory,
                      upwellingCategory: d => d.upwellingCategory,
                      productivityCategory: d => d.productivityCategory,
                      depthCategory: d => d.depthCategory,
                      nutrientCategory: d => d.nutrientCategory,
                      fisheryCategory: d => d.fisheryCategory,
                      sardineAbundance: d => d.sardineAbundance,
                      anchovyAbundance: d => d.anchovyAbundance
                    }}
                    colorScheme="cool"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom info panel */}
          <div className="mt-8 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-lg font-bold mb-3 text-dark dark:text-light">Benguela Upwelling System</h4>
                <p className="text-sm text-dark/80 dark:text-light/80">
                  The Benguela Current is an eastern boundary upwelling system along the west coast of southern Africa. 
                  Driven by trade winds, it brings cold, nutrient-rich water to the surface, supporting one of the 
                  world's most productive marine ecosystems.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold mb-3 text-dark dark:text-light">Upwelling Features</h4>
                <ul className="text-sm text-dark/80 dark:text-light/80 space-y-1">
                  <li>• Sea temperature: 12-18°C</li>
                  <li>• High chlorophyll: 2-6 mg/m³</li>
                  <li>• Nutrient-rich waters</li>
                  <li>• Seasonal upwelling cycles</li>
                  <li>• Major sardine fisheries</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold mb-3 text-dark dark:text-light">Research Applications</h4>
                <ul className="text-sm text-dark/80 dark:text-light/80 space-y-1">
                  <li>• Upwelling intensity monitoring</li>
                  <li>• Fisheries stock assessment</li>
                  <li>• Phytoplankton dynamics</li>
                  <li>• Climate change impacts</li>
                  <li>• Ecosystem modeling</li>
                </ul>
              </div>
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
};

export default BenguelaAnalysis;

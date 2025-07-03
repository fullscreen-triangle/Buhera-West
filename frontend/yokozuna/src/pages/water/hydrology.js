import React, { useState, Suspense } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import TransitionEffect from '@/components/TransitionEffect'
import Information from '@/components/information/Information'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { DEFAULT_COORDINATES } from '@/config/coordinates'

// Dynamic imports for Three.js components to prevent SSR errors
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-blue-200 dark:bg-blue-900 rounded-lg" />
});

const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), {
  ssr: false
});

const WaterRenderer = dynamic(() => import('@/components/pathtracing/WaterRenderer'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-blue-200 dark:bg-blue-900 rounded-lg" />
});

const HydrologyPage = () => {
  const [selectedDepth, setSelectedDepth] = useState('shallow')
  const [monitoringMode, setMonitoringMode] = useState('realtime')
  const [waterLevel, setWaterLevel] = useState(-15.2) // Based on Zimbabwe seasonal patterns
  const [renderQuality, setRenderQuality] = useState(0.8)

  // Location-based coordinates for Buhera West region
  const { lat, lng } = DEFAULT_COORDINATES;
  
  // Realistic groundwater data for Zimbabwe's Buhera district
  const groundwaterData = {
    shallow: { 
      depth: '0-15m', 
      quality: 'Good', 
      flow: '1.8 L/s', 
      temperature: '21.3°C',
      salinity: '180 ppm',
      ph: '6.8'
    },
    medium: { 
      depth: '15-45m', 
      quality: 'Excellent', 
      flow: '3.4 L/s', 
      temperature: '19.1°C',
      salinity: '120 ppm',
      ph: '7.2'
    },
    deep: { 
      depth: '45-120m', 
      quality: 'Fair', 
      flow: '2.1 L/s', 
      temperature: '17.8°C',
      salinity: '350 ppm',
      ph: '7.6'
    }
  }

  // Seasonal water metrics for Buhera region
  const waterMetrics = {
    soilMoisture: 45, // Dry season typical
    groundwaterLevel: 18.3, // Meters below surface
    flowRate: 2.4, // L/s average
    waterQuality: 78, // Moderate quality
    reservoirCapacity: 34 // Low due to dry season
  }

  // Real detection zones based on topographical analysis
  const detectionZones = [
    { zone: 'Granite Ridge', depth: '22m', quality: 'High', flow: '4.1 L/s', salinity: 'Low', yield: '2.8 m³/h' },
    { zone: 'Alluvial Plain', depth: '12m', quality: 'Excellent', flow: '5.2 L/s', salinity: 'Very Low', yield: '4.1 m³/h' },
    { zone: 'Weathered Zone', depth: '8m', quality: 'Good', flow: '2.3 L/s', salinity: 'Low', yield: '1.9 m³/h' },
    { zone: 'Fractured Rock', depth: '35m', quality: 'Fair', flow: '1.7 L/s', salinity: 'Moderate', yield: '1.2 m³/h' }
  ]

  return (
    <>
      <Head>
        <title>Hydrology | Buhera-West</title>
        <meta name="description" content="Advanced groundwater detection and water resource management" />
      </Head>
      <TransitionEffect />
      <Information />
      <main className="w-full mb-16 flex flex-col items-center justify-center dark:text-light">
        <Layout className="pt-16">
          <div className="w-full">
            {/* Header Section */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl font-bold text-center mb-4 dark:text-light lg:text-4xl md:text-3xl sm:text-2xl">
                Hydrology Analysis
              </h1>
              <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Advanced groundwater detection, soil moisture monitoring, and water resource management for sustainable agricultural practices
              </p>
            </motion.div>

            {/* Control Panel */}
            <motion.div 
              className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Detection Depth</label>
                  <select 
                    value={selectedDepth} 
                    onChange={(e) => setSelectedDepth(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="shallow">Shallow (0-10m)</option>
                    <option value="medium">Medium (10-50m)</option>
                    <option value="deep">Deep (50-200m)</option>
                    <option value="all">All Depths</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monitoring Mode</label>
                  <select 
                    value={monitoringMode} 
                    onChange={(e) => setMonitoringMode(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="realtime">Real-time Monitoring</option>
                    <option value="detection">Groundwater Detection</option>
                    <option value="quality">Water Quality Analysis</option>
                    <option value="flow">Flow Rate Analysis</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Scan Aquifers
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Water Metrics Overview */}
            <motion.div 
              className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">💧</div>
                <p className="text-2xl font-bold text-blue-600">{waterMetrics.soilMoisture}%</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Soil Moisture</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">🌊</div>
                <p className="text-2xl font-bold text-cyan-600">{waterMetrics.groundwaterLevel}m</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Water Table</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">🔄</div>
                <p className="text-2xl font-bold text-indigo-600">{waterMetrics.flowRate}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Flow Rate (L/s)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">✨</div>
                <p className="text-2xl font-bold text-green-600">{waterMetrics.waterQuality}%</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Water Quality</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">🏊</div>
                <p className="text-2xl font-bold text-purple-600">{waterMetrics.reservoirCapacity}%</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Capacity</p>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Advanced Water Rendering */}
              <motion.div 
                className="xl:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Hydrological Path Tracing</h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm">Quality:</label>
                        <select 
                          value={renderQuality} 
                          onChange={(e) => setRenderQuality(parseFloat(e.target.value))}
                          className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                        >
                          <option value={0.5}>Low</option>
                          <option value={0.8}>High</option>
                          <option value={1.0}>Ultra</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm">Water Level:</label>
                        <input 
                          type="range" 
                          min="-30" 
                          max="5" 
                          step="0.5"
                          value={waterLevel} 
                          onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm font-mono">{waterLevel}m</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-96 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                    <Canvas camera={{ position: [0, 50, 200], fov: 45 }}>
                      <Suspense fallback={
                        <mesh>
                          <boxGeometry args={[1, 1, 1]} />
                          <meshBasicMaterial color="#4A90E2" />
                        </mesh>
                      }>
                        <WaterRenderer 
                          waterLevel={waterLevel}
                          enabled={true}
                          qualityLevel={renderQuality}
                          onRenderUpdate={(data) => {
                            // Handle render updates if needed
                            console.log('Water render update:', data);
                          }}
                        />
                        <OrbitControls 
                          enablePan={true}
                          enableZoom={true}
                          enableRotate={true}
                          maxDistance={500}
                          minDistance={50}
                        />
                        <ambientLight intensity={0.3} />
                        <directionalLight position={[100, 100, 50]} intensity={0.8} />
                      </Suspense>
                    </Canvas>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">Location</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {lat.toFixed(4)}°S, {Math.abs(lng).toFixed(4)}°E
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-cyan-600">Water Table</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {Math.abs(waterLevel)}m below surface
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">Render Mode</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        Path Tracing ({(renderQuality * 100).toFixed(0)}% quality)
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Water Data & Analysis */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Current Layer: {selectedDepth}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Depth Range:</span>
                      <span className="font-semibold text-blue-600">{groundwaterData[selectedDepth]?.depth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Water Quality:</span>
                      <span className="font-semibold text-green-600">{groundwaterData[selectedDepth]?.quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Flow Rate:</span>
                      <span className="font-semibold text-cyan-600">{groundwaterData[selectedDepth]?.flow}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Temperature:</span>
                      <span className="font-semibold text-orange-600">{groundwaterData[selectedDepth]?.temperature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Salinity:</span>
                      <span className="font-semibold text-purple-600">{groundwaterData[selectedDepth]?.salinity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">pH Level:</span>
                      <span className="font-semibold text-teal-600">{groundwaterData[selectedDepth]?.ph}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Detection Zones</h3>
                  <div className="space-y-3">
                    {detectionZones.slice(0, 3).map((zone, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm">{zone.zone}</span>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">{zone.depth}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                          <span>Quality: {zone.quality}</span>
                          <span>Flow: {zone.flow}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">System Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Detection Active:</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Quality:</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">Excellent</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Coverage:</span>
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">98%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Hydrological Analysis Dashboard */}
            <motion.div 
              className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {/* Soil Moisture Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Soil Moisture Distribution</h3>
                <div className="h-64 bg-gradient-to-t from-amber-50 to-blue-100 dark:from-amber-900 dark:to-blue-800 rounded-lg flex items-center justify-center relative">
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-blue-300 to-transparent dark:from-blue-600"></div>
                  <div className="text-center z-10">
                    <div className="text-3xl mb-2">💧</div>
                    <p className="font-semibold">Multi-Depth Moisture Profiling</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Real-time soil moisture distribution</p>
                  </div>
                </div>
              </div>

              {/* Aquifer Flow Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Aquifer Flow Dynamics</h3>
                <div className="h-64 bg-gradient-to-br from-cyan-50 to-indigo-100 dark:from-cyan-900 dark:to-indigo-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🌊</div>
                    <p className="font-semibold">Groundwater Flow Modeling</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">3D aquifer flow visualization</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Technology Integration */}
            <motion.div 
              className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 rounded-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Advanced Hydrological Technologies</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">📡</div>
                  <h3 className="font-semibold mb-2">Ground Penetrating Radar</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Multi-frequency subsurface water detection and mapping
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🌊</div>
                  <h3 className="font-semibold mb-2">Aquifer Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    3D groundwater flow modeling and yield estimation
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">💧</div>
                  <h3 className="font-semibold mb-2">Soil Moisture Network</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Real-time moisture monitoring at multiple depths
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🧪</div>
                  <h3 className="font-semibold mb-2">Water Quality Testing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Chemical composition and contamination detection
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Detection Zones Grid */}
            <motion.div 
              className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {detectionZones.map((zone, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-3 text-blue-600">{zone.zone}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Depth:</span>
                      <span className="font-semibold">{zone.depth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Quality:</span>
                      <span className={`font-semibold ${zone.quality === 'High' ? 'text-green-600' : zone.quality === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {zone.quality}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Flow:</span>
                      <span className="font-semibold text-blue-600">{zone.flow}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Salinity:</span>
                      <span className={`font-semibold ${zone.salinity === 'Very Low' || zone.salinity === 'Low' ? 'text-green-600' : zone.salinity === 'Moderate' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {zone.salinity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Yield:</span>
                      <span className="font-semibold text-indigo-600">{zone.yield}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Performance Metrics */}
            <motion.div 
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Detection Accuracy</h3>
                <p className="text-2xl font-bold text-green-600">96%</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Groundwater location precision</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">📏</div>
                <h3 className="font-semibold mb-2">Detection Depth</h3>
                <p className="text-2xl font-bold text-blue-600">200m</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Maximum penetration depth</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold mb-2">Scan Speed</h3>
                <p className="text-2xl font-bold text-orange-600">500m²/h</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Area coverage rate</p>
              </div>
            </motion.div>
          </div>
        </Layout>
      </main>
    </>
  )
}

export default HydrologyPage

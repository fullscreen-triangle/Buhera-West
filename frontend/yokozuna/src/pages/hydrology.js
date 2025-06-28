import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import TransitionEffect from '@/components/TransitionEffect'
import { motion } from 'framer-motion'

const HydrologyPage = () => {
  const [selectedDepth, setSelectedDepth] = useState('shallow')
  const [monitoringMode, setMonitoringMode] = useState('realtime')

  // Simulated groundwater data
  const groundwaterData = {
    shallow: { depth: '0-10m', quality: 'Excellent', flow: '2.3 L/s', temperature: '18.5°C' },
    medium: { depth: '10-50m', quality: 'Good', flow: '4.7 L/s', temperature: '16.2°C' },
    deep: { depth: '50-200m', quality: 'Fair', flow: '1.8 L/s', temperature: '14.8°C' }
  }

  const waterMetrics = {
    soilMoisture: 72,
    groundwaterLevel: 8.5,
    flowRate: 3.2,
    waterQuality: 94,
    reservoirCapacity: 67
  }

  const detectionZones = [
    { zone: 'Zone A', depth: '12m', quality: 'High', flow: '5.2 L/s', salinity: 'Low' },
    { zone: 'Zone B', depth: '8m', quality: 'Medium', flow: '3.1 L/s', salinity: 'Moderate' },
    { zone: 'Zone C', depth: '15m', quality: 'High', flow: '4.8 L/s', salinity: 'Very Low' },
    { zone: 'Zone D', depth: '6m', quality: 'Low', flow: '1.9 L/s', salinity: 'High' }
  ]

  return (
    <>
      <Head>
        <title>Hydrology | Buhera-West</title>
        <meta name="description" content="Advanced groundwater detection and water resource management" />
      </Head>
      <TransitionEffect />
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
              
              {/* Groundwater Detection Map */}
              <motion.div 
                className="xl:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h2 className="text-2xl font-bold mb-4">Groundwater Detection Map</h2>
                  <div className="h-96 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* Simulated groundwater zones */}
                    <div className="absolute inset-0 opacity-40">
                      <div className="absolute top-1/4 left-1/4 w-24 h-20 bg-blue-500 rounded-full blur-lg animate-pulse"></div>
                      <div className="absolute top-1/2 right-1/3 w-32 h-24 bg-cyan-500 rounded-full blur-lg"></div>
                      <div className="absolute bottom-1/4 left-1/2 w-28 h-22 bg-indigo-500 rounded-full blur-md"></div>
                      <div className="absolute top-2/3 right-1/4 w-20 h-16 bg-teal-500 rounded-full blur-sm"></div>
                    </div>
                    <div className="text-center z-10">
                      <div className="text-4xl mb-2">🌊</div>
                      <p className="text-lg font-semibold">Advanced Subsurface Water Detection</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Multi-Frequency Ground Penetrating • Aquifer Mapping • Flow Analysis
                      </p>
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

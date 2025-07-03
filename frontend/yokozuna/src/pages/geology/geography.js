import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import TransitionEffect from '@/components/TransitionEffect'
import { motion } from 'framer-motion'
import { DEFAULT_COORDINATES } from '@/config/coordinates'
import GeologicalVisualization from '@/components/geological/GeologicalVisualization'

const GeographyPage = () => {
  const [mapMode, setMapMode] = useState('terrain')
  const [coordinateSystem, setCoordinateSystem] = useState('wgs84')
  const [mapKey, setMapKey] = useState(0) // Force re-render when needed

  // Using centralized default Buhera West coordinates
  const locationData = DEFAULT_COORDINATES;

  const handleUpdateDisplay = () => {
    setMapKey(prev => prev + 1) // Force re-render of the map
  }

  const terrainMetrics = {
    elevation: '1,247m AMSL',
    slope: '2.3°',
    aspect: '147° SE',
    roughness: 'Moderate',
    visibility: '15.2 km'
  }

  return (
    <>
      <Head>
        <title>Geography | Buhera-West</title>
        <meta name="description" content="Advanced geographic analysis and spatial positioning" />
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
                Geographic Analysis
              </h1>
              <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Precision GPS positioning, terrain modeling, and spatial analysis for agricultural geographic intelligence
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
                  <label className="block text-sm font-medium mb-2">Map Display Mode</label>
                  <select 
                    value={mapMode} 
                    onChange={(e) => setMapMode(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="terrain">Terrain Analysis</option>
                    <option value="satellite">Satellite View</option>
                    <option value="topographic">Topographic</option>
                    <option value="elevation">Elevation Model</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Coordinate System</label>
                  <select 
                    value={coordinateSystem} 
                    onChange={(e) => setCoordinateSystem(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="wgs84">WGS84</option>
                    <option value="utm">UTM Zone 36K</option>
                    <option value="local">Local Grid</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleUpdateDisplay}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Update Display
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Geographic Map */}
              <motion.div 
                className="xl:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h2 className="text-2xl font-bold mb-4">Precision Geographic Map</h2>
                  <div className="h-96 rounded-lg overflow-hidden">
                    <GeologicalVisualization
                      key={mapKey}
                      latitude={locationData.latitude}
                      longitude={locationData.longitude}
                      mapMode={mapMode}
                      coordinateSystem={coordinateSystem}
                      showTerrain={true}
                      showSatellite={mapMode === 'satellite'}
                      showTopographic={mapMode === 'topographic'}
                      showElevation={mapMode === 'elevation'}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Geographic Metrics */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Precise Coordinates</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Latitude:</span>
                      <span className="font-semibold text-blue-600">{locationData.latitude}°S</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Longitude:</span>
                      <span className="font-semibold text-blue-600">{locationData.longitude}°E</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Altitude:</span>
                      <span className="font-semibold">{locationData.altitude}m AMSL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Accuracy:</span>
                      <span className="font-semibold text-green-600">{locationData.accuracy}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">UTM Zone:</span>
                      <span className="font-semibold">{locationData.zone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Terrain Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Elevation:</span>
                      <span className="font-semibold">{terrainMetrics.elevation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Slope:</span>
                      <span className="font-semibold text-orange-600">{terrainMetrics.slope}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Aspect:</span>
                      <span className="font-semibold">{terrainMetrics.aspect}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Visibility:</span>
                      <span className="font-semibold text-green-600">{terrainMetrics.visibility}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Satellite Network</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">GPS Satellites:</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">12 Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">GLONASS:</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">8 Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Galileo:</span>
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">6 Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">BeiDou:</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">4 Active</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Analysis Dashboard */}
            <motion.div 
              className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Elevation Profile */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Elevation Profile</h3>
                <div className="h-64 bg-gradient-to-t from-brown-200 to-white dark:from-brown-800 dark:to-gray-700 rounded-lg flex items-center justify-center relative">
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-300 to-transparent dark:from-green-700"></div>
                  <div className="text-center z-10">
                    <div className="text-3xl mb-2">⛰️</div>
                    <p className="font-semibold">Digital Elevation Model</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">High-resolution terrain mapping</p>
                  </div>
                </div>
              </div>

              {/* Spatial Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Spatial Analysis</h3>
                <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🗺️</div>
                    <p className="font-semibold">GIS Spatial Intelligence</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Multi-layer geographic analysis</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Technology Integration */}
            <motion.div 
              className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Advanced Geographic Technologies</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🛰️</div>
                  <h3 className="font-semibold mb-2">Multi-GNSS Positioning</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    GPS, GLONASS, Galileo, BeiDou constellation tracking
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📡</div>
                  <h3 className="font-semibold mb-2">Differential Correction</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Real-time kinematic positioning with millimeter accuracy
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🌍</div>
                  <h3 className="font-semibold mb-2">Terrain Modeling</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    High-resolution digital elevation models and surface analysis
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <h3 className="font-semibold mb-2">Spatial Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Advanced GIS analysis and geographic intelligence
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Real-time Status */}
            <motion.div 
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold mb-2">Position Update Rate</h3>
                <p className="text-2xl font-bold text-blue-600">10 Hz</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Real-time positioning</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Horizontal Accuracy</h3>
                <p className="text-2xl font-bold text-green-600">±0.5mm</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Survey-grade precision</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">📏</div>
                <h3 className="font-semibold mb-2">Vertical Accuracy</h3>
                <p className="text-2xl font-bold text-orange-600">±1.5mm</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Orthometric height</p>
              </div>
            </motion.div>
          </div>
        </Layout>
      </main>
    </>
  )
}

export default GeographyPage

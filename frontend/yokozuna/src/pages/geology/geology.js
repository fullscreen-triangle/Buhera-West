import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import TransitionEffect from '@/components/TransitionEffect'
import { motion } from 'framer-motion'

const GeologyPage = () => {
  const [analysisMode, setAnalysisMode] = useState('mineral')
  const [scanDepth, setScanDepth] = useState('shallow')

  // Simulated geological data
  const mineralData = {
    detected: [
      { name: 'Gold', confidence: 92, depth: '15-45m', concentration: 'High' },
      { name: 'Copper', confidence: 87, depth: '5-25m', concentration: 'Medium' },
      { name: 'Iron Ore', confidence: 95, depth: '10-35m', concentration: 'Very High' },
      { name: 'Lithium', confidence: 78, depth: '20-50m', concentration: 'Low' }
    ]
  }

  const geologicalFormations = {
    primary: 'Granite Basement Complex',
    secondary: 'Sedimentary Overlay',
    age: 'Archean Era (2.5-3.8 Ga)',
    structure: 'Fault-controlled mineralization',
    stability: 'Stable'
  }

  return (
    <>
      <Head>
        <title>Geology | Buhera-West</title>
        <meta name="description" content="Advanced geological analysis and mineral detection" />
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
                Geological Analysis
              </h1>
              <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Advanced mineral detection, geological formation analysis, and subsurface exploration using multi-modal sensing
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
                  <label className="block text-sm font-medium mb-2">Analysis Mode</label>
                  <select 
                    value={analysisMode} 
                    onChange={(e) => setAnalysisMode(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="mineral">Mineral Detection</option>
                    <option value="structure">Geological Structure</option>
                    <option value="composition">Rock Composition</option>
                    <option value="stability">Formation Stability</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Scan Depth</label>
                  <select 
                    value={scanDepth} 
                    onChange={(e) => setScanDepth(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="shallow">Shallow (0-50m)</option>
                    <option value="medium">Medium (50-200m)</option>
                    <option value="deep">Deep (200m+)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors">
                    Start Scan
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Geological Map */}
              <motion.div 
                className="xl:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h2 className="text-2xl font-bold mb-4">Subsurface Geological Map</h2>
                  <div className="h-96 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* Simulated geological layers */}
                    <div className="absolute inset-0 opacity-25">
                      <div className="absolute top-1/4 left-1/4 w-36 h-24 bg-yellow-500 rounded-lg transform rotate-12 blur-sm"></div>
                      <div className="absolute top-1/2 right-1/4 w-28 h-20 bg-copper-500 bg-orange-600 rounded-full blur-sm"></div>
                      <div className="absolute bottom-1/3 left-1/3 w-32 h-28 bg-gray-600 rounded-lg blur-lg"></div>
                      <div className="absolute top-2/3 right-1/3 w-20 h-20 bg-red-600 rounded-full blur-sm"></div>
                    </div>
                    <div className="text-center z-10">
                      <div className="text-4xl mb-2">🏔️</div>
                      <p className="text-lg font-semibold">Multi-Modal Mineral Detection</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Electromagnetic Scanning • Atmospheric Signatures • Solar Reflectance
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Mineral Detection Results */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Detected Minerals</h3>
                  <div className="space-y-3">
                    {mineralData.detected.map((mineral, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{mineral.name}</span>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {mineral.depth} • {mineral.concentration}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">{mineral.confidence}%</div>
                          <div className="text-xs text-gray-500">confidence</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Geological Formation</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Primary Formation:</span>
                      <span className="font-semibold text-orange-600">{geologicalFormations.primary}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Age:</span>
                      <span className="font-semibold">{geologicalFormations.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Structure:</span>
                      <span className="font-semibold text-blue-600">{geologicalFormations.structure}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Stability:</span>
                      <span className="font-semibold text-green-600">{geologicalFormations.stability}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Economic Assessment</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Extraction Viability:</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">High</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resource Grade:</span>
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">Medium</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Environmental Impact:</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">Low</span>
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
              {/* Depth Profile */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Subsurface Profile</h3>
                <div className="h-64 bg-gradient-to-b from-brown-100 via-gray-200 to-red-200 dark:from-brown-900 dark:via-gray-800 dark:to-red-900 rounded-lg flex items-center justify-center relative">
                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-green-200 to-brown-200 dark:from-green-800 dark:to-brown-800"></div>
                    <div className="absolute top-1/4 left-0 right-0 h-1/4 bg-gradient-to-b from-brown-200 to-gray-300 dark:from-brown-800 dark:to-gray-700"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-1/4 bg-gradient-to-b from-gray-300 to-orange-300 dark:from-gray-700 dark:to-orange-800"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-b from-orange-300 to-red-400 dark:from-orange-800 dark:to-red-900"></div>
                  </div>
                  <div className="text-center z-10">
                    <div className="text-3xl mb-2">🧭</div>
                    <p className="font-semibold">Geological Layers</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Multi-depth stratigraphic analysis</p>
                  </div>
                </div>
              </div>

              {/* Mineral Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Mineral Distribution</h3>
                <div className="h-64 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">💎</div>
                    <p className="font-semibold">Resource Mapping</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">3D mineral concentration analysis</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Technology Integration */}
            <motion.div 
              className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 rounded-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Advanced Detection Technologies</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <h3 className="font-semibold mb-2">Electromagnetic Scanning</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Multi-frequency conductivity mapping for mineral identification
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🌞</div>
                  <h3 className="font-semibold mb-2">Solar Reflectance Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Atmospheric mineral signatures through spectral analysis
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📡</div>
                  <h3 className="font-semibold mb-2">Signal Processing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    MIMO and cellular network geological correlation
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="font-semibold mb-2">Precision Localization</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sub-meter accuracy in mineral deposit positioning
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Detection Capabilities */}
            <motion.div 
              className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-2">🥇</div>
                <h3 className="font-semibold mb-1">Precious Metals</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Gold, Silver, Platinum</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-2">🔩</div>
                <h3 className="font-semibold mb-1">Base Metals</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Copper, Iron, Aluminum</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-2">🔋</div>
                <h3 className="font-semibold mb-1">Rare Earth</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Lithium, Cobalt, REE</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-2">💎</div>
                <h3 className="font-semibold mb-1">Gemstones</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Diamonds, Emeralds</p>
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div 
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">📏</div>
                <h3 className="font-semibold mb-2">Detection Accuracy</h3>
                <p className="text-2xl font-bold text-green-600">90%+</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Major deposits &gt;10m</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Positioning Precision</h3>
                <p className="text-2xl font-bold text-blue-600">±5m</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Horizontal accuracy</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">⬇️</div>
                <h3 className="font-semibold mb-2">Depth Range</h3>
                <p className="text-2xl font-bold text-orange-600">200m+</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Subsurface analysis</p>
              </div>
            </motion.div>
          </div>
        </Layout>
      </main>
    </>
  )
}

export default GeologyPage

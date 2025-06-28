import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import TransitionEffect from '@/components/TransitionEffect'
import { motion } from 'framer-motion'

const AgriculturePage = () => {
  const [cropType, setCropType] = useState('maize')
  const [analysisMode, setAnalysisMode] = useState('optimization')

  // Simulated agricultural data
  const cropData = {
    maize: { 
      stage: 'Tasseling', 
      health: 'Excellent', 
      yield: '8.2 t/ha', 
      waterNeed: 'Medium',
      harvestDate: '2024-04-15'
    },
    tobacco: { 
      stage: 'Leaf Development', 
      health: 'Good', 
      yield: '2.1 t/ha', 
      waterNeed: 'High',
      harvestDate: '2024-03-28'
    },
    cotton: { 
      stage: 'Flowering', 
      health: 'Fair', 
      yield: '1.8 t/ha', 
      waterNeed: 'Low',
      harvestDate: '2024-05-20'
    }
  }

  const agriculturalMetrics = {
    soilMoisture: 68,
    nutrientLevel: 82,
    pestRisk: 23,
    diseaseRisk: 15,
    irrigationEfficiency: 89
  }

  const optimizationRecommendations = [
    { type: 'Irrigation', action: 'Increase by 15%', timing: 'Next 48 hours', impact: 'High' },
    { type: 'Fertilizer', action: 'Apply NPK 15-15-15', timing: 'Next week', impact: 'Medium' },
    { type: 'Pest Control', action: 'Monitor for aphids', timing: 'Daily', impact: 'Low' },
    { type: 'Harvest', action: 'Prepare equipment', timing: '2 weeks', impact: 'Critical' }
  ]

  return (
    <>
      <Head>
        <title>Agriculture | Buhera-West</title>
        <meta name="description" content="Precision agriculture and crop optimization" />
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
                Agricultural Intelligence
              </h1>
              <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Precision farming optimization, crop monitoring, and agricultural decision support using advanced environmental intelligence
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
                  <label className="block text-sm font-medium mb-2">Crop Type</label>
                  <select 
                    value={cropType} 
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="maize">Maize (Corn)</option>
                    <option value="tobacco">Tobacco</option>
                    <option value="cotton">Cotton</option>
                    <option value="soybean">Soybean</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Analysis Mode</label>
                  <select 
                    value={analysisMode} 
                    onChange={(e) => setAnalysisMode(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="optimization">Optimization</option>
                    <option value="monitoring">Crop Monitoring</option>
                    <option value="irrigation">Irrigation Planning</option>
                    <option value="harvest">Harvest Timing</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                    Analyze Fields
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Crop Status Overview */}
            <motion.div 
              className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">🌱</div>
                <p className="text-lg font-bold text-green-600">{cropData[cropType].stage}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Growth Stage</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">💚</div>
                <p className="text-lg font-bold text-green-600">{cropData[cropType].health}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Crop Health</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">📊</div>
                <p className="text-lg font-bold text-blue-600">{cropData[cropType].yield}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Expected Yield</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">💧</div>
                <p className="text-lg font-bold text-cyan-600">{cropData[cropType].waterNeed}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Water Need</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">🗓️</div>
                <p className="text-lg font-bold text-orange-600">{cropData[cropType].harvestDate}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Harvest Date</p>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Field Management Map */}
              <motion.div 
                className="xl:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h2 className="text-2xl font-bold mb-4">Precision Field Management</h2>
                  <div className="h-96 bg-gradient-to-br from-green-100 to-yellow-100 dark:from-green-900 dark:to-yellow-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* Simulated field zones */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-1/4 left-1/4 w-32 h-24 bg-green-500 rounded-lg blur-sm"></div>
                      <div className="absolute top-1/2 right-1/4 w-28 h-20 bg-yellow-500 rounded-lg blur-sm"></div>
                      <div className="absolute bottom-1/3 left-1/3 w-24 h-18 bg-orange-500 rounded-lg blur-sm"></div>
                      <div className="absolute top-1/3 center w-20 h-16 bg-red-400 rounded-lg blur-sm"></div>
                    </div>
                    <div className="text-center z-10">
                      <div className="text-4xl mb-2">🚜</div>
                      <p className="text-lg font-semibold">Multi-Modal Agricultural Analysis</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Crop Monitoring • Irrigation Optimization • Weather Integration
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Agricultural Metrics & Recommendations */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Field Conditions</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Soil Moisture:</span>
                      <span className="font-semibold text-blue-600">{agriculturalMetrics.soilMoisture}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Nutrient Level:</span>
                      <span className="font-semibold text-green-600">{agriculturalMetrics.nutrientLevel}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Pest Risk:</span>
                      <span className="font-semibold text-orange-600">{agriculturalMetrics.pestRisk}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Disease Risk:</span>
                      <span className="font-semibold text-green-600">{agriculturalMetrics.diseaseRisk}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Irrigation Efficiency:</span>
                      <span className="font-semibold text-blue-600">{agriculturalMetrics.irrigationEfficiency}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Optimization Actions</h3>
                  <div className="space-y-3">
                    {optimizationRecommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-3">
                        <div className="font-semibold text-sm">{rec.type}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{rec.action}</div>
                        <div className="text-xs text-blue-600">{rec.timing}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Resource Efficiency</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Water Savings:</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">+35%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Energy Efficiency:</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">+28%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Yield Improvement:</span>
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">+22%</span>
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
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {/* Crop Growth Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Crop Growth Analysis</h3>
                <div className="h-64 bg-gradient-to-t from-green-50 to-yellow-100 dark:from-green-900 dark:to-yellow-800 rounded-lg flex items-center justify-center relative">
                  <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-green-200 to-transparent dark:from-green-700"></div>
                  <div className="text-center z-10">
                    <div className="text-3xl mb-2">📈</div>
                    <p className="font-semibold">Growth Stage Monitoring</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Real-time crop development tracking</p>
                  </div>
                </div>
              </div>

              {/* Irrigation Optimization */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Irrigation Optimization</h3>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900 dark:to-cyan-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">💧</div>
                    <p className="font-semibold">Smart Water Management</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">AI-driven irrigation scheduling</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Technology Integration */}
            <motion.div 
              className="mt-8 bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900 dark:to-yellow-900 rounded-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Precision Agriculture Technologies</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🌿</div>
                  <h3 className="font-semibold mb-2">Crop Health Monitoring</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Multi-spectral analysis for disease and stress detection
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">💧</div>
                  <h3 className="font-semibold mb-2">Smart Irrigation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Groundwater detection with optimal water scheduling
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🌦️</div>
                  <h3 className="font-semibold mb-2">Weather Integration</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Solar reflectance and atmospheric analysis for decisions
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🤖</div>
                  <h3 className="font-semibold mb-2">AI Optimization</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Machine learning for yield and resource optimization
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Crop Management Stages */}
            <motion.div 
              className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">🌱</div>
                <h3 className="font-semibold mb-2">Planting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Optimal timing and seed placement</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">🌿</div>
                <h3 className="font-semibold mb-2">Growth</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Monitoring and nutrient management</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">🌾</div>
                <h3 className="font-semibold mb-2">Maturation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Disease prevention and protection</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">🚜</div>
                <h3 className="font-semibold mb-2">Harvest</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Timing optimization and logistics</p>
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div 
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold mb-2">Yield Increase</h3>
                <p className="text-2xl font-bold text-green-600">+25%</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Compared to traditional methods</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">💧</div>
                <h3 className="font-semibold mb-2">Water Savings</h3>
                <p className="text-2xl font-bold text-blue-600">35%</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Through optimized irrigation</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold mb-2">Energy Efficiency</h3>
                <p className="text-2xl font-bold text-orange-600">+28%</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Reduced operational costs</p>
              </div>
            </motion.div>
          </div>
        </Layout>
      </main>
    </>
  )
}

export default AgriculturePage

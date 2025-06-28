import React from 'react'
import Head from 'next/head'
import TransitionEffect from '@/components/TransitionEffect'
import WeatherScrollStory from '@/components/weather/WeatherScrollStory'

const WeatherPage = () => {
  return (
    <>
      <Head>
        <title>Weather | Buhera-West</title>
        <meta name="description" content="High-precision personal weather report with scrollytelling" />
      </Head>
      <TransitionEffect />
      <WeatherScrollStory />
          <div className="w-full">
            {/* Header Section */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl font-bold text-center mb-4 dark:text-light lg:text-4xl md:text-3xl sm:text-2xl">
                Weather Analysis
              </h1>
              <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Advanced atmospheric monitoring, ensemble weather prediction, and solar reflectance analysis for agricultural weather intelligence
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
                  <label className="block text-sm font-medium mb-2">Forecast Range</label>
                  <select 
                    value={forecastRange} 
                    onChange={(e) => setForecastRange(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="24h">24 Hours</option>
                    <option value="48h">48 Hours</option>
                    <option value="72h">72 Hours</option>
                    <option value="7day">7 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Analysis Mode</label>
                  <select 
                    value={analysisMode} 
                    onChange={(e) => setAnalysisMode(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="ensemble">Ensemble Forecast</option>
                    <option value="solar">Solar Reflectance</option>
                    <option value="atmospheric">Atmospheric Analysis</option>
                    <option value="predictive">Predictive Models</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Update Forecast
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Current Weather Overview */}
            <motion.div 
              className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">🌡️</div>
                <p className="text-2xl font-bold text-orange-600">{currentWeather.temperature}°C</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Temperature</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">💧</div>
                <p className="text-2xl font-bold text-blue-600">{currentWeather.humidity}%</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Humidity</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">🌀</div>
                <p className="text-2xl font-bold text-green-600">{currentWeather.pressure}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Pressure (hPa)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">💨</div>
                <p className="text-2xl font-bold text-purple-600">{currentWeather.windSpeed}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Wind (m/s)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">🧭</div>
                <p className="text-2xl font-bold text-indigo-600">{currentWeather.windDirection}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Direction</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">👁️</div>
                <p className="text-2xl font-bold text-cyan-600">{currentWeather.visibility}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Visibility (km)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <div className="text-2xl mb-1">☀️</div>
                <p className="text-2xl font-bold text-yellow-600">{currentWeather.uvIndex}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">UV Index</p>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Weather Map */}
              <motion.div 
                className="xl:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h2 className="text-2xl font-bold mb-4">Atmospheric Analysis Map</h2>
                  <div className="h-96 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* Simulated weather patterns */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-1/4 left-1/3 w-40 h-32 bg-white rounded-full blur-xl animate-pulse"></div>
                      <div className="absolute top-1/2 right-1/4 w-32 h-24 bg-gray-400 rounded-full blur-lg"></div>
                      <div className="absolute bottom-1/4 left-1/4 w-28 h-20 bg-blue-400 rounded-lg blur-md"></div>
                      <div className="absolute top-3/4 right-1/3 w-24 h-16 bg-yellow-300 rounded-full blur-sm"></div>
                    </div>
                    <div className="text-center z-10">
                      <div className="text-4xl mb-2">🌦️</div>
                      <p className="text-lg font-semibold">Real-Time Atmospheric Monitoring</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Solar Reflectance • Ensemble Prediction • Atmospheric Sensing
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Weather Forecast & Atmospheric Data */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Extended Forecast</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Next 24h:</span>
                      <div className="text-right">
                        <div className="font-semibold">{forecast['24h'].temp}</div>
                        <div className="text-xs text-blue-600">{forecast['24h'].precipitation}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Next 48h:</span>
                      <div className="text-right">
                        <div className="font-semibold">{forecast['48h'].temp}</div>
                        <div className="text-xs text-orange-600">{forecast['48h'].precipitation}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Next 72h:</span>
                      <div className="text-right">
                        <div className="font-semibold">{forecast['72h'].temp}</div>
                        <div className="text-xs text-red-600">{forecast['72h'].precipitation}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Atmospheric Conditions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Solar Intensity:</span>
                      <span className="font-semibold text-yellow-600">{atmosphericData.solarIntensity} W/m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Water Vapor:</span>
                      <span className="font-semibold text-blue-600">{atmosphericData.waterVapor} g/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Aerosols:</span>
                      <span className="font-semibold text-gray-600">{atmosphericData.aerosols} AOD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cloud Cover:</span>
                      <span className="font-semibold text-gray-500">{atmosphericData.cloudCover}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Agricultural Alerts</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Frost Risk:</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">Low</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Heat Stress:</span>
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">Moderate</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Storm Warning:</span>
                      <span className="text-xs bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">High</span>
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
              {/* Weather Trends */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Weather Trends</h3>
                <div className="h-64 bg-gradient-to-t from-blue-50 to-sky-100 dark:from-blue-900 dark:to-sky-800 rounded-lg flex items-center justify-center relative">
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-blue-200 to-transparent dark:from-blue-700"></div>
                  <div className="text-center z-10">
                    <div className="text-3xl mb-2">📈</div>
                    <p className="font-semibold">Temporal Weather Analysis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Historical and predictive trends</p>
                  </div>
                </div>
              </div>

              {/* Ensemble Forecast */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Ensemble Prediction</h3>
                <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <p className="font-semibold">Multi-Model Consensus</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Uncertainty quantification</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Technology Integration */}
            <motion.div 
              className="mt-8 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900 dark:to-blue-900 rounded-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Advanced Atmospheric Technologies</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🌞</div>
                  <h3 className="font-semibold mb-2">Solar Reflectance Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    High-intensity solar environmental analysis with 24/7 capability
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🎛️</div>
                  <h3 className="font-semibold mb-2">Hardware Oscillatory Sensing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    LED-based atmospheric molecular detection and analysis
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📡</div>
                  <h3 className="font-semibold mb-2">MIMO Atmospheric Coupling</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    15,000+ simultaneous signals for atmospheric interaction
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🤖</div>
                  <h3 className="font-semibold mb-2">AI-Enhanced Prediction</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    HuggingFace integration with continuous learning systems
                  </p>
                </div>
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
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Forecast Accuracy</h3>
                <p className="text-2xl font-bold text-green-600">95%+</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">24-hour predictions</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold mb-2">Update Frequency</h3>
                <p className="text-2xl font-bold text-blue-600">10 min</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Real-time monitoring</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="text-3xl mb-2">🌍</div>
                <h3 className="font-semibold mb-2">Coverage Area</h3>
                <p className="text-2xl font-bold text-orange-600">500km²</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Regional monitoring</p>
              </div>
            </motion.div>
          </div>
        </Layout>
      </main>
    </>
  )
}

export default WeatherPage

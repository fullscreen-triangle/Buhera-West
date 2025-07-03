import React from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import TransitionEffect from '../../components/TransitionEffect'
import AnimatedText from '../../components/AnimatedText'
import CropFieldDemo from '../../components/agricultural/CropFieldDemo'

const crops = () => {
  return (
    <>
      <Head>
        <title>Buhera-West | Crop Visualization</title>
        <meta name="description" content="Advanced crop field visualization for maize and wheat cultivation in Buhera-West region using Three.js and agricultural intelligence." />
        <meta name="keywords" content="crop visualization, maize, wheat, agriculture, Zimbabwe, Three.js, React Three Fiber, farming simulation" />
      </Head>
      <TransitionEffect />
      <main className="flex w-full flex-col items-center justify-center">
        <Layout className="pt-16">
          <AnimatedText 
            text="Crop Field Visualization" 
            className="mb-16 lg:!text-7xl sm:mb-8 sm:!text-6xl xs:!text-4xl" 
          />
          
          <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-1">
            {/* Main Crop Visualization */}
            <div className="col-span-1">
              <div className="h-screen w-full relative">
                <CropFieldDemo />
              </div>
            </div>
          </div>
          
          {/* Information Section */}
          <div className="w-full mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Maize Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4">🌽 Maize Cultivation</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div><strong>Scientific Name:</strong> Zea mays</div>
                <div><strong>Growth Period:</strong> 120-140 days</div>
                <div><strong>Planting Season:</strong> October - December</div>
                <div><strong>Expected Yield:</strong> 6-10 tons/hectare</div>
                <div><strong>Water Requirements:</strong> 500-800mm/season</div>
                <div><strong>Optimal Temperature:</strong> 20-30°C</div>
                <div><strong>Soil pH:</strong> 6.0-7.5</div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <h4 className="font-semibold text-green-800 mb-2">Growth Stages</h4>
                <div className="text-xs text-green-700 space-y-1">
                  <div>• Germination: 5-10 days</div>
                  <div>• Vegetative: 45-65 days</div>
                  <div>• Tasseling: 65-75 days</div>
                  <div>• Grain filling: 75-110 days</div>
                  <div>• Maturity: 120-140 days</div>
                </div>
              </div>
            </div>

            {/* Wheat Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-amber-800 mb-4">🌾 Wheat Cultivation</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div><strong>Scientific Name:</strong> Triticum aestivum</div>
                <div><strong>Growth Period:</strong> 100-120 days</div>
                <div><strong>Planting Season:</strong> May - July</div>
                <div><strong>Expected Yield:</strong> 3-5 tons/hectare</div>
                <div><strong>Water Requirements:</strong> 450-650mm/season</div>
                <div><strong>Optimal Temperature:</strong> 15-25°C</div>
                <div><strong>Soil pH:</strong> 6.0-7.0</div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-md">
                <h4 className="font-semibold text-amber-800 mb-2">Growth Stages</h4>
                <div className="text-xs text-amber-700 space-y-1">
                  <div>• Germination: 7-14 days</div>
                  <div>• Tillering: 20-45 days</div>
                  <div>• Stem elongation: 45-65 days</div>
                  <div>• Heading: 65-85 days</div>
                  <div>• Grain filling: 85-120 days</div>
                </div>
              </div>
            </div>

            {/* Technology Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4">🔬 Visualization Technology</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div><strong>Rendering Engine:</strong> Three.js / React Three Fiber</div>
                <div><strong>Instancing:</strong> 1000s of individual plants</div>
                <div><strong>Shaders:</strong> Custom GLSL materials</div>
                <div><strong>Physics:</strong> Wind simulation & growth</div>
                <div><strong>Performance:</strong> 60 FPS with 10k+ instances</div>
                <div><strong>Optimization:</strong> LOD and frustum culling</div>
                <div><strong>Realism:</strong> Botanical accuracy</div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <h4 className="font-semibold text-blue-800 mb-2">Features</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• Real-time growth simulation</div>
                  <div>• Seasonal lighting changes</div>
                  <div>• Weather effect visualization</div>
                  <div>• Agricultural intelligence data</div>
                  <div>• Interactive field controls</div>
                </div>
              </div>
            </div>
          </div>

          {/* Agricultural Intelligence Section */}
          <div className="w-full mt-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Agricultural Intelligence Integration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-2xl">🛰️</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Satellite Monitoring</h3>
                <p className="text-sm text-gray-600">
                  Real-time crop health assessment using multispectral satellite imagery
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Yield Prediction</h3>
                <p className="text-sm text-gray-600">
                  AI-powered yield forecasting based on growth patterns and weather data
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-2xl">💧</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Smart Irrigation</h3>
                <p className="text-sm text-gray-600">
                  Optimized water management through soil moisture and weather analysis
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-2xl">🌡️</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Climate Adaptation</h3>
                <p className="text-sm text-gray-600">
                  Adaptive farming strategies based on local climate patterns
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-700 max-w-3xl mx-auto">
                This advanced crop visualization system combines real-time 3D rendering with agricultural 
                intelligence to provide farmers in the Buhera-West region with actionable insights for 
                optimizing crop yields, managing resources efficiently, and adapting to changing climate conditions.
              </p>
            </div>
          </div>
        </Layout>
      </main>
    </>
  )
}

export default crops 
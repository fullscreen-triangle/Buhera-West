// CropFieldDemo.jsx - Comprehensive agricultural crop field demonstration
import React, { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky, Environment, Stats } from '@react-three/drei'
import * as THREE from 'three'
import MaizeCrop from './MaizeCrop'
import WheatCrop from './WheatCrop'

export default function CropFieldDemo() {
  const [cropType, setCropType] = useState('mixed') // 'maize', 'wheat', 'mixed'
  const [growthStage, setGrowthStage] = useState(0.8)
  const [season, setSeason] = useState('summer') // 'spring', 'summer', 'autumn', 'winter'
  const [showStats, setShowStats] = useState(false)
  const [fieldSize, setFieldSize] = useState(80)
  const [weatherCondition, setWeatherCondition] = useState('clear') // 'clear', 'cloudy', 'storm'

  const seasonalSettings = useMemo(() => {
    const settings = {
      spring: { 
        skyTurbidity: 2, 
        skyRayleigh: 1, 
        sunPosition: [0, 0.2, -1],
        fogColor: '#a8d8a8',
        ambientIntensity: 0.6
      },
      summer: { 
        skyTurbidity: 10, 
        skyRayleigh: 0.5, 
        sunPosition: [0, 1, 0],
        fogColor: '#e8f4e8',
        ambientIntensity: 0.8
      },
      autumn: { 
        skyTurbidity: 15, 
        skyRayleigh: 2, 
        sunPosition: [0.5, 0.3, -0.8],
        fogColor: '#d4b896',
        ambientIntensity: 0.5
      },
      winter: { 
        skyTurbidity: 5, 
        skyRayleigh: 3, 
        sunPosition: [0.3, 0.1, -0.9],
        fogColor: '#c8d6e8',
        ambientIntensity: 0.3
      }
    }
    return settings[season]
  }, [season])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-100 to-green-100">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="text-lg font-bold text-green-800 mb-3">Agricultural Field Visualization</h3>
        
        {/* Crop Type Selection */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
          <select 
            value={cropType} 
            onChange={(e) => setCropType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
          >
            <option value="mixed">Mixed Field (Maize & Wheat)</option>
            <option value="maize">Maize Only</option>
            <option value="wheat">Wheat Only</option>
          </select>
        </div>

        {/* Growth Stage */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Growth Stage: {Math.round(growthStage * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={growthStage}
            onChange={(e) => setGrowthStage(parseFloat(e.target.value))}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-600 mt-1">
            {growthStage < 0.3 ? 'Seedling' : 
             growthStage < 0.6 ? 'Vegetative' : 
             growthStage < 0.8 ? 'Reproductive' : 'Mature/Harvest Ready'}
          </div>
        </div>

        {/* Season Selection */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
          <div className="grid grid-cols-2 gap-2">
            {['spring', 'summer', 'autumn', 'winter'].map(s => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={`p-2 text-xs rounded-md transition-colors ${
                  season === s 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Field Size */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Size: {fieldSize}m²
          </label>
          <input
            type="range"
            min="40"
            max="120"
            step="10"
            value={fieldSize}
            onChange={(e) => setFieldSize(parseInt(e.target.value))}
            className="w-full h-2 bg-brown-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Weather Condition */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
          <select 
            value={weatherCondition} 
            onChange={(e) => setWeatherCondition(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="clear">Clear</option>
            <option value="cloudy">Cloudy</option>
            <option value="storm">Storm</option>
          </select>
        </div>

        {/* Performance Stats Toggle */}
        <div className="mb-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showStats}
              onChange={(e) => setShowStats(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Show Performance Stats</span>
          </label>
        </div>

        {/* Agricultural Intelligence Info */}
        <div className="bg-green-50 p-3 rounded-md mt-4">
          <h4 className="text-sm font-semibold text-green-800 mb-2">Field Intelligence</h4>
          <div className="text-xs text-green-700 space-y-1">
            <div>Estimated Yield: {cropType === 'wheat' ? '4.2' : cropType === 'maize' ? '8.5' : '6.4'} tons/ha</div>
            <div>Water Requirement: {Math.round(growthStage * 100 + 50)}mm/week</div>
            <div>Harvest Window: {Math.round((1 - growthStage) * 45)} days remaining</div>
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 25, 40], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting */}
        <ambientLight intensity={seasonalSettings.ambientIntensity} color="#f0f8ff" />
        <directionalLight 
          position={seasonalSettings.sunPosition.map(x => x * 50)} 
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        {/* Sky Environment */}
        <Sky
          turbidity={seasonalSettings.skyTurbidity}
          rayleigh={seasonalSettings.skyRayleigh}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
          sunPosition={seasonalSettings.sunPosition}
        />

        {/* Fog for atmosphere */}
        <fog attach="fog" args={[seasonalSettings.fogColor, 30, 200]} />

        {/* Crop Fields */}
        <CropFields 
          cropType={cropType}
          growthStage={growthStage}
          fieldSize={fieldSize}
          season={season}
          weatherCondition={weatherCondition}
        />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.2}
        />

        {/* Performance Stats */}
        {showStats && <Stats />}

        {/* Environment Lighting */}
        <Environment preset="sunset" background={false} />
      </Canvas>

      {/* Information Panel */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
        <h4 className="text-md font-bold text-gray-800 mb-2">Buhera-West Agricultural Intelligence</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>🌾 Crop Monitoring: Real-time growth analysis</div>
          <div>💧 Irrigation: Smart water management</div>
          <div>🌤️ Weather: {weatherCondition} conditions</div>
          <div>📊 Field optimization using satellite data</div>
        </div>
      </div>
    </div>
  )
}

// Component for managing crop fields
function CropFields({ cropType, growthStage, fieldSize, season, weatherCondition }) {
  return (
    <group>
      {/* Mixed field layout */}
      {cropType === 'mixed' && (
        <>
          {/* Maize section */}
          <MaizeCrop
            position={[-fieldSize/4, 0, 0]}
            options={{
              stalkWidth: 0.08,
              stalkHeight: 2.5,
              joints: 8,
              growthStage: growthStage
            }}
            width={fieldSize/2}
            instances={Math.floor(2000 * (fieldSize/80))}
            fieldSpacing={0.75}
          />
          
          {/* Wheat section */}
          <WheatCrop
            position={[fieldSize/4, 0, 0]}
            options={{
              stemWidth: 0.02,
              stemHeight: 1.2,
              joints: 6,
              tillering: 3,
              growthStage: growthStage
            }}
            width={fieldSize/2}
            instances={Math.floor(4000 * (fieldSize/80))}
            fieldSpacing={0.15}
          />
        </>
      )}

      {/* Maize only */}
      {cropType === 'maize' && (
        <MaizeCrop
          options={{
            stalkWidth: 0.08,
            stalkHeight: 2.5,
            joints: 8,
            growthStage: growthStage
          }}
          width={fieldSize}
          instances={Math.floor(5000 * (fieldSize/80))}
          fieldSpacing={0.75}
        />
      )}

      {/* Wheat only */}
      {cropType === 'wheat' && (
        <WheatCrop
          options={{
            stemWidth: 0.02,
            stemHeight: 1.2,
            joints: 6,
            tillering: 3,
            growthStage: growthStage
          }}
          width={fieldSize}
          instances={Math.floor(8000 * (fieldSize/80))}
          fieldSpacing={0.15}
        />
      )}

      {/* Weather effects */}
      {weatherCondition === 'storm' && <StormEffects />}
      {weatherCondition === 'cloudy' && <CloudyEffects />}
    </group>
  )
}

// Weather effect components
function StormEffects() {
  const particlesRef = useRef()
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  const particleCount = 1000
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200
      pos[i * 3 + 1] = Math.random() * 50 + 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200
    }
    return pos
  }, [])

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#4a90e2" size={0.5} transparent opacity={0.6} />
    </points>
  )
}

function CloudyEffects() {
  return (
    <group>
      <mesh position={[0, 30, -20]}>
        <sphereGeometry args={[15, 16, 16]} />
        <meshStandardMaterial color="#e6e6e6" transparent opacity={0.3} />
      </mesh>
      <mesh position={[20, 25, -10]}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshStandardMaterial color="#d9d9d9" transparent opacity={0.4} />
      </mesh>
    </group>
  )
} 
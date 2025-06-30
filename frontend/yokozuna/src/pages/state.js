import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import TransitionEffect from '@/components/TransitionEffect'
import Layout from '@/components/Layout'
import AnimatedText from '@/components/AnimatedText'
import DayNightCycle from '@/components/cycles/DayNightCycle'
import PlanetRenderer from '@/components/pathtracing/PlanetRenderer'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { DEFAULT_COORDINATES } from '@/config/coordinates'

const StatePage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [dayNightState, setDayNightState] = useState({
    timeOfDay: 12,
    isDay: true,
    sunIntensity: 1.0
  });
  const [planetState, setPlanetState] = useState({
    atmosphereHeight: 50,
    planetRadius: 200,
    planetColor: [0.6, 0.4, 0.2],
    qualityLevel: 1.0,
    renderingActive: true,
    frameTime: 0,
    sunDirection: [1, 0.5, 0.2]
  });
  const [systemStatus, setSystemStatus] = useState({
    dataStreamStatus: 'ACTIVE',
    satelliteConnections: 47,
    weatherStations: 23,
    soilSensors: 156,
    atmosphericSensors: 34,
    lastDataSync: new Date(Date.now() - 30000), // 30 seconds ago
    networkLatency: 12.4,
    dataAccuracy: 99.7,
    storageUtilization: 73.2
  });

  // Prevent hydration mismatch by only rendering dynamic content on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update time every second for atomic clock precision display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate real-time system updates
  useEffect(() => {
    const statusTimer = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        satelliteConnections: prev.satelliteConnections + Math.floor(Math.random() * 3) - 1,
        networkLatency: +(prev.networkLatency + (Math.random() - 0.5) * 2).toFixed(1),
        dataAccuracy: +(prev.dataAccuracy + (Math.random() - 0.5) * 0.1).toFixed(1),
        storageUtilization: +(prev.storageUtilization + (Math.random() - 0.5) * 0.5).toFixed(1),
        lastDataSync: new Date()
      }));
    }, 5000);

    return () => clearInterval(statusTimer);
  }, []);

  // Update planet parameters based on system status
  useEffect(() => {
    setPlanetState(prev => ({
      ...prev,
      // Adjust atmosphere height based on data accuracy
      atmosphereHeight: 30 + (systemStatus.dataAccuracy * 0.5),
      // Adjust quality based on network performance
      qualityLevel: systemStatus.networkLatency < 15 ? 1.0 : 
                   systemStatus.networkLatency < 25 ? 0.7 : 0.5,
      // Change planet color based on system health
      planetColor: systemStatus.dataStreamStatus === 'ACTIVE' ? 
                   [0.4, 0.6, 0.8] : // Blue-green for active
                   systemStatus.dataStreamStatus === 'WARNING' ? 
                   [0.8, 0.6, 0.2] : // Orange for warning
                   [0.8, 0.2, 0.2], // Red for error
      // Enable/disable rendering based on system resources
      renderingActive: systemStatus.storageUtilization < 90
    }));
  }, [systemStatus]);

  // Using centralized default Buhera West coordinates
  const preciseCoordinates = DEFAULT_COORDINATES;

  const formatAtomicTime = (date) => {
    const utc = date.toISOString();
    const local = date.toLocaleString('en-GB', { timeZone: 'Africa/Harare' });
    return { utc, local };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-500';
      case 'WARNING': return 'text-yellow-500';
      case 'ERROR': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleDayNightChange = (timeOfDay, isDay) => {
    setDayNightState({
      timeOfDay,
      isDay,
      sunIntensity: isDay ? 1.0 : 0.1
    });
  };

  const handlePlanetRenderUpdate = (updateData) => {
    setPlanetState(prev => ({
      ...prev,
      frameTime: updateData.frameTime,
      sunDirection: [
        updateData.sunDirection.x,
        updateData.sunDirection.y,
        updateData.sunDirection.z
      ]
    }));
  };

  const time = formatAtomicTime(currentTime);

  return (
    <>
      <Head>
        <title>Planetary State | Buhera-West</title>
        <meta name="description" content="Real-time planetary and system state monitoring with comprehensive metrics, environmental intelligence, solar cycle visualization, and path-traced planetary rendering" />
      </Head>
      <TransitionEffect />
      
      <main className="w-full mb-16 flex flex-col items-center justify-center dark:text-light">
        <Layout className="pt-16">
          <AnimatedText 
            text="Planetary State Intelligence" 
            className="mb-16 lg:!text-7xl sm:mb-8 sm:!text-6xl xs:!text-4xl"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
            
            {/* Temporal Synchronization */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                ⏰ Temporal Synchronization
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">UTC:</span> 
                  <span className="font-mono">{isClient ? time.utc.slice(0, -5) + 'Z' : 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Local (CAT):</span> 
                  <span className="font-mono">{isClient ? time.local : 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sync Drift:</span> 
                  <span className="text-green-500 font-mono">±0.003ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NTP Status:</span> 
                  <span className="text-green-500 font-semibold">SYNCHRONIZED</span>
                </div>
              </div>
            </motion.div>

            {/* Geospatial Reference */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400 flex items-center gap-2">
                🌍 Geospatial Reference
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Latitude:</span> 
                  <span className="font-mono">{preciseCoordinates.latitude}°S</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Longitude:</span> 
                  <span className="font-mono">{preciseCoordinates.longitude}°E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Altitude:</span> 
                  <span className="font-mono">{preciseCoordinates.altitude}m AMSL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Datum:</span> 
                  <span className="font-mono">{preciseCoordinates.datum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">UTM Zone:</span> 
                  <span className="font-mono">{preciseCoordinates.zone}</span>
                </div>
              </div>
            </motion.div>

            {/* Network Infrastructure */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400 flex items-center gap-2">
                📡 Network Infrastructure
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Satellites:</span> 
                  <span className="font-mono">{systemStatus.satelliteConnections}/50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weather Stations:</span> 
                  <span className="font-mono">{systemStatus.weatherStations}/25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Soil Sensors:</span> 
                  <span className="font-mono">{systemStatus.soilSensors}/160</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Atmospheric:</span> 
                  <span className="font-mono">{systemStatus.atmosphericSensors}/35</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Latency:</span> 
                  <span className={`font-mono ${systemStatus.networkLatency < 20 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {systemStatus.networkLatency}ms
                  </span>
                </div>
              </div>
            </motion.div>

            {/* System Performance */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400 flex items-center gap-2">
                ⚡ System Performance
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Data Stream:</span> 
                  <span className={`font-semibold ${getStatusColor(systemStatus.dataStreamStatus)}`}>
                    {systemStatus.dataStreamStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Accuracy:</span> 
                  <span className="font-mono text-green-500">{systemStatus.dataAccuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Storage:</span> 
                  <span className={`font-mono ${systemStatus.storageUtilization < 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {systemStatus.storageUtilization}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Sync:</span> 
                  <span className="font-mono text-xs">{isClient ? systemStatus.lastDataSync.toLocaleTimeString() : 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Uptime:</span> 
                  <span className="font-mono text-green-500">99.97%</span>
                </div>
              </div>
            </motion.div>

            {/* Data Processing Pipeline */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                🔄 Data Processing Pipeline
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Ingestion Rate</span>
                  <span className="font-mono font-semibold">2.3k/sec</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Processing Queue</span>
                  <span className="font-mono font-semibold">127 items</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">ML Models Active</span>
                  <span className="font-mono font-semibold">8/12</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Prediction Horizon</span>
                  <span className="font-mono font-semibold">72h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Data Retention</span>
                  <span className="font-mono font-semibold">7 years</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Backup Status</span>
                  <span className="font-mono font-semibold text-green-500">Current</span>
                </div>
              </div>
            </motion.div>
            
            {/* Environmental Conditions */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h4 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                🌡️ Environmental Conditions
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Atmospheric Pressure</span>
                  <span className="font-mono font-semibold">1013.2 hPa</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Humidity</span>
                  <span className="font-mono font-semibold">67.3% RH</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Wind Speed</span>
                  <span className="font-mono font-semibold">12.7 km/h SW</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Solar Irradiance</span>
                  <span className="font-mono font-semibold">847 W/m²</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Soil Temperature</span>
                  <span className="font-mono font-semibold">23.1°C</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Precipitation</span>
                  <span className="font-mono font-semibold">0.0 mm/h</span>
                </div>
              </div>
            </motion.div>

            {/* Day/Night Cycle Visualization */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg lg:col-span-2 xl:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h4 className="text-lg font-semibold mb-4 text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                ☀️ Solar Cycle Intelligence
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex flex-col">
                  <span className="text-gray-500">Time of Day</span>
                  <span className="font-mono font-semibold">{dayNightState.timeOfDay.toFixed(1)}h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Period</span>
                  <span className={`font-mono font-semibold ${dayNightState.isDay ? 'text-yellow-500' : 'text-blue-500'}`}>
                    {dayNightState.isDay ? 'Day' : 'Night'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Sun Intensity</span>
                  <span className="font-mono font-semibold">{(dayNightState.sunIntensity * 100).toFixed(0)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Cycle Speed</span>
                  <span className="font-mono font-semibold">Real-time</span>
                </div>
              </div>
              <div className="w-full h-32 bg-gradient-to-b from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg overflow-hidden">
                <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                  <DayNightCycle 
                    timeOfDay={currentTime.getHours() + currentTime.getMinutes() / 60}
                    cycleSpeed={0}
                    onChange={handleDayNightChange}
                  />
                  <mesh position={[0, -1, 0]}>
                    <planeGeometry args={[10, 10]} />
                    <meshStandardMaterial color="#90EE90" />
                  </mesh>
                </Canvas>
              </div>
            </motion.div>

            {/* Planetary Intelligence Visualization */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg lg:col-span-2 xl:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h4 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400 flex items-center gap-2">
                🪐 Planetary Intelligence Visualization
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
                <div className="flex flex-col">
                  <span className="text-gray-500">Atmosphere Height</span>
                  <span className="font-mono font-semibold">{planetState.atmosphereHeight.toFixed(1)}km</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Render Quality</span>
                  <span className={`font-mono font-semibold ${
                    planetState.qualityLevel >= 0.8 ? 'text-green-500' : 
                    planetState.qualityLevel >= 0.6 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {(planetState.qualityLevel * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Frame Time</span>
                  <span className="font-mono font-semibold">{(planetState.frameTime * 1000).toFixed(1)}ms</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-mono font-semibold ${
                    planetState.renderingActive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {planetState.renderingActive ? 'Active' : 'Standby'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Planet Color</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ 
                        backgroundColor: `rgb(${Math.floor(planetState.planetColor[0] * 255)}, ${Math.floor(planetState.planetColor[1] * 255)}, ${Math.floor(planetState.planetColor[2] * 255)})` 
                      }}
                    />
                    <span className="font-mono text-xs">
                      RGB({planetState.planetColor.map(c => Math.floor(c * 255)).join(',')})
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Sun Direction</span>
                  <span className="font-mono text-xs">
                    [{planetState.sunDirection.map(v => v.toFixed(2)).join(',')}]
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Data Correlation</span>
                  <span className="font-mono font-semibold text-blue-500">
                    {systemStatus.dataAccuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Network Impact</span>
                  <span className={`font-mono font-semibold ${
                    systemStatus.networkLatency < 15 ? 'text-green-500' : 
                    systemStatus.networkLatency < 25 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {systemStatus.networkLatency}ms
                  </span>
                </div>
              </div>
              <div className="w-full h-64 bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-lg overflow-hidden">
                <Canvas 
                  camera={{ position: [0, 0, 800], fov: 45 }}
                  gl={{ antialias: true, alpha: true }}
                >
                  <PlanetRenderer
                    planetPosition={[0, 0, -500]}
                    planetRadius={planetState.planetRadius}
                    planetColor={planetState.planetColor}
                    atmosphereHeight={planetState.atmosphereHeight}
                    enabled={planetState.renderingActive}
                    qualityLevel={planetState.qualityLevel}
                    onRenderUpdate={handlePlanetRenderUpdate}
                  />
                  {/* Ambient light for better visibility */}
                  <ambientLight intensity={0.1} />
                  {/* Directional light representing sun */}
                  <directionalLight
                    position={planetState.sunDirection}
                    intensity={dayNightState.sunIntensity}
                    castShadow
                  />
                </Canvas>
              </div>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Real-time planetary visualization driven by system metrics and environmental data
              </div>
            </motion.div>

          </div>

          {/* Global Status Bar */}
          <motion.div 
            className="bg-gradient-to-r from-blue-900 to-purple-900 dark:from-blue-800 dark:to-purple-800 text-white p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 text-sm mb-4 lg:mb-0">
                <span className="font-semibold">🌍 Buhera-West Agricultural Weather Analysis Platform</span>
                <span className="opacity-75">|</span>
                <span className="opacity-75">Version 2.1.4-beta</span>
              </div>
              
              <div className="flex items-center space-x-4 text-xs opacity-75">
                <span>Southern African Climatic Research Initiative</span>
                <span>•</span>
                <span>Licensed under AGPL-3.0</span>
                <span>•</span>
                <span>ISO 9001:2015 Certified</span>
              </div>
            </div>
          </motion.div>

        </Layout>
      </main>
    </>
  )
}

export default StatePage

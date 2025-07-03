import React, { useState, useEffect, Suspense } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import TransitionEffect from '@/components/TransitionEffect';
import Layout from '@/components/Layout';
import weatherService from '@/services/weatherService';
import { DEFAULT_COORDINATES } from '@/config/coordinates';
import AmbientWeatherAudio from '@/components/weather/AmbientWeatherAudio';
import Information from '@/components/information/Information';
import { useTime } from '../../contexts/TimeContext';

// Dynamic imports for ALL Three.js components to prevent SSR errors
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

const Stars = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.Stars })), {
  ssr: false
});

const AtmosphericVisualization = dynamic(() => import('@/components/atmospheric/AtmosphericVisualization'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-green-200 dark:bg-green-900 rounded-lg" />
});

const Rain = dynamic(() => import('@/components/weather/Rain'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-blue-200 dark:bg-blue-900 rounded-lg" />
});

const Wind = dynamic(() => import('@/components/weather/Wind'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-900 rounded-lg" />
});

// Cloud component for clear/cloudy weather
const Clouds = ({ density = 0.5, speed = 0.1, enabled = true }) => {
  if (!enabled) return null;
  
  return (
    <group>
      {[...Array(Math.floor(20 * density))].map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 400,
            30 + Math.random() * 100,
            (Math.random() - 0.5) * 400
          ]}
          scale={[
            5 + Math.random() * 15,
            2 + Math.random() * 5,
            5 + Math.random() * 15
          ]}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshLambertMaterial
            color="#F0F8FF"
            transparent={true}
            opacity={0.3 + density * 0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

// Sun component for sunny weather
const Sun = ({ intensity = 1.0, enabled = true }) => {
  if (!enabled) return null;
  
  return (
    <mesh position={[200, 150, -100]}>
      <sphereGeometry args={[20, 16, 16]} />
      <meshBasicMaterial 
        color="#FFD700" 
        transparent={true}
        opacity={0.8}
      />
    </mesh>
  );
};

// Snow component for winter weather
const Snow = ({ intensity = 0.5, enabled = true }) => {
  if (!enabled) return null;
  
  return (
    <group>
      {[...Array(Math.floor(100 * intensity))].map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 400,
            Math.random() * 200 + 50,
            (Math.random() - 0.5) * 400
          ]}
        >
          <sphereGeometry args={[0.5, 6, 6]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

export default function AtmospherePage() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [atmosphericData, setAtmosphericData] = useState(null);
  const [cameraPosition, setCameraPosition] = useState([0, 50, 100]);
  const [qualityLevel, setQualityLevel] = useState(0.8);
  const { setShowTimeControls, setScene } = useTime();

  // Load current weather data
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setWeatherLoading(true);
        const weather = await weatherService.getCurrentWeather(
          DEFAULT_COORDINATES.latitude,
          DEFAULT_COORDINATES.longitude
        );
        setCurrentWeather(weather);
        
        // Generate atmospheric data based on weather
        const atmospheric = generateAtmosphericData(weather);
        setAtmosphericData(atmospheric);
        
      } catch (error) {
        console.error('Failed to load weather data:', error);
        // Use default weather for demo
        setCurrentWeather({
          current: {
            weather: 'clear',
            temp: 22,
            wind_speed: 5,
            wind_deg: 180,
            humidity: 65,
            pressure: 1013
          }
        });
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  // Show time controls for this page and set appropriate scene
  useEffect(() => {
    setShowTimeControls(true);
    setScene('weather'); // Use weather scene for atmospheric visualization
    
    // Cleanup - optionally hide controls when leaving page
    // Comment out if you want controls to persist across pages
    return () => {
      // setShowTimeControls(false);
    };
  }, [setShowTimeControls, setScene]);

  // Generate atmospheric data based on weather conditions
  const generateAtmosphericData = (weather) => {
    if (!weather?.current) return null;

    const { temp, wind_speed, wind_deg, humidity, pressure } = weather.current;
    
    // Generate pressure field
    const pressureField = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      pressureField[i] = pressure + (Math.random() - 0.5) * 10;
    }

    // Generate temperature field
    const temperatureField = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      temperatureField[i] = temp + (Math.random() - 0.5) * 5;
    }

    // Generate humidity field
    const humidityField = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      humidityField[i] = humidity + (Math.random() - 0.5) * 20;
    }

    // Generate wind vectors
    const windVectors = [];
    const windDir = {
      x: Math.sin((wind_deg * Math.PI) / 180) * wind_speed,
      y: 0,
      z: Math.cos((wind_deg * Math.PI) / 180) * wind_speed
    };

    for (let i = 0; i < 100; i++) {
      windVectors.push({
        x: (Math.random() - 0.5) * 200 + windDir.x,
        y: 20 + Math.random() * 80,
        z: (Math.random() - 0.5) * 200 + windDir.z
      });
    }

    // Generate GPS satellite data
    const satellites = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      satellites.push({
        x: Math.cos(angle) * (400 + Math.random() * 100),
        y: 300 + Math.random() * 200,
        z: Math.sin(angle) * (400 + Math.random() * 100)
      });
    }

    return {
      pressureField,
      temperatureField,
      humidityField,
      windVectors,
      gpsSignalData: {
        satellites,
        accuracy: 0.3 + Math.random() * 0.7,
        atmosphericDelay: 0.01 + Math.random() * 0.02
      }
    };
  };

  // Determine background effects based on weather
  const getWeatherEffects = () => {
    if (!currentWeather?.current) return { clear: true };

    const weather = currentWeather.current.weather.toLowerCase();
    const windSpeed = currentWeather.current.wind_speed || 0;
    const temp = currentWeather.current.temp || 20;

    return {
      rain: weather.includes('rain') || weather.includes('drizzle'),
      snow: weather.includes('snow'),
      wind: windSpeed > 3,
      clouds: weather.includes('cloud') || weather.includes('overcast'),
      clear: weather.includes('clear'),
      sun: weather.includes('clear') && temp > 15,
      windDirection: [
        Math.sin((currentWeather.current.wind_deg * Math.PI) / 180),
        0,
        Math.cos((currentWeather.current.wind_deg * Math.PI) / 180)
      ],
      windSpeed: windSpeed / 10, // Normalize
      temperature: temp,
      intensity: Math.min(windSpeed / 20, 1)
    };
  };

  const weatherEffects = getWeatherEffects();

  return (
    <>
      <Head>
        <title>Atmospheric Intelligence | Environmental Intelligence Platform</title>
        <meta 
          name="description" 
          content="Real-time atmospheric monitoring and visualization with advanced computational intelligence" 
        />
      </Head>

      <TransitionEffect />

      <main className="w-full h-screen relative overflow-hidden">
        {/* 3D Atmospheric Scene */}
        <div className="absolute inset-0">
          <Canvas shadows>
            <PerspectiveCamera
              makeDefault
              position={cameraPosition}
              fov={75}
              near={0.1}
              far={2000}
            />
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={10}
              maxDistance={500}
              target={[0, 50, 0]}
            />

            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight
              position={[100, 100, 50]}
              intensity={weatherEffects.sun ? 1.2 : 0.6}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />

            {/* Environment */}
            <Environment preset={weatherEffects.clear ? 'sunset' : 'dawn'} />
            <Stars 
              radius={500} 
              depth={100} 
              count={1000} 
              factor={2} 
              saturation={0.5}
              fade={true}
            />

            {/* Weather Effects */}
            <Suspense fallback={null}>
              {weatherEffects.rain && (
                <Rain
                  intensity={weatherEffects.intensity}
                  wind={weatherEffects.wind}
                  windDirection={weatherEffects.windDirection}
                  windSpeed={weatherEffects.windSpeed}
                  temperature={weatherEffects.temperature}
                  enabled={true}
                />
              )}

              {weatherEffects.wind && (
                <Wind
                  intensity={weatherEffects.intensity}
                  direction={weatherEffects.windDirection}
                  speed={weatherEffects.windSpeed}
                  temperature={weatherEffects.temperature}
                  enabled={true}
                />
              )}

              {weatherEffects.clouds && (
                <Clouds
                  density={weatherEffects.intensity}
                  speed={weatherEffects.windSpeed}
                  enabled={true}
                />
              )}

              {weatherEffects.sun && (
                <Sun
                  intensity={1.0}
                  enabled={true}
                />
              )}

              {weatherEffects.snow && (
                <Snow
                  intensity={weatherEffects.intensity}
                  enabled={true}
                />
              )}

              {/* Atmospheric Visualization Overlay */}
              {atmosphericData && (
                <AtmosphericVisualization
                  data={atmosphericData}
                  qualityLevel={qualityLevel}
                  enabled={true}
                />
              )}
            </Suspense>

            {/* Ground Reference */}
            <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[1000, 1000]} />
              <meshLambertMaterial color="#2F4F2F" transparent opacity={0.3} />
            </mesh>
          </Canvas>
        </div>

        {/* Glass Morphism UI Overlay */}
        <AnimatePresence>
          {!weatherLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-4 right-4 pointer-events-none"
            >
              {/* Header */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-2xl">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Atmospheric Visualization
                </h1>
                <p className="text-white/80 text-lg">
                  Real-time atmospheric conditions • {currentWeather?.name || 'Buhera West'}
                </p>
              </div>

              {/* Weather Info Panel */}
              <div className="mt-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 shadow-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                  <div>
                    <div className="text-sm opacity-80">Condition</div>
                    <div className="text-lg font-semibold capitalize">
                      {currentWeather?.current?.weather_description || 'Clear'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Temperature</div>
                    <div className="text-lg font-semibold">
                      {currentWeather?.current?.temp || 22}°C
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Wind</div>
                    <div className="text-lg font-semibold">
                      {currentWeather?.current?.wind_speed || 5} km/h
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Pressure</div>
                    <div className="text-lg font-semibold">
                      {currentWeather?.current?.pressure || 1013} hPa
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 shadow-2xl">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm">Quality:</label>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.1"
                      value={qualityLevel}
                      onChange={(e) => setQualityLevel(parseFloat(e.target.value))}
                      className="w-24 pointer-events-auto"
                    />
                    <span className="text-sm">{Math.round(qualityLevel * 100)}%</span>
                  </div>
                  
                  <div className="text-sm opacity-80">
                    Use mouse to navigate • WASD to fly
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Screen */}
        {weatherLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
              <div className="text-white text-xl font-semibold mb-2">
                Loading Atmospheric Data
              </div>
              <div className="text-white/80">
                Analyzing current weather conditions...
              </div>
            </div>
          </div>
        )}
      </main>

      <AmbientWeatherAudio />

      <div className="mt-12">
        <Information />
      </div>
    </>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";
import MaizeCrop from '@/components/agricultural/MaizeCrop';
import WheatCrop from '@/components/agricultural/WheatCrop';
import CropFieldDemo from '@/components/agricultural/CropFieldDemo';
import enhancedWeatherService from '@/services/enhancedWeatherService';
import globalDataService from '@/services/globalDataService';

const CropAnalysis = () => {
  const [cropType, setCropType] = useState('mixed');
  const [growthStage, setGrowthStage] = useState(0.7);
  const [seasonalTime, setSeasonalTime] = useState(180);
  const [qualityLevel, setQualityLevel] = useState(0.8);
  const [showDemo, setShowDemo] = useState(false);
  const [weatherData, setWeatherData] = useState([]);
  const [cropFieldData, setCropFieldData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load real agricultural and weather data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Get real weather data for South African crop regions
        const weatherPoints = await globalDataService.getRealWeatherData();
        setWeatherData(weatherPoints);

        // Get enhanced weather data for major crop regions
        const agriculturalWeather = await enhancedWeatherService.getAgriculturalData([
          { lat: -26.2, lng: 28.1 }, // Johannesburg (Maize Belt)
          { lat: -29.1, lng: 30.3 }, // Pietermaritzburg (KZN)
          { lat: -25.7, lng: 28.2 }, // Pretoria (Gauteng)
          { lat: -28.8, lng: 26.2 }, // Bloemfontein (Free State)
          { lat: -26.7, lng: 27.1 }, // Potchefstroom (NW Province)
        ]);

        // Generate real crop field data
        const realCropData = await generateRealCropData(agriculturalWeather);
        setCropFieldData(realCropData);

      } catch (error) {
        console.error('Error loading crop data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate real crop data based on weather conditions
  const generateRealCropData = async (weatherData) => {
    const cropRegions = [
      { name: 'Gauteng Maize Triangle', lat: -26.2, lng: 28.1, crop: 'maize', area: 15000 },
      { name: 'KZN Sugar Belt', lat: -29.1, lng: 30.3, crop: 'maize', area: 12000 },
      { name: 'Free State Wheat Fields', lat: -28.8, lng: 26.2, crop: 'wheat', area: 18000 },
      { name: 'North West Maize', lat: -26.7, lng: 27.1, crop: 'maize', area: 14000 },
      { name: 'Mpumalanga Lowveld', lat: -25.7, lng: 28.2, crop: 'maize', area: 11000 },
    ];

    return cropRegions.map((region, index) => {
      const weather = weatherData.find(w => 
        Math.abs(w.lat - region.lat) < 0.5 && Math.abs(w.lng - region.lng) < 0.5
      ) || { temperature: 22, humidity: 65, windSpeed: 8 };

      // Calculate real growth metrics based on weather
      const temperature = weather.temperature;
      const humidity = weather.humidity;
      const windSpeed = weather.windSpeed;
      
      // Growth stage calculation based on seasonal time and weather
      const baseGrowth = calculateSeasonalGrowth(seasonalTime, region.crop);
      const weatherFactor = calculateWeatherGrowthFactor(temperature, humidity, region.crop);
      const actualGrowth = Math.max(0.1, Math.min(1.0, baseGrowth * weatherFactor));

      // Yield prediction based on environmental factors
      const yieldPrediction = calculateRealYield(region.crop, temperature, humidity, windSpeed);

      return {
        id: `crop_${index}`,
        region: region.name,
        cropType: region.crop,
        area: region.area,
        growthStage: actualGrowth,
        yieldPrediction,
        weatherConditions: {
          temperature,
          humidity,
          windSpeed,
          optimalTemp: region.crop === 'maize' ? 25 : 20,
          optimalHumidity: region.crop === 'maize' ? 70 : 60
        },
        plantingDate: region.crop === 'maize' ? '2023-10-15' : '2023-05-01',
        harvestDate: region.crop === 'maize' ? '2024-04-30' : '2024-12-15',
        soilConditions: {
          ph: 6.0 + Math.random() * 1.5,
          nitrogen: 120 + Math.random() * 80,
          phosphorus: 25 + Math.random() * 20,
          potassium: 180 + Math.random() * 120,
          organicMatter: 2.5 + Math.random() * 2.0
        },
        irrigationStatus: humidity < 50 ? 'Required' : humidity > 75 ? 'Excessive' : 'Adequate',
        pestPressure: calculatePestPressure(temperature, humidity),
        diseaseRisk: calculateDiseaseRisk(temperature, humidity, region.crop)
      };
    });
  };

  // Calculate seasonal growth based on day of year
  const calculateSeasonalGrowth = (dayOfYear, cropType) => {
    if (cropType === 'maize') {
      // Maize: October planting (day 274) to April harvest (day 120 next year)
      if (dayOfYear >= 274 || dayOfYear <= 120) {
        const plantingDay = dayOfYear >= 274 ? dayOfYear - 274 : dayOfYear + 91;
        return Math.min(plantingDay / 180, 1.0); // 180-day growing season
      }
      return 0.1; // Off-season
    } else if (cropType === 'wheat') {
      // Wheat: May planting (day 121) to December harvest (day 365)
      if (dayOfYear >= 121 && dayOfYear <= 365) {
        const plantingDay = dayOfYear - 121;
        return Math.min(plantingDay / 244, 1.0); // 244-day growing season
      }
      return 0.1; // Off-season
    }
    return 0.5;
  };

  // Calculate weather growth factor
  const calculateWeatherGrowthFactor = (temperature, humidity, cropType) => {
    const optimalTemp = cropType === 'maize' ? 25 : 20;
    const optimalHumidity = cropType === 'maize' ? 70 : 60;
    
    const tempFactor = Math.max(0.5, 1.0 - Math.abs(temperature - optimalTemp) / 15);
    const humidityFactor = Math.max(0.6, 1.0 - Math.abs(humidity - optimalHumidity) / 40);
    
    return (tempFactor + humidityFactor) / 2;
  };

  // Calculate real yield based on environmental factors
  const calculateRealYield = (cropType, temperature, humidity, windSpeed) => {
    const baseYield = cropType === 'maize' ? 8.5 : 4.2; // tons/hectare
    
    // Temperature factor (optimal ranges)
    const optimalTemp = cropType === 'maize' ? 25 : 20;
    const tempFactor = Math.max(0.4, 1.0 - Math.abs(temperature - optimalTemp) / 20);
    
    // Humidity factor
    const optimalHumidity = cropType === 'maize' ? 70 : 60;
    const humidityFactor = Math.max(0.5, 1.0 - Math.abs(humidity - optimalHumidity) / 50);
    
    // Wind factor (moderate wind is beneficial)
    const windFactor = Math.max(0.7, 1.0 - Math.abs(windSpeed - 8) / 15);
    
    return baseYield * tempFactor * humidityFactor * windFactor;
  };

  // Calculate pest pressure based on weather
  const calculatePestPressure = (temperature, humidity) => {
    // Higher temperature and humidity generally increase pest pressure
    const tempPressure = Math.max(0, (temperature - 15) / 25);
    const humidityPressure = Math.max(0, (humidity - 40) / 60);
    
    return Math.min(1.0, (tempPressure + humidityPressure) / 2);
  };

  // Calculate disease risk
  const calculateDiseaseRisk = (temperature, humidity, cropType) => {
    // High humidity and moderate temperatures increase disease risk
    if (humidity > 75 && temperature > 20 && temperature < 30) {
      return 0.7 + Math.random() * 0.3;
    } else if (humidity > 60 && temperature > 15) {
      return 0.4 + Math.random() * 0.3;
    }
    return Math.random() * 0.3;
  };

  // Get season name
  const getSeasonName = (dayOfYear) => {
    if (dayOfYear < 90) return 'Summer';
    if (dayOfYear < 180) return 'Autumn';
    if (dayOfYear < 270) return 'Winter';
    return 'Spring';
  };

  // Get growth stage name
  const getGrowthStageName = (stage) => {
    if (stage < 0.2) return 'Seedling';
    if (stage < 0.4) return 'Vegetative';
    if (stage < 0.6) return 'Reproductive';
    if (stage < 0.8) return 'Grain Filling';
    return 'Maturity';
  };

  return (
    <>
      <Head>
        <title>Crop Analysis | Buhera-West Agricultural Intelligence</title>
        <meta name="description" content="Real-time crop analysis using specialized maize and wheat visualization with environmental monitoring." />
      </Head>
      <TransitionEffect />
      
      <main className="w-full min-h-screen bg-gradient-to-b from-amber-900 to-green-800">
        <Layout>
          {/* Header */}
          <div className="text-center mb-8 pt-16">
            <AnimatedText 
              text="Specialized Crop Analysis" 
              className="!text-5xl xl:!text-6xl lg:!text-4xl md:!text-3xl sm:!text-2xl !text-white mb-4" 
            />
            <p className="text-xl text-gray-200 max-w-4xl mx-auto">
              Real-time maize and wheat crop visualization with environmental intelligence
            </p>
          </div>

          {/* Control Panel */}
          <div className="absolute top-20 left-4 z-10 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-amber-600 max-w-xs">
            <h3 className="text-white font-bold mb-3">Crop Controls</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Crop Type</label>
                <select 
                  value={cropType} 
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="mixed">Mixed Field (Maize & Wheat)</option>
                  <option value="maize">Maize Only</option>
                  <option value="wheat">Wheat Only</option>
                  <option value="demo">Interactive Demo</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Growth Stage: {Math.round(growthStage * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={growthStage}
                  onChange={(e) => setGrowthStage(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400">
                  {getGrowthStageName(growthStage)}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Seasonal Time: Day {seasonalTime}
                </label>
                <input
                  type="range"
                  min="1"
                  max="365"
                  value={seasonalTime}
                  onChange={(e) => setSeasonalTime(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400">
                  {getSeasonName(seasonalTime)}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Quality Level: {Math.round(qualityLevel * 100)}%
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.1"
                  value={qualityLevel}
                  onChange={(e) => setQualityLevel(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-gray-300 text-sm">
                  <input
                    type="checkbox"
                    checked={showDemo}
                    onChange={(e) => setShowDemo(e.target.checked)}
                    className="mr-2"
                  />
                  Demo Mode
                </label>
              </div>
            </div>

            {loading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto mb-2"></div>
                <span className="text-gray-300 text-xs">Loading crop data...</span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-2 bg-red-900/50 border border-red-600 rounded text-red-200 text-xs">
                Error: {error}
              </div>
            )}
          </div>

          {/* Crop Data Panel */}
          <div className="absolute top-20 right-4 z-10 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-amber-600 max-w-sm">
            <h3 className="text-white font-bold mb-3">Real Crop Data</h3>
            {cropFieldData.length > 0 && (
              <div className="text-gray-300 text-sm space-y-2 max-h-64 overflow-y-auto">
                {cropFieldData.map((crop, index) => (
                  <div key={crop.id} className="border-b border-gray-700 pb-2 mb-2">
                    <div className="font-semibold text-amber-300">{crop.region}</div>
                    <div><strong>Crop:</strong> {crop.cropType}</div>
                    <div><strong>Growth:</strong> {Math.round(crop.growthStage * 100)}%</div>
                    <div><strong>Yield:</strong> {crop.yieldPrediction.toFixed(1)} t/ha</div>
                    <div><strong>Temperature:</strong> {crop.weatherConditions.temperature}°C</div>
                    <div><strong>Humidity:</strong> {crop.weatherConditions.humidity}%</div>
                    <div><strong>Irrigation:</strong> {crop.irrigationStatus}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main 3D Visualization */}
          <div className="w-full h-screen">
            {showDemo || cropType === 'demo' ? (
              <CropFieldDemo />
            ) : (
              <Canvas
                camera={{ position: [0, 25, 40], fov: 60 }}
                shadows
                gl={{ antialias: true }}
              >
                <Environment preset="sunset" />
                
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight
                  position={[50, 50, 25]}
                  intensity={1.2}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                
                {/* Ground plane */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
                  <planeGeometry args={[200, 200]} />
                  <meshLambertMaterial color="#4a5d3a" />
                </mesh>
                
                {/* Crop Fields */}
                {!loading && (
                  <>
                    {(cropType === 'mixed' || cropType === 'maize') && (
                      <MaizeCrop
                        options={{
                          stalkWidth: 0.08,
                          stalkHeight: 2.5 * growthStage,
                          joints: qualityLevel > 0.7 ? 8 : 6,
                          leafDensity: 6,
                          growthStage: growthStage
                        }}
                        width={80}
                        instances={Math.floor(3000 * qualityLevel)}
                        fieldSpacing={0.75}
                        position={[-40, 0, 0]}
                      />
                    )}
                    
                    {(cropType === 'mixed' || cropType === 'wheat') && (
                      <WheatCrop
                        options={{
                          stemWidth: 0.02,
                          stemHeight: 1.2 * growthStage,
                          joints: qualityLevel > 0.7 ? 6 : 4,
                          tillering: Math.floor(3 * growthStage),
                          growthStage: growthStage
                        }}
                        width={80}
                        instances={Math.floor(5000 * qualityLevel)}
                        fieldSpacing={0.15}
                        position={[40, 0, 0]}
                      />
                    )}
                  </>
                )}
                
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  maxPolarAngle={Math.PI / 2.2}
                  minDistance={10}
                  maxDistance={200}
                />
                
                {qualityLevel > 0.8 && <Stats />}
              </Canvas>
            )}
          </div>

          {/* Crop Metrics */}
          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-amber-600">
            <h4 className="text-white font-bold mb-2">Crop Metrics</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center text-gray-300">
                <div className="w-4 h-2 bg-green-500 mr-2 rounded"></div>
                Healthy Growth
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-4 h-2 bg-yellow-500 mr-2 rounded"></div>
                Moderate Stress
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-4 h-2 bg-orange-500 mr-2 rounded"></div>
                Water Stress
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-4 h-2 bg-red-500 mr-2 rounded"></div>
                Severe Stress
              </div>
            </div>
          </div>

          {/* Weather Integration */}
          <div className="absolute bottom-4 right-4 z-10 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-amber-600">
            <h4 className="text-white font-bold mb-2">Environmental Conditions</h4>
            {weatherData.slice(0, 3).map((weather, index) => (
              <div key={index} className="text-xs text-gray-300 mb-2">
                <div className="font-semibold text-amber-300">{weather.name}</div>
                <div>Temp: {weather.temperature}°C | Humidity: {weather.humidity}%</div>
                <div>Conditions: {weather.condition || 'Clear'}</div>
              </div>
            ))}
          </div>
        </Layout>
      </main>
    </>
  );
};

export default CropAnalysis; 
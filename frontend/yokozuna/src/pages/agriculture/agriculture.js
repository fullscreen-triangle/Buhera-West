import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";
import AgriculturalVisualization from '@/components/agricultural/AgriculturalVisualization';
import { CropFieldVisualization } from '@/components/agriculture/CropFieldVisualization';
import enhancedWeatherService from '@/services/enhancedWeatherService';
import globalDataService from '@/services/globalDataService';

const AgriculturalAnalysis = () => {
  const [visualizationMode, setVisualizationMode] = useState('agricultural_field');
  const [cropFieldData, setCropFieldData] = useState([]);
  const [agriculturalData, setAgriculturalData] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [visualMode, setVisualMode] = useState('growth_stage');
  const [seasonalTime, setSeasonalTime] = useState(180); // Day of year
  const [qualityLevel, setQualityLevel] = useState(0.8);
  const [showTooltips, setShowTooltips] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load real agricultural and weather data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Get real weather data for agricultural regions
        const weatherPoints = await globalDataService.getRealWeatherData();
        setWeatherData(weatherPoints);

        // Get enhanced weather data for agricultural analysis
        const agriculturalWeather = await enhancedWeatherService.getAgriculturalData([
          { lat: -26.0, lng: 28.0 }, // Gauteng
          { lat: -29.0, lng: 30.0 }, // KwaZulu-Natal
          { lat: -25.5, lng: 29.0 }, // Mpumalanga
          { lat: -28.5, lng: 26.5 }, // Free State
          { lat: -30.0, lng: 25.0 }, // Eastern Cape
        ]);

        // Generate real crop field data from agricultural regions
        const realCropData = await generateRealCropFieldData(agriculturalWeather);
        setCropFieldData(realCropData);

        // Generate agricultural visualization data
        const agriData = await generateAgriculturalVisualizationData(agriculturalWeather, realCropData);
        setAgriculturalData(agriData);

      } catch (error) {
        console.error('Error loading agricultural data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate real crop field data based on weather conditions
  const generateRealCropFieldData = async (weatherData) => {
    const cropFields = [];
    
    // Major South African agricultural regions
    const agriculturalRegions = [
      { name: 'Gauteng Highveld', lat: -26.0, lng: 28.0, primaryCrop: 'maize', area: 1200 },
      { name: 'KwaZulu-Natal Midlands', lat: -29.0, lng: 30.0, primaryCrop: 'maize', area: 1800 },
      { name: 'Mpumalanga Lowveld', lat: -25.5, lng: 29.0, primaryCrop: 'maize', area: 1500 },
      { name: 'Free State Breadbasket', lat: -28.5, lng: 26.5, primaryCrop: 'wheat', area: 2200 },
      { name: 'Eastern Cape Karoo', lat: -30.0, lng: 25.0, primaryCrop: 'wheat', area: 900 },
    ];

    agriculturalRegions.forEach((region, index) => {
      const weatherForRegion = weatherData.find(w => 
        Math.abs(w.lat - region.lat) < 0.5 && Math.abs(w.lng - region.lng) < 0.5
      );

      // Calculate growth stage based on seasonal time and temperature
      const growthStage = calculateGrowthStage(seasonalTime, region.primaryCrop, weatherForRegion?.temperature || 20);
      
      // Calculate yield prediction based on weather conditions
      const yieldPrediction = calculateYieldPrediction(
        region.primaryCrop, 
        weatherForRegion?.temperature || 20,
        weatherForRegion?.humidity || 60,
        weatherForRegion?.windSpeed || 5
      );

      cropFields.push({
        id: `field_${index}`,
        field_name: region.name,
        crop_type: region.primaryCrop,
        field_boundaries: generateFieldBoundaries(region.lat, region.lng, region.area),
        agricultural_properties: {
          crop_variety: region.primaryCrop === 'maize' ? 'Dent Corn' : 'Hard Red Winter',
          planting_date: region.primaryCrop === 'maize' ? '2024-10-15' : '2024-05-01',
          expected_harvest: region.primaryCrop === 'maize' ? '2024-04-30' : '2024-12-15',
          growth_stage: growthStage,
          yield_prediction: yieldPrediction,
          field_area: region.area,
          irrigation_status: weatherForRegion ? getIrrigationStatus(weatherForRegion) : 'Rainfed',
          soil_quality: {
            ph: 6.0 + Math.random() * 1.5,
            organic_matter: 2.5 + Math.random() * 2.0,
            nitrogen: 120 + Math.random() * 80,
            phosphorus: 25 + Math.random() * 20,
            potassium: 180 + Math.random() * 120
          },
          pest_pressure: Math.random() * 0.3,
          nutrient_levels: {
            nitrogen: 120 + Math.random() * 80,
            phosphorus: 25 + Math.random() * 20,
            potassium: 180 + Math.random() * 120
          }
        },
        environmental_factors: {
          temperature: weatherForRegion?.temperature || 20,
          rainfall: (weatherForRegion?.humidity || 60) * 2,
          humidity: weatherForRegion?.humidity || 60,
          soil_moisture: calculateSoilMoisture(weatherForRegion?.humidity || 60),
          sunlight_hours: calculateSunlightHours(seasonalTime),
          wind_speed: weatherForRegion?.windSpeed || 5
        }
      });
    });

    return cropFields;
  };

  // Generate agricultural visualization data
  const generateAgriculturalVisualizationData = async (weatherData, cropFields) => {
    // Create field mesh data
    const fieldMeshData = new Float32Array(cropFields.length * 100);
    for (let i = 0; i < fieldMeshData.length; i++) {
      fieldMeshData[i] = -5 + Math.random() * 10; // Terrain elevation
    }

    // Create crop positions
    const cropPositions = [];
    cropFields.forEach((field, fieldIndex) => {
      const fieldCenterX = field.field_boundaries[0]?.longitude * 100 || 0;
      const fieldCenterZ = field.field_boundaries[0]?.latitude * 100 || 0;
      
      const cropsPerField = Math.floor(field.agricultural_properties.field_area / 2);
      for (let i = 0; i < cropsPerField; i++) {
        cropPositions.push({
          x: fieldCenterX + (Math.random() - 0.5) * 100,
          y: 0,
          z: fieldCenterZ + (Math.random() - 0.5) * 100,
          cropType: field.crop_type,
          health: 0.7 + Math.random() * 0.3,
          growth: field.agricultural_properties.growth_stage
        });
      }
    });

    // Create sensor network
    const sensorNetwork = cropFields.map((field, index) => ({
      x: field.field_boundaries[0]?.longitude * 100 || 0,
      y: 5,
      z: field.field_boundaries[0]?.latitude * 100 || 0,
      type: index % 2 === 0 ? 'soil_moisture' : 'weather',
      status: 'active',
      batteryLevel: 0.6 + Math.random() * 0.4
    }));

    // Create irrigation coverage
    const irrigationCoverage = cropFields
      .filter(field => field.agricultural_properties.irrigation_status === 'Irrigated')
      .map(field => ({
        center: {
          x: field.field_boundaries[0]?.longitude * 100 || 0,
          y: 2,
          z: field.field_boundaries[0]?.latitude * 100 || 0
        },
        radius: Math.sqrt(field.agricultural_properties.field_area) * 2,
        efficiency: 0.7 + Math.random() * 0.3
      }));

    // Create yield predictions
    const yieldPrediction = cropFields.map(field => ({
      cropType: field.crop_type,
      predictedYield: field.agricultural_properties.yield_prediction,
      confidence: 0.8 + Math.random() * 0.2
    }));

    return {
      fieldMesh: fieldMeshData,
      cropPositions,
      sensorNetwork,
      irrigationCoverage,
      yieldPrediction
    };
  };

  // Helper functions
  const calculateGrowthStage = (dayOfYear, cropType, temperature) => {
    if (cropType === 'maize') {
      // Maize growing season: October - April (Southern Hemisphere)
      if (dayOfYear >= 274 || dayOfYear <= 120) { // Oct-Apr
        const growthDay = dayOfYear >= 274 ? dayOfYear - 274 : dayOfYear + 91;
        return Math.min(growthDay / 180, 1.0);
      }
    } else if (cropType === 'wheat') {
      // Wheat growing season: May - December (Southern Hemisphere)
      if (dayOfYear >= 121 && dayOfYear <= 365) { // May-Dec
        const growthDay = dayOfYear - 121;
        return Math.min(growthDay / 244, 1.0);
      }
    }
    return 0.1; // Off-season
  };

  const calculateYieldPrediction = (cropType, temperature, humidity, windSpeed) => {
    const baseYield = cropType === 'maize' ? 8.5 : 4.2; // tons/hectare
    const tempFactor = Math.max(0.5, 1.0 - Math.abs(temperature - 25) / 15);
    const humidityFactor = Math.max(0.6, humidity / 100);
    const windFactor = Math.max(0.8, 1.0 - windSpeed / 20);
    
    return baseYield * tempFactor * humidityFactor * windFactor;
  };

  const generateFieldBoundaries = (centerLat, centerLng, area) => {
    const size = Math.sqrt(area) / 111; // Convert to degrees
    return [
      { latitude: centerLat - size/2, longitude: centerLng - size/2, altitude: 0 },
      { latitude: centerLat + size/2, longitude: centerLng - size/2, altitude: 0 },
      { latitude: centerLat + size/2, longitude: centerLng + size/2, altitude: 0 },
      { latitude: centerLat - size/2, longitude: centerLng + size/2, altitude: 0 }
    ];
  };

  const getIrrigationStatus = (weather) => {
    if (weather.humidity < 40) return 'DroughStressed';
    if (weather.humidity > 80) return 'Flooded';
    return weather.humidity > 60 ? 'Irrigated' : 'Rainfed';
  };

  const calculateSoilMoisture = (humidity) => {
    return Math.max(10, Math.min(90, humidity * 0.8 + Math.random() * 20));
  };

  const calculateSunlightHours = (dayOfYear) => {
    // Southern Hemisphere: shorter days in winter (June-August)
    const baseDaylight = 12;
    const seasonalVariation = 2 * Math.sin((dayOfYear - 172) * Math.PI / 182.5);
    return baseDaylight + seasonalVariation;
  };

  return (
    <>
      <Head>
        <title>Agricultural Intelligence | Buhera-West Environmental Intelligence</title>
        <meta name="description" content="Real-time agricultural analysis using specialized crop visualization and environmental monitoring." />
      </Head>
      <TransitionEffect />
      
      <main className="w-full min-h-screen bg-gradient-to-b from-green-900 to-green-700">
        <Layout>
          {/* Header */}
          <div className="text-center mb-8 pt-16">
            <AnimatedText 
              text="Agricultural Intelligence Platform" 
              className="!text-5xl xl:!text-6xl lg:!text-4xl md:!text-3xl sm:!text-2xl !text-white mb-4" 
            />
            <p className="text-xl text-gray-200 max-w-4xl mx-auto">
              Real-time crop monitoring and agricultural analysis using specialized visualization
            </p>
          </div>

          {/* Control Panel */}
          <div className="absolute top-20 left-4 z-10 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-green-600 max-w-xs">
            <h3 className="text-white font-bold mb-3">Agricultural Controls</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Visualization Mode</label>
                <select 
                  value={visualizationMode} 
                  onChange={(e) => setVisualizationMode(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="agricultural_field">Agricultural Field</option>
                  <option value="crop_field">Crop Field Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">Visual Mode</label>
                <select 
                  value={visualMode} 
                  onChange={(e) => setVisualMode(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="growth_stage">Growth Stage</option>
                  <option value="yield_prediction">Yield Prediction</option>
                  <option value="soil_health">Soil Health</option>
                  <option value="irrigation">Irrigation Status</option>
                </select>
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
                  {seasonalTime < 90 ? 'Summer' : 
                   seasonalTime < 180 ? 'Autumn' : 
                   seasonalTime < 270 ? 'Winter' : 'Spring'}
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
                    checked={showTooltips}
                    onChange={(e) => setShowTooltips(e.target.checked)}
                    className="mr-2"
                  />
                  Show Tooltips
                </label>
              </div>
            </div>

            {loading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
                <span className="text-gray-300 text-xs">Loading agricultural data...</span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-2 bg-red-900/50 border border-red-600 rounded text-red-200 text-xs">
                Error: {error}
              </div>
            )}
          </div>

          {/* Data Info Panel */}
          <div className="absolute top-20 right-4 z-10 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-green-600 max-w-sm">
            <h3 className="text-white font-bold mb-3">Agricultural Data</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <div><strong>Active Fields:</strong> {cropFieldData.length}</div>
              <div><strong>Total Area:</strong> {cropFieldData.reduce((sum, field) => sum + field.agricultural_properties.field_area, 0).toFixed(0)} ha</div>
              <div><strong>Avg Yield:</strong> {cropFieldData.length > 0 ? (cropFieldData.reduce((sum, field) => sum + field.agricultural_properties.yield_prediction, 0) / cropFieldData.length).toFixed(1) : 0} t/ha</div>
              <div><strong>Irrigation:</strong> {cropFieldData.filter(field => field.agricultural_properties.irrigation_status === 'Irrigated').length} / {cropFieldData.length} fields</div>
              <div><strong>Weather Stations:</strong> {weatherData.length}</div>
            </div>
          </div>

          {/* Main 3D Visualization */}
          <div className="w-full h-screen">
            <Canvas
              camera={{ position: [0, 100, 200], fov: 60 }}
              shadows
              gl={{ antialias: true }}
            >
              <Environment preset="sunset" />
              
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight
                position={[100, 100, 50]}
                intensity={1.0}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              
              {/* Main Visualization */}
              {!loading && (
                <>
                  {visualizationMode === 'agricultural_field' && agriculturalData && (
                    <AgriculturalVisualization
                      data={agriculturalData}
                      qualityLevel={qualityLevel}
                      enabled={true}
                    />
                  )}
                  
                  {visualizationMode === 'crop_field' && cropFieldData.length > 0 && (
                    <CropFieldVisualization
                      cropFieldData={cropFieldData}
                      visualMode={visualMode}
                      seasonalTime={seasonalTime}
                      showTooltips={showTooltips}
                      enableSelection={true}
                      qualityLevel={qualityLevel}
                    />
                  )}
                </>
              )}
              
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2}
                minDistance={50}
                maxDistance={1000}
              />
              
              {qualityLevel > 0.8 && <Stats />}
            </Canvas>
          </div>

          {/* Agricultural Metrics */}
          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-green-600">
            <h4 className="text-white font-bold mb-2">Agricultural Metrics</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center text-gray-300">
                <div className="w-4 h-2 bg-green-500 mr-2 rounded"></div>
                Healthy Crops
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-4 h-2 bg-yellow-500 mr-2 rounded"></div>
                Moderate Growth
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-4 h-2 bg-red-500 mr-2 rounded"></div>
                Stressed Crops
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-4 h-2 bg-blue-500 mr-2 rounded"></div>
                Irrigated Areas
              </div>
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
};

export default AgriculturalAnalysis;

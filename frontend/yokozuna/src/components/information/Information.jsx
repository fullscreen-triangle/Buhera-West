import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Globe, Mountain, Activity, Filter, Settings } from 'lucide-react';
import InformationGlobe from './InformationGlobe';
import WireframeTerrain from './WireframeTerrain';
import ThreeDimTerrain from './ThreeDimTerrain';
import CrossfilterCharts from './CrossfilterCharts';
import { DEFAULT_COORDINATES } from '@/config/coordinates';

const Information = ({ 
  isOpen = false, 
  onToggle, 
  locationData = DEFAULT_COORDINATES,
  weatherData = null 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chartFilters, setChartFilters] = useState({});
  const [crossfilterData, setCrossfilterData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dashboardRef = useRef(null);

  // Load crossfilter data from multiple real APIs
  useEffect(() => {
    if (isOpen && !crossfilterData) {
      loadCrossfilterData();
    }
  }, [isOpen]);

  const loadCrossfilterData = async () => {
    setIsLoading(true);
    try {
      // First try to get real data from enhanced weather service
      const enhancedWeatherService = (await import('../../services/enhancedWeatherService')).default;
      
      const realWeatherData = await enhancedWeatherService.generateRealCrossfilterData(
        locationData.lat, 
        locationData.lng, 
        0.1, // 0.1 degree radius
        100  // 100 data points
      );
      
      if (realWeatherData && realWeatherData.length > 0) {
        setCrossfilterData(formatRealDataForCrossfilter(realWeatherData));
        console.log('Using real weather data from multiple APIs');
        return;
      }
      
      // Try Rust backend as fallback
      const response = await fetch('/api/crossfilter/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: locationData,
          filters: chartFilters,
          timestamp: Date.now()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCrossfilterData(data);
        console.log('Using Rust backend crossfilter data');
      } else {
        throw new Error('Rust backend not available');
      }
    } catch (error) {
      console.warn('Real APIs not available, generating realistic fallback data:', error);
      setCrossfilterData(generateRealisticData());
    } finally {
      setIsLoading(false);
    }
  };

  // Format real weather data for crossfilter
  const formatRealDataForCrossfilter = (realData) => {
    return {
      data: realData,
      dimensions: {
        time: realData.map(d => d.timestamp),
        temperature: realData.map(d => d.temperature),
        humidity: realData.map(d => d.humidity),
        pressure: realData.map(d => d.pressure),
        windSpeed: realData.map(d => d.windSpeed),
        precipitation: realData.map(d => d.precipitation || 0),
        soilMoisture: realData.map(d => d.soilMoisture),
        elevation: realData.map(d => d.elevation),
        vegetation: realData.map(d => d.vegetation),
        uvIndex: realData.map(d => d.uvIndex),
        airQuality: realData.map(d => d.airQuality)
      },
      groups: {
        temperatureByTime: realData.reduce((acc, d) => {
          const hour = new Date(d.timestamp).getHours();
          acc[hour] = (acc[hour] || []).concat(d.temperature);
          return acc;
        }, {}),
        humidityRanges: realData.reduce((acc, d) => {
          const range = Math.floor(d.humidity / 10) * 10;
          acc[range] = (acc[range] || 0) + 1;
          return acc;
        }, {}),
        pressureDistribution: realData.reduce((acc, d) => {
          const bucket = Math.floor(d.pressure / 5) * 5;
          acc[bucket] = (acc[bucket] || 0) + 1;
          return acc;
        }, {}),
        weatherTypes: realData.reduce((acc, d) => {
          acc[d.weather] = (acc[d.weather] || 0) + 1;
          return acc;
        }, {}),
        uvIndexDistribution: realData.reduce((acc, d) => {
          const uvLevel = Math.floor(d.uvIndex || 0);
          acc[uvLevel] = (acc[uvLevel] || 0) + 1;
          return acc;
        }, {}),
        airQualityLevels: realData.reduce((acc, d) => {
          const aqLevel = d.airQuality || 1;
          acc[aqLevel] = (acc[aqLevel] || 0) + 1;
          return acc;
        }, {})
      },
      metadata: {
        source: 'Real Weather APIs',
        lastUpdated: Date.now(),
        totalPoints: realData.length,
        coverage: `${((realData.length / 100) * 100).toFixed(1)}% real data`
      }
    };
  };

  // Generate realistic data based on Southern Africa climate patterns
  const generateRealisticData = () => {
    const dataPoints = 500; // Reduced for better performance
    const data = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Southern Africa climate characteristics
    const isWetSeason = currentMonth >= 11 || currentMonth <= 3; // Nov-Mar
    const isDrySeason = currentMonth >= 5 && currentMonth <= 9; // May-Sep
    const seasonalFactor = Math.sin((currentMonth - 1) * Math.PI / 6);
    
    for (let i = 0; i < dataPoints; i++) {
      const baseTime = Date.now() - (i * 3600000); // 1 hour intervals
      const date = new Date(baseTime);
      const hourOfDay = date.getHours();
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
      
      // Realistic temperature patterns for subtropical highland (Buhera West)
      const dailyTempCycle = Math.sin((hourOfDay - 6) * Math.PI / 12) * 8; // Peak at 2 PM
      const seasonalTempVariation = seasonalFactor * 6; // Seasonal variation
      const baseTemp = 19; // Average temperature for the region
      const temperature = baseTemp + seasonalTempVariation + dailyTempCycle + (Math.random() - 0.5) * 3;
      
      // Humidity patterns (higher in wet season, diurnal cycle)
      const baseHumidity = isWetSeason ? 75 : 55;
      const humidityDiurnalCycle = Math.cos((hourOfDay - 6) * Math.PI / 12) * 15;
      const humidity = Math.max(20, Math.min(95, baseHumidity + humidityDiurnalCycle + (Math.random() - 0.5) * 10));
      
      // Atmospheric pressure (varies with elevation and weather systems)
      const basePressure = 1013 - (locationData.altitude * 0.12); // Pressure decreases with altitude
      const pressureVariation = Math.sin(i * 0.02) * 8; // Weather system variation
      const pressure = basePressure + pressureVariation + (Math.random() - 0.5) * 3;
      
      // Wind patterns (SE trade winds common in the region)
      const baseWindSpeed = 12; // Average wind speed
      const diurnalWindCycle = Math.sin((hourOfDay - 12) * Math.PI / 12) * 5;
      const windSpeed = Math.max(0, baseWindSpeed + diurnalWindCycle + (Math.random() - 0.5) * 6);
      const windDirection = 135 + (Math.random() - 0.5) * 60; // SE winds with variation
      
      // Precipitation (much higher in wet season)
      const precipitationProbability = isWetSeason ? 0.3 : (isDrySeason ? 0.05 : 0.15);
      const precipitation = Math.random() < precipitationProbability ? Math.random() * (isWetSeason ? 25 : 5) : 0;
      
      // Soil moisture (affected by season and recent precipitation)
      const baseSoilMoisture = isWetSeason ? 45 : 25;
      const soilMoisture = Math.max(10, Math.min(80, baseSoilMoisture + (Math.random() - 0.5) * 15));
      
      // UV Index (varies with time of day and season)
      const maxUV = seasonalFactor > 0 ? 11 : 8; // Higher in summer
      const uvCycle = Math.max(0, Math.sin((hourOfDay - 6) * Math.PI / 12));
      const uvIndex = maxUV * uvCycle * (0.8 + Math.random() * 0.4);
      
      // Air quality (generally good in rural Zimbabwe)
      const airQuality = Math.floor(Math.random() * 3) + 1; // 1-3 (good to moderate)
      
      // Vegetation index (varies with season and rainfall)
      const baseVegetation = isWetSeason ? 75 : 45;
      const vegetation = Math.max(20, Math.min(95, baseVegetation + (Math.random() - 0.5) * 20));
      
      // Cloud cover
      const baseCloudCover = isWetSeason ? 60 : 30;
      const cloudCover = Math.max(0, Math.min(100, baseCloudCover + (Math.random() - 0.5) * 30));
      
      data.push({
        id: i,
        timestamp: baseTime,
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity),
        pressure: Math.round(pressure * 10) / 10,
        windSpeed: Math.round(windSpeed * 10) / 10,
        windDirection: Math.round(windDirection),
        precipitation: Math.round(precipitation * 10) / 10,
        soilMoisture: Math.round(soilMoisture),
        elevation: locationData.altitude + (Math.random() - 0.5) * 50,
        vegetation: Math.round(vegetation),
        uvIndex: Math.round(uvIndex * 10) / 10,
        airQuality: airQuality,
        cloudCover: Math.round(cloudCover),
        visibility: Math.round(15000 + (Math.random() - 0.5) * 5000), // Visibility in meters
        weather: precipitation > 0 ? 'Rain' : (cloudCover > 70 ? 'Cloudy' : (cloudCover > 30 ? 'Partly Cloudy' : 'Clear')),
        coordinates: {
          lat: locationData.lat + (Math.random() - 0.5) * 0.05,
          lng: locationData.lng + (Math.random() - 0.5) * 0.05
        },
        hourOfDay,
        season: isWetSeason ? 'Wet' : (isDrySeason ? 'Dry' : 'Transition'),
        date: date.toISOString().split('T')[0]
      });
    }
    
    return {
      data,
      dimensions: {
        time: data.map(d => d.timestamp),
        temperature: data.map(d => d.temperature),
        humidity: data.map(d => d.humidity),
        pressure: data.map(d => d.pressure),
        windSpeed: data.map(d => d.windSpeed),
        precipitation: data.map(d => d.precipitation),
        soilMoisture: data.map(d => d.soilMoisture),
        elevation: data.map(d => d.elevation),
        vegetation: data.map(d => d.vegetation),
        uvIndex: data.map(d => d.uvIndex),
        airQuality: data.map(d => d.airQuality),
        cloudCover: data.map(d => d.cloudCover)
      },
      groups: {
        temperatureByTime: data.reduce((acc, d) => {
          const hour = d.hourOfDay;
          acc[hour] = (acc[hour] || []).concat(d.temperature);
          return acc;
        }, {}),
        humidityRanges: data.reduce((acc, d) => {
          const range = Math.floor(d.humidity / 10) * 10;
          acc[range] = (acc[range] || 0) + 1;
          return acc;
        }, {}),
        pressureDistribution: data.reduce((acc, d) => {
          const bucket = Math.floor(d.pressure / 5) * 5;
          acc[bucket] = (acc[bucket] || 0) + 1;
          return acc;
        }, {}),
        weatherTypes: data.reduce((acc, d) => {
          acc[d.weather] = (acc[d.weather] || 0) + 1;
          return acc;
        }, {}),
        seasonalPatterns: data.reduce((acc, d) => {
          acc[d.season] = (acc[d.season] || 0) + 1;
          return acc;
        }, {}),
        uvIndexDistribution: data.reduce((acc, d) => {
          const uvLevel = Math.floor(d.uvIndex);
          acc[uvLevel] = (acc[uvLevel] || 0) + 1;
          return acc;
        }, {}),
        airQualityLevels: data.reduce((acc, d) => {
          acc[d.airQuality] = (acc[d.airQuality] || 0) + 1;
          return acc;
        }, {})
      },
      metadata: {
        source: 'Climate-based Realistic Data',
        location: locationData.name || 'Buhera West',
        lastUpdated: Date.now(),
        totalPoints: dataPoints,
        coverage: 'Subtropical Highland Climate Model',
        season: isWetSeason ? 'Wet Season (Nov-Mar)' : (isDrySeason ? 'Dry Season (May-Sep)' : 'Transition Period')
      }
    };
  };

  // Handle filter updates from charts
  const handleFilterUpdate = useCallback((dimension, range) => {
    setChartFilters(prev => ({
      ...prev,
      [dimension]: range
    }));
    
    // Apply filters to crossfilter backend
    if (crossfilterData) {
      applyFilters(dimension, range);
    }
  }, [crossfilterData]);

  const applyFilters = async (dimension, range) => {
    try {
      const response = await fetch('/api/crossfilter/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dimension,
          range,
          filters: chartFilters
        })
      });
      
      if (response.ok) {
        const filteredData = await response.json();
        setCrossfilterData(prev => ({
          ...prev,
          filteredData
        }));
      }
    } catch (error) {
      console.warn('Filter application failed, using client-side filtering:', error);
      // Fallback to client-side filtering
      clientSideFilter(dimension, range);
    }
  };

  const clientSideFilter = (dimension, range) => {
    if (!crossfilterData) return;
    
    const filteredData = crossfilterData.data.filter(item => {
      if (range && range.length === 2) {
        const value = item[dimension];
        return value >= range[0] && value <= range[1];
      }
      return true;
    });
    
    setCrossfilterData(prev => ({
      ...prev,
      filteredData
    }));
  };

  // Reset all filters
  const resetFilters = useCallback(() => {
    setChartFilters({});
    if (crossfilterData) {
      setCrossfilterData(prev => ({
        ...prev,
        filteredData: prev.data
      }));
    }
  }, [crossfilterData]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'globe', label: 'Global View', icon: Globe },
    { id: 'terrain', label: '3D Terrain', icon: Mountain },
    { id: 'analytics', label: 'Analytics', icon: Activity }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dashboardRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-4 z-50 pointer-events-auto"
      >
        {/* Glass morphism container */}
        <div className="w-full h-full relative">
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-2xl">
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
          </div>
          
          {/* Main content */}
          <div className="relative z-10 w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 dark:border-gray-700/30">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Environmental Intelligence Dashboard
                  </h2>
                </div>
                
                {/* Tab navigation */}
                <div className="flex space-x-1 ml-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-700/20'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Control buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetFilters}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-700/20 transition-colors"
                  title="Reset Filters"
                >
                  <Filter size={18} />
                </button>
                <button
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-700/20 transition-colors"
                  title="Settings"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                  title="Close Dashboard"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading crossfilter data...</span>
              </div>
            )}

            {/* Content area */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'overview' && (
                <div className="h-full grid grid-cols-12 grid-rows-8 gap-4 p-6">
                  {/* Crossfilter charts */}
                  <div className="col-span-8 row-span-8">
                    <CrossfilterCharts
                      data={crossfilterData}
                      filters={chartFilters}
                      onFilterUpdate={handleFilterUpdate}
                      locationData={locationData}
                    />
                  </div>
                  
                  {/* 3D Terrain mini view */}
                  <div className="col-span-4 row-span-4">
                    <div className="h-full bg-black/20 rounded-lg border border-white/10 dark:border-gray-700/30 overflow-hidden">
                      <div className="p-3 border-b border-white/10 dark:border-gray-700/30">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">3D Terrain</h3>
                      </div>
                      <div className="h-[calc(100%-3rem)]">
                        <ThreeDimTerrain
                          locationData={locationData}
                          compact={true}
                          showControls={false}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Globe mini view */}
                  <div className="col-span-4 row-span-4">
                    <div className="h-full bg-black/20 rounded-lg border border-white/10 dark:border-gray-700/30 overflow-hidden">
                      <div className="p-3 border-b border-white/10 dark:border-gray-700/30">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Global Context</h3>
                      </div>
                      <div className="h-[calc(100%-3rem)]">
                        <InformationGlobe
                          locationData={locationData}
                          data={crossfilterData?.filteredData || crossfilterData?.data}
                          compact={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'globe' && (
                <div className="h-full p-6">
                  <InformationGlobe
                    locationData={locationData}
                    data={crossfilterData?.filteredData || crossfilterData?.data}
                    compact={false}
                  />
                </div>
              )}

              {activeTab === 'terrain' && (
                <div className="h-full p-6">
                  <div className="w-full h-full grid grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-lg border border-white/10 dark:border-gray-700/30 overflow-hidden">
                      <div className="p-3 border-b border-white/10 dark:border-gray-700/30">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">3D Terrain Rendering</h3>
                      </div>
                      <div className="h-[calc(100%-3rem)]">
                        <ThreeDimTerrain
                          locationData={locationData}
                          compact={false}
                          showControls={true}
                        />
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg border border-white/10 dark:border-gray-700/30 overflow-hidden">
                      <div className="p-3 border-b border-white/10 dark:border-gray-700/30">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Wireframe Analysis</h3>
                      </div>
                      <div className="h-[calc(100%-3rem)]">
                        <WireframeTerrain
                          locationData={locationData}
                          data={crossfilterData?.filteredData || crossfilterData?.data}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="h-full p-6">
                  <CrossfilterCharts
                    data={crossfilterData}
                    filters={chartFilters}
                    onFilterUpdate={handleFilterUpdate}
                    locationData={locationData}
                    fullscreen={true}
                  />
                </div>
              )}
            </div>

            {/* Filter status bar */}
            {Object.keys(chartFilters).length > 0 && (
              <div className="p-4 border-t border-white/10 dark:border-gray-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Filters:</span>
                    <div className="flex space-x-2">
                      {Object.entries(chartFilters).map(([dimension, range]) => (
                        <div
                          key={dimension}
                          className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs border border-blue-500/30"
                        >
                          {dimension}: {Array.isArray(range) ? `${range[0]?.toFixed(1)} - ${range[1]?.toFixed(1)}` : range}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Information;

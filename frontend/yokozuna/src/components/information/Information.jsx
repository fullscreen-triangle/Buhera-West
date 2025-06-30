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

  // Load crossfilter data from Rust backend
  useEffect(() => {
    if (isOpen && !crossfilterData) {
      loadCrossfilterData();
    }
  }, [isOpen]);

  const loadCrossfilterData = async () => {
    setIsLoading(true);
    try {
      // Connect to Rust crossfilter backend
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
      } else {
        // Fallback to mock data for development
        setCrossfilterData(generateMockCrossfilterData());
      }
    } catch (error) {
      console.warn('Crossfilter backend not available, using mock data:', error);
      setCrossfilterData(generateMockCrossfilterData());
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock crossfilter data structure
  const generateMockCrossfilterData = () => {
    const dataPoints = 1000;
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const baseTime = Date.now() - (i * 60000); // 1 minute intervals
      data.push({
        timestamp: baseTime,
        temperature: 15 + Math.sin(i * 0.1) * 10 + Math.random() * 5,
        humidity: 40 + Math.cos(i * 0.08) * 20 + Math.random() * 10,
        pressure: 1000 + Math.sin(i * 0.05) * 15 + Math.random() * 8,
        windSpeed: Math.abs(Math.sin(i * 0.15) * 20 + Math.random() * 5),
        precipitation: Math.max(0, Math.sin(i * 0.2) * 50 + Math.random() * 20),
        soilMoisture: 30 + Math.cos(i * 0.12) * 15 + Math.random() * 8,
        elevation: locationData.altitude + Math.random() * 100 - 50,
        vegetation: Math.random() * 100,
        coordinates: {
          lat: locationData.lat + (Math.random() - 0.5) * 0.1,
          lng: locationData.lng + (Math.random() - 0.5) * 0.1
        }
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
        vegetation: data.map(d => d.vegetation)
      },
      groups: {
        temperatureByTime: data.reduce((acc, d) => {
          const hour = new Date(d.timestamp).getHours();
          acc[hour] = (acc[hour] || 0) + d.temperature;
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
        }, {})
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

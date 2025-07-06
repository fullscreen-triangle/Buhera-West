import React, { useEffect, useState, useCallback } from 'react';
import { useTime } from '../contexts/TimeContext';
import { Clock, Database, Wifi, Zap, TrendingUp, Calendar } from 'lucide-react';

/**
 * Enhanced Time Control Demo
 * Demonstrates atomic clock integration and time-based data filtering
 */
const EnhancedTimeControlDemo = () => {
  const {
    currentTime,
    isAtomicTimeSynced,
    syncQuality,
    getAtomicTime,
    getPreciseAtomicTime,
    registerDataStream,
    addDataPoints,
    getDataAtTime,
    getDataInRange,
    formatTime,
    seek,
    showTimeControls,
    setShowTimeControls
  } = useTime();
  
  const [demoData, setDemoData] = useState({
    weather: null,
    agriculture: null,
    geology: null
  });
  
  const [streamStats, setStreamStats] = useState({});
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  
  // Initialize demo data streams
  useEffect(() => {
    const initializeDemoStreams = async () => {
      try {
        console.log('🔧 Initializing demo data streams...');
        
        // Register weather data stream
        const weatherStream = registerDataStream('demo-weather', {
          interpolationMethod: 'linear',
          timeField: 'timestamp',
          cacheSize: 1000
        });
        
        // Register agriculture data stream
        const agStream = registerDataStream('demo-agriculture', {
          interpolationMethod: 'cubic',
          timeField: 'timestamp',
          cacheSize: 1000
        });
        
        // Register geology data stream
        const geoStream = registerDataStream('demo-geology', {
          interpolationMethod: 'step',
          timeField: 'timestamp',
          cacheSize: 1000
        });
        
        console.log('✅ Demo streams initialized');
        
        // Generate initial demo data
        generateDemoData();
        
      } catch (error) {
        console.error('❌ Failed to initialize demo streams:', error);
      }
    };
    
    initializeDemoStreams();
  }, [registerDataStream]);
  
  // Generate demo data points with atomic timestamps
  const generateDemoData = useCallback(() => {
    setIsGeneratingData(true);
    
    try {
      const baseTime = getAtomicTime();
      const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
      const interval = 30 * 60 * 1000; // 30 minutes
      
      // Generate weather data
      const weatherPoints = [];
      for (let i = 0; i < 48; i++) { // 48 points over 24 hours
        const timestamp = baseTime - timeWindow + (i * interval);
        weatherPoints.push({
          timestamp,
          temperature: 20 + Math.sin(i * 0.26) * 10 + Math.random() * 2, // Daily cycle + noise
          humidity: 60 + Math.cos(i * 0.26) * 20 + Math.random() * 5,
          pressure: 1013 + Math.sin(i * 0.1) * 5 + Math.random() * 2,
          windSpeed: 5 + Math.random() * 10
        });
      }
      
      // Generate agriculture data
      const agPoints = [];
      for (let i = 0; i < 24; i++) { // 24 points over 24 hours
        const timestamp = baseTime - timeWindow + (i * 60 * 60 * 1000); // Hourly
        agPoints.push({
          timestamp,
          soilMoisture: 0.3 + Math.sin(i * 0.5) * 0.2 + Math.random() * 0.05,
          cropHeight: 50 + i * 0.5 + Math.random() * 2,
          nutrientLevel: 0.8 - (i * 0.01) + Math.random() * 0.1,
          yieldPrediction: 8.5 + Math.sin(i * 0.3) * 1.5 + Math.random() * 0.3
        });
      }
      
      // Generate geology data
      const geoPoints = [];
      for (let i = 0; i < 12; i++) { // 12 points over 24 hours
        const timestamp = baseTime - timeWindow + (i * 2 * 60 * 60 * 1000); // 2-hourly
        geoPoints.push({
          timestamp,
          seismicActivity: Math.random() * 0.5,
          groundwaterLevel: 15 + Math.sin(i * 0.8) * 3 + Math.random() * 0.5,
          mineralConcentration: 0.02 + Math.random() * 0.01,
          soilStability: 0.95 - Math.random() * 0.05
        });
      }
      
      // Add data to streams
      addDataPoints('demo-weather', weatherPoints);
      addDataPoints('demo-agriculture', agPoints);
      addDataPoints('demo-geology', geoPoints);
      
      console.log('📊 Generated demo data:', {
        weather: weatherPoints.length,
        agriculture: agPoints.length,
        geology: geoPoints.length
      });
      
    } catch (error) {
      console.error('❌ Failed to generate demo data:', error);
    } finally {
      setIsGeneratingData(false);
    }
  }, [getAtomicTime, addDataPoints]);
  
  // Update filtered data when time changes
  useEffect(() => {
    const updateFilteredData = () => {
      try {
        const weatherData = getDataAtTime('demo-weather', currentTime);
        const agricultureData = getDataAtTime('demo-agriculture', currentTime);
        const geologyData = getDataAtTime('demo-geology', currentTime);
        
        setDemoData({
          weather: weatherData,
          agriculture: agricultureData,
          geology: geologyData
        });
        
      } catch (error) {
        console.error('❌ Failed to update filtered data:', error);
      }
    };
    
    updateFilteredData();
  }, [currentTime, getDataAtTime]);
  
  // Time jump shortcuts
  const jumpToTime = (offsetHours) => {
    const newTime = getAtomicTime() + (offsetHours * 60 * 60 * 1000);
    seek(newTime);
  };
  
  return (
    <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold">Enhanced Time Control Demo</h2>
          {isAtomicTimeSynced && (
            <div className="flex items-center space-x-1 text-green-400 text-sm">
              <Zap className="w-4 h-4" />
              <span>Atomic Sync</span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowTimeControls(!showTimeControls)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showTimeControls ? 'Hide' : 'Show'} Time Controls
        </button>
      </div>
      
      {/* Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Wifi className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Sync Status</span>
          </div>
          <div className="text-lg font-bold">
            {isAtomicTimeSynced ? 'Atomic Time' : 'Local Time'}
          </div>
          {syncQuality && (
            <div className="text-xs text-gray-400 mt-1">
              Quality: {Math.round(syncQuality.syncQuality * 100)}%
              <br />
              Latency: {Math.round(syncQuality.networkLatency)}ms
            </div>
          )}
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Current Time</span>
          </div>
          <div className="text-lg font-bold">
            {formatTime(currentTime, 'datetime')}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Precise: {formatTime(getPreciseAtomicTime(), 'precise').split('T')[1]}
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">Data Streams</span>
          </div>
          <div className="text-lg font-bold">3 Active</div>
          <div className="text-xs text-gray-400 mt-1">
            Weather • Agriculture • Geology
          </div>
        </div>
      </div>
      
      {/* Time Jump Controls */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Quick Time Navigation</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => jumpToTime(-24)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
          >
            -24h
          </button>
          <button
            onClick={() => jumpToTime(-12)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
          >
            -12h
          </button>
          <button
            onClick={() => jumpToTime(-6)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
          >
            -6h
          </button>
          <button
            onClick={() => jumpToTime(-1)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
          >
            -1h
          </button>
          <button
            onClick={() => seek(getAtomicTime())}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors font-medium"
          >
            Now
          </button>
          <button
            onClick={() => jumpToTime(1)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
          >
            +1h
          </button>
          <button
            onClick={() => jumpToTime(6)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
          >
            +6h
          </button>
          <button
            onClick={() => jumpToTime(12)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
          >
            +12h
          </button>
          <button
            onClick={() => jumpToTime(24)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors"
          >
            +24h
          </button>
        </div>
      </div>
      
      {/* Real-Time Data Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weather Data */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="font-medium">Weather Data</span>
          </div>
          {demoData.weather ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Temperature:</span>
                <span>{demoData.weather.temperature?.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Humidity:</span>
                <span>{demoData.weather.humidity?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pressure:</span>
                <span>{demoData.weather.pressure?.toFixed(1)} hPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wind Speed:</span>
                <span>{demoData.weather.windSpeed?.toFixed(1)} m/s</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No data at current time</div>
          )}
        </div>
        
        {/* Agriculture Data */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="font-medium">Agriculture Data</span>
          </div>
          {demoData.agriculture ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Soil Moisture:</span>
                <span>{(demoData.agriculture.soilMoisture * 100)?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Crop Height:</span>
                <span>{demoData.agriculture.cropHeight?.toFixed(1)} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nutrient Level:</span>
                <span>{(demoData.agriculture.nutrientLevel * 100)?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Yield Prediction:</span>
                <span>{demoData.agriculture.yieldPrediction?.toFixed(1)} t/ha</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No data at current time</div>
          )}
        </div>
        
        {/* Geology Data */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="font-medium">Geology Data</span>
          </div>
          {demoData.geology ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Seismic Activity:</span>
                <span>{demoData.geology.seismicActivity?.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Groundwater:</span>
                <span>{demoData.geology.groundwaterLevel?.toFixed(1)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Minerals:</span>
                <span>{(demoData.geology.mineralConcentration * 100)?.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Soil Stability:</span>
                <span>{(demoData.geology.soilStability * 100)?.toFixed(1)}%</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No data at current time</div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-600/20 border border-blue-400/30 rounded-lg">
        <h4 className="font-medium mb-2">✨ How to Use</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p>• Click "Show Time Controls" to reveal the enhanced time slider</p>
          <p>• Move the time slider to see data points change in real-time</p>
          <p>• Use quick navigation buttons to jump to different times</p>
          <p>• All data is synced to atomic clock precision when available</p>
          <p>• Data interpolation provides smooth transitions between points</p>
        </div>
      </div>
      
      {/* Regenerate Data Button */}
      <div className="mt-4 text-center">
        <button
          onClick={generateDemoData}
          disabled={isGeneratingData}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {isGeneratingData ? 'Generating...' : 'Regenerate Demo Data'}
        </button>
      </div>
    </div>
  );
};

export default EnhancedTimeControlDemo; 
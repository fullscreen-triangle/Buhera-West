'use client'
import { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Sun, 
  Cloud, 
  Zap, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Leaf,
  Sprout,
  CloudRain,
  BarChart3,
  Signal,
  Wifi
} from 'lucide-react';

const Dashboard = ({ locationData, weatherData, className = "" }) => {
  const [activeTab, setActiveTab] = useState('weather');
  const [liveData, setLiveData] = useState(weatherData);

  // Simulate live data updates
  useEffect(() => {
    if (!weatherData) {
      setLiveData(null);
      return;
    }

    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
        humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 5)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 3),
        pressure: prev.pressure + (Math.random() - 0.5) * 2
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [weatherData]);

  const tabs = [
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'agriculture', label: 'Agriculture', icon: Leaf },
    { id: 'analysis', label: 'Analysis', icon: Activity },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
  ];

  const WeatherTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="text-red-500" size={16} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Temperature</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {liveData?.temperature?.toFixed(1) || '--'}°C
            </span>
            <TrendingUp className="text-green-500" size={12} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="text-blue-500" size={16} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Humidity</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {liveData?.humidity?.toFixed(0) || '--'}%
            </span>
            <TrendingDown className="text-red-500" size={12} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="text-green-500" size={16} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Wind Speed</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {liveData?.windSpeed?.toFixed(1) || '--'} km/h
            </span>
            <TrendingUp className="text-green-500" size={12} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="text-purple-500" size={16} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Pressure</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {liveData?.pressure?.toFixed(0) || '--'} hPa
            </span>
            <TrendingUp className="text-green-500" size={12} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sun className="text-yellow-500" size={16} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">UV Index</span>
          </div>
          <span className="text-xs bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded text-yellow-800 dark:text-yellow-200">
            Moderate
          </span>
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {liveData?.uvIndex || 5}
        </span>
      </div>
    </div>
  );

  const AgricultureTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <Sprout className="text-green-500" size={16} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Crop Conditions</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Soil Moisture</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Optimal</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <CloudRain className="text-blue-500" size={16} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Irrigation Need</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Next 7 days</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Low</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Growing Degree Days</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">1,247</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Harvest Readiness</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">68%</div>
          </div>
        </div>
      </div>
    </div>
  );

  const AnalysisTab = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="text-indigo-500" size={16} />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Weather Patterns</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Stability Index</span>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">High</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Precipitation Trend</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">Increasing</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Temperature Variance</span>
            <span className="font-medium text-green-600 dark:text-green-400">Low</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Data Points</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">2,847</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Accuracy</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">94.2%</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-cyan-200 dark:border-cyan-800">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="text-cyan-500" size={16} />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Signal Processing</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-bold text-gray-900 dark:text-white">RF</div>
            <div className="text-green-500">Strong</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900 dark:text-white">SAR</div>
            <div className="text-yellow-500">Moderate</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900 dark:text-white">LiDAR</div>
            <div className="text-green-500">Active</div>
          </div>
        </div>
      </div>
    </div>
  );

  const AlertsTab = () => (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-800/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="text-red-500" size={16} />
          <span className="text-xs font-medium text-red-700 dark:text-red-300">High Priority</span>
        </div>
        <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">
          Strong wind warning expected in 6 hours
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Wind speeds may reach 45 km/h
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-2 mb-2">
          <Sun className="text-yellow-500" size={16} />
          <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Medium Priority</span>
        </div>
        <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">
          High UV index forecast for tomorrow
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          UV index may reach 9 - take precautions
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <CloudRain className="text-blue-500" size={16} />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Low Priority</span>
        </div>
        <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">
          Light rain possible this weekend
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          15mm precipitation expected
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="text-green-500" size={16} />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">Agricultural Alert</span>
        </div>
        <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">
          Optimal planting conditions detected
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Soil temperature and moisture ideal
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'weather':
        return <WeatherTab />;
      case 'agriculture':
        return <AgricultureTab />;
      case 'analysis':
        return <AnalysisTab />;
      case 'alerts':
        return <AlertsTab />;
      default:
        return <WeatherTab />;
    }
  };

  if (!locationData) {
    return (
      <div className={`bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-6 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Activity className="mx-auto mb-2" size={24} />
          <p className="text-sm font-medium">No Location Selected</p>
          <p className="text-xs mt-1">Search for a location to view dashboard</p>
        </div>
      </div>
    );
  }

  if (!liveData) {
    return (
      <div className={`bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-6 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Activity className="mx-auto mb-2" size={24} />
          <p className="text-sm font-medium">Loading Weather Data</p>
          <p className="text-xs mt-1">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Weather Dashboard</h2>
          <div className="flex items-center gap-1">
            <Wifi className="text-green-300" size={14} />
            <span className="text-xs">Live</span>
          </div>
        </div>
        <p className="text-sm opacity-90 truncate">{locationData.name}</p>
        <p className="text-xs opacity-75">
          {locationData.lat.toFixed(4)}, {locationData.lng.toFixed(4)}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-3 px-2 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {renderTabContent()}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <div className="flex items-center gap-1">
            <Signal size={12} />
            <span>Signal: Strong</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
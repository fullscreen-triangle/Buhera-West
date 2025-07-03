import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Cloud, Sun, CloudRain, Snowflake } from 'lucide-react';

const WEATHER_TYPES = [
  { key: 'all', label: 'All Weather', icon: Globe, color: '#64748b' },
  { key: 'sunny', label: 'Sunny', icon: Sun, color: '#FFD700' },
  { key: 'cloudy', label: 'Cloudy', icon: Cloud, color: '#87CEEB' },
  { key: 'rainy', label: 'Rainy', icon: CloudRain, color: '#4169E1' },
  { key: 'snowy', label: 'Snowy', icon: Snowflake, color: '#FFFFFF' }
];

export default function WeatherOverlay({ 
  show, 
  onLocationSearch, 
  onWeatherTypeChange,
  selectedWeatherType = 'all',
  topLocations = [],
  onLocationSelect,
  lastUpdated 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      if (onLocationSearch) {
        await onLocationSearch(query);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (query.length > 2) {
        handleSearch(query);
      }
    }, 500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  const handleWeatherTypeClick = (weatherType) => {
    if (onWeatherTypeChange) {
      onWeatherTypeChange(weatherType);
    }
  };

  const handleLocationClick = (location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-black bg-opacity-80 backdrop-blur-md text-white p-6 z-40 overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-600 pb-4">
          <h1 className="text-2xl font-bold mb-2">Buhera West Weather</h1>
          <p className="text-sm text-gray-300">
            Real-time global weather visualization and analysis
          </p>
        </div>

        {/* Search */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Search Location</h3>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="Enter city, country, or coordinates..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-white rounded-full"></div>
              ) : (
                <Search size={20} />
              )}
            </button>
          </form>
        </div>

        {/* Weather Type Filter */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Weather Filter</h3>
          <div className="grid grid-cols-1 gap-2">
            {WEATHER_TYPES.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleWeatherTypeClick(key)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  selectedWeatherType === key
                    ? 'bg-blue-600 bg-opacity-50 border border-blue-400'
                    : 'bg-gray-800 hover:bg-gray-700 border border-gray-600'
                }`}
              >
                <Icon size={20} style={{ color }} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Weather Locations */}
        {topLocations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Notable Weather</h3>
            <div className="space-y-2">
              {topLocations.slice(0, 5).map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationClick(location)}
                  className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{location.name}</h4>
                      <p className="text-sm text-gray-300">
                        {location.weather} • {location.temp}°C
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {location.humidity}% humidity
                      </div>
                      <div className="text-xs text-gray-500">
                        {location.windSpeed} km/h
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">How to Use</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>• Search for any location to see detailed weather</p>
            <p>• Click on weather markers on the globe</p>
            <p>• Filter by weather type to focus on specific conditions</p>
            <p>• Use mouse to rotate and zoom the globe</p>
          </div>
        </div>

        {/* Footer */}
        {lastUpdated && (
          <div className="text-xs text-gray-500 border-t border-gray-600 pt-4">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
} 
import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Cloud, Sun, CloudRain, Snowflake } from 'lucide-react';
import GeocoderSearch from '@/components/location/GeocoderSearch';

const WEATHER_TYPES = [
  { key: 'all', label: 'All Weather', icon: Globe, color: '#64748b' },
  { key: 'sunny', label: 'Sunny', icon: Sun, color: '#FFD700' },
  { key: 'cloudy', label: 'Cloudy', icon: Cloud, color: '#87CEEB' },
  { key: 'rainy', label: 'Rainy', icon: CloudRain, color: '#4169E1' },
  { key: 'snowy', label: 'Snowy', icon: Snowflake, color: '#FFFFFF' }
];

export default function WeatherOverlay({ 
  show, 
  onLocationSelect,  // This now receives locationData from GeocoderSearch
  onManualSearch,    // For coordinate input fallback
  onWeatherTypeChange,
  selectedWeatherType = 'all',
  topLocations = [],
  lastUpdated 
}) {

  const handleWeatherTypeClick = (weatherType) => {
    if (onWeatherTypeChange) {
      onWeatherTypeChange(weatherType);
    }
  };

  const handleTopLocationClick = (location) => {
    // Convert top location format to the expected locationData format
    const locationData = {
      coordinates: {
        lat: location.lat,
        lng: location.lng
      },
      placeName: `${location.name}, ${location.country || 'Unknown'}`,
      fullResult: location
    };
    
    if (onLocationSelect) {
      onLocationSelect(locationData);
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

        {/* Search with Autocomplete */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Search Location</h3>
          <div className="space-y-2">
            <GeocoderSearch
              onLocationSelect={onLocationSelect}
              placeholder="Search for a location in Southern Africa..."
              bbox={[10, -40, 55, 5]} // Broader Southern Africa region
              proximity={[25, -25]} // Southern Africa center
              className="w-full"
              showLabels={false}
            />
            <div className="text-xs text-gray-400">
              💡 Try: "Harare", "Cape Town", "-18.2436, 31.5781"
            </div>
          </div>
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
                  onClick={() => handleTopLocationClick(location)}
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
            <p>• Type location names for autocomplete suggestions</p>
            <p>• Paste coordinates in any format (lat,lng or lng,lat)</p>
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
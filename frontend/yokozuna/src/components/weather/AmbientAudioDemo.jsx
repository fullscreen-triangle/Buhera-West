import React, { useState, useEffect } from 'react';
import AmbientWeatherAudio, { useAmbientWeatherAudio } from './AmbientWeatherAudio';
import ambientAudioService from '../../services/ambientAudioService';

const AmbientAudioDemo = () => {
  const [selectedWeather, setSelectedWeather] = useState('clear');
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [location, setLocation] = useState({ latitude: -26.2041, longitude: 28.0473 }); // Johannesburg
  const [currentAmbience, setCurrentAmbience] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Weather options for demo
  const weatherOptions = [
    { value: 'clear', label: '☀️ Clear & Sunny', description: 'Birds chirping, gentle breeze' },
    { value: 'rain', label: '🌧️ Light Rain', description: 'Gentle rainfall, water drops' },
    { value: 'storm', label: '⛈️ Thunderstorm', description: 'Heavy rain, thunder, wind' },
    { value: 'wind', label: '💨 Windy', description: 'Wind through grass, leaves rustling' },
    { value: 'snow', label: '❄️ Snow', description: 'Quiet snowfall, winter wind' },
    { value: 'fog', label: '🌫️ Foggy', description: 'Mysterious ambience, distant sounds' },
    { value: 'night', label: '🌙 Night', description: 'Crickets, owls, night sounds' }
  ];

  // Location options for regional sounds
  const locationOptions = [
    { value: { latitude: -26.2041, longitude: 28.0473 }, label: '🌍 Johannesburg, SA' },
    { value: { latitude: -33.9249, longitude: 18.4241 }, label: '🌊 Cape Town, SA' },
    { value: { latitude: -29.8587, longitude: 31.0218 }, label: '🏔️ Durban, SA' },
    { value: { latitude: 40.7128, longitude: -74.0060 }, label: '🏙️ New York, USA' },
    { value: { latitude: 51.5074, longitude: -0.1278 }, label: '🌧️ London, UK' }
  ];

  // Create mock weather data
  const createWeatherData = (weatherType, windSpeed = 5, temperature = 20) => ({
    current: {
      weather: weatherType,
      wind_speed: windSpeed,
      temp: temperature,
      humidity: 65,
      timestamp: Date.now()
    }
  });

  // Handle weather change
  const handleWeatherChange = async (weatherType) => {
    setSelectedWeather(weatherType);
    setIsLoading(true);

    try {
      const weatherData = createWeatherData(weatherType);
      
      if (isPlaying) {
        await ambientAudioService.transitionToWeather(weatherData, location);
        const ambience = ambientAudioService.getCurrentAmbience();
        setCurrentAmbience(ambience);
      }
    } catch (error) {
      console.error('Failed to change weather:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle audio playback
  const toggleAudio = async () => {
    setIsLoading(true);

    try {
      if (isPlaying) {
        await ambientAudioService.stopAmbience();
        setIsPlaying(false);
        setCurrentAmbience(null);
      } else {
        if (!ambientAudioService.isReady()) {
          await ambientAudioService.initialize();
        }
        
        const weatherData = createWeatherData(selectedWeather);
        const ambience = await ambientAudioService.createWeatherAmbience(weatherData, location);
        await ambientAudioService.playAmbience(ambience);
        
        setIsPlaying(true);
        setCurrentAmbience(ambience);
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (ambientAudioService.isReady()) {
      ambientAudioService.setVolume(newVolume);
    }
  };

  // Handle location change
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    if (isPlaying) {
      handleWeatherChange(selectedWeather);
    }
  };

  return (
    <div className="ambient-audio-demo p-6 bg-gray-900 text-white rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🎵 Ambient Weather Audio Demo
      </h2>

      {/* Status Display */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isPlaying ? 'bg-green-600' : 'bg-gray-600'
          }`}>
            {isLoading ? '⏳ Loading...' : isPlaying ? '🎵 Playing' : '⏸️ Stopped'}
          </span>
        </div>
        
        {currentAmbience && (
          <div className="text-sm text-gray-400">
            <p>🌤️ Weather: {currentAmbience.weatherType}</p>
            <p>🔊 Intensity: {Math.round(currentAmbience.intensity * 100)}%</p>
            <p>🎧 Layers: {currentAmbience.layers?.length || 0}</p>
          </div>
        )}
      </div>

      {/* Weather Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Weather Condition</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {weatherOptions.map((weather) => (
            <button
              key={weather.value}
              onClick={() => handleWeatherChange(weather.value)}
              disabled={isLoading}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedWeather === weather.value
                  ? 'border-blue-500 bg-blue-600/20'
                  : 'border-gray-600 hover:border-gray-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-sm font-medium">{weather.label}</div>
              <div className="text-xs text-gray-400 mt-1">{weather.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Location Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Location (for regional sounds)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {locationOptions.map((loc, index) => (
            <button
              key={index}
              onClick={() => handleLocationChange(loc.value)}
              disabled={isLoading}
              className={`p-3 rounded-lg border-2 transition-all ${
                location.latitude === loc.value.latitude
                  ? 'border-green-500 bg-green-600/20'
                  : 'border-gray-600 hover:border-gray-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-sm font-medium">{loc.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Volume Control */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Volume Control</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm">🔇</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm">🔊</span>
          <span className="text-sm w-12">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleAudio}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isLoading ? '⏳ Loading...' : isPlaying ? '⏸️ Stop Audio' : '▶️ Start Audio'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
        <h4 className="font-semibold mb-2">🎯 How to Use:</h4>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>1. Click "Start Audio" to begin ambient sounds</li>
          <li>2. Select different weather conditions to hear how sounds change</li>
          <li>3. Try different locations to hear regional ambient sounds</li>
          <li>4. Adjust volume to your preference (designed to be subtle)</li>
          <li>5. Sounds will smoothly transition between weather types</li>
        </ul>
      </div>

      {/* API Key Notice */}
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
        <p className="text-sm text-yellow-200">
          💡 <strong>Note:</strong> This demo requires a Freesound API key to work fully. 
          Without it, local fallback sounds will be used. 
          See <code>AMBIENT_AUDIO_SETUP.md</code> for setup instructions.
        </p>
      </div>
    </div>
  );
};

export default AmbientAudioDemo; 
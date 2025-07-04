import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from "next/head";
import TransitionEffect from "@/components/TransitionEffect";
import weatherService from '@/services/weatherService';
import GeocoderSearch from '@/components/location/GeocoderSearch';
import AIAssistant from '@/components/ai/AIAssistant';
import TimeControls from '@/components/weather/TimeControls';
import AmbientWeatherAudio from '@/components/weather/AmbientWeatherAudio';
import { AIProvider } from '@/contexts/AIContext';
import { TimeProvider } from '@/contexts/TimeContext';
import { FaSearch, FaClock, FaRobot, FaVolumeUp, FaVolumeOff, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';

// Dynamic import for react-globe.gl to prevent SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Loading Weather Globe...</p>
      </div>
    </div>
  )
});

// State Management
const WeatherGlobeContext = createContext(null);

const initialState = {
  // Globe state
  focusedMarker: null,
  hasLoaded: false,
  markers: [],
  start: false,
  lastUpdated: null,
  topLocations: [],
  isLoading: true,
  
  // UI state
  showSearch: false,
  showTimeControls: false,
  showAIAssistant: false,
  audioEnabled: false,
  
  // Weather state
  currentWeatherData: null,
  currentLocation: null,
  currentTime: new Date(),
  isPlaying: false,
  timeRange: '24h',
  playbackSpeed: 1,
  
  // Audio state
  audioVolume: 0.3,
  isAudioMuted: false,
  
  // Layout state
  isFullscreen: false,
  overlayPositions: {
    search: { x: 50, y: 50 },
    timeControls: { x: 50, y: 50 },
    aiAssistant: { x: 50, y: 50 }
  }
};

function reducer(state, action) {
  const { payload, type } = action;
  switch (type) {
    case 'LOADED':
      return { ...state, hasLoaded: true };
    case 'START':
      return { ...state, start: true };
    case 'FOCUS':
      return { ...state, focusedMarker: payload };
    case 'SET_MARKERS':
      return { ...state, markers: payload };
    case 'SET_TOP_LOCATIONS':
      return { ...state, topLocations: payload };
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: payload };
    case 'SET_LOADING':
      return { ...state, isLoading: payload };
    case 'SET_WEATHER_DATA':
      return { ...state, currentWeatherData: payload };
    case 'SET_LOCATION':
      return { ...state, currentLocation: payload };
    case 'SET_TIME':
      return { ...state, currentTime: payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: payload };
    case 'SET_TIME_RANGE':
      return { ...state, timeRange: payload };
    case 'SET_PLAYBACK_SPEED':
      return { ...state, playbackSpeed: payload };
    case 'TOGGLE_SEARCH':
      return { ...state, showSearch: !state.showSearch };
    case 'TOGGLE_TIME_CONTROLS':
      return { ...state, showTimeControls: !state.showTimeControls };
    case 'TOGGLE_AI_ASSISTANT':
      return { ...state, showAIAssistant: !state.showAIAssistant };
    case 'SET_AUDIO_ENABLED':
      return { ...state, audioEnabled: payload };
    case 'SET_AUDIO_VOLUME':
      return { ...state, audioVolume: payload };
    case 'SET_AUDIO_MUTED':
      return { ...state, isAudioMuted: payload };
    case 'SET_FULLSCREEN':
      return { ...state, isFullscreen: payload };
    case 'UPDATE_OVERLAY_POSITION':
      return { 
        ...state, 
        overlayPositions: { 
          ...state.overlayPositions, 
          [payload.overlay]: payload.position 
        } 
      };
    default:
      return state;
  }
}

function WeatherGlobeProvider({ children }) {
  return (
    <WeatherGlobeContext.Provider value={useReducer(reducer, initialState)}>
      {children}
    </WeatherGlobeContext.Provider>
  );
}

function useWeatherGlobe() {
  return useContext(WeatherGlobeContext);
}

// Draggable Panel Component
function DraggablePanel({ title, children, onClose, position, onPositionChange, className = "" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      onPositionChange(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div 
      className={`absolute bg-black/80 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl ${className}`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div 
        className="flex items-center justify-between p-3 border-b border-white/10"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-white font-medium text-sm">{title}</h3>
        <button 
          onClick={onClose}
          className="text-white/60 hover:text-white text-sm"
        >
          <FaTimes />
        </button>
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  );
}

// Globe Component
function WeatherGlobe() {
  const [state, dispatch] = useWeatherGlobe();
  const { focusedMarker, hasLoaded, markers, start, currentTime, currentWeatherData, currentLocation, audioEnabled, audioVolume, isAudioMuted } = state;
  const [globeReady, setGlobeReady] = useState(false);
  const [globeRef, setGlobeRef] = useState(null);

  useEffect(() => {
    // Mark as loaded when globe is ready
    if (globeReady) {
      dispatch({ type: 'LOADED' });
    }
  }, [globeReady, dispatch]);

  // Update globe time visualization
  useEffect(() => {
    if (globeRef && currentTime) {
      // Update any time-based visualizations on the globe
      console.log('Globe time update:', currentTime);
    }
  }, [currentTime, globeRef]);

  // Handle location selection from search
  const handleLocationSelect = async (locationData) => {
    const { coordinates, placeName } = locationData;
    
    dispatch({ type: 'SET_LOCATION', payload: { 
      lat: coordinates.lat, 
      lng: coordinates.lng, 
      name: placeName 
    }});
    
    // Get weather for location
    try {
      const weatherData = await weatherService.getWeatherByCoordinates(coordinates.lat, coordinates.lng);
      dispatch({ type: 'SET_WEATHER_DATA', payload: weatherData });
      
      // Add to markers
      const newMarker = {
        id: `${coordinates.lat}-${coordinates.lng}`,
        name: placeName,
        country: 'Unknown',
        lat: coordinates.lat,
        lng: coordinates.lng,
        temperature: weatherData.current?.temp || 20,
        weather: weatherData.current?.weather || 'clear',
        humidity: weatherData.current?.humidity,
        windSpeed: weatherData.current?.wind_speed,
        timestamp: Date.now()
      };
      
      dispatch({ type: 'SET_MARKERS', payload: [...markers, newMarker] });
      dispatch({ type: 'FOCUS', payload: newMarker });
      
    } catch (error) {
      console.error('Failed to get weather for location:', error);
    }
  };

  return (
    <div className="fixed inset-0">
      <div className={hasLoaded ? 'block' : 'hidden'}>
        <Globe
          ref={setGlobeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          width={typeof window !== 'undefined' ? window.innerWidth : 800}
          height={typeof window !== 'undefined' ? window.innerHeight : 600}
          pointsData={start ? markers : []}
          pointLat={d => d.lat}
          pointLng={d => d.lng}
          pointColor={d => {
            const temp = d.temperature || 20;
            if (temp < 0) return '#87CEEB';
            else if (temp < 10) return '#4169E1';
            else if (temp < 20) return '#32CD32';
            else if (temp < 30) return '#FFD700';
            else return '#FF4500';
          }}
          pointAltitude={d => (d.temperature || 20) / 100}
          pointRadius={d => Math.max((d.temperature || 20) / 30, 0.3)}
          pointLabel={d => `
            <div style="
              background: rgba(0,0,0,0.8);
              color: white;
              padding: 8px;
              border-radius: 4px;
              font-size: 12px;
            ">
              <strong>${d.name}</strong><br/>
              ${d.temperature}°C<br/>
              ${d.weather}<br/>
              <small>${new Date(d.timestamp).toLocaleTimeString()}</small>
            </div>
          `}
          onPointClick={(point) => {
            dispatch({ type: 'FOCUS', payload: point });
          }}
          onGlobeReady={() => setGlobeReady(true)}
          enablePointerInteraction={true}
          animateIn={true}
        />
      </div>
      
      {/* Loading overlay */}
      <div className={`fixed inset-0 bg-black transition-opacity duration-3000 ${hasLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl font-light">Loading Weather Globe...</p>
            <p className="text-sm opacity-75 mt-2">Connecting to weather networks worldwide</p>
          </div>
        </div>
      </div>

      {/* Ambient Audio */}
      <AmbientWeatherAudio
        enabled={audioEnabled}
        volume={isAudioMuted ? 0 : audioVolume}
        location={currentLocation}
        weatherData={currentWeatherData}
        onAudioChange={(ambienceData) => {
          console.log('🎵 Ambient audio changed:', ambienceData);
        }}
      />
    </div>
  );
}

// Control Panel Component
function ControlPanel() {
  const [state, dispatch] = useWeatherGlobe();
  const { showSearch, showTimeControls, showAIAssistant, audioEnabled, audioVolume, isAudioMuted, isFullscreen } = state;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      dispatch({ type: 'SET_FULLSCREEN', payload: true });
    } else {
      document.exitFullscreen();
      dispatch({ type: 'SET_FULLSCREEN', payload: false });
    }
  };

  const toggleAudio = () => {
    dispatch({ type: 'SET_AUDIO_ENABLED', payload: !audioEnabled });
  };

  const toggleMute = () => {
    dispatch({ type: 'SET_AUDIO_MUTED', payload: !isAudioMuted });
  };

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col space-y-2">
      {/* Main controls */}
      <div className="flex space-x-2 bg-black/70 backdrop-blur-md rounded-lg p-2">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SEARCH' })}
          className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          title="Search Location"
        >
          <FaSearch className="text-white" />
        </button>
        
        <button
          onClick={() => dispatch({ type: 'TOGGLE_TIME_CONTROLS' })}
          className={`p-2 rounded-lg transition-colors ${showTimeControls ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          title="Time Controls"
        >
          <FaClock className="text-white" />
        </button>
        
        <button
          onClick={() => dispatch({ type: 'TOGGLE_AI_ASSISTANT' })}
          className={`p-2 rounded-lg transition-colors ${showAIAssistant ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          title="AI Assistant"
        >
          <FaRobot className="text-white" />
        </button>
        
        <button
          onClick={toggleAudio}
          className={`p-2 rounded-lg transition-colors ${audioEnabled ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          title="Toggle Ambient Audio"
        >
          {audioEnabled ? <FaVolumeUp className="text-white" /> : <FaVolumeOff className="text-white" />}
        </button>
        
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <FaCompress className="text-white" /> : <FaExpand className="text-white" />}
        </button>
      </div>

      {/* Audio controls */}
      {audioEnabled && (
        <div className="bg-black/70 backdrop-blur-md rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              {isAudioMuted ? <FaVolumeOff className="text-white text-sm" /> : <FaVolumeUp className="text-white text-sm" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioVolume}
              onChange={(e) => dispatch({ type: 'SET_AUDIO_VOLUME', payload: parseFloat(e.target.value) })}
              className="w-16 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white text-xs font-mono">{Math.round(audioVolume * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Search Panel Component
function SearchPanel() {
  const [state, dispatch] = useWeatherGlobe();
  const { showSearch, overlayPositions, markers } = state;

  const handleLocationSelect = async (locationData) => {
    const { coordinates, placeName } = locationData;
    
    dispatch({ type: 'SET_LOCATION', payload: { 
      lat: coordinates.lat, 
      lng: coordinates.lng, 
      name: placeName 
    }});
    
    try {
      const weatherData = await weatherService.getWeatherByCoordinates(coordinates.lat, coordinates.lng);
      dispatch({ type: 'SET_WEATHER_DATA', payload: weatherData });
      
      // Add to markers
      const newMarker = {
        id: `${coordinates.lat}-${coordinates.lng}`,
        name: placeName,
        country: 'Unknown',
        lat: coordinates.lat,
        lng: coordinates.lng,
        temperature: weatherData.current?.temp || 20,
        weather: weatherData.current?.weather || 'clear',
        humidity: weatherData.current?.humidity,
        windSpeed: weatherData.current?.wind_speed,
        timestamp: Date.now()
      };
      
      dispatch({ type: 'SET_MARKERS', payload: [...markers, newMarker] });
      dispatch({ type: 'FOCUS', payload: newMarker });
      
    } catch (error) {
      console.error('Failed to get weather for location:', error);
    }
  };

  if (!showSearch) return null;

  return (
    <DraggablePanel
      title="Search Location"
      onClose={() => dispatch({ type: 'TOGGLE_SEARCH' })}
      position={overlayPositions.search}
      onPositionChange={(pos) => dispatch({ type: 'UPDATE_OVERLAY_POSITION', payload: { overlay: 'search', position: pos } })}
      className="w-96 max-w-sm z-40"
    >
      <div className="space-y-3">
        <GeocoderSearch
          onLocationSelect={handleLocationSelect}
          placeholder="Search for locations worldwide..."
          bbox={[-180, -90, 180, 90]} // Global search
          proximity={[0, 0]}
          className="w-full"
          showLabels={false}
        />
        <div className="text-xs text-gray-400">
          💡 Try: "London", "Tokyo", "New York", "Cape Town"
        </div>
      </div>
    </DraggablePanel>
  );
}

// Time Control Panel Component
function TimeControlPanel() {
  const [state, dispatch] = useWeatherGlobe();
  const { showTimeControls, overlayPositions, currentTime, isPlaying, timeRange, playbackSpeed } = state;

  const handleTimeChange = (newTime) => {
    dispatch({ type: 'SET_TIME', payload: newTime });
  };

  const handlePlayToggle = (playing) => {
    dispatch({ type: 'SET_PLAYING', payload: playing });
  };

  const handleTimeRangeChange = (range) => {
    dispatch({ type: 'SET_TIME_RANGE', payload: range });
  };

  const handleSpeedChange = (speed) => {
    dispatch({ type: 'SET_PLAYBACK_SPEED', payload: speed });
  };

  if (!showTimeControls) return null;

  return (
    <DraggablePanel
      title="Time Controls"
      onClose={() => dispatch({ type: 'TOGGLE_TIME_CONTROLS' })}
      position={overlayPositions.timeControls}
      onPositionChange={(pos) => dispatch({ type: 'UPDATE_OVERLAY_POSITION', payload: { overlay: 'timeControls', position: pos } })}
      className="w-80 z-40"
    >
      <TimeControls
        currentTime={currentTime}
        onTimeChange={handleTimeChange}
        isPlaying={isPlaying}
        onPlayToggle={handlePlayToggle}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        playbackSpeed={playbackSpeed}
        onSpeedChange={handleSpeedChange}
        enabled={true}
        className="w-full"
      />
    </DraggablePanel>
  );
}

// AI Assistant Panel Component
function AIAssistantPanel() {
  const [state, dispatch] = useWeatherGlobe();
  const { showAIAssistant, overlayPositions } = state;

  if (!showAIAssistant) return null;

  return (
    <DraggablePanel
      title="AI Assistant"
      onClose={() => dispatch({ type: 'TOGGLE_AI_ASSISTANT' })}
      position={overlayPositions.aiAssistant}
      onPositionChange={(pos) => dispatch({ type: 'UPDATE_OVERLAY_POSITION', payload: { overlay: 'aiAssistant', position: pos } })}
      className="w-96 h-96 z-40"
    >
      <div className="h-full">
        <AIAssistant />
      </div>
    </DraggablePanel>
  );
}

// Intro Component
function Intro() {
  const [state, dispatch] = useWeatherGlobe();
  const { hasLoaded, start } = state;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center transition-opacity duration-1000 ${start ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="text-center text-white max-w-2xl mx-auto px-8">
        <h1 className="text-6xl font-bold mb-6 text-blue-400">Buhera West</h1>
        <h2 className="text-2xl font-light mb-8 text-gray-300">Global Weather Intelligence</h2>
        <p className="text-lg mb-12 text-gray-400 leading-relaxed">
          Explore real-time weather patterns across the globe with our interactive 3D visualization platform. 
          Search locations, control time, interact with AI, and experience immersive ambient audio.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <FaSearch className="text-blue-400 mb-2" />
            <p>Location Search</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <FaClock className="text-green-400 mb-2" />
            <p>Time Controls</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <FaRobot className="text-purple-400 mb-2" />
            <p>AI Assistant</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <FaVolumeUp className="text-yellow-400 mb-2" />
            <p>Ambient Audio</p>
          </div>
        </div>
        
        <div className={`transition-opacity duration-1000 ${hasLoaded ? 'opacity-100' : 'opacity-50'}`}>
          <button
            onClick={() => dispatch({ type: 'START' })}
            disabled={!hasLoaded}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {hasLoaded ? 'Explore Weather Globe' : 'Loading...'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Overlay Component
function Overlay() {
  const [state, dispatch] = useWeatherGlobe();
  const { focusedMarker, lastUpdated, markers, start, topLocations } = state;

  const showOverlay = start && !focusedMarker;

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-black bg-opacity-90 backdrop-blur-sm text-white p-6 transition-transform duration-500 ${showOverlay ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-600 pb-4">
          <h2 className="text-2xl font-bold text-blue-400">Weather Globe</h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time global weather visualization with AI, time controls, and immersive audio
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Features Available</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-800/50 p-2 rounded">
              <FaSearch className="text-blue-400 mb-1" />
              <p>Location Search</p>
            </div>
            <div className="bg-gray-800/50 p-2 rounded">
              <FaClock className="text-green-400 mb-1" />
              <p>Time Controls</p>
            </div>
            <div className="bg-gray-800/50 p-2 rounded">
              <FaRobot className="text-purple-400 mb-1" />
              <p>AI Assistant</p>
            </div>
            <div className="bg-gray-800/50 p-2 rounded">
              <FaVolumeUp className="text-yellow-400 mb-1" />
              <p>Ambient Audio</p>
            </div>
          </div>
        </div>

        {/* Top Weather Locations */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Notable Weather Conditions</h3>
          {topLocations.slice(0, 5).map((location, index) => (
            <div 
              key={`${location.name}-${index}`}
              onClick={() => dispatch({ type: 'FOCUS', payload: location })}
              className="cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{location.name}</h4>
                <span className="text-blue-400 font-bold">{location.temperature}°C</span>
              </div>
              <p className="text-sm text-gray-400 capitalize">{location.weather}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Active Locations:</span>
            <span className="text-white">{markers.length}</span>
          </div>
          {lastUpdated && (
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="text-white">{new Date(lastUpdated).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-800 p-3 rounded-lg">
          <p className="font-medium mb-2">🌍 How to explore:</p>
          <ul className="space-y-1">
            <li>• Use control panel (top-left) to access features</li>
            <li>• Click weather markers on the globe</li>
            <li>• Use mouse to rotate and zoom</li>
            <li>• Enable audio for immersive experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Details Component
function Details() {
  const [state, dispatch] = useWeatherGlobe();
  const { focusedMarker, markers } = state;

  const getRandomMarker = () => {
    const filteredMarkers = markers.filter(marker => marker.id !== focusedMarker?.id);
    return filteredMarkers[Math.floor(Math.random() * filteredMarkers.length)];
  };

  if (!focusedMarker) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-500">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => dispatch({ type: 'FOCUS', payload: null })}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Back to Globe
          </button>
          <button
            onClick={() => dispatch({ type: 'FOCUS', payload: getRandomMarker() })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Random Location
          </button>
        </div>

        {/* Location Details */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-400">{focusedMarker.name}</h2>
            <p className="text-gray-400">{focusedMarker.country}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-400">{focusedMarker.temperature}°C</p>
              <p className="text-sm text-gray-400">Temperature</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-lg font-medium capitalize">{focusedMarker.weather}</p>
              <p className="text-sm text-gray-400">Condition</p>
            </div>
          </div>

          {focusedMarker.humidity && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Humidity:</span>
                <span className="font-medium">{focusedMarker.humidity}%</span>
              </div>
            </div>
          )}

          {focusedMarker.windSpeed && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Wind Speed:</span>
                <span className="font-medium">{focusedMarker.windSpeed} km/h</span>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-gray-800 p-3 rounded-lg">
            <p>Coordinates: {focusedMarker.lat?.toFixed(4)}, {focusedMarker.lng?.toFixed(4)}</p>
            <p>Updated: {new Date(focusedMarker.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [state, dispatch] = useWeatherGlobe();
  const { isLoading } = state;

  useEffect(() => {
    const initializeData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load global weather data
        const globalData = await weatherService.getGlobalWeatherData();
        const weatherMarkers = globalData.map(location => ({
          id: location.id || `${location.lat}-${location.lng}`,
          name: location.name,
          country: location.country,
          lat: location.lat,
          lng: location.lng,
          temperature: location.temperature || 20,
          weather: location.weather || 'clear',
          humidity: location.humidity,
          windSpeed: location.windSpeed,
          timestamp: Date.now(),
          ...location
        }));
        
        dispatch({ type: 'SET_MARKERS', payload: weatherMarkers });
        
        // Load notable weather locations
        const notable = await weatherService.getNotableWeather();
        const notableMarkers = notable.map(location => ({
          id: location.id || `${location.lat}-${location.lng}`,
          name: location.name,
          country: location.country,
          lat: location.lat,
          lng: location.lng,
          temperature: location.temperature || 20,
          weather: location.weather || 'clear',
          humidity: location.humidity,
          windSpeed: location.windSpeed,
          timestamp: Date.now(),
          ...location
        }));
        
        dispatch({ type: 'SET_TOP_LOCATIONS', payload: notableMarkers });
        dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });
        
      } catch (error) {
        console.error('Failed to initialize weather data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeData();
  }, [dispatch]);

  return (
    <>
      <WeatherGlobe />
      <ControlPanel />
      <SearchPanel />
      <TimeControlPanel />
      <AIAssistantPanel />
      <Intro />
      <Overlay />
      <Details />
    </>
  );
}

// Main Home Component
export default function Home() {
  return (
    <>
      <Head>
        <title>Buhera West - Global Weather Intelligence</title>
        <meta
          name="description"
          content="Interactive 3D weather globe with AI, time controls, location search, and immersive ambient audio. Explore real-time weather patterns across the globe."
        />
        <meta property="og:title" content="Buhera West - Global Weather Intelligence" />
        <meta property="og:description" content="Explore real-time weather patterns with interactive 3D visualization, AI assistant, time controls, and ambient audio." />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://api.openweathermap.org" />
        <link rel="preconnect" href="https://freesound.org" />
      </Head>

      <TransitionEffect />
      
      <AIProvider>
        <TimeProvider>
          <WeatherGlobeProvider>
            <App />
          </WeatherGlobeProvider>
        </TimeProvider>
      </AIProvider>
    </>
  );
} 
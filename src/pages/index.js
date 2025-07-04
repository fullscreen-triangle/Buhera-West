import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from "next/head";
import TransitionEffect from "@/components/TransitionEffect";
import weatherService from '@/services/weatherService';

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
  focusedMarker: null,
  hasLoaded: false,
  markers: [],
  start: false,
  lastUpdated: null,
  topLocations: [],
  isLoading: true,
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

// Globe Component
function WeatherGlobe() {
  const [{ focusedMarker, hasLoaded, markers, start }, dispatch] = useWeatherGlobe();
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    // Mark as loaded when globe is ready
    if (globeReady) {
      dispatch({ type: 'LOADED' });
    }
  }, [globeReady, dispatch]);

  return (
    <div className="fixed inset-0">
      <div className={hasLoaded ? 'block' : 'hidden'}>
        <Globe
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
              ${d.weather}
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
    </div>
  );
}

// Intro Component
function Intro() {
  const [{ hasLoaded, start }, dispatch] = useWeatherGlobe();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center transition-opacity duration-1000 ${start ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="text-center text-white max-w-2xl mx-auto px-8">
        <h1 className="text-6xl font-bold mb-6 text-blue-400">Buhera West</h1>
        <h2 className="text-2xl font-light mb-8 text-gray-300">Global Weather Intelligence</h2>
        <p className="text-lg mb-12 text-gray-400 leading-relaxed">
          Explore real-time weather patterns across the globe with our interactive 3D visualization platform. 
          Click on weather markers to discover detailed atmospheric conditions and forecasts.
        </p>
        
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
  const [{ focusedMarker, lastUpdated, markers, start, topLocations }, dispatch] = useWeatherGlobe();

  const showOverlay = start && !focusedMarker;

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-black bg-opacity-90 backdrop-blur-sm text-white p-6 transition-transform duration-500 ${showOverlay ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-600 pb-4">
          <h2 className="text-2xl font-bold text-blue-400">Weather Globe</h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time global weather visualization
          </p>
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
            <li>• Click weather markers on the globe</li>
            <li>• Use mouse to rotate and zoom</li>
            <li>• Click locations above for quick access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Details Component
function Details() {
  const [{ focusedMarker, markers }, dispatch] = useWeatherGlobe();

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
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [{ isLoading }, dispatch] = useWeatherGlobe();

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
          content="Interactive 3D weather globe visualization. Explore real-time weather patterns across the globe with our advanced weather intelligence platform."
        />
        <meta property="og:title" content="Buhera West - Global Weather Intelligence" />
        <meta property="og:description" content="Explore real-time weather patterns across the globe with our interactive 3D weather visualization platform." />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://api.openweathermap.org" />
      </Head>

      <TransitionEffect />
      
      <WeatherGlobeProvider>
        <App />
      </WeatherGlobeProvider>
    </>
  );
} 
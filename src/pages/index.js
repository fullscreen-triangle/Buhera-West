import React, { createContext, useContext, useReducer, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Head from "next/head";
import TransitionEffect from "@/components/TransitionEffect";
import { TextureLoader, ShaderMaterial, Vector2, Mesh, SphereGeometry, MeshPhongMaterial } from 'three';
import * as THREE from 'three';
import globalDataService from '@/services/globalDataService';

// Dynamic import for react-globe.gl to prevent SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Loading Global Intelligence...</p>
      </div>
    </div>
  )
});

// Globe visualization modes
const GLOBE_MODES = {
  FLIGHTS: 'flights',
  SATELLITES: 'satellites',
  WEATHER: 'weather',
  CABLES: 'cables',
  CLOUDS: 'clouds',
  INTERACTIVE: 'interactive'
};

const MODE_CONFIG = {
  [GLOBE_MODES.FLIGHTS]: {
    title: 'Global Flight Routes',
    description: 'Real-time airline traffic and major flight corridors',
    icon: '✈️'
  },
  [GLOBE_MODES.SATELLITES]: {
    title: 'Satellite Tracking',
    description: 'Live satellite positions and orbital paths',
    icon: '🛰️'
  },
  [GLOBE_MODES.WEATHER]: {
    title: 'Weather Patterns',
    description: 'Global temperature, precipitation, and weather systems',
    icon: '🌡️'
  },
  [GLOBE_MODES.CABLES]: {
    title: 'Submarine Cables',
    description: 'Underwater internet infrastructure connecting continents',
    icon: '🌐'
  },
  [GLOBE_MODES.CLOUDS]: {
    title: 'Cloud Cover',
    description: 'Real-time global cloud coverage and atmospheric conditions',
    icon: '☁️'
  },
  [GLOBE_MODES.INTERACTIVE]: {
    title: 'Interactive Explorer',
    description: 'Click anywhere to explore regional data and connections',
    icon: '🌍'
  }
};

// State Management
const GlobeContext = createContext(null);

const initialState = {
  mode: GLOBE_MODES.FLIGHTS,
  hasLoaded: false,
  start: false,
  flightData: [],
  satelliteData: [],
  weatherData: [],
  cableData: [],
  cloudData: null,
  interactiveArcs: [],
  interactiveRings: [],
  isLoading: true,
  selectedPoint: null,
  animationTime: 0,
};

function reducer(state, action) {
  const { payload, type } = action;
  switch (type) {
    case 'SET_MODE':
      return { ...state, mode: payload };
    case 'LOADED':
      return { ...state, hasLoaded: true };
    case 'START':
      return { ...state, start: true };
    case 'SET_FLIGHT_DATA':
      return { ...state, flightData: payload };
    case 'SET_SATELLITE_DATA':
      return { ...state, satelliteData: payload };
    case 'SET_WEATHER_DATA':
      return { ...state, weatherData: payload };
    case 'SET_CABLE_DATA':
      return { ...state, cableData: payload };
    case 'SET_CLOUD_DATA':
      return { ...state, cloudData: payload };
    case 'SET_INTERACTIVE_ARCS':
      return { ...state, interactiveArcs: payload };
    case 'SET_INTERACTIVE_RINGS':
      return { ...state, interactiveRings: payload };
    case 'SET_LOADING':
      return { ...state, isLoading: payload };
    case 'SET_SELECTED_POINT':
      return { ...state, selectedPoint: payload };
    case 'SET_ANIMATION_TIME':
      return { ...state, animationTime: payload };
    default:
      return state;
  }
}

function GlobeProvider({ children }) {
  return (
    <GlobeContext.Provider value={useReducer(reducer, initialState)}>
      {children}
    </GlobeContext.Provider>
  );
}

function useGlobe() {
  return useContext(GlobeContext);
}

// Main Globe Component
function InteractiveGlobe() {
  const [state, dispatch] = useGlobe();
  const globeRef = useRef();
  const [globeReady, setGlobeReady] = useState(false);
  const [cloudsLayer, setCloudsLayer] = useState(null);
  const prevCoords = useRef({ lat: 0, lng: 0 });

    // Load real data
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load all real data in parallel
        const [flights, satellites, weather, cables, flightRoutes] = await Promise.all([
          globalDataService.getRealFlightData(),
          globalDataService.getRealSatelliteData(),
          globalDataService.getRealWeatherData(),
          globalDataService.getRealCableData(),
          globalDataService.getRealFlightRoutes()
        ]);
        
        dispatch({ type: 'SET_FLIGHT_DATA', payload: flightRoutes });
        dispatch({ type: 'SET_SATELLITE_DATA', payload: satellites });
        dispatch({ type: 'SET_WEATHER_DATA', payload: weather });
        dispatch({ type: 'SET_CABLE_DATA', payload: cables });
        
        console.log('Real data loaded:', { flights: flights.length, satellites: satellites.length, weather: weather.length, cables: cables.length });
      } catch (error) {
        console.error('Failed to load real data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Handle interactive globe clicks
  const handleGlobeClick = useCallback((point) => {
    if (state.mode === GLOBE_MODES.INTERACTIVE) {
      const { lat, lng } = point;
      const { lat: startLat, lng: startLng } = prevCoords.current;
      prevCoords.current = { lat, lng };

      // Create arc
      const arc = { startLat, startLng, endLat: lat, endLng: lng };
      dispatch({ type: 'SET_INTERACTIVE_ARCS', payload: [...state.interactiveArcs, arc] });
      
      // Remove arc after animation
      setTimeout(() => {
        dispatch({ type: 'SET_INTERACTIVE_ARCS', payload: state.interactiveArcs.filter(a => a !== arc) });
      }, 2000);

      // Create rings
      const startRing = { lat: startLat, lng: startLng };
      const endRing = { lat, lng };
      
      dispatch({ type: 'SET_INTERACTIVE_RINGS', payload: [...state.interactiveRings, startRing] });
      setTimeout(() => {
        dispatch({ type: 'SET_INTERACTIVE_RINGS', payload: [...state.interactiveRings, endRing] });
      }, 1000);
      
      // Clean up rings
      setTimeout(() => {
        dispatch({ type: 'SET_INTERACTIVE_RINGS', payload: state.interactiveRings.filter(r => r !== startRing && r !== endRing) });
      }, 3000);
    }
  }, [state.mode, state.interactiveArcs, state.interactiveRings, dispatch]);

  // Add clouds layer using existing cloud texture
  useEffect(() => {
    if (globeReady && globeRef.current && state.mode === GLOBE_MODES.CLOUDS) {
      const globe = globeRef.current;
      
      // Load real cloud texture from public directory
      const textureLoader = new THREE.TextureLoader();
      const loadCloudsTexture = () => {
        return new Promise((resolve) => {
          textureLoader.load(
            '/environments/clouds.png',
            (texture) => {
              resolve(texture);
            },
            undefined,
            (error) => {
              console.warn('Failed to load cloud texture, using fallback:', error);
              // Create procedural texture as fallback
              const canvas = document.createElement('canvas');
              canvas.width = 1024;
              canvas.height = 512;
              const ctx = canvas.getContext('2d');
              
              // Create a cloudy pattern
              const gradient = ctx.createRadialGradient(512, 256, 0, 512, 256, 400);
              gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
              gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
              gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
              
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 1024, 512);
              
              // Add cloud-like noise
              for (let i = 0; i < 200; i++) {
                const x = Math.random() * 1024;
                const y = Math.random() * 512;
                const radius = Math.random() * 50 + 10;
                const opacity = Math.random() * 0.3 + 0.1;
                
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
              }
              
              resolve(new THREE.CanvasTexture(canvas));
            }
          );
        });
      };
      
      loadCloudsTexture().then((cloudsTexture) => {
        const clouds = new Mesh(
          new SphereGeometry(globe.getGlobeRadius() * 1.004, 75, 75),
          new MeshPhongMaterial({ 
            map: cloudsTexture, 
            transparent: true, 
            opacity: 0.6,
            blending: THREE.AdditiveBlending
          })
        );
        
        globe.scene().add(clouds);
        setCloudsLayer(clouds);
        
        // Animate clouds
        const animateClouds = () => {
          if (clouds && state.mode === GLOBE_MODES.CLOUDS) {
            clouds.rotation.y += 0.002;
            requestAnimationFrame(animateClouds);
          }
        };
        animateClouds();
        
        // Cleanup when mode changes
        return () => {
          if (clouds) {
            globe.scene().remove(clouds);
          }
        };
      });
    }
  }, [globeReady, state.mode]);

  // Update animation time
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'SET_ANIMATION_TIME', payload: state.animationTime + 1 });
    }, 100);
    return () => clearInterval(interval);
  }, [state.animationTime, dispatch]);

  // Mark as loaded when globe is ready
  useEffect(() => {
    if (globeReady) {
      dispatch({ type: 'LOADED' });
    }
  }, [globeReady, dispatch]);

  const getCurrentModeProps = () => {
    switch (state.mode) {
      case GLOBE_MODES.FLIGHTS:
        return {
          arcsData: state.flightData,
          arcStartLat: 'startLat',
          arcStartLng: 'startLng',
          arcEndLat: 'endLat',
          arcEndLng: 'endLng',
          arcColor: d => d.color || '#4ecdc4',
          arcDashLength: 0.4,
          arcDashGap: 0.2,
          arcDashAnimateTime: 2000,
          arcLabel: d => d.airline,
          pointsData: [],
          pathsData: [],
          htmlElementsData: []
        };
      
      case GLOBE_MODES.SATELLITES:
        return {
          pointsData: state.satelliteData,
          pointLat: 'lat',
          pointLng: 'lng',
          pointColor: d => {
            switch(d.type) {
              case 'Space Station': return '#ff6b6b';
              case 'Communication': return '#4ecdc4';
              case 'Weather': return '#45b7d1';
              case 'Navigation': return '#96ceb4';
              default: return '#ffeaa7';
            }
          },
          pointAltitude: 'alt',
          pointRadius: 0.3,
          pointLabel: d => `${d.name} (${d.type})`,
          arcsData: [],
          pathsData: [],
          htmlElementsData: []
        };
      
      case GLOBE_MODES.WEATHER:
        return {
          pointsData: state.weatherData,
          pointLat: 'lat',
          pointLng: 'lng',
          pointColor: d => {
            const temp = d.temperature;
            if (temp < 0) return '#87CEEB';
            if (temp < 10) return '#4169E1';
            if (temp < 20) return '#32CD32';
            if (temp < 30) return '#FFD700';
            return '#FF4500';
          },
          pointAltitude: d => Math.abs(d.temperature) / 100,
          pointRadius: 0.2,
          pointLabel: d => `${d.name}: ${d.temperature}°C - ${d.condition}`,
          arcsData: [],
          pathsData: [],
          htmlElementsData: []
        };
      
      case GLOBE_MODES.CABLES:
        return {
          pathsData: state.cableData,
          pathPoints: 'coords',
          pathPointLat: p => p[1],
          pathPointLng: p => p[0],
          pathColor: path => path.properties.color,
          pathLabel: path => path.properties.name,
          pathDashLength: 0.1,
          pathDashGap: 0.008,
          pathDashAnimateTime: 8000,
          pointsData: [],
          arcsData: [],
          htmlElementsData: []
        };
      
      case GLOBE_MODES.INTERACTIVE:
        return {
          arcsData: state.interactiveArcs,
          arcStartLat: 'startLat',
          arcStartLng: 'startLng',
          arcEndLat: 'endLat',
          arcEndLng: 'endLng',
          arcColor: () => '#ff6b6b',
          arcDashLength: 0.4,
          arcDashGap: 2,
          arcDashAnimateTime: 1000,
          ringsData: state.interactiveRings,
          ringColor: () => t => `rgba(255, 107, 107, ${1-t})`,
          ringMaxRadius: 5,
          ringPropagationSpeed: 5,
          ringRepeatPeriod: 700,
          pointsData: [],
          pathsData: [],
          htmlElementsData: []
        };
      
      default:
        return {
          pointsData: [],
          arcsData: [],
          pathsData: [],
          htmlElementsData: []
        };
    }
  };

  return (
    <div className="fixed inset-0">
      <div className={state.hasLoaded ? 'block' : 'hidden'}>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          width={typeof window !== 'undefined' ? window.innerWidth : 800}
          height={typeof window !== 'undefined' ? window.innerHeight : 600}
          onGlobeReady={() => setGlobeReady(true)}
          onGlobeClick={handleGlobeClick}
          enablePointerInteraction={true}
          animateIn={true}
          {...getCurrentModeProps()}
        />
      </div>
      
      {/* Loading overlay */}
      <div className={`fixed inset-0 bg-black transition-opacity duration-3000 ${state.hasLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl font-light">Loading Global Intelligence...</p>
            <p className="text-sm opacity-75 mt-2">Connecting to worldwide data networks</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mode Selector Component
function ModeSelector() {
  const [state, dispatch] = useGlobe();

  if (!state.start) return null;

  return (
    <div className="fixed top-4 left-4 z-10">
      <div className="bg-black bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-lg font-bold mb-3">Global Intelligence Modes</h3>
        <div className="space-y-2">
          {Object.entries(GLOBE_MODES).map(([key, mode]) => (
            <button
              key={mode}
              onClick={() => dispatch({ type: 'SET_MODE', payload: mode })}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                state.mode === mode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <span className="text-lg mr-2">{MODE_CONFIG[mode].icon}</span>
              <span className="font-medium">{MODE_CONFIG[mode].title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Info Panel Component
function InfoPanel() {
  const [state] = useGlobe();

  if (!state.start) return null;

  const currentMode = MODE_CONFIG[state.mode];

  return (
    <div className="fixed bottom-4 left-4 z-10">
      <div className="bg-black bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-white max-w-md">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-3">{currentMode.icon}</span>
          <h3 className="text-lg font-bold">{currentMode.title}</h3>
        </div>
        <p className="text-sm text-gray-300 mb-3">{currentMode.description}</p>
        
        {state.mode === GLOBE_MODES.INTERACTIVE && (
          <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
            💡 <strong>Tip:</strong> Click anywhere on the globe to create connections and explore regional data
          </div>
        )}
        
                 {state.mode === GLOBE_MODES.FLIGHTS && (
           <div className="text-xs text-gray-400">
             Showing major international flight corridors
           </div>
         )}
         
         {state.mode === GLOBE_MODES.SATELLITES && (
           <div className="text-xs text-gray-400">
             Tracking 50+ satellites in low Earth orbit
           </div>
         )}
         
         {state.mode === GLOBE_MODES.WEATHER && (
           <div className="text-xs text-gray-400">
             Global temperature and weather conditions
           </div>
         )}
         
         {state.mode === GLOBE_MODES.CABLES && (
           <div className="text-xs text-gray-400">
             Submarine internet cables connecting continents
           </div>
         )}
         
         {state.mode === GLOBE_MODES.CLOUDS && (
           <div className="text-xs text-gray-400">
             Real-time atmospheric cloud coverage
           </div>
         )}
      </div>
    </div>
  );
}

// Intro Component
function Intro() {
  const [state, dispatch] = useGlobe();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center transition-opacity duration-1000 ${state.start ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="text-center text-white max-w-3xl mx-auto px-8">
        <h1 className="text-6xl font-bold mb-6 text-blue-400">Buhera West</h1>
        <h2 className="text-3xl font-light mb-8 text-gray-300">Global Intelligence Platform</h2>
        <p className="text-lg mb-8 text-gray-400 leading-relaxed">
          Explore real-time global data through interactive 3D visualizations. Track flights, satellites, 
          weather patterns, submarine cables, and more. Click anywhere to discover connections and insights.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(MODE_CONFIG).map(([key, mode]) => (
            <div key={key} className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
              <div className="text-2xl mb-1">{mode.icon}</div>
              <div className="text-sm font-medium">{mode.title}</div>
            </div>
          ))}
        </div>
        
        <div className={`transition-opacity duration-1000 ${state.hasLoaded ? 'opacity-100' : 'opacity-50'}`}>
          <button
            onClick={() => dispatch({ type: 'START' })}
            disabled={!state.hasLoaded}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {state.hasLoaded ? 'Explore Global Intelligence' : 'Loading...'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [state, dispatch] = useGlobe();

  useEffect(() => {
    // Initialize data
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [dispatch]);

  return (
    <>
      <InteractiveGlobe />
      <Intro />
      <ModeSelector />
      <InfoPanel />
    </>
  );
}

// Main Home Component
export default function Home() {
  return (
    <>
      <Head>
        <title>Buhera West - Global Intelligence Platform</title>
        <meta
          name="description"
          content="Interactive 3D global visualization platform. Explore real-time flights, satellites, weather patterns, submarine cables, and worldwide data connections."
        />
        <meta property="og:title" content="Buhera West - Global Intelligence Platform" />
        <meta property="og:description" content="Explore real-time global data through interactive 3D visualizations. Track flights, satellites, weather patterns, and more." />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://api.openweathermap.org" />
      </Head>

      <TransitionEffect />
      
      <GlobeProvider>
        <App />
      </GlobeProvider>
    </>
  );
} 
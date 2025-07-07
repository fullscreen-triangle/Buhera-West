import React, { createContext, useContext, useReducer, useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
import { FaSearch, FaClock, FaRobot, FaVolumeUp, FaVolumeOff, FaTimes, FaExpand, FaCompress, FaPlane, FaSatellite, FaThermometerHalf, FaGlobe, FaMousePointer, FaInfoCircle, FaPlay, FaPause } from 'react-icons/fa';
import { TextureLoader, ShaderMaterial, Vector2, Mesh, SphereGeometry, MeshPhongMaterial } from 'three';
import * as THREE from 'three';
import * as solar from 'solar-calculator';

// Dynamic import for react-globe.gl to prevent SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Loading Global Intelligence Platform...</p>
      </div>
    </div>
  )
});

// State Management
const WeatherGlobeContext = createContext(null);

const initialState = {
  mode: GLOBE_MODES.FLIGHTS,
  hasLoaded: false,
  start: false,
  flightData: [],
  airlineData: [],
  satelliteData: [],
  weatherData: [],
  cableData: [],
  seaTrafficData: [],
  cloudData: null,
  interactiveArcs: [],
  interactiveRings: [],
  isLoading: true,
  selectedPoint: null,
  animationTime: 0,
  focusedMarker: null,
  topLocations: [],
  lastUpdated: null,
  showSearch: false,
  showTimeControls: false,
  showAIAssistant: false,
  audioEnabled: false,
  currentWeatherData: null,
  currentLocation: null,
  currentTime: new Date(),
  isPlaying: false,
  timeRange: '24h',
  playbackSpeed: 1,
  audioVolume: 0.3,
  isAudioMuted: false,
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
    case 'SET_MODE':
      return { ...state, mode: payload };
    case 'LOADED':
      return { ...state, hasLoaded: true };
    case 'START':
      return { ...state, start: true };
    case 'SET_FLIGHT_DATA':
      return { ...state, flightData: payload };
    case 'SET_AIRLINE_DATA':
      return { ...state, airlineData: payload };
    case 'SET_SATELLITE_DATA':
      return { ...state, satelliteData: payload };
    case 'SET_WEATHER_DATA':
      return { ...state, weatherData: payload };
    case 'SET_CABLE_DATA':
      return { ...state, cableData: payload };
    case 'SET_SEA_TRAFFIC_DATA':
      return { ...state, seaTrafficData: payload };
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
    case 'FOCUS':
      return { ...state, focusedMarker: payload };
    case 'SET_MARKERS':
      return { ...state, markers: payload };
    case 'SET_TOP_LOCATIONS':
      return { ...state, topLocations: payload };
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: payload };
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

// Day/Night Shader from globes.md
const dayNightShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec2 sunPosition;
    uniform vec2 globeRotation;
    varying vec3 vNormal;
    varying vec2 vUv;

    float toRad(in float a) {
      return a * PI / 180.0;
    }

    vec3 Polar2Cartesian(in vec2 c) {
      float theta = toRad(90.0 - c.x);
      float phi = toRad(90.0 - c.y);
      return vec3(
        sin(phi) * cos(theta),
        cos(phi),
        sin(phi) * sin(theta)
      );
    }

    void main() {
      float invLon = toRad(globeRotation.x);
      float invLat = -toRad(globeRotation.y);
      mat3 rotX = mat3(
        1, 0, 0,
        0, cos(invLat), -sin(invLat),
        0, sin(invLat), cos(invLat)
      );
      mat3 rotY = mat3(
        cos(invLon), 0, sin(invLon),
        0, 1, 0,
        -sin(invLon), 0, cos(invLon)
      );
      vec3 rotatedSunDirection = rotX * rotY * Polar2Cartesian(sunPosition);
      float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      float blendFactor = smoothstep(-0.1, 0.1, intensity);
      gl_FragColor = mix(nightColor, dayColor, blendFactor);
    }
  `
};

// Sun position calculation from globes.md
const sunPosAt = dt => {
  const day = new Date(+dt).setUTCHours(0, 0, 0, 0);
  const t = solar.century(dt);
  const longitude = (day - dt) / 864e5 * 360 - 180;
  return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
};

// Globe Component
function WeatherGlobe() {
  const [state, dispatch] = useWeatherGlobe();
  const { focusedMarker, hasLoaded, markers, start, currentTime, currentWeatherData, currentLocation, audioEnabled, audioVolume, isAudioMuted } = state;
  const [globeReady, setGlobeReady] = useState(false);
  const [globeRef, setGlobeRef] = useState(null);
  const [globeMaterial, setGlobeMaterial] = useState();
  const [cloudsLayer, setCloudsLayer] = useState(null);
  const [dt, setDt] = useState(+new Date());

  // Time animation - advance time continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setDt(dt => dt + 60 * 1000); // 1 minute per frame
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Initialize day/night shader material
  useEffect(() => {
    const initializeDayNightShader = async () => {
      try {
        const dayTexture = await new TextureLoader().loadAsync('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg');
        const nightTexture = await new TextureLoader().loadAsync('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg');
        
        const material = new ShaderMaterial({
          uniforms: {
            dayTexture: { value: dayTexture },
            nightTexture: { value: nightTexture },
            sunPosition: { value: new Vector2() },
            globeRotation: { value: new Vector2() }
          },
          vertexShader: dayNightShader.vertexShader,
          fragmentShader: dayNightShader.fragmentShader
        });
        
        setGlobeMaterial(material);
      } catch (error) {
        console.warn('Failed to load day/night textures, using fallback');
      }
    };

    initializeDayNightShader();
  }, []);

  // Update sun position based on time
  useEffect(() => {
    if (globeMaterial) {
      const sunPosition = sunPosAt(dt);
      globeMaterial.uniforms.sunPosition.value.set(...sunPosition);
    }
  }, [dt, globeMaterial]);

  // Add animated clouds layer from globes.md
  useEffect(() => {
    if (globeReady && globeRef && !cloudsLayer) {
      const globe = globeRef;
      
      // Load cloud texture or create procedural one
      const loadCloudsTexture = () => {
        return new Promise((resolve) => {
          const textureLoader = new TextureLoader();
          textureLoader.load(
            '/environments/clouds.png',
            (texture) => resolve(texture),
            undefined,
            (error) => {
              console.warn('Using procedural cloud texture');
              // Create procedural cloud texture
              const canvas = document.createElement('canvas');
              canvas.width = 1024;
              canvas.height = 512;
              const ctx = canvas.getContext('2d');
              
              // Create cloudy pattern
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
        
        // Animate clouds rotation
        const animateClouds = () => {
          if (clouds) {
            clouds.rotation.y += 0.002;
            requestAnimationFrame(animateClouds);
          }
        };
        animateClouds();
      });
    }
  }, [globeReady, globeRef, cloudsLayer]);

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
      {/* Time display */}
      <div className="fixed bottom-4 left-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-sm">
        {new Date(dt).toLocaleString()}
      </div>
      
      <div className={hasLoaded ? 'block' : 'hidden'}>
        <Globe
          ref={(ref) => {
            setGlobeRef(ref);
          }}
          globeMaterial={globeMaterial}
          globeImageUrl={globeMaterial ? undefined : "//unpkg.com/three-globe/example/img/earth-night.jpg"}
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
          pointAltitude={d => Math.max((d.temperature || 20) / 100, 0.01)}
          pointRadius={d => {
            const temp = d.temperature || 20;
            const windSpeed = d.windSpeed || 0;
            // Scale point size based on temperature and wind speed
            return Math.max(temp / 30 + windSpeed / 50, 0.3);
          }}
          pointLabel={d => `
            <div style="
              background: rgba(0,0,0,0.9);
              color: white;
              padding: 12px;
              border-radius: 8px;
              font-size: 14px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
              border: 1px solid rgba(255,255,255,0.1);
            ">
              <strong style="color: #4FC3F7;">${d.name}</strong><br/>
              <span style="color: #FFD54F;">🌡️ ${d.temperature}°C</span><br/>
              <span style="color: #81C784;">🌬️ ${d.windSpeed || 0} km/h</span><br/>
              <span style="color: #F06292;">💧 ${d.humidity || 0}%</span><br/>
              <span style="color: #A5D6A7;">${d.weather}</span><br/>
              <small style="color: #B0BEC5;">${new Date(d.timestamp).toLocaleTimeString()}</small>
            </div>
          `}
          onPointClick={(point) => {
            dispatch({ type: 'FOCUS', payload: point });
          }}
          onGlobeReady={() => setGlobeReady(true)}
          enablePointerInteraction={true}
          animateIn={true}
          // Update globe rotation for day/night shader
          onZoom={useCallback(({ lng, lat }) => {
            if (globeMaterial?.uniforms.globeRotation) {
              globeMaterial.uniforms.globeRotation.value.set(lng, lat);
            }
          }, [globeMaterial])}
        />
      </div>
      
      {/* Loading overlay */}
      <div className={`fixed inset-0 bg-black transition-opacity duration-3000 ${hasLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl font-light">Loading Weather Globe...</p>
            <p className="text-sm opacity-75 mt-2">Initializing day/night cycle and cloud systems</p>
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

// Globe visualization modes
const GLOBE_MODES = {
  FLIGHTS: 'flights',
  AIRLINES: 'airlines',
  SATELLITES: 'satellites',
  WEATHER: 'weather',
  CABLES: 'cables',
  SEA_TRAFFIC: 'sea_traffic',
  CLOUDS: 'clouds',
  INTERACTIVE: 'interactive'
};

const MODE_CONFIG = {
  [GLOBE_MODES.FLIGHTS]: {
    title: 'Global Flight Routes',
    description: 'Real-time airline traffic and major flight corridors',
    icon: '✈️'
  },
  [GLOBE_MODES.AIRLINES]: {
    title: 'Airline Networks',
    description: 'Airport hubs and domestic/international flight routes',
    icon: '🛫'
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
  [GLOBE_MODES.SEA_TRAFFIC]: {
    title: 'Maritime Traffic',
    description: 'Global shipping routes and vessel traffic patterns',
    icon: '🚢'
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

function ModeSelector({ currentMode, onModeChange }) {
  const modes = [
    { key: GLOBE_MODES.FLIGHTS, icon: FaPlane, label: 'Flight Routes', color: '#ff4444' },
    { key: GLOBE_MODES.SATELLITES, icon: FaSatellite, label: 'Satellites', color: '#44ff44' },
    { key: GLOBE_MODES.WEATHER, icon: FaThermometerHalf, label: 'Weather', color: '#ffff44' },
    { key: GLOBE_MODES.CABLES, icon: FaGlobe, label: 'Cables', color: '#00ffff' },
    { key: GLOBE_MODES.CLOUDS, icon: FaCloud, label: 'Clouds', color: '#ffffff' },
    { key: GLOBE_MODES.INTERACTIVE, icon: FaMousePointer, label: 'Explorer', color: '#ff00ff' }
  ];

  return (
    <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-lg border border-white/20 rounded-lg p-4">
      <h3 className="text-white text-lg font-semibold mb-3 flex items-center gap-2">
        <FaInfoCircle className="text-blue-400" />
        Visualization Modes
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {modes.map(mode => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.key}
              onClick={() => onModeChange(mode.key)}
              className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
                currentMode === mode.key 
                  ? 'bg-white/20 border-2 border-white/50' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Icon className="text-white" style={{ color: mode.color }} />
              <span className="text-white text-sm">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InfoPanel({ mode, data }) {
  const getModeInfo = () => {
    switch (mode) {
      case GLOBE_MODES.FLIGHTS:
        return {
          title: 'Global Flight Routes',
          description: 'Major international flight corridors',
          stats: [`${data.flights?.length || 0} routes displayed`, 'Hub, Regional & Long-haul flights', 'Real-time aviation traffic']
        };
      case GLOBE_MODES.SATELLITES:
        return {
          title: 'Satellite Tracking',
          description: 'Low Earth orbit satellite constellation',
          stats: [`${data.satellites?.length || 0} satellites tracked`, 'ISS, GPS, Communication & Weather', 'Orbital mechanics visualization']
        };
      case GLOBE_MODES.WEATHER:
        return {
          title: 'Weather Patterns',
          description: 'Global temperature distribution',
          stats: [`${data.weather?.length || 0} weather stations`, 'Real-time temperature data', 'Climate pattern analysis']
        };
      case GLOBE_MODES.CABLES:
        return {
          title: 'Submarine Cables',
          description: 'Underwater internet infrastructure',
          stats: [`${data.cables?.length || 0} cable systems`, 'Intercontinental connections', 'Global data backbone']
        };
      case GLOBE_MODES.CLOUDS:
        return {
          title: 'Cloud Cover',
          description: 'Animated atmospheric layer',
          stats: [`${data.clouds?.length || 0} cloud particles`, 'Procedural generation', 'Real-time animation']
        };
      case GLOBE_MODES.INTERACTIVE:
        return {
          title: 'Interactive Explorer',
          description: 'Click to create connections',
          stats: ['Click anywhere on Earth', 'Animated arc connections', 'Propagating ring effects']
        };
      default:
        return { title: 'Global Intelligence Platform', description: 'Select a visualization mode', stats: [] };
    }
  };

  const info = getModeInfo();

  return (
    <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-lg border border-white/20 rounded-lg p-4 w-80">
      <h3 className="text-white text-lg font-semibold mb-2">{info.title}</h3>
      <p className="text-white/70 text-sm mb-3">{info.description}</p>
      <div className="space-y-1">
        {info.stats.map((stat, index) => (
          <div key={index} className="text-white/60 text-xs">• {stat}</div>
        ))}
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
        <title>Global Intelligence Platform | Environmental Intelligence</title>
        <meta name="description" content="Comprehensive global intelligence platform with multiple interactive visualization modes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
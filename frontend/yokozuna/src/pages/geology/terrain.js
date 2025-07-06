import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const TerrainVisualization = dynamic(
  () => import('../../components/terrain/TerrainVisualization'),
  { ssr: false }
);

const StyleSwitcher = dynamic(
  () => import('../../components/terrain/StyleSwitcher'),
  { ssr: false }
);

// Sample landmark data based on the documentation
const DEFAULT_LANDMARKS = [
  {
    id: 'glacier',
    name: "Glacier d'Argentière",
    coordinates: { latitude: 45.984111, longitude: 6.927566, altitude: 1280.0 },
    model_path: '/models/landmarks/glacier.gltf',
    scale: { x: 1.0, y: 1.0, z: 1.0 },
    rotation: { x: 90.0, y: 177.0, z: 0.0 },
    shadow_casting: true,
    tooltip: "Glacier d'Argentière - Alpine Environment"
  },
  {
    id: 'eiffel',
    name: 'Eiffel Tower',
    coordinates: { latitude: 48.857475, longitude: 2.294514, altitude: 0.0 },
    model_path: '/models/landmarks/eiffel.glb',
    scale: { x: 5621.06, y: 6480.4, z: 5621.06 },
    rotation: { x: 0.0, y: 0.0, z: 45.7 },
    shadow_casting: true,
    tooltip: 'Eiffel Tower - Urban Environment'
  },
  {
    id: 'liberty',
    name: 'Statue of Liberty',
    coordinates: { latitude: 40.689254, longitude: -74.0445322, altitude: 45.0 },
    model_path: '/models/landmarks/LibertyStatue.glb',
    scale: { x: 153.0, y: 157.294, z: 155.0 },
    rotation: { x: 0.0, y: 0.0, z: -147.0 },
    shadow_casting: true,
    tooltip: 'Statue of Liberty - Coastal Environment'
  },
];

const DEFAULT_MAP_STYLES = [
  {
    id: 'satellite',
    name: 'Satellite',
    mapbox_style_url: 'mapbox://styles/mapbox/satellite-v9',
    terrain_enabled: true,
    satellite_opacity: 1.0,
  },
  {
    id: 'streets',
    name: 'Streets',
    mapbox_style_url: 'mapbox://styles/mapbox/streets-v11',
    terrain_enabled: false,
    satellite_opacity: 0.0,
  },
  {
    id: 'dark',
    name: 'Dark',
    mapbox_style_url: 'mapbox://styles/mapbox/dark-v10',
    terrain_enabled: false,
    satellite_opacity: 0.0,
  },
];

const TerrainPage = () => {
  const [landmarks, setLandmarks] = useState(DEFAULT_LANDMARKS);
  const [currentLocation, setCurrentLocation] = useState('glacier');
  const [sunlightTime, setSunlightTime] = useState(43200); // 12:00 PM
  const [mapStyle, setMapStyle] = useState('satellite');
  const [mapStyles, setMapStyles] = useState(DEFAULT_MAP_STYLES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading terrain data...');
        
        // Load data from the WASM terrain engine
        const { TerrainVisualizationEngine } = await import('../../wasm/terrain_engine');
        const engine = new TerrainVisualizationEngine();
        await engine.initialize();
        
        // Get landmarks and map styles from the engine
        const landmarksData = await engine.get_landmarks();
        const stylesData = engine.get_map_styles();
        
        setLandmarks(landmarksData);
        setMapStyles(stylesData);
        setIsLoading(false);
        
        console.log('Terrain data loaded successfully');
      } catch (error) {
        console.error('Failed to load terrain data:', error);
        // Fall back to default data if WASM loading fails
        setLandmarks(DEFAULT_LANDMARKS);
        setMapStyles(DEFAULT_MAP_STYLES);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleLocationChange = (locationId) => {
    setCurrentLocation(locationId);
    console.log('Location changed to:', locationId);
  };

  const handleTimeChange = (time) => {
    setSunlightTime(time);
    console.log('Time changed to:', time);
  };

  const handleStyleChange = (styleId) => {
    setMapStyle(styleId);
    console.log('Map style changed to:', styleId);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">
          Loading Environmental Intelligence System...
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Terrain & Landmarks - Environmental Intelligence</title>
        <meta name="description" content="3D terrain visualization with environmental landmarks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="w-full h-screen relative">
        <TerrainVisualization
          landmarks={landmarks}
          currentLocation={currentLocation}
          enableTerrain={true}
          enableSunlight={true}
          sunlightTime={sunlightTime}
          mapStyle={mapStyle}
          onLocationChange={handleLocationChange}
          onTimeChange={handleTimeChange}
        />
        
        <StyleSwitcher
          styles={mapStyles}
          currentStyle={mapStyle}
          onStyleChange={handleStyleChange}
        />
        
        {/* Additional Info Panel */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="text-lg font-bold mb-2">Environmental Intelligence</h3>
          <p className="text-sm text-gray-700 mb-2">
            Explore landmarks with real-time environmental data and sunlight simulation.
          </p>
          <div className="text-xs text-gray-600">
            <div>Current Location: {landmarks.find(l => l.id === currentLocation)?.name}</div>
            <div>Map Style: {mapStyles.find(s => s.id === mapStyle)?.name}</div>
            <div>Time: {new Date(sunlightTime * 1000).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TerrainPage; 
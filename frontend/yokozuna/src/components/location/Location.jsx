'use client'
import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TransitionEffect from '@/components/TransitionEffect';


// Mapbox imports
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Three.js geo component placeholder
const ThreeGeoInstance = ({ locationData, className = "" }) => {
const mountRef = useRef(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  // TODO: Initialize Three.js scene here with locationData
  // This is where you'll add your three-geo instance
  console.log('Three.js geo instance initializing with:', locationData);
  
  // Simulate loading
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 2000);
  
  // Cleanup function
  return () => {
    clearTimeout(timer);
    // TODO: Cleanup Three.js scene
    console.log('Three.js cleanup');
  };
}, [locationData]);

return (
  <div 
    ref={mountRef}
    className={`bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl ${className}`}
  >
    <div className="flex flex-col items-center justify-center h-full text-white text-sm p-4">
      {isLoading ? (
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-3 animate-spin border-t-2 border-white"></div>
            <p className="font-medium">Three.js Geo</p>
            <p className="text-xs opacity-75 mt-1">Initializing 3D View...</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            🌍
          </div>
          <p className="font-medium">Three.js Geo</p>
          <p className="text-xs opacity-75 mt-1">Ready for 3D terrain</p>
          {locationData && (
            <div className="mt-2 text-xs opacity-60">
              <p>{locationData.name}</p>
              <p>{locationData.coordinates[1].toFixed(2)}, {locationData.coordinates[0].toFixed(2)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
};

// Map component wrapper for search params
const MapContent = () => {
const mapContainer = useRef(null);
const map = useRef(null);
const searchParams = useSearchParams();
const router = useRouter();
const [isLoading, setIsLoading] = useState(true);
const [mapError, setMapError] = useState(null);
const [locationInfo, setLocationInfo] = useState(null);

// Get location data from URL params
const lat = searchParams.get('lat');
const lng = searchParams.get('lng');
const location = searchParams.get('location');

useEffect(() => {
  // Set location info from URL params
  if (lat && lng && location) {
    setLocationInfo({
      coordinates: [parseFloat(lng), parseFloat(lat)],
      name: decodeURIComponent(location),
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    });
  } else {
    // Redirect to home if no location data
    router.push('/');
  }
}, [lat, lng, location, router]);

useEffect(() => {
  if (!mapContainer.current || map.current || !locationInfo) return;

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  
  if (!accessToken) {
    setMapError('Mapbox access token not found. Please check your environment variables.');
    setIsLoading(false);
    return;
  }

  try {
    mapboxgl.accessToken = accessToken;

    // Initialize map with 3D terrain support
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: locationInfo.coordinates,
      zoom: 12,
      pitch: 65, // 3D perspective
      bearing: -20,
      antialias: true,
      // Enable terrain
      terrain: { source: 'mapbox-dem', exaggeration: 2 }
    });

    map.current.on('load', () => {
      // Add terrain source
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });

      // Add terrain layer
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 2 });

      // Add atmospheric fog
      map.current.setFog({
        color: 'rgb(186, 210, 235)', // Light blue
        'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });

      // Add sky layer
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      // Add location marker
      const marker = new mapboxgl.Marker({
        color: '#FF6B6B',
        scale: 1.5
      })
        .setLngLat(locationInfo.coordinates)
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            className: 'custom-popup'
          })
            .setHTML(`
              <div class="p-3">
                <h3 class="font-bold text-base mb-2 text-gray-800">${locationInfo.name}</h3>
                <div class="text-sm text-gray-600 space-y-1">
                  <p><strong>Latitude:</strong> ${locationInfo.lat.toFixed(6)}</p>
                  <p><strong>Longitude:</strong> ${locationInfo.lng.toFixed(6)}</p>
                </div>
                <div class="mt-3 flex gap-2">
                  <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                    Weather
                  </button>
                  <button class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                    Analysis
                  </button>
                </div>
              </div>
            `)
        )
        .addTo(map.current);

      // Dramatic fly-to animation
      map.current.flyTo({
        center: locationInfo.coordinates,
        zoom: 15,
        pitch: 75,
        bearing: 30,
        duration: 4000,
        essential: true
      });

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }), 'bottom-left');

      setIsLoading(false);
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
      setMapError('Failed to load map. Please try again.');
      setIsLoading(false);
    });

  } catch (error) {
    console.error('Error initializing map:', error);
    setMapError('Failed to initialize map. Please check your connection.');
    setIsLoading(false);
  }

  // Cleanup
  return () => {
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  };
}, [locationInfo]);

if (mapError) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md">
        <div className="text-red-500 text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Map Loading Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {mapError}
        </p>
        <div className="space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
          <Link 
            href="/"
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="relative w-full h-screen bg-gray-900">
    {/* Loading overlay */}
    {isLoading && (
      <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Loading 3D Terrain</h2>
          {locationInfo && (
            <p className="text-lg opacity-75">
              Preparing view for <span className="font-medium">{locationInfo.name}</span>
            </p>
          )}
          <div className="mt-4 text-sm opacity-60">
            <p>• Loading satellite imagery</p>
            <p>• Processing terrain data</p>
            <p>• Initializing 3D view</p>
          </div>
        </div>
      </div>
    )}

    {/* Main map container */}
    <div 
      ref={mapContainer} 
      className="w-full h-full"
    />

    {/* Back to home button */}
    <div className="absolute top-4 left-4 z-10">
      <Link 
        href="/"
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <ArrowLeft size={16} />
        <span className="font-medium">Back to Search</span>
      </Link>
    </div>

    {/* Three.js geo instance - top right corner */}
    <div className="absolute top-4 right-4 z-10">
      <ThreeGeoInstance 
        locationData={locationInfo}
        className="w-72 h-56" 
      />
    </div>

    {/* Location info panel - bottom left */}
    {locationInfo && !isLoading && (
      <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">
          {locationInfo.name}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Latitude:</span> 
            <span className="font-mono">{locationInfo.lat.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Longitude:</span> 
            <span className="font-mono">{locationInfo.lng.toFixed(6)}</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium">
            Weather Data
          </button>
          <button className="px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium">
            Terrain Analysis
          </button>
          <button className="px-3 py-2 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors font-medium">
            Agriculture
          </button>
          <button className="px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium">
            Climate
          </button>
        </div>
      </div>
    )}

    {/* Map controls help */}
    <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg">
      <div className="space-y-1">
        <p>🖱️ <span className="font-medium">Drag:</span> Pan map</p>
        <p>⚡ <span className="font-medium">Scroll:</span> Zoom in/out</p>
        <p>🔄 <span className="font-medium">Ctrl+Drag:</span> Rotate & tilt</p>
        <p>🎯 <span className="font-medium">Shift+Drag:</span> Box zoom</p>
      </div>
    </div>

    {/* Custom popup styles */}
    <style jsx global>{`
      .custom-popup .mapboxgl-popup-content {
        padding: 0;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      }
      .custom-popup .mapboxgl-popup-tip {
        border-top-color: white;
      }
    `}</style>
  </div>
);
};

// Main Map Page Component
const MapPage = () => {
return (
  <>
    <Head>
      <title>3D Terrain Map - Buhera West</title>
      <meta
        name="description"
        content="Interactive 3D terrain map with weather analysis for Southern Africa"
      />
    </Head>

    <TransitionEffect />
    
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading map...</p>
        </div>
      </div>
    }>
      <MapContent />
    </Suspense>
  </>
);
};

export default MapPage;
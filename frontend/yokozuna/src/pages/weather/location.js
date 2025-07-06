'use client'
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, MapPin, Settings, Maximize2, Minimize2, Grid3X3, Monitor } from 'lucide-react';
import TransitionEffect from '@/components/TransitionEffect';
import dynamic from 'next/dynamic';

// Dynamically import heavy 3D components
const TerrainBox = dynamic(() => import('@/components/location/TerrainBox'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
        <p className="text-sm">Loading 3D Terrain...</p>
      </div>
    </div>
  )
});

const GlobeBox = dynamic(() => import('@/components/location/GlobeBox'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
        <p className="text-xs">Loading Globe...</p>
      </div>
    </div>
  )
});

const Dashboard = dynamic(() => import('@/components/location/Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 dark:border-gray-400 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading Dashboard...</p>
      </div>
    </div>
  )
});

// Weather data simulation
const generateWeatherData = (lat, lng) => {
  const baseTemp = 20 + Math.sin(lat * Math.PI / 180) * 10;
  return {
    temperature: Math.round(baseTemp + (Math.random() - 0.5) * 10),
    humidity: Math.round(60 + (Math.random() - 0.5) * 40),
    windSpeed: Math.round(5 + Math.random() * 15),
    pressure: Math.round(1013 + (Math.random() - 0.5) * 20),
    visibility: Math.round(10 + Math.random() * 15),
    uvIndex: Math.round(3 + Math.random() * 8),
    precipitation: Math.round(Math.random() * 100),
    cloudCover: Math.round(Math.random() * 100)
  };
};

const MainLayoutContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [locationData, setLocationData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState({
    terrain: false,
    globe: false,
    dashboard: false
  });
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' or 'focus'

  // Get location data from URL params
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const location = searchParams.get('location');

  useEffect(() => {
    if (lat && lng && location) {
      try {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        
        // Validate coordinates
        if (isNaN(parsedLat) || isNaN(parsedLng) || 
            parsedLat < -90 || parsedLat > 90 || 
            parsedLng < -180 || parsedLng > 180) {
          throw new Error('Invalid coordinates');
        }
        
        const locationInfo = {
          coordinates: [parsedLng, parsedLat],
          name: decodeURIComponent(location),
          lat: parsedLat,
          lng: parsedLng
        };
        setLocationData(locationInfo);
        setWeatherData(generateWeatherData(parsedLat, parsedLng));
      } catch (error) {
        console.error('Invalid location data:', error);
        router.push('/');
      }
    } else {
      // Redirect to home if no location data
      router.push('/');
    }
  }, [lat, lng, location, router]);

  const toggleFullscreen = (component) => {
    setIsFullscreen(prev => ({
      terrain: false,
      globe: false,
      dashboard: false,
      [component]: !prev[component]
    }));
  };

  const resetFullscreen = () => {
    setIsFullscreen({
      terrain: false,
      globe: false,
      dashboard: false
    });
  };

  if (!locationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading location data...</p>
        </div>
      </div>
    );
  }

  const isAnyFullscreen = Object.values(isFullscreen).some(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="font-medium">Back to Search</span>
              </Link>
              
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin size={16} />
                <div>
                  <span className="font-medium">{locationData.name}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {locationData.lat.toFixed(4)}, {locationData.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isAnyFullscreen && (
                <button 
                  onClick={resetFullscreen}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Exit Fullscreen
                </button>
              )}
              
              <button 
                onClick={() => setLayoutMode(layoutMode === 'grid' ? 'focus' : 'grid')}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle Layout Mode"
              >
                {layoutMode === 'grid' ? <Monitor size={16} /> : <Grid3X3 size={16} />}
              </button>
              
              <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Fullscreen Mode */}
        {isAnyFullscreen && (
          <div className="fixed inset-4 z-40 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            {isFullscreen.terrain && (
              <TerrainBox 
                locationData={locationData}
                className="w-full h-full"
                width={typeof window !== 'undefined' ? window.innerWidth - 32 : 800}
                height={typeof window !== 'undefined' ? window.innerHeight - 120 : 600}
              />
            )}
            {isFullscreen.globe && (
              <GlobeBox 
                locationData={locationData}
                className="w-full h-full"
                width={typeof window !== 'undefined' ? window.innerWidth - 32 : 800}
                height={typeof window !== 'undefined' ? window.innerHeight - 120 : 600}
              />
            )}
            {isFullscreen.dashboard && (
              <Dashboard 
                locationData={locationData}
                weatherData={weatherData}
                className="w-full h-full"
              />
            )}
          </div>
        )}

        {/* Grid Layout Mode */}
        {!isAnyFullscreen && (
          <div className={`grid gap-4 h-[calc(100vh-120px)] ${
            layoutMode === 'grid' 
              ? 'grid-cols-12 grid-rows-12' 
              : 'grid-cols-1 grid-rows-3'
          }`}>
            
            {/* Three-Geo Terrain Component */}
            <div className={`${
              layoutMode === 'grid' 
                ? 'col-span-4 row-span-6' 
                : 'row-span-1'
            } relative group`}>
              <div className="w-full h-full relative">
                <TerrainBox 
                  locationData={locationData}
                  className="w-full h-full"
                  width={layoutMode === 'grid' ? 400 : 800}
                  height={layoutMode === 'grid' ? 300 : 250}
                />
                
                {/* Component Controls */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleFullscreen('terrain')}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
                
                {/* Component Label */}
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                  🏔️ 3D Terrain (three-geo)
                </div>
              </div>
            </div>

            {/* Dashboard Component */}
            <div className={`${
              layoutMode === 'grid' 
                ? 'col-span-4 row-span-12' 
                : 'row-span-1'
            } relative group`}>
              <div className="w-full h-full relative">
                <Dashboard 
                  locationData={locationData}
                  weatherData={weatherData}
                  className="w-full h-full"
                />
                
                {/* Component Controls */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => toggleFullscreen('dashboard')}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
                
                {/* Component Label */}
                <div className="absolute top-2 left-2 bg-blue-600/80 text-white px-2 py-1 rounded text-xs font-medium z-10">
                  📊 Weather Dashboard
                </div>
              </div>
            </div>

            {/* Globe Component */}
            <div className={`${
              layoutMode === 'grid' 
                ? 'col-span-4 row-span-6 row-start-7' 
                : 'row-span-1'
            } relative group`}>
              <div className="w-full h-full relative">
                <GlobeBox 
                  locationData={locationData}
                  className="w-full h-full"
                  width={layoutMode === 'grid' ? 400 : 800}
                  height={layoutMode === 'grid' ? 300 : 250}
                />
                
                {/* Component Controls */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleFullscreen('globe')}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
                
                {/* Component Label */}
                <div className="absolute top-2 left-2 bg-green-600/80 text-white px-2 py-1 rounded text-xs font-medium">
                  🌍 Global View
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Floating Info Panel */}
      {!isAnyFullscreen && (
        <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Monitor size={16} />
            Layout Information
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Current Mode:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{layoutMode}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Components:</span>
              <span className="font-medium text-gray-900 dark:text-white">3</span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                {locationData.name}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>💡 <strong>Tip:</strong> Hover over components for controls</p>
              <p>🔍 <strong>Click</strong> fullscreen to focus on one component</p>
              <p>📱 <strong>Toggle</strong> layout mode for different views</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for Initial Load */}
      {!locationData && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Initializing Dashboard
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading location data and weather information...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component with Suspense wrapper
const Location = () => {
  return (
    <>
      <Head>
        <title>Advanced Weather Analysis Dashboard - Buhera West</title>
        <meta
          name="description"
          content="Advanced 3D terrain visualization with three-geo, global view, and comprehensive weather dashboard for Southern Africa"
        />
      </Head>

      <TransitionEffect />
      
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading advanced dashboard...</p>
          </div>
        </div>
      }>
        <MainLayoutContent />
      </Suspense>
    </>
  );
};

export default Location;
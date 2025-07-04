import React, { useState, useEffect } from 'react';
import AnimatedText from "@/components/AnimatedText";
import Head from "next/head";
import TransitionEffect from "@/components/TransitionEffect";

import WeatherOverlay from '@/components/weather/WeatherOverlay';
import WeatherDetails from '@/components/weather/WeatherDetails';
import FadeTransition from '@/components/weather/FadeTransition';
import TimeControls from '@/components/weather/TimeControls';
import weatherService from '@/services/weatherService';
import AIAssistant from '@/components/ai/AIAssistant';
import { QuickExplain } from '@/components/ai/AITooltip';
import GeocoderSearch from '@/components/location/GeocoderSearch';
import dynamic from 'next/dynamic';


// Dynamic import to prevent SSR issues with react-globe.gl
const WeatherGlobeDynamic = dynamic(() => import('@/components/weather/WeatherGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-b from-blue-900 to-green-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Loading Interactive Globe...</p>
        <p className="text-sm opacity-75">Connecting to weather networks worldwide • Analyzing atmospheric conditions • Preparing interactive globe</p>
      </div>
    </div>
  )
});

export default function Home() {
  // Application state
  const [isLoading, setIsLoading] = useState(true);
  const [globalWeatherData, setGlobalWeatherData] = useState([]);
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [selectedWeatherData, setSelectedWeatherData] = useState(null);
  const [selectedWeatherType, setSelectedWeatherType] = useState('all');
  const [topLocations, setTopLocations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [appStarted, setAppStarted] = useState(false);

  // Time controls state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTimePlayback, setIsTimePlayback] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [timeControlsEnabled, setTimeControlsEnabled] = useState(
    process.env.NEXT_PUBLIC_ENABLE_TIME_CONTROLS === 'true'
  );

  // Initialize the application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Load global weather data
        const globalData = await weatherService.getGlobalWeatherData();
        setGlobalWeatherData(globalData);
        
        // Load notable weather locations
        const notable = await weatherService.getNotableWeather();
        setTopLocations(notable);
        
        setLastUpdated(new Date());
        
        // Simulate initial loading time for better UX
        setTimeout(() => {
          setIsLoading(false);
          setAppStarted(true);
        }, 2000);
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
        setAppStarted(true);
      }
    };

    initializeApp();
  }, []);

  // Handle location search from Mapbox Geocoder (with autocomplete)
  const handleLocationSelect = async (locationData) => {
    try {
      console.log('Location selected from geocoder:', locationData);
      
      const { coordinates, placeName } = locationData;
      const lat = coordinates.lat;
      const lng = coordinates.lng;
      
      // Get weather data for the selected location
      const weather = await weatherService.getCurrentWeather(lat, lng);
      const forecast = await weatherService.getForecast(lat, lng);
      
      const location = {
        lat: lat,
        lng: lng,
        name: placeName.split(',')[0], // Get the primary place name
        country: weather.country || ''
      };
      
      console.log('Weather data retrieved for location:', location);
      
      setFocusedLocation(location);
      setSelectedWeatherData({
        ...weather,
        ...forecast,
        displayName: placeName
      });
      
      console.log('✅ Location search successful:', placeName);
      
    } catch (error) {
      console.error('Failed to get weather for selected location:', error);
      
      // Show user-friendly error message
      if (error.message.includes('API key')) {
        alert('Weather service configuration issue. Please check your API keys.');
      } else {
        alert('Failed to get weather data for this location. Please try again.');
      }
    }
  };

  // Handle manual search input (for coordinates or fallback)
  const handleManualSearch = async (query) => {
    try {
      console.log('Manual search for:', query);
      
      // This handles coordinate input that bypasses the geocoder
      const searchResult = await weatherService.searchWeather(query);
      
      const location = {
        lat: searchResult.lat,
        lng: searchResult.lng,
        name: searchResult.name || 'Unknown Location',
        country: searchResult.country || ''
      };
      
      console.log('Manual search result:', location);
      
      setFocusedLocation(location);
      setSelectedWeatherData(searchResult);
      
      if (searchResult.coordinateSearch) {
        console.log('✅ Coordinate search successful:', searchResult.displayName);
      }
      
    } catch (error) {
      console.error('Manual search failed:', error);
      
      if (error.message.includes('Invalid coordinates')) {
        alert(`Invalid coordinates. Please use one of these formats:
        
• Latitude, Longitude: "-18.2436, 31.5781" (Google Maps style)
• Longitude, Latitude: "31.5781, -18.2436" (Mapbox style)

The system will automatically detect the format.

Examples for Buhera West:
• -18.2436, 31.5781 (lat, lng)
• 31.5781, -18.2436 (lng, lat)`);
      } else if (error.message.includes('API key')) {
        alert('Weather service configuration issue. Please check your API keys.');
      } else {
        alert('Location not found. Try searching for a city name or coordinates.');
      }
    }
  };

  // Handle location click on globe
  const handleLocationClick = async (location) => {
    try {
      if (location.isManualClick) {
        // User clicked on globe, get weather for those coordinates
        const weather = await weatherService.getCurrentWeather(location.lat, location.lng);
        const forecast = await weatherService.getForecast(location.lat, location.lng);
        const locationInfo = await weatherService.reverseGeocode(location.lat, location.lng);
        
        const focusLocation = {
          lat: location.lat,
          lng: location.lng,
          name: locationInfo?.name || 'Unknown Location',
          country: locationInfo?.country || ''
        };
        
        setFocusedLocation(focusLocation);
        setSelectedWeatherData({
          ...weather,
          ...forecast,
          displayName: locationInfo?.displayName
        });
      } else {
        // User clicked on existing weather marker
        const weather = await weatherService.getCurrentWeather(location.lat, location.lng);
        const forecast = await weatherService.getForecast(location.lat, location.lng);
        
        setFocusedLocation(location);
        setSelectedWeatherData({
          ...weather,
          ...forecast
        });
      }
    } catch (error) {
      console.error('Failed to get location weather:', error);
    }
  };

  // Handle weather type filter change
  const handleWeatherTypeChange = (weatherType) => {
    setSelectedWeatherType(weatherType);
  };

  // Handle back to globe
  const handleBackToGlobe = () => {
    setFocusedLocation(null);
    setSelectedWeatherData(null);
  };

  // Handle random location
  const handleRandomLocation = async () => {
    const randomIndex = Math.floor(Math.random() * globalWeatherData.length);
    const randomLocation = globalWeatherData[randomIndex];
    if (randomLocation) {
      await handleLocationClick(randomLocation);
    }
  };

  // Handle top location selection (now uses the same handler as geocoder)
  // The WeatherOverlay component handles the format conversion

  // Time control handlers
  const handleTimeChange = (newTime) => {
    setCurrentTime(newTime);
    // TODO: Fetch historical weather data for the selected time
    console.log('Time changed to:', newTime);
  };

  const handleTimePlayToggle = (isPlaying) => {
    setIsTimePlayback(isPlaying);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  // Filter weather data based on selected type
  const filteredWeatherData = globalWeatherData.filter(location => {
    if (selectedWeatherType === 'all') return true;
    return location.weather && location.weather.toLowerCase().includes(selectedWeatherType);
  });

  return (
    <>
      <Head>
        <title>Buhera West - Global Weather Intelligence</title>
        <meta
          name="description"
          content="Interactive global weather visualization platform. Real-time weather data, forecasting, and climate analysis powered by advanced weather intelligence systems. Supports coordinate search and temporal analysis."
        />
        <meta property="og:title" content="Buhera West - Global Weather Intelligence" />
        <meta property="og:description" content="Explore real-time weather patterns across the globe with our interactive 3D weather visualization platform. Search by coordinates or location names." />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://api.openweathermap.org" />
      </Head>

      <TransitionEffect />
      
      {/* Loading Screen */}
      <FadeTransition 
        show={isLoading} 
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        animationDuration={1000}
      >
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="animate-spin w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <AnimatedText 
              text="Loading Global Weather Intelligence..."
              className="text-xl font-light"
            />
          </div>
          <div className="text-sm text-gray-400 max-w-md mx-auto">
            Connecting to weather networks worldwide • Analyzing atmospheric conditions • Preparing interactive globe
          </div>
        </div>
      </FadeTransition>

      {/* Main Application */}
      <FadeTransition 
        show={appStarted && !isLoading}
        className="relative w-full h-screen overflow-hidden"
        animationDuration={1500}
      >
        {/* Globe Component */}
        <WeatherGlobeDynamic
          weatherData={filteredWeatherData}
          focusedLocation={focusedLocation}
          onLocationClick={handleLocationClick}
          isLoading={isLoading}
          currentTime={currentTime}
        />

        {/* Overlay Panel (Right side - when no location selected) */}
        <WeatherOverlay
          show={appStarted && !focusedLocation}
          onLocationSelect={handleLocationSelect}
          onManualSearch={handleManualSearch}
          onWeatherTypeChange={handleWeatherTypeChange}
          selectedWeatherType={selectedWeatherType}
          topLocations={topLocations}
          lastUpdated={lastUpdated}
        />

        {/* Details Panel (Right side - when location selected) */}
        <WeatherDetails
          location={focusedLocation}
          weatherData={selectedWeatherData}
          onBack={handleBackToGlobe}
          onRandomLocation={handleRandomLocation}
          currentTime={currentTime}
        />

        {/* Time Controls Panel (Left side - bottom) */}
        {timeControlsEnabled && (
          <div className="fixed bottom-4 left-4 z-30">
            <TimeControls
              currentTime={currentTime}
              onTimeChange={handleTimeChange}
              isPlaying={isTimePlayback}
              onPlayToggle={handleTimePlayToggle}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              playbackSpeed={playbackSpeed}
              onSpeedChange={handleSpeedChange}
              enabled={timeControlsEnabled}
              className="w-80"
            />
          </div>
        )}

        {/* Footer Attribution */}
        <div className="fixed bottom-4 left-4 text-white text-xs opacity-50 z-30" style={{ 
          marginBottom: timeControlsEnabled ? '320px' : '0px' 
        }}>
          <div>Weather data: OpenWeatherMap</div>
          <div>Globe visualization: React Globe GL</div>
          <div>Search: Mapbox Geocoder with smart coordinate detection</div>
        </div>

        {/* Performance Indicator */}
        {globalWeatherData.length > 0 && (
          <div className="fixed top-4 left-4 text-white text-xs bg-black bg-opacity-50 px-3 py-2 rounded-lg z-30">
            <QuickExplain 
              dataKey="Data Points" 
              dataValue={`${globalWeatherData.length} total, ${filteredWeatherData.length} visible`}
              dataContext={{ 
                explanation: "Number of weather monitoring stations and visible data points on the globe",
                weatherFilter: selectedWeatherType,
                timeControlsEnabled: timeControlsEnabled,
                currentTime: currentTime.toISOString()
              }}
            >
              {globalWeatherData.length} locations • {filteredWeatherData.length} visible
            </QuickExplain>
            {timeControlsEnabled && (
              <div className="mt-1 text-gray-400">
                Time: {currentTime.toLocaleString([], { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            )}
          </div>
        )}

        {/* Smart Search Help */}
        <div className="fixed top-4 right-4 text-white text-xs bg-black bg-opacity-50 px-3 py-2 rounded-lg z-30 max-w-xs">
          <div className="font-semibold mb-1">🔍 Smart Search:</div>
          <div>• Autocomplete: Start typing "Har..." → "Harare, Zimbabwe"</div>
          <div>• Coordinates: "-18.2436, 31.5781" (any format)</div>
          <div>• No format confusion - system auto-detects!</div>
        </div>

        {/* AI Assistant */}
        <AIAssistant 
          weatherData={{
            globalData: globalWeatherData,
            filteredData: filteredWeatherData,
            selectedLocation: focusedLocation,
            selectedWeather: selectedWeatherData,
            weatherFilter: selectedWeatherType,
            lastUpdated: lastUpdated,
            currentTime: currentTime,
            timeControlsEnabled: timeControlsEnabled,
            coordinateSearchEnabled: true
          }}
          position="bottom-right"
        />
      </FadeTransition>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import Head from "next/head";
import TransitionEffect from "@/components/TransitionEffect";
import WeatherGlobe from '@/components/weather/WeatherGlobe';
import WeatherOverlay from '@/components/weather/WeatherOverlay';
import WeatherDetails from '@/components/weather/WeatherDetails';
import FadeTransition from '@/components/weather/FadeTransition';
import weatherService from '@/services/weatherService';
import AIAssistant from '@/components/ai/AIAssistant';
import AITooltip, { QuickExplain, SmartTimestamp } from '@/components/ai/AITooltip';

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

  // Handle location search
  const handleLocationSearch = async (query) => {
    try {
      const searchResult = await weatherService.searchWeather(query);
      const location = {
        lat: searchResult.lat,
        lng: searchResult.lng,
        name: searchResult.name,
        country: searchResult.country
      };
      
      setFocusedLocation(location);
      setSelectedWeatherData(searchResult);
    } catch (error) {
      console.error('Search failed:', error);
      // You could add a toast notification here
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

  // Handle top location selection
  const handleTopLocationSelect = async (location) => {
    await handleLocationClick(location);
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
          content="Interactive global weather visualization platform. Real-time weather data, forecasting, and climate analysis powered by advanced weather intelligence systems."
        />
        <meta property="og:title" content="Buhera West - Global Weather Intelligence" />
        <meta property="og:description" content="Explore real-time weather patterns across the globe with our interactive 3D weather visualization platform." />
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
        <WeatherGlobe
          weatherData={filteredWeatherData}
          focusedLocation={focusedLocation}
          onLocationClick={handleLocationClick}
          isLoading={isLoading}
        />

        {/* Overlay Panel (Right side - when no location selected) */}
        <WeatherOverlay
          show={appStarted && !focusedLocation}
          onLocationSearch={handleLocationSearch}
          onWeatherTypeChange={handleWeatherTypeChange}
          selectedWeatherType={selectedWeatherType}
          topLocations={topLocations}
          onLocationSelect={handleTopLocationSelect}
          lastUpdated={lastUpdated}
        />

        {/* Details Panel (Right side - when location selected) */}
        <WeatherDetails
          location={focusedLocation}
          weatherData={selectedWeatherData}
          onBack={handleBackToGlobe}
          onRandomLocation={handleRandomLocation}
        />

        {/* Footer Attribution */}
        <div className="fixed bottom-4 left-4 text-white text-xs opacity-50 z-30">
          <div>Weather data: OpenWeatherMap</div>
          <div>Globe visualization: React Globe GL</div>
        </div>

        {/* Performance Indicator */}
        {globalWeatherData.length > 0 && (
          <div className="fixed top-4 left-4 text-white text-xs bg-black bg-opacity-50 px-3 py-2 rounded-lg z-30">
            <AITooltip 
              dataKey="Data Points" 
              dataValue={`${globalWeatherData.length} total, ${filteredWeatherData.length} visible`}
              dataContext={{ 
                explanation: "Number of weather monitoring stations and visible data points on the globe",
                weatherFilter: selectedWeatherType 
              }}
            >
              {globalWeatherData.length} locations • {filteredWeatherData.length} visible
            </AITooltip>
          </div>
        )}

        {/* AI Assistant */}
        <AIAssistant 
          weatherData={{
            globalData: globalWeatherData,
            filteredData: filteredWeatherData,
            selectedLocation: focusedLocation,
            selectedWeather: selectedWeatherData,
            weatherFilter: selectedWeatherType,
            lastUpdated: lastUpdated
          }}
          position="bottom-right"
        />
      </FadeTransition>
    </>
  );
}
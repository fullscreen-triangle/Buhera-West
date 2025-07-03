// Default Buhera West coordinates configuration
// Use these coordinates across all components for consistency

export const DEFAULT_COORDINATES = {
  lat: -19.260799284567543,
  lng: 31.499455719488008,
  latitude: -19.260799284567543,
  longitude: 31.499455719488008,
  altitude: 1247.3,
  accuracy: '±0.5mm',
  datum: 'WGS84',
  zone: '36K'
};

// Real weather data fetching using enhanced weather service
export const getRealWeatherData = async () => {
  try {
    // Dynamic import to avoid circular dependencies
    const { default: enhancedWeatherService } = await import('../services/enhancedWeatherService');
    
    const realWeatherData = await enhancedWeatherService.getComprehensiveWeatherData(
      DEFAULT_COORDINATES.lat,
      DEFAULT_COORDINATES.lng
    );
    
    return {
      temperature: realWeatherData.temperature,
      humidity: realWeatherData.humidity,
      windSpeed: realWeatherData.windSpeed,
      windDirection: realWeatherData.windDirection,
      pressure: realWeatherData.pressure,
      visibility: realWeatherData.visibility / 1000, // Convert to km
      uvIndex: realWeatherData.uvIndex,
      precipitation: 0, // Current precipitation (would need radar data)
      cloudCover: realWeatherData.cloudCover,
      weather: realWeatherData.weather,
      description: realWeatherData.description,
      airQuality: realWeatherData.airQuality,
      feelsLike: realWeatherData.feelsLike,
      sources: realWeatherData.sources,
      timestamp: realWeatherData.timestamp
    };
  } catch (error) {
    console.warn('Real weather data not available, using climate-based fallback:', error);
    return generateClimateBasedWeatherData();
  }
};

// Climate-based weather data generation (realistic fallback)
export const generateClimateBasedWeatherData = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const hourOfDay = currentDate.getHours();
  
  // Southern Africa climate characteristics
  const isWetSeason = currentMonth >= 11 || currentMonth <= 3; // Nov-Mar
  const isDrySeason = currentMonth >= 5 && currentMonth <= 9; // May-Sep
  const seasonalFactor = Math.sin((currentMonth - 1) * Math.PI / 6);
  
  // Realistic temperature for subtropical highland
  const dailyTempCycle = Math.sin((hourOfDay - 6) * Math.PI / 12) * 8; // Peak at 2 PM
  const seasonalTempVariation = seasonalFactor * 6;
  const baseTemp = 19; // Average for Buhera West
  const temperature = Math.round((baseTemp + seasonalTempVariation + dailyTempCycle + (Math.random() - 0.5) * 3) * 10) / 10;
  
  // Humidity patterns
  const baseHumidity = isWetSeason ? 75 : 55;
  const humidityDiurnalCycle = Math.cos((hourOfDay - 6) * Math.PI / 12) * 15;
  const humidity = Math.max(20, Math.min(95, Math.round(baseHumidity + humidityDiurnalCycle + (Math.random() - 0.5) * 10)));
  
  // Atmospheric pressure adjusted for elevation
  const basePressure = 1013 - (DEFAULT_COORDINATES.altitude * 0.12);
  const pressure = Math.round((basePressure + (Math.random() - 0.5) * 5) * 10) / 10;
  
  // Wind patterns (SE trade winds)
  const baseWindSpeed = 12;
  const diurnalWindCycle = Math.sin((hourOfDay - 12) * Math.PI / 12) * 5;
  const windSpeed = Math.max(0, Math.round((baseWindSpeed + diurnalWindCycle + (Math.random() - 0.5) * 6) * 10) / 10);
  const windDirection = Math.round(135 + (Math.random() - 0.5) * 60);
  
  // UV Index
  const maxUV = seasonalFactor > 0 ? 11 : 8;
  const uvCycle = Math.max(0, Math.sin((hourOfDay - 6) * Math.PI / 12));
  const uvIndex = Math.round(maxUV * uvCycle * (0.8 + Math.random() * 0.4) * 10) / 10;
  
  // Cloud cover
  const baseCloudCover = isWetSeason ? 60 : 30;
  const cloudCover = Math.max(0, Math.min(100, Math.round(baseCloudCover + (Math.random() - 0.5) * 30)));
  
  // Precipitation probability
  const precipitationProbability = isWetSeason ? 0.3 : (isDrySeason ? 0.05 : 0.15);
  const precipitation = Math.random() < precipitationProbability ? 
    Math.round(Math.random() * (isWetSeason ? 25 : 5) * 10) / 10 : 0;
  
  return {
    temperature,
    humidity,
    windSpeed,
    windDirection,
    pressure,
    visibility: Math.round(15 + (Math.random() - 0.5) * 5), // km
    uvIndex,
    precipitation,
    cloudCover,
    weather: precipitation > 0 ? 'Rain' : (cloudCover > 70 ? 'Cloudy' : (cloudCover > 30 ? 'Partly Cloudy' : 'Clear')),
    description: `${isWetSeason ? 'Wet' : isDrySeason ? 'Dry' : 'Transition'} season weather`,
    airQuality: { aqi: Math.floor(Math.random() * 3) + 1 }, // Good to moderate
    feelsLike: temperature + (humidity > 80 ? 2 : 0) - (windSpeed > 15 ? 3 : 0),
    sources: { primary: 'Climate Model', supplementary: ['Southern Africa Climate Data'] },
    timestamp: Date.now()
  };
};

// Legacy function for backward compatibility
export const generateDefaultWeatherData = generateClimateBasedWeatherData;

// Geographic display name
export const DEFAULT_LOCATION_NAME = 'Buhera West, Zimbabwe';

// Bounding box for Southern Africa (for geocoder)
export const SOUTHERN_AFRICA_BBOX = [22, -35, 35, -15];
export const SOUTHERN_AFRICA_CENTER = [30, -20]; 
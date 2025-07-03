const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'your_api_key_here';
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'your_mapbox_token_here';

class WeatherService {
  constructor() {
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.geocodingUrl = 'https://api.openweathermap.org/geo/1.0';
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Get cache key for location
  getCacheKey(lat, lng) {
    return `${lat.toFixed(2)},${lng.toFixed(2)}`;
  }

  // Check if cached data is still valid
  isCacheValid(cachedData) {
    return cachedData && (Date.now() - cachedData.timestamp) < this.cacheTimeout;
  }

  // Geocode a location string to coordinates
  async geocodeLocation(query) {
    try {
      const response = await fetch(
        `${this.geocodingUrl}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }
      
      const results = await response.json();
      return results.map(result => ({
        name: result.name,
        country: result.country,
        state: result.state,
        lat: result.lat,
        lng: result.lon,
        displayName: `${result.name}${result.state ? `, ${result.state}` : ''}, ${result.country}`
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  // Reverse geocode coordinates to location name
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `${this.geocodingUrl}/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`);
      }
      
      const results = await response.json();
      if (results.length > 0) {
        const result = results[0];
        return {
          name: result.name,
          country: result.country,
          state: result.state,
          displayName: `${result.name}${result.state ? `, ${result.state}` : ''}, ${result.country}`
        };
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Get current weather for a location
  async getCurrentWeather(lat, lng) {
    const cacheKey = this.getCacheKey(lat, lng);
    const cachedData = this.cache.get(cacheKey);
    
    if (this.isCacheValid(cachedData)) {
      return cachedData.data;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const weatherData = {
        lat,
        lng,
        name: data.name,
        country: data.sys.country,
        current: {
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          visibility: data.visibility,
          wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          wind_deg: data.wind.deg,
          weather: data.weather[0].main,
          weather_description: data.weather[0].description,
          weather_icon: data.weather[0].icon,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset
        },
        timestamp: Date.now()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('Weather API error:', error);
      throw error;
    }
  }

  // Get weather forecast for a location
  async getForecast(lat, lng) {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Forecast API failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        hourly: data.list.slice(0, 24).map(item => ({
          time: item.dt * 1000, // Convert to milliseconds
          temp: Math.round(item.main.temp),
          weather: item.weather[0].main,
          weather_description: item.weather[0].description,
          humidity: item.main.humidity,
          wind_speed: Math.round(item.wind.speed * 3.6)
        })),
        daily: data.list.filter((item, index) => index % 8 === 0).slice(0, 5).map(item => ({
          date: item.dt * 1000,
          temp_max: Math.round(item.main.temp_max),
          temp_min: Math.round(item.main.temp_min),
          weather: item.weather[0].main,
          weather_description: item.weather[0].description
        }))
      };
    } catch (error) {
      console.error('Forecast API error:', error);
      throw error;
    }
  }

  // Get weather data for multiple locations (for globe markers)
  async getGlobalWeatherData() {
    // Major cities around the world for initial globe display
    const majorCities = [
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'London', lat: 51.5074, lng: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
      { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
      { name: 'Moscow', lat: 55.7558, lng: 37.6176 },
      { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
      { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
      { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
      { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
      { name: 'Buenos Aires', lat: -34.6118, lng: -58.3960 },
      { name: 'Harare', lat: -17.8292, lng: 31.0522 }
    ];

    const weatherPromises = majorCities.map(async (city) => {
      try {
        const weather = await this.getCurrentWeather(city.lat, city.lng);
        return {
          ...city,
          ...weather.current,
          weather: weather.current.weather,
          temp: weather.current.temp
        };
      } catch (error) {
        console.error(`Failed to get weather for ${city.name}:`, error);
        return {
          ...city,
          weather: 'unknown',
          temp: 0
        };
      }
    });

    try {
      const results = await Promise.all(weatherPromises);
      return results.filter(result => result.weather !== 'unknown');
    } catch (error) {
      console.error('Failed to get global weather data:', error);
      return [];
    }
  }

  // Get notable weather conditions globally
  async getNotableWeather() {
    const globalData = await this.getGlobalWeatherData();
    
    // Sort by interesting weather conditions
    const notable = globalData
      .filter(location => {
        const weather = location.weather.toLowerCase();
        return weather.includes('storm') || 
               weather.includes('rain') || 
               weather.includes('snow') ||
               Math.abs(location.temp) > 30 || // Very hot or very cold
               location.wind_speed > 20; // High wind
      })
      .sort((a, b) => {
        // Prioritize extreme conditions
        const getScore = (loc) => {
          let score = 0;
          if (loc.weather.toLowerCase().includes('storm')) score += 100;
          if (loc.weather.toLowerCase().includes('snow')) score += 50;
          if (loc.weather.toLowerCase().includes('rain')) score += 30;
          score += Math.abs(loc.temp); // Add temperature extremes
          score += loc.wind_speed; // Add wind speed
          return score;
        };
        return getScore(b) - getScore(a);
      });

    return notable.slice(0, 10); // Return top 10 notable weather conditions
  }

  // Search for weather by location string
  async searchWeather(query) {
    const locations = await this.geocodeLocation(query);
    if (locations.length === 0) {
      throw new Error('No locations found');
    }

    const location = locations[0]; // Use the first result
    const weather = await this.getCurrentWeather(location.lat, location.lng);
    const forecast = await this.getForecast(location.lat, location.lng);

    return {
      ...weather,
      ...forecast,
      displayName: location.displayName
    };
  }
}

// Create and export a singleton instance
const weatherService = new WeatherService();
export default weatherService; 
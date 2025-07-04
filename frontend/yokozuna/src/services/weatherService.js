// Try multiple possible environment variable names
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 
                           process.env.OPENWEATHER_API_KEY || 
                           process.env.NEXT_PUBLIC_OPENWEATHER_KEY ||
                           process.env.OPENWEATHER_KEY ||
                           process.env.WEATHER_API_KEY ||
                           'your_api_key_here';

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 
                           process.env.MAPBOX_ACCESS_TOKEN || 
                           process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
                           process.env.MAPBOX_TOKEN ||
                           'your_mapbox_token_here';

class WeatherService {
  constructor() {
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.geocodingUrl = 'https://api.openweathermap.org/geo/1.0';
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    
    // Check API key availability
    this.hasValidApiKey = OPENWEATHER_API_KEY && 
                         OPENWEATHER_API_KEY !== 'your_api_key_here' && 
                         OPENWEATHER_API_KEY !== 'your_openweather_api_key_here' &&
                         OPENWEATHER_API_KEY !== 'your_api_key_here' &&
                         OPENWEATHER_API_KEY.length > 10; // Basic validation
    
    // TEMPORARY: Let's see what environment variables are actually available
    console.log('=== ENVIRONMENT VARIABLE DEBUG ===');
    console.log('All env vars starting with WEATHER or MAPBOX:');
    Object.keys(process.env).filter(key => 
      key.toLowerCase().includes('weather') || 
      key.toLowerCase().includes('mapbox') ||
      key.toLowerCase().includes('openweather')
    ).forEach(key => {
      console.log(`  ${key}: ${process.env[key] ? process.env[key].substring(0, 10) + '...' : 'undefined'}`);
    });
    console.log('=== END DEBUG ===');
    
    if (!this.hasValidApiKey) {
      console.error('WeatherService: OpenWeather API key not configured properly!');
      console.error('Raw API key value:', OPENWEATHER_API_KEY);
      console.error('API key length:', OPENWEATHER_API_KEY ? OPENWEATHER_API_KEY.length : 'undefined');
      console.error('API key starts with:', OPENWEATHER_API_KEY ? OPENWEATHER_API_KEY.substring(0, 10) + '...' : 'N/A');
      console.error('Validation checks:');
      console.error('  - Exists:', !!OPENWEATHER_API_KEY);
      console.error('  - Not default 1:', OPENWEATHER_API_KEY !== 'your_api_key_here');
      console.error('  - Not default 2:', OPENWEATHER_API_KEY !== 'your_openweather_api_key_here');
      console.error('  - Length > 10:', OPENWEATHER_API_KEY && OPENWEATHER_API_KEY.length > 10);
    } else {
      console.log('WeatherService: OpenWeather API key configured successfully');
      console.log('API key length:', OPENWEATHER_API_KEY.length);
      console.log('API key starts with:', OPENWEATHER_API_KEY.substring(0, 10) + '...');
    }
  }

  // Get cache key for location
  getCacheKey(lat, lng) {
    return `${lat.toFixed(2)},${lng.toFixed(2)}`;
  }

  // Check if cached data is still valid
  isCacheValid(cachedData) {
    return cachedData && (Date.now() - cachedData.timestamp) < this.cacheTimeout;
  }

  // Enhanced search that converts coordinates to location names first
  async searchWeather(query) {
    console.log('WeatherService: Searching for:', query);
    
    if (!this.hasValidApiKey) {
      throw new Error('OpenWeather API key not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your .env.local file.');
    }
    
    // Check if query looks like coordinates - if so, convert to location name first
    const coordPattern = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
    const coordMatch = query.trim().match(coordPattern);
    
    if (coordMatch) {
      const coords = await this.parseAndValidateCoordinates(coordMatch[1], coordMatch[2]);
      
      // Convert coordinates to location name using reverse geocoding
      console.log('WeatherService: Converting coordinates to location name:', coords.lat, coords.lng);
      
      try {
        const locationInfo = await this.reverseGeocode(coords.lat, coords.lng);
        if (locationInfo && locationInfo.name) {
          console.log('WeatherService: Coordinate converted to location:', locationInfo.displayName);
          // Now search by the resolved location name
          return await this.searchByLocationName(locationInfo.name);
        }
      } catch (error) {
        console.warn('WeatherService: Reverse geocoding failed, using coordinates directly:', error);
      }
      
      // Fallback to coordinate search if reverse geocoding fails
      return await this.getWeatherByCoordinates(coords.lat, coords.lng);
    }
    
    // Search by location name (the preferred path)
    return await this.searchByLocationName(query);
  }

  // Helper method to parse and validate coordinates
  async parseAndValidateCoordinates(first, second) {
    let firstNum = parseFloat(first);
    let secondNum = parseFloat(second);
    
    // Validate coordinate ranges
    if (!((firstNum >= -90 && firstNum <= 90 && secondNum >= -180 && secondNum <= 180) || 
          (secondNum >= -90 && secondNum <= 90 && firstNum >= -180 && firstNum <= 180))) {
      throw new Error('Invalid coordinates. Please enter valid latitude and longitude values.');
    }
    
    // Auto-detect coordinate format based on typical ranges
    let lat, lng;
    
    // If first value is clearly latitude (abs value ≤ 90), use lat,lng format
    if (Math.abs(firstNum) <= 90 && Math.abs(secondNum) <= 180) {
      lat = firstNum;
      lng = secondNum;
      console.log('WeatherService: Detected lat,lng format:', lat, lng);
    }
    // If second value is clearly latitude, assume lng,lat format (Mapbox style)
    else if (Math.abs(secondNum) <= 90 && Math.abs(firstNum) <= 180) {
      lat = secondNum;
      lng = firstNum;
      console.log('WeatherService: Detected lng,lat format, converting to lat,lng:', lat, lng);
    }
    // If both could be latitude, use heuristics
    else if (Math.abs(firstNum) <= 90 && Math.abs(secondNum) <= 90) {
      // For Southern Africa region, longitude is typically positive (East)
      // and latitude is typically negative (South)
      if (firstNum < 0 && secondNum > 0) {
        lat = firstNum;
        lng = secondNum;
        console.log('WeatherService: Using Southern Africa heuristic (lat,lng):', lat, lng);
      } else if (secondNum < 0 && firstNum > 0) {
        lat = secondNum;
        lng = firstNum;
        console.log('WeatherService: Using Southern Africa heuristic (lng,lat converted):', lat, lng);
      } else {
        // Default to lat,lng format
        lat = firstNum;
        lng = secondNum;
        console.log('WeatherService: Ambiguous format, defaulting to lat,lng:', lat, lng);
      }
    } else {
      throw new Error('Invalid coordinates. Please check your coordinate format.');
    }
    
    // Final validation
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    } else {
      throw new Error('Invalid coordinates after format detection. Latitude must be between -90 and 90, longitude between -180 and 180.');
    }
  }

  // Get weather data by coordinates
  async getWeatherByCoordinates(lat, lng) {
    if (!this.hasValidApiKey) {
      throw new Error('OpenWeather API key not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your .env.local file.');
    }

    try {
      const weather = await this.getCurrentWeather(lat, lng);
      const forecast = await this.getForecast(lat, lng);
      
      // Try to get location name
      let locationInfo = null;
      try {
        locationInfo = await this.reverseGeocode(lat, lng);
      } catch (error) {
        console.warn('Reverse geocoding failed:', error);
      }
      
      return {
        ...weather,
        ...forecast,
        displayName: locationInfo?.displayName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        coordinateSearch: true
      };
    } catch (error) {
      console.error('Weather by coordinates failed:', error);
      throw error; // Don't fall back to simulated data - let the caller handle the error
    }
  }

  // Search by location name with enhanced error handling
  async searchByLocationName(query) {
    if (!this.hasValidApiKey) {
      throw new Error('OpenWeather API key not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your .env.local file.');
    }

    try {
      const locations = await this.geocodeLocation(query);
      if (locations.length === 0) {
        throw new Error(`No locations found for "${query}"`);
      }

      const location = locations[0]; // Use the first result
      const weather = await this.getCurrentWeather(location.lat, location.lng);
      const forecast = await this.getForecast(location.lat, location.lng);

      return {
        ...weather,
        ...forecast,
        displayName: location.displayName
      };
    } catch (error) {
      console.error('Location search failed:', error);
      throw error; // Don't fall back to simulated data - let the caller handle the error
    }
  }

  // Fallback location search using known locations
  async fallbackLocationSearch(query) {
    const knownLocations = {
      'harare': { lat: -17.8292, lng: 31.0522, name: 'Harare, Zimbabwe' },
      'zimbabwe': { lat: -19.0154, lng: 29.1549, name: 'Zimbabwe' },
      'bulawayo': { lat: -20.1505, lng: 28.5767, name: 'Bulawayo, Zimbabwe' },
      'mutare': { lat: -18.9707, lng: 32.6734, name: 'Mutare, Zimbabwe' },
      'gweru': { lat: -19.4547, lng: 29.8147, name: 'Gweru, Zimbabwe' },
      'kwekwe': { lat: -18.9285, lng: 29.8267, name: 'Kwekwe, Zimbabwe' },
      'kadoma': { lat: -18.3408, lng: 29.9151, name: 'Kadoma, Zimbabwe' },
      'masvingo': { lat: -20.0637, lng: 30.8278, name: 'Masvingo, Zimbabwe' },
      'chinhoyi': { lat: -17.3667, lng: 30.2, name: 'Chinhoyi, Zimbabwe' },
      'norton': { lat: -17.8833, lng: 30.7, name: 'Norton, Zimbabwe' },
      'buhera': { lat: -18.2436, lng: 31.5781, name: 'Buhera-West, Zimbabwe' },
      'cape town': { lat: -33.9249, lng: 18.4241, name: 'Cape Town, South Africa' },
      'johannesburg': { lat: -26.2041, lng: 28.0473, name: 'Johannesburg, South Africa' },
      'durban': { lat: -29.8587, lng: 31.0218, name: 'Durban, South Africa' },
      'windhoek': { lat: -22.5597, lng: 17.0832, name: 'Windhoek, Namibia' },
      'gaborone': { lat: -24.6282, lng: 25.9231, name: 'Gaborone, Botswana' },
      'lusaka': { lat: -15.3875, lng: 28.3228, name: 'Lusaka, Zambia' },
      'maputo': { lat: -25.9692, lng: 32.5732, name: 'Maputo, Mozambique' }
    };
    
    const queryLower = query.toLowerCase();
    const matchedLocation = Object.keys(knownLocations).find(key => 
      queryLower.includes(key) || key.includes(queryLower)
    );
    
    if (matchedLocation) {
      const location = knownLocations[matchedLocation];
      console.log('WeatherService: Using fallback location data for:', location.name);
      return this.generateFallbackWeatherData(location.lat, location.lng, location.name);
    }
    
    // If no match found, use default Buhera-West coordinates
    console.log('WeatherService: Using default Buhera-West coordinates');
    const defaultLat = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE) || -18.2436;
    const defaultLng = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE) || 31.5781;
    return this.generateFallbackWeatherData(defaultLat, defaultLng, 'Buhera-West, Zimbabwe (Default)');
  }

  // Generate realistic fallback weather data
  generateFallbackWeatherData(lat, lng, locationName) {
    // Generate realistic weather based on location and season
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const hour = now.getHours();
    
    // Southern Africa climate patterns
    const isWetSeason = month >= 11 || month <= 3; // Nov-Mar
    const isDrySeason = month >= 4 && month <= 10; // Apr-Oct
    
    // Base temperature varies by season and time of day
    let baseTemp = 20; // Default
    if (lat < -20) { // Further south
      baseTemp = isDrySeason ? 18 : 25;
    } else { // More tropical
      baseTemp = isDrySeason ? 22 : 28;
    }
    
    // Daily temperature cycle
    const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
    const currentTemp = Math.round(baseTemp + tempVariation + (Math.random() - 0.5) * 4);
    
    // Weather conditions based on season
    const wetSeasonWeather = ['partly cloudy', 'light rain', 'thunderstorm', 'cloudy', 'overcast'];
    const drySeasonWeather = ['clear sky', 'few clouds', 'partly cloudy', 'sunny'];
    
    const weatherOptions = isWetSeason ? wetSeasonWeather : drySeasonWeather;
    const weatherDescription = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    
    const weather = wetSeasonWeather.includes(weatherDescription) ? 'rain' : 'clear';
    
    const fallbackData = {
      lat,
      lng,
      name: locationName.split(',')[0],
      country: 'ZW',
      displayName: locationName,
      current: {
        temp: currentTemp,
        feels_like: currentTemp + Math.round((Math.random() - 0.5) * 4),
        humidity: isWetSeason ? 65 + Math.round(Math.random() * 20) : 40 + Math.round(Math.random() * 20),
        pressure: 1013 + Math.round((Math.random() - 0.5) * 10),
        visibility: 10000,
        wind_speed: Math.round(Math.random() * 15 + 5),
        wind_deg: Math.round(Math.random() * 360),
        weather: weather,
        weather_description: weatherDescription,
        weather_icon: weather === 'rain' ? '10d' : '01d',
        sunrise: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0).getTime() / 1000,
        sunset: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 30).getTime() / 1000
      },
      // Generate realistic hourly forecast
      hourly: Array.from({ length: 24 }, (_, index) => {
        const forecastHour = (hour + index) % 24;
        const forecastTempVar = Math.sin((forecastHour - 6) * Math.PI / 12) * 8;
        const forecastTemp = Math.round(baseTemp + forecastTempVar + (Math.random() - 0.5) * 3);
        
        return {
          time: Date.now() + index * 3600000,
          temp: forecastTemp,
          weather: index < 8 && isWetSeason && Math.random() > 0.7 ? 'rain' : 'clear',
          weather_description: index < 8 && isWetSeason && Math.random() > 0.7 ? 'light rain' : 'clear sky',
          humidity: isWetSeason ? 60 + Math.round(Math.random() * 25) : 35 + Math.round(Math.random() * 25),
          wind_speed: Math.round(Math.random() * 12 + 8)
        };
      }),
      // Generate realistic daily forecast
      daily: Array.from({ length: 5 }, (_, index) => {
        const forecastDate = new Date(now.getTime() + index * 24 * 3600000);
        const dayBaseTemp = baseTemp + (Math.random() - 0.5) * 6;
        
        return {
          date: forecastDate.getTime(),
          temp_max: Math.round(dayBaseTemp + 8),
          temp_min: Math.round(dayBaseTemp - 3),
          weather: isWetSeason && Math.random() > 0.6 ? 'rain' : 'clear',
          weather_description: isWetSeason && Math.random() > 0.6 ? 'scattered thunderstorms' : 'partly cloudy'
        };
      }),
      fallbackData: true,
      timestamp: Date.now()
    };
    
    console.log('WeatherService: Generated fallback weather data for:', locationName);
    return fallbackData;
  }

  // Geocode a location string to coordinates
  async geocodeLocation(query) {
    if (!this.hasValidApiKey) {
      throw new Error('OpenWeather API key not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your .env.local file.');
    }
    
    try {
      const response = await fetch(
        `${this.geocodingUrl}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('OpenWeather API key is invalid. Please check your NEXT_PUBLIC_OPENWEATHER_API_KEY.');
        }
        throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
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
      throw error;
    }
  }

  // Reverse geocode coordinates to location name
  async reverseGeocode(lat, lng) {
    if (!this.hasValidApiKey) {
      console.warn('API key not available for reverse geocoding');
      return {
        name: 'Unknown Location',
        displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
    }
    
    try {
      const response = await fetch(
        `${this.geocodingUrl}/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('API key invalid for reverse geocoding');
          return {
            name: 'Unknown Location',
            displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          };
        }
        throw new Error(`Reverse geocoding failed: ${response.status} ${response.statusText}`);
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
    if (!this.hasValidApiKey) {
      throw new Error('OpenWeather API key not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your .env.local file.');
    }

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
        if (response.status === 401) {
          throw new Error('OpenWeather API key is invalid. Please check your NEXT_PUBLIC_OPENWEATHER_API_KEY.');
        }
        throw new Error(`Weather API failed: ${response.status} ${response.statusText}`);
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
    if (!this.hasValidApiKey) {
      throw new Error('OpenWeather API key not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your .env.local file.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('OpenWeather API key is invalid. Please check your NEXT_PUBLIC_OPENWEATHER_API_KEY.');
        }
        throw new Error(`Forecast API failed: ${response.status} ${response.statusText}`);
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
    if (!this.hasValidApiKey) {
      throw new Error('OpenWeather API key not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your .env.local file.');
    }

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
        throw error; // Don't silently ignore errors, let the caller handle them
      }
    });

    try {
      const results = await Promise.all(weatherPromises);
      return results;
    } catch (error) {
      console.error('Failed to get global weather data:', error);
      throw error;
    }
  }

  // Get notable weather conditions globally
  async getNotableWeather() {
    if (!this.hasValidApiKey) {
      throw new Error('OpenWeather API key not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your .env.local file.');
    }

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
}

// Create and export a singleton instance
const weatherService = new WeatherService();
export default weatherService; 
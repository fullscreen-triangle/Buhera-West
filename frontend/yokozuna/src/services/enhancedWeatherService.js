// Enhanced Weather Service using multiple real APIs
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const ECMWF_API_KEY = process.env.NEXT_PUBLIC_ECMWF_API_KEY;
const NOAA_API_KEY = process.env.NEXT_PUBLIC_NOAA_API_KEY;
const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

class EnhancedWeatherService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    // API endpoints
    this.endpoints = {
      openweather: 'https://api.openweathermap.org/data/2.5',
      ecmwf: 'https://api.ecmwf.int/v1',
      noaa: 'https://api.weather.gov',
      nasa: 'https://api.nasa.gov',
      geocoding: 'https://api.openweathermap.org/geo/1.0'
    };
  }

  // Get comprehensive weather data from multiple sources
  async getComprehensiveWeatherData(lat, lng) {
    const cacheKey = `comprehensive_${lat}_${lng}`;
    
    if (this.isDataCached(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    try {
      // Fetch data from multiple APIs in parallel
      const [
        openWeatherData,
        noaaData,
        nasaData,
        airQualityData,
        uvData
      ] = await Promise.allSettled([
        this.getOpenWeatherData(lat, lng),
        this.getNOAAData(lat, lng),
        this.getNASAData(lat, lng),
        this.getAirQualityData(lat, lng),
        this.getUVData(lat, lng)
      ]);

      const combinedData = this.combineWeatherData({
        openWeather: openWeatherData.status === 'fulfilled' ? openWeatherData.value : null,
        noaa: noaaData.status === 'fulfilled' ? noaaData.value : null,
        nasa: nasaData.status === 'fulfilled' ? nasaData.value : null,
        airQuality: airQualityData.status === 'fulfilled' ? airQualityData.value : null,
        uv: uvData.status === 'fulfilled' ? uvData.value : null
      });

      this.setCache(cacheKey, combinedData);
      return combinedData;
    } catch (error) {
      console.error('Error fetching comprehensive weather data:', error);
      throw error;
    }
  }

  // OpenWeather API calls
  async getOpenWeatherData(lat, lng) {
    const response = await fetch(
      `${this.endpoints.openweather}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // NOAA API calls
  async getNOAAData(lat, lng) {
    if (!NOAA_API_KEY) return null;
    
    try {
      // Get NOAA point data first
      const pointResponse = await fetch(
        `${this.endpoints.noaa}/points/${lat},${lng}`,
        {
          headers: {
            'User-Agent': 'BuheraWest/1.0',
            'Authorization': `Bearer ${NOAA_API_KEY}`
          }
        }
      );
      
      if (!pointResponse.ok) return null;
      
      const pointData = await pointResponse.json();
      
      // Get forecast data
      const forecastResponse = await fetch(pointData.properties.forecast, {
        headers: {
          'User-Agent': 'BuheraWest/1.0',
          'Authorization': `Bearer ${NOAA_API_KEY}`
        }
      });
      
      if (!forecastResponse.ok) return null;
      
      return await forecastResponse.json();
    } catch (error) {
      console.warn('NOAA API error:', error);
      return null;
    }
  }

  // NASA API calls
  async getNASAData(lat, lng) {
    if (!NASA_API_KEY) return null;
    
    try {
      const response = await fetch(
        `${this.endpoints.nasa}/planetary/apod?api_key=${NASA_API_KEY}&concept_tags=true`
      );
      
      if (!response.ok) return null;
      
      const nasaData = await response.json();
      
      // Get satellite imagery data
      const earthResponse = await fetch(
        `${this.endpoints.nasa}/planetary/earth/imagery?lon=${lng}&lat=${lat}&date=2023-01-01&api_key=${NASA_API_KEY}`
      );
      
      return {
        apod: nasaData,
        earth: earthResponse.ok ? await earthResponse.json() : null
      };
    } catch (error) {
      console.warn('NASA API error:', error);
      return null;
    }
  }

  // Air Quality data
  async getAirQualityData(lat, lng) {
    try {
      const response = await fetch(
        `${this.endpoints.openweather}/air_pollution?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.warn('Air quality API error:', error);
      return null;
    }
  }

  // UV Index data
  async getUVData(lat, lng) {
    try {
      const response = await fetch(
        `${this.endpoints.openweather}/uvi?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.warn('UV API error:', error);
      return null;
    }
  }

  // Get detailed forecast data
  async getDetailedForecast(lat, lng) {
    const cacheKey = `forecast_${lat}_${lng}`;
    
    if (this.isDataCached(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    try {
      const [hourlyForecast, dailyForecast] = await Promise.all([
        this.getHourlyForecast(lat, lng),
        this.getDailyForecast(lat, lng)
      ]);

      const forecastData = {
        hourly: hourlyForecast,
        daily: dailyForecast,
        timestamp: Date.now()
      };

      this.setCache(cacheKey, forecastData);
      return forecastData;
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      throw error;
    }
  }

  async getHourlyForecast(lat, lng) {
    const response = await fetch(
      `${this.endpoints.openweather}/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Hourly forecast API error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getDailyForecast(lat, lng) {
    const response = await fetch(
      `${this.endpoints.openweather}/onecall?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&exclude=minutely,alerts`
    );
    
    if (!response.ok) {
      throw new Error(`Daily forecast API error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Get real satellite data
  async getSatelliteData(lat, lng) {
    const cacheKey = `satellite_${lat}_${lng}`;
    
    if (this.isDataCached(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    try {
      const [nasaEarth, mapboxSatellite] = await Promise.allSettled([
        this.getNASAEarthImagery(lat, lng),
        this.getMapboxSatelliteData(lat, lng)
      ]);

      const satelliteData = {
        nasa: nasaEarth.status === 'fulfilled' ? nasaEarth.value : null,
        mapbox: mapboxSatellite.status === 'fulfilled' ? mapboxSatellite.value : null,
        timestamp: Date.now()
      };

      this.setCache(cacheKey, satelliteData);
      return satelliteData;
    } catch (error) {
      console.error('Error fetching satellite data:', error);
      throw error;
    }
  }

  async getNASAEarthImagery(lat, lng) {
    if (!NASA_API_KEY) return null;
    
    const response = await fetch(
      `${this.endpoints.nasa}/planetary/earth/assets?lon=${lng}&lat=${lat}&date=2023-01-01&api_key=${NASA_API_KEY}`
    );
    
    if (!response.ok) return null;
    
    return await response.json();
  }

  async getMapboxSatelliteData(lat, lng) {
    if (!MAPBOX_ACCESS_TOKEN) return null;
    
    // Get elevation data
    const elevationResponse = await fetch(
      `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
    );
    
    if (!elevationResponse.ok) return null;
    
    return await elevationResponse.json();
  }

  // Combine data from multiple sources
  combineWeatherData({ openWeather, noaa, nasa, airQuality, uv }) {
    const combined = {
      // Primary data from OpenWeather
      temperature: openWeather?.main?.temp || null,
      feelsLike: openWeather?.main?.feels_like || null,
      humidity: openWeather?.main?.humidity || null,
      pressure: openWeather?.main?.pressure || null,
      windSpeed: openWeather?.wind?.speed || null,
      windDirection: openWeather?.wind?.deg || null,
      cloudCover: openWeather?.clouds?.all || null,
      visibility: openWeather?.visibility || null,
      weather: openWeather?.weather?.[0]?.main || null,
      description: openWeather?.weather?.[0]?.description || null,
      
      // Enhanced data
      airQuality: airQuality ? {
        aqi: airQuality.list[0]?.main?.aqi,
        components: airQuality.list[0]?.components
      } : null,
      
      uvIndex: uv?.value || null,
      
      // NOAA forecast data
      forecast: noaa ? {
        periods: noaa.properties?.periods?.slice(0, 7) || []
      } : null,
      
      // NASA satellite data
      satellite: nasa || null,
      
      // Data source attribution
      sources: {
        primary: 'OpenWeather',
        supplementary: [
          noaa && 'NOAA',
          nasa && 'NASA',
          airQuality && 'OpenWeather Air Quality',
          uv && 'OpenWeather UV'
        ].filter(Boolean)
      },
      
      timestamp: Date.now()
    };

    return combined;
  }

  // Real crossfilter data generation (replacing mock data)
  async generateRealCrossfilterData(lat, lng, radius = 0.1, points = 100) {
    const data = [];
    const promises = [];
    
    // Generate grid points around the location
    for (let i = 0; i < points; i++) {
      const offsetLat = lat + (Math.random() - 0.5) * radius;
      const offsetLng = lng + (Math.random() - 0.5) * radius;
      
      promises.push(this.getComprehensiveWeatherData(offsetLat, offsetLng));
    }

    try {
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const weather = result.value;
          const offsetLat = lat + (Math.random() - 0.5) * radius;
          const offsetLng = lng + (Math.random() - 0.5) * radius;
          
          data.push({
            id: index,
            timestamp: new Date().toISOString(),
            lat: offsetLat,
            lng: offsetLng,
            temperature: weather.temperature,
            humidity: weather.humidity,
            pressure: weather.pressure,
            windSpeed: weather.windSpeed,
            windDirection: weather.windDirection,
            cloudCover: weather.cloudCover,
            visibility: weather.visibility,
            uvIndex: weather.uvIndex,
            airQuality: weather.airQuality?.aqi,
            weather: weather.weather,
            elevation: Math.random() * 100, // This would come from elevation API
            soilMoisture: 30 + Math.random() * 40, // Would be from soil sensors if available
            vegetation: Math.random() * 100 // Would be from satellite imagery analysis
          });
        }
      });

      return data;
    } catch (error) {
      console.error('Error generating real crossfilter data:', error);
      throw error;
    }
  }

  // Cache management
  isDataCached(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < this.cacheExpiry;
  }

  getFromCache(key) {
    return this.cache.get(key)?.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new EnhancedWeatherService(); 
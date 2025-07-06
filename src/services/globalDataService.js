// Global Data Service - Real-time data from various sources
import weatherService from './weatherService';
import enhancedWeatherService from './enhancedWeatherService';
import * as satellite from 'satellite.js';

class GlobalDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.weatherService = weatherService;
    this.enhancedWeatherService = enhancedWeatherService;
    this.EARTH_RADIUS_KM = 6371;
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Real flight data via Next.js API route
  async getRealFlightData() {
    const cacheKey = 'flights';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Use Next.js API route to get flight data (server-side fetch)
      const response = await fetch('/api/flights');
      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      if (!apiData.success) {
        throw new Error(apiData.error || 'Failed to get flight data');
      }

      this.setCachedData(cacheKey, apiData.data);
      return apiData.data;
    } catch (error) {
      console.error('Failed to fetch real flight data:', error);
      return this.getFallbackFlightData();
    }
  }

  // Real satellite data using satellite.js library via Next.js API route
  async getRealSatelliteData() {
    const cacheKey = 'satellites';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Use Next.js API route to get TLE data (server-side fetch)
      const response = await fetch('/api/satellites');
      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      if (!apiData.success) {
        throw new Error(apiData.error || 'Failed to get satellite data');
      }
      
      const tleData = apiData.data;
      const satData = tleData.map(({ name, line1, line2 }) => ({
        satrec: satellite.twoline2satrec(line1, line2),
        name: name
      }))
      // exclude those that can't be propagated
      .filter(d => !!satellite.propagate(d.satrec, new Date())?.position);

      // Calculate current positions using satellite.js
      const currentTime = new Date();
      const gmst = satellite.gstime(currentTime);
      
      const satellites = satData.map(d => {
        const eci = satellite.propagate(d.satrec, currentTime);
        if (eci?.position) {
          const gdPos = satellite.eciToGeodetic(eci.position, gmst);
          const lat = satellite.radiansToDegrees(gdPos.latitude);
          const lng = satellite.radiansToDegrees(gdPos.longitude);
          const alt = gdPos.height / this.EARTH_RADIUS_KM;
          
          return {
            name: d.name,
            lat,
            lng,
            alt,
            type: this.classifySatellite(d.name)
          };
        }
        return null;
      }).filter(d => d && !isNaN(d.lat) && !isNaN(d.lng) && !isNaN(d.alt)).slice(0, 50);

      this.setCachedData(cacheKey, satellites);
      return satellites;
    } catch (error) {
      console.error('Failed to fetch real satellite data:', error);
      return this.getFallbackSatelliteData();
    }
  }

  // This method is no longer needed since we're using satellite.js for proper TLE parsing

  classifySatellite(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('iss') || lowerName.includes('station')) return 'Space Station';
    if (lowerName.includes('starlink')) return 'Communication';
    if (lowerName.includes('weather') || lowerName.includes('goes')) return 'Weather';
    if (lowerName.includes('gps') || lowerName.includes('navstar') || lowerName.includes('galileo') || lowerName.includes('glonass') || lowerName.includes('beidou')) return 'Navigation';
    return 'Other';
  }

  // Real weather data using existing weather service
  async getRealWeatherData() {
    const cacheKey = 'weather';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Major cities for weather data
      const cities = [
        { name: 'New York', lat: 40.7128, lng: -74.0060 },
        { name: 'London', lat: 51.5074, lng: -0.1278 },
        { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
        { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
        { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
        { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
        { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
        { name: 'Paris', lat: 48.8566, lng: 2.3522 },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
        { name: 'São Paulo', lat: -23.5505, lng: -46.6333 }
      ];

      const weatherPromises = cities.map(async city => {
        try {
          // Use existing weather service
          const weatherData = await this.weatherService.getWeatherByCoordinates(city.lat, city.lng);
          
          return {
            ...city,
            temperature: Math.round(weatherData.temperature),
            humidity: weatherData.humidity,
            windSpeed: Math.round(weatherData.windSpeed),
            condition: weatherData.condition,
            description: weatherData.description
          };
        } catch (error) {
          console.warn(`Failed to get weather for ${city.name}:`, error);
          // Fallback to simulated data for this city
          return {
            ...city,
            temperature: Math.round(-10 + Math.random() * 50),
            humidity: Math.round(30 + Math.random() * 50),
            windSpeed: Math.round(Math.random() * 30),
            condition: 'Unknown'
          };
        }
      });

      const weatherData = await Promise.all(weatherPromises);
      this.setCachedData(cacheKey, weatherData);
      return weatherData;
    } catch (error) {
      console.error('Failed to fetch real weather data:', error);
      return this.getFallbackWeatherData();
    }
  }

  // Real submarine cable data via Next.js API route
  async getRealCableData() {
    const cacheKey = 'cables';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Use Next.js API route to get cable data (server-side fetch)
      const response = await fetch('/api/cables');
      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      if (!apiData.success) {
        throw new Error(apiData.error || 'Failed to get cable data');
      }

      this.setCachedData(cacheKey, apiData.data);
      return apiData.data;
    } catch (error) {
      console.error('Failed to fetch real cable data:', error);
      return this.getFallbackCableData();
    }
  }



  // Flight routes based on real traffic patterns
  async getRealFlightRoutes() {
    const cacheKey = 'flight-routes';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get current flights and create routes between active airports
      const flights = await this.getRealFlightData();
      const routes = [];
      
      // Group flights by origin country to create routes
      const flightsByCountry = {};
      flights.forEach(flight => {
        if (!flightsByCountry[flight.originCountry]) {
          flightsByCountry[flight.originCountry] = [];
        }
        flightsByCountry[flight.originCountry].push(flight);
      });

      // Create routes between countries with active flights
      const countries = Object.keys(flightsByCountry);
      for (let i = 0; i < countries.length && routes.length < 50; i++) {
        for (let j = i + 1; j < countries.length && routes.length < 50; j++) {
          const country1Flights = flightsByCountry[countries[i]];
          const country2Flights = flightsByCountry[countries[j]];
          
          if (country1Flights.length > 0 && country2Flights.length > 0) {
            const flight1 = country1Flights[0];
            const flight2 = country2Flights[0];
            
            routes.push({
              startLat: flight1.latitude,
              startLng: flight1.longitude,
              endLat: flight2.latitude,
              endLng: flight2.longitude,
              airline: `${countries[i]} - ${countries[j]}`,
              color: '#4ecdc4'
            });
          }
        }
      }

      this.setCachedData(cacheKey, routes);
      return routes;
    } catch (error) {
      console.error('Failed to create real flight routes:', error);
      return this.getFallbackFlightRoutes();
    }
  }

  // Fallback data methods (when APIs fail)
  getFallbackFlightData() {
    // Minimal fallback data
    return [
      { icao24: 'fallback1', callsign: 'AAL123', latitude: 40.7, longitude: -74.0, altitude: 10000, velocity: 800 },
      { icao24: 'fallback2', callsign: 'BAW456', latitude: 51.5, longitude: -0.1, altitude: 11000, velocity: 900 }
    ];
  }

  getFallbackSatelliteData() {
    return [
      { name: 'ISS', lat: 51.6, lng: 0.0, alt: 0.4, type: 'Space Station' },
      { name: 'Hubble Space Telescope', lat: 28.5, lng: -80.6, alt: 0.5, type: 'Research' }
    ];
  }

  getFallbackWeatherData() {
    return [
      { name: 'London', lat: 51.5074, lng: -0.1278, temperature: 15, condition: 'Cloudy' },
      { name: 'New York', lat: 40.7128, lng: -74.0060, temperature: 22, condition: 'Clear' }
    ];
  }

  getFallbackCableData() {
    return [
      {
        coords: [[-74, 40], [-0.1, 51.5]],
        properties: { name: 'Transatlantic Cable', color: '#00ff88' }
      }
    ];
  }

  getFallbackFlightRoutes() {
    return [
      {
        startLat: 40.7128, startLng: -74.0060,
        endLat: 51.5074, endLng: -0.1278,
        airline: 'NYC - London', color: '#4ecdc4'
      }
    ];
  }
}

const globalDataService = new GlobalDataService();
export default globalDataService; 
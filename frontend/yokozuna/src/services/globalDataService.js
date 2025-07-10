class GlobalDataService {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:3000';
  }

  async fetchWithFallback(endpoint, fallbackData) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Failed to fetch ${endpoint}, using fallback data:`, error);
      return fallbackData;
    }
  }

  // Flight data for basic flight tracking
  async getRealFlightData() {
    const fallbackData = this.generateFallbackFlightData();
    try {
      const response = await fetch(`${this.baseUrl}/api/flights`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.flights || fallbackData;
    } catch (error) {
      console.warn('Using fallback flight data:', error);
      return fallbackData;
    }
  }

  // Airline routes data for airline network visualization
  async getRealAirlineData() {
    const fallbackData = this.generateFallbackAirlineData();
    try {
      const response = await fetch(`${this.baseUrl}/api/airline-routes`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.routes || fallbackData;
    } catch (error) {
      console.warn('Using fallback airline data:', error);
      return fallbackData;
    }
  }

  // Sea traffic data for maritime visualization
  async getRealSeaTrafficData() {
    const fallbackData = this.generateFallbackSeaTrafficData();
    try {
      const response = await fetch(`${this.baseUrl}/api/sea-traffic`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return {
        routes: data.routes || fallbackData.routes,
        vessels: data.vessels || fallbackData.vessels
      };
    } catch (error) {
      console.warn('Using fallback sea traffic data:', error);
      return fallbackData;
    }
  }

  // Satellite data
  async getRealSatelliteData() {
    const fallbackData = this.generateFallbackSatelliteData();
    try {
      const response = await fetch(`${this.baseUrl}/api/satellites`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.satellites || fallbackData;
    } catch (error) {
      console.warn('Using fallback satellite data:', error);
      return fallbackData;
    }
  }

  // Weather data
  async getRealWeatherData() {
    const fallbackData = this.generateFallbackWeatherData();
    try {
      const response = await fetch(`${this.baseUrl}/api/weather`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.weather || fallbackData;
    } catch (error) {
      console.warn('Using fallback weather data:', error);
      return fallbackData;
    }
  }

  // Submarine cable data
  async getRealCableData() {
    const fallbackData = this.generateFallbackCableData();
    return fallbackData; // Using fallback for now
  }

  // Flight routes for the original flight visualization
  async getRealFlightRoutes() {
    const fallbackData = this.generateFallbackFlightRoutes();
    return fallbackData; // Using fallback for now
  }

  // Fallback data generators
  generateFallbackFlightData() {
    return Array.from({ length: 20 }, (_, i) => ({
      id: `flight_${i}`,
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360,
      altitude: Math.random() * 12 + 1,
      callsign: `FL${(1000 + i).toString()}`,
      speed: Math.random() * 500 + 200,
      heading: Math.random() * 360
    }));
  }

  generateFallbackAirlineData() {
    const airports = [
      { code: 'JFK', lat: 40.6413, lng: -73.7781, city: 'New York' },
      { code: 'LHR', lat: 51.4700, lng: -0.4543, city: 'London' },
      { code: 'CDG', lat: 49.0097, lng: 2.5479, city: 'Paris' },
      { code: 'DXB', lat: 25.2532, lng: 55.3657, city: 'Dubai' },
      { code: 'NRT', lat: 35.7647, lng: 140.3864, city: 'Tokyo' },
      { code: 'LAX', lat: 33.9425, lng: -118.4081, city: 'Los Angeles' }
    ];

    const routes = [];
    for (let i = 0; i < airports.length; i++) {
      for (let j = i + 1; j < airports.length; j++) {
        routes.push({
          id: `${airports[i].code}-${airports[j].code}`,
          startLat: airports[i].lat,
          startLng: airports[i].lng,
          endLat: airports[j].lat,
          endLng: airports[j].lng,
          color: '#ff4444',
          airline: `${airports[i].code}→${airports[j].code}`
        });
      }
    }
    return routes.slice(0, 15);
  }

  generateFallbackSeaTrafficData() {
    const routes = [
      {
        name: 'Asia-Europe Main Line',
        color: '#4444ff',
        coords: [
          [121.4737, 31.2304], // Shanghai
          [103.7764, 1.2966],  // Singapore
          [32.2635, 30.5852],  // Suez Canal
          [4.4777, 51.9244]    // Rotterdam
        ]
      },
      {
        name: 'Transpacific Route',
        color: '#ff4444',
        coords: [
          [121.4737, 31.2304], // Shanghai
          [-118.2707, 33.7175] // Los Angeles
        ]
      }
    ];

    const vessels = [];
    routes.forEach((route, routeIndex) => {
      for (let i = 0; i < 5; i++) {
        const progress = i / 5;
        const coordIndex = Math.floor(progress * (route.coords.length - 1));
        const nextCoordIndex = Math.min(coordIndex + 1, route.coords.length - 1);
        
        const currentCoord = route.coords[coordIndex];
        const nextCoord = route.coords[nextCoordIndex];
        
        const localProgress = (progress * (route.coords.length - 1)) - coordIndex;
        
        const lat = currentCoord[1] + (nextCoord[1] - currentCoord[1]) * localProgress;
        const lng = currentCoord[0] + (nextCoord[0] - currentCoord[0]) * localProgress;
        
        vessels.push({
          id: `vessel_${routeIndex}_${i}`,
          lat: lat,
          lng: lng,
          name: `VESSEL ${routeIndex + 1}-${i + 1}`,
          route: route.name,
          color: route.color,
          type: 'container'
        });
      }
    });

    return { routes, vessels };
  }

  generateFallbackSatelliteData() {
    const types = ['ISS', 'GPS', 'Communication', 'Weather', 'Research'];
    return Array.from({ length: 50 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        id: `sat_${i}`,
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        alt: type === 'ISS' ? 0.04 : Math.random() * 0.2 + 0.02,
        name: `${type}-${i + 1}`,
        type: type,
        color: type === 'ISS' ? '#ff0000' : 
               type === 'GPS' ? '#00ff00' : 
               type === 'Communication' ? '#0000ff' : 
               type === 'Weather' ? '#ffff00' : '#ff00ff'
      };
    });
  }

  generateFallbackWeatherData() {
    const weatherPoints = [];
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lng = -180; lng <= 180; lng += 20) {
        const temp = Math.sin(lat * Math.PI / 180) * 30 + Math.random() * 20 - 10;
        weatherPoints.push({
          lat,
          lng,
          temperature: temp,
          condition: temp > 20 ? 'Hot' : temp > 0 ? 'Mild' : 'Cold',
          humidity: Math.random() * 100,
          windSpeed: Math.random() * 50
        });
      }
    }
    return weatherPoints;
  }

  generateFallbackCableData() {
    return [
      {
        properties: { name: 'TAT-14', color: '#00ffff' },
        coords: [
          [40.7, -74.0], [51.5, -0.1]
        ]
      },
      {
        properties: { name: 'FLAG', color: '#00ffff' },
        coords: [
          [40.7, -74.0], [25.2, 55.3]
        ]
      }
    ];
  }

  generateFallbackFlightRoutes() {
    const airports = [
      { lat: 40.6413, lng: -73.7781, name: 'JFK' },
      { lat: 51.4700, lng: -0.4543, name: 'LHR' },
      { lat: 49.0097, lng: 2.5479, name: 'CDG' },
      { lat: 25.2532, lng: 55.3657, name: 'DXB' }
    ];

    const routes = [];
    for (let i = 0; i < airports.length; i++) {
      for (let j = i + 1; j < airports.length; j++) {
        routes.push({
          startLat: airports[i].lat,
          startLng: airports[i].lng,
          endLat: airports[j].lat,
          endLng: airports[j].lng,
          color: '#4ecdc4',
          airline: `${airports[i].name}→${airports[j].name}`
        });
      }
    }
    return routes.slice(0, 10);
  }
}

const globalDataService = new GlobalDataService();
export default globalDataService; 
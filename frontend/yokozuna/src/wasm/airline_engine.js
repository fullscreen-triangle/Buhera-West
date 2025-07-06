// Mock WASM Airline Traffic Engine
export class AirlineTrafficEngine {
  constructor() {
    this.aircraftTypes = {
      SMALL_REGIONAL: 'SmallRegional',
      MEDIUM_RANGE: 'MediumRange',
      LONG_RANGE: 'LongRange',
      WIDE_BODY: 'WideTody',
      CARGO: 'Cargo'
    };
    
    this.trafficDensities = {
      LIGHT: 'Light',
      MODERATE: 'Moderate',
      HEAVY: 'Heavy',
      CONGESTED: 'Congested'
    };
    
    this.initialized = false;
    this.airline_data_cache = new Map();
  }

  async initialize() {
    console.log('Initializing airline traffic visualization engine...');
    this.initialized = true;
  }

  async generate_airline_routes(count) {
    const routes = [];
    
    for (let i = 0; i < count; i++) {
      const originAirport = this.generateAirport(i * 2);
      const destinationAirport = this.generateAirport(i * 2 + 1);
      const routeData = this.calculateRouteData(originAirport, destinationAirport);
      
      routes.push({
        route_id: `route_${i}`,
        origin_airport: originAirport,
        destination_airport: destinationAirport,
        flight_frequency: routeData.flight_frequency,
        passenger_volume: routeData.passenger_volume,
        aircraft_types: routeData.aircraft_types,
        route_distance: routeData.route_distance,
        average_altitude: routeData.average_altitude,
        traffic_density: routeData.traffic_density,
        seasonal_variation: routeData.seasonal_variation
      });
    }
    
    return routes;
  }

  generateAirport(index) {
    const majorAirports = [
      { iata: 'JFK', name: 'John F. Kennedy International Airport', lat: 40.6413, lon: -73.7781, elev: 4 },
      { iata: 'LAX', name: 'Los Angeles International Airport', lat: 33.9425, lon: -118.4081, elev: 38 },
      { iata: 'ORD', name: 'O\'Hare International Airport', lat: 41.9742, lon: -87.9073, elev: 205 },
      { iata: 'DFW', name: 'Dallas/Fort Worth International Airport', lat: 32.8998, lon: -97.0403, elev: 183 },
      { iata: 'DEN', name: 'Denver International Airport', lat: 39.8617, lon: -104.6737, elev: 1640 },
      { iata: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', lat: 33.6407, lon: -84.4277, elev: 313 },
      { iata: 'SFO', name: 'San Francisco International Airport', lat: 37.6213, lon: -122.3790, elev: 4 },
      { iata: 'SEA', name: 'Seattle-Tacoma International Airport', lat: 47.4502, lon: -122.3088, elev: 131 },
      { iata: 'LAS', name: 'McCarran International Airport', lat: 36.0840, lon: -115.1537, elev: 664 },
      { iata: 'MIA', name: 'Miami International Airport', lat: 25.7959, lon: -80.2870, elev: 3 },
      { iata: 'PHX', name: 'Phoenix Sky Harbor International Airport', lat: 33.4484, lon: -112.0740, elev: 337 },
      { iata: 'IAH', name: 'George Bush Intercontinental Airport', lat: 29.9902, lon: -95.3368, elev: 30 },
      { iata: 'BOS', name: 'Logan International Airport', lat: 42.3656, lon: -71.0096, elev: 6 },
      { iata: 'MSP', name: 'Minneapolis-Saint Paul International Airport', lat: 44.8848, lon: -93.2223, elev: 256 },
      { iata: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', lat: 42.2162, lon: -83.3554, elev: 195 },
      { iata: 'PHL', name: 'Philadelphia International Airport', lat: 39.8744, lon: -75.2424, elev: 11 },
      { iata: 'LGA', name: 'LaGuardia Airport', lat: 40.7769, lon: -73.8740, elev: 7 },
      { iata: 'BWI', name: 'Baltimore/Washington International Airport', lat: 39.1774, lon: -76.6684, elev: 45 },
      { iata: 'DCA', name: 'Ronald Reagan Washington National Airport', lat: 38.8512, lon: -77.0402, elev: 5 },
      { iata: 'MDW', name: 'Chicago Midway International Airport', lat: 41.7868, lon: -87.7505, elev: 188 }
    ];

    const airportData = majorAirports[index % majorAirports.length];
    
    return {
      iata_code: airportData.iata,
      name: airportData.name,
      coordinates: {
        latitude: airportData.lat,
        longitude: airportData.lon,
        altitude: airportData.elev
      },
      elevation: airportData.elev,
      timezone: this.getTimezone(airportData.lat, airportData.lon),
      daily_operations: 300 + Math.floor(Math.random() * 1200) // 300-1500 daily operations
    };
  }

  calculateRouteData(originAirport, destinationAirport) {
    const distance = this.calculateDistance(
      originAirport.coordinates,
      destinationAirport.coordinates
    );
    
    const aircraftTypes = this.selectAircraftTypes(distance);
    const trafficDensity = this.calculateTrafficDensity(distance, originAirport.daily_operations, destinationAirport.daily_operations);
    
    return {
      flight_frequency: this.calculateFlightFrequency(distance, trafficDensity),
      passenger_volume: this.calculatePassengerVolume(distance, trafficDensity),
      aircraft_types: aircraftTypes,
      route_distance: distance,
      average_altitude: this.calculateAverageAltitude(distance),
      traffic_density: trafficDensity,
      seasonal_variation: this.calculateSeasonalVariation(distance)
    };
  }

  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  selectAircraftTypes(distance) {
    const types = [];
    
    if (distance < 500) {
      types.push(this.aircraftTypes.SMALL_REGIONAL);
    } else if (distance < 1500) {
      types.push(this.aircraftTypes.MEDIUM_RANGE);
    } else if (distance < 3000) {
      types.push(this.aircraftTypes.LONG_RANGE);
    } else {
      types.push(this.aircraftTypes.WIDE_BODY);
    }
    
    // Add cargo flights for longer routes
    if (distance > 1000) {
      types.push(this.aircraftTypes.CARGO);
    }
    
    return types;
  }

  calculateTrafficDensity(distance, originOps, destinationOps) {
    const avgOps = (originOps + destinationOps) / 2;
    const densityFactor = (avgOps / 1000) * (1 - distance / 5000); // Adjust for distance
    
    if (densityFactor > 0.8) return this.trafficDensities.CONGESTED;
    if (densityFactor > 0.6) return this.trafficDensities.HEAVY;
    if (densityFactor > 0.3) return this.trafficDensities.MODERATE;
    return this.trafficDensities.LIGHT;
  }

  calculateFlightFrequency(distance, trafficDensity) {
    let baseFrequency = 4; // Base flights per day
    
    // Adjust for traffic density
    switch (trafficDensity) {
      case this.trafficDensities.CONGESTED:
        baseFrequency *= 8;
        break;
      case this.trafficDensities.HEAVY:
        baseFrequency *= 4;
        break;
      case this.trafficDensities.MODERATE:
        baseFrequency *= 2;
        break;
      default:
        baseFrequency *= 1;
    }
    
    // Adjust for distance (longer routes typically have fewer flights)
    const distanceFactor = Math.max(0.2, 1 - (distance / 10000));
    
    return Math.floor(baseFrequency * distanceFactor);
  }

  calculatePassengerVolume(distance, trafficDensity) {
    let basePassengers = 150; // Base passengers per day
    
    // Adjust for traffic density
    switch (trafficDensity) {
      case this.trafficDensities.CONGESTED:
        basePassengers *= 10;
        break;
      case this.trafficDensities.HEAVY:
        basePassengers *= 6;
        break;
      case this.trafficDensities.MODERATE:
        basePassengers *= 3;
        break;
      default:
        basePassengers *= 1;
    }
    
    // Adjust for distance (longer routes typically have larger aircraft)
    const distanceFactor = Math.max(0.5, 1 + (distance / 5000));
    
    return Math.floor(basePassengers * distanceFactor);
  }

  calculateAverageAltitude(distance) {
    // Typical cruise altitudes based on distance
    if (distance < 500) return 6000; // 20,000 ft
    if (distance < 1500) return 9000; // 30,000 ft
    if (distance < 3000) return 11000; // 36,000 ft
    return 13000; // 43,000 ft
  }

  calculateSeasonalVariation(distance) {
    return {
      peak_months: this.getPeakMonths(distance),
      variation_factor: 0.2 + Math.random() * 0.3, // 20-50% variation
      holiday_multiplier: 1.2 + Math.random() * 0.5, // 20-70% increase
      weather_impact: distance > 2000 ? 0.8 : 0.9 // Weather affects long routes more
    };
  }

  getPeakMonths(distance) {
    // Domestic routes peak in summer, international in shoulder seasons
    if (distance < 2000) {
      return ['June', 'July', 'August'];
    } else {
      return ['May', 'September', 'October'];
    }
  }

  getTimezone(lat, lon) {
    // Simplified timezone calculation
    const utcOffset = Math.round(lon / 15);
    return `UTC${utcOffset >= 0 ? '+' : ''}${utcOffset}`;
  }

  async calculate_airline_metrics(airlineData) {
    return {
      total_routes: airlineData.length,
      total_daily_flights: airlineData.reduce((sum, route) => sum + route.flight_frequency, 0),
      total_passengers: airlineData.reduce((sum, route) => sum + route.passenger_volume, 0),
      average_distance: airlineData.reduce((sum, route) => sum + route.route_distance, 0) / airlineData.length,
      aircraft_distribution: this.calculateAircraftDistribution(airlineData),
      traffic_density_distribution: this.calculateTrafficDensityDistribution(airlineData)
    };
  }

  calculateAircraftDistribution(airlineData) {
    const distribution = {};
    
    airlineData.forEach(route => {
      route.aircraft_types.forEach(type => {
        distribution[type] = (distribution[type] || 0) + 1;
      });
    });
    
    return distribution;
  }

  calculateTrafficDensityDistribution(airlineData) {
    const distribution = {};
    
    airlineData.forEach(route => {
      const density = route.traffic_density;
      distribution[density] = (distribution[density] || 0) + 1;
    });
    
    return distribution;
  }

  update_airline_simulation(timestamp, timeOfDay, mode) {
    return {
      timestamp,
      time_of_day: timeOfDay,
      mode,
      active_flights: this.calculateActiveFlights(timeOfDay),
      air_traffic_control: this.getATCStatus(timeOfDay),
      weather_conditions: this.getWeatherConditions(),
      fuel_consumption: this.calculateFuelConsumption(timeOfDay),
      passenger_load_factor: this.calculateLoadFactor(timeOfDay),
      on_time_performance: this.calculateOnTimePerformance(timeOfDay)
    };
  }

  calculateActiveFlights(timeOfDay) {
    // Peak hours: 6-9 AM and 5-8 PM
    const peakHours = [6, 7, 8, 9, 17, 18, 19, 20];
    const isePeak = peakHours.includes(timeOfDay);
    
    return {
      domestic: isePeak ? 800 + Math.random() * 400 : 400 + Math.random() * 300,
      international: isePeak ? 200 + Math.random() * 100 : 100 + Math.random() * 80,
      cargo: 50 + Math.random() * 30
    };
  }

  getATCStatus(timeOfDay) {
    const nightHours = [23, 0, 1, 2, 3, 4, 5];
    const isNight = nightHours.includes(timeOfDay);
    
    return {
      status: isNight ? 'reduced_operations' : 'normal',
      ground_stops: Math.random() < 0.1 ? 'active' : 'none',
      delay_factor: isNight ? 0.8 : 1.0 + Math.random() * 0.3
    };
  }

  getWeatherConditions() {
    const conditions = ['clear', 'partly_cloudy', 'overcast', 'light_rain', 'heavy_rain', 'thunderstorm', 'snow'];
    const weights = [0.4, 0.25, 0.15, 0.1, 0.05, 0.03, 0.02];
    
    let random = Math.random();
    for (let i = 0; i < conditions.length; i++) {
      if (random < weights[i]) {
        return conditions[i];
      }
      random -= weights[i];
    }
    
    return 'clear';
  }

  calculateFuelConsumption(timeOfDay) {
    const baseConsumption = 2500; // gallons per hour
    const peakMultiplier = [6, 7, 8, 9, 17, 18, 19, 20].includes(timeOfDay) ? 1.3 : 1.0;
    
    return baseConsumption * peakMultiplier * (0.9 + Math.random() * 0.2);
  }

  calculateLoadFactor(timeOfDay) {
    const baseLoadFactor = 0.82; // 82% average load factor
    const peakBonus = [6, 7, 8, 9, 17, 18, 19, 20].includes(timeOfDay) ? 0.1 : 0;
    
    return Math.min(0.98, baseLoadFactor + peakBonus + (Math.random() - 0.5) * 0.1);
  }

  calculateOnTimePerformance(timeOfDay) {
    const basePerformance = 0.78; // 78% on-time performance
    const nightBonus = [23, 0, 1, 2, 3, 4, 5].includes(timeOfDay) ? 0.15 : 0;
    const peakPenalty = [6, 7, 8, 9, 17, 18, 19, 20].includes(timeOfDay) ? -0.08 : 0;
    
    return Math.max(0.5, Math.min(0.95, basePerformance + nightBonus + peakPenalty + (Math.random() - 0.5) * 0.1));
  }
} 
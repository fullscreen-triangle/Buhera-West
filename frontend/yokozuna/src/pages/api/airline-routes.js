// API endpoint for airline routes data
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Major world airports with real coordinates
    const airports = [
      { code: 'JFK', name: 'John F. Kennedy International', lat: 40.6413, lng: -73.7781, city: 'New York', country: 'USA', type: 'hub' },
      { code: 'LHR', name: 'London Heathrow', lat: 51.4700, lng: -0.4543, city: 'London', country: 'UK', type: 'hub' },
      { code: 'CDG', name: 'Charles de Gaulle', lat: 49.0097, lng: 2.5479, city: 'Paris', country: 'France', type: 'hub' },
      { code: 'DXB', name: 'Dubai International', lat: 25.2532, lng: 55.3657, city: 'Dubai', country: 'UAE', type: 'hub' },
      { code: 'NRT', name: 'Narita International', lat: 35.7647, lng: 140.3864, city: 'Tokyo', country: 'Japan', type: 'hub' },
      { code: 'LAX', name: 'Los Angeles International', lat: 33.9425, lng: -118.4081, city: 'Los Angeles', country: 'USA', type: 'hub' },
      { code: 'SIN', name: 'Singapore Changi', lat: 1.3644, lng: 103.9915, city: 'Singapore', country: 'Singapore', type: 'hub' },
      { code: 'HKG', name: 'Hong Kong International', lat: 22.3080, lng: 113.9185, city: 'Hong Kong', country: 'China', type: 'hub' },
      { code: 'FRA', name: 'Frankfurt am Main', lat: 50.0379, lng: 8.5622, city: 'Frankfurt', country: 'Germany', type: 'hub' },
      { code: 'ORD', name: 'O\'Hare International', lat: 41.9742, lng: -87.9073, city: 'Chicago', country: 'USA', type: 'hub' },
      { code: 'SYD', name: 'Sydney Kingsford Smith', lat: -33.9399, lng: 151.1753, city: 'Sydney', country: 'Australia', type: 'international' },
      { code: 'GRU', name: 'São Paulo/Guarulhos', lat: -23.4356, lng: -46.4731, city: 'São Paulo', country: 'Brazil', type: 'international' },
      { code: 'CAI', name: 'Cairo International', lat: 30.1127, lng: 31.4000, city: 'Cairo', country: 'Egypt', type: 'regional' },
      { code: 'JNB', name: 'O.R. Tambo International', lat: -26.1367, lng: 28.2411, city: 'Johannesburg', country: 'South Africa', type: 'regional' },
      { code: 'DEL', name: 'Indira Gandhi International', lat: 28.5562, lng: 77.1000, city: 'Delhi', country: 'India', type: 'hub' },
      { code: 'ICN', name: 'Incheon International', lat: 37.4602, lng: 126.4407, city: 'Seoul', country: 'South Korea', type: 'hub' },
      { code: 'AMS', name: 'Amsterdam Schiphol', lat: 52.3105, lng: 4.7683, city: 'Amsterdam', country: 'Netherlands', type: 'hub' },
      { code: 'MAD', name: 'Madrid-Barajas', lat: 40.4719, lng: -3.5626, city: 'Madrid', country: 'Spain', type: 'regional' },
      { code: 'YYZ', name: 'Toronto Pearson International', lat: 43.6777, lng: -79.6248, city: 'Toronto', country: 'Canada', type: 'regional' },
      { code: 'MIA', name: 'Miami International', lat: 25.7959, lng: -80.2870, city: 'Miami', country: 'USA', type: 'regional' }
    ];

    // Generate airline routes based on airport types and distances
    const routes = [];
    
    for (let i = 0; i < airports.length; i++) {
      for (let j = i + 1; j < airports.length; j++) {
        const start = airports[i];
        const end = airports[j];
        
        // Calculate distance
        const distance = Math.sqrt(
          Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2)
        );
        
        // Determine route type and likelihood
        let routeType = 'domestic';
        let color = '#4444ff';
        let probability = 0.3;
        
        if (start.country !== end.country) {
          if (start.type === 'hub' && end.type === 'hub') {
            routeType = 'international_hub';
            color = '#ff4444';
            probability = 0.9;
          } else if (start.type === 'hub' || end.type === 'hub') {
            routeType = 'international_major';
            color = '#ff8844';
            probability = 0.7;
          } else {
            routeType = 'international_regional';
            color = '#44ff44';
            probability = 0.4;
          }
        }
        
        // Filter routes based on probability and distance
        if (Math.random() < probability && distance > 5) {
          routes.push({
            id: `${start.code}-${end.code}`,
            startLat: start.lat,
            startLng: start.lng,
            endLat: end.lat,
            endLng: end.lng,
            startAirport: start,
            endAirport: end,
            color: color,
            type: routeType,
            distance: Math.round(distance * 111), // Convert to km
            airline: `${start.code}→${end.code}`,
            duration: Math.round(distance * 111 / 800 * 60), // Estimated flight time in minutes
            frequency: routeType === 'international_hub' ? 'Daily' : 
                      routeType === 'international_major' ? 'Weekly' : 'Monthly'
          });
        }
      }
    }

    // Sort by distance and take top routes
    const sortedRoutes = routes.sort((a, b) => b.distance - a.distance).slice(0, 80);

    res.status(200).json({
      routes: sortedRoutes,
      airports: airports,
      totalRoutes: sortedRoutes.length,
      hubAirports: airports.filter(a => a.type === 'hub').length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching airline routes:', error);
    res.status(500).json({ error: 'Failed to fetch airline routes data' });
  }
} 
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch OpenSky Network data server-side
    const response = await fetch('https://opensky-network.org/api/states/all');
    
    if (!response.ok) {
      throw new Error(`OpenSky API error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.states) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        timestamp: new Date().toISOString()
      });
    }

    // Process and filter flight data
    const flights = data.states
      .filter(state => state[5] && state[6] && state[7]) // Filter out invalid positions
      .slice(0, 100) // Limit to 100 flights for performance
      .map(state => ({
        icao24: state[0],
        callsign: state[1]?.trim() || 'Unknown',
        originCountry: state[2],
        longitude: state[5],
        latitude: state[6],
        altitude: state[7],
        velocity: state[9],
        heading: state[10],
        verticalRate: state[11],
        onGround: state[8]
      }))
      .filter(flight => !flight.onGround); // Only airborne flights
    
    // Set cache headers - cache for 2 minutes (flight data changes quickly)
    res.setHeader('Cache-Control', 'public, s-maxage=120, max-age=120');
    
    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to fetch flight data:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch flight data',
      message: error.message
    });
  }
} 
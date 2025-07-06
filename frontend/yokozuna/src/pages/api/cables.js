export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch SubmarineCableMap data server-side
    const response = await fetch('https://www.submarinecablemap.com/api/v3/cable/cable-geo.json');
    
    if (!response.ok) {
      throw new Error(`SubmarineCableMap API error! status: ${response.status}`);
    }
    
    const cablesGeo = await response.json();
    
    // Process cable data
    const cablePaths = [];
    if (cablesGeo.features) {
      cablesGeo.features.forEach(({ geometry, properties }) => {
        if (geometry && geometry.coordinates) {
          geometry.coordinates.forEach(coords => {
            cablePaths.push({ 
              coords, 
              properties: {
                name: properties?.name || 'Unknown Cable',
                color: getCableColor(properties)
              }
            });
          });
        }
      });
    }

    // Limit to prevent performance issues
    const limitedCables = cablePaths.slice(0, 100);
    
    // Set cache headers - cache for 6 hours (cable data doesn't change often)
    res.setHeader('Cache-Control', 'public, s-maxage=21600, max-age=21600');
    
    return res.status(200).json({
      success: true,
      count: limitedCables.length,
      data: limitedCables,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to fetch cable data:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch cable data',
      message: error.message
    });
  }
}

function getCableColor(properties) {
  // Color based on cable status or type
  if (properties?.ready_for_service) return '#00ff88';
  if (properties?.is_current) return '#ffaa00';
  return '#888888';
} 
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch TLE data server-side where external APIs work properly
    const response = await fetch('https://celestrak.com/NORAD/elements/stations.txt');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const rawData = await response.text();
    
    // Parse TLE data server-side
    const tleData = rawData.replace(/\r/g, '')
      .split(/\n(?=[^12])/)
      .filter(d => d)
      .map(tle => tle.split('\n'));
      
    // Return structured TLE data
    const satellites = tleData.map(([name, line1, line2]) => ({
      name: name.trim().replace(/^0\s+/, ''),
      line1: line1.trim(),
      line2: line2.trim()
    })).filter(sat => sat.line1 && sat.line2);
    
    // Set cache headers - cache for 1 hour
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600');
    
    return res.status(200).json({
      success: true,
      count: satellites.length,
      data: satellites,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to fetch satellite data:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch satellite data',
      message: error.message
    });
  }
} 
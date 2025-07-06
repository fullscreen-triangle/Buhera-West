export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENCELLID_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenCellID API key not configured');
    }

    // Default to South Africa (MCC 655) if no country specified
    const mcc = req.query.mcc || '655'; // South Africa
    const limit = req.query.limit || '1000';
    const offset = req.query.offset || '0';

    // Fetch cell tower data from OpenCellID API
    const response = await fetch(
      `https://opencellid.org/cell/getAll?key=${apiKey}&mcc=${mcc}&format=json&limit=${limit}&offset=${offset}`
    );
    
    if (!response.ok) {
      throw new Error(`OpenCellID API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.cells) {
      throw new Error('Invalid response format from OpenCellID API');
    }

    // Process and enrich the cell tower data
    const processedCells = data.cells.map(cell => ({
      // Core cell data
      radio: cell.radio || 'unknown',
      mcc: cell.mcc,
      net: cell.net,
      area: cell.area,
      cell: cell.cell,
      lat: parseFloat(cell.lat),
      lon: parseFloat(cell.lon),
      
      // Signal data
      range: cell.range || null,
      samples: cell.samples || 0,
      changeable: cell.changeable || 0,
      averageSignal: cell.averageSignal || null,
      
      // Timestamps
      created: cell.created ? new Date(cell.created * 1000).toISOString() : null,
      updated: cell.updated ? new Date(cell.updated * 1000).toISOString() : null,
      
      // Metadata
      source: 'OpenCellID',
      fetchedAt: new Date().toISOString()
    })).filter(cell => 
      // Filter out cells with invalid coordinates
      cell.lat >= -90 && cell.lat <= 90 && 
      cell.lon >= -180 && cell.lon <= 180 &&
      !isNaN(cell.lat) && !isNaN(cell.lon)
    );

    // Set cache headers - cache for 30 minutes since cell data doesn't change frequently
    res.setHeader('Cache-Control', 'public, s-maxage=1800, max-age=1800');
    
    return res.status(200).json({
      success: true,
      count: processedCells.length,
      data: processedCells,
      metadata: {
        mcc: mcc,
        country: mcc === '655' ? 'South Africa' : 'Unknown',
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: processedCells.length === parseInt(limit)
      },
      timestamp: new Date().toISOString(),
      source: 'OpenCellID API'
    });
    
  } catch (error) {
    console.error('Failed to fetch cell tower data:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch cell tower data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 
// API endpoint for maritime traffic data
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Major world ports with real coordinates
    const ports = [
      { code: 'SHA', name: 'Shanghai', lat: 31.2304, lng: 121.4737, country: 'China', type: 'mega' },
      { code: 'SIN', name: 'Singapore', lat: 1.2966, lng: 103.7764, country: 'Singapore', type: 'mega' },
      { code: 'NGB', name: 'Ningbo-Zhoushan', lat: 29.8683, lng: 121.5440, country: 'China', type: 'mega' },
      { code: 'SHZ', name: 'Shenzhen', lat: 22.5431, lng: 114.0579, country: 'China', type: 'mega' },
      { code: 'GZO', name: 'Guangzhou', lat: 23.1291, lng: 113.2644, country: 'China', type: 'major' },
      { code: 'BUS', name: 'Busan', lat: 35.1796, lng: 129.0756, country: 'South Korea', type: 'major' },
      { code: 'HKG', name: 'Hong Kong', lat: 22.3193, lng: 114.1694, country: 'China', type: 'mega' },
      { code: 'LAX', name: 'Los Angeles', lat: 33.7175, lng: -118.2707, country: 'USA', type: 'mega' },
      { code: 'LGB', name: 'Long Beach', lat: 33.7701, lng: -118.2037, country: 'USA', type: 'major' },
      { code: 'ANT', name: 'Antwerp', lat: 51.2194, lng: 4.4025, country: 'Belgium', type: 'major' },
      { code: 'RTM', name: 'Rotterdam', lat: 51.9244, lng: 4.4777, country: 'Netherlands', type: 'mega' },
      { code: 'HAM', name: 'Hamburg', lat: 53.5511, lng: 9.9937, country: 'Germany', type: 'major' },
      { code: 'NYC', name: 'New York/New Jersey', lat: 40.6892, lng: -74.0445, country: 'USA', type: 'mega' },
      { code: 'SVN', name: 'Savannah', lat: 32.1313, lng: -81.1637, country: 'USA', type: 'major' },
      { code: 'JEB', name: 'Jebel Ali', lat: 25.0118, lng: 55.1334, country: 'UAE', type: 'mega' },
      { code: 'TAN', name: 'Tanjung Pelepas', lat: 1.3644, lng: 103.5500, country: 'Malaysia', type: 'major' },
      { code: 'KLG', name: 'Klang', lat: 3.0020, lng: 101.3932, country: 'Malaysia', type: 'major' },
      { code: 'LAE', name: 'Laem Chabang', lat: 13.0827, lng: 100.8833, country: 'Thailand', type: 'major' },
      { code: 'COL', name: 'Colombo', lat: 6.9271, lng: 79.8612, country: 'Sri Lanka', type: 'regional' },
      { code: 'KHI', name: 'Karachi', lat: 24.8607, lng: 67.0011, country: 'Pakistan', type: 'regional' },
      { code: 'MUM', name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'India', type: 'major' },
      { code: 'SAO', name: 'Santos', lat: -23.9618, lng: -46.3322, country: 'Brazil', type: 'major' },
      { code: 'CPT', name: 'Cape Town', lat: -33.9249, lng: 18.4241, country: 'South Africa', type: 'regional' },
      { code: 'DUR', name: 'Durban', lat: -29.8587, lng: 31.0218, country: 'South Africa', type: 'regional' },
      { code: 'SUZ', name: 'Suez Canal', lat: 30.5852, lng: 32.2635, country: 'Egypt', type: 'transit' }
    ];

    // Major shipping routes with waypoints
    const shippingRoutes = [
      // Asia-Europe routes
      {
        name: 'Asia-Europe Main Line',
        type: 'container',
        color: '#ff4444',
        coords: [
          [121.4737, 31.2304], // Shanghai
          [103.7764, 1.2966],  // Singapore
          [79.8612, 6.9271],   // Colombo
          [32.2635, 30.5852],  // Suez Canal
          [4.4777, 51.9244],   // Rotterdam
          [4.4025, 51.2194]    // Antwerp
        ],
        cargo: 'Electronics, Machinery, Textiles',
        volume: '24M TEU/year'
      },
      // Transpacific routes
      {
        name: 'Transpacific Eastbound',
        type: 'container',
        color: '#4444ff',
        coords: [
          [121.4737, 31.2304], // Shanghai
          [114.0579, 22.5431], // Shenzhen
          [114.1694, 22.3193], // Hong Kong
          [-118.2707, 33.7175], // Los Angeles
          [-118.2037, 33.7701], // Long Beach
          [-74.0445, 40.6892]   // New York
        ],
        cargo: 'Consumer Goods, Electronics',
        volume: '18M TEU/year'
      },
      // Transatlantic routes
      {
        name: 'Transatlantic Main',
        type: 'container',
        color: '#44ff44',
        coords: [
          [4.4777, 51.9244],   // Rotterdam
          [4.4025, 51.2194],   // Antwerp
          [9.9937, 53.5511],   // Hamburg
          [-74.0445, 40.6892], // New York
          [-81.1637, 32.1313]  // Savannah
        ],
        cargo: 'Automotive, Chemicals, Food',
        volume: '8M TEU/year'
      },
      // Asia-Middle East routes
      {
        name: 'Asia-Middle East Service',
        type: 'container',
        color: '#ff8844',
        coords: [
          [121.4737, 31.2304], // Shanghai
          [103.7764, 1.2966],  // Singapore
          [55.1334, 25.0118],  // Jebel Ali
          [67.0011, 24.8607],  // Karachi
          [72.8777, 19.0760]   // Mumbai
        ],
        cargo: 'Oil, Gas, Manufactured Goods',
        volume: '12M TEU/year'
      },
      // Intra-Asia routes
      {
        name: 'Intra-Asia Feeder',
        type: 'feeder',
        color: '#44ffff',
        coords: [
          [121.4737, 31.2304], // Shanghai
          [129.0756, 35.1796], // Busan
          [114.1694, 22.3193], // Hong Kong
          [103.7764, 1.2966],  // Singapore
          [103.5500, 1.3644],  // Tanjung Pelepas
          [100.8833, 13.0827]  // Laem Chabang
        ],
        cargo: 'Regional Trade, Components',
        volume: '6M TEU/year'
      },
      // Cape Route (Alternative to Suez)
      {
        name: 'Cape of Good Hope Route',
        type: 'bulk',
        color: '#ff44ff',
        coords: [
          [121.4737, 31.2304], // Shanghai
          [103.7764, 1.2966],  // Singapore
          [79.8612, 6.9271],   // Colombo
          [18.4241, -33.9249], // Cape Town
          [31.0218, -29.8587], // Durban
          [4.4777, 51.9244]    // Rotterdam
        ],
        cargo: 'Bulk Commodities, Oil',
        volume: '3M TEU/year'
      },
      // South America routes
      {
        name: 'South America Service',
        type: 'container',
        color: '#88ff44',
        coords: [
          [4.4777, 51.9244],   // Rotterdam
          [-46.3322, -23.9618], // Santos
          [-74.0445, 40.6892], // New York
          [-118.2707, 33.7175] // Los Angeles
        ],
        cargo: 'Commodities, Manufactured Goods',
        volume: '4M TEU/year'
      }
    ];

    // Generate vessel positions along routes
    const vessels = [];
    
    shippingRoutes.forEach((route, routeIndex) => {
      const numVessels = route.type === 'container' ? 8 : 
                         route.type === 'bulk' ? 4 : 6;
      
      for (let i = 0; i < numVessels; i++) {
        const progress = (i / numVessels) + (Math.random() * 0.1);
        const coordIndex = Math.floor(progress * (route.coords.length - 1));
        const nextCoordIndex = Math.min(coordIndex + 1, route.coords.length - 1);
        
        const currentCoord = route.coords[coordIndex];
        const nextCoord = route.coords[nextCoordIndex];
        
        const localProgress = (progress * (route.coords.length - 1)) - coordIndex;
        
        const lat = currentCoord[1] + (nextCoord[1] - currentCoord[1]) * localProgress;
        const lng = currentCoord[0] + (nextCoord[0] - currentCoord[0]) * localProgress;
        
        vessels.push({
          id: `${route.name.replace(/\s+/g, '')}_${i}`,
          lat: lat,
          lng: lng,
          name: `${route.type.toUpperCase()} ${i + 1}`,
          route: route.name,
          type: route.type,
          color: route.color,
          speed: route.type === 'container' ? 22 : 
                 route.type === 'bulk' ? 15 : 18,
          cargo: route.cargo,
          status: Math.random() > 0.8 ? 'anchored' : 'underway',
          destination: route.coords[route.coords.length - 1]
        });
      }
    });

    res.status(200).json({
      routes: shippingRoutes,
      vessels: vessels,
      ports: ports,
      totalRoutes: shippingRoutes.length,
      totalVessels: vessels.length,
      majorPorts: ports.filter(p => p.type === 'mega').length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching sea traffic data:', error);
    res.status(500).json({ error: 'Failed to fetch sea traffic data' });
  }
} 
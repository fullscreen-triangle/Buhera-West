import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

/**
 * Cellular Tower Global Map Component
 * 
 * Visualizes the sophisticated cellular infrastructure sensing network including:
 * - Cellular Network Load Analysis & Environmental Correlation
 * - MIMO Signal Harvesting (15,000-50,000 simultaneous signals)
 * - Multi-User Signal Processing & Atmospheric Coupling
 * - Environmental Truth Node Generation
 * - Population Dynamics & Weather Pattern Correlation
 * - Signal Propagation & Atmospheric Inference
 */
const CellTowerGlobalMap = () => {
  // Component state
  const [cellTowers, setCellTowers] = useState([]);
  const [networkLoad, setNetworkLoad] = useState({});
  const [mimoSignals, setMimoSignals] = useState({});
  const [environmentalData, setEnvironmentalData] = useState({});
  const [selectedTower, setSelectedTower] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('network_load'); // 'network_load' | 'mimo_signals' | 'environmental' | 'population'
  const [isRealTime, setIsRealTime] = useState(true);
  const [signalDensity, setSignalDensity] = useState(true);
  
  // D3 refs
  const svgRef = useRef();
  const mapProjection = useRef();
  const pathGenerator = useRef();

  // Map dimensions
  const width = 1200;
  const height = 600;

  // Initialize cellular tower network
  useEffect(() => {
    const initializeCellTowers = () => {
      const towers = [];
      let towerId = 0;

      // Major urban centers with high tower density
      const urbanCenters = [
        { name: 'New York', lat: 40.7128, lon: -74.0060, density: 150 },
        { name: 'London', lat: 51.5074, lon: -0.1278, density: 120 },
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503, density: 180 },
        { name: 'Shanghai', lat: 31.2304, lon: 121.4737, density: 160 },
        { name: 'Mumbai', lat: 19.0760, lon: 72.8777, density: 140 },
        { name: 'São Paulo', lat: -23.5558, lon: -46.6396, density: 110 },
        { name: 'Moscow', lat: 55.7558, lon: 37.6176, density: 100 },
        { name: 'Lagos', lat: 6.5244, lon: 3.3792, density: 90 },
        { name: 'Cairo', lat: 30.0444, lon: 31.2357, density: 85 },
        { name: 'Sydney', lat: -33.8688, lon: 151.2093, density: 95 },
        { name: 'Mexico City', lat: 19.4326, lon: -99.1332, density: 105 },
        { name: 'Jakarta', lat: -6.2088, lon: 106.8456, density: 130 },
        { name: 'Berlin', lat: 52.5200, lon: 13.4050, density: 80 },
        { name: 'Seoul', lat: 37.5665, lon: 126.9780, density: 170 },
        { name: 'Bangkok', lat: 13.7563, lon: 100.5018, density: 125 }
      ];

      // Generate towers for each urban center
      urbanCenters.forEach(center => {
        const towerCount = Math.floor(center.density * (0.8 + Math.random() * 0.4));
        
        for (let i = 0; i < towerCount; i++) {
          // Generate towers in clusters around urban centers
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * 0.5; // degrees
          const lat = center.lat + distance * Math.cos(angle);
          const lon = center.lon + distance * Math.sin(angle);

          const towerType = Math.random() < 0.7 ? '5G' : Math.random() < 0.8 ? '4G' : '3G';
          const antennaCount = towerType === '5G' ? (32 + Math.floor(Math.random() * 33)) : // 32-64 antennas
                              towerType === '4G' ? (8 + Math.floor(Math.random() * 9)) :   // 8-16 antennas
                              (2 + Math.floor(Math.random() * 3));                         // 2-4 antennas

          towers.push({
            id: towerId++,
            name: `${center.name}-Cell-${i + 1}`,
            latitude: lat,
            longitude: lon,
            type: towerType,
            antennaCount,
            maxUsers: towerType === '5G' ? 1000 : towerType === '4G' ? 300 : 100,
            currentUsers: Math.floor(Math.random() * (towerType === '5G' ? 800 : towerType === '4G' ? 250 : 80)),
            signalStrength: 0.7 + Math.random() * 0.3,
            mimoStreams: calculateMIMOStreams(towerType, antennaCount),
            networkLoad: Math.random(),
            temperature: center.lat > 0 ? (10 + Math.random() * 25) : (15 + Math.random() * 30), // Temperature correlation
            humidity: 0.3 + Math.random() * 0.5,
            pressure: 1000 + Math.random() * 50,
            weatherCondition: generateWeatherCondition(),
            populationDensity: Math.floor(Math.random() * 10000) + 1000,
            dataTraffic: Math.random() * 100, // GB/hour
            isActive: Math.random() > 0.05,
            installationDate: new Date(2015 + Math.random() * 8, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
            operator: ['Verizon', 'AT&T', 'T-Mobile', 'Vodafone', 'China Mobile', 'NTT'][Math.floor(Math.random() * 6)]
          });
        }
      });

      // Add rural towers with lower density
      for (let i = 0; i < 200; i++) {
        const lat = (Math.random() - 0.5) * 160; // -80 to 80 degrees
        const lon = (Math.random() - 0.5) * 360; // -180 to 180 degrees
        
        const towerType = Math.random() < 0.3 ? '5G' : Math.random() < 0.7 ? '4G' : '3G';
        const antennaCount = towerType === '5G' ? (16 + Math.floor(Math.random() * 17)) :
                           towerType === '4G' ? (4 + Math.floor(Math.random() * 5)) :
                           (1 + Math.floor(Math.random() * 2));

        towers.push({
          id: towerId++,
          name: `Rural-Cell-${i + 1}`,
          latitude: lat,
          longitude: lon,
          type: towerType,
          antennaCount,
          maxUsers: Math.floor((towerType === '5G' ? 500 : towerType === '4G' ? 150 : 50) * (0.5 + Math.random() * 0.5)),
          currentUsers: Math.floor(Math.random() * 50),
          signalStrength: 0.5 + Math.random() * 0.4,
          mimoStreams: calculateMIMOStreams(towerType, antennaCount),
          networkLoad: Math.random() * 0.7,
          temperature: lat > 0 ? (-10 + Math.random() * 40) : (0 + Math.random() * 35),
          humidity: 0.2 + Math.random() * 0.6,
          pressure: 950 + Math.random() * 100,
          weatherCondition: generateWeatherCondition(),
          populationDensity: Math.floor(Math.random() * 500) + 10,
          dataTraffic: Math.random() * 20,
          isActive: Math.random() > 0.1,
          installationDate: new Date(2010 + Math.random() * 13, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
          operator: ['Rural Networks', 'Regional Cellular', 'Local Wireless'][Math.floor(Math.random() * 3)]
        });
      }

      setCellTowers(towers);
    };

    initializeCellTowers();
  }, []);

  // Calculate MIMO stream count based on technology and antennas
  const calculateMIMOStreams = (type, antennaCount) => {
    const baseStreams = type === '5G' ? antennaCount * antennaCount : // Massive MIMO for 5G
                       type === '4G' ? antennaCount * 8 :              // Multi-user MIMO for 4G
                       antennaCount * 2;                               // Basic MIMO for 3G
    
    // Add demultiplexing factor (each stream split into multiple signals)
    const demuxFactor = type === '5G' ? 16 : type === '4G' ? 8 : 4;
    return baseStreams * demuxFactor;
  };

  // Generate weather conditions
  const generateWeatherCondition = () => {
    const conditions = ['clear', 'cloudy', 'rain', 'storm', 'fog', 'snow', 'haze'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  };

  // Initialize D3 map projection
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Setup projection
    mapProjection.current = d3.geoNaturalEarth1()
      .scale(190)
      .translate([width / 2, height / 2]);

    pathGenerator.current = d3.geoPath().projection(mapProjection.current);

    // Draw world map
    const drawWorld = () => {
      const worldData = generateSimpleWorldFeatures();
      
      svg.append("g")
        .selectAll("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator.current)
        .attr("fill", "#1a1a1a")
        .attr("stroke", "#444")
        .attr("stroke-width", 0.5);

      // Add graticule
      const graticule = d3.geoGraticule();
      svg.append("path")
        .datum(graticule())
        .attr("d", pathGenerator.current)
        .attr("fill", "none")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.3)
        .attr("opacity", 0.5);
    };

    drawWorld();
  }, [width, height]);

  // Generate simple world features
  const generateSimpleWorldFeatures = () => {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]]]
          }
        }
      ]
    };
  };

  // Real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const updateTowers = () => {
      setCellTowers(prev => prev.map(tower => {
        // Simulate network load changes
        const loadVariation = (Math.random() - 0.5) * 0.1;
        let newLoad = Math.max(0, Math.min(1, tower.networkLoad + loadVariation));

        // Simulate user count changes
        const userVariation = Math.floor((Math.random() - 0.5) * 20);
        let newUsers = Math.max(0, Math.min(tower.maxUsers, tower.currentUsers + userVariation));

        // Weather correlation - storms increase network load
        if (tower.weatherCondition === 'storm') {
          newLoad = Math.min(1, newLoad + 0.2);
          newUsers = Math.min(tower.maxUsers, newUsers + 50);
        }

        // Environmental correlation - rain affects signal propagation
        let signalStrength = tower.signalStrength;
        if (tower.weatherCondition === 'rain' || tower.weatherCondition === 'storm') {
          signalStrength = Math.max(0.3, signalStrength - 0.1);
        }

        return {
          ...tower,
          networkLoad: newLoad,
          currentUsers: newUsers,
          signalStrength: signalStrength,
          dataTraffic: Math.max(0, tower.dataTraffic + (Math.random() - 0.5) * 10),
          temperature: tower.temperature + (Math.random() - 0.5) * 2,
          humidity: Math.max(0, Math.min(1, tower.humidity + (Math.random() - 0.5) * 0.05)),
          lastUpdate: Date.now()
        };
      }));
    };

    const interval = setInterval(updateTowers, 3000);
    return () => clearInterval(interval);
  }, [isRealTime]);

  // Draw towers and analysis overlays
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    // Clear previous elements
    svg.selectAll(".cell-tower").remove();
    svg.selectAll(".network-overlay").remove();
    svg.selectAll(".mimo-signal").remove();
    svg.selectAll(".coverage-area").remove();

    // Draw coverage areas and signal density
    if (signalDensity) {
      drawSignalDensity(svg);
    }

    // Draw analysis overlays based on mode
    switch (analysisMode) {
      case 'network_load':
        drawNetworkLoadOverlay(svg);
        break;
      case 'mimo_signals':
        drawMIMOSignalOverlay(svg);
        break;
      case 'environmental':
        drawEnvironmentalOverlay(svg);
        break;
      case 'population':
        drawPopulationOverlay(svg);
        break;
    }

    // Draw cell towers
    const towerGroup = svg.append("g").attr("class", "cell-towers");
    
    cellTowers.forEach(tower => {
      const [x, y] = mapProjection.current([tower.longitude, tower.latitude]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const towerGroup = svg.append("g")
          .attr("class", "cell-tower")
          .attr("transform", `translate(${x}, ${y})`);

        // Tower base
        const towerColor = getTowerColor(tower.type);
        const towerSize = tower.type === '5G' ? 6 : tower.type === '4G' ? 4 : 3;

        towerGroup.append("circle")
          .attr("r", towerSize)
          .attr("fill", towerColor)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("opacity", tower.isActive ? 0.9 : 0.5)
          .style("cursor", "pointer")
          .on("click", () => setSelectedTower(tower))
          .on("mouseover", function() {
            d3.select(this).attr("r", towerSize + 2).attr("stroke-width", 2);
            showTowerTooltip(tower, x, y);
          })
          .on("mouseout", function() {
            d3.select(this).attr("r", towerSize).attr("stroke-width", 1);
            hideTooltip();
          });

        // Network load indicator
        if (analysisMode === 'network_load' && tower.networkLoad > 0.7) {
          towerGroup.append("circle")
            .attr("r", 12)
            .attr("fill", "none")
            .attr("stroke", "#ff4444")
            .attr("stroke-width", 2)
            .attr("opacity", 0.7)
            .style("animation", "pulse 2s infinite");
        }

        // MIMO signal visualization
        if (analysisMode === 'mimo_signals' && tower.type === '5G') {
          const streamCount = Math.min(8, tower.mimoStreams / 1000);
          for (let i = 0; i < streamCount; i++) {
            const angle = (i / streamCount) * 2 * Math.PI;
            const radius = 15 + i * 3;
            
            towerGroup.append("circle")
              .attr("cx", Math.cos(angle) * radius)
              .attr("cy", Math.sin(angle) * radius)
              .attr("r", 2)
              .attr("fill", "#00ffff")
              .attr("opacity", 0.8)
              .style("animation", `orbit${i} 3s infinite linear`);
          }
        }

        // Environmental correlation indicator
        if (analysisMode === 'environmental') {
          const weatherColor = getWeatherColor(tower.weatherCondition);
          towerGroup.append("rect")
            .attr("x", -8)
            .attr("y", 8)
            .attr("width", 16)
            .attr("height", 4)
            .attr("fill", weatherColor)
            .attr("opacity", 0.8);
        }

        // Population density indicator
        if (analysisMode === 'population') {
          const populationScale = d3.scaleLinear().domain([0, 10000]).range([0, 20]);
          towerGroup.append("circle")
            .attr("r", populationScale(tower.populationDensity))
            .attr("fill", "none")
            .attr("stroke", "#ffaa00")
            .attr("stroke-width", 1)
            .attr("opacity", 0.6);
        }

        // Antenna count indicator
        if (tower.type === '5G' && tower.antennaCount > 32) {
          towerGroup.append("polygon")
            .attr("points", "-3,-10 0,-15 3,-10")
            .attr("fill", "#ffffff")
            .attr("opacity", 0.9);
        }
      }
    });

  }, [cellTowers, analysisMode, signalDensity, mapProjection.current]);

  // Get tower color based on type
  const getTowerColor = (type) => {
    switch (type) {
      case '5G': return '#00ff00';
      case '4G': return '#ff8800';
      case '3G': return '#ff0044';
      default: return '#888888';
    }
  };

  // Get weather color
  const getWeatherColor = (condition) => {
    const colors = {
      clear: '#ffff00',
      cloudy: '#888888',
      rain: '#0088ff',
      storm: '#ff0044',
      fog: '#cccccc',
      snow: '#ffffff',
      haze: '#ffaa88'
    };
    return colors[condition] || '#888888';
  };

  // Draw signal density visualization
  const drawSignalDensity = (svg) => {
    const densityData = generateSignalDensityGrid();
    
    densityData.forEach(cell => {
      const [x, y] = mapProjection.current([cell.lon, cell.lat]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const opacity = Math.min(0.6, cell.signalDensity / 50000);
        
        svg.append("rect")
          .attr("class", "network-overlay")
          .attr("x", x - 15)
          .attr("y", y - 15)
          .attr("width", 30)
          .attr("height", 30)
          .attr("fill", "#00ffff")
          .attr("opacity", opacity);
      }
    });
  };

  // Draw network load overlay
  const drawNetworkLoadOverlay = (svg) => {
    const loadData = generateNetworkLoadGrid();
    
    loadData.forEach(cell => {
      const [x, y] = mapProjection.current([cell.lon, cell.lat]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const color = d3.interpolateReds(cell.load);
        
        svg.append("circle")
          .attr("class", "network-overlay")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 10)
          .attr("fill", color)
          .attr("opacity", 0.5);
      }
    });
  };

  // Draw MIMO signal overlay
  const drawMIMOSignalOverlay = (svg) => {
    const mimoData = generateMIMOGrid();
    
    mimoData.forEach(cell => {
      const [x, y] = mapProjection.current([cell.lon, cell.lat]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const color = d3.interpolateViridis(cell.streams / 100000);
        
        svg.append("rect")
          .attr("class", "network-overlay")
          .attr("x", x - 8)
          .attr("y", y - 8)
          .attr("width", 16)
          .attr("height", 16)
          .attr("fill", color)
          .attr("opacity", 0.7);
      }
    });
  };

  // Draw environmental overlay
  const drawEnvironmentalOverlay = (svg) => {
    const envData = generateEnvironmentalGrid();
    
    envData.forEach(cell => {
      const [x, y] = mapProjection.current([cell.lon, cell.lat]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const color = d3.interpolateBlues(cell.correlation);
        
        svg.append("circle")
          .attr("class", "network-overlay")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 12)
          .attr("fill", color)
          .attr("opacity", 0.4);
      }
    });
  };

  // Draw population overlay
  const drawPopulationOverlay = (svg) => {
    const popData = generatePopulationGrid();
    
    popData.forEach(cell => {
      const [x, y] = mapProjection.current([cell.lon, cell.lat]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const color = d3.interpolateOranges(cell.density / 15000);
        
        svg.append("rect")
          .attr("class", "network-overlay")
          .attr("x", x - 12)
          .attr("y", y - 12)
          .attr("width", 24)
          .attr("height", 24)
          .attr("fill", color)
          .attr("opacity", 0.5);
      }
    });
  };

  // Generate grid data functions
  const generateSignalDensityGrid = () => {
    const grid = [];
    for (let lat = -60; lat <= 60; lat += 10) {
      for (let lon = -180; lon <= 180; lon += 20) {
        const nearbyTowers = cellTowers.filter(tower => 
          Math.abs(tower.latitude - lat) < 5 && Math.abs(tower.longitude - lon) < 10
        );
        const signalDensity = nearbyTowers.reduce((sum, tower) => sum + tower.mimoStreams, 0);
        
        if (signalDensity > 1000) {
          grid.push({ lat, lon, signalDensity });
        }
      }
    }
    return grid;
  };

  const generateNetworkLoadGrid = () => {
    const grid = [];
    for (let lat = -70; lat <= 70; lat += 15) {
      for (let lon = -180; lon <= 180; lon += 25) {
        const load = Math.random();
        grid.push({ lat, lon, load });
      }
    }
    return grid;
  };

  const generateMIMOGrid = () => {
    const grid = [];
    for (let lat = -60; lat <= 60; lat += 12) {
      for (let lon = -180; lon <= 180; lon += 20) {
        const streams = Math.random() * 80000 + 10000;
        grid.push({ lat, lon, streams });
      }
    }
    return grid;
  };

  const generateEnvironmentalGrid = () => {
    const grid = [];
    for (let lat = -50; lat <= 50; lat += 18) {
      for (let lon = -180; lon <= 180; lon += 30) {
        const correlation = Math.random() * 0.8 + 0.2;
        grid.push({ lat, lon, correlation });
      }
    }
    return grid;
  };

  const generatePopulationGrid = () => {
    const grid = [];
    for (let lat = -60; lat <= 60; lat += 20) {
      for (let lon = -180; lon <= 180; lon += 30) {
        const density = Math.random() * 12000 + 1000;
        grid.push({ lat, lon, density });
      }
    }
    return grid;
  };

  // Tooltip functions
  const showTowerTooltip = (tower, x, y) => {
    const tooltip = d3.select("body").append("div")
      .attr("class", "tower-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "6px")
      .style("font-size", "11px")
      .style("pointer-events", "none")
      .style("z-index", 1000)
      .style("left", (x + 15) + "px")
      .style("top", (y - 10) + "px");

    tooltip.html(`
      <strong>${tower.name}</strong><br/>
      Type: ${tower.type} (${tower.antennaCount} antennas)<br/>
      Users: ${tower.currentUsers}/${tower.maxUsers}<br/>
      Network Load: ${(tower.networkLoad * 100).toFixed(1)}%<br/>
      MIMO Streams: ${tower.mimoStreams.toLocaleString()}<br/>
      Signal Strength: ${(tower.signalStrength * 100).toFixed(1)}%<br/>
      Data Traffic: ${tower.dataTraffic.toFixed(1)} GB/h<br/>
      Weather: ${tower.weatherCondition}<br/>
      Temperature: ${tower.temperature.toFixed(1)}°C<br/>
      Population Density: ${tower.populationDensity.toLocaleString()}/km²<br/>
      Operator: ${tower.operator}
    `);
  };

  const hideTooltip = () => {
    d3.selectAll(".tower-tooltip").remove();
  };

  return (
    <div className="cell-tower-global-map" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1000,
        minWidth: '280px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>📡 Cellular Network Infrastructure</h3>
        
        {/* Analysis Mode */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Analysis Mode:
          </label>
          <select 
            value={analysisMode} 
            onChange={(e) => setAnalysisMode(e.target.value)}
            style={{ width: '100%', padding: '5px', borderRadius: '3px' }}
          >
            <option value="network_load">Network Load Analysis</option>
            <option value="mimo_signals">MIMO Signal Harvesting</option>
            <option value="environmental">Environmental Correlation</option>
            <option value="population">Population Dynamics</option>
          </select>
        </div>

        {/* Options */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '8px' }}>
            <input 
              type="checkbox" 
              checked={isRealTime} 
              onChange={(e) => setIsRealTime(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Real-time Updates
          </label>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input 
              type="checkbox" 
              checked={signalDensity} 
              onChange={(e) => setSignalDensity(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Signal Density Overlay
          </label>
        </div>

        {/* Statistics */}
        <div style={{ fontSize: '11px', opacity: 0.9 }}>
          <div>Total Towers: {cellTowers.length}</div>
          <div>5G Towers: {cellTowers.filter(t => t.type === '5G').length}</div>
          <div>4G Towers: {cellTowers.filter(t => t.type === '4G').length}</div>
          <div>Active Towers: {cellTowers.filter(t => t.isActive).length}</div>
          <div>Total MIMO Signals: {cellTowers.reduce((sum, t) => sum + t.mimoStreams, 0).toLocaleString()}</div>
          <div>Avg Network Load: {cellTowers.length > 0 ? 
            (cellTowers.reduce((sum, t) => sum + t.networkLoad, 0) / cellTowers.length * 100).toFixed(1) : 0}%</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1000,
        maxWidth: '180px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Tower Types</h4>
        <div style={{ fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#00ff00', marginRight: '8px', borderRadius: '50%' }}></div>
            5G ({cellTowers.filter(t => t.type === '5G').length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#ff8800', marginRight: '8px', borderRadius: '50%' }}></div>
            4G ({cellTowers.filter(t => t.type === '4G').length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#ff0044', marginRight: '8px', borderRadius: '50%' }}></div>
            3G ({cellTowers.filter(t => t.type === '3G').length})
          </div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Circle size indicates antenna count<br/>
            Pulse indicates high network load
          </div>
        </div>
      </div>

      {/* Selected Tower Details */}
      {selectedTower && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          zIndex: 1000,
          maxWidth: '350px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '14px' }}>
              {selectedTower.name}
            </h4>
            <button 
              onClick={() => setSelectedTower(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'white', 
                fontSize: '16px', 
                cursor: 'pointer' 
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '11px' }}>
            <div><strong>Technology:</strong> {selectedTower.type} ({selectedTower.antennaCount} antennas)</div>
            <div><strong>Location:</strong> {selectedTower.latitude.toFixed(3)}°, {selectedTower.longitude.toFixed(3)}°</div>
            <div><strong>Network Load:</strong> {(selectedTower.networkLoad * 100).toFixed(1)}%</div>
            <div><strong>Users:</strong> {selectedTower.currentUsers}/{selectedTower.maxUsers}</div>
            <div><strong>MIMO Streams:</strong> {selectedTower.mimoStreams.toLocaleString()}</div>
            <div><strong>Signal Strength:</strong> {(selectedTower.signalStrength * 100).toFixed(1)}%</div>
            <div><strong>Data Traffic:</strong> {selectedTower.dataTraffic.toFixed(1)} GB/hour</div>
            <div><strong>Weather:</strong> {selectedTower.weatherCondition}</div>
            <div><strong>Temperature:</strong> {selectedTower.temperature.toFixed(1)}°C</div>
            <div><strong>Humidity:</strong> {(selectedTower.humidity * 100).toFixed(1)}%</div>
            <div><strong>Population Density:</strong> {selectedTower.populationDensity.toLocaleString()}/km²</div>
            <div><strong>Operator:</strong> {selectedTower.operator}</div>
            <div><strong>Installed:</strong> {selectedTower.installationDate.toLocaleDateString()}</div>
          </div>
        </div>
      )}

      {/* Main Map */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ 
          background: '#0a0a0a',
          border: '1px solid #333'
        }}
      />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.7; transform: scale(1); }
        }
        @keyframes orbit0 {
          from { transform: rotate(0deg) translateX(15px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(15px) rotate(-360deg); }
        }
        @keyframes orbit1 {
          from { transform: rotate(45deg) translateX(18px) rotate(-45deg); }
          to { transform: rotate(405deg) translateX(18px) rotate(-405deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(90deg) translateX(21px) rotate(-90deg); }
          to { transform: rotate(450deg) translateX(21px) rotate(-450deg); }
        }
      `}</style>
    </div>
  );
};

export default CellTowerGlobalMap;

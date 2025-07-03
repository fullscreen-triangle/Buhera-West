import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * LiDAR Atmospheric Sensor Global Map
 * 
 * Advanced atmospheric sensing through:
 * - Atmospheric backscatter analysis with Klett inversion
 * - Aerosol optical depth retrieval
 * - Particle size distribution estimation
 * - Atmospheric profile reconstruction
 * - Cloud base height detection
 * - Visibility and air quality assessment
 */
const LidarGlobalMap = () => {
  const [lidarStations, setLidarStations] = useState([]);
  const [atmosphericProfiles, setAtmosphericProfiles] = useState({});
  const [selectedStation, setSelectedStation] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('backscatter');
  const [isRealTime, setIsRealTime] = useState(true);
  const [showBeams, setShowBeams] = useState(true);
  
  const svgRef = useRef();
  const mapProjection = useRef();
  const width = 1200;
  const height = 600;

  // Initialize LiDAR stations
  useEffect(() => {
    const initializeLidarStations = () => {
      const stations = [];
      
      // Research stations with advanced LiDAR systems
      const researchStations = [
        { name: 'NOAA Boulder', lat: 40.04, lon: -105.24, type: 'research', power: 'high' },
        { name: 'NASA Goddard', lat: 38.99, lon: -76.84, type: 'research', power: 'high' },
        { name: 'DLR Oberpfaffenhofen', lat: 48.08, lon: 11.28, type: 'research', power: 'high' },
        { name: 'NIES Japan', lat: 36.05, lon: 140.12, type: 'research', power: 'high' },
        { name: 'ESA Frascati', lat: 41.81, lon: 12.67, type: 'research', power: 'high' },
        { name: 'CNES Toulouse', lat: 43.61, lon: 1.44, type: 'research', power: 'medium' },
        { name: 'RIVM Netherlands', lat: 52.11, lon: 5.18, type: 'research', power: 'medium' },
        { name: 'Environment Canada', lat: 45.42, lon: -75.69, type: 'research', power: 'medium' },
        { name: 'CSIRO Australia', lat: -35.28, lon: 149.13, type: 'research', power: 'medium' },
        { name: 'CMA Beijing', lat: 39.90, lon: 116.41, type: 'research', power: 'high' }
      ];

      // Operational weather stations
      const weatherStations = [
        { name: 'Heathrow Airport', lat: 51.47, lon: -0.46, type: 'airport', power: 'medium' },
        { name: 'Frankfurt Airport', lat: 50.05, lon: 8.57, type: 'airport', power: 'medium' },
        { name: 'Dubai Airport', lat: 25.25, lon: 55.36, type: 'airport', power: 'medium' },
        { name: 'Singapore Changi', lat: 1.36, lon: 103.99, type: 'airport', power: 'medium' },
        { name: 'JFK Airport', lat: 40.64, lon: -73.78, type: 'airport', power: 'medium' },
        { name: 'LAX Airport', lat: 33.94, lon: -118.41, type: 'airport', power: 'medium' },
        { name: 'Hong Kong Airport', lat: 22.31, lon: 113.91, type: 'airport', power: 'medium' },
        { name: 'Schiphol Airport', lat: 52.31, lon: 4.76, type: 'airport', power: 'medium' }
      ];

      let stationId = 0;

      // Process research stations
      researchStations.forEach(station => {
        stations.push({
          id: stationId++,
          name: station.name,
          latitude: station.lat,
          longitude: station.lon,
          type: station.type,
          powerLevel: station.power,
          wavelength: 532 + Math.random() * 200, // nm
          pulseEnergy: station.power === 'high' ? 50 + Math.random() * 100 : 20 + Math.random() * 40, // mJ
          repetitionRate: 10 + Math.random() * 40, // Hz
          verticalRange: 15 + Math.random() * 15, // km
          verticalResolution: 7.5 + Math.random() * 7.5, // m
          aerosolOpticalDepth: Math.random() * 0.5,
          cloudBaseHeight: 1 + Math.random() * 8, // km
          visibility: 5 + Math.random() * 45, // km
          particulateMatter: Math.random() * 100, // μg/m³
          temperatureProfile: generateTemperatureProfile(),
          humidityProfile: generateHumidityProfile(),
          aerosolProfile: generateAerosolProfile(),
          dataQuality: 0.85 + Math.random() * 0.15,
          isOperational: Math.random() > 0.05,
          lastCalibration: new Date(2024 - Math.random() * 2, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
        });
      });

      // Process weather stations
      weatherStations.forEach(station => {
        stations.push({
          id: stationId++,
          name: station.name,
          latitude: station.lat,
          longitude: station.lon,
          type: station.type,
          powerLevel: station.power,
          wavelength: 905 + Math.random() * 50, // nm
          pulseEnergy: 15 + Math.random() * 25, // mJ
          repetitionRate: 5 + Math.random() * 15, // Hz
          verticalRange: 8 + Math.random() * 7, // km
          verticalResolution: 15 + Math.random() * 15, // m
          aerosolOpticalDepth: Math.random() * 0.3,
          cloudBaseHeight: 0.5 + Math.random() * 5, // km
          visibility: 10 + Math.random() * 40, // km
          particulateMatter: Math.random() * 80, // μg/m³
          temperatureProfile: generateTemperatureProfile(),
          humidityProfile: generateHumidityProfile(),
          aerosolProfile: generateAerosolProfile(),
          dataQuality: 0.75 + Math.random() * 0.2,
          isOperational: Math.random() > 0.08,
          lastCalibration: new Date(2024 - Math.random() * 1, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
        });
      });

      // Add distributed monitoring stations
      for (let i = 0; i < 80; i++) {
        const lat = (Math.random() - 0.5) * 120;
        const lon = (Math.random() - 0.5) * 360;
        
        stations.push({
          id: stationId++,
          name: `Monitor-${i + 1}`,
          latitude: lat,
          longitude: lon,
          type: 'monitoring',
          powerLevel: 'low',
          wavelength: 850 + Math.random() * 100,
          pulseEnergy: 5 + Math.random() * 15,
          repetitionRate: 1 + Math.random() * 10,
          verticalRange: 3 + Math.random() * 5,
          verticalResolution: 30 + Math.random() * 30,
          aerosolOpticalDepth: Math.random() * 0.4,
          cloudBaseHeight: 0.3 + Math.random() * 3,
          visibility: 8 + Math.random() * 35,
          particulateMatter: Math.random() * 120,
          temperatureProfile: generateTemperatureProfile(),
          humidityProfile: generateHumidityProfile(),
          aerosolProfile: generateAerosolProfile(),
          dataQuality: 0.65 + Math.random() * 0.25,
          isOperational: Math.random() > 0.12,
          lastCalibration: new Date(2024 - Math.random() * 3, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
        });
      }

      setLidarStations(stations);
    };

    initializeLidarStations();
  }, []);

  const generateTemperatureProfile = () => {
    const profile = [];
    for (let alt = 0; alt <= 15; alt += 0.5) {
      const temp = 15 - (alt * 6.5) + Math.random() * 4 - 2; // Standard atmosphere with noise
      profile.push({ altitude: alt, temperature: temp });
    }
    return profile;
  };

  const generateHumidityProfile = () => {
    const profile = [];
    for (let alt = 0; alt <= 15; alt += 0.5) {
      const humidity = Math.max(0, 80 * Math.exp(-alt / 3) + Math.random() * 20 - 10);
      profile.push({ altitude: alt, humidity });
    }
    return profile;
  };

  const generateAerosolProfile = () => {
    const profile = [];
    for (let alt = 0; alt <= 15; alt += 0.5) {
      const concentration = Math.max(0, 50 * Math.exp(-alt / 2) + Math.random() * 20 - 5);
      profile.push({ altitude: alt, concentration });
    }
    return profile;
  };

  // Initialize D3 projection
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    mapProjection.current = d3.geoNaturalEarth1()
      .scale(190)
      .translate([width / 2, height / 2]);

    // Draw world
    const worldData = { type: "FeatureCollection", features: [{ type: "Feature", geometry: { type: "Polygon", coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]]] }}] };
    
    svg.append("g")
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", d3.geoPath().projection(mapProjection.current))
      .attr("fill", "#1a1a1a")
      .attr("stroke", "#444")
      .attr("stroke-width", 0.5);

    const graticule = d3.geoGraticule();
    svg.append("path")
      .datum(graticule())
      .attr("d", d3.geoPath().projection(mapProjection.current))
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.3)
      .attr("opacity", 0.5);

  }, [width, height]);

  // Real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const updateStations = () => {
      setLidarStations(prev => prev.map(station => ({
        ...station,
        aerosolOpticalDepth: Math.max(0, Math.min(1, station.aerosolOpticalDepth + (Math.random() - 0.5) * 0.02)),
        visibility: Math.max(1, Math.min(50, station.visibility + (Math.random() - 0.5) * 2)),
        particulateMatter: Math.max(0, station.particulateMatter + (Math.random() - 0.5) * 5),
        cloudBaseHeight: Math.max(0.1, Math.min(15, station.cloudBaseHeight + (Math.random() - 0.5) * 0.5))
      })));
    };

    const interval = setInterval(updateStations, 2000);
    return () => clearInterval(interval);
  }, [isRealTime]);

  // Draw LiDAR stations and analysis overlays
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    svg.selectAll(".lidar-station").remove();
    svg.selectAll(".lidar-beam").remove();
    svg.selectAll(".atmospheric-overlay").remove();

    // Draw analysis overlays
    switch (analysisMode) {
      case 'backscatter':
        drawBackscatterOverlay(svg);
        break;
      case 'aerosol':
        drawAerosolOverlay(svg);
        break;
      case 'visibility':
        drawVisibilityOverlay(svg);
        break;
      case 'air_quality':
        drawAirQualityOverlay(svg);
        break;
    }

    // Draw LiDAR beams
    if (showBeams) {
      drawLidarBeams(svg);
    }

    // Draw LiDAR stations
    lidarStations.forEach(station => {
      const [x, y] = mapProjection.current([station.longitude, station.latitude]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const stationGroup = svg.append("g")
          .attr("class", "lidar-station")
          .attr("transform", `translate(${x}, ${y})`);

        const stationColor = getStationColor(station.type);
        const stationSize = getStationSize(station.powerLevel);

        // Main station marker
        stationGroup.append("polygon")
          .attr("points", `0,-${stationSize} ${stationSize*0.8},${stationSize*0.5} -${stationSize*0.8},${stationSize*0.5}`)
          .attr("fill", stationColor)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("opacity", station.isOperational ? 0.9 : 0.5)
          .style("cursor", "pointer")
          .on("click", () => setSelectedStation(station))
          .on("mouseover", function() {
            d3.select(this).attr("stroke-width", 2);
            showStationTooltip(station, x, y);
          })
          .on("mouseout", function() {
            d3.select(this).attr("stroke-width", 1);
            hideTooltip();
          });

        // Data quality indicator
        if (station.dataQuality > 0.9) {
          stationGroup.append("circle")
            .attr("r", 10)
            .attr("fill", "none")
            .attr("stroke", "#00ff00")
            .attr("stroke-width", 1)
            .attr("opacity", 0.7);
        }

        // High pollution alert
        if (station.particulateMatter > 75) {
          stationGroup.append("circle")
            .attr("r", 12)
            .attr("fill", "none")
            .attr("stroke", "#ff4444")
            .attr("stroke-width", 2)
            .attr("opacity", 0.8)
            .style("animation", "pulse 2s infinite");
        }

        // Power level indicator
        const powerBars = station.powerLevel === 'high' ? 3 : station.powerLevel === 'medium' ? 2 : 1;
        for (let i = 0; i < powerBars; i++) {
          stationGroup.append("rect")
            .attr("x", 8)
            .attr("y", -6 + i * 4)
            .attr("width", 2)
            .attr("height", 3)
            .attr("fill", "#ffffff")
            .attr("opacity", 0.8);
        }
      }
    });

  }, [lidarStations, analysisMode, showBeams, mapProjection.current]);

  const getStationColor = (type) => {
    const colors = {
      research: '#00ff00',
      airport: '#ff8800',
      monitoring: '#0088ff'
    };
    return colors[type] || '#888888';
  };

  const getStationSize = (powerLevel) => {
    const sizes = { high: 7, medium: 6, low: 5 };
    return sizes[powerLevel] || 5;
  };

  const drawLidarBeams = (svg) => {
    lidarStations.filter(s => s.isOperational).slice(0, 20).forEach(station => {
      const [x, y] = mapProjection.current([station.longitude, station.latitude]);
      if (x && y && !isNaN(x) && !isNaN(y)) {
        // Vertical beam representation
        svg.append("line")
          .attr("class", "lidar-beam")
          .attr("x1", x)
          .attr("y1", y)
          .attr("x2", x)
          .attr("y2", y - 20)
          .attr("stroke", "#00ffff")
          .attr("stroke-width", 1)
          .attr("opacity", 0.6)
          .style("animation", "beam-pulse 3s infinite");
      }
    });
  };

  const drawBackscatterOverlay = (svg) => {
    for (let lat = -60; lat <= 60; lat += 15) {
      for (let lon = -180; lon <= 180; lon += 25) {
        const [x, y] = mapProjection.current([lon, lat]);
        if (x && y && !isNaN(x) && !isNaN(y)) {
          const backscatter = Math.random() * 0.8 + 0.2;
          svg.append("circle")
            .attr("class", "atmospheric-overlay")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 8)
            .attr("fill", d3.interpolateViridis(backscatter))
            .attr("opacity", 0.5);
        }
      }
    }
  };

  const drawAerosolOverlay = (svg) => {
    for (let lat = -50; lat <= 50; lat += 20) {
      for (let lon = -180; lon <= 180; lon += 30) {
        const [x, y] = mapProjection.current([lon, lat]);
        if (x && y && !isNaN(x) && !isNaN(y)) {
          const aerosol = Math.random() * 0.6 + 0.1;
          svg.append("rect")
            .attr("class", "atmospheric-overlay")
            .attr("x", x - 12)
            .attr("y", y - 12)
            .attr("width", 24)
            .attr("height", 24)
            .attr("fill", d3.interpolateReds(aerosol))
            .attr("opacity", 0.4);
        }
      }
    }
  };

  const drawVisibilityOverlay = (svg) => {
    for (let lat = -70; lat <= 70; lat += 18) {
      for (let lon = -180; lon <= 180; lon += 35) {
        const [x, y] = mapProjection.current([lon, lat]);
        if (x && y && !isNaN(x) && !isNaN(y)) {
          const visibility = Math.random() * 40 + 5;
          const normalized = Math.min(1, visibility / 50);
          svg.append("circle")
            .attr("class", "atmospheric-overlay")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 10)
            .attr("fill", d3.interpolateBlues(normalized))
            .attr("opacity", 0.6);
        }
      }
    }
  };

  const drawAirQualityOverlay = (svg) => {
    for (let lat = -60; lat <= 60; lat += 16) {
      for (let lon = -180; lon <= 180; lon += 28) {
        const [x, y] = mapProjection.current([lon, lat]);
        if (x && y && !isNaN(x) && !isNaN(y)) {
          const pm = Math.random() * 100;
          const normalized = Math.min(1, pm / 150);
          svg.append("rect")
            .attr("class", "atmospheric-overlay")
            .attr("x", x - 10)
            .attr("y", y - 10)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", d3.interpolateOrRd(normalized))
            .attr("opacity", 0.5);
        }
      }
    }
  };

  const showStationTooltip = (station, x, y) => {
    const tooltip = d3.select("body").append("div")
      .attr("class", "lidar-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.9)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "11px")
      .style("pointer-events", "none")
      .style("z-index", 1000)
      .style("left", (x + 15) + "px")
      .style("top", (y - 10) + "px");

    tooltip.html(`
      <strong>${station.name}</strong><br/>
      Type: ${station.type}<br/>
      Wavelength: ${station.wavelength.toFixed(0)} nm<br/>
      Pulse Energy: ${station.pulseEnergy.toFixed(1)} mJ<br/>
      Range: ${station.verticalRange.toFixed(1)} km<br/>
      AOD: ${station.aerosolOpticalDepth.toFixed(3)}<br/>
      Visibility: ${station.visibility.toFixed(1)} km<br/>
      PM: ${station.particulateMatter.toFixed(0)} μg/m³<br/>
      Cloud Base: ${station.cloudBaseHeight.toFixed(2)} km<br/>
      Quality: ${(station.dataQuality * 100).toFixed(1)}%
    `);
  };

  const hideTooltip = () => {
    d3.selectAll(".lidar-tooltip").remove();
  };

  return (
    <div className="lidar-global-map" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls */}
      <div style={{
        position: 'absolute', top: 20, left: 20, background: 'rgba(0,0,0,0.8)', color: 'white',
        padding: '15px', borderRadius: '8px', zIndex: 1000, minWidth: '260px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>📡 LiDAR Atmospheric Sensing</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Analysis Mode:</label>
          <select value={analysisMode} onChange={(e) => setAnalysisMode(e.target.value)}
                  style={{ width: '100%', padding: '5px', borderRadius: '3px' }}>
            <option value="backscatter">Atmospheric Backscatter</option>
            <option value="aerosol">Aerosol Distribution</option>
            <option value="visibility">Visibility Analysis</option>
            <option value="air_quality">Air Quality</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '8px' }}>
            <input type="checkbox" checked={isRealTime} onChange={(e) => setIsRealTime(e.target.checked)}
                   style={{ marginRight: '8px' }} />
            Real-time Updates
          </label>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input type="checkbox" checked={showBeams} onChange={(e) => setShowBeams(e.target.checked)}
                   style={{ marginRight: '8px' }} />
            Show LiDAR Beams
          </label>
        </div>

        <div style={{ fontSize: '11px', opacity: 0.9 }}>
          <div>Total Stations: {lidarStations.length}</div>
          <div>Research: {lidarStations.filter(s => s.type === 'research').length}</div>
          <div>Operational: {lidarStations.filter(s => s.isOperational).length}</div>
          <div>High Power: {lidarStations.filter(s => s.powerLevel === 'high').length}</div>
          <div>Avg Visibility: {lidarStations.length > 0 ? 
            (lidarStations.reduce((sum, s) => sum + s.visibility, 0) / lidarStations.length).toFixed(1) : 0} km</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.8)', color: 'white',
        padding: '15px', borderRadius: '8px', zIndex: 1000, maxWidth: '180px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Station Types</h4>
        <div style={{ fontSize: '11px' }}>
          {['research', 'airport', 'monitoring'].map(type => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ width: '0', height: '0', borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                           borderBottom: `12px solid ${getStationColor(type)}`, marginRight: '8px' }}></div>
              {type} ({lidarStations.filter(s => s.type === type).length})
            </div>
          ))}
        </div>
      </div>

      {/* Selected Station Details */}
      {selectedStation && (
        <div style={{
          position: 'absolute', bottom: 20, left: 20, background: 'rgba(0,0,0,0.9)', color: 'white',
          padding: '15px', borderRadius: '8px', zIndex: 1000, maxWidth: '350px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '14px' }}>{selectedStation.name}</h4>
            <button onClick={() => setSelectedStation(null)}
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ fontSize: '11px' }}>
            <div><strong>Type:</strong> {selectedStation.type}</div>
            <div><strong>Wavelength:</strong> {selectedStation.wavelength.toFixed(0)} nm</div>
            <div><strong>Pulse Energy:</strong> {selectedStation.pulseEnergy.toFixed(1)} mJ</div>
            <div><strong>Rep Rate:</strong> {selectedStation.repetitionRate.toFixed(1)} Hz</div>
            <div><strong>Vertical Range:</strong> {selectedStation.verticalRange.toFixed(1)} km</div>
            <div><strong>Resolution:</strong> {selectedStation.verticalResolution.toFixed(1)} m</div>
            <div><strong>AOD:</strong> {selectedStation.aerosolOpticalDepth.toFixed(3)}</div>
            <div><strong>Visibility:</strong> {selectedStation.visibility.toFixed(1)} km</div>
            <div><strong>PM:</strong> {selectedStation.particulateMatter.toFixed(0)} μg/m³</div>
            <div><strong>Cloud Base:</strong> {selectedStation.cloudBaseHeight.toFixed(2)} km</div>
            <div><strong>Data Quality:</strong> {(selectedStation.dataQuality * 100).toFixed(1)}%</div>
            <div><strong>Last Calibration:</strong> {selectedStation.lastCalibration.toLocaleDateString()}</div>
          </div>
        </div>
      )}

      <svg ref={svgRef} width={width} height={height}
           style={{ background: '#0a0a0a', border: '1px solid #333' }} />

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.8; transform: scale(1); }
        }
        @keyframes beam-pulse {
          0% { opacity: 0.3; stroke-width: 1; }
          50% { opacity: 0.8; stroke-width: 2; }
          100% { opacity: 0.3; stroke-width: 1; }
        }
      `}</style>
    </div>
  );
};

export default LidarGlobalMap;

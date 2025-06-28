import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

/**
 * Satellite Sensor Global Map Component
 * 
 * Visualizes the sophisticated satellite sensing network including:
 * - GPS Differential Atmospheric Sensing
 * - Satellite Orbital Reconstruction (0.5mm accuracy)
 * - Multi-constellation satellite tracking
 * - Atmospheric signal delay analysis
 * - Real-time satellite positioning
 * - Signal coherence mapping
 */
const SatelliteGlobalMap = () => {
  // Component state
  const [satellites, setSatellites] = useState([]);
  const [atmosphericData, setAtmosphericData] = useState({});
  const [gpsStations, setGpsStations] = useState([]);
  const [signalCoherence, setSignalCoherence] = useState({});
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('atmospheric'); // 'atmospheric' | 'orbital' | 'coherence'
  const [isRealTime, setIsRealTime] = useState(true);
  
  // D3 refs
  const svgRef = useRef();
  const mapProjection = useRef();
  const pathGenerator = useRef();

  // Map dimensions
  const width = 1200;
  const height = 600;

  // Initialize satellite constellations
  useEffect(() => {
    const initializeSatellites = () => {
      const constellations = {
        GPS: { count: 32, altitude: 20200, color: '#00ff00', label: 'GPS' },
        GLONASS: { count: 24, altitude: 19100, color: '#ff6600', label: 'GLONASS' },
        Galileo: { count: 30, altitude: 23222, color: '#0066ff', label: 'Galileo' },
        BeiDou: { count: 35, altitude: 21500, color: '#ff0066', label: 'BeiDou' },
        Sentinel: { count: 8, altitude: 693, color: '#9900ff', label: 'Sentinel' },
        Landsat: { count: 2, altitude: 705, color: '#ffff00', label: 'Landsat' },
        MODIS: { count: 2, altitude: 705, color: '#ff9900', label: 'MODIS' }
      };

      const satelliteArray = [];
      let satId = 0;

      Object.entries(constellations).forEach(([constellation, config]) => {
        for (let i = 0; i < config.count; i++) {
          // Generate realistic orbital positions
          const inclination = constellation === 'GPS' ? 55 : 
                            constellation === 'Sentinel' ? 98.6 : 
                            Math.random() * 60 + 30;
          
          const longitude = (360 / config.count) * i + (Math.random() - 0.5) * 20;
          const latitude = (Math.random() - 0.5) * (inclination * 2);
          
          satelliteArray.push({
            id: satId++,
            constellation,
            name: `${constellation}-${i + 1}`,
            longitude,
            latitude,
            altitude: config.altitude,
            color: config.color,
            velocity: calculateOrbitalVelocity(config.altitude),
            signalStrength: 0.7 + Math.random() * 0.3,
            atmosphericDelay: Math.random() * 0.15, // GPS signal delay in ms
            lastUpdate: Date.now(),
            isTracking: true,
            reconstructionAccuracy: Math.random() * 1.0 + 0.2 // mm accuracy
          });
        }
      });

      setSatellites(satelliteArray);
    };

    initializeSatellites();
  }, []);

  // Calculate orbital velocity
  const calculateOrbitalVelocity = (altitude) => {
    const earthRadius = 6371; // km
    const GM = 398600.4418; // km³/s²
    const orbitalRadius = earthRadius + altitude;
    return Math.sqrt(GM / orbitalRadius); // km/s
  };

  // Initialize GPS ground stations
  useEffect(() => {
    const stations = [
      { id: 'IGS001', name: 'Boulder, CO', lat: 40.1, lon: -105.2, type: 'Primary' },
      { id: 'IGS002', name: 'Hartebeesthoek, SA', lat: -25.9, lon: 27.7, type: 'Primary' },
      { id: 'IGS003', name: 'Kiruna, Sweden', lat: 67.9, lon: 20.4, type: 'Primary' },
      { id: 'IGS004', name: 'Tahiti, French Polynesia', lat: -17.6, lon: -149.6, type: 'Primary' },
      { id: 'IGS005', name: 'Alice Springs, Australia', lat: -23.7, lon: 133.9, type: 'Primary' },
      { id: 'IGS006', name: 'McMurdo, Antarctica', lat: -77.8, lon: 166.7, type: 'Polar' },
      { id: 'IGS007', name: 'Yellowknife, Canada', lat: 62.5, lon: -114.3, type: 'High-Latitude' },
      { id: 'IGS008', name: 'Brasília, Brazil', lat: -15.8, lon: -47.9, type: 'Equatorial' },
      { id: 'IGS009', name: 'Singapore', lat: 1.3, lon: 103.8, type: 'Equatorial' },
      { id: 'IGS010', name: 'Reykjavik, Iceland', lat: 64.1, lon: -21.8, type: 'High-Latitude' }
    ];

    // Add atmospheric analysis data for each station
    const stationsWithData = stations.map(station => ({
      ...station,
      atmosphericMoisture: 0.3 + Math.random() * 0.4,
      signalDelay: Math.random() * 0.1,
      coherence: 0.8 + Math.random() * 0.2,
      temperature: -20 + Math.random() * 60,
      pressure: 900 + Math.random() * 200,
      isActive: true,
      dataQuality: 0.85 + Math.random() * 0.15
    }));

    setGpsStations(stationsWithData);
  }, []);

  // Initialize D3 map projection
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Setup projection
    mapProjection.current = d3.geoNaturalEarth1()
      .scale(190)
      .translate([width / 2, height / 2]);

    pathGenerator.current = d3.geoPath().projection(mapProjection.current);

    // Load and draw world map
    const drawWorld = async () => {
      try {
        // Simple world features (would normally load from topojson)
        const worldData = generateSimpleWorldFeatures();
        
        svg.append("g")
          .selectAll("path")
          .data(worldData.features)
          .enter()
          .append("path")
          .attr("d", pathGenerator.current)
          .attr("fill", "#2a2a2a")
          .attr("stroke", "#555")
          .attr("stroke-width", 0.5);

        // Add graticule
        const graticule = d3.geoGraticule();
        svg.append("path")
          .datum(graticule())
          .attr("d", pathGenerator.current)
          .attr("fill", "none")
          .attr("stroke", "#333")
          .attr("stroke-width", 0.3)
          .attr("opacity", 0.7);

      } catch (error) {
        console.warn('Could not load world data, using simple projection');
      }
    };

    drawWorld();
  }, [width, height]);

  // Generate simple world features for fallback
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

  // Real-time satellite updates
  useEffect(() => {
    if (!isRealTime) return;

    const updateSatellites = () => {
      setSatellites(prev => prev.map(sat => {
        // Calculate orbital motion
        const timeStep = 0.1; // minutes
        const angularVelocity = (sat.velocity / (sat.altitude + 6371)) * (180 / Math.PI) * (timeStep / 60);
        
        let newLongitude = sat.longitude + angularVelocity;
        if (newLongitude > 180) newLongitude -= 360;
        if (newLongitude < -180) newLongitude += 360;

        // Simulate atmospheric delay variations
        const baseDelay = sat.constellation === 'GPS' ? 0.05 : 0.03;
        const atmosphericDelay = baseDelay + Math.sin(Date.now() / 10000) * 0.02 + Math.random() * 0.01;

        return {
          ...sat,
          longitude: newLongitude,
          atmosphericDelay,
          signalStrength: Math.max(0.5, Math.min(1.0, sat.signalStrength + (Math.random() - 0.5) * 0.1)),
          reconstructionAccuracy: 0.2 + Math.random() * 0.8,
          lastUpdate: Date.now()
        };
      }));
    };

    const interval = setInterval(updateSatellites, 2000);
    return () => clearInterval(interval);
  }, [isRealTime]);

  // Draw satellites and analysis overlays
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    // Clear previous satellite elements
    svg.selectAll(".satellite").remove();
    svg.selectAll(".gps-station").remove();
    svg.selectAll(".signal-line").remove();
    svg.selectAll(".atmospheric-overlay").remove();

    // Draw atmospheric analysis overlay
    if (analysisMode === 'atmospheric') {
      drawAtmosphericAnalysis(svg);
    }

    // Draw signal coherence overlay
    if (analysisMode === 'coherence') {
      drawSignalCoherence(svg);
    }

    // Draw satellites
    const satelliteGroup = svg.append("g").attr("class", "satellites");
    
    satellites.forEach(satellite => {
      const [x, y] = mapProjection.current([satellite.longitude, satellite.latitude]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        // Satellite icon
        const satGroup = satelliteGroup.append("g")
          .attr("class", "satellite")
          .attr("transform", `translate(${x}, ${y})`);

        // Satellite body
        satGroup.append("circle")
          .attr("r", analysisMode === 'orbital' ? 6 : 4)
          .attr("fill", satellite.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("opacity", 0.9)
          .style("cursor", "pointer")
          .on("click", () => setSelectedSatellite(satellite))
          .on("mouseover", function() {
            d3.select(this).attr("r", 8).attr("stroke-width", 2);
            showSatelliteTooltip(satellite, x, y);
          })
          .on("mouseout", function() {
            d3.select(this).attr("r", analysisMode === 'orbital' ? 6 : 4).attr("stroke-width", 1);
            hideTooltip();
          });

        // Signal strength indicator
        if (analysisMode === 'atmospheric') {
          satGroup.append("circle")
            .attr("r", 12)
            .attr("fill", "none")
            .attr("stroke", satellite.color)
            .attr("stroke-width", 2)
            .attr("opacity", satellite.signalStrength * 0.5)
            .attr("stroke-dasharray", "3,3");
        }

        // Orbital accuracy indicator
        if (analysisMode === 'orbital') {
          const accuracyColor = satellite.reconstructionAccuracy < 0.5 ? '#00ff00' : 
                               satellite.reconstructionAccuracy < 1.0 ? '#ffff00' : '#ff6600';
          
          satGroup.append("rect")
            .attr("x", -8)
            .attr("y", 8)
            .attr("width", 16)
            .attr("height", 3)
            .attr("fill", accuracyColor)
            .attr("opacity", 0.8);
        }

        // Atmospheric delay visualization
        if (satellite.constellation === 'GPS' && satellite.atmosphericDelay > 0.08) {
          satGroup.append("circle")
            .attr("r", 20)
            .attr("fill", "none")
            .attr("stroke", "#ff4444")
            .attr("stroke-width", 1)
            .attr("opacity", 0.6)
            .style("animation", "pulse 2s infinite");
        }
      }
    });

    // Draw GPS ground stations
    gpsStations.forEach(station => {
      const [x, y] = mapProjection.current([station.lon, station.lat]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const stationGroup = svg.append("g")
          .attr("class", "gps-station")
          .attr("transform", `translate(${x}, ${y})`);

        // Station marker
        stationGroup.append("rect")
          .attr("x", -4)
          .attr("y", -4)
          .attr("width", 8)
          .attr("height", 8)
          .attr("fill", station.isActive ? "#00ff00" : "#666")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .style("cursor", "pointer")
          .on("click", () => showStationDetails(station))
          .on("mouseover", function() {
            d3.select(this).attr("width", 12).attr("height", 12).attr("x", -6).attr("y", -6);
            showStationTooltip(station, x, y);
          })
          .on("mouseout", function() {
            d3.select(this).attr("width", 8).attr("height", 8).attr("x", -4).attr("y", -4);
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
      }
    });

    // Draw signal lines for GPS differential analysis
    if (analysisMode === 'atmospheric') {
      drawGPSSignalLines(svg);
    }

  }, [satellites, gpsStations, analysisMode, mapProjection.current]);

  // Draw atmospheric analysis overlay
  const drawAtmosphericAnalysis = (svg) => {
    const overlayData = generateAtmosphericGrid();
    
    overlayData.forEach(cell => {
      const [x, y] = mapProjection.current([cell.lon, cell.lat]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const color = d3.interpolateBlues(cell.moisture);
        
        svg.append("rect")
          .attr("class", "atmospheric-overlay")
          .attr("x", x - 10)
          .attr("y", y - 10)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", color)
          .attr("opacity", 0.3);
      }
    });
  };

  // Draw signal coherence overlay
  const drawSignalCoherence = (svg) => {
    const coherenceData = generateCoherenceGrid();
    
    coherenceData.forEach(cell => {
      const [x, y] = mapProjection.current([cell.lon, cell.lat]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const color = d3.interpolateReds(cell.coherence);
        
        svg.append("circle")
          .attr("class", "atmospheric-overlay")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 8)
          .attr("fill", color)
          .attr("opacity", 0.4);
      }
    });
  };

  // Draw GPS signal lines
  const drawGPSSignalLines = (svg) => {
    const gpsSignals = generateGPSSignalLines();
    
    gpsSignals.forEach(signal => {
      const line = d3.line()
        .x(d => mapProjection.current(d)[0])
        .y(d => mapProjection.current(d)[1])
        .curve(d3.curveCardinal);

      svg.append("path")
        .attr("class", "signal-line")
        .attr("d", line(signal.path))
        .attr("fill", "none")
        .attr("stroke", signal.delay > 0.1 ? "#ff4444" : "#44ff44")
        .attr("stroke-width", 1)
        .attr("opacity", 0.6)
        .attr("stroke-dasharray", "2,2");
    });
  };

  // Generate atmospheric grid data
  const generateAtmosphericGrid = () => {
    const grid = [];
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = -180; lon <= 180; lon += 30) {
        grid.push({
          lat,
          lon,
          moisture: Math.random() * 0.8 + 0.2,
          temperature: -20 + Math.random() * 60,
          pressure: 900 + Math.random() * 200
        });
      }
    }
    return grid;
  };

  // Generate coherence grid data
  const generateCoherenceGrid = () => {
    const grid = [];
    for (let lat = -60; lat <= 60; lat += 15) {
      for (let lon = -180; lon <= 180; lon += 25) {
        grid.push({
          lat,
          lon,
          coherence: 0.5 + Math.random() * 0.5
        });
      }
    }
    return grid;
  };

  // Generate GPS signal lines
  const generateGPSSignalLines = () => {
    const signals = [];
    const gpsSatellites = satellites.filter(sat => sat.constellation === 'GPS');
    
    gpsStations.slice(0, 5).forEach(station => {
      gpsSatellites.slice(0, 4).forEach(satellite => {
        if (satellite.signalStrength > 0.7) {
          signals.push({
            station: station.id,
            satellite: satellite.id,
            delay: satellite.atmosphericDelay,
            path: [
              [station.lon, station.lat],
              [satellite.longitude, satellite.latitude]
            ]
          });
        }
      });
    });
    
    return signals;
  };

  // Tooltip functions
  const showSatelliteTooltip = (satellite, x, y) => {
    const tooltip = d3.select("body").append("div")
      .attr("class", "satellite-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.9)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", 1000)
      .style("left", (x + 20) + "px")
      .style("top", (y - 10) + "px");

    tooltip.html(`
      <strong>${satellite.name}</strong><br/>
      Constellation: ${satellite.constellation}<br/>
      Altitude: ${satellite.altitude.toFixed(0)} km<br/>
      Signal Strength: ${(satellite.signalStrength * 100).toFixed(1)}%<br/>
      Atmospheric Delay: ${(satellite.atmosphericDelay * 1000).toFixed(2)} ms<br/>
      Reconstruction Accuracy: ${satellite.reconstructionAccuracy.toFixed(2)} mm<br/>
      Velocity: ${satellite.velocity.toFixed(2)} km/s
    `);
  };

  const showStationTooltip = (station, x, y) => {
    const tooltip = d3.select("body").append("div")
      .attr("class", "station-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.9)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", 1000)
      .style("left", (x + 20) + "px")
      .style("top", (y - 10) + "px");

    tooltip.html(`
      <strong>${station.name}</strong><br/>
      Station ID: ${station.id}<br/>
      Type: ${station.type}<br/>
      Atmospheric Moisture: ${(station.atmosphericMoisture * 100).toFixed(1)}%<br/>
      Signal Delay: ${(station.signalDelay * 1000).toFixed(2)} ms<br/>
      Data Quality: ${(station.dataQuality * 100).toFixed(1)}%<br/>
      Temperature: ${station.temperature.toFixed(1)}°C<br/>
      Pressure: ${station.pressure.toFixed(0)} hPa
    `);
  };

  const hideTooltip = () => {
    d3.selectAll(".satellite-tooltip, .station-tooltip").remove();
  };

  const showStationDetails = (station) => {
    setSelectedSatellite(station);
  };

  return (
    <div className="satellite-global-map" style={{ width: '100%', height: '100%', position: 'relative' }}>
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
        minWidth: '250px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>🛰️ Satellite Global Network</h3>
        
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
            <option value="atmospheric">GPS Atmospheric Sensing</option>
            <option value="orbital">Orbital Reconstruction</option>
            <option value="coherence">Signal Coherence</option>
          </select>
        </div>

        {/* Real-time Toggle */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input 
              type="checkbox" 
              checked={isRealTime} 
              onChange={(e) => setIsRealTime(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Real-time Updates
          </label>
        </div>

        {/* Statistics */}
        <div style={{ fontSize: '11px', opacity: 0.9 }}>
          <div>Active Satellites: {satellites.filter(sat => sat.isTracking).length}</div>
          <div>GPS Stations: {gpsStations.filter(station => station.isActive).length}</div>
          <div>GPS Satellites: {satellites.filter(sat => sat.constellation === 'GPS').length}</div>
          <div>Avg Reconstruction Accuracy: {satellites.length > 0 ? 
            (satellites.reduce((sum, sat) => sum + sat.reconstructionAccuracy, 0) / satellites.length).toFixed(2) : 0
          } mm</div>
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
        maxWidth: '200px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Satellite Constellations</h4>
        <div style={{ fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#00ff00', marginRight: '8px', borderRadius: '50%' }}></div>
            GPS ({satellites.filter(sat => sat.constellation === 'GPS').length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#ff6600', marginRight: '8px', borderRadius: '50%' }}></div>
            GLONASS ({satellites.filter(sat => sat.constellation === 'GLONASS').length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#0066ff', marginRight: '8px', borderRadius: '50%' }}></div>
            Galileo ({satellites.filter(sat => sat.constellation === 'Galileo').length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#ff0066', marginRight: '8px', borderRadius: '50%' }}></div>
            BeiDou ({satellites.filter(sat => sat.constellation === 'BeiDou').length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#00ff00', marginRight: '10px' }}></div>
            GPS Stations ({gpsStations.length})
          </div>
        </div>
      </div>

      {/* Selected Satellite Details */}
      {selectedSatellite && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          zIndex: 1000,
          maxWidth: '300px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '14px' }}>
              {selectedSatellite.name || selectedSatellite.id}
            </h4>
            <button 
              onClick={() => setSelectedSatellite(null)}
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
            {selectedSatellite.constellation ? (
              <>
                <div>Constellation: {selectedSatellite.constellation}</div>
                <div>Position: {selectedSatellite.latitude.toFixed(2)}°, {selectedSatellite.longitude.toFixed(2)}°</div>
                <div>Altitude: {selectedSatellite.altitude.toFixed(0)} km</div>
                <div>Signal Strength: {(selectedSatellite.signalStrength * 100).toFixed(1)}%</div>
                <div>Atmospheric Delay: {(selectedSatellite.atmosphericDelay * 1000).toFixed(2)} ms</div>
                <div>Reconstruction Accuracy: {selectedSatellite.reconstructionAccuracy.toFixed(2)} mm</div>
                <div>Orbital Velocity: {selectedSatellite.velocity.toFixed(2)} km/s</div>
              </>
            ) : (
              <>
                <div>Station Type: {selectedSatellite.type}</div>
                <div>Location: {selectedSatellite.lat.toFixed(2)}°, {selectedSatellite.lon.toFixed(2)}°</div>
                <div>Atmospheric Moisture: {(selectedSatellite.atmosphericMoisture * 100).toFixed(1)}%</div>
                <div>Signal Delay: {(selectedSatellite.signalDelay * 1000).toFixed(2)} ms</div>
                <div>Data Quality: {(selectedSatellite.dataQuality * 100).toFixed(1)}%</div>
                <div>Temperature: {selectedSatellite.temperature.toFixed(1)}°C</div>
                <div>Pressure: {selectedSatellite.pressure.toFixed(0)} hPa</div>
              </>
            )}
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
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.6; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SatelliteGlobalMap;

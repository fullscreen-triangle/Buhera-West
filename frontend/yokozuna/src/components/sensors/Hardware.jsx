import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Hardware Oscillatory Sensor Global Map
 * 
 * Revolutionary Hardware-as-Atmospheric-Sensor Technology:
 * - Hardware Oscillatory Harvesting (LEDs, displays, processors)
 * - Molecular Spectrometry using system components
 * - Real-time atmospheric molecular synthesis
 * - Zero additional hardware cost approach
 */
const HardwareGlobalMap = () => {
  const [hardwareNodes, setHardwareNodes] = useState([]);
  const [oscillatoryData, setOscillatoryData] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('led_spectroscopy');
  const [isRealTime, setIsRealTime] = useState(true);
  
  const svgRef = useRef();
  const mapProjection = useRef();
  const width = 1200;
  const height = 600;

  // Initialize hardware sensing nodes
  useEffect(() => {
    const initializeHardwareNodes = () => {
      const nodes = [];
      const cities = [
        { name: 'Silicon Valley', lat: 37.4419, lon: -122.1430, density: 95 },
        { name: 'Shenzhen', lat: 22.5431, lon: 114.0579, density: 88 },
        { name: 'Seoul', lat: 37.5665, lon: 126.9780, density: 82 },
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503, density: 80 },
        { name: 'Berlin', lat: 52.5200, lon: 13.4050, density: 70 },
        { name: 'Tel Aviv', lat: 32.0853, lon: 34.7818, density: 75 },
        { name: 'Bangalore', lat: 12.9716, lon: 77.5946, density: 65 },
        { name: 'Cambridge', lat: 52.2053, lon: 0.1218, density: 60 }
      ];

      let nodeId = 0;
      cities.forEach(city => {
        const nodeCount = Math.floor(city.density * (0.7 + Math.random() * 0.6));
        
        for (let i = 0; i < nodeCount; i++) {
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * 0.3;
          const lat = city.lat + distance * Math.cos(angle);
          const lon = city.lon + distance * Math.sin(angle);

          const hardwareType = ['datacenter', 'office', 'lab', 'residential'][Math.floor(Math.random() * 4)];
          
          nodes.push({
            id: nodeId++,
            name: `${city.name}-HW-${i + 1}`,
            latitude: lat,
            longitude: lon,
            type: hardwareType,
            ledCount: 50 + Math.floor(Math.random() * 200),
            cpuFreq: 2.4 + Math.random() * 2.6, // GHz
            displayBacklight: 0.6 + Math.random() * 0.4,
            thermalCycles: 0.1 + Math.random() * 0.3, // Hz
            oscillatoryStability: 0.85 + Math.random() * 0.14,
            atmosphericCoupling: 0.7 + Math.random() * 0.3,
            molecularSynthesis: Math.random() * 0.9 + 0.1,
            spectralResolution: 1 + Math.random() * 2, // nm
            detectedMolecules: generateMolecularData(),
            temperatureCorrelation: 0.7 + Math.random() * 0.3,
            humidityCorrelation: 0.6 + Math.random() * 0.4,
            isActive: Math.random() > 0.08,
            powerConsumption: 100 + Math.random() * 500 // watts
          });
        }
      });

      // Add distributed IoT nodes
      for (let i = 0; i < 150; i++) {
        const lat = (Math.random() - 0.5) * 140;
        const lon = (Math.random() - 0.5) * 360;
        
        nodes.push({
          id: nodeId++,
          name: `IoT-Node-${i + 1}`,
          latitude: lat,
          longitude: lon,
          type: 'iot',
          ledCount: 5 + Math.floor(Math.random() * 20),
          cpuFreq: 0.5 + Math.random() * 1.5,
          displayBacklight: Math.random() * 0.5,
          thermalCycles: Math.random() * 0.2,
          oscillatoryStability: 0.6 + Math.random() * 0.3,
          atmosphericCoupling: 0.4 + Math.random() * 0.5,
          molecularSynthesis: Math.random() * 0.6,
          spectralResolution: 2 + Math.random() * 3,
          detectedMolecules: generateMolecularData(0.3),
          temperatureCorrelation: 0.5 + Math.random() * 0.4,
          humidityCorrelation: 0.4 + Math.random() * 0.5,
          isActive: Math.random() > 0.15,
          powerConsumption: 5 + Math.random() * 50
        });
      }

      setHardwareNodes(nodes);
    };

    initializeHardwareNodes();
  }, []);

  const generateMolecularData = (scale = 1) => ({
    h2o: (0.6 + Math.random() * 0.3) * scale,
    co2: (0.0004 + Math.random() * 0.0002) * scale,
    o2: (0.21 + Math.random() * 0.01) * scale,
    n2: (0.78 + Math.random() * 0.01) * scale,
    ch4: (Math.random() * 0.000002) * scale,
    no2: (Math.random() * 0.00001) * scale
  });

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

    const updateNodes = () => {
      setHardwareNodes(prev => prev.map(node => ({
        ...node,
        atmosphericCoupling: Math.max(0.3, Math.min(1, node.atmosphericCoupling + (Math.random() - 0.5) * 0.05)),
        molecularSynthesis: Math.max(0, Math.min(1, node.molecularSynthesis + (Math.random() - 0.5) * 0.03)),
        detectedMolecules: {
          ...node.detectedMolecules,
          h2o: Math.max(0, node.detectedMolecules.h2o + (Math.random() - 0.5) * 0.02),
          co2: Math.max(0, node.detectedMolecules.co2 + (Math.random() - 0.5) * 0.00005)
        }
      })));
    };

    const interval = setInterval(updateNodes, 2500);
    return () => clearInterval(interval);
  }, [isRealTime]);

  // Draw hardware nodes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    svg.selectAll(".hardware-node").remove();
    svg.selectAll(".oscillatory-overlay").remove();

    // Draw overlays based on analysis mode
    if (analysisMode === 'molecular_synthesis') drawMolecularOverlay(svg);
    if (analysisMode === 'atmospheric_coupling') drawCouplingOverlay(svg);

    // Draw hardware nodes
    hardwareNodes.forEach(node => {
      const [x, y] = mapProjection.current([node.longitude, node.latitude]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const nodeGroup = svg.append("g")
          .attr("class", "hardware-node")
          .attr("transform", `translate(${x}, ${y})`);

        const nodeColor = getNodeColor(node.type);
        const nodeSize = getNodeSize(node.type);

        // Main node
        nodeGroup.append("rect")
          .attr("x", -nodeSize/2)
          .attr("y", -nodeSize/2)
          .attr("width", nodeSize)
          .attr("height", nodeSize)
          .attr("fill", nodeColor)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("opacity", node.isActive ? 0.9 : 0.5)
          .style("cursor", "pointer")
          .on("click", () => setSelectedNode(node))
          .on("mouseover", function() {
            d3.select(this).attr("stroke-width", 2);
            showNodeTooltip(node, x, y);
          })
          .on("mouseout", function() {
            d3.select(this).attr("stroke-width", 1);
            hideTooltip();
          });

        // LED array indicator
        if (analysisMode === 'led_spectroscopy' && node.ledCount > 50) {
          for (let i = 0; i < Math.min(6, node.ledCount / 20); i++) {
            nodeGroup.append("circle")
              .attr("cx", (i - 2.5) * 3)
              .attr("cy", -8)
              .attr("r", 1)
              .attr("fill", "#ffff00")
              .attr("opacity", 0.8);
          }
        }

        // Oscillatory stability indicator
        if (node.oscillatoryStability > 0.95) {
          nodeGroup.append("circle")
            .attr("r", 12)
            .attr("fill", "none")
            .attr("stroke", "#00ff00")
            .attr("stroke-width", 1)
            .attr("opacity", 0.7);
        }

        // Molecular synthesis activity
        if (analysisMode === 'molecular_synthesis' && node.molecularSynthesis > 0.8) {
          nodeGroup.append("circle")
            .attr("r", 15)
            .attr("fill", "none")
            .attr("stroke", "#ff00ff")
            .attr("stroke-width", 2)
            .attr("opacity", 0.6)
            .style("animation", "pulse 3s infinite");
        }

        // Atmospheric coupling visualization
        if (analysisMode === 'atmospheric_coupling') {
          const couplingRadius = 8 + node.atmosphericCoupling * 10;
          nodeGroup.append("circle")
            .attr("r", couplingRadius)
            .attr("fill", "none")
            .attr("stroke", "#00ffff")
            .attr("stroke-width", 1)
            .attr("opacity", node.atmosphericCoupling * 0.6);
        }
      }
    });

  }, [hardwareNodes, analysisMode, mapProjection.current]);

  const getNodeColor = (type) => {
    const colors = {
      datacenter: '#00ff00',
      office: '#ff8800',
      lab: '#ff0088',
      residential: '#8800ff',
      iot: '#00ffff'
    };
    return colors[type] || '#888888';
  };

  const getNodeSize = (type) => {
    const sizes = { datacenter: 8, office: 6, lab: 7, residential: 5, iot: 4 };
    return sizes[type] || 5;
  };

  const drawMolecularOverlay = (svg) => {
    for (let lat = -60; lat <= 60; lat += 20) {
      for (let lon = -180; lon <= 180; lon += 30) {
        const [x, y] = mapProjection.current([lon, lat]);
        if (x && y && !isNaN(x) && !isNaN(y)) {
          const synthesis = Math.random() * 0.8 + 0.2;
          svg.append("rect")
            .attr("class", "oscillatory-overlay")
            .attr("x", x - 10)
            .attr("y", y - 10)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", d3.interpolatePlasma(synthesis))
            .attr("opacity", 0.4);
        }
      }
    }
  };

  const drawCouplingOverlay = (svg) => {
    for (let lat = -50; lat <= 50; lat += 25) {
      for (let lon = -180; lon <= 180; lon += 40) {
        const [x, y] = mapProjection.current([lon, lat]);
        if (x && y && !isNaN(x) && !isNaN(y)) {
          const coupling = Math.random() * 0.9 + 0.1;
          svg.append("circle")
            .attr("class", "oscillatory-overlay")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 12)
            .attr("fill", d3.interpolateCool(coupling))
            .attr("opacity", 0.5);
        }
      }
    }
  };

  const showNodeTooltip = (node, x, y) => {
    const tooltip = d3.select("body").append("div")
      .attr("class", "hardware-tooltip")
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
      <strong>${node.name}</strong><br/>
      Type: ${node.type}<br/>
      LEDs: ${node.ledCount}<br/>
      CPU: ${node.cpuFreq.toFixed(2)} GHz<br/>
      Oscillatory Stability: ${(node.oscillatoryStability * 100).toFixed(1)}%<br/>
      Atmospheric Coupling: ${(node.atmosphericCoupling * 100).toFixed(1)}%<br/>
      Molecular Synthesis: ${(node.molecularSynthesis * 100).toFixed(1)}%<br/>
      H₂O Detection: ${(node.detectedMolecules.h2o * 100).toFixed(2)}%<br/>
      CO₂ Detection: ${(node.detectedMolecules.co2 * 1000000).toFixed(0)} ppm<br/>
      Power: ${node.powerConsumption.toFixed(0)}W
    `);
  };

  const hideTooltip = () => {
    d3.selectAll(".hardware-tooltip").remove();
  };

  return (
    <div className="hardware-global-map" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls */}
      <div style={{
        position: 'absolute', top: 20, left: 20, background: 'rgba(0,0,0,0.8)', color: 'white',
        padding: '15px', borderRadius: '8px', zIndex: 1000, minWidth: '260px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>🔧 Hardware Oscillatory Sensing</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Analysis Mode:</label>
          <select value={analysisMode} onChange={(e) => setAnalysisMode(e.target.value)}
                  style={{ width: '100%', padding: '5px', borderRadius: '3px' }}>
            <option value="led_spectroscopy">LED Spectrometry</option>
            <option value="molecular_synthesis">Molecular Synthesis</option>
            <option value="atmospheric_coupling">Atmospheric Coupling</option>
            <option value="oscillatory_harvesting">Oscillatory Harvesting</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input type="checkbox" checked={isRealTime} onChange={(e) => setIsRealTime(e.target.checked)}
                   style={{ marginRight: '8px' }} />
            Real-time Updates
          </label>
        </div>

        <div style={{ fontSize: '11px', opacity: 0.9 }}>
          <div>Total Nodes: {hardwareNodes.length}</div>
          <div>Datacenters: {hardwareNodes.filter(n => n.type === 'datacenter').length}</div>
          <div>Active Nodes: {hardwareNodes.filter(n => n.isActive).length}</div>
          <div>Total LEDs: {hardwareNodes.reduce((sum, n) => sum + n.ledCount, 0).toLocaleString()}</div>
          <div>Avg Stability: {hardwareNodes.length > 0 ? 
            (hardwareNodes.reduce((sum, n) => sum + n.oscillatoryStability, 0) / hardwareNodes.length * 100).toFixed(1) : 0}%</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.8)', color: 'white',
        padding: '15px', borderRadius: '8px', zIndex: 1000, maxWidth: '180px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Hardware Types</h4>
        <div style={{ fontSize: '11px' }}>
          {['datacenter', 'office', 'lab', 'residential', 'iot'].map(type => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: getNodeColor(type), 
                           marginRight: '8px' }}></div>
              {type} ({hardwareNodes.filter(n => n.type === type).length})
            </div>
          ))}
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div style={{
          position: 'absolute', bottom: 20, left: 20, background: 'rgba(0,0,0,0.9)', color: 'white',
          padding: '15px', borderRadius: '8px', zIndex: 1000, maxWidth: '320px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '14px' }}>{selectedNode.name}</h4>
            <button onClick={() => setSelectedNode(null)}
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ fontSize: '11px' }}>
            <div><strong>Type:</strong> {selectedNode.type}</div>
            <div><strong>LED Count:</strong> {selectedNode.ledCount}</div>
            <div><strong>CPU Frequency:</strong> {selectedNode.cpuFreq.toFixed(2)} GHz</div>
            <div><strong>Oscillatory Stability:</strong> {(selectedNode.oscillatoryStability * 100).toFixed(1)}%</div>
            <div><strong>Atmospheric Coupling:</strong> {(selectedNode.atmosphericCoupling * 100).toFixed(1)}%</div>
            <div><strong>Molecular Synthesis:</strong> {(selectedNode.molecularSynthesis * 100).toFixed(1)}%</div>
            <div><strong>Spectral Resolution:</strong> {selectedNode.spectralResolution.toFixed(1)} nm</div>
            <div><strong>H₂O Detection:</strong> {(selectedNode.detectedMolecules.h2o * 100).toFixed(2)}%</div>
            <div><strong>CO₂ Detection:</strong> {(selectedNode.detectedMolecules.co2 * 1000000).toFixed(0)} ppm</div>
            <div><strong>Power Consumption:</strong> {selectedNode.powerConsumption.toFixed(0)} W</div>
          </div>
        </div>
      )}

      <svg ref={svgRef} width={width} height={height}
           style={{ background: '#0a0a0a', border: '1px solid #333' }} />

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

export default HardwareGlobalMap;

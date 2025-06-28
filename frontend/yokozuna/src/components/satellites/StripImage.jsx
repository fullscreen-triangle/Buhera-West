/// I was thinking of using this to show the strip image of a satellite 
/// the floating spheres become the satellite 
// and the strip image is just highlighted on the 2d map at the bottom.  

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import * as satellite from 'satellite.js';

/**
 * Satellite Strip Image Visualization
 * 
 * Displays satellite strip images on a 2D map with floating spheres representing satellites.
 * The strip image is highlighted on the 2D map at the bottom, while satellites appear as
 * floating spheres that can be selected to show their imaging footprint.
 */
const StripImage = () => {
  const [satData, setSatData] = useState([]);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [time, setTime] = useState(new Date());
  const [stripImages, setStripImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const svgRef = useRef();
  const mapProjection = useRef();
  const width = 1200;
  const height = 600;

  // Initialize satellite data
  useEffect(() => {
    fetch('//cdn.jsdelivr.net/npm/globe.gl/example/datasets/space-track-leo.txt')
      .then(r => r.text())
      .then(rawData => {
        const tleData = rawData.replace(/\r/g, '')
          .split(/\n(?=[^12])/)
          .filter(d => d)
          .map(tle => tle.split('\n'));
        
        const processedSatData = tleData.map(([name, ...tle]) => ({
          satrec: satellite.twoline2satrec(...tle),
          name: name.trim().replace(/^0 /, ''),
          id: Math.random().toString(36).substr(2, 9),
          imagingCapable: Math.random() > 0.7, // 30% have imaging capability
          swathWidth: 50 + Math.random() * 200, // km
          resolution: 0.5 + Math.random() * 10, // meters
          spectralBands: Math.floor(Math.random() * 12) + 1
        }))
        .filter(d => !!satellite.propagate(d.satrec, new Date())?.position)
        .filter(d => d.imagingCapable); // Only imaging satellites

        setSatData(processedSatData);
        
        // Select first satellite by default
        if (processedSatData.length > 0) {
          setSelectedSatellite(processedSatData[0]);
        }
      });
  }, []);

  // Generate strip images for selected satellite
  useEffect(() => {
    if (!selectedSatellite || !isCapturing) return;

    const generateStripImage = () => {
      const now = new Date();
      const gmst = satellite.gstime(now);
      const eci = satellite.propagate(selectedSatellite.satrec, now);
      
      if (eci?.position) {
        const gdPos = satellite.eciToGeodetic(eci.position, gmst);
        const lat = satellite.radiansToDegrees(gdPos.latitude);
        const lng = satellite.radiansToDegrees(gdPos.longitude);
        
        // Generate strip image coordinates
        const stripLength = 500; // km
        const swathWidth = selectedSatellite.swathWidth;
        
        // Calculate ground track
        const velocity = eci.velocity;
        const groundSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) * 0.1;
        
        const stripPoints = [];
        for (let i = 0; i < 50; i++) {
          const fraction = i / 49;
          const stripLat = lat + (fraction - 0.5) * (stripLength / 111); // Rough km to degree conversion
          const stripLng = lng + Math.sin(fraction * Math.PI) * (swathWidth / 111 / Math.cos(stripLat * Math.PI / 180));
          stripPoints.push([stripLng, stripLat]);
        }

        const newStripImage = {
          id: Date.now(),
          satellite: selectedSatellite.name,
          timestamp: now,
          coordinates: stripPoints,
          swathWidth,
          resolution: selectedSatellite.resolution,
          spectralBands: selectedSatellite.spectralBands,
          cloudCover: Math.random() * 30, // percentage
          quality: 0.7 + Math.random() * 0.3
        };

        setStripImages(prev => [...prev.slice(-9), newStripImage]); // Keep last 10
      }
    };

    const interval = setInterval(generateStripImage, 2000);
    return () => clearInterval(interval);
  }, [selectedSatellite, isCapturing]);

  // Initialize D3 map projection
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    mapProjection.current = d3.geoNaturalEarth1()
      .scale(180)
      .translate([width / 2, height / 2]);

    // Draw world map
    const worldData = { 
      type: "FeatureCollection", 
      features: [{ 
        type: "Feature", 
        geometry: { 
          type: "Polygon", 
          coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]]] 
        }
      }] 
    };
    
    svg.append("g")
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", d3.geoPath().projection(mapProjection.current))
      .attr("fill", "#1a1a1a")
      .attr("stroke", "#444")
      .attr("stroke-width", 0.5);

    // Add graticule
    const graticule = d3.geoGraticule();
    svg.append("path")
      .datum(graticule())
      .attr("d", d3.geoPath().projection(mapProjection.current))
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.3)
      .attr("opacity", 0.5);

  }, [width, height]);

  // Update time for satellite positions
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate current satellite positions
  const currentSatellitePositions = useMemo(() => {
    if (!satData.length) return [];

    const gmst = satellite.gstime(time);
    return satData.map(sat => {
      const eci = satellite.propagate(sat.satrec, time);
      if (eci?.position) {
        const gdPos = satellite.eciToGeodetic(eci.position, gmst);
        const lat = satellite.radiansToDegrees(gdPos.latitude);
        const lng = satellite.radiansToDegrees(gdPos.longitude);
        const alt = gdPos.height;
        
        return {
          ...sat,
          lat,
          lng,
          alt,
          isSelected: selectedSatellite?.id === sat.id
        };
      }
      return null;
    }).filter(Boolean);
  }, [satData, time, selectedSatellite]);

  // Draw strip images and satellites on map
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    // Remove previous strip images and satellites
    svg.selectAll(".strip-image").remove();
    svg.selectAll(".satellite-position").remove();

    // Draw strip images
    stripImages.forEach((stripImage, index) => {
      const path = d3.geoPath().projection(mapProjection.current);
      const lineString = {
        type: "LineString",
        coordinates: stripImage.coordinates
      };

      const stripGroup = svg.append("g").attr("class", "strip-image");
      
      // Draw strip image path
      stripGroup.append("path")
        .datum(lineString)
        .attr("d", path)
        .attr("stroke", d3.interpolateViridis(index / stripImages.length))
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .attr("opacity", 0.8 - (stripImages.length - index - 1) * 0.1);

      // Draw swath area
      if (stripImage.coordinates.length >= 2) {
        const swathPolygon = {
          type: "Polygon",
          coordinates: [stripImage.coordinates.concat([stripImage.coordinates[0]])]
        };
        
        stripGroup.append("path")
          .datum(swathPolygon)
          .attr("d", path)
          .attr("fill", d3.interpolateViridis(index / stripImages.length))
          .attr("opacity", 0.2 - (stripImages.length - index - 1) * 0.02);
      }
    });

    // Draw satellite positions
    currentSatellitePositions.forEach(sat => {
      const [x, y] = mapProjection.current([sat.lng, sat.lat]);
      
      if (x && y && !isNaN(x) && !isNaN(y)) {
        const satGroup = svg.append("g")
          .attr("class", "satellite-position")
          .attr("transform", `translate(${x}, ${y})`);

        // Main satellite marker
        satGroup.append("circle")
          .attr("r", sat.isSelected ? 6 : 4)
          .attr("fill", sat.isSelected ? "#ff4444" : "#00ff88")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .style("cursor", "pointer")
          .on("click", () => setSelectedSatellite(sat))
          .on("mouseover", function() {
            d3.select(this).attr("r", sat.isSelected ? 8 : 6);
            showSatelliteTooltip(sat, x, y);
          })
          .on("mouseout", function() {
            d3.select(this).attr("r", sat.isSelected ? 6 : 4);
            hideTooltip();
          });

        // Imaging footprint for selected satellite
        if (sat.isSelected) {
          satGroup.append("circle")
            .attr("r", 15)
            .attr("fill", "none")
            .attr("stroke", "#ff4444")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0.7);
        }
      }
    });

  }, [stripImages, currentSatellitePositions, mapProjection.current]);

  const showSatelliteTooltip = (sat, x, y) => {
    const tooltip = d3.select("body").append("div")
      .attr("class", "satellite-tooltip")
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
      <strong>${sat.name}</strong><br/>
      Position: ${sat.lat.toFixed(2)}°, ${sat.lng.toFixed(2)}°<br/>
      Altitude: ${sat.alt.toFixed(0)} km<br/>
      Swath Width: ${sat.swathWidth.toFixed(0)} km<br/>
      Resolution: ${sat.resolution.toFixed(1)} m<br/>
      Spectral Bands: ${sat.spectralBands}
    `);
  };

  const hideTooltip = () => {
    d3.selectAll(".satellite-tooltip").remove();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#0a0a0a' }}>
      {/* Floating Satellite Spheres */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '40%', zIndex: 10 }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', perspective: '1000px' }}>
          {currentSatellitePositions.slice(0, 8).map((sat, index) => (
            <div
              key={sat.id}
              onClick={() => setSelectedSatellite(sat)}
              style={{
                position: 'absolute',
                left: `${10 + (index % 4) * 20}%`,
                top: `${20 + Math.floor(index / 4) * 30}%`,
                width: sat.isSelected ? '60px' : '40px',
                height: sat.isSelected ? '60px' : '40px',
                borderRadius: '50%',
                background: sat.isSelected ? 
                  'radial-gradient(circle, #ff4444, #aa0000)' : 
                  'radial-gradient(circle, #00ff88, #006644)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: sat.isSelected ? 
                  '0 0 20px rgba(255,68,68,0.6)' : 
                  '0 0 10px rgba(0,255,136,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'white',
                fontWeight: 'bold',
                animation: `float-${index % 3} 3s ease-in-out infinite`,
                transform: `translateZ(${sat.isSelected ? 50 : 20}px)`
              }}
            >
              🛰️
            </div>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <div style={{
        position: 'absolute', top: 20, left: 20, background: 'rgba(0,0,0,0.8)', color: 'white',
        padding: '15px', borderRadius: '8px', zIndex: 1000, minWidth: '280px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>📡 Satellite Strip Imaging</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Active Satellite:</label>
          <select 
            value={selectedSatellite?.id || ''} 
            onChange={(e) => setSelectedSatellite(satData.find(s => s.id === e.target.value))}
            style={{ width: '100%', padding: '5px', borderRadius: '3px' }}
          >
            {satData.map(sat => (
              <option key={sat.id} value={sat.id}>{sat.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => setIsCapturing(!isCapturing)}
            style={{
              background: isCapturing ? '#ff4444' : '#00ff88',
              color: 'white', border: 'none', padding: '8px 15px',
              borderRadius: '5px', cursor: 'pointer', width: '100%'
            }}
          >
            {isCapturing ? '⏹️ Stop Imaging' : '📸 Start Imaging'}
          </button>
        </div>

        <div style={{ fontSize: '11px', opacity: 0.9 }}>
          <div><strong>Imaging Satellites:</strong> {satData.length}</div>
          <div><strong>Strip Images:</strong> {stripImages.length}</div>
          <div><strong>Current Time:</strong> {time.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Satellite Details */}
      {selectedSatellite && (
        <div style={{
          position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.9)', color: 'white',
          padding: '15px', borderRadius: '8px', zIndex: 1000, maxWidth: '250px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#00ff88' }}>{selectedSatellite.name}</h4>
          <div style={{ fontSize: '11px' }}>
            <div><strong>Swath Width:</strong> {selectedSatellite.swathWidth.toFixed(0)} km</div>
            <div><strong>Resolution:</strong> {selectedSatellite.resolution.toFixed(1)} m</div>
            <div><strong>Spectral Bands:</strong> {selectedSatellite.spectralBands}</div>
            {stripImages.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div><strong>Latest Image:</strong></div>
                <div>Cloud Cover: {stripImages[stripImages.length - 1]?.cloudCover.toFixed(1)}%</div>
                <div>Quality: {(stripImages[stripImages.length - 1]?.quality * 100).toFixed(0)}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2D Map with Strip Images */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%' }}>
        <svg ref={svgRef} width={width} height={height}
             style={{ width: '100%', height: '100%', background: '#111' }} />
      </div>

      {/* Strip Image List */}
      {stripImages.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 20, right: 20, background: 'rgba(0,0,0,0.9)', color: 'white',
          padding: '15px', borderRadius: '8px', zIndex: 1000, maxWidth: '300px', maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#00ff88' }}>Recent Strip Images</h4>
          {stripImages.slice(-5).reverse().map((strip, index) => (
            <div key={strip.id} style={{ 
              fontSize: '10px', marginBottom: '8px', padding: '5px', 
              background: 'rgba(255,255,255,0.1)', borderRadius: '3px' 
            }}>
              <div><strong>{strip.satellite}</strong></div>
              <div>{strip.timestamp.toLocaleTimeString()}</div>
              <div>Resolution: {strip.resolution.toFixed(1)}m | Quality: {(strip.quality * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Animation Styles */}
      <style jsx>{`
        @keyframes float-0 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(90deg); }
        }
      `}</style>
    </div>
  );
};

export default StripImage;
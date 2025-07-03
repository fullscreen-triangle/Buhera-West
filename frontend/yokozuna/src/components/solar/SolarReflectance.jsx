// This package heavily uses solar reflectance, considering the region of interest, southern africa  
// I want you to use the DayNighCycle component, slow it down, and then an informaton box ( information module has template)

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import * as d3 from 'd3';

/**
 * Solar Reflectance Visualization Component
 * 
 * Advanced Material Reflectance Analysis:
 * - Real-time solar reflectance measurements for multiple materials
 * - Spectral analysis across UV, visible, and IR wavelengths
 * - Temperature-dependent reflectance variations
 * - Surface condition impact analysis (wet vs dry, weathered vs new)
 * - Albedo calculations and atmospheric coupling effects
 */

// Material sample configurations
const MATERIAL_TYPES = {
  concrete: {
    name: "Concrete",
    baseAlbedo: 0.4,
    color: "#cccccc",
    roughness: 0.8,
    metalness: 0.0,
    temperatureCoeff: -0.001,
    weatheringFactor: 0.95,
    spectrum: {
      uv: 0.35,
      visible: 0.45,
      ir: 0.25
    }
  },
  grass: {
    name: "Grass",
    baseAlbedo: 0.25,
    color: "#4a7c2e",
    roughness: 0.9,
    metalness: 0.0,
    temperatureCoeff: -0.0015,
    weatheringFactor: 0.9,
    spectrum: {
      uv: 0.1,
      visible: 0.3,
      ir: 0.8
    }
  },
  water: {
    name: "Water",
    baseAlbedo: 0.06,
    color: "#1e4d72",
    roughness: 0.1,
    metalness: 0.0,
    temperatureCoeff: 0.0005,
    weatheringFactor: 1.0,
    spectrum: {
      uv: 0.05,
      visible: 0.08,
      ir: 0.02
    }
  },
  sand: {
    name: "Sand",
    baseAlbedo: 0.35,
    color: "#deb887",
    roughness: 0.7,
    metalness: 0.0,
    temperatureCoeff: -0.0008,
    weatheringFactor: 0.98,
    spectrum: {
      uv: 0.3,
      visible: 0.4,
      ir: 0.35
    }
  },
  asphalt: {
    name: "Asphalt",
    baseAlbedo: 0.12,
    color: "#333333",
    roughness: 0.9,
    metalness: 0.0,
    temperatureCoeff: -0.0012,
    weatheringFactor: 0.92,
    spectrum: {
      uv: 0.08,
      visible: 0.12,
      ir: 0.18
    }
  },
  snow: {
    name: "Fresh Snow",
    baseAlbedo: 0.85,
    color: "#ffffff",
    roughness: 0.3,
    metalness: 0.0,
    temperatureCoeff: -0.002,
    weatheringFactor: 0.8,
    spectrum: {
      uv: 0.9,
      visible: 0.95,
      ir: 0.7
    }
  }
};

// 3D Material Sample Component
const MaterialSample = ({ materialType, position, temperature, moisture, age, showReflection }) => {
  const meshRef = useRef();
  const reflectionRef = useRef();
  const [currentAlbedo, setCurrentAlbedo] = useState(0);

  const material = MATERIAL_TYPES[materialType];

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate samples slowly
      meshRef.current.rotation.y += 0.01;
      
      // Calculate dynamic albedo based on conditions
      const tempEffect = 1 + (temperature - 20) * material.temperatureCoeff;
      const moistureEffect = materialType === 'concrete' ? (1 - moisture * 0.3) : 
                           materialType === 'grass' ? (1 - moisture * 0.1) :
                           materialType === 'sand' ? (1 - moisture * 0.4) : 1;
      const ageEffect = Math.pow(material.weatheringFactor, age);
      
      const dynamicAlbedo = material.baseAlbedo * tempEffect * moistureEffect * ageEffect;
      setCurrentAlbedo(dynamicAlbedo);
      
      // Update material properties
      if (meshRef.current.material) {
        meshRef.current.material.color.setHex(
          parseInt(material.color.replace('#', ''), 16)
        );
        meshRef.current.material.opacity = 1 - (moisture * 0.2);
      }
    }

    // Update reflection visualization
    if (showReflection && reflectionRef.current) {
      const time = state.clock.elapsedTime;
      reflectionRef.current.position.y = Math.sin(time * 2) * 0.1 + 2;
      reflectionRef.current.material.opacity = currentAlbedo;
    }
  });

  return (
    <group position={position}>
      {/* Material sample */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshStandardMaterial 
          color={material.color}
          roughness={material.roughness}
          metalness={material.metalness}
          transparent
        />
      </mesh>
      
      {/* Reflection visualization */}
      {showReflection && (
        <mesh ref={reflectionRef} position={[0, 2, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial 
            color="#ffff88"
            opacity={currentAlbedo}
            transparent
          />
        </mesh>
      )}
      
      {/* Sample label */}
      <Html position={[0, 0.5, 0]}>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}>
          <div>{material.name}</div>
          <div>Albedo: {currentAlbedo.toFixed(3)}</div>
        </div>
      </Html>
    </group>
  );
};

// Solar Radiation Visualization
const SolarRadiation = ({ intensity, angle }) => {
  const raysRef = useRef();
  const [rayPositions, setRayPositions] = useState([]);

  useEffect(() => {
    const rays = [];
    const rayCount = Math.floor(intensity * 50 + 20);
    
    for (let i = 0; i < rayCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      const y = 15;
      
      rays.push({
        id: i,
        start: [x, y, z],
        direction: [
          Math.sin(angle * Math.PI / 180) * 0.1,
          -0.2,
          Math.cos(angle * Math.PI / 180) * 0.1
        ]
      });
    }
    setRayPositions(rays);
  }, [intensity, angle]);

  useFrame(() => {
    setRayPositions(prev => prev.map(ray => ({
      ...ray,
      start: [
        ray.start[0] + ray.direction[0],
        ray.start[1] + ray.direction[1],
        ray.start[2] + ray.direction[2]
      ]
    })).filter(ray => ray.start[1] > 0));
  });

  return (
    <group ref={raysRef}>
      {rayPositions.map(ray => (
        <mesh key={ray.id} position={ray.start}>
          <cylinderGeometry args={[0.02, 0.02, 0.5]} />
          <meshBasicMaterial color="#ffff00" opacity={0.6} transparent />
        </mesh>
      ))}
    </group>
  );
};

// Spectral Analysis Chart
const SpectralChart = ({ materialType, showSpectrum }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!showSpectrum || !materialType) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const material = MATERIAL_TYPES[materialType];
    
    const wavelengths = [
      { name: "UV", wavelength: 300, reflectance: material.spectrum.uv, color: "#8B00FF" },
      { name: "Blue", wavelength: 450, reflectance: material.spectrum.visible * 0.8, color: "#0000FF" },
      { name: "Green", wavelength: 550, reflectance: material.spectrum.visible, color: "#00FF00" },
      { name: "Red", wavelength: 650, reflectance: material.spectrum.visible * 0.9, color: "#FF0000" },
      { name: "IR", wavelength: 1000, reflectance: material.spectrum.ir, color: "#FF8C00" }
    ];

    const xScale = d3.scaleLinear()
      .domain([250, 1100])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    // Draw spectrum line
    const line = d3.line()
      .x(d => xScale(d.wavelength))
      .y(d => yScale(d.reflectance))
      .curve(d3.curveCardinal);

    svg.append("path")
      .datum(wavelengths)
      .attr("fill", "none")
      .attr("stroke", "#00ffff")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Draw data points
    svg.selectAll(".spectrum-point")
      .data(wavelengths)
      .enter()
      .append("circle")
      .attr("class", "spectrum-point")
      .attr("cx", d => xScale(d.wavelength))
      .attr("cy", d => yScale(d.reflectance))
      .attr("r", 4)
      .attr("fill", d => d.color)
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}nm`));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d3.format(".1%")));

    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Wavelength (nm)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Reflectance");

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "14px")
      .text(`${material.name} - Spectral Reflectance`);

  }, [materialType, showSpectrum]);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.9)',
      borderRadius: '8px',
      padding: '10px',
      margin: '10px'
    }}>
      <svg ref={svgRef} width="300" height="200" />
    </div>
  );
};

// Albedo Comparison Chart
const AlbedoChart = ({ materials, realTimeData }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 350;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };

    const materialNames = Object.keys(materials);
    
    const xScale = d3.scaleBand()
      .domain(materialNames)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    // Draw bars
    svg.selectAll(".albedo-bar")
      .data(materialNames)
      .enter()
      .append("rect")
      .attr("class", "albedo-bar")
      .attr("x", d => xScale(d))
      .attr("y", d => yScale(materials[d].baseAlbedo))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - margin.bottom - yScale(materials[d].baseAlbedo))
      .attr("fill", d => materials[d].color)
      .attr("opacity", 0.8);

    // Add real-time fluctuation overlay
    if (realTimeData && realTimeData.length > 0) {
      svg.selectAll(".realtime-line")
        .data(materialNames)
        .enter()
        .append("line")
        .attr("class", "realtime-line")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d) + xScale.bandwidth())
        .attr("y1", d => {
          const realtimeValue = realTimeData.find(rt => rt.material === d)?.albedo || materials[d].baseAlbedo;
          return yScale(realtimeValue);
        })
        .attr("y2", d => {
          const realtimeValue = realTimeData.find(rt => rt.material === d)?.albedo || materials[d].baseAlbedo;
          return yScale(realtimeValue);
        })
        .attr("stroke", "#ff0000")
        .attr("stroke-width", 3);
    }

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d3.format(".1%")));

    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Material Types");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Albedo");

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "14px")
      .text("Material Albedo Comparison");

  }, [materials, realTimeData]);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.9)',
      borderRadius: '8px',
      padding: '10px',
      margin: '10px'
    }}>
      <svg ref={svgRef} width="350" height="250" />
    </div>
  );
};

// Main Solar Reflectance Component
const SolarReflectance = () => {
  const [selectedMaterial, setSelectedMaterial] = useState('concrete');
  const [temperature, setTemperature] = useState(25);
  const [moisture, setMoisture] = useState(0.2);
  const [surfaceAge, setSurfaceAge] = useState(1);
  const [solarIntensity, setSolarIntensity] = useState(0.8);
  const [solarAngle, setSolarAngle] = useState(45);
  const [showSpectrum, setShowSpectrum] = useState(true);
  const [showReflections, setShowReflections] = useState(true);
  const [realTimeAlbedoData, setRealTimeAlbedoData] = useState([]);

  // Update real-time albedo measurements
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = Object.keys(MATERIAL_TYPES).map(materialKey => {
        const material = MATERIAL_TYPES[materialKey];
        const tempEffect = 1 + (temperature - 20) * material.temperatureCoeff;
        const moistureEffect = materialKey === 'concrete' ? (1 - moisture * 0.3) : 
                             materialKey === 'grass' ? (1 - moisture * 0.1) :
                             materialKey === 'sand' ? (1 - moisture * 0.4) : 1;
        const ageEffect = Math.pow(material.weatheringFactor, surfaceAge);
        const randomVariation = 0.95 + Math.random() * 0.1; // ±5% random variation
        
        const dynamicAlbedo = material.baseAlbedo * tempEffect * moistureEffect * ageEffect * randomVariation;
        
        return {
          material: materialKey,
          albedo: Math.max(0, Math.min(1, dynamicAlbedo))
        };
      });
      
      setRealTimeAlbedoData(newData);
    }, 1000);

    return () => clearInterval(interval);
  }, [temperature, moisture, surfaceAge]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000020' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 1000,
        minWidth: '300px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>🌞 Solar Reflectance</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Selected Material:
          </label>
          <select 
            value={selectedMaterial} 
            onChange={(e) => setSelectedMaterial(e.target.value)}
            style={{
              width: '100%',
              padding: '4px',
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: '4px'
            }}
          >
            {Object.entries(MATERIAL_TYPES).map(([key, material]) => (
              <option key={key} value={key}>{material.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Temperature: {temperature}°C
          </label>
          <input
            type="range"
            min="-10"
            max="50"
            step="1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Surface Moisture: {(moisture * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={moisture}
            onChange={(e) => setMoisture(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Surface Age: {surfaceAge.toFixed(1)} years
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={surfaceAge}
            onChange={(e) => setSurfaceAge(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Solar Angle: {solarAngle}°
          </label>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={solarAngle}
            onChange={(e) => setSolarAngle(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input 
              type="checkbox" 
              checked={showSpectrum} 
              onChange={(e) => setShowSpectrum(e.target.checked)}
              style={{ marginRight: '8px' }} 
            />
            Show Spectral Analysis
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input 
              type="checkbox" 
              checked={showReflections} 
              onChange={(e) => setShowReflections(e.target.checked)}
              style={{ marginRight: '8px' }} 
            />
            Show Reflections
          </label>
        </div>

        <div style={{ fontSize: '11px', opacity: 0.9 }}>
          <div><strong>Current Material:</strong> {MATERIAL_TYPES[selectedMaterial].name}</div>
          <div><strong>Base Albedo:</strong> {MATERIAL_TYPES[selectedMaterial].baseAlbedo.toFixed(3)}</div>
          <div><strong>Solar Intensity:</strong> {(solarIntensity * 100).toFixed(0)}%</div>
          <div><strong>Surface Conditions:</strong> {temperature}°C, {(moisture * 100).toFixed(0)}% humidity</div>
        </div>
      </div>

      {/* Charts Panel */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <SpectralChart 
          materialType={selectedMaterial}
          showSpectrum={showSpectrum}
        />
        <AlbedoChart 
          materials={MATERIAL_TYPES}
          realTimeData={realTimeAlbedoData}
        />
      </div>

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [12, 8, 12], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={solarIntensity}
            angle={Math.PI / 4}
          />
          
          <Stars radius={100} depth={50} count={500} factor={4} />
          
          <SolarRadiation 
            intensity={solarIntensity}
            angle={solarAngle}
          />
          
          {/* Material samples arranged in a grid */}
          {Object.keys(MATERIAL_TYPES).map((materialKey, index) => {
            const x = (index % 3) * 3 - 3;
            const z = Math.floor(index / 3) * 3 - 3;
            
            return (
              <MaterialSample
                key={materialKey}
                materialType={materialKey}
                position={[x, 0, z]}
                temperature={temperature}
                moisture={moisture}
                age={surfaceAge}
                showReflection={showReflections}
              />
            );
          })}
          
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={30}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SolarReflectance;
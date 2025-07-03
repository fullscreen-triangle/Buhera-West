import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import * as d3 from 'd3';

/**
 * Solar Properties 3D Visualization Component
 * 
 * Comprehensive Solar Physics Analysis:
 * - 3D solar surface with real-time activity simulation
 * - Magnetic field line visualization and analysis
 * - Solar wind particle flow and velocity mapping
 * - Corona temperature and density visualization
 * - Solar irradiance and space weather monitoring
 */

// 3D Solar Surface Model
const SolarSphere = ({ solarActivity, showMagneticField, showSolarWind }) => {
  const solarRef = useRef();
  const [solarFlares, setSolarFlares] = useState([]);
  const [magneticFieldLines, setMagneticFieldLines] = useState([]);

  useFrame((state) => {
    if (solarRef.current) {
      solarRef.current.rotation.y += 0.005;
      
      // Update solar surface activity
      const time = state.clock.elapsedTime;
      solarRef.current.material.uniforms.time.value = time;
    }
  });

  // Generate solar flares based on activity level
  useEffect(() => {
    const flares = [];
    const flareCount = Math.floor(solarActivity * 10);
    
    for (let i = 0; i < flareCount; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      
      flares.push({
        id: i,
        position: [
          Math.sin(theta) * Math.cos(phi) * 5.2,
          Math.cos(theta) * 5.2,
          Math.sin(theta) * Math.sin(phi) * 5.2
        ],
        intensity: Math.random() * 0.8 + 0.2,
        size: Math.random() * 0.5 + 0.2
      });
    }
    setSolarFlares(flares);
  }, [solarActivity]);

  // Generate magnetic field lines
  useEffect(() => {
    if (!showMagneticField) return;
    
    const fieldLines = [];
    for (let i = 0; i < 20; i++) {
      const startPhi = (i / 20) * Math.PI * 2;
      const points = [];
      
      for (let t = 0; t <= 1; t += 0.05) {
        const radius = 5 + t * 15;
        const phi = startPhi + t * Math.PI * 2;
        const theta = Math.PI/2 + Math.sin(t * Math.PI * 4) * 0.3;
        
        points.push(new THREE.Vector3(
          Math.sin(theta) * Math.cos(phi) * radius,
          Math.cos(theta) * radius,
          Math.sin(theta) * Math.sin(phi) * radius
        ));
      }
      
      fieldLines.push({
        id: i,
        points: points,
        strength: Math.random() * 0.8 + 0.2
      });
    }
    setMagneticFieldLines(fieldLines);
  }, [showMagneticField]);

  // Solar surface shader material
  const solarMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      activity: { value: solarActivity }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float activity;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      vec3 hash3(vec3 p) {
        p = vec3(dot(p,vec3(127.1,311.7,74.7)),
                 dot(p,vec3(269.5,183.3,246.1)),
                 dot(p,vec3(113.5,271.9,124.6)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }
      
      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        vec3 u = f * f * (3.0 - 2.0 * f);
        
        return mix(mix(mix(dot(hash3(i + vec3(0.0,0.0,0.0)), f - vec3(0.0,0.0,0.0)),
                          dot(hash3(i + vec3(1.0,0.0,0.0)), f - vec3(1.0,0.0,0.0)), u.x),
                      mix(dot(hash3(i + vec3(0.0,1.0,0.0)), f - vec3(0.0,1.0,0.0)),
                          dot(hash3(i + vec3(1.0,1.0,0.0)), f - vec3(1.0,1.0,0.0)), u.x), u.y),
                  mix(mix(dot(hash3(i + vec3(0.0,0.0,1.0)), f - vec3(0.0,0.0,1.0)),
                          dot(hash3(i + vec3(1.0,0.0,1.0)), f - vec3(1.0,0.0,1.0)), u.x),
                      mix(dot(hash3(i + vec3(0.0,1.0,1.0)), f - vec3(0.0,1.0,1.0)),
                          dot(hash3(i + vec3(1.0,1.0,1.0)), f - vec3(1.0,1.0,1.0)), u.x), u.y), u.z);
      }
      
      void main() {
        vec3 pos = vPosition * 2.0 + time * 0.1;
        float n = noise(pos);
        
        // Base solar color
        vec3 solarBase = vec3(1.0, 0.6, 0.1);
        
        // Activity-based intensity variation
        float intensity = 0.8 + activity * 0.4 + n * 0.3;
        
        // Solar surface features
        vec3 color = solarBase * intensity;
        color = mix(color, vec3(1.0, 0.2, 0.0), activity * 0.5);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  return (
    <group>
      {/* Main solar sphere */}
      <mesh ref={solarRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <primitive object={solarMaterial} attach="material" />
      </mesh>
      
      {/* Solar flares */}
      {solarFlares.map(flare => (
        <mesh key={flare.id} position={flare.position}>
          <sphereGeometry args={[flare.size, 16, 16]} />
          <meshBasicMaterial 
            color="#ffaa00" 
            opacity={flare.intensity} 
            transparent 
          />
        </mesh>
      ))}
      
      {/* Magnetic field lines */}
      {showMagneticField && magneticFieldLines.map(fieldLine => {
        const geometry = new THREE.BufferGeometry().setFromPoints(fieldLine.points);
        return (
          <line key={fieldLine.id}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial 
              attach="material" 
              color="#00ffff" 
              opacity={fieldLine.strength * 0.6} 
              transparent 
            />
          </line>
        );
      })}
      
      {/* Solar wind particles */}
      {showSolarWind && (
        <SolarWindParticles solarActivity={solarActivity} />
      )}
    </group>
  );
};

// Solar Wind Particle System
const SolarWindParticles = ({ solarActivity }) => {
  const particlesRef = useRef();
  const [particles, setParticles] = useState([]);

  useFrame((state) => {
    if (particlesRef.current) {
      // Update particle positions
      setParticles(prev => prev.map(particle => ({
        ...particle,
        position: [
          particle.position[0] + particle.velocity[0],
          particle.position[1] + particle.velocity[1],
          particle.position[2] + particle.velocity[2]
        ],
        life: particle.life - 0.01
      })).filter(p => p.life > 0));
    }
  });

  // Generate new solar wind particles
  useEffect(() => {
    const interval = setInterval(() => {
      const newParticles = [];
      const particleCount = Math.floor(solarActivity * 20 + 10);
      
      for (let i = 0; i < particleCount; i++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const radius = 5.5;
        
        const startPos = [
          Math.sin(theta) * Math.cos(phi) * radius,
          Math.cos(theta) * radius,
          Math.sin(theta) * Math.sin(phi) * radius
        ];
        
        const velocity = [
          startPos[0] * 0.02,
          startPos[1] * 0.02,
          startPos[2] * 0.02
        ];
        
        newParticles.push({
          id: Math.random(),
          position: startPos,
          velocity: velocity,
          life: 1.0,
          speed: 400 + Math.random() * 800 // km/s
        });
      }
      
      setParticles(prev => [...prev, ...newParticles].slice(-200));
    }, 100);

    return () => clearInterval(interval);
  }, [solarActivity]);

  return (
    <group ref={particlesRef}>
      {particles.map(particle => (
        <mesh key={particle.id} position={particle.position}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial 
            color="#ffff00" 
            opacity={particle.life * 0.8} 
            transparent 
          />
        </mesh>
      ))}
    </group>
  );
};

// Corona Visualization
const CoronaVisualization = ({ coronaTemperature, coronaDensity }) => {
  const coronaRef = useRef();

  useFrame((state) => {
    if (coronaRef.current) {
      const time = state.clock.elapsedTime;
      coronaRef.current.material.uniforms.time.value = time;
      coronaRef.current.material.uniforms.temperature.value = coronaTemperature;
      coronaRef.current.material.uniforms.density.value = coronaDensity;
    }
  });

  const coronaMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      temperature: { value: coronaTemperature },
      density: { value: coronaDensity }
    },
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float temperature;
      uniform float density;
      varying vec3 vPosition;
      
      void main() {
        float dist = length(vPosition);
        float corona = 1.0 / (1.0 + dist * density);
        
        // Temperature-based color
        vec3 coldColor = vec3(0.2, 0.5, 1.0);
        vec3 hotColor = vec3(1.0, 0.8, 0.2);
        vec3 color = mix(coldColor, hotColor, temperature);
        
        float alpha = corona * 0.3;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });

  return (
    <mesh ref={coronaRef}>
      <sphereGeometry args={[8, 32, 32]} />
      <primitive object={coronaMaterial} attach="material" />
    </mesh>
  );
};

// Magnetic Field Chart Component
const MagneticFieldChart = ({ fieldStrength, polarityData }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 250;
    const height = 150;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Field strength over time
    const xScale = d3.scaleLinear()
      .domain([0, fieldStrength.length - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(fieldStrength))
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal);

    svg.append("path")
      .datum(fieldStrength)
      .attr("fill", "none")
      .attr("stroke", "#00ffff")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5));

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Magnetic Field Strength (nT)");

  }, [fieldStrength]);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.8)',
      borderRadius: '8px',
      padding: '10px',
      margin: '10px'
    }}>
      <svg ref={svgRef} width="250" height="150" />
    </div>
  );
};

// Solar Wind Chart Component
const SolarWindChart = ({ windSpeed, windDensity }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 250;
    const height = 150;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const xScale = d3.scaleLinear()
      .domain([0, windSpeed.length - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([300, 1000])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveCardinal);

    svg.append("path")
      .datum(windSpeed)
      .attr("fill", "none")
      .attr("stroke", "#ffff00")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5));

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Solar Wind Speed (km/s)");

  }, [windSpeed]);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.8)',
      borderRadius: '8px',
      padding: '10px',
      margin: '10px'
    }}>
      <svg ref={svgRef} width="250" height="150" />
    </div>
  );
};

// Corona Temperature Chart
const CoronaChart = ({ coronaData }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 250;
    const height = 150;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Create heatmap for corona temperature
    const colorScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([1000000, 3000000]); // 1-3 million Kelvin

    const cellSize = (width - margin.left - margin.right) / 10;
    
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 5; j++) {
        const temp = 1000000 + Math.random() * 2000000;
        svg.append("rect")
          .attr("x", margin.left + i * cellSize)
          .attr("y", margin.top + j * (cellSize * 0.8))
          .attr("width", cellSize)
          .attr("height", cellSize * 0.8)
          .attr("fill", colorScale(temp))
          .attr("opacity", 0.8);
      }
    }

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Corona Temperature (K)");

  }, [coronaData]);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.8)',
      borderRadius: '8px',
      padding: '10px',
      margin: '10px'
    }}>
      <svg ref={svgRef} width="250" height="150" />
    </div>
  );
};

// Main Solar Properties Component
const SolarProperties = () => {
  const [solarActivity, setSolarActivity] = useState(0.5);
  const [showMagneticField, setShowMagneticField] = useState(true);
  const [showSolarWind, setShowSolarWind] = useState(true);
  const [showCorona, setShowCorona] = useState(true);
  const [coronaTemperature, setCoronaTemperature] = useState(0.7);
  const [coronaDensity, setCoronaDensity] = useState(0.3);

  // Real-time solar data simulation
  const [magneticFieldData, setMagneticFieldData] = useState([]);
  const [solarWindData, setSolarWindData] = useState([]);
  const [coronaData, setCoronaData] = useState([]);

  // Update solar data
  useEffect(() => {
    const interval = setInterval(() => {
      // Magnetic field strength (nT)
      setMagneticFieldData(prev => {
        const newData = [...prev, 20 + Math.random() * 40 + solarActivity * 20];
        return newData.slice(-50);
      });

      // Solar wind speed (km/s)
      setSolarWindData(prev => {
        const newData = [...prev, 400 + Math.random() * 600 + solarActivity * 200];
        return newData.slice(-50);
      });

      // Corona data
      setCoronaData(prev => {
        const newData = [...prev, {
          temperature: 1000000 + Math.random() * 2000000,
          density: Math.random() * 1e15
        }];
        return newData.slice(-20);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [solarActivity]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000008' }}>
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
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>☀️ Solar Properties</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Solar Activity: {(solarActivity * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={solarActivity}
            onChange={(e) => setSolarActivity(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Corona Temperature: {(coronaTemperature * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={coronaTemperature}
            onChange={(e) => setCoronaTemperature(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input 
              type="checkbox" 
              checked={showMagneticField} 
              onChange={(e) => setShowMagneticField(e.target.checked)}
              style={{ marginRight: '8px' }} 
            />
            Show Magnetic Field
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input 
              type="checkbox" 
              checked={showSolarWind} 
              onChange={(e) => setShowSolarWind(e.target.checked)}
              style={{ marginRight: '8px' }} 
            />
            Show Solar Wind
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input 
              type="checkbox" 
              checked={showCorona} 
              onChange={(e) => setShowCorona(e.target.checked)}
              style={{ marginRight: '8px' }} 
            />
            Show Corona
          </label>
        </div>

        <div style={{ fontSize: '11px', opacity: 0.9 }}>
          <div><strong>Surface Temperature:</strong> 5,778 K</div>
          <div><strong>Current Activity:</strong> {solarActivity > 0.7 ? 'High' : solarActivity > 0.4 ? 'Moderate' : 'Low'}</div>
          <div><strong>Solar Wind Speed:</strong> {400 + solarActivity * 600} km/s</div>
          <div><strong>Magnetic Field:</strong> {(20 + solarActivity * 40).toFixed(1)} nT</div>
        </div>
      </div>

      {/* Charts Panel */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(0,0,0,0.9)',
        borderRadius: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <MagneticFieldChart 
          fieldStrength={magneticFieldData}
          polarityData={[]}
        />
        <SolarWindChart 
          windSpeed={solarWindData}
          windDensity={[]}
        />
        <CoronaChart 
          coronaData={coronaData}
        />
      </div>

      {/* 3D Solar Scene */}
      <Canvas
        camera={{ position: [15, 0, 15], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 0]} intensity={2} />
          
          <Stars radius={200} depth={50} count={2000} factor={6} />
          
          <SolarSphere 
            solarActivity={solarActivity}
            showMagneticField={showMagneticField}
            showSolarWind={showSolarWind}
          />
          
          {showCorona && (
            <CoronaVisualization 
              coronaTemperature={coronaTemperature}
              coronaDensity={coronaDensity}
            />
          )}
          
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SolarProperties; 
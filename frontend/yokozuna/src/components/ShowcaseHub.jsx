import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';

// Import all our systems
import { PathTracingDemo, RENDERING_MODES } from './pathtracing/PathTracingDemo';
import { PathTracingOrchestrator } from './pathtracing/PathTracingOrchestrator';
import { GeologicalVisualization } from './geological/GeologicalVisualization';
import { SolarVisualization } from './solar/SolarVisualization';
import { AgriculturalVisualization } from './agricultural/AgriculturalVisualization';
import { AtmosphericVisualization } from './atmospheric/AtmosphericVisualization';
import { PerformanceMonitor } from './performance/PerformanceMonitor';

/**
 * Buhera-West Environmental Intelligence Showcase Hub
 * Systematic display of all functionality across domains
 */

// Main showcase categories
export const SHOWCASE_CATEGORIES = {
  // Path Tracing System (New)
  PATH_TRACING: 'path_tracing',
  
  // Environmental Intelligence Domains
  GEOLOGICAL: 'geological',
  OCEANIC: 'oceanic', 
  ATMOSPHERIC: 'atmospheric',
  AGRICULTURAL: 'agricultural',
  SOLAR: 'solar',
  
  // System Features
  PERFORMANCE: 'performance',
  INTEGRATION: 'integration',
  OVERVIEW: 'overview'
};

// Showcase modes for each category
const SHOWCASE_MODES = {
  [SHOWCASE_CATEGORIES.PATH_TRACING]: {
    title: 'Advanced Path Tracing Renderer',
    subtitle: 'Photorealistic Environmental Visualization',
    modes: Object.values(RENDERING_MODES),
    description: 'State-of-the-art path tracing system converted from THREE.js-PathTracing-Renderer with 8+ specialized environmental renderers.',
    features: [
      'Progressive path tracing with sample accumulation',
      'Real-time ocean waves with Fresnel reflections',
      'Volumetric cloud rendering with scattering',
      'Procedural terrain with atmospheric effects',
      '3D fractals and complex geometry acceleration',
      'Cornell Box validation scene',
      'Adaptive quality and performance optimization'
    ]
  },
  
  [SHOWCASE_CATEGORIES.GEOLOGICAL]: {
    title: 'Subterranean Intelligence',
    subtitle: 'Deep Earth Analysis & Mineral Detection',
    modes: ['mineral_deposits', 'groundwater_flow', 'soil_analysis', 'geological_layers'],
    description: 'Advanced geological surveying with 3D subsurface visualization, mineral deposit mapping, and groundwater flow analysis.',
    features: [
      'Real-time mineral deposit visualization (Gold, Silver, Copper, Iron)',
      '3D groundwater flow vectors and aquifer mapping',
      'Soil composition analysis with depth profiling',
      'Geological layer stratification visualization',
      'Seismic activity monitoring and fault detection'
    ]
  },
  
  [SHOWCASE_CATEGORIES.OCEANIC]: {
    title: 'Maritime Intelligence',
    subtitle: 'Ocean Current & Coastal Analysis',
    modes: ['current_systems', 'temperature_fields', 'wave_analysis', 'coastal_dynamics'],
    description: 'Comprehensive ocean analysis featuring Benguela and Agulhas current systems with temperature field mapping.',
    features: [
      'Benguela Current System visualization',
      'Agulhas Current System tracking',
      'Ocean temperature field mapping',
      'Wave pattern analysis and prediction',
      'Coastal erosion and dynamics monitoring'
    ]
  },
  
  [SHOWCASE_CATEGORIES.ATMOSPHERIC]: {
    title: 'Atmospheric Intelligence',
    subtitle: 'Weather Systems & Air Quality',
    modes: ['pressure_fields', 'wind_patterns', 'humidity_analysis', 'gps_satellites'],
    description: 'Advanced atmospheric monitoring with pressure fields, wind patterns, and GPS satellite integration.',
    features: [
      'Real-time pressure field visualization',
      'Wind vector analysis and prediction',
      'Humidity distribution mapping',
      'GPS satellite tracking and positioning',
      'MIMO signal harvesting optimization',
      'Air quality index monitoring'
    ]
  },
  
  [SHOWCASE_CATEGORIES.AGRICULTURAL]: {
    title: 'Agricultural Intelligence',
    subtitle: 'Precision Farming & Crop Optimization',
    modes: ['crop_analysis', 'irrigation_systems', 'yield_prediction', 'sensor_networks'],
    description: 'Precision agriculture with crop health monitoring, yield prediction, and smart irrigation systems.',
    features: [
      'Individual crop visualization with growth stages',
      'Intelligent irrigation coverage analysis',
      'Yield prediction and optimization',
      'Sensor network monitoring with battery status',
      'Soil health and nutrient analysis',
      'Weather impact assessment on crops'
    ]
  },
  
  [SHOWCASE_CATEGORIES.SOLAR]: {
    title: 'Solar Intelligence',
    subtitle: 'Solar Activity & Space Weather',
    modes: ['solar_surface', 'magnetic_fields', 'solar_wind', 'space_weather'],
    description: 'Comprehensive solar monitoring with surface activity, magnetic fields, and space weather prediction.',
    features: [
      'Real-time solar surface temperature mapping',
      'Solar corona and particle system visualization',
      'Magnetic field line tracking',
      'Solar wind flow analysis',
      'Space weather activity classification (Quiet to Extreme)',
      'Solar flare impact prediction'
    ]
  },
  
  [SHOWCASE_CATEGORIES.PERFORMANCE]: {
    title: 'Performance Intelligence',
    subtitle: 'System Optimization & Monitoring',
    modes: ['fps_tracking', 'memory_optimization', 'adaptive_quality', 'debug_tools'],
    description: 'Advanced performance monitoring with adaptive quality control and real-time optimization.',
    features: [
      'Real-time FPS tracking and optimization',
      'Memory usage monitoring and cleanup',
      'Adaptive quality scaling based on performance',
      '3D performance indicator overlays',
      'Automatic component disabling under load',
      'WebGL optimization and shader management'
    ]
  },
  
  [SHOWCASE_CATEGORIES.INTEGRATION]: {
    title: 'System Integration',
    subtitle: 'Multi-Domain Environmental Analysis',
    modes: ['unified_view', 'cross_domain', 'data_fusion', 'predictive_modeling'],
    description: 'Integrated environmental intelligence combining all domains for comprehensive analysis.',
    features: [
      'Unified multi-domain visualization',
      'Cross-domain correlation analysis',
      'Real-time data fusion from Rust backend',
      'Predictive modeling across environmental systems',
      'Interactive 3D exploration of all domains',
      'Synchronized data streams and updates'
    ]
  }
};

export const ShowcaseHub = ({ initialCategory = SHOWCASE_CATEGORIES.OVERVIEW }) => {
  const [currentCategory, setCurrentCategory] = useState(initialCategory);
  const [currentMode, setCurrentMode] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [globalQuality, setGlobalQuality] = useState(0.8);

  // Sample environmental data
  const sampleData = {
    geological: {
      mineralDeposits: generateMineralData(),
      groundwaterFlow: generateGroundwaterData(),
      soilLayers: generateSoilData()
    },
    oceanic: {
      surfaceMesh: new Float32Array(2000).fill(0).map(() => Math.random() * 5),
      currentVectors: generateCurrentData(),
      temperatureField: generateTemperatureData()
    },
    atmospheric: {
      pressureField: generatePressureData(),
      windVectors: generateWindData(),
      humidityData: generateHumidityData()
    },
    agricultural: {
      cropData: generateCropData(),
      irrigationCoverage: generateIrrigationData(),
      sensorNetwork: generateSensorData()
    },
    solar: {
      surfaceActivity: generateSolarData(),
      magneticFields: generateMagneticData(),
      particleData: generateParticleData()
    }
  };

  const handleCategoryChange = useCallback((category) => {
    setCurrentCategory(category);
    setCurrentMode(null);
  }, []);

  const handleModeChange = useCallback((mode) => {
    setCurrentMode(mode);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#000' }}>
      {/* Navigation Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderBottom: '2px solid #333',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px'
      }}>
        <h1 style={{ 
          color: 'white', 
          margin: 0, 
          fontSize: '18px', 
          fontFamily: 'monospace',
          marginRight: '30px'
        }}>
          🌍 Buhera-West Environmental Intelligence Platform
        </h1>
        
        <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
          {Object.entries(SHOWCASE_CATEGORIES).map(([key, value]) => (
            <button
              key={value}
              onClick={() => handleCategoryChange(value)}
              style={{
                padding: '8px 12px',
                backgroundColor: currentCategory === value ? '#4CAF50' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {key.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: 'white', fontSize: '12px' }}>Quality:</label>
          <input
            type="range"
            min="0.25"
            max="1.0"
            step="0.05"
            value={globalQuality}
            onChange={(e) => setGlobalQuality(parseFloat(e.target.value))}
            style={{ width: '100px' }}
          />
          <span style={{ color: 'white', fontSize: '12px', minWidth: '35px' }}>
            {(globalQuality * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        position: 'absolute', 
        top: '60px', 
        left: 0, 
        right: 0, 
        bottom: 0,
        display: 'flex'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '350px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderRight: '2px solid #333',
          padding: '20px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {currentCategory && SHOWCASE_MODES[currentCategory] && (
            <ShowcaseSidebar
              category={SHOWCASE_MODES[currentCategory]}
              currentMode={currentMode}
              onModeChange={handleModeChange}
            />
          )}
        </div>

        {/* 3D Visualization Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          {currentCategory === SHOWCASE_CATEGORIES.OVERVIEW && (
            <OverviewVisualization data={sampleData} quality={globalQuality} />
          )}
          
          {currentCategory === SHOWCASE_CATEGORIES.PATH_TRACING && (
            <PathTracingDemo 
              initialMode={RENDERING_MODES.OCEAN_SKY}
              showStats={showStats}
              autoRotate={false}
            />
          )}
          
          {currentCategory !== SHOWCASE_CATEGORIES.OVERVIEW && 
           currentCategory !== SHOWCASE_CATEGORIES.PATH_TRACING && (
            <Canvas
              camera={{ position: [0, 100, 400], fov: 45 }}
              dpr={globalQuality}
              gl={{ powerPreference: "high-performance" }}
            >
              <OrbitControls enableDamping dampingFactor={0.05} />
              {showStats && <Stats />}
              
              <ambientLight intensity={0.3} />
              <directionalLight position={[100, 100, 50]} intensity={0.8} />
              
              {/* Render appropriate visualization based on category */}
              {renderVisualizationForCategory(currentCategory, currentMode, sampleData, globalQuality)}
            </Canvas>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderTop: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        color: 'white',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 2000
      }}>
        <span>Status: Active</span>
        <span style={{ marginLeft: '20px' }}>
          Category: {currentCategory?.replace(/_/g, ' ').toUpperCase()}
        </span>
        {currentMode && (
          <span style={{ marginLeft: '20px' }}>
            Mode: {currentMode.replace(/_/g, ' ').toUpperCase()}
          </span>
        )}
        <span style={{ marginLeft: 'auto' }}>
          Buhera-West Environmental Intelligence Platform v2.0
        </span>
      </div>
    </div>
  );
};

// Sidebar component for each category
const ShowcaseSidebar = ({ category, currentMode, onModeChange }) => (
  <div style={{ color: 'white' }}>
    <h2 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#4CAF50' }}>
      {category.title}
    </h2>
    <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#ccc' }}>
      {category.subtitle}
    </h3>
    
    <p style={{ fontSize: '12px', lineHeight: '1.4', marginBottom: '20px', color: '#ddd' }}>
      {category.description}
    </p>
    
    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#4CAF50' }}>Available Modes:</h4>
    <div style={{ marginBottom: '20px' }}>
      {category.modes.map(mode => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 12px',
            marginBottom: '5px',
            backgroundColor: currentMode === mode ? '#4CAF50' : '#444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.2s'
          }}
        >
          {mode.replace(/_/g, ' ').toUpperCase()}
        </button>
      ))}
    </div>
    
    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#4CAF50' }}>Key Features:</h4>
    <ul style={{ fontSize: '11px', lineHeight: '1.4', paddingLeft: '15px', color: '#ddd' }}>
      {category.features.map((feature, index) => (
        <li key={index} style={{ marginBottom: '5px' }}>{feature}</li>
      ))}
    </ul>
  </div>
);

// Overview visualization showing all systems
const OverviewVisualization = ({ data, quality }) => (
  <div style={{
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '2px'
  }}>
    {/* Each quadrant shows a different domain */}
    <div style={{ backgroundColor: '#001', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', fontSize: '14px', zIndex: 100 }}>
        Geological Intelligence
      </div>
      <Canvas camera={{ position: [0, 50, 200] }} dpr={quality * 0.5}>
        <OrbitControls enableRotate={false} enableZoom={false} enablePan={false} />
        <GeologicalVisualization data={data.geological} qualityLevel={quality * 0.5} enabled={true} />
      </Canvas>
    </div>
    
    <div style={{ backgroundColor: '#000011', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', fontSize: '14px', zIndex: 100 }}>
        Oceanic Intelligence
      </div>
      <Canvas camera={{ position: [0, 50, 200] }} dpr={quality * 0.5}>
        <OrbitControls enableRotate={false} enableZoom={false} enablePan={false} />
        <PathTracingOrchestrator 
          initialMode={RENDERING_MODES.OCEAN_SKY}
          globalQualityLevel={quality * 0.3}
          data={data.oceanic}
          enabled={true}
        />
      </Canvas>
    </div>
    
    <div style={{ backgroundColor: '#001100', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', fontSize: '14px', zIndex: 100 }}>
        Agricultural Intelligence
      </div>
      <Canvas camera={{ position: [0, 50, 200] }} dpr={quality * 0.5}>
        <OrbitControls enableRotate={false} enableZoom={false} enablePan={false} />
        <AgriculturalVisualization data={data.agricultural} qualityLevel={quality * 0.5} enabled={true} />
      </Canvas>
    </div>
    
    <div style={{ backgroundColor: '#110000', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', fontSize: '14px', zIndex: 100 }}>
        Solar Intelligence
      </div>
      <Canvas camera={{ position: [0, 50, 200] }} dpr={quality * 0.5}>
        <OrbitControls enableRotate={false} enableZoom={false} enablePan={false} />
        <SolarVisualization data={data.solar} qualityLevel={quality * 0.5} enabled={true} />
      </Canvas>
    </div>
  </div>
);

// Helper function to render visualization for each category
function renderVisualizationForCategory(category, mode, data, quality) {
  switch (category) {
    case SHOWCASE_CATEGORIES.GEOLOGICAL:
      return <GeologicalVisualization data={data.geological} qualityLevel={quality} enabled={true} />;
    case SHOWCASE_CATEGORIES.ATMOSPHERIC:
      return <AtmosphericVisualization data={data.atmospheric} qualityLevel={quality} enabled={true} />;
    case SHOWCASE_CATEGORIES.AGRICULTURAL:
      return <AgriculturalVisualization data={data.agricultural} qualityLevel={quality} enabled={true} />;
    case SHOWCASE_CATEGORIES.SOLAR:
      return <SolarVisualization data={data.solar} qualityLevel={quality} enabled={true} />;
    case SHOWCASE_CATEGORIES.PERFORMANCE:
      return <PerformanceMonitor debugMode={true} />;
    case SHOWCASE_CATEGORIES.INTEGRATION:
      return (
        <group>
          <GeologicalVisualization data={data.geological} qualityLevel={quality * 0.7} enabled={true} />
          <AtmosphericVisualization data={data.atmospheric} qualityLevel={quality * 0.7} enabled={true} />
          <AgriculturalVisualization data={data.agricultural} qualityLevel={quality * 0.7} enabled={true} />
        </group>
      );
    default:
      return null;
  }
}

// Data generation helpers
function generateMineralData() {
  return Array(100).fill(0).map(() => ({
    position: [(Math.random() - 0.5) * 1000, Math.random() * -200, (Math.random() - 0.5) * 1000],
    type: ['gold', 'silver', 'copper', 'iron'][Math.floor(Math.random() * 4)],
    concentration: Math.random(),
    depth: Math.random() * 200
  }));
}

function generateGroundwaterData() {
  return Array(50).fill(0).map(() => ({
    position: [(Math.random() - 0.5) * 1000, -50 - Math.random() * 100, (Math.random() - 0.5) * 1000],
    flow: [(Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10],
    pressure: Math.random()
  }));
}

function generateSoilData() {
  return Array(200).fill(0).map(() => ({
    position: [(Math.random() - 0.5) * 1000, -Math.random() * 20, (Math.random() - 0.5) * 1000],
    ph: 6 + Math.random() * 2,
    moisture: Math.random(),
    nutrients: Math.random()
  }));
}

function generateCurrentData() {
  return Array(30).fill(0).map(() => ({
    x: (Math.random() - 0.5) * 2000,
    y: 0,
    z: (Math.random() - 0.5) * 2000,
    velocity: Math.random() * 5
  }));
}

function generateTemperatureData() {
  return new Float32Array(400).fill(0).map(() => 15 + Math.random() * 15);
}

function generatePressureData() {
  return new Float32Array(300).fill(0).map(() => 1000 + Math.random() * 50);
}

function generateWindData() {
  return Array(40).fill(0).map(() => ({
    position: [(Math.random() - 0.5) * 2000, 50 + Math.random() * 200, (Math.random() - 0.5) * 2000],
    velocity: [(Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20],
    speed: Math.random() * 20
  }));
}

function generateHumidityData() {
  return new Float32Array(200).fill(0).map(() => 40 + Math.random() * 60);
}

function generateCropData() {
  return Array(150).fill(0).map(() => ({
    position: [(Math.random() - 0.5) * 1000, 0, (Math.random() - 0.5) * 1000],
    type: ['wheat', 'corn', 'soy', 'vegetables'][Math.floor(Math.random() * 4)],
    health: Math.random(),
    growth: Math.random()
  }));
}

function generateIrrigationData() {
  return Array(20).fill(0).map(() => ({
    center: [(Math.random() - 0.5) * 1000, 0, (Math.random() - 0.5) * 1000],
    radius: 50 + Math.random() * 100,
    efficiency: Math.random()
  }));
}

function generateSensorData() {
  return Array(25).fill(0).map(() => ({
    position: [(Math.random() - 0.5) * 1000, 2, (Math.random() - 0.5) * 1000],
    battery: Math.random(),
    status: Math.random() > 0.1 ? 'active' : 'inactive',
    readings: Math.random()
  }));
}

function generateSolarData() {
  return {
    temperature: new Float32Array(1000).fill(0).map(() => 5000 + Math.random() * 1000),
    activity: Math.random() * 5 // 0-5 activity level
  };
}

function generateMagneticData() {
  return Array(100).fill(0).map(() => ({
    start: [Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100],
    end: [Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100],
    strength: Math.random()
  }));
}

function generateParticleData() {
  return Array(500).fill(0).map(() => ({
    position: [Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200],
    velocity: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10],
    energy: Math.random()
  }));
}

export default ShowcaseHub; 
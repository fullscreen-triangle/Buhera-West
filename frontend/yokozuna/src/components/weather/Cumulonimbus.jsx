import * as THREE from "three"
import { useRef, useEffect, useState, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Clouds, Cloud, CameraControls, Sky as SkyImpl, StatsGl } from "@react-three/drei"
import { useTime } from "../../contexts/TimeContext"

// Atmospheric simulation for realistic cloud behavior
const useAtmosphericSimulation = (currentTime) => {
  const [atmosphericConditions, setAtmosphericConditions] = useState({
    pressure: 1013.25, // Standard atmospheric pressure in hPa
    temperature: 15, // °C
    humidity: 65, // %
    windSpeed: 10, // km/h
    stability: 0.5, // Atmospheric stability (0-1)
    cloudCoverage: 0.3, // 0-1
    precipitationProbability: 0.1 // 0-1
  });

  useEffect(() => {
    // Convert current time to hours (0-24)
    const timeOfDay = ((currentTime / 1000) % 86400) / 3600;
    const dayOfYear = Math.floor(currentTime / (1000 * 86400)) % 365;
    
    // Simulate realistic atmospheric conditions based on time
    const simulateConditions = () => {
      // Diurnal temperature variation (cooler at night, warmer during day)
      const baseTemp = 15 + Math.sin((dayOfYear / 365) * Math.PI * 2) * 10; // Seasonal variation
      const diurnalTemp = baseTemp + Math.sin(((timeOfDay - 6) / 24) * Math.PI * 2) * 8;
      
      // Atmospheric pressure varies with time and weather systems
      const basePressure = 1013.25 + Math.sin((dayOfYear / 365) * Math.PI * 4) * 15;
      const pressureVariation = Math.sin((timeOfDay / 24) * Math.PI * 2) * 5;
      
      // Humidity typically higher at night, lower during day
      const baseHumidity = 65 + Math.sin((dayOfYear / 365) * Math.PI * 2) * 20;
      const humidityVariation = 65 + Math.sin(((timeOfDay + 12) / 24) * Math.PI * 2) * 25;
      
      // Wind speed variation
      const windVariation = 10 + Math.sin((timeOfDay / 24) * Math.PI * 2) * 15 + Math.random() * 5;
      
      // Atmospheric stability (affects cloud formation)
      const stability = 0.5 + Math.sin((timeOfDay / 24) * Math.PI * 2) * 0.3;
      
      // Cloud coverage based on atmospheric conditions
      const lowPressure = basePressure + pressureVariation < 1005;
      const highHumidity = humidityVariation > 75;
      const unstableAtmosphere = stability < 0.3;
      
      let cloudCoverage = 0.3;
      if (lowPressure) cloudCoverage += 0.4;
      if (highHumidity) cloudCoverage += 0.3;
      if (unstableAtmosphere) cloudCoverage += 0.2;
      cloudCoverage = Math.min(cloudCoverage, 1.0);
      
      // Precipitation probability
      const precipProb = Math.max(0, (cloudCoverage - 0.6) * 2) * 
                        (lowPressure ? 1.5 : 1.0) * 
                        (highHumidity ? 1.3 : 1.0);
      
      setAtmosphericConditions({
        pressure: basePressure + pressureVariation,
        temperature: diurnalTemp,
        humidity: humidityVariation,
        windSpeed: windVariation,
        stability: stability,
        cloudCoverage: cloudCoverage,
        precipitationProbability: Math.min(precipProb, 1.0)
      });
    };
    
    simulateConditions();
    
    // Update atmospheric conditions every 30 seconds
    const interval = setInterval(simulateConditions, 30000);
    return () => clearInterval(interval);
  }, [currentTime]);

  return atmosphericConditions;
};

// Cloud configuration based on atmospheric conditions
const getCloudConfig = (conditions, timeOfDay) => {
  const { cloudCoverage, humidity, stability, precipitationProbability, temperature } = conditions;
  
  // Base cloud parameters
  const baseConfig = {
    seed: Math.floor(timeOfDay * 100), // Changes throughout the day
    segments: Math.floor(15 + cloudCoverage * 25), // More segments for dense clouds
    volume: 4 + cloudCoverage * 8, // Volume increases with coverage
    opacity: 0.6 + cloudCoverage * 0.4, // More opaque with higher coverage
    fade: 5 + stability * 20, // Atmospheric stability affects cloud edges
    growth: 2 + precipitationProbability * 6, // Growth based on precipitation
    speed: 0.05 + (1 - stability) * 0.15, // Unstable atmosphere = faster movement
    range: 80 + cloudCoverage * 40
  };
  
  // Cloud type and color based on conditions
  let cloudType = 'cumulus'; // Default
  let primaryColor = '#ffffff';
  let secondaryColors = ['#f0f0f0', '#e8e8e8', '#d0d0d0'];
  
  if (precipitationProbability > 0.6) {
    cloudType = 'cumulonimbus';
    primaryColor = '#c0c0c0';
    secondaryColors = ['#a0a0a0', '#808080', '#606060'];
    baseConfig.opacity = Math.min(baseConfig.opacity + 0.3, 1.0);
    baseConfig.volume = baseConfig.volume * 1.5;
  } else if (cloudCoverage > 0.7) {
    cloudType = 'stratus';
    primaryColor = '#e0e0e0';
    secondaryColors = ['#d8d8d8', '#c8c8c8', '#b8b8b8'];
    baseConfig.fade = baseConfig.fade * 2;
  } else if (stability > 0.7 && humidity < 50) {
    cloudType = 'cirrus';
    primaryColor = '#f8f8f8';
    secondaryColors = ['#f0f0f0', '#e8e8e8', '#ffffff'];
    baseConfig.opacity = Math.max(baseConfig.opacity - 0.3, 0.3);
    baseConfig.volume = baseConfig.volume * 0.7;
  }
  
  return {
    ...baseConfig,
    cloudType,
    primaryColor,
    secondaryColors,
    bounds: {
      x: 6 + cloudCoverage * 4,
      y: 1 + precipitationProbability * 2,
      z: 6 + cloudCoverage * 4
    }
  };
};

function RealisticSky() {
  const skyRef = useRef()
  const cloudRefs = useRef([])
  const { currentTime, formatTime } = useTime()
  
  // Get atmospheric conditions
  const atmosphericConditions = useAtmosphericSimulation(currentTime)
  
  // Calculate time of day in hours
  const timeOfDay = ((currentTime / 1000) % 86400) / 3600
  
  // Get dynamic cloud configuration
  const cloudConfig = getCloudConfig(atmosphericConditions, timeOfDay)
  
  // State for cloud positions and movement
  const [cloudPositions, setCloudPositions] = useState([
    { x: 0, y: 0, z: 0, drift: { x: 0, y: 0, z: 0 } },
    { x: 15, y: 0, z: 0, drift: { x: 0.1, y: 0.05, z: 0.02 } },
    { x: -15, y: 0, z: 0, drift: { x: -0.05, y: 0.03, z: 0.08 } },
    { x: 0, y: 0, z: -12, drift: { x: 0.03, y: 0.02, z: -0.06 } },
    { x: 0, y: 0, z: 12, drift: { x: -0.02, y: 0.01, z: 0.04 } }
  ])
  
  useFrame((state, delta) => {
    // Rotate sky group based on wind
    if (skyRef.current) {
      const windEffect = atmosphericConditions.windSpeed / 100
      skyRef.current.rotation.y = Math.cos(state.clock.elapsedTime * windEffect) / 4
      skyRef.current.rotation.x = Math.sin(state.clock.elapsedTime * windEffect) / 6
    }
    
    // Animate individual clouds
    cloudRefs.current.forEach((cloudRef, index) => {
      if (cloudRef) {
        const position = cloudPositions[index]
        const windMultiplier = atmosphericConditions.windSpeed / 50
        
        cloudRef.rotation.y += (delta * cloudConfig.speed * windMultiplier) + position.drift.x
        cloudRef.rotation.x += (delta * cloudConfig.speed * windMultiplier * 0.5) + position.drift.y
        cloudRef.rotation.z += (delta * cloudConfig.speed * windMultiplier * 0.3) + position.drift.z
        
        // Subtle position drift
        cloudRef.position.x += position.drift.x * delta
        cloudRef.position.z += position.drift.z * delta
        
        // Keep clouds within bounds
        if (Math.abs(cloudRef.position.x) > 50) {
          cloudRef.position.x = -Math.sign(cloudRef.position.x) * 50
        }
        if (Math.abs(cloudRef.position.z) > 50) {
          cloudRef.position.z = -Math.sign(cloudRef.position.z) * 50
        }
      }
    })
  })
  
  return (
    <>
      <SkyImpl 
        distance={450000}
        sunPosition={[
          Math.sin((timeOfDay / 24) * Math.PI * 2) * 100,
          Math.cos((timeOfDay / 24) * Math.PI * 2) * 50 + 10,
          0
        ]}
        inclination={0.6}
        azimuth={0.25}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        rayleigh={3}
        turbidity={atmosphericConditions.humidity / 10}
      />
      
      <group ref={skyRef}>
        <Clouds 
          material={THREE.MeshLambertMaterial} 
          limit={400} 
          range={cloudConfig.range}
        >
          {/* Primary cloud formations */}
          {cloudPositions.map((position, index) => (
            <Cloud
              key={index}
              ref={el => cloudRefs.current[index] = el}
              seed={cloudConfig.seed + index}
              segments={cloudConfig.segments}
              volume={cloudConfig.volume}
              opacity={cloudConfig.opacity}
              fade={cloudConfig.fade}
              growth={cloudConfig.growth}
              speed={cloudConfig.speed}
              bounds={[cloudConfig.bounds.x, cloudConfig.bounds.y, cloudConfig.bounds.z]}
              color={index === 0 ? cloudConfig.primaryColor : cloudConfig.secondaryColors[index % cloudConfig.secondaryColors.length]}
              position={[position.x, position.y, position.z]}
            />
          ))}
          
          {/* Background atmospheric layer */}
          <Cloud 
            concentrate="outside" 
            growth={50 + atmosphericConditions.cloudCoverage * 100}
            color={cloudConfig.primaryColor}
            opacity={0.3 + atmosphericConditions.cloudCoverage * 0.4}
            seed={cloudConfig.seed * 0.3}
            bounds={200 + atmosphericConditions.cloudCoverage * 100}
            volume={100 + atmosphericConditions.cloudCoverage * 200}
          />
        </Clouds>
      </group>
    </>
  )
}

const Cumulonimbus = ({ 
  showAtmosphericData = false, 
  showTimeDisplay = false 
}) => {
  const { currentTime, formatTime } = useTime()
  const atmosphericConditions = useAtmosphericSimulation(currentTime)
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 40 }}>
        <RealisticSky />
        <CameraControls />
        {showAtmosphericData && <StatsGl />}
      </Canvas>
      
      {/* Environmental Intelligence Data Overlay */}
      {showAtmosphericData && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          zIndex: 1000,
          minWidth: '250px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
            Atmospheric Intelligence
          </div>
          <div>Pressure: {atmosphericConditions.pressure.toFixed(1)} hPa</div>
          <div>Temperature: {atmosphericConditions.temperature.toFixed(1)}°C</div>
          <div>Humidity: {atmosphericConditions.humidity.toFixed(1)}%</div>
          <div>Wind Speed: {atmosphericConditions.windSpeed.toFixed(1)} km/h</div>
          <div>Cloud Coverage: {(atmosphericConditions.cloudCoverage * 100).toFixed(1)}%</div>
          <div>Precipitation Prob: {(atmosphericConditions.precipitationProbability * 100).toFixed(1)}%</div>
          <div>Stability: {atmosphericConditions.stability.toFixed(2)}</div>
          {showTimeDisplay && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333' }}>
              <div>Time: {formatTime(currentTime, 'datetime')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Cumulonimbus
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/**
 * Atmospheric Visualization Component
 * Renders atmospheric pressure, temperature, humidity, wind, and GPS data
 */
export const AtmosphericVisualization = ({ data, qualityLevel, enabled }) => {
  const pressureFieldRef = useRef();
  const temperatureFieldRef = useRef();
  const humidityFieldRef = useRef();
  const windVectorsRef = useRef();
  const gpsDataRef = useRef();
  const atmosphericLayersRef = useRef();
  
  // Pressure field visualization
  const pressureField = useMemo(() => {
    if (!data?.pressureField || !enabled) return null;
    
    const geometry = new THREE.PlaneGeometry(2000, 2000, 32, 32);
    const positions = geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);
    
    for (let i = 0; i < positions.length; i += 3) {
      const index = Math.floor(i / 3);
      const pressure = data.pressureField[index % data.pressureField.length] || 1013.25; // Default sea level pressure
      
      // Elevation based on pressure (higher pressure = lower elevation)
      const elevation = (1013.25 - pressure) * 0.1;
      positions[i + 1] = elevation;
      
      // Color based on pressure
      const color = getPressureColor(pressure);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }, [data?.pressureField, enabled]);
  
  // Temperature field visualization
  const temperatureField = useMemo(() => {
    if (!data?.temperatureField || !enabled) return null;
    
    const geometry = new THREE.PlaneGeometry(2000, 2000, 64, 64);
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    
    for (let i = 0; i < colors.length; i += 3) {
      const index = Math.floor(i / 3);
      const temperature = data.temperatureField[index % data.temperatureField.length] || 20; // Default 20°C
      
      const color = getTemperatureColor(temperature);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, [data?.temperatureField, enabled]);
  
  // Humidity field visualization
  const humidityField = useMemo(() => {
    if (!data?.humidityField || !enabled) return null;
    
    const geometry = new THREE.PlaneGeometry(2000, 2000, 48, 48);
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    
    for (let i = 0; i < colors.length; i += 3) {
      const index = Math.floor(i / 3);
      const humidity = data.humidityField[index % data.humidityField.length] || 50; // Default 50% humidity
      
      const color = getHumidityColor(humidity);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, [data?.humidityField, enabled]);
  
  // Wind vectors visualization
  const windVectors = useMemo(() => {
    if (!data?.windVectors || !enabled) return [];
    
    const maxVectors = Math.floor(100 * qualityLevel);
    const vectors = data.windVectors.slice(0, maxVectors);
    
    return vectors.map((vector, index) => {
      const speed = Math.sqrt(vector.x * vector.x + vector.z * vector.z);
      const normalizedSpeed = Math.min(speed / 20, 1); // Normalize to 0-1
      
      return {
        position: [vector.x, vector.y + 50, vector.z],
        direction: [vector.x, 0, vector.z],
        speed: speed,
        length: 5 + speed * 2,
        color: getWindSpeedColor(speed)
      };
    });
  }, [data?.windVectors, qualityLevel, enabled]);
  
  // GPS satellite visualization
  const gpsSatellites = useMemo(() => {
    if (!data?.gpsSignalData?.satellites || !enabled) return [];
    
    return data.gpsSignalData.satellites.map((satellite, index) => ({
      position: [satellite.x, satellite.y, satellite.z],
      signalStrength: 0.5 + Math.random() * 0.5,
      id: `GPS-${index + 1}`,
      orbitalPath: generateOrbitalPath(satellite, 200)
    }));
  }, [data?.gpsSignalData?.satellites, enabled]);
  
  // Atmospheric layers
  const atmosphericLayers = useMemo(() => {
    if (!enabled) return [];
    
    return [
      { name: 'Troposphere', height: 100, color: '#87CEEB', opacity: 0.2 },
      { name: 'Stratosphere', height: 200, color: '#4682B4', opacity: 0.15 },
      { name: 'Mesosphere', height: 300, color: '#191970', opacity: 0.1 },
      { name: 'Thermosphere', height: 400, color: '#000080', opacity: 0.05 }
    ];
  }, [enabled]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Animate pressure field
    if (pressureFieldRef.current) {
      pressureFieldRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
    
    // Animate wind vectors
    if (windVectorsRef.current) {
      windVectorsRef.current.children.forEach((windGroup, index) => {
        const oscillation = Math.sin(state.clock.elapsedTime * 2 + index * 0.2);
        windGroup.rotation.y = oscillation * 0.1;
        windGroup.children[0].scale.z = 1 + oscillation * 0.2; // Arrow shaft
      });
    }
    
    // Animate GPS satellites
    if (gpsDataRef.current) {
      gpsDataRef.current.children.forEach((satellite, index) => {
        const orbit = state.clock.elapsedTime * 0.1 + index * 0.5;
        satellite.position.x = Math.cos(orbit) * 500;
        satellite.position.z = Math.sin(orbit) * 500;
        satellite.rotation.y += delta;
      });
    }
    
    // Animate atmospheric layers
    if (atmosphericLayersRef.current) {
      atmosphericLayersRef.current.children.forEach((layer, index) => {
        layer.rotation.y += delta * (0.1 + index * 0.05);
      });
    }
  });
  
  if (!enabled || !data) return null;
  
  return (
    <group name="atmospheric-visualization">
      {/* Pressure Field */}
      {pressureField && qualityLevel > 0.3 && (
        <mesh 
          ref={pressureFieldRef}
          geometry={pressureField} 
          position={[0, 25, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            vertexColors
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Temperature Field */}
      {temperatureField && qualityLevel > 0.4 && (
        <mesh 
          ref={temperatureFieldRef}
          geometry={temperatureField} 
          position={[0, 35, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            vertexColors
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Humidity Field */}
      {humidityField && qualityLevel > 0.5 && (
        <mesh 
          ref={humidityFieldRef}
          geometry={humidityField} 
          position={[0, 45, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            vertexColors
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Wind Vectors */}
      {windVectors.length > 0 && (
        <group ref={windVectorsRef}>
          {windVectors.map((wind, index) => (
            <group key={index} position={wind.position}>
              {/* Wind arrow shaft */}
              <mesh position={[0, 0, wind.length / 2]}>
                <cylinderGeometry args={[0.3, 0.3, wind.length, 8]} />
                <meshPhongMaterial color={wind.color} transparent opacity={0.8} />
              </mesh>
              
              {/* Wind arrow head */}
              <mesh position={[0, 0, wind.length]}>
                <coneGeometry args={[1, 3, 8]} />
                <meshPhongMaterial color={wind.color} transparent opacity={0.9} />
              </mesh>
              
              {/* Wind speed indicator */}
              <Text
                position={[0, 5, 0]}
                fontSize={3}
                color={wind.color}
                anchorX="center"
                anchorY="middle"
              >
                {wind.speed.toFixed(1)} m/s
              </Text>
            </group>
          ))}
        </group>
      )}
      
      {/* GPS Satellites */}
      {gpsSatellites.length > 0 && qualityLevel > 0.6 && (
        <group ref={gpsDataRef}>
          {gpsSatellites.map((satellite, index) => (
            <group key={index} position={satellite.position}>
              {/* Satellite body */}
              <mesh>
                <boxGeometry args={[2, 1, 3]} />
                <meshPhongMaterial color="#C0C0C0" />
              </mesh>
              
              {/* Solar panels */}
              <mesh position={[-2, 0, 0]}>
                <boxGeometry args={[3, 0.1, 4]} />
                <meshPhongMaterial color="#001F3F" emissive="#001F3F" emissiveIntensity={0.3} />
              </mesh>
              <mesh position={[2, 0, 0]}>
                <boxGeometry args={[3, 0.1, 4]} />
                <meshPhongMaterial color="#001F3F" emissive="#001F3F" emissiveIntensity={0.3} />
              </mesh>
              
              {/* Signal transmission cone */}
              <mesh position={[0, -2, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[5, 10, 8, 1, true]} />
                <meshBasicMaterial 
                  color="#00FF00" 
                  transparent 
                  opacity={satellite.signalStrength * 0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>
              
              {/* Satellite ID */}
              <Text
                position={[0, 3, 0]}
                fontSize={2}
                color="#FFFFFF"
                anchorX="center"
                anchorY="middle"
              >
                {satellite.id}
              </Text>
            </group>
          ))}
        </group>
      )}
      
      {/* Atmospheric Layers */}
      {atmosphericLayers.length > 0 && qualityLevel > 0.4 && (
        <group ref={atmosphericLayersRef}>
          {atmosphericLayers.map((layer, index) => (
            <group key={index}>
              {/* Layer sphere */}
              <mesh position={[0, layer.height, 0]}>
                <sphereGeometry args={[1000 + index * 200, 16, 16]} />
                <meshBasicMaterial 
                  color={layer.color}
                  transparent
                  opacity={layer.opacity}
                  side={THREE.BackSide}
                />
              </mesh>
              
              {/* Layer label */}
              <Text
                position={[800, layer.height, 0]}
                fontSize={20}
                color={layer.color}
                anchorX="center"
                anchorY="middle"
              >
                {layer.name}
              </Text>
            </group>
          ))}
        </group>
      )}
      
      {/* GPS Signal Accuracy Display */}
      {data?.gpsSignalData && (
        <group position={[600, 100, 0]}>
          <Text
            position={[0, 20, 0]}
            fontSize={12}
            color="#00FF00"
            anchorX="center"
            anchorY="middle"
          >
            GPS Accuracy: {data.gpsSignalData.accuracy?.toFixed(2) || '0.50'}m
          </Text>
          
          <Text
            position={[0, 10, 0]}
            fontSize={10}
            color="#FFC107"
            anchorX="center"
            anchorY="middle"
          >
            Atmospheric Delay: {data.gpsSignalData.atmosphericDelay?.toFixed(3) || '0.015'}ms
          </Text>
          
          {/* Accuracy indicator sphere */}
          <mesh>
            <sphereGeometry args={[data.gpsSignalData.accuracy || 0.5, 16, 16]} />
            <meshBasicMaterial 
              color={getAccuracyColor(data.gpsSignalData.accuracy || 0.5)}
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
        </group>
      )}
      
      {/* MIMO Signal Harvesting Indicators */}
      <group position={[-600, 80, 0]}>
        <Text
          position={[0, 20, 0]}
          fontSize={12}
          color="#E91E63"
          anchorX="center"
          anchorY="middle"
        >
          MIMO Signals: {Math.floor(15000 + Math.random() * 35000)}
        </Text>
        
        <Text
          position={[0, 10, 0]}
          fontSize={10}
          color="#9C27B0"
          anchorX="center"
          anchorY="middle"
        >
          Atmospheric Coupling: 95.2%
        </Text>
        
        {/* Signal strength bars */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[i * 4 - 14, 0, 0]}>
            <boxGeometry args={[2, (i + 1) * 2, 1]} />
            <meshBasicMaterial 
              color={`hsl(${280 + i * 10}, 70%, 60%)`}
              emissive={`hsl(${280 + i * 10}, 70%, 30%)`}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// Helper functions
function getPressureColor(pressure) {
  // Pressure range: 980 hPa (low/storm) to 1040 hPa (high)
  const normalized = (pressure - 980) / 60;
  
  if (normalized < 0.3) {
    // Low pressure - red (storms)
    return { r: 1, g: 0.2, b: 0.2 };
  } else if (normalized < 0.7) {
    // Medium pressure - yellow
    return { r: 1, g: 1, b: 0.2 };
  } else {
    // High pressure - blue (clear weather)
    return { r: 0.2, g: 0.4, b: 1 };
  }
}

function getTemperatureColor(temperature) {
  // Temperature range: -20°C to 50°C
  const normalized = (temperature + 20) / 70;
  
  if (normalized < 0.3) {
    // Cold - blue
    return { r: 0, g: 0.5, b: 1 };
  } else if (normalized < 0.7) {
    // Moderate - green
    return { r: 0, g: 1, b: 0.5 };
  } else {
    // Hot - red
    return { r: 1, g: 0.3, b: 0 };
  }
}

function getHumidityColor(humidity) {
  // Humidity range: 0% to 100%
  const normalized = humidity / 100;
  
  // Dry (brown) to wet (blue)
  return {
    r: 0.8 - normalized * 0.6,
    g: 0.6 - normalized * 0.2,
    b: 0.4 + normalized * 0.6
  };
}

function getWindSpeedColor(speed) {
  // Wind speed from 0 to 30 m/s
  const normalized = Math.min(speed / 30, 1);
  const hue = (1 - normalized) * 240; // Blue (calm) to red (strong)
  return `hsl(${hue}, 80%, 60%)`;
}

function getAccuracyColor(accuracy) {
  // GPS accuracy - green (good) to red (poor)
  if (accuracy < 1) return '#4CAF50';
  if (accuracy < 3) return '#FFC107';
  return '#F44336';
}

function generateOrbitalPath(satellite, radius) {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      satellite.y,
      Math.sin(angle) * radius
    ));
  }
  return points;
}

AtmosphericVisualization.propTypes = {
  data: PropTypes.shape({
    pressureField: PropTypes.instanceOf(Float32Array),
    temperatureField: PropTypes.instanceOf(Float32Array),
    humidityField: PropTypes.instanceOf(Float32Array),
    windVectors: PropTypes.array,
    gpsSignalData: PropTypes.shape({
      satellites: PropTypes.array,
      accuracy: PropTypes.number,
      atmosphericDelay: PropTypes.number,
    }),
  }),
  qualityLevel: PropTypes.number.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default AtmosphericVisualization; 
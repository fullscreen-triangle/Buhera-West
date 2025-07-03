import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import MaizeCrop from './MaizeCrop';
import WheatCrop from './WheatCrop';

/**
 * Agricultural Visualization Component
 * Renders agricultural fields, crops, sensors, irrigation, and yield data
 */
export const AgriculturalVisualization = ({ data, qualityLevel, enabled }) => {
  const fieldRef = useRef();
  const cropsRef = useRef();
  const sensorsRef = useRef();
  const irrigationRef = useRef();
  const yieldDataRef = useRef();
  
  // Agricultural field mesh from data
  const fieldMesh = useMemo(() => {
    if (!data?.fieldMesh || !enabled) return null;
    
    const geometry = new THREE.PlaneGeometry(
      1000, 1000, 
      Math.floor(64 * qualityLevel), 
      Math.floor(64 * qualityLevel)
    );
    
    // Apply field elevation data
    if (data.fieldMesh.length > 0) {
      const positions = geometry.attributes.position.array;
      const colors = new Float32Array(positions.length);
      
      for (let i = 0; i < positions.length; i += 3) {
        const dataIndex = Math.floor((i / 3) % data.fieldMesh.length);
        const elevation = data.fieldMesh[dataIndex] || 0;
        
        // Apply elevation
        positions[i + 1] = elevation * 5; // Scale elevation
        
        // Color based on soil health/elevation
        const soilHealth = (elevation + 10) / 20; // Normalize to 0-1
        const color = getSoilHealthColor(soilHealth);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }
      
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    
    return geometry;
  }, [data?.fieldMesh, qualityLevel, enabled]);
  
  // Advanced crop field configuration
  const cropFields = useMemo(() => {
    if (!data?.cropPositions || !enabled) return [];
    
    // Determine crop types and their positions
    const fields = [];
    const totalPositions = data.cropPositions.length;
    
    // Maize fields (typically larger, positioned in central areas)
    const maizePositions = data.cropPositions.filter((_, index) => index % 3 === 0);
    if (maizePositions.length > 0) {
      fields.push({
        type: 'maize',
        position: [
          maizePositions.reduce((sum, pos) => sum + pos.x, 0) / maizePositions.length,
          0,
          maizePositions.reduce((sum, pos) => sum + pos.z, 0) / maizePositions.length
        ],
        width: Math.min(60, Math.max(30, Math.sqrt(maizePositions.length) * 8)),
        instances: Math.floor(maizePositions.length * qualityLevel * 2),
        growthStage: getCropGrowthAverage(maizePositions),
        health: getCropHealthAverage(maizePositions)
      });
    }
    
    // Wheat fields (smaller, positioned in remaining areas)
    const wheatPositions = data.cropPositions.filter((_, index) => index % 3 !== 0);
    if (wheatPositions.length > 0) {
      fields.push({
        type: 'wheat',
        position: [
          wheatPositions.reduce((sum, pos) => sum + pos.x, 0) / wheatPositions.length,
          0,
          wheatPositions.reduce((sum, pos) => sum + pos.z, 0) / wheatPositions.length + 40
        ],
        width: Math.min(50, Math.max(25, Math.sqrt(wheatPositions.length) * 6)),
        instances: Math.floor(wheatPositions.length * qualityLevel * 3),
        growthStage: getCropGrowthAverage(wheatPositions),
        health: getCropHealthAverage(wheatPositions)
      });
    }
    
    return fields;
  }, [data?.cropPositions, qualityLevel, enabled]);
  
  // Sensor network visualization
  const sensorNetwork = useMemo(() => {
    if (!data?.sensorNetwork || !enabled) return [];
    
    return data.sensorNetwork.map((position, index) => ({
      position: [position.x, position.y + 5, position.z],
      type: getSensorType(index),
      status: getSensorStatus(index),
      batteryLevel: 0.3 + Math.random() * 0.7,
      range: 20 + Math.random() * 30
    }));
  }, [data?.sensorNetwork, enabled]);
  
  // Irrigation coverage areas
  const irrigationCoverage = useMemo(() => {
    if (!data?.irrigationCoverage || !enabled) return [];
    
    return data.irrigationCoverage.map((coverage, index) => ({
      center: [coverage.center.x, coverage.center.y + 1, coverage.center.z],
      radius: coverage.radius,
      efficiency: coverage.efficiency,
      color: getIrrigationColor(coverage.efficiency)
    }));
  }, [data?.irrigationCoverage, enabled]);
  
  // Yield prediction visualization
  const yieldPredictions = useMemo(() => {
    if (!data?.yieldPrediction || !enabled) return [];
    
    return data.yieldPrediction.map((prediction, index) => ({
      position: [
        -400 + index * 200,
        20,
        -400
      ],
      cropType: prediction.cropType,
      predictedYield: prediction.predictedYield,
      confidence: prediction.confidence,
      color: getYieldColor(prediction.predictedYield)
    }));
  }, [data?.yieldPrediction, enabled]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Animate crops swaying in the wind
    if (cropsRef.current) {
      cropsRef.current.children.forEach((crop, index) => {
        const sway = Math.sin(state.clock.elapsedTime * 2 + index * 0.1) * 0.05;
        crop.rotation.z = sway;
        crop.position.y = crop.userData.baseY + Math.sin(state.clock.elapsedTime + index) * 0.1;
      });
    }
    
    // Animate sensor status indicators
    if (sensorsRef.current) {
      sensorsRef.current.children.forEach((sensor, index) => {
        const pulse = Math.sin(state.clock.elapsedTime * 3 + index) * 0.3 + 0.7;
        sensor.children[1].material.emissiveIntensity = pulse; // Status light
      });
    }
    
    // Animate irrigation spray effects
    if (irrigationRef.current) {
      irrigationRef.current.children.forEach((irrigation, index) => {
        irrigation.rotation.y += delta * 0.5;
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
        irrigation.scale.setScalar(scale);
      });
    }
  });
  
  if (!enabled || !data) return null;
  
  return (
    <group name="agricultural-visualization" position={[0, 0, 0]}>
      {/* Agricultural Field Terrain */}
      {fieldMesh && (
        <mesh 
          ref={fieldRef} 
          geometry={fieldMesh} 
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <meshLambertMaterial
            vertexColors
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      
      {/* Advanced Crop Fields */}
      {cropFields.length > 0 && (
        <group ref={cropsRef}>
          {cropFields.map((field, index) => (
            <group key={index}>
              {field.type === 'maize' && (
                <MaizeCrop
                  position={field.position}
                  options={{
                    stalkWidth: 0.08,
                    stalkHeight: 2.5 * field.health, // Scale by health
                    joints: qualityLevel > 0.7 ? 8 : 6,
                    growthStage: field.growthStage
                  }}
                  width={field.width}
                  instances={field.instances}
                  fieldSpacing={0.75}
                />
              )}
              
              {field.type === 'wheat' && (
                <WheatCrop
                  position={field.position}
                  options={{
                    stemWidth: 0.02,
                    stemHeight: 1.2 * field.health, // Scale by health
                    joints: qualityLevel > 0.7 ? 6 : 4,
                    tillering: Math.floor(3 * field.health),
                    growthStage: field.growthStage
                  }}
                  width={field.width}
                  instances={field.instances}
                  fieldSpacing={0.15}
                />
              )}
              
              {/* Field health indicator */}
              {qualityLevel > 0.6 && (
                <mesh position={[field.position[0], 8, field.position[2]]}>
                  <ringGeometry args={[field.width * 0.6, field.width * 0.7, 16]} />
                  <meshBasicMaterial 
                    color={getHealthIndicatorColor(field.health)}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}
              
              {/* Field label */}
              {qualityLevel > 0.8 && (
                <Text
                  position={[field.position[0], 12, field.position[2]]}
                  fontSize={3}
                  color={getHealthIndicatorColor(field.health)}
                  anchorX="center"
                  anchorY="middle"
                >
                  {field.type.toUpperCase()} FIELD
                  {'\n'}Health: {Math.round(field.health * 100)}%
                  {'\n'}Growth: {Math.round(field.growthStage * 100)}%
                </Text>
              )}
            </group>
          ))}
        </group>
      )}
      
      {/* Sensor Network */}
      {sensorNetwork.length > 0 && (
        <group ref={sensorsRef}>
          {sensorNetwork.map((sensor, index) => (
            <group key={index} position={sensor.position}>
              {/* Sensor pole */}
              <mesh castShadow>
                <cylinderGeometry args={[0.2, 0.2, 8, 8]} />
                <meshPhongMaterial color="#666666" />
              </mesh>
              
              {/* Sensor housing */}
              <mesh position={[0, 4, 0]} castShadow>
                <boxGeometry args={[1, 1.5, 1]} />
                <meshPhongMaterial color="#333333" />
              </mesh>
              
              {/* Status indicator light */}
              <mesh position={[0, 5, 0.6]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial 
                  color={getSensorStatusColor(sensor.status)}
                  emissive={getSensorStatusColor(sensor.status)}
                  emissiveIntensity={0.8}
                />
              </mesh>
              
              {/* Coverage area (only show for high quality) */}
              {qualityLevel > 0.7 && (
                <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[sensor.range * 0.8, sensor.range, 16]} />
                  <meshBasicMaterial 
                    color={getSensorTypeColor(sensor.type)}
                    transparent
                    opacity={0.2}
                  />
                </mesh>
              )}
              
              {/* Battery level indicator */}
              <mesh position={[0.8, 4.5, 0]}>
                <boxGeometry args={[0.2, sensor.batteryLevel * 1.2, 0.1]} />
                <meshBasicMaterial color={getBatteryColor(sensor.batteryLevel)} />
              </mesh>
            </group>
          ))}
        </group>
      )}
      
      {/* Irrigation Coverage */}
      {irrigationCoverage.length > 0 && (
        <group ref={irrigationRef}>
          {irrigationCoverage.map((irrigation, index) => (
            <group key={index} position={irrigation.center}>
              {/* Irrigation sprinkler */}
              <mesh position={[0, 3, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
                <meshPhongMaterial color="#4CAF50" />
              </mesh>
              
              {/* Water spray visualization */}
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[irrigation.radius * 0.3, irrigation.radius, 24]} />
                <meshBasicMaterial 
                  color={irrigation.color}
                  transparent
                  opacity={0.3}
                />
              </mesh>
              
              {/* Efficiency indicator */}
              <mesh position={[0, 6, 0]}>
                <ringGeometry args={[2, 3, 16]} />
                <meshBasicMaterial 
                  color={getEfficiencyColor(irrigation.efficiency)}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}
      
      {/* Yield Prediction Display */}
      {yieldPredictions.length > 0 && qualityLevel > 0.6 && (
        <group ref={yieldDataRef}>
          {yieldPredictions.map((prediction, index) => (
            <group key={index} position={prediction.position}>
              {/* Yield bar chart */}
              <mesh position={[0, prediction.predictedYield / 2, 0]}>
                <boxGeometry args={[20, prediction.predictedYield * 5, 10]} />
                <meshPhongMaterial 
                  color={prediction.color}
                  transparent
                  opacity={0.8}
                />
              </mesh>
              
              {/* Crop type label */}
              <Text
                position={[0, prediction.predictedYield * 5 + 10, 0]}
                fontSize={8}
                color="#333333"
                anchorX="center"
                anchorY="middle"
              >
                {prediction.cropType.toUpperCase()}
              </Text>
              
              {/* Yield value */}
              <Text
                position={[0, prediction.predictedYield * 5 + 5, 0]}
                fontSize={6}
                color={prediction.color}
                anchorX="center"
                anchorY="middle"
              >
                {prediction.predictedYield.toFixed(1)} t/ha
              </Text>
              
              {/* Confidence indicator */}
              <mesh position={[0, -2, 0]}>
                <ringGeometry args={[8, 10, 16]} />
                <meshBasicMaterial 
                  color={getConfidenceColor(prediction.confidence)}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}
      
      {/* Field boundary markers */}
      <group>
        <mesh position={[500, 2, 500]}>
          <cylinderGeometry args={[1, 1, 4, 8]} />
          <meshPhongMaterial color="#8D6E63" />
        </mesh>
        <mesh position={[-500, 2, 500]}>
          <cylinderGeometry args={[1, 1, 4, 8]} />
          <meshPhongMaterial color="#8D6E63" />
        </mesh>
        <mesh position={[500, 2, -500]}>
          <cylinderGeometry args={[1, 1, 4, 8]} />
          <meshPhongMaterial color="#8D6E63" />
        </mesh>
        <mesh position={[-500, 2, -500]}>
          <cylinderGeometry args={[1, 1, 4, 8]} />
          <meshPhongMaterial color="#8D6E63" />
        </mesh>
      </group>
    </group>
  );
};

// Helper functions
function getSoilHealthColor(health) {
  // Health from 0 (poor) to 1 (excellent)
  if (health < 0.3) return { r: 0.8, g: 0.4, b: 0.2 }; // Poor - reddish brown
  if (health < 0.7) return { r: 0.6, g: 0.5, b: 0.3 }; // Fair - light brown
  return { r: 0.4, g: 0.3, b: 0.2 }; // Good - dark brown
}

function getCropType(index) {
  const types = ['maize', 'wheat', 'sorghum', 'cassava'];
  return types[index % types.length];
}

function getCropHealth(index) {
  return 0.4 + (Math.sin(index * 0.1) * 0.3 + 0.3);
}

function getCropGrowth(index) {
  return 0.3 + (Math.cos(index * 0.15) * 0.35 + 0.35);
}

function getCropColor(type, health) {
  const baseColors = {
    maize: '#8BC34A',
    wheat: '#FFC107',
    sorghum: '#FF9800',
    cassava: '#4CAF50'
  };
  const baseColor = new THREE.Color(baseColors[type] || '#8BC34A');
  return baseColor.multiplyScalar(0.5 + health * 0.5);
}

function getCropLeafColor(type, growth) {
  const intensity = 0.3 + growth * 0.7;
  return new THREE.Color(0.2 * intensity, 0.8 * intensity, 0.1 * intensity);
}

function getCropHealthGlow(health) {
  const intensity = Math.max(0, health - 0.7) * 2;
  return new THREE.Color(0, intensity, 0);
}

function getGrowthStageColor(growth) {
  // Growth stages: red (seedling) -> yellow (growing) -> green (mature)
  if (growth < 0.3) return '#FF5722';
  if (growth < 0.7) return '#FFC107';
  return '#4CAF50';
}

function getSensorType(index) {
  const types = ['soil_moisture', 'weather', 'nutrient', 'ph', 'temperature'];
  return types[index % types.length];
}

function getSensorStatus(index) {
  const statuses = ['active', 'warning', 'error', 'maintenance'];
  return index % 10 === 0 ? 'error' : index % 5 === 0 ? 'warning' : 'active';
}

function getSensorStatusColor(status) {
  const colors = {
    active: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    maintenance: '#2196F3'
  };
  return colors[status] || '#4CAF50';
}

function getSensorTypeColor(type) {
  const colors = {
    soil_moisture: '#2196F3',
    weather: '#9C27B0',
    nutrient: '#FF9800',
    ph: '#E91E63',
    temperature: '#FF5722'
  };
  return colors[type] || '#2196F3';
}

function getBatteryColor(level) {
  if (level > 0.6) return '#4CAF50';
  if (level > 0.3) return '#FFC107';
  return '#F44336';
}

function getIrrigationColor(efficiency) {
  const hue = efficiency * 120; // 0 = red, 120 = green
  return `hsl(${hue}, 70%, 50%)`;
}

function getEfficiencyColor(efficiency) {
  return efficiency > 0.8 ? '#4CAF50' : efficiency > 0.5 ? '#FFC107' : '#F44336';
}

function getYieldColor(yield_value) {
  // Yield from 0 to 15 t/ha
  const normalized = Math.min(yield_value / 15, 1);
  const hue = normalized * 120;
  return `hsl(${hue}, 80%, 50%)`;
}

function getConfidenceColor(confidence) {
  return confidence > 0.8 ? '#4CAF50' : confidence > 0.6 ? '#FFC107' : '#F44336';
}

// Helper functions for crop field calculations
function getCropGrowthAverage(positions) {
  if (!positions || positions.length === 0) return 0.7;
  
  const growthSum = positions.reduce((sum, pos, index) => {
    return sum + getCropGrowth(index);
  }, 0);
  
  return growthSum / positions.length;
}

function getCropHealthAverage(positions) {
  if (!positions || positions.length === 0) return 0.8;
  
  const healthSum = positions.reduce((sum, pos, index) => {
    return sum + getCropHealth(index);
  }, 0);
  
  return healthSum / positions.length;
}

function getHealthIndicatorColor(health) {
  // Health from 0 (poor) to 1 (excellent)
  if (health < 0.4) return '#F44336'; // Poor - red
  if (health < 0.7) return '#FFC107'; // Fair - yellow
  return '#4CAF50'; // Good - green
}

AgriculturalVisualization.propTypes = {
  data: PropTypes.shape({
    fieldMesh: PropTypes.instanceOf(Float32Array),
    cropPositions: PropTypes.array,
    sensorNetwork: PropTypes.array,
    irrigationCoverage: PropTypes.array,
    yieldPrediction: PropTypes.array,
  }),
  qualityLevel: PropTypes.number.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default AgriculturalVisualization; 
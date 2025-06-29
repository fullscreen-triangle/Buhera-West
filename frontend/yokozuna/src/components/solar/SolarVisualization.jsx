import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/**
 * Solar Visualization Component
 * Renders solar surface, corona, magnetic field lines, and solar wind
 */
export const SolarVisualization = ({ data, qualityLevel, enabled }) => {
  const solarSurfaceRef = useRef();
  const coronaRef = useRef();
  const magneticFieldRef = useRef();
  const solarWindRef = useRef();
  const activityRegionsRef = useRef();
  
  // Solar surface geometry from data
  const solarSurface = useMemo(() => {
    if (!data?.solarSurface || !enabled) return null;
    
    const geometry = new THREE.SphereGeometry(50, 64 * qualityLevel, 32 * qualityLevel);
    
    // Apply solar surface data to create realistic surface features
    if (data.solarSurface.length > 0) {
      const positions = geometry.attributes.position.array;
      const colors = new Float32Array(positions.length);
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Get temperature data from surface mesh
        const dataIndex = Math.floor((i / 3) % data.solarSurface.length);
        const temperature = data.solarSurface[dataIndex] || 5778; // Default sun temperature in Kelvin
        
        // Apply slight displacement for surface features
        const displacement = (temperature - 5778) / 1000; // Normalize temperature variations
        const length = Math.sqrt(x * x + y * y + z * z);
        positions[i] = x + (x / length) * displacement;
        positions[i + 1] = y + (y / length) * displacement;
        positions[i + 2] = z + (z / length) * displacement;
        
        // Color based on temperature
        const color = getSolarTemperatureColor(temperature);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }
      
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    
    return geometry;
  }, [data?.solarSurface, qualityLevel, enabled]);
  
  // Corona particle system
  const coronaParticles = useMemo(() => {
    if (!data?.coronaParticles || !enabled) return null;
    
    const particleCount = Math.min(data.coronaParticles.length, Math.floor(5000 * qualityLevel));
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = data.coronaParticles[i];
      const i3 = i * 3;
      
      positions[i3] = particle.x;
      positions[i3 + 1] = particle.y;
      positions[i3 + 2] = particle.z;
      
      // Distance from solar center for corona intensity
      const distance = Math.sqrt(particle.x * particle.x + particle.y * particle.y + particle.z * particle.z);
      const coronaIntensity = Math.max(0, 1 - (distance - 50) / 100);
      
      // Corona color (white to orange based on density)
      colors[i3] = 1.0;
      colors[i3 + 1] = 0.8 + coronaIntensity * 0.2;
      colors[i3 + 2] = 0.6 + coronaIntensity * 0.4;
      
      sizes[i] = (1 + coronaIntensity * 2) * qualityLevel;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    return geometry;
  }, [data?.coronaParticles, qualityLevel, enabled]);
  
  // Magnetic field lines
  const magneticFieldLines = useMemo(() => {
    if (!data?.magneticFieldLines || !enabled || qualityLevel < 0.5) return [];
    
    return data.magneticFieldLines.map((fieldLine, index) => {
      const points = fieldLine.map(point => new THREE.Vector3(point.x, point.y, point.z));
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 32, 0.2, 8, false);
      
      // Color based on magnetic field strength
      const strength = fieldLine.length / 10; // Approximate strength
      const color = getMagneticFieldColor(strength);
      
      return {
        geometry: tubeGeometry,
        color: color,
        opacity: 0.6 * qualityLevel
      };
    });
  }, [data?.magneticFieldLines, qualityLevel, enabled]);
  
  // Solar wind particles
  const solarWindParticles = useMemo(() => {
    if (!data?.solarWindFlow || !enabled) return null;
    
    const windParticleCount = Math.min(data.solarWindFlow.length, Math.floor(2000 * qualityLevel));
    const positions = new Float32Array(windParticleCount * 3);
    const velocities = new Float32Array(windParticleCount * 3);
    const colors = new Float32Array(windParticleCount * 3);
    
    for (let i = 0; i < windParticleCount; i++) {
      const wind = data.solarWindFlow[i];
      const i3 = i * 3;
      
      positions[i3] = wind.x;
      positions[i3 + 1] = wind.y;
      positions[i3 + 2] = wind.z;
      
      // Solar wind velocity (radial outward)
      const length = Math.sqrt(wind.x * wind.x + wind.y * wind.y + wind.z * wind.z);
      velocities[i3] = (wind.x / length) * 5;
      velocities[i3 + 1] = (wind.y / length) * 5;
      velocities[i3 + 2] = (wind.z / length) * 5;
      
      // Solar wind color (blue-white)
      colors[i3] = 0.7;
      colors[i3 + 1] = 0.9;
      colors[i3 + 2] = 1.0;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, [data?.solarWindFlow, qualityLevel, enabled]);
  
  // Solar activity regions based on activity level
  const activityRegions = useMemo(() => {
    if (!data?.activityLevel || !enabled) return [];
    
    const regions = [];
    const regionCount = getActivityRegionCount(data.activityLevel);
    
    for (let i = 0; i < regionCount; i++) {
      regions.push({
        position: [
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          45 + Math.random() * 10
        ],
        intensity: getActivityIntensity(data.activityLevel),
        size: 5 + Math.random() * 10
      });
    }
    
    return regions;
  }, [data?.activityLevel, enabled]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Rotate solar surface
    if (solarSurfaceRef.current) {
      solarSurfaceRef.current.rotation.y += delta * 0.1;
    }
    
    // Animate corona particles
    if (coronaRef.current) {
      const positions = coronaRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        // Subtle corona movement
        positions[i] += Math.sin(state.clock.elapsedTime + i) * 0.01;
        positions[i + 1] += Math.cos(state.clock.elapsedTime + i) * 0.01;
      }
      coronaRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate solar wind particles
    if (solarWindRef.current) {
      const positions = solarWindRef.current.geometry.attributes.position.array;
      const velocities = solarWindRef.current.geometry.attributes.velocity.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Move particles outward
        positions[i] += velocities[i] * delta;
        positions[i + 1] += velocities[i + 1] * delta;
        positions[i + 2] += velocities[i + 2] * delta;
        
        // Reset particles that are too far
        const distance = Math.sqrt(
          positions[i] * positions[i] + 
          positions[i + 1] * positions[i + 1] + 
          positions[i + 2] * positions[i + 2]
        );
        
        if (distance > 500) {
          const angle = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          positions[i] = 55 * Math.sin(phi) * Math.cos(angle);
          positions[i + 1] = 55 * Math.sin(phi) * Math.sin(angle);
          positions[i + 2] = 55 * Math.cos(phi);
        }
      }
      
      solarWindRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate activity regions
    if (activityRegionsRef.current) {
      activityRegionsRef.current.children.forEach((region, index) => {
        const intensity = Math.sin(state.clock.elapsedTime * 2 + index) * 0.3 + 0.7;
        region.material.emissiveIntensity = intensity;
      });
    }
  });
  
  if (!enabled || !data) return null;
  
  return (
    <group name="solar-visualization" position={[2000, 200, 0]}>
      {/* Solar Surface */}
      {solarSurface && (
        <mesh ref={solarSurfaceRef} geometry={solarSurface}>
          <meshBasicMaterial
            vertexColors
            emissive="#FFA500"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
      
      {/* Corona Particles */}
      {coronaParticles && (
        <points ref={coronaRef} geometry={coronaParticles}>
          <pointsMaterial
            size={2}
            vertexColors
            transparent
            opacity={0.7}
            alphaTest={0.1}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      
      {/* Magnetic Field Lines */}
      {magneticFieldLines.length > 0 && (
        <group ref={magneticFieldRef}>
          {magneticFieldLines.map((field, index) => (
            <mesh key={index} geometry={field.geometry}>
              <meshBasicMaterial
                color={field.color}
                transparent
                opacity={field.opacity}
                emissive={field.color}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Solar Wind Particles */}
      {solarWindParticles && (
        <points ref={solarWindRef} geometry={solarWindParticles}>
          <pointsMaterial
            size={1}
            vertexColors
            transparent
            opacity={0.8}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      
      {/* Solar Activity Regions */}
      {activityRegions.length > 0 && (
        <group ref={activityRegionsRef}>
          {activityRegions.map((region, index) => (
            <mesh key={index} position={region.position}>
              <sphereGeometry args={[region.size, 16, 16]} />
              <meshBasicMaterial
                color={getActivityColor(data.activityLevel)}
                transparent
                opacity={0.6}
                emissive={getActivityColor(data.activityLevel)}
                emissiveIntensity={region.intensity}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Solar Activity Level Indicator */}
      <group position={[0, 80, 0]}>
        <mesh>
          <textGeometry args={[`Solar Activity: ${data.activityLevel?.toUpperCase()}`, { size: 8, height: 1 }]} />
          <meshBasicMaterial color={getActivityColor(data.activityLevel)} />
        </mesh>
      </group>
    </group>
  );
};

// Helper functions
function getSolarTemperatureColor(temperature) {
  // Temperature range from 4000K (red) to 7000K (blue-white)
  const normalized = Math.max(0, Math.min(1, (temperature - 4000) / 3000));
  
  if (normalized < 0.5) {
    // Red to yellow
    return { r: 1, g: normalized * 2, b: 0 };
  } else {
    // Yellow to white
    const factor = (normalized - 0.5) * 2;
    return { r: 1, g: 1, b: factor };
  }
}

function getMagneticFieldColor(strength) {
  // Strength-based color from blue (weak) to red (strong)
  const hue = (1 - Math.min(strength, 1)) * 240;
  return `hsl(${hue}, 80%, 60%)`;
}

function getActivityRegionCount(activityLevel) {
  const counts = {
    quiet: 1,
    moderate: 3,
    active: 6,
    severe: 10,
    extreme: 15
  };
  return counts[activityLevel] || 1;
}

function getActivityIntensity(activityLevel) {
  const intensities = {
    quiet: 0.3,
    moderate: 0.5,
    active: 0.7,
    severe: 0.9,
    extreme: 1.2
  };
  return intensities[activityLevel] || 0.3;
}

function getActivityColor(activityLevel) {
  const colors = {
    quiet: '#4CAF50',    // Green
    moderate: '#FFC107', // Yellow
    active: '#FF9800',   // Orange
    severe: '#F44336',   // Red
    extreme: '#9C27B0'   // Purple
  };
  return colors[activityLevel] || '#4CAF50';
}

SolarVisualization.propTypes = {
  data: PropTypes.shape({
    solarSurface: PropTypes.instanceOf(Float32Array),
    coronaParticles: PropTypes.array,
    magneticFieldLines: PropTypes.array,
    solarWindFlow: PropTypes.array,
    activityLevel: PropTypes.oneOf(['quiet', 'moderate', 'active', 'severe', 'extreme']),
  }),
  qualityLevel: PropTypes.number.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default SolarVisualization; 
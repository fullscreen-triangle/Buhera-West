import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Water } from 'three-stdlib';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/**
 * Oceanic Visualization Component
 * Renders ocean surface dynamics, current flows, temperature fields, and waves
 */
export const OceanicVisualization = ({ data, qualityLevel, enabled }) => {
  const { gl } = useThree();
  const oceanRef = useRef();
  const currentFlowRef = useRef();
  const temperatureFieldRef = useRef();
  const waveParticlesRef = useRef();
  
  // Load water normal texture
  const waterNormals = useLoader(THREE.TextureLoader, '/environments/waternormals.jpeg');
  
  useEffect(() => {
    if (waterNormals) {
      waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    }
  }, [waterNormals]);
  
  // Ocean surface geometry and configuration
  const { oceanGeometry, oceanConfig } = useMemo(() => {
    if (!enabled || !data?.surfaceMesh) return { oceanGeometry: null, oceanConfig: null };
    
    const geometry = new THREE.PlaneGeometry(
      5000 * qualityLevel, 
      5000 * qualityLevel, 
      Math.floor(128 * qualityLevel), 
      Math.floor(128 * qualityLevel)
    );
    
    // Apply surface mesh data if available
    if (data.surfaceMesh && data.surfaceMesh.length > 0) {
      const positions = geometry.attributes.position.array;
      const dataLength = Math.min(data.surfaceMesh.length, positions.length);
      
      for (let i = 0; i < dataLength; i += 3) {
        if (data.surfaceMesh[i + 1] !== undefined) {
          positions[i + 1] = data.surfaceMesh[i + 1] * 5; // Scale wave height
        }
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    
    const config = {
      textureWidth: Math.floor(512 * qualityLevel),
      textureHeight: Math.floor(512 * qualityLevel),
      waterNormals,
      sunDirection: new THREE.Vector3(0.5, 0.8, 0.2),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: false,
      format: gl.outputColorSpace
    };
    
    return { oceanGeometry: geometry, oceanConfig: config };
  }, [enabled, data?.surfaceMesh, qualityLevel, waterNormals, gl.outputColorSpace]);
  
  // Ocean current flow visualization
  const currentVectors = useMemo(() => {
    if (!data?.currentVectors || !enabled) return [];
    
    return data.currentVectors.map((vector, index) => {
      const length = Math.sqrt(vector.x * vector.x + vector.z * vector.z);
      const normalizedLength = Math.min(length * 10, 20); // Scale and clamp
      
      return {
        position: [vector.x, 0, vector.z],
        direction: [vector.x, 0, vector.z],
        length: normalizedLength,
        strength: length,
        color: getCurrentColor(length)
      };
    });
  }, [data?.currentVectors, enabled]);
  
  // Temperature field visualization
  const temperatureField = useMemo(() => {
    if (!data?.temperatureField || !enabled) return null;
    
    const geometry = new THREE.PlaneGeometry(4000, 4000, 64, 64);
    const positions = geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);
    
    for (let i = 0; i < positions.length; i += 3) {
      const index = Math.floor(i / 3);
      const temp = data.temperatureField[index] || 15; // Default 15°C
      const color = getTemperatureColor(temp);
      
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, [data?.temperatureField, enabled]);
  
  // Wave particles for enhanced visualization
  const waveParticles = useMemo(() => {
    if (!enabled || !data?.waveData) return [];
    
    const particles = [];
    const particleCount = Math.floor(1000 * qualityLevel);
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        position: [
          (Math.random() - 0.5) * 4000,
          Math.random() * 5,
          (Math.random() - 0.5) * 4000
        ],
        phase: Math.random() * Math.PI * 2,
        amplitude: (data.waveData.amplitude?.[i % data.waveData.amplitude.length] || 1) * 2,
        frequency: data.waveData.frequency?.[i % data.waveData.frequency.length] || 0.5
      });
    }
    
    return particles;
  }, [enabled, data?.waveData, qualityLevel]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Animate ocean water
    if (oceanRef.current?.material?.uniforms?.time) {
      oceanRef.current.material.uniforms.time.value += delta * 0.5;
    }
    
    // Animate wave particles
    if (waveParticlesRef.current) {
      waveParticlesRef.current.children.forEach((particle, index) => {
        const waveData = waveParticles[index];
        if (waveData) {
          particle.position.y = Math.sin(
            state.clock.elapsedTime * waveData.frequency + waveData.phase
          ) * waveData.amplitude;
        }
      });
    }
    
    // Animate current flow arrows
    if (currentFlowRef.current) {
      currentFlowRef.current.children.forEach((arrow, index) => {
        const rotation = Math.sin(state.clock.elapsedTime + index * 0.1) * 0.1;
        arrow.rotation.y += rotation * 0.01;
      });
    }
  });
  
  if (!enabled || !data) return null;
  
  return (
    <group name="oceanic-visualization">
      {/* Ocean Surface with Water Effect */}
      {oceanGeometry && oceanConfig && (
        <water
          ref={oceanRef}
          args={[oceanGeometry, oceanConfig]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
        />
      )}
      
      {/* Temperature Field Overlay */}
      {temperatureField && qualityLevel > 0.3 && (
        <mesh 
          ref={temperatureFieldRef}
          geometry={temperatureField} 
          position={[0, 0.1, 0]} 
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
      
      {/* Ocean Current Flow Vectors */}
      {currentVectors.length > 0 && qualityLevel > 0.5 && (
        <group ref={currentFlowRef}>
          {currentVectors.map((current, index) => (
            <group key={index} position={current.position}>
              {/* Current arrow shaft */}
              <mesh position={[0, 1, current.length / 2]}>
                <cylinderGeometry args={[0.2, 0.2, current.length, 8]} />
                <meshPhongMaterial color={current.color} transparent opacity={0.7} />
              </mesh>
              {/* Current arrow head */}
              <mesh position={[0, 1, current.length]}>
                <coneGeometry args={[0.5, 2, 8]} />
                <meshPhongMaterial color={current.color} transparent opacity={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      )}
      
      {/* Wave Particles */}
      {waveParticles.length > 0 && qualityLevel > 0.4 && (
        <group ref={waveParticlesRef}>
          {waveParticles.map((particle, index) => (
            <mesh key={index} position={particle.position}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.6}
                emissive="#87CEEB"
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Benguela Current System Indicator */}
      <group position={[-1000, 5, 0]}>
        <mesh>
          <torusGeometry args={[100, 10, 8, 16]} />
          <meshPhongMaterial color="#00BCD4" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 20, 0]}>
          <textGeometry args={['Benguela Current', { size: 20, height: 2 }]} />
          <meshBasicMaterial color="#00BCD4" />
        </mesh>
      </group>
      
      {/* Agulhas Current System Indicator */}
      <group position={[1500, 5, -500]}>
        <mesh>
          <torusGeometry args={[150, 15, 8, 16]} />
          <meshPhongMaterial color="#FF5722" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 30, 0]}>
          <textGeometry args={['Agulhas Current', { size: 25, height: 3 }]} />
          <meshBasicMaterial color="#FF5722" />
        </mesh>
      </group>
    </group>
  );
};

// Helper function to get current color based on strength
function getCurrentColor(strength) {
  // Color from blue (weak) to red (strong)
  const normalizedStrength = Math.min(strength * 10, 1);
  const hue = (1 - normalizedStrength) * 240; // 240 = blue, 0 = red
  return `hsl(${hue}, 70%, 50%)`;
}

// Helper function to get temperature color
function getTemperatureColor(temp) {
  // Temperature range: 0°C (blue) to 30°C (red)
  const normalized = Math.max(0, Math.min(1, temp / 30));
  
  if (normalized < 0.5) {
    // Blue to cyan to green
    const factor = normalized * 2;
    return {
      r: 0,
      g: factor,
      b: 1 - factor * 0.5
    };
  } else {
    // Green to yellow to red
    const factor = (normalized - 0.5) * 2;
    return {
      r: factor,
      g: 1 - factor * 0.5,
      b: 0
    };
  }
}

OceanicVisualization.propTypes = {
  data: PropTypes.shape({
    surfaceMesh: PropTypes.instanceOf(Float32Array),
    currentVectors: PropTypes.array,
    temperatureField: PropTypes.instanceOf(Float32Array),
    waveData: PropTypes.shape({
      amplitude: PropTypes.array,
      frequency: PropTypes.array,
      phase: PropTypes.array,
    }),
  }),
  qualityLevel: PropTypes.number.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default OceanicVisualization; 
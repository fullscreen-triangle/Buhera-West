import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Points, Instances, useTexture } from '@react-three/drei';

/**
 * Wind Component for atmospheric wind visualization
 * Creates dynamic wind particle streams and atmospheric effects
 */
const Wind = ({ 
  intensity = 0.5, 
  direction = [1, 0, 0], 
  speed = 1.0,
  temperature = 20,
  particleCount = 1000,
  showStreamlines = true,
  showTurbulence = true,
  enabled = true 
}) => {
  const windParticlesRef = useRef();
  const streamlinesRef = useRef();
  const turbulenceRef = useRef();
  const windSoundRef = useRef();

  // Normalize wind direction
  const windDirection = useMemo(() => {
    const dir = new THREE.Vector3(...direction).normalize();
    return [dir.x, dir.y, dir.z];
  }, [direction]);

  // Create wind particles with realistic distribution
  const windParticles = useMemo(() => {
    if (!enabled) return null;

    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const life = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random starting positions in a large volume
      positions[i3] = (Math.random() - 0.5) * 400;
      positions[i3 + 1] = Math.random() * 200 + 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 400;

      // Base velocity from wind direction
      velocities[i3] = windDirection[0] * speed * (0.8 + Math.random() * 0.4);
      velocities[i3 + 1] = windDirection[1] * speed * (0.8 + Math.random() * 0.4);
      velocities[i3 + 2] = windDirection[2] * speed * (0.8 + Math.random() * 0.4);

      // Random life and size
      life[i] = Math.random();
      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    return { positions, velocities, life, sizes };
  }, [particleCount, windDirection, speed, enabled]);

  // Create wind streamlines for visualization
  const streamlines = useMemo(() => {
    if (!showStreamlines || !enabled) return [];

    const lines = [];
    const streamlineCount = Math.floor(50 * intensity);

    for (let i = 0; i < streamlineCount; i++) {
      const points = [];
      const startX = (Math.random() - 0.5) * 300;
      const startY = 20 + Math.random() * 100;
      const startZ = (Math.random() - 0.5) * 300;

      // Generate streamline points
      let currentPos = new THREE.Vector3(startX, startY, startZ);
      
      for (let j = 0; j < 20; j++) {
        points.push(currentPos.clone());
        
        // Calculate wind field at current position (simplified)
        const windField = new THREE.Vector3(
          windDirection[0] + Math.sin(currentPos.y * 0.01) * 0.2,
          windDirection[1] + Math.cos(currentPos.x * 0.01) * 0.1,
          windDirection[2] + Math.sin(currentPos.z * 0.01) * 0.2
        );

        currentPos.add(windField.multiplyScalar(5));
      }

      lines.push(points);
    }

    return lines;
  }, [showStreamlines, intensity, windDirection, enabled]);

  // Create turbulence effects
  const turbulenceGeometry = useMemo(() => {
    if (!showTurbulence || !enabled) return null;

    const geometry = new THREE.PlaneGeometry(500, 500, 64, 64);
    const positions = geometry.attributes.position.array;
    
    // Create turbulent displacement
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Multi-scale noise for turbulence
      const turbulence = 
        Math.sin(x * 0.01) * Math.cos(z * 0.008) * 10 +
        Math.sin(x * 0.03) * Math.cos(z * 0.025) * 5 +
        Math.sin(x * 0.08) * Math.cos(z * 0.06) * 2;
      
      positions[i + 1] = turbulence * intensity;
    }

    geometry.computeVertexNormals();
    return geometry;
  }, [showTurbulence, intensity, enabled]);

  // Animation loop
  useFrame((state, delta) => {
    if (!enabled || !windParticlesRef.current) return;

    const positions = windParticlesRef.current.geometry.attributes.position.array;
    const time = state.clock.getElapsedTime();

    // Update wind particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Update position based on wind field
      const windInfluence = intensity * speed * delta;
      
      // Add turbulence based on position and time
      const turbulenceX = Math.sin(positions[i3 + 1] * 0.01 + time * 0.5) * 0.5;
      const turbulenceY = Math.cos(positions[i3] * 0.008 + time * 0.3) * 0.2;
      const turbulenceZ = Math.sin(positions[i3 + 2] * 0.012 + time * 0.4) * 0.5;

      positions[i3] += (windDirection[0] + turbulenceX) * windInfluence * 10;
      positions[i3 + 1] += (windDirection[1] + turbulenceY) * windInfluence * 5;
      positions[i3 + 2] += (windDirection[2] + turbulenceZ) * windInfluence * 10;

      // Reset particles that have moved too far
      if (positions[i3] > 200) positions[i3] = -200;
      if (positions[i3] < -200) positions[i3] = 200;
      if (positions[i3 + 2] > 200) positions[i3 + 2] = -200;
      if (positions[i3 + 2] < -200) positions[i3 + 2] = 200;
      if (positions[i3 + 1] > 150) positions[i3 + 1] = 10;
      if (positions[i3 + 1] < 0) positions[i3 + 1] = 150;
    }

    windParticlesRef.current.geometry.attributes.position.needsUpdate = true;

    // Animate streamlines
    if (streamlinesRef.current) {
      streamlinesRef.current.children.forEach((line, index) => {
        line.material.opacity = 0.3 + Math.sin(time + index * 0.5) * 0.2;
      });
    }

    // Animate turbulence
    if (turbulenceRef.current && turbulenceGeometry) {
      turbulenceRef.current.rotation.y += delta * 0.1 * intensity;
      turbulenceRef.current.material.opacity = 0.1 + intensity * 0.2;
    }
  });

  // Wind audio effect
  useEffect(() => {
    if (!enabled) return;

    // Create wind sound (simplified - in real app you'd use Web Audio API)
    const windVolume = Math.min(intensity * speed * 0.3, 1.0);
    console.log(`Wind sound intensity: ${windVolume}`);
    
    // You could integrate with your audio system here
    return () => {
      // Cleanup wind sound
    };
  }, [intensity, speed, enabled]);

  if (!enabled) return null;

  return (
    <group name="wind-effects">
      {/* Wind Particles */}
      {windParticles && (
        <points ref={windParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={windParticles.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.8}
            sizeAttenuation={true}
            transparent={true}
            opacity={0.6 * intensity}
            color={temperature > 25 ? '#FFE5B4' : temperature < 0 ? '#B0E0E6' : '#FFFFFF'}
            vertexColors={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* Wind Streamlines */}
      {streamlines.length > 0 && (
        <group ref={streamlinesRef}>
          {streamlines.map((line, index) => (
            <line key={index}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={line.length}
                  array={new Float32Array(line.flatMap(p => [p.x, p.y, p.z]))}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={`hsl(${180 + speed * 30}, 70%, 50%)`}
                transparent={true}
                opacity={0.4}
                linewidth={2}
              />
            </line>
          ))}
        </group>
      )}

      {/* Turbulence Field */}
      {turbulenceGeometry && showTurbulence && (
        <mesh 
          ref={turbulenceRef}
          geometry={turbulenceGeometry}
          position={[0, 50, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color="#87CEEB"
            transparent={true}
            opacity={0.15}
            wireframe={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Wind Direction Indicator */}
      <group position={[0, 100, 0]}>
        <mesh position={[windDirection[0] * 20, windDirection[1] * 10, windDirection[2] * 20]}>
          <coneGeometry args={[2, 8, 8]} />
          <meshBasicMaterial
            color="#FF6B6B"
            transparent={true}
            opacity={0.8}
          />
        </mesh>
        
        {/* Wind velocity vector */}
        <mesh 
          position={[windDirection[0] * 10, windDirection[1] * 5, windDirection[2] * 10]}
          rotation={[
            Math.atan2(windDirection[1], Math.sqrt(windDirection[0]**2 + windDirection[2]**2)),
            Math.atan2(windDirection[0], windDirection[2]),
            0
          ]}
        >
          <cylinderGeometry args={[0.5, 0.5, speed * 5, 8]} />
          <meshBasicMaterial
            color="#4ECDC4"
            transparent={true}
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Atmospheric Pressure Visualization */}
      <group position={[0, 80, 0]}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, i * 15, 0]}>
            <torusGeometry args={[30 + i * 10, 1, 8, 32]} />
            <meshBasicMaterial
              color={`hsl(${220 - i * 20}, 60%, 60%)`}
              transparent={true}
              opacity={0.2 - i * 0.03}
              wireframe={true}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default Wind;

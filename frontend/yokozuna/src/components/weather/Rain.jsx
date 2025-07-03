import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

/**
 * Rain Component for immersive rainfall visualization
 * Creates realistic rain effects with splashes, ripples, and atmospheric fog
 */
const Rain = ({ 
  intensity = 0.5, 
  wind = true,
  windDirection = [0.2, -1, 0],
  windSpeed = 0.4,
  dropSize = 0.6,
  splashEffects = true,
  fogEffect = true,
  lightningFlashes = false,
  temperature = 15,
  enabled = true 
}) => {
  const rainRef = useRef();
  const splashesRef = useRef();
  const fogRef = useRef();
  const lightningRef = useRef();

  // Calculate rain particle count based on intensity
  const particleCount = Math.floor(2000 * intensity);

  // Create rain particles
  const rainParticles = useMemo(() => {
    if (!enabled) return null;

    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const life = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random starting positions across a wide area
      positions[i3] = (Math.random() - 0.5) * 300;
      positions[i3 + 1] = Math.random() * 200 + 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 300;

      // Rain velocity with wind influence
      const baseVelocity = 15 + Math.random() * 10;
      velocities[i3] = wind ? windDirection[0] * windSpeed * 5 : 0;
      velocities[i3 + 1] = -baseVelocity;
      velocities[i3 + 2] = wind ? windDirection[2] * windSpeed * 5 : 0;

      life[i] = Math.random();
    }

    return { positions, velocities, life };
  }, [particleCount, wind, windDirection, windSpeed, enabled]);

  // Create fog effect for heavy rain
  const fogGeometry = useMemo(() => {
    if (!fogEffect || intensity < 0.3 || !enabled) return null;

    const geometry = new THREE.SphereGeometry(150, 32, 32);
    const positions = geometry.attributes.position.array;
    
    // Create volumetric fog with noise
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
      // Fog density variation
      const noise = Math.sin(x * 0.02) * Math.cos(y * 0.015) * Math.sin(z * 0.018);
      const distance = Math.sqrt(x*x + y*y + z*z);
      const fogIntensity = Math.max(0, 150 - distance) / 150;
      
      positions[i] *= 1 + noise * 0.1 * fogIntensity;
      positions[i + 1] *= 1 + noise * 0.1 * fogIntensity;
      positions[i + 2] *= 1 + noise * 0.1 * fogIntensity;
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, [fogEffect, intensity, enabled]);

  // Create splash particles
  const splashCount = Math.floor(50 * intensity);
  const splashParticles = useMemo(() => {
    if (!splashEffects || !enabled) return null;

    const positions = new Float32Array(splashCount * 3);
    const velocities = new Float32Array(splashCount * 3);
    const life = new Float32Array(splashCount);

    for (let i = 0; i < splashCount; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = 0.1;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;

      // Splash velocity (upward and outward)
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = 3 + Math.random() * 2;
      velocities[i3 + 2] = Math.sin(angle) * speed;

      life[i] = Math.random();
    }

    return { positions, velocities, life };
  }, [splashCount, splashEffects, enabled]);

  // Lightning flash geometry
  const lightningGeometry = useMemo(() => {
    if (!lightningFlashes || !enabled) return null;

    const points = [];
    const startPoint = new THREE.Vector3(
      (Math.random() - 0.5) * 100,
      150 + Math.random() * 50,
      (Math.random() - 0.5) * 100
    );

    let currentPoint = startPoint.clone();
    
    // Generate jagged lightning path
    for (let i = 0; i < 20; i++) {
      points.push(currentPoint.clone());
      
      currentPoint.add(new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        -8 - Math.random() * 5,
        (Math.random() - 0.5) * 10
      ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [lightningFlashes, enabled]);

  // Animation loop
  useFrame((state, delta) => {
    if (!enabled) return;

    const time = state.clock.getElapsedTime();

    // Animate rain particles
    if (rainRef.current && rainParticles) {
      const positions = rainRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Update rain position
        positions[i3] += rainParticles.velocities[i3] * delta;
        positions[i3 + 1] += rainParticles.velocities[i3 + 1] * delta;
        positions[i3 + 2] += rainParticles.velocities[i3 + 2] * delta;

        // Reset particles that hit the ground or moved too far
        if (positions[i3 + 1] < 0 || Math.abs(positions[i3]) > 200 || Math.abs(positions[i3 + 2]) > 200) {
          positions[i3] = (Math.random() - 0.5) * 300;
          positions[i3 + 1] = 100 + Math.random() * 100;
          positions[i3 + 2] = (Math.random() - 0.5) * 300;
        }
      }
      
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate splash particles
    if (splashesRef.current && splashParticles) {
      const positions = splashesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < splashCount; i++) {
        const i3 = i * 3;
        
        // Update splash position with gravity
        positions[i3] += splashParticles.velocities[i3] * delta;
        positions[i3 + 1] += splashParticles.velocities[i3 + 1] * delta;
        positions[i3 + 2] += splashParticles.velocities[i3 + 2] * delta;

        // Apply gravity to splash
        splashParticles.velocities[i3 + 1] -= 9.8 * delta;

        // Reset splash particles
        if (positions[i3 + 1] < 0) {
          positions[i3] = (Math.random() - 0.5) * 200;
          positions[i3 + 1] = 0.1;
          positions[i3 + 2] = (Math.random() - 0.5) * 200;
          
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 3;
          splashParticles.velocities[i3] = Math.cos(angle) * speed;
          splashParticles.velocities[i3 + 1] = 3 + Math.random() * 2;
          splashParticles.velocities[i3 + 2] = Math.sin(angle) * speed;
        }
      }
      
      splashesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate fog
    if (fogRef.current) {
      fogRef.current.rotation.y += delta * 0.05;
      fogRef.current.material.opacity = 0.1 + Math.sin(time * 0.5) * 0.05;
    }

    // Lightning flash effect
    if (lightningRef.current && lightningFlashes) {
      const shouldFlash = Math.random() < 0.001 * intensity; // Rare flashes
      if (shouldFlash) {
        lightningRef.current.material.opacity = 1.0;
        lightningRef.current.visible = true;
        
        // Flash fade out
        setTimeout(() => {
          if (lightningRef.current) {
            lightningRef.current.visible = false;
          }
        }, 100 + Math.random() * 200);
      }
    }
  });

  // Rain sound effect
  useEffect(() => {
    if (!enabled) return;

    const rainVolume = Math.min(intensity * 0.8, 1.0);
    console.log(`Rain sound intensity: ${rainVolume}`);
    
    // You could integrate with your audio system here
    return () => {
      // Cleanup rain sound
    };
  }, [intensity, enabled]);

  if (!enabled) return null;

  return (
    <group name="rain-effects">
      {/* Main Rain Particles */}
      {rainParticles && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={rainParticles.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={dropSize}
            sizeAttenuation={true}
            transparent={true}
            opacity={0.7}
            color={temperature < 0 ? '#E6F3FF' : '#B0E0E6'}
            vertexColors={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* Splash Effects */}
      {splashParticles && splashEffects && (
        <points ref={splashesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={splashCount}
              array={splashParticles.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.5}
            sizeAttenuation={true}
            transparent={true}
            opacity={0.5}
            color="#87CEEB"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* Fog Effect */}
      {fogGeometry && fogEffect && (
        <mesh ref={fogRef} geometry={fogGeometry}>
          <meshBasicMaterial
            color="#708090"
            transparent={true}
            opacity={intensity * 0.15}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Lightning */}
      {lightningGeometry && lightningFlashes && (
        <line ref={lightningRef} geometry={lightningGeometry}>
          <lineBasicMaterial
            color="#FFFFFF"
            transparent={true}
            opacity={0}
            linewidth={3}
            emissive="#FFFFFF"
            emissiveIntensity={2}
          />
        </line>
      )}

      {/* Rain Droplet Streaks */}
      <group>
        {[...Array(Math.floor(20 * intensity))].map((_, i) => (
          <mesh 
            key={i}
            position={[
              (Math.random() - 0.5) * 200,
              50 + Math.random() * 100,
              (Math.random() - 0.5) * 200
            ]}
            rotation={[
              Math.PI / 6,
              Math.random() * Math.PI * 2,
              wind ? Math.atan2(windDirection[2], windDirection[0]) : 0
            ]}
          >
            <cylinderGeometry args={[0.05, 0.05, 3 + Math.random() * 2, 4]} />
            <meshBasicMaterial
              color="#B0E0E6"
              transparent={true}
              opacity={0.4}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default Rain;

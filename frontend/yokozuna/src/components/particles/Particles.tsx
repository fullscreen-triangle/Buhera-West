import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ParticlesProps {
  count?: number;
  size?: number;
  color?: string;
  maxDistance?: number;
  speed?: number;
  opacity?: number;
  blending?: THREE.Blending;
  type?: 'dust' | 'snow' | 'fireflies' | 'rain' | 'stars' | 'custom';
  texture?: string;
  emitterShape?: 'box' | 'sphere' | 'disk';
  emitterSize?: number | [number, number, number];
}

/**
 * Particles component for various particle effects
 * 
 * @example
 * ```jsx
 * <Particles 
 *   count={1000} 
 *   type="fireflies" 
 *   color="#ffaa00" 
 *   speed={1.5} 
 * />
 * ```
 */
const Particles: React.FC<ParticlesProps> = ({
  count = 1000,
  size = 0.1,
  color = '#ffffff',
  maxDistance = 50,
  speed = 1,
  opacity = 0.7,
  blending = THREE.AdditiveBlending,
  type = 'dust',
  texture,
  emitterShape = 'box',
  emitterSize = 50,
}) => {
  // References
  const points = useRef<THREE.Points>(null);
  const particlesGeometry = useRef<THREE.BufferGeometry>(null);
  
  // Calculate initial particle positions based on emitter
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Generate positions based on emitter shape
      if (emitterShape === 'sphere') {
        const radius = Array.isArray(emitterSize) ? emitterSize[0] : emitterSize;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
        pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        pos[i3 + 2] = radius * Math.cos(phi);
      } else if (emitterShape === 'disk') {
        const radius = Array.isArray(emitterSize) ? emitterSize[0] : emitterSize;
        const r = Math.sqrt(Math.random()) * radius;
        const theta = Math.random() * Math.PI * 2;
        
        pos[i3] = r * Math.cos(theta);
        pos[i3 + 1] = 0;
        pos[i3 + 2] = r * Math.sin(theta);
      } else {
        // Default box shape
        const boxSize = Array.isArray(emitterSize) 
          ? emitterSize 
          : [emitterSize, emitterSize, emitterSize];
          
        pos[i3] = (Math.random() - 0.5) * boxSize[0];
        pos[i3 + 1] = (Math.random() - 0.5) * boxSize[1];
        pos[i3 + 2] = (Math.random() - 0.5) * boxSize[2];
      }
    }
    
    return pos;
  }, [count, emitterShape, emitterSize]);
  
  // Calculate particle velocities based on type
  const velocities = useMemo(() => {
    const vels = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      switch (type) {
        case 'snow':
          vels[i3] = (Math.random() - 0.5) * 0.1 * speed;
          vels[i3 + 1] = -Math.random() * 0.5 * speed;
          vels[i3 + 2] = (Math.random() - 0.5) * 0.1 * speed;
          break;
        case 'rain':
          vels[i3] = (Math.random() - 0.5) * 0.03 * speed;
          vels[i3 + 1] = -Math.random() * 3 * speed;
          vels[i3 + 2] = (Math.random() - 0.5) * 0.03 * speed;
          break;
        case 'fireflies':
          vels[i3] = (Math.random() - 0.5) * 0.3 * speed;
          vels[i3 + 1] = (Math.random() - 0.5) * 0.3 * speed;
          vels[i3 + 2] = (Math.random() - 0.5) * 0.3 * speed;
          break;
        case 'stars':
          vels[i3] = 0;
          vels[i3 + 1] = 0;
          vels[i3 + 2] = 0;
          break;
        case 'dust':
        default:
          vels[i3] = (Math.random() - 0.5) * 0.1 * speed;
          vels[i3 + 1] = (Math.random() - 0.5) * 0.1 * speed;
          vels[i3 + 2] = (Math.random() - 0.5) * 0.1 * speed;
      }
    }
    
    return vels;
  }, [count, type, speed]);
  
  // Update particles on each frame
  useFrame((_, delta) => {
    if (!points.current || !particlesGeometry.current) return;
    
    const positions = particlesGeometry.current.attributes.position.array as Float32Array;
    
    // Update each particle position
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;
      
      // Boundary check - reset particles that move too far
      const dist = Math.sqrt(
        positions[i3] ** 2 + 
        positions[i3 + 1] ** 2 + 
        positions[i3 + 2] ** 2
      );
      
      if (dist > maxDistance) {
        // Reset based on type
        if (type === 'rain' || type === 'snow') {
          // For directional particles, reset to top
          positions[i3] = (Math.random() - 0.5) * maxDistance * 0.5;
          positions[i3 + 1] = maxDistance / 2;
          positions[i3 + 2] = (Math.random() - 0.5) * maxDistance * 0.5;
        } else {
          // For ambient particles, reset randomly
          if (emitterShape === 'sphere') {
            const radius = Array.isArray(emitterSize) ? emitterSize[0] : emitterSize;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
          } else {
            const boxSize = Array.isArray(emitterSize) 
              ? emitterSize 
              : [emitterSize, emitterSize, emitterSize];
              
            positions[i3] = (Math.random() - 0.5) * boxSize[0];
            positions[i3 + 1] = (Math.random() - 0.5) * boxSize[1];
            positions[i3 + 2] = (Math.random() - 0.5) * boxSize[2];
          }
        }
      }
    }
    
    particlesGeometry.current.attributes.position.needsUpdate = true;
  });
  
  // Material based on type
  const material = useMemo(() => {
    const particleTexture = texture 
      ? new THREE.TextureLoader().load(texture) 
      : null;
    
    let particleSize = size;
    let particleColor = new THREE.Color(color);
    
    // Adjust properties based on type
    switch (type) {
      case 'fireflies':
        particleSize = size * 2;
        break;
      case 'rain':
        particleSize = size * 0.5;
        break;
      case 'stars':
        particleSize = size * 0.8;
        break;
      default:
        break;
    }
    
    return new THREE.PointsMaterial({
      size: particleSize,
      color: particleColor,
      transparent: true,
      opacity: opacity,
      map: particleTexture,
      blending: blending,
      depthWrite: false,
      vertexColors: false,
      sizeAttenuation: true,
    });
  }, [size, color, opacity, blending, texture, type]);
  
  return (
    <points ref={points}>
      <bufferGeometry ref={particlesGeometry}>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={material} />
    </points>
  );
};

export default Particles; 
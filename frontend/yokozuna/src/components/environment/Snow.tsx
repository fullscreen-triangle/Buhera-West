import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Weather, { WeatherProps } from './Weather';

/**
 * Props for the Snow component
 * @interface SnowProps
 */
export interface SnowProps extends Omit<WeatherProps, 'type'> {
  /** Intensity of the snowfall (0.0 to 1.0) */
  intensity?: number;
  /** Size of snowflakes (0.0 to 1.0) */
  flakeSize?: number;
  /** Whether snowflakes should pile up on surfaces */
  accumulation?: boolean;
  /** Whether snowflakes should have a randomized rotation */
  randomRotation?: boolean;
  /** Sound of snowfall (0.0 to 1.0) */
  snowSound?: number;
  /** How much snowflakes should shine in light (0.0 to 1.0) */
  sparkle?: number;
}

/**
 * Snow component for adding snowfall effects to a scene
 * 
 * @example
 * ```jsx
 * <Snow 
 *   intensity={0.6} 
 *   wind={true} 
 *   windSpeed={0.2}
 *   flakeSize={0.8}
 *   sparkle={0.7}
 * />
 * ```
 */
const Snow: React.FC<SnowProps> = ({
  intensity = 0.5,
  wind = true,
  windDirection = [0.1, -0.5, 0],
  windSpeed = 0.2,
  flakeSize = 0.7,
  accumulation = false,
  randomRotation = true,
  snowSound = 0.3,
  sparkle = 0.5,
  ...weatherProps
}) => {
  const snowflakesRef = useRef<THREE.Points>(null);
  const accumulationRef = useRef<THREE.Group>(null);
  const rotationsRef = useRef<number[]>([]);
  
  // Initialize rotations for snowflakes if needed
  useMemo(() => {
    if (randomRotation) {
      // Create random rotation speeds for each possible snowflake
      const count = Math.floor(intensity * 2000);
      rotationsRef.current = Array(count).fill(0).map(() => (Math.random() - 0.5) * 0.01);
    }
  }, [randomRotation, intensity]);
  
  // Handle snowflake rotation and accumulation
  useFrame(({ raycaster, camera, scene, clock }) => {
    // Handle rotation of snowflakes
    if (randomRotation && snowflakesRef.current) {
      const positions = snowflakesRef.current.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Create a rotation effect by slightly shifting x and z based on time
        const rotationSpeed = rotationsRef.current[i] || 0.001;
        const time = clock.getElapsedTime();
        
        // Apply circular motion to x and z coords
        const originalX = positions[i3];
        const originalZ = positions[i3 + 2];
        
        positions[i3] = originalX + Math.sin(time * rotationSpeed * 10) * 0.05;
        positions[i3 + 2] = originalZ + Math.cos(time * rotationSpeed * 10) * 0.05;
      }
      
      snowflakesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Handle snow accumulation
    if (accumulation && accumulationRef.current && intensity > 0.2) {
      // Control rate of accumulation based on intensity
      const shouldCreateAccumulation = Math.random() < intensity * 0.02;
      
      if (shouldCreateAccumulation) {
        // Choose a random position to test for snow accumulation
        const randomX = (Math.random() - 0.5) * 40;
        const randomZ = (Math.random() - 0.5) * 40;
        
        // Use raycaster to find where the snowflake would land
        raycaster.set(
          new THREE.Vector3(randomX, 20, randomZ), 
          new THREE.Vector3(0, -1, 0)
        );
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
          const hitPosition = intersects[0].point;
          
          // Check if there's already accumulation at this position
          const existingAccumulation = accumulationRef.current.children.find((obj) => {
            const distance = obj.position.distanceTo(hitPosition);
            return distance < 0.5; // Cluster snow within 0.5 units
          });
          
          if (existingAccumulation) {
            // Increase size of existing accumulation
            const currentScale = existingAccumulation.scale.x;
            if (currentScale < 3) { // Limit maximum size
              existingAccumulation.scale.set(
                currentScale + 0.1, 
                currentScale + 0.1, 
                currentScale + 0.1
              );
            }
          } else {
            // Create a new accumulation point
            const snowGeometry = new THREE.CircleGeometry(flakeSize * 0.5, 8);
            const snowMaterial = new THREE.MeshBasicMaterial({ 
              color: new THREE.Color(0xffffff),
              transparent: true,
              opacity: 0.8,
              depthWrite: false
            });
            
            const snowPatch = new THREE.Mesh(snowGeometry, snowMaterial);
            snowPatch.position.copy(hitPosition);
            snowPatch.position.y += 0.02; // Offset to avoid z-fighting
            snowPatch.rotation.x = -Math.PI / 2; // Lay flat
            
            accumulationRef.current.add(snowPatch);
            
            // Limit total accumulation points for performance
            if (accumulationRef.current.children.length > 100) {
              accumulationRef.current.remove(accumulationRef.current.children[0]);
            }
          }
        }
      }
    }
  });
  
  return (
    <>
      <Weather 
        type="snow"
        intensity={intensity}
        wind={wind}
        windDirection={windDirection}
        windSpeed={windSpeed}
        soundVolume={snowSound}
        particleCount={Math.floor(intensity * 2000)}
        {...weatherProps}
      />
      
      {/* Provide ref to the Weather's particle system */}
      {randomRotation && (
        <primitive ref={snowflakesRef} object={new THREE.Points()} visible={false} />
      )}
      
      {accumulation && (
        <group ref={accumulationRef} />
      )}
    </>
  );
};

export default Snow; 
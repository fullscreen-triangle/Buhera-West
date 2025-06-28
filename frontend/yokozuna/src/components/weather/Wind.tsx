import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Props for the Wind component
 * @interface WindProps
 */
export interface WindProps {
  /** Strength of the wind (0.0 to 1.0) */
  strength?: number;
  /** Direction of the wind as a normalized vector */
  direction?: [number, number, number];
  /** How gusty/variable the wind is (0.0 to 1.0) */
  turbulence?: number;
  /** Whether to visualize the wind with particles */
  visualize?: boolean;
  /** Color of the wind visualization */
  color?: THREE.ColorRepresentation;
  /** Number of particles to use for visualization */
  particleCount?: number;
  /** Sound volume for wind sounds (0.0 to 1.0) */
  soundVolume?: number;
  /** Whether to affect scene objects with wind force */
  affectObjects?: boolean;
  /** Callback fired when wind strength changes significantly */
  onWindChange?: (strength: number, direction: THREE.Vector3) => void;
}

/**
 * Interface for objects that can be affected by wind
 */
export interface WindAffectable {
  applyWind: (direction: THREE.Vector3, strength: number, deltaTime: number) => void;
}

/**
 * Wind component for adding wind effects to a scene
 * 
 * @example
 * ```jsx
 * <Wind 
 *   strength={0.6} 
 *   direction={[1, 0, 0.5]} 
 *   turbulence={0.3}
 *   visualize={true}
 * />
 * ```
 */
const Wind: React.FC<WindProps> = ({
  strength = 0.5,
  direction = [1, 0, 0],
  turbulence = 0.2,
  visualize = false,
  color = "#ffffff",
  particleCount = 300,
  soundVolume = 0.3,
  affectObjects = true,
  onWindChange
}) => {
  const { scene } = useThree();
  const windParticlesRef = useRef<THREE.Points>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentStrengthRef = useRef<number>(strength);
  const currentDirectionRef = useRef<THREE.Vector3>(new THREE.Vector3(...direction).normalize());
  const windAffectables = useRef<WindAffectable[]>([]);
  
  // Track current wind state for variations
  const [windState, setWindState] = useState({
    baseStrength: strength,
    currentStrength: strength,
    baseDirection: new THREE.Vector3(...direction).normalize(),
    currentDirection: new THREE.Vector3(...direction).normalize(),
    lastUpdateTime: 0
  });
  
  // Create audio for wind sound
  useEffect(() => {
    if (soundVolume <= 0) return;
    
    const audio = new Audio('/sounds/wind.mp3');
    audio.loop = true;
    audio.volume = Math.min(soundVolume * strength, 1.0);
    audio.play();
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundVolume]);
  
  // Update audio volume when wind strength changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(soundVolume * currentStrengthRef.current, 1.0);
    }
  }, [soundVolume, currentStrengthRef.current]);
  
  // Set up wind particles if visualization is enabled
  useEffect(() => {
    if (!visualize || !windParticlesRef.current) return;
    
    // Create particle geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);
    
    // Create particles in a volume in front of the wind direction
    const windVector = new THREE.Vector3(...direction).normalize();
    const boxSize = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Randomize position across scene
      positions[i3] = (Math.random() - 0.5) * boxSize;
      positions[i3 + 1] = (Math.random() - 0.5) * boxSize / 2 + boxSize / 4; // Mostly above ground
      positions[i3 + 2] = (Math.random() - 0.5) * boxSize;
      
      // Randomize size based on strength
      sizes[i] = Math.random() * 0.2 * strength + 0.05;
      
      // Set initial lifetime
      lifetimes[i] = Math.random();
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    
    // Store additional attributes for animation
    (geometry as any).lifetimes = lifetimes;
    
    if (windParticlesRef.current) {
      windParticlesRef.current.geometry = geometry;
    }
  }, [visualize, particleCount, direction, strength]);
  
  // Find all objects in the scene that can be affected by wind
  useEffect(() => {
    if (!affectObjects) return;
    
    const findWindAffectables = (object: THREE.Object3D) => {
      if ('applyWind' in object && typeof (object as any).applyWind === 'function') {
        windAffectables.current.push(object as unknown as WindAffectable);
      }
      
      object.children.forEach(findWindAffectables);
    };
    
    // Clear current list
    windAffectables.current = [];
    
    // Find all affectable objects
    scene.children.forEach(findWindAffectables);
    
    // Update when scene changes
    const handleSceneChange = () => {
      windAffectables.current = [];
      scene.children.forEach(findWindAffectables);
    };
    
    scene.addEventListener('added', handleSceneChange);
    scene.addEventListener('removed', handleSceneChange);
    
    return () => {
      scene.removeEventListener('added', handleSceneChange);
      scene.removeEventListener('removed', handleSceneChange);
    };
  }, [scene, affectObjects]);
  
  // Animate wind
  useFrame(({ clock, camera }) => {
    const time = clock.getElapsedTime();
    const deltaTime = clock.getDelta();
    
    // Update wind state with gusts and turbulence
    if (time - windState.lastUpdateTime > 0.5) {
      // Create natural variations in wind strength and direction
      const strengthVariation = (Math.sin(time * 0.2) + Math.sin(time * 0.3)) * turbulence * 0.25;
      const gustFactor = Math.random() > 0.95 ? Math.random() * turbulence * 2 : 0;
      
      const newStrength = Math.max(0, Math.min(1, windState.baseStrength + strengthVariation + gustFactor));
      
      // Create direction variations
      const dirVariationX = (Math.sin(time * 0.1) + Math.cos(time * 0.2)) * turbulence * 0.2;
      const dirVariationY = (Math.sin(time * 0.15)) * turbulence * 0.1;
      const dirVariationZ = (Math.cos(time * 0.1) + Math.sin(time * 0.3)) * turbulence * 0.2;
      
      const newDirection = windState.baseDirection.clone();
      newDirection.x += dirVariationX;
      newDirection.y += dirVariationY;
      newDirection.z += dirVariationZ;
      newDirection.normalize();
      
      setWindState({
        baseStrength: strength,
        currentStrength: newStrength,
        baseDirection: new THREE.Vector3(...direction).normalize(),
        currentDirection: newDirection,
        lastUpdateTime: time
      });
      
      // Update refs for other effects to use
      currentStrengthRef.current = newStrength;
      currentDirectionRef.current = newDirection;
      
      // Call onWindChange if strength changed significantly
      if (onWindChange && Math.abs(newStrength - windState.currentStrength) > 0.1) {
        onWindChange(newStrength, newDirection);
      }
      
      // Update audio volume based on wind strength
      if (audioRef.current) {
        audioRef.current.volume = Math.min(soundVolume * newStrength, 1.0);
      }
    }
    
    // Apply wind to affectable objects
    if (affectObjects && windAffectables.current.length > 0) {
      windAffectables.current.forEach((object) => {
        object.applyWind(
          currentDirectionRef.current,
          currentStrengthRef.current,
          deltaTime
        );
      });
    }
    
    // Animate wind particles if visualization is enabled
    if (visualize && windParticlesRef.current) {
      const geometry = windParticlesRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const lifetimes = (geometry as any).lifetimes;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Move particle in wind direction
        positions[i3] += currentDirectionRef.current.x * currentStrengthRef.current * deltaTime * 5;
        positions[i3 + 1] += currentDirectionRef.current.y * currentStrengthRef.current * deltaTime * 5;
        positions[i3 + 2] += currentDirectionRef.current.z * currentStrengthRef.current * deltaTime * 5;
        
        // Update lifetime
        lifetimes[i] -= deltaTime * (0.1 + currentStrengthRef.current * 0.2);
        
        // Reset particle if it's dead or out of bounds
        if (lifetimes[i] <= 0 || 
            Math.abs(positions[i3]) > 50 || 
            Math.abs(positions[i3 + 1]) > 50 || 
            Math.abs(positions[i3 + 2]) > 50) {
          
          // Reset opposite of wind direction
          const windDir = currentDirectionRef.current;
          positions[i3] = -windDir.x * 40 + (Math.random() - 0.5) * 20;
          positions[i3 + 1] = (Math.random() - 0.5) * 20 + 10; // Mostly above ground
          positions[i3 + 2] = -windDir.z * 40 + (Math.random() - 0.5) * 20;
          
          // Reset lifetime
          lifetimes[i] = Math.random();
        }
      }
      
      geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <>
      {/* Wind visualization particles */}
      {visualize && (
        <points ref={windParticlesRef}>
          <pointsMaterial
            size={0.2}
            transparent
            opacity={0.4}
            color={color}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      )}
    </>
  );
};

export default Wind; 
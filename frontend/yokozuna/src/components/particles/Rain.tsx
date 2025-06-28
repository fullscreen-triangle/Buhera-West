import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import Weather, { WeatherProps } from '../weather/Weather';

/**
 * Props for the Rain component
 * @interface RainProps
 */
export interface RainProps extends Omit<WeatherProps, 'type'> {
  /** Intensity of the rain (0.0 to 1.0) */
  intensity?: number;
  /** Size of raindrops (0.0 to 1.0) */
  dropSize?: number;
  /** Splash effect when raindrops hit surfaces */
  splashEffects?: boolean;
  /** Whether raindrops should create ripples on water surfaces */
  rippleEffects?: boolean;
  /** Sound of rainfall (0.0 to 1.0) */
  rainSound?: number;
  /** Optional callback for splash events */
  onSplash?: (position: THREE.Vector3) => void;
}

/**
 * Rain component for adding rainfall effects to a scene
 * 
 * @example
 * ```jsx
 * <Rain 
 *   intensity={0.7} 
 *   wind={true} 
 *   windDirection={[0.5, -1, 0.1]} 
 *   splashEffects={true}
 * />
 * ```
 */
const Rain: React.FC<RainProps> = ({
  intensity = 0.5,
  wind = true,
  windDirection = [0.2, -1, 0],
  windSpeed = 0.4,
  dropSize = 0.6,
  splashEffects = false,
  rippleEffects = false,
  rainSound = 0.7,
  onSplash,
  ...weatherProps
}) => {
  const splashesRef = useRef<THREE.Group>(null);
  const rippleTexture = useTexture('/textures/environment/ripple.png');
  
  // Create splash effect material
  const splashMaterial = useMemo(() => {
    if (!splashEffects) return null;
    
    return new THREE.MeshBasicMaterial({
      map: rippleTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    });
  }, [splashEffects, rippleTexture]);
  
  // Handle splash effects creation
  useFrame(({ raycaster, camera, scene, clock }) => {
    if (splashEffects && splashesRef.current && intensity > 0.1) {
      // Create new splash every frame based on intensity
      const shouldCreateSplash = Math.random() < intensity * 0.1;
      
      if (shouldCreateSplash && splashMaterial) {
        // Create a splash at a random position in the viewing frustum
        const randomX = (Math.random() - 0.5) * 30;
        const randomZ = (Math.random() - 0.5) * 30;
        
        // Use raycaster to find where the raindrop would hit
        raycaster.set(
          new THREE.Vector3(randomX, 20, randomZ), 
          new THREE.Vector3(0, -1, 0)
        );
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
          const hitPosition = intersects[0].point;
          
          // Create splash mesh
          const splashGeometry = new THREE.PlaneGeometry(dropSize * 2, dropSize * 2);
          const splash = new THREE.Mesh(splashGeometry, splashMaterial);
          
          splash.position.copy(hitPosition);
          splash.position.y += 0.01; // Slight offset to avoid z-fighting
          splash.rotation.x = -Math.PI / 2; // Lay flat
          
          // Store creation time for animation
          (splash as any).creationTime = clock.getElapsedTime();
          
          splashesRef.current.add(splash);
          
          // Call the callback if provided
          if (onSplash) {
            onSplash(hitPosition);
          }
        }
      }
      
      // Animate and remove old splashes
      const currentTime = clock.getElapsedTime();
      const splashLifetime = 1.0; // seconds
      
      splashesRef.current.children.forEach((splash, i) => {
        const splashAge = currentTime - (splash as any).creationTime;
        
        if (splashAge > splashLifetime) {
          // Remove old splash
          splashesRef.current!.remove(splash);
        } else {
          // Animate splash
          const normalizedAge = splashAge / splashLifetime;
          const scale = Math.min(normalizedAge * 2, 1) * dropSize * 3;
          splash.scale.set(scale, scale, scale);
          
          // Fade out
          const material = (splash as THREE.Mesh).material as THREE.MeshBasicMaterial;
          material.opacity = 0.7 * (1 - normalizedAge);
        }
      });
    }
  });
  
  return (
    <>
      <Weather 
        type="rain"
        intensity={intensity}
        wind={wind}
        windDirection={windDirection}
        windSpeed={windSpeed}
        soundVolume={rainSound}
        {...weatherProps}
      />
      
      {splashEffects && (
        <group ref={splashesRef} />
      )}
    </>
  );
};

export default Rain; 
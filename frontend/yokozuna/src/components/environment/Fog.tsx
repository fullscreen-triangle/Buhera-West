import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

/**
 * Props for the Fog component
 * @interface FogProps
 */
export interface FogProps {
  /** Density of the fog (0.0 to 1.0) */
  density?: number;
  /** Color of the fog */
  color?: THREE.ColorRepresentation;
  /** Whether the fog should animate/move */
  animated?: boolean;
  /** Animation speed of the fog */
  animationSpeed?: number;
  /** Height of the fog layer (for ground fog) */
  height?: number;
  /** Whether the fog should only appear on the ground */
  groundFog?: boolean;
  /** Near fog distance */
  near?: number;
  /** Far fog distance */
  far?: number;
  /** Whether to apply fog directly to the scene */
  applyToScene?: boolean;
  /** Whether the fog should be volumetric */
  volumetric?: boolean;
}

/**
 * Fog component for adding fog effects to a scene
 * 
 * @example
 * ```jsx
 * <Fog 
 *   density={0.4} 
 *   color="#b8c5d6"
 *   animated={true}
 *   groundFog={true}
 *   height={3}
 * />
 * ```
 */
const Fog: React.FC<FogProps> = ({
  density = 0.2,
  color = "#e0e0e0",
  animated = false,
  animationSpeed = 0.05,
  height = 5,
  groundFog = false,
  near = 10,
  far = 50,
  applyToScene = true,
  volumetric = false
}) => {
  const { scene } = useThree();
  const fogRef = useRef<THREE.Fog | null>(null);
  const fogPlaneRef = useRef<THREE.Mesh>(null);
  const fogVolumeRef = useRef<THREE.Group>(null);
  
  // Normalized density to prevent extreme values
  const normalizedDensity = Math.max(0, Math.min(1, density));
  
  // Create and apply fog to scene
  useEffect(() => {
    if (applyToScene) {
      // Adjust near/far based on density
      const adjustedNear = near * (1 - normalizedDensity * 0.5);
      const adjustedFar = far * (1 - normalizedDensity * 0.5);
      
      // Create fog
      const newFog = new THREE.Fog(color, adjustedNear, adjustedFar);
      scene.fog = newFog;
      fogRef.current = newFog;
      
      // Clean up on unmount
      return () => {
        scene.fog = null;
      };
    }
  }, [scene, applyToScene, normalizedDensity, color, near, far]);
  
  // Update fog parameters when props change
  useEffect(() => {
    if (fogRef.current && applyToScene) {
      fogRef.current.color = new THREE.Color(color);
      
      // Adjust near/far based on density
      fogRef.current.near = near * (1 - normalizedDensity * 0.5);
      fogRef.current.far = far * (1 - normalizedDensity * 0.5);
    }
  }, [normalizedDensity, color, near, far, applyToScene]);
  
  // Load fog texture for volumetric fog
  const fogTexture = useTexture('/textures/environment/fog.png');
  
  // Handle fog animation
  useFrame(({ clock }) => {
    if (animated) {
      const time = clock.getElapsedTime();
      
      // Animate the ground fog if it exists
      if (groundFog && fogPlaneRef.current) {
        const fogMaterial = fogPlaneRef.current.material as THREE.Material;
        if (fogMaterial && 'map' in fogMaterial) {
          const map = fogMaterial.map as THREE.Texture;
          if (map) {
            map.offset.x = Math.sin(time * animationSpeed) * 0.1;
            map.offset.y = Math.cos(time * animationSpeed * 0.5) * 0.05;
          }
        }
      }
      
      // Animate volumetric fog if it exists
      if (volumetric && fogVolumeRef.current) {
        fogVolumeRef.current.children.forEach((fogPlane, index) => {
          // Create different animation for each plane
          const offsetX = Math.sin(time * animationSpeed * (1 + index * 0.1)) * 0.05;
          const offsetZ = Math.cos(time * animationSpeed * (1 + index * 0.1)) * 0.05;
          
          fogPlane.position.x = offsetX;
          fogPlane.position.z = offsetZ;
          
          // Rotate slightly for more organic movement
          fogPlane.rotation.y = Math.sin(time * animationSpeed * 0.5) * 0.1;
        });
      }
    }
  });
  
  return (
    <>
      {/* Ground fog plane */}
      {groundFog && (
        <mesh 
          ref={fogPlaneRef}
          position={[0, height * 0.25, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial 
            map={fogTexture}
            transparent
            opacity={normalizedDensity * 0.8}
            depthWrite={false}
            color={color}
            fog={false}
          />
        </mesh>
      )}
      
      {/* Volumetric fog - multiple fog planes */}
      {volumetric && (
        <group ref={fogVolumeRef}>
          {Array.from({ length: 5 }).map((_, index) => (
            <mesh 
              key={index}
              position={[0, height * (index + 1) * 0.2, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[80, 80]} />
              <meshBasicMaterial 
                map={fogTexture}
                transparent
                opacity={normalizedDensity * 0.2 * (1 - index * 0.15)}
                depthWrite={false}
                color={color}
                fog={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
};

export default Fog; 
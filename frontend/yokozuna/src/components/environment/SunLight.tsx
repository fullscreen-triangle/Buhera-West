import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface SunLightProps {
  position?: [number, number, number];
  intensity?: number;
  color?: string;
  castShadow?: boolean;
  shadowMapSize?: number;
  shadowBias?: number;
  followCamera?: boolean;
  cameraDistance?: number;
  targetPosition?: [number, number, number];
}

/**
 * SunLight component for directional lighting in a scene
 * 
 * @example
 * ```jsx
 * <SunLight 
 *   position={[10, 20, 10]} 
 *   intensity={1.5} 
 *   color="#ffffaa"
 *   castShadow={true}
 * />
 * ```
 */
const SunLight: React.FC<SunLightProps> = ({
  position = [10, 10, 10],
  intensity = 1,
  color = '#ffffff',
  castShadow = true,
  shadowMapSize = 2048,
  shadowBias = -0.0001,
  followCamera = false,
  cameraDistance = 20,
  targetPosition = [0, 0, 0],
}) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  
  // Update light position when following camera
  useFrame(({ camera }) => {
    if (followCamera && lightRef.current) {
      // Get camera direction
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      
      // Offset the light based on camera direction
      const lightPosition = camera.position.clone()
        .add(cameraDirection.multiplyScalar(-1).add(new THREE.Vector3(0.5, 1, 0.5)).normalize().multiplyScalar(cameraDistance));
      
      lightRef.current.position.copy(lightPosition);
      
      // Look at target (usually the scene center)
      lightRef.current.target.position.set(...targetPosition);
      lightRef.current.target.updateMatrixWorld();
    }
  });
  
  return (
    <directionalLight
      ref={lightRef}
      position={position}
      intensity={intensity}
      color={color}
      castShadow={castShadow}
      shadow-mapSize={[shadowMapSize, shadowMapSize]}
      shadow-bias={shadowBias}
      shadow-camera-far={1000}
      shadow-camera-left={-100}
      shadow-camera-right={100}
      shadow-camera-top={100}
      shadow-camera-bottom={-100}
    >
      <primitive object={new THREE.Object3D()} />
    </directionalLight>
  );
};

export default SunLight; 
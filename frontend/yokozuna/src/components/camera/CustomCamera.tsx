// src/components/Camera/CameraControls.tsx
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CameraPreset, getCameraPreset } from './CameraPresets';

interface CameraControlsProps {
  // Use Vector3 or array of numbers as target
  target?: THREE.Vector3 | [number, number, number];
  preset?: string | CameraPreset;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
  autoRotate?: boolean;
  followTarget?: boolean;
  distance?: number;
  minDistance?: number;
  maxDistance?: number;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  target = [0, 0, 0],
  preset = 'default',
  enableZoom = true,
  enablePan = true,
  enableRotate = true,
  autoRotate = false,
  followTarget = false,
  distance = 10,
  minDistance = 2,
  maxDistance = 50
}) => {
  const controlsRef = useRef<any>(null);
  const { camera, gl } = useThree();
  
  // Convert target to Vector3 if it's an array
  const targetVector = Array.isArray(target) 
    // Use spread operator to convert array to Vector3 arguments
    ? new THREE.Vector3(target[0], target[1], target[2])
    : target;
  
  // Apply camera preset
  useEffect(() => {
    // Handle string presets by calling getCameraPreset
    const presetConfig = typeof preset === 'string' 
      ? getCameraPreset(preset)
      : preset;
    
    if (presetConfig) {
      // Create Vector3 from preset position array
      const presetPosition = new THREE.Vector3(
        presetConfig.position[0],
        presetConfig.position[1], 
        presetConfig.position[2]
      );
      camera.position.copy(presetPosition);
      
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetVector);
        controlsRef.current.update();
      }
    }
  }, [preset, camera, targetVector]);
  
  // Follow target if enabled
  useFrame(() => {
    if (followTarget && controlsRef.current) {
      controlsRef.current.target.copy(targetVector);
      controlsRef.current.update();
    }
  });
  
  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableZoom={enableZoom}
      enablePan={enablePan}
      enableRotate={enableRotate}
      autoRotate={autoRotate}
      minDistance={minDistance}
      maxDistance={maxDistance}
      target={targetVector}
    />
  );
};

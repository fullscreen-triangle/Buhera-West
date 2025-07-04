import React from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';

/**
 * BaseCamera component that provides standardized camera functionality
 * including perspective camera settings and optional orbit controls.
 */
const BaseCamera = ({
  position = [5, 2, 5],
  target = [0, 1, 0],
  fov = 50,
  near = 0.1,
  far = 1000,
  makeDefault = true,
  enableOrbitControls = true,
  orbitControlsOptions = {
    enableDamping: true,
    dampingFactor: 0.25,
    enableZoom: true,
    enablePan: true,
    enableRotate: true
  }
}) => {
  return (
    <>
      <PerspectiveCamera
        makeDefault={makeDefault}
        position={position}
        fov={fov}
        near={near}
        far={far}
      />
      
      {/* Orbit controls for interactive camera movement */}
      {enableOrbitControls && (
        <OrbitControls
          target={new Vector3(...target)}
          enableDamping={orbitControlsOptions.enableDamping}
          dampingFactor={orbitControlsOptions.dampingFactor}
          enableZoom={orbitControlsOptions.enableZoom}
          enablePan={orbitControlsOptions.enablePan}
          enableRotate={orbitControlsOptions.enableRotate}
          maxPolarAngle={orbitControlsOptions.maxPolarAngle}
          minPolarAngle={orbitControlsOptions.minPolarAngle}
          maxDistance={orbitControlsOptions.maxDistance}
          minDistance={orbitControlsOptions.minDistance}
        />
      )}
    </>
  );
};

export default BaseCamera; 
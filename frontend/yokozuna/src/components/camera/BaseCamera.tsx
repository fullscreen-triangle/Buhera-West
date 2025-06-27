import React from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';

interface BaseCameraProps {
  /** Camera position [x, y, z] */
  position?: [number, number, number];
  /** Camera look-at target position [x, y, z] */
  target?: [number, number, number];
  /** Field of view in degrees */
  fov?: number;
  /** Near clipping plane */
  near?: number;
  /** Far clipping plane */
  far?: number;
  /** Whether to use this camera as the default camera */
  makeDefault?: boolean;
  /** Whether to enable orbit controls */
  enableOrbitControls?: boolean;
  /** Additional options for orbit controls */
  orbitControlsOptions?: {
    enableDamping?: boolean;
    dampingFactor?: number;
    enableZoom?: boolean;
    enablePan?: boolean;
    enableRotate?: boolean;
    maxPolarAngle?: number;
    minPolarAngle?: number;
    maxDistance?: number;
    minDistance?: number;
  };
}

/**
 * BaseCamera component that provides standardized camera functionality
 * including perspective camera settings and optional orbit controls.
 */
const BaseCamera: React.FC<BaseCameraProps> = ({
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
import React, { useRef } from 'react';
import { PerspectiveCamera as ThreePerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export const PerspectiveCamera = ({
  makeDefault = true,
  position = [0, 5, 10],
  fov = 75,
  near = 0.1,
  far = 1000,
  lookAt = [0, 0, 0],
  rotation = [0, 0, 0],
  enableDamping = true,
  dampingFactor = 0.05
}) => {
  const cameraRef = useRef();

  useFrame(() => {
    if (cameraRef.current && enableDamping) {
      cameraRef.current.lookAt(...lookAt);
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <ThreePerspectiveCamera
      ref={cameraRef}
      makeDefault={makeDefault}
      position={position}
      fov={fov}
      near={near}
      far={far}
      rotation={rotation}
    />
  );
};

export default PerspectiveCamera;

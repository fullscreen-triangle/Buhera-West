import React, { useRef } from 'react';
import { CubeCamera as ThreeCubeCamera } from '@react-three/drei';

export const CubeCamera = ({
  resolution = 256,
  near = 0.1,
  far = 1000,
  children,
  frames = Infinity
}) => {
  const envMap = useRef();

  return (
    <ThreeCubeCamera
      resolution={resolution}
      near={near}
      far={far}
      frames={frames}
    >
      {(texture) => (
        <>
          <primitive object={texture} ref={envMap} />
          {children(texture)}
        </>
      )}
    </ThreeCubeCamera>
  );
};

export default CubeCamera;

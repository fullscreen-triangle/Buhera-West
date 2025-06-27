import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

const BaseGeoViewer = ({ 
  children,
  cameraPosition = [0, 2, 4],
  cameraConfig = {
    fov: 75,
    near: 0.1,
    far: 1000
  },
  controls = true,
  style = {},
  backgroundColor = '#000000',
  ambientLightIntensity = 0.5,
  directionalLightIntensity = 0.5,
  directionalLightPosition = [10, 10, 10]
}) => {
  return (
    <div style={{ width: '100%', height: '600px', ...style }}>
      <Canvas
        camera={{
          position: cameraPosition,
          ...cameraConfig
        }}
        style={{ background: backgroundColor }}
      >
        {/* Lights */}
        <ambientLight intensity={ambientLightIntensity} />
        <directionalLight 
          position={directionalLightPosition} 
          intensity={directionalLightIntensity} 
        />
        
        {/* Controls */}
        {controls && (
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            enableZoom
            enablePan
          />
        )}
        
        {/* Scene Content */}
        {children}
        
        {/* Environment */}
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

export default BaseGeoViewer;
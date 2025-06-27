import React from 'react';
import { Plane, Box } from '@react-three/drei';
import * as THREE from 'three';

export const BasicTerrain = ({
  size = 100,
  color = '#3a7e3d',
  gridColor = '#2f6631',
  showGrid = true,
  gridSize = 1,
  gridDivisions = 100,
  receiveShadow = true,
  castShadow = false,
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
  children
}) => {
  return (
    <group>
      {/* Main ground plane */}
      <Plane
        args={[size, size]}
        position={position}
        rotation={rotation}
        receiveShadow={receiveShadow}
        castShadow={castShadow}
      >
        <meshStandardMaterial
          color={color}
          side={THREE.DoubleSide}
        />
      </Plane>

      {/* Optional grid overlay */}
      {showGrid && (
        <Plane
          args={[size, size]}
          position={[position[0], position[1] + 0.001, position[2]]}
          rotation={rotation}
          receiveShadow={false}
        >
          <meshStandardMaterial
            color={gridColor}
            wireframe={true}
            opacity={0.3}
            transparent={true}
          />
        </Plane>
      )}

      {/* Optional boundary markers */}
      <Box
        args={[size, 0.2, 0.2]}
        position={[0, 0.1, size / 2]}
        castShadow
      >
        <meshStandardMaterial color={gridColor} />
      </Box>
      <Box
        args={[size, 0.2, 0.2]}
        position={[0, 0.1, -size / 2]}
        castShadow
      >
        <meshStandardMaterial color={gridColor} />
      </Box>
      <Box
        args={[0.2, 0.2, size]}
        position={[size / 2, 0.1, 0]}
        castShadow
      >
        <meshStandardMaterial color={gridColor} />
      </Box>
      <Box
        args={[0.2, 0.2, size]}
        position={[-size / 2, 0.1, 0]}
        castShadow
      >
        <meshStandardMaterial color={gridColor} />
      </Box>

      {children}
    </group>
  );
};

export default BasicTerrain;

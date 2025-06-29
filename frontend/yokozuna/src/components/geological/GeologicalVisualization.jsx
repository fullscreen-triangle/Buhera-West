import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/**
 * Geological Visualization Component
 * Renders 3D subsurface geological formations, mineral deposits, and groundwater flow
 */
export const GeologicalVisualization = ({ data, qualityLevel, enabled }) => {
  const groupRef = useRef();
  const mineralInstancesRef = useRef();
  const groundwaterFlowRef = useRef();
  
  // Create subsurface mesh from Float32Array data
  const subsurfaceMesh = useMemo(() => {
    if (!data?.subsurfaceMesh || !enabled) return null;
    
    const geometry = new THREE.BufferGeometry();
    const vertices = data.subsurfaceMesh;
    
    // Ensure we have valid vertex data (multiples of 3 for triangles)
    const vertexCount = Math.floor(vertices.length / 3) * 3;
    const validVertices = vertices.slice(0, vertexCount);
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(validVertices, 3));
    geometry.computeVertexNormals();
    
    return geometry;
  }, [data?.subsurfaceMesh, enabled]);
  
  // Generate colors for different geological layers based on depth
  const layerColors = useMemo(() => {
    if (!subsurfaceMesh) return null;
    
    const positions = subsurfaceMesh.attributes.position.array;
    const colors = new Float32Array(positions.length);
    
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1]; // depth coordinate
      
      // Color based on depth: shallow = brown, medium = gray, deep = dark
      if (y > -10) {
        // Shallow soil layer - brown
        colors[i] = 0.6; colors[i + 1] = 0.4; colors[i + 2] = 0.2;
      } else if (y > -50) {
        // Medium depth - gray rock
        colors[i] = 0.5; colors[i + 1] = 0.5; colors[i + 2] = 0.5;
      } else {
        // Deep layer - dark rock
        colors[i] = 0.2; colors[i + 1] = 0.2; colors[i + 2] = 0.3;
      }
    }
    
    return colors;
  }, [subsurfaceMesh]);
  
  // Mineral deposit positions and colors
  const mineralDeposits = useMemo(() => {
    if (!data?.mineralDeposits || !enabled) return [];
    
    return data.mineralDeposits.map((position, index) => ({
      position: [position.x, position.y, position.z],
      color: getMineralColor(index % 6), // Cycle through different mineral types
      scale: 0.5 + Math.random() * 1.0, // Vary deposit sizes
    }));
  }, [data?.mineralDeposits, enabled]);
  
  // Groundwater flow vectors
  const groundwaterVectors = useMemo(() => {
    if (!data?.groundwaterFlow || !enabled) return null;
    
    const points = [];
    data.groundwaterFlow.forEach(vector => {
      // Create line segments for flow visualization
      const start = new THREE.Vector3(vector.x, vector.y, vector.z);
      const end = start.clone().add(new THREE.Vector3(
        Math.random() * 4 - 2,
        -1 - Math.random() * 2, // Generally downward flow
        Math.random() * 4 - 2
      ));
      points.push(start, end);
    });
    
    return points;
  }, [data?.groundwaterFlow, enabled]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Animate mineral deposits with subtle floating motion
    if (mineralInstancesRef.current) {
      mineralInstancesRef.current.children.forEach((instance, index) => {
        instance.position.y += Math.sin(state.clock.elapsedTime * 2 + index) * 0.001;
      });
    }
    
    // Animate groundwater flow
    if (groundwaterFlowRef.current) {
      groundwaterFlowRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  
  if (!enabled || !data) return null;
  
  return (
    <group ref={groupRef} name="geological-visualization">
      {/* Subsurface geological layers */}
      {subsurfaceMesh && (
        <mesh geometry={subsurfaceMesh} receiveShadow>
          <meshLambertMaterial
            vertexColors
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
          {layerColors && (
            <bufferAttribute
              attach="geometry-attributes-color"
              array={layerColors}
              count={layerColors.length / 3}
              itemSize={3}
            />
          )}
        </mesh>
      )}
      
      {/* Mineral deposits */}
      {mineralDeposits.length > 0 && (
        <group ref={mineralInstancesRef}>
          {mineralDeposits.map((deposit, index) => (
            <mesh
              key={index}
              position={deposit.position}
              scale={[deposit.scale, deposit.scale, deposit.scale]}
              castShadow
            >
              <octahedronGeometry args={[0.3, 0]} />
              <meshPhongMaterial
                color={deposit.color}
                emissive={deposit.color}
                emissiveIntensity={0.2}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Groundwater flow visualization */}
      {groundwaterVectors && groundwaterVectors.length > 0 && (
        <group ref={groundwaterFlowRef}>
          {groundwaterVectors.map((point, index) => {
            if (index % 2 === 0 && index + 1 < groundwaterVectors.length) {
              const start = groundwaterVectors[index];
              const end = groundwaterVectors[index + 1];
              return (
                <line key={index / 2}>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      array={new Float32Array([
                        start.x, start.y, start.z,
                        end.x, end.y, end.z
                      ])}
                      count={2}
                      itemSize={3}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial
                    color="#4FC3F7"
                    transparent
                    opacity={0.6}
                  />
                </line>
              );
            }
            return null;
          })}
        </group>
      )}
      
      {/* Performance optimization: LOD for detailed geology */}
      {qualityLevel > 0.5 && (
        <mesh position={[0, -100, 0]}>
          <boxGeometry args={[200, 10, 200]} />
          <meshLambertMaterial color="#8D6E63" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

// Helper function to get mineral colors
function getMineralColor(type) {
  const colors = [
    '#FFD700', // Gold
    '#C0C0C0', // Silver
    '#B87333', // Copper
    '#4169E1', // Iron (blue-ish)
    '#32CD32', // Emerald
    '#FF4500'  // Orange (other minerals)
  ];
  return colors[type] || '#888888';
}

GeologicalVisualization.propTypes = {
  data: PropTypes.shape({
    subsurfaceMesh: PropTypes.instanceOf(Float32Array),
    mineralDeposits: PropTypes.array,
    groundwaterFlow: PropTypes.array,
    performanceMetrics: PropTypes.object,
  }),
  qualityLevel: PropTypes.number.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default GeologicalVisualization; 
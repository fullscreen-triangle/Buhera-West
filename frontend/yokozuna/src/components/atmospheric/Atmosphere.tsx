import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';

interface AtmosphereProps {
  sunPosition?: [number, number, number];
  turbidity?: number;
  rayleigh?: number;
  mieCoefficient?: number;
  mieDirectionalG?: number;
  inclination?: number;
  azimuth?: number;
  distance?: number;
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
  planetRadius?: number;
}

/**
 * Atmosphere component for creating realistic sky and fog effects
 * 
 * @example
 * ```jsx
 * <Atmosphere 
 *   sunPosition={[1, 0.5, 0]} 
 *   fogColor="#aabbdd" 
 *   rayleigh={2}
 * />
 * ```
 */
const Atmosphere: React.FC<AtmosphereProps> = ({
  sunPosition = [0, 1, 0],
  turbidity = 10,
  rayleigh = 1,
  mieCoefficient = 0.005,
  mieDirectionalG = 0.8,
  inclination = 0.49,
  azimuth = 0.25,
  distance = 1000,
  fogColor = '#90a7bf',
  fogNear = 10,
  fogFar = 1000,
  planetRadius = 6371000,
}) => {
  // Access the scene to apply fog
  const { scene } = useThree();
  
  // Apply fog to the scene
  useMemo(() => {
    scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    return () => {
      scene.fog = null;
    };
  }, [scene, fogColor, fogNear, fogFar]);
  
  // Calculate effective sun position if using inclination/azimuth
  const effectiveSunPosition = useMemo(() => {
    if (sunPosition[0] !== 0 || sunPosition[1] !== 1 || sunPosition[2] !== 0) {
      return sunPosition;
    }
    
    const theta = Math.PI * (inclination - 0.5);
    const phi = 2 * Math.PI * (azimuth - 0.5);
    
    const x = distance * Math.cos(phi);
    const y = distance * Math.sin(phi) * Math.sin(theta);
    const z = distance * Math.sin(phi) * Math.cos(theta);
    
    return [x, y, z] as [number, number, number];
  }, [sunPosition, inclination, azimuth, distance]);
  
  return (
    <>
      {/* Sky component from drei */}
      <Sky
        distance={planetRadius}
        sunPosition={effectiveSunPosition}
        turbidity={turbidity}
        rayleigh={rayleigh}
        mieCoefficient={mieCoefficient}
        mieDirectionalG={mieDirectionalG}
      />
    </>
  );
};

export default Atmosphere; 
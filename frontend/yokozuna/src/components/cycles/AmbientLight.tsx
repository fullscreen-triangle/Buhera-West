import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface AmbientLightProps {
  intensity?: number;
  color?: string;
  dynamicIntensity?: boolean;
  minIntensity?: number;
  maxIntensity?: number;
  cycleSpeed?: number;
}

/**
 * AmbientLight component for general scene lighting
 * 
 * @example
 * ```jsx
 * <AmbientLight 
 *   intensity={0.6} 
 *   color="#b9d5ff" 
 *   dynamicIntensity={true}
 * />
 * ```
 */
const AmbientLightComponent: React.FC<AmbientLightProps> = ({
  intensity = 0.5,
  color = '#ffffff',
  dynamicIntensity = false,
  minIntensity = 0.3,
  maxIntensity = 0.7,
  cycleSpeed = 0.5,
}) => {
  const lightRef = useRef<THREE.AmbientLight>(null);
  const timeRef = useRef(0);
  
  // Update light intensity when using dynamic mode
  useFrame((_, delta) => {
    if (dynamicIntensity && lightRef.current) {
      // Update time
      timeRef.current += delta * cycleSpeed;
      
      // Calculate intensity using a sine wave
      const intensityRange = maxIntensity - minIntensity;
      const dynamicValue = Math.sin(timeRef.current) * 0.5 + 0.5; // Range 0-1
      const currentIntensity = minIntensity + dynamicValue * intensityRange;
      
      // Apply new intensity
      lightRef.current.intensity = currentIntensity;
    }
  });
  
  return (
    <ambientLight
      ref={lightRef}
      intensity={intensity}
      color={color}
    />
  );
};

// Rename to avoid conflict with THREE.AmbientLight
export default AmbientLightComponent; 
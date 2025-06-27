import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface DayNightCycleProps {
  timeOfDay?: number; // 0-24 hour format
  cycleSpeed?: number; // Speed of day/night cycle (0 = static time, 1 = real-time, higher = faster)
  intensity?: number; // Brightness of sunlight
  sunColor?: string; // Color of the sun
  moonColor?: string; // Color of the moon
  skyColorDay?: string; // Sky color during day
  skyColorNight?: string; // Sky color during night
  onChange?: (timeOfDay: number, isDay: boolean) => void; // Callback for time changes
}

/**
 * DayNightCycle component that controls lighting changes based on time of day
 * 
 * @example
 * ```jsx
 * <DayNightCycle 
 *   timeOfDay={12} 
 *   cycleSpeed={100} 
 *   onChange={(time, isDay) => console.log(`Time: ${time}, Is day: ${isDay}`)} 
 * />
 * ```
 */
const DayNightCycle: React.FC<DayNightCycleProps> = ({
  timeOfDay = 12,
  cycleSpeed = 0,
  intensity = 1,
  sunColor = '#ffffff',
  moonColor = '#aabbff',
  skyColorDay = '#87ceeb',
  skyColorNight = '#000022',
  onChange,
}) => {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const moonRef = useRef<THREE.DirectionalLight>(null);
  const currentTimeRef = useRef(timeOfDay);
  
  // Function to calculate sun position based on time
  const calculateSunPosition = (time: number) => {
    // Convert 24-hour time to angle in radians (0h = -π/2, 12h = π/2, 24h = 3π/2)
    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2;
    
    // Calculate position on circular path
    const height = Math.sin(angle);
    const horizontalDistance = Math.cos(angle);
    
    return {
      x: horizontalDistance * 100,
      y: height * 100,
      z: 0,
      intensity: Math.max(0, height * intensity),
      isDay: height > 0,
    };
  };
  
  // Function to calculate moon position (opposite to sun)
  const calculateMoonPosition = (time: number) => {
    const moonTime = (time + 12) % 24;
    const { x, y, z, intensity } = calculateSunPosition(moonTime);
    // Moon is dimmer than the sun
    return { x, y, z, intensity: intensity * 0.3 };
  };
  
  // Update light positions and colors on each frame
  useFrame((_, delta) => {
    if (!sunRef.current || !moonRef.current) return;
    
    // Update time if cycle is enabled
    if (cycleSpeed > 0) {
      currentTimeRef.current = (currentTimeRef.current + delta * cycleSpeed / 60) % 24;
    } else {
      currentTimeRef.current = timeOfDay;
    }
    
    const time = currentTimeRef.current;
    
    // Update sun
    const sunPos = calculateSunPosition(time);
    sunRef.current.position.set(sunPos.x, sunPos.y, sunPos.z);
    sunRef.current.intensity = sunPos.intensity;
    
    // Update moon
    const moonPos = calculateMoonPosition(time);
    moonRef.current.position.set(moonPos.x, moonPos.y, moonPos.z);
    moonRef.current.intensity = moonPos.intensity;
    
    // Call onChange callback if provided
    if (onChange) {
      onChange(time, sunPos.isDay);
    }
  });
  
  return (
    <group>
      {/* Sun directional light */}
      <directionalLight 
        ref={sunRef}
        color={sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Moon directional light */}
      <directionalLight 
        ref={moonRef}
        color={moonColor}
        intensity={0.2}
        castShadow={false}
      />
    </group>
  );
};

export default DayNightCycle; 
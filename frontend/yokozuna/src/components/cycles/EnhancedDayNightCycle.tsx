import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Enhanced atmospheric data interface
 */
interface AtmosphericIntelligence {
  /** GPS differential atmospheric sensing */
  gpsSignalDelay: number;
  /** Cellular network environmental correlation */
  cellularNetworkLoad: number;
  /** WiFi infrastructure atmospheric analysis */
  wifiAttenuation: number;
  /** Hardware oscillatory harvesting data */
  ledSpectroscopy: number[];
  /** MIMO signal atmospheric coupling */
  mimoSignalCoupling: number;
  /** Solar reflectance atmospheric analysis */
  solarReflectance: number;
}

/**
 * Enhanced props extending the original DayNightCycle
 */
interface EnhancedDayNightCycleProps {
  /** Time of day (0-24 hour format) */
  timeOfDay?: number;
  /** Speed of day/night cycle */
  cycleSpeed?: number;
  /** Brightness of sunlight */
  intensity?: number;
  /** Color of the sun */
  sunColor?: string;
  /** Color of the moon */
  moonColor?: string;
  /** Sky color during day */
  skyColorDay?: string;
  /** Sky color during night */
  skyColorNight?: string;
  /** Atmospheric intelligence data */
  atmosphericData?: AtmosphericIntelligence;
  /** Enable solar reflectance optimization for Southern African conditions */
  enableSolarOptimization?: boolean;
  /** Enable atmospheric intelligence integration */
  enableAtmosphericIntelligence?: boolean;
  /** Enable GPS differential positioning */
  enableGPSPositioning?: boolean;
  /** Geographic coordinates for solar calculations */
  coordinates?: [number, number];
  /** Callback for time and atmospheric changes */
  onChange?: (timeOfDay: number, isDay: boolean, atmosphericState: any) => void;
}

/**
 * Enhanced Day/Night Cycle with Atmospheric Intelligence
 * Integrates multiple atmospheric sensing modalities with solar optimization
 * Based on the revolutionary framework from the README
 */
const EnhancedDayNightCycle: React.FC<EnhancedDayNightCycleProps> = ({
  timeOfDay = 12,
  cycleSpeed = 0,
  intensity = 1,
  sunColor = '#ffffff',
  moonColor = '#aabbff',
  skyColorDay = '#87ceeb',
  skyColorNight = '#000022',
  atmosphericData,
  enableSolarOptimization = true,
  enableAtmosphericIntelligence = true,
  enableGPSPositioning = false,
  coordinates = [-19.0154, 29.1549], // Buhera, Zimbabwe
  onChange
}) => {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const moonRef = useRef<THREE.DirectionalLight>(null);
  const currentTimeRef = useRef(timeOfDay);
  
  // Enhanced atmospheric state
  const [atmosphericState, setAtmosphericState] = useState({
    solarIntensityModified: intensity,
    atmosphericOpacity: 1.0,
    signalCoherence: 0.5,
    weatherPrediction: 'clear',
    solarOptimalAngle: 0,
    atmosphericMoisture: 0.3
  });
  
  // Calculate enhanced solar position with atmospheric compensation
  const calculateEnhancedSolarPosition = useCallback((time: number) => {
    // Base solar calculation
    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2;
    let height = Math.sin(angle);
    let horizontalDistance = Math.cos(angle);
    
    // GPS differential atmospheric correction
    if (enableGPSPositioning && atmosphericData) {
      const gpsCorrection = atmosphericData.gpsSignalDelay * 0.1;
      height += gpsCorrection;
      horizontalDistance += gpsCorrection * 0.5;
    }
    
    // Southern African solar optimization
    if (enableSolarOptimization) {
      const latitude = coordinates[0] * Math.PI / 180;
      const declination = 23.45 * Math.PI / 180 * Math.sin((time / 24 + 284) * Math.PI / 180);
      
      // Precise solar elevation calculation
      const hourAngle = (time - 12) * 15 * Math.PI / 180;
      height = Math.sin(declination) * Math.sin(latitude) + 
               Math.cos(declination) * Math.cos(latitude) * Math.cos(hourAngle);
      
      // Enhanced contrast for high-solar environments (5x enhancement from README)
      const solarEnhancement = Math.max(0, height) * 5;
      height = Math.min(1, height + solarEnhancement * 0.2);
    }
    
    // Atmospheric intelligence modifications
    if (enableAtmosphericIntelligence && atmosphericData) {
      // WiFi atmospheric attenuation affects apparent solar intensity
      const wifiAttenuation = atmosphericData.wifiAttenuation;
      const attenuationFactor = 1 - (wifiAttenuation * 0.3);
      
      // MIMO signal atmospheric coupling enhances optimal conditions
      if (atmosphericData.mimoSignalCoupling > 0.9) {
        // Exceptional atmospheric coupling - boost solar clarity
        height *= (1 + atmosphericData.mimoSignalCoupling * 0.2);
      }
      
      height *= attenuationFactor;
    }
    
    return {
      x: horizontalDistance * 100,
      y: Math.max(0, height * 100),
      z: 0,
      intensity: Math.max(0, height * intensity),
      isDay: height > 0,
      solarOptimalAngle: Math.atan2(height, horizontalDistance)
    };
  }, [enableGPSPositioning, enableSolarOptimization, enableAtmosphericIntelligence, 
      atmosphericData, coordinates, intensity]);
  
  // Calculate moon position with atmospheric enhancement
  const calculateEnhancedMoonPosition = useCallback((time: number) => {
    const moonTime = (time + 12) % 24;
    const { x, y, z, intensity: moonIntensity } = calculateEnhancedSolarPosition(moonTime);
    
    let finalIntensity = moonIntensity * 0.3;
    
    // Atmospheric intelligence enhancement for moon visibility
    if (enableAtmosphericIntelligence && atmosphericData) {
      // Clear atmospheric conditions enhance moon visibility
      const clarity = 1 - atmosphericData.wifiAttenuation;
      finalIntensity *= (1 + clarity * 0.5);
      
      // LED spectroscopy data can indicate optimal moon observation
      if (atmosphericData.ledSpectroscopy.length > 0) {
        const avgSpectrum = atmosphericData.ledSpectroscopy.reduce((a, b) => a + b, 0) / atmosphericData.ledSpectroscopy.length;
        if (avgSpectrum < 0.3) { // Low atmospheric particle density
          finalIntensity *= 1.3;
        }
      }
    }
    
    return { x, y, z, intensity: finalIntensity };
  }, [calculateEnhancedSolarPosition, enableAtmosphericIntelligence, atmosphericData]);
  
  // Atmospheric prediction based on multi-modal signals
  const predictAtmosphericConditions = useCallback(() => {
    if (!enableAtmosphericIntelligence || !atmosphericData) return;
    
    let prediction = 'clear';
    let moisture = 0.3;
    let coherence = 0.5;
    
    // GPS differential analysis
    if (atmosphericData.gpsSignalDelay > 0.15) {
      prediction = 'rain';
      moisture = 0.9;
    } else if (atmosphericData.gpsSignalDelay > 0.08) {
      prediction = 'cloudy';
      moisture = 0.6;
    }
    
    // Cellular network environmental correlation
    if (atmosphericData.cellularNetworkLoad > 0.8) {
      // High network load suggests urban area, possible heat island
      prediction = prediction === 'clear' ? 'hot_clear' : prediction;
    }
    
    // MIMO signal coherence
    coherence = atmosphericData.mimoSignalCoupling;
    
    // LED spectroscopy atmospheric analysis
    if (atmosphericData.ledSpectroscopy.length > 0) {
      const particleDensity = atmosphericData.ledSpectroscopy.reduce((a, b) => a + b, 0) / atmosphericData.ledSpectroscopy.length;
      if (particleDensity > 0.8) {
        prediction = 'dusty';
        moisture = 0.1;
      }
    }
    
    setAtmosphericState(prev => ({
      ...prev,
      weatherPrediction: prediction,
      atmosphericMoisture: moisture,
      signalCoherence: coherence,
      atmosphericOpacity: 1 - (moisture * 0.3) // Moisture reduces atmospheric transparency
    }));
  }, [enableAtmosphericIntelligence, atmosphericData]);
  
  // Update lighting and atmospheric analysis on each frame
  useFrame((state, delta) => {
    if (!sunRef.current || !moonRef.current) return;
    
    // Update time if cycle is enabled
    if (cycleSpeed > 0) {
      currentTimeRef.current = (currentTimeRef.current + delta * cycleSpeed / 60) % 24;
    } else {
      currentTimeRef.current = timeOfDay;
    }
    
    const time = currentTimeRef.current;
    
    // Update sun with enhanced calculations
    const sunPos = calculateEnhancedSolarPosition(time);
    sunRef.current.position.set(sunPos.x, sunPos.y, sunPos.z);
    
    // Apply atmospheric modifications to sun intensity
    let modifiedSunIntensity = sunPos.intensity;
    if (atmosphericState.atmosphericOpacity < 1) {
      modifiedSunIntensity *= atmosphericState.atmosphericOpacity;
    }
    sunRef.current.intensity = modifiedSunIntensity;
    
    // Solar reflectance color optimization for bright environments
    if (enableSolarOptimization && sunPos.intensity > 0.8) {
      // Implement negative image processing for extreme brightness
      const enhancedColor = new THREE.Color(sunColor);
      enhancedColor.multiplyScalar(1 + sunPos.intensity * 0.5);
      sunRef.current.color = enhancedColor;
    } else {
      sunRef.current.color = new THREE.Color(sunColor);
    }
    
    // Update moon with enhanced calculations
    const moonPos = calculateEnhancedMoonPosition(time);
    moonRef.current.position.set(moonPos.x, moonPos.y, moonPos.z);
    moonRef.current.intensity = moonPos.intensity;
    
    // Update atmospheric predictions
    predictAtmosphericConditions();
    
    // Update solar optimal angle
    setAtmosphericState(prev => ({
      ...prev,
      solarOptimalAngle: sunPos.solarOptimalAngle,
      solarIntensityModified: modifiedSunIntensity
    }));
    
    // Callback with enhanced atmospheric state
    if (onChange) {
      onChange(time, sunPos.isDay, {
        ...atmosphericState,
        currentSolarAngle: sunPos.solarOptimalAngle,
        atmosphericCoupling: atmosphericData?.mimoSignalCoupling || 0.5,
        gpsCorrection: atmosphericData?.gpsSignalDelay || 0
      });
    }
  });
  
  // Update atmospheric analysis when data changes
  useEffect(() => {
    predictAtmosphericConditions();
  }, [atmosphericData, predictAtmosphericConditions]);
  
  return (
    <group name="enhanced-day-night-cycle">
      {/* Enhanced sun directional light */}
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
      
      {/* Enhanced moon directional light */}
      <directionalLight 
        ref={moonRef}
        color={moonColor}
        intensity={0.2}
        castShadow={false}
      />
      
      {/* Atmospheric intelligence visualization (invisible helper) */}
      {enableAtmosphericIntelligence && (
        <group name="atmospheric-intelligence">
          <mesh visible={false} position={[0, 50, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default EnhancedDayNightCycle; 
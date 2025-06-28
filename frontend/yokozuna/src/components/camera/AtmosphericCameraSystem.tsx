import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { CameraPresets, CameraPreset, getCameraPreset } from './CameraPresets';

/**
 * Atmospheric sensing data for intelligent camera positioning
 */
interface AtmosphericCameraData {
  visibility: number; // 0-1, affects optimal viewing distance
  stormIntensity: number; // 0-1, affects camera stability
  windDirection: [number, number, number]; // For camera compensation
  precipitationLevel: number; // 0-1, affects lens simulation
  atmosphericDensity: number; // 0-1, affects depth of field
  solarIntensity: number; // 0-1, affects exposure simulation
}

/**
 * Enhanced camera preset with atmospheric awareness
 */
interface AtmosphericCameraPreset extends CameraPreset {
  /** Optimal visibility range for this preset */
  visibilityRange?: [number, number];
  /** Whether this preset adapts to atmospheric conditions */
  atmosphericAdaptive?: boolean;
  /** Atmospheric stability requirements */
  stabilityThreshold?: number;
}

/**
 * Props for the atmospheric camera system
 */
export interface AtmosphericCameraSystemProps {
  /** Current atmospheric sensing data */
  atmosphericData?: AtmosphericCameraData;
  /** Enable atmospheric intelligence for camera positioning */
  enableAtmosphericIntelligence?: boolean;
  /** Enable GPS differential camera positioning */
  enableGPSPositioning?: boolean;
  /** Target object to track */
  target?: THREE.Object3D | null;
  /** Initial camera preset */
  initialPreset?: string;
  /** Geographic coordinates for solar position calculation */
  coordinates?: [number, number];
  /** Time of day for solar-aware positioning */
  timeOfDay?: number;
  /** Callback when optimal viewing conditions are detected */
  onOptimalViewing?: (preset: string, confidence: number) => void;
  /** Enable hardware-controlled camera shake compensation */
  enableStabilization?: boolean;
  /** Enable solar reflectance optimized positioning */
  enableSolarOptimization?: boolean;
}

/**
 * Enhanced camera presets with atmospheric awareness
 */
const ATMOSPHERIC_CAMERA_PRESETS: Record<string, AtmosphericCameraPreset> = {
  ...CameraPresets,
  
  // Enhanced presets for atmospheric conditions
  ATMOSPHERIC_OVERVIEW: {
    position: [0, 15, 15],
    target: [0, 0, 0],
    fov: 60,
    transitionSpeed: 0.05,
    tracking: false,
    description: "High altitude view optimized for atmospheric observation",
    visibilityRange: [0.7, 1.0],
    atmosphericAdaptive: true,
    stabilityThreshold: 0.3
  },
  
  STORM_TRACKING: {
    position: [20, 8, 20],
    target: [0, 3, 0],
    fov: 45,
    transitionSpeed: 0.15,
    tracking: true,
    followDistance: 28.3,
    description: "Storm-resistant positioning with enhanced stability",
    visibilityRange: [0.2, 0.8],
    atmosphericAdaptive: true,
    stabilityThreshold: 0.1
  },
  
  SOLAR_OPTIMIZED: {
    position: [12, 4, 12],
    target: [0, 2, 0],
    fov: 40,
    transitionSpeed: 0.08,
    tracking: true,
    followDistance: 17.0,
    description: "Solar-angle optimized for Southern African conditions",
    visibilityRange: [0.8, 1.0],
    atmosphericAdaptive: true,
    stabilityThreshold: 0.7
  },
  
  PRECIPITATION_CLOSE: {
    position: [3, 2, 3],
    target: [0, 1.5, 0],
    fov: 55,
    transitionSpeed: 0.12,
    tracking: true,
    followDistance: 4.2,
    description: "Close-range view optimized for precipitation analysis",
    visibilityRange: [0.3, 0.9],
    atmosphericAdaptive: true,
    stabilityThreshold: 0.2
  }
};

/**
 * Enhanced Atmospheric Camera System
 * Integrates camera control with atmospheric intelligence and GPS positioning
 */
const AtmosphericCameraSystem: React.FC<AtmosphericCameraSystemProps> = ({
  atmosphericData,
  enableAtmosphericIntelligence = true,
  enableGPSPositioning = false,
  target = null,
  initialPreset = 'PERSPECTIVE',
  coordinates = [-19.0154, 29.1549], // Buhera, Zimbabwe
  timeOfDay = 12,
  onOptimalViewing,
  enableStabilization = true,
  enableSolarOptimization = true
}) => {
  const { camera, gl } = useThree();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const orbitControlsRef = useRef<any>(null);
  
  // Camera state management
  const [cameraState, setCameraState] = useState({
    currentPreset: initialPreset,
    adaptiveMode: enableAtmosphericIntelligence,
    stabilizationActive: false,
    solarCompensation: 0,
    atmosphericConfidence: 0.5
  });
  
  // Camera shake compensation for atmospheric disturbances
  const [shakeCompensation, setShakeCompensation] = useState({
    enabled: enableStabilization,
    intensity: 0,
    frequency: 0,
    dampening: 0.95
  });
  
  // Calculate optimal camera preset based on atmospheric conditions
  const calculateOptimalPreset = useCallback((data: AtmosphericCameraData): string => {
    if (!enableAtmosphericIntelligence) return cameraState.currentPreset;
    
    let optimalPreset = 'PERSPECTIVE';
    let confidence = 0.5;
    
    // Visibility-based preset selection
    if (data.visibility > 0.8 && data.stormIntensity < 0.3) {
      optimalPreset = 'ATMOSPHERIC_OVERVIEW';
      confidence = 0.9;
    } else if (data.stormIntensity > 0.7) {
      optimalPreset = 'STORM_TRACKING';
      confidence = 0.85;
    } else if (data.precipitationLevel > 0.6) {
      optimalPreset = 'PRECIPITATION_CLOSE';
      confidence = 0.8;
    } else if (data.solarIntensity > 0.8 && enableSolarOptimization) {
      optimalPreset = 'SOLAR_OPTIMIZED';
      confidence = 0.88;
    }
    
    // Update confidence based on atmospheric stability
    const stabilityFactor = 1 - data.stormIntensity;
    confidence *= stabilityFactor;
    
    // Callback for optimal viewing conditions
    if (onOptimalViewing && confidence > 0.8) {
      onOptimalViewing(optimalPreset, confidence);
    }
    
    return optimalPreset;
  }, [enableAtmosphericIntelligence, cameraState.currentPreset, enableSolarOptimization, onOptimalViewing]);
  
  // GPS-based camera positioning enhancement
  const calculateGPSPosition = useCallback((basePosition: [number, number, number]): [number, number, number] => {
    if (!enableGPSPositioning || !atmosphericData) return basePosition;
    
    // Simulate GPS differential atmospheric sensing affecting camera position
    const [x, y, z] = basePosition;
    
    // Adjust position based on atmospheric signal delays
    const atmosphericOffset = atmosphericData.atmosphericDensity * 0.5;
    const heightCorrection = atmosphericOffset * 2; // GPS altitude corrections
    
    return [
      x + atmosphericOffset * Math.sin(Date.now() * 0.001),
      y + heightCorrection,
      z + atmosphericOffset * Math.cos(Date.now() * 0.001)
    ];
  }, [enableGPSPositioning, atmosphericData]);
  
  // Solar position calculation for optimized camera angles
  const calculateSolarOptimization = useCallback(() => {
    if (!enableSolarOptimization) return { azimuth: 0, elevation: 0, intensity: 1 };
    
    // Calculate solar position based on time and coordinates
    const hourAngle = (timeOfDay - 12) * 15 * Math.PI / 180; // Convert to radians
    const declination = 23.45 * Math.PI / 180; // Simplified declination
    const latitude = coordinates[0] * Math.PI / 180;
    
    // Solar elevation calculation
    const elevation = Math.asin(
      Math.sin(declination) * Math.sin(latitude) +
      Math.cos(declination) * Math.cos(latitude) * Math.cos(hourAngle)
    );
    
    // Solar azimuth calculation
    const azimuth = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(latitude) - Math.tan(declination) * Math.cos(latitude)
    );
    
    const intensity = Math.max(0, Math.sin(elevation));
    
    return { azimuth, elevation, intensity };
  }, [enableSolarOptimization, timeOfDay, coordinates]);
  
  // Atmospheric stabilization system
  const calculateStabilization = useCallback((data: AtmosphericCameraData) => {
    if (!enableStabilization) return { x: 0, y: 0, z: 0 };
    
    // Calculate shake compensation based on atmospheric conditions
    const windEffect = Math.sqrt(
      data.windDirection[0] ** 2 + 
      data.windDirection[1] ** 2 + 
      data.windDirection[2] ** 2
    );
    
    const stormShake = data.stormIntensity * 0.02;
    const windShake = windEffect * 0.01;
    
    // Generate compensatory movement
    const time = Date.now() * 0.001;
    return {
      x: -Math.sin(time * 2 + data.windDirection[0]) * (stormShake + windShake),
      y: -Math.cos(time * 1.5 + data.windDirection[1]) * stormShake * 0.5,
      z: -Math.sin(time * 1.8 + data.windDirection[2]) * windShake
    };
  }, [enableStabilization]);
  
  // Memoized target position for tracking
  const targetPosition = useMemo(() => 
    new THREE.Vector3(
      target?.position?.x ?? 0,
      target?.position?.y ?? 0,
      target?.position?.z ?? 0
    ), 
    [target?.position?.x, target?.position?.y, target?.position?.z]
  );
  
  // Update camera preset based on atmospheric conditions
  useEffect(() => {
    if (atmosphericData && enableAtmosphericIntelligence) {
      const optimalPreset = calculateOptimalPreset(atmosphericData);
      
      if (optimalPreset !== cameraState.currentPreset) {
        setCameraState(prev => ({
          ...prev,
          currentPreset: optimalPreset,
          atmosphericConfidence: 0.85
        }));
      }
    }
  }, [atmosphericData, enableAtmosphericIntelligence, calculateOptimalPreset, cameraState.currentPreset]);
  
  // Apply camera positioning and effects
  useFrame(({ clock }) => {
    if (!cameraRef.current) return;
    
    const currentPreset = ATMOSPHERIC_CAMERA_PRESETS[cameraState.currentPreset];
    if (!currentPreset) return;
    
    // Get base position from preset
    let targetPos = currentPreset.position;
    
    // Apply GPS positioning enhancement
    if (enableGPSPositioning) {
      targetPos = calculateGPSPosition(targetPos);
    }
    
    // Apply solar optimization
    const solarData = calculateSolarOptimization();
    if (enableSolarOptimization && solarData.intensity > 0.5) {
      // Adjust camera position to optimize for solar conditions
      const solarOffset = solarData.intensity * 2;
      targetPos = [
        targetPos[0] + Math.cos(solarData.azimuth) * solarOffset,
        targetPos[1] + Math.sin(solarData.elevation) * solarOffset,
        targetPos[2] + Math.sin(solarData.azimuth) * solarOffset
      ];
    }
    
    // Apply atmospheric stabilization
    let stabilization = { x: 0, y: 0, z: 0 };
    if (atmosphericData && enableStabilization) {
      stabilization = calculateStabilization(atmosphericData);
    }
    
    // Smoothly transition camera position
    const smoothing = currentPreset.transitionSpeed || 0.1;
    const currentPos = cameraRef.current.position;
    
    currentPos.lerp(
      new THREE.Vector3(
        targetPos[0] + stabilization.x,
        targetPos[1] + stabilization.y,
        targetPos[2] + stabilization.z
      ),
      smoothing
    );
    
    // Update camera target if tracking
    if (currentPreset.tracking && target) {
      const targetLookAt = new THREE.Vector3(
        targetPosition.x,
        targetPosition.y,
        targetPosition.z
      );
      cameraRef.current.lookAt(targetLookAt);
    } else {
      const presetTarget = new THREE.Vector3(...currentPreset.target);
      cameraRef.current.lookAt(presetTarget);
    }
    
    // Update FOV based on atmospheric conditions
    if (atmosphericData && currentPreset.fov) {
      const visibilityFactor = atmosphericData.visibility;
      const adaptiveFOV = currentPreset.fov * (0.8 + visibilityFactor * 0.4);
      cameraRef.current.fov = adaptiveFOV;
      cameraRef.current.updateProjectionMatrix();
    }
  });
  
  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={ATMOSPHERIC_CAMERA_PRESETS[cameraState.currentPreset]?.fov || 50}
        position={ATMOSPHERIC_CAMERA_PRESETS[cameraState.currentPreset]?.position || [0, 0, 5]}
      />
      
      <OrbitControls
        ref={orbitControlsRef}
        camera={cameraRef.current}
        domElement={gl.domElement}
        enableDamping
        dampingFactor={0.1}
        enabled={!cameraState.adaptiveMode} // Disable manual controls during adaptive mode
      />
    </>
  );
};

export default AtmosphericCameraSystem; 
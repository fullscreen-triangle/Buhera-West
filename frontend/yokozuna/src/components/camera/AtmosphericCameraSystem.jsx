import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { CameraPresets, getCameraPreset } from './CameraPresets.js';

// Predefined atmospheric camera presets optimized for different conditions
const ATMOSPHERIC_CAMERA_PRESETS = {
  CLEAR_DAY: {
    position: [0, 5, 10],
    target: [0, 0, 0],
    fov: 50,
    near: 0.1,
    far: 1000,
    visibilityRange: [0.8, 1.0],
    atmosphericAdaptive: true,
    stabilityThreshold: 0.1,
    transitionSpeed: 0.05
  },
  OVERCAST: {
    position: [0, 3, 8],
    target: [0, 0, 0],
    fov: 55,
    near: 0.1,
    far: 800,
    visibilityRange: [0.4, 0.8],
    atmosphericAdaptive: true,
    stabilityThreshold: 0.2,
    transitionSpeed: 0.03
  },
  STORMY: {
    position: [0, 2, 6],
    target: [0, 0, 0],
    fov: 65,
    near: 0.1,
    far: 500,
    visibilityRange: [0.1, 0.4],
    atmosphericAdaptive: true,
    stabilityThreshold: 0.5,
    transitionSpeed: 0.02
  },
  NIGHT: {
    position: [0, 4, 12],
    target: [0, 0, 0],
    fov: 45,
    near: 0.1,
    far: 1200,
    visibilityRange: [0.3, 0.9],
    atmosphericAdaptive: true,
    stabilityThreshold: 0.1,
    transitionSpeed: 0.04
  },
  PERSPECTIVE: {
    position: [0, 5, 10],
    target: [0, 0, 0],
    fov: 50,
    near: 0.1,
    far: 1000,
    visibilityRange: [0.5, 1.0],
    atmosphericAdaptive: false,
    stabilityThreshold: 0.1,
    transitionSpeed: 0.05
  }
};

const AtmosphericCameraSystem = ({
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
  const { gl } = useThree();
  const cameraRef = useRef();
  const orbitControlsRef = useRef();
  
  // Camera state management
  const [cameraState, setCameraState] = useState({
    currentPreset: initialPreset,
    atmosphericConfidence: 0.5,
    isTransitioning: false,
    lastOptimization: Date.now()
  });
  
  // OrbitControls settings
  const {
    enableZoom = true,
    enablePan = true,
    enableRotate = true,
    autoRotate = false,
    autoRotateSpeed = 0.5,
    minDistance = 1,
    maxDistance = 100,
    minPolarAngle = 0,
    maxPolarAngle = Math.PI,
    minAzimuthAngle = -Infinity,
    maxAzimuthAngle = Infinity
  } = {};
  
  // Atmospheric analysis for optimal camera preset selection
  const calculateOptimalPreset = useCallback((data) => {
    if (!enableAtmosphericIntelligence || !data) return cameraState.currentPreset;
    
    const { visibility, stormIntensity, precipitationLevel, solarIntensity } = data;
    
    // Calculate confidence based on atmospheric conditions
    const visibilityScore = visibility * 0.4;
    const stormScore = (1 - stormIntensity) * 0.3;
    const precipScore = (1 - precipitationLevel) * 0.2;
    const solarScore = solarIntensity * 0.1;
    
    const confidence = visibilityScore + stormScore + precipScore + solarScore;
    
    // Determine optimal preset
    let optimalPreset = 'PERSPECTIVE';
    
    if (visibility > 0.8 && stormIntensity < 0.2) {
      optimalPreset = 'CLEAR_DAY';
    } else if (visibility > 0.4 && stormIntensity < 0.5) {
      optimalPreset = 'OVERCAST';
    } else if (stormIntensity > 0.5 || precipitationLevel > 0.7) {
      optimalPreset = 'STORMY';
    } else if (solarIntensity < 0.3) {
      optimalPreset = 'NIGHT';
    }
    
    // Callback for optimal viewing conditions
    if (onOptimalViewing && confidence > 0.8) {
      onOptimalViewing(optimalPreset, confidence);
    }
    
    return optimalPreset;
  }, [enableAtmosphericIntelligence, cameraState.currentPreset, enableSolarOptimization, onOptimalViewing]);
  
  // GPS-based camera positioning enhancement
  const calculateGPSPosition = useCallback((basePosition) => {
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
  const calculateStabilization = useCallback((data) => {
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
        enableZoom={enableZoom}
        enablePan={enablePan}
        enableRotate={enableRotate}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        minDistance={minDistance}
        maxDistance={maxDistance}
        minPolarAngle={minPolarAngle}
        maxPolarAngle={maxPolarAngle}
        minAzimuthAngle={minAzimuthAngle}
        maxAzimuthAngle={maxAzimuthAngle}
      />
    </>
  );
};

export default AtmosphericCameraSystem; 
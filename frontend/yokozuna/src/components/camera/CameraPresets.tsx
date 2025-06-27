import * as THREE from 'three';
import React, { useCallback, useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, TrackballControls, useHelper } from '@react-three/drei';
import { useCamera, useThirdPersonStore } from '../../store';
import { useMemoizedVector3 } from '../../utils/optimizations';

/**
 * Available camera preset types
 */
export type CameraPresetType = 
  | 'follow' 
  | 'overhead' 
  | 'firstPerson' 
  | 'sideView' 
  | 'farSideView' 
  | 'behindAthlete' 
  | 'frontView'
  | 'cinematic'
  | 'free'
  | 'drone'
  | 'lowAngle'
  | 'trackingShot'
  | 'topDown'
  | 'closeUp'
  | 'wideAngle'
  | 'broadcast';

/**
 * Props for the CameraPresetComponent component
 * @interface CameraPresetComponentProps
 */
export interface CameraPresetComponentProps {
  /** Initial camera preset to use */
  preset?: CameraPresetType;
  /** Target to follow/look at - typically an athlete */
  target?: THREE.Object3D | null;
  /** How smoothly the camera follows movement (0-1, lower is smoother) */
  smoothness?: number;
  /** Whether to enable orbit controls for user interaction */
  enableOrbitControls?: boolean;
  /** Whether to enable trackball controls for user interaction */
  enableTrackballControls?: boolean;
  /** Whether to show camera helper for debugging */
  showCameraHelper?: boolean;
  /** Distance from camera to target */
  distance?: number;
  /** Height offset for camera position */
  heightOffset?: number;
  /** Callback when camera preset changes */
  onPresetChange?: (preset: CameraPresetType) => void;
}

/**
 * Camera position presets for different viewing angles
 */
const CAMERA_PRESETS: Record<CameraPresetType, (distance: number, heightOffset: number) => [number, number, number]> = {
  follow: (distance, heightOffset) => [0, heightOffset + 2, distance],
  overhead: (distance, heightOffset) => [0, distance + heightOffset, 0],
  firstPerson: (distance, heightOffset) => [0, heightOffset + 1.7, 0.1],
  sideView: (distance, heightOffset) => [distance, heightOffset + 2, 0],
  farSideView: (distance, heightOffset) => [distance * 2, heightOffset + 3, distance],
  behindAthlete: (distance, heightOffset) => [0, heightOffset + 2, -distance],
  frontView: (distance, heightOffset) => [0, heightOffset + 2, distance],
  cinematic: (distance, heightOffset) => [distance, heightOffset + 1, distance],
  free: (distance, heightOffset) => [distance, heightOffset + 2, distance],
  drone: (distance, heightOffset) => [distance * 0.5, distance * 1.5 + heightOffset, distance * 0.5],
  lowAngle: (distance, heightOffset) => [distance * 0.3, heightOffset + 0.5, distance],
  trackingShot: (distance, heightOffset) => [distance * 1.5, heightOffset + 1.2, 0],
  topDown: (distance, heightOffset) => [0, distance * 2 + heightOffset, 0],
  closeUp: (distance, heightOffset) => [distance * 0.2, heightOffset + 1.6, distance * 0.3],
  wideAngle: (distance, heightOffset) => [distance * 2, heightOffset + 2, distance * 2],
  broadcast: (distance, heightOffset) => [distance * 1.5, heightOffset + 5, -distance * 0.5],
};

// Camera FOV presets for different angles
const CAMERA_FOV_PRESETS: Record<CameraPresetType, number> = {
  follow: 50,
  overhead: 60,
  firstPerson: 75,
  sideView: 45,
  farSideView: 40,
  behindAthlete: 50,
  frontView: 50,
  cinematic: 35,
  free: 50,
  drone: 65,
  lowAngle: 40,
  trackingShot: 38,
  topDown: 70,
  closeUp: 30,
  wideAngle: 80,
  broadcast: 55,
};

/**
 * CameraPresetComponent component provides different camera angles and controls
 * 
 * @example
 * ```jsx
 * <CameraPresetComponent 
 *   preset="follow"
 *   target={athleteRef.current}
 *   smoothness={0.1}
 *   enableOrbitControls={true}
 * />
 * ```
 */
const CameraPresetComponent = forwardRef<{
  setCameraPreset: (preset: CameraPresetType) => void;
  triggerCameraShake: (intensity?: number, duration?: number) => void;
  toggleDynamicMovement: (enabled?: boolean, amplitude?: number, frequency?: number) => void;
  getCurrentPreset: () => CameraPresetType;
}, CameraPresetComponentProps>(
  ({
    preset = 'follow',
    target = null,
    smoothness = 0.1,
    enableOrbitControls = true,
    enableTrackballControls = false,
    showCameraHelper = false,
    distance = 10,
    heightOffset = 0,
    onPresetChange
  }, ref) => {
    const { camera, gl } = useThree();
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const prevTimeRef = useRef<number>(0);
    const helperRef = useRef<THREE.CameraHelper | null>(null);
    const orbitControlsRef = useRef(null);
    
    // State for the current preset
    const [currentPreset, setCurrentPreset] = useState<CameraPresetType>(preset);
    
    // State for dynamic camera movement
    const [dynamicMovement, setDynamicMovement] = useState({
      enabled: false,
      amplitude: 0.1,
      frequency: 0.5,
      timeOffset: 0
    });
    
    // State for camera shake effect
    const [cameraShake, setCameraShake] = useState({
      enabled: false,
      intensity: 0.05,
      decay: 0.95,
      currentIntensity: 0
    });
    
    // Get camera state from store
    const cameraState = useCamera();
    const updateCamera = useThirdPersonStore((state) => state.updateCamera);
    
    // Create helper for debugging camera position
    useEffect(() => {
      if (showCameraHelper && cameraRef.current) {
        const helper = new THREE.CameraHelper(cameraRef.current);
        helperRef.current = helper;
        return () => {
          if (helperRef.current) {
            helperRef.current = null;
          }
        };
      }
    }, [showCameraHelper, cameraRef.current]);
    
    // Memoize target position for better performance
    const targetPosition = useMemoizedVector3(
      target?.position?.x ?? 0,
      target?.position?.y ?? 0,
      target?.position?.z ?? 0
    );
    
    // Get preset position
    const getPresetPosition = useCallback((presetType: CameraPresetType): [number, number, number] => {
      const presetFn = CAMERA_PRESETS[presetType];
      if (!presetFn) return [0, 0, 0];
      return presetFn(distance, heightOffset);
    }, [distance, heightOffset]);
    
    // Get preset FOV
    const getPresetFOV = useCallback((presetType: CameraPresetType): number => {
      return CAMERA_FOV_PRESETS[presetType] || 50;
    }, []);
    
    // Apply camera shake effect
    const applyCameraShake = useCallback((position: THREE.Vector3) => {
      if (!cameraShake.enabled || cameraShake.currentIntensity <= 0.001) return position;
      
      // Apply random displacement based on shake intensity
      const shakeOffset = new THREE.Vector3(
        (Math.random() - 0.5) * cameraShake.currentIntensity,
        (Math.random() - 0.5) * cameraShake.currentIntensity,
        (Math.random() - 0.5) * cameraShake.currentIntensity
      );
      
      return position.clone().add(shakeOffset);
    }, [cameraShake]);
    
    // Apply dynamic camera movement (breathing effect)
    const applyDynamicMovement = useCallback((position: THREE.Vector3, time: number) => {
      if (!dynamicMovement.enabled) return position;
      
      // Create a natural oscillating movement
      const verticalOffset = Math.sin(time * dynamicMovement.frequency) * dynamicMovement.amplitude;
      const horizontalOffset = Math.cos(time * dynamicMovement.frequency * 0.7) * dynamicMovement.amplitude * 0.3;
      
      return position.clone().add(new THREE.Vector3(
        horizontalOffset,
        verticalOffset,
        horizontalOffset * 0.5
      ));
    }, [dynamicMovement]);
    
    // Update camera position and target based on preset and target
    const updateCameraForPreset = useCallback((time: number = Date.now() / 1000) => {
      if (!cameraRef.current || !camera) return;
      
      // Get the preset position
      const [x, y, z] = getPresetPosition(currentPreset);
      
      // Set the camera FOV based on preset
      cameraRef.current.fov = getPresetFOV(currentPreset);
      cameraRef.current.updateProjectionMatrix();
      
      // Set the camera position based on preset
      const targetPos = target?.position ?? new THREE.Vector3();
      
      if (currentPreset === 'free') {
        // Free camera mode doesn't update position automatically
        return;
      } else if (currentPreset === 'firstPerson' && target) {
        // First-person view - position camera at target's eye level and orientation
        const rotation = target.rotation.y;
        let newPos = new THREE.Vector3(
          targetPos.x + Math.sin(rotation) * 0.5,
          targetPos.y + y,
          targetPos.z + Math.cos(rotation) * 0.5
        );
        
        // Apply effects
        newPos = applyDynamicMovement(newPos, time);
        newPos = applyCameraShake(newPos);
        
        cameraRef.current.position.copy(newPos);
        
        // Look in the direction the target is facing
        const lookAt = new THREE.Vector3(
          targetPos.x + Math.sin(rotation) * 100,
          targetPos.y + y,
          targetPos.z + Math.cos(rotation) * 100
        );
        cameraRef.current.lookAt(lookAt);
      } else {
        // For all other presets, interpolate position based on smoothness
        let newPos = new THREE.Vector3(
          targetPos.x + x,
          targetPos.y + y,
          targetPos.z + z
        );
        
        // Apply effects
        newPos = applyDynamicMovement(newPos, time);
        newPos = applyCameraShake(newPos);
        
        // Smooth camera movement
        if (smoothness < 1) {
          cameraRef.current.position.lerp(newPos, 1 - smoothness);
        } else {
          cameraRef.current.position.copy(newPos);
        }
        
        // Look at target
        cameraRef.current.lookAt(targetPos);
      }
      
      // Update camera shake intensity (decay over time)
      if (cameraShake.enabled && cameraShake.currentIntensity > 0) {
        setCameraShake(prev => ({
          ...prev,
          currentIntensity: prev.currentIntensity * prev.decay
        }));
      }
      
      // Update camera state in the store
      if (camera === cameraRef.current) {
      updateCamera({
          position: cameraRef.current.position.clone(),
          rotation: cameraRef.current.rotation.clone(),
        fov: cameraRef.current.fov
      });
      }
    }, [
      currentPreset, 
      target, 
      targetPosition, 
      smoothness,
      getPresetPosition,
      getPresetFOV,
      cameraShake,
      dynamicMovement,
      applyCameraShake,
      applyDynamicMovement
    ]);
    
    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      setCameraPreset: (preset: CameraPresetType) => {
        setCurrentPreset(preset);
        if (onPresetChange) onPresetChange(preset);
      },
      triggerCameraShake: (intensity = 0.3, duration = 0.5) => {
      setCameraShake(prev => ({
        ...prev,
        enabled: true,
          currentIntensity: intensity,
          decay: Math.pow(0.01, 1 / (60 * duration)) // Calculate decay to reach 1% in duration seconds
        }));
      },
      toggleDynamicMovement: (enabled = true, amplitude = 0.1, frequency = 0.5) => {
        setDynamicMovement(prev => ({
          ...prev,
          enabled,
          amplitude,
          frequency
        }));
      },
      getCurrentPreset: () => currentPreset
    }));
    
    // Frame update callback
    useFrame((_, delta) => {
      const time = Date.now() / 1000;
      updateCameraForPreset(time);
      prevTimeRef.current = time;
    });
    
    // When preset changes, update camera immediately
    useEffect(() => {
      if (preset !== currentPreset) {
        setCurrentPreset(preset);
        if (onPresetChange) onPresetChange(preset);
      }
    }, [preset, onPresetChange]);
    
    // Render orbit or trackball controls if enabled
    const renderControls = () => {
      if (enableOrbitControls) {
        return (
          <OrbitControls
            ref={orbitControlsRef}
            camera={camera}
            enableDamping
            dampingFactor={0.25}
            rotateSpeed={0.5}
            enabled={currentPreset === 'free'}
          />
        );
      } else if (enableTrackballControls) {
        return (
          <TrackballControls
            camera={camera}
            enabled={currentPreset === 'free'}
            rotateSpeed={2.0}
            zoomSpeed={1.0}
            panSpeed={0.8}
          />
        );
      }
      return null;
    };
    
    return (
      <>
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[0, 2, 10]}
          fov={50}
          near={0.1}
          far={1000}
        />
        {renderControls()}
        {showCameraHelper && helperRef.current && (
          <primitive object={helperRef.current} />
        )}
      </>
    );
  }
);

// Camera presets for the export API
export type CameraPreset = 
  'default' | 
  'overhead' | 
  'side' | 
  'firstPerson' | 
  'thirdPerson' | 
  'tracking';

/**
 * Get a camera preset by name for the export API
 */
export function getCameraPreset(preset: CameraPreset): CameraPresetConfig {
  // Implementation here
}

/**
 * Apply a camera preset to a camera for the export API
 */
export function applyCameraPreset(
  camera: THREE.Camera, 
  preset: CameraPreset
): void {
  // Implementation here
}

export default CameraPresetComponent; 
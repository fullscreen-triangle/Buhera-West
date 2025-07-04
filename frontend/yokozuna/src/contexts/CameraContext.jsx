import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CameraPresets, getCameraPreset } from '../components/camera/CameraPresets';

const CameraContext = createContext();

/**
 * Global Camera Provider for managing camera state across the entire application
 */
export const CameraProvider = ({ children }) => {
  // Core camera state
  const [currentPreset, setCurrentPreset] = useState('PERSPECTIVE');
  const [position, setPosition] = useState([5, 2, 5]);
  const [target, setTarget] = useState([0, 1, 0]);
  const [fov, setFov] = useState(50);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // UI state
  const [showCameraControls, setShowCameraControls] = useState(false);
  const [cameraControlsPosition, setCameraControlsPosition] = useState('top-right');
  const [cameraMode, setCameraMode] = useState('manual'); // 'manual', 'auto', 'tracking'
  
  // Animation and tracking state
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [orbitSpeed, setOrbitSpeed] = useState(0.5);
  const [trackingTarget, setTrackingTarget] = useState(null);
  const [smoothTransitions, setSmoothTransitions] = useState(true);
  
  // Scene-specific camera configurations
  const [sceneConfigs, setSceneConfigs] = useState({
    weather: {
      defaultPreset: 'PERSPECTIVE',
      allowedPresets: ['PERSPECTIVE', 'TOP', 'ORBIT', 'DRONE'],
      autoRotate: false,
      trackingEnabled: false
    },
    agriculture: {
      defaultPreset: 'TOP',
      allowedPresets: ['TOP', 'PERSPECTIVE', 'DRONE', 'ORBIT'],
      autoRotate: true,
      trackingEnabled: true
    },
    oceanography: {
      defaultPreset: 'PERSPECTIVE',
      allowedPresets: ['PERSPECTIVE', 'TOP', 'CINEMATIC', 'DRONE'],
      autoRotate: false,
      trackingEnabled: false
    },
    geology: {
      defaultPreset: 'ORBIT',
      allowedPresets: ['ORBIT', 'TOP', 'PERSPECTIVE', 'SIDE'],
      autoRotate: true,
      trackingEnabled: false
    },
    sensors: {
      defaultPreset: 'PERSPECTIVE',
      allowedPresets: ['PERSPECTIVE', 'TOP', 'ORBIT', 'TRACKING'],
      autoRotate: false,
      trackingEnabled: true
    },
    pathtracing: {
      defaultPreset: 'CINEMATIC',
      allowedPresets: ['CINEMATIC', 'PERSPECTIVE', 'FIRST_PERSON', 'ORBIT'],
      autoRotate: false,
      trackingEnabled: false
    }
  });
  
  // Camera animation ref
  const animationRef = useRef(null);
  
  // Transition to preset
  const transitionToPreset = useCallback((presetName, duration = 1000) => {
    const preset = getCameraPreset(presetName);
    if (!preset) return;
    
    setIsTransitioning(true);
    
    const startPosition = [...position];
    const startTarget = [...target];
    const startFov = fov;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth transitions
      const eased = smoothTransitions 
        ? 1 - Math.pow(1 - progress, 3) // Ease out cubic
        : progress; // Linear
      
      // Interpolate position
      const newPosition = [
        startPosition[0] + (preset.position[0] - startPosition[0]) * eased,
        startPosition[1] + (preset.position[1] - startPosition[1]) * eased,
        startPosition[2] + (preset.position[2] - startPosition[2]) * eased
      ];
      
      // Interpolate target
      const newTarget = [
        startTarget[0] + (preset.target[0] - startTarget[0]) * eased,
        startTarget[1] + (preset.target[1] - startTarget[1]) * eased,
        startTarget[2] + (preset.target[2] - startTarget[2]) * eased
      ];
      
      // Interpolate FOV
      const newFov = startFov + (preset.fov - startFov) * eased;
      
      setPosition(newPosition);
      setTarget(newTarget);
      setFov(newFov);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentPreset(presetName);
        setIsTransitioning(false);
      }
    };
    
    animate();
  }, [position, target, fov, smoothTransitions]);
  
  // Camera controls
  const applyPreset = useCallback((presetName, immediate = false) => {
    const preset = getCameraPreset(presetName);
    if (!preset) return;
    
    if (immediate) {
      setPosition(preset.position);
      setTarget(preset.target);
      setFov(preset.fov || 50);
      setCurrentPreset(presetName);
    } else {
      transitionToPreset(presetName);
    }
  }, [transitionToPreset]);
  
  const setManualPosition = useCallback((newPosition) => {
    setPosition(newPosition);
    setCurrentPreset('CUSTOM');
  }, []);
  
  const setManualTarget = useCallback((newTarget) => {
    setTarget(newTarget);
    setCurrentPreset('CUSTOM');
  }, []);
  
  const setManualFov = useCallback((newFov) => {
    setFov(newFov);
    setCurrentPreset('CUSTOM');
  }, []);
  
  // Orbit controls
  const startOrbit = useCallback((speed = 0.5) => {
    setIsOrbiting(true);
    setOrbitSpeed(speed);
  }, []);
  
  const stopOrbit = useCallback(() => {
    setIsOrbiting(false);
  }, []);
  
  const toggleOrbit = useCallback(() => {
    setIsOrbiting(prev => !prev);
  }, []);
  
  // Scene management
  const setScene = useCallback((sceneName) => {
    const config = sceneConfigs[sceneName];
    if (config) {
      applyPreset(config.defaultPreset, true);
      setCameraMode(config.trackingEnabled ? 'tracking' : 'manual');
      if (config.autoRotate) {
        startOrbit(0.3);
      } else {
        stopOrbit();
      }
    }
  }, [sceneConfigs, applyPreset, startOrbit, stopOrbit]);
  
  // Get allowed presets for current scene
  const getAllowedPresets = useCallback((sceneName) => {
    const config = sceneConfigs[sceneName];
    return config ? config.allowedPresets : Object.keys(CameraPresets);
  }, [sceneConfigs]);
  
  // Auto-rotation logic
  useEffect(() => {
    if (isOrbiting) {
      const orbitAnimation = () => {
        const radius = Math.sqrt(position[0] * position[0] + position[2] * position[2]);
        const angle = Math.atan2(position[2], position[0]) + orbitSpeed * 0.01;
        
        const newPosition = [
          Math.cos(angle) * radius,
          position[1],
          Math.sin(angle) * radius
        ];
        
        setPosition(newPosition);
        
        if (isOrbiting) {
          animationRef.current = requestAnimationFrame(orbitAnimation);
        }
      };
      
      animationRef.current = requestAnimationFrame(orbitAnimation);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isOrbiting, orbitSpeed, position]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle if camera controls are visible and no input is focused
      if (!showCameraControls || 
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement ||
          document.activeElement instanceof HTMLSelectElement) {
        return;
      }
      
      switch (event.key) {
        case '1':
          event.preventDefault();
          applyPreset('FRONT');
          break;
        case '2':
          event.preventDefault();
          applyPreset('SIDE');
          break;
        case '3':
          event.preventDefault();
          applyPreset('PERSPECTIVE');
          break;
        case '4':
          event.preventDefault();
          applyPreset('TOP');
          break;
        case '5':
          event.preventDefault();
          applyPreset('ORBIT');
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          toggleOrbit();
          break;
        case 'Escape':
          event.preventDefault();
          applyPreset('PERSPECTIVE');
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCameraControls, applyPreset, toggleOrbit]);
  
  const value = {
    // Camera state
    currentPreset,
    position,
    target,
    fov,
    isTransitioning,
    cameraMode,
    isOrbiting,
    orbitSpeed,
    trackingTarget,
    smoothTransitions,
    
    // UI state
    showCameraControls,
    cameraControlsPosition,
    
    // Controls
    applyPreset,
    transitionToPreset,
    setManualPosition,
    setManualTarget,
    setManualFov,
    startOrbit,
    stopOrbit,
    toggleOrbit,
    setTrackingTarget,
    
    // UI controls
    setShowCameraControls,
    setCameraControlsPosition,
    setCameraMode,
    setSmoothTransitions,
    setOrbitSpeed,
    
    // Scene management
    setScene,
    getAllowedPresets,
    sceneConfigs,
    setSceneConfigs,
    
    // Utilities
    availablePresets: Object.keys(CameraPresets),
    getPresetDescription: (name) => getCameraPreset(name)?.description || 'No description available'
  };
  
  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
};

export default CameraContext; 
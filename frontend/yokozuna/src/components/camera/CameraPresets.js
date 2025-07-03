import * as THREE from 'three';

/**
 * Collection of camera presets for different viewing angles
 */
export const CameraPresets = {
  // Front view of the athlete
  FRONT: {
    position: [0, 1.7, 5],
    target: [0, 1.7, 0],
    fov: 45,
    transitionSpeed: 0.1,
    tracking: true,
    followDistance: 5,
    description: "Front view for analyzing running form face-on"
  },
  
  // Side view for analyzing running form
  SIDE: {
    position: [5, 1.7, 0],
    target: [0, 1.7, 0],
    fov: 45,
    transitionSpeed: 0.1,
    tracking: true,
    followDistance: 5,
    description: "Side view for analyzing posture and stride length"
  },
  
  // Rear following view
  REAR: {
    position: [0, 1.7, -5],
    target: [0, 1.7, 0],
    fov: 45,
    transitionSpeed: 0.1,
    tracking: true,
    followDistance: 5,
    description: "Rear view following the athlete from behind"
  },
  
  // Top-down view for path analysis
  TOP: {
    position: [0, 10, 0],
    target: [0, 0, 0],
    fov: 60,
    transitionSpeed: 0.05,
    tracking: true,
    followDistance: 10,
    description: "Bird's eye view for analyzing movement patterns"
  },
  
  // 3/4 perspective view
  PERSPECTIVE: {
    position: [3, 2.5, 3],
    target: [0, 1.5, 0],
    fov: 50,
    transitionSpeed: 0.1,
    tracking: true,
    followDistance: 4.2,
    description: "3/4 angle view showing both front and side aspects"
  },
  
  // Tracking camera that follows the athlete
  TRACKING: {
    position: [2, 1.7, 2],
    target: [0, 1.7, 0],
    fov: 50,
    transitionSpeed: 0.15,
    tracking: true,
    followDistance: 2.8,
    description: "Tracking shot that closely follows the athlete"
  },
  
  // Close-up for biomechanical analysis
  BIOMECHANICS: {
    position: [1.5, 1.7, 1.5],
    target: [0, 1.2, 0],
    fov: 35,
    transitionSpeed: 0.08,
    tracking: true,
    followDistance: 2.1,
    description: "Close-up view for detailed biomechanical analysis"
  },
  
  // Orbit view (wide angle)
  ORBIT: {
    position: [8, 3, 0],
    target: [0, 1.5, 0],
    fov: 40,
    transitionSpeed: 0.05,
    tracking: true,
    followDistance: 8,
    description: "Orbital view for wide-angle perspective"
  },
  
  // Low angle looking up
  LOW_ANGLE: {
    position: [3, 0.5, 3],
    target: [0, 1.8, 0],
    fov: 45,
    transitionSpeed: 0.1,
    tracking: true,
    followDistance: 4.2,
    description: "Low angle view looking upward at the athlete"
  },
  
  // Closeup on feet
  FEET: {
    position: [1, 0.3, 1],
    target: [0, 0.2, 0],
    fov: 35,
    transitionSpeed: 0.1,
    tracking: true,
    followDistance: 1.4,
    description: "Close-up on footwork and ground contact"
  },
  
  // Cinematic wide view
  CINEMATIC: {
    position: [15, 2, 15],
    target: [0, 1.5, 0],
    fov: 28,
    transitionSpeed: 0.03,
    tracking: true,
    followDistance: 21.2,
    description: "Cinematic wide-angle view with shallow depth of field"
  },
  
  // First person view
  FIRST_PERSON: {
    position: [0, 1.7, 0],
    target: [0, 1.7, 1],
    fov: 75,
    transitionSpeed: 0.2,
    tracking: true,
    followDistance: 0,
    description: "First-person perspective from the athlete's viewpoint"
  },
  
  // Drone view from above and behind
  DRONE: {
    position: [0, 8, -10],
    target: [0, 1, 0],
    fov: 55,
    transitionSpeed: 0.05,
    tracking: true,
    followDistance: 12.8,
    description: "Aerial drone-like view following from behind"
  },
  
  // Static stadium view
  STADIUM: {
    position: [50, 30, 50],
    target: [0, 0, 0],
    fov: 35,
    transitionSpeed: 0.03,
    tracking: false,
    description: "Fixed stadium view showing the entire track"
  }
};

/**
 * Get camera preset by name
 * @param name The preset name
 * @returns The camera preset or the default PERSPECTIVE preset if not found
 */
export function getCameraPreset(name) {
  const preset = CameraPresets[name];
  if (!preset) {
    console.warn(`Camera preset '${name}' not found, using PERSPECTIVE as default`);
    return CameraPresets.PERSPECTIVE;
  }
  return preset;
}

/**
 * Apply camera preset to a Three.js camera
 * @param camera The Three.js camera to modify
 * @param preset The preset to apply
 * @param immediate Whether to apply immediately or animate
 * @param onComplete Optional callback when transition is complete
 */
export function applyCameraPreset(
  camera, 
  preset, 
  immediate = false,
  onComplete
) {
  if (!camera) {
    console.error('Camera is required for applyCameraPreset');
    return;
  }

  const targetPosition = new THREE.Vector3(...preset.position);
  const targetTarget = new THREE.Vector3(...preset.target);
  const targetFov = preset.fov || 50;

  if (immediate) {
    camera.position.copy(targetPosition);
    camera.lookAt(targetTarget);
    if (camera.fov !== undefined) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
    if (onComplete) onComplete();
    return;
  }

  // Animate transition
  const startPosition = camera.position.clone();
  const startTarget = camera.target ? camera.target.clone() : new THREE.Vector3(0, 0, 0);
  const startFov = camera.fov || 50;
  
  const duration = 1000 / (preset.transitionSpeed || 0.1);
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Apply easing based on transitionCurve
    let easedProgress = progress;
    switch (preset.transitionCurve) {
      case 'easeIn':
        easedProgress = progress * progress;
        break;
      case 'easeOut':
        easedProgress = 1 - (1 - progress) * (1 - progress);
        break;
      case 'easeInOut':
        easedProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        break;
      default:
        easedProgress = progress;
    }
    
    // Interpolate position
    camera.position.lerpVectors(startPosition, targetPosition, easedProgress);
    
    // Interpolate target
    const currentTarget = new THREE.Vector3().lerpVectors(startTarget, targetTarget, easedProgress);
    camera.lookAt(currentTarget);
    
    // Interpolate FOV
    if (camera.fov !== undefined) {
      camera.fov = startFov + (targetFov - startFov) * easedProgress;
      camera.updateProjectionMatrix();
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      if (onComplete) onComplete();
    }
  };
  
  animate();
}

/**
 * Create a camera controller with state management
 * @param initialState Initial camera state or preset name
 * @returns Camera controller object
 */
export function createCameraController(initialState = 'PERSPECTIVE') {
  let currentState = typeof initialState === 'string' 
    ? { ...getCameraPreset(initialState) }
    : { ...initialState };
  
  let isOrbiting = false;
  let orbitSpeed = 0.5;
  let orbitRadius = 5;
  let orbitAngle = 0;
  
  const getCurrentState = () => ({ ...currentState });
  
  const transitionTo = (preset, duration = 1) => {
    const targetPreset = typeof preset === 'string' ? getCameraPreset(preset) : preset;
    
    const startTime = Date.now();
    const startState = { ...currentState };
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Interpolate position
      currentState.position = [
        startState.position[0] + (targetPreset.position[0] - startState.position[0]) * progress,
        startState.position[1] + (targetPreset.position[1] - startState.position[1]) * progress,
        startState.position[2] + (targetPreset.position[2] - startState.position[2]) * progress
      ];
      
      // Interpolate target
      currentState.target = [
        startState.target[0] + (targetPreset.target[0] - startState.target[0]) * progress,
        startState.target[1] + (targetPreset.target[1] - startState.target[1]) * progress,
        startState.target[2] + (targetPreset.target[2] - startState.target[2]) * progress
      ];
      
      // Interpolate FOV
      if (targetPreset.fov !== undefined) {
        currentState.fov = startState.fov + (targetPreset.fov - startState.fov) * progress;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        currentState = { ...targetPreset };
      }
    };
    
    animate();
  };
  
  const updateCamera = (camera) => {
    if (!camera) return;
    
    camera.position.set(...currentState.position);
    camera.lookAt(new THREE.Vector3(...currentState.target));
    
    if (currentState.fov !== undefined && camera.fov !== undefined) {
      camera.fov = currentState.fov;
      camera.updateProjectionMatrix();
    }
    
    // Handle orbiting
    if (isOrbiting) {
      orbitAngle += orbitSpeed * 0.01;
      const x = Math.cos(orbitAngle) * orbitRadius;
      const z = Math.sin(orbitAngle) * orbitRadius;
      camera.position.set(x, currentState.position[1], z);
      camera.lookAt(new THREE.Vector3(...currentState.target));
    }
  };
  
  const setTarget = (target) => {
    currentState.target = [...target];
  };
  
  const setPosition = (position) => {
    currentState.position = [...position];
  };
  
  const setFov = (fov) => {
    currentState.fov = fov;
  };
  
  const orbit = (speed = 0.5) => {
    isOrbiting = true;
    orbitSpeed = speed;
    orbitRadius = Math.sqrt(
      currentState.position[0] * currentState.position[0] + 
      currentState.position[2] * currentState.position[2]
    );
    orbitAngle = Math.atan2(currentState.position[2], currentState.position[0]);
  };
  
  const stopOrbit = () => {
    isOrbiting = false;
  };
  
  return {
    getCurrentState,
    transitionTo,
    updateCamera,
    setTarget,
    setPosition,
    setFov,
    orbit,
    stopOrbit
  };
}

/**
 * Create a camera tracker for following moving targets
 * @param camera The Three.js camera
 * @param preset The preset to use for tracking
 * @returns Function to update target position
 */
export function createCameraTracker(camera, preset = CameraPresets.TRACKING) {
  let lastTargetPosition = [0, 0, 0];
  
  return (targetPosition) => {
    if (!camera || !targetPosition) return;
    
    const [x, y, z] = targetPosition;
    const offset = preset.position;
    const followDistance = preset.followDistance || 5;
    
    // Calculate camera position relative to target
    const cameraPosition = [
      x + offset[0],
      y + offset[1],
      z + offset[2]
    ];
    
    // Smooth camera movement
    const smoothing = preset.transitionSpeed || 0.1;
    
    camera.position.lerp(
      new THREE.Vector3(...cameraPosition),
      smoothing
    );
    
    // Look at target
    camera.lookAt(new THREE.Vector3(x, y, z));
    
    lastTargetPosition = targetPosition;
  };
} 
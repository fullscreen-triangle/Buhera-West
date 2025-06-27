import * as THREE from 'three';
import { CameraPositionState } from '../../types/Camera';

/**
 * Camera preset type definition
 */
export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
  /**
   * Controls the amount of smoothing applied when transitioning to this preset
   * Lower values mean smoother transitions (0.01-0.1 for very smooth, 1.0 for instant)
   */
  transitionSpeed?: number;
  /** 
   * Whether this preset should automatically track the subject's movement
   * If true, the target position will be updated to follow the subject
   */
  tracking?: boolean;
  /**
   * Indicates the distance from the subject when tracking is enabled
   * Used to maintain consistent framing as the subject moves
   */
  followDistance?: number;
  /**
   * Optional description of the camera preset
   */
  description?: string;
  /**
   * Optional transition animation curve
   * "linear", "easeIn", "easeOut", "easeInOut"
   */
  transitionCurve?: string;
}

/**
 * Collection of camera presets for different viewing angles
 */
export const CameraPresets: Record<string, CameraPreset> = {
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
export function getCameraPreset(name: string): CameraPreset {
  return CameraPresets[name] || CameraPresets.PERSPECTIVE;
}

/**
 * Apply camera preset to a Three.js camera with optional transition
 * @param camera The camera to update
 * @param preset The preset to apply
 * @param immediate Whether to apply the change immediately or transition smoothly
 * @param onComplete Optional callback when transition completes
 */
export function applyCameraPreset(
  camera: THREE.Camera, 
  preset: CameraPreset, 
  immediate: boolean = false,
  onComplete?: () => void
): void {
  if (immediate) {
    // Apply immediately
    if (camera instanceof THREE.PerspectiveCamera && preset.fov) {
      camera.fov = preset.fov;
      camera.updateProjectionMatrix();
    }
    
    camera.position.set(...preset.position);
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.lookAt(new THREE.Vector3(...preset.target));
    }
    
    if (onComplete) onComplete();
  } else {
    // Store initial camera state for transition
    const initialPosition = camera.position.clone();
    const initialTarget = new THREE.Vector3();
    
    if (camera instanceof THREE.PerspectiveCamera) {
      // Calculate initial target by extending view direction
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);
      initialTarget.copy(camera.position).add(direction.multiplyScalar(100));
      
      // Store initial FOV
      const initialFov = camera.fov;
      
      // Start transition animation
      const transitionSpeed = preset.transitionSpeed || 0.1;
      let progress = 0;
      
      const animate = () => {
        progress = Math.min(progress + transitionSpeed, 1);
        
        // Apply easing based on transition curve
        let easedProgress = progress;
        if (preset.transitionCurve === 'easeIn') {
          easedProgress = Math.pow(progress, 2);
        } else if (preset.transitionCurve === 'easeOut') {
          easedProgress = 1 - Math.pow(1 - progress, 2);
        } else if (preset.transitionCurve === 'easeInOut') {
          easedProgress = progress < 0.5 
            ? 2 * Math.pow(progress, 2) 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        }
        
        // Interpolate position
        camera.position.lerpVectors(
          initialPosition,
          new THREE.Vector3(...preset.position),
          easedProgress
        );
        
        // Interpolate target for lookAt
        const currentTarget = new THREE.Vector3();
        currentTarget.lerpVectors(
          initialTarget,
          new THREE.Vector3(...preset.target),
          easedProgress
        );
        camera.lookAt(currentTarget);
        
        // Interpolate FOV if applicable
        if (camera instanceof THREE.PerspectiveCamera && preset.fov) {
          camera.fov = initialFov + (preset.fov - initialFov) * easedProgress;
          camera.updateProjectionMatrix();
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (onComplete) onComplete();
        }
      };
      
      requestAnimationFrame(animate);
    }
  }
}

/**
 * Create a camera state tracker for smooth transitions and positioning
 * @param initialState Initial state or preset name
 * @returns Camera state controller
 */
export function createCameraController(
  initialState: CameraPositionState | string = 'PERSPECTIVE'
): {
  getCurrentState: () => CameraPositionState;
  transitionTo: (preset: string | CameraPreset, duration?: number) => void;
  updateCamera: (camera: THREE.Camera) => void;
  setTarget: (target: [number, number, number]) => void;
  setPosition: (position: [number, number, number]) => void;
  setFov: (fov: number) => void;
  orbit: (speed?: number) => void;
  stopOrbit: () => void;
} {
  // Initialize with either a state object or a preset name
  let currentState: CameraPositionState = typeof initialState === 'string'
    ? {
        position: [...CameraPresets[initialState].position] as [number, number, number],
        target: [...CameraPresets[initialState].target] as [number, number, number],
        fov: CameraPresets[initialState].fov || 50
      }
    : { ...initialState };
  
  // Target state for transitions
  let targetState: CameraPositionState | null = null;
  
  // Transition parameters
  let transitionProgress = 0;
  let transitionDuration = 1; // seconds
  let transitionStartTime = 0;
  let inTransition = false;
  
  // Orbiting parameters
  let orbiting = false;
  let orbitSpeed = 0.5; // degrees per frame
  let orbitCenter: THREE.Vector3 | null = null;
  let orbitRadius = 0;
  let orbitAngle = 0;
  let orbitHeight = 0;
  
  // Get current camera state
  const getCurrentState = (): CameraPositionState => ({ ...currentState });
  
  // Start a transition to a new state
  const transitionTo = (
    preset: string | CameraPreset, 
    duration: number = 1
  ): void => {
    // Stop orbiting if active
    if (orbiting) stopOrbit();
    
    // Get preset if string was provided
    const targetPreset = typeof preset === 'string' 
      ? CameraPresets[preset] 
      : preset;
    
    // Initialize target state
    targetState = {
      position: [...targetPreset.position] as [number, number, number],
      target: [...targetPreset.target] as [number, number, number],
      fov: targetPreset.fov || currentState.fov
    };
    
    // Set up transition parameters
    transitionDuration = duration;
    transitionProgress = 0;
    transitionStartTime = performance.now();
    inTransition = true;
  };
  
  // Update the camera based on current state and transitions
  const updateCamera = (camera: THREE.Camera): void => {
    // Handle transitions
    if (inTransition && targetState) {
      const now = performance.now();
      const elapsed = (now - transitionStartTime) / 1000; // in seconds
      
      transitionProgress = Math.min(elapsed / transitionDuration, 1);
      
      // Apply easing (smooth step)
      const t = transitionProgress < 0.5
        ? 2 * transitionProgress * transitionProgress
        : 1 - Math.pow(-2 * transitionProgress + 2, 2) / 2;
      
      // Interpolate position
      const newPosition: [number, number, number] = [
        currentState.position[0] + (targetState.position[0] - currentState.position[0]) * t,
        currentState.position[1] + (targetState.position[1] - currentState.position[1]) * t,
        currentState.position[2] + (targetState.position[2] - currentState.position[2]) * t
      ];
      
      // Interpolate target
      const newTarget: [number, number, number] = [
        currentState.target[0] + (targetState.target[0] - currentState.target[0]) * t,
        currentState.target[1] + (targetState.target[1] - currentState.target[1]) * t,
        currentState.target[2] + (targetState.target[2] - currentState.target[2]) * t
      ];
      
      // Interpolate FOV
      let newFov = currentState.fov;
      if (camera instanceof THREE.PerspectiveCamera) {
        newFov = currentState.fov + (targetState.fov - currentState.fov) * t;
      }
      
      // Apply interpolated values
      camera.position.set(...newPosition);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.lookAt(new THREE.Vector3(...newTarget));
        camera.fov = newFov;
        camera.updateProjectionMatrix();
      }
      
      // Check if transition is complete
      if (transitionProgress >= 1) {
        currentState = { ...targetState };
        inTransition = false;
        targetState = null;
      }
    } else if (orbiting && orbitCenter) {
      // Handle orbiting animation
      orbitAngle += orbitSpeed * (Math.PI / 180); // Convert degrees to radians
      
      // Calculate new position around orbit center
      const newX = orbitCenter.x + Math.cos(orbitAngle) * orbitRadius;
      const newZ = orbitCenter.z + Math.sin(orbitAngle) * orbitRadius;
      
      // Update position in current state
      currentState.position = [newX, orbitHeight, newZ];
      
      // Apply to camera
      camera.position.set(...currentState.position);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.lookAt(orbitCenter);
      }
    } else {
      // Standard update (no transition or orbit)
      camera.position.set(...currentState.position);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.lookAt(new THREE.Vector3(...currentState.target));
        camera.fov = currentState.fov;
        camera.updateProjectionMatrix();
      }
    }
  };
  
  // Set target position
  const setTarget = (target: [number, number, number]): void => {
    currentState.target = [...target];
  };
  
  // Set camera position
  const setPosition = (position: [number, number, number]): void => {
    currentState.position = [...position];
  };
  
  // Set camera FOV
  const setFov = (fov: number): void => {
    currentState.fov = fov;
  };
  
  // Start orbiting around the current target
  const orbit = (speed: number = 0.5): void => {
    // Stop any active transition
    inTransition = false;
    targetState = null;
    
    // Setup orbit parameters
    orbitCenter = new THREE.Vector3(...currentState.target);
    orbitHeight = currentState.position[1];
    
    // Calculate current angle and radius
    const dx = currentState.position[0] - orbitCenter.x;
    const dz = currentState.position[2] - orbitCenter.z;
    orbitRadius = Math.sqrt(dx * dx + dz * dz);
    orbitAngle = Math.atan2(dz, dx);
    
    // Set orbit speed and start orbiting
    orbitSpeed = speed;
    orbiting = true;
  };
  
  // Stop orbiting
  const stopOrbit = (): void => {
    orbiting = false;
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
 * Create tracking function that updates camera to follow a target
 * @param camera The camera to control
 * @param preset The preset determining how to follow the target
 * @returns A function that updates the camera position based on target
 */
export function createCameraTracker(
  camera: THREE.Camera, 
  preset: CameraPreset = CameraPresets.TRACKING
): (targetPosition: [number, number, number]) => void {
  const followDistance = preset.followDistance || 5;
  const offset = [
    preset.position[0] / followDistance, 
    preset.position[1] / followDistance, 
    preset.position[2] / followDistance
  ];
  
  return (targetPosition: [number, number, number]) => {
    camera.position.set(
      targetPosition[0] + offset[0] * followDistance,
      targetPosition[1] + offset[1] * followDistance,
      targetPosition[2] + offset[2] * followDistance
    );
    
    camera.lookAt(
      targetPosition[0],
      targetPosition[1],
      targetPosition[2]
    );
  };
} 
/**
 * Exports for camera components
 */

export { default as BaseCamera } from './BaseCamera';

// Using ts-ignore to bypass type checking for JSX files without type declarations
// @ts-ignore
export { default as CubeCamera } from './CubeCamera.jsx';
// @ts-ignore
export { default as OrthogonalCamera } from './OrthogonalCamera.jsx';
// @ts-ignore
export { default as AdjustableCamera } from './AdjustableCamera.jsx';
// @ts-ignore
export { default as PerspectiveCamera } from './PerspectiveCamera.jsx';

// Re-export Camera presets without exposing the conflicting CameraPresets object
export {
  CameraPreset,
  getCameraPreset,
  applyCameraPreset,
  createCameraController,
  createCameraTracker
} from './CameraPresets';

// Export CameraPresets with a different name to avoid conflicts
export { CameraPresets as CameraPresetCollection } from './CameraPresets'; 
// Export camera components
export { CameraControls } from './CustomCamera';
export { default as CubeCamera } from './CubeCamera';
export { default as OrthogonalCamera } from './OrthogonalCamera';
export { default as AdjustableCamera } from './AdjustableCamera';
export { default as PerspectiveCamera } from './PerspectiveCamera';

// Export preset configurations
export const CameraPresets = {
  // Presets for different viewing angles
  FRONT: { position: [0, 1.7, 5], target: [0, 1, 0] },
  SIDE: { position: [5, 1.7, 0], target: [0, 1, 0] },
  TOP: { position: [0, 5, 0], target: [0, 0, 0] },
  PERSPECTIVE: { position: [3, 2, 3], target: [0, 1, 0] },
  TRACKING: { position: [0, 1.7, -3], target: [0, 1.2, 2] }
}; 
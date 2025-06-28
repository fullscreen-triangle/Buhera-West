/**
 * Satellite Visualization Components
 * 
 * Advanced satellite tracking and visualization system with realistic orbital mechanics:
 * 
 * 🌐 Network - Real-time satellite network with speed controls and detailed satellite info
 * 📡 StripImage - Satellite strip imaging visualization with floating spheres and 2D mapping
 * 🛰️ PathReconstruction - Individual satellite path tracking with camera controls and orbital analysis
 */

// Import satellite components
import Network from './Network.jsx';
import StripImage from './StripImage.jsx';
import PathReconstruction from './PathReconstruction.jsx';

// Export individual components
export {
  Network,
  StripImage,
  PathReconstruction
};

// Export default collection for easy import
export default {
  Network,
  StripImage,
  PathReconstruction
};

/**
 * Usage Examples:
 * 
 * // Import individual components
 * import { Network, StripImage, PathReconstruction } from '../satellites';
 * 
 * // Import all components as collection
 * import SatelliteComponents from '../satellites';
 * const NetworkView = SatelliteComponents.Network;
 * 
 * // Individual component usage
 * <Network />              // Real-time satellite network view
 * <StripImage />           // Satellite imaging with strip visualization
 * <PathReconstruction />   // Single satellite orbital path tracking
 */ 
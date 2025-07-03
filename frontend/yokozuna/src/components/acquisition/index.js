/**
 * Sensor System Components
 * 
 * Comprehensive multi-modal atmospheric sensing system with global visualization
 * Based on the revolutionary buhera-west platform sensor architecture:
 * 
 * 🛰️ Satellite GPS Differential Atmospheric Sensing
 * 🏗️ Cellular Network Load Analysis & Environmental Truth Generation  
 * 🔧 Hardware Oscillatory Harvesting & Molecular Spectrometry
 * 📡 LiDAR Atmospheric Backscatter Analysis & Aerosol Detection
 * 
 * Each component provides real-time 2D global maps with interactive controls,
 * detailed sensor information, and comprehensive atmospheric analysis capabilities.
 */

// Import all sensor map components
import SatelliteGlobalMap from './Satellite.jsx';
import CellTowerGlobalMap from './CellTower.jsx';
import HardwareGlobalMap from './Hardware.jsx';
import LidarGlobalMap from './Lidar.jsx';
import SensorDashboard from './SensorDashboard.jsx';

// Export individual components
export {
  SatelliteGlobalMap,
  CellTowerGlobalMap,
  HardwareGlobalMap,
  LidarGlobalMap,
  SensorDashboard
};

// Export default collection for easy import
export default {
  Satellite: SatelliteGlobalMap,
  CellTower: CellTowerGlobalMap,
  Hardware: HardwareGlobalMap,
  Lidar: LidarGlobalMap,
  Dashboard: SensorDashboard
};

/**
 * Usage Examples:
 * 
 * // Import individual components
 * import { SatelliteGlobalMap, CellTowerGlobalMap, SensorDashboard } from '../sensors';
 * 
 * // Import all components as collection
 * import SensorMaps from '../sensors';
 * const SatelliteMap = SensorMaps.Satellite;
 * const Dashboard = SensorMaps.Dashboard;
 * 
 * // Individual component usage
 * <SatelliteGlobalMap />
 * <CellTowerGlobalMap />
 * <HardwareGlobalMap />
 * <LidarGlobalMap />
 * 
 * // Unified dashboard with all sensor maps
 * <SensorDashboard />
 */ 
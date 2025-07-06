import * as THREE from 'three';

// Geographic and mathematical utilities
export const GeoUtils = {
  /**
   * Calculate great circle distance between two points
   */
  calculateDistance(coord1: { latitude: number; longitude: number }, coord2: { latitude: number; longitude: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Convert lat/lng to 3D coordinates
   */
  latLngToVector3(lat: number, lng: number, radius: number = 100): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
  },

  /**
   * Calculate great circle route points
   */
  calculateGreatCircleRoute(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    segments: number = 30
  ): Array<{ latitude: number; longitude: number; altitude: number }> {
    const points = [];
    const lat1 = origin.latitude * Math.PI / 180;
    const lon1 = origin.longitude * Math.PI / 180;
    const lat2 = destination.latitude * Math.PI / 180;
    const lon2 = destination.longitude * Math.PI / 180;

    for (let i = 0; i <= segments; i++) {
      const f = i / segments;
      const A = Math.sin((1 - f) * Math.PI) / Math.sin(Math.PI);
      const B = Math.sin(f * Math.PI) / Math.sin(Math.PI);
      
      const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);
      
      const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
      const lon = Math.atan2(y, x);
      
      points.push({
        latitude: lat * 180 / Math.PI,
        longitude: lon * 180 / Math.PI,
        altitude: 0
      });
    }
    
    return points;
  }
};

// Color utilities for visualizations
export const ColorUtils = {
  /**
   * Create color from HSL values
   */
  createHSLColor(h: number, s: number, l: number): THREE.Color {
    const color = new THREE.Color();
    color.setHSL(h, s, l);
    return color;
  },

  /**
   * Interpolate between two colors
   */
  interpolateColors(color1: THREE.Color, color2: THREE.Color, factor: number): THREE.Color {
    const result = color1.clone();
    result.lerp(color2, factor);
    return result;
  },

  /**
   * Get color based on value range
   */
  valueToColor(value: number, min: number, max: number, colorScheme: 'heat' | 'cold' | 'green'): THREE.Color {
    const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
    
    switch (colorScheme) {
      case 'heat':
        return this.createHSLColor(0.66 - normalized * 0.66, 0.8, 0.4 + normalized * 0.4);
      case 'cold':
        return this.createHSLColor(0.66 + normalized * 0.33, 0.8, 0.4 + normalized * 0.4);
      case 'green':
        return this.createHSLColor(0.3, 0.8, 0.3 + normalized * 0.4);
      default:
        return new THREE.Color(0.5, 0.5, 0.5);
    }
  }
};

// Time and animation utilities
export const TimeUtils = {
  /**
   * Get season name from day of year
   */
  getSeasonName(dayOfYear: number): string {
    if (dayOfYear < 80) return 'Winter';
    if (dayOfYear < 172) return 'Spring';
    if (dayOfYear < 266) return 'Summer';
    if (dayOfYear < 355) return 'Fall';
    return 'Winter';
  },

  /**
   * Get seasonal growth factor
   */
  getSeasonalGrowthFactor(currentDay: number, plantingDate: string): number {
    const plantingDay = new Date(plantingDate).getDayOfYear();
    const daysFromPlanting = (currentDay - plantingDay + 365) % 365;
    
    // Growth curve over 120 days
    return Math.min(1.0, Math.max(0.1, daysFromPlanting / 120));
  },

  /**
   * Calculate growing degree days
   */
  calculateGrowingDegreeDays(dayOfYear: number, baseTemp: number = 10): number {
    const dailyTemp = 15 + Math.sin((dayOfYear - 80) * 0.017) * 10;
    return Math.max(0, dailyTemp - baseTemp);
  },

  /**
   * Get time of day description
   */
  getTimeOfDayDescription(hour: number): string {
    if (hour < 6) return 'Night / Red-eye flights';
    if (hour < 9) return 'Morning rush';
    if (hour < 17) return 'Daytime operations';
    if (hour < 21) return 'Evening rush';
    return 'Night operations';
  },

  /**
   * Get traffic multiplier for time of day
   */
  getTrafficMultiplier(hour: number): number {
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
      return 1.5; // Peak hours
    } else if (hour >= 22 || hour <= 5) {
      return 0.3; // Red-eye flights
    } else {
      return 1.0; // Normal operations
    }
  }
};

// Agricultural calculation utilities
export const AgricultureUtils = {
  /**
   * Calculate field area from boundary coordinates
   */
  calculateFieldArea(boundaries: Array<{ latitude: number; longitude: number }>): number {
    if (boundaries.length < 3) return 0;
    
    // Simplified area calculation using shoelace formula
    let area = 0;
    for (let i = 0; i < boundaries.length; i++) {
      const j = (i + 1) % boundaries.length;
      area += boundaries[i].longitude * boundaries[j].latitude;
      area -= boundaries[j].longitude * boundaries[i].latitude;
    }
    area = Math.abs(area) / 2;
    
    // Convert to hectares (rough approximation)
    return area * 111000 * 111000 / 10000;
  },

  /**
   * Get crop growth stage height multiplier
   */
  getGrowthStageHeight(stage: string): number {
    const stageHeights: Record<string, number> = {
      'Seeding': 0.1,
      'Germination': 0.3,
      'Vegetative': 0.7,
      'Reproductive': 1.0,
      'Maturation': 0.9,
      'Harvest': 0.2,
      'Fallow': 0.1
    };
    return stageHeights[stage] || 0.5;
  },

  /**
   * Get crop growth stage color
   */
  getGrowthStageColor(stage: string): THREE.Color {
    const stageColors: Record<string, THREE.Color> = {
      'Seeding': new THREE.Color(0x8B4513), // Brown
      'Germination': new THREE.Color(0x9ACD32), // Yellow-green
      'Vegetative': new THREE.Color(0x228B22), // Forest green
      'Reproductive': new THREE.Color(0x32CD32), // Lime green
      'Maturation': new THREE.Color(0xDAA520), // Golden rod
      'Harvest': new THREE.Color(0xFFD700), // Gold
      'Fallow': new THREE.Color(0xA0522D) // Sienna
    };
    return stageColors[stage] || new THREE.Color(0x228B22);
  },

  /**
   * Get irrigation status color
   */
  getIrrigationColor(status: string): THREE.Color {
    const irrigationColors: Record<string, THREE.Color> = {
      'Rainfed': new THREE.Color(0x90EE90), // Light green
      'Irrigated': new THREE.Color(0x00FF00), // Bright green
      'DroughStressed': new THREE.Color(0xDAA520), // Golden rod
      'Flooded': new THREE.Color(0x4169E1) // Royal blue
    };
    return irrigationColors[status] || new THREE.Color(0x90EE90);
  },

  /**
   * Calculate soil health score
   */
  calculateSoilHealth(properties: { pest_pressure: number; irrigation_status: string }): number {
    const pestPressureFactor = 1 - (properties.pest_pressure / 100);
    const irrigationFactor = properties.irrigation_status === 'Irrigated' ? 1.0 : 0.8;
    return Math.min(1.0, pestPressureFactor * irrigationFactor);
  }
};

// Aviation calculation utilities
export const AviationUtils = {
  /**
   * Calculate flight altitude profile
   */
  calculateFlightAltitude(progress: number, distance: number, cruiseAltitude: number): number {
    const climbPhase = 0.15;
    const descentPhase = 0.85;
    
    if (progress < climbPhase) {
      return (progress / climbPhase) * cruiseAltitude;
    } else if (progress > descentPhase) {
      return ((1 - progress) / (1 - descentPhase)) * cruiseAltitude;
    } else {
      return cruiseAltitude;
    }
  },

  /**
   * Get traffic density color
   */
  getTrafficDensityColor(density: string): THREE.Color {
    const densityColors: Record<string, THREE.Color> = {
      'Light': new THREE.Color(0x00FF00),
      'Moderate': new THREE.Color(0xFFFF00),
      'Heavy': new THREE.Color(0xFF8000),
      'Congested': new THREE.Color(0xFF0000)
    };
    return densityColors[density] || new THREE.Color(0x00FF00);
  },

  /**
   * Get aircraft type color
   */
  getAircraftTypeColor(aircraftType: string): THREE.Color {
    const typeColors: Record<string, THREE.Color> = {
      'SmallRegional': new THREE.Color(0x87CEEB),
      'MediumRange': new THREE.Color(0x4169E1),
      'LongRange': new THREE.Color(0x0000FF),
      'WideTody': new THREE.Color(0x8A2BE2),
      'Cargo': new THREE.Color(0xFF8C00)
    };
    return typeColors[aircraftType] || new THREE.Color(0x87CEEB);
  },

  /**
   * Get aircraft dimensions for rendering
   */
  getAircraftDimensions(aircraftType: string): [number, number, number] {
    const dimensions: Record<string, [number, number, number]> = {
      'SmallRegional': [8, 2, 2],
      'MediumRange': [12, 3, 3],
      'LongRange': [16, 4, 4],
      'WideTody': [20, 5, 5],
      'Cargo': [16, 4, 6]
    };
    return dimensions[aircraftType] || [12, 3, 3];
  },

  /**
   * Get line width for aircraft type
   */
  getAircraftTypeWidth(aircraftType: string): number {
    const typeWidths: Record<string, number> = {
      'SmallRegional': 1,
      'MediumRange': 2,
      'LongRange': 3,
      'WideTody': 4,
      'Cargo': 3
    };
    return typeWidths[aircraftType] || 2;
  }
};

// Performance optimization utilities
export const PerformanceUtils = {
  /**
   * Calculate level of detail based on distance
   */
  calculateLOD(distance: number, maxDistance: number = 1000): number {
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    return Math.max(0.1, 1 - normalizedDistance);
  },

  /**
   * Frustum culling check
   */
  isInFrustum(position: THREE.Vector3, camera: THREE.Camera): boolean {
    // Simplified frustum check
    const distance = camera.position.distanceTo(position);
    return distance < 5000; // Cull objects beyond 5km
  },

  /**
   * Calculate render quality based on performance
   */
  calculateRenderQuality(fps: number, targetFPS: number = 60): number {
    if (fps >= targetFPS) return 1.0;
    if (fps >= targetFPS * 0.8) return 0.8;
    if (fps >= targetFPS * 0.6) return 0.6;
    return 0.4;
  }
};

// Data validation utilities
export const ValidationUtils = {
  /**
   * Validate coordinate bounds
   */
  isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  /**
   * Sanitize numeric value
   */
  sanitizeNumber(value: any, defaultValue: number = 0, min?: number, max?: number): number {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return defaultValue;
    
    let result = num;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    
    return result;
  },

  /**
   * Validate date string
   */
  isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
};

// Export all utilities as a single object
export const VisualizationUtils = {
  Geo: GeoUtils,
  Color: ColorUtils,
  Time: TimeUtils,
  Agriculture: AgricultureUtils,
  Aviation: AviationUtils,
  Performance: PerformanceUtils,
  Validation: ValidationUtils
};

// Extend Date prototype for day of year calculation
declare global {
  interface Date {
    getDayOfYear(): number;
  }
}

Date.prototype.getDayOfYear = function(): number {
  const start = new Date(this.getFullYear(), 0, 0);
  const diff = this.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export default VisualizationUtils; 
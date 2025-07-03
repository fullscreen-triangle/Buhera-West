import React from 'react';
import useSceneTime from '../hooks/useSceneTime';

/**
 * Example component showing how to make any component time-aware
 * This can be used as a reference for integrating time-based animations
 */
const TimeAwareComponent = ({ children }) => {
  const { 
    currentTime, 
    getTimeValue, 
    getDayNightCycle, 
    getSeasonalCycle 
  } = useSceneTime();
  
  // Example: Get sun intensity based on time of day
  const sunIntensity = getDayNightCycle();
  
  // Example: Get ambient light color based on time
  const getAmbientColor = () => {
    const dayNight = getDayNightCycle();
    
    if (dayNight > 0.8) {
      // Bright day
      return { r: 1.0, g: 0.95, b: 0.8 };
    } else if (dayNight > 0.4) {
      // Dawn/dusk
      return { r: 1.0, g: 0.6, b: 0.3 };
    } else {
      // Night
      return { r: 0.2, g: 0.2, b: 0.4 };
    }
  };
  
  // Example: Get seasonal color shifts for agriculture scenes
  const getSeasonalTint = () => {
    const season = getSeasonalCycle();
    
    if (season < 0.25) {
      // Spring - fresh green
      return { r: 0.8, g: 1.0, b: 0.8 };
    } else if (season < 0.5) {
      // Summer - bright and warm
      return { r: 1.0, g: 1.0, b: 0.9 };
    } else if (season < 0.75) {
      // Autumn - warm oranges
      return { r: 1.0, g: 0.8, b: 0.6 };
    } else {
      // Winter - cool blues
      return { r: 0.9, g: 0.9, b: 1.0 };
    }
  };
  
  const ambientColor = getAmbientColor();
  const seasonalTint = getSeasonalTint();
  
  // Create CSS custom properties that child components can use
  const timeAwareStyle = {
    '--sun-intensity': sunIntensity,
    '--ambient-r': ambientColor.r,
    '--ambient-g': ambientColor.g,
    '--ambient-b': ambientColor.b,
    '--seasonal-r': seasonalTint.r,
    '--seasonal-g': seasonalTint.g,
    '--seasonal-b': seasonalTint.b,
    '--current-time': currentTime,
    '--time-progress': currentTime / 86400
  };
  
  return (
    <div style={timeAwareStyle} className="time-aware-container">
      {children}
    </div>
  );
};

/**
 * Hook for accessing time-aware CSS variables in any component
 */
export const useTimeAwareStyle = () => {
  const { currentTime, getDayNightCycle, getSeasonalCycle } = useSceneTime();
  
  return {
    sunIntensity: getDayNightCycle(),
    currentTime,
    timeProgress: currentTime / 86400,
    seasonalProgress: getSeasonalCycle(),
    // Helper function to create time-based gradients
    getTimeGradient: (dayColor, nightColor) => {
      const dayNight = getDayNightCycle();
      return `linear-gradient(to bottom, 
        rgba(${nightColor}, ${1 - dayNight}), 
        rgba(${dayColor}, ${dayNight})
      )`;
    }
  };
};

export default TimeAwareComponent; 
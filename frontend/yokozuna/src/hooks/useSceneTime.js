import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTime } from '../contexts/TimeContext';

/**
 * Hook to automatically set the appropriate time scene based on the current page
 */
const useSceneTime = () => {
  const router = useRouter();
  const { setScene, currentTime } = useTime();
  
  useEffect(() => {
    const path = router.pathname;
    
    // Determine scene based on current route
    if (path.includes('/weather') || path.includes('/atmosphere')) {
      setScene('weather');
    } else if (path.includes('/agriculture') || path.includes('/crops')) {
      setScene('agriculture');
    } else if (path.includes('/oceanography') || path.includes('/agulhas') || path.includes('/benguela')) {
      setScene('oceanography');
    } else if (path.includes('/geology') || path.includes('/geography')) {
      setScene('geology');
    } else {
      // Default scene for other pages (24 hour cycle)
      setScene('weather');
    }
  }, [router.pathname, setScene]);
  
  // Return current time value and scene info for components to use
  return {
    currentTime,
    normalizedTime: currentTime, // Components can use this to sync their animations
    // Utility function for getting time-based values
    getTimeValue: (min, max) => {
      const progress = currentTime / 86400; // Normalize to 24 hours
      return min + (max - min) * progress;
    },
    // Get day/night cycle value (0 = night, 1 = day)
    getDayNightCycle: () => {
      const hourInDay = (currentTime % 86400) / 86400;
      return Math.sin(hourInDay * Math.PI); // Sine wave for smooth day/night transition
    },
    // Get seasonal value for agriculture scenes (0-1 through the year)
    getSeasonalCycle: () => {
      return (currentTime % 31536000) / 31536000; // Normalize to 1 year
    }
  };
};

export default useSceneTime; 
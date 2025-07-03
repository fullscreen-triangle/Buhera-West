import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const TimeContext = createContext();

/**
 * Global Time Provider for managing timeline state across the entire application
 */
export const TimeProvider = ({ children }) => {
  // Core time state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(86400); // 24 hours in seconds as default
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // UI state
  const [showTimeControls, setShowTimeControls] = useState(false);
  const [timeControlsPosition, setTimeControlsPosition] = useState('bottom');
  const [timeFormat, setTimeFormat] = useState('hms'); // 'hms', 'relative', 'datetime'
  
  // Animation and loop state
  const [isLooping, setIsLooping] = useState(true);
  const [markers, setMarkers] = useState([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());
  
  // Time range for different scenes
  const [timeRange, setTimeRange] = useState({
    min: 0,
    max: 86400,
    step: 1
  });
  
  // Scene-specific time configurations
  const [sceneConfigs, setSceneConfigs] = useState({
    weather: {
      duration: 86400, // 24 hours
      markers: [
        { time: 21600, label: 'Dawn', color: '#ffaa00' },
        { time: 43200, label: 'Noon', color: '#ffff00' },
        { time: 64800, label: 'Dusk', color: '#ff6600' }
      ]
    },
    agriculture: {
      duration: 31536000, // 1 year
      markers: [
        { time: 7776000, label: 'Spring', color: '#00ff00' },
        { time: 15552000, label: 'Summer', color: '#ffff00' },
        { time: 23328000, label: 'Autumn', color: '#ff8800' },
        { time: 31104000, label: 'Winter', color: '#0088ff' }
      ]
    },
    oceanography: {
      duration: 2628000, // 1 month
      markers: [
        { time: 604800, label: 'Week 1', color: '#0066cc' },
        { time: 1209600, label: 'Week 2', color: '#0088ff' },
        { time: 1814400, label: 'Week 3', color: '#00aaff' },
        { time: 2419200, label: 'Week 4', color: '#00ccff' }
      ]
    },
    geology: {
      duration: 315360000, // 10 years
      markers: [
        { time: 31536000, label: 'Year 1', color: '#8b4513' },
        { time: 157680000, label: 'Year 5', color: '#a0522d' },
        { time: 315360000, label: 'Year 10', color: '#cd853f' }
      ]
    }
  });
  
  // Animation loop
  const startAnimation = useCallback(() => {
    if (animationRef.current) return;
    
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      
      setCurrentTime(prevTime => {
        const newTime = prevTime + (deltaTime * playbackRate);
        
        if (newTime >= duration) {
          if (isLooping) {
            return 0;
          } else {
            setIsPlaying(false);
            return duration;
          }
        }
        
        if (newTime < 0) {
          return isLooping ? duration : 0;
        }
        
        return newTime;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    lastTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(animate);
  }, [duration, playbackRate, isLooping]);
  
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);
  
  // Playback controls
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);
  
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);
  
  const toggle = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  const seek = useCallback((time) => {
    const clampedTime = Math.max(timeRange.min, Math.min(timeRange.max, time));
    setCurrentTime(clampedTime);
  }, [timeRange]);
  
  const reset = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);
  
  const skipForward = useCallback((seconds = 5) => {
    seek(currentTime + seconds);
  }, [currentTime, seek]);
  
  const skipBackward = useCallback((seconds = 5) => {
    seek(currentTime - seconds);
  }, [currentTime, seek]);
  
  // Scene management
  const setScene = useCallback((sceneName) => {
    const config = sceneConfigs[sceneName];
    if (config) {
      setDuration(config.duration);
      setMarkers(config.markers);
      setTimeRange({
        min: 0,
        max: config.duration,
        step: config.duration > 86400 ? 3600 : 1 // Hourly steps for long durations
      });
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [sceneConfigs]);
  
  // Time formatting
  const formatTime = useCallback((timeInSeconds, format = timeFormat) => {
    switch (format) {
      case 'hms':
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      case 'relative':
        if (timeInSeconds < 60) return `${Math.floor(timeInSeconds)}s`;
        if (timeInSeconds < 3600) return `${Math.floor(timeInSeconds / 60)}m`;
        if (timeInSeconds < 86400) return `${Math.floor(timeInSeconds / 3600)}h`;
        return `${Math.floor(timeInSeconds / 86400)}d`;
      
      case 'datetime':
        const date = new Date(timeInSeconds * 1000);
        return date.toLocaleString();
      
      default:
        return timeInSeconds.toFixed(1);
    }
  }, [timeFormat]);
  
  // Effects
  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }
    
    return stopAnimation;
  }, [isPlaying, startAnimation, stopAnimation]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle if time controls are visible and no input is focused
      if (!showTimeControls || 
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement ||
          document.activeElement instanceof HTMLSelectElement) {
        return;
      }
      
      switch (event.key) {
        case ' ':
          event.preventDefault();
          toggle();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (event.shiftKey) {
            skipForward(30);
          } else {
            skipForward(5);
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (event.shiftKey) {
            skipBackward(30);
          } else {
            skipBackward(5);
          }
          break;
        case 'Home':
          event.preventDefault();
          reset();
          break;
        case 'End':
          event.preventDefault();
          seek(duration);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showTimeControls, toggle, skipForward, skipBackward, reset, seek, duration]);
  
  const value = {
    // Time state
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    timeRange,
    markers,
    isLooping,
    
    // UI state
    showTimeControls,
    timeControlsPosition,
    timeFormat,
    
    // Controls
    play,
    pause,
    toggle,
    seek,
    reset,
    skipForward,
    skipBackward,
    setCurrentTime,
    setDuration,
    setPlaybackRate,
    setIsLooping,
    
    // UI controls
    setShowTimeControls,
    setTimeControlsPosition,
    setTimeFormat,
    
    // Scene management
    setScene,
    sceneConfigs,
    setSceneConfigs,
    
    // Utilities
    formatTime,
    
    // Markers
    setMarkers,
    addMarker: (marker) => setMarkers(prev => [...prev, marker]),
    removeMarker: (index) => setMarkers(prev => prev.filter((_, i) => i !== index))
  };
  
  return (
    <TimeContext.Provider value={value}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTime = () => {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
};

export default TimeContext; 
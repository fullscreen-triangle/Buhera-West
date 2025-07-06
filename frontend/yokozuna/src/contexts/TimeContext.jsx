import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import satelliteAtomicTimeService from '../services/atomicTimeService.js';
import nasaESATimingService from '../services/nasaESATimingService.js';
import enhancedTemporalDataManager from '../services/temporalDataManager.js';

const TimeContext = createContext();

/**
 * Enhanced Global Time Provider with Atomic Clock Integration
 * Manages timeline state with precise time synchronization and data filtering
 */
export const TimeProvider = ({ children }) => {
  // Core time state (now using atomic time)
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(86400000); // 24 hours in milliseconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // UI state
  const [showTimeControls, setShowTimeControls] = useState(false);
  const [timeControlsPosition, setTimeControlsPosition] = useState('bottom');
  const [timeFormat, setTimeFormat] = useState('datetime'); // 'hms', 'relative', 'datetime'
  
  // Animation and loop state
  const [isLooping, setIsLooping] = useState(true);
  const [markers, setMarkers] = useState([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());
  
  // Atomic time integration
  const [syncQuality, setSyncQuality] = useState(null);
  const [isAtomicTimeSynced, setIsAtomicTimeSynced] = useState(false);
  
  // Time range for different scenes (in milliseconds)
  const [timeRange, setTimeRange] = useState({
    min: 0,
    max: 86400000, // 24 hours
    step: 1000 // 1 second
  });
  
  // Scene-specific time configurations (updated to milliseconds)
  const [sceneConfigs, setSceneConfigs] = useState({
    weather: {
      duration: 86400000, // 24 hours in milliseconds
      markers: [
        { time: 21600000, label: 'Dawn', color: '#ffaa00' },
        { time: 43200000, label: 'Noon', color: '#ffff00' },
        { time: 64800000, label: 'Dusk', color: '#ff6600' }
      ]
    },
    agriculture: {
      duration: 31536000000, // 1 year in milliseconds
      markers: [
        { time: 7776000000, label: 'Spring', color: '#00ff00' },
        { time: 15552000000, label: 'Summer', color: '#ffff00' },
        { time: 23328000000, label: 'Autumn', color: '#ff8800' },
        { time: 31104000000, label: 'Winter', color: '#0088ff' }
      ]
    },
    oceanography: {
      duration: 2628000000, // 1 month in milliseconds
      markers: [
        { time: 604800000, label: 'Week 1', color: '#0066cc' },
        { time: 1209600000, label: 'Week 2', color: '#0088ff' },
        { time: 1814400000, label: 'Week 3', color: '#00aaff' },
        { time: 2419200000, label: 'Week 4', color: '#00ccff' }
      ]
    },
    geology: {
      duration: 315360000000, // 10 years in milliseconds
      markers: [
        { time: 31536000000, label: 'Year 1', color: '#8b4513' },
        { time: 157680000000, label: 'Year 5', color: '#a0522d' },
        { time: 315360000000, label: 'Year 10', color: '#cd853f' }
      ]
    }
  });
  
  // Initialize satellite-based atomic time services and data streams
  useEffect(() => {
    const initializeSatelliteServices = async () => {
      try {
        console.log('🛰️  Initializing Satellite-Based Atomic Time Services...');
        
        // Initialize satellite atomic time service
        await satelliteAtomicTimeService.initializeSatelliteTracking();
        
        // Initialize NASA/ESA timing service
        await nasaESATimingService.initialize();
        
        // Initialize enhanced temporal data manager
        await enhancedTemporalDataManager.initializeSatelliteIntegration();
        
        // Get initial atomic time from best available satellite constellation
        const [satelliteTime, nasaESATime] = await Promise.allSettled([
          satelliteAtomicTimeService.getAtomicTime(),
          nasaESATimingService.getAtomicTime()
        ]);
        
        // Use the best available timing source
        const bestTiming = satelliteTime.status === 'fulfilled' ? satelliteTime.value : 
                          nasaESATime.status === 'fulfilled' ? nasaESATime.value : null;
        
        if (bestTiming) {
          const atomicTime = bestTiming.atomicTime || bestTiming.timestamp;
          setCurrentTime(atomicTime);
          
          // Update sync quality with satellite constellation data
          const quality = {
            precision: 'satellite_atomic',
            source: bestTiming.sourceConstellation || bestTiming.source,
            accuracy: bestTiming.uncertainty || bestTiming.accuracy,
            networkLatency: bestTiming.networkLatency,
            triangulationQuality: bestTiming.triangulationQuality,
            reconstructionAccuracy: bestTiming.reconstructionAccuracy,
            satelliteCount: bestTiming.satelliteCount || 0,
            constellationsActive: Object.keys(bestTiming.constellationStatus || {}).length
          };
          
          setSyncQuality(quality);
          setIsAtomicTimeSynced(true);
          
          console.log('✅ Satellite Atomic Time Services initialized');
          console.log(`🛰️  Source: ${quality.source}`);
          console.log(`⏰ Current atomic time: ${new Date(atomicTime).toISOString()}`);
          console.log(`📊 Satellites: ${quality.satelliteCount}, Quality: ${quality.triangulationQuality?.toFixed(2) || 'N/A'}`);
        } else {
          throw new Error('No satellite timing sources available');
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize satellite atomic time services:', error);
        // Fallback to local time
        setCurrentTime(Date.now());
        setIsAtomicTimeSynced(false);
        setSyncQuality({
          precision: 'local',
          source: 'system_clock',
          accuracy: null,
          networkLatency: null,
          triangulationQuality: 0,
          reconstructionAccuracy: 0,
          satelliteCount: 0,
          constellationsActive: 0
        });
      }
    };
    
    initializeSatelliteServices();
    
    // Set up periodic sync with satellite atomic clocks
    const syncInterval = setInterval(async () => {
      try {
        const [satelliteTime, nasaESATime, timingQuality] = await Promise.allSettled([
          satelliteAtomicTimeService.getAtomicTime(),
          nasaESATimingService.getAtomicTime(),
          satelliteAtomicTimeService.getTimingQuality ? satelliteAtomicTimeService.getTimingQuality() : Promise.resolve({})
        ]);
        
        // Use the best available timing source
        const bestTiming = satelliteTime.status === 'fulfilled' ? satelliteTime.value : 
                          nasaESATime.status === 'fulfilled' ? nasaESATime.value : null;
        
        if (bestTiming) {
          const quality = {
            precision: 'satellite_atomic',
            source: bestTiming.sourceConstellation || bestTiming.source,
            accuracy: bestTiming.uncertainty || bestTiming.accuracy,
            networkLatency: bestTiming.networkLatency,
            triangulationQuality: bestTiming.triangulationQuality,
            reconstructionAccuracy: bestTiming.reconstructionAccuracy,
            satelliteCount: bestTiming.satelliteCount || 0,
            constellationsActive: Object.keys(bestTiming.constellationStatus || {}).length,
            lastSync: Date.now()
          };
          
          setSyncQuality(quality);
          setIsAtomicTimeSynced(true);
          
          console.log(`🔄 Satellite time sync updated: ${quality.source} (${quality.precision})`);
        }
      } catch (error) {
        console.error('Satellite atomic time sync failed:', error);
      }
    }, 30000); // Sync every 30 seconds
    
    return () => {
      clearInterval(syncInterval);
    };
  }, []);
  
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
  
  const seek = useCallback(async (time) => {
    const clampedTime = Math.max(timeRange.min, Math.min(timeRange.max, time));
    setCurrentTime(clampedTime);
    
    // Update enhanced temporal data manager with new time
    try {
      // Get precise atomic time for the seek operation
      const atomicTiming = await satelliteAtomicTimeService.getAtomicTime();
      const atomicTime = atomicTiming.timestamp || atomicTiming.atomicTime;
      
      // Calculate time offset from atomic time
      const timeOffset = clampedTime - atomicTime;
      
      // Update all registered data streams with the new time
      const activeStreams = enhancedTemporalDataManager.dataStreams;
      if (activeStreams && activeStreams.size > 0) {
        const updatePromises = Array.from(activeStreams.keys()).map(streamId => 
          enhancedTemporalDataManager.filterDataByTime(streamId, clampedTime - 1000, clampedTime + 1000)
        );
        
        await Promise.allSettled(updatePromises);
        console.log(`⏰ Time seek completed: ${new Date(clampedTime).toISOString()}`);
        console.log(`🛰️  Atomic time offset: ${timeOffset}ms`);
      }
    } catch (error) {
      console.error('Failed to update temporal data manager:', error);
    }
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
  
  // Time formatting (updated for milliseconds)
  const formatTime = useCallback((timeInMs, format = timeFormat) => {
    const timeInSeconds = timeInMs / 1000;
    
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
        const date = new Date(timeInMs);
        return date.toLocaleString();
      
      case 'precise':
        const preciseDate = new Date(timeInMs);
        return preciseDate.toISOString();
      
      default:
        return timeInSeconds.toFixed(1);
    }
  }, [timeFormat]);
  
  // Get atomic time
  const getAtomicTime = useCallback(() => {
    return isAtomicTimeSynced ? atomicTimeService.getAtomicTime() : Date.now();
  }, [isAtomicTimeSynced]);
  
  // Get precise atomic time
  const getPreciseAtomicTime = useCallback(() => {
    return isAtomicTimeSynced ? atomicTimeService.getPreciseAtomicTime() : performance.now() + Date.now();
  }, [isAtomicTimeSynced]);
  
  // Data stream management
  const registerDataStream = useCallback((streamId, config) => {
    if (temporalDataManager.isInitialized) {
      return temporalDataManager.registerDataStream(streamId, config);
    }
    throw new Error('Temporal Data Manager not initialized');
  }, []);
  
  const addDataPoints = useCallback((streamId, dataPoints) => {
    if (temporalDataManager.isInitialized) {
      temporalDataManager.addDataPoints(streamId, dataPoints);
    }
  }, []);
  
  const getDataAtTime = useCallback((streamId, time = currentTime) => {
    if (temporalDataManager.isInitialized) {
      return temporalDataManager.getDataAtTime(streamId, time);
    }
    return null;
  }, [currentTime]);
  
  const getDataInRange = useCallback((streamId, startTime, endTime) => {
    if (temporalDataManager.isInitialized) {
      return temporalDataManager.getDataInRange(streamId, startTime, endTime);
    }
    return [];
  }, []);
  
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
    
    // Atomic time integration
    isAtomicTimeSynced,
    syncQuality,
    getAtomicTime,
    getPreciseAtomicTime,
    
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
    
    // Data stream management
    registerDataStream,
    addDataPoints,
    getDataAtTime,
    getDataInRange,
    
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
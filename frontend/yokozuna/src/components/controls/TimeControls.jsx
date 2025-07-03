import React, { useCallback, useEffect, useState } from 'react';
import { usePlayback } from '../../store';
import { useThrottledCallback, useDebounceCallback } from '../../utils/optimizations';

/**
 * TimeControls component provides playback controls for animations and simulations
 * 
 * @example
 * ```jsx
 * <TimeControls 
 *   showPlayPause={true}
 *   showTimeSlider={true}
 *   showTimeDisplay={true}
 *   showSpeedControls={true}
 * />
 * ```
 */
const TimeControls = ({
  showPlayPause = true,
  showTimeSlider = true,
  showTimeDisplay = true,
  showSpeedControls = false,
  className = '',
  style = {}
}) => {
  // Get playback state and actions from store
  const { isPlaying, currentTime, duration, play, pause, setTime, reset } = usePlayback();
  
  // Local state for playback speed
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  // Throttle and debounce time slider changes for better performance
  const throttledSetTime = useThrottledCallback(setTime, 50);
  const debouncedReset = useDebounceCallback(reset, 300);
  
  // Format time for display (convert seconds to MM:SS format)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);
  
  // Handle time slider change
  const handleTimeChange = useCallback((e) => {
    const newTime = parseFloat(e.target.value);
    throttledSetTime(newTime);
  }, [throttledSetTime]);
  
  // Handle speed change
  const handleSpeedChange = useCallback((speed) => {
    setPlaybackSpeed(speed);
    // Update global playback speed
    // This would need to be implemented in the store
  }, []);
  
  // Reset to beginning
  const handleReset = useCallback(() => {
    debouncedReset();
  }, [debouncedReset]);
  
  // Default styles for the controls
  const defaultStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '4px',
    color: 'white',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    ...style
  };
  
  const buttonStyle = {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '4px',
    color: 'white',
    padding: '8px 12px',
    margin: '0 8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    outline: 'none',
  };
  
  const sliderStyle = {
    flexGrow: 1,
    margin: '0 12px',
    cursor: 'pointer',
  };
  
  return (
    <div style={defaultStyle} className={`time-controls ${className}`}>
      {showPlayPause && (
        <button 
          style={buttonStyle} 
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
      )}
      
      {showTimeSlider && (
        <input
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={currentTime}
          onChange={handleTimeChange}
          style={sliderStyle}
          aria-label="Time slider"
        />
      )}
      
      {showTimeDisplay && (
        <div style={{ margin: '0 8px' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      )}
      
      {showSpeedControls && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            style={buttonStyle} 
            onClick={() => handleSpeedChange(0.5)}
            disabled={playbackSpeed === 0.5}
            aria-label="Half speed"
          >
            0.5x
          </button>
          <button 
            style={buttonStyle} 
            onClick={() => handleSpeedChange(1.0)}
            disabled={playbackSpeed === 1.0}
            aria-label="Normal speed"
          >
            1.0x
          </button>
          <button 
            style={buttonStyle} 
            onClick={() => handleSpeedChange(2.0)}
            disabled={playbackSpeed === 2.0}
            aria-label="Double speed"
          >
            2.0x
          </button>
        </div>
      )}
      
      <button 
        style={buttonStyle} 
        onClick={handleReset}
        aria-label="Reset"
      >
        ↺
      </button>
    </div>
  );
};

export default TimeControls; 
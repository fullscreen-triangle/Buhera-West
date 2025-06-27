import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaBackward,
  FaForward,
  FaExpand,
  FaCompress
} from 'react-icons/fa';

interface TimelineControlsProps {
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration of the timeline in seconds */
  duration: number;
  /** Whether playback is currently active */
  playing: boolean;
  /** Frame rate for frame-by-frame navigation */
  fps?: number;
  /** Callback when play/pause is toggled */
  onPlayPause?: () => void;
  /** Callback when the time is changed */
  onTimeChange?: (time: number) => void;
  /** Callback when timeline is skipped to a specific position */
  onSeek?: (time: number) => void;
  /** Custom time formatter function */
  formatTime?: (time: number) => string;
  /** Whether to show full screen toggle button */
  showFullscreenToggle?: boolean;
  /** Whether to show time display */
  showTimeDisplay?: boolean;
  /** Whether to show frame-by-frame controls */
  showFrameControls?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Whether the timeline should be disabled */
  disabled?: boolean;
  /** Element to toggle fullscreen on (defaults to parent element) */
  fullscreenTarget?: React.RefObject<HTMLElement>;
  /** Array of marker positions in seconds */
  markers?: Array<{ time: number; label?: string; color?: string }>;
  /** Playback rate - 1.0 is normal speed */
  playbackRate?: number;
  /** Callback when playback rate changes */
  onPlaybackRateChange?: (rate: number) => void;
  /** Min time in seconds */
  minTime?: number;
  /** Max time in seconds */
  maxTime?: number;
}

/**
 * Timeline controls component for video playback
 */
const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentTime,
  duration,
  playing,
  fps = 30,
  onPlayPause,
  onTimeChange,
  onSeek,
  formatTime,
  showFullscreenToggle = true,
  showTimeDisplay = true,
  showFrameControls = true,
  className = '',
  disabled = false,
  fullscreenTarget,
  markers = [],
  playbackRate = 1.0,
  onPlaybackRateChange,
  minTime = 0,
  maxTime,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Set max time to duration if not explicitly set
  const effectiveMaxTime = maxTime !== undefined ? maxTime : duration;
  
  // Format time display
  const formatTimeDisplay = useCallback((timeInSeconds: number) => {
    if (formatTime) {
      return formatTime(timeInSeconds);
    }
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const frames = Math.floor((timeInSeconds % 1) * fps);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  }, [formatTime, fps]);
  
  // Handle play/pause toggle
  const handlePlayPause = useCallback(() => {
    if (disabled) return;
    if (onPlayPause) onPlayPause();
  }, [onPlayPause, disabled]);
  
  // Handle timeline slider change
  const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newTime = parseFloat(event.target.value);
    if (onTimeChange) onTimeChange(newTime);
  }, [onTimeChange, disabled]);
  
  // Handle slider drag start/end
  const handleSliderDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  const handleSliderDragEnd = useCallback(() => {
    setIsDragging(false);
    if (sliderRef.current && onSeek) {
      onSeek(parseFloat(sliderRef.current.value));
    }
  }, [onSeek]);
  
  // Frame stepping controls
  const handleStepForward = useCallback(() => {
    if (disabled) return;
    const frameDuration = 1 / fps;
    const newTime = Math.min(effectiveMaxTime, currentTime + frameDuration);
    if (onSeek) onSeek(newTime);
  }, [currentTime, effectiveMaxTime, fps, onSeek, disabled]);
  
  const handleStepBackward = useCallback(() => {
    if (disabled) return;
    const frameDuration = 1 / fps;
    const newTime = Math.max(minTime, currentTime - frameDuration);
    if (onSeek) onSeek(newTime);
  }, [currentTime, minTime, fps, onSeek, disabled]);
  
  // Skip forward/backward (5 seconds)
  const handleSkipForward = useCallback(() => {
    if (disabled) return;
    const newTime = Math.min(effectiveMaxTime, currentTime + 5);
    if (onSeek) onSeek(newTime);
  }, [currentTime, effectiveMaxTime, onSeek, disabled]);
  
  const handleSkipBackward = useCallback(() => {
    if (disabled) return;
    const newTime = Math.max(minTime, currentTime - 5);
    if (onSeek) onSeek(newTime);
  }, [currentTime, minTime, onSeek, disabled]);
  
  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (disabled) return;
    
    const target = fullscreenTarget?.current || containerRef.current?.parentElement;
    if (!target) return;
    
    if (!isFullscreen) {
      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if ((target as any).webkitRequestFullscreen) {
        (target as any).webkitRequestFullscreen();
      } else if ((target as any).msRequestFullscreen) {
        (target as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }, [isFullscreen, fullscreenTarget, disabled]);
  
  // Detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled || event.repeat) return;
      
      // Ignore if focus is on an input, textarea, or select
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }
      
      switch (event.key) {
        case ' ':
          // Space bar toggles play/pause
          event.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowRight':
          // Right arrow steps forward
          event.preventDefault();
          if (event.shiftKey) {
            handleSkipForward();
          } else {
            handleStepForward();
          }
          break;
        case 'ArrowLeft':
          // Left arrow steps backward
          event.preventDefault();
          if (event.shiftKey) {
            handleSkipBackward();
          } else {
            handleStepBackward();
          }
          break;
        case 'f':
          // F key toggles fullscreen
          if (showFullscreenToggle) {
            event.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    disabled,
    handlePlayPause,
    handleStepForward,
    handleStepBackward,
    handleSkipForward,
    handleSkipBackward,
    toggleFullscreen,
    showFullscreenToggle
  ]);
  
  // Playback rate options
  const playbackRates = useMemo(() => [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 4.0], []);
  
  const handlePlaybackRateChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRate = parseFloat(event.target.value);
    if (onPlaybackRateChange) onPlaybackRateChange(newRate);
  }, [onPlaybackRateChange]);
  
  // Calculate timeline markers
  const timelineMarkers = useMemo(() => {
    return markers.map(marker => ({
      ...marker,
      position: `${(marker.time / duration) * 100}%`,
      color: marker.color || '#ff0000'
    }));
  }, [markers, duration]);
  
  return (
    <div 
      ref={containerRef}
      className={`timeline-controls ${className} ${disabled ? 'disabled' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: '8px',
        backgroundColor: '#222',
        borderRadius: '4px',
        color: '#fff',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto'
      }}
    >
      {/* Timeline slider */}
      <div className="timeline-slider-container" style={{ position: 'relative', margin: '4px 0' }}>
        {/* Markers */}
        {timelineMarkers.map((marker, index) => (
          <div 
            key={`marker-${index}`}
            className="timeline-marker"
            title={marker.label}
            style={{
              position: 'absolute',
              left: marker.position,
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: marker.color,
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        ))}
        
        <input
          ref={sliderRef}
          type="range"
          min={minTime}
          max={effectiveMaxTime}
          step={1 / fps}
          value={currentTime}
          onChange={handleSliderChange}
          onMouseDown={handleSliderDragStart}
          onMouseUp={handleSliderDragEnd}
          onTouchStart={handleSliderDragStart}
          onTouchEnd={handleSliderDragEnd}
          style={{
            width: '100%',
            height: '16px',
            background: '#444',
            borderRadius: '8px',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
      </div>
      
      {/* Controls row */}
      <div 
        className="timeline-controls-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px'
        }}
      >
        <div className="timeline-left-controls" style={{ display: 'flex', alignItems: 'center' }}>
          {/* Skip backward */}
          <button
            onClick={handleSkipBackward}
            title="Skip backward 5 seconds"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '16px',
              padding: '4px',
              marginRight: '4px'
            }}
          >
            <FaBackward />
          </button>
          
          {/* Step backward */}
          {showFrameControls && (
            <button
              onClick={handleStepBackward}
              title="Previous frame"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '16px',
                padding: '4px',
                marginRight: '4px'
              }}
            >
              <FaStepBackward />
            </button>
          )}
          
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            title={playing ? 'Pause' : 'Play'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '20px',
              padding: '4px',
              marginRight: '4px'
            }}
          >
            {playing ? <FaPause /> : <FaPlay />}
          </button>
          
          {/* Step forward */}
          {showFrameControls && (
            <button
              onClick={handleStepForward}
              title="Next frame"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '16px',
                padding: '4px',
                marginRight: '4px'
              }}
            >
              <FaStepForward />
            </button>
          )}
          
          {/* Skip forward */}
          <button
            onClick={handleSkipForward}
            title="Skip forward 5 seconds"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '16px',
              padding: '4px',
              marginRight: '12px'
            }}
          >
            <FaForward />
          </button>
          
          {/* Playback rate */}
          <div className="playback-rate-control" style={{ marginLeft: '8px' }}>
            <select
              value={playbackRate}
              onChange={handlePlaybackRateChange}
              style={{
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '4px',
                fontSize: '12px'
              }}
            >
              {playbackRates.map(rate => (
                <option key={rate} value={rate}>
                  {rate}x
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="timeline-right-controls" style={{ display: 'flex', alignItems: 'center' }}>
          {/* Time display */}
          {showTimeDisplay && (
            <div className="time-display" style={{ marginRight: '12px', fontSize: '14px' }}>
              <span>{formatTimeDisplay(currentTime)}</span>
              <span style={{ margin: '0 4px' }}>/</span>
              <span>{formatTimeDisplay(duration)}</span>
            </div>
          )}
          
          {/* Fullscreen toggle */}
          {showFullscreenToggle && (
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '16px',
                padding: '4px'
              }}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineControls; 
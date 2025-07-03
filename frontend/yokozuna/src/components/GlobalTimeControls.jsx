import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTime } from '../contexts/TimeContext';
import { FaPlay, FaPause, FaExpand, FaCompress, FaTimes, FaCog } from 'react-icons/fa';

/**
 * Global Time Controls with glassmorphism design
 * Can be shown/hidden on any page and provides timeline scrubbing functionality
 */
const GlobalTimeControls = () => {
  const {
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    markers,
    showTimeControls,
    timeControlsPosition,
    play,
    pause,
    seek,
    setPlaybackRate,
    setShowTimeControls,
    formatTime,
    skipForward,
    skipBackward,
    reset
  } = useTime();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  
  // Handle timeline slider changes
  const handleSliderChange = useCallback((event) => {
    const newTime = parseFloat(event.target.value);
    seek(newTime);
  }, [seek]);
  
  const handleSliderMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Playback rate options
  const playbackRates = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 4.0];
  
  // Calculate timeline markers positions
  const timelineMarkers = markers.map(marker => ({
    ...marker,
    position: `${(marker.time / duration) * 100}%`
  }));
  
  // Handle click outside to close settings
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);
  
  if (!showTimeControls) return null;
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div
      ref={containerRef}
      className={`global-time-controls ${timeControlsPosition} ${isExpanded ? 'expanded' : 'minimal'}`}
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: isExpanded ? '90%' : '60%',
        maxWidth: isExpanded ? '1200px' : '800px',
        minWidth: '300px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: isExpanded ? '16px' : '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(timeControlsPosition === 'bottom' && {
          bottom: '16px',
        }),
        ...(timeControlsPosition === 'top' && {
          top: '16px',
        })
      }}
    >
      {/* Close button */}
      <button
        onClick={() => setShowTimeControls(false)}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          opacity: 0.7,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        <FaTimes />
      </button>
      
      {/* Timeline Container */}
      <div className="timeline-container" style={{ marginBottom: isExpanded ? '12px' : '8px' }}>
        {/* Progress Track */}
        <div
          style={{
            position: 'relative',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            margin: '8px 0',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            seek(percentage * duration);
          }}
        >
          {/* Progress Fill */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00a8ff, #0078ff)',
              borderRadius: '4px',
              transition: isDragging ? 'none' : 'width 0.1s ease'
            }}
          />
          
          {/* Timeline Markers */}
          {timelineMarkers.map((marker, index) => (
            <div
              key={index}
              title={marker.label}
              style={{
                position: 'absolute',
                left: marker.position,
                top: '-2px',
                width: '3px',
                height: '12px',
                background: marker.color || '#ffffff',
                borderRadius: '1px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                pointerEvents: 'none'
              }}
            />
          ))}
          
          {/* Playhead */}
          <div
            style={{
              position: 'absolute',
              left: `${progress}%`,
              top: '-4px',
              width: '16px',
              height: '16px',
              background: 'white',
              borderRadius: '50%',
              transform: 'translateX(-50%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              cursor: 'grab',
              border: '2px solid #0078ff'
            }}
          />
        </div>
        
        {/* Hidden range input for precise control */}
        <input
          ref={sliderRef}
          type="range"
          min={0}
          max={duration}
          step={duration > 86400 ? 60 : 1}
          value={currentTime}
          onChange={handleSliderChange}
          onMouseDown={handleSliderMouseDown}
          onMouseUp={handleSliderMouseUp}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        />
      </div>
      
      {/* Controls Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Play/Pause */}
          <button
            onClick={isPlaying ? pause : play}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          
          {/* Skip Controls */}
          {isExpanded && (
            <>
              <button
                onClick={() => skipBackward(10)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  opacity: 0.8,
                  padding: '4px 8px'
                }}
              >
                ⏪
              </button>
              <button
                onClick={() => skipForward(10)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  opacity: 0.8,
                  padding: '4px 8px'
                }}
              >
                ⏩
              </button>
              <button
                onClick={reset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  opacity: 0.8,
                  padding: '4px 8px'
                }}
              >
                ↺
              </button>
            </>
          )}
        </div>
        
        {/* Center - Time Display */}
        <div style={{
          color: 'white',
          fontSize: isExpanded ? '14px' : '12px',
          fontFamily: 'monospace',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        
        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Playback Rate */}
          {isExpanded && (
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                color: 'white',
                fontSize: '11px',
                padding: '4px 6px'
              }}
            >
              {playbackRates.map(rate => (
                <option key={rate} value={rate} style={{ background: '#333', color: 'white' }}>
                  {rate}×
                </option>
              ))}
            </select>
          )}
          
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}
          >
            <FaCog />
          </button>
          
          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}
          >
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          minWidth: '200px',
          color: 'white',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Timeline Settings</div>
          <div style={{ marginBottom: '4px' }}>Playback Rate: {playbackRate}×</div>
          <div style={{ marginBottom: '4px' }}>Duration: {formatTime(duration)}</div>
          <div style={{ marginBottom: '4px' }}>Markers: {markers.length}</div>
          <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '8px' }}>
            Keyboard: Space (play/pause), ← → (skip), Home/End (start/end)
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalTimeControls; 
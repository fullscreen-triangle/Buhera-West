import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const TimeControls = ({
  currentTime = new Date(),
  onTimeChange,
  isPlaying = false,
  onPlayToggle,
  timeRange = '24h', // '24h', '7d', '30d', '1y'
  onTimeRangeChange,
  playbackSpeed = 1, // 1x, 2x, 4x, 8x
  onSpeedChange,
  enabled = true,
  className = ""
}) => {
  const [selectedDate, setSelectedDate] = useState(currentTime);
  const [selectedHour, setSelectedHour] = useState(currentTime.getHours());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [animationId, setAnimationId] = useState(null);

  // Time range configurations
  const timeRanges = {
    '1h': { label: '1 Hour', step: 60000, max: 3600000 }, // 1 minute steps, 1 hour total
    '6h': { label: '6 Hours', step: 300000, max: 21600000 }, // 5 minute steps, 6 hours total
    '24h': { label: '24 Hours', step: 3600000, max: 86400000 }, // 1 hour steps, 24 hours total
    '7d': { label: '7 Days', step: 21600000, max: 604800000 }, // 6 hour steps, 7 days total
    '30d': { label: '30 Days', step: 86400000, max: 2592000000 }, // 1 day steps, 30 days total
    '1y': { label: '1 Year', step: 604800000, max: 31536000000 } // 1 week steps, 1 year total
  };

  const speedOptions = [0.5, 1, 2, 4, 8];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && enabled) {
      const config = timeRanges[timeRange];
      const interval = Math.max(100, 1000 / playbackSpeed); // Minimum 100ms interval
      
      const animate = () => {
        const newTime = new Date(currentTime.getTime() + config.step);
        const now = new Date();
        
        // Don't go beyond current time for real-time data
        if (newTime <= now) {
          if (onTimeChange) {
            onTimeChange(newTime);
          }
        } else {
          // Stop playback when reaching current time
          if (onPlayToggle) {
            onPlayToggle(false);
          }
        }
        
        const id = setTimeout(animate, interval);
        setAnimationId(id);
      };
      
      const id = setTimeout(animate, interval);
      setAnimationId(id);
      
      return () => {
        if (id) clearTimeout(id);
      };
    } else {
      if (animationId) {
        clearTimeout(animationId);
        setAnimationId(null);
      }
    }
  }, [isPlaying, currentTime, timeRange, playbackSpeed, enabled]);

  const handlePlayToggle = () => {
    if (onPlayToggle) {
      onPlayToggle(!isPlaying);
    }
  };

  const handleReset = () => {
    const newTime = new Date();
    setSelectedDate(newTime);
    setSelectedHour(newTime.getHours());
    if (onTimeChange) {
      onTimeChange(newTime);
    }
    if (onPlayToggle) {
      onPlayToggle(false);
    }
  };

  const handleStepBackward = () => {
    const config = timeRanges[timeRange];
    const newTime = new Date(currentTime.getTime() - config.step);
    if (onTimeChange) {
      onTimeChange(newTime);
    }
  };

  const handleStepForward = () => {
    const config = timeRanges[timeRange];
    const newTime = new Date(currentTime.getTime() + config.step);
    const now = new Date();
    
    // Don't go beyond current time
    if (newTime <= now) {
      if (onTimeChange) {
        onTimeChange(newTime);
      }
    }
  };

  const handleDateChange = (event) => {
    const dateValue = new Date(event.target.value);
    const newTime = new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate(),
      selectedHour,
      0,
      0
    );
    setSelectedDate(dateValue);
    if (onTimeChange) {
      onTimeChange(newTime);
    }
  };

  const handleHourChange = (event) => {
    const hour = parseInt(event.target.value);
    const newTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hour,
      0,
      0
    );
    setSelectedHour(hour);
    if (onTimeChange) {
      onTimeChange(newTime);
    }
  };

  const formatCurrentTime = () => {
    const config = timeRanges[timeRange];
    
    if (config.step < 3600000) { // Less than 1 hour - show date and time
      return currentTime.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (config.step < 86400000) { // Less than 1 day - show date and hour
      return currentTime.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit' 
      });
    } else { // Day or longer - show just date
      return currentTime.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const getTimeProgress = () => {
    const now = new Date();
    const config = timeRanges[timeRange];
    const rangeStart = new Date(now.getTime() - config.max);
    
    if (currentTime < rangeStart) return 0;
    if (currentTime >= now) return 100;
    
    const progress = ((currentTime.getTime() - rangeStart.getTime()) / config.max) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (!enabled) {
    return null;
  }

  return (
    <motion.div 
      className={`bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-blue-400" />
          <span className="text-white font-medium text-sm">Time Analysis</span>
        </div>
        <div className="text-xs text-gray-400">
          {formatCurrentTime()}
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="mb-4">
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          {Object.entries(timeRanges).map(([key, config]) => (
            <button
              key={key}
              onClick={() => onTimeRangeChange && onTimeRangeChange(key)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                timeRange === key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Past</span>
          <span>{Math.round(getTimeProgress())}%</span>
          <span>Now</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getTimeProgress()}%` }}
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStepBackward}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Step Backward"
          >
            <SkipBack size={16} className="text-white" />
          </button>
          
          <button
            onClick={handlePlayToggle}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={16} className="text-white" />
            ) : (
              <Play size={16} className="text-white" />
            )}
          </button>
          
          <button
            onClick={handleStepForward}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Step Forward"
          >
            <SkipForward size={16} className="text-white" />
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Reset to Now"
          >
            <RotateCcw size={16} className="text-white" />
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Speed:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange && onSpeedChange(parseFloat(e.target.value))}
            className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
          >
            {speedOptions.map(speed => (
              <option key={speed} value={speed}>
                {speed}x
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Manual Time Selection */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">Manual Selection:</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hour</label>
            <select
              value={selectedHour}
              onChange={handleHourChange}
              className="w-full bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      {isPlaying && (
        <div className="mt-3 flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400">Playing at {playbackSpeed}x speed</span>
        </div>
      )}
      
      {currentTime.getTime() >= new Date().getTime() - 60000 && (
        <div className="mt-3 flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-blue-400">Live data</span>
        </div>
      )}
    </motion.div>
  );
};

export default TimeControls; 
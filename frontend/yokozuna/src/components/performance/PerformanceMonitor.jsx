import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import PropTypes from 'prop-types';

/**
 * Performance Monitor Component - Parent (NO R3F HOOKS)
 * Tracks FPS, memory usage, render times, and provides adaptive quality control
 */
const PerformanceMonitor = forwardRef(({ 
  targetFPS = 60, 
  onPerformanceUpdate,
  enableAdaptiveQuality = true,
  debugMode = false 
}, ref) => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    renderTime: 0,
    triangleCount: 0,
    drawCalls: 0,
    qualityLevel: 1.0
  });

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded">
      <Canvas gl={{ antialias: true }}>
        <PerformanceScene 
          targetFPS={targetFPS}
          onPerformanceUpdate={onPerformanceUpdate}
          enableAdaptiveQuality={enableAdaptiveQuality}
          debugMode={debugMode}
          ref={ref}
          setPerformanceMetrics={setPerformanceMetrics}
        />
        <Stats />
      </Canvas>
      
      {debugMode && (
        <div className="text-sm space-y-1">
          <div>FPS: {performanceMetrics.fps.toFixed(1)}</div>
          <div>Memory: {performanceMetrics.memoryUsage.toFixed(1)} MB</div>
          <div>Draw Calls: {performanceMetrics.drawCalls}</div>
          <div>Triangles: {performanceMetrics.triangleCount}</div>
          <div>Quality: {performanceMetrics.qualityLevel.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
});

/**
 * Performance Scene Component - Child (R3F HOOKS OK HERE)
 */
const PerformanceScene = forwardRef(({ 
  targetFPS,
  onPerformanceUpdate,
  enableAdaptiveQuality,
  debugMode,
  setPerformanceMetrics
}, ref) => {
  const { gl, scene } = useThree(); // ✅ OK - Inside Canvas
  
  // Performance tracking variables
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const frameTimeHistory = useRef([]);
  const maxHistoryLength = 60; // Track last 60 frames
  
  // Memory usage tracking
  const memoryTracker = useRef({
    lastCheck: 0,
    interval: 1000 // Check every second
  });
  
  // Render time tracking
  const renderTimer = useRef({
    startTime: 0,
    endTime: 0
  });
  
  // Quality adjustment state
  const qualityController = useRef({
    currentQuality: 1.0,
    adjustmentCooldown: 0,
    cooldownDuration: 2000, // 2 seconds between adjustments
    performanceHistory: [],
    targetFrameTime: 1000 / targetFPS
  });
  
  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    getPerformanceMetrics: () => performanceMetrics,
    resetMetrics: () => {
      frameCount.current = 0;
      frameTimeHistory.current = [];
      qualityController.current.performanceHistory = [];
    },
    setQualityLevel: (level) => {
      qualityController.current.currentQuality = Math.max(0.1, Math.min(2.0, level));
    },
    getRecommendedQuality: () => calculateRecommendedQuality()
  }));
  
  // Calculate memory usage
  const getMemoryUsage = () => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize / 1024 / 1024, // MB
        total: performance.memory.totalJSHeapSize / 1024 / 1024, // MB
        limit: performance.memory.jsHeapSizeLimit / 1024 / 1024 // MB
      };
    }
    return { used: 0, total: 0, limit: 0 };
  };
  
  // Get render statistics from Three.js
  const getRenderStats = () => {
    if (gl.info) {
      return {
        triangles: gl.info.render.triangles,
        points: gl.info.render.points,
        lines: gl.info.render.lines,
        calls: gl.info.render.calls,
        frame: gl.info.render.frame
      };
    }
    return { triangles: 0, points: 0, lines: 0, calls: 0, frame: 0 };
  };
  
  // Calculate recommended quality level based on performance
  const calculateRecommendedQuality = () => {
    const avgFrameTime = frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length;
    const targetFrameTime = qualityController.current.targetFrameTime;
    
    if (avgFrameTime > targetFrameTime * 1.5) {
      // Performance is poor, reduce quality significantly
      return Math.max(0.1, qualityController.current.currentQuality * 0.7);
    } else if (avgFrameTime > targetFrameTime * 1.2) {
      // Performance is below target, reduce quality moderately
      return Math.max(0.3, qualityController.current.currentQuality * 0.85);
    } else if (avgFrameTime < targetFrameTime * 0.8 && qualityController.current.currentQuality < 1.0) {
      // Performance is good, can increase quality
      return Math.min(2.0, qualityController.current.currentQuality * 1.1);
    }
    
    return qualityController.current.currentQuality;
  };
  
  // Apply adaptive quality adjustments
  const applyAdaptiveQuality = (currentTime) => {
    if (!enableAdaptiveQuality) return;
    
    // Check if cooldown period has passed
    if (currentTime - qualityController.current.adjustmentCooldown < qualityController.current.cooldownDuration) {
      return;
    }
    
    // Need sufficient frame history for accurate assessment
    if (frameTimeHistory.current.length < 30) return;
    
    const recommendedQuality = calculateRecommendedQuality();
    
    // Only adjust if the change is significant
    if (Math.abs(recommendedQuality - qualityController.current.currentQuality) > 0.1) {
      qualityController.current.currentQuality = recommendedQuality;
      qualityController.current.adjustmentCooldown = currentTime;
      
      // Notify parent component of quality change
      if (onPerformanceUpdate) {
        onPerformanceUpdate({
          fps: 0, // Will be updated in useFrame
          frameTime: 0,
          memoryUsage: 0,
          renderTime: 0,
          triangleCount: 0,
          drawCalls: 0,
          qualityLevel: recommendedQuality,
          qualityAdjusted: true
        });
      }
    }
  };
  
  // Main performance monitoring loop
  useFrame((state, delta) => {
    const currentTime = performance.now();
    
    // Start render timing
    renderTimer.current.startTime = currentTime;
    
    // Calculate frame time and FPS
    const frameTime = currentTime - lastTime.current;
    lastTime.current = currentTime;
    
    // Update frame time history
    frameTimeHistory.current.push(frameTime);
    if (frameTimeHistory.current.length > maxHistoryLength) {
      frameTimeHistory.current.shift();
    }
    
    // Calculate average FPS from recent frames
    const avgFrameTime = frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length;
    const currentFPS = 1000 / avgFrameTime;
    
    frameCount.current++;
    
    // Update memory usage periodically
    let memoryUsage = 0;
    if (currentTime - memoryTracker.current.lastCheck > memoryTracker.current.interval) {
      const memory = getMemoryUsage();
      memoryUsage = memory.used;
      memoryTracker.current.lastCheck = currentTime;
    }
    
    // Get render statistics
    const renderStats = getRenderStats();
    
    // Apply adaptive quality control
    applyAdaptiveQuality(currentTime);
    
    // Update performance metrics
    const newMetrics = {
      fps: currentFPS,
      frameTime: avgFrameTime,
      memoryUsage: memoryUsage,
      renderTime: currentTime - renderTimer.current.startTime,
      triangleCount: renderStats.triangles,
      drawCalls: renderStats.calls,
      qualityLevel: qualityController.current.currentQuality
    };
    
    setPerformanceMetrics(newMetrics);
    
    // Notify parent component
    if (onPerformanceUpdate && frameCount.current % 60 === 0) { // Update every 60 frames
      onPerformanceUpdate(newMetrics);
    }
  });
  
  // Performance warning system
  const getPerformanceStatus = () => {
    const fps = frameTimeHistory.current.length > 0 ? 
      1000 / (frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length) : 60;
    const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0;
    const qualityLevel = qualityController.current.currentQuality;
    
    if (fps < targetFPS * 0.5 || memoryUsage > 1000) {
      return { status: 'critical', color: '#F44336' };
    } else if (fps < targetFPS * 0.8 || qualityLevel < 0.5) {
      return { status: 'warning', color: '#FFC107' };
    } else {
      return { status: 'good', color: '#4CAF50' };
    }
  };
  
  // Debug overlay component
  const DebugOverlay = () => {
    if (!debugMode) return null;
    
    const status = getPerformanceStatus();
    
    return (
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        minWidth: '200px'
      }}>
        <div style={{ color: status.color, fontWeight: 'bold', marginBottom: '5px' }}>
          Performance: {status.status.toUpperCase()}
        </div>
        <div>FPS: {(frameTimeHistory.current.length > 0 ? 
          1000 / (frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length) : 60).toFixed(1)} / {targetFPS}</div>
        <div>Frame Time: {(frameTimeHistory.current.length > 0 ? 
          frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length : 16.67).toFixed(2)}ms</div>
        <div>Memory: {(performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0).toFixed(1)}MB</div>
        <div>Triangles: {(gl.info?.render?.triangles || 0).toLocaleString()}</div>
        <div>Draw Calls: {gl.info?.render?.calls || 0}</div>
        <div>Quality: {(qualityController.current.currentQuality * 100).toFixed(0)}%</div>
        
        {/* Performance bars */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>FPS</div>
          <div style={{
            width: '100%',
            height: '4px',
            background: '#333',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, ((frameTimeHistory.current.length > 0 ? 
                1000 / (frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length) : 60) / targetFPS) * 100)}%`,
              height: '100%',
              background: status.color,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        
        <div style={{ marginTop: '5px' }}>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>Memory</div>
          <div style={{
            width: '100%',
            height: '4px',
            background: '#333',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, (performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0) / 10)}%`, // Scale to 1GB max
              height: '100%',
              background: (performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0) > 500 ? '#F44336' : '#4CAF50',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
    );
  };
  
  return null; // Scene component only monitors, doesn't render
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

PerformanceMonitor.propTypes = {
  targetFPS: PropTypes.number,
  onPerformanceUpdate: PropTypes.func,
  enableAdaptiveQuality: PropTypes.bool,
  debugMode: PropTypes.bool
};

export default PerformanceMonitor; 
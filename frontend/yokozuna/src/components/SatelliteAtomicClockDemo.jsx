import React, { useState, useEffect, useCallback } from 'react';
import { useTime } from '../contexts/TimeContext';
import satelliteAtomicTimeService from '../services/atomicTimeService';
import nasaESATimingService from '../services/nasaESATimingService';
import enhancedTemporalDataManager from '../services/temporalDataManager';

const SatelliteAtomicClockDemo = () => {
  const { currentTime, syncQuality, isAtomicTimeSynced } = useTime();
  
  // Satellite constellation status
  const [constellationStatus, setConstellationStatus] = useState({});
  const [nasaESAStatus, setNASAESAStatus] = useState({});
  const [reconstructionMetrics, setReconstructionMetrics] = useState({});
  
  // Timing data
  const [atomicTime, setAtomicTime] = useState(null);
  const [timingComparison, setTimingComparison] = useState({});
  
  // Demo data streams
  const [demoStreams, setDemoStreams] = useState([]);
  const [activeStream, setActiveStream] = useState(null);
  
  // Real-time updates
  const [isLive, setIsLive] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(5000);
  
  // Initialize demo data streams
  useEffect(() => {
    const initializeDemoStreams = async () => {
      try {
        // Register demo data streams with satellite timing
        const streams = [
          {
            id: 'weather_satellite',
            name: 'Weather Satellite Data',
            type: 'environmental',
            description: 'Real-time weather data from satellite constellation',
            config: {
              temporalResolution: 1000, // 1 second
              spatialResolution: 1.0,   // 1 meter
              reconstructionEnabled: true,
              triangulationEnabled: true,
              mimoEnabled: true,
              phantomSatelliteEnabled: true
            }
          },
          {
            id: 'agricultural_monitoring',
            name: 'Agricultural Monitoring',
            type: 'agricultural',
            description: 'Crop health and soil conditions from multiple satellites',
            config: {
              temporalResolution: 60000, // 1 minute
              spatialResolution: 10.0,   // 10 meters
              reconstructionEnabled: true,
              triangulationEnabled: true,
              mimoEnabled: true,
              phantomSatelliteEnabled: true
            }
          },
          {
            id: 'geological_survey',
            name: 'Geological Survey',
            type: 'geological',
            description: 'Ground movement and geological data from GRACE satellites',
            config: {
              temporalResolution: 3600000, // 1 hour
              spatialResolution: 100.0,    // 100 meters
              reconstructionEnabled: true,
              triangulationEnabled: true,
              mimoEnabled: false,
              phantomSatelliteEnabled: true
            }
          }
        ];
        
        // Register streams with enhanced temporal data manager
        const registeredStreams = [];
        for (const stream of streams) {
          try {
            const registeredStream = await enhancedTemporalDataManager.registerDataStream(
              stream.id,
              stream.config
            );
            registeredStreams.push({ ...stream, registered: true });
          } catch (error) {
            console.error(`Failed to register stream ${stream.id}:`, error);
            registeredStreams.push({ ...stream, registered: false });
          }
        }
        
        setDemoStreams(registeredStreams);
        setActiveStream(registeredStreams[0]);
        
      } catch (error) {
        console.error('Failed to initialize demo streams:', error);
      }
    };
    
    initializeDemoStreams();
  }, []);
  
  // Update satellite constellation status
  const updateConstellationStatus = useCallback(async () => {
    try {
      const [satelliteStatus, nasaESAStatus, reconstructionMetrics] = await Promise.allSettled([
        satelliteAtomicTimeService.getConstellationStatus ? satelliteAtomicTimeService.getConstellationStatus() : Promise.resolve({}),
        nasaESATimingService.getSatelliteStatus(),
        enhancedTemporalDataManager.getReconstructionMetrics('weather_satellite')
      ]);
      
      setConstellationStatus(satelliteStatus.status === 'fulfilled' ? satelliteStatus.value : {});
      setNASAESAStatus(nasaESAStatus.status === 'fulfilled' ? nasaESAStatus.value : {});
      setReconstructionMetrics(reconstructionMetrics.status === 'fulfilled' ? reconstructionMetrics.value : {});
      
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }, []);
  
  // Update atomic time comparison
  const updateTimingComparison = useCallback(async () => {
    try {
      const [satelliteTime, nasaESATime, localTime] = await Promise.allSettled([
        satelliteAtomicTimeService.getAtomicTime(),
        nasaESATimingService.getAtomicTime(),
        Promise.resolve({ timestamp: Date.now(), source: 'local', accuracy: null })
      ]);
      
      const comparison = {
        satellite: satelliteTime.status === 'fulfilled' ? satelliteTime.value : null,
        nasaESA: nasaESATime.status === 'fulfilled' ? nasaESATime.value : null,
        local: localTime.value
      };
      
      setTimingComparison(comparison);
      
      // Set the best atomic time
      const bestTime = comparison.satellite || comparison.nasaESA || comparison.local;
      setAtomicTime(bestTime);
      
    } catch (error) {
      console.error('Failed to update timing comparison:', error);
    }
  }, []);
  
  // Real-time updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      updateConstellationStatus();
      updateTimingComparison();
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [isLive, updateInterval, updateConstellationStatus, updateTimingComparison]);
  
  // Generate demo data points
  const generateDemoData = useCallback(async () => {
    if (!activeStream) return;
    
    try {
      const demoData = {
        timestamp: Date.now(),
        location: {
          latitude: -18.2871 + (Math.random() - 0.5) * 0.1,
          longitude: 31.0472 + (Math.random() - 0.5) * 0.1,
          altitude: 1200 + Math.random() * 100
        },
        value: Math.random() * 100,
        type: activeStream.type,
        historicalData: [],
        environmentalFactors: {
          temperature: 20 + Math.random() * 15,
          humidity: 40 + Math.random() * 40,
          pressure: 1013 + Math.random() * 50
        }
      };
      
      await enhancedTemporalDataManager.addDataPoint(activeStream.id, demoData);
      console.log(`📊 Added demo data point to ${activeStream.name}`);
      
    } catch (error) {
      console.error('Failed to generate demo data:', error);
    }
  }, [activeStream]);
  
  // Format time with nanosecond precision
  const formatPreciseTime = (timeData) => {
    if (!timeData) return 'N/A';
    
    const timestamp = timeData.atomicTime || timeData.timestamp;
    const date = new Date(timestamp);
    const nanoseconds = (timestamp % 1000) * 1000000;
    
    return `${date.toISOString().slice(0, -1)}${nanoseconds.toString().padStart(6, '0')}Z`;
  };
  
  // Format accuracy
  const formatAccuracy = (accuracy) => {
    if (!accuracy) return 'N/A';
    
    if (accuracy < 1e-6) return `${(accuracy * 1e9).toFixed(1)} ns`;
    if (accuracy < 1e-3) return `${(accuracy * 1e6).toFixed(1)} μs`;
    if (accuracy < 1) return `${(accuracy * 1e3).toFixed(1)} ms`;
    return `${accuracy.toFixed(1)} s`;
  };
  
  return (
    <div className="satellite-atomic-clock-demo">
      <style jsx>{`
        .satellite-atomic-clock-demo {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
          color: #ffffff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .demo-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
          border-radius: 10px;
          border: 1px solid #2a3f5f;
        }
        
        .demo-title {
          font-size: 2.5em;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .demo-subtitle {
          font-size: 1.2em;
          color: #a0a0a0;
          margin-bottom: 15px;
        }
        
        .sync-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 1.1em;
        }
        
        .sync-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${isAtomicTimeSynced ? '#00ff00' : '#ff0000'};
          box-shadow: 0 0 10px ${isAtomicTimeSynced ? '#00ff00' : '#ff0000'};
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .demo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .demo-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }
        
        .card-title {
          font-size: 1.3em;
          margin-bottom: 15px;
          color: #4facfe;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .constellation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .constellation-item {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .constellation-name {
          font-weight: bold;
          color: #00f2fe;
          margin-bottom: 8px;
        }
        
        .constellation-stats {
          font-size: 0.9em;
          color: #a0a0a0;
        }
        
        .constellation-stats div {
          margin-bottom: 4px;
        }
        
        .timing-comparison {
          margin-bottom: 20px;
        }
        
        .timing-source {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .timing-source:last-child {
          border-bottom: none;
        }
        
        .source-name {
          font-weight: bold;
          color: #4facfe;
        }
        
        .source-time {
          font-family: monospace;
          color: #00ff00;
        }
        
        .source-accuracy {
          font-size: 0.8em;
          color: #a0a0a0;
        }
        
        .stream-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .stream-button {
          padding: 8px 16px;
          border: 1px solid #4facfe;
          background: rgba(79, 172, 254, 0.1);
          color: #4facfe;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .stream-button:hover {
          background: rgba(79, 172, 254, 0.2);
        }
        
        .stream-button.active {
          background: #4facfe;
          color: #000;
        }
        
        .control-panel {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .control-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;
        }
        
        .control-label {
          min-width: 100px;
          color: #a0a0a0;
        }
        
        .control-button {
          padding: 8px 16px;
          border: 1px solid #00f2fe;
          background: rgba(0, 242, 254, 0.1);
          color: #00f2fe;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .control-button:hover {
          background: rgba(0, 242, 254, 0.2);
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        
        .metric-item {
          text-align: center;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .metric-value {
          font-size: 1.5em;
          font-weight: bold;
          color: #00ff00;
          margin-bottom: 5px;
        }
        
        .metric-label {
          font-size: 0.9em;
          color: #a0a0a0;
        }
        
        .full-width {
          grid-column: 1 / -1;
        }
        
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
        }
        
        .status-active {
          background: #00ff00;
          box-shadow: 0 0 5px #00ff00;
        }
        
        .status-inactive {
          background: #ff0000;
          box-shadow: 0 0 5px #ff0000;
        }
        
        .status-unknown {
          background: #ffaa00;
          box-shadow: 0 0 5px #ffaa00;
        }
      `}</style>
      
      <div className="demo-header">
        <h1 className="demo-title">🛰️ Satellite Atomic Clock Integration</h1>
        <p className="demo-subtitle">
          Enhanced timing system using NASA/ESA satellite atomic clocks with multi-constellation triangulation
        </p>
        <div className="sync-status">
          <div className="sync-indicator"></div>
          <span>
            {isAtomicTimeSynced ? 'Synchronized with Satellite Atomic Clocks' : 'Local Time Fallback'}
          </span>
        </div>
      </div>
      
      <div className="demo-grid">
        <div className="demo-card">
          <h3 className="card-title">🛰️ Satellite Constellations</h3>
          <div className="constellation-grid">
            {Object.entries(constellationStatus).map(([constellation, status]) => (
              <div key={constellation} className="constellation-item">
                <div className="constellation-name">
                  <span className={`status-indicator ${status.status || 'unknown'}`}></span>
                  {status.name || constellation.toUpperCase()}
                </div>
                <div className="constellation-stats">
                  <div>Satellites: {status.satelliteCount || 0}</div>
                  <div>Healthy: {status.healthySatellites || 0}</div>
                  <div>Clock: {status.clockType || 'N/A'}</div>
                  <div>Accuracy: {formatAccuracy(status.accuracy)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="demo-card">
          <h3 className="card-title">🌍 NASA/ESA Integration</h3>
          <div className="constellation-grid">
            {Object.entries(nasaESAStatus).map(([constellation, status]) => (
              <div key={constellation} className="constellation-item">
                <div className="constellation-name">
                  <span className={`status-indicator ${status.satelliteCount > 0 ? 'status-active' : 'status-inactive'}`}></span>
                  {constellation.toUpperCase()}
                </div>
                <div className="constellation-stats">
                  <div>Satellites: {status.satelliteCount || 0}</div>
                  <div>Healthy: {status.healthySatellites || 0}</div>
                  <div>Clock: {status.clockType || 'N/A'}</div>
                  <div>Accuracy: {formatAccuracy(status.accuracy)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="demo-card full-width">
        <h3 className="card-title">⏰ Atomic Time Comparison</h3>
        <div className="timing-comparison">
          {Object.entries(timingComparison).map(([source, timeData]) => (
            <div key={source} className="timing-source">
              <div className="source-name">
                {source === 'satellite' ? '🛰️ Satellite Atomic Clocks' : 
                 source === 'nasaESA' ? '🌍 NASA/ESA Satellites' : 
                 '🖥️ Local System Clock'}
              </div>
              <div>
                <div className="source-time">{formatPreciseTime(timeData)}</div>
                <div className="source-accuracy">
                  Accuracy: {formatAccuracy(timeData?.uncertainty || timeData?.accuracy)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="demo-card full-width">
        <h3 className="card-title">📊 Data Stream Reconstruction</h3>
        
        <div className="stream-controls">
          {demoStreams.map(stream => (
            <button
              key={stream.id}
              className={`stream-button ${activeStream?.id === stream.id ? 'active' : ''}`}
              onClick={() => setActiveStream(stream)}
            >
              {stream.name}
            </button>
          ))}
        </div>
        
        {activeStream && (
          <div>
            <p><strong>Description:</strong> {activeStream.description}</p>
            <p><strong>Status:</strong> {activeStream.registered ? '✅ Registered' : '❌ Failed'}</p>
            
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-value">{reconstructionMetrics.quality?.toFixed(3) || 'N/A'}</div>
                <div className="metric-label">Reconstruction Quality</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{formatAccuracy(reconstructionMetrics.uncertainty)}</div>
                <div className="metric-label">Timing Uncertainty</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{syncQuality?.satelliteCount || 0}</div>
                <div className="metric-label">Visible Satellites</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{syncQuality?.triangulationQuality?.toFixed(3) || 'N/A'}</div>
                <div className="metric-label">Triangulation Quality</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{syncQuality?.constellationsActive || 0}</div>
                <div className="metric-label">Active Constellations</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{reconstructionMetrics.totalDataPoints || 0}</div>
                <div className="metric-label">Data Points</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="control-panel">
        <h3 className="card-title">🎛️ Demo Controls</h3>
        
        <div className="control-row">
          <span className="control-label">Live Updates:</span>
          <button
            className="control-button"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? '⏸️ Pause' : '▶️ Start'}
          </button>
        </div>
        
        <div className="control-row">
          <span className="control-label">Update Rate:</span>
          <button
            className="control-button"
            onClick={() => setUpdateInterval(updateInterval === 5000 ? 1000 : 5000)}
          >
            {updateInterval === 5000 ? '⚡ 1s' : '🐢 5s'}
          </button>
        </div>
        
        <div className="control-row">
          <span className="control-label">Actions:</span>
          <button className="control-button" onClick={generateDemoData}>
            📊 Generate Data
          </button>
          <button className="control-button" onClick={updateConstellationStatus}>
            🔄 Refresh Status
          </button>
          <button className="control-button" onClick={updateTimingComparison}>
            ⏰ Update Timing
          </button>
        </div>
      </div>
      
      <div className="demo-card full-width">
        <h3 className="card-title">📈 System Performance</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-value">{syncQuality?.networkLatency?.toFixed(1) || 'N/A'}ms</div>
            <div className="metric-label">Network Latency</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{syncQuality?.reconstructionAccuracy?.toFixed(3) || 'N/A'}</div>
            <div className="metric-label">Reconstruction Accuracy</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{syncQuality?.source || 'N/A'}</div>
            <div className="metric-label">Primary Source</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{formatAccuracy(syncQuality?.accuracy)}</div>
            <div className="metric-label">Timing Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteAtomicClockDemo; 
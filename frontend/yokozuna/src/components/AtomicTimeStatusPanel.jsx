import React, { useState, useEffect } from 'react';
import { useTime } from '../contexts/TimeContext';
import { Clock, Wifi, WifiOff, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Atomic Time Status Panel
 * Shows real-time atomic clock synchronization status and quality metrics
 */
const AtomicTimeStatusPanel = ({ className = '', compact = false }) => {
  const {
    isAtomicTimeSynced,
    syncQuality,
    getAtomicTime,
    getPreciseAtomicTime,
    formatTime,
    currentTime
  } = useTime();
  
  const [expanded, setExpanded] = useState(false);
  const [realTimeUpdate, setRealTimeUpdate] = useState(Date.now());
  
  // Update display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeUpdate(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getSyncStatusColor = () => {
    if (!syncQuality) return 'text-gray-400';
    
    if (syncQuality.syncQuality > 0.8) return 'text-green-400';
    if (syncQuality.syncQuality > 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getSyncStatusIcon = () => {
    if (!syncQuality) return <WifiOff className="w-4 h-4" />;
    
    if (syncQuality.syncQuality > 0.8) return <CheckCircle className="w-4 h-4" />;
    if (syncQuality.syncQuality > 0.5) return <AlertCircle className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };
  
  const formatLatency = (latency) => {
    if (latency < 1) return `${(latency * 1000).toFixed(0)}μs`;
    if (latency < 1000) return `${latency.toFixed(0)}ms`;
    return `${(latency / 1000).toFixed(1)}s`;
  };
  
  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 text-sm ${className}`}>
        <Clock className="w-4 h-4 text-blue-400" />
        <span className={getSyncStatusColor()}>
          {isAtomicTimeSynced ? 'Atomic' : 'Local'}
        </span>
        {syncQuality && (
          <span className="text-gray-400">
            {Math.round(syncQuality.syncQuality * 100)}%
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className={`bg-black/70 backdrop-blur-md border border-white/10 rounded-lg transition-all duration-300 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-white font-medium">Atomic Time Status</h3>
            <p className="text-sm text-gray-400">
              {isAtomicTimeSynced ? 'Synchronized' : 'Local Fallback'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={getSyncStatusColor()}>
            {getSyncStatusIcon()}
          </div>
          <Info className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Current Time Display */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Current Atomic Time</label>
                <div className="text-white font-mono text-sm mt-1">
                  {formatTime(getAtomicTime(), 'precise')}
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Local System Time</label>
                <div className="text-white font-mono text-sm mt-1">
                  {new Date().toISOString()}
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Time Offset</label>
                <div className="text-white font-mono text-sm mt-1">
                  {syncQuality ? 
                    `${syncQuality.timeOffset > 0 ? '+' : ''}${syncQuality.timeOffset.toFixed(1)}ms` :
                    'N/A'
                  }
                </div>
              </div>
            </div>
            
            {/* Sync Quality Metrics */}
            <div className="space-y-3">
              {syncQuality && (
                <>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Sync Quality</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            syncQuality.syncQuality > 0.8 ? 'bg-green-400' :
                            syncQuality.syncQuality > 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${syncQuality.syncQuality * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">
                        {Math.round(syncQuality.syncQuality * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Network Latency</label>
                    <div className="text-white font-mono text-sm mt-1">
                      {formatLatency(syncQuality.networkLatency)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Clock Drift Rate</label>
                    <div className="text-white font-mono text-sm mt-1">
                      {(syncQuality.clockDrift * 1000).toFixed(3)} ms/s
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Last Sync Age</label>
                    <div className="text-white font-mono text-sm mt-1">
                      {syncQuality.lastSyncAge < 60000 ? 
                        `${Math.round(syncQuality.lastSyncAge / 1000)}s ago` :
                        `${Math.round(syncQuality.lastSyncAge / 60000)}m ago`
                      }
                    </div>
                  </div>
                </>
              )}
              
              {!syncQuality && (
                <div className="text-gray-400 text-sm">
                  Atomic time synchronization not available
                </div>
              )}
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              <div className={`px-2 py-1 rounded-full text-xs ${
                isAtomicTimeSynced ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
              }`}>
                {isAtomicTimeSynced ? '✓ Atomic Sync' : '◯ Local Time'}
              </div>
              
              {syncQuality && (
                <div className={`px-2 py-1 rounded-full text-xs ${
                  syncQuality.isOnline ? 'bg-blue-400/20 text-blue-400' : 'bg-red-400/20 text-red-400'
                }`}>
                  {syncQuality.isOnline ? '✓ Online' : '◯ Offline'}
                </div>
              )}
              
              <div className="px-2 py-1 rounded-full text-xs bg-purple-400/20 text-purple-400">
                Precision: {isAtomicTimeSynced ? 'Microsecond' : 'Millisecond'}
              </div>
            </div>
          </div>
          
          {/* Performance Info */}
          <div className="mt-4 p-3 bg-blue-600/10 border border-blue-400/20 rounded-lg">
            <div className="text-xs text-blue-300 mb-1">💡 Performance Benefits</div>
            <div className="text-xs text-gray-300">
              • Sub-millisecond time precision for data correlation<br/>
              • Automatic lag compensation for system delays<br/>
              • Real-time drift correction for long-term accuracy<br/>
              • Synchronized data filtering across all components
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtomicTimeStatusPanel; 
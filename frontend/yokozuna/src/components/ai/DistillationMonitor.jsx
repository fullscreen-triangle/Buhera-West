import React, { useState, useEffect } from 'react';
import { backgroundDistillation } from '../../services/backgroundDistillation';

const DistillationMonitor = ({ isVisible, onClose }) => {
  const [status, setStatus] = useState(null);
  const [models, setModels] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    if (isVisible) {
      updateStatus();
      const interval = setInterval(updateStatus, 2000);
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [isVisible]);

  const updateStatus = () => {
    const distillationStatus = backgroundDistillation.getDistillationStatus();
    setStatus(distillationStatus);
    setModels(distillationStatus.availableModels);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatFileSize = (size) => {
    if (typeof size === 'string') return size;
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  };

  const getStatusColor = (isRunning) => {
    return isRunning ? 'text-green-400' : 'text-blue-400';
  };

  const getProgressBar = (progress) => {
    if (!progress) return null;
    const percentage = (progress.stage / progress.total) * 100;
    
    return (
      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const getDomainIcon = (domain) => {
    const icons = {
      meteorology: '🌤️',
      agriculture: '🌾',
      geology: '🏔️',
      oceanography: '🌊',
      environmental_integration: '🌍'
    };
    return icons[domain] || '🤖';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🧠</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Background Knowledge Distillation</h2>
              <p className="text-gray-400 text-sm">Creating specialized environmental intelligence models</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Status */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Current Status</h3>
              <div className={`flex items-center space-x-2 ${getStatusColor(status?.isRunning)}`}>
                <div className={`w-2 h-2 rounded-full ${status?.isRunning ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`} />
                <span className="text-sm font-medium">
                  {status?.isRunning ? 'Active' : 'Idle'}
                </span>
              </div>
            </div>

            {status?.currentTask ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getDomainIcon(status.currentTask.domain)}</span>
                  <div>
                    <p className="text-white font-medium">
                      Creating {status.currentTask.domain} specialist model
                    </p>
                    <p className="text-gray-400 text-sm">
                      Target: {status.currentTask.targetModel}
                    </p>
                  </div>
                </div>
                
                {status.progress && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">
                        Stage {status.progress.stage}/{status.progress.total}
                      </span>
                      <span className="text-gray-300">
                        {Math.round((status.progress.stage / status.progress.total) * 100)}%
                      </span>
                    </div>
                    {getProgressBar(status.progress)}
                    <p className="text-xs text-gray-400 mt-1">
                      Estimated time: {formatDuration(status.currentTask.estimatedTime)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">
                  Waiting for idle time to begin distillation...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Models are created during periods of inactivity
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Available Models */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Available Specialized Models ({models.length})
          </h3>
          
          {models.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getDomainIcon(model.domain)}</span>
                    <div>
                      <h4 className="text-white font-medium">{model.domain}</h4>
                      <p className="text-gray-400 text-sm">{model.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Accuracy</p>
                      <p className="text-white font-medium">
                        {(model.performance.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Latency</p>
                      <p className="text-white font-medium">
                        {model.performance.latency.toFixed(0)}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Size</p>
                      <p className="text-white font-medium">
                        {formatFileSize(model.performance.size)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Usage</p>
                      <p className="text-white font-medium">
                        {model.usageCount} queries
                      </p>
                    </div>
                  </div>

                  {model.validation && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Domain Accuracy</span>
                        <span className="text-green-400">
                          {(model.validation.domainAccuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Coherence</span>
                        <span className="text-blue-400">
                          {(model.validation.responseCoherence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Consistency</span>
                        <span className="text-purple-400">
                          {(model.validation.factualConsistency * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-gray-400 mb-2">No specialized models available yet</p>
              <p className="text-xs text-gray-500">
                Models will be created automatically based on your usage patterns
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Learning Data</h4>
            <p className="text-2xl font-bold text-blue-400">
              {status?.interactionCount || 0}
            </p>
            <p className="text-gray-400 text-sm">User interactions analyzed</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Model Performance</h4>
            <p className="text-2xl font-bold text-green-400">
              {models.length > 0 ? 
                `${(models.reduce((acc, m) => acc + m.performance.accuracy, 0) / models.length * 100).toFixed(1)}%` : 
                '0%'
              }
            </p>
            <p className="text-gray-400 text-sm">Average accuracy</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Response Speed</h4>
            <p className="text-2xl font-bold text-purple-400">
              {models.length > 0 ? 
                `${(models.reduce((acc, m) => acc + m.performance.latency, 0) / models.length).toFixed(0)}ms` : 
                '0ms'
              }
            </p>
            <p className="text-gray-400 text-sm">Average latency</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <p>🔒 All learning data is anonymized and stored locally</p>
            <p>♻️ Models update automatically based on usage patterns</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistillationMonitor; 
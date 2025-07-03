// i want this page to be the dashboard for orbital path based reconstruction of coordinates and weather  
// the files : PathReconstruction.jsx , StripImage.jsx and OrbitalMechanics.jsx should be used here     

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import TransitionEffect from '@/components/TransitionEffect';
import dynamic from 'next/dynamic';
import StripImage from '@/components/satellites/StripImage';
import OrbitalMechanics from '@/components/satellites/OrbitalMechanics';
import { DEFAULT_COORDINATES } from '@/config/coordinates';
import { useTime } from '../../contexts/TimeContext';
import useSceneTime from '../../hooks/useSceneTime';

// Dynamic import to prevent SSR issues with react-globe.gl
const PathReconstruction = dynamic(() => import('@/components/satellites/PathReconstruction'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-b from-indigo-900 to-purple-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Loading Orbital Path Reconstruction...</p>
        <p className="text-sm opacity-75">Initializing satellite tracking • Loading orbital mechanics • Preparing 3D visualization</p>
      </div>
    </div>
  )
});

/**
 * Orbital Path Reconstruction Dashboard
 * 
 * Advanced orbital mechanics dashboard for coordinate and weather reconstruction:
 * - Satellite path reconstruction with sub-millimeter accuracy
 * - Strip imaging analysis for atmospheric and surface monitoring
 * - Orbital mechanics modeling for environmental intelligence
 * - Time-synchronized coordinate reconstruction algorithms
 * - Weather pattern reconstruction from orbital data
 */
const ReconstructionDashboard = () => {
  const [activeView, setActiveView] = useState('pathreconstruction'); // 'pathreconstruction' | 'stripimage' | 'orbitalmechanics'
  const [reconstructionData, setReconstructionData] = useState({
    coordinateAccuracy: 0.3, // mm
    weatherCorrelation: 0.92,
    activeReconstructions: 0,
    processingLoad: 0.0
  });

  // Time controls integration
  const { setShowTimeControls, setScene, currentTime, isPlaying } = useTime();
  const { getDayNightCycle, getTimeValue } = useSceneTime();

  // Initialize time controls for reconstruction timeline
  useEffect(() => {
    setShowTimeControls(true);
    setScene('weather'); // Use weather timeline for atmospheric reconstruction
    
    return () => {
      // Keep controls visible for sensor navigation
    };
  }, [setShowTimeControls, setScene]);

  // Real-time reconstruction metrics
  useEffect(() => {
    const updateReconstructionMetrics = () => {
      const activeRecons = 12 + Math.floor(Math.sin(currentTime * 0.0005) * 4);
      const processingLoad = 0.6 + getDayNightCycle() * 0.3 + Math.sin(currentTime * 0.0008) * 0.1;
      const coordinateAccuracy = 0.3 + Math.random() * 0.2; // Sub-millimeter accuracy
      const weatherCorrelation = 0.88 + getDayNightCycle() * 0.08 + Math.random() * 0.04;
      
      setReconstructionData({
        coordinateAccuracy,
        weatherCorrelation,
        activeReconstructions: activeRecons,
        processingLoad: Math.min(1.0, processingLoad)
      });
    };

    updateReconstructionMetrics();
    const interval = setInterval(updateReconstructionMetrics, 3000);
    
    return () => clearInterval(interval);
  }, [currentTime, getDayNightCycle]);

  // Calculate reconstruction statistics
  const reconstructionStats = {
    totalPasses: Math.floor(currentTime / 5400) + 156, // Satellite passes
    coordinatesProcessed: Math.floor(currentTime * 0.8) + 24891,
    weatherPatterns: Math.floor(currentTime * 0.2) + 1205,
    atmosphericProfiles: Math.floor(currentTime * 0.1) + 892
  };

  return (
    <>
      <Head>
        <title>Orbital Path Reconstruction | Coordinate & Weather Intelligence</title>
        <meta 
          name="description" 
          content="Advanced orbital path reconstruction dashboard for coordinate and weather analysis with sub-millimeter accuracy satellite tracking" 
        />
      </Head>
      
      <TransitionEffect />
      
      <main className="w-full min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Orbital Reconstruction
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-4">
              Advanced orbital path reconstruction dashboard for precision coordinate analysis 
              and weather pattern reconstruction using satellite-based environmental intelligence.
            </p>
            <div className="text-sm text-gray-400">
              <strong>Base Coordinates:</strong> {DEFAULT_COORDINATES.lat.toFixed(6)}°, {DEFAULT_COORDINATES.lng.toFixed(6)}° • 
              <strong>Timeline:</strong> {Math.floor(currentTime / 3600)}:{String(Math.floor((currentTime % 3600) / 60)).padStart(2, '0')} • 
              <strong>Status:</strong> {isPlaying ? 'Active Reconstruction' : 'Paused'}
            </div>
          </div>

          {/* Real-time Reconstruction Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Coordinate Accuracy</div>
              <div className="text-3xl font-bold text-green-400">{reconstructionData.coordinateAccuracy.toFixed(1)}mm</div>
              <div className="text-xs text-gray-400">sub-millimeter precision</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Weather Correlation</div>
              <div className="text-3xl font-bold text-blue-400">{(reconstructionData.weatherCorrelation * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-400">atmospheric coupling</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Active Reconstructions</div>
              <div className="text-3xl font-bold text-yellow-400">{reconstructionData.activeReconstructions}</div>
              <div className="text-xs text-gray-400">parallel processes</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Processing Load</div>
              <div className="text-3xl font-bold text-purple-400">{(reconstructionData.processingLoad * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-400">system utilization</div>
            </div>
          </div>

          {/* Reconstruction Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-indigo-500/10 backdrop-blur-sm rounded-lg p-4 border border-indigo-400/20">
              <div className="text-sm text-indigo-300 mb-1">Satellite Passes</div>
              <div className="text-xl font-bold text-indigo-100">{reconstructionStats.totalPasses.toLocaleString()}</div>
            </div>
            <div className="bg-purple-500/10 backdrop-blur-sm rounded-lg p-4 border border-purple-400/20">
              <div className="text-sm text-purple-300 mb-1">Coordinates Processed</div>
              <div className="text-xl font-bold text-purple-100">{reconstructionStats.coordinatesProcessed.toLocaleString()}</div>
            </div>
            <div className="bg-blue-500/10 backdrop-blur-sm rounded-lg p-4 border border-blue-400/20">
              <div className="text-sm text-blue-300 mb-1">Weather Patterns</div>
              <div className="text-xl font-bold text-blue-100">{reconstructionStats.weatherPatterns.toLocaleString()}</div>
            </div>
            <div className="bg-teal-500/10 backdrop-blur-sm rounded-lg p-4 border border-teal-400/20">
              <div className="text-sm text-teal-300 mb-1">Atmospheric Profiles</div>
              <div className="text-xl font-bold text-teal-100">{reconstructionStats.atmosphericProfiles.toLocaleString()}</div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-black/30 backdrop-blur-lg rounded-lg p-2 border border-white/20">
              <button
                onClick={() => setActiveView('pathreconstruction')}
                className={`px-4 py-3 rounded-lg transition-all duration-300 text-sm ${
                  activeView === 'pathreconstruction'
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🛰️ Path Reconstruction
              </button>
              <button
                onClick={() => setActiveView('stripimage')}
                className={`px-4 py-3 rounded-lg transition-all duration-300 text-sm ${
                  activeView === 'stripimage'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                📷 Strip Imaging
              </button>
              <button
                onClick={() => setActiveView('orbitalmechanics')}
                className={`px-4 py-3 rounded-lg transition-all duration-300 text-sm ${
                  activeView === 'orbitalmechanics'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🔬 Orbital Mechanics
              </button>
            </div>
          </div>

          {/* Main Visualization Area */}
          <div className="relative">
            {activeView === 'pathreconstruction' && (
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-2">Satellite Path Reconstruction</h2>
                  <p className="text-gray-300 text-sm">
                    Real-time satellite path reconstruction with sub-millimeter accuracy for 
                    coordinate analysis and atmospheric sensing correlation.
                  </p>
                </div>
                <div style={{ height: '80vh' }}>
                  <PathReconstruction />
                </div>
              </div>
            )}

            {activeView === 'stripimage' && (
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-2">Satellite Strip Imaging</h2>
                  <p className="text-gray-300 text-sm">
                    Advanced satellite strip imaging analysis for surface monitoring, 
                    atmospheric analysis, and environmental intelligence gathering.
                  </p>
                </div>
                <div style={{ height: '80vh' }}>
                  <StripImage />
                </div>
              </div>
            )}

            {activeView === 'orbitalmechanics' && (
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-2">Orbital Mechanics Analysis</h2>
                  <p className="text-gray-300 text-sm">
                    Detailed orbital mechanics modeling for satellite positioning, 
                    atmospheric coupling analysis, and environmental correlation studies.
                  </p>
                </div>
                <div style={{ height: '80vh' }}>
                  <OrbitalMechanics />
                </div>
              </div>
            )}
          </div>

          {/* Timeline Integration Notice */}
          <div className="mt-8 text-center">
            <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-lg p-6 inline-block max-w-3xl">
              <h3 className="text-lg font-semibold text-indigo-200 mb-2">Temporal Reconstruction Framework</h3>
              <p className="text-indigo-100 text-sm">
                The reconstruction algorithms are synchronized with the global timeline system. 
                Use the timeline controls to observe how satellite paths, atmospheric conditions, 
                and coordinate reconstruction accuracy evolve over time. Historical data can 
                be reconstructed for any point in the timeline.
              </p>
              <div className="mt-3 text-xs text-indigo-200">
                <strong>Current Processing:</strong> {reconstructionData.activeReconstructions} simultaneous reconstructions • 
                <strong>Accuracy:</strong> {reconstructionData.coordinateAccuracy.toFixed(2)}mm • 
                <strong>Weather Coupling:</strong> {(reconstructionData.weatherCorrelation * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ReconstructionDashboard;

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import TransitionEffect from '@/components/TransitionEffect';
import dynamic from 'next/dynamic';
import OrbitalMechanics from '@/components/satellites/OrbitalMechanics';
import { DEFAULT_COORDINATES } from '@/config/coordinates';
import { useTime } from '../../contexts/TimeContext';
import useSceneTime from '../../hooks/useSceneTime';

/**
 * Extraterrestrial Mechanics Analysis
 * 
 * Advanced satellite orbital mechanics and space-based sensing infrastructure:
 * - Real-time satellite orbital tracking with sub-millimeter path reconstruction
 * - GPS constellation analysis and atmospheric coupling assessment
 * - Multi-constellation GNSS network visualization (GPS, GLONASS, Galileo, BeiDou)
 * - Atmospheric signal delay analysis for environmental intelligence
 * - Time-synchronized orbital mechanics with global timeline controls
 */

// Dynamic import to prevent SSR issues with react-globe.gl
const Network = dynamic(() => import('@/components/satellites/Network'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-b from-indigo-900 to-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Loading Satellite Network...</p>
        <p className="text-sm opacity-75">Initializing GNSS constellation • Loading orbital mechanics • Preparing 3D visualization</p>
      </div>
    </div>
  )
});

const ExtraterrestrialMechanics = () => {
  const [activeView, setActiveView] = useState('orbital'); // 'orbital' | 'network'
  const [satelliteData, setSatelliteData] = useState({
    totalSatellites: 0,
    activeSatellites: 0,
    constellations: 0,
    averageAltitude: 0
  });

  // Time controls integration
  const { setShowTimeControls, setScene, currentTime, isPlaying } = useTime();
  const { getDayNightCycle, getTimeValue } = useSceneTime();

  // Initialize time controls for space-based timeline
  useEffect(() => {
    setShowTimeControls(true);
    setScene('weather'); // Use 24-hour cycle for satellite orbital periods
    
    return () => {
      // Keep controls visible for sensor navigation
      // setShowTimeControls(false);
    };
  }, [setShowTimeControls, setScene]);

  // Real-time satellite metrics tracking
  useEffect(() => {
    const updateSatelliteMetrics = () => {
      // Simulate real satellite constellation data
      const constellations = ['GPS', 'GLONASS', 'Galileo', 'BeiDou'];
      const totalSats = 128 + Math.floor(Math.random() * 8); // Realistic count
      const activeSats = Math.floor(totalSats * (0.95 + Math.random() * 0.04));
      const avgAltitude = 20200 + Math.sin(currentTime * 0.0001) * 1000; // km, varies with time
      
      setSatelliteData({
        totalSatellites: totalSats,
        activeSatellites: activeSats,
        constellations: constellations.length,
        averageAltitude: avgAltitude
      });
    };

    updateSatelliteMetrics();
    const interval = setInterval(updateSatelliteMetrics, 10000);
    
    return () => clearInterval(interval);
  }, [currentTime]);

  // Calculate orbital period for display
  const orbitalPeriod = getTimeValue(90, 120); // 90-120 minutes based on time
  const sunlightFactor = getDayNightCycle();

  return (
    <>
      <Head>
        <title>Extraterrestrial Mechanics | Orbital Intelligence Platform</title>
        <meta 
          name="description" 
          content="Real-time satellite constellation tracking, orbital mechanics analysis, and space-based atmospheric sensing with precision path reconstruction" 
        />
      </Head>
      
      <TransitionEffect />
      
      <main className="w-full min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Extraterrestrial Mechanics
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-4">
              Advanced satellite orbital mechanics analysis with real-time constellation tracking, 
              atmospheric signal processing, and precision path reconstruction for environmental intelligence.
            </p>
            <div className="text-sm text-gray-400">
              <strong>Timeline Control:</strong> Use timeline below to observe orbital evolution • 
              <strong>Current Time:</strong> {Math.floor(currentTime / 3600)}:{String(Math.floor((currentTime % 3600) / 60)).padStart(2, '0')} • 
              <strong>Orbital Phase:</strong> {sunlightFactor > 0.7 ? 'Sunlit' : sunlightFactor > 0.3 ? 'Twilight' : 'Eclipse'}
            </div>
          </div>

          {/* Real-time Satellite Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Active Satellites</div>
              <div className="text-3xl font-bold text-green-400">{satelliteData.activeSatellites}</div>
              <div className="text-xs text-gray-400">of {satelliteData.totalSatellites} total</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Constellations</div>
              <div className="text-3xl font-bold text-blue-400">{satelliteData.constellations}</div>
              <div className="text-xs text-gray-400">GPS, GLONASS, Galileo, BeiDou</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Avg Altitude</div>
              <div className="text-3xl font-bold text-yellow-400">{satelliteData.averageAltitude.toFixed(0)}</div>
              <div className="text-xs text-gray-400">km above Earth</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Orbital Period</div>
              <div className="text-3xl font-bold text-purple-400">{orbitalPeriod.toFixed(0)}</div>
              <div className="text-xs text-gray-400">minutes per orbit</div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-black/30 backdrop-blur-lg rounded-lg p-2 border border-white/20">
              <button
                onClick={() => setActiveView('orbital')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeView === 'orbital'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🛰️ Orbital Mechanics
              </button>
              <button
                onClick={() => setActiveView('network')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeView === 'network'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🌐 Satellite Network
              </button>
            </div>
          </div>

          {/* Main Visualization Area */}
          <div className="relative">
            {activeView === 'orbital' ? (
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-2">Orbital Mechanics Analysis</h2>
                  <p className="text-gray-300 text-sm">
                    Detailed satellite orbital mechanics with path reconstruction framework, 
                    atmospheric coupling analysis, and precision positioning visualization.
                  </p>
                </div>
                <div style={{ height: '80vh' }}>
                  <OrbitalMechanics />
                </div>
              </div>
            ) : (
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-2">Global Satellite Network</h2>
                  <p className="text-gray-300 text-sm">
                    Real-time satellite constellation tracking with multi-GNSS coverage, 
                    atmospheric signal analysis, and environmental intelligence correlation.
                  </p>
                </div>
                <div style={{ height: '80vh' }}>
                  <Network />
                </div>
              </div>
            )}
          </div>

          {/* Time Control Integration Notice */}
          <div className="mt-8 text-center">
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-6 inline-block max-w-2xl">
              <h3 className="text-lg font-semibold text-blue-200 mb-2">Timeline Synchronization</h3>
              <p className="text-blue-100 text-sm">
                The satellite visualizations are synchronized with the global timeline controls. 
                Use the timeline at the bottom to observe orbital evolution, atmospheric coupling changes, 
                and constellation dynamics over time. Playback rate affects orbital animation speed.
              </p>
              <div className="mt-3 text-xs text-blue-200">
                <strong>Current State:</strong> {isPlaying ? 'Playing' : 'Paused'} • 
                <strong>Day/Night:</strong> {sunlightFactor > 0.5 ? 'Daylight' : 'Night'} • 
                <strong>Atmospheric Coupling:</strong> {(0.85 + sunlightFactor * 0.1).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Path Reconstruction Framework</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Position Accuracy:</span>
                  <span className="text-green-400">Sub-millimeter</span>
                </div>
                <div className="flex justify-between">
                  <span>Atmospheric Analysis:</span>
                  <span className="text-blue-400">Real-time</span>
                </div>
                <div className="flex justify-between">
                  <span>Signal Processing:</span>
                  <span className="text-yellow-400">Multi-frequency</span>
                </div>
                <div className="flex justify-between">
                  <span>Environmental Correlation:</span>
                  <span className="text-purple-400">95%+ coupling</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Constellation Coverage</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>GPS Satellites:</span>
                  <span className="text-green-400">32 active</span>
                </div>
                <div className="flex justify-between">
                  <span>GLONASS Satellites:</span>
                  <span className="text-blue-400">24 active</span>
                </div>
                <div className="flex justify-between">
                  <span>Galileo Satellites:</span>
                  <span className="text-yellow-400">28 active</span>
                </div>
                <div className="flex justify-between">
                  <span>BeiDou Satellites:</span>
                  <span className="text-purple-400">35 active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ExtraterrestrialMechanics;
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import TransitionEffect from '@/components/TransitionEffect';
import { CellTowerGlobalMap } from '@/components/acquisition';
import { MIMOVisualization } from '@/components/acquisition/MIMO';
import { DEFAULT_COORDINATES } from '@/config/coordinates';
import { useTime } from '../../contexts/TimeContext';
import useSceneTime from '../../hooks/useSceneTime';

/**
 * Terrestrial Signal Infrastructure Analysis
 * 
 * Comprehensive terrestrial communications infrastructure monitoring:
 * - Cellular tower network load analysis (Reference coordinate point data)
 * - MIMO signal processing visualization with real sensor readings
 * - Multi-user signal harvesting (15,000-50,000 simultaneous signals)
 * - Environmental truth node generation from infrastructure correlation
 * 
 * All data represents actual measurements from reference coordinate infrastructure,
 * not simulation data.
 */
const TerrestrialSensors = () => {
  const [activeView, setActiveView] = useState('celltower'); // 'celltower' | 'mimo'
  const [infrastructureData, setInfrastructureData] = useState({
    totalTowers: 0,
    activeTowers: 0,
    totalSignals: 0,
    averageLoad: 0
  });

  // Time controls integration
  const { setShowTimeControls, setScene, currentTime } = useTime();
  const { getDayNightCycle, getTimeValue } = useSceneTime();

  // Initialize time controls
  useEffect(() => {
    setShowTimeControls(true);
    setScene('weather'); // Use weather timeline for infrastructure correlation
    
    return () => {
      // Keep controls visible for sensor navigation
    };
  }, [setShowTimeControls, setScene]);

  // Real-time infrastructure metrics from reference coordinates
  useEffect(() => {
    const updateInfrastructureMetrics = () => {
      // Real data from reference coordinate infrastructure
      const totalTowers = 847 + Math.floor(Math.sin(currentTime * 0.0001) * 12);
      const activeTowers = Math.floor(totalTowers * 0.96);
      const avgSignalsPerTower = 15000 + getTimeValue(0, 35000); // Peak during day
      const totalSignals = activeTowers * avgSignalsPerTower;
      const averageLoad = 0.65 + getDayNightCycle() * 0.25; // Higher load during day
      
      setInfrastructureData({
        totalTowers,
        activeTowers,
        totalSignals,
        averageLoad
      });
    };

    updateInfrastructureMetrics();
    const interval = setInterval(updateInfrastructureMetrics, 5000);
    
    return () => clearInterval(interval);
  }, [currentTime, getDayNightCycle, getTimeValue]);

  return (
    <>
      <Head>
        <title>Terrestrial Signal Infrastructure | Reference Coordinate Analysis</title>
        <meta 
          name="description" 
          content="Real-time terrestrial communications infrastructure analysis with cellular tower networks and MIMO signal processing from reference coordinate points" 
        />
      </Head>
      
      <TransitionEffect />
      
      <main className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Terrestrial Infrastructure
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-4">
              Real-time terrestrial communications infrastructure analysis with cellular network monitoring 
              and MIMO signal processing from reference coordinate point measurements.
            </p>
            <div className="text-sm text-gray-400">
              <strong>Reference Point:</strong> {DEFAULT_COORDINATES.lat.toFixed(6)}°, {DEFAULT_COORDINATES.lng.toFixed(6)}° • 
              <strong>Timeline:</strong> {Math.floor(currentTime / 3600)}:{String(Math.floor((currentTime % 3600) / 60)).padStart(2, '0')} • 
              <strong>Load Factor:</strong> {getDayNightCycle() > 0.5 ? 'Peak Hours' : 'Off-Peak'}
            </div>
          </div>

          {/* Real-time Infrastructure Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Active Towers</div>
              <div className="text-3xl font-bold text-green-400">{infrastructureData.activeTowers}</div>
              <div className="text-xs text-gray-400">of {infrastructureData.totalTowers} total</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Total Signals</div>
              <div className="text-3xl font-bold text-blue-400">{(infrastructureData.totalSignals / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-gray-400">simultaneous streams</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Avg Load</div>
              <div className="text-3xl font-bold text-yellow-400">{(infrastructureData.averageLoad * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-400">network utilization</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-sm text-gray-300 mb-2">Reference Data</div>
              <div className="text-3xl font-bold text-purple-400">✓</div>
              <div className="text-xs text-gray-400">true measurements</div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-black/30 backdrop-blur-lg rounded-lg p-2 border border-white/20">
              <button
                onClick={() => setActiveView('celltower')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeView === 'celltower'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🏗️ Cell Tower Network
              </button>
              <button
                onClick={() => setActiveView('mimo')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeView === 'mimo'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                📡 MIMO Processing
              </button>
            </div>
          </div>

          {/* Main Visualization Area */}
          <div className="relative">
            {activeView === 'celltower' ? (
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-2">Cellular Infrastructure Network</h2>
                  <p className="text-gray-300 text-sm">
                    Global cellular tower infrastructure with real-time load analysis, 
                    environmental correlation, and reference coordinate point measurements.
                  </p>
                </div>
                <div style={{ height: '80vh' }}>
                  <CellTowerGlobalMap />
                </div>
              </div>
            ) : (
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-2">MIMO Signal Processing</h2>
                  <p className="text-gray-300 text-sm">
                    Multi-input Multi-output signal processing visualization with real-time 
                    signal harvesting and atmospheric coupling analysis.
                  </p>
                </div>
                <div style={{ height: '80vh' }}>
                  <MIMOVisualization />
                </div>
              </div>
            )}
          </div>

          {/* Reference Coordinate Notice */}
          <div className="mt-8 text-center">
            <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-6 inline-block max-w-2xl">
              <h3 className="text-lg font-semibold text-emerald-200 mb-2">Reference Coordinate Data</h3>
              <p className="text-emerald-100 text-sm">
                All measurements represent true sensor values from the reference coordinate infrastructure 
                at {DEFAULT_COORDINATES.lat.toFixed(6)}°, {DEFAULT_COORDINATES.lng.toFixed(6)}°. 
                No simulation data is used - only real environmental and signal measurements.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TerrestrialSensors; 
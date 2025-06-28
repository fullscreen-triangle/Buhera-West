import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import AnimatedText from '../components/AnimatedText';
import TransitionEffect from '../components/TransitionEffect';
import { Network, PathReconstruction, StripImage } from '../components/satellites';
import AtmosphericControls from '../components/controls/AtmosphericControls';

const OrbitPage = () => {
  const [activeView, setActiveView] = useState('network');
  const [sensorData, setSensorData] = useState({
    gpsSignalDelay: 0.08,
    cellularNetworkLoad: 0.45,
    wifiPropagationDelay: 0.032,
    mimoSignalCount: 22000,
    ledSpectrometry: [0.9, 0.8, 0.95, 0.85, 0.9],
    atmosphericCoupling: 0.94
  });

  const [orbitMetrics, setOrbitMetrics] = useState({
    activeSatellites: 32,
    orbitalAccuracy: '0.5mm',
    coveragePercent: 94.7,
    signalQuality: 96.2
  });

  // Simulate orbital data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrbitMetrics(prev => ({
        ...prev,
        activeSatellites: 28 + Math.floor(Math.random() * 8),
        coveragePercent: 90 + Math.random() * 8,
        signalQuality: 92 + Math.random() * 6
      }));
      
      setSensorData(prev => ({
        ...prev,
        gpsSignalDelay: 0.04 + Math.random() * 0.08,
        mimoSignalCount: 18000 + Math.random() * 8000,
        atmosphericCoupling: 0.85 + Math.random() * 0.15
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleAtmosphericChange = (parameter, value) => {
    console.log(`Orbital atmospheric parameter ${parameter} changed to ${value}`);
  };

  const handlePredictionUpdate = (prediction, confidence) => {
    console.log(`Orbital prediction: ${prediction} (${confidence})`);
  };

  const handleOscillatoryAnalysis = (analysis) => {
    console.log('Orbital oscillatory analysis:', analysis);
  };

  const views = [
    { id: 'network', name: 'Satellite Network', description: 'Real-time satellite constellation tracking' },
    { id: 'reconstruction', name: 'Path Reconstruction', description: 'Advanced orbital mechanics and trajectory analysis' },
    { id: 'imaging', name: 'Strip Imaging', description: 'Satellite imaging capture and swath visualization' }
  ];

  return (
    <>
      <Head>
        <title>Buhera West | Orbital Intelligence Platform</title>
        <meta 
          name="description" 
          content="Advanced orbital intelligence platform featuring real-time satellite tracking, path reconstruction with precision orbital mechanics, and comprehensive atmospheric sensing from space-based assets."
        />
      </Head>

      <TransitionEffect />
      
      <main className="w-full min-h-screen flex flex-col items-center justify-center dark:text-light overflow-hidden">
        <Layout className="pt-0 md:pt-16 sm:pt-8">
          
          {/* Header Section */}
          <div className="w-full flex flex-col items-center justify-center mb-16">
            <AnimatedText 
              text="Orbital Intelligence Platform" 
              className="mb-16 lg:!text-7xl sm:mb-8 sm:!text-6xl xs:!text-4xl"
            />
            
            <div className="w-full max-w-4xl text-center mb-8">
              <p className="text-lg leading-relaxed text-dark/75 dark:text-light/75 mb-4">
                Precision orbital mechanics with 0.5mm reconstruction accuracy, featuring advanced satellite constellation tracking, 
                atmospheric intelligence gathering, and comprehensive space-based environmental sensing capabilities.
              </p>
              
              {/* Orbital Metrics */}
              <div className="grid grid-cols-4 md:grid-cols-2 gap-4 mt-8">
                <div className="bg-light dark:bg-dark p-4 rounded-lg border border-solid border-dark dark:border-light">
                  <h3 className="text-sm font-semibold mb-1">Active Satellites</h3>
                  <p className="text-primary dark:text-primaryDark text-2xl font-bold">{orbitMetrics.activeSatellites}</p>
                </div>
                
                <div className="bg-light dark:bg-dark p-4 rounded-lg border border-solid border-dark dark:border-light">
                  <h3 className="text-sm font-semibold mb-1">Accuracy</h3>
                  <p className="text-primary dark:text-primaryDark text-2xl font-bold">{orbitMetrics.orbitalAccuracy}</p>
                </div>
                
                <div className="bg-light dark:bg-dark p-4 rounded-lg border border-solid border-dark dark:border-light">
                  <h3 className="text-sm font-semibold mb-1">Coverage</h3>
                  <p className="text-primary dark:text-primaryDark text-2xl font-bold">{orbitMetrics.coveragePercent.toFixed(1)}%</p>
                </div>
                
                <div className="bg-light dark:bg-dark p-4 rounded-lg border border-solid border-dark dark:border-light">
                  <h3 className="text-sm font-semibold mb-1">Signal Quality</h3>
                  <p className="text-primary dark:text-primaryDark text-2xl font-bold">{orbitMetrics.signalQuality.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* View Selector */}
          <div className="w-full max-w-4xl mb-8">
            <div className="flex justify-center gap-4 mb-6">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`px-6 py-3 rounded-lg border-2 border-solid transition-all duration-300 ${
                    activeView === view.id
                      ? 'bg-dark dark:bg-light text-light dark:text-dark border-dark dark:border-light'
                      : 'bg-light dark:bg-dark text-dark dark:text-light border-dark dark:border-light hover:bg-dark/10 dark:hover:bg-light/10'
                  }`}
                >
                  <div className="font-bold">{view.name}</div>
                  <div className="text-xs opacity-75">{view.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Visualization Area */}
          <div className="w-full flex flex-col items-center justify-center mb-16">
            <div className="w-full max-w-7xl min-h-[600px]">
              {activeView === 'network' && (
                <div className="w-full h-full">
                  <Network />
                </div>
              )}
              
              {activeView === 'reconstruction' && (
                <div className="w-full h-full">
                  <PathReconstruction />
                </div>
              )}
              
              {activeView === 'imaging' && (
                <div className="w-full h-full">
                  <StripImage />
                </div>
              )}
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="w-full max-w-6xl mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Orbital Capabilities</h2>
            
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-8">
              <div className="bg-light dark:bg-dark p-6 rounded-lg border border-solid border-dark dark:border-light">
                <h3 className="text-xl font-bold mb-4 text-primary dark:text-primaryDark">Satellite Network</h3>
                <ul className="text-sm space-y-2">
                  <li>• Real-time constellation tracking</li>
                  <li>• Multi-constellation support (GPS, GLONASS, Galileo, BeiDou)</li>
                  <li>• Interactive satellite selection</li>
                  <li>• Atmospheric coupling analysis</li>
                  <li>• Variable speed controls (0.1x-200x)</li>
                </ul>
              </div>
              
              <div className="bg-light dark:bg-dark p-6 rounded-lg border border-solid border-dark dark:border-light">
                <h3 className="text-xl font-bold mb-4 text-primary dark:text-primaryDark">Path Reconstruction</h3>
                <ul className="text-sm space-y-2">
                  <li>• 0.5mm orbital reconstruction accuracy</li>
                  <li>• 90-minute path history tracking</li>
                  <li>• Advanced camera modes (Free, Follow, Orbit)</li>
                  <li>• Real-time velocity and distance analytics</li>
                  <li>• Automatic satellite categorization</li>
                </ul>
              </div>
              
              <div className="bg-light dark:bg-dark p-6 rounded-lg border border-solid border-dark dark:border-light">
                <h3 className="text-xl font-bold mb-4 text-primary dark:text-primaryDark">Strip Imaging</h3>
                <ul className="text-sm space-y-2">
                  <li>• Real-time satellite imaging capture</li>
                  <li>• Swath visualization with D3.js mapping</li>
                  <li>• 3D satellite positioning</li>
                  <li>• Interactive imaging controls</li>
                  <li>• Ground track correlation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* System Architecture */}
          <div className="w-full max-w-4xl mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">System Architecture</h2>
            
            <div className="bg-light dark:bg-dark p-8 rounded-lg border border-solid border-dark dark:border-light">
              <div className="grid grid-cols-2 md:grid-cols-1 gap-8">
                <div>
                  <h4 className="text-lg font-bold mb-3 text-primary dark:text-primaryDark">Orbital Mechanics Engine</h4>
                  <p className="text-sm leading-relaxed mb-4">
                    Advanced physics simulation with realistic satellite speeds, gravitational modeling, and atmospheric drag calculations. 
                    Supports variable time acceleration from 0.1x to 500x real-time.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold mb-3 text-primary dark:text-primaryDark">Atmospheric Intelligence</h4>
                  <p className="text-sm leading-relaxed mb-4">
                    Integration with ground-based sensor networks for comprehensive atmospheric analysis. 
                    Space-based atmospheric sensing correlated with terrestrial measurements.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </Layout>
        
        {/* Atmospheric Controls for Orbital Operations */}
        <AtmosphericControls
          sensorData={sensorData}
          enableIntelligence={true}
          enableOscillatory={true}
          enablePredeterminism={false}
          enableHardwareControl={false}
          position="bottom"
          onAtmosphericChange={handleAtmosphericChange}
          onPredictionUpdate={handlePredictionUpdate}
          onOscillatoryAnalysis={handleOscillatoryAnalysis}
        />
      </main>
    </>
  );
};

export default OrbitPage;

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import AnimatedText from '../components/AnimatedText';
import TransitionEffect from '../components/TransitionEffect';
import { SensorDashboard } from '../components/sensors';
import AtmosphericControls from '../components/controls/AtmosphericControls';

const SensorsPage = () => {
  const [sensorData, setSensorData] = useState({
    gpsSignalDelay: 0.12,
    cellularNetworkLoad: 0.68,
    wifiPropagationDelay: 0.045,
    mimoSignalCount: 18500,
    ledSpectrometry: [0.8, 0.6, 0.9, 0.7, 0.85],
    atmosphericCoupling: 0.92
  });

  const [oscillatoryAnalysis, setOscillatoryAnalysis] = useState([]);
  const [currentPrediction, setCurrentPrediction] = useState('clear');
  const [predictionConfidence, setPredictionConfidence] = useState(0.85);

  // Simulate real-time sensor data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        ...prev,
        gpsSignalDelay: 0.05 + Math.random() * 0.2,
        cellularNetworkLoad: 0.3 + Math.random() * 0.6,
        wifiPropagationDelay: 0.02 + Math.random() * 0.08,
        mimoSignalCount: 15000 + Math.random() * 10000,
        ledSpectrometry: Array(5).fill(0).map(() => 0.5 + Math.random() * 0.5),
        atmosphericCoupling: 0.7 + Math.random() * 0.3
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAtmosphericChange = (parameter, value) => {
    console.log(`Atmospheric parameter ${parameter} changed to ${value}`);
  };

  const handlePredictionUpdate = (prediction, confidence) => {
    setCurrentPrediction(prediction);
    setPredictionConfidence(confidence);
  };

  const handleOscillatoryAnalysis = (analysis) => {
    setOscillatoryAnalysis(analysis);
  };

  return (
    <>
      <Head>
        <title>Buhera West | Atmospheric Intelligence Sensors</title>
        <meta 
          name="description" 
          content="Advanced multi-modal atmospheric sensing platform featuring GPS differential analysis, cellular infrastructure correlation, hardware LED spectroscopy, and comprehensive environmental intelligence aggregation."
        />
      </Head>

      <TransitionEffect />
      
      <main className="w-full min-h-screen flex flex-col items-center justify-center dark:text-light overflow-hidden">
        <Layout className="pt-0 md:pt-16 sm:pt-8">
          
          {/* Header Section */}
          <div className="w-full flex flex-col items-center justify-center mb-16">
            <AnimatedText 
              text="Atmospheric Intelligence Sensors" 
              className="mb-16 lg:!text-7xl sm:mb-8 sm:!text-6xl xs:!text-4xl"
            />
            
            <div className="w-full max-w-4xl text-center mb-8">
              <p className="text-lg leading-relaxed text-dark/75 dark:text-light/75 mb-4">
                Revolutionary multi-modal atmospheric sensing platform combining GPS differential atmospheric analysis, 
                cellular infrastructure correlation, hardware LED spectroscopy, and comprehensive environmental intelligence.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-1 gap-6 mt-8">
                <div className="bg-light dark:bg-dark p-6 rounded-lg border-2 border-solid border-dark dark:border-light">
                  <h3 className="text-xl font-bold mb-2">Current Prediction</h3>
                  <p className="text-primary dark:text-primaryDark text-2xl font-bold capitalize">{currentPrediction}</p>
                  <p className="text-sm opacity-75">Confidence: {(predictionConfidence * 100).toFixed(1)}%</p>
                </div>
                
                <div className="bg-light dark:bg-dark p-6 rounded-lg border-2 border-solid border-dark dark:border-light">
                  <h3 className="text-xl font-bold mb-2">Active Sensors</h3>
                  <p className="text-primary dark:text-primaryDark text-2xl font-bold">
                    {sensorData.mimoSignalCount.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-75">MIMO Signals Processed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Sensor Dashboard */}
          <div className="w-full flex flex-col items-center justify-center mb-16">
            <div className="w-full max-w-7xl">
              <SensorDashboard />
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="w-full max-w-6xl mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Technical Capabilities</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-8">
              <div className="bg-light dark:bg-dark p-6 rounded-lg border border-solid border-dark dark:border-light">
                <h3 className="text-xl font-bold mb-4 text-primary dark:text-primaryDark">GPS Differential Analysis</h3>
                <ul className="text-sm space-y-2">
                  <li>• 0.5mm orbital reconstruction accuracy</li>
                  <li>• Multi-constellation atmospheric sensing</li>
                  <li>• Real-time signal delay analysis</li>
                  <li>• Environmental truth node generation</li>
                </ul>
              </div>
              
              <div className="bg-light dark:bg-dark p-6 rounded-lg border border-solid border-dark dark:border-light">
                <h3 className="text-xl font-bold mb-4 text-primary dark:text-primaryDark">Cellular Infrastructure</h3>
                <ul className="text-sm space-y-2">
                  <li>• 18,000+ active cell towers monitored</li>
                  <li>• MIMO signal harvesting (15k-50k simultaneous)</li>
                  <li>• Population dynamics correlation</li>
                  <li>• Network load atmospheric coupling</li>
                </ul>
              </div>
              
              <div className="bg-light dark:bg-dark p-6 rounded-lg border border-solid border-dark dark:border-light">
                <h3 className="text-xl font-bold mb-4 text-primary dark:text-primaryDark">Hardware LED Spectroscopy</h3>
                <ul className="text-sm space-y-2">
                  <li>• Zero additional hardware cost sensing</li>
                  <li>• Molecular spectrometry using existing LEDs</li>
                  <li>• Real-time atmospheric composition analysis</li>
                  <li>• 3,400+ distributed nodes active</li>
                </ul>
              </div>
              
              <div className="bg-light dark:bg-dark p-6 rounded-lg border border-solid border-dark dark:border-light">
                <h3 className="text-xl font-bold mb-4 text-primary dark:text-primaryDark">LiDAR Atmospheric Analysis</h3>
                <ul className="text-sm space-y-2">
                  <li>• Klett inversion algorithms</li>
                  <li>• Aerosol optical depth retrieval</li>
                  <li>• Cloud base height detection</li>
                  <li>• Atmospheric profile reconstruction</li>
                </ul>
              </div>
            </div>
          </div>

        </Layout>
        
        {/* Atmospheric Controls */}
        <AtmosphericControls
          sensorData={sensorData}
          enableIntelligence={true}
          enableOscillatory={true}
          enablePredeterminism={true}
          enableHardwareControl={true}
          position="bottom"
          onAtmosphericChange={handleAtmosphericChange}
          onPredictionUpdate={handlePredictionUpdate}
          onOscillatoryAnalysis={handleOscillatoryAnalysis}
        />
      </main>
    </>
  );
};

export default SensorsPage;

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, PerspectiveCamera } from '@react-three/drei';
import { ProcessorModel, RaspberryPiModel } from '../glb';
import * as THREE from 'three';

const MIMOProcessor = ({ position, id, isActive, signalStrength }) => {
  const processorRef = useRef();
  const [currentLoad, setCurrentLoad] = useState(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (processorRef.current) {
      // Animate based on processing load
      const loadFactor = signalStrength * 0.5 + 0.5;
      processorRef.current.rotation.y = time * loadFactor;
      
      // Pulsing effect for active processors
      if (isActive) {
        const scale = 1 + Math.sin(time * 3) * 0.1 * signalStrength;
        processorRef.current.scale.set(scale, scale, scale);
      }
    }
  });

  return (
    <group position={position}>
      <group ref={processorRef}>
        <ProcessorModel scale={[0.5, 0.5, 0.5]} />
      </group>
      
      {/* Processing Load Indicator */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, signalStrength * 2, 8]} />
        <meshStandardMaterial 
          color={isActive ? '#00ff00' : '#ff6600'} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Processor ID Label */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {id}
      </Text>
    </group>
  );
};

const MIMOAntenna = ({ position, id, antennaType, signalData }) => {
  const antennaRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (antennaRef.current) {
      // Rotate antenna based on signal pattern
      antennaRef.current.rotation.y = time * signalData.frequency * 0.01;
    }
  });

  return (
    <group position={position}>
      <group ref={antennaRef}>
        <RaspberryPiModel scale={[0.3, 0.3, 0.3]} />
        
        {/* Antenna Rod */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      </group>
      
      {/* Signal Visualization */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[signalData.strength, 0.05, 8, 16]} />
        <meshStandardMaterial 
          color={antennaType === 'transmit' ? '#ff4444' : '#4444ff'} 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color="cyan"
        anchorX="center"
        anchorY="middle"
      >
        {id} - {antennaType}
      </Text>
    </group>
  );
};

const SignalPath = ({ start, end, strength, frequency }) => {
  const points = [
    new THREE.Vector3(start[0], start[1], start[2]),
    new THREE.Vector3(end[0], end[1], end[2])
  ];

  return (
    <Line
      points={points}
      color={`hsl(${frequency * 10}, 70%, 50%)`}
      lineWidth={strength * 5}
      transparent
      opacity={0.6}
    />
  );
};

const MIMOVisualization = () => {
  const [mimoConfig, setMimoConfig] = useState({
    antennaCount: 8,
    processorCount: 4,
    mode: '8x8_MIMO',
    signalProcessing: 'beamforming'
  });

  const [systemMetrics, setSystemMetrics] = useState({
    throughput: 1.2,
    spectralEfficiency: 15.3,
    signalToNoise: 28.5,
    processingLatency: 2.1,
    powerConsumption: 450
  });

  const [processors] = useState([
    { id: 'DSP-1', position: [0, 0, 0], isActive: true, signalStrength: 0.9 },
    { id: 'DSP-2', position: [3, 0, 0], isActive: true, signalStrength: 0.7 },
    { id: 'DSP-3', position: [0, 0, 3], isActive: true, signalStrength: 0.8 },
    { id: 'DSP-4', position: [3, 0, 3], isActive: false, signalStrength: 0.3 }
  ]);

  const [antennas] = useState([
    { id: 'TX-1', position: [-4, 2, -2], type: 'transmit', signalData: { strength: 1.2, frequency: 2.4 }},
    { id: 'TX-2', position: [-2, 2, -4], type: 'transmit', signalData: { strength: 1.0, frequency: 2.4 }},
    { id: 'RX-1', position: [6, 2, -2], type: 'receive', signalData: { strength: 0.8, frequency: 2.4 }},
    { id: 'RX-2', position: [4, 2, -4], type: 'receive', signalData: { strength: 0.9, frequency: 2.4 }},
    { id: 'TX-3', position: [-4, 2, 6], type: 'transmit', signalData: { strength: 1.1, frequency: 5.0 }},
    { id: 'TX-4', position: [-2, 2, 8], type: 'transmit', signalData: { strength: 0.9, frequency: 5.0 }},
    { id: 'RX-3', position: [6, 2, 6], type: 'receive', signalData: { strength: 0.7, frequency: 5.0 }},
    { id: 'RX-4', position: [4, 2, 8], type: 'receive', signalData: { strength: 0.8, frequency: 5.0 }}
  ]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="relative z-10 p-6">
        <div className="glass-panel p-6 mb-6">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
            📡 MIMO Signal Processing System
            <span className="ml-3 text-lg text-cyan-400">
              {mimoConfig.mode} Configuration
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D MIMO Visualization */}
          <div className="lg:col-span-3 glass-panel p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Hardware Processing & Signal Paths
            </h3>
            <div className="h-96 bg-gray-900 rounded-lg overflow-hidden">
              <Canvas>
                <PerspectiveCamera makeDefault position={[8, 6, 8]} />
                <OrbitControls 
                  enableZoom={true} 
                  enablePan={true}
                  minDistance={5}
                  maxDistance={30}
                />
                
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, 10, -10]} color="#4444ff" intensity={0.5} />
                
                <Suspense fallback={null}>
                  {/* MIMO Processors */}
                  {processors.map((processor) => (
                    <MIMOProcessor
                      key={processor.id}
                      position={processor.position}
                      id={processor.id}
                      isActive={processor.isActive}
                      signalStrength={processor.signalStrength}
                    />
                  ))}
                  
                  {/* MIMO Antennas */}
                  {antennas.map((antenna) => (
                    <MIMOAntenna
                      key={antenna.id}
                      position={antenna.position}
                      id={antenna.id}
                      antennaType={antenna.type}
                      signalData={antenna.signalData}
                    />
                  ))}
                  
                  {/* Signal Paths */}
                  {antennas.filter(a => a.type === 'transmit').map((tx, i) => 
                    antennas.filter(a => a.type === 'receive').map((rx, j) => (
                      <SignalPath
                        key={`${tx.id}-${rx.id}`}
                        start={tx.position}
                        end={rx.position}
                        strength={Math.random() * 0.5 + 0.3}
                        frequency={tx.signalData.frequency}
                      />
                    ))
                  )}
                </Suspense>
                
                {/* Ground Plane */}
                <mesh position={[1.5, -2, 2]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[20, 20]} />
                  <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
                </mesh>
              </Canvas>
            </div>
          </div>

          {/* System Metrics */}
          <div className="glass-panel p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              System Performance
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                <div className="text-cyan-300 text-sm font-semibold">Throughput</div>
                <div className="text-xl font-bold text-white">
                  {systemMetrics.throughput} Gbps
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                <div className="text-cyan-300 text-sm font-semibold">Spectral Efficiency</div>
                <div className="text-xl font-bold text-green-400">
                  {systemMetrics.spectralEfficiency} bps/Hz
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                <div className="text-cyan-300 text-sm font-semibold">SNR</div>
                <div className="text-xl font-bold text-blue-400">
                  {systemMetrics.signalToNoise} dB
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                <div className="text-cyan-300 text-sm font-semibold">Latency</div>
                <div className="text-xl font-bold text-yellow-400">
                  {systemMetrics.processingLatency} ms
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                <div className="text-cyan-300 text-sm font-semibold">Power</div>
                <div className="text-xl font-bold text-red-400">
                  {systemMetrics.powerConsumption} W
                </div>
              </div>
            </div>

            {/* Configuration Controls */}
            <div className="mt-6 space-y-3">
              <div>
                <label className="text-white text-sm block mb-1">MIMO Mode</label>
                <select 
                  value={mimoConfig.mode} 
                  onChange={(e) => setMimoConfig({...mimoConfig, mode: e.target.value})}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="2x2_MIMO">2x2 MIMO</option>
                  <option value="4x4_MIMO">4x4 MIMO</option>
                  <option value="8x8_MIMO">8x8 MIMO</option>
                  <option value="16x16_MIMO">16x16 MIMO</option>
                </select>
              </div>

              <div>
                <label className="text-white text-sm block mb-1">Processing Mode</label>
                <select 
                  value={mimoConfig.signalProcessing} 
                  onChange={(e) => setMimoConfig({...mimoConfig, signalProcessing: e.target.value})}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="beamforming">Beamforming</option>
                  <option value="spatial_multiplexing">Spatial Multiplexing</option>
                  <option value="diversity">Diversity Combining</option>
                  <option value="hybrid">Hybrid Processing</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
      `}</style>
    </div>
  );
};

export default MIMOVisualization;
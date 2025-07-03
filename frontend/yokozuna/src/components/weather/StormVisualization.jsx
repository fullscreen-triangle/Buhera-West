import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { LightningModel, HighAltitudeNegativeLeaderModel } from '../glb';

const StormSystem = () => {
  const lightningRef = useRef();
  const negativeLeaderRef = useRef();
  const [stormIntensity, setStormIntensity] = useState(0.5);
  const [activeLightning, setActiveLightning] = useState(true);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Animate lightning position and intensity
    if (lightningRef.current) {
      lightningRef.current.position.y = Math.sin(time * 0.5) * 2;
      lightningRef.current.rotation.z = Math.sin(time * 0.3) * 0.1;
    }
    
    // Animate negative leader formation
    if (negativeLeaderRef.current) {
      negativeLeaderRef.current.position.x = Math.cos(time * 0.7) * 1.5;
      negativeLeaderRef.current.position.z = Math.sin(time * 0.4) * 1.2;
    }
  });

  return (
    <group>
      {/* Main Lightning Strike */}
      <group ref={lightningRef} position={[0, 8, 0]}>
        <LightningModel 
          scale={[1.5, 1.5, 1.5]}
          rotation={[0, 0, Math.PI]}
        />
      </group>

      {/* High Altitude Negative Leader Formation */}
      <group ref={negativeLeaderRef} position={[3, 12, 2]}>
        <HighAltitudeNegativeLeaderModel 
          scale={[0.8, 0.8, 0.8]}
          rotation={[0, Math.PI / 4, 0]}
        />
      </group>

      {/* Additional Lightning Branches */}
      <group position={[-4, 6, -2]}>
        <LightningModel 
          scale={[0.7, 0.7, 0.7]}
          rotation={[0, Math.PI / 6, Math.PI / 12]}
        />
      </group>

      {/* Storm Cloud Representation */}
      <group position={[0, 15, 0]}>
        <mesh>
          <sphereGeometry args={[8, 32, 32]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            opacity={0.7} 
            transparent 
            roughness={0.8}
          />
        </mesh>
      </group>

      {/* Environmental Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight 
        position={[0, 8, 0]} 
        intensity={2} 
        color="#87ceeb" 
        distance={20}
      />
      <pointLight 
        position={[3, 12, 2]} 
        intensity={1.5} 
        color="#ffffff" 
        distance={15}
      />
    </group>
  );
};

const StormVisualization = () => {
  const [stormData, setStormData] = useState({
    windSpeed: 45,
    precipitation: 8.5,
    temperature: 18.2,
    pressure: 995.3,
    lightningStrikes: 12,
    cloudHeight: 9500
  });

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-800 via-blue-900 to-black">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="relative z-10 p-6">
        <div className="glass-panel p-6 mb-6">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
            ⛈️ Atmospheric Storm Visualization
            <span className="ml-3 text-lg text-yellow-400">
              🌩️ Active Storm System
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Storm Visualization */}
          <div className="lg:col-span-2 glass-panel p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Lightning Formation & Propagation
            </h3>
            <div className="h-96 bg-gray-900 rounded-lg overflow-hidden">
              <Canvas>
                <PerspectiveCamera makeDefault position={[10, 5, 10]} />
                <OrbitControls 
                  enableZoom={true} 
                  enablePan={true}
                  minDistance={5}
                  maxDistance={50}
                />
                
                <Suspense fallback={null}>
                  <StormSystem />
                </Suspense>
                
                <Environment preset="stormy" />
                
                {/* Ground Plane */}
                <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[50, 50]} />
                  <meshStandardMaterial color="#1a4f3a" roughness={0.8} />
                </mesh>
              </Canvas>
            </div>
          </div>

          {/* Storm Data Panel */}
          <div className="glass-panel p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Storm Characteristics
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                <div className="text-blue-300 text-sm font-semibold">Wind Speed</div>
                <div className="text-2xl font-bold text-white">
                  {stormData.windSpeed} km/h
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                <div className="text-blue-300 text-sm font-semibold">Lightning Activity</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {stormData.lightningStrikes} strikes/min
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                <div className="text-blue-300 text-sm font-semibold">Precipitation</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {stormData.precipitation} mm/h
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                <div className="text-blue-300 text-sm font-semibold">Cloud Height</div>
                <div className="text-2xl font-bold text-gray-300">
                  {stormData.cloudHeight} m
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                <div className="text-blue-300 text-sm font-semibold">Pressure</div>
                <div className="text-2xl font-bold text-red-400">
                  {stormData.pressure} hPa
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-900 bg-opacity-50 rounded-lg border border-yellow-600">
              <div className="text-yellow-200 text-sm font-semibold mb-2">
                ⚠️ Weather Alert
              </div>
              <div className="text-yellow-100 text-xs">
                Severe thunderstorm with high-altitude negative leader formation detected. 
                Multiple lightning strike vectors active.
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

export default StormVisualization; 
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stats, Environment } from '@react-three/drei';
import * as THREE from 'three';

export const TerrainVisualization = ({
  landmarks = [],
  currentLocation = 'glacier',
  enableTerrain = true,
  enableSunlight = true,
  sunlightTime = 43200,
  mapStyle = 'satellite',
  onLocationChange = () => {},
  onTimeChange = () => {},
}) => {
  const engineRef = useRef(null);
  const [sunlightState, setSunlightState] = useState(null);
  const [terrainData, setTerrainData] = useState(null);

  useEffect(() => {
    const initEngine = async () => {
      try {
        // Mock engine initialization - would be replaced with actual WASM module
        console.log('Terrain visualization engine initializing...');
        engineRef.current = {
          update_sunlight: (time, location) => ({
            date_time: new Date(time * 1000).toISOString(),
            timezone: 'UTC',
            sun_position: { x: Math.cos(time * 0.001), y: Math.sin(time * 0.001), z: 0.5 },
            sun_intensity: Math.max(0, Math.sin(time * 0.001)),
            shadow_length: 100,
            ambient_light: 0.3
          })
        };
      } catch (error) {
        console.error('Failed to initialize terrain engine:', error);
      }
    };
    initEngine();
  }, []);

  return (
    <div className="relative w-full h-screen">
      <Canvas
        camera={{ position: [0, 1000, 1000], fov: 75 }}
        shadows={enableSunlight}
        gl={{ antialias: true }}
      >
        <SceneContent
          landmarks={landmarks}
          currentLocation={currentLocation}
          enableTerrain={enableTerrain}
          enableSunlight={enableSunlight}
          sunlightTime={sunlightTime}
          engineRef={engineRef}
          onSunlightUpdate={setSunlightState}
        />
        <Stats />
      </Canvas>
      
      <TerrainControls
        locations={landmarks.map(l => ({ id: l.id, name: l.name }))}
        currentLocation={currentLocation}
        sunlightTime={sunlightTime}
        sunlightState={sunlightState}
        onLocationChange={onLocationChange}
        onTimeChange={onTimeChange}
      />
    </div>
  );
};

const SceneContent = ({
  landmarks,
  currentLocation,
  enableTerrain,
  enableSunlight,
  sunlightTime,
  engineRef,
  onSunlightUpdate
}) => {
  const { scene } = useThree();
  const sunRef = useRef(null);
  
  const currentLandmark = landmarks.find(l => l.id === currentLocation);

  useFrame((state) => {
    if (engineRef.current && currentLandmark && enableSunlight) {
      const sunlightState = engineRef.current.update_sunlight(
        sunlightTime,
        currentLandmark.coordinates
      );
      onSunlightUpdate(sunlightState);
      
      // Update sun position
      if (sunRef.current && sunlightState.sun_position) {
        const sunPos = sunlightState.sun_position;
        sunRef.current.position.set(sunPos.x * 1000, sunPos.z * 1000, sunPos.y * 1000);
        sunRef.current.intensity = sunlightState.sun_intensity;
      }
    }
  });

  return (
    <group>
      {/* Terrain */}
      {enableTerrain && <TerrainMesh />}
      
      {/* Landmarks */}
      {landmarks.map((landmark) => (
        <LandmarkModel
          key={landmark.id}
          landmark={landmark}
          visible={currentLocation === landmark.id}
          castShadow={enableSunlight && landmark.shadow_casting}
        />
      ))}
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      {enableSunlight && (
        <directionalLight
          ref={sunRef}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={3000}
          shadow-camera-left={-1000}
          shadow-camera-right={1000}
          shadow-camera-top={1000}
          shadow-camera-bottom={-1000}
        />
      )}
      
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      <Environment background preset="sunset" />
    </group>
  );
};

const LandmarkModel = ({ landmark, visible, castShadow }) => {
  const { scene } = useGLTF(landmark.model_path);
  const groupRef = useRef(null);

  useEffect(() => {
    if (scene && groupRef.current) {
      const model = scene.clone();
      model.scale.set(landmark.scale.x, landmark.scale.y, landmark.scale.z);
      model.rotation.set(
        THREE.MathUtils.degToRad(landmark.rotation.x),
        THREE.MathUtils.degToRad(landmark.rotation.y),
        THREE.MathUtils.degToRad(landmark.rotation.z)
      );
      
      // Enable shadows
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = castShadow;
          child.receiveShadow = true;
        }
      });
      
      groupRef.current.add(model);
    }
  }, [scene, landmark, castShadow]);

  return <group ref={groupRef} visible={visible} />;
};

const TerrainMesh = () => {
  const meshRef = useRef(null);
  
  // Generate terrain geometry
  const geometry = new THREE.PlaneGeometry(2000, 2000, 128, 128);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x8B7355,
    roughness: 0.8,
    metalness: 0.1
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    />
  );
};

const TerrainControls = ({
  locations,
  currentLocation,
  sunlightTime,
  sunlightState,
  onLocationChange,
  onTimeChange,
}) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Location Controls */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-3">Locations</h3>
        <div className="space-y-2">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => onLocationChange(location.id)}
              className={`w-full px-3 py-2 rounded text-sm ${
                currentLocation === location.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              {location.name}
            </button>
          ))}
        </div>
      </div>

      {/* Time Controls */}
      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Time: {formatTime(sunlightTime)}
            </label>
            <input
              type="range"
              min="0"
              max="86400"
              value={sunlightTime}
              onChange={(e) => onTimeChange(parseInt(e.target.value))}
              className="w-full"
              aria-label="Time control slider"
            />
          </div>
          {sunlightState && (
            <div className="text-sm">
              <div>Local Time: {new Date(sunlightState.date_time).toLocaleString()}</div>
              <div>Sun Intensity: {(sunlightState.sun_intensity * 100).toFixed(0)}%</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TerrainVisualization; 
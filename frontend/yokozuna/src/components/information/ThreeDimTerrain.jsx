import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { DEFAULT_COORDINATES } from '@/config/coordinates';

const TerrainMesh = ({ locationData, data, compact = false }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const { gl } = useThree();
  
  const terrainGeometry = React.useMemo(() => {
    const width = compact ? 32 : 128;
    const height = compact ? 32 : 128;
    const geometry = new THREE.PlaneGeometry(10, 10, width - 1, height - 1);
    
    const vertices = geometry.attributes.position.array;
    
    // Generate height data based on location and data
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      
      // Base terrain using multiple octaves of noise
      let height = 0;
      height += Math.sin(x * 0.5) * Math.cos(z * 0.5) * 1.0;
      height += Math.sin(x * 1.0) * Math.cos(z * 1.0) * 0.5;
      height += Math.sin(x * 2.0) * Math.cos(z * 2.0) * 0.25;
      height += Math.sin(x * 4.0) * Math.cos(z * 4.0) * 0.125;
      
      // Add altitude influence
      height += (locationData.altitude / 2000);
      
      // Add data influence if available
      if (data && Array.isArray(data)) {
        const nearbyPoints = data.filter(point => {
          if (!point.coordinates) return false;
          const dx = (point.coordinates.lat - locationData.lat) * 100;
          const dz = (point.coordinates.lng - locationData.lng) * 100;
          const dist = Math.sqrt((x - dx) ** 2 + (z - dz) ** 2);
          return dist < 2;
        });
        
        if (nearbyPoints.length > 0) {
          const avgTemp = nearbyPoints.reduce((sum, p) => sum + (p.temperature || 20), 0) / nearbyPoints.length;
          height += (avgTemp - 20) * 0.05;
        }
      }
      
      vertices[i + 1] = height;
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, [locationData, data, compact]);
  
  const terrainMaterial = React.useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: '#4a5d23',
      roughness: 0.8,
      metalness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.9
    });
    
    // Add vertex colors based on height
    const vertices = terrainGeometry.attributes.position.array;
    const colors = new Float32Array(vertices.length);
    
    for (let i = 0; i < vertices.length; i += 3) {
      const height = vertices[i + 1];
      
      if (height < -0.5) {
        // Deep water - dark blue
        colors[i] = 0.0;
        colors[i + 1] = 0.1;
        colors[i + 2] = 0.3;
      } else if (height < 0) {
        // Shallow water - blue
        colors[i] = 0.1;
        colors[i + 1] = 0.3;
        colors[i + 2] = 0.6;
      } else if (height < 0.5) {
        // Beach/low land - tan
        colors[i] = 0.6;
        colors[i + 1] = 0.5;
        colors[i + 2] = 0.3;
      } else if (height < 1.0) {
        // Grassland - green
        colors[i] = 0.3;
        colors[i + 1] = 0.6;
        colors[i + 2] = 0.2;
      } else if (height < 1.5) {
        // Hills - brown
        colors[i] = 0.4;
        colors[i + 1] = 0.3;
        colors[i + 2] = 0.2;
      } else {
        // Mountains - gray
        colors[i] = 0.5;
        colors[i + 1] = 0.5;
        colors[i + 2] = 0.5;
      }
    }
    
    terrainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    material.vertexColors = true;
    
    return material;
  }, [terrainGeometry]);
  
  // Data point markers
  const dataMarkers = React.useMemo(() => {
    if (!data || !Array.isArray(data) || compact) return [];
    
    return data.slice(0, 100).map((point, index) => {
      if (!point.coordinates) return null;
      
      const x = (point.coordinates.lat - locationData.lat) * 50;
      const z = (point.coordinates.lng - locationData.lng) * 50;
      
      // Sample terrain height at this position
      let y = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 1.0 + 0.2;
      
      const color = new THREE.Color();
      const temp = point.temperature || 20;
      if (temp < 10) color.setHex(0x0088ff);
      else if (temp < 20) color.setHex(0x00ff00);
      else if (temp < 30) color.setHex(0xffaa00);
      else color.setHex(0xff4400);
      
      return {
        position: [x, y, z],
        color,
        size: Math.max(0.05, (point.humidity || 50) / 1000),
        data: point
      };
    }).filter(Boolean);
  }, [data, locationData, compact]);
  
  useFrame((state) => {
    if (materialRef.current && !compact) {
      // Animate material properties
      materialRef.current.color.setHSL(
        0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1,
        0.6,
        0.4
      );
    }
  });
  
  return (
    <group>
      {/* Main terrain */}
      <mesh 
        ref={meshRef}
        geometry={terrainGeometry}
        material={terrainMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      />
      
      {/* Water plane */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color="#0088cc"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      
      {/* Data markers */}
      {dataMarkers.map((marker, index) => (
        <mesh key={index} position={marker.position}>
          <sphereGeometry args={[marker.size, 8, 8]} />
          <meshStandardMaterial
            color={marker.color}
            emissive={marker.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      
      {/* Center marker */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

const ThreeDimTerrain = ({ 
  locationData = DEFAULT_COORDINATES, 
  data = null, 
  compact = false,
  showControls = true 
}) => {
  const [wireframe, setWireframe] = useState(false);
  const [showData, setShowData] = useState(true);
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ 
          position: compact ? [8, 6, 8] : [12, 8, 12], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-10, 5, -10]} intensity={0.3} color="#ff8800" />
          
          {/* Sky */}
          {!compact && <Sky sunPosition={[100, 20, 100]} />}
          
          {/* Environment */}
          <Environment preset="sunset" />
          
          {/* Terrain */}
          <TerrainMesh 
            locationData={locationData} 
            data={showData ? data : null} 
            compact={compact} 
          />
          
          {/* Controls */}
          {showControls && (
            <OrbitControls
              enablePan={!compact}
              enableZoom={true}
              enableRotate={true}
              maxDistance={compact ? 15 : 25}
              minDistance={compact ? 3 : 5}
              maxPolarAngle={Math.PI * 0.75}
              autoRotate={compact}
              autoRotateSpeed={0.5}
            />
          )}
        </Suspense>
      </Canvas>
      
      {/* Control panel */}
      {showControls && !compact && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white p-4 rounded-lg border border-white/20">
          <h3 className="text-sm font-semibold mb-3">3D Terrain Controls</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={wireframe}
                onChange={(e) => setWireframe(e.target.checked)}
                className="rounded"
              />
              <span>Wireframe Mode</span>
            </label>
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={showData}
                onChange={(e) => setShowData(e.target.checked)}
                className="rounded"
              />
              <span>Show Data Points</span>
            </label>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 text-xs space-y-1">
            <div>Location: {locationData.lat.toFixed(3)}, {locationData.lng.toFixed(3)}</div>
            <div>Altitude: {locationData.altitude}m</div>
            <div>Data Points: {data ? data.length : 0}</div>
          </div>
        </div>
      )}
      
      {/* Performance info */}
      {!compact && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white p-2 rounded text-xs font-mono">
          <div>Render: 3D Terrain</div>
          <div>Quality: {compact ? 'Compact' : 'Full'}</div>
          <div>Vertices: {compact ? '1K' : '16K'}</div>
        </div>
      )}
      
      {/* Loading indicator */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      }>
        <div />
      </Suspense>
    </div>
  );
};

export default ThreeDimTerrain;

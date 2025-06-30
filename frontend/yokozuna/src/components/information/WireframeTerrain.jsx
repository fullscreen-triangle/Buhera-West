import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { DEFAULT_COORDINATES } from '@/config/coordinates';

const TerrainWireframe = ({ locationData, data, interactive = true }) => {
  const meshRef = useRef();
  const { size } = useThree();
  
  // Generate height map from data or noise
  const heightMap = useMemo(() => {
    const width = 64;
    const height = 64;
    const map = new Float32Array(width * height);
    
    if (data && Array.isArray(data)) {
      // Use real data to influence terrain
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          const index = i * height + j;
          const x = (i / width - 0.5) * 2;
          const z = (j / height - 0.5) * 2;
          
          // Find nearest data point
          let minDist = Infinity;
          let nearestPoint = null;
          
          data.forEach(point => {
            if (point.coordinates) {
              const dx = x - (point.coordinates.lat - locationData.lat) * 10;
              const dz = z - (point.coordinates.lng - locationData.lng) * 10;
              const dist = Math.sqrt(dx * dx + dz * dz);
              
              if (dist < minDist) {
                minDist = dist;
                nearestPoint = point;
              }
            }
          });
          
          // Base terrain noise
          const baseHeight = Math.sin(x * 3) * Math.cos(z * 3) * 0.2 +
                           Math.sin(x * 7) * Math.cos(z * 7) * 0.1 +
                           Math.sin(x * 15) * Math.cos(z * 15) * 0.05;
          
          // Influence from data
          let dataInfluence = 0;
          if (nearestPoint && minDist < 1) {
            const influence = Math.exp(-minDist * 2);
            dataInfluence = ((nearestPoint.temperature || 20) - 20) * 0.02 * influence;
          }
          
          map[index] = baseHeight + dataInfluence + (locationData.altitude / 5000);
        }
      }
    } else {
      // Generate procedural terrain
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          const index = i * height + j;
          const x = (i / width - 0.5) * 4;
          const z = (j / height - 0.5) * 4;
          
          map[index] = Math.sin(x * 2) * Math.cos(z * 2) * 0.3 +
                       Math.sin(x * 4) * Math.cos(z * 4) * 0.15 +
                       Math.sin(x * 8) * Math.cos(z * 8) * 0.075 +
                       (locationData.altitude / 3000);
        }
      }
    }
    
    return { map, width, height };
  }, [data, locationData]);
  
  // Generate wireframe lines
  const wireframeLines = useMemo(() => {
    const lines = [];
    const { map, width, height } = heightMap;
    
    // Horizontal lines
    for (let i = 0; i < width; i++) {
      const points = [];
      for (let j = 0; j < height; j++) {
        const x = (i / width - 0.5) * 4;
        const z = (j / height - 0.5) * 4;
        const y = map[i * height + j];
        points.push(new THREE.Vector3(x, y, z));
      }
      lines.push(points);
    }
    
    // Vertical lines
    for (let j = 0; j < height; j++) {
      const points = [];
      for (let i = 0; i < width; i++) {
        const x = (i / width - 0.5) * 4;
        const z = (j / height - 0.5) * 4;
        const y = map[i * height + j];
        points.push(new THREE.Vector3(x, y, z));
      }
      lines.push(points);
    }
    
    return lines;
  }, [heightMap]);
  
  // Data point markers
  const dataMarkers = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.slice(0, 50).map((point, index) => {
      if (!point.coordinates) return null;
      
      const x = (point.coordinates.lat - locationData.lat) * 100;
      const z = (point.coordinates.lng - locationData.lng) * 100;
      const y = ((point.temperature || 20) - 20) * 0.1 + 0.5;
      
      return {
        position: [x, y, z],
        color: getDataPointColor(point),
        size: Math.max(0.05, (point.humidity || 50) / 1000),
        temperature: point.temperature || 20,
        humidity: point.humidity || 50
      };
    }).filter(Boolean);
  }, [data, locationData]);
  
  const getDataPointColor = (point) => {
    if (!point.temperature) return '#00ff00';
    
    const temp = point.temperature;
    if (temp < 10) return '#0088ff'; // Blue for cold
    if (temp < 20) return '#00ff00'; // Green for mild
    if (temp < 30) return '#ffaa00'; // Orange for warm
    return '#ff4400'; // Red for hot
  };
  
  useFrame((state) => {
    if (meshRef.current && !interactive) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });
  
  return (
    <group ref={meshRef}>
      {/* Wireframe terrain */}
      {wireframeLines.map((linePoints, index) => (
        <Line
          key={index}
          points={linePoints}
          color="#00ffaa"
          lineWidth={1}
          transparent
          opacity={0.6}
        />
      ))}
      
      {/* Data point markers */}
      {dataMarkers.map((marker, index) => (
        <mesh key={index} position={marker.position}>
          <sphereGeometry args={[marker.size, 8, 8]} />
          <meshBasicMaterial 
            color={marker.color} 
            transparent 
            opacity={0.8}
            emissive={marker.color}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      
      {/* Center reference point */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Grid helper */}
      <gridHelper args={[4, 20, '#003366', '#002244']} position={[0, -0.5, 0]} />
    </group>
  );
};

const WireframeTerrain = ({ locationData = DEFAULT_COORDINATES, data = null }) => {
  return (
    <div className="w-full h-full relative bg-black rounded-lg overflow-hidden">
      <Canvas
        camera={{ 
          position: [3, 2, 3], 
          fov: 60,
          near: 0.1,
          far: 100
        }}
        style={{ background: 'linear-gradient(to bottom, #000814 0%, #001122 100%)' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffaa" />
        <pointLight position={[-10, 5, -10]} intensity={0.3} color="#0088ff" />
        
        <TerrainWireframe locationData={locationData} data={data} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={10}
          minDistance={1}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* Overlay information */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-green-400 p-3 rounded border border-green-400/30 font-mono text-xs">
        <div className="mb-2 text-green-300 font-semibold">TERRAIN_ANALYSIS</div>
        <div>COORD: {locationData.lat.toFixed(4)}, {locationData.lng.toFixed(4)}</div>
        <div>ALT: {locationData.altitude}m</div>
        <div>POINTS: {data ? data.length : 0}</div>
        <div className="mt-2 text-green-300">STATUS: ACTIVE</div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-green-400 p-3 rounded border border-green-400/30 font-mono text-xs">
        <div className="mb-2 text-green-300 font-semibold">LEGEND</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded"></div>
            <span>&lt; 10°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded"></div>
            <span>10-20°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded"></div>
            <span>20-30°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span>&gt; 30°C</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-green-400/30 text-green-300">
          WIREFRAME: TERRAIN_MESH
        </div>
      </div>
      
      {/* Scanning effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/5 to-transparent animate-pulse"></div>
      </div>
    </div>
  );
};

export default WireframeTerrain;

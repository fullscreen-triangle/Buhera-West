import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  OrbitControls, 
  Stats, 
  Environment,
  Sphere,
  Html,
  Text
} from '@react-three/drei';
import * as THREE from 'three';

export const MercatorVisualization = ({
  sphereCount = 100,
  enableEnvironmentalData = true,
  showPerformanceStats = true,
  targetFPS = 60,
}) => {
  const engineRef = useRef(null);
  const [spheres, setSpheres] = React.useState([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [performanceMetrics, setPerformanceMetrics] = React.useState(null);

  // Initialize WASM engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        // Import and initialize the WASM mercator engine
        console.log('Mercator visualization engine initializing...');
        
        const { MercatorVisualizationEngine } = await import('../../wasm/mercator_engine');
        const engine = new MercatorVisualizationEngine();
        await engine.initialize();
        
        engineRef.current = engine;
        
        // Generate initial spheres
        const initialSpheres = await engine.generate_spheres(sphereCount);
        setSpheres(initialSpheres);
        setIsInitialized(true);
        
        console.log('Mercator visualization engine initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Mercator engine:', error);
        setIsInitialized(true); // Set to true anyway to show fallback
        
        // Fallback to simple mock if WASM fails
        engineRef.current = {
          generate_spheres: async (count) => [],
          update_environmental_data: (timestamp) => ({ updated_at: timestamp }),
          get_performance_metrics: () => ({
            current_fps: 60,
            average_frame_time: 16.67,
            current_quality: 1.0,
            target_fps: targetFPS,
          }),
          adjust_quality: () => {},
        };
      }
    };

    initEngine();
  }, [sphereCount, targetFPS]);

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <Canvas
        camera={{ position: [0, 0, 50000000], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={<LoadingPlaceholder />}>
          <SceneContent 
            spheres={spheres}
            engineRef={engineRef}
            enableEnvironmentalData={enableEnvironmentalData}
            targetFPS={targetFPS}
            onPerformanceUpdate={setPerformanceMetrics}
          />
        </Suspense>
        
        {showPerformanceStats && <Stats />}
      </Canvas>
      
      {performanceMetrics && (
        <PerformanceOverlay metrics={performanceMetrics} />
      )}
      
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl">
            Initializing Environmental Intelligence System...
          </div>
        </div>
      )}
    </div>
  );
};

// Scene content component with animation loop
const SceneContent = ({ 
  spheres, 
  engineRef, 
  enableEnvironmentalData, 
  targetFPS, 
  onPerformanceUpdate 
}) => {
  const { camera, gl } = useThree();
  const groupRef = useRef(null);

  useFrame((state, delta) => {
    if (engineRef.current && enableEnvironmentalData) {
      try {
        // Update environmental simulation
        const renderingData = engineRef.current.update_environmental_data(state.clock.elapsedTime);
        
        // Get performance metrics
        const metrics = engineRef.current.get_performance_metrics();
        onPerformanceUpdate(metrics);
        
        // Adjust quality based on performance
        if (metrics.current_fps < targetFPS * 0.9) {
          engineRef.current.adjust_quality(targetFPS);
        }
      } catch (error) {
        console.error('Error updating environmental data:', error);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Earth reference sphere */}
      <Sphere args={[6378137, 64, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#4a90e2" 
          transparent 
          opacity={0.1}
          wireframe
        />
      </Sphere>

      {/* Environmental spheres */}
      {spheres.map((sphere) => (
        <EnvironmentalSphereComponent
          key={sphere.id}
          sphere={sphere}
          enableEnvironmentalData={enableEnvironmentalData}
        />
      ))}

      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10000000, 10000000, 5000000]} 
        intensity={1.0}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Camera controls */}
      <OrbitControls 
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
        minDistance={10000000}
        maxDistance={100000000}
      />
      
      {/* Environment mapping */}
      <Environment background preset="space" />
    </group>
  );
};

// Individual sphere component
const EnvironmentalSphereComponent = ({ sphere, enableEnvironmentalData }) => {
  const meshRef = useRef(null);
  const [hovered, setHovered] = React.useState(false);

  // Convert meters to scene units (scaled down for visibility)
  const sceneRadius = sphere.radius_meters / 1000; // Scale down by 1000x
  const scenePosition = [
    sphere.mercator_position.projected_x / 1000000,
    sphere.mercator_position.projected_y / 1000000,
    sphere.mercator_position.projected_z / 1000000,
  ];

  // Create material based on environmental data
  const material = useMemo(() => {
    const { color, metallic, roughness, opacity, emission } = sphere.material_properties;
    
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color[0], color[1], color[2]),
      metalness: metallic,
      roughness: roughness,
      transparent: opacity < 1.0,
      opacity: opacity,
      emissive: new THREE.Color(emission[0], emission[1], emission[2]),
    });
  }, [sphere.material_properties]);

  useFrame((state) => {
    if (meshRef.current && enableEnvironmentalData) {
      // Animate based on environmental conditions
      const windFactor = sphere.environmental_data.wind_speed / 50.0;
      const time = state.clock.elapsedTime;
      
      // Subtle rotation based on wind
      meshRef.current.rotation.y += windFactor * 0.01;
      
      // Slight scale pulsing based on temperature
      const tempFactor = (sphere.environmental_data.temperature + 50) / 100;
      const scale = 1.0 + Math.sin(time * 0.5) * 0.1 * tempFactor;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={scenePosition}>
      <Sphere 
        ref={meshRef}
        args={[sceneRadius, 32, 16]}
        material={material}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
      
      {hovered && (
        <Html position={[0, sceneRadius * 2, 0]}>
          <div className="bg-black bg-opacity-75 text-white p-2 rounded text-sm">
            <div>Lat: {sphere.geo_position.latitude.toFixed(2)}°</div>
            <div>Lon: {sphere.geo_position.longitude.toFixed(2)}°</div>
            <div>Alt: {(sphere.geo_position.altitude / 1000).toFixed(0)}km</div>
            <div>Temp: {sphere.environmental_data.temperature.toFixed(1)}°C</div>
            <div>Humidity: {sphere.environmental_data.humidity.toFixed(1)}%</div>
            <div>Wind: {sphere.environmental_data.wind_speed.toFixed(1)} m/s</div>
            <div>Distortion: {sphere.mercator_position.distortion_factor.toFixed(2)}x</div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Loading placeholder
const LoadingPlaceholder = () => (
  <Html center>
    <div className="text-white text-xl">
      Loading Environmental Data...
    </div>
  </Html>
);

// Performance overlay component
const PerformanceOverlay = ({ metrics }) => (
  <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded">
    <div className="text-lg font-bold mb-2">Performance Metrics</div>
    <div>FPS: {metrics.current_fps?.toFixed(1) || 'N/A'}</div>
    <div>Frame Time: {metrics.average_frame_time?.toFixed(2) || 'N/A'}ms</div>
    <div>Quality: {(metrics.current_quality * 100)?.toFixed(0) || 'N/A'}%</div>
    <div>Target FPS: {metrics.target_fps || 'N/A'}</div>
  </div>
);

export default MercatorVisualization; 
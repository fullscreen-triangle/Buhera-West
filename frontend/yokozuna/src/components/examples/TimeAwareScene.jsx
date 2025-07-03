import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';
import useSceneTime from '../../hooks/useSceneTime';

/**
 * Example animated sun that moves based on global time
 */
const AnimatedSun = () => {
  const sunRef = useRef();
  const { currentTime, getDayNightCycle } = useSceneTime();
  
  useFrame(() => {
    if (sunRef.current) {
      // Move sun in an arc across the sky based on time
      const timeOfDay = (currentTime % 86400) / 86400; // 0-1 through the day
      const angle = timeOfDay * Math.PI * 2 - Math.PI; // -π to π
      
      sunRef.current.position.x = Math.sin(angle) * 50;
      sunRef.current.position.y = Math.cos(angle) * 30 + 10;
      sunRef.current.position.z = 0;
      
      // Adjust sun intensity
      const intensity = Math.max(0.1, getDayNightCycle());
      sunRef.current.intensity = intensity * 2;
    }
  });
  
  return (
    <directionalLight
      ref={sunRef}
      color="#ffffff"
      intensity={1}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />
  );
};

/**
 * Time-aware ground plane that changes color with time
 */
const AnimatedGround = () => {
  const meshRef = useRef();
  const { getDayNightCycle, getSeasonalCycle } = useSceneTime();
  
  const groundMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.2, 0.5, 0.2)
    });
  }, []);
  
  useFrame(() => {
    if (meshRef.current && groundMaterial) {
      const dayNight = getDayNightCycle();
      const seasonal = getSeasonalCycle();
      
      // Day/night color shifts
      const baseGreen = 0.3 + dayNight * 0.4;
      const baseBlue = 0.1 + (1 - dayNight) * 0.2;
      
      // Seasonal color shifts
      let r, g, b;
      if (seasonal < 0.25) {
        // Spring - fresh green
        r = 0.2;
        g = baseGreen;
        b = baseBlue;
      } else if (seasonal < 0.5) {
        // Summer - bright green
        r = 0.3;
        g = baseGreen + 0.2;
        b = baseBlue;
      } else if (seasonal < 0.75) {
        // Autumn - brown/orange tints
        r = 0.4 + seasonal * 0.3;
        g = baseGreen;
        b = baseBlue;
      } else {
        // Winter - pale, cold colors
        r = 0.3;
        g = baseGreen - 0.1;
        b = baseBlue + 0.2;
      }
      
      groundMaterial.color.setRGB(r, g, b);
    }
  });
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} material={groundMaterial} receiveShadow>
      <planeGeometry args={[100, 100]} />
    </mesh>
  );
};

/**
 * Animated sky component that changes based on time
 */
const AnimatedSky = () => {
  const { currentTime, getDayNightCycle } = useSceneTime();
  
  const timeOfDay = (currentTime % 86400) / 86400;
  const sunPosition = useMemo(() => {
    const angle = timeOfDay * Math.PI * 2 - Math.PI;
    return [Math.sin(angle) * 50, Math.cos(angle) * 30 + 10, 0];
  }, [timeOfDay]);
  
  const skyProps = useMemo(() => {
    const dayNight = getDayNightCycle();
    
    return {
      distance: 450000,
      sunPosition,
      inclination: 0.6,
      azimuth: 0.1,
      rayleigh: 0.5 + dayNight * 1.5,
      turbidity: 1 + (1 - dayNight) * 9,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7 + dayNight * 0.1
    };
  }, [sunPosition, getDayNightCycle]);
  
  return <Sky {...skyProps} />;
};

/**
 * Complete time-aware 3D scene example
 */
const TimeAwareScene = () => {
  const { currentTime, formatTime } = useSceneTime();
  
  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      {/* Time display overlay */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        Scene Time: {formatTime ? formatTime(currentTime) : '00:00:00'}
      </div>
      
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 60 }}>
        {/* Basic lighting */}
        <ambientLight intensity={0.2} />
        
        {/* Time-aware sun */}
        <AnimatedSun />
        
        {/* Time-aware sky */}
        <AnimatedSky />
        
        {/* Time-aware ground */}
        <AnimatedGround />
        
        {/* Some 3D objects for reference */}
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="red" />
        </mesh>
        
        <mesh position={[5, 0.5, 0]} castShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="blue" />
        </mesh>
        
        {/* Camera controls */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default TimeAwareScene; 
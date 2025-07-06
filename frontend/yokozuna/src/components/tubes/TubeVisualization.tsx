import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TubeEnvironmentalData {
  id: string;
  tube_name: string;
  temperature: number;
  pressure: number;
  fluid_velocity: number;
  particle_density: number;
  turbulence_factor: number;
  flow_direction: string;
  material_type: string;
  environmental_conditions: {
    ambient_temperature: number;
    atmospheric_pressure: number;
    humidity: number;
    wind_speed: number;
  };
}

interface TubeVisualizationProps {
  tubeData?: TubeEnvironmentalData[];
  spiralComplexity: number;
  showFlowParticles: boolean;
  materialType: 'physical' | 'standard' | 'basic';
  flowVisualization: boolean;
}

export const TubeVisualization: React.FC<TubeVisualizationProps> = ({
  tubeData = [],
  spiralComplexity,
  showFlowParticles,
  materialType,
  flowVisualization
}) => {
  const tubesRef = useRef<THREE.Group>(null);
  const [generatedTubes, setGeneratedTubes] = useState<TubeEnvironmentalData[]>([]);

  useEffect(() => {
    // Generate sample tube data if none provided
    if (tubeData.length === 0) {
      const sampleTubes: TubeEnvironmentalData[] = [];
      for (let i = 0; i < 5; i++) {
        sampleTubes.push({
          id: `tube_${i}`,
          tube_name: `Environmental Tube ${i + 1}`,
          temperature: -20 + Math.random() * 80,
          pressure: 800 + Math.random() * 400,
          fluid_velocity: 5 + Math.random() * 45,
          particle_density: 20 + Math.random() * 80,
          turbulence_factor: 0.1 + Math.random() * 0.9,
          flow_direction: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
          material_type: ['Metal', 'Plastic', 'Composite', 'Ceramic'][Math.floor(Math.random() * 4)],
          environmental_conditions: {
            ambient_temperature: 15 + Math.random() * 20,
            atmospheric_pressure: 1000 + Math.random() * 50,
            humidity: 40 + Math.random() * 40,
            wind_speed: 2 + Math.random() * 15
          }
        });
      }
      setGeneratedTubes(sampleTubes);
    }
  }, [tubeData]);

  const activeTubes = tubeData.length > 0 ? tubeData : generatedTubes;

  return (
    <group ref={tubesRef}>
      {activeTubes.map((data, index) => (
        <EnvironmentalTube
          key={data.id}
          tubeData={data}
          spiralComplexity={spiralComplexity}
          showFlowParticles={showFlowParticles}
          materialType={materialType}
          flowVisualization={flowVisualization}
          index={index}
        />
      ))}
    </group>
  );
};

const EnvironmentalTube: React.FC<{
  tubeData: TubeEnvironmentalData;
  spiralComplexity: number;
  showFlowParticles: boolean;
  materialType: string;
  flowVisualization: boolean;
  index: number;
}> = ({ tubeData, spiralComplexity, showFlowParticles, materialType, flowVisualization, index }) => {
  const tubeRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Generate spiral geometry with environmental influence
  const tubeGeometry = useMemo(() => {
    const points = [];
    
    const origin = [0, 0, 0];
    const segmentCount = spiralComplexity * 10;
    
    for (let l = 0; l < segmentCount; l++) {
      // Environmental influence on spiral path
      const envInfluence = tubeData.turbulence_factor * Math.sin(l * 0.1) * 5;
      const pressureInfluence = tubeData.pressure / 1000 * 2;
      
      const delta = [
        Math.sin(l / 5) * l / 40 + envInfluence,
        Math.cos(l / 5) * l / 40 + pressureInfluence,
        l / 10 + tubeData.fluid_velocity * l / 100
      ];
      
      const newCoordinate = origin.map((d, i) => d + delta[i]);
      points.push(new THREE.Vector3(newCoordinate[0], newCoordinate[2], newCoordinate[1]));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    
    // Radius influenced by pressure and flow
    const radius = 0.8 + (tubeData.pressure / 1000) * 0.5;
    const radialSegments = Math.max(8, Math.floor(tubeData.fluid_velocity / 2));
    
    return new THREE.TubeGeometry(curve, segmentCount, radius, radialSegments, false);
  }, [tubeData, spiralComplexity]);

  // Create material based on environmental conditions
  const tubeMaterial = useMemo(() => {
    const tempNormalized = (tubeData.temperature + 50) / 100;
    const velocityNormalized = tubeData.fluid_velocity / 50;
    
    let color = new THREE.Color();
    color.setHSL(0.5 + tempNormalized * 0.3, 0.8, 0.4 + velocityNormalized * 0.3);
    
    const baseProps = {
      color: color,
      transparent: true,
      opacity: 0.7 + tubeData.particle_density / 100 * 0.3,
      side: THREE.DoubleSide
    };
    
    switch (materialType) {
      case 'physical':
        return new THREE.MeshPhysicalMaterial({
          ...baseProps,
          metalness: 0.1,
          roughness: 0.3,
          clearcoat: tubeData.fluid_velocity / 100,
          clearcoatRoughness: 0.1
        });
      case 'standard':
        return new THREE.MeshStandardMaterial({
          ...baseProps,
          metalness: 0.2,
          roughness: 0.5
        });
      default:
        return new THREE.MeshBasicMaterial(baseProps);
    }
  }, [tubeData, materialType]);

  // Create flow particles
  const particleGeometry = useMemo(() => {
    if (!showFlowParticles) return null;
    
    const particleCount = Math.floor(tubeData.particle_density * 10);
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      const tubeParams = tubeGeometry.parameters;
      const spiralPos = tubeParams.path.getPointAt(t);
      
      positions[i * 3] = spiralPos.x + (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = spiralPos.y + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = spiralPos.z + (Math.random() - 0.5) * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [tubeData, showFlowParticles, tubeGeometry]);

  useFrame((state) => {
    if (tubeRef.current) {
      // Rotation based on flow velocity
      tubeRef.current.rotation.z += tubeData.fluid_velocity * 0.001;
    }
    
    if (particlesRef.current && showFlowParticles) {
      // Animate particles along the tube
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += tubeData.fluid_velocity * 0.1;
        if (positions[i + 2] > 20) {
          positions[i + 2] = -20;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[index * 100, 0, 0]}>
      <mesh
        ref={tubeRef}
        geometry={tubeGeometry}
        material={tubeMaterial}
        castShadow
        receiveShadow
      />
      
      {showFlowParticles && particleGeometry && (
        <points ref={particlesRef} geometry={particleGeometry}>
          <pointsMaterial
            color={tubeMaterial.color}
            size={tubeData.particle_density / 20}
            transparent
            opacity={0.6}
          />
        </points>
      )}
    </group>
  );
};

export default TubeVisualization; 
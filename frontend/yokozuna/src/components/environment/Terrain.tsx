import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemoizedCalculation } from '../../utils/optimizations';
import { usePhysics } from '../../hooks/usePhysics';
import { SimplexNoise as ThreeSimplexNoise } from 'three/examples/jsm/math/SimplexNoise';

/**
 * Props for the Terrain component
 * @interface TerrainProps
 */
export interface TerrainProps {
  /** Type of terrain to render */
  type?: 'stadium' | 'track' | 'terrain' | 'mountain' | 'desert' | 'forest' | 'custom';
  /** Width of the terrain */
  width?: number;
  /** Height of the terrain */
  height?: number;
  /** Resolution of the terrain grid */
  resolution?: number;
  /** Elevation scale factor for heightmap */
  elevation?: number;
  /** Path to heightmap texture for terrain */
  heightMap?: string;
  /** Path to texture for terrain surface */
  texture?: string;
  /** Path to normal map for enhanced detail */
  normalMap?: string;
  /** Path to roughness map for material properties */
  roughnessMap?: string;
  /** Whether terrain should receive shadows */
  receiveShadow?: boolean;
  /** Whether terrain should cast shadows */
  castShadow?: boolean;
  /** Custom color for simple terrains */
  color?: string;
  /** Roughness of the material (0-1) */
  roughness?: number;
  /** Metalness of the material (0-1) */
  metalness?: number;
  /** Texture repeat factor */
  textureRepeat?: number;
  /** Noise seed for procedural terrain */
  seed?: number;
  /** Custom transform function for heightmap data */
  heightTransform?: (height: number, x: number, y: number) => number;
  /** Callback when terrain is clicked */
  onClick?: (position: THREE.Vector3, normal: THREE.Vector3) => void;
  /** Whether to enable physics interaction with the terrain */
  physics?: boolean;
  /** Physics material properties */
  physicsMaterial?: {
    friction?: number;
    restitution?: number;
  };
  /** Noise scale for procedural terrain generation */
  noiseScale?: number;
  /** Octaves for noise generation (affects detail level) */
  octaves?: number;
  /** Whether terrain should be interactive (responds to clicks) */
  interactive?: boolean;
  /** Water level for terrain (0-1) */
  waterLevel?: number;
  /** Whether to render wireframe overlay */
  wireframe?: boolean;
}

/**
 * Terrain component for rendering different ground types in the 3D scene
 * 
 * @example
 * ```jsx
 * <Terrain 
 *   type="mountain" 
 *   width={500} 
 *   height={500}
 *   resolution={128}
 *   elevation={50}
 *   texture="/textures/grass.jpg"
 *   physics={true}
 *   waterLevel={0.3}
 * />
 * ```
 */
const Terrain: React.FC<TerrainProps> = ({
  type = 'stadium',
  width = 100,
  height = 100,
  resolution = 64,
  elevation = 10,
  heightMap,
  texture,
  normalMap,
  roughnessMap,
  receiveShadow = true,
  castShadow = false,
  color,
  roughness = 0.8,
  metalness = 0.2,
  textureRepeat = 4,
  seed = 12345,
  heightTransform,
  onClick,
  physics = false,
  physicsMaterial = { friction: 0.5, restitution: 0.2 },
  noiseScale = 0.1,
  octaves = 4,
  interactive = false,
  waterLevel = 0,
  wireframe = false
}) => {
  // Define refs only once
  const meshRef = useRef<THREE.Mesh>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  
  // Default colors for different terrain types
  const terrainColors = {
    stadium: '#3A8C3F', // Green grass
    track: '#B22D10',   // Red track
    terrain: '#8B7355',  // Brown earth
    mountain: '#71797E', // Stone gray
    desert: '#C2B280',   // Sand
    forest: '#228B22',   // Forest green
    custom: color || '#CCCCCC'
  };
  
  // Setup physics if enabled
  const { addRigidBody, removeRigidBody } = usePhysics();
  
  // Load textures if provided
  const texturePaths: Record<string, string> = {};
  if (texture) texturePaths.map = texture;
  if (heightMap) texturePaths.displacementMap = heightMap;
  if (normalMap) texturePaths.normalMap = normalMap;
  if (roughnessMap) texturePaths.roughnessMap = roughnessMap;
  
  const textures = Object.keys(texturePaths).length > 0 ? useTexture(texturePaths) : null;
  
  // Generate heightmap data for procedural terrain
  const heightData = useMemoizedCalculation(() => {
    if (heightMap || type === 'stadium' || type === 'track') return null;
    
    // Use resolution + 1 for clean wrapping/tiling
    const size = resolution + 1;
    const data = new Float32Array(size * size);
    
    // Setup noise generator with seed
    const rng = createSeededRandom(seed.toString());
    const simplex = new ThreeSimplexNoise();
    
    // Generate heightmap using multiple octaves of noise
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = y * size + x;
        
        // Initialize with 0
        data[index] = 0;
        
        // Apply multiple octaves of noise
        let amplitude = 1.0;
        let frequency = noiseScale;
        let maxValue = 0;
        
        for (let o = 0; o < octaves; o++) {
          // Convert grid position to noise coordinates
          const nx = (x / resolution) * frequency;
          const ny = (y / resolution) * frequency;
          
          // Add noise value with current amplitude
          let noiseValue;
          
          // Different noise patterns based on terrain type
          switch (type) {
            case 'mountain':
              // Sharper peaks for mountains
              noiseValue = Math.abs(simplex.noise(nx, ny));
              // Exaggerate peaks
              noiseValue = Math.pow(noiseValue, 0.75);
              break;
            case 'desert':
              // Smoother dunes for desert
              noiseValue = (simplex.noise(nx, ny) + 1) * 0.5;
              // Rounded, repeating dunes
              noiseValue = Math.sin(noiseValue * Math.PI) * 0.5 + 0.5;
              break;
            case 'forest':
              // More varied but gentler for forests
              noiseValue = (simplex.noise(nx, ny) + 1) * 0.5;
              // Flatten valleys, keep gentle hills
              noiseValue = Math.pow(noiseValue, 1.5);
              break;
            default:
              // Standard noise for generic terrain
              noiseValue = (simplex.noise(nx, ny) + 1) * 0.05;
          }
          
          data[index] += noiseValue * amplitude;
          
          // Accumulate maximum possible value for later normalization
          maxValue += amplitude;
          
          // Reduce amplitude and increase frequency for next octave
          amplitude *= 0.5;
          frequency *= 2;
        }
        
        // Normalize to 0-1 range
        data[index] /= maxValue;
        
        // Apply terrain-specific post-processing
        if (type === 'mountain') {
          // Enhance mountain ridges
          if (data[index] > 0.6) {
            data[index] = 0.6 + (data[index] - 0.6) * 2.5;
          }
        } else if (type === 'desert') {
          // Flatten areas to create more defined dunes
          if (data[index] < 0.4) {
            data[index] *= 0.5;
          }
        }
      }
    }
    
    return data;
  }, [type, resolution, seed, noiseScale, octaves]);
  
  // Generate terrain geometry based on type
  const geometry = useMemoizedCalculation(() => {
    switch (type) {
      case 'stadium':
        return new THREE.PlaneGeometry(width, height, 1, 1);
      case 'track':
        // Create a track with inner and outer boundaries
        const trackShape = new THREE.Shape();
        trackShape.moveTo(-width / 2, -height / 2);
        trackShape.lineTo(width / 2, -height / 2);
        trackShape.lineTo(width / 2, height / 2);
        trackShape.lineTo(-width / 2, height / 2);
        trackShape.closePath();
        
        // Create a hole for the inner field
        const hole = new THREE.Path();
        const innerWidth = width * 0.7;
        const innerHeight = height * 0.7;
        hole.moveTo(-innerWidth / 2, -innerHeight / 2);
        hole.lineTo(innerWidth / 2, -innerHeight / 2);
        hole.lineTo(innerWidth / 2, innerHeight / 2);
        hole.lineTo(-innerWidth / 2, innerHeight / 2);
        hole.closePath();
        
        trackShape.holes.push(hole);
        return new THREE.ShapeGeometry(trackShape);
      case 'terrain':
      case 'mountain':
      case 'desert':
      case 'forest':
      default:
        // Create geometry for heightmap-based terrain
        const geo = new THREE.PlaneGeometry(width, height, resolution, resolution);
        
        // Apply heightmap if we have procedural data
        if (heightData) {
          const positions = geo.attributes.position.array as Float32Array;
          const size = resolution + 1;
          
          // Apply height data to vertices
          for (let i = 0, j = 0, l = positions.length; i < l; i++, j += 3) {
            const x = Math.floor(i % size);
            const y = Math.floor(i / size);
            
            // Set height (y coordinate in our case since we'll rotate the plane)
            positions[j + 2] = heightData[i] * elevation;
          }
          
          // Update normals after changing positions
          geo.computeVertexNormals();
        }
        
        return geo;
    }
  }, [type, width, height, resolution, heightData, elevation]);
  
  // Create material based on terrain type and available textures
  const material = useMemo(() => {
    // Base material with color from terrain type
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: terrainColors[type],
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.2,
      wireframe: wireframe
    });
    
    // If textures are provided, use them
    if (textures?.map) {
      baseMaterial.map = textures.map;
      
      // Set texture parameters
      textures.map.wrapS = textures.map.wrapT = THREE.RepeatWrapping;
      textures.map.repeat.set(4, 4);
    }
    
    // If displacement map is provided, use it
    if (textures?.displacementMap) {
      baseMaterial.displacementMap = textures.displacementMap;
      baseMaterial.displacementScale = elevation;
      
      // Set displacement map parameters
      textures.displacementMap.wrapS = textures.displacementMap.wrapT = THREE.RepeatWrapping;
    }
    
    return baseMaterial;
  }, [type, textures, elevation, terrainColors, roughness, metalness, wireframe]);
  
  // Water material for water level visualization
  const waterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1E90FF',
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    });
  }, []);
  
  // Create physics body for the terrain
  useEffect(() => {
    if (!physics || !meshRef.current) return;
    
    // Add terrain as static rigid body
    const cleanup = addRigidBody(meshRef.current, {
      type: 'static',
      friction: physicsMaterial.friction,
      restitution: physicsMaterial.restitution
    });
    
    return cleanup;
  }, [physics, addRigidBody, physicsMaterial]);
  
  // Handle water animation
  useFrame((_, delta) => {
    if (waterRef.current && waterLevel > 0) {
      // Simple water movement effect
      waterRef.current.position.y += Math.sin(Date.now() * 0.001) * 0.01 * delta;
    }
  });
  
  // Handle clicks on terrain
  const handleClick = (event: React.MouseEvent) => {
    if (!interactive || !onClick || !meshRef.current) return;
    
    // Get intersection point
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    raycaster.setFromCamera(mouse, event.target as unknown as THREE.Camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    
    if (intersects.length > 0) {
      onClick(intersects[0].point, intersects[0].face?.normal || new THREE.Vector3(0, 1, 0));
    }
  };
  
  return (
    <group>
      {/* Main terrain mesh */}
      <mesh 
        ref={meshRef}
        geometry={geometry} 
        material={material} 
        rotation={[type === 'stadium' || type === 'track' ? 0 : -Math.PI / 2, 0, 0]}
        position={[0, type === 'stadium' || type === 'track' ? -0.01 : 0, 0]}
        receiveShadow={receiveShadow}
        castShadow={castShadow}
        onClick={interactive ? handleClick : undefined}
      />
      
      {/* Water plane if water level is set */}
      {waterLevel > 0 && (
        <mesh
          ref={waterRef}
          position={[0, waterLevel * elevation * 0.5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow={false}
        >
          <planeGeometry args={[width + 10, height + 10]} />
          <primitive object={waterMaterial} />
        </mesh>
      )}
    </group>
  );
};

// Add a seedrandom-like function since Math.seedrandom doesn't exist
function createSeededRandom(seed: number | string): () => number {
  let s = typeof seed === 'number' ? seed : hashString(seed);
  
  // Simple xorshift algorithm
  return function() {
    s = s ^ (s << 13);
    s = s ^ (s >>> 17);
    s = s ^ (s << 5);
    return (s & 0x7fffffff) / 0x7fffffff;
  };
    }
    
// Simple string hash function
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

export default Terrain;

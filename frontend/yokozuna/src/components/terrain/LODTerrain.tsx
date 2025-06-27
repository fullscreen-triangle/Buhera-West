import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useAdvancedMemo, useMemoizedGeometry } from '../../utils/memoization';

/**
 * Props for the LODTerrain component
 */
interface LODTerrainProps {
  /** Width of the terrain */
  width?: number;
  /** Depth of the terrain */
  depth?: number;
  /** Maximum height of the terrain */
  maxHeight?: number;
  /** Position of the terrain */
  position?: [number, number, number];
  /** Optional heightmap texture URL */
  heightMap?: string;
  /** Base color texture URL */
  baseTexture?: string;
  /** Detail texture to blend at close distances */
  detailTexture?: string;
  /** Normal map for enhanced lighting detail */
  normalMap?: string;
  /** Distance thresholds for LOD levels in ascending order */
  lodDistances?: number[];
  /** Resolution (vertices per side) for each LOD level */
  lodResolutions?: number[];
  /** Whether to use distance-based texture detail */
  dynamicTextureDetail?: boolean;
  /** Whether terrain should receive shadows */
  receiveShadow?: boolean;
  /** Texture repeat factor at highest detail level */
  textureRepeat?: number;
  /** Custom transformation for heightmap values */
  heightTransform?: (height: number, x: number, z: number) => number;
  /** Whether to show wireframe (for debugging) */
  wireframe?: boolean;
}

/**
 * LODTerrain component that renders terrain with automatic level of detail
 * based on camera distance for optimized performance
 */
const LODTerrain: React.FC<LODTerrainProps> = ({
  width = 1000,
  depth = 1000,
  maxHeight = 100,
  position = [0, 0, 0],
  heightMap,
  baseTexture = '/textures/terrain/grass.jpg',
  detailTexture = '/textures/terrain/rock.jpg',
  normalMap = '/textures/terrain/normal.jpg',
  lodDistances = [100, 300, 600, 1200],
  lodResolutions = [256, 128, 64, 32],
  dynamicTextureDetail = true,
  receiveShadow = true,
  textureRepeat = 16,
  heightTransform,
  wireframe = false
}) => {
  const { camera } = useThree();
  const lodLevel = useRef<number>(0);
  const lodGroup = useRef<THREE.Group>(null);
  const terrainMeshes = useRef<THREE.Mesh[]>([]);
  
  // Load textures
  const textures = useTexture({
    baseTexture,
    detailTexture,
    normalMap,
    ...(heightMap ? { heightMap } : {})
  });
  
  // Set up texture properties
  useEffect(() => {
    Object.values(textures).forEach(texture => {
      if (!texture) return;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(textureRepeat, textureRepeat);
    });
  }, [textures, textureRepeat]);
  
  // Create all LOD levels
  const lodGeometries = useMemo(() => {
    return lodResolutions.map(resolution => {
      return createTerrainGeometry(width, depth, resolution, maxHeight, heightMap, heightTransform, textures.heightMap);
    });
  }, [width, depth, maxHeight, lodResolutions, heightMap, heightTransform, textures.heightMap]);
  
  // Initialize meshes for each LOD level
  useEffect(() => {
    terrainMeshes.current = lodGeometries.map((geometry, index) => {
      const mesh = new THREE.Mesh(
        geometry,
        createTerrainMaterial(index, textures, wireframe)
      );
      mesh.receiveShadow = receiveShadow;
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = index === 0; // Only show highest detail initially
      
      if (lodGroup.current) {
        lodGroup.current.add(mesh);
      }
      
      return mesh;
    });
    
    return () => {
      // Clean up meshes on unmount
      terrainMeshes.current.forEach(mesh => {
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
      });
    };
  }, [lodGeometries, textures, receiveShadow, wireframe]);
  
  // Update LOD based on camera distance
  useFrame(() => {
    if (lodGroup.current) {
      const cameraPosition = camera.position;
      const terrainPosition = new THREE.Vector3(position[0], position[1], position[2]);
      const distance = cameraPosition.distanceTo(terrainPosition);
      
      // Determine which LOD level to use
      let newLodLevel = lodDistances.findIndex(d => distance < d);
      if (newLodLevel === -1) newLodLevel = lodDistances.length - 1;
      
      // Skip if LOD level hasn't changed
      if (newLodLevel === lodLevel.current) return;
      
      // Update visibility of meshes
      terrainMeshes.current.forEach((mesh, index) => {
        mesh.visible = index === newLodLevel;
      });
      
      // Update texture repeat based on LOD if enabled
      if (dynamicTextureDetail) {
        const detailFactor = Math.pow(2, lodLevel.current);
        Object.values(textures).forEach(texture => {
          if (!texture) return;
          texture.repeat.set(textureRepeat / detailFactor, textureRepeat / detailFactor);
        });
      }
      
      // Store new LOD level
      lodLevel.current = newLodLevel;
    }
  });
  
  return (
    <group ref={lodGroup} position={[position[0], position[1], position[2]]}>
      {/* Meshes will be added via useEffect */}
    </group>
  );
};

/**
 * Create terrain geometry with appropriate detail level
 */
function createTerrainGeometry(
  width: number,
  depth: number,
  resolution: number,
  maxHeight: number,
  heightMap?: string,
  heightTransform?: (height: number, x: number, z: number) => number,
  heightMapTexture?: THREE.Texture
): THREE.BufferGeometry {
  // Create base plane geometry
  const geometry = new THREE.PlaneGeometry(width, depth, resolution - 1, resolution - 1);
  
  // Apply heightmap if available
  if (heightMapTexture && heightMapTexture.image) {
    // Create a canvas to read pixel data from the heightmap
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return geometry;
    
    const imgWidth = heightMapTexture.image.width;
    const imgHeight = heightMapTexture.image.height;
    
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    context.drawImage(heightMapTexture.image, 0, 0);
    
    const imageData = context.getImageData(0, 0, imgWidth, imgHeight).data;
    
    // Apply height to vertices
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Convert vertex index to x,z coordinates
      const vertexIndex = i / 3;
      const x = vertexIndex % resolution;
      const z = Math.floor(vertexIndex / resolution);
      
      // Map to image coordinates
      const u = Math.floor((x / (resolution - 1)) * (imgWidth - 1));
      const v = Math.floor((z / (resolution - 1)) * (imgHeight - 1));
      
      // Get height from image data (red channel)
      const index = (v * imgWidth + u) * 4;
      // Get height value (0-255)
      let height = imageData[index] / 255 * maxHeight;
      
      // Apply custom height transformation if provided
      if (heightTransform) {
        // Convert to normalized terrain coordinates
        const terrainX = (x / (resolution - 1)) * width - width / 2;
        const terrainZ = (z / (resolution - 1)) * depth - depth / 2;
        height = heightTransform(height, terrainX, terrainZ);
      }
      
      // Apply height to y coordinate (y is up in Three.js)
      positions[i + 2] = height;
    }
    
    // Update geometry
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  
  return geometry;
}

/**
 * Create terrain material with appropriate detail level
 */
function createTerrainMaterial(
  lodLevel: number,
  textures: Record<string, THREE.Texture>,
  wireframe = false
): THREE.Material {
  // Create material with appropriate textures
  const material = new THREE.MeshStandardMaterial({
    map: textures.baseTexture,
    normalMap: textures.normalMap,
    wireframe,
    roughness: 0.8,
    metalness: 0.2,
  });
  
  // Add detail textures for closer LODs
  if (lodLevel <= 1 && textures.detailTexture) {
    // For higher detail levels, we could use custom shader material to blend
    // detail textures based on slope, height, etc.
  }
  
  return material;
}

export default LODTerrain; 
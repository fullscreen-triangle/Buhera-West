import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/**
 * TexturedTerrain component for rendering realistic terrain with texture splatting
 * Supports heightmap-based terrain with multiple texture layers
 */
const TexturedTerrain = ({
  heightMap,
  size = [100, 20, 100],
  position = [0, 0, 0],
  resolution = 128,
  textures = {
    base: '/textures/terrain/grass.jpg',
    r: '/textures/terrain/rock.jpg',
    g: '/textures/terrain/dirt.jpg',
    b: '/textures/terrain/snow.jpg',
    normal: '/textures/terrain/normal.jpg',
    splatMap: '/textures/terrain/splatmap.png',
  },
  lod = true,
  lodDistances = [10, 30, 60, 120],
  onClick = null,
}) => {
  const meshRef = useRef();
  const terrainMaterialRef = useRef();
  
  // Load all textures
  const textureProps = useTexture(textures);
  
  // Apply texture properties
  useMemo(() => {
    Object.values(textureProps).forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
    });
  }, [textureProps]);
  
  // Create geometry with heightmap
  const geometry = useMemo(() => {
    if (!textureProps.heightMap) return new THREE.PlaneGeometry(size[0], size[2], resolution, resolution);
    
    const geo = new THREE.PlaneGeometry(size[0], size[2], resolution, resolution);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = heightMap;
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      
      const vertices = geo.attributes.position.array;
      for (let i = 0; i < vertices.length / 3; i++) {
        const ix = i % (resolution + 1);
        const iy = Math.floor(i / (resolution + 1));
        
        const imgX = Math.floor((ix / (resolution + 1)) * img.width);
        const imgY = Math.floor((iy / (resolution + 1)) * img.height);
        const pixelIndex = (imgY * img.width + imgX) * 4;
        
        const height = data[pixelIndex] / 255 * size[1];
        vertices[i * 3 + 2] = height;
      }
      
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
    };
    
    return geo;
  }, [size, resolution, heightMap, textureProps.heightMap]);
  
  // LOD implementation
  useFrame(({ camera }) => {
    if (lod && meshRef.current && terrainMaterialRef.current) {
      const distanceToCamera = camera.position.distanceTo(meshRef.current.position);
      
      // Adjust wireframe based on distance (visualization for debugging)
      // terrainMaterialRef.current.wireframe = distanceToCamera > lodDistances[3];
      
      // Adjust texture quality based on distance
      const textureDetail = distanceToCamera < lodDistances[0] ? 4 :
                          distanceToCamera < lodDistances[1] ? 2 :
                          distanceToCamera < lodDistances[2] ? 1 : 0.5;
      
      Object.values(textureProps).forEach(texture => {
        if (texture.repeat) {
          texture.repeat.set(4 * textureDetail, 4 * textureDetail);
        }
      });
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      rotation={[-Math.PI / 2, 0, 0]} 
      onClick={onClick}
      receiveShadow
    >
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        ref={terrainMaterialRef}
        map={textureProps.base}
        normalMap={textureProps.normal}
        metalnessMap={textureProps.splatMap}
        roughnessMap={textureProps.splatMap}
        metalness={0.1}
        roughness={0.8}
        displacementMap={textureProps.heightMap}
        displacementScale={size[1] / 10}
        envMapIntensity={0.2}
      />
    </mesh>
  );
};

TexturedTerrain.propTypes = {
  heightMap: PropTypes.string,
  size: PropTypes.arrayOf(PropTypes.number),
  position: PropTypes.arrayOf(PropTypes.number),
  resolution: PropTypes.number,
  textures: PropTypes.object,
  lod: PropTypes.bool,
  lodDistances: PropTypes.arrayOf(PropTypes.number),
  onClick: PropTypes.func,
};

export default TexturedTerrain;

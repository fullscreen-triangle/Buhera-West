import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { PathTracingCore } from './PathTracingCore';

/**
 * BVH Renderer Component with Path Tracing
 * Based on BVH_Terrain.js and BVH acceleration structure from THREE.js-PathTracing-Renderer
 */

const bvhRenderingFragmentShader = `
  // BVH rendering specific uniforms
  uniform sampler2D t_TriangleTexture;
  uniform sampler2D t_AABBTexture;
  uniform vec2 uTriangleTextureSize;
  uniform vec2 uAABBTextureSize;
  uniform int uTotalTriangles;
  uniform vec3 uSunDirection;
  uniform mat4 uModelMatrix;
  uniform mat4 uModelInverseMatrix;

  // BVH node structure (encoded in texture)
  struct BVHNode {
    vec3 minCorner;
    vec3 maxCorner;
    int leftChild;
    int rightChild;
    int triangleIndex;
    int triangleCount;
  };

  // Triangle structure (encoded in texture)
  struct Triangle {
    vec3 v0, v1, v2;
    vec3 normal;
    vec2 uv0, uv1, uv2;
    int materialIndex;
  };

  // Decode triangle from texture
  Triangle getTriangle(int index) {
    Triangle tri;
    float textureWidth = uTriangleTextureSize.x;
    
    // Each triangle uses 3 texels (vec4 each)
    int baseIndex = index * 3;
    float u0 = mod(float(baseIndex), textureWidth);
    float v0 = floor(float(baseIndex) / textureWidth);
    float u1 = mod(float(baseIndex + 1), textureWidth);
    float v1 = floor(float(baseIndex + 1) / textureWidth);
    float u2 = mod(float(baseIndex + 2), textureWidth);
    float v2 = floor(float(baseIndex + 2) / textureWidth);
    
    vec4 data0 = texture2D(t_TriangleTexture, vec2(u0 / textureWidth, v0 / uTriangleTextureSize.y));
    vec4 data1 = texture2D(t_TriangleTexture, vec2(u1 / textureWidth, v1 / uTriangleTextureSize.y));
    vec4 data2 = texture2D(t_TriangleTexture, vec2(u2 / textureWidth, v2 / uTriangleTextureSize.y));
    
    tri.v0 = data0.xyz;
    tri.v1 = vec3(data0.w, data1.xy);
    tri.v2 = vec3(data1.zw, data2.x);
    tri.normal = normalize(cross(tri.v1 - tri.v0, tri.v2 - tri.v0));
    
    return tri;
  }

  // Decode BVH node from texture
  BVHNode getBVHNode(int index) {
    BVHNode node;
    float textureWidth = uAABBTextureSize.x;
    
    // Each node uses 2 texels
    int baseIndex = index * 2;
    float u0 = mod(float(baseIndex), textureWidth);
    float v0 = floor(float(baseIndex) / textureWidth);
    float u1 = mod(float(baseIndex + 1), textureWidth);
    float v1 = floor(float(baseIndex + 1) / textureWidth);
    
    vec4 data0 = texture2D(t_AABBTexture, vec2(u0 / textureWidth, v0 / uAABBTextureSize.y));
    vec4 data1 = texture2D(t_AABBTexture, vec2(u1 / textureWidth, v1 / uAABBTextureSize.y));
    
    node.minCorner = data0.xyz;
    node.maxCorner = vec3(data0.w, data1.xy);
    
    // Decode integer data from float
    float packed = data1.z;
    node.leftChild = int(floor(packed / 65536.0));
    node.rightChild = int(mod(packed, 65536.0));
    
    packed = data1.w;
    node.triangleIndex = int(floor(packed / 65536.0));
    node.triangleCount = int(mod(packed, 65536.0));
    
    return node;
  }

  // Ray-AABB intersection
  bool rayAABBIntersect(Ray r, vec3 minCorner, vec3 maxCorner) {
    vec3 invDir = 1.0 / r.direction;
    vec3 near = (minCorner - r.origin) * invDir;
    vec3 far = (maxCorner - r.origin) * invDir;
    vec3 tmin = min(near, far);
    vec3 tmax = max(near, far);
    
    float t0 = max(max(tmin.x, tmin.y), tmin.z);
    float t1 = min(min(tmax.x, tmax.y), tmax.z);
    
    return t0 < t1 && t1 > 0.0;
  }

  // Ray-triangle intersection
  float rayTriangleIntersect(Ray r, Triangle tri) {
    vec3 edge1 = tri.v1 - tri.v0;
    vec3 edge2 = tri.v2 - tri.v0;
    vec3 h = cross(r.direction, edge2);
    float a = dot(edge1, h);
    
    if (abs(a) < 0.0001) return INFINITY;
    
    float f = 1.0 / a;
    vec3 s = r.origin - tri.v0;
    float u = f * dot(s, h);
    
    if (u < 0.0 || u > 1.0) return INFINITY;
    
    vec3 q = cross(s, edge1);
    float v = f * dot(r.direction, q);
    
    if (v < 0.0 || u + v > 1.0) return INFINITY;
    
    float t = f * dot(edge2, q);
    return (t > 0.0001) ? t : INFINITY;
  }

  // BVH traversal
  float BVHIntersect(Ray r) {
    float minT = INFINITY;
    int hitTriangleIndex = -1;
    
    // Stack for BVH traversal (simple iterative version)
    int stack[32];
    int stackPtr = 0;
    stack[0] = 0; // Start with root node
    
    while (stackPtr >= 0) {
      int nodeIndex = stack[stackPtr--];
      BVHNode node = getBVHNode(nodeIndex);
      
      // Test ray against node's AABB
      if (!rayAABBIntersect(r, node.minCorner, node.maxCorner)) {
        continue;
      }
      
      if (node.triangleCount > 0) {
        // Leaf node - test triangles
        for (int i = 0; i < node.triangleCount && i < 32; i++) {
          Triangle tri = getTriangle(node.triangleIndex + i);
          float t = rayTriangleIntersect(r, tri);
          if (t < minT) {
            minT = t;
            hitTriangleIndex = node.triangleIndex + i;
          }
        }
      } else {
        // Internal node - add children to stack
        if (stackPtr < 30) { // Prevent stack overflow
          stack[++stackPtr] = node.leftChild;
          stack[++stackPtr] = node.rightChild;
        }
      }
    }
    
    return minT;
  }

  // Get material color for triangle
  vec3 getTriangleMaterial(int triangleIndex, vec3 hitPoint, vec3 normal) {
    // Simple material based on triangle index and position
    float materialHash = sin(float(triangleIndex) * 0.1) * 0.5 + 0.5;
    
    vec3 baseColor = mix(vec3(0.8, 0.6, 0.4), vec3(0.4, 0.8, 0.6), materialHash);
    
    // Add some variation based on position
    float positionNoise = sin(hitPoint.x * 0.1) * sin(hitPoint.z * 0.1) * 0.2 + 0.8;
    baseColor *= positionNoise;
    
    // Simple lighting
    float ndotl = max(0.0, dot(normal, uSunDirection));
    baseColor *= (0.2 + 0.8 * ndotl);
    
    return baseColor;
  }

  // Sky color
  vec3 getSkyColor(Ray r) {
    float elevation = r.direction.y;
    vec3 horizonColor = vec3(1.0, 0.95, 0.8);
    vec3 zenithColor = vec3(0.3, 0.6, 1.0);
    
    vec3 skyColor = mix(horizonColor, zenithColor, smoothstep(-0.1, 0.4, elevation));
    
    // Sun disk
    float sunDot = max(0.0, dot(r.direction, uSunDirection));
    if (sunDot > 0.9995) {
      skyColor = vec3(3.0, 2.8, 2.5);
    }
    
    return skyColor;
  }

  // Main path tracing function for BVH scene
  vec3 CalculateRadiance(Ray r, inout float seed) {
    vec3 accumulatedColor = vec3(0.0);
    vec3 mask = vec3(1.0);
    
    // Transform ray to model space
    Ray modelRay;
    modelRay.origin = (uModelInverseMatrix * vec4(r.origin, 1.0)).xyz;
    modelRay.direction = (uModelInverseMatrix * vec4(r.direction, 0.0)).xyz;
    
    for (int bounces = 0; bounces < 6; bounces++) {
      float t = BVHIntersect(modelRay);
      
      if (t == INFINITY) {
        // Hit sky
        accumulatedColor += mask * getSkyColor(r);
        break;
      }
      
      vec3 hitPoint = modelRay.origin + modelRay.direction * t;
      
      // Transform hit point and normal back to world space
      vec3 worldHitPoint = (uModelMatrix * vec4(hitPoint, 1.0)).xyz;
      
      // Calculate normal (simplified - should get from triangle data)
      vec3 normal = normalize(vec3(0.0, 1.0, 0.0)); // Placeholder
      
      // Get material
      vec3 materialColor = getTriangleMaterial(0, worldHitPoint, normal); // Simplified
      
      // Lambertian reflection
      r.direction = randomHemisphereDirection(normal, seed);
      r.origin = worldHitPoint + normal * uEPS_intersect;
      
      // Update ray for next iteration
      modelRay.origin = (uModelInverseMatrix * vec4(r.origin, 1.0)).xyz;
      modelRay.direction = (uModelInverseMatrix * vec4(r.direction, 0.0)).xyz;
      
      mask *= materialColor * max(0.0, dot(normal, r.direction));
      
      // Russian roulette termination
      float probability = max(mask.r, max(mask.g, mask.b));
      if (bounces > 2) {
        if (hash(seed += 1.0) > probability) break;
        mask /= probability;
      }
    }
    
    return accumulatedColor;
  }

  void main() {
    vec2 pixelPos = gl_FragCoord.xy;
    vec3 pixelColor = vec3(0.0);
    
    float seed = pixelPos.x + pixelPos.y * uResolution.x + uFrameCounter;
    
    // Generate camera ray
    Ray ray = getRay(pixelPos, vec2(hash(seed), hash(seed + 1.0)));
    
    // Calculate radiance
    pixelColor = CalculateRadiance(ray, seed);
    
    // Progressive accumulation
    if (uSampleCounter > 0.0 && !uCameraIsMoving) {
      vec3 previousColor = texture2D(tPreviousTexture, vUv).rgb;
      pixelColor = mix(previousColor, pixelColor, 1.0 / (uSampleCounter + 1.0));
    }
    
    gl_FragColor = vec4(linearToSRGB(OptimizedCineonToneMapping(pixelColor)), 1.0);
  }
`;

export const BVHRenderer = ({ 
  modelPath = "/models/terrain.glb",
  modelScale = 1.0,
  enabled = true,
  qualityLevel = 1.0,
  onModelLoaded,
  onRenderUpdate
}) => {
  const groupRef = useRef();
  const meshRef = useRef();
  const [triangleTexture, setTriangleTexture] = React.useState(null);
  const [aabbTexture, setAABBTexture] = React.useState(null);
  const [totalTriangles, setTotalTriangles] = React.useState(0);
  
  // Load GLTF model
  const gltf = useLoader(GLTFLoader, modelPath);
  
  // Animation state
  const animationState = useRef({
    sunDirection: new THREE.Vector3(0.6, 0.8, 0.2).normalize(),
    modelMatrix: new THREE.Matrix4(),
    modelInverseMatrix: new THREE.Matrix4()
  });
  
  // Build BVH from loaded model
  useEffect(() => {
    if (!gltf || !enabled) return;
    
    // Extract geometry from GLTF
    let combinedGeometry = new THREE.BufferGeometry();
    const geometries = [];
    
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.geometry) {
        geometries.push(child.geometry);
      }
    });
    
    if (geometries.length > 0) {
      combinedGeometry = mergeGeometries(geometries);
      
      if (combinedGeometry.index) {
        combinedGeometry = combinedGeometry.toNonIndexed();
      }
      
      // Build BVH (simplified - in real implementation this would be more complex)
      const positions = combinedGeometry.attributes.position.array;
      const triangleCount = positions.length / 9;
      setTotalTriangles(triangleCount);
      
      // Create triangle texture
      const triangleTextureSize = Math.max(256, Math.ceil(Math.sqrt(triangleCount * 3)));
      const triangleData = new Float32Array(triangleTextureSize * triangleTextureSize * 4);
      
      for (let i = 0; i < triangleCount; i++) {
        const baseIndex = i * 9;
        const texIndex = i * 3 * 4; // 3 vec4s per triangle
        
        // Triangle vertices
        triangleData[texIndex + 0] = positions[baseIndex + 0]; // v0.x
        triangleData[texIndex + 1] = positions[baseIndex + 1]; // v0.y
        triangleData[texIndex + 2] = positions[baseIndex + 2]; // v0.z
        triangleData[texIndex + 3] = positions[baseIndex + 3]; // v1.x
        triangleData[texIndex + 4] = positions[baseIndex + 4]; // v1.y
        triangleData[texIndex + 5] = positions[baseIndex + 5]; // v1.z
        triangleData[texIndex + 6] = positions[baseIndex + 6]; // v2.x
        triangleData[texIndex + 7] = positions[baseIndex + 7]; // v2.y
        triangleData[texIndex + 8] = positions[baseIndex + 8]; // v2.z
      }
      
      const triTexture = new THREE.DataTexture(
        triangleData,
        triangleTextureSize,
        triangleTextureSize,
        THREE.RGBAFormat,
        THREE.FloatType
      );
      triTexture.needsUpdate = true;
      setTriangleTexture(triTexture);
      
      // Create simplified AABB texture (normally would be full BVH)
      const aabbTextureSize = 256;
      const aabbData = new Float32Array(aabbTextureSize * aabbTextureSize * 4);
      
      // Simple single AABB for entire mesh
      combinedGeometry.computeBoundingBox();
      const bbox = combinedGeometry.boundingBox;
      
      aabbData[0] = bbox.min.x;
      aabbData[1] = bbox.min.y;
      aabbData[2] = bbox.min.z;
      aabbData[3] = bbox.max.x;
      aabbData[4] = bbox.max.y;
      aabbData[5] = bbox.max.z;
      aabbData[6] = 0; // Leaf node
      aabbData[7] = triangleCount; // Triangle count
      
      const aabbTex = new THREE.DataTexture(
        aabbData,
        aabbTextureSize,
        aabbTextureSize,
        THREE.RGBAFormat,
        THREE.FloatType
      );
      aabbTex.needsUpdate = true;
      setAABBTexture(aabbTex);
      
      if (onModelLoaded) {
        onModelLoaded({
          triangleCount,
          boundingBox: bbox,
          geometry: combinedGeometry
        });
      }
    }
  }, [gltf, enabled, onModelLoaded]);
  
  // Custom uniforms for BVH rendering
  const customUniforms = useMemo(() => ({
    t_TriangleTexture: { value: triangleTexture },
    t_AABBTexture: { value: aabbTexture },
    uTriangleTextureSize: { value: new THREE.Vector2(256, 256) },
    uAABBTextureSize: { value: new THREE.Vector2(256, 256) },
    uTotalTriangles: { value: totalTriangles },
    uSunDirection: { value: animationState.current.sunDirection },
    uModelMatrix: { value: animationState.current.modelMatrix },
    uModelInverseMatrix: { value: animationState.current.modelInverseMatrix }
  }), [triangleTexture, aabbTexture, totalTriangles]);
  
  // Update animation
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Animate sun direction
    const angle = state.clock.elapsedTime * 0.05;
    animationState.current.sunDirection.set(
      Math.cos(angle),
      0.8,
      Math.sin(angle)
    ).normalize();
    
    // Update model matrix
    animationState.current.modelMatrix.makeScale(modelScale, modelScale, modelScale);
    animationState.current.modelInverseMatrix.copy(animationState.current.modelMatrix).invert();
    
    // Update uniforms
    if (customUniforms.uSunDirection) {
      customUniforms.uSunDirection.value.copy(animationState.current.sunDirection);
      customUniforms.uModelMatrix.value.copy(animationState.current.modelMatrix);
      customUniforms.uModelInverseMatrix.value.copy(animationState.current.modelInverseMatrix);
      
      if (triangleTexture) {
        const size = Math.max(256, Math.ceil(Math.sqrt(totalTriangles * 3)));
        customUniforms.uTriangleTextureSize.value.set(size, size);
      }
    }
    
    if (onRenderUpdate) {
      onRenderUpdate({
        sunDirection: animationState.current.sunDirection,
        triangleCount: totalTriangles,
        frameTime: delta
      });
    }
  });
  
  if (!enabled || !triangleTexture || !aabbTexture) return null;
  
  return (
    <group ref={groupRef} name="bvh-renderer">
      <PathTracingCore
        fragmentShader={bvhRenderingFragmentShader}
        customUniforms={customUniforms}
        sceneIsDynamic={false}
        enabled={enabled}
        resolution={[Math.floor(1024 * qualityLevel * 0.8), Math.floor(1024 * qualityLevel * 0.8)]}
        pixelRatio={qualityLevel * 0.8}
        apertureSize={0.0}
        focusDistance={300.0}
      />
      
      {/* Visual reference model (invisible in path tracing) */}
      <group visible={false}>
        <primitive object={gltf.scene} scale={[modelScale, modelScale, modelScale]} />
      </group>
      
      {/* Three.js model representation for fallback */}
      {qualityLevel < 0.4 && (
        <primitive object={gltf.scene} scale={[modelScale, modelScale, modelScale]} />
      )}
    </group>
  );
};

// Helper function to merge geometries (simplified)
function mergeGeometries(geometries) {
  const merged = new THREE.BufferGeometry();
  
  if (geometries.length === 0) return merged;
  if (geometries.length === 1) return geometries[0].clone();
  
  let positionsLength = 0;
  let normalsLength = 0;
  
  for (const geometry of geometries) {
    if (geometry.attributes.position) {
      positionsLength += geometry.attributes.position.count;
    }
    if (geometry.attributes.normal) {
      normalsLength += geometry.attributes.normal.count;
    }
  }
  
  const mergedPositions = new Float32Array(positionsLength * 3);
  const mergedNormals = new Float32Array(normalsLength * 3);
  
  let positionOffset = 0;
  let normalOffset = 0;
  
  for (const geometry of geometries) {
    if (geometry.attributes.position) {
      mergedPositions.set(geometry.attributes.position.array, positionOffset);
      positionOffset += geometry.attributes.position.count * 3;
    }
    if (geometry.attributes.normal) {
      mergedNormals.set(geometry.attributes.normal.array, normalOffset);
      normalOffset += geometry.attributes.normal.count * 3;
    }
  }
  
  merged.setAttribute('position', new THREE.BufferAttribute(mergedPositions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(mergedNormals, 3));
  
  return merged;
}

BVHRenderer.propTypes = {
  modelPath: PropTypes.string,
  modelScale: PropTypes.number,
  enabled: PropTypes.bool,
  qualityLevel: PropTypes.number,
  onModelLoaded: PropTypes.func,
  onRenderUpdate: PropTypes.func
};

export default BVHRenderer; 
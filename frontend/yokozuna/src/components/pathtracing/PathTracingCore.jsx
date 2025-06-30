import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

/**
 * Path Tracing Core System
 * Implements the fundamental path tracing renderer with all common uniforms and pipeline
 */

// Common uniforms that all path tracing scenes use
const createPathTracingUniforms = () => ({
  tPreviousTexture: { value: null },
  tBlueNoiseTexture: { value: null },
  uCameraMatrix: { value: new THREE.Matrix4() },
  uCameraInverseMatrix: { value: new THREE.Matrix4() },
  uResolution: { value: new THREE.Vector2() },
  uRandomVector: { value: new THREE.Vector3() },
  uFrameCounter: { value: 1.0 },
  uSampleCounter: { value: 0.0 },
  uULen: { value: 1.0 },
  uVLen: { value: 1.0 },
  uApertureSize: { value: 0.0 },
  uFocusDistance: { value: 132.0 },
  uCameraIsMoving: { value: false },
  uEPS_intersect: { value: 0.01 },
  uTime: { value: 0.0 },
  uPixelRatio: { value: 1.0 }
});

// Base vertex shader for path tracing
const pathTracingVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Common path tracing utilities (subset of PathTracingCommon.js)
const pathTracingCommonCode = `
  #define N_LIGHTS 6.0
  #define N_SPHERES 16.0
  #define N_PLANES 1.0
  #define N_DISKS 2.0
  #define N_TRIANGLES 2.0
  #define N_BOXES 14.0
  #define N_WEDGES 2.0
  #define N_CYLINDERS 2.0
  #define N_CONES 2.0
  #define N_PARABOLOIDS 4.0
  #define N_HYPERBOLAS 2.0
  #define N_HYPERBOLOIDS 2.0
  #define N_CAPSULES 2.0
  #define N_ELLIPSOIDS 4.0
  #define N_OPENCYLINDERS 4.0
  #define N_TORII 2.0
  #define N_QUADS 1.0

  precision highp float;
  precision highp int;
  precision highp sampler2D;

  uniform mat4 uCameraMatrix;
  uniform mat4 uCameraInverseMatrix;
  uniform vec2 uResolution;
  uniform vec3 uRandomVector;
  uniform float uFrameCounter;
  uniform float uSampleCounter;
  uniform float uULen;
  uniform float uVLen;
  uniform float uApertureSize;
  uniform float uFocusDistance;
  uniform bool uCameraIsMoving;
  uniform float uEPS_intersect;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform sampler2D tPreviousTexture;
  uniform sampler2D tBlueNoiseTexture;

  varying vec2 vUv;

  // Constants
  #define PI               3.14159265358979323
  #define TWO_PI           6.28318530717958647
  #define FOUR_PI          12.5663706143591729
  #define ONE_OVER_PI      0.31830988618379067
  #define ONE_OVER_TWO_PI  0.15915494309189533
  #define ONE_OVER_FOUR_PI 0.07957747154594767
  #define PI_OVER_TWO      1.57079632679489662
  #define ONE_OVER_THREE   0.33333333333333333
  #define E                2.71828182845904524
  #define INFINITY         1000000.0
  #define SPOT_LIGHT       0
  #define POINT_LIGHT      1
  #define DIRECTIONAL_LIGHT 2

  // Material types
  #define LIGHT            0
  #define DIFF             1
  #define REFR             2
  #define SPEC             3
  #define COAT             4
  #define CARCOAT          5
  #define TRANSLUCENT      6
  #define SPECSUB          7
  #define CHECK            8
  #define WATER            9
  #define WOOD             10
  #define DARKWOOD         11
  #define LIGHTWOOD        12
  #define PAINTING         13
  #define METALWORKFLOW    14

  struct Ray { vec3 origin; vec3 direction; };
  struct Sphere { float radius; vec3 position; vec3 emission; vec3 color; int type; };
  struct Ellipsoid { vec3 radii; vec3 position; vec3 emission; vec3 color; int type; };
  struct UnitSphere { vec3 position; vec3 emission; vec3 color; int type; };
  struct Plane { vec4 pla; vec3 emission; vec3 color; int type; };
  struct Disk { float radius; vec3 pos; vec3 normal; vec3 emission; vec3 color; int type; };
  struct Rectangle { vec3 position; vec3 normal; float radiusU; float radiusV; vec3 emission; vec3 color; int type; };
  struct RectangleLight { vec3 position; vec3 normal; float radiusU; float radiusV; vec3 emission; vec3 color; int type; };
  struct Triangle { vec3 v0; vec3 v1; vec3 v2; vec3 emission; vec3 color; int type; };
  struct Box { vec3 minCorner; vec3 maxCorner; vec3 emission; vec3 color; int type; };
  struct Wedge { vec3 v0; vec3 v1; vec3 v2; vec3 v3; vec3 emission; vec3 color; int type; };
  
  // Noise functions
  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  // Random number generation
  vec3 randomSphereDirection(inout float seed) {
    vec2 h = hash2(vec2(seed += 0.1, seed += 0.1)) * vec2(1, 6.28318530718);
    float phi = h.y;
    float r = sqrt(h.x);
    return vec3(sqrt(1.0 - h.x) * vec2(sin(phi), cos(phi)), r);
  }

  vec3 randomHemisphereDirection(vec3 n, inout float seed) {
    vec3 dr = randomSphereDirection(seed);
    return dot(dr, n) < 0.0 ? -dr : dr;
  }

  // Intersection functions
  float SphereIntersect(float rad, vec3 pos, Ray r) {
    vec3 L = r.origin - pos;
    float a = dot(r.direction, r.direction);
    float b = 2.0 * dot(r.direction, L);
    float c = dot(L, L) - (rad * rad);
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) return INFINITY;
    float sqrt_d = sqrt(discriminant);
    float t1 = (-b - sqrt_d) / (2.0 * a);
    float t2 = (-b + sqrt_d) / (2.0 * a);
    return (t1 > 0.0) ? t1 : ((t2 > 0.0) ? t2 : INFINITY);
  }

  float PlaneIntersect(vec4 pla, Ray r) {
    float denom = dot(pla.xyz, r.direction);
    if (abs(denom) < 0.001) return INFINITY;
    float t = (-pla.w - dot(pla.xyz, r.origin)) / denom;
    return (t > 0.0) ? t : INFINITY;
  }

  float BoxIntersect(vec3 minCorner, vec3 maxCorner, Ray r) {
    vec3 invDir = 1.0 / r.direction;
    vec3 near = (minCorner - r.origin) * invDir;
    vec3 far = (maxCorner - r.origin) * invDir;
    vec3 tmin = min(near, far);
    vec3 tmax = max(near, far);
    float t0 = max(max(tmin.x, tmin.y), tmin.z);
    float t1 = min(min(tmax.x, tmax.y), tmax.z);
    return (t0 < t1 && t1 > 0.0) ? ((t0 > 0.0) ? t0 : t1) : INFINITY;
  }

  // Material handling
  vec3 calcDirectLighting(vec3 mask, vec3 x, vec3 nl, vec3 dirToLight, float lightDistance, vec3 lightColor) {
    float dotNL = max(0.0, dot(nl, dirToLight));
    return mask * lightColor * dotNL / (lightDistance * lightDistance);
  }

  // Tone mapping
  vec3 ReinhardToneMapping(vec3 color) {
    return color / (1.0 + color);
  }

  vec3 OptimizedCineonToneMapping(vec3 color) {
    color = max(vec3(0.0), color - 0.004);
    return (color * (6.2 * color + 0.5)) / (color * (6.2 * color + 1.7) + 0.06);
  }

  // Color space conversion
  vec3 sRGBToLinear(vec3 srgb) {
    return pow(srgb, vec3(2.2));
  }

  vec3 linearToSRGB(vec3 linear) {
    return pow(linear, vec3(1.0 / 2.2));
  }

  // Camera ray generation
  Ray getRay(vec2 coord, vec2 jitter) {
    vec2 pixelOffset = jitter / uResolution;
    vec2 uv = (coord + pixelOffset) / uResolution;
    uv = uv * 2.0 - 1.0;
    
    vec3 rayDir = normalize(vec3(uv * vec2(uULen, uVLen), -1.0));
    rayDir = (uCameraMatrix * vec4(rayDir, 0.0)).xyz;
    
    vec3 rayOrigin = (uCameraMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    
    // Depth of field
    if (uApertureSize > 0.0) {
      vec2 apertureSample = uApertureSize * randomHemisphereDirection(vec3(0, 0, 1), coord.x + coord.y).xy;
      vec3 focalPoint = rayOrigin + rayDir * uFocusDistance;
      rayOrigin += vec3(apertureSample, 0.0);
      rayDir = normalize(focalPoint - rayOrigin);
    }
    
    return Ray(rayOrigin, rayDir);
  }
`;

// Create the base path tracing material
const PathTracingMaterial = shaderMaterial(
  createPathTracingUniforms(),
  pathTracingVertexShader,
  // This will be replaced by specific fragment shaders
  `
    ${pathTracingCommonCode}
    
    void main() {
      vec2 pixelPos = gl_FragCoord.xy;
      vec3 pixelColor = vec3(0.0);
      
      // Default simple scene for testing
      Ray ray = getRay(pixelPos, vec2(hash(pixelPos.x + pixelPos.y * uResolution.x + uFrameCounter)));
      
      // Simple sphere intersection
      float t = SphereIntersect(50.0, vec3(0, 0, -200), ray);
      if (t < INFINITY) {
        vec3 hitPoint = ray.origin + ray.direction * t;
        vec3 normal = normalize(hitPoint - vec3(0, 0, -200));
        pixelColor = vec3(0.5) + 0.5 * normal;
      } else {
        // Sky gradient
        float y = normalize(ray.direction).y;
        pixelColor = mix(vec3(1.0, 1.0, 0.9), vec3(0.5, 0.7, 1.0), y * 0.5 + 0.5);
      }
      
      // Progressive accumulation
      if (uSampleCounter > 0.0) {
        vec3 previousColor = texture2D(tPreviousTexture, vUv).rgb;
        pixelColor = mix(previousColor, pixelColor, 1.0 / (uSampleCounter + 1.0));
      }
      
      gl_FragColor = vec4(linearToSRGB(OptimizedCineonToneMapping(pixelColor)), 1.0);
    }
  `
);

extend({ PathTracingMaterial });

export const PathTracingCore = ({ 
  children, 
  fragmentShader,
  customUniforms = {},
  sceneIsDynamic = false,
  enabled = true,
  resolution = [1024, 1024],
  pixelRatio = 1.0,
  apertureSize = 0.0,
  focusDistance = 132.0,
  onFrameUpdate
}) => {
  const { gl, camera, size } = useThree();
  const meshRef = useRef();
  const materialRef = useRef();
  const renderTargetRef = useRef();
  const prevRenderTargetRef = useRef();
  
  // Create render targets
  const renderTargets = useMemo(() => {
    const rtA = new THREE.WebGLRenderTarget(resolution[0], resolution[1], {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      stencilBuffer: false,
      depthBuffer: false
    });
    
    const rtB = new THREE.WebGLRenderTarget(resolution[0], resolution[1], {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      stencilBuffer: false,
      depthBuffer: false
    });
    
    return [rtA, rtB];
  }, [resolution]);
  
  // Blue noise texture for better sampling
  const blueNoiseTexture = useLoader(THREE.TextureLoader, '/textures/BlueNoise_RGBA256.png');
  
  useEffect(() => {
    if (blueNoiseTexture) {
      blueNoiseTexture.wrapS = THREE.RepeatWrapping;
      blueNoiseTexture.wrapT = THREE.RepeatWrapping;
      blueNoiseTexture.flipY = false;
      blueNoiseTexture.minFilter = THREE.LinearFilter;
      blueNoiseTexture.magFilter = THREE.LinearFilter;
      blueNoiseTexture.generateMipmaps = false;
    }
  }, [blueNoiseTexture]);
  
  // Camera state tracking
  const cameraState = useRef({
    prevMatrix: new THREE.Matrix4(),
    isMoving: false,
    frameCounter: 1,
    sampleCounter: 0
  });
  
  // Update uniforms based on camera movement
  const updateCameraUniforms = useCallback(() => {
    if (!materialRef.current) return;
    
    const currentMatrix = camera.matrixWorld.clone();
    const isMoving = !currentMatrix.equals(cameraState.current.prevMatrix) || sceneIsDynamic;
    
    if (isMoving || sceneIsDynamic) {
      cameraState.current.sampleCounter = 0;
      cameraState.current.isMoving = true;
    } else {
      cameraState.current.sampleCounter++;
      cameraState.current.isMoving = false;
    }
    
    cameraState.current.frameCounter++;
    cameraState.current.prevMatrix.copy(currentMatrix);
    
    // Update all uniforms
    const uniforms = materialRef.current.uniforms;
    uniforms.uCameraMatrix.value.copy(camera.matrixWorld);
    uniforms.uCameraInverseMatrix.value.copy(camera.matrixWorldInverse);
    uniforms.uResolution.value.set(resolution[0], resolution[1]);
    uniforms.uFrameCounter.value = cameraState.current.frameCounter;
    uniforms.uSampleCounter.value = cameraState.current.sampleCounter;
    uniforms.uCameraIsMoving.value = cameraState.current.isMoving;
    uniforms.uPixelRatio.value = pixelRatio;
    uniforms.uApertureSize.value = apertureSize;
    uniforms.uFocusDistance.value = focusDistance;
    
    // Calculate camera parameters
    const fov = camera.fov * Math.PI / 180;
    const aspect = size.width / size.height;
    uniforms.uULen.value = Math.tan(fov * 0.5) * aspect;
    uniforms.uVLen.value = Math.tan(fov * 0.5);
    
    // Random vector for sampling
    uniforms.uRandomVector.value.set(
      Math.random(),
      Math.random(),
      Math.random()
    );
    
    // Blue noise texture
    if (blueNoiseTexture) {
      uniforms.tBlueNoiseTexture.value = blueNoiseTexture;
    }
    
    // Previous frame texture for accumulation
    uniforms.tPreviousTexture.value = prevRenderTargetRef.current?.texture || null;
    
  }, [camera, resolution, pixelRatio, apertureSize, focusDistance, sceneIsDynamic, size, blueNoiseTexture]);
  
  useFrame((state, delta) => {
    if (!enabled || !materialRef.current) return;
    
    updateCameraUniforms();
    
    // Update time uniform
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Swap render targets for accumulation
    [renderTargetRef.current, prevRenderTargetRef.current] = [prevRenderTargetRef.current, renderTargetRef.current];
    
    if (onFrameUpdate) {
      onFrameUpdate({
        frameCounter: cameraState.current.frameCounter,
        sampleCounter: cameraState.current.sampleCounter,
        isMoving: cameraState.current.isMoving
      });
    }
  });
  
  // Combined uniforms (base + custom)
  const allUniforms = useMemo(() => ({
    ...createPathTracingUniforms(),
    ...customUniforms
  }), [customUniforms]);
  
  if (!enabled) return null;
  
  return (
    <group name="path-tracing-core">
      {/* Full-screen quad for path tracing */}
      <mesh ref={meshRef}>
        <planeGeometry args={[2, 2]} />
        {fragmentShader ? (
          <shaderMaterial
            ref={materialRef}
            uniforms={allUniforms}
            vertexShader={pathTracingVertexShader}
            fragmentShader={`${pathTracingCommonCode}\n${fragmentShader}`}
            transparent={false}
            depthTest={false}
            depthWrite={false}
          />
        ) : (
          <pathTracingMaterial
            ref={materialRef}
            key={PathTracingMaterial.key}
          />
        )}
      </mesh>
      
      {/* Child components can add scene-specific elements */}
      {children}
    </group>
  );
};

export default PathTracingCore; 
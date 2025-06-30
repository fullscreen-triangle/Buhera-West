import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Water } from 'three-stdlib';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { PathTracingCore } from '../pathtracing/PathTracingCore';

/**
 * Oceanic Visualization Component with Path Tracing
 * Based on Ocean_And_Sky_Rendering.js from THREE.js-PathTracing-Renderer
 */

// Ocean and Sky rendering fragment shader (adapted from original)
const oceanSkyFragmentShader = `
  // Ocean and Sky specific uniforms
  uniform float uSunAngle;
  uniform vec3 uSunDirection;
  uniform mat4 uTallBoxInvMatrix;
  uniform mat4 uShortBoxInvMatrix;
  uniform float uCameraUnderWater;
  uniform sampler2D t_PerlinNoise;

  // Ocean wave function using Perlin noise
  float getOceanHeight(vec2 pos) {
    vec2 uv = pos * 0.0005;
    float height = 0.0;
    height += texture2D(t_PerlinNoise, uv * 0.1 + uTime * 0.02).r * 8.0;
    height += texture2D(t_PerlinNoise, uv * 0.3 + uTime * 0.03).r * 4.0;
    height += texture2D(t_PerlinNoise, uv * 0.8 + uTime * 0.05).r * 2.0;
    height += texture2D(t_PerlinNoise, uv * 2.0 + uTime * 0.08).r * 1.0;
    return height - 8.0; // Center around 0
  }

  // Ocean normal calculation
  vec3 getOceanNormal(vec2 pos) {
    float eps = 1.0;
    float heightL = getOceanHeight(pos - vec2(eps, 0.0));
    float heightR = getOceanHeight(pos + vec2(eps, 0.0));
    float heightD = getOceanHeight(pos - vec2(0.0, eps));
    float heightU = getOceanHeight(pos + vec2(0.0, eps));
    
    vec3 normal = normalize(vec3(heightL - heightR, 2.0 * eps, heightD - heightU));
    return normal;
  }

  // Ocean intersection
  float OceanIntersect(Ray r) {
    float t = 0.0;
    vec3 pos = r.origin;
    vec3 dir = r.direction;
    
    // March along ray to find ocean surface
    for (int i = 0; i < 100; i++) {
      pos = r.origin + dir * t;
      float oceanHeight = getOceanHeight(pos.xz);
      float diff = pos.y - oceanHeight;
      
      if (diff < 1.0) {
        return t;
      }
      
      t += max(0.5, diff * 0.5);
      if (t > 10000.0) break;
    }
    
    return INFINITY;
  }

  // Box intersection for floating objects
  float BoxIntersect(vec3 minCorner, vec3 maxCorner, Ray r, mat4 invMatrix) {
    // Transform ray into box space
    vec3 ro = (invMatrix * vec4(r.origin, 1.0)).xyz;
    vec3 rd = (invMatrix * vec4(r.direction, 0.0)).xyz;
    
    vec3 invDir = 1.0 / rd;
    vec3 near = (minCorner - ro) * invDir;
    vec3 far = (maxCorner - ro) * invDir;
    vec3 tmin = min(near, far);
    vec3 tmax = max(near, far);
    
    float t0 = max(max(tmin.x, tmin.y), tmin.z);
    float t1 = min(min(tmax.x, tmax.y), tmax.z);
    
    return (t0 < t1 && t1 > 0.0) ? ((t0 > 0.0) ? t0 : t1) : INFINITY;
  }

  // Sky color calculation
  vec3 getSkyColor(Ray r) {
    vec3 skyColor = vec3(0.0);
    float sunDot = max(0.0, dot(r.direction, uSunDirection));
    
    // Atmosphere scattering approximation
    float elevation = r.direction.y;
    vec3 horizonColor = mix(vec3(1.0, 0.9, 0.7), vec3(0.7, 0.9, 1.0), elevation * 0.5 + 0.5);
    vec3 zenithColor = vec3(0.3, 0.6, 1.0);
    skyColor = mix(horizonColor, zenithColor, smoothstep(0.0, 0.4, elevation));
    
    // Sun disk
    if (sunDot > 0.9995) {
      skyColor = vec3(3.0, 2.8, 2.5);
    } else if (sunDot > 0.999) {
      float sunFactor = (sunDot - 0.999) / 0.0005;
      skyColor = mix(skyColor, vec3(2.0, 1.8, 1.5), sunFactor);
    }
    
    // Sun glow
    float sunGlow = pow(max(0.0, sunDot), 50.0);
    skyColor += vec3(1.0, 0.8, 0.6) * sunGlow * 0.5;
    
    return skyColor;
  }

  // Main path tracing function
  vec3 CalculateRadiance(Ray r, inout float seed) {
    vec3 accumuatedColor = vec3(0.0);
    vec3 mask = vec3(1.0);
    
    for (int bounces = 0; bounces < 6; bounces++) {
      float t = INFINITY;
      int hitType = 0;
      
      // Test ocean intersection
      float oceanT = OceanIntersect(r);
      if (oceanT < t) {
        t = oceanT;
        hitType = 1; // Ocean
      }
      
      // Test tall box intersection
      float tallBoxT = BoxIntersect(vec3(-100, 0, -100), vec3(100, 340, 100), r, uTallBoxInvMatrix);
      if (tallBoxT < t) {
        t = tallBoxT;
        hitType = 2; // Tall box
      }
      
      // Test short box intersection
      float shortBoxT = BoxIntersect(vec3(-100, 0, -100), vec3(100, 170, 100), r, uShortBoxInvMatrix);
      if (shortBoxT < t) {
        t = shortBoxT;
        hitType = 3; // Short box
      }
      
      if (t == INFINITY) {
        // Hit sky
        accumuatedColor += mask * getSkyColor(r);
        break;
      }
      
      vec3 hitPoint = r.origin + r.direction * t;
      vec3 normal;
      vec3 materialColor;
      float roughness = 0.0;
      
      if (hitType == 1) {
        // Ocean surface
        normal = getOceanNormal(hitPoint.xz);
        materialColor = vec3(0.1, 0.3, 0.6);
        roughness = 0.02;
        
        // Fresnel effect for ocean
        float fresnel = pow(1.0 - max(0.0, dot(-r.direction, normal)), 5.0);
        fresnel = mix(0.02, 1.0, fresnel);
        
        if (hash(seed += 1.0) < fresnel) {
          // Reflection
          r.direction = reflect(r.direction, normal);
        } else {
          // Refraction into water
          r.direction = refract(r.direction, normal, 0.75);
          if (length(r.direction) == 0.0) {
            r.direction = reflect(r.direction, normal);
          }
          mask *= vec3(0.8, 0.9, 1.0); // Water tint
        }
        
      } else {
        // Box surfaces
        if (hitType == 2) {
          // Calculate box normal for tall box
          vec3 boxCenter = (uTallBoxInvMatrix * vec4(0, 170, 0, 1)).xyz;
          vec3 localHit = (uTallBoxInvMatrix * vec4(hitPoint, 1.0)).xyz;
          normal = normalize(sign(localHit) * step(abs(localHit.yzx), abs(localHit)) * step(abs(localHit.zxy), abs(localHit)));
          normal = normalize((transpose(uTallBoxInvMatrix) * vec4(normal, 0.0)).xyz);
        } else {
          // Calculate box normal for short box
          vec3 localHit = (uShortBoxInvMatrix * vec4(hitPoint, 1.0)).xyz;
          normal = normalize(sign(localHit) * step(abs(localHit.yzx), abs(localHit)) * step(abs(localHit.zxy), abs(localHit)));
          normal = normalize((transpose(uShortBoxInvMatrix) * vec4(normal, 0.0)).xyz);
        }
        
        materialColor = vec3(0.9);
        roughness = 1.0;
        
        // Diffuse reflection
        r.direction = randomHemisphereDirection(normal, seed);
        mask *= materialColor * max(0.0, dot(normal, r.direction));
      }
      
      r.origin = hitPoint + normal * uEPS_intersect;
      
      // Russian roulette
      float probability = max(mask.r, max(mask.g, mask.b));
      if (bounces > 3) {
        if (hash(seed += 1.0) > probability) break;
        mask /= probability;
      }
    }
    
    return accumuatedColor;
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
    
    // Underwater tint
    if (uCameraUnderWater > 0.5) {
      pixelColor *= vec3(0.4, 0.8, 1.0);
      pixelColor = mix(pixelColor, vec3(0.0, 0.2, 0.4), 0.3);
    }
    
    gl_FragColor = vec4(linearToSRGB(OptimizedCineonToneMapping(pixelColor)), 1.0);
  }
`;

export const OceanicVisualization = ({ data, qualityLevel, enabled }) => {
  const { camera } = useThree();
  const groupRef = useRef();
  
  // Animation state
  const animationState = useRef({
    sunAngle: 0,
    sunDirection: new THREE.Vector3()
  });
  
  // Load Perlin noise texture
  const perlinTexture = useLoader(THREE.TextureLoader, '/textures/perlin256.png');
  
  useEffect(() => {
    if (perlinTexture) {
      perlinTexture.wrapS = THREE.RepeatWrapping;
      perlinTexture.wrapT = THREE.RepeatWrapping;
      perlinTexture.flipY = false;
      perlinTexture.minFilter = THREE.LinearFilter;
      perlinTexture.magFilter = THREE.LinearFilter;
      perlinTexture.generateMipmaps = false;
    }
  }, [perlinTexture]);
  
  // Create floating boxes for the scene
  const boxMatrices = useMemo(() => {
    const tallBox = new THREE.Matrix4();
    const shortBox = new THREE.Matrix4();
    
    // Tall box transformation
    tallBox.makeRotationY(Math.PI * 0.1);
    tallBox.setPosition(180, 170, -350);
    
    // Short box transformation  
    shortBox.makeRotationY(-Math.PI * 0.09);
    shortBox.setPosition(370, 85, -170);
    
    return {
      tallBoxInvMatrix: tallBox.clone().invert(),
      shortBoxInvMatrix: shortBox.clone().invert()
    };
  }, []);
  
  // Custom uniforms for ocean rendering
  const customUniforms = useMemo(() => ({
    t_PerlinNoise: { value: perlinTexture },
    uSunAngle: { value: 0.0 },
    uSunDirection: { value: new THREE.Vector3() },
    uTallBoxInvMatrix: { value: boxMatrices.tallBoxInvMatrix },
    uShortBoxInvMatrix: { value: boxMatrices.shortBoxInvMatrix },
    uCameraUnderWater: { value: 0.0 }
  }), [perlinTexture, boxMatrices]);
  
  // Update animation
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Animate sun
    animationState.current.sunAngle = (state.clock.elapsedTime * 0.035) % (Math.PI + 0.2) - 0.11;
    animationState.current.sunDirection.set(
      Math.cos(animationState.current.sunAngle),
      Math.sin(animationState.current.sunAngle),
      -Math.cos(animationState.current.sunAngle) * 2.0
    );
    animationState.current.sunDirection.normalize();
    
    // Update uniforms
    if (customUniforms.uSunAngle) {
      customUniforms.uSunAngle.value = animationState.current.sunAngle;
      customUniforms.uSunDirection.value.copy(animationState.current.sunDirection);
      
      // Check if camera is underwater
      const cameraY = camera.position.y;
      customUniforms.uCameraUnderWater.value = cameraY < 2.0 ? 1.0 : 0.0;
    }
  });
  
  if (!enabled || !data) return null;
  
  return (
    <group ref={groupRef} name="oceanic-visualization">
      <PathTracingCore
        fragmentShader={oceanSkyFragmentShader}
        customUniforms={customUniforms}
        sceneIsDynamic={true}
        enabled={enabled}
        resolution={[Math.floor(1024 * qualityLevel), Math.floor(1024 * qualityLevel)]}
        pixelRatio={qualityLevel}
        apertureSize={0.0}
        focusDistance={1180.0}
      />
      
      {/* Visual reference boxes (invisible in path tracing but help with scene setup) */}
      <group visible={false}>
        <mesh position={[180, 170, -350]} rotation={[0, Math.PI * 0.1, 0]}>
          <boxGeometry args={[200, 340, 200]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        
        <mesh position={[370, 85, -170]} rotation={[0, -Math.PI * 0.09, 0]}>
          <boxGeometry args={[200, 170, 200]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      
      {/* Ocean surface representation for Three.js rendering */}
      {qualityLevel > 0.5 && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4000, 4000, 128, 128]} />
          <meshStandardMaterial
            color="#0066cc"
            metalness={0.1}
            roughness={0.1}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
};

OceanicVisualization.propTypes = {
  data: PropTypes.shape({
    surfaceMesh: PropTypes.instanceOf(Float32Array),
    currentVectors: PropTypes.array,
    temperatureField: PropTypes.instanceOf(Float32Array),
    waveData: PropTypes.object,
  }),
  qualityLevel: PropTypes.number.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default OceanicVisualization; 
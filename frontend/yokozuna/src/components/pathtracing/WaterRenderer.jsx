import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { PathTracingCore } from './PathTracingCore';

/**
 * Water Renderer Component with Path Tracing
 * Based on Water_Rendering.js from THREE.js-PathTracing-Renderer
 */

// Water rendering fragment shader (adapted from original)
const waterRenderingFragmentShader = `
  // Water rendering specific uniforms
  uniform mat4 uTallBoxInvMatrix;
  uniform mat4 uShortBoxInvMatrix;
  uniform float uWaterLevel;

  // Water intersection function
  float WaterIntersect(Ray r) {
    if (r.direction.y == 0.0) return INFINITY;
    float t = (uWaterLevel - r.origin.y) / r.direction.y;
    return (t > 0.0) ? t : INFINITY;
  }

  // Box intersection in transformed space
  float BoxIntersectTransformed(vec3 minCorner, vec3 maxCorner, Ray r, mat4 invMatrix) {
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

  // Get normal for transformed box
  vec3 getBoxNormal(vec3 hitPoint, mat4 invMatrix) {
    vec3 localHit = (invMatrix * vec4(hitPoint, 1.0)).xyz;
    vec3 normal = vec3(0.0);
    
    // Determine which face was hit
    vec3 absLocal = abs(localHit);
    if (absLocal.x > absLocal.y && absLocal.x > absLocal.z) {
      normal = vec3(sign(localHit.x), 0.0, 0.0);
    } else if (absLocal.y > absLocal.z) {
      normal = vec3(0.0, sign(localHit.y), 0.0);
    } else {
      normal = vec3(0.0, 0.0, sign(localHit.z));
    }
    
    // Transform normal back to world space
    return normalize((transpose(invMatrix) * vec4(normal, 0.0)).xyz);
  }

  // Underwater light attenuation
  vec3 underwaterAttenuation(vec3 color, float distance) {
    // Water absorption coefficients (approximate)
    vec3 absorption = vec3(0.4, 0.05, 0.01); // Red attenuates fastest
    return color * exp(-absorption * distance * 0.1);
  }

  // Caustic effect simulation
  float getCaustics(vec3 worldPos, float time) {
    vec2 uv = worldPos.xz * 0.02;
    float caustic = 0.0;
    
    // Layer multiple sine waves for caustic pattern
    caustic += sin(uv.x * 6.0 + time * 2.0) * sin(uv.y * 6.0 + time * 1.5);
    caustic += sin(uv.x * 12.0 - time * 1.8) * sin(uv.y * 8.0 + time * 2.2) * 0.5;
    caustic += sin(uv.x * 18.0 + time * 1.2) * sin(uv.y * 14.0 - time * 1.7) * 0.25;
    
    return max(0.0, caustic * 0.3 + 0.7);
  }

  // Main path tracing function for water scene
  vec3 CalculateRadiance(Ray r, inout float seed) {
    vec3 accumulatedColor = vec3(0.0);
    vec3 mask = vec3(1.0);
    bool inWater = false;
    
    for (int bounces = 0; bounces < 8; bounces++) {
      float t = INFINITY;
      int hitType = 0;
      
      // Test water surface intersection
      float waterT = WaterIntersect(r);
      if (waterT < t) {
        t = waterT;
        hitType = 1; // Water surface
      }
      
      // Test tall box intersection
      float tallBoxT = BoxIntersectTransformed(vec3(-100, 0, -100), vec3(100, 340, 100), r, uTallBoxInvMatrix);
      if (tallBoxT < t) {
        t = tallBoxT;
        hitType = 2; // Tall box
      }
      
      // Test short box intersection
      float shortBoxT = BoxIntersectTransformed(vec3(-100, 0, -100), vec3(100, 170, 100), r, uShortBoxInvMatrix);
      if (shortBoxT < t) {
        t = shortBoxT;
        hitType = 3; // Short box
      }
      
      if (t == INFINITY) {
        // Hit sky
        float skyIntensity = inWater ? 0.1 : 1.0;
        vec3 skyColor = vec3(0.5, 0.7, 1.0) * skyIntensity;
        
        // Sun direction (simple)
        vec3 sunDir = normalize(vec3(0.3, 0.6, 0.2));
        float sunDot = max(0.0, dot(r.direction, sunDir));
        if (sunDot > 0.995) {
          skyColor += vec3(3.0) * (inWater ? 0.1 : 1.0);
        }
        
        accumulatedColor += mask * skyColor;
        break;
      }
      
      vec3 hitPoint = r.origin + r.direction * t;
      vec3 normal;
      vec3 materialColor;
      float roughness = 0.0;
      bool isSpecular = false;
      
      if (hitType == 1) {
        // Water surface
        normal = vec3(0.0, 1.0, 0.0);
        materialColor = vec3(0.0, 0.3, 0.5);
        
        // Determine if entering or exiting water
        bool enteringWater = !inWater && r.direction.y < 0.0;
        bool exitingWater = inWater && r.direction.y > 0.0;
        
        if (enteringWater || exitingWater) {
          float eta = enteringWater ? 1.0 / 1.33 : 1.33; // Air to water or water to air
          
          // Fresnel calculation
          float cosTheta = abs(dot(r.direction, normal));
          float fresnel = pow(1.0 - cosTheta, 5.0);
          fresnel = mix(0.02, 1.0, fresnel);
          
          if (hash(seed += 1.0) < fresnel) {
            // Reflection
            r.direction = reflect(r.direction, normal);
          } else {
            // Refraction
            vec3 refractDir = refract(r.direction, normal * (enteringWater ? 1.0 : -1.0), eta);
            if (length(refractDir) > 0.0) {
              r.direction = refractDir;
              inWater = !inWater;
              if (inWater) {
                mask *= vec3(0.8, 0.95, 1.0); // Water tint
              }
            } else {
              // Total internal reflection
              r.direction = reflect(r.direction, normal);
            }
          }
        }
        
      } else {
        // Box surfaces
        if (hitType == 2) {
          normal = getBoxNormal(hitPoint, uTallBoxInvMatrix);
        } else {
          normal = getBoxNormal(hitPoint, uShortBoxInvMatrix);
        }
        
        materialColor = vec3(0.8);
        roughness = 0.8;
        
        // Add caustics if underwater
        if (inWater) {
          float caustics = getCaustics(hitPoint, uTime);
          materialColor *= caustics;
        }
        
        // Lambertian reflection
        r.direction = randomHemisphereDirection(normal, seed);
        
        // Apply water attenuation if underwater
        if (inWater) {
          mask = underwaterAttenuation(mask, t);
        }
        
        mask *= materialColor * max(0.0, dot(normal, r.direction));
      }
      
      r.origin = hitPoint + normal * uEPS_intersect;
      
      // Russian roulette termination
      float probability = max(mask.r, max(mask.g, mask.b));
      if (bounces > 3) {
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
    
    // Final tone mapping and gamma correction
    gl_FragColor = vec4(linearToSRGB(OptimizedCineonToneMapping(pixelColor)), 1.0);
  }
`;

export const WaterRenderer = ({ 
  waterLevel = 0.0,
  enabled = true,
  qualityLevel = 1.0,
  onRenderUpdate
}) => {
  const { camera } = useThree();
  const groupRef = useRef();
  
  // Create box matrices for floating objects
  const boxMatrices = useMemo(() => {
    const tallBox = new THREE.Matrix4();
    const shortBox = new THREE.Matrix4();
    
    // Tall box transformation (same as original)
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
  
  // Custom uniforms for water rendering
  const customUniforms = useMemo(() => ({
    uTallBoxInvMatrix: { value: boxMatrices.tallBoxInvMatrix },
    uShortBoxInvMatrix: { value: boxMatrices.shortBoxInvMatrix },
    uWaterLevel: { value: waterLevel }
  }), [boxMatrices, waterLevel]);
  
  // Update uniforms
  useFrame((state, delta) => {
    if (!enabled) return;
    
    if (customUniforms.uWaterLevel) {
      customUniforms.uWaterLevel.value = waterLevel;
    }
    
    if (onRenderUpdate) {
      const cameraUnderWater = camera.position.y < waterLevel;
      onRenderUpdate({
        cameraUnderWater,
        waterLevel,
        frameTime: delta
      });
    }
  });
  
  if (!enabled) return null;
  
  return (
    <group ref={groupRef} name="water-renderer">
      <PathTracingCore
        fragmentShader={waterRenderingFragmentShader}
        customUniforms={customUniforms}
        sceneIsDynamic={false}
        enabled={enabled}
        resolution={[Math.floor(1024 * qualityLevel), Math.floor(1024 * qualityLevel)]}
        pixelRatio={qualityLevel}
        apertureSize={0.0}
        focusDistance={500.0}
      />
      
      {/* Visual reference objects (invisible in path tracing) */}
      <group visible={false}>
        {/* Water plane for reference */}
        <mesh position={[0, waterLevel, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2000, 2000]} />
          <meshBasicMaterial color="#0066cc" transparent opacity={0.3} />
        </mesh>
        
        {/* Reference boxes */}
        <mesh position={[180, 170, -350]} rotation={[0, Math.PI * 0.1, 0]}>
          <boxGeometry args={[200, 340, 200]} />
          <meshBasicMaterial color="#cccccc" wireframe />
        </mesh>
        
        <mesh position={[370, 85, -170]} rotation={[0, -Math.PI * 0.09, 0]}>
          <boxGeometry args={[200, 170, 200]} />
          <meshBasicMaterial color="#cccccc" wireframe />
        </mesh>
      </group>
      
      {/* Three.js water representation for fallback */}
      {qualityLevel < 0.5 && (
        <mesh position={[0, waterLevel, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4000, 4000]} />
          <meshStandardMaterial
            color="#0088cc"
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

WaterRenderer.propTypes = {
  waterLevel: PropTypes.number,
  enabled: PropTypes.bool,
  qualityLevel: PropTypes.number,
  onRenderUpdate: PropTypes.func
};

export default WaterRenderer; 
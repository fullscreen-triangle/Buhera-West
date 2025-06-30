import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { PathTracingCore } from './PathTracingCore';

/**
 * Volumetric Renderer Component with Path Tracing
 * Based on Volumetric_Rendering.js from THREE.js-PathTracing-Renderer
 */

const volumetricRenderingFragmentShader = `
  // Volumetric rendering specific uniforms
  uniform vec3 uSunDirection;
  uniform float uDensity;
  uniform float uScattering;
  uniform vec3 uVolumeColor;

  // Volume density function
  float getVolumeDensity(vec3 pos) {
    // Simple cloud-like volume using noise
    float density = 0.0;
    
    // Multiple layers of noise for realistic clouds
    density += sin(pos.x * 0.02) * sin(pos.y * 0.01) * sin(pos.z * 0.015) * 0.3;
    density += sin(pos.x * 0.05) * sin(pos.y * 0.03) * sin(pos.z * 0.04) * 0.2;
    density += sin(pos.x * 0.1) * sin(pos.y * 0.08) * sin(pos.z * 0.12) * 0.1;
    
    // Add time-based animation
    density += sin(pos.x * 0.03 + uTime * 0.5) * sin(pos.z * 0.025 + uTime * 0.3) * 0.15;
    
    // Apply base density and ensure non-negative
    density = max(0.0, density + 0.1) * uDensity;
    
    // Height-based falloff (clouds get thinner with altitude)
    float heightFactor = exp(-max(0.0, pos.y - 100.0) * 0.001);
    density *= heightFactor;
    
    return density;
  }

  // Phase function for scattering (Henyey-Greenstein)
  float phaseFunction(float cosTheta, float g) {
    float g2 = g * g;
    return (1.0 - g2) / (4.0 * PI * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
  }

  // Single scattering approximation
  vec3 singleScattering(vec3 rayStart, vec3 rayDir, float rayLength, vec3 sunDir) {
    vec3 scatteredLight = vec3(0.0);
    int numSamples = 32;
    float stepSize = rayLength / float(numSamples);
    
    for (int i = 0; i < numSamples; i++) {
      float t = (float(i) + 0.5) * stepSize;
      vec3 samplePos = rayStart + rayDir * t;
      
      float density = getVolumeDensity(samplePos);
      if (density > 0.0) {
        // Calculate lighting from sun
        float sunCosTheta = dot(rayDir, sunDir);
        float phase = phaseFunction(sunCosTheta, 0.3); // Forward scattering
        
        // Simple shadow approximation
        float shadowFactor = 1.0;
        vec3 shadowRayStart = samplePos;
        for (int j = 0; j < 8; j++) {
          vec3 shadowPos = shadowRayStart + sunDir * float(j) * 10.0;
          float shadowDensity = getVolumeDensity(shadowPos);
          shadowFactor *= exp(-shadowDensity * 0.1);
        }
        
        // Accumulate scattering
        vec3 sunColor = vec3(1.0, 0.9, 0.7);
        scatteredLight += density * phase * shadowFactor * sunColor * stepSize * uScattering;
      }
    }
    
    return scatteredLight * uVolumeColor;
  }

  // Ray-volume intersection
  vec2 VolumeIntersect(Ray r) {
    // Simple box volume bounds
    vec3 volumeMin = vec3(-500.0, 50.0, -500.0);
    vec3 volumeMax = vec3(500.0, 300.0, 500.0);
    
    vec3 invDir = 1.0 / r.direction;
    vec3 near = (volumeMin - r.origin) * invDir;
    vec3 far = (volumeMax - r.origin) * invDir;
    vec3 tmin = min(near, far);
    vec3 tmax = max(near, far);
    
    float t0 = max(max(tmin.x, tmin.y), tmin.z);
    float t1 = min(min(tmax.x, tmax.y), tmax.z);
    
    if (t0 > t1 || t1 < 0.0) return vec2(-1.0);
    
    return vec2(max(0.0, t0), t1);
  }

  // Ground plane intersection
  float GroundIntersect(Ray r) {
    if (abs(r.direction.y) < 0.001) return INFINITY;
    float t = -r.origin.y / r.direction.y;
    return (t > 0.0) ? t : INFINITY;
  }

  // Sky color
  vec3 getSkyColor(Ray r) {
    float elevation = r.direction.y;
    vec3 horizonColor = vec3(1.0, 0.95, 0.8);
    vec3 zenithColor = vec3(0.3, 0.6, 1.0);
    
    vec3 skyColor = mix(horizonColor, zenithColor, smoothstep(0.0, 0.3, elevation));
    
    // Sun disk
    float sunDot = max(0.0, dot(r.direction, uSunDirection));
    if (sunDot > 0.9995) {
      skyColor = vec3(3.0, 2.8, 2.5);
    }
    
    return skyColor;
  }

  // Main path tracing function for volumetric scene
  vec3 CalculateRadiance(Ray r, inout float seed) {
    vec3 accumulatedColor = vec3(0.0);
    vec3 mask = vec3(1.0);
    
    for (int bounces = 0; bounces < 4; bounces++) {
      float t = INFINITY;
      int hitType = 0;
      
      // Test ground intersection
      float groundT = GroundIntersect(r);
      if (groundT < t) {
        t = groundT;
        hitType = 1; // Ground
      }
      
      // Test volume intersection
      vec2 volumeT = VolumeIntersect(r);
      if (volumeT.x >= 0.0 && volumeT.x < t) {
        // Ray enters volume
        float rayLength = min(volumeT.y - volumeT.x, t - volumeT.x);
        vec3 rayStart = r.origin + r.direction * volumeT.x;
        
        // Calculate volumetric scattering
        vec3 volumetricColor = singleScattering(rayStart, r.direction, rayLength, uSunDirection);
        accumulatedColor += mask * volumetricColor;
        
        // Apply extinction (absorption + out-scattering)
        float totalDensity = 0.0;
        int extinctionSamples = 16;
        float stepSize = rayLength / float(extinctionSamples);
        
        for (int i = 0; i < extinctionSamples; i++) {
          float sampleT = (float(i) + 0.5) * stepSize;
          vec3 samplePos = rayStart + r.direction * sampleT;
          totalDensity += getVolumeDensity(samplePos) * stepSize;
        }
        
        // Apply Beer's law for extinction
        float extinction = exp(-totalDensity * 0.2);
        mask *= extinction;
        
        // Continue ray from volume exit
        r.origin = rayStart + r.direction * rayLength;
        continue;
      }
      
      if (t == INFINITY) {
        // Hit sky
        accumulatedColor += mask * getSkyColor(r);
        break;
      }
      
      vec3 hitPoint = r.origin + r.direction * t;
      vec3 normal;
      vec3 materialColor;
      
      if (hitType == 1) {
        // Ground
        normal = vec3(0.0, 1.0, 0.0);
        materialColor = vec3(0.3, 0.6, 0.2); // Grass green
        
        // Simple lighting
        float sunDot = max(0.0, dot(normal, uSunDirection));
        materialColor *= (0.2 + 0.8 * sunDot);
        
        // Lambertian reflection
        r.direction = randomHemisphereDirection(normal, seed);
        mask *= materialColor * max(0.0, dot(normal, r.direction));
      }
      
      r.origin = hitPoint + normal * uEPS_intersect;
      
      // Russian roulette termination
      float probability = max(mask.r, max(mask.g, mask.b));
      if (bounces > 1) {
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

export const VolumetricRenderer = ({ 
  density = 0.5,
  scattering = 1.0,
  volumeColor = [1.0, 1.0, 1.0],
  enabled = true,
  qualityLevel = 1.0,
  onRenderUpdate
}) => {
  const groupRef = useRef();
  const animationState = useRef({
    sunDirection: new THREE.Vector3(0.6, 0.8, 0.2).normalize()
  });
  
  // Custom uniforms for volumetric rendering
  const customUniforms = useMemo(() => ({
    uSunDirection: { value: animationState.current.sunDirection },
    uDensity: { value: density },
    uScattering: { value: scattering },
    uVolumeColor: { value: new THREE.Vector3(...volumeColor) }
  }), [density, scattering, volumeColor]);
  
  // Update animation
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Slowly animate sun direction
    const angle = state.clock.elapsedTime * 0.05;
    animationState.current.sunDirection.set(
      0.6 + Math.cos(angle) * 0.3,
      0.8,
      0.2 + Math.sin(angle) * 0.3
    ).normalize();
    
    // Update uniforms
    if (customUniforms.uSunDirection) {
      customUniforms.uSunDirection.value.copy(animationState.current.sunDirection);
      customUniforms.uDensity.value = density;
      customUniforms.uScattering.value = scattering;
    }
    
    if (onRenderUpdate) {
      onRenderUpdate({
        sunDirection: animationState.current.sunDirection,
        density,
        scattering,
        frameTime: delta
      });
    }
  });
  
  if (!enabled) return null;
  
  return (
    <group ref={groupRef} name="volumetric-renderer">
      <PathTracingCore
        fragmentShader={volumetricRenderingFragmentShader}
        customUniforms={customUniforms}
        sceneIsDynamic={true}
        enabled={enabled}
        resolution={[Math.floor(1024 * qualityLevel), Math.floor(1024 * qualityLevel)]}
        pixelRatio={qualityLevel}
        apertureSize={0.0}
        focusDistance={400.0}
      />
      
      {/* Visual reference objects */}
      <group visible={false}>
        {/* Volume bounds */}
        <mesh position={[0, 175, 0]}>
          <boxGeometry args={[1000, 250, 1000]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.1} wireframe />
        </mesh>
        
        {/* Ground plane */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2000, 2000]} />
          <meshBasicMaterial color="#4a5d23" wireframe />
        </mesh>
      </group>
      
      {/* Three.js volumetric representation for fallback */}
      {qualityLevel < 0.5 && (
        <group>
          {/* Ground */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2000, 2000]} />
            <meshStandardMaterial color="#4a5d23" />
          </mesh>
          
          {/* Volumetric clouds approximation */}
          <mesh position={[0, 175, 0]}>
            <boxGeometry args={[800, 200, 800]} />
            <meshBasicMaterial
              color={new THREE.Color(...volumeColor)}
              transparent
              opacity={density * 0.3}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

VolumetricRenderer.propTypes = {
  density: PropTypes.number,
  scattering: PropTypes.number,
  volumeColor: PropTypes.arrayOf(PropTypes.number),
  enabled: PropTypes.bool,
  qualityLevel: PropTypes.number,
  onRenderUpdate: PropTypes.func
};

export default VolumetricRenderer; 
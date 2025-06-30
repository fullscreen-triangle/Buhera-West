import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { PathTracingCore } from './PathTracingCore';

/**
 * Planet Renderer Component with Path Tracing
 * Based on Planet_Rendering.js from THREE.js-PathTracing-Renderer
 */

const planetRenderingFragmentShader = `
  // Planet rendering specific uniforms
  uniform vec3 uPlanetPosition;
  uniform float uPlanetRadius;
  uniform vec3 uSunDirection;
  uniform float uAtmosphereHeight;
  uniform vec3 uPlanetColor;

  // Planet intersection with atmosphere
  vec2 PlanetIntersect(Ray r, vec3 center, float radius) {
    vec3 L = r.origin - center;
    float a = dot(r.direction, r.direction);
    float b = 2.0 * dot(r.direction, L);
    float c = dot(L, L) - radius * radius;
    float discriminant = b * b - 4.0 * a * c;
    
    if (discriminant < 0.0) return vec2(INFINITY);
    
    float sqrt_d = sqrt(discriminant);
    float t1 = (-b - sqrt_d) / (2.0 * a);
    float t2 = (-b + sqrt_d) / (2.0 * a);
    
    return vec2(t1, t2);
  }

  // Simple atmosphere scattering
  vec3 getAtmosphereColor(vec3 rayDir, vec3 sunDir, float altitude) {
    float sunDot = max(0.0, dot(rayDir, sunDir));
    
    // Rayleigh scattering (blue sky)
    vec3 rayleigh = vec3(0.3, 0.6, 1.0) * pow(sunDot, 2.0);
    
    // Mie scattering (sun halo)
    float mie = pow(sunDot, 50.0);
    vec3 mieColor = vec3(1.0, 0.8, 0.6) * mie;
    
    // Altitude-based density
    float density = exp(-altitude * 0.0001);
    
    return (rayleigh + mieColor) * density;
  }

  // Planet surface material
  vec3 getPlanetMaterial(vec3 hitPoint, vec3 normal) {
    // Simple procedural planet surface
    float noise1 = sin(hitPoint.x * 0.01) * sin(hitPoint.y * 0.013) * sin(hitPoint.z * 0.011);
    float noise2 = sin(hitPoint.x * 0.02) * sin(hitPoint.y * 0.017) * sin(hitPoint.z * 0.019);
    
    vec3 baseColor = uPlanetColor;
    baseColor += noise1 * 0.2;
    baseColor += noise2 * 0.1;
    
    return clamp(baseColor, 0.0, 1.0);
  }

  // Main path tracing function for planet scene
  vec3 CalculateRadiance(Ray r, inout float seed) {
    vec3 accumulatedColor = vec3(0.0);
    vec3 mask = vec3(1.0);
    
    for (int bounces = 0; bounces < 6; bounces++) {
      float t = INFINITY;
      int hitType = 0;
      
      // Test planet surface intersection
      vec2 planetT = PlanetIntersect(r, uPlanetPosition, uPlanetRadius);
      if (planetT.x > 0.0 && planetT.x < t) {
        t = planetT.x;
        hitType = 1; // Planet surface
      }
      
      // Test atmosphere intersection
      vec2 atmosphereT = PlanetIntersect(r, uPlanetPosition, uPlanetRadius + uAtmosphereHeight);
      if (atmosphereT.x > 0.0 && atmosphereT.x < t && planetT.x < 0.0) {
        t = atmosphereT.x;
        hitType = 2; // Atmosphere only
      }
      
      if (t == INFINITY) {
        // Hit space/stars
        vec3 spaceColor = vec3(0.02, 0.02, 0.05);
        
        // Simple star field
        float starNoise = sin(r.direction.x * 1000.0) * sin(r.direction.y * 1000.0) * sin(r.direction.z * 1000.0);
        if (starNoise > 0.999) {
          spaceColor += vec3(1.0);
        }
        
        accumulatedColor += mask * spaceColor;
        break;
      }
      
      vec3 hitPoint = r.origin + r.direction * t;
      vec3 normal;
      vec3 materialColor;
      
      if (hitType == 1) {
        // Planet surface
        normal = normalize(hitPoint - uPlanetPosition);
        materialColor = getPlanetMaterial(hitPoint, normal);
        
        // Simple lighting from sun
        float sunDot = max(0.0, dot(normal, uSunDirection));
        materialColor *= (0.1 + 0.9 * sunDot);
        
        // Lambertian reflection
        r.direction = randomHemisphereDirection(normal, seed);
        mask *= materialColor * max(0.0, dot(normal, r.direction));
        
      } else if (hitType == 2) {
        // Atmosphere
        float distanceToCenter = length(hitPoint - uPlanetPosition);
        float altitude = distanceToCenter - uPlanetRadius;
        
        vec3 atmosphereColor = getAtmosphereColor(r.direction, uSunDirection, altitude);
        accumulatedColor += mask * atmosphereColor * 0.1;
        
        // Continue ray through atmosphere with slight scattering
        vec3 scatterDir = r.direction + randomSphereDirection(seed) * 0.1;
        r.direction = normalize(scatterDir);
        mask *= 0.95; // Slight absorption
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
    
    gl_FragColor = vec4(linearToSRGB(OptimizedCineonToneMapping(pixelColor)), 1.0);
  }
`;

export const PlanetRenderer = ({ 
  planetPosition = [0, 0, -500],
  planetRadius = 200,
  planetColor = [0.6, 0.4, 0.2],
  atmosphereHeight = 50,
  enabled = true,
  qualityLevel = 1.0,
  onRenderUpdate
}) => {
  const groupRef = useRef();
  const animationState = useRef({
    sunDirection: new THREE.Vector3(1, 0.5, 0.2).normalize()
  });
  
  // Custom uniforms for planet rendering
  const customUniforms = useMemo(() => ({
    uPlanetPosition: { value: new THREE.Vector3(...planetPosition) },
    uPlanetRadius: { value: planetRadius },
    uPlanetColor: { value: new THREE.Vector3(...planetColor) },
    uAtmosphereHeight: { value: atmosphereHeight },
    uSunDirection: { value: animationState.current.sunDirection }
  }), [planetPosition, planetRadius, planetColor, atmosphereHeight]);
  
  // Update animation
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Slowly rotate sun direction
    const angle = state.clock.elapsedTime * 0.1;
    animationState.current.sunDirection.set(
      Math.cos(angle),
      0.5,
      Math.sin(angle)
    ).normalize();
    
    // Update uniforms
    if (customUniforms.uSunDirection) {
      customUniforms.uSunDirection.value.copy(animationState.current.sunDirection);
    }
    
    if (onRenderUpdate) {
      onRenderUpdate({
        sunDirection: animationState.current.sunDirection,
        frameTime: delta
      });
    }
  });
  
  if (!enabled) return null;
  
  return (
    <group ref={groupRef} name="planet-renderer">
      <PathTracingCore
        fragmentShader={planetRenderingFragmentShader}
        customUniforms={customUniforms}
        sceneIsDynamic={true}
        enabled={enabled}
        resolution={[Math.floor(1024 * qualityLevel), Math.floor(1024 * qualityLevel)]}
        pixelRatio={qualityLevel}
        apertureSize={0.0}
        focusDistance={800.0}
      />
      
      {/* Visual reference objects */}
      <group visible={false}>
        {/* Planet sphere */}
        <mesh position={planetPosition}>
          <sphereGeometry args={[planetRadius, 64, 64]} />
          <meshBasicMaterial color={new THREE.Color(...planetColor)} wireframe />
        </mesh>
        
        {/* Atmosphere sphere */}
        <mesh position={planetPosition}>
          <sphereGeometry args={[planetRadius + atmosphereHeight, 32, 32]} />
          <meshBasicMaterial color="#87CEEB" transparent opacity={0.1} wireframe />
        </mesh>
      </group>
      
      {/* Three.js planet representation for fallback */}
      {qualityLevel < 0.5 && (
        <group>
          <mesh position={planetPosition}>
            <sphereGeometry args={[planetRadius, 64, 64]} />
            <meshStandardMaterial
              color={new THREE.Color(...planetColor)}
              roughness={0.8}
              metalness={0.0}
            />
          </mesh>
          
          <mesh position={planetPosition}>
            <sphereGeometry args={[planetRadius + atmosphereHeight, 32, 32]} />
            <meshBasicMaterial
              color="#87CEEB"
              transparent
              opacity={0.2}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

PlanetRenderer.propTypes = {
  planetPosition: PropTypes.arrayOf(PropTypes.number),
  planetRadius: PropTypes.number,
  planetColor: PropTypes.arrayOf(PropTypes.number),
  atmosphereHeight: PropTypes.number,
  enabled: PropTypes.bool,
  qualityLevel: PropTypes.number,
  onRenderUpdate: PropTypes.func
};

export default PlanetRenderer; 
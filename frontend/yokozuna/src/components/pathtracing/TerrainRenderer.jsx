import React, { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { PathTracingCore } from './PathTracingCore';

/**
 * Terrain Renderer Component with Path Tracing
 * Based on Terrain_Rendering.js from THREE.js-PathTracing-Renderer
 */

// Terrain rendering fragment shader (adapted from original)
const terrainRenderingFragmentShader = `
  // Terrain rendering specific uniforms
  uniform vec3 uSunDirection;
  uniform float uWaterLevel;
  uniform float uCameraUnderWater;
  uniform sampler2D t_PerlinNoise;

  // Terrain height function using multiple octaves of Perlin noise
  float getTerrainHeight(vec2 pos) {
    vec2 uv = pos * 0.0002; // Scale factor for terrain
    float height = 0.0;
    
    // Multiple octaves for realistic terrain
    height += texture2D(t_PerlinNoise, uv * 0.5).r * 800.0;
    height += texture2D(t_PerlinNoise, uv * 1.0).r * 400.0;
    height += texture2D(t_PerlinNoise, uv * 2.0).r * 200.0;
    height += texture2D(t_PerlinNoise, uv * 4.0).r * 100.0;
    height += texture2D(t_PerlinNoise, uv * 8.0).r * 50.0;
    height += texture2D(t_PerlinNoise, uv * 16.0).r * 25.0;
    
    return height * 0.5; // Overall scale
  }

  // Terrain normal calculation using finite differences
  vec3 getTerrainNormal(vec2 pos) {
    float eps = 2.0;
    float heightL = getTerrainHeight(pos - vec2(eps, 0.0));
    float heightR = getTerrainHeight(pos + vec2(eps, 0.0));
    float heightD = getTerrainHeight(pos - vec2(0.0, eps));
    float heightU = getTerrainHeight(pos + vec2(0.0, eps));
    
    vec3 normal = normalize(vec3(heightL - heightR, 2.0 * eps, heightD - heightU));
    return normal;
  }

  // Terrain intersection using ray marching
  float TerrainIntersect(Ray r) {
    float t = 0.0;
    vec3 pos = r.origin;
    
    // Ray marching to find terrain surface
    for (int i = 0; i < 200; i++) {
      pos = r.origin + r.direction * t;
      float terrainHeight = getTerrainHeight(pos.xz);
      float diff = pos.y - terrainHeight;
      
      if (diff < 1.0) {
        // Refine intersection
        for (int j = 0; j < 5; j++) {
          float newT = t - diff * 0.5;
          vec3 newPos = r.origin + r.direction * newT;
          float newHeight = getTerrainHeight(newPos.xz);
          float newDiff = newPos.y - newHeight;
          
          if (abs(newDiff) < abs(diff)) {
            t = newT;
            diff = newDiff;
          }
        }
        return t;
      }
      
      t += max(1.0, diff * 0.5);
      if (t > 20000.0) break;
    }
    
    return INFINITY;
  }

  // Water surface intersection
  float WaterIntersect(Ray r) {
    if (abs(r.direction.y) < 0.001) return INFINITY;
    float t = (uWaterLevel - r.origin.y) / r.direction.y;
    return (t > 0.0) ? t : INFINITY;
  }

  // Get terrain material based on height and slope
  vec3 getTerrainMaterial(vec3 pos, vec3 normal, float height) {
    vec3 materialColor = vec3(0.5);
    
    // Height-based coloring
    if (height < uWaterLevel + 10.0) {
      // Shore/beach - sandy color
      materialColor = vec3(0.8, 0.7, 0.5);
    } else if (height < uWaterLevel + 100.0) {
      // Grass/vegetation
      float grassiness = texture2D(t_PerlinNoise, pos.xz * 0.01).r;
      materialColor = mix(vec3(0.3, 0.5, 0.2), vec3(0.2, 0.4, 0.1), grassiness);
    } else if (height < uWaterLevel + 300.0) {
      // Forest/dark vegetation
      materialColor = vec3(0.15, 0.3, 0.1);
    } else if (height < uWaterLevel + 600.0) {
      // Rock/mountain
      float rockiness = texture2D(t_PerlinNoise, pos.xz * 0.005).r;
      materialColor = mix(vec3(0.4, 0.35, 0.3), vec3(0.5, 0.45, 0.4), rockiness);
    } else {
      // Snow-capped peaks
      materialColor = vec3(0.9, 0.9, 0.95);
    }
    
    // Slope-based modification
    float slope = 1.0 - normal.y;
    if (slope > 0.3) {
      // Steep slopes show more rock
      materialColor = mix(materialColor, vec3(0.4, 0.35, 0.3), slope * 2.0 - 0.6);
    }
    
    return materialColor;
  }

  // Atmospheric scattering approximation
  vec3 getSkyColor(Ray r, float sunDot) {
    float elevation = r.direction.y;
    
    // Base sky gradient
    vec3 horizonColor = vec3(1.0, 0.95, 0.8);
    vec3 zenithColor = vec3(0.3, 0.5, 1.0);
    vec3 skyColor = mix(horizonColor, zenithColor, smoothstep(-0.1, 0.3, elevation));
    
    // Sun disk and corona
    if (sunDot > 0.9998) {
      skyColor = vec3(5.0, 4.5, 3.5); // Bright sun
    } else if (sunDot > 0.998) {
      float sunFactor = (sunDot - 0.998) / 0.0018;
      skyColor = mix(skyColor, vec3(3.0, 2.5, 2.0), sunFactor);
    }
    
    // Sun glow
    float sunGlow = pow(max(0.0, sunDot), 100.0);
    skyColor += vec3(1.0, 0.8, 0.5) * sunGlow * 0.5;
    
    // Atmospheric perspective
    float distance = 1.0 / (elevation + 0.1);
    skyColor = mix(skyColor, horizonColor, smoothstep(0.0, 10.0, distance));
    
    return skyColor;
  }

  // Calculate fog/atmospheric attenuation
  vec3 applyAtmosphere(vec3 color, float distance, vec3 rayDir) {
    float fogDensity = 0.00005;
    float fogAmount = 1.0 - exp(-distance * fogDensity);
    
    // Fog color based on sun direction
    float sunDot = max(0.0, dot(rayDir, uSunDirection));
    vec3 fogColor = mix(vec3(0.7, 0.8, 0.9), vec3(1.0, 0.9, 0.7), sunDot * 0.5);
    
    return mix(color, fogColor, fogAmount);
  }

  // Main path tracing function for terrain scene
  vec3 CalculateRadiance(Ray r, inout float seed) {
    vec3 accumulatedColor = vec3(0.0);
    vec3 mask = vec3(1.0);
    bool inWater = false;
    
    for (int bounces = 0; bounces < 8; bounces++) {
      float t = INFINITY;
      int hitType = 0;
      
      // Test terrain intersection
      float terrainT = TerrainIntersect(r);
      if (terrainT < t) {
        t = terrainT;
        hitType = 1; // Terrain
      }
      
      // Test water intersection if above water
      if (!inWater) {
        float waterT = WaterIntersect(r);
        if (waterT < t) {
          t = waterT;
          hitType = 2; // Water surface
        }
      }
      
      if (t == INFINITY) {
        // Hit sky
        float sunDot = max(0.0, dot(r.direction, uSunDirection));
        vec3 skyColor = getSkyColor(r, sunDot);
        
        // Reduce sky brightness if underwater
        if (inWater) {
          skyColor *= 0.1;
        }
        
        accumulatedColor += mask * skyColor;
        break;
      }
      
      vec3 hitPoint = r.origin + r.direction * t;
      vec3 normal;
      vec3 materialColor;
      
      if (hitType == 1) {
        // Terrain surface
        normal = getTerrainNormal(hitPoint.xz);
        float height = getTerrainHeight(hitPoint.xz);
        materialColor = getTerrainMaterial(hitPoint, normal, height);
        
        // Check if terrain is underwater
        if (height < uWaterLevel) {
          // Underwater terrain - darker and blue-tinted
          materialColor *= 0.3;
          materialColor = mix(materialColor, vec3(0.0, 0.2, 0.4), 0.5);
        } else {
          // Apply simple lighting from sun
          float sunDot = max(0.0, dot(normal, uSunDirection));
          materialColor *= (0.3 + 0.7 * sunDot);
          
          // Add some ambient occlusion based on slope
          float ao = 1.0 - pow(max(0.0, 1.0 - normal.y), 2.0);
          materialColor *= (0.5 + 0.5 * ao);
        }
        
        // Lambertian reflection
        r.direction = randomHemisphereDirection(normal, seed);
        mask *= materialColor * max(0.0, dot(normal, r.direction));
        
      } else if (hitType == 2) {
        // Water surface
        normal = vec3(0.0, 1.0, 0.0);
        
        // Simple water waves
        float wave1 = sin(hitPoint.x * 0.02 + uTime * 2.0) * 0.1;
        float wave2 = sin(hitPoint.z * 0.015 + uTime * 1.5) * 0.1;
        normal = normalize(normal + vec3(wave1, 0.0, wave2));
        
        // Fresnel effect
        float fresnel = pow(1.0 - max(0.0, dot(-r.direction, normal)), 3.0);
        fresnel = mix(0.02, 0.98, fresnel);
        
        if (hash(seed += 1.0) < fresnel) {
          // Reflection
          r.direction = reflect(r.direction, normal);
        } else {
          // Refraction into water
          r.direction = refract(r.direction, normal, 0.75);
          if (length(r.direction) == 0.0) {
            r.direction = reflect(r.direction, normal);
          } else {
            inWater = true;
            mask *= vec3(0.7, 0.9, 1.0); // Water tint
          }
        }
      }
      
      r.origin = hitPoint + normal * uEPS_intersect;
      
      // Apply atmospheric effects
      if (bounces == 0 && !inWater) {
        accumulatedColor = applyAtmosphere(accumulatedColor, t, r.direction);
      }
      
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
    
    // Underwater effects
    if (uCameraUnderWater > 0.5) {
      pixelColor *= vec3(0.4, 0.7, 1.0);
      pixelColor = mix(pixelColor, vec3(0.0, 0.15, 0.3), 0.2);
    }
    
    gl_FragColor = vec4(linearToSRGB(OptimizedCineonToneMapping(pixelColor)), 1.0);
  }
`;

export const TerrainRenderer = ({ 
  waterLevel = 400.0,
  enabled = true,
  qualityLevel = 1.0,
  terrainScale = 1.0,
  onRenderUpdate
}) => {
  const groupRef = useRef();
  const animationState = useRef({
    sunAngle: 0,
    sunDirection: new THREE.Vector3()
  });
  
  // Load Perlin noise texture for terrain generation
  const perlinTexture = useLoader(THREE.TextureLoader, '/textures/perlin256.png');
  
  // Configure texture
  React.useEffect(() => {
    if (perlinTexture) {
      perlinTexture.wrapS = THREE.RepeatWrapping;
      perlinTexture.wrapT = THREE.RepeatWrapping;
      perlinTexture.flipY = false;
      perlinTexture.minFilter = THREE.LinearFilter;
      perlinTexture.magFilter = THREE.LinearFilter;
      perlinTexture.generateMipmaps = false;
    }
  }, [perlinTexture]);
  
  // Custom uniforms for terrain rendering
  const customUniforms = useMemo(() => ({
    t_PerlinNoise: { value: perlinTexture },
    uSunDirection: { value: new THREE.Vector3() },
    uWaterLevel: { value: waterLevel },
    uCameraUnderWater: { value: 0.0 }
  }), [perlinTexture, waterLevel]);
  
  // Update animation and uniforms
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Animate sun position
    animationState.current.sunAngle = (state.clock.elapsedTime * 0.035) % (Math.PI + 0.2) - 0.11;
    animationState.current.sunDirection.set(
      Math.cos(animationState.current.sunAngle),
      Math.sin(animationState.current.sunAngle),
      -Math.cos(animationState.current.sunAngle) * 2.0
    );
    animationState.current.sunDirection.normalize();
    
    // Update uniforms
    if (customUniforms.uSunDirection) {
      customUniforms.uSunDirection.value.copy(animationState.current.sunDirection);
      customUniforms.uWaterLevel.value = waterLevel;
      
      // Check if camera is underwater (this would be updated by camera position)
      // For now, we'll set it based on a simple check
      customUniforms.uCameraUnderWater.value = 0.0; // Update with actual camera position
    }
    
    if (onRenderUpdate) {
      onRenderUpdate({
        sunAngle: animationState.current.sunAngle,
        sunDirection: animationState.current.sunDirection,
        waterLevel,
        frameTime: delta
      });
    }
  });
  
  if (!enabled) return null;
  
  return (
    <group ref={groupRef} name="terrain-renderer">
      <PathTracingCore
        fragmentShader={terrainRenderingFragmentShader}
        customUniforms={customUniforms}
        sceneIsDynamic={true}
        enabled={enabled}
        resolution={[Math.floor(1024 * qualityLevel * 0.8), Math.floor(1024 * qualityLevel * 0.8)]}
        pixelRatio={qualityLevel * 0.8}
        apertureSize={0.0}
        focusDistance={3000.0}
      />
      
      {/* Visual reference terrain (invisible in path tracing but helps with scene setup) */}
      <group visible={false}>
        {/* Terrain plane for reference */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20000, 20000, 256, 256]} />
          <meshBasicMaterial color="#4a5d23" wireframe />
        </mesh>
        
        {/* Water level indicator */}
        <mesh position={[0, waterLevel, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10000, 10000]} />
          <meshBasicMaterial color="#0088cc" transparent opacity={0.3} />
        </mesh>
      </group>
      
      {/* Three.js terrain representation for fallback */}
      {qualityLevel < 0.4 && (
        <>
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8000, 8000, 128, 128]} />
            <meshStandardMaterial
              color="#4a5d23"
              roughness={0.9}
              metalness={0.0}
            />
          </mesh>
          
          <mesh position={[0, waterLevel, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8000, 8000]} />
            <meshStandardMaterial
              color="#0088cc"
              metalness={0.1}
              roughness={0.1}
              transparent
              opacity={0.7}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

TerrainRenderer.propTypes = {
  waterLevel: PropTypes.number,
  enabled: PropTypes.bool,
  qualityLevel: PropTypes.number,
  terrainScale: PropTypes.number,
  onRenderUpdate: PropTypes.func
};

export default TerrainRenderer; 
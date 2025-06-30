import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { PathTracingCore } from './PathTracingCore';

/**
 * Fractal Renderer Component with Path Tracing
 * Based on Fractal3D.js from THREE.js-PathTracing-Renderer
 */

const fractalRenderingFragmentShader = `
  // Fractal rendering specific uniforms
  uniform float uFractalScale;
  uniform int uFractalIterations;
  uniform vec3 uFractalOffset;
  uniform float uFractalPower;
  uniform vec3 uFractalColor1;
  uniform vec3 uFractalColor2;

  // Mandelbulb distance estimation
  float mandelbulbDE(vec3 pos) {
    vec3 z = pos * uFractalScale + uFractalOffset;
    float dr = 1.0;
    float r = 0.0;
    float power = uFractalPower;
    
    for (int i = 0; i < 8; i++) {
      r = length(z);
      if (r > 2.0) break;
      
      // Convert to polar coordinates
      float theta = acos(z.z / r);
      float phi = atan(z.y, z.x);
      dr = pow(r, power - 1.0) * power * dr + 1.0;
      
      // Scale and rotate the point
      float zr = pow(r, power);
      theta = theta * power;
      phi = phi * power;
      
      // Convert back to cartesian coordinates
      z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
      z += pos * uFractalScale + uFractalOffset;
    }
    
    return 0.5 * log(r) * r / dr / uFractalScale;
  }

  // Julia set distance estimation
  float juliaDE(vec3 pos) {
    vec4 z = vec4(pos * uFractalScale + uFractalOffset, 0.0);
    vec4 c = vec4(0.3, 0.5, 0.4, 0.2); // Julia set constant
    float dr = 1.0;
    
    for (int i = 0; i < 16; i++) {
      if (dot(z, z) > 4.0) break;
      
      // Quaternion multiplication and derivative
      float x = z.x; float y = z.y; float z_z = z.z; float w = z.w;
      dr = 2.0 * sqrt(dot(z, z)) * dr + 1.0;
      
      z = vec4(
        x*x - y*y - z_z*z_z - w*w,
        2.0*(x*y - z_z*w),
        2.0*(x*z_z - y*w),
        2.0*(x*w + y*z_z)
      ) + c;
    }
    
    return 0.25 * log(dot(z, z)) * sqrt(dot(z, z)) / dr / uFractalScale;
  }

  // Menger sponge distance estimation
  float mengerDE(vec3 pos) {
    vec3 z = pos * uFractalScale;
    float d = -10000.0;
    float s = 1.0;
    
    for (int i = 0; i < 6; i++) {
      vec3 a = mod(z * s, 2.0) - 1.0;
      s *= 3.0;
      vec3 r = abs(1.0 - 3.0 * abs(a));
      
      float da = max(r.x, r.y);
      float db = max(r.y, r.z);
      float dc = max(r.z, r.x);
      float c = (min(da, min(db, dc)) - 1.0) / s;
      
      d = max(d, c);
    }
    
    return d / uFractalScale;
  }

  // Main fractal distance estimation
  float fractalDE(vec3 pos) {
    // Switch between different fractals based on uniform or time
    float selector = mod(uTime * 0.1, 3.0);
    
    if (selector < 1.0) {
      return mandelbulbDE(pos);
    } else if (selector < 2.0) {
      return juliaDE(pos);
    } else {
      return mengerDE(pos);
    }
  }

  // Fractal normal estimation
  vec3 getFractalNormal(vec3 pos) {
    float eps = 0.001;
    vec3 normal = vec3(
      fractalDE(pos + vec3(eps, 0.0, 0.0)) - fractalDE(pos - vec3(eps, 0.0, 0.0)),
      fractalDE(pos + vec3(0.0, eps, 0.0)) - fractalDE(pos - vec3(0.0, eps, 0.0)),
      fractalDE(pos + vec3(0.0, 0.0, eps)) - fractalDE(pos - vec3(0.0, 0.0, eps))
    );
    return normalize(normal);
  }

  // Fractal intersection using ray marching
  float FractalIntersect(Ray r) {
    float t = 0.0;
    float minDist = 0.001;
    float maxDist = 100.0;
    
    for (int i = 0; i < 200; i++) {
      vec3 pos = r.origin + r.direction * t;
      float dist = fractalDE(pos);
      
      if (dist < minDist) {
        return t;
      }
      
      if (t > maxDist) {
        break;
      }
      
      t += dist * 0.8; // Conservative step size
    }
    
    return INFINITY;
  }

  // Fractal material based on position and iteration count
  vec3 getFractalMaterial(vec3 pos, vec3 normal) {
    // Color based on distance to fractal surface
    float dist = fractalDE(pos);
    float colorFactor = exp(-abs(dist) * 10.0);
    
    // Ambient occlusion approximation
    float ao = 1.0;
    float aoStep = 0.1;
    for (int i = 1; i <= 5; i++) {
      float sampleDist = fractalDE(pos + normal * aoStep * float(i));
      ao -= (aoStep * float(i) - sampleDist) * 0.2 / float(i);
    }
    ao = clamp(ao, 0.0, 1.0);
    
    // Mix colors based on surface properties
    vec3 baseColor = mix(uFractalColor1, uFractalColor2, colorFactor);
    
    // Add some iridescence
    float fresnel = pow(1.0 - max(0.0, dot(normal, -r.direction)), 3.0);
    vec3 iridescence = vec3(
      sin(pos.x * 10.0 + uTime) * 0.5 + 0.5,
      sin(pos.y * 10.0 + uTime * 1.1) * 0.5 + 0.5,
      sin(pos.z * 10.0 + uTime * 1.2) * 0.5 + 0.5
    );
    
    baseColor = mix(baseColor, iridescence, fresnel * 0.3);
    
    return baseColor * ao;
  }

  // Sky color for fractal scene
  vec3 getSkyColor(Ray r) {
    vec3 skyColor = vec3(0.1, 0.1, 0.2);
    
    // Add some cosmic background
    float stars = sin(r.direction.x * 100.0) * sin(r.direction.y * 100.0) * sin(r.direction.z * 100.0);
    if (stars > 0.998) {
      skyColor += vec3(1.0, 0.8, 0.6) * (stars - 0.998) * 500.0;
    }
    
    // Nebula-like colors
    float nebula = sin(r.direction.x * 5.0 + uTime * 0.1) * sin(r.direction.y * 7.0 + uTime * 0.15);
    skyColor += vec3(0.5, 0.2, 0.8) * max(0.0, nebula) * 0.3;
    
    return skyColor;
  }

  // Main path tracing function for fractal scene
  vec3 CalculateRadiance(Ray r, inout float seed) {
    vec3 accumulatedColor = vec3(0.0);
    vec3 mask = vec3(1.0);
    
    for (int bounces = 0; bounces < 6; bounces++) {
      float t = FractalIntersect(r);
      
      if (t == INFINITY) {
        // Hit sky
        accumulatedColor += mask * getSkyColor(r);
        break;
      }
      
      vec3 hitPoint = r.origin + r.direction * t;
      vec3 normal = getFractalNormal(hitPoint);
      vec3 materialColor = getFractalMaterial(hitPoint, normal);
      
      // Simple lighting model
      vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
      float ndotl = max(0.0, dot(normal, lightDir));
      materialColor *= (0.2 + 0.8 * ndotl);
      
      // Reflection/refraction decision
      float fresnel = pow(1.0 - max(0.0, dot(-r.direction, normal)), 2.0);
      
      if (hash(seed += 1.0) < fresnel * 0.8) {
        // Reflection
        r.direction = reflect(r.direction, normal);
        mask *= materialColor * 0.8;
      } else {
        // Diffuse scattering
        r.direction = randomHemisphereDirection(normal, seed);
        mask *= materialColor * max(0.0, dot(normal, r.direction));
      }
      
      r.origin = hitPoint + normal * 0.001;
      
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

export const FractalRenderer = ({ 
  fractalScale = 1.0,
  fractalIterations = 8,
  fractalOffset = [0, 0, 0],
  fractalPower = 8.0,
  fractalColor1 = [1.0, 0.5, 0.2],
  fractalColor2 = [0.2, 0.5, 1.0],
  enabled = true,
  qualityLevel = 1.0,
  onRenderUpdate
}) => {
  const groupRef = useRef();
  const animationState = useRef({
    time: 0
  });
  
  // Custom uniforms for fractal rendering
  const customUniforms = useMemo(() => ({
    uFractalScale: { value: fractalScale },
    uFractalIterations: { value: fractalIterations },
    uFractalOffset: { value: new THREE.Vector3(...fractalOffset) },
    uFractalPower: { value: fractalPower },
    uFractalColor1: { value: new THREE.Vector3(...fractalColor1) },
    uFractalColor2: { value: new THREE.Vector3(...fractalColor2) }
  }), [fractalScale, fractalIterations, fractalOffset, fractalPower, fractalColor1, fractalColor2]);
  
  // Update animation
  useFrame((state, delta) => {
    if (!enabled) return;
    
    animationState.current.time = state.clock.elapsedTime;
    
    // Animate fractal parameters
    const slowTime = state.clock.elapsedTime * 0.1;
    customUniforms.uFractalOffset.value.set(
      Math.sin(slowTime) * 0.1,
      Math.cos(slowTime * 1.1) * 0.1,
      Math.sin(slowTime * 0.9) * 0.1
    );
    
    if (onRenderUpdate) {
      onRenderUpdate({
        time: animationState.current.time,
        fractalOffset: customUniforms.uFractalOffset.value,
        frameTime: delta
      });
    }
  });
  
  if (!enabled) return null;
  
  return (
    <group ref={groupRef} name="fractal-renderer">
      <PathTracingCore
        fragmentShader={fractalRenderingFragmentShader}
        customUniforms={customUniforms}
        sceneIsDynamic={true}
        enabled={enabled}
        resolution={[Math.floor(1024 * qualityLevel), Math.floor(1024 * qualityLevel)]}
        pixelRatio={qualityLevel}
        apertureSize={0.0}
        focusDistance={5.0}
      />
      
      {/* Visual reference objects (invisible in path tracing) */}
      <group visible={false}>
        {/* Bounding box for fractal */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 4, 4]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      </group>
      
      {/* Three.js fractal approximation for fallback */}
      {qualityLevel < 0.3 && (
        <group>
          {/* Simple approximation using icosahedron */}
          <mesh position={[0, 0, 0]}>
            <icosahedronGeometry args={[2, 3]} />
            <meshStandardMaterial
              color={new THREE.Color(...fractalColor1)}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

FractalRenderer.propTypes = {
  fractalScale: PropTypes.number,
  fractalIterations: PropTypes.number,
  fractalOffset: PropTypes.arrayOf(PropTypes.number),
  fractalPower: PropTypes.number,
  fractalColor1: PropTypes.arrayOf(PropTypes.number),
  fractalColor2: PropTypes.arrayOf(PropTypes.number),
  enabled: PropTypes.bool,
  qualityLevel: PropTypes.number,
  onRenderUpdate: PropTypes.func
};

export default FractalRenderer; 
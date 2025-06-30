import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { PathTracingCore } from './PathTracingCore';

/**
 * Cornell Box Renderer Component with Path Tracing
 * Based on Cornell_Box.js from THREE.js-PathTracing-Renderer
 * Classic test scene for path tracing algorithms
 */

const cornellBoxFragmentShader = `
  // Cornell box specific uniforms
  uniform vec3 uRedWallColor;
  uniform vec3 uGreenWallColor;
  uniform vec3 uWhiteWallColor;
  uniform vec3 uLightColor;
  uniform float uLightIntensity;
  uniform mat4 uTallBoxMatrix;
  uniform mat4 uShortBoxMatrix;

  // Cornell box dimensions and structure
  struct CornellBox {
    // Room bounds
    vec3 roomMin;
    vec3 roomMax;
    
    // Light quad
    vec3 lightPos;
    vec2 lightSize;
    
    // Box transforms
    mat4 tallBoxMatrix;
    mat4 shortBoxMatrix;
  };

  // Initialize Cornell box
  CornellBox getCornellBox() {
    CornellBox box;
    box.roomMin = vec3(-278.0, 0.0, -279.5);
    box.roomMax = vec3(278.0, 548.8, 279.5);
    box.lightPos = vec3(0.0, 548.7, 0.0);
    box.lightSize = vec2(130.0, 105.0);
    box.tallBoxMatrix = uTallBoxMatrix;
    box.shortBoxMatrix = uShortBoxMatrix;
    return box;
  }

  // Ray-box intersection with matrix transform
  float rayBoxIntersect(Ray r, mat4 boxMatrix) {
    // Transform ray to box space
    mat4 invMatrix = inverse(boxMatrix);
    vec3 ro = (invMatrix * vec4(r.origin, 1.0)).xyz;
    vec3 rd = (invMatrix * vec4(r.direction, 0.0)).xyz;
    
    // Box bounds in local space
    vec3 boxMin = vec3(-1.0);
    vec3 boxMax = vec3(1.0);
    
    vec3 invDir = 1.0 / rd;
    vec3 near = (boxMin - ro) * invDir;
    vec3 far = (boxMax - ro) * invDir;
    vec3 tmin = min(near, far);
    vec3 tmax = max(near, far);
    
    float t0 = max(max(tmin.x, tmin.y), tmin.z);
    float t1 = min(min(tmax.x, tmax.y), tmax.z);
    
    return (t0 < t1 && t1 > 0.0) ? ((t0 > 0.0) ? t0 : t1) : INFINITY;
  }

  // Get box normal in world space
  vec3 getBoxNormal(vec3 hitPoint, mat4 boxMatrix) {
    mat4 invMatrix = inverse(boxMatrix);
    vec3 localHit = (invMatrix * vec4(hitPoint, 1.0)).xyz;
    
    vec3 normal = vec3(0.0);
    vec3 absLocal = abs(localHit);
    
    if (absLocal.x > absLocal.y && absLocal.x > absLocal.z) {
      normal = vec3(sign(localHit.x), 0.0, 0.0);
    } else if (absLocal.y > absLocal.z) {
      normal = vec3(0.0, sign(localHit.y), 0.0);
    } else {
      normal = vec3(0.0, 0.0, sign(localHit.z));
    }
    
    // Transform normal to world space
    mat4 normalMatrix = transpose(invMatrix);
    return normalize((normalMatrix * vec4(normal, 0.0)).xyz);
  }

  // Ray-plane intersection
  float rayPlaneIntersect(Ray r, vec3 planePoint, vec3 planeNormal) {
    float denom = dot(planeNormal, r.direction);
    if (abs(denom) < 0.0001) return INFINITY;
    
    float t = dot(planePoint - r.origin, planeNormal) / denom;
    return (t > 0.0) ? t : INFINITY;
  }

  // Ray-rectangle intersection (for area light)
  float rayRectIntersect(Ray r, vec3 center, vec3 normal, vec2 size) {
    float t = rayPlaneIntersect(r, center, normal);
    if (t == INFINITY) return INFINITY;
    
    vec3 hitPoint = r.origin + r.direction * t;
    vec3 localHit = hitPoint - center;
    
    // Create local coordinate system
    vec3 tangent = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
    if (length(tangent) < 0.5) {
      tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
    }
    vec3 bitangent = cross(normal, tangent);
    
    float u = dot(localHit, tangent);
    float v = dot(localHit, bitangent);
    
    if (abs(u) <= size.x && abs(v) <= size.y) {
      return t;
    }
    
    return INFINITY;
  }

  // Sample area light
  vec3 sampleAreaLight(vec3 center, vec2 size, vec3 normal, inout float seed) {
    vec3 tangent = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
    if (length(tangent) < 0.5) {
      tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
    }
    vec3 bitangent = cross(normal, tangent);
    
    float u = (hash(seed += 1.0) - 0.5) * size.x;
    float v = (hash(seed += 1.0) - 0.5) * size.y;
    
    return center + u * tangent + v * bitangent;
  }

  // Cornell box intersection test
  vec4 cornellBoxIntersect(Ray r) {
    CornellBox box = getCornellBox();
    float minT = INFINITY;
    int hitType = 0; // 0=none, 1=floor, 2=ceiling, 3=back, 4=right(red), 5=left(green), 6=light, 7=tallbox, 8=shortbox
    
    // Floor (white)
    float floorT = rayPlaneIntersect(r, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    if (floorT < minT && floorT > 0.0) {
      vec3 hit = r.origin + r.direction * floorT;
      if (hit.x >= box.roomMin.x && hit.x <= box.roomMax.x && 
          hit.z >= box.roomMin.z && hit.z <= box.roomMax.z) {
        minT = floorT;
        hitType = 1;
      }
    }
    
    // Ceiling (white)
    float ceilingT = rayPlaneIntersect(r, vec3(0.0, 548.8, 0.0), vec3(0.0, -1.0, 0.0));
    if (ceilingT < minT && ceilingT > 0.0) {
      vec3 hit = r.origin + r.direction * ceilingT;
      if (hit.x >= box.roomMin.x && hit.x <= box.roomMax.x && 
          hit.z >= box.roomMin.z && hit.z <= box.roomMax.z) {
        minT = ceilingT;
        hitType = 2;
      }
    }
    
    // Back wall (white)
    float backT = rayPlaneIntersect(r, vec3(0.0, 0.0, -279.5), vec3(0.0, 0.0, 1.0));
    if (backT < minT && backT > 0.0) {
      vec3 hit = r.origin + r.direction * backT;
      if (hit.x >= box.roomMin.x && hit.x <= box.roomMax.x && 
          hit.y >= box.roomMin.y && hit.y <= box.roomMax.y) {
        minT = backT;
        hitType = 3;
      }
    }
    
    // Right wall (red)
    float rightT = rayPlaneIntersect(r, vec3(278.0, 0.0, 0.0), vec3(-1.0, 0.0, 0.0));
    if (rightT < minT && rightT > 0.0) {
      vec3 hit = r.origin + r.direction * rightT;
      if (hit.y >= box.roomMin.y && hit.y <= box.roomMax.y && 
          hit.z >= box.roomMin.z && hit.z <= box.roomMax.z) {
        minT = rightT;
        hitType = 4;
      }
    }
    
    // Left wall (green)
    float leftT = rayPlaneIntersect(r, vec3(-278.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0));
    if (leftT < minT && leftT > 0.0) {
      vec3 hit = r.origin + r.direction * leftT;
      if (hit.y >= box.roomMin.y && hit.y <= box.roomMax.y && 
          hit.z >= box.roomMin.z && hit.z <= box.roomMax.z) {
        minT = leftT;
        hitType = 5;
      }
    }
    
    // Area light
    float lightT = rayRectIntersect(r, box.lightPos, vec3(0.0, -1.0, 0.0), box.lightSize);
    if (lightT < minT && lightT > 0.0) {
      minT = lightT;
      hitType = 6;
    }
    
    // Tall box
    float tallBoxT = rayBoxIntersect(r, box.tallBoxMatrix);
    if (tallBoxT < minT && tallBoxT > 0.0) {
      minT = tallBoxT;
      hitType = 7;
    }
    
    // Short box
    float shortBoxT = rayBoxIntersect(r, box.shortBoxMatrix);
    if (shortBoxT < minT && shortBoxT > 0.0) {
      minT = shortBoxT;
      hitType = 8;
    }
    
    return vec4(minT, float(hitType), 0.0, 0.0);
  }

  // Get surface properties
  vec3 getSurfaceColor(int hitType, vec3 hitPoint) {
    if (hitType == 1 || hitType == 2 || hitType == 3) {
      return uWhiteWallColor; // Floor, ceiling, back wall
    } else if (hitType == 4) {
      return uRedWallColor; // Right wall
    } else if (hitType == 5) {
      return uGreenWallColor; // Left wall
    } else if (hitType == 6) {
      return uLightColor * uLightIntensity; // Area light
    } else if (hitType == 7 || hitType == 8) {
      return uWhiteWallColor; // Boxes
    }
    return vec3(0.0);
  }

  // Get surface normal
  vec3 getSurfaceNormal(int hitType, vec3 hitPoint) {
    CornellBox box = getCornellBox();
    
    if (hitType == 1) return vec3(0.0, 1.0, 0.0); // Floor
    if (hitType == 2) return vec3(0.0, -1.0, 0.0); // Ceiling
    if (hitType == 3) return vec3(0.0, 0.0, 1.0); // Back wall
    if (hitType == 4) return vec3(-1.0, 0.0, 0.0); // Right wall
    if (hitType == 5) return vec3(1.0, 0.0, 0.0); // Left wall
    if (hitType == 6) return vec3(0.0, -1.0, 0.0); // Area light
    if (hitType == 7) return getBoxNormal(hitPoint, box.tallBoxMatrix); // Tall box
    if (hitType == 8) return getBoxNormal(hitPoint, box.shortBoxMatrix); // Short box
    
    return vec3(0.0, 1.0, 0.0);
  }

  // Main path tracing function for Cornell box
  vec3 CalculateRadiance(Ray r, inout float seed) {
    vec3 accumulatedColor = vec3(0.0);
    vec3 mask = vec3(1.0);
    
    for (int bounces = 0; bounces < 8; bounces++) {
      vec4 intersection = cornellBoxIntersect(r);
      float t = intersection.x;
      int hitType = int(intersection.y);
      
      if (t == INFINITY) {
        // No intersection - shouldn't happen in Cornell box
        break;
      }
      
      vec3 hitPoint = r.origin + r.direction * t;
      vec3 normal = getSurfaceNormal(hitType, hitPoint);
      vec3 surfaceColor = getSurfaceColor(hitType, hitPoint);
      
      // Light source
      if (hitType == 6) {
        accumulatedColor += mask * surfaceColor;
        break;
      }
      
      // Direct lighting from area light
      CornellBox box = getCornellBox();
      vec3 lightSample = sampleAreaLight(box.lightPos, box.lightSize, vec3(0.0, -1.0, 0.0), seed);
      vec3 lightDir = normalize(lightSample - hitPoint);
      float lightDist = length(lightSample - hitPoint);
      
      // Shadow ray
      Ray shadowRay;
      shadowRay.origin = hitPoint + normal * uEPS_intersect;
      shadowRay.direction = lightDir;
      
      vec4 shadowIntersection = cornellBoxIntersect(shadowRay);
      bool inShadow = shadowIntersection.x < lightDist - uEPS_intersect;
      
      if (!inShadow) {
        float ndotl = max(0.0, dot(normal, lightDir));
        float lightArea = box.lightSize.x * box.lightSize.y * 4.0;
        float solidAngle = ndotl * lightArea / (lightDist * lightDist);
        
        accumulatedColor += mask * surfaceColor * uLightColor * uLightIntensity * solidAngle * 0.1;
      }
      
      // Indirect lighting (diffuse reflection)
      r.direction = randomHemisphereDirection(normal, seed);
      r.origin = hitPoint + normal * uEPS_intersect;
      
      mask *= surfaceColor * max(0.0, dot(normal, r.direction));
      
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

export const CornellBoxRenderer = ({ 
  redWallColor = [0.7, 0.12, 0.05],
  greenWallColor = [0.12, 0.45, 0.15],
  whiteWallColor = [0.73, 0.73, 0.73],
  lightColor = [1.0, 1.0, 1.0],
  lightIntensity = 15.0,
  enabled = true,
  qualityLevel = 1.0,
  onRenderUpdate
}) => {
  const groupRef = useRef();
  
  // Box transformations (matching original Cornell box setup)
  const boxMatrices = useMemo(() => {
    const tallBox = new THREE.Matrix4();
    const shortBox = new THREE.Matrix4();
    
    // Tall box (rotated and positioned)
    tallBox.makeRotationY(Math.PI * 0.1);
    tallBox.setPosition(185, 165, -169);
    tallBox.scale(new THREE.Vector3(82.5, 165, 82.5));
    
    // Short box (rotated and positioned)
    shortBox.makeRotationY(-Math.PI * 0.09);
    shortBox.setPosition(-186, 82.5, -169);
    shortBox.scale(new THREE.Vector3(82.5, 82.5, 82.5));
    
    return { tallBox, shortBox };
  }, []);
  
  // Custom uniforms for Cornell box
  const customUniforms = useMemo(() => ({
    uRedWallColor: { value: new THREE.Vector3(...redWallColor) },
    uGreenWallColor: { value: new THREE.Vector3(...greenWallColor) },
    uWhiteWallColor: { value: new THREE.Vector3(...whiteWallColor) },
    uLightColor: { value: new THREE.Vector3(...lightColor) },
    uLightIntensity: { value: lightIntensity },
    uTallBoxMatrix: { value: boxMatrices.tallBox },
    uShortBoxMatrix: { value: boxMatrices.shortBox }
  }), [redWallColor, greenWallColor, whiteWallColor, lightColor, lightIntensity, boxMatrices]);
  
  // Update uniforms
  useFrame((state, delta) => {
    if (!enabled) return;
    
    if (onRenderUpdate) {
      onRenderUpdate({
        lightIntensity,
        frameTime: delta
      });
    }
  });
  
  if (!enabled) return null;
  
  return (
    <group ref={groupRef} name="cornell-box-renderer">
      <PathTracingCore
        fragmentShader={cornellBoxFragmentShader}
        customUniforms={customUniforms}
        sceneIsDynamic={false}
        enabled={enabled}
        resolution={[Math.floor(1024 * qualityLevel), Math.floor(1024 * qualityLevel)]}
        pixelRatio={qualityLevel}
        apertureSize={0.0}
        focusDistance={800.0}
      />
      
      {/* Visual reference objects (invisible in path tracing) */}
      <group visible={false}>
        {/* Room walls */}
        <mesh position={[0, 274.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[556, 559]} />
          <meshBasicMaterial color={new THREE.Color(...whiteWallColor)} wireframe />
        </mesh>
        
        {/* Area light */}
        <mesh position={[0, 548.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[260, 210]} />
          <meshBasicMaterial color={new THREE.Color(...lightColor)} />
        </mesh>
        
        {/* Boxes */}
        <primitive object={new THREE.Group().add(
          new THREE.Mesh(
            new THREE.BoxGeometry(165, 330, 165),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(...whiteWallColor), wireframe: true })
          )
        )} matrix={boxMatrices.tallBox} />
        
        <primitive object={new THREE.Group().add(
          new THREE.Mesh(
            new THREE.BoxGeometry(165, 165, 165),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(...whiteWallColor), wireframe: true })
          )
        )} matrix={boxMatrices.shortBox} />
      </group>
      
      {/* Three.js Cornell box representation for fallback */}
      {qualityLevel < 0.5 && (
        <group>
          {/* Floor */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[556, 559]} />
            <meshLambertMaterial color={new THREE.Color(...whiteWallColor)} />
          </mesh>
          
          {/* Left wall (green) */}
          <mesh position={[-278, 274.4, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[559, 548.8]} />
            <meshLambertMaterial color={new THREE.Color(...greenWallColor)} />
          </mesh>
          
          {/* Right wall (red) */}
          <mesh position={[278, 274.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[559, 548.8]} />
            <meshLambertMaterial color={new THREE.Color(...redWallColor)} />
          </mesh>
          
          {/* Back wall */}
          <mesh position={[0, 274.4, -279.5]}>
            <planeGeometry args={[556, 548.8]} />
            <meshLambertMaterial color={new THREE.Color(...whiteWallColor)} />
          </mesh>
          
          {/* Ceiling */}
          <mesh position={[0, 548.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[556, 559]} />
            <meshLambertMaterial color={new THREE.Color(...whiteWallColor)} />
          </mesh>
          
          {/* Area light */}
          <mesh position={[0, 548.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[260, 210]} />
            <meshBasicMaterial color={new THREE.Color(...lightColor)} />
            <pointLight position={[0, 0, 0]} intensity={lightIntensity} color={new THREE.Color(...lightColor)} />
          </mesh>
        </group>
      )}
    </group>
  );
};

CornellBoxRenderer.propTypes = {
  redWallColor: PropTypes.arrayOf(PropTypes.number),
  greenWallColor: PropTypes.arrayOf(PropTypes.number),
  whiteWallColor: PropTypes.arrayOf(PropTypes.number),
  lightColor: PropTypes.arrayOf(PropTypes.number),
  lightIntensity: PropTypes.number,
  enabled: PropTypes.bool,
  qualityLevel: PropTypes.number,
  onRenderUpdate: PropTypes.func
};

export default CornellBoxRenderer; 
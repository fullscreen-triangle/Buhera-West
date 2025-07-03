import * as THREE from "three"
import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"

const WheatMaterial = shaderMaterial(
  {
    map: null,
    time: 0,
    growthStage: 1.0,
    materialType: 'stem', // 'stem', 'leaf', 'head'
    stemColor: new THREE.Color(0.8, 0.7, 0.3).convertSRGBToLinear(), // Golden stem
    leafColor: new THREE.Color(0.4, 0.7, 0.2).convertSRGBToLinear(), // Green leaves
    headColor: new THREE.Color(0.9, 0.8, 0.4).convertSRGBToLinear(), // Golden grain
    driedColor: new THREE.Color(0.7, 0.6, 0.2).convertSRGBToLinear(), // Dried/harvest color
  },
  `   precision mediump float;
      attribute vec3 offset;
      attribute vec4 orientation;
      attribute float scale;
      attribute float growth;
      uniform float time;
      uniform float growthStage;
      uniform int materialType;
      varying vec2 vUv;
      varying float frc;
      varying float vGrowth;
      varying vec3 vWorldPosition;
      varying float vWind;
      
      //WEBGL-NOISE FROM https://github.com/stegu/webgl-noise
      vec3 mod289(vec3 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;} 
      vec2 mod289(vec2 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;} 
      vec3 permute(vec3 x) {return mod289(((x*34.0)+1.0)*x);} 
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439); 
        vec2 i  = floor(v + dot(v, C.yy) ); 
        vec2 x0 = v - i + dot(i, C.xx); 
        vec2 i1; 
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); 
        vec4 x12 = x0.xyxy + C.xxzz; 
        x12.xy -= i1; 
        i = mod289(i); 
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 )); 
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); 
        m = m*m ; 
        m = m*m ; 
        vec3 x = 2.0 * fract(p * C.www) - 1.0; 
        vec3 h = abs(x) - 0.5; 
        vec3 ox = floor(x + 0.5); 
        vec3 a0 = x - ox; 
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ); 
        vec3 g; 
        g.x  = a0.x  * x0.x  + h.x  * x0.y; 
        g.yz = a0.yz * x12.xz + h.yz * x12.yw; 
        return 130.0 * dot(m, g);
      }
      //END NOISE
      
      //Quaternion rotation function
      vec3 rotateVectorByQuaternion( vec3 v, vec4 q){
        return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
      }
      
      void main() {
        vUv = uv;
        vGrowth = growth;
        
        // Position relative to plant part height (wheat is shorter than maize)
        frc = position.y / 1.2; // Normalize to wheat height
        
        // Apply growth scaling
        vec3 vPosition = position * scale * growth;
        
        // Apply orientation
        vPosition = rotateVectorByQuaternion(vPosition, orientation);
        
        // Wind effect - wheat is more responsive to wind than maize
        float windStrength = 0.0;
        if (materialType == 1) { // leaf
          windStrength = 0.5; // Leaves sway more
        } else if (materialType == 0) { // stem  
          windStrength = 0.2; // Stems bend gently
        } else { // head
          windStrength = 0.4; // Heads are heavy and sway
        }
        
        // Multi-layered wind for more realistic wheat field motion
        float noise1 = snoise(vec2((time * 0.8 + offset.x / 80.0), (time * 0.8 + offset.z / 80.0))); 
        float noise2 = snoise(vec2((time * 1.5 + offset.x / 40.0), (time * 1.5 + offset.z / 40.0))) * 0.3;
        float windNoise = noise1 + noise2;
        vWind = windNoise;
        
        float windBend = windNoise * windStrength * frc * frc; // More bend at top
        
        // Apply wind bending with some variation
        if (windStrength > 0.0) {
          float halfAngleX = windBend * 0.15;
          float halfAngleZ = windBend * 0.1 * sin(time * 2.0 + offset.x * 0.1); // Cross wind
          
          // Primary wind direction
          vPosition = rotateVectorByQuaternion(
            vPosition, 
            normalize(vec4(sin(halfAngleX), 0.0, 0.0, cos(halfAngleX)))
          );
          
          // Secondary wind direction
          vPosition = rotateVectorByQuaternion(
            vPosition, 
            normalize(vec4(0.0, 0.0, sin(halfAngleZ), cos(halfAngleZ)))
          );
        }
        
        // Calculate world position
        vec4 worldPosition = modelMatrix * vec4(offset + vPosition, 1.0);
        vWorldPosition = worldPosition.xyz;
        
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }`,
  `
      precision mediump float;
      uniform sampler2D map;
      uniform vec3 stemColor;
      uniform vec3 leafColor;
      uniform vec3 headColor;
      uniform vec3 driedColor;
      uniform float growthStage;
      uniform int materialType;
      varying vec2 vUv;
      varying float frc;
      varying float vGrowth;
      varying vec3 vWorldPosition;
      varying float vWind;
      
      void main() {
        // Get base texture color
        vec4 texColor = texture2D(map, vUv);
        
        // Base color depending on material type
        vec3 baseColor = stemColor;
        if (materialType == 1) { // leaf
          baseColor = leafColor;
        } else if (materialType == 2) { // head
          baseColor = headColor;
        }
        
        // Mix with texture
        vec3 finalColor = mix(baseColor, texColor.rgb, 0.6);
        
        // Growth stage effects - wheat changes color as it matures
        if (vGrowth < growthStage * 0.4) {
          // Young growth - very green
          finalColor = mix(finalColor, vec3(0.2, 0.9, 0.1), 0.4);
        } else if (vGrowth > growthStage * 0.7) {
          // Mature/harvest ready - golden brown
          float maturityFactor = (vGrowth - growthStage * 0.7) / (growthStage * 0.3);
          finalColor = mix(finalColor, driedColor, maturityFactor * 0.8);
          
          if (materialType == 2) { // Wheat heads turn golden when ready
            finalColor = mix(finalColor, headColor, 0.9);
          }
        }
        
        // Vertical gradient for natural shading
        float heightFactor = frc;
        if (materialType == 0) { // stem
          // Darker at base, golden at top when mature
          float baseShade = 0.5 + 0.5 * heightFactor;
          if (growthStage > 0.8) {
            baseShade *= (0.8 + 0.4 * heightFactor); // Golden tint for mature wheat
          }
          finalColor *= baseShade;
        } else if (materialType == 1) { // leaf
          // Natural leaf gradient
          finalColor *= (0.7 + 0.3 * heightFactor);
        } else { // head
          // Wheat heads have subtle shading
          finalColor *= (0.9 + 0.2 * abs(vWind)); // Subtle wind highlighting
        }
        
        // Environmental lighting with wheat-specific characteristics
        float ambientLight = 0.4; // Wheat fields are bright
        vec3 lightDir = normalize(vec3(0.6, 1.0, 0.4)); // Afternoon sun angle
        float diffuseLight = max(0.0, dot(normalize(vWorldPosition - vec3(0.0, -1.0, 0.0)), lightDir));
        float lighting = ambientLight + diffuseLight * 0.6;
        
        // Golden hour effect for mature wheat
        if (growthStage > 0.8) {
          float goldenHour = 0.1 * (1.0 + sin(vWorldPosition.x * 0.1 + vWorldPosition.z * 0.1));
          finalColor += vec3(0.2, 0.15, 0.0) * goldenHour; // Golden glow
        }
        
        finalColor *= lighting;
        
        // Alpha handling - wheat can have some transparency
        float alpha = 1.0;
        if (materialType == 1) { // leaf
          alpha = texColor.a * 0.95;
          if (alpha < 0.15) discard; // Remove very transparent parts
        }
        
        // Wind movement adds slight brightness variation
        if (abs(vWind) > 0.5) {
          finalColor += vec3(0.05, 0.05, 0.02); // Subtle wind highlight
        }
        
        gl_FragColor = vec4(finalColor, alpha);

        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`,
  (self) => {
    self.side = THREE.DoubleSide
    self.transparent = true
  },
)

extend({ WheatMaterial })

export default WheatMaterial 
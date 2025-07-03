import * as THREE from "three"
import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"

const MaizeMaterial = shaderMaterial(
  {
    map: null,
    time: 0,
    growthStage: 1.0,
    materialType: 'stalk', // 'stalk', 'leaf', 'ear'
    stalkColor: new THREE.Color(0.2, 0.6, 0.1).convertSRGBToLinear(),
    leafColor: new THREE.Color(0.1, 0.8, 0.2).convertSRGBToLinear(),
    earColor: new THREE.Color(0.9, 0.8, 0.3).convertSRGBToLinear(),
    brownColor: new THREE.Color(0.4, 0.3, 0.1).convertSRGBToLinear(),
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
        
        // Position relative to plant part height
        frc = position.y / 2.5; // Normalize to maize height
        
        // Apply growth scaling
        vec3 vPosition = position * scale * growth;
        
        // Apply orientation
        vPosition = rotateVectorByQuaternion(vPosition, orientation);
        
        // Wind effect - different for different plant parts
        float windStrength = 0.0;
        if (materialType == 1) { // leaf
          windStrength = 0.3;
        } else if (materialType == 0) { // stalk  
          windStrength = 0.1;
        } else { // ear
          windStrength = 0.05;
        }
        
        // Get wind data from simplex noise 
        float noise = snoise(vec2((time * 0.5 + offset.x / 100.0), (time * 0.5 + offset.z / 100.0))); 
        float windBend = noise * windStrength * frc * frc; // More bend at top
        
        // Apply wind bending
        if (windStrength > 0.0) {
          float halfAngle = windBend * 0.2;
          vPosition = rotateVectorByQuaternion(
            vPosition, 
            normalize(vec4(sin(halfAngle), 0.0, 0.0, cos(halfAngle)))
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
      uniform vec3 stalkColor;
      uniform vec3 leafColor;
      uniform vec3 earColor;
      uniform vec3 brownColor;
      uniform float growthStage;
      uniform int materialType;
      varying vec2 vUv;
      varying float frc;
      varying float vGrowth;
      varying vec3 vWorldPosition;
      
      void main() {
        // Get base texture color
        vec4 texColor = texture2D(map, vUv);
        
        // Base color depending on material type
        vec3 baseColor = stalkColor;
        if (materialType == 1) { // leaf
          baseColor = leafColor;
        } else if (materialType == 2) { // ear
          baseColor = earColor;
        }
        
        // Mix with texture
        vec3 finalColor = mix(baseColor, texColor.rgb, 0.7);
        
        // Growth stage effects
        if (vGrowth < growthStage * 0.5) {
          // Young growth - more green
          finalColor = mix(finalColor, vec3(0.2, 0.8, 0.1), 0.3);
        } else if (vGrowth > growthStage * 0.9) {
          // Mature/aging - add brown tones
          finalColor = mix(finalColor, brownColor, 0.2);
        }
        
        // Vertical gradient for natural shading
        float heightFactor = frc;
        if (materialType == 0) { // stalk
          // Darker at base, lighter at top
          finalColor *= (0.6 + 0.4 * heightFactor);
        } else if (materialType == 1) { // leaf
          // Subtle gradient
          finalColor *= (0.8 + 0.2 * heightFactor);
        }
        
        // Environmental lighting simulation
        float ambientLight = 0.3;
        float diffuseLight = max(0.0, dot(normalize(vWorldPosition), vec3(0.5, 1.0, 0.3)));
        float lighting = ambientLight + diffuseLight * 0.7;
        
        finalColor *= lighting;
        
        // Alpha handling
        float alpha = 1.0;
        if (materialType == 1) { // leaf
          alpha = texColor.a * 0.9; // Slightly transparent leaves
          if (alpha < 0.1) discard;
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

extend({ MaizeMaterial })

export default MaizeMaterial 
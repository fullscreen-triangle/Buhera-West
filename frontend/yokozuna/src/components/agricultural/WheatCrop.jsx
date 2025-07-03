// WheatCrop.jsx - Wheat crop visualization based on grass simulation
import * as THREE from "three"
import React, { useRef, useMemo } from "react"
import SimplexNoise from "simplex-noise"
import { useFrame, useLoader } from "@react-three/fiber"
import { Geometry } from "three/examples/jsm/deprecated/Geometry"
import "./WheatMaterial"

const simplex = new SimplexNoise(Math.random)

export default function WheatCrop({ 
  options = { 
    stemWidth: 0.02, 
    stemHeight: 1.2, 
    joints: 6,
    tillering: 3, // Number of stems per plant
    growthStage: 1.0 // 0.0 = seedling, 1.0 = harvest ready
  }, 
  width = 100, 
  instances = 8000, // Higher density than maize
  fieldSpacing = 0.15, // Tighter spacing for wheat
  ...props 
}) {
  const { stemWidth, stemHeight, joints, tillering, growthStage } = options
  const materialRef = useRef()
  const [stemTexture, leafTexture, grainTexture] = useLoader(THREE.TextureLoader, [
    '/textures/wheat_stem.jpg',
    '/textures/wheat_leaf.jpg', 
    '/textures/wheat_grain.jpg'
  ])
  
  const attributeData = useMemo(() => getWheatAttributeData(instances, width, fieldSpacing, growthStage, tillering), [instances, width, fieldSpacing, growthStage, tillering])
  
  // Main stem geometry - thinner than maize
  const stemGeom = useMemo(() => 
    new THREE.CylinderBufferGeometry(stemWidth * 0.5, stemWidth, stemHeight * growthStage, 6, joints)
      .translate(0, stemHeight * growthStage / 2, 0), 
    [options, growthStage]
  )
  
  // Leaf geometry - narrower than maize leaves
  const leafGeom = useMemo(() => 
    new THREE.PlaneBufferGeometry(stemWidth * 12, stemHeight * 0.6, 1, 2)
      .translate(0, stemHeight * 0.2, 0), 
    [options, growthStage]
  )
  
  // Grain head geometry (wheat ears)
  const headGeom = useMemo(() => 
    new THREE.CylinderBufferGeometry(stemWidth * 2, stemWidth * 1.5, stemHeight * 0.15, 8, 3)
      .translate(0, stemHeight * 0.92, 0), 
    [options, growthStage]
  )
  
  const groundGeo = useMemo(() => {
    const geo = new Geometry().fromBufferGeometry(new THREE.PlaneGeometry(width, width, 64, 64))
    geo.verticesNeedUpdate = true
    geo.lookAt(new THREE.Vector3(0, 1, 0))
    for (let i = 0; i < geo.vertices.length; i++) {
      const v = geo.vertices[i]
      v.y = getYPosition(v.x, v.z) * 0.05 // Very flat terrain for wheat fields
    }
    geo.computeVertexNormals()
    return geo.toBufferGeometry()
  }, [width])
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime / 4 // Gentle wind for wheat
      materialRef.current.uniforms.growthStage.value = growthStage
    }
  })
  
  return (
    <group {...props}>
      {/* Wheat stems */}
      <mesh>
        <instancedBufferGeometry 
          index={stemGeom.index} 
          attributes-position={stemGeom.attributes.position} 
          attributes-normal={stemGeom.attributes.normal}
          attributes-uv={stemGeom.attributes.uv}
        >
          <instancedBufferAttribute attach="attributes-offset" args={[new Float32Array(attributeData.offsets), 3]} />
          <instancedBufferAttribute attach="attributes-orientation" args={[new Float32Array(attributeData.orientations), 4]} />
          <instancedBufferAttribute attach="attributes-scale" args={[new Float32Array(attributeData.scales), 1]} />
          <instancedBufferAttribute attach="attributes-growth" args={[new Float32Array(attributeData.growthVariation), 1]} />
        </instancedBufferGeometry>
        <wheatMaterial 
          ref={materialRef} 
          map={stemTexture} 
          toneMapped={false}
          materialType="stem"
        />
      </mesh>

      {/* Wheat leaves */}
      <mesh>
        <instancedBufferGeometry 
          index={leafGeom.index} 
          attributes-position={leafGeom.attributes.position} 
          attributes-normal={leafGeom.attributes.normal}
          attributes-uv={leafGeom.attributes.uv}
        >
          <instancedBufferAttribute attach="attributes-offset" args={[new Float32Array(attributeData.leafOffsets), 3]} />
          <instancedBufferAttribute attach="attributes-orientation" args={[new Float32Array(attributeData.leafOrientations), 4]} />
          <instancedBufferAttribute attach="attributes-scale" args={[new Float32Array(attributeData.leafScales), 1]} />
        </instancedBufferGeometry>
        <wheatMaterial 
          map={leafTexture} 
          toneMapped={false}
          materialType="leaf"
          transparent
        />
      </mesh>

      {/* Wheat heads (grain) */}
      {growthStage > 0.6 && (
        <mesh>
          <instancedBufferGeometry 
            index={headGeom.index} 
            attributes-position={headGeom.attributes.position} 
            attributes-normal={headGeom.attributes.normal}
            attributes-uv={headGeom.attributes.uv}
          >
            <instancedBufferAttribute attach="attributes-offset" args={[new Float32Array(attributeData.headOffsets), 3]} />
            <instancedBufferAttribute attach="attributes-orientation" args={[new Float32Array(attributeData.headOrientations), 4]} />
            <instancedBufferAttribute attach="attributes-scale" args={[new Float32Array(attributeData.headScales), 1]} />
          </instancedBufferGeometry>
          <wheatMaterial 
            map={grainTexture} 
            toneMapped={false}
            materialType="head"
          />
        </mesh>
      )}

      {/* Wheat field ground */}
      <mesh position={[0, -0.05, 0]} geometry={groundGeo}>
        <meshStandardMaterial 
          color="#8B4513" // Rich brown soil
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
    </group>
  )
}

function getWheatAttributeData(instances, width, fieldSpacing, growthStage, tillering) {
  const offsets = []
  const orientations = []
  const scales = []
  const growthVariation = []
  
  // Leaf-specific arrays
  const leafOffsets = []
  const leafOrientations = []
  const leafScales = []
  
  // Head-specific arrays
  const headOffsets = []
  const headOrientations = []
  const headScales = []

  let quaternion = new THREE.Vector4()

  // Create dense wheat field pattern
  const plantSpacing = fieldSpacing
  const rowSpacing = fieldSpacing * 6 // Narrower rows than maize
  const rows = Math.floor(width / rowSpacing)
  const plantsPerRow = Math.floor(width / plantSpacing)

  for (let row = 0; row < rows && offsets.length / 3 < instances; row++) {
    for (let plant = 0; plant < plantsPerRow && offsets.length / 3 < instances; plant++) {
      // Base plant position
      const baseX = (row * rowSpacing) - width / 2 + (Math.random() - 0.5) * plantSpacing * 0.4
      const baseZ = (plant * plantSpacing) - width / 2 + (Math.random() - 0.5) * plantSpacing * 0.4
      const baseY = getYPosition(baseX, baseZ) * 0.05
      
      // Create multiple tillers (stems) per plant
      const numTillers = Math.floor(tillering * (0.7 + Math.random() * 0.6))
      for (let tiller = 0; tiller < numTillers; tiller++) {
        // Slight offset for each tiller
        const offsetX = baseX + (Math.random() - 0.5) * plantSpacing * 0.2
        const offsetZ = baseZ + (Math.random() - 0.5) * plantSpacing * 0.2
        const offsetY = baseY
        
        offsets.push(offsetX, offsetY, offsetZ)

        // Random rotation for natural look
        const angle = Math.random() * Math.PI * 2
        quaternion.set(0, Math.sin(angle / 2), 0, Math.cos(angle / 2)).normalize()
        orientations.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w)

        // Growth variation per tiller
        const tillerGrowth = growthStage * (0.8 + Math.random() * 0.4)
        scales.push(tillerGrowth)
        growthVariation.push(tillerGrowth)

        // Create leaves for each tiller
        const numLeaves = Math.floor(4 * tillerGrowth) + 2 // 2-6 leaves per tiller
        for (let leaf = 0; leaf < numLeaves; leaf++) {
          const leafHeight = (leaf / numLeaves) * 1.2 * tillerGrowth * 0.8
          const leafAngle = angle + (leaf * 120) * Math.PI / 180 // 120 degrees apart
          
          leafOffsets.push(
            offsetX + Math.sin(leafAngle) * 0.05,
            offsetY + leafHeight,
            offsetZ + Math.cos(leafAngle) * 0.05
          )
          
          // Leaf orientation
          const leafQuat = new THREE.Vector4()
          leafQuat.set(
            Math.sin(leafAngle / 2),
            Math.cos(leafAngle / 2) * 0.2, // Slight upward tilt
            0,
            Math.cos(leafAngle / 2)
          ).normalize()
          leafOrientations.push(leafQuat.x, leafQuat.y, leafQuat.z, leafQuat.w)
          leafScales.push(tillerGrowth * (0.9 + Math.random() * 0.2))
        }

        // Create wheat head for mature tillers
        if (tillerGrowth > 0.6) {
          const headHeight = 1.1 * tillerGrowth
          
          headOffsets.push(offsetX, offsetY + headHeight, offsetZ)
          
          // Wheat heads droop when mature
          const droopAngle = growthStage > 0.8 ? (Math.random() * 0.3) : 0
          const headQuat = new THREE.Vector4()
          headQuat.set(
            Math.sin(droopAngle / 2),
            0,
            0,
            Math.cos(droopAngle / 2)
          ).normalize()
          headOrientations.push(headQuat.x, headQuat.y, headQuat.z, headQuat.w)
          
          // Head size varies with maturity
          const headSize = tillerGrowth * (0.8 + Math.random() * 0.4)
          headScales.push(headSize)
        }
      }
    }
  }

  return {
    offsets,
    orientations,
    scales,
    growthVariation,
    leafOffsets,
    leafOrientations,
    leafScales,
    headOffsets,
    headOrientations,
    headScales
  }
}

function getYPosition(x, z) {
  // Very gentle terrain for wheat cultivation
  var y = 0.2 * simplex.noise2D(x / 200, z / 200)
  y += 0.05 * simplex.noise2D(x / 50, z / 50)
  return y
} 
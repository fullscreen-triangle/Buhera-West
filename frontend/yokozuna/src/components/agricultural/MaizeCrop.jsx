// MaizeCrop.jsx - Maize crop visualization based on grass simulation
import * as THREE from "three"
import React, { useRef, useMemo } from "react"
import SimplexNoise from "simplex-noise"
import { useFrame, useLoader } from "@react-three/fiber"
import { Geometry } from "three/examples/jsm/deprecated/Geometry"
import "./MaizeMaterial"

const simplex = new SimplexNoise(Math.random)

export default function MaizeCrop({ 
  options = { 
    stalkWidth: 0.08, 
    stalkHeight: 2.5, 
    joints: 8,
    leafDensity: 6,
    growthStage: 1.0 // 0.0 = seedling, 1.0 = mature
  }, 
  width = 100, 
  instances = 5000, // Fewer instances than grass for realistic crop density
  fieldSpacing = 0.75, // Realistic maize row spacing
  ...props 
}) {
  const { stalkWidth, stalkHeight, joints, leafDensity, growthStage } = options
  const materialRef = useRef()
  const [stalkTexture, leafTexture, kernelTexture] = useLoader(THREE.TextureLoader, [
    '/textures/maize_stalk.jpg',
    '/textures/maize_leaf.jpg', 
    '/textures/corn_kernels.jpg'
  ])
  
  const attributeData = useMemo(() => getMaizeAttributeData(instances, width, fieldSpacing, growthStage), [instances, width, fieldSpacing, growthStage])
  
  // Main stalk geometry
  const stalkGeom = useMemo(() => 
    new THREE.CylinderBufferGeometry(stalkWidth * 0.3, stalkWidth, stalkHeight * growthStage, 8, joints)
      .translate(0, stalkHeight * growthStage / 2, 0), 
    [options, growthStage]
  )
  
  // Leaf geometry
  const leafGeom = useMemo(() => 
    new THREE.PlaneBufferGeometry(stalkWidth * 8, stalkHeight * 0.4, 1, 3)
      .translate(0, stalkHeight * 0.3, 0), 
    [options, growthStage]
  )
  
  // Corn ear geometry (only visible in mature stage)
  const earGeom = useMemo(() => 
    new THREE.CylinderBufferGeometry(stalkWidth * 1.5, stalkWidth * 1.2, stalkHeight * 0.25, 8, 4)
      .translate(0, stalkHeight * 0.6, stalkWidth * 2), 
    [options, growthStage]
  )
  
  const groundGeo = useMemo(() => {
    const geo = new Geometry().fromBufferGeometry(new THREE.PlaneGeometry(width, width, 32, 32))
    geo.verticesNeedUpdate = true
    geo.lookAt(new THREE.Vector3(0, 1, 0))
    for (let i = 0; i < geo.vertices.length; i++) {
      const v = geo.vertices[i]
      v.y = getYPosition(v.x, v.z) * 0.1 // Flatter terrain for farmland
    }
    geo.computeVertexNormals()
    return geo.toBufferGeometry()
  }, [width])
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime / 6 // Slower wind for crops
      materialRef.current.uniforms.growthStage.value = growthStage
    }
  })
  
  return (
    <group {...props}>
      {/* Maize stalks */}
      <mesh>
        <instancedBufferGeometry 
          index={stalkGeom.index} 
          attributes-position={stalkGeom.attributes.position} 
          attributes-normal={stalkGeom.attributes.normal}
          attributes-uv={stalkGeom.attributes.uv}
        >
          <instancedBufferAttribute attach="attributes-offset" args={[new Float32Array(attributeData.offsets), 3]} />
          <instancedBufferAttribute attach="attributes-orientation" args={[new Float32Array(attributeData.orientations), 4]} />
          <instancedBufferAttribute attach="attributes-scale" args={[new Float32Array(attributeData.scales), 1]} />
          <instancedBufferAttribute attach="attributes-growth" args={[new Float32Array(attributeData.growthVariation), 1]} />
        </instancedBufferGeometry>
        <maizeMaterial 
          ref={materialRef} 
          map={stalkTexture} 
          toneMapped={false}
          materialType="stalk"
        />
      </mesh>

      {/* Maize leaves */}
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
        <maizeMaterial 
          map={leafTexture} 
          toneMapped={false}
          materialType="leaf"
          transparent
        />
      </mesh>

      {/* Corn ears (mature stage only) */}
      {growthStage > 0.7 && (
        <mesh>
          <instancedBufferGeometry 
            index={earGeom.index} 
            attributes-position={earGeom.attributes.position} 
            attributes-normal={earGeom.attributes.normal}
            attributes-uv={earGeom.attributes.uv}
          >
            <instancedBufferAttribute attach="attributes-offset" args={[new Float32Array(attributeData.earOffsets), 3]} />
            <instancedBufferAttribute attach="attributes-orientation" args={[new Float32Array(attributeData.earOrientations), 4]} />
            <instancedBufferAttribute attach="attributes-scale" args={[new Float32Array(attributeData.earScales), 1]} />
          </instancedBufferGeometry>
          <maizeMaterial 
            map={kernelTexture} 
            toneMapped={false}
            materialType="ear"
          />
        </mesh>
      )}

      {/* Farmland ground */}
      <mesh position={[0, -0.1, 0]} geometry={groundGeo}>
        <meshStandardMaterial 
          color="#3d2914" 
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
    </group>
  )
}

function getMaizeAttributeData(instances, width, fieldSpacing, growthStage) {
  const offsets = []
  const orientations = []
  const scales = []
  const growthVariation = []
  
  // Leaf-specific arrays
  const leafOffsets = []
  const leafOrientations = []
  const leafScales = []
  
  // Ear-specific arrays
  const earOffsets = []
  const earOrientations = []
  const earScales = []

  let quaternion = new THREE.Vector4()

  // Create organized rows like real maize fields
  const rowSpacing = fieldSpacing * 4
  const plantSpacing = fieldSpacing
  const rows = Math.floor(width / rowSpacing)
  const plantsPerRow = Math.floor(width / plantSpacing)

  for (let row = 0; row < rows && offsets.length / 3 < instances; row++) {
    for (let plant = 0; plant < plantsPerRow && offsets.length / 3 < instances; plant++) {
      // Main plant position with some randomness
      const offsetX = (row * rowSpacing) - width / 2 + (Math.random() - 0.5) * plantSpacing * 0.3
      const offsetZ = (plant * plantSpacing) - width / 2 + (Math.random() - 0.5) * plantSpacing * 0.3
      const offsetY = getYPosition(offsetX, offsetZ) * 0.1
      
      offsets.push(offsetX, offsetY, offsetZ)

      // Slight random rotation for natural look
      const angle = (Math.random() - 0.5) * 0.2
      quaternion.set(0, Math.sin(angle / 2), 0, Math.cos(angle / 2)).normalize()
      orientations.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w)

      // Growth variation
      const plantGrowth = growthStage * (0.8 + Math.random() * 0.4)
      scales.push(plantGrowth)
      growthVariation.push(plantGrowth)

      // Create multiple leaves per plant
      const numLeaves = Math.floor(6 * plantGrowth)
      for (let leaf = 0; leaf < numLeaves; leaf++) {
        const leafHeight = (leaf / numLeaves) * 2.5 * plantGrowth
        const leafAngle = (leaf * 137.5) * Math.PI / 180 // Golden angle for natural spiral
        
        leafOffsets.push(
          offsetX + Math.sin(leafAngle) * 0.1,
          offsetY + leafHeight,
          offsetZ + Math.cos(leafAngle) * 0.1
        )
        
        // Leaf orientation
        const leafQuat = new THREE.Vector4()
        leafQuat.set(
          Math.sin(leafAngle / 2),
          Math.cos(leafAngle / 2) * 0.3,
          0,
          Math.cos(leafAngle / 2)
        ).normalize()
        leafOrientations.push(leafQuat.x, leafQuat.y, leafQuat.z, leafQuat.w)
        leafScales.push(plantGrowth * (0.8 + Math.random() * 0.4))
      }

      // Create corn ears for mature plants
      if (plantGrowth > 0.7) {
        const numEars = Math.random() > 0.3 ? 2 : 1 // Most plants have 1-2 ears
        for (let ear = 0; ear < numEars; ear++) {
          const earHeight = 1.5 * plantGrowth + ear * 0.3
          const earAngle = ear * Math.PI + (Math.random() - 0.5) * 0.5
          
          earOffsets.push(
            offsetX + Math.sin(earAngle) * 0.15,
            offsetY + earHeight,
            offsetZ + Math.cos(earAngle) * 0.15
          )
          
          const earQuat = new THREE.Vector4()
          earQuat.set(
            Math.sin(earAngle / 2),
            0,
            Math.cos(earAngle / 2),
            Math.cos(earAngle / 2)
          ).normalize()
          earOrientations.push(earQuat.x, earQuat.y, earQuat.z, earQuat.w)
          earScales.push(plantGrowth * (0.9 + Math.random() * 0.2))
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
    earOffsets,
    earOrientations,
    earScales
  }
}

function getYPosition(x, z) {
  // Flatter terrain suitable for agriculture
  var y = 0.5 * simplex.noise2D(x / 100, z / 100)
  y += 0.1 * simplex.noise2D(x / 20, z / 20)
  return y
} 
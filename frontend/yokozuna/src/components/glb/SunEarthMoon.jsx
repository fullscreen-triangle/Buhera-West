'use client'
import { Canvas} from '@react-three/fiber'
import { useRef, useEffect, Suspense} from 'react'
import { useGLTF, Environment, useAnimations, Clouds, Cloud } from '@react-three/drei'
import * as THREE from 'three'

function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/sun_earth_moon.glb')
  const { actions } = useAnimations(animations, group)


    useEffect(() => {
      actions['Take 001'].play()
    })

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="2d13584d3773402e832b3b3a4c84745ffbx" rotation={[Math.PI / 2, 0, 0]}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="Sonne" position={[0, 102.377, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <mesh
                    name="Sonne_Material_#2_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Sonne_Material_#2_0'].geometry}
                    material={materials.Material_2}
                  />
                </group>
                <group name="Erde" position={[174.689, 102.377, -46.68]} rotation={[-1.169, 0, 0]}>
                  <mesh
                    name="Erde_Material_#1_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Erde_Material_#1_0'].geometry}
                    material={materials.Material_1}
                  />
                </group>
                <group
                  name="Mond"
                  position={[193.581, 102.377, -62.97]}
                  rotation={[-Math.PI / 2, 0, 0]}>
                  <mesh
                    name="Mond_Material_#3_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Mond_Material_#3_0'].geometry}
                    material={materials.Material_3}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/sun_earth_moon.glb')

// Removed unused CameraRig component that had missing dependencies

const SunEarthMoon = () => {
    return (
        <Canvas 
            shadows 
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 5], fov: 45, near: 1, far: 20 }}  
            gl={{ antialias: true }}
        >
            <hemisphereLight intensity={0.5} />
            <ambientLight intensity={0.2} />
            <directionalLight
                position={[5, 5, 5]}
                intensity={1}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
            <pointLight position={[0, 10, 0]} intensity={0.5} />
         
            <Suspense fallback={null}>
                <fog attach="fog" args={['#272730', 16, 30]} />
                <Environment files="/environments/potsdamer_platz_1k.hdr" />
                <Model position={[0, -2, 0]} scale={4} />
             

            </Suspense>

          
        </Canvas>
    )
}

export default SunEarthMoon ;
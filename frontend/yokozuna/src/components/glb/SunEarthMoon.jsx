'use client'
import * as THREE from 'three'
import { Canvas} from '@react-three/fiber'
import { useRef, useEffect, Suspense} from 'react'
import { useGLTF,   BakeShadows, Environment, useAnimations } from '@react-three/drei'

export function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/sun_earth_moon.glb')
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    if (actions && actions['Take 001']) {
      actions['Take 001'].reset().play();
    }

    // Optional cleanup
    return () => {
      if (actions && actions['Take 001']) {
        actions['Take 001'].stop();
      }
    };
  }, [actions]);
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

function CameraRig({ v = new THREE.Vector3() }) {
    const { camera } = useThree()
    useEffect(() => {
      const radius = interpolate([10, 5, 10], [0, 0.5, 1], cubicBezier(0.5, 0, 0.3, 0.98))
  
      return scroll((info) => {
        const p = info.y.progress
        camera.position.set(Math.sin(p * Math.PI * 2) * radius(p), 0, Math.cos(p * Math.PI * 2) * radius(p))
        camera.lookAt(0, 0, 0)
      })
    }, [])
    return null
  }

const SunEarthMoon = () => {
    return (
        <Canvas shadows camera={{ position: [0, 6, 16], fov: 50 }}  className='animate-[fade-in_1s_ease_0.3s_forwards]'>
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
            <fog attach="fog" args={['#272730', 16, 30]} />
            <Suspense fallback={null}>
                <Environment files="/environments/potsdamer_platz_1k.hdr" />

                <Model position={[0, -2, 0]} scale={1} />

            </Suspense>

            <BakeShadows />
        </Canvas>
    )
}

export default SunEarthMoon;
import React, { useRef , useEffect, Suspense} from 'react'
import { useGLTF, useAnimations, Environment, BakeShadows, PointLight, HemisphereLight, DirectionalLight } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

export function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/solar_system_animation.glb')
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    actions.Animation.play();
  });
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="mercury_BezierCircle_4" scale={9.695}>
                <group
                  name="mercury_2"
                  position={[0, 0, 1]}
                  rotation={[1.739, -0.875, 1.237]}
                  scale={0.038}>
                  <mesh
                    name="Object_5"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_5.geometry}
                    material={materials.mercury}
                  />
                </group>
              </group>
              <group name="venus_BezierCircle_7" rotation={[0, 0.028, 0]} scale={12.235}>
                <group
                  name="venus_5"
                  position={[0, 0, 1]}
                  rotation={[0, 0, Math.PI / 2]}
                  scale={0.102}>
                  <mesh
                    name="Object_8"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8.geometry}
                    material={materials.venus}
                  />
                </group>
              </group>
              <group name="erath_BezierCircle_11" scale={16.115}>
                <group name="erath_8" position={[0, 0, 1]} rotation={[0.819, 0, 0]} scale={0.062}>
                  <mesh
                    name="Object_11"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_11.geometry}
                    material={materials.earth}
                  />
                </group>
              </group>
              <group name="mars_BezierCircle_14" scale={20.451}>
                <group
                  name="mars_12"
                  position={[0, 0, 1]}
                  rotation={[0, 0, Math.PI / 2]}
                  scale={0.025}>
                  <mesh
                    name="Object_14"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_14.geometry}
                    material={materials.mars}
                  />
                </group>
              </group>
              <group name="jupiter_BezierCircle_17" scale={28.775}>
                <group name="jupiter_15" position={[0, 0, 1]} scale={0.095}>
                  <mesh
                    name="Object_17"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_17.geometry}
                    material={materials.jupiter}
                  />
                </group>
              </group>
              <group name="saturn_BezierCircle_21" scale={36.61}>
                <group name="saturn_19" position={[0, 0, 1]} scale={0.059}>
                  <mesh
                    name="Object_20"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_20.geometry}
                    material={materials.saturn}
                  />
                  <group
                    name="saturn_ring_18"
                    position={[0.01, -0.067, 0]}
                    rotation={[0, 0, 0.351]}
                    scale={1.739}>
                    <mesh
                      name="Object_22"
                      castShadow
                      receiveShadow
                      geometry={nodes.Object_22.geometry}
                      material={materials.saturn_ring}
                    />
                  </group>
                </group>
              </group>
              <group name="uranus_BezierCircle_24" scale={44.26}>
                <group
                  name="uranus_22"
                  position={[0, 0, 1]}
                  rotation={[0, 0, Math.PI / 2]}
                  scale={0.02}>
                  <mesh
                    name="Object_25"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_25.geometry}
                    material={materials.uranus}
                  />
                </group>
              </group>
              <group name="neptune_BezierCircle_27" scale={49.927}>
                <group
                  name="neptune_25"
                  position={[0, 0, 1]}
                  rotation={[0, 0, Math.PI / 2]}
                  scale={0.024}>
                  <mesh
                    name="Object_28"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_28.geometry}
                    material={materials.neptune}
                  />
                </group>
              </group>
              <group name="pluto_BezierCircle_30" scale={54.22}>
                <group
                  name="pluto_28"
                  position={[0, 0, 1]}
                  rotation={[0, 0, Math.PI / 2]}
                  scale={0.004}>
                  <mesh
                    name="Object_31"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_31.geometry}
                    material={materials.pluto}
                  />
                </group>
              </group>
              <group name="moon_BezierCircle_33" position={[0, 6.426, 14.778]} scale={-1.879}>
                <group
                  name="moon_31"
                  position={[0, 0, 1]}
                  rotation={[-0.023, 0, Math.PI / 2]}
                  scale={0.096}>
                  <mesh
                    name="Object_34"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_34.geometry}
                    material={materials.moon}
                  />
                </group>
              </group>
              <group name="mercury_BezierCircle001_34" scale={9.695}>
                <mesh
                  name="Object_36"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_36.geometry}
                  material={materials.Material}
                />
              </group>
              <group name="venus_BezierCircle001_35" rotation={[0, 0.028, 0]} scale={12.235}>
                <mesh
                  name="Object_38"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_38.geometry}
                  material={materials.Material}
                />
              </group>
              <group name="erath_BezierCircle001_36" scale={16.115}>
                <mesh
                  name="Object_40"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_40.geometry}
                  material={materials.Material}
                />
              </group>
              <group name="mars_BezierCircle001_37" scale={20.451}>
                <mesh
                  name="Object_42"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_42.geometry}
                  material={materials.Material}
                />
              </group>
              <group name="jupiter_BezierCircle001_38" scale={28.775}>
                <mesh
                  name="Object_44"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_44.geometry}
                  material={materials.Material}
                />
              </group>
              <group name="saturn_BezierCircle001_39" scale={36.61}>
                <mesh
                  name="Object_46"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_46.geometry}
                  material={materials.Material}
                />
              </group>
              <group name="uranus_BezierCircle001_40" scale={44.26}>
                <mesh
                  name="Object_48"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_48.geometry}
                  material={materials.Material}
                />
              </group>
              <group name="neptune_BezierCircle001_41" scale={49.927}>
                <mesh
                  name="Object_50"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_50.geometry}
                  material={materials.Material}
                />
              </group>
              <group name="pluto_BezierCircle001_42" scale={54.22}>
                <mesh
                  name="Object_52"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_52.geometry}
                  material={materials.Material}
                />
              </group>
              <group name="moon_BezierCircle001_43" position={[0, 6.426, 14.778]} scale={-1.879}>
                <mesh
                  name="Object_54"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_54.geometry}
                  material={materials.Material}
                />
              </group>
              <group name="sun_53" scale={5.997}>
                <mesh
                  name="Object_56"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_56.geometry}
                  material={materials.material}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/solar_system_animation.glb')




const SolarSystem = () => {
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

export default SolarSystem ;
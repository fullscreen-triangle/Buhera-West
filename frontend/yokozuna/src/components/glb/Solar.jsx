import React, { useRef , useEffect, Suspense} from 'react'
import { useGLTF, useAnimations, Environment } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { HemisphereLight, PointLight, DirectionalLight } from '@react-three/drei'

export function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/high_resolution_solar_system.glb')
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    actions['Armature|ArmatureAction'].play();
  });
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group
          name="Sketchfab_model"
          position={[-4361.414, -0.001, 4440.566]}
          rotation={[Math.PI / 2, 0, Math.PI / 2]}
          scale={0}>
          <group name="fcaa437d56b842d8a00c66191a3270f7fbx" rotation={[-Math.PI, 0, 0]}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="Armature" rotation={[0, 0, -Math.PI]} scale={100}>
                  <group name="Object_5">
                    <primitive object={nodes._rootJoint} />
                    <skinnedMesh
                      name="Object_33"
                      geometry={nodes.Object_33.geometry}
                      material={materials.Pluto}
                      skeleton={nodes.Object_33.skeleton}
                    />
                    <skinnedMesh
                      name="Object_35"
                      geometry={nodes.Object_35.geometry}
                      material={materials.Uranus}
                      skeleton={nodes.Object_35.skeleton}
                    />
                    <skinnedMesh
                      name="Object_37"
                      geometry={nodes.Object_37.geometry}
                      material={materials.Neptune}
                      skeleton={nodes.Object_37.skeleton}
                    />
                    <skinnedMesh
                      name="Object_39"
                      geometry={nodes.Object_39.geometry}
                      material={materials.Nuvem}
                      skeleton={nodes.Object_39.skeleton}
                    />
                    <skinnedMesh
                      name="Object_41"
                      geometry={nodes.Object_41.geometry}
                      material={materials.venus}
                      skeleton={nodes.Object_41.skeleton}
                    />
                    <skinnedMesh
                      name="Object_43"
                      geometry={nodes.Object_43.geometry}
                      material={materials.Jupiter}
                      skeleton={nodes.Object_43.skeleton}
                    />
                    <skinnedMesh
                      name="Object_44"
                      geometry={nodes.Object_44.geometry}
                      material={materials.JupiterAtmosphere}
                      skeleton={nodes.Object_44.skeleton}
                    />
                    <skinnedMesh
                      name="Object_46"
                      geometry={nodes.Object_46.geometry}
                      material={materials.Saturn}
                      skeleton={nodes.Object_46.skeleton}
                    />
                    <skinnedMesh
                      name="Object_48"
                      geometry={nodes.Object_48.geometry}
                      material={materials.material}
                      skeleton={nodes.Object_48.skeleton}
                    />
                    <skinnedMesh
                      name="Object_49"
                      geometry={nodes.Object_49.geometry}
                      material={materials.SunCorona}
                      skeleton={nodes.Object_49.skeleton}
                    />
                    <skinnedMesh
                      name="Object_51"
                      geometry={nodes.Object_51.geometry}
                      material={materials.Mars}
                      skeleton={nodes.Object_51.skeleton}
                    />
                    <skinnedMesh
                      name="Object_53"
                      geometry={nodes.Object_53.geometry}
                      material={materials.Mercury}
                      skeleton={nodes.Object_53.skeleton}
                    />
                    <skinnedMesh
                      name="Object_55"
                      geometry={nodes.Object_55.geometry}
                      material={materials.Moon}
                      skeleton={nodes.Object_55.skeleton}
                    />
                    <skinnedMesh
                      name="Object_57"
                      geometry={nodes.Object_57.geometry}
                      material={materials.Earth}
                      skeleton={nodes.Object_57.skeleton}
                    />
                    <group
                      name="Object_32"
                      position={[539617.725, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={100}
                    />
                    <group
                      name="Object_34"
                      position={[488612.695, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={100}
                    />
                    <group
                      name="Object_36"
                      position={[413009.18, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={100}
                    />
                    <group
                      name="Object_38"
                      position={[17775.879, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={527.328}
                    />
                    <group
                      name="Object_40"
                      position={[-8618.214, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={100}
                    />
                    <group
                      name="Object_42"
                      position={[114294.324, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={[100, 100, 94.073]}
                    />
                    <group
                      name="Object_45"
                      position={[276353.833, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={100}
                    />
                    <group
                      name="Object_47"
                      position={[-764365.918, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={100}
                    />
                    <group
                      name="Object_50"
                      position={[41458.56, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={100}
                    />
                    <group
                      name="Object_52"
                      position={[-28655.276, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={100}
                    />
                    <group
                      name="Object_54"
                      position={[17775.879, -9391.795, 0]}
                      rotation={[0, 0, 0.165]}
                      scale={100}
                    />
                    <group
                      name="Object_56"
                      position={[17775.879, 0, 0]}
                      rotation={[0, 0, Math.PI]}
                      scale={100}
                    />
                  </group>
                </group>
                <group
                  name="PlutoLow"
                  position={[539617.75, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={100}
                />
                <group
                  name="UranusLow"
                  position={[488612.688, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={100}
                />
                <group
                  name="NeptuneLow"
                  position={[413009.188, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={100}
                />
                <group
                  name="EarthClouds"
                  position={[17775.879, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={527.328}
                />
                <group
                  name="VenusLow"
                  position={[-8618.215, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={100}
                />
                <group
                  name="JupiterLow"
                  position={[114294.32, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={[100, 100, 94.073]}
                />
                <group
                  name="SaturnLow"
                  position={[276353.844, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={100}
                />
                <group
                  name="SunLow"
                  position={[-764365.938, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={100}
                />
                <group
                  name="MarsLow"
                  position={[41458.563, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={100}
                />
                <group
                  name="MercuryLow"
                  position={[-28655.277, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={100}
                />
                <group
                  name="MoonLow"
                  position={[17775.879, -9391.795, 0]}
                  rotation={[0, 0, 0.165]}
                  scale={100}
                />
                <group
                  name="EarthLow"
                  position={[17775.879, 0, 0]}
                  rotation={[0, 0, -Math.PI]}
                  scale={100}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/high_resolution_solar_system.glb')




const Solar = () => {
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

export default Solar ;
import React, { useRef , useEffect} from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function ProcessorModel(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/unmarked_processor_cpu__socket_hp_lp_anim.glb')
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    actions['Installing CPU Into the Socket'].play()
  })
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="CPU_Socket_Unmarked_Animatedfbx" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="ARMCPU001" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                  <group name="Object_5">
                    <primitive object={nodes._rootJoint} />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/unmarked_processor_cpu__socket_hp_lp_anim.glb')

import React, { useRef , useEffect} from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/raspberry_pi_4_compute_module_cm4.glb')
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    actions['Animation'].play()
  })
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="RootNode_(gltf_orientation_matrix)_68" position={[0.027, 0.021, 0]}>
                <group name="RootNode_(model_correction_matrix)_67">
                  <group name="root_66">
                    <group name="GLTF_SceneRootNode_65" rotation={[Math.PI / 2, 0, 0]}>
                      <group name="B2B_Connector_Mezzanine_Socket_1_3">
                        <group name="Mesh_3_0">
                          <mesh
                            name="Object_9"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_9.geometry}
                            material={materials.board_green_without_texture}
                          />
                        </group>
                        <group name="Mesh_4_1">
                          <mesh
                            name="Object_11"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_11.geometry}
                            material={materials['mat_4.002']}
                          />
                        </group>
                        <group name="Mesh_5_2">
                          <mesh
                            name="Object_13"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_13.geometry}
                            material={materials.chip}
                          />
                        </group>
                      </group>
                      <group name="board_2_9">
                        <group name="Mesh_10_4">
                          <mesh
                            name="Object_16"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_16.geometry}
                            material={materials.board_green_with_texture}
                          />
                          <mesh
                            name="Object_17"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_17.geometry}
                            material={materials.board_green_without_texture}
                          />
                        </group>
                        <group name="Mesh_6_5">
                          <mesh
                            name="Object_19"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_19.geometry}
                            material={materials.board_white}
                          />
                        </group>
                        <group name="Mesh_7_6">
                          <mesh
                            name="Object_21"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_21.geometry}
                            material={materials.Material}
                          />
                          <mesh
                            name="Object_22"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_22.geometry}
                            material={materials.Material}
                          />
                        </group>
                        <group name="Mesh_8_7">
                          <mesh
                            name="Object_24"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_24.geometry}
                            material={materials['mat_4.002']}
                          />
                        </group>
                        <group name="Mesh_9_8">
                          <mesh
                            name="Object_26"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_26.geometry}
                            material={materials['mat_5.002']}
                          />
                        </group>
                      </group>
                      <group name="bottom_misc_components_4_28">
                        <group name="Mesh_15_10">
                          <mesh
                            name="Object_29"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_29.geometry}
                            material={materials.board_green_without_texture}
                          />
                        </group>
                        <group name="Mesh_16_11">
                          <mesh
                            name="Object_31"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_31.geometry}
                            material={materials['mat_4.002']}
                          />
                        </group>
                        <group name="Mesh_17_12">
                          <mesh
                            name="Object_33"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_33.geometry}
                            material={materials.board_white}
                          />
                        </group>
                        <group name="Mesh_18_13">
                          <mesh
                            name="Object_35"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_35.geometry}
                            material={materials['mat_13.002']}
                          />
                        </group>
                        <group name="Mesh_19_14">
                          <mesh
                            name="Object_37"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_37.geometry}
                            material={materials['mat_14.002']}
                          />
                        </group>
                        <group name="Mesh_20_15">
                          <mesh
                            name="Object_39"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_39.geometry}
                            material={materials['mat_16.002']}
                          />
                        </group>
                        <group name="Mesh_21_16">
                          <mesh
                            name="Object_41"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_41.geometry}
                            material={materials['mat_17.002']}
                          />
                        </group>
                        <group name="Mesh_22_17">
                          <mesh
                            name="Object_43"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_43.geometry}
                            material={materials.chip}
                          />
                        </group>
                        <group name="Mesh_23_18">
                          <mesh
                            name="Object_45"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_45.geometry}
                            material={materials['mat_20.002']}
                          />
                        </group>
                        <group name="Mesh_24_19">
                          <mesh
                            name="Object_47"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_47.geometry}
                            material={materials['mat_22.002']}
                          />
                        </group>
                        <group name="Mesh_25_20">
                          <mesh
                            name="Object_49"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_49.geometry}
                            material={materials['mat_23.002']}
                          />
                        </group>
                        <group name="Mesh_26_21">
                          <mesh
                            name="Object_51"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_51.geometry}
                            material={materials['mat_24.002']}
                          />
                        </group>
                        <group name="Mesh_27_22">
                          <mesh
                            name="Object_53"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_53.geometry}
                            material={materials['mat_25.002']}
                          />
                        </group>
                        <group name="Mesh_28_23">
                          <mesh
                            name="Object_55"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_55.geometry}
                            material={materials['mat_9.002']}
                          />
                        </group>
                        <group name="Mesh_29_24">
                          <mesh
                            name="Object_57"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_57.geometry}
                            material={materials['mat_10.002']}
                          />
                        </group>
                        <group name="Mesh_30_25">
                          <mesh
                            name="Object_59"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_59.geometry}
                            material={materials['mat_11.002']}
                          />
                        </group>
                        <group name="Mesh_31_26">
                          <mesh
                            name="Object_61"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_61.geometry}
                            material={materials['mat_30.002']}
                          />
                        </group>
                        <group name="Mesh_32_27">
                          <mesh
                            name="Object_63"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_63.geometry}
                            material={materials['mat_31.002']}
                          />
                        </group>
                      </group>
                      <group name="chip_power_manager_MXL7704-P4_8_38">
                        <group name="Mesh_53_29">
                          <mesh
                            name="Object_66"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_66.geometry}
                            material={materials.board_green_without_texture}
                          />
                        </group>
                        <group name="Mesh_54_30">
                          <mesh
                            name="Object_68"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_68.geometry}
                            material={materials['mat_4.002']}
                          />
                        </group>
                        <group name="Mesh_55_31">
                          <mesh
                            name="Object_70"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_70.geometry}
                            material={materials['mat_6.002']}
                          />
                        </group>
                        <group name="Mesh_56_32">
                          <mesh
                            name="Object_72"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_72.geometry}
                            material={materials['mat_7.002']}
                          />
                        </group>
                        <group name="Mesh_57_33">
                          <mesh
                            name="Object_74"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_74.geometry}
                            material={materials.board_white}
                          />
                        </group>
                        <group name="Mesh_58_34">
                          <mesh
                            name="Object_76"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_76.geometry}
                            material={materials['mat_8.002']}
                          />
                        </group>
                        <group name="Mesh_59_35">
                          <mesh
                            name="Object_78"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_78.geometry}
                            material={materials['mat_18.002']}
                          />
                        </group>
                        <group name="Mesh_60_36">
                          <mesh
                            name="Object_80"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_80.geometry}
                            material={materials['mat_19.002']}
                          />
                        </group>
                        <group name="Mesh_61_37">
                          <mesh
                            name="Object_82"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_82.geometry}
                            material={materials['mat_20.002']}
                          />
                        </group>
                      </group>
                      <group name="top_misc_components001_5_55">
                        <group name="Mesh_33_39">
                          <mesh
                            name="Object_85"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_85.geometry}
                            material={materials.board_white}
                          />
                        </group>
                        <group name="Mesh_34_40">
                          <mesh
                            name="Object_87"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_87.geometry}
                            material={materials.board_green_without_texture}
                          />
                        </group>
                        <group name="Mesh_35_41">
                          <mesh
                            name="Object_89"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_89.geometry}
                            material={materials['mat_4.002']}
                          />
                        </group>
                        <group name="Mesh_36_42">
                          <mesh
                            name="Object_91"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_91.geometry}
                            material={materials['mat_6.002']}
                          />
                        </group>
                        <group name="Mesh_37_43">
                          <mesh
                            name="Object_93"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_93.geometry}
                            material={materials['mat_7.002']}
                          />
                        </group>
                        <group name="Mesh_38_44">
                          <mesh
                            name="Object_95"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_95.geometry}
                            material={materials['mat_8.002']}
                          />
                        </group>
                        <group name="Mesh_39_45">
                          <mesh
                            name="Object_97"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_97.geometry}
                            material={materials['mat_13.002']}
                          />
                        </group>
                        <group name="Mesh_40_46">
                          <mesh
                            name="Object_99"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_99.geometry}
                            material={materials['mat_14.002']}
                          />
                        </group>
                        <group name="Mesh_41_47">
                          <mesh
                            name="Object_101"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_101.geometry}
                            material={materials['mat_16.002']}
                          />
                        </group>
                        <group name="Mesh_42_48">
                          <mesh
                            name="Object_103"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_103.geometry}
                            material={materials['mat_17.002']}
                          />
                        </group>
                        <group name="Mesh_43_49">
                          <mesh
                            name="Object_105"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_105.geometry}
                            material={materials['mat_22.002']}
                          />
                        </group>
                        <group name="Mesh_44_50">
                          <mesh
                            name="Object_107"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_107.geometry}
                            material={materials['mat_23.002']}
                          />
                        </group>
                        <group name="Mesh_45_51">
                          <mesh
                            name="Object_109"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_109.geometry}
                            material={materials['mat_24.002']}
                          />
                        </group>
                        <group name="Mesh_46_52">
                          <mesh
                            name="Object_111"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_111.geometry}
                            material={materials.chip}
                          />
                        </group>
                        <group name="Mesh_47_53">
                          <mesh
                            name="Object_113"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_113.geometry}
                            material={materials['mat_25.002']}
                          />
                        </group>
                        <group name="Mesh_48_54">
                          <mesh
                            name="Object_115"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_115.geometry}
                            material={materials['mat_20.002']}
                          />
                        </group>
                      </group>
                      <group name="wifi_resistors_13_64" position={[-0.048, 0, 0.012]}>
                        <group name="Mesh_75_57">
                          <mesh
                            name="Object_118"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_118.geometry}
                            material={materials.board_white}
                          />
                        </group>
                        <group name="Mesh_76_58">
                          <mesh
                            name="Object_120"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_120.geometry}
                            material={materials.board_green_without_texture}
                          />
                        </group>
                        <group name="Mesh_77_59">
                          <mesh
                            name="Object_122"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_122.geometry}
                            material={materials['mat_4.002']}
                          />
                        </group>
                        <group name="Mesh_78_60">
                          <mesh
                            name="Object_124"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_124.geometry}
                            material={materials['mat_13.002']}
                          />
                        </group>
                        <group name="Mesh_79_61">
                          <mesh
                            name="Object_126"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_126.geometry}
                            material={materials['mat_14.002']}
                          />
                        </group>
                        <group name="Mesh_80_62">
                          <mesh
                            name="Object_128"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_128.geometry}
                            material={materials['mat_0.002']}
                          />
                        </group>
                        <group name="Mesh_81_63">
                          <mesh
                            name="Object_130"
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_130.geometry}
                            material={materials['mat_1.002']}
                          />
                        </group>
                      </group>
                    </group>
                  </group>
                </group>
              </group>
              <group name="chip_eMMC_Flash_Memory_0_72" position={[0.027, 0.021, 0]}>
                <group name="Mesh_0_69">
                  <mesh
                    name="Object_133"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_133.geometry}
                    material={materials.chip}
                  />
                </group>
                <group name="Mesh_1_70">
                  <mesh
                    name="Object_135"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_135.geometry}
                    material={materials.board_white}
                  />
                </group>
                <group name="Mesh_2_71">
                  <mesh
                    name="Object_137"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_137.geometry}
                    material={materials['mat_26.002']}
                  />
                </group>
              </group>
              <group name="Mesh_14_73" position={[-0.021, 0.009, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh
                  name="Object_139"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_139.geometry}
                  material={materials['mat_29.002']}
                />
                <mesh
                  name="Object_140"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_140.geometry}
                  material={materials['mat_28.002']}
                />
              </group>
              <group
                name="board_eMMC_Memory_Connections_6_77"
                position={[0.027, 0.021, 0]}
                rotation={[Math.PI / 2, 0, 0]}>
                <group name="Mesh_49_74">
                  <mesh
                    name="Object_143"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_143.geometry}
                    material={materials.board_green_without_texture}
                  />
                </group>
                <group name="Mesh_50_75">
                  <mesh
                    name="Object_145"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_145.geometry}
                    material={materials['mat_4.002']}
                  />
                </group>
                <group name="Mesh_51_76">
                  <mesh
                    name="Object_147"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_147.geometry}
                    material={materials.board_white}
                  />
                </group>
              </group>
              <group
                name="board_no_eMMC_Memory_Connections_7_79"
                position={[0.027, 0.021, -0.001]}
                rotation={[Math.PI / 2, 0, 0]}>
                <group name="Mesh_52_78">
                  <mesh
                    name="Object_150"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_150.geometry}
                    material={materials.board_green_without_texture}
                  />
                </group>
              </group>
              <group
                name="chip_network_connectivity_BCM54210PE_9_85"
                position={[0.027, 0.021, 0]}
                rotation={[Math.PI / 2, 0, 0]}>
                <group name="Mesh_62_80">
                  <mesh
                    name="Object_153"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_153.geometry}
                    material={materials.board_green_without_texture}
                  />
                </group>
                <group name="Mesh_63_81">
                  <mesh
                    name="Object_155"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_155.geometry}
                    material={materials['mat_4.002']}
                  />
                </group>
                <group name="Mesh_64_82">
                  <mesh
                    name="Object_157"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_157.geometry}
                    material={materials['mat_21.002']}
                  />
                </group>
                <group name="Mesh_65_83">
                  <mesh
                    name="Object_159"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_159.geometry}
                    material={materials.chip_shiny_black}
                  />
                </group>
                <group name="Mesh_66_84">
                  <mesh
                    name="Object_161"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_161.geometry}
                    material={materials['mat_33.001']}
                  />
                </group>
              </group>
              <group
                name="chip_ram_K4FBE3D4H_10_88"
                position={[0.027, 0.021, 0]}
                rotation={[Math.PI / 2, 0, 0]}>
                <group name="Mesh_67_86">
                  <mesh
                    name="Object_164"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_164.geometry}
                    material={materials.chip}
                  />
                </group>
                <group name="Mesh_68_87">
                  <mesh
                    name="Object_166"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_166.geometry}
                    material={materials['mat_27.002']}
                  />
                </group>
              </group>
              <group name="chip_processor_2711ZPKFSB06C0T_11_90" position={[0.027, 0.021, 0]}>
                <group name="Mesh_69_89">
                  <mesh
                    name="Object_169"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_169.geometry}
                    material={materials['mat_9.002']}
                  />
                  <mesh
                    name="Object_170"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_170.geometry}
                    material={materials['mat_11.002']}
                  />
                  <mesh
                    name="Object_171"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_171.geometry}
                    material={materials['mat_12.002']}
                  />
                  <mesh
                    name="Object_172"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_172.geometry}
                    material={materials['mat_10.002']}
                  />
                </group>
              </group>
              <group name="wifi_chip_12_93" position={[-0.021, 0.009, 0]}>
                <group name="Mesh_73_91">
                  <mesh
                    name="Object_175"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_175.geometry}
                    material={materials.board_white}
                  />
                </group>
                <group name="Mesh_74_92">
                  <mesh
                    name="Object_177"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_177.geometry}
                    material={materials.chip}
                  />
                </group>
              </group>
              <group
                name="text_ram_94"
                position={[0.052, 0.002, 0.002]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0}>
                <mesh
                  name="Object_179"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_179.geometry}
                  material={materials.Text}
                />
              </group>
              <group
                name="text_cpu_95"
                position={[0.011, -0.003, 0.004]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0}>
                <mesh
                  name="Object_181"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_181.geometry}
                  material={materials.Text}
                />
              </group>
              <group
                name="text_power_manager_96"
                position={[-0.018, -0.009, 0.003]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0}>
                <mesh
                  name="Object_183"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_183.geometry}
                  material={materials.Text}
                />
              </group>
              <group
                name="text_Onboard_Wifi_Antennae_97"
                position={[-0.056, 0.002, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0}>
                <mesh
                  name="Object_185"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_185.geometry}
                  material={materials.Text}
                />
              </group>
              <group
                name="text_External_Wifi_Connector_98"
                position={[-0.057, 0.012, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0}>
                <mesh
                  name="Object_187"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_187.geometry}
                  material={materials.Text}
                />
              </group>
              <group
                name="text_wifi_Chip_99"
                position={[0.003, 0.032, 0.006]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0}>
                <mesh
                  name="Object_189"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_189.geometry}
                  material={materials.Text}
                />
              </group>
              <group
                name="text_eMMC_100"
                position={[0.009, 0.031, 0.002]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0}>
                <mesh
                  name="Object_191"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_191.geometry}
                  material={materials.Text}
                />
              </group>
              <group
                name="text_with_wifi_101"
                position={[0.022, -0.027, 0.003]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[0.029, 0.018, 0.003]}>
                <mesh
                  name="Object_193"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_193.geometry}
                  material={materials.Text}
                />
              </group>
              <group
                name="text_without_wifi_102"
                position={[0.018, -0.027, 0.001]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[0.029, 0.018, 0.003]}>
                <mesh
                  name="Object_195"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_195.geometry}
                  material={materials.Text}
                />
              </group>
              <group
                name="sign_103"
                position={[0.001, -0.028, -0.01]}
                scale={[0.018, 0.005, 0.018]}>
                <mesh
                  name="Object_197"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_197.geometry}
                  material={materials.chip_shiny_black}
                />
              </group>
              <group
                name="sign_lite_104"
                position={[0.003, -0.028, -0.011]}
                scale={[0.014, 0.004, 0.014]}>
                <mesh
                  name="Object_199"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_199.geometry}
                  material={materials.chip_shiny_black}
                />
                <mesh
                  name="Object_200"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_200.geometry}
                  material={materials.Text}
                />
              </group>
              <group
                name="Plane_105"
                position={[-0.025, 0.005, 0.001]}
                rotation={[-1.572, -0.166, -0.015]}
                scale={0}>
                <mesh
                  name="Object_202"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_202.geometry}
                  material={materials.board_white}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/raspberry_pi_4_compute_module_cm4.glb')



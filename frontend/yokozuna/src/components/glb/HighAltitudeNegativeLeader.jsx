import React, { useRef , useEffect} from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function HighAltitudeNegativeLeaderModel(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/high_altitude_negative_leader.glb')
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    actions['Object_0'].play()
  })
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="sketchfabtimeframe">
            <group name="Object_2" scale={0}>
              <group name="frame_191">
                <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2">
                    <group name="mesh0_0">
                      <points
                        name="Object_7"
                        geometry={nodes.Object_7.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_8" scale={0}>
              <group name="frame_190">
                <group name="GLTF_SceneRootNode_1" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_1">
                    <group name="mesh0_0_1">
                      <points
                        name="Object_13"
                        geometry={nodes.Object_13.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_14" scale={0}>
              <group name="frame_189">
                <group name="GLTF_SceneRootNode_2" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_2">
                    <group name="mesh0_0_2">
                      <points
                        name="Object_19"
                        geometry={nodes.Object_19.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_20" scale={0}>
              <group name="frame_188">
                <group name="GLTF_SceneRootNode_3" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_3">
                    <group name="mesh0_0_3">
                      <points
                        name="Object_25"
                        geometry={nodes.Object_25.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_26" scale={0}>
              <group name="frame_187">
                <group name="GLTF_SceneRootNode_4" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_4">
                    <group name="mesh0_0_4">
                      <points
                        name="Object_31"
                        geometry={nodes.Object_31.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_32" scale={0}>
              <group name="frame_186">
                <group name="GLTF_SceneRootNode_5" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_5">
                    <group name="mesh0_0_5">
                      <points
                        name="Object_37"
                        geometry={nodes.Object_37.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_38" scale={0}>
              <group name="frame_185">
                <group name="GLTF_SceneRootNode_6" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_6">
                    <group name="mesh0_0_6">
                      <points
                        name="Object_43"
                        geometry={nodes.Object_43.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_44" scale={0}>
              <group name="frame_184">
                <group name="GLTF_SceneRootNode_7" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_7">
                    <group name="mesh0_0_7">
                      <points
                        name="Object_49"
                        geometry={nodes.Object_49.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_50" scale={0}>
              <group name="frame_183">
                <group name="GLTF_SceneRootNode_8" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_8">
                    <group name="mesh0_0_8">
                      <points
                        name="Object_55"
                        geometry={nodes.Object_55.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_56" scale={0}>
              <group name="frame_182">
                <group name="GLTF_SceneRootNode_9" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_9">
                    <group name="mesh0_0_9">
                      <points
                        name="Object_61"
                        geometry={nodes.Object_61.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_62" scale={0}>
              <group name="frame_181">
                <group name="GLTF_SceneRootNode_10" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_10">
                    <group name="mesh0_0_10">
                      <points
                        name="Object_67"
                        geometry={nodes.Object_67.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_68" scale={0}>
              <group name="frame_180">
                <group name="GLTF_SceneRootNode_11" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_11">
                    <group name="mesh0_0_11">
                      <points
                        name="Object_73"
                        geometry={nodes.Object_73.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_74" scale={0}>
              <group name="frame_179">
                <group name="GLTF_SceneRootNode_12" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_12">
                    <group name="mesh0_0_12">
                      <points
                        name="Object_79"
                        geometry={nodes.Object_79.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_80" scale={0}>
              <group name="frame_178">
                <group name="GLTF_SceneRootNode_13" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_13">
                    <group name="mesh0_0_13">
                      <points
                        name="Object_85"
                        geometry={nodes.Object_85.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_86" scale={0}>
              <group name="frame_177">
                <group name="GLTF_SceneRootNode_14" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_14">
                    <group name="mesh0_0_14">
                      <points
                        name="Object_91"
                        geometry={nodes.Object_91.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_92" scale={0}>
              <group name="frame_176">
                <group name="GLTF_SceneRootNode_15" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_15">
                    <group name="mesh0_0_15">
                      <points
                        name="Object_97"
                        geometry={nodes.Object_97.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_98" scale={0}>
              <group name="frame_175">
                <group name="GLTF_SceneRootNode_16" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_16">
                    <group name="mesh0_0_16">
                      <points
                        name="Object_103"
                        geometry={nodes.Object_103.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_104" scale={0}>
              <group name="frame_174">
                <group name="GLTF_SceneRootNode_17" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_17">
                    <group name="mesh0_0_17">
                      <points
                        name="Object_109"
                        geometry={nodes.Object_109.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_110" scale={0}>
              <group name="frame_173">
                <group name="GLTF_SceneRootNode_18" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_18">
                    <group name="mesh0_0_18">
                      <points
                        name="Object_115"
                        geometry={nodes.Object_115.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_116" scale={0}>
              <group name="frame_172">
                <group name="GLTF_SceneRootNode_19" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_19">
                    <group name="mesh0_0_19">
                      <points
                        name="Object_121"
                        geometry={nodes.Object_121.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_122" scale={0}>
              <group name="frame_171">
                <group name="GLTF_SceneRootNode_20" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_20">
                    <group name="mesh0_0_20">
                      <points
                        name="Object_127"
                        geometry={nodes.Object_127.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_128" scale={0}>
              <group name="frame_170">
                <group name="GLTF_SceneRootNode_21" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_21">
                    <group name="mesh0_0_21">
                      <points
                        name="Object_133"
                        geometry={nodes.Object_133.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_134" scale={0}>
              <group name="frame_169">
                <group name="GLTF_SceneRootNode_22" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_22">
                    <group name="mesh0_0_22">
                      <points
                        name="Object_139"
                        geometry={nodes.Object_139.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_140" scale={0}>
              <group name="frame_168">
                <group name="GLTF_SceneRootNode_23" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_23">
                    <group name="mesh0_0_23">
                      <points
                        name="Object_145"
                        geometry={nodes.Object_145.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_146" scale={0}>
              <group name="frame_167">
                <group name="GLTF_SceneRootNode_24" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_24">
                    <group name="mesh0_0_24">
                      <points
                        name="Object_151"
                        geometry={nodes.Object_151.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_152" scale={0}>
              <group name="frame_166">
                <group name="GLTF_SceneRootNode_25" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_25">
                    <group name="mesh0_0_25">
                      <points
                        name="Object_157"
                        geometry={nodes.Object_157.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_158" scale={0}>
              <group name="frame_165">
                <group name="GLTF_SceneRootNode_26" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_26">
                    <group name="mesh0_0_26">
                      <points
                        name="Object_163"
                        geometry={nodes.Object_163.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_164" scale={0}>
              <group name="frame_164">
                <group name="GLTF_SceneRootNode_27" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_27">
                    <group name="mesh0_0_27">
                      <points
                        name="Object_169"
                        geometry={nodes.Object_169.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_170" scale={0}>
              <group name="frame_163">
                <group name="GLTF_SceneRootNode_28" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_28">
                    <group name="mesh0_0_28">
                      <points
                        name="Object_175"
                        geometry={nodes.Object_175.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_176" scale={0}>
              <group name="frame_162">
                <group name="GLTF_SceneRootNode_29" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_29">
                    <group name="mesh0_0_29">
                      <points
                        name="Object_181"
                        geometry={nodes.Object_181.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_182" scale={0}>
              <group name="frame_161">
                <group name="GLTF_SceneRootNode_30" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_30">
                    <group name="mesh0_0_30">
                      <points
                        name="Object_187"
                        geometry={nodes.Object_187.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_188" scale={0}>
              <group name="frame_160">
                <group name="GLTF_SceneRootNode_31" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_31">
                    <group name="mesh0_0_31">
                      <points
                        name="Object_193"
                        geometry={nodes.Object_193.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_194" scale={0}>
              <group name="frame_159">
                <group name="GLTF_SceneRootNode_32" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_32">
                    <group name="mesh0_0_32">
                      <points
                        name="Object_199"
                        geometry={nodes.Object_199.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_200" scale={0}>
              <group name="frame_158">
                <group name="GLTF_SceneRootNode_33" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_33">
                    <group name="mesh0_0_33">
                      <points
                        name="Object_205"
                        geometry={nodes.Object_205.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_206" scale={0}>
              <group name="frame_157">
                <group name="GLTF_SceneRootNode_34" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_34">
                    <group name="mesh0_0_34">
                      <points
                        name="Object_211"
                        geometry={nodes.Object_211.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_212" scale={0}>
              <group name="frame_156">
                <group name="GLTF_SceneRootNode_35" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_35">
                    <group name="mesh0_0_35">
                      <points
                        name="Object_217"
                        geometry={nodes.Object_217.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_218" scale={0}>
              <group name="frame_155">
                <group name="GLTF_SceneRootNode_36" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_36">
                    <group name="mesh0_0_36">
                      <points
                        name="Object_223"
                        geometry={nodes.Object_223.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_224" scale={0}>
              <group name="frame_154">
                <group name="GLTF_SceneRootNode_37" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_37">
                    <group name="mesh0_0_37">
                      <points
                        name="Object_229"
                        geometry={nodes.Object_229.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_230" scale={0}>
              <group name="frame_153">
                <group name="GLTF_SceneRootNode_38" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_38">
                    <group name="mesh0_0_38">
                      <points
                        name="Object_235"
                        geometry={nodes.Object_235.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_236" scale={0}>
              <group name="frame_152">
                <group name="GLTF_SceneRootNode_39" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_39">
                    <group name="mesh0_0_39">
                      <points
                        name="Object_241"
                        geometry={nodes.Object_241.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_242" scale={0}>
              <group name="frame_151">
                <group name="GLTF_SceneRootNode_40" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_40">
                    <group name="mesh0_0_40">
                      <points
                        name="Object_247"
                        geometry={nodes.Object_247.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_248" scale={0}>
              <group name="frame_150">
                <group name="GLTF_SceneRootNode_41" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_41">
                    <group name="mesh0_0_41">
                      <points
                        name="Object_253"
                        geometry={nodes.Object_253.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_254" scale={0}>
              <group name="frame_149">
                <group name="GLTF_SceneRootNode_42" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_42">
                    <group name="mesh0_0_42">
                      <points
                        name="Object_259"
                        geometry={nodes.Object_259.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_260" scale={0}>
              <group name="frame_148">
                <group name="GLTF_SceneRootNode_43" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_43">
                    <group name="mesh0_0_43">
                      <points
                        name="Object_265"
                        geometry={nodes.Object_265.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_266" scale={0}>
              <group name="frame_147">
                <group name="GLTF_SceneRootNode_44" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_44">
                    <group name="mesh0_0_44">
                      <points
                        name="Object_271"
                        geometry={nodes.Object_271.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_272" scale={0}>
              <group name="frame_146">
                <group name="GLTF_SceneRootNode_45" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_45">
                    <group name="mesh0_0_45">
                      <points
                        name="Object_277"
                        geometry={nodes.Object_277.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_278" scale={0}>
              <group name="frame_145">
                <group name="GLTF_SceneRootNode_46" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_46">
                    <group name="mesh0_0_46">
                      <points
                        name="Object_283"
                        geometry={nodes.Object_283.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_284" scale={0}>
              <group name="frame_144">
                <group name="GLTF_SceneRootNode_47" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_47">
                    <group name="mesh0_0_47">
                      <points
                        name="Object_289"
                        geometry={nodes.Object_289.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_290" scale={0}>
              <group name="frame_143">
                <group name="GLTF_SceneRootNode_48" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_48">
                    <group name="mesh0_0_48">
                      <points
                        name="Object_295"
                        geometry={nodes.Object_295.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_296" scale={0}>
              <group name="frame_142">
                <group name="GLTF_SceneRootNode_49" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_49">
                    <group name="mesh0_0_49">
                      <points
                        name="Object_301"
                        geometry={nodes.Object_301.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_302" scale={0}>
              <group name="frame_141">
                <group name="GLTF_SceneRootNode_50" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_50">
                    <group name="mesh0_0_50">
                      <points
                        name="Object_307"
                        geometry={nodes.Object_307.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_308" scale={0}>
              <group name="frame_140">
                <group name="GLTF_SceneRootNode_51" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_51">
                    <group name="mesh0_0_51">
                      <points
                        name="Object_313"
                        geometry={nodes.Object_313.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_314" scale={0}>
              <group name="frame_139">
                <group name="GLTF_SceneRootNode_52" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_52">
                    <group name="mesh0_0_52">
                      <points
                        name="Object_319"
                        geometry={nodes.Object_319.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_320" scale={0}>
              <group name="frame_138">
                <group name="GLTF_SceneRootNode_53" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_53">
                    <group name="mesh0_0_53">
                      <points
                        name="Object_325"
                        geometry={nodes.Object_325.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_326" scale={0}>
              <group name="frame_137">
                <group name="GLTF_SceneRootNode_54" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_54">
                    <group name="mesh0_0_54">
                      <points
                        name="Object_331"
                        geometry={nodes.Object_331.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_332" scale={0}>
              <group name="frame_136">
                <group name="GLTF_SceneRootNode_55" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_55">
                    <group name="mesh0_0_55">
                      <points
                        name="Object_337"
                        geometry={nodes.Object_337.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_338" scale={0}>
              <group name="frame_135">
                <group name="GLTF_SceneRootNode_56" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_56">
                    <group name="mesh0_0_56">
                      <points
                        name="Object_343"
                        geometry={nodes.Object_343.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_344" scale={0}>
              <group name="frame_134">
                <group name="GLTF_SceneRootNode_57" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_57">
                    <group name="mesh0_0_57">
                      <points
                        name="Object_349"
                        geometry={nodes.Object_349.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_350" scale={0}>
              <group name="frame_133">
                <group name="GLTF_SceneRootNode_58" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_58">
                    <group name="mesh0_0_58">
                      <points
                        name="Object_355"
                        geometry={nodes.Object_355.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_356" scale={0}>
              <group name="frame_132">
                <group name="GLTF_SceneRootNode_59" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_59">
                    <group name="mesh0_0_59">
                      <points
                        name="Object_361"
                        geometry={nodes.Object_361.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_362" scale={0}>
              <group name="frame_131">
                <group name="GLTF_SceneRootNode_60" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_60">
                    <group name="mesh0_0_60">
                      <points
                        name="Object_367"
                        geometry={nodes.Object_367.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_368" scale={0}>
              <group name="frame_130">
                <group name="GLTF_SceneRootNode_61" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_61">
                    <group name="mesh0_0_61">
                      <points
                        name="Object_373"
                        geometry={nodes.Object_373.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_374" scale={0}>
              <group name="frame_128">
                <group name="GLTF_SceneRootNode_62" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_62">
                    <group name="mesh0_0_62">
                      <points
                        name="Object_379"
                        geometry={nodes.Object_379.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_380" scale={0}>
              <group name="frame_127">
                <group name="GLTF_SceneRootNode_63" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_63">
                    <group name="mesh0_0_63">
                      <points
                        name="Object_385"
                        geometry={nodes.Object_385.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_386" scale={0}>
              <group name="frame_126">
                <group name="GLTF_SceneRootNode_64" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_64">
                    <group name="mesh0_0_64">
                      <points
                        name="Object_391"
                        geometry={nodes.Object_391.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_392" scale={0}>
              <group name="frame_125">
                <group name="GLTF_SceneRootNode_65" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_65">
                    <group name="mesh0_0_65">
                      <points
                        name="Object_397"
                        geometry={nodes.Object_397.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_398" scale={0}>
              <group name="frame_124">
                <group name="GLTF_SceneRootNode_66" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_66">
                    <group name="mesh0_0_66">
                      <points
                        name="Object_403"
                        geometry={nodes.Object_403.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_404" scale={0}>
              <group name="frame_123">
                <group name="GLTF_SceneRootNode_67" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_67">
                    <group name="mesh0_0_67">
                      <points
                        name="Object_409"
                        geometry={nodes.Object_409.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_410" scale={0}>
              <group name="frame_122">
                <group name="GLTF_SceneRootNode_68" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_68">
                    <group name="mesh0_0_68">
                      <points
                        name="Object_415"
                        geometry={nodes.Object_415.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_416" scale={0}>
              <group name="frame_121">
                <group name="GLTF_SceneRootNode_69" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_69">
                    <group name="mesh0_0_69">
                      <points
                        name="Object_421"
                        geometry={nodes.Object_421.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_422" scale={0}>
              <group name="frame_120">
                <group name="GLTF_SceneRootNode_70" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_70">
                    <group name="mesh0_0_70">
                      <points
                        name="Object_427"
                        geometry={nodes.Object_427.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_428" scale={0}>
              <group name="frame_119">
                <group name="GLTF_SceneRootNode_71" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_71">
                    <group name="mesh0_0_71">
                      <points
                        name="Object_433"
                        geometry={nodes.Object_433.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_434" scale={0}>
              <group name="frame_118">
                <group name="GLTF_SceneRootNode_72" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_72">
                    <group name="mesh0_0_72">
                      <points
                        name="Object_439"
                        geometry={nodes.Object_439.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_440" scale={0}>
              <group name="frame_117">
                <group name="GLTF_SceneRootNode_73" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_73">
                    <group name="mesh0_0_73">
                      <points
                        name="Object_445"
                        geometry={nodes.Object_445.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_446" scale={0}>
              <group name="frame_116">
                <group name="GLTF_SceneRootNode_74" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_74">
                    <group name="mesh0_0_74">
                      <points
                        name="Object_451"
                        geometry={nodes.Object_451.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_452" scale={0}>
              <group name="frame_115">
                <group name="GLTF_SceneRootNode_75" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_75">
                    <group name="mesh0_0_75">
                      <points
                        name="Object_457"
                        geometry={nodes.Object_457.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_458" scale={0}>
              <group name="frame_114">
                <group name="GLTF_SceneRootNode_76" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_76">
                    <group name="mesh0_0_76">
                      <points
                        name="Object_463"
                        geometry={nodes.Object_463.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_464" scale={0}>
              <group name="frame_113">
                <group name="GLTF_SceneRootNode_77" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_77">
                    <group name="mesh0_0_77">
                      <points
                        name="Object_469"
                        geometry={nodes.Object_469.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_470" scale={0}>
              <group name="frame_112">
                <group name="GLTF_SceneRootNode_78" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_78">
                    <group name="mesh0_0_78">
                      <points
                        name="Object_475"
                        geometry={nodes.Object_475.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_476" scale={0}>
              <group name="frame_111">
                <group name="GLTF_SceneRootNode_79" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_79">
                    <group name="mesh0_0_79">
                      <points
                        name="Object_481"
                        geometry={nodes.Object_481.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_482" scale={0}>
              <group name="frame_110">
                <group name="GLTF_SceneRootNode_80" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_80">
                    <group name="mesh0_0_80">
                      <points
                        name="Object_487"
                        geometry={nodes.Object_487.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_488" scale={0}>
              <group name="frame_109">
                <group name="GLTF_SceneRootNode_81" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_81">
                    <group name="mesh0_0_81">
                      <points
                        name="Object_493"
                        geometry={nodes.Object_493.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_494" scale={0}>
              <group name="frame_108">
                <group name="GLTF_SceneRootNode_82" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_82">
                    <group name="mesh0_0_82">
                      <points
                        name="Object_499"
                        geometry={nodes.Object_499.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_500" scale={0}>
              <group name="frame_107">
                <group name="GLTF_SceneRootNode_83" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_83">
                    <group name="mesh0_0_83">
                      <points
                        name="Object_505"
                        geometry={nodes.Object_505.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_506" scale={0}>
              <group name="frame_106">
                <group name="GLTF_SceneRootNode_84" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_84">
                    <group name="mesh0_0_84">
                      <points
                        name="Object_511"
                        geometry={nodes.Object_511.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_512" scale={0}>
              <group name="frame_105">
                <group name="GLTF_SceneRootNode_85" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_85">
                    <group name="mesh0_0_85">
                      <points
                        name="Object_517"
                        geometry={nodes.Object_517.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_518" scale={0}>
              <group name="frame_104">
                <group name="GLTF_SceneRootNode_86" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_86">
                    <group name="mesh0_0_86">
                      <points
                        name="Object_523"
                        geometry={nodes.Object_523.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_524" scale={0}>
              <group name="frame_103">
                <group name="GLTF_SceneRootNode_87" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_87">
                    <group name="mesh0_0_87">
                      <points
                        name="Object_529"
                        geometry={nodes.Object_529.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_530" scale={0}>
              <group name="frame_102">
                <group name="GLTF_SceneRootNode_88" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_88">
                    <group name="mesh0_0_88">
                      <points
                        name="Object_535"
                        geometry={nodes.Object_535.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_536" scale={0}>
              <group name="frame_101">
                <group name="GLTF_SceneRootNode_89" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_89">
                    <group name="mesh0_0_89">
                      <points
                        name="Object_541"
                        geometry={nodes.Object_541.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_542" scale={0}>
              <group name="frame_100">
                <group name="GLTF_SceneRootNode_90" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_90">
                    <group name="mesh0_0_90">
                      <points
                        name="Object_547"
                        geometry={nodes.Object_547.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_548" scale={0}>
              <group name="frame_99">
                <group name="GLTF_SceneRootNode_91" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_91">
                    <group name="mesh0_0_91">
                      <points
                        name="Object_553"
                        geometry={nodes.Object_553.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_554" scale={0}>
              <group name="frame_98">
                <group name="GLTF_SceneRootNode_92" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_92">
                    <group name="mesh0_0_92">
                      <points
                        name="Object_559"
                        geometry={nodes.Object_559.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_560" scale={0}>
              <group name="frame_97">
                <group name="GLTF_SceneRootNode_93" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_93">
                    <group name="mesh0_0_93">
                      <points
                        name="Object_565"
                        geometry={nodes.Object_565.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_566" scale={0}>
              <group name="frame_96">
                <group name="GLTF_SceneRootNode_94" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_94">
                    <group name="mesh0_0_94">
                      <points
                        name="Object_571"
                        geometry={nodes.Object_571.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_572" scale={0}>
              <group name="frame_95">
                <group name="GLTF_SceneRootNode_95" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_95">
                    <group name="mesh0_0_95">
                      <points
                        name="Object_577"
                        geometry={nodes.Object_577.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_578" scale={0}>
              <group name="frame_94">
                <group name="GLTF_SceneRootNode_96" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_96">
                    <group name="mesh0_0_96">
                      <points
                        name="Object_583"
                        geometry={nodes.Object_583.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_584" scale={0}>
              <group name="frame_93">
                <group name="GLTF_SceneRootNode_97" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_97">
                    <group name="mesh0_0_97">
                      <points
                        name="Object_589"
                        geometry={nodes.Object_589.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_590" scale={0}>
              <group name="frame_92">
                <group name="GLTF_SceneRootNode_98" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_98">
                    <group name="mesh0_0_98">
                      <points
                        name="Object_595"
                        geometry={nodes.Object_595.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_596" scale={0}>
              <group name="frame_91">
                <group name="GLTF_SceneRootNode_99" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_99">
                    <group name="mesh0_0_99">
                      <points
                        name="Object_601"
                        geometry={nodes.Object_601.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_602" scale={0}>
              <group name="frame_90">
                <group name="GLTF_SceneRootNode_100" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_100">
                    <group name="mesh0_0_100">
                      <points
                        name="Object_607"
                        geometry={nodes.Object_607.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_608" scale={0}>
              <group name="frame_89">
                <group name="GLTF_SceneRootNode_101" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_101">
                    <group name="mesh0_0_101">
                      <points
                        name="Object_613"
                        geometry={nodes.Object_613.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_614" scale={0}>
              <group name="frame_88">
                <group name="GLTF_SceneRootNode_102" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_102">
                    <group name="mesh0_0_102">
                      <points
                        name="Object_619"
                        geometry={nodes.Object_619.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_620" scale={0}>
              <group name="frame_87">
                <group name="GLTF_SceneRootNode_103" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_103">
                    <group name="mesh0_0_103">
                      <points
                        name="Object_625"
                        geometry={nodes.Object_625.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_626" scale={0}>
              <group name="frame_86">
                <group name="GLTF_SceneRootNode_104" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_104">
                    <group name="mesh0_0_104">
                      <points
                        name="Object_631"
                        geometry={nodes.Object_631.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_632" scale={0}>
              <group name="frame_85">
                <group name="GLTF_SceneRootNode_105" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_105">
                    <group name="mesh0_0_105">
                      <points
                        name="Object_637"
                        geometry={nodes.Object_637.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_638" scale={0}>
              <group name="frame_84">
                <group name="GLTF_SceneRootNode_106" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_106">
                    <group name="mesh0_0_106">
                      <points
                        name="Object_643"
                        geometry={nodes.Object_643.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_644" scale={0}>
              <group name="frame_83">
                <group name="GLTF_SceneRootNode_107" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_107">
                    <group name="mesh0_0_107">
                      <points
                        name="Object_649"
                        geometry={nodes.Object_649.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_650" scale={0}>
              <group name="frame_82">
                <group name="GLTF_SceneRootNode_108" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_108">
                    <group name="mesh0_0_108">
                      <points
                        name="Object_655"
                        geometry={nodes.Object_655.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_656" scale={0}>
              <group name="frame_81">
                <group name="GLTF_SceneRootNode_109" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_109">
                    <group name="mesh0_0_109">
                      <points
                        name="Object_661"
                        geometry={nodes.Object_661.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_662" scale={0}>
              <group name="frame_80">
                <group name="GLTF_SceneRootNode_110" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_110">
                    <group name="mesh0_0_110">
                      <points
                        name="Object_667"
                        geometry={nodes.Object_667.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_668" scale={0}>
              <group name="frame_79">
                <group name="GLTF_SceneRootNode_111" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_111">
                    <group name="mesh0_0_111">
                      <points
                        name="Object_673"
                        geometry={nodes.Object_673.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_674" scale={0}>
              <group name="frame_78">
                <group name="GLTF_SceneRootNode_112" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_112">
                    <group name="mesh0_0_112">
                      <points
                        name="Object_679"
                        geometry={nodes.Object_679.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_680" scale={0}>
              <group name="frame_77">
                <group name="GLTF_SceneRootNode_113" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_113">
                    <group name="mesh0_0_113">
                      <points
                        name="Object_685"
                        geometry={nodes.Object_685.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_686" scale={0}>
              <group name="frame_76">
                <group name="GLTF_SceneRootNode_114" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_114">
                    <group name="mesh0_0_114">
                      <points
                        name="Object_691"
                        geometry={nodes.Object_691.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_692" scale={0}>
              <group name="frame_75">
                <group name="GLTF_SceneRootNode_115" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_115">
                    <group name="mesh0_0_115">
                      <points
                        name="Object_697"
                        geometry={nodes.Object_697.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_698" scale={0}>
              <group name="frame_74">
                <group name="GLTF_SceneRootNode_116" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_116">
                    <group name="mesh0_0_116">
                      <points
                        name="Object_703"
                        geometry={nodes.Object_703.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_704" scale={0}>
              <group name="frame_73">
                <group name="GLTF_SceneRootNode_117" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_117">
                    <group name="mesh0_0_117">
                      <points
                        name="Object_709"
                        geometry={nodes.Object_709.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_710" scale={0}>
              <group name="frame_72">
                <group name="GLTF_SceneRootNode_118" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_118">
                    <group name="mesh0_0_118">
                      <points
                        name="Object_715"
                        geometry={nodes.Object_715.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_716" scale={0}>
              <group name="frame_71">
                <group name="GLTF_SceneRootNode_119" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_119">
                    <group name="mesh0_0_119">
                      <points
                        name="Object_721"
                        geometry={nodes.Object_721.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_722" scale={0}>
              <group name="frame_70">
                <group name="GLTF_SceneRootNode_120" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_120">
                    <group name="mesh0_0_120">
                      <points
                        name="Object_727"
                        geometry={nodes.Object_727.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_728" scale={0}>
              <group name="frame_69">
                <group name="GLTF_SceneRootNode_121" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_121">
                    <group name="mesh0_0_121">
                      <points
                        name="Object_733"
                        geometry={nodes.Object_733.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_734" scale={0}>
              <group name="frame_68">
                <group name="GLTF_SceneRootNode_122" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_122">
                    <group name="mesh0_0_122">
                      <points
                        name="Object_739"
                        geometry={nodes.Object_739.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_740" scale={0}>
              <group name="frame_67">
                <group name="GLTF_SceneRootNode_123" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_123">
                    <group name="mesh0_0_123">
                      <points
                        name="Object_745"
                        geometry={nodes.Object_745.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_746" scale={0}>
              <group name="frame_66">
                <group name="GLTF_SceneRootNode_124" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_124">
                    <group name="mesh0_0_124">
                      <points
                        name="Object_751"
                        geometry={nodes.Object_751.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_752" scale={0}>
              <group name="frame_129">
                <group name="GLTF_SceneRootNode_125" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_125">
                    <group name="mesh0_0_125">
                      <points
                        name="Object_757"
                        geometry={nodes.Object_757.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_758" scale={0}>
              <group name="frame_64">
                <group name="GLTF_SceneRootNode_126" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_126">
                    <group name="mesh0_0_126">
                      <points
                        name="Object_763"
                        geometry={nodes.Object_763.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_764" scale={0}>
              <group name="frame_63">
                <group name="GLTF_SceneRootNode_127" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_127">
                    <group name="mesh0_0_127">
                      <points
                        name="Object_769"
                        geometry={nodes.Object_769.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_770" scale={0}>
              <group name="frame_62">
                <group name="GLTF_SceneRootNode_128" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_128">
                    <group name="mesh0_0_128">
                      <points
                        name="Object_775"
                        geometry={nodes.Object_775.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_776" scale={0}>
              <group name="frame_61">
                <group name="GLTF_SceneRootNode_129" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_129">
                    <group name="mesh0_0_129">
                      <points
                        name="Object_781"
                        geometry={nodes.Object_781.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_782" scale={0}>
              <group name="frame_60">
                <group name="GLTF_SceneRootNode_130" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_130">
                    <group name="mesh0_0_130">
                      <points
                        name="Object_787"
                        geometry={nodes.Object_787.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_788" scale={0}>
              <group name="frame_59">
                <group name="GLTF_SceneRootNode_131" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_131">
                    <group name="mesh0_0_131">
                      <points
                        name="Object_793"
                        geometry={nodes.Object_793.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_794" scale={0}>
              <group name="frame_58">
                <group name="GLTF_SceneRootNode_132" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_132">
                    <group name="mesh0_0_132">
                      <points
                        name="Object_799"
                        geometry={nodes.Object_799.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_800" scale={0}>
              <group name="frame_57">
                <group name="GLTF_SceneRootNode_133" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_133">
                    <group name="mesh0_0_133">
                      <points
                        name="Object_805"
                        geometry={nodes.Object_805.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_806" scale={0}>
              <group name="frame_56">
                <group name="GLTF_SceneRootNode_134" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_134">
                    <group name="mesh0_0_134">
                      <points
                        name="Object_811"
                        geometry={nodes.Object_811.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_812" scale={0}>
              <group name="frame_55">
                <group name="GLTF_SceneRootNode_135" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_135">
                    <group name="mesh0_0_135">
                      <points
                        name="Object_817"
                        geometry={nodes.Object_817.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_818" scale={0}>
              <group name="frame_54">
                <group name="GLTF_SceneRootNode_136" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_136">
                    <group name="mesh0_0_136">
                      <points
                        name="Object_823"
                        geometry={nodes.Object_823.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_824" scale={0}>
              <group name="frame_53">
                <group name="GLTF_SceneRootNode_137" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_137">
                    <group name="mesh0_0_137">
                      <points
                        name="Object_829"
                        geometry={nodes.Object_829.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_830" scale={0}>
              <group name="frame_52">
                <group name="GLTF_SceneRootNode_138" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_138">
                    <group name="mesh0_0_138">
                      <points
                        name="Object_835"
                        geometry={nodes.Object_835.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_836" scale={0}>
              <group name="frame_51">
                <group name="GLTF_SceneRootNode_139" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_139">
                    <group name="mesh0_0_139">
                      <points
                        name="Object_841"
                        geometry={nodes.Object_841.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_842" scale={0}>
              <group name="frame_50">
                <group name="GLTF_SceneRootNode_140" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_140">
                    <group name="mesh0_0_140">
                      <points
                        name="Object_847"
                        geometry={nodes.Object_847.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_848" scale={0}>
              <group name="frame_49">
                <group name="GLTF_SceneRootNode_141" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_141">
                    <group name="mesh0_0_141">
                      <points
                        name="Object_853"
                        geometry={nodes.Object_853.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_854" scale={0}>
              <group name="frame_48">
                <group name="GLTF_SceneRootNode_142" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_142">
                    <group name="mesh0_0_142">
                      <points
                        name="Object_859"
                        geometry={nodes.Object_859.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_860" scale={0}>
              <group name="frame_47">
                <group name="GLTF_SceneRootNode_143" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_143">
                    <group name="mesh0_0_143">
                      <points
                        name="Object_865"
                        geometry={nodes.Object_865.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_866" scale={0}>
              <group name="frame_46">
                <group name="GLTF_SceneRootNode_144" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_144">
                    <group name="mesh0_0_144">
                      <points
                        name="Object_871"
                        geometry={nodes.Object_871.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_872" scale={0}>
              <group name="frame_45">
                <group name="GLTF_SceneRootNode_145" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_145">
                    <group name="mesh0_0_145">
                      <points
                        name="Object_877"
                        geometry={nodes.Object_877.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_878" scale={0}>
              <group name="frame_44">
                <group name="GLTF_SceneRootNode_146" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_146">
                    <group name="mesh0_0_146">
                      <points
                        name="Object_883"
                        geometry={nodes.Object_883.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_884" scale={0}>
              <group name="frame_43">
                <group name="GLTF_SceneRootNode_147" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_147">
                    <group name="mesh0_0_147">
                      <points
                        name="Object_889"
                        geometry={nodes.Object_889.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_890" scale={0}>
              <group name="frame_42">
                <group name="GLTF_SceneRootNode_148" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_148">
                    <group name="mesh0_0_148">
                      <points
                        name="Object_895"
                        geometry={nodes.Object_895.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_896" scale={0}>
              <group name="frame_41">
                <group name="GLTF_SceneRootNode_149" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_149">
                    <group name="mesh0_0_149">
                      <points
                        name="Object_901"
                        geometry={nodes.Object_901.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_902" scale={0}>
              <group name="frame_40">
                <group name="GLTF_SceneRootNode_150" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_150">
                    <group name="mesh0_0_150">
                      <points
                        name="Object_907"
                        geometry={nodes.Object_907.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_908" scale={0}>
              <group name="frame_39">
                <group name="GLTF_SceneRootNode_151" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_151">
                    <group name="mesh0_0_151">
                      <points
                        name="Object_913"
                        geometry={nodes.Object_913.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_914" scale={0}>
              <group name="frame_38">
                <group name="GLTF_SceneRootNode_152" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_152">
                    <group name="mesh0_0_152">
                      <points
                        name="Object_919"
                        geometry={nodes.Object_919.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_920" scale={0}>
              <group name="frame_37">
                <group name="GLTF_SceneRootNode_153" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_153">
                    <group name="mesh0_0_153">
                      <points
                        name="Object_925"
                        geometry={nodes.Object_925.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_926" scale={0}>
              <group name="frame_36">
                <group name="GLTF_SceneRootNode_154" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_154">
                    <group name="mesh0_0_154">
                      <points
                        name="Object_931"
                        geometry={nodes.Object_931.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_932" scale={0}>
              <group name="frame_35">
                <group name="GLTF_SceneRootNode_155" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_155">
                    <group name="mesh0_0_155">
                      <points
                        name="Object_937"
                        geometry={nodes.Object_937.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_938" scale={0}>
              <group name="frame_34">
                <group name="GLTF_SceneRootNode_156" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_156">
                    <group name="mesh0_0_156">
                      <points
                        name="Object_943"
                        geometry={nodes.Object_943.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_944" scale={0}>
              <group name="frame_33">
                <group name="GLTF_SceneRootNode_157" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_157">
                    <group name="mesh0_0_157">
                      <points
                        name="Object_949"
                        geometry={nodes.Object_949.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_950" scale={0}>
              <group name="frame_65">
                <group name="GLTF_SceneRootNode_158" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_158">
                    <group name="mesh0_0_158">
                      <points
                        name="Object_955"
                        geometry={nodes.Object_955.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_956" scale={0}>
              <group name="frame_32">
                <group name="GLTF_SceneRootNode_159" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_159">
                    <group name="mesh0_0_159">
                      <points
                        name="Object_961"
                        geometry={nodes.Object_961.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_962" scale={0}>
              <group name="frame_31">
                <group name="GLTF_SceneRootNode_160" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_160">
                    <group name="mesh0_0_160">
                      <points
                        name="Object_967"
                        geometry={nodes.Object_967.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_968" scale={0}>
              <group name="frame_30">
                <group name="GLTF_SceneRootNode_161" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_161">
                    <group name="mesh0_0_161">
                      <points
                        name="Object_973"
                        geometry={nodes.Object_973.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_974" scale={0}>
              <group name="frame_29">
                <group name="GLTF_SceneRootNode_162" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_162">
                    <group name="mesh0_0_162">
                      <points
                        name="Object_979"
                        geometry={nodes.Object_979.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_980" scale={0}>
              <group name="frame_28">
                <group name="GLTF_SceneRootNode_163" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_163">
                    <group name="mesh0_0_163">
                      <points
                        name="Object_985"
                        geometry={nodes.Object_985.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_986" scale={0}>
              <group name="frame_27">
                <group name="GLTF_SceneRootNode_164" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_164">
                    <group name="mesh0_0_164">
                      <points
                        name="Object_991"
                        geometry={nodes.Object_991.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_992" scale={0}>
              <group name="frame_26">
                <group name="GLTF_SceneRootNode_165" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_165">
                    <group name="mesh0_0_165">
                      <points
                        name="Object_997"
                        geometry={nodes.Object_997.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_998" scale={0}>
              <group name="frame_25">
                <group name="GLTF_SceneRootNode_166" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_166">
                    <group name="mesh0_0_166">
                      <points
                        name="Object_1003"
                        geometry={nodes.Object_1003.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1004" scale={0}>
              <group name="frame_24">
                <group name="GLTF_SceneRootNode_167" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_167">
                    <group name="mesh0_0_167">
                      <points
                        name="Object_1009"
                        geometry={nodes.Object_1009.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1010" scale={0}>
              <group name="frame_23">
                <group name="GLTF_SceneRootNode_168" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_168">
                    <group name="mesh0_0_168">
                      <points
                        name="Object_1015"
                        geometry={nodes.Object_1015.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1016" scale={0}>
              <group name="frame_22">
                <group name="GLTF_SceneRootNode_169" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_169">
                    <group name="mesh0_0_169">
                      <points
                        name="Object_1021"
                        geometry={nodes.Object_1021.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1022" scale={0}>
              <group name="frame_21">
                <group name="GLTF_SceneRootNode_170" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_170">
                    <group name="mesh0_0_170">
                      <points
                        name="Object_1027"
                        geometry={nodes.Object_1027.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1028" scale={0}>
              <group name="frame_20">
                <group name="GLTF_SceneRootNode_171" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_171">
                    <group name="mesh0_0_171">
                      <points
                        name="Object_1033"
                        geometry={nodes.Object_1033.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1034" scale={0}>
              <group name="frame_19">
                <group name="GLTF_SceneRootNode_172" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_172">
                    <group name="mesh0_0_172">
                      <points
                        name="Object_1039"
                        geometry={nodes.Object_1039.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1040" scale={0}>
              <group name="frame_18">
                <group name="GLTF_SceneRootNode_173" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_173">
                    <group name="mesh0_0_173">
                      <points
                        name="Object_1045"
                        geometry={nodes.Object_1045.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1046" scale={0}>
              <group name="frame_17">
                <group name="GLTF_SceneRootNode_174" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_174">
                    <group name="mesh0_0_174">
                      <points
                        name="Object_1051"
                        geometry={nodes.Object_1051.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1052" scale={0}>
              <group name="frame_16">
                <group name="GLTF_SceneRootNode_175" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_175">
                    <group name="mesh0_0_175">
                      <points
                        name="Object_1057"
                        geometry={nodes.Object_1057.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1058" scale={0}>
              <group name="frame_15">
                <group name="GLTF_SceneRootNode_176" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_176">
                    <group name="mesh0_0_176">
                      <points
                        name="Object_1063"
                        geometry={nodes.Object_1063.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1064" scale={0}>
              <group name="frame_14">
                <group name="GLTF_SceneRootNode_177" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_177">
                    <group name="mesh0_0_177">
                      <points
                        name="Object_1069"
                        geometry={nodes.Object_1069.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1070" scale={0}>
              <group name="frame_13">
                <group name="GLTF_SceneRootNode_178" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_178">
                    <group name="mesh0_0_178">
                      <points
                        name="Object_1075"
                        geometry={nodes.Object_1075.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1076" scale={0}>
              <group name="frame_12">
                <group name="GLTF_SceneRootNode_179" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_179">
                    <group name="mesh0_0_179">
                      <points
                        name="Object_1081"
                        geometry={nodes.Object_1081.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1082" scale={0}>
              <group name="frame_11">
                <group name="GLTF_SceneRootNode_180" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_180">
                    <group name="mesh0_0_180">
                      <points
                        name="Object_1087"
                        geometry={nodes.Object_1087.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1088" scale={0}>
              <group name="frame_10">
                <group name="GLTF_SceneRootNode_181" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_181">
                    <group name="mesh0_0_181">
                      <points
                        name="Object_1093"
                        geometry={nodes.Object_1093.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1094" scale={0}>
              <group name="frame_9">
                <group name="GLTF_SceneRootNode_182" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_182">
                    <group name="mesh0_0_182">
                      <points
                        name="Object_1099"
                        geometry={nodes.Object_1099.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1100" scale={0}>
              <group name="frame_8">
                <group name="GLTF_SceneRootNode_183" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_183">
                    <group name="mesh0_0_183">
                      <points
                        name="Object_1105"
                        geometry={nodes.Object_1105.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1106" scale={0}>
              <group name="frame_7">
                <group name="GLTF_SceneRootNode_184" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_184">
                    <group name="mesh0_0_184">
                      <points
                        name="Object_1111"
                        geometry={nodes.Object_1111.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1112" scale={0}>
              <group name="frame_6">
                <group name="GLTF_SceneRootNode_185" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_185">
                    <group name="mesh0_0_185">
                      <points
                        name="Object_1117"
                        geometry={nodes.Object_1117.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1118" scale={0}>
              <group name="frame_5">
                <group name="GLTF_SceneRootNode_186" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_186">
                    <group name="mesh0_0_186">
                      <points
                        name="Object_1123"
                        geometry={nodes.Object_1123.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1124" scale={0}>
              <group name="frame_4">
                <group name="GLTF_SceneRootNode_187" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_187">
                    <group name="mesh0_0_187">
                      <points
                        name="Object_1129"
                        geometry={nodes.Object_1129.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1130" scale={0}>
              <group name="frame_3">
                <group name="GLTF_SceneRootNode_188" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_188">
                    <group name="mesh0_0_188">
                      <points
                        name="Object_1135"
                        geometry={nodes.Object_1135.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1136" scale={0}>
              <group name="frame_2">
                <group name="GLTF_SceneRootNode_189" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_189">
                    <group name="mesh0_0_189">
                      <points
                        name="Object_1141"
                        geometry={nodes.Object_1141.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1142" scale={0}>
              <group name="frame_1">
                <group name="GLTF_SceneRootNode_190" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_190">
                    <group name="mesh0_0_190">
                      <points
                        name="Object_1147"
                        geometry={nodes.Object_1147.geometry}
                        material={materials.material_0}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
            <group name="Object_1148">
              <group name="frame_191_1">
                <group name="GLTF_SceneRootNode_191" rotation={[Math.PI / 2, 0, 0]}>
                  <group name="Renderer_Node_2_191">
                    <group name="mesh0_0_191">
                      <points
                        name="Object_1153"
                        geometry={nodes.Object_1153.geometry}
                        material={materials.material_0}
                      />
                    </group>
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

useGLTF.preload('/models/high_altitude_negative_leader.glb')




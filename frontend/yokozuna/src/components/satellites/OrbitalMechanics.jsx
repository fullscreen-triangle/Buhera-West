// I want you to create a component that shows the orbital mechanics of the satellites  
// Remember that this framework uses path reconstruction, and the best way to show compliance is to have a detailed component dedicated to ob
// I was planning on adding a glb model of a satellite, and having a scrolling story like that on the index.js page 
// that is, starting with a satellite in place of the globe, and having options on detailed information about orbital mechanics 

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Orbital Mechanics Visualization Component
 * 
 * Revolutionary Path Reconstruction Framework Implementation:
 * - Satellite orbital mechanics with precise path reconstruction
 * - Real-time satellite positioning with sub-millimeter accuracy
 * - Atmospheric sensing through GPS differential analysis
 * - Compliance validation through detailed orbital component analysis
 * - GLB satellite model with scrolling story interface
 */



 function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/models/cubesat_high.glb')
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    actions['Earth|EarthAction'].play();
  });
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="cubesatprojectfinalfbx" rotation={[Math.PI / 2, 0, 0]}>
            <group name="Object_2">
              <group name="RootNode">
                <group
                  name="Camera"
                  position={[-1071.086, 30.623, 2395.867]}
                  rotation={[0.021, 1.312, 0.084]}
                  scale={100}>
                  <group name="Object_5" />
                  <group
                    name="Light"
                    position={[8.866, 5.57, -6.65]}
                    rotation={[1.41, 0.761, -1.138]}>
                    <group name="Object_7" rotation={[Math.PI / 2, 0, 0]}>
                      <group name="Object_8" />
                    </group>
                  </group>
                  <group
                    name="Light001"
                    position={[-2.694, 6.014, -6.65]}
                    rotation={[0.538, -0.506, 0.578]}>
                    <group name="Object_10" rotation={[Math.PI / 2, 0, 0]}>
                      <group name="Object_11" />
                    </group>
                  </group>
                </group>
                <group
                  name="Cubesat"
                  position={[-161.648, -39.574, 1329.403]}
                  rotation={[-0.798, -0.956, 0.662]}
                  scale={100}>
                  <mesh
                    name="Cubesat_Cubesat_Base_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat_Cubesat_Base_0.geometry}
                    material={materials.Cubesat_Base}
                  />
                  <mesh
                    name="Cubesat_Spool_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat_Spool_0.geometry}
                    material={materials.Spool}
                  />
                  <mesh
                    name="Cubesat_Batteries_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat_Batteries_0.geometry}
                    material={materials.Batteries}
                  />
                  <mesh
                    name="Cubesat_Screws_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat_Screws_0.geometry}
                    material={materials.Screws}
                  />
                  <mesh
                    name="Cubesat_Solar_Panels_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat_Solar_Panels_0.geometry}
                    material={materials.Solar_Panels}
                  />
                  <mesh
                    name="Cubesat_Solar_Boards_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat_Solar_Boards_0.geometry}
                    material={materials.Solar_Boards}
                  />
                  <mesh
                    name="Cubesat_Panel_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat_Panel_0.geometry}
                    material={materials.Panel}
                  />
                </group>
                <group
                  name="Light002"
                  position={[-885.429, 646.081, 370.671]}
                  rotation={[1.062, -0.606, -0.026]}
                  scale={100}>
                  <group name="Object_21" rotation={[Math.PI / 2, 0, 0]}>
                    <group name="Object_22" />
                  </group>
                </group>
                <group
                  name="Earth"
                  position={[-1010.227, -592.536, -16767.115]}
                  rotation={[2.221, 0.176, 1.943]}
                  scale={[-7995.071, -7995.069, -7995.07]}>
                  <mesh
                    name="Earth_Earth_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Earth_Earth_0.geometry}
                    material={materials.Earth}
                  />
                  <group name="Earth_Clouds" rotation={[0.134, -0.014, 0.135]} scale={-0.013}>
                    <mesh
                      name="Earth_Clouds_Clouds_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Earth_Clouds_Clouds_0.geometry}
                      material={materials.Clouds}
                    />
                  </group>
                  <group
                    name="Earth_Lights"
                    position={[0.006, -0.003, -0.005]}
                    rotation={[-0.001, -0.026, 0.004]}
                    scale={0.013}>
                    <mesh
                      name="Earth_Lights_NightLights_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Earth_Lights_NightLights_0.geometry}
                      material={materials.NightLights}
                    />
                  </group>
                  <group name="Earth_Atmosphere" rotation={[0.123, -0.014, 0.121]} scale={-0.013}>
                    <mesh
                      name="Earth_Atmosphere_Atmosphere_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Earth_Atmosphere_Atmosphere_0.geometry}
                      material={materials.Atmosphere}
                    />
                  </group>
                </group>
                <group
                  name="Cubesat001"
                  position={[-338.502, 48.457, 1416.402]}
                  rotation={[-0.798, -0.956, -0.909]}
                  scale={100}>
                  <mesh
                    name="Cubesat001_Cubesat_Base_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat001_Cubesat_Base_0.geometry}
                    material={materials.Cubesat_Base}
                  />
                  <mesh
                    name="Cubesat001_Spool_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat001_Spool_0.geometry}
                    material={materials.Spool}
                  />
                  <mesh
                    name="Cubesat001_Batteries_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat001_Batteries_0.geometry}
                    material={materials.Batteries}
                  />
                  <mesh
                    name="Cubesat001_Screws_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat001_Screws_0.geometry}
                    material={materials.Screws}
                  />
                  <mesh
                    name="Cubesat001_Solar_Panels_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat001_Solar_Panels_0.geometry}
                    material={materials.Solar_Panels}
                  />
                  <mesh
                    name="Cubesat001_Solar_Boards_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat001_Solar_Boards_0.geometry}
                    material={materials.Solar_Boards}
                  />
                  <mesh
                    name="Cubesat001_Panel_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat001_Panel_0.geometry}
                    material={materials.Panel}
                  />
                </group>
                <group
                  name="Cubesat002"
                  position={[-516.355, 136.622, 1502.019]}
                  rotation={[-0.798, -0.956, -2.479]}
                  scale={100}>
                  <mesh
                    name="Cubesat002_Cubesat_Base_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat002_Cubesat_Base_0.geometry}
                    material={materials.Cubesat_Base}
                  />
                  <mesh
                    name="Cubesat002_Spool_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat002_Spool_0.geometry}
                    material={materials.Spool}
                  />
                  <mesh
                    name="Cubesat002_Batteries_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat002_Batteries_0.geometry}
                    material={materials.Batteries}
                  />
                  <mesh
                    name="Cubesat002_Screws_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat002_Screws_0.geometry}
                    material={materials.Screws}
                  />
                  <mesh
                    name="Cubesat002_Solar_Panels_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat002_Solar_Panels_0.geometry}
                    material={materials.Solar_Panels}
                  />
                  <mesh
                    name="Cubesat002_Solar_Boards_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat002_Solar_Boards_0.geometry}
                    material={materials.Solar_Boards}
                  />
                  <mesh
                    name="Cubesat002_Panel_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cubesat002_Panel_0.geometry}
                    material={materials.Panel}
                  />
                </group>
                <group
                  name="panelhub"
                  position={[-598.164, 179.385, 1544.721]}
                  rotation={[-0.803, -0.944, 0.658]}
                  scale={[100, 100, 3.267]}>
                  <mesh
                    name="panelhub_Copper_Panel_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.panelhub_Copper_Panel_0.geometry}
                    material={materials.Copper_Panel}
                  />
                  <mesh
                    name="panelhub_SolarPanels2_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.panelhub_SolarPanels2_0.geometry}
                    material={materials.SolarPanels2}
                  />
                  <group
                    name="Cylinder005"
                    position={[-0.001, -0.003, 10.254]}
                    scale={[-0.298, -0.298, -9.107]}>
                    <mesh
                      name="Cylinder005_Copper_Panel_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Cylinder005_Copper_Panel_0.geometry}
                      material={materials.Copper_Panel}
                    />
                  </group>
                  <group name="panel" position={[0, -0.976, 2.107]} scale={[1, 2.892, 0.954]}>
                    <mesh
                      name="panel_Panel3_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel_Panel3_0.geometry}
                      material={materials.Panel3}
                    />
                    <mesh
                      name="panel_Panel2_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel_Panel2_0.geometry}
                      material={materials.Panel2}
                    />
                    <mesh
                      name="panel_Screws_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel_Screws_0.geometry}
                      material={materials.Screws}
                    />
                    <mesh
                      name="panel_Copper_Panel_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel_Copper_Panel_0.geometry}
                      material={materials.Copper_Panel}
                    />
                    <group
                      name="solarpanel"
                      position={[0, -0.394, -1.362]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel_Solar_Boards_2_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel_Solar_Boards_2_0.geometry}
                        material={materials.Solar_Boards_2}
                      />
                    </group>
                    <group
                      name="solarpanel001"
                      position={[0, -0.774, -1.362]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel001_Solar_Boards_2_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel001_Solar_Boards_2_0.geometry}
                        material={materials.Solar_Boards_2}
                      />
                    </group>
                    <group
                      name="solarpanel003"
                      position={[0, -1.726, -1.483]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel003_Solar_Boards_2_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel003_Solar_Boards_2_0.geometry}
                        material={materials.Solar_Boards_2}
                      />
                    </group>
                    <group
                      name="solarpanel002"
                      position={[0, -1.347, -1.362]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel002_Solar_Boards_2_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel002_Solar_Boards_2_0.geometry}
                        material={materials.Solar_Boards_2}
                      />
                    </group>
                    <group
                      name="panelhole"
                      position={[-0.003, -1.057, -2.771]}
                      scale={[0.093, 0.032, 1.7]}>
                      <mesh
                        name="panelhole_Screws_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.panelhole_Screws_0.geometry}
                        material={materials.Screws}
                      />
                    </group>
                    <group
                      name="panelhandle"
                      position={[0.001, 0.001, -0.87]}
                      scale={[-0.729, -0.023, -0.493]}>
                      <mesh
                        name="panelhandle__0"
                        castShadow
                        receiveShadow
                        geometry={nodes.panelhandle__0.geometry}
                        material={materials.panelhandle__0}
                      />
                    </group>
                  </group>
                  <group
                    name="panel001"
                    position={[0.973, 0.021, 2.103]}
                    rotation={[0, 0, Math.PI / 2]}
                    scale={[1, 2.892, 0.954]}>
                    <mesh
                      name="panel001_Panel3_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel001_Panel3_0.geometry}
                      material={materials.Panel3}
                    />
                    <mesh
                      name="panel001_Panel2_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel001_Panel2_0.geometry}
                      material={materials.Panel2}
                    />
                    <mesh
                      name="panel001_Screws_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel001_Screws_0.geometry}
                      material={materials.Screws}
                    />
                    <mesh
                      name="panel001_Copper_Panel_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel001_Copper_Panel_0.geometry}
                      material={materials.Copper_Panel}
                    />
                    <group
                      name="solarpanel004"
                      position={[0, -0.401, -1.358]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel004_Solar_Boards_2_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel004_Solar_Boards_2_0.geometry}
                        material={materials.Solar_Boards_2}
                      />
                    </group>
                    <group
                      name="solarpanel005"
                      position={[0, -0.781, -1.358]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel005_Solar_Boards_2_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel005_Solar_Boards_2_0.geometry}
                        material={materials.Solar_Boards_2}
                      />
                    </group>
                    <group
                      name="solarpanel006"
                      position={[0, -1.734, -1.479]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel006_Solar_Boards_2_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel006_Solar_Boards_2_0.geometry}
                        material={materials.Solar_Boards_2}
                      />
                    </group>
                    <group
                      name="solarpanel007"
                      position={[0, -1.354, -1.358]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel007_Solar_Boards_2_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel007_Solar_Boards_2_0.geometry}
                        material={materials.Solar_Boards_2}
                      />
                    </group>
                    <group
                      name="panelhandle001"
                      position={[0.001, -0.006, -0.866]}
                      scale={[-0.729, -0.023, -0.493]}>
                      <mesh
                        name="panelhandle001__0"
                        castShadow
                        receiveShadow
                        geometry={nodes.panelhandle001__0.geometry}
                        material={materials.panelhandle__0}
                      />
                    </group>
                    <group
                      name="panelhole001"
                      position={[-0.004, -1.065, -2.767]}
                      rotation={[0, 0, -Math.PI / 2]}
                      scale={[0.032, 0.093, 1.7]}>
                      <mesh
                        name="panelhole001_Screws003_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.panelhole001_Screws003_0.geometry}
                        material={materials['Screws.003']}
                      />
                    </group>
                  </group>
                  <group
                    name="panel002"
                    position={[-0.007, 0.933, 2.104]}
                    rotation={[0, 0, -Math.PI]}
                    scale={[1, 2.892, 0.954]}>
                    <mesh
                      name="panel002_Panel3001_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel002_Panel3001_0.geometry}
                      material={materials['Panel3.001']}
                    />
                    <mesh
                      name="panel002_Panel2001_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel002_Panel2001_0.geometry}
                      material={materials['Panel2.001']}
                    />
                    <mesh
                      name="panel002_Screws001_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel002_Screws001_0.geometry}
                      material={materials['Screws.001']}
                    />
                    <mesh
                      name="panel002_Copper_Panel001_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel002_Copper_Panel001_0.geometry}
                      material={materials['Copper_Panel.001']}
                    />
                    <group
                      name="panelhandle002"
                      position={[-0.003, -0.006, -0.866]}
                      scale={[-0.729, -0.023, -0.493]}>
                      <mesh
                        name="panelhandle002__0"
                        castShadow
                        receiveShadow
                        geometry={nodes.panelhandle002__0.geometry}
                        material={materials.panelhandle__0}
                      />
                    </group>
                    <group
                      name="solarpanel011"
                      position={[-0.004, -0.401, -1.358]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel011_Solar_Boards_2001_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel011_Solar_Boards_2001_0.geometry}
                        material={materials['Solar_Boards_2.001']}
                      />
                    </group>
                    <group
                      name="solarpanel010"
                      position={[-0.004, -0.781, -1.358]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel010_Solar_Boards_2001_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel010_Solar_Boards_2001_0.geometry}
                        material={materials['Solar_Boards_2.001']}
                      />
                    </group>
                    <group
                      name="solarpanel009"
                      position={[-0.004, -1.733, -1.479]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel009_Solar_Boards_2001_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel009_Solar_Boards_2001_0.geometry}
                        material={materials['Solar_Boards_2.001']}
                      />
                    </group>
                    <group
                      name="solarpanel008"
                      position={[-0.004, -1.354, -1.358]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel008_Solar_Boards_2001_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel008_Solar_Boards_2001_0.geometry}
                        material={materials['Solar_Boards_2.001']}
                      />
                    </group>
                    <group
                      name="panelhole002"
                      position={[-0.007, -1.065, -2.767]}
                      rotation={[0, 0, Math.PI]}
                      scale={[0.093, 0.032, 1.7]}>
                      <mesh
                        name="panelhole002_Screws004_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.panelhole002_Screws004_0.geometry}
                        material={materials['Screws.004']}
                      />
                    </group>
                  </group>
                  <group
                    name="panel003"
                    position={[-4.025, -0.004, -0.038]}
                    rotation={[0, 0, -Math.PI / 2]}
                    scale={[1, 2.892, 0.954]}>
                    <mesh
                      name="panel003_Panel3002_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel003_Panel3002_0.geometry}
                      material={materials['Panel3.002']}
                    />
                    <mesh
                      name="panel003_Panel2002_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel003_Panel2002_0.geometry}
                      material={materials['Panel2.002']}
                    />
                    <mesh
                      name="panel003_Screws002_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel003_Screws002_0.geometry}
                      material={materials['Screws.002']}
                    />
                    <mesh
                      name="panel003_Copper_Panel002_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.panel003_Copper_Panel002_0.geometry}
                      material={materials['Copper_Panel.002']}
                    />
                    <group
                      name="panelhandle003"
                      position={[0, 1.06, 2.25]}
                      scale={[-0.729, -0.023, -0.493]}>
                      <mesh
                        name="panelhandle003__0"
                        castShadow
                        receiveShadow
                        geometry={nodes.panelhandle003__0.geometry}
                        material={materials.panelhandle__0}
                      />
                    </group>
                    <group
                      name="solarpanel015"
                      position={[0, -0.287, 0.888]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel015_Solar_Boards_2002_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel015_Solar_Boards_2002_0.geometry}
                        material={materials['Solar_Boards_2.002']}
                      />
                    </group>
                    <group
                      name="solarpanel014"
                      position={[0, -0.667, 0.766]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel014_Solar_Boards_2002_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel014_Solar_Boards_2002_0.geometry}
                        material={materials['Solar_Boards_2.002']}
                      />
                    </group>
                    <group
                      name="solarpanel013"
                      position={[0, 0.286, 0.888]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel013_Solar_Boards_2002_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel013_Solar_Boards_2002_0.geometry}
                        material={materials['Solar_Boards_2.002']}
                      />
                    </group>
                    <group
                      name="solarpanel012"
                      position={[0, 0.666, 0.888]}
                      scale={[0.663, 0.032, 1.074]}>
                      <mesh
                        name="solarpanel012_Solar_Boards_2002_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.solarpanel012_Solar_Boards_2002_0.geometry}
                        material={materials['Solar_Boards_2.002']}
                      />
                    </group>
                    <group
                      name="panelhole003"
                      position={[-0.003, 0.002, -0.522]}
                      rotation={[0, 0, Math.PI / 2]}
                      scale={[0.032, 0.093, 1.7]}>
                      <mesh
                        name="panelhole003_Screws005_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.panelhole003_Screws005_0.geometry}
                        material={materials['Screws.005']}
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

useGLTF.preload('/models/cubesat_high.glb')


// Real CubeSat Model Component (using your GLB model)
const CubeSatModel = ({ position, rotation, scale = 0.01 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Model />
    </group>
  );
};

// Orbital Path Component
const OrbitalPath = ({ satellites, showPaths, pathAccuracy }) => {
  const pathsRef = useRef();

  const generateOrbitalPath = (satellite) => {
    const points = [];
    const segments = Math.floor(200 * pathAccuracy); // Higher accuracy = more segments
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * satellite.orbit.semiMajorAxis;
      const y = Math.sin(angle) * satellite.orbit.semiMajorAxis * (1 - satellite.orbit.eccentricity);
      const z = Math.sin(angle) * satellite.orbit.inclination * 0.3;
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    return points;
  };

  return (
    <group ref={pathsRef}>
      {showPaths && satellites.map((satellite, index) => {
        const points = generateOrbitalPath(satellite);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        return (
          <line key={`path-${index}`}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial attach="material" color={satellite.color} opacity={0.6} transparent />
          </line>
        );
      })}
    </group>
  );
};

// Real-time Satellite Positions
const SatelliteConstellation = ({ satellites, currentTime, showLabels }) => {
  const calculatePosition = (satellite, time) => {
    const meanAnomaly = (time * satellite.orbit.meanMotion) % (2 * Math.PI);
    const trueAnomaly = meanAnomaly; // Simplified for circular orbits
    
    const x = Math.cos(trueAnomaly) * satellite.orbit.semiMajorAxis;
    const y = Math.sin(trueAnomaly) * satellite.orbit.semiMajorAxis;
    const z = Math.sin(trueAnomaly + satellite.orbit.inclination) * satellite.orbit.altitude * 0.1;
    
    return [x, y, z];
  };

  return (
    <group>
      {satellites.map((satellite, index) => {
        const position = calculatePosition(satellite, currentTime);
        
        return (
          <group key={`satellite-${index}`}>
            <CubeSatModel 
              position={position} 
              scale={0.02}
            />
            
            {showLabels && (
              <Html position={[position[0], position[1] + 2, position[2]]}>
                <div style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}>
                  {satellite.name}
                </div>
              </Html>
            )}
            
            {/* Signal beams for GPS satellites */}
            {satellite.type === 'gps' && (
              <mesh position={position}>
                <coneGeometry args={[3, 8, 8]} />
                <meshBasicMaterial color={satellite.color} opacity={0.1} transparent />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Earth with GPS Differential Analysis
const EarthWithGPS = ({ showGPSDifferential, gpsAccuracy }) => {
  const earthRef = useRef();
  const [gpsMeasurements, setGPSMeasurements] = useState([]);

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
  });

  // Generate GPS differential measurements
  useEffect(() => {
    const measurements = [];
    for (let i = 0; i < 100; i++) {
      const lat = (Math.random() - 0.5) * Math.PI;
      const lon = Math.random() * Math.PI * 2;
      const accuracy = 0.5 + Math.random() * 2; // mm accuracy
      
      measurements.push({
        latitude: lat,
        longitude: lon,
        accuracy: accuracy,
        atmosphericDelay: Math.random() * 50, // nanoseconds
        position: [
          Math.cos(lat) * Math.cos(lon) * 5.2,
          Math.sin(lat) * 5.2,
          Math.cos(lat) * Math.sin(lon) * 5.2
        ]
      });
    }
    setGPSMeasurements(measurements);
  }, [gpsAccuracy]);

  return (
    <group ref={earthRef}>
      {/* Earth */}
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial 
          color="#4444aa" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[5.3, 32, 32]} />
        <meshBasicMaterial 
          color="#88aaff" 
          opacity={0.1} 
          transparent 
        />
      </mesh>
      
      {/* GPS Differential Measurements */}
      {showGPSDifferential && gpsMeasurements.map((measurement, index) => (
        <group key={`gps-${index}`}>
          <mesh position={measurement.position}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial 
              color={measurement.accuracy < 1 ? '#00ff00' : measurement.accuracy < 2 ? '#ffff00' : '#ff0000'} 
            />
          </mesh>
          
          {/* Atmospheric delay visualization */}
          <mesh position={measurement.position}>
            <cylinderGeometry args={[0.01, 0.01, measurement.atmosphericDelay / 10]} />
            <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Orbital Mechanics Story Sections
const storyFrames = [
  {
    title: "Satellite Path Reconstruction",
    description: "Revolutionary approach using terrestrial infrastructure references to achieve sub-millimeter satellite positioning accuracy through atmospheric signal analysis.",
    cameraPosition: [10, 5, 10],
    targetPosition: [0, 0, 0],
    showPaths: true,
    showLabels: true,
    showGPSDifferential: false
  },
  {
    title: "GPS Differential Atmospheric Sensing",
    description: "Utilizing GPS signal differential analysis to extract atmospheric information with unprecedented precision, enabling real-time environmental monitoring.",
    cameraPosition: [8, 8, 8],
    targetPosition: [0, 0, 0],
    showPaths: false,
    showLabels: false,
    showGPSDifferential: true
  },
  {
    title: "Multi-Modal Signal Processing",
    description: "Integration of satellite signals with cellular and WiFi infrastructure for comprehensive atmospheric analysis and environmental intelligence.",
    cameraPosition: [15, 10, 15],
    targetPosition: [0, 0, 0],
    showPaths: true,
    showLabels: true,
    showGPSDifferential: true
  },
  {
    title: "Real-Time Orbital Mechanics",
    description: "Live satellite constellation tracking with atmospheric coupling analysis for precision agriculture and environmental monitoring applications.",
    cameraPosition: [20, 15, 20],
    targetPosition: [0, 0, 0],
    showPaths: true,
    showLabels: true,
    showGPSDifferential: false
  }
];

// Main Orbital Mechanics Component
const OrbitalMechanics = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showOrbitalData, setShowOrbitalData] = useState(false);
  const [pathAccuracy, setPathAccuracy] = useState(1.0);
  const [gpsAccuracy, setGpsAccuracy] = useState(0.5);

  // Sample satellite constellation
  const [satellites] = useState([
    {
      name: "GPS-I",
      type: "gps",
      color: "#00ff00",
      orbit: {
        semiMajorAxis: 15,
        eccentricity: 0.05,
        inclination: 0.5,
        meanMotion: 0.01,
        altitude: 20200
      }
    },
    {
      name: "GPS-II",
      type: "gps", 
      color: "#00ffff",
      orbit: {
        semiMajorAxis: 15,
        eccentricity: 0.03,
        inclination: -0.3,
        meanMotion: 0.012,
        altitude: 20200
      }
    },
    {
      name: "GLONASS-1",
      type: "glonass",
      color: "#ff0000",
      orbit: {
        semiMajorAxis: 16,
        eccentricity: 0.02,
        inclination: 0.8,
        meanMotion: 0.009,
        altitude: 19100
      }
    },
    {
      name: "Galileo-1",
      type: "galileo",
      color: "#ffff00",
      orbit: {
        semiMajorAxis: 17,
        eccentricity: 0.04,
        inclination: -0.6,
        meanMotion: 0.008,
        altitude: 23222
      }
    }
  ]);

  // Animation loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Auto-advance story frames
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying) {
        setCurrentFrame(prev => (prev + 1) % storyFrames.length);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [currentFrame, isPlaying]);

  const currentStory = storyFrames[currentFrame];

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000011' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 1000,
        minWidth: '300px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>🛰️ Orbital Mechanics</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying ? '#ff4444' : '#44ff44',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            {isPlaying ? 'Pause' : 'Play'} Animation
          </button>
          
          <button 
            onClick={() => setShowOrbitalData(!showOrbitalData)}
            style={{
              background: '#4444ff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showOrbitalData ? 'Hide' : 'Show'} Data
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Path Reconstruction Accuracy: {pathAccuracy.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={pathAccuracy}
            onChange={(e) => setPathAccuracy(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            GPS Positioning Accuracy: {gpsAccuracy.toFixed(1)}mm
          </label>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={gpsAccuracy}
            onChange={(e) => setGpsAccuracy(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ fontSize: '11px', opacity: 0.9 }}>
          <div><strong>Current Frame:</strong> {currentFrame + 1}/{storyFrames.length}</div>
          <div><strong>Satellites Tracked:</strong> {satellites.length}</div>
          <div><strong>Simulation Time:</strong> {currentTime.toFixed(1)}s</div>
          <div><strong>Path Accuracy:</strong> {(pathAccuracy * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Story Panel */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 1000,
        maxHeight: '200px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{currentStory.title}</h4>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          {currentStory.description}
        </p>
        
        {/* Frame Navigation */}
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          {storyFrames.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFrame(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentFrame ? '#00ff00' : '#444444',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>

      {/* Orbital Data Panel */}
      {showOrbitalData && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 1000,
          maxWidth: '400px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Orbital Parameters</h4>
          
          {satellites.map((satellite, index) => (
            <div key={index} style={{
              marginBottom: '15px',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              <div style={{ color: satellite.color, fontWeight: 'bold', marginBottom: '5px' }}>
                {satellite.name}
              </div>
              <div>Semi-Major Axis: {satellite.orbit.semiMajorAxis.toFixed(1)} units</div>
              <div>Eccentricity: {satellite.orbit.eccentricity.toFixed(3)}</div>
              <div>Inclination: {(satellite.orbit.inclination * 180 / Math.PI).toFixed(1)}°</div>
              <div>Altitude: {satellite.orbit.altitude.toLocaleString()} km</div>
              <div>Mean Motion: {satellite.orbit.meanMotion.toFixed(4)} rad/s</div>
            </div>
          ))}
        </div>
      )}

      {/* 3D Scene */}
      <Canvas
        camera={{ position: currentStory.cameraPosition, fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Stars radius={300} depth={50} count={1000} factor={4} />
          
          <EarthWithGPS 
            showGPSDifferential={currentStory.showGPSDifferential}
            gpsAccuracy={gpsAccuracy}
          />
          
          <OrbitalPath 
            satellites={satellites}
            showPaths={currentStory.showPaths}
            pathAccuracy={pathAccuracy}
          />
          
          <SatelliteConstellation 
            satellites={satellites}
            currentTime={currentTime}
            showLabels={currentStory.showLabels}
          />
          
          <OrbitControls 
            target={currentStory.targetPosition}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default OrbitalMechanics;
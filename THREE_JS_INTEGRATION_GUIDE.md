# Three.js Integration Guide for Buhera-West Environmental Intelligence Platform

## Overview

This guide provides detailed instructions for implementing advanced Three.js visualization features in the Buhera-West platform using React Three Fiber. The examples are adapted from Threebox HTML implementations to work within our unified environmental intelligence system.

## Table of Contents

1. [3D Extrusions and Geometric Shapes](#3d-extrusions-and-geometric-shapes)
2. [Camera Alignment and 3D Model Positioning](#camera-alignment-and-3d-model-positioning)
3. [Object Selection and Raycasting](#object-selection-and-raycasting)
4. [3D Building Visualization](#3d-building-visualization)
5. [Solar Lighting and Shadow Systems](#solar-lighting-and-shadow-systems)
6. [Integration with Buhera-West Architecture](#integration-with-buhera-west-architecture)

---

## 1. 3D Extrusions and Geometric Shapes

### Overview
Based on `18-extrusions.html`, this section covers creating 3D extruded shapes for geological formations, agricultural field boundaries, and atmospheric volume visualization.

### Implementation in React Three Fiber

#### 1.1 Basic Extrusion Component

```typescript
// src/components/extrusions/ExtrusionVisualization.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ExtrudeGeometry, Shape, Vector2, MeshLambertMaterial } from 'three';

interface ExtrusionVisualizationProps {
  points: Vector2[];
  depth: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  materials?: MeshLambertMaterial[];
  animated?: boolean;
}

export const ExtrusionVisualization: React.FC<ExtrusionVisualizationProps> = ({
  points,
  depth,
  position,
  rotation = [0, 0, 0],
  materials,
  animated = false
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create extruded geometry from points
  const geometry = useMemo(() => {
    const shape = new Shape();
    if (points.length > 0) {
      shape.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].y);
      }
      shape.closePath();
    }
    
    return new ExtrudeGeometry(shape, {
      depth: depth,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 4,
      bevelSegments: 1
    });
  }, [points, depth]);
  
  // Animation loop for rotating extrusions
  useFrame((state) => {
    if (meshRef.current && animated) {
      meshRef.current.rotation.z += 0.01;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      rotation={rotation}
    >
      {materials ? (
        materials.map((material, index) => (
          <primitive key={index} object={material} attach={`material-${index}`} />
        ))
      ) : (
        <meshLambertMaterial color={0xb00000} />
      )}
    </mesh>
  );
};
```

#### 1.2 Agricultural Field Extrusion

```typescript
// src/components/agricultural/AgriculturalFieldExtrusion.tsx
import React from 'react';
import { Vector2 } from 'three';
import { ExtrusionVisualization } from '../extrusions/ExtrusionVisualization';

interface AgriculturalFieldExtrusionProps {
  fieldBoundaries: [number, number][];
  soilDepth: number;
  position: [number, number, number];
  cropType: 'maize' | 'wheat' | 'sorghum';
}

export const AgriculturalFieldExtrusion: React.FC<AgriculturalFieldExtrusionProps> = ({
  fieldBoundaries,
  soilDepth,
  position,
  cropType
}) => {
  // Convert field boundaries to Vector2 points
  const points = fieldBoundaries.map(([x, y]) => new Vector2(x, y));
  
  // Crop-specific colors
  const cropColors = {
    maize: 0x4CAF50,    // Green
    wheat: 0xFFC107,    // Amber
    sorghum: 0x8BC34A   // Light Green
  };
  
  return (
    <ExtrusionVisualization
      points={points}
      depth={soilDepth}
      position={position}
      materials={[
        new THREE.MeshLambertMaterial({ color: cropColors[cropType] }),
        new THREE.MeshLambertMaterial({ color: 0x8D6E63 }) // Brown for soil
      ]}
    />
  );
};
```

#### 1.3 Geological Formation Extrusion

```typescript
// src/components/geological/GeologicalFormationExtrusion.tsx
import React from 'react';
import { Vector2 } from 'three';
import { ExtrusionVisualization } from '../extrusions/ExtrusionVisualization';

interface GeologicalFormationExtrusionProps {
  formationBoundaries: [number, number][];
  depth: number;
  position: [number, number, number];
  mineralType: 'gold' | 'copper' | 'iron' | 'diamond';
}

export const GeologicalFormationExtrusion: React.FC<GeologicalFormationExtrusionProps> = ({
  formationBoundaries,
  depth,
  position,
  mineralType
}) => {
  const points = formationBoundaries.map(([x, y]) => new Vector2(x, y));
  
  const mineralColors = {
    gold: 0xFFD700,     // Gold
    copper: 0xB87333,   // Copper
    iron: 0x808080,     // Gray
    diamond: 0xE8E8E8   // Light Gray
  };
  
  return (
    <ExtrusionVisualization
      points={points}
      depth={depth}
      position={position}
      materials={[
        new THREE.MeshLambertMaterial({ color: mineralColors[mineralType] }),
        new THREE.MeshLambertMaterial({ color: 0x654321 }) // Brown for rock
      ]}
    />
  );
};
```

---

## 2. Camera Alignment and 3D Model Positioning

### Overview
Based on `07-alignmentTest.html`, this section covers precise camera alignment between different 3D objects and models within the environmental intelligence system.

### Implementation in React Three Fiber

#### 2.1 Camera Alignment System

```typescript
// src/components/camera/CameraAlignment.tsx
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';

interface CameraAlignmentProps {
  targetPosition: [number, number, number];
  alignmentMode: 'geological' | 'agricultural' | 'solar' | 'oceanic';
  autoRotate?: boolean;
  rotationSpeed?: number;
}

export const CameraAlignment: React.FC<CameraAlignmentProps> = ({
  targetPosition,
  alignmentMode,
  autoRotate = false,
  rotationSpeed = 0.01
}) => {
  const { camera } = useThree();
  const targetRef = useRef(new Vector3(...targetPosition));
  
  // Alignment configurations for different environmental domains
  const alignmentConfigs = {
    geological: {
      position: [0, 50, 100],
      fov: 60,
      near: 0.1,
      far: 10000
    },
    agricultural: {
      position: [0, 30, 80],
      fov: 45,
      near: 0.1,
      far: 5000
    },
    solar: {
      position: [0, 100, 200],
      fov: 75,
      near: 1,
      far: 50000
    },
    oceanic: {
      position: [0, 20, 60],
      fov: 55,
      near: 0.1,
      far: 8000
    }
  };
  
  useEffect(() => {
    const config = alignmentConfigs[alignmentMode];
    if (camera instanceof PerspectiveCamera) {
      camera.position.set(...config.position);
      camera.fov = config.fov;
      camera.near = config.near;
      camera.far = config.far;
      camera.updateProjectionMatrix();
      camera.lookAt(targetRef.current);
    }
  }, [camera, alignmentMode]);
  
  useFrame(() => {
    if (autoRotate && camera) {
      const time = Date.now() * rotationSpeed;
      const config = alignmentConfigs[alignmentMode];
      camera.position.x = Math.cos(time) * config.position[2];
      camera.position.z = Math.sin(time) * config.position[2];
      camera.lookAt(targetRef.current);
    }
  });
  
  return null;
};
```

#### 2.2 3D Model Positioning System

```typescript
// src/components/models/ModelPositioningSystem.tsx
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

interface ModelPositioningSystemProps {
  modelPath: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  anchor: 'center' | 'bottom' | 'top';
  domain: 'geological' | 'agricultural' | 'solar' | 'oceanic';
}

export const ModelPositioningSystem: React.FC<ModelPositioningSystemProps> = ({
  modelPath,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  anchor,
  domain
}) => {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<Group>(null);
  
  // Domain-specific positioning adjustments
  const domainAdjustments = {
    geological: { y: 0 },
    agricultural: { y: -1 },
    solar: { y: 100 },
    oceanic: { y: -5 }
  };
  
  useEffect(() => {
    if (groupRef.current) {
      const adjustment = domainAdjustments[domain];
      const adjustedPosition = new Vector3(
        position[0],
        position[1] + adjustment.y,
        position[2]
      );
      
      groupRef.current.position.copy(adjustedPosition);
      groupRef.current.rotation.set(...rotation);
      groupRef.current.scale.setScalar(scale);
      
      // Anchor adjustment
      if (anchor === 'center') {
        const box = new THREE.Box3().setFromObject(groupRef.current);
        const center = box.getCenter(new Vector3());
        groupRef.current.position.sub(center);
      }
    }
  }, [position, rotation, scale, anchor, domain]);
  
  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
};
```

#### 2.3 Tube and Line Visualization

```typescript
// src/components/visualization/TubeVisualization.tsx
import React, { useMemo } from 'react';
import { TubeGeometry, CatmullRomCurve3, Vector3 } from 'three';

interface TubeVisualizationProps {
  points: [number, number, number][];
  radius: number;
  segments: number;
  color: string;
  opacity?: number;
}

export const TubeVisualization: React.FC<TubeVisualizationProps> = ({
  points,
  radius,
  segments,
  color,
  opacity = 1
}) => {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3(
      points.map(([x, y, z]) => new Vector3(x, y, z))
    );
    return new TubeGeometry(curve, segments, radius, 8, false);
  }, [points, radius, segments]);
  
  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
```

---

## 3. Object Selection and Raycasting

### Overview
Based on `09-raycaster.html`, this section implements interactive object selection and manipulation for environmental data visualization.

### Implementation in React Three Fiber

#### 3.1 Raycasting Selection System

```typescript
// src/components/interaction/RaycastingSelection.tsx
import React, { useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Raycaster, Vector2, Object3D } from 'three';

interface RaycastingSelectionProps {
  enableSelection?: boolean;
  enableDragging?: boolean;
  enableRotation?: boolean;
  onObjectSelect?: (object: Object3D | null) => void;
  children: React.ReactNode;
}

export const RaycastingSelection: React.FC<RaycastingSelectionProps> = ({
  enableSelection = true,
  enableDragging = true,
  enableRotation = true,
  onObjectSelect,
  children
}) => {
  const { camera, scene, gl } = useThree();
  const [selectedObject, setSelectedObject] = useState<Object3D | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  
  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!enableSelection) return;
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      setSelectedObject(object);
      setIsDragging(true);
      onObjectSelect?.(object);
    } else {
      setSelectedObject(null);
      onObjectSelect?.(null);
    }
  }, [camera, scene, gl, enableSelection, onObjectSelect]);
  
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDragging || !selectedObject || !enableDragging) return;
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects([selectedObject], true);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      selectedObject.position.copy(point);
    }
  }, [isDragging, selectedObject, enableDragging, camera, gl]);
  
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  React.useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, gl]);
  
  return <>{children}</>;
};
```

#### 3.2 Interactive Environmental Objects

```typescript
// src/components/interaction/InteractiveEnvironmentalObject.tsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, BoxGeometry, SphereGeometry, MeshPhysicalMaterial } from 'three';

interface InteractiveEnvironmentalObjectProps {
  type: 'cube' | 'sphere';
  position: [number, number, number];
  size: number;
  color: string;
  domain: 'geological' | 'agricultural' | 'solar' | 'oceanic';
  tooltip?: string;
  onSelect?: () => void;
}

export const InteractiveEnvironmentalObject: React.FC<InteractiveEnvironmentalObjectProps> = ({
  type,
  position,
  size,
  color,
  domain,
  tooltip,
  onSelect
}) => {
  const meshRef = useRef<Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  
  const geometry = type === 'cube' 
    ? new BoxGeometry(size, size, size)
    : new SphereGeometry(size, 32, 16);
  
  const material = new MeshPhysicalMaterial({
    color: color,
    transparent: true,
    opacity: isHovered ? 0.8 : 0.6,
    roughness: 0.1,
    metalness: 0.1
  });
  
  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={() => {
        setIsSelected(!isSelected);
        onSelect?.();
      }}
    >
      {tooltip && (
        <Html distanceFactor={10}>
          <div className="tooltip">{tooltip}</div>
        </Html>
      )}
    </mesh>
  );
};
```

---

## 4. 3D Building Visualization

### Overview
Based on `08-3dbuildings.html`, this section covers creating 3D building visualizations with interactive tooltips and selection capabilities.

### Implementation in React Three Fiber

#### 4.1 Building Visualization System

```typescript
// src/components/buildings/BuildingVisualization.tsx
import React, { useState, useCallback } from 'react';
import { ExtrudeGeometry, Shape, Vector2 } from 'three';

interface BuildingData {
  id: string;
  coordinates: [number, number][];
  height: number;
  baseHeight: number;
  properties: {
    name?: string;
    type?: string;
    use?: string;
  };
}

interface BuildingVisualizationProps {
  buildings: BuildingData[];
  enableTooltips?: boolean;
  enableSelection?: boolean;
  onBuildingSelect?: (building: BuildingData) => void;
}

export const BuildingVisualization: React.FC<BuildingVisualizationProps> = ({
  buildings,
  enableTooltips = true,
  enableSelection = true,
  onBuildingSelect
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  
  const handleBuildingClick = useCallback((building: BuildingData) => {
    if (enableSelection) {
      setSelectedBuilding(building.id);
      onBuildingSelect?.(building);
    }
  }, [enableSelection, onBuildingSelect]);
  
  return (
    <group>
      {buildings.map((building) => (
        <Building3D
          key={building.id}
          building={building}
          isSelected={selectedBuilding === building.id}
          isHovered={hoveredBuilding === building.id}
          onSelect={() => handleBuildingClick(building)}
          onHover={() => setHoveredBuilding(building.id)}
          onUnhover={() => setHoveredBuilding(null)}
          enableTooltips={enableTooltips}
        />
      ))}
    </group>
  );
};

interface Building3DProps {
  building: BuildingData;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onUnhover: () => void;
  enableTooltips: boolean;
}

const Building3D: React.FC<Building3DProps> = ({
  building,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onUnhover,
  enableTooltips
}) => {
  const geometry = useMemo(() => {
    const shape = new Shape();
    if (building.coordinates.length > 0) {
      shape.moveTo(building.coordinates[0][0], building.coordinates[0][1]);
      for (let i = 1; i < building.coordinates.length; i++) {
        shape.lineTo(building.coordinates[i][0], building.coordinates[i][1]);
      }
      shape.closePath();
    }
    
    return new ExtrudeGeometry(shape, {
      depth: building.height - building.baseHeight,
      bevelEnabled: false
    });
  }, [building.coordinates, building.height, building.baseHeight]);
  
  const getColor = () => {
    if (isSelected) return 'lightgreen';
    if (isHovered) return 'lightblue';
    return '#aaa';
  };
  
  return (
    <mesh
      geometry={geometry}
      position={[0, 0, building.baseHeight]}
      onClick={onSelect}
      onPointerOver={onHover}
      onPointerOut={onUnhover}
    >
      <meshLambertMaterial
        color={getColor()}
        transparent
        opacity={0.9}
      />
      {enableTooltips && (isHovered || isSelected) && (
        <Html distanceFactor={10}>
          <div className="building-tooltip">
            <strong>{building.properties.name || building.id}</strong>
            <br />
            Type: {building.properties.type || 'Unknown'}
            <br />
            Height: {building.height}m
          </div>
        </Html>
      )}
    </mesh>
  );
};
```

#### 4.2 Agricultural Building Integration

```typescript
// src/components/agricultural/AgriculturalBuildings.tsx
import React from 'react';
import { BuildingVisualization } from '../buildings/BuildingVisualization';

interface AgriculturalBuildingsProps {
  region: 'buhera' | 'zimbabwe' | 'southern-africa';
}

export const AgriculturalBuildings: React.FC<AgriculturalBuildingsProps> = ({
  region
}) => {
  // Sample agricultural buildings data
  const buildings = [
    {
      id: 'storage-1',
      coordinates: [
        [0, 0], [20, 0], [20, 15], [0, 15]
      ],
      height: 8,
      baseHeight: 0,
      properties: {
        name: 'Grain Storage Facility',
        type: 'storage',
        use: 'grain-storage'
      }
    },
    {
      id: 'processing-1',
      coordinates: [
        [25, 0], [50, 0], [50, 25], [25, 25]
      ],
      height: 12,
      baseHeight: 0,
      properties: {
        name: 'Processing Plant',
        type: 'processing',
        use: 'crop-processing'
      }
    }
  ];
  
  const handleBuildingSelect = (building: any) => {
    console.log('Selected agricultural building:', building);
    // Integrate with agricultural optimization systems
  };
  
  return (
    <BuildingVisualization
      buildings={buildings}
      enableTooltips={true}
      enableSelection={true}
      onBuildingSelect={handleBuildingSelect}
    />
  );
};
```

---

## 5. Solar Lighting and Shadow Systems

### Overview
Based on `14-buildingshadow.html`, this section implements dynamic solar lighting and shadow systems for realistic environmental visualization.

### Implementation in React Three Fiber

#### 5.1 Solar Lighting System

```typescript
// src/components/solar/SolarLightingSystem.tsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { DirectionalLight, AmbientLight, Vector3 } from 'three';

interface SolarLightingSystemProps {
  date: Date;
  latitude: number;
  longitude: number;
  timezone: string;
  intensity?: number;
  enableShadows?: boolean;
}

export const SolarLightingSystem: React.FC<SolarLightingSystemProps> = ({
  date,
  latitude,
  longitude,
  timezone,
  intensity = 1,
  enableShadows = true
}) => {
  const directionalLightRef = useRef<DirectionalLight>(null);
  const ambientLightRef = useRef<AmbientLight>(null);
  
  // Calculate sun position based on date and location
  const calculateSunPosition = (date: Date, lat: number, lon: number) => {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const hour = date.getHours() + date.getMinutes() / 60;
    
    // Solar declination
    const declination = 23.45 * Math.sin(Math.PI * (284 + dayOfYear) / 365) * Math.PI / 180;
    
    // Hour angle
    const hourAngle = (hour - 12) * 15 * Math.PI / 180;
    
    // Solar elevation
    const elevation = Math.asin(
      Math.sin(lat * Math.PI / 180) * Math.sin(declination) +
      Math.cos(lat * Math.PI / 180) * Math.cos(declination) * Math.cos(hourAngle)
    );
    
    // Solar azimuth
    const azimuth = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(lat * Math.PI / 180) - Math.tan(declination) * Math.cos(lat * Math.PI / 180)
    );
    
    return {
      elevation: elevation * 180 / Math.PI,
      azimuth: azimuth * 180 / Math.PI
    };
  };
  
  useFrame(() => {
    if (directionalLightRef.current && ambientLightRef.current) {
      const sunPosition = calculateSunPosition(date, latitude, longitude);
      
      // Convert spherical coordinates to Cartesian
      const distance = 1000;
      const x = distance * Math.cos(sunPosition.elevation * Math.PI / 180) * Math.sin(sunPosition.azimuth * Math.PI / 180);
      const y = distance * Math.sin(sunPosition.elevation * Math.PI / 180);
      const z = distance * Math.cos(sunPosition.elevation * Math.PI / 180) * Math.cos(sunPosition.azimuth * Math.PI / 180);
      
      directionalLightRef.current.position.set(x, y, z);
      directionalLightRef.current.lookAt(0, 0, 0);
      
      // Adjust intensity based on sun elevation
      const elevationIntensity = Math.max(0, Math.sin(sunPosition.elevation * Math.PI / 180));
      directionalLightRef.current.intensity = intensity * elevationIntensity;
      ambientLightRef.current.intensity = 0.2 * elevationIntensity + 0.1;
      
      // Adjust color based on time of day
      const sunsetIntensity = Math.max(0, 1 - Math.abs(sunPosition.elevation - 0) / 30);
      const r = 1;
      const g = 1 - sunsetIntensity * 0.3;
      const b = 1 - sunsetIntensity * 0.7;
      
      directionalLightRef.current.color.setRGB(r, g, b);
    }
  });
  
  return (
    <>
      <directionalLight
        ref={directionalLightRef}
        intensity={intensity}
        castShadow={enableShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={5000}
        shadow-camera-left={-1000}
        shadow-camera-right={1000}
        shadow-camera-top={1000}
        shadow-camera-bottom={-1000}
      />
      <ambientLight ref={ambientLightRef} intensity={0.3} />
    </>
  );
};
```

#### 5.2 Shadow System for Buildings and Objects

```typescript
// src/components/shadows/ShadowSystem.tsx
import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PCFShadowMap, VSMShadowMap } from 'three';

interface ShadowSystemProps {
  shadowType?: 'pcf' | 'vsm';
  shadowMapSize?: number;
  children: React.ReactNode;
}

export const ShadowSystem: React.FC<ShadowSystemProps> = ({
  shadowType = 'pcf',
  shadowMapSize = 2048,
  children
}) => {
  const { gl } = useThree();
  
  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = shadowType === 'pcf' ? PCFShadowMap : VSMShadowMap;
    gl.shadowMap.autoUpdate = true;
  }, [gl, shadowType]);
  
  return <>{children}</>;
};
```

#### 5.3 Time-Based Environment Control

```typescript
// src/components/environment/TimeBasedEnvironment.tsx
import React, { useState, useEffect } from 'react';
import { SolarLightingSystem } from '../solar/SolarLightingSystem';

interface TimeBasedEnvironmentProps {
  initialDate?: Date;
  latitude: number;
  longitude: number;
  timezone: string;
  timeSpeed?: number; // Multiplier for time progression
  autoProgress?: boolean;
}

export const TimeBasedEnvironment: React.FC<TimeBasedEnvironmentProps> = ({
  initialDate = new Date(),
  latitude,
  longitude,
  timezone,
  timeSpeed = 1,
  autoProgress = false
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [backgroundStyle, setBackgroundStyle] = useState('day');
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoProgress) {
      interval = setInterval(() => {
        setCurrentDate(prev => new Date(prev.getTime() + 60000 * timeSpeed));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoProgress, timeSpeed]);
  
  // Determine day/night style
  useEffect(() => {
    const hour = currentDate.getHours();
    const isDaytime = hour >= 6 && hour < 18;
    setBackgroundStyle(isDaytime ? 'day' : 'night');
  }, [currentDate]);
  
  return (
    <>
      <SolarLightingSystem
        date={currentDate}
        latitude={latitude}
        longitude={longitude}
        timezone={timezone}
        enableShadows={true}
      />
      <color
        attach="background"
        args={[backgroundStyle === 'day' ? '#87CEEB' : '#191970']}
      />
      <fog
        attach="fog"
        args={[
          backgroundStyle === 'day' ? '#87CEEB' : '#191970',
          1000,
          5000
        ]}
      />
    </>
  );
};
```

---

## 6. Integration with Buhera-West Architecture

### Overview
This section explains how to integrate all the above components into the existing Buhera-West environmental intelligence system.

### 6.1 Main Environmental Scene

```typescript
// src/components/EnvironmentalIntelligenceScene.tsx
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Html } from '@react-three/drei';
import { SolarLightingSystem } from './solar/SolarLightingSystem';
import { RaycastingSelection } from './interaction/RaycastingSelection';
import { CameraAlignment } from './camera/CameraAlignment';
import { BuildingVisualization } from './buildings/BuildingVisualization';
import { AgriculturalFieldExtrusion } from './agricultural/AgriculturalFieldExtrusion';
import { GeologicalFormationExtrusion } from './geological/GeologicalFormationExtrusion';
import { ShadowSystem } from './shadows/ShadowSystem';
import { TimeBasedEnvironment } from './environment/TimeBasedEnvironment';

// Buhera-West coordinates
const BUHERA_COORDINATES = {
  latitude: -19.260799284567543,
  longitude: 31.499455719488008,
  timezone: 'Africa/Harare'
};

export const EnvironmentalIntelligenceScene: React.FC = () => {
  const [currentDomain, setCurrentDomain] = useState<'geological' | 'agricultural' | 'solar' | 'oceanic'>('agricultural');
  const [selectedObject, setSelectedObject] = useState(null);
  
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        camera={{
          position: [0, 50, 100],
          fov: 60,
          near: 0.1,
          far: 10000
        }}
        shadows
      >
        <ShadowSystem shadowType="pcf" shadowMapSize={2048}>
          <TimeBasedEnvironment
            latitude={BUHERA_COORDINATES.latitude}
            longitude={BUHERA_COORDINATES.longitude}
            timezone={BUHERA_COORDINATES.timezone}
            autoProgress={true}
            timeSpeed={10}
          />
          
          <CameraAlignment
            targetPosition={[0, 0, 0]}
            alignmentMode={currentDomain}
            autoRotate={false}
          />
          
          <RaycastingSelection
            enableSelection={true}
            enableDragging={true}
            enableRotation={true}
            onObjectSelect={setSelectedObject}
          >
            {/* Agricultural Components */}
            <AgriculturalFieldExtrusion
              fieldBoundaries={[
                [-100, -100], [100, -100], [100, 100], [-100, 100]
              ]}
              soilDepth={5}
              position={[0, 0, 0]}
              cropType="maize"
            />
            
            {/* Geological Components */}
            <GeologicalFormationExtrusion
              formationBoundaries={[
                [-50, -50], [50, -50], [50, 50], [-50, 50]
              ]}
              depth={20}
              position={[200, 0, 0]}
              mineralType="gold"
            />
            
            {/* Building Components */}
            <BuildingVisualization
              buildings={[
                {
                  id: 'agricultural-storage',
                  coordinates: [
                    [0, 0], [20, 0], [20, 15], [0, 15]
                  ],
                  height: 8,
                  baseHeight: 0,
                  properties: {
                    name: 'Grain Storage',
                    type: 'storage',
                    use: 'agriculture'
                  }
                }
              ]}
              enableTooltips={true}
              enableSelection={true}
            />
          </RaycastingSelection>
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={1000}
          />
          
          <Stats />
        </ShadowSystem>
      </Canvas>
      
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <h3>Buhera-West Environmental Intelligence</h3>
        <div>
          <label>Domain: </label>
          <select 
            value={currentDomain} 
            onChange={(e) => setCurrentDomain(e.target.value as any)}
          >
            <option value="agricultural">Agricultural</option>
            <option value="geological">Geological</option>
            <option value="solar">Solar</option>
            <option value="oceanic">Oceanic</option>
          </select>
        </div>
        {selectedObject && (
          <div>
            <p>Selected: {selectedObject.name || 'Object'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 6.2 Integration with Rust Backend

```typescript
// src/hooks/useEnvironmentalData.ts
import { useState, useEffect } from 'react';

interface EnvironmentalData {
  geological: any;
  agricultural: any;
  solar: any;
  oceanic: any;
  atmospheric: any;
}

export const useEnvironmentalData = () => {
  const [data, setData] = useState<EnvironmentalData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Connect to Rust backend WebSocket
    const ws = new WebSocket('ws://localhost:8080/environmental-data');
    
    ws.onmessage = (event) => {
      const environmentalData = JSON.parse(event.data);
      setData(environmentalData);
      setLoading(false);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setLoading(false);
    };
    
    return () => {
      ws.close();
    };
  }, []);
  
  return { data, loading };
};
```

### 6.3 Performance Optimization

```typescript
// src/hooks/usePerformanceOptimization.ts
import { useEffect, useState } from 'react';

export const usePerformanceOptimization = () => {
  const [qualityLevel, setQualityLevel] = useState(1.0);
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = Date.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = Date.now();
      
      if (currentTime - lastTime >= 1000) {
        const currentFPS = frameCount;
        setFps(currentFPS);
        frameCount = 0;
        lastTime = currentTime;
        
        // Adjust quality based on FPS
        if (currentFPS < 30) {
          setQualityLevel(prev => Math.max(0.1, prev * 0.9));
        } else if (currentFPS > 50) {
          setQualityLevel(prev => Math.min(2.0, prev * 1.1));
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }, []);
  
  return { qualityLevel, fps };
};
```

## Conclusion

This guide provides a comprehensive framework for implementing advanced Three.js visualization features in the Buhera-West environmental intelligence platform. The integration combines:

1. **3D Extrusions** for geological formations and agricultural fields
2. **Camera Alignment** for optimal viewing of different environmental domains
3. **Interactive Selection** using raycasting for user engagement
4. **Building Visualization** for agricultural infrastructure
5. **Solar Lighting** for realistic environmental lighting
6. **Performance Optimization** for smooth real-time rendering

The implementation leverages React Three Fiber's declarative approach while maintaining compatibility with the existing Rust backend and WebSocket communication system. This creates a unified platform for visualizing complex environmental data with unprecedented interactivity and realism.

### Next Steps

1. **Implement WebAssembly Integration** for direct Rust-to-JavaScript communication
2. **Add Advanced Shader Effects** for atmospheric and geological phenomena
3. **Optimize for Mobile Devices** with adaptive quality control
4. **Integrate AI-Enhanced Visualization** for predictive environmental modeling
5. **Add Multi-User Collaboration** features for shared environmental analysis

This foundation enables the Buhera-West platform to deliver cutting-edge environmental intelligence visualization while maintaining the high-performance computational capabilities outlined in the system architecture. 
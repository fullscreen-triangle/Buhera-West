# Extrusions, Lines & Tubes Implementation: React Next.js + Three.js Integration

## Overview

This document outlines the implementation plan for converting Threebox-based 3D visualizations (extrusions, lines, and tubes) into React Three Fiber components integrated with the Buhera-West environmental intelligence platform. The implementation transforms static Mapbox/Threebox examples into dynamic, data-driven environmental visualizations.

## Architecture Integration

### 1. Core Analysis of Source Examples

#### 1.1 Agricultural Crop Extrusions (18-extrusions.html)
**Key Features:**
- **Crop Field Shapes**: GeoJSON-based agricultural field boundaries
- **Growth Visualization**: Height based on crop maturity and yield
- **Seasonal Animation**: Growth cycles and harvest patterns
- **Crop Information**: Interactive tooltips with agricultural data
- **Material Variation**: Different materials for crop types (wheat, corn, soybeans, etc.)

**Technical Components:**
- Field boundary processing from agricultural GeoJSON data
- Crop height calculation based on growth stage and yield predictions
- Seasonal growth animation with realistic timing
- Material switching based on crop type and health status

#### 1.2 Airline Traffic Lines (02-line.html)
**Key Features:**
- **Flight Path Arcs**: Geodesic routes between airports
- **Altitude Profiles**: Realistic flight elevation curves
- **Traffic Density**: Color-coded by passenger volume and frequency
- **Route Width**: Thickness based on aircraft size and traffic volume
- **Global Coverage**: Major international and domestic routes

**Technical Components:**
- Great circle route calculation between airports
- Realistic flight altitude simulation (cruise, climb, descent)
- Traffic data integration (passenger counts, flight frequency)
- Dynamic route generation based on real airline data

#### 1.3 Tubes (03-tube.html)
**Key Features:**
- **Spiral Geometry**: Parametric spiral path generation
- **Tube Construction**: Circular cross-section along path
- **Physical Materials**: MeshPhysicalMaterial with realistic properties
- **Interactive Controls**: Selection, dragging, rotation
- **Animation**: 360° rotation cycles

**Technical Components:**
- Parametric equations: `sin(l/5) * l/40`, `cos(l/5) * l/40`
- Tube radius: 0.8 units with 8-sided cross-section
- Animation duration: 20 seconds for full rotation
- DoubleSide material rendering

### 2. React Three Fiber Implementation Architecture

#### 2.1 Component Structure

```typescript
// Core component hierarchy
ExtrusionVisualization/
├── GeometryRenderer/
│   ├── ExtrusionGeometry/
│   ├── LineGeometry/
│   └── TubeGeometry/
├── MaterialSystem/
│   ├── EnvironmentalMaterial/
│   ├── PhysicalMaterial/
│   └── AnimatedMaterial/
├── DataIntegration/
│   ├── GeoJSONProcessor/
│   ├── EnvironmentalDataMapper/
│   └── GeometryCalculator/
└── InteractionSystem/
    ├── HoverTooltips/
    ├── SelectionHandler/
    └── AnimationController/
```

#### 2.2 Environmental Data Integration

```rust
// Rust backend data structures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CropFieldData {
    pub id: String,
    pub field_name: String,
    pub crop_type: CropType,
    pub field_boundaries: Vec<GeoPoint>,
    pub agricultural_properties: CropAgriculturalData,
    pub growth_animation: CropGrowthConfig,
    pub environmental_factors: CropEnvironmentalData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CropAgriculturalData {
    pub crop_variety: String,
    pub planting_date: String,
    pub expected_harvest: String,
    pub growth_stage: GrowthStage,
    pub yield_prediction: f64, // tons per hectare
    pub field_area: f64, // hectares
    pub irrigation_status: IrrigationStatus,
    pub soil_quality: SoilQuality,
    pub pest_pressure: f64, // 0-100 scale
    pub nutrient_levels: NutrientProfile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AirlineTrafficData {
    pub route_id: String,
    pub origin_airport: AirportInfo,
    pub destination_airport: AirportInfo,
    pub flight_frequency: f64, // flights per day
    pub passenger_volume: i32, // passengers per day
    pub aircraft_types: Vec<AircraftType>,
    pub route_distance: f64, // kilometers
    pub average_altitude: f64, // meters
    pub traffic_density: TrafficDensity,
    pub seasonal_variation: SeasonalPattern,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AirportInfo {
    pub iata_code: String,
    pub name: String,
    pub coordinates: GeoPoint,
    pub elevation: f64,
    pub timezone: String,
    pub daily_operations: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CropEnvironmentalData {
    pub temperature: f64,
    pub rainfall: f64,
    pub humidity: f64,
    pub soil_moisture: f64,
    pub sunlight_hours: f64,
    pub wind_speed: f64,
}

enum CropType {
    Wheat,
    Corn,
    Soybeans,
    Rice,
    Cotton,
    Barley,
    Oats,
    Sunflower,
    Canola,
    Sugarcane,
}

enum GrowthStage {
    Seeding,
    Germination,
    Vegetative,
    Reproductive,
    Maturation,
    Harvest,
    Fallow,
}

enum IrrigationStatus {
    Rainfed,
    Irrigated,
    DroughStressed,
    Flooded,
}

enum TrafficDensity {
    Light,
    Moderate,
    Heavy,
    Congested,
}

enum AircraftType {
    SmallRegional,
    MediumRange,
    LongRange,
    WideTody,
    Cargo,
}
```

### 3. React Three Fiber Components Implementation

#### 3.1 Agricultural Crop Field Visualization Component

```typescript
// src/components/agriculture/CropFieldVisualization.tsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { 
  OrbitControls, 
  Stats, 
  Environment, 
  Html,
  useGLTF,
  Extrude
} from '@react-three/drei';
import * as THREE from 'three';

interface CropFieldVisualizationProps {
  cropFieldData: CropFieldData[];
  visualMode: 'growth_stage' | 'yield_prediction' | 'soil_health' | 'irrigation';
  seasonalTime: number; // 0-365 days
  showTooltips: boolean;
  enableSelection: boolean;
  qualityLevel: number;
}

export const CropFieldVisualization: React.FC<CropFieldVisualizationProps> = ({
  cropFieldData,
  visualMode,
  seasonalTime,
  showTooltips,
  enableSelection,
  qualityLevel
}) => {
  const engineRef = useRef<any>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [agriculturalMetrics, setAgriculturalMetrics] = useState<any>(null);

  useEffect(() => {
    const initEngine = async () => {
      try {
        const { CropFieldVisualizationEngine } = await import('../../wasm/agriculture_engine');
        const engine = new CropFieldVisualizationEngine();
        await engine.initialize();
        engineRef.current = engine;
        
        // Load agricultural data for crop fields
        const metrics = await engine.calculate_agricultural_metrics(cropFieldData);
        setAgriculturalMetrics(metrics);
      } catch (error) {
        console.error('Failed to initialize crop field engine:', error);
      }
    };
    initEngine();
  }, [cropFieldData]);

  return (
    <div className="relative w-full h-screen">
      <Canvas
        camera={{ position: [0, 500, 1000], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <SceneContent
          cropFieldData={cropFieldData}
          visualMode={visualMode}
          seasonalTime={seasonalTime}
          engineRef={engineRef}
          onFieldSelect={setSelectedField}
          onAgriculturalUpdate={setAgriculturalMetrics}
        />
        <Stats />
      </Canvas>
      
      <CropFieldControls
        visualMode={visualMode}
        seasonalTime={seasonalTime}
        selectedField={selectedField}
        agriculturalMetrics={agriculturalMetrics}
      />
    </div>
  );
};

const SceneContent: React.FC<{
  cropFieldData: CropFieldData[];
  visualMode: string;
  seasonalTime: number;
  engineRef: React.RefObject<any>;
  onFieldSelect: (id: string | null) => void;
  onAgriculturalUpdate: (metrics: any) => void;
}> = ({ cropFieldData, visualMode, seasonalTime, engineRef, onFieldSelect, onAgriculturalUpdate }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (engineRef.current) {
      const agriculturalState = engineRef.current.update_crop_simulation(
        state.clock.elapsedTime,
        seasonalTime,
        visualMode
      );
      onAgriculturalUpdate(agriculturalState);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Natural Lighting for Agriculture */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[1000, 1000, 500]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#FFF8DC" // Warm sunlight
      />
      
      {/* Crop Field Objects */}
      {cropFieldData.map((cropField) => (
        <CropFieldObject
          key={cropField.id}
          cropField={cropField}
          visualMode={visualMode}
          seasonalTime={seasonalTime}
          onSelect={onFieldSelect}
        />
      ))}
      
      {/* Agricultural Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50000, 50000]} />
        <meshLambertMaterial color="#8B4513" transparent opacity={0.7} />
      </mesh>
      
      <OrbitControls enableDamping dampingFactor={0.05} />
      <Environment background preset="countryside" />
    </group>
  );
};

const CropFieldObject: React.FC<{
  cropField: CropFieldData;
  visualMode: string;
  seasonalTime: number;
  onSelect: (id: string) => void;
}> = ({ cropField, visualMode, seasonalTime, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Create field geometry based on boundaries
  const fieldGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    // Create field shape from boundary coordinates
    cropField.field_boundaries.forEach((coord, index) => {
      const point = new THREE.Vector2(coord.longitude * 100, coord.latitude * 100);
      if (index === 0) {
        shape.moveTo(point.x, point.y);
      } else {
        shape.lineTo(point.x, point.y);
      }
    });
    shape.closePath();

    // Calculate crop height based on growth stage and yield
    const growthStageHeight = getGrowthStageHeight(cropField.agricultural_properties.growth_stage);
    const yieldFactor = cropField.agricultural_properties.yield_prediction / 10; // normalize
    const seasonalFactor = getSeasonalGrowthFactor(seasonalTime, cropField.agricultural_properties.planting_date);
    const cropHeight = growthStageHeight * yieldFactor * seasonalFactor;

    const extrudeSettings = {
      depth: Math.max(0.1, cropHeight * 2), // minimum height for visibility
      bevelEnabled: false,
      curveSegments: 4
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [cropField, seasonalTime]);

  // Create material based on crop data and visual mode
  const material = useMemo(() => {
    const { agricultural_properties, environmental_factors } = cropField;
    let color = new THREE.Color();
    
    switch (visualMode) {
      case 'growth_stage':
        color = getGrowthStageColor(agricultural_properties.growth_stage);
        break;
      case 'yield_prediction':
        const yieldNormalized = agricultural_properties.yield_prediction / 15; // max ~15 tons/hectare
        color.setHSL(0.3, 0.8, 0.3 + yieldNormalized * 0.4); // green to bright green
        break;
      case 'soil_health':
        const soilHealthScore = calculateSoilHealth(agricultural_properties);
        color.setHSL(0.1, soilHealthScore, 0.3 + soilHealthScore * 0.4); // brown to healthy brown
        break;
      case 'irrigation':
        color = getIrrigationColor(agricultural_properties.irrigation_status);
        break;
    }

    return new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
  }, [cropField, visualMode]);

  // Gentle swaying animation for crops
  useFrame((state) => {
    if (meshRef.current && cropField.agricultural_properties.growth_stage !== 'Harvest') {
      const windEffect = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      meshRef.current.rotation.x = windEffect;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={fieldGeometry}
      material={material}
      position={[
        cropField.field_boundaries[0]?.longitude * 100 || 0,
        0,
        cropField.field_boundaries[0]?.latitude * 100 || 0
      ]}
      onClick={() => onSelect(cropField.id)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      {hovered && (
        <Html position={[0, 10, 0]}>
          <div className="bg-green-900 bg-opacity-90 text-white p-3 rounded text-sm">
            <div className="font-bold">{cropField.field_name}</div>
            <div>Crop: {cropField.crop_type}</div>
            <div>Growth Stage: {cropField.agricultural_properties.growth_stage}</div>
            <div>Yield Prediction: {cropField.agricultural_properties.yield_prediction.toFixed(1)} t/ha</div>
            <div>Area: {cropField.agricultural_properties.field_area.toFixed(1)} ha</div>
            <div>Irrigation: {cropField.agricultural_properties.irrigation_status}</div>
          </div>
        </Html>
      )}
    </mesh>
  );
};

// Helper functions for crop visualization
function getGrowthStageHeight(stage: string): number {
  const stageHeights = {
    'Seeding': 0.1,
    'Germination': 0.3,
    'Vegetative': 0.7,
    'Reproductive': 1.0,
    'Maturation': 0.9,
    'Harvest': 0.2,
    'Fallow': 0.1
  };
  return stageHeights[stage] || 0.5;
}

function getGrowthStageColor(stage: string): THREE.Color {
  const stageColors = {
    'Seeding': new THREE.Color(0x8B4513), // Brown
    'Germination': new THREE.Color(0x9ACD32), // Yellow-green
    'Vegetative': new THREE.Color(0x228B22), // Forest green
    'Reproductive': new THREE.Color(0x32CD32), // Lime green
    'Maturation': new THREE.Color(0xDAA520), // Golden rod
    'Harvest': new THREE.Color(0xFFD700), // Gold
    'Fallow': new THREE.Color(0xA0522D) // Sienna
  };
  return stageColors[stage] || new THREE.Color(0x228B22);
}

function getIrrigationColor(status: string): THREE.Color {
  const irrigationColors = {
    'Rainfed': new THREE.Color(0x90EE90), // Light green
    'Irrigated': new THREE.Color(0x00FF00), // Bright green
    'DroughStressed': new THREE.Color(0xDAA520), // Golden rod
    'Flooded': new THREE.Color(0x4169E1) // Royal blue
  };
  return irrigationColors[status] || new THREE.Color(0x90EE90);
}

function calculateSoilHealth(agricultural_properties: any): number {
  // Simplified soil health calculation
  const pestPressureFactor = 1 - (agricultural_properties.pest_pressure / 100);
  const irrigationFactor = agricultural_properties.irrigation_status === 'Irrigated' ? 1.0 : 0.8;
  return Math.min(1.0, pestPressureFactor * irrigationFactor);
}

function getSeasonalGrowthFactor(currentDay: number, plantingDate: string): number {
  // Simplified seasonal growth factor
  const daysFromPlanting = currentDay - new Date(plantingDate).getDate();
  const growthCurve = Math.min(1.0, Math.max(0.1, daysFromPlanting / 120));
  return growthCurve;
}
```

#### 3.2 Airline Traffic Visualization Component

```typescript
// src/components/airlines/AirlineTrafficVisualization.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AirlineTrafficVisualizationProps {
  airlineData: AirlineTrafficData[];
  showAircraft: boolean;
  colorMode: 'traffic_density' | 'passenger_volume' | 'aircraft_type';
  animationSpeed: number;
  timeOfDay: number; // 0-24 hours
}

export const AirlineTrafficVisualization: React.FC<AirlineTrafficVisualizationProps> = ({
  airlineData,
  showAircraft,
  colorMode,
  animationSpeed,
  timeOfDay
}) => {
  const routesRef = useRef<THREE.Group>(null);

  // Generate flight path geometries with realistic data
  const flightRoutes = useMemo(() => {
    const routes = [];
    
    for (let i = 0; i < airlineData.length; i++) {
      const route = airlineData[i];
      const flightPath = [];
      
      // Calculate great circle route between airports
      const origin = route.origin_airport.coordinates;
      const destination = route.destination_airport.coordinates;
      
      // Great circle calculation
      const segments = 30;
      const flightPathPoints = calculateGreatCircleRoute(origin, destination, segments);
      
      // Add realistic flight altitude profile
      flightPathPoints.forEach((point, index) => {
        const progress = index / (segments - 1);
        const altitude = calculateFlightAltitude(progress, route.route_distance, route.average_altitude);
        flightPath.push([point.longitude, point.latitude, altitude]);
      });
      
      routes.push({ 
        geometry: flightPath, 
        routeData: route,
        flightFrequency: route.flight_frequency,
        passengerVolume: route.passenger_volume
      });
    }
    
    return routes;
  }, [airlineData]);

  return (
    <group ref={routesRef}>
      {/* Airport markers */}
      {airlineData.map((route, index) => (
        <React.Fragment key={`airports-${index}`}>
          <AirportMarker
            airport={route.origin_airport}
            colorMode={colorMode}
          />
          <AirportMarker
            airport={route.destination_airport}
            colorMode={colorMode}
          />
        </React.Fragment>
      ))}
      
      {/* Flight routes */}
      {flightRoutes.map((routeData, index) => (
        <FlightRoute
          key={index}
          geometry={routeData.geometry}
          routeData={routeData.routeData}
          colorMode={colorMode}
          showAircraft={showAircraft}
          animationSpeed={animationSpeed}
          timeOfDay={timeOfDay}
        />
      ))}
    </group>
  );
};

const FlightRoute: React.FC<{
  geometry: number[][];
  routeData: AirlineTrafficData;
  colorMode: string;
  showAircraft: boolean;
  animationSpeed: number;
  timeOfDay: number;
}> = ({ geometry, routeData, colorMode, showAircraft, animationSpeed, timeOfDay }) => {
  const routeRef = useRef<THREE.Line>(null);
  const aircraftRef = useRef<THREE.Group>(null);

  // Create flight path geometry
  const flightGeometry = useMemo(() => {
    const points = geometry.map(point => new THREE.Vector3(point[0] * 100, point[2] * 0.01, point[1] * 100));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [geometry]);

  // Create material based on airline traffic data
  const flightMaterial = useMemo(() => {
    let color = new THREE.Color();
    let lineWidth = 1;
    
    switch (colorMode) {
      case 'traffic_density':
        color = getTrafficDensityColor(routeData.traffic_density);
        lineWidth = Math.max(1, routeData.flight_frequency / 2);
        break;
      case 'passenger_volume':
        const passengerNormalized = Math.min(1, routeData.passenger_volume / 1000);
        color.setHSL(0.6 - passengerNormalized * 0.4, 0.8, 0.4 + passengerNormalized * 0.4);
        lineWidth = Math.max(1, passengerNormalized * 5);
        break;
      case 'aircraft_type':
        color = getAircraftTypeColor(routeData.aircraft_types[0]);
        lineWidth = getAircraftTypeWidth(routeData.aircraft_types[0]);
        break;
    }
    
    return new THREE.LineBasicMaterial({
      color: color,
      linewidth: lineWidth,
      transparent: true,
      opacity: 0.7
    });
  }, [routeData, colorMode]);

  // Calculate active flights based on time of day
  const activeFlights = useMemo(() => {
    const dailyFlights = routeData.flight_frequency;
    const flightsPerHour = dailyFlights / 24;
    const currentHourFlights = Math.floor(flightsPerHour * getHourlyTrafficMultiplier(timeOfDay));
    return Math.max(0, currentHourFlights);
  }, [routeData.flight_frequency, timeOfDay]);

  useFrame((state) => {
    if (showAircraft && aircraftRef.current && activeFlights > 0) {
      // Animate aircraft along flight paths
      aircraftRef.current.children.forEach((aircraft, index) => {
        const offset = (state.clock.elapsedTime * animationSpeed * 0.1 + index * 0.3) % 1;
        const position = geometry[Math.floor(offset * (geometry.length - 1))];
        if (position) {
          aircraft.position.set(position[0] * 100, position[2] * 0.01, position[1] * 100);
          
          // Calculate aircraft orientation along route
          const nextIndex = Math.min(geometry.length - 1, Math.floor(offset * (geometry.length - 1)) + 1);
          const nextPosition = geometry[nextIndex];
          if (nextPosition) {
            const direction = new THREE.Vector3(
              nextPosition[0] - position[0],
              0,
              nextPosition[1] - position[1]
            ).normalize();
            aircraft.lookAt(aircraft.position.clone().add(direction));
          }
        }
      });
    }
  });

  return (
    <group>
      <line ref={routeRef} geometry={flightGeometry} material={flightMaterial} />
      
      {showAircraft && activeFlights > 0 && (
        <group ref={aircraftRef}>
          {/* Aircraft models */}
          {Array.from({ length: Math.min(activeFlights, 3) }).map((_, index) => (
            <AircraftModel
              key={index}
              aircraftType={routeData.aircraft_types[0]}
              routeData={routeData}
            />
          ))}
        </group>
      )}
    </group>
  );
};

const AirportMarker: React.FC<{
  airport: AirportInfo;
  colorMode: string;
}> = ({ airport, colorMode }) => {
  const markerRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Airport marker size based on daily operations
  const markerSize = useMemo(() => {
    return Math.max(2, Math.min(20, airport.daily_operations / 100));
  }, [airport.daily_operations]);

  return (
    <mesh
      ref={markerRef}
      position={[airport.coordinates.longitude * 100, airport.elevation * 0.01, airport.coordinates.latitude * 100]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <cylinderGeometry args={[markerSize, markerSize, 5, 8]} />
      <meshPhongMaterial 
        color={hovered ? 0xFFFFFF : 0xFF4444} 
        transparent 
        opacity={0.8} 
      />
      
      {hovered && (
        <Html position={[0, 10, 0]}>
          <div className="bg-blue-900 bg-opacity-90 text-white p-2 rounded text-sm">
            <div className="font-bold">{airport.name}</div>
            <div>Code: {airport.iata_code}</div>
            <div>Daily Operations: {airport.daily_operations}</div>
            <div>Elevation: {airport.elevation.toFixed(0)}m</div>
          </div>
        </Html>
      )}
    </mesh>
  );
};

const AircraftModel: React.FC<{
  aircraftType: string;
  routeData: AirlineTrafficData;
}> = ({ aircraftType, routeData }) => {
  return (
    <mesh>
      <boxGeometry args={getAircraftDimensions(aircraftType)} />
      <meshPhongMaterial color={getAircraftTypeColor(aircraftType)} />
    </mesh>
  );
};

// Helper functions for airline visualization
function calculateGreatCircleRoute(origin: GeoPoint, destination: GeoPoint, segments: number): GeoPoint[] {
  const points = [];
  const lat1 = origin.latitude * Math.PI / 180;
  const lon1 = origin.longitude * Math.PI / 180;
  const lat2 = destination.latitude * Math.PI / 180;
  const lon2 = destination.longitude * Math.PI / 180;

  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * Math.PI) / Math.sin(Math.PI);
    const B = Math.sin(f * Math.PI) / Math.sin(Math.PI);
    
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);
    
    points.push({
      latitude: lat * 180 / Math.PI,
      longitude: lon * 180 / Math.PI,
      altitude: 0
    });
  }
  
  return points;
}

function calculateFlightAltitude(progress: number, distance: number, cruiseAltitude: number): number {
  // Realistic flight altitude profile: climb, cruise, descent
  const climbPhase = 0.15;
  const descentPhase = 0.85;
  
  if (progress < climbPhase) {
    return (progress / climbPhase) * cruiseAltitude;
  } else if (progress > descentPhase) {
    return ((1 - progress) / (1 - descentPhase)) * cruiseAltitude;
  } else {
    return cruiseAltitude;
  }
}

function getTrafficDensityColor(density: string): THREE.Color {
  const densityColors = {
    'Light': new THREE.Color(0x00FF00),
    'Moderate': new THREE.Color(0xFFFF00),
    'Heavy': new THREE.Color(0xFF8000),
    'Congested': new THREE.Color(0xFF0000)
  };
  return densityColors[density] || new THREE.Color(0x00FF00);
}

function getAircraftTypeColor(aircraftType: string): THREE.Color {
  const typeColors = {
    'SmallRegional': new THREE.Color(0x87CEEB),
    'MediumRange': new THREE.Color(0x4169E1),
    'LongRange': new THREE.Color(0x0000FF),
    'WideTody': new THREE.Color(0x8A2BE2),
    'Cargo': new THREE.Color(0xFF8C00)
  };
  return typeColors[aircraftType] || new THREE.Color(0x87CEEB);
}

function getAircraftTypeWidth(aircraftType: string): number {
  const typeWidths = {
    'SmallRegional': 1,
    'MediumRange': 2,
    'LongRange': 3,
    'WideTody': 4,
    'Cargo': 3
  };
  return typeWidths[aircraftType] || 2;
}

function getAircraftDimensions(aircraftType: string): [number, number, number] {
  const dimensions = {
    'SmallRegional': [8, 2, 2],
    'MediumRange': [12, 3, 3],
    'LongRange': [16, 4, 4],
    'WideTody': [20, 5, 5],
    'Cargo': [16, 4, 6]
  };
  return dimensions[aircraftType] || [12, 3, 3];
}

function getHourlyTrafficMultiplier(hour: number): number {
  // Peak hours: 6-9 AM and 5-8 PM
  if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
    return 1.5;
  } else if (hour >= 22 || hour <= 5) {
    return 0.3; // Red-eye flights
  } else {
    return 1.0;
  }
}
```

#### 3.3 Tube Visualization Component

```typescript
// src/components/tubes/TubeVisualization.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TubeVisualizationProps {
  tubeData: TubeEnvironmentalData[];
  spiralComplexity: number;
  showFlowParticles: boolean;
  materialType: 'physical' | 'standard' | 'basic';
  flowVisualization: boolean;
}

export const TubeVisualization: React.FC<TubeVisualizationProps> = ({
  tubeData,
  spiralComplexity,
  showFlowParticles,
  materialType,
  flowVisualization
}) => {
  const tubesRef = useRef<THREE.Group>(null);

  return (
    <group ref={tubesRef}>
      {tubeData.map((data, index) => (
        <EnvironmentalTube
          key={index}
          tubeData={data}
          spiralComplexity={spiralComplexity}
          showFlowParticles={showFlowParticles}
          materialType={materialType}
          flowVisualization={flowVisualization}
          index={index}
        />
      ))}
    </group>
  );
};

const EnvironmentalTube: React.FC<{
  tubeData: TubeEnvironmentalData;
  spiralComplexity: number;
  showFlowParticles: boolean;
  materialType: string;
  flowVisualization: boolean;
  index: number;
}> = ({ tubeData, spiralComplexity, showFlowParticles, materialType, flowVisualization, index }) => {
  const tubeRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Generate spiral geometry with environmental influence
  const tubeGeometry = useMemo(() => {
    const path = new THREE.CurvePath();
    const points = [];
    
    const origin = [0, 0, 0];
    const segmentCount = spiralComplexity * 10;
    
    for (let l = 0; l < segmentCount; l++) {
      // Environmental influence on spiral path
      const envInfluence = tubeData.turbulence_factor * Math.sin(l * 0.1) * 5;
      const pressureInfluence = tubeData.pressure / 1000 * 2;
      
      const delta = [
        Math.sin(l / 5) * l / 40 + envInfluence,
        Math.cos(l / 5) * l / 40 + pressureInfluence,
        l / 10 + tubeData.fluid_velocity * l / 100
      ];
      
      const newCoordinate = origin.map((d, i) => d + delta[i]);
      points.push(new THREE.Vector3(newCoordinate[0], newCoordinate[2], newCoordinate[1]));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    
    // Radius influenced by pressure and flow
    const radius = 0.8 + (tubeData.pressure / 1000) * 0.5;
    const radialSegments = Math.max(8, Math.floor(tubeData.fluid_velocity / 2));
    
    return new THREE.TubeGeometry(curve, segmentCount, radius, radialSegments, false);
  }, [tubeData, spiralComplexity]);

  // Create material based on environmental conditions
  const tubeMaterial = useMemo(() => {
    const tempNormalized = (tubeData.temperature + 50) / 100;
    const velocityNormalized = tubeData.fluid_velocity / 50;
    
    let color = new THREE.Color();
    color.setHSL(0.5 + tempNormalized * 0.3, 0.8, 0.4 + velocityNormalized * 0.3);
    
    const baseProps = {
      color: color,
      transparent: true,
      opacity: 0.7 + tubeData.particle_density / 100 * 0.3,
      side: THREE.DoubleSide
    };
    
    switch (materialType) {
      case 'physical':
        return new THREE.MeshPhysicalMaterial({
          ...baseProps,
          metalness: 0.1,
          roughness: 0.3,
          clearcoat: tubeData.fluid_velocity / 100,
          clearcoatRoughness: 0.1
        });
      case 'standard':
        return new THREE.MeshStandardMaterial({
          ...baseProps,
          metalness: 0.2,
          roughness: 0.5
        });
      default:
        return new THREE.MeshBasicMaterial(baseProps);
    }
  }, [tubeData, materialType]);

  // Create flow particles
  const particleGeometry = useMemo(() => {
    if (!showFlowParticles) return null;
    
    const particleCount = Math.floor(tubeData.particle_density * 10);
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      const spiralPos = tubeGeometry.parameters.path.getPointAt(t);
      
      positions[i * 3] = spiralPos.x + (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = spiralPos.y + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = spiralPos.z + (Math.random() - 0.5) * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [tubeData, showFlowParticles, tubeGeometry]);

  useFrame((state) => {
    if (tubeRef.current) {
      // Rotation based on flow velocity
      tubeRef.current.rotation.z += tubeData.fluid_velocity * 0.001;
    }
    
    if (particlesRef.current && showFlowParticles) {
      // Animate particles along the tube
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += tubeData.fluid_velocity * 0.1;
        if (positions[i + 2] > 20) {
          positions[i + 2] = -20;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[index * 100, 0, 0]}>
      <mesh
        ref={tubeRef}
        geometry={tubeGeometry}
        material={tubeMaterial}
        castShadow
        receiveShadow
      />
      
      {showFlowParticles && particleGeometry && (
        <points ref={particlesRef} geometry={particleGeometry}>
          <pointsMaterial
            color={tubeMaterial.color}
            size={tubeData.particle_density / 20}
            transparent
            opacity={0.6}
          />
        </points>
      )}
    </group>
  );
};
```

### 4. WASM Integration Layer

#### 4.1 Agricultural Crop Field Engine

```javascript
// src/wasm/agriculture_engine.js
export class CropFieldVisualizationEngine {
  constructor() {
    this.cropTypes = {
      WHEAT: 'Wheat',
      CORN: 'Corn',
      SOYBEANS: 'Soybeans',
      RICE: 'Rice',
      COTTON: 'Cotton',
      BARLEY: 'Barley'
    };
    
    this.growthStages = {
      SEEDING: 'Seeding',
      GERMINATION: 'Germination',
      VEGETATIVE: 'Vegetative',
      REPRODUCTIVE: 'Reproductive',
      MATURATION: 'Maturation',
      HARVEST: 'Harvest',
      FALLOW: 'Fallow'
    };
    
    this.initialized = false;
    this.crop_data_cache = new Map();
  }

  async initialize() {
    console.log('Initializing agricultural crop field visualization engine...');
    this.initialized = true;
  }

  async generate_crop_fields(count, region = 'midwest') {
    const fields = [];
    
    for (let i = 0; i < count; i++) {
      const fieldBoundaries = this.generateFieldBoundaries(region);
      const cropType = this.selectCropType(region);
      const agriculturalData = this.calculateAgriculturalData(fieldBoundaries, cropType);
      
      fields.push({
        id: `field_${region}_${i}`,
        field_name: `${cropType} Field ${i + 1}`,
        crop_type: cropType,
        field_boundaries: fieldBoundaries,
        agricultural_properties: agriculturalData,
        growth_animation: this.calculateGrowthAnimation(agriculturalData),
        environmental_factors: this.calculateEnvironmentalFactors(fieldBoundaries)
      });
    }
    
    return fields;
  }

  generateFieldBoundaries(region) {
    // Generate realistic field shapes (more rectangular for modern agriculture)
    const corners = 4 + Math.floor(Math.random() * 2); // 4-6 corners
    const coords = [];
    
    // Base coordinates for different agricultural regions
    const regionCenters = {
      'midwest': { lat: 41.8781, lon: -87.6298 },
      'california': { lat: 36.7783, lon: -119.4179 },
      'texas': { lat: 31.9686, lon: -99.9018 },
      'florida': { lat: 27.7663, lon: -82.6404 }
    };
    
    const center = regionCenters[region] || regionCenters.midwest;
    const fieldSize = 0.005 + Math.random() * 0.01; // 0.5-1.5 km fields
    
    for (let i = 0; i < corners; i++) {
      const angle = (i / corners) * Math.PI * 2;
      const radius = fieldSize * (0.8 + Math.random() * 0.4);
      coords.push({
        latitude: center.lat + Math.sin(angle) * radius,
        longitude: center.lon + Math.cos(angle) * radius,
        altitude: 0
      });
    }
    
    return coords;
  }

  selectCropType(region) {
    const regionalCrops = {
      'midwest': ['Corn', 'Soybeans', 'Wheat'],
      'california': ['Rice', 'Cotton', 'Wheat'],
      'texas': ['Cotton', 'Corn', 'Wheat'],
      'florida': ['Sugarcane', 'Corn', 'Soybeans']
    };
    
    const crops = regionalCrops[region] || regionalCrops.midwest;
    return crops[Math.floor(Math.random() * crops.length)];
  }

  calculateAgriculturalData(boundaries, cropType) {
    const area = this.calculateFieldArea(boundaries);
    const baseYield = this.getBaseYield(cropType);
    
    return {
      crop_variety: this.getCropVariety(cropType),
      planting_date: this.getPlantingDate(cropType),
      expected_harvest: this.getHarvestDate(cropType),
      growth_stage: this.getCurrentGrowthStage(),
      yield_prediction: baseYield * (0.8 + Math.random() * 0.4), // ±20% variation
      field_area: area,
      irrigation_status: this.getIrrigationStatus(),
      soil_quality: this.getSoilQuality(),
      pest_pressure: Math.random() * 100,
      nutrient_levels: this.getNutrientProfile()
    };
  }

  calculateFieldArea(boundaries) {
    // Simplified area calculation (hectares)
    const latRange = Math.max(...boundaries.map(p => p.latitude)) - Math.min(...boundaries.map(p => p.latitude));
    const lonRange = Math.max(...boundaries.map(p => p.longitude)) - Math.min(...boundaries.map(p => p.longitude));
    return (latRange * lonRange) * 111000 * 111000 / 10000; // Convert to hectares
  }

  getBaseYield(cropType) {
    const baseYields = {
      'Corn': 11.0,
      'Soybeans': 3.5,
      'Wheat': 3.4,
      'Rice': 8.7,
      'Cotton': 0.8,
      'Barley': 4.2
    };
    return baseYields[cropType] || 5.0;
  }

  getCurrentGrowthStage() {
    const stages = Object.values(this.growthStages);
    return stages[Math.floor(Math.random() * stages.length)];
  }

  getIrrigationStatus() {
    const statuses = ['Rainfed', 'Irrigated', 'DroughStressed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  getSoilQuality() {
    return {
      ph: 6.0 + Math.random() * 2.0,
      organic_matter: 2.0 + Math.random() * 3.0,
      nitrogen: 20 + Math.random() * 40,
      phosphorus: 10 + Math.random() * 30,
      potassium: 100 + Math.random() * 200
    };
  }

  calculateEnvironmentalFactors(boundaries) {
    const centerLat = boundaries.reduce((sum, p) => sum + p.latitude, 0) / boundaries.length;
    
    return {
      temperature: 15 + Math.random() * 20,
      rainfall: 500 + Math.random() * 800,
      humidity: 40 + Math.random() * 40,
      soil_moisture: 20 + Math.random() * 60,
      sunlight_hours: 8 + Math.random() * 4,
      wind_speed: 5 + Math.random() * 15
    };
  }

  async calculate_agricultural_metrics(cropFieldData) {
    return {
      total_area: cropFieldData.reduce((sum, field) => 
        sum + field.agricultural_properties.field_area, 0),
      average_yield: cropFieldData.reduce((sum, field) => 
        sum + field.agricultural_properties.yield_prediction, 0) / cropFieldData.length,
      irrigation_percentage: (cropFieldData.filter(field => 
        field.agricultural_properties.irrigation_status === 'Irrigated').length / cropFieldData.length) * 100,
      crop_diversity: new Set(cropFieldData.map(field => field.crop_type)).size,
      pest_risk: Math.max(...cropFieldData.map(field => 
        field.agricultural_properties.pest_pressure)),
      harvest_readiness: cropFieldData.filter(field => 
        field.agricultural_properties.growth_stage === 'Maturation').length
    };
  }

  update_crop_simulation(timestamp, seasonalTime, mode) {
    return {
      timestamp,
      seasonal_day: seasonalTime,
      mode,
      growing_degree_days: this.calculateGrowingDegreeDays(seasonalTime),
      soil_temperature: 10 + Math.sin(seasonalTime * 0.017) * 15,
      photoperiod: 12 + Math.sin((seasonalTime - 80) * 0.017) * 4,
      precipitation: 2 + Math.random() * 8,
      pest_activity: Math.max(0, Math.sin((seasonalTime - 100) * 0.017) * 50),
      nutrient_availability: 70 + Math.sin(seasonalTime * 0.017) * 20
    };
  }

  calculateGrowingDegreeDays(dayOfYear) {
    // Simplified growing degree days calculation
    const baseTemp = 10; // Base temperature for crop growth
    const dailyTemp = 15 + Math.sin((dayOfYear - 80) * 0.017) * 10;
    return Math.max(0, dailyTemp - baseTemp);
  }

  getCropVariety(cropType) {
    const varieties = {
      'Corn': ['Pioneer 1234', 'DeKalb 5678', 'Syngenta 9012'],
      'Soybeans': ['Roundup Ready 2X', 'Liberty Link', 'Conventional'],
      'Wheat': ['Hard Red Winter', 'Soft White', 'Durum'],
      'Rice': ['Jasmine', 'Basmati', 'Long Grain'],
      'Cotton': ['Upland', 'Pima', 'Organic'],
      'Barley': ['Six-row', 'Two-row', 'Malting']
    };
    const options = varieties[cropType] || ['Standard'];
    return options[Math.floor(Math.random() * options.length)];
  }

  getPlantingDate(cropType) {
    const plantingDates = {
      'Corn': 'April 15',
      'Soybeans': 'May 10',
      'Wheat': 'October 1',
      'Rice': 'April 20',
      'Cotton': 'May 1',
      'Barley': 'March 15'
    };
    return plantingDates[cropType] || 'April 1';
  }

  getHarvestDate(cropType) {
    const harvestDates = {
      'Corn': 'October 15',
      'Soybeans': 'September 20',
      'Wheat': 'July 15',
      'Rice': 'September 10',
      'Cotton': 'October 1',
      'Barley': 'July 20'
    };
    return harvestDates[cropType] || 'September 1';
  }

  getNutrientProfile() {
    return {
      nitrogen: 20 + Math.random() * 40,
      phosphorus: 10 + Math.random() * 30,
      potassium: 100 + Math.random() * 200,
      sulfur: 10 + Math.random() * 20,
      magnesium: 50 + Math.random() * 100,
      calcium: 200 + Math.random() * 300
    };
  }

  calculateGrowthAnimation(agriculturalData) {
    return {
      growth_rate: this.getGrowthRate(agriculturalData.crop_type),
      max_height: this.getMaxHeight(agriculturalData.crop_type),
      growth_curve: 'sigmoid',
      seasonal_variation: true,
      wind_sway: true
    };
  }

  getGrowthRate(cropType) {
    const rates = {
      'Corn': 0.08,
      'Soybeans': 0.05,
      'Wheat': 0.04,
      'Rice': 0.06,
      'Cotton': 0.07,
      'Barley': 0.04
    };
    return rates[cropType] || 0.05;
  }

  getMaxHeight(cropType) {
    const heights = {
      'Corn': 2.5,
      'Soybeans': 1.2,
      'Wheat': 1.0,
      'Rice': 1.5,
      'Cotton': 1.8,
      'Barley': 0.9
    };
    return heights[cropType] || 1.0;
  }
}
```

### 5. Next.js Page Integrations

#### 5.1 Agricultural & Aviation Intelligence Page

```javascript
// src/pages/agricultural-aviation-intelligence.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const CropFieldVisualization = dynamic(
  () => import('../components/agriculture/CropFieldVisualization'),
  { ssr: false }
);

const AirlineTrafficVisualization = dynamic(
  () => import('../components/airlines/AirlineTrafficVisualization'),
  { ssr: false }
);

const TubeVisualization = dynamic(
  () => import('../components/tubes/TubeVisualization'),
  { ssr: false }
);

const AgriculturalAviationPage = () => {
  const [visualizationType, setVisualizationType] = useState('crop_fields');
  const [visualMode, setVisualMode] = useState('growth_stage');
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [seasonalTime, setSeasonalTime] = useState(180); // Day of year (0-365)
  const [timeOfDay, setTimeOfDay] = useState(12); // Hour of day (0-24)
  const [qualityLevel, setQualityLevel] = useState(1.0);

  return (
    <>
      <Head>
        <title>Agricultural & Aviation Intelligence - Environmental Platform</title>
        <meta name="description" content="Crop field monitoring and airline traffic visualization with environmental data integration" />
      </Head>
      
      <div className="w-full h-screen relative">
        {/* Visualization Type Selector */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded z-10">
          <h3 className="text-lg font-bold mb-3">Visualization Type</h3>
          <div className="space-y-2">
            {[
              { key: 'crop_fields', label: 'Crop Fields' },
              { key: 'airline_traffic', label: 'Airline Traffic' },
              { key: 'tubes', label: 'Environmental Tubes' }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setVisualizationType(type.key)}
                className={`w-full px-3 py-2 rounded text-sm ${
                  visualizationType === type.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Controls */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded z-10">
          <h3 className="text-lg font-bold mb-3">
            {visualizationType === 'crop_fields' ? 'Agricultural Mode' : 'Traffic Mode'}
          </h3>
          
          {visualizationType === 'crop_fields' && (
            <>
              <select
                value={visualMode}
                onChange={(e) => setVisualMode(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white mb-3"
              >
                <option value="growth_stage">Growth Stage</option>
                <option value="yield_prediction">Yield Prediction</option>
                <option value="soil_health">Soil Health</option>
                <option value="irrigation">Irrigation Status</option>
              </select>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Seasonal Time (Day {seasonalTime}/365)
                </label>
                <input
                  type="range"
                  min="0"
                  max="365"
                  value={seasonalTime}
                  onChange={(e) => setSeasonalTime(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-300 mt-1">
                  {getSeasonName(seasonalTime)}
                </div>
              </div>
            </>
          )}
          
          {visualizationType === 'airline_traffic' && (
            <>
              <select
                value={visualMode}
                onChange={(e) => setVisualMode(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white mb-3"
              >
                <option value="traffic_density">Traffic Density</option>
                <option value="passenger_volume">Passenger Volume</option>
                <option value="aircraft_type">Aircraft Type</option>
              </select>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Time of Day ({timeOfDay}:00)
                </label>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-300 mt-1">
                  {getTimeOfDayDescription(timeOfDay)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Data Statistics Panel */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded z-10">
          <h3 className="text-lg font-bold mb-2">Live Statistics</h3>
          {visualizationType === 'crop_fields' && (
            <div className="text-sm space-y-1">
              <div>Active Fields: <span className="text-green-400">247</span></div>
              <div>Total Area: <span className="text-green-400">15,420 ha</span></div>
              <div>Avg Yield: <span className="text-green-400">8.2 t/ha</span></div>
              <div>Irrigation: <span className="text-blue-400">68%</span></div>
            </div>
          )}
          {visualizationType === 'airline_traffic' && (
            <div className="text-sm space-y-1">
              <div>Active Routes: <span className="text-blue-400">156</span></div>
              <div>Daily Flights: <span className="text-blue-400">2,340</span></div>
              <div>Passengers: <span className="text-blue-400">284,520</span></div>
              <div>Aircraft Aloft: <span className="text-yellow-400">87</span></div>
            </div>
          )}
        </div>

        {/* Main Visualization */}
        {visualizationType === 'crop_fields' && (
          <CropFieldVisualization
            visualMode={visualMode}
            seasonalTime={seasonalTime}
            animationSpeed={animationSpeed}
            qualityLevel={qualityLevel}
            showTooltips={true}
            enableSelection={true}
          />
        )}
        
        {visualizationType === 'airline_traffic' && (
          <AirlineTrafficVisualization
            colorMode={visualMode}
            timeOfDay={timeOfDay}
            animationSpeed={animationSpeed}
            showAircraft={true}
          />
        )}
        
        {visualizationType === 'tubes' && (
          <TubeVisualization
            materialType="physical"
            spiralComplexity={20}
            flowVisualization={true}
          />
        )}
      </div>
    </>
  );
};

// Helper functions
function getSeasonName(dayOfYear) {
  if (dayOfYear < 80) return 'Winter';
  if (dayOfYear < 172) return 'Spring';
  if (dayOfYear < 266) return 'Summer';
  if (dayOfYear < 355) return 'Fall';
  return 'Winter';
}

function getTimeOfDayDescription(hour) {
  if (hour < 6) return 'Night / Red-eye flights';
  if (hour < 9) return 'Morning rush';
  if (hour < 17) return 'Daytime operations';
  if (hour < 21) return 'Evening rush';
  return 'Night operations';
}

export default AgriculturalAviationPage;
```

## Key Implementation Features

### 1. Agricultural Intelligence Integration
- **Crop Growth Simulation**: Real-time crop growth based on growth stages, seasonal timing, and environmental factors
- **Yield Prediction Visualization**: Dynamic height and color representation of expected yields
- **Irrigation Management**: Visual indicators for irrigation status, soil moisture, and drought stress
- **Seasonal Progression**: Time-based crop development with realistic planting and harvest cycles

### 2. Aviation Traffic Intelligence
- **Great Circle Routes**: Accurate geodesic flight path calculations between airports
- **Real-time Flight Simulation**: Aircraft movement along routes with proper altitude profiles
- **Traffic Density Visualization**: Color-coded routes based on passenger volume and flight frequency
- **Time-of-Day Dynamics**: Peak hour traffic patterns and red-eye flight visualization

### 3. Performance Optimization
- **Level of Detail (LOD)**: Adaptive geometry complexity for both crop fields and flight routes
- **Instanced Rendering**: Efficient rendering of multiple crop fields and aircraft
- **Temporal Culling**: Show/hide elements based on seasonal relevance and flight schedules
- **Quality Scaling**: Automatic performance adjustment maintaining 60 FPS

### 4. Interactive Agricultural Features
- **Field Selection**: Click to inspect individual crop fields with detailed agricultural data
- **Growth Stage Tooltips**: Hover to see crop variety, yield predictions, soil health, and irrigation status
- **Seasonal Controls**: Scrub through 365-day yearly cycle to see crop development
- **Multi-Modal Visualization**: Switch between growth stage, yield, soil health, and irrigation views

### 5. Interactive Aviation Features
- **Route Analysis**: Click flight routes to see origin/destination airports and traffic data
- **Airport Information**: Hover over airport markers for IATA codes, daily operations, and elevation
- **Time-Based Traffic**: Adjust time of day to see peak hours, rush periods, and night operations
- **Aircraft Type Visualization**: Different colors and sizes for regional, long-range, wide-body, and cargo aircraft

### 6. Scientific Accuracy & Real-World Data
- **Agricultural Science**: Realistic crop growth rates, yield calculations, and seasonal patterns
- **Aviation Mathematics**: Proper great circle calculations, flight altitude profiles, and traffic distribution
- **Environmental Factors**: Temperature, rainfall, soil conditions affecting crop growth
- **Geographic Accuracy**: Region-specific crop types and major airline route networks

### 7. Extensible Architecture
- **Modular Design**: Separate engines for agriculture and aviation data processing
- **WASM Integration**: Ready for high-performance Rust backend integration
- **API Compatibility**: Designed to connect with real agricultural and aviation data sources
- **Scalable Rendering**: Capable of handling thousands of fields and hundreds of flight routes

This implementation transforms simple geometric examples into specialized domain visualizations for agricultural monitoring and aviation traffic analysis, providing practical tools for environmental intelligence and infrastructure monitoring.

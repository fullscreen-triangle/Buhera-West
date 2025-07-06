import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude: number;
}

interface AirportInfo {
  iata_code: string;
  name: string;
  coordinates: GeoPoint;
  elevation: number;
  timezone: string;
  daily_operations: number;
}

interface AirlineTrafficData {
  route_id: string;
  origin_airport: AirportInfo;
  destination_airport: AirportInfo;
  flight_frequency: number;
  passenger_volume: number;
  aircraft_types: string[];
  route_distance: number;
  average_altitude: number;
  traffic_density: string;
  seasonal_variation: any;
}

interface AirlineTrafficVisualizationProps {
  airlineData?: AirlineTrafficData[];
  showAircraft: boolean;
  colorMode: 'traffic_density' | 'passenger_volume' | 'aircraft_type';
  animationSpeed: number;
  timeOfDay: number; // 0-24 hours
}

export const AirlineTrafficVisualization: React.FC<AirlineTrafficVisualizationProps> = ({
  airlineData = [],
  showAircraft,
  colorMode,
  animationSpeed,
  timeOfDay
}) => {
  const routesRef = useRef<THREE.Group>(null);
  const [generatedRoutes, setGeneratedRoutes] = useState<AirlineTrafficData[]>([]);

  useEffect(() => {
    const initEngine = async () => {
      try {
        const { AirlineTrafficEngine } = await import('../../wasm/airline_engine');
        const engine = new AirlineTrafficEngine();
        await engine.initialize();
        
        // Generate sample data if none provided
        if (airlineData.length === 0) {
          const sampleRoutes = await engine.generate_airline_routes(50);
          setGeneratedRoutes(sampleRoutes);
        }
      } catch (error) {
        console.error('Failed to initialize airline engine:', error);
      }
    };
    initEngine();
  }, [airlineData]);

  const activeRoutes = airlineData.length > 0 ? airlineData : generatedRoutes;

  // Generate flight path geometries with realistic data
  const flightRoutes = useMemo(() => {
    const routes = [];
    
    for (let i = 0; i < activeRoutes.length; i++) {
      const route = activeRoutes[i];
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
  }, [activeRoutes]);

  return (
    <group ref={routesRef}>
      {/* Airport markers */}
      {activeRoutes.map((route, index) => (
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
  const densityColors: Record<string, THREE.Color> = {
    'Light': new THREE.Color(0x00FF00),
    'Moderate': new THREE.Color(0xFFFF00),
    'Heavy': new THREE.Color(0xFF8000),
    'Congested': new THREE.Color(0xFF0000)
  };
  return densityColors[density] || new THREE.Color(0x00FF00);
}

function getAircraftTypeColor(aircraftType: string): THREE.Color {
  const typeColors: Record<string, THREE.Color> = {
    'SmallRegional': new THREE.Color(0x87CEEB),
    'MediumRange': new THREE.Color(0x4169E1),
    'LongRange': new THREE.Color(0x0000FF),
    'WideTody': new THREE.Color(0x8A2BE2),
    'Cargo': new THREE.Color(0xFF8C00)
  };
  return typeColors[aircraftType] || new THREE.Color(0x87CEEB);
}

function getAircraftTypeWidth(aircraftType: string): number {
  const typeWidths: Record<string, number> = {
    'SmallRegional': 1,
    'MediumRange': 2,
    'LongRange': 3,
    'WideTody': 4,
    'Cargo': 3
  };
  return typeWidths[aircraftType] || 2;
}

function getAircraftDimensions(aircraftType: string): [number, number, number] {
  const dimensions: Record<string, [number, number, number]> = {
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

export default AirlineTrafficVisualization; 
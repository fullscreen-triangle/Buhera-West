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

interface CropFieldData {
  id: string;
  field_name: string;
  crop_type: string;
  field_boundaries: Array<{
    latitude: number;
    longitude: number;
    altitude: number;
  }>;
  agricultural_properties: {
    crop_variety: string;
    planting_date: string;
    expected_harvest: string;
    growth_stage: string;
    yield_prediction: number;
    field_area: number;
    irrigation_status: string;
    soil_quality: any;
    pest_pressure: number;
    nutrient_levels: any;
  };
  growth_animation: any;
  environmental_factors: {
    temperature: number;
    rainfall: number;
    humidity: number;
    soil_moisture: number;
    sunlight_hours: number;
    wind_speed: number;
  };
}

interface CropFieldVisualizationProps {
  cropFieldData?: CropFieldData[];
  visualMode: 'growth_stage' | 'yield_prediction' | 'soil_health' | 'irrigation';
  seasonalTime: number; // 0-365 days
  showTooltips: boolean;
  enableSelection: boolean;
  qualityLevel: number;
}

export const CropFieldVisualization: React.FC<CropFieldVisualizationProps> = ({
  cropFieldData = [],
  visualMode,
  seasonalTime,
  showTooltips,
  enableSelection,
  qualityLevel
}) => {
  const engineRef = useRef<any>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [agriculturalMetrics, setAgriculturalMetrics] = useState<any>(null);
  const [generatedFields, setGeneratedFields] = useState<CropFieldData[]>([]);

  useEffect(() => {
    const initEngine = async () => {
      try {
        const { CropFieldVisualizationEngine } = await import('../../wasm/agriculture_engine');
        const engine = new CropFieldVisualizationEngine();
        await engine.initialize();
        engineRef.current = engine;
        
        // Generate sample data if none provided
        if (cropFieldData.length === 0) {
          const sampleFields = await engine.generate_crop_fields(20, 'midwest');
          setGeneratedFields(sampleFields);
        }
        
        // Load agricultural data for crop fields
        const fields = cropFieldData.length > 0 ? cropFieldData : generatedFields;
        if (fields.length > 0) {
          const metrics = await engine.calculate_agricultural_metrics(fields);
          setAgriculturalMetrics(metrics);
        }
      } catch (error) {
        console.error('Failed to initialize crop field engine:', error);
      }
    };
    initEngine();
  }, [cropFieldData, generatedFields]);

  const activeFields = cropFieldData.length > 0 ? cropFieldData : generatedFields;

  return (
    <div className="relative w-full h-screen">
      <Canvas
        camera={{ position: [0, 500, 1000], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <SceneContent
          cropFieldData={activeFields}
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
      <Environment background preset="park" />
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

const CropFieldControls: React.FC<{
  visualMode: string;
  seasonalTime: number;
  selectedField: string | null;
  agriculturalMetrics: any;
}> = ({ visualMode, seasonalTime, selectedField, agriculturalMetrics }) => {
  return (
    <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded z-10">
      <h3 className="text-lg font-bold mb-2">Agricultural Data</h3>
      {agriculturalMetrics && (
        <div className="text-sm space-y-1">
          <div>Total Area: <span className="text-green-400">{agriculturalMetrics.total_area?.toFixed(1)} ha</span></div>
          <div>Avg Yield: <span className="text-green-400">{agriculturalMetrics.average_yield?.toFixed(1)} t/ha</span></div>
          <div>Irrigation: <span className="text-blue-400">{agriculturalMetrics.irrigation_percentage?.toFixed(0)}%</span></div>
          <div>Crop Types: <span className="text-yellow-400">{agriculturalMetrics.crop_diversity}</span></div>
        </div>
      )}
    </div>
  );
};

// Helper functions for crop visualization
function getGrowthStageHeight(stage: string): number {
  const stageHeights: Record<string, number> = {
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
  const stageColors: Record<string, THREE.Color> = {
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
  const irrigationColors: Record<string, THREE.Color> = {
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

export default CropFieldVisualization; 
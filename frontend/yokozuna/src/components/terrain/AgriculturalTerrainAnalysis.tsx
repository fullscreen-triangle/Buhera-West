import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import LODTerrain from './LODTerrain';
import TexturedTerrain from './TexturedTerrain';
import BasicTerrain from './BasicTerrain';

/**
 * Agricultural annotation data structure
 */
interface AgriculturalAnnotation {
  id: string;
  type: 'soil_analysis' | 'crop_area' | 'irrigation' | 'weather_station' | 'drainage' | 'custom';
  shape: 'circle' | 'square' | 'polygon';
  position: THREE.Vector3;
  size: number | [number, number]; // radius for circle, [width, height] for square
  data: {
    title: string;
    description: string;
    soilType?: string;
    cropType?: string;
    moistureLevel?: number;
    temperature?: number;
    ph?: number;
    nutrients?: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
    lastUpdated: Date;
    [key: string]: any;
  };
  color: string;
  opacity: number;
}

/**
 * Drawing state for interactive annotation creation
 */
interface DrawingState {
  isDrawing: boolean;
  drawingMode: 'circle' | 'square' | 'polygon' | null;
  startPosition: THREE.Vector3 | null;
  currentAnnotation: Partial<AgriculturalAnnotation> | null;
  previewPoints: THREE.Vector3[];
}

/**
 * Weather data overlay structure
 */
interface WeatherData {
  position: THREE.Vector3;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  soilMoisture: number;
  timestamp: Date;
}

/**
 * Props for the agricultural terrain analysis component
 */
export interface AgriculturalTerrainAnalysisProps {
  /** Terrain configuration */
  terrainConfig: {
    type: 'basic' | 'textured' | 'lod';
    size: [number, number, number];
    position: [number, number, number];
    heightMap?: string;
    textures?: Record<string, string>;
    resolution?: number;
  };
  /** Agricultural annotations */
  annotations?: AgriculturalAnnotation[];
  /** Weather data points */
  weatherData?: WeatherData[];
  /** Enable drawing tools */
  enableDrawing?: boolean;
  /** Enable 3D visualization */
  enable3D?: boolean;
  /** Show weather overlay */
  showWeatherOverlay?: boolean;
  /** Show soil analysis */
  showSoilAnalysis?: boolean;
  /** Show crop zones */
  showCropZones?: boolean;
  /** Callback for annotation changes */
  onAnnotationsChange?: (annotations: AgriculturalAnnotation[]) => void;
  /** Callback for new annotation creation */
  onCreateAnnotation?: (annotation: AgriculturalAnnotation) => void;
  /** Callback for annotation selection */
  onSelectAnnotation?: (annotation: AgriculturalAnnotation | null) => void;
  /** Callback for terrain analysis at position */
  onTerrainAnalysis?: (position: THREE.Vector3, analysis: any) => void;
}

/**
 * Agricultural Terrain Analysis Component
 * Provides 3D terrain visualization with interactive annotation tools for agricultural analysis
 */
const AgriculturalTerrainAnalysis: React.FC<AgriculturalTerrainAnalysisProps> = ({
  terrainConfig,
  annotations = [],
  weatherData = [],
  enableDrawing = true,
  enable3D = true,
  showWeatherOverlay = true,
  showSoilAnalysis = true,
  showCropZones = true,
  onAnnotationsChange,
  onCreateAnnotation,
  onSelectAnnotation,
  onTerrainAnalysis
}) => {
  const { camera, gl, raycaster, scene } = useThree();
  const terrainRef = useRef<THREE.Mesh>(null);
  const annotationsGroupRef = useRef<THREE.Group>(null);
  const weatherOverlayRef = useRef<THREE.Group>(null);
  
  // Component state
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    drawingMode: null,
    startPosition: null,
    currentAnnotation: null,
    previewPoints: []
  });
  
  const [selectedAnnotation, setSelectedAnnotation] = useState<AgriculturalAnnotation | null>(null);
  const [hoverPosition, setHoverPosition] = useState<THREE.Vector3 | null>(null);
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [newAnnotationData, setNewAnnotationData] = useState<Partial<AgriculturalAnnotation>>({});
  
  // Mouse interaction handling
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!enableDrawing || !drawingState.drawingMode) return;
    
    // Get mouse position and raycast to terrain
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(terrainRef.current!, true);
    
    if (intersects.length > 0) {
      const intersectPoint = intersects[0].point;
      
      setDrawingState(prev => ({
        ...prev,
        isDrawing: true,
        startPosition: intersectPoint.clone(),
        currentAnnotation: {
          id: generateAnnotationId(),
          shape: prev.drawingMode!,
          position: intersectPoint.clone(),
          color: getDefaultColorForDrawingMode(prev.drawingMode!),
          opacity: 0.7,
          data: {
            title: `New ${prev.drawingMode} annotation`,
            description: '',
            lastUpdated: new Date()
          }
        }
      }));
    }
  }, [enableDrawing, drawingState.drawingMode, camera, raycaster, gl.domElement]);
  
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enableDrawing) return;
    
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(terrainRef.current!, true);
    
    if (intersects.length > 0) {
      const intersectPoint = intersects[0].point;
      setHoverPosition(intersectPoint);
      
      // Update drawing preview if currently drawing
      if (drawingState.isDrawing && drawingState.startPosition && drawingState.currentAnnotation) {
        const distance = drawingState.startPosition.distanceTo(intersectPoint);
        
        setDrawingState(prev => ({
          ...prev,
          currentAnnotation: {
            ...prev.currentAnnotation!,
            size: prev.currentAnnotation!.shape === 'circle' ? distance : [distance, distance]
          }
        }));
      }
    }
  }, [enableDrawing, drawingState.isDrawing, drawingState.startPosition, camera, raycaster, gl.domElement]);
  
  const handleMouseUp = useCallback(() => {
    if (!enableDrawing || !drawingState.isDrawing || !drawingState.currentAnnotation) return;
    
    // Complete the annotation
    const completedAnnotation = {
      ...drawingState.currentAnnotation,
      type: 'custom' as const
    } as AgriculturalAnnotation;
    
    // Show annotation form for data entry
    setNewAnnotationData(completedAnnotation);
    setShowAnnotationForm(true);
    
    // Reset drawing state
    setDrawingState({
      isDrawing: false,
      drawingMode: null,
      startPosition: null,
      currentAnnotation: null,
      previewPoints: []
    });
  }, [enableDrawing, drawingState.isDrawing, drawingState.currentAnnotation]);
  
  // Mouse event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, gl.domElement]);
  
  // Render terrain based on configuration
  const renderTerrain = () => {
    const commonProps = {
      ref: terrainRef,
      position: terrainConfig.position,
      onClick: (event: any) => {
        if (onTerrainAnalysis) {
          const position = event.point;
          // Simulate terrain analysis data
          const analysis = {
            elevation: position.y,
            slope: Math.random() * 30, // degrees
            aspect: Math.random() * 360, // degrees
            soilType: ['clay', 'sand', 'loam', 'silt'][Math.floor(Math.random() * 4)],
            drainageClass: ['well-drained', 'moderately-drained', 'poorly-drained'][Math.floor(Math.random() * 3)],
            erosionRisk: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)]
          };
          onTerrainAnalysis(position, analysis);
        }
      }
    };
    
    switch (terrainConfig.type) {
      case 'lod':
        return (
          <LODTerrain
            {...commonProps}
            width={terrainConfig.size[0]}
            depth={terrainConfig.size[2]}
            maxHeight={terrainConfig.size[1]}
            heightMap={terrainConfig.heightMap}
            baseTexture={terrainConfig.textures?.base}
            detailTexture={terrainConfig.textures?.detail}
            normalMap={terrainConfig.textures?.normal}
          />
        );
      case 'textured':
        return (
          <TexturedTerrain
            {...commonProps}
            size={terrainConfig.size}
            heightMap={terrainConfig.heightMap}
            textures={terrainConfig.textures}
            resolution={terrainConfig.resolution || 128}
          />
        );
      default:
        return (
          <BasicTerrain
            {...commonProps}
            size={Math.max(terrainConfig.size[0], terrainConfig.size[2])}
            position={terrainConfig.position}
          />
        );
    }
  };
  
  // Render agricultural annotations
  const renderAnnotations = () => {
    return annotations.map(annotation => (
      <group key={annotation.id} position={annotation.position}>
        {/* Annotation shape */}
        {annotation.shape === 'circle' && (
          <mesh
            position={[0, 0.1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={() => {
              setSelectedAnnotation(annotation);
              onSelectAnnotation?.(annotation);
            }}
          >
            <ringGeometry args={[typeof annotation.size === 'number' ? annotation.size * 0.8 : annotation.size[0] * 0.8, typeof annotation.size === 'number' ? annotation.size : annotation.size[0], 32]} />
            <meshBasicMaterial
              color={annotation.color}
              transparent
              opacity={annotation.opacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {annotation.shape === 'square' && (
          <mesh
            position={[0, 0.1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={() => {
              setSelectedAnnotation(annotation);
              onSelectAnnotation?.(annotation);
            }}
          >
            <planeGeometry 
              args={Array.isArray(annotation.size) ? annotation.size : [annotation.size, annotation.size]} 
            />
            <meshBasicMaterial
              color={annotation.color}
              transparent
              opacity={annotation.opacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Annotation label */}
        <Text
          position={[0, 2, 0]}
          fontSize={1}
          color={annotation.color}
          anchorX="center"
          anchorY="middle"
        >
          {annotation.data.title}
        </Text>
        
        {/* Data visualization */}
        {showSoilAnalysis && annotation.data.soilType && (
          <Html position={[0, 1, 0]} center>
            <div style={{ 
              background: 'rgba(0,0,0,0.8)', 
              color: 'white', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              pointerEvents: 'none'
            }}>
              Soil: {annotation.data.soilType}
              {annotation.data.ph && <><br/>pH: {annotation.data.ph.toFixed(1)}</>}
            </div>
          </Html>
        )}
      </group>
    ));
  };
  
  // Render drawing preview
  const renderDrawingPreview = () => {
    if (!drawingState.isDrawing || !drawingState.currentAnnotation) return null;
    
    const annotation = drawingState.currentAnnotation;
    
    return (
      <group position={annotation.position}>
        {annotation.shape === 'circle' && (
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[typeof annotation.size === 'number' ? annotation.size * 0.8 : 0, typeof annotation.size === 'number' ? annotation.size : 1, 32]} />
            <meshBasicMaterial color={annotation.color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}
        
        {annotation.shape === 'square' && (
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={Array.isArray(annotation.size) ? annotation.size : [annotation.size || 1, annotation.size || 1]} />
            <meshBasicMaterial color={annotation.color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    );
  };
  
  // Render weather data overlay
  const renderWeatherOverlay = () => {
    if (!showWeatherOverlay) return null;
    
    return weatherData.map((weather, index) => (
      <group key={index} position={weather.position}>
        {/* Weather station marker */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#00aaff" />
        </mesh>
        
        {/* Weather data display */}
        <Html position={[0, 2, 0]} center>
          <div style={{
            background: 'rgba(0,170,255,0.9)',
            color: 'white',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '11px',
            minWidth: '120px'
          }}>
            <div>🌡️ {weather.temperature.toFixed(1)}°C</div>
            <div>💧 {weather.humidity.toFixed(0)}%</div>
            <div>💨 {weather.windSpeed.toFixed(1)} m/s</div>
            <div>🌱 Soil: {weather.soilMoisture.toFixed(0)}%</div>
          </div>
        </Html>
      </group>
    ));
  };
  
  return (
    <>
      {/* Terrain */}
      {renderTerrain()}
      
      {/* Annotations */}
      <group ref={annotationsGroupRef}>
        {renderAnnotations()}
        {renderDrawingPreview()}
      </group>
      
      {/* Weather overlay */}
      <group ref={weatherOverlayRef}>
        {renderWeatherOverlay()}
      </group>
      
      {/* Drawing Tools UI */}
      {enableDrawing && (
        <Html position={[0, 0, 0]} style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000 }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.9)', 
            padding: '10px', 
            borderRadius: '8px',
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={() => setDrawingState(prev => ({ ...prev, drawingMode: 'circle' }))}
              style={{ 
                padding: '8px 12px', 
                background: drawingState.drawingMode === 'circle' ? '#0066cc' : '#f0f0f0',
                color: drawingState.drawingMode === 'circle' ? 'white' : 'black',
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔵 Circle
            </button>
            <button
              onClick={() => setDrawingState(prev => ({ ...prev, drawingMode: 'square' }))}
              style={{ 
                padding: '8px 12px', 
                background: drawingState.drawingMode === 'square' ? '#0066cc' : '#f0f0f0',
                color: drawingState.drawingMode === 'square' ? 'white' : 'black',
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ⏹️ Square
            </button>
            <button
              onClick={() => setDrawingState(prev => ({ ...prev, drawingMode: null }))}
              style={{ 
                padding: '8px 12px', 
                background: '#ff4444',
                color: 'white',
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ❌ Clear
            </button>
          </div>
        </Html>
      )}
      
      {/* Annotation Form Modal */}
      {showAnnotationForm && (
        <Html position={[0, 0, 0]} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2000 }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            minWidth: '300px'
          }}>
            <h3>Create Agricultural Annotation</h3>
            <div style={{ marginBottom: '10px' }}>
              <label>Title:</label>
              <input
                type="text"
                value={newAnnotationData.data?.title || ''}
                onChange={(e) => setNewAnnotationData(prev => ({
                  ...prev,
                  data: { ...prev.data, title: e.target.value }
                }))}
                style={{ width: '100%', padding: '4px', marginTop: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Type:</label>
              <select
                value={newAnnotationData.type || 'custom'}
                onChange={(e) => setNewAnnotationData(prev => ({ ...prev, type: e.target.value as any }))}
                style={{ width: '100%', padding: '4px', marginTop: '4px' }}
              >
                <option value="soil_analysis">Soil Analysis</option>
                <option value="crop_area">Crop Area</option>
                <option value="irrigation">Irrigation</option>
                <option value="weather_station">Weather Station</option>
                <option value="drainage">Drainage</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Description:</label>
              <textarea
                value={newAnnotationData.data?.description || ''}
                onChange={(e) => setNewAnnotationData(prev => ({
                  ...prev,
                  data: { ...prev.data, description: e.target.value }
                }))}
                style={{ width: '100%', padding: '4px', marginTop: '4px', height: '60px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAnnotationForm(false)}
                style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onCreateAnnotation && newAnnotationData) {
                    onCreateAnnotation(newAnnotationData as AgriculturalAnnotation);
                  }
                  setShowAnnotationForm(false);
                  setNewAnnotationData({});
                }}
                style={{ padding: '8px 16px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Create
              </button>
            </div>
          </div>
        </Html>
      )}
    </>
  );
};

// Helper functions
function generateAnnotationId(): string {
  return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDefaultColorForDrawingMode(mode: 'circle' | 'square' | 'polygon'): string {
  switch (mode) {
    case 'circle': return '#00aa00';
    case 'square': return '#aa6600';
    case 'polygon': return '#0066aa';
    default: return '#666666';
  }
}

export default AgriculturalTerrainAnalysis; 
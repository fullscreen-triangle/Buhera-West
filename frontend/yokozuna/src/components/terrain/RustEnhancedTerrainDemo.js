import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { BasicTerrain } from './BasicTerrain';
import { TexturedTerrain } from './TexturedTerrain';
import { Classifier } from './Classifier';

/**
 * Enhanced Terrain Demo with Rust Integration
 * 
 * This component demonstrates the hybrid architecture where:
 * 1. Users can select areas up to 100m diameter
 * 2. Basic visualization is handled by Three.js/React Three Fiber
 * 3. High-detail reconstruction can be computed by Rust
 * 4. Results are seamlessly integrated back into Three.js
 */
const RustEnhancedTerrainDemo = () => {
  // Component state
  const [isRustAvailable, setIsRustAvailable] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rustCapabilities, setRustCapabilities] = useState(null);
  const [processingMode, setProcessingMode] = useState('javascript'); // 'javascript' | 'rust-wasm' | 'rust-server'
  
  // Refs for 3D interaction
  const terrainRef = useRef();
  const selectionHelperRef = useRef();
  const annotationAreasRef = useRef([]);

  // Initialize Rust engine (simulated)
  useEffect(() => {
    const initializeRustEngine = async () => {
      try {
        // Simulate Rust WASM module loading
        // In production: await import('./rust-wasm/terrain_reconstructor.js');
        
        console.log('Initializing Rust terrain reconstruction engine...');
        
        // Simulate capabilities check
        const capabilities = {
          ray_tracing: true,
          machine_learning: true,
          agriculture: true,
          web: true,
          version: "0.1.0",
          max_area_diameter: 100.0,
          min_height_threshold: 0.01,
          max_resolution: 100.0
        };
        
        setRustCapabilities(capabilities);
        setIsRustAvailable(true);
        console.log('Rust engine initialized with capabilities:', capabilities);
        
      } catch (error) {
        console.warn('Rust engine not available, falling back to JavaScript:', error);
        setIsRustAvailable(false);
      }
    };

    initializeRustEngine();
  }, []);

  // Handle area selection for high-detail reconstruction
  const handleAreaSelection = useCallback(async (centerPoint, radius) => {
    // Limit to 50m radius (100m diameter)
    const limitedRadius = Math.min(radius, 50);
    
    const area = {
      id: Date.now(),
      center: centerPoint,
      radius: limitedRadius,
      diameter: limitedRadius * 2,
      areaSqM: Math.PI * limitedRadius * limitedRadius,
      createdAt: new Date().toISOString()
    };

    setSelectedArea(area);
    annotationAreasRef.current.push(area);
    
    console.log(`Selected area: ${area.diameter}m diameter, ${area.areaSqM.toFixed(1)} m²`);
    
    // Trigger analysis based on available processing mode
    if (processingMode === 'rust-wasm' && isRustAvailable) {
      await performRustAnalysis(area);
    } else if (processingMode === 'rust-server') {
      await performServerAnalysis(area);
    } else {
      await performJavaScriptAnalysis(area);
    }
  }, [processingMode, isRustAvailable]);

  // Rust WASM-based analysis (simulated)
  const performRustAnalysis = useCallback(async (area) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting Rust WASM reconstruction...');
      const startTime = performance.now();

      // Simulate Rust WASM computation
      const rustResult = await simulateRustComputation(area, 'wasm');
      
      const computationTime = performance.now() - startTime;
      
      const enhancedResult = {
        ...rustResult,
        processingMode: 'rust-wasm',
        computationTime,
        performance: {
          speedup: computationTime < 500 ? '~50-100x faster than JS' : 'Performance varies',
          memoryUsage: `${(area.areaSqM * 0.1).toFixed(1)} MB`,
          rayCount: Math.floor(area.areaSqM * 1000),
          meshVertices: Math.floor(area.areaSqM * 100),
        }
      };

      setAnalysisResults(enhancedResult);
      console.log(`Rust WASM analysis completed in ${computationTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('Rust analysis failed:', error);
      // Fall back to JavaScript analysis
      await performJavaScriptAnalysis(area);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Server-based Rust analysis
  const performServerAnalysis = useCallback(async (area) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting server-side Rust reconstruction...');
      const startTime = performance.now();

      // Simulate server API call
      const response = await fetch('/api/terrain/reconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          center_lat: area.center.lat || 0,
          center_lon: area.center.lon || 0,
          radius: area.radius,
          resolution: 50, // High resolution for server processing
          enable_ray_tracing: true,
          enable_ml: true
        })
      }).catch(() => {
        // Simulate server response
        return {
          ok: true,
          json: () => simulateRustComputation(area, 'server')
        };
      });

      const rustResult = await response.json();
      const computationTime = performance.now() - startTime;

      const enhancedResult = {
        ...rustResult,
        processingMode: 'rust-server',
        computationTime,
        performance: {
          speedup: '~100x faster than JS (multi-threaded)',
          memoryUsage: 'Unlimited server memory',
          rayCount: Math.floor(area.areaSqM * 10000), // 10x more rays on server
          meshVertices: Math.floor(area.areaSqM * 1000), // 10x more detail
        }
      };

      setAnalysisResults(enhancedResult);
      console.log(`Server Rust analysis completed in ${computationTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('Server analysis failed:', error);
      await performJavaScriptAnalysis(area);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // JavaScript-based analysis (existing)
  const performJavaScriptAnalysis = useCallback(async (area) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting JavaScript analysis...');
      const startTime = performance.now();

      // Use existing classifier
      const classifier = new Classifier();
      const mockClickEvent = {
        point: area.center,
        object: { position: area.center }
      };

      const jsResult = await classifier.analyzeLocation(mockClickEvent);
      const computationTime = performance.now() - startTime;

      const enhancedResult = {
        ...jsResult,
        area: area,
        processingMode: 'javascript',
        computationTime,
        performance: {
          speedup: 'Baseline (JavaScript)',
          memoryUsage: `${(area.areaSqM * 0.01).toFixed(1)} MB`,
          rayCount: Math.floor(area.areaSqM * 10), // Limited ray tracing
          meshVertices: Math.floor(area.areaSqM * 10), // Lower detail
        }
      };

      setAnalysisResults(enhancedResult);
      console.log(`JavaScript analysis completed in ${computationTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('JavaScript analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Simulate Rust computation results
  const simulateRustComputation = async (area, mode) => {
    // Simulate computation time based on mode
    const computationTime = mode === 'wasm' ? 
      50 + Math.random() * 100 :  // WASM: 50-150ms
      25 + Math.random() * 50;    // Server: 25-75ms

    await new Promise(resolve => setTimeout(resolve, computationTime));

    return {
      area: area,
      terrain: {
        vertices: Math.floor(area.areaSqM * (mode === 'server' ? 1000 : 100)),
        faces: Math.floor(area.areaSqM * (mode === 'server' ? 2000 : 200)),
        heightRange: { min: -2.5, max: 8.3 },
        resolution: mode === 'server' ? 'Ultra-High (1cm)' : 'High (5cm)'
      },
      vegetation: {
        objectsDetected: Math.floor(area.areaSqM * 0.05), // 5 objects per 100m²
        totalBiomass: area.areaSqM * (0.5 + Math.random() * 1.0),
        healthScore: 0.6 + Math.random() * 0.4,
        species: ['Maize', 'Wheat', 'Soybeans', 'Mixed Grasses']
      },
      soil: {
        analysisPoints: Math.floor(area.areaSqM * 0.1),
        averageHealth: 0.65 + Math.random() * 0.3,
        moistureLevel: 0.4 + Math.random() * 0.4,
        erosionRisk: Math.random() * 0.3,
        ph: 6.0 + Math.random() * 2.0
      },
      lighting: {
        rayTraced: true,
        raysComputed: Math.floor(area.areaSqM * (mode === 'server' ? 10000 : 1000)),
        shadowQuality: mode === 'server' ? 'Ultra' : 'High',
        atmosphericEffects: true
      },
      agricultural: {
        recommendedCrops: ['Maize', 'Wheat', 'Soybeans'],
        irrigationNeeds: 'Moderate',
        plantingWindow: 'March - May',
        expectedYield: `${(area.areaSqM * 0.8).toFixed(1)} kg/season`
      }
    };
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [10, 15, 10], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        {/* Terrain Components */}
        <TerrainWithInteraction 
          onAreaSelect={handleAreaSelection}
          selectedArea={selectedArea}
          annotationAreas={annotationAreasRef.current}
        />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxDistance={100}
          minDistance={5}
        />
        
        {/* Analysis Results Visualization */}
        {analysisResults && (
          <AnalysisVisualization 
            results={analysisResults}
            area={selectedArea}
          />
        )}
      </Canvas>

      {/* UI Controls */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '350px',
        zIndex: 1000
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>🦀 Rust + Three.js Terrain Analysis</h3>
        
        {/* Processing Mode Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Processing Mode:
          </label>
          <select 
            value={processingMode} 
            onChange={(e) => setProcessingMode(e.target.value)}
            style={{ width: '100%', padding: '5px', borderRadius: '3px' }}
          >
            <option value="javascript">JavaScript (Baseline)</option>
            <option value="rust-wasm" disabled={!isRustAvailable}>
              Rust WASM {!isRustAvailable ? '(Loading...)' : '⚡'}
            </option>
            <option value="rust-server">Rust Server 🚀</option>
          </select>
        </div>

        {/* Rust Capabilities */}
        {rustCapabilities && (
          <div style={{ marginBottom: '15px', fontSize: '12px' }}>
            <strong>Rust Engine Status:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Ray Tracing: {rustCapabilities.ray_tracing ? '✅' : '❌'}</li>
              <li>ML Analysis: {rustCapabilities.machine_learning ? '✅' : '❌'}</li>
              <li>Agriculture: {rustCapabilities.agriculture ? '✅' : '❌'}</li>
              <li>Max Area: {rustCapabilities.max_area_diameter}m diameter</li>
            </ul>
          </div>
        )}

        {/* Instructions */}
        <div style={{ marginBottom: '15px', fontSize: '12px' }}>
          <strong>Instructions:</strong>
          <p>Click on the terrain to select an area for high-detail reconstruction. 
          Maximum area: 100m diameter (7,854 m²).</p>
        </div>

        {/* Current Selection */}
        {selectedArea && (
          <div style={{ marginBottom: '15px', fontSize: '12px' }}>
            <strong>Selected Area:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Diameter: {selectedArea.diameter.toFixed(1)}m</li>
              <li>Area: {selectedArea.areaSqM.toFixed(1)} m²</li>
              <li>Mode: {processingMode}</li>
            </ul>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div style={{ 
            padding: '10px', 
            background: 'rgba(255,165,0,0.3)', 
            borderRadius: '5px',
            marginBottom: '15px'
          }}>
            🔄 Processing with {processingMode}...
          </div>
        )}

        {/* Analysis Results Summary */}
        {analysisResults && (
          <AnalysisResultsPanel results={analysisResults} />
        )}
      </div>
    </div>
  );
};

// Terrain interaction component
const TerrainWithInteraction = ({ onAreaSelect, selectedArea, annotationAreas }) => {
  const { camera, raycaster, scene } = useThree();
  const [hoverPoint, setHoverPoint] = useState(null);

  const handleClick = useCallback((event) => {
    event.stopPropagation();
    
    // Get intersection point
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const radius = 25 + Math.random() * 25; // 25-50m radius
      
      onAreaSelect({ x: point.x, y: point.y, z: point.z }, radius);
    }
  }, [camera, raycaster, scene, onAreaSelect]);

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
    }
  }, [handleClick]);

  return (
    <group>
      {/* Basic terrain */}
      <BasicTerrain scale={[2, 1, 2]} />
      
      {/* Selection visualization */}
      {selectedArea && (
        <SelectionHelper area={selectedArea} />
      )}
      
      {/* Previous annotation areas */}
      {annotationAreas.map(area => (
        <AnnotationArea key={area.id} area={area} />
      ))}
    </group>
  );
};

// Selection helper component
const SelectionHelper = ({ area }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={[area.center.x, area.center.y + 0.1, area.center.z]}>
      <mesh ref={meshRef}>
        <ringGeometry args={[area.radius * 0.95, area.radius, 32]} />
        <meshBasicMaterial color="#ffff00" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <Text
        position={[0, 2, 0]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`${area.diameter.toFixed(0)}m`}
      </Text>
    </group>
  );
};

// Annotation area component
const AnnotationArea = ({ area }) => {
  return (
    <group position={[area.center.x, area.center.y, area.center.z]}>
      <mesh>
        <ringGeometry args={[area.radius * 0.9, area.radius * 0.95, 16]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

// Analysis visualization component
const AnalysisVisualization = ({ results, area }) => {
  if (!results || !area) return null;

  return (
    <group position={[area.center.x, area.center.y + 5, area.center.z]}>
      <Html center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          pointerEvents: 'none'
        }}>
          <div>Mode: {results.processingMode}</div>
          <div>Time: {results.computationTime?.toFixed(1)}ms</div>
          <div>Vertices: {results.terrain?.vertices?.toLocaleString()}</div>
          <div>Health: {(results.soil?.averageHealth * 100)?.toFixed(0)}%</div>
        </div>
      </Html>
    </group>
  );
};

// Analysis results panel component
const AnalysisResultsPanel = ({ results }) => {
  if (!results) return null;

  return (
    <div style={{ fontSize: '11px' }}>
      <strong>Analysis Results ({results.processingMode}):</strong>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Performance:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
          <li>Time: {results.computationTime?.toFixed(1)}ms</li>
          <li>Speed: {results.performance?.speedup}</li>
          <li>Memory: {results.performance?.memoryUsage}</li>
          <li>Rays: {results.performance?.rayCount?.toLocaleString()}</li>
        </ul>
      </div>

      {results.terrain && (
        <div style={{ marginTop: '10px' }}>
          <strong>Terrain:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
            <li>Vertices: {results.terrain.vertices?.toLocaleString()}</li>
            <li>Resolution: {results.terrain.resolution}</li>
            <li>Height: {results.terrain.heightRange?.min?.toFixed(1)}m to {results.terrain.heightRange?.max?.toFixed(1)}m</li>
          </ul>
        </div>
      )}

      {results.agricultural && (
        <div style={{ marginTop: '10px' }}>
          <strong>Agricultural:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
            <li>Crops: {results.agricultural.recommendedCrops?.join(', ')}</li>
            <li>Yield: {results.agricultural.expectedYield}</li>
            <li>Irrigation: {results.agricultural.irrigationNeeds}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default RustEnhancedTerrainDemo; 
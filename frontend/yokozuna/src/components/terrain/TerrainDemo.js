import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BasicTerrain from './BasicTerrain';
import { AgriculturalTerrainAnalyzer } from './Classifier';

/**
 * Simple Terrain Analysis Demo
 * Demonstrates agricultural terrain analysis capabilities
 */
const TerrainDemo = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);

  // Sample weather data
  const sampleWeatherData = [
    {
      temperature: 25,
      humidity: 65,
      windSpeed: 8,
      precipitation: 45,
      soilMoisture: 35,
      timestamp: new Date()
    }
  ];

  // Handle terrain click
  const handleTerrainClick = useCallback((event) => {
    const position = event.point;
    setClickPosition(position);

    // Simulate terrain data
    const terrainData = {
      position,
      elevation: position.y,
      slope: Math.random() * 30,
      aspect: Math.random() * 360,
      drainageIndex: Math.random()
    };

    // Perform agricultural analysis
    const analysis = AgriculturalTerrainAnalyzer.analyzeTerrainForAgriculture(
      terrainData,
      sampleWeatherData,
      ['maize', 'wheat', 'soybeans']
    );

    setAnalysisResult(analysis);
    console.log('Terrain Analysis:', analysis);
  }, []);

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      {/* 3D Terrain Viewer */}
      <Canvas camera={{ position: [30, 20, 30] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        
        <BasicTerrain
          size={50}
          onClick={handleTerrainClick}
          color="#3a7e3d"
        />
        
        {/* Click indicator */}
        {clickPosition && (
          <mesh position={[clickPosition.x, clickPosition.y + 0.5, clickPosition.z]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        )}
        
        <OrbitControls />
      </Canvas>

      {/* Analysis Results Panel */}
      {analysisResult && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '300px',
          fontSize: '14px'
        }}>
          <h3>Agricultural Analysis</h3>
          
          {/* Soil Analysis */}
          {analysisResult.soilAnalysis && (
            <div style={{ marginBottom: '10px' }}>
              <h4>Soil Type: {analysisResult.soilAnalysis.type}</h4>
              <p>pH: {analysisResult.soilAnalysis.ph_range?.join(' - ')}</p>
              <p>Suitable crops: {analysisResult.soilAnalysis.suitability?.join(', ')}</p>
            </div>
          )}

          {/* Crop Suitability */}
          {analysisResult.cropSuitability && (
            <div style={{ marginBottom: '10px' }}>
              <h4>Crop Suitability:</h4>
              {Object.entries(analysisResult.cropSuitability).map(([crop, data]) => (
                <div key={crop}>
                  {crop}: {data.suitable ? '✓' : '✗'} ({data.suitabilityScore}%)
                </div>
              ))}
            </div>
          )}

          {/* Overall Score */}
          <div>
            <strong>Overall Suitability: {analysisResult.overallSuitability?.toFixed(0)}%</strong>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        Click on the terrain to analyze soil and crop suitability
      </div>
    </div>
  );
};

export default TerrainDemo; 
import { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with Three.js
const MercatorVisualization = dynamic(
  () => import('../components/mercator/MercatorVisualization'),
  { ssr: false }
);

const MercatorPage = () => {
  const [sphereCount, setSphereCount] = useState(100);
  const [enableEnvironmentalData, setEnableEnvironmentalData] = useState(true);
  const [showPerformanceStats, setShowPerformanceStats] = useState(true);
  const [targetFPS, setTargetFPS] = useState(60);

  return (
    <>
      <Head>
        <title>Mercator Projection - Environmental Intelligence</title>
        <meta name="description" content="3D Mercator projection visualization with environmental data integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="w-full h-screen relative">
        {/* Controls panel */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded z-10">
          <div className="text-lg font-bold mb-4">Visualization Controls</div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Sphere Count: {sphereCount}
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              value={sphereCount}
              onChange={(e) => setSphereCount(parseInt(e.target.value))}
              className="w-full"
              aria-label="Sphere count control"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Target FPS: {targetFPS}
            </label>
            <input
              type="range"
              min="30"
              max="120"
              value={targetFPS}
              onChange={(e) => setTargetFPS(parseInt(e.target.value))}
              className="w-full"
              aria-label="Target FPS control"
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={enableEnvironmentalData}
                onChange={(e) => setEnableEnvironmentalData(e.target.checked)}
                className="mr-2"
              />
              Enable Environmental Data
            </label>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPerformanceStats}
                onChange={(e) => setShowPerformanceStats(e.target.checked)}
                className="mr-2"
              />
              Show Performance Stats
            </label>
          </div>
        </div>
        
        {/* Information panel */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded z-10 max-w-md">
          <div className="text-lg font-bold mb-2">Mercator Projection</div>
          <p className="text-sm mb-2">
            This visualization demonstrates environmental data spheres projected using 
            the Mercator projection system. Each sphere represents atmospheric conditions 
            at different global locations.
          </p>
          <div className="text-xs text-gray-300">
            <div>• Hover over spheres to see environmental data</div>
            <div>• Colors represent temperature variations</div>
            <div>• Opacity shows humidity levels</div>
            <div>• Animation speed indicates wind velocity</div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded z-10">
          <div className="text-sm font-bold mb-2">Environmental Legend</div>
          <div className="text-xs space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>High Temperature</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Low Temperature</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Moderate Temperature</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 opacity-30"></div>
              <span>Low Humidity</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 opacity-90"></div>
              <span>High Humidity</span>
            </div>
          </div>
        </div>
        
        {/* Main visualization */}
        <MercatorVisualization
          sphereCount={sphereCount}
          enableEnvironmentalData={enableEnvironmentalData}
          showPerformanceStats={showPerformanceStats}
          targetFPS={targetFPS}
        />
      </div>
    </>
  );
};

export default MercatorPage; 
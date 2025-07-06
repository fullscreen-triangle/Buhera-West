import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls, Environment } from '@react-three/drei';

const CropFieldVisualization = dynamic(
  () => import('../../components/agriculture/CropFieldVisualization'),
  { ssr: false }
);

const AirlineTrafficVisualization = dynamic(
  () => import('../../components/airlines/AirlineTrafficVisualization'),
  { ssr: false }
);

const TubeVisualization = dynamic(
  () => import('../../components/tubes/TubeVisualization'),
  { ssr: false }
);

const AgriculturalAviationPage = () => {
  const [visualizationType, setVisualizationType] = useState('crop_fields');
  const [visualMode, setVisualMode] = useState('growth_stage');
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [seasonalTime, setSeasonalTime] = useState(180); // Day of year (0-365)
  const [timeOfDay, setTimeOfDay] = useState(12); // Hour of day (0-24)
  const [qualityLevel, setQualityLevel] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-advance time when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      if (visualizationType === 'crop_fields') {
        setSeasonalTime(prev => (prev + 1) % 365);
      } else if (visualizationType === 'airline_traffic') {
        setTimeOfDay(prev => (prev + 0.5) % 24);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, visualizationType]);

  return (
    <>
      <Head>
        <title>Agricultural & Aviation Intelligence - Environmental Platform</title>
        <meta name="description" content="Crop field monitoring and airline traffic visualization with environmental data integration" />
      </Head>
      
      <div className="w-full h-screen relative bg-gray-900">
        {/* Main Visualization Canvas */}
        <div className="w-full h-full">
          <Canvas
            camera={{ position: [0, 500, 1000], fov: 60 }}
            shadows
            gl={{ antialias: true }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[1000, 1000, 500]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              color="#FFF8DC"
            />
            
            {/* Render appropriate visualization */}
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
                showFlowParticles={true}
              />
            )}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
            <Environment background preset="night" />
            <Stats />
          </Canvas>
        </div>

        {/* Top Left - Visualization Type Selector */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded z-10">
          <h3 className="text-lg font-bold mb-3">Visualization Type</h3>
          <div className="space-y-2">
            {[
              { key: 'crop_fields', label: 'Agricultural Fields', icon: '🌾' },
              { key: 'airline_traffic', label: 'Airline Traffic', icon: '✈️' },
              { key: 'tubes', label: 'Environmental Tubes', icon: '🌊' }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setVisualizationType(type.key)}
                className={`w-full px-3 py-2 rounded text-sm flex items-center space-x-2 ${
                  visualizationType === type.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Right - Mode Controls */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded z-10">
          <h3 className="text-lg font-bold mb-3">
            {visualizationType === 'crop_fields' ? 'Agricultural Mode' : 
             visualizationType === 'airline_traffic' ? 'Traffic Mode' : 'Tube Mode'}
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
                  Time of Day ({String(Math.floor(timeOfDay)).padStart(2, '0')}:{String(Math.floor((timeOfDay % 1) * 60)).padStart(2, '0')})
                </label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.5"
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

          {visualizationType === 'tubes' && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Spiral Complexity
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={20}
                className="w-full"
              />
            </div>
          )}

          {/* Animation Controls */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Animation Speed
            </label>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-full px-3 py-2 rounded text-sm ${
              isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
        </div>

        {/* Bottom Left - Data Statistics Panel */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded z-10">
          <h3 className="text-lg font-bold mb-2">Live Statistics</h3>
          {visualizationType === 'crop_fields' && (
            <CropFieldStats seasonalTime={seasonalTime} />
          )}
          {visualizationType === 'airline_traffic' && (
            <AirlineTrafficStats timeOfDay={timeOfDay} />
          )}
          {visualizationType === 'tubes' && (
            <TubeStats />
          )}
        </div>

        {/* Bottom Right - Information Panel */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded z-10 max-w-sm">
          <h3 className="text-lg font-bold mb-2">Information</h3>
          {visualizationType === 'crop_fields' && (
            <div className="text-sm">
              <p className="mb-2">
                Visualizing agricultural crop fields with real-time growth simulation, 
                yield predictions, and environmental factors.
              </p>
              <div className="space-y-1">
                <div><strong>Height:</strong> Growth stage + yield</div>
                <div><strong>Color:</strong> Based on selected mode</div>
                <div><strong>Animation:</strong> Seasonal growth cycles</div>
              </div>
            </div>
          )}
          {visualizationType === 'airline_traffic' && (
            <div className="text-sm">
              <p className="mb-2">
                Real-time airline traffic visualization with great circle routes, 
                aircraft simulation, and time-based traffic patterns.
              </p>
              <div className="space-y-1">
                <div><strong>Lines:</strong> Flight routes</div>
                <div><strong>Markers:</strong> Airports</div>
                <div><strong>Aircraft:</strong> Live flight simulation</div>
              </div>
            </div>
          )}
          {visualizationType === 'tubes' && (
            <div className="text-sm">
              <p className="mb-2">
                Environmental tube visualization with fluid dynamics, 
                particle flow, and environmental parameter influence.
              </p>
              <div className="space-y-1">
                <div><strong>Shape:</strong> Environmental influence</div>
                <div><strong>Color:</strong> Temperature + velocity</div>
                <div><strong>Particles:</strong> Flow visualization</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Statistics Components
const CropFieldStats = ({ seasonalTime }) => (
  <div className="text-sm space-y-1">
    <div>Active Fields: <span className="text-green-400">247</span></div>
    <div>Total Area: <span className="text-green-400">15,420 ha</span></div>
    <div>Avg Yield: <span className="text-green-400">8.2 t/ha</span></div>
    <div>Irrigation: <span className="text-blue-400">68%</span></div>
    <div>Season Progress: <span className="text-yellow-400">{Math.round((seasonalTime / 365) * 100)}%</span></div>
  </div>
);

const AirlineTrafficStats = ({ timeOfDay }) => (
  <div className="text-sm space-y-1">
    <div>Active Routes: <span className="text-blue-400">156</span></div>
    <div>Daily Flights: <span className="text-blue-400">2,340</span></div>
    <div>Passengers: <span className="text-blue-400">284,520</span></div>
    <div>Aircraft Aloft: <span className="text-yellow-400">{Math.floor(87 * getTrafficMultiplier(timeOfDay))}</span></div>
    <div>On-Time: <span className="text-green-400">78%</span></div>
  </div>
);

const TubeStats = () => (
  <div className="text-sm space-y-1">
    <div>Active Tubes: <span className="text-purple-400">5</span></div>
    <div>Flow Rate: <span className="text-blue-400">45.2 m/s</span></div>
    <div>Pressure: <span className="text-red-400">1,150 Pa</span></div>
    <div>Temperature: <span className="text-orange-400">23.5°C</span></div>
    <div>Particles: <span className="text-green-400">1,247</span></div>
  </div>
);

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

function getTrafficMultiplier(hour) {
  if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
    return 1.5; // Peak hours
  } else if (hour >= 22 || hour <= 5) {
    return 0.3; // Red-eye flights
  } else {
    return 1.0; // Normal operations
  }
}

export default AgriculturalAviationPage; 
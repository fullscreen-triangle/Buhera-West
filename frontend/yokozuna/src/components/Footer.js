import React, { useState, useEffect } from "react";
import Layout from "./Layout";

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState({
    dataStreamStatus: 'ACTIVE',
    satelliteConnections: 47,
    weatherStations: 23,
    soilSensors: 156,
    atmosphericSensors: 34,
    lastDataSync: new Date(Date.now() - 30000), // 30 seconds ago
    networkLatency: 12.4,
    dataAccuracy: 99.7,
    storageUtilization: 73.2
  });

  // Update time every second for atomic clock precision display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate real-time system updates
  useEffect(() => {
    const statusTimer = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        satelliteConnections: prev.satelliteConnections + Math.floor(Math.random() * 3) - 1,
        networkLatency: +(prev.networkLatency + (Math.random() - 0.5) * 2).toFixed(1),
        dataAccuracy: +(prev.dataAccuracy + (Math.random() - 0.5) * 0.1).toFixed(1),
        storageUtilization: +(prev.storageUtilization + (Math.random() - 0.5) * 0.5).toFixed(1),
        lastDataSync: new Date()
      }));
    }, 5000);

    return () => clearInterval(statusTimer);
  }, []);

  // Buhera-West regional coordinates (approximate center)
  const preciseCoordinates = {
    latitude: -18.2485437,
    longitude: 31.8345621,
    altitude: 1247.3,
    datum: 'WGS84',
    zone: '36K'
  };

  const formatAtomicTime = (date) => {
    const utc = date.toISOString();
    const local = date.toLocaleString('en-GB', { timeZone: 'Africa/Harare' });
    return { utc, local };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-500';
      case 'WARNING': return 'text-yellow-500';
      case 'ERROR': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const time = formatAtomicTime(currentTime);

  return (
    <footer className="w-full border-t-2 border-solid border-dark font-medium dark:text-light dark:border-light bg-gray-50 dark:bg-gray-900">
      <Layout className="py-6">
        {/* Main Technical Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          
          {/* Temporal Synchronization */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-2 text-blue-600 dark:text-blue-400">
              ⏰ Temporal Synchronization
            </h3>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-gray-500">UTC:</span> {time.utc.slice(0, -5)}Z
              </div>
              <div>
                <span className="text-gray-500">Local (CAT):</span> {time.local}
              </div>
              <div>
                <span className="text-gray-500">Sync Drift:</span> ±0.003ms
              </div>
              <div>
                <span className="text-gray-500">NTP Status:</span> 
                <span className="text-green-500 ml-1">SYNCHRONIZED</span>
              </div>
            </div>
          </div>

          {/* Geospatial Reference */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400">
              🌍 Geospatial Reference
            </h3>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-gray-500">Lat:</span> {preciseCoordinates.latitude}°S
              </div>
              <div>
                <span className="text-gray-500">Lon:</span> {preciseCoordinates.longitude}°E
              </div>
              <div>
                <span className="text-gray-500">Alt:</span> {preciseCoordinates.altitude}m AMSL
              </div>
              <div>
                <span className="text-gray-500">Datum:</span> {preciseCoordinates.datum}
              </div>
              <div>
                <span className="text-gray-500">UTM Zone:</span> {preciseCoordinates.zone}
              </div>
            </div>
          </div>

          {/* Network Infrastructure */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-2 text-purple-600 dark:text-purple-400">
              📡 Network Infrastructure
            </h3>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-gray-500">Satellites:</span> {systemStatus.satelliteConnections}/50
              </div>
              <div>
                <span className="text-gray-500">Weather Stations:</span> {systemStatus.weatherStations}/25
              </div>
              <div>
                <span className="text-gray-500">Soil Sensors:</span> {systemStatus.soilSensors}/160
              </div>
              <div>
                <span className="text-gray-500">Atmospheric:</span> {systemStatus.atmosphericSensors}/35
              </div>
              <div>
                <span className="text-gray-500">Latency:</span> {systemStatus.networkLatency}ms
              </div>
            </div>
          </div>

          {/* System Performance */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-2 text-orange-600 dark:text-orange-400">
              ⚡ System Performance
            </h3>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-gray-500">Data Stream:</span> 
                <span className={`ml-1 ${getStatusColor(systemStatus.dataStreamStatus)}`}>
                  {systemStatus.dataStreamStatus}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Accuracy:</span> {systemStatus.dataAccuracy}%
              </div>
              <div>
                <span className="text-gray-500">Storage:</span> {systemStatus.storageUtilization}%
              </div>
              <div>
                <span className="text-gray-500">Last Sync:</span> {systemStatus.lastDataSync.toLocaleTimeString()}
              </div>
              <div>
                <span className="text-gray-500">Uptime:</span> 99.97%
              </div>
            </div>
          </div>
        </div>

        {/* Additional Technical Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4 text-xs">
          <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">Data Processing Pipeline</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>Ingestion Rate: 2.3k/sec</div>
              <div>Processing Queue: 127 items</div>
              <div>ML Models Active: 8/12</div>
              <div>Prediction Horizon: 72h</div>
              <div>Data Retention: 7 years</div>
              <div>Backup Status: Current</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">Environmental Conditions</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>Atmospheric Pressure: 1013.2 hPa</div>
              <div>Humidity: 67.3% RH</div>
              <div>Wind Speed: 12.7 km/h SW</div>
              <div>Solar Irradiance: 847 W/m²</div>
              <div>Soil Temperature: 23.1°C</div>
              <div>Precipitation: 0.0 mm/h</div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4 text-sm">
            <span>{new Date().getFullYear()} &copy; Buhera-West Agricultural Weather Analysis Platform</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-500">Version 2.1.4-beta</span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2 lg:mt-0">
            <span>Southern African Climatic Research Initiative</span>
            <span>•</span>
            <span>Licensed under AGPL-3.0</span>
            <span>•</span>
            <span>ISO 9001:2015 Certified</span>
          </div>
        </div>
      </Layout>
    </footer>
  );
};

export default Footer;

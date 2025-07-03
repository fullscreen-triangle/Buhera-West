import React, { useState, useEffect } from 'react';
import { SatelliteGlobalMap, CellTowerGlobalMap, HardwareGlobalMap, LidarGlobalMap } from './index.js';

/**
 * Multi-Modal Atmospheric Sensor Dashboard
 * 
 * Unified interface for the buhera-west sensor ecosystem:
 * - GPS Differential Atmospheric Sensing Network
 * - Cellular Infrastructure Environmental Analysis 
 * - Hardware Oscillatory Molecular Spectrometry
 * - LiDAR Atmospheric Backscatter Monitoring
 * 
 * Features real-time switching between sensor modalities with
 * comprehensive atmospheric intelligence aggregation.
 */
const SensorDashboard = () => {
  const [activeTab, setActiveTab] = useState('satellite');
  const [systemStatus, setSystemStatus] = useState({
    satellites: { active: 0, total: 0, quality: 0 },
    cellTowers: { active: 0, total: 0, load: 0 },
    hardware: { active: 0, total: 0, efficiency: 0 },
    lidar: { active: 0, total: 0, visibility: 0 }
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate system status updates
  useEffect(() => {
    const updateSystemStatus = () => {
      setSystemStatus({
        satellites: {
          active: 28 + Math.floor(Math.random() * 4),
          total: 32,
          quality: 94 + Math.random() * 5
        },
        cellTowers: {
          active: 18250 + Math.floor(Math.random() * 500),
          total: 19500,
          load: 0.7 + Math.random() * 0.25
        },
        hardware: {
          active: 3420 + Math.floor(Math.random() * 180),
          total: 3800,
          efficiency: 0.88 + Math.random() * 0.10
        },
        lidar: {
          active: 95 + Math.floor(Math.random() * 8),
          total: 108,
          visibility: 25 + Math.random() * 20
        }
      });
      setLastUpdate(new Date());
    };

    updateSystemStatus();
    const interval = setInterval(updateSystemStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const sensorTabs = [
    {
      id: 'satellite',
      name: '🛰️ Satellite GPS',
      description: 'GPS Differential Atmospheric Sensing',
      component: SatelliteGlobalMap,
      color: '#00ff88',
      status: systemStatus.satellites
    },
    {
      id: 'cellular',
      name: '🏗️ Cell Networks',
      description: 'Cellular Infrastructure Analysis',
      component: CellTowerGlobalMap,
      color: '#ff8800',
      status: systemStatus.cellTowers
    },
    {
      id: 'hardware',
      name: '🔧 Hardware Oscillatory',
      description: 'Molecular Spectrometry Harvesting',
      component: HardwareGlobalMap,
      color: '#8800ff',
      status: systemStatus.hardware
    },
    {
      id: 'lidar',
      name: '📡 LiDAR Atmospheric',
      description: 'Backscatter & Aerosol Analysis',
      component: LidarGlobalMap,
      color: '#0088ff',
      status: systemStatus.lidar
    }
  ];

  const ActiveComponent = sensorTabs.find(tab => tab.id === activeTab)?.component;

  const getStatusColor = (tab) => {
    const activeRatio = tab.status.active / tab.status.total;
    if (activeRatio > 0.9) return '#00ff00';
    if (activeRatio > 0.8) return '#ffff00';
    if (activeRatio > 0.7) return '#ff8800';
    return '#ff4444';
  };

  return (
    <div className="sensor-dashboard" style={{
      width: '100%', height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', color: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px', borderBottom: '2px solid #333',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
              🌍 Buhera-West Multi-Modal Atmospheric Intelligence
            </h1>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
              Real-time global sensor network monitoring and atmospheric analysis
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', opacity: 0.9 }}>
            <div>Last Update: {lastUpdate.toLocaleTimeString()}</div>
            <div style={{ marginTop: '4px', color: '#00ff88' }}>
              System Status: Operational
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Tabs */}
      <div style={{
        display: 'flex', padding: '0 20px', background: 'rgba(0,0,0,0.6)',
        borderBottom: '1px solid #444', overflow: 'auto'
      }}>
        {sensorTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === tab.id ? tab.color : '#ccc',
              border: 'none', padding: '15px 20px', cursor: 'pointer',
              borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
              transition: 'all 0.3s ease', fontSize: '13px', whiteSpace: 'nowrap',
              display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '160px'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{tab.name}</div>
            <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '6px' }}>
              {tab.description}
            </div>
            <div style={{ 
              display: 'flex', alignItems: 'center', fontSize: '10px',
              color: getStatusColor(tab)
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: getStatusColor(tab), marginRight: '5px'
              }}></div>
              {tab.status.active}/{tab.status.total} Active
            </div>
          </button>
        ))}
      </div>

      {/* System Overview Bar */}
      <div style={{
        display: 'flex', padding: '12px 20px', background: 'rgba(0,0,0,0.7)',
        borderBottom: '1px solid #333', fontSize: '11px', gap: '25px',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#00ff88', marginRight: '8px' }}>🛰️ GPS:</span>
          <span>{systemStatus.satellites.active}/{systemStatus.satellites.total} | </span>
          <span style={{ color: '#00ff88' }}>{systemStatus.satellites.quality.toFixed(1)}% Quality</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#ff8800', marginRight: '8px' }}>🏗️ Cellular:</span>
          <span>{systemStatus.cellTowers.active.toLocaleString()} Active | </span>
          <span style={{ color: '#ff8800' }}>{(systemStatus.cellTowers.load * 100).toFixed(0)}% Load</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#8800ff', marginRight: '8px' }}>🔧 Hardware:</span>
          <span>{systemStatus.hardware.active}/{systemStatus.hardware.total} | </span>
          <span style={{ color: '#8800ff' }}>{(systemStatus.hardware.efficiency * 100).toFixed(0)}% Efficiency</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#0088ff', marginRight: '8px' }}>📡 LiDAR:</span>
          <span>{systemStatus.lidar.active}/{systemStatus.lidar.total} | </span>
          <span style={{ color: '#0088ff' }}>{systemStatus.lidar.visibility.toFixed(1)}km Avg Visibility</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
          <span style={{ color: '#00ffff', marginRight: '8px' }}>⚡ Total Nodes:</span>
          <span style={{ color: '#00ffff', fontWeight: 'bold' }}>
            {(systemStatus.satellites.active + systemStatus.cellTowers.active + 
              systemStatus.hardware.active + systemStatus.lidar.active).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Active Sensor Map */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {ActiveComponent && <ActiveComponent />}
        
        {/* Sensor Description Overlay */}
        <div style={{
          position: 'absolute', bottom: 20, right: 20,
          background: 'rgba(0,0,0,0.85)', color: 'white',
          padding: '12px 15px', borderRadius: '8px',
          maxWidth: '300px', fontSize: '11px',
          border: `1px solid ${sensorTabs.find(tab => tab.id === activeTab)?.color}`,
          backdropFilter: 'blur(5px)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', 
                      color: sensorTabs.find(tab => tab.id === activeTab)?.color }}>
            {sensorTabs.find(tab => tab.id === activeTab)?.name}
          </h4>
          <div style={{ lineHeight: '1.4' }}>
            {activeTab === 'satellite' && 
              "GPS differential atmospheric sensing with 0.5mm orbital reconstruction accuracy. Real-time satellite positioning with atmospheric signal delay analysis for environmental truth generation."}
            {activeTab === 'cellular' && 
              "Cellular network load analysis correlating environmental conditions with 15,000-50,000 simultaneous MIMO signals. Population dynamics and atmospheric coupling through infrastructure sensing."}
            {activeTab === 'hardware' && 
              "Revolutionary hardware oscillatory harvesting using existing LEDs, displays, and processors as atmospheric sensors. Zero-cost molecular spectrometry and atmospheric synthesis."}
            {activeTab === 'lidar' && 
              "Advanced atmospheric backscatter analysis with Klett inversion algorithms. Aerosol optical depth retrieval, visibility assessment, and atmospheric profile reconstruction."}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 20px', background: 'rgba(0,0,0,0.9)',
        borderTop: '1px solid #333', fontSize: '10px', opacity: 0.8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          Buhera-West Platform v2.1 | Multi-Modal Atmospheric Intelligence System
        </div>
        <div>
          Precision Agriculture | Environmental Monitoring | Atmospheric Analysis
        </div>
      </div>
    </div>
  );
};

export default SensorDashboard; 
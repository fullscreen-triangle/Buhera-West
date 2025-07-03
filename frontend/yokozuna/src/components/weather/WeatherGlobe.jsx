import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const WEATHER_COLORS = {
  sunny: '#FFD700',
  cloudy: '#87CEEB',
  rainy: '#4169E1',
  stormy: '#8B0000',
  snowy: '#FFFFFF',
  clear: '#00CED1'
};

function createWeatherMarker(weatherData) {
  const { weather, temp } = weatherData;
  const color = WEATHER_COLORS[weather.toLowerCase()] || WEATHER_COLORS.clear;
  
  // Create marker size based on temperature (normalized)
  const size = Math.max(0.5, Math.min(3, Math.abs(temp) / 10));
  
  const geometry = new THREE.SphereGeometry(size, 16, 16);
  const material = new THREE.MeshLambertMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.8
  });

  const mesh = new THREE.Mesh(geometry, material);
  
  // Add a pulsing light effect
  const light = new THREE.PointLight(color, 0.5, 50);
  mesh.add(light);
  
  // Add atmospheric glow
  const glowGeometry = new THREE.SphereGeometry(size * 1.5, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  mesh.add(glow);

  return mesh;
}

export default function WeatherGlobe({ 
  weatherData = [], 
  focusedLocation = null, 
  onLocationClick,
  isLoading = false 
}) {
  const globeRef = useRef();
  const [globeReady, setGlobeReady] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (globeRef.current && globeReady) {
      // Custom globe initialization
      const globe = globeRef.current;
      
      // Set up controls
      const controls = globe.controls();
      controls.autoRotate = autoRotate && !focusedLocation;
      controls.autoRotateSpeed = 0.5;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.enableZoom = true;
      controls.minDistance = 101;
      controls.maxDistance = 400;
    }
  }, [globeReady, autoRotate, focusedLocation]);

  useEffect(() => {
    if (focusedLocation && globeRef.current) {
      // Focus on the selected location
      globeRef.current.pointOfView(
        {
          lat: focusedLocation.lat,
          lng: focusedLocation.lng,
          altitude: 2.5
        },
        1000
      );
      setAutoRotate(false);
    } else if (globeRef.current) {
      // Return to global view
      globeRef.current.pointOfView(
        {
          lat: 0,
          lng: 0,
          altitude: 2.5
        },
        1000
      );
      setAutoRotate(true);
    }
  }, [focusedLocation]);

  const handleMarkerClick = (marker) => {
    if (onLocationClick) {
      onLocationClick(marker);
    }
  };

  const handleGlobeClick = ({ lat, lng }) => {
    if (onLocationClick && !focusedLocation) {
      onLocationClick({ lat, lng, isManualClick: true });
    }
  };

  return (
    <div className="weather-globe-container" style={{ width: '100vw', height: '100vh' }}>
      <Globe
        ref={globeRef}
        width={window.innerWidth}
        height={window.innerHeight}
        
        // Globe appearance
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Atmosphere
        showAtmosphere={true}
        atmosphereColor="#87CEEB"
        atmosphereAltitude={0.15}
        
        // Weather points
        pointsData={weatherData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.01}
        pointRadius={d => Math.max(0.1, d.temp ? Math.abs(d.temp) / 50 : 0.1)}
        pointColor={d => {
          if (!d.weather) return WEATHER_COLORS.clear;
          const weather = d.weather.toLowerCase();
          return WEATHER_COLORS[weather] || WEATHER_COLORS.clear;
        }}
        pointResolution={8}
        
        // Labels for focused location
        labelsData={focusedLocation ? [focusedLocation] : []}
        labelLat="lat"
        labelLng="lng"
        labelText={d => d.name || `${d.lat.toFixed(2)}, ${d.lng.toFixed(2)}`}
        labelSize={1.5}
        labelColor="#FFFFFF"
        labelResolution={2}
        
        // Interactions
        onPointClick={handleMarkerClick}
        onGlobeClick={handleGlobeClick}
        
        // Events
        onGlobeReady={() => setGlobeReady(true)}
        
        // Controls
        enablePointerInteraction={true}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl">Loading weather data...</div>
        </div>
      )}
      
      <style jsx>{`
        .weather-globe-container {
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
} 
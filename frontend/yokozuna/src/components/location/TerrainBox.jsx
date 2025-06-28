'use client'
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const TerrainBox = ({ 
  locationData, 
  className = "",
  width = 300,
  height = 200
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!locationData || !mountRef.current) return;

    const initThreeGeo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import three-geo
        const threeGeoModule = await import('three-geo');
        const ThreeGeo = threeGeoModule.default || threeGeoModule.ThreeGeo;
        
        // Clear previous content
        if (mountRef.current) {
          mountRef.current.innerHTML = '';
        }

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB); // Sky blue
        sceneRef.current = scene;

        // Create camera
        const camera = new THREE.PerspectiveCamera(
          75,
          width / height,
          0.1,
          1000
        );

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true 
        });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        if (mountRef.current) {
          mountRef.current.appendChild(renderer.domElement);
        }

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Initialize three-geo
        const tgeo = new ThreeGeo({
          tokenMapbox: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiY2hvbWJvY2hpbm9rb3NvcmFtb3RvIiwiYSI6ImNsYWIzNzN1YzA5M24zdm4xb2txdXZ0YXQifQ.mltBkVjXA6LjUJ1bi7gdRg',
        });

        // Set loading progress callback
        tgeo.setApiDem('mapbox');
        tgeo.setApiSat('mapbox');

        // Get terrain data
        const lat = locationData.lat;
        const lng = locationData.lng;
        const radius = 5.0; // km
        const zoom = 12;

        setLoadingProgress(25);

        // Fetch terrain
        const terrain = await tgeo.getTerrainRgb(
          [lat, lng], 
          radius, 
          zoom
        );

        setLoadingProgress(50);

        // Fetch satellite imagery
        const satellite = await tgeo.getSatellite(
          [lat, lng], 
          radius, 
          zoom
        );

        setLoadingProgress(75);

        // Create terrain mesh
        const terrainMesh = tgeo.createTerrainMesh(terrain, satellite);
        terrainMesh.rotation.x = -Math.PI / 2;
        terrainMesh.receiveShadow = true;
        terrainMesh.castShadow = true;
        scene.add(terrainMesh);

        // Position camera
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);

        // Add orbit controls
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2;
        controls.minDistance = 2;
        controls.maxDistance = 20;

        // Add location marker
        const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xff0000,
          emissive: 0x440000
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(0, 2, 0);
        scene.add(marker);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };

        setLoadingProgress(100);
        setIsLoading(false);
        animate();

        // Handle resize
        const handleResize = () => {
          if (renderer && camera) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (renderer) {
            renderer.dispose();
          }
          controls?.dispose();
        };

      } catch (err) {
        console.error('Three-geo initialization error:', err);
        setError('Failed to load 3D terrain. Please check your connection.');
        setIsLoading(false);
      }
    };

    initThreeGeo();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [locationData, width, height]);

  if (error) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 border-2 border-red-300 dark:border-red-600 rounded-lg shadow-lg ${className}`}>
        <div className="flex flex-col items-center justify-center h-full text-red-600 dark:text-red-400 text-sm p-4">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="font-medium text-center">3D Terrain Error</p>
          <p className="text-xs opacity-75 mt-1 text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 text-xs bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center text-white text-sm p-4 z-10">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="font-medium mb-1">Loading 3D Terrain</p>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-xs opacity-75">{loadingProgress}% Complete</p>
          {locationData && (
            <p className="text-xs opacity-60 mt-1 text-center">
              {locationData.name}
            </p>
          )}
        </div>
      )}
      
      <div 
        ref={mountRef}
        className="w-full h-full relative"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      
      {!isLoading && locationData && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded backdrop-blur-sm">
          <p className="font-medium truncate">{locationData.name}</p>
          <p className="opacity-75">
            {locationData.lat.toFixed(4)}, {locationData.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TerrainBox;
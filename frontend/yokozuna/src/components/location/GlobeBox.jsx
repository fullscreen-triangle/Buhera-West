'use client'
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const GlobeBox = ({ 
  locationData, 
  className = "",
  width = 250,
  height = 250
}) => {
  const mountRef = useRef(null);
  const globeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const initGlobe = async () => {
      try {
        // Clear previous content
        mountRef.current.innerHTML = '';

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011);

        // Create camera
        const camera = new THREE.PerspectiveCamera(
          50,
          width / height,
          0.1,
          1000
        );
        camera.position.z = 3;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true 
        });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        // Create Earth geometry
        const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Load Earth texture
        const textureLoader = new THREE.TextureLoader();
        
        // Create a simple earth-like material
        const earthMaterial = new THREE.MeshPhongMaterial({
          map: await new Promise((resolve) => {
            // Create a canvas texture for Earth
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Create a gradient that looks like Earth
            const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
            gradient.addColorStop(0, '#4A90E2');
            gradient.addColorStop(0.3, '#7ED321');
            gradient.addColorStop(0.6, '#8B4513');
            gradient.addColorStop(1, '#4A90E2');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1024, 512);
            
            // Add some land masses (simplified)
            ctx.fillStyle = '#228B22';
            ctx.fillRect(100, 150, 200, 100);
            ctx.fillRect(400, 100, 300, 150);
            ctx.fillRect(750, 200, 150, 100);
            
            const texture = new THREE.CanvasTexture(canvas);
            resolve(texture);
          }),
          shininess: 100,
          specular: 0x222222
        });

        // Create Earth mesh
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        globeRef.current = earth;
        scene.add(earth);

        // Add location marker if available
        if (locationData) {
          const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
          const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
          });
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          
          // Convert lat/lng to 3D coordinates
          const phi = (90 - locationData.lat) * (Math.PI / 180);
          const theta = (locationData.lng + 180) * (Math.PI / 180);
          
          marker.position.x = -(1.02 * Math.sin(phi) * Math.cos(theta));
          marker.position.z = (1.02 * Math.sin(phi) * Math.sin(theta));
          marker.position.y = (1.02 * Math.cos(phi));
          
          scene.add(marker);

          // Add a pulsing ring around the marker
          const ringGeometry = new THREE.RingGeometry(0.03, 0.04, 16);
          const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
          });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.position.copy(marker.position);
          ring.lookAt(0, 0, 0);
          scene.add(ring);
        }

        // Add stars
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 1000;
        const starsPositions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i++) {
          starsPositions[i] = (Math.random() - 0.5) * 20;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
        const starsMaterial = new THREE.PointsMaterial({ 
          color: 0xffffff,
          size: 0.02
        });
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        // Add orbit controls
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.minDistance = 1.5;
        controls.maxDistance = 5;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          
          if (globeRef.current) {
            globeRef.current.rotation.y += 0.002;
          }
          
          controls.update();
          renderer.render(scene, camera);
        };

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
          renderer.dispose();
          controls?.dispose();
        };

      } catch (err) {
        console.error('Globe initialization error:', err);
        setIsLoading(false);
      }
    };

    initGlobe();

    return () => {
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [locationData, width, height]);

  return (
    <div className={`bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white text-sm p-4 z-10">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="font-medium">Loading Globe</p>
          <p className="text-xs opacity-75 mt-1">Initializing 3D Earth</p>
        </div>
      )}
      
      <div 
        ref={mountRef}
        className="w-full h-full relative"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      
      {!isLoading && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded backdrop-blur-sm">
          <p className="font-medium">🌍 Global View</p>
          {locationData && (
            <p className="opacity-75 truncate">
              📍 {locationData.name}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobeBox;
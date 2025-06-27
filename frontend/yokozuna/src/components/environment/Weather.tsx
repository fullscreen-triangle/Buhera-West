import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky, Cloud, useTexture } from '@react-three/drei';
import { useMemoizedCalculation } from '../../utils/optimizations';

/**
 * Types of weather effects available
 */
export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'storm' | 'night' | 'sunset';

/**
 * Props for the Weather component
 * @interface WeatherProps
 */
export interface WeatherProps {
  /** Type of weather effect to render */
  type: WeatherType;
  /** Intensity of the weather effect (0.0 to 1.0) */
  intensity?: number;
  /** Whether wind effects should be applied */
  wind?: boolean;
  /** Wind direction as [x, y, z] vector */
  windDirection?: [number, number, number];
  /** Wind speed (0.0 to 1.0) */
  windSpeed?: number;
  /** Whether to enable lightning effects (for storm weather) */
  lightning?: boolean;
  /** Number of particles to render (affects performance) */
  particleCount?: number;
  /** Callback for when lightning strikes (for storm weather) */
  onLightningStrike?: () => void;
  /** Whether to automatically modify scene lighting based on weather */
  affectLighting?: boolean;
  /** Control ambient light intensity (0.0 to 1.0) */
  ambientLightIntensity?: number;
  /** Control directional (sun) light intensity (0.0 to 1.0) */
  sunLightIntensity?: number;
  /** Sun position in the sky (radians) - 0 is dawn, Math.PI/2 is noon, Math.PI is sunset */
  sunPosition?: number;
  /** Whether cloud shadows should be cast on the ground */
  cloudShadows?: boolean;
  /** Time of day (0-24 hours) */
  timeOfDay?: number;
  /** Whether weather transitions should be animated */
  animatedTransitions?: boolean;
  /** How loud the weather sound effects should be (0.0 to 1.0) */
  soundVolume?: number;
}

/**
 * Weather component for adding environmental effects like rain, snow, fog, etc.
 * 
 * @example
 * ```jsx
 * <Weather 
 *   type="storm" 
 *   intensity={0.8} 
 *   wind={true} 
 *   windDirection={[1, -0.2, 0.1]} 
 *   windSpeed={0.6}
 *   lightning={true}
 *   particleCount={2000}
 *   affectLighting={true}
 *   timeOfDay={18.5}
 * />
 * ```
 */
const Weather: React.FC<WeatherProps> = ({
  type = 'clear',
  intensity = 0.5,
  wind = false,
  windDirection = [0, -1, 0],
  windSpeed = 0.2,
  lightning = true,
  particleCount = 1000,
  onLightningStrike,
  affectLighting = true,
  ambientLightIntensity,
  sunLightIntensity,
  sunPosition,
  cloudShadows = true,
  timeOfDay = 12,
  animatedTransitions = true,
  soundVolume = 0.5
}) => {
  const { scene, camera } = useThree();
  const particles = useRef<THREE.Points | null>(null);
  const lightningRef = useRef<THREE.PointLight | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const cloudGroupRef = useRef<THREE.Group | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const lastLightningTime = useRef<number>(0);
  const lightningInterval = useRef<number>(Math.random() * 3000 + 2000); // Random interval between 2-5 seconds
  
  // State for animated transitions
  const [currentIntensity, setCurrentIntensity] = useState(intensity);
  const [currentCloudCover, setCurrentCloudCover] = useState(0);
  
  // Normalize and clamp intensity
  const normalizedIntensity = useMemo(() => Math.max(0, Math.min(1, intensity)), [intensity]);
  
  // Normalize wind direction vector
  const normalizedWindDirection = useMemo(() => {
    const vector = new THREE.Vector3(windDirection[0], windDirection[1], windDirection[2]);
    return vector.normalize();
  }, [windDirection]);
  
  // Set up weather audio effect
  useEffect(() => {
    if (soundVolume <= 0) return;
    
    // Create audio elements for different weather types
    const audioFiles = {
      rain: '/sounds/rain.mp3',
      storm: '/sounds/storm.mp3',
      wind: '/sounds/wind.mp3',
      snow: '/sounds/snow.mp3'
    };
    
    let audioFile: string | null = null;
    
    if (type === 'rain') audioFile = audioFiles.rain;
    else if (type === 'storm') audioFile = audioFiles.storm;
    else if (type === 'snow') audioFile = audioFiles.snow;
    else if (wind && windSpeed > 0.3) audioFile = audioFiles.wind;
    
    if (audioFile) {
      const audio = new Audio(audioFile);
      audio.loop = true;
      audio.volume = soundVolume;
      audio.play();
      audioRef.current = audio;
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [type, wind, windSpeed, soundVolume]);
  
  // Update audio volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = soundVolume;
    }
  }, [soundVolume]);
  
  // Create particle geometry based on weather type and count
  const particleGeometry = useMemoizedCalculation(() => {
    // Don't create particles for clear, cloudy or night weather
    if (type === 'clear' || type === 'cloudy' || type === 'night' || type === 'sunset') {
      return null;
    }
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Set different distribution based on weather type
    const distributionFn = getParticleDistributionFn(type);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position particles based on type and distribution function
      const position = distributionFn(camera);
      positions[i3] = position.x;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z;
      
      // Set initial velocities
      velocities[i3] = normalizedWindDirection.x * windSpeed * (Math.random() * 0.2 + 0.9);
      velocities[i3 + 1] = getParticleGravity(type) * (Math.random() * 0.2 + 0.9); // Gravity effect
      velocities[i3 + 2] = normalizedWindDirection.z * windSpeed * (Math.random() * 0.2 + 0.9);
      
      // Set particle sizes based on type
      sizes[i] = getParticleSize(type) * (Math.random() * 0.5 + 0.75);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, [type, particleCount, camera, normalizedWindDirection, windSpeed]);
  
  // Create particle material based on weather type
  const particleMaterial = useMemo(() => {
    // Don't create material for clear, cloudy or night weather
    if (!particleGeometry) return null;
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: getWeatherOpacity(type, normalizedIntensity),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: false,
      sizeAttenuation: true
    });
    
    // Load different textures based on weather type
    const textureLoader = new THREE.TextureLoader();
    const textureUrl = getWeatherTexture(type);
    
    if (textureUrl) {
      material.map = textureLoader.load(textureUrl);
    }
    
    return material;
  }, [type, normalizedIntensity, particleGeometry]);
  
  // Calculate sun position based on time of day
  const calculatedSunPosition = useMemo(() => {
    const providedPosition = sunPosition !== undefined;
    
    // If sunPosition is provided, use it directly
    if (providedPosition) return sunPosition;
    
    // Otherwise calculate based on time of day (0-24)
    // Convert to radians where noon is PI/2
    const hourAngle = ((timeOfDay % 24) / 24) * Math.PI * 2;
    return hourAngle - Math.PI / 2;
  }, [sunPosition, timeOfDay]);
  
  // Determine light intensities based on weather and time
  const lightIntensities = useMemo(() => {
    // Base values for different weather types
    const baseIntensities = {
      clear: { ambient: 0.5, sun: 1.0 },
      cloudy: { ambient: 0.7, sun: 0.6 },
      rain: { ambient: 0.4, sun: 0.3 },
      snow: { ambient: 0.8, sun: 0.7 },
      fog: { ambient: 0.6, sun: 0.4 },
      storm: { ambient: 0.3, sun: 0.2 },
      night: { ambient: 0.1, sun: 0.05 },
      sunset: { ambient: 0.4, sun: 0.7 }
    };
    
    // Get base intensities for current weather
    const baseAmbient = baseIntensities[type]?.ambient || 0.5;
    const baseSun = baseIntensities[type]?.sun || 0.5;
    
    // Factor in time of day effect on light
    let timeAmbientFactor = 1.0;
    let timeSunFactor = 1.0;
    
    if (type !== 'night' && type !== 'sunset') {
      // Reduce light during early morning and evening
      const dayProgress = timeOfDay % 24;
      if (dayProgress < 6) { // Dawn
        const factor = dayProgress / 6;
        timeAmbientFactor = 0.3 + factor * 0.7;
        timeSunFactor = 0.2 + factor * 0.8;
      } else if (dayProgress > 18) { // Dusk
        const factor = (24 - dayProgress) / 6;
        timeAmbientFactor = 0.3 + factor * 0.7;
        timeSunFactor = 0.2 + factor * 0.8;
      }
    }
    
    // Allow override from props if provided
    const finalAmbient = ambientLightIntensity !== undefined 
      ? ambientLightIntensity 
      : baseAmbient * timeAmbientFactor;
    
    const finalSun = sunLightIntensity !== undefined 
      ? sunLightIntensity 
      : baseSun * timeSunFactor;
    
    return {
      ambient: finalAmbient,
      sun: finalSun
    };
  }, [type, ambientLightIntensity, sunLightIntensity, timeOfDay]);
  
  // Add fog to scene if needed
  useEffect(() => {
    if (!affectLighting) return;
    
    if (type === 'fog' || type === 'storm' || type === 'rain' || type === 'snow') {
      const previousFog = scene.fog;
      
      // Different fog colors and densities based on weather type
      const fogColors = {
        fog: new THREE.Color(0xaaaaaa),
        storm: new THREE.Color(0x444444),
        rain: new THREE.Color(0x666666),
        snow: new THREE.Color(0xeeeeee)
      };
      
      const fogDensities = {
        fog: 0.008,
        storm: 0.015,
        rain: 0.005,
        snow: 0.004
      };
      
      // Add fog to scene with intensity-based density
      scene.fog = new THREE.FogExp2(
        fogColors[type as keyof typeof fogColors],
        fogDensities[type as keyof typeof fogDensities] * normalizedIntensity
      );
      
      // Clean up on unmount
      return () => {
        scene.fog = previousFog;
      };
    } else if (scene.fog) {
      // Remove fog for clear weather
      const previousFog = scene.fog;
      scene.fog = null;
      
      return () => {
        scene.fog = previousFog;
      };
    }
  }, [type, scene, normalizedIntensity, affectLighting]);
  
  // Modify scene background based on sky type
  useEffect(() => {
    if (!affectLighting) return;
    
    // Save original background
    const originalBackground = scene.background;
    
    // Different sky colors based on weather and time
    const skyColors = {
      clear: new THREE.Color(0x87CEEB),
      cloudy: new THREE.Color(0xAAAAAA),
      rain: new THREE.Color(0x666677),
      storm: new THREE.Color(0x444444),
      fog: new THREE.Color(0xCCCCCC),
      snow: new THREE.Color(0xEEEEEE),
      night: new THREE.Color(0x000011),
      sunset: new THREE.Color(0xFF7733)
    };
    
    // Set background color
    scene.background = skyColors[type];
    
    return () => {
      scene.background = originalBackground;
    };
  }, [type, scene, affectLighting]);
  
  // Apply animated transitions for weather changes
  useEffect(() => {
    if (!animatedTransitions) {
      setCurrentIntensity(normalizedIntensity);
      setCurrentCloudCover(getCloudCover(type));
      return;
    }
    
    let animationFrame: number;
    const targetIntensity = normalizedIntensity;
    const targetCloudCover = getCloudCover(type);
    
    const animate = () => {
      setCurrentIntensity(prev => {
        const diff = targetIntensity - prev;
        return Math.abs(diff) < 0.01 ? targetIntensity : prev + diff * 0.05;
      });
      
      setCurrentCloudCover(prev => {
        const diff = targetCloudCover - prev;
        return Math.abs(diff) < 0.01 ? targetCloudCover : prev + diff * 0.05;
      });
      
      if (
        Math.abs(currentIntensity - targetIntensity) > 0.01 || 
        Math.abs(currentCloudCover - targetCloudCover) > 0.01
      ) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [type, normalizedIntensity, animatedTransitions]);
  
  // Handle animation and updates
  useFrame((_, delta) => {
    // Update particles
    if (particles.current) {
      const positions = particles.current.geometry.attributes.position.array as Float32Array;
      const velocities = particles.current.geometry.attributes.velocity.array as Float32Array;
      const bounds = 50; // Boundary for particle respawn
      
      // Update particle positions
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Apply velocity with delta time
        positions[i3] += velocities[i3] * delta * 10;
        positions[i3 + 1] += velocities[i3 + 1] * delta * 10;
        positions[i3 + 2] += velocities[i3 + 2] * delta * 10;
        
        // Respawn particles that go out of bounds
        if (positions[i3 + 1] < -bounds || 
            positions[i3 + 1] > bounds ||
            positions[i3] < camera.position.x - bounds || 
            positions[i3] > camera.position.x + bounds ||
            positions[i3 + 2] < camera.position.z - bounds || 
            positions[i3 + 2] > camera.position.z + bounds) {
          
          // Reset particle position
          const newPos = getParticleDistributionFn(type)(camera);
          positions[i3] = newPos.x;
          positions[i3 + 1] = newPos.y;
          positions[i3 + 2] = newPos.z;
        }
      }
      
      // Mark attributes for update
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Update cloud movement based on wind
    if (cloudGroupRef.current && wind) {
      cloudGroupRef.current.position.x += normalizedWindDirection.x * windSpeed * delta * 2;
      cloudGroupRef.current.position.z += normalizedWindDirection.z * windSpeed * delta * 2;
      
      // Wrap clouds around camera when they move too far
      if (Math.abs(cloudGroupRef.current.position.x - camera.position.x) > 200) {
        cloudGroupRef.current.position.x = camera.position.x;
      }
      
      if (Math.abs(cloudGroupRef.current.position.z - camera.position.z) > 200) {
        cloudGroupRef.current.position.z = camera.position.z;
      }
    }
    
    // Handle lightning effects
    if (type === 'storm' && lightning && lightningRef.current) {
      const now = Date.now();
      
      // Check if it's time for a lightning strike
      if (now - lastLightningTime.current > lightningInterval.current) {
        // Flash the lightning light
        lightningRef.current.intensity = 2 * normalizedIntensity;
        
        // Notify of lightning strike
        onLightningStrike?.();
        
        // Schedule lightning to fade out
        setTimeout(() => {
          if (lightningRef.current) {
            lightningRef.current.intensity = 0;
          }
        }, 100);
        
        // Maybe do a double flash
        if (Math.random() > 0.6) {
          setTimeout(() => {
            if (lightningRef.current) {
              lightningRef.current.intensity = 1.5 * normalizedIntensity;
              
              setTimeout(() => {
                if (lightningRef.current) {
                  lightningRef.current.intensity = 0;
                }
              }, 80);
            }
          }, 200);
        }
        
        // Update for next strike
        lastLightningTime.current = now;
        lightningInterval.current = Math.random() * 6000 + 2000; // Random interval between 2-8 seconds
      }
    }
    
    // Update light intensities for day/night cycle
    if (affectLighting && sunLightRef.current && ambientLightRef.current) {
      // Move sun based on time
      if (sunLightRef.current) {
        const sunX = Math.cos(calculatedSunPosition) * 100;
        const sunY = Math.sin(calculatedSunPosition) * 100;
        sunLightRef.current.position.set(sunX, sunY, 0);
        sunLightRef.current.lookAt(0, 0, 0);
      }
    }
  });
  
  return (
    <group>
      {/* Sun/Directional Light */}
      {affectLighting && (
        <directionalLight
          ref={sunLightRef}
          intensity={lightIntensities.sun}
          position={[100 * Math.cos(calculatedSunPosition), 100 * Math.sin(calculatedSunPosition), 0]}
          castShadow={true}
        >
          <orthographicCamera 
            attach="shadow-camera" 
            args={[-50, 50, 50, -50, 0.1, 200]} 
          />
        </directionalLight>
      )}
      
      {/* Ambient Light */}
      {affectLighting && (
        <ambientLight
          ref={ambientLightRef}
          intensity={lightIntensities.ambient}
          color={getAmbientColor(type)}
        />
      )}
      
      {/* Weather particles */}
      {particleGeometry && particleMaterial && (
        <points ref={particles} geometry={particleGeometry} material={particleMaterial} />
      )}
      
      {/* Lightning */}
      {type === 'storm' && lightning && (
        <pointLight 
          ref={lightningRef} 
          position={[0, 100, 10]} 
          intensity={0} 
          color="#FFFFFF" 
          distance={500}
        />
      )}
      
      {/* Sky */}
      {(type === 'clear' || type === 'sunset') && (
        <Sky 
          distance={450000} 
          sunPosition={[
            Math.cos(calculatedSunPosition) * 100,
            Math.sin(calculatedSunPosition) * 100,
            0
          ]} 
          inclination={0}
          rayleigh={type === 'clear' ? 0.3 : 2}
          turbidity={type === 'clear' ? 10 : 20}
          mieCoefficient={type === 'clear' ? 0.005 : 0.01}
          mieDirectionalG={0.7}
        />
      )}
      
      {/* Cloud system */}
      <group ref={cloudGroupRef} position={[0, 80, 0]}>
        {/* Only show clouds when appropriate for the weather */}
        {currentCloudCover > 0 && (
          <>
            {Array.from({ length: Math.ceil(currentCloudCover * 15) }).map((_, index) => (
              <Cloud 
                key={index}
                position={[
                  (Math.random() - 0.5) * 100,
                  10 + Math.random() * 20, 
                  (Math.random() - 0.5) * 100
                ]}
                opacity={currentCloudCover * 0.9}
                speed={wind ? 0.1 + windSpeed * 0.5 : 0.1}
                width={30 + Math.random() * 80}
                depth={10 + Math.random() * 20}
                segments={10}
                scale={1 + Math.random() * 2}
                volume={0.1 + Math.random() * 0.3}
              />
            ))}
            
            {/* More dense clouds for stormy weather */}
            {type === 'storm' && currentCloudCover > 0.6 && (
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Cloud 
                    key={`storm-${index}`}
                    position={[
                      (Math.random() - 0.5) * 50,
                      5 + Math.random() * 10, 
                      (Math.random() - 0.5) * 50
                    ]}
                    opacity={0.95}
                    speed={0.1}
                    color="#333333"
                    width={60 + Math.random() * 100}
                    depth={30 + Math.random() * 40}
                    segments={20}
                    scale={3}
                    volume={0.6}
                  />
                ))}
              </>
            )}
          </>
        )}
      </group>
    </group>
  );
};

/**
 * Determines the cloud cover amount based on weather type
 * @param {WeatherType} type - The type of weather
 * @returns {number} - Cloud cover value from 0-1
 */
function getCloudCover(type: WeatherType): number {
  switch (type) {
    case 'clear': return 0.1;
    case 'cloudy': return 0.7;
    case 'rain': return 0.8;
    case 'snow': return 0.6;
    case 'fog': return 0.5;
    case 'storm': return 0.9;
    case 'night': return 0.3;
    case 'sunset': return 0.4;
    default: return 0;
  }
}

/**
 * Get ambient light color based on weather type
 * @param {WeatherType} type - The type of weather
 * @returns {string} - Color hex code
 */
function getAmbientColor(type: WeatherType): string {
  switch (type) {
    case 'clear': return '#DDEEFF';
    case 'cloudy': return '#CCCCCC';
    case 'rain': return '#8899AA';
    case 'snow': return '#EEEEFF';
    case 'fog': return '#DDDDDD';
    case 'storm': return '#667788';
    case 'night': return '#223366';
    case 'sunset': return '#FFBB88';
    default: return '#FFFFFF';
  }
}

/**
 * Get a function to distribute particles based on weather type
 */
function getParticleDistributionFn(type: WeatherType): (camera: THREE.Camera) => THREE.Vector3 {
  switch (type) {
    case 'rain':
    case 'storm':
      // Rain falls from above in a wide area
      return (camera: THREE.Camera) => {
        const cameraPosition = camera.position;
        const bounds = 30;
        return new THREE.Vector3(
          cameraPosition.x + (Math.random() - 0.5) * bounds * 2,
          cameraPosition.y + bounds,
          cameraPosition.z + (Math.random() - 0.5) * bounds * 2
        );
      };
    
    case 'snow':
      // Snow falls more gently and can start from various heights
      return (camera: THREE.Camera) => {
        const cameraPosition = camera.position;
        const bounds = 40;
        return new THREE.Vector3(
          cameraPosition.x + (Math.random() - 0.5) * bounds * 2,
          cameraPosition.y + bounds * (0.3 + Math.random() * 0.7),
          cameraPosition.z + (Math.random() - 0.5) * bounds * 2
        );
      };
    
    case 'fog':
      // Fog particles hover at various heights
      return (camera: THREE.Camera) => {
        const cameraPosition = camera.position;
        const bounds = 40;
        return new THREE.Vector3(
          cameraPosition.x + (Math.random() - 0.5) * bounds * 2,
          cameraPosition.y + (Math.random() - 0.5) * bounds,
          cameraPosition.z + (Math.random() - 0.5) * bounds * 2
        );
      };
    
    default:
      // Default distribution
      return (camera: THREE.Camera) => {
        const cameraPosition = camera.position;
        const bounds = 30;
        return new THREE.Vector3(
          cameraPosition.x + (Math.random() - 0.5) * bounds * 2,
          cameraPosition.y + bounds,
          cameraPosition.z + (Math.random() - 0.5) * bounds * 2
        );
      };
  }
}

/**
 * Get gravitational effect for different particles
 */
function getParticleGravity(type: WeatherType): number {
  switch (type) {
    case 'rain':
      return -4;
    case 'storm':
      return -5;
    case 'snow':
      return -0.5;
    case 'fog':
      return -0.1;
    default:
      return -1;
  }
}

/**
 * Get particle size for different weather types
 */
function getParticleSize(type: WeatherType): number {
  switch (type) {
    case 'rain':
      return 0.1;
    case 'storm':
      return 0.12;
    case 'snow':
      return 0.2;
    case 'fog':
      return 0.5;
    default:
      return 0.1;
  }
}

/**
 * Get opacity for different weather types
 */
function getWeatherOpacity(type: WeatherType, intensity: number): number {
  switch (type) {
    case 'rain':
      return 0.2 * intensity;
    case 'storm':
      return 0.3 * intensity;
    case 'snow':
      return 0.7 * intensity;
    case 'fog':
      return 0.2 * intensity;
    default:
      return 0.5 * intensity;
  }
}

/**
 * Get texture path for different weather particles
 */
function getWeatherTexture(type: WeatherType): string {
  switch (type) {
    case 'rain':
    case 'storm':
      return '/textures/rain_particle.png';
    case 'snow':
      return '/textures/snow_particle.png';
    case 'fog':
      return '/textures/fog_particle.png';
    default:
      return '/textures/default_particle.png';
  }
}

export default Weather;

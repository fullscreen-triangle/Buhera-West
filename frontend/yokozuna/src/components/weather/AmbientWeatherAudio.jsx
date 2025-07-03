import React, { useEffect, useRef, useState } from 'react';
import ambientAudioService from '../../services/ambientAudioService';
import weatherService from '../../services/weatherService';

/**
 * AmbientWeatherAudio Component
 * Automatically plays contextual ambient sounds based on weather conditions
 */
const AmbientWeatherAudio = ({ 
  enabled = true,
  volume = 0.3,
  location = null,
  weatherData = null,
  enableRegionalSounds = true,
  transitionDuration = 3000,
  onAudioChange = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAmbience, setCurrentAmbience] = useState(null);
  const [audioReady, setAudioReady] = useState(false);
  const prevWeatherRef = useRef(null);
  const locationRef = useRef(null);

  // Initialize audio service
  useEffect(() => {
    const initializeAudio = async () => {
      if (enabled) {
        const ready = await ambientAudioService.initialize();
        setAudioReady(ready);
        
        if (ready) {
          ambientAudioService.setVolume(volume);
          console.log('🎵 Ambient Weather Audio ready');
        }
      }
    };

    initializeAudio();

    return () => {
      // Cleanup when component unmounts
      if (ambientAudioService.isReady()) {
        ambientAudioService.stopAmbience();
      }
    };
  }, [enabled]);

  // Update volume when prop changes
  useEffect(() => {
    if (audioReady && ambientAudioService.isReady()) {
      ambientAudioService.setVolume(volume);
    }
  }, [volume, audioReady]);

  // Handle weather changes
  useEffect(() => {
    if (!enabled || !audioReady || !weatherData) return;

    const currentWeatherType = weatherData.current?.weather?.toLowerCase();
    const prevWeatherType = prevWeatherRef.current?.current?.weather?.toLowerCase();

    // Check if weather has changed significantly
    const weatherChanged = currentWeatherType !== prevWeatherType;
    const locationChanged = location && locationRef.current && 
      (Math.abs((location.lat || location.latitude) - (locationRef.current.lat || locationRef.current.latitude)) > 0.1 ||
       Math.abs((location.lng || location.longitude) - (locationRef.current.lng || locationRef.current.longitude)) > 0.1);

    if (weatherChanged || locationChanged || !currentAmbience) {
      updateAmbientAudio(weatherData, location);
    }

    prevWeatherRef.current = weatherData;
    locationRef.current = location;
  }, [weatherData, location, enabled, audioReady, currentAmbience]);

  /**
   * Update ambient audio based on current weather
   */
  const updateAmbientAudio = async (weather, loc) => {
    if (!weather) return;

    setIsLoading(true);

    try {
      console.log('🎵 Updating ambient audio for weather:', weather.current?.weather);

      // Use transition if ambience is already playing
      if (currentAmbience) {
        await ambientAudioService.transitionToWeather(weather, loc, transitionDuration);
      } else {
        // Create and play new ambience
        const newAmbience = await ambientAudioService.createWeatherAmbience(weather, loc);
        await ambientAudioService.playAmbience(newAmbience);
      }

      // Update state
      const currentAmbienceData = ambientAudioService.getCurrentAmbience();
      setCurrentAmbience(currentAmbienceData);

      // Notify parent component
      if (onAudioChange) {
        onAudioChange(currentAmbienceData);
      }

    } catch (error) {
      console.error('Failed to update ambient audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manually trigger audio update (useful for testing)
   */
  const refreshAudio = async () => {
    if (weatherData) {
      await updateAmbientAudio(weatherData, location);
    }
  };

  /**
   * Toggle ambient audio on/off
   */
  const toggleAudio = async () => {
    if (currentAmbience) {
      await ambientAudioService.stopAmbience();
      setCurrentAmbience(null);
    } else if (weatherData) {
      await updateAmbientAudio(weatherData, location);
    }
  };

  // Don't render anything - this is an audio-only component
  return null;
};

/**
 * Hook for using ambient weather audio in functional components
 */
export const useAmbientWeatherAudio = (options = {}) => {
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentWeather: null,
    ambience: null,
    volume: options.volume || 0.3
  });

  const audioRef = useRef(null);

  useEffect(() => {
    // Create a ref to the audio component
    audioRef.current = {
      refresh: () => {},
      toggle: () => {},
      setVolume: (vol) => {
        setAudioState(prev => ({ ...prev, volume: vol }));
      }
    };
  }, []);

  const handleAudioChange = (ambienceData) => {
    setAudioState(prev => ({
      ...prev,
      isPlaying: !!ambienceData,
      ambience: ambienceData
    }));
  };

  return {
    audioState,
    audioComponent: (
      <AmbientWeatherAudio
        {...options}
        volume={audioState.volume}
        onAudioChange={handleAudioChange}
      />
    ),
    controls: {
      setVolume: audioRef.current?.setVolume,
      toggle: audioRef.current?.toggle,
      refresh: audioRef.current?.refresh
    }
  };
};

/**
 * Enhanced Weather Component with Ambient Audio
 * Wraps the existing Weather component and adds ambient audio
 */
export const WeatherWithAmbientAudio = ({ 
  children, 
  weatherData,
  location,
  ambientAudioEnabled = true,
  ambientVolume = 0.3,
  ...weatherProps 
}) => {
  return (
    <>
      {children}
      {ambientAudioEnabled && (
        <AmbientWeatherAudio
          enabled={ambientAudioEnabled}
          volume={ambientVolume}
          location={location}
          weatherData={weatherData}
        />
      )}
    </>
  );
};

export default AmbientWeatherAudio; 
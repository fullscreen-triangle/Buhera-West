/**
 * Ambient Audio Service for Weather-Synchronized Environmental Sounds
 * Integrates with Freesound API and provides contextual ambient audio
 */

class AmbientAudioService {
  constructor() {
    this.audioContext = null;
    this.currentAmbience = null;
    this.freesoundApiKey = process.env.NEXT_PUBLIC_FREESOUND_API_KEY;
    this.soundCache = new Map();
    this.currentLocation = null;
    this.baseVolume = 0.3; // Subtle as requested
    this.isInitialized = false;
    
    // Audio categories for different weather conditions
    this.weatherSoundProfiles = {
      clear: {
        primary: ['birds chirping', 'gentle breeze', 'nature ambient'],
        secondary: ['leaves rustling', 'distant birds'],
        intensity: 0.2
      },
      rain: {
        primary: ['gentle rain', 'rain on leaves', 'light rainfall'],
        secondary: ['water drops', 'puddle sounds'],
        intensity: 0.4
      },
      storm: {
        primary: ['thunder distant', 'heavy rain', 'wind storm'],
        secondary: ['rain on roof', 'wind through trees'],
        intensity: 0.6
      },
      wind: {
        primary: ['wind ambient', 'wind through grass', 'breeze'],
        secondary: ['leaves rustling', 'air movement'],
        intensity: 0.3
      },
      snow: {
        primary: ['snow ambient', 'winter wind', 'quiet snowfall'],
        secondary: ['wind cold', 'snow footsteps'],
        intensity: 0.2
      },
      fog: {
        primary: ['fog horn distant', 'mist ambient', 'mysterious'],
        secondary: ['water drops', 'echo ambient'],
        intensity: 0.25
      },
      night: {
        primary: ['night ambient', 'crickets', 'owl sounds'],
        secondary: ['night birds', 'distant sounds'],
        intensity: 0.15
      }
    };
  }

  /**
   * Initialize the audio service
   */
  async initialize() {
    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master gain node for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.baseVolume;
      
      this.isInitialized = true;
      console.log('🎵 Ambient Audio Service initialized');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
      return false;
    }
  }

  /**
   * Get ambient sounds from Freesound API
   */
  async getFreesoundAmbience(query, duration = 30) {
    if (!this.freesoundApiKey) {
      console.warn('Freesound API key not configured, using local sounds');
      return null;
    }

    const cacheKey = `${query}_${duration}`;
    if (this.soundCache.has(cacheKey)) {
      return this.soundCache.get(cacheKey);
    }

    try {
      const response = await fetch(
        `https://freesound.org/apiv2/search/text/?` +
        `query=${encodeURIComponent(query)}` +
        `&filter=duration:[${duration}.0 TO *]` +
        `&filter=type:wav OR type:mp3` +
        `&fields=name,url,previews,duration,download` +
        `&sort=score` +
        `&page_size=5`,
        {
          headers: {
            'Authorization': `Token ${this.freesoundApiKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Freesound API error: ${response.status}`);
      }

      const data = await response.json();
      this.soundCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch from Freesound API:', error);
      return null;
    }
  }

  /**
   * Create contextual ambient audio based on weather and location
   */
  async createWeatherAmbience(weatherData, location = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const weatherType = weatherData.current?.weather?.toLowerCase() || 'clear';
    const windSpeed = weatherData.current?.wind_speed || 0;
    const temperature = weatherData.current?.temp || 20;
    const humidity = weatherData.current?.humidity || 50;
    
    console.log(`🎵 Creating ambience for ${weatherType} weather`);

    // Get sound profile for current weather
    const profile = this.weatherSoundProfiles[weatherType] || this.weatherSoundProfiles.clear;
    
    // Adjust intensity based on weather parameters
    let dynamicIntensity = profile.intensity;
    
    // Wind affects intensity
    if (windSpeed > 5) dynamicIntensity *= 1.2;
    if (windSpeed > 15) dynamicIntensity *= 1.5;
    
    // Temperature affects sound selection
    const isHot = temperature > 25;
    const isCold = temperature < 5;
    
    // Create layered ambience
    const ambienceLayers = await this.createAmbienceLayers(profile, {
      isHot,
      isCold,
      windSpeed,
      humidity,
      temperature,
      location
    });

    return {
      layers: ambienceLayers,
      intensity: Math.min(dynamicIntensity, 0.7), // Max volume cap
      weatherType,
      location
    };
  }

  /**
   * Create multiple audio layers for rich ambience
   */
  async createAmbienceLayers(profile, conditions) {
    const layers = [];

    // Primary ambient layer (main weather sound)
    const primaryQuery = this.selectContextualQuery(profile.primary, conditions);
    const primarySound = await this.getFreesoundAmbience(primaryQuery, 60);
    
    if (primarySound?.results?.length > 0) {
      layers.push({
        type: 'primary',
        sound: primarySound.results[0],
        volume: 0.7,
        loop: true
      });
    }

    // Secondary ambient layer (supporting sounds)
    const secondaryQuery = this.selectContextualQuery(profile.secondary, conditions);
    const secondarySound = await this.getFreesoundAmbience(secondaryQuery, 30);
    
    if (secondarySound?.results?.length > 0) {
      layers.push({
        type: 'secondary',
        sound: secondarySound.results[0],
        volume: 0.3,
        loop: true
      });
    }

    // Add regional context if location provided
    if (conditions.location) {
      const regionalLayer = await this.getRegionalAmbience(conditions.location);
      if (regionalLayer) {
        layers.push(regionalLayer);
      }
    }

    return layers;
  }

  /**
   * Select contextual sound query based on conditions
   */
  selectContextualQuery(queries, conditions) {
    let selectedQueries = [...queries];

    // Adjust based on temperature
    if (conditions.isHot) {
      selectedQueries = selectedQueries.filter(q => !q.includes('cold') && !q.includes('winter'));
      selectedQueries.push('summer ambient', 'warm breeze');
    } else if (conditions.isCold) {
      selectedQueries = selectedQueries.filter(q => !q.includes('summer') && !q.includes('warm'));
      selectedQueries.push('cold wind', 'winter ambient');
    }

    // Adjust based on wind
    if (conditions.windSpeed > 10) {
      selectedQueries = selectedQueries.map(q => q.includes('wind') ? `${q} strong` : q);
    }

    // Return random selection
    return selectedQueries[Math.floor(Math.random() * selectedQueries.length)];
  }

  /**
   * Get regional ambient sounds (for location-specific atmosphere)
   */
  async getRegionalAmbience(location) {
    // This could be expanded to include regional birds, insects, etc.
    const regionalQueries = {
      'africa': 'african birds ambient',
      'ocean': 'ocean waves distant',
      'mountain': 'mountain wind ambient',
      'forest': 'forest birds ambient',
      'city': 'city distant ambient',
      'rural': 'countryside ambient'
    };

    // Simple location-based selection (could be enhanced with geo-coding)
    const regionType = this.detectRegionType(location);
    const query = regionalQueries[regionType] || regionalQueries.rural;
    
    const regionalSound = await this.getFreesoundAmbience(query, 120);
    
    if (regionalSound?.results?.length > 0) {
      return {
        type: 'regional',
        sound: regionalSound.results[0],
        volume: 0.2,
        loop: true
      };
    }

    return null;
  }

  /**
   * Simple region type detection
   */
  detectRegionType(location) {
    if (!location) return 'rural';
    
    const lat = location.latitude || location.lat;
    const lng = location.longitude || location.lng;
    
    // Southern Africa coastal detection
    if (lat < -20 && lat > -35 && lng > 15 && lng < 35) {
      if (lng > 30) return 'ocean'; // Near coast
      return 'africa';
    }
    
    return 'rural';
  }

  /**
   * Play ambient audio layers
   */
  async playAmbience(ambienceData) {
    if (!ambienceData?.layers?.length) {
      console.log('🎵 No ambience layers to play');
      return;
    }

    // Stop current ambience
    await this.stopAmbience();

    this.currentAmbience = {
      sources: [],
      gains: [],
      data: ambienceData
    };

    console.log(`🎵 Playing ${ambienceData.layers.length} ambient layers`);

    // Play each layer
    for (const layer of ambienceData.layers) {
      try {
        await this.playLayer(layer, ambienceData.intensity);
      } catch (error) {
        console.warn('Failed to play layer:', error);
      }
    }
  }

  /**
   * Play individual audio layer
   */
  async playLayer(layer, globalIntensity) {
    if (!layer.sound?.previews?.['preview-hq-mp3']) {
      // Fallback to local sounds if API sounds not available
      return this.playLocalFallback(layer.type);
    }

    try {
      const audio = new Audio(layer.sound.previews['preview-hq-mp3']);
      audio.loop = layer.loop || false;
      audio.volume = (layer.volume || 0.5) * globalIntensity * this.baseVolume;
      
      await audio.play();
      
      this.currentAmbience.sources.push(audio);
      
      console.log(`🎵 Playing ${layer.type} layer: ${layer.sound.name}`);
    } catch (error) {
      console.warn('Failed to play layer audio:', error);
    }
  }

  /**
   * Play local fallback sounds
   */
  playLocalFallback(layerType) {
    const localSounds = {
      primary: '/sounds/ambient-base.mp3',
      secondary: '/sounds/ambient-light.mp3',
      regional: '/sounds/ambient-regional.mp3'
    };

    const soundFile = localSounds[layerType];
    if (!soundFile) return;

    try {
      const audio = new Audio(soundFile);
      audio.loop = true;
      audio.volume = this.baseVolume * 0.5;
      audio.play();
      
      this.currentAmbience.sources.push(audio);
      console.log(`🎵 Playing local fallback for ${layerType}`);
    } catch (error) {
      console.warn('Failed to play local fallback:', error);
    }
  }

  /**
   * Stop current ambience
   */
  async stopAmbience() {
    if (this.currentAmbience?.sources) {
      this.currentAmbience.sources.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      console.log('🎵 Stopped ambient audio');
    }
    
    this.currentAmbience = null;
  }

  /**
   * Update ambience volume
   */
  setVolume(volume) {
    this.baseVolume = Math.max(0, Math.min(1, volume));
    
    if (this.currentAmbience?.sources) {
      this.currentAmbience.sources.forEach((audio, index) => {
        const layer = this.currentAmbience.data.layers[index];
        if (layer) {
          audio.volume = (layer.volume || 0.5) * this.currentAmbience.data.intensity * this.baseVolume;
        }
      });
    }
  }

  /**
   * Gradually transition between weather ambiences
   */
  async transitionToWeather(newWeatherData, location = null, transitionDuration = 3000) {
    console.log('🎵 Transitioning to new weather ambience');
    
    // Fade out current ambience
    if (this.currentAmbience?.sources) {
      const fadeOutPromises = this.currentAmbience.sources.map(audio => {
        return this.fadeAudio(audio, audio.volume, 0, transitionDuration / 2);
      });
      await Promise.all(fadeOutPromises);
    }

    // Stop current and create new
    await this.stopAmbience();
    
    // Small delay before starting new ambience
    setTimeout(async () => {
      const newAmbience = await this.createWeatherAmbience(newWeatherData, location);
      await this.playAmbience(newAmbience);
    }, 500);
  }

  /**
   * Fade audio volume smoothly
   */
  fadeAudio(audio, fromVolume, toVolume, duration) {
    return new Promise(resolve => {
      const startTime = Date.now();
      const volumeDiff = toVolume - fromVolume;
      
      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        audio.volume = fromVolume + (volumeDiff * progress);
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };
      
      fade();
    });
  }

  /**
   * Get current ambience info
   */
  getCurrentAmbience() {
    return this.currentAmbience?.data || null;
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.isInitialized;
  }
}

// Create and export singleton instance
const ambientAudioService = new AmbientAudioService();
export default ambientAudioService; 
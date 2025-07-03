#!/usr/bin/env node

/**
 * Buhera-West Environment Setup Script
 * 
 * This script helps you configure your API keys and environment variables.
 * Run with: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_TEMPLATE = `# ==================================================
# BUHERA-WEST ENVIRONMENTAL INTELLIGENCE PLATFORM
# API Configuration File
# ==================================================

# ===== CORE WEATHER APIs =====
# OpenWeatherMap API (Required for weather data and geocoding)
# Get from: https://openweathermap.org/api
NEXT_PUBLIC_OPENWEATHER_API_KEY={{OPENWEATHER_API_KEY}}

# Mapbox Access Token (Required for maps and geocoding)
# Get from: https://www.mapbox.com/
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN={{MAPBOX_ACCESS_TOKEN}}

# ===== AI MODELS =====
# Anthropic Claude API (Primary AI Model)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY={{ANTHROPIC_API_KEY}}

# OpenAI GPT-4 API (Secondary AI Model)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY={{OPENAI_API_KEY}}

# Hugging Face API (Specialist Models)
# Get from: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY={{HUGGINGFACE_API_KEY}}

# Ollama Configuration (Local Models)
# Make sure Ollama is installed and running
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# ===== ADVANCED WEATHER APIs =====
# NASA API (Satellite imagery and earth data)
# Get from: https://api.nasa.gov/
NEXT_PUBLIC_NASA_API_KEY={{NASA_API_KEY}}

# NOAA API (US weather forecasts)
# Get from: https://www.weather.gov/documentation/services-web-api
NEXT_PUBLIC_NOAA_API_KEY={{NOAA_API_KEY}}

# ECMWF API (European weather models)
# Get from: https://www.ecmwf.int/en/forecasts/accessing-forecasts
NEXT_PUBLIC_ECMWF_API_KEY={{ECMWF_API_KEY}}

# ===== AUDIO/MULTIMEDIA APIs =====
# Freesound API (Environmental sounds)
# Get from: https://freesound.org/apiv2/apply/
NEXT_PUBLIC_FREESOUND_API_KEY={{FREESOUND_API_KEY}}

# YouTube Data API (Optional - for ambient playlists)
# Get from: https://console.developers.google.com/
NEXT_PUBLIC_YOUTUBE_API_KEY={{YOUTUBE_API_KEY}}

# Spotify API (Optional - for background music)
# Get from: https://developer.spotify.com/dashboard
NEXT_PUBLIC_SPOTIFY_CLIENT_ID={{SPOTIFY_CLIENT_ID}}
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET={{SPOTIFY_CLIENT_SECRET}}

# ===== APPLICATION SETTINGS =====
# Default coordinates for Buhera-West region
NEXT_PUBLIC_DEFAULT_LATITUDE=-18.2436
NEXT_PUBLIC_DEFAULT_LONGITUDE=31.5781

# Feature flags
NEXT_PUBLIC_ENABLE_AI_ASSISTANT=true
NEXT_PUBLIC_ENABLE_AMBIENT_AUDIO=true
NEXT_PUBLIC_ENABLE_ADVANCED_WEATHER=true
NEXT_PUBLIC_ENABLE_COORDINATE_SEARCH=true
NEXT_PUBLIC_ENABLE_TIME_CONTROLS=true

# Performance settings
NEXT_PUBLIC_CACHE_DURATION=600000
NEXT_PUBLIC_MAX_WEATHER_LOCATIONS=50
NEXT_PUBLIC_AI_RESPONSE_TIMEOUT=30000

# ===== DEBUGGING =====
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_VERBOSE_LOGGING=false
`;

const API_KEYS = [
  {
    key: 'OPENWEATHER_API_KEY',
    name: 'OpenWeatherMap API Key',
    description: 'Required for weather data and geocoding',
    url: 'https://openweathermap.org/api',
    required: true
  },
  {
    key: 'MAPBOX_ACCESS_TOKEN',
    name: 'Mapbox Access Token',
    description: 'Required for maps and geocoding',
    url: 'https://www.mapbox.com/',
    required: true
  },
  {
    key: 'ANTHROPIC_API_KEY',
    name: 'Anthropic Claude API Key',
    description: 'Primary AI model for intelligent responses',
    url: 'https://console.anthropic.com/',
    required: false
  },
  {
    key: 'OPENAI_API_KEY',
    name: 'OpenAI GPT-4 API Key',
    description: 'Secondary AI model for intelligent responses',
    url: 'https://platform.openai.com/api-keys',
    required: false
  },
  {
    key: 'HUGGINGFACE_API_KEY',
    name: 'Hugging Face API Key',
    description: 'Specialist models for domain-specific tasks',
    url: 'https://huggingface.co/settings/tokens',
    required: false
  },
  {
    key: 'FREESOUND_API_KEY',
    name: 'Freesound API Key',
    description: 'Environmental sounds for weather ambience',
    url: 'https://freesound.org/apiv2/apply/',
    required: false
  }
];

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function collectApiKeys() {
  console.log('🌍 Buhera-West Environmental Intelligence Platform Setup');
  console.log('=====================================================\n');
  
  const keys = {};
  
  for (const apiKey of API_KEYS) {
    console.log(`\n📋 ${apiKey.name}`);
    console.log(`   Description: ${apiKey.description}`);
    console.log(`   Get from: ${apiKey.url}`);
    console.log(`   Required: ${apiKey.required ? 'Yes' : 'Optional'}`);
    
    const value = await askQuestion(`   Enter your ${apiKey.name} (or press Enter to skip): `);
    keys[apiKey.key] = value || 'your_' + apiKey.key.toLowerCase() + '_here';
  }
  
  return keys;
}

async function main() {
  try {
    const keys = await collectApiKeys();
    
    // Generate .env.local content
    let envContent = ENV_TEMPLATE;
    for (const [key, value] of Object.entries(keys)) {
      envContent = envContent.replace(`{{${key}}}`, value);
    }
    
    // Write to .env.local
    const envPath = path.join(__dirname, '.env.local');
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Environment file created successfully!');
    console.log(`📁 Created: ${envPath}`);
    
    // Check for missing required keys
    const missingRequired = API_KEYS
      .filter(api => api.required && keys[api.key].startsWith('your_'))
      .map(api => api.name);
    
    if (missingRequired.length > 0) {
      console.log('\n⚠️  Missing required API keys:');
      missingRequired.forEach(name => console.log(`   - ${name}`));
      console.log('\n   The app will show errors for these services until you add the keys.');
    }
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Add your API keys to .env.local');
    console.log('   2. Restart your development server');
    console.log('   3. Test the application');
    
    console.log('\n📖 For more information, see:');
    console.log('   - ENV_SETUP.md for detailed setup instructions');
    console.log('   - WEATHER_SETUP.md for weather API configuration');
    console.log('   - AI_INTEGRATION.md for AI model configuration');
    
  } catch (error) {
    console.error('Error creating environment file:', error);
  } finally {
    rl.close();
  }
}

main(); 
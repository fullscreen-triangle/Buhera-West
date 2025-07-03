# 🎵 Ambient Audio Setup Guide

This guide will help you set up the ambient weather audio system that provides contextual environmental sounds.

## 🔑 Required API Keys

### 1. **Freesound API** (🏆 **HIGHEST PRIORITY**)
- **Website**: https://freesound.org/apiv2/apply/
- **Process**: 
  1. Create account at https://freesound.org/
  2. Go to https://freesound.org/apiv2/apply/
  3. Fill out the form (use "Weather Visualization App" as description)
  4. Get your API key immediately
- **Environment Variable**: `NEXT_PUBLIC_FREESOUND_API_KEY`
- **Cost**: FREE with attribution
- **What it provides**: Huge library of environmental sounds, rain, wind, thunder, birds, etc.

### 2. **YouTube Data API v3** (Optional but helpful)
- **Website**: https://console.developers.google.com/
- **Process**:
  1. Go to Google Cloud Console
  2. Create new project
  3. Enable YouTube Data API v3
  4. Create credentials (API key)
- **Environment Variable**: `NEXT_PUBLIC_YOUTUBE_API_KEY`
- **Cost**: FREE (10,000 requests/day)
- **What it provides**: Access to ambient sound videos

### 3. **Spotify Web API** (Optional - Limited usefulness)
- **Website**: https://developer.spotify.com/dashboard
- **Process**:
  1. Create Spotify Developer account
  2. Create new app
  3. Get Client ID and Client Secret
- **Environment Variables**: 
  - `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`
  - `NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET`
- **Cost**: FREE
- **What it provides**: Limited ambient music (not many nature sounds)

## 📋 Environment Variables

Add these to your `.env.local` file:

```bash
# Weather API Keys (you already have these)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_key

# Ambient Audio API Keys
NEXT_PUBLIC_FREESOUND_API_KEY=your_freesound_api_key_here
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_optional
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_optional
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_optional

# Audio Settings
NEXT_PUBLIC_AMBIENT_AUDIO_ENABLED=true
NEXT_PUBLIC_DEFAULT_AMBIENT_VOLUME=0.3
NEXT_PUBLIC_AUDIO_TRANSITION_DURATION=3000
NEXT_PUBLIC_ENABLE_REGIONAL_SOUNDS=true
```

## 🎯 Priority Setup (Start Here)

**If you only want to set up ONE API key, use Freesound:**

1. Go to https://freesound.org/apiv2/apply/
2. Create account and get API key
3. Add to `.env.local`: `NEXT_PUBLIC_FREESOUND_API_KEY=your_key_here`
4. Restart your development server

That's it! Your weather app will now have ambient sounds.

## 🎼 How It Works

The system will automatically:

1. **Detect weather changes** in your weather visualization
2. **Select appropriate sounds**:
   - Clear weather → Birds chirping, gentle breeze
   - Rain → Gentle rainfall, water drops
   - Storm → Thunder, heavy rain, wind
   - Snow → Quiet snowfall, winter wind
   - Wind → Wind through grass, leaves rustling
   - Fog → Mysterious ambience, distant sounds

3. **Layer multiple sounds**:
   - Primary layer: Main weather sound
   - Secondary layer: Supporting environmental sounds
   - Regional layer: Location-specific sounds (African birds, ocean waves, etc.)

4. **Adjust volume dynamically** based on weather intensity

## 🧪 Testing Your Setup

Once you have the Freesound API key set up:

1. Start your development server: `npm run dev`
2. Navigate to any weather page (e.g., `/weather/atmosphere`)
3. Change weather conditions in your app
4. Listen for subtle ambient sounds that match the weather
5. Check browser console for audio system logs (🎵 emoji)

## 🎚️ Volume Control

The system is designed to be **subtle and non-intrusive**:
- Default volume: 30%
- Max volume cap: 70%
- Fades between weather transitions
- Respects user's system volume settings

## 🌍 Regional Sounds

The system can detect your location and add appropriate regional ambience:
- **Southern Africa**: African birds, savanna sounds
- **Coastal areas**: Ocean waves, seabirds
- **Mountain regions**: Mountain wind, echo
- **Forest areas**: Forest birds, rustling leaves

## 🔧 Customization

You can customize the audio system by modifying:
- `src/services/ambientAudioService.js` - Core audio logic
- `src/components/weather/AmbientWeatherAudio.jsx` - React integration
- Weather sound profiles in the service

## 🚨 Troubleshooting

**No sounds playing?**
1. Check if Freesound API key is set correctly
2. Check browser console for errors
3. Ensure browser allows audio autoplay
4. Try clicking somewhere on the page first (browser autoplay restriction)

**Sounds are too loud/quiet?**
- Adjust `NEXT_PUBLIC_DEFAULT_AMBIENT_VOLUME` in `.env.local`
- Or modify `baseVolume` in `ambientAudioService.js`

**API rate limits?**
- Freesound: 2000 requests/day (very generous)
- Sounds are cached to minimize API calls

## 🎨 Future Enhancements

Possible improvements:
- Real-time microphone analysis for local ambient detection
- Machine learning weather-sound correlation
- User-customizable sound profiles
- Integration with smart home weather sensors
- Seasonal sound variations
- Time-of-day audio adjustments

---

**Ready to make your weather app come alive with sound? Start with the Freesound API key and you'll have immersive ambient audio in minutes!** 🎵 
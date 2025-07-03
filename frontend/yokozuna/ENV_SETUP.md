# BUHERA WEST - API CONFIGURATION GUIDE

## 🚀 Complete API Integration Setup

This guide shows how to replace all mock/simulated data with **real API calls** using your available APIs.

### 📋 Quick Setup Checklist

**Essential APIs (for basic functionality):**
- [ ] OpenWeather API Key
- [ ] Mapbox Access Token
- [ ] At least one AI API (Anthropic/OpenAI/Hugging Face)

**Advanced APIs (for enhanced features):**
- [ ] NASA API Key
- [ ] NOAA API Key
- [ ] ECMWF API Key

---

## 🔧 Environment Configuration

Create a `.env.local` file in the `frontend/yokozuna/` directory:

```bash
# Copy this template and fill in your API keys
cp ENV_SETUP.md .env.local
```

### Weather APIs Configuration

```env
# ===== PRIMARY WEATHER DATA =====
# OpenWeather API (REQUIRED for basic weather)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# NASA API (Earth imagery and satellite data)
NEXT_PUBLIC_NASA_API_KEY=your_nasa_api_key_here

# NOAA API (US weather forecasts)
NEXT_PUBLIC_NOAA_API_KEY=your_noaa_api_key_here

# ECMWF API (European weather models)
NEXT_PUBLIC_ECMWF_API_KEY=your_ecmwf_api_key_here
```

### Mapping and Geospatial APIs

```env
# ===== MAPPING SERVICES =====
# Mapbox (REQUIRED for maps and elevation)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

### AI APIs (Already Integrated)

```env
# ===== AI SERVICES =====
# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OpenAI GPT-4
OPENAI_API_KEY=your_openai_api_key_here

# Hugging Face
HUGGINGFACE_API_KEY=your_huggingface_token_here
```

### Optional Enhancement APIs

```env
# ===== OPTIONAL ENHANCEMENTS =====
# WeatherAPI.com (alternative weather)
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key_here

# OpenUV API (UV index data)
NEXT_PUBLIC_OPENUV_API_KEY=your_openuv_api_key_here

# AirVisual API (air quality)
NEXT_PUBLIC_AIRVISUAL_API_KEY=your_airvisual_api_key_here

# Sentinel Hub (satellite imagery)
NEXT_PUBLIC_SENTINEL_HUB_CLIENT_ID=your_sentinel_client_id_here
NEXT_PUBLIC_SENTINEL_HUB_CLIENT_SECRET=your_sentinel_client_secret_here
```

---

## 🎯 What Gets Replaced with Real Data

### ✅ Already Replaced (Mock → Real APIs)

1. **Information Dashboard**: Now uses real weather data from multiple APIs
2. **Weather Details**: Real hourly forecasts instead of random numbers
3. **Crossfilter Charts**: Real environmental data instead of `Math.random()`
4. **AI Integration**: Real responses from Claude, GPT-4, and Hugging Face
5. **Coordinates Config**: Climate-based realistic data instead of hardcoded values

### 🔄 Data Source Priority

The system intelligently chooses data sources:

```
1st Priority: Real API data (OpenWeather, NASA, NOAA, etc.)
2nd Priority: Climate-based realistic data (Southern Africa patterns)
3rd Priority: Fallback mock data (only if everything else fails)
```

---

## 🌍 API Provider Quick Links

### Weather Services
- **OpenWeather**: https://openweathermap.org/api (Free: 1,000 calls/day)
- **NASA**: https://api.nasa.gov/ (Free: 1,000 requests/hour)
- **NOAA**: https://www.weather.gov/documentation/services-web-api (Free)
- **ECMWF**: https://www.ecmwf.int/en/forecasts/accessing-forecasts

### Mapping Services
- **Mapbox**: https://www.mapbox.com/ (Free: 50,000 map loads/month)

### AI Services
- **Anthropic**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/api-keys
- **Hugging Face**: https://huggingface.co/settings/tokens

---

## 🚀 Getting Started (5-Minute Setup)

### Minimum Configuration for Real Data

```env
# Just these 3 API keys will replace most mock data:
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key_here
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
ANTHROPIC_API_KEY=your_key_here
```

### Test Your Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check the browser console** for these messages:
   - ✅ "Using real weather data from multiple APIs"
   - ✅ "Real weather data loaded successfully"
   - ❌ "Real APIs not available, using climate-based fallback"

3. **Verify in the UI:**
   - Information dashboard shows real weather data
   - AI responses come from actual API providers
   - Maps load satellite imagery from Mapbox

---

## 📊 What Changes with Real APIs

### Before (Mock Data)
```javascript
// Old: Random numbers
temperature: Math.random() * 30 + 10
humidity: Math.random() * 100
```

### After (Real APIs)
```javascript
// New: Real API data
temperature: realWeatherData.temperature    // 22.3°C
humidity: realWeatherData.humidity          // 68%
sources: ["OpenWeather", "NASA", "NOAA"]    // Data attribution
```

---

## 🛡️ Smart Fallback System

The system gracefully handles API failures:

```
Real API Available? → Use real data ✅
Real API Failed? → Use climate-based realistic data 🌤️
Everything Failed? → Use basic fallback data 📊
```

**You'll always see realistic data** - never broken charts or empty components.

---

## 🔍 Monitoring API Usage

### Check API Status in Browser Console

```javascript
// Look for these log messages:
"✅ Using real weather data from multiple APIs"
"🌤️ Using climate-based realistic fallback data"  
"📊 Using basic fallback data"
```

### API Rate Limits

- **OpenWeather**: 60 calls/minute, 1,000/day (free tier)
- **NASA**: 1,000 requests/hour
- **Mapbox**: 50,000 map loads/month
- **AI APIs**: Pay-per-token (monitor usage in dashboards)

---

## 🎉 Benefits of Real API Integration

1. **Accurate Data**: Real-time weather, satellite imagery, forecasts
2. **Enhanced AI**: Actual Claude/GPT responses instead of simulated
3. **Better UX**: Loading states, error handling, data attribution
4. **Scalability**: Professional-grade APIs with proper rate limiting
5. **Reliability**: Multiple data sources with smart fallbacks

---

## 🚨 Important Notes

- **Never commit API keys** to version control
- **Use `.env.local`** (gitignored by default)
- **Monitor API usage** to avoid unexpected charges
- **Start with free tiers** to test functionality
- **The system works with partial API keys** - add more as needed

---

## 💡 Next Steps

1. **Add your API keys** to `.env.local`
2. **Restart the development server**
3. **Check browser console** for success messages
4. **Explore the enhanced features** with real data
5. **Add more APIs gradually** for additional features

The system is now using **real environmental intelligence** instead of simulated data! 🌍 
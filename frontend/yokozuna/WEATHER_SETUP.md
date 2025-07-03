# Weather API Setup Guide

This stunning weather globe visualization requires API keys to function properly. Follow these steps to get your free API keys and set up the application.

## 🌤️ OpenWeatherMap API (Required)

1. **Sign up** at [OpenWeatherMap](https://openweathermap.org/api)
2. **Create an account** (it's free!)
3. **Generate an API key** from your dashboard
4. **Copy your API key**

## 🗺️ Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` and add your API keys:**
   ```env
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_actual_api_key_here
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```

3. **Save the file** and restart your development server

## 🚀 Features You'll Get

- **Real-time weather data** for any location on Earth
- **Interactive 3D globe** with weather markers
- **Advanced weather filtering** by conditions
- **Detailed weather information** with charts
- **Notable weather conditions** globally
- **Search functionality** for any location
- **Weather forecasting** with hourly data

## 📡 API Limits

- **OpenWeatherMap Free Tier:** 1,000 calls/day, 60 calls/minute
- **Caching:** The app caches data for 10 minutes to optimize API usage
- **Smart loading:** Only loads weather for visible locations

## 🎨 Customization

The weather globe can be customized by editing:
- `src/components/weather/WeatherGlobe.jsx` - Globe appearance and behavior
- `src/components/weather/WeatherOverlay.jsx` - Right panel controls
- `src/components/weather/WeatherDetails.jsx` - Detailed weather view
- `src/services/weatherService.js` - API integration and data processing

## 🔧 Troubleshooting

**API key not working?**
- Make sure your `.env.local` file is in the `frontend/yokozuna/` directory
- Restart your development server after adding the API key
- Check that your OpenWeatherMap API key is activated (can take a few minutes)

**Globe not loading?**
- Check the browser console for error messages
- Ensure you have a stable internet connection
- Verify the API key is correct and has sufficient quota

**Performance issues?**
- The app loads weather data for 15 major cities by default
- Weather data is cached for 10 minutes to reduce API calls
- Large datasets are filtered based on selected weather types

Enjoy exploring global weather patterns! 🌍⛅ 
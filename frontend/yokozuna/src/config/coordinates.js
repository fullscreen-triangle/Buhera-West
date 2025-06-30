// Default Buhera West coordinates configuration
// Use these coordinates across all components for consistency

export const DEFAULT_COORDINATES = {
  lat: -19.260799284567543,
  lng: 31.499455719488008,
  latitude: -19.260799284567543,
  longitude: 31.499455719488008,
  altitude: 1247.3,
  accuracy: '±0.5mm',
  datum: 'WGS84',
  zone: '36K'
};

// Weather data generation using default coordinates
export const generateDefaultWeatherData = () => {
  const baseTemp = 20 + Math.sin(DEFAULT_COORDINATES.lat * Math.PI / 180) * 10;
  return {
    temperature: Math.round(baseTemp + (Math.random() - 0.5) * 10),
    humidity: Math.round(60 + (Math.random() - 0.5) * 40),
    windSpeed: Math.round(5 + Math.random() * 15),
    pressure: Math.round(1013 + (Math.random() - 0.5) * 20),
    visibility: Math.round(10 + Math.random() * 15),
    uvIndex: Math.round(3 + Math.random() * 8),
    precipitation: Math.round(Math.random() * 100),
    cloudCover: Math.round(Math.random() * 100)
  };
};

// Geographic display name
export const DEFAULT_LOCATION_NAME = 'Buhera West, Zimbabwe';

// Bounding box for Southern Africa (for geocoder)
export const SOUTHERN_AFRICA_BBOX = [22, -35, 35, -15];
export const SOUTHERN_AFRICA_CENTER = [30, -20]; 
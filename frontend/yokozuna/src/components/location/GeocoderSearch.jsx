'use client'
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const GeocoderSearch = ({ 
onLocationSelect,
placeholder = "Search for a location...",
bbox = [22, -35, 35, -15], // Default: Southern Africa
proximity = [30, -20], // Default: Southern Africa center
types = 'country,region,place,postcode,locality,neighborhood',
className = "",
showLabels = true,
accessToken
}) => {
const router = useRouter();
const geocoderRef = useRef(null);
const mapboxLoaded = useRef(false);
const geocoderInstance = useRef(null);

useEffect(() => {
  // Load Mapbox GL JS and Geocoder
  const loadMapboxResources = async () => {
    if (mapboxLoaded.current) return;

    try {
      // Load Mapbox GL CSS
      if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
        const mapboxCSS = document.createElement('link');
        mapboxCSS.href = 'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css';
        mapboxCSS.rel = 'stylesheet';
        document.head.appendChild(mapboxCSS);
      }

      // Load Geocoder CSS
      if (!document.querySelector('link[href*="mapbox-gl-geocoder.css"]')) {
        const geocoderCSS = document.createElement('link');
        geocoderCSS.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.css';
        geocoderCSS.rel = 'stylesheet';
        geocoderCSS.type = 'text/css';
        document.head.appendChild(geocoderCSS);
      }

      // Load Mapbox GL JS
      if (!window.mapboxgl) {
        const mapboxScript = document.createElement('script');
        mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js';
        
        mapboxScript.onload = () => {
          loadGeocoder();
        };
        
        document.head.appendChild(mapboxScript);
      } else {
        loadGeocoder();
      }

      mapboxLoaded.current = true;
    } catch (error) {
      console.error('Error loading Mapbox resources:', error);
    }
  };

  const loadGeocoder = () => {
    if (!window.MapboxGeocoder) {
      const geocoderScript = document.createElement('script');
      geocoderScript.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.min.js';
      
      geocoderScript.onload = () => {
        initializeGeocoder();
      };
      
      document.head.appendChild(geocoderScript);
    } else {
      initializeGeocoder();
    }
  };

  const initializeGeocoder = () => {
    if (typeof window !== 'undefined' && 
        window.mapboxgl && 
        window.MapboxGeocoder && 
        geocoderRef.current &&
        accessToken) {
      
      // Set Mapbox access token
      window.mapboxgl.accessToken = accessToken;
      
      // Clear any existing geocoder
      if (geocoderInstance.current) {
        geocoderInstance.current.clear();
      }
      
      const geocoder = new window.MapboxGeocoder({
        accessToken: accessToken,
        types: types,
        placeholder: placeholder,
        bbox: bbox,
        proximity: proximity,
        mapboxgl: window.mapboxgl
      });

      // Store geocoder instance
      geocoderInstance.current = geocoder;

      // Clear container and add geocoder
      if (geocoderRef.current) {
        geocoderRef.current.innerHTML = '';
        geocoder.addTo(geocoderRef.current);
      }

      // Handle geocoder result
      geocoder.on('result', (e) => {
        const result = e.result;
        const coordinates = result.geometry.coordinates;
        const placeName = result.place_name;
        
        const locationData = {
          coordinates: {
            lat: coordinates[1],
            lng: coordinates[0]
          },
          placeName: placeName,
          fullResult: result
        };

        // Call custom handler if provided
        if (onLocationSelect) {
          onLocationSelect(locationData);
        } else {
          // Default behavior: navigate to map page
          const searchParams = new URLSearchParams({
            lat: coordinates[1].toString(),
            lng: coordinates[0].toString(),
            location: placeName
          });
          
          router.push(`/map?${searchParams.toString()}`);
        }
      });

      // Handle geocoder clear
      geocoder.on('clear', () => {
        console.log('Geocoder cleared');
      });

      // Handle geocoder error
      geocoder.on('error', (error) => {
        console.error('Geocoder error:', error);
      });
    }
  };

  if (accessToken) {
    loadMapboxResources();
  } else {
    console.error('Mapbox access token is required for GeocoderSearch component');
  }

  // Cleanup function
  return () => {
    if (geocoderInstance.current) {
      geocoderInstance.current.clear();
    }
    if (geocoderRef.current) {
      geocoderRef.current.innerHTML = '';
    }
  };
}, [router, onLocationSelect, placeholder, bbox, proximity, types, accessToken]);

if (!accessToken) {
  return (
    <div className="w-full p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
      <p className="text-sm font-medium">Mapbox access token is required</p>
    </div>
  );
}

return (
  <div className={`w-full ${className}`}>
    {showLabels && (
      <div className="mb-4 space-y-1">
        <h3 className="text-lg font-semibold text-dark dark:text-light md:text-base">
          Search Location
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 md:text-xs">
          Enter a location to view on the map
        </p>
      </div>
    )}
    <div 
      ref={geocoderRef} 
      className="w-full rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg geocoder-container"
    />

    {/* Tailwind-compatible custom styles for the geocoder */}
    <style jsx>{`
      .geocoder-container :global(.mapboxgl-ctrl-geocoder) {
        @apply w-full max-w-none rounded-lg border-2 border-gray-300 shadow-md;
      }
      
      .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder) {
        @apply bg-gray-700 border-gray-600;
      }
      
      .geocoder-container :global(.mapboxgl-ctrl-geocoder input) {
        @apply px-4 py-3 text-sm;
      }
      
      .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder input) {
        @apply bg-gray-700 text-gray-100 placeholder-gray-400;
      }
      
      .geocoder-container :global(.mapboxgl-ctrl-geocoder .mapboxgl-ctrl-geocoder--icon-search) {
        @apply top-3 left-3;
      }
      
      .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions) {
        @apply rounded-b-lg shadow-lg border-t-0;
      }
      
      .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions) {
        @apply bg-gray-700 border-gray-600;
      }
      
      .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > .active),
      .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > li:hover) {
        @apply bg-gray-100;
      }
      
      .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > .active),
      .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > li:hover) {
        @apply bg-gray-600 text-gray-100;
      }
      
      .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > li) {
        @apply px-4 py-2 text-sm;
      }
      
      .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > li) {
        @apply text-gray-200;
      }
    `}</style>
  </div>
);
};

export default GeocoderSearch;
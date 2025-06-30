'use client'
import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const GeocoderSearch = ({ 
  onLocationSelect,
  placeholder = "Search for a location in Southern Africa...",
  bbox = [22, -35, 35, -15], // Southern Africa bounding box
  proximity = [30, -20], // Southern Africa center
  types = 'country,region,place,postcode,locality,neighborhood',
  className = "",
  showLabels = true
}) => {
  const router = useRouter();
  const geocoderRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeGeocoder = async () => {
      try {
        // Check if we're in the browser
        if (typeof window === 'undefined') return;

        // Get access token from environment
        const accessToken = 'pk.eyJ1IjoiY2hvbWJvY2hpbm9rb3NvcmFtb3RvIiwiYSI6ImNsYWIzNzN1YzA5M24zdm4xb2txdXZ0YXQifQ.mltBkVjXA6LjUJ1bi7gdRg';
        
        if (!accessToken) {
          throw new Error('Mapbox access token not found');
        }

        // Load CSS files
        const loadCSS = (href) => {
          if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.href = href;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
          }
        };

        loadCSS('https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css');
        loadCSS('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.css');

        // Load scripts dynamically
        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        };

        // Load Mapbox GL JS first
        await loadScript('https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js');
        
        // Then load Geocoder
        await loadScript('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.min.js');

        // Wait a bit for scripts to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (window.mapboxgl && window.MapboxGeocoder && geocoderRef.current) {
          window.mapboxgl.accessToken = accessToken;
          
          const geocoder = new window.MapboxGeocoder({
            accessToken: accessToken,
            types: types,
            placeholder: placeholder,
            bbox: bbox,
            proximity: proximity,
            mapboxgl: window.mapboxgl,
            marker: false, // Don't show marker on map
            collapsed: false
          });

          // Clear container and add geocoder
          geocoderRef.current.innerHTML = '';
          geocoder.addTo(geocoderRef.current);

          // Handle result selection
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

            if (onLocationSelect) {
              onLocationSelect(locationData);
            } else {
              // Navigate to location page
              const searchParams = new URLSearchParams({
                lat: coordinates[1].toString(),
                lng: coordinates[0].toString(),
                location: encodeURIComponent(placeName)
              });
              
              router.push(`/location?${searchParams.toString()}`);
            }
          });

          geocoder.on('error', (error) => {
            console.error('Geocoder error:', error);
            setError('Search failed. Please try again.');
          });

          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing geocoder:', err);
        setError('Failed to load search. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initializeGeocoder();
  }, [router, onLocationSelect, placeholder, bbox, proximity, types]);

  if (error) {
    return (
      <div className="w-full p-4 text-center text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-sm font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-3 py-1 text-xs bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded transition-colors"
        >
          Retry
        </button>
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
            Enter a location to view weather analysis
          </p>
        </div>
      )}
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-400"></div>
              <span className="text-sm">Loading search...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={geocoderRef} 
          className="w-full geocoder-container"
        />
      </div>

      <style jsx>{`
        .geocoder-container :global(.mapboxgl-ctrl-geocoder) {
          width: 100%;
          max-width: none;
          border-radius: 0.5rem;
          border: 2px solid #d1d5db;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          font-family: inherit;
        }
        
        .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder) {
          background-color: #374151;
          border-color: #4b5563;
        }
        
        .geocoder-container :global(.mapboxgl-ctrl-geocoder input) {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          height: auto;
          line-height: 1.25rem;
        }
        
        .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder input) {
          background-color: #374151;
          color: #f9fafb;
        }
        
        .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder input::placeholder) {
          color: #9ca3af;
        }
        
        .geocoder-container :global(.mapboxgl-ctrl-geocoder .mapboxgl-ctrl-geocoder--icon-search) {
          top: 0.75rem;
          left: 0.75rem;
        }
        
        .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions) {
          border-radius: 0 0 0.5rem 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-top: none;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions) {
          background-color: #374151;
          border-color: #4b5563;
        }
        
        .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > li) {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > .active),
        .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > li:hover) {
          background-color: #f3f4f6;
        }
        
        .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > .active),
        .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > li:hover) {
          background-color: #4b5563;
        }
        
        .dark .geocoder-container :global(.mapboxgl-ctrl-geocoder .suggestions > li) {
          color: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default GeocoderSearch;
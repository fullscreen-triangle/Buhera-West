'use client'
import { useRef, useEffect } from 'react';
import AnimatedText from "@/components/AnimatedText";
import dynamic from 'next/dynamic';
import Layout from "@/components/Layout";
import Head from "next/head";
import TransitionEffect from "@/components/TransitionEffect";
import { useRouter } from "next/navigation";

// Import Mapbox packages
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

// Import CSS
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const Network = dynamic(() => import('@/components/satellites/Network'), {
ssr: false,
});

export default function Home() {
const router = useRouter();
const geocoderRef = useRef(null);
const mapboxLoaded = useRef(false);

useEffect(() => {
  // Load Mapbox GL JS and Geocoder
  const loadMapboxResources = async () => {
    if (mapboxLoaded.current) return;

    // Load Mapbox GL CSS
    const mapboxCSS = document.createElement('link');
    mapboxCSS.href = 'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css';
    mapboxCSS.rel = 'stylesheet';
    document.head.appendChild(mapboxCSS);

    // Load Geocoder CSS
    const geocoderCSS = document.createElement('link');
    geocoderCSS.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.css';
    geocoderCSS.rel = 'stylesheet';
    geocoderCSS.type = 'text/css';
    document.head.appendChild(geocoderCSS);

    // Load Mapbox GL JS
    const mapboxScript = document.createElement('script');
    mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js';
    
    mapboxScript.onload = () => {
      // Load Geocoder JS
      const geocoderScript = document.createElement('script');
      geocoderScript.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.min.js';
      
      geocoderScript.onload = () => {
        initializeGeocoder();
      };
      
      document.head.appendChild(geocoderScript);
    };
    
    document.head.appendChild(mapboxScript);
    mapboxLoaded.current = true;
  };

  const initializeGeocoder = () => {
    if (typeof window !== 'undefined' && window.mapboxgl && window.MapboxGeocoder && geocoderRef.current) {
      // Set your Mapbox access token here
      window.mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Replace with your actual token
      
      const geocoder = new window.MapboxGeocoder({
        accessToken: window.mapboxgl.accessToken,
        types: 'country,region,place,postcode,locality,neighborhood',
        placeholder: 'Search for a location in Southern Africa...',
        bbox: [22, -35, 35, -15], // Bounding box for Southern Africa
        proximity: [30, -20] // Center point for Southern Africa
      });

      // Clear any existing geocoder
      if (geocoderRef.current) {
        geocoderRef.current.innerHTML = '';
        geocoder.addTo(geocoderRef.current);
      }

      // Handle geocoder result
      geocoder.on('result', (e) => {
        const result = e.result;
        const coordinates = result.geometry.coordinates;
        const placeName = result.place_name;
        
        // Redirect to terrain page with location data
        const searchParams = new URLSearchParams({
          lat: coordinates[1].toString(),
          lng: coordinates[0].toString(),
          location: placeName
        });
        
        router.push(`/terrain?${searchParams.toString()}`);
      });

      // Handle geocoder clear
      geocoder.on('clear', () => {
        console.log('Geocoder cleared');
      });
    }
  };

  loadMapboxResources();

  // Cleanup function
  return () => {
    if (geocoderRef.current) {
      geocoderRef.current.innerHTML = '';
    }
  };
}, [router]);

return (
  <>
    <Head>
      <title>Buhera West</title>
      <meta
        name="description"
        content="High Precision Weather Analysis and Prediction for Southern Africa"
      />
    </Head>

    <TransitionEffect />
    <article
      className={`flex min-h-screen items-center text-dark dark:text-light sm:items-start`}
    >
      <Layout className="!pt-0 md:!pt-16 sm:!pt-16">
        <div className="flex w-full items-start justify-between md:flex-col">
          <div className="w-1/2 md:inline-block md:w-full">
            <Network className="h-auto w-full" />
          </div>
          <div className="flex w-1/2 flex-col items-center self-center lg:w-full lg:text-center">
            <AnimatedText
              text="High Precision Weather Analysis and Prediction for Southern Africa"
              className="!text-left !text-6xl xl:!text-5xl lg:!text-center lg:!text-6xl md:!text-5xl sm:!text-3xl"
            />
            <p className="my-4 text-base font-medium md:text-sm sm:!text-xs">
              High-performance computational platform designed for agricultural weather analysis and prediction in Southern African climatic conditions.
            </p>
            
            {/* Geocoder Search Section - Replaces Resume and Contact links */}
            <div className="mt-6 w-full max-w-md self-start lg:self-center">
              <div className="mb-4 space-y-1">
                <h3 className="text-lg font-semibold text-dark dark:text-light md:text-base">
                  Search Location
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 md:text-xs">
                  Enter a location to view weather analysis
                </p>
              </div>
              <div 
                ref={geocoderRef} 
                className="w-full rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg"
              />
            </div>
          </div>
        </div>
      </Layout>
    </article>

    {/* Tailwind-compatible custom styles for the geocoder */}
    <style jsx global>{`
      .mapboxgl-ctrl-geocoder {
        @apply w-full max-w-none rounded-lg border-2 border-gray-300 shadow-md;
      }
      
      .dark .mapboxgl-ctrl-geocoder {
        @apply bg-gray-700 border-gray-600;
      }
      
      .mapboxgl-ctrl-geocoder input {
        @apply px-4 py-3 text-sm;
      }
      
      .dark .mapboxgl-ctrl-geocoder input {
        @apply bg-gray-700 text-gray-100 placeholder-gray-400;
      }
      
      .mapboxgl-ctrl-geocoder .mapboxgl-ctrl-geocoder--icon-search {
        @apply top-3 left-3;
      }
      
      .mapboxgl-ctrl-geocoder .suggestions {
        @apply rounded-b-lg shadow-lg border-t-0;
      }
      
      .dark .mapboxgl-ctrl-geocoder .suggestions {
        @apply bg-gray-700 border-gray-600;
      }
      
      .mapboxgl-ctrl-geocoder .suggestions > .active,
      .mapboxgl-ctrl-geocoder .suggestions > li:hover {
        @apply bg-gray-100;
      }
      
      .dark .mapboxgl-ctrl-geocoder .suggestions > .active,
      .dark .mapboxgl-ctrl-geocoder .suggestions > li:hover {
        @apply bg-gray-600 text-gray-100;
      }
      
      .mapboxgl-ctrl-geocoder .suggestions > li {
        @apply px-4 py-2 text-sm;
      }
      
      .dark .mapboxgl-ctrl-geocoder .suggestions > li {
        @apply text-gray-200;
      }
    `}</style>
  </>
);
}
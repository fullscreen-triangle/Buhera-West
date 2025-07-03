import React, { useEffect, useRef, useState } from 'react'
import { DEFAULT_COORDINATES } from '@/config/coordinates'

const WeatherScrollStory = () => {
  const mapRef = useRef()
  const [map, setMap] = useState(null)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Buhera-West region story configuration
  const config = {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    showMarkers: true,
    markerColor: '#FF6B35',
    theme: 'dark',
    use3dTerrain: true,
    title: 'Buhera-West Weather Intelligence',
    subtitle: 'Advanced meteorological analysis and prediction systems for Southern African agricultural regions',
    byline: 'Southern African Climatic Research Initiative',
    footer: 'Data sources: Weather stations, satellite imagery, and ground sensors across Buhera-West region',
    chapters: [
      {
        id: 'overview',
        alignment: 'center',
        title: 'Buhera-West Overview',
        description: `Welcome to the Buhera-West Agricultural Weather Analysis Platform. This region in Zimbabwe's Manicaland Province covers approximately 2,400 km² of diverse agricultural landscape. Our comprehensive monitoring system tracks weather patterns across multiple microclimates to support agricultural decision-making.`,
        location: {
          center: [DEFAULT_COORDINATES.longitude, DEFAULT_COORDINATES.latitude],
          zoom: 8.5,
          pitch: 45,
          bearing: 0
        },
        mapAnimation: 'flyTo',
        weatherData: {
          temperature: 24.5,
          humidity: 67,
          rainfall: 1250,
          stations: 12
        }
      },
      {
        id: 'central-station',
        alignment: 'left',
        title: 'Central Weather Station',
        description: `Our primary meteorological station located at the geographic center of Buhera-West (${DEFAULT_COORDINATES.latitude}°S, ${DEFAULT_COORDINATES.longitude}°E). This facility houses advanced atmospheric sensors, soil monitoring equipment, and serves as the central data hub for the entire network.`,
        location: {
          center: [DEFAULT_COORDINATES.longitude, DEFAULT_COORDINATES.latitude],
          zoom: 12,
          pitch: 60,
          bearing: -15
        },
        mapAnimation: 'flyTo',
        weatherData: {
          temperature: 25.2,
          humidity: 65,
          windSpeed: 12.4,
          pressure: 1013.2
        }
      },
      {
        id: 'northern-highlands',
        alignment: 'right',
        title: 'Northern Highland Zone',
        description: `The northern highlands experience cooler temperatures and higher precipitation due to elevation effects. This microclimate zone is crucial for tobacco and coffee cultivation. Average elevation: 1,200-1,400m above sea level.`,
        location: {
          center: [DEFAULT_COORDINATES.longitude + 0.02, DEFAULT_COORDINATES.latitude - 0.15],
          zoom: 10,
          pitch: 50,
          bearing: 30
        },
        mapAnimation: 'flyTo',
        weatherData: {
          temperature: 22.1,
          humidity: 78,
          rainfall: 1450,
          elevation: 1320
        }
      },
      {
        id: 'southern-lowlands',
        alignment: 'left',
        title: 'Southern Lowland Valley',
        description: `The southern valley region features warmer, drier conditions ideal for maize and cotton production. This area experiences distinct wet and dry seasons with sophisticated irrigation systems supporting year-round agriculture.`,
        location: {
          center: [DEFAULT_COORDINATES.longitude - 0.01, DEFAULT_COORDINATES.latitude + 0.12],
          zoom: 11,
          pitch: 40,
          bearing: -45
        },
        mapAnimation: 'flyTo',
        weatherData: {
          temperature: 27.8,
          humidity: 52,
          rainfall: 980,
          elevation: 850
        }
      },
      {
        id: 'eastern-watershed',
        alignment: 'center',
        title: 'Eastern Watershed',
        description: `The eastern boundary follows the watershed divide, where precipitation patterns shift dramatically. This critical zone affects water distribution across the entire region and is monitored by our specialized hydrological sensors.`,
        location: {
          center: [DEFAULT_COORDINATES.longitude + 0.25, DEFAULT_COORDINATES.latitude],
          zoom: 9,
          pitch: 35,
          bearing: 90
        },
        mapAnimation: 'flyTo',
        weatherData: {
          precipitation: 1680,
          watershed: 'Odzi River',
          monitoring: 'Hydrological',
          flowRate: '245 m³/s'
        }
      },
      {
        id: 'agricultural-zones',
        alignment: 'full',
        title: 'Agricultural Monitoring Network',
        description: `Our comprehensive sensor network spans five distinct agricultural zones, each with unique microclimatic conditions. Real-time data from 47 weather stations, 156 soil sensors, and 34 atmospheric monitoring points provides unprecedented insight into regional weather patterns.`,
        location: {
          center: [DEFAULT_COORDINATES.longitude, DEFAULT_COORDINATES.latitude],
          zoom: 7,
          pitch: 20,
          bearing: 0
        },
        mapAnimation: 'flyTo',
        weatherData: {
          totalStations: 47,
          soilSensors: 156,
          atmosphericPoints: 34,
          coverage: '2400 km²'
        }
      }
    ]
  }

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapRef.current || map) return

    // Load Mapbox GL JS dynamically
    const script = document.createElement('script')
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js'
    script.onload = () => {
      const link = document.createElement('link')
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      // Load scrollama
      const scrollamaScript = document.createElement('script')
      scrollamaScript.src = 'https://unpkg.com/scrollama'
      scrollamaScript.onload = () => {
        initializeMap()
      }
      document.head.appendChild(scrollamaScript)
    }
    document.head.appendChild(script)

    const initializeMap = () => {
      // Set access token
      window.mapboxgl.accessToken = config.accessToken

      // Create map
      const mapInstance = new window.mapboxgl.Map({
        container: mapRef.current,
        style: config.style,
        center: config.chapters[0].location.center,
        zoom: config.chapters[0].location.zoom,
        bearing: config.chapters[0].location.bearing,
        pitch: config.chapters[0].location.pitch,
        interactive: false,
        projection: 'mercator'
      })

      // Store marker reference
      let marker = null

      mapInstance.on('load', () => {
        // Add 3D terrain if enabled
        if (config.use3dTerrain) {
          mapInstance.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
          })
          mapInstance.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })

          mapInstance.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 0.0],
              'sky-atmosphere-sun-intensity': 15
            }
          })
        }

        // Add single marker that will move
        if (config.showMarkers) {
          marker = new window.mapboxgl.Marker({ 
            color: config.markerColor
          })
          marker.setLngLat(config.chapters[0].location.center).addTo(mapInstance)
        }

        setMap(mapInstance)
        setIsMapLoaded(true)

        // Setup scrollama
        const scroller = window.scrollama()
        scroller
          .setup({
            step: '.step',
            offset: 0.5,
            progress: true
          })
          .onStepEnter(async (response) => {
            const chapterIndex = parseInt(response.element.getAttribute('data-chapter'))
            const chapter = config.chapters[chapterIndex]
            
            if (chapter) {
              response.element.classList.add('active')
              setCurrentChapter(chapterIndex)
              
              // Animate map to chapter location
              mapInstance[chapter.mapAnimation || 'flyTo'](chapter.location)
              
              // Update marker position
              if (marker) {
                marker.setLngLat(chapter.location.center)
              }
            }
          })
          .onStepExit((response) => {
            response.element.classList.remove('active')
          })
      })
    }

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [])



  return (
    <div className="weather-scroll-story relative">
      {/* Fixed map background */}
      <div 
        ref={mapRef}
        className="fixed top-0 left-0 w-full h-screen z-0"
        style={{ height: '100vh', width: '100vw' }}
      />

      {/* Story content */}
      <div className="relative z-10">
        {/* Header */}
        <div className={`min-h-screen flex items-center justify-center text-center p-8 ${config.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          <div className="max-w-4xl bg-black bg-opacity-60 p-8 rounded-2xl backdrop-blur-sm">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">{config.title}</h1>
            <h2 className="text-xl md:text-2xl mb-6 text-gray-200">{config.subtitle}</h2>
            <p className="text-lg text-gray-300">{config.byline}</p>
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-0">
          {config.chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              data-chapter={index}
              className={`step min-h-screen flex items-center transition-opacity duration-500 ${
                chapter.alignment === 'left' ? 'lefty' :
                chapter.alignment === 'right' ? 'righty' :
                chapter.alignment === 'full' ? 'fully' :
                'centered'
              }`}
            >
                             <div className="p-8 bg-black bg-opacity-70 rounded-2xl backdrop-blur-sm text-white">
                {chapter.title && (
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">{chapter.title}</h3>
                )}
                
                {chapter.description && (
                  <p className="text-lg leading-relaxed mb-6">{chapter.description}</p>
                )}

                {/* Weather data display */}
                {chapter.weatherData && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(chapter.weatherData).map(([key, value]) => (
                      <div key={key} className="bg-white bg-opacity-10 rounded-lg p-3">
                        <div className="font-semibold capitalize text-gray-300">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-xl font-bold text-white">
                          {typeof value === 'number' ? 
                            (key.includes('temperature') ? `${value}°C` :
                             key.includes('humidity') ? `${value}%` :
                             key.includes('rainfall') || key.includes('precipitation') ? `${value}mm` :
                             key.includes('elevation') ? `${value}m` :
                             key.includes('windSpeed') ? `${value} km/h` :
                             key.includes('pressure') ? `${value} hPa` :
                             value) : value
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="min-h-screen flex items-center justify-center text-center p-8">
          <div className="max-w-4xl bg-black bg-opacity-60 p-8 rounded-2xl backdrop-blur-sm text-white">
            <p className="text-lg">{config.footer}</p>
          </div>
        </div>
      </div>

      {/* Chapter navigation indicators */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-20">
        <div className="flex flex-col space-y-3">
          {config.chapters.map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                index === currentChapter 
                  ? 'bg-orange-500 border-orange-500 scale-125' 
                  : 'bg-transparent border-white hover:border-orange-300'
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .step {
          padding-bottom: 50vh;
          opacity: 0.25;
        }
        
        .step.active {
          opacity: 0.9 !important;
        }
        
        .weather-scroll-story {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
        }

        #map {
          top: 0;
          height: 100vh;
          width: 100vw;
          position: fixed;
        }

        .step div {
          padding: 25px 50px;
          line-height: 25px;
          font-size: 13px;
        }

        .centered {
          width: 50vw;
          margin: 0 auto;
        }

        .lefty {
          width: 33vw;
          margin-left: 5vw;
        }

        .righty {
          width: 33vw;
          margin-left: 62vw;
        }

        .fully {
          width: 100%;
          margin: auto;
        }

        /* Mapbox canvas touch handling */
        .mapboxgl-canvas-container.mapboxgl-touch-zoom-rotate.mapboxgl-touch-drag-pan,
        .mapboxgl-canvas-container.mapboxgl-touch-zoom-rotate.mapboxgl-touch-drag-pan .mapboxgl-canvas {
          touch-action: unset;
        }
        
        @media (max-width: 750px) {
          .centered,
          .lefty,
          .righty,
          .fully {
            width: 90vw;
            margin: 0 auto;
          }
          
          .step {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  )
}

export default WeatherScrollStory 
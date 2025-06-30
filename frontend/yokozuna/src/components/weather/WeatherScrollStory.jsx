import React, { useEffect, useRef, useState } from 'react'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap/dist/gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import * as d3 from 'd3'

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const WeatherScrollStory = () => {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const mapRef = useRef(null)
  const [currentSection, setCurrentSection] = useState(0)
  const lenisRef = useRef(null)

  // Weather data simulation
  const weatherData = {
    current: {
      temperature: 26.8,
      humidity: 67,
      pressure: 1013.2,
      windSpeed: 8.3,
      windDirection: 225,
      uvIndex: 8,
      visibility: 12.5,
      dewPoint: 18.2,
      feelsLike: 29.1
    },
    hourly: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      temp: 26.8 + Math.sin(i * Math.PI / 12) * 8 + Math.random() * 3,
      humidity: 67 + Math.sin(i * Math.PI / 8) * 15 + Math.random() * 5,
      wind: 8.3 + Math.sin(i * Math.PI / 6) * 4 + Math.random() * 2,
      pressure: 1013.2 + Math.sin(i * Math.PI / 10) * 8 + Math.random() * 3
    })),
    daily: Array.from({ length: 7 }, (_, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      high: 28 + Math.random() * 8,
      low: 18 + Math.random() * 5,
      precipitation: Math.random() * 100,
      icon: ['☀️', '⛅', '🌦️', '🌧️', '⛈️'][Math.floor(Math.random() * 5)]
    }))
  }

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false
    })

    lenisRef.current = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // GSAP ScrollTrigger integration with Lenis
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    // Create D3 visualizations
    createTemperatureChart()
    createWindChart()
    createPressureChart()
    createWeatherMap()

    // Setup scroll triggers
    setupScrollTriggers()

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const createTemperatureChart = () => {
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('id', 'temp-chart')
      .attr('width', 600)
      .attr('height', 300)
      .style('opacity', 0)

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, 23])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(weatherData.hourly, d => d.temp))
      .nice()
      .range([height, 0])

    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'temp-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0)

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ff6b6b')
      .attr('stop-opacity', 0.1)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4ecdc4')
      .attr('stop-opacity', 0.8)

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.hour))
      .y(d => yScale(d.temp))
      .curve(d3.curveCardinal)

    // Create area generator
    const area = d3.area()
      .x(d => xScale(d.hour))
      .y0(height)
      .y1(d => yScale(d.temp))
      .curve(d3.curveCardinal)

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}:00`))

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}°C`))

    // Add area
    g.append('path')
      .datum(weatherData.hourly)
      .attr('fill', 'url(#temp-gradient)')
      .attr('d', area)
      .attr('class', 'temp-area')

    // Add line
    g.append('path')
      .datum(weatherData.hourly)
      .attr('fill', 'none')
      .attr('stroke', '#4ecdc4')
      .attr('stroke-width', 3)
      .attr('d', line)
      .attr('class', 'temp-line')

    // Add data points
    g.selectAll('.temp-dot')
      .data(weatherData.hourly)
      .enter().append('circle')
      .attr('class', 'temp-dot')
      .attr('cx', d => xScale(d.hour))
      .attr('cy', d => yScale(d.temp))
      .attr('r', 4)
      .attr('fill', '#4ecdc4')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
  }

  const createWindChart = () => {
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('id', 'wind-chart')
      .attr('width', 300)
      .attr('height', 300)
      .style('opacity', 0)

    const centerX = 150
    const centerY = 150
    const radius = 120

    // Wind rose background circles
    const circles = [40, 80, 120]
    circles.forEach(r => {
      svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1)
    })

    // Wind direction indicators
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    directions.forEach((dir, i) => {
      const angle = (i * 45 - 90) * Math.PI / 180
      const x = centerX + Math.cos(angle) * (radius + 20)
      const y = centerY + Math.sin(angle) * (radius + 20)
      
      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .text(dir)
        .style('font-size', '12px')
        .style('fill', '#666')
    })

    // Current wind indicator
    const windAngle = (weatherData.current.windDirection - 90) * Math.PI / 180
    const windX = centerX + Math.cos(windAngle) * (weatherData.current.windSpeed * 8)
    const windY = centerY + Math.sin(windAngle) * (weatherData.current.windSpeed * 8)

    svg.append('line')
      .attr('x1', centerX)
      .attr('y1', centerY)
      .attr('x2', windX)
      .attr('y2', windY)
      .attr('stroke', '#ff6b6b')
      .attr('stroke-width', 4)
      .attr('class', 'wind-arrow')

    svg.append('circle')
      .attr('cx', windX)
      .attr('cy', windY)
      .attr('r', 6)
      .attr('fill', '#ff6b6b')
      .attr('class', 'wind-head')
  }

  const createPressureChart = () => {
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('id', 'pressure-chart')
      .attr('width', 400)
      .attr('height', 200)
      .style('opacity', 0)

    const margin = { top: 20, right: 30, bottom: 30, left: 60 }
    const width = 400 - margin.left - margin.right
    const height = 200 - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, 23])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(weatherData.hourly, d => d.pressure))
      .nice()
      .range([height, 0])

    const line = d3.line()
      .x(d => xScale(d.hour))
      .y(d => yScale(d.pressure))
      .curve(d3.curveMonotoneX)

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}h`))

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d} hPa`))

    // Add pressure line
    g.append('path')
      .datum(weatherData.hourly)
      .attr('fill', 'none')
      .attr('stroke', '#9b59b6')
      .attr('stroke-width', 2)
      .attr('d', line)
      .attr('class', 'pressure-line')
  }

  const createWeatherMap = () => {
    const svg = d3.select(mapRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', 400)

    // Simple weather map visualization
    const mapWidth = 600
    const mapHeight = 400

    // Background
    svg.append('rect')
      .attr('width', mapWidth)
      .attr('height', mapHeight)
      .attr('fill', '#87CEEB')
      .attr('opacity', 0.3)

    // Weather systems
    const weatherSystems = [
      { x: 150, y: 100, type: 'high', intensity: 0.8 },
      { x: 400, y: 200, type: 'low', intensity: 0.6 },
      { x: 300, y: 300, type: 'front', intensity: 0.7 }
    ]

    weatherSystems.forEach(system => {
      const color = system.type === 'high' ? '#4CAF50' : 
                   system.type === 'low' ? '#f44336' : '#FF9800'
      
      svg.append('circle')
        .attr('cx', system.x)
        .attr('cy', system.y)
        .attr('r', system.intensity * 50)
        .attr('fill', color)
        .attr('opacity', 0.4)
        .attr('class', `weather-${system.type}`)
    })

    // Current location marker
    svg.append('circle')
      .attr('cx', 300)
      .attr('cy', 200)
      .attr('r', 8)
      .attr('fill', '#2196F3')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('class', 'location-marker')
  }

  const setupScrollTriggers = () => {
    const sections = [
      '#current-weather',
      '#temperature-detail', 
      '#wind-analysis',
      '#pressure-trends',
      '#forecast',
      '#weather-map'
    ]

    sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          setCurrentSection(index)
          animateSection(index)
        },
        onLeave: () => {
          if (index < sections.length - 1) {
            setCurrentSection(index + 1)
          }
        },
        onEnterBack: () => {
          setCurrentSection(index)
          animateSection(index)
        }
      })
    })

    // Chart animations
    ScrollTrigger.create({
      trigger: '#temperature-detail',
      start: 'top center',
      onEnter: () => {
        gsap.to('#temp-chart', { 
          opacity: 1, 
          duration: 1,
          ease: 'power2.out'
        })
        
        // Animate temperature line
        const pathLength = d3.select('.temp-line').node()?.getTotalLength()
        if (pathLength) {
          gsap.fromTo('.temp-line', 
            { 
              strokeDasharray: pathLength,
              strokeDashoffset: pathLength 
            },
            { 
              strokeDashoffset: 0,
              duration: 2,
              ease: 'power2.out'
            }
          )
        }
      }
    })

    ScrollTrigger.create({
      trigger: '#wind-analysis',
      start: 'top center',
      onEnter: () => {
        gsap.to('#wind-chart', { 
          opacity: 1, 
          duration: 1 
        })
        
        gsap.fromTo('.wind-arrow',
          { strokeDasharray: '0,100' },
          { 
            strokeDasharray: '100,0',
            duration: 1.5,
            ease: 'power2.out'
          }
        )
      }
    })

    ScrollTrigger.create({
      trigger: '#pressure-trends',
      start: 'top center',
      onEnter: () => {
        gsap.to('#pressure-chart', { 
          opacity: 1, 
          duration: 1 
        })
      }
    })

    // Parallax effects
    gsap.to('.weather-bg', {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  }

  const animateSection = (sectionIndex) => {
    // Add section-specific animations
    const tl = gsap.timeline()
    
    switch(sectionIndex) {
      case 0:
        tl.from('.current-temp', { scale: 0.5, opacity: 0, duration: 0.8 })
          .from('.current-details', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
        break
      case 1:
        tl.from('.temp-chart-container', { x: -100, opacity: 0, duration: 0.8 })
        break
      case 2:
        tl.from('.wind-container', { rotation: 180, opacity: 0, duration: 1 })
        break
      case 3:
        tl.from('.pressure-container', { y: 50, opacity: 0, duration: 0.8 })
        break
      case 4:
        tl.from('.forecast-cards', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1 })
        break
      case 5:
        tl.from('.map-container', { scale: 0.9, opacity: 0, duration: 1 })
        break
    }
  }

  return (
    <div ref={containerRef} className="weather-scroll-story min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 text-white">
      {/* Fixed Navigation */}
      <div className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-md rounded-lg p-3">
        <div className="flex flex-col space-y-2">
          {['Current', 'Temp', 'Wind', 'Pressure', 'Forecast', 'Map'].map((label, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSection === index ? 'bg-white scale-125' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Background Elements */}
      <div className="weather-bg fixed inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Current Weather Section */}
      <section id="current-weather" className="min-h-screen flex items-center justify-center relative">
        <div className="text-center space-y-8 max-w-4xl mx-auto px-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-4">
            Personal Weather
          </h1>
          <p className="text-xl md:text-2xl opacity-80 mb-12">
            High-precision atmospheric analysis for Buhera-West
          </p>
          
          <div className="current-temp text-8xl md:text-9xl font-bold mb-8">
            {weatherData.current.temperature}°C
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 current-details">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div className="text-sm opacity-70">Feels Like</div>
              <div className="text-2xl font-bold">{weatherData.current.feelsLike}°C</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div className="text-sm opacity-70">Humidity</div>
              <div className="text-2xl font-bold">{weatherData.current.humidity}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div className="text-sm opacity-70">Wind</div>
              <div className="text-2xl font-bold">{weatherData.current.windSpeed} m/s</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div className="text-sm opacity-70">UV Index</div>
              <div className="text-2xl font-bold">{weatherData.current.uvIndex}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Temperature Detail Section */}
      <section id="temperature-detail" className="min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Temperature Trends
            </h2>
            <p className="text-lg opacity-80">
              24-hour temperature analysis showing thermal patterns and atmospheric variations. 
              Peak temperatures typically occur between 2-4 PM, with overnight cooling creating optimal agricultural conditions.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                <div className="text-sm opacity-70">Daily High</div>
                <div className="text-2xl font-bold">32.1°C</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                <div className="text-sm opacity-70">Daily Low</div>
                <div className="text-2xl font-bold">18.7°C</div>
              </div>
            </div>
          </div>
          <div className="temp-chart-container bg-white/5 backdrop-blur-md rounded-lg p-6">
            <div ref={chartRef} className="w-full"></div>
          </div>
        </div>
      </section>

      {/* Wind Analysis Section */}
      <section id="wind-analysis" className="min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="wind-container bg-white/5 backdrop-blur-md rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold mb-4">Wind Rose</h3>
            <div className="flex justify-center">
              {/* Wind chart will be inserted here */}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm opacity-70">Direction</div>
                <div className="text-xl font-bold">SW</div>
              </div>
              <div>
                <div className="text-sm opacity-70">Gusts</div>
                <div className="text-xl font-bold">12.4 m/s</div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Wind Patterns
            </h2>
            <p className="text-lg opacity-80">
              Prevailing southwesterly winds bringing moisture from the Indian Ocean. 
              Wind speeds are optimal for agricultural ventilation and natural cooling.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Surface Wind</span>
                <span className="font-bold">{weatherData.current.windSpeed} m/s</span>
              </div>
              <div className="flex justify-between">
                <span>Wind Direction</span>
                <span className="font-bold">{weatherData.current.windDirection}°</span>
              </div>
              <div className="flex justify-between">
                <span>Turbulence</span>
                <span className="font-bold text-green-400">Low</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pressure Trends Section */}
      <section id="pressure-trends" className="min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Atmospheric Pressure
            </h2>
            <p className="text-lg opacity-80 max-w-3xl mx-auto">
              Barometric pressure trends indicate stable weather conditions. 
              Rising pressure suggests continued fair weather, optimal for outdoor agricultural activities.
            </p>
          </div>
          <div className="pressure-container bg-white/5 backdrop-blur-md rounded-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                {/* Pressure chart will be inserted here */}
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm opacity-70">Current Pressure</div>
                  <div className="text-3xl font-bold">{weatherData.current.pressure}</div>
                  <div className="text-sm">hPa</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm opacity-70">Trend</div>
                  <div className="text-xl font-bold text-green-400">Rising ↗</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm opacity-70">Sea Level</div>
                  <div className="text-xl font-bold">1015.8 hPa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forecast Section */}
      <section id="forecast" className="min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              7-Day Outlook
            </h2>
            <p className="text-lg opacity-80">
              Extended weather forecast with precipitation probability and agricultural implications
            </p>
          </div>
          <div className="forecast-cards grid grid-cols-1 md:grid-cols-7 gap-4">
            {weatherData.daily.map((day, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
                <div className="text-sm opacity-70 mb-2">{day.day}</div>
                <div className="text-3xl mb-2">{day.icon}</div>
                <div className="space-y-1">
                  <div className="font-bold">{Math.round(day.high)}°</div>
                  <div className="text-sm opacity-70">{Math.round(day.low)}°</div>
                  <div className="text-xs">
                    <div className="text-blue-300">{Math.round(day.precipitation)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weather Map Section */}
      <section id="weather-map" className="min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Regional Weather Systems
            </h2>
            <p className="text-lg opacity-80">
              Live atmospheric conditions across Southern Africa with pressure systems and frontal boundaries
            </p>
          </div>
          <div className="map-container bg-white/5 backdrop-blur-md rounded-lg p-8">
            <div ref={mapRef} className="w-full flex justify-center">
              {/* Weather map will be inserted here */}
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <div className="text-sm">High Pressure</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Low Pressure</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Weather Front</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Current Location</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default WeatherScrollStory 
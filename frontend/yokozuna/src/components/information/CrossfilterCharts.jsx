import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { DEFAULT_COORDINATES } from '@/config/coordinates';

const CrossfilterCharts = ({ 
  data, 
  filters = {}, 
  onFilterUpdate, 
  locationData = DEFAULT_COORDINATES,
  fullscreen = false 
}) => {
  const timeSeriesRef = useRef();
  const scatterPlotRef = useRef();
  const histogramRef = useRef();
  const heatmapRef = useRef();
  const parallelCoordRef = useRef();
  const threeDScatterRef = useRef();
  
  const [dimensions, setDimensions] = useState({
    width: fullscreen ? 800 : 400,
    height: fullscreen ? 600 : 300
  });
  
  const [selectedBrush, setSelectedBrush] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Process data for D3 visualizations
  const processedData = useMemo(() => {
    if (!data || !data.data) return null;
    
    const rawData = data.filteredData || data.data;
    
    return {
      timeSeries: rawData.map(d => ({
        date: new Date(d.timestamp),
        temperature: d.temperature,
        humidity: d.humidity,
        pressure: d.pressure
      })),
      scatter: rawData.map(d => ({
        x: d.temperature,
        y: d.humidity,
        pressure: d.pressure,
        timestamp: d.timestamp
      })),
      histogram: {
        temperature: rawData.map(d => d.temperature),
        humidity: rawData.map(d => d.humidity),
        pressure: rawData.map(d => d.pressure),
        windSpeed: rawData.map(d => d.windSpeed)
      },
      heatmap: generateHeatmapData(rawData),
      parallel: rawData.map(d => ({
        temperature: d.temperature,
        humidity: d.humidity,
        pressure: d.pressure,
        windSpeed: d.windSpeed,
        precipitation: d.precipitation,
        soilMoisture: d.soilMoisture
      })),
      threeDScatter: rawData.map(d => ({
        x: d.temperature,
        y: d.humidity,
        z: d.pressure,
        color: d.temperature
      }))
    };
  }, [data]);

  const generateHeatmapData = (rawData) => {
    const hours = 24;
    const days = 7;
    const heatmapData = [];
    
    for (let day = 0; day < days; day++) {
      for (let hour = 0; hour < hours; hour++) {
        const relevantData = rawData.filter(d => {
          const date = new Date(d.timestamp);
          return date.getDay() === day && date.getHours() === hour;
        });
        
        const avgTemp = relevantData.length > 0 
          ? relevantData.reduce((sum, d) => sum + d.temperature, 0) / relevantData.length
          : 20;
          
        heatmapData.push({
          day,
          hour,
          value: avgTemp,
          count: relevantData.length
        });
      }
    }
    
    return heatmapData;
  };

  // Brush handler for cross-filtering
  const handleBrush = useCallback((chartType, selection, dimension) => {
    if (!selection || !onFilterUpdate) return;
    
    let range;
    
    switch (chartType) {
      case 'timeSeries':
        const timeScale = d3.scaleTime()
          .domain(d3.extent(processedData.timeSeries, d => d.date))
          .range([0, dimensions.width - 60]);
        range = selection.map(timeScale.invert);
        break;
        
      case 'scatter':
        const xScale = d3.scaleLinear()
          .domain(d3.extent(processedData.scatter, d => d.x))
          .range([40, dimensions.width - 40]);
        const yScale = d3.scaleLinear()
          .domain(d3.extent(processedData.scatter, d => d.y))
          .range([dimensions.height - 40, 40]);
        range = {
          x: selection.map(xScale.invert),
          y: selection.map(yScale.invert)
        };
        break;
        
      case 'histogram':
        const histScale = d3.scaleLinear()
          .domain(d3.extent(processedData.histogram[dimension]))
          .range([40, dimensions.width - 40]);
        range = selection.map(histScale.invert);
        break;
        
      default:
        range = selection;
    }
    
    onFilterUpdate(dimension, range);
    setSelectedBrush({ chartType, dimension, range });
  }, [processedData, dimensions, onFilterUpdate]);

  // Time Series Chart
  const renderTimeSeries = useCallback(() => {
    if (!timeSeriesRef.current || !processedData) return;
    
    const svg = d3.select(timeSeriesRef.current);
    svg.selectAll('*').remove();
    
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = (dimensions.height / 2) - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData.timeSeries, d => d.date))
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain(d3.extent(processedData.timeSeries, d => d.temperature))
      .range([height, 0]);
    
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.temperature))
      .curve(d3.curveMonotoneX);
    
    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    
    g.append('g')
      .call(d3.axisLeft(yScale));
    
    // Add line
    g.append('path')
      .datum(processedData.timeSeries)
      .attr('fill', 'none')
      .attr('stroke', '#00ff88')
      .attr('stroke-width', 2)
      .attr('d', line);
    
    // Add brush
    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on('brush end', (event) => {
        if (event.selection) {
          handleBrush('timeSeries', event.selection, 'time');
        }
      });
    
    g.append('g')
      .attr('class', 'brush')
      .call(brush);
    
    // Add dots
    g.selectAll('.dot')
      .data(processedData.timeSeries)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.temperature))
      .attr('r', 2)
      .attr('fill', '#00ff88')
      .on('mouseover', (event, d) => setHoveredPoint(d))
      .on('mouseout', () => setHoveredPoint(null));
      
  }, [processedData, dimensions, handleBrush]);

  // Scatter Plot
  const renderScatterPlot = useCallback(() => {
    if (!scatterPlotRef.current || !processedData) return;
    
    const svg = d3.select(scatterPlotRef.current);
    svg.selectAll('*').remove();
    
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = (dimensions.height / 2) - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const xScale = d3.scaleLinear()
      .domain(d3.extent(processedData.scatter, d => d.x))
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain(d3.extent(processedData.scatter, d => d.y))
      .range([height, 0]);
    
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain(d3.extent(processedData.scatter, d => d.pressure));
    
    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    
    g.append('g')
      .call(d3.axisLeft(yScale));
    
    // Add axis labels
    g.append('text')
      .attr('transform', `translate(${width/2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '12px')
      .text('Temperature (°C)');
    
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '12px')
      .text('Humidity (%)');
    
    // Add brush
    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on('brush end', (event) => {
        if (event.selection) {
          const [[x0, y0], [x1, y1]] = event.selection;
          handleBrush('scatter', [x0, x1, y0, y1], 'temperature-humidity');
        }
      });
    
    g.append('g')
      .attr('class', 'brush')
      .call(brush);
    
    // Add dots
    g.selectAll('.dot')
      .data(processedData.scatter)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 3)
      .attr('fill', d => colorScale(d.pressure))
      .attr('opacity', 0.7)
      .on('mouseover', (event, d) => setHoveredPoint(d))
      .on('mouseout', () => setHoveredPoint(null));
      
  }, [processedData, dimensions, handleBrush]);

  // Histogram
  const renderHistogram = useCallback(() => {
    if (!histogramRef.current || !processedData) return;
    
    const svg = d3.select(histogramRef.current);
    svg.selectAll('*').remove();
    
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = (dimensions.height / 2) - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const data = processedData.histogram.temperature;
    
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data))
      .range([0, width]);
    
    const histogram = d3.histogram()
      .value(d => d)
      .domain(xScale.domain())
      .thresholds(xScale.ticks(20));
    
    const bins = histogram(data);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);
    
    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    
    g.append('g')
      .call(d3.axisLeft(yScale));
    
    // Add brush
    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on('brush end', (event) => {
        if (event.selection) {
          handleBrush('histogram', event.selection, 'temperature');
        }
      });
    
    g.append('g')
      .attr('class', 'brush')
      .call(brush);
    
    // Add bars
    g.selectAll('.bar')
      .data(bins)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.x0))
      .attr('y', d => yScale(d.length))
      .attr('width', d => xScale(d.x1) - xScale(d.x0) - 1)
      .attr('height', d => height - yScale(d.length))
      .attr('fill', '#00aaff')
      .attr('opacity', 0.7);
      
  }, [processedData, dimensions, handleBrush]);

  // Heatmap
  const renderHeatmap = useCallback(() => {
    if (!heatmapRef.current || !processedData) return;
    
    const svg = d3.select(heatmapRef.current);
    svg.selectAll('*').remove();
    
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = (dimensions.height / 2) - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({length: 24}, (_, i) => i);
    
    const xScale = d3.scaleBand()
      .domain(hours)
      .range([0, width])
      .padding(0.1);
    
    const yScale = d3.scaleBand()
      .domain(days)
      .range([0, height])
      .padding(0.1);
    
    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
      .domain(d3.extent(processedData.heatmap, d => d.value));
    
    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    
    g.append('g')
      .call(d3.axisLeft(yScale));
    
    // Add cells
    g.selectAll('.cell')
      .data(processedData.heatmap)
      .enter().append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.hour))
      .attr('y', d => yScale(days[d.day]))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .on('mouseover', (event, d) => setHoveredPoint(d))
      .on('mouseout', () => setHoveredPoint(null));
      
  }, [processedData, dimensions]);

  // Parallel Coordinates
  const renderParallelCoordinates = useCallback(() => {
    if (!parallelCoordRef.current || !processedData) return;
    
    const svg = d3.select(parallelCoordRef.current);
    svg.selectAll('*').remove();
    
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = (dimensions.height / 2) - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const dimensions_keys = ['temperature', 'humidity', 'pressure', 'windSpeed', 'precipitation'];
    
    const x = d3.scalePoint()
      .domain(dimensions_keys)
      .range([0, width]);
    
    const y = {};
    dimensions_keys.forEach(key => {
      y[key] = d3.scaleLinear()
        .domain(d3.extent(processedData.parallel, d => d[key]))
        .range([height, 0]);
    });
    
    const line = d3.line()
      .defined(d => !isNaN(d[1]))
      .x(d => x(d[0]))
      .y(d => y[d[0]](d[1]));
    
    // Add axes
    dimensions_keys.forEach(key => {
      g.append('g')
        .attr('transform', `translate(${x(key)},0)`)
        .call(d3.axisLeft(y[key]));
        
      g.append('text')
        .attr('x', x(key))
        .attr('y', -10)
        .style('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '10px')
        .text(key);
    });
    
    // Add lines
    g.selectAll('.line')
      .data(processedData.parallel.slice(0, 100)) // Limit for performance
      .enter().append('path')
      .attr('class', 'line')
      .attr('d', d => line(dimensions_keys.map(key => [key, d[key]])))
      .attr('fill', 'none')
      .attr('stroke', '#00ff88')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);
      
  }, [processedData, dimensions]);

  // 3D Scatter Plot Component
  const ThreeDScatterPlot = () => {
    const meshRef = useRef();
    
    const points = useMemo(() => {
      if (!processedData || !processedData.threeDScatter) return [];
      
      return processedData.threeDScatter.slice(0, 500).map(d => ({
        position: [
          (d.x - 20) * 0.1, // Center around 20°C
          (d.y - 50) * 0.02, // Center around 50% humidity
          (d.z - 1013) * 0.01 // Center around 1013 hPa
        ],
        color: d3.interpolateViridis((d.color - 10) / 20) // Color by temperature
      }));
    }, [processedData]);
    
    return (
      <group ref={meshRef}>
        {points.map((point, index) => (
          <mesh key={index} position={point.position}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={point.color} />
          </mesh>
        ))}
        
        {/* Axes */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.01, 0.01]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.01, 2, 0.01]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.01, 0.01, 2]} />
          <meshBasicMaterial color="#0000ff" />
        </mesh>
      </group>
    );
  };

  // Update dimensions on fullscreen change
  useEffect(() => {
    setDimensions({
      width: fullscreen ? 800 : 400,
      height: fullscreen ? 600 : 300
    });
  }, [fullscreen]);

  // Render charts when data changes
  useEffect(() => {
    if (processedData) {
      renderTimeSeries();
      renderScatterPlot();
      renderHistogram();
      renderHeatmap();
      renderParallelCoordinates();
    }
  }, [processedData, dimensions, renderTimeSeries, renderScatterPlot, renderHistogram, renderHeatmap, renderParallelCoordinates]);

  if (!processedData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
        <span>Loading crossfilter data...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 space-y-4">
      {/* Chart Grid */}
      <div className={`grid gap-4 ${fullscreen ? 'grid-cols-3 grid-rows-2' : 'grid-cols-2 grid-rows-3'}`}>
        
        {/* Time Series */}
        <div className="bg-black/20 rounded-lg border border-white/10 p-3">
          <h3 className="text-sm font-medium text-white mb-2">Temperature Over Time</h3>
          <svg
            ref={timeSeriesRef}
            width={dimensions.width}
            height={dimensions.height / 2}
            className="bg-gray-900/50 rounded"
          />
        </div>
        
        {/* Scatter Plot */}
        <div className="bg-black/20 rounded-lg border border-white/10 p-3">
          <h3 className="text-sm font-medium text-white mb-2">Temperature vs Humidity</h3>
          <svg
            ref={scatterPlotRef}
            width={dimensions.width}
            height={dimensions.height / 2}
            className="bg-gray-900/50 rounded"
          />
        </div>
        
        {/* Histogram */}
        <div className="bg-black/20 rounded-lg border border-white/10 p-3">
          <h3 className="text-sm font-medium text-white mb-2">Temperature Distribution</h3>
          <svg
            ref={histogramRef}
            width={dimensions.width}
            height={dimensions.height / 2}
            className="bg-gray-900/50 rounded"
          />
        </div>
        
        {/* Heatmap */}
        <div className="bg-black/20 rounded-lg border border-white/10 p-3">
          <h3 className="text-sm font-medium text-white mb-2">Temperature by Day/Hour</h3>
          <svg
            ref={heatmapRef}
            width={dimensions.width}
            height={dimensions.height / 2}
            className="bg-gray-900/50 rounded"
          />
        </div>
        
        {/* Parallel Coordinates */}
        <div className="bg-black/20 rounded-lg border border-white/10 p-3">
          <h3 className="text-sm font-medium text-white mb-2">Multi-dimensional Analysis</h3>
          <svg
            ref={parallelCoordRef}
            width={dimensions.width}
            height={dimensions.height / 2}
            className="bg-gray-900/50 rounded"
          />
        </div>
        
        {/* 3D Scatter Plot */}
        <div className="bg-black/20 rounded-lg border border-white/10 p-3">
          <h3 className="text-sm font-medium text-white mb-2">3D Environmental Space</h3>
          <div className="bg-gray-900/50 rounded" style={{ width: dimensions.width, height: dimensions.height / 2 }}>
            <Canvas camera={{ position: [2, 2, 2], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <ThreeDScatterPlot />
            </Canvas>
          </div>
        </div>
      </div>
      
      {/* Filter Status */}
      {hoveredPoint && (
        <div className="absolute bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg border border-white/20 text-xs">
          <div className="font-semibold mb-1">Data Point</div>
          {Object.entries(hoveredPoint).map(([key, value]) => (
            <div key={key}>{key}: {typeof value === 'number' ? value.toFixed(2) : value}</div>
          ))}
        </div>
      )}
      
      {/* Crossfilter Status */}
      <div className="text-xs text-gray-400 mt-2">
        <span>Crossfilter Engine: </span>
        <span className="text-green-400">Active</span>
        <span className="ml-4">Data Points: {processedData.timeSeries.length}</span>
        <span className="ml-4">Filters: {Object.keys(filters).length}</span>
      </div>
    </div>
  );
};

export default CrossfilterCharts; 
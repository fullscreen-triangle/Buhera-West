// Atmospheric Data Crossfilter Dashboard
// High-performance interactive charts with map integration

class AtmosphericDashboard {
    constructor() {
        this.charts = new Map();
        this.filters = new Map();
        this.websocket = null;
        this.map = null;
        this.data = [];
        this.filteredData = [];
        
        this.initializeWebSocket();
        this.initializeCharts();
        this.loadInitialData();
    }
    
    initializeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('WebSocket connected');
        };
        
        this.websocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
        };
        
        this.websocket.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt to reconnect after 3 seconds
            setTimeout(() => this.initializeWebSocket(), 3000);
        };
    }
    
    handleWebSocketMessage(message) {
        switch (message.message_type) {
            case 'data_loaded':
                this.loadInitialData();
                break;
            case 'filter_updated':
                this.updateCharts();
                break;
            case 'chart_data':
                if (message.chart_id) {
                    this.updateChart(message.chart_id, message.data);
                }
                break;
        }
    }
    
    async loadInitialData() {
        try {
            // Load configuration
            const configResponse = await fetch('/api/config');
            const config = await configResponse.json();
            
            // Initialize charts based on configuration
            for (const chartConfig of config.charts) {
                await this.createChart(chartConfig);
            }
            
            // Initialize map
            this.initializeMap(config.map_config);
            
            // Initialize filter controls
            this.initializeFilterControls(config.filter_controls);
            
            // Load initial chart data
            await this.updateAllCharts();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }
    
    async createChart(config) {
        switch (config.chart_type) {
            case 'BarChart':
            case 'Histogram':
                this.createBarChart(config);
                break;
            case 'LineChart':
            case 'TimeSeries':
                this.createLineChart(config);
                break;
            case 'ScatterPlot':
                this.createScatterPlot(config);
                break;
            case 'ScatterPlot3D':
                this.createScatterPlot3D(config);
                break;
            case 'PieChart':
                this.createPieChart(config);
                break;
            case 'AreaChart':
                this.createAreaChart(config);
                break;
            case 'Heatmap':
                this.createHeatmap(config);
                break;
            case 'Sunburst':
                this.createSunburst(config);
                break;
            case 'BoxPlot':
                this.createBoxPlot(config);
                break;
        }
    }
    
    createBarChart(config) {
        const container = d3.select(`#${config.chart_id.replace('_chart', '-chart')}`);
        
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = config.width - margin.left - margin.right;
        const height = config.height - margin.top - margin.bottom;
        
        const svg = container.append('svg')
            .attr('width', config.width)
            .attr('height', config.height);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Create scales
        const xScale = d3.scaleLinear().range([0, width]);
        const yScale = d3.scaleLinear().range([height, 0]);
        
        // Create axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`);
        
        g.append('g')
            .attr('class', 'y-axis');
        
        // Create brush for filtering
        const brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on('end', (event) => {
                if (event.selection) {
                    const [x0, x1] = event.selection.map(xScale.invert);
                    this.applyFilter(config.dimension, { min: x0, max: x1 }, 'chart');
                } else {
                    this.clearFilter(config.dimension);
                }
            });
        
        g.append('g')
            .attr('class', 'brush')
            .call(brush);
        
        // Store chart components
        this.charts.set(config.chart_id, {
            config,
            svg,
            g,
            xScale,
            yScale,
            xAxis,
            yAxis,
            brush,
            container
        });
    }
    
    createLineChart(config) {
        const container = d3.select(`#${config.chart_id.replace('_chart', '-chart')}`);
        
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = config.width - margin.left - margin.right;
        const height = config.height - margin.top - margin.bottom;
        
        const svg = container.append('svg')
            .attr('width', config.width)
            .attr('height', config.height);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Create scales
        const xScale = config.dimension === 'time' ? 
            d3.scaleTime().range([0, width]) :
            d3.scaleLinear().range([0, width]);
        const yScale = d3.scaleLinear().range([height, 0]);
        
        // Create line generator
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);
        
        // Create axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`);
        
        g.append('g')
            .attr('class', 'y-axis');
        
        // Create brush for filtering
        const brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on('end', (event) => {
                if (event.selection) {
                    const [x0, x1] = event.selection.map(xScale.invert);
                    this.applyFilter(config.dimension, { min: x0, max: x1 }, 'chart');
                }
            });
        
        g.append('g')
            .attr('class', 'brush')
            .call(brush);
        
        this.charts.set(config.chart_id, {
            config,
            svg,
            g,
            xScale,
            yScale,
            xAxis,
            yAxis,
            line,
            brush,
            container
        });
    }
    
    createScatterPlot(config) {
        const container = d3.select(`#${config.chart_id.replace('_chart', '-chart')}`);
        
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = config.width - margin.left - margin.right;
        const height = config.height - margin.top - margin.bottom;
        
        const svg = container.append('svg')
            .attr('width', config.width)
            .attr('height', config.height);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Create scales
        const xScale = d3.scaleLinear().range([0, width]);
        const yScale = d3.scaleLinear().range([height, 0]);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        
        // Create axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`);
        
        g.append('g')
            .attr('class', 'y-axis');
        
        // Create brush for filtering
        const brush = d3.brush()
            .extent([[0, 0], [width, height]])
            .on('end', (event) => {
                if (event.selection) {
                    const [[x0, y0], [x1, y1]] = event.selection;
                    // Apply 2D filter
                    this.apply2DFilter(config.dimension, {
                        x_min: xScale.invert(x0),
                        x_max: xScale.invert(x1),
                        y_min: yScale.invert(y1),
                        y_max: yScale.invert(y0)
                    });
                }
            });
        
        g.append('g')
            .attr('class', 'brush')
            .call(brush);
        
        this.charts.set(config.chart_id, {
            config,
            svg,
            g,
            xScale,
            yScale,
            colorScale,
            xAxis,
            yAxis,
            brush,
            container
        });
    }
    
    createScatterPlot3D(config) {
        // 3D scatter plot using WebGL or Three.js
        const container = d3.select(`#${config.chart_id.replace('_chart', '-chart')}`);
        
        // For now, create a placeholder
        container.append('div')
            .style('width', `${config.width}px`)
            .style('height', `${config.height}px`)
            .style('background', '#f0f0f0')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .text('3D Scatter Plot (WebGL implementation needed)');
        
        this.charts.set(config.chart_id, {
            config,
            container,
            type: '3d_scatter'
        });
    }
    
    createPieChart(config) {
        const container = d3.select(`#${config.chart_id.replace('_chart', '-chart')}`);
        
        const width = config.width;
        const height = config.height;
        const radius = Math.min(width, height) / 2 - 10;
        
        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);
        
        const g = svg.append('g')
            .attr('transform', `translate(${width/2},${height/2})`);
        
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);
        
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);
        
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        
        this.charts.set(config.chart_id, {
            config,
            svg,
            g,
            pie,
            arc,
            colorScale,
            container
        });
    }
    
    createAreaChart(config) {
        // Similar to line chart but with area fill
        this.createLineChart(config);
        const chart = this.charts.get(config.chart_id);
        
        // Add area generator
        chart.area = d3.area()
            .x(d => chart.xScale(d.x))
            .y0(chart.yScale(0))
            .y1(d => chart.yScale(d.y))
            .curve(d3.curveMonotoneX);
    }
    
    createHeatmap(config) {
        const container = d3.select(`#${config.chart_id.replace('_chart', '-chart')}`);
        
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = config.width - margin.left - margin.right;
        const height = config.height - margin.top - margin.bottom;
        
        const svg = container.append('svg')
            .attr('width', config.width)
            .attr('height', config.height);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Create color scale for heatmap
        const colorScale = d3.scaleSequential(d3.interpolateViridis);
        
        this.charts.set(config.chart_id, {
            config,
            svg,
            g,
            colorScale,
            container
        });
    }
    
    createSunburst(config) {
        const container = d3.select(`#${config.chart_id.replace('_chart', '-chart')}`);
        
        const width = config.width;
        const height = config.height;
        const radius = Math.min(width, height) / 2;
        
        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);
        
        const g = svg.append('g')
            .attr('transform', `translate(${width/2},${height/2})`);
        
        const partition = d3.partition()
            .size([2 * Math.PI, radius]);
        
        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);
        
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        
        this.charts.set(config.chart_id, {
            config,
            svg,
            g,
            partition,
            arc,
            colorScale,
            container
        });
    }
    
    createBoxPlot(config) {
        const container = d3.select(`#${config.chart_id.replace('_chart', '-chart')}`);
        
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = config.width - margin.left - margin.right;
        const height = config.height - margin.top - margin.bottom;
        
        const svg = container.append('svg')
            .attr('width', config.width)
            .attr('height', config.height);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        const xScale = d3.scaleBand().range([0, width]).padding(0.1);
        const yScale = d3.scaleLinear().range([height, 0]);
        
        this.charts.set(config.chart_id, {
            config,
            svg,
            g,
            xScale,
            yScale,
            container
        });
    }
    
    initializeMap(mapConfig) {
        this.map = L.map('map').setView(mapConfig.center, mapConfig.initial_zoom);
        
        L.tileLayer(mapConfig.tile_layer, {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Add drawing controls if enabled
        if (mapConfig.draw_controls) {
            const drawnItems = new L.FeatureGroup();
            this.map.addLayer(drawnItems);
            
            const drawControl = new L.Control.Draw({
                edit: {
                    featureGroup: drawnItems
                },
                draw: {
                    polygon: true,
                    rectangle: true,
                    circle: true,
                    marker: false,
                    polyline: false
                }
            });
            this.map.addControl(drawControl);
            
            this.map.on(L.Draw.Event.CREATED, (event) => {
                const layer = event.layer;
                drawnItems.addLayer(layer);
                
                // Apply geographic filter based on drawn shape
                this.applyGeographicFilter(layer);
            });
        }
        
        // Add map move/zoom event listeners for filtering
        this.map.on('moveend zoomend', () => {
            const bounds = this.map.getBounds();
            this.applyMapBoundsFilter(bounds);
        });
    }
    
    initializeFilterControls(filterControls) {
        const container = d3.select('#filter-controls');
        
        filterControls.forEach(control => {
            const controlDiv = container.append('div')
                .attr('class', 'filter-control');
            
            controlDiv.append('label')
                .attr('class', 'filter-label')
                .text(control.label);
            
            switch (control.control_type) {
                case 'Slider':
                    this.createSliderControl(controlDiv, control);
                    break;
                case 'DateRange':
                    this.createDateRangeControl(controlDiv, control);
                    break;
                case 'Dropdown':
                    this.createDropdownControl(controlDiv, control);
                    break;
                case 'Checkbox':
                    this.createCheckboxControl(controlDiv, control);
                    break;
            }
        });
    }
    
    createSliderControl(container, control) {
        const slider = container.append('input')
            .attr('type', 'range')
            .attr('class', 'filter-input')
            .attr('min', control.control_type.min)
            .attr('max', control.control_type.max)
            .attr('step', control.control_type.step)
            .on('input', (event) => {
                const value = parseFloat(event.target.value);
                this.applyFilter(control.dimension, { min: value, max: control.control_type.max }, 'control');
            });
    }
    
    createDateRangeControl(container, control) {
        const dateInput = container.append('input')
            .attr('type', 'date')
            .attr('class', 'filter-input')
            .on('change', (event) => {
                const date = new Date(event.target.value);
                this.applyFilter(control.dimension, { min: date.getTime(), max: Date.now() }, 'control');
            });
    }
    
    createDropdownControl(container, control) {
        const select = container.append('select')
            .attr('class', 'filter-input')
            .on('change', (event) => {
                const value = event.target.value;
                if (value) {
                    this.applyFilter(control.dimension, { list: [value] }, 'control');
                } else {
                    this.clearFilter(control.dimension);
                }
            });
        
        select.append('option').attr('value', '').text('All');
        
        control.control_type.options.forEach(option => {
            select.append('option').attr('value', option).text(option);
        });
    }
    
    async updateAllCharts() {
        for (const [chartId, chart] of this.charts) {
            await this.updateChart(chartId);
        }
    }
    
    async updateChart(chartId, data = null) {
        if (!data) {
            try {
                const response = await fetch(`/api/chart/${chartId}`);
                data = await response.json();
            } catch (error) {
                console.error(`Error loading data for chart ${chartId}:`, error);
                return;
            }
        }
        
        const chart = this.charts.get(chartId);
        if (!chart) return;
        
        switch (chart.config.chart_type) {
            case 'BarChart':
            case 'Histogram':
                this.updateBarChart(chart, data);
                break;
            case 'LineChart':
            case 'TimeSeries':
                this.updateLineChart(chart, data);
                break;
            case 'ScatterPlot':
                this.updateScatterPlot(chart, data);
                break;
            case 'PieChart':
                this.updatePieChart(chart, data);
                break;
            case 'AreaChart':
                this.updateAreaChart(chart, data);
                break;
        }
    }
    
    updateBarChart(chart, data) {
        if (!data.BarChart) return;
        
        const { bars, x_domain, y_domain } = data.BarChart;
        
        // Update scales
        chart.xScale.domain(x_domain);
        chart.yScale.domain(y_domain);
        
        // Update axes
        chart.g.select('.x-axis').call(chart.xAxis);
        chart.g.select('.y-axis').call(chart.yAxis);
        
        // Update bars
        const barSelection = chart.g.selectAll('.bar')
            .data(bars);
        
        barSelection.enter()
            .append('rect')
            .attr('class', 'bar')
            .merge(barSelection)
            .transition()
            .duration(300)
            .attr('x', d => chart.xScale(d.x))
            .attr('y', d => chart.yScale(d.y))
            .attr('width', d => chart.xScale(d.width))
            .attr('height', d => chart.yScale(0) - chart.yScale(d.y))
            .attr('fill', d => d.color);
        
        barSelection.exit().remove();
    }
    
    updateLineChart(chart, data) {
        if (!data.LineChart) return;
        
        const { lines, x_domain, y_domain } = data.LineChart;
        
        // Update scales
        chart.xScale.domain(x_domain);
        chart.yScale.domain(y_domain);
        
        // Update axes
        chart.g.select('.x-axis').call(chart.xAxis);
        chart.g.select('.y-axis').call(chart.yAxis);
        
        // Update lines
        const lineSelection = chart.g.selectAll('.line')
            .data(lines);
        
        lineSelection.enter()
            .append('path')
            .attr('class', 'line')
            .merge(lineSelection)
            .transition()
            .duration(300)
            .attr('d', d => chart.line(d.points))
            .attr('stroke', d => d.color)
            .attr('fill', 'none')
            .attr('stroke-width', 2);
        
        lineSelection.exit().remove();
    }
    
    updateScatterPlot(chart, data) {
        if (!data.ScatterPlot) return;
        
        const { points, x_domain, y_domain } = data.ScatterPlot;
        
        // Update scales
        chart.xScale.domain(x_domain);
        chart.yScale.domain(y_domain);
        
        // Update axes
        chart.g.select('.x-axis').call(chart.xAxis);
        chart.g.select('.y-axis').call(chart.yAxis);
        
        // Update points
        const pointSelection = chart.g.selectAll('.point')
            .data(points);
        
        pointSelection.enter()
            .append('circle')
            .attr('class', 'point')
            .merge(pointSelection)
            .transition()
            .duration(300)
            .attr('cx', d => chart.xScale(d.x))
            .attr('cy', d => chart.yScale(d.y))
            .attr('r', d => d.size)
            .attr('fill', d => d.color);
        
        pointSelection.exit().remove();
    }
    
    updatePieChart(chart, data) {
        if (!data.PieChart) return;
        
        const { slices } = data.PieChart;
        
        const arcs = chart.g.selectAll('.arc')
            .data(chart.pie(slices));
        
        arcs.enter()
            .append('g')
            .attr('class', 'arc')
            .append('path')
            .merge(arcs.select('path'))
            .transition()
            .duration(300)
            .attr('d', chart.arc)
            .attr('fill', (d, i) => chart.colorScale(i));
        
        arcs.exit().remove();
    }
    
    updateAreaChart(chart, data) {
        // Similar to line chart but with area fill
        this.updateLineChart(chart, data);
        
        if (data.LineChart && chart.area) {
            const { lines } = data.LineChart;
            
            const areaSelection = chart.g.selectAll('.area')
                .data(lines);
            
            areaSelection.enter()
                .append('path')
                .attr('class', 'area')
                .merge(areaSelection)
                .transition()
                .duration(300)
                .attr('d', d => chart.area(d.points))
                .attr('fill', d => d.color)
                .attr('opacity', 0.3);
            
            areaSelection.exit().remove();
        }
    }
    
    async applyFilter(dimension, filter, source) {
        this.filters.set(dimension, filter);
        
        const filterUpdate = {
            dimension,
            filter: this.convertFilter(filter),
            source
        };
        
        try {
            const response = await fetch('/api/filter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filterUpdate)
            });
            
            if (response.ok) {
                await this.updateAllCharts();
                this.updateDataInfo();
            }
        } catch (error) {
            console.error('Error applying filter:', error);
        }
    }
    
    convertFilter(filter) {
        if (filter.min !== undefined && filter.max !== undefined) {
            return { Range: { min: filter.min, max: filter.max } };
        } else if (filter.list) {
            return { List: filter.list };
        } else if (filter.bounds) {
            return { Geographic: { bounds: filter.bounds } };
        }
        return { None: null };
    }
    
    async clearFilter(dimension) {
        this.filters.delete(dimension);
        
        const filterUpdate = {
            dimension,
            filter: { None: null },
            source: 'reset'
        };
        
        try {
            const response = await fetch('/api/filter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filterUpdate)
            });
            
            if (response.ok) {
                await this.updateAllCharts();
                this.updateDataInfo();
            }
        } catch (error) {
            console.error('Error clearing filter:', error);
        }
    }
    
    applyGeographicFilter(layer) {
        let bounds;
        
        if (layer instanceof L.Rectangle || layer instanceof L.Polygon) {
            const latLngs = layer.getLatLngs();
            bounds = L.latLngBounds(latLngs[0]);
        } else if (layer instanceof L.Circle) {
            bounds = layer.getBounds();
        }
        
        if (bounds) {
            const filter = {
                bounds: {
                    north: bounds.getNorth(),
                    south: bounds.getSouth(),
                    east: bounds.getEast(),
                    west: bounds.getWest()
                }
            };
            
            this.applyFilter('geographic', filter, 'map');
        }
    }
    
    applyMapBoundsFilter(bounds) {
        const filter = {
            bounds: {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
            }
        };
        
        this.applyFilter('map_bounds', filter, 'map');
    }
    
    updateDataInfo() {
        // Update the data info display
        // This would be implemented based on the actual data structure
    }
}

// Global functions for reset buttons
function resetFilter(dimension) {
    if (window.dashboard) {
        window.dashboard.clearFilter(dimension);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AtmosphericDashboard();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.dashboard) {
        // Implement responsive chart resizing
        window.dashboard.updateAllCharts();
    }
}); 
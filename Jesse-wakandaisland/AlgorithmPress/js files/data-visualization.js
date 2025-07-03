/**
 * AlgorithmPress Data Visualization Components
 * Comprehensive chart and dashboard system with interactive visualizations
 */

(function(window, document) {
    'use strict';

    // Ensure enhanced components system is available
    if (!window.AlgorithmPressComponents) {
        console.error('AlgorithmPress Enhanced Components required');
        return;
    }

    const Components = window.AlgorithmPressComponents;

    // Data Visualization System
    window.AlgorithmPressDataViz = {
        // Chart types registry
        chartTypes: new Map(),
        
        // Default color schemes
        colorSchemes: {
            default: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#fd7e14', '#e83e8c'],
            modern: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'],
            pastel: ['#a78bfa', '#34d399', '#fbbf24', '#fb7185', '#60a5fa', '#4ade80', '#fb923c', '#f472b6'],
            professional: ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb']
        },

        // Initialize visualization system
        initialize: function() {
            this.registerChartComponents();
            this.loadVisualizationLibraries();
            
            console.log('AlgorithmPress Data Visualization initialized');
        },

        // Register chart components
        registerChartComponents: function() {
            Components.register('line-chart', LineChart);
            Components.register('bar-chart', BarChart);
            Components.register('pie-chart', PieChart);
            Components.register('area-chart', AreaChart);
            Components.register('scatter-plot', ScatterPlot);
            Components.register('heatmap', Heatmap);
            Components.register('dashboard', Dashboard);
            Components.register('metric-card', MetricCard);
            Components.register('data-table', DataTable);
        },

        // Load required visualization libraries
        loadVisualizationLibraries: function() {
            // Check if Chart.js is loaded, if not load it
            if (typeof Chart === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
                script.onload = () => {
                    console.log('Chart.js loaded');
                };
                document.head.appendChild(script);
            }
        }
    };

    // Base Chart Component
    class BaseChart extends Components.registry.get('enhanced-button').__proto__.constructor {
        static get defaultOptions() {
            return {
                width: 400,
                height: 300,
                responsive: true,
                theme: 'default',
                colorScheme: 'default',
                animation: true,
                legend: true,
                tooltip: true,
                data: [],
                labels: []
            };
        }

        createElement() {
            this.element.classList.add('data-viz-container');
            
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.options.width;
            this.canvas.height = this.options.height;
            
            this.element.appendChild(this.canvas);
            
            this.createChart();
        }

        createChart() {
            // Override in subclasses
        }

        updateData(data, labels = null) {
            if (this.chart) {
                this.chart.data.datasets[0].data = data;
                if (labels) {
                    this.chart.data.labels = labels;
                }
                this.chart.update();
                this.emit('data-updated', { data, labels });
            }
        }

        getColors(count) {
            const scheme = AlgorithmPressDataViz.colorSchemes[this.options.colorScheme] || 
                          AlgorithmPressDataViz.colorSchemes.default;
            
            const colors = [];
            for (let i = 0; i < count; i++) {
                colors.push(scheme[i % scheme.length]);
            }
            return colors;
        }

        destroy() {
            if (this.chart) {
                this.chart.destroy();
            }
            super.destroy();
        }
    }

    // Line Chart Component
    class LineChart extends BaseChart {
        createChart() {
            if (typeof Chart === 'undefined') {
                console.error('Chart.js not loaded');
                return;
            }

            const ctx = this.canvas.getContext('2d');
            
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.options.labels,
                    datasets: [{
                        label: this.options.label || 'Data',
                        data: this.options.data,
                        borderColor: this.getColors(1)[0],
                        backgroundColor: this.getColors(1)[0] + '20',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: this.options.responsive,
                    plugins: {
                        legend: {
                            display: this.options.legend
                        },
                        tooltip: {
                            enabled: this.options.tooltip
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    animation: {
                        duration: this.options.animation ? 1000 : 0
                    }
                }
            });
        }
    }

    // Bar Chart Component
    class BarChart extends BaseChart {
        createChart() {
            if (typeof Chart === 'undefined') {
                console.error('Chart.js not loaded');
                return;
            }

            const ctx = this.canvas.getContext('2d');
            const colors = this.getColors(this.options.data.length);
            
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.options.labels,
                    datasets: [{
                        label: this.options.label || 'Data',
                        data: this.options.data,
                        backgroundColor: colors.map(color => color + '80'),
                        borderColor: colors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: this.options.responsive,
                    plugins: {
                        legend: {
                            display: this.options.legend
                        },
                        tooltip: {
                            enabled: this.options.tooltip
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    animation: {
                        duration: this.options.animation ? 1000 : 0
                    }
                }
            });
        }
    }

    // Pie Chart Component
    class PieChart extends BaseChart {
        createChart() {
            if (typeof Chart === 'undefined') {
                console.error('Chart.js not loaded');
                return;
            }

            const ctx = this.canvas.getContext('2d');
            const colors = this.getColors(this.options.data.length);
            
            this.chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: this.options.labels,
                    datasets: [{
                        data: this.options.data,
                        backgroundColor: colors,
                        borderColor: colors.map(color => color + 'CC'),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: this.options.responsive,
                    plugins: {
                        legend: {
                            display: this.options.legend,
                            position: 'right'
                        },
                        tooltip: {
                            enabled: this.options.tooltip
                        }
                    },
                    animation: {
                        duration: this.options.animation ? 1000 : 0
                    }
                }
            });
        }
    }

    // Dashboard Component
    class Dashboard extends Components.registry.get('enhanced-button').__proto__.constructor {
        static get defaultOptions() {
            return {
                layout: 'grid',
                columns: 3,
                gap: 20,
                widgets: [],
                title: '',
                autoRefresh: false,
                refreshInterval: 30000
            };
        }

        createElement() {
            this.element.classList.add('dashboard-container');
            
            if (this.options.title) {
                this.createHeader();
            }
            
            this.createGrid();
            this.loadWidgets();
            
            if (this.options.autoRefresh) {
                this.setupAutoRefresh();
            }
        }

        createHeader() {
            const header = document.createElement('div');
            header.className = 'dashboard-header';
            header.innerHTML = `
                <h2>${this.options.title}</h2>
                <div class="dashboard-controls">
                    <button class="btn-icon refresh-btn" title="Refresh">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="btn-icon settings-btn" title="Settings">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            `;
            
            this.element.appendChild(header);
            
            // Bind header events
            header.querySelector('.refresh-btn').addEventListener('click', () => {
                this.refresh();
            });
        }

        createGrid() {
            this.grid = document.createElement('div');
            this.grid.className = 'dashboard-grid';
            this.grid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${this.options.columns}, 1fr);
                gap: ${this.options.gap}px;
                padding: 20px;
            `;
            
            this.element.appendChild(this.grid);
        }

        loadWidgets() {
            this.widgets = [];
            
            this.options.widgets.forEach((widgetConfig, index) => {
                this.addWidget(widgetConfig, index);
            });
        }

        addWidget(config, index) {
            const widget = document.createElement('div');
            widget.className = 'dashboard-widget';
            widget.dataset.widgetId = index;
            widget.style.cssText = `
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                padding: 20px;
                min-height: 200px;
            `;
            
            // Widget header
            const header = document.createElement('div');
            header.className = 'widget-header';
            header.innerHTML = `
                <h4>${config.title || 'Widget'}</h4>
                <div class="widget-actions">
                    <button class="btn-icon" onclick="this.closest('.dashboard-widget').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            widget.appendChild(header);
            
            // Widget content
            const content = document.createElement('div');
            content.className = 'widget-content';
            
            if (config.type === 'chart') {
                this.createChartWidget(content, config);
            } else if (config.type === 'metric') {
                this.createMetricWidget(content, config);
            } else if (config.type === 'table') {
                this.createTableWidget(content, config);
            }
            
            widget.appendChild(content);
            this.grid.appendChild(widget);
            
            this.widgets.push({ element: widget, config: config });
        }

        createChartWidget(container, config) {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 200;
            container.appendChild(canvas);
            
            // Create chart based on config
            if (typeof Chart !== 'undefined') {
                const ctx = canvas.getContext('2d');
                new Chart(ctx, {
                    type: config.chartType || 'line',
                    data: config.data || { labels: [], datasets: [] },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }
        }

        createMetricWidget(container, config) {
            container.innerHTML = `
                <div class="metric-display">
                    <div class="metric-value">${config.value || '0'}</div>
                    <div class="metric-label">${config.label || 'Metric'}</div>
                    <div class="metric-change ${config.change >= 0 ? 'positive' : 'negative'}">
                        <i class="fas fa-arrow-${config.change >= 0 ? 'up' : 'down'}"></i>
                        ${Math.abs(config.change || 0)}%
                    </div>
                </div>
            `;
        }

        createTableWidget(container, config) {
            const table = document.createElement('table');
            table.className = 'table table-striped';
            
            // Create header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            (config.columns || []).forEach(column => {
                const th = document.createElement('th');
                th.textContent = column;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Create body
            const tbody = document.createElement('tbody');
            
            (config.data || []).forEach(row => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            
            table.appendChild(tbody);
            container.appendChild(table);
        }

        setupAutoRefresh() {
            this.refreshTimer = setInterval(() => {
                this.refresh();
            }, this.options.refreshInterval);
        }

        refresh() {
            this.emit('refresh');
            
            // Refresh each widget
            this.widgets.forEach(widget => {
                if (widget.config.dataSource) {
                    this.refreshWidget(widget);
                }
            });
        }

        refreshWidget(widget) {
            // Implement widget-specific refresh logic
            if (typeof widget.config.dataSource === 'function') {
                widget.config.dataSource().then(data => {
                    // Update widget with new data
                    this.updateWidgetData(widget, data);
                });
            }
        }

        updateWidgetData(widget, data) {
            // Update widget content with new data
            widget.config.data = data;
            
            // Re-render widget content
            const content = widget.element.querySelector('.widget-content');
            content.innerHTML = '';
            
            if (widget.config.type === 'chart') {
                this.createChartWidget(content, widget.config);
            } else if (widget.config.type === 'metric') {
                this.createMetricWidget(content, widget.config);
            } else if (widget.config.type === 'table') {
                this.createTableWidget(content, widget.config);
            }
        }

        destroy() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
            super.destroy();
        }
    }

    // Metric Card Component
    class MetricCard extends Components.registry.get('enhanced-button').__proto__.constructor {
        static get defaultOptions() {
            return {
                title: '',
                value: 0,
                unit: '',
                change: 0,
                icon: 'fas fa-chart-line',
                color: '#007bff',
                format: 'number'
            };
        }

        createElement() {
            this.element.classList.add('metric-card');
            this.element.style.cssText = `
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                padding: 24px;
                text-align: center;
                border-left: 4px solid ${this.options.color};
            `;
            
            this.element.innerHTML = `
                <div class="metric-icon" style="color: ${this.options.color}; font-size: 2rem; margin-bottom: 16px;">
                    <i class="${this.options.icon}"></i>
                </div>
                <div class="metric-title" style="color: #666; font-size: 0.875rem; margin-bottom: 8px;">
                    ${this.options.title}
                </div>
                <div class="metric-value" style="font-size: 2rem; font-weight: bold; color: #333; margin-bottom: 8px;">
                    ${this.formatValue(this.options.value)}${this.options.unit}
                </div>
                <div class="metric-change ${this.options.change >= 0 ? 'positive' : 'negative'}" 
                     style="font-size: 0.875rem; color: ${this.options.change >= 0 ? '#28a745' : '#dc3545'};">
                    <i class="fas fa-arrow-${this.options.change >= 0 ? 'up' : 'down'}"></i>
                    ${Math.abs(this.options.change)}%
                </div>
            `;
        }

        formatValue(value) {
            switch (this.options.format) {
                case 'currency':
                    return new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'USD' 
                    }).format(value);
                case 'percentage':
                    return (value * 100).toFixed(1) + '%';
                case 'compact':
                    return new Intl.NumberFormat('en-US', { 
                        notation: 'compact' 
                    }).format(value);
                default:
                    return new Intl.NumberFormat('en-US').format(value);
            }
        }

        updateValue(value, change = null) {
            this.options.value = value;
            if (change !== null) {
                this.options.change = change;
            }
            
            const valueElement = this.element.querySelector('.metric-value');
            const changeElement = this.element.querySelector('.metric-change');
            
            valueElement.textContent = this.formatValue(value) + this.options.unit;
            
            if (change !== null) {
                changeElement.innerHTML = `
                    <i class="fas fa-arrow-${this.options.change >= 0 ? 'up' : 'down'}"></i>
                    ${Math.abs(this.options.change)}%
                `;
                changeElement.className = `metric-change ${this.options.change >= 0 ? 'positive' : 'negative'}`;
                changeElement.style.color = this.options.change >= 0 ? '#28a745' : '#dc3545';
            }
            
            this.emit('value-updated', { value, change });
        }
    }

    // Data Table Component
    class DataTable extends Components.registry.get('enhanced-button').__proto__.constructor {
        static get defaultOptions() {
            return {
                data: [],
                columns: [],
                sortable: true,
                filterable: true,
                paginated: true,
                pageSize: 10,
                searchable: true
            };
        }

        createElement() {
            this.element.classList.add('data-table-container');
            
            if (this.options.searchable) {
                this.createSearchBar();
            }
            
            this.createTable();
            
            if (this.options.paginated) {
                this.createPagination();
            }
            
            this.currentPage = 1;
            this.filteredData = [...this.options.data];
            this.render();
        }

        createSearchBar() {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'table-search';
            searchContainer.innerHTML = `
                <input type="text" class="form-control" placeholder="Search..." style="margin-bottom: 16px;">
            `;
            
            this.searchInput = searchContainer.querySelector('input');
            this.searchInput.addEventListener('input', (e) => {
                this.filterData(e.target.value);
            });
            
            this.element.appendChild(searchContainer);
        }

        createTable() {
            this.table = document.createElement('table');
            this.table.className = 'table table-striped table-hover';
            
            // Create header
            this.thead = document.createElement('thead');
            this.thead.className = 'table-dark';
            
            this.table.appendChild(this.thead);
            
            // Create body
            this.tbody = document.createElement('tbody');
            this.table.appendChild(this.tbody);
            
            this.element.appendChild(this.table);
        }

        createPagination() {
            this.paginationContainer = document.createElement('div');
            this.paginationContainer.className = 'table-pagination';
            this.paginationContainer.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 16px;
            `;
            
            this.element.appendChild(this.paginationContainer);
        }

        render() {
            this.renderHeader();
            this.renderBody();
            
            if (this.options.paginated) {
                this.renderPagination();
            }
        }

        renderHeader() {
            const headerRow = document.createElement('tr');
            
            this.options.columns.forEach((column, index) => {
                const th = document.createElement('th');
                th.textContent = column.title || column.key;
                th.style.cursor = this.options.sortable ? 'pointer' : 'default';
                
                if (this.options.sortable) {
                    th.addEventListener('click', () => {
                        this.sortByColumn(column.key);
                    });
                }
                
                headerRow.appendChild(th);
            });
            
            this.thead.innerHTML = '';
            this.thead.appendChild(headerRow);
        }

        renderBody() {
            const startIndex = this.options.paginated ? (this.currentPage - 1) * this.options.pageSize : 0;
            const endIndex = this.options.paginated ? startIndex + this.options.pageSize : this.filteredData.length;
            const pageData = this.filteredData.slice(startIndex, endIndex);
            
            this.tbody.innerHTML = '';
            
            pageData.forEach(row => {
                const tr = document.createElement('tr');
                
                this.options.columns.forEach(column => {
                    const td = document.createElement('td');
                    
                    if (column.render && typeof column.render === 'function') {
                        td.innerHTML = column.render(row[column.key], row);
                    } else {
                        td.textContent = row[column.key] || '';
                    }
                    
                    tr.appendChild(td);
                });
                
                this.tbody.appendChild(tr);
            });
        }

        renderPagination() {
            const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
            
            this.paginationContainer.innerHTML = `
                <div class="pagination-info">
                    Showing ${(this.currentPage - 1) * this.options.pageSize + 1} to 
                    ${Math.min(this.currentPage * this.options.pageSize, this.filteredData.length)} 
                    of ${this.filteredData.length} entries
                </div>
                <div class="pagination-controls">
                    <button class="btn btn-sm btn-outline-secondary" ${this.currentPage === 1 ? 'disabled' : ''} 
                            onclick="this.closest('.data-table-container')._algorithmPressComponent.previousPage()">
                        Previous
                    </button>
                    <span class="pagination-pages">Page ${this.currentPage} of ${totalPages}</span>
                    <button class="btn btn-sm btn-outline-secondary" ${this.currentPage === totalPages ? 'disabled' : ''} 
                            onclick="this.closest('.data-table-container')._algorithmPressComponent.nextPage()">
                        Next
                    </button>
                </div>
            `;
        }

        filterData(searchTerm) {
            if (!searchTerm) {
                this.filteredData = [...this.options.data];
            } else {
                this.filteredData = this.options.data.filter(row => {
                    return this.options.columns.some(column => {
                        const value = row[column.key];
                        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
                    });
                });
            }
            
            this.currentPage = 1;
            this.render();
        }

        sortByColumn(columnKey) {
            this.filteredData.sort((a, b) => {
                const aVal = a[columnKey];
                const bVal = b[columnKey];
                
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return aVal - bVal;
                } else {
                    return String(aVal).localeCompare(String(bVal));
                }
            });
            
            this.render();
        }

        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.render();
            }
        }

        nextPage() {
            const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.render();
            }
        }

        updateData(newData) {
            this.options.data = newData;
            this.filteredData = [...newData];
            this.currentPage = 1;
            this.render();
            this.emit('data-updated', { data: newData });
        }
    }

    // Area Chart Component (extending BaseChart)
    class AreaChart extends BaseChart {
        createChart() {
            if (typeof Chart === 'undefined') {
                console.error('Chart.js not loaded');
                return;
            }

            const ctx = this.canvas.getContext('2d');
            
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.options.labels,
                    datasets: [{
                        label: this.options.label || 'Data',
                        data: this.options.data,
                        borderColor: this.getColors(1)[0],
                        backgroundColor: this.getColors(1)[0] + '40',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: this.options.responsive,
                    plugins: {
                        legend: {
                            display: this.options.legend
                        },
                        tooltip: {
                            enabled: this.options.tooltip
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    animation: {
                        duration: this.options.animation ? 1000 : 0
                    }
                }
            });
        }
    }

    // Scatter Plot Component
    class ScatterPlot extends BaseChart {
        createChart() {
            if (typeof Chart === 'undefined') {
                console.error('Chart.js not loaded');
                return;
            }

            const ctx = this.canvas.getContext('2d');
            
            this.chart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: this.options.label || 'Data',
                        data: this.options.data,
                        backgroundColor: this.getColors(1)[0] + '80',
                        borderColor: this.getColors(1)[0],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: this.options.responsive,
                    plugins: {
                        legend: {
                            display: this.options.legend
                        },
                        tooltip: {
                            enabled: this.options.tooltip
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom'
                        },
                        y: {
                            beginAtZero: true
                        }
                    },
                    animation: {
                        duration: this.options.animation ? 1000 : 0
                    }
                }
            });
        }
    }

    // Heatmap Component
    class Heatmap extends Components.registry.get('enhanced-button').__proto__.constructor {
        static get defaultOptions() {
            return {
                data: [],
                width: 400,
                height: 300,
                colorScheme: 'default',
                showValues: true,
                cellSize: 'auto'
            };
        }

        createElement() {
            this.element.classList.add('heatmap-container');
            
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.options.width;
            this.canvas.height = this.options.height;
            
            this.element.appendChild(this.canvas);
            
            this.renderHeatmap();
        }

        renderHeatmap() {
            const ctx = this.canvas.getContext('2d');
            const data = this.options.data;
            
            if (!data || data.length === 0) return;
            
            const rows = data.length;
            const cols = data[0].length;
            
            const cellWidth = this.options.width / cols;
            const cellHeight = this.options.height / rows;
            
            // Find min and max values for color scaling
            const flatData = data.flat();
            const minValue = Math.min(...flatData);
            const maxValue = Math.max(...flatData);
            
            // Clear canvas
            ctx.clearRect(0, 0, this.options.width, this.options.height);
            
            // Draw cells
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const value = data[row][col];
                    const intensity = (value - minValue) / (maxValue - minValue);
                    
                    // Get color based on intensity
                    const color = this.getHeatmapColor(intensity);
                    
                    // Draw cell
                    ctx.fillStyle = color;
                    ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
                    
                    // Draw value text if enabled
                    if (this.options.showValues) {
                        ctx.fillStyle = intensity > 0.5 ? 'white' : 'black';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        const x = col * cellWidth + cellWidth / 2;
                        const y = row * cellHeight + cellHeight / 2;
                        
                        ctx.fillText(value.toString(), x, y);
                    }
                    
                    // Draw cell border
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
                }
            }
        }

        getHeatmapColor(intensity) {
            // Simple gradient from blue to red
            const r = Math.round(255 * intensity);
            const g = Math.round(255 * (1 - intensity) * 0.5);
            const b = Math.round(255 * (1 - intensity));
            
            return `rgb(${r}, ${g}, ${b})`;
        }

        updateData(newData) {
            this.options.data = newData;
            this.renderHeatmap();
            this.emit('data-updated', { data: newData });
        }
    }

    // Initialize data visualization system
    AlgorithmPressDataViz.initialize();

    console.log('AlgorithmPress Data Visualization Components loaded');

})(window, document);
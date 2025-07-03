/**
 * AlgorithmPress Flow Builder Core
 * Visual flow builder system with drag-and-drop node editor
 * Similar to Typebot with deep AlgorithmPress integration
 */

(function(window, document) {
    'use strict';

    window.AlgorithmPressFlowBuilder = {
        // Core system state
        state: {
            flows: new Map(),
            activeFlow: null,
            activeNode: null,
            canvas: null,
            viewport: {
                x: 0,
                y: 0,
                scale: 1,
                minScale: 0.1,
                maxScale: 2
            },
            interaction: {
                isDragging: false,
                isConnecting: false,
                isPanning: false,
                dragStart: { x: 0, y: 0 },
                connectionStart: null,
                selectedNodes: new Set()
            },
            history: {
                states: [],
                currentIndex: -1,
                maxStates: 50
            },
            clipboard: null
        },

        // Node registry for different types
        nodeTypes: new Map(),

        // Connection types
        connectionTypes: {
            success: { color: '#28a745', style: 'solid' },
            error: { color: '#dc3545', style: 'dashed' },
            condition: { color: '#ffc107', style: 'dotted' },
            data: { color: '#007bff', style: 'solid' },
            event: { color: '#6f42c1', style: 'solid' }
        },

        // Initialize flow builder
        initialize: function() {
            try {
                this.createFlowBuilderUI();
                this.setupEventListeners();
                this.registerDefaultNodeTypes();
                this.loadFlowBuilderAssets();
                
                console.log('AlgorithmPress Flow Builder initialized');
                return true;
            } catch (error) {
                console.error('Failed to initialize Flow Builder:', error);
                return false;
            }
        },

        // Create main flow builder UI
        createFlowBuilderUI: function() {
            const container = document.createElement('div');
            container.id = 'flow-builder-container';
            container.className = 'flow-builder-container';
            
            container.innerHTML = `
                <div class="flow-builder-header">
                    <div class="flow-title-section">
                        <h3 id="flow-title" contenteditable="true">Untitled Flow</h3>
                        <span class="flow-status">Draft</span>
                    </div>
                    
                    <div class="flow-actions">
                        <div class="action-group">
                            <button class="btn-icon" id="undo-action" title="Undo" disabled>
                                <i class="fas fa-undo"></i>
                            </button>
                            <button class="btn-icon" id="redo-action" title="Redo" disabled>
                                <i class="fas fa-redo"></i>
                            </button>
                        </div>
                        
                        <div class="action-group">
                            <button class="btn-icon" id="zoom-out" title="Zoom Out">
                                <i class="fas fa-search-minus"></i>
                            </button>
                            <span class="zoom-level">100%</span>
                            <button class="btn-icon" id="zoom-in" title="Zoom In">
                                <i class="fas fa-search-plus"></i>
                            </button>
                            <button class="btn-icon" id="fit-to-screen" title="Fit to Screen">
                                <i class="fas fa-expand-arrows-alt"></i>
                            </button>
                        </div>
                        
                        <div class="action-group">
                            <button class="btn-secondary" id="test-flow">
                                <i class="fas fa-play"></i> Test
                            </button>
                            <button class="btn-primary" id="publish-flow">
                                <i class="fas fa-rocket"></i> Publish
                            </button>
                        </div>
                        
                        <div class="action-group">
                            <button class="btn-icon" id="flow-settings" title="Settings">
                                <i class="fas fa-cog"></i>
                            </button>
                            <button class="btn-icon" id="export-flow" title="Export">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn-icon" id="import-flow" title="Import">
                                <i class="fas fa-upload"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flow-builder-workspace">
                    <div class="node-palette">
                        <div class="palette-header">
                            <h4>Nodes</h4>
                            <div class="palette-search">
                                <input type="text" placeholder="Search nodes..." id="node-search">
                                <i class="fas fa-search"></i>
                            </div>
                        </div>
                        
                        <div class="palette-categories">
                            <div class="category-section active" data-category="all">
                                <div class="category-header">
                                    <i class="fas fa-th"></i>
                                    <span>All Nodes</span>
                                </div>
                                <div class="category-content" id="all-nodes"></div>
                            </div>
                            
                            <div class="category-section" data-category="triggers">
                                <div class="category-header">
                                    <i class="fas fa-play-circle"></i>
                                    <span>Triggers</span>
                                </div>
                                <div class="category-content" id="trigger-nodes"></div>
                            </div>
                            
                            <div class="category-section" data-category="logic">
                                <div class="category-header">
                                    <i class="fas fa-sitemap"></i>
                                    <span>Logic</span>
                                </div>
                                <div class="category-content" id="logic-nodes"></div>
                            </div>
                            
                            <div class="category-section" data-category="actions">
                                <div class="category-header">
                                    <i class="fas fa-bolt"></i>
                                    <span>Actions</span>
                                </div>
                                <div class="category-content" id="action-nodes"></div>
                            </div>
                            
                            <div class="category-section" data-category="ui">
                                <div class="category-header">
                                    <i class="fas fa-window-maximize"></i>
                                    <span>UI Elements</span>
                                </div>
                                <div class="category-content" id="ui-nodes"></div>
                            </div>
                            
                            <div class="category-section" data-category="data">
                                <div class="category-header">
                                    <i class="fas fa-database"></i>
                                    <span>Data</span>
                                </div>
                                <div class="category-content" id="data-nodes"></div>
                            </div>
                        </div>
                    </div>

                    <div class="flow-canvas-container">
                        <div class="canvas-toolbar">
                            <div class="minimap-container">
                                <canvas id="minimap" width="200" height="120"></canvas>
                            </div>
                        </div>
                        
                        <div class="flow-canvas" id="flow-canvas">
                            <svg class="connections-layer" id="connections-svg">
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                                            refX="9" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                                    </marker>
                                </defs>
                            </svg>
                            
                            <div class="nodes-layer" id="nodes-layer"></div>
                            
                            <div class="canvas-grid"></div>
                        </div>
                    </div>

                    <div class="node-properties">
                        <div class="properties-header">
                            <h4>Properties</h4>
                            <button class="btn-icon" id="close-properties">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="properties-content">
                            <div class="no-selection">
                                <i class="fas fa-mouse-pointer"></i>
                                <p>Select a node to edit its properties</p>
                            </div>
                            
                            <div class="node-editor" id="node-editor" style="display: none;">
                                <div class="node-header-info">
                                    <div class="node-icon"></div>
                                    <div class="node-details">
                                        <h5 class="node-name"></h5>
                                        <span class="node-type"></span>
                                    </div>
                                </div>
                                
                                <div class="property-tabs">
                                    <div class="tab-nav">
                                        <button class="tab-btn active" data-tab="basic">Basic</button>
                                        <button class="tab-btn" data-tab="advanced">Advanced</button>
                                        <button class="tab-btn" data-tab="conditions">Conditions</button>
                                    </div>
                                    
                                    <div class="tab-content">
                                        <div class="tab-pane active" id="basic-props"></div>
                                        <div class="tab-pane" id="advanced-props"></div>
                                        <div class="tab-pane" id="conditions-props"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flow-status-bar">
                    <div class="status-left">
                        <span class="node-count">0 nodes</span>
                        <span class="connection-count">0 connections</span>
                    </div>
                    
                    <div class="status-center">
                        <span class="flow-validation" id="flow-validation">✓ Flow is valid</span>
                    </div>
                    
                    <div class="status-right">
                        <span class="last-saved">Never saved</span>
                        <button class="btn-link" id="auto-save-toggle">Auto-save: ON</button>
                    </div>
                </div>
            `;

            // Insert into page or return for integration
            this.flowBuilderContainer = container;
            
            // Cache important elements
            this.elements = {
                canvas: container.querySelector('#flow-canvas'),
                connectionsLayer: container.querySelector('#connections-svg'),
                nodesLayer: container.querySelector('#nodes-layer'),
                nodeEditor: container.querySelector('#node-editor'),
                palette: container.querySelector('.node-palette'),
                minimap: container.querySelector('#minimap')
            };

            return container;
        },

        // Setup all event listeners
        setupEventListeners: function() {
            // Canvas interaction events
            this.setupCanvasEvents();
            
            // Node palette events
            this.setupPaletteEvents();
            
            // Toolbar events
            this.setupToolbarEvents();
            
            // Keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Window events
            this.setupWindowEvents();
        },

        // Setup canvas interaction events
        setupCanvasEvents: function() {
            const canvas = this.elements.canvas;
            if (!canvas) return;

            // Mouse events
            canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
            canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
            canvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
            canvas.addEventListener('wheel', (e) => this.handleCanvasWheel(e));
            
            // Touch events for mobile
            canvas.addEventListener('touchstart', (e) => this.handleCanvasTouchStart(e));
            canvas.addEventListener('touchmove', (e) => this.handleCanvasTouchMove(e));
            canvas.addEventListener('touchend', (e) => this.handleCanvasTouchEnd(e));

            // Context menu
            canvas.addEventListener('contextmenu', (e) => this.handleCanvasContextMenu(e));

            // Drop events for node creation
            canvas.addEventListener('dragover', (e) => e.preventDefault());
            canvas.addEventListener('drop', (e) => this.handleCanvasDrop(e));
        },

        // Setup node palette events
        setupPaletteEvents: function() {
            const palette = this.elements.palette;
            if (!palette) return;

            // Category selection
            palette.addEventListener('click', (e) => {
                if (e.target.closest('.category-header')) {
                    this.toggleCategory(e.target.closest('.category-section'));
                }
            });

            // Node search
            const searchInput = palette.querySelector('#node-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterNodes(e.target.value);
                });
            }

            // Node drag start
            palette.addEventListener('dragstart', (e) => {
                if (e.target.closest('.node-template')) {
                    this.handleNodeDragStart(e);
                }
            });
        },

        // Setup toolbar events
        setupToolbarEvents: function() {
            const container = this.flowBuilderContainer;
            if (!container) return;

            // Zoom controls
            container.querySelector('#zoom-in')?.addEventListener('click', () => this.zoomIn());
            container.querySelector('#zoom-out')?.addEventListener('click', () => this.zoomOut());
            container.querySelector('#fit-to-screen')?.addEventListener('click', () => this.fitToScreen());

            // History controls
            container.querySelector('#undo-action')?.addEventListener('click', () => this.undo());
            container.querySelector('#redo-action')?.addEventListener('click', () => this.redo());

            // Flow actions
            container.querySelector('#test-flow')?.addEventListener('click', () => this.testFlow());
            container.querySelector('#publish-flow')?.addEventListener('click', () => this.publishFlow());
            container.querySelector('#export-flow')?.addEventListener('click', () => this.exportFlow());
            container.querySelector('#import-flow')?.addEventListener('click', () => this.importFlow());
        },

        // Setup keyboard shortcuts
        setupKeyboardShortcuts: function() {
            document.addEventListener('keydown', (e) => {
                // Only handle shortcuts when flow builder is active
                if (!this.isActive()) return;

                const isCtrl = e.ctrlKey || e.metaKey;
                
                switch (e.key) {
                    case 'z':
                        if (isCtrl && !e.shiftKey) {
                            e.preventDefault();
                            this.undo();
                        } else if (isCtrl && e.shiftKey) {
                            e.preventDefault();
                            this.redo();
                        }
                        break;
                        
                    case 'c':
                        if (isCtrl) {
                            e.preventDefault();
                            this.copySelectedNodes();
                        }
                        break;
                        
                    case 'v':
                        if (isCtrl) {
                            e.preventDefault();
                            this.pasteNodes();
                        }
                        break;
                        
                    case 'Delete':
                    case 'Backspace':
                        e.preventDefault();
                        this.deleteSelectedNodes();
                        break;
                        
                    case 'a':
                        if (isCtrl) {
                            e.preventDefault();
                            this.selectAllNodes();
                        }
                        break;
                        
                    case 'Escape':
                        this.clearSelection();
                        break;
                        
                    case '+':
                        if (isCtrl) {
                            e.preventDefault();
                            this.zoomIn();
                        }
                        break;
                        
                    case '-':
                        if (isCtrl) {
                            e.preventDefault();
                            this.zoomOut();
                        }
                        break;
                }
            });
        },

        // Setup window events
        setupWindowEvents: function() {
            window.addEventListener('resize', () => this.handleWindowResize());
            
            // Auto-save
            setInterval(() => {
                if (this.isAutoSaveEnabled()) {
                    this.autoSave();
                }
            }, 30000); // Auto-save every 30 seconds
        },

        // Create a new flow
        createFlow: function(name = 'Untitled Flow', options = {}) {
            const flowId = this.generateId();
            const flow = {
                id: flowId,
                name: name,
                description: options.description || '',
                nodes: new Map(),
                connections: new Map(),
                variables: new Map(),
                settings: {
                    autoSave: true,
                    gridSize: 20,
                    snapToGrid: true,
                    showGrid: true,
                    theme: 'default',
                    ...options.settings
                },
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    version: '1.0.0',
                    author: options.author || 'Anonymous'
                }
            };

            this.state.flows.set(flowId, flow);
            this.setActiveFlow(flowId);
            
            // Add start node by default
            this.addNode('start', { x: 100, y: 100 });
            
            this.saveState();
            return flow;
        },

        // Set active flow
        setActiveFlow: function(flowId) {
            const flow = this.state.flows.get(flowId);
            if (!flow) {
                console.error('Flow not found:', flowId);
                return false;
            }

            this.state.activeFlow = flowId;
            this.renderFlow(flow);
            this.updateUI();
            return true;
        },

        // Add a node to the active flow
        addNode: function(nodeType, position, properties = {}) {
            const flow = this.getActiveFlow();
            if (!flow) {
                console.error('No active flow');
                return null;
            }

            const nodeTypeDefinition = this.nodeTypes.get(nodeType);
            if (!nodeTypeDefinition) {
                console.error('Unknown node type:', nodeType);
                return null;
            }

            const nodeId = this.generateId();
            const node = {
                id: nodeId,
                type: nodeType,
                position: { ...position },
                properties: { ...nodeTypeDefinition.defaultProperties, ...properties },
                inputs: new Map(),
                outputs: new Map(),
                metadata: {
                    created: new Date(),
                    modified: new Date()
                }
            };

            // Initialize inputs and outputs based on node type
            nodeTypeDefinition.inputs.forEach(input => {
                node.inputs.set(input.id, {
                    id: input.id,
                    name: input.name,
                    type: input.type,
                    connections: []
                });
            });

            nodeTypeDefinition.outputs.forEach(output => {
                node.outputs.set(output.id, {
                    id: output.id,
                    name: output.name,
                    type: output.type,
                    connections: []
                });
            });

            flow.nodes.set(nodeId, node);
            flow.metadata.modified = new Date();
            
            this.renderNode(node);
            this.saveState();
            
            return node;
        },

        // Render the entire flow
        renderFlow: function(flow) {
            this.clearCanvas();
            
            // Render all nodes
            flow.nodes.forEach(node => {
                this.renderNode(node);
            });
            
            // Render all connections
            flow.connections.forEach(connection => {
                this.renderConnection(connection);
            });
            
            this.updateStatusBar();
        },

        // Render a single node
        renderNode: function(node) {
            const nodeElement = this.createNodeElement(node);
            this.elements.nodesLayer.appendChild(nodeElement);
            
            // Position the node
            this.updateNodePosition(node);
            
            return nodeElement;
        },

        // Create DOM element for a node
        createNodeElement: function(node) {
            const nodeType = this.nodeTypes.get(node.type);
            if (!nodeType) return null;

            const element = document.createElement('div');
            element.className = `flow-node flow-node-${node.type}`;
            element.dataset.nodeId = node.id;
            
            element.innerHTML = `
                <div class="node-header" style="background-color: ${nodeType.color}">
                    <div class="node-icon">
                        <i class="${nodeType.icon}"></i>
                    </div>
                    <div class="node-title">${node.properties.title || nodeType.name}</div>
                    <div class="node-actions">
                        <button class="node-action-btn" data-action="edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="node-action-btn" data-action="delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="node-body">
                    <div class="node-inputs">
                        ${this.renderNodeInputs(node)}
                    </div>
                    
                    <div class="node-content">
                        ${this.renderNodeContent(node)}
                    </div>
                    
                    <div class="node-outputs">
                        ${this.renderNodeOutputs(node)}
                    </div>
                </div>
            `;

            // Add event listeners
            this.setupNodeEvents(element, node);
            
            return element;
        },

        // Render node inputs
        renderNodeInputs: function(node) {
            const inputs = Array.from(node.inputs.values());
            return inputs.map(input => `
                <div class="node-port node-input" data-port-id="${input.id}" data-port-type="input">
                    <div class="port-connector" title="${input.name}"></div>
                    <span class="port-label">${input.name}</span>
                </div>
            `).join('');
        },

        // Render node outputs
        renderNodeOutputs: function(node) {
            const outputs = Array.from(node.outputs.values());
            return outputs.map(output => `
                <div class="node-port node-output" data-port-id="${output.id}" data-port-type="output">
                    <span class="port-label">${output.name}</span>
                    <div class="port-connector" title="${output.name}"></div>
                </div>
            `).join('');
        },

        // Render node content based on type
        renderNodeContent: function(node) {
            const nodeType = this.nodeTypes.get(node.type);
            if (nodeType && nodeType.renderContent) {
                return nodeType.renderContent(node);
            }
            
            return `<div class="node-description">${nodeType?.description || ''}</div>`;
        },

        // Utility methods
        generateId: function() {
            return 'node_' + Math.random().toString(36).substr(2, 9);
        },

        getActiveFlow: function() {
            return this.state.flows.get(this.state.activeFlow);
        },

        isActive: function() {
            return document.querySelector('.flow-builder-container') && 
                   this.flowBuilderContainer?.style.display !== 'none';
        },

        // Save current state for undo/redo
        saveState: function() {
            const flow = this.getActiveFlow();
            if (!flow) return;

            // Clone the current state
            const state = JSON.parse(JSON.stringify({
                nodes: Array.from(flow.nodes.entries()),
                connections: Array.from(flow.connections.entries()),
                variables: Array.from(flow.variables.entries())
            }));

            // Remove future states if we're in the middle of history
            this.state.history.states = this.state.history.states.slice(0, this.state.history.currentIndex + 1);
            
            // Add new state
            this.state.history.states.push(state);
            this.state.history.currentIndex++;
            
            // Limit history size
            if (this.state.history.states.length > this.state.history.maxStates) {
                this.state.history.states.shift();
                this.state.history.currentIndex--;
            }
            
            this.updateHistoryButtons();
        },

        // Clear the canvas
        clearCanvas: function() {
            if (this.elements.nodesLayer) {
                this.elements.nodesLayer.innerHTML = '';
            }
            if (this.elements.connectionsLayer) {
                // Keep defs, clear paths
                const paths = this.elements.connectionsLayer.querySelectorAll('path');
                paths.forEach(path => path.remove());
            }
        },

        // Update UI elements
        updateUI: function() {
            this.updateStatusBar();
            this.updateHistoryButtons();
            this.updateZoomLevel();
        },

        updateStatusBar: function() {
            const flow = this.getActiveFlow();
            if (!flow) return;

            const nodeCount = flow.nodes.size;
            const connectionCount = flow.connections.size;
            
            const nodeCountElement = this.flowBuilderContainer?.querySelector('.node-count');
            const connectionCountElement = this.flowBuilderContainer?.querySelector('.connection-count');
            
            if (nodeCountElement) nodeCountElement.textContent = `${nodeCount} nodes`;
            if (connectionCountElement) connectionCountElement.textContent = `${connectionCount} connections`;
        },

        updateHistoryButtons: function() {
            const undoBtn = this.flowBuilderContainer?.querySelector('#undo-action');
            const redoBtn = this.flowBuilderContainer?.querySelector('#redo-action');
            
            if (undoBtn) undoBtn.disabled = this.state.history.currentIndex < 0;
            if (redoBtn) redoBtn.disabled = this.state.history.currentIndex >= this.state.history.states.length - 1;
        },

        updateZoomLevel: function() {
            const zoomElement = this.flowBuilderContainer?.querySelector('.zoom-level');
            if (zoomElement) {
                zoomElement.textContent = Math.round(this.state.viewport.scale * 100) + '%';
            }
        },

        // Placeholder methods for complex operations
        handleCanvasMouseDown: function(e) { /* Implementation */ },
        handleCanvasMouseMove: function(e) { /* Implementation */ },
        handleCanvasMouseUp: function(e) { /* Implementation */ },
        handleCanvasWheel: function(e) { /* Implementation */ },
        zoomIn: function() { /* Implementation */ },
        zoomOut: function() { /* Implementation */ },
        fitToScreen: function() { /* Implementation */ },
        undo: function() { /* Implementation */ },
        redo: function() { /* Implementation */ },
        exportFlow: function() { /* Implementation */ },
        importFlow: function() { /* Implementation */ }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AlgorithmPressFlowBuilder.initialize();
        });
    } else {
        window.AlgorithmPressFlowBuilder.initialize();
    }

})(window, document);
/**
 * AlgorithmPress Flow Export/Import System
 * Comprehensive JSON export and import with validation and versioning
 */

(function(window, document) {
    'use strict';

    // Ensure flow builder core is available
    if (!window.AlgorithmPressFlowBuilder) {
        console.error('AlgorithmPress Flow Builder Core required');
        return;
    }

    const FlowBuilder = window.AlgorithmPressFlowBuilder;

    // Flow Export/Import System
    FlowBuilder.ExportImport = {
        // Current format version
        CURRENT_VERSION: '1.0.0',
        
        // Supported versions for import
        SUPPORTED_VERSIONS: ['1.0.0'],

        // Export a flow to JSON
        exportFlow: function(flowId, options = {}) {
            try {
                const flow = FlowBuilder.state.flows.get(flowId);
                if (!flow) {
                    throw new Error(`Flow with ID '${flowId}' not found`);
                }

                const exportData = this.serializeFlow(flow, options);
                
                if (options.download !== false) {
                    this.downloadJSON(exportData, `${flow.name.replace(/[^a-z0-9]/gi, '_')}.json`);
                }

                return exportData;
            } catch (error) {
                console.error('Export failed:', error);
                throw error;
            }
        },

        // Import a flow from JSON
        importFlow: function(jsonData, options = {}) {
            try {
                // Parse JSON if it's a string
                const flowData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
                
                // Validate the flow data
                const validation = this.validateFlowData(flowData);
                if (!validation.valid) {
                    throw new Error(`Invalid flow data: ${validation.errors.join(', ')}`);
                }

                // Convert to internal format
                const flow = this.deserializeFlow(flowData, options);
                
                // Generate new ID if needed
                if (options.generateNewId !== false) {
                    flow.id = FlowBuilder.generateId();
                }

                // Add to flows collection
                FlowBuilder.state.flows.set(flow.id, flow);
                
                // Set as active if requested
                if (options.setActive !== false) {
                    FlowBuilder.setActiveFlow(flow.id);
                }

                return flow;
            } catch (error) {
                console.error('Import failed:', error);
                throw error;
            }
        },

        // Serialize flow to exportable format
        serializeFlow: function(flow, options = {}) {
            const exportData = {
                // Metadata
                formatVersion: this.CURRENT_VERSION,
                exportedAt: new Date().toISOString(),
                exportedBy: options.author || 'AlgorithmPress',
                
                // Flow data
                flow: {
                    id: flow.id,
                    name: flow.name,
                    description: flow.description,
                    version: flow.metadata.version,
                    created: flow.metadata.created,
                    modified: flow.metadata.modified,
                    author: flow.metadata.author,
                    
                    // Settings
                    settings: { ...flow.settings },
                    
                    // Nodes
                    nodes: this.serializeNodes(flow.nodes),
                    
                    // Connections
                    connections: this.serializeConnections(flow.connections),
                    
                    // Variables
                    variables: this.serializeVariables(flow.variables)
                }
            };

            // Add validation info
            exportData.validation = this.generateValidationHash(exportData.flow);
            
            return exportData;
        },

        // Deserialize flow from import format
        deserializeFlow: function(exportData, options = {}) {
            const flowData = exportData.flow;
            
            // Create flow object
            const flow = {
                id: flowData.id,
                name: flowData.name,
                description: flowData.description || '',
                nodes: new Map(),
                connections: new Map(),
                variables: new Map(),
                settings: {
                    autoSave: true,
                    gridSize: 20,
                    snapToGrid: true,
                    showGrid: true,
                    theme: 'default',
                    ...flowData.settings
                },
                metadata: {
                    created: new Date(flowData.created),
                    modified: new Date(flowData.modified),
                    version: flowData.version || '1.0.0',
                    author: flowData.author || 'Unknown'
                }
            };

            // Deserialize nodes
            this.deserializeNodes(flowData.nodes, flow.nodes);
            
            // Deserialize connections
            this.deserializeConnections(flowData.connections, flow.connections);
            
            // Deserialize variables
            this.deserializeVariables(flowData.variables, flow.variables);

            return flow;
        },

        // Serialize nodes
        serializeNodes: function(nodesMap) {
            const nodes = [];
            
            nodesMap.forEach((node, nodeId) => {
                const serializedNode = {
                    id: node.id,
                    type: node.type,
                    position: { ...node.position },
                    properties: { ...node.properties },
                    metadata: {
                        created: node.metadata.created,
                        modified: node.metadata.modified
                    },
                    
                    // Serialize inputs and outputs
                    inputs: Array.from(node.inputs.entries()).map(([id, input]) => ({
                        id: input.id,
                        name: input.name,
                        type: input.type,
                        // Don't serialize connections here - handled separately
                    })),
                    
                    outputs: Array.from(node.outputs.entries()).map(([id, output]) => ({
                        id: output.id,
                        name: output.name,
                        type: output.type,
                        // Don't serialize connections here - handled separately
                    }))
                };
                
                nodes.push(serializedNode);
            });
            
            return nodes;
        },

        // Deserialize nodes
        deserializeNodes: function(nodesArray, nodesMap) {
            nodesArray.forEach(nodeData => {
                const node = {
                    id: nodeData.id,
                    type: nodeData.type,
                    position: { ...nodeData.position },
                    properties: { ...nodeData.properties },
                    inputs: new Map(),
                    outputs: new Map(),
                    metadata: {
                        created: new Date(nodeData.metadata.created),
                        modified: new Date(nodeData.metadata.modified)
                    }
                };

                // Reconstruct inputs
                nodeData.inputs.forEach(input => {
                    node.inputs.set(input.id, {
                        id: input.id,
                        name: input.name,
                        type: input.type,
                        connections: []
                    });
                });

                // Reconstruct outputs
                nodeData.outputs.forEach(output => {
                    node.outputs.set(output.id, {
                        id: output.id,
                        name: output.name,
                        type: output.type,
                        connections: []
                    });
                });

                nodesMap.set(node.id, node);
            });
        },

        // Serialize connections
        serializeConnections: function(connectionsMap) {
            const connections = [];
            
            connectionsMap.forEach((connection, connectionId) => {
                connections.push({
                    id: connection.id,
                    sourceNodeId: connection.sourceNodeId,
                    sourcePortId: connection.sourcePortId,
                    targetNodeId: connection.targetNodeId,
                    targetPortId: connection.targetPortId,
                    type: connection.type || 'flow',
                    properties: connection.properties || {},
                    metadata: {
                        created: connection.metadata?.created || new Date(),
                        modified: connection.metadata?.modified || new Date()
                    }
                });
            });
            
            return connections;
        },

        // Deserialize connections
        deserializeConnections: function(connectionsArray, connectionsMap) {
            connectionsArray.forEach(connectionData => {
                const connection = {
                    id: connectionData.id,
                    sourceNodeId: connectionData.sourceNodeId,
                    sourcePortId: connectionData.sourcePortId,
                    targetNodeId: connectionData.targetNodeId,
                    targetPortId: connectionData.targetPortId,
                    type: connectionData.type || 'flow',
                    properties: connectionData.properties || {},
                    metadata: {
                        created: new Date(connectionData.metadata.created),
                        modified: new Date(connectionData.metadata.modified)
                    }
                };
                
                connectionsMap.set(connection.id, connection);
            });
        },

        // Serialize variables
        serializeVariables: function(variablesMap) {
            const variables = {};
            
            variablesMap.forEach((value, key) => {
                variables[key] = {
                    value: value.value,
                    type: value.type || 'any',
                    scope: value.scope || 'flow',
                    metadata: value.metadata || {}
                };
            });
            
            return variables;
        },

        // Deserialize variables
        deserializeVariables: function(variablesObject, variablesMap) {
            Object.entries(variablesObject).forEach(([key, variableData]) => {
                variablesMap.set(key, {
                    value: variableData.value,
                    type: variableData.type || 'any',
                    scope: variableData.scope || 'flow',
                    metadata: variableData.metadata || {}
                });
            });
        },

        // Validate flow data structure
        validateFlowData: function(flowData) {
            const errors = [];
            
            try {
                // Check top-level structure
                if (!flowData.formatVersion) {
                    errors.push('Missing format version');
                } else if (!this.SUPPORTED_VERSIONS.includes(flowData.formatVersion)) {
                    errors.push(`Unsupported format version: ${flowData.formatVersion}`);
                }

                if (!flowData.flow) {
                    errors.push('Missing flow data');
                    return { valid: false, errors };
                }

                const flow = flowData.flow;

                // Validate required flow fields
                if (!flow.id) errors.push('Missing flow ID');
                if (!flow.name) errors.push('Missing flow name');
                if (!Array.isArray(flow.nodes)) errors.push('Invalid nodes data');
                if (!Array.isArray(flow.connections)) errors.push('Invalid connections data');

                // Validate nodes
                const nodeValidation = this.validateNodes(flow.nodes);
                errors.push(...nodeValidation.errors);

                // Validate connections
                const connectionValidation = this.validateConnections(flow.connections, flow.nodes);
                errors.push(...connectionValidation.errors);

                // Validate variables
                if (flow.variables && typeof flow.variables !== 'object') {
                    errors.push('Invalid variables data');
                }

            } catch (error) {
                errors.push(`Validation error: ${error.message}`);
            }

            return {
                valid: errors.length === 0,
                errors: errors
            };
        },

        // Validate nodes structure
        validateNodes: function(nodes) {
            const errors = [];
            const nodeIds = new Set();

            nodes.forEach((node, index) => {
                if (!node.id) {
                    errors.push(`Node ${index}: Missing ID`);
                } else if (nodeIds.has(node.id)) {
                    errors.push(`Node ${index}: Duplicate ID '${node.id}'`);
                } else {
                    nodeIds.add(node.id);
                }

                if (!node.type) {
                    errors.push(`Node ${node.id || index}: Missing type`);
                } else if (!FlowBuilder.nodeTypes.has(node.type)) {
                    errors.push(`Node ${node.id || index}: Unknown type '${node.type}'`);
                }

                if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
                    errors.push(`Node ${node.id || index}: Invalid position`);
                }

                if (!Array.isArray(node.inputs)) {
                    errors.push(`Node ${node.id || index}: Invalid inputs`);
                }

                if (!Array.isArray(node.outputs)) {
                    errors.push(`Node ${node.id || index}: Invalid outputs`);
                }
            });

            return {
                valid: errors.length === 0,
                errors: errors,
                nodeIds: nodeIds
            };
        },

        // Validate connections structure
        validateConnections: function(connections, nodes) {
            const errors = [];
            const nodeIds = new Set(nodes.map(node => node.id));

            connections.forEach((connection, index) => {
                if (!connection.id) {
                    errors.push(`Connection ${index}: Missing ID`);
                }

                if (!connection.sourceNodeId) {
                    errors.push(`Connection ${index}: Missing source node ID`);
                } else if (!nodeIds.has(connection.sourceNodeId)) {
                    errors.push(`Connection ${index}: Invalid source node ID '${connection.sourceNodeId}'`);
                }

                if (!connection.targetNodeId) {
                    errors.push(`Connection ${index}: Missing target node ID`);
                } else if (!nodeIds.has(connection.targetNodeId)) {
                    errors.push(`Connection ${index}: Invalid target node ID '${connection.targetNodeId}'`);
                }

                if (!connection.sourcePortId) {
                    errors.push(`Connection ${index}: Missing source port ID`);
                }

                if (!connection.targetPortId) {
                    errors.push(`Connection ${index}: Missing target port ID`);
                }
            });

            return {
                valid: errors.length === 0,
                errors: errors
            };
        },

        // Generate validation hash for integrity checking
        generateValidationHash: function(flowData) {
            const hashData = {
                nodeCount: flowData.nodes.length,
                connectionCount: flowData.connections.length,
                nodeTypes: flowData.nodes.map(node => node.type).sort(),
                checksum: this.calculateChecksum(JSON.stringify(flowData))
            };
            
            return hashData;
        },

        // Calculate simple checksum
        calculateChecksum: function(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash;
        },

        // Download JSON file
        downloadJSON: function(data, filename) {
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
        },

        // Load JSON from file
        loadJSONFile: function() {
            return new Promise((resolve, reject) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                
                input.onchange = (event) => {
                    const file = event.target.files[0];
                    if (!file) {
                        reject(new Error('No file selected'));
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const jsonData = JSON.parse(e.target.result);
                            resolve(jsonData);
                        } catch (error) {
                            reject(new Error('Invalid JSON file'));
                        }
                    };
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsText(file);
                };
                
                input.click();
            });
        },

        // Export multiple flows as a package
        exportPackage: function(flowIds, packageName = 'flows-package') {
            const packageData = {
                formatVersion: this.CURRENT_VERSION,
                packageName: packageName,
                exportedAt: new Date().toISOString(),
                flows: []
            };

            flowIds.forEach(flowId => {
                const flow = FlowBuilder.state.flows.get(flowId);
                if (flow) {
                    const exportData = this.serializeFlow(flow, { download: false });
                    packageData.flows.push(exportData.flow);
                }
            });

            this.downloadJSON(packageData, `${packageName}.json`);
            return packageData;
        },

        // Import package with multiple flows
        importPackage: function(packageData, options = {}) {
            try {
                if (!packageData.flows || !Array.isArray(packageData.flows)) {
                    throw new Error('Invalid package format');
                }

                const importedFlows = [];
                const errors = [];

                packageData.flows.forEach((flowData, index) => {
                    try {
                        const wrappedFlowData = {
                            formatVersion: packageData.formatVersion,
                            flow: flowData
                        };
                        
                        const flow = this.importFlow(wrappedFlowData, {
                            ...options,
                            setActive: false
                        });
                        
                        importedFlows.push(flow);
                    } catch (error) {
                        errors.push(`Flow ${index + 1}: ${error.message}`);
                    }
                });

                return {
                    success: true,
                    importedFlows: importedFlows,
                    errors: errors
                };
            } catch (error) {
                return {
                    success: false,
                    importedFlows: [],
                    errors: [error.message]
                };
            }
        },

        // Export flow to clipboard
        exportToClipboard: async function(flowId) {
            try {
                const exportData = this.exportFlow(flowId, { download: false });
                const jsonString = JSON.stringify(exportData, null, 2);
                
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(jsonString);
                    return true;
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = jsonString;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return true;
                }
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                return false;
            }
        },

        // Import flow from clipboard
        importFromClipboard: async function(options = {}) {
            try {
                let clipboardText;
                
                if (navigator.clipboard) {
                    clipboardText = await navigator.clipboard.readText();
                } else {
                    throw new Error('Clipboard API not available');
                }

                const flowData = JSON.parse(clipboardText);
                return this.importFlow(flowData, options);
            } catch (error) {
                console.error('Failed to import from clipboard:', error);
                throw error;
            }
        }
    };

    // Add export/import methods to main FlowBuilder
    FlowBuilder.exportFlow = function(flowId, options) {
        return this.ExportImport.exportFlow(flowId, options);
    };

    FlowBuilder.importFlow = function(jsonData, options) {
        return this.ExportImport.importFlow(jsonData, options);
    };

    FlowBuilder.exportPackage = function(flowIds, packageName) {
        return this.ExportImport.exportPackage(flowIds, packageName);
    };

    FlowBuilder.importPackage = function(packageData, options) {
        return this.ExportImport.importPackage(packageData, options);
    };

    FlowBuilder.exportToClipboard = function(flowId) {
        return this.ExportImport.exportToClipboard(flowId);
    };

    FlowBuilder.importFromClipboard = function(options) {
        return this.ExportImport.importFromClipboard(options);
    };

    // Enhanced export/import UI integration
    FlowBuilder.showExportDialog = function(flowId) {
        const modal = this.createExportDialog(flowId);
        document.body.appendChild(modal);
        
        // Show modal (Bootstrap or custom)
        if (window.bootstrap && window.bootstrap.Modal) {
            new window.bootstrap.Modal(modal).show();
        } else {
            modal.style.display = 'block';
        }
    };

    FlowBuilder.showImportDialog = function() {
        const modal = this.createImportDialog();
        document.body.appendChild(modal);
        
        // Show modal (Bootstrap or custom)
        if (window.bootstrap && window.bootstrap.Modal) {
            new window.bootstrap.Modal(modal).show();
        } else {
            modal.style.display = 'block';
        }
    };

    FlowBuilder.createExportDialog = function(flowId) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Export Flow</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="export-options">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="exportType" value="file" checked>
                                <label class="form-check-label">Download as file</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="exportType" value="clipboard">
                                <label class="form-check-label">Copy to clipboard</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="FlowBuilder.performExport('${flowId}')">Export</button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    };

    FlowBuilder.createImportDialog = function() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Import Flow</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="import-options">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="importType" value="file" checked>
                                <label class="form-check-label">Upload file</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="importType" value="clipboard">
                                <label class="form-check-label">Paste from clipboard</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="FlowBuilder.performImport()">Import</button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    };

    console.log('AlgorithmPress Flow Export/Import System loaded');

})(window, document);
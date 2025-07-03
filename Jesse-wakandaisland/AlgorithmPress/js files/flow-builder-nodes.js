/**
 * AlgorithmPress Flow Builder Node Types
 * Comprehensive collection of node types for visual flow building
 */

(function(window, document) {
    'use strict';

    // Ensure flow builder core is available
    if (!window.AlgorithmPressFlowBuilder) {
        console.error('AlgorithmPress Flow Builder Core required');
        return;
    }

    const FlowBuilder = window.AlgorithmPressFlowBuilder;

    // Node type registration helper
    function registerNodeType(type, definition) {
        FlowBuilder.nodeTypes.set(type, {
            ...definition,
            type: type,
            category: definition.category || 'other',
            version: definition.version || '1.0.0'
        });
    }

    // ================================
    // TRIGGER NODES
    // ================================

    registerNodeType('start', {
        name: 'Start',
        description: 'Entry point for the flow',
        category: 'triggers',
        icon: 'fas fa-play',
        color: '#28a745',
        inputs: [],
        outputs: [
            { id: 'success', name: 'Success', type: 'flow' }
        ],
        defaultProperties: {
            title: 'Start',
            description: 'Flow starts here'
        },
        renderContent: function(node) {
            return `<div class="node-start-content">
                <i class="fas fa-flag-checkered"></i>
                <span>Flow Entry Point</span>
            </div>`;
        },
        validate: function(node) {
            return { valid: true, errors: [] };
        }
    });

    registerNodeType('webhook', {
        name: 'Webhook',
        description: 'Triggered by HTTP requests',
        category: 'triggers',
        icon: 'fas fa-globe',
        color: '#007bff',
        inputs: [],
        outputs: [
            { id: 'success', name: 'Success', type: 'flow' },
            { id: 'data', name: 'Data', type: 'data' }
        ],
        defaultProperties: {
            title: 'Webhook',
            method: 'POST',
            path: '/webhook',
            authentication: 'none',
            responseFormat: 'json'
        },
        renderContent: function(node) {
            return `<div class="node-webhook-content">
                <div class="webhook-method">${node.properties.method}</div>
                <div class="webhook-path">${node.properties.path}</div>
            </div>`;
        },
        propertyFields: [
            { name: 'method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
            { name: 'path', type: 'text', placeholder: '/webhook' },
            { name: 'authentication', type: 'select', options: ['none', 'bearer', 'basic'] }
        ]
    });

    registerNodeType('schedule', {
        name: 'Schedule',
        description: 'Triggered at specific times',
        category: 'triggers',
        icon: 'fas fa-clock',
        color: '#ffc107',
        inputs: [],
        outputs: [
            { id: 'trigger', name: 'Trigger', type: 'flow' }
        ],
        defaultProperties: {
            title: 'Schedule',
            type: 'cron',
            expression: '0 9 * * *',
            timezone: 'UTC'
        },
        renderContent: function(node) {
            return `<div class="node-schedule-content">
                <div class="schedule-type">${node.properties.type.toUpperCase()}</div>
                <div class="schedule-expression">${node.properties.expression}</div>
            </div>`;
        }
    });

    registerNodeType('form-submit', {
        name: 'Form Submit',
        description: 'Triggered when a form is submitted',
        category: 'triggers',
        icon: 'fas fa-wpforms',
        color: '#17a2b8',
        inputs: [],
        outputs: [
            { id: 'success', name: 'Success', type: 'flow' },
            { id: 'data', name: 'Form Data', type: 'data' }
        ],
        defaultProperties: {
            title: 'Form Submit',
            formId: '',
            validation: true
        }
    });

    // ================================
    // LOGIC NODES
    // ================================

    registerNodeType('condition', {
        name: 'Condition',
        description: 'Branch flow based on conditions',
        category: 'logic',
        icon: 'fas fa-code-branch',
        color: '#6f42c1',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'true', name: 'True', type: 'flow' },
            { id: 'false', name: 'False', type: 'flow' }
        ],
        defaultProperties: {
            title: 'Condition',
            operator: 'equals',
            leftValue: '',
            rightValue: '',
            dataType: 'text'
        },
        renderContent: function(node) {
            return `<div class="node-condition-content">
                <div class="condition-expression">
                    ${node.properties.leftValue} ${node.properties.operator} ${node.properties.rightValue}
                </div>
            </div>`;
        },
        propertyFields: [
            { name: 'leftValue', type: 'text', label: 'Left Value' },
            { name: 'operator', type: 'select', options: ['equals', 'not-equals', 'greater', 'less', 'contains'] },
            { name: 'rightValue', type: 'text', label: 'Right Value' },
            { name: 'dataType', type: 'select', options: ['text', 'number', 'boolean', 'date'] }
        ]
    });

    registerNodeType('switch', {
        name: 'Switch',
        description: 'Multiple condition branching',
        category: 'logic',
        icon: 'fas fa-random',
        color: '#6f42c1',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'case1', name: 'Case 1', type: 'flow' },
            { id: 'case2', name: 'Case 2', type: 'flow' },
            { id: 'default', name: 'Default', type: 'flow' }
        ],
        defaultProperties: {
            title: 'Switch',
            variable: '',
            cases: [
                { value: '', output: 'case1' },
                { value: '', output: 'case2' }
            ]
        }
    });

    registerNodeType('loop', {
        name: 'Loop',
        description: 'Repeat actions for each item',
        category: 'logic',
        icon: 'fas fa-sync',
        color: '#6c757d',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' },
            { id: 'data', name: 'Data', type: 'data' }
        ],
        outputs: [
            { id: 'each', name: 'For Each', type: 'flow' },
            { id: 'complete', name: 'Complete', type: 'flow' }
        ],
        defaultProperties: {
            title: 'Loop',
            type: 'array',
            variable: 'item'
        }
    });

    registerNodeType('delay', {
        name: 'Delay',
        description: 'Wait for specified time',
        category: 'logic',
        icon: 'fas fa-hourglass-half',
        color: '#fd7e14',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'output', name: 'Output', type: 'flow' }
        ],
        defaultProperties: {
            title: 'Delay',
            duration: 1000,
            unit: 'ms'
        },
        renderContent: function(node) {
            return `<div class="node-delay-content">
                <div class="delay-duration">${node.properties.duration} ${node.properties.unit}</div>
            </div>`;
        }
    });

    // ================================
    // ACTION NODES
    // ================================

    registerNodeType('http-request', {
        name: 'HTTP Request',
        description: 'Make HTTP API calls',
        category: 'actions',
        icon: 'fas fa-exchange-alt',
        color: '#dc3545',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'success', name: 'Success', type: 'flow' },
            { id: 'error', name: 'Error', type: 'flow' },
            { id: 'response', name: 'Response', type: 'data' }
        ],
        defaultProperties: {
            title: 'HTTP Request',
            method: 'GET',
            url: '',
            headers: {},
            body: '',
            timeout: 5000
        },
        renderContent: function(node) {
            return `<div class="node-http-content">
                <div class="http-method">${node.properties.method}</div>
                <div class="http-url">${node.properties.url || 'No URL set'}</div>
            </div>`;
        },
        propertyFields: [
            { name: 'method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
            { name: 'url', type: 'text', placeholder: 'https://api.example.com/endpoint' },
            { name: 'headers', type: 'json', label: 'Headers' },
            { name: 'body', type: 'textarea', label: 'Request Body' },
            { name: 'timeout', type: 'number', label: 'Timeout (ms)' }
        ]
    });

    registerNodeType('send-email', {
        name: 'Send Email',
        description: 'Send email notifications',
        category: 'actions',
        icon: 'fas fa-envelope',
        color: '#28a745',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'success', name: 'Success', type: 'flow' },
            { id: 'error', name: 'Error', type: 'flow' }
        ],
        defaultProperties: {
            title: 'Send Email',
            to: '',
            subject: '',
            body: '',
            isHtml: false
        },
        renderContent: function(node) {
            return `<div class="node-email-content">
                <div class="email-to">To: ${node.properties.to || 'Not set'}</div>
                <div class="email-subject">${node.properties.subject || 'No subject'}</div>
            </div>`;
        }
    });

    registerNodeType('run-code', {
        name: 'Run Code',
        description: 'Execute custom JavaScript code',
        category: 'actions',
        icon: 'fas fa-code',
        color: '#6f42c1',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'success', name: 'Success', type: 'flow' },
            { id: 'error', name: 'Error', type: 'flow' },
            { id: 'result', name: 'Result', type: 'data' }
        ],
        defaultProperties: {
            title: 'Run Code',
            code: '// Your code here\nreturn "Hello World";',
            language: 'javascript'
        },
        renderContent: function(node) {
            const codePreview = node.properties.code.substring(0, 50) + '...';
            return `<div class="node-code-content">
                <div class="code-language">${node.properties.language}</div>
                <div class="code-preview">${codePreview}</div>
            </div>`;
        }
    });

    registerNodeType('storage-save', {
        name: 'Save to Storage',
        description: 'Save data to storage provider',
        category: 'actions',
        icon: 'fas fa-save',
        color: '#17a2b8',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' },
            { id: 'data', name: 'Data', type: 'data' }
        ],
        outputs: [
            { id: 'success', name: 'Success', type: 'flow' },
            { id: 'error', name: 'Error', type: 'flow' },
            { id: 'result', name: 'Result', type: 'data' }
        ],
        defaultProperties: {
            title: 'Save to Storage',
            provider: '',
            path: '',
            format: 'json'
        },
        execute: async function(node, inputData) {
            if (window.AlgorithmPressStorage && node.properties.provider) {
                try {
                    const result = await window.AlgorithmPressStorage.upload(
                        node.properties.provider,
                        inputData,
                        node.properties.path
                    );
                    return { success: true, result };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
            return { success: false, error: 'Storage system not available' };
        }
    });

    // ================================
    // UI ELEMENT NODES
    // ================================

    registerNodeType('text-input', {
        name: 'Text Input',
        description: 'Collect text input from users',
        category: 'ui',
        icon: 'fas fa-keyboard',
        color: '#007bff',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'submitted', name: 'Submitted', type: 'flow' },
            { id: 'value', name: 'Value', type: 'data' }
        ],
        defaultProperties: {
            title: 'Text Input',
            placeholder: 'Enter text here...',
            required: false,
            multiline: false,
            validation: ''
        },
        renderContent: function(node) {
            return `<div class="node-input-content">
                <div class="input-type">${node.properties.multiline ? 'Textarea' : 'Text'}</div>
                <div class="input-placeholder">${node.properties.placeholder}</div>
            </div>`;
        }
    });

    registerNodeType('button', {
        name: 'Button',
        description: 'Interactive button element',
        category: 'ui',
        icon: 'fas fa-hand-pointer',
        color: '#28a745',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'clicked', name: 'Clicked', type: 'flow' }
        ],
        defaultProperties: {
            title: 'Button',
            text: 'Click me',
            style: 'primary',
            size: 'medium'
        },
        renderContent: function(node) {
            return `<div class="node-button-content">
                <button class="btn btn-${node.properties.style} btn-${node.properties.size}">
                    ${node.properties.text}
                </button>
            </div>`;
        }
    });

    registerNodeType('display-text', {
        name: 'Display Text',
        description: 'Show text or messages to users',
        category: 'ui',
        icon: 'fas fa-comment',
        color: '#6c757d',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' },
            { id: 'text', name: 'Text', type: 'data' }
        ],
        outputs: [
            { id: 'displayed', name: 'Displayed', type: 'flow' }
        ],
        defaultProperties: {
            title: 'Display Text',
            content: 'Hello World!',
            style: 'normal',
            markdown: false
        }
    });

    registerNodeType('file-upload', {
        name: 'File Upload',
        description: 'Allow users to upload files',
        category: 'ui',
        icon: 'fas fa-upload',
        color: '#fd7e14',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'uploaded', name: 'Uploaded', type: 'flow' },
            { id: 'file', name: 'File', type: 'data' }
        ],
        defaultProperties: {
            title: 'File Upload',
            accept: '*/*',
            multiple: false,
            maxSize: '10MB'
        }
    });

    // ================================
    // DATA PROCESSING NODES
    // ================================

    registerNodeType('transform-data', {
        name: 'Transform Data',
        description: 'Transform and manipulate data',
        category: 'data',
        icon: 'fas fa-exchange-alt',
        color: '#e83e8c',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' },
            { id: 'data', name: 'Data', type: 'data' }
        ],
        outputs: [
            { id: 'output', name: 'Output', type: 'flow' },
            { id: 'result', name: 'Result', type: 'data' }
        ],
        defaultProperties: {
            title: 'Transform Data',
            operation: 'map',
            expression: '',
            preserveOriginal: false
        },
        propertyFields: [
            { name: 'operation', type: 'select', options: ['map', 'filter', 'reduce', 'sort'] },
            { name: 'expression', type: 'textarea', placeholder: 'item => item.name' }
        ]
    });

    registerNodeType('filter-data', {
        name: 'Filter Data',
        description: 'Filter data based on conditions',
        category: 'data',
        icon: 'fas fa-filter',
        color: '#20c997',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' },
            { id: 'data', name: 'Data', type: 'data' }
        ],
        outputs: [
            { id: 'output', name: 'Output', type: 'flow' },
            { id: 'filtered', name: 'Filtered', type: 'data' }
        ],
        defaultProperties: {
            title: 'Filter Data',
            condition: '',
            operator: 'equals'
        }
    });

    registerNodeType('aggregate-data', {
        name: 'Aggregate Data',
        description: 'Aggregate and summarize data',
        category: 'data',
        icon: 'fas fa-chart-bar',
        color: '#6610f2',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' },
            { id: 'data', name: 'Data', type: 'data' }
        ],
        outputs: [
            { id: 'output', name: 'Output', type: 'flow' },
            { id: 'result', name: 'Result', type: 'data' }
        ],
        defaultProperties: {
            title: 'Aggregate Data',
            function: 'count',
            groupBy: '',
            field: ''
        }
    });

    registerNodeType('database-query', {
        name: 'Database Query',
        description: 'Query database with SQL',
        category: 'data',
        icon: 'fas fa-database',
        color: '#495057',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'success', name: 'Success', type: 'flow' },
            { id: 'error', name: 'Error', type: 'flow' },
            { id: 'results', name: 'Results', type: 'data' }
        ],
        defaultProperties: {
            title: 'Database Query',
            connection: '',
            query: 'SELECT * FROM users LIMIT 10',
            parameters: {}
        }
    });

    // ================================
    // INTEGRATION NODES
    // ================================

    registerNodeType('php-wasm-execute', {
        name: 'Execute PHP',
        description: 'Run PHP code in WASM environment',
        category: 'integration',
        icon: 'fab fa-php',
        color: '#777bb3',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'success', name: 'Success', type: 'flow' },
            { id: 'error', name: 'Error', type: 'flow' },
            { id: 'output', name: 'Output', type: 'data' }
        ],
        defaultProperties: {
            title: 'Execute PHP',
            code: '<?php\necho "Hello from PHP!";\n?>',
            timeout: 5000
        },
        execute: async function(node, inputData) {
            if (window.PHPWasm) {
                try {
                    const result = await window.PHPWasm.run(node.properties.code);
                    return { success: true, output: result };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
            return { success: false, error: 'PHP-WASM not available' };
        }
    });

    registerNodeType('wordpress-api', {
        name: 'WordPress API',
        description: 'Interact with WordPress REST API',
        category: 'integration',
        icon: 'fab fa-wordpress',
        color: '#21759b',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'success', name: 'Success', type: 'flow' },
            { id: 'error', name: 'Error', type: 'flow' },
            { id: 'response', name: 'Response', type: 'data' }
        ],
        defaultProperties: {
            title: 'WordPress API',
            endpoint: 'posts',
            method: 'GET',
            siteUrl: '',
            auth: {}
        }
    });

    // ================================
    // UTILITY NODES
    // ================================

    registerNodeType('comment', {
        name: 'Comment',
        description: 'Add comments and documentation',
        category: 'utility',
        icon: 'fas fa-sticky-note',
        color: '#ffc107',
        inputs: [],
        outputs: [],
        defaultProperties: {
            title: 'Comment',
            content: 'Add your notes here...',
            color: '#ffc107'
        },
        renderContent: function(node) {
            return `<div class="node-comment-content">
                <div class="comment-text">${node.properties.content}</div>
            </div>`;
        }
    });

    registerNodeType('variable-set', {
        name: 'Set Variable',
        description: 'Set flow variables',
        category: 'utility',
        icon: 'fas fa-dollar-sign',
        color: '#6c757d',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' },
            { id: 'value', name: 'Value', type: 'data' }
        ],
        outputs: [
            { id: 'output', name: 'Output', type: 'flow' }
        ],
        defaultProperties: {
            title: 'Set Variable',
            variableName: '',
            value: ''
        }
    });

    registerNodeType('variable-get', {
        name: 'Get Variable',
        description: 'Get flow variables',
        category: 'utility',
        icon: 'fas fa-eye',
        color: '#6c757d',
        inputs: [
            { id: 'input', name: 'Input', type: 'flow' }
        ],
        outputs: [
            { id: 'output', name: 'Output', type: 'flow' },
            { id: 'value', name: 'Value', type: 'data' }
        ],
        defaultProperties: {
            title: 'Get Variable',
            variableName: ''
        }
    });

    // Register default node types with the flow builder
    FlowBuilder.registerDefaultNodeTypes = function() {
        // All node types are automatically registered above
        console.log(`Registered ${FlowBuilder.nodeTypes.size} node types`);
        
        // Populate node palette
        this.populateNodePalette();
    };

    // Populate the node palette UI
    FlowBuilder.populateNodePalette = function() {
        const categories = {
            triggers: document.getElementById('trigger-nodes'),
            logic: document.getElementById('logic-nodes'),
            actions: document.getElementById('action-nodes'),
            ui: document.getElementById('ui-nodes'),
            data: document.getElementById('data-nodes'),
            all: document.getElementById('all-nodes')
        };

        // Clear existing content
        Object.values(categories).forEach(container => {
            if (container) container.innerHTML = '';
        });

        // Add nodes to appropriate categories
        this.nodeTypes.forEach((nodeType, typeName) => {
            const nodeTemplate = this.createNodeTemplate(typeName, nodeType);
            
            // Add to specific category
            const categoryContainer = categories[nodeType.category];
            if (categoryContainer) {
                categoryContainer.appendChild(nodeTemplate.cloneNode(true));
            }
            
            // Add to "all" category
            if (categories.all) {
                categories.all.appendChild(nodeTemplate);
            }
        });
    };

    // Create draggable node template for palette
    FlowBuilder.createNodeTemplate = function(typeName, nodeType) {
        const template = document.createElement('div');
        template.className = 'node-template';
        template.draggable = true;
        template.dataset.nodeType = typeName;
        
        template.innerHTML = `
            <div class="template-icon" style="color: ${nodeType.color}">
                <i class="${nodeType.icon}"></i>
            </div>
            <div class="template-info">
                <div class="template-name">${nodeType.name}</div>
                <div class="template-description">${nodeType.description}</div>
            </div>
        `;
        
        return template;
    };

    console.log('AlgorithmPress Flow Builder Node Types loaded');

})(window, document);
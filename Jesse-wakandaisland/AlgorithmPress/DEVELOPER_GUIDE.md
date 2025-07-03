# AlgorithmPress Developer Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Core Modules](#core-modules)
5. [API Reference](#api-reference)
6. [Security Features](#security-features)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)
9. [WordPress Integration](#wordpress-integration)
10. [Extending AlgorithmPress](#extending-algorithmpress)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

## Overview

AlgorithmPress is a revolutionary browser-based web application builder that runs entirely in the client browser using PHP-WASM technology. It enables developers to create sophisticated PHP applications without requiring a traditional server environment.

### Key Features

- **Single HTML File Architecture**: Everything needed runs from one HTML file
- **PHP-WASM Integration**: Full PHP runtime in the browser
- **Component-Based Development**: Drag-and-drop component system
- **WordPress Integration**: Seamless WordPress plugin compatibility
- **Real-time Preview**: Instant preview of changes
- **Decentralized Storage**: Support for Cubbit DS3 and local storage
- **Voice Control**: Voice commands for hands-free development
- **Command Palette**: Quick access to all functionality
- **Desktop UI**: macOS-style dock and window management

## Architecture

### Core Components

```
AlgorithmPress
├── Core Framework
│   ├── PHP-WASM Engine
│   ├── Module System
│   └── Component Library
├── UI Layer
│   ├── Dock System
│   ├── Command Palette
│   ├── Desktop Integration
│   └── Builder Interface
├── Storage Layer
│   ├── Local Storage
│   ├── Cubbit DS3 Integration
│   └── WordPress API
├── Security Layer
│   ├── Input Sanitization
│   ├── Error Handling
│   └── Rate Limiting
└── Performance Layer
    ├── Resource Optimization
    ├── Memory Management
    └── Monitoring
```

### Module System

AlgorithmPress uses a modular architecture where each feature is implemented as a self-contained module:

```javascript
// Module Structure
const MyModule = (function() {
    'use strict';
    
    // Private state
    let state = {
        initialized: false,
        // module-specific state
    };
    
    // Public API
    return {
        init: function() {
            // Module initialization
        },
        
        // Public methods
        
        // Module metadata
        meta: {
            name: 'MyModule',
            version: '1.0.0',
            dependencies: ['CoreModule']
        }
    };
})();
```

## Getting Started

### Basic Setup

1. **Download**: Get the latest `AlgorithmPress.html` file
2. **Open**: Open the file in a modern web browser
3. **Initialize**: The application will auto-initialize
4. **Start Building**: Use the component library to build your application

### First Project

```javascript
// Example: Creating a simple blog component
const BlogComponent = {
    name: 'Simple Blog',
    template: `
        <div class="blog-container">
            <h1><?php echo $title; ?></h1>
            <div class="content">
                <?php echo $content; ?>
            </div>
        </div>
    `,
    data: {
        title: 'My Blog',
        content: 'Welcome to my blog!'
    }
};
```

### Configuration

```javascript
// Basic configuration
AlgorithmPress.configure({
    theme: 'bootstrap',
    storage: 'localStorage',
    phpVersion: '8.2',
    enableVoiceControl: true,
    enableDesktopMode: true
});
```

## Core Modules

### 1. PHP-WASM Builder

The core module that provides PHP runtime in the browser.

#### Key Methods

```javascript
PHPWasmBuilder.init()
PHPWasmBuilder.executePhp(code)
PHPWasmBuilder.addComponent(component)
PHPWasmBuilder.preview()
PHPWasmBuilder.export(format)
```

#### Example Usage

```javascript
// Execute PHP code
const result = await PHPWasmBuilder.executePhp(`
    <?php
    echo "Hello from PHP-WASM!";
    ?>
`);

// Add a component
PHPWasmBuilder.addComponent({
    name: 'Header',
    template: '<h1><?php echo $title; ?></h1>',
    data: { title: 'My Website' }
});
```

### 2. Command Palette

Provides quick access to all AlgorithmPress functionality.

#### Registration

```javascript
CommandPalette.registerCommand({
    id: 'create-component',
    name: 'Create New Component',
    description: 'Create a new component',
    category: 'components',
    keywords: ['new', 'create', 'component'],
    execute: function(params) {
        // Command implementation
    },
    params: [
        {
            name: 'componentName',
            type: 'string',
            required: true,
            description: 'Name of the component'
        }
    ]
});
```

#### Usage

```javascript
// Open command palette
CommandPalette.show();

// Execute command programmatically
CommandPalette.executeCommand('create-component', {
    componentName: 'MyComponent'
});
```

### 3. Dock System

Manages the desktop-style dock interface.

#### Adding Dock Items

```javascript
AlgorithmPressDock.addModule({
    id: 'my-module',
    name: 'My Module',
    icon: 'fas fa-cog',
    initialize: function() {
        // Module initialization
    },
    togglePanel: function() {
        // Toggle module panel
    }
});
```

### 4. Storage System

Handles data persistence across different storage backends.

#### Local Storage

```javascript
// Save project
AlgorithmPressStorage.save('my-project', projectData);

// Load project
const project = AlgorithmPressStorage.load('my-project');

// List projects
const projects = AlgorithmPressStorage.list();
```

#### Cubbit DS3 Integration

```javascript
// Configure Cubbit
AlgorithmPressStorage.configureCubbit({
    apiKey: 'your-api-key',
    bucket: 'my-bucket'
});

// Save to Cubbit
await AlgorithmPressStorage.saveToCubbit('project-name', data);
```

## API Reference

### Core API

#### AlgorithmPress Global Object

```javascript
window.AlgorithmPress = {
    // Core methods
    init(config),
    configure(options),
    getVersion(),
    getModules(),
    
    // Project management
    createProject(name),
    saveProject(name, data),
    loadProject(name),
    exportProject(format),
    
    // Component management
    addComponent(component),
    removeComponent(id),
    getComponent(id),
    listComponents(),
    
    // Event system
    on(event, callback),
    off(event, callback),
    emit(event, data)
};
```

#### Events

```javascript
// Available events
AlgorithmPress.on('project:created', function(project) {
    console.log('Project created:', project.name);
});

AlgorithmPress.on('component:added', function(component) {
    console.log('Component added:', component.name);
});

AlgorithmPress.on('error', function(error) {
    console.error('AlgorithmPress error:', error);
});
```

### Security API

```javascript
// Input sanitization
const clean = AlgorithmPressSecurity.sanitizeInput(userInput, 'html');

// API key management
AlgorithmPressSecurity.keyManager.setKey('cubbit', apiKey);
const key = AlgorithmPressSecurity.keyManager.getKey('cubbit');

// Secure AJAX
AlgorithmPressSecurity.secureAjax({
    url: '/api/endpoint',
    method: 'POST',
    data: { key: 'value' },
    sanitizeResponse: true
});
```

### Performance API

```javascript
// Resource loading
AlgorithmPressPerformance.resourceLoader.lazyLoadScripts([
    { src: 'script1.js' },
    { src: 'script2.js' }
]);

// DOM optimization
const element = AlgorithmPressPerformance.domOptimizer.getCachedElement('#my-element');

// Performance monitoring
const report = AlgorithmPressPerformance.monitor.generateReport();
```

### Error Handling API

```javascript
// Logging
AlgorithmPressErrorHandler.logger.info('Info message', { data: 'value' });
AlgorithmPressErrorHandler.logger.error('Error message', { error: errorObject });

// Error reporting
const errorId = AlgorithmPressErrorHandler.reportError(
    new Error('Something went wrong'),
    'custom_category',
    { additionalInfo: 'context' }
);

// User notifications
AlgorithmPressErrorHandler.notifyUser('Operation completed', 'success');
```

## Security Features

### Input Sanitization

All user inputs are automatically sanitized:

```javascript
// HTML sanitization
const safeHtml = AlgorithmPressSecurity.sanitizeInput('<script>alert("xss")</script>', 'html');
// Result: "&lt;script&gt;alert(\"xss\")&lt;/script&gt;"

// URL sanitization
const safeUrl = AlgorithmPressSecurity.sanitizeInput('javascript:alert(1)', 'url');
// Result: "javascript%3Aalert(1)"
```

### API Key Security

API keys are stored encrypted in localStorage:

```javascript
// Secure storage
AlgorithmPressSecurity.keyManager.setKey('myapi', 'secret-key-123');

// Retrieval
const key = AlgorithmPressSecurity.keyManager.getKey('myapi');
```

### Rate Limiting

API calls are automatically rate-limited:

```javascript
// Check rate limit
if (AlgorithmPressSecurity.rateLimiter.checkLimit('/api/upload', 5, 60000)) {
    // Proceed with API call
} else {
    // Rate limit exceeded
}
```

## Performance Optimization

### Resource Management

```javascript
// Preload critical resources
AlgorithmPressPerformance.resourceLoader.preloadCriticalResources();

// Lazy load modules
const modules = [
    { src: 'module1.js', initFunction: 'Module1.init' },
    { src: 'module2.js', initFunction: 'Module2.init' }
];
AlgorithmPressPerformance.resourceLoader.lazyLoadScripts(modules);
```

### Memory Management

```javascript
// Monitor memory usage
AlgorithmPressPerformance.memoryManager.monitorMemory();

// Clean up caches
AlgorithmPressPerformance.memoryManager.clearCaches();
```

### Render Optimization

```javascript
// Hardware acceleration
AlgorithmPressPerformance.renderOptimizer.enableHardwareAcceleration(element);

// Optimized animations
const stopAnimation = AlgorithmPressPerformance.renderOptimizer.optimizedAnimation((time) => {
    // Animation frame callback
});
```

## Error Handling

### Error Categories

- `SCRIPT_LOAD`: Script loading failures
- `MODULE_INIT`: Module initialization errors
- `API_ERROR`: API communication errors
- `VALIDATION`: Input validation errors
- `STORAGE`: Storage operation errors
- `RENDER`: Rendering errors
- `NETWORK`: Network connectivity issues
- `SECURITY`: Security-related errors
- `PERFORMANCE`: Performance issues
- `USER_ACTION`: User interaction errors

### Error Recovery

The system automatically attempts to recover from common errors:

```javascript
// Script load recovery
AlgorithmPressErrorHandler.recoverFromScriptLoad(errorData);

// Module initialization recovery
AlgorithmPressErrorHandler.recoverFromModuleInit(errorData);

// API error recovery with retry
AlgorithmPressErrorHandler.recoverFromApiError(errorData);
```

### Custom Error Handling

```javascript
// Register custom error handler
AlgorithmPressErrorHandler.registerRecoveryStrategy('custom_error', function(errorData) {
    // Custom recovery logic
});

// Report custom errors
AlgorithmPressErrorHandler.reportError(
    new Error('Custom error'),
    'custom_category',
    { customContext: 'value' }
);
```

## WordPress Integration

### Plugin Development

AlgorithmPress includes WordPress plugin components for seamless integration:

#### NARA (New Auto Refresh API)

```php
<?php
// WordPress plugin integration
add_action('wp_footer', 'nara_display_api_data');

function nara_display_api_data() {
    $options = get_option('nara_settings');
    $endpoints = isset($options['nara_api_endpoints']) ? $options['nara_api_endpoints'] : [];
    
    if (!empty($endpoints)) {
        echo "<script type='text/javascript'>
            var naraSettings = " . json_encode($endpoints) . ";
        </script>";
    }
}
?>
```

#### Plugin Structure

```
WP 4 AP/
├── new-auto-refresh-api/
│   ├── new-auto-refresh-api.php
│   ├── includes/
│   │   ├── admin-settings.php
│   │   ├── frontend-display.php
│   │   └── ajax-handling.php
│   └── js/
│       └── custom-script.js
├── nara-data-integration/
└── webhook-editor-integration/
```

### API Integration

```javascript
// WordPress API integration
const wpApi = new WordPressAPI({
    baseUrl: 'https://example.com/wp-json/wp/v2/',
    authentication: 'bearer',
    token: 'your-jwt-token'
});

// Fetch posts
const posts = await wpApi.get('posts');

// Create post
const newPost = await wpApi.post('posts', {
    title: 'New Post',
    content: 'Post content',
    status: 'publish'
});
```

## Extending AlgorithmPress

### Creating Custom Modules

```javascript
// 1. Define module structure
const CustomModule = (function() {
    'use strict';
    
    let state = {
        initialized: false
    };
    
    return {
        init: function() {
            if (state.initialized) return;
            
            // Module initialization logic
            this.setupUI();
            this.bindEvents();
            
            state.initialized = true;
            console.log('CustomModule initialized');
        },
        
        setupUI: function() {
            // Create UI elements
        },
        
        bindEvents: function() {
            // Bind event handlers
        },
        
        // Public API methods
        doSomething: function() {
            // Module functionality
        },
        
        // Module metadata
        meta: {
            name: 'CustomModule',
            version: '1.0.0',
            author: 'Your Name',
            dependencies: ['PHPWasmBuilder']
        }
    };
})();

// 2. Register with AlgorithmPress
AlgorithmPress.registerModule('custom-module', CustomModule);

// 3. Add to dock (optional)
AlgorithmPressDock.addModule({
    id: 'custom-module',
    name: 'Custom Module',
    icon: 'fas fa-puzzle-piece',
    initialize: CustomModule.init,
    togglePanel: function() {
        // Toggle module panel
    }
});
```

### Creating Custom Components

```javascript
// Define component
const CustomComponent = {
    name: 'Custom Component',
    category: 'custom',
    template: `
        <div class="custom-component">
            <h3><?php echo $title; ?></h3>
            <p><?php echo $description; ?></p>
            <?php if ($showButton): ?>
                <button class="btn btn-primary"><?php echo $buttonText; ?></button>
            <?php endif; ?>
        </div>
    `,
    properties: {
        title: {
            type: 'string',
            default: 'Component Title',
            label: 'Title'
        },
        description: {
            type: 'text',
            default: 'Component description',
            label: 'Description'
        },
        showButton: {
            type: 'boolean',
            default: true,
            label: 'Show Button'
        },
        buttonText: {
            type: 'string',
            default: 'Click Me',
            label: 'Button Text'
        }
    },
    styles: `
        .custom-component {
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 10px 0;
        }
        .custom-component h3 {
            margin-top: 0;
            color: #333;
        }
    `,
    scripts: `
        document.addEventListener('DOMContentLoaded', function() {
            const buttons = document.querySelectorAll('.custom-component button');
            buttons.forEach(button => {
                button.addEventListener('click', function() {
                    alert('Button clicked!');
                });
            });
        });
    `
};

// Register component
PHPWasmBuilder.registerComponent(CustomComponent);
```

### Creating Command Palette Commands

```javascript
// Register custom command
CommandPalette.registerCommand({
    id: 'export-project-json',
    name: 'Export Project as JSON',
    description: 'Export the current project as a JSON file',
    category: 'project',
    keywords: ['export', 'json', 'download'],
    icon: 'fas fa-download',
    execute: function() {
        const project = PHPWasmBuilder.getCurrentProject();
        const json = JSON.stringify(project, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
});
```

## Testing

### Unit Testing Framework

```javascript
// Simple test framework included
const AlgorithmPressTest = {
    tests: [],
    
    // Define test
    test: function(name, testFunction) {
        this.tests.push({ name, testFunction });
    },
    
    // Run all tests
    run: function() {
        let passed = 0;
        let failed = 0;
        
        this.tests.forEach(test => {
            try {
                test.testFunction();
                console.log(`✓ ${test.name}`);
                passed++;
            } catch (error) {
                console.error(`✗ ${test.name}: ${error.message}`);
                failed++;
            }
        });
        
        console.log(`Tests: ${passed} passed, ${failed} failed`);
    },
    
    // Assertions
    assert: function(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    },
    
    assertEqual: function(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }
};

// Example tests
AlgorithmPressTest.test('Module initialization', function() {
    AlgorithmPressTest.assert(typeof PHPWasmBuilder !== 'undefined', 'PHPWasmBuilder should be defined');
    AlgorithmPressTest.assert(PHPWasmBuilder.meta.version, 'Version should be defined');
});

AlgorithmPressTest.test('Component creation', function() {
    const component = {
        name: 'Test Component',
        template: '<div>Test</div>'
    };
    
    PHPWasmBuilder.addComponent(component);
    const retrieved = PHPWasmBuilder.getComponent('test-component');
    
    AlgorithmPressTest.assert(retrieved, 'Component should be retrievable');
    AlgorithmPressTest.assertEqual(retrieved.name, component.name, 'Component name should match');
});

// Run tests
AlgorithmPressTest.run();
```

### Integration Testing

```javascript
// Test module integration
AlgorithmPressTest.test('Module integration', async function() {
    // Test command palette integration
    CommandPalette.registerCommand({
        id: 'test-command',
        name: 'Test Command',
        execute: function() {
            return 'executed';
        }
    });
    
    const result = await CommandPalette.executeCommand('test-command');
    AlgorithmPressTest.assertEqual(result, 'executed', 'Command should execute');
});
```

## Deployment

### Production Checklist

1. **Security**
   - [ ] API keys removed/encrypted
   - [ ] Input sanitization enabled
   - [ ] CSP headers configured
   - [ ] HTTPS enforced

2. **Performance**
   - [ ] Resources preloaded
   - [ ] Scripts lazy-loaded
   - [ ] Memory management enabled
   - [ ] Performance monitoring configured

3. **Error Handling**
   - [ ] Error logging enabled
   - [ ] Recovery mechanisms tested
   - [ ] User notifications configured
   - [ ] Remote logging setup (optional)

4. **Testing**
   - [ ] All tests passing
   - [ ] Cross-browser compatibility verified
   - [ ] Mobile responsiveness tested
   - [ ] Accessibility compliance checked

### Deployment Steps

```bash
# 1. Validate HTML
html5validator AlgorithmPress-Production.html

# 2. Test in multiple browsers
# Chrome, Firefox, Safari, Edge

# 3. Performance testing
# Run Lighthouse audit
# Check Core Web Vitals

# 4. Security testing
# Run security scan
# Verify CSP compliance

# 5. Deploy
# Upload to web server
# Configure CDN (optional)
# Setup monitoring
```

### CDN Configuration

```html
<!-- Optional: Self-host critical dependencies -->
<link rel="preload" href="/assets/bootstrap.min.css" as="style">
<link rel="preload" href="/assets/fontawesome.min.css" as="style">
<script src="/assets/bootstrap.bundle.min.js" defer></script>
```

## Troubleshooting

### Common Issues

#### 1. Script Loading Failures

**Problem**: External scripts fail to load

**Solutions**:
- Check network connectivity
- Verify script URLs
- Check browser console for CORS errors
- Use fallback scripts if available

```javascript
// Debug script loading
AlgorithmPressErrorHandler.logger.debug('Script loading debug info', {
    failedScripts: performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('.js') && entry.transferSize === 0)
});
```

#### 2. PHP-WASM Initialization Issues

**Problem**: PHP-WASM fails to initialize

**Solutions**:
- Ensure browser supports WebAssembly
- Check available memory
- Verify PHP-WASM script loaded correctly

```javascript
// Check WebAssembly support
if (typeof WebAssembly === 'undefined') {
    AlgorithmPressErrorHandler.notifyUser(
        'WebAssembly not supported. Please use a modern browser.',
        'error'
    );
}
```

#### 3. Storage Issues

**Problem**: Data not persisting

**Solutions**:
- Check localStorage quota
- Verify storage permissions
- Test with different storage backends

```javascript
// Check storage availability
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
} catch (e) {
    AlgorithmPressErrorHandler.logger.error('localStorage not available', { error: e });
}
```

#### 4. Performance Issues

**Problem**: Application runs slowly

**Solutions**:
- Enable performance monitoring
- Check memory usage
- Optimize component usage
- Use lazy loading

```javascript
// Performance debugging
const report = AlgorithmPressPerformance.monitor.generateReport();
console.log('Performance Report:', report);
```

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// Enable debug mode
AlgorithmPressErrorHandler.config.logLevel = 'debug';
AlgorithmPressErrorHandler.config.enableConsoleOutput = true;

// View all logs
console.table(AlgorithmPressErrorHandler.logs);
```

### Getting Help

1. **Check the logs**: Use the error handling system to view detailed logs
2. **Performance report**: Generate performance reports to identify bottlenecks
3. **Browser console**: Check for JavaScript errors and warnings
4. **Network tab**: Verify all resources are loading correctly
5. **Community support**: Join the AlgorithmPress community for help

---

This guide covers the essential aspects of developing with AlgorithmPress. For additional help, refer to the specific module documentation or reach out to the community.
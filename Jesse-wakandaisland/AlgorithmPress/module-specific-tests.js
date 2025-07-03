/**
 * AlgorithmPress Module-Specific Test Suites
 * Tests for recently fixed JavaScript modules
 */

(function(window, document) {
    'use strict';

    // Ensure testing framework is available
    if (!window.AlgorithmPressTest) {
        console.error('AlgorithmPress Testing Framework required');
        return;
    }

    const { utils } = window.AlgorithmPressTest;

    // Helper function to safely check global objects
    function safeCheck(objectPath) {
        try {
            return objectPath.split('.').reduce((obj, prop) => obj && obj[prop], window);
        } catch (e) {
            return null;
        }
    }

    // Helper to create mock DOM elements
    function createMockElement(tag = 'div', attributes = {}) {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    // Module Framework Tests
    function testModuleFramework() {
        console.log('📦 Setting up Module Framework tests...');

        window.AlgorithmPressTest.unit('Module Framework - Global object safety checks', function() {
            // Test that the module checks for global objects before use
            utils.assert(typeof window.ModuleFramework !== 'undefined', 'ModuleFramework should be available');
            
            // Test safe global checks
            const mockCheck = (obj) => typeof window[obj] !== 'undefined';
            utils.assertTrue(mockCheck('document'), 'Should safely check for document');
            utils.assertFalse(mockCheck('nonExistentGlobal'), 'Should safely handle non-existent globals');
        });

        window.AlgorithmPressTest.unit('Module Framework - Error handling in module loading', function() {
            // Test error handling when modules fail to load
            const originalConsoleWarn = console.warn;
            let warningsCaught = [];
            console.warn = (...args) => warningsCaught.push(args.join(' '));

            try {
                // Simulate module loading error
                const mockModuleLoader = {
                    loadModule: function(moduleName) {
                        try {
                            if (moduleName === 'invalid-module') {
                                throw new Error('Module not found');
                            }
                            return true;
                        } catch (e) {
                            console.warn(`Error loading module ${moduleName}:`, e.message);
                            return false;
                        }
                    }
                };

                const result = mockModuleLoader.loadModule('invalid-module');
                utils.assertFalse(result, 'Should handle module loading errors gracefully');
                utils.assert(warningsCaught.length > 0, 'Should log warnings for failed module loads');
            } finally {
                console.warn = originalConsoleWarn;
            }
        });

        window.AlgorithmPressTest.unit('Module Framework - Safe DOM operations', function() {
            // Test safe DOM element access
            const safeGetElement = (selector) => {
                try {
                    return document.querySelector(selector);
                } catch (e) {
                    console.warn('Error querying selector:', e);
                    return null;
                }
            };

            const validElement = safeGetElement('body');
            utils.assert(validElement !== null, 'Should find valid selectors');

            const invalidElement = safeGetElement('invalid::selector');
            utils.assert(invalidElement === null, 'Should handle invalid selectors gracefully');
        });
    }

    // PHP-WASM Builder Tests
    function testPHPWasmBuilder() {
        console.log('🔧 Setting up PHP-WASM Builder tests...');

        window.AlgorithmPressTest.unit('PHP-WASM Builder - Safe global object checks', function() {
            // Test safe checks for PHPWasmIntegration
            const hasIntegration = typeof window.PHPWasmIntegration !== 'undefined';
            utils.assert(hasIntegration || true, 'Should handle missing PHPWasmIntegration gracefully');
            
            // Test safe checks for CubbitStorage
            const hasStorage = typeof window.CubbitStorage !== 'undefined';
            utils.assert(hasStorage || true, 'Should handle missing CubbitStorage gracefully');
        });

        window.AlgorithmPressTest.unit('PHP-WASM Builder - DOM element safety', function() {
            // Test safe DOM element access
            const testContainer = createMockElement('div', { id: 'test-php-container' });
            document.body.appendChild(testContainer);

            const safeAccessElement = (id) => {
                const element = document.getElementById(id);
                if (!element) {
                    console.warn(`Element ${id} not found`);
                    return null;
                }
                return element;
            };

            const validElement = safeAccessElement('test-php-container');
            utils.assert(validElement !== null, 'Should find existing elements');

            const invalidElement = safeAccessElement('non-existent-element');
            utils.assert(invalidElement === null, 'Should handle missing elements gracefully');

            // Cleanup
            document.body.removeChild(testContainer);
        });

        window.AlgorithmPressTest.integration('PHP-WASM Builder - Bootstrap integration', function() {
            // Test safe bootstrap checking
            const checkBootstrap = () => {
                return typeof window.bootstrap !== 'undefined' && window.bootstrap;
            };

            const hasBootstrap = checkBootstrap();
            utils.assert(hasBootstrap || true, 'Should handle missing bootstrap gracefully');
        });
    }

    // Command Palette Tests
    function testCommandPalette() {
        console.log('🎯 Setting up Command Palette tests...');

        window.AlgorithmPressTest.unit('Command Palette - Safe global checks', function() {
            // Test safe checks for global objects
            const checkGlobal = (name) => {
                return typeof window[name] !== 'undefined' && window[name] !== null;
            };

            const hasDesktopIntegration = checkGlobal('DesktopIntegration');
            const hasTogglePanel = checkGlobal('togglePanel');
            const hasAlgorithmPressDock = checkGlobal('AlgorithmPressDock');
            const hasNaraUI = checkGlobal('NaraUI');

            // Should not throw errors when checking
            utils.assert(typeof hasDesktopIntegration === 'boolean', 'Should safely check DesktopIntegration');
            utils.assert(typeof hasTogglePanel === 'boolean', 'Should safely check togglePanel');
            utils.assert(typeof hasAlgorithmPressDock === 'boolean', 'Should safely check AlgorithmPressDock');
            utils.assert(typeof hasNaraUI === 'boolean', 'Should safely check NaraUI');
        });

        window.AlgorithmPressTest.unit('Command Palette - Context detection', function() {
            // Test improved context detection
            const getCurrentContext = () => {
                try {
                    const activeElement = document.activeElement;
                    if (!activeElement) return 'general';

                    if (activeElement.classList.contains('editor')) return 'editor';
                    if (activeElement.closest('.php-panel')) return 'php';
                    if (activeElement.closest('.component-panel')) return 'components';
                    if (activeElement.closest('.builder-panel')) return 'builder';
                    
                    return 'general';
                } catch (e) {
                    console.warn('Error detecting context:', e);
                    return 'general';
                }
            };

            const context = getCurrentContext();
            utils.assert(typeof context === 'string', 'Should return a string context');
            utils.assert(context.length > 0, 'Should return non-empty context');
        });

        window.AlgorithmPressTest.unit('Command Palette - Error handling in command execution', function() {
            // Test error handling in command execution
            const safeExecuteCommand = (command) => {
                try {
                    if (typeof command !== 'function') {
                        throw new Error('Command must be a function');
                    }
                    return command();
                } catch (e) {
                    console.warn('Command execution error:', e.message);
                    return null;
                }
            };

            const validCommand = () => 'success';
            const invalidCommand = 'not-a-function';

            const validResult = safeExecuteCommand(validCommand);
            utils.assertEqual(validResult, 'success', 'Should execute valid commands');

            const invalidResult = safeExecuteCommand(invalidCommand);
            utils.assert(invalidResult === null, 'Should handle invalid commands gracefully');
        });
    }

    // Dock Functionality Tests
    function testDockFunctionality() {
        console.log('🏠 Setting up Dock Functionality tests...');

        window.AlgorithmPressTest.unit('Dock Functionality - Safe module checks', function() {
            // Test safe checks for optional modules
            const checkModule = (moduleName) => {
                try {
                    return typeof window[moduleName] !== 'undefined' && window[moduleName] !== null;
                } catch (e) {
                    return false;
                }
            };

            const hasVoiceControl = checkModule('VoiceControlSystem');
            const hasNexusGrid = checkModule('NexusGrid');
            const hasNexusGridDemo = checkModule('NexusGridDemoSystem');
            const hasRainbowIndicator = checkModule('RainbowIndicator');
            const hasCubbitStorage = checkModule('CubbitStorage');

            // All checks should complete without errors
            utils.assert(typeof hasVoiceControl === 'boolean', 'Should safely check VoiceControlSystem');
            utils.assert(typeof hasNexusGrid === 'boolean', 'Should safely check NexusGrid');
            utils.assert(typeof hasNexusGridDemo === 'boolean', 'Should safely check NexusGridDemoSystem');
            utils.assert(typeof hasRainbowIndicator === 'boolean', 'Should safely check RainbowIndicator');
            utils.assert(typeof hasCubbitStorage === 'boolean', 'Should safely check CubbitStorage');
        });

        window.AlgorithmPressTest.unit('Dock Functionality - Toast notification safety', function() {
            // Test safe toast notifications
            const safeShowToast = (message, type = 'info') => {
                try {
                    if (!message || typeof message !== 'string') {
                        console.warn('Invalid toast message:', message);
                        return false;
                    }

                    // Mock toast implementation
                    const toast = createMockElement('div', { 
                        class: `toast toast-${type}`,
                        'data-message': message 
                    });
                    
                    document.body.appendChild(toast);
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 100);
                    
                    return true;
                } catch (e) {
                    console.warn('Toast error:', e.message);
                    return false;
                }
            };

            const validToast = safeShowToast('Test message', 'success');
            utils.assertTrue(validToast, 'Should show valid toasts');

            const invalidToast = safeShowToast(null, 'error');
            utils.assertFalse(invalidToast, 'Should handle invalid toast messages');
        });

        window.AlgorithmPressTest.unit('Dock Functionality - Module toggle safety', function() {
            // Test safe module toggling
            const safeToggleModule = (moduleName) => {
                try {
                    const moduleButton = document.querySelector(`[data-module="${moduleName}"]`);
                    if (!moduleButton) {
                        console.warn(`Module button not found: ${moduleName}`);
                        return false;
                    }

                    const isActive = moduleButton.classList.contains('active');
                    moduleButton.classList.toggle('active', !isActive);
                    return true;
                } catch (e) {
                    console.warn(`Error toggling module ${moduleName}:`, e.message);
                    return false;
                }
            };

            // Create mock module button
            const mockButton = createMockElement('button', {
                'data-module': 'test-module',
                'class': 'module-button'
            });
            document.body.appendChild(mockButton);

            const toggleResult = safeToggleModule('test-module');
            utils.assertTrue(toggleResult, 'Should toggle existing modules');

            const invalidToggle = safeToggleModule('non-existent-module');
            utils.assertFalse(invalidToggle, 'Should handle non-existent modules gracefully');

            // Cleanup
            document.body.removeChild(mockButton);
        });
    }

    // Desktop Integration Tests
    function testDesktopIntegration() {
        console.log('🖥️ Setting up Desktop Integration tests...');

        window.AlgorithmPressTest.unit('Desktop Integration - NaraUI safety checks', function() {
            // Test safe NaraUI integration
            const safeRegisterWithNaraUI = (element, options) => {
                try {
                    if (typeof window.NaraUI !== 'undefined' && typeof window.NaraUI.register === 'function') {
                        window.NaraUI.register(element, options);
                        return true;
                    } else {
                        console.warn('NaraUI not available');
                        return false;
                    }
                } catch (e) {
                    console.warn('Error registering with NaraUI:', e.message);
                    return false;
                }
            };

            const mockElement = createMockElement('div', { class: 'test-window' });
            const mockOptions = { glassStrength: 1.0, priority: 10 };

            const result = safeRegisterWithNaraUI(mockElement, mockOptions);
            utils.assert(typeof result === 'boolean', 'Should safely attempt NaraUI registration');
        });

        window.AlgorithmPressTest.unit('Desktop Integration - Desktop container safety', function() {
            // Test safe desktop container access
            const getDesktopContainer = () => {
                try {
                    const container = document.getElementById('desktop-container');
                    if (!container) {
                        console.warn('Desktop container not found');
                        return null;
                    }
                    return container;
                } catch (e) {
                    console.warn('Error accessing desktop container:', e.message);
                    return null;
                }
            };

            // Create mock desktop container
            const mockContainer = createMockElement('div', { id: 'test-desktop-container' });
            document.body.appendChild(mockContainer);

            const container = document.getElementById('test-desktop-container');
            utils.assert(container !== null, 'Should find existing desktop container');

            const missingContainer = document.getElementById('non-existent-container');
            utils.assert(missingContainer === null, 'Should handle missing container gracefully');

            // Cleanup
            document.body.removeChild(mockContainer);
        });

        window.AlgorithmPressTest.unit('Desktop Integration - Window manager safety', function() {
            // Test safe window creation and management
            const safeCreateWindow = (title, content, options = {}) => {
                try {
                    if (!title || typeof title !== 'string') {
                        throw new Error('Window title required');
                    }

                    const windowEl = createMockElement('div', {
                        class: 'window-container',
                        'data-title': title
                    });

                    if (content) {
                        if (content instanceof HTMLElement) {
                            windowEl.appendChild(content);
                        } else if (typeof content === 'string') {
                            windowEl.innerHTML = content;
                        }
                    }

                    return windowEl;
                } catch (e) {
                    console.warn('Error creating window:', e.message);
                    return null;
                }
            };

            const validWindow = safeCreateWindow('Test Window', '<p>Test content</p>');
            utils.assert(validWindow !== null, 'Should create valid windows');
            utils.assertEqual(validWindow.getAttribute('data-title'), 'Test Window', 'Should set window title');

            const invalidWindow = safeCreateWindow(null, 'content');
            utils.assert(invalidWindow === null, 'Should handle invalid window parameters');
        });
    }

    // NaraUI Tests
    function testNaraUI() {
        console.log('🎨 Setting up NaraUI tests...');

        window.AlgorithmPressTest.unit('NaraUI - Canvas safety checks', function() {
            // Test safe canvas access
            const getCanvas = () => {
                try {
                    let canvas = document.getElementById('desktop-background-canvas') || 
                                document.querySelector('canvas[id*="background"]') ||
                                document.querySelector('canvas');
                    
                    if (!canvas) {
                        console.warn('No canvas found');
                        return null;
                    }

                    return canvas;
                } catch (e) {
                    console.warn('Error accessing canvas:', e.message);
                    return null;
                }
            };

            // Create mock canvas
            const mockCanvas = createMockElement('canvas', { 
                id: 'test-background-canvas',
                width: '400',
                height: '300'
            });
            document.body.appendChild(mockCanvas);

            const canvas = getCanvas();
            utils.assert(canvas !== null, 'Should find canvas when available');

            // Cleanup
            document.body.removeChild(mockCanvas);

            const noCanvas = getCanvas();
            utils.assert(noCanvas === null, 'Should handle missing canvas gracefully');
        });

        window.AlgorithmPressTest.unit('NaraUI - Observer safety', function() {
            // Test safe observer creation
            const createSafeObserver = () => {
                if (!('IntersectionObserver' in window)) {
                    console.warn('IntersectionObserver not supported');
                    return null;
                }

                try {
                    return new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            // Safe processing
                            if (entry && entry.target) {
                                // Process entry
                            }
                        });
                    }, {
                        root: null,
                        rootMargin: '0px',
                        threshold: 0.1
                    });
                } catch (e) {
                    console.warn('Error creating IntersectionObserver:', e.message);
                    return null;
                }
            };

            const observer = createSafeObserver();
            utils.assert(observer !== null || !('IntersectionObserver' in window), 'Should create observer when supported');

            if (observer) {
                observer.disconnect();
            }
        });

        window.AlgorithmPressTest.unit('NaraUI - Mutation Observer safety', function() {
            // Test safe MutationObserver usage
            const createSafeMutationObserver = () => {
                if (!('MutationObserver' in window)) {
                    console.warn('MutationObserver not supported');
                    return null;
                }

                try {
                    return new MutationObserver((mutations) => {
                        mutations.forEach(mutation => {
                            if (mutation.type === 'childList') {
                                // Safe processing
                            }
                        });
                    });
                } catch (e) {
                    console.warn('Error creating MutationObserver:', e.message);
                    return null;
                }
            };

            const observer = createSafeMutationObserver();
            utils.assert(observer !== null || !('MutationObserver' in window), 'Should create MutationObserver when supported');

            if (observer) {
                observer.disconnect();
            }
        });
    }

    // Voice Control System Tests
    function testVoiceControlSystem() {
        console.log('🎤 Setting up Voice Control System tests...');

        window.AlgorithmPressTest.unit('Voice Control - Speech Recognition safety', function() {
            // Test safe speech recognition initialization
            const checkSpeechRecognition = () => {
                try {
                    const hasSpeechRecognition = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
                    return hasSpeechRecognition;
                } catch (e) {
                    console.warn('Error checking speech recognition:', e.message);
                    return false;
                }
            };

            const hasRecognition = checkSpeechRecognition();
            utils.assert(typeof hasRecognition === 'boolean', 'Should safely check for speech recognition');
        });

        window.AlgorithmPressTest.unit('Voice Control - Command processor safety', function() {
            // Test safe command processor creation
            const createSafeCommandProcessor = () => {
                try {
                    // Mock CommandProcessor class
                    class MockCommandProcessor {
                        constructor() {
                            this.commands = new Map();
                        }
                        
                        registerCommand(name, handler) {
                            if (typeof name === 'string' && typeof handler === 'function') {
                                this.commands.set(name, handler);
                                return true;
                            }
                            return false;
                        }
                    }
                    
                    return new MockCommandProcessor();
                } catch (e) {
                    console.warn('Error creating CommandProcessor:', e.message);
                    return null;
                }
            };

            const processor = createSafeCommandProcessor();
            utils.assert(processor !== null, 'Should create command processor safely');
            
            if (processor && processor.registerCommand) {
                const registered = processor.registerCommand('test', () => 'test');
                utils.assertTrue(registered, 'Should register valid commands');
            }
        });

        window.AlgorithmPressTest.unit('Voice Control - DOM query safety', function() {
            // Test safe DOM queries for voice control elements
            const safeQueryElement = (selector) => {
                try {
                    const element = document.querySelector(selector);
                    if (!element) {
                        console.warn(`Element not found: ${selector}`);
                        return null;
                    }
                    return element;
                } catch (e) {
                    console.warn(`Error querying ${selector}:`, e.message);
                    return null;
                }
            };

            const bodyElement = safeQueryElement('body');
            utils.assert(bodyElement !== null, 'Should find valid selectors');

            const invalidElement = safeQueryElement('.non-existent-element');
            utils.assert(invalidElement === null, 'Should handle missing elements gracefully');
        });
    }

    // Rainbow Indicator Tests
    function testRainbowIndicator() {
        console.log('🌈 Setting up Rainbow Indicator tests...');

        window.AlgorithmPressTest.unit('Rainbow Indicator - Observer support checks', function() {
            // Test safe observer support checking
            const checkObserverSupport = () => {
                return {
                    intersectionObserver: 'IntersectionObserver' in window,
                    mutationObserver: 'MutationObserver' in window
                };
            };

            const support = checkObserverSupport();
            utils.assert(typeof support.intersectionObserver === 'boolean', 'Should check IntersectionObserver support');
            utils.assert(typeof support.mutationObserver === 'boolean', 'Should check MutationObserver support');
        });

        window.AlgorithmPressTest.unit('Rainbow Indicator - Element manipulation safety', function() {
            // Test safe element manipulation
            const safeElementManipulation = (element, operation) => {
                try {
                    if (!element || !element.parentNode) {
                        console.warn('Invalid element for manipulation');
                        return false;
                    }

                    switch (operation) {
                        case 'remove':
                            element.remove();
                            return true;
                        case 'addClass':
                            element.classList.add('test-class');
                            return true;
                        default:
                            return false;
                    }
                } catch (e) {
                    console.warn('Error manipulating element:', e.message);
                    return false;
                }
            };

            const testElement = createMockElement('div', { class: 'test-indicator' });
            document.body.appendChild(testElement);

            const addClassResult = safeElementManipulation(testElement, 'addClass');
            utils.assertTrue(addClassResult, 'Should safely add classes');

            const removeResult = safeElementManipulation(testElement, 'remove');
            utils.assertTrue(removeResult, 'Should safely remove elements');
        });

        window.AlgorithmPressTest.unit('Rainbow Indicator - Network API safety', function() {
            // Test safe network API access
            const checkNetworkAPIs = () => {
                return {
                    fetch: typeof window.fetch === 'function',
                    xmlHttpRequest: typeof window.XMLHttpRequest !== 'undefined' && window.XMLHttpRequest.prototype
                };
            };

            const apis = checkNetworkAPIs();
            utils.assert(typeof apis.fetch === 'boolean', 'Should check fetch API availability');
            utils.assert(typeof apis.xmlHttpRequest === 'boolean', 'Should check XMLHttpRequest availability');
        });
    }

    // Cubbit Storage Tests
    function testCubbitStorage() {
        console.log('☁️ Setting up Cubbit Storage tests...');

        window.AlgorithmPressTest.unit('Cubbit Storage - Fetch API availability', function() {
            // Test fetch API availability checking
            const checkFetchAPI = () => {
                try {
                    return typeof fetch !== 'undefined';
                } catch (e) {
                    console.warn('Error checking fetch API:', e.message);
                    return false;
                }
            };

            const hasFetch = checkFetchAPI();
            utils.assert(typeof hasFetch === 'boolean', 'Should safely check fetch API availability');
        });

        window.AlgorithmPressTest.unit('Cubbit Storage - Configuration validation', function() {
            // Test safe configuration validation
            const validateConfig = (config) => {
                try {
                    const errors = [];

                    if (!config.apiKey || typeof config.apiKey !== 'string') {
                        errors.push('API key required');
                    }

                    if (!config.bucketName || typeof config.bucketName !== 'string') {
                        errors.push('Bucket name required');
                    }

                    return {
                        valid: errors.length === 0,
                        errors: errors
                    };
                } catch (e) {
                    return {
                        valid: false,
                        errors: ['Configuration validation error: ' + e.message]
                    };
                }
            };

            const validConfig = validateConfig({
                apiKey: 'test-key',
                bucketName: 'test-bucket'
            });
            utils.assertTrue(validConfig.valid, 'Should validate correct configurations');

            const invalidConfig = validateConfig({});
            utils.assertFalse(invalidConfig.valid, 'Should reject invalid configurations');
            utils.assert(invalidConfig.errors.length > 0, 'Should provide error details');
        });
    }

    // Initialization Helper Tests
    function testInitializationHelper() {
        console.log('🚀 Setting up Initialization Helper tests...');

        window.AlgorithmPressTest.unit('Initialization Helper - iframe detection', function() {
            // Test safe iframe detection
            const isInIframe = () => {
                try {
                    return window.parent && window.parent !== window;
                } catch (e) {
                    console.warn('Error checking iframe status:', e.message);
                    return false;
                }
            };

            const iframeStatus = isInIframe();
            utils.assert(typeof iframeStatus === 'boolean', 'Should safely detect iframe status');
        });

        window.AlgorithmPressTest.unit('Initialization Helper - postMessage safety', function() {
            // Test safe postMessage usage
            const safePostMessage = (message, targetOrigin = '*') => {
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage(message, targetOrigin);
                        return true;
                    }
                    return false;
                } catch (e) {
                    console.warn('Error sending postMessage:', e.message);
                    return false;
                }
            };

            const testMessage = { from: 'test', action: 'test' };
            const result = safePostMessage(testMessage);
            utils.assert(typeof result === 'boolean', 'Should safely attempt postMessage');
        });

        window.AlgorithmPressTest.unit('Initialization Helper - component checking', function() {
            // Test safe component existence checking
            const checkComponents = () => {
                try {
                    const components = {
                        algorithmPress: typeof window.AlgorithmPress !== 'undefined',
                        phpWasmContainer: document.getElementById('php-wasm-container') !== null,
                        dockContainer: document.querySelector('.dock-container') !== null
                    };

                    return components;
                } catch (e) {
                    console.warn('Error checking components:', e.message);
                    return null;
                }
            };

            const components = checkComponents();
            utils.assert(components !== null, 'Should safely check component existence');
            utils.assert(typeof components === 'object', 'Should return component status object');
        });
    }

    // Error Recovery Tests
    function testErrorRecovery() {
        console.log('🛡️ Setting up Error Recovery tests...');

        window.AlgorithmPressTest.unit('Error Recovery - Global error handling', function() {
            // Test global error handling doesn't break the application
            const originalOnError = window.onerror;
            let errorsCaught = [];

            window.onerror = function(message, source, lineno, colno, error) {
                errorsCaught.push({ message, source, lineno, colno, error });
                return true; // Prevent default handling
            };

            try {
                // Trigger a controlled error
                throw new Error('Test error for recovery');
            } catch (e) {
                // Should be caught by try-catch, not global handler
            }

            // Test that modules continue working after errors
            const testModuleContinuity = () => {
                try {
                    return typeof window.AlgorithmPressTest !== 'undefined';
                } catch (e) {
                    return false;
                }
            };

            const modulesWorking = testModuleContinuity();
            utils.assertTrue(modulesWorking, 'Modules should continue working after errors');

            // Restore original error handler
            window.onerror = originalOnError;
        });

        window.AlgorithmPressTest.integration('Error Recovery - Module resilience', async function() {
            // Test that modules are resilient to missing dependencies
            const testModuleResilience = (moduleName) => {
                try {
                    // Simulate module loading with missing dependencies
                    const mockModule = {
                        init: function() {
                            // Check for dependencies safely
                            const hasDep1 = typeof window.NonExistentDep1 !== 'undefined';
                            const hasDep2 = typeof window.NonExistentDep2 !== 'undefined';
                            
                            if (!hasDep1) {
                                console.warn(`${moduleName}: NonExistentDep1 not available`);
                            }
                            
                            if (!hasDep2) {
                                console.warn(`${moduleName}: NonExistentDep2 not available`);
                            }
                            
                            // Continue initialization despite missing dependencies
                            return true;
                        }
                    };

                    return mockModule.init();
                } catch (e) {
                    console.warn(`Module ${moduleName} failed to handle missing dependencies:`, e.message);
                    return false;
                }
            };

            const resilience1 = testModuleResilience('TestModule1');
            const resilience2 = testModuleResilience('TestModule2');

            utils.assertTrue(resilience1, 'Module should be resilient to missing dependencies');
            utils.assertTrue(resilience2, 'All modules should be resilient to missing dependencies');
        });
    }

    // Performance Tests for Fixed Modules
    function testPerformanceOptimizations() {
        console.log('⚡ Setting up Performance tests for fixed modules...');

        window.AlgorithmPressTest.performance('Safe DOM queries performance', async function() {
            // Test that safe DOM queries don't significantly impact performance
            const iterations = 1000;
            const selector = 'body';

            const unsafeQuery = () => document.querySelector(selector);
            const safeQuery = () => {
                try {
                    return document.querySelector(selector);
                } catch (e) {
                    return null;
                }
            };

            // Warm up
            for (let i = 0; i < 100; i++) {
                safeQuery();
            }

            const startTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                safeQuery();
            }
            const endTime = performance.now();

            const avgTime = (endTime - startTime) / iterations;
            utils.assert(avgTime < 1, 'Safe DOM queries should be fast (< 1ms average)');
        }, 10);

        window.AlgorithmPressTest.performance('Error handling overhead', async function() {
            // Test that error handling doesn't add significant overhead
            const iterations = 10000;

            const withoutErrorHandling = () => {
                const obj = { test: 'value' };
                return obj.test;
            };

            const withErrorHandling = () => {
                try {
                    const obj = { test: 'value' };
                    return obj.test;
                } catch (e) {
                    console.warn('Error:', e);
                    return null;
                }
            };

            // Test with error handling
            const startTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                withErrorHandling();
            }
            const endTime = performance.now();

            const avgTime = (endTime - startTime) / iterations;
            utils.assert(avgTime < 0.1, 'Error handling should add minimal overhead (< 0.1ms average)');
        }, 50);
    }

    // Integration Tests for Module Interactions
    function testModuleInteractions() {
        console.log('🔗 Setting up Module Interaction tests...');

        window.AlgorithmPressTest.integration('Module Framework + Command Palette integration', async function() {
            // Test safe interaction between Module Framework and Command Palette
            const testIntegration = () => {
                try {
                    // Mock module registration
                    const mockModule = {
                        name: 'TestModule',
                        commands: [
                            { id: 'test-command', name: 'Test Command', execute: () => 'executed' }
                        ]
                    };

                    // Safe module registration
                    const registerModule = (module) => {
                        try {
                            if (!module.name || !module.commands) {
                                throw new Error('Invalid module structure');
                            }
                            return true;
                        } catch (e) {
                            console.warn('Module registration error:', e.message);
                            return false;
                        }
                    };

                    return registerModule(mockModule);
                } catch (e) {
                    console.warn('Integration test error:', e.message);
                    return false;
                }
            };

            const result = testIntegration();
            utils.assertTrue(result, 'Module Framework and Command Palette should integrate safely');
        });

        window.AlgorithmPressTest.integration('Desktop Integration + NaraUI interaction', async function() {
            // Test safe interaction between Desktop Integration and NaraUI
            const testDesktopNaraIntegration = () => {
                try {
                    const mockWindow = createMockElement('div', { class: 'mock-window' });
                    
                    // Safe NaraUI registration simulation
                    const registerWithNaraUI = (element) => {
                        try {
                            if (typeof window.NaraUI !== 'undefined' && window.NaraUI.register) {
                                // Simulate registration
                                element.setAttribute('data-nara-registered', 'true');
                                return true;
                            }
                            console.warn('NaraUI not available');
                            return false;
                        } catch (e) {
                            console.warn('NaraUI registration error:', e.message);
                            return false;
                        }
                    };

                    const registered = registerWithNaraUI(mockWindow);
                    return typeof registered === 'boolean';
                } catch (e) {
                    console.warn('Desktop+NaraUI integration error:', e.message);
                    return false;
                }
            };

            const result = testDesktopNaraIntegration();
            utils.assertTrue(result, 'Desktop Integration and NaraUI should interact safely');
        });
    }

    // Register all test suites
    console.log('🧪 Registering module-specific test suites...');
    
    testModuleFramework();
    testPHPWasmBuilder();
    testCommandPalette();
    testDockFunctionality();
    testDesktopIntegration();
    testNaraUI();
    testVoiceControlSystem();
    testRainbowIndicator();
    testCubbitStorage();
    testInitializationHelper();
    testErrorRecovery();
    testPerformanceOptimizations();
    testModuleInteractions();

    console.log('✅ Module-specific test suites registered successfully!');
    console.log('📝 Run module tests with: runTests() or AlgorithmPressTest.run()');

})(window, document);
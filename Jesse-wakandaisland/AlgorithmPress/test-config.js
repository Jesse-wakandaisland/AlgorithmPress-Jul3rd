/**
 * AlgorithmPress Test Configuration
 * Central configuration for all testing aspects
 */

(function(window) {
    'use strict';

    // Test configuration
    window.AlgorithmPressTestConfig = {
        // Test environment settings
        environment: {
            isDevelopment: !window.location.href.includes('production'),
            baseUrl: window.location.origin,
            testDataPath: '/test-data/',
            allowMockData: true,
            enableDebugLogging: true
        },

        // Test execution settings
        execution: {
            defaultTimeout: 5000,
            performanceTimeout: 10000,
            integrationTimeout: 15000,
            maxRetries: 3,
            stopOnFirstFailure: false,
            parallelExecution: false,
            enableCodeCoverage: false
        },

        // Module-specific test settings
        modules: {
            'module-framework': {
                enabled: true,
                timeout: 3000,
                mockDependencies: ['PHPWasmIntegration', 'CubbitStorage'],
                testData: {
                    validModules: ['TestModule1', 'TestModule2'],
                    invalidModules: ['InvalidModule', null, undefined]
                }
            },
            'php-wasm-builder': {
                enabled: true,
                timeout: 5000,
                mockDependencies: ['bootstrap', 'PHPWasmIntegration'],
                testData: {
                    validContainers: ['php-wasm-container', 'builder-container'],
                    invalidContainers: ['non-existent', '']
                }
            },
            'command-palette': {
                enabled: true,
                timeout: 3000,
                mockDependencies: ['DesktopIntegration', 'NaraUI', 'AlgorithmPressDock'],
                testData: {
                    validCommands: [
                        { id: 'test-cmd', name: 'Test Command', execute: () => 'test' },
                        { id: 'another-cmd', name: 'Another Command', execute: () => true }
                    ],
                    invalidCommands: [
                        { id: '', name: 'Empty ID' },
                        { name: 'No ID' },
                        null
                    ]
                }
            },
            'dock-functionality': {
                enabled: true,
                timeout: 4000,
                mockDependencies: ['VoiceControlSystem', 'NexusGrid', 'RainbowIndicator'],
                testData: {
                    validModules: ['voice-control', 'nexus-grid', 'rainbow'],
                    invalidModules: ['non-existent-module', '']
                }
            },
            'desktop-integration': {
                enabled: true,
                timeout: 6000,
                mockDependencies: ['NaraUI', 'WordPressConnector'],
                testData: {
                    validWindows: [
                        { title: 'Test Window', content: '<p>Test</p>' },
                        { title: 'Another Window', content: document.createElement('div') }
                    ],
                    invalidWindows: [
                        { title: '', content: 'Empty title' },
                        { content: 'No title' },
                        null
                    ]
                }
            },
            'nara-ui': {
                enabled: true,
                timeout: 4000,
                mockDependencies: [],
                testData: {
                    validCanvasIds: ['desktop-background-canvas', 'background-canvas'],
                    invalidCanvasIds: ['non-existent-canvas', ''],
                    validElements: [
                        document.createElement('div'),
                        document.createElement('button')
                    ]
                }
            },
            'voice-control-system': {
                enabled: true,
                timeout: 5000,
                mockDependencies: ['SpeechRecognition', 'webkitSpeechRecognition'],
                testData: {
                    validCommands: [
                        'go to components',
                        'save project',
                        'show preview'
                    ],
                    invalidCommands: [
                        '',
                        'unknown command',
                        'invalid syntax here'
                    ]
                }
            },
            'rainbow-indicator': {
                enabled: true,
                timeout: 3000,
                mockDependencies: ['IntersectionObserver', 'MutationObserver'],
                testData: {
                    validElements: [
                        document.createElement('div'),
                        document.createElement('button')
                    ],
                    validOptions: [
                        { useIntersectionObserver: true },
                        { duration: 2000 }
                    ]
                }
            },
            'cubbit-storage': {
                enabled: true,
                timeout: 8000,
                mockDependencies: ['fetch'],
                testData: {
                    validConfigs: [
                        { apiKey: 'test-key', bucketName: 'test-bucket' },
                        { apiKey: 'another-key', bucketName: 'another-bucket', baseUrl: 'https://test.api' }
                    ],
                    invalidConfigs: [
                        { apiKey: '', bucketName: 'test' },
                        { apiKey: 'test', bucketName: '' },
                        {}
                    ]
                }
            },
            'initialization-helper': {
                enabled: true,
                timeout: 4000,
                mockDependencies: [],
                testData: {
                    validComponents: ['AlgorithmPress', 'php-wasm-container', 'dock-container'],
                    invalidComponents: ['non-existent-component', '']
                }
            }
        },

        // Performance benchmarks
        performance: {
            domQueryThreshold: 1, // ms
            errorHandlingOverhead: 0.1, // ms
            moduleInitialization: 100, // ms
            apiCallTimeout: 5000, // ms
            memoryLeakThreshold: 10, // MB
            fpsThreshold: 30 // frames per second
        },

        // Security test settings
        security: {
            xssTestStrings: [
                '<script>alert("xss")</script>',
                'javascript:alert("xss")',
                '<img src="x" onerror="alert(1)">',
                '"><script>alert("xss")</script>',
                '\'\';!--"<XSS>=&{()}'
            ],
            sqlInjectionStrings: [
                "'; DROP TABLE users; --",
                "' OR '1'='1",
                "' UNION SELECT * FROM users --",
                "admin'; --",
                "' OR 1=1 --"
            ],
            sensitiveDataPatterns: [
                /api[_-]?key/i,
                /password/i,
                /secret/i,
                /token/i,
                /credential/i
            ]
        },

        // Accessibility standards
        accessibility: {
            wcagLevel: 'AA',
            contrastRatio: 4.5,
            requiredAriaAttributes: [
                'aria-label',
                'aria-labelledby',
                'aria-describedby',
                'role'
            ],
            keyboardNavigation: {
                requiredElements: ['button', 'a', 'input', 'select', 'textarea'],
                tabIndexThreshold: 0
            }
        },

        // Test data generators
        generators: {
            // Generate random string
            randomString: (length = 10) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
            },

            // Generate random DOM element
            randomElement: (tag = 'div') => {
                const element = document.createElement(tag);
                element.id = 'test-' + this.randomString(8);
                element.className = 'test-element';
                return element;
            },

            // Generate mock API response
            mockApiResponse: (success = true, data = {}) => ({
                ok: success,
                status: success ? 200 : 400,
                json: () => Promise.resolve(success ? data : { error: 'Mock error' }),
                text: () => Promise.resolve(JSON.stringify(success ? data : { error: 'Mock error' }))
            }),

            // Generate performance metrics
            mockPerformanceMetrics: () => ({
                timestamp: Date.now(),
                usedJSHeapSize: Math.floor(Math.random() * 50000000),
                totalJSHeapSize: Math.floor(Math.random() * 100000000),
                jsHeapSizeLimit: 2147483648,
                loadTime: Math.random() * 1000,
                domInteractive: Math.random() * 500,
                domComplete: Math.random() * 800
            })
        },

        // Mock implementations
        mocks: {
            // Mock localStorage
            createMockStorage: () => {
                const storage = {};
                return {
                    getItem: (key) => storage[key] || null,
                    setItem: (key, value) => { storage[key] = String(value); },
                    removeItem: (key) => { delete storage[key]; },
                    clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
                    get length() { return Object.keys(storage).length; },
                    key: (index) => Object.keys(storage)[index] || null
                };
            },

            // Mock fetch API
            createMockFetch: (responses = {}) => {
                return function mockFetch(url, options = {}) {
                    const response = responses[url] || { ok: true, status: 200, data: {} };
                    
                    return Promise.resolve({
                        ok: response.ok,
                        status: response.status,
                        statusText: response.ok ? 'OK' : 'Error',
                        json: () => Promise.resolve(response.data),
                        text: () => Promise.resolve(JSON.stringify(response.data)),
                        headers: new Map()
                    });
                };
            },

            // Mock WebAPI interfaces
            createMockWebAPIs: () => ({
                IntersectionObserver: class MockIntersectionObserver {
                    constructor(callback, options) {
                        this.callback = callback;
                        this.options = options;
                    }
                    observe() {}
                    unobserve() {}
                    disconnect() {}
                },

                MutationObserver: class MockMutationObserver {
                    constructor(callback) {
                        this.callback = callback;
                    }
                    observe() {}
                    disconnect() {}
                },

                SpeechRecognition: class MockSpeechRecognition {
                    constructor() {
                        this.continuous = false;
                        this.interimResults = false;
                    }
                    start() { if (this.onstart) this.onstart(); }
                    stop() { if (this.onend) this.onend(); }
                    abort() { if (this.onend) this.onend(); }
                }
            })
        },

        // Test utilities
        utils: {
            // Set up test environment
            setupTestEnvironment: () => {
                // Mock any required globals
                if (window.AlgorithmPressTestConfig.environment.allowMockData) {
                    const mocks = window.AlgorithmPressTestConfig.mocks.createMockWebAPIs();
                    
                    // Only mock if not already available
                    if (!window.IntersectionObserver) {
                        window.IntersectionObserver = mocks.IntersectionObserver;
                    }
                    if (!window.MutationObserver) {
                        window.MutationObserver = mocks.MutationObserver;
                    }
                    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
                        window.SpeechRecognition = mocks.SpeechRecognition;
                    }
                }
            },

            // Clean up test environment
            cleanupTestEnvironment: () => {
                // Remove test elements
                document.querySelectorAll('.test-element').forEach(el => el.remove());
                
                // Clear test data from localStorage
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('ap_test_') || key.startsWith('test_')) {
                        localStorage.removeItem(key);
                    }
                });
            },

            // Wait for condition with timeout
            waitForCondition: (condition, timeout = 5000, interval = 100) => {
                return new Promise((resolve, reject) => {
                    const startTime = Date.now();
                    const check = () => {
                        if (condition()) {
                            resolve();
                        } else if (Date.now() - startTime >= timeout) {
                            reject(new Error('Timeout waiting for condition'));
                        } else {
                            setTimeout(check, interval);
                        }
                    };
                    check();
                });
            },

            // Create test sandbox
            createSandbox: () => {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = 'about:blank';
                document.body.appendChild(iframe);
                
                return {
                    window: iframe.contentWindow,
                    document: iframe.contentDocument,
                    cleanup: () => iframe.remove()
                };
            },

            // Measure execution time
            measureTime: async (fn) => {
                const start = performance.now();
                const result = await fn();
                const end = performance.now();
                return {
                    result,
                    duration: end - start
                };
            },

            // Deep clone object
            deepClone: (obj) => {
                if (obj === null || typeof obj !== 'object') return obj;
                if (obj instanceof Date) return new Date(obj);
                if (obj instanceof Array) return obj.map(item => window.AlgorithmPressTestConfig.utils.deepClone(item));
                if (typeof obj === 'object') {
                    const cloned = {};
                    Object.keys(obj).forEach(key => {
                        cloned[key] = window.AlgorithmPressTestConfig.utils.deepClone(obj[key]);
                    });
                    return cloned;
                }
                return obj;
            }
        },

        // Reporting settings
        reporting: {
            formats: ['console', 'html', 'json'],
            includePerfMetrics: true,
            includeErrorDetails: true,
            includeCodeCoverage: false,
            exportPath: '/test-reports/',
            timestampFormat: 'ISO',
            detailLevel: 'verbose'
        },

        // CI/CD integration
        ci: {
            enabled: false,
            failureThreshold: 90, // percentage
            performanceThreshold: 1000, // ms
            coverageThreshold: 80, // percentage
            reportFormat: 'junit',
            notifications: {
                slack: false,
                email: false,
                webhook: false
            }
        }
    };

    // Initialize test environment on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AlgorithmPressTestConfig.utils.setupTestEnvironment();
        });
    } else {
        window.AlgorithmPressTestConfig.utils.setupTestEnvironment();
    }

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        window.AlgorithmPressTestConfig.utils.cleanupTestEnvironment();
    });

    console.log('🔧 AlgorithmPress Test Configuration loaded');

})(window);
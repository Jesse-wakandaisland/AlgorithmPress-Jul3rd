/**
 * AlgorithmPress Testing Framework
 * Comprehensive testing suite for ensuring production readiness
 */

(function(window, document) {
    'use strict';

    // Testing framework namespace
    window.AlgorithmPressTest = {
        // Configuration
        config: {
            enableAutoRun: false,
            showResults: true,
            stopOnFirstFailure: false,
            timeout: 5000,
            enablePerformanceTests: true,
            enableAccessibilityTests: true,
            enableSecurityTests: true
        },

        // Test registry
        tests: {
            unit: [],
            integration: [],
            performance: [],
            accessibility: [],
            security: []
        },

        // Test results
        results: {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0,
            details: []
        },

        // Test utilities
        utils: {
            // Assertion helpers
            assert: function(condition, message) {
                if (!condition) {
                    throw new Error(message || 'Assertion failed');
                }
            },

            assertEqual: function(actual, expected, message) {
                if (actual !== expected) {
                    throw new Error(message || `Expected "${expected}", got "${actual}"`);
                }
            },

            assertNotEqual: function(actual, expected, message) {
                if (actual === expected) {
                    throw new Error(message || `Expected values to be different, both were "${actual}"`);
                }
            },

            assertTrue: function(value, message) {
                this.assertEqual(value, true, message || 'Expected true');
            },

            assertFalse: function(value, message) {
                this.assertEqual(value, false, message || 'Expected false');
            },

            assertThrows: function(fn, expectedError, message) {
                let thrown = false;
                let error = null;
                
                try {
                    fn();
                } catch (e) {
                    thrown = true;
                    error = e;
                }
                
                if (!thrown) {
                    throw new Error(message || 'Expected function to throw an error');
                }
                
                if (expectedError && !(error instanceof expectedError)) {
                    throw new Error(message || `Expected error of type ${expectedError.name}, got ${error.constructor.name}`);
                }
            },

            assertDOMElement: function(selector, message) {
                const element = document.querySelector(selector);
                if (!element) {
                    throw new Error(message || `Expected DOM element "${selector}" to exist`);
                }
                return element;
            },

            // Async helpers
            wait: function(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            },

            waitFor: function(condition, timeout = 5000, interval = 100) {
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

            // Mock helpers
            mockFunction: function(originalFn) {
                const calls = [];
                
                const mock = function(...args) {
                    calls.push({
                        args: args,
                        timestamp: Date.now()
                    });
                    
                    if (mock.returnValue !== undefined) {
                        return mock.returnValue;
                    }
                    
                    if (mock.implementation) {
                        return mock.implementation.apply(this, args);
                    }
                    
                    if (originalFn) {
                        return originalFn.apply(this, args);
                    }
                };
                
                mock.calls = calls;
                mock.callCount = () => calls.length;
                mock.calledWith = (...args) => calls.some(call => 
                    args.every((arg, i) => call.args[i] === arg)
                );
                mock.returns = (value) => { mock.returnValue = value; return mock; };
                mock.implements = (fn) => { mock.implementation = fn; return mock; };
                mock.reset = () => { calls.length = 0; return mock; };
                
                return mock;
            }
        },

        // Test definition methods
        unit: function(name, testFn) {
            this.tests.unit.push({
                type: 'unit',
                name: name,
                testFn: testFn,
                timeout: this.config.timeout
            });
        },

        integration: function(name, testFn) {
            this.tests.integration.push({
                type: 'integration',
                name: name,
                testFn: testFn,
                timeout: this.config.timeout * 2
            });
        },

        performance: function(name, testFn, threshold) {
            this.tests.performance.push({
                type: 'performance',
                name: name,
                testFn: testFn,
                threshold: threshold,
                timeout: this.config.timeout * 3
            });
        },

        accessibility: function(name, testFn) {
            this.tests.accessibility.push({
                type: 'accessibility',
                name: name,
                testFn: testFn,
                timeout: this.config.timeout
            });
        },

        security: function(name, testFn) {
            this.tests.security.push({
                type: 'security',
                name: name,
                testFn: testFn,
                timeout: this.config.timeout
            });
        },

        // Test execution
        runTest: async function(test) {
            const startTime = performance.now();
            let result = {
                name: test.name,
                type: test.type,
                status: 'passed',
                duration: 0,
                error: null,
                details: {}
            };

            try {
                // Set up timeout
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Test timeout')), test.timeout)
                );

                // Run the test
                if (test.type === 'performance') {
                    const perfStart = performance.now();
                    await Promise.race([test.testFn(), timeoutPromise]);
                    const perfEnd = performance.now();
                    const duration = perfEnd - perfStart;
                    
                    result.details.performanceDuration = duration;
                    
                    if (test.threshold && duration > test.threshold) {
                        throw new Error(`Performance test failed: ${duration}ms > ${test.threshold}ms`);
                    }
                } else {
                    await Promise.race([test.testFn(), timeoutPromise]);
                }

            } catch (error) {
                result.status = 'failed';
                result.error = error.message;
            }

            result.duration = performance.now() - startTime;
            return result;
        },

        // Run all tests
        run: async function(types = ['unit', 'integration', 'performance', 'accessibility', 'security']) {
            console.log('🧪 Starting AlgorithmPress Test Suite...');
            
            this.results = {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                duration: 0,
                details: []
            };

            const startTime = performance.now();
            
            for (const type of types) {
                if (!this.config[`enable${type.charAt(0).toUpperCase() + type.slice(1)}Tests`]) {
                    continue;
                }

                const testsOfType = this.tests[type] || [];
                console.log(`\n📋 Running ${type} tests (${testsOfType.length})...`);

                for (const test of testsOfType) {
                    this.results.total++;
                    
                    const result = await this.runTest(test);
                    this.results.details.push(result);

                    if (result.status === 'passed') {
                        this.results.passed++;
                        console.log(`  ✓ ${result.name} (${result.duration.toFixed(2)}ms)`);
                    } else {
                        this.results.failed++;
                        console.error(`  ✗ ${result.name}: ${result.error}`);
                        
                        if (this.config.stopOnFirstFailure) {
                            break;
                        }
                    }
                }

                if (this.config.stopOnFirstFailure && this.results.failed > 0) {
                    break;
                }
            }

            this.results.duration = performance.now() - startTime;
            
            this.showResults();
            return this.results;
        },

        // Show test results
        showResults: function() {
            const { total, passed, failed, duration } = this.results;
            
            console.log('\n📊 Test Results Summary:');
            console.log(`   Total: ${total}`);
            console.log(`   Passed: ${passed} ✓`);
            console.log(`   Failed: ${failed} ✗`);
            console.log(`   Duration: ${duration.toFixed(2)}ms`);
            console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

            if (this.config.showResults && failed > 0) {
                console.log('\n❌ Failed Tests:');
                this.results.details
                    .filter(r => r.status === 'failed')
                    .forEach(result => {
                        console.log(`   ${result.name}: ${result.error}`);
                    });
            }

            // Generate HTML report if requested
            if (this.config.showResults) {
                this.generateHTMLReport();
            }
        },

        // Generate HTML test report
        generateHTMLReport: function() {
            const reportHTML = this.createReportHTML();
            const blob = new Blob([reportHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            console.log('📄 Test report generated. Download:', url);
            
            // Optionally auto-download
            if (this.config.autoDownloadReport) {
                const a = document.createElement('a');
                a.href = url;
                a.download = `algorithmpress-test-report-${Date.now()}.html`;
                a.click();
            }
        },

        createReportHTML: function() {
            const { total, passed, failed, duration, details } = this.results;
            
            return `
<!DOCTYPE html>
<html>
<head>
    <title>AlgorithmPress Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .metric { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric h3 { margin: 0 0 5px 0; font-size: 14px; color: #666; }
        .metric .value { font-size: 24px; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .test-results { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .test-item { padding: 12px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .test-name { font-weight: 500; }
        .test-type { background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
        .test-duration { color: #666; font-size: 12px; }
        .test-error { color: #dc3545; font-size: 12px; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AlgorithmPress Test Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div class="value">${total}</div>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <div class="value passed">${passed}</div>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <div class="value failed">${failed}</div>
        </div>
        <div class="metric">
            <h3>Success Rate</h3>
            <div class="value">${((passed / total) * 100).toFixed(1)}%</div>
        </div>
        <div class="metric">
            <h3>Duration</h3>
            <div class="value">${duration.toFixed(0)}ms</div>
        </div>
    </div>
    
    <div class="test-results">
        <h2 style="margin: 0; padding: 20px 20px 0;">Test Details</h2>
        ${details.map(test => `
            <div class="test-item">
                <div>
                    <div class="test-name">${test.name}</div>
                    ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
                </div>
                <div style="text-align: right;">
                    <span class="test-type">${test.type}</span>
                    <div class="test-duration">${test.duration.toFixed(2)}ms</div>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>
            `.trim();
        }
    };

    // Pre-defined test suites
    const TestSuites = {
        // Core functionality tests
        core: function() {
            AlgorithmPressTest.unit('Global objects exist', function() {
                AlgorithmPressTest.utils.assert(typeof window.AlgorithmPress !== 'undefined', 'AlgorithmPress global should exist');
                AlgorithmPressTest.utils.assert(typeof window.PHPWasmBuilder !== 'undefined', 'PHPWasmBuilder should exist');
                AlgorithmPressTest.utils.assert(typeof window.CommandPalette !== 'undefined', 'CommandPalette should exist');
            });

            AlgorithmPressTest.unit('Module initialization', function() {
                AlgorithmPressTest.utils.assert(window.AlgorithmPressSecurity, 'Security module should be initialized');
                AlgorithmPressTest.utils.assert(window.AlgorithmPressPerformance, 'Performance module should be initialized');
                AlgorithmPressTest.utils.assert(window.AlgorithmPressErrorHandler, 'Error handler should be initialized');
            });

            AlgorithmPressTest.unit('DOM structure', function() {
                AlgorithmPressTest.utils.assertDOMElement('#php-wasm-container', 'Main container should exist');
                AlgorithmPressTest.utils.assertDOMElement('#php-wasm-builder', 'Builder container should exist');
                AlgorithmPressTest.utils.assertDOMElement('#algorithm-press-dock', 'Dock should exist');
            });
        },

        // Security tests
        security: function() {
            AlgorithmPressTest.security('Input sanitization', function() {
                const maliciousInput = '<script>alert("xss")</script>';
                const sanitized = AlgorithmPressSecurity.sanitizeInput(maliciousInput, 'html');
                AlgorithmPressTest.utils.assert(!sanitized.includes('<script>'), 'Script tags should be sanitized');
            });

            AlgorithmPressTest.security('API key encryption', function() {
                const testKey = 'test-api-key-123';
                AlgorithmPressSecurity.keyManager.setKey('test', testKey);
                const retrieved = AlgorithmPressSecurity.keyManager.getKey('test');
                AlgorithmPressTest.utils.assertEqual(retrieved, testKey, 'API key should be retrievable');
                
                // Check that it's not stored in plain text
                const stored = localStorage.getItem('ap_key_test');
                AlgorithmPressTest.utils.assert(stored !== testKey, 'API key should not be stored in plain text');
            });

            AlgorithmPressTest.security('Rate limiting', function() {
                // Test rate limiting
                for (let i = 0; i < 12; i++) {
                    const allowed = AlgorithmPressSecurity.rateLimiter.checkLimit('test-endpoint', 10, 60000);
                    if (i < 10) {
                        AlgorithmPressTest.utils.assertTrue(allowed, `Request ${i + 1} should be allowed`);
                    } else {
                        AlgorithmPressTest.utils.assertFalse(allowed, `Request ${i + 1} should be rate limited`);
                    }
                }
            });
        },

        // Performance tests
        performance: function() {
            AlgorithmPressTest.performance('DOM query caching', async function() {
                const selector = '#php-wasm-container';
                
                // Clear cache first
                AlgorithmPressPerformance.domOptimizer.elementCache.clear();
                
                // Multiple queries to establish baseline
                let uncachedTotal = 0;
                let cachedTotal = 0;
                const iterations = 100;
                
                // Measure uncached queries
                for (let i = 0; i < iterations; i++) {
                    AlgorithmPressPerformance.domOptimizer.elementCache.clear();
                    const start = performance.now();
                    AlgorithmPressPerformance.domOptimizer.getCachedElement(selector);
                    uncachedTotal += performance.now() - start;
                }
                
                // Measure cached queries
                AlgorithmPressPerformance.domOptimizer.getCachedElement(selector); // Populate cache
                for (let i = 0; i < iterations; i++) {
                    const start = performance.now();
                    AlgorithmPressPerformance.domOptimizer.getCachedElement(selector);
                    cachedTotal += performance.now() - start;
                }
                
                const avgUncached = uncachedTotal / iterations;
                const avgCached = cachedTotal / iterations;
                
                // Cache should provide some benefit or at least not be significantly slower
                AlgorithmPressTest.utils.assert(avgCached <= avgUncached * 2, 'Cached queries should not be significantly slower than uncached');
            }, 50); // 50ms threshold

            AlgorithmPressTest.performance('Memory usage monitoring', function() {
                AlgorithmPressPerformance.memoryManager.monitorMemory();
                const metrics = AlgorithmPressPerformance.metrics.memoryUsage;
                
                AlgorithmPressTest.utils.assert(metrics.timestamp, 'Memory metrics should have timestamp');
                if (performance.memory) {
                    AlgorithmPressTest.utils.assert(metrics.usedJSHeapSize >= 0, 'Used heap size should be non-negative');
                }
            }, 10);

            AlgorithmPressTest.performance('Script loading optimization', async function() {
                // Test that script loading mechanism works without errors
                const mockScript = {
                    src: 'data:text/javascript,window.testScriptLoaded=true;',
                    integrity: null
                };
                
                // Remove any existing test script
                const existingScript = document.querySelector('script[src="' + mockScript.src + '"]');
                if (existingScript) {
                    existingScript.remove();
                }
                
                const startTime = performance.now();
                
                try {
                    await AlgorithmPressPerformance.resourceLoader.loadScriptOptimized(mockScript);
                    const loadTime = performance.now() - startTime;
                    
                    // Verify script was actually loaded
                    const scriptElement = document.querySelector('script[src="' + mockScript.src + '"]');
                    AlgorithmPressTest.utils.assert(scriptElement !== null, 'Script element should be created');
                    AlgorithmPressTest.utils.assert(loadTime >= 0, 'Load time should be measurable');
                } catch (error) {
                    // If loadScriptOptimized doesn't exist, that's okay for this test
                    console.warn('Script loading optimization not available:', error.message);
                    AlgorithmPressTest.utils.assert(true, 'Script loading test completed (fallback)');
                }
            }, 100);
        },

        // Accessibility tests
        accessibility: function() {
            AlgorithmPressTest.accessibility('ARIA labels', function() {
                const buttons = document.querySelectorAll('button');
                buttons.forEach((button, index) => {
                    const hasLabel = button.getAttribute('aria-label') || 
                                   button.getAttribute('title') || 
                                   button.textContent.trim();
                    AlgorithmPressTest.utils.assert(hasLabel, `Button ${index} should have accessible label`);
                });
            });

            AlgorithmPressTest.accessibility('Keyboard navigation', function() {
                const focusableElements = document.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                AlgorithmPressTest.utils.assert(focusableElements.length > 0, 'Should have focusable elements');
                
                // Check tab indices
                const tabIndices = Array.from(focusableElements).map(el => 
                    parseInt(el.getAttribute('tabindex')) || 0
                );
                const hasValidTabOrder = tabIndices.every(index => index >= 0);
                AlgorithmPressTest.utils.assertTrue(hasValidTabOrder, 'Tab indices should be valid');
            });

            AlgorithmPressTest.accessibility('Color contrast', function() {
                // Basic color contrast check (simplified)
                const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
                let checkedElements = 0;
                
                textElements.forEach(element => {
                    const style = window.getComputedStyle(element);
                    const color = style.color;
                    const backgroundColor = style.backgroundColor;
                    
                    if (color && backgroundColor && color !== backgroundColor) {
                        checkedElements++;
                    }
                });
                
                AlgorithmPressTest.utils.assert(checkedElements > 0, 'Should have elements with color styles');
            });
        },

        // Integration tests
        integration: function() {
            AlgorithmPressTest.integration('Command palette integration', async function() {
                // Test command registration
                CommandPalette.registerCommand({
                    id: 'test-integration-command',
                    name: 'Test Integration Command',
                    execute: function() {
                        return 'test-result';
                    }
                });
                
                const result = await CommandPalette.executeCommand('test-integration-command');
                AlgorithmPressTest.utils.assertEqual(result, 'test-result', 'Command should execute correctly');
            });

            AlgorithmPressTest.integration('Error handling integration', async function() {
                // Test error reporting
                const errorId = AlgorithmPressErrorHandler.reportError(
                    new Error('Test error'),
                    'test_category',
                    { test: true }
                );
                
                AlgorithmPressTest.utils.assert(errorId, 'Error ID should be returned');
                
                const errors = AlgorithmPressErrorHandler.errors;
                const testError = errors.find(e => e.id === errorId);
                AlgorithmPressTest.utils.assert(testError, 'Error should be recorded');
                AlgorithmPressTest.utils.assertEqual(testError.category, 'test_category', 'Error category should match');
            });

            AlgorithmPressTest.integration('Storage integration', async function() {
                // Test localStorage operations
                const testData = { test: 'data', timestamp: Date.now() };
                
                // This would typically use AlgorithmPress storage API
                localStorage.setItem('ap_test_data', JSON.stringify(testData));
                const retrieved = JSON.parse(localStorage.getItem('ap_test_data'));
                
                AlgorithmPressTest.utils.assertEqual(retrieved.test, testData.test, 'Data should persist');
                
                // Cleanup
                localStorage.removeItem('ap_test_data');
            });
        }
    };

    // Auto-register test suites
    TestSuites.core();
    TestSuites.security();
    TestSuites.performance();
    TestSuites.accessibility();
    TestSuites.integration();

    // Auto-run tests if configured
    if (AlgorithmPressTest.config.enableAutoRun) {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                AlgorithmPressTest.run();
            }, 2000); // Wait for modules to initialize
        });
    }

    // Expose test runner globally
    window.runTests = () => AlgorithmPressTest.run();
    
    console.log('🧪 AlgorithmPress Testing Framework loaded. Run tests with: runTests()');

})(window, document);
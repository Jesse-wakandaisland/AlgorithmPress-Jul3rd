/**
 * AlgorithmPress Performance Optimizations
 * Production-ready performance utilities and optimizations
 */

(function(window, document) {
    'use strict';

    // Performance monitoring and optimization namespace
    window.AlgorithmPressPerformance = {
        // Performance metrics
        metrics: {
            loadStartTime: performance.now(),
            scriptLoadTimes: {},
            moduleInitTimes: {},
            memoryUsage: {},
            renderTimes: {}
        },

        // Resource loading optimization
        resourceLoader: {
            // Preload critical resources
            preloadCriticalResources: function() {
                const criticalResources = [
                    { href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css', as: 'style' },
                    { href: 'https://fonts.googleapis.com/css2?family=Alegreya+Sans+SC:wght@300;400;500;700&family=Merriweather+Sans:wght@300;400;500;700&display=swap', as: 'style' },
                    { href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css', as: 'style' }
                ];

                criticalResources.forEach(resource => {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.href = resource.href;
                    link.as = resource.as;
                    link.crossOrigin = 'anonymous';
                    document.head.appendChild(link);
                });
            },

            // Lazy load non-critical scripts
            lazyLoadScripts: function(scripts) {
                return new Promise((resolve) => {
                    let loadedCount = 0;
                    const totalScripts = scripts.length;

                    if (totalScripts === 0) {
                        resolve();
                        return;
                    }

                    scripts.forEach((scriptConfig, index) => {
                        // Delay loading to prevent blocking
                        setTimeout(() => {
                            this.loadScriptOptimized(scriptConfig)
                                .then(() => {
                                    loadedCount++;
                                    if (loadedCount === totalScripts) {
                                        resolve();
                                    }
                                })
                                .catch(error => {
                                    console.warn('Script failed to load:', scriptConfig.src, error);
                                    loadedCount++;
                                    if (loadedCount === totalScripts) {
                                        resolve();
                                    }
                                });
                        }, index * 100); // Stagger loading by 100ms
                    });
                });
            },

            // Optimized script loading with caching and error handling
            loadScriptOptimized: function(config) {
                const startTime = performance.now();
                
                return new Promise((resolve, reject) => {
                    // Check if script already loaded
                    if (document.querySelector(`script[src="${config.src}"]`)) {
                        resolve();
                        return;
                    }

                    const script = document.createElement('script');
                    script.src = config.src;
                    script.async = true;
                    script.defer = true;

                    // Add integrity if provided
                    if (config.integrity) {
                        script.integrity = config.integrity;
                        script.crossOrigin = 'anonymous';
                    }

                    script.onload = () => {
                        const loadTime = performance.now() - startTime;
                        AlgorithmPressPerformance.metrics.scriptLoadTimes[config.src] = loadTime;
                        
                        // Initialize module if function provided
                        if (config.initFunction && typeof window[config.initFunction] === 'function') {
                            try {
                                window[config.initFunction]();
                            } catch (error) {
                                console.warn('Module initialization failed:', config.initFunction, error);
                            }
                        }
                        
                        resolve();
                    };

                    script.onerror = () => {
                        console.error('Failed to load script:', config.src);
                        
                        // Try fallback if provided
                        if (config.fallback) {
                            this.loadScriptOptimized(config.fallback)
                                .then(resolve)
                                .catch(reject);
                        } else {
                            reject(new Error(`Script load failed: ${config.src}`));
                        }
                    };

                    document.head.appendChild(script);
                });
            }
        },

        // DOM optimization utilities
        domOptimizer: {
            // Efficient DOM query caching
            elementCache: new Map(),
            
            getCachedElement: function(selector) {
                if (this.elementCache.has(selector)) {
                    const cached = this.elementCache.get(selector);
                    // Verify element is still in DOM
                    if (document.contains(cached)) {
                        return cached;
                    } else {
                        this.elementCache.delete(selector);
                    }
                }
                
                const element = document.querySelector(selector);
                if (element) {
                    this.elementCache.set(selector, element);
                }
                return element;
            },

            // Batch DOM operations
            batchDomOperations: function(operations) {
                const fragment = document.createDocumentFragment();
                
                operations.forEach(op => {
                    switch (op.type) {
                        case 'create':
                            const element = document.createElement(op.tag);
                            if (op.attributes) {
                                Object.keys(op.attributes).forEach(attr => {
                                    element.setAttribute(attr, op.attributes[attr]);
                                });
                            }
                            if (op.textContent) {
                                element.textContent = op.textContent;
                            }
                            fragment.appendChild(element);
                            break;
                    }
                });
                
                return fragment;
            },

            // Debounced event handlers
            debounce: function(func, wait, immediate) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        timeout = null;
                        if (!immediate) func.apply(this, args);
                    };
                    const callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(this, args);
                };
            },

            // Throttled event handlers
            throttle: function(func, limit) {
                let inThrottle;
                return function(...args) {
                    if (!inThrottle) {
                        func.apply(this, args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, limit);
                    }
                };
            }
        },

        // Memory management
        memoryManager: {
            // Clean up event listeners
            cleanupEventListeners: function() {
                // Remove orphaned event listeners
                const elements = document.querySelectorAll('[data-ap-listeners]');
                elements.forEach(element => {
                    if (!document.contains(element)) {
                        // Element was removed but listeners may still exist
                        element.removeEventListener();
                    }
                });
            },

            // Monitor memory usage
            monitorMemory: function() {
                if ('memory' in performance) {
                    const memory = performance.memory;
                    AlgorithmPressPerformance.metrics.memoryUsage = {
                        usedJSHeapSize: memory.usedJSHeapSize,
                        totalJSHeapSize: memory.totalJSHeapSize,
                        jsHeapSizeLimit: memory.jsHeapSizeLimit,
                        timestamp: Date.now()
                    };
                }
            },

            // Clear module caches periodically
            clearCaches: function() {
                // Clear DOM element cache
                AlgorithmPressPerformance.domOptimizer.elementCache.clear();
                
                // Clear other caches if they exist
                if (window.AlgorithmPressModules) {
                    Object.keys(window.AlgorithmPressModules).forEach(module => {
                        if (window.AlgorithmPressModules[module].clearCache) {
                            window.AlgorithmPressModules[module].clearCache();
                        }
                    });
                }
            }
        },

        // Render performance optimization
        renderOptimizer: {
            // Intersection Observer for lazy loading
            createIntersectionObserver: function(callback, options = {}) {
                const defaultOptions = {
                    rootMargin: '50px',
                    threshold: 0.1
                };
                
                const config = Object.assign({}, defaultOptions, options);
                
                if ('IntersectionObserver' in window) {
                    return new IntersectionObserver(callback, config);
                }
                
                // Fallback for browsers without IntersectionObserver
                return {
                    observe: (element) => {
                        // Immediately trigger callback for fallback
                        callback([{ target: element, isIntersecting: true }]);
                    },
                    unobserve: () => {},
                    disconnect: () => {}
                };
            },

            // Request Animation Frame wrapper
            optimizedAnimation: function(callback) {
                let animationId;
                let lastTime = 0;
                
                function animate(currentTime) {
                    if (currentTime - lastTime >= 16.67) { // ~60fps
                        callback(currentTime);
                        lastTime = currentTime;
                    }
                    animationId = requestAnimationFrame(animate);
                }
                
                animationId = requestAnimationFrame(animate);
                
                return () => cancelAnimationFrame(animationId);
            },

            // CSS hardware acceleration helpers
            enableHardwareAcceleration: function(element) {
                element.style.transform = 'translateZ(0)';
                element.style.willChange = 'transform';
            },

            disableHardwareAcceleration: function(element) {
                element.style.transform = '';
                element.style.willChange = '';
            }
        },

        // Performance monitoring
        monitor: {
            // Core Web Vitals tracking
            trackCoreWebVitals: function() {
                // Largest Contentful Paint
                if ('PerformanceObserver' in window) {
                    try {
                        const lcpObserver = new PerformanceObserver((list) => {
                            const entries = list.getEntries();
                            const lastEntry = entries[entries.length - 1];
                            AlgorithmPressPerformance.metrics.renderTimes.lcp = lastEntry.startTime;
                        });
                        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                        // First Input Delay
                        const fidObserver = new PerformanceObserver((list) => {
                            const entries = list.getEntries();
                            entries.forEach(entry => {
                                AlgorithmPressPerformance.metrics.renderTimes.fid = entry.processingStart - entry.startTime;
                            });
                        });
                        fidObserver.observe({ entryTypes: ['first-input'] });

                        // Cumulative Layout Shift
                        const clsObserver = new PerformanceObserver((list) => {
                            let clsValue = 0;
                            const entries = list.getEntries();
                            entries.forEach(entry => {
                                if (!entry.hadRecentInput) {
                                    clsValue += entry.value;
                                }
                            });
                            AlgorithmPressPerformance.metrics.renderTimes.cls = clsValue;
                        });
                        clsObserver.observe({ entryTypes: ['layout-shift'] });
                    } catch (error) {
                        console.warn('Performance monitoring not fully supported:', error);
                    }
                }
            },

            // Generate performance report
            generateReport: function() {
                const report = {
                    timestamp: new Date().toISOString(),
                    loadTime: performance.now() - this.metrics.loadStartTime,
                    scriptLoadTimes: this.metrics.scriptLoadTimes,
                    memoryUsage: this.metrics.memoryUsage,
                    coreWebVitals: this.metrics.renderTimes,
                    navigationTiming: performance.getEntriesByType('navigation')[0] || {},
                    resourceTiming: performance.getEntriesByType('resource').slice(-10) // Last 10 resources
                };

                return report;
            }
        },

        // Initialize all performance optimizations
        init: function() {
            console.log('Initializing AlgorithmPress Performance Optimizations...');

            // Preload critical resources
            this.resourceLoader.preloadCriticalResources();

            // Start performance monitoring
            this.monitor.trackCoreWebVitals();

            // Set up periodic memory monitoring
            setInterval(() => {
                this.memoryManager.monitorMemory();
            }, 30000); // Every 30 seconds

            // Set up periodic cache cleanup
            setInterval(() => {
                this.memoryManager.clearCaches();
            }, 300000); // Every 5 minutes

            // Monitor long tasks
            if ('PerformanceObserver' in window) {
                try {
                    const longTaskObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        entries.forEach(entry => {
                            if (entry.duration > 50) { // Tasks longer than 50ms
                                console.warn('Long task detected:', {
                                    duration: entry.duration,
                                    startTime: entry.startTime,
                                    name: entry.name
                                });
                            }
                        });
                    });
                    longTaskObserver.observe({ entryTypes: ['longtask'] });
                } catch (error) {
                    console.warn('Long task monitoring not supported:', error);
                }
            }

            console.log('AlgorithmPress Performance Optimizations initialized');
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AlgorithmPressPerformance.init();
        });
    } else {
        window.AlgorithmPressPerformance.init();
    }

})(window, document);
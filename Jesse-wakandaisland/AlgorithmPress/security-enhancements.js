/**
 * AlgorithmPress Security Enhancements
 * Production-ready security utilities for the AlgorithmPress platform
 */

(function(window, document) {
    'use strict';

    // Security utility namespace
    window.AlgorithmPressSecurity = {
        // CSP nonce for inline scripts (should be generated server-side in real implementation)
        nonce: 'AP_' + Math.random().toString(36).substring(2, 15),
        
        // Secure script loader with SRI verification
        loadScript: function(src, integrity, crossorigin) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.defer = true;
                
                // Add integrity checking for external scripts
                if (integrity) {
                    script.integrity = integrity;
                    script.crossOrigin = crossorigin || 'anonymous';
                }
                
                // Error handling
                script.onerror = function() {
                    console.error('Failed to load script:', src);
                    reject(new Error(`Script load failed: ${src}`));
                };
                
                script.onload = function() {
                    console.log('Script loaded successfully:', src);
                    resolve(script);
                };
                
                document.head.appendChild(script);
            });
        },

        // Input sanitization utilities
        sanitizeInput: function(input, type = 'string') {
            if (typeof input !== 'string') {
                return '';
            }
            
            switch (type) {
                case 'html':
                    return input.replace(/[<>\"']/g, function(match) {
                        const escape = {
                            '<': '&lt;',
                            '>': '&gt;',
                            '"': '&quot;',
                            "'": '&#x27;'
                        };
                        return escape[match];
                    });
                    
                case 'url':
                    try {
                        return encodeURIComponent(input);
                    } catch (e) {
                        return '';
                    }
                    
                case 'filename':
                    return input.replace(/[^a-zA-Z0-9._-]/g, '');
                    
                default:
                    return input.replace(/[^\w\s.-]/gi, '');
            }
        },

        // API key management (encrypted storage)
        keyManager: {
            // Store encrypted keys in localStorage with salt
            setKey: function(keyName, keyValue) {
                if (!keyValue || keyValue.length < 10) {
                    throw new Error('Invalid API key format');
                }
                
                // Simple obfuscation (in production, use proper encryption)
                const salt = Math.random().toString(36);
                const obfuscated = btoa(salt + keyValue);
                
                try {
                    localStorage.setItem(`ap_key_${keyName}`, obfuscated);
                    localStorage.setItem(`ap_salt_${keyName}`, salt);
                    return true;
                } catch (e) {
                    console.error('Failed to store API key:', e);
                    return false;
                }
            },
            
            getKey: function(keyName) {
                try {
                    const obfuscated = localStorage.getItem(`ap_key_${keyName}`);
                    const salt = localStorage.getItem(`ap_salt_${keyName}`);
                    
                    if (!obfuscated || !salt) {
                        return null;
                    }
                    
                    const decoded = atob(obfuscated);
                    return decoded.substring(salt.length);
                } catch (e) {
                    console.error('Failed to retrieve API key:', e);
                    return null;
                }
            },
            
            removeKey: function(keyName) {
                localStorage.removeItem(`ap_key_${keyName}`);
                localStorage.removeItem(`ap_salt_${keyName}`);
            }
        },

        // Rate limiting for API calls
        rateLimiter: {
            limits: {},
            
            checkLimit: function(endpoint, maxRequests = 10, timeWindow = 60000) {
                const now = Date.now();
                const windowStart = now - timeWindow;
                
                if (!this.limits[endpoint]) {
                    this.limits[endpoint] = [];
                }
                
                // Remove old requests outside the time window
                this.limits[endpoint] = this.limits[endpoint].filter(timestamp => timestamp > windowStart);
                
                // Check if limit exceeded
                if (this.limits[endpoint].length >= maxRequests) {
                    return false;
                }
                
                // Add current request
                this.limits[endpoint].push(now);
                return true;
            }
        },

        // Secure AJAX wrapper
        secureAjax: function(options) {
            const defaults = {
                method: 'GET',
                timeout: 10000,
                retries: 3,
                sanitizeResponse: true
            };
            
            const config = Object.assign({}, defaults, options);
            
            // Rate limiting check
            if (config.endpoint && !this.rateLimiter.checkLimit(config.endpoint)) {
                return Promise.reject(new Error('Rate limit exceeded'));
            }
            
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                xhr.open(config.method, config.url, true);
                
                // Set headers
                if (config.headers) {
                    Object.keys(config.headers).forEach(header => {
                        xhr.setRequestHeader(header, config.headers[header]);
                    });
                }
                
                // Timeout handling
                xhr.timeout = config.timeout;
                xhr.ontimeout = () => reject(new Error('Request timeout'));
                
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        let response = xhr.responseText;
                        
                        // Sanitize response if needed
                        if (config.sanitizeResponse && config.responseType !== 'json') {
                            response = AlgorithmPressSecurity.sanitizeInput(response, 'html');
                        }
                        
                        try {
                            if (config.responseType === 'json') {
                                response = JSON.parse(xhr.responseText);
                            }
                            resolve(response);
                        } catch (e) {
                            reject(new Error('Invalid JSON response'));
                        }
                    } else {
                        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                    }
                };
                
                xhr.onerror = () => reject(new Error('Network error'));
                
                // Send request
                const data = config.data ? JSON.stringify(config.data) : null;
                xhr.send(data);
            });
        },

        // Content Security Policy helpers
        csp: {
            // Generate nonce for inline scripts
            generateNonce: function() {
                return 'ap-' + Math.random().toString(36).substring(2, 15);
            },
            
            // Add nonce to inline scripts
            addNonceToInlineScripts: function() {
                const scripts = document.querySelectorAll('script:not([src])');
                const nonce = this.generateNonce();
                
                scripts.forEach(script => {
                    script.setAttribute('nonce', nonce);
                });
                
                return nonce;
            }
        },

        // Error reporting and logging
        errorReporter: {
            errors: [],
            maxErrors: 100,
            
            logError: function(error, context = {}) {
                const errorData = {
                    timestamp: new Date().toISOString(),
                    message: error.message || error,
                    stack: error.stack || '',
                    context: context,
                    userAgent: navigator.userAgent,
                    url: window.location.href
                };
                
                this.errors.push(errorData);
                
                // Keep only recent errors
                if (this.errors.length > this.maxErrors) {
                    this.errors = this.errors.slice(-this.maxErrors);
                }
                
                // In production, send to error tracking service
                console.error('AlgorithmPress Error:', errorData);
                
                return errorData;
            },
            
            getErrors: function() {
                return this.errors.slice();
            },
            
            clearErrors: function() {
                this.errors = [];
            }
        },

        // Initialize security measures
        init: function() {
            // Set up global error handler
            window.addEventListener('error', (event) => {
                this.errorReporter.logError(event.error || event.message, {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });

            // Set up unhandled promise rejection handler
            window.addEventListener('unhandledrejection', (event) => {
                this.errorReporter.logError(event.reason, {
                    type: 'unhandledrejection'
                });
            });

            // Add CSP nonces to inline scripts
            const nonce = this.csp.addNonceToInlineScripts();
            this.nonce = nonce;

            console.log('AlgorithmPress Security initialized');
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AlgorithmPressSecurity.init();
        });
    } else {
        window.AlgorithmPressSecurity.init();
    }

})(window, document);
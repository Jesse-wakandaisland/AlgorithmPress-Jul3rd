/**
 * AlgorithmPress Error Handling and Logging System
 * Comprehensive error management, logging, and recovery mechanisms
 */

(function(window, document) {
    'use strict';

    // Error handling and logging namespace
    window.AlgorithmPressErrorHandler = {
        // Configuration
        config: {
            maxLogEntries: 1000,
            logLevel: 'info', // 'debug', 'info', 'warn', 'error'
            enableConsoleOutput: true,
            enableLocalStorage: true,
            enableRemoteLogging: false,
            remoteEndpoint: null,
            retryAttempts: 3,
            retryDelay: 1000
        },

        // Log levels
        logLevels: {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        },

        // Error categories
        errorCategories: {
            SCRIPT_LOAD: 'script_load',
            MODULE_INIT: 'module_init',
            API_ERROR: 'api_error',
            VALIDATION: 'validation',
            STORAGE: 'storage',
            RENDER: 'render',
            NETWORK: 'network',
            SECURITY: 'security',
            PERFORMANCE: 'performance',
            USER_ACTION: 'user_action'
        },

        // Log storage
        logs: [],
        errors: [],

        // Logger methods
        logger: {
            debug: function(message, data = {}) {
                AlgorithmPressErrorHandler.log('debug', message, data);
            },

            info: function(message, data = {}) {
                AlgorithmPressErrorHandler.log('info', message, data);
            },

            warn: function(message, data = {}) {
                AlgorithmPressErrorHandler.log('warn', message, data);
            },

            error: function(message, data = {}) {
                AlgorithmPressErrorHandler.log('error', message, data);
            }
        },

        // Core logging function
        log: function(level, message, data = {}) {
            const logLevel = this.logLevels[level] || this.logLevels.info;
            const configLevel = this.logLevels[this.config.logLevel] || this.logLevels.info;

            // Check if we should log this level
            if (logLevel < configLevel) {
                return;
            }

            const logEntry = {
                timestamp: new Date().toISOString(),
                level: level,
                message: message,
                data: data,
                url: window.location.href,
                userAgent: navigator.userAgent,
                stackTrace: this.getStackTrace()
            };

            // Add to logs array
            this.logs.push(logEntry);

            // Maintain log size limit
            if (this.logs.length > this.config.maxLogEntries) {
                this.logs = this.logs.slice(-this.config.maxLogEntries);
            }

            // Console output
            if (this.config.enableConsoleOutput) {
                this.outputToConsole(logEntry);
            }

            // Local storage
            if (this.config.enableLocalStorage) {
                this.saveToLocalStorage();
            }

            // Remote logging
            if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
                this.sendToRemote(logEntry);
            }

            return logEntry;
        },

        // Error reporting and tracking
        reportError: function(error, category = 'general', context = {}) {
            const errorData = {
                id: this.generateErrorId(),
                timestamp: new Date().toISOString(),
                category: category,
                message: error.message || error.toString(),
                stack: error.stack || this.getStackTrace(),
                context: context,
                url: window.location.href,
                userAgent: navigator.userAgent,
                resolved: false
            };

            // Add to errors array
            this.errors.push(errorData);

            // Log the error
            this.log('error', `Error in ${category}: ${errorData.message}`, {
                errorId: errorData.id,
                context: context
            });

            // Trigger error recovery if applicable
            this.attemptErrorRecovery(errorData);

            return errorData.id;
        },

        // Error recovery mechanisms
        attemptErrorRecovery: function(errorData) {
            const recoveryStrategies = {
                [this.errorCategories.SCRIPT_LOAD]: this.recoverFromScriptLoad,
                [this.errorCategories.MODULE_INIT]: this.recoverFromModuleInit,
                [this.errorCategories.API_ERROR]: this.recoverFromApiError,
                [this.errorCategories.STORAGE]: this.recoverFromStorageError,
                [this.errorCategories.NETWORK]: this.recoverFromNetworkError
            };

            const strategy = recoveryStrategies[errorData.category];
            if (strategy && typeof strategy === 'function') {
                try {
                    strategy.call(this, errorData);
                } catch (recoveryError) {
                    this.log('error', 'Error recovery failed', {
                        originalError: errorData.id,
                        recoveryError: recoveryError.message
                    });
                }
            }
        },

        // Recovery strategies
        recoverFromScriptLoad: function(errorData) {
            const scriptSrc = errorData.context.scriptSrc;
            if (scriptSrc && this.hasRetryAttempts(errorData.id)) {
                setTimeout(() => {
                    this.log('info', 'Retrying script load', { script: scriptSrc });
                    this.loadScriptWithRetry(scriptSrc, errorData.id);
                }, this.config.retryDelay);
            }
        },

        recoverFromModuleInit: function(errorData) {
            const moduleName = errorData.context.module;
            if (moduleName && window.AlgorithmPressModules && window.AlgorithmPressModules[moduleName]) {
                this.log('info', 'Attempting module re-initialization', { module: moduleName });
                try {
                    if (window.AlgorithmPressModules[moduleName].init) {
                        window.AlgorithmPressModules[moduleName].init();
                        this.markErrorAsResolved(errorData.id);
                    }
                } catch (retryError) {
                    this.log('warn', 'Module re-initialization failed', {
                        module: moduleName,
                        error: retryError.message
                    });
                }
            }
        },

        recoverFromApiError: function(errorData) {
            const endpoint = errorData.context.endpoint;
            const requestData = errorData.context.requestData;
            
            if (endpoint && this.hasRetryAttempts(errorData.id)) {
                setTimeout(() => {
                    this.log('info', 'Retrying API request', { endpoint: endpoint });
                    this.retryApiRequest(endpoint, requestData, errorData.id);
                }, this.config.retryDelay);
            }
        },

        recoverFromStorageError: function(errorData) {
            try {
                // Try to clear corrupted data and reset storage
                if (errorData.context.storageType === 'localStorage') {
                    const keys = Object.keys(localStorage);
                    keys.forEach(key => {
                        if (key.startsWith('ap_')) {
                            try {
                                localStorage.removeItem(key);
                            } catch (e) {
                                // Ignore individual key removal errors
                            }
                        }
                    });
                    this.markErrorAsResolved(errorData.id);
                    this.log('info', 'Storage cleared and reset');
                }
            } catch (clearError) {
                this.log('error', 'Storage recovery failed', { error: clearError.message });
            }
        },

        recoverFromNetworkError: function(errorData) {
            // Check if network is back online
            if (navigator.onLine) {
                const request = errorData.context.request;
                if (request && this.hasRetryAttempts(errorData.id)) {
                    setTimeout(() => {
                        this.retryNetworkRequest(request, errorData.id);
                    }, this.config.retryDelay * 2); // Longer delay for network issues
                }
            }
        },

        // Utility methods
        getStackTrace: function() {
            try {
                throw new Error();
            } catch (e) {
                return e.stack || 'No stack trace available';
            }
        },

        generateErrorId: function() {
            return 'err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        },

        hasRetryAttempts: function(errorId) {
            const error = this.errors.find(e => e.id === errorId);
            if (!error) return false;
            
            error.retryCount = (error.retryCount || 0);
            return error.retryCount < this.config.retryAttempts;
        },

        markErrorAsResolved: function(errorId) {
            const error = this.errors.find(e => e.id === errorId);
            if (error) {
                error.resolved = true;
                error.resolvedAt = new Date().toISOString();
                this.log('info', 'Error marked as resolved', { errorId: errorId });
            }
        },

        // Output methods
        outputToConsole: function(logEntry) {
            const method = console[logEntry.level] || console.log;
            const style = this.getConsoleStyle(logEntry.level);
            
            if (style) {
                method(`%c[AP ${logEntry.level.toUpperCase()}] ${logEntry.message}`, style, logEntry.data);
            } else {
                method(`[AP ${logEntry.level.toUpperCase()}] ${logEntry.message}`, logEntry.data);
            }
        },

        getConsoleStyle: function(level) {
            const styles = {
                debug: 'color: #888; font-size: 11px;',
                info: 'color: #2196F3; font-weight: bold;',
                warn: 'color: #FF9800; font-weight: bold;',
                error: 'color: #F44336; font-weight: bold; background: #ffebee; padding: 2px 4px;'
            };
            return styles[level] || '';
        },

        saveToLocalStorage: function() {
            try {
                const data = {
                    logs: this.logs.slice(-100), // Keep last 100 logs
                    errors: this.errors.slice(-50), // Keep last 50 errors
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('ap_logs', JSON.stringify(data));
            } catch (e) {
                // Storage quota exceeded or other error
                console.warn('Failed to save logs to localStorage:', e);
            }
        },

        loadFromLocalStorage: function() {
            try {
                const data = localStorage.getItem('ap_logs');
                if (data) {
                    const parsed = JSON.parse(data);
                    this.logs = parsed.logs || [];
                    this.errors = parsed.errors || [];
                    this.log('info', 'Logs loaded from localStorage', {
                        logCount: this.logs.length,
                        errorCount: this.errors.length
                    });
                }
            } catch (e) {
                console.warn('Failed to load logs from localStorage:', e);
                this.logs = [];
                this.errors = [];
            }
        },

        sendToRemote: function(logEntry) {
            if (!this.config.remoteEndpoint) return;

            fetch(this.config.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            }).catch(error => {
                // Don't log remote logging errors to avoid infinite loops
                console.warn('Remote logging failed:', error);
            });
        },

        // User notification system
        notifyUser: function(message, type = 'info', duration = 5000) {
            const notification = document.createElement('div');
            notification.className = `ap-notification ap-notification-${type}`;
            notification.innerHTML = `
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="ap-notification-close">&times;</button>
            `;

            // Styles
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${this.getNotificationColor(type)};
                color: white;
                padding: 12px 16px;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 400px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                transition: transform 0.3s ease, opacity 0.3s ease;
                transform: translateX(100%);
                opacity: 0;
            `;

            // Close button styles
            const closeBtn = notification.querySelector('.ap-notification-close');
            closeBtn.style.cssText = `
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: auto;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            document.body.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
                notification.style.opacity = '1';
            }, 10);

            // Auto dismiss
            const dismissTimer = setTimeout(() => {
                this.dismissNotification(notification);
            }, duration);

            // Manual dismiss
            closeBtn.addEventListener('click', () => {
                clearTimeout(dismissTimer);
                this.dismissNotification(notification);
            });

            return notification;
        },

        dismissNotification: function(notification) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        },

        getNotificationIcon: function(type) {
            const icons = {
                info: 'info-circle',
                warn: 'exclamation-triangle',
                error: 'times-circle',
                success: 'check-circle'
            };
            return icons[type] || 'info-circle';
        },

        getNotificationColor: function(type) {
            const colors = {
                info: '#2196F3',
                warn: '#FF9800',
                error: '#F44336',
                success: '#4CAF50'
            };
            return colors[type] || '#2196F3';
        },

        // Public API
        getErrorReport: function() {
            return {
                timestamp: new Date().toISOString(),
                totalErrors: this.errors.length,
                unresolvedErrors: this.errors.filter(e => !e.resolved).length,
                errorsByCategory: this.getErrorsByCategory(),
                recentErrors: this.errors.slice(-10),
                systemInfo: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    timestamp: new Date().toISOString()
                }
            };
        },

        getErrorsByCategory: function() {
            const categories = {};
            this.errors.forEach(error => {
                categories[error.category] = (categories[error.category] || 0) + 1;
            });
            return categories;
        },

        clearLogs: function() {
            this.logs = [];
            this.errors = [];
            if (this.config.enableLocalStorage) {
                localStorage.removeItem('ap_logs');
            }
            this.log('info', 'Logs and errors cleared');
        },

        // Initialize error handling system
        init: function(config = {}) {
            // Merge configuration
            Object.assign(this.config, config);

            // Load existing logs
            if (this.config.enableLocalStorage) {
                this.loadFromLocalStorage();
            }

            // Set up global error handlers
            window.addEventListener('error', (event) => {
                this.reportError(event.error || new Error(event.message), this.errorCategories.SCRIPT_LOAD, {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });

            window.addEventListener('unhandledrejection', (event) => {
                this.reportError(event.reason, 'promise_rejection', {
                    type: 'unhandledrejection'
                });
            });

            // Monitor online/offline status
            window.addEventListener('online', () => {
                this.log('info', 'Network connection restored');
            });

            window.addEventListener('offline', () => {
                this.log('warn', 'Network connection lost');
            });

            this.log('info', 'AlgorithmPress Error Handler initialized', {
                config: this.config
            });
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AlgorithmPressErrorHandler.init();
        });
    } else {
        window.AlgorithmPressErrorHandler.init();
    }

})(window, document);
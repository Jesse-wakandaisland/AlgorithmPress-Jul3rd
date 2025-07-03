/**
 * AlgorithmPress Universal Storage Provider System
 * Comprehensive storage abstraction supporting traditional cloud, Web3, and local storage
 */

(function(window, document) {
    'use strict';

    // Storage Provider Registry
    window.AlgorithmPressStorage = {
        providers: new Map(),
        activeConnections: new Map(),
        eventListeners: new Map(),
        
        // Storage provider interface specification
        providerInterface: {
            // Required methods for all providers
            connect: 'function',       // (config) => Promise<connection>
            disconnect: 'function',    // () => Promise<void>
            upload: 'function',        // (data, path, options) => Promise<result>
            download: 'function',      // (path, options) => Promise<data>
            delete: 'function',        // (path, options) => Promise<void>
            list: 'function',          // (path, options) => Promise<files[]>
            exists: 'function',        // (path) => Promise<boolean>
            getMetadata: 'function',   // (path) => Promise<metadata>
            
            // Optional methods
            createFolder: 'function',  // (path) => Promise<void>
            move: 'function',          // (from, to) => Promise<void>
            copy: 'function',          // (from, to) => Promise<void>
            getPublicUrl: 'function',  // (path) => Promise<url>
            setPermissions: 'function' // (path, permissions) => Promise<void>
        },

        // Register a new storage provider
        registerProvider: function(name, providerClass) {
            try {
                if (!name || typeof name !== 'string') {
                    throw new Error('Provider name must be a non-empty string');
                }

                if (!providerClass || typeof providerClass !== 'function') {
                    throw new Error('Provider must be a constructor function');
                }

                // Validate provider implements required interface
                const instance = new providerClass();
                const missingMethods = [];

                Object.keys(this.providerInterface).forEach(method => {
                    if (typeof instance[method] !== 'function') {
                        missingMethods.push(method);
                    }
                });

                if (missingMethods.length > 0) {
                    console.warn(`Provider ${name} missing methods: ${missingMethods.join(', ')}`);
                }

                this.providers.set(name, {
                    class: providerClass,
                    instance: null,
                    config: null,
                    status: 'registered',
                    capabilities: this._detectCapabilities(instance),
                    metadata: {
                        name: name,
                        type: instance.type || 'unknown',
                        description: instance.description || '',
                        version: instance.version || '1.0.0',
                        author: instance.author || 'Unknown',
                        icon: instance.icon || 'fas fa-cloud',
                        color: instance.color || '#666666'
                    }
                });

                this._emit('provider-registered', { name, provider: providerClass });
                console.log(`Storage provider '${name}' registered successfully`);
                return true;

            } catch (error) {
                console.error(`Failed to register storage provider '${name}':`, error);
                return false;
            }
        },

        // Connect to a storage provider
        connect: async function(providerName, config = {}) {
            try {
                if (!this.providers.has(providerName)) {
                    throw new Error(`Provider '${providerName}' not found`);
                }

                const provider = this.providers.get(providerName);
                
                // Create new instance if needed
                if (!provider.instance) {
                    provider.instance = new provider.class();
                }

                // Connect to the provider
                provider.status = 'connecting';
                const connection = await provider.instance.connect(config);
                
                provider.config = config;
                provider.status = 'connected';
                provider.lastConnected = new Date();

                this.activeConnections.set(providerName, {
                    provider: provider.instance,
                    config: config,
                    connection: connection,
                    connectedAt: new Date()
                });

                this._emit('provider-connected', { name: providerName, connection });
                console.log(`Connected to storage provider '${providerName}'`);
                return connection;

            } catch (error) {
                if (this.providers.has(providerName)) {
                    this.providers.get(providerName).status = 'error';
                }
                console.error(`Failed to connect to storage provider '${providerName}':`, error);
                throw error;
            }
        },

        // Disconnect from a storage provider
        disconnect: async function(providerName) {
            try {
                if (!this.activeConnections.has(providerName)) {
                    console.warn(`Provider '${providerName}' not connected`);
                    return;
                }

                const connection = this.activeConnections.get(providerName);
                await connection.provider.disconnect();

                this.activeConnections.delete(providerName);
                
                if (this.providers.has(providerName)) {
                    this.providers.get(providerName).status = 'disconnected';
                }

                this._emit('provider-disconnected', { name: providerName });
                console.log(`Disconnected from storage provider '${providerName}'`);

            } catch (error) {
                console.error(`Failed to disconnect from storage provider '${providerName}':`, error);
                throw error;
            }
        },

        // Upload data to a specific provider
        upload: async function(providerName, data, path, options = {}) {
            const connection = this._getConnection(providerName);
            
            try {
                this._emit('upload-start', { provider: providerName, path, size: data.length || data.size });
                const result = await connection.provider.upload(data, path, options);
                this._emit('upload-complete', { provider: providerName, path, result });
                return result;
            } catch (error) {
                this._emit('upload-error', { provider: providerName, path, error });
                throw error;
            }
        },

        // Download data from a specific provider
        download: async function(providerName, path, options = {}) {
            const connection = this._getConnection(providerName);
            
            try {
                this._emit('download-start', { provider: providerName, path });
                const data = await connection.provider.download(path, options);
                this._emit('download-complete', { provider: providerName, path, size: data.length || data.size });
                return data;
            } catch (error) {
                this._emit('download-error', { provider: providerName, path, error });
                throw error;
            }
        },

        // Delete file from a specific provider
        delete: async function(providerName, path, options = {}) {
            const connection = this._getConnection(providerName);
            
            try {
                this._emit('delete-start', { provider: providerName, path });
                await connection.provider.delete(path, options);
                this._emit('delete-complete', { provider: providerName, path });
            } catch (error) {
                this._emit('delete-error', { provider: providerName, path, error });
                throw error;
            }
        },

        // List files from a specific provider
        list: async function(providerName, path = '', options = {}) {
            const connection = this._getConnection(providerName);
            
            try {
                const files = await connection.provider.list(path, options);
                return files;
            } catch (error) {
                console.error(`Failed to list files from '${providerName}' at '${path}':`, error);
                throw error;
            }
        },

        // Get all registered providers
        getProviders: function() {
            const providerList = [];
            this.providers.forEach((provider, name) => {
                providerList.push({
                    name: name,
                    status: provider.status,
                    metadata: provider.metadata,
                    capabilities: provider.capabilities,
                    connected: this.activeConnections.has(name),
                    lastConnected: provider.lastConnected
                });
            });
            return providerList;
        },

        // Get active connections
        getActiveConnections: function() {
            const connections = [];
            this.activeConnections.forEach((connection, name) => {
                connections.push({
                    name: name,
                    connectedAt: connection.connectedAt,
                    provider: this.providers.get(name)?.metadata || {}
                });
            });
            return connections;
        },

        // Multi-provider operations
        uploadToMultiple: async function(providers, data, path, options = {}) {
            const results = {};
            const promises = providers.map(async (providerName) => {
                try {
                    results[providerName] = await this.upload(providerName, data, path, options);
                } catch (error) {
                    results[providerName] = { error: error.message };
                }
            });

            await Promise.allSettled(promises);
            return results;
        },

        // Sync between providers
        sync: async function(sourceProvider, targetProvider, path, options = {}) {
            try {
                const data = await this.download(sourceProvider, path, options);
                return await this.upload(targetProvider, data, path, options);
            } catch (error) {
                console.error(`Failed to sync '${path}' from '${sourceProvider}' to '${targetProvider}':`, error);
                throw error;
            }
        },

        // Event system
        on: function(event, callback) {
            if (!this.eventListeners.has(event)) {
                this.eventListeners.set(event, new Set());
            }
            this.eventListeners.get(event).add(callback);
        },

        off: function(event, callback) {
            if (this.eventListeners.has(event)) {
                this.eventListeners.get(event).delete(callback);
            }
        },

        // Private methods
        _getConnection: function(providerName) {
            if (!this.activeConnections.has(providerName)) {
                throw new Error(`Provider '${providerName}' not connected`);
            }
            return this.activeConnections.get(providerName);
        },

        _emit: function(event, data) {
            if (this.eventListeners.has(event)) {
                this.eventListeners.get(event).forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error in event listener for '${event}':`, error);
                    }
                });
            }
        },

        _detectCapabilities: function(instance) {
            const capabilities = {
                upload: typeof instance.upload === 'function',
                download: typeof instance.download === 'function',
                delete: typeof instance.delete === 'function',
                list: typeof instance.list === 'function',
                createFolder: typeof instance.createFolder === 'function',
                move: typeof instance.move === 'function',
                copy: typeof instance.copy === 'function',
                publicUrls: typeof instance.getPublicUrl === 'function',
                permissions: typeof instance.setPermissions === 'function',
                metadata: typeof instance.getMetadata === 'function',
                encryption: instance.supportsEncryption || false,
                versioning: instance.supportsVersioning || false,
                chunkedUpload: instance.supportsChunkedUpload || false
            };

            return capabilities;
        },

        // Initialize storage system
        initialize: function() {
            console.log('AlgorithmPress Storage System initialized');
            this._emit('storage-system-initialized', { timestamp: new Date() });
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AlgorithmPressStorage.initialize();
        });
    } else {
        window.AlgorithmPressStorage.initialize();
    }

})(window, document);
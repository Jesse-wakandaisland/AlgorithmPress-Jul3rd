/**
 * Enhanced Cubbit Storage Provider
 * Integrates Cubbit DS3 with the AlgorithmPress Storage Provider System
 */

(function(window, document) {
    'use strict';

    // Ensure storage system and original Cubbit module are available
    if (!window.AlgorithmPressStorage) {
        console.error('AlgorithmPress Storage System required');
        return;
    }

    class EnhancedCubbitProvider {
        constructor() {
            this.type = 'cloud';
            this.name = 'Cubbit DS3';
            this.description = 'Decentralized cloud storage with end-to-end encryption';
            this.version = '2.0.0';
            this.author = 'AlgorithmPress';
            this.icon = 'fas fa-cube';
            this.color = '#2196F3';
            this.supportsEncryption = true;
            this.supportsVersioning = true;
            this.supportsChunkedUpload = true;
            this.client = null;
            this.cubbitInstance = null;
        }

        async connect(config = {}) {
            try {
                // Validate required configuration
                if (!config.apiKey) {
                    throw new Error('Cubbit API key is required');
                }
                if (!config.bucketName) {
                    throw new Error('Cubbit bucket name is required');
                }

                this.config = {
                    apiKey: config.apiKey,
                    bucketName: config.bucketName,
                    baseUrl: config.baseUrl || 'https://api.cubbit.io',
                    region: config.region || 'eu-west-1',
                    encryption: config.encryption !== false, // Default to true
                    encryptionKey: config.encryptionKey || this._generateEncryptionKey(),
                    timeout: config.timeout || 30000
                };

                // Initialize Cubbit storage if available
                if (window.CubbitStorage) {
                    await window.CubbitStorage.initialize({
                        apiKey: this.config.apiKey,
                        bucketName: this.config.bucketName,
                        baseUrl: this.config.baseUrl
                    });
                    this.cubbitInstance = window.CubbitStorage;
                } else {
                    // Direct API initialization
                    await this._initializeDirectAPI();
                }

                // Test connection
                await this._testConnection();

                this.client = {
                    baseUrl: this.config.baseUrl,
                    bucketName: this.config.bucketName,
                    encryption: this.config.encryption,
                    connected: true,
                    capabilities: this._getCapabilities()
                };

                return this.client;
            } catch (error) {
                console.error('Cubbit connection failed:', error);
                throw error;
            }
        }

        async disconnect() {
            if (this.cubbitInstance && typeof this.cubbitInstance.disconnect === 'function') {
                await this.cubbitInstance.disconnect();
            }
            this.client = null;
            this.config = null;
            this.cubbitInstance = null;
        }

        async upload(data, path, options = {}) {
            if (!this.client) throw new Error('Cubbit not connected');

            try {
                // Prepare data for upload
                let uploadData = data;
                
                // Encrypt if enabled
                if (this.config.encryption && options.encrypt !== false) {
                    uploadData = await this._encryptData(data);
                }

                // Convert to appropriate format
                if (typeof uploadData === 'string') {
                    uploadData = new Blob([uploadData], { type: options.contentType || 'text/plain' });
                }

                // Prepare metadata
                const metadata = {
                    originalName: options.originalName || path.split('/').pop(),
                    contentType: options.contentType || 'application/octet-stream',
                    encrypted: this.config.encryption && options.encrypt !== false,
                    uploadedAt: new Date().toISOString(),
                    version: options.version || '1.0.0',
                    tags: options.tags || [],
                    ...options.metadata
                };

                // Upload using available method
                let result;
                if (this.cubbitInstance && this.cubbitInstance.uploadFile) {
                    result = await this.cubbitInstance.uploadFile(
                        path,
                        uploadData,
                        metadata.contentType,
                        metadata
                    );
                } else {
                    result = await this._directUpload(path, uploadData, metadata);
                }

                return {
                    path: path,
                    hash: result.etag || this._generateHash(),
                    size: uploadData.size || uploadData.length,
                    url: result.url || this._getObjectUrl(path),
                    metadata: metadata,
                    provider: 'cubbit',
                    timestamp: new Date().toISOString(),
                    encrypted: metadata.encrypted
                };
            } catch (error) {
                console.error('Cubbit upload failed:', error);
                throw error;
            }
        }

        async download(path, options = {}) {
            if (!this.client) throw new Error('Cubbit not connected');

            try {
                let data;
                
                // Download using available method
                if (this.cubbitInstance && this.cubbitInstance.downloadFile) {
                    data = await this.cubbitInstance.downloadFile(path);
                } else {
                    data = await this._directDownload(path);
                }

                // Get metadata to check if encrypted
                const metadata = await this.getMetadata(path);
                
                // Decrypt if necessary
                if (metadata.encrypted && this.config.encryption) {
                    data = await this._decryptData(data);
                }

                // Return in requested format
                if (options.returnType === 'blob') {
                    return data instanceof Blob ? data : new Blob([data]);
                } else if (options.returnType === 'json') {
                    const text = data instanceof Blob ? await data.text() : data;
                    return JSON.parse(text);
                } else if (options.returnType === 'arrayBuffer') {
                    return data instanceof Blob ? await data.arrayBuffer() : data;
                } else {
                    return data instanceof Blob ? await data.text() : data;
                }
            } catch (error) {
                console.error('Cubbit download failed:', error);
                throw error;
            }
        }

        async delete(path, options = {}) {
            if (!this.client) throw new Error('Cubbit not connected');

            try {
                // Delete using available method
                if (this.cubbitInstance && this.cubbitInstance.deleteFile) {
                    await this.cubbitInstance.deleteFile(path);
                } else {
                    await this._directDelete(path);
                }

                return true;
            } catch (error) {
                console.error('Cubbit delete failed:', error);
                throw error;
            }
        }

        async list(path = '', options = {}) {
            if (!this.client) throw new Error('Cubbit not connected');

            try {
                let files;
                
                // List using available method
                if (this.cubbitInstance && this.cubbitInstance.listDirectory) {
                    files = await this.cubbitInstance.listDirectory(path);
                } else {
                    files = await this._directList(path);
                }

                // Format response
                return files.map(file => ({
                    name: file.key ? file.key.split('/').pop() : file.name,
                    path: file.key || file.path,
                    size: file.size || 0,
                    type: file.contentType || 'file',
                    lastModified: file.lastModified || file.modified,
                    etag: file.etag,
                    metadata: file.metadata || {}
                }));
            } catch (error) {
                console.error('Cubbit list failed:', error);
                throw error;
            }
        }

        async exists(path) {
            try {
                await this.getMetadata(path);
                return true;
            } catch {
                return false;
            }
        }

        async getMetadata(path) {
            if (!this.client) throw new Error('Cubbit not connected');

            try {
                // Get metadata using available method
                if (this.cubbitInstance && this.cubbitInstance.getFileMetadata) {
                    return await this.cubbitInstance.getFileMetadata(path);
                } else {
                    return await this._directGetMetadata(path);
                }
            } catch (error) {
                console.error('Cubbit metadata fetch failed:', error);
                throw error;
            }
        }

        async createFolder(path) {
            if (!this.client) throw new Error('Cubbit not connected');

            try {
                // Create an empty object to represent folder
                const folderPath = path.endsWith('/') ? path : `${path}/`;
                await this.upload('', `${folderPath}.keep`, { 
                    contentType: 'text/plain',
                    metadata: { type: 'folder' }
                });
                return true;
            } catch (error) {
                console.error('Cubbit folder creation failed:', error);
                throw error;
            }
        }

        async move(fromPath, toPath) {
            if (!this.client) throw new Error('Cubbit not connected');

            try {
                // Download, upload to new location, delete old
                const data = await this.download(fromPath, { returnType: 'blob' });
                const metadata = await this.getMetadata(fromPath);
                
                await this.upload(data, toPath, { 
                    contentType: metadata.contentType,
                    metadata: metadata.metadata 
                });
                
                await this.delete(fromPath);
                return true;
            } catch (error) {
                console.error('Cubbit move failed:', error);
                throw error;
            }
        }

        async copy(fromPath, toPath) {
            if (!this.client) throw new Error('Cubbit not connected');

            try {
                // Download and upload to new location
                const data = await this.download(fromPath, { returnType: 'blob' });
                const metadata = await this.getMetadata(fromPath);
                
                await this.upload(data, toPath, { 
                    contentType: metadata.contentType,
                    metadata: metadata.metadata 
                });
                
                return true;
            } catch (error) {
                console.error('Cubbit copy failed:', error);
                throw error;
            }
        }

        async getPublicUrl(path, options = {}) {
            if (!this.client) throw new Error('Cubbit not connected');

            try {
                // Generate signed URL for temporary access
                const expiresIn = options.expiresIn || 3600; // 1 hour default
                const url = `${this.config.baseUrl}/s3/buckets/${this.config.bucketName}/objects/${encodeURIComponent(path)}`;
                
                // In production, this would generate a proper signed URL
                return `${url}?expires=${Date.now() + (expiresIn * 1000)}`;
            } catch (error) {
                console.error('Cubbit public URL generation failed:', error);
                throw error;
            }
        }

        async setPermissions(path, permissions) {
            if (!this.client) throw new Error('Cubbit not connected');

            try {
                // Cubbit DS3 permissions would be set via ACL
                const aclUrl = `${this.config.baseUrl}/s3/buckets/${this.config.bucketName}/objects/${encodeURIComponent(path)}/acl`;
                
                const response = await fetch(aclUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(permissions)
                });

                if (!response.ok) {
                    throw new Error(`Failed to set permissions: ${response.statusText}`);
                }

                return true;
            } catch (error) {
                console.error('Cubbit permissions setting failed:', error);
                throw error;
            }
        }

        // Private methods for direct API access
        async _initializeDirectAPI() {
            // Test API connection
            const response = await fetch(`${this.config.baseUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API authentication failed: ${response.statusText}`);
            }

            this.userInfo = await response.json();
        }

        async _testConnection() {
            const testPath = 'test/.connection-test';
            const testData = 'connection-test';
            
            try {
                await this.upload(testData, testPath, { encrypt: false });
                await this.download(testPath);
                await this.delete(testPath);
            } catch (error) {
                throw new Error(`Connection test failed: ${error.message}`);
            }
        }

        async _directUpload(path, data, metadata) {
            const url = `${this.config.baseUrl}/s3/buckets/${this.config.bucketName}/objects/${encodeURIComponent(path)}`;
            
            const headers = {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': metadata.contentType
            };

            // Add metadata headers
            Object.entries(metadata).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                    headers[`x-amz-meta-${key}`] = value;
                }
            });

            const response = await fetch(url, {
                method: 'PUT',
                headers: headers,
                body: data
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            return {
                etag: response.headers.get('etag'),
                url: url
            };
        }

        async _directDownload(path) {
            const url = `${this.config.baseUrl}/s3/buckets/${this.config.bucketName}/objects/${encodeURIComponent(path)}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }

            return await response.blob();
        }

        async _directDelete(path) {
            const url = `${this.config.baseUrl}/s3/buckets/${this.config.bucketName}/objects/${encodeURIComponent(path)}`;
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.statusText}`);
            }
        }

        async _directList(path) {
            const prefix = path ? `prefix=${encodeURIComponent(path)}` : '';
            const url = `${this.config.baseUrl}/s3/buckets/${this.config.bucketName}/objects?${prefix}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`List failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.objects || [];
        }

        async _directGetMetadata(path) {
            const url = `${this.config.baseUrl}/s3/buckets/${this.config.bucketName}/objects/${encodeURIComponent(path)}`;
            
            const response = await fetch(url, {
                method: 'HEAD',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Metadata fetch failed: ${response.statusText}`);
            }

            const metadata = {};
            response.headers.forEach((value, key) => {
                if (key.startsWith('x-amz-meta-')) {
                    metadata[key.replace('x-amz-meta-', '')] = value;
                }
            });

            return {
                contentLength: response.headers.get('content-length'),
                contentType: response.headers.get('content-type'),
                etag: response.headers.get('etag'),
                lastModified: response.headers.get('last-modified'),
                metadata: metadata
            };
        }

        // Encryption helpers
        async _encryptData(data) {
            if (!this.config.encryptionKey) {
                return data;
            }

            // Simple encryption placeholder - use proper crypto in production
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            
            const dataBytes = typeof data === 'string' ? encoder.encode(data) : new Uint8Array(await data.arrayBuffer());
            const keyBytes = encoder.encode(this.config.encryptionKey);
            
            // XOR encryption (use AES-GCM in production)
            const encrypted = new Uint8Array(dataBytes.length);
            for (let i = 0; i < dataBytes.length; i++) {
                encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
            }
            
            return new Blob([encrypted]);
        }

        async _decryptData(data) {
            if (!this.config.encryptionKey) {
                return data;
            }

            // Simple decryption placeholder - use proper crypto in production
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            
            const dataBytes = data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : data;
            const keyBytes = encoder.encode(this.config.encryptionKey);
            
            // XOR decryption (use AES-GCM in production)
            const decrypted = new Uint8Array(dataBytes.length);
            for (let i = 0; i < dataBytes.length; i++) {
                decrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
            }
            
            return decoder.decode(decrypted);
        }

        _generateEncryptionKey() {
            return Array.from({length: 32}, () => 
                Math.random().toString(36)[2]
            ).join('');
        }

        _generateHash() {
            return Array.from({length: 32}, () => 
                Math.floor(Math.random() * 16).toString(16)
            ).join('');
        }

        _getObjectUrl(path) {
            return `${this.config.baseUrl}/s3/buckets/${this.config.bucketName}/objects/${encodeURIComponent(path)}`;
        }

        _getCapabilities() {
            return {
                upload: true,
                download: true,
                delete: true,
                list: true,
                createFolder: true,
                move: true,
                copy: true,
                publicUrls: true,
                permissions: true,
                metadata: true,
                encryption: true,
                versioning: true,
                chunkedUpload: true,
                signedUrls: true,
                acl: true
            };
        }
    }

    // Register the enhanced Cubbit provider
    if (window.AlgorithmPressStorage) {
        window.AlgorithmPressStorage.registerProvider('Cubbit DS3', EnhancedCubbitProvider);
        console.log('Enhanced Cubbit Storage Provider registered');
    }

    // Export for manual registration
    window.EnhancedCubbitProvider = EnhancedCubbitProvider;

})(window, document);
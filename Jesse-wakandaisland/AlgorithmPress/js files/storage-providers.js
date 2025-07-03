/**
 * AlgorithmPress Storage Providers
 * Individual provider implementations for various storage systems
 */

(function(window, document) {
    'use strict';

    // Ensure storage system is available
    if (!window.AlgorithmPressStorage) {
        console.error('AlgorithmPress Storage System required');
        return;
    }

    // IPFS Storage Provider (Web3)
    class IPFSProvider {
        constructor() {
            this.type = 'web3';
            this.name = 'IPFS';
            this.description = 'InterPlanetary File System - Distributed storage network';
            this.version = '1.0.0';
            this.author = 'AlgorithmPress';
            this.icon = 'fab fa-ethereum';
            this.color = '#65C3F7';
            this.supportsEncryption = true;
            this.supportsVersioning = true;
            this.client = null;
        }

        async connect(config = {}) {
            try {
                // Default IPFS gateway configuration
                const defaultConfig = {
                    gateway: config.gateway || 'https://ipfs.infura.io:5001/api/v0',
                    publicGateway: config.publicGateway || 'https://ipfs.io/ipfs/',
                    timeout: config.timeout || 30000,
                    apiKey: config.apiKey || null,
                    projectId: config.projectId || null
                };

                this.config = defaultConfig;

                // Test connection
                const testResponse = await fetch(`${defaultConfig.gateway}/version`, {
                    method: 'POST',
                    headers: this._getHeaders()
                });

                if (!testResponse.ok) {
                    throw new Error(`IPFS connection failed: ${testResponse.statusText}`);
                }

                this.client = {
                    gateway: defaultConfig.gateway,
                    publicGateway: defaultConfig.publicGateway,
                    connected: true
                };

                return this.client;
            } catch (error) {
                console.error('IPFS connection failed:', error);
                throw error;
            }
        }

        async disconnect() {
            this.client = null;
            this.config = null;
        }

        async upload(data, path, options = {}) {
            if (!this.client) throw new Error('IPFS not connected');

            try {
                const formData = new FormData();
                
                if (typeof data === 'string') {
                    formData.append('file', new Blob([data], { type: 'text/plain' }), path);
                } else if (data instanceof File || data instanceof Blob) {
                    formData.append('file', data, path);
                } else {
                    formData.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }), path);
                }

                const response = await fetch(`${this.config.gateway}/add`, {
                    method: 'POST',
                    headers: this._getHeaders(false), // Don't set Content-Type for FormData
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }

                const result = await response.json();
                
                return {
                    hash: result.Hash,
                    size: result.Size,
                    path: path,
                    url: `${this.config.publicGateway}${result.Hash}`,
                    provider: 'ipfs',
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.error('IPFS upload failed:', error);
                throw error;
            }
        }

        async download(path, options = {}) {
            if (!this.client) throw new Error('IPFS not connected');

            try {
                // Path can be IPFS hash or full URL
                const hash = path.replace(/^.*\/ipfs\//, '');
                const url = `${this.config.publicGateway}${hash}`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Download failed: ${response.statusText}`);
                }

                if (options.returnType === 'blob') {
                    return await response.blob();
                } else if (options.returnType === 'json') {
                    return await response.json();
                } else {
                    return await response.text();
                }
            } catch (error) {
                console.error('IPFS download failed:', error);
                throw error;
            }
        }

        async delete(path, options = {}) {
            // IPFS is immutable, files cannot be deleted
            // We can only unpin them if we have write access
            console.warn('IPFS files are immutable and cannot be deleted');
            return false;
        }

        async list(path = '', options = {}) {
            // IPFS doesn't have traditional directory listing
            // This would require additional metadata management
            return [];
        }

        async exists(path) {
            try {
                await this.download(path, { returnType: 'blob' });
                return true;
            } catch {
                return false;
            }
        }

        async getMetadata(path) {
            if (!this.client) throw new Error('IPFS not connected');

            try {
                const hash = path.replace(/^.*\/ipfs\//, '');
                const response = await fetch(`${this.config.gateway}/object/stat?arg=${hash}`, {
                    method: 'POST',
                    headers: this._getHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Metadata fetch failed: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('IPFS metadata fetch failed:', error);
                throw error;
            }
        }

        async getPublicUrl(path) {
            const hash = path.replace(/^.*\/ipfs\//, '');
            return `${this.config.publicGateway}${hash}`;
        }

        _getHeaders(includeContentType = true) {
            const headers = {};
            
            if (this.config.apiKey && this.config.projectId) {
                headers['Authorization'] = `Basic ${btoa(`${this.config.projectId}:${this.config.apiKey}`)}`;
            }
            
            if (includeContentType) {
                headers['Content-Type'] = 'application/json';
            }
            
            return headers;
        }
    }

    // Arweave Storage Provider (Web3)
    class ArweaveProvider {
        constructor() {
            this.type = 'web3';
            this.name = 'Arweave';
            this.description = 'Permanent data storage on the Arweave blockchain';
            this.version = '1.0.0';
            this.author = 'AlgorithmPress';
            this.icon = 'fas fa-infinity';
            this.color = '#222';
            this.supportsEncryption = true;
            this.supportsVersioning = false; // Immutable
            this.client = null;
        }

        async connect(config = {}) {
            try {
                const defaultConfig = {
                    gateway: config.gateway || 'https://arweave.net',
                    timeout: config.timeout || 30000,
                    wallet: config.wallet || null // JWK wallet for uploads
                };

                this.config = defaultConfig;

                // Test connection
                const testResponse = await fetch(`${defaultConfig.gateway}/info`);
                if (!testResponse.ok) {
                    throw new Error(`Arweave connection failed: ${testResponse.statusText}`);
                }

                const info = await testResponse.json();
                this.client = {
                    gateway: defaultConfig.gateway,
                    networkInfo: info,
                    connected: true
                };

                return this.client;
            } catch (error) {
                console.error('Arweave connection failed:', error);
                throw error;
            }
        }

        async disconnect() {
            this.client = null;
            this.config = null;
        }

        async upload(data, path, options = {}) {
            if (!this.client) throw new Error('Arweave not connected');
            if (!this.config.wallet) throw new Error('Arweave wallet required for uploads');

            try {
                // Create transaction
                const transaction = await this._createTransaction(data, options);
                
                // Sign transaction (simplified - would need actual Arweave SDK)
                const signedTx = await this._signTransaction(transaction);
                
                // Submit transaction
                const response = await fetch(`${this.config.gateway}/tx`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(signedTx)
                });

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }

                const txId = signedTx.id;
                
                return {
                    transactionId: txId,
                    path: path,
                    url: `${this.config.gateway}/${txId}`,
                    provider: 'arweave',
                    timestamp: new Date().toISOString(),
                    permanent: true
                };
            } catch (error) {
                console.error('Arweave upload failed:', error);
                throw error;
            }
        }

        async download(path, options = {}) {
            if (!this.client) throw new Error('Arweave not connected');

            try {
                const txId = path.replace(/^.*\//, '');
                const url = `${this.config.gateway}/${txId}`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Download failed: ${response.statusText}`);
                }

                if (options.returnType === 'blob') {
                    return await response.blob();
                } else if (options.returnType === 'json') {
                    return await response.json();
                } else {
                    return await response.text();
                }
            } catch (error) {
                console.error('Arweave download failed:', error);
                throw error;
            }
        }

        async delete(path, options = {}) {
            // Arweave is permanent, files cannot be deleted
            console.warn('Arweave data is permanent and cannot be deleted');
            return false;
        }

        async list(path = '', options = {}) {
            // Would require GraphQL queries to Arweave's indexing service
            return [];
        }

        async exists(path) {
            try {
                await this.download(path, { returnType: 'blob' });
                return true;
            } catch {
                return false;
            }
        }

        async getMetadata(path) {
            if (!this.client) throw new Error('Arweave not connected');

            try {
                const txId = path.replace(/^.*\//, '');
                const response = await fetch(`${this.config.gateway}/tx/${txId}`);

                if (!response.ok) {
                    throw new Error(`Metadata fetch failed: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Arweave metadata fetch failed:', error);
                throw error;
            }
        }

        async getPublicUrl(path) {
            const txId = path.replace(/^.*\//, '');
            return `${this.config.gateway}/${txId}`;
        }

        async _createTransaction(data, options) {
            // Simplified transaction creation - would use Arweave SDK in production
            return {
                data: typeof data === 'string' ? data : JSON.stringify(data),
                tags: options.tags || []
            };
        }

        async _signTransaction(transaction) {
            // Simplified signing - would use wallet in production
            return {
                ...transaction,
                id: this._generateTxId(),
                signature: 'mock_signature'
            };
        }

        _generateTxId() {
            return Array.from({length: 43}, () => 
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'[
                    Math.floor(Math.random() * 64)
                ]
            ).join('');
        }
    }

    // AWS S3 Compatible Provider
    class S3CompatibleProvider {
        constructor() {
            this.type = 'cloud';
            this.name = 'S3 Compatible';
            this.description = 'AWS S3 and S3-compatible storage services';
            this.version = '1.0.0';
            this.author = 'AlgorithmPress';
            this.icon = 'fab fa-aws';
            this.color = '#FF9900';
            this.supportsEncryption = true;
            this.supportsVersioning = true;
            this.client = null;
        }

        async connect(config = {}) {
            try {
                this.config = {
                    endpoint: config.endpoint || 'https://s3.amazonaws.com',
                    region: config.region || 'us-east-1',
                    bucket: config.bucket,
                    accessKeyId: config.accessKeyId,
                    secretAccessKey: config.secretAccessKey,
                    sessionToken: config.sessionToken || null
                };

                if (!this.config.bucket || !this.config.accessKeyId || !this.config.secretAccessKey) {
                    throw new Error('S3 credentials required: bucket, accessKeyId, secretAccessKey');
                }

                // Test connection with a simple HEAD request
                const testUrl = `${this.config.endpoint}/${this.config.bucket}`;
                const headers = await this._getSignedHeaders('HEAD', '/', '');

                const response = await fetch(testUrl, {
                    method: 'HEAD',
                    headers: headers
                });

                if (!response.ok && response.status !== 404) {
                    throw new Error(`S3 connection failed: ${response.statusText}`);
                }

                this.client = {
                    endpoint: this.config.endpoint,
                    bucket: this.config.bucket,
                    connected: true
                };

                return this.client;
            } catch (error) {
                console.error('S3 connection failed:', error);
                throw error;
            }
        }

        async disconnect() {
            this.client = null;
            this.config = null;
        }

        async upload(data, path, options = {}) {
            if (!this.client) throw new Error('S3 not connected');

            try {
                const body = typeof data === 'string' ? data : 
                            data instanceof Blob ? data : 
                            JSON.stringify(data);

                const headers = await this._getSignedHeaders('PUT', `/${path}`, body);
                const url = `${this.config.endpoint}/${this.config.bucket}/${path}`;

                const response = await fetch(url, {
                    method: 'PUT',
                    headers: headers,
                    body: body
                });

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }

                return {
                    key: path,
                    bucket: this.config.bucket,
                    url: url,
                    etag: response.headers.get('etag'),
                    provider: 's3',
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.error('S3 upload failed:', error);
                throw error;
            }
        }

        async download(path, options = {}) {
            if (!this.client) throw new Error('S3 not connected');

            try {
                const headers = await this._getSignedHeaders('GET', `/${path}`, '');
                const url = `${this.config.endpoint}/${this.config.bucket}/${path}`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers
                });

                if (!response.ok) {
                    throw new Error(`Download failed: ${response.statusText}`);
                }

                if (options.returnType === 'blob') {
                    return await response.blob();
                } else if (options.returnType === 'json') {
                    return await response.json();
                } else {
                    return await response.text();
                }
            } catch (error) {
                console.error('S3 download failed:', error);
                throw error;
            }
        }

        async delete(path, options = {}) {
            if (!this.client) throw new Error('S3 not connected');

            try {
                const headers = await this._getSignedHeaders('DELETE', `/${path}`, '');
                const url = `${this.config.endpoint}/${this.config.bucket}/${path}`;

                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: headers
                });

                if (!response.ok) {
                    throw new Error(`Delete failed: ${response.statusText}`);
                }

                return true;
            } catch (error) {
                console.error('S3 delete failed:', error);
                throw error;
            }
        }

        async list(path = '', options = {}) {
            if (!this.client) throw new Error('S3 not connected');

            try {
                const prefix = path ? `prefix=${encodeURIComponent(path)}` : '';
                const headers = await this._getSignedHeaders('GET', `/?${prefix}`, '');
                const url = `${this.config.endpoint}/${this.config.bucket}?${prefix}`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers
                });

                if (!response.ok) {
                    throw new Error(`List failed: ${response.statusText}`);
                }

                const xmlText = await response.text();
                return this._parseS3ListResponse(xmlText);
            } catch (error) {
                console.error('S3 list failed:', error);
                throw error;
            }
        }

        async exists(path) {
            try {
                const headers = await this._getSignedHeaders('HEAD', `/${path}`, '');
                const url = `${this.config.endpoint}/${this.config.bucket}/${path}`;

                const response = await fetch(url, {
                    method: 'HEAD',
                    headers: headers
                });

                return response.ok;
            } catch {
                return false;
            }
        }

        async getMetadata(path) {
            if (!this.client) throw new Error('S3 not connected');

            try {
                const headers = await this._getSignedHeaders('HEAD', `/${path}`, '');
                const url = `${this.config.endpoint}/${this.config.bucket}/${path}`;

                const response = await fetch(url, {
                    method: 'HEAD',
                    headers: headers
                });

                if (!response.ok) {
                    throw new Error(`Metadata fetch failed: ${response.statusText}`);
                }

                return {
                    contentLength: response.headers.get('content-length'),
                    contentType: response.headers.get('content-type'),
                    etag: response.headers.get('etag'),
                    lastModified: response.headers.get('last-modified')
                };
            } catch (error) {
                console.error('S3 metadata fetch failed:', error);
                throw error;
            }
        }

        async getPublicUrl(path) {
            return `${this.config.endpoint}/${this.config.bucket}/${path}`;
        }

        async _getSignedHeaders(method, path, body) {
            // Simplified AWS signature - would use proper AWS SDK in production
            const headers = {
                'Host': new URL(this.config.endpoint).host,
                'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
                'Authorization': `AWS4-HMAC-SHA256 Credential=${this.config.accessKeyId}/...`
            };

            if (body && method !== 'GET' && method !== 'HEAD') {
                headers['Content-Length'] = body.length.toString();
            }

            return headers;
        }

        _parseS3ListResponse(xmlText) {
            // Simplified XML parsing - would use proper XML parser in production
            const files = [];
            const keyMatches = xmlText.match(/<Key>([^<]+)<\/Key>/g);
            
            if (keyMatches) {
                keyMatches.forEach(match => {
                    const key = match.replace(/<\/?Key>/g, '');
                    files.push({
                        key: key,
                        name: key.split('/').pop(),
                        type: 'file'
                    });
                });
            }

            return files;
        }
    }

    // Local Storage Provider (Browser)
    class LocalStorageProvider {
        constructor() {
            this.type = 'local';
            this.name = 'Browser Storage';
            this.description = 'Local browser storage using IndexedDB';
            this.version = '1.0.0';
            this.author = 'AlgorithmPress';
            this.icon = 'fas fa-hdd';
            this.color = '#28a745';
            this.supportsEncryption = false;
            this.supportsVersioning = true;
            this.db = null;
        }

        async connect(config = {}) {
            try {
                const dbName = config.database || 'AlgorithmPressStorage';
                const version = config.version || 1;

                return new Promise((resolve, reject) => {
                    const request = indexedDB.open(dbName, version);

                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => {
                        this.db = request.result;
                        this.client = { db: this.db, connected: true };
                        resolve(this.client);
                    };

                    request.onupgradeneeded = (event) => {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('files')) {
                            const store = db.createObjectStore('files', { keyPath: 'path' });
                            store.createIndex('timestamp', 'timestamp', { unique: false });
                            store.createIndex('size', 'size', { unique: false });
                        }
                    };
                });
            } catch (error) {
                console.error('Local storage connection failed:', error);
                throw error;
            }
        }

        async disconnect() {
            if (this.db) {
                this.db.close();
                this.db = null;
            }
            this.client = null;
        }

        async upload(data, path, options = {}) {
            if (!this.db) throw new Error('Local storage not connected');

            try {
                const fileData = {
                    path: path,
                    data: data,
                    size: typeof data === 'string' ? data.length : data.size || 0,
                    type: options.type || 'text/plain',
                    timestamp: new Date().toISOString(),
                    version: options.version || 1
                };

                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(['files'], 'readwrite');
                    const store = transaction.objectStore('files');
                    const request = store.put(fileData);

                    request.onsuccess = () => resolve({
                        path: path,
                        size: fileData.size,
                        provider: 'local',
                        timestamp: fileData.timestamp
                    });
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.error('Local storage upload failed:', error);
                throw error;
            }
        }

        async download(path, options = {}) {
            if (!this.db) throw new Error('Local storage not connected');

            try {
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(['files'], 'readonly');
                    const store = transaction.objectStore('files');
                    const request = store.get(path);

                    request.onsuccess = () => {
                        if (request.result) {
                            resolve(request.result.data);
                        } else {
                            reject(new Error('File not found'));
                        }
                    };
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.error('Local storage download failed:', error);
                throw error;
            }
        }

        async delete(path, options = {}) {
            if (!this.db) throw new Error('Local storage not connected');

            try {
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(['files'], 'readwrite');
                    const store = transaction.objectStore('files');
                    const request = store.delete(path);

                    request.onsuccess = () => resolve(true);
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.error('Local storage delete failed:', error);
                throw error;
            }
        }

        async list(path = '', options = {}) {
            if (!this.db) throw new Error('Local storage not connected');

            try {
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(['files'], 'readonly');
                    const store = transaction.objectStore('files');
                    const request = store.getAll();

                    request.onsuccess = () => {
                        const files = request.result
                            .filter(file => file.path.startsWith(path))
                            .map(file => ({
                                path: file.path,
                                name: file.path.split('/').pop(),
                                size: file.size,
                                type: file.type,
                                timestamp: file.timestamp
                            }));
                        resolve(files);
                    };
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.error('Local storage list failed:', error);
                throw error;
            }
        }

        async exists(path) {
            try {
                await this.download(path);
                return true;
            } catch {
                return false;
            }
        }

        async getMetadata(path) {
            if (!this.db) throw new Error('Local storage not connected');

            try {
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(['files'], 'readonly');
                    const store = transaction.objectStore('files');
                    const request = store.get(path);

                    request.onsuccess = () => {
                        if (request.result) {
                            const { data, ...metadata } = request.result;
                            resolve(metadata);
                        } else {
                            reject(new Error('File not found'));
                        }
                    };
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.error('Local storage metadata fetch failed:', error);
                throw error;
            }
        }
    }

    // Register all providers
    const StorageProviders = {
        IPFSProvider,
        ArweaveProvider,
        S3CompatibleProvider,
        LocalStorageProvider
    };

    // Auto-register providers
    Object.keys(StorageProviders).forEach(providerName => {
        const ProviderClass = StorageProviders[providerName];
        const instance = new ProviderClass();
        window.AlgorithmPressStorage.registerProvider(instance.name, ProviderClass);
    });

    // Export for manual registration
    window.AlgorithmPressStorageProviders = StorageProviders;

    console.log('AlgorithmPress Storage Providers loaded:', Object.keys(StorageProviders));

})(window, document);
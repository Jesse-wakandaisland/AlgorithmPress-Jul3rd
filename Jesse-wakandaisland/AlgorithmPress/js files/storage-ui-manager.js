/**
 * AlgorithmPress Storage Management UI
 * Comprehensive storage interface for editor and dock integration
 */

(function(window, document) {
    'use strict';

    // Ensure required dependencies
    if (!window.AlgorithmPressStorage) {
        console.error('AlgorithmPress Storage System required');
        return;
    }

    window.AlgorithmPressStorageUI = {
        // UI state management
        state: {
            currentProvider: null,
            currentPath: '',
            selectedFiles: new Set(),
            viewMode: 'grid', // 'grid' or 'list'
            sortBy: 'name', // 'name', 'date', 'size'
            sortOrder: 'asc',
            isLoading: false,
            uploadProgress: new Map(),
            showHiddenFiles: false
        },

        // UI elements cache
        elements: {
            storagePanel: null,
            providerSelector: null,
            fileExplorer: null,
            uploadArea: null,
            configModal: null,
            progressModal: null,
            contextMenu: null
        },

        // Initialize storage UI
        initialize: function() {
            try {
                this.createStorageUI();
                this.setupEventListeners();
                this.loadStorageProviders();
                
                // Integration with existing dock system
                this.integrateDockFunctionality();
                
                console.log('AlgorithmPress Storage UI initialized');
                return true;
            } catch (error) {
                console.error('Failed to initialize Storage UI:', error);
                return false;
            }
        },

        // Create main storage UI components
        createStorageUI: function() {
            // Create storage panel for dock integration
            this.elements.storagePanel = this.createStoragePanel();
            
            // Create modals
            this.elements.configModal = this.createConfigurationModal();
            this.elements.progressModal = this.createProgressModal();
            this.elements.contextMenu = this.createContextMenu();
            
            // Append to document
            document.body.appendChild(this.elements.configModal);
            document.body.appendChild(this.elements.progressModal);
            document.body.appendChild(this.elements.contextMenu);
        },

        // Create main storage panel
        createStoragePanel: function() {
            const panel = document.createElement('div');
            panel.className = 'storage-panel';
            panel.innerHTML = `
                <div class="storage-header">
                    <div class="storage-title">
                        <i class="fas fa-cloud"></i>
                        <span>Storage Manager</span>
                    </div>
                    <div class="storage-actions">
                        <button class="btn-icon" id="refresh-storage" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn-icon" id="storage-settings" title="Settings">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button class="btn-icon" id="add-provider" title="Add Provider">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <div class="provider-selector">
                    <select id="provider-select" class="form-select">
                        <option value="">Select Storage Provider</option>
                    </select>
                    <button class="btn-primary btn-sm" id="connect-provider">Connect</button>
                </div>

                <div class="storage-toolbar">
                    <div class="view-controls">
                        <button class="btn-icon view-btn active" data-view="grid" title="Grid View">
                            <i class="fas fa-th"></i>
                        </button>
                        <button class="btn-icon view-btn" data-view="list" title="List View">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                    
                    <div class="sort-controls">
                        <select id="sort-select" class="form-select form-select-sm">
                            <option value="name">Name</option>
                            <option value="date">Date</option>
                            <option value="size">Size</option>
                        </select>
                        <button class="btn-icon" id="sort-order" title="Sort Order">
                            <i class="fas fa-sort-alpha-down"></i>
                        </button>
                    </div>

                    <div class="file-actions">
                        <button class="btn-icon" id="create-folder" title="New Folder">
                            <i class="fas fa-folder-plus"></i>
                        </button>
                        <label class="btn-icon" for="file-upload" title="Upload Files">
                            <i class="fas fa-upload"></i>
                            <input type="file" id="file-upload" multiple style="display: none;">
                        </label>
                    </div>
                </div>

                <div class="breadcrumb-nav">
                    <nav aria-label="File path">
                        <ol class="breadcrumb" id="path-breadcrumb">
                            <li class="breadcrumb-item"><a href="#" data-path="">Root</a></li>
                        </ol>
                    </nav>
                </div>

                <div class="file-explorer" id="file-explorer">
                    <div class="explorer-content">
                        <div class="loading-state" style="display: none;">
                            <div class="spinner"></div>
                            <p>Loading files...</p>
                        </div>
                        
                        <div class="empty-state" style="display: none;">
                            <i class="fas fa-folder-open"></i>
                            <p>This folder is empty</p>
                            <button class="btn-primary btn-sm" id="upload-first-file">Upload Files</button>
                        </div>
                        
                        <div class="file-grid" id="file-grid"></div>
                        <div class="file-list" id="file-list" style="display: none;"></div>
                    </div>
                </div>

                <div class="storage-footer">
                    <div class="selection-info">
                        <span id="selection-count">0 items selected</span>
                    </div>
                    <div class="storage-stats">
                        <span id="storage-usage">0 KB used</span>
                    </div>
                </div>

                <div class="upload-zone" id="upload-zone" style="display: none;">
                    <div class="upload-content">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drop files here to upload</p>
                        <span class="upload-hint">or click to browse</span>
                    </div>
                </div>
            `;

            this.elements.providerSelector = panel.querySelector('#provider-select');
            this.elements.fileExplorer = panel.querySelector('#file-explorer');
            this.elements.uploadArea = panel.querySelector('#upload-zone');

            return panel;
        },

        // Create configuration modal for providers
        createConfigurationModal: function() {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'storage-config-modal';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Storage Provider Configuration</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        
                        <div class="modal-body">
                            <div class="provider-info">
                                <div class="provider-icon">
                                    <i class="fas fa-cloud" id="config-provider-icon"></i>
                                </div>
                                <div class="provider-details">
                                    <h6 id="config-provider-name">Provider Name</h6>
                                    <p id="config-provider-description">Provider description</p>
                                </div>
                            </div>

                            <form id="provider-config-form">
                                <div class="config-tabs">
                                    <ul class="nav nav-tabs" role="tablist">
                                        <li class="nav-item">
                                            <a class="nav-link active" data-bs-toggle="tab" href="#basic-config">Basic</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="tab" href="#advanced-config">Advanced</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="tab" href="#security-config">Security</a>
                                        </li>
                                    </ul>
                                </div>

                                <div class="tab-content">
                                    <div class="tab-pane active" id="basic-config">
                                        <div id="basic-config-fields"></div>
                                    </div>
                                    
                                    <div class="tab-pane" id="advanced-config">
                                        <div id="advanced-config-fields"></div>
                                    </div>
                                    
                                    <div class="tab-pane" id="security-config">
                                        <div id="security-config-fields"></div>
                                    </div>
                                </div>
                            </form>

                            <div class="connection-test" style="display: none;">
                                <div class="test-result">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <span>Testing connection...</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-outline-primary" id="test-connection">Test Connection</button>
                            <button type="button" class="btn btn-primary" id="save-provider-config">Save & Connect</button>
                        </div>
                    </div>
                </div>
            `;

            return modal;
        },

        // Create progress modal for uploads/downloads
        createProgressModal: function() {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'storage-progress-modal';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h6 class="modal-title">File Operations</h6>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        
                        <div class="modal-body">
                            <div id="progress-operations"></div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hide</button>
                            <button type="button" class="btn btn-danger" id="cancel-operations">Cancel All</button>
                        </div>
                    </div>
                </div>
            `;

            return modal;
        },

        // Create context menu for file operations
        createContextMenu: function() {
            const menu = document.createElement('div');
            menu.className = 'context-menu';
            menu.id = 'file-context-menu';
            menu.innerHTML = `
                <div class="menu-item" data-action="download">
                    <i class="fas fa-download"></i>
                    <span>Download</span>
                </div>
                <div class="menu-item" data-action="rename">
                    <i class="fas fa-edit"></i>
                    <span>Rename</span>
                </div>
                <div class="menu-item" data-action="move">
                    <i class="fas fa-cut"></i>
                    <span>Move</span>
                </div>
                <div class="menu-item" data-action="copy">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                </div>
                <div class="menu-divider"></div>
                <div class="menu-item" data-action="share">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </div>
                <div class="menu-item" data-action="properties">
                    <i class="fas fa-info-circle"></i>
                    <span>Properties</span>
                </div>
                <div class="menu-divider"></div>
                <div class="menu-item danger" data-action="delete">
                    <i class="fas fa-trash"></i>
                    <span>Delete</span>
                </div>
            `;

            return menu;
        },

        // Setup event listeners
        setupEventListeners: function() {
            // Provider management
            document.addEventListener('click', (e) => {
                if (e.target.id === 'add-provider') {
                    this.showProviderSelection();
                } else if (e.target.id === 'connect-provider') {
                    this.connectToProvider();
                } else if (e.target.id === 'refresh-storage') {
                    this.refreshCurrentProvider();
                }
            });

            // File operations
            document.addEventListener('change', (e) => {
                if (e.target.id === 'file-upload') {
                    this.handleFileUpload(e.target.files);
                } else if (e.target.id === 'provider-select') {
                    this.onProviderSelectionChange();
                }
            });

            // View controls
            document.addEventListener('click', (e) => {
                if (e.target.closest('.view-btn')) {
                    this.changeViewMode(e.target.dataset.view);
                } else if (e.target.id === 'sort-order') {
                    this.toggleSortOrder();
                }
            });

            // Drag and drop
            document.addEventListener('dragover', (e) => {
                if (this.elements.uploadArea) {
                    e.preventDefault();
                    this.showUploadZone();
                }
            });

            document.addEventListener('drop', (e) => {
                e.preventDefault();
                this.hideUploadZone();
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileUpload(e.dataTransfer.files);
                }
            });

            // Context menu
            document.addEventListener('contextmenu', (e) => {
                if (e.target.closest('.file-item')) {
                    e.preventDefault();
                    this.showContextMenu(e, e.target.closest('.file-item'));
                }
            });

            // Hide context menu on click
            document.addEventListener('click', () => {
                this.hideContextMenu();
            });

            // Storage system events
            window.AlgorithmPressStorage.on('provider-connected', (data) => {
                this.onProviderConnected(data);
            });

            window.AlgorithmPressStorage.on('upload-progress', (data) => {
                this.updateUploadProgress(data);
            });

            window.AlgorithmPressStorage.on('upload-complete', (data) => {
                this.onUploadComplete(data);
            });
        },

        // Load available storage providers
        loadStorageProviders: function() {
            const providers = window.AlgorithmPressStorage.getProviders();
            const select = this.elements.providerSelector;
            
            // Clear existing options (except first)
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }

            // Add providers
            providers.forEach(provider => {
                const option = document.createElement('option');
                option.value = provider.name;
                option.textContent = `${provider.name} (${provider.type})`;
                option.dataset.provider = JSON.stringify(provider);
                select.appendChild(option);
            });
        },

        // Show provider configuration modal
        showProviderConfiguration: function(providerName) {
            const providers = window.AlgorithmPressStorage.getProviders();
            const provider = providers.find(p => p.name === providerName);
            
            if (!provider) {
                console.error('Provider not found:', providerName);
                return;
            }

            this.populateConfigurationModal(provider);
            
            // Show modal (Bootstrap 5 syntax)
            const modal = new bootstrap.Modal(this.elements.configModal);
            modal.show();
        },

        // Populate configuration modal with provider-specific fields
        populateConfigurationModal: function(provider) {
            // Update provider info
            document.getElementById('config-provider-icon').className = provider.metadata.icon || 'fas fa-cloud';
            document.getElementById('config-provider-name').textContent = provider.metadata.name;
            document.getElementById('config-provider-description').textContent = provider.metadata.description;

            // Generate configuration fields based on provider type
            this.generateConfigFields(provider);
        },

        // Generate configuration fields for different provider types
        generateConfigFields: function(provider) {
            const basicFields = document.getElementById('basic-config-fields');
            const advancedFields = document.getElementById('advanced-config-fields');
            const securityFields = document.getElementById('security-config-fields');

            // Clear existing fields
            [basicFields, advancedFields, securityFields].forEach(container => {
                container.innerHTML = '';
            });

            // Provider-specific configurations
            switch (provider.metadata.type) {
                case 'web3':
                    this.generateWeb3Config(provider, basicFields, advancedFields, securityFields);
                    break;
                case 'cloud':
                    this.generateCloudConfig(provider, basicFields, advancedFields, securityFields);
                    break;
                case 'local':
                    this.generateLocalConfig(provider, basicFields, advancedFields, securityFields);
                    break;
                default:
                    this.generateGenericConfig(provider, basicFields, advancedFields, securityFields);
            }
        },

        // Generate Web3 provider configuration
        generateWeb3Config: function(provider, basic, advanced, security) {
            if (provider.name === 'IPFS') {
                basic.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">IPFS Gateway</label>
                        <input type="url" class="form-control" name="gateway" 
                               value="https://ipfs.infura.io:5001/api/v0" 
                               placeholder="IPFS API Gateway URL">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Public Gateway</label>
                        <input type="url" class="form-control" name="publicGateway" 
                               value="https://ipfs.io/ipfs/" 
                               placeholder="Public IPFS Gateway URL">
                    </div>
                `;

                advanced.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">Timeout (ms)</label>
                        <input type="number" class="form-control" name="timeout" value="30000">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Pin Content</label>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="pinContent" checked>
                            <label class="form-check-label">Pin uploaded content to prevent garbage collection</label>
                        </div>
                    </div>
                `;

                security.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">API Key (Optional)</label>
                        <input type="password" class="form-control" name="apiKey" placeholder="Infura API Key">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Project ID (Optional)</label>
                        <input type="text" class="form-control" name="projectId" placeholder="Infura Project ID">
                    </div>
                `;
            } else if (provider.name === 'Arweave') {
                basic.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">Arweave Gateway</label>
                        <input type="url" class="form-control" name="gateway" 
                               value="https://arweave.net" 
                               placeholder="Arweave Gateway URL">
                    </div>
                `;

                security.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">Wallet File</label>
                        <input type="file" class="form-control" name="walletFile" accept=".json">
                        <div class="form-text">Upload your Arweave wallet JSON file</div>
                    </div>
                `;
            }
        },

        // Generate Cloud provider configuration
        generateCloudConfig: function(provider, basic, advanced, security) {
            if (provider.name === 'Cubbit DS3') {
                basic.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">Bucket Name *</label>
                        <input type="text" class="form-control" name="bucketName" required 
                               placeholder="Your Cubbit bucket name">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Region</label>
                        <select class="form-select" name="region">
                            <option value="eu-west-1">EU West 1</option>
                            <option value="us-east-1">US East 1</option>
                            <option value="ap-southeast-1">AP Southeast 1</option>
                        </select>
                    </div>
                `;

                advanced.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">Base URL</label>
                        <input type="url" class="form-control" name="baseUrl" 
                               value="https://api.cubbit.io" 
                               placeholder="Cubbit API Base URL">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Timeout (ms)</label>
                        <input type="number" class="form-control" name="timeout" value="30000">
                    </div>
                `;

                security.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">API Key *</label>
                        <input type="password" class="form-control" name="apiKey" required 
                               placeholder="Your Cubbit API key">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Enable Encryption</label>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="encryption" checked>
                            <label class="form-check-label">Encrypt files before upload</label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Encryption Key (Optional)</label>
                        <input type="password" class="form-control" name="encryptionKey" 
                               placeholder="Leave empty to auto-generate">
                    </div>
                `;
            } else if (provider.name === 'S3 Compatible') {
                basic.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">Endpoint *</label>
                        <input type="url" class="form-control" name="endpoint" required 
                               placeholder="S3 endpoint URL">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Bucket Name *</label>
                        <input type="text" class="form-control" name="bucket" required 
                               placeholder="S3 bucket name">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Region</label>
                        <input type="text" class="form-control" name="region" value="us-east-1">
                    </div>
                `;

                security.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label">Access Key ID *</label>
                        <input type="text" class="form-control" name="accessKeyId" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Secret Access Key *</label>
                        <input type="password" class="form-control" name="secretAccessKey" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Session Token (Optional)</label>
                        <input type="password" class="form-control" name="sessionToken">
                    </div>
                `;
            }
        },

        // Generate Local provider configuration
        generateLocalConfig: function(provider, basic, advanced, security) {
            basic.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Database Name</label>
                    <input type="text" class="form-control" name="database" 
                           value="AlgorithmPressStorage" 
                           placeholder="IndexedDB database name">
                </div>
            `;

            advanced.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Database Version</label>
                    <input type="number" class="form-control" name="version" value="1" min="1">
                </div>
                <div class="mb-3">
                    <label class="form-label">Storage Quota</label>
                    <input type="text" class="form-control" name="quota" 
                           placeholder="e.g., 1GB (browser dependent)">
                    <div class="form-text">Browser storage quota is managed automatically</div>
                </div>
            `;

            security.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    Local storage uses browser security. Data is stored only on this device.
                </div>
            `;
        },

        // Integrate with existing dock functionality
        integrateDockFunctionality: function() {
            // Add storage option to dock if it exists
            if (window.AlgorithmPressDock && typeof window.AlgorithmPressDock.addModule === 'function') {
                window.AlgorithmPressDock.addModule({
                    id: 'storage',
                    name: 'Storage',
                    icon: 'fas fa-cloud',
                    content: this.elements.storagePanel,
                    position: 'right',
                    order: 3
                });
            }

            // Add storage menu to editor if it exists
            this.integrateEditorFunctionality();
        },

        // Integrate with editor
        integrateEditorFunctionality: function() {
            // Add storage menu to editor toolbar
            const editorToolbar = document.querySelector('.editor-toolbar, .toolbar');
            if (editorToolbar) {
                const storageButton = document.createElement('button');
                storageButton.className = 'btn btn-outline-secondary btn-sm';
                storageButton.innerHTML = '<i class="fas fa-cloud"></i> Storage';
                storageButton.onclick = () => this.toggleStoragePanel();
                
                editorToolbar.appendChild(storageButton);
            }

            // Add file import/export to editor context
            if (window.CodeMirror || window.monaco) {
                this.addEditorStorageCommands();
            }
        },

        // Add storage commands to code editor
        addEditorStorageCommands: function() {
            // Commands for file operations
            const commands = [
                {
                    name: 'saveToStorage',
                    bindKey: { win: 'Ctrl-Alt-S', mac: 'Cmd-Alt-S' },
                    exec: () => this.saveCurrentFileToStorage()
                },
                {
                    name: 'loadFromStorage',
                    bindKey: { win: 'Ctrl-Alt-O', mac: 'Cmd-Alt-O' },
                    exec: () => this.loadFileFromStorage()
                }
            ];

            // Add commands to editor if available
            if (window.ace && window.ace.editor) {
                commands.forEach(cmd => {
                    window.ace.editor.commands.addCommand(cmd);
                });
            }
        },

        // Show/hide storage panel
        toggleStoragePanel: function() {
            const panel = this.elements.storagePanel;
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
                this.refreshCurrentProvider();
            } else {
                panel.style.display = 'none';
            }
        },

        // Save current file to storage
        saveCurrentFileToStorage: async function() {
            const editor = this.getCurrentEditor();
            if (!editor) {
                alert('No active editor found');
                return;
            }

            const content = this.getEditorContent(editor);
            const filename = this.getCurrentFilename() || 'untitled.txt';

            try {
                if (this.state.currentProvider) {
                    await window.AlgorithmPressStorage.upload(
                        this.state.currentProvider,
                        content,
                        `editor/${filename}`
                    );
                    this.showNotification('File saved to storage', 'success');
                } else {
                    alert('Please connect to a storage provider first');
                }
            } catch (error) {
                console.error('Failed to save file:', error);
                this.showNotification('Failed to save file: ' + error.message, 'error');
            }
        },

        // Load file from storage
        loadFileFromStorage: function() {
            if (!this.state.currentProvider) {
                alert('Please connect to a storage provider first');
                return;
            }

            // Show file picker modal
            this.showFilePickerModal();
        },

        // Helper methods for editor integration
        getCurrentEditor: function() {
            // Support multiple editor types
            if (window.ace && window.ace.editor) {
                return window.ace.editor;
            } else if (window.monaco && window.monaco.editor) {
                return window.monaco.editor.getModels()[0];
            } else if (window.CodeMirror) {
                return document.querySelector('.CodeMirror')?.CodeMirror;
            }
            return null;
        },

        getEditorContent: function(editor) {
            if (editor.getValue) {
                return editor.getValue();
            } else if (editor.getContent) {
                return editor.getContent();
            }
            return '';
        },

        getCurrentFilename: function() {
            // Try to get filename from various sources
            const titleElement = document.querySelector('.editor-title, .file-name');
            if (titleElement) {
                return titleElement.textContent.trim();
            }
            return null;
        },

        // Show notification
        showNotification: function(message, type = 'info') {
            // Use existing notification system or create simple one
            if (window.showToast) {
                window.showToast(message, type);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        },

        // Additional UI helper methods will be implemented...
        showUploadZone: function() {
            if (this.elements.uploadArea) {
                this.elements.uploadArea.style.display = 'flex';
            }
        },

        hideUploadZone: function() {
            if (this.elements.uploadArea) {
                this.elements.uploadArea.style.display = 'none';
            }
        },

        showContextMenu: function(event, fileItem) {
            const menu = this.elements.contextMenu;
            menu.style.display = 'block';
            menu.style.left = event.pageX + 'px';
            menu.style.top = event.pageY + 'px';
            menu.dataset.file = fileItem.dataset.path;
        },

        hideContextMenu: function() {
            if (this.elements.contextMenu) {
                this.elements.contextMenu.style.display = 'none';
            }
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AlgorithmPressStorageUI.initialize();
        });
    } else {
        window.AlgorithmPressStorageUI.initialize();
    }

})(window, document);
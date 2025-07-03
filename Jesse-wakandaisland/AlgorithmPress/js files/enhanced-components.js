/**
 * AlgorithmPress Enhanced Components Library
 * Sophisticated UI components with advanced interactions
 */

(function(window, document) {
    'use strict';

    // Enhanced Components System
    window.AlgorithmPressComponents = {
        // Component registry
        registry: new Map(),
        
        // Global component settings
        settings: {
            theme: 'default',
            animations: true,
            accessibility: true,
            responsive: true,
            debugMode: false
        },

        // Initialize component system
        initialize: function() {
            this.registerDefaultComponents();
            this.setupGlobalEvents();
            this.loadTheme();
            
            console.log('AlgorithmPress Enhanced Components initialized');
        },

        // Register a component
        register: function(name, component) {
            this.registry.set(name, component);
            
            // Auto-initialize existing elements
            this.initializeComponentElements(name);
        },

        // Create component instance
        create: function(componentName, element, options = {}) {
            const ComponentClass = this.registry.get(componentName);
            if (!ComponentClass) {
                console.error(`Component '${componentName}' not found`);
                return null;
            }

            try {
                const instance = new ComponentClass(element, options);
                element._algorithmPressComponent = instance;
                return instance;
            } catch (error) {
                console.error(`Failed to create component '${componentName}':`, error);
                return null;
            }
        },

        // Initialize component elements in DOM
        initializeComponentElements: function(componentName) {
            const selector = `[data-component="${componentName}"]`;
            const elements = document.querySelectorAll(selector);
            
            elements.forEach(element => {
                if (!element._algorithmPressComponent) {
                    const options = this.parseElementOptions(element);
                    this.create(componentName, element, options);
                }
            });
        },

        // Parse component options from element attributes
        parseElementOptions: function(element) {
            const options = {};
            
            // Parse data-* attributes
            Array.from(element.attributes).forEach(attr => {
                if (attr.name.startsWith('data-option-')) {
                    const optionName = attr.name.replace('data-option-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    options[optionName] = this.parseValue(attr.value);
                }
            });

            return options;
        },

        // Parse string values to appropriate types
        parseValue: function(value) {
            if (value === 'true') return true;
            if (value === 'false') return false;
            if (value === 'null') return null;
            if (value === 'undefined') return undefined;
            if (!isNaN(value) && !isNaN(parseFloat(value))) return parseFloat(value);
            
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        },

        // Setup global events
        setupGlobalEvents: function() {
            // Auto-initialize components on DOM changes
            if (window.MutationObserver) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) { // Element node
                                this.initializeNewElements(node);
                            }
                        });
                    });
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        },

        // Initialize components in new elements
        initializeNewElements: function(element) {
            // Check if element itself has a component
            if (element.hasAttribute && element.hasAttribute('data-component')) {
                const componentName = element.getAttribute('data-component');
                if (!element._algorithmPressComponent) {
                    const options = this.parseElementOptions(element);
                    this.create(componentName, element, options);
                }
            }

            // Check for components in children
            const componentElements = element.querySelectorAll ? element.querySelectorAll('[data-component]') : [];
            componentElements.forEach(el => {
                const componentName = el.getAttribute('data-component');
                if (!el._algorithmPressComponent) {
                    const options = this.parseElementOptions(el);
                    this.create(componentName, el, options);
                }
            });
        },

        // Load theme
        loadTheme: function() {
            if (!document.getElementById('algorithm-press-components-theme')) {
                const link = document.createElement('link');
                link.id = 'algorithm-press-components-theme';
                link.rel = 'stylesheet';
                link.href = `css/components-${this.settings.theme}.css`;
                document.head.appendChild(link);
            }
        }
    };

    // Base Component Class
    class BaseComponent {
        constructor(element, options = {}) {
            this.element = element;
            this.options = { ...this.constructor.defaultOptions, ...options };
            this.events = new Map();
            this.isInitialized = false;
            
            this.init();
        }

        init() {
            this.createElement();
            this.bindEvents();
            this.isInitialized = true;
            this.emit('initialized');
        }

        createElement() {
            // Override in subclasses
        }

        bindEvents() {
            // Override in subclasses
        }

        on(event, callback) {
            if (!this.events.has(event)) {
                this.events.set(event, []);
            }
            this.events.get(event).push(callback);
        }

        off(event, callback) {
            if (this.events.has(event)) {
                const callbacks = this.events.get(event);
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        }

        emit(event, data = {}) {
            if (this.events.has(event)) {
                this.events.get(event).forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error in event callback for '${event}':`, error);
                    }
                });
            }
        }

        destroy() {
            this.emit('destroy');
            this.events.clear();
            this.isInitialized = false;
            
            if (this.element._algorithmPressComponent === this) {
                delete this.element._algorithmPressComponent;
            }
        }

        static get defaultOptions() {
            return {};
        }
    }

    // Advanced Button Component
    class EnhancedButton extends BaseComponent {
        static get defaultOptions() {
            return {
                variant: 'primary',
                size: 'medium',
                disabled: false,
                loading: false,
                ripple: true,
                icon: null,
                iconPosition: 'left'
            };
        }

        createElement() {
            this.element.classList.add('enhanced-button', `btn-${this.options.variant}`, `btn-${this.options.size}`);
            
            if (this.options.icon) {
                this.addIcon();
            }
            
            if (this.options.ripple) {
                this.setupRippleEffect();
            }
            
            this.updateState();
        }

        addIcon() {
            const icon = document.createElement('i');
            icon.className = this.options.icon;
            icon.classList.add('btn-icon');
            
            if (this.options.iconPosition === 'left') {
                this.element.insertBefore(icon, this.element.firstChild);
            } else {
                this.element.appendChild(icon);
            }
        }

        setupRippleEffect() {
            this.element.style.position = 'relative';
            this.element.style.overflow = 'hidden';
            
            this.element.addEventListener('click', (e) => {
                this.createRipple(e);
            });
        }

        createRipple(event) {
            const rect = this.element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.element.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }

        setLoading(loading = true) {
            this.options.loading = loading;
            this.updateState();
            this.emit('loading-changed', { loading });
        }

        setDisabled(disabled = true) {
            this.options.disabled = disabled;
            this.updateState();
            this.emit('disabled-changed', { disabled });
        }

        updateState() {
            this.element.disabled = this.options.disabled || this.options.loading;
            
            if (this.options.loading) {
                this.element.classList.add('loading');
                this.showLoadingSpinner();
            } else {
                this.element.classList.remove('loading');
                this.hideLoadingSpinner();
            }
        }

        showLoadingSpinner() {
            if (!this.element.querySelector('.loading-spinner')) {
                const spinner = document.createElement('span');
                spinner.className = 'loading-spinner';
                spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                this.element.appendChild(spinner);
            }
        }

        hideLoadingSpinner() {
            const spinner = this.element.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    // Advanced Modal Component
    class EnhancedModal extends BaseComponent {
        static get defaultOptions() {
            return {
                backdrop: true,
                keyboard: true,
                focus: true,
                size: 'medium',
                centered: false,
                scrollable: false,
                animation: true,
                closeOnClickOutside: true
            };
        }

        createElement() {
            this.createBackdrop();
            this.createModalDialog();
            this.setupModal();
        }

        createBackdrop() {
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'modal-backdrop';
            
            if (this.options.closeOnClickOutside) {
                this.backdrop.addEventListener('click', () => this.hide());
            }
        }

        createModalDialog() {
            this.element.classList.add('enhanced-modal');
            this.element.setAttribute('tabindex', '-1');
            this.element.setAttribute('role', 'dialog');
            
            if (!this.element.querySelector('.modal-dialog')) {
                const dialog = document.createElement('div');
                dialog.className = `modal-dialog modal-${this.options.size}`;
                
                if (this.options.centered) {
                    dialog.classList.add('modal-dialog-centered');
                }
                
                if (this.options.scrollable) {
                    dialog.classList.add('modal-dialog-scrollable');
                }
                
                // Move existing content into dialog
                const content = document.createElement('div');
                content.className = 'modal-content';
                
                while (this.element.firstChild) {
                    content.appendChild(this.element.firstChild);
                }
                
                dialog.appendChild(content);
                this.element.appendChild(dialog);
            }
        }

        setupModal() {
            this.isVisible = false;
            this.element.style.display = 'none';
            
            // Keyboard events
            if (this.options.keyboard) {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.isVisible) {
                        this.hide();
                    }
                });
            }
        }

        show() {
            if (this.isVisible) return;
            
            this.emit('show');
            
            // Add to DOM
            document.body.appendChild(this.backdrop);
            this.element.style.display = 'block';
            
            // Force reflow for animation
            this.element.offsetHeight;
            
            // Add classes for animation
            if (this.options.animation) {
                this.backdrop.classList.add('fade-in');
                this.element.classList.add('fade-in');
            }
            
            this.isVisible = true;
            
            // Focus management
            if (this.options.focus) {
                this.element.focus();
            }
            
            this.emit('shown');
        }

        hide() {
            if (!this.isVisible) return;
            
            this.emit('hide');
            
            if (this.options.animation) {
                this.backdrop.classList.add('fade-out');
                this.element.classList.add('fade-out');
                
                setTimeout(() => {
                    this.removeFromDOM();
                }, 300);
            } else {
                this.removeFromDOM();
            }
        }

        removeFromDOM() {
            if (this.backdrop.parentNode) {
                this.backdrop.parentNode.removeChild(this.backdrop);
            }
            
            this.element.style.display = 'none';
            this.element.classList.remove('fade-in', 'fade-out');
            this.backdrop.classList.remove('fade-in', 'fade-out');
            
            this.isVisible = false;
            this.emit('hidden');
        }

        toggle() {
            if (this.isVisible) {
                this.hide();
            } else {
                this.show();
            }
        }
    }

    // Advanced Tooltip Component
    class EnhancedTooltip extends BaseComponent {
        static get defaultOptions() {
            return {
                content: '',
                placement: 'top',
                trigger: 'hover',
                delay: 0,
                html: false,
                animation: true,
                offset: [0, 8]
            };
        }

        createElement() {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'enhanced-tooltip';
            this.tooltip.setAttribute('role', 'tooltip');
            
            this.arrow = document.createElement('div');
            this.arrow.className = 'tooltip-arrow';
            this.tooltip.appendChild(this.arrow);
            
            this.tooltipInner = document.createElement('div');
            this.tooltipInner.className = 'tooltip-inner';
            this.tooltip.appendChild(this.tooltipInner);
            
            this.updateContent();
            this.isVisible = false;
        }

        bindEvents() {
            if (this.options.trigger === 'hover') {
                this.element.addEventListener('mouseenter', () => this.show());
                this.element.addEventListener('mouseleave', () => this.hide());
            } else if (this.options.trigger === 'click') {
                this.element.addEventListener('click', () => this.toggle());
            } else if (this.options.trigger === 'focus') {
                this.element.addEventListener('focus', () => this.show());
                this.element.addEventListener('blur', () => this.hide());
            }
        }

        updateContent() {
            const content = this.options.content || this.element.getAttribute('title') || this.element.getAttribute('data-tooltip');
            
            if (this.options.html) {
                this.tooltipInner.innerHTML = content;
            } else {
                this.tooltipInner.textContent = content;
            }
        }

        show() {
            if (this.isVisible || !this.tooltipInner.textContent.trim()) return;
            
            const showTooltip = () => {
                document.body.appendChild(this.tooltip);
                this.position();
                
                if (this.options.animation) {
                    this.tooltip.classList.add('fade-in');
                }
                
                this.isVisible = true;
                this.emit('shown');
            };

            if (this.options.delay > 0) {
                this.showTimeout = setTimeout(showTooltip, this.options.delay);
            } else {
                showTooltip();
            }
        }

        hide() {
            if (!this.isVisible) return;
            
            if (this.showTimeout) {
                clearTimeout(this.showTimeout);
                this.showTimeout = null;
            }
            
            if (this.options.animation) {
                this.tooltip.classList.add('fade-out');
                setTimeout(() => {
                    this.removeTooltip();
                }, 150);
            } else {
                this.removeTooltip();
            }
        }

        removeTooltip() {
            if (this.tooltip.parentNode) {
                this.tooltip.parentNode.removeChild(this.tooltip);
            }
            
            this.tooltip.classList.remove('fade-in', 'fade-out');
            this.isVisible = false;
            this.emit('hidden');
        }

        position() {
            const elementRect = this.element.getBoundingClientRect();
            const tooltipRect = this.tooltip.getBoundingClientRect();
            
            let top, left;
            const offset = this.options.offset;
            
            switch (this.options.placement) {
                case 'top':
                    top = elementRect.top - tooltipRect.height - offset[1];
                    left = elementRect.left + (elementRect.width - tooltipRect.width) / 2 + offset[0];
                    break;
                case 'bottom':
                    top = elementRect.bottom + offset[1];
                    left = elementRect.left + (elementRect.width - tooltipRect.width) / 2 + offset[0];
                    break;
                case 'left':
                    top = elementRect.top + (elementRect.height - tooltipRect.height) / 2 + offset[1];
                    left = elementRect.left - tooltipRect.width - offset[0];
                    break;
                case 'right':
                    top = elementRect.top + (elementRect.height - tooltipRect.height) / 2 + offset[1];
                    left = elementRect.right + offset[0];
                    break;
            }
            
            // Viewport bounds checking
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            
            if (left < 0) left = 8;
            if (left + tooltipRect.width > viewport.width) left = viewport.width - tooltipRect.width - 8;
            if (top < 0) top = 8;
            if (top + tooltipRect.height > viewport.height) top = viewport.height - tooltipRect.height - 8;
            
            this.tooltip.style.position = 'fixed';
            this.tooltip.style.top = `${top}px`;
            this.tooltip.style.left = `${left}px`;
            this.tooltip.classList.add(`tooltip-${this.options.placement}`);
        }

        toggle() {
            if (this.isVisible) {
                this.hide();
            } else {
                this.show();
            }
        }
    }

    // Advanced Dropdown Component
    class EnhancedDropdown extends BaseComponent {
        static get defaultOptions() {
            return {
                placement: 'bottom-start',
                trigger: 'click',
                closeOnSelect: true,
                search: false,
                multiple: false,
                placeholder: 'Select an option...'
            };
        }

        createElement() {
            this.element.classList.add('enhanced-dropdown');
            
            this.createToggle();
            this.createMenu();
            this.parseOptions();
            
            this.isOpen = false;
            this.selectedValues = new Set();
        }

        createToggle() {
            this.toggle = document.createElement('button');
            this.toggle.className = 'dropdown-toggle';
            this.toggle.type = 'button';
            this.toggle.textContent = this.options.placeholder;
            
            this.element.appendChild(this.toggle);
        }

        createMenu() {
            this.menu = document.createElement('div');
            this.menu.className = 'dropdown-menu';
            this.menu.style.display = 'none';
            
            if (this.options.search) {
                this.createSearchInput();
            }
            
            this.itemsContainer = document.createElement('div');
            this.itemsContainer.className = 'dropdown-items';
            this.menu.appendChild(this.itemsContainer);
            
            this.element.appendChild(this.menu);
        }

        createSearchInput() {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'dropdown-search';
            
            this.searchInput = document.createElement('input');
            this.searchInput.type = 'text';
            this.searchInput.className = 'form-control';
            this.searchInput.placeholder = 'Search...';
            
            searchContainer.appendChild(this.searchInput);
            this.menu.appendChild(searchContainer);
            
            this.searchInput.addEventListener('input', (e) => {
                this.filterItems(e.target.value);
            });
        }

        parseOptions() {
            // Parse existing option elements
            const options = this.element.querySelectorAll('option');
            this.items = [];
            
            options.forEach((option, index) => {
                const item = {
                    value: option.value,
                    text: option.textContent,
                    disabled: option.disabled,
                    selected: option.selected
                };
                
                this.items.push(item);
                this.createMenuItem(item, index);
                
                if (item.selected) {
                    this.selectedValues.add(item.value);
                }
            });
            
            this.updateToggleText();
        }

        createMenuItem(item, index) {
            const menuItem = document.createElement('div');
            menuItem.className = 'dropdown-item';
            menuItem.textContent = item.text;
            menuItem.dataset.value = item.value;
            menuItem.dataset.index = index;
            
            if (item.disabled) {
                menuItem.classList.add('disabled');
            }
            
            if (item.selected) {
                menuItem.classList.add('selected');
            }
            
            menuItem.addEventListener('click', (e) => {
                if (!item.disabled) {
                    this.selectItem(item, menuItem);
                }
            });
            
            this.itemsContainer.appendChild(menuItem);
        }

        bindEvents() {
            this.toggle.addEventListener('click', () => {
                this.toggle();
            });
            
            // Close on click outside
            document.addEventListener('click', (e) => {
                if (!this.element.contains(e.target) && this.isOpen) {
                    this.close();
                }
            });
            
            // Keyboard navigation
            this.element.addEventListener('keydown', (e) => {
                this.handleKeydown(e);
            });
        }

        selectItem(item, menuItem) {
            if (this.options.multiple) {
                if (this.selectedValues.has(item.value)) {
                    this.selectedValues.delete(item.value);
                    menuItem.classList.remove('selected');
                } else {
                    this.selectedValues.add(item.value);
                    menuItem.classList.add('selected');
                }
            } else {
                // Single selection
                this.itemsContainer.querySelectorAll('.dropdown-item').forEach(el => {
                    el.classList.remove('selected');
                });
                
                this.selectedValues.clear();
                this.selectedValues.add(item.value);
                menuItem.classList.add('selected');
                
                if (this.options.closeOnSelect) {
                    this.close();
                }
            }
            
            this.updateToggleText();
            this.emit('change', {
                value: item.value,
                item: item,
                selectedValues: Array.from(this.selectedValues)
            });
        }

        updateToggleText() {
            if (this.selectedValues.size === 0) {
                this.toggle.textContent = this.options.placeholder;
            } else if (this.selectedValues.size === 1) {
                const selectedItem = this.items.find(item => this.selectedValues.has(item.value));
                this.toggle.textContent = selectedItem ? selectedItem.text : this.options.placeholder;
            } else {
                this.toggle.textContent = `${this.selectedValues.size} items selected`;
            }
        }

        filterItems(searchTerm) {
            const items = this.itemsContainer.querySelectorAll('.dropdown-item');
            
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const matches = text.includes(searchTerm.toLowerCase());
                item.style.display = matches ? 'block' : 'none';
            });
        }

        open() {
            if (this.isOpen) return;
            
            this.menu.style.display = 'block';
            this.isOpen = true;
            this.toggle.classList.add('active');
            
            if (this.searchInput) {
                this.searchInput.focus();
            }
            
            this.emit('open');
        }

        close() {
            if (!this.isOpen) return;
            
            this.menu.style.display = 'none';
            this.isOpen = false;
            this.toggle.classList.remove('active');
            
            this.emit('close');
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        handleKeydown(e) {
            switch (e.key) {
                case 'Enter':
                case ' ':
                    if (!this.isOpen) {
                        e.preventDefault();
                        this.open();
                    }
                    break;
                case 'Escape':
                    if (this.isOpen) {
                        e.preventDefault();
                        this.close();
                    }
                    break;
                case 'ArrowDown':
                case 'ArrowUp':
                    if (this.isOpen) {
                        e.preventDefault();
                        this.navigateItems(e.key === 'ArrowDown' ? 1 : -1);
                    }
                    break;
            }
        }

        navigateItems(direction) {
            const items = Array.from(this.itemsContainer.querySelectorAll('.dropdown-item:not(.disabled)'));
            const currentIndex = items.findIndex(item => item.classList.contains('highlighted'));
            let newIndex;
            
            if (currentIndex === -1) {
                newIndex = direction === 1 ? 0 : items.length - 1;
            } else {
                newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
            }
            
            items.forEach((item, index) => {
                item.classList.toggle('highlighted', index === newIndex);
            });
        }
    }

    // Register default components
    AlgorithmPressComponents.registerDefaultComponents = function() {
        this.register('enhanced-button', EnhancedButton);
        this.register('enhanced-modal', EnhancedModal);
        this.register('enhanced-tooltip', EnhancedTooltip);
        this.register('enhanced-dropdown', EnhancedDropdown);
        
        console.log('Default components registered');
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AlgorithmPressComponents.initialize();
        });
    } else {
        AlgorithmPressComponents.initialize();
    }

    console.log('AlgorithmPress Enhanced Components Library loaded');

})(window, document);
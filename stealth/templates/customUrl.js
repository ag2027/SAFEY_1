// Custom URL Disguise Template
// Shows cached snapshot of custom URL with security warnings

export class CustomURLTemplate {
    constructor(customUrl = '', snapshot = null) {
        this.customUrl = customUrl;
        this.snapshot = snapshot;
        this.unlockCallback = null;
        this.tapCount = 0;
        this.lastTapTime = 0;
    }

    /**
     * Validate URL (HTTPS only)
     */
    static validateUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * Get security warning message
     */
    static getSecurityWarning() {
        return {
            title: '⚠️ Security Warning',
            message: 'Be careful: loading untrusted pages can expose you to tracking or harmful content. This URL will be cached for offline use. Proceed?',
            confirmText: 'I Understand, Proceed',
            cancelText: 'Cancel'
        };
    }

    /**
     * Render custom URL UI
     */
    render() {
        if (!this.customUrl) {
            return this._renderPlaceholder();
        }

        if (!this.snapshot) {
            return this._renderOfflinePlaceholder();
        }

        return this._renderSnapshot();
    }

    /**
     * Render placeholder when no URL is set
     */
    _renderPlaceholder() {
        return `
            <div class="max-w-md mx-auto h-screen bg-white flex items-center justify-center p-6">
                <div class="text-center">
                    <div class="text-6xl mb-4">🌐</div>
                    <h2 class="text-xl font-semibold text-gray-800 mb-2">No Custom URL Set</h2>
                    <p class="text-gray-600">Configure a custom URL in Settings</p>
                </div>
            </div>
        `;
    }

    /**
     * Render offline placeholder
     */
    _renderOfflinePlaceholder() {
        const domain = this._extractDomain(this.customUrl);
        
        return `
            <div class="max-w-md mx-auto h-screen bg-white flex flex-col">
                <!-- Browser UI -->
                <div class="bg-gray-100 border-b border-gray-300 px-4 py-3">
                    <div class="flex items-center gap-2 mb-2">
                        <button class="p-1 hover:bg-gray-200 rounded">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button class="p-1 hover:bg-gray-200 rounded">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button class="p-1 hover:bg-gray-200 rounded">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                    <div class="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-300">
                        <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                        </svg>
                        <span class="flex-1 text-sm text-gray-700 truncate">${this.customUrl}</span>
                    </div>
                </div>

                <!-- Offline Content -->
                <div id="custom-url-content" class="flex-1 bg-gray-50 flex items-center justify-center p-6">
                    <div class="text-center max-w-sm">
                        <div class="text-6xl mb-4">📱</div>
                        <h2 class="text-xl font-semibold text-gray-800 mb-2">Offline</h2>
                        <p class="text-gray-600 mb-4">This page is not available offline. The cached snapshot could not be loaded.</p>
                        <div class="bg-white rounded-lg p-4 border border-gray-200">
                            <p class="text-sm text-gray-600">${domain}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render cached snapshot
     */
    _renderSnapshot() {
        const domain = this._extractDomain(this.customUrl);
        
        return `
            <div class="max-w-md mx-auto h-screen bg-white flex flex-col">
                <!-- Browser UI -->
                <div class="bg-gray-100 border-b border-gray-300 px-4 py-3">
                    <div class="flex items-center gap-2 mb-2">
                        <button class="p-1 hover:bg-gray-200 rounded">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button class="p-1 hover:bg-gray-200 rounded">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button class="p-1 hover:bg-gray-200 rounded">
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                    <div class="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-300">
                        <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                        </svg>
                        <span class="flex-1 text-sm text-gray-700 truncate">${this.customUrl}</span>
                    </div>
                </div>

                <!-- Snapshot Content -->
                <div id="custom-url-content" class="flex-1 overflow-auto">
                    ${this.snapshot.type === 'image' ? 
                        `<img src="${this.snapshot.data}" alt="Page snapshot" class="w-full h-auto" />` : 
                        `<div class="p-4 text-gray-600">${this.snapshot.data || 'Cached content'}</div>`
                    }
                </div>
            </div>
        `;
    }

    /**
     * Extract domain from URL
     */
    _extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    }

    /**
     * Initialize event handlers
     */
    initHandlers(pin) {
        const content = document.getElementById('custom-url-content');
        if (!content) return;

        // Triple tap anywhere to unlock
        content.addEventListener('click', (e) => {
            const now = Date.now();
            
            if (now - this.lastTapTime > 2000) {
                this.tapCount = 0;
            }
            
            this.tapCount++;
            this.lastTapTime = now;

            if (this.tapCount >= 3) {
                if (this.unlockCallback) {
                    this.unlockCallback();
                }
                this.tapCount = 0;
            }
        });
    }

    /**
     * Set unlock callback
     */
    setUnlockCallback(callback) {
        this.unlockCallback = callback;
    }

    /**
     * Set custom URL and snapshot
     */
    setCustomUrl(url, snapshot = null) {
        this.customUrl = url;
        this.snapshot = snapshot;
    }

    /**
     * Reset state
     */
    reset() {
        this.tapCount = 0;
        this.lastTapTime = 0;
    }

    /**
     * Get title for document.title
     */
    getTitle() {
        if (this.customUrl) {
            return this._extractDomain(this.customUrl);
        }
        return 'Browser';
    }
}

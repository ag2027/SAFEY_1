// Main stealth mode controller
// Coordinates all stealth mode functionality

class StealthController {
    constructor() {
        this.isActive = false;
        this.autoLockTimer = null;
        this.inactivityTimer = null;
        this.lastActivityTime = Date.now();
    }

    // Initialize stealth system
    async init() {
        // Initialize all components
        await stealthSettings.init();
        await unlockHandler.init();
        await stealthTriggerHandler.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up activity tracking for auto-lock
        this.setupActivityTracking();
        
        console.log('[SAFEY] Stealth system initialized');
    }

    // Set up event listeners
    setupEventListeners() {
        // Listen for stealth activation
        document.addEventListener('stealthActivate', async (e) => {
            await this.activate();
        });
        
        // Listen for stealth unlock
        document.addEventListener('stealthUnlock', async (e) => {
            if (e.detail.success) {
                await this.deactivate();
            }
        });
        
        // Listen for visibility change (tab/app switching)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isActive) {
                // App became visible while in stealth mode
                this.updateLastActivity();
            }
        });
    }

    // Set up activity tracking for auto-lock
    setupActivityTracking() {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(eventType => {
            document.addEventListener(eventType, () => {
                if (!this.isActive) {
                    this.updateLastActivity();
                }
            }, { passive: true });
        });
        
        // Start auto-lock checker
        this.startAutoLockChecker();
    }

    // Update last activity time
    updateLastActivity() {
        this.lastActivityTime = Date.now();
    }

    // Start auto-lock checker
    startAutoLockChecker() {
        setInterval(() => {
            if (!this.isActive) {
                const timeout = (stealthSettings.getSetting('autoLockTimeout') || 5) * 60 * 1000;
                const timeSinceActivity = Date.now() - this.lastActivityTime;
                
                if (timeSinceActivity >= timeout) {
                    console.log('[SAFEY] Auto-lock timeout reached');
                    this.activate(true); // Auto-lock activation
                }
            }
        }, 10000); // Check every 10 seconds
    }

    // Activate stealth mode
    async activate(isAutoLock = false) {
        if (this.isActive) return;
        
        console.log(`[SAFEY] Activating stealth mode (auto-lock: ${isAutoLock})`);
        this.isActive = true;
        
        // Log activation
        await eventLogger.logEvent('stealthActivated', { 
            autoLock: isAutoLock,
            timestamp: Date.now()
        });
        
        // Get current template
        const template = stealthSettings.getSetting('disguiseTemplate') || 'calculator';
        
        // Hide all normal screens
        document.querySelectorAll('.screen').forEach(screen => {
            if (screen.id !== 'stealth-screen') {
                screen.classList.remove('active');
            }
        });
        
        // Show stealth screen with fade
        const stealthScreen = document.getElementById('stealth-screen');
        stealthScreen.classList.add('active', 'fade-in');
        
        // Render disguise
        await disguiseRenderer.render(template, stealthScreen);
        
        // Disable triggers while in stealth mode
        stealthTriggerHandler.setEnabled(false);
        
        // Check for suspicious patterns
        await unlockHandler.checkSuspiciousPatterns();
    }

    // Deactivate stealth mode
    async deactivate() {
        if (!this.isActive) return;
        
        console.log('[SAFEY] Deactivating stealth mode');
        this.isActive = false;
        
        // Hide stealth screen
        const stealthScreen = document.getElementById('stealth-screen');
        stealthScreen.className = 'screen stealth-mode';
        stealthScreen.innerHTML = '';
        //console.log(stealthScreen.className);
        // Show home screen
        const homeScreen = document.getElementById('home-screen');
        homeScreen.classList.add('active', 'fade-in');
        
        // Re-enable triggers
        stealthTriggerHandler.setEnabled(true);
        
        // Reset activity timer
        this.updateLastActivity();
        
        // Reset title
        document.title = 'Notes';
    }

    // Get current state
    getState() {
        return {
            isActive: this.isActive,
            template: stealthSettings.getSetting('disguiseTemplate'),
            lastActivity: this.lastActivityTime
        };
    }

    // Manually trigger stealth (for testing/debugging)
    async triggerStealth() {
        await this.activate(false);
    }

    // Change disguise template
    async changeTemplate(template) {
        await stealthSettings.updateTemplate(template);
        
        if (this.isActive) {
            // Re-render with new template
            const stealthScreen = document.getElementById('stealth-screen');
            await disguiseRenderer.render(template, stealthScreen);
        }
    }

    // Set custom URL
    async setCustomUrl(url) {
        // Validate HTTPS
        if (!url.startsWith('https://')) {
            throw new Error('URL must use HTTPS');
        }
        
        // Show security warning
        const confirmed = await this.showCustomUrlWarning();
        if (!confirmed) {
            return false;
        }
        
        // Save URL
        await stealthSettings.setCustomUrl(url);
        
        // Try to capture snapshot (in real app, would use browser API or screenshot)
        // For now, we'll just note that it should be cached
        console.log('[SAFEY] Custom URL set, snapshot should be cached:', url);
        
        return true;
    }

    // Show custom URL security warning
    async showCustomUrlWarning() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-card max-w-md p-6">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 mb-2">Security Warning</h3>
                            <p class="text-sm text-gray-700 mb-3">
                                Using a custom URL as a disguise may expose your browsing activity to the website owner. 
                                Only use trusted, safe websites that don't reveal your identity or location.
                            </p>
                            <p class="text-xs text-gray-500">
                                This is a one-time warning. SAFEY will cache a snapshot for offline use.
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button id="custom-url-cancel" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition">
                            Cancel
                        </button>
                        <button id="custom-url-confirm" class="flex-1 bg-trust-blue hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition">
                            I Understand
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('custom-url-cancel').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
            
            document.getElementById('custom-url-confirm').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });
        });
    }

    // Update PIN
    async updatePin(newPin) {
        await stealthSettings.updatePin(newPin);
    }

    // Clear all stealth data
    async clearAllData() {
        await stealthSettings.clearSettings();
        await eventLogger.clearEvents();
        await storageUtils.clearAll();
        unlockHandler.resetSuspiciousCounter();
        console.log('[SAFEY] All stealth data cleared');
    }

    // Get debug info
    async getDebugInfo() {
        const settings = stealthSettings.getPublicSettings();
        const recentEvents = await eventLogger.getMaskedEvents(10);
        const suspiciousCounter = unlockHandler.getSuspiciousCounter();
        
        return {
            isActive: this.isActive,
            settings,
            recentEvents,
            suspiciousCounter,
            lastActivity: new Date(this.lastActivityTime).toLocaleString()
        };
    }
}

// Export singleton
const stealthController = new StealthController();

// Stealth Mode Controller
// Main orchestrator for stealth mode functionality

import stealthSettings from './stealthSettings.js';
import disguiseRenderer from './disguiseRenderer.js';
import stealthTriggerHandler from './stealthTriggerHandler.js';
import unlockHandler from './unlockHandler.js';
import behavioralHeuristics from './behavioralHeuristics.js';
import eventLogger from './utils/eventLogger.js';
import storageUtil from './utils/storage.js';

class StealthModeController {
    constructor() {
        this.isStealthActive = false;
        this.autoLockTimer = null;
        this.lastActivityTime = Date.now();
        this.originalTitle = document.title;
        this.stealthContainer = null;
        this.mainContainer = null;
        this.initialized = false;
    }

    /**
     * Initialize stealth mode controller
     */
    async init() {
        if (this.initialized) return;

        // Initialize settings
        await stealthSettings.init();
        
        // Initialize event logger with PIN
        const pin = stealthSettings.getPin();
        await eventLogger.init(pin);

        // Create stealth container if it doesn't exist
        this._createStealthContainer();

        // Initialize trigger handler
        stealthTriggerHandler.init((triggerType) => {
            this.activateStealth(triggerType);
        });

        // Initialize unlock handler
        unlockHandler.init((success) => {
            if (success) {
                this.deactivateStealth();
            }
        });

        // Initialize behavioral heuristics
        behavioralHeuristics.init((reason) => {
            this._showSafetyCheckPrompt(reason);
        });

        // Setup auto-lock
        this._setupAutoLock();

        // Track activity
        this._setupActivityTracking();

        this.initialized = true;
        console.log('[StealthModeController] Initialized');
    }

    /**
     * Create stealth container element
     */
    _createStealthContainer() {
        // Check if stealth container already exists
        this.stealthContainer = document.getElementById('stealth-mode-container');
        
        if (!this.stealthContainer) {
            this.stealthContainer = document.createElement('div');
            this.stealthContainer.id = 'stealth-mode-container';
            this.stealthContainer.className = 'stealth-mode-container';
            this.stealthContainer.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; background: white;';
            document.body.appendChild(this.stealthContainer);
        }

        // Get main container
        this.mainContainer = document.getElementById('home-screen')?.parentElement || document.body;
    }

    /**
     * Activate stealth mode
     */
    async activateStealth(triggerType = 'manual') {
        if (this.isStealthActive) return;

        console.log('[StealthModeController] Activating stealth mode');
        
        // Log event
        await eventLogger.logEvent('stealthActivated', { trigger: triggerType });

        // Hide main app
        if (this.mainContainer) {
            Array.from(this.mainContainer.children).forEach(child => {
                if (child.id !== 'stealth-mode-container') {
                    child.style.display = 'none';
                }
            });
        }

        // Show stealth container
        this.stealthContainer.style.display = 'block';

        // Initialize disguise renderer
        disguiseRenderer.init(this.stealthContainer);

        // Render disguise with unlock callback
        await disguiseRenderer.render(null, () => {
            this.deactivateStealth();
        });

        // Update state
        this.isStealthActive = true;

        // Add fade-in animation
        this.stealthContainer.classList.add('fade-in');
        setTimeout(() => {
            this.stealthContainer.classList.remove('fade-in');
        }, 200);

        console.log('[StealthModeController] Stealth mode activated');
    }

    /**
     * Deactivate stealth mode
     */
    async deactivateStealth() {
        if (!this.isStealthActive) return;

        console.log('[StealthModeController] Deactivating stealth mode');

        // Add fade-out animation
        this.stealthContainer.classList.add('fade-out');

        setTimeout(async () => {
            // Hide stealth container
            this.stealthContainer.style.display = 'none';
            this.stealthContainer.classList.remove('fade-out');

            // Clear disguise renderer
            disguiseRenderer.clear();

            // Show main app
            if (this.mainContainer) {
                Array.from(this.mainContainer.children).forEach(child => {
                    if (child.id !== 'stealth-mode-container') {
                        child.style.display = '';
                    }
                });
            }

            // Restore original title
            document.title = this.originalTitle;

            // Update state
            this.isStealthActive = false;

            // Reset unlock handler
            unlockHandler.reset();

            // Log event
            await eventLogger.logEvent('stealthDeactivated', { timestamp: Date.now() });

            console.log('[StealthModeController] Stealth mode deactivated');
        }, 150);
    }

    /**
     * Setup auto-lock functionality
     */
    _setupAutoLock() {
        const settings = stealthSettings.getSettings();
        
        if (!settings.autoLock.enabled) return;

        const timeoutMinutes = settings.autoLock.timeoutMinutes || 5;
        const timeoutMs = timeoutMinutes * 60 * 1000;

        // Check for inactivity every 30 seconds
        setInterval(() => {
            if (this.isStealthActive) return; // Don't auto-lock when already in stealth

            const now = Date.now();
            const timeSinceActivity = now - this.lastActivityTime;

            if (timeSinceActivity >= timeoutMs) {
                console.log('[StealthModeController] Auto-lock triggered');
                this.activateStealth('autoLock');
            }
        }, 30000);
    }

    /**
     * Setup activity tracking
     */
    _setupActivityTracking() {
        const activityEvents = ['mousedown', 'touchstart', 'keydown', 'scroll'];
        
        activityEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.lastActivityTime = Date.now();
            }, { passive: true });
        });
    }

    /**
     * Show safety check prompt
     */
    _showSafetyCheckPrompt(reason) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'safety-check-modal';
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style="z-index: 10000;">
                <div class="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl">
                    <div class="text-center mb-6">
                        <div class="text-5xl mb-3">⚠️</div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Safety Check</h3>
                        <p class="text-gray-600">We detected something that might be unsafe. Would you like to send a safety check to a trusted contact?</p>
                        ${reason ? `<p class="text-sm text-gray-500 mt-2">${reason}</p>` : ''}
                    </div>
                    <div class="flex gap-3">
                        <button class="safety-check-cancel flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition">
                            Cancel
                        </button>
                        <button class="safety-check-send flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition">
                            Send Safety Check
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle cancel
        modal.querySelector('.safety-check-cancel').addEventListener('click', () => {
            modal.remove();
        });

        // Handle send
        modal.querySelector('.safety-check-send').addEventListener('click', async () => {
            await this._sendSafetyCheck();
            modal.remove();
        });
    }

    /**
     * Send safety check (demo webhook)
     */
    async _sendSafetyCheck() {
        const payload = eventLogger.exportForWebhook();
        
        console.log('[StealthModeController] Safety check payload:', payload);
        
        // In production, this would send to actual webhook
        // For demo, just log to console
        console.log('[DEMO WEBHOOK] Safety check sent:', JSON.stringify(payload, null, 2));
        
        // Log event
        await eventLogger.logEvent('safetyCheckSent', { timestamp: Date.now() });

        // Show confirmation
        alert('Safety check sent (demo mode - see console for payload)');
    }

    /**
     * Clear session and history
     */
    async clearSession() {
        if (confirm('This will clear all stealth mode data, event logs, and disguise configuration. Continue?')) {
            await eventLogger.clearEvents();
            await storageUtil.clearAll();
            await stealthSettings.clear();
            console.log('[StealthModeController] Session cleared');
            alert('Session and history cleared');
        }
    }

    /**
     * Get debug info
     */
    getDebugInfo() {
        return {
            isStealthActive: this.isStealthActive,
            settings: stealthSettings.getSettings(),
            events: eventLogger.getMaskedEvents(),
            failedAttempts: unlockHandler.getFailedAttemptsCount(),
            suspiciousCounter: unlockHandler.getSuspiciousCounter()
        };
    }

    /**
     * Destroy controller
     */
    destroy() {
        if (this.autoLockTimer) {
            clearTimeout(this.autoLockTimer);
        }
        stealthTriggerHandler.destroy();
        behavioralHeuristics.destroy();
        this.initialized = false;
    }
}

// Export singleton instance
const stealthModeController = new StealthModeController();
export default stealthModeController;

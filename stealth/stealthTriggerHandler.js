// Stealth Trigger Handler Module
// Manages trigger activation for stealth mode

import stealthSettings from './stealthSettings.js';
import eventLogger from './utils/eventLogger.js';

class StealthTriggerHandler {
    constructor() {
        this.initialized = false;
        this.activationCallback = null;
        
        // Logo double-tap tracking
        this.logoTapCount = 0;
        this.logoLastTapTime = 0;
        
        // Corner multi-tap tracking
        this.cornerTapCount = 0;
        this.cornerLastTapTime = 0;
        this.cornerTapZone = { x: 0, y: 0, width: 80, height: 80 }; // pixels
    }

    /**
     * Initialize trigger handlers
     */
    init(activationCallback) {
        if (this.initialized) return;

        this.activationCallback = activationCallback;
        this._setupTriggers();
        this.initialized = true;
        console.log('[StealthTriggerHandler] Initialized');
    }

    /**
     * Setup trigger event listeners
     */
    _setupTriggers() {
        const settings = stealthSettings.getSettings();

        // Logo double-tap trigger
        if (settings.triggers.logoDoubleTap) {
            this._setupLogoDoubleTap();
        }

        // Corner multi-tap trigger
        if (settings.triggers.cornerMultiTap) {
            this._setupCornerMultiTap();
        }
    }

    /**
     * Setup logo double-tap trigger
     */
    _setupLogoDoubleTap() {
        // Find logo element (assumes it has an ID or class)
        const logoElements = document.querySelectorAll('[id*="logo"], .logo, h1:first-of-type, svg:first-of-type');
        
        logoElements.forEach(logo => {
            logo.addEventListener('click', (e) => {
                const now = Date.now();
                
                // Reset if more than 500ms since last tap
                if (now - this.logoLastTapTime > 500) {
                    this.logoTapCount = 0;
                }
                
                this.logoTapCount++;
                this.logoLastTapTime = now;

                // Double tap detected
                if (this.logoTapCount >= 2) {
                    this._triggerStealth('logoDoubleTap');
                    this.logoTapCount = 0;
                }
            });
        });

        console.log('[StealthTriggerHandler] Logo double-tap trigger enabled');
    }

    /**
     * Setup corner multi-tap trigger
     */
    _setupCornerMultiTap() {
        const settings = stealthSettings.getSettings();
        const requiredTaps = settings.triggers.cornerTapCount || 4;
        const position = settings.triggers.cornerPosition || 'top-right';

        // Update corner tap zone based on position
        this._updateCornerZone(position);

        // Add click listener to document
        document.addEventListener('click', (e) => {
            if (!this._isInCornerZone(e.clientX, e.clientY)) {
                return;
            }

            const now = Date.now();
            
            // Reset if more than 2 seconds since last tap
            if (now - this.cornerLastTapTime > 2000) {
                this.cornerTapCount = 0;
            }
            
            this.cornerTapCount++;
            this.cornerLastTapTime = now;

            // Required taps detected
            if (this.cornerTapCount >= requiredTaps) {
                this._triggerStealth('cornerMultiTap');
                this.cornerTapCount = 0;
            }
        });

        console.log(`[StealthTriggerHandler] Corner multi-tap trigger enabled (${requiredTaps} taps in ${position})`);
    }

    /**
     * Update corner zone based on position
     */
    _updateCornerZone(position) {
        const zoneSize = { width: 80, height: 80 };
        
        switch (position) {
            case 'top-left':
                this.cornerTapZone = { x: 0, y: 0, ...zoneSize };
                break;
            case 'top-right':
                this.cornerTapZone = { 
                    x: window.innerWidth - zoneSize.width, 
                    y: 0, 
                    ...zoneSize 
                };
                break;
            case 'bottom-left':
                this.cornerTapZone = { 
                    x: 0, 
                    y: window.innerHeight - zoneSize.height, 
                    ...zoneSize 
                };
                break;
            case 'bottom-right':
                this.cornerTapZone = { 
                    x: window.innerWidth - zoneSize.width, 
                    y: window.innerHeight - zoneSize.height, 
                    ...zoneSize 
                };
                break;
            default:
                this.cornerTapZone = { 
                    x: window.innerWidth - zoneSize.width, 
                    y: 0, 
                    ...zoneSize 
                };
        }
    }

    /**
     * Check if coordinates are in corner zone
     */
    _isInCornerZone(x, y) {
        return x >= this.cornerTapZone.x && 
               x <= this.cornerTapZone.x + this.cornerTapZone.width &&
               y >= this.cornerTapZone.y && 
               y <= this.cornerTapZone.y + this.cornerTapZone.height;
    }

    /**
     * Trigger stealth mode activation
     */
    _triggerStealth(triggerType) {
        console.log('[StealthTriggerHandler] Stealth activated via:', triggerType);
        
        // Log event
        eventLogger.logEvent('stealthActivated', { trigger: triggerType });

        // Call activation callback
        if (this.activationCallback) {
            this.activationCallback(triggerType);
        }
    }

    /**
     * Reset trigger counters
     */
    reset() {
        this.logoTapCount = 0;
        this.logoLastTapTime = 0;
        this.cornerTapCount = 0;
        this.cornerLastTapTime = 0;
    }

    /**
     * Update triggers based on new settings
     */
    updateTriggers() {
        // Re-initialize triggers with new settings
        this._setupTriggers();
    }

    /**
     * Destroy trigger handlers
     */
    destroy() {
        // Clean up event listeners if needed
        this.initialized = false;
        console.log('[StealthTriggerHandler] Destroyed');
    }
}

// Export singleton instance
const stealthTriggerHandler = new StealthTriggerHandler();
export default stealthTriggerHandler;

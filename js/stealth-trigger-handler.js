// Stealth trigger handler
// Manages activation triggers for stealth mode (logo double-tap, corner multi-tap)

class StealthTriggerHandler {
    constructor() {
        this.logoDoubleTap = {
            enabled: true,
            tapCount: 0,
            timeout: null,
            maxDelay: 500 // ms between taps
        };
        
        this.cornerMultiTap = {
            enabled: true,
            corner: 'top-right',
            tapCount: 4,
            currentTaps: 0,
            timeout: null,
            maxDelay: 1000,
            cornerSize: 80 // pixels
        };
        
        this.listeners = [];
    }

    // Initialize triggers
    async init() {
        await stealthSettings.init();
        
        // Load settings
        const triggersEnabled = stealthSettings.getSetting('triggersEnabled');
        const cornerConfig = stealthSettings.getSetting('cornerTapConfig');
        
        if (triggersEnabled) {
            this.logoDoubleTap.enabled = triggersEnabled.logoDoubleTap !== false;
            this.cornerMultiTap.enabled = triggersEnabled.cornerMultiTap !== false;
        }
        
        if (cornerConfig) {
            this.cornerMultiTap.corner = cornerConfig.corner || 'top-right';
            this.cornerMultiTap.tapCount = cornerConfig.tapCount || 4;
            this.cornerMultiTap.maxDelay = cornerConfig.tapTimeout || 1000;
        }
        
        this.attachListeners();
    }

    // Attach event listeners
    attachListeners() {
        // Logo double-tap listener
        if (this.logoDoubleTap.enabled) {
            const logos = document.querySelectorAll('[data-trigger="logo"]');
            logos.forEach(logo => {
                const listener = this.handleLogoTap.bind(this);
                logo.addEventListener('click', listener);
                this.listeners.push({ element: logo, event: 'click', listener });
            });
        }
        
        // Corner multi-tap listener (on body for global detection)
        if (this.cornerMultiTap.enabled) {
            const listener = this.handleCornerTap.bind(this);
            document.body.addEventListener('click', listener);
            this.listeners.push({ element: document.body, event: 'click', listener });
        }
    }

    // Detach all listeners
    detachListeners() {
        this.listeners.forEach(({ element, event, listener }) => {
            element.removeEventListener(event, listener);
        });
        this.listeners = [];
    }

    // Handle logo double-tap
    handleLogoTap(e) {
        e.stopPropagation();
        
        this.logoDoubleTap.tapCount++;
        
        if (this.logoDoubleTap.timeout) {
            clearTimeout(this.logoDoubleTap.timeout);
        }
        
        if (this.logoDoubleTap.tapCount === 2) {
            console.log('[SAFEY] Logo double-tap detected');
            this.activateStealth();
            this.logoDoubleTap.tapCount = 0;
        } else {
            this.logoDoubleTap.timeout = setTimeout(() => {
                this.logoDoubleTap.tapCount = 0;
            }, this.logoDoubleTap.maxDelay);
        }
    }

    // Handle corner multi-tap
    handleCornerTap(e) {
        if (!this.isInCorner(e.clientX, e.clientY)) {
            return;
        }
        
        this.cornerMultiTap.currentTaps++;
        
        if (this.cornerMultiTap.timeout) {
            clearTimeout(this.cornerMultiTap.timeout);
        }
        
        console.log(`[SAFEY] Corner tap ${this.cornerMultiTap.currentTaps}/${this.cornerMultiTap.tapCount}`);
        
        if (this.cornerMultiTap.currentTaps >= this.cornerMultiTap.tapCount) {
            console.log('[SAFEY] Corner multi-tap detected');
            this.activateStealth();
            this.cornerMultiTap.currentTaps = 0;
        } else {
            this.cornerMultiTap.timeout = setTimeout(() => {
                this.cornerMultiTap.currentTaps = 0;
            }, this.cornerMultiTap.maxDelay);
        }
    }

    // Check if tap is in configured corner
    isInCorner(x, y) {
        const { corner, cornerSize } = this.cornerMultiTap;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        switch (corner) {
            case 'top-right':
                return x > (width - cornerSize) && y < cornerSize;
            case 'top-left':
                return x < cornerSize && y < cornerSize;
            case 'bottom-right':
                return x > (width - cornerSize) && y > (height - cornerSize);
            case 'bottom-left':
                return x < cornerSize && y > (height - cornerSize);
            default:
                return false;
        }
    }

    // Activate stealth mode
    async activateStealth() {
        await eventLogger.logEvent('stealthActivated');
        await stealthSettings.trackActivation();
        
        // Dispatch custom event for app to handle
        const event = new CustomEvent('stealthActivate', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    // Update trigger settings
    async updateSettings(settings) {
        if (settings.triggersEnabled) {
            this.logoDoubleTap.enabled = settings.triggersEnabled.logoDoubleTap !== false;
            this.cornerMultiTap.enabled = settings.triggersEnabled.cornerMultiTap !== false;
            await stealthSettings.updateTriggers(settings.triggersEnabled);
        }
        
        if (settings.cornerConfig) {
            this.cornerMultiTap.corner = settings.cornerConfig.corner || this.cornerMultiTap.corner;
            this.cornerMultiTap.tapCount = settings.cornerConfig.tapCount || this.cornerMultiTap.tapCount;
            this.cornerMultiTap.maxDelay = settings.cornerConfig.tapTimeout || this.cornerMultiTap.maxDelay;
            await stealthSettings.updateCornerTapConfig(settings.cornerConfig);
        }
        
        // Reattach listeners with new settings
        this.detachListeners();
        this.attachListeners();
    }

    // Enable/disable triggers
    setEnabled(enabled) {
        if (enabled) {
            this.attachListeners();
        } else {
            this.detachListeners();
        }
    }
}

// Export singleton
const stealthTriggerHandler = new StealthTriggerHandler();

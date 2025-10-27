// Stealth settings manager
// Handles configuration for stealth/disguise mode

class StealthSettings {
    constructor() {
        this.defaults = {
            pin: null, // Will be hashed
            pinHash: null,
            disguiseTemplate: 'calculator', // calculator, notes, weather, news, gallery, custom
            customUrl: null,
            customUrlSnapshot: null,
            triggersEnabled: {
                logoDoubleTap: true,
                cornerMultiTap: true
            },
            cornerTapConfig: {
                corner: 'top-right', // top-right, top-left, bottom-right, bottom-left
                tapCount: 4,
                tapTimeout: 1000 // ms between taps
            },
            autoLockTimeout: 5, // minutes
            unlockMethod: 'pin', // pin or pattern (pattern is placeholder)
            failedAttemptThreshold: 3,
            failedAttemptWindow: 2, // minutes
            suspiciousResetThreshold: 3,
            debugMode: false,
            lastActivated: null,
            activationCount: 0
        };
        this.settings = null;
    }

    // Initialize settings
    async init() {
        await this.loadSettings();
        if (!this.settings) {
            this.settings = { ...this.defaults };
            await this.saveSettings();
        }
        
        // Ensure pin hash exists
        if (this.settings.pin && !this.settings.pinHash) {
            this.settings.pinHash = await cryptoUtils.hashPin(this.settings.pin);
            delete this.settings.pin; // Remove plain text pin
            await this.saveSettings();
        }
    }

    // Load settings from storage
    async loadSettings() {
        try {
            const encrypted = await storageUtils.loadData('settings', 'stealth');
            if (encrypted) {
                this.settings = await cryptoUtils.decrypt(encrypted);
                console.log('[SAFEY] Stealth settings loaded');
                return this.settings;
            } else {
                // Check localStorage for legacy settings
                const legacyPin = localStorage.getItem('safey_pin');
                if (legacyPin) {
                    this.settings = { ...this.defaults, pin: legacyPin };
                    await this.saveSettings();
                    localStorage.removeItem('safey_pin');
                }
            }
        } catch (error) {
            console.error('Error loading stealth settings:', error);
        }
        return this.settings;
    }

    // Save settings to storage
    async saveSettings() {
        try {
            const encrypted = await cryptoUtils.encrypt(this.settings);
            if (encrypted) {
                await storageUtils.saveData('settings', 'stealth', { value: encrypted });
                console.log('[SAFEY] Stealth settings saved');
                await eventLogger.logEvent('settingsUpdated', {
                    template: this.settings.disguiseTemplate
                });
            }
        } catch (error) {
            console.error('Error saving stealth settings:', error);
        }
    }

    // Update PIN
    async updatePin(newPin) {
        if (!newPin || !/^\d{4}$/.test(newPin)) {
            throw new Error('PIN must be 4 digits');
        }
        
        this.settings.pinHash = await cryptoUtils.hashPin(newPin);
        delete this.settings.pin; // Ensure no plain text
        await this.saveSettings();
        console.log('[SAFEY] PIN updated');
    }

    // Verify PIN
    async verifyPin(pin) {
        const hash = await cryptoUtils.hashPin(pin);
        return hash === this.settings.pinHash;
    }

    // Update disguise template
    async updateTemplate(template) {
        const validTemplates = ['calculator', 'notes', 'weather', 'news', 'gallery', 'custom'];
        if (!validTemplates.includes(template)) {
            throw new Error('Invalid template');
        }
        
        this.settings.disguiseTemplate = template;
        await this.saveSettings();
        await eventLogger.logEvent('disguiseChanged', { template });
    }

    // Set custom URL
    async setCustomUrl(url) {
        // Validate HTTPS
        if (!url.startsWith('https://')) {
            throw new Error('Custom URL must use HTTPS');
        }
        
        this.settings.customUrl = url;
        this.settings.disguiseTemplate = 'custom';
        await this.saveSettings();
    }

    // Save URL snapshot
    async saveUrlSnapshot(url, dataUrl) {
        try {
            await storageUtils.saveData('snapshots', url, {
                url,
                dataUrl,
                timestamp: Date.now()
            });
            this.settings.customUrlSnapshot = url;
            await this.saveSettings();
        } catch (error) {
            console.error('Error saving URL snapshot:', error);
        }
    }

    // Get URL snapshot
    async getUrlSnapshot(url) {
        try {
            const snapshot = await storageUtils.loadData('snapshots', url);
            return snapshot?.dataUrl || null;
        } catch (error) {
            console.error('Error loading URL snapshot:', error);
            return null;
        }
    }

    // Update trigger settings
    async updateTriggers(triggers) {
        this.settings.triggersEnabled = {
            ...this.settings.triggersEnabled,
            ...triggers
        };
        await this.saveSettings();
    }

    // Update corner tap config
    async updateCornerTapConfig(config) {
        this.settings.cornerTapConfig = {
            ...this.settings.cornerTapConfig,
            ...config
        };
        await this.saveSettings();
    }

    // Update auto-lock timeout
    async updateAutoLockTimeout(minutes) {
        if (minutes < 1 || minutes > 60) {
            throw new Error('Timeout must be between 1 and 60 minutes');
        }
        this.settings.autoLockTimeout = minutes;
        await this.saveSettings();
    }

    // Get setting
    getSetting(key) {
        return this.settings?.[key];
    }

    // Get all settings (excluding sensitive data)
    getPublicSettings() {
        if (!this.settings) return null;
        
        const { pinHash, ...publicSettings } = this.settings;
        return publicSettings;
    }

    // Clear all settings
    async clearSettings() {
        this.settings = { ...this.defaults };
        await storageUtils.deleteData('settings', 'stealth');
        console.log('[SAFEY] Stealth settings cleared');
    }

    // Track activation
    async trackActivation() {
        this.settings.lastActivated = Date.now();
        this.settings.activationCount = (this.settings.activationCount || 0) + 1;
        await this.saveSettings();
    }
}

// Export singleton
const stealthSettings = new StealthSettings();

// Stealth settings manager
// Handles configuration for stealth/disguise mode

class StealthSettings {
    constructor() {
        this.defaults = {
            pin: null, // Will be hashed
            pinHash: null,
            pinLength: 6, // Configurable PIN length (4-8 digits), default 6 for better security
            disguiseTemplate: 'calculator', // calculator, notes, weather, news, custom
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
            autoAlertsEnabled: true, // Auto-send high-risk safety alerts after 10s
            debugMode: false,
            lastActivated: null,
            activationCount: 0,
            silentEmergencyEnabled: false,
            silentEmergencyConfig: {
                corner: 'bottom-right',
                tapCount: 3,
                tapTimeout: 800,
                areaRatio: 0.18
            },
            trustedContacts: [],
            trustedContactMessageTemplate: null
        };
        this.settings = null;
        this.flags = {
            hadExistingSettings: false,
            resetPerformed: false
        };
    }

    // Initialize settings
    async init() {
        const loadResult = await this.loadSettings();

        let settingsChanged = false;
        let pinReset = false;

        if (!this.settings) {
            this.settings = { ...this.defaults };
            settingsChanged = true;
        } else {
            // Merge defaults to ensure new keys are present while preserving user overrides
            this.settings = { ...this.defaults, ...this.settings };
            settingsChanged = true;
        }

        // Ensure nested defaults are merged correctly
        this.settings.silentEmergencyConfig = {
            ...this.defaults.silentEmergencyConfig,
            ...(this.settings.silentEmergencyConfig || {})
        };

        if (!Array.isArray(this.settings.trustedContacts)) {
            this.settings.trustedContacts = [];
        }

        if (typeof this.settings.silentEmergencyEnabled !== 'boolean') {
            this.settings.silentEmergencyEnabled = false;
        }

        // Legacy migration: ensure pinLength exists
        if (!Object.prototype.hasOwnProperty.call(this.settings, 'pinLength') || !this.settings.pinLength) {
            this.settings.pinLength = this.defaults.pinLength;
            settingsChanged = true;
        }
        
        // Legacy migration: hash plaintext PIN if still present
        if (this.settings.pin && !this.settings.pinHash) {
            this.settings.pinHash = await cryptoUtils.hashPin(this.settings.pin);
            delete this.settings.pin; // Remove plain text PIN
            settingsChanged = true;
        }

        // Ensure a PIN exists
        const desiredLength = this.settings.pinLength || this.defaults.pinLength;
        let forcePinRefresh = false;

        if (desiredLength < this.defaults.pinLength) {
            this.settings.pinLength = this.defaults.pinLength;
            forcePinRefresh = true;
            settingsChanged = true;
        }

        if (!this.settings.pinHash || forcePinRefresh) {
            // Only create default PIN if user had existing settings (not a fresh start)
            if (this.flags.hadExistingSettings) {
                const length = this.settings.pinLength || this.defaults.pinLength;
                const sequence = '1234567890';
                const fallbackPin = sequence.slice(0, Math.max(4, Math.min(length, 8)));
                await this.updatePin(fallbackPin);
                console.log(`[SAFEY] Default PIN initialized (${length} digits)`);
                pinReset = true;
                settingsChanged = false; // updatePin already persisted settings
            } else {
                console.log('[SAFEY] Fresh start - no default PIN created');
                if (settingsChanged) {
                    await this.saveSettings();
                }
            }
        } else if (settingsChanged) {
            await this.saveSettings();
        }

        // Auto-enable debug mode in development
        if (this.isDevelopmentMode() && !this.settings.debugMode) {
            this.settings.debugMode = true;
            await this.saveSettings();
        }

        this.applyDebugLoggingPreference();

        return {
            pinReset,
            pinLength: this.settings.pinLength,
            hadExistingSettings: this.flags.hadExistingSettings,
            resetPerformed: this.flags.resetPerformed
        };
    }

    applyDebugLoggingPreference() {
        if (typeof safeyLogger !== 'undefined') {
            safeyLogger.setDebugEnabled(this.settings?.debugMode === true);
        }
    }

    // Check if running in development mode
    isDevelopmentMode() {
        return (window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1') &&
               window.location.port === '5500';
    }

    // Load settings from storage
    async loadSettings() {
        try {
            let encrypted = await storageUtils.loadData('settings', 'stealth');
            if (encrypted && typeof encrypted === 'object' && encrypted.value) {
                encrypted = encrypted.value;
            }
            
            // Fallback to localStorage backup if IndexedDB miss
            if (!encrypted) {
                encrypted = localStorage.getItem('safey_settings_encrypted');
            }
            if (encrypted) {
                this.flags.hadExistingSettings = true;
                let decrypted = await cryptoUtils.decrypt(encrypted);
                
                // Handle legacy plaintext JSON that was never encrypted
                if (!decrypted && typeof encrypted === 'string') {
                    try {
                        decrypted = JSON.parse(encrypted);
                        console.warn('[SAFEY] Migrating legacy stealth settings (plaintext storage)');
                    } catch (parseError) {
                        // Ignore parse failure - will trigger reset below
                    }
                }

                if (decrypted) {
                    this.settings = decrypted;
                    console.log('[SAFEY] Stealth settings loaded');
                    this.flags.resetPerformed = false;
                    return this.settings;
                }

                console.warn('[SAFEY] Stealth settings corrupted. Resetting to defaults.');
                await storageUtils.deleteData('settings', 'stealth');
                localStorage.removeItem('safey_settings_encrypted');
                this.settings = null;
                this.flags.resetPerformed = true;
            } else {
                // Check localStorage for legacy settings
                const legacyPin = localStorage.getItem('safey_pin');
                if (legacyPin) {
                    this.flags.hadExistingSettings = true;
                    this.settings = { ...this.defaults, pin: legacyPin };
                    await this.saveSettings();
                    localStorage.removeItem('safey_pin');
                    this.flags.resetPerformed = false;
                }
            }
        } catch (error) {
            console.error('Error loading stealth settings:', error);
            await storageUtils.deleteData('settings', 'stealth');
            localStorage.removeItem('safey_settings_encrypted');
            this.settings = null;
            this.flags.resetPerformed = true;
        }
        return this.settings;
    }

    // Save settings to storage
    async saveSettings() {
        try {
            const encrypted = await cryptoUtils.encrypt(this.settings);
            if (encrypted) {
                await storageUtils.saveData('settings', 'stealth', encrypted);
                // Keep localStorage backup for resilience and faster cold-start
                localStorage.setItem('safey_settings_encrypted', encrypted);
                console.log('[SAFEY] Stealth settings saved');
                await eventLogger.logEvent('settingsUpdated', {
                    template: this.settings.disguiseTemplate
                });
                this.applyDebugLoggingPreference();
            }
        } catch (error) {
            console.error('Error saving stealth settings:', error);
        }
    }

    // Update PIN
    async updatePin(newPin) {
        const pinLength = this.getSetting('pinLength') || 6;
        const pinRegex = new RegExp(`^\\d{${pinLength}}$`);
        
        if (!newPin || !pinRegex.test(newPin)) {
            throw new Error(`PIN must be ${pinLength} digits`);
        }
        
        this.settings.pinHash = await cryptoUtils.hashPin(newPin);
        delete this.settings.pin; // Ensure no plain text
        await this.saveSettings();
        console.log('[SAFEY] PIN updated');
    }

    // Update PIN length (4-8 digits)
    async updatePinLength(length) {
        if (length < 4 || length > 8) {
            throw new Error('PIN length must be between 4 and 8 digits');
        }
        
        this.settings.pinLength = length;
        await this.saveSettings();
        console.log(`[SAFEY] PIN length updated to ${length} digits`);
    }

    // Verify PIN
    async verifyPin(pin) {
        const hash = await cryptoUtils.hashPin(pin);
        return hash === this.settings.pinHash;
    }

    // Update disguise template
    async updateTemplate(template) {
        const validTemplates = ['calculator', 'notes', 'weather', 'news', 'custom'];
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

    // Silent emergency helpers
    isSilentEmergencyEnabled() {
        return this.settings?.silentEmergencyEnabled === true;
    }

    async setSilentEmergencyEnabled(enabled) {
        this.settings.silentEmergencyEnabled = enabled === true;
        await this.saveSettings();
    }

    getSilentEmergencyConfig() {
        return {
            ...this.defaults.silentEmergencyConfig,
            ...(this.settings?.silentEmergencyConfig || {})
        };
    }

    async updateSilentEmergencyConfig(partialConfig = {}) {

        this.settings.silentEmergencyConfig = {
            ...this.getSilentEmergencyConfig(),
            ...partialConfig
        };
        await this.saveSettings();
    }

    getTrustedContacts() {
        const contacts = this.settings?.trustedContacts;
        return Array.isArray(contacts) ? contacts : [];
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

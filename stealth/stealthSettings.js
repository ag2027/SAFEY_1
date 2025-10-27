// Stealth Settings Module
// Manages stealth mode configuration and persistence

import storageUtil from './utils/storage.js';
import encryptionUtil from './utils/encryption.js';

class StealthSettings {
    constructor() {
        this.settings = {
            enabled: false,
            disguiseTemplate: 'calculator', // calculator, notes, weather, news, gallery, customUrl
            customUrl: '',
            customUrlSnapshot: null,
            pin: '1234',
            pinHash: null,
            triggers: {
                logoDoubleTap: true,
                cornerMultiTap: true,
                cornerTapCount: 4,
                cornerPosition: 'top-right' // top-right, top-left, bottom-right, bottom-left
            },
            autoLock: {
                enabled: true,
                timeoutMinutes: 5
            },
            behavioralChecks: {
                emergencyToggleThreshold: 2,
                emergencyToggleTimeWindow: 15, // minutes
                failedUnlockThreshold: 3,
                failedUnlockTimeWindow: 10, // minutes
                emergencyInactivityMinutes: 30
            },
            debugMode: false
        };
        this.initialized = false;
    }

    /**
     * Initialize settings
     */
    async init() {
        if (this.initialized) return;

        // Try to load settings
        const saved = await storageUtil.load('stealth_settings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        } else {
            // First time setup - hash the default PIN
            this.settings.pinHash = await encryptionUtil.hashPin(this.settings.pin);
            await this.save();
        }

        this.initialized = true;
        console.log('[StealthSettings] Initialized');
    }

    /**
     * Get all settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Update settings
     */
    async updateSettings(updates) {
        // If PIN is being updated, hash it
        if (updates.pin && updates.pin !== this.settings.pin) {
            updates.pinHash = await encryptionUtil.hashPin(updates.pin);
        }

        this.settings = { ...this.settings, ...updates };
        await this.save();
        console.log('[StealthSettings] Settings updated');
    }

    /**
     * Set PIN
     */
    async setPin(newPin) {
        if (!/^\d{4}$/.test(newPin)) {
            throw new Error('PIN must be 4 digits');
        }

        this.settings.pin = newPin;
        this.settings.pinHash = await encryptionUtil.hashPin(newPin);
        await this.save();
        console.log('[StealthSettings] PIN updated');
    }

    /**
     * Verify PIN
     */
    async verifyPin(pin) {
        const hash = await encryptionUtil.hashPin(pin);
        return hash === this.settings.pinHash;
    }

    /**
     * Get PIN (for internal use)
     */
    getPin() {
        return this.settings.pin;
    }

    /**
     * Set disguise template
     */
    async setDisguiseTemplate(template) {
        const validTemplates = ['calculator', 'notes', 'weather', 'news', 'gallery', 'customUrl'];
        if (!validTemplates.includes(template)) {
            throw new Error(`Invalid template: ${template}`);
        }

        this.settings.disguiseTemplate = template;
        await this.save();
        console.log('[StealthSettings] Disguise template set to:', template);
    }

    /**
     * Set custom URL
     */
    async setCustomUrl(url, snapshot = null) {
        this.settings.customUrl = url;
        this.settings.customUrlSnapshot = snapshot;
        await this.save();
        console.log('[StealthSettings] Custom URL set');
    }

    /**
     * Enable/disable trigger
     */
    async setTrigger(triggerName, enabled) {
        if (this.settings.triggers.hasOwnProperty(triggerName)) {
            this.settings.triggers[triggerName] = enabled;
            await this.save();
            console.log(`[StealthSettings] Trigger ${triggerName} set to:`, enabled);
        }
    }

    /**
     * Set auto-lock timeout
     */
    async setAutoLockTimeout(minutes) {
        this.settings.autoLock.timeoutMinutes = minutes;
        await this.save();
        console.log('[StealthSettings] Auto-lock timeout set to:', minutes, 'minutes');
    }

    /**
     * Enable/disable debug mode
     */
    async setDebugMode(enabled) {
        this.settings.debugMode = enabled;
        await this.save();
        console.log('[StealthSettings] Debug mode:', enabled);
    }

    /**
     * Save settings to storage
     */
    async save() {
        await storageUtil.save('stealth_settings', this.settings);
    }

    /**
     * Clear all settings
     */
    async clear() {
        this.settings = {
            enabled: false,
            disguiseTemplate: 'calculator',
            customUrl: '',
            customUrlSnapshot: null,
            pin: '1234',
            pinHash: await encryptionUtil.hashPin('1234'),
            triggers: {
                logoDoubleTap: true,
                cornerMultiTap: true,
                cornerTapCount: 4,
                cornerPosition: 'top-right'
            },
            autoLock: {
                enabled: true,
                timeoutMinutes: 5
            },
            behavioralChecks: {
                emergencyToggleThreshold: 2,
                emergencyToggleTimeWindow: 15,
                failedUnlockThreshold: 3,
                failedUnlockTimeWindow: 10,
                emergencyInactivityMinutes: 30
            },
            debugMode: false
        };
        await this.save();
        console.log('[StealthSettings] Settings cleared');
    }
}

// Export singleton instance
const stealthSettings = new StealthSettings();
export default stealthSettings;

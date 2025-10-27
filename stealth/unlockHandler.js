// Unlock Handler Module
// Manages unlock attempts and PIN verification

import stealthSettings from './stealthSettings.js';
import eventLogger from './utils/eventLogger.js';

class UnlockHandler {
    constructor() {
        this.failedAttempts = [];
        this.suspiciousCounter = 0;
        this.unlockCallback = null;
    }

    /**
     * Initialize unlock handler
     */
    init(unlockCallback) {
        this.unlockCallback = unlockCallback;
        console.log('[UnlockHandler] Initialized');
    }

    /**
     * Attempt to unlock with PIN
     */
    async attemptUnlock(enteredPin) {
        console.log('[UnlockHandler] Unlock attempt');
        
        // Log unlock attempt
        await eventLogger.logEvent('unlockAttempt', { timestamp: Date.now() });

        // Verify PIN
        const isValid = await stealthSettings.verifyPin(enteredPin);

        if (isValid) {
            // Successful unlock
            console.log('[UnlockHandler] Unlock successful');
            await eventLogger.logEvent('unlockSuccess', { timestamp: Date.now() });
            
            // Clear failed attempts
            this.failedAttempts = [];
            
            // Call unlock callback with success
            if (this.unlockCallback) {
                this.unlockCallback(true);
            }
            
            return true;
        } else {
            // Failed unlock
            console.log('[UnlockHandler] Unlock failed');
            await eventLogger.logEvent('unlockFail', { timestamp: Date.now() });
            
            // Track failed attempt
            this._trackFailedAttempt();
            
            // Call unlock callback with failure
            if (this.unlockCallback) {
                this.unlockCallback(false);
            }
            
            return false;
        }
    }

    /**
     * Track failed unlock attempt
     */
    _trackFailedAttempt() {
        const now = Date.now();
        this.failedAttempts.push(now);

        // Keep only recent attempts
        const settings = stealthSettings.getSettings();
        const timeWindow = (settings.behavioralChecks.failedUnlockTimeWindow || 10) * 60 * 1000;
        this.failedAttempts = this.failedAttempts.filter(time => now - time < timeWindow);

        // Check if threshold exceeded
        const threshold = settings.behavioralChecks.failedUnlockThreshold || 3;
        if (this.failedAttempts.length >= threshold) {
            console.warn('[UnlockHandler] Failed unlock threshold exceeded');
            this.suspiciousCounter++;
            
            // Log suspicious event
            eventLogger.logEvent('suspiciousDetected', { 
                reason: 'failedUnlockThreshold',
                failedAttempts: this.failedAttempts.length 
            });

            // Reset failed attempts counter
            this.failedAttempts = [];
        }
    }

    /**
     * Get failed attempts count
     */
    getFailedAttemptsCount() {
        return this.failedAttempts.length;
    }

    /**
     * Get suspicious counter
     */
    getSuspiciousCounter() {
        return this.suspiciousCounter;
    }

    /**
     * Reset failed attempts
     */
    resetFailedAttempts() {
        this.failedAttempts = [];
        console.log('[UnlockHandler] Failed attempts reset');
    }

    /**
     * Reset suspicious counter
     */
    resetSuspiciousCounter() {
        this.suspiciousCounter = 0;
        console.log('[UnlockHandler] Suspicious counter reset');
    }

    /**
     * Reset all counters
     */
    reset() {
        this.failedAttempts = [];
        this.suspiciousCounter = 0;
        console.log('[UnlockHandler] All counters reset');
    }
}

// Export singleton instance
const unlockHandler = new UnlockHandler();
export default unlockHandler;

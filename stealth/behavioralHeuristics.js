// Behavioral Heuristics Module
// Detects suspicious patterns and prompts safety checks

import stealthSettings from './stealthSettings.js';
import eventLogger from './utils/eventLogger.js';

class BehavioralHeuristics {
    constructor() {
        this.safetyCheckCallback = null;
        this.checkInterval = null;
    }

    /**
     * Initialize behavioral heuristics
     */
    init(safetyCheckCallback) {
        this.safetyCheckCallback = safetyCheckCallback;
        
        // Start periodic checks every 30 seconds
        this.checkInterval = setInterval(() => {
            this._runHeuristics();
        }, 30000);

        console.log('[BehavioralHeuristics] Initialized');
    }

    /**
     * Run all heuristics checks
     */
    async _runHeuristics() {
        const settings = stealthSettings.getSettings();
        const events = eventLogger.getEvents();

        // Check 1: Emergency mode toggled multiple times
        if (this._checkEmergencyTogglePattern(events, settings)) {
            this._triggerSafetyCheck('Multiple emergency mode activations detected');
            return;
        }

        // Check 2: Failed unlock attempts
        if (this._checkFailedUnlockPattern(events, settings)) {
            this._triggerSafetyCheck('Multiple failed unlock attempts detected');
            return;
        }

        // Check 3: Emergency mode entered with no activity
        if (this._checkEmergencyInactivityPattern(events, settings)) {
            this._triggerSafetyCheck('Emergency mode entered with unusual inactivity');
            return;
        }
    }

    /**
     * Check for emergency toggle pattern
     */
    _checkEmergencyTogglePattern(events, settings) {
        const threshold = settings.behavioralChecks.emergencyToggleThreshold || 2;
        const timeWindow = (settings.behavioralChecks.emergencyToggleTimeWindow || 15) * 60 * 1000;
        const now = Date.now();

        const recentEmergencyEvents = events.filter(e => 
            e.type === 'emergencyToggled' && 
            (now - e.timestamp) < timeWindow
        );

        return recentEmergencyEvents.length > threshold;
    }

    /**
     * Check for failed unlock pattern
     */
    _checkFailedUnlockPattern(events, settings) {
        const threshold = settings.behavioralChecks.failedUnlockThreshold || 3;
        const timeWindow = (settings.behavioralChecks.failedUnlockTimeWindow || 10) * 60 * 1000;
        const now = Date.now();

        const recentFailedUnlocks = events.filter(e => 
            e.type === 'unlockFail' && 
            (now - e.timestamp) < timeWindow
        );

        return recentFailedUnlocks.length >= threshold;
    }

    /**
     * Check for emergency inactivity pattern
     */
    _checkEmergencyInactivityPattern(events, settings) {
        const inactivityMinutes = settings.behavioralChecks.emergencyInactivityMinutes || 30;
        const inactivityThreshold = inactivityMinutes * 60 * 1000;
        const now = Date.now();

        // Find last emergency toggle
        const lastEmergency = events.filter(e => e.type === 'emergencyToggled')
            .sort((a, b) => b.timestamp - a.timestamp)[0];

        if (!lastEmergency) return false;

        // Check if any activity since emergency
        const activitySinceEmergency = events.filter(e => 
            e.timestamp > lastEmergency.timestamp &&
            e.type !== 'emergencyToggled'
        );

        // If emergency was activated and no activity for threshold time
        return activitySinceEmergency.length === 0 && 
               (now - lastEmergency.timestamp) > inactivityThreshold;
    }

    /**
     * Trigger safety check prompt
     */
    _triggerSafetyCheck(reason) {
        console.warn('[BehavioralHeuristics] Suspicious pattern detected:', reason);
        
        // Log suspicious event
        eventLogger.logEvent('suspiciousDetected', { reason });

        // Call safety check callback
        if (this.safetyCheckCallback) {
            this.safetyCheckCallback(reason);
        }
    }

    /**
     * Manual check (can be called externally)
     */
    async checkNow() {
        await this._runHeuristics();
    }

    /**
     * Stop checking
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        console.log('[BehavioralHeuristics] Destroyed');
    }
}

// Export singleton instance
const behavioralHeuristics = new BehavioralHeuristics();
export default behavioralHeuristics;

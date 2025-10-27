// Event Logging Utility for SAFEY Stealth Mode
// Tracks behavioral events for safety heuristics

import storageUtil from './storage.js';
import encryptionUtil from './encryption.js';

class EventLogger {
    constructor() {
        this.events = [];
        this.maxEvents = 100; // Keep last 100 events
        this.initialized = false;
        this.pin = null;
    }

    /**
     * Initialize event logger with PIN for encryption
     */
    async init(pin) {
        if (this.initialized && this.pin === pin) return;
        
        this.pin = pin;
        this.events = await storageUtil.loadEncrypted('event_logs', pin) || [];
        this.initialized = true;
    }

    /**
     * Log an event
     * @param {string} type - Event type
     * @param {Object} metadata - Additional event data
     */
    async logEvent(type, metadata = {}) {
        if (!this.initialized || !this.pin) {
            console.warn('EventLogger not initialized');
            return;
        }

        const event = {
            type,
            timestamp: Date.now(),
            metadata
        };

        this.events.push(event);

        // Keep only last maxEvents
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        // Save to storage
        await storageUtil.saveEncrypted('event_logs', this.events, this.pin);

        // Log to console for debugging
        console.log(`[EventLog] ${type}`, metadata);
    }

    /**
     * Get all events
     */
    getEvents() {
        return [...this.events];
    }

    /**
     * Get events by type
     */
    getEventsByType(type) {
        return this.events.filter(e => e.type === type);
    }

    /**
     * Get events in time range
     */
    getEventsInTimeRange(startTime, endTime) {
        return this.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
    }

    /**
     * Get recent events (last N minutes)
     */
    getRecentEvents(minutes = 15) {
        const now = Date.now();
        const threshold = now - (minutes * 60 * 1000);
        return this.events.filter(e => e.timestamp > threshold);
    }

    /**
     * Clear all events
     */
    async clearEvents() {
        if (!this.pin) return;
        
        this.events = [];
        await storageUtil.delete('event_logs');
        console.log('[EventLog] All events cleared');
    }

    /**
     * Get masked events for debug display
     */
    getMaskedEvents() {
        return this.events.map(e => ({
            type: e.type,
            timestamp: new Date(e.timestamp).toLocaleString(),
            metadata: this._maskSensitiveData(e.metadata)
        }));
    }

    /**
     * Mask sensitive data in metadata
     */
    _maskSensitiveData(metadata) {
        const masked = { ...metadata };
        
        // Mask sensitive fields
        const sensitiveFields = ['pin', 'password', 'url', 'customUrl'];
        sensitiveFields.forEach(field => {
            if (masked[field]) {
                masked[field] = '***MASKED***';
            }
        });

        return masked;
    }

    /**
     * Export events as JSON for demo webhook
     */
    exportForWebhook() {
        return {
            type: 'safety_check',
            timestamp: Date.now(),
            eventCount: this.events.length,
            recentEvents: this.getRecentEvents(60).map(e => ({
                type: e.type,
                timestamp: e.timestamp,
                metadata: this._maskSensitiveData(e.metadata)
            }))
        };
    }
}

// Export singleton instance
const eventLogger = new EventLogger();
export default eventLogger;

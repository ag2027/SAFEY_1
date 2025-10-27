// Event logging system for behavioral tracking
// Logs events with encryption for privacy

class EventLogger {
    constructor() {
        this.eventTypes = [
            'stealthActivated',
            'unlockAttempt',
            'unlockSuccess',
            'unlockFail',
            'emergencyToggled',
            'suspiciousDetected',
            'safetyCheckSent',
            'appStart',
            'disguiseChanged',
            'settingsUpdated'
        ];
        this.maxEvents = 100;
    }

    // Log an event
    async logEvent(type, metadata = {}) {
        console.log(`[SAFEY Event] ${type}`, metadata);
        
        const event = {
            type,
            timestamp: Date.now(),
            metadata,
            userAgent: navigator.userAgent.substring(0, 50) // Limited for privacy
        };

        try {
            // Encrypt the event before storing
            const encrypted = await cryptoUtils.encrypt(event);
            if (encrypted) {
                await storageUtils.addEvent({ 
                    type, 
                    timestamp: event.timestamp,
                    encrypted 
                });
            } else {
                // Fallback: store unencrypted if encryption fails
                await storageUtils.addEvent(event);
            }
        } catch (error) {
            console.error('Event logging error:', error);
        }

        return event;
    }

    // Get all events (decrypted)
    async getEvents(limit = null) {
        try {
            const events = await storageUtils.getAllEvents();
            const decrypted = [];

            for (const event of events) {
                if (event.encrypted) {
                    const decryptedEvent = await cryptoUtils.decrypt(event.encrypted);
                    if (decryptedEvent) {
                        decrypted.push(decryptedEvent);
                    }
                } else {
                    decrypted.push(event);
                }
            }

            // Sort by timestamp (newest first)
            decrypted.sort((a, b) => b.timestamp - a.timestamp);

            return limit ? decrypted.slice(0, limit) : decrypted;
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    }

    // Get events by type
    async getEventsByType(type, limit = null) {
        const allEvents = await this.getEvents();
        const filtered = allEvents.filter(e => e.type === type);
        return limit ? filtered.slice(0, limit) : filtered;
    }

    // Get events in time range
    async getEventsInRange(startTime, endTime) {
        const allEvents = await this.getEvents();
        return allEvents.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
    }

    // Clear all events
    async clearEvents() {
        try {
            await storageUtils.deleteData('events', 'all');
            console.log('[SAFEY] All events cleared');
        } catch (error) {
            console.error('Error clearing events:', error);
        }
    }

    // Get masked events for debug UI
    async getMaskedEvents(limit = 10) {
        const events = await this.getEvents(limit);
        return events.map(e => ({
            type: e.type,
            timestamp: new Date(e.timestamp).toLocaleString(),
            metadata: e.metadata ? Object.keys(e.metadata).join(', ') : 'none'
        }));
    }
}

// Export singleton
const eventLogger = new EventLogger();

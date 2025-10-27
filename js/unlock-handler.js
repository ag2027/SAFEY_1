// Unlock handler
// Manages PIN/pattern unlock with failed attempt tracking

class UnlockHandler {
    constructor() {
        this.failedAttempts = [];
        this.suspiciousCounter = 0;
        this.isUnlocking = false;
        this.safetyQueue = []; // Queue for pending safety checks during stealth mode
        this.maxQueueSize = 5; // Prevent queue overflow
        this.isFlushingQueue = false; // Prevent concurrent queue flushing
    }

    // Initialize
    async init() {
        await stealthSettings.init();
        
        // Ensure default PIN exists
        const pinHash = stealthSettings.getSetting('pinHash');
        if (!pinHash) {
            // Set default PIN: 1234
            await stealthSettings.updatePin('1234');
            console.log('[SAFEY] Default PIN set to 1234');
        }
    }

    // Attempt unlock with PIN
    async attemptUnlock(pin) {
        if (this.isUnlocking) return false;
        this.isUnlocking = true;
        
        try {
            await eventLogger.logEvent('unlockAttempt', { 
                timestamp: Date.now(),
                pinLength: pin?.length || 0
            });
            
            const isValid = await stealthSettings.verifyPin(pin);
            
            if (isValid) {
                console.log('[SAFEY] Unlock successful');
                await eventLogger.logEvent('unlockSuccess');
                await this.handleUnlockSuccess();
                return true;
            } else {
                console.log('[SAFEY] Unlock failed');
                await eventLogger.logEvent('unlockFail');
                await this.handleUnlockFailure();
                return false;
            }
        } finally {
            this.isUnlocking = false;
        }
    }

    // Handle successful unlock
    async handleUnlockSuccess() {
        // Clear failed attempts
        this.failedAttempts = [];
        
        // Animate fade to home
        const stealthScreen = document.getElementById('stealth-screen');
        if (stealthScreen) {
            stealthScreen.classList.add('fade-out');
            await this.sleep(150);
        }
        
        // Dispatch unlock event
        const event = new CustomEvent('stealthUnlock', {
            detail: { success: true, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
        
        // Reset title
        document.title = 'Notes';
    }

    // Handle failed unlock
    async handleUnlockFailure() {
        const now = Date.now();
        
        // Add failed attempt
        this.failedAttempts.push({
            timestamp: now,
            userAgent: navigator.userAgent.substring(0, 50)
        });
        
        // Check thresholds
        const threshold = stealthSettings.getSetting('failedAttemptThreshold') || 3;
        const window = (stealthSettings.getSetting('failedAttemptWindow') || 2) * 60 * 1000;
        
        // Remove old attempts outside window
        this.failedAttempts = this.failedAttempts.filter(
            attempt => now - attempt.timestamp < window
        );
        
        console.log(`[SAFEY] Failed attempts in window: ${this.failedAttempts.length}/${threshold}`);
        
        // Check if threshold exceeded
        if (this.failedAttempts.length >= threshold) {
            console.log('[SAFEY] Failed attempt threshold exceeded - suspicious behavior detected');
            this.suspiciousCounter++;
            
            await eventLogger.logEvent('suspiciousDetected', {
                reason: 'failedUnlockAttempts',
                count: this.failedAttempts.length,
                suspiciousCounter: this.suspiciousCounter
            });
            
            // Reset failed attempts after triggering suspicious detection
            this.failedAttempts = [];
            
            // Show safety check prompt
            await this.promptSafetyCheck('Multiple failed unlock attempts detected');
        }
    }

    // Check for suspicious patterns
    async checkSuspiciousPatterns() {
        const now = Date.now();
        
        // Pattern 1: Emergency mode toggled >2 times in 15 minutes
        const emergencyEvents = await eventLogger.getEventsByType('emergencyToggled');
        const recent15min = emergencyEvents.filter(
            e => now - e.timestamp < 15 * 60 * 1000
        );
        
        if (recent15min.length > 2) {
            console.log('[SAFEY] Suspicious: Multiple emergency toggles');
            await eventLogger.logEvent('suspiciousDetected', {
                reason: 'multipleEmergencyToggles',
                count: recent15min.length
            });
            await this.promptSafetyCheck('Multiple emergency mode activations detected');
            return;
        }
        
        // Pattern 2: Failed unlock attempts >= 3 in 10 minutes
        const failedUnlocks = await eventLogger.getEventsByType('unlockFail');
        const recent10min = failedUnlocks.filter(
            e => now - e.timestamp < 10 * 60 * 1000
        );
        
        if (recent10min.length >= 3) {
            console.log('[SAFEY] Suspicious: Multiple failed unlocks');
            await eventLogger.logEvent('suspiciousDetected', {
                reason: 'multipleFailedUnlocks',
                count: recent10min.length
            });
            await this.promptSafetyCheck('Multiple failed unlock attempts detected');
            return;
        }
        
        // Pattern 3: Emergency mode with no activity (check last event age)
        const lastEmergency = emergencyEvents[0];
        if (lastEmergency) {
            const timeSinceEmergency = now - lastEmergency.timestamp;
            const inactivityThreshold = 30 * 60 * 1000; // 30 minutes
            
            if (timeSinceEmergency > inactivityThreshold) {
                // Get all events since emergency
                const eventsSince = await eventLogger.getEventsInRange(
                    lastEmergency.timestamp,
                    now
                );
                
                // If very few events, might indicate coercion
                if (eventsSince.length < 3) {
                    console.log('[SAFEY] Suspicious: Emergency mode with minimal activity');
                    await eventLogger.logEvent('suspiciousDetected', {
                        reason: 'emergencyNoActivity',
                        timeSinceEmergency
                    });
                }
            }
        }
    }

    // Prompt safety check
    async promptSafetyCheck(reason) {
        console.log(`[SAFEY] Safety check triggered: ${reason}`);
        
        // Check if stealth mode is active
        const isStealthActive = stealthController.isActive;
        
        if (isStealthActive) {
            // Queue the alert instead of showing popup
            await this.queueSafetyCheck(reason);
            console.log('[SAFEY] Safety check queued (stealth mode active)');
            return false; // Queued, not shown
        } else {
            // Show popup immediately when not in stealth mode
            return await this.showSafetyCheckPopup(reason);
        }
    }

    // Queue safety check for later (during stealth mode)
    async queueSafetyCheck(reason) {
        // Prevent queue overflow
        if (this.safetyQueue.length >= this.maxQueueSize) {
            console.log('[SAFEY] Safety queue full, removing oldest alert');
            this.safetyQueue.shift(); // Remove oldest
        }
        
        const alert = {
            reason,
            timestamp: Date.now(),
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        this.safetyQueue.push(alert);
        
        // Log to encrypted storage
        await eventLogger.logEvent('safetyCheckQueued', {
            reason,
            queueSize: this.safetyQueue.length,
            timestamp: alert.timestamp
        });
        
        // Save queue to localStorage (encrypted)
        await this.saveSafetyQueue();
        
        console.log(`[SAFEY] Safety check queued (${this.safetyQueue.length}/${this.maxQueueSize}): ${reason}`);
    }

    // Save safety queue to encrypted storage
    async saveSafetyQueue() {
        try {
            const encrypted = await cryptoUtils.encrypt({
                queue: this.safetyQueue,
                timestamp: Date.now()
            });
            if (encrypted) {
                localStorage.setItem('safey_safety_queue', encrypted);
            }
        } catch (error) {
            console.error('[SAFEY] Error saving safety queue:', error);
        }
    }

    // Load safety queue from encrypted storage
    async loadSafetyQueue() {
        try {
            const encrypted = localStorage.getItem('safey_safety_queue');
            if (encrypted) {
                const decrypted = await cryptoUtils.decrypt(encrypted);
                if (decrypted && decrypted.queue) {
                    this.safetyQueue = decrypted.queue;
                    console.log(`[SAFEY] Safety queue loaded: ${this.safetyQueue.length} alerts`);
                }
            }
        } catch (error) {
            console.error('[SAFEY] Error loading safety queue:', error);
            this.safetyQueue = [];
        }
    }

    // Flush safety queue (show all queued alerts)
    async flushSafetyQueue() {
        if (this.isFlushingQueue) {
            console.log('[SAFEY] Already flushing queue, skipping');
            return;
        }
        
        if (this.safetyQueue.length === 0) {
            console.log('[SAFEY] No queued safety checks to flush');
            return;
        }
        
        this.isFlushingQueue = true;
        console.log(`[SAFEY] Flushing ${this.safetyQueue.length} queued safety checks`);
        
        await eventLogger.logEvent('safetyQueueFlushing', {
            queueSize: this.safetyQueue.length,
            timestamp: Date.now()
        });
        
        // Show alerts sequentially with 2-second delay
        const alerts = [...this.safetyQueue]; // Copy queue
        this.safetyQueue = []; // Clear queue immediately
        await this.saveSafetyQueue(); // Save cleared queue
        
        for (let i = 0; i < alerts.length; i++) {
            const alert = alerts[i];
            console.log(`[SAFEY] Showing queued alert ${i + 1}/${alerts.length}: ${alert.reason}`);
            
            await this.showSafetyCheckPopup(alert.reason);
            
            // Wait 2 seconds before next alert (except for last one)
            if (i < alerts.length - 1) {
                await this.sleep(2000);
            }
        }
        
        this.isFlushingQueue = false;
        console.log('[SAFEY] Queue flush complete');
        
        await eventLogger.logEvent('safetyQueueFlushed', {
            alertsShown: alerts.length,
            timestamp: Date.now()
        });
    }

    // Show safety check popup (extracted from promptSafetyCheck)
    async showSafetyCheckPopup(reason) {
        console.log(`[SAFEY] Prompting safety check: ${reason}`);
        
        // Create slide-up card
        const card = document.createElement('div');
        card.id = 'safety-check-card';
        card.className = 'fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 z-50 transform translate-y-full transition-transform duration-300';
        card.innerHTML = `
            <div class="max-w-md mx-auto">
                <div class="flex items-start gap-4 mb-4">
                    <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Safety Check</h3>
                        <p class="text-sm text-gray-600">We detected something that might be unsafe. Would you like to send a safety check to a trusted contact?</p>
                        <p class="text-xs text-gray-400 mt-1">${reason}</p>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button id="safety-check-cancel" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition">
                        Cancel
                    </button>
                    <button id="safety-check-send" class="flex-1 bg-trust-blue hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition">
                        Send Check
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(card);
        
        // Animate slide up
        await this.sleep(50);
        card.classList.remove('translate-y-full');
        
        // Handle buttons
        return new Promise((resolve) => {
            document.getElementById('safety-check-cancel').addEventListener('click', () => {
                this.closeSafetyCheckCard(card);
                resolve(false);
            });
            
            document.getElementById('safety-check-send').addEventListener('click', async () => {
                await this.sendSafetyCheck();
                this.closeSafetyCheckCard(card);
                resolve(true);
            });
        });
    }

    // Close safety check card
    async closeSafetyCheckCard(card) {
        card.classList.add('translate-y-full');
        await this.sleep(300);
        card.remove();
    }

    // Send safety check
    async sendSafetyCheck() {
        const lastEvents = await eventLogger.getEvents(10);
        
        const payload = {
            type: 'safety_check',
            timestamp: Date.now(),
            lastEventLog: lastEvents.map(e => ({
                type: e.type,
                timestamp: e.timestamp
            }))
        };
        
        console.log('[SAFEY] Safety check sent:', payload);
        
        // Demo webhook (would be actual endpoint in production)
        // In a real implementation, this would call a configured webhook URL
        await eventLogger.logEvent('safetyCheckSent', payload);
        
        // Show confirmation
        alert('Safety check sent to your trusted contact (demo mode)');
    }

    // Helper: sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get suspicious counter
    getSuspiciousCounter() {
        return this.suspiciousCounter;
    }

    // Reset suspicious counter
    resetSuspiciousCounter() {
        this.suspiciousCounter = 0;
        this.failedAttempts = [];
    }

    // Get safety queue status (for debugging)
    getSafetyQueueStatus() {
        return {
            queueSize: this.safetyQueue.length,
            maxSize: this.maxQueueSize,
            isFlushingQueue: this.isFlushingQueue,
            queue: this.safetyQueue.map(alert => ({
                reason: alert.reason,
                timestamp: new Date(alert.timestamp).toLocaleString(),
                id: alert.id
            }))
        };
    }

    // Clear safety queue (for testing/debugging)
    async clearSafetyQueue() {
        this.safetyQueue = [];
        await this.saveSafetyQueue();
        console.log('[SAFEY] Safety queue cleared');
    }
}

// Export singleton
const unlockHandler = new UnlockHandler();

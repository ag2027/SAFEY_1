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
        this.autoAlertTimers = {}; // Track automatic alert timers for high-risk events
        this.riskLevels = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
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
            
            // Pattern detection now handled by checkSuspiciousPatterns() method
        }
    }

    // Check for suspicious patterns with smart risk classification
    async checkSuspiciousPatterns() {
        const now = Date.now();
        const patterns = [];
        
        // Pattern 1: Emergency mode toggled >2 times in 15 minutes
        const emergencyEvents = await eventLogger.getEventsByType('emergencyToggled');
        const recent15min = emergencyEvents.filter(
            e => now - e.timestamp < 15 * 60 * 1000
        );
        
        if (recent15min.length > 2) {
            patterns.push({
                type: 'multipleEmergencyToggles',
                count: recent15min.length,
                severity: recent15min.length >= 5 ? this.riskLevels.HIGH : this.riskLevels.MEDIUM,
                message: `${recent15min.length} emergency mode activations in 15 minutes`
            });
        }
        
        // Pattern 2: Failed unlock attempts >= 3 in 10 minutes
        const failedUnlocks = await eventLogger.getEventsByType('unlockFail');
        const recent10min = failedUnlocks.filter(
            e => now - e.timestamp < 10 * 60 * 1000
        );
        
        if (recent10min.length >= 3) {
            patterns.push({
                type: 'multipleFailedUnlocks',
                count: recent10min.length,
                severity: recent10min.length >= 5 ? this.riskLevels.HIGH : this.riskLevels.MEDIUM,
                message: `${recent10min.length} failed unlock attempts in 10 minutes`
            });
        }
        
        // Pattern 3: Emergency mode with no activity (prolonged inactivity)
        const lastEmergency = emergencyEvents[0];
        if (lastEmergency) {
            const timeSinceEmergency = now - lastEmergency.timestamp;
            const inactivityThreshold = 30 * 60 * 1000; // 30 minutes
            
            if (timeSinceEmergency > inactivityThreshold) {
                const eventsSince = await eventLogger.getEventsInRange(
                    lastEmergency.timestamp,
                    now
                );
                
                // If very few events, might indicate coercion
                if (eventsSince.length < 3) {
                    patterns.push({
                        type: 'emergencyNoActivity',
                        timeSinceEmergency: Math.floor(timeSinceEmergency / 60000),
                        severity: this.riskLevels.HIGH,
                        message: `${Math.floor(timeSinceEmergency / 60000)} minutes of inactivity after emergency mode`
                    });
                }
            }
        }
        
        // Pattern 4: Rapid stealth activations (potential panic)
        const stealthEvents = await eventLogger.getEventsByType('stealthActivated');
        const recent5min = stealthEvents.filter(
            e => now - e.timestamp < 5 * 60 * 1000
        );
        
        if (recent5min.length >= 3) {
            patterns.push({
                type: 'rapidStealthActivations',
                count: recent5min.length,
                severity: this.riskLevels.MEDIUM,
                message: `${recent5min.length} stealth mode activations in 5 minutes`
            });
        }
        
        // Pattern 5: Suspicious activity detected multiple times
        const suspiciousEvents = await eventLogger.getEventsByType('suspiciousDetected');
        const recentSuspicious = suspiciousEvents.filter(
            e => now - e.timestamp < 30 * 60 * 1000
        );
        
        if (recentSuspicious.length >= 2) {
            patterns.push({
                type: 'repeatedSuspiciousActivity',
                count: recentSuspicious.length,
                severity: this.riskLevels.HIGH,
                message: `${recentSuspicious.length} suspicious patterns detected in 30 minutes`
            });
        }
        
        // Process detected patterns with smart safety check
        if (patterns.length > 0) {
            await this.smartSafetyCheck(patterns);
        }
    }

    // Smart safety check with risk classification and auto-escalation
    async smartSafetyCheck(patterns) {
        // Calculate overall risk level
        const riskLevel = this.calculateRiskLevel(patterns);
        
        // Build detailed message
        const message = this.buildSafetyCheckMessage(patterns, riskLevel);
        
        // Log the aggregated suspicious activity
        await eventLogger.logEvent('suspiciousDetected', {
            patterns: patterns.map(p => ({
                type: p.type,
                severity: p.severity,
                count: p.count
            })),
            riskLevel,
            timestamp: Date.now()
        });
        
        console.log(`[SAFEY] Smart safety check triggered - Risk Level: ${riskLevel.toUpperCase()}`);
        
        // Queue or show safety check based on stealth mode
        await this.promptSafetyCheck(message, riskLevel);
    }

    // Calculate overall risk level from multiple patterns
    calculateRiskLevel(patterns) {
        const highCount = patterns.filter(p => p.severity === this.riskLevels.HIGH).length;
        const mediumCount = patterns.filter(p => p.severity === this.riskLevels.MEDIUM).length;
        
        // High risk if any high-severity pattern or multiple medium patterns
        if (highCount > 0 || mediumCount >= 2) {
            return this.riskLevels.HIGH;
        }
        
        // Medium risk if one medium-severity pattern
        if (mediumCount > 0) {
            return this.riskLevels.MEDIUM;
        }
        
        // Otherwise low risk
        return this.riskLevels.LOW;
    }

    // Build safety check message from patterns
    buildSafetyCheckMessage(patterns, riskLevel) {
        const urgencyPrefix = riskLevel === this.riskLevels.HIGH 
            ? '⚠️ URGENT: ' 
            : riskLevel === this.riskLevels.MEDIUM 
            ? '⚡ ALERT: ' 
            : '⚠️ NOTICE: ';
        
        const messages = patterns.map(p => p.message);
        
        return urgencyPrefix + messages.join(', ');
    }

    // Prompt safety check with risk level
    async promptSafetyCheck(reason, riskLevel = this.riskLevels.LOW) {
        console.log(`[SAFEY] Safety check triggered: ${reason}`);
        
        // Check if stealth mode is active
        const isStealthActive = stealthController.isActive;
        
        if (isStealthActive) {
            // Queue the alert instead of showing popup
            await this.queueSafetyCheck(reason, riskLevel);
            console.log('[SAFEY] Safety check queued (stealth mode active)');
            return false; // Queued, not shown
        } else {
            // Show popup immediately when not in stealth mode
            return await this.showSafetyCheckPopup(reason, riskLevel);
        }
    }

    // Queue safety check for later (during stealth mode)
    async queueSafetyCheck(reason, riskLevel = this.riskLevels.LOW) {
        // Prevent queue overflow
        if (this.safetyQueue.length >= this.maxQueueSize) {
            console.log('[SAFEY] Safety queue full, removing oldest alert');
            this.safetyQueue.shift(); // Remove oldest
        }
        
        const alert = {
            reason,
            riskLevel,
            timestamp: Date.now(),
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        this.safetyQueue.push(alert);
        
        // Log to encrypted storage
        await eventLogger.logEvent('safetyCheckQueued', {
            reason,
            riskLevel,
            queueSize: this.safetyQueue.length,
            timestamp: alert.timestamp
        });
        
        // Save queue to localStorage (encrypted)
        await this.saveSafetyQueue();
        
        console.log(`[SAFEY] Safety check queued (${this.safetyQueue.length}/${this.maxQueueSize}) - Risk: ${riskLevel.toUpperCase()}: ${reason}`);
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
            console.log(`[SAFEY] Showing queued alert ${i + 1}/${alerts.length} - Risk: ${alert.riskLevel?.toUpperCase() || 'UNKNOWN'}: ${alert.reason}`);
            
            await this.showSafetyCheckPopup(alert.reason, alert.riskLevel || this.riskLevels.LOW);
            
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

    // Show safety check popup with risk level and auto-escalation
    async showSafetyCheckPopup(reason, riskLevel = this.riskLevels.LOW) {
        console.log(`[SAFEY] Prompting safety check - Risk: ${riskLevel.toUpperCase()}: ${reason}`);
        
        // Determine UI styling based on risk level
        const riskConfig = this.getRiskConfig(riskLevel);
        
        // Create slide-up card
        const card = document.createElement('div');
        card.id = 'safety-check-card';
        card.className = 'fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 z-50 transform translate-y-full transition-transform duration-300';
        
        const alertId = `alert_${Date.now()}`;
        
        card.innerHTML = `
            <div class="max-w-md mx-auto">
                <div class="flex items-start gap-4 mb-4">
                    <div class="w-12 h-12 ${riskConfig.bgColor} rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 ${riskConfig.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">${riskConfig.title}</h3>
                        <p class="text-sm text-gray-600">${riskConfig.description}</p>
                        <p class="text-xs ${riskConfig.textColor} mt-2 font-medium">${reason}</p>
                        ${riskLevel === this.riskLevels.HIGH ? `
                            <div id="auto-send-timer-${alertId}" class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p class="text-xs text-red-800 font-medium">
                                    ⏱️ Auto-sending in <span id="countdown-${alertId}">10</span>s... <button id="cancel-auto-${alertId}" class="underline">Cancel</button>
                                </p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="flex gap-3">
                    <button id="safety-check-cancel" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition">
                        ${riskLevel === this.riskLevels.HIGH ? 'Dismiss' : 'Cancel'}
                    </button>
                    <button id="safety-check-send" class="flex-1 ${riskConfig.buttonColor} hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition">
                        Send Check Now
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(card);
        
        // Animate slide up
        await this.sleep(50);
        card.classList.remove('translate-y-full');
        
        // Handle auto-escalation for high-risk alerts
        let autoSendTimer = null;
        let countdown = 10;
        let autoSendCancelled = false;
        
        if (riskLevel === this.riskLevels.HIGH) {
            // Check if auto-alerts are enabled
            const autoAlertsEnabled = stealthSettings.getSetting('autoAlertsEnabled') !== false;
            
            if (autoAlertsEnabled) {
                const countdownEl = document.getElementById(`countdown-${alertId}`);
                const cancelBtn = document.getElementById(`cancel-auto-${alertId}`);
                
                // Cancel auto-send button
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        autoSendCancelled = true;
                        clearInterval(autoSendTimer);
                        const timerDiv = document.getElementById(`auto-send-timer-${alertId}`);
                        if (timerDiv) {
                            timerDiv.innerHTML = '<p class="text-xs text-gray-600">Auto-send cancelled</p>';
                        }
                        console.log('[SAFEY] Auto-send cancelled by user');
                    });
                }
                
                // Countdown timer
                autoSendTimer = setInterval(() => {
                    countdown--;
                    if (countdownEl) {
                        countdownEl.textContent = countdown;
                    }
                    
                    if (countdown <= 0 && !autoSendCancelled) {
                        clearInterval(autoSendTimer);
                        console.log('[SAFEY] Auto-sending high-risk safety alert');
                        this.sendSafetyCheck();
                        this.closeSafetyCheckCard(card);
                    }
                }, 1000);
                
                // Store timer reference for cleanup
                this.autoAlertTimers[alertId] = autoSendTimer;
            } else {
                // Auto-alerts disabled, hide timer
                const timerDiv = document.getElementById(`auto-send-timer-${alertId}`);
                if (timerDiv) {
                    timerDiv.innerHTML = '<p class="text-xs text-gray-600">⚙️ Auto-send disabled (Manual confirmation only)</p>';
                }
            }
        }
        
        // Handle buttons
        return new Promise((resolve) => {
            document.getElementById('safety-check-cancel').addEventListener('click', () => {
                if (autoSendTimer) {
                    clearInterval(autoSendTimer);
                    delete this.autoAlertTimers[alertId];
                }
                this.closeSafetyCheckCard(card);
                resolve(false);
            });
            
            document.getElementById('safety-check-send').addEventListener('click', async () => {
                if (autoSendTimer) {
                    clearInterval(autoSendTimer);
                    delete this.autoAlertTimers[alertId];
                }
                await this.sendSafetyCheck();
                this.closeSafetyCheckCard(card);
                resolve(true);
            });
        });
    }

    // Get risk configuration for UI styling
    getRiskConfig(riskLevel) {
        switch (riskLevel) {
            case this.riskLevels.HIGH:
                return {
                    title: '🚨 URGENT Safety Check',
                    description: 'Critical suspicious activity detected. An alert will be sent automatically unless cancelled.',
                    bgColor: 'bg-red-100',
                    iconColor: 'text-red-600',
                    textColor: 'text-red-700',
                    buttonColor: 'bg-red-600'
                };
            case this.riskLevels.MEDIUM:
                return {
                    title: '⚡ Safety Alert',
                    description: 'Multiple concerning patterns detected. Consider sending a safety check to a trusted contact.',
                    bgColor: 'bg-orange-100',
                    iconColor: 'text-orange-600',
                    textColor: 'text-orange-700',
                    buttonColor: 'bg-orange-600'
                };
            case this.riskLevels.LOW:
            default:
                return {
                    title: '⚠️ Safety Check',
                    description: 'We detected something that might be unsafe. Would you like to send a safety check?',
                    bgColor: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    textColor: 'text-yellow-700',
                    buttonColor: 'bg-trust-blue'
                };
        }
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

// Progressive lockout manager for failed PIN attempts
// Implements tiered lockout with encrypted state storage

class LockoutManager {
    constructor() {
        // Lockout thresholds
        this.thresholds = {
            LEVEL_1: { attempts: 3, lockoutDuration: 30 * 1000 }, // 30 seconds
            LEVEL_2: { attempts: 5, lockoutDuration: 5 * 60 * 1000 }, // 5 minutes
            LEVEL_3: { attempts: 10, lockoutDuration: Infinity } // Data reset warning
        };
        
        // State
        this.state = {
            failureCount: 0,
            lockedUntil: null,
            lastResetTime: null,
            failureHistory: [] // Array of timestamps
        };
        
        // Reset interval (24 hours)
        this.resetInterval = 24 * 60 * 60 * 1000;
        
        // Storage key
        this.storageKey = 'lockout_state';
        
        // Encryption password (isolated from other data)
        // Note: This key is used for data isolation, not authentication.
        // The security model relies on device-local storage protection.
        // An attacker with code access would also have storage access,
        // so a dynamic key would not provide additional security benefit.
        this.encryptionPassword = 'lockout_isolation_key_v1';
    }

    // Initialize lockout manager
    async init() {
        await this.loadState();
        
        // Check if auto-reset is needed
        await this.checkAutoReset();
        
        console.log('[SAFEY] Lockout manager initialized');
    }

    // Load state from encrypted storage
    async loadState() {
        try {
            const encrypted = await storageUtils.loadData('settings', this.storageKey);
            if (encrypted) {
                const decrypted = await cryptoUtils.decrypt(
                    encrypted.value || encrypted, 
                    this.encryptionPassword
                );
                
                if (decrypted) {
                    this.state = {
                        failureCount: decrypted.failureCount || 0,
                        lockedUntil: decrypted.lockedUntil || null,
                        lastResetTime: decrypted.lastResetTime || Date.now(),
                        failureHistory: decrypted.failureHistory || []
                    };
                    console.log('[SAFEY] Lockout state loaded');
                    return;
                }
            }
        } catch (error) {
            console.error('[SAFEY] Error loading lockout state:', error);
        }
        
        // Initialize fresh state
        this.state = {
            failureCount: 0,
            lockedUntil: null,
            lastResetTime: Date.now(),
            failureHistory: []
        };
        await this.saveState();
    }

    // Save state to encrypted storage
    async saveState() {
        try {
            const encrypted = await cryptoUtils.encrypt(this.state, this.encryptionPassword);
            if (encrypted) {
                await storageUtils.saveData('settings', this.storageKey, encrypted);
                console.log('[SAFEY] Lockout state saved');
            }
        } catch (error) {
            console.error('[SAFEY] Error saving lockout state:', error);
        }
    }

    // Check if auto-reset is needed (24-hour cycle)
    async checkAutoReset() {
        const now = Date.now();
        const timeSinceReset = now - (this.state.lastResetTime || 0);
        
        if (timeSinceReset >= this.resetInterval) {
            console.log('[SAFEY] Auto-reset triggered (24 hours elapsed)');
            await this.reset();
        }
    }

    // Check if currently locked out
    isLockedOut() {
        if (!this.state.lockedUntil) {
            return false;
        }
        
        const now = Date.now();
        if (now < this.state.lockedUntil) {
            return true;
        }
        
        // Lockout period expired, clear it
        this.state.lockedUntil = null;
        this.saveState();
        return false;
    }

    // Get remaining lockout time in milliseconds
    getRemainingLockoutTime() {
        if (!this.isLockedOut()) {
            return 0;
        }
        
        return this.state.lockedUntil - Date.now();
    }

    // Get current lockout level based on failure count
    getCurrentLevel() {
        const count = this.state.failureCount;
        
        if (count >= this.thresholds.LEVEL_3.attempts) {
            return 3;
        } else if (count >= this.thresholds.LEVEL_2.attempts) {
            return 2;
        } else if (count >= this.thresholds.LEVEL_1.attempts) {
            return 1;
        }
        
        return 0;
    }

    // Record a failed unlock attempt
    async recordFailure() {
        const now = Date.now();
        
        // Add to history
        this.state.failureHistory.push(now);
        this.state.failureCount++;
        
        // Keep only last 20 attempts in history
        if (this.state.failureHistory.length > 20) {
            this.state.failureHistory.shift();
        }
        
        console.log(`[SAFEY] Failed attempt recorded (${this.state.failureCount} total)`);
        
        // Check thresholds and apply lockout
        const level = this.getCurrentLevel();
        
        if (level === 3) {
            // Level 3: 10 attempts - trigger data reset warning (queued)
            console.log('[SAFEY] CRITICAL: 10 failed attempts - data reset threshold reached');
            await eventLogger.logEvent('lockoutLevel3Reached', {
                failureCount: this.state.failureCount,
                timestamp: now
            });
            // Don't set lockout time, let caller handle reset warning
        } else if (level === 2) {
            // Level 2: 5 attempts - 5 minute lockout
            const lockoutDuration = this.thresholds.LEVEL_2.lockoutDuration;
            this.state.lockedUntil = now + lockoutDuration;
            console.log(`[SAFEY] Level 2 lockout activated (5 minutes)`);
            await eventLogger.logEvent('lockoutLevel2Activated', {
                failureCount: this.state.failureCount,
                lockedUntil: this.state.lockedUntil
            });
        } else if (level === 1) {
            // Level 1: 3 attempts - 30 second lockout
            const lockoutDuration = this.thresholds.LEVEL_1.lockoutDuration;
            this.state.lockedUntil = now + lockoutDuration;
            console.log(`[SAFEY] Level 1 lockout activated (30 seconds)`);
            await eventLogger.logEvent('lockoutLevel1Activated', {
                failureCount: this.state.failureCount,
                lockedUntil: this.state.lockedUntil
            });
        }
        
        await this.saveState();
        
        return {
            level,
            isLockedOut: this.isLockedOut(),
            remainingTime: this.getRemainingLockoutTime()
        };
    }

    // Record a successful unlock
    async recordSuccess() {
        // Clear failure count on successful unlock
        this.state.failureCount = 0;
        this.state.lockedUntil = null;
        this.state.failureHistory = [];
        
        console.log('[SAFEY] Lockout state cleared (successful unlock)');
        await this.saveState();
    }

    // Reset lockout state
    async reset() {
        this.state = {
            failureCount: 0,
            lockedUntil: null,
            lastResetTime: Date.now(),
            failureHistory: []
        };
        
        console.log('[SAFEY] Lockout state reset');
        await this.saveState();
    }

    // Get current state (for debugging)
    getState() {
        return {
            failureCount: this.state.failureCount,
            currentLevel: this.getCurrentLevel(),
            isLockedOut: this.isLockedOut(),
            remainingLockoutTime: this.getRemainingLockoutTime(),
            lastResetTime: this.state.lastResetTime,
            timeSinceReset: Date.now() - (this.state.lastResetTime || 0)
        };
    }

    // Format lockout time for display
    formatLockoutTime(milliseconds) {
        const seconds = Math.ceil(milliseconds / 1000);
        
        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
        
        const minutes = Math.ceil(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    // Create lockout warning message
    getLockoutMessage(level) {
        switch (level) {
            case 1:
                return 'Too many failed attempts. Please wait 30 seconds before trying again.';
            case 2:
                return 'Multiple failed attempts detected. Access locked for 5 minutes.';
            case 3:
                return 'CRITICAL: 10 failed unlock attempts. All data will be reset as a security measure. This action cannot be undone.';
            default:
                return 'Access temporarily restricted.';
        }
    }

    // Trigger data reset (for level 3)
    async triggerDataReset() {
        console.log('[SAFEY] Triggering full data reset');
        
        await eventLogger.logEvent('dataResetTriggered', {
            reason: 'lockout_level_3',
            failureCount: this.state.failureCount,
            timestamp: Date.now()
        });
        
        // Clear all data
        await this.reset();
        await stealthSettings.clearSettings();
        await eventLogger.clearEvents();
        await storageUtils.clearAll();
        
        console.log('[SAFEY] Full data reset completed');
    }
}

// Export singleton
const lockoutManager = new LockoutManager();

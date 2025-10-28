# Progressive Lockout Mechanism

## Overview

The progressive lockout mechanism protects the stealth mode unlock flow by implementing tiered restrictions based on failed PIN attempts. This security feature prevents brute-force attacks while maintaining the privacy constraints of the stealth mode system.

## Features

### Lockout Thresholds

1. **Level 1 - 3 Failed Attempts**
   - Duration: 30 seconds
   - Message: "Too many failed attempts. Please wait 30 seconds before trying again."
   - Trigger: After 3rd failed PIN entry

2. **Level 2 - 5 Failed Attempts**
   - Duration: 5 minutes
   - Message: "Multiple failed attempts detected. Access locked for 5 minutes."
   - Trigger: After 5th failed PIN entry

3. **Level 3 - 10 Failed Attempts**
   - Duration: Permanent until data reset
   - Message: "CRITICAL: 10 failed unlock attempts. All data will be reset as a security measure."
   - Trigger: After 10th failed PIN entry
   - Action: Shows data reset warning modal

### Security Features

- **AES-Encrypted Storage**: All lockout state (failure count, lockout time, reset timestamp) is stored encrypted in IndexedDB using Web Crypto API (AES-GCM 256-bit)
- **Isolated Encryption**: Uses a separate encryption key (`lockout_isolation_key_v1`) to isolate lockout data from other app data
- **24-Hour Auto-Reset**: Failure counter automatically resets every 24 hours
- **Persistent State**: Lockout state survives page reloads and app restarts

### Privacy & Safety Integration

- **Stealth Mode Compatible**: Lockout warnings are queued during stealth mode and shown only after safe exit
- **Safety Queue Integration**: Uses existing `queueSafetyCheck()` mechanism to defer alerts
- **No Visual Indicators**: No UI changes during stealth mode that could alert potential abusers
- **Post-Exit Notifications**: All lockout events are shown after the user exits stealth mode safely

## Implementation

### Files

- `js/lockout-manager.js` - Core lockout logic and state management
- `js/unlock-handler.js` - Integration with PIN validation
- `tests/lockout-manager.test.html` - Unit tests

### Architecture

```
┌─────────────────────────────────────┐
│       unlock-handler.js             │
│  (PIN validation & safety queue)    │
└──────────────┬──────────────────────┘
               │
               ├─ attemptUnlock()
               │  ├─ Check lockoutManager.isLockedOut()
               │  ├─ Verify PIN
               │  └─ Record success/failure
               │
               ├─ handleUnlockFailure()
               │  ├─ lockoutManager.recordFailure()
               │  ├─ Check level (1, 2, or 3)
               │  └─ Queue/show appropriate warning
               │
               └─ handleUnlockSuccess()
                  └─ lockoutManager.recordSuccess()
                     └─ Clear lockout state

┌─────────────────────────────────────┐
│      lockout-manager.js             │
│    (State & threshold logic)        │
└──────────────┬──────────────────────┘
               │
               ├─ State Management
               │  ├─ failureCount
               │  ├─ lockedUntil
               │  ├─ lastResetTime
               │  └─ failureHistory
               │
               ├─ Threshold Detection
               │  ├─ getCurrentLevel()
               │  └─ isLockedOut()
               │
               └─ Persistence
                  ├─ saveState() → AES encrypt
                  └─ loadState() → AES decrypt

┌─────────────────────────────────────┐
│        storage-utils.js             │
│   (IndexedDB with localStorage      │
│         fallback)                   │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│       crypto-utils.js               │
│  (AES-GCM encryption via Web        │
│       Crypto API)                   │
└─────────────────────────────────────┘
```

### Usage

```javascript
// Initialization (in unlock-handler.init())
await lockoutManager.init();

// Check if locked out before accepting PIN
if (lockoutManager.isLockedOut()) {
    const remaining = lockoutManager.getRemainingLockoutTime();
    const timeStr = lockoutManager.formatLockoutTime(remaining);
    // Show "Locked for X seconds/minutes" message
    return false;
}

// Record failed attempt
const result = await lockoutManager.recordFailure();
if (result.level === 3) {
    // Show data reset warning
    await showDataResetWarning();
} else if (result.level > 0) {
    // Queue lockout notification
    await queueSafetyCheck(message, HIGH);
}

// Record successful unlock (clears state)
await lockoutManager.recordSuccess();

// Manual reset (testing/admin)
await lockoutManager.reset();
```

## Testing

### Unit Tests

Run the test suite by opening:
```
tests/lockout-manager.test.html
```

Tests cover:
1. Initial state verification
2. Single failure recording
3. Level 1 lockout (3 attempts → 30s)
4. Level 2 lockout (5 attempts → 5 min)
5. Level 3 threshold (10 attempts)
6. Successful unlock clearing state
7. State persistence across reloads
8. Encryption/decryption verification
9. Time formatting
10. Lockout messages
11. 24-hour auto-reset
12. Lockout expiration

### Manual Testing

1. **Test Level 1 Lockout**:
   - Enter wrong PIN 3 times
   - Verify 30-second lockout message appears (after exiting stealth)
   - Wait 30 seconds
   - Verify unlock is re-enabled

2. **Test Level 2 Lockout**:
   - Enter wrong PIN 5 times
   - Verify 5-minute lockout message appears (after exiting stealth)
   - Check state persists after page reload

3. **Test Level 3 Warning**:
   - Enter wrong PIN 10 times
   - Verify data reset warning appears (after exiting stealth)
   - Test "Cancel" and "Reset All Data" buttons

4. **Test Stealth Mode Integration**:
   - Activate stealth mode
   - Enter wrong PIN multiple times
   - Verify NO alerts appear during stealth
   - Exit stealth mode safely
   - Verify queued lockout alerts appear

5. **Test Successful Unlock**:
   - Trigger lockout (3 failed attempts)
   - Enter correct PIN
   - Verify lockout state is cleared

## Security Considerations

### Encryption

- **Algorithm**: AES-GCM 256-bit
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **IV**: Random 12-byte initialization vector per encryption
- **Password**: Isolated key (`lockout_isolation_key_v1`) separate from user PIN

### Data Storage

```javascript
// Encrypted state structure
{
    failureCount: number,
    lockedUntil: timestamp | null,
    lastResetTime: timestamp,
    failureHistory: [timestamp, ...]
}
```

Stored at: `IndexedDB → settings → lockout_state`
Backup: `localStorage → safey_settings_lockout_state`

### Threat Model

**Protects Against**:
- Brute-force PIN guessing
- Automated attack scripts
- Multiple rapid attempts by unauthorized users

**Does NOT Protect Against**:
- Physical device access with developer tools (can clear IndexedDB)
- Memory forensics while app is running
- Browser extension with localStorage access

**Mitigation**: Level 3 data reset ensures data destruction after persistent attack attempts.

## Privacy Constraints

### Stealth Mode Compliance

1. **No Immediate Alerts**: All lockout notifications are queued during stealth mode
2. **Post-Exit Flush**: Alerts shown only after safe stealth exit via `flushSafetyQueue()`
3. **No Visual Indicators**: No lockout UI changes visible during stealth disguise
4. **Event Logging**: All lockout events logged to encrypted event store

### User Experience

- Lockout times are reasonable (30s, 5min) to avoid excessive user frustration
- Clear messaging about lockout duration
- Data reset requires explicit confirmation (not automatic)
- 24-hour auto-reset prevents permanent lockout from forgotten PINs

## API Reference

### LockoutManager

```javascript
// Initialize
await lockoutManager.init()

// Check lockout status
lockoutManager.isLockedOut() → boolean
lockoutManager.getRemainingLockoutTime() → milliseconds
lockoutManager.getCurrentLevel() → 0 | 1 | 2 | 3

// Record events
await lockoutManager.recordFailure() → { level, isLockedOut, remainingTime }
await lockoutManager.recordSuccess()

// State management
await lockoutManager.reset()
await lockoutManager.checkAutoReset()
lockoutManager.getState() → { failureCount, currentLevel, isLockedOut, ... }

// UI helpers
lockoutManager.formatLockoutTime(ms) → string
lockoutManager.getLockoutMessage(level) → string

// Data reset
await lockoutManager.triggerDataReset()
```

## Future Enhancements

- [ ] Exponential backoff for repeated Level 2+ lockouts
- [ ] Configurable thresholds in settings UI
- [ ] Email/SMS notification on Level 3 attempts
- [ ] Biometric unlock exemption from lockout
- [ ] Admin override code for emergency unlock
- [ ] Lockout event analytics dashboard

## Changelog

### v1.0.0 (Initial Implementation)
- ✅ Progressive 3-tier lockout system
- ✅ AES-encrypted state storage
- ✅ 24-hour auto-reset
- ✅ Stealth mode integration
- ✅ Unit test suite
- ✅ Data reset warning modal

## License

Part of SAFEY project. See main LICENSE file.

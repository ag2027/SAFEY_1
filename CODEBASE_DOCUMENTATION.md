# SAFEY Codebase Documentation

**Project**: SAFEY - Safety Assessment and Resource Platform  
**Branch**: `copilot/add-stealth-mode-functionality`  
**Status**: Active Development  
**Last Updated**: October 2025

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Core Files Reference](#core-files-reference)
5. [Key Modules & Classes](#key-modules--classes)
6. [Data Flow](#data-flow)
7. [State Management](#state-management)
8. [Storage System](#storage-system)
9. [Security & Privacy](#security--privacy)
10. [Debugging & Testing](#debugging--testing)

---

## Project Overview

SAFEY is a **Progressive Web App (PWA)** designed to help individuals experiencing domestic violence by providing:

- **Risk Assessment**: 8-question questionnaire to evaluate danger level
- **Safety Planning**: Personalized safety plan generation with editable items
- **Resource Directory**: Searchable database of shelters, hotlines, legal aid, and counseling services
- **Stealth Mode**: Disguise app as calculator with PIN protection
- **Behavioral Check-in System**: Pattern detection for safety alerts
- **Offline-First**: Works without internet after first load
- **Privacy-First**: All data stored locally on device

### Key Features
✅ Anonymous, no sign-up required  
✅ All data stays on device (no cloud sync)  
✅ Service worker for offline functionality  
✅ Multiple stealth disguise templates (calculator, notes, weather, news, gallery, custom URL)  
✅ Pin-protected unlock system  
✅ Event logging with encryption  
✅ Suspicious pattern detection  

---

## Architecture

### Technology Stack
- **Frontend**: Plain HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN)
- **Storage**: IndexedDB (primary) + localStorage (fallback)
- **Encryption**: Web Crypto API (AES-GCM) + XOR fallback
- **Offline Support**: Service Worker + cache strategy
- **Deployment**: GitHub Pages (static hosting)

### Design Patterns
- **Singleton Pattern**: All major modules are singletons (exported instances)
- **Event-Driven Architecture**: Custom events for module communication
- **Modular Structure**: Separated concerns with independent module files
- **Encryption-First**: Sensitive data encrypted before storage
- **Graceful Degradation**: Fallbacks for unsupported browser APIs

### Deployment Architecture
```
GitHub Repository (ag2027/SAFEY_1)
         ↓
   GitHub Pages
         ↓
Static Files (index.html, app.js, service-worker.js, manifest.json)
         ↓
Browser PWA Installation
         ↓
Local Storage + IndexedDB (encrypted)
```

---

## File Structure

```
SAFEY_1/
├── index.html                      # Main HTML entry point
├── app.js                          # Main application logic
├── service-worker.js               # PWA offline support
├── manifest.json                   # PWA manifest
├── js/
│   ├── crypto-utils.js            # Encryption/decryption utilities
│   ├── stealth-controller.js       # Main stealth mode orchestrator
│   ├── stealth-settings.js         # Stealth configuration manager
│   ├── unlock-handler.js           # PIN unlock & pattern detection
│   ├── stealth-trigger-handler.js  # Stealth activation triggers
│   ├── disguise-renderer.js        # UI disguise template renderer
│   ├── event-logger.js             # Event logging system
│   ├── storage-utils.js            # IndexedDB/localStorage wrapper
│   └── debug-ui.js                 # QA debug panel
├── README.md                       # User-facing documentation
├── README_STEALTH.md               # Stealth mode documentation
├── DEPLOYMENT.md                   # Deployment instructions
├── VALIDATION.md                   # Requirements validation
├── LICENSE                         # MIT License
└── CODEBASE_DOCUMENTATION.md       # This file
```

---

## Core Files Reference

### `index.html` - Main HTML Entry Point

**Purpose**: Root HTML document that defines the app layout and UI structure.

**Key Sections**:
- **Meta Tags**: PWA configuration, theme color, viewport settings
- **Tailwind Configuration**: Custom color scheme (trust-blue, neutral-bg, hopeful-teal, etc.)
- **CSS Animations**: fadeIn, fadeOut, stealth-mode styling
- **Screen Divs**: Separate div containers for each app screen (hidden by default)
  - `#home-screen`: Main landing screen
  - `#assessment-screen`: Risk assessment questions
  - `#results-screen`: Assessment results display
  - `#resources-screen`: Resource directory
  - `#safety-plan-screen`: Safety plan editor
  - `#settings-screen`: App settings
  - `#stealth-screen`: Disguise UI container

**Key Attributes**:
- `<title>Notes</title>` - Default title (masking as notes app)
- `manifest.json` - Links PWA manifest for installability
- `service-worker.js` - Registration for offline support

**Important Classes**:
- `.screen` - Display container for individual screens
- `.screen.active` - Currently visible screen
- `.fade-in` / `.fade-out` - Transition animations
- `.stealth-mode` - Typography for stealth UI (monospace font)

**Script Dependencies**:
```html
<!-- Loaded after HTML to ensure DOM ready -->
<script src="app.js"></script>
<script src="js/crypto-utils.js"></script>
<script src="js/storage-utils.js"></script>
<script src="js/event-logger.js"></script>
<script src="js/stealth-settings.js"></script>
<script src="js/unlock-handler.js"></script>
<script src="js/stealth-controller.js"></script>
<script src="js/stealth-trigger-handler.js"></script>
<script src="js/disguise-renderer.js"></script>
<script src="js/debug-ui.js"></script>
```

---

### `app.js` - Main Application Logic

**Purpose**: Core application state and screen management.

**State Object** (`AppState`):
```javascript
{
    currentScreen: 'home',           // Current active screen
    stealthMode: false,              // Stealth mode active flag
    assessmentAnswers: [],           // User's assessment responses
    currentQuestion: 0,              // Current question index
    riskScore: 0,                    // Calculated risk score (0-100)
    pin: '1234',                     // PIN (from localStorage)
    checkInEvents: [],               // Recent check-in events
    safetyPlan: null                 // Current safety plan object
}
```

**Data Arrays**:

1. **`assessmentQuestions`** - Array of 8 yes/no questions
   - Each has: `id`, `question` (text), `type: "boolean"`
   - Questions assess danger levels (violence escalation, weapons, threats, etc.)

2. **`resources`** - Array of 8 support resources
   - Fields: `name`, `category`, `phone`, `description`, `hours/available`
   - Categories: hotline, shelter, legal, counseling
   - Example: "National Domestic Violence Hotline" (1-800-799-7233)

3. **`safetyPlanTemplate`** - Template for generated safety plans
   - `emergencyContacts`: List to populate
   - `safePlace`: Location planning
   - `importantDocuments`: 7 pre-filled document types
   - `essentialItems`: 6 pre-filled emergency items
   - `safetySteps`: 6 pre-filled safety steps

**Key Functions**:

| Function | Purpose | Returns |
|----------|---------|---------|
| `trackEvent(eventType)` | Log behavioral events with timestamp | void |
| `checkBehavioralPatterns()` | Detect patterns in events | void |
| `promptSafetyCheck(reason)` | Show safety check confirmation | void |
| `sendSafetyCheck()` | Send safety notification (demo) | void |

**Event Tracking**:
- Keeps last 50 events in memory
- Persists events to localStorage
- Monitors for concerning patterns (3+ emergency activations in 1 hour)

**Important Notes**:
- This file initializes all UI event listeners
- Manages screen transitions
- Coordinates with stealth controller for mode switching

---

### `service-worker.js` - PWA Offline Support

**Purpose**: Enables offline functionality and caching for the PWA.

**Cache Strategy**:
- Cache name: `'safey-v1'`
- Strategy: Cache-first with network fallback
- Updates cache automatically on successful fetches

**Cached URLs**:
```javascript
[
  '/',                          // Root path
  '/index.html',                // Main HTML
  '/app.js',                    // Main script
  '/manifest.json',             // PWA manifest
  'https://cdn.tailwindcss.com' // Tailwind CDN
]
```

**Key Events**:

1. **`install`**: Caches initial resources
   - Opens cache store
   - Adds URLs to cache
   - `skipWaiting()` for immediate activation

2. **`activate`**: Cleans up old caches
   - Deletes caches with different versions
   - `clients.claim()` to claim all clients

3. **`fetch`**: Intercepts network requests
   - Returns cached response if available
   - Falls back to network request
   - Caches successful responses for future use
   - Returns cached index.html on network failure

---

### `manifest.json` - PWA Configuration

**Purpose**: Defines PWA installation properties and metadata.

**Key Properties**:
```json
{
  "name": "SAFEY",
  "short_name": "SAFEY",
  "description": "Discreet domestic violence safety and resource platform",
  "start_url": "/",
  "display": "standalone",           // Full-screen app mode
  "background_color": "#3C91E6",
  "theme_color": "#3C91E6",
  "orientation": "portrait",
  "icons": [...]                     // SVG icons for home screen
}
```

**Installation Flow**:
1. User visits app on HTTPS (required for PWA)
2. Browser detects manifest.json
3. "Add to Home Screen" prompt appears
4. App installs as standalone app
5. Service worker registers for offline access

---

### `js/crypto-utils.js` - Encryption & Cryptography

**Purpose**: Provides encryption/decryption for sensitive data.

**Class**: `CryptoUtils`

**Key Properties**:
- `hasWebCrypto`: Boolean flag for Web Crypto API support
- `salt`: Static string for PBKDF2 key derivation (`'SAFEY_v1_salt_2024'`)

**Key Methods**:

| Method | Purpose | Parameters | Returns |
|--------|---------|-----------|---------|
| `async deriveKey(password)` | Generate AES-256 key from password | `password: string` | `CryptoKey` |
| `async encrypt(data, password)` | Encrypt data with AES-GCM or XOR | `data: object, password: string` | `base64 string` |
| `async decrypt(encryptedData, password)` | Decrypt data | `encryptedData: string, password: string` | `decrypted object` |
| `async hashPin(pin)` | Hash PIN for comparison | `pin: string` | `base64 hash string` |
| `arrayBufferToBase64(buffer)` | Convert buffer to base64 | `buffer: ArrayBuffer` | `string` |
| `base64ToArrayBuffer(base64)` | Convert base64 to buffer | `base64: string` | `Uint8Array` |
| `simpleHash(str)` | Simple hash function (fallback) | `str: string` | `string` |
| `xorEncrypt(text, key)` | XOR encryption (fallback) | `text, key: string` | `base64 string` |
| `xorDecrypt(encrypted, key)` | XOR decryption (fallback) | `encrypted, key: string` | `string` |

**Encryption Details**:

**AES-GCM (Primary)**:
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2 (100,000 iterations, SHA-256)
- IV: Random 12-byte initialization vector
- Format: IV (12 bytes) + Ciphertext (variable)

**XOR Fallback**:
- Used when Web Crypto API unavailable
- Simple XOR against hashed key
- Base64 encoded for storage

**Usage Example**:
```javascript
// Encrypt
const encrypted = await cryptoUtils.encrypt(
  { username: 'user', data: 'secret' },
  'password123'
);
localStorage.setItem('encrypted_data', encrypted);

// Decrypt
const decrypted = await cryptoUtils.decrypt(encrypted, 'password123');
console.log(decrypted); // { username: 'user', data: 'secret' }

// Hash PIN
const pinHash = await cryptoUtils.hashPin('1234');
// Compare: pinHash === await cryptoUtils.hashPin('1234')
```

---

### `js/storage-utils.js` - Data Storage Abstraction

**Purpose**: Unified interface for IndexedDB and localStorage storage.

**Class**: `StorageUtils`

**Properties**:
- `dbName`: `'SAFEY_DB'`
- `dbVersion`: `1`
- `db`: IndexedDB instance reference
- `hasIndexedDB`: Boolean capability flag

**Object Stores**:

1. **`settings`** - Configuration storage
   - Key path: `key`
   - Stores: PIN hash, disguise template, auto-lock timeout, trigger settings

2. **`events`** - Event log storage
   - Key path: `id` (auto-increment)
   - Indexes: `timestamp`, `type`
   - Stores: Encrypted event logs for behavior tracking

3. **`snapshots`** - URL snapshot storage
   - Key path: `url`
   - Stores: Cached webpage snapshots for custom URL disguise

**Key Methods**:

| Method | Purpose | Parameters | Returns |
|--------|---------|-----------|---------|
| `async initDB()` | Initialize IndexedDB | none | `Promise` |
| `async saveData(storeName, key, value)` | Save data | `storeName, key, value` | `boolean` |
| `async loadData(storeName, key)` | Load data | `storeName, key` | `data or null` |
| `async deleteData(storeName, key)` | Delete data | `storeName, key` | `boolean` |
| `async getAllEvents()` | Get all events | none | `array` |
| `async addEvent(event)` | Add event | `event: object` | `id` |
| `async clearAll()` | Clear all storage | none | `void` |
| `saveToLocalStorage(storeName, key, value)` | localStorage save | `storeName, key, value` | `void` |
| `loadFromLocalStorage(storeName, key)` | localStorage load | `storeName, key` | `data or null` |

**Fallback Behavior**:
- If IndexedDB unavailable → uses localStorage
- localStorage keys: `safey_{storeName}_{key}`
- Events kept to 100 max in localStorage

**Usage Example**:
```javascript
// Save settings
await storageUtils.saveData('settings', 'stealth', {
  pin: '1234',
  template: 'calculator'
});

// Load settings
const settings = await storageUtils.loadData('settings', 'stealth');

// Add event
const eventId = await storageUtils.addEvent({
  type: 'stealthActivated',
  timestamp: Date.now()
});

// Clear everything
await storageUtils.clearAll();
```

---

### `js/event-logger.js` - Event Logging System

**Purpose**: Tracks app events with encryption for behavioral analysis.

**Class**: `EventLogger`

**Properties**:
- `eventTypes`: Array of valid event type strings
- `maxEvents`: `100` max stored events
- Event types: stealthActivated, unlockAttempt, unlockSuccess, unlockFail, emergencyToggled, suspiciousDetected, safetyCheckSent, appStart, disguiseChanged, settingsUpdated

**Key Methods**:

| Method | Purpose | Parameters | Returns |
|--------|---------|-----------|---------|
| `async logEvent(type, metadata)` | Log event with encryption | `type: string, metadata: object` | `event: object` |
| `async getEvents(limit)` | Get decrypted events | `limit: number or null` | `array` |
| `async getEventsByType(type, limit)` | Filter by type | `type: string, limit: number` | `array` |
| `async getEventsInRange(startTime, endTime)` | Filter by timestamp | `startTime, endTime: number` | `array` |
| `async clearEvents()` | Delete all events | none | `void` |
| `async getMaskedEvents(limit)` | Get events for debug UI | `limit: number` | `masked array` |

**Event Structure**:
```javascript
{
  type: 'stealthActivated',           // Event type
  timestamp: 1698432000000,           // Unix timestamp
  metadata: {                         // Event-specific data
    autoLock: false,
    timestamp: 1698432000000
  },
  userAgent: 'Mozilla/5.0...'         // First 50 chars only
}
```

**Event Encryption Flow**:
1. Event created with metadata
2. Encrypted using `cryptoUtils.encrypt()`
3. Stored in IndexedDB/localStorage with `encrypted` flag
4. On retrieval, decrypted and returned to caller
5. Masked version strips sensitive metadata for debug UI

**Usage Example**:
```javascript
// Log unlock attempt
await eventLogger.logEvent('unlockAttempt', {
  timestamp: Date.now(),
  pinLength: pin.length
});

// Get all recent events
const recent = await eventLogger.getEvents(10);

// Get unlock failures only
const failures = await eventLogger.getEventsByType('unlockFail', 5);

// Clear after export
await eventLogger.clearEvents();
```

---

### `js/stealth-settings.js` - Stealth Configuration Manager

**Purpose**: Manages all stealth mode settings and preferences.

**Class**: `StealthSettings`

**Default Settings**:
```javascript
{
  pin: null,                    // 4-digit PIN (not stored plain)
  pinHash: null,                // SHA-256 hash of PIN
  disguiseTemplate: 'calculator', // Active disguise: calculator|notes|weather|news|gallery|custom
  customUrl: null,              // URL for custom disguise
  customUrlSnapshot: null,      // Cached snapshot of custom URL
  triggersEnabled: {
    logoDoubleTap: true,        // Logo double-tap activation
    cornerMultiTap: true        // Corner tap activation
  },
  cornerTapConfig: {
    corner: 'top-right',        // top-right|top-left|bottom-right|bottom-left
    tapCount: 4,                // Number of taps required
    tapTimeout: 1000            // Time window in ms
  },
  autoLockTimeout: 5,           // Minutes before auto-lock
  unlockMethod: 'pin',          // pin|pattern
  failedAttemptThreshold: 3,    // Failed attempts before suspicious
  failedAttemptWindow: 2,       // Time window in minutes
  suspiciousResetThreshold: 3,  // Suspicious threshold for alerts
  debugMode: false,             // Debug mode flag
  lastActivated: null,          // Timestamp of last activation
  activationCount: 0            // Total activation count
}
```

**Key Methods**:

| Method | Purpose | Parameters | Returns |
|--------|---------|-----------|---------|
| `async init()` | Initialize settings | none | `Promise` |
| `async loadSettings()` | Load from storage | none | `settings object` |
| `async saveSettings()` | Save to storage (encrypted) | none | `Promise` |
| `async updatePin(newPin)` | Change PIN (4 digits) | `newPin: string` | `void` |
| `async verifyPin(pin)` | Verify PIN hash | `pin: string` | `boolean` |
| `async updateTemplate(template)` | Change disguise template | `template: string` | `void` |
| `async setCustomUrl(url)` | Set custom URL (HTTPS only) | `url: string` | `void` |
| `async saveUrlSnapshot(url, dataUrl)` | Cache URL snapshot | `url, dataUrl: string` | `void` |
| `async getUrlSnapshot(url)` | Retrieve cached snapshot | `url: string` | `dataUrl or null` |
| `async updateTriggers(triggers)` | Update trigger settings | `triggers: object` | `void` |
| `async updateCornerTapConfig(config)` | Update corner tap settings | `config: object` | `void` |
| `async updateAutoLockTimeout(minutes)` | Set auto-lock timeout | `minutes: 1-60` | `void` |
| `getSetting(key)` | Get single setting | `key: string` | `value` |
| `getPublicSettings()` | Get non-sensitive settings | none | `object` |
| `async clearSettings()` | Reset to defaults | none | `void` |
| `async trackActivation()` | Record activation event | none | `void` |

**Important Notes**:
- PIN stored as hash only (SHA-256), never plain text
- Settings encrypted before storage
- Auto-generates default PIN (1234) if missing
- Custom URLs must be HTTPS
- Validates PIN format (4 digits)

**Usage Example**:
```javascript
// Initialize
await stealthSettings.init();

// Update PIN
await stealthSettings.updatePin('9876');

// Verify PIN
const isValid = await stealthSettings.verifyPin('9876'); // true

// Change disguise
await stealthSettings.updateTemplate('notes');

// Get setting
const timeout = stealthSettings.getSetting('autoLockTimeout'); // 5

// Update auto-lock
await stealthSettings.updateAutoLockTimeout(10);
```

---

### `js/unlock-handler.js` - PIN Unlock & Pattern Detection

**Purpose**: Manages PIN unlock attempts and detects suspicious patterns.

**Class**: `UnlockHandler`

**Properties**:
- `failedAttempts`: Array of failed attempt records with timestamp
- `suspiciousCounter`: Counter for suspicious detection events
- `isUnlocking`: Boolean flag to prevent concurrent unlock attempts

**Failed Attempt Tracking**:
```javascript
{
  timestamp: 1698432000000,
  userAgent: 'Mozilla/5.0...'
}
```

**Key Methods**:

| Method | Purpose | Parameters | Returns |
|--------|---------|-----------|---------|
| `async init()` | Initialize handler | none | `Promise` |
| `async attemptUnlock(pin)` | Try to unlock | `pin: string` | `boolean` |
| `async handleUnlockSuccess()` | Process successful unlock | none | `void` |
| `async handleUnlockFailure()` | Process failed unlock | none | `void` |
| `async checkSuspiciousPatterns()` | Detect unsafe patterns | none | `void` |
| `async promptSafetyCheck(reason)` | Show safety prompt | `reason: string` | `void` |
| `async sendSafetyCheck()` | Send safety notification | none | `void` |
| `getSuspiciousCounter()` | Get counter value | none | `number` |
| `resetSuspiciousCounter()` | Reset counter & attempts | none | `void` |

**Suspicious Pattern Detection**:

1. **Failed Unlock Threshold**
   - Condition: ≥3 failed attempts within 2-minute window
   - Action: Increment suspicious counter, show safety check prompt
   - Reset: Cleared after triggering

2. **Multiple Emergency Toggles**
   - Condition: >2 emergency mode activations in 15 minutes
   - Action: Log suspicious event, show safety prompt
   - Benefit: Indicates potential coercion or distress

3. **Multiple Failed Unlocks**
   - Condition: ≥3 failed unlock attempts in 10 minutes
   - Action: Same as pattern 1, stricter time window
   - Benefit: Catches brute force attempts

4. **Emergency with No Activity**
   - Condition: Emergency mode activated >30 min ago with <3 events
   - Action: Log suspicious detection
   - Benefit: Indicates potential forced inactivity/coercion

**Safety Check Prompt**:
- Slide-up card from bottom of screen
- Reason for check displayed to user
- Options: "Cancel" or "Send Check"
- Sends to configured webhook (demo mode in MVP)

**Usage Example**:
```javascript
// Initialize
await unlockHandler.init();

// Attempt unlock
const success = await unlockHandler.attemptUnlock('9876');

if (success) {
  console.log('Unlocked!');
} else {
  console.log('Failed attempt logged');
}

// Check patterns (called on stealth activation)
await unlockHandler.checkSuspiciousPatterns();

// Get counter
const suspCount = unlockHandler.getSuspiciousCounter();
```

---

### `js/stealth-trigger-handler.js` - Stealth Activation Triggers

**Purpose**: Manages gesture-based activation triggers (double-tap, corner multi-tap).

**Class**: `StealthTriggerHandler`

**Properties**:

**Logo Double-Tap Trigger**:
```javascript
{
  enabled: true,
  tapCount: 0,              // Current tap count
  timeout: null,            // Timeout ID
  maxDelay: 500             // Time between taps (ms)
}
```

**Corner Multi-Tap Trigger**:
```javascript
{
  enabled: true,
  corner: 'top-right',      // Tap region: top-right|top-left|bottom-right|bottom-left
  tapCount: 4,              // Required taps
  currentTaps: 0,           // Current tap count
  timeout: null,
  maxDelay: 1000,           // Time window (ms)
  cornerSize: 80            // Corner region size (pixels)
}
```

**Key Methods**:

| Method | Purpose | Parameters | Returns |
|--------|---------|-----------|---------|
| `async init()` | Initialize triggers | none | `Promise` |
| `attachListeners()` | Add event listeners | none | `void` |
| `detachListeners()` | Remove event listeners | none | `void` |
| `handleLogoTap(e)` | Process logo tap | `e: ClickEvent` | `void` |
| `handleCornerTap(e)` | Process corner tap | `e: ClickEvent` | `void` |
| `isInCorner(x, y)` | Check if tap in corner | `x, y: number` | `boolean` |
| `async activateStealth()` | Trigger stealth mode | none | `void` |
| `async updateSettings(settings)` | Update trigger config | `settings: object` | `void` |
| `setEnabled(enabled)` | Enable/disable triggers | `enabled: boolean` | `void` |

**Trigger Logic**:

**Logo Double-Tap**:
1. User clicks logo `data-trigger="logo"` button
2. Tap count incremented
3. If count reaches 2 within 500ms → activate stealth
4. If count = 1, wait 500ms then reset

**Corner Multi-Tap**:
1. User clicks anywhere on page
2. Check if click within configured corner (80px × 80px)
3. Increment tap count
4. If count ≥ configured amount within time window → activate stealth
5. If timeout expires, reset tap count

**Corner Detection**:
```
Top-Right:     x > (width - 80) && y < 80
Top-Left:      x < 80 && y < 80
Bottom-Right:  x > (width - 80) && y > (height - 80)
Bottom-Left:   x < 80 && y > (height - 80)
```

**Usage Example**:
```javascript
// Initialize triggers
await stealthTriggerHandler.init();

// Update settings
await stealthTriggerHandler.updateSettings({
  triggersEnabled: {
    logoDoubleTap: true,
    cornerMultiTap: true
  },
  cornerConfig: {
    corner: 'bottom-left',
    tapCount: 5,
    tapTimeout: 2000
  }
});

// Disable triggers while processing
stealthTriggerHandler.setEnabled(false);

// Re-enable
stealthTriggerHandler.setEnabled(true);
```

---

### `js/stealth-controller.js` - Main Stealth Orchestrator

**Purpose**: Central coordinator for all stealth mode functionality.

**Class**: `StealthController`

**Properties**:
- `isActive`: Boolean for current stealth state
- `autoLockTimer`: Timer ID for auto-lock
- `inactivityTimer`: Timer ID for inactivity tracking
- `lastActivityTime`: Unix timestamp of last user activity

**Key Methods**:

| Method | Purpose | Parameters | Returns |
|--------|---------|-----------|---------|
| `async init()` | Initialize stealth system | none | `Promise` |
| `setupEventListeners()` | Attach custom events | none | `void` |
| `setupActivityTracking()` | Monitor user activity | none | `void` |
| `updateLastActivity()` | Update activity timestamp | none | `void` |
| `startAutoLockChecker()` | Start auto-lock interval | none | `void` |
| `async activate(isAutoLock)` | Activate stealth mode | `isAutoLock: boolean` | `void` |
| `async deactivate()` | Deactivate stealth mode | none | `void` |
| `getState()` | Get current state | none | `object` |
| `async triggerStealth()` | Manual stealth trigger (debug) | none | `void` |
| `async changeTemplate(template)` | Switch disguise template | `template: string` | `void` |
| `async setCustomUrl(url)` | Configure custom URL | `url: string` | `boolean` |
| `async showCustomUrlWarning()` | Show security warning modal | none | `boolean` |
| `async updatePin(newPin)` | Change PIN | `newPin: string` | `void` |
| `async clearAllData()` | Factory reset | none | `void` |
| `async getDebugInfo()` | Get debug information | none | `object` |

**Initialization Sequence**:
```
stealthController.init()
  ├─ stealthSettings.init()
  ├─ unlockHandler.init()
  ├─ stealthTriggerHandler.init()
  ├─ setupEventListeners()
  ├─ setupActivityTracking()
  └─ startAutoLockChecker()
```

**Stealth Activation Flow**:
1. `activate()` called (manual or auto-lock)
2. Log event: `stealthActivated`
3. Hide all normal screens
4. Show stealth screen with fade animation
5. Render disguise template
6. Disable triggers
7. Check for suspicious patterns

**Stealth Deactivation Flow**:
1. `deactivate()` called (after successful unlock)
2. Hide stealth screen
3. Show home screen with fade animation
4. Re-enable triggers
5. Reset activity timer
6. Reset document title

**Activity Tracking**:
- Monitors: mousedown, mousemove, keydown, scroll, touchstart
- Updates last activity timestamp on each event
- Checked every 10 seconds against auto-lock timeout
- Auto-lock triggers only when not in stealth mode

**Custom URL Feature**:
- Only HTTPS URLs allowed (security requirement)
- Shows security warning before enabling
- Attempts to cache webpage snapshot for offline use
- Falls back to offline placeholder if snapshot unavailable

**Usage Example**:
```javascript
// Initialize stealth system
await stealthController.init();

// Manual activation (debugging)
await stealthController.triggerStealth();

// After unlock, deactivate
await stealthController.deactivate();

// Change template
await stealthController.changeTemplate('weather');

// Set custom URL
const confirmed = await stealthController.setCustomUrl('https://example.com');

// Get current state
const state = stealthController.getState();
console.log(state.isActive); // true/false
```

---

### `js/disguise-renderer.js` - Stealth UI Disguise Templates

**Purpose**: Renders different UI templates to disguise the app's true purpose.

**Class**: `DisguiseRenderer`

**Properties**:
- `currentTemplate`: String name of active template
- `container`: DOM element to render into

**Supported Templates**:

1. **Calculator** (Default)
   - Functional calculator UI (dark theme)
   - Working calculator logic
   - PIN unlock integrated
   - Looks like iOS/Android calculator app

2. **Notes**
   - Yellow sticky notes interface
   - Editable textarea with sample notes
   - Pre-filled with mundane content
   - Menu button (non-functional)

3. **Weather**
   - Weather forecast display
   - Current temp, conditions, forecast
   - Static data (San Francisco 72°)
   - Shows humidity, wind, UV index

4. **News**
   - News feed interface
   - Scrollable article cards
   - Categories, headlines, summaries
   - Shows date and time

5. **Gallery**
   - Photo grid (3 columns)
   - Emoji placeholders for images
   - Dark background
   - Menu button

6. **Custom URL**
   - Loads cached webpage snapshot
   - Falls back to offline placeholder
   - Shows URL if unavailable offline

**Key Methods**:

| Method | Purpose | Parameters | Returns |
|--------|---------|-----------|---------|
| `async render(template, container)` | Render template | `template: string, container: Element` | `void` |
| `renderCalculator(container)` | Calculator UI | `container: Element` | `void` |
| `renderNotes(container)` | Notes UI | `container: Element` | `void` |
| `renderWeather(container)` | Weather UI | `container: Element` | `void` |
| `renderNews(container)` | News UI | `container: Element` | `void` |
| `renderGallery(container)` | Gallery UI | `container: Element` | `void` |
| `async renderCustomUrl(container)` | Custom URL | `container: Element` | `void` |
| `attachCalculatorListeners()` | Wire calc buttons | none | `void` |
| `attachNotesListeners()` | Wire notes input | none | `void` |

**Template Title Mapping**:
```javascript
{
  'calculator': 'Calculator',
  'notes': 'Notes',
  'weather': 'Weather',
  'news': 'News Today',
  'gallery': 'Photos',
  'custom': 'Browser'
}
```

**Calculator Features**:
- Functional calculator with standard operations (+, −, ×, ÷)
- Display shows calculations
- Clear (C) button resets
- Click-based input
- Dark gray theme (authentic look)

**Usage Example**:
```javascript
// Render calculator
const stealthScreen = document.getElementById('stealth-screen');
await disguiseRenderer.render('calculator', stealthScreen);

// Change to notes
await disguiseRenderer.render('notes', stealthScreen);

// Change to custom URL
await disguiseRenderer.render('custom', stealthScreen);
```

---

### `js/debug-ui.js` - QA Debug Panel

**Purpose**: Development tool for testing and debugging stealth system.

**Class**: `DebugUI`

**Properties**:
- `isVisible`: Boolean for panel visibility
- `panel`: DOM element reference

**Key Methods**:

| Method | Purpose | Parameters | Returns |
|--------|---------|-----------|---------|
| `async toggle()` | Toggle panel visibility | none | `void` |
| `async show()` | Display debug panel | none | `void` |
| `hide()` | Hide debug panel | none | `void` |
| `enableKeyboardShortcut()` | Register hotkey | none | `void` |

**Keyboard Shortcut**: `Ctrl+Shift+D`

**Debug Panel Displays**:

1. **System Status**
   - Stealth Active (yes/no)
   - Current Template
   - Suspicious Counter
   - Last Activity Time

2. **Settings**
   - Auto-lock Timeout
   - Logo Tap Trigger (ON/OFF)
   - Corner Tap Trigger (ON/OFF)
   - Corner Position
   - Required Tap Count

3. **Recent Events** (Masked)
   - Last 10 events
   - Event type, timestamp, metadata keys
   - Scrollable list

4. **Actions**
   - Activate Stealth button
   - Refresh Info button
   - Clear Events button

5. **Capabilities**
   - Web Crypto support (✓/✗)
   - IndexedDB support (✓/✗)

**Usage Example**:
```javascript
// Enable debug shortcut
debugUI.enableKeyboardShortcut();

// Now press Ctrl+Shift+D to toggle panel

// Manual toggle
await debugUI.toggle();

// Show panel
await debugUI.show();

// Hide panel
debugUI.hide();
```

---

## Key Modules & Classes

### Module Initialization Order

1. **Storage Layer**
   ```javascript
   const storageUtils = new StorageUtils();
   ```
   - Initializes IndexedDB on construction
   - Fallback to localStorage available immediately

2. **Cryptography Layer**
   ```javascript
   const cryptoUtils = new CryptoUtils();
   ```
   - Detects Web Crypto API support
   - No initialization needed

3. **Event Logging Layer**
   ```javascript
   const eventLogger = new EventLogger();
   ```
   - Depends on: cryptoUtils, storageUtils
   - No initialization needed

4. **Settings Layer**
   ```javascript
   const stealthSettings = new StealthSettings();
   await stealthSettings.init(); // Async init required
   ```
   - Depends on: cryptoUtils, storageUtils, eventLogger

5. **Unlock & Trigger Layers**
   ```javascript
   const unlockHandler = new UnlockHandler();
   const stealthTriggerHandler = new StealthTriggerHandler();
   // Both async init required
   ```
   - Depend on: stealthSettings

6. **Controller Layer**
   ```javascript
   const stealthController = new StealthController();
   await stealthController.init();
   ```
   - Depends on: all above modules
   - Coordinates everything

7. **Renderer & Debug**
   ```javascript
   const disguiseRenderer = new DisguiseRenderer();
   const debugUI = new DebugUI();
   ```
   - No dependencies, can initialize anytime

### Class Hierarchy

```
StorageUtils (Singleton)
├─ IndexedDB interface
├─ localStorage fallback
└─ stores: settings, events, snapshots

CryptoUtils (Singleton)
├─ Web Crypto API (AES-GCM)
└─ XOR fallback

EventLogger (Singleton)
├─ Encrypt events
├─ Query events
└─ Uses: CryptoUtils, StorageUtils

StealthSettings (Singleton)
├─ Load/save settings
├─ Verify PIN
├─ Manage templates
└─ Uses: CryptoUtils, StorageUtils, EventLogger

UnlockHandler (Singleton)
├─ PIN verification
├─ Pattern detection
├─ Safety prompts
└─ Uses: StealthSettings, EventLogger

StealthTriggerHandler (Singleton)
├─ Logo double-tap
├─ Corner multi-tap
└─ Uses: StealthSettings, EventLogger

StealthController (Singleton)
├─ Orchestrates all modules
├─ Activation/deactivation
├─ Activity tracking
└─ Uses: All above

DisguiseRenderer (Singleton)
├─ Calculator
├─ Notes
├─ Weather
├─ News
├─ Gallery
└─ Custom URL

DebugUI (Singleton)
└─ Debug panel
```

---

## Data Flow

### Stealth Mode Activation Flow

```
User Action (gesture/manual)
        ↓
StealthTriggerHandler detects trigger
        ↓
Dispatch CustomEvent('stealthActivate')
        ↓
StealthController.activate()
        ↓
├─ Log event: 'stealthActivated'
├─ Hide normal screens
├─ Show stealth screen
├─ DisguiseRenderer.render(template)
├─ Disable triggers
└─ UnlockHandler.checkSuspiciousPatterns()
        ↓
Hide SAFEY, show disguise
```

### Unlock Attempt Flow

```
User enters PIN and submits
        ↓
UnlockHandler.attemptUnlock(pin)
        ↓
CryptoUtils.hashPin() → compare with stored hash
        ↓
        ┌─────────────────┬──────────────────┐
        │                 │                  │
      Match            Mismatch          (concurrent
        │                 │              attempt in
        ↓                 ↓              progress)
  Success            Failure               │
  Branch             Branch                ↓
        │                 │              Return false
        ├─ Log event      ├─ Log event
        │                 ├─ Add to failedAttempts
        ├─ Dispatch       ├─ Check threshold
        │ stealthUnlock   │ (≥3 in 2 min)
        │                 │
        ├─ Fade out       ├─ If threshold met:
        │ stealth         │  - Increment suspiciousCounter
        │                 │  - Log: 'suspiciousDetected'
        └─ Show home      │  - Call promptSafetyCheck()
                          │
                          └─ Return false
```

### Event Encryption & Storage Flow

```
App triggers event
        ↓
EventLogger.logEvent(type, metadata)
        ↓
Create event object with:
- type, timestamp, metadata, userAgent
        ↓
CryptoUtils.encrypt(event) 
        ↓
├─ Use Web Crypto API (if available)
│  └─ PBKDF2 key derivation + AES-GCM
│
└─ Fall back to XOR (if unavailable)
        ↓
Base64-encoded result
        ↓
StorageUtils.saveData('events', id, encrypted)
        ↓
├─ Try IndexedDB transaction
│  └─ Add to 'events' store
│
└─ Fall back to localStorage
```

### Pattern Detection Flow

```
UnlockHandler.checkSuspiciousPatterns()
        ↓
┌────────────────────────────────┬───────────────────────┬────────────────────┐
│                                │                       │                    │
Pattern 1: Emergency Toggle   Pattern 2: Failed         Pattern 3: Emergency 
Multiple (>2 in 15 min)       Unlocks (≥3 in 10 min)   + No Activity
        │                            │                    │
        ├─ Get events by type        ├─ Get unlockFail    ├─ Check time since
        │  'emergencyToggled'        │  events            │  last emergency
        │                            │                    │
        ├─ Filter recent (15min)     ├─ Filter recent     ├─ Get all events
        │                            │  (10min)           │  since emergency
        │                            │                    │
        └─ If count > 2              └─ If count ≥ 3      └─ If <3 events in
           ├─ Log suspicious            ├─ Log suspicious    30+ minutes
           └─ Prompt safety check       └─ Prompt safety     ├─ Log suspicious
                                           check             └─ No prompt
```

---

## State Management

### AppState (Global)

Located in `app.js`, represents entire app state:

```javascript
const AppState = {
    currentScreen: 'home',              // Tracks which screen visible
    stealthMode: false,                 // Is stealth active? (use stealthController.isActive)
    assessmentAnswers: [],              // Array of yes/no responses
    currentQuestion: 0,                 // Index of current question
    riskScore: 0,                       // Calculated risk (0-100)
    pin: '1234',                        // (Deprecated - use stealthSettings)
    checkInEvents: [],                  // Recent behavioral events
    safetyPlan: null                    // Generated plan object
}
```

### Stealth State

Managed by `StealthController`:
```javascript
stealthController.isActive        // Boolean
stealthController.lastActivityTime // Unix timestamp
stealthController.getState()       // Returns object
```

### Settings State

Managed by `StealthSettings`:
```javascript
// In IndexedDB 'settings' store, encrypted
{
    pin: null,                     // Never stored plain
    pinHash: 'sha256...',          // PIN verification
    disguiseTemplate: 'calculator',// Current template
    customUrl: 'https://...',      // Custom URL disguise
    triggersEnabled: {...},        // Trigger flags
    cornerTapConfig: {...},        // Corner settings
    autoLockTimeout: 5,            // Minutes
    ... (other settings)
}
```

### Event State

Managed by `EventLogger`:
```javascript
// In IndexedDB 'events' store, encrypted
// Retrieved and decrypted on demand
[
    {
        type: 'stealthActivated',
        timestamp: 1698432000000,
        metadata: {...},
        userAgent: 'Mozilla/5.0...'
    },
    ...
]
```

### Unlock State

Managed by `UnlockHandler`:
```javascript
unlockHandler.failedAttempts    // Array of recent failed attempts
unlockHandler.suspiciousCounter // Counter for suspicious patterns
unlockHandler.isUnlocking       // Boolean for concurrent protection
```

### Trigger State

Managed by `StealthTriggerHandler`:
```javascript
stealthTriggerHandler.logoDoubleTap.tapCount     // Current taps
stealthTriggerHandler.cornerMultiTap.currentTaps // Current taps
```

---

## Storage System

### Storage Hierarchy

```
Level 1: IndexedDB (Preferred)
├─ Object Store: 'settings'
│  └─ Key: 'stealth'
│     Value: { key: 'stealth', value: <encrypted_settings> }
│
├─ Object Store: 'events'
│  ├─ Key: auto-increment id
│  ├─ Index: timestamp
│  ├─ Index: type
│  └─ Values: { id, type, timestamp, encrypted, ... }
│
└─ Object Store: 'snapshots'
   ├─ Key: url
   └─ Value: { url, dataUrl, timestamp }

Level 2: localStorage (Fallback)
├─ safey_settings_stealth
├─ safey_events_all
└─ safey_snapshots_<url>
```

### Key Storage Patterns

**Settings Storage**:
```javascript
// Encrypted before storage
const encrypted = await cryptoUtils.encrypt(stealthSettings.settings);
await storageUtils.saveData('settings', 'stealth', { value: encrypted });

// Retrieved and decrypted
const encrypted = await storageUtils.loadData('settings', 'stealth');
const decrypted = await cryptoUtils.decrypt(encrypted.value);
```

**Event Storage**:
```javascript
// Each event encrypted individually
const event = { type, timestamp, metadata, userAgent };
const encrypted = await cryptoUtils.encrypt(event);
await storageUtils.addEvent({ type, timestamp, encrypted });

// Retrieved and decrypted
const events = await storageUtils.getAllEvents();
for (const event of events) {
    if (event.encrypted) {
        const decrypted = await cryptoUtils.decrypt(event.encrypted);
    }
}
```

### Storage Limits

- **Events**: Max 100 stored (oldest purged automatically)
- **IndexedDB**: Browser quota (usually 50-100MB)
- **localStorage**: 5-10MB per domain
- **Snapshots**: Limited by IndexedDB quota

---

## Security & Privacy

### Encryption Strategy

**Sensitive Data Encrypted**:
- ✅ Settings (PIN hash, templates, triggers)
- ✅ Events (all logged events)
- ✅ Snapshots (cached URLs)

**Encryption Methods**:

1. **AES-256-GCM** (Primary)
   - Algorithm: AES with Galois/Counter Mode
   - Key: PBKDF2 derived (100,000 iterations, SHA-256)
   - IV: Random 12 bytes per encryption
   - Safe for sensitive data

2. **XOR** (Fallback)
   - Used if Web Crypto unavailable
   - Simple XOR against hashed key
   - Not cryptographically strong, only for browsers without Web Crypto

### Privacy Measures

**No External Communication**:
- ❌ No API calls to external services
- ❌ No analytics tracking
- ❌ No data sent to servers
- ✅ All processing local to device

**No Data Collection**:
- ❌ No user tracking
- ❌ No activity monitoring external
- ❌ No IP address logging
- ✅ Events logged locally only

**PIN Security**:
- ✅ Never stored in plain text
- ✅ Hashed with SHA-256 + salt
- ✅ Compared only against hash
- ✅ User can change anytime

**Behavioral Analysis**:
- ✅ Patterns detected locally
- ✅ No pattern data sent externally
- ✅ Events encrypted before storage
- ✅ User can clear all events

### Threat Model

**Protected Against**:
1. ✅ Casual snooper
2. ✅ Someone unlocking phone/laptop
3. ✅ Coerced unlock attempts (suspicious detection)
4. ✅ Brute force PIN attacks (rate limiting)

**Not Protected Against**:
1. ❌ Forensic device analysis
2. ❌ Keylogger malware
3. ❌ Network traffic interception (use HTTPS)
4. ❌ Physical access with time

### Recommended Security Practices

For Users:
1. Use a 4-digit PIN not easily guessable
2. Enable auto-lock to short timeout
3. Keep device locked when not using
4. Consider using with private browser tab
5. Clear browser history/cache periodically

---

## Debugging & Testing

### Debug Mode

**Activation**: `Ctrl+Shift+D` (keyboard shortcut)

**Debug Panel Features**:
- System status display
- Settings inspection
- Recent event log (masked)
- Quick action buttons
- Capability detection

**Example Debug Info**:
```javascript
{
    isActive: true,
    settings: {
        disguiseTemplate: 'calculator',
        autoLockTimeout: 5,
        triggersEnabled: { ... },
        cornerTapConfig: { ... }
    },
    recentEvents: [
        { type: 'stealthActivated', timestamp: '10/27/2025, 2:30:45 PM', ... }
    ],
    suspiciousCounter: 0,
    lastActivity: '10/27/2025, 2:30:45 PM'
}
```

### Testing Procedures

**Testing Stealth Activation**:
1. Load app, go to home screen
2. Click SAFEY logo twice quickly → should activate stealth
3. Should see calculator UI
4. Title should change to "Calculator"
5. All SAFEY UI elements hidden

**Testing PIN Unlock**:
1. In stealth mode (calculator showing)
2. Click display area to show PIN pad
3. Enter PIN (default: 1234)
4. Should unlock and return to home screen

**Testing Auto-Lock**:
1. Deactivate stealth mode
2. Wait for configured timeout (default 5 min) without activity
3. Should auto-activate stealth mode
4. Log: "[SAFEY] Auto-lock timeout reached"

**Testing Pattern Detection**:
1. Try unlocking with wrong PIN 3+ times in 2 minutes
2. Should show "Safety Check" prompt
3. Events logged: `unlockFail`, `suspiciousDetected`

**Testing Corner Multi-Tap**:
1. Configure corner multi-tap in settings
2. Tap in configured corner (default: top-right) 4 times quickly
3. Should activate stealth mode

**Testing Settings Persistence**:
1. Change PIN to '9876'
2. Refresh page
3. Unlock should work with '9876' (not '1234')
4. Settings retained

**Testing Event Encryption**:
1. Open debug panel (Ctrl+Shift+D)
2. View recent events
3. Clear events via debug panel
4. Events should be gone
5. Log shows: "[SAFEY] All events cleared"

### Console Logging

Enable to see debug messages:

**INFO Level**:
```
[SAFEY] Stealth system initialized
[SAFEY] Stealth settings loaded
[SAFEY] Settings loaded and decrypted
```

**WARNING Level**:
```
[SAFEY] Auto-lock timeout reached
[SAFEY] Failed attempt threshold exceeded
```

**ERROR Level**:
```
[SAFEY] Error loading stealth settings: [error]
[SAFEY] Decryption error: [error]
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Settings not persisting | IndexedDB disabled | Check browser privacy settings, localStorage fallback active |
| Encryption failing | No Web Crypto API | Using XOR fallback, security reduced |
| Auto-lock not working | Trigger re-enabling | Check trigger listener state, verify timeout setting |
| PIN not validating | Hash mismatch | Clear storage, reset to default PIN '1234' |
| Events not logging | Storage quota exceeded | Clear events via debug panel, reduce event retention |

---

## Feature Implementation Checklist

### Core Features
- [x] **Risk Assessment** - 8 questions, scoring algorithm
- [x] **Safety Planning** - Template with editable items
- [x] **Resource Directory** - 8 resources, filterable
- [x] **Stealth Mode** - Multiple disguise templates
- [x] **PIN Protection** - 4-digit PIN with hashing
- [x] **Behavioral Alerts** - Pattern detection, suspicious detection
- [x] **Event Logging** - Encrypted event storage
- [x] **Offline Support** - Service worker, PWA capable
- [x] **Mobile UI** - Responsive, touch-friendly

### Stealth Mode Templates
- [x] **Calculator** - Fully functional calculator
- [x] **Notes** - Editable notes app
- [x] **Weather** - Weather forecast display
- [x] **News** - News feed interface
- [x] **Gallery** - Photo gallery interface
- [x] **Custom URL** - Load any HTTPS site

### Triggers
- [x] **Logo Double-Tap** - Double-click SAFEY logo
- [x] **Corner Multi-Tap** - Tap in configured corner
- [x] **Manual Button** - Eye icon in header

### Advanced Features
- [x] **Auto-Lock** - Lock after inactivity
- [x] **Activity Tracking** - Monitor user actions
- [x] **Suspicious Detection** - Coercion patterns
- [x] **Encryption** - Web Crypto + XOR fallback
- [x] **IndexedDB Support** - Advanced storage
- [x] **Debug Mode** - QA testing tools
- [x] **Custom PIN** - User-defined 4-digit PIN

---

## Future Enhancement Ideas

### Short-term (v2.0)
- [ ] SMS integration for safety checks
- [ ] Secure contact list storage
- [ ] Pattern unlock alternative
- [ ] Biometric unlock support
- [ ] Multi-language support

### Medium-term (v3.0)
- [ ] Cloud sync (encrypted)
- [ ] Timed message scheduling
- [ ] Threat level trending
- [ ] Voice command activation
- [ ] Browser extension version

### Long-term (v4.0)
- [ ] Real-time location sharing
- [ ] Encrypted chat system
- [ ] AI-powered risk prediction
- [ ] Legal document templates
- [ ] Integration with helplines

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 2024 | Initial MVP release |
| 1.1 | Oct 2024 | Added encryption, event logging |
| 1.2 | Oct 2024 | Improved pattern detection |
| 2.0-dev | Oct 2025 | Stealth mode enhancements (current branch) |

---

## Support & Resources

- **Documentation**: See README.md, DEPLOYMENT.md
- **Issue Tracking**: GitHub Issues on ag2027/SAFEY_1
- **Security Reports**: Email security team
- **License**: MIT License (see LICENSE file)

---

**Document Version**: 1.0  
**Last Updated**: October 27, 2025  
**Maintained By**: SAFEY Development Team  
**Status**: Active - Current Development Branch

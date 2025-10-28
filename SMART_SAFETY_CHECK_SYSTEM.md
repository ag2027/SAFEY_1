# Smart Safety Check System - Implementation Guide

**Feature**: Intelligent Pattern Detection with Risk Classification and Auto-Escalation  
**Status**: ✅ Implemented  
**Date**: October 27, 2025

---

## 🎯 Overview

The Smart Safety Check System enhances SAFEY's behavioral monitoring with intelligent risk classification, automatic escalation for critical threats, and full integration with the stealth mode queue system.

### **Key Improvements**

1. **Multi-Pattern Aggregation**: Detects 5 suspicious patterns simultaneously
2. **Risk Classification**: Low/Medium/High risk levels based on pattern severity
3. **Auto-Escalation**: High-risk alerts auto-send after 10s (configurable)
4. **Stealth-Safe Queuing**: All alerts queued during stealth mode, never shown
5. **AES Encryption**: All logs and queued alerts encrypted locally
6. **User Control**: Settings toggle for manual-only confirmation

---

## 🔍 Pattern Detection System

### **1. Multiple Emergency Toggles**
- **Threshold**: >2 activations in 15 minutes
- **Risk Level**: 
  - Medium: 3-4 activations
  - High: ≥5 activations
- **Indication**: User may be in distress or being coerced

### **2. Failed Unlock Attempts**
- **Threshold**: ≥3 failed attempts in 10 minutes
- **Risk Level**: 
  - Medium: 3-4 attempts
  - High: ≥5 attempts
- **Indication**: Someone else attempting to access the app

### **3. Emergency Mode Inactivity**
- **Threshold**: 30+ minutes of inactivity after emergency activation
- **Risk Level**: High
- **Indication**: Potential coercion or inability to use device

### **4. Rapid Stealth Activations** *(NEW)*
- **Threshold**: ≥3 activations in 5 minutes
- **Risk Level**: Medium
- **Indication**: Repeated panic situations or surveillance evasion

### **5. Repeated Suspicious Activity** *(NEW)*
- **Threshold**: ≥2 suspicious events in 30 minutes
- **Risk Level**: High
- **Indication**: Escalating danger pattern

---

## ⚠️ Risk Classification Logic

### **Risk Calculation**

```javascript
HIGH risk if:
  - Any HIGH-severity pattern detected, OR
  - 2+ MEDIUM-severity patterns detected

MEDIUM risk if:
  - 1 MEDIUM-severity pattern detected

LOW risk if:
  - Only LOW-severity patterns (currently none defined)
```

### **Risk Level UI Indicators**

| Risk Level | Icon | Color | Auto-Send |
|------------|------|-------|-----------|
| 🔴 **HIGH** | Red Alert | Red (bg-red-600) | ✅ After 10s |
| 🟡 **MEDIUM** | Orange Alert | Orange (bg-orange-600) | ❌ Manual only |
| 🟢 **LOW** | Yellow Warning | Blue (bg-trust-blue) | ❌ Manual only |

---

## 🚨 Auto-Escalation System

### **High-Risk Alert Behavior**

When a HIGH-risk pattern is detected:

1. **Safety check popup appears** with urgent styling
2. **10-second countdown timer** starts automatically
3. **Auto-send notification** displays: "⏱️ Auto-sending in 10s... [Cancel]"
4. **User can cancel** the auto-send at any time
5. **After 10 seconds**: Alert automatically sent (unless cancelled)

### **Manual Confirmation Only Mode**

Users can disable auto-send in Settings:

**Settings → Safety Alert Behavior → Auto-Send High-Risk Alerts** (toggle OFF)

When disabled:
- All alerts require manual confirmation
- Countdown timer shows: "⚙️ Auto-send disabled (Manual confirmation only)"
- User must click "Send Check Now" to send alert

---

## 📦 Stealth Mode Integration

### **Queue Behavior**

**During Stealth Mode**:
- ✅ All safety checks queued (never shown)
- ✅ Risk level preserved in queue
- ✅ Queue encrypted with AES-GCM
- ✅ Max 5 alerts (oldest removed if full)

**After Stealth Exit**:
- ✅ Queue flushed sequentially (500ms delay)
- ✅ 2-second interval between alerts
- ✅ Risk-appropriate UI shown for each
- ✅ High-risk alerts trigger auto-send countdown

**Cross-Session Persistence**:
- ✅ Queue saved to encrypted localStorage
- ✅ Survives page refreshes
- ✅ Flag tracks if stealth was active
- ✅ Auto-flush on app restart if needed

---

## 🔐 Encryption & Privacy

### **Encrypted Data**

1. **Event Logs** (AES-GCM encrypted):
   ```javascript
   {
     type: 'suspiciousDetected',
     patterns: [
       { type: 'multipleFailedUnlocks', severity: 'high', count: 5 }
     ],
     riskLevel: 'high',
     timestamp: 1698432000000
   }
   ```

2. **Safety Queue** (AES-GCM encrypted):
   ```javascript
   {
     queue: [
       {
         reason: '⚠️ URGENT: 5 failed unlock attempts in 10 minutes',
         riskLevel: 'high',
         timestamp: 1698432000000,
         id: 'alert_1698432000000_x7k3m9p2q'
       }
     ],
     timestamp: 1698432000000
   }
   ```

3. **Settings** (AES-GCM encrypted):
   ```javascript
   {
     autoAlertsEnabled: true,
     // ... other settings
   }
   ```

### **Storage Keys**

| Key | Purpose | Encryption |
|-----|---------|------------|
| `safey_safety_queue` | Queued alerts | ✅ AES-GCM |
| `safey_events` | Event history | ✅ AES-GCM |
| `safey_settings` | User preferences | ✅ AES-GCM |
| `safey_stealth_was_active` | Session flag | ❌ Plain (boolean flag) |

---

## 🎨 User Interface

### **Safety Check Popup - Risk Variants**

#### **🔴 HIGH Risk**
```
┌─────────────────────────────────────┐
│ 🚨 URGENT Safety Check              │
│                                     │
│ Critical suspicious activity        │
│ detected. An alert will be sent     │
│ automatically unless cancelled.     │
│                                     │
│ ⚠️ URGENT: 5 failed unlock         │
│ attempts in 10 minutes              │
│                                     │
│ ⏱️ Auto-sending in 8s... [Cancel]  │
│                                     │
│ [Dismiss]  [Send Check Now]        │
└─────────────────────────────────────┘
```

#### **🟡 MEDIUM Risk**
```
┌─────────────────────────────────────┐
│ ⚡ Safety Alert                     │
│                                     │
│ Multiple concerning patterns        │
│ detected. Consider sending a        │
│ safety check to a trusted contact.  │
│                                     │
│ ⚡ ALERT: 3 stealth mode           │
│ activations in 5 minutes            │
│                                     │
│ [Cancel]  [Send Check]             │
└─────────────────────────────────────┘
```

#### **🟢 LOW Risk**
```
┌─────────────────────────────────────┐
│ ⚠️ Safety Check                    │
│                                     │
│ We detected something that might    │
│ be unsafe. Would you like to send   │
│ a safety check?                     │
│                                     │
│ ⚠️ NOTICE: Unusual activity        │
│ detected                            │
│                                     │
│ [Cancel]  [Send Check]             │
└─────────────────────────────────────┘
```

---

## ⚙️ Settings Integration

### **New Setting: Auto-Send High-Risk Alerts**

**Location**: Settings Modal → Safety Alert Behavior

**Default**: Enabled (checked)

**Description**:
> Smart Safety Checks: The app monitors suspicious patterns (failed unlocks, repeated emergency toggles) and classifies them by risk level.
>
> 🟢 Low Risk: Manual confirmation only  
> 🟡 Medium Risk: Manual confirmation only  
> 🔴 High Risk: Auto-sends after 10 seconds (unless disabled below)

**Toggle Options**:
- ✅ **Enabled**: High-risk alerts auto-send after 10s
- ❌ **Disabled**: All alerts require manual confirmation ("Manual Confirmation Only" mode)

**Storage**:
```javascript
stealthSettings.settings.autoAlertsEnabled = true/false
```

---

## 📊 Debug UI Enhancements

### **Safety Queue Section**

Added risk level indicators:
- 🔴 High-risk alerts (red text)
- 🟡 Medium-risk alerts (orange text)
- 🟢 Low-risk alerts (yellow text)

### **Settings Display**

Added auto-alerts status:
```
Auto-Alerts: ENABLED / MANUAL ONLY
```

---

## 🧪 Testing Scenarios

### **Scenario 1: High-Risk Auto-Send**

1. **Trigger**: Enter wrong PIN 5 times in 10 minutes
2. **Expected**:
   - High-risk alert appears
   - 10-second countdown starts
   - Alert auto-sends if not cancelled
3. **Verify**: Check event logs for `safetyCheckSent`

### **Scenario 2: Manual-Only Mode**

1. **Setup**: Disable "Auto-Send High-Risk Alerts" in Settings
2. **Trigger**: Same as Scenario 1
3. **Expected**:
   - High-risk alert appears
   - Countdown shows "Auto-send disabled"
   - User must click "Send Check Now"

### **Scenario 3: Queue During Stealth**

1. **Setup**: Activate stealth mode
2. **Trigger**: Enter wrong PIN 5 times
3. **Expected**:
   - No popup during stealth
   - Alert queued with risk level
   - Check debug panel: Queue size = 1, 🔴 alert visible
4. **Exit stealth**: Alert appears with auto-send countdown

### **Scenario 4: Multiple Patterns**

1. **Trigger**: 
   - 3 emergency toggles in 15min (Medium)
   - 3 stealth activations in 5min (Medium)
2. **Expected**:
   - Risk calculated as HIGH (2+ medium patterns)
   - Alert shows both patterns in message
   - Auto-send countdown if enabled

### **Scenario 5: Cross-Session Persistence**

1. **Setup**: Activate stealth mode
2. **Trigger**: Queue 2 high-risk alerts
3. **Action**: Refresh page while in stealth
4. **Expected**:
   - App detects previous stealth session
   - Queue loaded from encrypted storage
   - Alerts flushed after 1s delay

---

## 🔧 Implementation Details

### **Modified Files**

1. **`js/unlock-handler.js`**
   - Added `autoAlertTimers` tracking
   - Added `riskLevels` constants
   - Enhanced `checkSuspiciousPatterns()` with 5 patterns
   - New `smartSafetyCheck()` aggregation
   - New `calculateRiskLevel()` logic
   - New `buildSafetyCheckMessage()` formatter
   - Updated `queueSafetyCheck()` with risk level
   - Enhanced `showSafetyCheckPopup()` with auto-escalation
   - New `getRiskConfig()` for UI styling

2. **`js/stealth-settings.js`**
   - Added `autoAlertsEnabled: true` default

3. **`index.html`**
   - Added "Safety Alert Behavior" section
   - Added auto-alerts toggle with description
   - Added risk level explanation

4. **`app.js`**
   - Added auto-alerts toggle handler
   - Load/save auto-alerts setting

5. **`js/debug-ui.js`**
   - Added auto-alerts status display
   - Enhanced queue display with risk colors

---

## 📈 Performance & Limits

### **Queue Limits**

- **Max queue size**: 5 alerts
- **Overflow behavior**: Remove oldest
- **Flush delay**: 500ms after stealth exit
- **Alert interval**: 2 seconds between alerts

### **Pattern Detection Windows**

| Pattern | Window | Threshold |
|---------|--------|-----------|
| Emergency toggles | 15 minutes | 3+ |
| Failed unlocks | 10 minutes | 3+ |
| Emergency inactivity | 30 minutes | <3 events |
| Stealth activations | 5 minutes | 3+ |
| Suspicious events | 30 minutes | 2+ |

### **Auto-Send Timing**

- **Countdown duration**: 10 seconds
- **Update interval**: 1 second
- **Cancellation**: Instant (clears timer)

---

## 🚀 Future Enhancements

### **Potential Additions**

1. **Machine Learning Patterns**
   - Time-of-day analysis
   - Device motion detection
   - Location-based patterns

2. **Escalation Levels**
   - Progressive countdown (30s → 20s → 10s)
   - Multi-stage alerts
   - Emergency contacts prioritization

3. **User Customization**
   - Adjustable countdown duration
   - Custom risk thresholds
   - Pattern enable/disable toggles

4. **Advanced Analytics**
   - Pattern trend visualization
   - Risk score over time
   - Export for authorities

---

## ✅ Validation Checklist

- [x] Multi-pattern detection working
- [x] Risk classification accurate
- [x] Auto-send countdown functional
- [x] Manual-only mode working
- [x] Stealth queue integration
- [x] Encryption on all data
- [x] Settings UI complete
- [x] Debug UI updated
- [x] Cross-session persistence
- [x] Event logging accurate

---

## 📝 Summary

The Smart Safety Check System provides:

✅ **Intelligent Pattern Detection**: 5 suspicious patterns monitored simultaneously  
✅ **Risk Classification**: Low/Medium/High levels based on severity  
✅ **Auto-Escalation**: Critical alerts auto-send after 10s  
✅ **Stealth Integration**: All alerts queued during stealth mode  
✅ **Full Encryption**: AES-GCM on logs, queue, and settings  
✅ **User Control**: Settings toggle for manual-only confirmation  

This system maintains disguise integrity while providing proactive safety monitoring and intelligent threat response.

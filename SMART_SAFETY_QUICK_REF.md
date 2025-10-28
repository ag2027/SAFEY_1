# Smart Safety Check Quick Reference

## 🎯 Risk Levels

| Level | Patterns | Auto-Send | UI Color |
|-------|----------|-----------|----------|
| 🔴 **HIGH** | ≥1 high OR ≥2 medium patterns | ✅ After 10s | Red |
| 🟡 **MEDIUM** | 1 medium pattern | ❌ Manual only | Orange |
| 🟢 **LOW** | Low-severity only | ❌ Manual only | Blue |

## 🔍 Detected Patterns

1. **Multiple Emergency Toggles** → Medium (3-4) / High (5+)
2. **Failed Unlock Attempts** → Medium (3-4) / High (5+)
3. **Emergency Mode Inactivity** → High (30min, <3 events)
4. **Rapid Stealth Activations** → Medium (3+ in 5min)
5. **Repeated Suspicious Activity** → High (2+ in 30min)

## ⚙️ Settings

**Auto-Send High-Risk Alerts**: Settings → Safety Alert Behavior
- ✅ **ON**: High-risk alerts auto-send after 10s
- ❌ **OFF**: All alerts require manual confirmation

## 🧪 Test Commands (Debug Panel: Ctrl+Shift+D)

1. **Flush Queue Now** - Manually flush queued alerts
2. **Clear Queue** - Remove all queued alerts
3. **Refresh Info** - Update debug display

## 📦 Storage

| Key | Encryption | Purpose |
|-----|------------|---------|
| `safey_safety_queue` | ✅ AES-GCM | Queued alerts with risk levels |
| `safey_events` | ✅ AES-GCM | Pattern detection event logs |
| `safey_settings` | ✅ AES-GCM | User preferences |

## 🎨 UI Messages

### High Risk
> 🚨 URGENT Safety Check  
> Critical suspicious activity detected. An alert will be sent automatically unless cancelled.  
> ⏱️ Auto-sending in 10s... [Cancel]

### Medium Risk
> ⚡ Safety Alert  
> Multiple concerning patterns detected. Consider sending a safety check to a trusted contact.

### Low Risk
> ⚠️ Safety Check  
> We detected something that might be unsafe. Would you like to send a safety check?

## 🔄 Queue Flow

```
Stealth Active → Pattern Detected → Queue Alert (with risk level)
                                          ↓
                                   Save encrypted
                                          ↓
Stealth Exit → Flush Queue → Show alerts sequentially (2s delay)
                                          ↓
                              High-risk: Auto-send countdown
                              Med/Low: Manual confirmation
```

## ✅ Implementation Checklist

- [x] 5 pattern types detected
- [x] Risk classification (Low/Med/High)
- [x] Auto-send countdown (10s for high-risk)
- [x] Settings toggle for manual-only mode
- [x] Stealth queue integration
- [x] AES-GCM encryption on all data
- [x] Debug UI with risk indicators
- [x] Cross-session persistence

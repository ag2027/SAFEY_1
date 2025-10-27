# SAFEY - Safety Assessment and Resource Platform

A discreet Progressive Web App (PWA) for domestic violence safety and resources.

## Features

✅ **Anonymous Risk Assessment** - 8-question questionnaire with risk scoring  
✅ **Safety Plan Generator** - Personalized safety plans saved locally  
✅ **Resource Directory** - Searchable database of shelters, hotlines, legal aid, and counseling  
✅ **Comprehensive Stealth Mode** - Multiple disguise templates (Calculator, Notes, Weather) with invisible PIN unlock  
✅ **Advanced Trigger System** - Logo double-tap, corner multi-tap, and manual activation  
✅ **Auto-Lock Feature** - Automatic stealth activation after inactivity  
✅ **Behavioral Check-in System** - Pattern detection for safety alerts with user consent  
✅ **Event Logging** - Encrypted local event tracking for behavioral heuristics  
✅ **Offline-First PWA** - Works without internet connection  
✅ **Privacy-First** - All data stays on your device

### Stealth Mode Highlights

- **3 Built-in Disguise Templates**: Calculator (working), Notes (editable), Weather (realistic)
- **Invisible Unlock Methods**: Each disguise has a unique, hidden unlock mechanism
- **Configurable Triggers**: Logo double-tap, corner taps (default: 4 in top-right)
- **Auto-Lock**: Configurable timeout (2-15 minutes) for automatic stealth activation
- **Behavioral Heuristics**: Detects suspicious patterns and prompts optional safety checks
- **Full Settings Control**: Configure PIN, template, triggers, and timeout in Settings

📖 **[Read Full Stealth Mode Documentation](STEALTH_MODE_README.md)**

## Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/ag2027/SAFEY_1.git
cd SAFEY_1
```

2. Serve with any static server:
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

3. Open browser to `http://localhost:8000`

### GitHub Pages Deployment

This app is designed to work on GitHub Pages:

1. Go to repository Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select `main` branch and `/` (root) folder
4. Save and wait for deployment
5. Access at `https://ag2027.github.io/SAFEY_1/`

### PWA Installation

Once accessed via HTTPS:

1. Open in mobile browser (Chrome/Safari/Edge)
2. Tap browser menu
3. Select "Add to Home Screen" or "Install App"
4. App will work offline after installation

## Usage

### Risk Assessment
- Click "Start Assessment" on home screen
- Answer 8 yes/no questions about your situation
- Receive risk score and personalized guidance
- Risk levels: Low (0-30%), Moderate (30-60%), High (60-100%)

### Safety Plan
- Automatically generated after assessment
- Contains emergency contacts, important documents checklist, essential items list
- Editable and saved locally
- Can be exported as text file

### Resources
- Browse by category: All, Shelters, Legal Aid, Counseling, Hotlines
- Contact information for local and national services
- Works offline with cached data

### Stealth Mode

**Quick Activation:**
- Double-tap SAFEY logo (top-left)
- Tap top-right corner 4 times quickly
- Tap eye icon in header

**Disguise Templates:**
- **Calculator** (default): Working calculator - unlock by typing PIN + `=`
- **Notes**: Editable notes - unlock by swiping down 3 times (with PIN in text)
- **Weather**: Weather app - unlock by tapping temperature 5 times

**Configuration:**
- Set 4-digit PIN in Settings (default: 1234)
- Choose disguise template
- Configure auto-lock timeout (2-15 minutes)
- Enable/disable triggers

**Auto-Lock:**
- Automatically activates stealth mode after inactivity
- Default: 5 minutes (configurable)

📖 See [STEALTH_MODE_README.md](STEALTH_MODE_README.md) for complete documentation

### Emergency Mode
- Quick access to emergency hotlines
- Tracks usage for behavioral check-in system
- No data sent externally

### Settings

**General:**
- Clear all local data
- Accessible via gear icon

**Stealth Mode Configuration:**
- Set custom 4-digit PIN for stealth unlock
- Choose disguise template (Calculator, Notes, Weather)
- Configure auto-lock timeout (2-15 minutes)
- Enable/disable logo double-tap trigger
- Enable/disable corner multi-tap trigger
- Clear stealth session and event logs

## Privacy & Security

- **No data collection** - Nothing leaves your device
- **No server communication** - All processing is client-side
- **No accounts required** - Completely anonymous
- **Local storage only** - Uses browser localStorage
- **Stealth mode** - Disguise as calculator for safety
- **Quick exit** - Emergency mode for rapid resource access

## Technical Details

### Stack
- HTML5
- CSS3 (Tailwind CSS via CDN)
- Vanilla JavaScript (ES6+)
- Service Worker for offline support
- Web Manifest for PWA installability

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with PWA support

### Data Storage
- localStorage for preferences and plans
- No IndexedDB needed (simple data structure)
- All data can be cleared via Settings

### File Structure
```
SAFEY_1/
├── index.html              # Main app HTML
├── app.js                  # Core application logic
├── stealth-mode.js         # Comprehensive stealth mode implementation
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline caching
├── README.md               # Main documentation
├── STEALTH_MODE_README.md  # Stealth mode detailed docs
├── LICENSE                 # License file
└── stealth/                # Modular stealth components (ES6)
    ├── stealthModeController.js
    ├── disguiseRenderer.js
    ├── stealthSettings.js
    ├── stealthTriggerHandler.js
    ├── unlockHandler.js
    ├── behavioralHeuristics.js
    ├── utils/
    │   ├── encryption.js
    │   ├── storage.js
    │   └── eventLogger.js
    └── templates/
        ├── calculator.js
        ├── notes.js
        ├── weather.js
        ├── news.js
        ├── gallery.js
        └── customUrl.js
```

### Performance
- App size: ~60KB total (with stealth mode, uncompressed)
- Loads in <1 second on 3G
- Works on low-end mobile devices
- No external dependencies except Tailwind CDN
- Stealth mode: 150-200ms transition animations

## Behavioral Check-in System

The app tracks certain events locally to detect concerning patterns and protect user safety:

### Tracked Events
- `stealthActivated` - Stealth mode activated
- `unlockAttempt`, `unlockSuccess`, `unlockFail` - Unlock attempts
- `emergencyToggled` - Emergency mode activations
- `suspiciousDetected` - Pattern detection triggers
- `safetyCheckSent` - Safety check actions

### Pattern Detection Heuristics

1. **Emergency Toggle Pattern**
   - Triggers if emergency mode activated >2 times within 15 minutes
   - Suggests potential distress situation

2. **Failed Unlock Pattern**
   - Triggers if ≥3 failed unlock attempts within 10 minutes
   - May indicate unauthorized access attempts

3. **Emergency Inactivity Pattern**
   - Triggers if emergency mode entered with no activity for 30 minutes
   - May indicate user unable to continue

### Safety Check Prompt

When a suspicious pattern is detected:
- Shows user-friendly modal: "We detected something that might be unsafe"
- Asks: "Would you like to send a safety check to a trusted contact?"
- User must explicitly choose "Send" or "Cancel"
- **No automatic actions** - user consent always required
- Demo mode: logs payload to console (no real transmission)

### Privacy Guarantees
- **User Consent**: Always asks permission before any action
- **No Recording**: Does not record audio, video, or keystrokes
- **Local Only**: Events stored locally, never transmitted automatically
- **Debug Mode**: Event logs can be viewed in console for transparency
- **Clear Session**: User can wipe all event logs at any time

## Development

### Testing Locally

```bash
# Start local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Testing PWA Features

1. Use HTTPS (required for service workers)
2. Test offline: Open DevTools → Network → Check "Offline"
3. Test installation: Chrome → Menu → Install App
4. Test on mobile: Use Chrome DevTools device emulation

### Customizing Resources

Edit the `resources` array in `app.js`:

```javascript
const resources = [
  {
    name: "Organization Name",
    category: "shelter", // shelter, legal, counseling, hotline
    phone: "1-555-0000",
    description: "Brief description",
    hours: "Mon-Fri 9AM-5PM" // optional
  }
  // Add more resources...
];
```

## Contributing

This is a safety-critical application. Contributions should prioritize:

1. **User safety and privacy**
2. **Accessibility** (WCAG 2.1 AA compliance)
3. **Performance** (work on low-end devices)
4. **Offline functionality**
5. **Security** (no data leaks)

## License

See LICENSE file for details.

## Support Resources

**If you or someone you know is in danger:**

- **National Domestic Violence Hotline**: 1-800-799-7233 (24/7)
- **Crisis Text Line**: Text HOME to 741741
- **Emergency**: 911

This app is a tool, not a replacement for professional help. If you feel unsafe, reach out to local resources or call emergency services.

## Disclaimer

This application is for educational and support purposes. It is not a substitute for professional medical, legal, or safety advice. Always consult with qualified professionals for your specific situation.

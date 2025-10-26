# SAFEY - Safety Assessment and Resource Platform

A discreet Progressive Web App (PWA) for domestic violence safety and resources.

## Features

✅ **Anonymous Risk Assessment** - 8-question questionnaire with risk scoring  
✅ **Safety Plan Generator** - Personalized safety plans saved locally  
✅ **Resource Directory** - Searchable database of shelters, hotlines, legal aid, and counseling  
✅ **Stealth/Panic Mode** - Disguise app as calculator with PIN unlock  
✅ **Behavioral Check-in System** - Pattern detection for safety alerts  
✅ **Offline-First PWA** - Works without internet connection  
✅ **Privacy-First** - All data stays on your device

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
- Tap eye icon in header to activate
- App transforms into calculator
- Unlock with PIN (default: 1234)
- Change PIN in Settings

### Emergency Mode
- Quick access to emergency hotlines
- Tracks usage for behavioral check-in system
- No data sent externally

### Settings
- Set custom 4-digit PIN for stealth mode
- Clear all local data
- Accessible via gear icon

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
├── index.html          # Main app HTML
├── app.js              # Application logic
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline caching
├── README.md           # Documentation
└── LICENSE             # License file
```

### Performance
- App size: ~40KB total (uncompressed)
- Loads in <1 second on 3G
- Works on low-end mobile devices
- No external dependencies except Tailwind CDN

## Behavioral Check-in System

The app tracks certain events locally to detect concerning patterns:

- **Tracked Events**: emergency mode activations, stealth mode toggles, failed unlock attempts
- **Pattern Detection**: Multiple emergency activations within 1 hour triggers safety check prompt
- **User Consent**: Always asks permission before any action
- **No Recording**: Does not record audio, video, or keystrokes
- **Privacy**: Events stored locally, never transmitted

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

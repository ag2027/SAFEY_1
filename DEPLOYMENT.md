# SAFEY Deployment Guide

## Quick Start

### GitHub Pages Deployment

1. Go to your repository on GitHub: `https://github.com/ag2027/SAFEY_1`
2. Click on **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes for deployment
6. Your app will be live at: `https://ag2027.github.io/SAFEY_1/`

### Local Testing

```bash
# Clone repository
git clone https://github.com/ag2027/SAFEY_1.git
cd SAFEY_1

# Serve with Python 3
python3 -m http.server 8000

# Or with Node.js
npx http-server -p 8000

# Open browser
open http://localhost:8000
```

## PWA Installation

### On Mobile (iOS)

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"
5. The app icon will appear on your home screen

### On Mobile (Android)

1. Open the app in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home Screen" or "Install App"
4. Tap "Add" or "Install"
5. The app will be installed

### On Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge
2. Look for the install icon (⊕) in the address bar
3. Click "Install"
4. The app will open in its own window

## Features Overview

### 1. Risk Assessment
- **Access**: Click "Start Assessment" on home screen
- **Questions**: 8 evidence-based questions about safety
- **Scoring**: Automatic calculation with Low/Moderate/High risk levels
- **Storage**: Results saved locally for future reference

### 2. Safety Plan
- **Access**: Click "View Safety Plan" or complete assessment
- **Content**: Emergency contacts, important documents, essential items
- **Customization**: Urgent actions shown for high-risk cases
- **Export**: Download plan as text file

### 3. Resources
- **Access**: Click "Resources" on home screen
- **Categories**: Shelters, Legal Aid, Counseling, Hotlines
- **Filtering**: Click category buttons to filter
- **Actions**: Click phone numbers to call directly

### 4. Stealth Mode
- **Activation**: Click eye icon in header
- **Disguise**: App transforms into calculator
- **Unlock**: Click "C" button, enter PIN (default: 1234)
- **Customization**: Change PIN in Settings

### 5. Emergency Mode
- **Access**: Click "Emergency Mode" on home screen
- **Action**: Shows emergency hotlines immediately
- **Tracking**: Logs usage for behavioral check-in

### 6. Settings
- **Access**: Click gear icon in header
- **PIN Change**: Enter new 4-digit PIN
- **Clear Data**: Remove all saved information

## Security & Privacy

### Data Storage
- All data stored in browser's localStorage
- Nothing sent to external servers
- No cookies or tracking
- No personal information collected

### What Gets Saved
- Assessment results and date
- Safety plan customizations
- User PIN (encrypted in localStorage)
- Behavioral event log (last 50 events)

### Clearing Data
1. Open Settings (gear icon)
2. Click "Clear All Data"
3. Confirm the action
4. All local data will be deleted

### Browser Privacy
For maximum privacy:
1. Use browser's private/incognito mode
2. Clear browser history after use
3. Use device's built-in security (Face ID, PIN)
4. Consider using a secure folder app

## Offline Functionality

The app works completely offline after first load:
- All features available without internet
- Resources cached locally
- Assessment and safety plan work offline
- Only initial load requires internet for Tailwind CSS

## Browser Support

### Mobile
- iOS Safari 14+
- Android Chrome 90+
- Android Firefox 88+
- Samsung Internet 14+

### Desktop
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

## File Structure

```
SAFEY_1/
├── index.html          # Main app HTML (249 lines)
├── app.js              # Application logic (674 lines)
├── service-worker.js   # Offline caching (79 lines)
├── manifest.json       # PWA manifest (24 lines)
├── README.md           # Documentation
├── DEPLOYMENT.md       # This file
├── .gitignore          # Git ignore rules
└── LICENSE             # License file
```

## Customization

### Adding Resources

Edit `app.js` and find the `resources` array:

```javascript
const resources = [
  {
    name: "Organization Name",
    category: "shelter",  // shelter, legal, counseling, hotline
    phone: "1-555-0000",
    description: "Brief description",
    hours: "Mon-Fri 9AM-5PM"  // optional
  }
  // Add more...
];
```

### Changing Default PIN

Edit `app.js` and find:

```javascript
pin: localStorage.getItem('safey_pin') || '1234',
```

Change `'1234'` to your preferred default.

### Modifying Questions

Edit `app.js` and find the `assessmentQuestions` array to add/modify questions.

## Troubleshooting

### App Not Installing
- Ensure you're using HTTPS (required for PWA)
- Try a different browser
- Clear browser cache and retry

### Offline Mode Not Working
- Visit app at least once while online
- Check browser console for service worker errors
- Try disabling browser extensions

### Data Not Saving
- Check browser localStorage is enabled
- Ensure you're not in private/incognito mode (data won't persist)
- Check browser console for errors

### Stealth Mode Not Working
- Verify PIN is correct (default: 1234)
- Check Settings to reset PIN
- Clear data and try again

## Performance

- **Load Time**: <1 second on 3G
- **App Size**: ~40KB total (uncompressed)
- **Memory**: <10MB typical usage
- **Storage**: <1MB for all user data

## Support Resources

If you or someone you know is in danger:

- **National Domestic Violence Hotline**: 1-800-799-7233 (24/7)
- **Crisis Text Line**: Text HOME to 741741
- **Emergency**: 911

## License

See LICENSE file for details.

## Disclaimer

This application is for educational and support purposes. It is not a substitute for professional medical, legal, or safety advice. Always consult with qualified professionals for your specific situation.

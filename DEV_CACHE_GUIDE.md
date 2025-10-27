# SAFEY Development Helper

## Quick Cache Clearing

If you're having caching issues during development:

### Option 1: Hard Refresh
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### Option 2: Clear Service Worker
1. Open DevTools (`F12`)
2. Go to Application/Storage tab
3. Click "Clear site data"
4. Unregister service workers
5. Refresh page

### Option 3: Incognito Mode
- Open in private/incognito window (bypasses all caches)

## Development Mode Detection

SAFEY automatically detects development environments by checking:

- **Hostname**: `localhost` or `127.0.0.1`
- **Port**: Any port other than `80` (HTTP) or `443` (HTTPS)

This means it works with:
- ✅ VS Code Live Server (typically `127.0.0.1:5500`)
- ✅ Local Python/Node servers on any port
- ✅ Any local development setup

When in development mode:
- 🚫 Service worker caching is disabled
- 🔄 Cache names include timestamps for uniqueness
- 👁️ "DEV MODE" indicator appears in top-right
- 📝 Console logs confirm development status

## Production Behavior

When deployed (not localhost):
- ✅ Aggressive caching for offline functionality
- ✅ Fast loading from cache
- ✅ Works without internet connection
- ✅ No development indicators

## Testing Cache Behavior

To test production caching locally, temporarily change:
```javascript
const isDevelopment = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port !== '80' && window.location.port !== '443';
```
to:
```javascript
const isDevelopment = false; // Force production caching
```

This simulates how the app behaves when deployed.
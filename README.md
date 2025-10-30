<div align="center">

# SAFEY — Mobile Safety & Privacy PWA

Discreet, privacy-first tools for personal safety — designed for mobile and built to work offline.

Submission for the Congressional App Challenge 2025

</div>

## 1) Overview

SAFEY is a mobile-first Progressive Web App that helps users assess risk, prepare a safety plan, and discreetly reach help when needed. The app is designed for survivors and individuals seeking a private, on-device tool for safety planning and resources. It emphasizes privacy, offline access, and subtle interactions suited for sensitive contexts.

Core problems addressed:
- Discreet access to safety tools and resources
- Private, on-device storage of sensitive information
- Quick safety actions with stealth and silent-emergency options

Live app: https://ag2027.github.io/SAFEY_1/

## 2) Features

- Mobile-first UI: responsive layout, large touch targets, smooth transitions
- Risk Assessment: 8-question check with clear, on-device guidance — no network needed
- Personalized Safety Plan: editable, locally saved plan with quick export options
- Resource Directory: categorized local/national resources (hotlines, shelters, legal, counseling)
- Stealth Mode (Calculator): instant disguise to a calculator; unlock with PIN via calculator pattern
- Silent Emergency Trigger: triple-tap in a corner to queue a safety alert with no visible UI
- Trusted Contacts: store up to 5 contacts and quickly open SMS/call with an auto-composed alert message
- Smart Safety Checks: detects patterns (failed unlocks, repeated toggles) and classifies risk; includes optional 10s auto-send for high-risk alerts with cancel button
- Queue & Resume: safety alerts triggered in stealth or while paused are queued and shown later for action
- Lockout Protections: progressive lockouts on repeated failed PINs, with clear warnings
- Offline-First: PWA installable and usable offline; all core features work without internet
- Privacy-First: all data stays on device; encrypted local storage for sensitive settings

## 3) Mobile Installation & Usage

Accessing the App
- Open the hosted app: https://ag2027.github.io/SAFEY_1/

Add to Home Screen (Install)
- iOS (Safari): Share → Add to Home Screen
- Android (Chrome): Menu ⋮ → Add to Home Screen

Offline Use
- SAFEY is a PWA that caches the interface so it works offline after first load/install
- AI chatbot requires internet and may use a third‑party API; everything else works offline
- Even without the chatbot, SAFEY remains fully useful for assessment, plans, resources, and safety features

Uninstalling
- Remove like any app: long‑press the icon → Remove App/Uninstall

## 4) Tech Stack & Architecture

- Frontend: HTML5, Tailwind CSS (via CDN), Vanilla JavaScript (ES6+)
- PWA: Web App Manifest, Service Worker for offline caching
- Storage: IndexedDB and localStorage, wrapped by `storage-utils.js`
- Security/Privacy: Web Crypto API for encrypting sensitive data (see `crypto-utils.js`)
- App Modules (selected):
  - `stealth-settings.js` — centralized settings, PIN, triggers, and defaults (encrypted)
  - `stealth-controller.js` — orchestrates stealth mode lifecycle and data clears
  - `unlock-handler.js` — calculator unlock flow, safety queue, safety checks UI
  - `stealth-trigger-handler.js` — gesture/trigger detection (logo tap, corner multi‑tap)
  - `trusted-contacts.js` — encrypted trusted contacts and alert message templating
  - `event-logger.js` — local event logs and masked debug utilities

Architecture notes
- 100% client‑side; no backend services
- Modular JS with clear boundaries (settings, triggers, unlock, logging, UI helpers)
- Mobile-optimized DOM and styles; ARIA-labelled dialogs and keyboard traps for accessibility

## 5) Privacy & Security

- Local-only by design: no accounts, no analytics, no trackers
- Sensitive settings (e.g., PIN, trusted contacts) are encrypted and stored locally
- Safety actions (SMS/calls) open the device’s native apps via `sms:`/`tel:` links — nothing is auto‑sent
- The optional AI chatbot clearly warns that messages go to a third‑party API; users can provide their own key
- “Clear All Data” wipes settings, logs, and cached data; app reloads to a clean state without a default PIN

Note on Safety Checks (Demo vs Production)
- In a real deployment, alerts could integrate with secure webhooks or trusted-contact APIs for automated outreach.
- For this demonstration, SAFEY does not transmit data off‑device. When you choose to alert someone, the app opens your phone’s SMS or dialer with a pre‑filled message, and you decide whether to send it.
- This intentional approach keeps personal information on‑device and aligns with privacy best practices for demos, while accurately simulating the emergency workflow and preserving full user control.

## 6) Challenges & Learnings

- Discreet Interaction Design: Creating reliable, low‑profile gestures (e.g., corner multi‑tap) that avoid accidental triggers while remaining fast under stress
- Safety Without Servers: Implementing safety checks, queuing, and contact actions entirely on‑device while preserving privacy and auditability

## 7) Future Plans

- Broader language support and improved in‑app localization
- Expanded accessibility (screen reader polish, color contrast, haptics where available)
- More configurable safety flows (timers, messages) while keeping everything private/on‑device

## 8) Demo & Credits

- Demo video: [Add your video link here]
- Live app: https://ag2027.github.io/SAFEY_1/
- Credits: Built by ag2027 and contributors

---

If you or someone you know is in immediate danger, call 911 (US) or your local emergency number. For confidential support in the US: National Domestic Violence Hotline 1‑800‑799‑7233, Crisis Text Line — text HOME to 741741.

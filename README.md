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
- Risk Assessment: 13-question check with clear, on-device guidance — no network needed
- Personalized Safety Plan: editable, locally saved plan with quick export options
- Resource Directory: categorized local/national resources (hotlines, shelters, legal, counseling)
- Stealth Mode: instant disguise the app from untrustworthy individuals; choose from calculator, notes, or weather templates; unlock with PIN (calculator pattern uses = three times)
- Silent Emergency Trigger: triple-tap in a corner to queue a safety alert with no visible UI
- Trusted Contacts: store up to 5 contacts and quickly open SMS/call with an auto-composed alert message
- Smart Safety Checks: detects patterns (failed unlocks, repeated toggles) and classifies risk; includes optional 10s auto-send for high-risk alerts with cancel button
- Queue & Resume: safety alerts triggered in stealth or while paused are queued and shown later for action
- Lockout Protections: progressive lockouts on repeated failed PINs, with clear warnings
- Activation Triggers & Auto‑Lock: configurable corner multi‑tap to activate stealth; adjustable auto‑lock to stealth after inactivity
- Emergency Mode Quick Actions: Call 911, Text trusted contact, and View nearby resources in one tap
- Success Modal Actions: after sending safety checks, copy the alert message or tap to Text/Call each trusted contact
- Offline-First: Progressive Web App (PWA) installable and usable offline; all core features except chatbot work without internet 
- Privacy-First: all data stays on device; encrypted local storage for sensitive settings

## 3) Mobile Installation & Usage

Accessing the App
- Open the hosted app: https://ag2027.github.io/SAFEY_1/

Add to Home Screen (Install)
- iOS (Safari): Share → Add to Home Screen
- Android (Chrome): Menu ⋮ → Add to Home Screen

Offline Use
- SAFEY is a PWA that caches the interface so it works offline after first load/install
- AI chatbot requires internet and uses a third‑party API; everything else works offline
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

Additional architecture details
- Disguise Renderer supports calculator/notes/weather (with internal support for additional decoy templates)
- Safety queue is encrypted and persisted locally; queued alerts flush when it’s safe to display
- Trusted contact message template supports placeholders: `{{reason}}`, `{{risk}}`, `{{time}}`
- GitHub Pages–aware service worker optimizes caching paths for project pages

Architecture notes
- 100% client‑side; no backend services
- Modular JS with clear boundaries (settings, triggers, unlock, logging, UI helpers)
- Mobile-optimized DOM and styles; ARIA-labelled dialogs and keyboard traps for accessibility

We used modern AI-assisted coding tools (e.g., GitHub Copilot) to accelerate development and documentation while maintaining full human oversight.
All safety logic, architecture, and design decisions were created and reviewed by us.

## 5) Privacy & Security

- Local-only by design: no accounts, no analytics, no trackers
- Sensitive settings (e.g., PIN, trusted contacts) are encrypted and stored locally
- Safety actions (SMS/calls) open the device’s native apps via `sms:`/`tel:` links — nothing is auto‑sent
- The AI chatbot goes to a third‑party API, Cerebras AI; we extensively checked their data privacy terms before applying it
- “Clear All Data” wipes settings, logs, and cached data; app reloads to a clean state with a default PIN (123456)

Note on Safety Checks (Demo vs Production)
- In a real deployment, alerts could integrate with secure webhooks or trusted-contact APIs for automated outreach.
- For this demonstration, SAFEY does not transmit data off‑device. When you choose to alert someone, the app opens your phone’s SMS or dialer with a pre‑filled message, and you decide whether to send it.
- This intentional approach keeps personal information on‑device and aligns with privacy best practices for demos, while accurately simulating the emergency workflow and preserving full user control.

## 6) Challenges & Learnings

- Discreet Interaction Design: Creating reliable, low‑profile gestures (e.g., corner multi‑tap) that avoid accidental triggers while remaining fast under stress
- Safety Without Servers: Implementing safety checks, queuing, and contact actions entirely on‑device while preserving privacy and auditability
- Lockout Policy Design: Tiered lockouts (30s, 5m) with a critical level‑3 threshold (10 failed attempts) that triggers a clear data‑reset warning and supports full wipe routines

## 7) Future Plans

- Broader language support and improved in‑app localization
- Expanded accessibility (screen reader polish, color contrast, haptics where available, and alternate stealth trigger methods)
- More configurable safety flows (timers, messages) while keeping everything private/on‑device

## 8) Demo & Credits

- Demo video: 
- Live app: https://ag2027.github.io/SAFEY_1/
- Credits: Built by Atiksh Gupta and Amrik Majumdar

---


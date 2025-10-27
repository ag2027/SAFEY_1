// SAFEY Stealth Mode - Integrated Version
// Comprehensive stealth/disguise mode implementation
// Compatible with vanilla JS - no ES6 modules required

(function() {
    'use strict';

    // Simple Settings Storage (uses localStorage for simplicity)
    const StealthConfig = {
        getSettings: function() {
            const defaults = {
                enabled: false,
                template: 'calculator',
                pin: localStorage.getItem('safey_stealth_pin') || '1234',
                triggers: {
                    logoDoubleTap: true,
                    cornerTaps: 4
                },
                autoLockMinutes: 5,
                customUrl: '',
                debugMode: false
            };
            const saved = localStorage.getItem('safey_stealth_settings');
            return saved ? Object.assign(defaults, JSON.parse(saved)) : defaults;
        },
        
        saveSettings: function(settings) {
            localStorage.setItem('safey_stealth_settings', JSON.stringify(settings));
        },
        
        setPin: function(pin) {
            localStorage.setItem('safey_stealth_pin', pin);
            console.log('[Stealth] PIN updated');
        },
        
        getPin: function() {
            return localStorage.getItem('safey_stealth_pin') || '1234';
        }
    };

    // Disguise Templates
    const DisguiseTemplates = {
        calculator: {
            title: 'Calculator',
            render: function() {
                return `
                    <div class="max-w-md mx-auto p-4 h-screen bg-gray-900 text-white">
                        <div class="h-full flex flex-col">
                            <div class="text-right p-4 text-3xl font-mono mb-4 bg-gray-800 rounded">
                                <div id="stealth-calc-display" class="min-h-12">0</div>
                            </div>
                            <div class="grid grid-cols-4 gap-2 flex-1">
                                <button class="stealth-calc-btn bg-gray-600 hover:bg-gray-500 rounded text-xl font-bold py-4" data-value="C">C</button>
                                <button class="stealth-calc-btn bg-gray-600 hover:bg-gray-500 rounded text-xl font-bold py-4" data-value="+/-">+/−</button>
                                <button class="stealth-calc-btn bg-gray-600 hover:bg-gray-500 rounded text-xl font-bold py-4" data-value="%">%</button>
                                <button class="stealth-calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="/">÷</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="7">7</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="8">8</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="9">9</button>
                                <button class="stealth-calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="*">×</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="4">4</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="5">5</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="6">6</button>
                                <button class="stealth-calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="-">−</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="1">1</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="2">2</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="3">3</button>
                                <button class="stealth-calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="+">+</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4 col-span-2" data-value="0">0</button>
                                <button class="stealth-calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value=".">.</button>
                                <button class="stealth-calc-btn bg-green-600 hover:bg-green-500 rounded text-xl font-bold py-4" data-value="=">=</button>
                            </div>
                        </div>
                    </div>
                `;
            },
            init: function(unlockFn) {
                const display = document.getElementById('stealth-calc-display');
                let current = '0';
                let operand = null;
                let operation = null;
                let newNumber = true;
                let pinSeq = '';
                const pin = StealthConfig.getPin();

                document.querySelectorAll('.stealth-calc-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const value = this.dataset.value;
                        
                        // Track digits for PIN
                        if (/^\d$/.test(value)) {
                            pinSeq += value;
                            if (pinSeq.length > 10) pinSeq = pinSeq.slice(-10);
                        }

                        // Calculator logic
                        if (value === 'C') {
                            current = '0';
                            operand = null;
                            operation = null;
                            newNumber = true;
                            pinSeq = '';
                        } else if (value === '=') {
                            // Check for PIN unlock
                            if (pinSeq.endsWith(pin)) {
                                unlockFn();
                                return;
                            }
                            // Calculate
                            if (operation && operand !== null) {
                                const curr = parseFloat(current);
                                let result;
                                switch (operation) {
                                    case '+': result = operand + curr; break;
                                    case '-': result = operand - curr; break;
                                    case '*': result = operand * curr; break;
                                    case '/': result = operand / curr; break;
                                }
                                current = result.toString();
                                operand = null;
                                operation = null;
                                newNumber = true;
                            }
                        } else if (['+', '-', '*', '/'].includes(value)) {
                            operand = parseFloat(current);
                            operation = value;
                            newNumber = true;
                        } else if (value === '+/-') {
                            current = (-parseFloat(current)).toString();
                        } else if (value === '%') {
                            current = (parseFloat(current) / 100).toString();
                        } else {
                            if (newNumber) {
                                current = value;
                                newNumber = false;
                            } else {
                                if (value === '.' && current.includes('.')) return;
                                current = current === '0' && value !== '.' ? value : current + value;
                            }
                        }
                        display.textContent = current;
                    });
                });
            }
        },
        
        notes: {
            title: 'Notes',
            render: function() {
                return `
                    <div class="max-w-md mx-auto h-screen bg-amber-50">
                        <div class="h-full flex flex-col">
                            <div class="bg-amber-100 px-4 py-3 border-b border-amber-200 flex items-center justify-between">
                                <h1 class="text-xl font-semibold text-gray-800">📝 Notes</h1>
                                <button class="p-2 hover:bg-amber-200 rounded transition">
                                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                            <div class="flex-1 overflow-hidden">
                                <textarea id="stealth-notes-text" class="w-full h-full p-4 bg-amber-50 text-gray-800 font-mono text-sm resize-none focus:outline-none" 
                                    placeholder="Start typing...">Shopping List
- Milk
- Bread
- Eggs

To Do:
- Call dentist
- Pay utilities</textarea>
                            </div>
                            <div class="bg-amber-100 px-4 py-2 border-t border-amber-200 text-xs text-gray-500 text-center">
                                Last edited: ${new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                `;
            },
            init: function(unlockFn) {
                const textarea = document.getElementById('stealth-notes-text');
                const pin = StealthConfig.getPin();
                let swipeCount = 0;
                let lastSwipe = 0;

                textarea.addEventListener('touchstart', function(e) {
                    this.swipeStartY = e.touches[0].clientY;
                });

                textarea.addEventListener('touchend', function(e) {
                    const swipeEndY = e.changedTouches[0].clientY;
                    const distance = swipeEndY - this.swipeStartY;
                    if (distance > 100) {
                        const now = Date.now();
                        if (now - lastSwipe < 2000) {
                            swipeCount++;
                            if (swipeCount >= 3 && textarea.value.includes(pin)) {
                                unlockFn();
                            }
                        } else {
                            swipeCount = 1;
                        }
                        lastSwipe = now;
                    }
                });
            }
        },
        
        weather: {
            title: 'Weather',
            render: function() {
                const hour = new Date().getHours();
                const isDay = hour >= 6 && hour < 18;
                return `
                    <div class="max-w-md mx-auto h-screen bg-gradient-to-b ${isDay ? 'from-blue-400 to-blue-200' : 'from-slate-800 to-slate-600'}">
                        <div class="h-full flex flex-col p-6 text-white">
                            <div class="text-center mb-8 mt-8">
                                <h1 class="text-3xl font-light mb-1">San Francisco</h1>
                                <p class="text-sm opacity-80">${new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            </div>
                            <div id="stealth-weather-main" class="flex-1 flex flex-col items-center justify-center">
                                <div class="text-8xl mb-6">${isDay ? '☀️' : '🌙'}</div>
                                <div class="text-7xl font-light mb-4">72°</div>
                                <div class="text-2xl font-light mb-6">Partly Cloudy</div>
                                <div class="flex gap-6 text-sm">
                                    <div class="text-center"><div class="opacity-80">High</div><div class="text-xl font-medium">78°</div></div>
                                    <div class="text-center"><div class="opacity-80">Low</div><div class="text-xl font-medium">65°</div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            },
            init: function(unlockFn) {
                const main = document.getElementById('stealth-weather-main');
                let taps = 0;
                let lastTap = 0;
                main.addEventListener('click', function() {
                    const now = Date.now();
                    if (now - lastTap < 2000) {
                        taps++;
                        if (taps >= 5) {
                            unlockFn();
                            taps = 0;
                        }
                    } else {
                        taps = 1;
                    }
                    lastTap = now;
                });
            }
        }
    };

    // Main Stealth Mode Controller
    window.StealthMode = {
        isActive: false,
        container: null,
        
        init: function() {
            // Create stealth container
            this.container = document.createElement('div');
            this.container.id = 'stealth-container';
            this.container.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999; background:white;';
            document.body.appendChild(this.container);
            
            // Setup triggers
            this.setupTriggers();
            
            // Setup auto-lock
            this.setupAutoLock();
            
            console.log('[Stealth Mode] Initialized');
        },
        
        setupTriggers: function() {
            const self = this;
            const settings = StealthConfig.getSettings();
            
            // Logo double-tap
            if (settings.triggers.logoDoubleTap) {
                let logoTaps = 0;
                let logoLastTap = 0;
                
                // Find logo/heading
                const logos = document.querySelectorAll('h1, .logo, [class*="logo"]');
                logos.forEach(logo => {
                    logo.addEventListener('click', function() {
                        const now = Date.now();
                        if (now - logoLastTap < 500) {
                            logoTaps++;
                            if (logoTaps >= 2) {
                                self.activate();
                                logoTaps = 0;
                            }
                        } else {
                            logoTaps = 1;
                        }
                        logoLastTap = now;
                    });
                });
            }
            
            // Corner taps
            let cornerTaps = 0;
            let cornerLastTap = 0;
            document.addEventListener('click', function(e) {
                const w = window.innerWidth;
                const h = window.innerHeight;
                const zone = 80;
                
                // Check top-right corner
                if (e.clientX > w - zone && e.clientY < zone) {
                    const now = Date.now();
                    if (now - cornerLastTap < 2000) {
                        cornerTaps++;
                        if (cornerTaps >= (settings.triggers.cornerTaps || 4)) {
                            self.activate();
                            cornerTaps = 0;
                        }
                    } else {
                        cornerTaps = 1;
                    }
                    cornerLastTap = now;
                }
            });
        },
        
        setupAutoLock: function() {
            const self = this;
            const settings = StealthConfig.getSettings();
            let lastActivity = Date.now();
            
            // Track activity
            ['mousedown', 'touchstart', 'keydown'].forEach(event => {
                document.addEventListener(event, () => {
                    lastActivity = Date.now();
                });
            });
            
            // Check for inactivity
            setInterval(() => {
                if (self.isActive) return;
                const inactive = Date.now() - lastActivity;
                const timeout = (settings.autoLockMinutes || 5) * 60 * 1000;
                if (inactive >= timeout) {
                    self.activate('auto');
                }
            }, 30000);
        },
        
        activate: function(trigger = 'manual') {
            if (this.isActive) return;
            
            console.log('[Stealth Mode] Activating...', trigger);
            
            const settings = StealthConfig.getSettings();
            const template = DisguiseTemplates[settings.template] || DisguiseTemplates.calculator;
            
            // Hide main app
            const screens = document.querySelectorAll('.screen');
            screens.forEach(s => s.style.display = 'none');
            
            // Show stealth container
            this.container.style.display = 'block';
            this.container.innerHTML = template.render();
            document.title = template.title;
            
            // Initialize template with unlock function
            const self = this;
            template.init(function() {
                self.deactivate();
            });
            
            this.isActive = true;
            
            // Log event
            this.logEvent('stealthActivated', { trigger });
        },
        
        deactivate: function() {
            if (!this.isActive) return;
            
            console.log('[Stealth Mode] Deactivating...');
            
            // Hide stealth container
            this.container.style.display = 'none';
            this.container.innerHTML = '';
            
            // Show main app
            const screens = document.querySelectorAll('.screen');
            const homeScreen = document.getElementById('home-screen');
            if (homeScreen) {
                homeScreen.classList.add('active');
            }
            
            document.title = 'Notes';
            this.isActive = false;
            
            // Log event
            this.logEvent('stealthDeactivated');
        },
        
        logEvent: function(type, data = {}) {
            const events = JSON.parse(localStorage.getItem('safey_stealth_events') || '[]');
            events.push({
                type: type,
                timestamp: Date.now(),
                data: data
            });
            // Keep last 100 events
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }
            localStorage.setItem('safey_stealth_events', JSON.stringify(events));
            console.log(`[Stealth Event] ${type}`, data);
        },
        
        clearSession: function() {
            if (confirm('Clear all stealth mode data and event logs?')) {
                localStorage.removeItem('safey_stealth_events');
                localStorage.removeItem('safey_stealth_settings');
                console.log('[Stealth Mode] Session cleared');
            }
        },
        
        getDebugInfo: function() {
            return {
                isActive: this.isActive,
                settings: StealthConfig.getSettings(),
                events: JSON.parse(localStorage.getItem('safey_stealth_events') || '[]')
            };
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.StealthMode.init();
        });
    } else {
        window.StealthMode.init();
    }

})();

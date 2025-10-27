// Disguise template renderer
// Renders different disguise UIs (Calculator, Notes, Weather, News, Gallery, Custom URL)

class DisguiseRenderer {
    constructor() {
        this.currentTemplate = null;
        this.container = null;
    }

    // Render a disguise template
    async render(template, container) {
        this.currentTemplate = template;
        this.container = container;
        
        // Clear container
        container.innerHTML = '';
        
        // Remove SAFEY branding from title
        const titleMap = {
            calculator: 'Calculator',
            notes: 'Notes',
            weather: 'Weather',
            news: 'News Today',
            gallery: 'Photos',
            custom: 'Browser'
        };
        document.title = titleMap[template] || 'App';
        
        // Render appropriate template
        switch(template) {
            case 'calculator':
                this.renderCalculator(container);
                break;
            case 'notes':
                this.renderNotes(container);
                break;
            case 'weather':
                this.renderWeather(container);
                break;
            case 'news':
                this.renderNews(container);
                break;
            case 'gallery':
                this.renderGallery(container);
                break;
            case 'custom':
                await this.renderCustomUrl(container);
                break;
            default:
                this.renderCalculator(container);
        }
    }

    // Calculator template (working calculator with PIN unlock)
    renderCalculator(container) {
        container.className = 'max-w-md mx-auto p-4 h-screen bg-gray-900 text-white';
        container.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="text-right p-4 text-3xl font-mono mb-4 bg-gray-800 rounded">
                    <div id="calc-display" class="min-h-12 break-all">0</div>
                </div>
                <div class="grid grid-cols-4 gap-2 flex-1">
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="7">7</button>
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="8">8</button>
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="9">9</button>
                    <button class="calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="/">÷</button>
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="4">4</button>
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="5">5</button>
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="6">6</button>
                    <button class="calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="*">×</button>
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="1">1</button>
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="2">2</button>
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="3">3</button>
                    <button class="calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="-">−</button>
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="0">0</button>
                    <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value=".">.</button>
                    <button class="calc-btn bg-green-600 hover:bg-green-500 rounded text-xl font-bold py-4" data-value="=">=</button>
                    <button class="calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="+">+</button>
                    <button id="calc-clear" class="col-span-4 bg-red-600 hover:bg-red-500 rounded text-sm font-bold py-2 mt-2">C</button>
                </div>
            </div>
        `;
        
        this.attachCalculatorListeners();
    }

    // Notes template (editable text area)
    renderNotes(container) {
        container.className = 'max-w-2xl mx-auto p-4 h-screen bg-white';
        container.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="bg-yellow-50 border-b border-yellow-200 p-3 flex items-center justify-between">
                    <h1 class="text-xl font-semibold text-gray-800">My Notes</h1>
                    <button id="notes-menu" class="p-2 hover:bg-yellow-100 rounded">
                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
                <textarea 
                    id="notes-content" 
                    class="flex-1 p-4 text-gray-800 resize-none focus:outline-none font-sans"
                    placeholder="Start typing..."
                    style="font-family: system-ui, -apple-system, sans-serif;"
                >${this.getNotesContent()}</textarea>
            </div>
        `;
        
        this.attachNotesListeners();
    }

    // Weather template (static display)
    renderWeather(container) {
        container.className = 'max-w-md mx-auto p-4 h-screen bg-gradient-to-b from-blue-400 to-blue-600 text-white';
        container.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="text-center pt-8 pb-6">
                    <div class="text-6xl mb-4">☀️</div>
                    <div class="text-7xl font-light mb-2">72°</div>
                    <div class="text-2xl mb-1">Sunny</div>
                    <div class="text-lg opacity-80">San Francisco, CA</div>
                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div class="flex flex-col items-center">
                            <div class="text-2xl mb-1">🌙</div>
                            <div class="text-sm opacity-80">Tonight</div>
                            <div class="text-xl font-semibold">58°</div>
                        </div>
                        <div class="flex flex-col items-center">
                            <div class="text-2xl mb-1">☀️</div>
                            <div class="text-sm opacity-80">Tomorrow</div>
                            <div class="text-xl font-semibold">75°</div>
                        </div>
                        <div class="flex flex-col items-center">
                            <div class="text-2xl mb-1">⛅</div>
                            <div class="text-sm opacity-80">Wed</div>
                            <div class="text-xl font-semibold">70°</div>
                        </div>
                    </div>
                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-4 space-y-2">
                    <div class="flex justify-between">
                        <span>Humidity</span>
                        <span class="font-semibold">45%</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Wind</span>
                        <span class="font-semibold">12 mph NW</span>
                    </div>
                    <div class="flex justify-between">
                        <span>UV Index</span>
                        <span class="font-semibold">6 (High)</span>
                    </div>
                </div>
            </div>
        `;
        
        this.attachWeatherListeners();
    }

    // News template (scrollable cards)
    renderNews(container) {
        container.className = 'max-w-2xl mx-auto h-screen bg-gray-50';
        const newsItems = this.getNewsItems();
        
        container.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="bg-white border-b border-gray-200 p-4 sticky top-0">
                    <h1 class="text-2xl font-bold text-gray-900">News Today</h1>
                    <div class="text-sm text-gray-500 mt-1">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>
                <div class="flex-1 overflow-y-auto p-4 space-y-4">
                    ${newsItems.map(item => `
                        <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition">
                            <div class="text-xs text-blue-600 font-semibold uppercase mb-2">${item.category}</div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">${item.title}</h3>
                            <p class="text-sm text-gray-600 mb-3">${item.summary}</p>
                            <div class="text-xs text-gray-400">${item.source} • ${item.time}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.attachNewsListeners();
    }

    // Gallery template (grid of images)
    renderGallery(container) {
        container.className = 'max-w-4xl mx-auto h-screen bg-black';
        const images = this.getGalleryImages();
        
        container.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="bg-gray-900 text-white p-4 flex items-center justify-between">
                    <h1 class="text-xl font-semibold">Photos</h1>
                    <button id="gallery-menu" class="p-2 hover:bg-gray-800 rounded">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-2">
                    <div class="grid grid-cols-3 gap-1">
                        ${images.map(img => `
                            <div class="aspect-square bg-gray-800 rounded overflow-hidden">
                                <div class="w-full h-full flex items-center justify-center text-6xl">
                                    ${img}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.attachGalleryListeners();
    }

    // Custom URL template
    async renderCustomUrl(container) {
        const customUrl = stealthSettings.getSetting('customUrl');
        
        if (!customUrl) {
            container.className = 'max-w-md mx-auto p-8 h-screen bg-white flex items-center justify-center';
            container.innerHTML = `
                <div class="text-center text-gray-500">
                    <div class="text-6xl mb-4">🌐</div>
                    <p>No custom URL configured</p>
                </div>
            `;
            return;
        }
        
        // Try to load snapshot
        const snapshot = await stealthSettings.getUrlSnapshot(customUrl);
        
        if (snapshot) {
            container.className = 'w-full h-screen bg-white overflow-auto';
            container.innerHTML = `<img src="${snapshot}" alt="Snapshot" class="w-full h-auto">`;
        } else {
            // Show offline placeholder
            container.className = 'max-w-md mx-auto p-8 h-screen bg-white flex items-center justify-center';
            container.innerHTML = `
                <div class="text-center text-gray-500">
                    <div class="text-6xl mb-4">📡</div>
                    <p class="mb-2">Offline - Snapshot Unavailable</p>
                    <p class="text-sm">${customUrl}</p>
                </div>
            `;
        }
        
        this.attachCustomUrlListeners();
    }

    // Helper: Get notes content
    getNotesContent() {
        const saved = localStorage.getItem('safey_notes_content');
        if (saved) return saved;
        
        return `Shopping List:
- Milk
- Bread
- Eggs
- Coffee

Things to do:
- Call dentist
- Pick up dry cleaning
- Plan weekend trip

Notes:
- Remember to check email
- Meeting at 2 PM tomorrow`;
    }

    // Helper: Get news items
    getNewsItems() {
        return [
            {
                category: 'Technology',
                title: 'New Smartphone Features Announced',
                summary: 'Major tech company unveils latest innovations in mobile technology...',
                source: 'Tech News',
                time: '2 hours ago'
            },
            {
                category: 'Business',
                title: 'Stock Market Reaches New Heights',
                summary: 'Major indices show strong performance amid positive economic data...',
                source: 'Financial Times',
                time: '3 hours ago'
            },
            {
                category: 'Sports',
                title: 'Championship Game This Weekend',
                summary: 'Two top teams prepare for highly anticipated matchup...',
                source: 'Sports Daily',
                time: '5 hours ago'
            },
            {
                category: 'Health',
                title: 'Tips for Better Sleep Quality',
                summary: 'Experts share science-backed strategies for improving rest...',
                source: 'Health Today',
                time: '6 hours ago'
            },
            {
                category: 'Entertainment',
                title: 'New Movie Breaking Box Office Records',
                summary: 'Latest blockbuster surpasses expectations in opening weekend...',
                source: 'Entertainment Weekly',
                time: '8 hours ago'
            }
        ];
    }

    // Helper: Get gallery images (emojis as placeholders)
    getGalleryImages() {
        return ['🌄', '🏖️', '🌅', '🏔️', '🌃', '🌉', '🏞️', '🌆', '🌇', '🌠', '🌌', '🎆'];
    }

    // Event listeners for calculator
    attachCalculatorListeners() {
        const display = document.getElementById('calc-display');
        const buttons = document.querySelectorAll('.calc-btn');
        const clear = document.getElementById('calc-clear');
        
        let currentValue = '0';
        let operand = null;
        let operation = null;
        let newNumber = true;
        let pinAttempt = '';
        
        buttons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const value = e.target.dataset.value;
                
                // Track PIN attempt (digits only)
                if (/^\d$/.test(value)) {
                    pinAttempt += value;
                    if (pinAttempt.length > 4) {
                        pinAttempt = pinAttempt.slice(-4);
                    }
                }
                
                if (value === '=') {
                    // Check if PIN was entered
                    if (pinAttempt.length === 4) {
                        const isValid = await unlockHandler.attemptUnlock(pinAttempt);
                        if (!isValid) {
                            pinAttempt = '';
                        }
                        return;
                    }
                    
                    // Normal calculation
                    if (operation && operand !== null) {
                        const current = parseFloat(currentValue);
                        let result;
                        switch (operation) {
                            case '+': result = operand + current; break;
                            case '-': result = operand - current; break;
                            case '*': result = operand * current; break;
                            case '/': result = operand / current; break;
                        }
                        currentValue = result.toString();
                        operand = null;
                        operation = null;
                        newNumber = true;
                    }
                } else if (['+', '-', '*', '/'].includes(value)) {
                    operand = parseFloat(currentValue);
                    operation = value;
                    newNumber = true;
                } else {
                    if (newNumber) {
                        currentValue = value;
                        newNumber = false;
                    } else {
                        currentValue = currentValue === '0' ? value : currentValue + value;
                    }
                }
                
                display.textContent = currentValue;
            });
        });
        
        clear.addEventListener('click', () => {
            currentValue = '0';
            operand = null;
            operation = null;
            newNumber = true;
            pinAttempt = '';
            display.textContent = currentValue;
        });
    }

    // Event listeners for notes
    attachNotesListeners() {
        const content = document.getElementById('notes-content');
        const menu = document.getElementById('notes-menu');
        
        content.addEventListener('input', (e) => {
            localStorage.setItem('safey_notes_content', e.target.value);
        });
        
        menu.addEventListener('click', async () => {
            if (confirm('Return to app? (Enter PIN)')) {
                const pin = prompt('Enter PIN:');
                if (pin) {
                    await unlockHandler.attemptUnlock(pin);
                }
            }
        });
    }

    // Event listeners for weather
    attachWeatherListeners() {
        // Double-tap to unlock
        let tapCount = 0;
        let tapTimer = null;
        
        this.container.addEventListener('click', async () => {
            tapCount++;
            
            if (tapTimer) {
                clearTimeout(tapTimer);
            }
            
            if (tapCount === 2) {
                const pin = prompt('Enter PIN to unlock:');
                if (pin) {
                    await unlockHandler.attemptUnlock(pin);
                }
                tapCount = 0;
            } else {
                tapTimer = setTimeout(() => {
                    tapCount = 0;
                }, 500);
            }
        });
    }

    // Event listeners for news
    attachNewsListeners() {
        // Long press on header to unlock
        const header = this.container.querySelector('h1');
        let pressTimer = null;
        
        header.addEventListener('mousedown', () => {
            pressTimer = setTimeout(async () => {
                const pin = prompt('Enter PIN to unlock:');
                if (pin) {
                    await unlockHandler.attemptUnlock(pin);
                }
            }, 2000);
        });
        
        header.addEventListener('mouseup', () => {
            if (pressTimer) clearTimeout(pressTimer);
        });
        
        header.addEventListener('touchstart', () => {
            pressTimer = setTimeout(async () => {
                const pin = prompt('Enter PIN to unlock:');
                if (pin) {
                    await unlockHandler.attemptUnlock(pin);
                }
            }, 2000);
        });
        
        header.addEventListener('touchend', () => {
            if (pressTimer) clearTimeout(pressTimer);
        });
    }

    // Event listeners for gallery
    attachGalleryListeners() {
        const menu = document.getElementById('gallery-menu');
        
        menu.addEventListener('click', async () => {
            const pin = prompt('Enter PIN to unlock:');
            if (pin) {
                await unlockHandler.attemptUnlock(pin);
            }
        });
    }

    // Event listeners for custom URL
    attachCustomUrlListeners() {
        // Click to unlock
        this.container.addEventListener('click', async () => {
            const pin = prompt('Enter PIN to unlock:');
            if (pin) {
                await unlockHandler.attemptUnlock(pin);
            }
        });
    }
}

// Export singleton
const disguiseRenderer = new DisguiseRenderer();

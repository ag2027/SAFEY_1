// Weather Disguise Template
// Static weather display with tap-to-unlock

export class WeatherTemplate {
    constructor() {
        this.tapCount = 0;
        this.lastTapTime = 0;
        this.unlockCallback = null;
    }

    /**
     * Render weather UI
     */
    render() {
        const currentTime = new Date();
        const hour = currentTime.getHours();
        const isDay = hour >= 6 && hour < 18;
        
        return `
            <div class="max-w-md mx-auto h-screen bg-gradient-to-b ${isDay ? 'from-blue-400 to-blue-200' : 'from-slate-800 to-slate-600'}">
                <div class="h-full flex flex-col p-6">
                    <!-- Header -->
                    <div class="flex items-center justify-between text-white mb-8 mt-4">
                        <button class="weather-menu-btn p-2 hover:bg-white hover:bg-opacity-20 rounded transition">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <button class="weather-settings-btn p-2 hover:bg-white hover:bg-opacity-20 rounded transition">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>

                    <!-- City Name -->
                    <div class="text-white text-center mb-8">
                        <h1 class="text-3xl font-light mb-1">San Francisco</h1>
                        <p class="text-sm opacity-80">${currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <!-- Main Weather Display -->
                    <div id="weather-main" class="flex-1 flex flex-col items-center justify-center text-white">
                        <div class="text-8xl mb-6">${isDay ? '☀️' : '🌙'}</div>
                        <div class="text-7xl font-light mb-4">72°</div>
                        <div class="text-2xl font-light mb-6">Partly Cloudy</div>
                        <div class="flex gap-6 text-sm">
                            <div class="text-center">
                                <div class="opacity-80">High</div>
                                <div class="text-xl font-medium">78°</div>
                            </div>
                            <div class="text-center">
                                <div class="opacity-80">Low</div>
                                <div class="text-xl font-medium">65°</div>
                            </div>
                        </div>
                    </div>

                    <!-- Hourly Forecast -->
                    <div class="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-4 mb-4">
                        <div class="flex justify-between items-center overflow-x-auto gap-4 pb-2">
                            ${this._generateHourlyForecast()}
                        </div>
                    </div>

                    <!-- Weekly Forecast -->
                    <div class="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-4">
                        <div class="space-y-3">
                            ${this._generateWeeklyForecast()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate hourly forecast
     */
    _generateHourlyForecast() {
        const hours = [];
        const now = new Date();
        const temps = [72, 73, 74, 75, 74, 73, 71, 70];
        const icons = ['☀️', '⛅', '☁️', '🌤️', '⛅', '☁️', '🌙', '🌙'];

        for (let i = 0; i < 8; i++) {
            const time = new Date(now.getTime() + i * 3600000);
            const hour = time.getHours();
            const displayHour = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
            
            hours.push(`
                <div class="flex flex-col items-center text-white flex-shrink-0">
                    <div class="text-xs opacity-80 mb-1">${i === 0 ? 'Now' : displayHour}</div>
                    <div class="text-2xl mb-1">${icons[i]}</div>
                    <div class="text-sm font-medium">${temps[i]}°</div>
                </div>
            `);
        }

        return hours.join('');
    }

    /**
     * Generate weekly forecast
     */
    _generateWeeklyForecast() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const icons = ['⛅', '☀️', '🌤️', '🌧️', '⛈️', '☁️', '☀️'];
        const highs = [78, 80, 75, 68, 70, 72, 76];
        const lows = [65, 67, 63, 58, 60, 62, 64];

        return days.map((day, i) => `
            <div class="flex items-center justify-between text-white">
                <div class="w-12 text-sm">${day}</div>
                <div class="flex-1 flex items-center gap-3">
                    <div class="text-2xl">${icons[i]}</div>
                    <div class="flex-1"></div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-sm opacity-80">${lows[i]}°</div>
                    <div class="w-24 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                        <div class="h-full bg-white bg-opacity-80 rounded-full" style="width: ${60 + i * 5}%"></div>
                    </div>
                    <div class="text-sm font-medium">${highs[i]}°</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Initialize event handlers
     */
    initHandlers(pin) {
        const mainWeather = document.getElementById('weather-main');
        if (!mainWeather) return;

        // Tap unlock: tap the temperature 5 times quickly
        mainWeather.addEventListener('click', (e) => {
            const now = Date.now();
            
            // Reset if more than 2 seconds since last tap
            if (now - this.lastTapTime > 2000) {
                this.tapCount = 0;
            }
            
            this.tapCount++;
            this.lastTapTime = now;

            // After 5 taps, unlock
            if (this.tapCount >= 5) {
                if (this.unlockCallback) {
                    this.unlockCallback();
                }
                this.tapCount = 0;
            }
        });
    }

    /**
     * Set unlock callback
     */
    setUnlockCallback(callback) {
        this.unlockCallback = callback;
    }

    /**
     * Reset state
     */
    reset() {
        this.tapCount = 0;
        this.lastTapTime = 0;
    }

    /**
     * Get title for document.title
     */
    getTitle() {
        return 'Weather';
    }
}

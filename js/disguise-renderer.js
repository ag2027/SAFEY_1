// Disguise template renderer
// Renders different disguise UIs (Calculator, Notes, Weather, News, Custom URL)

class DisguiseRenderer {
    constructor() {
        this.currentTemplate = null;
        this.container = null;
        this.fakeWeatherLocation = 'Seattle, WA';
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
            custom: 'Browser'
        };
        document.title = titleMap[template] || 'App';
        
        // Render appropriate template
        switch(template) {
            case 'calculator':
                this.renderCalculator(container);
                break;
            case 'notes':
                await this.renderNotes(container);
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
    async renderNotes(container) {
        container.className = 'max-w-2xl mx-auto h-screen px-4 py-4';

        const currentNote = await decoyNotesManager.getCurrentNote() || 'Shopping List:\n- Milk\n- Bread\n- Eggs\n- Chicken\n- Apples\n- Coffee\n- Laundry Detergent\n- Toothpaste';
        const lastSaved = await decoyNotesManager.getLastSavedTimestamp();

        container.innerHTML = `
            <div id="decoy-notes-root" class="h-full flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                <div id="decoy-notes-header" class="px-4 py-3 bg-yellow-50 border-b border-yellow-200 flex items-center justify-between">
                    <div>
                        <h1 class="text-xl font-semibold text-gray-800">My Notes</h1>
                        <div id="decoy-notes-last-saved" class="text-xs text-gray-500 mt-1">Not saved yet</div>
                    </div>
                    <button id="notes-menu" class="p-2 rounded-lg hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-trust-blue" aria-haspopup="true" aria-label="Open notes menu">
                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
                <div class="flex-1 flex">
                    <textarea 
                        id="notes-content"
                        class="flex-1 p-5 text-gray-800 resize-none focus:outline-none font-sans"
                        placeholder="Start typing..."
                        spellcheck="true"
                        autocomplete="off"
                    ></textarea>
                </div>
                <div id="decoy-notes-status" class="px-4 py-2 bg-yellow-50 border-t border-yellow-200 flex items-center justify-between text-sm text-gray-600">
                    <span id="decoy-notes-status-text">Autosave ready</span>
                    <span id="notes-word-count">Word count: 0</span>
                </div>
            </div>
        `;

        const root = container.querySelector('#decoy-notes-root');
        const header = container.querySelector('#decoy-notes-header');
        const textarea = container.querySelector('#notes-content');
        const statusBar = container.querySelector('#decoy-notes-status');
        const statusText = container.querySelector('#decoy-notes-status-text');
        const wordCountEl = container.querySelector('#notes-word-count');
        const lastSavedEl = container.querySelector('#decoy-notes-last-saved');

        if (textarea) {
            textarea.value = currentNote || '';
        }

        const appliedSettings = await decoyNotesManager.applySettingsToEditor({
            container: root,
            header,
            textarea,
            statusBar,
            wordCountEl
        });

        decoyNotesManager.updateWordCountDisplay(textarea ? textarea.value : '', wordCountEl, appliedSettings);
        decoyNotesManager.updateLastSavedDisplay(lastSaved, lastSavedEl);

        if (statusText) {
            statusText.textContent = lastSaved ? 'All changes synced' : 'Autosave ready';
        }

        this.attachNotesListeners({
            root,
            header,
            textarea,
            statusBar,
            statusText,
            wordCountEl,
            lastSavedEl
        });
    }

    // Weather template (dynamic offline display)
    renderWeather(container) {
        const weather = this.generateWeatherData();
        container.className = 'max-w-md mx-auto h-screen text-white flex flex-col';
        container.style.background = weather.background;
        container.innerHTML = `
            <div class="flex flex-col h-full">
                <div class="flex items-center justify-between text-[0.65rem] uppercase tracking-widest opacity-80 pt-4 px-5">
                    <span>${weather.statusBar.time}</span>
                    <span class="flex items-center gap-2">
                        <span>5G</span>
                        <span class="inline-block w-5 h-1.5 bg-white bg-opacity-80 rounded-full"></span>
                        <span class="inline-block w-3 h-3 border border-white rounded-sm"></span>
                    </span>
                    <span>${weather.statusBar.battery}%</span>
                </div>
                <div class="px-5 mt-4">
                    <div class="text-sm opacity-80">${weather.location}</div>
                    <div class="text-3xl font-semibold mt-1">${weather.timestamp}</div>
                </div>
                <div class="flex-1 overflow-y-auto mt-6 px-5 pb-6">
                    <div class="bg-white bg-opacity-10 rounded-2xl p-5 shadow-sm">
                        <div class="flex items-center justify-between gap-6">
                            <div>
                                <div class="flex items-baseline gap-2">
                                    <span class="text-6xl font-light">${weather.current.temp}°</span>
                                    <span class="text-3xl">${weather.current.icon}</span>
                                </div>
                                <div class="text-lg font-semibold mt-2">${weather.current.condition}</div>
                                <div class="text-sm opacity-80 mt-1">Feels like ${weather.current.feelsLike}° · High ${weather.current.high}° · Low ${weather.current.low}°</div>
                            </div>
                            <div class="text-right text-xs uppercase tracking-widest opacity-80 space-y-1">
                                <div>${weather.sunrise}</div>
                                <div>${weather.sunset}</div>
                            </div>
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div class="flex justify-between bg-white bg-opacity-10 rounded-xl px-4 py-3">
                                <span>Humidity</span>
                                <span class="font-semibold">${weather.details.humidity}%</span>
                            </div>
                            <div class="flex justify-between bg-white bg-opacity-10 rounded-xl px-4 py-3">
                                <span>Wind</span>
                                <span class="font-semibold">${weather.details.wind}</span>
                            </div>
                            <div class="flex justify-between bg-white bg-opacity-10 rounded-xl px-4 py-3">
                                <span>UV Index</span>
                                <span class="font-semibold">${weather.details.uv}</span>
                            </div>
                            <div class="flex justify-between bg-white bg-opacity-10 rounded-xl px-4 py-3">
                                <span>Air Quality</span>
                                <span class="font-semibold">${weather.details.airQuality}</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6">
                        <div class="text-xs uppercase tracking-widest opacity-70 mb-3">Hourly Forecast</div>
                        <div class="flex gap-4 overflow-x-auto pb-2">
                            ${weather.hourly.map(hour => `
                                <div class="flex-shrink-0 bg-white bg-opacity-10 rounded-xl px-3 py-3 text-center min-w-[64px]">
                                    <div class="text-xs opacity-75">${hour.label}</div>
                                    <div class="text-xl mt-1">${hour.icon}</div>
                                    <div class="text-sm font-semibold mt-1">${hour.temp}°</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="mt-6">
                        <div class="text-xs uppercase tracking-widest opacity-70 mb-3">7-Day Outlook</div>
                        <div class="space-y-3">
                            ${weather.daily.map(day => `
                                <div class="flex items-center justify-between bg-white bg-opacity-10 rounded-xl px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <span class="text-sm font-semibold">${day.day}</span>
                                        <span class="text-lg">${day.icon}</span>
                                        <span class="text-xs opacity-75">${day.summary}</span>
                                    </div>
                                    <div class="text-sm font-semibold text-right">
                                        <span>${day.high}°</span>
                                        <span class="opacity-70 ml-2">${day.low}°</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="mt-6">
                        <div class="text-xs uppercase tracking-widest opacity-70 mb-3">More Details</div>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="bg-white bg-opacity-10 rounded-xl px-4 py-3">
                                <div class="opacity-75 text-xs uppercase tracking-wide">Pressure</div>
                                <div class="font-semibold mt-1">${weather.details.pressure} inHg</div>
                            </div>
                            <div class="bg-white bg-opacity-10 rounded-xl px-4 py-3">
                                <div class="opacity-75 text-xs uppercase tracking-wide">Visibility</div>
                                <div class="font-semibold mt-1">${weather.details.visibility} mi</div>
                            </div>
                            <div class="bg-white bg-opacity-10 rounded-xl px-4 py-3">
                                <div class="opacity-75 text-xs uppercase tracking-wide">Dew Point</div>
                                <div class="font-semibold mt-1">${weather.details.dewPoint}°</div>
                            </div>
                            <div class="bg-white bg-opacity-10 rounded-xl px-4 py-3">
                                <div class="opacity-75 text-xs uppercase tracking-wide">Chance of Rain</div>
                                <div class="font-semibold mt-1">${weather.details.precipitation}%</div>
                            </div>
                        </div>
                    </div>

                    ${weather.alert ? `
                        <div class="mt-6 bg-yellow-400 bg-opacity-20 border border-yellow-300 border-opacity-50 rounded-2xl px-4 py-3 text-sm text-yellow-100">
                            <div class="font-semibold uppercase tracking-widest text-xs">${weather.alert.title}</div>
                            <p class="mt-1 leading-snug">${weather.alert.description}</p>
                        </div>
                    ` : ''}

                    <div class="mt-6 text-xs uppercase tracking-widest opacity-70 text-center">
                        Updated ${weather.lastUpdated}
                    </div>
                </div>
            </div>
        `;

        this.attachWeatherListeners();
    }

    generateWeatherData() {
        const now = new Date();
        const seedBase = parseInt(`${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`, 10);
        const scenario = this.getWeatherScenario(now.getHours(), seedBase);
        const isNight = now.getHours() >= 20 || now.getHours() < 6;

        const tempVariance = Math.round(this.getSeededRandom(seedBase + now.getHours()) * 6) - 3;
        const currentTemp = scenario.baseTemp + tempVariance;

        let highTemp = Math.round(currentTemp + 5 + this.getSeededRandom(seedBase + 7) * 3);
        let lowTemp = Math.round(currentTemp - (6 + this.getSeededRandom(seedBase + 8) * 3));
        if (highTemp - lowTemp < 4) {
            highTemp = lowTemp + 4;
        }

        const feelsLike = Math.round(currentTemp + (this.getSeededRandom(seedBase + 9) * 4 - 2));

        const hourly = this.buildHourlyForecast(now, currentTemp, scenario, seedBase);
        const daily = this.buildDailyForecast(now, scenario, seedBase, highTemp, lowTemp);
        const details = this.buildWeatherDetails(scenario, seedBase, currentTemp, now.getHours());
        const sunrise = this.buildSunEvent('Sunrise', now, seedBase + 50, 6, 8);
        const sunset = this.buildSunEvent('Sunset', now, seedBase + 60, 17, 19);
        const alert = this.selectWeatherAlert(scenario, seedBase);

        return {
            location: this.fakeWeatherLocation,
            timestamp: this.formatTimestamp(now),
            statusBar: {
                time: this.formatStatusClock(now),
                battery: Math.min(100, Math.round(55 + this.getSeededRandom(seedBase + 70) * 40))
            },
            current: {
                temp: currentTemp,
                high: highTemp,
                low: lowTemp,
                condition: scenario.condition,
                icon: isNight ? (scenario.nightIcon || scenario.icon) : scenario.icon,
                feelsLike
            },
            hourly,
            daily,
            details,
            sunrise,
            sunset,
            alert,
            lastUpdated: 'just now',
            background: isNight && scenario.nightGradient ? scenario.nightGradient : scenario.gradient
        };
    }

    getWeatherScenario(hour, seed) {
        const period = hour >= 5 && hour < 11 ? 'morning' : hour >= 11 && hour < 17 ? 'day' : hour >= 17 && hour < 21 ? 'evening' : 'night';
        const scenarioSets = {
            morning: [
                { key: 'sunny', condition: 'Morning Sun', icon: '🌅', nightIcon: '🌙', baseTemp: 64, gradient: 'linear-gradient(180deg,#f6d365 0%,#fda085 100%)', nightGradient: 'linear-gradient(180deg,#2c3e50 0%,#4ca1af 100%)', summary: 'Bright start with mild temps' },
                { key: 'cloudy', condition: 'Low Clouds', icon: '🌥️', nightIcon: '☁️', baseTemp: 60, gradient: 'linear-gradient(180deg,#bdc3c7 0%,#2c3e50 100%)', nightGradient: 'linear-gradient(180deg,#232526 0%,#414345 100%)', summary: 'Clouds thinning through the morning' }
            ],
            day: [
                { key: 'sunny', condition: 'Mostly Sunny', icon: '🌤️', nightIcon: '🌙', baseTemp: 72, gradient: 'linear-gradient(180deg,#4facfe 0%,#00f2fe 100%)', nightGradient: 'linear-gradient(180deg,#141e30 0%,#243b55 100%)', summary: 'Bright and comfortable' },
                { key: 'cloudy', condition: 'Partly Cloudy', icon: '⛅', nightIcon: '☁️', baseTemp: 68, gradient: 'linear-gradient(180deg,#757f9a 0%,#d7dde8 100%)', nightGradient: 'linear-gradient(180deg,#373b44 0%,#4286f4 100%)', summary: 'Mix of sun and clouds' },
                { key: 'showers', condition: 'Passing Showers', icon: '🌦️', nightIcon: '🌧️', baseTemp: 65, gradient: 'linear-gradient(180deg,#3a6073 0%,#16222a 100%)', nightGradient: 'linear-gradient(180deg,#1f1c2c 0%,#928dab 100%)', summary: 'Light showers on and off' },
                { key: 'windy', condition: 'Breezy', icon: '🌬️', nightIcon: '🌙', baseTemp: 66, gradient: 'linear-gradient(180deg,#56ccf2 0%,#2f80ed 100%)', nightGradient: 'linear-gradient(180deg,#373b44 0%,#4286f4 100%)', summary: 'Gusty winds with cooler air' }
            ],
            evening: [
                { key: 'clear', condition: 'Clear Evening', icon: '🌆', nightIcon: '🌙', baseTemp: 67, gradient: 'linear-gradient(180deg,#0f2027 0%,#203a43 50%,#2c5364 100%)', nightGradient: 'linear-gradient(180deg,#000428 0%,#004e92 100%)', summary: 'Calm evening with thinning clouds' },
                { key: 'fog', condition: 'Low Clouds', icon: '🌫️', nightIcon: '🌫️', baseTemp: 62, gradient: 'linear-gradient(180deg,#757f9a 0%,#d7dde8 100%)', nightGradient: 'linear-gradient(180deg,#232526 0%,#414345 100%)', summary: 'Marine layer drifting inland' },
                { key: 'showers', condition: 'Light Rain', icon: '🌧️', nightIcon: '🌧️', baseTemp: 63, gradient: 'linear-gradient(180deg,#3a6073 0%,#16222a 100%)', nightGradient: 'linear-gradient(180deg,#1f1c2c 0%,#928dab 100%)', summary: 'Showers tapering late' }
            ],
            night: [
                { key: 'clear', condition: 'Mostly Clear', icon: '🌙', nightIcon: '🌙', baseTemp: 58, gradient: 'linear-gradient(180deg,#141e30 0%,#243b55 100%)', nightGradient: 'linear-gradient(180deg,#000428 0%,#004e92 100%)', summary: 'Calm and cool overnight' },
                { key: 'cloudy', condition: 'Cloudy Night', icon: '☁️', nightIcon: '☁️', baseTemp: 60, gradient: 'linear-gradient(180deg,#232526 0%,#414345 100%)', nightGradient: 'linear-gradient(180deg,#232526 0%,#414345 100%)', summary: 'Overcast with mild temps' },
                { key: 'showers', condition: 'Overnight Showers', icon: '🌧️', nightIcon: '🌧️', baseTemp: 59, gradient: 'linear-gradient(180deg,#1f1c2c 0%,#928dab 100%)', nightGradient: 'linear-gradient(180deg,#1f1c2c 0%,#928dab 100%)', summary: 'Light rain with breezy winds' }
            ]
        };
        const pool = scenarioSets[period] || scenarioSets.day;
        const index = Math.floor(this.getSeededRandom(seed + hour) * pool.length) % pool.length;
        return pool[index];
    }

    getSeededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    buildHourlyForecast(now, currentTemp, scenario, seedBase) {
        return Array.from({ length: 8 }, (_, idx) => {
            const hourDate = new Date(now.getTime() + idx * 60 * 60 * 1000);
            const variance = Math.round(this.getSeededRandom(seedBase + idx * 11) * 6) - 3;
            const temp = Math.round(currentTemp + variance);
            const label = idx === 0 ? 'Now' : this.formatHourLabel(hourDate);
            return {
                label,
                temp,
                icon: this.getHourlyIcon(scenario, hourDate.getHours())
            };
        });
    }

    getHourlyIcon(scenario, hour) {
        const isNight = hour >= 20 || hour < 6;
        switch (scenario.key) {
            case 'showers':
                return isNight ? '🌧️' : '🌦️';
            case 'fog':
                return '🌫️';
            case 'windy':
                return isNight ? '🌙' : '🌬️';
            case 'cloudy':
                return isNight ? '☁️' : '⛅';
            case 'clear':
                return isNight ? '🌙' : '🌤️';
            default:
                return isNight ? (scenario.nightIcon || '🌙') : scenario.icon;
        }
    }

    buildDailyForecast(now, scenario, seedBase, highTemp, lowTemp) {
        return Array.from({ length: 7 }, (_, idx) => {
            const dayDate = new Date(now.getTime() + idx * 24 * 60 * 60 * 1000);
            const daySeed = seedBase + idx * 17;
            const dayScenario = idx === 0 ? scenario : this.getWeatherScenario(12, daySeed);
            let dayHigh = idx === 0 ? highTemp : Math.round(highTemp + this.getSeededRandom(daySeed) * 6 - 3);
            let dayLow = idx === 0 ? lowTemp : Math.round(lowTemp + this.getSeededRandom(daySeed + 1) * 4 - 2);
            if (dayHigh - dayLow < 4) {
                dayHigh = dayLow + 4;
            }
            return {
                day: idx === 0 ? 'Today' : this.formatDayLabel(dayDate),
                high: dayHigh,
                low: dayLow,
                icon: this.getDailyIcon(dayScenario),
                summary: this.getDailySummary(dayScenario)
            };
        });
    }

    getDailyIcon(scenario) {
        switch (scenario.key) {
            case 'showers':
                return '🌧️';
            case 'fog':
                return '🌫️';
            case 'windy':
                return '🌬️';
            case 'cloudy':
                return '⛅';
            case 'clear':
                return '☀️';
            default:
                return '🌤️';
        }
    }

    getDailySummary(scenario) {
        return scenario.summary || 'Daytime conditions expected';
    }

    buildWeatherDetails(scenario, seedBase, temp, hour) {
        const humidityBase = scenario.key === 'showers' ? 70 : scenario.key === 'fog' ? 85 : scenario.key === 'cloudy' ? 60 : 45;
        const humidity = Math.min(96, Math.max(35, Math.round(humidityBase + this.getSeededRandom(seedBase + 20) * 12 - 6)));
        const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const windDirection = windDirections[Math.floor(this.getSeededRandom(seedBase + 21) * windDirections.length) % windDirections.length];
        const windSpeedBase = scenario.key === 'windy' ? 14 : scenario.key === 'showers' ? 11 : 7;
        const windSpeed = Math.round(windSpeedBase + this.getSeededRandom(seedBase + 22) * 6);
        const isNight = hour >= 20 || hour < 6;
        const uv = isNight ? '0' : Math.max(1, Math.round(this.getSeededRandom(seedBase + 23) * 8));
        const aqi = Math.round(30 + this.getSeededRandom(seedBase + 24) * 70);
        const airQuality = aqi <= 50 ? `Good (AQI ${aqi})` : aqi <= 100 ? `Moderate (AQI ${aqi})` : `Sensitive (AQI ${aqi})`;
        const pressure = (29.7 + this.getSeededRandom(seedBase + 25) * 0.6).toFixed(2);
        const visibility = scenario.key === 'fog' ? (3 + this.getSeededRandom(seedBase + 26) * 2).toFixed(1) : (8 + this.getSeededRandom(seedBase + 26) * 2).toFixed(1);
        const dewPoint = Math.round(temp - (8 + this.getSeededRandom(seedBase + 27) * 4));
        const precipitation = Math.min(100, Math.round((scenario.key === 'showers' ? 60 : scenario.key === 'fog' ? 45 : 15) + this.getSeededRandom(seedBase + 28) * 35));

        return {
            humidity,
            wind: `${windDirection} ${windSpeed} mph`,
            uv,
            airQuality,
            pressure,
            visibility,
            dewPoint,
            precipitation
        };
    }

    buildSunEvent(label, now, seed, startHour, endHour) {
        const hourWindow = endHour - startHour;
        const hourOffset = Math.floor(this.getSeededRandom(seed) * (hourWindow + 1));
        const minute = Math.floor(this.getSeededRandom(seed + 1) * 60);
        const eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour + hourOffset, minute);
        return `${label}: ${this.formatClockTime(eventDate)}`;
    }

    selectWeatherAlert(scenario, seed) {
        const library = {
            showers: [
                { title: 'Light Rain Advisory', description: 'Scattered showers expected through the evening. Roads may be slick in spots.' },
                { title: 'Umbrella Check', description: 'Keep a light jacket handy. Passing showers continue into tonight.' }
            ],
            fog: [
                { title: 'Low Visibility', description: 'Patchy fog develops after midnight. Allow extra time for the morning commute.' }
            ],
            windy: [
                { title: 'Breezy Conditions', description: 'Gusts may reach 25 mph this afternoon. Secure lightweight outdoor items.' }
            ],
            default: [
                { title: 'Planner Tip', description: 'Comfortable weather ahead. Great window for errands and outdoor plans.' }
            ]
        };

        let chance = 0.15;
        if (scenario.key === 'showers') {
            chance = 0.45;
        } else if (scenario.key === 'fog') {
            chance = 0.35;
        } else if (scenario.key === 'windy') {
            chance = 0.3;
        }

        if (this.getSeededRandom(seed + 90) > chance) {
            return null;
        }

        const pool = library[scenario.key] || library.default;
        const index = Math.floor(this.getSeededRandom(seed + 91) * pool.length) % pool.length;
        return pool[index];
    }

    formatTimestamp(date) {
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const dayNum = date.getDate();
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `${day}, ${month} ${dayNum} - ${time}`;
    }

    formatStatusClock(date) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    formatClockTime(date) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    formatHourLabel(date) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric' });
    }

    formatDayLabel(date) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
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
        let consecutiveEqualPresses = 0; // Track consecutive '=' presses after correct PIN
        let correctPinEntered = false; // Flag for correct PIN entry
        
        // Get configured PIN length
        const pinLength = stealthSettings.getSetting('pinLength') || 6;
        
        buttons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const value = e.target.dataset.value;
                
                // Track PIN attempt (digits only)
                if (/^\d$/.test(value)) {
                    pinAttempt += value;
                    if (pinAttempt.length > pinLength) {
                        pinAttempt = pinAttempt.slice(-pinLength);
                    }
                    // Reset equal presses counter on digit input
                    consecutiveEqualPresses = 0;
                    correctPinEntered = false;
                }
                
                if (value === '=') {
                    // Check if we already verified correct PIN and are counting '=' presses
                    if (correctPinEntered) {
                        consecutiveEqualPresses++;
                        //console.log('[SAFEY] Consecutive = presses:', consecutiveEqualPresses);
                        // Unlock after 3 consecutive '=' presses
                        if (consecutiveEqualPresses >= 3) {
                            if (typeof unlockHandler !== 'undefined') {
                                // Actually unlock and exit stealth mode
                                await unlockHandler.attemptUnlock(pinAttempt);
                            }
                            return;
                        }
                        // Continue with normal calculation for first 2 '=' presses
                    } else if (pinAttempt.length === pinLength) {
                        // First '=' press with complete PIN - start counting
                        correctPinEntered = true;
                        consecutiveEqualPresses = 1;
                        // Continue with normal calculation - don't unlock yet
                    }
                    
                    // Normal calculation regardless of PIN state
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
                    // Reset equal presses counter on operation input
                    consecutiveEqualPresses = 0;
                    correctPinEntered = false;
                    
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
            consecutiveEqualPresses = 0;
            correctPinEntered = false;
            display.textContent = currentValue;
        });
    }

    // Event listeners for notes
    attachNotesListeners({ textarea, statusText, lastSavedEl, wordCountEl, statusBar, root, header }) {
        if (!textarea) {
            return;
        }

        const menu = this.container.querySelector('#notes-menu');
        const MENU_PRESS_WINDOW = 2000;
        let menuPressCount = 0;
        let menuPressTimer = null;

        const handleAutoSaveStatus = async (state, savedAt) => {
            if (!statusText) {
                return;
            }

            if (state === 'pending') {
                statusText.textContent = 'Saving...';
                statusBar && statusBar.classList.add('animate-pulse');
                return;
            }

            statusBar && statusBar.classList.remove('animate-pulse');

            if (state === 'saved') {
                statusText.textContent = 'All changes synced';
                decoyNotesManager.updateLastSavedDisplay(savedAt, lastSavedEl);
            } else if (state === 'error') {
                statusText.textContent = 'Auto-save failed';
            }
        };

        textarea.addEventListener('input', () => {
            decoyNotesManager.updateWordCountDisplay(textarea.value, wordCountEl);
            decoyNotesManager.scheduleAutoSave(textarea.value, handleAutoSaveStatus);
        });

        textarea.addEventListener('blur', async () => {
            try {
                const savedAt = await decoyNotesManager.saveCurrentNote(textarea.value);
                statusText && (statusText.textContent = 'All changes synced');
                decoyNotesManager.updateLastSavedDisplay(savedAt, lastSavedEl);
            } catch (error) {
                console.error('[SAFEY] Failed to persist decoy note on blur:', error);
                statusText && (statusText.textContent = 'Could not save changes');
            }
        });

        textarea.addEventListener('keydown', async (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                const saved = await decoyNotesManager.saveNote(textarea.value);
                if (saved && statusText) {
                    statusText.textContent = 'Saved to library';
                }
                const savedAt = await decoyNotesManager.getLastSavedTimestamp();
                decoyNotesManager.updateLastSavedDisplay(savedAt, lastSavedEl);
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
                event.preventDefault();
                if (menu) {
                    this.showNotesDecoyMenu({
                        anchorElement: menu,
                        textarea,
                        statusTextEl: statusText,
                        lastSavedEl,
                        wordCountEl,
                        statusBar,
                        root,
                        header,
                        focusAction: 'search'
                    });
                }
            }
        });

        if (menu) {
            menu.addEventListener('click', (event) => {
                event.stopPropagation();

                menuPressCount += 1;
                if (menuPressTimer) {
                    clearTimeout(menuPressTimer);
                }

                if (menuPressCount === 3) {
                    menuPressCount = 0;
                    this.showReturnToAppModal();
                    return;
                }

                this.showNotesDecoyMenu({
                    anchorElement: menu,
                    textarea,
                    statusTextEl: statusText,
                    lastSavedEl,
                    wordCountEl,
                    statusBar,
                    root,
                    header
                });

                menuPressTimer = setTimeout(() => {
                    menuPressCount = 0;
                }, MENU_PRESS_WINDOW);
            });
        }
    }

    // Event listeners for weather
    attachWeatherListeners() {
        // Double-tap to unlock using shared exit modal
        let tapCount = 0;
        let tapTimer = null;

        this.container.addEventListener('click', () => {
            tapCount++;

            if (tapTimer) {
                clearTimeout(tapTimer);
            }

            if (tapCount === 2) {
                tapCount = 0;
                this.showReturnToAppModal();
            } else {
                tapTimer = setTimeout(() => {
                    tapCount = 0;
                }, 500);
            }
        });
    }

    showReturnToAppModal() {
        if (document.getElementById('disguise-exit-modal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'disguise-exit-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'disguise-exit-title');

        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                <div class="mb-4">
                    <h3 id="disguise-exit-title" class="text-lg font-bold text-gray-900">Enter PIN</h3>
                    <p class="text-sm text-gray-600">Enter your stealth PIN to exit the disguise.</p>
                </div>
                <div class="space-y-3">
                    <input id="disguise-exit-pin" type="password" inputmode="numeric" pattern="\\d*" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-trust-blue" placeholder="Enter PIN" aria-describedby="disguise-exit-error" autocomplete="one-time-code">
                    <p id="disguise-exit-error" class="text-sm text-red-600 hidden">Incorrect PIN. Try again.</p>
                </div>
                <div class="flex gap-3 mt-5">
                    <button id="disguise-exit-cancel" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition">Stay Hidden</button>
                    <button id="disguise-exit-confirm" class="flex-1 bg-trust-blue hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition">Unlock</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const pinInput = modal.querySelector('#disguise-exit-pin');
        const errorText = modal.querySelector('#disguise-exit-error');
        let isSubmitting = false;

        const closeModal = () => {
            document.removeEventListener('keydown', handleKeydown);
            modal.remove();
        };

        const showError = (message) => {
            errorText.textContent = message;
            errorText.classList.remove('hidden');
            pinInput.focus();
            pinInput.select?.();
        };

        const attemptUnlock = async () => {
            if (isSubmitting) {
                return;
            }

            const pin = pinInput.value.trim();
            const pinLength = stealthSettings.getSetting('pinLength') || 6;

            if (!pin || pin.length !== pinLength) {
                showError(`PIN must be ${pinLength} digits.`);
                return;
            }

            isSubmitting = true;
            const success = await unlockHandler.attemptUnlock(pin);
            isSubmitting = false;

            if (success) {
                closeModal();
            } else {
                showError('Incorrect PIN. Try again.');
                pinInput.value = '';
            }
        };

        const handleKeydown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeModal();
            } else if (event.key === 'Enter') {
                event.preventDefault();
                attemptUnlock();
            }
        };

        modal.querySelector('#disguise-exit-cancel').addEventListener('click', () => closeModal());
        modal.querySelector('#disguise-exit-confirm').addEventListener('click', attemptUnlock);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
        pinInput.addEventListener('input', () => {
            errorText.classList.add('hidden');
        });

        document.addEventListener('keydown', handleKeydown);
        pinInput.focus();
    }

    // Show decoy menu for notes disguise
    showNotesDecoyMenu({ anchorElement, textarea, statusTextEl, lastSavedEl, wordCountEl, statusBar, root, header, focusAction }) {
        if (focusAction === 'search') {
            decoyNotesManager.showSearchModal({
                currentContent: textarea ? textarea.value : '',
                onSelectNote: async (note) => {
                    if (!textarea) {
                        return;
                    }
                    textarea.value = note.content;
                    decoyNotesManager.updateWordCountDisplay(note.content, wordCountEl);
                    const savedAt = await decoyNotesManager.saveCurrentNote(note.content);
                    statusTextEl && (statusTextEl.textContent = 'Loaded saved note');
                    decoyNotesManager.updateLastSavedDisplay(savedAt, lastSavedEl);
                }
            });
            return;
        }

        const existingMenu = document.getElementById('notes-decoy-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        if (!anchorElement) {
            return;
        }

        const menu = document.createElement('div');
        menu.id = 'notes-decoy-menu';
        menu.className = 'fixed inset-0 z-50';
        menu.innerHTML = `
            <div class="absolute inset-0 bg-black bg-opacity-30" data-dismiss="backdrop"></div>
            <div class="absolute bg-white rounded-lg shadow-xl w-60 border border-gray-200" id="notes-menu-popup">
                <div class="py-2">
                    <button class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition" data-action="save">
                        <span class="text-sm text-gray-400">[Save]</span>
                        <span>Save to library</span>
                    </button>
                    <button class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition" data-action="search">
                        <span class="text-sm text-gray-400">[Find]</span>
                        <span>Search saved notes</span>
                    </button>
                    <button class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition" data-action="share">
                        <span class="text-sm text-gray-400">[Share]</span>
                        <span>Share this note</span>
                    </button>
                    <button class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition" data-action="settings">
                        <span class="text-sm text-gray-400">[Prefs]</span>
                        <span>Display settings</span>
                    </button>
                    <div class="border-t border-gray-200 my-1"></div>
                    <button class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition" data-action="new">
                        <span class="text-sm text-gray-400">[New]</span>
                        <span>Start a new note</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(menu);

        const popup = menu.querySelector('#notes-menu-popup');
        const anchorRect = anchorElement.getBoundingClientRect();
        const computedTop = anchorRect.bottom + 8;
        popup.style.top = `${computedTop}px`;
        popup.style.right = `${Math.max(16, window.innerWidth - anchorRect.right)}px`;

        const closeMenu = () => {
            menu.remove();
        };

        menu.querySelector('[data-dismiss="backdrop"]').addEventListener('click', closeMenu);

        const handleSaveToLibrary = async () => {
            if (!textarea) {
                return;
            }
            const saved = await decoyNotesManager.saveNote(textarea.value);
            if (saved) {
                statusTextEl && (statusTextEl.textContent = 'Saved to library');
                const savedAt = await decoyNotesManager.getLastSavedTimestamp();
                decoyNotesManager.updateLastSavedDisplay(savedAt, lastSavedEl);
            }
        };

        const handleSearch = () => {
            decoyNotesManager.showSearchModal({
                currentContent: textarea ? textarea.value : '',
                onSelectNote: async (note) => {
                    if (!textarea) {
                        return;
                    }
                    textarea.value = note.content;
                    decoyNotesManager.updateWordCountDisplay(note.content, wordCountEl);
                    const savedAt = await decoyNotesManager.saveCurrentNote(note.content);
                    statusTextEl && (statusTextEl.textContent = 'Loaded saved note');
                    decoyNotesManager.updateLastSavedDisplay(savedAt, lastSavedEl);
                }
            });
        };

        const handleShare = () => {
            if (!textarea) {
                return;
            }
            decoyNotesManager.showShareModal({
                content: textarea.value,
                title: decoyNotesManager.buildTitleFromContent(textarea.value)
            });
        };

        const handleSettings = () => {
            decoyNotesManager.showSettingsModal({
                onApply: async (newSettings) => {
                    await decoyNotesManager.applySettingsToEditor({
                        container: root,
                        header,
                        textarea,
                        statusBar,
                        wordCountEl,
                        settings: newSettings
                    });
                    decoyNotesManager.updateWordCountDisplay(textarea ? textarea.value : '', wordCountEl, newSettings);
                }
            });
        };

        const handleNewNote = () => {
            if (!textarea) {
                return;
            }
            const content = textarea.value.trim();
            uiUtils.showConfirmModal({
                title: 'Start a new note?',
                message: content ? 'The current note will be saved to your library first.' : 'This will clear the editor.',
                confirmText: 'Save and clear',
                cancelText: 'Keep editing',
                onConfirm: async () => {
                    if (content) {
                        await decoyNotesManager.saveNote(content);
                    }
                    textarea.value = '';
                    const savedAt = await decoyNotesManager.saveCurrentNote('');
                    decoyNotesManager.updateWordCountDisplay('', wordCountEl);
                    decoyNotesManager.updateLastSavedDisplay(savedAt, lastSavedEl);
                    statusTextEl && (statusTextEl.textContent = 'Ready for a new note');
                }
            });
        };

        menu.querySelectorAll('button[data-action]').forEach((button) => {
            const action = button.getAttribute('data-action');
            button.addEventListener('click', async () => {
                closeMenu();
                try {
                    if (action === 'save') {
                        await handleSaveToLibrary();
                    } else if (action === 'search') {
                        handleSearch();
                    } else if (action === 'share') {
                        handleShare();
                    } else if (action === 'settings') {
                        handleSettings();
                    } else if (action === 'new') {
                        handleNewNote();
                    }
                } catch (error) {
                    console.error('[SAFEY] Notes menu action failed:', error);
                    showToast('Action could not be completed. Try again.', 'error');
                }
            });
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
                if (pin && typeof unlockHandler !== 'undefined') {
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
                if (pin && typeof unlockHandler !== 'undefined') {
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
            if (pin && typeof unlockHandler !== 'undefined') {
                await unlockHandler.attemptUnlock(pin);
            }
        });
    }

    // Event listeners for custom URL
    attachCustomUrlListeners() {
        // Click to unlock
        this.container.addEventListener('click', async () => {
            const pin = prompt('Enter PIN to unlock:');
            if (pin && typeof unlockHandler !== 'undefined') {
                await unlockHandler.attemptUnlock(pin);
            }
        });
    }
}

// Export singleton
const disguiseRenderer = new DisguiseRenderer();

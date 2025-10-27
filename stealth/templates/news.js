// News Feed Disguise Template
// Scrollable news feed with sample headlines

export class NewsTemplate {
    constructor() {
        this.scrollCount = 0;
        this.lastScrollTime = 0;
        this.unlockCallback = null;
    }

    /**
     * Render news feed UI
     */
    render() {
        return `
            <div class="max-w-md mx-auto h-screen bg-white flex flex-col">
                <!-- Header -->
                <div class="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
                    <div class="flex items-center justify-between">
                        <h1 class="text-2xl font-bold text-gray-900">📰 News</h1>
                        <div class="flex gap-2">
                            <button class="news-search-btn p-2 hover:bg-gray-100 rounded transition">
                                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            <button class="news-menu-btn p-2 hover:bg-gray-100 rounded transition">
                                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <!-- Category Tabs -->
                    <div class="flex gap-3 mt-3 overflow-x-auto pb-2">
                        <button class="news-cat-btn px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-600 text-white whitespace-nowrap">All</button>
                        <button class="news-cat-btn px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 whitespace-nowrap">Technology</button>
                        <button class="news-cat-btn px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 whitespace-nowrap">World</button>
                        <button class="news-cat-btn px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 whitespace-nowrap">Business</button>
                        <button class="news-cat-btn px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 whitespace-nowrap">Sports</button>
                    </div>
                </div>

                <!-- News Feed -->
                <div id="news-feed" class="flex-1 overflow-y-auto bg-gray-50">
                    ${this._generateNewsArticles()}
                </div>
            </div>
        `;
    }

    /**
     * Generate sample news articles
     */
    _generateNewsArticles() {
        const articles = [
            {
                title: 'Tech Giants Announce New Climate Commitments',
                source: 'Tech Today',
                time: '2h ago',
                image: '🌍',
                category: 'Technology'
            },
            {
                title: 'Global Markets Rally on Economic Data',
                source: 'Financial News',
                time: '4h ago',
                image: '📈',
                category: 'Business'
            },
            {
                title: 'New Study Reveals Health Benefits of Walking',
                source: 'Health & Wellness',
                time: '5h ago',
                image: '🏃',
                category: 'Health'
            },
            {
                title: 'Scientists Make Breakthrough in Renewable Energy',
                source: 'Science Daily',
                time: '6h ago',
                image: '⚡',
                category: 'Science'
            },
            {
                title: 'Championship Game Set for Weekend Showdown',
                source: 'Sports Network',
                time: '8h ago',
                image: '🏆',
                category: 'Sports'
            },
            {
                title: 'Local Community Garden Project Expands',
                source: 'City News',
                time: '10h ago',
                image: '🌱',
                category: 'Local'
            },
            {
                title: 'New Educational Program Launches Nationwide',
                source: 'Education Times',
                time: '12h ago',
                image: '📚',
                category: 'Education'
            },
            {
                title: 'Weather Forecast: Sunny Week Ahead',
                source: 'Weather Network',
                time: '1d ago',
                image: '☀️',
                category: 'Weather'
            },
            {
                title: 'Cultural Festival to Celebrate Diversity',
                source: 'Arts & Culture',
                time: '1d ago',
                image: '🎭',
                category: 'Culture'
            },
            {
                title: 'Transportation Updates for City Commuters',
                source: 'Transit Authority',
                time: '2d ago',
                image: '🚇',
                category: 'Local'
            }
        ];

        return articles.map((article, index) => `
            <div class="bg-white border-b border-gray-200 p-4 hover:bg-gray-50 transition cursor-pointer">
                <div class="flex gap-4">
                    <div class="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-4xl">
                        ${article.image}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-base font-semibold text-gray-900 mb-1 line-clamp-2">${article.title}</h3>
                        <div class="flex items-center gap-2 text-sm text-gray-500">
                            <span>${article.source}</span>
                            <span>•</span>
                            <span>${article.time}</span>
                        </div>
                        <div class="mt-2">
                            <span class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">${article.category}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Initialize event handlers
     */
    initHandlers(pin) {
        const newsFeed = document.getElementById('news-feed');
        if (!newsFeed) return;

        let scrollPosition = 0;
        let scrollDirection = '';
        
        // Unlock by scrolling to bottom and then back to top quickly
        newsFeed.addEventListener('scroll', (e) => {
            const currentScroll = e.target.scrollTop;
            const scrollHeight = e.target.scrollHeight;
            const clientHeight = e.target.clientHeight;
            
            // Detect scroll to bottom
            if (currentScroll + clientHeight >= scrollHeight - 10 && scrollDirection !== 'bottom') {
                scrollDirection = 'bottom';
                this.lastScrollTime = Date.now();
            }
            
            // Detect scroll back to top within 3 seconds
            if (currentScroll < 10 && scrollDirection === 'bottom') {
                const now = Date.now();
                if (now - this.lastScrollTime < 3000) {
                    if (this.unlockCallback) {
                        this.unlockCallback();
                    }
                }
                scrollDirection = '';
            }
            
            scrollPosition = currentScroll;
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
        this.scrollCount = 0;
        this.lastScrollTime = 0;
    }

    /**
     * Get title for document.title
     */
    getTitle() {
        return 'News';
    }
}

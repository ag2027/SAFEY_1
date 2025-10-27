// Gallery Disguise Template
// Grid of innocuous placeholder images

export class GalleryTemplate {
    constructor() {
        this.longPressTimer = null;
        this.longPressStartTime = 0;
        this.unlockCallback = null;
    }

    /**
     * Render gallery UI
     */
    render() {
        return `
            <div class="max-w-md mx-auto h-screen bg-black flex flex-col">
                <!-- Header -->
                <div class="bg-black px-4 py-3 border-b border-gray-800">
                    <div class="flex items-center justify-between">
                        <h1 class="text-xl font-semibold text-white">Photos</h1>
                        <div class="flex gap-2">
                            <button class="gallery-search-btn p-2 hover:bg-gray-800 rounded transition">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            <button class="gallery-menu-btn p-2 hover:bg-gray-800 rounded transition">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-3 overflow-x-auto pb-2">
                        <button class="gallery-tab px-4 py-1.5 text-sm font-semibold text-blue-400 border-b-2 border-blue-400 whitespace-nowrap">All</button>
                        <button class="gallery-tab px-4 py-1.5 text-sm font-semibold text-gray-400 whitespace-nowrap">Recent</button>
                        <button class="gallery-tab px-4 py-1.5 text-sm font-semibold text-gray-400 whitespace-nowrap">Favorites</button>
                        <button class="gallery-tab px-4 py-1.5 text-sm font-semibold text-gray-400 whitespace-nowrap">Albums</button>
                    </div>
                </div>

                <!-- Photo Grid -->
                <div id="photo-grid" class="flex-1 overflow-y-auto p-1">
                    <div class="grid grid-cols-3 gap-1">
                        ${this._generatePhotoGrid()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate photo grid with placeholder images
     */
    _generatePhotoGrid() {
        const photos = [
            { emoji: '🌅', color: 'from-orange-400 to-pink-400', label: 'Sunset' },
            { emoji: '🏔️', color: 'from-blue-400 to-cyan-400', label: 'Mountain' },
            { emoji: '🌊', color: 'from-cyan-400 to-blue-600', label: 'Ocean' },
            { emoji: '🌸', color: 'from-pink-300 to-purple-400', label: 'Flowers' },
            { emoji: '🌲', color: 'from-green-500 to-emerald-600', label: 'Forest' },
            { emoji: '🏖️', color: 'from-yellow-300 to-orange-400', label: 'Beach' },
            { emoji: '🌆', color: 'from-purple-500 to-pink-500', label: 'City' },
            { emoji: '☕', color: 'from-amber-600 to-orange-700', label: 'Coffee' },
            { emoji: '📚', color: 'from-blue-300 to-indigo-400', label: 'Books' },
            { emoji: '🎨', color: 'from-red-400 to-pink-500', label: 'Art' },
            { emoji: '🍃', color: 'from-green-300 to-lime-400', label: 'Nature' },
            { emoji: '🌙', color: 'from-indigo-500 to-purple-600', label: 'Night' },
            { emoji: '🦋', color: 'from-purple-300 to-pink-400', label: 'Butterfly' },
            { emoji: '🌺', color: 'from-pink-400 to-red-400', label: 'Tropical' },
            { emoji: '🌿', color: 'from-green-400 to-teal-500', label: 'Plants' },
            { emoji: '🏡', color: 'from-yellow-400 to-red-400', label: 'Home' },
            { emoji: '🚲', color: 'from-blue-400 to-teal-400', label: 'Bike' },
            { emoji: '🎭', color: 'from-purple-400 to-indigo-500', label: 'Theater' },
        ];

        return photos.map((photo, index) => `
            <div class="gallery-photo aspect-square bg-gradient-to-br ${photo.color} flex items-center justify-center text-4xl cursor-pointer hover:opacity-80 transition" 
                 data-index="${index}"
                 title="${photo.label}">
                ${photo.emoji}
            </div>
        `).join('');
    }

    /**
     * Initialize event handlers
     */
    initHandlers(pin) {
        const photoGrid = document.getElementById('photo-grid');
        if (!photoGrid) return;

        // Long press on any photo for 3 seconds to unlock
        const photos = photoGrid.querySelectorAll('.gallery-photo');
        
        photos.forEach(photo => {
            // Touch events
            photo.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.longPressStartTime = Date.now();
                this.longPressTimer = setTimeout(() => {
                    if (this.unlockCallback) {
                        this.unlockCallback();
                    }
                }, 3000); // 3 second long press
            });

            photo.addEventListener('touchend', (e) => {
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }
            });

            photo.addEventListener('touchmove', (e) => {
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }
            });

            // Mouse events for desktop testing
            photo.addEventListener('mousedown', (e) => {
                this.longPressStartTime = Date.now();
                this.longPressTimer = setTimeout(() => {
                    if (this.unlockCallback) {
                        this.unlockCallback();
                    }
                }, 3000);
            });

            photo.addEventListener('mouseup', (e) => {
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }
            });

            photo.addEventListener('mouseleave', (e) => {
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }
            });
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
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.longPressStartTime = 0;
    }

    /**
     * Get title for document.title
     */
    getTitle() {
        return 'Photos';
    }
}

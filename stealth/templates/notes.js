// Notes Disguise Template
// Editable text area with placeholder content

export class NotesTemplate {
    constructor() {
        this.content = this._getDefaultContent();
        this.unlockCallback = null;
        this.swipeStartY = 0;
        this.swipeStartTime = 0;
    }

    /**
     * Get default placeholder content
     */
    _getDefaultContent() {
        return `Shopping List
- Milk
- Bread
- Eggs
- Butter
- Coffee

To Do:
- Call dentist
- Pick up dry cleaning
- Pay utilities
- Schedule car maintenance

Meeting Notes:
Project deadline: Next Friday
Team sync: Wednesday 2pm

Ideas:
- Weekend trip planning
- Garden project for spring
`;
    }

    /**
     * Render notes UI
     */
    render() {
        return `
            <div class="max-w-md mx-auto h-screen bg-amber-50">
                <div class="h-full flex flex-col">
                    <!-- Header -->
                    <div class="bg-amber-100 px-4 py-3 border-b border-amber-200 flex items-center justify-between">
                        <h1 class="text-xl font-semibold text-gray-800">📝 Notes</h1>
                        <div class="flex gap-2">
                            <button class="notes-new-btn p-2 hover:bg-amber-200 rounded transition" title="New note">
                                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            <button class="notes-menu-btn p-2 hover:bg-amber-200 rounded transition" title="Menu">
                                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Notes Area -->
                    <div class="flex-1 overflow-hidden">
                        <textarea 
                            id="notes-textarea" 
                            class="w-full h-full p-4 bg-amber-50 text-gray-800 font-mono text-sm resize-none focus:outline-none"
                            placeholder="Start typing..."
                            spellcheck="false"
                        >${this.content}</textarea>
                    </div>

                    <!-- Footer -->
                    <div class="bg-amber-100 px-4 py-2 border-t border-amber-200 text-xs text-gray-500 text-center">
                        Last edited: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize event handlers
     */
    initHandlers(pin) {
        const textarea = document.getElementById('notes-textarea');
        if (!textarea) return;

        // Track content changes
        textarea.addEventListener('input', (e) => {
            this.content = e.target.value;
        });

        // Hidden swipe unlock: swipe down 3 times quickly
        let swipeCount = 0;
        let lastSwipeTime = 0;

        textarea.addEventListener('touchstart', (e) => {
            this.swipeStartY = e.touches[0].clientY;
            this.swipeStartTime = Date.now();
        });

        textarea.addEventListener('touchend', (e) => {
            const swipeEndY = e.changedTouches[0].clientY;
            const swipeDistance = swipeEndY - this.swipeStartY;
            const swipeTime = Date.now() - this.swipeStartTime;

            // Detect downward swipe (at least 100px in less than 500ms)
            if (swipeDistance > 100 && swipeTime < 500) {
                const now = Date.now();
                
                // Reset count if more than 2 seconds since last swipe
                if (now - lastSwipeTime > 2000) {
                    swipeCount = 0;
                }
                
                swipeCount++;
                lastSwipeTime = now;

                // After 3 swipes, check PIN by looking for PIN digits in text
                if (swipeCount >= 3) {
                    const textContent = textarea.value;
                    if (textContent.includes(pin)) {
                        if (this.unlockCallback) {
                            this.unlockCallback();
                        }
                    }
                    swipeCount = 0;
                }
            }
        });

        // New note button
        const newBtn = document.querySelector('.notes-new-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                textarea.value = '';
                this.content = '';
                textarea.focus();
            });
        }
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
        this.content = this._getDefaultContent();
    }

    /**
     * Get title for document.title
     */
    getTitle() {
        return 'Notes';
    }
}

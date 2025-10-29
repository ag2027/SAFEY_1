// Decoy Notes Manager controls the disguised notes experience from data to UI flows.

class DecoyNotesManager {
    constructor(storageUtilsInstance) {
        this.storage = storageUtilsInstance;
        this.CURRENT_NOTE_KEY = 'decoy_current_note';
        this.SAVED_NOTES_KEY = 'decoy_saved_notes';
        this.SETTINGS_KEY = 'decoy_notes_settings';
        this.LAST_SAVED_KEY = 'decoy_notes_last_saved';
        this.defaultSettings = {
            theme: 'light',
            fontSize: 'medium',
            showWordCount: true,
            autoSave: true
        };
        this.initialized = false;
        this.saveTimer = null;
        this.saveDelayMs = 450;
        this.cachedSettings = null;
    }

    async initialize() {
        if (this.initialized) {
            return;
        }
        await this.migrateLegacyData();
        await this.ensureDefaults();
        this.initialized = true;
    }

    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    async migrateLegacyData() {
        const [existingCurrent, existingNotes, existingSettings] = await Promise.all([
            this.storage.loadData('notes', this.CURRENT_NOTE_KEY),
            this.storage.loadData('notes', this.SAVED_NOTES_KEY),
            this.storage.loadData('notes', this.SETTINGS_KEY)
        ]);

        if (!existingCurrent) {
            const legacyCurrent = localStorage.getItem('safey_notes_content');
            if (legacyCurrent !== null) {
                await this.storage.saveData('notes', this.CURRENT_NOTE_KEY, legacyCurrent);
                localStorage.removeItem('safey_notes_content');
            }
        }

        if (!existingNotes) {
            const legacySaved = localStorage.getItem('safey_saved_notes');
            if (legacySaved) {
                try {
                    const parsed = JSON.parse(legacySaved);
                    if (Array.isArray(parsed) && parsed.length) {
                        const normalised = parsed.map((note, index) => ({
                            id: note.id || `legacy_note_${Date.now()}_${index}`,
                            content: note.content || '',
                            title: note.title || this.buildTitleFromContent(note.content),
                            timestamp: note.timestamp || Date.now()
                        }));
                        await this.storage.saveData('notes', this.SAVED_NOTES_KEY, normalised);
                    }
                } catch (error) {
                    console.error('[SAFEY] Legacy notes migration failed:', error);
                }
                localStorage.removeItem('safey_saved_notes');
            }
        }

        if (!existingSettings) {
            const legacySettings = localStorage.getItem('decoy_notes_settings');
            if (legacySettings) {
                try {
                    const parsed = JSON.parse(legacySettings);
                    await this.storage.saveData('notes', this.SETTINGS_KEY, { ...this.defaultSettings, ...parsed });
                } catch (error) {
                    console.error('[SAFEY] Legacy settings migration failed:', error);
                }
                localStorage.removeItem('decoy_notes_settings');
            }
        }
    }

    async ensureDefaults() {
        const [currentNote, savedNotes, savedSettings] = await Promise.all([
            this.storage.loadData('notes', this.CURRENT_NOTE_KEY),
            this.storage.loadData('notes', this.SAVED_NOTES_KEY),
            this.storage.loadData('notes', this.SETTINGS_KEY)
        ]);

        if (currentNote === null || currentNote === undefined) {
            await this.storage.saveData('notes', this.CURRENT_NOTE_KEY, this.getSeedCurrentNote());
        }

        if (!savedNotes || !Array.isArray(savedNotes) || !savedNotes.length) {
            await this.storage.saveData('notes', this.SAVED_NOTES_KEY, this.getSeedNotes());
        }

        if (!savedSettings) {
            await this.storage.saveData('notes', this.SETTINGS_KEY, this.defaultSettings);
            this.cachedSettings = { ...this.defaultSettings };
        }
    }

    getSeedCurrentNote() {
        return [
            'Shopping List:',
            '- Oat milk',
            '- Coffee beans (medium roast)',
            '- Mixed berries',
            '- Whole grain bread',
            '',
            'Today:',
            '- Call landlord about repairs',
            '- Draft email to Mira',
            '- Block out time for meditation'
        ].join('\n');
    }

    getSeedNotes() {
        const now = Date.now();
        return [
            {
                id: 'note_seed_weekly_checkin',
                title: 'Weekly check-in',
                content: [
                    'Weekly Check-in',
                    '',
                    'Wins:',
                    '- Spoke with support group on Tuesday',
                    '- Finished journal entry series',
                    '',
                    'Next focus:',
                    '- Schedule follow-up with counselor',
                    '- Revisit safety plan checklist'
                ].join('\n'),
                timestamp: now - 86400000 * 2
            },
            {
                id: 'note_seed_grounding',
                title: 'Grounding reminders',
                content: [
                    'Grounding Reminders',
                    '',
                    '- Breathe in for 4, hold for 4, out for 6',
                    '- Notice 5 things you can see',
                    '- Text coded phrase to Tia if needed',
                    '- Step outside for fresh air when safe'
                ].join('\n'),
                timestamp: now - 86400000 * 5
            },
            {
                id: 'note_seed_contacts',
                title: 'Important contacts',
                content: [
                    'Important Contacts',
                    '',
                    'Therapist (Dr. Lee)',
                    '555-0198',
                    'Sessions: Thursdays 3 PM',
                    '',
                    'Advocate (Camille)',
                    'camille@safesteps.org',
                    'Backup meeting: 11/12'
                ].join('\n'),
                timestamp: now - 86400000 * 9
            }
        ];
    }

    buildTitleFromContent(content = '') {
        if (!content) {
            return 'Untitled Note';
        }
        return content.split('\n')[0].substring(0, 50) || 'Untitled Note';
    }

    async getCurrentNote() {
        await this.ensureInitialized();
        const stored = await this.storage.loadData('notes', this.CURRENT_NOTE_KEY);
        if (stored !== null && stored !== undefined) {
            return stored;
        }
        const legacyFallback = await this.storage.loadData('settings', this.CURRENT_NOTE_KEY);
        return legacyFallback || '';
    }

    async saveCurrentNote(content) {
        await this.ensureInitialized();
        const value = content || '';
        await this.storage.saveData('notes', this.CURRENT_NOTE_KEY, value);
        const timestamp = Date.now();
        await this.storage.saveData('notes', this.LAST_SAVED_KEY, timestamp);
        return timestamp;
    }

    async getLastSavedTimestamp() {
        await this.ensureInitialized();
        return await this.storage.loadData('notes', this.LAST_SAVED_KEY);
    }

    async getSavedNotes() {
        await this.ensureInitialized();
        const notes = await this.storage.loadData('notes', this.SAVED_NOTES_KEY);
        return Array.isArray(notes) ? notes : [];
    }

    async saveNote(content) {
        await this.ensureInitialized();
        if (!content || !content.trim()) {
            showToast('Write something before saving the note.', 'warning');
            return null;
        }

        const notes = await this.getSavedNotes();
        const now = Date.now();
        const note = {
            id: `note_${now}`,
            content,
            title: this.buildTitleFromContent(content),
            timestamp: now
        };

        notes.unshift(note);
        if (notes.length > 50) {
            notes.splice(50);
        }

        await this.storage.saveData('notes', this.SAVED_NOTES_KEY, notes);
        await this.saveCurrentNote(content);
        showToast('Note saved to library.', 'success');
        return note;
    }

    scheduleAutoSave(content, statusHandler) {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }

        const handler = typeof statusHandler === 'function' ? statusHandler : () => {};
        handler('pending');

        this.saveTimer = setTimeout(async () => {
            try {
                const savedAt = await this.saveCurrentNote(content);
                handler('saved', savedAt);
            } catch (error) {
                console.error('[SAFEY] Failed to auto-save decoy note:', error);
                handler('error');
            }
        }, this.saveDelayMs);
    }

    computeWordCount(text) {
        if (!text || !text.trim()) {
            return 0;
        }
        return text.trim().split(/\s+/).filter(Boolean).length;
    }

    updateWordCountDisplay(content, target, settingsOverride) {
        if (!target) {
            return;
        }
        const settings = settingsOverride || this.cachedSettings || this.defaultSettings;
        const shouldShow = settings.showWordCount !== false;
        target.classList.toggle('hidden', !shouldShow);
        target.textContent = `Word count: ${this.computeWordCount(content)}`;
    }

    updateLastSavedDisplay(timestamp, target) {
        if (!target) {
            return;
        }
        if (!timestamp) {
            target.textContent = 'Not saved yet';
            return;
        }
        target.textContent = `Last edited ${this.formatRelativeTime(timestamp)}`;
    }

    formatRelativeTime(timestamp) {
        const diff = Date.now() - timestamp;
        if (diff < 60000) {
            return 'just now';
        }
        if (diff < 3600000) {
            const mins = Math.round(diff / 60000);
            return `${mins} minute${mins === 1 ? '' : 's'} ago`;
        }
        if (diff < 86400000) {
            const hours = Math.round(diff / 3600000);
            return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        }
        const days = Math.round(diff / 86400000);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    async getSettings() {
        await this.ensureInitialized();
        if (this.cachedSettings) {
            return { ...this.cachedSettings };
        }
        const stored = await this.storage.loadData('notes', this.SETTINGS_KEY);
        this.cachedSettings = { ...this.defaultSettings, ...(stored || {}) };
        return { ...this.cachedSettings };
    }

    async saveSettings(newSettings = {}) {
        const current = await this.getSettings();
        const merged = { ...current, ...newSettings };
        this.cachedSettings = merged;
        await this.storage.saveData('notes', this.SETTINGS_KEY, merged);
        return merged;
    }

    async resetSettings() {
        this.cachedSettings = { ...this.defaultSettings };
        await this.storage.saveData('notes', this.SETTINGS_KEY, this.cachedSettings);
        return { ...this.cachedSettings };
    }

    async applySettingsToEditor({ container, header, textarea, statusBar, wordCountEl, settings }) {
        const effectiveSettings = settings || await this.getSettings();
        this.cachedSettings = effectiveSettings;

        if (container) {
            container.classList.remove('bg-white', 'text-gray-800', 'bg-gray-900', 'text-gray-100');
            if (effectiveSettings.theme === 'dark') {
                container.classList.add('bg-gray-900', 'text-gray-100');
            } else {
                container.classList.add('bg-white', 'text-gray-800');
            }
        }

        if (header) {
            header.classList.remove('bg-yellow-50', 'border-yellow-200', 'bg-gray-800', 'border-gray-700');
            if (effectiveSettings.theme === 'dark') {
                header.classList.add('bg-gray-800', 'border-gray-700');
            } else {
                header.classList.add('bg-yellow-50', 'border-yellow-200');
            }
        }

        if (textarea) {
            const sizeMap = { small: '15px', medium: '17px', large: '19px' };
            textarea.style.fontSize = sizeMap[effectiveSettings.fontSize] || sizeMap.medium;
            textarea.style.lineHeight = '1.6';
            textarea.classList.remove('bg-white', 'text-gray-800', 'bg-gray-800', 'text-gray-100');
            if (effectiveSettings.theme === 'dark') {
                textarea.classList.add('bg-gray-800', 'text-gray-100');
            } else {
                textarea.classList.add('bg-white', 'text-gray-800');
            }
        }

        if (statusBar) {
            statusBar.classList.remove('bg-yellow-50', 'border-yellow-200', 'bg-gray-800', 'border-gray-700', 'text-gray-500', 'text-gray-300');
            if (effectiveSettings.theme === 'dark') {
                statusBar.classList.add('bg-gray-800', 'border-gray-700', 'text-gray-300');
            } else {
                statusBar.classList.add('bg-yellow-50', 'border-yellow-200', 'text-gray-500');
            }
        }

        this.updateWordCountDisplay(textarea ? textarea.value : '', wordCountEl, effectiveSettings);
        return effectiveSettings;
    }

    escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    highlightMatch(text, query) {
        if (!query) {
            return text;
        }
        const pattern = new RegExp(`(${this.escapeRegExp(query)})`, 'ig');
        return text.replace(pattern, '<mark class="px-1 bg-yellow-200 rounded">$1</mark>');
    }

    doesNoteMatch(note, query) {
        if (!query) {
            return true;
        }
        const lower = query.toLowerCase();
        return note.title.toLowerCase().includes(lower) || note.content.toLowerCase().includes(lower);
    }

    async showSearchModal({ onSelectNote, currentContent = '' } = {}) {
        await this.ensureInitialized();
        const notes = await this.getSavedNotes();

        if (!notes.length) {
            uiUtils.showInfoModal({
                title: 'No saved notes yet',
                message: 'Save a note first to use search.',
                buttonText: 'Understood'
            });
            return;
        }

        const modalBody = document.createElement('div');
        modalBody.innerHTML = `
            <div class="space-y-4">
                <div class="relative">
                    <input type="search" id="decoy-notes-search-input" class="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-trust-blue focus:border-transparent" placeholder="Search saved notes">
                    <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div class="text-xs text-gray-500">Saved notes are listed by most recent first.</div>
                <div id="decoy-notes-search-results" class="max-h-72 overflow-y-auto space-y-2"></div>
            </div>
        `;

        const { close } = uiUtils.showModal({
            title: 'Search Notes',
            content: modalBody,
            maxWidth: 'max-w-lg',
            actions: [
                {
                    label: 'Close',
                    variant: 'secondary',
                    onClick: () => close()
                }
            ]
        });

        const input = modalBody.querySelector('#decoy-notes-search-input');
        const resultsContainer = modalBody.querySelector('#decoy-notes-search-results');

        const renderResults = (term = '') => {
            resultsContainer.innerHTML = '';
            const query = term.trim();
            const filtered = notes.filter(note => this.doesNoteMatch(note, query));

            if (!filtered.length) {
                const emptyState = document.createElement('div');
                emptyState.className = 'py-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl';
                emptyState.textContent = query ? `No notes match "${query}".` : 'No notes available yet.';
                resultsContainer.appendChild(emptyState);
                return;
            }

            filtered.forEach(note => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'w-full text-left bg-white border border-gray-200 hover:border-trust-blue hover:shadow-sm rounded-xl p-4 transition focus:outline-none';
                const snippet = note.content.split('\n').slice(1).join(' ').substring(0, 120);
                item.innerHTML = `
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <div class="font-semibold text-gray-800 mb-1">${this.highlightMatch(note.title, query)}</div>
                            <div class="text-sm text-gray-500 leading-snug">${this.highlightMatch(snippet || 'No preview available', query)}</div>
                        </div>
                        <div class="text-xs text-gray-400 whitespace-nowrap">${this.formatRelativeTime(note.timestamp)}</div>
                    </div>
                `;

                item.addEventListener('click', async () => {
                    close();
                    if (typeof onSelectNote === 'function') {
                        await onSelectNote(note);
                    }
                });

                resultsContainer.appendChild(item);
            });
        };

        renderResults('');
        input.addEventListener('input', () => renderResults(input.value));
        input.focus();
    }

    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (error) {
            console.warn('[SAFEY] Clipboard API failed, falling back to execCommand.', error);
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            return successful;
        } catch (error) {
            document.body.removeChild(textarea);
            return false;
        }
    }

    async showShareModal({ content, title } = {}) {
        await this.ensureInitialized();
        const noteContent = (content || '').trim();
        if (!noteContent) {
            showToast('Write something before sharing.', 'warning');
            return;
        }

        const noteTitle = (title || this.buildTitleFromContent(noteContent)).substring(0, 60);

        const modalBody = document.createElement('div');
        modalBody.innerHTML = `
            <div class="space-y-4">
                <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    Choose how you want to export this note. Nothing is sent automatically.
                </div>
                <div class="space-y-2">
                    <button type="button" data-share-action="copy" class="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 hover:border-trust-blue rounded-xl transition">
                        <div>
                            <div class="font-semibold text-gray-800">Copy note text</div>
                            <div class="text-xs text-gray-500">Copies the full note to your clipboard</div>
                        </div>
                        <span class="text-sm text-gray-400">[Copy]</span>
                    </button>
                    <button type="button" data-share-action="email" class="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 hover:border-trust-blue rounded-xl transition">
                        <div>
                            <div class="font-semibold text-gray-800">Share via email</div>
                            <div class="text-xs text-gray-500">Opens your email app with the note pre-filled</div>
                        </div>
                        <span class="text-sm text-gray-400">[Email]</span>
                    </button>
                    <button type="button" data-share-action="print" class="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 hover:border-trust-blue rounded-xl transition">
                        <div>
                            <div class="font-semibold text-gray-800">Print or save as PDF</div>
                            <div class="text-xs text-gray-500">Opens a print-friendly preview</div>
                        </div>
                        <span class="text-sm text-gray-400">[Print]</span>
                    </button>
                </div>
            </div>
        `;

        const { close } = uiUtils.showModal({
            title: 'Share Note',
            content: modalBody,
            maxWidth: 'max-w-md',
            actions: [
                {
                    label: 'Done',
                    variant: 'primary',
                    onClick: () => close()
                }
            ]
        });

        const handlers = {
            copy: async () => {
                const copied = await this.copyToClipboard(noteContent);
                if (copied) {
                    showToast('Note copied to clipboard.', 'success');
                } else {
                    showToast('Unable to copy note. Please try manually.', 'error');
                }
            },
            email: () => {
                const mailto = `mailto:?subject=${encodeURIComponent(noteTitle)}&body=${encodeURIComponent(noteContent)}`;
                window.location.href = mailto;
            },
            print: () => {
                const printWindow = window.open('', '_blank', 'width=800,height=600');
                if (!printWindow) {
                    showToast('Pop-up blocked. Allow pop-ups to print.', 'warning');
                    return;
                }
                const escaped = noteContent.replace(/\n/g, '<br>');
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>${noteTitle}</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; color: #1f2937; }
                                h1 { font-size: 24px; margin-bottom: 16px; }
                            </style>
                        </head>
                        <body>
                            <h1>${noteTitle}</h1>
                            <p>${escaped}</p>
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            }
        };

        modalBody.querySelectorAll('[data-share-action]').forEach(button => {
            button.addEventListener('click', async () => {
                const action = button.getAttribute('data-share-action');
                const handler = handlers[action];
                if (handler) {
                    await handler();
                }
            });
        });
    }

    async showSettingsModal({ onApply } = {}) {
        await this.ensureInitialized();
        const currentSettings = await this.getSettings();

        const modalBody = document.createElement('div');
        modalBody.innerHTML = `
            <div class="space-y-5">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Appearance</label>
                    <div class="flex gap-3">
                        <label class="flex items-center gap-2 text-sm text-gray-600">
                            <input type="radio" name="decoy-notes-theme" value="light" ${currentSettings.theme === 'light' ? 'checked' : ''}>
                            Light
                        </label>
                        <label class="flex items-center gap-2 text-sm text-gray-600">
                            <input type="radio" name="decoy-notes-theme" value="dark" ${currentSettings.theme === 'dark' ? 'checked' : ''}>
                            Dark
                        </label>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Font size</label>
                    <select id="decoy-notes-font-size" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue">
                        <option value="small" ${currentSettings.fontSize === 'small' ? 'selected' : ''}>Small</option>
                        <option value="medium" ${currentSettings.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="large" ${currentSettings.fontSize === 'large' ? 'selected' : ''}>Large</option>
                    </select>
                </div>
                <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer text-sm text-gray-700">
                    <span>Show word count</span>
                    <input type="checkbox" id="decoy-notes-wordcount" ${currentSettings.showWordCount !== false ? 'checked' : ''}>
                </label>
                <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm text-gray-400 cursor-not-allowed" title="Auto-save is always on for realism">
                    <div>
                        <span>Auto-save</span>
                        <p class="text-xs text-gray-400">Always enabled to mimic real notes apps</p>
                    </div>
                    <input type="checkbox" checked disabled>
                </label>
            </div>
        `;

        const { close } = uiUtils.showModal({
            title: 'Notes Settings',
            content: modalBody,
            maxWidth: 'max-w-md',
            actions: [
                {
                    label: 'Restore defaults',
                    variant: 'ghost',
                    closeOnClick: false,
                    onClick: async () => {
                        const defaults = await this.resetSettings();
                        this.populateSettingsForm(modalBody, defaults);
                        showToast('Defaults restored.', 'success');
                        if (typeof onApply === 'function') {
                            await onApply(defaults);
                        }
                    }
                },
                {
                    label: 'Cancel',
                    variant: 'secondary',
                    onClick: () => close()
                },
                {
                    label: 'Save settings',
                    variant: 'primary',
                    closeOnClick: false,
                    onClick: async () => {
                        const updated = this.extractSettingsFromForm(modalBody);
                        const saved = await this.saveSettings(updated);
                        showToast('Notes settings updated.', 'success');
                        if (typeof onApply === 'function') {
                            await onApply(saved);
                        }
                        close();
                    }
                }
            ]
        });
    }

    populateSettingsForm(container, settings) {
        container.querySelectorAll('input[name="decoy-notes-theme"]').forEach(input => {
            input.checked = input.value === settings.theme;
        });
        const fontSizeSelect = container.querySelector('#decoy-notes-font-size');
        if (fontSizeSelect) {
            fontSizeSelect.value = settings.fontSize;
        }
        const wordCountToggle = container.querySelector('#decoy-notes-wordcount');
        if (wordCountToggle) {
            wordCountToggle.checked = settings.showWordCount !== false;
        }
    }

    extractSettingsFromForm(container) {
        const themeInput = container.querySelector('input[name="decoy-notes-theme"]:checked');
        const fontSizeSelect = container.querySelector('#decoy-notes-font-size');
        const wordCountToggle = container.querySelector('#decoy-notes-wordcount');
        return {
            theme: themeInput ? themeInput.value : 'light',
            fontSize: fontSizeSelect ? fontSizeSelect.value : 'medium',
            showWordCount: wordCountToggle ? wordCountToggle.checked : true
        };
    }
}

const decoyNotesManager = new DecoyNotesManager(storageUtils);
decoyNotesManager.initialize().catch(error => {
    console.error('[SAFEY] Failed to initialise decoy notes manager:', error);
});

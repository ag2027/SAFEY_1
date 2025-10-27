// Disguise Renderer Module
// Renders and manages disguise templates

import { CalculatorTemplate } from './templates/calculator.js';
import { NotesTemplate } from './templates/notes.js';
import { WeatherTemplate } from './templates/weather.js';
import { NewsTemplate } from './templates/news.js';
import { GalleryTemplate } from './templates/gallery.js';
import { CustomURLTemplate } from './templates/customUrl.js';
import stealthSettings from './stealthSettings.js';

class DisguiseRenderer {
    constructor() {
        this.currentTemplate = null;
        this.currentTemplateName = null;
        this.containerElement = null;
    }

    /**
     * Initialize disguise renderer
     */
    init(containerElement) {
        this.containerElement = containerElement;
        console.log('[DisguiseRenderer] Initialized');
    }

    /**
     * Render disguise template
     */
    async render(templateName = null, unlockCallback = null) {
        const settings = stealthSettings.getSettings();
        const template = templateName || settings.disguiseTemplate;

        // Create template instance
        this.currentTemplateName = template;
        
        switch (template) {
            case 'calculator':
                this.currentTemplate = new CalculatorTemplate();
                break;
            case 'notes':
                this.currentTemplate = new NotesTemplate();
                break;
            case 'weather':
                this.currentTemplate = new WeatherTemplate();
                break;
            case 'news':
                this.currentTemplate = new NewsTemplate();
                break;
            case 'gallery':
                this.currentTemplate = new GalleryTemplate();
                break;
            case 'customUrl':
                this.currentTemplate = new CustomURLTemplate(
                    settings.customUrl,
                    settings.customUrlSnapshot
                );
                break;
            default:
                this.currentTemplate = new CalculatorTemplate();
                this.currentTemplateName = 'calculator';
        }

        // Set unlock callback
        if (unlockCallback) {
            this.currentTemplate.setUnlockCallback(unlockCallback);
        }

        // Render template
        if (this.containerElement) {
            this.containerElement.innerHTML = this.currentTemplate.render();
            
            // Initialize template handlers
            const pin = settings.pin;
            if (this.currentTemplate.initHandlers) {
                this.currentTemplate.initHandlers(pin);
            }

            // Set document title
            document.title = this.currentTemplate.getTitle();
        }

        console.log('[DisguiseRenderer] Rendered template:', this.currentTemplateName);
    }

    /**
     * Handle input for current template
     */
    handleInput(value) {
        if (this.currentTemplate && this.currentTemplate.handleInput) {
            const pin = stealthSettings.getPin();
            this.currentTemplate.handleInput(value, pin);
        }
    }

    /**
     * Reset current template
     */
    reset() {
        if (this.currentTemplate && this.currentTemplate.reset) {
            this.currentTemplate.reset();
        }
    }

    /**
     * Get current template name
     */
    getCurrentTemplateName() {
        return this.currentTemplateName;
    }

    /**
     * Clear renderer
     */
    clear() {
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
        }
        this.currentTemplate = null;
        this.currentTemplateName = null;
    }
}

// Export singleton instance
const disguiseRenderer = new DisguiseRenderer();
export default disguiseRenderer;

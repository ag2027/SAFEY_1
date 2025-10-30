// Trusted Contacts Manager
// Handles secure storage and retrieval of trusted contacts and alert message templates

class TrustedContactsManager {
    constructor() {
        this.maxContacts = 5;
        this.defaultTemplate = 'SAFEY Alert: {{reason}} (Risk: {{risk}}). Triggered at {{time}}. Please check in immediately.';
    }

    // Get trusted contacts array (always returns a copy)
    getContacts() {
        const contacts = stealthSettings?.settings?.trustedContacts;
        if (Array.isArray(contacts)) {
            return contacts.map(contact => ({ ...contact }));
        }
        return [];
    }

    // Save contacts back to encrypted settings
    async saveContacts(contacts) {
        if (!stealthSettings?.settings) {
            throw new Error('Stealth settings not initialized');
        }
        stealthSettings.settings.trustedContacts = contacts;
        await stealthSettings.saveSettings();
    }

    // Sanitize phone numbers (allow digits and leading +)
    sanitizePhone(phone) {
        if (!phone) return '';
        const trimmed = phone.trim();
        if (!trimmed) return '';
        const hasPlus = trimmed.startsWith('+');
        const digits = trimmed.replace(/[^0-9]/g, '');
        return hasPlus ? `+${digits}` : digits;
    }

    // Format phone for display (basic grouping)
    formatPhone(phone) {
        if (!phone) return '';
        if (phone.startsWith('+')) {
            return phone.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
        }
        if (phone.length === 10) {
            return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        if (phone.length === 11 && phone.startsWith('1')) {
            return phone.replace(/1(\d{3})(\d{3})(\d{4})/, '1 ($1) $2-$3');
        }
        return phone;
    }

    // Add a new trusted contact
    async addContact({ name, phone, note = '' }) {
        const contacts = this.getContacts();
        if (contacts.length >= this.maxContacts) {
            throw new Error(`You can only store up to ${this.maxContacts} trusted contacts.`);
        }

        const sanitizedPhone = this.sanitizePhone(phone);
        if (!sanitizedPhone) {
            throw new Error('Phone number is required.');
        }

        if (contacts.some(contact => contact.phone === sanitizedPhone)) {
            throw new Error('This phone number is already saved.');
        }

        const displayName = (name || '').trim();
        const safeName = displayName || 'Trusted Contact';

        const id = `tc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

        contacts.push({
            id,
            name: safeName,
            phone: sanitizedPhone,
            note: (note || '').trim()
        });

        await this.saveContacts(contacts);
        await eventLogger.logEvent('trustedContactAdded', { id, name: safeName });

        return id;
    }

    // Remove contact by id
    async removeContact(id) {
        const contacts = this.getContacts();
        const index = contacts.findIndex(contact => contact.id === id);
        if (index === -1) {
            return false;
        }

        const [removed] = contacts.splice(index, 1);
        await this.saveContacts(contacts);
        await eventLogger.logEvent('trustedContactRemoved', { id: removed.id, name: removed.name });
        return true;
    }

    // Update stored message template
    async updateMessageTemplate(template) {
        const trimmed = (template || '').trim();
        const value = trimmed || this.defaultTemplate;
        stealthSettings.settings.trustedContactMessageTemplate = value;
        await stealthSettings.saveSettings();
        await eventLogger.logEvent('trustedContactTemplateUpdated');
        return value;
    }

    // Retrieve stored template (with fallback)
    getMessageTemplate() {
        const stored = stealthSettings?.settings?.trustedContactMessageTemplate;
        if (stored && typeof stored === 'string' && stored.trim()) {
            return stored.trim();
        }
        return this.defaultTemplate;
    }

    // Build alert message using template placeholders
    buildAlertMessage({ reason = 'Safety check triggered', riskLevel = 'low', timestamp = Date.now() } = {}) {
        const template = this.getMessageTemplate();
        const replacements = {
            reason,
            risk: String(riskLevel).toUpperCase(),
            time: new Date(timestamp).toLocaleString()
        };

        return template.replace(/\{\{\s*(reason|risk|time)\s*\}\}/g, (_, token) => replacements[token] || '');
    }

    // Return maximum allowed contacts
    getMaxContacts() {
        return this.maxContacts;
    }

    hasContacts() {
        return this.getContacts().length > 0;
    }
}

const trustedContactsManager = new TrustedContactsManager();
window.trustedContactsManager = trustedContactsManager;

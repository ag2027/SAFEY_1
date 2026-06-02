// SAFEY Chatbot - Cerebras via secure proxy
// Handles chat functionality with safety-focused responses without exposing API keys

class Chatbot {
    constructor() {
        this.isInitialized = false;
        this.messages = [];
        this.isLoading = false;

        const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
        this.proxyUrl = isLocalhost
            ? 'http://127.0.0.1:8787'
            : 'https://safey-cerebras-proxy.safey.workers.dev';
        // System prompt for safety-focused responses
        this.basePrompt = `
You are SAFEY's built-in safety assistant. 
- Calmly listen to users describing domestic violence, fear, or uncertainty.
- Always respond supportively, never judgmentally, under 200 words.
- Extract details: type of danger (immediate, risk, planning), location if mentioned, emotional state, any mention of hiding or stealth.
- Choose resources based on extracted info:
    • Immediate danger: "Call 911 immediately" + local contacts if known.
    • Risk or fear: safety assessment steps + link 'assessment-screen'.
    • Planning steps: safety planning tips + link 'safety-plan-screen'.
    • Emotional support: National Domestic Violence Hotline 1−800−799−SAFE (7233) or https://www.thehotline.org.
    • Counseling: RAINN 1−800−656−4673 or https://www.rainn.org.
    • Shelters/legal help: local shelter info if known, or https://www.domesticshelters.org.
- Explain 'stealth mode' clearly if hiding is mentioned.
- Always prioritize actionable advice relevant to the user's exact situation.
- Never store or transmit private data.
- Never include bold, italics, or other formatting symbols in your responses.
- Example scenarios:
    • "My partner hit me last night" → "Call 911 immediately. For shelter: https://www.domesticshelters.org."
    • "I feel scared at home but nothing happened yet" → "You can assess your safety here: 'assessment-screen'."
    • "I want to plan leaving safely" → "See safety planning tips: 'safety-plan-screen'."
    • "I need to hide messages" → "Stealth mode lets you hide the app under a calculator or notes interface."
`.trim();
    }

    async init() {
        try {
            this.isInitialized = true;
            await this.loadChatHistory();
            console.log('[SAFEY] Chatbot initialized (proxy mode)');
        } catch (error) {
            console.error('[SAFEY] Chatbot initialization error:', error);
        }
    }

    async loadChatHistory() {
        try {
            const encryptedHistory = await storageUtils.loadData('chatbot', 'message_history');
            if (encryptedHistory && encryptedHistory.value) {
                const decryptedHistory = await cryptoUtils.decrypt(encryptedHistory.value, 'chat_history_salt');
                this.messages = JSON.parse(decryptedHistory);
                console.log('[SAFEY] Chat history loaded successfully');
            }
        } catch (error) {
            console.error('[SAFEY] Error loading chat history:', error);
            this.messages = [];
        }
    }

    async saveChatHistory() {
        try {
            const historyJson = JSON.stringify(this.messages);
            const encrypted = await cryptoUtils.encrypt(historyJson, 'chat_history_salt');
            await storageUtils.saveData('chatbot', 'message_history', { value: encrypted });
        } catch (error) {
            console.error('[SAFEY] Error saving chat history:', error);
        }
    }

    // Kept for compatibility with existing settings UI, but no key is stored client-side anymore.
    async setApiKey() {
        console.warn('[SAFEY] setApiKey is deprecated in proxy mode.');
        return true;
    }

    async sendMessage(userMessage) {
        if (!this.isInitialized) {
            throw new Error('Chatbot not initialized.');
        }

        if (this.isLoading) {
            throw new Error('Please wait for the previous message to complete.');
        }

        this.isLoading = true;

        try {
            // Store locally with timestamp for history tracking
            this.messages.push({
                role: 'user',
                content: userMessage,
                timestamp: Date.now()  // Store locally only
            });

            // Build API messages without timestamp field
            const apiMessages = [
                { role: 'system', content: this.basePrompt },
                ...this.messages.slice(-10).map(msg => ({
                    role: msg.role,
                    content: msg.content
                    // Don't include timestamp in API payload
                }))
            ];

            // Call your proxy instead of Cerebras directly
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    options: {
                        model: 'gpt-oss-120b',
                        max_completion_tokens: 2048,
                        temperature: 0.2,
                        top_p: 1
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`API Error: ${data.error || 'Unknown error'}`);
            }

            const assistantMessage = data.reply;
            if (!assistantMessage) {
                throw new Error('No response from assistant');
            }

            this.messages.push({
                role: 'assistant',
                content: assistantMessage,
                timestamp: Date.now()
            });

            await this.saveChatHistory();
            return assistantMessage;

        } catch (error) {
            console.error('[SAFEY] Chatbot error:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    clearHistory() {
        this.messages = [];
    }

    getMessageHistory() {
        return this.messages;
    }

    isReady() {
        return this.isInitialized;
    }
}

// Export singleton instance
const chatbot = new Chatbot();

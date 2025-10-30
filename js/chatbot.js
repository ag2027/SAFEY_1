// SAFEY Chatbot - Cerebras Integration
// Handles chat functionality with safety-focused responses

class Chatbot {
    constructor() {
        this.apiKey = null;
        this.isInitialized = false;
        this.messages = [];
        this.isLoading = false;

        // System prompt for safety-focused responses
        this.basePrompt = `
You are SAFEY's built-in safety assistant.
- Your goal: calmly listen to users describing issues related to domestic violence, fear, or uncertainty.
- You respond supportively and never judgmentally.
- If the user needs help with resources, say "I can help you find nearby shelters and hotlines" and refer them to the 'resources-screen'.
- If they mention risk or fear, refer them to the 'assessment-screen'.
- If they mention a plan or steps, refer to the 'safety-plan-screen'.
- If they ask about hiding, mention 'stealth mode'.
Keep answers under 100 words and emotionally safe.
Never store or transmit any private data.
        `.trim();
    }

    async init() {
        try {
            // Load encrypted API key from settings
            const encryptedKey = await storageUtils.loadData('settings', 'cerebras_api_key');
            if (encryptedKey && encryptedKey.value) {
                this.apiKey = await cryptoUtils.decrypt(encryptedKey.value, 'cerebras_key_salt');
                this.isInitialized = true;
                console.log('[SAFEY] Chatbot initialized with stored API key');
            } else {
                // Set default API key (encrypted and stored for security)
                const defaultApiKey = 'csk-med292jdkdxhyf55r9tr8cytc2e9tydfkpcjxn6d5e4jf6he'; // Cerebras API key
                const encrypted = await cryptoUtils.encrypt(defaultApiKey, 'cerebras_key_salt');
                await storageUtils.saveData('settings', 'cerebras_api_key', { value: encrypted });
                this.apiKey = defaultApiKey;
                this.isInitialized = true;
                console.log('[SAFEY] Chatbot initialized with default API key');
            }

            // Load encrypted chat history
            await this.loadChatHistory();
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

    async setApiKey(apiKey) {
        try {
            // Encrypt and store the API key
            const encrypted = await cryptoUtils.encrypt(apiKey, 'cerebras_key_salt');
            await storageUtils.saveData('settings', 'cerebras_api_key', { value: encrypted });
            this.apiKey = apiKey;
            this.isInitialized = true;
            console.log('[SAFEY] API key updated successfully');
            return true;
        } catch (error) {
            console.error('[SAFEY] Error setting API key:', error);
            return false;
        }
    }

    async sendMessage(userMessage) {
        if (!this.isInitialized || !this.apiKey) {
            throw new Error('Chatbot not initialized. Please set API key in settings.');
        }

        if (this.isLoading) {
            throw new Error('Please wait for the previous message to complete.');
        }

        this.isLoading = true;

        try {
            // Add user message to history
            this.messages.push({
                role: 'user',
                content: userMessage,
                timestamp: Date.now()
            });

            // Prepare messages for API
            const apiMessages = [
                { role: 'system', content: this.basePrompt },
                ...this.messages.slice(-10) // Keep last 10 messages for context
            ];

            // Call Cerebras API
            const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b',
                    messages: apiMessages,
                    max_completion_tokens: 2048,
                    temperature: 0.2,
                    top_p: 1
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`API Error: ${error.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0]?.message?.content;

            if (!assistantMessage) {
                throw new Error('No response from assistant');
            }

            // Add assistant response to history
            this.messages.push({
                role: 'assistant',
                content: assistantMessage,
                timestamp: Date.now()
            });

            // Save chat history after each message
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
        return this.isInitialized && this.apiKey;
    }
}

// Export singleton instance
const chatbot = new Chatbot();

// Encryption utilities for SAFEY
// Uses Web Crypto API with CryptoJS as fallback

class CryptoUtils {
    constructor() {
        this.hasWebCrypto = window.crypto && window.crypto.subtle;
        this.salt = 'SAFEY_v1_salt_2024'; // Static salt for deterministic key derivation
    }

    // Generate a key from password using PBKDF2
    async deriveKey(password) {
        if (this.hasWebCrypto) {
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            const saltBuffer = encoder.encode(this.salt);
            
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveBits', 'deriveKey']
            );
            
            return await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
        } else {
            // Fallback: simple hash for key derivation
            return this.simpleHash(password + this.salt);
        }
    }

    // Encrypt data with Web Crypto API
    async encrypt(data, password = 'default') {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            if (this.hasWebCrypto) {
                const key = await this.deriveKey(password);
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                
                const encryptedBuffer = await window.crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv: iv },
                    key,
                    dataBuffer
                );
                
                // Combine IV and encrypted data
                const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
                combined.set(iv, 0);
                combined.set(new Uint8Array(encryptedBuffer), iv.length);
                
                return this.arrayBufferToBase64(combined);
            } else {
                // Fallback: simple XOR encryption
                return this.xorEncrypt(JSON.stringify(data), password);
            }
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    // Decrypt data with Web Crypto API
    async decrypt(encryptedData, password = 'default') {
        try {
            if (this.hasWebCrypto) {
                const combined = this.base64ToArrayBuffer(encryptedData);
                const iv = combined.slice(0, 12);
                const data = combined.slice(12);
                
                const key = await this.deriveKey(password);
                
                const decryptedBuffer = await window.crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv: iv },
                    key,
                    data
                );
                
                const decoder = new TextDecoder();
                const decryptedText = decoder.decode(decryptedBuffer);
                return JSON.parse(decryptedText);
            } else {
                // Fallback: simple XOR decryption
                const decrypted = this.xorDecrypt(encryptedData, password);
                return JSON.parse(decrypted);
            }
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    // Simple hash function for fallback
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // XOR encryption for fallback
    xorEncrypt(text, key) {
        const keyHash = this.simpleHash(key);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ keyHash.charCodeAt(i % keyHash.length)
            );
        }
        return btoa(result);
    }

    // XOR decryption for fallback
    xorDecrypt(encrypted, key) {
        const text = atob(encrypted);
        const keyHash = this.simpleHash(key);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ keyHash.charCodeAt(i % keyHash.length)
            );
        }
        return result;
    }

    // Helper: ArrayBuffer to Base64
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Helper: Base64 to ArrayBuffer
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    // Hash a PIN for comparison (not reversible)
    async hashPin(pin) {
        if (this.hasWebCrypto) {
            const encoder = new TextEncoder();
            const data = encoder.encode(pin + this.salt);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            return this.arrayBufferToBase64(hashBuffer);
        } else {
            return this.simpleHash(pin + this.salt);
        }
    }
}

// Export singleton
const cryptoUtils = new CryptoUtils();

// Stealth Mode Bundle
// Non-module version for vanilla JS integration
// This file bundles all stealth mode functionality for easy integration

(function(window) {
    'use strict';

    // ===== ENCRYPTION UTIL =====
    class EncryptionUtil {
        constructor() {
            this.hasWebCrypto = typeof crypto !== 'undefined' && crypto.subtle;
            this.algorithm = 'AES-GCM';
            this.keyLength = 256;
            this.iterations = 100000;
        }

        async deriveKey(pin, salt) {
            if (this.hasWebCrypto) {
                const encoder = new TextEncoder();
                const keyMaterial = await crypto.subtle.importKey(
                    'raw',
                    encoder.encode(pin),
                    'PBKDF2',
                    false,
                    ['deriveBits', 'deriveKey']
                );

                return crypto.subtle.deriveKey(
                    {
                        name: 'PBKDF2',
                        salt: salt,
                        iterations: this.iterations,
                        hash: 'SHA-256'
                    },
                    keyMaterial,
                    { name: this.algorithm, length: this.keyLength },
                    true,
                    ['encrypt', 'decrypt']
                );
            } else {
                return this._deriveKeyFallback(pin, salt);
            }
        }

        _deriveKeyFallback(pin, salt) {
            const combined = pin + Array.from(salt).join('');
            let hash = 0;
            for (let i = 0; i < combined.length; i++) {
                hash = ((hash << 5) - hash) + combined.charCodeAt(i);
                hash = hash & hash;
            }
            return new Uint8Array(32).fill(hash);
        }

        async encrypt(data, pin) {
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);

            if (this.hasWebCrypto) {
                const key = await this.deriveKey(pin, salt);
                const encryptedBuffer = await crypto.subtle.encrypt(
                    {
                        name: this.algorithm,
                        iv: iv
                    },
                    key,
                    dataBuffer
                );

                return {
                    ciphertext: this._bufferToBase64(new Uint8Array(encryptedBuffer)),
                    salt: this._bufferToBase64(salt),
                    iv: this._bufferToBase64(iv),
                    algorithm: this.algorithm
                };
            } else {
                return {
                    ciphertext: btoa(data),
                    salt: this._bufferToBase64(salt),
                    iv: this._bufferToBase64(iv),
                    algorithm: 'none'
                };
            }
        }

        async decrypt(encryptedData, pin) {
            const salt = this._base64ToBuffer(encryptedData.salt);
            const iv = this._base64ToBuffer(encryptedData.iv);
            const ciphertext = this._base64ToBuffer(encryptedData.ciphertext);

            if (this.hasWebCrypto && encryptedData.algorithm === this.algorithm) {
                const key = await this.deriveKey(pin, salt);
                const decryptedBuffer = await crypto.subtle.decrypt(
                    {
                        name: this.algorithm,
                        iv: iv
                    },
                    key,
                    ciphertext
                );

                const decoder = new TextDecoder();
                return decoder.decode(decryptedBuffer);
            } else {
                try {
                    return atob(encryptedData.ciphertext);
                } catch {
                    return '';
                }
            }
        }

        async hashPin(pin) {
            if (this.hasWebCrypto) {
                const encoder = new TextEncoder();
                const data = encoder.encode(pin);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                return this._bufferToBase64(new Uint8Array(hashBuffer));
            } else {
                let hash = 0;
                for (let i = 0; i < pin.length; i++) {
                    hash = ((hash << 5) - hash) + pin.charCodeAt(i);
                    hash = hash & hash;
                }
                return hash.toString(16);
            }
        }

        _bufferToBase64(buffer) {
            return btoa(String.fromCharCode.apply(null, buffer));
        }

        _base64ToBuffer(base64) {
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        }
    }

    // Export to window
    window.SAFEY = window.SAFEY || {};
    window.SAFEY.StealthMode = {
        EncryptionUtil: new EncryptionUtil(),
        // Other modules will be added here
        version: '1.0.0'
    };

    console.log('[SAFEY Stealth Mode] Bundle loaded v' + window.SAFEY.StealthMode.version);

})(window);

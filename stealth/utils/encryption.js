// Encryption Utilities for SAFEY Stealth Mode
// Uses Web Crypto API with CryptoJS fallback

class EncryptionUtil {
    constructor() {
        this.hasWebCrypto = typeof crypto !== 'undefined' && crypto.subtle;
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.iterations = 100000; // PBKDF2 iterations
    }

    /**
     * Derive encryption key from PIN using PBKDF2
     * @param {string} pin - User's PIN
     * @param {Uint8Array} salt - Salt for key derivation
     * @returns {Promise<CryptoKey|Uint8Array>} Derived key
     */
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
            // Fallback to CryptoJS
            return this._deriveKeyWithCryptoJS(pin, salt);
        }
    }

    /**
     * Fallback key derivation using CryptoJS
     */
    _deriveKeyWithCryptoJS(pin, salt) {
        if (typeof CryptoJS === 'undefined') {
            console.warn('CryptoJS not available, using simple key derivation');
            // Simple hash-based derivation as last resort
            const combined = pin + Array.from(salt).join('');
            let hash = 0;
            for (let i = 0; i < combined.length; i++) {
                hash = ((hash << 5) - hash) + combined.charCodeAt(i);
                hash = hash & hash;
            }
            return new Uint8Array(32).fill(hash);
        }
        
        const saltHex = CryptoJS.enc.Hex.parse(Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''));
        const key = CryptoJS.PBKDF2(pin, saltHex, {
            keySize: this.keyLength / 32,
            iterations: this.iterations
        });
        return new Uint8Array(key.words.flatMap(w => [
            (w >> 24) & 0xff,
            (w >> 16) & 0xff,
            (w >> 8) & 0xff,
            w & 0xff
        ]));
    }

    /**
     * Encrypt data
     * @param {string} data - Data to encrypt
     * @param {string} pin - PIN for encryption
     * @returns {Promise<Object>} Encrypted data with metadata
     */
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
            // Fallback to CryptoJS
            return this._encryptWithCryptoJS(data, pin, salt, iv);
        }
    }

    /**
     * Fallback encryption using CryptoJS
     */
    _encryptWithCryptoJS(data, pin, salt, iv) {
        if (typeof CryptoJS === 'undefined') {
            console.error('Encryption not available');
            return { ciphertext: btoa(data), salt: '', iv: '', algorithm: 'none' };
        }

        const key = this._deriveKeyWithCryptoJS(pin, salt);
        const keyHex = CryptoJS.enc.Hex.parse(Array.from(key).map(b => b.toString(16).padStart(2, '0')).join(''));
        const ivHex = CryptoJS.enc.Hex.parse(Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''));
        
        const encrypted = CryptoJS.AES.encrypt(data, keyHex, {
            iv: ivHex,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return {
            ciphertext: encrypted.toString(),
            salt: this._bufferToBase64(salt),
            iv: this._bufferToBase64(iv),
            algorithm: 'AES-CBC-CryptoJS'
        };
    }

    /**
     * Decrypt data
     * @param {Object} encryptedData - Encrypted data object
     * @param {string} pin - PIN for decryption
     * @returns {Promise<string>} Decrypted data
     */
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
            // Fallback to CryptoJS
            return this._decryptWithCryptoJS(encryptedData, pin, salt, iv);
        }
    }

    /**
     * Fallback decryption using CryptoJS
     */
    _decryptWithCryptoJS(encryptedData, pin, salt, iv) {
        if (typeof CryptoJS === 'undefined') {
            console.error('Decryption not available');
            try {
                return atob(encryptedData.ciphertext);
            } catch {
                return '';
            }
        }

        const key = this._deriveKeyWithCryptoJS(pin, salt);
        const keyHex = CryptoJS.enc.Hex.parse(Array.from(key).map(b => b.toString(16).padStart(2, '0')).join(''));
        const ivHex = CryptoJS.enc.Hex.parse(Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''));
        
        const decrypted = CryptoJS.AES.decrypt(encryptedData.ciphertext, keyHex, {
            iv: ivHex,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    /**
     * Hash PIN for verification
     * @param {string} pin - PIN to hash
     * @returns {Promise<string>} Hashed PIN
     */
    async hashPin(pin) {
        if (this.hasWebCrypto) {
            const encoder = new TextEncoder();
            const data = encoder.encode(pin);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            return this._bufferToBase64(new Uint8Array(hashBuffer));
        } else if (typeof CryptoJS !== 'undefined') {
            return CryptoJS.SHA256(pin).toString();
        } else {
            // Simple hash fallback
            let hash = 0;
            for (let i = 0; i < pin.length; i++) {
                hash = ((hash << 5) - hash) + pin.charCodeAt(i);
                hash = hash & hash;
            }
            return hash.toString(16);
        }
    }

    /**
     * Convert buffer to base64
     */
    _bufferToBase64(buffer) {
        return btoa(String.fromCharCode.apply(null, buffer));
    }

    /**
     * Convert base64 to buffer
     */
    _base64ToBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
}

// Export singleton instance
const encryptionUtil = new EncryptionUtil();
export default encryptionUtil;

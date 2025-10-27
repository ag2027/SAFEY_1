// Storage Utilities for SAFEY Stealth Mode
// Uses IndexedDB with localStorage fallback

import encryptionUtil from './encryption.js';

class StorageUtil {
    constructor() {
        this.dbName = 'SAFEY_StealthDB';
        this.dbVersion = 1;
        this.storeName = 'stealth_data';
        this.db = null;
        this.hasIndexedDB = typeof indexedDB !== 'undefined';
        this.initialized = false;
    }

    /**
     * Initialize IndexedDB
     */
    async init() {
        if (this.initialized) return;
        
        if (this.hasIndexedDB) {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);

                request.onerror = () => {
                    console.warn('IndexedDB failed, falling back to localStorage');
                    this.hasIndexedDB = false;
                    this.initialized = true;
                    resolve();
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.initialized = true;
                    resolve();
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName, { keyPath: 'key' });
                    }
                };
            });
        } else {
            this.initialized = true;
        }
    }

    /**
     * Save data with encryption
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @param {string} pin - PIN for encryption
     */
    async saveEncrypted(key, data, pin) {
        await this.init();
        const jsonData = JSON.stringify(data);
        const encrypted = await encryptionUtil.encrypt(jsonData, pin);
        
        if (this.hasIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put({ key, value: encrypted });

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to localStorage
            localStorage.setItem(`safey_stealth_${key}`, JSON.stringify(encrypted));
        }
    }

    /**
     * Load and decrypt data
     * @param {string} key - Storage key
     * @param {string} pin - PIN for decryption
     * @returns {Promise<any>} Decrypted data
     */
    async loadEncrypted(key, pin) {
        await this.init();
        
        let encrypted;
        if (this.hasIndexedDB && this.db) {
            encrypted = await new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);

                request.onsuccess = () => {
                    resolve(request.result ? request.result.value : null);
                };
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to localStorage
            const stored = localStorage.getItem(`safey_stealth_${key}`);
            encrypted = stored ? JSON.parse(stored) : null;
        }

        if (!encrypted) return null;

        try {
            const decrypted = await encryptionUtil.decrypt(encrypted, pin);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    /**
     * Save data without encryption
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     */
    async save(key, data) {
        await this.init();
        
        if (this.hasIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put({ key, value: data });

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } else {
            localStorage.setItem(`safey_stealth_${key}`, JSON.stringify(data));
        }
    }

    /**
     * Load data without decryption
     * @param {string} key - Storage key
     * @returns {Promise<any>} Stored data
     */
    async load(key) {
        await this.init();
        
        if (this.hasIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);

                request.onsuccess = () => {
                    resolve(request.result ? request.result.value : null);
                };
                request.onerror = () => reject(request.error);
            });
        } else {
            const stored = localStorage.getItem(`safey_stealth_${key}`);
            return stored ? JSON.parse(stored) : null;
        }
    }

    /**
     * Delete data
     * @param {string} key - Storage key
     */
    async delete(key) {
        await this.init();
        
        if (this.hasIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(key);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } else {
            localStorage.removeItem(`safey_stealth_${key}`);
        }
    }

    /**
     * Clear all stealth data
     */
    async clearAll() {
        await this.init();
        
        if (this.hasIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } else {
            // Clear localStorage items with safey_stealth_ prefix
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('safey_stealth_')) {
                    localStorage.removeItem(key);
                }
            });
        }
    }
}

// Export singleton instance
const storageUtil = new StorageUtil();
export default storageUtil;

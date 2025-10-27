// Storage utilities for SAFEY
// Uses IndexedDB with localStorage as fallback

class StorageUtils {
    constructor() {
        this.dbName = 'SAFEY_DB';
        this.dbVersion = 1;
        this.db = null;
        this.hasIndexedDB = 'indexedDB' in window;
        this.initDB();
    }

    // Initialize IndexedDB
    async initDB() {
        if (!this.hasIndexedDB) {
            console.log('IndexedDB not available, using localStorage fallback');
            return;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                this.hasIndexedDB = false;
                resolve();
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains('events')) {
                    const eventStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
                    eventStore.createIndex('timestamp', 'timestamp', { unique: false });
                    eventStore.createIndex('type', 'type', { unique: false });
                }
                if (!db.objectStoreNames.contains('snapshots')) {
                    db.createObjectStore('snapshots', { keyPath: 'url' });
                }
            };
        });
    }

    // Save data to IndexedDB or localStorage
    async saveData(storeName, key, value) {
        if (this.hasIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const data = typeof value === 'object' && !Array.isArray(value) && value.key === undefined
                    ? { key, ...value }
                    : { key, value };
                
                const request = store.put(data);

                request.onsuccess = () => resolve(true);
                request.onerror = () => {
                    console.error('IndexedDB save error:', request.error);
                    this.saveToLocalStorage(storeName, key, value);
                    resolve(false);
                };
            });
        } else {
            this.saveToLocalStorage(storeName, key, value);
            return Promise.resolve(true);
        }
    }

    // Load data from IndexedDB or localStorage
    async loadData(storeName, key) {
        if (this.hasIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(key);

                request.onsuccess = () => {
                    const result = request.result;
                    if (result) {
                        resolve(result.value !== undefined ? result.value : result);
                    } else {
                        // Fallback to localStorage
                        resolve(this.loadFromLocalStorage(storeName, key));
                    }
                };

                request.onerror = () => {
                    console.error('IndexedDB load error:', request.error);
                    resolve(this.loadFromLocalStorage(storeName, key));
                };
            });
        } else {
            return Promise.resolve(this.loadFromLocalStorage(storeName, key));
        }
    }

    // Delete data from IndexedDB or localStorage
    async deleteData(storeName, key) {
        if (this.hasIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(key);

                request.onsuccess = () => resolve(true);
                request.onerror = () => {
                    console.error('IndexedDB delete error:', request.error);
                    this.deleteFromLocalStorage(storeName, key);
                    resolve(false);
                };
            });
        } else {
            this.deleteFromLocalStorage(storeName, key);
            return Promise.resolve(true);
        }
    }

    // Get all events from IndexedDB or localStorage
    async getAllEvents() {
        if (this.hasIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['events'], 'readonly');
                const store = transaction.objectStore('events');
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result || []);
                };

                request.onerror = () => {
                    console.error('IndexedDB getAllEvents error:', request.error);
                    resolve(this.loadFromLocalStorage('events', 'all') || []);
                };
            });
        } else {
            return Promise.resolve(this.loadFromLocalStorage('events', 'all') || []);
        }
    }

    // Add event to IndexedDB or localStorage
    async addEvent(event) {
        if (this.hasIndexedDB && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['events'], 'readwrite');
                const store = transaction.objectStore('events');
                const request = store.add(event);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => {
                    console.error('IndexedDB addEvent error:', request.error);
                    this.addEventToLocalStorage(event);
                    resolve(null);
                };
            });
        } else {
            this.addEventToLocalStorage(event);
            return Promise.resolve(Date.now());
        }
    }

    // Clear all data
    async clearAll() {
        if (this.hasIndexedDB && this.db) {
            const stores = ['settings', 'events', 'snapshots'];
            for (const storeName of stores) {
                await new Promise((resolve) => {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => resolve();
                });
            }
        }
        
        // Also clear localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('safey_')) {
                localStorage.removeItem(key);
            }
        });
    }

    // LocalStorage fallback methods
    saveToLocalStorage(storeName, key, value) {
        try {
            const fullKey = `safey_${storeName}_${key}`;
            localStorage.setItem(fullKey, JSON.stringify(value));
        } catch (error) {
            console.error('localStorage save error:', error);
        }
    }

    loadFromLocalStorage(storeName, key) {
        try {
            const fullKey = `safey_${storeName}_${key}`;
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('localStorage load error:', error);
            return null;
        }
    }

    deleteFromLocalStorage(storeName, key) {
        try {
            const fullKey = `safey_${storeName}_${key}`;
            localStorage.removeItem(fullKey);
        } catch (error) {
            console.error('localStorage delete error:', error);
        }
    }

    addEventToLocalStorage(event) {
        try {
            const events = this.loadFromLocalStorage('events', 'all') || [];
            events.push({ ...event, id: Date.now() });
            // Keep only last 100 events
            if (events.length > 100) {
                events.shift();
            }
            this.saveToLocalStorage('events', 'all', events);
        } catch (error) {
            console.error('localStorage addEvent error:', error);
        }
    }
}

// Export singleton
const storageUtils = new StorageUtils();

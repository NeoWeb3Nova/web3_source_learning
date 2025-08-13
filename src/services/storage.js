export var StorageType;
(function (StorageType) {
    StorageType["LOCAL"] = "localStorage";
    StorageType["SESSION"] = "sessionStorage";
})(StorageType || (StorageType = {}));
export var StorageKey;
(function (StorageKey) {
    StorageKey["VOCABULARY_DATA"] = "vocabulary_data";
    StorageKey["VOCABULARY_FAVORITES"] = "vocabulary_favorites";
    StorageKey["VOCABULARY_FILTER"] = "vocabulary_filter";
    StorageKey["VOCABULARY_SORT"] = "vocabulary_sort";
    StorageKey["USER_PROGRESS"] = "user_progress";
    StorageKey["DAILY_STATS"] = "daily_stats";
    StorageKey["ACHIEVEMENTS"] = "achievements";
    StorageKey["STUDY_SESSIONS"] = "study_sessions";
    StorageKey["LEARNING_GOALS"] = "learning_goals";
    StorageKey["USER_SETTINGS"] = "user_settings";
    StorageKey["THEME_MODE"] = "theme_mode";
    StorageKey["LANGUAGE"] = "language";
    StorageKey["APP_STATE"] = "app_state";
    StorageKey["LAST_SYNC_TIME"] = "last_sync_time";
    StorageKey["FIRST_LAUNCH"] = "first_launch";
    StorageKey["VOCABULARY_CACHE"] = "vocabulary_cache";
    StorageKey["AUDIO_CACHE"] = "audio_cache";
    StorageKey["API_CACHE"] = "api_cache";
})(StorageKey || (StorageKey = {}));
const DEFAULT_CONFIG = {
    type: StorageType.LOCAL,
    compress: false,
    encrypt: false,
};
const DATA_VERSION = '1.0.0';
export class StorageService {
    constructor(config = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "storage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.storage = this.config.type === StorageType.LOCAL
            ? window.localStorage
            : window.sessionStorage;
    }
    isStorageAvailable() {
        try {
            const testKey = '__storage_test__';
            this.storage.setItem(testKey, 'test');
            this.storage.removeItem(testKey);
            return true;
        }
        catch {
            return false;
        }
    }
    serialize(data) {
        try {
            const item = {
                data,
                timestamp: Date.now(),
                version: DATA_VERSION,
            };
            if (this.config.ttl) {
                item.expiresAt = Date.now() + this.config.ttl;
            }
            let serialized = JSON.stringify(item);
            if (this.config.compress) {
            }
            if (this.config.encrypt) {
            }
            return serialized;
        }
        catch (error) {
            console.error('Failed to serialize data:', error);
            throw new Error('Data serialization failed');
        }
    }
    deserialize(serialized) {
        try {
            if (this.config.encrypt) {
            }
            if (this.config.compress) {
            }
            const item = JSON.parse(serialized);
            if (item.expiresAt && Date.now() > item.expiresAt) {
                return null;
            }
            if (item.version !== DATA_VERSION) {
                console.warn(`Data version mismatch: ${item.version} vs ${DATA_VERSION}`);
            }
            return item.data;
        }
        catch (error) {
            console.error('Failed to deserialize data:', error);
            return null;
        }
    }
    setItem(key, value) {
        if (!this.isStorageAvailable()) {
            console.warn('Storage is not available');
            return false;
        }
        try {
            const serialized = this.serialize(value);
            this.storage.setItem(key, serialized);
            return true;
        }
        catch (error) {
            console.error(`Failed to set item ${key}:`, error);
            return false;
        }
    }
    getItem(key) {
        if (!this.isStorageAvailable()) {
            console.warn('Storage is not available');
            return null;
        }
        try {
            const serialized = this.storage.getItem(key);
            if (serialized === null) {
                return null;
            }
            return this.deserialize(serialized);
        }
        catch (error) {
            console.error(`Failed to get item ${key}:`, error);
            return null;
        }
    }
    removeItem(key) {
        if (!this.isStorageAvailable()) {
            console.warn('Storage is not available');
            return false;
        }
        try {
            this.storage.removeItem(key);
            return true;
        }
        catch (error) {
            console.error(`Failed to remove item ${key}:`, error);
            return false;
        }
    }
    clear() {
        if (!this.isStorageAvailable()) {
            console.warn('Storage is not available');
            return false;
        }
        try {
            this.storage.clear();
            return true;
        }
        catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
    getAllKeys() {
        if (!this.isStorageAvailable()) {
            return [];
        }
        const keys = [];
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key) {
                keys.push(key);
            }
        }
        return keys;
    }
    getStorageInfo() {
        if (!this.isStorageAvailable()) {
            return { used: 0, available: 0, total: 0, usage: 0 };
        }
        let used = 0;
        const keys = this.getAllKeys();
        keys.forEach(key => {
            const value = this.storage.getItem(key);
            if (value) {
                used += value.length;
            }
        });
        const total = 5 * 1024 * 1024;
        const available = total - used;
        const usage = (used / total) * 100;
        return {
            used,
            available,
            total,
            usage: Math.round(usage * 100) / 100,
        };
    }
    setMultiple(items) {
        try {
            items.forEach(({ key, value }) => {
                this.setItem(key, value);
            });
            return true;
        }
        catch (error) {
            console.error('Failed to set multiple items:', error);
            return false;
        }
    }
    getMultiple(keys) {
        const result = {};
        keys.forEach(key => {
            result[key] = this.getItem(key);
        });
        return result;
    }
    hasItem(key) {
        return this.getItem(key) !== null;
    }
    getItemSize(key) {
        const value = this.storage.getItem(key);
        return value ? value.length : 0;
    }
    cleanExpired() {
        let cleanedCount = 0;
        const keys = this.getAllKeys();
        keys.forEach(key => {
            const serialized = this.storage.getItem(key);
            if (serialized) {
                try {
                    const item = JSON.parse(serialized);
                    if (item.expiresAt && Date.now() > item.expiresAt) {
                        this.storage.removeItem(key);
                        cleanedCount++;
                    }
                }
                catch {
                }
            }
        });
        return cleanedCount;
    }
    exportData() {
        const data = {};
        const keys = this.getAllKeys();
        keys.forEach(key => {
            const value = this.storage.getItem(key);
            if (value) {
                try {
                    data[key] = JSON.parse(value);
                }
                catch {
                    data[key] = value;
                }
            }
        });
        return data;
    }
    importData(data) {
        try {
            Object.entries(data).forEach(([key, value]) => {
                const serialized = typeof value === 'string' ? value : JSON.stringify(value);
                this.storage.setItem(key, serialized);
            });
            return true;
        }
        catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}
export const storageService = new StorageService();
export const sessionStorageService = new StorageService({
    type: StorageType.SESSION,
});
export const secureStorageService = new StorageService({
    type: StorageType.LOCAL,
    encrypt: true,
});
export const StorageUtils = {
    checkQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            return navigator.storage.estimate().then(estimate => ({
                usage: estimate.usage || 0,
                quota: estimate.quota || 0,
            }));
        }
        return Promise.resolve({ usage: 0, quota: 5 * 1024 * 1024 });
    },
    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
    },
    generateKey(prefix, id) {
        return `${prefix}_${id}`;
    },
    parseKey(key) {
        const parts = key.split('_');
        if (parts.length >= 2) {
            return {
                prefix: parts[0],
                id: parts.slice(1).join('_'),
            };
        }
        return null;
    },
};

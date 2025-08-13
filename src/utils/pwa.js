export const unregisterServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
                console.log('Service Worker unregistered:', registration);
            }
        } catch (error) {
            console.error('Service Worker unregistration failed:', error);
        }
    }
};

export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered successfully:', registration);
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateAvailableNotification();
                        }
                    });
                }
            });
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
        catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
};
const showUpdateAvailableNotification = () => {
    if (window.confirm('应用有新版本可用，是否立即更新？')) {
        window.location.reload();
    }
};
export const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
};
export const canInstallPWA = () => {
    return 'beforeinstallprompt' in window;
};
class PWAInstallManager {
    constructor() {
        Object.defineProperty(this, "deferredPrompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "installButton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.init();
    }
    init() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
            this.deferredPrompt = null;
        });
    }
    showInstallButton() {
        this.installButton = document.getElementById('pwa-install-button');
        if (this.installButton) {
            this.installButton.style.display = 'block';
            this.installButton.addEventListener('click', this.handleInstallClick.bind(this));
        }
    }
    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }
    }
    async handleInstallClick() {
        if (!this.deferredPrompt)
            return;
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        else {
            console.log('User dismissed the install prompt');
        }
        this.deferredPrompt = null;
        this.hideInstallButton();
    }
    triggerInstall() {
        this.handleInstallClick();
    }
}
export const pwaInstallManager = new PWAInstallManager();
export class NetworkStatusManager {
    constructor() {
        Object.defineProperty(this, "isOnline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: navigator.onLine
        });
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.init();
    }
    init() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyCallbacks();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyCallbacks();
        });
    }
    notifyCallbacks() {
        this.callbacks.forEach(callback => callback(this.isOnline));
    }
    getStatus() {
        return this.isOnline;
    }
    onStatusChange(callback) {
        this.callbacks.push(callback);
    }
    removeStatusListener(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }
}
export const networkStatusManager = new NetworkStatusManager();
export const requestBackgroundSync = async (tag) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(tag);
            console.log('Background sync registered:', tag);
        }
        catch (error) {
            console.error('Background sync registration failed:', error);
        }
    }
};
export class PushNotificationManager {
    constructor() {
        Object.defineProperty(this, "registration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    async init() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                this.registration = await navigator.serviceWorker.ready;
            }
            catch (error) {
                console.error('Failed to get service worker registration:', error);
            }
        }
    }
    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            return permission;
        }
        return 'denied';
    }
    async subscribe() {
        if (!this.registration) {
            console.error('Service worker not registered');
            return null;
        }
        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
            });
            console.log('Push subscription:', subscription);
            return subscription;
        }
        catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            return null;
        }
    }
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    async showNotification(title, options) {
        if (!this.registration) {
            console.error('Service worker not registered');
            return;
        }
        try {
            await this.registration.showNotification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                vibrate: [100, 50, 100],
                ...options
            });
        }
        catch (error) {
            console.error('Failed to show notification:', error);
        }
    }
}
export const pushNotificationManager = new PushNotificationManager();
export class OfflineStorageManager {
    constructor() {
        Object.defineProperty(this, "dbName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'web3-defi-vocab-db'
        });
        Object.defineProperty(this, "dbVersion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = () => {
                console.error('Failed to open IndexedDB');
                reject(request.error);
            };
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB opened successfully');
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('vocabulary')) {
                    const vocabularyStore = db.createObjectStore('vocabulary', { keyPath: 'id' });
                    vocabularyStore.createIndex('category', 'category', { unique: false });
                    vocabularyStore.createIndex('difficulty', 'difficulty', { unique: false });
                }
                if (!db.objectStoreNames.contains('progress')) {
                    db.createObjectStore('progress', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }
    async storeData(storeName, data) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async getData(storeName, key) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    async getAllData(storeName) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}
export const offlineStorageManager = new OfflineStorageManager();

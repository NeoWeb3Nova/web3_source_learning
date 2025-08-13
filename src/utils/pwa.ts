/**
 * PWA 功能工具函数
 */

// 注册 Service Worker
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      
      console.log('Service Worker registered successfully:', registration);
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本可用，提示用户刷新
              showUpdateAvailableNotification();
            }
          });
        }
      });
      
      // 监听控制器变化
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// 显示更新可用通知
const showUpdateAvailableNotification = (): void => {
  if (window.confirm('应用有新版本可用，是否立即更新？')) {
    window.location.reload();
  }
};

// 检查是否为PWA环境
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// 检查是否支持安装PWA
export const canInstallPWA = (): boolean => {
  return 'beforeinstallprompt' in window;
};

// PWA安装提示管理
class PWAInstallManager {
  private deferredPrompt: any = null;
  private installButton: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // 监听安装提示事件
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // 监听安装完成事件
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  private showInstallButton(): void {
    this.installButton = document.getElementById('pwa-install-button');
    if (this.installButton) {
      this.installButton.style.display = 'block';
      this.installButton.addEventListener('click', this.handleInstallClick.bind(this));
    }
  }

  private hideInstallButton(): void {
    if (this.installButton) {
      this.installButton.style.display = 'none';
    }
  }

  private async handleInstallClick(): Promise<void> {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    this.deferredPrompt = null;
    this.hideInstallButton();
  }

  public triggerInstall(): void {
    this.handleInstallClick();
  }
}

// 创建全局安装管理器实例
export const pwaInstallManager = new PWAInstallManager();

// 网络状态管理
export class NetworkStatusManager {
  private isOnline: boolean = navigator.onLine;
  private callbacks: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.init();
  }

  private init(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyCallbacks();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyCallbacks();
    });
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.isOnline));
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  public onStatusChange(callback: (isOnline: boolean) => void): void {
    this.callbacks.push(callback);
  }

  public removeStatusListener(callback: (isOnline: boolean) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }
}

// 创建全局网络状态管理器实例
export const networkStatusManager = new NetworkStatusManager();

// 后台同步管理
export const requestBackgroundSync = async (tag: string): Promise<void> => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log('Background sync registered:', tag);
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
};

// 推送通知管理
export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;

  async init(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.ready;
      } catch (error) {
        console.error('Failed to get service worker registration:', error);
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    }
    return 'denied';
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service worker not registered');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // 这里应该是你的VAPID公钥
          'YOUR_VAPID_PUBLIC_KEY'
        )
      });

      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
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

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
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
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }
}

// 创建全局推送通知管理器实例
export const pushNotificationManager = new PushNotificationManager();

// 离线存储管理
export class OfflineStorageManager {
  private dbName = 'web3-defi-vocab-db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
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
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
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

  async storeData(storeName: string, data: any): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getData(storeName: string, key: string): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllData(storeName: string): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// 创建全局离线存储管理器实例
export const offlineStorageManager = new OfflineStorageManager();
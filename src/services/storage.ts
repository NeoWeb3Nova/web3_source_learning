/**
 * 本地存储服务
 * 提供统一的数据持久化接口，支持LocalStorage和SessionStorage
 */

/**
 * 存储类型枚举
 */
export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
}

/**
 * 存储键枚举
 */
export enum StorageKey {
  // 词汇相关
  VOCABULARY_DATA = 'vocabulary_data',
  VOCABULARY_FAVORITES = 'vocabulary_favorites',
  VOCABULARY_FILTER = 'vocabulary_filter',
  VOCABULARY_SORT = 'vocabulary_sort',
  
  // 进度相关
  USER_PROGRESS = 'user_progress',
  DAILY_STATS = 'daily_stats',
  ACHIEVEMENTS = 'achievements',
  STUDY_SESSIONS = 'study_sessions',
  LEARNING_GOALS = 'learning_goals',
  
  // 设置相关
  USER_SETTINGS = 'user_settings',
  THEME_MODE = 'theme_mode',
  LANGUAGE = 'language',
  
  // 应用状态
  APP_STATE = 'app_state',
  LAST_SYNC_TIME = 'last_sync_time',
  FIRST_LAUNCH = 'first_launch',
  
  // 缓存相关
  VOCABULARY_CACHE = 'vocabulary_cache',
  AUDIO_CACHE = 'audio_cache',
  API_CACHE = 'api_cache',
}

/**
 * 存储配置接口
 */
interface StorageConfig {
  /** 存储类型 */
  type: StorageType;
  /** 数据压缩 */
  compress: boolean;
  /** 数据加密 */
  encrypt: boolean;
  /** 过期时间（毫秒） */
  ttl?: number;
}

/**
 * 存储项接口
 */
interface StorageItem<T = any> {
  /** 数据内容 */
  data: T;
  /** 创建时间戳 */
  timestamp: number;
  /** 过期时间戳 */
  expiresAt?: number;
  /** 数据版本 */
  version: string;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: StorageConfig = {
  type: StorageType.LOCAL,
  compress: false,
  encrypt: false,
};

/**
 * 数据版本
 */
const DATA_VERSION = '1.0.0';

/**
 * 本地存储服务类
 */
export class StorageService {
  private config: StorageConfig;
  private storage: Storage;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storage = this.config.type === StorageType.LOCAL 
      ? window.localStorage 
      : window.sessionStorage;
  }

  /**
   * 检查存储是否可用
   */
  private isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 序列化数据
   */
  private serialize<T>(data: T): string {
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        version: DATA_VERSION,
      };

      if (this.config.ttl) {
        item.expiresAt = Date.now() + this.config.ttl;
      }

      let serialized = JSON.stringify(item);

      // TODO: 实现数据压缩
      if (this.config.compress) {
        // 可以使用 lz-string 等库进行压缩
      }

      // TODO: 实现数据加密
      if (this.config.encrypt) {
        // 可以使用 crypto-js 等库进行加密
      }

      return serialized;
    } catch (error) {
      console.error('Failed to serialize data:', error);
      throw new Error('Data serialization failed');
    }
  }

  /**
   * 反序列化数据
   */
  private deserialize<T>(serialized: string): T | null {
    try {
      // TODO: 实现数据解密
      if (this.config.encrypt) {
        // 解密逻辑
      }

      // TODO: 实现数据解压缩
      if (this.config.compress) {
        // 解压缩逻辑
      }

      const item: StorageItem<T> = JSON.parse(serialized);

      // 检查数据是否过期
      if (item.expiresAt && Date.now() > item.expiresAt) {
        return null;
      }

      // 检查数据版本兼容性
      if (item.version !== DATA_VERSION) {
        console.warn(`Data version mismatch: ${item.version} vs ${DATA_VERSION}`);
        // 可以在这里实现数据迁移逻辑
      }

      return item.data;
    } catch (error) {
      console.error('Failed to deserialize data:', error);
      return null;
    }
  }

  /**
   * 存储数据
   */
  setItem<T>(key: StorageKey, value: T): boolean {
    if (!this.isStorageAvailable()) {
      console.warn('Storage is not available');
      return false;
    }

    try {
      const serialized = this.serialize(value);
      this.storage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      return false;
    }
  }

  /**
   * 获取数据
   */
  getItem<T>(key: StorageKey): T | null {
    if (!this.isStorageAvailable()) {
      console.warn('Storage is not available');
      return null;
    }

    try {
      const serialized = this.storage.getItem(key);
      if (serialized === null) {
        return null;
      }

      return this.deserialize<T>(serialized);
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  /**
   * 删除数据
   */
  removeItem(key: StorageKey): boolean {
    if (!this.isStorageAvailable()) {
      console.warn('Storage is not available');
      return false;
    }

    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      return false;
    }
  }

  /**
   * 清空所有数据
   */
  clear(): boolean {
    if (!this.isStorageAvailable()) {
      console.warn('Storage is not available');
      return false;
    }

    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * 获取所有键
   */
  getAllKeys(): string[] {
    if (!this.isStorageAvailable()) {
      return [];
    }

    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * 获取存储使用情况
   */
  getStorageInfo(): {
    used: number;
    available: number;
    total: number;
    usage: number;
  } {
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

    // 估算总容量（通常为5MB）
    const total = 5 * 1024 * 1024; // 5MB in bytes
    const available = total - used;
    const usage = (used / total) * 100;

    return {
      used,
      available,
      total,
      usage: Math.round(usage * 100) / 100,
    };
  }

  /**
   * 批量设置数据
   */
  setMultiple(items: Array<{ key: StorageKey; value: any }>): boolean {
    try {
      items.forEach(({ key, value }) => {
        this.setItem(key, value);
      });
      return true;
    } catch (error) {
      console.error('Failed to set multiple items:', error);
      return false;
    }
  }

  /**
   * 批量获取数据
   */
  getMultiple<T>(keys: StorageKey[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    
    keys.forEach(key => {
      result[key] = this.getItem<T>(key);
    });

    return result;
  }

  /**
   * 检查键是否存在
   */
  hasItem(key: StorageKey): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * 获取数据大小（字节）
   */
  getItemSize(key: StorageKey): number {
    const value = this.storage.getItem(key);
    return value ? value.length : 0;
  }

  /**
   * 清理过期数据
   */
  cleanExpired(): number {
    let cleanedCount = 0;
    const keys = this.getAllKeys();

    keys.forEach(key => {
      const serialized = this.storage.getItem(key);
      if (serialized) {
        try {
          const item: StorageItem = JSON.parse(serialized);
          if (item.expiresAt && Date.now() > item.expiresAt) {
            this.storage.removeItem(key);
            cleanedCount++;
          }
        } catch {
          // 忽略解析错误的项目
        }
      }
    });

    return cleanedCount;
  }

  /**
   * 导出所有数据
   */
  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    const keys = this.getAllKeys();

    keys.forEach(key => {
      const value = this.storage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });

    return data;
  }

  /**
   * 导入数据
   */
  importData(data: Record<string, any>): boolean {
    try {
      Object.entries(data).forEach(([key, value]) => {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        this.storage.setItem(key, serialized);
      });
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

/**
 * 默认存储服务实例
 */
export const storageService = new StorageService();

/**
 * 会话存储服务实例
 */
export const sessionStorageService = new StorageService({
  type: StorageType.SESSION,
});

/**
 * 加密存储服务实例
 */
export const secureStorageService = new StorageService({
  type: StorageType.LOCAL,
  encrypt: true,
});

/**
 * 存储工具函数
 */
export const StorageUtils = {
  /**
   * 检查存储配额
   */
  checkQuota(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate().then(estimate => ({
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      }));
    }
    
    // 降级处理
    return Promise.resolve({ usage: 0, quota: 5 * 1024 * 1024 });
  },

  /**
   * 格式化存储大小
   */
  formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  },

  /**
   * 生成存储键
   */
  generateKey(prefix: string, id: string): string {
    return `${prefix}_${id}`;
  },

  /**
   * 解析存储键
   */
  parseKey(key: string): { prefix: string; id: string } | null {
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
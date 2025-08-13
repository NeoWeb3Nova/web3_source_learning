// 性能优化配置

export interface PerformanceConfig {
  // 代码分割配置
  codeSplitting: {
    enabled: boolean;
    chunkSize: number; // KB
    preloadDelay: number; // ms
  };

  // 图片优化配置
  images: {
    lazyLoading: boolean;
    webpSupport: boolean;
    placeholder: string;
    quality: number;
    maxWidth: number;
    maxHeight: number;
  };

  // 音频优化配置
  audio: {
    preloadEnabled: boolean;
    cacheSize: number; // MB
    maxCacheItems: number;
    preloadStrategy: 'metadata' | 'auto' | 'none';
  };

  // 虚拟滚动配置
  virtualScroll: {
    enabled: boolean;
    itemHeight: number;
    overscan: number;
    threshold: number; // 启用虚拟滚动的最小项目数
  };

  // 防抖节流配置
  debounce: {
    search: number;
    input: number;
    scroll: number;
    resize: number;
  };

  // 缓存配置
  cache: {
    maxAge: number; // ms
    maxSize: number; // MB
    strategy: 'lru' | 'fifo' | 'lfu';
  };

  // 监控配置
  monitoring: {
    enabled: boolean;
    sampleRate: number; // 0-1
    reportInterval: number; // ms
  };
}

// 默认配置
export const defaultPerformanceConfig: PerformanceConfig = {
  codeSplitting: {
    enabled: true,
    chunkSize: 500, // 500KB
    preloadDelay: 1000, // 1秒后预加载
  },

  images: {
    lazyLoading: true,
    webpSupport: true,
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
  },

  audio: {
    preloadEnabled: true,
    cacheSize: 50, // 50MB
    maxCacheItems: 100,
    preloadStrategy: 'metadata',
  },

  virtualScroll: {
    enabled: true,
    itemHeight: 60,
    overscan: 5,
    threshold: 50, // 超过50项启用虚拟滚动
  },

  debounce: {
    search: 300,
    input: 150,
    scroll: 16, // 60fps
    resize: 100,
  },

  cache: {
    maxAge: 5 * 60 * 1000, // 5分钟
    maxSize: 100, // 100MB
    strategy: 'lru',
  },

  monitoring: {
    enabled: process.env.NODE_ENV === 'development',
    sampleRate: 0.1, // 10%采样率
    reportInterval: 30000, // 30秒
  },
};

// 根据设备性能调整配置
export const getOptimizedConfig = (): PerformanceConfig => {
  const config = { ...defaultPerformanceConfig };

  // 检测设备性能
  const deviceMemory = (navigator as any).deviceMemory || 4; // GB
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const connection = (navigator as any).connection;

  // 低端设备优化
  if (deviceMemory <= 2 || hardwareConcurrency <= 2) {
    config.audio.cacheSize = 20; // 减少音频缓存
    config.audio.maxCacheItems = 50;
    config.images.quality = 60; // 降低图片质量
    config.virtualScroll.threshold = 20; // 更早启用虚拟滚动
    config.cache.maxSize = 50; // 减少缓存大小
  }

  // 慢网络优化
  if (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) {
    config.images.lazyLoading = true;
    config.images.quality = 50;
    config.audio.preloadEnabled = false; // 禁用音频预加载
    config.codeSplitting.preloadDelay = 3000; // 延迟预加载
  }

  // 移动设备优化
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    config.debounce.scroll = 32; // 30fps on mobile
    config.virtualScroll.overscan = 3; // 减少预渲染项目
  }

  return config;
};

// 性能配置管理器
class PerformanceConfigManager {
  private config: PerformanceConfig;
  private listeners: Array<(config: PerformanceConfig) => void> = [];

  constructor() {
    this.config = getOptimizedConfig();
  }

  getConfig(): PerformanceConfig {
    return this.config;
  }

  updateConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates };
    this.notifyListeners();
  }

  subscribe(listener: (config: PerformanceConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }

  // 根据运行时性能动态调整配置
  adaptToPerformance(metrics: {
    memoryUsage?: number;
    renderTime?: number;
    networkSpeed?: number;
  }): void {
    const updates: Partial<PerformanceConfig> = {};

    // 内存使用率过高
    if (metrics.memoryUsage && metrics.memoryUsage > 0.8) {
      updates.cache = {
        ...this.config.cache,
        maxSize: this.config.cache.maxSize * 0.7,
      };
      updates.audio = {
        ...this.config.audio,
        cacheSize: this.config.audio.cacheSize * 0.7,
        maxCacheItems: Math.floor(this.config.audio.maxCacheItems * 0.7),
      };
    }

    // 渲染时间过长
    if (metrics.renderTime && metrics.renderTime > 16) {
      updates.virtualScroll = {
        ...this.config.virtualScroll,
        threshold: Math.max(20, this.config.virtualScroll.threshold * 0.7),
      };
      updates.debounce = {
        ...this.config.debounce,
        input: Math.max(100, this.config.debounce.input * 1.5),
        scroll: Math.max(16, this.config.debounce.scroll * 1.2),
      };
    }

    // 网络速度慢
    if (metrics.networkSpeed && metrics.networkSpeed < 1) { // < 1Mbps
      updates.images = {
        ...this.config.images,
        quality: Math.max(30, this.config.images.quality * 0.8),
      };
      updates.audio = {
        ...this.config.audio,
        preloadEnabled: false,
      };
    }

    if (Object.keys(updates).length > 0) {
      this.updateConfig(updates);
    }
  }
}

// 全局配置管理器实例
export const performanceConfigManager = new PerformanceConfigManager();

// React Hook for using performance config
export const usePerformanceConfig = () => {
  const [config, setConfig] = React.useState(performanceConfigManager.getConfig());

  React.useEffect(() => {
    return performanceConfigManager.subscribe(setConfig);
  }, []);

  return config;
};

// 导入React用于Hook
import React from 'react';
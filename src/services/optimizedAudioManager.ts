// 优化的音频管理器，支持预加载和缓存

interface AudioCacheItem {
  audio: HTMLAudioElement;
  url: string;
  lastUsed: number;
  preloaded: boolean;
  size?: number;
}

interface AudioPreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  preloadStrategy?: 'metadata' | 'auto' | 'none';
  maxCacheSize?: number; // MB
  maxCacheItems?: number;
}

class OptimizedAudioManager {
  private cache = new Map<string, AudioCacheItem>();
  private preloadQueue: Array<{ url: string; options: AudioPreloadOptions }> = [];
  private isPreloading = false;
  private maxCacheSize: number; // bytes
  private maxCacheItems: number;
  private currentCacheSize = 0;

  constructor(options: AudioPreloadOptions = {}) {
    this.maxCacheSize = (options.maxCacheSize || 50) * 1024 * 1024; // 50MB default
    this.maxCacheItems = options.maxCacheItems || 100;
    
    // 监听内存压力
    this.setupMemoryPressureHandling();
  }

  /**
   * 预加载音频文件
   */
  async preloadAudio(
    urls: string | string[],
    options: AudioPreloadOptions = {}
  ): Promise<void> {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    
    // 添加到预加载队列
    urlArray.forEach(url => {
      if (!this.cache.has(url)) {
        this.preloadQueue.push({ url, options });
      }
    });

    // 按优先级排序
    this.preloadQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.options.priority || 'medium'] - 
             priorityOrder[a.options.priority || 'medium'];
    });

    // 开始预加载
    if (!this.isPreloading) {
      await this.processPreloadQueue();
    }
  }

  /**
   * 处理预加载队列
   */
  private async processPreloadQueue(): Promise<void> {
    if (this.preloadQueue.length === 0) {
      this.isPreloading = false;
      return;
    }

    this.isPreloading = true;
    const batchSize = 3; // 并发加载数量

    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, batchSize);
      
      await Promise.allSettled(
        batch.map(({ url, options }) => this.loadAudioFile(url, options))
      );

      // 避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isPreloading = false;
  }

  /**
   * 加载单个音频文件
   */
  private async loadAudioFile(
    url: string,
    options: AudioPreloadOptions = {}
  ): Promise<HTMLAudioElement> {
    // 检查缓存
    const cached = this.cache.get(url);
    if (cached) {
      cached.lastUsed = Date.now();
      return cached.audio;
    }

    // 检查缓存容量
    await this.ensureCacheCapacity();

    const audio = new Audio();
    audio.preload = options.preloadStrategy || 'metadata';
    audio.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Audio preload timeout: ${url}`));
      }, 10000); // 10秒超时

      const cleanup = () => {
        clearTimeout(timeout);
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('loadedmetadata', onMetadata);
        audio.removeEventListener('error', onError);
      };

      const onLoad = () => {
        cleanup();
        this.addToCache(url, audio, true);
        resolve(audio);
      };

      const onMetadata = () => {
        if (options.preloadStrategy === 'metadata') {
          cleanup();
          this.addToCache(url, audio, true);
          resolve(audio);
        }
      };

      const onError = (error: Event) => {
        cleanup();
        console.warn(`Failed to preload audio: ${url}`, error);
        reject(new Error(`Failed to preload audio: ${url}`));
      };

      audio.addEventListener('canplaythrough', onLoad);
      audio.addEventListener('loadedmetadata', onMetadata);
      audio.addEventListener('error', onError);

      audio.src = url;
    });
  }

  /**
   * 播放音频
   */
  async playAudio(url: string, options: AudioPreloadOptions = {}): Promise<void> {
    try {
      let audio: HTMLAudioElement;
      
      const cached = this.cache.get(url);
      if (cached) {
        audio = cached.audio;
        cached.lastUsed = Date.now();
      } else {
        // 如果没有缓存，立即加载
        audio = await this.loadAudioFile(url, {
          ...options,
          preloadStrategy: 'auto',
        });
      }

      // 重置播放位置
      audio.currentTime = 0;
      
      // 播放音频
      await audio.play();
    } catch (error) {
      console.error(`Failed to play audio: ${url}`, error);
      throw error;
    }
  }

  /**
   * 停止音频播放
   */
  stopAudio(url: string): void {
    const cached = this.cache.get(url);
    if (cached) {
      cached.audio.pause();
      cached.audio.currentTime = 0;
    }
  }

  /**
   * 添加到缓存
   */
  private addToCache(url: string, audio: HTMLAudioElement, preloaded: boolean): void {
    const size = this.estimateAudioSize(audio);
    
    const cacheItem: AudioCacheItem = {
      audio,
      url,
      lastUsed: Date.now(),
      preloaded,
      size,
    };

    this.cache.set(url, cacheItem);
    this.currentCacheSize += size;
  }

  /**
   * 估算音频文件大小
   */
  private estimateAudioSize(audio: HTMLAudioElement): number {
    // 粗略估算：duration * bitrate / 8
    // 假设平均比特率为128kbps
    const duration = audio.duration || 0;
    const estimatedSize = duration * 128 * 1000 / 8; // bytes
    return estimatedSize;
  }

  /**
   * 确保缓存容量
   */
  private async ensureCacheCapacity(): Promise<void> {
    // 检查缓存项数量
    if (this.cache.size >= this.maxCacheItems) {
      await this.evictLeastRecentlyUsed(this.cache.size - this.maxCacheItems + 1);
    }

    // 检查缓存大小
    if (this.currentCacheSize >= this.maxCacheSize) {
      const targetSize = this.maxCacheSize * 0.8; // 清理到80%
      await this.evictBySize(this.currentCacheSize - targetSize);
    }
  }

  /**
   * 按最近使用时间清理缓存
   */
  private async evictLeastRecentlyUsed(count: number): Promise<void> {
    const items = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastUsed - b.lastUsed)
      .slice(0, count);

    items.forEach(([url, item]) => {
      this.cache.delete(url);
      this.currentCacheSize -= item.size || 0;
      
      // 清理音频资源
      item.audio.src = '';
      item.audio.load();
    });
  }

  /**
   * 按大小清理缓存
   */
  private async evictBySize(targetReduction: number): Promise<void> {
    let reducedSize = 0;
    const items = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastUsed - b.lastUsed);

    for (const [url, item] of items) {
      if (reducedSize >= targetReduction) break;

      this.cache.delete(url);
      const itemSize = item.size || 0;
      this.currentCacheSize -= itemSize;
      reducedSize += itemSize;

      // 清理音频资源
      item.audio.src = '';
      item.audio.load();
    }
  }

  /**
   * 设置内存压力处理
   */
  private setupMemoryPressureHandling(): void {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时清理部分缓存
        this.evictLeastRecentlyUsed(Math.floor(this.cache.size * 0.3));
      }
    });

    // 监听内存压力（如果支持）
    if ('memory' in performance) {
      const checkMemoryPressure = () => {
        const memory = (performance as any).memory;
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (usageRatio > 0.8) {
          // 内存使用率超过80%时清理缓存
          this.evictLeastRecentlyUsed(Math.floor(this.cache.size * 0.5));
        }
      };

      setInterval(checkMemoryPressure, 30000); // 每30秒检查一次
    }
  }

  /**
   * 批量预加载词汇音频
   */
  async preloadVocabularyAudio(
    vocabularyItems: Array<{ id: string; audioUrl?: string }>,
    options: AudioPreloadOptions = {}
  ): Promise<void> {
    const audioUrls = vocabularyItems
      .filter(item => item.audioUrl)
      .map(item => item.audioUrl!);

    if (audioUrls.length > 0) {
      await this.preloadAudio(audioUrls, {
        priority: 'medium',
        preloadStrategy: 'metadata',
        ...options,
      });
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    itemCount: number;
    totalSize: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      itemCount: this.cache.size,
      totalSize: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      hitRate: 0, // TODO: 实现命中率统计
    };
  }

  /**
   * 清理所有缓存
   */
  clearCache(): void {
    this.cache.forEach(item => {
      item.audio.src = '';
      item.audio.load();
    });
    
    this.cache.clear();
    this.currentCacheSize = 0;
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearCache();
    this.preloadQueue = [];
    this.isPreloading = false;
  }
}

// 创建全局实例
export const optimizedAudioManager = new OptimizedAudioManager({
  maxCacheSize: 50, // 50MB
  maxCacheItems: 100,
});

export default OptimizedAudioManager;
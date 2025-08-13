/**
 * 音频播放管理器和缓存机制
 * 支持Web Audio API、预加载、缓存和错误处理
 */

/**
 * 音频缓存项
 */
interface AudioCacheItem {
  /** 音频缓冲区 */
  buffer: AudioBuffer;
  /** 缓存时间 */
  cachedAt: number;
  /** 音频URL */
  url: string;
  /** 文件大小 */
  size: number;
}

/**
 * 音频播放配置
 */
interface AudioPlayConfig {
  /** 音量 (0-1) */
  volume?: number;
  /** 播放速度 */
  playbackRate?: number;
  /** 是否循环 */
  loop?: boolean;
  /** 淡入时间（毫秒） */
  fadeInDuration?: number;
  /** 淡出时间（毫秒） */
  fadeOutDuration?: number;
}

/**
 * 音频管理器类
 */
export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private cache: Map<string, AudioCacheItem> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24小时

  /**
   * 获取单例实例
   */
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * 初始化音频上下文
   */
  private async initAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      try {
        // 优先使用标准的AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();

        // 处理浏览器的自动播放策略
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      } catch (error) {
        console.error('Failed to initialize AudioContext:', error);
        throw new Error('Web Audio API not supported');
      }
    }

    return this.audioContext;
  }

  /**
   * 预加载音频文件
   */
  async preloadAudio(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.loadAudioBuffer(url));
    await Promise.allSettled(promises);
  }

  /**
   * 加载音频缓冲区
   */
  private async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    // 检查缓存
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.cachedAt < this.cacheExpiry) {
      return cached.buffer;
    }

    try {
      const audioContext = await this.initAudioContext();
      
      // 获取音频数据
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 缓存音频
      this.cacheAudioBuffer(url, audioBuffer, arrayBuffer.byteLength);

      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load audio from ${url}:`, error);
      throw error;
    }
  }

  /**
   * 缓存音频缓冲区
   */
  private cacheAudioBuffer(url: string, buffer: AudioBuffer, size: number): void {
    // 检查缓存大小限制
    this.cleanupCache();

    const cacheItem: AudioCacheItem = {
      buffer,
      cachedAt: Date.now(),
      url,
      size,
    };

    this.cache.set(url, cacheItem);
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now();
    let totalSize = 0;

    // 移除过期项
    for (const [url, item] of this.cache.entries()) {
      if (now - item.cachedAt > this.cacheExpiry) {
        this.cache.delete(url);
      } else {
        totalSize += item.size;
      }
    }

    // 如果缓存过大，移除最旧的项
    if (totalSize > this.maxCacheSize) {
      const sortedItems = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.cachedAt - b.cachedAt);

      for (const [url, item] of sortedItems) {
        this.cache.delete(url);
        totalSize -= item.size;
        if (totalSize <= this.maxCacheSize * 0.8) break;
      }
    }
  }

  /**
   * 播放音频
   */
  async playAudio(
    url: string, 
    config: AudioPlayConfig = {},
    trackId?: string
  ): Promise<void> {
    try {
      const {
        volume = 1,
        playbackRate = 1,
        loop = false,
        fadeInDuration = 0,
      } = config;

      const audioContext = await this.initAudioContext();
      const audioBuffer = await this.loadAudioBuffer(url);

      // 停止之前的播放（如果有trackId）
      if (trackId) {
        this.stopAudio(trackId);
      }

      // 创建音频源
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = playbackRate;
      source.loop = loop;

      // 创建增益节点用于音量控制
      const gainNode = audioContext.createGain();
      gainNode.gain.value = fadeInDuration > 0 ? 0 : volume;

      // 连接音频图
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 淡入效果
      if (fadeInDuration > 0) {
        gainNode.gain.linearRampToValueAtTime(
          volume,
          audioContext.currentTime + fadeInDuration / 1000
        );
      }

      // 保存引用
      const id = trackId || url;
      this.activeSources.set(id, source);
      this.gainNodes.set(id, gainNode);

      // 播放结束时清理
      source.onended = () => {
        this.activeSources.delete(id);
        this.gainNodes.delete(id);
      };

      // 开始播放
      source.start();

    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  /**
   * 停止音频播放
   */
  stopAudio(trackId: string, fadeOutDuration = 0): void {
    const source = this.activeSources.get(trackId);
    const gainNode = this.gainNodes.get(trackId);

    if (source && gainNode) {
      if (fadeOutDuration > 0 && this.audioContext) {
        // 淡出效果
        gainNode.gain.linearRampToValueAtTime(
          0,
          this.audioContext.currentTime + fadeOutDuration / 1000
        );

        setTimeout(() => {
          try {
            source.stop();
          } catch (error) {
            // 忽略已经停止的错误
          }
        }, fadeOutDuration);
      } else {
        try {
          source.stop();
        } catch (error) {
          // 忽略已经停止的错误
        }
      }

      this.activeSources.delete(trackId);
      this.gainNodes.delete(trackId);
    }
  }

  /**
   * 暂停所有音频
   */
  pauseAll(): void {
    for (const trackId of this.activeSources.keys()) {
      this.stopAudio(trackId);
    }
  }

  /**
   * 设置音量
   */
  setVolume(trackId: string, volume: number): void {
    const gainNode = this.gainNodes.get(trackId);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    itemCount: number;
    totalSize: number;
    hitRate: number;
  } {
    let totalSize = 0;
    for (const item of this.cache.values()) {
      totalSize += item.size;
    }

    return {
      itemCount: this.cache.size,
      totalSize,
      hitRate: 0, // 可以添加命中率统计
    };
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 销毁音频管理器
   */
  destroy(): void {
    this.pauseAll();
    this.clearCache();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/**
 * 备用发音方案
 */
export class FallbackTTS {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  /**
   * 加载可用语音
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    const updateVoices = () => {
      this.voices = this.synthesis!.getVoices();
    };

    updateVoices();
    this.synthesis.addEventListener('voiceschanged', updateVoices);
  }

  /**
   * 播放文本语音
   */
  speak(text: string, options: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // 停止当前播放
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // 选择合适的语音
      const voice = this.voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  /**
   * 停止语音播放
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * 检查是否支持指定语言
   */
  isLanguageSupported(lang: string): boolean {
    return this.voices.some(voice => voice.lang.startsWith(lang.split('-')[0]));
  }
}

/**
 * 音频错误处理器
 */
export class AudioErrorHandler {
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  private retryDelay = 1000;

  /**
   * 处理音频错误
   */
  async handleError(
    url: string,
    error: Error,
    fallbackAction?: () => Promise<void>
  ): Promise<void> {
    const attempts = this.retryAttempts.get(url) || 0;

    if (attempts < this.maxRetries) {
      // 重试
      this.retryAttempts.set(url, attempts + 1);
      
      await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempts));
      
      try {
        const audioManager = AudioManager.getInstance();
        await audioManager.playAudio(url);
        this.retryAttempts.delete(url); // 成功后清除重试计数
      } catch (retryError) {
        await this.handleError(url, retryError as Error, fallbackAction);
      }
    } else {
      // 达到最大重试次数，使用备用方案
      console.warn(`Audio playback failed after ${this.maxRetries} attempts:`, error);
      
      if (fallbackAction) {
        try {
          await fallbackAction();
        } catch (fallbackError) {
          console.error('Fallback action also failed:', fallbackError);
          throw new Error('All audio playback methods failed');
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * 重置重试计数
   */
  resetRetries(url: string): void {
    this.retryAttempts.delete(url);
  }

  /**
   * 清空所有重试计数
   */
  clearRetries(): void {
    this.retryAttempts.clear();
  }
}

// 导出单例实例
export const audioManager = AudioManager.getInstance();
export const fallbackTTS = new FallbackTTS();
export const audioErrorHandler = new AudioErrorHandler();
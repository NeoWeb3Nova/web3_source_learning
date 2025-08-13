import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { audioManager, fallbackTTS, audioErrorHandler } from '@/services/audioManager';

/**
 * 增强音频播放状态
 */
export enum EnhancedAudioState {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ERROR = 'error',
}

/**
 * 音频播放模式
 */
export enum AudioPlayMode {
  /** Web Audio API */
  WEB_AUDIO = 'web_audio',
  /** HTML5 Audio */
  HTML5_AUDIO = 'html5_audio',
  /** 文本转语音 */
  TEXT_TO_SPEECH = 'text_to_speech',
}

/**
 * 增强音频Hook配置
 */
interface UseEnhancedAudioConfig {
  /** 播放模式 */
  mode?: AudioPlayMode;
  /** 音量 (0-1) */
  volume?: number;
  /** 播放速度 */
  playbackRate?: number;
  /** 是否预加载 */
  preload?: boolean;
  /** 是否启用缓存 */
  enableCache?: boolean;
  /** 是否启用备用方案 */
  enableFallback?: boolean;
  /** 淡入淡出时间（毫秒） */
  fadeDuration?: number;
  /** 错误重试次数 */
  maxRetries?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * 增强音频Hook返回值
 */
interface UseEnhancedAudioReturn {
  /** 当前状态 */
  state: EnhancedAudioState;
  /** 当前播放模式 */
  currentMode: AudioPlayMode;
  /** 是否支持Web Audio API */
  isWebAudioSupported: boolean;
  /** 是否支持文本转语音 */
  isTTSSupported: boolean;
  /** 播放音频 */
  playAudio: (url: string, text?: string) => Promise<void>;
  /** 播放文本 */
  playText: (text: string, options?: TTSOptions) => Promise<void>;
  /** 停止播放 */
  stop: () => void;
  /** 暂停播放 */
  pause: () => void;
  /** 恢复播放 */
  resume: () => void;
  /** 设置音量 */
  setVolume: (volume: number) => void;
  /** 设置播放速度 */
  setPlaybackRate: (rate: number) => void;
  /** 预加载音频 */
  preloadAudio: (urls: string[]) => Promise<void>;
  /** 获取缓存统计 */
  getCacheStats: () => { itemCount: number; totalSize: number; hitRate: number };
  /** 清空缓存 */
  clearCache: () => void;
}

/**
 * 文本转语音选项
 */
interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * 增强音频播放Hook
 * 集成Web Audio API、缓存机制和备用方案
 */
export const useEnhancedAudio = (
  config: UseEnhancedAudioConfig = {}
): UseEnhancedAudioReturn => {
  const {
    mode = AudioPlayMode.WEB_AUDIO,
    volume = 0.8,
    playbackRate = 1.0,
    preload = true,
    enableCache = true,
    enableFallback = true,
    fadeDuration = 200,
    maxRetries = 3,
    timeout = 10000,
  } = config;

  const toast = useToast();
  const trackIdRef = useRef<string>('');
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<EnhancedAudioState>(EnhancedAudioState.IDLE);
  const [currentMode, setCurrentMode] = useState<AudioPlayMode>(mode);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [currentPlaybackRate, setCurrentPlaybackRate] = useState(playbackRate);

  // 检查浏览器支持
  const isWebAudioSupported = useCallback(() => {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }, []);

  const isTTSSupported = useCallback(() => {
    return 'speechSynthesis' in window;
  }, []);

  /**
   * 设置播放超时
   */
  const setPlayTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(EnhancedAudioState.ERROR);
      toast({
        title: '播放超时',
        description: '音频加载时间过长，请检查网络连接',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }, timeout);
  }, [timeout, toast]);

  /**
   * 清除播放超时
   */
  const clearPlayTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * 使用Web Audio API播放
   */
  const playWithWebAudio = useCallback(async (url: string) => {
    try {
      setState(EnhancedAudioState.LOADING);
      setPlayTimeout();

      const trackId = `audio_${Date.now()}`;
      trackIdRef.current = trackId;

      await audioManager.playAudio(url, {
        volume: currentVolume,
        playbackRate: currentPlaybackRate,
        fadeInDuration: fadeDuration,
      }, trackId);

      setState(EnhancedAudioState.PLAYING);
      clearPlayTimeout();

      // 模拟播放结束（实际应该通过事件监听）
      // 这里需要根据实际的音频长度来设置
      setTimeout(() => {
        if (trackIdRef.current === trackId) {
          setState(EnhancedAudioState.IDLE);
        }
      }, 5000); // 假设5秒播放时间

    } catch (error) {
      console.error('Web Audio playback failed:', error);
      clearPlayTimeout();
      
      if (enableFallback) {
        await playWithHTML5Audio(url);
      } else {
        setState(EnhancedAudioState.ERROR);
        throw error;
      }
    }
  }, [currentVolume, currentPlaybackRate, fadeDuration, setPlayTimeout, clearPlayTimeout, enableFallback]);

  /**
   * 使用HTML5 Audio播放
   */
  const playWithHTML5Audio = useCallback(async (url: string) => {
    try {
      setState(EnhancedAudioState.LOADING);
      setCurrentMode(AudioPlayMode.HTML5_AUDIO);
      setPlayTimeout();

      // 清理之前的音频
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
        htmlAudioRef.current.src = '';
      }

      const audio = new Audio(url);
      audio.volume = currentVolume;
      audio.playbackRate = currentPlaybackRate;
      audio.preload = preload ? 'auto' : 'metadata';

      htmlAudioRef.current = audio;

      // 事件监听
      audio.addEventListener('loadstart', () => {
        setState(EnhancedAudioState.LOADING);
      });

      audio.addEventListener('canplaythrough', () => {
        clearPlayTimeout();
      });

      audio.addEventListener('play', () => {
        setState(EnhancedAudioState.PLAYING);
      });

      audio.addEventListener('pause', () => {
        setState(EnhancedAudioState.PAUSED);
      });

      audio.addEventListener('ended', () => {
        setState(EnhancedAudioState.IDLE);
      });

      audio.addEventListener('error', (e) => {
        console.error('HTML5 Audio error:', e);
        clearPlayTimeout();
        setState(EnhancedAudioState.ERROR);
      });

      await audio.play();

    } catch (error) {
      console.error('HTML5 Audio playback failed:', error);
      clearPlayTimeout();
      setState(EnhancedAudioState.ERROR);
      throw error;
    }
  }, [currentVolume, currentPlaybackRate, preload, setPlayTimeout, clearPlayTimeout]);

  /**
   * 使用文本转语音播放
   */
  const playWithTTS = useCallback(async (text: string, options: TTSOptions = {}) => {
    try {
      setState(EnhancedAudioState.LOADING);
      setCurrentMode(AudioPlayMode.TEXT_TO_SPEECH);

      const ttsOptions = {
        lang: options.lang || 'en-US',
        rate: options.rate || currentPlaybackRate,
        pitch: options.pitch || 1,
        volume: options.volume || currentVolume,
      };

      setState(EnhancedAudioState.PLAYING);
      await fallbackTTS.speak(text, ttsOptions);
      setState(EnhancedAudioState.IDLE);

    } catch (error) {
      console.error('TTS playback failed:', error);
      setState(EnhancedAudioState.ERROR);
      throw error;
    }
  }, [currentVolume, currentPlaybackRate]);

  /**
   * 播放音频
   */
  const playAudio = useCallback(async (url: string, text?: string) => {
    try {
      // 停止当前播放
      stop();

      // 根据模式选择播放方式
      switch (currentMode) {
        case AudioPlayMode.WEB_AUDIO:
          if (isWebAudioSupported()) {
            await playWithWebAudio(url);
          } else if (enableFallback) {
            await playWithHTML5Audio(url);
          } else {
            throw new Error('Web Audio API not supported');
          }
          break;

        case AudioPlayMode.HTML5_AUDIO:
          await playWithHTML5Audio(url);
          break;

        case AudioPlayMode.TEXT_TO_SPEECH:
          if (text) {
            await playWithTTS(text);
          } else {
            throw new Error('Text required for TTS mode');
          }
          break;

        default:
          throw new Error(`Unsupported audio mode: ${currentMode}`);
      }

    } catch (error) {
      // 使用错误处理器进行重试
      if (enableFallback && text) {
        try {
          await audioErrorHandler.handleError(url, error as Error, async () => {
            await playWithTTS(text);
          });
        } catch (finalError) {
          toast({
            title: '播放失败',
            description: '所有播放方式都失败了，请检查网络连接',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          throw finalError;
        }
      } else {
        toast({
          title: '播放失败',
          description: '音频播放出现问题，请重试',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        throw error;
      }
    }
  }, [currentMode, isWebAudioSupported, enableFallback, playWithWebAudio, playWithHTML5Audio, playWithTTS, toast]);

  /**
   * 播放文本
   */
  const playText = useCallback(async (text: string, options: TTSOptions = {}) => {
    if (!isTTSSupported()) {
      throw new Error('Text-to-speech not supported');
    }

    await playWithTTS(text, options);
  }, [playWithTTS, isTTSSupported]);

  /**
   * 停止播放
   */
  const stop = useCallback(() => {
    clearPlayTimeout();

    // 停止Web Audio
    if (trackIdRef.current) {
      audioManager.stopAudio(trackIdRef.current, fadeDuration);
      trackIdRef.current = '';
    }

    // 停止HTML5 Audio
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current.currentTime = 0;
    }

    // 停止TTS
    fallbackTTS.stop();

    setState(EnhancedAudioState.IDLE);
  }, [clearPlayTimeout, fadeDuration]);

  /**
   * 暂停播放
   */
  const pause = useCallback(() => {
    if (htmlAudioRef.current && state === EnhancedAudioState.PLAYING) {
      htmlAudioRef.current.pause();
      setState(EnhancedAudioState.PAUSED);
    }
  }, [state]);

  /**
   * 恢复播放
   */
  const resume = useCallback(async () => {
    if (htmlAudioRef.current && state === EnhancedAudioState.PAUSED) {
      try {
        await htmlAudioRef.current.play();
        setState(EnhancedAudioState.PLAYING);
      } catch (error) {
        console.error('Failed to resume audio:', error);
        setState(EnhancedAudioState.ERROR);
      }
    }
  }, [state]);

  /**
   * 设置音量
   */
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setCurrentVolume(clampedVolume);

    // 更新Web Audio音量
    if (trackIdRef.current) {
      audioManager.setVolume(trackIdRef.current, clampedVolume);
    }

    // 更新HTML5 Audio音量
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = clampedVolume;
    }
  }, []);

  /**
   * 设置播放速度
   */
  const setPlaybackRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.25, Math.min(4, rate));
    setCurrentPlaybackRate(clampedRate);

    // 更新HTML5 Audio播放速度
    if (htmlAudioRef.current) {
      htmlAudioRef.current.playbackRate = clampedRate;
    }
  }, []);

  /**
   * 预加载音频
   */
  const preloadAudio = useCallback(async (urls: string[]) => {
    if (enableCache && isWebAudioSupported()) {
      try {
        await audioManager.preloadAudio(urls);
        toast({
          title: '预加载完成',
          description: `成功预加载 ${urls.length} 个音频文件`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Failed to preload audio:', error);
        toast({
          title: '预加载失败',
          description: '部分音频文件预加载失败',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [enableCache, isWebAudioSupported, toast]);

  /**
   * 获取缓存统计
   */
  const getCacheStats = useCallback(() => {
    return audioManager.getCacheStats();
  }, []);

  /**
   * 清空缓存
   */
  const clearCache = useCallback(() => {
    audioManager.clearCache();
    toast({
      title: '缓存已清空',
      description: '音频缓存已成功清空',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  // 清理函数
  useEffect(() => {
    return () => {
      stop();
      clearPlayTimeout();
    };
  }, [stop, clearPlayTimeout]);

  return {
    state,
    currentMode,
    isWebAudioSupported: isWebAudioSupported(),
    isTTSSupported: isTTSSupported(),
    playAudio,
    playText,
    stop,
    pause,
    resume,
    setVolume,
    setPlaybackRate,
    preloadAudio,
    getCacheStats,
    clearCache,
  };
};

export default useEnhancedAudio;
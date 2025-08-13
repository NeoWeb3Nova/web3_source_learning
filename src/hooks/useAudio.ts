import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';

/**
 * 音频播放状态
 */
export enum AudioState {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ERROR = 'error',
}

/**
 * 音频播放Hook配置
 */
interface UseAudioConfig {
  /** 音量 (0-1) */
  volume?: number;
  /** 播放速度 */
  playbackRate?: number;
  /** 是否循环播放 */
  loop?: boolean;
  /** 是否预加载 */
  preload?: boolean;
  /** 错误重试次数 */
  retryCount?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * 音频播放Hook返回值
 */
interface UseAudioReturn {
  /** 当前状态 */
  state: AudioState;
  /** 当前时间（秒） */
  currentTime: number;
  /** 总时长（秒） */
  duration: number;
  /** 音量 */
  volume: number;
  /** 播放速度 */
  playbackRate: number;
  /** 是否静音 */
  muted: boolean;
  /** 播放音频 */
  play: (url?: string) => Promise<void>;
  /** 暂停音频 */
  pause: () => void;
  /** 停止音频 */
  stop: () => void;
  /** 设置音量 */
  setVolume: (volume: number) => void;
  /** 设置播放速度 */
  setPlaybackRate: (rate: number) => void;
  /** 设置静音 */
  setMuted: (muted: boolean) => void;
  /** 跳转到指定时间 */
  seekTo: (time: number) => void;
}

/**
 * 音频播放管理Hook
 */
export const useAudio = (
  initialUrl?: string,
  config: UseAudioConfig = {}
): UseAudioReturn => {
  const {
    volume: initialVolume = 0.8,
    playbackRate: initialPlaybackRate = 1.0,
    loop = false,
    preload = true,
    retryCount = 3,
    timeout = 10000,
  } = config;

  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const [state, setState] = useState<AudioState>(AudioState.IDLE);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);
  const [playbackRate, setPlaybackRateState] = useState(initialPlaybackRate);
  const [muted, setMutedState] = useState(false);

  /**
   * 创建音频元素
   */
  const createAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio();
    audio.src = url;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.muted = muted;
    audio.loop = loop;
    audio.preload = preload ? 'auto' : 'none';

    // 事件监听
    audio.addEventListener('loadstart', () => {
      setState(AudioState.LOADING);
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration || 0);
    });

    audio.addEventListener('canplaythrough', () => {
      if (state === AudioState.LOADING) {
        setState(AudioState.IDLE);
      }
    });

    audio.addEventListener('play', () => {
      setState(AudioState.PLAYING);
    });

    audio.addEventListener('pause', () => {
      setState(AudioState.PAUSED);
    });

    audio.addEventListener('ended', () => {
      setState(AudioState.IDLE);
      setCurrentTime(0);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setState(AudioState.ERROR);
      
      // 重试逻辑
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          audio.load();
        }, 1000 * retryCountRef.current);
      } else {
        toast({
          title: '音频播放失败',
          description: '无法播放音频文件，请检查网络连接',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    });

    audioRef.current = audio;
    return audio;
  }, [volume, playbackRate, muted, loop, preload, retryCount, state, toast]);

  /**
   * 播放音频
   */
  const play = useCallback(async (url?: string) => {
    try {
      const audioUrl = url || initialUrl;
      if (!audioUrl) {
        throw new Error('No audio URL provided');
      }

      // 如果URL改变或没有音频元素，创建新的
      if (!audioRef.current || audioRef.current.src !== audioUrl) {
        createAudio(audioUrl);
      }

      const audio = audioRef.current;
      if (!audio) return;

      // 设置超时
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setState(AudioState.ERROR);
        toast({
          title: '播放超时',
          description: '音频加载时间过长，请重试',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }, timeout);

      // 播放音频
      await audio.play();
      retryCountRef.current = 0; // 重置重试计数

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      setState(AudioState.ERROR);
      
      toast({
        title: '播放失败',
        description: '音频播放出现问题，请重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [initialUrl, createAudio, timeout, toast]);

  /**
   * 暂停音频
   */
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  /**
   * 停止音频
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(AudioState.IDLE);
      setCurrentTime(0);
    }
  }, []);

  /**
   * 设置音量
   */
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  /**
   * 设置播放速度
   */
  const setPlaybackRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.25, Math.min(4, rate));
    setPlaybackRateState(clampedRate);
    
    if (audioRef.current) {
      audioRef.current.playbackRate = clampedRate;
    }
  }, []);

  /**
   * 设置静音
   */
  const setMuted = useCallback((newMuted: boolean) => {
    setMutedState(newMuted);
    
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  }, []);

  /**
   * 跳转到指定时间
   */
  const seekTo = useCallback((time: number) => {
    if (audioRef.current && duration > 0) {
      const clampedTime = Math.max(0, Math.min(duration, time));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }, [duration]);

  // 初始化音频
  useEffect(() => {
    if (initialUrl && preload) {
      createAudio(initialUrl);
    }

    // 清理函数
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [initialUrl, preload, createAudio]);

  // 更新音频属性
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.muted = muted;
    }
  }, [volume, playbackRate, muted]);

  return {
    state,
    currentTime,
    duration,
    volume,
    playbackRate,
    muted,
    play,
    pause,
    stop,
    setVolume,
    setPlaybackRate,
    setMuted,
    seekTo,
  };
};

/**
 * 文本转语音Hook
 */
export const useTextToSpeech = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      const updateVoices = () => {
        setVoices(speechSynthesis.getVoices());
      };
      
      updateVoices();
      speechSynthesis.addEventListener('voiceschanged', updateVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      };
    }
  }, []);

  const speak = useCallback((text: string, options: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}) => {
    if (!isSupported) return;

    // 停止当前播放
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isSupported,
    isSpeaking,
    voices,
    speak,
    stop,
  };
};
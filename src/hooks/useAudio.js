import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
export var AudioState;
(function (AudioState) {
    AudioState["IDLE"] = "idle";
    AudioState["LOADING"] = "loading";
    AudioState["PLAYING"] = "playing";
    AudioState["PAUSED"] = "paused";
    AudioState["ERROR"] = "error";
})(AudioState || (AudioState = {}));
export const useAudio = (initialUrl, config = {}) => {
    const { volume: initialVolume = 0.8, playbackRate: initialPlaybackRate = 1.0, loop = false, preload = true, retryCount = 3, timeout = 10000, } = config;
    const toast = useToast();
    const audioRef = useRef(null);
    const timeoutRef = useRef(null);
    const retryCountRef = useRef(0);
    const [state, setState] = useState(AudioState.IDLE);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(initialVolume);
    const [playbackRate, setPlaybackRateState] = useState(initialPlaybackRate);
    const [muted, setMutedState] = useState(false);
    const createAudio = useCallback((url) => {
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
            if (retryCountRef.current < retryCount) {
                retryCountRef.current++;
                setTimeout(() => {
                    audio.load();
                }, 1000 * retryCountRef.current);
            }
            else {
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
    const play = useCallback(async (url) => {
        try {
            const audioUrl = url || initialUrl;
            if (!audioUrl) {
                throw new Error('No audio URL provided');
            }
            if (!audioRef.current || audioRef.current.src !== audioUrl) {
                createAudio(audioUrl);
            }
            const audio = audioRef.current;
            if (!audio)
                return;
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
            await audio.play();
            retryCountRef.current = 0;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
        catch (error) {
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
    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, []);
    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setState(AudioState.IDLE);
            setCurrentTime(0);
        }
    }, []);
    const setVolume = useCallback((newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);
        if (audioRef.current) {
            audioRef.current.volume = clampedVolume;
        }
    }, []);
    const setPlaybackRate = useCallback((rate) => {
        const clampedRate = Math.max(0.25, Math.min(4, rate));
        setPlaybackRateState(clampedRate);
        if (audioRef.current) {
            audioRef.current.playbackRate = clampedRate;
        }
    }, []);
    const setMuted = useCallback((newMuted) => {
        setMutedState(newMuted);
        if (audioRef.current) {
            audioRef.current.muted = newMuted;
        }
    }, []);
    const seekTo = useCallback((time) => {
        if (audioRef.current && duration > 0) {
            const clampedTime = Math.max(0, Math.min(duration, time));
            audioRef.current.currentTime = clampedTime;
            setCurrentTime(clampedTime);
        }
    }, [duration]);
    useEffect(() => {
        if (initialUrl && preload) {
            createAudio(initialUrl);
        }
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
export const useTextToSpeech = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
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
    const speak = useCallback((text, options = {}) => {
        if (!isSupported)
            return;
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

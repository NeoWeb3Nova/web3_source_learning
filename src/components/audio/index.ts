// Audio components exports
export { AudioPlayer } from './AudioPlayer';
export { TextToSpeech } from './TextToSpeech';

// Default exports
export { default as AudioPlayerDefault } from './AudioPlayer';
export { default as TextToSpeechDefault } from './TextToSpeech';

// Re-export hooks and services
export { useEnhancedAudio, EnhancedAudioState, AudioPlayMode } from '@/hooks/useEnhancedAudio';
export { audioManager, fallbackTTS, audioErrorHandler } from '@/services/audioManager';

// Types
export type { AudioPlayConfig } from '@/services/audioManager';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudio } from '../../hooks/useAudio';

// Mock Audio API
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  currentTime: 0,
  duration: 2.5,
  paused: true,
  ended: false,
  volume: 1,
  muted: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

// Mock AudioContext
const mockAudioContext = {
  createBufferSource: vi.fn(),
  createGain: vi.fn(),
  decodeAudioData: vi.fn(),
  destination: {},
  state: 'running',
  suspend: vi.fn(),
  resume: vi.fn(),
  close: vi.fn(),
};

const mockBufferSource = {
  buffer: null,
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  onended: null,
};

const mockGainNode = {
  gain: { value: 1 },
  connect: vi.fn(),
};

// Mock fetch
global.fetch = vi.fn();

// Setup mocks
global.Audio = vi.fn(() => mockAudio) as any;
global.AudioContext = vi.fn(() => mockAudioContext) as any;
global.webkitAudioContext = vi.fn(() => mockAudioContext) as any;

describe('useAudio Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAudioContext.createBufferSource.mockReturnValue(mockBufferSource);
    mockAudioContext.createGain.mockReturnValue(mockGainNode);
    mockAudioContext.decodeAudioData.mockResolvedValue({ duration: 2.5 });
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    } as Response);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAudio());

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.volume).toBe(1);
      expect(result.current.isMuted).toBe(false);
    });

    it('should play audio from URL', async () => {
      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      expect(result.current.isPlaying).toBe(true);
      expect(fetch).toHaveBeenCalledWith('https://example.com/audio.mp3');
    });

    it('should handle play errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/invalid.mp3');
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isPlaying).toBe(false);
    });

    it('should stop audio playback', async () => {
      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.stop();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it('should pause and resume audio', async () => {
      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);

      act(() => {
        result.current.resume();
      });

      expect(result.current.isPlaying).toBe(true);
    });
  });

  describe('Volume Control', () => {
    it('should set volume', () => {
      const { result } = renderHook(() => useAudio());

      act(() => {
        result.current.setVolume(0.5);
      });

      expect(result.current.volume).toBe(0.5);
    });

    it('should clamp volume to valid range', () => {
      const { result } = renderHook(() => useAudio());

      act(() => {
        result.current.setVolume(1.5);
      });

      expect(result.current.volume).toBe(1);

      act(() => {
        result.current.setVolume(-0.5);
      });

      expect(result.current.volume).toBe(0);
    });

    it('should mute and unmute audio', () => {
      const { result } = renderHook(() => useAudio());

      act(() => {
        result.current.setVolume(0.8);
      });

      act(() => {
        result.current.mute();
      });

      expect(result.current.isMuted).toBe(true);
      expect(result.current.volume).toBe(0);

      act(() => {
        result.current.unmute();
      });

      expect(result.current.isMuted).toBe(false);
      expect(result.current.volume).toBe(0.8);
    });

    it('should toggle mute state', () => {
      const { result } = renderHook(() => useAudio());

      act(() => {
        result.current.setVolume(0.6);
      });

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(true);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(false);
      expect(result.current.volume).toBe(0.6);
    });
  });

  describe('Loading States', () => {
    it('should show loading state during audio loading', async () => {
      let resolvePromise: (value: any) => void;
      const loadingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      vi.mocked(fetch).mockReturnValue(loadingPromise as any);

      const { result } = renderHook(() => useAudio());

      act(() => {
        result.current.play('https://example.com/audio.mp3');
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        });
        await loadingPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle loading timeout', async () => {
      vi.useFakeTimers();

      // Mock a slow response
      const slowPromise = new Promise(resolve => {
        setTimeout(() => resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        }), 10000);
      });

      vi.mocked(fetch).mockReturnValue(slowPromise as any);

      const { result } = renderHook(() => useAudio());

      act(() => {
        result.current.play('https://example.com/audio.mp3');
      });

      expect(result.current.isLoading).toBe(true);

      // Fast-forward past timeout
      vi.advanceTimersByTime(5000);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Should timeout and show error
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('Caching', () => {
    it('should cache loaded audio', async () => {
      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      // Should only fetch once due to caching
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should preload audio', async () => {
      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.preload('https://example.com/audio.mp3');
      });

      expect(fetch).toHaveBeenCalledWith('https://example.com/audio.mp3');

      // Playing preloaded audio should not fetch again
      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should clear cache', async () => {
      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      act(() => {
        result.current.clearCache();
      });

      // Should fetch again after cache clear
      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Multiple Audio Sources', () => {
    it('should handle multiple audio sources', async () => {
      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio1.mp3');
      });

      expect(result.current.isPlaying).toBe(true);

      // Playing another audio should stop the first
      await act(async () => {
        await result.current.play('https://example.com/audio2.mp3');
      });

      expect(result.current.isPlaying).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should queue audio playback', async () => {
      const { result } = renderHook(() => useAudio());

      const playlist = [
        'https://example.com/audio1.mp3',
        'https://example.com/audio2.mp3',
        'https://example.com/audio3.mp3',
      ];

      await act(async () => {
        await result.current.playPlaylist(playlist);
      });

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.currentTrack).toBe(0);
    });
  });

  describe('Audio Context Management', () => {
    it('should handle suspended audio context', async () => {
      mockAudioContext.state = 'suspended';
      mockAudioContext.resume.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should fallback to HTML Audio when Web Audio API fails', async () => {
      // Mock Web Audio API failure
      mockAudioContext.decodeAudioData.mockRejectedValue(new Error('Decode failed'));

      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      // Should fallback to HTML Audio
      expect(global.Audio).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', async () => {
      const { result, unmount } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      expect(result.current.isPlaying).toBe(true);

      unmount();

      // Should stop audio and cleanup resources
      expect(mockBufferSource.stop).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      mockBufferSource.stop.mockImplementation(() => {
        throw new Error('Stop failed');
      });

      const { result, unmount } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      // Should not throw error during cleanup
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/audio.mp3');
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isPlaying).toBe(false);
    });

    it('should handle invalid audio format', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)), // Too small
      } as Response);

      mockAudioContext.decodeAudioData.mockRejectedValue(new Error('Invalid format'));

      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/invalid.mp3');
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should clear errors on successful play', async () => {
      // First, cause an error
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAudio());

      await act(async () => {
        await result.current.play('https://example.com/invalid.mp3');
      });

      expect(result.current.error).toBeTruthy();

      // Then, play successfully
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      } as Response);

      await act(async () => {
        await result.current.play('https://example.com/valid.mp3');
      });

      expect(result.current.error).toBeNull();
    });
  });
});
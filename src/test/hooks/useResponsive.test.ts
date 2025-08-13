import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResponsive } from '../../hooks/useResponsive';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock window.innerWidth and window.innerHeight
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('useResponsive', () => {
  let mockMediaQueryList: any;

  beforeEach(() => {
    mockMediaQueryList = {
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Breakpoint Detection', () => {
    it('should detect mobile breakpoint', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      mockMediaQueryList.matches = true;
      mockMatchMedia.mockImplementation((query) => {
        if (query === '(max-width: 767px)') {
          return { ...mockMediaQueryList, matches: true };
        }
        return { ...mockMediaQueryList, matches: false };
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.breakpoint).toBe('mobile');
    });

    it('should detect tablet breakpoint', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
      mockMatchMedia.mockImplementation((query) => {
        if (query === '(min-width: 768px) and (max-width: 1023px)') {
          return { ...mockMediaQueryList, matches: true };
        }
        return { ...mockMediaQueryList, matches: false };
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.breakpoint).toBe('tablet');
    });

    it('should detect desktop breakpoint', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
      mockMatchMedia.mockImplementation((query) => {
        if (query === '(min-width: 1024px)') {
          return { ...mockMediaQueryList, matches: true };
        }
        return { ...mockMediaQueryList, matches: false };
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.breakpoint).toBe('desktop');
    });
  });

  describe('Viewport Dimensions', () => {
    it('should return current viewport dimensions', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.viewport.width).toBe(1024);
      expect(result.current.viewport.height).toBe(768);
    });

    it('should update dimensions on resize', () => {
      const { result } = renderHook(() => useResponsive());

      // Simulate window resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.viewport.width).toBe(800);
      expect(result.current.viewport.height).toBe(600);
    });
  });

  describe('Touch Configuration', () => {
    it('should provide mobile touch configuration', () => {
      mockMatchMedia.mockImplementation((query) => {
        if (query === '(max-width: 767px)') {
          return { ...mockMediaQueryList, matches: true };
        }
        return { ...mockMediaQueryList, matches: false };
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.touchConfig.minTouchTarget).toBe(44);
      expect(result.current.touchConfig.touchPadding).toBeGreaterThan(8);
    });

    it('should provide tablet touch configuration', () => {
      mockMatchMedia.mockImplementation((query) => {
        if (query === '(min-width: 768px) and (max-width: 1023px)') {
          return { ...mockMediaQueryList, matches: true };
        }
        return { ...mockMediaQueryList, matches: false };
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.touchConfig.minTouchTarget).toBe(44);
      expect(result.current.touchConfig.touchPadding).toBeGreaterThanOrEqual(8);
    });

    it('should provide desktop configuration', () => {
      mockMatchMedia.mockImplementation((query) => {
        if (query === '(min-width: 1024px)') {
          return { ...mockMediaQueryList, matches: true };
        }
        return { ...mockMediaQueryList, matches: false };
      });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.touchConfig.minTouchTarget).toBe(32);
      expect(result.current.touchConfig.touchPadding).toBe(4);
    });
  });

  describe('Orientation Detection', () => {
    it('should detect portrait orientation', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.orientation).toBe('portrait');
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });

    it('should detect landscape orientation', () => {
      Object.defineProperty(window, 'innerWidth', { value: 667, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, configurable: true });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.orientation).toBe('landscape');
      expect(result.current.isPortrait).toBe(false);
      expect(result.current.isLandscape).toBe(true);
    });

    it('should update orientation on resize', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.orientation).toBe('portrait');

      // Simulate orientation change
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 667, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 375, configurable: true });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.orientation).toBe('landscape');
    });
  });

  describe('Device Type Detection', () => {
    it('should detect touch device', () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', { value: null, configurable: true });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isTouchDevice).toBe(true);
    });

    it('should detect non-touch device', () => {
      // Remove touch support
      Object.defineProperty(window, 'ontouchstart', { value: undefined, configurable: true });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isTouchDevice).toBe(false);
    });
  });

  describe('Media Query Utilities', () => {
    it('should provide media query matching function', () => {
      mockMatchMedia.mockReturnValue({ ...mockMediaQueryList, matches: true });

      const { result } = renderHook(() => useResponsive());

      const matches = result.current.matchesQuery('(min-width: 768px)');
      expect(matches).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px)');
    });

    it('should handle invalid media queries', () => {
      mockMatchMedia.mockImplementation(() => {
        throw new Error('Invalid media query');
      });

      const { result } = renderHook(() => useResponsive());

      const matches = result.current.matchesQuery('invalid-query');
      expect(matches).toBe(false);
    });
  });

  describe('Performance Optimization', () => {
    it('should debounce resize events', () => {
      const { result } = renderHook(() => useResponsive());

      const initialWidth = result.current.viewport.width;

      // Rapid resize events
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
        window.dispatchEvent(new Event('resize'));
        
        Object.defineProperty(window, 'innerWidth', { value: 900, configurable: true });
        window.dispatchEvent(new Event('resize'));
        
        Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
        window.dispatchEvent(new Event('resize'));
      });

      // Should eventually update to the final value
      setTimeout(() => {
        expect(result.current.viewport.width).toBe(1000);
      }, 250); // Assuming 200ms debounce
    });

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useResponsive());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('Custom Breakpoints', () => {
    it('should support custom breakpoints', () => {
      const customBreakpoints = {
        sm: 480,
        md: 768,
        lg: 1024,
        xl: 1200,
      };

      const { result } = renderHook(() => useResponsive(customBreakpoints));

      expect(result.current.breakpoints).toEqual(customBreakpoints);
    });

    it('should use default breakpoints when none provided', () => {
      const { result } = renderHook(() => useResponsive());

      expect(result.current.breakpoints).toBeDefined();
      expect(result.current.breakpoints.mobile).toBeDefined();
      expect(result.current.breakpoints.tablet).toBeDefined();
      expect(result.current.breakpoints.desktop).toBeDefined();
    });
  });

  describe('SSR Compatibility', () => {
    it('should handle server-side rendering', () => {
      // Mock SSR environment
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        renderHook(() => useResponsive());
      }).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });

    it('should provide default values during SSR', () => {
      // Mock SSR environment
      const originalWindow = global.window;
      delete (global as any).window;

      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true); // Default to desktop
      expect(result.current.viewport.width).toBe(1024); // Default width
      expect(result.current.viewport.height).toBe(768); // Default height

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero dimensions', () => {
      Object.defineProperty(window, 'innerWidth', { value: 0, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 0, configurable: true });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.viewport.width).toBe(0);
      expect(result.current.viewport.height).toBe(0);
      // Should default to mobile for zero width
      expect(result.current.isMobile).toBe(true);
    });

    it('should handle very large dimensions', () => {
      Object.defineProperty(window, 'innerWidth', { value: 5000, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 3000, configurable: true });

      const { result } = renderHook(() => useResponsive());

      expect(result.current.viewport.width).toBe(5000);
      expect(result.current.viewport.height).toBe(3000);
      expect(result.current.isDesktop).toBe(true);
    });

    it('should handle matchMedia not supported', () => {
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      const { result } = renderHook(() => useResponsive());

      // Should fallback gracefully
      expect(result.current.matchesQuery).toBeDefined();
      expect(result.current.matchesQuery('(min-width: 768px)')).toBe(false);

      // Restore matchMedia
      window.matchMedia = originalMatchMedia;
    });
  });
});
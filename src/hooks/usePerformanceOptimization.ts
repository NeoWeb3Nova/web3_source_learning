import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { debounce, throttle, performanceMark } from '../utils/performance';

/**
 * 性能优化Hook
 */
export const usePerformanceOptimization = () => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;

    // 在开发环境中监控渲染性能
    if (process.env.NODE_ENV === 'development') {
      if (renderCountRef.current > 1 && timeSinceLastRender < 16) {
        console.warn(`Component re-rendered ${renderCountRef.current} times, last render took ${timeSinceLastRender}ms`);
      }
    }
  });

  return {
    renderCount: renderCountRef.current,
  };
};

/**
 * 防抖Hook
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  return useCallback(
    debounce(callback, delay),
    [delay, ...deps]
  ) as T;
};

/**
 * 节流Hook
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): T => {
  return useCallback(
    throttle(callback, limit),
    [limit, ...deps]
  ) as T;
};

/**
 * 优化的状态Hook，减少不必要的重渲染
 */
export const useOptimizedState = <T>(
  initialValue: T,
  compareFn?: (prev: T, next: T) => boolean
) => {
  const [state, setState] = useState(initialValue);
  const prevStateRef = useRef(initialValue);

  const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevState)
        : newValue;

      // 使用自定义比较函数或默认的浅比较
      const shouldUpdate = compareFn 
        ? !compareFn(prevState, nextState)
        : prevState !== nextState;

      if (shouldUpdate) {
        prevStateRef.current = nextState;
        return nextState;
      }

      return prevState;
    });
  }, [compareFn]);

  return [state, optimizedSetState] as const;
};

/**
 * 内存化计算Hook
 */
export const useExpensiveComputation = <T, Args extends any[]>(
  computeFn: (...args: Args) => T,
  deps: Args,
  options: {
    cacheSize?: number;
    ttl?: number; // Time to live in milliseconds
  } = {}
): T => {
  const { cacheSize = 10, ttl = 5 * 60 * 1000 } = options; // 5分钟默认TTL
  const cacheRef = useRef(new Map<string, { value: T; timestamp: number }>());

  return useMemo(() => {
    const key = JSON.stringify(deps);
    const cache = cacheRef.current;
    const now = Date.now();

    // 检查缓存
    const cached = cache.get(key);
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value;
    }

    // 计算新值
    performanceMark.start('expensive-computation');
    const result = computeFn(...deps);
    const duration = performanceMark.end('expensive-computation');

    // 在开发环境中监控计算时间
    if (process.env.NODE_ENV === 'development' && duration > 10) {
      console.warn(`Expensive computation took ${duration.toFixed(2)}ms`);
    }

    // 更新缓存
    cache.set(key, { value: result, timestamp: now });

    // 清理过期缓存
    if (cache.size > cacheSize) {
      const entries = Array.from(cache.entries());
      entries
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        .slice(0, cache.size - cacheSize)
        .forEach(([key]) => cache.delete(key));
    }

    performanceMark.clear('expensive-computation');
    return result;
  }, deps);
};

/**
 * 虚拟滚动Hook
 */
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange,
  };
};

/**
 * 图片懒加载Hook
 */
export const useImageLazyLoad = (
  src: string,
  options: {
    rootMargin?: string;
    threshold?: number;
    placeholder?: string;
  } = {}
) => {
  const [imageSrc, setImageSrc] = useState(options.placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.unobserve(img);
        }
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.1,
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src, options.rootMargin, options.threshold]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setIsError(true);
  }, []);

  return {
    imgRef,
    imageSrc,
    isLoaded,
    isError,
    handleLoad,
    handleError,
  };
};

/**
 * 组件可见性Hook
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin, options.root]);

  return {
    elementRef,
    isIntersecting,
    entry,
  };
};

/**
 * 性能监控Hook
 */
export const usePerformanceMonitor = (componentName: string) => {
  const mountTimeRef = useRef(Date.now());
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    
    // 记录首次渲染时间
    if (renderCountRef.current === 1) {
      const mountTime = Date.now() - mountTimeRef.current;
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} mounted in ${mountTime}ms`);
      }
    }
  });

  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV === 'development') {
        const totalTime = Date.now() - mountTimeRef.current;
        console.log(`${componentName} unmounted after ${totalTime}ms, rendered ${renderCountRef.current} times`);
      }
    };
  }, [componentName]);

  return {
    renderCount: renderCountRef.current,
  };
};
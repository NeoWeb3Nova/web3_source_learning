// Performance optimization utilities

import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * 创建带有错误边界的懒加载组件
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  displayName?: string
): LazyExoticComponent<T> => {
  const LazyComponent = lazy(importFunc);
  
  if (displayName) {
    (LazyComponent as any).displayName = `Lazy(${displayName})`;
  }
  
  return LazyComponent;
};

/**
 * 预加载组件
 */
export const preloadComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): Promise<{ default: T }> => {
  return importFunc();
};

/**
 * 批量预加载组件
 */
export const preloadComponents = (
  importFuncs: Array<() => Promise<{ default: ComponentType<any> }>>
): Promise<Array<{ default: ComponentType<any> }>> => {
  return Promise.all(importFuncs.map(func => func()));
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 图片预加载
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * 批量预加载图片
 */
export const preloadImages = (srcs: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(srcs.map(preloadImage));
};

/**
 * 检查是否支持WebP格式
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * 获取优化后的图片URL
 */
export const getOptimizedImageUrl = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  // 这里可以集成图片CDN服务，如Cloudinary、ImageKit等
  // 目前返回原始URL
  console.log('Optimizing image with options:', options);
  return src;
};

/**
 * 懒加载观察器
 */
export class LazyLoadObserver {
  private observer: IntersectionObserver;
  private elements = new Map<Element, () => void>();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const callback = this.elements.get(entry.target);
          if (callback) {
            callback();
            this.unobserve(entry.target);
          }
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });
  }

  observe(element: Element, callback: () => void): void {
    this.elements.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    this.elements.delete(element);
    this.observer.unobserve(element);
  }

  disconnect(): void {
    this.observer.disconnect();
    this.elements.clear();
  }
}

/**
 * 内存使用监控
 */
export const getMemoryUsage = (): {
  used: number;
  total: number;
  percentage: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
  return null;
};

/**
 * 性能标记
 */
export const performanceMark = {
  start: (name: string): void => {
    performance.mark(`${name}-start`);
  },
  
  end: (name: string): number => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    return measure.duration;
  },
  
  clear: (name: string): void => {
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);
  },
};

/**
 * Bundle分析工具
 */
export const analyzeBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle Analysis:');
    console.log('- Use `npm run build` to analyze bundle size');
    console.log('- Use webpack-bundle-analyzer for detailed analysis');
  }
};

/**
 * 组件渲染性能监控
 */
export const withPerformanceMonitoring = <P extends object>(
  Component: ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = (props: P) => {
    React.useEffect(() => {
      performanceMark.start(`${componentName}-render`);
      
      return () => {
        const duration = performanceMark.end(`${componentName}-render`);
        if (process.env.NODE_ENV === 'development' && duration > 16) {
          console.warn(`${componentName} render took ${duration.toFixed(2)}ms`);
        }
        performanceMark.clear(`${componentName}-render`);
      };
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return WrappedComponent;
};

// 导入React用于withPerformanceMonitoring
import React from 'react';
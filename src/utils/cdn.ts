/**
 * CDN 和静态资源优化工具
 */

// CDN 配置
const CDN_CONFIG = {
  // 图片 CDN
  images: process.env.VITE_IMAGE_CDN || '',
  // 音频 CDN
  audio: process.env.VITE_AUDIO_CDN || '',
  // 静态资源 CDN
  static: process.env.VITE_STATIC_CDN || '',
  // 字体 CDN
  fonts: 'https://fonts.googleapis.com',
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
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string => {
  if (!src) return '';

  // 如果是外部URL，直接返回
  if (src.startsWith('http')) {
    return src;
  }

  // 如果配置了图片CDN
  if (CDN_CONFIG.images) {
    const { width, height, quality = 80, format = 'webp' } = options;
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', format);

    return `${CDN_CONFIG.images}${src}?${params.toString()}`;
  }

  return src;
};

/**
 * 获取音频文件URL
 */
export const getAudioUrl = (src: string): string => {
  if (!src) return '';

  if (src.startsWith('http')) {
    return src;
  }

  if (CDN_CONFIG.audio) {
    return `${CDN_CONFIG.audio}${src}`;
  }

  return src;
};

/**
 * 获取静态资源URL
 */
export const getStaticUrl = (src: string): string => {
  if (!src) return '';

  if (src.startsWith('http')) {
    return src;
  }

  if (CDN_CONFIG.static) {
    return `${CDN_CONFIG.static}${src}`;
  }

  return src;
};

/**
 * 预加载关键资源
 */
export const preloadCriticalResources = (): void => {
  const criticalResources = [
    // 关键CSS
    '/assets/css/critical.css',
    // 关键字体
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    // 关键图片
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
  ];

  criticalResources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (resource.endsWith('.css')) {
      link.as = 'style';
      link.href = resource;
    } else if (resource.includes('fonts.googleapis.com')) {
      link.as = 'style';
      link.href = resource;
    } else if (resource.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
      link.as = 'image';
      link.href = resource;
    }
    
    document.head.appendChild(link);
  });
};

/**
 * 懒加载图片
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor() {
    this.init();
  }

  private init(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.observer?.unobserve(img);
              this.images.delete(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );
    }
  }

  public observe(img: HTMLImageElement): void {
    if (this.observer && img.dataset.src) {
      this.images.add(img);
      this.observer.observe(img);
    } else {
      // 如果不支持 IntersectionObserver，直接加载
      this.loadImage(img);
    }
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.add('loaded');
      img.removeAttribute('data-src');
    }
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// 创建全局懒加载实例
export const lazyImageLoader = new LazyImageLoader();

/**
 * 资源预取管理器
 */
export class ResourcePrefetcher {
  private prefetchedUrls: Set<string> = new Set();

  /**
   * 预取资源
   */
  public prefetch(url: string, type: 'script' | 'style' | 'image' | 'audio' = 'script'): void {
    if (this.prefetchedUrls.has(url)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = type;
    link.href = url;

    document.head.appendChild(link);
    this.prefetchedUrls.add(url);
  }

  /**
   * 预连接到域名
   */
  public preconnect(origin: string): void {
    if (this.prefetchedUrls.has(origin)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;

    document.head.appendChild(link);
    this.prefetchedUrls.add(origin);
  }

  /**
   * DNS预解析
   */
  public dnsPrefetch(origin: string): void {
    if (this.prefetchedUrls.has(`dns-${origin}`)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = origin;

    document.head.appendChild(link);
    this.prefetchedUrls.add(`dns-${origin}`);
  }

  /**
   * 预取下一页资源
   */
  public prefetchNextPageResources(route: string): void {
    const routeResourceMap: Record<string, string[]> = {
      '/practice': [
        '/assets/js/practice-chunk.js',
        '/assets/css/practice.css',
      ],
      '/progress': [
        '/assets/js/progress-chunk.js',
        '/assets/css/charts.css',
      ],
      '/settings': [
        '/assets/js/settings-chunk.js',
      ],
    };

    const resources = routeResourceMap[route];
    if (resources) {
      resources.forEach((resource) => {
        if (resource.endsWith('.js')) {
          this.prefetch(resource, 'script');
        } else if (resource.endsWith('.css')) {
          this.prefetch(resource, 'style');
        }
      });
    }
  }
}

// 创建全局资源预取实例
export const resourcePrefetcher = new ResourcePrefetcher();

/**
 * 性能监控和优化
 */
export class PerformanceMonitor {
  private metrics: Record<string, number> = {};

  constructor() {
    this.init();
  }

  private init(): void {
    // 监听页面加载性能
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.collectLoadMetrics();
        }, 0);
      });
    }

    // 监听长任务
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'longtask') {
              console.warn('Long task detected:', entry);
            }
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // 某些浏览器可能不支持 longtask
      }
    }
  }

  private collectLoadMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      this.metrics = {
        // DNS查询时间
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        // TCP连接时间
        tcpConnect: navigation.connectEnd - navigation.connectStart,
        // 请求响应时间
        request: navigation.responseEnd - navigation.requestStart,
        // DOM解析时间
        domParse: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        // 页面加载完成时间
        pageLoad: navigation.loadEventEnd - navigation.loadEventStart,
        // 首次内容绘制
        fcp: this.getFCP(),
        // 最大内容绘制
        lcp: this.getLCP(),
        // 首次输入延迟
        fid: this.getFID(),
        // 累积布局偏移
        cls: this.getCLS(),
      };

      console.log('Performance Metrics:', this.metrics);
      this.reportMetrics();
    }
  }

  private getFCP(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private getLCP(): number {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        resolve(0);
      }
    }) as any;
  }

  private getFID(): number {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            resolve(entry.processingStart - entry.startTime);
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      } else {
        resolve(0);
      }
    }) as any;
  }

  private getCLS(): number {
    return new Promise((resolve) => {
      let clsValue = 0;
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          resolve(clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } else {
        resolve(0);
      }
    }) as any;
  }

  private reportMetrics(): void {
    // 这里可以将性能数据发送到分析服务
    if (process.env.NODE_ENV === 'production') {
      // 发送到分析服务的逻辑
      console.log('Reporting metrics to analytics service');
    }
  }

  public getMetrics(): Record<string, number> {
    return { ...this.metrics };
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();
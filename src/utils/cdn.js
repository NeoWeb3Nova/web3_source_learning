const CDN_CONFIG = {
    images: process.env.VITE_IMAGE_CDN || '',
    audio: process.env.VITE_AUDIO_CDN || '',
    static: process.env.VITE_STATIC_CDN || '',
    fonts: 'https://fonts.googleapis.com',
};
export const getOptimizedImageUrl = (src, options = {}) => {
    if (!src)
        return '';
    if (src.startsWith('http')) {
        return src;
    }
    if (CDN_CONFIG.images) {
        const { width, height, quality = 80, format = 'webp' } = options;
        const params = new URLSearchParams();
        if (width)
            params.set('w', width.toString());
        if (height)
            params.set('h', height.toString());
        params.set('q', quality.toString());
        params.set('f', format);
        return `${CDN_CONFIG.images}${src}?${params.toString()}`;
    }
    return src;
};
export const getAudioUrl = (src) => {
    if (!src)
        return '';
    if (src.startsWith('http')) {
        return src;
    }
    if (CDN_CONFIG.audio) {
        return `${CDN_CONFIG.audio}${src}`;
    }
    return src;
};
export const getStaticUrl = (src) => {
    if (!src)
        return '';
    if (src.startsWith('http')) {
        return src;
    }
    if (CDN_CONFIG.static) {
        return `${CDN_CONFIG.static}${src}`;
    }
    return src;
};
export const preloadCriticalResources = () => {
    const criticalResources = [
        '/assets/css/critical.css',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
    ];
    criticalResources.forEach((resource) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        if (resource.endsWith('.css')) {
            link.as = 'style';
            link.href = resource;
        }
        else if (resource.includes('fonts.googleapis.com')) {
            link.as = 'style';
            link.href = resource;
        }
        else if (resource.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
            link.as = 'image';
            link.href = resource;
        }
        document.head.appendChild(link);
    });
};
export class LazyImageLoader {
    constructor() {
        Object.defineProperty(this, "observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "images", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        this.init();
    }
    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.observer?.unobserve(img);
                        this.images.delete(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01,
            });
        }
    }
    observe(img) {
        if (this.observer && img.dataset.src) {
            this.images.add(img);
            this.observer.observe(img);
        }
        else {
            this.loadImage(img);
        }
    }
    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        }
    }
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
            this.images.clear();
        }
    }
}
export const lazyImageLoader = new LazyImageLoader();
export class ResourcePrefetcher {
    constructor() {
        Object.defineProperty(this, "prefetchedUrls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
    }
    prefetch(url, type = 'script') {
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
    preconnect(origin) {
        if (this.prefetchedUrls.has(origin)) {
            return;
        }
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        document.head.appendChild(link);
        this.prefetchedUrls.add(origin);
    }
    dnsPrefetch(origin) {
        if (this.prefetchedUrls.has(`dns-${origin}`)) {
            return;
        }
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = origin;
        document.head.appendChild(link);
        this.prefetchedUrls.add(`dns-${origin}`);
    }
    prefetchNextPageResources(route) {
        const routeResourceMap = {
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
                }
                else if (resource.endsWith('.css')) {
                    this.prefetch(resource, 'style');
                }
            });
        }
    }
}
export const resourcePrefetcher = new ResourcePrefetcher();
export class PerformanceMonitor {
    constructor() {
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this.init();
    }
    init() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.collectLoadMetrics();
                }, 0);
            });
        }
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
            }
            catch (e) {
            }
        }
    }
    collectLoadMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics = {
                dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcpConnect: navigation.connectEnd - navigation.connectStart,
                request: navigation.responseEnd - navigation.requestStart,
                domParse: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                pageLoad: navigation.loadEventEnd - navigation.loadEventStart,
                fcp: this.getFCP(),
                lcp: this.getLCP(),
                fid: this.getFID(),
                cls: this.getCLS(),
            };
            console.log('Performance Metrics:', this.metrics);
            this.reportMetrics();
        }
    }
    getFCP() {
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        return fcpEntry ? fcpEntry.startTime : 0;
    }
    getLCP() {
        return new Promise((resolve) => {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            }
            else {
                resolve(0);
            }
        });
    }
    getFID() {
        return new Promise((resolve) => {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        resolve(entry.processingStart - entry.startTime);
                    });
                });
                observer.observe({ entryTypes: ['first-input'] });
            }
            else {
                resolve(0);
            }
        });
    }
    getCLS() {
        return new Promise((resolve) => {
            let clsValue = 0;
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    resolve(clsValue);
                });
                observer.observe({ entryTypes: ['layout-shift'] });
            }
            else {
                resolve(0);
            }
        });
    }
    reportMetrics() {
        if (process.env.NODE_ENV === 'production') {
            console.log('Reporting metrics to analytics service');
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
}
export const performanceMonitor = new PerformanceMonitor();

import { lazy } from 'react';
export const createLazyComponent = (importFunc, displayName) => {
    const LazyComponent = lazy(importFunc);
    if (displayName) {
        LazyComponent.displayName = `Lazy(${displayName})`;
    }
    return LazyComponent;
};
export const preloadComponent = (importFunc) => {
    return importFunc();
};
export const preloadComponents = (importFuncs) => {
    return Promise.all(importFuncs.map(func => func()));
};
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
export const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
export const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};
export const preloadImages = (srcs) => {
    return Promise.all(srcs.map(preloadImage));
};
export const supportsWebP = () => {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
};
export const getOptimizedImageUrl = (src, options = {}) => {
    console.log('Optimizing image with options:', options);
    return src;
};
export class LazyLoadObserver {
    constructor(options = {}) {
        Object.defineProperty(this, "observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "elements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
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
    observe(element, callback) {
        this.elements.set(element, callback);
        this.observer.observe(element);
    }
    unobserve(element) {
        this.elements.delete(element);
        this.observer.unobserve(element);
    }
    disconnect() {
        this.observer.disconnect();
        this.elements.clear();
    }
}
export const getMemoryUsage = () => {
    if ('memory' in performance) {
        const memory = performance.memory;
        return {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        };
    }
    return null;
};
export const performanceMark = {
    start: (name) => {
        performance.mark(`${name}-start`);
    },
    end: (name) => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        return measure.duration;
    },
    clear: (name) => {
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);
    },
};
export const analyzeBundleSize = () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Bundle Analysis:');
        console.log('- Use `npm run build` to analyze bundle size');
        console.log('- Use webpack-bundle-analyzer for detailed analysis');
    }
};
export const withPerformanceMonitoring = (Component, componentName) => {
    const WrappedComponent = (props) => {
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
import React from 'react';

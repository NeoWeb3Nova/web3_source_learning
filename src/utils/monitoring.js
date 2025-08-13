export class ErrorTracker {
    constructor() {
        Object.defineProperty(this, "sessionId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "userId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "errorQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "isOnline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: navigator.onLine
        });
        this.sessionId = this.generateSessionId();
        this.init();
    }
    init() {
        window.addEventListener('error', (event) => {
            this.captureError({
                message: event.message,
                stack: event.error?.stack,
                url: event.filename,
                line: event.lineno,
                column: event.colno,
            });
        });
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError({
                message: `Unhandled Promise Rejection: ${event.reason}`,
                stack: event.reason?.stack,
            });
        });
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushErrorQueue();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        window.addEventListener('beforeunload', () => {
            this.flushErrorQueue();
        });
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    setUserId(userId) {
        this.userId = userId;
    }
    captureError(error) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            componentStack: error.componentStack,
            errorBoundary: error.errorBoundary,
            url: error.url || window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            userId: this.userId,
            sessionId: this.sessionId,
            buildVersion: window.__APP_VERSION__ || 'unknown',
            environment: import.meta.env.MODE || 'development',
        };
        console.error('Error captured:', errorInfo);
        if (this.isOnline) {
            this.sendError(errorInfo);
        }
        else {
            this.errorQueue.push(errorInfo);
        }
    }
    async sendError(errorInfo) {
        try {
            if (import.meta.env.VITE_SENTRY_DSN) {
                await this.sendToSentry(errorInfo);
            }
            else {
                await this.sendToCustomEndpoint(errorInfo);
            }
        }
        catch (e) {
            console.error('Failed to send error:', e);
            this.errorQueue.push(errorInfo);
        }
    }
    async sendToSentry(errorInfo) {
        console.log('Sending error to Sentry:', errorInfo);
    }
    async sendToCustomEndpoint(errorInfo) {
        const endpoint = import.meta.env.VITE_ERROR_ENDPOINT || '/api/errors';
        await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorInfo),
        });
    }
    flushErrorQueue() {
        if (this.errorQueue.length > 0 && this.isOnline) {
            const errors = [...this.errorQueue];
            this.errorQueue = [];
            errors.forEach((error) => {
                this.sendError(error);
            });
        }
    }
}
export class PerformanceTracker {
    constructor() {
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "observers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.init();
    }
    init() {
        // Only collect metrics in production
        if (!import.meta.env.PROD) return;
        
        if (document.readyState === 'complete') {
            this.collectMetrics();
        }
        else {
            window.addEventListener('load', () => {
                setTimeout(() => this.collectMetrics(), 0);
            });
        }
        this.observePerformanceEntries();
    }
    observePerformanceEntries() {
        if ('PerformanceObserver' in window) {
            const navObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'navigation') {
                        const navEntry = entry;
                        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
                        this.metrics.domLoad = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
                        this.metrics.pageLoad = navEntry.loadEventEnd - navEntry.loadEventStart;
                    }
                });
            });
            navObserver.observe({ entryTypes: ['navigation'] });
            this.observers.push(navObserver);
            const paintObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = entry.startTime;
                    }
                });
            });
            paintObserver.observe({ entryTypes: ['paint'] });
            this.observers.push(paintObserver);
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(lcpObserver);
            const fidObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.push(fidObserver);
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(clsObserver);
        }
    }
    collectMetrics() {
        if ('memory' in performance) {
            const memory = performance.memory;
            this.metrics.memoryUsage = memory.usedJSHeapSize;
        }
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.metrics.connectionType = connection.effectiveType;
        }
        this.sendMetrics();
    }
    async sendMetrics() {
        try {
            const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics';
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'performance',
                    metrics: this.metrics,
                    timestamp: Date.now(),
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                }),
            });
            console.log('Performance metrics sent:', this.metrics);
        }
        catch (error) {
            console.error('Failed to send performance metrics:', error);
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
    disconnect() {
        this.observers.forEach((observer) => observer.disconnect());
        this.observers = [];
    }
}
export class UserBehaviorTracker {
    constructor() {
        Object.defineProperty(this, "sessionId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "userId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "isOnline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: navigator.onLine
        });
        this.sessionId = this.generateSessionId();
        this.init();
    }
    init() {
        // Only track in production
        if (!import.meta.env.PROD) return;
        
        document.addEventListener('click', (event) => {
            const target = event.target;
            this.trackEvent({
                type: 'click',
                target: this.getElementSelector(target),
                data: {
                    x: event.clientX,
                    y: event.clientY,
                    button: event.button,
                },
            });
        });
        window.addEventListener('popstate', () => {
            this.trackEvent({
                type: 'navigation',
                target: window.location.pathname,
            });
        });
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushEventQueue();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        window.addEventListener('beforeunload', () => {
            this.flushEventQueue();
        });
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getElementSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        if (element.className) {
            return `.${element.className.split(' ').join('.')}`;
        }
        return element.tagName.toLowerCase();
    }
    setUserId(userId) {
        this.userId = userId;
    }
    trackEvent(event) {
        const userEvent = {
            ...event,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId,
        };
        if (this.isOnline) {
            this.sendEvent(userEvent);
        }
        else {
            this.eventQueue.push(userEvent);
        }
    }
    async sendEvent(event) {
        try {
            const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics';
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'user_event',
                    event,
                }),
            });
        }
        catch (error) {
            console.error('Failed to send user event:', error);
            this.eventQueue.push(event);
        }
    }
    flushEventQueue() {
        if (this.eventQueue.length > 0 && this.isOnline) {
            const events = [...this.eventQueue];
            this.eventQueue = [];
            events.forEach((event) => {
                this.sendEvent(event);
            });
        }
    }
}
export class HealthChecker {
    constructor(endpoints = []) {
        Object.defineProperty(this, "checkInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 30000
        });
        Object.defineProperty(this, "intervalId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endpoints", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.endpoints = endpoints;
        this.init();
    }
    init() {
        this.startHealthCheck();
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.startHealthCheck();
            }
            else {
                this.stopHealthCheck();
            }
        });
    }
    startHealthCheck() {
        this.stopHealthCheck();
        this.intervalId = window.setInterval(() => {
            this.performHealthCheck();
        }, this.checkInterval);
        this.performHealthCheck();
    }
    stopHealthCheck() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }
    async performHealthCheck() {
        const results = await Promise.allSettled(this.endpoints.map((endpoint) => this.checkEndpoint(endpoint)));
        results.forEach((result, index) => {
            const endpoint = this.endpoints[index];
            if (result.status === 'rejected') {
                console.warn(`Health check failed for ${endpoint}:`, result.reason);
                this.reportHealthIssue(endpoint, result.reason);
            }
        });
    }
    async checkEndpoint(endpoint) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
            const response = await fetch(endpoint, {
                method: 'HEAD',
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    reportHealthIssue(endpoint, error) {
        console.error(`Health issue detected for ${endpoint}:`, error);
        if (import.meta.env.PROD) {
        }
    }
    addEndpoint(endpoint) {
        if (!this.endpoints.includes(endpoint)) {
            this.endpoints.push(endpoint);
        }
    }
    removeEndpoint(endpoint) {
        const index = this.endpoints.indexOf(endpoint);
        if (index > -1) {
            this.endpoints.splice(index, 1);
        }
    }
    destroy() {
        this.stopHealthCheck();
    }
}
export const errorTracker = new ErrorTracker();
export const performanceTracker = new PerformanceTracker();
export const userBehaviorTracker = new UserBehaviorTracker();
export const healthChecker = new HealthChecker([
    '/api/health',
    '/api/vocabulary',
]);
export const initializeMonitoring = () => {
    console.log('Monitoring services initialized');
    
    // Only enable monitoring in production
    if (import.meta.env.PROD) {
        window.addEventListener('error', (event) => {
            errorTracker.captureError({
                message: event.message,
                stack: event.error?.stack,
                url: event.filename,
            });
        });
        window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = {
            onError: (error, errorInfo) => {
                errorTracker.captureError({
                    message: error.message,
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                });
            },
        };
    }
};

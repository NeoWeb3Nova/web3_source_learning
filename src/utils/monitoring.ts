/**
 * 监控和错误追踪服务
 */

// 错误类型定义
export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  buildVersion: string;
  environment: string;
}

// 性能指标类型定义
export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domLoad: number; // DOM Load Time
  pageLoad: number; // Page Load Time
  memoryUsage?: number;
  connectionType?: string;
}

// 用户行为事件类型定义
export interface UserEvent {
  type: 'click' | 'navigation' | 'search' | 'practice' | 'achievement';
  target: string;
  data?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

/**
 * 错误追踪管理器
 */
export class ErrorTracker {
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorInfo[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private init(): void {
    // 监听全局错误
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    });

    // 监听Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
      });
    });

    // 监听网络状态
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 页面卸载时发送剩余错误
    window.addEventListener('beforeunload', () => {
      this.flushErrorQueue();
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public captureError(error: {
    message: string;
    stack?: string;
    componentStack?: string;
    errorBoundary?: string;
    url?: string;
    line?: number;
    column?: number;
  }): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: error.componentStack,
      errorBoundary: error.errorBoundary,
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      buildVersion: (window as any).__APP_VERSION__ || 'unknown',
      environment: process.env.NODE_ENV || 'development',
    };

    console.error('Error captured:', errorInfo);

    if (this.isOnline) {
      this.sendError(errorInfo);
    } else {
      this.errorQueue.push(errorInfo);
    }
  }

  private async sendError(errorInfo: ErrorInfo): Promise<void> {
    try {
      // 这里可以集成第三方错误追踪服务，如 Sentry
      if (process.env.VITE_SENTRY_DSN) {
        // Sentry 集成示例
        await this.sendToSentry(errorInfo);
      } else {
        // 发送到自定义错误收集端点
        await this.sendToCustomEndpoint(errorInfo);
      }
    } catch (e) {
      console.error('Failed to send error:', e);
      this.errorQueue.push(errorInfo);
    }
  }

  private async sendToSentry(errorInfo: ErrorInfo): Promise<void> {
    // Sentry 集成逻辑
    // 这里需要安装和配置 @sentry/browser
    console.log('Sending error to Sentry:', errorInfo);
  }

  private async sendToCustomEndpoint(errorInfo: ErrorInfo): Promise<void> {
    const endpoint = process.env.VITE_ERROR_ENDPOINT || '/api/errors';
    
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorInfo),
    });
  }

  private flushErrorQueue(): void {
    if (this.errorQueue.length > 0 && this.isOnline) {
      const errors = [...this.errorQueue];
      this.errorQueue = [];
      
      errors.forEach((error) => {
        this.sendError(error);
      });
    }
  }
}

/**
 * 性能监控管理器
 */
export class PerformanceTracker {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    // 监听页面加载完成
    if (document.readyState === 'complete') {
      this.collectMetrics();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.collectMetrics(), 0);
      });
    }

    // 监听性能条目
    this.observePerformanceEntries();
  }

  private observePerformanceEntries(): void {
    if ('PerformanceObserver' in window) {
      // 监听导航时间
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
            this.metrics.domLoad = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
            this.metrics.pageLoad = navEntry.loadEventEnd - navEntry.loadEventStart;
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // 监听绘制时间
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // 监听最大内容绘制
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // 监听首次输入延迟
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // 监听累积布局偏移
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
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

  private collectMetrics(): void {
    // 收集内存使用情况
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
    }

    // 收集网络连接信息
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.connectionType = connection.effectiveType;
    }

    // 发送性能指标
    this.sendMetrics();
  }

  private async sendMetrics(): Promise<void> {
    try {
      const endpoint = process.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics';
      
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
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

/**
 * 用户行为追踪管理器
 */
export class UserBehaviorTracker {
  private sessionId: string;
  private userId?: string;
  private eventQueue: UserEvent[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private init(): void {
    // 监听点击事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
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

    // 监听页面导航
    window.addEventListener('popstate', () => {
      this.trackEvent({
        type: 'navigation',
        target: window.location.pathname,
      });
    });

    // 监听网络状态
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEventQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 页面卸载时发送剩余事件
    window.addEventListener('beforeunload', () => {
      this.flushEventQueue();
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public trackEvent(event: Omit<UserEvent, 'timestamp' | 'sessionId' | 'userId'>): void {
    const userEvent: UserEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    if (this.isOnline) {
      this.sendEvent(userEvent);
    } else {
      this.eventQueue.push(userEvent);
    }
  }

  private async sendEvent(event: UserEvent): Promise<void> {
    try {
      const endpoint = process.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics';
      
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
    } catch (error) {
      console.error('Failed to send user event:', error);
      this.eventQueue.push(event);
    }
  }

  private flushEventQueue(): void {
    if (this.eventQueue.length > 0 && this.isOnline) {
      const events = [...this.eventQueue];
      this.eventQueue = [];
      
      events.forEach((event) => {
        this.sendEvent(event);
      });
    }
  }
}

/**
 * 健康检查管理器
 */
export class HealthChecker {
  private checkInterval: number = 30000; // 30秒
  private intervalId?: number;
  private endpoints: string[] = [];

  constructor(endpoints: string[] = []) {
    this.endpoints = endpoints;
    this.init();
  }

  private init(): void {
    this.startHealthCheck();
    
    // 页面可见性变化时重新开始检查
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.startHealthCheck();
      } else {
        this.stopHealthCheck();
      }
    });
  }

  private startHealthCheck(): void {
    this.stopHealthCheck();
    
    this.intervalId = window.setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);
    
    // 立即执行一次检查
    this.performHealthCheck();
  }

  private stopHealthCheck(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async performHealthCheck(): Promise<void> {
    const results = await Promise.allSettled(
      this.endpoints.map((endpoint) => this.checkEndpoint(endpoint))
    );

    results.forEach((result, index) => {
      const endpoint = this.endpoints[index];
      if (result.status === 'rejected') {
        console.warn(`Health check failed for ${endpoint}:`, result.reason);
        this.reportHealthIssue(endpoint, result.reason);
      }
    });
  }

  private async checkEndpoint(endpoint: string): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    try {
      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private reportHealthIssue(endpoint: string, error: any): void {
    // 报告健康检查问题
    console.error(`Health issue detected for ${endpoint}:`, error);
    
    // 这里可以发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 发送健康检查失败报告
    }
  }

  public addEndpoint(endpoint: string): void {
    if (!this.endpoints.includes(endpoint)) {
      this.endpoints.push(endpoint);
    }
  }

  public removeEndpoint(endpoint: string): void {
    const index = this.endpoints.indexOf(endpoint);
    if (index > -1) {
      this.endpoints.splice(index, 1);
    }
  }

  public destroy(): void {
    this.stopHealthCheck();
  }
}

// 创建全局监控实例
export const errorTracker = new ErrorTracker();
export const performanceTracker = new PerformanceTracker();
export const userBehaviorTracker = new UserBehaviorTracker();
export const healthChecker = new HealthChecker([
  '/api/health',
  '/api/vocabulary',
]);

// 初始化监控服务
export const initializeMonitoring = (): void => {
  console.log('Monitoring services initialized');
  
  // 设置全局错误处理
  window.addEventListener('error', (event) => {
    errorTracker.captureError({
      message: event.message,
      stack: event.error?.stack,
      url: event.filename,
    });
  });

  // React 错误边界集成
  (window as any).__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = {
    onError: (error: Error, errorInfo: any) => {
      errorTracker.captureError({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    },
  };
};
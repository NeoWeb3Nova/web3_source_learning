/**
 * Sentry 错误追踪集成
 */

// 注意：这个文件需要安装 @sentry/react 和 @sentry/tracing
// npm install @sentry/react @sentry/tracing

/*
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

// Sentry 配置
export const initSentry = (): void => {
  if (process.env.NODE_ENV === 'production' && process.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.VITE_APP_VERSION,
      
      // 性能监控
      integrations: [
        new Integrations.BrowserTracing({
          // 路由变化追踪
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
        }),
      ],
      
      // 性能监控采样率
      tracesSampleRate: 0.1,
      
      // 错误采样率
      sampleRate: 1.0,
      
      // 用户会话重放
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // 过滤敏感信息
      beforeSend(event, hint) {
        // 过滤掉开发环境的错误
        if (process.env.NODE_ENV === 'development') {
          return null;
        }
        
        // 过滤掉某些不重要的错误
        if (event.exception) {
          const error = hint.originalException;
          if (error && error.message) {
            // 过滤网络错误
            if (error.message.includes('Network Error')) {
              return null;
            }
            
            // 过滤取消的请求
            if (error.message.includes('AbortError')) {
              return null;
            }
          }
        }
        
        return event;
      },
      
      // 设置用户上下文
      initialScope: {
        tags: {
          component: 'web3-defi-vocab-battle',
        },
        user: {
          id: localStorage.getItem('userId') || 'anonymous',
        },
      },
    });
    
    console.log('Sentry initialized');
  }
};

// 设置用户信息
export const setSentryUser = (user: {
  id: string;
  email?: string;
  username?: string;
}): void => {
  Sentry.setUser(user);
};

// 设置标签
export const setSentryTag = (key: string, value: string): void => {
  Sentry.setTag(key, value);
};

// 设置上下文
export const setSentryContext = (key: string, context: any): void => {
  Sentry.setContext(key, context);
};

// 手动捕获异常
export const captureException = (error: Error, context?: any): void => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional_info', context);
    }
    Sentry.captureException(error);
  });
};

// 手动捕获消息
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info'): void => {
  Sentry.captureMessage(message, level);
};

// 添加面包屑
export const addBreadcrumb = (breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: any;
}): void => {
  Sentry.addBreadcrumb(breadcrumb);
};

// 性能监控
export const startTransaction = (name: string, op: string): Sentry.Transaction => {
  return Sentry.startTransaction({ name, op });
};

// React 错误边界
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// 高阶组件包装
export const withSentryProfiling = Sentry.withProfiler;
*/

// 由于没有安装 Sentry，这里提供一个模拟实现
export const initSentry = (): void => {
  console.log('Sentry would be initialized here in production');
};

export const setSentryUser = (user: any): void => {
  console.log('Sentry user would be set:', user);
};

export const setSentryTag = (key: string, value: string): void => {
  console.log('Sentry tag would be set:', key, value);
};

export const setSentryContext = (key: string, context: any): void => {
  console.log('Sentry context would be set:', key, context);
};

export const captureException = (error: Error, context?: any): void => {
  console.error('Sentry would capture exception:', error, context);
};

export const captureMessage = (message: string, level: string = 'info'): void => {
  console.log('Sentry would capture message:', message, level);
};

export const addBreadcrumb = (breadcrumb: any): void => {
  console.log('Sentry would add breadcrumb:', breadcrumb);
};

export const startTransaction = (name: string, op: string): any => {
  console.log('Sentry would start transaction:', name, op);
  return {
    finish: () => console.log('Transaction finished'),
    setTag: (key: string, value: string) => console.log('Transaction tag:', key, value),
  };
};

// 模拟错误边界
export const SentryErrorBoundary = (component: any) => component;

// 模拟性能分析
export const withSentryProfiling = (component: any) => component;
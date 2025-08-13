// Error handling service for centralized error management

export interface ErrorReport {
  id: string;
  timestamp: Date;
  type: ErrorType;
  message: string;
  stack?: string;
  userAgent: string;
  url: string;
  userId?: string;
  context?: Record<string, any>;
}

export type ErrorType = 
  | 'network'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'server_error'
  | 'client_error'
  | 'timeout'
  | 'unknown';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  fallbackMessage?: string;
}

class ErrorService {
  private errorReports: ErrorReport[] = [];
  private maxReports = 100; // Keep last 100 error reports

  // Generate unique error ID
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Classify error type based on error object
  private classifyError(error: any): ErrorType {
    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      return 'network';
    }
    
    if (error.name === 'ValidationError') {
      return 'validation';
    }
    
    if (error.status === 401) {
      return 'authentication';
    }
    
    if (error.status === 403) {
      return 'authorization';
    }
    
    if (error.status === 404) {
      return 'not_found';
    }
    
    if (error.status >= 500) {
      return 'server_error';
    }
    
    if (error.status >= 400) {
      return 'client_error';
    }
    
    if (error.name === 'TimeoutError') {
      return 'timeout';
    }
    
    return 'unknown';
  }

  // Get user-friendly error message
  private getUserFriendlyMessage(errorType: ErrorType, originalMessage?: string): string {
    const messages = {
      network: '网络连接失败，请检查您的网络设置',
      validation: '输入的数据格式不正确，请检查后重试',
      authentication: '您需要登录才能继续操作',
      authorization: '您没有权限执行此操作',
      not_found: '请求的资源不存在',
      server_error: '服务器暂时无法处理您的请求，请稍后重试',
      client_error: '请求格式错误，请检查输入信息',
      timeout: '请求超时，请检查网络连接后重试',
      unknown: '发生了未知错误，请稍后重试',
    };

    return messages[errorType] || originalMessage || messages.unknown;
  }

  // Create error report
  private createErrorReport(error: any, context?: Record<string, any>): ErrorReport {
    const errorType = this.classifyError(error);
    
    return {
      id: this.generateErrorId(),
      timestamp: new Date(),
      type: errorType,
      message: error.message || 'Unknown error',
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      context,
    };
  }

  // Store error report
  private storeErrorReport(report: ErrorReport): void {
    this.errorReports.unshift(report);
    
    // Keep only the most recent reports
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(0, this.maxReports);
    }

    // Store in localStorage for persistence
    try {
      const reportsToStore = this.errorReports.slice(0, 10); // Store only last 10
      localStorage.setItem('error_reports', JSON.stringify(reportsToStore));
    } catch (e) {
      console.warn('Failed to store error reports in localStorage:', e);
    }
  }

  // Load error reports from localStorage
  private loadErrorReports(): void {
    try {
      const stored = localStorage.getItem('error_reports');
      if (stored) {
        const reports = JSON.parse(stored);
        this.errorReports = reports.map((report: any) => ({
          ...report,
          timestamp: new Date(report.timestamp),
        }));
      }
    } catch (e) {
      console.warn('Failed to load error reports from localStorage:', e);
    }
  }

  // Initialize error service
  public initialize(): void {
    this.loadErrorReports();

    // Global error handler for unhandled errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, { 
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, { 
        type: 'unhandled_promise_rejection',
      });
    });
  }

  // Main error handling method
  public handleError(
    error: any, 
    context?: Record<string, any>, 
    options: ErrorHandlerOptions = {}
  ): ErrorReport {
    const {
      showToast = true,
      logToConsole = true,
      reportToService = false,
      fallbackMessage,
    } = options;

    // Create error report
    const report = this.createErrorReport(error, context);
    
    // Store error report
    this.storeErrorReport(report);

    // Log to console in development
    if (logToConsole && process.env.NODE_ENV === 'development') {
      console.error('Error handled by ErrorService:', {
        report,
        originalError: error,
        context,
      });
    }

    // Show user-friendly message
    if (showToast) {
      const message = fallbackMessage || this.getUserFriendlyMessage(report.type, error.message);
      this.showErrorToast(message, report.type);
    }

    // Report to external service (if configured)
    if (reportToService) {
      this.reportToExternalService(report);
    }

    return report;
  }

  // Show error toast notification
  private showErrorToast(message: string, type: ErrorType): void {
    // Dispatch custom event that can be caught by toast hook
    const event = new CustomEvent('show-error-toast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  // Report error to external monitoring service
  private async reportToExternalService(report: ErrorReport): Promise<void> {
    try {
      // This would send the error to a service like Sentry, LogRocket, etc.
      // For now, we'll just log it
      console.log('Reporting error to external service:', report);
      
      // Example implementation:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });
    } catch (e) {
      console.warn('Failed to report error to external service:', e);
    }
  }

  // Get error reports for debugging
  public getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  // Clear error reports
  public clearErrorReports(): void {
    this.errorReports = [];
    localStorage.removeItem('error_reports');
  }

  // Get error statistics
  public getErrorStatistics(): {
    total: number;
    byType: Record<ErrorType, number>;
    recent: number; // Last 24 hours
  } {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const byType: Record<ErrorType, number> = {
      network: 0,
      validation: 0,
      authentication: 0,
      authorization: 0,
      not_found: 0,
      server_error: 0,
      client_error: 0,
      timeout: 0,
      unknown: 0,
    };

    let recent = 0;

    this.errorReports.forEach(report => {
      byType[report.type]++;
      if (report.timestamp > oneDayAgo) {
        recent++;
      }
    });

    return {
      total: this.errorReports.length,
      byType,
      recent,
    };
  }

  // Retry mechanism for failed operations
  public async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000,
    backoff: number = 2
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          // Final attempt failed, handle the error
          this.handleError(error, { 
            retryAttempt: attempt,
            maxAttempts,
          });
          throw error;
        }

        // Wait before next attempt
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError;
  }
}

// Create singleton instance
export const errorService = new ErrorService();

// Initialize on module load
errorService.initialize();

// Export convenience functions
export const handleError = (error: any, context?: Record<string, any>, options?: ErrorHandlerOptions) => 
  errorService.handleError(error, context, options);

export const retryOperation = <T>(
  operation: () => Promise<T>,
  maxAttempts?: number,
  delay?: number,
  backoff?: number
) => errorService.retry(operation, maxAttempts, delay, backoff);

export default errorService;
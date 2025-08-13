class ErrorService {
    constructor() {
        Object.defineProperty(this, "errorReports", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "maxReports", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
    }
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    classifyError(error) {
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
    getUserFriendlyMessage(errorType, originalMessage) {
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
    createErrorReport(error, context) {
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
    storeErrorReport(report) {
        this.errorReports.unshift(report);
        if (this.errorReports.length > this.maxReports) {
            this.errorReports = this.errorReports.slice(0, this.maxReports);
        }
        try {
            const reportsToStore = this.errorReports.slice(0, 10);
            localStorage.setItem('error_reports', JSON.stringify(reportsToStore));
        }
        catch (e) {
            console.warn('Failed to store error reports in localStorage:', e);
        }
    }
    loadErrorReports() {
        try {
            const stored = localStorage.getItem('error_reports');
            if (stored) {
                const reports = JSON.parse(stored);
                this.errorReports = reports.map((report) => ({
                    ...report,
                    timestamp: new Date(report.timestamp),
                }));
            }
        }
        catch (e) {
            console.warn('Failed to load error reports from localStorage:', e);
        }
    }
    initialize() {
        this.loadErrorReports();
        window.addEventListener('error', (event) => {
            this.handleError(event.error, {
                type: 'global_error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            });
        });
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                type: 'unhandled_promise_rejection',
            });
        });
    }
    handleError(error, context, options = {}) {
        const { showToast = true, logToConsole = true, reportToService = false, fallbackMessage, } = options;
        const report = this.createErrorReport(error, context);
        this.storeErrorReport(report);
        if (logToConsole && process.env.NODE_ENV === 'development') {
            console.error('Error handled by ErrorService:', {
                report,
                originalError: error,
                context,
            });
        }
        if (showToast) {
            const message = fallbackMessage || this.getUserFriendlyMessage(report.type, error.message);
            this.showErrorToast(message, report.type);
        }
        if (reportToService) {
            this.reportToExternalService(report);
        }
        return report;
    }
    showErrorToast(message, type) {
        const event = new CustomEvent('show-error-toast', {
            detail: { message, type }
        });
        window.dispatchEvent(event);
    }
    async reportToExternalService(report) {
        try {
            console.log('Reporting error to external service:', report);
        }
        catch (e) {
            console.warn('Failed to report error to external service:', e);
        }
    }
    getErrorReports() {
        return [...this.errorReports];
    }
    clearErrorReports() {
        this.errorReports = [];
        localStorage.removeItem('error_reports');
    }
    getErrorStatistics() {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const byType = {
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
    async retry(operation, maxAttempts = 3, delay = 1000, backoff = 2) {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt === maxAttempts) {
                    this.handleError(error, {
                        retryAttempt: attempt,
                        maxAttempts,
                    });
                    throw error;
                }
                const waitTime = delay * Math.pow(backoff, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        throw lastError;
    }
}
export const errorService = new ErrorService();
errorService.initialize();
export const handleError = (error, context, options) => errorService.handleError(error, context, options);
export const retryOperation = (operation, maxAttempts, delay, backoff) => errorService.retry(operation, maxAttempts, delay, backoff);
export default errorService;

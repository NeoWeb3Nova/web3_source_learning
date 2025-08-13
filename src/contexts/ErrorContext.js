import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect } from 'react';
import { errorService } from '../services/errorService';
import useToast from '../hooks/useToast';
import ErrorBoundary from '../components/common/ErrorBoundary';
import OfflineNotification from '../components/common/OfflineNotification';
const ErrorContext = createContext(undefined);
export const ErrorProvider = ({ children, enableOfflineNotification = true, enableErrorBoundary = true, }) => {
    const { error: showErrorToast } = useToast();
    useEffect(() => {
        const handleErrorToast = (event) => {
            const { message, type } = event.detail;
            showErrorToast('错误', message);
        };
        window.addEventListener('show-error-toast', handleErrorToast);
        return () => {
            window.removeEventListener('show-error-toast', handleErrorToast);
        };
    }, [showErrorToast]);
    const contextValue = {
        handleError: errorService.handleError.bind(errorService),
        getErrorReports: errorService.getErrorReports.bind(errorService),
        clearErrorReports: errorService.clearErrorReports.bind(errorService),
        retryOperation: errorService.retry.bind(errorService),
    };
    const content = (_jsxs(ErrorContext.Provider, { value: contextValue, children: [children, enableOfflineNotification && _jsx(OfflineNotification, {})] }));
    if (enableErrorBoundary) {
        return (_jsx(ErrorBoundary, { onError: (error, errorInfo) => {
                errorService.handleError(error, {
                    componentStack: errorInfo.componentStack,
                    errorBoundary: true,
                });
            }, children: content }));
    }
    return content;
};
export const useError = () => {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};
export default ErrorProvider;

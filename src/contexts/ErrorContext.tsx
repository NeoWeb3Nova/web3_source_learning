import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { errorService, ErrorReport, ErrorHandlerOptions } from '../services/errorService';
import useToast from '../hooks/useToast';
import ErrorBoundary from '../components/common/ErrorBoundary';
import OfflineNotification from '../components/common/OfflineNotification';

interface ErrorContextValue {
  handleError: (error: any, context?: Record<string, any>, options?: ErrorHandlerOptions) => ErrorReport;
  getErrorReports: () => ErrorReport[];
  clearErrorReports: () => void;
  retryOperation: <T>(
    operation: () => Promise<T>,
    maxAttempts?: number,
    delay?: number,
    backoff?: number
  ) => Promise<T>;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
  enableOfflineNotification?: boolean;
  enableErrorBoundary?: boolean;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  enableOfflineNotification = true,
  enableErrorBoundary = true,
}) => {
  const { error: showErrorToast } = useToast();

  useEffect(() => {
    // Listen for error toast events from error service
    const handleErrorToast = (event: CustomEvent) => {
      const { message, type } = event.detail;
      showErrorToast('错误', message);
    };

    window.addEventListener('show-error-toast', handleErrorToast as EventListener);

    return () => {
      window.removeEventListener('show-error-toast', handleErrorToast as EventListener);
    };
  }, [showErrorToast]);

  const contextValue: ErrorContextValue = {
    handleError: errorService.handleError.bind(errorService),
    getErrorReports: errorService.getErrorReports.bind(errorService),
    clearErrorReports: errorService.clearErrorReports.bind(errorService),
    retryOperation: errorService.retry.bind(errorService),
  };

  const content = (
    <ErrorContext.Provider value={contextValue}>
      {children}
      {enableOfflineNotification && <OfflineNotification />}
    </ErrorContext.Provider>
  );

  if (enableErrorBoundary) {
    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          errorService.handleError(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
          });
        }}
      >
        {content}
      </ErrorBoundary>
    );
  }

  return content;
};

export const useError = (): ErrorContextValue => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorProvider;
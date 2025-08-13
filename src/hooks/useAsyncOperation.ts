import { useState, useCallback, useRef, useEffect } from 'react';
import { useError } from '../contexts/ErrorContext';

export interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
  retryable?: boolean;
  maxRetries?: number;
}

export interface UseAsyncOperationReturn<T> {
  state: AsyncOperationState<T>;
  execute: (...args: any[]) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
  cancel: () => void;
}

const useAsyncOperation = <T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> => {
  const {
    onSuccess,
    onError,
    showErrorToast = true,
    retryable = true,
    maxRetries = 3,
  } = options;

  const { handleError, retryOperation } = useError();
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const lastArgsRef = useRef<any[]>([]);
  const cancelTokenRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
    cancelTokenRef.current.cancelled = false;
  }, []);

  // Cancel operation
  const cancel = useCallback(() => {
    cancelTokenRef.current.cancelled = true;
    setState(prev => ({
      ...prev,
      loading: false,
    }));
  }, []);

  // Execute async operation
  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Store args for retry
    lastArgsRef.current = args;
    
    // Create new cancel token
    cancelTokenRef.current = { cancelled: false };
    const currentCancelToken = cancelTokenRef.current;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const result = await asyncFunction(...args);

      // Check if operation was cancelled
      if (currentCancelToken.cancelled) {
        return null;
      }

      setState({
        data: result,
        loading: false,
        error: null,
        success: true,
      });

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      // Check if operation was cancelled
      if (currentCancelToken.cancelled) {
        return null;
      }

      const errorObj = error as Error;

      setState({
        data: null,
        loading: false,
        error: errorObj,
        success: false,
      });

      // Handle error through error service
      if (showErrorToast) {
        handleError(errorObj, {
          operation: asyncFunction.name || 'async_operation',
          args: args.length > 0 ? args : undefined,
        });
      }

      if (onError) {
        onError(errorObj);
      }

      throw errorObj;
    }
  }, [asyncFunction, onSuccess, onError, showErrorToast, handleError]);

  // Retry with exponential backoff
  const retry = useCallback(async (): Promise<T | null> => {
    if (!retryable) {
      throw new Error('This operation is not retryable');
    }

    try {
      return await retryOperation(
        () => asyncFunction(...lastArgsRef.current),
        maxRetries
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        loading: false,
        success: false,
      }));
      throw error;
    }
  }, [retryable, retryOperation, asyncFunction, maxRetries]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    state,
    execute,
    retry,
    reset,
    cancel,
  };
};

export default useAsyncOperation;
import { useState, useCallback, useRef, useEffect } from 'react';
import { useError } from '../contexts/ErrorContext';
const useAsyncOperation = (asyncFunction, options = {}) => {
    const { onSuccess, onError, showErrorToast = true, retryable = true, maxRetries = 3, } = options;
    const { handleError, retryOperation } = useError();
    const [state, setState] = useState({
        data: null,
        loading: false,
        error: null,
        success: false,
    });
    const lastArgsRef = useRef([]);
    const cancelTokenRef = useRef({ cancelled: false });
    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
            success: false,
        });
        cancelTokenRef.current.cancelled = false;
    }, []);
    const cancel = useCallback(() => {
        cancelTokenRef.current.cancelled = true;
        setState(prev => ({
            ...prev,
            loading: false,
        }));
    }, []);
    const execute = useCallback(async (...args) => {
        lastArgsRef.current = args;
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
        }
        catch (error) {
            if (currentCancelToken.cancelled) {
                return null;
            }
            const errorObj = error;
            setState({
                data: null,
                loading: false,
                error: errorObj,
                success: false,
            });
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
    const retry = useCallback(async () => {
        if (!retryable) {
            throw new Error('This operation is not retryable');
        }
        try {
            return await retryOperation(() => asyncFunction(...lastArgsRef.current), maxRetries);
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                error: error,
                loading: false,
                success: false,
            }));
            throw error;
        }
    }, [retryable, retryOperation, asyncFunction, maxRetries]);
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
export { useAsyncOperation };
export default useAsyncOperation;

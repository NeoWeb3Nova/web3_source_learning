// API error handling utilities

import { errorService } from '../services/errorService';

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: any;
  url?: string;
  method?: string;
}

export interface ApiErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  retryable?: boolean;
  context?: Record<string, any>;
}

// Create API error from response
export const createApiError = (
  response: Response,
  data?: any,
  url?: string,
  method?: string
): ApiError => {
  const error = new Error(`API Error: ${response.status} ${response.statusText}`) as ApiError;
  error.name = 'ApiError';
  error.status = response.status;
  error.statusText = response.statusText;
  error.data = data;
  error.url = url;
  error.method = method;
  return error;
};

// Handle API errors with appropriate user feedback
export const handleApiError = (
  error: ApiError | Error,
  options: ApiErrorHandlerOptions = {}
): void => {
  const {
    showToast = true,
    logError = true,
    retryable = false,
    context = {},
  } = options;

  // Enhanced context for API errors
  const enhancedContext = {
    ...context,
    isApiError: true,
    retryable,
    ...(error as ApiError).status && { status: (error as ApiError).status },
    ...(error as ApiError).url && { url: (error as ApiError).url },
    ...(error as ApiError).method && { method: (error as ApiError).method },
  };

  errorService.handleError(error, enhancedContext, {
    showToast,
    logToConsole: logError,
  });
};

// Wrapper for fetch with error handling
export const fetchWithErrorHandling = async (
  url: string,
  options: RequestInit = {},
  errorOptions: ApiErrorHandlerOptions = {}
): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      const apiError = createApiError(response, errorData, url, options.method);
      handleApiError(apiError, errorOptions);
      throw apiError;
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error
      const networkError = new Error('网络连接失败，请检查您的网络设置') as ApiError;
      networkError.name = 'NetworkError';
      networkError.url = url;
      networkError.method = options.method;
      
      handleApiError(networkError, errorOptions);
      throw networkError;
    }

    // Re-throw if it's already an API error we handled
    if ((error as ApiError).name === 'ApiError') {
      throw error;
    }

    // Handle other errors
    handleApiError(error as Error, errorOptions);
    throw error;
  }
};

// Wrapper for JSON API calls
export const apiCall = async <T = any>(
  url: string,
  options: RequestInit = {},
  errorOptions: ApiErrorHandlerOptions = {}
): Promise<T> => {
  const response = await fetchWithErrorHandling(url, options, errorOptions);
  return response.json();
};

// GET request with error handling
export const apiGet = async <T = any>(
  url: string,
  errorOptions: ApiErrorHandlerOptions = {}
): Promise<T> => {
  return apiCall<T>(url, { method: 'GET' }, errorOptions);
};

// POST request with error handling
export const apiPost = async <T = any>(
  url: string,
  data?: any,
  errorOptions: ApiErrorHandlerOptions = {}
): Promise<T> => {
  return apiCall<T>(
    url,
    {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    },
    errorOptions
  );
};

// PUT request with error handling
export const apiPut = async <T = any>(
  url: string,
  data?: any,
  errorOptions: ApiErrorHandlerOptions = {}
): Promise<T> => {
  return apiCall<T>(
    url,
    {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    },
    errorOptions
  );
};

// DELETE request with error handling
export const apiDelete = async <T = any>(
  url: string,
  errorOptions: ApiErrorHandlerOptions = {}
): Promise<T> => {
  return apiCall<T>(url, { method: 'DELETE' }, errorOptions);
};

// Retry API call with exponential backoff
export const retryApiCall = async <T = any>(
  apiFunction: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> => {
  return errorService.retry(apiFunction, maxAttempts, delay, backoff);
};

// Check if error is retryable
export const isRetryableError = (error: ApiError | Error): boolean => {
  const apiError = error as ApiError;
  
  // Network errors are retryable
  if (error.name === 'NetworkError') {
    return true;
  }
  
  // 5xx server errors are retryable
  if (apiError.status && apiError.status >= 500) {
    return true;
  }
  
  // 408 Request Timeout is retryable
  if (apiError.status === 408) {
    return true;
  }
  
  // 429 Too Many Requests is retryable (with delay)
  if (apiError.status === 429) {
    return true;
  }
  
  return false;
};

// Get user-friendly error message for API errors
export const getApiErrorMessage = (error: ApiError | Error): string => {
  const apiError = error as ApiError;
  
  if (error.name === 'NetworkError') {
    return '网络连接失败，请检查您的网络设置';
  }
  
  if (apiError.status) {
    switch (apiError.status) {
      case 400:
        return '请求参数错误，请检查输入信息';
      case 401:
        return '您需要登录才能继续操作';
      case 403:
        return '您没有权限执行此操作';
      case 404:
        return '请求的资源不存在';
      case 408:
        return '请求超时，请重试';
      case 429:
        return '请求过于频繁，请稍后重试';
      case 500:
        return '服务器内部错误，请稍后重试';
      case 502:
        return '服务器网关错误，请稍后重试';
      case 503:
        return '服务暂时不可用，请稍后重试';
      case 504:
        return '服务器响应超时，请稍后重试';
      default:
        if (apiError.status >= 500) {
          return '服务器错误，请稍后重试';
        } else if (apiError.status >= 400) {
          return '请求错误，请检查输入信息';
        }
    }
  }
  
  return error.message || '发生了未知错误，请稍后重试';
};

// Batch API calls with error handling
export const batchApiCalls = async <T = any>(
  calls: (() => Promise<T>)[],
  options: {
    failFast?: boolean;
    maxConcurrent?: number;
    retryFailedCalls?: boolean;
  } = {}
): Promise<{
  results: (T | null)[];
  errors: (Error | null)[];
  successCount: number;
  failureCount: number;
}> => {
  const {
    failFast = false,
    maxConcurrent = 5,
    retryFailedCalls = true,
  } = options;

  const results: (T | null)[] = [];
  const errors: (Error | null)[] = [];
  let successCount = 0;
  let failureCount = 0;

  // Process calls in batches to limit concurrency
  for (let i = 0; i < calls.length; i += maxConcurrent) {
    const batch = calls.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (call, index) => {
      try {
        const result = retryFailedCalls 
          ? await retryApiCall(call)
          : await call();
        
        results[i + index] = result;
        errors[i + index] = null;
        successCount++;
        
        return result;
      } catch (error) {
        results[i + index] = null;
        errors[i + index] = error as Error;
        failureCount++;
        
        if (failFast) {
          throw error;
        }
        
        return null;
      }
    });

    if (failFast) {
      await Promise.all(batchPromises);
    } else {
      await Promise.allSettled(batchPromises);
    }
  }

  return {
    results,
    errors,
    successCount,
    failureCount,
  };
};
/**
 * 刷新优化Hook
 * 提供智能刷新策略和性能优化
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@chakra-ui/react';

/**
 * 刷新策略枚举
 */
export enum RefreshStrategy {
  IMMEDIATE = 'immediate',
  DEBOUNCED = 'debounced',
  THROTTLED = 'throttled',
  SMART = 'smart',
}

/**
 * 刷新优化配置
 */
interface RefreshOptimizationConfig {
  /** 刷新策略 */
  strategy: RefreshStrategy;
  /** 防抖延迟（毫秒） */
  debounceDelay: number;
  /** 节流间隔（毫秒） */
  throttleInterval: number;
  /** 最小刷新间隔（毫秒） */
  minRefreshInterval: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 是否启用智能预加载 */
  enablePreload: boolean;
  /** 预加载阈值（0-1） */
  preloadThreshold: number;
}

/**
 * 刷新状态
 */
interface RefreshState {
  /** 是否正在刷新 */
  isRefreshing: boolean;
  /** 刷新进度（0-1） */
  progress: number;
  /** 最后刷新时间 */
  lastRefreshTime: Date | null;
  /** 刷新次数 */
  refreshCount: number;
  /** 错误信息 */
  error: string | null;
  /** 重试次数 */
  retryCount: number;
  /** 是否可以刷新 */
  canRefresh: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: RefreshOptimizationConfig = {
  strategy: RefreshStrategy.SMART,
  debounceDelay: 300,
  throttleInterval: 1000,
  minRefreshInterval: 5000, // 5秒
  maxRetries: 3,
  retryDelay: 2000,
  enablePreload: true,
  preloadThreshold: 0.8,
};

/**
 * 刷新优化Hook
 */
export const useRefreshOptimization = (
  refreshFn: () => Promise<void>,
  config: Partial<RefreshOptimizationConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const toast = useToast();

  const [state, setState] = useState<RefreshState>({
    isRefreshing: false,
    progress: 0,
    lastRefreshTime: null,
    refreshCount: 0,
    error: null,
    retryCount: 0,
    canRefresh: true,
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const isThrottledRef = useRef(false);

  /**
   * 检查是否可以刷新
   */
  const checkCanRefresh = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    return timeSinceLastRefresh >= finalConfig.minRefreshInterval;
  }, [finalConfig.minRefreshInterval]);

  /**
   * 更新刷新状态
   */
  const updateRefreshState = useCallback((updates: Partial<RefreshState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * 执行刷新
   */
  const executeRefresh = useCallback(async () => {
    if (state.isRefreshing || !checkCanRefresh()) {
      return;
    }

    updateRefreshState({
      isRefreshing: true,
      progress: 0,
      error: null,
      canRefresh: false,
    });

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 0.1, 0.9),
        }));
      }, 100);

      await refreshFn();

      clearInterval(progressInterval);
      
      const now = new Date();
      lastRefreshTimeRef.current = now.getTime();

      updateRefreshState({
        isRefreshing: false,
        progress: 1,
        lastRefreshTime: now,
        refreshCount: state.refreshCount + 1,
        retryCount: 0,
        canRefresh: true,
      });

      // 重置进度
      setTimeout(() => {
        updateRefreshState({ progress: 0 });
      }, 1000);

      toast({
        title: '刷新完成',
        description: '内容已更新',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Refresh failed:', error);
      
      const newRetryCount = state.retryCount + 1;
      const shouldRetry = newRetryCount < finalConfig.maxRetries;

      updateRefreshState({
        isRefreshing: false,
        progress: 0,
        error: error instanceof Error ? error.message : '刷新失败',
        retryCount: newRetryCount,
        canRefresh: true,
      });

      if (shouldRetry) {
        toast({
          title: '刷新失败',
          description: `正在重试... (${newRetryCount}/${finalConfig.maxRetries})`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });

        // 延迟重试
        setTimeout(() => {
          executeRefresh();
        }, finalConfig.retryDelay);
      } else {
        toast({
          title: '刷新失败',
          description: '请检查网络连接后手动重试',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [
    state.isRefreshing,
    state.refreshCount,
    state.retryCount,
    checkCanRefresh,
    updateRefreshState,
    refreshFn,
    finalConfig.maxRetries,
    finalConfig.retryDelay,
    toast,
  ]);

  /**
   * 防抖刷新
   */
  const debouncedRefresh = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeRefresh();
    }, finalConfig.debounceDelay);
  }, [executeRefresh, finalConfig.debounceDelay]);

  /**
   * 节流刷新
   */
  const throttledRefresh = useCallback(() => {
    if (isThrottledRef.current) {
      return;
    }

    isThrottledRef.current = true;
    executeRefresh();

    throttleTimerRef.current = setTimeout(() => {
      isThrottledRef.current = false;
    }, finalConfig.throttleInterval);
  }, [executeRefresh, finalConfig.throttleInterval]);

  /**
   * 智能刷新
   */
  const smartRefresh = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;

    // 如果距离上次刷新时间很短，使用防抖
    if (timeSinceLastRefresh < finalConfig.minRefreshInterval / 2) {
      debouncedRefresh();
    }
    // 如果正在频繁刷新，使用节流
    else if (state.refreshCount > 3 && timeSinceLastRefresh < finalConfig.minRefreshInterval) {
      throttledRefresh();
    }
    // 否则立即刷新
    else {
      executeRefresh();
    }
  }, [
    debouncedRefresh,
    throttledRefresh,
    executeRefresh,
    finalConfig.minRefreshInterval,
    state.refreshCount,
  ]);

  /**
   * 根据策略执行刷新
   */
  const refresh = useCallback(() => {
    switch (finalConfig.strategy) {
      case RefreshStrategy.IMMEDIATE:
        executeRefresh();
        break;
      case RefreshStrategy.DEBOUNCED:
        debouncedRefresh();
        break;
      case RefreshStrategy.THROTTLED:
        throttledRefresh();
        break;
      case RefreshStrategy.SMART:
      default:
        smartRefresh();
        break;
    }
  }, [
    finalConfig.strategy,
    executeRefresh,
    debouncedRefresh,
    throttledRefresh,
    smartRefresh,
  ]);

  /**
   * 强制刷新（忽略限制）
   */
  const forceRefresh = useCallback(() => {
    lastRefreshTimeRef.current = 0;
    executeRefresh();
  }, [executeRefresh]);

  /**
   * 重置状态
   */
  const resetState = useCallback(() => {
    setState({
      isRefreshing: false,
      progress: 0,
      lastRefreshTime: null,
      refreshCount: 0,
      error: null,
      retryCount: 0,
      canRefresh: true,
    });
    lastRefreshTimeRef.current = 0;
  }, []);

  /**
   * 预加载检查
   */
  const checkPreload = useCallback((scrollPosition: number, scrollHeight: number, clientHeight: number) => {
    if (!finalConfig.enablePreload) return;

    const scrollPercentage = (scrollPosition + clientHeight) / scrollHeight;
    
    if (scrollPercentage >= finalConfig.preloadThreshold && !state.isRefreshing) {
      // 预加载逻辑
      console.log('Preload triggered at', scrollPercentage);
    }
  }, [finalConfig.enablePreload, finalConfig.preloadThreshold, state.isRefreshing]);

  /**
   * 清理定时器
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  /**
   * 更新canRefresh状态
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const canRefresh = checkCanRefresh();
      if (canRefresh !== state.canRefresh) {
        updateRefreshState({ canRefresh });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [checkCanRefresh, state.canRefresh, updateRefreshState]);

  return {
    // 状态
    ...state,
    
    // 方法
    refresh,
    forceRefresh,
    resetState,
    checkPreload,
    
    // 工具方法
    getTimeSinceLastRefresh: () => {
      if (!state.lastRefreshTime) return null;
      return Date.now() - state.lastRefreshTime.getTime();
    },
    
    getRefreshCooldown: () => {
      const timeSinceLastRefresh = Date.now() - lastRefreshTimeRef.current;
      const cooldown = finalConfig.minRefreshInterval - timeSinceLastRefresh;
      return Math.max(0, cooldown);
    },
  };
};

/**
 * 刷新性能监控Hook
 */
export const useRefreshPerformance = () => {
  const [metrics, setMetrics] = useState({
    averageRefreshTime: 0,
    totalRefreshes: 0,
    successRate: 0,
    failureCount: 0,
  });

  const refreshTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

  const startMeasurement = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endMeasurement = useCallback((success: boolean) => {
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    
    refreshTimesRef.current.push(duration);
    
    // 只保留最近100次的记录
    if (refreshTimesRef.current.length > 100) {
      refreshTimesRef.current.shift();
    }

    const totalRefreshes = metrics.totalRefreshes + 1;
    const failureCount = success ? metrics.failureCount : metrics.failureCount + 1;
    const averageRefreshTime = refreshTimesRef.current.reduce((a, b) => a + b, 0) / refreshTimesRef.current.length;
    const successRate = ((totalRefreshes - failureCount) / totalRefreshes) * 100;

    setMetrics({
      averageRefreshTime,
      totalRefreshes,
      successRate,
      failureCount,
    });
  }, [metrics]);

  const resetMetrics = useCallback(() => {
    setMetrics({
      averageRefreshTime: 0,
      totalRefreshes: 0,
      successRate: 0,
      failureCount: 0,
    });
    refreshTimesRef.current = [];
  }, []);

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    resetMetrics,
  };
};
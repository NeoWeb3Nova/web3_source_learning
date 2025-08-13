/**
 * 下拉刷新Hook
 * 提供下拉刷新功能和相关状态管理
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 下拉刷新配置
 */
interface PullToRefreshConfig {
  /** 触发刷新的距离阈值（像素） */
  threshold: number;
  /** 最大下拉距离（像素） */
  maxPullDistance: number;
  /** 刷新动画持续时间（毫秒） */
  refreshDuration: number;
  /** 是否启用下拉刷新 */
  enabled: boolean;
  /** 阻尼系数（0-1，值越小阻尼越大） */
  damping: number;
}

/**
 * 下拉刷新状态
 */
export enum PullToRefreshState {
  IDLE = 'idle',
  PULLING = 'pulling',
  READY_TO_REFRESH = 'ready_to_refresh',
  REFRESHING = 'refreshing',
  COMPLETED = 'completed',
}

/**
 * 下拉刷新返回值
 */
interface PullToRefreshReturn {
  /** 当前状态 */
  state: PullToRefreshState;
  /** 当前下拉距离 */
  pullDistance: number;
  /** 下拉进度（0-1） */
  progress: number;
  /** 是否正在刷新 */
  isRefreshing: boolean;
  /** 是否可以刷新 */
  canRefresh: boolean;
  /** 手动触发刷新 */
  triggerRefresh: () => void;
  /** 完成刷新 */
  completeRefresh: () => void;
  /** 绑定到容器的事件处理器 */
  bindToContainer: (element: HTMLElement | null) => void;
  /** 容器样式 */
  containerStyle: React.CSSProperties;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: PullToRefreshConfig = {
  threshold: 80,
  maxPullDistance: 120,
  refreshDuration: 1000,
  enabled: true,
  damping: 0.6,
};

/**
 * 下拉刷新Hook
 */
export const usePullToRefresh = (
  onRefresh: () => Promise<void> | void,
  config: Partial<PullToRefreshConfig> = {}
): PullToRefreshReturn => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setState] = useState<PullToRefreshState>(PullToRefreshState.IDLE);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const containerRef = useRef<HTMLElement | null>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * 计算下拉进度
   */
  const progress = Math.min(pullDistance / finalConfig.threshold, 1);

  /**
   * 是否可以刷新
   */
  const canRefresh = pullDistance >= finalConfig.threshold && state === PullToRefreshState.READY_TO_REFRESH;

  /**
   * 更新下拉距离
   */
  const updatePullDistance = useCallback((distance: number) => {
    const dampedDistance = distance * finalConfig.damping;
    const clampedDistance = Math.min(dampedDistance, finalConfig.maxPullDistance);
    setPullDistance(Math.max(0, clampedDistance));

    // 更新状态
    if (clampedDistance >= finalConfig.threshold && state !== PullToRefreshState.REFRESHING) {
      setState(PullToRefreshState.READY_TO_REFRESH);
    } else if (clampedDistance > 0 && clampedDistance < finalConfig.threshold) {
      setState(PullToRefreshState.PULLING);
    } else if (clampedDistance === 0 && state !== PullToRefreshState.REFRESHING) {
      setState(PullToRefreshState.IDLE);
    }
  }, [finalConfig.threshold, finalConfig.maxPullDistance, finalConfig.damping, state]);

  /**
   * 开始触摸
   */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!finalConfig.enabled || !containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;

    // 只有在容器顶部时才允许下拉刷新
    if (scrollTop > 0) return;

    startYRef.current = e.touches[0].clientY;
    currentYRef.current = startYRef.current;
    isDraggingRef.current = true;
  }, [finalConfig.enabled]);

  /**
   * 触摸移动
   */
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current || !finalConfig.enabled) return;

    currentYRef.current = e.touches[0].clientY;
    const deltaY = currentYRef.current - startYRef.current;

    // 只处理向下拉的手势
    if (deltaY > 0) {
      e.preventDefault();
      updatePullDistance(deltaY);
    }
  }, [finalConfig.enabled, updatePullDistance]);

  /**
   * 触摸结束
   */
  const handleTouchEnd = useCallback(async () => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    if (pullDistance >= finalConfig.threshold && state === PullToRefreshState.READY_TO_REFRESH) {
      // 触发刷新
      setState(PullToRefreshState.REFRESHING);
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }
      
      // 保持刷新状态一段时间
      setTimeout(() => {
        setState(PullToRefreshState.COMPLETED);
        setTimeout(() => {
          setState(PullToRefreshState.IDLE);
          setPullDistance(0);
          setIsRefreshing(false);
        }, 300);
      }, finalConfig.refreshDuration);
    } else {
      // 回弹动画
      const startDistance = pullDistance;
      const startTime = Date.now();
      const duration = 300;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentDistance = startDistance * (1 - easeOut);
        setPullDistance(currentDistance);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setState(PullToRefreshState.IDLE);
          setPullDistance(0);
        }
      };

      animate();
    }
  }, [pullDistance, finalConfig.threshold, finalConfig.refreshDuration, state, onRefresh]);

  /**
   * 鼠标事件处理（桌面端支持）
   */
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!finalConfig.enabled || !containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;

    if (scrollTop > 0) return;

    startYRef.current = e.clientY;
    currentYRef.current = startYRef.current;
    isDraggingRef.current = true;

    e.preventDefault();
  }, [finalConfig.enabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !finalConfig.enabled) return;

    currentYRef.current = e.clientY;
    const deltaY = currentYRef.current - startYRef.current;

    if (deltaY > 0) {
      e.preventDefault();
      updatePullDistance(deltaY);
    }
  }, [finalConfig.enabled, updatePullDistance]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      handleTouchEnd();
    }
  }, [handleTouchEnd]);

  /**
   * 手动触发刷新
   */
  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setState(PullToRefreshState.REFRESHING);
    setIsRefreshing(true);
    setPullDistance(finalConfig.threshold);

    try {
      await onRefresh();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }

    setTimeout(() => {
      setState(PullToRefreshState.COMPLETED);
      setTimeout(() => {
        setState(PullToRefreshState.IDLE);
        setPullDistance(0);
        setIsRefreshing(false);
      }, 300);
    }, finalConfig.refreshDuration);
  }, [isRefreshing, onRefresh, finalConfig.threshold, finalConfig.refreshDuration]);

  /**
   * 完成刷新
   */
  const completeRefresh = useCallback(() => {
    if (state === PullToRefreshState.REFRESHING) {
      setState(PullToRefreshState.COMPLETED);
      setTimeout(() => {
        setState(PullToRefreshState.IDLE);
        setPullDistance(0);
        setIsRefreshing(false);
      }, 300);
    }
  }, [state]);

  /**
   * 绑定到容器
   */
  const bindToContainer = useCallback((element: HTMLElement | null) => {
    // 清理旧的事件监听器
    if (containerRef.current) {
      containerRef.current.removeEventListener('touchstart', handleTouchStart);
      containerRef.current.removeEventListener('touchmove', handleTouchMove);
      containerRef.current.removeEventListener('touchend', handleTouchEnd);
      containerRef.current.removeEventListener('mousedown', handleMouseDown);
    }

    containerRef.current = element;

    // 添加新的事件监听器
    if (element && finalConfig.enabled) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd);
      element.addEventListener('mousedown', handleMouseDown);
    }
  }, [finalConfig.enabled, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown]);

  /**
   * 全局鼠标事件监听
   */
  useEffect(() => {
    if (finalConfig.enabled) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [finalConfig.enabled, handleMouseMove, handleMouseUp]);

  /**
   * 清理动画帧
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * 容器样式
   */
  const containerStyle: React.CSSProperties = {
    transform: `translateY(${pullDistance}px)`,
    transition: isDraggingRef.current ? 'none' : 'transform 0.3s ease-out',
  };

  return {
    state,
    pullDistance,
    progress,
    isRefreshing,
    canRefresh,
    triggerRefresh,
    completeRefresh,
    bindToContainer,
    containerStyle,
  };
};

/**
 * 获取状态文本
 */
export const getPullToRefreshStateText = (state: PullToRefreshState): string => {
  switch (state) {
    case PullToRefreshState.IDLE:
      return '下拉刷新';
    case PullToRefreshState.PULLING:
      return '继续下拉';
    case PullToRefreshState.READY_TO_REFRESH:
      return '释放刷新';
    case PullToRefreshState.REFRESHING:
      return '正在刷新...';
    case PullToRefreshState.COMPLETED:
      return '刷新完成';
    default:
      return '';
  }
};

/**
 * 获取状态图标
 */
export const getPullToRefreshStateIcon = (state: PullToRefreshState): string => {
  switch (state) {
    case PullToRefreshState.IDLE:
    case PullToRefreshState.PULLING:
      return '↓';
    case PullToRefreshState.READY_TO_REFRESH:
      return '↑';
    case PullToRefreshState.REFRESHING:
      return '⟳';
    case PullToRefreshState.COMPLETED:
      return '✓';
    default:
      return '';
  }
};
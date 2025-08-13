import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * 滑动方向枚举
 */
export enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
  UP = 'up',
  DOWN = 'down',
}

/**
 * 滑动配置接口
 */
interface SwipeConfig {
  /** 最小滑动距离 */
  minDistance?: number;
  /** 最小滑动速度 */
  minVelocity?: number;
  /** 最大滑动时间（毫秒） */
  maxTime?: number;
  /** 是否阻止默认行为 */
  preventDefault?: boolean;
  /** 是否阻止事件冒泡 */
  stopPropagation?: boolean;
}

/**
 * 滑动事件数据
 */
interface SwipeEventData {
  /** 滑动方向 */
  direction: SwipeDirection;
  /** 滑动距离 */
  distance: number;
  /** 滑动速度 */
  velocity: number;
  /** 滑动时间 */
  duration: number;
  /** 起始位置 */
  startPosition: { x: number; y: number };
  /** 结束位置 */
  endPosition: { x: number; y: number };
}

/**
 * 滑动回调函数类型
 */
type SwipeCallback = (data: SwipeEventData) => void;

/**
 * 滑动手势Hook
 */
export const useSwipeGesture = (
  config: SwipeConfig = {},
  callbacks: {
    onSwipeLeft?: SwipeCallback;
    onSwipeRight?: SwipeCallback;
    onSwipeUp?: SwipeCallback;
    onSwipeDown?: SwipeCallback;
    onSwipe?: SwipeCallback;
  } = {}
) => {
  const {
    minDistance = 50,
    minVelocity = 0.3,
    maxTime = 1000,
    preventDefault = true,
    stopPropagation = true,
  } = config;

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
  } = callbacks;

  const startTimeRef = useRef<number>(0);
  const startPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);

  /**
   * 计算滑动数据
   */
  const calculateSwipeData = useCallback((
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
    startTime: number,
    endTime: number
  ): SwipeEventData | null => {
    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = endTime - startTime;
    const velocity = distance / duration;

    // 检查是否满足最小条件
    if (distance < minDistance || velocity < minVelocity || duration > maxTime) {
      return null;
    }

    // 确定滑动方向
    let direction: SwipeDirection;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
    } else {
      direction = deltaY > 0 ? SwipeDirection.DOWN : SwipeDirection.UP;
    }

    return {
      direction,
      distance,
      velocity,
      duration,
      startPosition: startPos,
      endPosition: endPos,
    };
  }, [minDistance, minVelocity, maxTime]);

  /**
   * 处理滑动事件
   */
  const handleSwipe = useCallback((swipeData: SwipeEventData) => {
    // 调用通用滑动回调
    onSwipe?.(swipeData);

    // 调用特定方向的回调
    switch (swipeData.direction) {
      case SwipeDirection.LEFT:
        onSwipeLeft?.(swipeData);
        break;
      case SwipeDirection.RIGHT:
        onSwipeRight?.(swipeData);
        break;
      case SwipeDirection.UP:
        onSwipeUp?.(swipeData);
        break;
      case SwipeDirection.DOWN:
        onSwipeDown?.(swipeData);
        break;
    }
  }, [onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  /**
   * 触摸开始事件处理
   */
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();

    const touch = event.touches[0];
    startTimeRef.current = Date.now();
    startPositionRef.current = { x: touch.clientX, y: touch.clientY };
    setIsSwiping(true);
  }, [preventDefault, stopPropagation]);

  /**
   * 触摸结束事件处理
   */
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();

    if (!isSwiping) return;

    const touch = event.changedTouches[0];
    const endTime = Date.now();
    const endPosition = { x: touch.clientX, y: touch.clientY };

    const swipeData = calculateSwipeData(
      startPositionRef.current,
      endPosition,
      startTimeRef.current,
      endTime
    );

    if (swipeData) {
      handleSwipe(swipeData);
    }

    setIsSwiping(false);
  }, [isSwiping, calculateSwipeData, handleSwipe, preventDefault, stopPropagation]);

  /**
   * 鼠标事件处理（用于桌面端测试）
   */
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();

    startTimeRef.current = Date.now();
    startPositionRef.current = { x: event.clientX, y: event.clientY };
    setIsSwiping(true);
  }, [preventDefault, stopPropagation]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();

    if (!isSwiping) return;

    const endTime = Date.now();
    const endPosition = { x: event.clientX, y: event.clientY };

    const swipeData = calculateSwipeData(
      startPositionRef.current,
      endPosition,
      startTimeRef.current,
      endTime
    );

    if (swipeData) {
      handleSwipe(swipeData);
    }

    setIsSwiping(false);
  }, [isSwiping, calculateSwipeData, handleSwipe, preventDefault, stopPropagation]);

  /**
   * 绑定事件监听器
   */
  const bindEvents = useCallback((element: HTMLElement) => {
    // 触摸事件
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    // 鼠标事件（用于桌面端）
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleTouchStart, handleTouchEnd, handleMouseDown, handleMouseUp]);

  /**
   * 解绑事件监听器
   */
  const unbindEvents = useCallback((element: HTMLElement) => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
    element.removeEventListener('mousedown', handleMouseDown);
    element.removeEventListener('mouseup', handleMouseUp);
  }, [handleTouchStart, handleTouchEnd, handleMouseDown, handleMouseUp]);

  return {
    isSwiping,
    bindEvents,
    unbindEvents,
    handleTouchStart,
    handleTouchEnd,
    handleMouseDown,
    handleMouseUp,
  };
};

/**
 * React Ref版本的滑动手势Hook
 */
export const useSwipeGestureRef = <T extends HTMLElement>(
  config: SwipeConfig = {},
  callbacks: {
    onSwipeLeft?: SwipeCallback;
    onSwipeRight?: SwipeCallback;
    onSwipeUp?: SwipeCallback;
    onSwipeDown?: SwipeCallback;
    onSwipe?: SwipeCallback;
  } = {}
) => {
  const elementRef = useRef<T>(null);
  const { bindEvents, unbindEvents, isSwiping } = useSwipeGesture(config, callbacks);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const cleanup = bindEvents(element);
    return cleanup;
  }, [bindEvents]);

  return {
    ref: elementRef,
    isSwiping,
  };
};

/**
 * 键盘导航Hook
 */
export const useKeyboardNavigation = (callbacks: {
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onSpace?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
} = {}) => {
  const {
    onArrowLeft,
    onArrowRight,
    onArrowUp,
    onArrowDown,
    onSpace,
    onEnter,
    onEscape,
  } = callbacks;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onArrowLeft?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onArrowRight?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          onArrowUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onArrowDown?.();
          break;
        case ' ':
          event.preventDefault();
          onSpace?.();
          break;
        case 'Enter':
          event.preventDefault();
          onEnter?.();
          break;
        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onSpace, onEnter, onEscape]);
};

/**
 * 长按手势Hook
 */
export const useLongPress = (
  callback: () => void,
  options: {
    threshold?: number;
    onStart?: () => void;
    onFinish?: () => void;
    onCancel?: () => void;
  } = {}
) => {
  const { threshold = 500, onStart, onFinish, onCancel } = options;
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();

  const start = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (event.target !== target.current) {
      target.current = event.target;
    }

    onStart?.();
    setIsLongPressing(true);

    timeout.current = setTimeout(() => {
      callback();
      onFinish?.();
      setIsLongPressing(false);
    }, threshold);
  }, [callback, threshold, onStart, onFinish]);

  const clear = useCallback((shouldTriggerOnCancel = true) => {
    timeout.current && clearTimeout(timeout.current);
    shouldTriggerOnCancel && isLongPressing && onCancel?.();
    setIsLongPressing(false);
  }, [isLongPressing, onCancel]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: () => clear(true),
    onMouseLeave: () => clear(true),
    onTouchEnd: () => clear(true),
    isLongPressing,
  };
};
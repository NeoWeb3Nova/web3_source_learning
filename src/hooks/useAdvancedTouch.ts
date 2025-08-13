import { useCallback, useRef, useEffect } from 'react';

/**
 * 触摸事件类型
 */
export interface TouchEventData {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  distance: number;
  duration: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
}

/**
 * 高级触摸手势配置
 */
export interface AdvancedTouchConfig {
  /** 最小滑动距离 */
  threshold?: number;
  /** 最大点击时间（毫秒） */
  tapTimeout?: number;
  /** 长按时间（毫秒） */
  longPressTimeout?: number;
  /** 双击间隔时间（毫秒） */
  doubleTapTimeout?: number;
  /** 是否阻止默认行为 */
  preventDefault?: boolean;
  /** 是否阻止事件冒泡 */
  stopPropagation?: boolean;
}

/**
 * 触摸手势回调
 */
export interface TouchGestureCallbacks {
  /** 触摸开始 */
  onTouchStart?: (event: TouchEventData) => void;
  /** 触摸移动 */
  onTouchMove?: (event: TouchEventData) => void;
  /** 触摸结束 */
  onTouchEnd?: (event: TouchEventData) => void;
  /** 点击 */
  onTap?: (event: TouchEventData) => void;
  /** 双击 */
  onDoubleTap?: (event: TouchEventData) => void;
  /** 长按 */
  onLongPress?: (event: TouchEventData) => void;
  /** 滑动 */
  onSwipe?: (event: TouchEventData) => void;
  /** 拖拽开始 */
  onDragStart?: (event: TouchEventData) => void;
  /** 拖拽中 */
  onDrag?: (event: TouchEventData) => void;
  /** 拖拽结束 */
  onDragEnd?: (event: TouchEventData) => void;
  /** 捏合手势 */
  onPinch?: (scale: number, event: TouchEvent) => void;
  /** 旋转手势 */
  onRotate?: (rotation: number, event: TouchEvent) => void;
}

/**
 * 高级触摸手势Hook
 */
export const useAdvancedTouch = (
  config: AdvancedTouchConfig = {},
  callbacks: TouchGestureCallbacks = {}
) => {
  const {
    threshold = 10,
    tapTimeout = 300,
    longPressTimeout = 500,
    doubleTapTimeout = 300,
    preventDefault = false,
    stopPropagation = false,
  } = config;

  const touchDataRef = useRef<{
    startTime: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    lastTapTime: number;
    tapCount: number;
    isDragging: boolean;
    longPressTimer: NodeJS.Timeout | null;
    initialDistance: number;
    initialAngle: number;
  }>({
    startTime: 0,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    lastTapTime: 0,
    tapCount: 0,
    isDragging: false,
    longPressTimer: null,
    initialDistance: 0,
    initialAngle: 0,
  });

  /**
   * 计算两点间距离
   */
  const getDistance = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);

  /**
   * 计算角度
   */
  const getAngle = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  }, []);

  /**
   * 获取滑动方向
   */
  const getDirection = useCallback((deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' | null => {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX < threshold && absDeltaY < threshold) {
      return null;
    }

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, [threshold]);

  /**
   * 创建触摸事件数据
   */
  const createTouchEventData = useCallback((currentX: number, currentY: number): TouchEventData => {
    const touchData = touchDataRef.current;
    const deltaX = currentX - touchData.startX;
    const deltaY = currentY - touchData.startY;
    const distance = getDistance(touchData.startX, touchData.startY, currentX, currentY);
    const duration = Date.now() - touchData.startTime;
    const velocity = duration > 0 ? distance / duration : 0;
    const direction = getDirection(deltaX, deltaY);

    return {
      startX: touchData.startX,
      startY: touchData.startY,
      currentX,
      currentY,
      deltaX,
      deltaY,
      distance,
      duration,
      velocity,
      direction,
    };
  }, [getDistance, getDirection]);

  /**
   * 处理触摸开始
   */
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();

    const touch = event.touches[0];
    const touchData = touchDataRef.current;

    touchData.startTime = Date.now();
    touchData.startX = touch.clientX;
    touchData.startY = touch.clientY;
    touchData.currentX = touch.clientX;
    touchData.currentY = touch.clientY;
    touchData.isDragging = false;

    // 清除长按定时器
    if (touchData.longPressTimer) {
      clearTimeout(touchData.longPressTimer);
    }

    // 设置长按定时器
    touchData.longPressTimer = setTimeout(() => {
      if (!touchData.isDragging) {
        const eventData = createTouchEventData(touchData.currentX, touchData.currentY);
        callbacks.onLongPress?.(eventData);
      }
    }, longPressTimeout);

    // 多点触控处理
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      touchData.initialDistance = getDistance(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );
      touchData.initialAngle = getAngle(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );
    }

    const eventData = createTouchEventData(touch.clientX, touch.clientY);
    callbacks.onTouchStart?.(eventData);
  }, [preventDefault, stopPropagation, longPressTimeout, createTouchEventData, callbacks, getDistance, getAngle]);

  /**
   * 处理触摸移动
   */
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();

    const touch = event.touches[0];
    const touchData = touchDataRef.current;

    touchData.currentX = touch.clientX;
    touchData.currentY = touch.clientY;

    const eventData = createTouchEventData(touch.clientX, touch.clientY);

    // 检查是否开始拖拽
    if (!touchData.isDragging && eventData.distance > threshold) {
      touchData.isDragging = true;
      
      // 清除长按定时器
      if (touchData.longPressTimer) {
        clearTimeout(touchData.longPressTimer);
        touchData.longPressTimer = null;
      }

      callbacks.onDragStart?.(eventData);
    }

    // 拖拽中
    if (touchData.isDragging) {
      callbacks.onDrag?.(eventData);
    }

    // 多点触控处理
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      // 捏合手势
      const currentDistance = getDistance(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );
      const scale = currentDistance / touchData.initialDistance;
      callbacks.onPinch?.(scale, event);

      // 旋转手势
      const currentAngle = getAngle(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );
      const rotation = currentAngle - touchData.initialAngle;
      callbacks.onRotate?.(rotation, event);
    }

    callbacks.onTouchMove?.(eventData);
  }, [preventDefault, stopPropagation, threshold, createTouchEventData, callbacks, getDistance, getAngle]);

  /**
   * 处理触摸结束
   */
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();

    const touchData = touchDataRef.current;
    const eventData = createTouchEventData(touchData.currentX, touchData.currentY);

    // 清除长按定时器
    if (touchData.longPressTimer) {
      clearTimeout(touchData.longPressTimer);
      touchData.longPressTimer = null;
    }

    // 拖拽结束
    if (touchData.isDragging) {
      callbacks.onDragEnd?.(eventData);
      touchData.isDragging = false;
    } else {
      // 检查是否为滑动
      if (eventData.distance > threshold && eventData.velocity > 0.5) {
        callbacks.onSwipe?.(eventData);
      } else if (eventData.duration < tapTimeout) {
        // 点击处理
        const now = Date.now();
        const timeSinceLastTap = now - touchData.lastTapTime;

        if (timeSinceLastTap < doubleTapTimeout) {
          touchData.tapCount++;
        } else {
          touchData.tapCount = 1;
        }

        touchData.lastTapTime = now;

        if (touchData.tapCount === 2) {
          callbacks.onDoubleTap?.(eventData);
          touchData.tapCount = 0;
        } else {
          // 延迟执行单击，等待可能的双击
          setTimeout(() => {
            if (touchData.tapCount === 1) {
              callbacks.onTap?.(eventData);
              touchData.tapCount = 0;
            }
          }, doubleTapTimeout);
        }
      }
    }

    callbacks.onTouchEnd?.(eventData);
  }, [preventDefault, stopPropagation, threshold, tapTimeout, doubleTapTimeout, createTouchEventData, callbacks]);

  /**
   * 绑定事件监听器
   */
  const bindEvents = useCallback((element: HTMLElement) => {
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  /**
   * 清理资源
   */
  useEffect(() => {
    return () => {
      const touchData = touchDataRef.current;
      if (touchData.longPressTimer) {
        clearTimeout(touchData.longPressTimer);
      }
    };
  }, []);

  return {
    bindEvents,
    touchData: touchDataRef.current,
  };
};

export default useAdvancedTouch;
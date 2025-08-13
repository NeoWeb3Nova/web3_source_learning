import { useCallback, useRef, useEffect } from 'react';
import { useSpring, animated, SpringValue } from '@react-spring/web';

/**
 * 拖拽动画配置
 */
export interface DragAnimationConfig {
  /** 弹性系数 */
  tension?: number;
  /** 摩擦系数 */
  friction?: number;
  /** 拖拽时的缩放比例 */
  dragScale?: number;
  /** 拖拽时的旋转角度 */
  dragRotation?: number;
  /** 拖拽时的透明度 */
  dragOpacity?: number;
  /** 悬停时的缩放比例 */
  hoverScale?: number;
  /** 悬停时的阴影 */
  hoverShadow?: string;
  /** 是否启用磁性吸附效果 */
  magneticSnap?: boolean;
  /** 磁性吸附距离 */
  snapDistance?: number;
}

/**
 * 拖拽状态
 */
export interface DragState {
  isDragging: boolean;
  isHovering: boolean;
  position: { x: number; y: number };
  offset: { x: number; y: number };
}

/**
 * 拖拽动画返回值
 */
export interface DragAnimationReturn {
  /** 动画样式 */
  style: {
    transform: SpringValue<string>;
    opacity: SpringValue<number>;
    boxShadow: SpringValue<string>;
  };
  /** 绑定到元素的属性 */
  bind: () => {
    onMouseDown: (event: React.MouseEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTouchStart: (event: React.TouchEvent) => void;
  };
  /** 当前拖拽状态 */
  dragState: DragState;
  /** 手动设置拖拽状态 */
  setDragState: (state: Partial<DragState>) => void;
  /** 重置位置 */
  resetPosition: () => void;
}

/**
 * 拖拽动画Hook
 * 提供流畅的拖拽动画效果和触摸支持
 */
export const useDragAnimation = (
  config: DragAnimationConfig = {}
): DragAnimationReturn => {
  const {
    tension = 300,
    friction = 30,
    dragScale = 1.05,
    dragRotation = 5,
    dragOpacity = 0.9,
    hoverScale = 1.02,
    hoverShadow = '0 4px 20px rgba(0,0,0,0.15)',
    magneticSnap = true,
    snapDistance = 50,
  } = config;

  const dragStateRef = useRef<DragState>({
    isDragging: false,
    isHovering: false,
    position: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
  });

  const initialMousePos = useRef({ x: 0, y: 0 });
  const initialElementPos = useRef({ x: 0, y: 0 });

  /**
   * 动画弹簧配置
   */
  const [springs, api] = useSpring(() => ({
    transform: 'translate3d(0px, 0px, 0px) scale(1) rotate(0deg)',
    opacity: 1,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    config: { tension, friction },
  }));

  /**
   * 更新拖拽状态
   */
  const setDragState = useCallback((newState: Partial<DragState>) => {
    dragStateRef.current = { ...dragStateRef.current, ...newState };
  }, []);

  /**
   * 更新动画
   */
  const updateAnimation = useCallback(() => {
    const state = dragStateRef.current;
    
    let scale = 1;
    let rotation = 0;
    let opacity = 1;
    let shadow = '0 2px 10px rgba(0,0,0,0.1)';

    if (state.isDragging) {
      scale = dragScale;
      rotation = dragRotation;
      opacity = dragOpacity;
      shadow = '0 8px 30px rgba(0,0,0,0.3)';
    } else if (state.isHovering) {
      scale = hoverScale;
      shadow = hoverShadow;
    }

    api.start({
      transform: `translate3d(${state.position.x}px, ${state.position.y}px, 0px) scale(${scale}) rotate(${rotation}deg)`,
      opacity,
      boxShadow: shadow,
    });
  }, [api, dragScale, dragRotation, dragOpacity, hoverScale, hoverShadow]);

  /**
   * 处理鼠标按下
   */
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    initialMousePos.current = { x: event.clientX, y: event.clientY };
    initialElementPos.current = { x: rect.left, y: rect.top };

    setDragState({
      isDragging: true,
      offset: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
    });

    updateAnimation();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - initialMousePos.current.x;
      const deltaY = moveEvent.clientY - initialMousePos.current.y;

      setDragState({
        position: { x: deltaX, y: deltaY },
      });

      updateAnimation();
    };

    const handleMouseUp = () => {
      setDragState({
        isDragging: false,
        position: { x: 0, y: 0 },
      });

      updateAnimation();

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [setDragState, updateAnimation]);

  /**
   * 处理触摸开始
   */
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    
    const touch = event.touches[0];
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    
    initialMousePos.current = { x: touch.clientX, y: touch.clientY };
    initialElementPos.current = { x: rect.left, y: rect.top };

    setDragState({
      isDragging: true,
      offset: {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      },
    });

    updateAnimation();

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touch = moveEvent.touches[0];
      const deltaX = touch.clientX - initialMousePos.current.x;
      const deltaY = touch.clientY - initialMousePos.current.y;

      setDragState({
        position: { x: deltaX, y: deltaY },
      });

      updateAnimation();
    };

    const handleTouchEnd = () => {
      // 磁性吸附效果
      if (magneticSnap) {
        const state = dragStateRef.current;
        const distance = Math.sqrt(
          Math.pow(state.position.x, 2) + Math.pow(state.position.y, 2)
        );

        if (distance < snapDistance) {
          setDragState({
            position: { x: 0, y: 0 },
          });
        }
      }

      setDragState({
        isDragging: false,
      });

      updateAnimation();

      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [setDragState, updateAnimation, magneticSnap, snapDistance]);

  /**
   * 处理鼠标进入
   */
  const handleMouseEnter = useCallback(() => {
    if (!dragStateRef.current.isDragging) {
      setDragState({ isHovering: true });
      updateAnimation();
    }
  }, [setDragState, updateAnimation]);

  /**
   * 处理鼠标离开
   */
  const handleMouseLeave = useCallback(() => {
    if (!dragStateRef.current.isDragging) {
      setDragState({ isHovering: false });
      updateAnimation();
    }
  }, [setDragState, updateAnimation]);

  /**
   * 重置位置
   */
  const resetPosition = useCallback(() => {
    setDragState({
      position: { x: 0, y: 0 },
      isDragging: false,
      isHovering: false,
    });
    updateAnimation();
  }, [setDragState, updateAnimation]);

  /**
   * 绑定事件处理器
   */
  const bind = useCallback(() => ({
    onMouseDown: handleMouseDown,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
  }), [handleMouseDown, handleMouseEnter, handleMouseLeave, handleTouchStart]);

  /**
   * 初始化动画
   */
  useEffect(() => {
    updateAnimation();
  }, [updateAnimation]);

  return {
    style: springs,
    bind,
    dragState: dragStateRef.current,
    setDragState,
    resetPosition,
  };
};

export default useDragAnimation;
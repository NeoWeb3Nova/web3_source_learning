import { useCallback, useRef, useState, useEffect } from 'react';
export var SwipeDirection;
(function (SwipeDirection) {
    SwipeDirection["LEFT"] = "left";
    SwipeDirection["RIGHT"] = "right";
    SwipeDirection["UP"] = "up";
    SwipeDirection["DOWN"] = "down";
})(SwipeDirection || (SwipeDirection = {}));
export const useSwipeGesture = (config = {}, callbacks = {}) => {
    const { minDistance = 50, minVelocity = 0.3, maxTime = 1000, preventDefault = true, stopPropagation = true, } = config;
    const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe, } = callbacks;
    const startTimeRef = useRef(0);
    const startPositionRef = useRef({ x: 0, y: 0 });
    const [isSwiping, setIsSwiping] = useState(false);
    const calculateSwipeData = useCallback((startPos, endPos, startTime, endTime) => {
        const deltaX = endPos.x - startPos.x;
        const deltaY = endPos.y - startPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = endTime - startTime;
        const velocity = distance / duration;
        if (distance < minDistance || velocity < minVelocity || duration > maxTime) {
            return null;
        }
        let direction;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
        }
        else {
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
    const handleSwipe = useCallback((swipeData) => {
        onSwipe?.(swipeData);
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
    const handleTouchStart = useCallback((event) => {
        if (preventDefault)
            event.preventDefault();
        if (stopPropagation)
            event.stopPropagation();
        const touch = event.touches[0];
        startTimeRef.current = Date.now();
        startPositionRef.current = { x: touch.clientX, y: touch.clientY };
        setIsSwiping(true);
    }, [preventDefault, stopPropagation]);
    const handleTouchEnd = useCallback((event) => {
        if (preventDefault)
            event.preventDefault();
        if (stopPropagation)
            event.stopPropagation();
        if (!isSwiping)
            return;
        const touch = event.changedTouches[0];
        const endTime = Date.now();
        const endPosition = { x: touch.clientX, y: touch.clientY };
        const swipeData = calculateSwipeData(startPositionRef.current, endPosition, startTimeRef.current, endTime);
        if (swipeData) {
            handleSwipe(swipeData);
        }
        setIsSwiping(false);
    }, [isSwiping, calculateSwipeData, handleSwipe, preventDefault, stopPropagation]);
    const handleMouseDown = useCallback((event) => {
        if (preventDefault)
            event.preventDefault();
        if (stopPropagation)
            event.stopPropagation();
        startTimeRef.current = Date.now();
        startPositionRef.current = { x: event.clientX, y: event.clientY };
        setIsSwiping(true);
    }, [preventDefault, stopPropagation]);
    const handleMouseUp = useCallback((event) => {
        if (preventDefault)
            event.preventDefault();
        if (stopPropagation)
            event.stopPropagation();
        if (!isSwiping)
            return;
        const endTime = Date.now();
        const endPosition = { x: event.clientX, y: event.clientY };
        const swipeData = calculateSwipeData(startPositionRef.current, endPosition, startTimeRef.current, endTime);
        if (swipeData) {
            handleSwipe(swipeData);
        }
        setIsSwiping(false);
    }, [isSwiping, calculateSwipeData, handleSwipe, preventDefault, stopPropagation]);
    const bindEvents = useCallback((element) => {
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
        element.addEventListener('mousedown', handleMouseDown);
        element.addEventListener('mouseup', handleMouseUp);
        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('mousedown', handleMouseDown);
            element.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleTouchStart, handleTouchEnd, handleMouseDown, handleMouseUp]);
    const unbindEvents = useCallback((element) => {
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
export const useSwipeGestureRef = (config = {}, callbacks = {}) => {
    const elementRef = useRef(null);
    const { bindEvents, unbindEvents, isSwiping } = useSwipeGesture(config, callbacks);
    useEffect(() => {
        const element = elementRef.current;
        if (!element)
            return;
        const cleanup = bindEvents(element);
        return cleanup;
    }, [bindEvents]);
    return {
        ref: elementRef,
        isSwiping,
    };
};
export const useKeyboardNavigation = (callbacks = {}) => {
    const { onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onSpace, onEnter, onEscape, } = callbacks;
    useEffect(() => {
        const handleKeyDown = (event) => {
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
export const useLongPress = (callback, options = {}) => {
    const { threshold = 500, onStart, onFinish, onCancel } = options;
    const [isLongPressing, setIsLongPressing] = useState(false);
    const timeout = useRef();
    const target = useRef();
    const start = useCallback((event) => {
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

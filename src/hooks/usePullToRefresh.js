import { useState, useEffect, useCallback, useRef } from 'react';
export var PullToRefreshState;
(function (PullToRefreshState) {
    PullToRefreshState["IDLE"] = "idle";
    PullToRefreshState["PULLING"] = "pulling";
    PullToRefreshState["READY_TO_REFRESH"] = "ready_to_refresh";
    PullToRefreshState["REFRESHING"] = "refreshing";
    PullToRefreshState["COMPLETED"] = "completed";
})(PullToRefreshState || (PullToRefreshState = {}));
const DEFAULT_CONFIG = {
    threshold: 80,
    maxPullDistance: 120,
    refreshDuration: 1000,
    enabled: true,
    damping: 0.6,
};
export const usePullToRefresh = (onRefresh, config = {}) => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const [state, setState] = useState(PullToRefreshState.IDLE);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef(null);
    const startYRef = useRef(0);
    const currentYRef = useRef(0);
    const isDraggingRef = useRef(false);
    const animationFrameRef = useRef(null);
    const progress = Math.min(pullDistance / finalConfig.threshold, 1);
    const canRefresh = pullDistance >= finalConfig.threshold && state === PullToRefreshState.READY_TO_REFRESH;
    const updatePullDistance = useCallback((distance) => {
        const dampedDistance = distance * finalConfig.damping;
        const clampedDistance = Math.min(dampedDistance, finalConfig.maxPullDistance);
        setPullDistance(Math.max(0, clampedDistance));
        if (clampedDistance >= finalConfig.threshold && state !== PullToRefreshState.REFRESHING) {
            setState(PullToRefreshState.READY_TO_REFRESH);
        }
        else if (clampedDistance > 0 && clampedDistance < finalConfig.threshold) {
            setState(PullToRefreshState.PULLING);
        }
        else if (clampedDistance === 0 && state !== PullToRefreshState.REFRESHING) {
            setState(PullToRefreshState.IDLE);
        }
    }, [finalConfig.threshold, finalConfig.maxPullDistance, finalConfig.damping, state]);
    const handleTouchStart = useCallback((e) => {
        if (!finalConfig.enabled || !containerRef.current)
            return;
        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        if (scrollTop > 0)
            return;
        startYRef.current = e.touches[0].clientY;
        currentYRef.current = startYRef.current;
        isDraggingRef.current = true;
    }, [finalConfig.enabled]);
    const handleTouchMove = useCallback((e) => {
        if (!isDraggingRef.current || !finalConfig.enabled)
            return;
        currentYRef.current = e.touches[0].clientY;
        const deltaY = currentYRef.current - startYRef.current;
        if (deltaY > 0) {
            e.preventDefault();
            updatePullDistance(deltaY);
        }
    }, [finalConfig.enabled, updatePullDistance]);
    const handleTouchEnd = useCallback(async () => {
        if (!isDraggingRef.current)
            return;
        isDraggingRef.current = false;
        if (pullDistance >= finalConfig.threshold && state === PullToRefreshState.READY_TO_REFRESH) {
            setState(PullToRefreshState.REFRESHING);
            setIsRefreshing(true);
            try {
                await onRefresh();
            }
            catch (error) {
                console.error('Refresh failed:', error);
            }
            setTimeout(() => {
                setState(PullToRefreshState.COMPLETED);
                setTimeout(() => {
                    setState(PullToRefreshState.IDLE);
                    setPullDistance(0);
                    setIsRefreshing(false);
                }, 300);
            }, finalConfig.refreshDuration);
        }
        else {
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
                }
                else {
                    setState(PullToRefreshState.IDLE);
                    setPullDistance(0);
                }
            };
            animate();
        }
    }, [pullDistance, finalConfig.threshold, finalConfig.refreshDuration, state, onRefresh]);
    const handleMouseDown = useCallback((e) => {
        if (!finalConfig.enabled || !containerRef.current)
            return;
        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        if (scrollTop > 0)
            return;
        startYRef.current = e.clientY;
        currentYRef.current = startYRef.current;
        isDraggingRef.current = true;
        e.preventDefault();
    }, [finalConfig.enabled]);
    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current || !finalConfig.enabled)
            return;
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
    const triggerRefresh = useCallback(async () => {
        if (isRefreshing)
            return;
        setState(PullToRefreshState.REFRESHING);
        setIsRefreshing(true);
        setPullDistance(finalConfig.threshold);
        try {
            await onRefresh();
        }
        catch (error) {
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
    const bindToContainer = useCallback((element) => {
        if (containerRef.current) {
            containerRef.current.removeEventListener('touchstart', handleTouchStart);
            containerRef.current.removeEventListener('touchmove', handleTouchMove);
            containerRef.current.removeEventListener('touchend', handleTouchEnd);
            containerRef.current.removeEventListener('mousedown', handleMouseDown);
        }
        containerRef.current = element;
        if (element && finalConfig.enabled) {
            element.addEventListener('touchstart', handleTouchStart, { passive: false });
            element.addEventListener('touchmove', handleTouchMove, { passive: false });
            element.addEventListener('touchend', handleTouchEnd);
            element.addEventListener('mousedown', handleMouseDown);
        }
    }, [finalConfig.enabled, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown]);
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
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);
    const containerStyle = {
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
export const getPullToRefreshStateText = (state) => {
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
export const getPullToRefreshStateIcon = (state) => {
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

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { Box, VStack, Text, Spinner, Icon, Progress, useColorModeValue, } from '@chakra-ui/react';
import { FiArrowDown, FiArrowUp, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { usePullToRefresh, PullToRefreshState, getPullToRefreshStateText, } from '@/hooks/usePullToRefresh';
export const PullToRefresh = ({ onRefresh, children, enabled = true, threshold = 80, maxPullDistance = 120, refreshDuration = 1000, refreshIndicator, containerStyle = {}, indicatorStyle = {}, }) => {
    const containerRef = useRef(null);
    const { state, pullDistance, progress, isRefreshing, bindToContainer, containerStyle: pullContainerStyle, } = usePullToRefresh(onRefresh, {
        enabled,
        threshold,
        maxPullDistance,
        refreshDuration,
    });
    useEffect(() => {
        bindToContainer(containerRef.current);
    }, [bindToContainer]);
    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const iconColor = useColorModeValue('blue.500', 'blue.300');
    const progressColor = useColorModeValue('blue.500', 'blue.300');
    const getStateIcon = () => {
        switch (state) {
            case PullToRefreshState.IDLE:
            case PullToRefreshState.PULLING:
                return FiArrowDown;
            case PullToRefreshState.READY_TO_REFRESH:
                return FiArrowUp;
            case PullToRefreshState.REFRESHING:
                return FiRefreshCw;
            case PullToRefreshState.COMPLETED:
                return FiCheck;
            default:
                return FiArrowDown;
        }
    };
    const renderRefreshIndicator = () => {
        if (refreshIndicator) {
            return refreshIndicator;
        }
        const StateIcon = getStateIcon();
        const stateText = getPullToRefreshStateText(state);
        return (_jsxs(VStack, { spacing: 2, py: 4, children: [_jsx(Box, { transform: state === PullToRefreshState.READY_TO_REFRESH
                        ? 'rotate(180deg)'
                        : state === PullToRefreshState.REFRESHING
                            ? 'rotate(360deg)'
                            : 'rotate(0deg)', transition: "transform 0.3s ease", animation: state === PullToRefreshState.REFRESHING
                        ? 'spin 1s linear infinite'
                        : 'none', children: state === PullToRefreshState.REFRESHING ? (_jsx(Spinner, { size: "md", color: iconColor })) : (_jsx(Icon, { as: StateIcon, boxSize: 6, color: iconColor })) }), _jsx(Text, { fontSize: "sm", color: textColor, fontWeight: "medium", children: stateText }), (state === PullToRefreshState.PULLING || state === PullToRefreshState.READY_TO_REFRESH) && (_jsx(Progress, { value: progress * 100, size: "sm", colorScheme: "blue", width: "60px", borderRadius: "full", bg: "gray.200", _dark: { bg: 'gray.600' } }))] }));
    };
    return (_jsxs(Box, { ref: containerRef, position: "relative", height: "100%", overflow: "auto", style: {
            ...containerStyle,
            WebkitOverflowScrolling: 'touch',
        }, children: [_jsx(Box, { position: "absolute", top: -threshold, left: 0, right: 0, height: threshold, display: "flex", alignItems: "center", justifyContent: "center", bg: bgColor, zIndex: 10, opacity: pullDistance > 0 ? 1 : 0, transform: `translateY(${Math.min(pullDistance, threshold)}px)`, transition: pullDistance > 0 ? 'none' : 'opacity 0.3s ease, transform 0.3s ease', style: indicatorStyle, children: renderRefreshIndicator() }), _jsx(Box, { style: {
                    ...pullContainerStyle,
                    minHeight: '100%',
                }, children: children })] }));
};
export const SimplePullToRefresh = ({ onRefresh, children, isRefreshing = false }) => {
    return (_jsx(PullToRefresh, { onRefresh: onRefresh, enabled: !isRefreshing, threshold: 60, maxPullDistance: 80, refreshDuration: 800, children: children }));
};
export const CustomRefreshIndicator = ({ state, progress, message }) => {
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const iconColor = useColorModeValue('blue.500', 'blue.300');
    return (_jsxs(VStack, { spacing: 3, py: 6, children: [_jsx(Box, { width: "40px", height: "40px", borderRadius: "full", bg: iconColor, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.8 + progress * 0.4})`, transition: "transform 0.2s ease", children: state === PullToRefreshState.REFRESHING ? (_jsx(Spinner, { size: "sm", color: "white" })) : state === PullToRefreshState.COMPLETED ? (_jsx(Icon, { as: FiCheck, color: "white", boxSize: 5 })) : (_jsx(Icon, { as: state === PullToRefreshState.READY_TO_REFRESH ? FiArrowUp : FiArrowDown, color: "white", boxSize: 5, transform: state === PullToRefreshState.READY_TO_REFRESH
                        ? 'rotate(0deg)'
                        : `rotate(${progress * 180}deg)`, transition: "transform 0.2s ease" })) }), _jsx(Text, { fontSize: "sm", color: textColor, fontWeight: "medium", children: message || getPullToRefreshStateText(state) }), state === PullToRefreshState.PULLING && (_jsx(Box, { width: "80px", height: "4px", bg: "gray.200", borderRadius: "full", overflow: "hidden", _dark: { bg: 'gray.600' }, children: _jsx(Box, { width: "100%", height: "100%", bg: iconColor, borderRadius: "full", transform: `scaleX(${progress})`, transformOrigin: "left", transition: "transform 0.1s ease" }) }))] }));
};
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (typeof document !== 'undefined') {
    const existingStyle = document.getElementById('pull-to-refresh-styles');
    if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'pull-to-refresh-styles';
        style.textContent = spinKeyframes;
        document.head.appendChild(style);
    }
}

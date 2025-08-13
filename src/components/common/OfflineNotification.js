import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Alert, AlertIcon, AlertTitle, AlertDescription, Button, HStack, VStack, Text, Badge, useColorModeValue, Slide, Box, Progress, } from '@chakra-ui/react';
import { WarningIcon, RepeatIcon } from '@chakra-ui/icons';
import useNetworkStatus from '../../hooks/useNetworkStatus';
const OfflineNotification = ({ showConnectionType = true, autoRetry = true, retryInterval = 10000, position = 'top', }) => {
    const { networkStatus, isOnline, isOffline, isSlowConnection, retryConnection } = useNetworkStatus();
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [nextRetryIn, setNextRetryIn] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('red.200', 'red.600');
    useEffect(() => {
        setShowNotification(isOffline || isSlowConnection);
    }, [isOffline, isSlowConnection]);
    useEffect(() => {
        if (!autoRetry || isOnline)
            return;
        const interval = setInterval(() => {
            handleRetry();
        }, retryInterval);
        return () => clearInterval(interval);
    }, [autoRetry, retryInterval, isOnline]);
    useEffect(() => {
        if (!autoRetry || isOnline || nextRetryIn <= 0)
            return;
        const countdown = setInterval(() => {
            setNextRetryIn(prev => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(countdown);
    }, [autoRetry, isOnline, nextRetryIn]);
    const handleRetry = async () => {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
        try {
            const success = await retryConnection();
            if (!success && autoRetry) {
                setNextRetryIn(retryInterval / 1000);
            }
        }
        catch (error) {
            console.error('Retry failed:', error);
        }
        finally {
            setIsRetrying(false);
        }
    };
    const handleDismiss = () => {
        setShowNotification(false);
    };
    const getConnectionTypeColor = (effectiveType) => {
        switch (effectiveType) {
            case '4g': return 'green';
            case '3g': return 'yellow';
            case '2g':
            case 'slow-2g': return 'red';
            default: return 'gray';
        }
    };
    const getConnectionTypeLabel = (effectiveType) => {
        switch (effectiveType) {
            case '4g': return '4G';
            case '3g': return '3G';
            case '2g': return '2G';
            case 'slow-2g': return '慢速2G';
            default: return '未知';
        }
    };
    if (!showNotification)
        return null;
    return (_jsx(Slide, { direction: position, in: showNotification, children: _jsx(Box, { position: "fixed", top: position === 'top' ? 4 : undefined, bottom: position === 'bottom' ? 4 : undefined, left: 4, right: 4, zIndex: 9999, children: _jsxs(Alert, { status: isOffline ? 'error' : 'warning', bg: bgColor, border: "1px solid", borderColor: borderColor, borderRadius: "lg", boxShadow: "lg", p: 4, children: [_jsx(AlertIcon, { as: WarningIcon }), _jsxs(VStack, { align: "start", spacing: 2, flex: 1, children: [_jsxs(HStack, { justify: "space-between", w: "full", children: [_jsx(AlertTitle, { fontSize: "sm", children: isOffline ? '网络连接已断开' : '网络连接较慢' }), showConnectionType && networkStatus.effectiveType !== 'unknown' && (_jsx(Badge, { colorScheme: getConnectionTypeColor(networkStatus.effectiveType), size: "sm", children: getConnectionTypeLabel(networkStatus.effectiveType) }))] }), _jsx(AlertDescription, { fontSize: "xs", color: "gray.600", children: isOffline
                                    ? '请检查您的网络连接，某些功能可能无法正常使用'
                                    : '当前网络较慢，加载可能需要更长时间' }), isRetrying && (_jsxs(Box, { w: "full", children: [_jsxs(Text, { fontSize: "xs", color: "gray.500", mb: 1, children: ["\u6B63\u5728\u91CD\u8BD5\u8FDE\u63A5... (\u7B2C ", retryCount, " \u6B21)"] }), _jsx(Progress, { size: "xs", isIndeterminate: true, colorScheme: "blue" })] })), autoRetry && nextRetryIn > 0 && !isRetrying && (_jsxs(Text, { fontSize: "xs", color: "gray.500", children: [nextRetryIn, " \u79D2\u540E\u81EA\u52A8\u91CD\u8BD5"] })), _jsxs(HStack, { spacing: 2, w: "full", justify: "flex-end", children: [_jsx(Button, { size: "xs", variant: "ghost", onClick: handleDismiss, children: "\u5FFD\u7565" }), _jsx(Button, { size: "xs", leftIcon: _jsx(RepeatIcon, {}), colorScheme: "blue", isLoading: isRetrying, loadingText: "\u91CD\u8BD5\u4E2D", onClick: handleRetry, children: "\u91CD\u8BD5" })] })] })] }) }) }));
};
export default OfflineNotification;

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Button, HStack, VStack, Text, Icon, Badge, Slide, useToast, Spinner, } from '@chakra-ui/react';
import { FiWifi, FiWifiOff, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
export var NetworkStatus;
(function (NetworkStatus) {
    NetworkStatus["ONLINE"] = "online";
    NetworkStatus["OFFLINE"] = "offline";
    NetworkStatus["SLOW"] = "slow";
    NetworkStatus["UNKNOWN"] = "unknown";
})(NetworkStatus || (NetworkStatus = {}));
export const useNetworkStatus = () => {
    const [connectionInfo, setConnectionInfo] = useState({
        status: navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE,
    });
    const [isChecking, setIsChecking] = useState(false);
    const toast = useToast();
    const getConnectionInfo = useCallback(() => {
        const connection = navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;
        const baseInfo = {
            status: navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE,
        };
        if (connection) {
            baseInfo.effectiveType = connection.effectiveType;
            baseInfo.downlink = connection.downlink;
            baseInfo.rtt = connection.rtt;
            baseInfo.saveData = connection.saveData;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                baseInfo.status = NetworkStatus.SLOW;
            }
            else if (connection.rtt > 1000 || connection.downlink < 0.5) {
                baseInfo.status = NetworkStatus.SLOW;
            }
        }
        return baseInfo;
    }, []);
    const updateConnectionStatus = useCallback(() => {
        const newConnectionInfo = getConnectionInfo();
        setConnectionInfo(prev => {
            if (prev.status !== newConnectionInfo.status) {
                if (newConnectionInfo.status === NetworkStatus.ONLINE && prev.status === NetworkStatus.OFFLINE) {
                    toast({
                        title: '网络已连接',
                        description: '网络连接已恢复',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                }
                else if (newConnectionInfo.status === NetworkStatus.OFFLINE) {
                    toast({
                        title: '网络已断开',
                        description: '请检查网络连接',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }
                else if (newConnectionInfo.status === NetworkStatus.SLOW) {
                    toast({
                        title: '网络较慢',
                        description: '当前网络连接较慢，可能影响使用体验',
                        status: 'warning',
                        duration: 4000,
                        isClosable: true,
                    });
                }
            }
            return newConnectionInfo;
        });
    }, [getConnectionInfo, toast]);
    const checkNetworkStatus = useCallback(async () => {
        setIsChecking(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                setConnectionInfo(prev => ({ ...prev, status: NetworkStatus.ONLINE }));
                toast({
                    title: '网络检查完成',
                    description: '网络连接正常',
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                });
            }
            else {
                throw new Error('Network check failed');
            }
        }
        catch (error) {
            setConnectionInfo(prev => ({ ...prev, status: NetworkStatus.OFFLINE }));
            toast({
                title: '网络检查失败',
                description: '无法连接到网络，请检查网络设置',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
        finally {
            setIsChecking(false);
        }
    }, [toast]);
    useEffect(() => {
        updateConnectionStatus();
        const handleOnline = () => updateConnectionStatus();
        const handleOffline = () => updateConnectionStatus();
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        const connection = navigator.connection;
        if (connection) {
            const handleConnectionChange = () => updateConnectionStatus();
            connection.addEventListener('change', handleConnectionChange);
            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
                connection.removeEventListener('change', handleConnectionChange);
            };
        }
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [updateConnectionStatus]);
    return {
        ...connectionInfo,
        isChecking,
        checkNetworkStatus,
        isOnline: connectionInfo.status === NetworkStatus.ONLINE,
        isOffline: connectionInfo.status === NetworkStatus.OFFLINE,
        isSlow: connectionInfo.status === NetworkStatus.SLOW,
    };
};
export const NetworkStatusIndicator = ({ showDetails = false, compact = false }) => {
    const networkStatus = useNetworkStatus();
    const getStatusColor = () => {
        switch (networkStatus.status) {
            case NetworkStatus.ONLINE:
                return 'green';
            case NetworkStatus.SLOW:
                return 'yellow';
            case NetworkStatus.OFFLINE:
                return 'red';
            default:
                return 'gray';
        }
    };
    const getStatusText = () => {
        switch (networkStatus.status) {
            case NetworkStatus.ONLINE:
                return '在线';
            case NetworkStatus.SLOW:
                return '网络较慢';
            case NetworkStatus.OFFLINE:
                return '离线';
            default:
                return '未知';
        }
    };
    const getStatusIcon = () => {
        switch (networkStatus.status) {
            case NetworkStatus.ONLINE:
                return FiWifi;
            case NetworkStatus.SLOW:
                return FiWifi;
            case NetworkStatus.OFFLINE:
                return FiWifiOff;
            default:
                return FiAlertCircle;
        }
    };
    if (compact) {
        return (_jsxs(HStack, { spacing: 1, children: [_jsx(Icon, { as: getStatusIcon(), color: `${getStatusColor()}.500`, boxSize: 4 }), _jsx(Badge, { colorScheme: getStatusColor(), variant: "subtle", fontSize: "xs", children: getStatusText() })] }));
    }
    return (_jsxs(VStack, { spacing: 2, align: "start", children: [_jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: getStatusIcon(), color: `${getStatusColor()}.500` }), _jsxs(Text, { fontSize: "sm", fontWeight: "medium", children: ["\u7F51\u7EDC\u72B6\u6001: ", getStatusText()] })] }), showDetails && networkStatus.effectiveType && (_jsxs(VStack, { spacing: 1, align: "start", fontSize: "xs", color: "gray.600", _dark: { color: 'gray.400' }, children: [_jsxs(Text, { children: ["\u8FDE\u63A5\u7C7B\u578B: ", networkStatus.effectiveType] }), networkStatus.downlink && (_jsxs(Text, { children: ["\u4E0B\u8F7D\u901F\u5EA6: ", networkStatus.downlink, " Mbps"] })), networkStatus.rtt && (_jsxs(Text, { children: ["\u5EF6\u8FDF: ", networkStatus.rtt, " ms"] })), networkStatus.saveData && (_jsx(Text, { children: "\u7701\u6D41\u91CF\u6A21\u5F0F: \u5DF2\u5F00\u542F" }))] }))] }));
};
export const OfflineAlert = ({ isVisible, onRetry }) => {
    const { isOffline, checkNetworkStatus, isChecking } = useNetworkStatus();
    const showAlert = isVisible !== undefined ? isVisible : isOffline;
    if (!showAlert)
        return null;
    return (_jsx(Slide, { direction: "top", in: showAlert, style: { zIndex: 1000 }, children: _jsxs(Alert, { status: "error", variant: "solid", children: [_jsx(AlertIcon, {}), _jsxs(Box, { flex: "1", children: [_jsx(AlertTitle, { fontSize: "sm", children: "\u7F51\u7EDC\u8FDE\u63A5\u5DF2\u65AD\u5F00" }), _jsx(AlertDescription, { fontSize: "sm", children: "\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\uFF0C\u67D0\u4E9B\u529F\u80FD\u53EF\u80FD\u65E0\u6CD5\u6B63\u5E38\u4F7F\u7528" })] }), _jsx(Button, { size: "sm", variant: "outline", colorScheme: "whiteAlpha", leftIcon: isChecking ? _jsx(Spinner, { size: "xs" }) : _jsx(FiRefreshCw, {}), onClick: onRetry || checkNetworkStatus, isLoading: isChecking, loadingText: "\u68C0\u67E5\u4E2D", children: "\u91CD\u8BD5" })] }) }));
};
export const NetworkRetry = ({ onRetry, isRetrying = false, error }) => {
    const { isOffline } = useNetworkStatus();
    return (_jsxs(VStack, { spacing: 4, p: 6, textAlign: "center", children: [_jsx(Icon, { as: FiWifiOff, boxSize: 12, color: "red.500" }), _jsxs(VStack, { spacing: 2, children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", children: isOffline ? '网络连接已断开' : '请求失败' }), _jsx(Text, { fontSize: "sm", color: "gray.600", _dark: { color: 'gray.400' }, children: error || (isOffline ? '请检查网络连接后重试' : '请求过程中发生错误，请重试') })] }), _jsx(Button, { leftIcon: isRetrying ? _jsx(Spinner, { size: "sm" }) : _jsx(FiRefreshCw, {}), onClick: onRetry, isLoading: isRetrying, loadingText: "\u91CD\u8BD5\u4E2D...", colorScheme: "blue", children: "\u91CD\u8BD5" })] }));
};
export const NetworkStatusProvider = ({ children, showOfflineAlert = true }) => {
    return (_jsxs(_Fragment, { children: [children, showOfflineAlert && _jsx(OfflineAlert, {})] }));
};
export default useNetworkStatus;

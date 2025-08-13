import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Box, HStack, VStack, Text, Button, Icon, Badge, Tooltip, Progress, Alert, AlertIcon, AlertDescription, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton, useToast, Spinner, } from '@chakra-ui/react';
import { FiSave, FiCheck, FiClock, FiWifi, FiWifiOff, FiAlertCircle, FiDatabase, FiRefreshCw, } from 'react-icons/fi';
import { useDataPersistence } from '@/hooks/useDataPersistence';
export const AutoSaveStatus = ({ showDetails = false, compact = false, position = 'bottom', }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastSaveText, setLastSaveText] = useState('');
    const toast = useToast();
    const { isSaving, hasUnsavedChanges, lastSaveTime, storageUsage, forceSave, updateStorageUsage, } = useDataPersistence();
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    useEffect(() => {
        const updateLastSaveText = () => {
            if (!lastSaveTime) {
                setLastSaveText('从未保存');
                return;
            }
            const now = new Date();
            const saveTime = new Date(lastSaveTime);
            const diffMs = now.getTime() - saveTime.getTime();
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffSeconds < 60) {
                setLastSaveText('刚刚保存');
            }
            else if (diffMinutes < 60) {
                setLastSaveText(`${diffMinutes}分钟前保存`);
            }
            else if (diffHours < 24) {
                setLastSaveText(`${diffHours}小时前保存`);
            }
            else {
                setLastSaveText(saveTime.toLocaleDateString('zh-CN'));
            }
        };
        updateLastSaveText();
        const interval = setInterval(updateLastSaveText, 30000);
        return () => clearInterval(interval);
    }, [lastSaveTime]);
    const handleManualSave = async () => {
        try {
            await forceSave();
            toast({
                title: '保存成功',
                description: '所有数据已保存',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        }
        catch (error) {
            console.error('Manual save failed:', error);
            toast({
                title: '保存失败',
                description: '保存数据时发生错误，请重试',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };
    const getStatusInfo = () => {
        if (isSaving) {
            return {
                icon: FiRefreshCw,
                color: 'blue.500',
                text: '保存中...',
                badgeColor: 'blue',
            };
        }
        if (!isOnline) {
            return {
                icon: FiWifiOff,
                color: 'red.500',
                text: '离线模式',
                badgeColor: 'red',
            };
        }
        if (hasUnsavedChanges) {
            return {
                icon: FiAlertCircle,
                color: 'orange.500',
                text: '有未保存更改',
                badgeColor: 'orange',
            };
        }
        return {
            icon: FiCheck,
            color: 'green.500',
            text: '已保存',
            badgeColor: 'green',
        };
    };
    const statusInfo = getStatusInfo();
    if (compact) {
        return (_jsx(Tooltip, { label: _jsxs(VStack, { spacing: 1, align: "start", children: [_jsx(Text, { fontSize: "sm", children: statusInfo.text }), _jsx(Text, { fontSize: "xs", color: "gray.300", children: lastSaveText }), !isOnline && (_jsx(Text, { fontSize: "xs", color: "red.300", children: "\u6570\u636E\u5C06\u5728\u8054\u7F51\u540E\u540C\u6B65" }))] }), placement: position, children: _jsxs(HStack, { spacing: 1, cursor: "pointer", children: [_jsx(Icon, { as: statusInfo.icon, color: statusInfo.color, boxSize: 4, className: isSaving ? 'spin' : '' }), hasUnsavedChanges && (_jsx(Box, { w: 2, h: 2, bg: "orange.500", borderRadius: "full" }))] }) }));
    }
    if (showDetails) {
        return (_jsx(Box, { bg: "white", border: "1px", borderColor: "gray.200", borderRadius: "md", p: 4, shadow: "sm", _dark: {
                bg: 'gray.800',
                borderColor: 'gray.600',
            }, children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", children: [_jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: statusInfo.icon, color: statusInfo.color, className: isSaving ? 'spin' : '' }), _jsx(Text, { fontWeight: "semibold", children: statusInfo.text })] }), _jsx(Badge, { colorScheme: statusInfo.badgeColor, variant: "subtle", children: isOnline ? '在线' : '离线' })] }), _jsxs(HStack, { spacing: 2, fontSize: "sm", color: "gray.600", _dark: { color: 'gray.400' }, children: [_jsx(Icon, { as: FiClock }), _jsx(Text, { children: lastSaveText })] }), _jsxs(VStack, { spacing: 2, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", fontSize: "sm", children: [_jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiDatabase }), _jsx(Text, { children: "\u5B58\u50A8\u4F7F\u7528" })] }), _jsxs(Text, { children: [storageUsage.percentage.toFixed(1), "%"] })] }), _jsx(Progress, { value: storageUsage.percentage, colorScheme: storageUsage.percentage > 80 ? 'red' : 'blue', size: "sm" })] }), !isOnline && (_jsxs(Alert, { status: "warning", size: "sm", borderRadius: "md", children: [_jsx(AlertIcon, {}), _jsx(AlertDescription, { fontSize: "sm", children: "\u5F53\u524D\u5904\u4E8E\u79BB\u7EBF\u72B6\u6001\uFF0C\u6570\u636E\u5C06\u5728\u8054\u7F51\u540E\u81EA\u52A8\u540C\u6B65" })] })), _jsxs(HStack, { spacing: 2, children: [_jsx(Button, { size: "sm", leftIcon: _jsx(FiSave, {}), onClick: handleManualSave, isLoading: isSaving, loadingText: "\u4FDD\u5B58\u4E2D", isDisabled: !hasUnsavedChanges && !isSaving, colorScheme: "blue", variant: "outline", flex: 1, children: "\u624B\u52A8\u4FDD\u5B58" }), _jsx(Button, { size: "sm", leftIcon: _jsx(FiRefreshCw, {}), onClick: updateStorageUsage, variant: "ghost", children: "\u5237\u65B0" })] })] }) }));
    }
    return (_jsxs(Popover, { placement: position, children: [_jsx(PopoverTrigger, { children: _jsx(Button, { variant: "ghost", size: "sm", leftIcon: _jsx(Icon, { as: statusInfo.icon, color: statusInfo.color, className: isSaving ? 'spin' : '' }), rightIcon: hasUnsavedChanges ? (_jsx(Box, { w: 2, h: 2, bg: "orange.500", borderRadius: "full" })) : undefined, children: statusInfo.text }) }), _jsxs(PopoverContent, { children: [_jsx(PopoverArrow, {}), _jsx(PopoverCloseButton, {}), _jsx(PopoverHeader, { children: _jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiDatabase }), _jsx(Text, { children: "\u6570\u636E\u72B6\u6001" })] }) }), _jsx(PopoverBody, { children: _jsxs(VStack, { spacing: 3, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { fontSize: "sm", children: "\u72B6\u6001:" }), _jsx(Badge, { colorScheme: statusInfo.badgeColor, children: statusInfo.text })] }), _jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { fontSize: "sm", children: "\u7F51\u7EDC:" }), _jsxs(HStack, { spacing: 1, children: [_jsx(Icon, { as: isOnline ? FiWifi : FiWifiOff, color: isOnline ? 'green.500' : 'red.500' }), _jsx(Text, { fontSize: "sm", children: isOnline ? '在线' : '离线' })] })] }), _jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { fontSize: "sm", children: "\u6700\u540E\u4FDD\u5B58:" }), _jsx(Text, { fontSize: "sm", color: "gray.600", _dark: { color: 'gray.400' }, children: lastSaveText })] }), _jsxs(VStack, { spacing: 1, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { fontSize: "sm", children: "\u5B58\u50A8\u4F7F\u7528:" }), _jsxs(Text, { fontSize: "sm", children: [storageUsage.percentage.toFixed(1), "%"] })] }), _jsx(Progress, { value: storageUsage.percentage, colorScheme: storageUsage.percentage > 80 ? 'red' : 'blue', size: "sm" })] }), _jsx(Button, { size: "sm", leftIcon: _jsx(FiSave, {}), onClick: handleManualSave, isLoading: isSaving, loadingText: "\u4FDD\u5B58\u4E2D", isDisabled: !hasUnsavedChanges && !isSaving, colorScheme: "blue", variant: "outline", children: "\u624B\u52A8\u4FDD\u5B58" })] }) })] })] }));
};
export const FloatingAutoSaveStatus = () => {
    const { isSaving, hasUnsavedChanges } = useDataPersistence();
    if (!isSaving && !hasUnsavedChanges) {
        return null;
    }
    return (_jsx(Box, { position: "fixed", bottom: 4, right: 4, zIndex: 1000, bg: "white", border: "1px", borderColor: "gray.200", borderRadius: "full", px: 3, py: 2, shadow: "lg", _dark: {
            bg: 'gray.800',
            borderColor: 'gray.600',
        }, children: _jsx(HStack, { spacing: 2, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(Spinner, { size: "sm", color: "blue.500" }), _jsx(Text, { fontSize: "sm", color: "blue.500", children: "\u4FDD\u5B58\u4E2D..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Icon, { as: FiAlertCircle, color: "orange.500" }), _jsx(Text, { fontSize: "sm", color: "orange.500", children: "\u6709\u672A\u4FDD\u5B58\u66F4\u6539" })] })) }) }));
};
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = spinKeyframes;
    document.head.appendChild(style);
}

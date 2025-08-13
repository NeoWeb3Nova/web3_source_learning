import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, VStack, HStack, Text, Button, Alert, AlertIcon, AlertTitle, AlertDescription, Badge, Icon, Slide, ScaleFade, useToast, useColorModeValue, Tooltip, Progress, } from '@chakra-ui/react';
import { FiRefreshCw, FiDownload, FiCheck, FiX, FiClock, FiBell, FiWifi, FiWifiOff, } from 'react-icons/fi';
export var UpdateType;
(function (UpdateType) {
    UpdateType["VOCABULARY"] = "vocabulary";
    UpdateType["CONTENT"] = "content";
    UpdateType["FEATURE"] = "feature";
    UpdateType["SYSTEM"] = "system";
})(UpdateType || (UpdateType = {}));
export var UpdateStatus;
(function (UpdateStatus) {
    UpdateStatus["AVAILABLE"] = "available";
    UpdateStatus["DOWNLOADING"] = "downloading";
    UpdateStatus["READY"] = "ready";
    UpdateStatus["INSTALLING"] = "installing";
    UpdateStatus["COMPLETED"] = "completed";
    UpdateStatus["FAILED"] = "failed";
})(UpdateStatus || (UpdateStatus = {}));
export const ContentUpdateNotification = ({ updateInfo, status, progress, visible, isOnline, onStartUpdate, onCancelUpdate, onApplyUpdate, onIgnoreUpdate, onClose, }) => {
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const textColor = useColorModeValue('gray.800', 'white');
    const mutedColor = useColorModeValue('gray.600', 'gray.400');
    const getTypeColorScheme = (type) => {
        switch (type) {
            case UpdateType.VOCABULARY:
                return 'blue';
            case UpdateType.CONTENT:
                return 'green';
            case UpdateType.FEATURE:
                return 'purple';
            case UpdateType.SYSTEM:
                return 'orange';
            default:
                return 'gray';
        }
    };
    const getTypeDisplayName = (type) => {
        switch (type) {
            case UpdateType.VOCABULARY:
                return '词汇更新';
            case UpdateType.CONTENT:
                return '内容更新';
            case UpdateType.FEATURE:
                return '功能更新';
            case UpdateType.SYSTEM:
                return '系统更新';
            default:
                return '更新';
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatTime = (date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMinutes < 1)
            return '刚刚';
        if (diffMinutes < 60)
            return `${diffMinutes}分钟前`;
        if (diffHours < 24)
            return `${diffHours}小时前`;
        if (diffDays < 7)
            return `${diffDays}天前`;
        return date.toLocaleDateString('zh-CN');
    };
    const handleStartUpdate = () => {
        if (!updateInfo)
            return;
        if (!isOnline) {
            toast({
                title: '网络连接失败',
                description: '请检查网络连接后重试',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        onStartUpdate(updateInfo);
    };
    const handleIgnoreUpdate = () => {
        if (!updateInfo)
            return;
        onIgnoreUpdate(updateInfo.id);
        onClose();
    };
    const renderStatusIndicator = () => {
        switch (status) {
            case UpdateStatus.AVAILABLE:
                return (_jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiDownload, color: "blue.500" }), _jsx(Text, { fontSize: "sm", color: "blue.500", fontWeight: "medium", children: "\u53EF\u66F4\u65B0" })] }));
            case UpdateStatus.DOWNLOADING:
                return (_jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiDownload, color: "blue.500", className: "animate-pulse" }), _jsxs(Text, { fontSize: "sm", color: "blue.500", fontWeight: "medium", children: ["\u4E0B\u8F7D\u4E2D ", progress, "%"] })] }));
            case UpdateStatus.READY:
                return (_jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiCheck, color: "green.500" }), _jsx(Text, { fontSize: "sm", color: "green.500", fontWeight: "medium", children: "\u51C6\u5907\u5B89\u88C5" })] }));
            case UpdateStatus.INSTALLING:
                return (_jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiRefreshCw, color: "orange.500", className: "animate-spin" }), _jsx(Text, { fontSize: "sm", color: "orange.500", fontWeight: "medium", children: "\u5B89\u88C5\u4E2D..." })] }));
            case UpdateStatus.COMPLETED:
                return (_jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiCheck, color: "green.500" }), _jsx(Text, { fontSize: "sm", color: "green.500", fontWeight: "medium", children: "\u66F4\u65B0\u5B8C\u6210" })] }));
            case UpdateStatus.FAILED:
                return (_jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiX, color: "red.500" }), _jsx(Text, { fontSize: "sm", color: "red.500", fontWeight: "medium", children: "\u66F4\u65B0\u5931\u8D25" })] }));
            default:
                return null;
        }
    };
    const renderActionButtons = () => {
        switch (status) {
            case UpdateStatus.AVAILABLE:
                return (_jsxs(HStack, { spacing: 2, children: [_jsx(Button, { size: "sm", colorScheme: "blue", leftIcon: _jsx(FiDownload, {}), onClick: handleStartUpdate, isDisabled: !isOnline, children: "\u7ACB\u5373\u66F4\u65B0" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: handleIgnoreUpdate, children: "\u5FFD\u7565" })] }));
            case UpdateStatus.DOWNLOADING:
                return (_jsx(Button, { size: "sm", variant: "outline", leftIcon: _jsx(FiX, {}), onClick: onCancelUpdate, children: "\u53D6\u6D88\u4E0B\u8F7D" }));
            case UpdateStatus.READY:
                return (_jsxs(HStack, { spacing: 2, children: [_jsx(Button, { size: "sm", colorScheme: "green", leftIcon: _jsx(FiCheck, {}), onClick: onApplyUpdate, children: "\u5E94\u7528\u66F4\u65B0" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: onClose, children: "\u7A0D\u540E" })] }));
            case UpdateStatus.INSTALLING:
                return (_jsx(Text, { fontSize: "sm", color: mutedColor, children: "\u6B63\u5728\u5B89\u88C5\u66F4\u65B0\uFF0C\u8BF7\u7A0D\u5019..." }));
            case UpdateStatus.COMPLETED:
                return (_jsx(Button, { size: "sm", colorScheme: "green", onClick: onClose, children: "\u786E\u5B9A" }));
            case UpdateStatus.FAILED:
                return (_jsxs(HStack, { spacing: 2, children: [_jsx(Button, { size: "sm", colorScheme: "red", variant: "outline", leftIcon: _jsx(FiRefreshCw, {}), onClick: handleStartUpdate, children: "\u91CD\u8BD5" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: onClose, children: "\u5173\u95ED" })] }));
            default:
                return null;
        }
    };
    if (!updateInfo || !visible) {
        return null;
    }
    return (_jsx(Slide, { direction: "top", in: visible, style: { zIndex: 1000 }, children: _jsxs(Box, { bg: bgColor, border: "1px", borderColor: borderColor, borderRadius: "lg", shadow: "lg", mx: 4, mt: 4, overflow: "hidden", children: [_jsxs(HStack, { justify: "space-between", p: 4, pb: 2, children: [_jsxs(HStack, { spacing: 3, children: [_jsx(Icon, { as: FiBell, color: "blue.500", boxSize: 5 }), _jsxs(VStack, { align: "start", spacing: 0, children: [_jsxs(HStack, { spacing: 2, children: [_jsx(Text, { fontWeight: "semibold", color: textColor, children: updateInfo.title }), _jsx(Badge, { colorScheme: getTypeColorScheme(updateInfo.type), variant: "subtle", fontSize: "xs", children: getTypeDisplayName(updateInfo.type) }), updateInfo.critical && (_jsx(Badge, { colorScheme: "red", variant: "solid", fontSize: "xs", children: "\u91CD\u8981" }))] }), _jsxs(HStack, { spacing: 4, fontSize: "xs", color: mutedColor, children: [_jsxs(HStack, { spacing: 1, children: [_jsx(Icon, { as: FiClock }), _jsx(Text, { children: formatTime(updateInfo.publishedAt) })] }), _jsx(Text, { children: formatFileSize(updateInfo.size) }), _jsxs(Text, { children: ["v", updateInfo.version] })] })] })] }), _jsxs(HStack, { spacing: 2, children: [_jsx(Tooltip, { label: isOnline ? '在线' : '离线', children: _jsx(Icon, { as: isOnline ? FiWifi : FiWifiOff, color: isOnline ? 'green.500' : 'red.500', boxSize: 4 }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: onClose, isDisabled: status === UpdateStatus.INSTALLING, children: _jsx(Icon, { as: FiX }) })] })] }), _jsxs(Box, { px: 4, pb: 2, children: [_jsx(Text, { fontSize: "sm", color: mutedColor, mb: 3, children: updateInfo.description }), updateInfo.changes.length > 0 && (_jsxs(VStack, { align: "start", spacing: 1, mb: 3, children: [_jsx(Text, { fontSize: "sm", fontWeight: "medium", color: textColor, children: "\u66F4\u65B0\u5185\u5BB9\uFF1A" }), updateInfo.changes.slice(0, 3).map((change, index) => (_jsxs(Text, { fontSize: "xs", color: mutedColor, pl: 2, children: ["\u2022 ", change] }, index))), updateInfo.changes.length > 3 && (_jsxs(Text, { fontSize: "xs", color: "blue.500", pl: 2, children: ["+", updateInfo.changes.length - 3, " \u9879\u66F4\u591A\u5185\u5BB9"] }))] })), (status === UpdateStatus.DOWNLOADING || status === UpdateStatus.INSTALLING) && (_jsxs(Box, { mb: 3, children: [_jsx(Progress, { value: progress, colorScheme: "blue", size: "sm", borderRadius: "full", bg: "gray.200", _dark: { bg: 'gray.600' } }), _jsxs(Text, { fontSize: "xs", color: mutedColor, mt: 1, textAlign: "center", children: [status === UpdateStatus.DOWNLOADING ? '下载进度' : '安装进度', ": ", progress, "%"] })] }))] }), _jsxs(HStack, { justify: "space-between", p: 4, pt: 2, bg: "gray.50", _dark: { bg: 'gray.700' }, children: [renderStatusIndicator(), renderActionButtons()] })] }) }));
};
export const UpdateBanner = ({ updateCount, onShowUpdates, onDismiss }) => {
    const bgColor = useColorModeValue('blue.50', 'blue.900');
    const textColor = useColorModeValue('blue.800', 'blue.100');
    if (updateCount === 0)
        return null;
    return (_jsx(ScaleFade, { initialScale: 0.9, in: updateCount > 0, children: _jsxs(Alert, { status: "info", bg: bgColor, borderRadius: "md", mb: 4, children: [_jsx(AlertIcon, { color: "blue.500" }), _jsxs(Box, { flex: "1", children: [_jsxs(AlertTitle, { color: textColor, fontSize: "sm", children: ["\u6709 ", updateCount, " \u4E2A\u53EF\u7528\u66F4\u65B0"] }), _jsx(AlertDescription, { color: textColor, fontSize: "xs", children: "\u70B9\u51FB\u67E5\u770B\u8BE6\u60C5\u5E76\u66F4\u65B0\u5185\u5BB9" })] }), _jsxs(HStack, { spacing: 2, children: [_jsx(Button, { size: "xs", colorScheme: "blue", onClick: onShowUpdates, children: "\u67E5\u770B" }), _jsx(Button, { size: "xs", variant: "ghost", onClick: onDismiss, children: _jsx(Icon, { as: FiX }) })] })] }) }));
};
export const FloatingUpdateButton = ({ hasUpdates, isUpdating, onClick }) => {
    if (!hasUpdates)
        return null;
    return (_jsx(Box, { position: "fixed", bottom: 20, right: 4, zIndex: 1000, children: _jsx(ScaleFade, { initialScale: 0.8, in: hasUpdates, children: _jsx(Button, { colorScheme: "blue", borderRadius: "full", size: "lg", leftIcon: _jsx(FiRefreshCw, { className: isUpdating ? 'animate-spin' : '' }), onClick: onClick, isLoading: isUpdating, loadingText: "\u66F4\u65B0\u4E2D", shadow: "lg", _hover: { transform: 'scale(1.05)' }, transition: "transform 0.2s", children: isUpdating ? '更新中' : '有更新' }) }) }));
};

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Alert, AlertIcon, AlertTitle, AlertDescription, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, useToast, Icon, Badge, Collapse, Code, Divider, } from '@chakra-ui/react';
import { FiAlertTriangle, FiRefreshCw, FiMail, FiChevronDown, FiChevronUp, FiCopy, } from 'react-icons/fi';
import { useNetworkStatus } from './NetworkStatus';
export var ErrorType;
(function (ErrorType) {
    ErrorType["NETWORK"] = "network";
    ErrorType["VALIDATION"] = "validation";
    ErrorType["PERMISSION"] = "permission";
    ErrorType["NOT_FOUND"] = "not_found";
    ErrorType["SERVER"] = "server";
    ErrorType["CLIENT"] = "client";
    ErrorType["UNKNOWN"] = "unknown";
})(ErrorType || (ErrorType = {}));
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
export const useErrorHandler = (config = {}) => {
    const [errors, setErrors] = useState([]);
    const [retryCount, setRetryCount] = useState({});
    const toast = useToast();
    const { isOnline } = useNetworkStatus();
    const { showDetails = false, allowRetry = true, allowReport = true, autoRetry = false, maxRetries = 3, retryDelay = 1000, } = config;
    const addError = useCallback((error) => {
        const errorInfo = {
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            severity: ErrorSeverity.MEDIUM,
            timestamp: new Date(),
            retryable: true,
            reportable: true,
            ...error,
        };
        setErrors(prev => [...prev, errorInfo]);
        toast({
            title: errorInfo.title,
            description: errorInfo.message,
            status: 'error',
            duration: errorInfo.severity === ErrorSeverity.CRITICAL ? null : 5000,
            isClosable: true,
        });
        return errorInfo.id;
    }, [toast]);
    const removeError = useCallback((errorId) => {
        setErrors(prev => prev.filter(error => error.id !== errorId));
        setRetryCount(prev => {
            const newCount = { ...prev };
            delete newCount[errorId];
            return newCount;
        });
    }, []);
    const clearErrors = useCallback(() => {
        setErrors([]);
        setRetryCount({});
    }, []);
    const retryOperation = useCallback(async (errorId, operation) => {
        const error = errors.find(e => e.id === errorId);
        if (!error || !error.retryable)
            return;
        const currentRetries = retryCount[errorId] || 0;
        if (currentRetries >= maxRetries) {
            toast({
                title: '重试次数已达上限',
                description: '请稍后再试或联系技术支持',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        try {
            setRetryCount(prev => ({ ...prev, [errorId]: currentRetries + 1 }));
            if (retryDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
            await operation();
            removeError(errorId);
            toast({
                title: '操作成功',
                description: '重试操作已成功完成',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }
        catch (retryError) {
            console.error('Retry failed:', retryError);
            if (currentRetries + 1 >= maxRetries) {
                toast({
                    title: '重试失败',
                    description: '已达到最大重试次数，请联系技术支持',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    }, [errors, retryCount, maxRetries, retryDelay, removeError, toast]);
    const reportError = useCallback(async (errorId) => {
        const error = errors.find(e => e.id === errorId);
        if (!error || !error.reportable)
            return;
        try {
            const errorReport = {
                id: error.id,
                type: error.type,
                severity: error.severity,
                title: error.title,
                message: error.message,
                details: error.details,
                code: error.code,
                timestamp: error.timestamp,
                stack: error.stack,
                context: error.context,
                userAgent: navigator.userAgent,
                url: window.location.href,
                isOnline,
            };
            console.log('Error report:', errorReport);
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({
                title: '错误报告已发送',
                description: '感谢您的反馈，我们会尽快处理',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }
        catch (reportError) {
            console.error('Failed to report error:', reportError);
            toast({
                title: '报告发送失败',
                description: '请稍后重试或通过其他方式联系我们',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    }, [errors, isOnline, toast]);
    useEffect(() => {
        if (!autoRetry)
            return;
        const retryableErrors = errors.filter(error => error.retryable &&
            error.type === ErrorType.NETWORK &&
            (retryCount[error.id] || 0) < maxRetries);
        retryableErrors.forEach(error => {
            const timeoutId = setTimeout(() => {
            }, retryDelay);
            return () => clearTimeout(timeoutId);
        });
    }, [errors, autoRetry, retryCount, maxRetries, retryDelay]);
    return {
        errors,
        retryCount,
        addError,
        removeError,
        clearErrors,
        retryOperation,
        reportError,
    };
};
export const ErrorDisplay = ({ error, onRetry, onReport, onDismiss, showDetails = false }) => {
    const { isOpen: isDetailsOpen, onToggle: toggleDetails } = useDisclosure();
    const getSeverityColor = (severity) => {
        switch (severity) {
            case ErrorSeverity.LOW:
                return 'blue';
            case ErrorSeverity.MEDIUM:
                return 'yellow';
            case ErrorSeverity.HIGH:
                return 'orange';
            case ErrorSeverity.CRITICAL:
                return 'red';
            default:
                return 'gray';
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case ErrorType.NETWORK:
                return FiRefreshCw;
            case ErrorType.PERMISSION:
                return FiAlertTriangle;
            default:
                return FiAlertTriangle;
        }
    };
    const copyErrorDetails = () => {
        const details = JSON.stringify({
            id: error.id,
            type: error.type,
            title: error.title,
            message: error.message,
            details: error.details,
            code: error.code,
            timestamp: error.timestamp,
        }, null, 2);
        navigator.clipboard.writeText(details);
    };
    return (_jsxs(Alert, { status: "error", variant: "left-accent", borderRadius: "md", flexDirection: "column", alignItems: "flex-start", p: 4, children: [_jsxs(HStack, { w: "full", justify: "space-between", mb: 2, children: [_jsxs(HStack, { spacing: 2, children: [_jsx(AlertIcon, { as: getTypeIcon(error.type) }), _jsxs(VStack, { align: "start", spacing: 0, children: [_jsx(AlertTitle, { fontSize: "sm", children: error.title }), _jsxs(HStack, { spacing: 2, children: [_jsx(Badge, { colorScheme: getSeverityColor(error.severity), size: "sm", children: error.severity }), _jsx(Badge, { variant: "outline", size: "sm", children: error.type }), error.code && (_jsx(Badge, { variant: "subtle", size: "sm", children: error.code }))] })] })] }), onDismiss && (_jsx(Button, { size: "sm", variant: "ghost", onClick: onDismiss, children: "\u00D7" }))] }), _jsx(AlertDescription, { fontSize: "sm", mb: 3, children: error.message }), _jsxs(HStack, { spacing: 2, w: "full", justify: "space-between", children: [_jsxs(HStack, { spacing: 2, children: [onRetry && error.retryable && (_jsx(Button, { size: "sm", leftIcon: _jsx(FiRefreshCw, {}), onClick: onRetry, children: "\u91CD\u8BD5" })), onReport && error.reportable && (_jsx(Button, { size: "sm", variant: "outline", leftIcon: _jsx(FiMail, {}), onClick: onReport, children: "\u62A5\u544A\u95EE\u9898" }))] }), showDetails && (error.details || error.stack) && (_jsx(Button, { size: "sm", variant: "ghost", leftIcon: _jsx(Icon, { as: isDetailsOpen ? FiChevronUp : FiChevronDown }), onClick: toggleDetails, children: "\u8BE6\u60C5" }))] }), showDetails && (_jsxs(Collapse, { in: isDetailsOpen, animateOpacity: true, style: { width: '100%' }, children: [_jsx(Divider, { my: 3 }), _jsxs(VStack, { spacing: 3, align: "stretch", children: [error.details && (_jsxs(Box, { children: [_jsx(Text, { fontSize: "xs", fontWeight: "semibold", mb: 1, children: "\u9519\u8BEF\u8BE6\u60C5:" }), _jsx(Code, { fontSize: "xs", p: 2, borderRadius: "md", whiteSpace: "pre-wrap", children: error.details })] })), error.stack && (_jsxs(Box, { children: [_jsx(Text, { fontSize: "xs", fontWeight: "semibold", mb: 1, children: "\u5806\u6808\u4FE1\u606F:" }), _jsx(Code, { fontSize: "xs", p: 2, borderRadius: "md", whiteSpace: "pre-wrap", maxH: "150px", overflowY: "auto", children: error.stack })] })), _jsxs(HStack, { spacing: 2, children: [_jsx(Button, { size: "xs", leftIcon: _jsx(FiCopy, {}), onClick: copyErrorDetails, children: "\u590D\u5236\u8BE6\u60C5" }), error.timestamp && (_jsx(Text, { fontSize: "xs", color: "gray.500", children: error.timestamp.toLocaleString() }))] })] })] }))] }));
};
export const ErrorList = ({ errors, onRetry, onReport, onDismiss, onClearAll, showDetails = false }) => {
    if (errors.length === 0)
        return null;
    return (_jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", children: [_jsxs(Text, { fontSize: "sm", fontWeight: "semibold", children: ["\u9519\u8BEF\u5217\u8868 (", errors.length, ")"] }), onClearAll && (_jsx(Button, { size: "sm", variant: "ghost", onClick: onClearAll, children: "\u6E05\u9664\u5168\u90E8" }))] }), errors.map(error => (_jsx(ErrorDisplay, { error: error, onRetry: onRetry ? () => onRetry(error.id) : undefined, onReport: onReport ? () => onReport(error.id) : undefined, onDismiss: onDismiss ? () => onDismiss(error.id) : undefined, showDetails: showDetails }, error.id)))] }));
};
export const ErrorModal = ({ error, isOpen, onClose, onRetry, onReport }) => {
    if (!error)
        return null;
    return (_jsxs(Modal, { isOpen: isOpen, onClose: onClose, size: "lg", children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { children: [_jsx(ModalHeader, { children: _jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiAlertTriangle, color: "red.500" }), _jsx(Text, { children: error.title })] }) }), _jsx(ModalCloseButton, {}), _jsx(ModalBody, { children: _jsx(ErrorDisplay, { error: error, showDetails: true }) }), _jsx(ModalFooter, { children: _jsxs(HStack, { spacing: 2, children: [onRetry && error.retryable && (_jsx(Button, { leftIcon: _jsx(FiRefreshCw, {}), onClick: onRetry, children: "\u91CD\u8BD5" })), onReport && error.reportable && (_jsx(Button, { variant: "outline", leftIcon: _jsx(FiMail, {}), onClick: onReport, children: "\u62A5\u544A\u95EE\u9898" })), _jsx(Button, { variant: "ghost", onClick: onClose, children: "\u5173\u95ED" })] }) })] })] }));
};
export const createError = {
    network: (message, details) => ({
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        title: '网络错误',
        message,
        details,
        retryable: true,
    }),
    validation: (message, field) => ({
        type: ErrorType.VALIDATION,
        severity: ErrorSeverity.LOW,
        title: '验证错误',
        message,
        context: field ? { field } : undefined,
        retryable: false,
    }),
    permission: (message) => ({
        type: ErrorType.PERMISSION,
        severity: ErrorSeverity.HIGH,
        title: '权限错误',
        message,
        retryable: false,
    }),
    server: (message, code) => ({
        type: ErrorType.SERVER,
        severity: ErrorSeverity.HIGH,
        title: '服务器错误',
        message,
        code,
        retryable: true,
    }),
    unknown: (message, error) => ({
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        title: '未知错误',
        message,
        details: error?.message,
        stack: error?.stack,
        retryable: true,
    }),
};

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Progress, Alert, AlertIcon, AlertTitle, AlertDescription, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, useToast, Spinner, Icon, } from '@chakra-ui/react';
import { FiRefreshCw, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useAppStateRestore, useDataPersistence } from '@/hooks/useDataPersistence';
export const AppStateRestore = ({ onRestoreComplete, onRestoreError, }) => {
    const [restoreProgress, setRestoreProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const toast = useToast();
    const { isRestoring, restoredData } = useAppStateRestore();
    const { storageUsage } = useDataPersistence();
    const { isOpen: isErrorModalOpen, onOpen: onErrorModalOpen, onClose: onErrorModalClose, } = useDisclosure();
    useEffect(() => {
        if (isRestoring) {
            const steps = [
                { step: '检查本地存储...', progress: 20 },
                { step: '恢复用户设置...', progress: 40 },
                { step: '加载词汇列表...', progress: 60 },
                { step: '恢复学习进度...', progress: 80 },
                { step: '完成状态恢复...', progress: 100 },
            ];
            let currentStepIndex = 0;
            const interval = setInterval(() => {
                if (currentStepIndex < steps.length) {
                    const { step, progress } = steps[currentStepIndex];
                    setCurrentStep(step);
                    setRestoreProgress(progress);
                    currentStepIndex++;
                }
                else {
                    clearInterval(interval);
                }
            }, 300);
            return () => clearInterval(interval);
        }
    }, [isRestoring]);
    useEffect(() => {
        if (!isRestoring && restoreProgress === 100) {
            try {
                if (restoredData.userProgress && restoredData.vocabularyList) {
                    setCurrentStep('状态恢复完成');
                    onRestoreComplete(restoredData);
                    toast({
                        title: '状态恢复成功',
                        description: `已恢复 ${restoredData.vocabularyList.length} 个词汇和学习进度`,
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                }
                else {
                    setCurrentStep('初始化应用状态');
                    onRestoreComplete(restoredData);
                }
            }
            catch (error) {
                console.error('Failed to process restored data:', error);
                setHasError(true);
                setErrorMessage(error instanceof Error ? error.message : '未知错误');
                onErrorModalOpen();
                if (onRestoreError) {
                    onRestoreError(error instanceof Error ? error : new Error('恢复失败'));
                }
            }
        }
    }, [isRestoring, restoreProgress, restoredData, onRestoreComplete, onRestoreError, toast, onErrorModalOpen]);
    const handleRetry = () => {
        setHasError(false);
        setErrorMessage('');
        setRestoreProgress(0);
        setCurrentStep('');
        onErrorModalClose();
        window.location.reload();
    };
    const handleSkipRestore = () => {
        const defaultData = {
            userProgress: null,
            vocabularyList: [],
            userSettings: null,
        };
        onRestoreComplete(defaultData);
        onErrorModalClose();
        toast({
            title: '使用默认状态',
            description: '将使用默认设置开始学习',
            status: 'info',
            duration: 3000,
            isClosable: true,
        });
    };
    if (!isRestoring && !hasError && restoreProgress === 0) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [isRestoring && (_jsx(Box, { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, bg: "rgba(255, 255, 255, 0.95)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", _dark: {
                    bg: 'rgba(26, 32, 44, 0.95)',
                }, children: _jsxs(VStack, { spacing: 6, maxW: "400px", w: "full", px: 6, children: [_jsxs(VStack, { spacing: 2, children: [_jsx(Spinner, { size: "xl", color: "blue.500", thickness: "4px" }), _jsx(Text, { fontSize: "xl", fontWeight: "semibold", children: "\u6062\u590D\u5E94\u7528\u72B6\u6001" }), _jsx(Text, { fontSize: "sm", color: "gray.600", textAlign: "center", _dark: { color: 'gray.400' }, children: "\u6B63\u5728\u6062\u590D\u60A8\u7684\u5B66\u4E60\u8FDB\u5EA6\u548C\u8BBE\u7F6E\uFF0C\u8BF7\u7A0D\u5019..." })] }), _jsxs(VStack, { spacing: 3, w: "full", children: [_jsx(Progress, { value: restoreProgress, colorScheme: "blue", size: "lg", w: "full", borderRadius: "full" }), _jsxs(HStack, { justify: "space-between", w: "full", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", _dark: { color: 'gray.400' }, children: currentStep }), _jsxs(Text, { fontSize: "sm", fontWeight: "semibold", children: [restoreProgress, "%"] })] })] }), storageUsage.used > 0 && (_jsxs(Alert, { status: "info", borderRadius: "md", size: "sm", children: [_jsx(AlertIcon, {}), _jsxs(VStack, { align: "start", spacing: 1, flex: 1, children: [_jsx(AlertTitle, { fontSize: "sm", children: "\u53D1\u73B0\u672C\u5730\u6570\u636E" }), _jsxs(AlertDescription, { fontSize: "xs", children: ["\u5B58\u50A8\u4F7F\u7528: ", (storageUsage.used / 1024).toFixed(1), " KB (", storageUsage.percentage.toFixed(1), "%)"] })] })] }))] }) })), _jsxs(Modal, { isOpen: isErrorModalOpen, onClose: onErrorModalClose, closeOnOverlayClick: false, children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { children: [_jsx(ModalHeader, { children: _jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiAlertTriangle, color: "red.500" }), _jsx(Text, { children: "\u72B6\u6001\u6062\u590D\u5931\u8D25" })] }) }), _jsx(ModalBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(Alert, { status: "error", borderRadius: "md", children: [_jsx(AlertIcon, {}), _jsxs(Box, { children: [_jsx(AlertTitle, { children: "\u6062\u590D\u8FC7\u7A0B\u4E2D\u53D1\u751F\u9519\u8BEF" }), _jsx(AlertDescription, { children: errorMessage || '无法恢复应用状态，可能是数据损坏或存储空间不足。' })] })] }), _jsxs(VStack, { spacing: 2, align: "start", children: [_jsx(Text, { fontSize: "sm", fontWeight: "semibold", children: "\u60A8\u53EF\u4EE5\u9009\u62E9\uFF1A" }), _jsxs(VStack, { align: "start", spacing: 1, pl: 4, children: [_jsx(Text, { fontSize: "sm", children: "\u2022 \u91CD\u8BD5\u6062\u590D\u8FC7\u7A0B" }), _jsx(Text, { fontSize: "sm", children: "\u2022 \u8DF3\u8FC7\u6062\u590D\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u8BBE\u7F6E" })] })] }), storageUsage.percentage > 90 && (_jsxs(Alert, { status: "warning", borderRadius: "md", size: "sm", children: [_jsx(AlertIcon, {}), _jsx(AlertDescription, { fontSize: "sm", children: "\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\u53EF\u80FD\u662F\u5BFC\u81F4\u6062\u590D\u5931\u8D25\u7684\u539F\u56E0\u3002" })] }))] }) }), _jsxs(ModalFooter, { children: [_jsx(Button, { variant: "ghost", mr: 3, onClick: handleSkipRestore, children: "\u8DF3\u8FC7\u6062\u590D" }), _jsx(Button, { colorScheme: "blue", leftIcon: _jsx(FiRefreshCw, {}), onClick: handleRetry, children: "\u91CD\u8BD5" })] })] })] })] }));
};
export const RestoreSuccessIndicator = ({ restoredItemsCount, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);
    return (_jsx(Box, { position: "fixed", top: 4, right: 4, zIndex: 1000, maxW: "300px", children: _jsxs(Alert, { status: "success", borderRadius: "md", shadow: "lg", bg: "white", border: "1px", borderColor: "green.200", _dark: {
                bg: 'gray.800',
                borderColor: 'green.600',
            }, children: [_jsx(AlertIcon, {}), _jsxs(VStack, { align: "start", spacing: 1, flex: 1, children: [_jsx(AlertTitle, { fontSize: "sm", children: _jsxs(HStack, { spacing: 2, children: [_jsx(Icon, { as: FiCheckCircle }), _jsx(Text, { children: "\u72B6\u6001\u6062\u590D\u5B8C\u6210" })] }) }), _jsxs(AlertDescription, { fontSize: "xs", children: ["\u5DF2\u6062\u590D ", restoredItemsCount, " \u9879\u5B66\u4E60\u6570\u636E"] })] }), _jsx(Button, { size: "xs", variant: "ghost", onClick: onDismiss, children: "\u00D7" })] }) }));
};
export const DataMigrationPrompt = ({ onMigrate, onSkip }) => {
    return (_jsxs(Alert, { status: "info", borderRadius: "md", children: [_jsx(AlertIcon, {}), _jsxs(VStack, { align: "start", spacing: 2, flex: 1, children: [_jsx(AlertTitle, { fontSize: "sm", children: "\u53D1\u73B0\u65E7\u7248\u672C\u6570\u636E" }), _jsx(AlertDescription, { fontSize: "xs", children: "\u68C0\u6D4B\u5230\u65E7\u7248\u672C\u7684\u5B66\u4E60\u6570\u636E\uFF0C\u662F\u5426\u9700\u8981\u8FC1\u79FB\u5230\u65B0\u7248\u672C\uFF1F" }), _jsxs(HStack, { spacing: 2, children: [_jsx(Button, { size: "xs", colorScheme: "blue", onClick: onMigrate, children: "\u8FC1\u79FB\u6570\u636E" }), _jsx(Button, { size: "xs", variant: "ghost", onClick: onSkip, children: "\u8DF3\u8FC7" })] })] })] }));
};

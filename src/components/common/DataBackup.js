import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { Box, VStack, HStack, Button, Text, Progress, Alert, AlertIcon, AlertTitle, AlertDescription, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, useToast, Divider, Badge, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid, Icon, Tooltip, } from '@chakra-ui/react';
import { FiDownload, FiUpload, FiSave, FiRefreshCw, FiTrash2, FiDatabase, FiClock, FiHardDrive, } from 'react-icons/fi';
import { useDataPersistence } from '@/hooks/useDataPersistence';
export const DataBackup = ({ isOpen, onClose }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [backupData, setBackupData] = useState(null);
    const fileInputRef = useRef(null);
    const toast = useToast();
    const { storageUsage, lastSaveTime, createBackup, restoreBackup, exportData, importData, clearAllData, } = useDataPersistence();
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose, } = useDisclosure();
    const handleCreateBackup = async () => {
        try {
            setIsProcessing(true);
            setProgress(0);
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 100);
            const backup = await createBackup();
            setBackupData(backup);
            clearInterval(progressInterval);
            setProgress(100);
            toast({
                title: '备份创建成功',
                description: '您的学习数据已成功备份',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }
        catch (error) {
            console.error('Failed to create backup:', error);
            toast({
                title: '备份失败',
                description: '创建备份时发生错误，请重试',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };
    const handleExportData = async () => {
        try {
            setIsProcessing(true);
            const jsonData = await exportData();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `web3-vocab-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast({
                title: '导出成功',
                description: '数据已导出到文件',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }
        catch (error) {
            console.error('Failed to export data:', error);
            toast({
                title: '导出失败',
                description: '导出数据时发生错误，请重试',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleImportData = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        try {
            setIsProcessing(true);
            setProgress(0);
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const jsonData = e.target?.result;
                    const parsedData = JSON.parse(jsonData);
                    if (!parsedData.version || !parsedData.timestamp) {
                        throw new Error('Invalid backup file format');
                    }
                    setProgress(50);
                    await importData(jsonData);
                    setProgress(100);
                    toast({
                        title: '导入成功',
                        description: '数据已成功导入并恢复',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
                catch (error) {
                    console.error('Failed to import data:', error);
                    toast({
                        title: '导入失败',
                        description: '导入的文件格式不正确或数据损坏',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }
                finally {
                    setIsProcessing(false);
                    setProgress(0);
                }
            };
            reader.readAsText(file);
        }
        catch (error) {
            console.error('Failed to read file:', error);
            toast({
                title: '文件读取失败',
                description: '无法读取选择的文件，请重试',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            setIsProcessing(false);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const handleRestoreBackup = async () => {
        if (!backupData)
            return;
        try {
            setIsProcessing(true);
            setProgress(0);
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 100);
            await restoreBackup(backupData);
            clearInterval(progressInterval);
            setProgress(100);
            toast({
                title: '恢复成功',
                description: '数据已成功恢复',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
        catch (error) {
            console.error('Failed to restore backup:', error);
            toast({
                title: '恢复失败',
                description: '恢复数据时发生错误，请重试',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };
    const handleClearAllData = async () => {
        try {
            setIsProcessing(true);
            await clearAllData();
            toast({
                title: '数据已清除',
                description: '所有学习数据已被清除',
                status: 'info',
                duration: 3000,
                isClosable: true,
            });
            onConfirmClose();
            onClose();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
        catch (error) {
            console.error('Failed to clear data:', error);
            toast({
                title: '清除失败',
                description: '清除数据时发生错误，请重试',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        finally {
            setIsProcessing(false);
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
    const formatDate = (date) => {
        if (!date)
            return '从未';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleString('zh-CN');
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Modal, { isOpen: isOpen, onClose: onClose, size: "xl", children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { children: [_jsx(ModalHeader, { children: "\u6570\u636E\u5907\u4EFD\u4E0E\u6062\u590D" }), _jsx(ModalCloseButton, {}), _jsx(ModalBody, { children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 4, children: "\u5B58\u50A8\u72B6\u6001" }), _jsxs(SimpleGrid, { columns: 2, spacing: 4, children: [_jsxs(Stat, { children: [_jsx(StatLabel, { children: _jsxs(HStack, { children: [_jsx(Icon, { as: FiHardDrive }), _jsx(Text, { children: "\u5B58\u50A8\u4F7F\u7528" })] }) }), _jsx(StatNumber, { fontSize: "md", children: formatFileSize(storageUsage.used) }), _jsxs(StatHelpText, { children: [storageUsage.percentage.toFixed(1), "% \u5DF2\u4F7F\u7528"] })] }), _jsxs(Stat, { children: [_jsx(StatLabel, { children: _jsxs(HStack, { children: [_jsx(Icon, { as: FiClock }), _jsx(Text, { children: "\u6700\u540E\u4FDD\u5B58" })] }) }), _jsx(StatNumber, { fontSize: "md", children: formatDate(lastSaveTime) })] })] }), _jsx(Progress, { value: storageUsage.percentage, colorScheme: storageUsage.percentage > 80 ? 'red' : 'blue', size: "sm", mt: 2 })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 4, children: "\u5907\u4EFD\u64CD\u4F5C" }), _jsxs(VStack, { spacing: 3, align: "stretch", children: [_jsxs(HStack, { children: [_jsx(Button, { leftIcon: _jsx(FiSave, {}), onClick: handleCreateBackup, isLoading: isProcessing, loadingText: "\u521B\u5EFA\u4E2D...", colorScheme: "blue", flex: 1, children: "\u521B\u5EFA\u5907\u4EFD" }), _jsx(Button, { leftIcon: _jsx(FiDownload, {}), onClick: handleExportData, isLoading: isProcessing, loadingText: "\u5BFC\u51FA\u4E2D...", variant: "outline", flex: 1, children: "\u5BFC\u51FA\u6570\u636E" })] }), backupData && (_jsxs(Alert, { status: "success", borderRadius: "md", children: [_jsx(AlertIcon, {}), _jsxs(Box, { flex: 1, children: [_jsx(AlertTitle, { children: "\u5907\u4EFD\u5DF2\u521B\u5EFA" }), _jsxs(AlertDescription, { children: ["\u521B\u5EFA\u65F6\u95F4: ", formatDate(backupData.timestamp), _jsxs(Badge, { ml: 2, colorScheme: "blue", children: ["v", backupData.version] })] })] })] }))] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 4, children: "\u6062\u590D\u64CD\u4F5C" }), _jsxs(VStack, { spacing: 3, align: "stretch", children: [_jsxs(HStack, { children: [_jsx(Button, { leftIcon: _jsx(FiRefreshCw, {}), onClick: handleRestoreBackup, isDisabled: !backupData || isProcessing, isLoading: isProcessing, loadingText: "\u6062\u590D\u4E2D...", colorScheme: "green", flex: 1, children: "\u6062\u590D\u5907\u4EFD" }), _jsx(Button, { leftIcon: _jsx(FiUpload, {}), onClick: () => fileInputRef.current?.click(), isLoading: isProcessing, loadingText: "\u5BFC\u5165\u4E2D...", variant: "outline", flex: 1, children: "\u5BFC\u5165\u6570\u636E" })] }), _jsx("input", { ref: fileInputRef, type: "file", accept: ".json", onChange: handleImportData, style: { display: 'none' } })] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 4, color: "red.500", children: "\u5371\u9669\u64CD\u4F5C" }), _jsxs(Alert, { status: "warning", borderRadius: "md", mb: 3, children: [_jsx(AlertIcon, {}), _jsx(AlertDescription, { children: "\u6E05\u9664\u6240\u6709\u6570\u636E\u5C06\u6C38\u4E45\u5220\u9664\u60A8\u7684\u5B66\u4E60\u8FDB\u5EA6\u3001\u8BCD\u6C47\u5217\u8868\u548C\u8BBE\u7F6E\uFF0C\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002" })] }), _jsx(Button, { leftIcon: _jsx(FiTrash2, {}), onClick: onConfirmOpen, colorScheme: "red", variant: "outline", size: "sm", children: "\u6E05\u9664\u6240\u6709\u6570\u636E" })] }), isProcessing && progress > 0 && (_jsxs(Box, { children: [_jsxs(Text, { fontSize: "sm", mb: 2, children: ["\u5904\u7406\u8FDB\u5EA6: ", progress, "%"] }), _jsx(Progress, { value: progress, colorScheme: "blue" })] }))] }) }), _jsx(ModalFooter, { children: _jsx(Button, { onClick: onClose, children: "\u5173\u95ED" }) })] })] }), _jsxs(Modal, { isOpen: isConfirmOpen, onClose: onConfirmClose, children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { children: [_jsx(ModalHeader, { color: "red.500", children: "\u786E\u8BA4\u6E05\u9664\u6570\u636E" }), _jsx(ModalCloseButton, {}), _jsx(ModalBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(Alert, { status: "error", children: [_jsx(AlertIcon, {}), _jsxs(Box, { children: [_jsx(AlertTitle, { children: "\u8B66\u544A\uFF01" }), _jsx(AlertDescription, { children: "\u6B64\u64CD\u4F5C\u5C06\u6C38\u4E45\u5220\u9664\u4EE5\u4E0B\u6570\u636E\uFF1A" })] })] }), _jsxs(VStack, { align: "start", spacing: 2, pl: 4, children: [_jsx(Text, { children: "\u2022 \u6240\u6709\u5B66\u4E60\u8FDB\u5EA6\u548C\u7EDF\u8BA1\u6570\u636E" }), _jsx(Text, { children: "\u2022 \u8BCD\u6C47\u5217\u8868\u548C\u6536\u85CF" }), _jsx(Text, { children: "\u2022 \u7EC3\u4E60\u8BB0\u5F55\u548C\u6210\u5C31" }), _jsx(Text, { children: "\u2022 \u7528\u6237\u8BBE\u7F6E\u548C\u504F\u597D" })] }), _jsxs(Alert, { status: "info", children: [_jsx(AlertIcon, {}), _jsx(AlertDescription, { children: "\u5EFA\u8BAE\u5728\u6E05\u9664\u524D\u5148\u521B\u5EFA\u5907\u4EFD\uFF0C\u4EE5\u4FBF\u65E5\u540E\u6062\u590D\u6570\u636E\u3002" })] })] }) }), _jsxs(ModalFooter, { children: [_jsx(Button, { variant: "ghost", mr: 3, onClick: onConfirmClose, children: "\u53D6\u6D88" }), _jsx(Button, { colorScheme: "red", onClick: handleClearAllData, isLoading: isProcessing, loadingText: "\u6E05\u9664\u4E2D...", children: "\u786E\u8BA4\u6E05\u9664" })] })] })] })] }));
};
export const StorageStatusIndicator = () => {
    const { storageUsage, lastSaveTime, hasUnsavedChanges, isSaving } = useDataPersistence();
    const getStatusColor = () => {
        if (isSaving)
            return 'blue';
        if (hasUnsavedChanges)
            return 'orange';
        if (storageUsage.percentage > 90)
            return 'red';
        if (storageUsage.percentage > 80)
            return 'yellow';
        return 'green';
    };
    const getStatusText = () => {
        if (isSaving)
            return '保存中...';
        if (hasUnsavedChanges)
            return '有未保存更改';
        return '已保存';
    };
    return (_jsx(Tooltip, { label: _jsxs(VStack, { spacing: 1, align: "start", children: [_jsxs(Text, { children: ["\u5B58\u50A8\u4F7F\u7528: ", storageUsage.percentage.toFixed(1), "%"] }), _jsxs(Text, { children: ["\u6700\u540E\u4FDD\u5B58: ", formatDate(lastSaveTime)] }), _jsxs(Text, { children: ["\u72B6\u6001: ", getStatusText()] })] }), placement: "top", children: _jsxs(HStack, { spacing: 2, cursor: "pointer", children: [_jsx(Icon, { as: FiDatabase, color: `${getStatusColor()}.500` }), _jsx(Badge, { colorScheme: getStatusColor(), variant: "subtle", fontSize: "xs", children: getStatusText() })] }) }));
};
const formatDate = (date) => {
    if (!date)
        return '从未';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('zh-CN');
};

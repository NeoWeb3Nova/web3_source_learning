import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Card, CardHeader, CardBody, Heading, SimpleGrid, Alert, AlertIcon, AlertTitle, AlertDescription, useToast, } from '@chakra-ui/react';
import { FiAlertTriangle, FiWifi, FiCheck, FiX } from 'react-icons/fi';
import { SimpleErrorBoundary, NetworkStatusIndicator, OfflineAlert, NetworkRetry, useNetworkStatus, useFormValidation, FormField, ErrorSummary, SuccessMessage, ValidationRules, useErrorHandler, ErrorList, createError, } from '@/components/common';
const BuggyComponent = ({ shouldThrow }) => {
    if (shouldThrow) {
        throw new Error('这是一个故意抛出的测试错误！');
    }
    return _jsx(Text, { color: "green.500", children: "\u7EC4\u4EF6\u6B63\u5E38\u8FD0\u884C\u4E2D..." });
};
const NetworkRequestDemo = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { isOnline } = useNetworkStatus();
    const toast = useToast();
    const simulateNetworkRequest = async (shouldFail = false) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (shouldFail) {
                throw new Error('网络请求失败：服务器返回500错误');
            }
            setSuccess(true);
            toast({
                title: '请求成功',
                description: '数据已成功获取',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : '未知错误';
            setError(errorMessage);
            toast({
                title: '请求失败',
                description: errorMessage,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRetry = () => {
        simulateNetworkRequest(false);
    };
    if (error) {
        return (_jsx(NetworkRetry, { onRetry: handleRetry, isRetrying: isLoading, error: error }));
    }
    return (_jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(HStack, { spacing: 2, children: [_jsx(Text, { children: "\u7F51\u7EDC\u72B6\u6001:" }), _jsx(NetworkStatusIndicator, { compact: true })] }), _jsxs(HStack, { spacing: 4, children: [_jsx(Button, { onClick: () => simulateNetworkRequest(false), isLoading: isLoading, loadingText: "\u8BF7\u6C42\u4E2D...", colorScheme: "green", isDisabled: !isOnline, children: "\u6210\u529F\u8BF7\u6C42" }), _jsx(Button, { onClick: () => simulateNetworkRequest(true), isLoading: isLoading, loadingText: "\u8BF7\u6C42\u4E2D...", colorScheme: "red", isDisabled: !isOnline, children: "\u5931\u8D25\u8BF7\u6C42" })] }), success && (_jsxs(Alert, { status: "success", borderRadius: "md", children: [_jsx(AlertIcon, {}), _jsx(AlertTitle, { children: "\u8BF7\u6C42\u6210\u529F\uFF01" }), _jsx(AlertDescription, { children: "\u6570\u636E\u5DF2\u6210\u529F\u83B7\u53D6\u5E76\u5904\u7406\u3002" })] }))] }));
};
const FormValidationDemo = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    const { values, errors, touched, isSubmitting, isValid, handleChange, handleBlur, handleSubmit, reset, } = useFormValidation({ name: '', email: '', message: '' }, {
        name: [
            ValidationRules.required('姓名为必填项'),
            ValidationRules.minLength(2, '姓名至少需要2个字符'),
        ],
        email: [
            ValidationRules.required('邮箱为必填项'),
            ValidationRules.email('请输入有效的邮箱地址'),
        ],
        message: [
            ValidationRules.required('消息为必填项'),
            ValidationRules.minLength(10, '消息至少需要10个字符'),
            ValidationRules.maxLength(500, '消息不能超过500个字符'),
        ],
    });
    const formErrors = Object.entries(errors).map(([field, message]) => ({
        field,
        message,
        type: 'validation',
    }));
    const onSubmit = async (formValues) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Form submitted:', formValues);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };
    return (_jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(ErrorSummary, { errors: formErrors, isVisible: formErrors.length > 0 && Object.keys(touched).length > 0 }), _jsx(SuccessMessage, { message: "\u8868\u5355\u63D0\u4EA4\u6210\u529F\uFF01\u611F\u8C22\u60A8\u7684\u53CD\u9988\u3002", isVisible: showSuccess, onDismiss: () => setShowSuccess(false) }), _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(FormField, { config: {
                            name: 'name',
                            label: '姓名',
                            type: 'text',
                            placeholder: '请输入您的姓名',
                            required: true,
                        }, value: values.name, error: errors.name, touched: touched.name, onChange: (value) => handleChange('name', value), onBlur: () => handleBlur('name') }), _jsx(FormField, { config: {
                            name: 'email',
                            label: '邮箱',
                            type: 'email',
                            placeholder: '请输入您的邮箱地址',
                            required: true,
                        }, value: values.email, error: errors.email, touched: touched.email, onChange: (value) => handleChange('email', value), onBlur: () => handleBlur('email') }), _jsx(FormField, { config: {
                            name: 'message',
                            label: '消息',
                            type: 'textarea',
                            placeholder: '请输入您的消息内容（至少10个字符）',
                            required: true,
                            helperText: '请详细描述您的问题或建议',
                        }, value: values.message, error: errors.message, touched: touched.message, onChange: (value) => handleChange('message', value), onBlur: () => handleBlur('message') })] }), _jsxs(HStack, { spacing: 4, children: [_jsx(Button, { colorScheme: "blue", onClick: () => handleSubmit(onSubmit), isLoading: isSubmitting, loadingText: "\u63D0\u4EA4\u4E2D...", isDisabled: !isValid, children: "\u63D0\u4EA4\u8868\u5355" }), _jsx(Button, { variant: "outline", onClick: reset, children: "\u91CD\u7F6E\u8868\u5355" })] })] }));
};
const AdvancedErrorHandlingDemo = () => {
    const { errors, addError, removeError, clearErrors, retryOperation, reportError } = useErrorHandler({
        showDetails: true,
        allowRetry: true,
        allowReport: true,
        maxRetries: 3,
    });
    const addNetworkError = () => {
        addError(createError.network('无法连接到服务器，请检查网络连接', '连接超时：请求在30秒后超时'));
    };
    const addValidationError = () => {
        addError(createError.validation('表单验证失败：邮箱格式不正确', 'email'));
    };
    const addServerError = () => {
        addError(createError.server('服务器内部错误，请稍后重试', 500));
    };
    const addPermissionError = () => {
        addError(createError.permission('您没有权限执行此操作，请联系管理员'));
    };
    const simulateRetryOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('重试操作执行成功');
    };
    return (_jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", children: "\u9519\u8BEF\u7BA1\u7406\u6F14\u793A" }), _jsxs(SimpleGrid, { columns: { base: 2, md: 4 }, spacing: 2, children: [_jsx(Button, { size: "sm", colorScheme: "red", onClick: addNetworkError, children: "\u7F51\u7EDC\u9519\u8BEF" }), _jsx(Button, { size: "sm", colorScheme: "orange", onClick: addValidationError, children: "\u9A8C\u8BC1\u9519\u8BEF" }), _jsx(Button, { size: "sm", colorScheme: "purple", onClick: addServerError, children: "\u670D\u52A1\u5668\u9519\u8BEF" }), _jsx(Button, { size: "sm", colorScheme: "pink", onClick: addPermissionError, children: "\u6743\u9650\u9519\u8BEF" })] }), _jsxs(HStack, { spacing: 2, children: [_jsx(Button, { size: "sm", variant: "outline", onClick: clearErrors, children: "\u6E05\u9664\u6240\u6709\u9519\u8BEF" }), _jsxs(Text, { fontSize: "sm", color: "gray.600", children: ["\u5F53\u524D\u9519\u8BEF\u6570\u91CF: ", errors.length] })] }), _jsx(ErrorList, { errors: errors, onRetry: (errorId) => {
                    const error = errors.find(e => e.id === errorId);
                    if (error?.retryable) {
                        retryOperation(errorId, simulateRetryOperation);
                    }
                }, onReport: reportError, onDismiss: removeError, showDetails: true })] }));
};
export const ErrorHandlingDemo = () => {
    const [showBuggyComponent, setShowBuggyComponent] = useState(false);
    const [throwError, setThrowError] = useState(false);
    return (_jsx(Box, { minH: "100vh", bg: "gray.50", _dark: { bg: 'gray.900' }, p: 6, children: _jsxs(VStack, { spacing: 8, maxW: "1200px", mx: "auto", children: [_jsxs(VStack, { spacing: 2, children: [_jsx(Heading, { size: "xl", children: "\u9519\u8BEF\u5904\u7406\u548C\u7528\u6237\u4F53\u9A8C\u4F18\u5316\u6F14\u793A" }), _jsx(Text, { color: "gray.600", _dark: { color: 'gray.400' }, textAlign: "center", children: "\u5C55\u793A\u5168\u5C40\u9519\u8BEF\u8FB9\u754C\u3001\u7F51\u7EDC\u72B6\u6001\u68C0\u6D4B\u3001\u8868\u5355\u9A8C\u8BC1\u548C\u7528\u6237\u53CB\u597D\u7684\u9519\u8BEF\u5904\u7406\u673A\u5236" })] }), _jsx(OfflineAlert, {}), _jsxs(SimpleGrid, { columns: { base: 1, lg: 2 }, spacing: 8, w: "full", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(Heading, { size: "md", children: _jsxs(HStack, { spacing: 2, children: [_jsx(FiAlertTriangle, {}), _jsx(Text, { children: "\u9519\u8BEF\u8FB9\u754C\u6F14\u793A" })] }) }) }), _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", _dark: { color: 'gray.400' }, children: "\u6D4B\u8BD5\u5168\u5C40\u9519\u8BEF\u8FB9\u754C\u7684\u9519\u8BEF\u6355\u83B7\u548C\u6062\u590D\u529F\u80FD" }), _jsxs(HStack, { spacing: 4, children: [_jsx(Button, { colorScheme: showBuggyComponent ? 'red' : 'green', onClick: () => {
                                                            setShowBuggyComponent(!showBuggyComponent);
                                                            setThrowError(false);
                                                        }, children: showBuggyComponent ? '隐藏组件' : '显示组件' }), showBuggyComponent && (_jsx(Button, { colorScheme: "red", variant: "outline", onClick: () => setThrowError(true), children: "\u89E6\u53D1\u9519\u8BEF" }))] }), showBuggyComponent && (_jsx(SimpleErrorBoundary, { children: _jsx(Box, { p: 4, border: "1px", borderColor: "gray.200", borderRadius: "md", children: _jsx(BuggyComponent, { shouldThrow: throwError }) }) }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(Heading, { size: "md", children: _jsxs(HStack, { spacing: 2, children: [_jsx(FiWifi, {}), _jsx(Text, { children: "\u7F51\u7EDC\u72B6\u6001\u68C0\u6D4B" })] }) }) }), _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", _dark: { color: 'gray.400' }, children: "\u6F14\u793A\u7F51\u7EDC\u8FDE\u63A5\u72B6\u6001\u68C0\u6D4B\u548C\u79BB\u7EBF\u5904\u7406" }), _jsx(NetworkRequestDemo, {})] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(Heading, { size: "md", children: _jsxs(HStack, { spacing: 2, children: [_jsx(FiCheck, {}), _jsx(Text, { children: "\u8868\u5355\u9A8C\u8BC1" })] }) }) }), _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", _dark: { color: 'gray.400' }, children: "\u5C55\u793A\u5B9E\u65F6\u8868\u5355\u9A8C\u8BC1\u548C\u9519\u8BEF\u5904\u7406" }), _jsx(FormValidationDemo, {})] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(Heading, { size: "md", children: _jsxs(HStack, { spacing: 2, children: [_jsx(FiX, {}), _jsx(Text, { children: "\u9AD8\u7EA7\u9519\u8BEF\u5904\u7406" })] }) }) }), _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", _dark: { color: 'gray.400' }, children: "\u6F14\u793A\u9519\u8BEF\u5206\u7C7B\u3001\u91CD\u8BD5\u673A\u5236\u548C\u9519\u8BEF\u62A5\u544A" }), _jsx(AdvancedErrorHandlingDemo, {})] }) })] })] }), _jsxs(Card, { w: "full", children: [_jsx(CardHeader, { children: _jsx(Heading, { size: "md", children: "\u7F51\u7EDC\u72B6\u6001\u8BE6\u60C5" }) }), _jsx(CardBody, { children: _jsx(NetworkStatusIndicator, { showDetails: true }) })] })] }) }));
};

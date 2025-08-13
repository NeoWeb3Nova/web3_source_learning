import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { Box, VStack, Heading, Text, Button, Alert, AlertIcon, AlertTitle, AlertDescription, useColorModeValue, Icon, HStack, } from '@chakra-ui/react';
import { RepeatIcon, WarningIcon } from '@chakra-ui/icons';
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "handleRetry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                });
            }
        });
        Object.defineProperty(this, "handleGoHome", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                window.location.href = '/';
            }
        });
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
        });
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return _jsx(ErrorFallback, { error: this.state.error, onRetry: this.handleRetry, onGoHome: this.handleGoHome });
        }
        return this.props.children;
    }
}
const ErrorFallback = ({ error, onRetry, onGoHome }) => {
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    return (_jsx(Box, { minH: "100vh", bg: bgColor, display: "flex", alignItems: "center", justifyContent: "center", p: 4, children: _jsx(Box, { maxW: "md", w: "full", bg: cardBg, borderRadius: "xl", boxShadow: "lg", p: 8, textAlign: "center", children: _jsxs(VStack, { spacing: 6, children: [_jsx(Icon, { as: WarningIcon, boxSize: 16, color: "red.500" }), _jsxs(VStack, { spacing: 2, children: [_jsx(Heading, { size: "lg", color: "red.500", children: "\u51FA\u73B0\u4E86\u4E00\u4E9B\u95EE\u9898" }), _jsx(Text, { color: "gray.600", fontSize: "sm", children: "\u5E94\u7528\u9047\u5230\u4E86\u610F\u5916\u9519\u8BEF\uFF0C\u8BF7\u5C1D\u8BD5\u5237\u65B0\u9875\u9762\u6216\u8FD4\u56DE\u9996\u9875" })] }), _jsxs(Alert, { status: "error", borderRadius: "md", children: [_jsx(AlertIcon, {}), _jsxs(Box, { children: [_jsx(AlertTitle, { children: "\u9519\u8BEF\u8BE6\u60C5" }), _jsx(AlertDescription, { fontSize: "sm", children: error?.message || '未知错误' })] })] }), _jsxs(HStack, { spacing: 4, w: "full", children: [_jsx(Button, { leftIcon: _jsx(RepeatIcon, {}), colorScheme: "blue", onClick: onRetry, flex: 1, children: "\u91CD\u8BD5" }), _jsx(Button, { leftIcon: _jsx(Icon, { as: () => _jsx("span", { children: "\uD83C\uDFE0" }) }), variant: "outline", onClick: onGoHome, flex: 1, children: "\u8FD4\u56DE\u9996\u9875" })] }), import.meta.env.DEV && error && (_jsxs(Box, { w: "full", p: 4, bg: "gray.100", borderRadius: "md", fontSize: "xs", fontFamily: "mono", textAlign: "left", maxH: "200px", overflowY: "auto", children: [_jsx(Text, { fontWeight: "bold", mb: 2, children: "\u5F00\u53D1\u6A21\u5F0F - \u9519\u8BEF\u5806\u6808:" }), _jsx(Text, { whiteSpace: "pre-wrap", children: error.stack })] }))] }) }) }));
};
// Simple error boundary with minimal UI
export const SimpleErrorBoundary = ({ children, onError }) => {
    return (_jsx(ErrorBoundary, { onError: onError, fallback: _jsxs(Box, { p: 4, textAlign: "center", children: [_jsx(Text, { color: "red.500", children: "Something went wrong" }), _jsx(Button, { size: "sm", onClick: () => window.location.reload(), children: "Reload" })] }), children: children }));
};

// Hook for error handling
export const useErrorHandler = () => {
    const handleError = (error, errorInfo) => {
        console.error('Error handled:', error, errorInfo);
        // In production, send to error reporting service
    };
    return { handleError };
};

export default ErrorBoundary;

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Skeleton, SkeletonText, SkeletonCircle, useColorModeValue, Text, } from '@chakra-ui/react';
const WordCardSkeleton = () => (_jsx(Box, { bg: "white", borderRadius: "2xl", border: "2px solid", borderColor: "gray.200", p: 6, h: "300px", w: "full", maxW: "400px", mx: "auto", children: _jsxs(VStack, { spacing: 4, h: "full", justify: "center", children: [_jsxs(HStack, { justify: "space-between", w: "full", children: [_jsxs(HStack, { spacing: 2, children: [_jsx(Skeleton, { height: "20px", width: "60px", borderRadius: "full" }), _jsx(Skeleton, { height: "20px", width: "80px", borderRadius: "full" })] }), _jsx(SkeletonCircle, { size: "8" })] }), _jsxs(VStack, { spacing: 2, children: [_jsx(Skeleton, { height: "40px", width: "200px" }), _jsx(Skeleton, { height: "20px", width: "150px" })] }), _jsxs(HStack, { spacing: 4, children: [_jsx(SkeletonCircle, { size: "10" }), _jsx(SkeletonCircle, { size: "10" }), _jsx(SkeletonCircle, { size: "10" })] })] }) }));
const ListItemSkeleton = () => (_jsx(Box, { bg: "white", borderRadius: "lg", p: 4, border: "1px solid", borderColor: "gray.200", children: _jsxs(HStack, { spacing: 4, align: "start", children: [_jsx(SkeletonCircle, { size: "12" }), _jsxs(VStack, { spacing: 2, align: "start", flex: "1", children: [_jsx(Skeleton, { height: "20px", width: "120px" }), _jsx(SkeletonText, { noOfLines: 2, spacing: "2" }), _jsxs(HStack, { spacing: 2, children: [_jsx(Skeleton, { height: "16px", width: "50px", borderRadius: "full" }), _jsx(Skeleton, { height: "16px", width: "60px", borderRadius: "full" })] })] })] }) }));
const FormSkeleton = () => (_jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Skeleton, { height: "16px", width: "80px", mb: 2 }), _jsx(Skeleton, { height: "40px", width: "full" })] }), _jsxs(Box, { children: [_jsx(Skeleton, { height: "16px", width: "100px", mb: 2 }), _jsx(Skeleton, { height: "80px", width: "full" })] }), _jsxs(HStack, { spacing: 4, children: [_jsxs(Box, { flex: "1", children: [_jsx(Skeleton, { height: "16px", width: "60px", mb: 2 }), _jsx(Skeleton, { height: "40px", width: "full" })] }), _jsxs(Box, { flex: "1", children: [_jsx(Skeleton, { height: "16px", width: "40px", mb: 2 }), _jsx(Skeleton, { height: "40px", width: "full" })] })] })] }), _jsxs(HStack, { justify: "end", spacing: 3, children: [_jsx(Skeleton, { height: "40px", width: "80px" }), _jsx(Skeleton, { height: "40px", width: "100px" })] })] }));
const SimpleTableSkeleton = () => (_jsx(VStack, { spacing: 2, align: "stretch", children: Array.from({ length: 5 }).map((_, index) => (_jsxs(HStack, { spacing: 4, children: [_jsx(Skeleton, { height: "20px", width: "100px" }), _jsx(Skeleton, { height: "20px", width: "150px" }), _jsx(Skeleton, { height: "20px", width: "80px" }), _jsx(Skeleton, { height: "20px", width: "60px" })] }, index))) }));
export const LoadingSkeleton = ({ type = 'card', repeat = 1, isLoaded = false, children, className, style, testId, }) => {
    if (isLoaded && children) {
        return _jsx(_Fragment, { children: children });
    }
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return _jsx(WordCardSkeleton, {});
            case 'list':
                return _jsx(ListItemSkeleton, {});
            case 'form':
                return _jsx(FormSkeleton, {});
            case 'table':
                return _jsx(SimpleTableSkeleton, {});
            default:
                return _jsx(Skeleton, { height: "100px", width: "full" });
        }
    };
    return (_jsx(Box, { className: className, style: style, "data-testid": testId, children: _jsx(VStack, { spacing: 4, children: Array.from({ length: repeat }).map((_, index) => (_jsx(Box, { w: "full", children: renderSkeleton() }, index))) }) }));
};
export const EnhancedSkeleton = ({ variant = 'text', width, height, lines = 1, isLoaded = false, children, sx, borderRadius, enablePulse = true, speed = 'normal', }) => {
    const getVariantStyles = () => {
        const speedMap = {
            slow: '2s',
            normal: '1.5s',
            fast: '1s',
        };
        const baseStyles = {
            borderRadius: borderRadius || '4px',
            animation: enablePulse ? `pulse ${speedMap[speed]} ease-in-out infinite` : 'none',
        };
        switch (variant) {
            case 'circular':
                return {
                    ...baseStyles,
                    borderRadius: '50%',
                    width: width || '40px',
                    height: height || '40px',
                };
            case 'rectangular':
                return {
                    ...baseStyles,
                    width: width || '100%',
                    height: height || '20px',
                };
            case 'card':
                return {
                    ...baseStyles,
                    width: width || '100%',
                    height: height || '200px',
                    borderRadius: borderRadius || '12px',
                };
            case 'avatar':
                return {
                    ...baseStyles,
                    borderRadius: '50%',
                    width: width || '48px',
                    height: height || '48px',
                };
            case 'button':
                return {
                    ...baseStyles,
                    width: width || '120px',
                    height: height || '40px',
                    borderRadius: borderRadius || '8px',
                };
            case 'list':
                return {
                    ...baseStyles,
                    width: width || '100%',
                    height: height || '60px',
                    borderRadius: borderRadius || '8px',
                };
            case 'text':
            default:
                return {
                    ...baseStyles,
                    width: width || '100%',
                    height: height || '16px',
                };
        }
    };
    if (isLoaded && children) {
        return _jsx(_Fragment, { children: children });
    }
    if (variant === 'text' && lines > 1) {
        return (_jsx(VStack, { spacing: 2, align: "stretch", children: Array.from({ length: lines }).map((_, index) => (_jsx(Skeleton, { ...getVariantStyles(), width: index === lines - 1 ? '80%' : '100%', sx: sx }, index))) }));
    }
    return (_jsx(Skeleton, { ...getVariantStyles(), sx: sx }));
};
export const CardSkeleton = ({ isLoaded = false, children, }) => {
    if (isLoaded && children) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(Box, { p: 6, borderWidth: "1px", borderRadius: "lg", bg: useColorModeValue('white', 'gray.800'), children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(HStack, { spacing: 4, children: [_jsx(EnhancedSkeleton, { variant: "avatar" }), _jsxs(VStack, { align: "stretch", flex: "1", spacing: 2, children: [_jsx(EnhancedSkeleton, { variant: "text", width: "60%" }), _jsx(EnhancedSkeleton, { variant: "text", width: "40%" })] })] }), _jsx(EnhancedSkeleton, { variant: "rectangular", height: "120px" }), _jsxs(HStack, { spacing: 2, children: [_jsx(EnhancedSkeleton, { variant: "button", width: "80px" }), _jsx(EnhancedSkeleton, { variant: "button", width: "100px" })] })] }) }));
};
export const ListSkeleton = ({ items = 5, isLoaded = false, children, }) => {
    if (isLoaded && children) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(VStack, { spacing: 3, align: "stretch", children: Array.from({ length: items }).map((_, index) => (_jsxs(HStack, { spacing: 4, p: 4, borderWidth: "1px", borderRadius: "md", children: [_jsx(EnhancedSkeleton, { variant: "avatar", width: "48px", height: "48px" }), _jsxs(VStack, { align: "stretch", flex: "1", spacing: 2, children: [_jsx(EnhancedSkeleton, { variant: "text", width: "70%" }), _jsx(EnhancedSkeleton, { variant: "text", width: "50%" })] }), _jsx(EnhancedSkeleton, { variant: "button", width: "60px", height: "32px" })] }, index))) }));
};
export const TableSkeleton = ({ rows = 5, columns = 4, isLoaded = false, children, }) => {
    if (isLoaded && children) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsxs(VStack, { spacing: 0, align: "stretch", children: [_jsx(HStack, { spacing: 4, p: 4, bg: useColorModeValue('gray.50', 'gray.700'), children: Array.from({ length: columns }).map((_, index) => (_jsx(EnhancedSkeleton, { variant: "text", width: "100px", height: "20px" }, index))) }), Array.from({ length: rows }).map((_, rowIndex) => (_jsx(HStack, { spacing: 4, p: 4, borderBottomWidth: "1px", children: Array.from({ length: columns }).map((_, colIndex) => (_jsx(EnhancedSkeleton, { variant: "text", width: colIndex === 0 ? "120px" : "80px", height: "16px" }, colIndex))) }, rowIndex)))] }));
};
export const VisualFeedback = ({ type, message, showIcon = true, duration = 3000, autoHide = true, onClose, sx, }) => {
    const [isVisible, setIsVisible] = useState(true);
    useEffect(() => {
        if (autoHide && duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [autoHide, duration, onClose]);
    if (!isVisible)
        return null;
    const getTypeConfig = () => {
        const configs = {
            success: {
                colorScheme: 'green',
                icon: '✓',
                bg: useColorModeValue('green.50', 'green.900'),
                color: useColorModeValue('green.800', 'green.200'),
                borderColor: useColorModeValue('green.200', 'green.700'),
            },
            error: {
                colorScheme: 'red',
                icon: '✗',
                bg: useColorModeValue('red.50', 'red.900'),
                color: useColorModeValue('red.800', 'red.200'),
                borderColor: useColorModeValue('red.200', 'red.700'),
            },
            warning: {
                colorScheme: 'orange',
                icon: '⚠',
                bg: useColorModeValue('orange.50', 'orange.900'),
                color: useColorModeValue('orange.800', 'orange.200'),
                borderColor: useColorModeValue('orange.200', 'orange.700'),
            },
            info: {
                colorScheme: 'blue',
                icon: 'ℹ',
                bg: useColorModeValue('blue.50', 'blue.900'),
                color: useColorModeValue('blue.800', 'blue.200'),
                borderColor: useColorModeValue('blue.200', 'blue.700'),
            },
            loading: {
                colorScheme: 'gray',
                icon: '⟳',
                bg: useColorModeValue('gray.50', 'gray.800'),
                color: useColorModeValue('gray.800', 'gray.200'),
                borderColor: useColorModeValue('gray.200', 'gray.600'),
            },
        };
        return configs[type];
    };
    const config = getTypeConfig();
    return (_jsxs(Box, { bg: config.bg, color: config.color, borderWidth: "1px", borderColor: config.borderColor, borderRadius: "md", p: 4, display: "flex", alignItems: "center", gap: 3, sx: {
            animation: type === 'loading' ? 'pulse 2s infinite' : 'slideUp 0.3s ease-out',
            ...sx,
        }, children: [showIcon && (_jsx(Box, { fontSize: "lg", sx: {
                    animation: type === 'loading' ? 'spin 1s linear infinite' : 'none',
                }, children: config.icon })), message && (_jsx(Text, { fontSize: "sm", fontWeight: "medium", flex: "1", children: message }))] }));
};
export default LoadingSkeleton;

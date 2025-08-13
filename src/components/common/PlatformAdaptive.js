import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, useColorModeValue, useColorMode, HStack, Text, Switch, Tooltip, } from '@chakra-ui/react';
import { useResponsive } from '@/hooks/useResponsive';
export var PlatformType;
(function (PlatformType) {
    PlatformType["IOS"] = "ios";
    PlatformType["ANDROID"] = "android";
    PlatformType["WEB"] = "web";
})(PlatformType || (PlatformType = {}));
export const usePlatformDetection = () => {
    const [platform, setPlatform] = useState(PlatformType.WEB);
    const [isStandalone, setIsStandalone] = useState(false);
    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://');
        if (isIOS) {
            setPlatform(PlatformType.IOS);
        }
        else if (isAndroid) {
            setPlatform(PlatformType.ANDROID);
        }
        else {
            setPlatform(PlatformType.WEB);
        }
        setIsStandalone(standalone);
    }, []);
    return {
        platform,
        isIOS: platform === PlatformType.IOS,
        isAndroid: platform === PlatformType.ANDROID,
        isWeb: platform === PlatformType.WEB,
        isStandalone,
    };
};
const iosDesignTokens = {
    borderRadius: {
        small: '8px',
        medium: '12px',
        large: '16px',
    },
    shadows: {
        small: '0 1px 3px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
        large: '0 8px 24px rgba(0, 0, 0, 0.2)',
    },
    colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        success: '#34C759',
        warning: '#FF9500',
        danger: '#FF3B30',
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    spacing: {
        tight: '8px',
        normal: '16px',
        loose: '24px',
    },
};
const androidDesignTokens = {
    borderRadius: {
        small: '4px',
        medium: '8px',
        large: '12px',
    },
    shadows: {
        small: '0 2px 4px rgba(0, 0, 0, 0.2)',
        medium: '0 4px 8px rgba(0, 0, 0, 0.25)',
        large: '0 8px 16px rgba(0, 0, 0, 0.3)',
    },
    colors: {
        primary: '#1976D2',
        secondary: '#9C27B0',
        success: '#4CAF50',
        warning: '#FF9800',
        danger: '#F44336',
    },
    typography: {
        fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    spacing: {
        tight: '8px',
        normal: '16px',
        loose: '24px',
    },
};
const webDesignTokens = {
    borderRadius: {
        small: '6px',
        medium: '10px',
        large: '14px',
    },
    shadows: {
        small: '0 1px 3px rgba(0, 0, 0, 0.12)',
        medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
        large: '0 8px 24px rgba(0, 0, 0, 0.18)',
    },
    colors: {
        primary: '#3182CE',
        secondary: '#805AD5',
        success: '#38A169',
        warning: '#D69E2E',
        danger: '#E53E3E',
    },
    typography: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    spacing: {
        tight: '8px',
        normal: '16px',
        loose: '24px',
    },
};
export const getPlatformDesignTokens = (platform) => {
    switch (platform) {
        case PlatformType.IOS:
            return iosDesignTokens;
        case PlatformType.ANDROID:
            return androidDesignTokens;
        default:
            return webDesignTokens;
    }
};
export const PlatformAdaptiveBox = ({ children, enablePlatformAdaptation = true, platformStyles = {}, ...boxProps }) => {
    const { platform } = usePlatformDetection();
    const designTokens = getPlatformDesignTokens(platform);
    const getPlatformSpecificStyles = () => {
        if (!enablePlatformAdaptation)
            return {};
        const baseStyles = {
            fontFamily: designTokens.typography.fontFamily,
        };
        switch (platform) {
            case PlatformType.IOS:
                return {
                    ...baseStyles,
                    ...platformStyles.ios,
                };
            case PlatformType.ANDROID:
                return {
                    ...baseStyles,
                    ...platformStyles.android,
                };
            default:
                return {
                    ...baseStyles,
                    ...platformStyles.web,
                };
        }
    };
    const platformSpecificStyles = getPlatformSpecificStyles();
    return (_jsx(Box, { ...boxProps, ...platformSpecificStyles, children: children }));
};
export const PlatformAdaptiveButton = ({ children, enablePlatformAdaptation = true, platformStyles = {}, ...buttonProps }) => {
    const { platform } = usePlatformDetection();
    const { isTouchDevice } = useResponsive();
    const designTokens = getPlatformDesignTokens(platform);
    const getPlatformSpecificStyles = () => {
        if (!enablePlatformAdaptation)
            return {};
        const baseStyles = {
            fontFamily: designTokens.typography.fontFamily,
            minH: isTouchDevice ? '44px' : '36px',
        };
        switch (platform) {
            case PlatformType.IOS:
                return {
                    ...baseStyles,
                    borderRadius: designTokens.borderRadius.medium,
                    boxShadow: designTokens.shadows.small,
                    _hover: {
                        transform: 'scale(1.02)',
                        boxShadow: designTokens.shadows.medium,
                    },
                    _active: {
                        transform: 'scale(0.98)',
                    },
                    ...platformStyles.ios,
                };
            case PlatformType.ANDROID:
                return {
                    ...baseStyles,
                    borderRadius: designTokens.borderRadius.small,
                    boxShadow: designTokens.shadows.medium,
                    textTransform: 'uppercase',
                    fontWeight: 'medium',
                    _hover: {
                        boxShadow: designTokens.shadows.large,
                    },
                    _active: {
                        boxShadow: designTokens.shadows.small,
                    },
                    ...platformStyles.android,
                };
            default:
                return {
                    ...baseStyles,
                    borderRadius: designTokens.borderRadius.medium,
                    _hover: {
                        transform: 'translateY(-1px)',
                        boxShadow: designTokens.shadows.medium,
                    },
                    _active: {
                        transform: 'translateY(0)',
                    },
                    ...platformStyles.web,
                };
        }
    };
    const platformSpecificStyles = getPlatformSpecificStyles();
    return (_jsx(Button, { ...buttonProps, ...platformSpecificStyles, children: children }));
};
export const PlatformAdaptiveIconButton = ({ enablePlatformAdaptation = true, ...iconButtonProps }) => {
    const { platform } = usePlatformDetection();
    const { isTouchDevice } = useResponsive();
    const designTokens = getPlatformDesignTokens(platform);
    const getPlatformSpecificStyles = () => {
        if (!enablePlatformAdaptation)
            return {};
        const baseStyles = {
            minH: isTouchDevice ? '44px' : '36px',
            minW: isTouchDevice ? '44px' : '36px',
        };
        switch (platform) {
            case PlatformType.IOS:
                return {
                    ...baseStyles,
                    borderRadius: 'full',
                    _hover: {
                        transform: 'scale(1.1)',
                    },
                    _active: {
                        transform: 'scale(0.9)',
                    },
                };
            case PlatformType.ANDROID:
                return {
                    ...baseStyles,
                    borderRadius: 'full',
                    _hover: {
                        bg: 'rgba(0, 0, 0, 0.04)',
                    },
                    _active: {
                        bg: 'rgba(0, 0, 0, 0.08)',
                    },
                };
            default:
                return {
                    ...baseStyles,
                    borderRadius: designTokens.borderRadius.medium,
                    _hover: {
                        transform: 'scale(1.05)',
                    },
                };
        }
    };
    const platformSpecificStyles = getPlatformSpecificStyles();
    return (_jsx(IconButton, { ...iconButtonProps, ...platformSpecificStyles }));
};
export const SafeAreaBox = ({ children, ...boxProps }) => {
    const { isIOS, isStandalone } = usePlatformDetection();
    const safeAreaStyles = isIOS && isStandalone ? {
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
    } : {};
    return (_jsx(Box, { ...boxProps, ...safeAreaStyles, children: children }));
};
export const withPlatformAdaptation = (Component) => {
    const PlatformAdaptiveComponent = React.forwardRef((props, ref) => {
        const { platform } = usePlatformDetection();
        const designTokens = getPlatformDesignTokens(platform);
        return (_jsx(Box, { fontFamily: designTokens.typography.fontFamily, children: _jsx(Component, { ref: ref, ...props }) }));
    });
    PlatformAdaptiveComponent.displayName = `PlatformAdaptive(${Component.displayName || Component.name})`;
    return PlatformAdaptiveComponent;
};
export const ThemeToggle = ({ variant = 'button', size = 'md', showLabel = false, className, }) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const SunIcon = () => (_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" }) }));
    const MoonIcon = () => (_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z", clipRule: "evenodd" }) }));
    if (variant === 'button') {
        return (_jsx(Tooltip, { label: `切换到${isDark ? '浅色' : '深色'}主题`, children: _jsx(IconButton, { className: className, "aria-label": "\u5207\u6362\u4E3B\u9898", icon: isDark ? _jsx(SunIcon, {}) : _jsx(MoonIcon, {}), onClick: toggleColorMode, size: size, variant: "ghost", colorScheme: isDark ? 'yellow' : 'blue', _hover: {
                    bg: isDark ? 'yellow.100' : 'blue.100',
                    transform: 'scale(1.05)',
                }, transition: "all 0.2s" }) }));
    }
    if (variant === 'switch') {
        return (_jsxs(HStack, { className: className, spacing: 3, children: [showLabel && (_jsx(Text, { fontSize: "sm", color: useColorModeValue('gray.600', 'gray.400'), children: isDark ? '深色模式' : '浅色模式' })), _jsx(Switch, { isChecked: isDark, onChange: toggleColorMode, size: size, colorScheme: "primary" }), _jsx(Box, { color: isDark ? 'yellow.400' : 'blue.500', children: isDark ? _jsx(MoonIcon, {}) : _jsx(SunIcon, {}) })] }));
    }
    return null;
};
export default {
    Box: PlatformAdaptiveBox,
    Button: PlatformAdaptiveButton,
    IconButton: PlatformAdaptiveIconButton,
    SafeAreaBox,
    withPlatformAdaptation,
    usePlatformDetection,
    getPlatformDesignTokens,
};

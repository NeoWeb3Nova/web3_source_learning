import { useBreakpointValue, useMediaQuery, useColorMode } from '@chakra-ui/react';
import { useEffect, useState, useCallback } from 'react';
export var DeviceType;
(function (DeviceType) {
    DeviceType["MOBILE"] = "mobile";
    DeviceType["TABLET"] = "tablet";
    DeviceType["DESKTOP"] = "desktop";
})(DeviceType || (DeviceType = {}));
export var ScreenOrientation;
(function (ScreenOrientation) {
    ScreenOrientation["PORTRAIT"] = "portrait";
    ScreenOrientation["LANDSCAPE"] = "landscape";
})(ScreenOrientation || (ScreenOrientation = {}));
export const useResponsive = () => {
    const [screenWidth, setScreenWidth] = useState(0);
    const [screenHeight, setScreenHeight] = useState(0);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;
    const isTablet = useBreakpointValue({ base: false, md: true, lg: false }) ?? false;
    const isDesktop = useBreakpointValue({ base: false, lg: true }) ?? false;
    const [isSmallScreen] = useMediaQuery('(max-width: 480px)');
    const [isLargeScreen] = useMediaQuery('(min-width: 1280px)');
    const [isPortrait] = useMediaQuery('(orientation: portrait)');
    const currentBreakpoint = useBreakpointValue({
        base: 'base',
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'xl',
        '2xl': '2xl',
    }) ?? 'base';
    const deviceType = isMobile ? DeviceType.MOBILE :
        isTablet ? DeviceType.TABLET :
            DeviceType.DESKTOP;
    const orientation = isPortrait ? ScreenOrientation.PORTRAIT : ScreenOrientation.LANDSCAPE;
    const layoutConfig = useBreakpointValue({
        base: {
            direction: 'column',
            showSidebar: false,
            showBottomNav: true,
            sidebarWidth: 0,
            contentPadding: 4,
            maxWidth: '100%',
            gridColumns: 1,
            cardSpacing: 4,
        },
        md: {
            direction: 'row',
            showSidebar: true,
            showBottomNav: false,
            sidebarWidth: '280px',
            contentPadding: 6,
            maxWidth: '1200px',
            gridColumns: 2,
            cardSpacing: 6,
        },
        lg: {
            direction: 'row',
            showSidebar: true,
            showBottomNav: false,
            sidebarWidth: '320px',
            contentPadding: 8,
            maxWidth: '1400px',
            gridColumns: 3,
            cardSpacing: 8,
        },
    }) ?? {
        direction: 'column',
        showSidebar: false,
        showBottomNav: true,
        sidebarWidth: 0,
        contentPadding: 4,
        maxWidth: '100%',
        gridColumns: 1,
        cardSpacing: 4,
    };
    const touchConfig = {
        minSize: 44,
        recommendedSize: isMobile ? 48 : 44,
        spacing: isMobile ? 8 : 4,
    };
    useEffect(() => {
        const updateScreenSize = () => {
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        };
        const detectTouchDevice = () => {
            setIsTouchDevice('ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                navigator.msMaxTouchPoints > 0);
        };
        updateScreenSize();
        detectTouchDevice();
        window.addEventListener('resize', updateScreenSize);
        window.addEventListener('orientationchange', updateScreenSize);
        return () => {
            window.removeEventListener('resize', updateScreenSize);
            window.removeEventListener('orientationchange', updateScreenSize);
        };
    }, []);
    return {
        deviceType,
        orientation,
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenWidth,
        screenHeight,
        isSmallScreen,
        isLargeScreen,
        currentBreakpoint,
        layoutConfig,
        touchConfig,
    };
};
export const useThemeToggle = () => {
    const { colorMode, toggleColorMode, setColorMode } = useColorMode();
    const [isSystemMode, setIsSystemMode] = useState(false);
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
    const switchToTheme = useCallback((theme) => {
        if (theme === 'system') {
            setIsSystemMode(true);
            setColorMode(prefersDark ? 'dark' : 'light');
        }
        else {
            setIsSystemMode(false);
            setColorMode(theme);
        }
    }, [setColorMode, prefersDark]);
    const getThemeInfo = useCallback(() => {
        return {
            current: colorMode,
            isSystem: isSystemMode,
            isDark: colorMode === 'dark',
            isLight: colorMode === 'light',
            systemPreference: prefersDark ? 'dark' : 'light',
        };
    }, [colorMode, isSystemMode, prefersDark]);
    useEffect(() => {
        if (isSystemMode) {
            setColorMode(prefersDark ? 'dark' : 'light');
        }
    }, [prefersDark, isSystemMode, setColorMode]);
    return {
        colorMode,
        toggleColorMode,
        switchToTheme,
        getThemeInfo,
        isSystemMode,
        prefersDark,
    };
};
export default useResponsive;

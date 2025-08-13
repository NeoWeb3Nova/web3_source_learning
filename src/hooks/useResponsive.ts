import { useBreakpointValue, useMediaQuery, useColorMode } from '@chakra-ui/react';
import { useEffect, useState, useCallback } from 'react';

/**
 * 设备类型枚举
 */
export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

/**
 * 屏幕方向枚举
 */
export enum ScreenOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

/**
 * 响应式Hook
 * 提供设备检测、断点管理和布局配置
 */
export const useResponsive = () => {
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // 断点检测
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false }) ?? false;
  const isDesktop = useBreakpointValue({ base: false, lg: true }) ?? false;

  // 媒体查询
  const [isSmallScreen] = useMediaQuery('(max-width: 480px)');
  const [isLargeScreen] = useMediaQuery('(min-width: 1280px)');
  const [isPortrait] = useMediaQuery('(orientation: portrait)');

  // 当前断点
  const currentBreakpoint = useBreakpointValue({
    base: 'base',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',
  }) ?? 'base';

  // 设备类型
  const deviceType = isMobile ? DeviceType.MOBILE : 
                    isTablet ? DeviceType.TABLET : 
                    DeviceType.DESKTOP;

  // 屏幕方向
  const orientation = isPortrait ? ScreenOrientation.PORTRAIT : ScreenOrientation.LANDSCAPE;

  // 布局配置
  const layoutConfig = useBreakpointValue({
    base: {
      direction: 'column' as const,
      showSidebar: false,
      showBottomNav: true,
      sidebarWidth: 0,
      contentPadding: 4,
      maxWidth: '100%',
      gridColumns: 1,
      cardSpacing: 4,
    },
    md: {
      direction: 'row' as const,
      showSidebar: true,
      showBottomNav: false,
      sidebarWidth: '280px',
      contentPadding: 6,
      maxWidth: '1200px',
      gridColumns: 2,
      cardSpacing: 6,
    },
    lg: {
      direction: 'row' as const,
      showSidebar: true,
      showBottomNav: false,
      sidebarWidth: '320px',
      contentPadding: 8,
      maxWidth: '1400px',
      gridColumns: 3,
      cardSpacing: 8,
    },
  }) ?? {
    direction: 'column' as const,
    showSidebar: false,
    showBottomNav: true,
    sidebarWidth: 0,
    contentPadding: 4,
    maxWidth: '100%',
    gridColumns: 1,
    cardSpacing: 4,
  };

  // 触摸目标配置
  const touchConfig = {
    minSize: 44,
    recommendedSize: isMobile ? 48 : 44,
    spacing: isMobile ? 8 : 4,
  };

  // 监听屏幕尺寸变化
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    const detectTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
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
/**
 * 主题切换Hook
 * 提供深色/浅色主题切换功能
 */
export const useThemeToggle = () => {
  const { colorMode, toggleColorMode, setColorMode } = useColorMode();
  const [isSystemMode, setIsSystemMode] = useState(false);

  // 检测系统主题偏好
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  /**
   * 切换到指定主题
   */
  const switchToTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      setIsSystemMode(true);
      setColorMode(prefersDark ? 'dark' : 'light');
    } else {
      setIsSystemMode(false);
      setColorMode(theme);
    }
  }, [setColorMode, prefersDark]);

  /**
   * 获取当前主题信息
   */
  const getThemeInfo = useCallback(() => {
    return {
      current: colorMode,
      isSystem: isSystemMode,
      isDark: colorMode === 'dark',
      isLight: colorMode === 'light',
      systemPreference: prefersDark ? 'dark' : 'light',
    };
  }, [colorMode, isSystemMode, prefersDark]);

  // 监听系统主题变化
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
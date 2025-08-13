import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  useColorModeValue,
  useColorMode,
  HStack,
  Text,
  Switch,
  Tooltip,
  BoxProps,
  ButtonProps,
  IconButtonProps,
} from '@chakra-ui/react';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * 平台类型枚举
 */
export enum PlatformType {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

/**
 * 平台检测Hook
 */
export const usePlatformDetection = () => {
  const [platform, setPlatform] = useState<PlatformType>(PlatformType.WEB);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    // 检测是否为PWA模式
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone ||
                     document.referrer.includes('android-app://');

    if (isIOS) {
      setPlatform(PlatformType.IOS);
    } else if (isAndroid) {
      setPlatform(PlatformType.ANDROID);
    } else {
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

/**
 * iOS设计规范配置
 */
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

/**
 * Android设计规范配置
 */
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

/**
 * Web设计规范配置
 */
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

/**
 * 获取平台设计规范
 */
export const getPlatformDesignTokens = (platform: PlatformType) => {
  switch (platform) {
    case PlatformType.IOS:
      return iosDesignTokens;
    case PlatformType.ANDROID:
      return androidDesignTokens;
    default:
      return webDesignTokens;
  }
};

/**
 * 平台适配Box组件Props
 */
interface PlatformAdaptiveBoxProps extends BoxProps {
  /** 是否启用平台适配 */
  enablePlatformAdaptation?: boolean;
  /** 自定义平台样式 */
  platformStyles?: {
    ios?: BoxProps;
    android?: BoxProps;
    web?: BoxProps;
  };
}

/**
 * 平台适配Button组件Props
 */
interface PlatformAdaptiveButtonProps extends ButtonProps {
  /** 是否启用平台适配 */
  enablePlatformAdaptation?: boolean;
  /** 自定义平台样式 */
  platformStyles?: {
    ios?: ButtonProps;
    android?: ButtonProps;
    web?: ButtonProps;
  };
}

/**
 * 平台适配Box组件
 */
export const PlatformAdaptiveBox: React.FC<PlatformAdaptiveBoxProps> = ({
  children,
  enablePlatformAdaptation = true,
  platformStyles = {},
  ...boxProps
}) => {
  const { platform } = usePlatformDetection();
  const designTokens = getPlatformDesignTokens(platform);

  // 获取平台特定样式
  const getPlatformSpecificStyles = (): BoxProps => {
    if (!enablePlatformAdaptation) return {};

    const baseStyles: BoxProps = {
      fontFamily: designTokens.typography.fontFamily,
    };

    // 应用自定义平台样式
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

  return (
    <Box
      {...boxProps}
      {...platformSpecificStyles}
    >
      {children}
    </Box>
  );
};

/**
 * 平台适配Button组件
 */
export const PlatformAdaptiveButton: React.FC<PlatformAdaptiveButtonProps> = ({
  children,
  enablePlatformAdaptation = true,
  platformStyles = {},
  ...buttonProps
}) => {
  const { platform } = usePlatformDetection();
  const { isTouchDevice } = useResponsive();
  const designTokens = getPlatformDesignTokens(platform);

  // 获取平台特定样式
  const getPlatformSpecificStyles = (): ButtonProps => {
    if (!enablePlatformAdaptation) return {};

    const baseStyles: ButtonProps = {
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

  return (
    <Button
      {...buttonProps}
      {...platformSpecificStyles}
    >
      {children}
    </Button>
  );
};

/**
 * 平台适配IconButton组件
 */
export const PlatformAdaptiveIconButton: React.FC<IconButtonProps & {
  enablePlatformAdaptation?: boolean;
}> = ({
  enablePlatformAdaptation = true,
  ...iconButtonProps
}) => {
  const { platform } = usePlatformDetection();
  const { isTouchDevice } = useResponsive();
  const designTokens = getPlatformDesignTokens(platform);

  const getPlatformSpecificStyles = (): IconButtonProps => {
    if (!enablePlatformAdaptation) return {};

    const baseStyles: IconButtonProps = {
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

  return (
    <IconButton
      {...iconButtonProps}
      {...platformSpecificStyles}
    />
  );
};

/**
 * 安全区域组件（适配iOS刘海屏等）
 */
export const SafeAreaBox: React.FC<BoxProps> = ({
  children,
  ...boxProps
}) => {
  const { isIOS, isStandalone } = usePlatformDetection();

  const safeAreaStyles: BoxProps = isIOS && isStandalone ? {
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  } : {};

  return (
    <Box
      {...boxProps}
      {...safeAreaStyles}
    >
      {children}
    </Box>
  );
};

/**
 * 平台适配高阶组件
 */
export const withPlatformAdaptation = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const PlatformAdaptiveComponent = React.forwardRef<any, P>((props, ref) => {
    const { platform } = usePlatformDetection();
    const designTokens = getPlatformDesignTokens(platform);

    return (
      <Box fontFamily={designTokens.typography.fontFamily}>
        <Component ref={ref} {...props} />
      </Box>
    );
  });

  PlatformAdaptiveComponent.displayName = `PlatformAdaptive(${Component.displayName || Component.name})`;
  
  return PlatformAdaptiveComponent;
};

/**
 * 主题切换组件Props
 */
interface ThemeToggleProps {
  /** 显示模式 */
  variant?: 'button' | 'switch' | 'menu';
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 主题切换组件
 * 提供深色/浅色主题切换功能
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  showLabel = false,
  className,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // 图标组件
  const SunIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
    </svg>
  );

  const MoonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
    </svg>
  );

  /**
   * 按钮模式
   */
  if (variant === 'button') {
    return (
      <Tooltip label={`切换到${isDark ? '浅色' : '深色'}主题`}>
        <IconButton
          className={className}
          aria-label="切换主题"
          icon={isDark ? <SunIcon /> : <MoonIcon />}
          onClick={toggleColorMode}
          size={size}
          variant="ghost"
          colorScheme={isDark ? 'yellow' : 'blue'}
          _hover={{
            bg: isDark ? 'yellow.100' : 'blue.100',
            transform: 'scale(1.05)',
          }}
          transition="all 0.2s"
        />
      </Tooltip>
    );
  }

  /**
   * 开关模式
   */
  if (variant === 'switch') {
    return (
      <HStack className={className} spacing={3}>
        {showLabel && (
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {isDark ? '深色模式' : '浅色模式'}
          </Text>
        )}
        <Switch
          isChecked={isDark}
          onChange={toggleColorMode}
          size={size}
          colorScheme="primary"
        />
        <Box color={isDark ? 'yellow.400' : 'blue.500'}>
          {isDark ? <MoonIcon /> : <SunIcon />}
        </Box>
      </HStack>
    );
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
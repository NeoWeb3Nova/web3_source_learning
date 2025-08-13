import React, { forwardRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Link,
  BoxProps,
  ButtonProps,
  IconButtonProps,
  LinkProps,
} from '@chakra-ui/react';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * 触摸优化配置
 */
interface TouchOptimizedConfig {
  enabled?: boolean;
  minSize?: number;
  feedbackType?: 'scale' | 'opacity' | 'shadow' | 'none';
  hapticFeedback?: boolean;
}

/**
 * 触摸优化Box组件Props
 */
interface TouchOptimizedBoxProps extends BoxProps {
  touchConfig?: TouchOptimizedConfig;
  onTouchTap?: () => void;
  onLongPress?: () => void;
}

/**
 * 触摸优化Button组件Props
 */
interface TouchOptimizedButtonProps extends ButtonProps {
  touchConfig?: TouchOptimizedConfig;
}

/**
 * 触摸优化IconButton组件Props
 */
interface TouchOptimizedIconButtonProps extends IconButtonProps {
  touchConfig?: TouchOptimizedConfig;
}

/**
 * 触摸优化Link组件Props
 */
interface TouchOptimizedLinkProps extends LinkProps {
  touchConfig?: TouchOptimizedConfig;
}

/**
 * 获取触摸优化样式
 */
const getTouchOptimizedStyles = (
  config: TouchOptimizedConfig,
  touchConfig: { minSize: number; recommendedSize: number },
  isTouchDevice: boolean
) => {
  if (!config.enabled || !isTouchDevice) return {};

  const minSize = config.minSize || touchConfig.minSize;
  const feedbackType = config.feedbackType || 'scale';

  const baseStyles = {
    minH: `${minSize}px`,
    minW: `${minSize}px`,
    cursor: 'pointer',
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
  };

  const feedbackStyles = {
    scale: {
      transition: 'transform 0.1s ease-in-out',
      _active: { transform: 'scale(0.95)' },
    },
    opacity: {
      transition: 'opacity 0.1s ease-in-out',
      _active: { opacity: 0.7 },
    },
    shadow: {
      transition: 'box-shadow 0.1s ease-in-out',
      _active: { boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)' },
    },
    none: {},
  };

  return {
    ...baseStyles,
    ...feedbackStyles[feedbackType],
  };
};

/**
 * 触摸优化Box组件
 */
export const TouchOptimizedBox = forwardRef<HTMLDivElement, TouchOptimizedBoxProps>(
  ({ children, touchConfig = { enabled: true }, onTouchTap, onLongPress, ...boxProps }, ref) => {
    const { touchConfig: responsiveTouchConfig, isTouchDevice } = useResponsive();

    const touchStyles = getTouchOptimizedStyles(
      touchConfig,
      responsiveTouchConfig,
      isTouchDevice
    );

    return (
      <Box
        ref={ref}
        {...boxProps}
        {...touchStyles}
        onClick={onTouchTap}
      >
        {children}
      </Box>
    );
  }
);

TouchOptimizedBox.displayName = 'TouchOptimizedBox';

/**
 * 触摸优化Button组件
 */
export const TouchOptimizedButton = forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(
  ({ children, touchConfig = { enabled: true }, ...buttonProps }, ref) => {
    const { touchConfig: responsiveTouchConfig, isTouchDevice } = useResponsive();

    const touchStyles = getTouchOptimizedStyles(
      touchConfig,
      responsiveTouchConfig,
      isTouchDevice
    );

    return (
      <Button
        ref={ref}
        {...buttonProps}
        {...touchStyles}
        size={isTouchDevice ? 'lg' : buttonProps.size}
        px={isTouchDevice ? 6 : buttonProps.px}
        py={isTouchDevice ? 3 : buttonProps.py}
      >
        {children}
      </Button>
    );
  }
);

TouchOptimizedButton.displayName = 'TouchOptimizedButton';

/**
 * 触摸优化IconButton组件
 */
export const TouchOptimizedIconButton = forwardRef<HTMLButtonElement, TouchOptimizedIconButtonProps>(
  ({ touchConfig = { enabled: true }, ...iconButtonProps }, ref) => {
    const { touchConfig: responsiveTouchConfig, isTouchDevice } = useResponsive();

    const touchStyles = getTouchOptimizedStyles(
      touchConfig,
      responsiveTouchConfig,
      isTouchDevice
    );

    return (
      <IconButton
        ref={ref}
        {...iconButtonProps}
        {...touchStyles}
        size={isTouchDevice ? 'lg' : iconButtonProps.size}
      />
    );
  }
);

TouchOptimizedIconButton.displayName = 'TouchOptimizedIconButton';

/**
 * 触摸优化Link组件
 */
export const TouchOptimizedLink = forwardRef<HTMLAnchorElement, TouchOptimizedLinkProps>(
  ({ children, touchConfig = { enabled: true }, ...linkProps }, ref) => {
    const { touchConfig: responsiveTouchConfig, isTouchDevice } = useResponsive();

    const touchStyles = getTouchOptimizedStyles(
      touchConfig,
      responsiveTouchConfig,
      isTouchDevice
    );

    return (
      <Link
        ref={ref}
        {...linkProps}
        {...touchStyles}
        px={isTouchDevice ? 2 : linkProps.px}
        py={isTouchDevice ? 2 : linkProps.py}
        display="inline-flex"
        alignItems="center"
      >
        {children}
      </Link>
    );
  }
);

TouchOptimizedLink.displayName = 'TouchOptimizedLink';

export default {
  Box: TouchOptimizedBox,
  Button: TouchOptimizedButton,
  IconButton: TouchOptimizedIconButton,
  Link: TouchOptimizedLink,
};
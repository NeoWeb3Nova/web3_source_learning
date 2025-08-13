import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { Box, Button, IconButton, Link, } from '@chakra-ui/react';
import { useResponsive } from '@/hooks/useResponsive';
const getTouchOptimizedStyles = (config, touchConfig, isTouchDevice) => {
    if (!config.enabled || !isTouchDevice)
        return {};
    const minSize = config.minSize || touchConfig.minSize;
    const feedbackType = config.feedbackType || 'scale';
    const baseStyles = {
        minH: `${minSize}px`,
        minW: `${minSize}px`,
        cursor: 'pointer',
        userSelect: 'none',
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
export const TouchOptimizedBox = forwardRef(({ children, touchConfig = { enabled: true }, onTouchTap, onLongPress, ...boxProps }, ref) => {
    const { touchConfig: responsiveTouchConfig, isTouchDevice } = useResponsive();
    const touchStyles = getTouchOptimizedStyles(touchConfig, responsiveTouchConfig, isTouchDevice);
    return (_jsx(Box, { ref: ref, ...boxProps, ...touchStyles, onClick: onTouchTap, children: children }));
});
TouchOptimizedBox.displayName = 'TouchOptimizedBox';
export const TouchOptimizedButton = forwardRef(({ children, touchConfig = { enabled: true }, ...buttonProps }, ref) => {
    const { touchConfig: responsiveTouchConfig, isTouchDevice } = useResponsive();
    const touchStyles = getTouchOptimizedStyles(touchConfig, responsiveTouchConfig, isTouchDevice);
    return (_jsx(Button, { ref: ref, ...buttonProps, ...touchStyles, size: isTouchDevice ? 'lg' : buttonProps.size, px: isTouchDevice ? 6 : buttonProps.px, py: isTouchDevice ? 3 : buttonProps.py, children: children }));
});
TouchOptimizedButton.displayName = 'TouchOptimizedButton';
export const TouchOptimizedIconButton = forwardRef(({ touchConfig = { enabled: true }, ...iconButtonProps }, ref) => {
    const { touchConfig: responsiveTouchConfig, isTouchDevice } = useResponsive();
    const touchStyles = getTouchOptimizedStyles(touchConfig, responsiveTouchConfig, isTouchDevice);
    return (_jsx(IconButton, { ref: ref, ...iconButtonProps, ...touchStyles, size: isTouchDevice ? 'lg' : iconButtonProps.size }));
});
TouchOptimizedIconButton.displayName = 'TouchOptimizedIconButton';
export const TouchOptimizedLink = forwardRef(({ children, touchConfig = { enabled: true }, ...linkProps }, ref) => {
    const { touchConfig: responsiveTouchConfig, isTouchDevice } = useResponsive();
    const touchStyles = getTouchOptimizedStyles(touchConfig, responsiveTouchConfig, isTouchDevice);
    return (_jsx(Link, { ref: ref, ...linkProps, ...touchStyles, px: isTouchDevice ? 2 : linkProps.px, py: isTouchDevice ? 2 : linkProps.py, display: "inline-flex", alignItems: "center", children: children }));
});
TouchOptimizedLink.displayName = 'TouchOptimizedLink';
export default {
    Box: TouchOptimizedBox,
    Button: TouchOptimizedButton,
    IconButton: TouchOptimizedIconButton,
    Link: TouchOptimizedLink,
};

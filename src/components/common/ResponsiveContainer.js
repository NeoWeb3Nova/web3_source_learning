import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Box, Container, Grid, GridItem, useColorModeValue, } from '@chakra-ui/react';
import { useResponsive } from '@/hooks/useResponsive';
export const ResponsiveContainer = ({ children, variant = 'section', enableGrid = false, gridColumns, fullWidth = false, ...boxProps }) => {
    const { layoutConfig, touchConfig, isMobile, isTablet, isDesktop, } = useResponsive();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const getContainerStyles = () => {
        const baseStyles = {
            ...boxProps,
        };
        switch (variant) {
            case 'page':
                return {
                    ...baseStyles,
                    minH: 'calc(100vh - 64px)',
                    bg: useColorModeValue('gray.50', 'gray.900'),
                    p: layoutConfig.contentPadding,
                };
            case 'section':
                return {
                    ...baseStyles,
                    p: layoutConfig.contentPadding,
                    mb: layoutConfig.cardSpacing,
                };
            case 'card':
                return {
                    ...baseStyles,
                    bg: bgColor,
                    borderRadius: { base: 'lg', md: 'xl' },
                    border: '1px solid',
                    borderColor,
                    shadow: { base: 'sm', md: 'md', lg: 'lg' },
                    p: { base: 4, md: 6, lg: 8 },
                    mb: layoutConfig.cardSpacing,
                };
            case 'grid':
                return {
                    ...baseStyles,
                    p: layoutConfig.contentPadding,
                };
            default:
                return baseStyles;
        }
    };
    const getGridConfig = () => {
        if (!enableGrid)
            return null;
        const columns = gridColumns || {
            base: layoutConfig.gridColumns === 1 ? 1 : Math.min(layoutConfig.gridColumns, 2),
            md: layoutConfig.gridColumns,
            lg: Math.max(layoutConfig.gridColumns, 3),
        };
        return {
            templateColumns: {
                base: `repeat(${columns.base || 1}, 1fr)`,
                md: `repeat(${columns.md || 2}, 1fr)`,
                lg: `repeat(${columns.lg || 3}, 1fr)`,
            },
            gap: {
                base: layoutConfig.cardSpacing,
                md: layoutConfig.cardSpacing + 2,
                lg: layoutConfig.cardSpacing + 4,
            },
        };
    };
    const getMaxWidth = () => {
        if (fullWidth)
            return '100%';
        return {
            base: '100%',
            md: layoutConfig.maxWidth,
            lg: layoutConfig.maxWidth,
        };
    };
    const renderContent = () => {
        if (enableGrid) {
            const gridConfig = getGridConfig();
            return (_jsx(Grid, { ...gridConfig, children: React.Children.map(children, (child, index) => (_jsx(GridItem, { children: child }, index))) }));
        }
        return children;
    };
    const containerStyles = getContainerStyles();
    const maxWidth = getMaxWidth();
    if (variant === 'page') {
        return (_jsx(Box, { ...containerStyles, children: _jsx(Container, { maxW: maxWidth, centerContent: !fullWidth, px: { base: 4, md: 6, lg: 8 }, children: renderContent() }) }));
    }
    return (_jsx(Box, { ...containerStyles, maxW: maxWidth, mx: fullWidth ? 0 : 'auto', sx: {
            '& button, & [role="button"]': {
                minH: `${touchConfig.minSize}px`,
                minW: `${touchConfig.minSize}px`,
            },
            '& a': {
                minH: `${touchConfig.minSize}px`,
                display: 'inline-flex',
                alignItems: 'center',
            },
        }, children: renderContent() }));
};
export const ResponsiveGrid = (props) => {
    return _jsx(ResponsiveContainer, { ...props, variant: "grid", enableGrid: true });
};
export const ResponsiveCard = (props) => {
    return _jsx(ResponsiveContainer, { ...props, variant: "card" });
};
export const ResponsivePage = (props) => {
    return _jsx(ResponsiveContainer, { ...props, variant: "page" });
};
export default ResponsiveContainer;

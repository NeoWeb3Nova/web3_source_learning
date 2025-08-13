import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveContainer, usePlatformDetection } from '@/components/common';
import { TopNavigation } from './TopNavigation';
import { BottomNavigation } from './BottomNavigation';
import { SideNavigation } from './SideNavigation';
const SafeAreaBox = ({ children }) => {
    const { isIOS } = usePlatformDetection();
    const safeAreaStyles = isIOS ? {
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
    } : {};
    return (_jsx(Box, { ...safeAreaStyles, children: children }));
};
export const Layout = ({ children, showTopNav = true, showBottomNav = true, showSideNav = true, className, style, testId, }) => {
    const { layoutConfig, isMobile, } = useResponsive();
    return (_jsx(SafeAreaBox, { children: _jsxs(Box, { className: className, style: style, "data-testid": testId, minH: "100vh", bg: useColorModeValue('gray.50', 'gray.900'), position: "relative", children: [showTopNav && (_jsx(TopNavigation, { position: "sticky", top: 0, zIndex: 1000, bg: useColorModeValue('white', 'gray.800'), borderBottom: "1px solid", borderColor: useColorModeValue('gray.200', 'gray.600'), boxShadow: "sm" })), _jsxs(Flex, { direction: layoutConfig.direction, flex: "1", minH: showTopNav ? 'calc(100vh - 64px)' : '100vh', children: [layoutConfig.showSidebar && showSideNav && (_jsx(Box, { w: layoutConfig.sidebarWidth, bg: useColorModeValue('white', 'gray.800'), borderRight: "1px solid", borderColor: useColorModeValue('gray.200', 'gray.600'), position: isMobile ? 'fixed' : 'sticky', top: showTopNav ? '64px' : 0, h: showTopNav ? 'calc(100vh - 64px)' : '100vh', zIndex: isMobile ? 999 : 'auto', overflowY: "auto", children: _jsx(SideNavigation, {}) })), _jsx(ResponsiveContainer, { variant: "page", flex: "1", p: layoutConfig.contentPadding, maxW: layoutConfig.maxWidth, mx: "auto", overflowY: "auto", children: children })] }), layoutConfig.showBottomNav && showBottomNav && (_jsx(BottomNavigation, { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000, bg: useColorModeValue('white', 'gray.800'), borderTop: "1px solid", borderColor: useColorModeValue('gray.200', 'gray.600'), boxShadow: "lg" }))] }) }));
};
export default Layout;

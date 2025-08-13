import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Flex, Text, Icon, Badge, useColorModeValue, } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, AcademicCapIcon, ChartBarIcon, CogIcon, } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, AcademicCapIcon as AcademicCapIconSolid, ChartBarIcon as ChartBarIconSolid, CogIcon as CogIconSolid, } from '@heroicons/react/24/solid';
import { useProgress } from '@/hooks/useProgress';
export const BottomNavigation = ({ position = 'fixed', bottom = 0, left = 0, right = 0, zIndex = 1000, bg = 'white', borderTop, borderColor, boxShadow, display, className, style, testId, }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userProgress } = useProgress();
    const activeBg = useColorModeValue('primary.50', 'primary.900');
    const activeColor = useColorModeValue('primary.600', 'primary.200');
    const inactiveColor = useColorModeValue('gray.500', 'gray.400');
    const unreadAchievements = userProgress?.achievements.filter(achievement => achievement.status === 'unlocked' && !achievement.unlockedAt).length || 0;
    const navItems = [
        {
            path: '/',
            label: '首页',
            icon: HomeIcon,
            activeIcon: HomeIconSolid,
        },
        {
            path: '/practice',
            label: '练习',
            icon: AcademicCapIcon,
            activeIcon: AcademicCapIconSolid,
        },
        {
            path: '/progress',
            label: '进度',
            icon: ChartBarIcon,
            activeIcon: ChartBarIconSolid,
            badgeCount: unreadAchievements,
            showBadge: unreadAchievements > 0,
        },
        {
            path: '/settings',
            label: '设置',
            icon: CogIcon,
            activeIcon: CogIconSolid,
        },
    ];
    const handleNavClick = (path) => {
        navigate(path);
    };
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };
    return (_jsxs(Box, { className: className, style: style, "data-testid": testId, position: position, bottom: bottom, left: left, right: right, zIndex: zIndex, bg: bg, borderTop: borderTop, borderColor: borderColor, boxShadow: boxShadow, display: display, h: "64px", w: "full", children: [_jsx(Flex, { align: "center", justify: "space-around", h: "full", px: 2, maxW: "500px", mx: "auto", children: navItems.map((item) => {
                    const active = isActive(item.path);
                    const IconComponent = active ? item.activeIcon : item.icon;
                    return (_jsxs(Flex, { direction: "column", align: "center", justify: "center", flex: "1", h: "full", cursor: "pointer", position: "relative", borderRadius: "lg", bg: active ? activeBg : 'transparent', color: active ? activeColor : inactiveColor, transition: "all 0.2s ease-in-out", _hover: {
                            bg: active ? activeBg : 'gray.50',
                            transform: 'translateY(-1px)',
                        }, _active: {
                            transform: 'translateY(0)',
                        }, onClick: () => handleNavClick(item.path), role: "button", "aria-label": `导航到${item.label}`, tabIndex: 0, onKeyDown: (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleNavClick(item.path);
                            }
                        }, children: [_jsxs(Box, { position: "relative", mb: 1, children: [_jsx(Icon, { as: IconComponent, w: 6, h: 6, transition: "all 0.2s ease-in-out" }), item.showBadge && item.badgeCount && item.badgeCount > 0 && (_jsx(Badge, { position: "absolute", top: "-8px", right: "-8px", colorScheme: "red", variant: "solid", borderRadius: "full", minW: "18px", h: "18px", fontSize: "xs", display: "flex", alignItems: "center", justifyContent: "center", children: item.badgeCount > 99 ? '99+' : item.badgeCount }))] }), _jsx(Text, { fontSize: "xs", fontWeight: active ? 'semibold' : 'medium', lineHeight: "1", transition: "all 0.2s ease-in-out", children: item.label }), active && (_jsx(Box, { position: "absolute", top: "4px", w: "4px", h: "4px", bg: activeColor, borderRadius: "full", animation: "pulse 2s infinite" }))] }, item.path));
                }) }), _jsx(Box, { h: "env(safe-area-inset-bottom)", bg: bg })] }));
};
export default BottomNavigation;

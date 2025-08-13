import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, VStack, HStack, Text, Icon, Badge, Divider, Collapse, useDisclosure, Button, Progress, Avatar, Flex, } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HomeIcon, AcademicCapIcon, ChartBarIcon, CogIcon, BookOpenIcon, StarIcon, TrophyIcon, ClockIcon, } from '@heroicons/react/24/outline';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useProgress } from '@/hooks/useProgress';
export const SideNavigation = ({ className, style, testId, }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { stats, favorites } = useVocabulary();
    const { userProgress, getTodayStats } = useProgress();
    const { isOpen: isVocabOpen, onToggle: onVocabToggle } = useDisclosure({ defaultIsOpen: true });
    const { isOpen: isPracticeOpen, onToggle: onPracticeToggle } = useDisclosure({ defaultIsOpen: true });
    const todayStats = getTodayStats();
    const unreadAchievements = userProgress?.achievements.filter(achievement => achievement.status === 'unlocked' && !achievement.unlockedAt).length || 0;
    const mainNavItems = [
        {
            path: '/',
            label: '首页',
            icon: HomeIcon,
        },
        {
            path: '/vocabulary',
            label: '词汇学习',
            icon: BookOpenIcon,
            children: [
                {
                    path: '/vocabulary/all',
                    label: '全部词汇',
                    icon: BookOpenIcon,
                    badgeCount: stats?.total || 0,
                    showBadge: true,
                },
                {
                    path: '/vocabulary/favorites',
                    label: '收藏词汇',
                    icon: StarIcon,
                    badgeCount: favorites.length,
                    showBadge: favorites.length > 0,
                },
                {
                    path: '/vocabulary/mastered',
                    label: '已掌握',
                    icon: TrophyIcon,
                    badgeCount: stats?.mastered || 0,
                    showBadge: true,
                },
                {
                    path: '/vocabulary/learning',
                    label: '学习中',
                    icon: ClockIcon,
                    badgeCount: stats?.learning || 0,
                    showBadge: true,
                },
            ],
        },
        {
            path: '/practice',
            label: '练习测试',
            icon: AcademicCapIcon,
            children: [
                {
                    path: '/practice/quick',
                    label: '快速练习',
                    icon: AcademicCapIcon,
                },
                {
                    path: '/practice/timed',
                    label: '限时挑战',
                    icon: ClockIcon,
                },
                {
                    path: '/practice/review',
                    label: '复习模式',
                    icon: BookOpenIcon,
                },
            ],
        },
        {
            path: '/progress',
            label: '学习进度',
            icon: ChartBarIcon,
            badgeCount: unreadAchievements,
            showBadge: unreadAchievements > 0,
        },
        {
            path: '/settings',
            label: '设置',
            icon: CogIcon,
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
    const renderNavItem = (item, level = 0) => {
        const active = isActive(item.path);
        const hasChildren = item.children && item.children.length > 0;
        return (_jsxs(Box, { w: "full", children: [_jsxs(HStack, { w: "full", p: 3, pl: level * 4 + 3, cursor: "pointer", borderRadius: "lg", bg: active ? 'primary.50' : 'transparent', color: active ? 'primary.600' : 'gray.700', _hover: {
                        bg: active ? 'primary.50' : 'gray.50',
                    }, transition: "all 0.2s ease-in-out", onClick: () => !hasChildren && handleNavClick(item.path), role: "button", "aria-label": `导航到${item.label}`, children: [_jsx(Icon, { as: item.icon, w: 5, h: 5 }), _jsx(Text, { flex: "1", fontSize: "sm", fontWeight: active ? 'semibold' : 'medium', children: item.label }), item.showBadge && item.badgeCount && item.badgeCount > 0 && (_jsx(Badge, { colorScheme: active ? 'primary' : 'gray', variant: "solid", borderRadius: "full", fontSize: "xs", children: item.badgeCount > 999 ? '999+' : item.badgeCount })), hasChildren && (_jsx(Icon, { as: isVocabOpen ? ChevronDownIcon : ChevronRightIcon, w: 4, h: 4, onClick: (e) => {
                                e.stopPropagation();
                                if (item.path === '/vocabulary')
                                    onVocabToggle();
                                if (item.path === '/practice')
                                    onPracticeToggle();
                            } }))] }), hasChildren && (_jsx(Collapse, { in: item.path === '/vocabulary' ? isVocabOpen : isPracticeOpen, children: _jsx(VStack, { spacing: 0, align: "stretch", mt: 1, children: item.children?.map(child => renderNavItem(child, level + 1)) }) }))] }, item.path));
    };
    return (_jsx(Box, { className: className, style: style, "data-testid": testId, h: "full", p: 4, overflowY: "auto", children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { bg: "gradient-to-r", bgGradient: "linear(to-r, primary.500, secondary.500)", borderRadius: "xl", p: 4, color: "white", children: [_jsxs(HStack, { spacing: 3, mb: 3, children: [_jsx(Avatar, { size: "sm", name: "\u7528\u6237", bg: "whiteAlpha.300" }), _jsxs(VStack, { align: "start", spacing: 0, flex: "1", children: [_jsx(Text, { fontSize: "sm", fontWeight: "semibold", children: "\u5B66\u4E60\u8005" }), _jsxs(Text, { fontSize: "xs", opacity: 0.8, children: ["Lv.", userProgress?.level || 1] })] })] }), _jsxs(Box, { children: [_jsxs(Flex, { justify: "space-between", mb: 1, children: [_jsx(Text, { fontSize: "xs", opacity: 0.8, children: "\u7ECF\u9A8C\u503C" }), _jsxs(Text, { fontSize: "xs", opacity: 0.8, children: [userProgress?.currentLevelExp || 0, "/", userProgress?.nextLevelExp || 100] })] }), _jsx(Progress, { value: userProgress?.nextLevelExp ? (userProgress.currentLevelExp / userProgress.nextLevelExp) * 100 : 0, size: "sm", bg: "whiteAlpha.300", borderRadius: "full" })] })] }), _jsxs(Box, { bg: "white", borderRadius: "lg", p: 4, border: "1px solid", borderColor: "gray.200", children: [_jsx(Text, { fontSize: "sm", fontWeight: "semibold", mb: 3, color: "gray.700", children: "\u4ECA\u65E5\u5B66\u4E60" }), _jsxs(VStack, { spacing: 2, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { fontSize: "xs", color: "gray.600", children: "\u5B66\u4E60\u5355\u8BCD" }), _jsx(Text, { fontSize: "xs", fontWeight: "semibold", color: "primary.600", children: todayStats?.wordsStudied || 0 })] }), _jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { fontSize: "xs", color: "gray.600", children: "\u7EC3\u4E60\u6B21\u6570" }), _jsx(Text, { fontSize: "xs", fontWeight: "semibold", color: "secondary.600", children: todayStats?.practiceSessions || 0 })] }), _jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { fontSize: "xs", color: "gray.600", children: "\u5B66\u4E60\u65F6\u95F4" }), _jsxs(Text, { fontSize: "xs", fontWeight: "semibold", color: "orange.600", children: [todayStats?.studyTimeMinutes || 0, "\u5206\u949F"] })] })] })] }), _jsx(Divider, {}), _jsx(VStack, { spacing: 1, align: "stretch", children: mainNavItems.map(item => renderNavItem(item)) }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Text, { fontSize: "sm", fontWeight: "semibold", mb: 3, color: "gray.700", children: "\u5FEB\u6377\u64CD\u4F5C" }), _jsxs(VStack, { spacing: 2, align: "stretch", children: [_jsx(Button, { size: "sm", variant: "outline", colorScheme: "primary", leftIcon: _jsx(Icon, { as: AcademicCapIcon }), onClick: () => navigate('/practice/quick'), children: "\u5F00\u59CB\u7EC3\u4E60" }), _jsx(Button, { size: "sm", variant: "outline", colorScheme: "secondary", leftIcon: _jsx(Icon, { as: BookOpenIcon }), onClick: () => navigate('/vocabulary/learning'), children: "\u7EE7\u7EED\u5B66\u4E60" })] })] })] }) }));
};
export default SideNavigation;

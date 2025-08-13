import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  Divider,
  Collapse,
  useDisclosure,
  Button,
  Progress,
  Avatar,
  Flex,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  HomeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  BookOpenIcon,
  StarIcon,
  TrophyIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BaseComponentProps } from '@/types';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useProgress } from '@/hooks/useProgress';
import { Web3Category } from '@/types';

/**
 * 导航项接口
 */
interface NavItem {
  /** 路由路径 */
  path: string;
  /** 显示标签 */
  label: string;
  /** 图标 */
  icon: React.ComponentType<any>;
  /** 徽章数量 */
  badgeCount?: number;
  /** 是否显示徽章 */
  showBadge?: boolean;
  /** 子项 */
  children?: NavItem[];
}

/**
 * 侧边导航组件Props
 */
interface SideNavigationProps extends BaseComponentProps {}

/**
 * 侧边导航组件
 * 用于平板和桌面端的侧边栏导航
 */
export const SideNavigation: React.FC<SideNavigationProps> = ({
  className,
  style,
  testId,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stats, favorites } = useVocabulary();
  const { userProgress, getTodayStats } = useProgress();

  // 折叠状态管理
  const { isOpen: isVocabOpen, onToggle: onVocabToggle } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: isPracticeOpen, onToggle: onPracticeToggle } = useDisclosure({ defaultIsOpen: true });

  // 获取统计数据
  const todayStats = getTodayStats();
  const unreadAchievements = userProgress?.achievements.filter(
    achievement => achievement.status === 'unlocked' && !achievement.unlockedAt
  ).length || 0;

  // 主导航项
  const mainNavItems: NavItem[] = [
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

  /**
   * 处理导航点击
   */
  const handleNavClick = (path: string) => {
    navigate(path);
  };

  /**
   * 检查是否为当前路径
   */
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  /**
   * 渲染导航项
   */
  const renderNavItem = (item: NavItem, level: number = 0) => {
    const active = isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <Box key={item.path} w="full">
        <HStack
          w="full"
          p={3}
          pl={level * 4 + 3}
          cursor="pointer"
          borderRadius="lg"
          bg={active ? 'primary.50' : 'transparent'}
          color={active ? 'primary.600' : 'gray.700'}
          _hover={{
            bg: active ? 'primary.50' : 'gray.50',
          }}
          transition="all 0.2s ease-in-out"
          onClick={() => !hasChildren && handleNavClick(item.path)}
          role="button"
          aria-label={`导航到${item.label}`}
        >
          <Icon as={item.icon} w={5} h={5} />
          <Text flex="1" fontSize="sm" fontWeight={active ? 'semibold' : 'medium'}>
            {item.label}
          </Text>
          
          {/* 徽章 */}
          {item.showBadge && item.badgeCount && item.badgeCount > 0 && (
            <Badge
              colorScheme={active ? 'primary' : 'gray'}
              variant="solid"
              borderRadius="full"
              fontSize="xs"
            >
              {item.badgeCount > 999 ? '999+' : item.badgeCount}
            </Badge>
          )}

          {/* 展开/收起图标 */}
          {hasChildren && (
            <Icon
              as={isVocabOpen ? ChevronDownIcon : ChevronRightIcon}
              w={4}
              h={4}
              onClick={(e) => {
                e.stopPropagation();
                if (item.path === '/vocabulary') onVocabToggle();
                if (item.path === '/practice') onPracticeToggle();
              }}
            />
          )}
        </HStack>

        {/* 子项 */}
        {hasChildren && (
          <Collapse in={item.path === '/vocabulary' ? isVocabOpen : isPracticeOpen}>
            <VStack spacing={0} align="stretch" mt={1}>
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </VStack>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box
      className={className}
      style={style}
      data-testid={testId}
      h="full"
      p={4}
      overflowY="auto"
    >
      <VStack spacing={6} align="stretch">
        {/* 用户信息卡片 */}
        <Box
          bg="gradient-to-r"
          bgGradient="linear(to-r, primary.500, secondary.500)"
          borderRadius="xl"
          p={4}
          color="white"
        >
          <HStack spacing={3} mb={3}>
            <Avatar size="sm" name="用户" bg="whiteAlpha.300" />
            <VStack align="start" spacing={0} flex="1">
              <Text fontSize="sm" fontWeight="semibold">
                学习者
              </Text>
              <Text fontSize="xs" opacity={0.8}>
                Lv.{userProgress?.level || 1}
              </Text>
            </VStack>
          </HStack>
          
          {/* 等级进度 */}
          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" opacity={0.8}>
                经验值
              </Text>
              <Text fontSize="xs" opacity={0.8}>
                {userProgress?.currentLevelExp || 0}/{userProgress?.nextLevelExp || 100}
              </Text>
            </Flex>
            <Progress
              value={userProgress?.nextLevelExp ? (userProgress.currentLevelExp / userProgress.nextLevelExp) * 100 : 0}
              size="sm"
              bg="whiteAlpha.300"
              borderRadius="full"
            />
          </Box>
        </Box>

        {/* 今日统计 */}
        <Box
          bg="white"
          borderRadius="lg"
          p={4}
          border="1px solid"
          borderColor="gray.200"
        >
          <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.700">
            今日学习
          </Text>
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.600">学习单词</Text>
              <Text fontSize="xs" fontWeight="semibold" color="primary.600">
                {todayStats?.wordsStudied || 0}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.600">练习次数</Text>
              <Text fontSize="xs" fontWeight="semibold" color="secondary.600">
                {todayStats?.practiceSessions || 0}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.600">学习时间</Text>
              <Text fontSize="xs" fontWeight="semibold" color="orange.600">
                {todayStats?.studyTimeMinutes || 0}分钟
              </Text>
            </HStack>
          </VStack>
        </Box>

        <Divider />

        {/* 主导航 */}
        <VStack spacing={1} align="stretch">
          {mainNavItems.map(item => renderNavItem(item))}
        </VStack>

        <Divider />

        {/* 快捷操作 */}
        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.700">
            快捷操作
          </Text>
          <VStack spacing={2} align="stretch">
            <Button
              size="sm"
              variant="outline"
              colorScheme="primary"
              leftIcon={<Icon as={AcademicCapIcon} />}
              onClick={() => navigate('/practice/quick')}
            >
              开始练习
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="secondary"
              leftIcon={<Icon as={BookOpenIcon} />}
              onClick={() => navigate('/vocabulary/learning')}
            >
              继续学习
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default SideNavigation;
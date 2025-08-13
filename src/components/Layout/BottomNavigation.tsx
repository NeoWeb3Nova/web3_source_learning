import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CogIcon as CogIconSolid,
} from '@heroicons/react/24/solid';
import { BaseComponentProps } from '@/types';
import { useProgress } from '@/hooks/useProgress';

/**
 * 导航项接口
 */
interface NavItem {
  /** 路由路径 */
  path: string;
  /** 显示标签 */
  label: string;
  /** 未选中图标 */
  icon: React.ComponentType<any>;
  /** 选中图标 */
  activeIcon: React.ComponentType<any>;
  /** 徽章数量 */
  badgeCount?: number;
  /** 是否显示徽章 */
  showBadge?: boolean;
}

/**
 * 底部导航组件Props
 */
interface BottomNavigationProps extends BaseComponentProps {
  /** 位置属性 */
  position?: 'static' | 'relative' | 'absolute' | 'sticky' | 'fixed';
  /** 底部距离 */
  bottom?: number | string;
  /** 左侧距离 */
  left?: number | string;
  /** 右侧距离 */
  right?: number | string;
  /** 层级 */
  zIndex?: number;
  /** 背景色 */
  bg?: string;
  /** 边框 */
  borderTop?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 阴影 */
  boxShadow?: string;
  /** 显示属性 */
  display?: any;
}

/**
 * 底部导航组件
 * 提供首页、练习、进度、设置四个页面的导航
 */
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  position = 'fixed',
  bottom = 0,
  left = 0,
  right = 0,
  zIndex = 1000,
  bg = 'white',
  borderTop,
  borderColor,
  boxShadow,
  display,
  className,
  style,
  testId,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProgress } = useProgress();

  // 主题颜色
  const activeBg = useColorModeValue('primary.50', 'primary.900');
  const activeColor = useColorModeValue('primary.600', 'primary.200');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');

  // 计算未读成就数量
  const unreadAchievements = userProgress?.achievements.filter(
    achievement => achievement.status === 'unlocked' && !achievement.unlockedAt
  ).length || 0;

  // 导航项配置
  const navItems: NavItem[] = [
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

  return (
    <Box
      className={className}
      style={style}
      data-testid={testId}
      position={position}
      bottom={bottom}
      left={left}
      right={right}
      zIndex={zIndex}
      bg={bg}
      borderTop={borderTop}
      borderColor={borderColor}
      boxShadow={boxShadow}
      display={display}
      h="64px"
      w="full"
    >
      <Flex
        align="center"
        justify="space-around"
        h="full"
        px={2}
        maxW="500px"
        mx="auto"
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = active ? item.activeIcon : item.icon;

          return (
            <Flex
              key={item.path}
              direction="column"
              align="center"
              justify="center"
              flex="1"
              h="full"
              cursor="pointer"
              position="relative"
              borderRadius="lg"
              bg={active ? activeBg : 'transparent'}
              color={active ? activeColor : inactiveColor}
              transition="all 0.2s ease-in-out"
              _hover={{
                bg: active ? activeBg : 'gray.50',
                transform: 'translateY(-1px)',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              onClick={() => handleNavClick(item.path)}
              role="button"
              aria-label={`导航到${item.label}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavClick(item.path);
                }
              }}
            >
              {/* 图标容器 */}
              <Box position="relative" mb={1}>
                <Icon
                  as={IconComponent}
                  w={6}
                  h={6}
                  transition="all 0.2s ease-in-out"
                />
                
                {/* 徽章 */}
                {item.showBadge && item.badgeCount && item.badgeCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-8px"
                    right="-8px"
                    colorScheme="red"
                    variant="solid"
                    borderRadius="full"
                    minW="18px"
                    h="18px"
                    fontSize="xs"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </Badge>
                )}
              </Box>

              {/* 标签文字 */}
              <Text
                fontSize="xs"
                fontWeight={active ? 'semibold' : 'medium'}
                lineHeight="1"
                transition="all 0.2s ease-in-out"
              >
                {item.label}
              </Text>

              {/* 活跃指示器 */}
              {active && (
                <Box
                  position="absolute"
                  top="4px"
                  w="4px"
                  h="4px"
                  bg={activeColor}
                  borderRadius="full"
                  animation="pulse 2s infinite"
                />
              )}
            </Flex>
          );
        })}
      </Flex>

      {/* 安全区域适配 */}
      <Box
        h="env(safe-area-inset-bottom)"
        bg={bg}
      />
    </Box>
  );
};

export default BottomNavigation;
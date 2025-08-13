import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Progress,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Badge,
  useBreakpointValue,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { HamburgerIcon, BellIcon, SettingsIcon } from '@chakra-ui/icons';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useProgress } from '@/hooks/useProgress';
import { BaseComponentProps } from '@/types';

/**
 * 顶部导航组件Props
 */
interface TopNavigationProps extends BaseComponentProps {
  /** 位置属性 */
  position?: 'static' | 'relative' | 'absolute' | 'sticky' | 'fixed';
  /** 顶部距离 */
  top?: number | string;
  /** 层级 */
  zIndex?: number;
  /** 背景色 */
  bg?: string;
  /** 边框 */
  borderBottom?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 阴影 */
  boxShadow?: string;
}

/**
 * 顶部导航组件
 * 显示当前课程、学习进度条、用户信息等
 */
export const TopNavigation: React.FC<TopNavigationProps> = ({
  position = 'sticky',
  top = 0,
  zIndex = 1000,
  bg = 'white',
  borderBottom,
  borderColor,
  boxShadow,
  className,
  style,
  testId,
}) => {
  const { stats, currentWord, filteredVocabulary } = useVocabulary();
  const { userProgress, getTodayStats } = useProgress();

  // 响应式显示配置
  const showFullInfo = useBreakpointValue({ base: false, md: true });
  const logoSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const spacing = useBreakpointValue({ base: 2, md: 4 });

  // 计算学习进度
  const todayStats = getTodayStats();
  const dailyGoal = 20; // 每日目标单词数
  const todayProgress = todayStats ? (todayStats.wordsStudied / dailyGoal) * 100 : 0;
  const masteredCount = stats?.mastered || 0;
  const totalCount = stats?.total || 0;
  const overallProgress = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;

  // 当前课程信息
  const currentCourse = currentWord?.category || 'DeFi基础';
  const currentLevel = userProgress?.level || 1;
  const currentExp = userProgress?.currentLevelExp || 0;
  const nextLevelExp = userProgress?.nextLevelExp || 100;
  const levelProgress = nextLevelExp > 0 ? (currentExp / nextLevelExp) * 100 : 0;

  return (
    <Box
      className={className}
      style={style}
      data-testid={testId}
      position={position}
      top={top}
      zIndex={zIndex}
      bg={bg}
      borderBottom={borderBottom}
      borderColor={borderColor}
      boxShadow={boxShadow}
      w="full"
      h="64px"
    >
      <Flex
        align="center"
        justify="space-between"
        h="full"
        px={spacing}
        maxW="1200px"
        mx="auto"
      >
        {/* 左侧：Logo和课程信息 */}
        <Flex align="center" spacing={spacing}>
          {/* 移动端菜单按钮 */}
          <IconButton
            aria-label="打开菜单"
            icon={<HamburgerIcon />}
            variant="ghost"
            size="sm"
            display={{ base: 'flex', md: 'none' }}
            mr={2}
          />

          {/* Logo和标题 */}
          <HStack spacing={3}>
            <Box
              w="40px"
              h="40px"
              bg="primary.500"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontWeight="bold"
              fontSize="lg"
            >
              W3
            </Box>
            
            {showFullInfo ? (
              <VStack align="start" spacing={0}>
                <Heading size={logoSize} color="gray.800">
                  DeFi词汇大作战
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {currentCourse} · 第{currentLevel}级
                </Text>
              </VStack>
            ) : (
              <Heading size={logoSize} color="gray.800">
                DeFi词汇
              </Heading>
            )}
          </HStack>
        </Flex>

        {/* 中间：进度信息 */}
        {showFullInfo && (
          <Flex align="center" flex="1" maxW="400px" mx={6}>
            <VStack spacing={2} w="full">
              {/* 今日进度 */}
              <Flex justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600">
                  今日进度
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="primary.600">
                  {todayStats?.wordsStudied || 0}/{dailyGoal}
                </Text>
              </Flex>
              <Progress
                value={todayProgress}
                size="sm"
                colorScheme="primary"
                w="full"
                borderRadius="full"
                bg="gray.100"
              />

              {/* 总体进度 */}
              <Flex justify="space-between" w="full">
                <Text fontSize="xs" color="gray.500">
                  总掌握度
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {masteredCount}/{totalCount}
                </Text>
              </Flex>
            </VStack>
          </Flex>
        )}

        {/* 右侧：用户信息和操作 */}
        <Flex align="center" spacing={spacing}>
          {/* 等级信息 */}
          {showFullInfo && (
            <HStack spacing={2}>
              <Badge
                colorScheme="primary"
                variant="solid"
                borderRadius="full"
                px={2}
                py={1}
              >
                Lv.{currentLevel}
              </Badge>
              <Box w="60px">
                <Progress
                  value={levelProgress}
                  size="xs"
                  colorScheme="secondary"
                  borderRadius="full"
                />
              </Box>
            </HStack>
          )}

          {/* 通知按钮 */}
          <IconButton
            aria-label="通知"
            icon={<BellIcon />}
            variant="ghost"
            size="sm"
            position="relative"
          >
            {/* 通知小红点 */}
            <Box
              position="absolute"
              top="8px"
              right="8px"
              w="8px"
              h="8px"
              bg="red.500"
              borderRadius="full"
              display="none" // 有通知时显示
            />
          </IconButton>

          {/* 用户菜单 */}
          <Menu>
            <MenuButton>
              <Avatar
                size="sm"
                name="用户"
                bg="primary.500"
                color="white"
                cursor="pointer"
                _hover={{ transform: 'scale(1.05)' }}
                transition="transform 0.2s"
              />
            </MenuButton>
            <MenuList>
              <MenuItem icon={<SettingsIcon />}>
                设置
              </MenuItem>
              <MenuItem>
                个人资料
              </MenuItem>
              <MenuItem>
                学习统计
              </MenuItem>
              <MenuItem>
                帮助与反馈
              </MenuItem>
              <MenuItem color="red.500">
                退出登录
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {/* 移动端简化进度条 */}
      {!showFullInfo && (
        <Box px={4} pb={2}>
          <Progress
            value={todayProgress}
            size="xs"
            colorScheme="primary"
            borderRadius="full"
            bg="gray.100"
          />
        </Box>
      )}
    </Box>
  );
};

export default TopNavigation;
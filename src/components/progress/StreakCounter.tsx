import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  useColorModeValue,
  keyframes,
  Flex,
  Tooltip,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import {
  FireIcon,
  CalendarDaysIcon,
  TrophyIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { format, differenceInDays, parseISO, isToday, isYesterday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DailyStats } from '@/types/progress';

// 火焰动画
const flameAnimation = keyframes`
  0%, 100% {
    transform: scale(1) rotate(-2deg);
  }
  25% {
    transform: scale(1.1) rotate(2deg);
  }
  50% {
    transform: scale(1.05) rotate(-1deg);
  }
  75% {
    transform: scale(1.15) rotate(1deg);
  }
`;

// 脉冲动画
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

/**
 * 连续天数计数器组件Props
 */
interface StreakCounterProps {
  /** 每日统计数据 */
  dailyStats: DailyStats[];
  /** 当前连续天数 */
  currentStreak: number;
  /** 最长连续天数 */
  maxStreak: number;
  /** 显示模式 */
  mode?: 'compact' | 'detailed' | 'circular';
  /** 是否显示动画 */
  showAnimation?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 学习连续天数显示和计算组件
 * 支持多种显示模式和动画效果
 */
export const StreakCounter: React.FC<StreakCounterProps> = ({
  dailyStats,
  currentStreak,
  maxStreak,
  mode = 'detailed',
  showAnimation = true,
  className,
}) => {
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const streakColor = useColorModeValue('orange.500', 'orange.300');
  const maxStreakColor = useColorModeValue('purple.500', 'purple.300');

  /**
   * 计算连续天数相关数据
   */
  const streakData = useMemo(() => {
    if (dailyStats.length === 0) {
      return {
        currentStreak: 0,
        isActiveToday: false,
        lastStudyDate: null,
        streakDates: [],
        nextMilestone: 7,
        progressToMilestone: 0,
      };
    }

    // 按日期排序
    const sortedStats = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // 检查今天是否学习
    const todayStats = sortedStats.find(stat => stat.date === todayStr);
    const isActiveToday = todayStats && todayStats.wordsStudied > 0;

    // 计算连续天数
    let streak = 0;
    let currentDate = new Date();
    const streakDates: string[] = [];

    // 如果今天没学习，从昨天开始计算
    if (!isActiveToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayStats = sortedStats.find(stat => stat.date === dateStr);
      
      if (dayStats && dayStats.wordsStudied > 0) {
        streak++;
        streakDates.push(dateStr);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // 计算下一个里程碑
    const milestones = [7, 14, 30, 60, 100, 365];
    const nextMilestone = milestones.find(m => m > currentStreak) || milestones[milestones.length - 1];
    const progressToMilestone = (currentStreak / nextMilestone) * 100;

    return {
      currentStreak: streak,
      isActiveToday,
      lastStudyDate: sortedStats[0]?.date || null,
      streakDates,
      nextMilestone,
      progressToMilestone: Math.min(progressToMilestone, 100),
    };
  }, [dailyStats, currentStreak]);

  /**
   * 获取连续天数等级
   */
  const getStreakLevel = (streak: number) => {
    if (streak >= 365) return { level: '年度学霸', color: 'purple', icon: TrophyIcon };
    if (streak >= 100) return { level: '百日坚持', color: 'gold', icon: StarIcon };
    if (streak >= 30) return { level: '月度达人', color: 'blue', icon: CalendarDaysIcon };
    if (streak >= 14) return { level: '两周坚持', color: 'green', icon: FireIcon };
    if (streak >= 7) return { level: '一周连击', color: 'orange', icon: FireIcon };
    return { level: '新手上路', color: 'gray', icon: FireIcon };
  };

  /**
   * 获取激励文案
   */
  const getMotivationText = (streak: number, isActiveToday: boolean) => {
    if (!isActiveToday && streak === 0) {
      return '开始您的学习之旅吧！';
    }
    if (!isActiveToday && streak > 0) {
      return '今天还没学习，继续保持连击！';
    }
    if (streak === 0) {
      return '很好！开始建立学习习惯';
    }
    if (streak < 7) {
      return `坚持得很好！还有 ${7 - streak} 天达到一周连击`;
    }
    if (streak < 30) {
      return `太棒了！还有 ${30 - streak} 天达到月度达人`;
    }
    return '您是真正的学习达人！';
  };

  /**
   * 触发动画
   */
  useEffect(() => {
    if (showAnimation && streakData.currentStreak > 0) {
      setAnimationTrigger(prev => prev + 1);
    }
  }, [streakData.currentStreak, showAnimation]);

  /**
   * 紧凑模式
   */
  if (mode === 'compact') {
    return (
      <HStack
        className={className}
        spacing={3}
        p={3}
        bg={bgColor}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
      >
        <Box
          color={streakColor}
          animation={showAnimation && streakData.currentStreak > 0 ? `${flameAnimation} 2s infinite` : undefined}
        >
          <FireIcon width={20} height={20} />
        </Box>
        <VStack spacing={0} align="start">
          <Text fontSize="lg" fontWeight="bold" color={streakColor}>
            {streakData.currentStreak}
          </Text>
          <Text fontSize="xs" color={textColor}>
            连续天数
          </Text>
        </VStack>
      </HStack>
    );
  }

  /**
   * 圆形模式
   */
  if (mode === 'circular') {
    const streakLevel = getStreakLevel(streakData.currentStreak);
    
    return (
      <Box className={className} textAlign="center">
        <CircularProgress
          value={streakData.progressToMilestone}
          color={`${streakLevel.color}.500`}
          size="120px"
          thickness="8px"
          trackColor={useColorModeValue('gray.100', 'gray.700')}
        >
          <CircularProgressLabel>
            <VStack spacing={0}>
              <Box
                color={streakColor}
                animation={showAnimation && streakData.currentStreak > 0 ? `${pulseAnimation} 2s infinite` : undefined}
              >
                <FireIcon width={24} height={24} />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color={streakColor}>
                {streakData.currentStreak}
              </Text>
              <Text fontSize="xs" color={textColor}>
                天
              </Text>
            </VStack>
          </CircularProgressLabel>
        </CircularProgress>
        
        <Text fontSize="sm" color={textColor} mt={2}>
          {streakLevel.level}
        </Text>
      </Box>
    );
  }

  /**
   * 详细模式
   */
  const streakLevel = getStreakLevel(streakData.currentStreak);
  const IconComponent = streakLevel.icon;

  return (
    <Box
      className={className}
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      p={6}
      shadow="sm"
    >
      <VStack spacing={6} align="stretch">
        {/* 标题 */}
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            学习连击
          </Text>
          <Badge
            colorScheme={streakLevel.color}
            variant="subtle"
            px={3}
            py={1}
            borderRadius="full"
          >
            {streakLevel.level}
          </Badge>
        </HStack>

        {/* 主要连击显示 */}
        <Flex align="center" justify="center" direction="column" py={4}>
          <HStack spacing={4} mb={4}>
            <Box
              color={streakColor}
              animation={showAnimation && streakData.currentStreak > 0 ? `${flameAnimation} 2s infinite` : undefined}
            >
              <FireIcon width={48} height={48} />
            </Box>
            <VStack spacing={0} align="center">
              <Text fontSize="4xl" fontWeight="bold" color={streakColor}>
                {streakData.currentStreak}
              </Text>
              <Text fontSize="md" color={textColor}>
                连续天数
              </Text>
            </VStack>
          </HStack>

          {/* 激励文案 */}
          <Text
            fontSize="sm"
            color={textColor}
            textAlign="center"
            fontStyle="italic"
          >
            {getMotivationText(streakData.currentStreak, streakData.isActiveToday)}
          </Text>
        </Flex>

        {/* 进度到下一个里程碑 */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color={textColor}>
              距离下一个里程碑
            </Text>
            <Text fontSize="sm" fontWeight="medium" color={streakColor}>
              {streakData.nextMilestone} 天
            </Text>
          </HStack>
          <Progress
            value={streakData.progressToMilestone}
            colorScheme={streakLevel.color}
            size="md"
            borderRadius="full"
            bg={useColorModeValue('gray.100', 'gray.700')}
          />
          <Text fontSize="xs" color={textColor} mt={1}>
            还需 {streakData.nextMilestone - streakData.currentStreak} 天
          </Text>
        </Box>

        {/* 统计对比 */}
        <HStack justify="space-between" pt={4} borderTop="1px solid" borderColor={borderColor}>
          <Tooltip label="当前连击天数">
            <VStack spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color={streakColor}>
                {streakData.currentStreak}
              </Text>
              <Text fontSize="xs" color={textColor}>
                当前连击
              </Text>
            </VStack>
          </Tooltip>

          <Tooltip label="历史最长连击">
            <VStack spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color={maxStreakColor}>
                {maxStreak}
              </Text>
              <Text fontSize="xs" color={textColor}>
                最长连击
              </Text>
            </VStack>
          </Tooltip>

          <Tooltip label="今天学习状态">
            <VStack spacing={1}>
              <Box
                w={4}
                h={4}
                borderRadius="full"
                bg={streakData.isActiveToday ? 'green.500' : 'gray.400'}
              />
              <Text fontSize="xs" color={textColor}>
                {streakData.isActiveToday ? '已学习' : '未学习'}
              </Text>
            </VStack>
          </Tooltip>
        </HStack>
      </VStack>
    </Box>
  );
};

export default StreakCounter;
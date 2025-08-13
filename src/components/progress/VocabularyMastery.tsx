import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  useColorModeValue,
  Flex,
  Tooltip,
  SimpleGrid,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Web3Category, DifficultyLevel } from '@/types/vocabulary';

/**
 * 词汇掌握数据
 */
interface VocabularyMasteryData {
  /** 总词汇数 */
  total: number;
  /** 已掌握词汇数 */
  mastered: number;
  /** 学习中词汇数 */
  learning: number;
  /** 未开始词汇数 */
  notStarted: number;
  /** 按分类统计 */
  byCategory: Record<Web3Category, {
    total: number;
    mastered: number;
    learning: number;
    notStarted: number;
  }>;
  /** 按难度统计 */
  byDifficulty: Record<DifficultyLevel, {
    total: number;
    mastered: number;
    learning: number;
    notStarted: number;
  }>;
}

/**
 * 词汇掌握组件Props
 */
interface VocabularyMasteryProps {
  /** 词汇掌握数据 */
  masteryData: VocabularyMasteryData;
  /** 显示模式 */
  mode?: 'overview' | 'detailed' | 'category' | 'difficulty';
  /** 是否显示动画 */
  showAnimation?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 掌握词汇量统计和可视化组件
 * 支持多维度数据展示和交互式图表
 */
export const VocabularyMastery: React.FC<VocabularyMasteryProps> = ({
  masteryData,
  mode = 'overview',
  showAnimation = true,
  className,
}) => {
  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  // 状态颜色
  const masteredColor = '#38A169'; // green
  const learningColor = '#3182CE'; // blue
  const notStartedColor = '#A0AEC0'; // gray

  /**
   * 计算掌握率
   */
  const masteryRate = useMemo(() => {
    return masteryData.total > 0 ? (masteryData.mastered / masteryData.total) * 100 : 0;
  }, [masteryData]);

  /**
   * 饼图数据
   */
  const pieData = useMemo(() => [
    { name: '已掌握', value: masteryData.mastered, color: masteredColor },
    { name: '学习中', value: masteryData.learning, color: learningColor },
    { name: '未开始', value: masteryData.notStarted, color: notStartedColor },
  ], [masteryData]);

  /**
   * 分类数据
   */
  const categoryData = useMemo(() => {
    const categoryNames = {
      [Web3Category.BLOCKCHAIN]: '区块链',
      [Web3Category.DEFI]: 'DeFi',
      [Web3Category.NFT]: 'NFT',
      [Web3Category.TRADING]: '交易',
      [Web3Category.PROTOCOL]: '协议',
      [Web3Category.CONSENSUS]: '共识',
      [Web3Category.SECURITY]: '安全',
      [Web3Category.GOVERNANCE]: '治理',
    };

    return Object.entries(masteryData.byCategory).map(([category, data]) => ({
      name: categoryNames[category as Web3Category] || category,
      category: category as Web3Category,
      total: data.total,
      mastered: data.mastered,
      learning: data.learning,
      notStarted: data.notStarted,
      masteryRate: data.total > 0 ? (data.mastered / data.total) * 100 : 0,
    }));
  }, [masteryData.byCategory]);

  /**
   * 难度数据
   */
  const difficultyData = useMemo(() => {
    const difficultyNames = {
      [DifficultyLevel.BEGINNER]: '初级',
      [DifficultyLevel.INTERMEDIATE]: '中级',
      [DifficultyLevel.ADVANCED]: '高级',
    };

    return Object.entries(masteryData.byDifficulty).map(([difficulty, data]) => ({
      name: difficultyNames[difficulty as DifficultyLevel] || difficulty,
      difficulty: difficulty as DifficultyLevel,
      total: data.total,
      mastered: data.mastered,
      learning: data.learning,
      notStarted: data.notStarted,
      masteryRate: data.total > 0 ? (data.mastered / data.total) * 100 : 0,
    }));
  }, [masteryData.byDifficulty]);

  /**
   * 获取掌握等级
   */
  const getMasteryLevel = (rate: number) => {
    if (rate >= 90) return { level: '大师', color: 'purple', icon: StarIcon };
    if (rate >= 75) return { level: '专家', color: 'blue', icon: AcademicCapIcon };
    if (rate >= 50) return { level: '熟练', color: 'green', icon: BookOpenIcon };
    if (rate >= 25) return { level: '入门', color: 'orange', icon: ChartBarIcon };
    return { level: '新手', color: 'gray', icon: BookOpenIcon };
  };

  /**
   * 自定义Tooltip
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          bg={bgColor}
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
          shadow="lg"
        >
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            {data.name}
          </Text>
          <VStack spacing={1} align="start">
            <Text fontSize="xs">总计: {data.total}</Text>
            <Text fontSize="xs" color={masteredColor}>已掌握: {data.mastered}</Text>
            <Text fontSize="xs" color={learningColor}>学习中: {data.learning}</Text>
            <Text fontSize="xs" color={notStartedColor}>未开始: {data.notStarted}</Text>
            <Text fontSize="xs">掌握率: {data.masteryRate.toFixed(1)}%</Text>
          </VStack>
        </Box>
      );
    }
    return null;
  };

  /**
   * 概览模式
   */
  if (mode === 'overview') {
    const masteryLevel = getMasteryLevel(masteryRate);
    const IconComponent = masteryLevel.icon;

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
              词汇掌握情况
            </Text>
            <Badge
              colorScheme={masteryLevel.color}
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
            >
              {masteryLevel.level}
            </Badge>
          </HStack>

          {/* 主要统计 */}
          <Flex align="center" justify="center" direction="column" py={4}>
            <HStack spacing={4} mb={4}>
              <Box color={`${masteryLevel.color}.500`}>
                <IconComponent width={48} height={48} />
              </Box>
              <VStack spacing={0} align="center">
                <Text fontSize="4xl" fontWeight="bold" color={masteredColor}>
                  {masteryData.mastered}
                </Text>
                <Text fontSize="md" color={textColor}>
                  / {masteryData.total} 词汇
                </Text>
              </VStack>
            </HStack>

            <Text fontSize="2xl" fontWeight="bold" color={masteredColor} mb={2}>
              {masteryRate.toFixed(1)}%
            </Text>
            <Text fontSize="sm" color={textColor}>
              掌握率
            </Text>
          </Flex>

          {/* 进度条 */}
          <Box>
            <Progress
              value={masteryRate}
              colorScheme="green"
              size="lg"
              borderRadius="full"
              bg={useColorModeValue('gray.100', 'gray.700')}
            />
            <HStack justify="space-between" mt={2}>
              <Text fontSize="xs" color={textColor}>
                0%
              </Text>
              <Text fontSize="xs" color={textColor}>
                100%
              </Text>
            </HStack>
          </Box>

          {/* 详细统计 */}
          <SimpleGrid columns={3} spacing={4}>
            <VStack spacing={1}>
              <Text fontSize="xl" fontWeight="bold" color={masteredColor}>
                {masteryData.mastered}
              </Text>
              <Text fontSize="xs" color={textColor}>
                已掌握
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="xl" fontWeight="bold" color={learningColor}>
                {masteryData.learning}
              </Text>
              <Text fontSize="xs" color={textColor}>
                学习中
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="xl" fontWeight="bold" color={notStartedColor}>
                {masteryData.notStarted}
              </Text>
              <Text fontSize="xs" color={textColor}>
                未开始
              </Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Box>
    );
  }

  /**
   * 详细模式
   */
  if (mode === 'detailed') {
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
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            词汇掌握详情
          </Text>

          <HStack spacing={6} align="start">
            {/* 饼图 */}
            <Box flex="1">
              <Text fontSize="md" fontWeight="medium" mb={4} textAlign="center">
                掌握分布
              </Text>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* 统计列表 */}
            <VStack flex="1" spacing={4} align="stretch">
              {pieData.map((item, index) => (
                <HStack key={index} justify="space-between" p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                  <HStack spacing={3}>
                    <Box w={4} h={4} borderRadius="full" bg={item.color} />
                    <Text fontSize="sm" fontWeight="medium">
                      {item.name}
                    </Text>
                  </HStack>
                  <VStack spacing={0} align="end">
                    <Text fontSize="lg" fontWeight="bold" color={item.color}>
                      {item.value}
                    </Text>
                    <Text fontSize="xs" color={textColor}>
                      {masteryData.total > 0 ? ((item.value / masteryData.total) * 100).toFixed(1) : 0}%
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </HStack>
        </VStack>
      </Box>
    );
  }

  /**
   * 分类模式
   */
  if (mode === 'category') {
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
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            分类掌握情况
          </Text>

          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                <XAxis dataKey="name" stroke={textColor} fontSize={12} />
                <YAxis stroke={textColor} fontSize={12} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="mastered" fill={masteredColor} name="已掌握" />
                <Bar dataKey="learning" fill={learningColor} name="学习中" />
                <Bar dataKey="notStarted" fill={notStartedColor} name="未开始" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* 分类详情 */}
          <VStack spacing={3} align="stretch">
            {categoryData.map((item, index) => (
              <Box key={index} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    {item.name}
                  </Text>
                  <Text fontSize="sm" color={masteredColor} fontWeight="bold">
                    {item.masteryRate.toFixed(1)}%
                  </Text>
                </HStack>
                <Progress
                  value={item.masteryRate}
                  colorScheme="green"
                  size="sm"
                  borderRadius="full"
                />
                <HStack justify="space-between" mt={1} fontSize="xs" color={textColor}>
                  <Text>已掌握: {item.mastered}</Text>
                  <Text>总计: {item.total}</Text>
                </HStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      </Box>
    );
  }

  /**
   * 难度模式
   */
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
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          难度掌握情况
        </Text>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {difficultyData.map((item, index) => {
            const difficultyColors = {
              [DifficultyLevel.BEGINNER]: 'green',
              [DifficultyLevel.INTERMEDIATE]: 'orange',
              [DifficultyLevel.ADVANCED]: 'red',
            };
            const color = difficultyColors[item.difficulty as DifficultyLevel] || 'gray';

            return (
              <Box key={index} textAlign="center">
                <CircularProgress
                  value={item.masteryRate}
                  color={`${color}.500`}
                  size="120px"
                  thickness="8px"
                  trackColor={useColorModeValue('gray.100', 'gray.700')}
                >
                  <CircularProgressLabel>
                    <VStack spacing={0}>
                      <Text fontSize="lg" fontWeight="bold" color={`${color}.500`}>
                        {item.mastered}
                      </Text>
                      <Text fontSize="xs" color={textColor}>
                        / {item.total}
                      </Text>
                    </VStack>
                  </CircularProgressLabel>
                </CircularProgress>
                
                <Text fontSize="md" fontWeight="medium" mt={3} mb={1}>
                  {item.name}
                </Text>
                <Text fontSize="sm" color={`${color}.500`} fontWeight="bold">
                  {item.masteryRate.toFixed(1)}%
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default VocabularyMastery;
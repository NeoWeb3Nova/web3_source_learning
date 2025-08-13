import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Badge,
  useColorModeValue,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DailyStats } from '@/types/progress';

/**
 * 图表类型
 */
type ChartType = 'line' | 'area' | 'bar' | 'pie';

/**
 * 时间范围
 */
type TimeRange = '7days' | '30days' | '90days';

/**
 * 每日统计图表组件Props
 */
interface DailyStatsChartProps {
  /** 每日统计数据 */
  dailyStats: DailyStats[];
  /** 图表类型 */
  chartType?: ChartType;
  /** 时间范围 */
  timeRange?: TimeRange;
  /** 是否显示对比数据 */
  showComparison?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 每日学习统计图表组件
 * 支持多种图表类型和时间范围
 */
export const DailyStatsChart: React.FC<DailyStatsChartProps> = ({
  dailyStats,
  chartType = 'line',
  timeRange = '7days',
  showComparison = true,
  className,
}) => {
  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const primaryColor = useColorModeValue('#3182CE', '#63B3ED');
  const secondaryColor = useColorModeValue('#38A169', '#68D391');
  const accentColor = useColorModeValue('#D69E2E', '#F6E05E');

  /**
   * 过滤数据根据时间范围
   */
  const filteredData = useMemo(() => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const cutoffDate = subDays(new Date(), days);
    
    return dailyStats
      .filter(stat => parseISO(stat.date) >= cutoffDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(stat => ({
        ...stat,
        formattedDate: format(parseISO(stat.date), 'MM/dd', { locale: zhCN }),
        accuracy: stat.totalAnswers > 0 ? (stat.correctAnswers / stat.totalAnswers) * 100 : 0,
      }));
  }, [dailyStats, timeRange]);

  /**
   * 计算统计摘要
   */
  const summary = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalWords: 0,
        totalTime: 0,
        averageAccuracy: 0,
        totalSessions: 0,
        trend: 0,
      };
    }

    const totalWords = filteredData.reduce((sum, stat) => sum + stat.wordsStudied, 0);
    const totalTime = filteredData.reduce((sum, stat) => sum + stat.studyTimeMinutes, 0);
    const totalSessions = filteredData.reduce((sum, stat) => sum + stat.practiceSessions, 0);
    const totalCorrect = filteredData.reduce((sum, stat) => sum + stat.correctAnswers, 0);
    const totalAnswers = filteredData.reduce((sum, stat) => sum + stat.totalAnswers, 0);
    const averageAccuracy = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;

    // 计算趋势（最近3天vs前3天）
    const recentData = filteredData.slice(-3);
    const previousData = filteredData.slice(-6, -3);
    const recentAvg = recentData.length > 0 
      ? recentData.reduce((sum, stat) => sum + stat.wordsStudied, 0) / recentData.length 
      : 0;
    const previousAvg = previousData.length > 0 
      ? previousData.reduce((sum, stat) => sum + stat.wordsStudied, 0) / previousData.length 
      : 0;
    const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    return {
      totalWords,
      totalTime,
      averageAccuracy,
      totalSessions,
      trend,
    };
  }, [filteredData]);

  /**
   * 饼图数据
   */
  const pieData = useMemo(() => [
    { name: '正确答案', value: summary.totalWords * (summary.averageAccuracy / 100), color: secondaryColor },
    { name: '错误答案', value: summary.totalWords * (1 - summary.averageAccuracy / 100), color: '#F56565' },
  ], [summary, secondaryColor]);

  /**
   * 自定义Tooltip
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
            {label}
          </Text>
          {payload.map((entry: any, index: number) => (
            <Text key={index} fontSize="sm" color={entry.color}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'accuracy' && '%'}
            </Text>
          ))}
        </Box>
      );
    }
    return null;
  };

  /**
   * 渲染图表
   */
  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
            <XAxis dataKey="formattedDate" stroke={textColor} fontSize={12} />
            <YAxis stroke={textColor} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="wordsStudied"
              stroke={primaryColor}
              fill={primaryColor}
              fillOpacity={0.3}
              name="学习单词数"
            />
            <Area
              type="monotone"
              dataKey="studyTimeMinutes"
              stroke={secondaryColor}
              fill={secondaryColor}
              fillOpacity={0.3}
              name="学习时间(分钟)"
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
            <XAxis dataKey="formattedDate" stroke={textColor} fontSize={12} />
            <YAxis stroke={textColor} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="wordsStudied" fill={primaryColor} name="学习单词数" />
            <Bar dataKey="practiceSessions" fill={secondaryColor} name="练习次数" />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart width={300} height={300}>
            <Pie
              data={pieData}
              cx={150}
              cy={150}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
            <XAxis dataKey="formattedDate" stroke={textColor} fontSize={12} />
            <YAxis stroke={textColor} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="wordsStudied"
              stroke={primaryColor}
              strokeWidth={2}
              dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
              name="学习单词数"
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke={accentColor}
              strokeWidth={2}
              dot={{ fill: accentColor, strokeWidth: 2, r: 4 }}
              name="正确率(%)"
            />
          </LineChart>
        );
    }
  };

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
        {/* 标题和控制 */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            学习统计图表
          </Text>
          
          <HStack spacing={3}>
            <Select
              size="sm"
              value={timeRange}
              onChange={(e) => {
                // 这里应该通过props回调来更新timeRange
                console.log('Time range changed:', e.target.value);
              }}
              w="120px"
            >
              <option value="7days">最近7天</option>
              <option value="30days">最近30天</option>
              <option value="90days">最近90天</option>
            </Select>
            
            <Select
              size="sm"
              value={chartType}
              onChange={(e) => {
                // 这里应该通过props回调来更新chartType
                console.log('Chart type changed:', e.target.value);
              }}
              w="100px"
            >
              <option value="line">折线图</option>
              <option value="area">面积图</option>
              <option value="bar">柱状图</option>
              <option value="pie">饼图</option>
            </Select>
          </HStack>
        </Flex>

        {/* 统计摘要 */}
        {showComparison && (
          <Flex wrap="wrap" gap={4}>
            <Stat flex="1" minW="120px">
              <StatLabel fontSize="sm">总学习单词</StatLabel>
              <StatNumber fontSize="2xl" color={primaryColor}>
                {summary.totalWords}
              </StatNumber>
              <StatHelpText>
                <StatArrow type={summary.trend >= 0 ? 'increase' : 'decrease'} />
                {Math.abs(summary.trend).toFixed(1)}%
              </StatHelpText>
            </Stat>

            <Stat flex="1" minW="120px">
              <StatLabel fontSize="sm">学习时间</StatLabel>
              <StatNumber fontSize="2xl" color={secondaryColor}>
                {summary.totalTime}
              </StatNumber>
              <StatHelpText>分钟</StatHelpText>
            </Stat>

            <Stat flex="1" minW="120px">
              <StatLabel fontSize="sm">平均正确率</StatLabel>
              <StatNumber fontSize="2xl" color={accentColor}>
                {summary.averageAccuracy.toFixed(1)}%
              </StatNumber>
              <StatHelpText>
                <Badge colorScheme={summary.averageAccuracy >= 80 ? 'green' : 'orange'}>
                  {summary.averageAccuracy >= 80 ? '优秀' : '需提升'}
                </Badge>
              </StatHelpText>
            </Stat>

            <Stat flex="1" minW="120px">
              <StatLabel fontSize="sm">练习次数</StatLabel>
              <StatNumber fontSize="2xl" color="#9F7AEA">
                {summary.totalSessions}
              </StatNumber>
              <StatHelpText>次</StatHelpText>
            </Stat>
          </Flex>
        )}

        {/* 图表区域 */}
        <Box h="300px" w="full">
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            <Flex
              h="full"
              align="center"
              justify="center"
              direction="column"
              color="gray.500"
            >
              <Text fontSize="lg" mb={2}>
                暂无数据
              </Text>
              <Text fontSize="sm">
                开始学习后这里将显示您的学习统计
              </Text>
            </Flex>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default DailyStatsChart;
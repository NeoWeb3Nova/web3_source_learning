import React, { useMemo, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Button,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  CalendarDaysIcon,
  ClockIcon,
  BookOpenIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO, isWithinInterval, subDays, startOfDay, endOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { StudySession, DailyStats } from '@/types/progress';

/**
 * 时间范围过滤器
 */
type TimeFilter = 'all' | '7days' | '30days' | '90days';

/**
 * 会话类型过滤器
 */
type SessionTypeFilter = 'all' | 'vocabulary' | 'practice';

/**
 * 学习历史组件Props
 */
interface StudyHistoryProps {
  /** 学习会话历史 */
  studySessions: StudySession[];
  /** 每日统计数据 */
  dailyStats: DailyStats[];
  /** 显示模式 */
  mode?: 'table' | 'timeline' | 'summary';
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 学习历史记录和数据分析组件
 * 支持多种视图模式和数据过滤
 */
export const StudyHistory: React.FC<StudyHistoryProps> = ({
  studySessions,
  dailyStats,
  mode = 'table',
  showDetails = true,
  className,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30days');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<SessionTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  /**
   * 过滤学习会话
   */
  const filteredSessions = useMemo(() => {
    let filtered = [...studySessions];

    // 时间过滤
    if (timeFilter !== 'all') {
      const days = timeFilter === '7days' ? 7 : timeFilter === '30days' ? 30 : 90;
      const cutoffDate = subDays(new Date(), days);
      filtered = filtered.filter(session => session.startTime >= cutoffDate);
    }

    // 类型过滤
    if (sessionTypeFilter !== 'all') {
      filtered = filtered.filter(session => session.sessionType === sessionTypeFilter);
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.wordsStudied.some(word => word.toLowerCase().includes(query))
      );
    }

    // 按时间倒序排列
    return filtered.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [studySessions, timeFilter, sessionTypeFilter, searchQuery]);

  /**
   * 计算统计摘要
   */
  const summary = useMemo(() => {
    const totalSessions = filteredSessions.length;
    const totalDuration = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalWords = filteredSessions.reduce((sum, session) => sum + session.wordsStudied.length, 0);
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const averageWords = totalSessions > 0 ? totalWords / totalSessions : 0;

    // 按类型统计
    const vocabularySessions = filteredSessions.filter(s => s.sessionType === 'vocabulary').length;
    const practiceSessions = filteredSessions.filter(s => s.sessionType === 'practice').length;

    return {
      totalSessions,
      totalDuration,
      totalWords,
      averageDuration,
      averageWords,
      vocabularySessions,
      practiceSessions,
    };
  }, [filteredSessions]);

  /**
   * 格式化持续时间
   */
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * 获取会话类型颜色
   */
  const getSessionTypeColor = (type: 'vocabulary' | 'practice') => {
    return type === 'vocabulary' ? 'blue' : 'green';
  };

  /**
   * 获取会话类型图标
   */
  const getSessionTypeIcon = (type: 'vocabulary' | 'practice') => {
    return type === 'vocabulary' ? BookOpenIcon : ChartBarIcon;
  };

  /**
   * 表格模式
   */
  if (mode === 'table') {
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
          {/* 标题和过滤器 */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              学习历史
            </Text>
            
            <HStack spacing={3} wrap="wrap">
              {/* 搜索框 */}
              <InputGroup size="sm" w="200px">
                <InputLeftElement pointerEvents="none">
                  <MagnifyingGlassIcon width={16} height={16} />
                </InputLeftElement>
                <Input
                  placeholder="搜索单词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              {/* 时间过滤 */}
              <Select
                size="sm"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                w="120px"
              >
                <option value="all">全部时间</option>
                <option value="7days">最近7天</option>
                <option value="30days">最近30天</option>
                <option value="90days">最近90天</option>
              </Select>

              {/* 类型过滤 */}
              <Select
                size="sm"
                value={sessionTypeFilter}
                onChange={(e) => setSessionTypeFilter(e.target.value as SessionTypeFilter)}
                w="120px"
              >
                <option value="all">全部类型</option>
                <option value="vocabulary">词汇学习</option>
                <option value="practice">练习测试</option>
              </Select>
            </HStack>
          </Flex>

          {/* 统计摘要 */}
          <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <HStack spacing={8} wrap="wrap">
              <VStack spacing={0} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {summary.totalSessions}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  总会话数
                </Text>
              </VStack>

              <VStack spacing={0} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {Math.floor(summary.totalDuration / 60)}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  总时长(分钟)
                </Text>
              </VStack>

              <VStack spacing={0} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {summary.totalWords}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  学习单词数
                </Text>
              </VStack>

              <VStack spacing={0} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {summary.averageWords.toFixed(1)}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  平均单词/会话
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* 会话表格 */}
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>时间</Th>
                  <Th>类型</Th>
                  <Th>持续时间</Th>
                  <Th>学习单词</Th>
                  {showDetails && <Th>详情</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {filteredSessions.map((session) => {
                  const IconComponent = getSessionTypeIcon(session.sessionType);
                  const typeColor = getSessionTypeColor(session.sessionType);

                  return (
                    <Tr key={session.id}>
                      <Td>
                        <VStack spacing={0} align="start">
                          <Text fontSize="sm" fontWeight="medium">
                            {format(session.startTime, 'MM/dd HH:mm', { locale: zhCN })}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {format(session.startTime, 'yyyy年', { locale: zhCN })}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconComponent width={16} height={16} />
                          <Badge colorScheme={typeColor} variant="subtle">
                            {session.sessionType === 'vocabulary' ? '词汇学习' : '练习测试'}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <ClockIcon width={14} height={14} />
                          <Text fontSize="sm">
                            {formatDuration(session.duration)}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium">
                          {session.wordsStudied.length} 个
                        </Text>
                      </Td>
                      {showDetails && (
                        <Td>
                          <Tooltip
                            label={
                              <VStack spacing={1} align="start" maxW="200px">
                                <Text fontSize="xs" fontWeight="bold">学习的单词:</Text>
                                {session.wordsStudied.slice(0, 5).map((word, index) => (
                                  <Text key={index} fontSize="xs">• {word}</Text>
                                ))}
                                {session.wordsStudied.length > 5 && (
                                  <Text fontSize="xs" color="gray.400">
                                    ...还有 {session.wordsStudied.length - 5} 个
                                  </Text>
                                )}
                              </VStack>
                            }
                            placement="left"
                          >
                            <Button size="xs" variant="ghost">
                              查看详情
                            </Button>
                          </Tooltip>
                        </Td>
                      )}
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>

          {/* 空状态 */}
          {filteredSessions.length === 0 && (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={12}
              color="gray.500"
            >
              <CalendarDaysIcon width={48} height={48} />
              <Text fontSize="lg" mt={4} mb={2}>
                暂无学习记录
              </Text>
              <Text fontSize="sm" textAlign="center">
                {searchQuery || timeFilter !== 'all' || sessionTypeFilter !== 'all'
                  ? '尝试调整筛选条件'
                  : '开始学习后这里将显示您的学习历史'}
              </Text>
            </Flex>
          )}
        </VStack>
      </Box>
    );
  }

  /**
   * 时间线模式
   */
  if (mode === 'timeline') {
    // 按日期分组会话
    const sessionsByDate = useMemo(() => {
      const groups: Record<string, StudySession[]> = {};
      filteredSessions.forEach(session => {
        const dateKey = format(session.startTime, 'yyyy-MM-dd');
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(session);
      });
      return groups;
    }, [filteredSessions]);

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
            学习时间线
          </Text>

          <VStack spacing={4} align="stretch">
            {Object.entries(sessionsByDate)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, sessions]) => (
                <Box key={date}>
                  <HStack spacing={3} mb={3}>
                    <CalendarDaysIcon width={20} height={20} />
                    <Text fontSize="md" fontWeight="medium" color={textColor}>
                      {format(parseISO(date), 'MM月dd日 EEEE', { locale: zhCN })}
                    </Text>
                    <Badge colorScheme="blue" variant="subtle">
                      {sessions.length} 个会话
                    </Badge>
                  </HStack>

                  <VStack spacing={2} align="stretch" pl={8}>
                    {sessions.map((session, index) => {
                      const IconComponent = getSessionTypeIcon(session.sessionType);
                      const typeColor = getSessionTypeColor(session.sessionType);

                      return (
                        <Box
                          key={session.id}
                          p={3}
                          bg={useColorModeValue('gray.50', 'gray.700')}
                          borderRadius="md"
                          borderLeft="3px solid"
                          borderLeftColor={`${typeColor}.500`}
                        >
                          <HStack justify="space-between" align="start">
                            <VStack spacing={1} align="start" flex="1">
                              <HStack spacing={2}>
                                <IconComponent width={16} height={16} />
                                <Text fontSize="sm" fontWeight="medium">
                                  {session.sessionType === 'vocabulary' ? '词汇学习' : '练习测试'}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {format(session.startTime, 'HH:mm')}
                                </Text>
                              </HStack>
                              <Text fontSize="xs" color={textColor}>
                                学习了 {session.wordsStudied.length} 个单词，
                                用时 {formatDuration(session.duration)}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      );
                    })}
                  </VStack>

                  {Object.keys(sessionsByDate).indexOf(date) < Object.keys(sessionsByDate).length - 1 && (
                    <Divider mt={4} />
                  )}
                </Box>
              ))}
          </VStack>

          {Object.keys(sessionsByDate).length === 0 && (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={12}
              color="gray.500"
            >
              <CalendarDaysIcon width={48} height={48} />
              <Text fontSize="lg" mt={4} mb={2}>
                暂无学习记录
              </Text>
              <Text fontSize="sm">
                开始学习后这里将显示您的学习时间线
              </Text>
            </Flex>
          )}
        </VStack>
      </Box>
    );
  }

  // 默认返回摘要模式
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
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          学习摘要
        </Text>
        
        <HStack spacing={6} wrap="wrap">
          <VStack spacing={1} align="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {summary.totalSessions}
            </Text>
            <Text fontSize="sm" color={textColor}>
              总会话数
            </Text>
          </VStack>

          <VStack spacing={1} align="center">
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {Math.floor(summary.totalDuration / 3600)}h {Math.floor((summary.totalDuration % 3600) / 60)}m
            </Text>
            <Text fontSize="sm" color={textColor}>
              总学习时长
            </Text>
          </VStack>

          <VStack spacing={1} align="center">
            <Text fontSize="2xl" fontWeight="bold" color="purple.500">
              {summary.totalWords}
            </Text>
            <Text fontSize="sm" color={textColor}>
              学习单词数
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default StudyHistory;
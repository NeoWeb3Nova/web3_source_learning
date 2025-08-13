import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Collapse,
  Button,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { getMemoryUsage, performanceMark } from '../../utils/performance';
import { optimizedAudioManager } from '../../services/optimizedAudioManager';

interface PerformanceStats {
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  audioCache: {
    itemCount: number;
    totalSize: number;
    maxSize: number;
    hitRate: number;
  };
  renderCount: number;
  loadTime: number;
}

const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    audioCache: { itemCount: 0, totalSize: 0, maxSize: 0, hitRate: 0 },
    renderCount: 0,
    loadTime: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // 更新渲染计数
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // 定期更新性能统计
  useEffect(() => {
    const updateStats = () => {
      const memory = getMemoryUsage();
      const audioCache = optimizedAudioManager.getCacheStats();
      const loadTime = performance.now();

      setStats({
        memory: memory || undefined,
        audioCache,
        renderCount,
        loadTime,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000); // 每2秒更新

    return () => clearInterval(interval);
  }, [renderCount]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getPerformanceLevel = (percentage: number): {
    color: string;
    label: string;
  } => {
    if (percentage < 50) return { color: 'green', label: '良好' };
    if (percentage < 80) return { color: 'yellow', label: '一般' };
    return { color: 'red', label: '需要优化' };
  };

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      zIndex={9999}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={3}
      minW="280px"
      boxShadow="lg"
    >
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" fontWeight="bold">
            性能监控
          </Text>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '收起' : '展开'}
          </Button>
        </HStack>

        {/* 基础信息 */}
        <HStack spacing={4}>
          <Badge colorScheme="blue" fontSize="xs">
            渲染: {renderCount}
          </Badge>
          <Badge colorScheme="purple" fontSize="xs">
            加载: {formatTime(stats.loadTime)}
          </Badge>
        </HStack>

        <Collapse in={isExpanded}>
          <VStack spacing={4} align="stretch">
            {/* 内存使用 */}
            {stats.memory && (
              <Box>
                <Text fontSize="xs" fontWeight="semibold" mb={2}>
                  内存使用
                </Text>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="xs">
                      {formatBytes(stats.memory.used)} / {formatBytes(stats.memory.total)}
                    </Text>
                    <Badge
                      colorScheme={getPerformanceLevel(stats.memory.percentage).color}
                      fontSize="xs"
                    >
                      {getPerformanceLevel(stats.memory.percentage).label}
                    </Badge>
                  </HStack>
                  <Progress
                    value={stats.memory.percentage}
                    size="sm"
                    colorScheme={getPerformanceLevel(stats.memory.percentage).color}
                  />
                </VStack>
              </Box>
            )}

            {/* 音频缓存 */}
            <Box>
              <Text fontSize="xs" fontWeight="semibold" mb={2}>
                音频缓存
              </Text>
              <Grid templateColumns="1fr 1fr" gap={2}>
                <GridItem>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">缓存项</StatLabel>
                    <StatNumber fontSize="sm">{stats.audioCache.itemCount}</StatNumber>
                  </Stat>
                </GridItem>
                <GridItem>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">大小</StatLabel>
                    <StatNumber fontSize="sm">
                      {formatBytes(stats.audioCache.totalSize)}
                    </StatNumber>
                    <StatHelpText fontSize="xs" mt={0}>
                      / {formatBytes(stats.audioCache.maxSize)}
                    </StatHelpText>
                  </Stat>
                </GridItem>
              </Grid>
              <Progress
                value={(stats.audioCache.totalSize / stats.audioCache.maxSize) * 100}
                size="sm"
                colorScheme="blue"
                mt={2}
              />
            </Box>

            {/* 性能建议 */}
            <Box>
              <Text fontSize="xs" fontWeight="semibold" mb={2}>
                性能建议
              </Text>
              <VStack spacing={1} align="stretch">
                {stats.memory && stats.memory.percentage > 80 && (
                  <Text fontSize="xs" color="red.500">
                    • 内存使用率过高，建议清理缓存
                  </Text>
                )}
                {renderCount > 10 && (
                  <Text fontSize="xs" color="yellow.500">
                    • 组件重渲染次数较多，检查依赖项
                  </Text>
                )}
                {stats.audioCache.itemCount > 50 && (
                  <Text fontSize="xs" color="blue.500">
                    • 音频缓存项较多，考虑清理旧缓存
                  </Text>
                )}
                {stats.loadTime > 3000 && (
                  <Text fontSize="xs" color="orange.500">
                    • 页面加载时间较长，考虑代码分割
                  </Text>
                )}
              </VStack>
            </Box>

            {/* 操作按钮 */}
            <HStack spacing={2}>
              <Button
                size="xs"
                colorScheme="red"
                variant="outline"
                onClick={() => {
                  optimizedAudioManager.clearCache();
                  if (window.gc) {
                    window.gc();
                  }
                }}
              >
                清理缓存
              </Button>
              <Button
                size="xs"
                colorScheme="blue"
                variant="outline"
                onClick={() => {
                  console.log('Performance Stats:', stats);
                  console.log('Performance Entries:', performance.getEntries());
                }}
              >
                导出日志
              </Button>
            </HStack>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};

export default PerformanceMonitor;
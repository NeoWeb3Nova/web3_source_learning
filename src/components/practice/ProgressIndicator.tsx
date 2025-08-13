import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Badge,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ProgressIndicatorProps } from './types';

/**
 * 进度指示器组件
 * 支持多种显示模式和详细的进度信息
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  answered = 0,
  correct = 0,
  mode = 'simple',
  showPercentage = true,
}) => {
  // 计算百分比
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;
  const accuracyPercentage = answered > 0 ? (correct / answered) * 100 : 0;

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  /**
   * 简单模式
   */
  if (mode === 'simple') {
    return (
      <Box w="full" maxW="400px" mx="auto">
        <VStack spacing={3}>
          <HStack justify="space-between" w="full">
            <Text fontSize="sm" fontWeight="medium">
              进度
            </Text>
            {showPercentage && (
              <Text fontSize="sm" color="gray.600">
                {Math.round(progressPercentage)}%
              </Text>
            )}
          </HStack>
          
          <Progress
            value={progressPercentage}
            colorScheme="primary"
            size="lg"
            w="full"
            borderRadius="full"
            bg={useColorModeValue('gray.100', 'gray.700')}
          />
          
          <Text fontSize="sm" color="gray.600">
            {current} / {total} 题
          </Text>
        </VStack>
      </Box>
    );
  }

  /**
   * 圆形模式
   */
  if (mode === 'circular') {
    return (
      <Box textAlign="center">
        <CircularProgress
          value={progressPercentage}
          color="primary.500"
          size="120px"
          thickness="8px"
        >
          <CircularProgressLabel>
            <VStack spacing={0}>
              <Text fontSize="lg" fontWeight="bold">
                {current}
              </Text>
              <Text fontSize="xs" color="gray.600">
                / {total}
              </Text>
              {showPercentage && (
                <Text fontSize="xs" color="gray.600">
                  {Math.round(progressPercentage)}%
                </Text>
              )}
            </VStack>
          </CircularProgressLabel>
        </CircularProgress>
      </Box>
    );
  }

  /**
   * 详细模式
   */
  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      w="full"
      maxW="500px"
      mx="auto"
    >
      <VStack spacing={4}>
        {/* 标题 */}
        <HStack justify="space-between" w="full">
          <Text fontSize="md" fontWeight="semibold">
            答题进度
          </Text>
          <Badge colorScheme="primary" variant="subtle">
            {current} / {total}
          </Badge>
        </HStack>

        {/* 主进度条 */}
        <Box w="full">
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.600">
              整体进度
            </Text>
            {showPercentage && (
              <Text fontSize="sm" fontWeight="medium">
                {Math.round(progressPercentage)}%
              </Text>
            )}
          </HStack>
          <Progress
            value={progressPercentage}
            colorScheme="primary"
            size="md"
            borderRadius="full"
            bg={useColorModeValue('gray.100', 'gray.700')}
          />
        </Box>

        {/* 统计信息 */}
        {answered > 0 && (
          <Flex justify="space-between" w="full" gap={4}>
            {/* 已答题数 */}
            <Box flex="1" textAlign="center">
              <Text fontSize="lg" fontWeight="bold" color="blue.500">
                {answered}
              </Text>
              <Text fontSize="xs" color="gray.600">
                已答题
              </Text>
            </Box>

            {/* 正确题数 */}
            <Box flex="1" textAlign="center">
              <HStack justify="center" spacing={1}>
                <CheckIcon width={16} height={16} color="green" />
                <Text fontSize="lg" fontWeight="bold" color="green.500">
                  {correct}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.600">
                正确
              </Text>
            </Box>

            {/* 错误题数 */}
            <Box flex="1" textAlign="center">
              <HStack justify="center" spacing={1}>
                <XMarkIcon width={16} height={16} color="red" />
                <Text fontSize="lg" fontWeight="bold" color="red.500">
                  {answered - correct}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.600">
                错误
              </Text>
            </Box>

            {/* 准确率 */}
            <Box flex="1" textAlign="center">
              <Text fontSize="lg" fontWeight="bold" color="purple.500">
                {Math.round(accuracyPercentage)}%
              </Text>
              <Text fontSize="xs" color="gray.600">
                准确率
              </Text>
            </Box>
          </Flex>
        )}

        {/* 准确率进度条 */}
        {answered > 0 && (
          <Box w="full">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.600">
                准确率
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="purple.600">
                {Math.round(accuracyPercentage)}%
              </Text>
            </HStack>
            <Progress
              value={accuracyPercentage}
              colorScheme="purple"
              size="sm"
              borderRadius="full"
              bg={useColorModeValue('gray.100', 'gray.700')}
            />
          </Box>
        )}

        {/* 剩余题数 */}
        {current < total && (
          <Box textAlign="center">
            <Text fontSize="sm" color="gray.600">
              还剩 <Text as="span" fontWeight="bold" color="primary.600">{total - current}</Text> 题
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ProgressIndicator;
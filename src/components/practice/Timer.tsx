import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  CircularProgress,
  CircularProgressLabel,
  Badge,
  useColorModeValue,
  keyframes,
} from '@chakra-ui/react';
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { TimerProps } from './types';

// 警告动画
const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-2px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(2px);
  }
`;

/**
 * 计时器组件
 * 支持倒计时、暂停、警告状态和多种显示模式
 */
export const Timer: React.FC<TimerProps> = ({
  duration,
  onTimeUp,
  isPaused = false,
  showWarning = true,
  warningThreshold = 30,
  variant = 'default',
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  /**
   * 格式化时间显示
   */
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  /**
   * 获取进度百分比
   */
  const getProgressPercentage = useCallback(() => {
    return duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  }, [duration, timeLeft]);

  /**
   * 获取颜色方案
   */
  const getColorScheme = useCallback(() => {
    if (isWarning) return 'red';
    if (timeLeft <= warningThreshold) return 'orange';
    return 'primary';
  }, [isWarning, timeLeft, warningThreshold]);

  /**
   * 启动计时器
   */
  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onTimeUp]);

  /**
   * 停止计时器
   */
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * 重置计时器
   */
  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(duration);
    setIsWarning(false);
  }, [duration, stopTimer]);

  // 处理暂停状态
  useEffect(() => {
    if (isPaused) {
      stopTimer();
    } else if (timeLeft > 0) {
      startTimer();
    }

    return () => stopTimer();
  }, [isPaused, timeLeft, startTimer, stopTimer]);

  // 处理警告状态
  useEffect(() => {
    if (showWarning && timeLeft <= warningThreshold && timeLeft > 0) {
      setIsWarning(true);
    } else {
      setIsWarning(false);
    }
  }, [timeLeft, warningThreshold, showWarning]);

  // 时间到达时的处理
  useEffect(() => {
    if (timeLeft === 0) {
      stopTimer();
    }
  }, [timeLeft, stopTimer]);

  // 组件卸载时清理
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  /**
   * 紧凑模式
   */
  if (variant === 'compact') {
    return (
      <HStack
        spacing={2}
        p={2}
        bg={bgColor}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        animation={isWarning ? `${pulse} 1s infinite` : undefined}
      >
        <ClockIcon
          width={16}
          height={16}
          color={isWarning ? 'red' : 'gray'}
        />
        <Text
          fontSize="sm"
          fontWeight="medium"
          color={isWarning ? 'red.500' : 'gray.600'}
        >
          {formatTime(timeLeft)}
        </Text>
        {isWarning && (
          <ExclamationTriangleIcon
            width={14}
            height={14}
            color="red"
          />
        )}
      </HStack>
    );
  }

  /**
   * 大尺寸模式
   */
  if (variant === 'large') {
    return (
      <Box
        textAlign="center"
        p={6}
        bg={bgColor}
        borderRadius="2xl"
        border="2px solid"
        borderColor={isWarning ? 'red.300' : borderColor}
        animation={isWarning ? `${shake} 0.5s infinite` : undefined}
      >
        <VStack spacing={4}>
          <CircularProgress
            value={getProgressPercentage()}
            color={`${getColorScheme()}.500`}
            size="150px"
            thickness="8px"
            trackColor={useColorModeValue('gray.100', 'gray.700')}
          >
            <CircularProgressLabel>
              <VStack spacing={1}>
                <ClockIcon
                  width={24}
                  height={24}
                  color={isWarning ? 'red' : 'gray'}
                />
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color={isWarning ? 'red.500' : 'gray.700'}
                >
                  {formatTime(timeLeft)}
                </Text>
              </VStack>
            </CircularProgressLabel>
          </CircularProgress>

          {isWarning && (
            <Badge colorScheme="red" variant="solid" fontSize="sm">
              <HStack spacing={1}>
                <ExclamationTriangleIcon width={14} height={14} />
                <Text>时间不足</Text>
              </HStack>
            </Badge>
          )}

          {isPaused && (
            <Badge colorScheme="gray" variant="outline">
              已暂停
            </Badge>
          )}
        </VStack>
      </Box>
    );
  }

  /**
   * 默认模式
   */
  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="lg"
      border="2px solid"
      borderColor={isWarning ? 'red.300' : borderColor}
      animation={isWarning ? `${pulse} 1s infinite` : undefined}
      textAlign="center"
    >
      <VStack spacing={3}>
        <HStack spacing={2} justify="center">
          <ClockIcon
            width={20}
            height={20}
            color={isWarning ? 'red' : 'gray'}
          />
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            剩余时间
          </Text>
        </HStack>

        <CircularProgress
          value={getProgressPercentage()}
          color={`${getColorScheme()}.500`}
          size="80px"
          thickness="6px"
          trackColor={useColorModeValue('gray.100', 'gray.700')}
        >
          <CircularProgressLabel>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={isWarning ? 'red.500' : 'gray.700'}
            >
              {formatTime(timeLeft)}
            </Text>
          </CircularProgressLabel>
        </CircularProgress>

        <HStack spacing={2}>
          {isWarning && (
            <Badge colorScheme="red" variant="solid" size="sm">
              <HStack spacing={1}>
                <ExclamationTriangleIcon width={12} height={12} />
                <Text fontSize="xs">警告</Text>
              </HStack>
            </Badge>
          )}

          {isPaused && (
            <Badge colorScheme="gray" variant="outline" size="sm">
              暂停中
            </Badge>
          )}

          {timeLeft === 0 && (
            <Badge colorScheme="red" variant="solid" size="sm">
              时间到
            </Badge>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default Timer;
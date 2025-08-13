/**
 * 下拉刷新组件
 * 提供下拉刷新的UI界面和交互
 */

import React, { useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Icon,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiArrowDown, FiArrowUp, FiCheck, FiRefreshCw } from 'react-icons/fi';
import {
  usePullToRefresh,
  PullToRefreshState,
  getPullToRefreshStateText,
} from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  /** 刷新回调函数 */
  onRefresh: () => Promise<void> | void;
  /** 子组件 */
  children: React.ReactNode;
  /** 是否启用下拉刷新 */
  enabled?: boolean;
  /** 触发刷新的距离阈值 */
  threshold?: number;
  /** 最大下拉距离 */
  maxPullDistance?: number;
  /** 刷新持续时间 */
  refreshDuration?: number;
  /** 自定义刷新指示器 */
  refreshIndicator?: React.ReactNode;
  /** 容器样式 */
  containerStyle?: React.CSSProperties;
  /** 指示器样式 */
  indicatorStyle?: React.CSSProperties;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  enabled = true,
  threshold = 80,
  maxPullDistance = 120,
  refreshDuration = 1000,
  refreshIndicator,
  containerStyle = {},
  indicatorStyle = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    state,
    pullDistance,
    progress,
    isRefreshing,
    bindToContainer,
    containerStyle: pullContainerStyle,
  } = usePullToRefresh(onRefresh, {
    enabled,
    threshold,
    maxPullDistance,
    refreshDuration,
  });

  // 绑定容器
  useEffect(() => {
    bindToContainer(containerRef.current);
  }, [bindToContainer]);

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const progressColor = useColorModeValue('blue.500', 'blue.300');

  /**
   * 获取状态图标
   */
  const getStateIcon = () => {
    switch (state) {
      case PullToRefreshState.IDLE:
      case PullToRefreshState.PULLING:
        return FiArrowDown;
      case PullToRefreshState.READY_TO_REFRESH:
        return FiArrowUp;
      case PullToRefreshState.REFRESHING:
        return FiRefreshCw;
      case PullToRefreshState.COMPLETED:
        return FiCheck;
      default:
        return FiArrowDown;
    }
  };

  /**
   * 渲染刷新指示器
   */
  const renderRefreshIndicator = () => {
    if (refreshIndicator) {
      return refreshIndicator;
    }

    const StateIcon = getStateIcon();
    const stateText = getPullToRefreshStateText(state);

    return (
      <VStack spacing={2} py={4}>
        {/* 图标或加载器 */}
        <Box
          transform={
            state === PullToRefreshState.READY_TO_REFRESH
              ? 'rotate(180deg)'
              : state === PullToRefreshState.REFRESHING
              ? 'rotate(360deg)'
              : 'rotate(0deg)'
          }
          transition="transform 0.3s ease"
          animation={
            state === PullToRefreshState.REFRESHING
              ? 'spin 1s linear infinite'
              : 'none'
          }
        >
          {state === PullToRefreshState.REFRESHING ? (
            <Spinner size="md" color={iconColor} />
          ) : (
            <Icon as={StateIcon} boxSize={6} color={iconColor} />
          )}
        </Box>

        {/* 状态文本 */}
        <Text fontSize="sm" color={textColor} fontWeight="medium">
          {stateText}
        </Text>

        {/* 进度条 */}
        {(state === PullToRefreshState.PULLING || state === PullToRefreshState.READY_TO_REFRESH) && (
          <Progress
            value={progress * 100}
            size="sm"
            colorScheme="blue"
            width="60px"
            borderRadius="full"
            bg="gray.200"
            _dark={{ bg: 'gray.600' }}
          />
        )}
      </VStack>
    );
  };

  return (
    <Box
      ref={containerRef}
      position="relative"
      height="100%"
      overflow="auto"
      style={{
        ...containerStyle,
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* 刷新指示器 */}
      <Box
        position="absolute"
        top={-threshold}
        left={0}
        right={0}
        height={threshold}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={bgColor}
        zIndex={10}
        opacity={pullDistance > 0 ? 1 : 0}
        transform={`translateY(${Math.min(pullDistance, threshold)}px)`}
        transition={pullDistance > 0 ? 'none' : 'opacity 0.3s ease, transform 0.3s ease'}
        style={indicatorStyle}
      >
        {renderRefreshIndicator()}
      </Box>

      {/* 内容容器 */}
      <Box
        style={{
          ...pullContainerStyle,
          minHeight: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

/**
 * 简化的下拉刷新组件
 */
export const SimplePullToRefresh: React.FC<{
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  isRefreshing?: boolean;
}> = ({ onRefresh, children, isRefreshing = false }) => {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      enabled={!isRefreshing}
      threshold={60}
      maxPullDistance={80}
      refreshDuration={800}
    >
      {children}
    </PullToRefresh>
  );
};

/**
 * 自定义刷新指示器组件
 */
export const CustomRefreshIndicator: React.FC<{
  state: PullToRefreshState;
  progress: number;
  message?: string;
}> = ({ state, progress, message }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const iconColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <VStack spacing={3} py={6}>
      {/* 自定义动画图标 */}
      <Box
        width="40px"
        height="40px"
        borderRadius="full"
        bg={iconColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        transform={`scale(${0.8 + progress * 0.4})`}
        transition="transform 0.2s ease"
      >
        {state === PullToRefreshState.REFRESHING ? (
          <Spinner size="sm" color="white" />
        ) : state === PullToRefreshState.COMPLETED ? (
          <Icon as={FiCheck} color="white" boxSize={5} />
        ) : (
          <Icon
            as={state === PullToRefreshState.READY_TO_REFRESH ? FiArrowUp : FiArrowDown}
            color="white"
            boxSize={5}
            transform={
              state === PullToRefreshState.READY_TO_REFRESH
                ? 'rotate(0deg)'
                : `rotate(${progress * 180}deg)`
            }
            transition="transform 0.2s ease"
          />
        )}
      </Box>

      {/* 消息文本 */}
      <Text fontSize="sm" color={textColor} fontWeight="medium">
        {message || getPullToRefreshStateText(state)}
      </Text>

      {/* 波浪进度指示器 */}
      {state === PullToRefreshState.PULLING && (
        <Box
          width="80px"
          height="4px"
          bg="gray.200"
          borderRadius="full"
          overflow="hidden"
          _dark={{ bg: 'gray.600' }}
        >
          <Box
            width="100%"
            height="100%"
            bg={iconColor}
            borderRadius="full"
            transform={`scaleX(${progress})`}
            transformOrigin="left"
            transition="transform 0.1s ease"
          />
        </Box>
      )}
    </VStack>
  );
};

// CSS动画样式
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// 注入CSS样式
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('pull-to-refresh-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'pull-to-refresh-styles';
    style.textContent = spinKeyframes;
    document.head.appendChild(style);
  }
}
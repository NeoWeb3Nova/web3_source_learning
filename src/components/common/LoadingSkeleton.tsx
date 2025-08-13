import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';

/**
 * 加载骨架屏组件Props
 */
interface LoadingSkeletonProps {
  /** 骨架屏类型 */
  type?: 'card' | 'list' | 'form' | 'table' | 'custom';
  /** 重复次数 */
  repeat?: number;
  /** 是否显示动画 */
  isLoaded?: boolean;
  /** 子组件 */
  children?: React.ReactNode;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 测试ID */
  testId?: string;
}

/**
 * 单词卡片骨架屏
 */
const WordCardSkeleton: React.FC = () => (
  <Box
    bg="white"
    borderRadius="2xl"
    border="2px solid"
    borderColor="gray.200"
    p={6}
    h="300px"
    w="full"
    maxW="400px"
    mx="auto"
  >
    <VStack spacing={4} h="full" justify="center">
      {/* 顶部标签 */}
      <HStack justify="space-between" w="full">
        <HStack spacing={2}>
          <Skeleton height="20px" width="60px" borderRadius="full" />
          <Skeleton height="20px" width="80px" borderRadius="full" />
        </HStack>
        <SkeletonCircle size="8" />
      </HStack>
      
      {/* 单词和音标 */}
      <VStack spacing={2}>
        <Skeleton height="40px" width="200px" />
        <Skeleton height="20px" width="150px" />
      </VStack>
      
      {/* 底部按钮 */}
      <HStack spacing={4}>
        <SkeletonCircle size="10" />
        <SkeletonCircle size="10" />
        <SkeletonCircle size="10" />
      </HStack>
    </VStack>
  </Box>
);

/**
 * 列表项骨架屏
 */
const ListItemSkeleton: React.FC = () => (
  <Box
    bg="white"
    borderRadius="lg"
    p={4}
    border="1px solid"
    borderColor="gray.200"
  >
    <HStack spacing={4} align="start">
      <SkeletonCircle size="12" />
      <VStack spacing={2} align="start" flex="1">
        <Skeleton height="20px" width="120px" />
        <SkeletonText noOfLines={2} spacing="2" />
        <HStack spacing={2}>
          <Skeleton height="16px" width="50px" borderRadius="full" />
          <Skeleton height="16px" width="60px" borderRadius="full" />
        </HStack>
      </VStack>
    </HStack>
  </Box>
);

/**
 * 表单骨架屏
 */
const FormSkeleton: React.FC = () => (
  <VStack spacing={6} align="stretch">
    <VStack spacing={4} align="stretch">
      <Box>
        <Skeleton height="16px" width="80px" mb={2} />
        <Skeleton height="40px" width="full" />
      </Box>
      <Box>
        <Skeleton height="16px" width="100px" mb={2} />
        <Skeleton height="80px" width="full" />
      </Box>
      <HStack spacing={4}>
        <Box flex="1">
          <Skeleton height="16px" width="60px" mb={2} />
          <Skeleton height="40px" width="full" />
        </Box>
        <Box flex="1">
          <Skeleton height="16px" width="40px" mb={2} />
          <Skeleton height="40px" width="full" />
        </Box>
      </HStack>
    </VStack>
    <HStack justify="end" spacing={3}>
      <Skeleton height="40px" width="80px" />
      <Skeleton height="40px" width="100px" />
    </HStack>
  </VStack>
);

/**
 * 表格骨架屏
 */
const TableSkeleton: React.FC = () => (
  <VStack spacing={2} align="stretch">
    {Array.from({ length: 5 }).map((_, index) => (
      <HStack key={index} spacing={4}>
        <Skeleton height="20px" width="100px" />
        <Skeleton height="20px" width="150px" />
        <Skeleton height="20px" width="80px" />
        <Skeleton height="20px" width="60px" />
      </HStack>
    ))}
  </VStack>
);

/**
 * 加载骨架屏组件
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  repeat = 1,
  isLoaded = false,
  children,
  className,
  style,
  testId,
}) => {
  if (isLoaded && children) {
    return <>{children}</>;
  }

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <WordCardSkeleton />;
      case 'list':
        return <ListItemSkeleton />;
      case 'form':
        return <FormSkeleton />;
      case 'table':
        return <TableSkeleton />;
      default:
        return <Skeleton height="100px" width="full" />;
    }
  };

  return (
    <Box className={className} style={style} data-testid={testId}>
      <VStack spacing={4}>
        {Array.from({ length: repeat }).map((_, index) => (
          <Box key={index} w="full">
            {renderSkeleton()}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

/**
 * 增强的Skeleton组件Props
 */
interface EnhancedSkeletonProps {
  /** 变体类型 */
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list' | 'avatar' | 'button';
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 行数（仅text变体） */
  lines?: number;
  /** 是否显示动画 */
  isLoaded?: boolean;
  /** 子组件 */
  children?: React.ReactNode;
  /** 自定义样式 */
  sx?: any;
  /** 圆角大小 */
  borderRadius?: string;
  /** 是否启用脉冲动画 */
  enablePulse?: boolean;
  /** 动画速度 */
  speed?: 'slow' | 'normal' | 'fast';
}

/**
 * 增强的Skeleton组件
 * 提供多种预设样式和自定义选项
 */
export const EnhancedSkeleton: React.FC<EnhancedSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  isLoaded = false,
  children,
  sx,
  borderRadius,
  enablePulse = true,
  speed = 'normal',
}) => {
  const getVariantStyles = () => {
    const speedMap = {
      slow: '2s',
      normal: '1.5s',
      fast: '1s',
    };

    const baseStyles = {
      borderRadius: borderRadius || '4px',
      animation: enablePulse ? `pulse ${speedMap[speed]} ease-in-out infinite` : 'none',
    };

    switch (variant) {
      case 'circular':
        return {
          ...baseStyles,
          borderRadius: '50%',
          width: width || '40px',
          height: height || '40px',
        };

      case 'rectangular':
        return {
          ...baseStyles,
          width: width || '100%',
          height: height || '20px',
        };

      case 'card':
        return {
          ...baseStyles,
          width: width || '100%',
          height: height || '200px',
          borderRadius: borderRadius || '12px',
        };

      case 'avatar':
        return {
          ...baseStyles,
          borderRadius: '50%',
          width: width || '48px',
          height: height || '48px',
        };

      case 'button':
        return {
          ...baseStyles,
          width: width || '120px',
          height: height || '40px',
          borderRadius: borderRadius || '8px',
        };

      case 'list':
        return {
          ...baseStyles,
          width: width || '100%',
          height: height || '60px',
          borderRadius: borderRadius || '8px',
        };

      case 'text':
      default:
        return {
          ...baseStyles,
          width: width || '100%',
          height: height || '16px',
        };
    }
  };

  if (isLoaded && children) {
    return <>{children}</>;
  }

  if (variant === 'text' && lines > 1) {
    return (
      <VStack spacing={2} align="stretch">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            {...getVariantStyles()}
            width={index === lines - 1 ? '80%' : '100%'}
            sx={sx}
          />
        ))}
      </VStack>
    );
  }

  return (
    <Skeleton
      {...getVariantStyles()}
      sx={sx}
    />
  );
};

/**
 * 卡片Skeleton组件
 */
export const CardSkeleton: React.FC<{ isLoaded?: boolean; children?: React.ReactNode }> = ({
  isLoaded = false,
  children,
}) => {
  if (isLoaded && children) {
    return <>{children}</>;
  }

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg={useColorModeValue('white', 'gray.800')}>
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <EnhancedSkeleton variant="avatar" />
          <VStack align="stretch" flex="1" spacing={2}>
            <EnhancedSkeleton variant="text" width="60%" />
            <EnhancedSkeleton variant="text" width="40%" />
          </VStack>
        </HStack>
        <EnhancedSkeleton variant="rectangular" height="120px" />
        <HStack spacing={2}>
          <EnhancedSkeleton variant="button" width="80px" />
          <EnhancedSkeleton variant="button" width="100px" />
        </HStack>
      </VStack>
    </Box>
  );
};

/**
 * 列表Skeleton组件
 */
export const ListSkeleton: React.FC<{ 
  items?: number; 
  isLoaded?: boolean; 
  children?: React.ReactNode;
}> = ({
  items = 5,
  isLoaded = false,
  children,
}) => {
  if (isLoaded && children) {
    return <>{children}</>;
  }

  return (
    <VStack spacing={3} align="stretch">
      {Array.from({ length: items }).map((_, index) => (
        <HStack key={index} spacing={4} p={4} borderWidth="1px" borderRadius="md">
          <EnhancedSkeleton variant="avatar" width="48px" height="48px" />
          <VStack align="stretch" flex="1" spacing={2}>
            <EnhancedSkeleton variant="text" width="70%" />
            <EnhancedSkeleton variant="text" width="50%" />
          </VStack>
          <EnhancedSkeleton variant="button" width="60px" height="32px" />
        </HStack>
      ))}
    </VStack>
  );
};

/**
 * 表格Skeleton组件
 */
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  isLoaded?: boolean; 
  children?: React.ReactNode;
}> = ({
  rows = 5,
  columns = 4,
  isLoaded = false,
  children,
}) => {
  if (isLoaded && children) {
    return <>{children}</>;
  }

  return (
    <VStack spacing={0} align="stretch">
      {/* 表头 */}
      <HStack spacing={4} p={4} bg={useColorModeValue('gray.50', 'gray.700')}>
        {Array.from({ length: columns }).map((_, index) => (
          <EnhancedSkeleton key={index} variant="text" width="100px" height="20px" />
        ))}
      </HStack>
      
      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <HStack key={rowIndex} spacing={4} p={4} borderBottomWidth="1px">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <EnhancedSkeleton 
              key={colIndex} 
              variant="text" 
              width={colIndex === 0 ? "120px" : "80px"} 
              height="16px" 
            />
          ))}
        </HStack>
      ))}
    </VStack>
  );
};

/**
 * 视觉反馈组件Props
 */
interface VisualFeedbackProps {
  /** 反馈类型 */
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  /** 消息内容 */
  message?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 持续时间（毫秒） */
  duration?: number;
  /** 是否自动消失 */
  autoHide?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 自定义样式 */
  sx?: any;
}

/**
 * 视觉反馈组件
 * 提供一致的成功、错误、警告等状态反馈
 */
export const VisualFeedback: React.FC<VisualFeedbackProps> = ({
  type,
  message,
  showIcon = true,
  duration = 3000,
  autoHide = true,
  onClose,
  sx,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // 自动隐藏
  useEffect(() => {
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onClose]);

  if (!isVisible) return null;

  const getTypeConfig = () => {
    const configs = {
      success: {
        colorScheme: 'green',
        icon: '✓',
        bg: useColorModeValue('green.50', 'green.900'),
        color: useColorModeValue('green.800', 'green.200'),
        borderColor: useColorModeValue('green.200', 'green.700'),
      },
      error: {
        colorScheme: 'red',
        icon: '✗',
        bg: useColorModeValue('red.50', 'red.900'),
        color: useColorModeValue('red.800', 'red.200'),
        borderColor: useColorModeValue('red.200', 'red.700'),
      },
      warning: {
        colorScheme: 'orange',
        icon: '⚠',
        bg: useColorModeValue('orange.50', 'orange.900'),
        color: useColorModeValue('orange.800', 'orange.200'),
        borderColor: useColorModeValue('orange.200', 'orange.700'),
      },
      info: {
        colorScheme: 'blue',
        icon: 'ℹ',
        bg: useColorModeValue('blue.50', 'blue.900'),
        color: useColorModeValue('blue.800', 'blue.200'),
        borderColor: useColorModeValue('blue.200', 'blue.700'),
      },
      loading: {
        colorScheme: 'gray',
        icon: '⟳',
        bg: useColorModeValue('gray.50', 'gray.800'),
        color: useColorModeValue('gray.800', 'gray.200'),
        borderColor: useColorModeValue('gray.200', 'gray.600'),
      },
    };

    return configs[type];
  };

  const config = getTypeConfig();

  return (
    <Box
      bg={config.bg}
      color={config.color}
      borderWidth="1px"
      borderColor={config.borderColor}
      borderRadius="md"
      p={4}
      display="flex"
      alignItems="center"
      gap={3}
      sx={{
        animation: type === 'loading' ? 'pulse 2s infinite' : 'slideUp 0.3s ease-out',
        ...sx,
      }}
    >
      {showIcon && (
        <Box
          fontSize="lg"
          sx={{
            animation: type === 'loading' ? 'spin 1s linear infinite' : 'none',
          }}
        >
          {config.icon}
        </Box>
      )}
      
      {message && (
        <Text fontSize="sm" fontWeight="medium" flex="1">
          {message}
        </Text>
      )}
    </Box>
  );
};
export default LoadingSkeleton;
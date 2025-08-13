import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  HStack,
  Text,
  Badge,
  IconButton,
  useColorModeValue,
  keyframes,
} from '@chakra-ui/react';
import { animated } from '@react-spring/web';
import {
  Bars3Icon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useDragAnimation } from '@/hooks/useDragAnimation';
import { useAdvancedTouch } from '@/hooks/useAdvancedTouch';

// 脉冲动画
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

// 摇摆动画
const wiggle = keyframes`
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-2deg);
  }
  75% {
    transform: rotate(2deg);
  }
`;

/**
 * 移动端拖拽项目Props
 */
interface MobileDragItemProps {
  /** 项目ID */
  id: string;
  /** 项目内容 */
  content: string;
  /** 当前位置索引 */
  index: number;
  /** 是否正确 */
  isCorrect?: boolean;
  /** 是否错误 */
  isWrong?: boolean;
  /** 是否显示结果 */
  showResult?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否正在拖拽 */
  isDragging?: boolean;
  /** 拖拽开始回调 */
  onDragStart?: (id: string) => void;
  /** 拖拽结束回调 */
  onDragEnd?: (id: string) => void;
  /** 位置变化回调 */
  onPositionChange?: (id: string, newIndex: number) => void;
}

/**
 * 移动端优化的拖拽项目组件
 * 支持触摸手势、视觉反馈和流畅动画
 */
export const MobileDragItem: React.FC<MobileDragItemProps> = ({
  id,
  content,
  index,
  isCorrect,
  isWrong,
  showResult,
  disabled,
  isDragging,
  onDragStart,
  onDragEnd,
  onPositionChange,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const correctColor = useColorModeValue('green.50', 'green.900');
  const incorrectColor = useColorModeValue('red.50', 'red.900');
  const draggingColor = useColorModeValue('blue.50', 'blue.900');
  const pressedColor = useColorModeValue('gray.100', 'gray.700');

  // 拖拽动画
  const {
    style: dragStyle,
    bind: bindDrag,
    resetPosition,
  } = useDragAnimation({
    dragScale: 1.1,
    dragRotation: 3,
    dragOpacity: 0.9,
    hoverScale: 1.02,
    magneticSnap: true,
    snapDistance: 30,
  });

  // 高级触摸手势
  const { bindEvents } = useAdvancedTouch(
    {
      threshold: 8,
      longPressTimeout: 300,
      preventDefault: true,
    },
    {
      onTouchStart: () => {
        if (!disabled) {
          setIsPressed(true);
          onDragStart?.(id);
        }
      },
      onTouchEnd: () => {
        setIsPressed(false);
        onDragEnd?.(id);
        resetPosition();
      },
      onLongPress: () => {
        if (!disabled && !showResult) {
          // 长按时显示操作提示
          setShowFeedback(true);
          setTimeout(() => setShowFeedback(false), 2000);
        }
      },
      onSwipe: (event) => {
        if (!disabled && !showResult) {
          // 根据滑动方向调整位置
          if (event.direction === 'up' && index > 0) {
            onPositionChange?.(id, index - 1);
          } else if (event.direction === 'down') {
            onPositionChange?.(id, index + 1);
          }
        }
      },
    }
  );

  /**
   * 获取项目样式
   */
  const getItemStyle = () => {
    if (isDragging) {
      return {
        bg: draggingColor,
        borderColor: 'blue.500',
        borderWidth: '2px',
        shadow: 'xl',
      };
    }

    if (isPressed) {
      return {
        bg: pressedColor,
        borderColor: 'primary.400',
        borderWidth: '2px',
        shadow: 'md',
      };
    }

    if (showResult) {
      if (isCorrect) {
        return {
          bg: correctColor,
          borderColor: 'green.500',
          borderWidth: '2px',
          shadow: 'sm',
        };
      } else if (isWrong) {
        return {
          bg: incorrectColor,
          borderColor: 'red.500',
          borderWidth: '2px',
          shadow: 'sm',
        };
      }
    }

    return {
      bg: bgColor,
      borderColor: borderColor,
      borderWidth: '1px',
      shadow: 'sm',
    };
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = () => {
    if (!showResult) return null;

    if (isCorrect) {
      return <CheckIcon width={20} height={20} color="green" />;
    } else if (isWrong) {
      return <XMarkIcon width={20} height={20} color="red" />;
    }

    return null;
  };

  /**
   * 获取动画效果
   */
  const getAnimation = () => {
    if (showFeedback) {
      return `${pulse} 0.6s ease-in-out`;
    }
    if (isPressed && !disabled) {
      return `${wiggle} 0.3s ease-in-out`;
    }
    return undefined;
  };

  /**
   * 绑定触摸事件
   */
  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      const unbind = bindEvents(element);
      return unbind;
    }
  }, [bindEvents]);

  return (
    <animated.div style={dragStyle}>
      <Box
        ref={elementRef}
        {...getItemStyle()}
        p={4}
        borderRadius="xl"
        cursor={disabled ? 'not-allowed' : 'grab'}
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        position="relative"
        userSelect="none"
        animation={getAnimation()}
        _active={{
          cursor: disabled ? 'not-allowed' : 'grabbing',
        }}
        {...bindDrag()}
      >
        <HStack justify="space-between" align="center" spacing={3}>
          {/* 拖拽手柄 */}
          <IconButton
            aria-label="拖拽手柄"
            icon={<Bars3Icon width={18} height={18} />}
            size="sm"
            variant="ghost"
            isDisabled={disabled}
            cursor={disabled ? 'not-allowed' : 'grab'}
            _active={{ cursor: 'grabbing' }}
            opacity={disabled ? 0.5 : 1}
          />

          {/* 序号徽章 */}
          <Badge
            colorScheme={
              showResult
                ? isCorrect
                  ? 'green'
                  : isWrong
                  ? 'red'
                  : 'gray'
                : isPressed
                ? 'primary'
                : 'gray'
            }
            variant="solid"
            borderRadius="full"
            minW="28px"
            h="28px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="sm"
            fontWeight="bold"
          >
            {index + 1}
          </Badge>

          {/* 内容文本 */}
          <Text
            flex="1"
            fontSize="md"
            fontWeight="medium"
            textAlign="center"
            px={2}
            color={disabled ? 'gray.500' : 'inherit'}
          >
            {content}
          </Text>

          {/* 状态图标 */}
          <Box
            minW="28px"
            h="28px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {getStatusIcon()}
          </Box>
        </HStack>

        {/* 反馈提示 */}
        {showFeedback && (
          <Box
            position="absolute"
            top="-40px"
            left="50%"
            transform="translateX(-50%)"
            bg="primary.500"
            color="white"
            px={3}
            py={1}
            borderRadius="md"
            fontSize="xs"
            fontWeight="medium"
            whiteSpace="nowrap"
            zIndex={10}
            _after={{
              content: '""',
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid',
              borderTopColor: 'primary.500',
            }}
          >
            长按拖拽或滑动排序
          </Box>
        )}

        {/* 拖拽指示器 */}
        {isDragging && (
          <Box
            position="absolute"
            top="-2px"
            right="-2px"
            w="12px"
            h="12px"
            bg="blue.500"
            borderRadius="full"
            animation={`${pulse} 1s infinite`}
          />
        )}
      </Box>
    </animated.div>
  );
};

export default MobileDragItem;
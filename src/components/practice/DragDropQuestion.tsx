import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  useColorModeValue,
  Fade,
  ScaleFade,
  Alert,
  AlertIcon,
  IconButton,
} from '@chakra-ui/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { 
  CheckIcon, 
  XMarkIcon, 
  Bars3Icon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';
import { DragDropQuestion as DragDropQuestionType } from '@/types/practice';
import { QuestionComponentProps } from './types';

/**
 * 拖拽排序题组件Props
 */
interface DragDropQuestionProps extends QuestionComponentProps {
  question: DragDropQuestionType;
}

/**
 * 拖拽项目接口
 */
interface DragItem {
  id: string;
  content: string;
  correctPosition: number;
  currentPosition: number;
}

/**
 * 可排序项目组件
 */
interface SortableItemProps {
  item: DragItem;
  index: number;
  isCorrect?: boolean;
  isWrong?: boolean;
  showResult?: boolean;
  disabled?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  index,
  isCorrect,
  isWrong,
  showResult,
  disabled,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const correctColor = useColorModeValue('green.50', 'green.900');
  const incorrectColor = useColorModeValue('red.50', 'red.900');
  const draggingColor = useColorModeValue('blue.50', 'blue.900');

  /**
   * 获取项目样式
   */
  const getItemStyle = () => {
    if (isDragging) {
      return {
        bg: draggingColor,
        borderColor: 'blue.500',
        borderWidth: '2px',
        shadow: 'lg',
        transform: 'rotate(5deg)',
      };
    }

    if (showResult) {
      if (isCorrect) {
        return {
          bg: correctColor,
          borderColor: 'green.500',
          borderWidth: '2px',
        };
      } else if (isWrong) {
        return {
          bg: incorrectColor,
          borderColor: 'red.500',
          borderWidth: '2px',
        };
      }
    }

    return {
      bg: bgColor,
      borderColor: borderColor,
      borderWidth: '1px',
    };
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = () => {
    if (!showResult) return null;

    if (isCorrect) {
      return (
        <ScaleFade in={true} initialScale={0.5}>
          <CheckIcon width={20} height={20} color="green" />
        </ScaleFade>
      );
    } else if (isWrong) {
      return (
        <ScaleFade in={true} initialScale={0.5}>
          <XMarkIcon width={20} height={20} color="red" />
        </ScaleFade>
      );
    }

    return null;
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...getItemStyle()}
      p={4}
      borderRadius="lg"
      cursor={disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab'}
      transition="all 0.2s"
      opacity={isDragging ? 0.5 : 1}
      _hover={
        !disabled && !isDragging
          ? {
              transform: 'translateY(-2px)',
              shadow: 'md',
            }
          : {}
      }
      position="relative"
    >
      <HStack justify="space-between" align="center">
        {/* 拖拽手柄 */}
        <HStack spacing={3}>
          <IconButton
            {...attributes}
            {...listeners}
            aria-label="拖拽手柄"
            icon={<Bars3Icon width={16} height={16} />}
            size="sm"
            variant="ghost"
            isDisabled={disabled}
            cursor={disabled ? 'not-allowed' : 'grab'}
            _active={{ cursor: 'grabbing' }}
          />
          
          {/* 序号 */}
          <Badge
            colorScheme={showResult ? (isCorrect ? 'green' : isWrong ? 'red' : 'gray') : 'gray'}
            variant="solid"
            borderRadius="full"
            minW="24px"
            h="24px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {index + 1}
          </Badge>
        </HStack>

        {/* 内容 */}
        <Text
          flex="1"
          fontSize="md"
          fontWeight="medium"
          textAlign="center"
          px={4}
        >
          {item.content}
        </Text>

        {/* 状态图标 */}
        <Box minW="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
          {getStatusIcon()}
        </Box>
      </HStack>

      {/* 正确位置提示（结果显示时） */}
      {showResult && isWrong && (
        <Box
          position="absolute"
          top="-8px"
          right="-8px"
          bg="red.500"
          color="white"
          borderRadius="full"
          minW="20px"
          h="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="xs"
          fontWeight="bold"
        >
          {item.correctPosition + 1}
        </Box>
      )}
    </Box>
  );
};

/**
 * 拖拽排序题组件
 * 支持拖拽排序、触摸手势和流畅动画
 */
export const DragDropQuestion: React.FC<DragDropQuestionProps> = ({
  question,
  onAnswer,
  showResult = false,
  userAnswer,
  disabled = false,
  className,
}) => {
  const [items, setItems] = useState<DragItem[]>([]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // 主题颜色
  const bgColor = useColorModeValue('gray.50', 'gray.700');

  // 配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * 初始化项目列表
   */
  useEffect(() => {
    if (question.items) {
      // 随机打乱项目顺序
      const shuffledItems = [...question.items]
        .sort(() => Math.random() - 0.5)
        .map((item, index) => ({
          ...item,
          currentPosition: index,
        }));
      setItems(shuffledItems);
    }
  }, [question.items]);

  /**
   * 处理拖拽开始
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (disabled || isAnswered) return;
    setActiveId(event.active.id);
  }, [disabled, isAnswered]);

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (disabled || isAnswered) return;

    setActiveId(null);

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // 更新当前位置
        return newItems.map((item, index) => ({
          ...item,
          currentPosition: index,
        }));
      });
    }
  }, [disabled, isAnswered]);

  /**
   * 提交答案
   */
  const handleSubmit = useCallback(() => {
    if (isAnswered || disabled) return;

    setIsAnswered(true);
    
    // 构建答案数组（按当前顺序的项目ID）
    const answer = items.map(item => item.id);
    onAnswer(answer);
  }, [items, isAnswered, disabled, onAnswer]);

  /**
   * 检查项目是否在正确位置
   */
  const isItemCorrect = (item: DragItem, currentIndex: number) => {
    return item.correctPosition === currentIndex;
  };

  /**
   * 获取当前拖拽的项目
   */
  const activeItem = activeId ? items.find(item => item.id === activeId) : null;

  /**
   * 重置排序
   */
  const handleReset = useCallback(() => {
    if (disabled || isAnswered) return;
    
    // 重新随机打乱
    const shuffledItems = [...question.items]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        ...item,
        currentPosition: index,
      }));
    setItems(shuffledItems);
  }, [question.items, disabled, isAnswered]);

  return (
    <Box className={className} w="full" maxW="600px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* 题目信息 */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Badge colorScheme="primary" variant="subtle">
              拖拽排序题
            </Badge>
            <HStack spacing={2}>
              <Badge colorScheme="gray" variant="outline">
                {question.difficulty}
              </Badge>
              <Badge colorScheme="blue" variant="outline">
                {question.points}分
              </Badge>
            </HStack>
          </HStack>

          {/* 词汇信息 */}
          <Box mb={4} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              {question.vocabulary.word}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {question.vocabulary.pronunciation}
            </Text>
          </Box>

          {/* 题目说明 */}
          <Text fontSize="lg" fontWeight="medium" mb={4}>
            {question.question}
          </Text>

          {/* 操作提示 */}
          {!showResult && !isAnswered && (
            <Alert status="info" borderRadius="lg" mb={4}>
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="medium">
                  操作提示
                </Text>
                <Text fontSize="xs">
                  拖拽项目到正确位置，或使用键盘方向键进行排序
                </Text>
              </VStack>
            </Alert>
          )}
        </Box>

        {/* 拖拽排序区域 */}
        <Fade in={true}>
          <Box
            p={4}
            bg={bgColor}
            borderRadius="lg"
            border="2px dashed"
            borderColor={useColorModeValue('gray.300', 'gray.600')}
            minH="300px"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                <VStack spacing={3}>
                  {items.map((item, index) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      index={index}
                      isCorrect={showResult || isAnswered ? isItemCorrect(item, index) : false}
                      isWrong={showResult || isAnswered ? !isItemCorrect(item, index) : false}
                      showResult={showResult || isAnswered}
                      disabled={disabled || isAnswered}
                    />
                  ))}
                </VStack>
              </SortableContext>

              {/* 拖拽覆盖层 */}
              <DragOverlay>
                {activeItem ? (
                  <Box
                    p={4}
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor="blue.500"
                    shadow="xl"
                    transform="rotate(5deg)"
                  >
                    <HStack justify="space-between" align="center">
                      <HStack spacing={3}>
                        <HandRaisedIcon width={16} height={16} />
                        <Badge colorScheme="blue" variant="solid" borderRadius="full">
                          {activeItem.currentPosition + 1}
                        </Badge>
                      </HStack>
                      <Text fontSize="md" fontWeight="medium" px={4}>
                        {activeItem.content}
                      </Text>
                      <Box minW="24px" />
                    </HStack>
                  </Box>
                ) : null}
              </DragOverlay>
            </DndContext>
          </Box>
        </Fade>

        {/* 操作按钮 */}
        {!showResult && !isAnswered && (
          <HStack justify="space-between">
            <Button
              variant="outline"
              onClick={handleReset}
              isDisabled={disabled}
              size="md"
            >
              重新排序
            </Button>
            
            <Button
              colorScheme="primary"
              onClick={handleSubmit}
              isDisabled={disabled}
              size="lg"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
              }}
            >
              提交答案
            </Button>
          </HStack>
        )}

        {/* 正确答案显示 */}
        {(showResult || isAnswered) && (
          <Fade in={true}>
            <Box
              p={4}
              bg={useColorModeValue('green.50', 'green.900')}
              borderRadius="lg"
              borderLeft="4px solid"
              borderLeftColor="green.500"
            >
              <Text fontSize="sm" fontWeight="medium" color="green.700" mb={3}>
                正确顺序
              </Text>
              <VStack spacing={2} align="stretch">
                {question.items
                  .sort((a, b) => a.correctPosition - b.correctPosition)
                  .map((item, index) => (
                    <HStack key={item.id} spacing={3}>
                      <Badge colorScheme="green" variant="solid" borderRadius="full" minW="24px">
                        {index + 1}
                      </Badge>
                      <Text fontSize="sm" color="green.600">
                        {item.content}
                      </Text>
                    </HStack>
                  ))}
              </VStack>
            </Box>
          </Fade>
        )}

        {/* 答案解释 */}
        {(showResult || isAnswered) && question.explanation && (
          <Fade in={true}>
            <Box
              p={4}
              bg={useColorModeValue('blue.50', 'blue.900')}
              borderRadius="lg"
              borderLeft="4px solid"
              borderLeftColor="blue.500"
            >
              <Text fontSize="sm" fontWeight="medium" color="blue.700" mb={2}>
                解释说明
              </Text>
              <Text fontSize="sm" color="blue.600">
                {question.explanation}
              </Text>
            </Box>
          </Fade>
        )}
      </VStack>
    </Box>
  );
};

export default DragDropQuestion;
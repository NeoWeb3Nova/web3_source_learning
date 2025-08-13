import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  Badge,
  useColorModeValue,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import { 
  TouchOptimizedButton, 
  TouchOptimizedIconButton,
  useResponsive 
} from '@/components/common';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  SpeakerWaveIcon,
  HeartIcon,
  InformationCircleIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';
import { VocabularyItem, BaseComponentProps } from '@/types';

/**
 * 单词卡片组件Props
 */
interface WordCardProps extends BaseComponentProps {
  /** 词汇数据 */
  word: VocabularyItem;
  /** 是否显示翻转效果 */
  showFlipEffect?: boolean;
  /** 是否支持滑动手势 */
  enableSwipe?: boolean;
  /** 是否为收藏状态 */
  isFavorite?: boolean;
  /** 是否显示详细信息按钮 */
  showDetailsButton?: boolean;
  /** 是否显示进度指示器 */
  showProgress?: boolean;
  /** 当前进度 (0-1) */
  progress?: number;
  /** 翻转回调 */
  onFlip?: () => void;
  /** 左滑回调 */
  onSwipeLeft?: () => void;
  /** 右滑回调 */
  onSwipeRight?: () => void;
  /** 收藏切换回调 */
  onToggleFavorite?: () => void;
  /** 播放音频回调 */
  onPlayAudio?: () => void;
  /** 显示详细信息回调 */
  onShowDetails?: () => void;
  /** 标记为已掌握回调 */
  onMarkMastered?: () => void;
}

/**
 * 动画变体
 */
const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
  }),
};

/**
 * 翻转动画变体
 */
const flipVariants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

/**
 * 单词卡片组件
 * 支持翻转效果、触摸手势、音频播放等功能
 */
export const WordCard: React.FC<WordCardProps> = ({
  word,
  showFlipEffect = true,
  enableSwipe = true,
  isFavorite = false,
  showDetailsButton = true,
  showProgress = false,
  progress = 0,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
  onToggleFavorite,
  onPlayAudio,
  onShowDetails,
  onMarkMastered,
  className,
  style,
  testId,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);

  // 主题颜色
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  // 难度颜色映射
  const difficultyColors = {
    beginner: 'green',
    intermediate: 'orange',
    advanced: 'red',
  };

  // 分类颜色映射
  const categoryColors = {
    blockchain: 'blue',
    defi: 'purple',
    nft: 'pink',
    trading: 'teal',
    protocol: 'cyan',
    consensus: 'yellow',
    security: 'red',
    governance: 'gray',
  };

  /**
   * 处理卡片点击翻转
   */
  const handleFlip = useCallback(() => {
    if (showFlipEffect) {
      setIsFlipped(!isFlipped);
      onFlip?.();
    }
  }, [isFlipped, showFlipEffect, onFlip]);

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = useCallback(
    (event: any, info: PanInfo) => {
      setIsDragging(false);
      
      if (!enableSwipe) return;

      const threshold = 100;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      // 根据拖拽距离和速度判断滑动方向
      if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
        if (offset > 0 || velocity > 0) {
          // 右滑
          onSwipeRight?.();
        } else {
          // 左滑
          onSwipeLeft?.();
        }
      }
    },
    [enableSwipe, onSwipeLeft, onSwipeRight]
  );

  /**
   * 处理拖拽开始
   */
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  /**
   * 获取准确率颜色
   */
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'green.500';
    if (accuracy >= 0.6) return 'orange.500';
    return 'red.500';
  };

  const { isMobile, touchConfig } = useResponsive();

  return (
    <Box
      ref={constraintsRef}
      className={className}
      style={style}
      data-testid={testId}
      position="relative"
      w="full"
      maxW={{ base: "100%", md: "400px" }}
      mx="auto"
      p={{ base: 4, md: 6, lg: 8 }}
      borderRadius={{ base: "lg", md: "xl", lg: "2xl" }}
    >
      {/* 进度指示器 */}
      {showProgress && (
        <Box
          position="absolute"
          top="-8px"
          left="0"
          right="0"
          h="4px"
          bg="gray.200"
          borderRadius="full"
          zIndex={2}
        >
          <Box
            h="full"
            bg="primary.500"
            borderRadius="full"
            width={`${progress * 100}%`}
            transition="width 0.3s ease"
          />
        </Box>
      )}

      <motion.div
        drag={enableSwipe ? 'x' : false}
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        variants={cardVariants}
        initial="enter"
        animate="center"
        exit="exit"
        whileHover={{ scale: isDragging ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <Box
          bg={cardBg}
          borderRadius="2xl"
          border="2px solid"
          borderColor={borderColor}
          boxShadow="xl"
          overflow="hidden"
          position="relative"
          h="300px"
          style={{ perspective: '1000px' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              variants={flipVariants}
              initial={isFlipped ? 'front' : 'back'}
              animate={isFlipped ? 'back' : 'front'}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
              }}
              onClick={handleFlip}
            >
              {!isFlipped ? (
                // 正面 - 显示单词
                <VStack
                  spacing={4}
                  p={6}
                  h="full"
                  justify="center"
                  align="center"
                  position="relative"
                >
                  {/* 顶部标签 */}
                  <HStack
                    position="absolute"
                    top={4}
                    left={4}
                    right={4}
                    justify="space-between"
                  >
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={difficultyColors[word.difficulty]}
                        variant="solid"
                        borderRadius="full"
                        fontSize="xs"
                      >
                        {word.difficulty}
                      </Badge>
                      <Badge
                        colorScheme={categoryColors[word.category]}
                        variant="outline"
                        borderRadius="full"
                        fontSize="xs"
                      >
                        {word.category}
                      </Badge>
                    </HStack>
                    
                    {/* 收藏按钮 */}
                    <IconButton
                      aria-label="收藏"
                      icon={isFavorite ? <HeartIconSolid /> : <HeartIcon />}
                      size="sm"
                      variant="ghost"
                      color={isFavorite ? 'red.500' : 'gray.400'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.();
                      }}
                      _hover={{
                        color: 'red.500',
                        transform: 'scale(1.1)',
                      }}
                    />
                  </HStack>

                  {/* 单词 */}
                  <VStack spacing={2} textAlign="center">
                    <Text
                      fontSize="3xl"
                      fontWeight="bold"
                      color={textColor}
                      lineHeight="1.2"
                    >
                      {word.word}
                    </Text>
                    
                    {/* 音标 */}
                    <Text
                      fontSize="lg"
                      color={mutedColor}
                      fontFamily="mono"
                    >
                      /{word.pronunciation}/
                    </Text>
                  </VStack>

                  {/* 底部操作按钮 */}
                  <HStack
                    position="absolute"
                    bottom={4}
                    left={4}
                    right={4}
                    justify="center"
                    spacing={4}
                  >
                    {/* 播放音频 */}
                    <Tooltip label="播放发音">
                      <IconButton
                        aria-label="播放发音"
                        icon={<SpeakerWaveIcon />}
                        size="md"
                        variant="ghost"
                        colorScheme="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayAudio?.();
                        }}
                        _hover={{ transform: 'scale(1.1)' }}
                      />
                    </Tooltip>

                    {/* 详细信息 */}
                    {showDetailsButton && (
                      <Tooltip label="查看详情">
                        <IconButton
                          aria-label="查看详情"
                          icon={<InformationCircleIcon />}
                          size="md"
                          variant="ghost"
                          colorScheme="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowDetails?.();
                          }}
                          _hover={{ transform: 'scale(1.1)' }}
                        />
                      </Tooltip>
                    )}

                    {/* 标记掌握 */}
                    <Tooltip label="标记为已掌握">
                      <IconButton
                        aria-label="标记为已掌握"
                        icon={word.accuracy >= 0.8 ? <BookmarkIconSolid /> : <BookmarkIcon />}
                        size="md"
                        variant="ghost"
                        colorScheme={word.accuracy >= 0.8 ? 'green' : 'gray'}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkMastered?.();
                        }}
                        _hover={{ transform: 'scale(1.1)' }}
                      />
                    </Tooltip>
                  </HStack>

                  {/* 点击提示 */}
                  <Text
                    position="absolute"
                    bottom={2}
                    fontSize="xs"
                    color={mutedColor}
                    opacity={0.7}
                  >
                    点击查看释义
                  </Text>
                </VStack>
              ) : (
                // 背面 - 显示释义和例句
                <VStack
                  spacing={4}
                  p={6}
                  h="full"
                  justify="center"
                  align="stretch"
                  position="relative"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  {/* 顶部统计信息 */}
                  <HStack
                    position="absolute"
                    top={4}
                    left={4}
                    right={4}
                    justify="space-between"
                  >
                    <HStack spacing={2}>
                      <Text fontSize="xs" color={mutedColor}>
                        学习次数: {word.studyCount}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={getAccuracyColor(word.accuracy)}
                        fontWeight="semibold"
                      >
                        准确率: {Math.round(word.accuracy * 100)}%
                      </Text>
                    </HStack>
                  </HStack>

                  {/* 释义 */}
                  <VStack spacing={3} flex="1" justify="center">
                    <Text
                      fontSize="xl"
                      fontWeight="semibold"
                      color={textColor}
                      textAlign="center"
                      lineHeight="1.4"
                    >
                      {word.definition}
                    </Text>

                    {/* 英文释义 */}
                    {word.englishDefinition && (
                      <Text
                        fontSize="md"
                        color={mutedColor}
                        textAlign="center"
                        fontStyle="italic"
                        lineHeight="1.3"
                      >
                        {word.englishDefinition}
                      </Text>
                    )}

                    {/* 例句 */}
                    {word.examples.length > 0 && (
                      <Box
                        bg="gray.50"
                        borderRadius="lg"
                        p={3}
                        w="full"
                        maxH="120px"
                        overflowY="auto"
                      >
                        <Text fontSize="xs" color={mutedColor} mb={2}>
                          例句:
                        </Text>
                        <VStack spacing={2} align="stretch">
                          {word.examples.slice(0, 2).map((example, index) => (
                            <Text
                              key={index}
                              fontSize="sm"
                              color={textColor}
                              lineHeight="1.3"
                            >
                              {example}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>

                  {/* 标签 */}
                  {word.tags.length > 0 && (
                    <Flex
                      position="absolute"
                      bottom={4}
                      left={4}
                      right={4}
                      wrap="wrap"
                      gap={1}
                      justify="center"
                    >
                      {word.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          size="sm"
                          variant="subtle"
                          colorScheme="gray"
                          borderRadius="full"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Flex>
                  )}

                  {/* 点击提示 */}
                  <Text
                    position="absolute"
                    bottom={2}
                    fontSize="xs"
                    color={mutedColor}
                    opacity={0.7}
                    textAlign="center"
                    w="full"
                  >
                    再次点击返回
                  </Text>
                </VStack>
              )}
            </motion.div>
          </AnimatePresence>

          {/* 滑动提示 */}
          {enableSwipe && !isDragging && (
            <HStack
              position="absolute"
              bottom={2}
              left={4}
              right={4}
              justify="space-between"
              pointerEvents="none"
              opacity={0.5}
            >
              <Text fontSize="xs" color={mutedColor}>
                ← 上一个
              </Text>
              <Text fontSize="xs" color={mutedColor}>
                下一个 →
              </Text>
            </HStack>
          )}
        </Box>
      </motion.div>
    </Box>
  );
};

export default WordCard;
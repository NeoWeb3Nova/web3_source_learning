import React from 'react';
import {
  HStack,
  VStack,
  IconButton,
  Button,
  Text,
  Tooltip,
  useColorModeValue,
  Badge,
  Flex,
} from '@chakra-ui/react';
import {
  HeartIcon,
  BookmarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import { VocabularyItem, BaseComponentProps } from '@/types';

/**
 * 单词操作组件Props
 */
interface WordActionsProps extends BaseComponentProps {
  /** 词汇数据 */
  word: VocabularyItem;
  /** 是否为收藏状态 */
  isFavorite?: boolean;
  /** 是否已掌握 */
  isMastered?: boolean;
  /** 是否显示详细操作 */
  showDetailedActions?: boolean;
  /** 操作按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 布局方向 */
  direction?: 'row' | 'column';
  /** 收藏切换回调 */
  onToggleFavorite?: () => void;
  /** 标记掌握回调 */
  onToggleMastered?: () => void;
  /** 播放音频回调 */
  onPlayAudio?: () => void;
  /** 查看详情回调 */
  onViewDetails?: () => void;
  /** 标记困难回调 */
  onMarkDifficult?: () => void;
  /** 标记简单回调 */
  onMarkEasy?: () => void;
}

/**
 * 单词操作组件
 * 提供收藏、标记掌握、播放音频等操作
 */
export const WordActions: React.FC<WordActionsProps> = ({
  word,
  isFavorite = false,
  isMastered = false,
  showDetailedActions = false,
  size = 'md',
  direction = 'row',
  onToggleFavorite,
  onToggleMastered,
  onPlayAudio,
  onViewDetails,
  onMarkDifficult,
  onMarkEasy,
  className,
  style,
  testId,
}) => {
  // 主题颜色
  const favoriteColor = useColorModeValue('red.500', 'red.300');
  const masteredColor = useColorModeValue('green.500', 'green.300');
  const buttonBg = useColorModeValue('white', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.50', 'gray.600');

  // 容器组件
  const Container = direction === 'row' ? HStack : VStack;

  // 按钮尺寸映射
  const buttonSizes = {
    sm: { iconSize: 4, buttonSize: 'sm' as const },
    md: { iconSize: 5, buttonSize: 'md' as const },
    lg: { iconSize: 6, buttonSize: 'lg' as const },
  };

  const { iconSize, buttonSize } = buttonSizes[size];

  return (
    <Container
      className={className}
      style={style}
      data-testid={testId}
      spacing={direction === 'row' ? 2 : 3}
      align="center"
    >
      {/* 收藏按钮 */}
      <Tooltip label={isFavorite ? '取消收藏' : '添加收藏'}>
        <IconButton
          aria-label={isFavorite ? '取消收藏' : '添加收藏'}
          icon={
            isFavorite ? (
              <HeartIconSolid width={iconSize * 4} height={iconSize * 4} />
            ) : (
              <HeartIcon width={iconSize * 4} height={iconSize * 4} />
            )
          }
          size={buttonSize}
          variant="ghost"
          color={isFavorite ? favoriteColor : 'gray.400'}
          bg={buttonBg}
          _hover={{
            bg: buttonHoverBg,
            color: favoriteColor,
            transform: 'scale(1.1)',
          }}
          _active={{
            transform: 'scale(0.95)',
          }}
          transition="all 0.2s ease"
          onClick={onToggleFavorite}
        />
      </Tooltip>

      {/* 播放音频按钮 */}
      <Tooltip label="播放发音">
        <IconButton
          aria-label="播放发音"
          icon={<SpeakerWaveIcon width={iconSize * 4} height={iconSize * 4} />}
          size={buttonSize}
          variant="ghost"
          colorScheme="primary"
          bg={buttonBg}
          _hover={{
            bg: buttonHoverBg,
            transform: 'scale(1.1)',
          }}
          _active={{
            transform: 'scale(0.95)',
          }}
          transition="all 0.2s ease"
          onClick={onPlayAudio}
        />
      </Tooltip>

      {/* 掌握状态按钮 */}
      <Tooltip label={isMastered ? '标记为未掌握' : '标记为已掌握'}>
        <IconButton
          aria-label={isMastered ? '标记为未掌握' : '标记为已掌握'}
          icon={
            isMastered ? (
              <CheckCircleIconSolid width={iconSize * 4} height={iconSize * 4} />
            ) : (
              <CheckCircleIcon width={iconSize * 4} height={iconSize * 4} />
            )
          }
          size={buttonSize}
          variant="ghost"
          color={isMastered ? masteredColor : 'gray.400'}
          bg={buttonBg}
          _hover={{
            bg: buttonHoverBg,
            color: masteredColor,
            transform: 'scale(1.1)',
          }}
          _active={{
            transform: 'scale(0.95)',
          }}
          transition="all 0.2s ease"
          onClick={onToggleMastered}
        />
      </Tooltip>

      {/* 查看详情按钮 */}
      <Tooltip label="查看详细信息">
        <IconButton
          aria-label="查看详细信息"
          icon={<EyeIcon width={iconSize * 4} height={iconSize * 4} />}
          size={buttonSize}
          variant="ghost"
          colorScheme="secondary"
          bg={buttonBg}
          _hover={{
            bg: buttonHoverBg,
            transform: 'scale(1.1)',
          }}
          _active={{
            transform: 'scale(0.95)',
          }}
          transition="all 0.2s ease"
          onClick={onViewDetails}
        />
      </Tooltip>

      {/* 详细操作 */}
      {showDetailedActions && (
        <>
          {direction === 'row' && (
            <Text color="gray.400" fontSize="sm">
              |
            </Text>
          )}
          
          {/* 难度标记 */}
          <HStack spacing={1}>
            <Tooltip label="标记为困难">
              <Button
                size="xs"
                variant="outline"
                colorScheme="red"
                leftIcon={<XCircleIcon width={12} height={12} />}
                onClick={onMarkDifficult}
                _hover={{ transform: 'scale(1.05)' }}
              >
                困难
              </Button>
            </Tooltip>
            
            <Tooltip label="标记为简单">
              <Button
                size="xs"
                variant="outline"
                colorScheme="green"
                leftIcon={<CheckCircleIcon width={12} height={12} />}
                onClick={onMarkEasy}
                _hover={{ transform: 'scale(1.05)' }}
              >
                简单
              </Button>
            </Tooltip>
          </HStack>
        </>
      )}
    </Container>
  );
};

/**
 * 单词状态指示器组件
 */
interface WordStatusIndicatorProps extends BaseComponentProps {
  /** 词汇数据 */
  word: VocabularyItem;
  /** 是否为收藏状态 */
  isFavorite?: boolean;
  /** 是否已掌握 */
  isMastered?: boolean;
  /** 显示模式 */
  mode?: 'badges' | 'icons' | 'text';
}

export const WordStatusIndicator: React.FC<WordStatusIndicatorProps> = ({
  word,
  isFavorite = false,
  isMastered = false,
  mode = 'badges',
  className,
  style,
  testId,
}) => {
  // 获取准确率颜色
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'green';
    if (accuracy >= 0.6) return 'orange';
    return 'red';
  };

  if (mode === 'badges') {
    return (
      <Flex
        className={className}
        style={style}
        data-testid={testId}
        wrap="wrap"
        gap={1}
        align="center"
      >
        {/* 收藏状态 */}
        {isFavorite && (
          <Badge
            colorScheme="red"
            variant="solid"
            borderRadius="full"
            fontSize="xs"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <HeartIconSolid width={10} height={10} />
            收藏
          </Badge>
        )}

        {/* 掌握状态 */}
        {isMastered && (
          <Badge
            colorScheme="green"
            variant="solid"
            borderRadius="full"
            fontSize="xs"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <CheckCircleIconSolid width={10} height={10} />
            已掌握
          </Badge>
        )}

        {/* 准确率 */}
        <Badge
          colorScheme={getAccuracyColor(word.accuracy)}
          variant="outline"
          borderRadius="full"
          fontSize="xs"
        >
          {Math.round(word.accuracy * 100)}%
        </Badge>

        {/* 学习次数 */}
        {word.studyCount > 0 && (
          <Badge
            colorScheme="blue"
            variant="subtle"
            borderRadius="full"
            fontSize="xs"
          >
            学习{word.studyCount}次
          </Badge>
        )}
      </Flex>
    );
  }

  if (mode === 'icons') {
    return (
      <HStack
        className={className}
        style={style}
        data-testid={testId}
        spacing={2}
      >
        {isFavorite && (
          <HeartIconSolid width={16} height={16} color="red" />
        )}
        {isMastered && (
          <CheckCircleIconSolid width={16} height={16} color="green" />
        )}
        <BookmarkIconSolid 
          width={16} 
          height={16} 
          color={getAccuracyColor(word.accuracy) === 'green' ? 'green' : 
                 getAccuracyColor(word.accuracy) === 'orange' ? 'orange' : 'red'} 
        />
      </HStack>
    );
  }

  // text mode
  return (
    <VStack
      className={className}
      style={style}
      data-testid={testId}
      spacing={1}
      align="start"
    >
      {isFavorite && (
        <Text fontSize="xs" color="red.500">
          ❤️ 已收藏
        </Text>
      )}
      {isMastered && (
        <Text fontSize="xs" color="green.500">
          ✅ 已掌握
        </Text>
      )}
      <Text fontSize="xs" color="gray.500">
        准确率: {Math.round(word.accuracy * 100)}%
      </Text>
      {word.studyCount > 0 && (
        <Text fontSize="xs" color="gray.500">
          学习次数: {word.studyCount}
        </Text>
      )}
    </VStack>
  );
};

export default WordActions;
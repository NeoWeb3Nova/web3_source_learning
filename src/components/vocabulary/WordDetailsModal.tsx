import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Box,
  Progress,
  Flex,
  Tag,
  TagLabel,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  TagIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import { VocabularyItem, BaseComponentProps } from '@/types';
import { WordActions, WordStatusIndicator } from './WordActions';

/**
 * 单词详情模态框Props
 */
interface WordDetailsModalProps extends BaseComponentProps {
  /** 是否显示模态框 */
  isOpen: boolean;
  /** 词汇数据 */
  word: VocabularyItem | null;
  /** 是否为收藏状态 */
  isFavorite?: boolean;
  /** 是否已掌握 */
  isMastered?: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 收藏切换回调 */
  onToggleFavorite?: () => void;
  /** 标记掌握回调 */
  onToggleMastered?: () => void;
  /** 播放音频回调 */
  onPlayAudio?: () => void;
  /** 标记困难回调 */
  onMarkDifficult?: () => void;
  /** 标记简单回调 */
  onMarkEasy?: () => void;
}

/**
 * 单词详情模态框组件
 * 显示单词的详细信息，包括释义、例句、学习统计等
 */
export const WordDetailsModal: React.FC<WordDetailsModalProps> = ({
  isOpen,
  word,
  isFavorite = false,
  isMastered = false,
  onClose,
  onToggleFavorite,
  onToggleMastered,
  onPlayAudio,
  onMarkDifficult,
  onMarkEasy,
  className,
  style,
  testId,
}) => {
  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  if (!word) return null;

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

  // 获取准确率颜色
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'green.500';
    if (accuracy >= 0.6) return 'orange.500';
    return 'red.500';
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        className={className}
        style={style}
        data-testid={testId}
        bg={bgColor}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        maxH="90vh"
      >
        <ModalHeader pb={2}>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1}>
              <HStack spacing={3} align="center">
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  {word.word}
                </Text>
                
                {/* 播放音频按钮 */}
                <Tooltip label="播放发音">
                  <IconButton
                    aria-label="播放发音"
                    icon={<SpeakerWaveIcon width={20} height={20} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="primary"
                    onClick={onPlayAudio}
                    _hover={{ transform: 'scale(1.1)' }}
                  />
                </Tooltip>
              </HStack>
              
              <Text fontSize="md" color={mutedColor} fontFamily="mono">
                /{word.pronunciation}/
              </Text>
              
              <HStack spacing={2}>
                <Badge
                  colorScheme={difficultyColors[word.difficulty]}
                  variant="solid"
                  borderRadius="full"
                >
                  {word.difficulty}
                </Badge>
                <Badge
                  colorScheme={categoryColors[word.category]}
                  variant="outline"
                  borderRadius="full"
                >
                  {word.category}
                </Badge>
              </HStack>
            </VStack>

            {/* 状态指示器 */}
            <WordStatusIndicator
              word={word}
              isFavorite={isFavorite}
              isMastered={isMastered}
              mode="icons"
            />
          </HStack>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* 释义部分 */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3} color={textColor}>
                释义
              </Text>
              <Box
                bg="gray.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor={borderColor}
              >
                <Text fontSize="md" lineHeight="1.6" color={textColor}>
                  {word.definition}
                </Text>
                
                {word.englishDefinition && (
                  <Text
                    fontSize="sm"
                    color={mutedColor}
                    fontStyle="italic"
                    mt={2}
                    lineHeight="1.5"
                  >
                    {word.englishDefinition}
                  </Text>
                )}
              </Box>
            </Box>

            {/* 例句部分 */}
            {word.examples.length > 0 && (
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={3} color={textColor}>
                  例句
                </Text>
                <VStack spacing={3} align="stretch">
                  {word.examples.map((example, index) => (
                    <Box
                      key={index}
                      bg="blue.50"
                      borderRadius="lg"
                      p={3}
                      border="1px solid"
                      borderColor="blue.200"
                    >
                      <Text fontSize="sm" lineHeight="1.5" color={textColor}>
                        {example}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* 标签部分 */}
            {word.tags.length > 0 && (
              <Box>
                <HStack mb={3} align="center">
                  <TagIcon width={16} height={16} />
                  <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                    标签
                  </Text>
                </HStack>
                <Flex wrap="wrap" gap={2}>
                  {word.tags.map((tag, index) => (
                    <Tag
                      key={index}
                      size="sm"
                      variant="subtle"
                      colorScheme="gray"
                      borderRadius="full"
                    >
                      <TagLabel>{tag}</TagLabel>
                    </Tag>
                  ))}
                </Flex>
              </Box>
            )}

            <Divider />

            {/* 学习统计 */}
            <Box>
              <HStack mb={4} align="center">
                <ChartBarIcon width={16} height={16} />
                <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                  学习统计
                </Text>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                {/* 准确率 */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color={mutedColor}>
                      掌握程度
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color={getAccuracyColor(word.accuracy)}
                    >
                      {Math.round(word.accuracy * 100)}%
                    </Text>
                  </HStack>
                  <Progress
                    value={word.accuracy * 100}
                    colorScheme={
                      word.accuracy >= 0.8 ? 'green' :
                      word.accuracy >= 0.6 ? 'orange' : 'red'
                    }
                    size="sm"
                    borderRadius="full"
                  />
                </Box>

                {/* 学习次数和时间 */}
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <ClockIcon width={16} height={16} />
                    <Text fontSize="sm" color={mutedColor}>
                      学习次数
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                    {word.studyCount} 次
                  </Text>
                </HStack>

                {/* 创建和更新时间 */}
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <CalendarIcon width={16} height={16} />
                      <Text fontSize="sm" color={mutedColor}>
                        添加时间
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={textColor}>
                      {formatDate(word.createdAt)}
                    </Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <CalendarIcon width={16} height={16} />
                      <Text fontSize="sm" color={mutedColor}>
                        更新时间
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={textColor}>
                      {formatDate(word.updatedAt)}
                    </Text>
                  </HStack>
                </VStack>

                {/* 自定义词汇标识 */}
                {word.isCustom && (
                  <Box
                    bg="purple.50"
                    borderRadius="lg"
                    p={3}
                    border="1px solid"
                    borderColor="purple.200"
                  >
                    <Text fontSize="sm" color="purple.700" textAlign="center">
                      🎯 这是您自定义添加的词汇
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* 操作按钮 */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                操作
              </Text>
              <WordActions
                word={word}
                isFavorite={isFavorite}
                isMastered={isMastered}
                showDetailedActions={true}
                size="md"
                direction="row"
                onToggleFavorite={onToggleFavorite}
                onToggleMastered={onToggleMastered}
                onPlayAudio={onPlayAudio}
                onMarkDifficult={onMarkDifficult}
                onMarkEasy={onMarkEasy}
              />
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default WordDetailsModal;
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Badge,
  IconButton,
  Progress,
  useColorModeValue,
  Fade,
  ScaleFade,
  Alert,
  AlertIcon,
  Tooltip,
} from '@chakra-ui/react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ListeningQuestion as ListeningQuestionType } from '@/types/practice';
import { QuestionComponentProps } from './types';

/**
 * 听力题组件Props
 */
interface ListeningQuestionProps extends QuestionComponentProps {
  question: ListeningQuestionType;
}

/**
 * 听力题组件
 * 集成音频播放，支持播放次数限制和实时反馈
 */
export const ListeningQuestion: React.FC<ListeningQuestionProps> = ({
  question,
  onAnswer,
  showResult = false,
  userAnswer,
  disabled = false,
  className,
}) => {
  const [answer, setAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const correctColor = useColorModeValue('green.50', 'green.900');
  const incorrectColor = useColorModeValue('red.50', 'red.900');

  /**
   * 初始化音频
   */
  useEffect(() => {
    if (question.audioUrl) {
      const audio = new Audio(question.audioUrl);
      audioRef.current = audio;

      // 音频事件监听
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setAudioError(null);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const handleError = () => {
        setAudioError('音频加载失败，请检查网络连接');
        setIsPlaying(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.pause();
      };
    }
  }, [question.audioUrl]);

  /**
   * 播放/暂停音频
   */
  const togglePlayback = useCallback(async () => {
    if (!audioRef.current || audioError) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // 检查播放次数限制
        if (question.playLimit && playCount >= question.playLimit) {
          return;
        }

        await audioRef.current.play();
        setIsPlaying(true);
        
        // 如果是从头开始播放，增加播放次数
        if (currentTime === 0) {
          setPlayCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioError('音频播放失败');
      setIsPlaying(false);
    }
  }, [isPlaying, currentTime, playCount, question.playLimit, audioError]);

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback((value: string) => {
    if (disabled || isAnswered) return;
    setAnswer(value);
  }, [disabled, isAnswered]);

  /**
   * 提交答案
   */
  const handleSubmit = useCallback(() => {
    if (!answer.trim() || isAnswered) return;
    
    setIsAnswered(true);
    onAnswer(answer.trim());
  }, [answer, isAnswered, onAnswer]);

  /**
   * 处理键盘事件
   */
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  /**
   * 格式化时间
   */
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * 检查答案是否正确
   */
  const isCorrect = showResult || isAnswered
    ? answer.trim().toLowerCase() === question.correctAnswer.toLowerCase()
    : false;

  /**
   * 获取输入框样式
   */
  const getInputStyle = () => {
    if (!showResult && !isAnswered) {
      return {
        bg: bgColor,
        borderColor: 'gray.300',
      };
    }

    return {
      bg: isCorrect ? correctColor : incorrectColor,
      borderColor: isCorrect ? 'green.500' : 'red.500',
      borderWidth: '2px',
    };
  };

  return (
    <Box className={className} w="full" maxW="600px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* 题目信息 */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Badge colorScheme="primary" variant="subtle">
              听力题
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
          <Text fontSize="lg" fontWeight="medium" mb={6}>
            {question.question}
          </Text>
        </Box>

        {/* 音频播放器 */}
        <Fade in={true}>
          <Box
            p={6}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="lg"
            border="2px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            {audioError ? (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {audioError}
              </Alert>
            ) : (
              <VStack spacing={4}>
                {/* 播放控制 */}
                <HStack spacing={4} justify="center">
                  <Tooltip
                    label={
                      question.playLimit && playCount >= question.playLimit
                        ? `已达到最大播放次数 (${question.playLimit})`
                        : isPlaying
                        ? '暂停'
                        : '播放'
                    }
                  >
                    <IconButton
                      aria-label={isPlaying ? '暂停' : '播放'}
                      icon={isPlaying ? <PauseIcon width={24} height={24} /> : <PlayIcon width={24} height={24} />}
                      colorScheme="primary"
                      size="lg"
                      borderRadius="full"
                      onClick={togglePlayback}
                      isDisabled={
                        audioError !== null ||
                        (question.playLimit !== undefined && playCount >= question.playLimit)
                      }
                      _hover={{
                        transform: 'scale(1.05)',
                      }}
                    />
                  </Tooltip>

                  <VStack spacing={1}>
                    <SpeakerWaveIcon width={20} height={20} />
                    <Text fontSize="xs" color="gray.600">
                      音频
                    </Text>
                  </VStack>
                </HStack>

                {/* 播放进度 */}
                {duration > 0 && (
                  <Box w="full">
                    <Progress
                      value={(currentTime / duration) * 100}
                      colorScheme="primary"
                      size="sm"
                      borderRadius="full"
                    />
                    <HStack justify="space-between" mt={1}>
                      <Text fontSize="xs" color="gray.600">
                        {formatTime(currentTime)}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {formatTime(duration)}
                      </Text>
                    </HStack>
                  </Box>
                )}

                {/* 播放次数显示 */}
                {question.playLimit && (
                  <Text fontSize="sm" color="gray.600">
                    播放次数: {playCount}/{question.playLimit}
                  </Text>
                )}
              </VStack>
            )}
          </Box>
        </Fade>

        {/* 答案输入 */}
        <Box position="relative">
          <Input
            value={answer}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您听到的内容"
            size="lg"
            textAlign="center"
            isDisabled={disabled || isAnswered}
            {...getInputStyle()}
            _focus={{
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
            }}
          />

          {/* 正确/错误图标 */}
          {(showResult || isAnswered) && (
            <Box position="absolute" right="12px" top="50%" transform="translateY(-50%)">
              <ScaleFade in={true} initialScale={0.5}>
                {isCorrect ? (
                  <CheckIcon width={24} height={24} color="green" />
                ) : (
                  <XMarkIcon width={24} height={24} color="red" />
                )}
              </ScaleFade>
            </Box>
          )}
        </Box>

        {/* 提交按钮 */}
        {!showResult && !isAnswered && (
          <Button
            colorScheme="primary"
            size="lg"
            onClick={handleSubmit}
            isDisabled={!answer.trim() || disabled}
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'lg',
            }}
          >
            提交答案
          </Button>
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
              <Text fontSize="sm" fontWeight="medium" color="green.700" mb={2}>
                正确答案
              </Text>
              <Text fontSize="md" fontWeight="bold" color="green.600">
                {question.correctAnswer}
              </Text>
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

export default ListeningQuestion;
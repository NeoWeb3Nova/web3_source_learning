import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Badge,
  useColorModeValue,
  Fade,
  ScaleFade,
  FormControl,
  FormErrorMessage,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { FillBlankQuestion as FillBlankQuestionType } from '@/types/practice';
import { QuestionComponentProps } from './types';

/**
 * 填空题组件Props
 */
interface FillBlankQuestionProps extends QuestionComponentProps {
  question: FillBlankQuestionType;
}

/**
 * 填空题组件
 * 支持文本输入验证，实时反馈和提示功能
 */
export const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
  question,
  onAnswer,
  showResult = false,
  userAnswer,
  disabled = false,
  className,
}) => {
  const [answers, setAnswers] = useState<string[]>(
    new Array(question.blanks.length).fill('')
  );
  const [isAnswered, setIsAnswered] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const correctColor = useColorModeValue('green.50', 'green.900');
  const incorrectColor = useColorModeValue('red.50', 'red.900');

  /**
   * 初始化输入框引用
   */
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, question.blanks.length);
  }, [question.blanks.length]);

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback((index: number, value: string) => {
    if (disabled || isAnswered) return;

    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    // 清除对应的错误
    if (errors[index]) {
      const newErrors = [...errors];
      newErrors[index] = '';
      setErrors(newErrors);
    }
  }, [answers, errors, disabled, isAnswered]);

  /**
   * 处理键盘事件
   */
  const handleKeyPress = useCallback((index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      // 移动到下一个输入框或提交答案
      if (index < question.blanks.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        handleSubmit();
      }
    }
  }, [question.blanks.length]);

  /**
   * 验证答案
   */
  const validateAnswers = useCallback(() => {
    const newErrors: string[] = [];
    let hasError = false;

    answers.forEach((answer, index) => {
      const blank = question.blanks[index];
      const trimmedAnswer = answer.trim();

      if (!trimmedAnswer) {
        newErrors[index] = '请填写答案';
        hasError = true;
      } else if (trimmedAnswer.length < 1) {
        newErrors[index] = '答案不能为空';
        hasError = true;
      } else {
        newErrors[index] = '';
      }
    });

    setErrors(newErrors);
    return !hasError;
  }, [answers, question.blanks]);

  /**
   * 提交答案
   */
  const handleSubmit = useCallback(() => {
    if (isAnswered || !validateAnswers()) return;

    setIsAnswered(true);
    onAnswer(answers);
  }, [answers, isAnswered, validateAnswers, onAnswer]);

  /**
   * 渲染模板文本
   */
  const renderTemplate = () => {
    const parts = question.template.split('___');
    const elements: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      // 添加文本部分
      if (part) {
        elements.push(
          <Text key={`text-${index}`} as="span" fontSize="lg">
            {part}
          </Text>
        );
      }

      // 添加输入框（除了最后一个部分）
      if (index < parts.length - 1) {
        const blankIndex = index;
        const blank = question.blanks[blankIndex];
        const isCorrect = showResult || isAnswered 
          ? answers[blankIndex]?.trim().toLowerCase() === blank.answer.toLowerCase()
          : false;
        const hasError = errors[blankIndex];

        elements.push(
          <Box key={`blank-${blankIndex}`} display="inline-block" mx={2}>
            <FormControl isInvalid={!!hasError} display="inline-block">
              <Input
                ref={(el) => (inputRefs.current[blankIndex] = el)}
                value={answers[blankIndex]}
                onChange={(e) => handleInputChange(blankIndex, e.target.value)}
                onKeyPress={(e) => handleKeyPress(blankIndex, e)}
                placeholder={`填空${blankIndex + 1}`}
                size="md"
                width="120px"
                textAlign="center"
                isDisabled={disabled || isAnswered}
                bg={
                  showResult || isAnswered
                    ? isCorrect
                      ? correctColor
                      : incorrectColor
                    : bgColor
                }
                borderColor={
                  showResult || isAnswered
                    ? isCorrect
                      ? 'green.500'
                      : 'red.500'
                    : 'gray.300'
                }
                borderWidth="2px"
                _focus={{
                  borderColor: 'primary.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                }}
              />
              {hasError && (
                <FormErrorMessage position="absolute" top="100%" left="0" whiteSpace="nowrap">
                  {hasError}
                </FormErrorMessage>
              )}
            </FormControl>

            {/* 正确/错误图标 */}
            {(showResult || isAnswered) && (
              <Box position="absolute" top="-8px" right="-8px">
                <ScaleFade in={true} initialScale={0.5}>
                  {isCorrect ? (
                    <CheckIcon width={16} height={16} color="green" />
                  ) : (
                    <XMarkIcon width={16} height={16} color="red" />
                  )}
                </ScaleFade>
              </Box>
            )}

            {/* 提示按钮 */}
            {!isAnswered && !showResult && blank.hints && blank.hints.length > 0 && (
              <Tooltip
                label={blank.hints.join(', ')}
                placement="top"
                hasArrow
              >
                <Box
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  cursor="pointer"
                  color="yellow.500"
                  _hover={{ color: 'yellow.600' }}
                >
                  <LightBulbIcon width={16} height={16} />
                </Box>
              </Tooltip>
            )}
          </Box>
        );
      }
    });

    return elements;
  };

  return (
    <Box className={className} w="full" maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* 题目信息 */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Badge colorScheme="primary" variant="subtle">
              填空题
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

        {/* 填空模板 */}
        <Fade in={true}>
          <Box
            p={6}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="lg"
            border="2px dashed"
            borderColor={useColorModeValue('gray.300', 'gray.600')}
            position="relative"
          >
            <Box lineHeight="tall" fontSize="lg">
              {renderTemplate()}
            </Box>
          </Box>
        </Fade>

        {/* 提交按钮 */}
        {!showResult && !isAnswered && (
          <Button
            colorScheme="primary"
            size="lg"
            onClick={handleSubmit}
            isDisabled={disabled || answers.some(answer => !answer.trim())}
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
              <HStack spacing={4} wrap="wrap">
                {question.blanks.map((blank, index) => (
                  <Box key={index}>
                    <Text fontSize="sm" color="green.600">
                      填空{index + 1}: <Text as="span" fontWeight="bold">{blank.answer}</Text>
                    </Text>
                  </Box>
                ))}
              </HStack>
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

export default FillBlankQuestion;
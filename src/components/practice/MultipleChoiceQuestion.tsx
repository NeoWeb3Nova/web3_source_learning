import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Radio,
  RadioGroup,
  Stack,
  Badge,
  useColorModeValue,
  Fade,
  ScaleFade,
} from '@chakra-ui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MultipleChoiceQuestion as MultipleChoiceQuestionType } from '@/types/practice';
import { QuestionComponentProps } from './types';

/**
 * 选择题组件Props
 */
interface MultipleChoiceQuestionProps extends QuestionComponentProps {
  question: MultipleChoiceQuestionType;
}

/**
 * 选择题组件
 * 支持多选项答题，实时反馈和动画效果
 */
export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  onAnswer,
  showResult = false,
  userAnswer,
  disabled = false,
  className,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const correctColor = useColorModeValue('green.50', 'green.900');
  const incorrectColor = useColorModeValue('red.50', 'red.900');

  /**
   * 处理选项选择
   */
  const handleOptionSelect = useCallback((value: string) => {
    if (disabled || isAnswered) return;
    setSelectedOption(value);
  }, [disabled, isAnswered]);

  /**
   * 提交答案
   */
  const handleSubmit = useCallback(() => {
    if (!selectedOption || isAnswered) return;
    
    setIsAnswered(true);
    onAnswer(selectedOption);
  }, [selectedOption, isAnswered, onAnswer]);

  /**
   * 获取选项样式
   */
  const getOptionStyle = (optionIndex: number, optionValue: string) => {
    if (!showResult && !isAnswered) {
      return {
        bg: selectedOption === optionValue ? 'primary.50' : bgColor,
        borderColor: selectedOption === optionValue ? 'primary.500' : borderColor,
        borderWidth: '2px',
      };
    }

    const isCorrect = optionIndex === question.correctIndex;
    const isSelected = selectedOption === optionValue || userAnswer?.answer === optionValue;

    if (isCorrect) {
      return {
        bg: correctColor,
        borderColor: 'green.500',
        borderWidth: '2px',
      };
    }

    if (isSelected && !isCorrect) {
      return {
        bg: incorrectColor,
        borderColor: 'red.500',
        borderWidth: '2px',
      };
    }

    return {
      bg: bgColor,
      borderColor: borderColor,
      borderWidth: '1px',
    };
  };

  /**
   * 获取选项图标
   */
  const getOptionIcon = (optionIndex: number, optionValue: string) => {
    if (!showResult && !isAnswered) return null;

    const isCorrect = optionIndex === question.correctIndex;
    const isSelected = selectedOption === optionValue || userAnswer?.answer === optionValue;

    if (isCorrect) {
      return (
        <ScaleFade in={true} initialScale={0.5}>
          <CheckIcon width={20} height={20} color="green" />
        </ScaleFade>
      );
    }

    if (isSelected && !isCorrect) {
      return (
        <ScaleFade in={true} initialScale={0.5}>
          <XMarkIcon width={20} height={20} color="red" />
        </ScaleFade>
      );
    }

    return null;
  };

  return (
    <Box className={className} w="full" maxW="600px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* 题目信息 */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Badge colorScheme="primary" variant="subtle">
              选择题
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

          {/* 题目文本 */}
          <Text fontSize="lg" fontWeight="medium" mb={6}>
            {question.question}
          </Text>
        </Box>

        {/* 选项列表 */}
        <RadioGroup value={selectedOption} onChange={handleOptionSelect}>
          <Stack spacing={3}>
            {question.options.map((option, index) => {
              const optionValue = index.toString();
              const optionStyle = getOptionStyle(index, optionValue);
              const optionIcon = getOptionIcon(index, optionValue);

              return (
                <Fade key={index} in={true} transition={{ delay: index * 0.1 }}>
                  <Box
                    p={4}
                    borderRadius="lg"
                    cursor={disabled || isAnswered ? 'not-allowed' : 'pointer'}
                    transition="all 0.2s"
                    _hover={
                      !disabled && !isAnswered
                        ? {
                            transform: 'translateY(-2px)',
                            shadow: 'md',
                          }
                        : {}
                    }
                    {...optionStyle}
                    onClick={() => handleOptionSelect(optionValue)}
                  >
                    <HStack justify="space-between" align="center">
                      <HStack spacing={3} flex="1">
                        <Radio
                          value={optionValue}
                          isDisabled={disabled || isAnswered}
                          colorScheme="primary"
                        >
                          <Text fontSize="md" ml={2}>
                            {option}
                          </Text>
                        </Radio>
                      </HStack>
                      {optionIcon}
                    </HStack>
                  </Box>
                </Fade>
              );
            })}
          </Stack>
        </RadioGroup>

        {/* 提交按钮 */}
        {!showResult && !isAnswered && (
          <Button
            colorScheme="primary"
            size="lg"
            onClick={handleSubmit}
            isDisabled={!selectedOption || disabled}
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'lg',
            }}
          >
            提交答案
          </Button>
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

export default MultipleChoiceQuestion;
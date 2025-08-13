import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Fade,
  Container,
} from '@chakra-ui/react';
import { QuizQuestion, UserAnswer, PracticeSession } from '@/types/practice';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { FillBlankQuestion } from './FillBlankQuestion';
import { ListeningQuestion } from './ListeningQuestion';
import { DragDropQuestion } from './DragDropQuestion';
import { Timer } from './Timer';
import { ProgressIndicator } from './ProgressIndicator';
import { FeedbackDisplay } from './FeedbackDisplay';

/**
 * 练习容器组件Props
 */
interface QuizContainerProps {
  /** 题目列表 */
  questions: QuizQuestion[];
  /** 练习会话配置 */
  session: PracticeSession;
  /** 答题完成回调 */
  onComplete: (answers: UserAnswer[]) => void;
  /** 退出练习回调 */
  onExit?: () => void;
  /** 是否显示计时器 */
  showTimer?: boolean;
  /** 是否显示进度 */
  showProgress?: boolean;
  /** 是否显示即时反馈 */
  showInstantFeedback?: boolean;
}

/**
 * 练习容器组件
 * 整合所有练习组件，管理答题流程和状态
 */
export const QuizContainer: React.FC<QuizContainerProps> = ({
  questions,
  session,
  onComplete,
  onExit,
  showTimer = true,
  showProgress = true,
  showInstantFeedback = true,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<UserAnswer | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // 主题颜色
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // 当前题目
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  /**
   * 初始化计时器
   */
  useEffect(() => {
    if (currentQuestion && showTimer) {
      setTimeLeft(currentQuestion.timeLimit);
    }
  }, [currentQuestion, showTimer]);

  /**
   * 处理答题
   */
  const handleAnswer = useCallback((answer: string | string[] | { [key: string]: string }) => {
    if (!currentQuestion || isCompleted) return;

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer,
      isCorrect: checkAnswer(currentQuestion, answer),
      timeSpent: currentQuestion.timeLimit - timeLeft,
      answeredAt: new Date(),
      score: 0, // 将在后续计算
    };

    // 计算得分
    userAnswer.score = userAnswer.isCorrect ? currentQuestion.points : 0;

    setCurrentAnswer(userAnswer);
    setAnswers(prev => [...prev, userAnswer]);

    // 显示即时反馈
    if (showInstantFeedback) {
      setShowFeedback(true);
    } else {
      // 直接进入下一题或完成
      handleNextQuestion();
    }
  }, [currentQuestion, timeLeft, isCompleted, showInstantFeedback]);

  /**
   * 检查答案是否正确
   */
  const checkAnswer = (question: QuizQuestion, answer: string | string[] | { [key: string]: string }): boolean => {
    switch (question.type) {
      case 'multiple_choice':
        const mcQuestion = question as any;
        return answer === mcQuestion.correctIndex.toString();
      
      case 'fill_blank':
        const fbQuestion = question as any;
        if (Array.isArray(answer)) {
          return fbQuestion.blanks.every((blank: any, index: number) =>
            answer[index]?.trim().toLowerCase() === blank.answer.toLowerCase()
          );
        }
        return false;
      
      case 'listening':
        return typeof answer === 'string' && 
               answer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
      
      case 'drag_drop':
        const ddQuestion = question as any;
        if (Array.isArray(answer)) {
          return ddQuestion.items.every((item: any, index: number) => {
            const correctItem = ddQuestion.items.find((i: any) => i.correctPosition === index);
            return correctItem && answer[index] === correctItem.id;
          });
        }
        return false;
      
      default:
        return false;
    }
  };

  /**
   * 处理时间到
   */
  const handleTimeUp = useCallback(() => {
    if (currentQuestion && !isCompleted) {
      // 自动提交空答案
      handleAnswer('');
    }
  }, [currentQuestion, isCompleted, handleAnswer]);

  /**
   * 进入下一题
   */
  const handleNextQuestion = useCallback(() => {
    setShowFeedback(false);
    setCurrentAnswer(null);

    if (isLastQuestion) {
      // 完成练习
      setIsCompleted(true);
      onComplete(answers);
    } else {
      // 进入下一题
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [isLastQuestion, answers, onComplete]);

  /**
   * 关闭反馈
   */
  const handleCloseFeedback = useCallback(() => {
    setShowFeedback(false);
    handleNextQuestion();
  }, [handleNextQuestion]);

  /**
   * 渲染当前题目组件
   */
  const renderCurrentQuestion = () => {
    if (!currentQuestion) return null;

    const commonProps = {
      question: currentQuestion,
      onAnswer: handleAnswer,
      disabled: showFeedback || isCompleted,
    };

    switch (currentQuestion.type) {
      case 'multiple_choice':
        return <MultipleChoiceQuestion {...commonProps} />;
      
      case 'fill_blank':
        return <FillBlankQuestion {...commonProps} />;
      
      case 'listening':
        return <ListeningQuestion {...commonProps} />;
      
      case 'drag_drop':
        return <DragDropQuestion {...commonProps} />;
      
      default:
        return null;
    }
  };

  /**
   * 获取反馈信息
   */
  const getFeedbackProps = () => {
    if (!currentAnswer || !currentQuestion) return null;

    return {
      isCorrect: currentAnswer.isCorrect,
      message: currentAnswer.isCorrect ? '回答正确！' : '回答错误',
      explanation: currentQuestion.explanation,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: typeof currentAnswer.answer === 'string' ? currentAnswer.answer : JSON.stringify(currentAnswer.answer),
      isVisible: showFeedback,
      onClose: handleCloseFeedback,
      onNext: isLastQuestion ? undefined : handleNextQuestion,
    };
  };

  if (isCompleted) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">
          <VStack spacing={6}>
            <Box fontSize="2xl" fontWeight="bold">
              练习完成！
            </Box>
            <Button colorScheme="primary" size="lg" onClick={onExit}>
              返回
            </Button>
          </VStack>
        </Box>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={6}>
      <Container maxW="container.lg">
        <VStack spacing={6}>
          {/* 顶部信息栏 */}
          <HStack justify="space-between" w="full" wrap="wrap" spacing={4}>
            {/* 进度指示器 */}
            {showProgress && (
              <Box flex="1" minW="200px">
                <ProgressIndicator
                  current={currentQuestionIndex + 1}
                  total={questions.length}
                  answered={answers.length}
                  correct={answers.filter(a => a.isCorrect).length}
                  mode="detailed"
                />
              </Box>
            )}

            {/* 计时器 */}
            {showTimer && currentQuestion && (
              <Box>
                <Timer
                  duration={currentQuestion.timeLimit}
                  onTimeUp={handleTimeUp}
                  isPaused={showFeedback}
                  variant="default"
                />
              </Box>
            )}
          </HStack>

          {/* 题目内容 */}
          <Fade in={true} key={currentQuestionIndex}>
            <Box w="full">
              {renderCurrentQuestion()}
            </Box>
          </Fade>

          {/* 底部操作栏 */}
          <HStack justify="space-between" w="full">
            <Button
              variant="outline"
              onClick={onExit}
              isDisabled={showFeedback}
            >
              退出练习
            </Button>

            <Box>
              {/* 可以添加其他操作按钮 */}
            </Box>
          </HStack>
        </VStack>
      </Container>

      {/* 反馈弹窗 */}
      {showInstantFeedback && currentAnswer && (
        <FeedbackDisplay {...getFeedbackProps()!} />
      )}
    </Box>
  );
};

export default QuizContainer;
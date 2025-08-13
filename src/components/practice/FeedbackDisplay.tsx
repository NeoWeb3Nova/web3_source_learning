import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useColorModeValue,
  keyframes,
  Flex,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { FeedbackProps } from './types';

// 动画关键帧
const bounceIn = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
`;

/**
 * 实时反馈显示组件
 * 支持正确/错误动画效果和详细反馈信息
 */
export const FeedbackDisplay: React.FC<FeedbackProps> = ({
  isCorrect,
  message,
  explanation,
  correctAnswer,
  userAnswer,
  isVisible,
  onClose,
  onNext,
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  // 主题颜色
  const correctBg = useColorModeValue('green.50', 'green.900');
  const incorrectBg = useColorModeValue('red.50', 'red.900');
  const overlayBg = useColorModeValue('blackAlpha.600', 'blackAlpha.800');

  // 当反馈显示时触发动画
  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  /**
   * 获取反馈图标
   */
  const getFeedbackIcon = () => {
    if (isCorrect) {
      return (
        <Box
          animation={showAnimation ? `${bounceIn} 0.6s ease-out` : undefined}
          color="green.500"
        >
          <CheckCircleIcon width={64} height={64} />
        </Box>
      );
    } else {
      return (
        <Box
          animation={showAnimation ? `${shake} 0.6s ease-in-out` : undefined}
          color="red.500"
        >
          <XCircleIcon width={64} height={64} />
        </Box>
      );
    }
  };

  /**
   * 获取反馈标题
   */
  const getFeedbackTitle = () => {
    if (isCorrect) {
      const titles = ['太棒了！', '答对了！', '很好！', '正确！', '优秀！'];
      return titles[Math.floor(Math.random() * titles.length)];
    } else {
      const titles = ['答错了', '不正确', '再试试', '加油！'];
      return titles[Math.floor(Math.random() * titles.length)];
    }
  };

  /**
   * 获取装饰元素
   */
  const getDecorations = () => {
    if (!isCorrect) return null;

    return (
      <>
        {/* 左上角装饰 */}
        <Box
          position="absolute"
          top="20px"
          left="20px"
          animation={showAnimation ? `${sparkle} 1s ease-in-out infinite` : undefined}
          color="yellow.400"
        >
          <SparklesIcon width={24} height={24} />
        </Box>

        {/* 右上角装饰 */}
        <Box
          position="absolute"
          top="20px"
          right="20px"
          animation={showAnimation ? `${sparkle} 1s ease-in-out infinite 0.3s` : undefined}
          color="orange.400"
        >
          <FireIcon width={24} height={24} />
        </Box>

        {/* 左下角装饰 */}
        <Box
          position="absolute"
          bottom="20px"
          left="20px"
          animation={showAnimation ? `${sparkle} 1s ease-in-out infinite 0.6s` : undefined}
          color="purple.400"
        >
          <SparklesIcon width={20} height={20} />
        </Box>

        {/* 右下角装饰 */}
        <Box
          position="absolute"
          bottom="20px"
          right="20px"
          animation={showAnimation ? `${sparkle} 1s ease-in-out infinite 0.9s` : undefined}
          color="pink.400"
        >
          <SparklesIcon width={20} height={20} />
        </Box>
      </>
    );
  };

  return (
    <Modal
      isOpen={isVisible}
      onClose={onClose || (() => {})}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered
      size="md"
    >
      <ModalOverlay bg={overlayBg} backdropFilter="blur(4px)" />
      <ModalContent
        bg={isCorrect ? correctBg : incorrectBg}
        border="2px solid"
        borderColor={isCorrect ? 'green.200' : 'red.200'}
        borderRadius="2xl"
        position="relative"
        overflow="hidden"
      >
        {/* 装饰元素 */}
        {getDecorations()}

        <ModalBody p={8}>
          <VStack spacing={6} textAlign="center">
            {/* 反馈图标 */}
            <Box>{getFeedbackIcon()}</Box>

            {/* 反馈标题 */}
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={isCorrect ? 'green.700' : 'red.700'}
              animation={showAnimation ? `${bounceIn} 0.8s ease-out 0.2s both` : undefined}
            >
              {getFeedbackTitle()}
            </Text>

            {/* 自定义消息 */}
            {message && (
              <Text
                fontSize="md"
                color={isCorrect ? 'green.600' : 'red.600'}
                animation={showAnimation ? `${bounceIn} 1s ease-out 0.4s both` : undefined}
              >
                {message}
              </Text>
            )}

            {/* 答案对比 */}
            {(userAnswer || correctAnswer) && (
              <Box
                w="full"
                animation={showAnimation ? `${bounceIn} 1.2s ease-out 0.6s both` : undefined}
              >
                <VStack spacing={3}>
                  {userAnswer && (
                    <Box w="full">
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        您的答案
                      </Text>
                      <Box
                        p={3}
                        bg={useColorModeValue('white', 'gray.700')}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={isCorrect ? 'green.300' : 'red.300'}
                      >
                        <Text fontSize="md" fontWeight="medium">
                          {userAnswer}
                        </Text>
                      </Box>
                    </Box>
                  )}

                  {correctAnswer && !isCorrect && (
                    <Box w="full">
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        正确答案
                      </Text>
                      <Box
                        p={3}
                        bg={useColorModeValue('green.100', 'green.800')}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="green.300"
                      >
                        <Text fontSize="md" fontWeight="medium" color="green.700">
                          {correctAnswer}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}

            {/* 解释说明 */}
            {explanation && (
              <Box
                w="full"
                p={4}
                bg={useColorModeValue('blue.50', 'blue.900')}
                borderRadius="lg"
                border="1px solid"
                borderColor="blue.200"
                animation={showAnimation ? `${bounceIn} 1.4s ease-out 0.8s both` : undefined}
              >
                <Text fontSize="sm" fontWeight="medium" color="blue.700" mb={2}>
                  解释说明
                </Text>
                <Text fontSize="sm" color="blue.600">
                  {explanation}
                </Text>
              </Box>
            )}

            {/* 操作按钮 */}
            <Flex
              gap={3}
              w="full"
              justify="center"
              animation={showAnimation ? `${bounceIn} 1.6s ease-out 1s both` : undefined}
            >
              {onClose && (
                <Button
                  variant="outline"
                  colorScheme={isCorrect ? 'green' : 'red'}
                  onClick={onClose}
                  size="lg"
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'lg',
                  }}
                >
                  关闭
                </Button>
              )}

              {onNext && (
                <Button
                  colorScheme={isCorrect ? 'green' : 'red'}
                  onClick={onNext}
                  size="lg"
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'lg',
                  }}
                >
                  下一题
                </Button>
              )}
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FeedbackDisplay;
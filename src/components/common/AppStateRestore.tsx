/**
 * 应用状态恢复组件
 * 在应用启动时恢复用户的学习状态和设置
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { FiRefreshCw, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useAppStateRestore, useDataPersistence } from '@/hooks/useDataPersistence';
import { VocabularyItem, UserProgress, UserSettings } from '@/types';

interface AppStateRestoreProps {
  onRestoreComplete: (data: {
    userProgress: UserProgress | null;
    vocabularyList: VocabularyItem[];
    userSettings: UserSettings | null;
  }) => void;
  onRestoreError?: (error: Error) => void;
}

export const AppStateRestore: React.FC<AppStateRestoreProps> = ({
  onRestoreComplete,
  onRestoreError,
}) => {
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const toast = useToast();

  const { isRestoring, restoredData } = useAppStateRestore();
  const { storageUsage } = useDataPersistence();

  const {
    isOpen: isErrorModalOpen,
    onOpen: onErrorModalOpen,
    onClose: onErrorModalClose,
  } = useDisclosure();

  /**
   * 模拟恢复进度
   */
  useEffect(() => {
    if (isRestoring) {
      const steps = [
        { step: '检查本地存储...', progress: 20 },
        { step: '恢复用户设置...', progress: 40 },
        { step: '加载词汇列表...', progress: 60 },
        { step: '恢复学习进度...', progress: 80 },
        { step: '完成状态恢复...', progress: 100 },
      ];

      let currentStepIndex = 0;
      const interval = setInterval(() => {
        if (currentStepIndex < steps.length) {
          const { step, progress } = steps[currentStepIndex];
          setCurrentStep(step);
          setRestoreProgress(progress);
          currentStepIndex++;
        } else {
          clearInterval(interval);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isRestoring]);

  /**
   * 处理恢复完成
   */
  useEffect(() => {
    if (!isRestoring && restoreProgress === 100) {
      try {
        // 验证恢复的数据
        if (restoredData.userProgress && restoredData.vocabularyList) {
          setCurrentStep('状态恢复完成');
          onRestoreComplete(restoredData);
          
          toast({
            title: '状态恢复成功',
            description: `已恢复 ${restoredData.vocabularyList.length} 个词汇和学习进度`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          // 首次使用或数据为空
          setCurrentStep('初始化应用状态');
          onRestoreComplete(restoredData);
        }
      } catch (error) {
        console.error('Failed to process restored data:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : '未知错误');
        onErrorModalOpen();
        
        if (onRestoreError) {
          onRestoreError(error instanceof Error ? error : new Error('恢复失败'));
        }
      }
    }
  }, [isRestoring, restoreProgress, restoredData, onRestoreComplete, onRestoreError, toast, onErrorModalOpen]);

  /**
   * 重试恢复
   */
  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
    setRestoreProgress(0);
    setCurrentStep('');
    onErrorModalClose();
    
    // 刷新页面重新开始恢复过程
    window.location.reload();
  };

  /**
   * 跳过恢复，使用默认状态
   */
  const handleSkipRestore = () => {
    const defaultData = {
      userProgress: null,
      vocabularyList: [],
      userSettings: null,
    };
    
    onRestoreComplete(defaultData);
    onErrorModalClose();
    
    toast({
      title: '使用默认状态',
      description: '将使用默认设置开始学习',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // 如果不在恢复状态且没有错误，不显示组件
  if (!isRestoring && !hasError && restoreProgress === 0) {
    return null;
  }

  return (
    <>
      {/* 恢复进度显示 */}
      {isRestoring && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255, 255, 255, 0.95)"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          _dark={{
            bg: 'rgba(26, 32, 44, 0.95)',
          }}
        >
          <VStack spacing={6} maxW="400px" w="full" px={6}>
            {/* 标题 */}
            <VStack spacing={2}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text fontSize="xl" fontWeight="semibold">
                恢复应用状态
              </Text>
              <Text fontSize="sm" color="gray.600" textAlign="center" _dark={{ color: 'gray.400' }}>
                正在恢复您的学习进度和设置，请稍候...
              </Text>
            </VStack>

            {/* 进度条 */}
            <VStack spacing={3} w="full">
              <Progress
                value={restoreProgress}
                colorScheme="blue"
                size="lg"
                w="full"
                borderRadius="full"
              />
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  {currentStep}
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {restoreProgress}%
                </Text>
              </HStack>
            </VStack>

            {/* 存储信息 */}
            {storageUsage.used > 0 && (
              <Alert status="info" borderRadius="md" size="sm">
                <AlertIcon />
                <VStack align="start" spacing={1} flex={1}>
                  <AlertTitle fontSize="sm">发现本地数据</AlertTitle>
                  <AlertDescription fontSize="xs">
                    存储使用: {(storageUsage.used / 1024).toFixed(1)} KB
                    ({storageUsage.percentage.toFixed(1)}%)
                  </AlertDescription>
                </VStack>
              </Alert>
            )}
          </VStack>
        </Box>
      )}

      {/* 错误处理模态框 */}
      <Modal isOpen={isErrorModalOpen} onClose={onErrorModalClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Icon as={FiAlertTriangle} color="red.500" />
              <Text>状态恢复失败</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>恢复过程中发生错误</AlertTitle>
                  <AlertDescription>
                    {errorMessage || '无法恢复应用状态，可能是数据损坏或存储空间不足。'}
                  </AlertDescription>
                </Box>
              </Alert>

              <VStack spacing={2} align="start">
                <Text fontSize="sm" fontWeight="semibold">
                  您可以选择：
                </Text>
                <VStack align="start" spacing={1} pl={4}>
                  <Text fontSize="sm">• 重试恢复过程</Text>
                  <Text fontSize="sm">• 跳过恢复，使用默认设置</Text>
                </VStack>
              </VStack>

              {storageUsage.percentage > 90 && (
                <Alert status="warning" borderRadius="md" size="sm">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    存储空间不足可能是导致恢复失败的原因。
                  </AlertDescription>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleSkipRestore}
            >
              跳过恢复
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiRefreshCw />}
              onClick={handleRetry}
            >
              重试
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

/**
 * 恢复成功指示器
 */
export const RestoreSuccessIndicator: React.FC<{
  restoredItemsCount: number;
  onDismiss: () => void;
}> = ({ restoredItemsCount, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // 5秒后自动消失

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      zIndex={1000}
      maxW="300px"
    >
      <Alert
        status="success"
        borderRadius="md"
        shadow="lg"
        bg="white"
        border="1px"
        borderColor="green.200"
        _dark={{
          bg: 'gray.800',
          borderColor: 'green.600',
        }}
      >
        <AlertIcon />
        <VStack align="start" spacing={1} flex={1}>
          <AlertTitle fontSize="sm">
            <HStack spacing={2}>
              <Icon as={FiCheckCircle} />
              <Text>状态恢复完成</Text>
            </HStack>
          </AlertTitle>
          <AlertDescription fontSize="xs">
            已恢复 {restoredItemsCount} 项学习数据
          </AlertDescription>
        </VStack>
        <Button size="xs" variant="ghost" onClick={onDismiss}>
          ×
        </Button>
      </Alert>
    </Box>
  );
};

/**
 * 数据迁移提示组件
 */
export const DataMigrationPrompt: React.FC<{
  onMigrate: () => void;
  onSkip: () => void;
}> = ({ onMigrate, onSkip }) => {
  return (
    <Alert status="info" borderRadius="md">
      <AlertIcon />
      <VStack align="start" spacing={2} flex={1}>
        <AlertTitle fontSize="sm">发现旧版本数据</AlertTitle>
        <AlertDescription fontSize="xs">
          检测到旧版本的学习数据，是否需要迁移到新版本？
        </AlertDescription>
        <HStack spacing={2}>
          <Button size="xs" colorScheme="blue" onClick={onMigrate}>
            迁移数据
          </Button>
          <Button size="xs" variant="ghost" onClick={onSkip}>
            跳过
          </Button>
        </HStack>
      </VStack>
    </Alert>
  );
};
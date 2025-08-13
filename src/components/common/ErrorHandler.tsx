/**
 * 用户友好的错误处理组件
 * 提供统一的错误显示、重试机制和错误恢复功能
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Icon,
  Badge,
  Collapse,
  Code,
  Divider,
} from '@chakra-ui/react';
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiHome,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiExternalLink,
} from 'react-icons/fi';
import { useNetworkStatus } from './NetworkStatus';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

/**
 * 错误严重程度枚举
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  id?: string;
  type: ErrorType;
  severity: ErrorSeverity;
  title: string;
  message: string;
  details?: string;
  code?: string | number;
  timestamp?: Date;
  stack?: string;
  context?: Record<string, any>;
  retryable?: boolean;
  reportable?: boolean;
}

/**
 * 错误处理配置
 */
interface ErrorHandlerConfig {
  showDetails?: boolean;
  allowRetry?: boolean;
  allowReport?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * 错误处理Hook
 */
export const useErrorHandler = (config: ErrorHandlerConfig = {}) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});
  const toast = useToast();
  const { isOnline } = useNetworkStatus();

  const {
    showDetails = false,
    allowRetry = true,
    allowReport = true,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1000,
  } = config;

  /**
   * 添加错误
   */
  const addError = useCallback((error: Partial<ErrorInfo> & Pick<ErrorInfo, 'type' | 'title' | 'message'>) => {
    const errorInfo: ErrorInfo = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
      retryable: true,
      reportable: true,
      ...error,
    };

    setErrors(prev => [...prev, errorInfo]);

    // 显示Toast通知
    toast({
      title: errorInfo.title,
      description: errorInfo.message,
      status: 'error',
      duration: errorInfo.severity === ErrorSeverity.CRITICAL ? null : 5000,
      isClosable: true,
    });

    return errorInfo.id!;
  }, [toast]);

  /**
   * 移除错误
   */
  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
    setRetryCount(prev => {
      const newCount = { ...prev };
      delete newCount[errorId];
      return newCount;
    });
  }, []);

  /**
   * 清除所有错误
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
    setRetryCount({});
  }, []);

  /**
   * 重试操作
   */
  const retryOperation = useCallback(async (
    errorId: string,
    operation: () => Promise<void>
  ) => {
    const error = errors.find(e => e.id === errorId);
    if (!error || !error.retryable) return;

    const currentRetries = retryCount[errorId] || 0;
    if (currentRetries >= maxRetries) {
      toast({
        title: '重试次数已达上限',
        description: '请稍后再试或联系技术支持',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setRetryCount(prev => ({ ...prev, [errorId]: currentRetries + 1 }));
      
      // 延迟重试
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      await operation();
      
      // 重试成功，移除错误
      removeError(errorId);
      
      toast({
        title: '操作成功',
        description: '重试操作已成功完成',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      
      if (currentRetries + 1 >= maxRetries) {
        toast({
          title: '重试失败',
          description: '已达到最大重试次数，请联系技术支持',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [errors, retryCount, maxRetries, retryDelay, removeError, toast]);

  /**
   * 报告错误
   */
  const reportError = useCallback(async (errorId: string) => {
    const error = errors.find(e => e.id === errorId);
    if (!error || !error.reportable) return;

    try {
      // 构建错误报告
      const errorReport = {
        id: error.id,
        type: error.type,
        severity: error.severity,
        title: error.title,
        message: error.message,
        details: error.details,
        code: error.code,
        timestamp: error.timestamp,
        stack: error.stack,
        context: error.context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        isOnline,
      };

      // 发送错误报告（这里可以集成实际的错误报告服务）
      console.log('Error report:', errorReport);
      
      // 模拟发送到服务器
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: '错误报告已发送',
        description: '感谢您的反馈，我们会尽快处理',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
      
      toast({
        title: '报告发送失败',
        description: '请稍后重试或通过其他方式联系我们',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [errors, isOnline, toast]);

  /**
   * 自动重试逻辑
   */
  useEffect(() => {
    if (!autoRetry) return;

    const retryableErrors = errors.filter(error => 
      error.retryable && 
      error.type === ErrorType.NETWORK && 
      (retryCount[error.id!] || 0) < maxRetries
    );

    retryableErrors.forEach(error => {
      const timeoutId = setTimeout(() => {
        // 这里需要传入具体的重试操作
        // retryOperation(error.id!, someOperation);
      }, retryDelay);

      return () => clearTimeout(timeoutId);
    });
  }, [errors, autoRetry, retryCount, maxRetries, retryDelay]);

  return {
    errors,
    retryCount,
    addError,
    removeError,
    clearErrors,
    retryOperation,
    reportError,
  };
};

/**
 * 错误显示组件
 */
export const ErrorDisplay: React.FC<{
  error: ErrorInfo;
  onRetry?: () => void;
  onReport?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}> = ({ error, onRetry, onReport, onDismiss, showDetails = false }) => {
  const { isOpen: isDetailsOpen, onToggle: toggleDetails } = useDisclosure();

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'blue';
      case ErrorSeverity.MEDIUM:
        return 'yellow';
      case ErrorSeverity.HIGH:
        return 'orange';
      case ErrorSeverity.CRITICAL:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTypeIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return FiRefreshCw;
      case ErrorType.PERMISSION:
        return FiAlertTriangle;
      default:
        return FiAlertTriangle;
    }
  };

  const copyErrorDetails = () => {
    const details = JSON.stringify({
      id: error.id,
      type: error.type,
      title: error.title,
      message: error.message,
      details: error.details,
      code: error.code,
      timestamp: error.timestamp,
    }, null, 2);

    navigator.clipboard.writeText(details);
  };

  return (
    <Alert
      status="error"
      variant="left-accent"
      borderRadius="md"
      flexDirection="column"
      alignItems="flex-start"
      p={4}
    >
      <HStack w="full" justify="space-between" mb={2}>
        <HStack spacing={2}>
          <AlertIcon as={getTypeIcon(error.type)} />
          <VStack align="start" spacing={0}>
            <AlertTitle fontSize="sm">{error.title}</AlertTitle>
            <HStack spacing={2}>
              <Badge colorScheme={getSeverityColor(error.severity)} size="sm">
                {error.severity}
              </Badge>
              <Badge variant="outline" size="sm">
                {error.type}
              </Badge>
              {error.code && (
                <Badge variant="subtle" size="sm">
                  {error.code}
                </Badge>
              )}
            </HStack>
          </VStack>
        </HStack>
        
        {onDismiss && (
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            ×
          </Button>
        )}
      </HStack>

      <AlertDescription fontSize="sm" mb={3}>
        {error.message}
      </AlertDescription>

      <HStack spacing={2} w="full" justify="space-between">
        <HStack spacing={2}>
          {onRetry && error.retryable && (
            <Button size="sm" leftIcon={<FiRefreshCw />} onClick={onRetry}>
              重试
            </Button>
          )}
          {onReport && error.reportable && (
            <Button size="sm" variant="outline" leftIcon={<FiMail />} onClick={onReport}>
              报告问题
            </Button>
          )}
        </HStack>

        {showDetails && (error.details || error.stack) && (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={isDetailsOpen ? FiChevronUp : FiChevronDown} />}
            onClick={toggleDetails}
          >
            详情
          </Button>
        )}
      </HStack>

      {showDetails && (
        <Collapse in={isDetailsOpen} animateOpacity style={{ width: '100%' }}>
          <Divider my={3} />
          <VStack spacing={3} align="stretch">
            {error.details && (
              <Box>
                <Text fontSize="xs" fontWeight="semibold" mb={1}>
                  错误详情:
                </Text>
                <Code fontSize="xs" p={2} borderRadius="md" whiteSpace="pre-wrap">
                  {error.details}
                </Code>
              </Box>
            )}

            {error.stack && (
              <Box>
                <Text fontSize="xs" fontWeight="semibold" mb={1}>
                  堆栈信息:
                </Text>
                <Code
                  fontSize="xs"
                  p={2}
                  borderRadius="md"
                  whiteSpace="pre-wrap"
                  maxH="150px"
                  overflowY="auto"
                >
                  {error.stack}
                </Code>
              </Box>
            )}

            <HStack spacing={2}>
              <Button size="xs" leftIcon={<FiCopy />} onClick={copyErrorDetails}>
                复制详情
              </Button>
              {error.timestamp && (
                <Text fontSize="xs" color="gray.500">
                  {error.timestamp.toLocaleString()}
                </Text>
              )}
            </HStack>
          </VStack>
        </Collapse>
      )}
    </Alert>
  );
};

/**
 * 错误列表组件
 */
export const ErrorList: React.FC<{
  errors: ErrorInfo[];
  onRetry?: (errorId: string) => void;
  onReport?: (errorId: string) => void;
  onDismiss?: (errorId: string) => void;
  onClearAll?: () => void;
  showDetails?: boolean;
}> = ({ errors, onRetry, onReport, onDismiss, onClearAll, showDetails = false }) => {
  if (errors.length === 0) return null;

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="semibold">
          错误列表 ({errors.length})
        </Text>
        {onClearAll && (
          <Button size="sm" variant="ghost" onClick={onClearAll}>
            清除全部
          </Button>
        )}
      </HStack>

      {errors.map(error => (
        <ErrorDisplay
          key={error.id}
          error={error}
          onRetry={onRetry ? () => onRetry(error.id!) : undefined}
          onReport={onReport ? () => onReport(error.id!) : undefined}
          onDismiss={onDismiss ? () => onDismiss(error.id!) : undefined}
          showDetails={showDetails}
        />
      ))}
    </VStack>
  );
};

/**
 * 错误模态框组件
 */
export const ErrorModal: React.FC<{
  error: ErrorInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onReport?: () => void;
}> = ({ error, isOpen, onClose, onRetry, onReport }) => {
  if (!error) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <Icon as={FiAlertTriangle} color="red.500" />
            <Text>{error.title}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ErrorDisplay
            error={error}
            showDetails={true}
          />
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2}>
            {onRetry && error.retryable && (
              <Button leftIcon={<FiRefreshCw />} onClick={onRetry}>
                重试
              </Button>
            )}
            {onReport && error.reportable && (
              <Button variant="outline" leftIcon={<FiMail />} onClick={onReport}>
                报告问题
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              关闭
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

/**
 * 常用错误创建函数
 */
export const createError = {
  network: (message: string, details?: string): Partial<ErrorInfo> => ({
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    title: '网络错误',
    message,
    details,
    retryable: true,
  }),

  validation: (message: string, field?: string): Partial<ErrorInfo> => ({
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
    title: '验证错误',
    message,
    context: field ? { field } : undefined,
    retryable: false,
  }),

  permission: (message: string): Partial<ErrorInfo> => ({
    type: ErrorType.PERMISSION,
    severity: ErrorSeverity.HIGH,
    title: '权限错误',
    message,
    retryable: false,
  }),

  server: (message: string, code?: number): Partial<ErrorInfo> => ({
    type: ErrorType.SERVER,
    severity: ErrorSeverity.HIGH,
    title: '服务器错误',
    message,
    code,
    retryable: true,
  }),

  unknown: (message: string, error?: Error): Partial<ErrorInfo> => ({
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    title: '未知错误',
    message,
    details: error?.message,
    stack: error?.stack,
    retryable: true,
  }),
};
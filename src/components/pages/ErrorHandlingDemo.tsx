/**
 * 错误处理演示页面
 * 展示全局错误边界、网络状态检测、表单验证等功能
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { FiAlertTriangle, FiWifi, FiCheck, FiX } from 'react-icons/fi';
import {
  ErrorBoundary,
  SimpleErrorBoundary,
  NetworkStatusIndicator,
  OfflineAlert,
  NetworkRetry,
  useNetworkStatus,
  useFormValidation,
  FormField,
  ErrorSummary,
  SuccessMessage,
  ValidationRules,
  useErrorHandler,
  ErrorDisplay,
  ErrorList,
  createError,
  ErrorType,
  ErrorSeverity,
} from '@/components/common';

/**
 * 故意抛出错误的组件
 */
const BuggyComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('这是一个故意抛出的测试错误！');
  }
  return <Text color="green.500">组件正常运行中...</Text>;
};

/**
 * 网络请求模拟组件
 */
const NetworkRequestDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { isOnline } = useNetworkStatus();
  const toast = useToast();

  const simulateNetworkRequest = async (shouldFail: boolean = false) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (shouldFail) {
        throw new Error('网络请求失败：服务器返回500错误');
      }
      
      setSuccess(true);
      toast({
        title: '请求成功',
        description: '数据已成功获取',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      toast({
        title: '请求失败',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    simulateNetworkRequest(false);
  };

  if (error) {
    return (
      <NetworkRetry
        onRetry={handleRetry}
        isRetrying={isLoading}
        error={error}
      />
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack spacing={2}>
        <Text>网络状态:</Text>
        <NetworkStatusIndicator compact />
      </HStack>
      
      <HStack spacing={4}>
        <Button
          onClick={() => simulateNetworkRequest(false)}
          isLoading={isLoading}
          loadingText="请求中..."
          colorScheme="green"
          isDisabled={!isOnline}
        >
          成功请求
        </Button>
        <Button
          onClick={() => simulateNetworkRequest(true)}
          isLoading={isLoading}
          loadingText="请求中..."
          colorScheme="red"
          isDisabled={!isOnline}
        >
          失败请求
        </Button>
      </HStack>

      {success && (
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <AlertTitle>请求成功！</AlertTitle>
          <AlertDescription>数据已成功获取并处理。</AlertDescription>
        </Alert>
      )}
    </VStack>
  );
};

/**
 * 表单验证演示组件
 */
const FormValidationDemo: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  } = useFormValidation(
    { name: '', email: '', message: '' },
    {
      name: [
        ValidationRules.required('姓名为必填项'),
        ValidationRules.minLength(2, '姓名至少需要2个字符'),
      ],
      email: [
        ValidationRules.required('邮箱为必填项'),
        ValidationRules.email('请输入有效的邮箱地址'),
      ],
      message: [
        ValidationRules.required('消息为必填项'),
        ValidationRules.minLength(10, '消息至少需要10个字符'),
        ValidationRules.maxLength(500, '消息不能超过500个字符'),
      ],
    }
  );

  const formErrors = Object.entries(errors).map(([field, message]) => ({
    field,
    message,
    type: 'validation' as const,
  }));

  const onSubmit = async (formValues: Record<string, any>) => {
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Form submitted:', formValues);
    setShowSuccess(true);
    
    // 3秒后隐藏成功消息
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <VStack spacing={4} align="stretch">
      <ErrorSummary
        errors={formErrors}
        isVisible={formErrors.length > 0 && Object.keys(touched).length > 0}
      />
      
      <SuccessMessage
        message="表单提交成功！感谢您的反馈。"
        isVisible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
      />

      <VStack spacing={4} align="stretch">
        <FormField
          config={{
            name: 'name',
            label: '姓名',
            type: 'text',
            placeholder: '请输入您的姓名',
            required: true,
          }}
          value={values.name}
          error={errors.name}
          touched={touched.name}
          onChange={(value) => handleChange('name', value)}
          onBlur={() => handleBlur('name')}
        />

        <FormField
          config={{
            name: 'email',
            label: '邮箱',
            type: 'email',
            placeholder: '请输入您的邮箱地址',
            required: true,
          }}
          value={values.email}
          error={errors.email}
          touched={touched.email}
          onChange={(value) => handleChange('email', value)}
          onBlur={() => handleBlur('email')}
        />

        <FormField
          config={{
            name: 'message',
            label: '消息',
            type: 'textarea',
            placeholder: '请输入您的消息内容（至少10个字符）',
            required: true,
            helperText: '请详细描述您的问题或建议',
          }}
          value={values.message}
          error={errors.message}
          touched={touched.message}
          onChange={(value) => handleChange('message', value)}
          onBlur={() => handleBlur('message')}
        />
      </VStack>

      <HStack spacing={4}>
        <Button
          colorScheme="blue"
          onClick={() => handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          loadingText="提交中..."
          isDisabled={!isValid}
        >
          提交表单
        </Button>
        <Button variant="outline" onClick={reset}>
          重置表单
        </Button>
      </HStack>
    </VStack>
  );
};

/**
 * 高级错误处理演示组件
 */
const AdvancedErrorHandlingDemo: React.FC = () => {
  const { errors, addError, removeError, clearErrors, retryOperation, reportError } = useErrorHandler({
    showDetails: true,
    allowRetry: true,
    allowReport: true,
    maxRetries: 3,
  });

  const addNetworkError = () => {
    addError(createError.network(
      '无法连接到服务器，请检查网络连接',
      '连接超时：请求在30秒后超时'
    ));
  };

  const addValidationError = () => {
    addError(createError.validation(
      '表单验证失败：邮箱格式不正确',
      'email'
    ));
  };

  const addServerError = () => {
    addError(createError.server(
      '服务器内部错误，请稍后重试',
      500
    ));
  };

  const addPermissionError = () => {
    addError(createError.permission(
      '您没有权限执行此操作，请联系管理员'
    ));
  };

  const simulateRetryOperation = async () => {
    // 模拟重试操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('重试操作执行成功');
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="semibold">
        错误管理演示
      </Text>
      
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
        <Button size="sm" colorScheme="red" onClick={addNetworkError}>
          网络错误
        </Button>
        <Button size="sm" colorScheme="orange" onClick={addValidationError}>
          验证错误
        </Button>
        <Button size="sm" colorScheme="purple" onClick={addServerError}>
          服务器错误
        </Button>
        <Button size="sm" colorScheme="pink" onClick={addPermissionError}>
          权限错误
        </Button>
      </SimpleGrid>

      <HStack spacing={2}>
        <Button size="sm" variant="outline" onClick={clearErrors}>
          清除所有错误
        </Button>
        <Text fontSize="sm" color="gray.600">
          当前错误数量: {errors.length}
        </Text>
      </HStack>

      <ErrorList
        errors={errors}
        onRetry={(errorId) => {
          const error = errors.find(e => e.id === errorId);
          if (error?.retryable) {
            retryOperation(errorId, simulateRetryOperation);
          }
        }}
        onReport={reportError}
        onDismiss={removeError}
        showDetails={true}
      />
    </VStack>
  );
};

/**
 * 错误处理演示主页面
 */
export const ErrorHandlingDemo: React.FC = () => {
  const [showBuggyComponent, setShowBuggyComponent] = useState(false);
  const [throwError, setThrowError] = useState(false);

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} p={6}>
      <VStack spacing={8} maxW="1200px" mx="auto">
        {/* 页面标题 */}
        <VStack spacing={2}>
          <Heading size="xl">错误处理和用户体验优化演示</Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }} textAlign="center">
            展示全局错误边界、网络状态检测、表单验证和用户友好的错误处理机制
          </Text>
        </VStack>

        {/* 离线提示 */}
        <OfflineAlert />

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
          {/* 错误边界演示 */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack spacing={2}>
                  <FiAlertTriangle />
                  <Text>错误边界演示</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  测试全局错误边界的错误捕获和恢复功能
                </Text>
                
                <HStack spacing={4}>
                  <Button
                    colorScheme={showBuggyComponent ? 'red' : 'green'}
                    onClick={() => {
                      setShowBuggyComponent(!showBuggyComponent);
                      setThrowError(false);
                    }}
                  >
                    {showBuggyComponent ? '隐藏组件' : '显示组件'}
                  </Button>
                  
                  {showBuggyComponent && (
                    <Button
                      colorScheme="red"
                      variant="outline"
                      onClick={() => setThrowError(true)}
                    >
                      触发错误
                    </Button>
                  )}
                </HStack>

                {showBuggyComponent && (
                  <SimpleErrorBoundary>
                    <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
                      <BuggyComponent shouldThrow={throwError} />
                    </Box>
                  </SimpleErrorBoundary>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* 网络状态演示 */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack spacing={2}>
                  <FiWifi />
                  <Text>网络状态检测</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  演示网络连接状态检测和离线处理
                </Text>
                <NetworkRequestDemo />
              </VStack>
            </CardBody>
          </Card>

          {/* 表单验证演示 */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack spacing={2}>
                  <FiCheck />
                  <Text>表单验证</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  展示实时表单验证和错误处理
                </Text>
                <FormValidationDemo />
              </VStack>
            </CardBody>
          </Card>

          {/* 高级错误处理演示 */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack spacing={2}>
                  <FiX />
                  <Text>高级错误处理</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  演示错误分类、重试机制和错误报告
                </Text>
                <AdvancedErrorHandlingDemo />
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 网络状态详情 */}
        <Card w="full">
          <CardHeader>
            <Heading size="md">网络状态详情</Heading>
          </CardHeader>
          <CardBody>
            <NetworkStatusIndicator showDetails />
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
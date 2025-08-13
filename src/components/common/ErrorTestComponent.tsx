import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  useColorModeValue,
} from '@chakra-ui/react';
import { useError } from '../../contexts/ErrorContext';
import useAsyncOperation from '../../hooks/useAsyncOperation';
import { apiGet, apiPost } from '../../utils/apiErrorHandler';

// Component for testing error handling in development
const ErrorTestComponent: React.FC = () => {
  const { handleError, getErrorReports, clearErrorReports } = useError();
  const [errorReports, setErrorReports] = useState(getErrorReports());
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  // Test async operation hook
  const testAsyncOperation = useAsyncOperation(
    async (shouldFail: boolean) => {
      if (shouldFail) {
        throw new Error('Test async operation error');
      }
      return 'Success!';
    }
  );

  // Test API call hook
  const testApiCall = useAsyncOperation(
    async (endpoint: string) => {
      return apiGet(endpoint);
    }
  );

  const refreshErrorReports = () => {
    setErrorReports(getErrorReports());
  };

  const handleClearReports = () => {
    clearErrorReports();
    setErrorReports([]);
  };

  // Test different types of errors
  const testJavaScriptError = () => {
    try {
      // @ts-ignore - Intentional error for testing
      const obj = null;
      obj.someProperty.anotherProperty = 'test';
    } catch (error) {
      handleError(error, { testType: 'javascript_error' });
    }
  };

  const testNetworkError = async () => {
    try {
      await testApiCall.execute('https://nonexistent-api.example.com/data');
    } catch (error) {
      // Error already handled by useAsyncOperation
    }
  };

  const testValidationError = () => {
    const error = new Error('Validation failed: Email is required');
    error.name = 'ValidationError';
    handleError(error, { testType: 'validation_error' });
  };

  const testAsyncError = async () => {
    try {
      await testAsyncOperation.execute(true);
    } catch (error) {
      // Error already handled by useAsyncOperation
    }
  };

  const testUnhandledPromiseRejection = () => {
    // This will trigger the global unhandled rejection handler
    Promise.reject(new Error('Unhandled promise rejection test'));
  };

  const testComponentError = () => {
    // This will be caught by the error boundary
    throw new Error('Component error test');
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" maxW="4xl" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          错误处理测试组件
        </Heading>

        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>开发模式专用</AlertTitle>
            <AlertDescription>
              此组件仅在开发模式下显示，用于测试错误处理系统的各种功能。
            </AlertDescription>
          </Box>
        </Alert>

        {/* Error Test Buttons */}
        <Box>
          <Heading size="md" mb={4}>错误测试</Heading>
          <VStack spacing={3}>
            <HStack spacing={3} wrap="wrap">
              <Button colorScheme="red" onClick={testJavaScriptError}>
                JavaScript 错误
              </Button>
              <Button colorScheme="orange" onClick={testNetworkError}>
                网络错误
              </Button>
              <Button colorScheme="yellow" onClick={testValidationError}>
                验证错误
              </Button>
              <Button colorScheme="purple" onClick={testAsyncError}>
                异步操作错误
              </Button>
            </HStack>
            <HStack spacing={3} wrap="wrap">
              <Button colorScheme="pink" onClick={testUnhandledPromiseRejection}>
                未处理的 Promise 拒绝
              </Button>
              <Button colorScheme="red" variant="outline" onClick={testComponentError}>
                组件错误 (Error Boundary)
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Async Operation Status */}
        <Box>
          <Heading size="md" mb={4}>异步操作状态</Heading>
          <VStack spacing={3} align="stretch">
            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
              <Text fontWeight="bold" mb={2}>测试异步操作:</Text>
              <Text fontSize="sm" color="gray.600" mb={2}>
                加载中: {testAsyncOperation.state.loading ? '是' : '否'}
              </Text>
              <Text fontSize="sm" color="gray.600" mb={2}>
                成功: {testAsyncOperation.state.success ? '是' : '否'}
              </Text>
              <Text fontSize="sm" color="gray.600" mb={2}>
                数据: {testAsyncOperation.state.data || '无'}
              </Text>
              {testAsyncOperation.state.error && (
                <Text fontSize="sm" color="red.500">
                  错误: {testAsyncOperation.state.error.message}
                </Text>
              )}
              <HStack spacing={2} mt={2}>
                <Button size="sm" onClick={() => testAsyncOperation.execute(false)}>
                  成功测试
                </Button>
                <Button size="sm" onClick={() => testAsyncOperation.reset()}>
                  重置
                </Button>
              </HStack>
            </Box>

            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
              <Text fontWeight="bold" mb={2}>API 调用测试:</Text>
              <Text fontSize="sm" color="gray.600" mb={2}>
                加载中: {testApiCall.state.loading ? '是' : '否'}
              </Text>
              <Text fontSize="sm" color="gray.600" mb={2}>
                成功: {testApiCall.state.success ? '是' : '否'}
              </Text>
              {testApiCall.state.error && (
                <Text fontSize="sm" color="red.500">
                  错误: {testApiCall.state.error.message}
                </Text>
              )}
              <HStack spacing={2} mt={2}>
                <Button size="sm" onClick={() => testApiCall.execute('/api/test')}>
                  测试 API 调用
                </Button>
                <Button size="sm" onClick={() => testApiCall.reset()}>
                  重置
                </Button>
              </HStack>
            </Box>
          </VStack>
        </Box>

        {/* Error Reports */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Heading size="md">错误报告</Heading>
            <HStack spacing={2}>
              <Button size="sm" onClick={refreshErrorReports}>
                刷新
              </Button>
              <Button size="sm" colorScheme="red" onClick={handleClearReports}>
                清除所有
              </Button>
            </HStack>
          </HStack>

          {errorReports.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>
              暂无错误报告
            </Text>
          ) : (
            <VStack spacing={3} align="stretch">
              {errorReports.slice(0, 5).map((report) => (
                <Box
                  key={report.id}
                  p={4}
                  bg="white"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="red.200"
                >
                  <HStack justify="space-between" align="start" mb={2}>
                    <Text fontWeight="bold" color="red.600">
                      {report.type.toUpperCase()}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {report.timestamp.toLocaleString()}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" mb={2}>
                    {report.message}
                  </Text>
                  {report.context && (
                    <Code fontSize="xs" p={2} bg="gray.100" borderRadius="sm" display="block">
                      {JSON.stringify(report.context, null, 2)}
                    </Code>
                  )}
                </Box>
              ))}
              {errorReports.length > 5 && (
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  还有 {errorReports.length - 5} 个错误报告...
                </Text>
              )}
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default ErrorTestComponent;
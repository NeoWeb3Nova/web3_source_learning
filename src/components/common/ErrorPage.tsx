import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Image,
  useColorModeValue,
  Icon,
  Divider,
  Link,
  Code,
} from '@chakra-ui/react';
import { WarningIcon, RepeatIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

export type ErrorType = 
  | '404' 
  | '500' 
  | 'network' 
  | 'unauthorized' 
  | 'forbidden' 
  | 'timeout'
  | 'generic';

interface ErrorPageProps {
  errorType?: ErrorType;
  title?: string;
  message?: string;
  details?: string;
  showRetry?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
  onRetry?: () => void;
  customActions?: React.ReactNode;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  errorType = 'generic',
  title,
  message,
  details,
  showRetry = true,
  showGoHome = true,
  showGoBack = true,
  onRetry,
  customActions,
}) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const getErrorConfig = (type: ErrorType) => {
    switch (type) {
      case '404':
        return {
          icon: WarningIcon,
          color: 'orange.500',
          title: title || '页面未找到',
          message: message || '抱歉，您访问的页面不存在或已被移动',
          details: details || '请检查URL是否正确，或返回首页继续浏览',
        };
      case '500':
        return {
          icon: WarningIcon,
          color: 'red.500',
          title: title || '服务器错误',
          message: message || '服务器遇到了一个错误，无法完成您的请求',
          details: details || '请稍后重试，如果问题持续存在，请联系技术支持',
        };
      case 'network':
        return {
          icon: WarningIcon,
          color: 'blue.500',
          title: title || '网络连接错误',
          message: message || '无法连接到服务器，请检查您的网络连接',
          details: details || '确保您已连接到互联网，然后重试',
        };
      case 'unauthorized':
        return {
          icon: WarningIcon,
          color: 'yellow.500',
          title: title || '未授权访问',
          message: message || '您需要登录才能访问此页面',
          details: details || '请登录您的账户后重试',
        };
      case 'forbidden':
        return {
          icon: WarningIcon,
          color: 'red.500',
          title: title || '访问被拒绝',
          message: message || '您没有权限访问此资源',
          details: details || '如果您认为这是一个错误，请联系管理员',
        };
      case 'timeout':
        return {
          icon: WarningIcon,
          color: 'orange.500',
          title: title || '请求超时',
          message: message || '请求处理时间过长，连接已超时',
          details: details || '请检查网络连接并重试',
        };
      default:
        return {
          icon: WarningIcon,
          color: 'red.500',
          title: title || '出现了一些问题',
          message: message || '应用遇到了意外错误',
          details: details || '请尝试刷新页面或联系技术支持',
        };
    }
  };

  const config = getErrorConfig(errorType);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        maxW="lg"
        w="full"
        bg={cardBg}
        borderRadius="xl"
        boxShadow="xl"
        p={8}
        textAlign="center"
      >
        <VStack spacing={6}>
          {/* Error Icon */}
          <Icon as={config.icon} boxSize={20} color={config.color} />
          
          {/* Error Title */}
          <VStack spacing={2}>
            <Heading size="xl" color={config.color}>
              {config.title}
            </Heading>
            <Text color={textColor} fontSize="lg">
              {config.message}
            </Text>
          </VStack>

          {/* Error Details */}
          {config.details && (
            <Text color={textColor} fontSize="sm" maxW="md">
              {config.details}
            </Text>
          )}

          {/* Error Code for Development */}
          {process.env.NODE_ENV === 'development' && details && (
            <Box
              w="full"
              p={4}
              bg="gray.100"
              borderRadius="md"
              textAlign="left"
            >
              <Text fontSize="xs" fontWeight="bold" mb={2}>
                开发模式 - 错误详情:
              </Text>
              <Code fontSize="xs" whiteSpace="pre-wrap">
                {details}
              </Code>
            </Box>
          )}

          <Divider />

          {/* Action Buttons */}
          <VStack spacing={4} w="full">
            {/* Primary Actions */}
            <HStack spacing={4} w="full" justify="center">
              {showRetry && (
                <Button
                  leftIcon={<RepeatIcon />}
                  colorScheme="blue"
                  onClick={handleRetry}
                  size="lg"
                >
                  重试
                </Button>
              )}
              
              {showGoHome && (
                <Button
                  leftIcon={<Icon as={() => <span>🏠</span>} />}
                  variant="outline"
                  onClick={handleGoHome}
                  size="lg"
                >
                  返回首页
                </Button>
              )}
            </HStack>

            {/* Secondary Actions */}
            <HStack spacing={4}>
              {showGoBack && (
                <Button
                  leftIcon={<ArrowBackIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={handleGoBack}
                >
                  返回上页
                </Button>
              )}
            </HStack>

            {/* Custom Actions */}
            {customActions && (
              <>
                <Divider />
                {customActions}
              </>
            )}
          </VStack>

          {/* Help Text */}
          <Text fontSize="xs" color={textColor}>
            如果问题持续存在，请{' '}
            <Link color="blue.500" href="mailto:support@example.com">
              联系技术支持
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default ErrorPage;
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { RepeatIcon, WarningIcon } from '@chakra-ui/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <ErrorFallback 
        error={this.state.error} 
        onRetry={this.handleRetry}
        onGoHome={this.handleGoHome}
      />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
  onGoHome: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry, onGoHome }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

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
        maxW="md"
        w="full"
        bg={cardBg}
        borderRadius="xl"
        boxShadow="lg"
        p={8}
        textAlign="center"
      >
        <VStack spacing={6}>
          <Icon as={WarningIcon} boxSize={16} color="red.500" />
          
          <VStack spacing={2}>
            <Heading size="lg" color="red.500">
              出现了一些问题
            </Heading>
            <Text color="gray.600" fontSize="sm">
              应用遇到了意外错误，请尝试刷新页面或返回首页
            </Text>
          </VStack>

          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>错误详情</AlertTitle>
              <AlertDescription fontSize="sm">
                {error?.message || '未知错误'}
              </AlertDescription>
            </Box>
          </Alert>

          <HStack spacing={4} w="full">
            <Button
              leftIcon={<RepeatIcon />}
              colorScheme="blue"
              onClick={onRetry}
              flex={1}
            >
              重试
            </Button>
            <Button
              leftIcon={<Icon as={() => <span>🏠</span>} />}
              variant="outline"
              onClick={onGoHome}
              flex={1}
            >
              返回首页
            </Button>
          </HStack>

          {import.meta.env.DEV && error && (
            <Box
              w="full"
              p={4}
              bg="gray.100"
              borderRadius="md"
              fontSize="xs"
              fontFamily="mono"
              textAlign="left"
              maxH="200px"
              overflowY="auto"
            >
              <Text fontWeight="bold" mb={2}>开发模式 - 错误堆栈:</Text>
              <Text whiteSpace="pre-wrap">{error.stack}</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

// Simple error boundary with minimal UI
export const SimpleErrorBoundary: React.FC<Props> = ({ children, onError }) => {
  return (
    <ErrorBoundary
      onError={onError}
      fallback={
        <Box p={4} textAlign="center">
          <Text color="red.500">Something went wrong</Text>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Box>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

// Hook for error handling
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error handled:', error, errorInfo);
    // In production, send to error reporting service
  };

  return { handleError };
};

export default ErrorBoundary;
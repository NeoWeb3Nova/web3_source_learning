import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  useColorModeValue,
  Slide,
  Box,
  Progress,

} from '@chakra-ui/react';
import { WarningIcon, RepeatIcon } from '@chakra-ui/icons';
import useNetworkStatus from '../../hooks/useNetworkStatus';

interface OfflineNotificationProps {
  showConnectionType?: boolean;
  autoRetry?: boolean;
  retryInterval?: number;
  position?: 'top' | 'bottom';
}

const OfflineNotification: React.FC<OfflineNotificationProps> = ({
  showConnectionType = true,
  autoRetry = true,
  retryInterval = 10000, // 10 seconds
  position = 'top',
}) => {
  const { 
    networkStatus, 
    isOnline, 
    isOffline, 
    isSlowConnection, 
    retryConnection 
  } = useNetworkStatus();
  
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('red.200', 'red.600');

  // Show notification when offline or slow connection
  useEffect(() => {
    setShowNotification(isOffline || isSlowConnection);
  }, [isOffline, isSlowConnection]);

  // Auto retry mechanism
  useEffect(() => {
    if (!autoRetry || isOnline) return;

    const interval = setInterval(() => {
      handleRetry();
    }, retryInterval);

    return () => clearInterval(interval);
  }, [autoRetry, retryInterval, isOnline]);

  // Countdown for next retry
  useEffect(() => {
    if (!autoRetry || isOnline || nextRetryIn <= 0) return;

    const countdown = setInterval(() => {
      setNextRetryIn(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [autoRetry, isOnline, nextRetryIn]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      const success = await retryConnection();
      if (!success && autoRetry) {
        setNextRetryIn(retryInterval / 1000);
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  const getConnectionTypeColor = (effectiveType: string) => {
    switch (effectiveType) {
      case '4g': return 'green';
      case '3g': return 'yellow';
      case '2g': 
      case 'slow-2g': return 'red';
      default: return 'gray';
    }
  };

  const getConnectionTypeLabel = (effectiveType: string) => {
    switch (effectiveType) {
      case '4g': return '4G';
      case '3g': return '3G';
      case '2g': return '2G';
      case 'slow-2g': return '慢速2G';
      default: return '未知';
    }
  };

  if (!showNotification) return null;

  return (
    <Slide direction={position} in={showNotification}>
      <Box
        position="fixed"
        top={position === 'top' ? 4 : undefined}
        bottom={position === 'bottom' ? 4 : undefined}
        left={4}
        right={4}
        zIndex={9999}
      >
        <Alert
          status={isOffline ? 'error' : 'warning'}
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="lg"
          p={4}
        >
          <AlertIcon as={WarningIcon} />
          
          <VStack align="start" spacing={2} flex={1}>
            <HStack justify="space-between" w="full">
              <AlertTitle fontSize="sm">
                {isOffline ? '网络连接已断开' : '网络连接较慢'}
              </AlertTitle>
              
              {showConnectionType && networkStatus.effectiveType !== 'unknown' && (
                <Badge 
                  colorScheme={getConnectionTypeColor(networkStatus.effectiveType)}
                  size="sm"
                >
                  {getConnectionTypeLabel(networkStatus.effectiveType)}
                </Badge>
              )}
            </HStack>

            <AlertDescription fontSize="xs" color="gray.600">
              {isOffline 
                ? '请检查您的网络连接，某些功能可能无法正常使用'
                : '当前网络较慢，加载可能需要更长时间'
              }
            </AlertDescription>

            {isRetrying && (
              <Box w="full">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  正在重试连接... (第 {retryCount} 次)
                </Text>
                <Progress size="xs" isIndeterminate colorScheme="blue" />
              </Box>
            )}

            {autoRetry && nextRetryIn > 0 && !isRetrying && (
              <Text fontSize="xs" color="gray.500">
                {nextRetryIn} 秒后自动重试
              </Text>
            )}

            <HStack spacing={2} w="full" justify="flex-end">
              <Button
                size="xs"
                variant="ghost"
                onClick={handleDismiss}
              >
                忽略
              </Button>
              
              <Button
                size="xs"
                leftIcon={<RepeatIcon />}
                colorScheme="blue"
                isLoading={isRetrying}
                loadingText="重试中"
                onClick={handleRetry}
              >
                重试
              </Button>
            </HStack>
          </VStack>
        </Alert>
      </Box>
    </Slide>
  );
};

export default OfflineNotification;
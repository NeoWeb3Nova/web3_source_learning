/**
 * 网络状态检测组件
 * 提供网络连接状态监控和离线提示
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  VStack,
  Text,
  Icon,
  Badge,
  Slide,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FiWifi, FiWifiOff, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

/**
 * 网络状态枚举
 */
export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SLOW = 'slow',
  UNKNOWN = 'unknown',
}

/**
 * 连接信息接口
 */
interface ConnectionInfo {
  status: NetworkStatus;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * 网络状态Hook
 */
export const useNetworkStatus = () => {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE,
  });
  const [isChecking, setIsChecking] = useState(false);
  const toast = useToast();

  /**
   * 获取连接信息
   */
  const getConnectionInfo = useCallback((): ConnectionInfo => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    const baseInfo: ConnectionInfo = {
      status: navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE,
    };

    if (connection) {
      baseInfo.effectiveType = connection.effectiveType;
      baseInfo.downlink = connection.downlink;
      baseInfo.rtt = connection.rtt;
      baseInfo.saveData = connection.saveData;

      // 判断网络速度
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        baseInfo.status = NetworkStatus.SLOW;
      } else if (connection.rtt > 1000 || connection.downlink < 0.5) {
        baseInfo.status = NetworkStatus.SLOW;
      }
    }

    return baseInfo;
  }, []);

  /**
   * 更新连接状态
   */
  const updateConnectionStatus = useCallback(() => {
    const newConnectionInfo = getConnectionInfo();
    setConnectionInfo(prev => {
      // 只有状态真正改变时才更新
      if (prev.status !== newConnectionInfo.status) {
        // 显示状态变化提示
        if (newConnectionInfo.status === NetworkStatus.ONLINE && prev.status === NetworkStatus.OFFLINE) {
          toast({
            title: '网络已连接',
            description: '网络连接已恢复',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else if (newConnectionInfo.status === NetworkStatus.OFFLINE) {
          toast({
            title: '网络已断开',
            description: '请检查网络连接',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else if (newConnectionInfo.status === NetworkStatus.SLOW) {
          toast({
            title: '网络较慢',
            description: '当前网络连接较慢，可能影响使用体验',
            status: 'warning',
            duration: 4000,
            isClosable: true,
          });
        }
      }
      return newConnectionInfo;
    });
  }, [getConnectionInfo, toast]);

  /**
   * 手动检查网络状态
   */
  const checkNetworkStatus = useCallback(async () => {
    setIsChecking(true);
    
    try {
      // 尝试发送一个小的网络请求来验证连接
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setConnectionInfo(prev => ({ ...prev, status: NetworkStatus.ONLINE }));
        toast({
          title: '网络检查完成',
          description: '网络连接正常',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error('Network check failed');
      }
    } catch (error) {
      setConnectionInfo(prev => ({ ...prev, status: NetworkStatus.OFFLINE }));
      toast({
        title: '网络检查失败',
        description: '无法连接到网络，请检查网络设置',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  /**
   * 初始化网络状态监听
   */
  useEffect(() => {
    // 初始化连接状态
    updateConnectionStatus();

    // 监听在线/离线事件
    const handleOnline = () => updateConnectionStatus();
    const handleOffline = () => updateConnectionStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 监听连接变化（如果支持）
    const connection = (navigator as any).connection;
    if (connection) {
      const handleConnectionChange = () => updateConnectionStatus();
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateConnectionStatus]);

  return {
    ...connectionInfo,
    isChecking,
    checkNetworkStatus,
    isOnline: connectionInfo.status === NetworkStatus.ONLINE,
    isOffline: connectionInfo.status === NetworkStatus.OFFLINE,
    isSlow: connectionInfo.status === NetworkStatus.SLOW,
  };
};

/**
 * 网络状态指示器组件
 */
export const NetworkStatusIndicator: React.FC<{
  showDetails?: boolean;
  compact?: boolean;
}> = ({ showDetails = false, compact = false }) => {
  const networkStatus = useNetworkStatus();

  const getStatusColor = () => {
    switch (networkStatus.status) {
      case NetworkStatus.ONLINE:
        return 'green';
      case NetworkStatus.SLOW:
        return 'yellow';
      case NetworkStatus.OFFLINE:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = () => {
    switch (networkStatus.status) {
      case NetworkStatus.ONLINE:
        return '在线';
      case NetworkStatus.SLOW:
        return '网络较慢';
      case NetworkStatus.OFFLINE:
        return '离线';
      default:
        return '未知';
    }
  };

  const getStatusIcon = () => {
    switch (networkStatus.status) {
      case NetworkStatus.ONLINE:
        return FiWifi;
      case NetworkStatus.SLOW:
        return FiWifi;
      case NetworkStatus.OFFLINE:
        return FiWifiOff;
      default:
        return FiAlertCircle;
    }
  };

  if (compact) {
    return (
      <HStack spacing={1}>
        <Icon as={getStatusIcon()} color={`${getStatusColor()}.500`} boxSize={4} />
        <Badge colorScheme={getStatusColor()} variant="subtle" fontSize="xs">
          {getStatusText()}
        </Badge>
      </HStack>
    );
  }

  return (
    <VStack spacing={2} align="start">
      <HStack spacing={2}>
        <Icon as={getStatusIcon()} color={`${getStatusColor()}.500`} />
        <Text fontSize="sm" fontWeight="medium">
          网络状态: {getStatusText()}
        </Text>
      </HStack>
      
      {showDetails && networkStatus.effectiveType && (
        <VStack spacing={1} align="start" fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
          <Text>连接类型: {networkStatus.effectiveType}</Text>
          {networkStatus.downlink && (
            <Text>下载速度: {networkStatus.downlink} Mbps</Text>
          )}
          {networkStatus.rtt && (
            <Text>延迟: {networkStatus.rtt} ms</Text>
          )}
          {networkStatus.saveData && (
            <Text>省流量模式: 已开启</Text>
          )}
        </VStack>
      )}
    </VStack>
  );
};

/**
 * 离线提示组件
 */
export const OfflineAlert: React.FC<{
  isVisible?: boolean;
  onRetry?: () => void;
}> = ({ isVisible, onRetry }) => {
  const { isOffline, checkNetworkStatus, isChecking } = useNetworkStatus();
  const showAlert = isVisible !== undefined ? isVisible : isOffline;

  if (!showAlert) return null;

  return (
    <Slide direction="top" in={showAlert} style={{ zIndex: 1000 }}>
      <Alert status="error" variant="solid">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle fontSize="sm">网络连接已断开</AlertTitle>
          <AlertDescription fontSize="sm">
            请检查网络连接，某些功能可能无法正常使用
          </AlertDescription>
        </Box>
        <Button
          size="sm"
          variant="outline"
          colorScheme="whiteAlpha"
          leftIcon={isChecking ? <Spinner size="xs" /> : <FiRefreshCw />}
          onClick={onRetry || checkNetworkStatus}
          isLoading={isChecking}
          loadingText="检查中"
        >
          重试
        </Button>
      </Alert>
    </Slide>
  );
};

/**
 * 网络重试组件
 */
export const NetworkRetry: React.FC<{
  onRetry: () => void;
  isRetrying?: boolean;
  error?: string;
}> = ({ onRetry, isRetrying = false, error }) => {
  const { isOffline } = useNetworkStatus();

  return (
    <VStack spacing={4} p={6} textAlign="center">
      <Icon as={FiWifiOff} boxSize={12} color="red.500" />
      <VStack spacing={2}>
        <Text fontSize="lg" fontWeight="semibold">
          {isOffline ? '网络连接已断开' : '请求失败'}
        </Text>
        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
          {error || (isOffline ? '请检查网络连接后重试' : '请求过程中发生错误，请重试')}
        </Text>
      </VStack>
      <Button
        leftIcon={isRetrying ? <Spinner size="sm" /> : <FiRefreshCw />}
        onClick={onRetry}
        isLoading={isRetrying}
        loadingText="重试中..."
        colorScheme="blue"
      >
        重试
      </Button>
    </VStack>
  );
};

/**
 * 网络状态提供者组件
 */
export const NetworkStatusProvider: React.FC<{
  children: React.ReactNode;
  showOfflineAlert?: boolean;
}> = ({ children, showOfflineAlert = true }) => {
  return (
    <>
      {children}
      {showOfflineAlert && <OfflineAlert />}
    </>
  );
};

export default useNetworkStatus;
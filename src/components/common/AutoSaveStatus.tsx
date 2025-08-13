/**
 * 自动保存状态组件
 * 显示数据保存状态和提供手动保存功能
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Icon,
  Badge,
  Tooltip,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import {
  FiSave,
  FiCheck,
  FiClock,
  FiWifi,
  FiWifiOff,
  FiAlertCircle,
  FiDatabase,
  FiRefreshCw,
} from 'react-icons/fi';
import { useDataPersistence } from '@/hooks/useDataPersistence';

interface AutoSaveStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const AutoSaveStatus: React.FC<AutoSaveStatusProps> = ({
  showDetails = false,
  compact = false,
  position = 'bottom',
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSaveText, setLastSaveText] = useState('');
  const toast = useToast();

  const {
    isSaving,
    hasUnsavedChanges,
    lastSaveTime,
    storageUsage,
    forceSave,
    updateStorageUsage,
  } = useDataPersistence();

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 更新最后保存时间文本
  useEffect(() => {
    const updateLastSaveText = () => {
      if (!lastSaveTime) {
        setLastSaveText('从未保存');
        return;
      }

      const now = new Date();
      const saveTime = new Date(lastSaveTime);
      const diffMs = now.getTime() - saveTime.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);

      if (diffSeconds < 60) {
        setLastSaveText('刚刚保存');
      } else if (diffMinutes < 60) {
        setLastSaveText(`${diffMinutes}分钟前保存`);
      } else if (diffHours < 24) {
        setLastSaveText(`${diffHours}小时前保存`);
      } else {
        setLastSaveText(saveTime.toLocaleDateString('zh-CN'));
      }
    };

    updateLastSaveText();
    const interval = setInterval(updateLastSaveText, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, [lastSaveTime]);

  /**
   * 手动保存
   */
  const handleManualSave = async () => {
    try {
      await forceSave();
      toast({
        title: '保存成功',
        description: '所有数据已保存',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Manual save failed:', error);
      toast({
        title: '保存失败',
        description: '保存数据时发生错误，请重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  /**
   * 获取状态图标和颜色
   */
  const getStatusInfo = () => {
    if (isSaving) {
      return {
        icon: FiRefreshCw,
        color: 'blue.500',
        text: '保存中...',
        badgeColor: 'blue',
      };
    }

    if (!isOnline) {
      return {
        icon: FiWifiOff,
        color: 'red.500',
        text: '离线模式',
        badgeColor: 'red',
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: FiAlertCircle,
        color: 'orange.500',
        text: '有未保存更改',
        badgeColor: 'orange',
      };
    }

    return {
      icon: FiCheck,
      color: 'green.500',
      text: '已保存',
      badgeColor: 'green',
    };
  };

  const statusInfo = getStatusInfo();

  // 紧凑模式
  if (compact) {
    return (
      <Tooltip
        label={
          <VStack spacing={1} align="start">
            <Text fontSize="sm">{statusInfo.text}</Text>
            <Text fontSize="xs" color="gray.300">
              {lastSaveText}
            </Text>
            {!isOnline && (
              <Text fontSize="xs" color="red.300">
                数据将在联网后同步
              </Text>
            )}
          </VStack>
        }
        placement={position}
      >
        <HStack spacing={1} cursor="pointer">
          <Icon
            as={statusInfo.icon}
            color={statusInfo.color}
            boxSize={4}
            className={isSaving ? 'spin' : ''}
          />
          {hasUnsavedChanges && (
            <Box w={2} h={2} bg="orange.500" borderRadius="full" />
          )}
        </HStack>
      </Tooltip>
    );
  }

  // 详细模式
  if (showDetails) {
    return (
      <Box
        bg="white"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        p={4}
        shadow="sm"
        _dark={{
          bg: 'gray.800',
          borderColor: 'gray.600',
        }}
      >
        <VStack spacing={4} align="stretch">
          {/* 状态标题 */}
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon
                as={statusInfo.icon}
                color={statusInfo.color}
                className={isSaving ? 'spin' : ''}
              />
              <Text fontWeight="semibold">{statusInfo.text}</Text>
            </HStack>
            <Badge colorScheme={statusInfo.badgeColor} variant="subtle">
              {isOnline ? '在线' : '离线'}
            </Badge>
          </HStack>

          {/* 最后保存时间 */}
          <HStack spacing={2} fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
            <Icon as={FiClock} />
            <Text>{lastSaveText}</Text>
          </HStack>

          {/* 存储使用情况 */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between" fontSize="sm">
              <HStack spacing={2}>
                <Icon as={FiDatabase} />
                <Text>存储使用</Text>
              </HStack>
              <Text>{storageUsage.percentage.toFixed(1)}%</Text>
            </HStack>
            <Progress
              value={storageUsage.percentage}
              colorScheme={storageUsage.percentage > 80 ? 'red' : 'blue'}
              size="sm"
            />
          </VStack>

          {/* 离线提示 */}
          {!isOnline && (
            <Alert status="warning" size="sm" borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                当前处于离线状态，数据将在联网后自动同步
              </AlertDescription>
            </Alert>
          )}

          {/* 操作按钮 */}
          <HStack spacing={2}>
            <Button
              size="sm"
              leftIcon={<FiSave />}
              onClick={handleManualSave}
              isLoading={isSaving}
              loadingText="保存中"
              isDisabled={!hasUnsavedChanges && !isSaving}
              colorScheme="blue"
              variant="outline"
              flex={1}
            >
              手动保存
            </Button>
            <Button
              size="sm"
              leftIcon={<FiRefreshCw />}
              onClick={updateStorageUsage}
              variant="ghost"
            >
              刷新
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  // 标准模式
  return (
    <Popover placement={position}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            <Icon
              as={statusInfo.icon}
              color={statusInfo.color}
              className={isSaving ? 'spin' : ''}
            />
          }
          rightIcon={
            hasUnsavedChanges ? (
              <Box w={2} h={2} bg="orange.500" borderRadius="full" />
            ) : undefined
          }
        >
          {statusInfo.text}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <HStack spacing={2}>
            <Icon as={FiDatabase} />
            <Text>数据状态</Text>
          </HStack>
        </PopoverHeader>
        <PopoverBody>
          <VStack spacing={3} align="stretch">
            {/* 状态信息 */}
            <HStack justify="space-between">
              <Text fontSize="sm">状态:</Text>
              <Badge colorScheme={statusInfo.badgeColor}>
                {statusInfo.text}
              </Badge>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm">网络:</Text>
              <HStack spacing={1}>
                <Icon as={isOnline ? FiWifi : FiWifiOff} color={isOnline ? 'green.500' : 'red.500'} />
                <Text fontSize="sm">{isOnline ? '在线' : '离线'}</Text>
              </HStack>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm">最后保存:</Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                {lastSaveText}
              </Text>
            </HStack>

            {/* 存储使用 */}
            <VStack spacing={1} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm">存储使用:</Text>
                <Text fontSize="sm">{storageUsage.percentage.toFixed(1)}%</Text>
              </HStack>
              <Progress
                value={storageUsage.percentage}
                colorScheme={storageUsage.percentage > 80 ? 'red' : 'blue'}
                size="sm"
              />
            </VStack>

            {/* 操作按钮 */}
            <Button
              size="sm"
              leftIcon={<FiSave />}
              onClick={handleManualSave}
              isLoading={isSaving}
              loadingText="保存中"
              isDisabled={!hasUnsavedChanges && !isSaving}
              colorScheme="blue"
              variant="outline"
            >
              手动保存
            </Button>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

/**
 * 浮动保存状态指示器
 */
export const FloatingAutoSaveStatus: React.FC = () => {
  const { isSaving, hasUnsavedChanges } = useDataPersistence();

  // 只在有未保存更改或正在保存时显示
  if (!isSaving && !hasUnsavedChanges) {
    return null;
  }

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      zIndex={1000}
      bg="white"
      border="1px"
      borderColor="gray.200"
      borderRadius="full"
      px={3}
      py={2}
      shadow="lg"
      _dark={{
        bg: 'gray.800',
        borderColor: 'gray.600',
      }}
    >
      <HStack spacing={2}>
        {isSaving ? (
          <>
            <Spinner size="sm" color="blue.500" />
            <Text fontSize="sm" color="blue.500">
              保存中...
            </Text>
          </>
        ) : (
          <>
            <Icon as={FiAlertCircle} color="orange.500" />
            <Text fontSize="sm" color="orange.500">
              有未保存更改
            </Text>
          </>
        )}
      </HStack>
    </Box>
  );
};

// CSS动画样式
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;

// 注入CSS样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}
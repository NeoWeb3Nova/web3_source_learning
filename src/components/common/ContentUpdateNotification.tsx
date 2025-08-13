/**
 * 内容更新通知组件
 * 提供新内容推送通知和更新提示
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Badge,
  Icon,
  Slide,
  ScaleFade,
  useToast,
  useColorModeValue,
  Tooltip,
  Progress,
} from '@chakra-ui/react';
import {
  FiRefreshCw,
  FiDownload,
  FiCheck,
  FiX,
  FiClock,
  FiBell,
  FiWifi,
  FiWifiOff,
} from 'react-icons/fi';

/**
 * 更新类型枚举
 */
export enum UpdateType {
  VOCABULARY = 'vocabulary',
  CONTENT = 'content',
  FEATURE = 'feature',
  SYSTEM = 'system',
}

/**
 * 更新状态枚举
 */
export enum UpdateStatus {
  AVAILABLE = 'available',
  DOWNLOADING = 'downloading',
  READY = 'ready',
  INSTALLING = 'installing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * 更新信息接口
 */
export interface UpdateInfo {
  /** 更新ID */
  id: string;
  /** 更新类型 */
  type: UpdateType;
  /** 更新标题 */
  title: string;
  /** 更新描述 */
  description: string;
  /** 更新版本 */
  version: string;
  /** 更新大小（字节） */
  size: number;
  /** 发布时间 */
  publishedAt: Date;
  /** 是否为重要更新 */
  critical: boolean;
  /** 更新内容列表 */
  changes: string[];
  /** 下载URL */
  downloadUrl?: string;
}

/**
 * 内容更新通知Props
 */
interface ContentUpdateNotificationProps {
  /** 更新信息 */
  updateInfo: UpdateInfo | null;
  /** 更新状态 */
  status: UpdateStatus;
  /** 下载进度（0-100） */
  progress: number;
  /** 是否显示通知 */
  visible: boolean;
  /** 是否在线 */
  isOnline: boolean;
  /** 开始更新回调 */
  onStartUpdate: (updateInfo: UpdateInfo) => void;
  /** 取消更新回调 */
  onCancelUpdate: () => void;
  /** 应用更新回调 */
  onApplyUpdate: () => void;
  /** 忽略更新回调 */
  onIgnoreUpdate: (updateId: string) => void;
  /** 关闭通知回调 */
  onClose: () => void;
}

export const ContentUpdateNotification: React.FC<ContentUpdateNotificationProps> = ({
  updateInfo,
  status,
  progress,
  visible,
  isOnline,
  onStartUpdate,
  onCancelUpdate,
  onApplyUpdate,
  onIgnoreUpdate,
  onClose,
}) => {
  const toast = useToast();

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  /**
   * 获取更新类型的颜色方案
   */
  const getTypeColorScheme = (type: UpdateType): string => {
    switch (type) {
      case UpdateType.VOCABULARY:
        return 'blue';
      case UpdateType.CONTENT:
        return 'green';
      case UpdateType.FEATURE:
        return 'purple';
      case UpdateType.SYSTEM:
        return 'orange';
      default:
        return 'gray';
    }
  };

  /**
   * 获取更新类型的显示名称
   */
  const getTypeDisplayName = (type: UpdateType): string => {
    switch (type) {
      case UpdateType.VOCABULARY:
        return '词汇更新';
      case UpdateType.CONTENT:
        return '内容更新';
      case UpdateType.FEATURE:
        return '功能更新';
      case UpdateType.SYSTEM:
        return '系统更新';
      default:
        return '更新';
    }
  };

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * 格式化时间
   */
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  /**
   * 处理开始更新
   */
  const handleStartUpdate = () => {
    if (!updateInfo) return;

    if (!isOnline) {
      toast({
        title: '网络连接失败',
        description: '请检查网络连接后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onStartUpdate(updateInfo);
  };

  /**
   * 处理忽略更新
   */
  const handleIgnoreUpdate = () => {
    if (!updateInfo) return;
    onIgnoreUpdate(updateInfo.id);
    onClose();
  };

  /**
   * 渲染状态指示器
   */
  const renderStatusIndicator = () => {
    switch (status) {
      case UpdateStatus.AVAILABLE:
        return (
          <HStack spacing={2}>
            <Icon as={FiDownload} color="blue.500" />
            <Text fontSize="sm" color="blue.500" fontWeight="medium">
              可更新
            </Text>
          </HStack>
        );

      case UpdateStatus.DOWNLOADING:
        return (
          <HStack spacing={2}>
            <Icon as={FiDownload} color="blue.500" className="animate-pulse" />
            <Text fontSize="sm" color="blue.500" fontWeight="medium">
              下载中 {progress}%
            </Text>
          </HStack>
        );

      case UpdateStatus.READY:
        return (
          <HStack spacing={2}>
            <Icon as={FiCheck} color="green.500" />
            <Text fontSize="sm" color="green.500" fontWeight="medium">
              准备安装
            </Text>
          </HStack>
        );

      case UpdateStatus.INSTALLING:
        return (
          <HStack spacing={2}>
            <Icon as={FiRefreshCw} color="orange.500" className="animate-spin" />
            <Text fontSize="sm" color="orange.500" fontWeight="medium">
              安装中...
            </Text>
          </HStack>
        );

      case UpdateStatus.COMPLETED:
        return (
          <HStack spacing={2}>
            <Icon as={FiCheck} color="green.500" />
            <Text fontSize="sm" color="green.500" fontWeight="medium">
              更新完成
            </Text>
          </HStack>
        );

      case UpdateStatus.FAILED:
        return (
          <HStack spacing={2}>
            <Icon as={FiX} color="red.500" />
            <Text fontSize="sm" color="red.500" fontWeight="medium">
              更新失败
            </Text>
          </HStack>
        );

      default:
        return null;
    }
  };

  /**
   * 渲染操作按钮
   */
  const renderActionButtons = () => {
    switch (status) {
      case UpdateStatus.AVAILABLE:
        return (
          <HStack spacing={2}>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<FiDownload />}
              onClick={handleStartUpdate}
              isDisabled={!isOnline}
            >
              立即更新
            </Button>
            <Button size="sm" variant="ghost" onClick={handleIgnoreUpdate}>
              忽略
            </Button>
          </HStack>
        );

      case UpdateStatus.DOWNLOADING:
        return (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiX />}
            onClick={onCancelUpdate}
          >
            取消下载
          </Button>
        );

      case UpdateStatus.READY:
        return (
          <HStack spacing={2}>
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<FiCheck />}
              onClick={onApplyUpdate}
            >
              应用更新
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              稍后
            </Button>
          </HStack>
        );

      case UpdateStatus.INSTALLING:
        return (
          <Text fontSize="sm" color={mutedColor}>
            正在安装更新，请稍候...
          </Text>
        );

      case UpdateStatus.COMPLETED:
        return (
          <Button size="sm" colorScheme="green" onClick={onClose}>
            确定
          </Button>
        );

      case UpdateStatus.FAILED:
        return (
          <HStack spacing={2}>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              leftIcon={<FiRefreshCw />}
              onClick={handleStartUpdate}
            >
              重试
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              关闭
            </Button>
          </HStack>
        );

      default:
        return null;
    }
  };

  if (!updateInfo || !visible) {
    return null;
  }

  return (
    <Slide direction="top" in={visible} style={{ zIndex: 1000 }}>
      <Box
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        shadow="lg"
        mx={4}
        mt={4}
        overflow="hidden"
      >
        {/* 头部 */}
        <HStack justify="space-between" p={4} pb={2}>
          <HStack spacing={3}>
            <Icon as={FiBell} color="blue.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <HStack spacing={2}>
                <Text fontWeight="semibold" color={textColor}>
                  {updateInfo.title}
                </Text>
                <Badge
                  colorScheme={getTypeColorScheme(updateInfo.type)}
                  variant="subtle"
                  fontSize="xs"
                >
                  {getTypeDisplayName(updateInfo.type)}
                </Badge>
                {updateInfo.critical && (
                  <Badge colorScheme="red" variant="solid" fontSize="xs">
                    重要
                  </Badge>
                )}
              </HStack>
              <HStack spacing={4} fontSize="xs" color={mutedColor}>
                <HStack spacing={1}>
                  <Icon as={FiClock} />
                  <Text>{formatTime(updateInfo.publishedAt)}</Text>
                </HStack>
                <Text>{formatFileSize(updateInfo.size)}</Text>
                <Text>v{updateInfo.version}</Text>
              </HStack>
            </VStack>
          </HStack>

          <HStack spacing={2}>
            {/* 网络状态指示器 */}
            <Tooltip label={isOnline ? '在线' : '离线'}>
              <Icon
                as={isOnline ? FiWifi : FiWifiOff}
                color={isOnline ? 'green.500' : 'red.500'}
                boxSize={4}
              />
            </Tooltip>

            {/* 关闭按钮 */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              isDisabled={status === UpdateStatus.INSTALLING}
            >
              <Icon as={FiX} />
            </Button>
          </HStack>
        </HStack>

        {/* 内容 */}
        <Box px={4} pb={2}>
          <Text fontSize="sm" color={mutedColor} mb={3}>
            {updateInfo.description}
          </Text>

          {/* 更新内容列表 */}
          {updateInfo.changes.length > 0 && (
            <VStack align="start" spacing={1} mb={3}>
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                更新内容：
              </Text>
              {updateInfo.changes.slice(0, 3).map((change, index) => (
                <Text key={index} fontSize="xs" color={mutedColor} pl={2}>
                  • {change}
                </Text>
              ))}
              {updateInfo.changes.length > 3 && (
                <Text fontSize="xs" color="blue.500" pl={2}>
                  +{updateInfo.changes.length - 3} 项更多内容
                </Text>
              )}
            </VStack>
          )}

          {/* 进度条 */}
          {(status === UpdateStatus.DOWNLOADING || status === UpdateStatus.INSTALLING) && (
            <Box mb={3}>
              <Progress
                value={progress}
                colorScheme="blue"
                size="sm"
                borderRadius="full"
                bg="gray.200"
                _dark={{ bg: 'gray.600' }}
              />
              <Text fontSize="xs" color={mutedColor} mt={1} textAlign="center">
                {status === UpdateStatus.DOWNLOADING ? '下载进度' : '安装进度'}: {progress}%
              </Text>
            </Box>
          )}
        </Box>

        {/* 底部操作区 */}
        <HStack justify="space-between" p={4} pt={2} bg="gray.50" _dark={{ bg: 'gray.700' }}>
          {renderStatusIndicator()}
          {renderActionButtons()}
        </HStack>
      </Box>
    </Slide>
  );
};

/**
 * 更新提示横幅组件
 */
export const UpdateBanner: React.FC<{
  updateCount: number;
  onShowUpdates: () => void;
  onDismiss: () => void;
}> = ({ updateCount, onShowUpdates, onDismiss }) => {
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('blue.800', 'blue.100');

  if (updateCount === 0) return null;

  return (
    <ScaleFade initialScale={0.9} in={updateCount > 0}>
      <Alert status="info" bg={bgColor} borderRadius="md" mb={4}>
        <AlertIcon color="blue.500" />
        <Box flex="1">
          <AlertTitle color={textColor} fontSize="sm">
            有 {updateCount} 个可用更新
          </AlertTitle>
          <AlertDescription color={textColor} fontSize="xs">
            点击查看详情并更新内容
          </AlertDescription>
        </Box>
        <HStack spacing={2}>
          <Button size="xs" colorScheme="blue" onClick={onShowUpdates}>
            查看
          </Button>
          <Button size="xs" variant="ghost" onClick={onDismiss}>
            <Icon as={FiX} />
          </Button>
        </HStack>
      </Alert>
    </ScaleFade>
  );
};

/**
 * 浮动更新按钮
 */
export const FloatingUpdateButton: React.FC<{
  hasUpdates: boolean;
  isUpdating: boolean;
  onClick: () => void;
}> = ({ hasUpdates, isUpdating, onClick }) => {
  if (!hasUpdates) return null;

  return (
    <Box
      position="fixed"
      bottom={20}
      right={4}
      zIndex={1000}
    >
      <ScaleFade initialScale={0.8} in={hasUpdates}>
        <Button
          colorScheme="blue"
          borderRadius="full"
          size="lg"
          leftIcon={<FiRefreshCw className={isUpdating ? 'animate-spin' : ''} />}
          onClick={onClick}
          isLoading={isUpdating}
          loadingText="更新中"
          shadow="lg"
          _hover={{ transform: 'scale(1.05)' }}
          transition="transform 0.2s"
        >
          {isUpdating ? '更新中' : '有更新'}
        </Button>
      </ScaleFade>
    </Box>
  );
};
/**
 * 数据备份和恢复组件
 * 提供数据导出、导入、备份和恢复功能
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Progress,
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
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiDownload,
  FiUpload,
  FiSave,
  FiRefreshCw,
  FiTrash2,
  FiDatabase,
  FiClock,
  FiHardDrive,
} from 'react-icons/fi';
import { useDataPersistence } from '@/hooks/useDataPersistence';
import { BackupData } from '@/services/storageManager';

interface DataBackupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataBackup: React.FC<DataBackupProps> = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const {
    storageUsage,
    lastSaveTime,
    createBackup,
    restoreBackup,
    exportData,
    importData,
    clearAllData,
  } = useDataPersistence();

  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  /**
   * 创建备份
   */
  const handleCreateBackup = async () => {
    try {
      setIsProcessing(true);
      setProgress(0);

      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const backup = await createBackup();
      setBackupData(backup);

      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: '备份创建成功',
        description: '您的学习数据已成功备份',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to create backup:', error);
      toast({
        title: '备份失败',
        description: '创建备份时发生错误，请重试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  /**
   * 导出数据
   */
  const handleExportData = async () => {
    try {
      setIsProcessing(true);
      const jsonData = await exportData();
      
      // 创建下载链接
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `web3-vocab-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '导出成功',
        description: '数据已导出到文件',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: '导出失败',
        description: '导出数据时发生错误，请重试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 导入数据
   */
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = e.target?.result as string;
          
          // 验证数据格式
          const parsedData = JSON.parse(jsonData);
          if (!parsedData.version || !parsedData.timestamp) {
            throw new Error('Invalid backup file format');
          }

          setProgress(50);
          await importData(jsonData);
          setProgress(100);

          toast({
            title: '导入成功',
            description: '数据已成功导入并恢复',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

          // 刷新页面以应用新数据
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error('Failed to import data:', error);
          toast({
            title: '导入失败',
            description: '导入的文件格式不正确或数据损坏',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsProcessing(false);
          setProgress(0);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Failed to read file:', error);
      toast({
        title: '文件读取失败',
        description: '无法读取选择的文件，请重试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsProcessing(false);
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 恢复备份
   */
  const handleRestoreBackup = async () => {
    if (!backupData) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      await restoreBackup(backupData);

      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: '恢复成功',
        description: '数据已成功恢复',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // 刷新页面以应用恢复的数据
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to restore backup:', error);
      toast({
        title: '恢复失败',
        description: '恢复数据时发生错误，请重试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  /**
   * 清除所有数据
   */
  const handleClearAllData = async () => {
    try {
      setIsProcessing(true);
      await clearAllData();

      toast({
        title: '数据已清除',
        description: '所有学习数据已被清除',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      onConfirmClose();
      onClose();

      // 刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast({
        title: '清除失败',
        description: '清除数据时发生错误，请重试',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
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
   * 格式化日期
   */
  const formatDate = (date: Date | string | null): string => {
    if (!date) return '从未';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('zh-CN');
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>数据备份与恢复</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* 存储状态 */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  存储状态
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel>
                      <HStack>
                        <Icon as={FiHardDrive} />
                        <Text>存储使用</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize="md">
                      {formatFileSize(storageUsage.used)}
                    </StatNumber>
                    <StatHelpText>
                      {storageUsage.percentage.toFixed(1)}% 已使用
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>
                      <HStack>
                        <Icon as={FiClock} />
                        <Text>最后保存</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize="md">
                      {formatDate(lastSaveTime)}
                    </StatNumber>
                  </Stat>
                </SimpleGrid>
                <Progress
                  value={storageUsage.percentage}
                  colorScheme={storageUsage.percentage > 80 ? 'red' : 'blue'}
                  size="sm"
                  mt={2}
                />
              </Box>

              <Divider />

              {/* 备份操作 */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  备份操作
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <Button
                      leftIcon={<FiSave />}
                      onClick={handleCreateBackup}
                      isLoading={isProcessing}
                      loadingText="创建中..."
                      colorScheme="blue"
                      flex={1}
                    >
                      创建备份
                    </Button>
                    <Button
                      leftIcon={<FiDownload />}
                      onClick={handleExportData}
                      isLoading={isProcessing}
                      loadingText="导出中..."
                      variant="outline"
                      flex={1}
                    >
                      导出数据
                    </Button>
                  </HStack>

                  {backupData && (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Box flex={1}>
                        <AlertTitle>备份已创建</AlertTitle>
                        <AlertDescription>
                          创建时间: {formatDate(backupData.timestamp)}
                          <Badge ml={2} colorScheme="blue">
                            v{backupData.version}
                          </Badge>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </Box>

              <Divider />

              {/* 恢复操作 */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  恢复操作
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <Button
                      leftIcon={<FiRefreshCw />}
                      onClick={handleRestoreBackup}
                      isDisabled={!backupData || isProcessing}
                      isLoading={isProcessing}
                      loadingText="恢复中..."
                      colorScheme="green"
                      flex={1}
                    >
                      恢复备份
                    </Button>
                    <Button
                      leftIcon={<FiUpload />}
                      onClick={() => fileInputRef.current?.click()}
                      isLoading={isProcessing}
                      loadingText="导入中..."
                      variant="outline"
                      flex={1}
                    >
                      导入数据
                    </Button>
                  </HStack>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    style={{ display: 'none' }}
                  />
                </VStack>
              </Box>

              <Divider />

              {/* 危险操作 */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="red.500">
                  危险操作
                </Text>
                <Alert status="warning" borderRadius="md" mb={3}>
                  <AlertIcon />
                  <AlertDescription>
                    清除所有数据将永久删除您的学习进度、词汇列表和设置，此操作无法撤销。
                  </AlertDescription>
                </Alert>
                <Button
                  leftIcon={<FiTrash2 />}
                  onClick={onConfirmOpen}
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                >
                  清除所有数据
                </Button>
              </Box>

              {/* 进度条 */}
              {isProcessing && progress > 0 && (
                <Box>
                  <Text fontSize="sm" mb={2}>
                    处理进度: {progress}%
                  </Text>
                  <Progress value={progress} colorScheme="blue" />
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>关闭</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 确认清除数据对话框 */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="red.500">确认清除数据</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="error">
                <AlertIcon />
                <Box>
                  <AlertTitle>警告！</AlertTitle>
                  <AlertDescription>
                    此操作将永久删除以下数据：
                  </AlertDescription>
                </Box>
              </Alert>
              <VStack align="start" spacing={2} pl={4}>
                <Text>• 所有学习进度和统计数据</Text>
                <Text>• 词汇列表和收藏</Text>
                <Text>• 练习记录和成就</Text>
                <Text>• 用户设置和偏好</Text>
              </VStack>
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  建议在清除前先创建备份，以便日后恢复数据。
                </AlertDescription>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfirmClose}>
              取消
            </Button>
            <Button
              colorScheme="red"
              onClick={handleClearAllData}
              isLoading={isProcessing}
              loadingText="清除中..."
            >
              确认清除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

/**
 * 存储状态指示器组件
 */
export const StorageStatusIndicator: React.FC = () => {
  const { storageUsage, lastSaveTime, hasUnsavedChanges, isSaving } = useDataPersistence();

  const getStatusColor = () => {
    if (isSaving) return 'blue';
    if (hasUnsavedChanges) return 'orange';
    if (storageUsage.percentage > 90) return 'red';
    if (storageUsage.percentage > 80) return 'yellow';
    return 'green';
  };

  const getStatusText = () => {
    if (isSaving) return '保存中...';
    if (hasUnsavedChanges) return '有未保存更改';
    return '已保存';
  };

  return (
    <Tooltip
      label={
        <VStack spacing={1} align="start">
          <Text>存储使用: {storageUsage.percentage.toFixed(1)}%</Text>
          <Text>最后保存: {formatDate(lastSaveTime)}</Text>
          <Text>状态: {getStatusText()}</Text>
        </VStack>
      }
      placement="top"
    >
      <HStack spacing={2} cursor="pointer">
        <Icon as={FiDatabase} color={`${getStatusColor()}.500`} />
        <Badge colorScheme={getStatusColor()} variant="subtle" fontSize="xs">
          {getStatusText()}
        </Badge>
      </HStack>
    </Tooltip>
  );
};

/**
 * 格式化日期的辅助函数
 */
const formatDate = (date: Date | string | null): string => {
  if (!date) return '从未';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN');
};
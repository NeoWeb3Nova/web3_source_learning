/**
 * 可刷新页面示例
 * 展示下拉刷新和内容更新功能
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Icon,
  useToast,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiRefreshCw, FiBook, FiTrendingUp, FiStar } from 'react-icons/fi';
import {
  PullToRefresh,
  ContentUpdateNotification,
  UpdateBanner,
  FloatingUpdateButton,
  UpdateType,
  UpdateStatus,
} from '@/components/common';
import { useContentUpdate } from '@/hooks/useContentUpdate';
import { VocabularyItem } from '@/types';

/**
 * 模拟词汇数据
 */
const MOCK_VOCABULARY: VocabularyItem[] = [
  {
    id: '1',
    word: 'DeFi',
    definition: '去中心化金融',
    pronunciation: '/diːfaɪ/',
    examples: ['DeFi protocols are revolutionizing traditional finance.'],
    category: 'defi' as any,
    difficulty: 'beginner' as any,
    tags: ['finance', 'blockchain'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false,
    studyCount: 5,
    accuracy: 0.8,
  },
  {
    id: '2',
    word: 'Liquidity Pool',
    definition: '流动性池',
    pronunciation: '/lɪˈkwɪdɪti puːl/',
    examples: ['Users can provide liquidity to earn rewards.'],
    category: 'defi' as any,
    difficulty: 'intermediate' as any,
    tags: ['liquidity', 'pool'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false,
    studyCount: 3,
    accuracy: 0.6,
  },
  {
    id: '3',
    word: 'Yield Farming',
    definition: '收益农场',
    pronunciation: '/jiːld ˈfɑːrmɪŋ/',
    examples: ['Yield farming allows users to earn passive income.'],
    category: 'defi' as any,
    difficulty: 'advanced' as any,
    tags: ['yield', 'farming'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false,
    studyCount: 2,
    accuracy: 0.4,
  },
];

export const RefreshablePage: React.FC = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(MOCK_VOCABULARY);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const toast = useToast();

  const {
    availableUpdates,
    currentUpdate,
    status,
    progress,
    hasUpdates,
    isUpdating,
    checkForUpdates,
    startUpdate,
    cancelUpdate,
    applyUpdate,
    ignoreUpdate,
  } = useContentUpdate({
    autoCheck: true,
    checkInterval: 60000, // 1分钟检查一次
  });

  /**
   * 处理下拉刷新
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟获取新的词汇数据
      const newWords: VocabularyItem[] = [
        {
          id: Date.now().toString(),
          word: 'Smart Contract',
          definition: '智能合约',
          pronunciation: '/smɑːrt ˈkɒntrækt/',
          examples: ['Smart contracts execute automatically when conditions are met.'],
          category: 'blockchain' as any,
          difficulty: 'intermediate' as any,
          tags: ['contract', 'automation'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: false,
          studyCount: 0,
          accuracy: 0,
        },
      ];
      
      setVocabulary(prev => [...newWords, ...prev]);
      setLastRefreshTime(new Date());
      
      toast({
        title: '刷新成功',
        description: `获取到 ${newWords.length} 个新词汇`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '刷新失败',
        description: '请检查网络连接后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * 手动检查更新
   */
  const handleCheckUpdates = async () => {
    const updates = await checkForUpdates(true);
    if (updates.length > 0) {
      setShowUpdateNotification(true);
    }
  };

  /**
   * 显示更新通知
   */
  useEffect(() => {
    if (hasUpdates && !showUpdateNotification) {
      setShowUpdateNotification(true);
    }
  }, [hasUpdates, showUpdateNotification]);

  /**
   * 渲染词汇卡片
   */
  const renderVocabularyCard = (item: VocabularyItem) => (
    <Card key={item.id} variant="outline">
      <CardBody>
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="full">
            <Text fontWeight="bold" fontSize="lg">
              {item.word}
            </Text>
            <Badge
              colorScheme={
                item.difficulty === 'beginner' ? 'green' :
                item.difficulty === 'intermediate' ? 'yellow' : 'red'
              }
            >
              {item.difficulty}
            </Badge>
          </HStack>
          
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            {item.definition}
          </Text>
          
          <Text fontSize="sm" color="blue.500">
            {item.pronunciation}
          </Text>
          
          <HStack spacing={4} fontSize="sm" color="gray.500">
            <HStack spacing={1}>
              <Icon as={FiBook} />
              <Text>学习 {item.studyCount} 次</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiTrendingUp} />
              <Text>正确率 {Math.round(item.accuracy * 100)}%</Text>
            </HStack>
            {item.accuracy >= 0.8 && (
              <HStack spacing={1}>
                <Icon as={FiStar} color="yellow.500" />
                <Text>已掌握</Text>
              </HStack>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      {/* 更新横幅 */}
      <Box p={4}>
        <UpdateBanner
          updateCount={availableUpdates.length}
          onShowUpdates={() => setShowUpdateNotification(true)}
          onDismiss={() => {}}
        />
      </Box>

      {/* 下拉刷新容器 */}
      <PullToRefresh
        onRefresh={handleRefresh}
        enabled={!isRefreshing}
        threshold={80}
        maxPullDistance={120}
        refreshDuration={1000}
      >
        <Box p={4} pb={20}>
          {/* 页面标题和操作 */}
          <VStack spacing={4} align="stretch" mb={6}>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontSize="2xl" fontWeight="bold">
                  Web3.0 词汇学习
                </Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  最后更新: {lastRefreshTime.toLocaleTimeString('zh-CN')}
                </Text>
              </VStack>
              
              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<FiRefreshCw />}
                  onClick={handleCheckUpdates}
                  variant="outline"
                >
                  检查更新
                </Button>
                <Button
                  size="sm"
                  leftIcon={isRefreshing ? <Spinner size="xs" /> : <FiRefreshCw />}
                  onClick={handleRefresh}
                  isLoading={isRefreshing}
                  loadingText="刷新中"
                  colorScheme="blue"
                >
                  手动刷新
                </Button>
              </HStack>
            </HStack>

            {/* 统计信息 */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Card variant="filled">
                <CardBody textAlign="center" py={4}>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {vocabulary.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    总词汇数
                  </Text>
                </CardBody>
              </Card>
              
              <Card variant="filled">
                <CardBody textAlign="center" py={4}>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {vocabulary.filter(v => v.accuracy >= 0.8).length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    已掌握
                  </Text>
                </CardBody>
              </Card>
              
              <Card variant="filled">
                <CardBody textAlign="center" py={4}>
                  <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                    {vocabulary.filter(v => v.accuracy > 0 && v.accuracy < 0.8).length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    学习中
                  </Text>
                </CardBody>
              </Card>
              
              <Card variant="filled">
                <CardBody textAlign="center" py={4}>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                    {vocabulary.filter(v => v.accuracy === 0).length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    未开始
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>

          {/* 词汇列表 */}
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="semibold">
              词汇列表
            </Text>
            
            {vocabulary.map(renderVocabularyCard)}
            
            {vocabulary.length === 0 && (
              <Card variant="outline">
                <CardBody textAlign="center" py={8}>
                  <Text color="gray.500">
                    暂无词汇数据，请下拉刷新获取内容
                  </Text>
                </CardBody>
              </Card>
            )}
          </VStack>
        </Box>
      </PullToRefresh>

      {/* 内容更新通知 */}
      <ContentUpdateNotification
        updateInfo={currentUpdate || availableUpdates[0] || null}
        status={status}
        progress={progress}
        visible={showUpdateNotification}
        isOnline={navigator.onLine}
        onStartUpdate={startUpdate}
        onCancelUpdate={cancelUpdate}
        onApplyUpdate={applyUpdate}
        onIgnoreUpdate={ignoreUpdate}
        onClose={() => setShowUpdateNotification(false)}
      />

      {/* 浮动更新按钮 */}
      <FloatingUpdateButton
        hasUpdates={hasUpdates}
        isUpdating={isUpdating}
        onClick={() => setShowUpdateNotification(true)}
      />
    </Box>
  );
};
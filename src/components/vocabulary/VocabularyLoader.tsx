import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Button,
  Text,
  useToast,
} from '@chakra-ui/react';
import { LoadingSkeleton, NetworkRetry } from '@/components/common';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { web3VocabularyAPI } from '@/services/web3VocabularyAPI';
import { vocabularyService } from '@/services/vocabularyService';
import { VocabularyItem } from '@/types';

/**
 * 词汇加载器组件Props
 */
interface VocabularyLoaderProps {
  /** 加载成功回调 */
  onLoadSuccess?: (vocabulary: VocabularyItem[]) => void;
  /** 加载失败回调 */
  onLoadError?: (error: string) => void;
  /** 是否自动加载 */
  autoLoad?: boolean;
  /** 词汇数量限制 */
  limit?: number;
}

/**
 * 词汇加载器组件
 * 演示如何使用LoadingSkeleton、网络错误处理和重试机制
 */
export const VocabularyLoader: React.FC<VocabularyLoaderProps> = ({
  onLoadSuccess,
  onLoadError,
  autoLoad = false,
  limit = 100,
}) => {
  const toast = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const {
    isLoading,
    isError,
    error,
    data,
    execute,
    retry,
    reset,
  } = useAsyncOperation<VocabularyItem[]>({
    showToast: false, // 我们自己处理提示
    onSuccess: (vocabulary) => {
      setRetryCount(0);
      onLoadSuccess?.(vocabulary);
      toast({
        title: '词汇加载成功',
        description: `成功加载 ${vocabulary.length} 个Web3.0词汇`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      onLoadError?.(error.message);
    },
  });

  /**
   * 加载Web3.0词汇
   */
  const loadWeb3Vocabulary = async () => {
    await execute(async () => {
      // 首先尝试从API获取词汇
      const apiResult = await web3VocabularyAPI.getWeb3Vocabulary(limit);
      
      if (!apiResult.success || !apiResult.data) {
        throw new Error(apiResult.error || '获取词汇失败');
      }

      // 将获取的词汇添加到本地词汇库
      const addResult = await vocabularyService.addMultipleVocabulary(
        apiResult.data.map(item => ({
          word: item.word,
          definition: item.definition,
          englishDefinition: item.englishDefinition,
          pronunciation: item.pronunciation,
          examples: item.examples,
          category: item.category,
          difficulty: item.difficulty,
          tags: item.tags,
          isCustom: false,
          studyCount: 0,
          accuracy: 0,
        }))
      );

      if (!addResult.success || !addResult.data) {
        throw new Error(addResult.error || '保存词汇失败');
      }

      return addResult.data;
    });
  };

  /**
   * 处理重试
   */
  const handleRetry = async () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      await retry();
    }
  };

  /**
   * 重置状态
   */
  const handleReset = () => {
    setRetryCount(0);
    reset();
  };

  // 自动加载
  useEffect(() => {
    if (autoLoad) {
      loadWeb3Vocabulary();
    }
  }, [autoLoad]);

  return (
    <Box>
      {/* 加载状态 */}
      {isLoading && (
        <VStack spacing={4}>
          <LoadingSkeleton type="list" repeat={3} />
          <Text color="gray.600" textAlign="center">
            正在加载Web3.0词汇数据...
          </Text>
        </VStack>
      )}

      {/* 错误状态 */}
      {isError && error && (
        <NetworkRetry
          error={error.message}
          onRetry={handleRetry}
          isRetrying={isLoading}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      )}

      {/* 成功状态 */}
      {data && !isLoading && !isError && (
        <VStack spacing={4}>
          <Text color="green.600" textAlign="center">
            ✅ 成功加载 {data.length} 个词汇
          </Text>
          <Button
            variant="outline"
            onClick={handleReset}
            size="sm"
          >
            重新加载
          </Button>
        </VStack>
      )}

      {/* 手动加载按钮 */}
      {!autoLoad && !isLoading && !data && !isError && (
        <VStack spacing={4}>
          <Text color="gray.600" textAlign="center">
            点击下方按钮加载Web3.0词汇数据
          </Text>
          <Button
            colorScheme="primary"
            onClick={loadWeb3Vocabulary}
            size="lg"
          >
            加载词汇数据
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default VocabularyLoader;
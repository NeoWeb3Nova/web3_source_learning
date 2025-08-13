import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, VStack, Button, Text, useToast, } from '@chakra-ui/react';
import { LoadingSkeleton, NetworkRetry } from '@/components/common';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { web3VocabularyAPI } from '@/services/web3VocabularyAPI';
import { vocabularyService } from '@/services/vocabularyService';
export const VocabularyLoader = ({ onLoadSuccess, onLoadError, autoLoad = false, limit = 100, }) => {
    const toast = useToast();
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;
    const { isLoading, isError, error, data, execute, retry, reset, } = useAsyncOperation({
        showToast: false,
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
    const loadWeb3Vocabulary = async () => {
        await execute(async () => {
            const apiResult = await web3VocabularyAPI.getWeb3Vocabulary(limit);
            if (!apiResult.success || !apiResult.data) {
                throw new Error(apiResult.error || '获取词汇失败');
            }
            const addResult = await vocabularyService.addMultipleVocabulary(apiResult.data.map(item => ({
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
            })));
            if (!addResult.success || !addResult.data) {
                throw new Error(addResult.error || '保存词汇失败');
            }
            return addResult.data;
        });
    };
    const handleRetry = async () => {
        if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            await retry();
        }
    };
    const handleReset = () => {
        setRetryCount(0);
        reset();
    };
    useEffect(() => {
        if (autoLoad) {
            loadWeb3Vocabulary();
        }
    }, [autoLoad]);
    return (_jsxs(Box, { children: [isLoading && (_jsxs(VStack, { spacing: 4, children: [_jsx(LoadingSkeleton, { type: "list", repeat: 3 }), _jsx(Text, { color: "gray.600", textAlign: "center", children: "\u6B63\u5728\u52A0\u8F7DWeb3.0\u8BCD\u6C47\u6570\u636E..." })] })), isError && error && (_jsx(NetworkRetry, { error: error.message, onRetry: handleRetry, isRetrying: isLoading, retryCount: retryCount, maxRetries: maxRetries })), data && !isLoading && !isError && (_jsxs(VStack, { spacing: 4, children: [_jsxs(Text, { color: "green.600", textAlign: "center", children: ["\u2705 \u6210\u529F\u52A0\u8F7D ", data.length, " \u4E2A\u8BCD\u6C47"] }), _jsx(Button, { variant: "outline", onClick: handleReset, size: "sm", children: "\u91CD\u65B0\u52A0\u8F7D" })] })), !autoLoad && !isLoading && !data && !isError && (_jsxs(VStack, { spacing: 4, children: [_jsx(Text, { color: "gray.600", textAlign: "center", children: "\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u52A0\u8F7DWeb3.0\u8BCD\u6C47\u6570\u636E" }), _jsx(Button, { colorScheme: "primary", onClick: loadWeb3Vocabulary, size: "lg", children: "\u52A0\u8F7D\u8BCD\u6C47\u6570\u636E" })] }))] }));
};
export default VocabularyLoader;

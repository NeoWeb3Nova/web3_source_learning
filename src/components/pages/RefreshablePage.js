import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Card, CardBody, Badge, Icon, useToast, Spinner, SimpleGrid, } from '@chakra-ui/react';
import { FiRefreshCw, FiBook, FiTrendingUp, FiStar } from 'react-icons/fi';
import { PullToRefresh, ContentUpdateNotification, UpdateBanner, FloatingUpdateButton, } from '@/components/common';
import { useContentUpdate } from '@/hooks/useContentUpdate';
const MOCK_VOCABULARY = [
    {
        id: '1',
        word: 'DeFi',
        definition: '去中心化金融',
        pronunciation: '/diːfaɪ/',
        examples: ['DeFi protocols are revolutionizing traditional finance.'],
        category: 'defi',
        difficulty: 'beginner',
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
        category: 'defi',
        difficulty: 'intermediate',
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
        category: 'defi',
        difficulty: 'advanced',
        tags: ['yield', 'farming'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isCustom: false,
        studyCount: 2,
        accuracy: 0.4,
    },
];
export const RefreshablePage = () => {
    const [vocabulary, setVocabulary] = useState(MOCK_VOCABULARY);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
    const [showUpdateNotification, setShowUpdateNotification] = useState(false);
    const toast = useToast();
    const { availableUpdates, currentUpdate, status, progress, hasUpdates, isUpdating, checkForUpdates, startUpdate, cancelUpdate, applyUpdate, ignoreUpdate, } = useContentUpdate({
        autoCheck: true,
        checkInterval: 60000,
    });
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const newWords = [
                {
                    id: Date.now().toString(),
                    word: 'Smart Contract',
                    definition: '智能合约',
                    pronunciation: '/smɑːrt ˈkɒntrækt/',
                    examples: ['Smart contracts execute automatically when conditions are met.'],
                    category: 'blockchain',
                    difficulty: 'intermediate',
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
        }
        catch (error) {
            toast({
                title: '刷新失败',
                description: '请检查网络连接后重试',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
        finally {
            setIsRefreshing(false);
        }
    };
    const handleCheckUpdates = async () => {
        const updates = await checkForUpdates(true);
        if (updates.length > 0) {
            setShowUpdateNotification(true);
        }
    };
    useEffect(() => {
        if (hasUpdates && !showUpdateNotification) {
            setShowUpdateNotification(true);
        }
    }, [hasUpdates, showUpdateNotification]);
    const renderVocabularyCard = (item) => (_jsx(Card, { variant: "outline", children: _jsx(CardBody, { children: _jsxs(VStack, { align: "start", spacing: 3, children: [_jsxs(HStack, { justify: "space-between", w: "full", children: [_jsx(Text, { fontWeight: "bold", fontSize: "lg", children: item.word }), _jsx(Badge, { colorScheme: item.difficulty === 'beginner' ? 'green' :
                                    item.difficulty === 'intermediate' ? 'yellow' : 'red', children: item.difficulty })] }), _jsx(Text, { color: "gray.600", _dark: { color: 'gray.400' }, children: item.definition }), _jsx(Text, { fontSize: "sm", color: "blue.500", children: item.pronunciation }), _jsxs(HStack, { spacing: 4, fontSize: "sm", color: "gray.500", children: [_jsxs(HStack, { spacing: 1, children: [_jsx(Icon, { as: FiBook }), _jsxs(Text, { children: ["\u5B66\u4E60 ", item.studyCount, " \u6B21"] })] }), _jsxs(HStack, { spacing: 1, children: [_jsx(Icon, { as: FiTrendingUp }), _jsxs(Text, { children: ["\u6B63\u786E\u7387 ", Math.round(item.accuracy * 100), "%"] })] }), item.accuracy >= 0.8 && (_jsxs(HStack, { spacing: 1, children: [_jsx(Icon, { as: FiStar, color: "yellow.500" }), _jsx(Text, { children: "\u5DF2\u638C\u63E1" })] }))] })] }) }) }, item.id));
    return (_jsxs(Box, { minH: "100vh", bg: "gray.50", _dark: { bg: 'gray.900' }, children: [_jsx(Box, { p: 4, children: _jsx(UpdateBanner, { updateCount: availableUpdates.length, onShowUpdates: () => setShowUpdateNotification(true), onDismiss: () => { } }) }), _jsx(PullToRefresh, { onRefresh: handleRefresh, enabled: !isRefreshing, threshold: 80, maxPullDistance: 120, refreshDuration: 1000, children: _jsxs(Box, { p: 4, pb: 20, children: [_jsxs(VStack, { spacing: 4, align: "stretch", mb: 6, children: [_jsxs(HStack, { justify: "space-between", align: "center", children: [_jsxs(VStack, { align: "start", spacing: 1, children: [_jsx(Text, { fontSize: "2xl", fontWeight: "bold", children: "Web3.0 \u8BCD\u6C47\u5B66\u4E60" }), _jsxs(Text, { fontSize: "sm", color: "gray.600", _dark: { color: 'gray.400' }, children: ["\u6700\u540E\u66F4\u65B0: ", lastRefreshTime.toLocaleTimeString('zh-CN')] })] }), _jsxs(HStack, { spacing: 2, children: [_jsx(Button, { size: "sm", leftIcon: _jsx(FiRefreshCw, {}), onClick: handleCheckUpdates, variant: "outline", children: "\u68C0\u67E5\u66F4\u65B0" }), _jsx(Button, { size: "sm", leftIcon: isRefreshing ? _jsx(Spinner, { size: "xs" }) : _jsx(FiRefreshCw, {}), onClick: handleRefresh, isLoading: isRefreshing, loadingText: "\u5237\u65B0\u4E2D", colorScheme: "blue", children: "\u624B\u52A8\u5237\u65B0" })] })] }), _jsxs(SimpleGrid, { columns: { base: 2, md: 4 }, spacing: 4, children: [_jsx(Card, { variant: "filled", children: _jsxs(CardBody, { textAlign: "center", py: 4, children: [_jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "blue.500", children: vocabulary.length }), _jsx(Text, { fontSize: "sm", color: "gray.600", children: "\u603B\u8BCD\u6C47\u6570" })] }) }), _jsx(Card, { variant: "filled", children: _jsxs(CardBody, { textAlign: "center", py: 4, children: [_jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "green.500", children: vocabulary.filter(v => v.accuracy >= 0.8).length }), _jsx(Text, { fontSize: "sm", color: "gray.600", children: "\u5DF2\u638C\u63E1" })] }) }), _jsx(Card, { variant: "filled", children: _jsxs(CardBody, { textAlign: "center", py: 4, children: [_jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "yellow.500", children: vocabulary.filter(v => v.accuracy > 0 && v.accuracy < 0.8).length }), _jsx(Text, { fontSize: "sm", color: "gray.600", children: "\u5B66\u4E60\u4E2D" })] }) }), _jsx(Card, { variant: "filled", children: _jsxs(CardBody, { textAlign: "center", py: 4, children: [_jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "gray.500", children: vocabulary.filter(v => v.accuracy === 0).length }), _jsx(Text, { fontSize: "sm", color: "gray.600", children: "\u672A\u5F00\u59CB" })] }) })] })] }), _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", children: "\u8BCD\u6C47\u5217\u8868" }), vocabulary.map(renderVocabularyCard), vocabulary.length === 0 && (_jsx(Card, { variant: "outline", children: _jsx(CardBody, { textAlign: "center", py: 8, children: _jsx(Text, { color: "gray.500", children: "\u6682\u65E0\u8BCD\u6C47\u6570\u636E\uFF0C\u8BF7\u4E0B\u62C9\u5237\u65B0\u83B7\u53D6\u5185\u5BB9" }) }) }))] })] }) }), _jsx(ContentUpdateNotification, { updateInfo: currentUpdate || availableUpdates[0] || null, status: status, progress: progress, visible: showUpdateNotification, isOnline: navigator.onLine, onStartUpdate: startUpdate, onCancelUpdate: cancelUpdate, onApplyUpdate: applyUpdate, onIgnoreUpdate: ignoreUpdate, onClose: () => setShowUpdateNotification(false) }), _jsx(FloatingUpdateButton, { hasUpdates: hasUpdates, isUpdating: isUpdating, onClick: () => setShowUpdateNotification(true) })] }));
};

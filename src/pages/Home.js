import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Button, useToast, useDisclosure, } from '@chakra-ui/react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useProgress } from '@/hooks/useProgress';
import { useTextToSpeech } from '@/hooks/useAudio';
import { useKeyboardNavigation } from '@/hooks/useSwipeGesture';
import { WordCard, WordDetailsModal } from '@/components/vocabulary';
import { Web3Category, DifficultyLevel } from '@/types';
const HomePage = () => {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedWord, setSelectedWord] = useState(null);
    const { initializeVocabulary, vocabulary, currentWord, currentIndex, nextWord, previousWord, toggleFavorite, isFavorite, addVocabulary, loading: vocabLoading, } = useVocabulary();
    const { initializeProgress, userProgress, addMasteredWord, startStudySession, endStudySession, loading: progressLoading, } = useProgress();
    const { speak } = useTextToSpeech();
    useEffect(() => {
        const initializeApp = async () => {
            try {
                await Promise.all([
                    initializeVocabulary(),
                    initializeProgress(),
                ]);
                if (vocabulary.length === 0) {
                    const sampleWords = [
                        {
                            word: 'DeFi',
                            definition: '去中心化金融，指建立在区块链网络上的金融服务',
                            englishDefinition: 'Decentralized Finance - financial services built on blockchain networks',
                            pronunciation: 'diːfaɪ',
                            examples: [
                                'DeFi协议允许用户无需传统银行即可进行借贷。',
                                'Many investors are exploring DeFi opportunities.',
                            ],
                            category: Web3Category.DEFI,
                            difficulty: DifficultyLevel.BEGINNER,
                            tags: ['金融', '区块链', '去中心化'],
                            isCustom: false,
                        },
                        {
                            word: 'Smart Contract',
                            definition: '智能合约，自动执行合约条款的计算机程序',
                            englishDefinition: 'Self-executing contracts with terms directly written into code',
                            pronunciation: 'smɑːrt ˈkɒntrækt',
                            examples: [
                                '智能合约消除了对中介机构的需求。',
                                'Smart contracts automatically execute when conditions are met.',
                            ],
                            category: Web3Category.BLOCKCHAIN,
                            difficulty: DifficultyLevel.INTERMEDIATE,
                            tags: ['合约', '自动化', '区块链'],
                            isCustom: false,
                        },
                        {
                            word: 'Liquidity Pool',
                            definition: '流动性池，用户存入代币以提供交易流动性的资金池',
                            englishDefinition: 'A pool of tokens locked in smart contracts to provide liquidity',
                            pronunciation: 'lɪˈkwɪdɪti puːl',
                            examples: [
                                '用户可以向流动性池提供代币来赚取手续费。',
                                'Liquidity pools enable decentralized trading.',
                            ],
                            category: Web3Category.DEFI,
                            difficulty: DifficultyLevel.ADVANCED,
                            tags: ['流动性', '交易', 'AMM'],
                            isCustom: false,
                        },
                    ];
                    sampleWords.forEach(wordData => {
                        addVocabulary({
                            ...wordData,
                            studyCount: 0,
                            accuracy: 0,
                        });
                    });
                }
                toast({
                    title: '欢迎回来！',
                    description: '数据加载完成，开始您的学习之旅吧！',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            }
            catch (error) {
                toast({
                    title: '初始化失败',
                    description: '数据加载出现问题，请刷新页面重试',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        };
        initializeApp();
    }, [initializeVocabulary, initializeProgress, toast, vocabulary.length, addVocabulary]);
    useKeyboardNavigation({
        onArrowLeft: previousWord,
        onArrowRight: nextWord,
        onSpace: () => currentWord && handlePlayAudio(currentWord.word),
        onEnter: () => currentWord && handleShowDetails(currentWord),
    });
    const isLoading = vocabLoading || progressLoading;
    const handlePlayAudio = (word) => {
        speak(word, { lang: 'en-US', rate: 0.8 });
    };
    const handleToggleFavorite = () => {
        if (currentWord) {
            toggleFavorite(currentWord.id);
            toast({
                title: isFavorite(currentWord.id) ? '已取消收藏' : '已添加收藏',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        }
    };
    const handleShowDetails = (word) => {
        setSelectedWord(word);
        onOpen();
    };
    const handleMarkMastered = () => {
        if (currentWord) {
            addMasteredWord(currentWord.id);
            toast({
                title: '已标记为掌握',
                description: `恭喜您掌握了"${currentWord.word}"！`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }
    };
    const handleSwipeLeft = () => {
        previousWord();
    };
    const handleSwipeRight = () => {
        nextWord();
    };
    return (_jsxs(Box, { p: 6, children: [_jsxs(VStack, { spacing: 8, align: "stretch", children: [_jsxs(Box, { textAlign: "center", children: [_jsx(Heading, { size: "xl", mb: 4, color: "primary.600", children: "Web3.0 DeFi\u8BCD\u6C47\u5927\u4F5C\u6218" }), _jsx(Text, { fontSize: "lg", color: "gray.600", children: "\u638C\u63E1\u533A\u5757\u94FE\u548C\u53BB\u4E2D\u5FC3\u5316\u91D1\u878D\u7684\u6838\u5FC3\u8BCD\u6C47" })] }), isLoading ? (_jsx(Box, { textAlign: "center", py: 10, children: _jsx(Text, { color: "gray.500", children: "\u6B63\u5728\u52A0\u8F7D\u6570\u636E..." }) })) : currentWord ? (_jsxs(VStack, { spacing: 6, children: [_jsxs(HStack, { justify: "space-between", w: "full", maxW: "400px", children: [_jsxs(Text, { fontSize: "sm", color: "gray.500", children: [currentIndex + 1, " / ", vocabulary.length] }), _jsx(Text, { fontSize: "sm", color: "gray.500", children: "\u4F7F\u7528 \u2190 \u2192 \u952E\u6216\u6ED1\u52A8\u5207\u6362" })] }), _jsx(WordCard, { word: currentWord, isFavorite: isFavorite(currentWord.id), showProgress: true, progress: (currentIndex + 1) / vocabulary.length, onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight, onToggleFavorite: handleToggleFavorite, onPlayAudio: () => handlePlayAudio(currentWord.word), onShowDetails: () => handleShowDetails(currentWord), onMarkMastered: handleMarkMastered }), _jsxs(HStack, { spacing: 4, children: [_jsx(Button, { variant: "outline", colorScheme: "primary", onClick: previousWord, isDisabled: vocabulary.length <= 1, children: "\u4E0A\u4E00\u4E2A" }), _jsx(Button, { colorScheme: "primary", onClick: () => handlePlayAudio(currentWord.word), children: "\u64AD\u653E\u53D1\u97F3" }), _jsx(Button, { variant: "outline", colorScheme: "primary", onClick: nextWord, isDisabled: vocabulary.length <= 1, children: "\u4E0B\u4E00\u4E2A" })] }), _jsxs(Box, { bg: "white", p: 6, borderRadius: "xl", boxShadow: "sm", border: "1px solid", borderColor: "gray.200", w: "full", maxW: "400px", children: [_jsx(Heading, { size: "md", mb: 4, children: "\u5B66\u4E60\u7EDF\u8BA1" }), _jsxs(VStack, { spacing: 2, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { children: "\u8BCD\u6C47\u603B\u6570:" }), _jsx(Text, { fontWeight: "semibold", children: vocabulary.length })] }), _jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { children: "\u5F53\u524D\u7B49\u7EA7:" }), _jsxs(Text, { fontWeight: "semibold", children: ["Lv.", userProgress?.level || 1] })] }), _jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { children: "\u8FDE\u7EED\u5B66\u4E60:" }), _jsxs(Text, { fontWeight: "semibold", children: [userProgress?.streakDays || 0, " \u5929"] })] }), _jsxs(HStack, { justify: "space-between", children: [_jsx(Text, { children: "\u5DF2\u638C\u63E1:" }), _jsxs(Text, { fontWeight: "semibold", children: [userProgress?.masteredWords.length || 0, " \u4E2A"] })] })] })] })] })) : (_jsxs(Box, { textAlign: "center", py: 10, children: [_jsx(Text, { color: "gray.500", mb: 4, children: "\u6682\u65E0\u8BCD\u6C47\u6570\u636E" }), _jsx(Button, { colorScheme: "primary", onClick: () => {
                                    toast({
                                        title: '功能开发中',
                                        description: '添加词汇功能正在开发中，敬请期待！',
                                        status: 'info',
                                        duration: 3000,
                                        isClosable: true,
                                    });
                                }, children: "\u6DFB\u52A0\u8BCD\u6C47" })] }))] }), _jsx(WordDetailsModal, { isOpen: isOpen, word: selectedWord, isFavorite: selectedWord ? isFavorite(selectedWord.id) : false, isMastered: selectedWord ? userProgress?.masteredWords.includes(selectedWord.id) || false : false, onClose: onClose, onToggleFavorite: () => {
                    if (selectedWord) {
                        toggleFavorite(selectedWord.id);
                    }
                }, onToggleMastered: () => {
                    if (selectedWord) {
                        addMasteredWord(selectedWord.id);
                    }
                }, onPlayAudio: () => {
                    if (selectedWord) {
                        handlePlayAudio(selectedWord.word);
                    }
                } })] }));
};
export default HomePage;

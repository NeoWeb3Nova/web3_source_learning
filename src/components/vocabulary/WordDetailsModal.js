import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, HStack, Text, Badge, Divider, Box, Progress, Flex, Tag, TagLabel, IconButton, Tooltip, useColorModeValue, } from '@chakra-ui/react';
import { CalendarIcon, ClockIcon, ChartBarIcon, TagIcon, SpeakerWaveIcon, } from '@heroicons/react/24/outline';
import { WordActions, WordStatusIndicator } from './WordActions';
export const WordDetailsModal = ({ isOpen, word, isFavorite = false, isMastered = false, onClose, onToggleFavorite, onToggleMastered, onPlayAudio, onMarkDifficult, onMarkEasy, className, style, testId, }) => {
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const textColor = useColorModeValue('gray.800', 'white');
    const mutedColor = useColorModeValue('gray.600', 'gray.400');
    if (!word)
        return null;
    const difficultyColors = {
        beginner: 'green',
        intermediate: 'orange',
        advanced: 'red',
    };
    const categoryColors = {
        blockchain: 'blue',
        defi: 'purple',
        nft: 'pink',
        trading: 'teal',
        protocol: 'cyan',
        consensus: 'yellow',
        security: 'red',
        governance: 'gray',
    };
    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 0.8)
            return 'green.500';
        if (accuracy >= 0.6)
            return 'orange.500';
        return 'red.500';
    };
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };
    return (_jsxs(Modal, { isOpen: isOpen, onClose: onClose, size: "lg", scrollBehavior: "inside", isCentered: true, children: [_jsx(ModalOverlay, { bg: "blackAlpha.600", backdropFilter: "blur(4px)" }), _jsxs(ModalContent, { className: className, style: style, "data-testid": testId, bg: bgColor, borderRadius: "2xl", border: "1px solid", borderColor: borderColor, maxH: "90vh", children: [_jsx(ModalHeader, { pb: 2, children: _jsxs(HStack, { justify: "space-between", align: "start", children: [_jsxs(VStack, { align: "start", spacing: 1, children: [_jsxs(HStack, { spacing: 3, align: "center", children: [_jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: textColor, children: word.word }), _jsx(Tooltip, { label: "\u64AD\u653E\u53D1\u97F3", children: _jsx(IconButton, { "aria-label": "\u64AD\u653E\u53D1\u97F3", icon: _jsx(SpeakerWaveIcon, { width: 20, height: 20 }), size: "sm", variant: "ghost", colorScheme: "primary", onClick: onPlayAudio, _hover: { transform: 'scale(1.1)' } }) })] }), _jsxs(Text, { fontSize: "md", color: mutedColor, fontFamily: "mono", children: ["/", word.pronunciation, "/"] }), _jsxs(HStack, { spacing: 2, children: [_jsx(Badge, { colorScheme: difficultyColors[word.difficulty], variant: "solid", borderRadius: "full", children: word.difficulty }), _jsx(Badge, { colorScheme: categoryColors[word.category], variant: "outline", borderRadius: "full", children: word.category })] })] }), _jsx(WordStatusIndicator, { word: word, isFavorite: isFavorite, isMastered: isMastered, mode: "icons" })] }) }), _jsx(ModalCloseButton, {}), _jsx(ModalBody, { pb: 6, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 3, color: textColor, children: "\u91CA\u4E49" }), _jsxs(Box, { bg: "gray.50", borderRadius: "lg", p: 4, border: "1px solid", borderColor: borderColor, children: [_jsx(Text, { fontSize: "md", lineHeight: "1.6", color: textColor, children: word.definition }), word.englishDefinition && (_jsx(Text, { fontSize: "sm", color: mutedColor, fontStyle: "italic", mt: 2, lineHeight: "1.5", children: word.englishDefinition }))] })] }), word.examples.length > 0 && (_jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 3, color: textColor, children: "\u4F8B\u53E5" }), _jsx(VStack, { spacing: 3, align: "stretch", children: word.examples.map((example, index) => (_jsx(Box, { bg: "blue.50", borderRadius: "lg", p: 3, border: "1px solid", borderColor: "blue.200", children: _jsx(Text, { fontSize: "sm", lineHeight: "1.5", color: textColor, children: example }) }, index))) })] })), word.tags.length > 0 && (_jsxs(Box, { children: [_jsxs(HStack, { mb: 3, align: "center", children: [_jsx(TagIcon, { width: 16, height: 16 }), _jsx(Text, { fontSize: "lg", fontWeight: "semibold", color: textColor, children: "\u6807\u7B7E" })] }), _jsx(Flex, { wrap: "wrap", gap: 2, children: word.tags.map((tag, index) => (_jsx(Tag, { size: "sm", variant: "subtle", colorScheme: "gray", borderRadius: "full", children: _jsx(TagLabel, { children: tag }) }, index))) })] })), _jsx(Divider, {}), _jsxs(Box, { children: [_jsxs(HStack, { mb: 4, align: "center", children: [_jsx(ChartBarIcon, { width: 16, height: 16 }), _jsx(Text, { fontSize: "lg", fontWeight: "semibold", color: textColor, children: "\u5B66\u4E60\u7EDF\u8BA1" })] }), _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(Box, { children: [_jsxs(HStack, { justify: "space-between", mb: 2, children: [_jsx(Text, { fontSize: "sm", color: mutedColor, children: "\u638C\u63E1\u7A0B\u5EA6" }), _jsxs(Text, { fontSize: "sm", fontWeight: "semibold", color: getAccuracyColor(word.accuracy), children: [Math.round(word.accuracy * 100), "%"] })] }), _jsx(Progress, { value: word.accuracy * 100, colorScheme: word.accuracy >= 0.8 ? 'green' :
                                                                word.accuracy >= 0.6 ? 'orange' : 'red', size: "sm", borderRadius: "full" })] }), _jsxs(HStack, { justify: "space-between", children: [_jsxs(HStack, { spacing: 2, children: [_jsx(ClockIcon, { width: 16, height: 16 }), _jsx(Text, { fontSize: "sm", color: mutedColor, children: "\u5B66\u4E60\u6B21\u6570" })] }), _jsxs(Text, { fontSize: "sm", fontWeight: "semibold", color: textColor, children: [word.studyCount, " \u6B21"] })] }), _jsxs(VStack, { spacing: 2, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", children: [_jsxs(HStack, { spacing: 2, children: [_jsx(CalendarIcon, { width: 16, height: 16 }), _jsx(Text, { fontSize: "sm", color: mutedColor, children: "\u6DFB\u52A0\u65F6\u95F4" })] }), _jsx(Text, { fontSize: "sm", color: textColor, children: formatDate(word.createdAt) })] }), _jsxs(HStack, { justify: "space-between", children: [_jsxs(HStack, { spacing: 2, children: [_jsx(CalendarIcon, { width: 16, height: 16 }), _jsx(Text, { fontSize: "sm", color: mutedColor, children: "\u66F4\u65B0\u65F6\u95F4" })] }), _jsx(Text, { fontSize: "sm", color: textColor, children: formatDate(word.updatedAt) })] })] }), word.isCustom && (_jsx(Box, { bg: "purple.50", borderRadius: "lg", p: 3, border: "1px solid", borderColor: "purple.200", children: _jsx(Text, { fontSize: "sm", color: "purple.700", textAlign: "center", children: "\uD83C\uDFAF \u8FD9\u662F\u60A8\u81EA\u5B9A\u4E49\u6DFB\u52A0\u7684\u8BCD\u6C47" }) }))] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 4, color: textColor, children: "\u64CD\u4F5C" }), _jsx(WordActions, { word: word, isFavorite: isFavorite, isMastered: isMastered, showDetailedActions: true, size: "md", direction: "row", onToggleFavorite: onToggleFavorite, onToggleMastered: onToggleMastered, onPlayAudio: onPlayAudio, onMarkDifficult: onMarkDifficult, onMarkEasy: onMarkEasy })] })] }) })] })] }));
};
export default WordDetailsModal;

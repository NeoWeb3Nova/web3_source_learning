import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { HStack, VStack, IconButton, Button, Text, Tooltip, useColorModeValue, Badge, Flex, } from '@chakra-ui/react';
import { HeartIcon, CheckCircleIcon, XCircleIcon, EyeIcon, SpeakerWaveIcon, } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid, CheckCircleIcon as CheckCircleIconSolid, } from '@heroicons/react/24/solid';
export const WordActions = ({ word, isFavorite = false, isMastered = false, showDetailedActions = false, size = 'md', direction = 'row', onToggleFavorite, onToggleMastered, onPlayAudio, onViewDetails, onMarkDifficult, onMarkEasy, className, style, testId, }) => {
    const favoriteColor = useColorModeValue('red.500', 'red.300');
    const masteredColor = useColorModeValue('green.500', 'green.300');
    const buttonBg = useColorModeValue('white', 'gray.700');
    const buttonHoverBg = useColorModeValue('gray.50', 'gray.600');
    const Container = direction === 'row' ? HStack : VStack;
    const buttonSizes = {
        sm: { iconSize: 4, buttonSize: 'sm' },
        md: { iconSize: 5, buttonSize: 'md' },
        lg: { iconSize: 6, buttonSize: 'lg' },
    };
    const { iconSize, buttonSize } = buttonSizes[size];
    return (_jsxs(Container, { className: className, style: style, "data-testid": testId, spacing: direction === 'row' ? 2 : 3, align: "center", children: [_jsx(Tooltip, { label: isFavorite ? '取消收藏' : '添加收藏', children: _jsx(IconButton, { "aria-label": isFavorite ? '取消收藏' : '添加收藏', icon: isFavorite ? (_jsx(HeartIconSolid, { width: iconSize * 4, height: iconSize * 4 })) : (_jsx(HeartIcon, { width: iconSize * 4, height: iconSize * 4 })), size: buttonSize, variant: "ghost", color: isFavorite ? favoriteColor : 'gray.400', bg: buttonBg, _hover: {
                        bg: buttonHoverBg,
                        color: favoriteColor,
                        transform: 'scale(1.1)',
                    }, _active: {
                        transform: 'scale(0.95)',
                    }, transition: "all 0.2s ease", onClick: onToggleFavorite }) }), _jsx(Tooltip, { label: "\u64AD\u653E\u53D1\u97F3", children: _jsx(IconButton, { "aria-label": "\u64AD\u653E\u53D1\u97F3", icon: _jsx(SpeakerWaveIcon, { width: iconSize * 4, height: iconSize * 4 }), size: buttonSize, variant: "ghost", colorScheme: "primary", bg: buttonBg, _hover: {
                        bg: buttonHoverBg,
                        transform: 'scale(1.1)',
                    }, _active: {
                        transform: 'scale(0.95)',
                    }, transition: "all 0.2s ease", onClick: onPlayAudio }) }), _jsx(Tooltip, { label: isMastered ? '标记为未掌握' : '标记为已掌握', children: _jsx(IconButton, { "aria-label": isMastered ? '标记为未掌握' : '标记为已掌握', icon: isMastered ? (_jsx(CheckCircleIconSolid, { width: iconSize * 4, height: iconSize * 4 })) : (_jsx(CheckCircleIcon, { width: iconSize * 4, height: iconSize * 4 })), size: buttonSize, variant: "ghost", color: isMastered ? masteredColor : 'gray.400', bg: buttonBg, _hover: {
                        bg: buttonHoverBg,
                        color: masteredColor,
                        transform: 'scale(1.1)',
                    }, _active: {
                        transform: 'scale(0.95)',
                    }, transition: "all 0.2s ease", onClick: onToggleMastered }) }), _jsx(Tooltip, { label: "\u67E5\u770B\u8BE6\u7EC6\u4FE1\u606F", children: _jsx(IconButton, { "aria-label": "\u67E5\u770B\u8BE6\u7EC6\u4FE1\u606F", icon: _jsx(EyeIcon, { width: iconSize * 4, height: iconSize * 4 }), size: buttonSize, variant: "ghost", colorScheme: "secondary", bg: buttonBg, _hover: {
                        bg: buttonHoverBg,
                        transform: 'scale(1.1)',
                    }, _active: {
                        transform: 'scale(0.95)',
                    }, transition: "all 0.2s ease", onClick: onViewDetails }) }), showDetailedActions && (_jsxs(_Fragment, { children: [direction === 'row' && (_jsx(Text, { color: "gray.400", fontSize: "sm", children: "|" })), _jsxs(HStack, { spacing: 1, children: [_jsx(Tooltip, { label: "\u6807\u8BB0\u4E3A\u56F0\u96BE", children: _jsx(Button, { size: "xs", variant: "outline", colorScheme: "red", leftIcon: _jsx(XCircleIcon, { width: 12, height: 12 }), onClick: onMarkDifficult, _hover: { transform: 'scale(1.05)' }, children: "\u56F0\u96BE" }) }), _jsx(Tooltip, { label: "\u6807\u8BB0\u4E3A\u7B80\u5355", children: _jsx(Button, { size: "xs", variant: "outline", colorScheme: "green", leftIcon: _jsx(CheckCircleIcon, { width: 12, height: 12 }), onClick: onMarkEasy, _hover: { transform: 'scale(1.05)' }, children: "\u7B80\u5355" }) })] })] }))] }));
};
export const WordStatusIndicator = ({ word, isFavorite = false, isMastered = false, mode = 'badges', className, style, testId, }) => {
    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 0.8)
            return 'green';
        if (accuracy >= 0.6)
            return 'orange';
        return 'red';
    };
    if (mode === 'badges') {
        return (_jsxs(Flex, { className: className, style: style, "data-testid": testId, wrap: "wrap", gap: 1, align: "center", children: [isFavorite && (_jsxs(Badge, { colorScheme: "red", variant: "solid", borderRadius: "full", fontSize: "xs", display: "flex", alignItems: "center", gap: 1, children: [_jsx(HeartIconSolid, { width: 10, height: 10 }), "\u6536\u85CF"] })), isMastered && (_jsxs(Badge, { colorScheme: "green", variant: "solid", borderRadius: "full", fontSize: "xs", display: "flex", alignItems: "center", gap: 1, children: [_jsx(CheckCircleIconSolid, { width: 10, height: 10 }), "\u5DF2\u638C\u63E1"] })), _jsxs(Badge, { colorScheme: getAccuracyColor(word.accuracy), variant: "outline", borderRadius: "full", fontSize: "xs", children: [Math.round(word.accuracy * 100), "%"] }), word.studyCount > 0 && (_jsxs(Badge, { colorScheme: "blue", variant: "subtle", borderRadius: "full", fontSize: "xs", children: ["\u5B66\u4E60", word.studyCount, "\u6B21"] }))] }));
    }
    if (mode === 'icons') {
        return (_jsxs(HStack, { className: className, style: style, "data-testid": testId, spacing: 2, children: [isFavorite && (_jsx(HeartIconSolid, { width: 16, height: 16, color: "red" })), isMastered && (_jsx(CheckCircleIconSolid, { width: 16, height: 16, color: "green" })), _jsx(BookmarkIconSolid, { width: 16, height: 16, color: getAccuracyColor(word.accuracy) === 'green' ? 'green' :
                        getAccuracyColor(word.accuracy) === 'orange' ? 'orange' : 'red' })] }));
    }
    return (_jsxs(VStack, { className: className, style: style, "data-testid": testId, spacing: 1, align: "start", children: [isFavorite && (_jsx(Text, { fontSize: "xs", color: "red.500", children: "\u2764\uFE0F \u5DF2\u6536\u85CF" })), isMastered && (_jsx(Text, { fontSize: "xs", color: "green.500", children: "\u2705 \u5DF2\u638C\u63E1" })), _jsxs(Text, { fontSize: "xs", color: "gray.500", children: ["\u51C6\u786E\u7387: ", Math.round(word.accuracy * 100), "%"] }), word.studyCount > 0 && (_jsxs(Text, { fontSize: "xs", color: "gray.500", children: ["\u5B66\u4E60\u6B21\u6570: ", word.studyCount] }))] }));
};
export default WordActions;

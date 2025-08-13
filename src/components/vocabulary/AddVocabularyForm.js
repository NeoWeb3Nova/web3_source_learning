import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, VStack, HStack, FormControl, FormLabel, FormErrorMessage, Input, Textarea, Select, Button, Tag, TagLabel, TagCloseButton, Wrap, WrapItem, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Text, Divider, } from '@chakra-ui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Web3Category, DifficultyLevel } from '@/types';
import { vocabularyService } from '@/services/vocabularyService';
const categoryOptions = [
    { value: Web3Category.BLOCKCHAIN, label: '区块链基础' },
    { value: Web3Category.DEFI, label: '去中心化金融' },
    { value: Web3Category.NFT, label: '非同质化代币' },
    { value: Web3Category.TRADING, label: '交易相关' },
    { value: Web3Category.PROTOCOL, label: '协议技术' },
    { value: Web3Category.CONSENSUS, label: '共识机制' },
    { value: Web3Category.SECURITY, label: '安全相关' },
    { value: Web3Category.GOVERNANCE, label: '治理机制' },
];
const difficultyOptions = [
    { value: DifficultyLevel.BEGINNER, label: '初级' },
    { value: DifficultyLevel.INTERMEDIATE, label: '中级' },
    { value: DifficultyLevel.ADVANCED, label: '高级' },
];
export const AddVocabularyForm = ({ isOpen, onClose, onSuccess, initialData, className, style, testId, }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({
        word: initialData?.word || '',
        definition: initialData?.definition || '',
        englishDefinition: initialData?.englishDefinition || '',
        pronunciation: initialData?.pronunciation || '',
        category: initialData?.category || Web3Category.BLOCKCHAIN,
        difficulty: initialData?.difficulty || DifficultyLevel.BEGINNER,
        tags: initialData?.tags || [],
        examples: initialData?.examples || [''],
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTag, setNewTag] = useState('');
    const validateForm = () => {
        const newErrors = {};
        if (!formData.word.trim()) {
            newErrors.word = '请输入单词';
        }
        else if (formData.word.length > 100) {
            newErrors.word = '单词长度不能超过100个字符';
        }
        if (!formData.definition.trim()) {
            newErrors.definition = '请输入中文释义';
        }
        else if (formData.definition.length > 500) {
            newErrors.definition = '释义长度不能超过500个字符';
        }
        if (!formData.pronunciation.trim()) {
            newErrors.pronunciation = '请输入音标';
        }
        const validExamples = formData.examples.filter(example => example.trim());
        if (validExamples.length === 0) {
            newErrors.examples = '请至少添加一个例句';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };
    const handleAddTag = () => {
        const tag = newTag.trim();
        if (tag && !formData.tags.includes(tag)) {
            handleInputChange('tags', [...formData.tags, tag]);
            setNewTag('');
        }
    };
    const handleRemoveTag = (tagToRemove) => {
        handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
    };
    const handleAddExample = () => {
        handleInputChange('examples', [...formData.examples, '']);
    };
    const handleUpdateExample = (index, value) => {
        const newExamples = [...formData.examples];
        newExamples[index] = value;
        handleInputChange('examples', newExamples);
    };
    const handleRemoveExample = (index) => {
        if (formData.examples.length > 1) {
            const newExamples = formData.examples.filter((_, i) => i !== index);
            handleInputChange('examples', newExamples);
        }
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        try {
            const vocabularyData = {
                ...formData,
                examples: formData.examples.filter(example => example.trim()),
                isCustom: true,
                studyCount: 0,
                accuracy: 0,
            };
            const result = await vocabularyService.addVocabulary(vocabularyData);
            if (result.success && result.data) {
                toast({
                    title: '添加成功',
                    description: `词汇 "${formData.word}" 已成功添加到词汇库`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onSuccess?.(result.data);
                handleClose();
            }
            else {
                toast({
                    title: '添加失败',
                    description: result.error || '添加词汇时发生错误',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        catch (error) {
            console.error('Failed to add vocabulary:', error);
            toast({
                title: '添加失败',
                description: '添加词汇时发生未知错误',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleClose = () => {
        setFormData({
            word: '',
            definition: '',
            englishDefinition: '',
            pronunciation: '',
            category: Web3Category.BLOCKCHAIN,
            difficulty: DifficultyLevel.BEGINNER,
            tags: [],
            examples: [''],
        });
        setErrors({});
        setNewTag('');
        onClose();
    };
    const handleKeyPress = (event, action) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            action();
        }
    };
    return (_jsxs(Modal, { isOpen: isOpen, onClose: handleClose, size: "xl", scrollBehavior: "inside", closeOnOverlayClick: false, children: [_jsx(ModalOverlay, { bg: "blackAlpha.600", backdropFilter: "blur(4px)" }), _jsxs(ModalContent, { className: className, style: style, "data-testid": testId, maxH: "90vh", children: [_jsxs(ModalHeader, { children: [_jsx(Text, { fontSize: "xl", fontWeight: "bold", children: "\u6DFB\u52A0\u65B0\u8BCD\u6C47" }), _jsx(Text, { fontSize: "sm", color: "gray.600", mt: 1, children: "\u6DFB\u52A0\u60A8\u60F3\u8981\u5B66\u4E60\u7684Web3.0\u548CDeFi\u8BCD\u6C47" })] }), _jsx(ModalCloseButton, {}), _jsx(ModalBody, { pb: 6, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 4, children: "\u57FA\u672C\u4FE1\u606F" }), _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(FormControl, { isInvalid: !!errors.word, isRequired: true, children: [_jsx(FormLabel, { children: "\u5355\u8BCD" }), _jsx(Input, { value: formData.word, onChange: (e) => handleInputChange('word', e.target.value), placeholder: "\u8BF7\u8F93\u5165\u5355\u8BCD\uFF0C\u5982\uFF1ADeFi", size: "lg" }), _jsx(FormErrorMessage, { children: errors.word })] }), _jsxs(FormControl, { isInvalid: !!errors.definition, isRequired: true, children: [_jsx(FormLabel, { children: "\u4E2D\u6587\u91CA\u4E49" }), _jsx(Textarea, { value: formData.definition, onChange: (e) => handleInputChange('definition', e.target.value), placeholder: "\u8BF7\u8F93\u5165\u4E2D\u6587\u91CA\u4E49", rows: 3, resize: "vertical" }), _jsx(FormErrorMessage, { children: errors.definition })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "\u82F1\u6587\u91CA\u4E49\uFF08\u53EF\u9009\uFF09" }), _jsx(Textarea, { value: formData.englishDefinition, onChange: (e) => handleInputChange('englishDefinition', e.target.value), placeholder: "\u8BF7\u8F93\u5165\u82F1\u6587\u91CA\u4E49", rows: 2, resize: "vertical" })] }), _jsxs(FormControl, { isInvalid: !!errors.pronunciation, isRequired: true, children: [_jsx(FormLabel, { children: "\u97F3\u6807" }), _jsx(Input, { value: formData.pronunciation, onChange: (e) => handleInputChange('pronunciation', e.target.value), placeholder: "\u8BF7\u8F93\u5165\u97F3\u6807\uFF0C\u5982\uFF1A/di\u02D0fa\u026A/", fontFamily: "mono" }), _jsx(FormErrorMessage, { children: errors.pronunciation })] })] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 4, children: "\u5206\u7C7B\u4FE1\u606F" }), _jsxs(HStack, { spacing: 4, align: "start", children: [_jsxs(FormControl, { flex: "1", children: [_jsx(FormLabel, { children: "\u5206\u7C7B" }), _jsx(Select, { value: formData.category, onChange: (e) => handleInputChange('category', e.target.value), children: categoryOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }), _jsxs(FormControl, { flex: "1", children: [_jsx(FormLabel, { children: "\u96BE\u5EA6" }), _jsx(Select, { value: formData.difficulty, onChange: (e) => handleInputChange('difficulty', e.target.value), children: difficultyOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] })] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 4, children: "\u6807\u7B7E" }), _jsxs(VStack, { spacing: 3, align: "stretch", children: [_jsxs(HStack, { children: [_jsx(Input, { value: newTag, onChange: (e) => setNewTag(e.target.value), placeholder: "\u8F93\u5165\u6807\u7B7E", onKeyPress: (e) => handleKeyPress(e, handleAddTag) }), _jsx(Button, { leftIcon: _jsx(PlusIcon, { width: 16, height: 16 }), onClick: handleAddTag, isDisabled: !newTag.trim(), children: "\u6DFB\u52A0" })] }), formData.tags.length > 0 && (_jsx(Wrap, { children: formData.tags.map((tag, index) => (_jsx(WrapItem, { children: _jsxs(Tag, { size: "md", borderRadius: "full", variant: "solid", colorScheme: "primary", children: [_jsx(TagLabel, { children: tag }), _jsx(TagCloseButton, { onClick: () => handleRemoveTag(tag) })] }) }, index))) }))] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "semibold", mb: 4, children: "\u4F8B\u53E5" }), _jsxs(VStack, { spacing: 3, align: "stretch", children: [formData.examples.map((example, index) => (_jsxs(HStack, { align: "start", children: [_jsx(Textarea, { value: example, onChange: (e) => handleUpdateExample(index, e.target.value), placeholder: `请输入例句 ${index + 1}`, rows: 2, resize: "vertical", flex: "1" }), formData.examples.length > 1 && (_jsx(Button, { size: "sm", variant: "ghost", colorScheme: "red", onClick: () => handleRemoveExample(index), mt: 2, children: "\u5220\u9664" }))] }, index))), _jsx(Button, { variant: "outline", leftIcon: _jsx(PlusIcon, { width: 16, height: 16 }), onClick: handleAddExample, size: "sm", alignSelf: "start", children: "\u6DFB\u52A0\u4F8B\u53E5" }), errors.examples && (_jsx(Text, { color: "red.500", fontSize: "sm", children: errors.examples }))] })] }), _jsx(Divider, {}), _jsxs(HStack, { justify: "end", spacing: 3, children: [_jsx(Button, { variant: "ghost", onClick: handleClose, isDisabled: isSubmitting, children: "\u53D6\u6D88" }), _jsx(Button, { colorScheme: "primary", onClick: handleSubmit, isLoading: isSubmitting, loadingText: "\u6DFB\u52A0\u4E2D...", children: "\u6DFB\u52A0\u8BCD\u6C47" })] })] }) })] })] }));
};
export default AddVocabularyForm;

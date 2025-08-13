import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  Button,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Divider,
} from '@chakra-ui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Web3Category, DifficultyLevel, VocabularyItem, BaseComponentProps } from '@/types';
import { vocabularyService } from '@/services/vocabularyService';

/**
 * 表单数据接口
 */
interface VocabularyFormData {
  word: string;
  definition: string;
  englishDefinition: string;
  pronunciation: string;
  category: Web3Category;
  difficulty: DifficultyLevel;
  tags: string[];
  examples: string[];
}

/**
 * 表单验证错误接口
 */
interface FormErrors {
  word?: string;
  definition?: string;
  pronunciation?: string;
  category?: string;
  difficulty?: string;
  examples?: string;
}

/**
 * 添加词汇表单组件Props
 */
interface AddVocabularyFormProps extends BaseComponentProps {
  /** 是否显示模态框 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 添加成功回调 */
  onSuccess?: (vocabulary: VocabularyItem) => void;
  /** 初始数据 */
  initialData?: Partial<VocabularyFormData>;
}

/**
 * 分类选项
 */
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

/**
 * 难度选项
 */
const difficultyOptions = [
  { value: DifficultyLevel.BEGINNER, label: '初级' },
  { value: DifficultyLevel.INTERMEDIATE, label: '中级' },
  { value: DifficultyLevel.ADVANCED, label: '高级' },
];

/**
 * 添加词汇表单组件
 */
export const AddVocabularyForm: React.FC<AddVocabularyFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  className,
  style,
  testId,
}) => {
  const toast = useToast();

  // 表单状态
  const [formData, setFormData] = useState<VocabularyFormData>({
    word: initialData?.word || '',
    definition: initialData?.definition || '',
    englishDefinition: initialData?.englishDefinition || '',
    pronunciation: initialData?.pronunciation || '',
    category: initialData?.category || Web3Category.BLOCKCHAIN,
    difficulty: initialData?.difficulty || DifficultyLevel.BEGINNER,
    tags: initialData?.tags || [],
    examples: initialData?.examples || [''],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

  /**
   * 验证表单
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 单词验证
    if (!formData.word.trim()) {
      newErrors.word = '请输入单词';
    } else if (formData.word.length > 100) {
      newErrors.word = '单词长度不能超过100个字符';
    }

    // 释义验证
    if (!formData.definition.trim()) {
      newErrors.definition = '请输入中文释义';
    } else if (formData.definition.length > 500) {
      newErrors.definition = '释义长度不能超过500个字符';
    }

    // 音标验证
    if (!formData.pronunciation.trim()) {
      newErrors.pronunciation = '请输入音标';
    }

    // 例句验证
    const validExamples = formData.examples.filter(example => example.trim());
    if (validExamples.length === 0) {
      newErrors.examples = '请至少添加一个例句';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 处理输入变化
   */
  const handleInputChange = (field: keyof VocabularyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // 清除对应字段的错误
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /**
   * 添加标签
   */
  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
      setNewTag('');
    }
  };

  /**
   * 删除标签
   */
  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  /**
   * 添加例句
   */
  const handleAddExample = () => {
    handleInputChange('examples', [...formData.examples, '']);
  };

  /**
   * 更新例句
   */
  const handleUpdateExample = (index: number, value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index] = value;
    handleInputChange('examples', newExamples);
  };

  /**
   * 删除例句
   */
  const handleRemoveExample = (index: number) => {
    if (formData.examples.length > 1) {
      const newExamples = formData.examples.filter((_, i) => i !== index);
      handleInputChange('examples', newExamples);
    }
  };

  /**
   * 提交表单
   */
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
      } else {
        toast({
          title: '添加失败',
          description: result.error || '添加词汇时发生错误',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to add vocabulary:', error);
      toast({
        title: '添加失败',
        description: '添加词汇时发生未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 关闭表单
   */
  const handleClose = () => {
    // 重置表单
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

  /**
   * 处理键盘事件
   */
  const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      action();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      scrollBehavior="inside"
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        className={className}
        style={style}
        data-testid={testId}
        maxH="90vh"
      >
        <ModalHeader>
          <Text fontSize="xl" fontWeight="bold">
            添加新词汇
          </Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            添加您想要学习的Web3.0和DeFi词汇
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* 基本信息 */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                基本信息
              </Text>
              
              <VStack spacing={4} align="stretch">
                {/* 单词 */}
                <FormControl isInvalid={!!errors.word} isRequired>
                  <FormLabel>单词</FormLabel>
                  <Input
                    value={formData.word}
                    onChange={(e) => handleInputChange('word', e.target.value)}
                    placeholder="请输入单词，如：DeFi"
                    size="lg"
                  />
                  <FormErrorMessage>{errors.word}</FormErrorMessage>
                </FormControl>

                {/* 中文释义 */}
                <FormControl isInvalid={!!errors.definition} isRequired>
                  <FormLabel>中文释义</FormLabel>
                  <Textarea
                    value={formData.definition}
                    onChange={(e) => handleInputChange('definition', e.target.value)}
                    placeholder="请输入中文释义"
                    rows={3}
                    resize="vertical"
                  />
                  <FormErrorMessage>{errors.definition}</FormErrorMessage>
                </FormControl>

                {/* 英文释义 */}
                <FormControl>
                  <FormLabel>英文释义（可选）</FormLabel>
                  <Textarea
                    value={formData.englishDefinition}
                    onChange={(e) => handleInputChange('englishDefinition', e.target.value)}
                    placeholder="请输入英文释义"
                    rows={2}
                    resize="vertical"
                  />
                </FormControl>

                {/* 音标 */}
                <FormControl isInvalid={!!errors.pronunciation} isRequired>
                  <FormLabel>音标</FormLabel>
                  <Input
                    value={formData.pronunciation}
                    onChange={(e) => handleInputChange('pronunciation', e.target.value)}
                    placeholder="请输入音标，如：/diːfaɪ/"
                    fontFamily="mono"
                  />
                  <FormErrorMessage>{errors.pronunciation}</FormErrorMessage>
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* 分类信息 */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                分类信息
              </Text>
              
              <HStack spacing={4} align="start">
                {/* 分类 */}
                <FormControl flex="1">
                  <FormLabel>分类</FormLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value as Web3Category)}
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* 难度 */}
                <FormControl flex="1">
                  <FormLabel>难度</FormLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value as DifficultyLevel)}
                  >
                    {difficultyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
            </Box>

            <Divider />

            {/* 标签 */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                标签
              </Text>
              
              <VStack spacing={3} align="stretch">
                <HStack>
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="输入标签"
                    onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
                  />
                  <Button
                    leftIcon={<PlusIcon width={16} height={16} />}
                    onClick={handleAddTag}
                    isDisabled={!newTag.trim()}
                  >
                    添加
                  </Button>
                </HStack>

                {formData.tags.length > 0 && (
                  <Wrap>
                    {formData.tags.map((tag, index) => (
                      <WrapItem key={index}>
                        <Tag size="md" borderRadius="full" variant="solid" colorScheme="primary">
                          <TagLabel>{tag}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* 例句 */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                例句
              </Text>
              
              <VStack spacing={3} align="stretch">
                {formData.examples.map((example, index) => (
                  <HStack key={index} align="start">
                    <Textarea
                      value={example}
                      onChange={(e) => handleUpdateExample(index, e.target.value)}
                      placeholder={`请输入例句 ${index + 1}`}
                      rows={2}
                      resize="vertical"
                      flex="1"
                    />
                    {formData.examples.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleRemoveExample(index)}
                        mt={2}
                      >
                        删除
                      </Button>
                    )}
                  </HStack>
                ))}

                <Button
                  variant="outline"
                  leftIcon={<PlusIcon width={16} height={16} />}
                  onClick={handleAddExample}
                  size="sm"
                  alignSelf="start"
                >
                  添加例句
                </Button>

                {errors.examples && (
                  <Text color="red.500" fontSize="sm">
                    {errors.examples}
                  </Text>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* 操作按钮 */}
            <HStack justify="end" spacing={3}>
              <Button
                variant="ghost"
                onClick={handleClose}
                isDisabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                colorScheme="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="添加中..."
              >
                添加词汇
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddVocabularyForm;
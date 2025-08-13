/**
 * 表单验证和错误处理组件
 * 提供统一的表单验证、错误显示和用户友好的错误处理
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Textarea,
  Select,
  Button,
  Icon,
  Collapse,
  useToast,
} from '@chakra-ui/react';
import { FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';

/**
 * 验证规则类型
 */
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean | Promise<boolean>;
}

/**
 * 字段配置接口
 */
export interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  helperText?: string;
  rules?: ValidationRule[];
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  required?: boolean;
}

/**
 * 表单错误接口
 */
export interface FormError {
  field: string;
  message: string;
  type: 'validation' | 'server' | 'network';
}

/**
 * 表单状态接口
 */
interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * 表单验证Hook
 */
export const useFormValidation = (
  initialValues: Record<string, any> = {},
  validationRules: Record<string, ValidationRule[]> = {}
) => {
  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const toast = useToast();

  /**
   * 验证单个字段
   */
  const validateField = useCallback(async (name: string, value: any): Promise<string | null> => {
    const rules = validationRules[name];
    if (!rules) return null;

    for (const rule of rules) {
      let isValid = true;

      switch (rule.type) {
        case 'required':
          isValid = value !== undefined && value !== null && value !== '';
          break;
        
        case 'minLength':
          isValid = typeof value === 'string' && value.length >= rule.value;
          break;
        
        case 'maxLength':
          isValid = typeof value === 'string' && value.length <= rule.value;
          break;
        
        case 'pattern':
          isValid = typeof value === 'string' && rule.value.test(value);
          break;
        
        case 'email':
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = typeof value === 'string' && emailPattern.test(value);
          break;
        
        case 'custom':
          if (rule.validator) {
            isValid = await rule.validator(value);
          }
          break;
      }

      if (!isValid) {
        return rule.message;
      }
    }

    return null;
  }, [validationRules]);

  /**
   * 验证所有字段
   */
  const validateForm = useCallback(async (): Promise<Record<string, string>> => {
    const errors: Record<string, string> = {};
    
    for (const [name, value] of Object.entries(formState.values)) {
      const error = await validateField(name, value);
      if (error) {
        errors[name] = error;
      }
    }

    return errors;
  }, [formState.values, validateField]);

  /**
   * 设置字段值
   */
  const setValue = useCallback((name: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value },
    }));
  }, []);

  /**
   * 设置字段错误
   */
  const setError = useCallback((name: string, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  /**
   * 清除字段错误
   */
  const clearError = useCallback((name: string) => {
    setFormState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[name];
      return { ...prev, errors: newErrors };
    });
  }, []);

  /**
   * 设置字段为已触摸
   */
  const setTouched = useCallback((name: string, touched: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, []);

  /**
   * 处理字段变化
   */
  const handleChange = useCallback(async (name: string, value: any) => {
    setValue(name, value);
    
    // 如果字段已被触摸，立即验证
    if (formState.touched[name]) {
      const error = await validateField(name, value);
      if (error) {
        setError(name, error);
      } else {
        clearError(name);
      }
    }
  }, [formState.touched, setValue, validateField, setError, clearError]);

  /**
   * 处理字段失焦
   */
  const handleBlur = useCallback(async (name: string) => {
    setTouched(name, true);
    const error = await validateField(name, formState.values[name]);
    if (error) {
      setError(name, error);
    } else {
      clearError(name);
    }
  }, [formState.values, setTouched, validateField, setError, clearError]);

  /**
   * 提交表单
   */
  const handleSubmit = useCallback(async (onSubmit: (values: Record<string, any>) => Promise<void>) => {
    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // 验证所有字段
      const errors = await validateForm();
      
      if (Object.keys(errors).length > 0) {
        setFormState(prev => ({
          ...prev,
          errors,
          isSubmitting: false,
          isValid: false,
        }));
        
        toast({
          title: '表单验证失败',
          description: '请检查并修正表单中的错误',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // 提交表单
      await onSubmit(formState.values);
      
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isValid: true,
      }));

      toast({
        title: '提交成功',
        description: '表单已成功提交',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      
      toast({
        title: '提交失败',
        description: error instanceof Error ? error.message : '提交过程中发生错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [formState.values, validateForm, toast]);

  /**
   * 重置表单
   */
  const reset = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  // 计算表单是否有效
  useEffect(() => {
    const isValid = Object.keys(formState.errors).length === 0;
    setFormState(prev => ({ ...prev, isValid }));
  }, [formState.errors]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    setValue,
    setError,
    clearError,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateField,
    validateForm,
  };
};

/**
 * 表单字段组件
 */
export const FormField: React.FC<{
  config: FieldConfig;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
}> = ({ config, value, error, touched, onChange, onBlur }) => {
  const hasError = touched && error;

  const renderInput = () => {
    const commonProps = {
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        onChange(e.target.value),
      onBlur,
      placeholder: config.placeholder,
      disabled: config.disabled,
      isInvalid: hasError,
    };

    switch (config.type) {
      case 'textarea':
        return <Textarea {...commonProps} />;
      
      case 'select':
        return (
          <Select {...commonProps}>
            <option value="">请选择...</option>
            {config.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            onChange={(e) => onChange(Number(e.target.value))}
          />
        );
      
      default:
        return <Input {...commonProps} type={config.type || 'text'} />;
    }
  };

  return (
    <FormControl isInvalid={hasError} isRequired={config.required}>
      <FormLabel>{config.label}</FormLabel>
      {renderInput()}
      {hasError ? (
        <FormErrorMessage>
          <Icon as={FiAlertCircle} mr={1} />
          {error}
        </FormErrorMessage>
      ) : config.helperText ? (
        <FormHelperText>{config.helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

/**
 * 错误摘要组件
 */
export const ErrorSummary: React.FC<{
  errors: FormError[];
  isVisible?: boolean;
  onDismiss?: () => void;
}> = ({ errors, isVisible = true, onDismiss }) => {
  if (!isVisible || errors.length === 0) return null;

  return (
    <Collapse in={isVisible} animateOpacity>
      <Alert status="error" borderRadius="md" mb={4}>
        <AlertIcon />
        <Box flex="1">
          <AlertTitle fontSize="sm">表单包含错误</AlertTitle>
          <AlertDescription fontSize="sm">
            <VStack align="start" spacing={1} mt={2}>
              {errors.map((error, index) => (
                <Text key={index}>• {error.message}</Text>
              ))}
            </VStack>
          </AlertDescription>
        </Box>
        {onDismiss && (
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <Icon as={FiX} />
          </Button>
        )}
      </Alert>
    </Collapse>
  );
};

/**
 * 表单成功提示组件
 */
export const SuccessMessage: React.FC<{
  message: string;
  isVisible?: boolean;
  onDismiss?: () => void;
}> = ({ message, isVisible = true, onDismiss }) => {
  if (!isVisible) return null;

  return (
    <Collapse in={isVisible} animateOpacity>
      <Alert status="success" borderRadius="md" mb={4}>
        <AlertIcon />
        <Box flex="1">
          <AlertTitle fontSize="sm">操作成功</AlertTitle>
          <AlertDescription fontSize="sm">{message}</AlertDescription>
        </Box>
        {onDismiss && (
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <Icon as={FiX} />
          </Button>
        )}
      </Alert>
    </Collapse>
  );
};

/**
 * 验证状态指示器
 */
export const ValidationIndicator: React.FC<{
  isValid: boolean;
  isValidating?: boolean;
  validMessage?: string;
  invalidMessage?: string;
}> = ({ 
  isValid, 
  isValidating = false, 
  validMessage = '验证通过', 
  invalidMessage = '验证失败' 
}) => {
  if (isValidating) {
    return (
      <HStack spacing={2} color="blue.500">
        <Icon as={FiCheck} />
        <Text fontSize="sm">验证中...</Text>
      </HStack>
    );
  }

  return (
    <HStack spacing={2} color={isValid ? 'green.500' : 'red.500'}>
      <Icon as={isValid ? FiCheck : FiX} />
      <Text fontSize="sm">{isValid ? validMessage : invalidMessage}</Text>
    </HStack>
  );
};

/**
 * 常用验证规则
 */
export const ValidationRules = {
  required: (message = '此字段为必填项'): ValidationRule => ({
    type: 'required',
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value: length,
    message: message || `最少需要 ${length} 个字符`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value: length,
    message: message || `最多允许 ${length} 个字符`,
  }),

  email: (message = '请输入有效的邮箱地址'): ValidationRule => ({
    type: 'email',
    message,
  }),

  pattern: (pattern: RegExp, message: string): ValidationRule => ({
    type: 'pattern',
    value: pattern,
    message,
  }),

  custom: (validator: (value: any) => boolean | Promise<boolean>, message: string): ValidationRule => ({
    type: 'custom',
    validator,
    message,
  }),
};
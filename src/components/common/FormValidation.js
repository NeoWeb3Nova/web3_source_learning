import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import { Box, VStack, HStack, Text, Alert, AlertIcon, AlertTitle, AlertDescription, FormControl, FormLabel, FormErrorMessage, FormHelperText, Input, Textarea, Select, Button, Icon, Collapse, useToast, } from '@chakra-ui/react';
import { FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
    const [formState, setFormState] = useState({
        values: initialValues,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: true,
    });
    const toast = useToast();
    const validateField = useCallback(async (name, value) => {
        const rules = validationRules[name];
        if (!rules)
            return null;
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
    const validateForm = useCallback(async () => {
        const errors = {};
        for (const [name, value] of Object.entries(formState.values)) {
            const error = await validateField(name, value);
            if (error) {
                errors[name] = error;
            }
        }
        return errors;
    }, [formState.values, validateField]);
    const setValue = useCallback((name, value) => {
        setFormState(prev => ({
            ...prev,
            values: { ...prev.values, [name]: value },
        }));
    }, []);
    const setError = useCallback((name, error) => {
        setFormState(prev => ({
            ...prev,
            errors: { ...prev.errors, [name]: error },
        }));
    }, []);
    const clearError = useCallback((name) => {
        setFormState(prev => {
            const newErrors = { ...prev.errors };
            delete newErrors[name];
            return { ...prev, errors: newErrors };
        });
    }, []);
    const setTouched = useCallback((name, touched = true) => {
        setFormState(prev => ({
            ...prev,
            touched: { ...prev.touched, [name]: touched },
        }));
    }, []);
    const handleChange = useCallback(async (name, value) => {
        setValue(name, value);
        if (formState.touched[name]) {
            const error = await validateField(name, value);
            if (error) {
                setError(name, error);
            }
            else {
                clearError(name);
            }
        }
    }, [formState.touched, setValue, validateField, setError, clearError]);
    const handleBlur = useCallback(async (name) => {
        setTouched(name, true);
        const error = await validateField(name, formState.values[name]);
        if (error) {
            setError(name, error);
        }
        else {
            clearError(name);
        }
    }, [formState.values, setTouched, validateField, setError, clearError]);
    const handleSubmit = useCallback(async (onSubmit) => {
        setFormState(prev => ({ ...prev, isSubmitting: true }));
        try {
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
        }
        catch (error) {
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
    const reset = useCallback(() => {
        setFormState({
            values: initialValues,
            errors: {},
            touched: {},
            isSubmitting: false,
            isValid: true,
        });
    }, [initialValues]);
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
export const FormField = ({ config, value, error, touched, onChange, onBlur }) => {
    const hasError = touched && error;
    const renderInput = () => {
        const commonProps = {
            value: value || '',
            onChange: (e) => onChange(e.target.value),
            onBlur,
            placeholder: config.placeholder,
            disabled: config.disabled,
            isInvalid: hasError,
        };
        switch (config.type) {
            case 'textarea':
                return _jsx(Textarea, { ...commonProps });
            case 'select':
                return (_jsxs(Select, { ...commonProps, children: [_jsx("option", { value: "", children: "\u8BF7\u9009\u62E9..." }), config.options?.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }));
            case 'number':
                return (_jsx(Input, { ...commonProps, type: "number", onChange: (e) => onChange(Number(e.target.value)) }));
            default:
                return _jsx(Input, { ...commonProps, type: config.type || 'text' });
        }
    };
    return (_jsxs(FormControl, { isInvalid: hasError, isRequired: config.required, children: [_jsx(FormLabel, { children: config.label }), renderInput(), hasError ? (_jsxs(FormErrorMessage, { children: [_jsx(Icon, { as: FiAlertCircle, mr: 1 }), error] })) : config.helperText ? (_jsx(FormHelperText, { children: config.helperText })) : null] }));
};
export const ErrorSummary = ({ errors, isVisible = true, onDismiss }) => {
    if (!isVisible || errors.length === 0)
        return null;
    return (_jsx(Collapse, { in: isVisible, animateOpacity: true, children: _jsxs(Alert, { status: "error", borderRadius: "md", mb: 4, children: [_jsx(AlertIcon, {}), _jsxs(Box, { flex: "1", children: [_jsx(AlertTitle, { fontSize: "sm", children: "\u8868\u5355\u5305\u542B\u9519\u8BEF" }), _jsx(AlertDescription, { fontSize: "sm", children: _jsx(VStack, { align: "start", spacing: 1, mt: 2, children: errors.map((error, index) => (_jsxs(Text, { children: ["\u2022 ", error.message] }, index))) }) })] }), onDismiss && (_jsx(Button, { size: "sm", variant: "ghost", onClick: onDismiss, children: _jsx(Icon, { as: FiX }) }))] }) }));
};
export const SuccessMessage = ({ message, isVisible = true, onDismiss }) => {
    if (!isVisible)
        return null;
    return (_jsx(Collapse, { in: isVisible, animateOpacity: true, children: _jsxs(Alert, { status: "success", borderRadius: "md", mb: 4, children: [_jsx(AlertIcon, {}), _jsxs(Box, { flex: "1", children: [_jsx(AlertTitle, { fontSize: "sm", children: "\u64CD\u4F5C\u6210\u529F" }), _jsx(AlertDescription, { fontSize: "sm", children: message })] }), onDismiss && (_jsx(Button, { size: "sm", variant: "ghost", onClick: onDismiss, children: _jsx(Icon, { as: FiX }) }))] }) }));
};
export const ValidationIndicator = ({ isValid, isValidating = false, validMessage = '验证通过', invalidMessage = '验证失败' }) => {
    if (isValidating) {
        return (_jsxs(HStack, { spacing: 2, color: "blue.500", children: [_jsx(Icon, { as: FiCheck }), _jsx(Text, { fontSize: "sm", children: "\u9A8C\u8BC1\u4E2D..." })] }));
    }
    return (_jsxs(HStack, { spacing: 2, color: isValid ? 'green.500' : 'red.500', children: [_jsx(Icon, { as: isValid ? FiCheck : FiX }), _jsx(Text, { fontSize: "sm", children: isValid ? validMessage : invalidMessage })] }));
};
export const ValidationRules = {
    required: (message = '此字段为必填项') => ({
        type: 'required',
        message,
    }),
    minLength: (length, message) => ({
        type: 'minLength',
        value: length,
        message: message || `最少需要 ${length} 个字符`,
    }),
    maxLength: (length, message) => ({
        type: 'maxLength',
        value: length,
        message: message || `最多允许 ${length} 个字符`,
    }),
    email: (message = '请输入有效的邮箱地址') => ({
        type: 'email',
        message,
    }),
    pattern: (pattern, message) => ({
        type: 'pattern',
        value: pattern,
        message,
    }),
    custom: (validator, message) => ({
        type: 'custom',
        validator,
        message,
    }),
};

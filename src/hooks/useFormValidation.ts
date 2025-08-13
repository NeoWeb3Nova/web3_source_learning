import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ValidationRule,
  FieldValidationResult,
  ValidationResult,
  validateForm,
  isFormValid,
  getFieldErrors,
  validateAndSanitizeForm,
} from '../utils/validation';

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  sanitizeFields?: string[];
  debounceMs?: number;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: Record<string, string>;
  validationResults: FieldValidationResult;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  touchedFields: Set<string>;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  validateField: (field: keyof T) => ValidationResult;
  validateForm: () => boolean;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
}

const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRule[]>,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn<T> => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    sanitizeFields = [],
    debounceMs = 300,
  } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [validationResults, setValidationResults] = useState<FieldValidationResult>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [debounceTimeouts, setDebounceTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  // Memoized computed values
  const errors = useMemo(() => getFieldErrors(validationResults), [validationResults]);
  const isValid = useMemo(() => isFormValid(validationResults), [validationResults]);
  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => values[key] !== initialValues[key]);
  }, [values, initialValues]);

  // Validate a single field
  const validateField = useCallback((field: keyof T): ValidationResult => {
    const fieldRules = validationRules[field] || [];
    const fieldValue = values[field];
    
    const result = validateForm({ [field]: fieldValue }, { [field]: fieldRules });
    return result[field as string] || { isValid: true, errors: [] };
  }, [values, validationRules]);

  // Validate entire form
  const validateFormCallback = useCallback((): boolean => {
    const results = validateForm(values, validationRules as Record<string, ValidationRule[]>);
    setValidationResults(results);
    return isFormValid(results);
  }, [values, validationRules]);

  // Debounced validation
  const debouncedValidate = useCallback((field: keyof T) => {
    const fieldKey = String(field);
    
    // Clear existing timeout
    if (debounceTimeouts[fieldKey]) {
      clearTimeout(debounceTimeouts[fieldKey]);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      const result = validateField(field);
      setValidationResults(prev => ({
        ...prev,
        [fieldKey]: result,
      }));
    }, debounceMs);

    setDebounceTimeouts(prev => ({
      ...prev,
      [fieldKey]: timeout,
    }));
  }, [validateField, debounceMs, debounceTimeouts]);

  // Set single field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({
      ...prev,
      [field]: value,
    }));

    if (validateOnChange) {
      debouncedValidate(field);
    }
  }, [validateOnChange, debouncedValidate]);

  // Set multiple field values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues,
    }));

    if (validateOnChange) {
      Object.keys(newValues).forEach(field => {
        debouncedValidate(field as keyof T);
      });
    }
  }, [validateOnChange, debouncedValidate]);

  // Set field error manually
  const setError = useCallback((field: keyof T, error: string) => {
    setValidationResults(prev => ({
      ...prev,
      [String(field)]: {
        isValid: false,
        errors: [error],
      },
    }));
  }, []);

  // Clear field error
  const clearError = useCallback((field: keyof T) => {
    setValidationResults(prev => {
      const newResults = { ...prev };
      delete newResults[String(field)];
      return newResults;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setValidationResults({});
  }, []);

  // Handle field change
  const handleChange = useCallback((field: keyof T) => (value: any) => {
    setValue(field, value);
  }, [setValue]);

  // Handle field blur
  const handleBlur = useCallback((field: keyof T) => () => {
    setTouchedFields(prev => new Set(prev).add(String(field)));

    if (validateOnBlur) {
      const result = validateField(field);
      setValidationResults(prev => ({
        ...prev,
        [String(field)]: result,
      }));
    }
  }, [validateOnBlur, validateField]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (values: T) => void | Promise<void>) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);

      try {
        // Validate and sanitize form
        const { isValid: formIsValid, sanitizedData } = validateAndSanitizeForm(
          values,
          validationRules as Record<string, ValidationRule[]>,
          sanitizeFields
        );

        // Update validation results
        const results = validateForm(values, validationRules as Record<string, ValidationRule[]>);
        setValidationResults(results);

        if (formIsValid) {
          await onSubmit(sanitizedData as T);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validationRules, sanitizeFields]);

  // Reset form
  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues ? { ...initialValues, ...newValues } : initialValues;
    setValuesState(resetValues);
    setValidationResults({});
    setTouchedFields(new Set());
    setIsSubmitting(false);
    
    // Clear all debounce timeouts
    Object.values(debounceTimeouts).forEach(timeout => clearTimeout(timeout));
    setDebounceTimeouts({});
  }, [initialValues, debounceTimeouts]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [debounceTimeouts]);

  return {
    values,
    errors,
    validationResults,
    isValid,
    isSubmitting,
    isDirty,
    touchedFields,
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    validateField,
    validateForm: validateFormCallback,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
};

export default useFormValidation;
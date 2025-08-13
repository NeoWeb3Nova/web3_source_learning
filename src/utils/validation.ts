// Form validation utilities and error handling

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  [fieldName: string]: ValidationResult;
}

// Predefined validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z]+$/,
  numeric: /^\d+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Common validation rules
export const CommonRules = {
  required: (message = '此字段为必填项'): ValidationRule => ({
    required: true,
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `最少需要 ${min} 个字符`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `最多允许 ${max} 个字符`,
  }),

  email: (message = '请输入有效的邮箱地址'): ValidationRule => ({
    pattern: ValidationPatterns.email,
    message,
  }),

  url: (message = '请输入有效的URL地址'): ValidationRule => ({
    pattern: ValidationPatterns.url,
    message,
  }),

  phone: (message = '请输入有效的手机号码'): ValidationRule => ({
    pattern: ValidationPatterns.phone,
    message,
  }),

  noSpecialChars: (message = '不允许包含特殊字符'): ValidationRule => ({
    pattern: ValidationPatterns.noSpecialChars,
    message,
  }),

  strongPassword: (message = '密码必须包含大小写字母、数字和特殊字符，至少8位'): ValidationRule => ({
    pattern: ValidationPatterns.strongPassword,
    message,
  }),

  custom: (validator: (value: any) => boolean | string, message = '输入无效'): ValidationRule => ({
    custom: validator,
    message,
  }),
};

// Validate a single field
export const validateField = (value: any, rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = [];

  for (const rule of rules) {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(rule.message || '此字段为必填项');
      continue;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      continue;
    }

    const stringValue = String(value);

    // Min length validation
    if (rule.minLength && stringValue.length < rule.minLength) {
      errors.push(rule.message || `最少需要 ${rule.minLength} 个字符`);
    }

    // Max length validation
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      errors.push(rule.message || `最多允许 ${rule.maxLength} 个字符`);
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      errors.push(rule.message || '格式不正确');
    }

    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        errors.push(typeof result === 'string' ? result : (rule.message || '输入无效'));
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate multiple fields
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): FieldValidationResult => {
  const results: FieldValidationResult = {};

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    results[fieldName] = validateField(data[fieldName], fieldRules);
  }

  return results;
};

// Check if form is valid
export const isFormValid = (validationResults: FieldValidationResult): boolean => {
  return Object.values(validationResults).every(result => result.isValid);
};

// Get all form errors
export const getFormErrors = (validationResults: FieldValidationResult): string[] => {
  const allErrors: string[] = [];
  
  for (const result of Object.values(validationResults)) {
    allErrors.push(...result.errors);
  }
  
  return allErrors;
};

// Get first error for each field
export const getFieldErrors = (validationResults: FieldValidationResult): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  for (const [fieldName, result] of Object.entries(validationResults)) {
    if (!result.isValid && result.errors.length > 0) {
      fieldErrors[fieldName] = result.errors[0];
    }
  }
  
  return fieldErrors;
};

// Vocabulary-specific validation rules
export const VocabularyValidationRules = {
  word: [
    CommonRules.required('单词不能为空'),
    CommonRules.minLength(1, '单词至少需要1个字符'),
    CommonRules.maxLength(50, '单词不能超过50个字符'),
    CommonRules.noSpecialChars('单词不能包含特殊字符'),
  ],

  definition: [
    CommonRules.required('定义不能为空'),
    CommonRules.minLength(5, '定义至少需要5个字符'),
    CommonRules.maxLength(500, '定义不能超过500个字符'),
  ],

  example: [
    CommonRules.maxLength(200, '例句不能超过200个字符'),
  ],

  category: [
    CommonRules.required('分类不能为空'),
  ],

  difficulty: [
    CommonRules.required('难度等级不能为空'),
    CommonRules.custom(
      (value) => ['beginner', 'intermediate', 'advanced'].includes(value),
      '请选择有效的难度等级'
    ),
  ],
};

// User input validation rules
export const UserInputValidationRules = {
  username: [
    CommonRules.required('用户名不能为空'),
    CommonRules.minLength(3, '用户名至少需要3个字符'),
    CommonRules.maxLength(20, '用户名不能超过20个字符'),
    CommonRules.custom(
      (value) => /^[a-zA-Z0-9_]+$/.test(value),
      '用户名只能包含字母、数字和下划线'
    ),
  ],

  email: [
    CommonRules.required('邮箱不能为空'),
    CommonRules.email(),
  ],

  password: [
    CommonRules.required('密码不能为空'),
    CommonRules.minLength(6, '密码至少需要6个字符'),
    CommonRules.maxLength(50, '密码不能超过50个字符'),
  ],

  confirmPassword: (password: string) => [
    CommonRules.required('请确认密码'),
    CommonRules.custom(
      (value) => value === password,
      '两次输入的密码不一致'
    ),
  ],
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate and sanitize form data
export const validateAndSanitizeForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule[]>,
  sanitizeFields: string[] = []
): {
  isValid: boolean;
  validationResults: FieldValidationResult;
  sanitizedData: Record<string, any>;
  errors: string[];
} => {
  // Validate form
  const validationResults = validateForm(data, rules);
  const isValid = isFormValid(validationResults);
  const errors = getFormErrors(validationResults);

  // Sanitize specified fields
  const sanitizedData = { ...data };
  for (const field of sanitizeFields) {
    if (sanitizedData[field] && typeof sanitizedData[field] === 'string') {
      sanitizedData[field] = sanitizeInput(sanitizedData[field]);
    }
  }

  return {
    isValid,
    validationResults,
    sanitizedData,
    errors,
  };
};
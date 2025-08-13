import { useEffect, useRef, useCallback, useState } from 'react';
import {
  focusManager,
  keyboardHandler,
  screenReaderAnnouncer,
  generateAriaId,
  KEYBOARD_KEYS,
  FocusManager,
  KeyboardNavigationHandler,
} from '../utils/accessibility';

/**
 * 焦点管理Hook
 */
export const useFocusManagement = () => {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const trapFocus = useCallback(() => {
    if (!containerRef.current) return () => {};
    
    previousFocusRef.current = document.activeElement as HTMLElement;
    return focusManager.trapFocus(containerRef.current);
  }, []);

  const restoreFocus = useCallback(() => {
    focusManager.restoreFocus(previousFocusRef.current);
  }, []);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return focusManager.getFocusableElements(containerRef.current);
  }, []);

  return {
    containerRef,
    trapFocus,
    restoreFocus,
    getFocusableElements,
  };
};

/**
 * 键盘导航Hook
 */
export const useKeyboardNavigation = (
  handlers: Record<string, (event: KeyboardEvent) => void>,
  enabled: boolean = true
) => {
  const elementRef = useRef<HTMLElement>(null);
  const keyboardHandlerRef = useRef<KeyboardNavigationHandler | null>(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    keyboardHandlerRef.current = new KeyboardNavigationHandler();
    
    // 注册所有处理器
    Object.entries(handlers).forEach(([key, handler]) => {
      keyboardHandlerRef.current?.register(key, handler);
    });

    const cleanup = keyboardHandlerRef.current.bindTo(elementRef.current);

    return () => {
      cleanup();
      keyboardHandlerRef.current = null;
    };
  }, [handlers, enabled]);

  return { elementRef };
};

/**
 * 屏幕阅读器公告Hook
 */
export const useScreenReaderAnnouncer = () => {
  const announce = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    screenReaderAnnouncer.announce(message, priority);
  }, []);

  return { announce };
};

/**
 * ARIA属性管理Hook
 */
export const useAriaAttributes = (initialAttributes: Record<string, string> = {}) => {
  const [attributes, setAttributes] = useState(initialAttributes);
  const elementRef = useRef<HTMLElement>(null);

  const updateAttribute = useCallback((name: string, value: string) => {
    setAttributes(prev => ({ ...prev, [name]: value }));
    if (elementRef.current) {
      elementRef.current.setAttribute(name, value);
    }
  }, []);

  const removeAttribute = useCallback((name: string) => {
    setAttributes(prev => {
      const newAttributes = { ...prev };
      delete newAttributes[name];
      return newAttributes;
    });
    if (elementRef.current) {
      elementRef.current.removeAttribute(name);
    }
  }, []);

  const generateId = useCallback((prefix: string = 'aria') => {
    return generateAriaId(prefix);
  }, []);

  useEffect(() => {
    if (elementRef.current) {
      Object.entries(attributes).forEach(([name, value]) => {
        elementRef.current?.setAttribute(name, value);
      });
    }
  }, [attributes]);

  return {
    elementRef,
    attributes,
    updateAttribute,
    removeAttribute,
    generateId,
  };
};

/**
 * 可访问的模态框Hook
 */
export const useAccessibleModal = (isOpen: boolean) => {
  const { containerRef, trapFocus, restoreFocus } = useFocusManagement();
  const { announce } = useScreenReaderAnnouncer();
  const [modalId] = useState(() => generateAriaId('modal'));

  useEffect(() => {
    if (isOpen) {
      // 公告模态框打开
      announce('模态框已打开');
      
      // 设置焦点陷阱
      const cleanup = trapFocus();
      
      // 隐藏背景内容
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('aria-hidden', 'true');
      
      return () => {
        cleanup();
        document.body.style.overflow = '';
        document.body.removeAttribute('aria-hidden');
        restoreFocus();
        announce('模态框已关闭');
      };
    }
  }, [isOpen, trapFocus, restoreFocus, announce]);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === KEYBOARD_KEYS.ESCAPE) {
      // 这里应该调用关闭模态框的函数
      event.preventDefault();
    }
  }, []);

  const { elementRef: modalRef } = useKeyboardNavigation(
    { [KEYBOARD_KEYS.ESCAPE]: handleEscape },
    isOpen
  );

  return {
    modalRef: containerRef,
    modalId,
    modalProps: {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': `${modalId}-title`,
      'aria-describedby': `${modalId}-description`,
    },
  };
};

/**
 * 可访问的下拉菜单Hook
 */
export const useAccessibleDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { containerRef, getFocusableElements } = useFocusManagement();
  const { announce } = useScreenReaderAnnouncer();
  const [menuId] = useState(() => generateAriaId('menu'));
  const [buttonId] = useState(() => generateAriaId('button'));

  const open = useCallback(() => {
    setIsOpen(true);
    setActiveIndex(0);
    announce('菜单已打开');
  }, [announce]);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    announce('菜单已关闭');
  }, [announce]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.SPACE) {
        event.preventDefault();
        open();
      }
      return;
    }

    const focusableElements = getFocusableElements();
    
    switch (event.key) {
      case KEYBOARD_KEYS.ESCAPE:
        event.preventDefault();
        close();
        break;
      case KEYBOARD_KEYS.ARROW_DOWN:
        event.preventDefault();
        setActiveIndex(prev => 
          prev < focusableElements.length - 1 ? prev + 1 : 0
        );
        break;
      case KEYBOARD_KEYS.ARROW_UP:
        event.preventDefault();
        setActiveIndex(prev => 
          prev > 0 ? prev - 1 : focusableElements.length - 1
        );
        break;
      case KEYBOARD_KEYS.HOME:
        event.preventDefault();
        setActiveIndex(0);
        break;
      case KEYBOARD_KEYS.END:
        event.preventDefault();
        setActiveIndex(focusableElements.length - 1);
        break;
      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        event.preventDefault();
        focusableElements[activeIndex]?.click();
        close();
        break;
    }
  }, [isOpen, activeIndex, getFocusableElements, open, close]);

  const { elementRef } = useKeyboardNavigation({
    [KEYBOARD_KEYS.ENTER]: handleKeyDown,
    [KEYBOARD_KEYS.SPACE]: handleKeyDown,
    [KEYBOARD_KEYS.ESCAPE]: handleKeyDown,
    [KEYBOARD_KEYS.ARROW_DOWN]: handleKeyDown,
    [KEYBOARD_KEYS.ARROW_UP]: handleKeyDown,
    [KEYBOARD_KEYS.HOME]: handleKeyDown,
    [KEYBOARD_KEYS.END]: handleKeyDown,
  });

  // 更新活跃项的焦点
  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      const focusableElements = getFocusableElements();
      focusableElements[activeIndex]?.focus();
    }
  }, [activeIndex, isOpen, getFocusableElements]);

  return {
    isOpen,
    activeIndex,
    containerRef,
    elementRef,
    open,
    close,
    buttonProps: {
      id: buttonId,
      'aria-haspopup': 'true',
      'aria-expanded': isOpen,
      'aria-controls': menuId,
    },
    menuProps: {
      id: menuId,
      role: 'menu',
      'aria-labelledby': buttonId,
    },
  };
};

/**
 * 可访问的标签页Hook
 */
export const useAccessibleTabs = (tabs: string[], defaultIndex: number = 0) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const { announce } = useScreenReaderAnnouncer();
  const [tablistId] = useState(() => generateAriaId('tablist'));

  const selectTab = useCallback((index: number) => {
    if (index >= 0 && index < tabs.length) {
      setActiveIndex(index);
      announce(`已选择标签页: ${tabs[index]}`);
    }
  }, [tabs, announce]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_LEFT:
        event.preventDefault();
        selectTab(activeIndex > 0 ? activeIndex - 1 : tabs.length - 1);
        break;
      case KEYBOARD_KEYS.ARROW_RIGHT:
        event.preventDefault();
        selectTab(activeIndex < tabs.length - 1 ? activeIndex + 1 : 0);
        break;
      case KEYBOARD_KEYS.HOME:
        event.preventDefault();
        selectTab(0);
        break;
      case KEYBOARD_KEYS.END:
        event.preventDefault();
        selectTab(tabs.length - 1);
        break;
    }
  }, [activeIndex, tabs.length, selectTab]);

  const { elementRef: tablistRef } = useKeyboardNavigation({
    [KEYBOARD_KEYS.ARROW_LEFT]: handleKeyDown,
    [KEYBOARD_KEYS.ARROW_RIGHT]: handleKeyDown,
    [KEYBOARD_KEYS.HOME]: handleKeyDown,
    [KEYBOARD_KEYS.END]: handleKeyDown,
  });

  const getTabProps = useCallback((index: number) => ({
    id: `${tablistId}-tab-${index}`,
    role: 'tab',
    'aria-selected': index === activeIndex,
    'aria-controls': `${tablistId}-panel-${index}`,
    tabIndex: index === activeIndex ? 0 : -1,
    onClick: () => selectTab(index),
  }), [activeIndex, tablistId, selectTab]);

  const getPanelProps = useCallback((index: number) => ({
    id: `${tablistId}-panel-${index}`,
    role: 'tabpanel',
    'aria-labelledby': `${tablistId}-tab-${index}`,
    hidden: index !== activeIndex,
  }), [activeIndex, tablistId]);

  return {
    activeIndex,
    selectTab,
    tablistRef,
    tablistProps: {
      id: tablistId,
      role: 'tablist',
    },
    getTabProps,
    getPanelProps,
  };
};

/**
 * 可访问的进度条Hook
 */
export const useAccessibleProgressBar = (
  value: number,
  max: number = 100,
  min: number = 0
) => {
  const { announce } = useScreenReaderAnnouncer();
  const [progressId] = useState(() => generateAriaId('progress'));
  const previousValueRef = useRef(value);

  // 当进度发生重大变化时公告
  useEffect(() => {
    const previousValue = previousValueRef.current;
    const currentValue = value;
    const threshold = (max - min) * 0.1; // 10%的变化阈值

    if (Math.abs(currentValue - previousValue) >= threshold) {
      const percentage = Math.round(((currentValue - min) / (max - min)) * 100);
      announce(`进度更新: ${percentage}%`);
      previousValueRef.current = currentValue;
    }
  }, [value, max, min, announce]);

  const progressProps = {
    id: progressId,
    role: 'progressbar',
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': value,
    'aria-valuetext': `${Math.round(((value - min) / (max - min)) * 100)}%`,
  };

  return {
    progressId,
    progressProps,
  };
};

/**
 * 可访问的表单Hook
 */
export const useAccessibleForm = () => {
  const { announce } = useScreenReaderAnnouncer();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const announceError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    announce(`${fieldName}字段错误: ${error}`, 'assertive');
  }, [announce]);

  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const getFieldProps = useCallback((
    fieldName: string,
    label: string,
    required: boolean = false
  ) => {
    const fieldId = generateAriaId(`field-${fieldName}`);
    const errorId = generateAriaId(`error-${fieldName}`);
    const hasError = !!errors[fieldName];

    return {
      fieldId,
      errorId,
      fieldProps: {
        id: fieldId,
        'aria-label': label,
        'aria-required': required,
        'aria-invalid': hasError,
        'aria-describedby': hasError ? errorId : undefined,
      },
      errorProps: {
        id: errorId,
        role: 'alert',
        'aria-live': 'assertive',
      },
      hasError,
      error: errors[fieldName],
    };
  }, [errors]);

  return {
    errors,
    announceError,
    clearError,
    getFieldProps,
  };
};

export default {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReaderAnnouncer,
  useAriaAttributes,
  useAccessibleModal,
  useAccessibleDropdown,
  useAccessibleTabs,
  useAccessibleProgressBar,
  useAccessibleForm,
};
// 无障碍访问工具库

/**
 * ARIA角色定义
 */
export const ARIA_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
  REGION: 'region',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  COMPLEMENTARY: 'complementary',
  SEARCH: 'search',
  APPLICATION: 'application',
  DOCUMENT: 'document',
  ARTICLE: 'article',
  SECTION: 'section',
  HEADING: 'heading',
  LIST: 'list',
  LISTITEM: 'listitem',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  PROGRESSBAR: 'progressbar',
  SLIDER: 'slider',
  SPINBUTTON: 'spinbutton',
  TEXTBOX: 'textbox',
  COMBOBOX: 'combobox',
  OPTION: 'option',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SWITCH: 'switch',
  TREE: 'tree',
  TREEITEM: 'treeitem',
} as const;

/**
 * ARIA属性定义
 */
export const ARIA_ATTRIBUTES = {
  LABEL: 'aria-label',
  LABELLEDBY: 'aria-labelledby',
  DESCRIBEDBY: 'aria-describedby',
  EXPANDED: 'aria-expanded',
  HIDDEN: 'aria-hidden',
  DISABLED: 'aria-disabled',
  SELECTED: 'aria-selected',
  CHECKED: 'aria-checked',
  PRESSED: 'aria-pressed',
  CURRENT: 'aria-current',
  LIVE: 'aria-live',
  ATOMIC: 'aria-atomic',
  RELEVANT: 'aria-relevant',
  BUSY: 'aria-busy',
  INVALID: 'aria-invalid',
  REQUIRED: 'aria-required',
  READONLY: 'aria-readonly',
  MULTILINE: 'aria-multiline',
  MULTISELECTABLE: 'aria-multiselectable',
  ORIENTATION: 'aria-orientation',
  SORT: 'aria-sort',
  VALUEMIN: 'aria-valuemin',
  VALUEMAX: 'aria-valuemax',
  VALUENOW: 'aria-valuenow',
  VALUETEXT: 'aria-valuetext',
  CONTROLS: 'aria-controls',
  OWNS: 'aria-owns',
  FLOWTO: 'aria-flowto',
  ACTIVEDESCENDANT: 'aria-activedescendant',
  LEVEL: 'aria-level',
  POSINSET: 'aria-posinset',
  SETSIZE: 'aria-setsize',
  HASPOPUP: 'aria-haspopup',
  MODAL: 'aria-modal',
} as const;

/**
 * 键盘导航键码
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
} as const;

/**
 * 颜色对比度计算
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // 简化的亮度计算，实际应用中可能需要更精确的算法
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * 检查颜色对比度是否符合WCAG标准
 */
export const checkWCAGCompliance = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): {
  ratio: number;
  compliant: boolean;
  level: string;
} => {
  const ratio = calculateContrastRatio(foreground, background);
  
  let requiredRatio: number;
  if (level === 'AAA') {
    requiredRatio = size === 'large' ? 4.5 : 7;
  } else {
    requiredRatio = size === 'large' ? 3 : 4.5;
  }
  
  return {
    ratio,
    compliant: ratio >= requiredRatio,
    level: `WCAG ${level}`,
  };
};

/**
 * 生成唯一的ID用于ARIA关联
 */
export const generateAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 创建屏幕阅读器专用文本
 */
export const createScreenReaderText = (text: string): React.CSSProperties => ({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

/**
 * 焦点管理工具
 */
export class FocusManager {
  private focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  /**
   * 获取容器内所有可聚焦元素
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors))
      .filter(el => this.isVisible(el)) as HTMLElement[];
  }

  /**
   * 检查元素是否可见
   */
  private isVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  /**
   * 设置焦点陷阱
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEYS.TAB) {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * 恢复焦点到指定元素
   */
  restoreFocus(element: HTMLElement | null): void {
    if (element && this.isVisible(element)) {
      element.focus();
    }
  }
}

/**
 * 键盘导航处理器
 */
export class KeyboardNavigationHandler {
  private handlers = new Map<string, (event: KeyboardEvent) => void>();

  /**
   * 注册键盘事件处理器
   */
  register(key: string, handler: (event: KeyboardEvent) => void): void {
    this.handlers.set(key, handler);
  }

  /**
   * 注销键盘事件处理器
   */
  unregister(key: string): void {
    this.handlers.delete(key);
  }

  /**
   * 处理键盘事件
   */
  handleKeyDown = (event: KeyboardEvent): void => {
    const handler = this.handlers.get(event.key);
    if (handler) {
      handler(event);
    }
  };

  /**
   * 绑定到元素
   */
  bindTo(element: HTMLElement): () => void {
    element.addEventListener('keydown', this.handleKeyDown);
    return () => {
      element.removeEventListener('keydown', this.handleKeyDown);
    };
  }
}

/**
 * 屏幕阅读器公告
 */
export class ScreenReaderAnnouncer {
  private liveRegion: HTMLElement | null = null;

  constructor() {
    this.createLiveRegion();
  }

  private createLiveRegion(): void {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.liveRegion);
  }

  /**
   * 向屏幕阅读器公告消息
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // 清除消息以便下次公告
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }

  /**
   * 销毁公告器
   */
  destroy(): void {
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
      this.liveRegion = null;
    }
  }
}

/**
 * 无障碍访问测试工具
 */
export const accessibilityTests = {
  /**
   * 检查元素是否有适当的ARIA标签
   */
  checkAriaLabels(element: HTMLElement): string[] {
    const issues: string[] = [];
    
    // 检查交互元素是否有标签
    const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
    if (interactiveElements.includes(element.tagName.toLowerCase())) {
      const hasLabel = element.hasAttribute('aria-label') ||
                      element.hasAttribute('aria-labelledby') ||
                      element.textContent?.trim() ||
                      element.querySelector('label');
      
      if (!hasLabel) {
        issues.push(`${element.tagName} element lacks accessible label`);
      }
    }
    
    return issues;
  },

  /**
   * 检查颜色对比度
   */
  checkColorContrast(element: HTMLElement): string[] {
    const issues: string[] = [];
    const style = window.getComputedStyle(element);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    
    if (color && backgroundColor && color !== backgroundColor) {
      const compliance = checkWCAGCompliance(color, backgroundColor);
      if (!compliance.compliant) {
        issues.push(`Color contrast ratio ${compliance.ratio.toFixed(2)} does not meet ${compliance.level} standards`);
      }
    }
    
    return issues;
  },

  /**
   * 检查键盘可访问性
   */
  checkKeyboardAccessibility(element: HTMLElement): string[] {
    const issues: string[] = [];
    
    // 检查交互元素是否可以通过键盘访问
    const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
    if (interactiveElements.includes(element.tagName.toLowerCase())) {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex === '-1') {
        issues.push(`${element.tagName} element is not keyboard accessible (tabindex="-1")`);
      }
    }
    
    return issues;
  },

  /**
   * 运行所有无障碍测试
   */
  runAllTests(element: HTMLElement): {
    element: HTMLElement;
    issues: string[];
  } {
    const issues = [
      ...this.checkAriaLabels(element),
      ...this.checkColorContrast(element),
      ...this.checkKeyboardAccessibility(element),
    ];
    
    return { element, issues };
  },
};

// 创建全局实例
export const focusManager = new FocusManager();
export const keyboardHandler = new KeyboardNavigationHandler();
export const screenReaderAnnouncer = new ScreenReaderAnnouncer();

// 导入React用于类型定义
import React from 'react';
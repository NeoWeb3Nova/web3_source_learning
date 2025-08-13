// 无障碍访问配置

/**
 * WCAG合规性配置
 */
export interface WCAGConfig {
  level: 'AA' | 'AAA';
  contrastRatio: {
    normal: number;
    large: number;
  };
  fontSize: {
    minimum: number;
    large: number;
  };
  touchTarget: {
    minimum: number;
    recommended: number;
  };
}

/**
 * 键盘导航配置
 */
export interface KeyboardNavigationConfig {
  enabled: boolean;
  focusVisible: boolean;
  skipLinks: boolean;
  shortcuts: Record<string, string>;
  trapFocus: boolean;
}

/**
 * 屏幕阅读器配置
 */
export interface ScreenReaderConfig {
  announcements: boolean;
  liveRegions: boolean;
  ariaLabels: boolean;
  semanticHTML: boolean;
  skipContent: boolean;
}

/**
 * 动画和运动配置
 */
export interface MotionConfig {
  respectReducedMotion: boolean;
  animationDuration: {
    short: number;
    medium: number;
    long: number;
  };
  parallax: boolean;
  autoplay: boolean;
}

/**
 * 完整的无障碍访问配置
 */
export interface AccessibilityConfig {
  wcag: WCAGConfig;
  keyboard: KeyboardNavigationConfig;
  screenReader: ScreenReaderConfig;
  motion: MotionConfig;
  testing: {
    enabled: boolean;
    autoCheck: boolean;
    reportLevel: 'error' | 'warning' | 'info';
  };
}

/**
 * 默认无障碍访问配置
 */
export const defaultAccessibilityConfig: AccessibilityConfig = {
  wcag: {
    level: 'AA',
    contrastRatio: {
      normal: 4.5,
      large: 3.0,
    },
    fontSize: {
      minimum: 16,
      large: 18,
    },
    touchTarget: {
      minimum: 44,
      recommended: 48,
    },
  },
  keyboard: {
    enabled: true,
    focusVisible: true,
    skipLinks: true,
    shortcuts: {
      'Alt+1': '跳转到主内容',
      'Alt+2': '跳转到导航',
      'Alt+3': '跳转到搜索',
      'Escape': '关闭模态框/菜单',
      'Enter': '激活按钮/链接',
      'Space': '激活按钮/复选框',
      'Tab': '下一个焦点',
      'Shift+Tab': '上一个焦点',
      'Arrow Keys': '导航菜单/标签页',
      'Home': '跳转到开始',
      'End': '跳转到结束',
    },
    trapFocus: true,
  },
  screenReader: {
    announcements: true,
    liveRegions: true,
    ariaLabels: true,
    semanticHTML: true,
    skipContent: true,
  },
  motion: {
    respectReducedMotion: true,
    animationDuration: {
      short: 150,
      medium: 300,
      long: 500,
    },
    parallax: false,
    autoplay: false,
  },
  testing: {
    enabled: process.env.NODE_ENV === 'development',
    autoCheck: true,
    reportLevel: 'warning',
  },
};

/**
 * 无障碍访问配置管理器
 */
export class AccessibilityConfigManager {
  private config: AccessibilityConfig;
  private listeners: Array<(config: AccessibilityConfig) => void> = [];

  constructor(initialConfig: AccessibilityConfig = defaultAccessibilityConfig) {
    this.config = { ...initialConfig };
    this.applySystemPreferences();
  }

  /**
   * 应用系统偏好设置
   */
  private applySystemPreferences(): void {
    // 检查用户是否偏好减少动画
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.motion.respectReducedMotion = true;
      this.config.motion.animationDuration.short = 0;
      this.config.motion.animationDuration.medium = 0;
      this.config.motion.animationDuration.long = 0;
      this.config.motion.parallax = false;
      this.config.motion.autoplay = false;
    }

    // 检查用户是否偏好高对比度
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      this.config.wcag.level = 'AAA';
      this.config.wcag.contrastRatio.normal = 7;
      this.config.wcag.contrastRatio.large = 4.5;
    }

    // 监听系统偏好变化
    if (window.matchMedia) {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotionQuery.addEventListener('change', (e) => {
        this.updateConfig({
          motion: {
            ...this.config.motion,
            respectReducedMotion: e.matches,
            animationDuration: e.matches ? {
              short: 0,
              medium: 0,
              long: 0,
            } : defaultAccessibilityConfig.motion.animationDuration,
          },
        });
      });

      const contrastQuery = window.matchMedia('(prefers-contrast: high)');
      contrastQuery.addEventListener('change', (e) => {
        this.updateConfig({
          wcag: {
            ...this.config.wcag,
            level: e.matches ? 'AAA' : 'AA',
            contrastRatio: e.matches ? {
              normal: 7,
              large: 4.5,
            } : defaultAccessibilityConfig.wcag.contrastRatio,
          },
        });
      });
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<AccessibilityConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      wcag: { ...this.config.wcag, ...updates.wcag },
      keyboard: { ...this.config.keyboard, ...updates.keyboard },
      screenReader: { ...this.config.screenReader, ...updates.screenReader },
      motion: { ...this.config.motion, ...updates.motion },
      testing: { ...this.config.testing, ...updates.testing },
    };

    this.notifyListeners();
  }

  /**
   * 订阅配置变化
   */
  subscribe(listener: (config: AccessibilityConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }

  /**
   * 重置为默认配置
   */
  reset(): void {
    this.config = { ...defaultAccessibilityConfig };
    this.applySystemPreferences();
    this.notifyListeners();
  }

  /**
   * 导出配置
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 导入配置
   */
  importConfig(configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson);
      this.config = { ...defaultAccessibilityConfig, ...importedConfig };
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to import accessibility config:', error);
    }
  }

  /**
   * 验证配置
   */
  validateConfig(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证WCAG配置
    if (this.config.wcag.contrastRatio.normal < 3) {
      errors.push('Normal text contrast ratio must be at least 3:1');
    }
    if (this.config.wcag.contrastRatio.large < 3) {
      errors.push('Large text contrast ratio must be at least 3:1');
    }
    if (this.config.wcag.fontSize.minimum < 12) {
      warnings.push('Minimum font size below 12px may be difficult to read');
    }
    if (this.config.wcag.touchTarget.minimum < 44) {
      warnings.push('Touch targets below 44px may be difficult to tap');
    }

    // 验证动画配置
    if (this.config.motion.animationDuration.short > 1000) {
      warnings.push('Short animations over 1000ms may feel slow');
    }
    if (this.config.motion.animationDuration.long > 2000) {
      warnings.push('Long animations over 2000ms may be disruptive');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * 无障碍访问主题扩展
 */
export const accessibilityThemeExtensions = {
  /**
   * 高对比度主题
   */
  highContrast: {
    colors: {
      text: '#000000',
      background: '#ffffff',
      primary: '#0000ff',
      secondary: '#800080',
      success: '#008000',
      warning: '#ff8c00',
      error: '#ff0000',
      border: '#000000',
    },
    shadows: {
      outline: '0 0 0 3px #0000ff',
    },
  },

  /**
   * 大字体主题
   */
  largeText: {
    fontSizes: {
      xs: '16px',
      sm: '18px',
      md: '20px',
      lg: '24px',
      xl: '28px',
      '2xl': '32px',
      '3xl': '36px',
      '4xl': '42px',
      '5xl': '48px',
      '6xl': '56px',
    },
    lineHeights: {
      normal: 1.6,
      none: 1.4,
      shorter: 1.5,
      short: 1.6,
      base: 1.7,
      tall: 1.8,
      taller: 2.0,
    },
  },

  /**
   * 减少动画主题
   */
  reducedMotion: {
    transition: {
      duration: {
        'ultra-fast': '0ms',
        faster: '0ms',
        fast: '0ms',
        normal: '0ms',
        slow: '0ms',
        slower: '0ms',
        'ultra-slow': '0ms',
      },
    },
  },
};

/**
 * 无障碍访问CSS变量
 */
export const accessibilityCSS = `
  :root {
    --a11y-focus-color: #005fcc;
    --a11y-focus-width: 2px;
    --a11y-focus-offset: 2px;
    --a11y-touch-target-min: 44px;
    --a11y-animation-duration: 0.3s;
  }

  @media (prefers-reduced-motion: reduce) {
    :root {
      --a11y-animation-duration: 0ms;
    }
    
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  @media (prefers-contrast: high) {
    :root {
      --a11y-focus-color: #000000;
      --a11y-focus-width: 3px;
    }
  }

  /* 焦点样式 */
  .a11y-focus-visible:focus-visible {
    outline: var(--a11y-focus-width) solid var(--a11y-focus-color);
    outline-offset: var(--a11y-focus-offset);
  }

  /* 跳转链接 */
  .a11y-skip-link {
    position: absolute;
    left: -9999px;
    z-index: 999999;
    padding: 8px 16px;
    background: var(--a11y-focus-color);
    color: white;
    text-decoration: none;
    border-radius: 0 0 4px 4px;
  }

  .a11y-skip-link:focus {
    left: 6px;
    top: 6px;
  }

  /* 屏幕阅读器专用文本 */
  .a11y-sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  /* 触摸目标最小尺寸 */
  .a11y-touch-target {
    min-width: var(--a11y-touch-target-min);
    min-height: var(--a11y-touch-target-min);
  }
`;

// 创建全局配置管理器实例
export const accessibilityConfigManager = new AccessibilityConfigManager();

// React Hook for using accessibility config
export const useAccessibilityConfig = () => {
  const [config, setConfig] = React.useState(accessibilityConfigManager.getConfig());

  React.useEffect(() => {
    return accessibilityConfigManager.subscribe(setConfig);
  }, []);

  return config;
};

// 导入React用于Hook
import React from 'react';
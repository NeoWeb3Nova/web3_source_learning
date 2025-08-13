// 颜色对比度检查工具

/**
 * 颜色格式转换工具
 */
export class ColorConverter {
  /**
   * 将十六进制颜色转换为RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }

  /**
   * 将RGB颜色转换为十六进制
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * 将HSL颜色转换为RGB
   */
  static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  /**
   * 解析CSS颜色字符串
   */
  static parseColor(color: string): { r: number; g: number; b: number } | null {
    // 处理十六进制颜色
    if (color.startsWith('#')) {
      return this.hexToRgb(color);
    }

    // 处理RGB颜色
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10),
      };
    }

    // 处理RGBA颜色
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1], 10),
        g: parseInt(rgbaMatch[2], 10),
        b: parseInt(rgbaMatch[3], 10),
      };
    }

    // 处理HSL颜色
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      return this.hslToRgb(
        parseInt(hslMatch[1], 10),
        parseInt(hslMatch[2], 10),
        parseInt(hslMatch[3], 10)
      );
    }

    // 处理命名颜色
    const namedColors: Record<string, string> = {
      black: '#000000',
      white: '#ffffff',
      red: '#ff0000',
      green: '#008000',
      blue: '#0000ff',
      yellow: '#ffff00',
      cyan: '#00ffff',
      magenta: '#ff00ff',
      silver: '#c0c0c0',
      gray: '#808080',
      maroon: '#800000',
      olive: '#808000',
      lime: '#00ff00',
      aqua: '#00ffff',
      teal: '#008080',
      navy: '#000080',
      fuchsia: '#ff00ff',
      purple: '#800080',
    };

    const namedColor = namedColors[color.toLowerCase()];
    if (namedColor) {
      return this.hexToRgb(namedColor);
    }

    return null;
  }
}

/**
 * 颜色对比度计算器
 */
export class ContrastCalculator {
  /**
   * 计算相对亮度
   */
  static getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * 计算对比度比率
   */
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = ColorConverter.parseColor(color1);
    const rgb2 = ColorConverter.parseColor(color2);

    if (!rgb1 || !rgb2) {
      throw new Error('Invalid color format');
    }

    const lum1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * 检查WCAG合规性
   */
  static checkWCAGCompliance(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): {
    ratio: number;
    compliant: boolean;
    level: string;
    requiredRatio: number;
    grade: 'Pass' | 'Fail';
  } {
    const ratio = this.getContrastRatio(foreground, background);
    
    let requiredRatio: number;
    if (level === 'AAA') {
      requiredRatio = size === 'large' ? 4.5 : 7;
    } else {
      requiredRatio = size === 'large' ? 3 : 4.5;
    }
    
    const compliant = ratio >= requiredRatio;
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      compliant,
      level: `WCAG ${level}`,
      requiredRatio,
      grade: compliant ? 'Pass' : 'Fail',
    };
  }

  /**
   * 获取所有WCAG等级的合规性检查
   */
  static getAllWCAGLevels(foreground: string, background: string): {
    normal: {
      AA: ReturnType<typeof ContrastCalculator.checkWCAGCompliance>;
      AAA: ReturnType<typeof ContrastCalculator.checkWCAGCompliance>;
    };
    large: {
      AA: ReturnType<typeof ContrastCalculator.checkWCAGCompliance>;
      AAA: ReturnType<typeof ContrastCalculator.checkWCAGCompliance>;
    };
  } {
    return {
      normal: {
        AA: this.checkWCAGCompliance(foreground, background, 'AA', 'normal'),
        AAA: this.checkWCAGCompliance(foreground, background, 'AAA', 'normal'),
      },
      large: {
        AA: this.checkWCAGCompliance(foreground, background, 'AA', 'large'),
        AAA: this.checkWCAGCompliance(foreground, background, 'AAA', 'large'),
      },
    };
  }
}

/**
 * 颜色建议生成器
 */
export class ColorSuggestionGenerator {
  /**
   * 生成符合对比度要求的颜色建议
   */
  static generateAccessibleColors(
    baseColor: string,
    targetRatio: number = 4.5,
    isBackground: boolean = false
  ): string[] {
    const baseRgb = ColorConverter.parseColor(baseColor);
    if (!baseRgb) return [];

    const suggestions: string[] = [];
    const baseLuminance = ContrastCalculator.getRelativeLuminance(
      baseRgb.r, baseRgb.g, baseRgb.b
    );

    // 计算需要的亮度值
    const targetLuminance1 = (baseLuminance + 0.05) / targetRatio - 0.05;
    const targetLuminance2 = targetRatio * (baseLuminance + 0.05) - 0.05;

    // 生成更亮和更暗的颜色
    const luminanceTargets = [targetLuminance1, targetLuminance2]
      .filter(l => l >= 0 && l <= 1);

    luminanceTargets.forEach(targetLum => {
      // 简化的颜色生成算法
      const factor = targetLum / baseLuminance;
      const newR = Math.min(255, Math.max(0, Math.round(baseRgb.r * factor)));
      const newG = Math.min(255, Math.max(0, Math.round(baseRgb.g * factor)));
      const newB = Math.min(255, Math.max(0, Math.round(baseRgb.b * factor)));
      
      suggestions.push(ColorConverter.rgbToHex(newR, newG, newB));
    });

    // 添加一些常用的高对比度颜色
    const commonColors = ['#000000', '#ffffff', '#333333', '#666666', '#999999'];
    commonColors.forEach(color => {
      try {
        const ratio = ContrastCalculator.getContrastRatio(baseColor, color);
        if (ratio >= targetRatio && !suggestions.includes(color)) {
          suggestions.push(color);
        }
      } catch (e) {
        // 忽略错误
      }
    });

    return suggestions.slice(0, 5); // 返回前5个建议
  }

  /**
   * 修复颜色对比度
   */
  static fixColorContrast(
    foreground: string,
    background: string,
    targetRatio: number = 4.5,
    adjustForeground: boolean = true
  ): {
    original: { foreground: string; background: string; ratio: number };
    fixed: { foreground: string; background: string; ratio: number };
    suggestions: string[];
  } {
    const originalRatio = ContrastCalculator.getContrastRatio(foreground, background);
    
    if (originalRatio >= targetRatio) {
      return {
        original: { foreground, background, ratio: originalRatio },
        fixed: { foreground, background, ratio: originalRatio },
        suggestions: [],
      };
    }

    const colorToAdjust = adjustForeground ? foreground : background;
    const fixedColor = background;
    
    const suggestions = this.generateAccessibleColors(fixedColor, targetRatio);
    const bestSuggestion = suggestions[0] || (adjustForeground ? '#000000' : '#ffffff');
    
    const fixedForeground = adjustForeground ? bestSuggestion : foreground;
    const fixedBackground = adjustForeground ? background : bestSuggestion;
    const fixedRatio = ContrastCalculator.getContrastRatio(fixedForeground, fixedBackground);

    return {
      original: { foreground, background, ratio: originalRatio },
      fixed: { foreground: fixedForeground, background: fixedBackground, ratio: fixedRatio },
      suggestions,
    };
  }
}

/**
 * 主题颜色验证器
 */
export class ThemeColorValidator {
  /**
   * 验证整个主题的颜色对比度
   */
  static validateTheme(theme: {
    colors: Record<string, any>;
    textColors?: Record<string, string>;
    backgroundColors?: Record<string, string>;
  }): {
    valid: boolean;
    issues: Array<{
      combination: string;
      foreground: string;
      background: string;
      ratio: number;
      compliant: boolean;
      level: string;
    }>;
    suggestions: Array<{
      combination: string;
      originalColors: { foreground: string; background: string };
      suggestedColors: { foreground: string; background: string };
    }>;
  } {
    const issues: any[] = [];
    const suggestions: any[] = [];

    // 常见的文本和背景颜色组合
    const combinations = [
      { name: 'primary-on-white', fg: theme.colors.blue?.[500] || '#3182CE', bg: '#ffffff' },
      { name: 'white-on-primary', fg: '#ffffff', bg: theme.colors.blue?.[500] || '#3182CE' },
      { name: 'text-on-background', fg: theme.colors.gray?.[800] || '#2D3748', bg: '#ffffff' },
      { name: 'muted-text', fg: theme.colors.gray?.[600] || '#718096', bg: '#ffffff' },
    ];

    combinations.forEach(({ name, fg, bg }) => {
      try {
        const result = ContrastCalculator.checkWCAGCompliance(fg, bg);
        
        if (!result.compliant) {
          issues.push({
            combination: name,
            foreground: fg,
            background: bg,
            ratio: result.ratio,
            compliant: result.compliant,
            level: result.level,
          });

          const fix = ColorSuggestionGenerator.fixColorContrast(fg, bg);
          suggestions.push({
            combination: name,
            originalColors: { foreground: fg, background: bg },
            suggestedColors: { foreground: fix.fixed.foreground, background: fix.fixed.background },
          });
        }
      } catch (e) {
        // 忽略无效颜色
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      suggestions,
    };
  }
}

// 导出便捷函数
export const checkContrast = ContrastCalculator.getContrastRatio;
export const checkWCAG = ContrastCalculator.checkWCAGCompliance;
export const generateAccessibleColors = ColorSuggestionGenerator.generateAccessibleColors;
export const fixContrast = ColorSuggestionGenerator.fixColorContrast;
export const validateTheme = ThemeColorValidator.validateTheme;

export default {
  ColorConverter,
  ContrastCalculator,
  ColorSuggestionGenerator,
  ThemeColorValidator,
  checkContrast,
  checkWCAG,
  generateAccessibleColors,
  fixContrast,
  validateTheme,
};
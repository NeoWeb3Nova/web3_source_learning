import { extendTheme } from '@chakra-ui/react';
import { colors } from './colors';
import { breakpoints } from './breakpoints';
import { components } from './components';

const theme = extendTheme({
  colors,
  breakpoints,
  components,
  fonts: {
    heading: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    body: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  },
  fontSizes: typography.fontSizes,
  lineHeights: typography.lineHeights,
  fontWeights: typography.fontWeights,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true, // 启用系统主题检测
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
        // 优化小屏幕可读性
        fontSize: { base: '16px', md: '16px' },
        lineHeight: { base: '1.6', md: '1.5' },
        // 平滑滚动
        scrollBehavior: 'smooth',
        // 优化字体渲染
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      // 全局动画
      '*': {
        transition: 'color 0.2s, background-color 0.2s, border-color 0.2s',
      },
      // 焦点样式优化
      '*:focus': {
        outline: 'none',
        boxShadow: props.colorMode === 'dark' 
          ? '0 0 0 3px rgba(66, 153, 225, 0.6)' 
          : '0 0 0 3px rgba(66, 153, 225, 0.6)',
      },
      // 选择文本样式
      '::selection': {
        bg: props.colorMode === 'dark' ? 'primary.200' : 'primary.100',
        color: props.colorMode === 'dark' ? 'gray.900' : 'gray.800',
      },
    }),
  },
  // 自定义CSS变量
  semanticTokens: {
    colors: {
      'chakra-body-text': {
        _light: 'gray.800',
        _dark: 'gray.100',
      },
      'chakra-body-bg': {
        _light: 'gray.50',
        _dark: 'gray.900',
      },
      'chakra-border-color': {
        _light: 'gray.200',
        _dark: 'gray.600',
      },
      'chakra-subtle-bg': {
        _light: 'gray.100',
        _dark: 'gray.700',
      },
      'chakra-subtle-text': {
        _light: 'gray.600',
        _dark: 'gray.400',
      },
    },
  },
  // 动画配置
  transition: {
    property: {
      common: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      colors: 'background-color, border-color, color, fill, stroke',
      dimensions: 'width, height',
      position: 'left, right, top, bottom',
      background: 'background-color, background-image, background-position',
    },
    easing: animations.easing,
    duration: animations.duration,
  },
});;
/**
 * 动画配置
 */
export const animations = {
  // 缓动函数
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
  
  // 持续时间
  duration: {
    shortest: '150ms',
    shorter: '200ms',
    short: '250ms',
    standard: '300ms',
    complex: '375ms',
    enteringScreen: '225ms',
    leavingScreen: '195ms',
  },
  
  // 预设动画
  presets: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 },
    },
    fadeOut: {
      initial: { opacity: 1 },
      animate: { opacity: 0 },
      transition: { duration: 0.3 },
    },
    slideUp: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.3 },
    },
    slideDown: {
      initial: { y: -20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.3 },
    },
    scaleIn: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { duration: 0.3 },
    },
    bounce: {
      animate: {
        y: [0, -10, 0],
        transition: {
          duration: 0.6,
          repeat: Infinity,
          repeatType: 'reverse' as const,
        },
      },
    },
  },
};

/**
 * 视觉反馈配置
 */
export const feedback = {
  // 成功状态
  success: {
    color: 'success.500',
    bg: 'success.50',
    borderColor: 'success.200',
    icon: '✓',
    animation: 'bounce',
  },
  
  // 错误状态
  error: {
    color: 'error.500',
    bg: 'error.50',
    borderColor: 'error.200',
    icon: '✗',
    animation: 'shake',
  },
  
  // 警告状态
  warning: {
    color: 'warning.500',
    bg: 'warning.50',
    borderColor: 'warning.200',
    icon: '⚠',
    animation: 'pulse',
  },
  
  // 信息状态
  info: {
    color: 'info.500',
    bg: 'info.50',
    borderColor: 'info.200',
    icon: 'ℹ',
    animation: 'fadeIn',
  },
  
  // 加载状态
  loading: {
    color: 'primary.500',
    bg: 'primary.50',
    borderColor: 'primary.200',
    icon: '⟳',
    animation: 'spin',
  },
};

/**
 * 字体优化配置
 */
export const typography = {
  // 字体大小（移动端优化）
  fontSizes: {
    xs: { base: '12px', md: '12px' },
    sm: { base: '14px', md: '14px' },
    md: { base: '16px', md: '16px' },
    lg: { base: '18px', md: '18px' },
    xl: { base: '20px', md: '20px' },
    '2xl': { base: '24px', md: '24px' },
    '3xl': { base: '28px', md: '30px' },
    '4xl': { base: '32px', md: '36px' },
    '5xl': { base: '36px', md: '48px' },
    '6xl': { base: '48px', md: '60px' },
  },
  
  // 行高优化
  lineHeights: {
    normal: 'normal',
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: '2',
  },
  
  // 字重
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  // 可读性优化
  readability: {
    // 小屏幕优化
    mobile: {
      fontSize: { base: '16px', sm: '14px' },
      lineHeight: { base: '1.6', sm: '1.5' },
      letterSpacing: { base: '0.01em', sm: '0' },
    },
    
    // 大屏幕优化
    desktop: {
      fontSize: { base: '16px', lg: '18px' },
      lineHeight: { base: '1.5', lg: '1.6' },
      letterSpacing: { base: '0', lg: '0.01em' },
    },
  },
};

export default theme;
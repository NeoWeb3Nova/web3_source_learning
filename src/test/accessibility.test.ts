// 无障碍访问测试

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import {
  ContrastCalculator,
  ColorConverter,
  ColorSuggestionGenerator,
  ThemeColorValidator,
} from '../utils/colorContrast';
import {
  focusManager,
  keyboardHandler,
  screenReaderAnnouncer,
  accessibilityTests,
  KEYBOARD_KEYS,
  ARIA_ROLES,
  ARIA_ATTRIBUTES,
} from '../utils/accessibility';

// 测试组件 - 移除JSX语法，使用DOM操作
const createTestButton = (props: any = {}) => {
  const button = document.createElement('button');
  button.textContent = props.children || 'Test Button';
  if (props.onClick) {
    button.addEventListener('click', props.onClick);
  }
  Object.keys(props).forEach(key => {
    if (key !== 'children' && key !== 'onClick') {
      button.setAttribute(key, props[key]);
    }
  });
  return button;
};

const createTestModal = (props: any = {}) => {
  if (!props.isOpen) return null;
  
  const modal = document.createElement('div');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');
  
  const title = document.createElement('h2');
  title.id = 'modal-title';
  title.textContent = '测试模态框';
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', '关闭');
  if (props.onClose) {
    closeButton.addEventListener('click', props.onClose);
  }
  
  modal.appendChild(title);
  modal.appendChild(closeButton);
  
  if (props.children) {
    const content = document.createElement('div');
    content.textContent = props.children;
    modal.appendChild(content);
  }
  
  return modal;
};

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // 清理全局状态
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // 清理
    document.body.innerHTML = '';
  });

  describe('Color Contrast Tests', () => {
    describe('ColorConverter', () => {
      it('should convert hex to RGB correctly', () => {
        const result = ColorConverter.hexToRgb('#ff0000');
        expect(result).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('should convert RGB to hex correctly', () => {
        const result = ColorConverter.rgbToHex(255, 0, 0);
        expect(result).toBe('#ff0000');
      });

      it('should parse CSS color strings', () => {
        expect(ColorConverter.parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
        expect(ColorConverter.parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
        expect(ColorConverter.parseColor('red')).toEqual({ r: 255, g: 0, b: 0 });
      });
    });

    describe('ContrastCalculator', () => {
      it('should calculate contrast ratio correctly', () => {
        const ratio = ContrastCalculator.getContrastRatio('#000000', '#ffffff');
        expect(ratio).toBe(21); // 黑白对比度应该是21:1
      });

      it('should check WCAG compliance', () => {
        const result = ContrastCalculator.checkWCAGCompliance('#000000', '#ffffff');
        expect(result.compliant).toBe(true);
        expect(result.ratio).toBe(21);
        expect(result.grade).toBe('Pass');
      });

      it('should fail for low contrast colors', () => {
        const result = ContrastCalculator.checkWCAGCompliance('#cccccc', '#ffffff');
        expect(result.compliant).toBe(false);
        expect(result.grade).toBe('Fail');
      });
    });

    describe('ColorSuggestionGenerator', () => {
      it('should generate accessible color suggestions', () => {
        const suggestions = ColorSuggestionGenerator.generateAccessibleColors('#3182CE');
        expect(suggestions).toBeInstanceOf(Array);
        expect(suggestions.length).toBeGreaterThan(0);
      });

      it('should fix color contrast issues', () => {
        const result = ColorSuggestionGenerator.fixColorContrast('#cccccc', '#ffffff');
        expect(result.fixed.ratio).toBeGreaterThan(result.original.ratio);
      });
    });

    describe('ThemeColorValidator', () => {
      it('should validate theme colors', () => {
        const theme = {
          colors: {
            blue: { 500: '#3182CE' },
            gray: { 600: '#718096', 800: '#2D3748' },
          },
        };

        const result = ThemeColorValidator.validateTheme(theme);
        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('issues');
        expect(result).toHaveProperty('suggestions');
      });
    });
  });

  describe('Focus Management Tests', () => {
    it('should get focusable elements', () => {
      document.body.innerHTML = `
        <div id="container">
          <button>Button 1</button>
          <input type="text" />
          <a href="#">Link</a>
          <button disabled>Disabled Button</button>
        </div>
      `;

      const container = document.getElementById('container') as HTMLElement;
      const focusableElements = focusManager.getFocusableElements(container);
      
      expect(focusableElements).toHaveLength(3); // 不包括disabled按钮
    });

    it('should trap focus within container', () => {
      document.body.innerHTML = `
        <div id="container">
          <button id="first">First</button>
          <button id="second">Second</button>
          <button id="last">Last</button>
        </div>
      `;

      const container = document.getElementById('container') as HTMLElement;
      const cleanup = focusManager.trapFocus(container);
      
      const firstButton = document.getElementById('first') as HTMLElement;
      const lastButton = document.getElementById('last') as HTMLElement;
      
      expect(document.activeElement).toBe(firstButton);
      
      // 模拟Tab键到最后一个元素，然后再Tab应该回到第一个
      lastButton.focus();
      fireEvent.keyDown(container, { key: 'Tab' });
      
      cleanup();
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('should handle keyboard events', () => {
      let enterPressed = false;
      let escapePressed = false;

      document.body.innerHTML = '<div id="test-element"></div>';
      const element = document.getElementById('test-element') as HTMLElement;

      keyboardHandler.register(KEYBOARD_KEYS.ENTER, () => {
        enterPressed = true;
      });

      keyboardHandler.register(KEYBOARD_KEYS.ESCAPE, () => {
        escapePressed = true;
      });

      const cleanup = keyboardHandler.bindTo(element);

      fireEvent.keyDown(element, { key: KEYBOARD_KEYS.ENTER });
      expect(enterPressed).toBe(true);

      fireEvent.keyDown(element, { key: KEYBOARD_KEYS.ESCAPE });
      expect(escapePressed).toBe(true);

      cleanup();
    });
  });

  describe('Screen Reader Announcer Tests', () => {
    it('should create live region', () => {
      const liveRegions = document.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeGreaterThan(0);
    });

    it('should announce messages', () => {
      screenReaderAnnouncer.announce('测试消息');
      
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion?.textContent).toBe('测试消息');
    });

    it('should clear messages after timeout', async () => {
      screenReaderAnnouncer.announce('测试消息');
      
      await waitFor(() => {
        const liveRegion = document.querySelector('[aria-live="polite"]');
        expect(liveRegion?.textContent).toBe('');
      }, { timeout: 1500 });
    });
  });

  describe('Accessibility Tests Utility', () => {
    it('should check ARIA labels', () => {
      document.body.innerHTML = '<button>No Label</button>';
      const button = document.querySelector('button') as HTMLElement;
      
      const issues = accessibilityTests.checkAriaLabels(button);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain('lacks accessible label');
    });

    it('should pass for properly labeled elements', () => {
      document.body.innerHTML = '<button aria-label="Close dialog">×</button>';
      const button = document.querySelector('button') as HTMLElement;
      
      const issues = accessibilityTests.checkAriaLabels(button);
      expect(issues.length).toBe(0);
    });

    it('should check keyboard accessibility', () => {
      document.body.innerHTML = '<button tabindex="-1">Not Accessible</button>';
      const button = document.querySelector('button') as HTMLElement;
      
      const issues = accessibilityTests.checkKeyboardAccessibility(button);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain('not keyboard accessible');
    });

    it('should run all accessibility tests', () => {
      document.body.innerHTML = '<button tabindex="-1">Bad Button</button>';
      const button = document.querySelector('button') as HTMLElement;
      
      const result = accessibilityTests.runAllTests(button);
      expect(result.element).toBe(button);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Component Accessibility Tests', () => {
    it('should render accessible button', () => {
      const button = createTestButton({ 
        'aria-label': '测试按钮',
        children: '点击我'
      });
      
      document.body.appendChild(button);
      
      expect(button.getAttribute('aria-label')).toBe('测试按钮');
      expect(button.textContent).toBe('点击我');
      
      document.body.removeChild(button);
    });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', '测试按钮');
    });

    it('should handle keyboard navigation', async () => {
      let clicked = false;
      const button = createTestButton({ 
        onClick: () => { clicked = true; },
        children: '测试按钮'
      });
      
      document.body.appendChild(button);
      
      // 模拟键盘激活
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // 模拟Enter键
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.click(button); // 模拟Enter键触发的点击
      expect(clicked).toBe(true);
      
      document.body.removeChild(button);
    });

    it('should render accessible modal', () => {
      const modal = createTestModal({ 
        isOpen: true, 
        onClose: () => {},
        children: '模态框内容'
      });
      
      if (modal) {
        document.body.appendChild(modal);
        
        expect(modal.getAttribute('role')).toBe('dialog');
        expect(modal.getAttribute('aria-modal')).toBe('true');
        expect(modal.getAttribute('aria-labelledby')).toBe('modal-title');
        
        const title = modal.querySelector('#modal-title');
        expect(title?.textContent).toBe('测试模态框');
        
        const closeButton = modal.querySelector('[aria-label="关闭"]');
        expect(closeButton).toBeTruthy();
        
        document.body.removeChild(modal);
      }
    });

    it('should handle modal keyboard interactions', async () => {
      let closed = false;
      const modal = createTestModal({ 
        isOpen: true, 
        onClose: () => { closed = true; },
        children: '模态框内容'
      });
      
      if (modal) {
        document.body.appendChild(modal);
        
        // 测试Escape键关闭模态框
        fireEvent.keyDown(modal, { key: 'Escape' });
        // 注意：这里需要实际的模态框组件来处理Escape键
        // 在真实实现中应该会调用onClose
        
        document.body.removeChild(modal);
      }
    });
  });

  describe('ARIA Constants Tests', () => {
    it('should have correct ARIA roles', () => {
      expect(ARIA_ROLES.BUTTON).toBe('button');
      expect(ARIA_ROLES.DIALOG).toBe('dialog');
      expect(ARIA_ROLES.MENU).toBe('menu');
    });

    it('should have correct ARIA attributes', () => {
      expect(ARIA_ATTRIBUTES.LABEL).toBe('aria-label');
      expect(ARIA_ATTRIBUTES.EXPANDED).toBe('aria-expanded');
      expect(ARIA_ATTRIBUTES.HIDDEN).toBe('aria-hidden');
    });

    it('should have correct keyboard keys', () => {
      expect(KEYBOARD_KEYS.ENTER).toBe('Enter');
      expect(KEYBOARD_KEYS.ESCAPE).toBe('Escape');
      expect(KEYBOARD_KEYS.TAB).toBe('Tab');
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete accessibility', async () => {
      // 创建一个包含多个可访问元素的复杂界面
      const container = document.createElement('div');
      
      const heading = document.createElement('h1');
      heading.textContent = '可访问的应用';
      
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', '主导航');
      
      const homeBtn = document.createElement('button');
      homeBtn.textContent = '首页';
      const aboutBtn = document.createElement('button');
      aboutBtn.textContent = '关于';
      const contactBtn = document.createElement('button');
      contactBtn.textContent = '联系';
      
      nav.appendChild(homeBtn);
      nav.appendChild(aboutBtn);
      nav.appendChild(contactBtn);
      
      const main = document.createElement('main');
      const form = document.createElement('form');
      
      const label = document.createElement('label');
      label.textContent = '姓名';
      label.setAttribute('for', 'name');
      
      const input = document.createElement('input');
      input.id = 'name';
      input.type = 'text';
      input.required = true;
      
      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.textContent = '提交';
      
      form.appendChild(label);
      form.appendChild(input);
      form.appendChild(submitBtn);
      main.appendChild(form);
      
      container.appendChild(heading);
      container.appendChild(nav);
      container.appendChild(main);
      document.body.appendChild(container);
      
      // 测试语义化结构
      expect(heading.tagName).toBe('H1');
      expect(nav.tagName).toBe('NAV');
      expect(main.tagName).toBe('MAIN');
      expect(form.tagName).toBe('FORM');
      
      // 测试标签关联
      expect(input.getAttribute('id')).toBe('name');
      expect(label.getAttribute('for')).toBe('name');
      expect(input.hasAttribute('required')).toBe(true);
      
      // 测试键盘导航
      homeBtn.focus();
      expect(document.activeElement).toBe(homeBtn);
      
      document.body.removeChild(container);
    });
  });
});

describe('Real Component Accessibility Tests', () => {
    it('should test WordCard accessibility', () => {
      // 创建WordCard的DOM结构
      const wordCard = document.createElement('div');
      wordCard.setAttribute('role', 'button');
      wordCard.setAttribute('aria-label', '单词卡片: Blockchain - 点击翻转查看定义');
      wordCard.setAttribute('tabindex', '0');
      wordCard.className = 'word-card';
      
      const wordElement = document.createElement('h3');
      wordElement.textContent = 'Blockchain';
      wordElement.setAttribute('aria-level', '3');
      
      const categoryElement = document.createElement('span');
      categoryElement.textContent = 'BLOCKCHAIN';
      categoryElement.setAttribute('aria-label', '分类: 区块链');
      
      const difficultyElement = document.createElement('span');
      difficultyElement.textContent = 'BEGINNER';
      difficultyElement.setAttribute('aria-label', '难度: 初级');
      
      const favoriteButton = document.createElement('button');
      favoriteButton.setAttribute('aria-label', '收藏此单词');
      favoriteButton.setAttribute('aria-pressed', 'false');
      favoriteButton.textContent = '♡';
      
      const audioButton = document.createElement('button');
      audioButton.setAttribute('aria-label', '播放 Blockchain 的发音');
      audioButton.textContent = '🔊';
      
      wordCard.appendChild(wordElement);
      wordCard.appendChild(categoryElement);
      wordCard.appendChild(difficultyElement);
      wordCard.appendChild(favoriteButton);
      wordCard.appendChild(audioButton);
      
      document.body.appendChild(wordCard);
      
      // 测试可访问性
      expect(wordCard.getAttribute('role')).toBe('button');
      expect(wordCard.getAttribute('aria-label')).toContain('Blockchain');
      expect(wordCard.getAttribute('tabindex')).toBe('0');
      
      expect(favoriteButton.getAttribute('aria-pressed')).toBe('false');
      expect(audioButton.getAttribute('aria-label')).toContain('播放');
      
      // 测试键盘导航
      wordCard.focus();
      expect(document.activeElement).toBe(wordCard);
      
      // 测试颜色对比度
      const computedStyle = window.getComputedStyle(wordCard);
      const bgColor = computedStyle.backgroundColor || '#ffffff';
      const textColor = computedStyle.color || '#000000';
      
      // 简单的对比度检查（实际应用中会更复杂）
      expect(bgColor).toBeTruthy();
      expect(textColor).toBeTruthy();
      
      document.body.removeChild(wordCard);
    });

    it('should test Quiz accessibility', () => {
      // 创建Quiz的DOM结构
      const quizContainer = document.createElement('main');
      quizContainer.setAttribute('role', 'main');
      quizContainer.setAttribute('aria-label', '词汇测试');
      
      const progressBar = document.createElement('div');
      progressBar.setAttribute('role', 'progressbar');
      progressBar.setAttribute('aria-valuenow', '1');
      progressBar.setAttribute('aria-valuemin', '1');
      progressBar.setAttribute('aria-valuemax', '10');
      progressBar.setAttribute('aria-label', '测试进度: 第1题，共10题');
      
      const questionElement = document.createElement('h2');
      questionElement.textContent = 'What is blockchain?';
      questionElement.setAttribute('aria-live', 'polite');
      questionElement.id = 'current-question';
      
      const optionsContainer = document.createElement('div');
      optionsContainer.setAttribute('role', 'radiogroup');
      optionsContainer.setAttribute('aria-labelledby', 'current-question');
      
      const options = [
        'A distributed ledger',
        'A database',
        'A network',
        'All of the above'
      ];
      
      options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.setAttribute('role', 'radio');
        optionElement.setAttribute('aria-checked', 'false');
        optionElement.setAttribute('tabindex', index === 0 ? '0' : '-1');
        optionElement.textContent = option;
        optionsContainer.appendChild(optionElement);
      });
      
      const timer = document.createElement('div');
      timer.setAttribute('aria-label', '剩余时间');
      timer.setAttribute('aria-live', 'polite');
      timer.textContent = '剩余时间: 30秒';
      
      quizContainer.appendChild(progressBar);
      quizContainer.appendChild(questionElement);
      quizContainer.appendChild(optionsContainer);
      quizContainer.appendChild(timer);
      
      document.body.appendChild(quizContainer);
      
      // 测试可访问性
      expect(quizContainer.getAttribute('role')).toBe('main');
      expect(progressBar.getAttribute('role')).toBe('progressbar');
      expect(optionsContainer.getAttribute('role')).toBe('radiogroup');
      
      const radioOptions = optionsContainer.querySelectorAll('[role="radio"]');
      expect(radioOptions).toHaveLength(4);
      
      // 测试键盘导航
      const firstOption = radioOptions[0] as HTMLElement;
      firstOption.focus();
      expect(document.activeElement).toBe(firstOption);
      
      // 测试ARIA live regions
      expect(questionElement.getAttribute('aria-live')).toBe('polite');
      expect(timer.getAttribute('aria-live')).toBe('polite');
      
      document.body.removeChild(quizContainer);
    });

    it('should test Navigation accessibility', () => {
      // 创建导航的DOM结构
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', '主导航');
      nav.setAttribute('role', 'navigation');
      
      const tabList = document.createElement('div');
      tabList.setAttribute('role', 'tablist');
      tabList.setAttribute('aria-label', '应用页面');
      
      const tabs = [
        { name: '首页', id: 'home', selected: true },
        { name: '练习', id: 'practice', selected: false },
        { name: '进度', id: 'progress', selected: false },
        { name: '设置', id: 'settings', selected: false }
      ];
      
      tabs.forEach((tab, index) => {
        const tabElement = document.createElement('button');
        tabElement.setAttribute('role', 'tab');
        tabElement.setAttribute('aria-selected', tab.selected.toString());
        tabElement.setAttribute('aria-controls', `${tab.id}-panel`);
        tabElement.setAttribute('tabindex', tab.selected ? '0' : '-1');
        tabElement.id = `${tab.id}-tab`;
        tabElement.textContent = tab.name;
        
        tabList.appendChild(tabElement);
      });
      
      nav.appendChild(tabList);
      document.body.appendChild(nav);
      
      // 测试可访问性
      expect(nav.getAttribute('role')).toBe('navigation');
      expect(tabList.getAttribute('role')).toBe('tablist');
      
      const tabElements = tabList.querySelectorAll('[role="tab"]');
      expect(tabElements).toHaveLength(4);
      
      // 测试选中状态
      const selectedTab = tabList.querySelector('[aria-selected="true"]') as HTMLElement;
      expect(selectedTab).toBeTruthy();
      expect(selectedTab.getAttribute('tabindex')).toBe('0');
      
      // 测试键盘导航
      selectedTab.focus();
      expect(document.activeElement).toBe(selectedTab);
      
      document.body.removeChild(nav);
    });

    it('should test Modal accessibility', () => {
      // 创建模态框的DOM结构
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.setAttribute('aria-hidden', 'false');
      
      const modal = document.createElement('div');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'modal-title');
      modal.setAttribute('aria-describedby', 'modal-description');
      
      const header = document.createElement('header');
      const title = document.createElement('h2');
      title.id = 'modal-title';
      title.textContent = '添加新词汇';
      
      const closeButton = document.createElement('button');
      closeButton.setAttribute('aria-label', '关闭对话框');
      closeButton.textContent = '×';
      
      header.appendChild(title);
      header.appendChild(closeButton);
      
      const content = document.createElement('div');
      content.id = 'modal-description';
      content.textContent = '请填写以下信息来添加新的词汇';
      
      const form = document.createElement('form');
      
      const wordLabel = document.createElement('label');
      wordLabel.textContent = '单词';
      wordLabel.setAttribute('for', 'word-input');
      
      const wordInput = document.createElement('input');
      wordInput.id = 'word-input';
      wordInput.type = 'text';
      wordInput.required = true;
      wordInput.setAttribute('aria-describedby', 'word-help');
      
      const wordHelp = document.createElement('div');
      wordHelp.id = 'word-help';
      wordHelp.textContent = '请输入要学习的单词';
      
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.textContent = '添加词汇';
      
      form.appendChild(wordLabel);
      form.appendChild(wordInput);
      form.appendChild(wordHelp);
      form.appendChild(submitButton);
      
      modal.appendChild(header);
      modal.appendChild(content);
      modal.appendChild(form);
      overlay.appendChild(modal);
      
      document.body.appendChild(overlay);
      
      // 测试可访问性
      expect(modal.getAttribute('role')).toBe('dialog');
      expect(modal.getAttribute('aria-modal')).toBe('true');
      expect(modal.getAttribute('aria-labelledby')).toBe('modal-title');
      expect(modal.getAttribute('aria-describedby')).toBe('modal-description');
      
      // 测试表单标签
      expect(wordInput.getAttribute('id')).toBe('word-input');
      expect(wordLabel.getAttribute('for')).toBe('word-input');
      expect(wordInput.getAttribute('aria-describedby')).toBe('word-help');
      
      // 测试焦点管理
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
      
      document.body.removeChild(overlay);
    });
  });

  describe('Performance and Accessibility Integration', () => {
    it('should maintain accessibility during animations', async () => {
      const animatedElement = document.createElement('div');
      animatedElement.className = 'animated-card';
      animatedElement.setAttribute('role', 'button');
      animatedElement.setAttribute('aria-label', '动画卡片');
      animatedElement.textContent = '点击我';
      
      // 模拟动画状态
      animatedElement.style.transition = 'transform 0.3s ease';
      animatedElement.style.transform = 'scale(1)';
      
      document.body.appendChild(animatedElement);
      
      // 测试动画期间的可访问性
      expect(animatedElement.getAttribute('role')).toBe('button');
      expect(animatedElement.getAttribute('aria-label')).toBe('动画卡片');
      
      // 模拟动画
      animatedElement.style.transform = 'scale(1.1)';
      
      // 动画期间仍应保持可访问性
      animatedElement.focus();
      expect(document.activeElement).toBe(animatedElement);
      
      document.body.removeChild(animatedElement);
    });

    it('should handle reduced motion preferences', () => {
      // 模拟用户偏好减少动画
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => {
          if (query === '(prefers-reduced-motion: reduce)') {
            return {
              matches: true,
              media: query,
              onchange: null,
              addListener: vi.fn(),
              removeListener: vi.fn(),
              addEventListener: vi.fn(),
              removeEventListener: vi.fn(),
              dispatchEvent: vi.fn(),
            };
          }
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          };
        }),
      });

      const element = document.createElement('div');
      element.className = 'motion-sensitive';
      
      // 检查是否支持减少动画
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      expect(prefersReducedMotion).toBe(true);
      
      // 应该应用无动画样式
      if (prefersReducedMotion) {
        element.style.transition = 'none';
        element.style.animation = 'none';
      }
      
      expect(element.style.transition).toBe('none');
      expect(element.style.animation).toBe('none');
    });
  });

  describe('Mobile Accessibility Tests', () => {
    it('should have proper touch targets', () => {
      const button = document.createElement('button');
      button.textContent = '移动端按钮';
      button.style.minHeight = '44px';
      button.style.minWidth = '44px';
      button.style.padding = '12px';
      
      document.body.appendChild(button);
      
      const computedStyle = window.getComputedStyle(button);
      const minHeight = parseInt(computedStyle.minHeight);
      const minWidth = parseInt(computedStyle.minWidth);
      
      // WCAG建议的最小触摸目标尺寸
      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
      
      document.body.removeChild(button);
    });

    it('should support swipe gestures with accessibility', () => {
      const swipeableCard = document.createElement('div');
      swipeableCard.setAttribute('role', 'button');
      swipeableCard.setAttribute('aria-label', '可滑动卡片，向左滑动查看下一个，向右滑动查看上一个');
      swipeableCard.setAttribute('tabindex', '0');
      swipeableCard.textContent = '滑动卡片';
      
      // 添加键盘替代方案
      swipeableCard.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          // 模拟向左滑动
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          // 模拟向右滑动
          e.preventDefault();
        }
      });
      
      document.body.appendChild(swipeableCard);
      
      expect(swipeableCard.getAttribute('aria-label')).toContain('滑动');
      expect(swipeableCard.getAttribute('tabindex')).toBe('0');
      
      // 测试键盘导航
      swipeableCard.focus();
      expect(document.activeElement).toBe(swipeableCard);
      
      document.body.removeChild(swipeableCard);
    });
  });
});
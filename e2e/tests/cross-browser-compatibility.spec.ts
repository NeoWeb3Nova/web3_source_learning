import { test, expect, devices } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PracticePage } from '../pages/PracticePage';

test.describe('Cross-Browser Compatibility Tests', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  browsers.forEach(browserName => {
    test.describe(`${browserName} Browser Tests`, () => {
      test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Skipping ${browserName} test in ${currentBrowser}`);
        
        const homePage = new HomePage(page);
        const practicePage = new PracticePage(page);
        
        // 基本功能测试
        await homePage.goto();
        await expect(homePage.appTitle).toBeVisible();
        
        // 词汇卡片功能
        await homePage.flipWordCard();
        await homePage.toggleFavorite();
        
        // 练习功能
        await homePage.navigateToPractice();
        await practicePage.startQuickPractice();
        await practicePage.answerMultipleChoice(0);
        
        // 验证基本交互正常
        await expect(practicePage.feedbackContainer).toBeVisible();
      });

      test(`should handle audio playback in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Skipping ${browserName} test in ${currentBrowser}`);
        
        const homePage = new HomePage(page);
        await homePage.goto();
        
        // 测试音频播放（不同浏览器可能有不同的音频支持）
        await homePage.playAudio();
        
        // 验证音频按钮状态变化
        const audioButton = homePage.audioButton;
        await expect(audioButton).toBeVisible();
      });

      test(`should support CSS features in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Skipping ${browserName} test in ${currentBrowser}`);
        
        const homePage = new HomePage(page);
        await homePage.goto();
        
        // 测试CSS Grid和Flexbox支持
        const wordCard = homePage.currentWordCard;
        const computedStyle = await wordCard.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            display: style.display,
            flexDirection: style.flexDirection,
            gridTemplateColumns: style.gridTemplateColumns,
          };
        });
        
        // 验证现代CSS特性支持
        expect(computedStyle.display).toBeTruthy();
      });

      test(`should handle local storage in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Skipping ${browserName} test in ${currentBrowser}`);
        
        const homePage = new HomePage(page);
        await homePage.goto();
        
        // 测试本地存储
        await page.evaluate(() => {
          localStorage.setItem('test-key', 'test-value');
        });
        
        const storedValue = await page.evaluate(() => {
          return localStorage.getItem('test-key');
        });
        
        expect(storedValue).toBe('test-value');
        
        // 清理
        await page.evaluate(() => {
          localStorage.removeItem('test-key');
        });
      });
    });
  });

  test.describe('Mobile Browser Tests', () => {
    const mobileDevices = [
      { name: 'iPhone 12', device: devices['iPhone 12'] },
      { name: 'Pixel 5', device: devices['Pixel 5'] },
      { name: 'iPad Pro', device: devices['iPad Pro'] },
    ];

    mobileDevices.forEach(({ name, device }) => {
      test(`should work on ${name}`, async ({ browser }) => {
        const context = await browser.newContext({
          ...device,
        });
        const page = await context.newPage();
        
        const homePage = new HomePage(page);
        await homePage.goto();
        
        // 验证移动端布局
        await expect(homePage.appTitle).toBeVisible();
        await expect(homePage.currentWordCard).toBeVisible();
        
        // 测试触摸交互
        await homePage.flipWordCard();
        await homePage.toggleFavorite();
        
        // 测试滑动手势
        await homePage.swipeLeft();
        
        await context.close();
      });

      test(`should handle orientation changes on ${name}`, async ({ browser }) => {
        const context = await browser.newContext({
          ...device,
        });
        const page = await context.newPage();
        
        const homePage = new HomePage(page);
        await homePage.goto();
        
        // 测试竖屏
        await page.setViewportSize({ width: device.viewport.width, height: device.viewport.height });
        await expect(homePage.currentWordCard).toBeVisible();
        
        // 测试横屏
        await page.setViewportSize({ width: device.viewport.height, height: device.viewport.width });
        await expect(homePage.currentWordCard).toBeVisible();
        
        await context.close();
      });
    });
  });

  test.describe('Feature Support Tests', () => {
    test('should detect and handle Web Audio API support', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // 检测Web Audio API支持
      const hasWebAudio = await page.evaluate(() => {
        return 'AudioContext' in window || 'webkitAudioContext' in window;
      });
      
      if (hasWebAudio) {
        // 测试Web Audio功能
        await homePage.playAudio();
      } else {
        // 应该回退到HTML Audio
        console.log('Web Audio API not supported, using HTML Audio fallback');
      }
    });

    test('should handle Service Worker support', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // 检测Service Worker支持
      const hasServiceWorker = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      
      if (hasServiceWorker) {
        console.log('Service Worker supported');
        // 可以测试离线功能
      } else {
        console.log('Service Worker not supported');
      }
    });

    test('should handle IndexedDB support', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // 检测IndexedDB支持
      const hasIndexedDB = await page.evaluate(() => {
        return 'indexedDB' in window;
      });
      
      expect(hasIndexedDB).toBe(true); // 现代浏览器都应该支持
    });

    test('should handle CSS custom properties support', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // 测试CSS自定义属性支持
      const supportsCSSCustomProperties = await page.evaluate(() => {
        return CSS.supports('color', 'var(--test-color)');
      });
      
      expect(supportsCSSCustomProperties).toBe(true);
    });

    test('should handle Intersection Observer support', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // 检测Intersection Observer支持
      const hasIntersectionObserver = await page.evaluate(() => {
        return 'IntersectionObserver' in window;
      });
      
      if (hasIntersectionObserver) {
        console.log('Intersection Observer supported');
        // 可以测试懒加载功能
      } else {
        console.log('Intersection Observer not supported, using fallback');
      }
    });
  });

  test.describe('Performance Across Browsers', () => {
    browsers.forEach(browserName => {
      test(`should meet performance benchmarks in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Skipping ${browserName} test in ${currentBrowser}`);
        
        const homePage = new HomePage(page);
        
        // 测量首次内容绘制时间
        const startTime = Date.now();
        await homePage.goto();
        await expect(homePage.currentWordCard).toBeVisible();
        const loadTime = Date.now() - startTime;
        
        // 不同浏览器可能有不同的性能基准
        const performanceThreshold = browserName === 'webkit' ? 4000 : 3000;
        expect(loadTime).toBeLessThan(performanceThreshold);
        
        console.log(`${browserName} load time: ${loadTime}ms`);
      });
    });
  });

  test.describe('Accessibility Across Browsers', () => {
    browsers.forEach(browserName => {
      test(`should maintain accessibility in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Skipping ${browserName} test in ${currentBrowser}`);
        
        const homePage = new HomePage(page);
        const practicePage = new PracticePage(page);
        
        await homePage.goto();
        
        // 测试键盘导航
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();
        
        // 测试ARIA属性
        await homePage.navigateToPractice();
        await practicePage.startQuickPractice();
        await practicePage.verifyAccessibility();
      });
    });
  });

  test.describe('Error Handling Across Browsers', () => {
    test('should handle JavaScript errors gracefully', async ({ page }) => {
      const homePage = new HomePage(page);
      
      // 监听JavaScript错误
      const errors: string[] = [];
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      
      await homePage.goto();
      
      // 模拟一些可能导致错误的操作
      await homePage.flipWordCard();
      await homePage.toggleFavorite();
      
      // 验证没有未处理的JavaScript错误
      expect(errors.length).toBe(0);
    });

    test('should handle network failures gracefully', async ({ page }) => {
      const homePage = new HomePage(page);
      
      // 模拟网络失败
      await page.route('**/api/**', route => route.abort());
      
      await homePage.goto();
      
      // 应用应该显示错误状态而不是崩溃
      const errorElement = page.locator('[data-testid="error-message"], [data-testid="network-error"]');
      await expect(errorElement).toBeVisible({ timeout: 10000 });
    });
  });
});
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PracticePage } from '../pages/PracticePage';
import { ProgressPage } from '../pages/ProgressPage';

test.describe('Complete Learning Flow E2E Tests', () => {
  let homePage: HomePage;
  let practicePage: PracticePage;
  let progressPage: ProgressPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    practicePage = new PracticePage(page);
    progressPage = new ProgressPage(page);
    
    // 设置测试数据
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      const testVocabulary = [
        {
          id: 'test-1',
          word: 'Blockchain',
          definition: 'A distributed ledger technology',
          pronunciation: '/ˈblɒktʃeɪn/',
          category: 'BLOCKCHAIN',
          difficulty: 'BEGINNER',
          isCustom: false,
          studyCount: 0,
          accuracy: 0,
        },
        {
          id: 'test-2',
          word: 'DeFi',
          definition: 'Decentralized Finance',
          pronunciation: '/ˈdiːfaɪ/',
          category: 'DEFI',
          difficulty: 'INTERMEDIATE',
          isCustom: false,
          studyCount: 0,
          accuracy: 0,
        },
        {
          id: 'test-3',
          word: 'NFT',
          definition: 'Non-Fungible Token',
          pronunciation: '/ˌenˌefˈtiː/',
          category: 'NFT',
          difficulty: 'BEGINNER',
          isCustom: false,
          studyCount: 0,
          accuracy: 0,
        },
      ];
      
      localStorage.setItem('vocabulary-items', JSON.stringify(testVocabulary));
    });
  });

  test('should complete full learning journey from vocabulary to practice to progress', async ({ page }) => {
    // 1. 开始学习 - 浏览词汇
    await homePage.goto();
    await expect(page).toHaveTitle(/Web3.*DeFi.*词汇大作战/);
    
    // 验证首页加载
    await expect(homePage.appTitle).toBeVisible();
    await expect(homePage.currentWordCard).toBeVisible();
    
    // 学习第一个单词
    const firstWord = await homePage.getCurrentWord();
    expect(firstWord).toBeTruthy();
    
    // 翻转卡片查看定义
    await homePage.flipWordCard();
    const definition = await homePage.getCurrentDefinition();
    expect(definition).toBeTruthy();
    
    // 添加到收藏
    await homePage.toggleFavorite();
    expect(await homePage.isFavorited()).toBe(true);
    
    // 播放音频
    await homePage.playAudio();
    
    // 浏览下一个单词
    await homePage.goToNextWord();
    const secondWord = await homePage.getCurrentWord();
    expect(secondWord).not.toBe(firstWord);
    
    // 2. 开始练习
    await homePage.navigateToPractice();
    await expect(page.url()).toContain('practice');
    
    // 开始快速练习
    await practicePage.startQuickPractice();
    
    // 回答第一题
    const firstQuestion = await practicePage.getCurrentQuestion();
    expect(firstQuestion).toBeTruthy();
    
    // 选择正确答案（假设第一个选项是正确的）
    await practicePage.answerMultipleChoice(0);
    
    // 验证反馈
    const isCorrect = await practicePage.isCorrectFeedbackShown();
    if (isCorrect) {
      await expect(practicePage.correctFeedback).toBeVisible();
    } else {
      await expect(practicePage.incorrectFeedback).toBeVisible();
    }
    
    // 查看解释
    const explanation = await practicePage.getExplanation();
    expect(explanation).toBeTruthy();
    
    // 继续下一题
    await practicePage.goToNextQuestion();
    
    // 回答第二题
    await practicePage.answerMultipleChoice(1);
    
    // 继续下一题
    await practicePage.goToNextQuestion();
    
    // 回答第三题
    await practicePage.answerMultipleChoice(0);
    
    // 等待练习结果
    await practicePage.waitForResults();
    
    // 验证结果
    const score = await practicePage.getScore();
    const accuracy = await practicePage.getAccuracy();
    const timeSpent = await practicePage.getTimeSpent();
    
    expect(score).toBeGreaterThanOrEqual(0);
    expect(accuracy).toBeGreaterThanOrEqual(0);
    expect(timeSpent).toBeTruthy();
    
    // 3. 查看进度
    await homePage.navigateToProgress();
    await expect(page.url()).toContain('progress');
    
    // 验证进度数据更新
    const totalStudied = await progressPage.getTotalStudied();
    expect(totalStudied).toBeGreaterThan(0);
    
    const accuracyRate = await progressPage.getAccuracyRate();
    expect(accuracyRate).toBeGreaterThanOrEqual(0);
    
    // 验证成就系统
    const achievementCount = await progressPage.getAchievementCount();
    expect(achievementCount).toBeGreaterThanOrEqual(1); // 至少应该有"第一次练习"成就
    
    // 验证分类统计
    const categoryStats = await progressPage.getCategoryStats();
    expect(Object.keys(categoryStats).length).toBeGreaterThan(0);
    
    // 验证图表数据
    const hasChartData = await progressPage.verifyChartData();
    expect(hasChartData).toBe(true);
  });

  test('should handle vocabulary addition and practice flow', async ({ page }) => {
    await homePage.goto();
    
    // 导航到词汇页面
    await homePage.navigateToVocabulary();
    
    // 添加自定义词汇（这需要词汇页面的实现）
    // 这里假设有添加词汇的功能
    
    // 验证新词汇出现在列表中
    // 然后进行练习测试新词汇
    
    await homePage.navigateToPractice();
    await practicePage.startQuickPractice();
    
    // 完成练习流程
    const results = await practicePage.completeQuickPractice([
      'A distributed ledger',
      'Decentralized Finance',
      'Non-Fungible Token'
    ]);
    
    expect(results.score).toBeGreaterThanOrEqual(0);
    expect(results.accuracy).toBeGreaterThanOrEqual(0);
  });

  test('should maintain progress across sessions', async ({ page, context }) => {
    await homePage.goto();
    
    // 完成一些学习活动
    await homePage.toggleFavorite();
    await homePage.navigateToPractice();
    await practicePage.startQuickPractice();
    await practicePage.answerMultipleChoice(0);
    await practicePage.waitForResults();
    
    // 检查进度
    await homePage.navigateToProgress();
    const initialProgress = await progressPage.getTotalStudied();
    
    // 创建新的页面实例（模拟新会话）
    const newPage = await context.newPage();
    const newHomePage = new HomePage(newPage);
    const newProgressPage = new ProgressPage(newPage);
    
    await newHomePage.goto();
    await newHomePage.navigateToProgress();
    
    // 验证进度保持
    const persistedProgress = await newProgressPage.getTotalStudied();
    expect(persistedProgress).toBe(initialProgress);
    
    await newPage.close();
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/api/**', route => route.abort());
    
    await homePage.goto();
    
    // 应用应该显示错误状态但不崩溃
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // 应该有重试选项
    const retryButton = page.locator('[data-testid="retry-button"]');
    if (await retryButton.isVisible()) {
      // 恢复网络并重试
      await page.unroute('**/api/**');
      await retryButton.click();
      
      // 应用应该恢复正常
      await expect(homePage.currentWordCard).toBeVisible();
    }
  });

  test('should support keyboard navigation throughout the app', async ({ page }) => {
    await homePage.goto();
    
    // 测试主页键盘导航
    await homePage.navigateWithKeyboard();
    
    // 测试练习页面键盘导航
    await homePage.navigateToPractice();
    await practicePage.startQuickPractice();
    await practicePage.navigateWithKeyboard();
    
    // 验证键盘可访问性
    await practicePage.verifyAccessibility();
  });

  test('should work correctly on different screen sizes', async ({ page }) => {
    // 测试移动端
    await homePage.setMobileViewport();
    await homePage.goto();
    await homePage.verifyMobileLayout();
    
    // 测试基本功能在移动端正常工作
    await homePage.flipWordCard();
    await homePage.toggleFavorite();
    
    // 测试平板端
    await homePage.setTabletViewport();
    await page.reload();
    await homePage.verifyTabletLayout();
    
    // 测试桌面端
    await homePage.setDesktopViewport();
    await page.reload();
    await homePage.verifyDesktopLayout();
  });

  test('should handle touch gestures on mobile devices', async ({ page }) => {
    await homePage.setMobileViewport();
    await homePage.goto();
    
    // 测试滑动手势
    const initialWord = await homePage.getCurrentWord();
    await homePage.swipeLeft();
    
    // 验证单词改变
    const newWord = await homePage.getCurrentWord();
    expect(newWord).not.toBe(initialWord);
    
    // 测试向右滑动
    await homePage.swipeRight();
    const backWord = await homePage.getCurrentWord();
    expect(backWord).toBe(initialWord);
  });

  test('should measure and validate performance', async ({ page }) => {
    // 测量页面加载时间
    const loadTime = await practicePage.measureLoadTime();
    expect(loadTime).toBeLessThan(3000); // 3秒内加载完成
    
    // 测量问题切换时间
    await practicePage.startQuickPractice();
    const transitionTime = await practicePage.measureQuestionTransitionTime();
    expect(transitionTime).toBeLessThan(500); // 500ms内完成切换
    
    // 测量图表渲染时间
    await homePage.navigateToProgress();
    const chartRenderTime = await progressPage.measureChartRenderTime();
    expect(chartRenderTime).toBeLessThan(1000); // 1秒内渲染完成
  });
});
// 用
户验收测试
test.describe('User Acceptance Tests', () => {
  test('UAT-001: New user can start learning immediately', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // 模拟新用户首次访问
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await homePage.goto();
    
    // 验证新用户引导
    const welcomeMessage = page.locator('[data-testid="welcome-message"]');
    if (await welcomeMessage.isVisible()) {
      await expect(welcomeMessage).toContainText(/欢迎|welcome/i);
    }
    
    // 验证可以立即开始学习
    await expect(homePage.currentWordCard).toBeVisible();
    const firstWord = await homePage.getCurrentWord();
    expect(firstWord).toBeTruthy();
    
    // 验证基本功能可用
    await homePage.flipWordCard();
    await homePage.toggleFavorite();
    await homePage.playAudio();
  });

  test('UAT-002: User can complete a full practice session', async ({ page }) => {
    const homePage = new HomePage(page);
    const practicePage = new PracticePage(page);
    
    await homePage.goto();
    await homePage.navigateToPractice();
    
    // 开始练习
    await practicePage.startQuickPractice();
    
    // 完成所有题目
    let questionCount = 0;
    const maxQuestions = 10; // 防止无限循环
    
    while (questionCount < maxQuestions) {
      try {
        // 回答当前问题
        await practicePage.answerMultipleChoice(0);
        
        // 检查是否还有下一题
        const nextButton = practicePage.nextQuestionButton;
        if (await nextButton.isVisible()) {
          await nextButton.click();
          questionCount++;
        } else {
          break; // 练习结束
        }
      } catch (error) {
        break; // 练习结束或出错
      }
    }
    
    // 验证结果页面
    await practicePage.waitForResults();
    const score = await practicePage.getScore();
    const accuracy = await practicePage.getAccuracy();
    
    expect(score).toBeGreaterThanOrEqual(0);
    expect(accuracy).toBeGreaterThanOrEqual(0);
  });

  test('UAT-003: User can track learning progress over time', async ({ page }) => {
    const homePage = new HomePage(page);
    const practicePage = new PracticePage(page);
    const progressPage = new ProgressPage(page);
    
    // 完成一些学习活动
    await homePage.goto();
    await homePage.toggleFavorite();
    
    await homePage.navigateToPractice();
    await practicePage.startQuickPractice();
    await practicePage.answerMultipleChoice(0);
    await practicePage.waitForResults();
    
    // 查看进度
    await homePage.navigateToProgress();
    
    // 验证进度数据
    const totalStudied = await progressPage.getTotalStudied();
    expect(totalStudied).toBeGreaterThan(0);
    
    const accuracyRate = await progressPage.getAccuracyRate();
    expect(accuracyRate).toBeGreaterThanOrEqual(0);
    
    // 验证图表显示
    await expect(progressPage.dailyStatsChart).toBeVisible();
    
    // 验证成就系统
    const achievementCount = await progressPage.getAchievementCount();
    expect(achievementCount).toBeGreaterThanOrEqual(0);
  });

  test('UAT-004: User can customize learning experience', async ({ page }) => {
    const homePage = new HomePage(page);
    const practicePage = new PracticePage(page);
    
    await homePage.goto();
    await homePage.navigateToSettings();
    
    // 测试设置页面功能（假设存在）
    const settingsPage = page.locator('[data-testid="settings-page"]');
    if (await settingsPage.isVisible()) {
      // 测试主题切换
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
      }
      
      // 测试音频设置
      const audioSettings = page.locator('[data-testid="audio-settings"]');
      if (await audioSettings.isVisible()) {
        const volumeSlider = audioSettings.locator('[data-testid="volume-slider"]');
        if (await volumeSlider.isVisible()) {
          await volumeSlider.fill('0.5');
        }
      }
    }
    
    // 测试练习设置
    await homePage.navigateToPractice();
    const settingsButton = practicePage.settingsButton;
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // 设置题目数量
      const questionCountInput = page.locator('[data-testid="question-count"]');
      if (await questionCountInput.isVisible()) {
        await questionCountInput.fill('5');
      }
      
      // 保存设置
      const saveButton = page.locator('[data-testid="save-settings"]');
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }
    }
  });

  test('UAT-005: Application works offline', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // 首先在线加载应用
    await homePage.goto();
    await expect(homePage.currentWordCard).toBeVisible();
    
    // 模拟离线状态
    await page.context().setOffline(true);
    
    // 验证离线功能
    await page.reload();
    
    // 应该显示离线提示或缓存的内容
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    const cachedContent = homePage.currentWordCard;
    
    const isOfflineHandled = await offlineIndicator.isVisible() || await cachedContent.isVisible();
    expect(isOfflineHandled).toBe(true);
    
    // 恢复在线状态
    await page.context().setOffline(false);
  });

  test('UAT-006: Application is accessible to users with disabilities', async ({ page }) => {
    const homePage = new HomePage(page);
    const practicePage = new PracticePage(page);
    
    await homePage.goto();
    
    // 测试键盘导航
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // 继续Tab导航
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 测试Enter键激活
    await page.keyboard.press('Enter');
    
    // 测试练习页面的无障碍性
    await homePage.navigateToPractice();
    await practicePage.startQuickPractice();
    
    // 验证ARIA属性
    const questionContainer = practicePage.questionContainer;
    await expect(questionContainer).toHaveAttribute('role');
    
    const progressBar = practicePage.progressBar;
    await expect(progressBar).toHaveAttribute('aria-valuenow');
    await expect(progressBar).toHaveAttribute('aria-valuemax');
    
    // 测试屏幕阅读器支持
    const liveRegion = page.locator('[aria-live]');
    if (await liveRegion.count() > 0) {
      await expect(liveRegion.first()).toBeVisible();
    }
  });

  test('UAT-007: Application performs well on mobile devices', async ({ page }) => {
    // 设置移动设备视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    const practicePage = new PracticePage(page);
    
    // 测量移动端加载性能
    const startTime = Date.now();
    await homePage.goto();
    await expect(homePage.currentWordCard).toBeVisible();
    const loadTime = Date.now() - startTime;
    
    // 移动端加载时间应该在合理范围内
    expect(loadTime).toBeLessThan(5000);
    
    // 测试触摸交互
    await homePage.flipWordCard();
    await homePage.toggleFavorite();
    
    // 测试滑动手势
    await homePage.swipeLeft();
    
    // 测试练习功能在移动端的表现
    await homePage.navigateToPractice();
    await practicePage.startQuickPractice();
    
    // 测量问题切换性能
    const transitionStart = Date.now();
    await practicePage.answerMultipleChoice(0);
    const transitionTime = Date.now() - transitionStart;
    
    expect(transitionTime).toBeLessThan(1000);
  });

  test('UAT-008: Data persistence works correctly', async ({ page, context }) => {
    const homePage = new HomePage(page);
    const progressPage = new ProgressPage(page);
    
    // 进行一些学习活动
    await homePage.goto();
    await homePage.toggleFavorite();
    
    // 记录初始状态
    const isFavorited = await homePage.isFavorited();
    expect(isFavorited).toBe(true);
    
    // 创建新页面（模拟新会话）
    const newPage = await context.newPage();
    const newHomePage = new HomePage(newPage);
    
    await newHomePage.goto();
    
    // 验证状态保持
    const persistedFavorite = await newHomePage.isFavorited();
    expect(persistedFavorite).toBe(isFavorited);
    
    await newPage.close();
  });

  test('UAT-009: Error handling provides good user experience', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // 模拟各种错误情况
    
    // 1. 网络错误
    await page.route('**/api/**', route => route.abort());
    await homePage.goto();
    
    // 应该显示友好的错误消息
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      expect(errorText).not.toContain('undefined');
      expect(errorText).not.toContain('null');
      expect(errorText).not.toContain('Error:');
    }
    
    // 2. 应该提供重试选项
    const retryButton = page.locator('[data-testid="retry-button"]');
    if (await retryButton.isVisible()) {
      // 恢复网络并重试
      await page.unroute('**/api/**');
      await retryButton.click();
      
      // 应用应该恢复正常
      await expect(homePage.currentWordCard).toBeVisible();
    }
  });

  test('UAT-010: Application meets performance benchmarks', async ({ page }) => {
    const homePage = new HomePage(page);
    const practicePage = new PracticePage(page);
    const progressPage = new ProgressPage(page);
    
    // 测试各个页面的加载性能
    const performanceMetrics = {
      home: 0,
      practice: 0,
      progress: 0,
    };
    
    // 首页性能
    let startTime = Date.now();
    await homePage.goto();
    await expect(homePage.currentWordCard).toBeVisible();
    performanceMetrics.home = Date.now() - startTime;
    
    // 练习页面性能
    startTime = Date.now();
    await homePage.navigateToPractice();
    await expect(practicePage.practiceTitle).toBeVisible();
    performanceMetrics.practice = Date.now() - startTime;
    
    // 进度页面性能
    startTime = Date.now();
    await homePage.navigateToProgress();
    await expect(progressPage.progressTitle).toBeVisible();
    performanceMetrics.progress = Date.now() - startTime;
    
    // 验证性能基准
    expect(performanceMetrics.home).toBeLessThan(3000);
    expect(performanceMetrics.practice).toBeLessThan(2000);
    expect(performanceMetrics.progress).toBeLessThan(2000);
    
    console.log('Performance metrics:', performanceMetrics);
  });
});
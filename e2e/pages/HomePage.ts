import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly appTitle: Locator;
  readonly navigationTabs: Locator;
  readonly vocabularyTab: Locator;
  readonly practiceTab: Locator;
  readonly progressTab: Locator;
  readonly settingsTab: Locator;
  readonly currentWordCard: Locator;
  readonly wordCardTitle: Locator;
  readonly wordCardDefinition: Locator;
  readonly favoriteButton: Locator;
  readonly audioButton: Locator;
  readonly nextWordButton: Locator;
  readonly previousWordButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.appTitle = page.locator('[data-testid="app-title"]');
    this.navigationTabs = page.locator('[role="tablist"]');
    this.vocabularyTab = page.locator('[role="tab"]', { hasText: /词汇|vocabulary/i });
    this.practiceTab = page.locator('[role="tab"]', { hasText: /练习|practice/i });
    this.progressTab = page.locator('[role="tab"]', { hasText: /进度|progress/i });
    this.settingsTab = page.locator('[role="tab"]', { hasText: /设置|settings/i });
    this.currentWordCard = page.locator('[data-testid="word-card"]');
    this.wordCardTitle = page.locator('[data-testid="word-title"]');
    this.wordCardDefinition = page.locator('[data-testid="word-definition"]');
    this.favoriteButton = page.locator('[data-testid="favorite-button"]');
    this.audioButton = page.locator('[data-testid="audio-button"]');
    this.nextWordButton = page.locator('[data-testid="next-word"]');
    this.previousWordButton = page.locator('[data-testid="previous-word"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.appTitle).toBeVisible();
  }

  async navigateToVocabulary() {
    await this.vocabularyTab.click();
    await this.page.waitForURL(/.*vocabulary.*/);
  }

  async navigateToPractice() {
    await this.practiceTab.click();
    await this.page.waitForURL(/.*practice.*/);
  }

  async navigateToProgress() {
    await this.progressTab.click();
    await this.page.waitForURL(/.*progress.*/);
  }

  async navigateToSettings() {
    await this.settingsTab.click();
    await this.page.waitForURL(/.*settings.*/);
  }

  async flipWordCard() {
    await this.currentWordCard.click();
    await expect(this.wordCardDefinition).toBeVisible();
  }

  async toggleFavorite() {
    const initialState = await this.favoriteButton.getAttribute('aria-pressed');
    await this.favoriteButton.click();
    
    // 等待状态改变
    await expect(this.favoriteButton).toHaveAttribute(
      'aria-pressed', 
      initialState === 'true' ? 'false' : 'true'
    );
  }

  async playAudio() {
    await this.audioButton.click();
    // 可以添加音频播放的验证逻辑
  }

  async goToNextWord() {
    const currentWord = await this.wordCardTitle.textContent();
    await this.nextWordButton.click();
    
    // 等待单词改变
    await expect(this.wordCardTitle).not.toHaveText(currentWord || '');
  }

  async goToPreviousWord() {
    const currentWord = await this.wordCardTitle.textContent();
    await this.previousWordButton.click();
    
    // 等待单词改变
    await expect(this.wordCardTitle).not.toHaveText(currentWord || '');
  }

  async getCurrentWord() {
    return await this.wordCardTitle.textContent();
  }

  async getCurrentDefinition() {
    return await this.wordCardDefinition.textContent();
  }

  async isFavorited() {
    const ariaPressed = await this.favoriteButton.getAttribute('aria-pressed');
    return ariaPressed === 'true';
  }

  // 键盘导航测试
  async navigateWithKeyboard() {
    // Tab到第一个可聚焦元素
    await this.page.keyboard.press('Tab');
    
    // 使用箭头键导航标签
    await this.page.keyboard.press('ArrowRight');
    await this.page.keyboard.press('ArrowLeft');
    
    // 使用Enter激活
    await this.page.keyboard.press('Enter');
  }

  // 触摸手势模拟
  async swipeLeft() {
    const cardBounds = await this.currentWordCard.boundingBox();
    if (cardBounds) {
      await this.page.touchscreen.tap(cardBounds.x + cardBounds.width / 2, cardBounds.y + cardBounds.height / 2);
      await this.page.mouse.move(cardBounds.x + cardBounds.width / 2, cardBounds.y + cardBounds.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(cardBounds.x + cardBounds.width / 4, cardBounds.y + cardBounds.height / 2);
      await this.page.mouse.up();
    }
  }

  async swipeRight() {
    const cardBounds = await this.currentWordCard.boundingBox();
    if (cardBounds) {
      await this.page.touchscreen.tap(cardBounds.x + cardBounds.width / 2, cardBounds.y + cardBounds.height / 2);
      await this.page.mouse.move(cardBounds.x + cardBounds.width / 2, cardBounds.y + cardBounds.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(cardBounds.x + (cardBounds.width * 3) / 4, cardBounds.y + cardBounds.height / 2);
      await this.page.mouse.up();
    }
  }

  // 响应式测试辅助方法
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1200, height: 800 });
  }

  // 验证响应式布局
  async verifyMobileLayout() {
    await expect(this.navigationTabs).toHaveClass(/mobile|bottom/);
  }

  async verifyTabletLayout() {
    await expect(this.navigationTabs).toHaveClass(/tablet|side/);
  }

  async verifyDesktopLayout() {
    await expect(this.navigationTabs).toHaveClass(/desktop|top/);
  }
}
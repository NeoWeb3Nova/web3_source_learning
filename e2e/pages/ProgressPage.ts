import { Page, Locator, expect } from '@playwright/test';

export class ProgressPage {
  readonly page: Page;
  readonly progressTitle: Locator;
  readonly overallStats: Locator;
  readonly totalStudiedCount: Locator;
  readonly accuracyRate: Locator;
  readonly currentStreak: Locator;
  readonly longestStreak: Locator;
  readonly studyTimeTotal: Locator;
  readonly dailyStatsChart: Locator;
  readonly weeklyView: Locator;
  readonly monthlyView: Locator;
  readonly achievementsList: Locator;
  readonly achievementBadges: Locator;
  readonly categoryBreakdown: Locator;
  readonly difficultyBreakdown: Locator;
  readonly masteredWords: Locator;
  readonly strugglingWords: Locator;
  readonly recentActivity: Locator;
  readonly studyGoals: Locator;
  readonly setGoalButton: Locator;
  readonly exportDataButton: Locator;
  readonly resetProgressButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.progressTitle = page.locator('[data-testid="progress-title"]');
    this.overallStats = page.locator('[data-testid="overall-stats"]');
    this.totalStudiedCount = page.locator('[data-testid="total-studied"]');
    this.accuracyRate = page.locator('[data-testid="accuracy-rate"]');
    this.currentStreak = page.locator('[data-testid="current-streak"]');
    this.longestStreak = page.locator('[data-testid="longest-streak"]');
    this.studyTimeTotal = page.locator('[data-testid="study-time-total"]');
    this.dailyStatsChart = page.locator('[data-testid="daily-stats-chart"]');
    this.weeklyView = page.locator('[data-testid="weekly-view"]');
    this.monthlyView = page.locator('[data-testid="monthly-view"]');
    this.achievementsList = page.locator('[data-testid="achievements-list"]');
    this.achievementBadges = page.locator('[data-testid="achievement-badge"]');
    this.categoryBreakdown = page.locator('[data-testid="category-breakdown"]');
    this.difficultyBreakdown = page.locator('[data-testid="difficulty-breakdown"]');
    this.masteredWords = page.locator('[data-testid="mastered-words"]');
    this.strugglingWords = page.locator('[data-testid="struggling-words"]');
    this.recentActivity = page.locator('[data-testid="recent-activity"]');
    this.studyGoals = page.locator('[data-testid="study-goals"]');
    this.setGoalButton = page.locator('[data-testid="set-goal"]');
    this.exportDataButton = page.locator('[data-testid="export-data"]');
    this.resetProgressButton = page.locator('[data-testid="reset-progress"]');
  }

  async goto() {
    await this.page.goto('/progress');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.progressTitle).toBeVisible();
    await expect(this.overallStats).toBeVisible();
  }

  async getTotalStudied() {
    const text = await this.totalStudiedCount.textContent();
    return text ? parseInt(text.replace(/\D/g, '')) : 0;
  }

  async getAccuracyRate() {
    const text = await this.accuracyRate.textContent();
    return text ? parseFloat(text.replace(/[^\d.]/g, '')) : 0;
  }

  async getCurrentStreak() {
    const text = await this.currentStreak.textContent();
    return text ? parseInt(text.replace(/\D/g, '')) : 0;
  }

  async getLongestStreak() {
    const text = await this.longestStreak.textContent();
    return text ? parseInt(text.replace(/\D/g, '')) : 0;
  }

  async getStudyTimeTotal() {
    return await this.studyTimeTotal.textContent();
  }

  async switchToWeeklyView() {
    await this.weeklyView.click();
    await this.page.waitForTimeout(500); // 等待图表更新
  }

  async switchToMonthlyView() {
    await this.monthlyView.click();
    await this.page.waitForTimeout(500); // 等待图表更新
  }

  async getAchievementCount() {
    const badges = await this.achievementBadges.all();
    return badges.length;
  }

  async getAchievementTitles() {
    const badges = await this.achievementBadges.all();
    const titles = [];
    for (const badge of badges) {
      const title = await badge.getAttribute('title') || await badge.textContent();
      if (title) titles.push(title);
    }
    return titles;
  }

  async getCategoryStats() {
    const categories = await this.categoryBreakdown.locator('[data-testid="category-stat"]').all();
    const stats: Record<string, number> = {};
    
    for (const category of categories) {
      const name = await category.locator('[data-testid="category-name"]').textContent();
      const count = await category.locator('[data-testid="category-count"]').textContent();
      if (name && count) {
        stats[name] = parseInt(count.replace(/\D/g, ''));
      }
    }
    
    return stats;
  }

  async getDifficultyStats() {
    const difficulties = await this.difficultyBreakdown.locator('[data-testid="difficulty-stat"]').all();
    const stats: Record<string, number> = {};
    
    for (const difficulty of difficulties) {
      const name = await difficulty.locator('[data-testid="difficulty-name"]').textContent();
      const count = await difficulty.locator('[data-testid="difficulty-count"]').textContent();
      if (name && count) {
        stats[name] = parseInt(count.replace(/\D/g, ''));
      }
    }
    
    return stats;
  }

  async getMasteredWordsCount() {
    const text = await this.masteredWords.textContent();
    return text ? parseInt(text.replace(/\D/g, '')) : 0;
  }

  async getStrugglingWordsCount() {
    const text = await this.strugglingWords.textContent();
    return text ? parseInt(text.replace(/\D/g, '')) : 0;
  }

  async getRecentActivities() {
    const activities = await this.recentActivity.locator('[data-testid="activity-item"]').all();
    const activityList = [];
    
    for (const activity of activities) {
      const text = await activity.textContent();
      const timestamp = await activity.locator('[data-testid="activity-time"]').textContent();
      if (text) {
        activityList.push({ text, timestamp });
      }
    }
    
    return activityList;
  }

  async setStudyGoal(goalType: 'daily' | 'weekly' | 'monthly', target: number) {
    await this.setGoalButton.click();
    
    // 等待目标设置对话框
    const goalDialog = this.page.locator('[data-testid="goal-dialog"]');
    await expect(goalDialog).toBeVisible();
    
    // 选择目标类型
    const goalTypeSelect = goalDialog.locator('[data-testid="goal-type"]');
    await goalTypeSelect.selectOption(goalType);
    
    // 设置目标数值
    const targetInput = goalDialog.locator('[data-testid="goal-target"]');
    await targetInput.fill(target.toString());
    
    // 保存目标
    const saveButton = goalDialog.locator('[data-testid="save-goal"]');
    await saveButton.click();
    
    // 等待对话框关闭
    await expect(goalDialog).not.toBeVisible();
  }

  async exportData() {
    // 监听下载事件
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportDataButton.click();
    const download = await downloadPromise;
    
    return {
      filename: download.suggestedFilename(),
      path: await download.path(),
    };
  }

  async resetProgress() {
    await this.resetProgressButton.click();
    
    // 等待确认对话框
    const confirmDialog = this.page.locator('[data-testid="confirm-reset"]');
    await expect(confirmDialog).toBeVisible();
    
    // 确认重置
    const confirmButton = confirmDialog.locator('[data-testid="confirm-button"]');
    await confirmButton.click();
    
    // 等待重置完成
    await expect(confirmDialog).not.toBeVisible();
    await this.waitForLoad();
  }

  // 验证图表数据
  async verifyChartData() {
    await expect(this.dailyStatsChart).toBeVisible();
    
    // 检查图表是否有数据点
    const dataPoints = this.dailyStatsChart.locator('[data-testid="chart-point"]');
    const count = await dataPoints.count();
    
    return count > 0;
  }

  // 验证成就系统
  async verifyAchievementSystem() {
    const achievements = await this.getAchievementTitles();
    
    // 验证基础成就是否存在
    const expectedAchievements = [
      '第一个单词',
      '连续学习',
      '准确率达人',
      '时间管理者',
    ];
    
    const hasBasicAchievements = expectedAchievements.some(achievement =>
      achievements.some(title => title.includes(achievement))
    );
    
    return hasBasicAchievements;
  }

  // 验证数据一致性
  async verifyDataConsistency() {
    const totalStudied = await this.getTotalStudied();
    const categoryStats = await this.getCategoryStats();
    const difficultyStats = await getDifficultyStats();
    
    // 验证分类统计总和是否等于总学习数
    const categoryTotal = Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
    const difficultyTotal = Object.values(difficultyStats).reduce((sum, count) => sum + count, 0);
    
    return {
      totalStudied,
      categoryTotal,
      difficultyTotal,
      categoryConsistent: Math.abs(totalStudied - categoryTotal) <= 1, // 允许1的误差
      difficultyConsistent: Math.abs(totalStudied - difficultyTotal) <= 1,
    };
  }

  // 性能测试
  async measureChartRenderTime() {
    const startTime = Date.now();
    await this.switchToWeeklyView();
    await expect(this.dailyStatsChart).toBeVisible();
    const endTime = Date.now();
    
    return endTime - startTime;
  }

  // 响应式测试
  async verifyMobileLayout() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    await this.waitForLoad();
    
    // 验证移动端布局
    await expect(this.overallStats).toHaveClass(/mobile|stack/);
  }

  async verifyTabletLayout() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.reload();
    await this.waitForLoad();
    
    // 验证平板布局
    await expect(this.overallStats).toHaveClass(/tablet|grid/);
  }
}
import { Page, Locator, expect } from '@playwright/test';

export class PracticePage {
  readonly page: Page;
  readonly practiceTitle: Locator;
  readonly startPracticeButton: Locator;
  readonly quickPracticeButton: Locator;
  readonly timedPracticeButton: Locator;
  readonly reviewPracticeButton: Locator;
  readonly settingsButton: Locator;
  readonly questionContainer: Locator;
  readonly questionText: Locator;
  readonly optionsContainer: Locator;
  readonly multipleChoiceOptions: Locator;
  readonly fillBlankInput: Locator;
  readonly submitAnswerButton: Locator;
  readonly nextQuestionButton: Locator;
  readonly previousQuestionButton: Locator;
  readonly progressBar: Locator;
  readonly timer: Locator;
  readonly feedbackContainer: Locator;
  readonly correctFeedback: Locator;
  readonly incorrectFeedback: Locator;
  readonly explanationText: Locator;
  readonly resultsContainer: Locator;
  readonly scoreDisplay: Locator;
  readonly accuracyDisplay: Locator;
  readonly timeSpentDisplay: Locator;
  readonly restartButton: Locator;
  readonly exitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.practiceTitle = page.locator('[data-testid="practice-title"]');
    this.startPracticeButton = page.locator('[data-testid="start-practice"]');
    this.quickPracticeButton = page.locator('[data-testid="quick-practice"]');
    this.timedPracticeButton = page.locator('[data-testid="timed-practice"]');
    this.reviewPracticeButton = page.locator('[data-testid="review-practice"]');
    this.settingsButton = page.locator('[data-testid="practice-settings"]');
    this.questionContainer = page.locator('[data-testid="question-container"]');
    this.questionText = page.locator('[data-testid="question-text"]');
    this.optionsContainer = page.locator('[data-testid="options-container"]');
    this.multipleChoiceOptions = page.locator('[data-testid="option"]');
    this.fillBlankInput = page.locator('[data-testid="fill-blank-input"]');
    this.submitAnswerButton = page.locator('[data-testid="submit-answer"]');
    this.nextQuestionButton = page.locator('[data-testid="next-question"]');
    this.previousQuestionButton = page.locator('[data-testid="previous-question"]');
    this.progressBar = page.locator('[role="progressbar"]');
    this.timer = page.locator('[data-testid="timer"]');
    this.feedbackContainer = page.locator('[data-testid="feedback"]');
    this.correctFeedback = page.locator('[data-testid="correct-feedback"]');
    this.incorrectFeedback = page.locator('[data-testid="incorrect-feedback"]');
    this.explanationText = page.locator('[data-testid="explanation"]');
    this.resultsContainer = page.locator('[data-testid="results"]');
    this.scoreDisplay = page.locator('[data-testid="score"]');
    this.accuracyDisplay = page.locator('[data-testid="accuracy"]');
    this.timeSpentDisplay = page.locator('[data-testid="time-spent"]');
    this.restartButton = page.locator('[data-testid="restart-practice"]');
    this.exitButton = page.locator('[data-testid="exit-practice"]');
  }

  async goto() {
    await this.page.goto('/practice');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.practiceTitle).toBeVisible();
  }

  async startQuickPractice() {
    await this.quickPracticeButton.click();
    await this.waitForQuestionLoad();
  }

  async startTimedPractice() {
    await this.timedPracticeButton.click();
    await this.waitForQuestionLoad();
  }

  async startReviewPractice() {
    await this.reviewPracticeButton.click();
    await this.waitForQuestionLoad();
  }

  async waitForQuestionLoad() {
    await expect(this.questionContainer).toBeVisible();
    await expect(this.questionText).toBeVisible();
  }

  async answerMultipleChoice(optionIndex: number) {
    const options = await this.multipleChoiceOptions.all();
    if (options[optionIndex]) {
      await options[optionIndex].click();
      await this.waitForFeedback();
    }
  }

  async answerMultipleChoiceByText(optionText: string) {
    const option = this.multipleChoiceOptions.filter({ hasText: optionText });
    await option.click();
    await this.waitForFeedback();
  }

  async answerFillBlank(answer: string) {
    await this.fillBlankInput.fill(answer);
    await this.submitAnswerButton.click();
    await this.waitForFeedback();
  }

  async waitForFeedback() {
    await expect(this.feedbackContainer).toBeVisible();
  }

  async goToNextQuestion() {
    await this.nextQuestionButton.click();
    await this.waitForQuestionLoad();
  }

  async goToPreviousQuestion() {
    await this.previousQuestionButton.click();
    await this.waitForQuestionLoad();
  }

  async getCurrentQuestion() {
    return await this.questionText.textContent();
  }

  async getProgressPercentage() {
    const progressValue = await this.progressBar.getAttribute('aria-valuenow');
    const progressMax = await this.progressBar.getAttribute('aria-valuemax');
    return progressValue && progressMax ? 
      (parseInt(progressValue) / parseInt(progressMax)) * 100 : 0;
  }

  async getRemainingTime() {
    const timerText = await this.timer.textContent();
    return timerText || '0:00';
  }

  async isCorrectFeedbackShown() {
    return await this.correctFeedback.isVisible();
  }

  async isIncorrectFeedbackShown() {
    return await this.incorrectFeedback.isVisible();
  }

  async getExplanation() {
    return await this.explanationText.textContent();
  }

  async waitForResults() {
    await expect(this.resultsContainer).toBeVisible();
  }

  async getScore() {
    const scoreText = await this.scoreDisplay.textContent();
    return scoreText ? parseInt(scoreText.replace(/\D/g, '')) : 0;
  }

  async getAccuracy() {
    const accuracyText = await this.accuracyDisplay.textContent();
    return accuracyText ? parseFloat(accuracyText.replace(/[^\d.]/g, '')) : 0;
  }

  async getTimeSpent() {
    return await this.timeSpentDisplay.textContent();
  }

  async restartPractice() {
    await this.restartButton.click();
    await this.waitForQuestionLoad();
  }

  async exitPractice() {
    await this.exitButton.click();
    // 可能会有确认对话框
    const confirmButton = this.page.locator('[data-testid="confirm-exit"]');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }

  // 完整练习流程
  async completeQuickPractice(answers: string[]) {
    await this.startQuickPractice();
    
    for (let i = 0; i < answers.length; i++) {
      await this.answerMultipleChoiceByText(answers[i]);
      
      // 如果不是最后一题，点击下一题
      if (i < answers.length - 1) {
        await this.goToNextQuestion();
      }
    }
    
    await this.waitForResults();
    return {
      score: await this.getScore(),
      accuracy: await this.getAccuracy(),
      timeSpent: await this.getTimeSpent(),
    };
  }

  // 计时练习流程
  async completeTimedPractice(answers: string[], timeLimit: number) {
    await this.startTimedPractice();
    
    const startTime = Date.now();
    
    for (let i = 0; i < answers.length; i++) {
      // 检查是否还有时间
      const elapsed = Date.now() - startTime;
      if (elapsed > timeLimit * 1000) {
        break; // 时间到了
      }
      
      await this.answerMultipleChoiceByText(answers[i]);
      
      if (i < answers.length - 1) {
        await this.goToNextQuestion();
      }
    }
    
    await this.waitForResults();
    return {
      score: await this.getScore(),
      accuracy: await this.getAccuracy(),
      timeSpent: await this.getTimeSpent(),
    };
  }

  // 键盘导航测试
  async navigateWithKeyboard() {
    // Tab到选项
    await this.page.keyboard.press('Tab');
    
    // 使用箭头键选择选项
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('ArrowUp');
    
    // 使用空格键选择
    await this.page.keyboard.press('Space');
  }

  // 验证无障碍性
  async verifyAccessibility() {
    // 检查ARIA属性
    await expect(this.progressBar).toHaveAttribute('role', 'progressbar');
    await expect(this.progressBar).toHaveAttribute('aria-valuenow');
    await expect(this.progressBar).toHaveAttribute('aria-valuemax');
    
    // 检查键盘可访问性
    await this.questionContainer.focus();
    await expect(this.questionContainer).toBeFocused();
  }

  // 性能测试辅助方法
  async measureLoadTime() {
    const startTime = Date.now();
    await this.goto();
    const endTime = Date.now();
    return endTime - startTime;
  }

  async measureQuestionTransitionTime() {
    const startTime = Date.now();
    await this.goToNextQuestion();
    const endTime = Date.now();
    return endTime - startTime;
  }
}
# 端到端测试 (E2E Tests)

## 概述

本项目使用 Playwright 进行端到端测试，确保应用在真实浏览器环境中的完整功能和用户体验。

## 测试架构

### 页面对象模型 (Page Object Model)

我们使用页面对象模型来组织测试代码，提高可维护性和复用性：

- `HomePage.ts` - 首页相关的操作和验证
- `PracticePage.ts` - 练习页面的功能测试
- `ProgressPage.ts` - 进度页面的数据验证

### 测试分类

#### 1. 完整学习流程测试 (`complete-learning-flow.spec.ts`)
- 新用户完整学习旅程
- 词汇学习到练习到进度追踪的完整流程
- 数据持久化验证
- 用户验收测试 (UAT)

#### 2. 跨浏览器兼容性测试 (`cross-browser-compatibility.spec.ts`)
- Chrome、Firefox、Safari 兼容性
- 移动设备兼容性 (iPhone、Android、iPad)
- 功能特性支持检测
- 性能基准测试

## 运行测试

### 基本命令

```bash
# 安装 Playwright 浏览器
npx playwright install

# 运行所有 E2E 测试
npm run test:e2e

# 运行测试并显示浏览器界面
npm run test:e2e:headed

# 使用 UI 模式运行测试
npm run test:e2e:ui

# 调试模式运行测试
npm run test:e2e:debug

# 查看测试报告
npm run test:e2e:report

# 运行跨浏览器测试
npm run test:cross-browser

# 运行用户验收测试
npm run test:user-acceptance

# 运行所有测试（单元测试 + E2E）
npm run test:all
```

### 特定浏览器测试

```bash
# 只在 Chrome 中运行
npx playwright test --project=chromium

# 只在 Firefox 中运行
npx playwright test --project=firefox

# 只在 Safari 中运行
npx playwright test --project=webkit

# 移动设备测试
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## 测试配置

### 浏览器配置

测试在以下浏览器和设备上运行：

- **桌面浏览器**:
  - Chrome (Chromium)
  - Firefox
  - Safari (WebKit)
  - Microsoft Edge

- **移动设备**:
  - iPhone 12 (Mobile Safari)
  - Pixel 5 (Mobile Chrome)
  - iPad Pro

### 环境配置

- **Base URL**: `http://localhost:4173`
- **超时设置**: 30秒
- **重试次数**: CI环境2次，本地0次
- **并行执行**: CI环境串行，本地并行

## 测试数据管理

### 全局设置 (`global-setup.ts`)

在测试开始前：
- 等待应用启动
- 清理本地存储
- 注入测试数据
- 验证应用可用性

### 测试数据

每个测试使用预定义的词汇数据：

```typescript
const testVocabulary = [
  {
    id: 'test-1',
    word: 'Blockchain',
    definition: 'A distributed ledger technology',
    category: 'BLOCKCHAIN',
    difficulty: 'BEGINNER',
  },
  // ... 更多测试数据
];
```

## 页面对象使用示例

### HomePage 使用

```typescript
import { HomePage } from '../pages/HomePage';

test('should navigate and interact with home page', async ({ page }) => {
  const homePage = new HomePage(page);
  
  await homePage.goto();
  await homePage.flipWordCard();
  await homePage.toggleFavorite();
  await homePage.playAudio();
  await homePage.goToNextWord();
});
```

### PracticePage 使用

```typescript
import { PracticePage } from '../pages/PracticePage';

test('should complete practice session', async ({ page }) => {
  const practicePage = new PracticePage(page);
  
  await practicePage.goto();
  await practicePage.startQuickPractice();
  await practicePage.answerMultipleChoice(0);
  await practicePage.waitForResults();
  
  const score = await practicePage.getScore();
  expect(score).toBeGreaterThanOrEqual(0);
});
```

## 测试最佳实践

### 1. 等待策略

```typescript
// ✅ 等待元素可见
await expect(page.locator('[data-testid="element"]')).toBeVisible();

// ✅ 等待网络空闲
await page.waitForLoadState('networkidle');

// ❌ 避免固定等待
await page.waitForTimeout(1000);
```

### 2. 选择器策略

```typescript
// ✅ 使用 data-testid
page.locator('[data-testid="submit-button"]')

// ✅ 使用语义化选择器
page.locator('role=button[name="Submit"]')

// ❌ 避免脆弱的选择器
page.locator('.btn.btn-primary.submit-btn')
```

### 3. 断言策略

```typescript
// ✅ 使用 Playwright 断言
await expect(page.locator('[data-testid="result"]')).toContainText('Success');

// ✅ 验证状态变化
await expect(button).toHaveAttribute('aria-pressed', 'true');

// ❌ 避免直接比较
const text = await element.textContent();
expect(text).toBe('Expected text');
```

## 调试测试

### 1. 使用调试模式

```bash
npm run test:e2e:debug
```

### 2. 截图和录像

测试失败时自动生成：
- 截图: `test-results/`
- 录像: `test-results/`
- 追踪: `test-results/`

### 3. 浏览器开发者工具

```typescript
// 在测试中暂停并打开开发者工具
await page.pause();
```

## 持续集成

### GitHub Actions 集成

E2E 测试在以下情况下运行：
- Pull Request
- 推送到 main/develop 分支
- 定时任务（每日）

### 测试报告

- HTML 报告: `playwright-report/index.html`
- JSON 结果: `playwright-report/results.json`
- JUnit XML: `playwright-report/results.xml`

## 性能监控

### 性能基准

- 页面加载时间: < 3秒
- 交互响应时间: < 500ms
- 图表渲染时间: < 1秒

### 性能测试

```typescript
test('should meet performance benchmarks', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await expect(page.locator('[data-testid="content"]')).toBeVisible();
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
});
```

## 无障碍测试

### 键盘导航

```typescript
test('should support keyboard navigation', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
});
```

### ARIA 属性验证

```typescript
test('should have proper ARIA attributes', async ({ page }) => {
  await page.goto('/');
  
  const button = page.locator('[role="button"]');
  await expect(button).toHaveAttribute('aria-label');
  await expect(button).toHaveAttribute('tabindex', '0');
});
```

## 故障排除

### 常见问题

1. **测试超时**
   - 增加超时时间
   - 检查网络连接
   - 验证应用是否正常启动

2. **元素未找到**
   - 检查选择器是否正确
   - 确认元素是否已渲染
   - 使用更稳定的选择器

3. **跨浏览器差异**
   - 检查浏览器特定的行为
   - 使用条件测试
   - 验证功能支持

### 调试技巧

```typescript
// 打印页面内容
console.log(await page.content());

// 打印元素信息
console.log(await element.innerHTML());

// 截图调试
await page.screenshot({ path: 'debug.png' });

// 录制视频
await page.video()?.path();
```

## 测试覆盖范围

### 功能覆盖

- ✅ 词汇学习流程
- ✅ 练习和测试功能
- ✅ 进度追踪系统
- ✅ 用户设置和偏好
- ✅ 数据持久化
- ✅ 错误处理

### 平台覆盖

- ✅ 桌面浏览器 (Chrome, Firefox, Safari)
- ✅ 移动设备 (iOS, Android)
- ✅ 平板设备 (iPad)
- ✅ 不同屏幕尺寸

### 用户场景覆盖

- ✅ 新用户首次使用
- ✅ 老用户继续学习
- ✅ 离线使用场景
- ✅ 错误恢复场景
- ✅ 性能压力场景

## 总结

E2E 测试确保了应用在真实环境中的可靠性和用户体验质量。通过全面的测试覆盖和持续的监控，我们能够及时发现和修复问题，为用户提供稳定可靠的学习体验。
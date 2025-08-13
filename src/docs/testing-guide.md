# 测试指南

## 概述

本项目采用全面的测试策略，包括单元测试、集成测试、无障碍测试和性能测试，确保应用的质量和可靠性。

## 测试架构

### 测试框架
- **Vitest**: 现代化的测试框架，提供快速的测试执行和优秀的开发体验
- **React Testing Library**: 专注于用户行为的组件测试
- **jsdom**: 浏览器环境模拟

### 测试分类

#### 1. 单元测试 (Unit Tests)
测试独立的函数、组件和模块。

**覆盖范围:**
- 工具函数 (`src/utils/`)
- React Hooks (`src/hooks/`)
- 服务层 (`src/services/`)
- 类型定义和验证

**示例:**
```typescript
// 测试工具函数
describe('colorContrast utils', () => {
  it('should calculate correct contrast ratio', () => {
    const ratio = ContrastCalculator.getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBe(21);
  });
});

// 测试React Hook
describe('useAudio hook', () => {
  it('should play audio from URL', async () => {
    const { result } = renderHook(() => useAudio());
    await act(async () => {
      await result.current.play('https://example.com/audio.mp3');
    });
    expect(result.current.isPlaying).toBe(true);
  });
});
```

#### 2. 组件测试 (Component Tests)
测试React组件的渲染、交互和状态管理。

**覆盖范围:**
- 基础组件 (`src/components/common/`)
- 词汇组件 (`src/components/vocabulary/`)
- 练习组件 (`src/components/practice/`)
- 进度组件 (`src/components/progress/`)

**示例:**
```typescript
describe('WordCard Component', () => {
  it('should render word card with basic information', () => {
    render(<WordCard word={mockWord} />);
    expect(screen.getByText('Blockchain')).toBeInTheDocument();
    expect(screen.getByText('BEGINNER')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    render(<WordCard word={mockWord} onFlip={onFlip} />);
    const card = screen.getByRole('button');
    await user.keyboard('{Enter}');
    expect(onFlip).toHaveBeenCalled();
  });
});
```

#### 3. 上下文测试 (Context Tests)
测试React Context和状态管理。

**覆盖范围:**
- VocabularyContext
- ProgressContext
- ErrorContext

**示例:**
```typescript
describe('VocabularyContext', () => {
  it('should load vocabulary successfully', async () => {
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: VocabularyProvider,
    });
    
    await act(async () => {
      await result.current.loadVocabulary();
    });
    
    expect(result.current.vocabulary).toEqual(mockVocabularyItems);
  });
});
```

#### 4. 集成测试 (Integration Tests)
测试多个组件和系统的协同工作。

**覆盖范围:**
- 完整用户流程
- 页面级交互
- 数据流测试

**示例:**
```typescript
describe('Practice Flow Integration', () => {
  it('should complete a full practice session', async () => {
    render(<Practice />);
    
    // 开始练习
    fireEvent.click(screen.getByText(/开始练习/i));
    
    // 回答问题
    fireEvent.click(screen.getByText('A distributed ledger'));
    
    // 完成练习
    await waitFor(() => {
      expect(screen.getByText(/练习结果/i)).toBeInTheDocument();
    });
  });
});
```

#### 5. 无障碍测试 (Accessibility Tests)
确保应用符合WCAG标准和无障碍访问要求。

**测试内容:**
- ARIA标签和属性
- 键盘导航
- 颜色对比度
- 屏幕阅读器支持
- 焦点管理

**示例:**
```typescript
describe('Accessibility Tests', () => {
  it('should have proper ARIA labels', () => {
    render(<WordCard word={mockWord} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });

  it('should meet color contrast requirements', () => {
    const ratio = ContrastCalculator.getContrastRatio('#3182CE', '#ffffff');
    expect(ratio).toBeGreaterThan(4.5); // WCAG AA标准
  });
});
```

#### 6. 性能测试 (Performance Tests)
测试应用的性能表现和资源使用。

**测试内容:**
- 组件渲染性能
- 内存使用
- 代码分割效果
- 懒加载功能

## 测试工具和配置

### 测试环境设置
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';

// Mock全局API
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

global.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
});
```

### 测试工具函数
```typescript
// src/test/utils/testUtils.tsx
export const customRender = (ui: React.ReactElement) => 
  render(ui, { wrapper: AllTheProviders });

export const createMockVocabularyItem = (overrides = {}) => ({
  id: '1',
  word: 'Blockchain',
  definition: 'A distributed ledger technology',
  // ... 其他属性
  ...overrides,
});
```

### 覆盖率配置
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

## 运行测试

### 基本命令
```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行特定类型的测试
npm run test:components
npm run test:hooks
npm run test:integration
npm run test:accessibility

# 监听模式
npm run test:watch

# UI模式
npm run test:ui
```

### CI/CD集成
项目配置了GitHub Actions自动化测试流程：

1. **代码检查**: ESLint和TypeScript类型检查
2. **单元测试**: 所有单元测试和组件测试
3. **集成测试**: 用户流程和功能测试
4. **无障碍测试**: 自动化无障碍检查
5. **性能测试**: 性能基准测试
6. **覆盖率报告**: 自动生成和上传覆盖率报告

## 测试最佳实践

### 1. 测试命名
```typescript
// ✅ 好的测试名称
it('should display error message when network request fails', () => {});

// ❌ 不好的测试名称
it('should work', () => {});
```

### 2. 测试结构
```typescript
describe('Component/Function Name', () => {
  // 设置和清理
  beforeEach(() => {
    // 初始化
  });

  describe('specific functionality', () => {
    it('should behave correctly under normal conditions', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle edge cases', () => {
      // 边界情况测试
    });

    it('should handle error conditions', () => {
      // 错误处理测试
    });
  });
});
```

### 3. Mock策略
```typescript
// 模拟外部依赖
vi.mock('../../services/vocabularyService', () => ({
  vocabularyService: {
    getAllVocabulary: vi.fn().mockResolvedValue(mockData),
  },
}));

// 模拟浏览器API
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});
```

### 4. 异步测试
```typescript
// 使用waitFor处理异步操作
await waitFor(() => {
  expect(screen.getByText('Loading complete')).toBeInTheDocument();
});

// 使用act包装状态更新
await act(async () => {
  await result.current.loadData();
});
```

### 5. 无障碍测试
```typescript
// 测试键盘导航
fireEvent.keyDown(element, { key: 'Enter' });
fireEvent.keyDown(element, { key: 'Tab' });

// 测试屏幕阅读器
expect(element).toHaveAttribute('aria-label', 'Expected label');
expect(element).toHaveAttribute('role', 'button');
```

## 测试报告

项目自动生成多种格式的测试报告：

1. **HTML报告**: 可视化的测试结果展示
2. **JSON报告**: 机器可读的详细数据
3. **Markdown摘要**: 简洁的测试概览
4. **覆盖率报告**: 代码覆盖率详情

## 持续改进

### 测试指标监控
- 测试覆盖率趋势
- 测试执行时间
- 失败率统计
- 性能回归检测

### 质量门禁
- 最低覆盖率要求: 80%
- 所有测试必须通过
- 无障碍测试评分 > 90%
- 性能测试不能回归

## 故障排除

### 常见问题

1. **测试超时**
   ```typescript
   // 增加超时时间
   await waitFor(() => {
     expect(element).toBeInTheDocument();
   }, { timeout: 5000 });
   ```

2. **Mock不生效**
   ```typescript
   // 确保在测试前清理mock
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

3. **异步状态问题**
   ```typescript
   // 使用act包装状态更新
   await act(async () => {
     // 异步操作
   });
   ```

4. **DOM清理问题**
   ```typescript
   // 确保测试后清理DOM
   afterEach(() => {
     cleanup();
   });
   ```

## 总结

本项目的测试策略确保了：
- **高质量代码**: 通过全面的测试覆盖
- **用户体验**: 通过无障碍和集成测试
- **性能保证**: 通过性能测试和监控
- **持续交付**: 通过自动化CI/CD流程

测试不仅是质量保证的手段，更是开发过程中的重要反馈机制，帮助我们构建更可靠、更易维护的应用。
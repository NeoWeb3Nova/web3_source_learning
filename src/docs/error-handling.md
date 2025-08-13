# 错误处理系统文档

## 概述

本应用实现了一个全面的错误处理系统，包括错误捕获、分类、用户反馈、重试机制和错误报告。

## 核心组件

### 1. ErrorService (`src/services/errorService.ts`)

错误处理的核心服务，提供以下功能：

- **错误分类**: 自动识别错误类型（网络、验证、认证等）
- **错误报告**: 创建和存储错误报告
- **用户反馈**: 显示用户友好的错误消息
- **重试机制**: 支持指数退避的重试策略
- **错误统计**: 提供错误统计和分析

```typescript
import { errorService, handleError } from '../services/errorService';

// 处理错误
handleError(error, { context: 'user_action' });

// 重试操作
const result = await errorService.retry(async () => {
  return await apiCall();
}, 3, 1000, 2);
```

### 2. ErrorProvider (`src/contexts/ErrorContext.tsx`)

React Context 提供者，集成错误处理到应用中：

```typescript
import { ErrorProvider, useError } from '../contexts/ErrorContext';

// 在应用根部使用
<ErrorProvider>
  <App />
</ErrorProvider>

// 在组件中使用
const { handleError, retryOperation } = useError();
```

### 3. ErrorBoundary (`src/components/common/ErrorBoundary.tsx`)

React 错误边界组件，捕获组件树中的 JavaScript 错误：

```typescript
<ErrorBoundary onError={(error, errorInfo) => {
  // 自定义错误处理
}}>
  <YourComponent />
</ErrorBoundary>
```

### 4. API 错误处理 (`src/utils/apiErrorHandler.ts`)

专门处理 API 调用错误的工具：

```typescript
import { apiGet, apiPost, retryApiCall } from '../utils/apiErrorHandler';

// 带错误处理的 API 调用
const data = await apiGet('/api/data');

// 重试 API 调用
const result = await retryApiCall(() => apiGet('/api/data'));
```

## 使用指南

### 基本错误处理

```typescript
import { useError } from '../contexts/ErrorContext';

const MyComponent = () => {
  const { handleError } = useError();

  const handleAction = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      handleError(error, { 
        context: 'user_action',
        userId: currentUser.id 
      });
    }
  };
};
```

### 使用 useAsyncOperation Hook

```typescript
import useAsyncOperation from '../hooks/useAsyncOperation';

const MyComponent = () => {
  const asyncOp = useAsyncOperation(
    async (param) => {
      return await apiCall(param);
    },
    {
      onSuccess: (data) => console.log('Success:', data),
      onError: (error) => console.log('Error:', error),
    }
  );

  return (
    <div>
      {asyncOp.state.loading && <Spinner />}
      {asyncOp.state.error && <ErrorMessage error={asyncOp.state.error} />}
      {asyncOp.state.data && <DataDisplay data={asyncOp.state.data} />}
      
      <Button onClick={() => asyncOp.execute('param')}>
        执行操作
      </Button>
      
      {asyncOp.state.error && (
        <Button onClick={asyncOp.retry}>
          重试
        </Button>
      )}
    </div>
  );
};
```

### 表单验证错误处理

```typescript
import useFormValidation from '../hooks/useFormValidation';
import { VocabularyValidationRules } from '../utils/validation';

const AddWordForm = () => {
  const form = useFormValidation(
    { word: '', definition: '' },
    {
      word: VocabularyValidationRules.word,
      definition: VocabularyValidationRules.definition,
    }
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    await addWord(values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={form.values.word}
        onChange={(e) => form.setValue('word', e.target.value)}
        onBlur={form.handleBlur('word')}
        isInvalid={!!form.errors.word}
      />
      {form.errors.word && <FormErrorMessage>{form.errors.word}</FormErrorMessage>}
      
      <Button type="submit" isLoading={form.isSubmitting}>
        提交
      </Button>
    </form>
  );
};
```

## 错误类型

### 网络错误 (Network)
- 连接失败
- 超时
- DNS 解析失败

### 验证错误 (Validation)
- 表单输入错误
- 数据格式错误
- 业务规则违反

### 认证错误 (Authentication)
- 未登录
- 登录过期
- 凭证无效

### 授权错误 (Authorization)
- 权限不足
- 资源访问被拒绝

### 服务器错误 (Server Error)
- 5xx HTTP 状态码
- 内部服务器错误
- 服务不可用

## 最佳实践

### 1. 错误分类
始终为错误提供适当的上下文信息：

```typescript
handleError(error, {
  operation: 'add_vocabulary',
  userId: user.id,
  wordId: word.id,
  timestamp: new Date().toISOString(),
});
```

### 2. 用户友好的消息
避免向用户显示技术性错误消息：

```typescript
// ❌ 不好
throw new Error('TypeError: Cannot read property "data" of undefined');

// ✅ 好
throw new Error('无法加载词汇数据，请稍后重试');
```

### 3. 重试策略
对于可重试的错误，实现适当的重试机制：

```typescript
const retryableErrors = ['NetworkError', 'TimeoutError'];

if (retryableErrors.includes(error.name)) {
  await retryOperation(operation, 3, 1000, 2);
}
```

### 4. 错误边界
在适当的组件层级使用错误边界：

```typescript
// 页面级别
<ErrorBoundary>
  <HomePage />
</ErrorBoundary>

// 功能模块级别
<ErrorBoundary>
  <VocabularySection />
</ErrorBoundary>
```

### 5. 离线处理
处理网络连接问题：

```typescript
import useNetworkStatus from '../hooks/useNetworkStatus';

const MyComponent = () => {
  const { isOffline } = useNetworkStatus();

  if (isOffline) {
    return <OfflineMessage />;
  }

  // 正常渲染
};
```

## 调试和监控

### 开发模式
在开发模式下，使用 `ErrorTestComponent` 测试错误处理：

```typescript
import ErrorTestComponent from '../components/common/ErrorTestComponent';

// 在开发环境中添加到应用
{process.env.NODE_ENV === 'development' && <ErrorTestComponent />}
```

### 错误报告
查看错误统计和报告：

```typescript
const { getErrorReports } = useError();
const reports = getErrorReports();
const stats = errorService.getErrorStatistics();
```

### 生产环境监控
在生产环境中，错误会被自动报告到监控服务（如果配置）：

```typescript
// 在 errorService.ts 中配置
private async reportToExternalService(report: ErrorReport): Promise<void> {
  await fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify(report),
  });
}
```

## 配置选项

### ErrorProvider 配置

```typescript
<ErrorProvider
  enableOfflineNotification={true}
  enableErrorBoundary={true}
>
  <App />
</ErrorProvider>
```

### ErrorService 配置

```typescript
// 自定义错误处理选项
handleError(error, context, {
  showToast: true,
  logToConsole: true,
  reportToService: false,
  fallbackMessage: '操作失败，请重试',
});
```

## 性能考虑

1. **错误报告存储**: 限制存储的错误报告数量（默认 100 个）
2. **重试机制**: 使用指数退避避免过度重试
3. **Toast 通知**: 避免同时显示过多错误通知
4. **内存管理**: 定期清理旧的错误报告

## 安全考虑

1. **敏感信息**: 不在错误报告中包含敏感用户数据
2. **错误消息**: 不向用户暴露系统内部信息
3. **日志记录**: 在生产环境中谨慎记录错误详情
4. **错误报告**: 确保错误报告传输的安全性
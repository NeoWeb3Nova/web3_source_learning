# 代码风格和约定

## TypeScript约定
- 使用严格的TypeScript配置
- 所有组件和函数都要有明确的类型定义
- 使用接口(interface)定义对象类型
- 使用枚举(enum)定义常量集合
- 避免使用`any`类型，优先使用具体类型

## 命名约定
- **组件**: PascalCase (如: `WordCard`, `AddVocabularyForm`)
- **文件名**: PascalCase for components, camelCase for others
- **变量和函数**: camelCase (如: `handleSubmit`, `isLoading`)
- **常量**: UPPER_SNAKE_CASE (如: `API_BASE_URL`)
- **接口**: PascalCase with descriptive names (如: `VocabularyItem`, `UserProgress`)
- **枚举**: PascalCase (如: `QuestionType`, `DifficultyLevel`)

## 组件结构约定
- 使用函数式组件和React Hooks
- Props接口命名: `ComponentNameProps`
- 导出方式: `export default ComponentName`
- 组件内部顺序: Props接口 → 组件实现 → 默认导出

## 文件组织
- 每个组件一个文件
- 相关组件放在同一目录下
- 使用`index.ts`文件统一导出
- 类型定义放在`types/`目录下

## 注释和文档
- 使用JSDoc格式注释
- 所有公共接口都要有注释
- 复杂逻辑要有行内注释
- 组件Props要有详细说明

## ESLint规则
- 禁止未使用的变量 (`@typescript-eslint/no-unused-vars`)
- 优先使用`const` (`prefer-const`)
- 禁止使用`var` (`no-var`)
- React Hooks规则检查
- 未使用参数以`_`开头

## Prettier格式化
- 使用分号 (`semi: true`)
- 单引号 (`singleQuote: true`)
- 行宽80字符 (`printWidth: 80`)
- 2空格缩进 (`tabWidth: 2`)
- 尾随逗号ES5风格 (`trailingComma: "es5"`)
- 箭头函数参数不加括号 (`arrowParens: "avoid"`)

## 导入顺序
1. React相关导入
2. 第三方库导入
3. 内部组件导入
4. 类型导入
5. 相对路径导入

## 错误处理
- 使用ErrorBoundary捕获组件错误
- 网络请求要有重试机制
- 用户友好的错误提示
- 开发环境显示详细错误信息
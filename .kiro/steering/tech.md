# Technology Stack

## Frontend Technologies
- **React**: 现代化的前端框架，用于构建用户界面
- **Chakra UI**: 现代化的React组件库，提供丰富的UI组件
- **TypeScript**: 类型安全的JavaScript超集，提升代码质量
- **React Router**: 客户端路由管理
- **Framer Motion**: 动画和交互效果库

## 状态管理和数据
- **React Context/Hooks**: 应用状态管理
- **LocalStorage**: 本地数据持久化存储
- **IndexedDB**: 大量数据的本地存储（可选）
- **React Query/SWR**: 数据获取和缓存管理

## 移动端和响应式
- **CSS Grid/Flexbox**: 响应式布局系统
- **CSS Media Queries**: 断点管理 (<768px, 768px-1024px, >1024px)
- **Touch Events**: 触摸手势支持（滑动、长按、拖拽）
- **PWA**: 渐进式Web应用支持（可选）

## 音频和多媒体
- **Web Audio API**: 单词发音播放
- **Speech Synthesis API**: 文本转语音功能
- **Audio Context**: 音频处理和控制

## 开发工具
- **Vite**: 快速的构建工具和开发服务器
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Husky**: Git hooks管理

## 测试框架
- **Vitest**: 单元测试框架
- **React Testing Library**: React组件测试
- **Cypress**: 端到端测试（可选）

## 部署和构建
- **Vercel/Netlify**: 静态网站部署平台
- **GitHub Actions**: CI/CD自动化部署
- **Docker**: 容器化部署（可选）

## 外部服务集成
- **Web3.0词汇API**: 获取1000个常用Web3.0词汇的外部服务
- **发音服务**: 单词发音数据源
- **分析服务**: 用户学习数据分析（可选）

## 设计系统
- **颜色主题**: 温暖的蓝色(#3182CE)和绿色(#38A169)配色
- **字体系统**: 系统字体栈，确保跨平台一致性
- **间距系统**: 基于8px网格的间距规范
- **组件库**: 基于Chakra UI的自定义组件扩展

## 性能优化
- **代码分割**: React.lazy和动态导入
- **图片优化**: WebP格式和懒加载
- **缓存策略**: Service Worker缓存管理
- **Bundle分析**: webpack-bundle-analyzer

## 开发环境配置
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm run test

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 项目结构约定
- 使用函数式组件和React Hooks
- 遵循Chakra UI的设计系统和组件规范
- 移动端优先的响应式设计原则
- 组件化和模块化的代码组织
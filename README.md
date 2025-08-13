# Web3.0 DeFi词汇大作战 🚀

一个专为语言学习者设计的移动端优先词汇学习应用，专注于Web3.0和DeFi领域的专业术语学习。

[![Build Status](https://github.com/your-repo/web3-defi-vocab-battle/workflows/Test%20Suite/badge.svg)](https://github.com/your-repo/web3-defi-vocab-battle/actions)
[![Deploy Status](https://github.com/your-repo/web3-defi-vocab-battle/workflows/Deploy%20to%20Production/badge.svg)](https://github.com/your-repo/web3-defi-vocab-battle/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🎯 **智能词汇学习**: 单词卡片翻转、发音播放、收藏标记功能
- 🎮 **多样化练习**: 选择题、填空题、听力题，带实时反馈和计时
- 📊 **学习进度追踪**: 每日统计图表、连续学习天数、成就徽章系统
- 📱 **响应式设计**: 移动端优先，适配手机/平板/桌面三种布局
- 🔄 **PWA支持**: 离线访问、推送通知、主屏幕安装
- 🎨 **现代化UI**: 基于Chakra UI，温暖配色，支持触摸手势

## 🚀 快速开始

### 在线体验
访问：[https://web3-defi-vocab-battle.vercel.app](https://web3-defi-vocab-battle.vercel.app)

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-repo/web3-defi-vocab-battle.git
cd web3-defi-vocab-battle

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器中打开 http://localhost:3000
```

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Chakra UI** - 现代化React组件库
- **Framer Motion** - 动画和交互效果
- **React Router** - 客户端路由管理

### 构建工具
- **Vite** - 快速构建工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Vitest** - 单元测试框架

### 部署和监控
- **Vercel/Netlify** - 静态网站部署
- **GitHub Actions** - CI/CD自动化
- **PWA** - 渐进式Web应用
- **Sentry** - 错误追踪和监控

## 📁 项目结构

```
├── src/
│   ├── components/          # React组件
│   │   ├── common/         # 通用组件
│   │   ├── vocabulary/     # 词汇相关组件
│   │   ├── practice/       # 练习相关组件
│   │   └── progress/       # 进度相关组件
│   ├── pages/              # 页面组件
│   ├── hooks/              # 自定义Hooks
│   ├── services/           # API服务
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   └── data/               # 静态数据
├── public/                 # 静态资源
├── docs/                   # 项目文档
├── e2e/                    # 端到端测试
└── .github/workflows/      # GitHub Actions
```

## 🧪 测试

```bash
# 运行所有测试
npm run test:all

# 单元测试
npm run test:run

# 组件测试
npm run test:components

# 端到端测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage

# 性能测试
npm run test:performance

# 可访问性测试
npm run test:accessibility
```

## 📦 构建和部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 分析构建包大小
npm run analyze

# 检查包大小限制
npm run size-limit
```

### 部署选项

- **Vercel**: 推荐，自动部署
- **Netlify**: 备选方案
- **Docker**: 容器化部署
- **自定义服务器**: 完全控制

详细部署指南请参考 [部署文档](docs/deployment-guide.md)

## 📚 文档

- [用户使用指南](docs/user-guide.md) - 应用使用说明
- [部署指南](docs/deployment-guide.md) - 部署配置说明
- [测试指南](src/docs/testing-guide.md) - 测试策略和方法
- [E2E测试总结](src/docs/e2e-testing-summary.md) - 端到端测试报告

## 🎯 路线图

### 已完成 ✅
- [x] 基础词汇学习功能
- [x] 多种练习题型
- [x] 学习进度追踪
- [x] 响应式设计
- [x] PWA支持
- [x] 完整测试覆盖
- [x] CI/CD部署流程

### 计划中 🚧
- [ ] 用户账户系统
- [ ] 云端数据同步
- [ ] 社交分享功能
- [ ] 多语言支持
- [ ] AI智能推荐
- [ ] 语音识别练习

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范
- 遵循 ESLint 和 Prettier 配置
- 编写单元测试
- 更新相关文档
- 确保所有测试通过

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [React](https://reactjs.org/) - 前端框架
- [Chakra UI](https://chakra-ui.com/) - UI组件库
- [Vite](https://vitejs.dev/) - 构建工具
- [Vercel](https://vercel.com/) - 部署平台

## 📞 联系我们

- 项目地址: [GitHub](https://github.com/your-repo/web3-defi-vocab-battle)
- 问题反馈: [Issues](https://github.com/your-repo/web3-defi-vocab-battle/issues)
- 邮箱: support@web3vocab.com

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！
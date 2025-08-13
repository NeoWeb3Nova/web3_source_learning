# Project Structure

## Root Directory
```
/
├── .kiro/                          # Kiro AI assistant configuration
│   ├── settings/                   # Kiro settings and configurations
│   │   └── mcp.json               # MCP server configuration
│   ├── steering/                  # AI assistant guidance documents
│   └── specs/                     # Project specifications
│       └── web3-defi-vocab-battle/ # Current project spec
├── src/                           # Source code directory
│   ├── components/                # React components
│   │   ├── common/               # Shared components
│   │   ├── vocabulary/           # Vocabulary-related components
│   │   ├── practice/             # Practice/quiz components
│   │   ├── progress/             # Progress tracking components
│   │   └── navigation/           # Navigation components
│   ├── pages/                    # Page components
│   │   ├── Home.tsx             # 首页
│   │   ├── Practice.tsx         # 练习页面
│   │   ├── Progress.tsx         # 进度页面
│   │   └── Settings.tsx         # 设置页面
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API services and data fetching
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── data/                     # Static data and mock data
│   ├── styles/                   # Global styles and theme
│   ├── App.tsx                   # Main App component
│   └── main.tsx                  # Application entry point
├── public/                       # Static assets
│   ├── audio/                    # Audio files for pronunciation
│   ├── images/                   # Images and icons
│   └── manifest.json            # PWA manifest
├── tests/                        # Test files
│   ├── components/              # Component tests
│   ├── hooks/                   # Hook tests
│   └── utils/                   # Utility tests
└── docs/                        # Documentation
```

## Key Directories

### `src/components/`
React组件按功能模块组织：
- `common/`: 通用组件（Button, Card, Modal等）
- `vocabulary/`: 词汇相关组件（WordCard, WordList等）
- `practice/`: 练习相关组件（Quiz, Timer, Feedback等）
- `progress/`: 进度相关组件（Chart, Badge, Statistics等）
- `navigation/`: 导航组件（TopNav, BottomTabs等）

### `src/pages/`
页面级组件，对应底部标签栏的四个主要页面：
- `Home.tsx`: 首页，显示单词学习界面
- `Practice.tsx`: 练习页面，各种题型练习
- `Progress.tsx`: 进度页面，学习统计和成就
- `Settings.tsx`: 设置页面，用户偏好配置

### `src/services/`
数据服务层：
- API调用封装
- 本地存储管理
- 外部词汇数据获取
- 音频服务管理

### `src/types/`
TypeScript类型定义：
- 词汇数据类型
- 用户进度类型
- 练习题目类型
- API响应类型

## File Conventions
- **组件文件**: 使用PascalCase命名，如`WordCard.tsx`
- **Hook文件**: 使用camelCase，以`use`开头，如`useVocabulary.ts`
- **工具函数**: 使用camelCase命名，如`formatDate.ts`
- **类型定义**: 使用PascalCase，如`VocabularyTypes.ts`
- **样式文件**: 使用kebab-case，如`word-card.module.css`

## 响应式设计结构
```
Mobile First (<768px)
├── Single column layout
├── Full-screen components
├── Bottom navigation tabs
└── Touch-optimized interactions

Tablet (768px-1024px)
├── Two-column layout
├── Sidebar navigation
├── Larger touch targets
└── Enhanced content display

Desktop (>1024px)
├── Three-column layout
├── More information density
├── Hover interactions
└── Keyboard shortcuts
```

## 数据流架构
- **State Management**: React Context + useReducer
- **Local Storage**: 用户进度和设置持久化
- **API Integration**: 外部词汇数据获取
- **Audio Management**: 发音文件缓存和播放

## 组件设计原则
- 移动端优先的响应式设计
- 基于Chakra UI的组件系统
- 可复用和可组合的组件架构
- 无障碍访问支持（ARIA标签）
- 性能优化（懒加载、代码分割）
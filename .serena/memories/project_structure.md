# 项目结构

## 根目录结构
```
web3_source_learning/
├── .git/                    # Git版本控制
├── .husky/                  # Git hooks配置
├── .kiro/                   # Kiro AI助手配置
├── .vscode/                 # VS Code配置
├── src/                     # 源代码目录
├── .eslintrc.cjs           # ESLint配置
├── .gitignore              # Git忽略文件
├── .lintstagedrc.json      # lint-staged配置
├── .prettierrc             # Prettier配置
├── index.html              # HTML入口文件
├── package.json            # 项目配置和依赖
├── README.md               # 项目说明文档
├── tsconfig.json           # TypeScript配置
├── tsconfig.node.json      # Node.js TypeScript配置
├── vite.config.ts          # Vite构建配置
└── vitest.config.ts        # Vitest测试配置
```

## src/目录结构
```
src/
├── components/              # React组件
│   ├── common/             # 通用组件
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── NetworkStatus.tsx
│   │   └── index.ts
│   ├── Layout/             # 布局组件
│   │   ├── AppRouter.tsx
│   │   ├── BottomNavigation.tsx
│   │   ├── Layout.tsx
│   │   ├── SideNavigation.tsx
│   │   ├── TopNavigation.tsx
│   │   └── index.ts
│   ├── practice/           # 练习相关组件
│   │   ├── MultipleChoiceQuestion.tsx
│   │   ├── Timer.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   └── vocabulary/         # 词汇相关组件
│       ├── AddVocabularyForm.tsx
│       ├── VocabularyLoader.tsx
│       ├── WordActions.tsx
│       ├── WordCard.tsx
│       ├── WordDetailsModal.tsx
│       └── index.ts
├── contexts/               # React Context
│   ├── ProgressContext.tsx
│   └── VocabularyContext.tsx
├── hooks/                  # 自定义Hooks
│   ├── useAsyncOperation.ts
│   ├── useAudio.ts
│   ├── useProgress.ts
│   ├── useSwipeGesture.ts
│   └── useVocabulary.ts
├── pages/                  # 页面组件
│   ├── Practice/           # 练习页面子组件
│   │   ├── QuickPractice.tsx
│   │   ├── ReviewPractice.tsx
│   │   └── TimedPractice.tsx
│   ├── Vocabulary/         # 词汇页面子组件
│   │   ├── AllVocabulary.tsx
│   │   ├── FavoriteVocabulary.tsx
│   │   ├── LearningVocabulary.tsx
│   │   └── MasteredVocabulary.tsx
│   ├── Home.tsx
│   ├── Practice.tsx
│   ├── Progress.tsx
│   ├── Settings.tsx
│   └── Vocabulary.tsx
├── services/               # API服务和数据管理
│   ├── storage.ts
│   ├── vocabularyService.ts
│   └── web3VocabularyAPI.ts
├── test/                   # 测试配置
│   └── setup.ts
├── theme/                  # Chakra UI主题配置
│   ├── breakpoints.ts
│   ├── colors.ts
│   ├── components.ts
│   └── index.ts
├── types/                  # TypeScript类型定义
│   ├── api.ts
│   ├── index.ts
│   ├── practice.ts
│   ├── progress.ts
│   ├── settings.ts
│   └── vocabulary.ts
├── App.tsx                 # 主应用组件
├── index.css               # 全局样式
└── main.tsx                # 应用入口点
```

## 组件组织原则
- **按功能模块分组**: common, vocabulary, practice, progress等
- **每个组件一个文件**: 便于维护和查找
- **统一导出**: 使用index.ts文件统一导出组件
- **类型定义分离**: 复杂类型放在types/目录下
- **服务层分离**: API和数据处理逻辑放在services/目录

## 文件命名约定
- **组件文件**: PascalCase (如: WordCard.tsx)
- **Hook文件**: camelCase (如: useVocabulary.ts)
- **服务文件**: camelCase (如: vocabularyService.ts)
- **类型文件**: camelCase (如: vocabulary.ts)
- **配置文件**: kebab-case或特定约定
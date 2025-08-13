# 建议命令

## 开发命令

### 启动开发服务器
```bash
npm run dev
```
- 启动Vite开发服务器
- 支持热重载
- 默认端口: http://localhost:5173

### 构建生产版本
```bash
npm run build
```
- TypeScript类型检查
- Vite生产构建
- 输出到`dist/`目录

### 预览生产构建
```bash
npm run preview
```
- 预览构建后的应用
- 用于本地测试生产版本

## 代码质量命令

### 代码检查
```bash
npm run lint
```
- 运行ESLint检查
- 检查TypeScript和React代码
- 报告未使用的禁用指令

### 代码格式化
```bash
npm run format
```
- 使用Prettier格式化代码
- 格式化所有TypeScript、JavaScript、JSON、CSS、Markdown文件

## 测试命令

### 运行测试
```bash
npm run test
```
- 运行Vitest单元测试
- 监听模式，文件变化时自动重新运行

### 测试UI界面
```bash
npm run test:ui
```
- 启动Vitest UI界面
- 可视化测试结果和覆盖率

## Windows系统命令

### 文件操作
```cmd
dir                    # 列出目录内容
cd <directory>         # 切换目录
mkdir <directory>      # 创建目录
rmdir /s <directory>   # 删除目录
copy <source> <dest>   # 复制文件
del <file>             # 删除文件
```

### 文本搜索
```cmd
findstr "pattern" *.ts     # 在TypeScript文件中搜索
findstr /r "regex" *.tsx   # 使用正则表达式搜索
```

### Git命令
```bash
git status             # 查看状态
git add .              # 添加所有更改
git commit -m "msg"    # 提交更改
git push               # 推送到远程
git pull               # 拉取远程更改
```

## 包管理命令

### 安装依赖
```bash
npm install            # 安装所有依赖
npm install <package>  # 安装新包
npm install -D <pkg>   # 安装开发依赖
```

### 更新依赖
```bash
npm update             # 更新所有包
npm outdated           # 查看过时的包
```

## 调试命令

### 查看端口占用
```cmd
netstat -ano | findstr :5173
```

### 清理缓存
```bash
npm run dev -- --force    # 强制重新构建
rm -rf node_modules        # 删除node_modules
npm install                # 重新安装
```
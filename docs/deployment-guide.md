# 部署指南

## 🚀 部署概述

本应用支持多种部署方式，包括 Vercel、Netlify、以及自定义服务器部署。推荐使用 Vercel 或 Netlify 进行快速部署。

## 📋 部署前准备

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- Git

### 环境变量配置
创建 `.env.production` 文件：

```bash
# 应用配置
VITE_APP_TITLE=Web3.0 DeFi词汇大作战
VITE_APP_VERSION=1.0.0

# CDN配置
VITE_IMAGE_CDN=https://your-image-cdn.com
VITE_AUDIO_CDN=https://your-audio-cdn.com
VITE_STATIC_CDN=https://your-static-cdn.com

# 监控服务
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ANALYTICS_ENDPOINT=https://your-analytics-endpoint
VITE_ERROR_ENDPOINT=https://your-error-endpoint

# 第三方服务
VITE_VOCABULARY_API=https://your-vocabulary-api.com
```

## 🌐 Vercel 部署

### 自动部署（推荐）
1. Fork 项目到你的 GitHub 账户
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量
4. 点击部署

### 手动部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

### Vercel 配置
项目已包含 `vercel.json` 配置文件，包含：
- 静态资源缓存策略
- 安全头设置
- SPA 路由支持
- 性能优化配置

## 🌍 Netlify 部署

### 自动部署
1. 在 [Netlify](https://netlify.com) 中连接 GitHub 仓库
2. 设置构建命令：`npm run build`
3. 设置发布目录：`dist`
4. 配置环境变量
5. 部署

### 手动部署
```bash
# 构建项目
npm run build

# 安装 Netlify CLI
npm i -g netlify-cli

# 登录 Netlify
netlify login

# 部署
netlify deploy --prod --dir=dist
```

### Netlify 配置
项目包含 `netlify.toml` 配置文件，包含：
- 构建设置
- 重定向规则
- 安全头配置
- 缓存策略

## 🐳 Docker 部署

### Dockerfile
```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 配置
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # 安全头
        add_header X-Frame-Options "DENY" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self' data:;" always;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Service Worker 不缓存
        location /service-worker.js {
            expires 0;
            add_header Cache-Control "public, max-age=0, must-revalidate";
        }

        # SPA 路由支持
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### Docker 部署命令
```bash
# 构建镜像
docker build -t web3-defi-vocab-battle .

# 运行容器
docker run -d -p 80:80 --name vocab-app web3-defi-vocab-battle
```

## ☁️ 云服务器部署

### 服务器要求
- Ubuntu 20.04+ / CentOS 8+
- 2GB+ RAM
- 20GB+ 存储空间
- Node.js 18+
- Nginx

### 部署步骤
```bash
# 1. 克隆项目
git clone https://github.com/your-repo/web3-defi-vocab-battle.git
cd web3-defi-vocab-battle

# 2. 安装依赖
npm ci

# 3. 构建项目
npm run build

# 4. 配置 Nginx
sudo cp nginx.conf /etc/nginx/sites-available/vocab-app
sudo ln -s /etc/nginx/sites-available/vocab-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 5. 配置 SSL (可选)
sudo certbot --nginx -d your-domain.com

# 6. 设置进程管理 (PM2)
npm install -g pm2
pm2 serve dist 3000 --spa --name vocab-app
pm2 startup
pm2 save
```

## 🔧 CI/CD 配置

### GitHub Actions
项目包含完整的 CI/CD 配置：

- **测试流水线** (`.github/workflows/test.yml`)
  - 多 Node.js 版本测试
  - 代码质量检查
  - 单元测试和集成测试
  - 性能测试
  - 可访问性测试

- **部署流水线** (`.github/workflows/deploy.yml`)
  - 自动构建
  - 部署到 Vercel 和 Netlify
  - 部署通知

### 自定义 CI/CD
```yaml
name: Custom Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:run
    
    - name: Build
      run: npm run build
    
    - name: Deploy to server
      run: |
        # 你的部署脚本
        rsync -avz dist/ user@server:/var/www/vocab-app/
```

## 📊 性能优化

### 构建优化
- **代码分割**: 自动分割 vendor、UI、路由等模块
- **Tree Shaking**: 移除未使用的代码
- **压缩优化**: Terser 压缩 JavaScript，移除 console
- **资源优化**: 图片压缩，字体子集化

### 缓存策略
- **静态资源**: 1年缓存，文件名哈希
- **HTML**: 不缓存，确保更新及时
- **Service Worker**: 不缓存，支持热更新
- **API 数据**: 适当缓存，提升用户体验

### CDN 配置
```javascript
// CDN 配置示例
const CDN_CONFIG = {
  images: 'https://cdn.example.com/images',
  audio: 'https://cdn.example.com/audio',
  static: 'https://cdn.example.com/static',
};
```

## 🔍 监控和日志

### 错误监控
- **Sentry**: 错误追踪和性能监控
- **自定义监控**: 用户行为分析
- **健康检查**: 定期检查服务状态

### 日志配置
```javascript
// 生产环境日志配置
const logConfig = {
  level: 'error',
  format: 'json',
  transports: [
    'console',
    'file'
  ]
};
```

## 🔒 安全配置

### 安全头设置
- **CSP**: 内容安全策略
- **HSTS**: 强制 HTTPS
- **X-Frame-Options**: 防止点击劫持
- **X-XSS-Protection**: XSS 保护

### 环境安全
- 敏感信息使用环境变量
- API 密钥加密存储
- 定期更新依赖包
- 安全扫描和审计

## 📈 部署后检查

### 功能测试
- [ ] 页面正常加载
- [ ] 路由跳转正常
- [ ] PWA 功能正常
- [ ] 音频播放正常
- [ ] 数据存储正常

### 性能测试
- [ ] Lighthouse 评分 > 90
- [ ] 首屏加载 < 3s
- [ ] 交互响应 < 100ms
- [ ] 内存使用正常

### 兼容性测试
- [ ] 主流浏览器兼容
- [ ] 移动端适配正常
- [ ] 不同屏幕尺寸适配
- [ ] 离线功能正常

## 🆘 故障排除

### 常见问题
1. **构建失败**: 检查 Node.js 版本和依赖
2. **部署失败**: 检查环境变量和权限
3. **页面空白**: 检查路由配置和资源路径
4. **功能异常**: 检查 API 端点和网络连接

### 调试工具
- 浏览器开发者工具
- Lighthouse 性能分析
- Network 面板网络分析
- Console 错误日志

## 📞 技术支持

如果在部署过程中遇到问题，可以：
- 查看项目 Issues
- 联系技术支持
- 参考官方文档
- 社区讨论

---

祝你部署顺利！🎉
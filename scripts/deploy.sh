#!/bin/bash

# Web3.0 DeFi词汇大作战 - 部署脚本

set -e

echo "🚀 开始部署 Web3.0 DeFi词汇大作战..."

# 检查环境
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=production
fi

echo "📋 环境: $NODE_ENV"

# 安装依赖
echo "📦 安装依赖..."
npm ci --only=production

# 运行测试
echo "🧪 运行测试..."
npm run test:run

# 代码质量检查
echo "🔍 代码质量检查..."
npm run lint

# 类型检查
echo "📝 TypeScript 类型检查..."
npx tsc --noEmit

# 构建项目
echo "🏗️ 构建项目..."
npm run build

# 检查构建结果
if [ ! -d "dist" ]; then
  echo "❌ 构建失败：dist 目录不存在"
  exit 1
fi

echo "📊 构建统计..."
du -sh dist/
ls -la dist/

# 运行包大小检查
echo "📏 检查包大小..."
npm run size-limit

# 预览构建结果（可选）
if [ "$1" = "--preview" ]; then
  echo "👀 启动预览服务器..."
  npm run preview &
  PREVIEW_PID=$!
  
  # 等待服务器启动
  sleep 5
  
  # 运行 Lighthouse 检查
  echo "🔍 运行 Lighthouse 性能检查..."
  npm run lighthouse || echo "⚠️ Lighthouse 检查失败，但继续部署"
  
  # 停止预览服务器
  kill $PREVIEW_PID
fi

echo "✅ 构建完成！"
echo "📁 构建文件位于 dist/ 目录"
echo "🌐 准备部署到生产环境"

# 部署到 Vercel（如果配置了）
if [ "$DEPLOY_TO_VERCEL" = "true" ] && command -v vercel &> /dev/null; then
  echo "🚀 部署到 Vercel..."
  vercel --prod
fi

# 部署到 Netlify（如果配置了）
if [ "$DEPLOY_TO_NETLIFY" = "true" ] && command -v netlify &> /dev/null; then
  echo "🚀 部署到 Netlify..."
  netlify deploy --prod --dir=dist
fi

echo "🎉 部署完成！"
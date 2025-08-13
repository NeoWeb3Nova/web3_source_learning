# Web3.0 DeFi词汇大作战 - PowerShell 部署脚本

param(
    [switch]$Preview,
    [switch]$SkipTests,
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 开始部署 Web3.0 DeFi词汇大作战..." -ForegroundColor Green

# 设置环境变量
$env:NODE_ENV = $Environment
Write-Host "📋 环境: $Environment" -ForegroundColor Cyan

try {
    # 安装依赖
    Write-Host "📦 安装依赖..." -ForegroundColor Yellow
    npm ci --only=production
    if ($LASTEXITCODE -ne 0) { throw "依赖安装失败" }

    # 运行测试（除非跳过）
    if (-not $SkipTests) {
        Write-Host "🧪 运行测试..." -ForegroundColor Yellow
        npm run test:run
        if ($LASTEXITCODE -ne 0) { throw "测试失败" }
    }

    # 代码质量检查
    Write-Host "🔍 代码质量检查..." -ForegroundColor Yellow
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "代码质量检查失败" }

    # 类型检查
    Write-Host "📝 TypeScript 类型检查..." -ForegroundColor Yellow
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) { throw "类型检查失败" }

    # 构建项目
    Write-Host "🏗️ 构建项目..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "构建失败" }

    # 检查构建结果
    if (-not (Test-Path "dist")) {
        throw "构建失败：dist 目录不存在"
    }

    Write-Host "📊 构建统计..." -ForegroundColor Cyan
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
    Write-Host "构建大小: $([math]::Round($distSize / 1MB, 2)) MB"
    
    Get-ChildItem -Path "dist" | Format-Table Name, Length, LastWriteTime

    # 运行包大小检查
    Write-Host "📏 检查包大小..." -ForegroundColor Yellow
    npm run size-limit
    if ($LASTEXITCODE -ne 0) { 
        Write-Warning "包大小检查失败，但继续部署"
    }

    # 预览构建结果（可选）
    if ($Preview) {
        Write-Host "👀 启动预览服务器..." -ForegroundColor Yellow
        $previewJob = Start-Job -ScriptBlock { npm run preview }
        
        # 等待服务器启动
        Start-Sleep -Seconds 5
        
        # 运行 Lighthouse 检查
        Write-Host "🔍 运行 Lighthouse 性能检查..." -ForegroundColor Yellow
        try {
            npm run lighthouse
        }
        catch {
            Write-Warning "Lighthouse 检查失败，但继续部署"
        }
        
        # 停止预览服务器
        Stop-Job -Job $previewJob
        Remove-Job -Job $previewJob
    }

    Write-Host "✅ 构建完成！" -ForegroundColor Green
    Write-Host "📁 构建文件位于 dist/ 目录" -ForegroundColor Cyan
    Write-Host "🌐 准备部署到生产环境" -ForegroundColor Cyan

    # 部署到 Vercel（如果配置了）
    if ($env:DEPLOY_TO_VERCEL -eq "true") {
        if (Get-Command vercel -ErrorAction SilentlyContinue) {
            Write-Host "🚀 部署到 Vercel..." -ForegroundColor Yellow
            vercel --prod
        }
        else {
            Write-Warning "Vercel CLI 未安装，跳过 Vercel 部署"
        }
    }

    # 部署到 Netlify（如果配置了）
    if ($env:DEPLOY_TO_NETLIFY -eq "true") {
        if (Get-Command netlify -ErrorAction SilentlyContinue) {
            Write-Host "🚀 部署到 Netlify..." -ForegroundColor Yellow
            netlify deploy --prod --dir=dist
        }
        else {
            Write-Warning "Netlify CLI 未安装，跳过 Netlify 部署"
        }
    }

    Write-Host "🎉 部署完成！" -ForegroundColor Green
}
catch {
    Write-Host "❌ 部署失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
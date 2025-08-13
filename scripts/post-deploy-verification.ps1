# Web3.0 DeFi词汇大作战 - 部署后验证脚本

param(
    [string]$SiteUrl = "https://web3-defi-vocab-battle.vercel.app",
    [int]$Timeout = 30,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "🔍 开始部署后验证..." -ForegroundColor Green
Write-Host "🌐 验证网站: $SiteUrl" -ForegroundColor Cyan

$results = @{
    Passed = 0
    Failed = 0
    Warnings = 0
    Tests = @()
}

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description,
        [int]$ExpectedStatus = 200,
        [string[]]$RequiredContent = @()
    )
    
    $test = @{
        Name = $Description
        Url = $Url
        Status = "Unknown"
        Message = ""
        ResponseTime = 0
    }
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing
        $stopwatch.Stop()
        
        $test.ResponseTime = $stopwatch.ElapsedMilliseconds
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            $contentCheck = $true
            foreach ($content in $RequiredContent) {
                if ($response.Content -notlike "*$content*") {
                    $contentCheck = $false
                    break
                }
            }
            
            if ($contentCheck) {
                $test.Status = "✅ 通过"
                $test.Message = "响应时间: $($test.ResponseTime)ms"
                $results.Passed++
                Write-Host "✅ $Description - $($test.ResponseTime)ms" -ForegroundColor Green
            } else {
                $test.Status = "⚠️ 警告"
                $test.Message = "内容检查失败"
                $results.Warnings++
                Write-Host "⚠️ $Description - 内容检查失败" -ForegroundColor Yellow
            }
        } else {
            $test.Status = "❌ 失败"
            $test.Message = "HTTP状态码: $($response.StatusCode)"
            $results.Failed++
            Write-Host "❌ $Description - HTTP $($response.StatusCode)" -ForegroundColor Red
        }
    }
    catch {
        $test.Status = "❌ 失败"
        $test.Message = $_.Exception.Message
        $results.Failed++
        Write-Host "❌ $Description - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $results.Tests += $test
}

function Test-Performance {
    param(
        [string]$Url,
        [int]$MaxResponseTime = 3000
    )
    
    Write-Host "📊 性能测试..." -ForegroundColor Yellow
    
    $times = @()
    for ($i = 1; $i -le 3; $i++) {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing
            $stopwatch.Stop()
            $times += $stopwatch.ElapsedMilliseconds
            
            if ($Verbose) {
                Write-Host "  测试 $i : $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "  测试 $i : 失败" -ForegroundColor Red
        }
    }
    
    if ($times.Count -gt 0) {
        $avgTime = ($times | Measure-Object -Average).Average
        $maxTime = ($times | Measure-Object -Maximum).Maximum
        
        Write-Host "  平均响应时间: $([math]::Round($avgTime, 0))ms" -ForegroundColor Cyan
        Write-Host "  最大响应时间: $maxTime ms" -ForegroundColor Cyan
        
        if ($avgTime -le $MaxResponseTime) {
            Write-Host "✅ 性能测试通过" -ForegroundColor Green
            $results.Passed++
        } else {
            Write-Host "⚠️ 响应时间过长" -ForegroundColor Yellow
            $results.Warnings++
        }
    } else {
        Write-Host "❌ 性能测试失败" -ForegroundColor Red
        $results.Failed++
    }
}

function Test-PWA {
    param([string]$BaseUrl)
    
    Write-Host "📱 PWA 功能测试..." -ForegroundColor Yellow
    
    # 测试 Manifest
    Test-Endpoint -Url "$BaseUrl/manifest.json" -Description "PWA Manifest" -RequiredContent @("name", "icons")
    
    # 测试 Service Worker
    Test-Endpoint -Url "$BaseUrl/service-worker.js" -Description "Service Worker"
    
    # 测试图标
    Test-Endpoint -Url "$BaseUrl/icons/icon-192x192.png" -Description "PWA 图标"
}

function Test-Security {
    param([string]$Url)
    
    Write-Host "🔒 安全检查..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing
        $headers = $response.Headers
        
        $securityHeaders = @{
            "X-Frame-Options" = "点击劫持保护"
            "X-Content-Type-Options" = "MIME类型嗅探保护"
            "X-XSS-Protection" = "XSS保护"
            "Strict-Transport-Security" = "HSTS"
            "Content-Security-Policy" = "内容安全策略"
        }
        
        foreach ($header in $securityHeaders.Keys) {
            if ($headers.ContainsKey($header)) {
                Write-Host "✅ $($securityHeaders[$header]) 已设置" -ForegroundColor Green
                $results.Passed++
            } else {
                Write-Host "⚠️ $($securityHeaders[$header]) 未设置" -ForegroundColor Yellow
                $results.Warnings++
            }
        }
    }
    catch {
        Write-Host "❌ 安全检查失败: $($_.Exception.Message)" -ForegroundColor Red
        $results.Failed++
    }
}

# 开始测试
Write-Host "`n🧪 功能测试" -ForegroundColor Magenta
Test-Endpoint -Url $SiteUrl -Description "主页" -RequiredContent @("Web3", "DeFi", "词汇")
Test-Endpoint -Url "$SiteUrl/practice" -Description "练习页面"
Test-Endpoint -Url "$SiteUrl/progress" -Description "进度页面"
Test-Endpoint -Url "$SiteUrl/settings" -Description "设置页面"

Write-Host "`n📊 性能测试" -ForegroundColor Magenta
Test-Performance -Url $SiteUrl

Write-Host "`n📱 PWA 测试" -ForegroundColor Magenta
Test-PWA -BaseUrl $SiteUrl

Write-Host "`n🔒 安全测试" -ForegroundColor Magenta
Test-Security -Url $SiteUrl

Write-Host "`n🌐 SEO 检查" -ForegroundColor Magenta
Test-Endpoint -Url "$SiteUrl/robots.txt" -Description "Robots.txt"
Test-Endpoint -Url "$SiteUrl/sitemap.xml" -Description "Sitemap"

# 生成报告
Write-Host "`n📋 验证报告" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Gray

$totalTests = $results.Passed + $results.Failed + $results.Warnings
Write-Host "总测试数: $totalTests" -ForegroundColor Cyan
Write-Host "通过: $($results.Passed)" -ForegroundColor Green
Write-Host "失败: $($results.Failed)" -ForegroundColor Red
Write-Host "警告: $($results.Warnings)" -ForegroundColor Yellow

$successRate = if ($totalTests -gt 0) { [math]::Round(($results.Passed / $totalTests) * 100, 1) } else { 0 }
Write-Host "成功率: $successRate%" -ForegroundColor Cyan

if ($Verbose) {
    Write-Host "`n📝 详细结果:" -ForegroundColor Magenta
    $results.Tests | ForEach-Object {
        Write-Host "  $($_.Status) $($_.Name) - $($_.Message)" -ForegroundColor Gray
    }
}

# 生成 JSON 报告
$jsonReport = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    siteUrl = $SiteUrl
    summary = @{
        total = $totalTests
        passed = $results.Passed
        failed = $results.Failed
        warnings = $results.Warnings
        successRate = $successRate
    }
    tests = $results.Tests
} | ConvertTo-Json -Depth 3

$reportPath = "verification-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$jsonReport | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "`n📄 详细报告已保存到: $reportPath" -ForegroundColor Cyan

# 退出代码
if ($results.Failed -gt 0) {
    Write-Host "`n❌ 验证失败！发现 $($results.Failed) 个问题" -ForegroundColor Red
    exit 1
} elseif ($results.Warnings -gt 0) {
    Write-Host "`n⚠️ 验证完成，但有 $($results.Warnings) 个警告" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "`n✅ 所有验证通过！" -ForegroundColor Green
    exit 0
}
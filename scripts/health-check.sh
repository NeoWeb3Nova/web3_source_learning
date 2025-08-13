#!/bin/bash

# Web3.0 DeFi词汇大作战 - 健康检查脚本

set -e

# 配置
SITE_URL=${SITE_URL:-"https://web3-defi-vocab-battle.vercel.app"}
TIMEOUT=${TIMEOUT:-10}
MAX_RETRIES=${MAX_RETRIES:-3}

echo "🔍 开始健康检查..."
echo "🌐 检查网站: $SITE_URL"

# 检查主页
check_endpoint() {
  local url=$1
  local description=$2
  local retry_count=0
  
  echo "📍 检查 $description: $url"
  
  while [ $retry_count -lt $MAX_RETRIES ]; do
    if curl -f -s --max-time $TIMEOUT "$url" > /dev/null; then
      echo "✅ $description 正常"
      return 0
    else
      retry_count=$((retry_count + 1))
      echo "⚠️ $description 检查失败，重试 $retry_count/$MAX_RETRIES"
      sleep 2
    fi
  done
  
  echo "❌ $description 检查失败"
  return 1
}

# 检查各个端点
FAILED=0

check_endpoint "$SITE_URL" "主页" || FAILED=1
check_endpoint "$SITE_URL/practice" "练习页面" || FAILED=1
check_endpoint "$SITE_URL/progress" "进度页面" || FAILED=1
check_endpoint "$SITE_URL/settings" "设置页面" || FAILED=1
check_endpoint "$SITE_URL/manifest.json" "PWA Manifest" || FAILED=1
check_endpoint "$SITE_URL/service-worker.js" "Service Worker" || FAILED=1

# 检查性能指标
echo "📊 检查性能指标..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$SITE_URL")
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc)

echo "⏱️ 响应时间: ${RESPONSE_TIME_MS}ms"

if (( $(echo "$RESPONSE_TIME > 3" | bc -l) )); then
  echo "⚠️ 响应时间过长 (>${RESPONSE_TIME_MS}ms)"
  FAILED=1
fi

# 检查 HTTP 状态码
HTTP_STATUS=$(curl -o /dev/null -s -w '%{http_code}' "$SITE_URL")
echo "📡 HTTP 状态码: $HTTP_STATUS"

if [ "$HTTP_STATUS" != "200" ]; then
  echo "❌ HTTP 状态码异常: $HTTP_STATUS"
  FAILED=1
fi

# 检查安全头
echo "🔒 检查安全头..."
SECURITY_HEADERS=$(curl -I -s "$SITE_URL")

check_header() {
  local header=$1
  local description=$2
  
  if echo "$SECURITY_HEADERS" | grep -i "$header" > /dev/null; then
    echo "✅ $description 已设置"
  else
    echo "⚠️ $description 未设置"
  fi
}

check_header "x-frame-options" "X-Frame-Options"
check_header "x-content-type-options" "X-Content-Type-Options"
check_header "x-xss-protection" "X-XSS-Protection"
check_header "strict-transport-security" "HSTS"

# 检查 PWA 功能
echo "📱 检查 PWA 功能..."
MANIFEST_CONTENT=$(curl -s "$SITE_URL/manifest.json")

if echo "$MANIFEST_CONTENT" | grep -q "name"; then
  echo "✅ PWA Manifest 内容正常"
else
  echo "❌ PWA Manifest 内容异常"
  FAILED=1
fi

# 总结
echo ""
echo "📋 健康检查总结:"
if [ $FAILED -eq 0 ]; then
  echo "✅ 所有检查通过！"
  exit 0
else
  echo "❌ 发现问题，请检查日志"
  exit 1
fi
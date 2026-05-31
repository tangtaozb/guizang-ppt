#!/usr/bin/env bash
# indexnow.sh — 把 URL 主动推送给 Bing / Yandex 等支持 IndexNow 的搜索引擎，
# 让它们「几分钟内」来抓，而不是等数天/数周的自然爬取。
#
# 用法:
#   scripts/indexnow.sh                         # 推送默认核心页面（首页/pricing/blog）
#   scripts/indexnow.sh /blog/my-new-post       # 推送指定路径（发新文章后用）
#   scripts/indexnow.sh /a /b /c                # 一次推多条
#
# key 文件已部署在 https://www.artifyslide.com/<KEY>.txt —— IndexNow 用它验证域名所有权。
set -euo pipefail

HOST="www.artifyslide.com"
KEY="11796cf60344f6bdaa99ee79e272abc0"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

# 默认推送的核心页面（不带参数时）
DEFAULT_PATHS=("/" "/pricing" "/blog")

# 收集要推送的路径：用参数，否则用默认
if [ "$#" -gt 0 ]; then
  paths=("$@")
else
  paths=("${DEFAULT_PATHS[@]}")
fi

# 组装成完整 URL 的 JSON 数组
url_json=""
for p in "${paths[@]}"; do
  # 容错：允许传完整 URL 或仅路径
  case "$p" in
    https://*) full="$p" ;;
    /*)        full="https://${HOST}${p}" ;;
    *)         full="https://${HOST}/${p}" ;;
  esac
  url_json="${url_json}\"${full}\","
done
url_json="[${url_json%,}]"  # 去掉末尾逗号

payload=$(cat <<EOF
{"host":"${HOST}","key":"${KEY}","keyLocation":"${KEY_LOCATION}","urlList":${url_json}}
EOF
)

echo "▸ IndexNow 推送到 Bing："
printf '  %s\n' "${paths[@]}"

# IndexNow 单端点即可，Bing 会分发给其他参与引擎
http_code=$(curl -s -o /tmp/indexnow_resp.txt -w "%{http_code}" \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data "$payload")

# IndexNow 成功返回 200 或 202（已接受）
if [ "$http_code" = "200" ] || [ "$http_code" = "202" ]; then
  echo "✅ 已提交（HTTP $http_code）。Bing 通常几分钟~数小时内抓取。"
else
  echo "✗ 提交异常（HTTP $http_code）：" >&2
  cat /tmp/indexnow_resp.txt >&2
  echo "" >&2
  echo "  常见原因：key 文件还没部署到生产 / key 不匹配。先确认 ${KEY_LOCATION} 可访问。" >&2
  exit 1
fi

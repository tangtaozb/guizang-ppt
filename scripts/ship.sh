#!/usr/bin/env bash
# ship.sh — 在任务 worktree 内运行，把当前分支安全合并到 main、触发并【自动确认】生产部署。
#
# 流程: fetch → rebase origin/main → 清陈旧 .next 生成类型 → tsc 硬门禁 → lint(提示)
#       → push main(被拒自动重试) → 锁定 push 之后触发的生产部署、盯到 Ready/Error。
# 多窗口并发下唯一被串行化的步骤；git 天然防丢提交，绝不 force-push main。
#
# 注：Vercel 这套 git 部署的 `vercel inspect --json` 里 meta 为空、不含 commit SHA，
#     所以无法按 commit 精确认领"我的部署"。这里改用 createdAt 锁定"push 之后出现的
#     那个生产部署"——并发极端情况下它可能是相邻窗口的，但既然是同一个生产环境，
#     盯它的 Ready/Error 仍是有效信号（宁可多报，不可漏报构建失败）。
set -euo pipefail

branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" = "main" ]; then
  echo "你在 main 上 —— ship.sh 必须在功能分支 worktree 内运行。" >&2
  exit 1
fi

GIT_COMMON="$(git rev-parse --path-format=absolute --git-common-dir)"
MAIN_REPO="$(cd "$(dirname "$GIT_COMMON")" && pwd)"   # vercel CLI 需在 .vercel 已链接目录跑
HAS_VERCEL=0; command -v vercel >/dev/null 2>&1 && HAS_VERCEL=1

# 最新生产部署 URL（vercel ls 按时间倒序，取第一条 production 行的 deployment URL）
# 注意：vercel ls 的表格输出在 stderr，必须 2>&1 合并才能 grep 到部署行。
newest_prod_url(){ (cd "$MAIN_REPO" && vercel ls 2>&1) | grep -iE "production" \
  | grep -oE "https://guizang-[a-z0-9]+-[a-z0-9-]+\.vercel\.app" | head -1; }
# 取某部署的顶层 createdAt(ms) 和 readyState（grep -m1 命中 JSON 顶层字段，先于 builds[]）
dep_created(){ (cd "$MAIN_REPO" && vercel inspect "$1" --json 2>/dev/null) | grep -m1 '"createdAt"' | grep -oE '[0-9]{10,}'; }
dep_state(){   (cd "$MAIN_REPO" && vercel inspect "$1" --json 2>/dev/null) | grep -m1 '"readyState"' | sed -E 's/.*"readyState"[^"]*"([A-Z_]+)".*/\1/'; }

echo "▸ fetch + rebase origin/main"
git fetch origin --quiet
if ! git rebase origin/main; then
  echo "✗ rebase 有冲突，请在本 worktree 解决后重跑 ship.sh（git rebase --continue / --abort）。" >&2
  exit 1
fi

# tsconfig include 了 .next/types —— 删/改路由后这些生成类型会陈旧，导致 tsc 误报已删路由（假阳性）。
echo "▸ 清理陈旧 .next 生成类型（避免 tsc 误报已删路由）"
rm -rf .next/types .next/dev/types 2>/dev/null || true

echo "▸ 硬门禁: tsc --noEmit（类型错误会让 Vercel 构建失败 → 必须拦住）"
npx tsc --noEmit
echo "▸ lint（仅提示，不阻断 —— Vercel 构建不跑 eslint，且现有代码尚有 lint 债）"
npm run lint || echo "  ⚠ lint 有 warning/error（不阻断 ship）；新代码尽量别新增。"

PUSH_TS_MS=$(( $(date +%s) * 1000 ))   # push 前时刻，用于识别之后触发的部署

echo "▸ push → main（被拒则 rebase 重试）"
pushed=0
for i in 1 2 3 4 5; do
  if git push origin "HEAD:main"; then pushed=1; break; fi
  echo "  push 被拒（有人先合了），第 $i 次 fetch+rebase 重试…"
  git fetch origin --quiet
  if ! git rebase origin/main; then
    echo "✗ 重试时 rebase 冲突，请手动解决后重跑。" >&2
    exit 1
  fi
done
[ "$pushed" = 1 ] || { echo "✗ 连续 5 次 push 都被拒，main 推送竞争异常，请人工介入。" >&2; exit 1; }
echo "✅ 已推送到 main。"

# ── 闭环：锁定 push 之后的生产部署并盯到终态 ──
if [ "$HAS_VERCEL" != 1 ]; then
  echo "（未装 vercel CLI，请手动确认：vercel ls）"; exit 0
fi
echo "▸ 等 push 之后触发的生产部署出现…"
TARGET=""
for i in $(seq 1 24); do                       # ~3 分钟内等新部署注册
  url="$(newest_prod_url || true)"
  if [ -n "$url" ]; then
    created="$(dep_created "$url" || true)"
    # createdAt 晚于 push 时刻（留 30s 时钟偏差）→ 认定为本次 push 触发的部署
    if [ -n "$created" ] && [ "$created" -ge "$((PUSH_TS_MS - 30000))" ]; then TARGET="$url"; break; fi
  fi
  sleep 8
done
if [ -z "$TARGET" ]; then
  echo "（~3 分钟内没等到 push 之后的新生产部署——可能被去重/与他人合并，请手动确认：vercel ls）"; exit 0
fi
echo "▸ 盯 $TARGET 直到 Ready/Error…"
for i in $(seq 1 36); do                       # ~5 分钟封顶
  st="$(dep_state "$TARGET" || true)"
  case "$st" in
    READY)            echo "✅ 生产部署 Ready：$TARGET"; exit 0;;
    ERROR|CANCELED)   echo "🚨 生产部署 $st！main 可能没上线（生产仍停在上一个好版本）。看日志：$TARGET" >&2; exit 1;;
    *)                sleep 8;;
  esac
done
echo "⌛ 轮询超时仍未 Ready（当前状态: ${st:-未知}），请手动确认：vercel ls"

#!/usr/bin/env bash
# ship.sh — 在任务 worktree 内运行，把当前分支安全合并到 main、触发并【自动确认】生产部署。
#
# 流程: fetch → rebase origin/main → 清陈旧 .next 生成类型 → tsc 硬门禁 → lint(提示)
#       → push main(被拒自动重试) → 轮询 Vercel 生产部署直到 Ready/Error。
# 多窗口并发下唯一被串行化的步骤；git 天然防丢提交，绝不 force-push main。
set -euo pipefail

branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" = "main" ]; then
  echo "你在 main 上 —— ship.sh 必须在功能分支 worktree 内运行。" >&2
  exit 1
fi

# 主工作树路径（vercel CLI 需要在 .vercel 已链接的目录里跑；worktree 没有 .vercel）
GIT_COMMON="$(git rev-parse --path-format=absolute --git-common-dir)"
MAIN_REPO="$(cd "$(dirname "$GIT_COMMON")" && pwd)"
HAS_VERCEL=0; command -v vercel >/dev/null 2>&1 && HAS_VERCEL=1
newest_prod(){ (cd "$MAIN_REPO" && vercel ls 2>/dev/null | awk 'tolower($5)=="production"{print $4; exit}'); }

echo "▸ fetch + rebase origin/main"
git fetch origin --quiet
if ! git rebase origin/main; then
  echo "✗ rebase 有冲突，请在本 worktree 解决后重跑 ship.sh（git rebase --continue / --abort）。" >&2
  exit 1
fi

# tsconfig include 了 .next/types —— 删/改路由后这些生成类型会陈旧，导致 tsc 误报已删路由（假阳性）。
# 跑门禁前清掉它们，只让 tsc 校验真实源码。
echo "▸ 清理陈旧 .next 生成类型（避免 tsc 误报已删路由）"
rm -rf .next/types .next/dev/types 2>/dev/null || true

echo "▸ 硬门禁: tsc --noEmit（类型错误会让 Vercel 构建失败 → 必须拦住）"
npx tsc --noEmit
echo "▸ lint（仅提示，不阻断 —— Vercel 构建不跑 eslint，且现有代码尚有 lint 债）"
npm run lint || echo "  ⚠ lint 有 warning/error（不阻断 ship）；新代码尽量别新增。"

# push 前记下当前最新生产部署，用于之后识别"本次新触发的部署"（避免误报旧的 Ready）
BASE_PROD=""; [ "$HAS_VERCEL" = 1 ] && BASE_PROD="$(newest_prod || true)"

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

# ── 闭环：自动确认 Vercel 生产部署，不再靠人记得看 ──
if [ "$HAS_VERCEL" != 1 ]; then
  echo "（未装 vercel CLI，请手动确认：vercel ls）"; exit 0
fi
echo "▸ 等本次新的生产部署出现…"
NEW_PROD=""
for i in $(seq 1 18); do                      # ~2.5 分钟内等新部署 URL 出现
  cur="$(newest_prod || true)"
  if [ -n "$cur" ] && [ "$cur" != "$BASE_PROD" ]; then NEW_PROD="$cur"; break; fi
  sleep 8
done
if [ -z "$NEW_PROD" ]; then
  echo "（~2 分钟内没看到新生产部署——可能与他人 push 合并/被去重，请手动确认：vercel ls）"; exit 0
fi
echo "▸ 盯 $NEW_PROD 直到 Ready/Error…"
for i in $(seq 1 30); do                       # ~4 分钟封顶
  st="$( (cd "$MAIN_REPO" && vercel inspect "$NEW_PROD" 2>/dev/null) | grep -oE '● Ready|● Error|● Canceled' | head -1)"
  case "$st" in
    *Ready*)    echo "✅ 生产部署 Ready：$NEW_PROD"; exit 0;;
    *Error*)    echo "🚨 生产部署 Error！main 没上线（生产仍停在上一个好版本）。看日志：$NEW_PROD" >&2; exit 1;;
    *Canceled*) echo "⚠ 生产部署被取消（多半被更新的部署覆盖），手动确认：vercel ls"; exit 0;;
    *)          sleep 8;;
  esac
done
echo "⌛ 轮询超时仍未 Ready，请手动确认：vercel ls"

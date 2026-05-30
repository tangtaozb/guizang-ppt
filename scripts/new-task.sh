#!/usr/bin/env bash
# new-task.sh <slug> [type] — 为一个任务开独立 worktree + 分支（从最新 origin/main 切出）。
#
# 多窗口/AI 并发开发的第一步：永远先跑这个，绝不在 main 主工作树里直接改代码。
# 用法:  scripts/new-task.sh empty-state           # → feat/empty-state
#        scripts/new-task.sh fix-login fix          # → fix/fix-login
set -euo pipefail

slug="${1:-}"
type="${2:-feat}"
if [ -z "$slug" ]; then
  echo "用法: scripts/new-task.sh <slug> [type=feat|fix|copy|design|chore]" >&2
  exit 1
fi
branch="$type/$slug"

# 解析主工作树路径（即便从某个 worktree 内运行也能定位到共享 .git 的根）
GIT_COMMON="$(git rev-parse --path-format=absolute --git-common-dir)"
MAIN_REPO="$(cd "$(dirname "$GIT_COMMON")" && pwd)"
WT_ROOT="$(dirname "$MAIN_REPO")/wt"
dir="$WT_ROOT/$slug"

mkdir -p "$WT_ROOT"
if [ -e "$dir" ]; then
  echo "目录已存在: $dir（换个 slug 或先 scripts/cleanup-task.sh $slug）" >&2
  exit 1
fi

git -C "$MAIN_REPO" fetch origin --quiet
git -C "$MAIN_REPO" worktree add -b "$branch" "$dir" origin/main

# 复用主仓库依赖与本地密钥，避免重装 / 重配
ln -s "$MAIN_REPO/node_modules" "$dir/node_modules"
[ -f "$MAIN_REPO/.env.local" ] && ln -s "$MAIN_REPO/.env.local" "$dir/.env.local"

# 分配一个空闲端口（3100-3199）做本地预览
port=3100
while lsof -ti:"$port" >/dev/null 2>&1; do port=$((port + 1)); done

cat <<EOF

✅ worktree 就绪
   目录:   $dir
   分支:   $branch  (基于最新 origin/main)
   本地预览:  cd "$dir" && npm run dev -- --port $port --webpack
              # symlink 的 node_modules 与 Turbopack 不兼容，本地用 --webpack

   推预览:  git push origin HEAD:$branch     # 自动生成 Vercel 预览链接（Creem 测试、noindex）
   上线:    scripts/ship.sh                  # rebase-retry + 门禁 + push main
   收尾:    scripts/cleanup-task.sh $slug
EOF

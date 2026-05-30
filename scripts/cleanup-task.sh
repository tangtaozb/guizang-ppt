#!/usr/bin/env bash
# cleanup-task.sh <slug> — 任务合并上线后，删掉对应 worktree 和已合并的分支。
# 用法:  scripts/cleanup-task.sh empty-state
set -euo pipefail

slug="${1:-}"
if [ -z "$slug" ]; then
  echo "用法: scripts/cleanup-task.sh <slug>" >&2
  exit 1
fi

GIT_COMMON="$(git rev-parse --path-format=absolute --git-common-dir)"
MAIN_REPO="$(cd "$(dirname "$GIT_COMMON")" && pwd)"
WT_ROOT="$(dirname "$MAIN_REPO")/wt"
dir="$WT_ROOT/$slug"

# 先记下该 worktree 的分支名，再移除
branch=""
if [ -d "$dir" ]; then
  branch="$(git -C "$dir" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  git -C "$MAIN_REPO" worktree remove "$dir" --force
  echo "✓ 已移除 worktree: $dir"
else
  echo "（worktree 目录不存在，跳过：$dir）"
fi

# 删本地分支（仅当已并入 origin/main 才安全删除，未合并用 -D 需手动确认）
if [ -n "$branch" ] && [ "$branch" != "main" ]; then
  git -C "$MAIN_REPO" fetch origin --quiet
  if git -C "$MAIN_REPO" branch --merged origin/main | grep -qx "  $branch"; then
    git -C "$MAIN_REPO" branch -d "$branch" && echo "✓ 已删除已合并分支: $branch"
  else
    echo "⚠ 分支 $branch 尚未并入 origin/main，未自动删除。确认无用后手动: git branch -D $branch"
  fi
fi

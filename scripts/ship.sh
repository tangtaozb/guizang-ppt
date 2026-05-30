#!/usr/bin/env bash
# ship.sh — 在某个任务 worktree 内运行，把当前分支安全合并到 main 并触发生产部署。
#
# 流程: fetch → rebase origin/main → 本地门禁(tsc + lint) → push main(被拒自动重试)。
# 这是多窗口并发下唯一被串行化的步骤；git 天然防丢提交，绝不 force-push main。
set -euo pipefail

branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" = "main" ]; then
  echo "你在 main 上 —— ship.sh 必须在功能分支 worktree 内运行。" >&2
  exit 1
fi

echo "▸ fetch + rebase origin/main"
git fetch origin --quiet
if ! git rebase origin/main; then
  echo "✗ rebase 有冲突，请在本 worktree 解决后重跑 ship.sh（git rebase --continue / --abort）。" >&2
  exit 1
fi

echo "▸ 硬门禁: tsc --noEmit（类型错误会让 Vercel 构建失败 → 必须拦住）"
npx tsc --noEmit
echo "▸ lint（仅提示，不阻断 —— Vercel 构建不跑 eslint，且现有代码尚有 lint 债）"
npm run lint || echo "  ⚠ lint 有 warning/error（不阻断 ship）；新代码尽量别新增。"

echo "▸ push → main（被拒则 rebase 重试）"
for i in 1 2 3 4 5; do
  if git push origin "HEAD:main"; then
    echo ""
    echo "✅ 已推送到 main。Vercel 会自动部署生产。"
    echo "   去确认这次部署走到 Ready 而非 Error:  vercel ls | head"
    exit 0
  fi
  echo "  push 被拒（有人先合了），第 $i 次 fetch+rebase 重试…"
  git fetch origin --quiet
  if ! git rebase origin/main; then
    echo "✗ 重试时 rebase 冲突，请手动解决后重跑。" >&2
    exit 1
  fi
done

echo "✗ 连续 5 次 push 都被拒，main 推送竞争异常，请人工介入。" >&2
exit 1

@AGENTS.md

# 发布工作流（务必遵守 · 详见 docs/RELEASE.md）

多窗口/多 AI 并发开发。Vercel↔GitHub 已连：**push `main`→自动上线生产**，push 其他分支→自动预览。

**铁律：**
1. **任何改代码的任务，第一步先 `scripts/new-task.sh <slug>` 开独立 worktree。绝不在本仓库主工作树（`…/guizang-ppt`，分支 main）里直接编辑** —— 这是上次多窗口互相覆盖、main 分叉的根因。
2. **合并 main 只用 `scripts/ship.sh`**：它强制 rebase 到最新 `origin/main`，跑 `tsc --noEmit`（硬门禁）+ `lint`（仅提示），push 被拒自动重试。**永不 force-push main。**
3. `ship.sh` 末尾会**自动轮询确认生产部署 Ready/Error**（不用你手动看；Error 时非零退出）。
4. 收尾 `scripts/cleanup-task.sh <slug>`。

**环境**：生产=`main`=真 Supabase+真扣款；预览=其他分支=共享生产 Supabase + Creem 测试(不扣款) + noindex。`VERCEL_ENV==='production'` 是判定生产的唯一开关（见 `src/app/robots.ts`、`src/app/layout.tsx`），漏配=按非生产处理（安全默认）。

**本地预览**：worktree 的 `node_modules` 是 symlink，与 Turbopack 不兼容 → 用 `npm run dev -- --port <p> --webpack`。

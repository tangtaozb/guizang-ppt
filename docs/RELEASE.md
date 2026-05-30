# 发布与分支工作流（ArtifySlide）

单人 + 多窗口（含多个 AI 窗口）并发开发。本文是**唯一权威流程**，脚本在 `scripts/`。

## 环境模型

| | 触发 | 后端 | 域名 | 索引 |
|---|---|---|---|---|
| **生产** | push `main` | 生产 Supabase + **真 Creem（真扣款）** | www.artifyslide.com | 可索引 |
| **预览** | push 任意其他分支 | 生产 Supabase（共享）+ **Creem 测试（不扣款）** | Vercel 自动预览 URL | `noindex`（整站 Disallow）|

- Vercel↔GitHub 已连：**push 即部署**（main→生产，其他分支→预览），无需手动 `vercel --prod`。
- 预览安全边界由 **Vercel Preview 作用域环境变量** + 代码里的 `VERCEL_ENV` 守卫共同保证：
  - 预览 `CREEM_API_URL=https://test-api.creem.io/v1` 且不配真 `CREEM_API_KEY` → **预览不可能真实扣款**。再加一道代码硬保险：`creem.ts` 在 `VERCEL_ENV !== "production"` 时**强制走测试端点**——即便 Preview 哪天被误配了生产 key+URL，也扣不了款。
  - `src/app/robots.ts` / `src/app/layout.tsx` 用 `process.env.VERCEL_ENV === "production"` 判定，非生产一律 `noindex` 且关闭 GA。漏配 = 安全默认（不被索引）。
  - 预览**不配 `RESEND_API_KEY`** → `send-code` 把 OTP 内联返回（`route.ts:96-99`），测试登录免收件箱。

## 日常流程（四步）

```bash
# 1) 开任务（永远先做这步，别在 main 主工作树里编辑）
scripts/new-task.sh <slug> [feat|fix|copy|design|chore]

# 2) 本地预览（symlink 的 node_modules 用 --webpack）
cd ../wt/<slug> && npm run dev -- --port <port> --webpack

# 3) 推预览自测（可选）：自动出 Vercel 预览链接
git push origin HEAD:<branch>

# 4) 上线：rebase-retry + 本地门禁(tsc+lint) + push main → 自动生产部署
scripts/ship.sh
#   完成后确认部署 Ready：  vercel ls | head

# 收尾
scripts/cleanup-task.sh <slug>
```

## 铁律（防止踩踏 / 防止破坏 main）

1. **绝不在 `…/guizang-ppt`（main 主工作树）里直接改代码。** 每个任务都用 `new-task.sh` 开独立 worktree —— worktree 共享 `.git` 但工作文件/HEAD 独立，多窗口零干扰。
2. **合并 main 只走 `ship.sh`。** 它强制 rebase 到最新 `origin/main`，跑 **`tsc --noEmit`（硬门禁，类型错误会让 Vercel 构建失败）** + `lint`（仅提示，Vercel 构建不跑 eslint）。没有 CI，tsc 这道闸就是挡住"类型错误进生产"的唯一防线。
3. **push 被拒 = 有人先合了** → `ship.sh` 自动 fetch+rebase 重试。**永远不对 `main` 做 force-push。**
4. **`ship.sh` 会自动轮询确认生产部署 Ready/Error**（不再靠人记得看）：Error 时它非零退出并提示看日志；构建失败时生产仍停在上一个好版本。

## staging（按需，可选）

需要多功能联调或对外演示时：长期分支 `staging`，同走预览作用域（自动 Creem 测试），可在 Vercel Domains 绑 `staging.artifyslide.com`。日常不需要——功能分支预览链接已能验证真实行为。

## 已知取舍 & 残留风险（共享生产 Supabase 的代价）

- 预览登录/生成会在**生产库**产生真实 `profiles`/`projects` 行并消耗真实积分（DeepSeek 真实调用，成本低）。测试用带 `test+` 前缀的邮箱，便于日后清理。
- 预览部署持有生产 Supabase service-role key（与生产同信任级别）。预览 URL 是不可猜的 hash；**建议在 Vercel 开启 Deployment Protection**（要求 Vercel 登录才能访问预览），进一步收口。
- 要彻底干净（测试数据不落生产库）时，再升级为独立测试 Supabase：新建项目 → 依次重放 `supabase/migration.sql` → `migration-auth.sql` → `migration-creem.sql` → 把 Preview 作用域的 Supabase 三个变量换成测试项目值即可，无需改代码。

## Vercel 环境变量参考

- **Production 作用域**：全套真实值（现状）。
- **Preview 作用域**：Supabase 三件套（与生产同值，共享）、DeepSeek 三件套、Unsplash、`CREEM_API_URL=https://test-api.creem.io/v1`；**不配** `RESEND_API_KEY`、真 `CREEM_API_KEY`/`CREEM_PRODUCT_*`、`NEXT_PUBLIC_GA_ID`。
- 改环境变量后需触发一次新部署才生效。

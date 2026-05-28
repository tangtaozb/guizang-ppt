-- ════════════════════════════════════════════════════════════
-- Creem.io 接入：订阅 + 积分模型迁移
-- 在 Supabase Dashboard → SQL Editor → New query 里执行一次
-- ════════════════════════════════════════════════════════════

-- 1. profiles 加 Creem 订阅相关字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creem_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creem_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_creem_subscription ON profiles(creem_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_creem_customer ON profiles(creem_customer_id);

-- 2. plan 字段：旧值 free/per_use/monthly/yearly → 新值 free/starter/pro/ultra
-- 没有真实付费用户的前提下，直接全部重置回 free 再改约束
UPDATE profiles SET plan = 'free' WHERE plan IN ('per_use', 'monthly', 'yearly');

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'ultra'));

-- 3. credit_records.type 加 'renew'（订阅周期刷新积分时使用）+ 'refund'
ALTER TABLE credit_records DROP CONSTRAINT IF EXISTS credit_records_type_check;
ALTER TABLE credit_records ADD CONSTRAINT credit_records_type_check
  CHECK (type IN ('generate', 'edit', 'purchase', 'renew', 'refund'));

-- 4. 幂等表：Creem webhook 事件去重（防止网络重试导致积分重复发放）
CREATE TABLE IF NOT EXISTS creem_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creem_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_events" ON creem_webhook_events FOR ALL USING (true) WITH CHECK (true);

-- GuiZang PPT - Supabase Schema Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- ══════════════════════════════════════
-- 1. Users / Profiles
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT,
  nickname TEXT DEFAULT '用户',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'per_use', 'monthly', 'yearly')),
  credits INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- 2. Projects
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT '未命名演示',
  theme TEXT DEFAULT 'ink-classic',
  source_text TEXT DEFAULT '',
  current_html TEXT DEFAULT '',
  slide_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

-- ══════════════════════════════════════
-- 3. Project Versions
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  html TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_versions_project ON project_versions(project_id);

-- ══════════════════════════════════════
-- 4. Chat Messages
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);

-- ══════════════════════════════════════
-- 5. Credit Records
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS credit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('generate', 'edit', 'purchase')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  project_title TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_user ON credit_records(user_id);

-- ══════════════════════════════════════
-- 6. Enable Row Level Security (all tables)
-- ══════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_records ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (our API routes use service_role key)
CREATE POLICY "service_role_all" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON project_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON credit_records FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════
-- 7. Auto-update updated_at trigger
-- ══════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════
-- 8. Insert default seed (initial user for dev)
-- ══════════════════════════════════════
INSERT INTO profiles (id, phone, nickname, plan, credits)
VALUES ('00000000-0000-0000-0000-000000000001', '138****0000', '用户', 'free', 100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO credit_records (user_id, type, amount, description, project_title)
VALUES ('00000000-0000-0000-0000-000000000001', 'purchase', 100, '新用户赠送积分', '');

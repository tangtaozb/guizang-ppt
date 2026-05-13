-- GuiZang PPT - D1 Database Schema

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  nickname    TEXT DEFAULT '',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS verification_codes (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  used        INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  plan            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  tokens_remaining INTEGER DEFAULT 0,
  provider        TEXT NOT NULL DEFAULT 'lemonsqueezy',
  provider_sub_id TEXT,
  starts_at       TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at      TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  title           TEXT DEFAULT '未命名演示',
  theme           TEXT DEFAULT 'ink-classic',
  source_type     TEXT,
  source_text     TEXT,
  current_html    TEXT,
  slide_count     INTEGER DEFAULT 0,
  total_tokens    INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  project_id      TEXT NOT NULL REFERENCES projects(id),
  role            TEXT NOT NULL,
  content         TEXT NOT NULL,
  tokens_used     INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES users(id),
  amount_cents      INTEGER NOT NULL,
  currency          TEXT DEFAULT 'CNY',
  provider          TEXT NOT NULL,
  provider_order_id TEXT,
  status            TEXT DEFAULT 'pending',
  plan              TEXT NOT NULL,
  created_at        TEXT DEFAULT (datetime('now')),
  paid_at           TEXT
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);

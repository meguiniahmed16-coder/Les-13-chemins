CREATE TABLE IF NOT EXISTS web_admin_credentials (
  id TEXT PRIMARY KEY CHECK (id = 'admin'),
  password_hash TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

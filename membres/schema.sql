CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY, provider TEXT NOT NULL, subject TEXT NOT NULL,
  email TEXT NOT NULL, secret TEXT, pseudo TEXT NOT NULL, birth TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '', avatar TEXT NOT NULL, created INTEGER NOT NULL,
  UNIQUE(provider,subject)
);
CREATE TABLE IF NOT EXISTS member_sessions (token TEXT PRIMARY KEY, member TEXT NOT NULL REFERENCES members(id), expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON member_sessions(expires);
CREATE TABLE IF NOT EXISTS member_activity (member TEXT NOT NULL REFERENCES members(id), kind TEXT NOT NULL, item TEXT NOT NULL, PRIMARY KEY(member,kind,item));
CREATE TABLE IF NOT EXISTS member_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS member_oauth (state TEXT PRIMARY KEY, provider TEXT NOT NULL, verifier TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS member_checkout (ref TEXT PRIMARY KEY, member TEXT NOT NULL REFERENCES members(id), created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS member_subscriptions (id TEXT PRIMARY KEY, member TEXT, paid_until INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT '', changed INTEGER NOT NULL DEFAULT 0, ending INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS subscription_owner ON member_subscriptions(member);
CREATE TABLE IF NOT EXISTS member_admin_settings (key TEXT PRIMARY KEY,value TEXT NOT NULL);

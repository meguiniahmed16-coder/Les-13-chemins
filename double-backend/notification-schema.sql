CREATE TABLE IF NOT EXISTS notification_settings (
 id TEXT PRIMARY KEY CHECK(id='visits'),
 mode TEXT NOT NULL DEFAULT 'immediate' CHECK(mode IN ('immediate','daily','off')),
 version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL
);
INSERT OR IGNORE INTO notification_settings(id,mode,version,updated_at) VALUES('visits','immediate',1,strftime('%Y-%m-%dT%H:%M:%fZ','now'));
CREATE TABLE IF NOT EXISTS visit_digests (
 id TEXT PRIMARY KEY,
 created_at TEXT NOT NULL,
 state TEXT NOT NULL,
 visit_count INTEGER NOT NULL DEFAULT 0,
 mail_id TEXT
);
CREATE INDEX IF NOT EXISTS visits_mail_queue ON visits(mail_state,created_at);

CREATE TABLE IF NOT EXISTS voice_preferences(id TEXT PRIMARY KEY,prefs_json TEXT NOT NULL,version INTEGER NOT NULL,updated_at TEXT NOT NULL);
INSERT OR IGNORE INTO voice_preferences VALUES('author','{"tone":"spoken","length":"balanced","humor":"warm","teasing":true}',1,'2026-11-15T00:00:00Z');
CREATE TABLE IF NOT EXISTS voice_preference_proposals(session_id TEXT PRIMARY KEY,patch_json TEXT NOT NULL,base_version INTEGER NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS voice_preference_history(version INTEGER PRIMARY KEY,before_json TEXT NOT NULL,after_json TEXT NOT NULL,created_at TEXT NOT NULL);

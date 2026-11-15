CREATE TABLE IF NOT EXISTS conversation_archives (
  session_id TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  created_at TEXT NOT NULL,
  archived_at TEXT NOT NULL,
  turn_count INTEGER NOT NULL,
  transcript_json TEXT NOT NULL,
  published_json TEXT,
  published_at TEXT,
  published_archive_at TEXT
);
CREATE INDEX IF NOT EXISTS conversation_archives_date ON conversation_archives(archived_at DESC,session_id DESC);

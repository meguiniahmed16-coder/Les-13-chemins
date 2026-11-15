ALTER TABLE posts ADD COLUMN content_json TEXT;
ALTER TABLE posts ADD COLUMN cover_json TEXT;
ALTER TABLE post_revisions ADD COLUMN content_json TEXT;
ALTER TABLE post_revisions ADD COLUMN cover_json TEXT;
CREATE TABLE IF NOT EXISTS blog_media(id TEXT PRIMARY KEY,object_key TEXT NOT NULL,mime TEXT NOT NULL,size INTEGER NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS post_media(post_id TEXT NOT NULL,media_id TEXT NOT NULL,PRIMARY KEY(post_id,media_id));
CREATE INDEX IF NOT EXISTS post_media_asset ON post_media(media_id);

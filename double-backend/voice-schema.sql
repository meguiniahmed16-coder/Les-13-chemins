-- Run once when sessions.address_mode is absent.
ALTER TABLE sessions ADD COLUMN address_mode TEXT NOT NULL DEFAULT 'tu';

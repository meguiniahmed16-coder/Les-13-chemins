CREATE TABLE IF NOT EXISTS legal_withdrawals (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, contract TEXT NOT NULL,
 received TEXT NOT NULL, acknowledged TEXT
);
CREATE INDEX IF NOT EXISTS legal_withdrawals_received ON legal_withdrawals(received);

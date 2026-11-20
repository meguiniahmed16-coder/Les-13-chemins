CREATE TABLE IF NOT EXISTS bois_pieces (
 id TEXT PRIMARY KEY, revision INTEGER NOT NULL, state TEXT NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS bois_orders (
 id TEXT PRIMARY KEY, piece TEXT NOT NULL, variant TEXT NOT NULL, zone TEXT NOT NULL, status TEXT NOT NULL,
 snapshot TEXT NOT NULL, created INTEGER NOT NULL, session TEXT UNIQUE, url TEXT, buyer TEXT, shipped INTEGER
);
CREATE INDEX IF NOT EXISTS bois_stock ON bois_orders(piece,variant,status);
CREATE INDEX IF NOT EXISTS bois_pending ON bois_orders(status,created);
CREATE TABLE IF NOT EXISTS bois_settings (id TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TRIGGER IF NOT EXISTS bois_stock_paid AFTER UPDATE OF status ON bois_orders
 WHEN NEW.status='paid' AND OLD.status!='paid' BEGIN
 UPDATE bois_pieces SET revision=revision+1 WHERE id=NEW.piece;
END;
CREATE TRIGGER IF NOT EXISTS bois_hold_revision AFTER INSERT ON bois_orders BEGIN
 UPDATE bois_pieces SET revision=revision+1 WHERE id=NEW.piece;
END;
CREATE TRIGGER IF NOT EXISTS bois_release_revision AFTER UPDATE OF status ON bois_orders
 WHEN NEW.status='expired' AND OLD.status!='expired' BEGIN
 UPDATE bois_pieces SET revision=revision+1 WHERE id=NEW.piece;
END;

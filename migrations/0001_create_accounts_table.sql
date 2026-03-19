CREATE TABLE IF NOT EXISTS accounts (
	account_id TEXT PRIMARY KEY NOT NULL,
	id_token TEXT NOT NULL,
	access_token TEXT NOT NULL,
	refresh_token TEXT NOT NULL,
	last_refresh TEXT NOT NULL,
	email TEXT NOT NULL,
	type TEXT NOT NULL,
	expired TEXT NOT NULL
);

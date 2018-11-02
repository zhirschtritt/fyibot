-- Up
CREATE VIRTUAL TABLE fyi USING fts5(timestamp, userName, content);

-- Down
DROP TABLE fyi
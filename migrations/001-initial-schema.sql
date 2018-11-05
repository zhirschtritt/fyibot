-- Up
CREATE VIRTUAL TABLE fyi USING fts5(eventTimestamp, userName, content);

-- Down
DROP TABLE fyi
-- Human Repair Map — contribution pipeline.
-- The event log is append-only and hash-chained: every row carries the hash of
-- the row before it, so any edit or deletion after the fact breaks the chain and
-- /api/verify will say so. Proposals are a view over events, not a source of truth.

CREATE TABLE IF NOT EXISTS events (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  ts         TEXT    NOT NULL,           -- ISO8601, server-assigned
  type       TEXT    NOT NULL,           -- proposal.submitted | review.verdict | record.amended
  record_id  TEXT    NOT NULL,           -- which map record this concerns
  actor      TEXT    NOT NULL,           -- who/what: 'human:<name>' | 'agent:<model>' | 'steward'
  payload    TEXT    NOT NULL,           -- JSON
  prev_hash  TEXT    NOT NULL,           -- hash of the preceding event ('genesis' for the first)
  hash       TEXT    NOT NULL UNIQUE     -- sha256(seq|ts|type|record_id|actor|payload|prev_hash)
);

CREATE INDEX IF NOT EXISTS idx_events_record ON events(record_id);
CREATE INDEX IF NOT EXISTS idx_events_type   ON events(type);

CREATE TABLE IF NOT EXISTS proposals (
  id         TEXT PRIMARY KEY,           -- p_<hash prefix>
  created    TEXT NOT NULL,
  record_id  TEXT NOT NULL,
  kind       TEXT NOT NULL,              -- correction | rung-challenge | new-evidence | question
  summary    TEXT NOT NULL,
  rationale  TEXT NOT NULL,
  source_url TEXT,                       -- the primary source being offered
  proposer   TEXT NOT NULL,              -- display name, or 'anonymous'
  affil      TEXT,                       -- optional, self-declared, never verified
  state      TEXT NOT NULL DEFAULT 'submitted',  -- submitted | in-review | accepted | declined | disputed
  verdicts   TEXT NOT NULL DEFAULT '[]', -- JSON array of adversarial review verdicts
  event_hash TEXT NOT NULL               -- links to the event that created it
);

CREATE INDEX IF NOT EXISTS idx_proposals_record ON proposals(record_id);
CREATE INDEX IF NOT EXISTS idx_proposals_state  ON proposals(state);

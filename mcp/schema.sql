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

-- v0.3: locked predictions. A view over events (type prediction.registered);
-- the event log remains the source of truth. State moves only by a steward
-- appending a prediction.resolved event and updating this row.
CREATE TABLE IF NOT EXISTS predictions (
  id                  TEXT PRIMARY KEY,           -- pr_<hash prefix>
  created             TEXT NOT NULL,
  subject             TEXT NOT NULL,              -- hrm: node id
  statement           TEXT NOT NULL,
  probability         REAL NOT NULL,
  resolution_criteria TEXT NOT NULL,
  horizon             TEXT NOT NULL,              -- YYYY-MM-DD
  predictor_type      TEXT NOT NULL,              -- human | ai
  predictor_name      TEXT NOT NULL,
  predictor_model     TEXT,
  evidence_accessed   TEXT NOT NULL DEFAULT '[]', -- JSON array of node ids
  reasoning           TEXT,
  graph_snapshot      TEXT NOT NULL,              -- version@hash the predictor saw
  state               TEXT NOT NULL DEFAULT 'open', -- open | resolved-true | resolved-false | void
  resolved_at         TEXT,
  resolved_by         TEXT,
  resolution_note     TEXT,
  event_hash          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_predictions_subject ON predictions(subject);
CREATE INDEX IF NOT EXISTS idx_predictions_state   ON predictions(state);

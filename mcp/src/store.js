/* The write side: proposals and predictions over D1, hash-chained.

   Every event stores the hash of the event before it. Editing or deleting any
   row after the fact breaks every hash downstream, and /api/verify walks the
   chain and reports the first break. That is the whole guarantee — not that
   nobody can change the database, but that nobody can change it silently.

   Writes are public and unauthenticated by design (a commons nobody can
   contribute to is a publication). Nothing submitted is ever displayed as
   fact: proposals enter as `submitted`, predictions as `open`, and only a
   steward can move them. Rate limiting is left to the edge. */

import { MANIFEST, NODES } from "./graph.js";

const LIMITS = { summary: 300, rationale: 4000, url: 500, name: 120, affil: 200, perPage: 100, statement: 600, criteria: 2000, reasoning: 4000, record: 20000 };
const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function createStore(db) {
  if (!db) return null;

  async function appendEvent({ type, record_id, actor, payload }) {
    const tip = await db.prepare("SELECT hash FROM events ORDER BY seq DESC LIMIT 1").first();
    const prev_hash = tip ? tip.hash : "genesis";
    const ts = new Date().toISOString();
    const body = JSON.stringify(payload);
    const seqRow = await db.prepare("SELECT COALESCE(MAX(seq),0)+1 AS next FROM events").first();
    const seq = seqRow.next;
    const hash = await sha256([seq, ts, type, record_id, actor, body, prev_hash].join("|"));
    await db.prepare("INSERT INTO events (seq, ts, type, record_id, actor, payload, prev_hash, hash) VALUES (?,?,?,?,?,?,?,?)")
      .bind(seq, ts, type, record_id, actor, body, prev_hash, hash).run();
    return { seq, ts, hash, prev_hash };
  }

  return {
    async submitProposal(b) {
      const record_id = clean(b.record_id, 120);
      const kind = clean(b.kind, 40);
      const summary = clean(b.summary, LIMITS.summary);
      const rationale = clean(b.rationale, LIMITS.rationale);
      const source_url = clean(b.source_url, LIMITS.url);
      const proposer = clean(b.proposer, LIMITS.name) || "anonymous";
      const affil = clean(b.affil, LIMITS.affil);
      const actorPrefix = b.actorPrefix === "agent" ? "agent" : "human";
      if (!record_id) return { error: "record_id is required" };
      if (!summary) return { error: "summary is required — say what is wrong in one line" };
      if (!rationale) return { error: "rationale is required — a claim without reasoning cannot be reviewed" };
      if (!["correction", "rung-challenge", "new-evidence", "new-node", "new-dependency", "question"].includes(kind))
        return { error: "kind must be correction, rung-challenge, new-evidence, new-node, new-dependency or question" };
      if (source_url && !/^https?:\/\//i.test(source_url)) return { error: "source_url must be http(s)" };
      if (b.website) return { ok: true, id: "p_ignored" }; // honeypot
      let proposed_record = null;
      if (b.proposed_record !== undefined) {
        const s = JSON.stringify(b.proposed_record);
        if (s.length > LIMITS.record) return { error: `proposed_record exceeds ${LIMITS.record} characters` };
        proposed_record = b.proposed_record;
      }
      const payload = { kind, summary, rationale, source_url, affil, ...(proposed_record ? { proposed_record } : {}), graphSnapshot: MANIFEST.contentHash.slice(0, 12), knownRecord: NODES.has(record_id) };
      const ev = await appendEvent({ type: "proposal.submitted", record_id, actor: `${actorPrefix}:${proposer}`, payload });
      const id = "p_" + ev.hash.slice(0, 10);
      await db.prepare("INSERT INTO proposals (id, created, record_id, kind, summary, rationale, source_url, proposer, affil, state, verdicts, event_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
        .bind(id, ev.ts, record_id, kind, summary, rationale, source_url, proposer, affil, "submitted", "[]", ev.hash).run();
      return { ok: true, id, state: "submitted", event: ev, knownRecord: NODES.has(record_id), note: "Recorded in the public event log. It will not change any record until a steward reviews it, and the map will show it as unreviewed until then." };
    },

    async listProposals(record, limit = LIMITS.perPage) {
      const q = record
        ? db.prepare("SELECT * FROM proposals WHERE record_id = ? ORDER BY created DESC LIMIT ?").bind(record, limit)
        : db.prepare("SELECT * FROM proposals ORDER BY created DESC LIMIT ?").bind(limit);
      const { results } = await q.all();
      return { count: results.length, proposals: results.map((p) => ({ ...p, verdicts: JSON.parse(p.verdicts || "[]") })) };
    },

    async registerPrediction(b) {
      const subject = clean(b.subject, 200);
      const statement = clean(b.statement, LIMITS.statement);
      const resolutionCriteria = clean(b.resolutionCriteria, LIMITS.criteria);
      const horizon = clean(b.horizon, 10);
      const probability = Number(b.probability);
      const pr = b.predictor || {};
      const predictor = { type: pr.type === "ai" ? "ai" : "human", name: clean(pr.name, LIMITS.name), model: clean(pr.model, 120), version: clean(pr.version, 60), orcid: clean(pr.orcid, 19) };
      if (!NODES.has(subject)) return { error: `subject "${subject}" is not a node in this graph` };
      if (statement.length < 15) return { error: "statement must be at least 15 characters and say what will be observed" };
      if (!(probability >= 0 && probability <= 1)) return { error: "probability must be a number between 0 and 1" };
      if (resolutionCriteria.length < 15) return { error: "resolutionCriteria must say exactly what evidence resolves it" };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(horizon)) return { error: "horizon must be YYYY-MM-DD" };
      if (!predictor.name) return { error: "predictor.name is required" };
      if (predictor.type === "ai" && !predictor.model) return { error: "predictor.model is required for an AI predictor" };
      const evidenceAccessed = Array.isArray(b.evidenceAccessed) ? b.evidenceAccessed.filter((x) => typeof x === "string").slice(0, 200) : [];
      const reasoning = clean(b.reasoning, LIMITS.reasoning);
      const graphSnapshot = `${MANIFEST.version}@${MANIFEST.contentHash.slice(0, 12)}`;
      const payload = { subject, statement, probability, resolutionCriteria, horizon, predictor, evidenceAccessed, reasoning, graphSnapshot };
      const ev = await appendEvent({ type: "prediction.registered", record_id: subject, actor: `${predictor.type}:${predictor.name}${predictor.model ? "/" + predictor.model : ""}`, payload });
      const id = "pr_" + ev.hash.slice(0, 10);
      await db.prepare("INSERT INTO predictions (id, created, subject, statement, probability, resolution_criteria, horizon, predictor_type, predictor_name, predictor_model, evidence_accessed, reasoning, graph_snapshot, state, event_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .bind(id, ev.ts, subject, statement, probability, resolutionCriteria, horizon, predictor.type, predictor.name, predictor.model || null, JSON.stringify(evidenceAccessed), reasoning || null, graphSnapshot, "open", ev.hash).run();
      return { ok: true, id, state: "open", graphSnapshot, registeredAt: ev.ts, event: ev, note: "Locked. A steward resolves it against the stated criteria; the registration itself can never be edited." };
    },

    async listPredictions(subject, limit = LIMITS.perPage) {
      const q = subject
        ? db.prepare("SELECT * FROM predictions WHERE subject = ? ORDER BY created DESC LIMIT ?").bind(subject, limit)
        : db.prepare("SELECT * FROM predictions ORDER BY created DESC LIMIT ?").bind(limit);
      const { results } = await q.all();
      return { count: results.length, predictions: results.map((p) => ({ ...p, evidence_accessed: JSON.parse(p.evidence_accessed || "[]") })) };
    },

    async events(record, limit = LIMITS.perPage) {
      const q = record
        ? db.prepare("SELECT * FROM events WHERE record_id = ? ORDER BY seq ASC LIMIT ?").bind(record, limit)
        : db.prepare("SELECT * FROM events ORDER BY seq ASC LIMIT ?").bind(limit);
      const { results } = await q.all();
      return { count: results.length, events: results.map((e) => ({ ...e, payload: JSON.parse(e.payload) })) };
    },

    async verify() {
      const { results } = await db.prepare("SELECT * FROM events ORDER BY seq ASC").all();
      let prev = "genesis";
      for (const e of results) {
        const expect = await sha256([e.seq, e.ts, e.type, e.record_id, e.actor, e.payload, e.prev_hash].join("|"));
        if (e.prev_hash !== prev) return { intact: false, brokenAt: e.seq, reason: "prev_hash does not match the preceding event", checked: results.length };
        if (e.hash !== expect) return { intact: false, brokenAt: e.seq, reason: "content does not match its own hash — this row was altered", checked: results.length };
        prev = e.hash;
      }
      return { intact: true, events: results.length, tip: prev, note: "Every event hashes its own contents plus the hash of the event before it. Altering or deleting any row would break this walk." };
    },

    async stats() {
      const ev = await db.prepare("SELECT COUNT(*) AS n FROM events").first();
      const pr = await db.prepare("SELECT state, COUNT(*) AS n FROM proposals GROUP BY state").all();
      const pd = await db.prepare("SELECT state, COUNT(*) AS n FROM predictions GROUP BY state").all();
      const byState = {}; (pr.results || []).forEach((r) => { byState[r.state] = r.n; });
      const pdState = {}; (pd.results || []).forEach((r) => { pdState[r.state] = r.n; });
      return { events: ev.n, proposals: byState, predictions: pdState, humanReviewed: MANIFEST.humanReviewed, records: NODES.size, graph: `${MANIFEST.version}@${MANIFEST.contentHash.slice(0, 12)}` };
    }
  };
}

/* Contribution pipeline API.

   The chain: every event stores the hash of the event before it. Editing or
   deleting any row after the fact breaks every hash downstream, and /api/verify
   walks the chain and reports the first break. That is the whole guarantee —
   not that nobody can change the database, but that nobody can change it
   silently.

   Writes are public and unauthenticated by design (a commons nobody can
   contribute to is a publication). Nothing submitted is ever displayed as fact:
   proposals enter as `submitted` and only a steward can move them. */

const LIMITS = { summary: 300, rationale: 4000, url: 500, name: 120, affil: 200, perPage: 100 };

const J = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      ...extra
    }
  });

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* Append one event, chained to the current tip. */
async function appendEvent(db, { type, record_id, actor, payload }) {
  const tip = await db.prepare("SELECT hash FROM events ORDER BY seq DESC LIMIT 1").first();
  const prev_hash = tip ? tip.hash : "genesis";
  const ts = new Date().toISOString();
  const body = JSON.stringify(payload);
  const seqRow = await db.prepare("SELECT COALESCE(MAX(seq),0)+1 AS next FROM events").first();
  const seq = seqRow.next;
  const hash = await sha256([seq, ts, type, record_id, actor, body, prev_hash].join("|"));
  await db
    .prepare("INSERT INTO events (seq, ts, type, record_id, actor, payload, prev_hash, hash) VALUES (?,?,?,?,?,?,?,?)")
    .bind(seq, ts, type, record_id, actor, body, prev_hash, hash)
    .run();
  return { seq, ts, hash, prev_hash };
}

function clean(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

export async function handleApi(request, env, url) {
  // A 204 must not carry a body — returning one breaks the preflight.
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  const db = env.DB;
  if (!db) return J({ error: "database not bound" }, 500);
  const path = url.pathname.replace(/^\/api\/?/, "");

  /* ---- POST /api/proposals — anyone may propose a change ---- */
  if (path === "proposals" && request.method === "POST") {
    let b;
    try { b = await request.json(); } catch { return J({ error: "invalid JSON" }, 400); }

    const record_id = clean(b.record_id, 80);
    const kind = clean(b.kind, 40);
    const summary = clean(b.summary, LIMITS.summary);
    const rationale = clean(b.rationale, LIMITS.rationale);
    const source_url = clean(b.source_url, LIMITS.url);
    const proposer = clean(b.proposer, LIMITS.name) || "anonymous";
    const affil = clean(b.affil, LIMITS.affil);

    if (!record_id) return J({ error: "record_id is required" }, 400);
    if (!summary) return J({ error: "summary is required — say what is wrong in one line" }, 400);
    if (!rationale) return J({ error: "rationale is required — a claim without reasoning cannot be reviewed" }, 400);
    if (!["correction", "rung-challenge", "new-evidence", "question"].includes(kind))
      return J({ error: "kind must be correction, rung-challenge, new-evidence or question" }, 400);
    if (source_url && !/^https?:\/\//i.test(source_url)) return J({ error: "source_url must be http(s)" }, 400);
    if (b.website) return J({ ok: true, id: "p_ignored" }); // honeypot

    const ev = await appendEvent(db, {
      type: "proposal.submitted",
      record_id,
      actor: "human:" + proposer,
      payload: { kind, summary, rationale, source_url, affil }
    });
    const id = "p_" + ev.hash.slice(0, 10);
    await db
      .prepare(
        "INSERT INTO proposals (id, created, record_id, kind, summary, rationale, source_url, proposer, affil, state, verdicts, event_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
      )
      .bind(id, ev.ts, record_id, kind, summary, rationale, source_url, proposer, affil, "submitted", "[]", ev.hash)
      .run();

    return J({
      ok: true,
      id,
      state: "submitted",
      event: ev,
      note: "Recorded in the public event log. It will not change any record until a steward reviews it, and the map will show it as unreviewed until then."
    }, 201);
  }

  /* ---- GET /api/proposals[?record=id] ---- */
  if (path === "proposals" && request.method === "GET") {
    const rec = url.searchParams.get("record");
    const q = rec
      ? db.prepare("SELECT * FROM proposals WHERE record_id = ? ORDER BY created DESC LIMIT ?").bind(rec, LIMITS.perPage)
      : db.prepare("SELECT * FROM proposals ORDER BY created DESC LIMIT ?").bind(LIMITS.perPage);
    const { results } = await q.all();
    return J({
      count: results.length,
      proposals: results.map((p) => ({ ...p, verdicts: JSON.parse(p.verdicts || "[]") }))
    });
  }

  /* ---- GET /api/events[?record=id] — the append-only log ---- */
  if (path === "events" && request.method === "GET") {
    const rec = url.searchParams.get("record");
    const q = rec
      ? db.prepare("SELECT * FROM events WHERE record_id = ? ORDER BY seq ASC LIMIT ?").bind(rec, LIMITS.perPage)
      : db.prepare("SELECT * FROM events ORDER BY seq ASC LIMIT ?").bind(LIMITS.perPage);
    const { results } = await q.all();
    return J({
      count: results.length,
      events: results.map((e) => ({ ...e, payload: JSON.parse(e.payload) }))
    });
  }

  /* ---- GET /api/verify — walk the chain and prove it is intact ---- */
  if (path === "verify" && request.method === "GET") {
    const { results } = await db.prepare("SELECT * FROM events ORDER BY seq ASC").all();
    let prev = "genesis";
    for (const e of results) {
      const expect = await sha256([e.seq, e.ts, e.type, e.record_id, e.actor, e.payload, e.prev_hash].join("|"));
      if (e.prev_hash !== prev)
        return J({ intact: false, brokenAt: e.seq, reason: "prev_hash does not match the preceding event", checked: results.length });
      if (e.hash !== expect)
        return J({ intact: false, brokenAt: e.seq, reason: "content does not match its own hash — this row was altered", checked: results.length });
      prev = e.hash;
    }
    return J({
      intact: true,
      events: results.length,
      tip: prev,
      note: "Every event hashes its own contents plus the hash of the event before it. Altering or deleting any row would break this walk."
    });
  }

  /* ---- GET /api/stats ---- */
  if (path === "stats" && request.method === "GET") {
    const ev = await db.prepare("SELECT COUNT(*) AS n FROM events").first();
    const pr = await db.prepare("SELECT state, COUNT(*) AS n FROM proposals GROUP BY state").all();
    const byState = {};
    (pr.results || []).forEach((r) => { byState[r.state] = r.n; });
    return J({ events: ev.n, proposals: byState, humanReviewed: 0, records: 16 });
  }

  return J({ error: "not found", endpoints: ["POST /api/proposals", "GET /api/proposals", "GET /api/events", "GET /api/verify", "GET /api/stats"] }, 404);
}

/* Worker test harness: runs the real fetch handler in node against an
   in-memory D1 shim. No network, no wrangler. `node mcp/test.mjs` — exits
   non-zero on the first failing assertion. CI runs it after the build. */

import worker from "./src/index.js";
/* Counts come from the generated graph, not from constants: the records change whenever a
   proving ground is seeded, and a test that has to be edited with every record is a test
   nobody trusts. What is asserted is the relationship between the API and the build output. */
import { GRAPH } from "./src/generated.js";
const EXPECT = { capabilities: GRAPH.manifest.counts.capability, records: GRAPH.nodes.length, contradictions: (GRAPH.analysis.contradictions || []).length };

/* ---- a tiny D1 shim: just enough SQL for store.js ---- */
function fakeD1() {
  const t = { events: [], proposals: [], predictions: [] };
  const stmt = (sql) => ({
    bind: (...args) => stmt2(sql, args),
    first: () => stmt2(sql, []).first(),
    all: () => stmt2(sql, []).all(),
    run: () => stmt2(sql, []).run()
  });
  const stmt2 = (sql, args) => ({
    async first() {
      if (/SELECT hash FROM events ORDER BY seq DESC/.test(sql)) { const e = t.events[t.events.length - 1]; return e ? { hash: e.hash } : null; }
      if (/MAX\(seq\)/.test(sql)) return { next: t.events.length + 1 };
      if (/COUNT\(\*\) AS n FROM events/.test(sql)) return { n: t.events.length };
      throw new Error("shim: unknown first() sql " + sql);
    },
    async all() {
      const where = (rows, col) => (args.length && /WHERE/.test(sql) ? rows.filter((r) => r[col] === args[0]) : rows);
      if (/FROM proposals/.test(sql)) { if (/GROUP BY state/.test(sql)) return { results: group(t.proposals) }; return { results: where(t.proposals, "record_id").slice().reverse() }; }
      if (/FROM predictions/.test(sql)) { if (/GROUP BY state/.test(sql)) return { results: group(t.predictions) }; return { results: where(t.predictions, "subject").slice().reverse() }; }
      if (/FROM events/.test(sql)) return { results: where(t.events, "record_id") };
      throw new Error("shim: unknown all() sql " + sql);
    },
    async run() {
      if (/INSERT INTO events/.test(sql)) { const [seq, ts, type, record_id, actor, payload, prev_hash, hash] = args; t.events.push({ seq, ts, type, record_id, actor, payload, prev_hash, hash }); return {}; }
      if (/INSERT INTO proposals/.test(sql)) { const [id, created, record_id, kind, summary, rationale, source_url, proposer, affil, state, verdicts, event_hash] = args; t.proposals.push({ id, created, record_id, kind, summary, rationale, source_url, proposer, affil, state, verdicts, event_hash }); return {}; }
      if (/INSERT INTO predictions/.test(sql)) { const k = ["id", "created", "subject", "statement", "probability", "resolution_criteria", "horizon", "predictor_type", "predictor_name", "predictor_model", "evidence_accessed", "reasoning", "graph_snapshot", "state", "event_hash"]; t.predictions.push(Object.fromEntries(k.map((x, i) => [x, args[i]]))); return {}; }
      throw new Error("shim: unknown run() sql " + sql);
    }
  });
  const group = (rows) => { const m = {}; rows.forEach((r) => { m[r.state] = (m[r.state] || 0) + 1; }); return Object.entries(m).map(([state, n]) => ({ state, n })); };
  return { prepare: stmt, _tables: t };
}

const env = { DB: fakeD1() };
const BASE = "https://humanrepairmap.com";
let n = 0, failed = 0;
const ok = (cond, msg) => { n++; if (!cond) { failed++; console.error("  ✕ " + msg); } else console.log("  ✓ " + msg); };
const rpc = async (method, params, id = 1) => {
  const r = await worker.fetch(new Request(BASE + "/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) }), env);
  return { status: r.status, body: await r.json() };
};
const call = async (name, args) => { const r = await rpc("tools/call", { name, arguments: args }); return r.body.result; };
const get = async (p) => { const r = await worker.fetch(new Request(BASE + p), env); return { status: r.status, body: r.headers.get("content-type").includes("json") ? await r.json() : await r.text() }; };
const post = async (p, b) => { const r = await worker.fetch(new Request(BASE + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }), env); return { status: r.status, body: await r.json() }; };

console.log("MCP");
{
  const init = await rpc("initialize", { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "test", version: "0" } });
  ok(init.status === 200 && init.body.result.protocolVersion === "2025-11-25", "initialize negotiates 2025-11-25");
  ok(/never present such a record as validated/.test(init.body.result.instructions), "instructions carry the review caveat");
  const list = await rpc("tools/list");
  const names = list.body.result.tools.map((t) => t.name);
  ok(names.length >= 22, `tools/list has ${names.length} tools`);
  for (const t of ["graph_manifest", "trace_dependency", "rank_research_questions", "get_primary_evidence", "register_prediction", "propose_change", "evidence_state", "repair_grid", "get_route"]) ok(names.includes(t), `tool ${t} listed`);
  const res = await rpc("resources/list");
  ok(res.body.result.resources.some((r) => r.uri.endsWith("/graph/graph.json")), "resources/list points at the bulk export");

  const m = await call("graph_manifest", {});
  ok(m.structuredContent && m.structuredContent.contentHash === GRAPH.manifest.contentHash && m.structuredContent.counts.capability === EXPECT.capabilities, `graph_manifest matches the build: hash and ${EXPECT.capabilities} capabilities`);
  ok(/NOT MEDICAL ADVICE/.test(m.content[0].text), "every tool result carries the caveat");

  const t = await call("trace_dependency", { goal: "scarless-skin-repair" });
  ok(t.structuredContent.bindingConstraints.length >= 1 && t.structuredContent.bindingConstraints[0].rung === "L1", `binding constraint of scarless-skin-repair is ${t.structuredContent.bindingConstraints[0].id} at L1`);
  ok(t.structuredContent.orGroups.length === 2, "two OR groups on the path");
  ok(t.structuredContent.openQuestions.length >= 5, `${t.structuredContent.openQuestions.length} open questions on the path`);

  const r = await call("rank_research_questions", { limit: 5 });
  ok(r.structuredContent.questions[0].id === "hrm:question/en1-inhibition-translates-to-human-skin", "top-ranked question is the En1 translation question");
  const rj = await call("rank_research_questions", { projection: "rejuvenation", limit: 5 });
  ok(rj.structuredContent.questions.every((q) => q.projections.includes("rejuvenation")), "projection filter holds");

  const e = await call("get_primary_evidence", { id: "hrm:capability/keratinocyte-in-vivo-topical-gene-delivery" });
  ok(e.structuredContent.claims.length === 2 && e.structuredContent.claims.every((c) => c.evidence.every((s) => s.machineResolved && !s.humanOpened)), "B-VEC evidence: 2 claims, sources machine-resolved, none human-opened");
  const c = await call("find_contradictions", {});
  ok(c.structuredContent.count === EXPECT.contradictions && EXPECT.contradictions >= 3, `find_contradictions returns all ${EXPECT.contradictions} computed contradictions`);
  const w = await call("what_would_move_this", { id: "capsid" });
  ok(w.structuredContent.rung === "L2" && /biodistribution|primate|human/i.test(w.structuredContent.wouldMove || w.content), "what_would_move_this still works for a v0.1 route id");
  const g = await call("get_node", { id: "hrm:cell/cardiomyocyte" });
  ok(g.structuredContent.node.capabilities.length === 5 && g.structuredContent.node.derivedRelations, "cell node lists its 5 derived capabilities and derived relations");
  const bad = await call("get_node", { id: "hrm:goal/does-not-exist" });
  ok(bad.isError === true, "unknown id is an isError result, not a crash");
  const sg = await call("get_subgraph", { root: "hrm:question/en1-inhibition-translates-to-human-skin", depth: 1 });
  ok(sg.structuredContent.edges.some((x) => x.rel === "blocks") && sg.structuredContent.edges.some((x) => x.rel === "testedBy"), "subgraph edges include blocks and testedBy");
  const grid = await call("repair_grid", { system: "Nervous system" });
  ok(grid.structuredContent.nodes.length === 4, "repair_grid filter by system returns 4 nervous-system nodes");

  const pred = await call("register_prediction", { subject: "hrm:question/en1-inhibition-translates-to-human-skin", statement: "A porcine study will show appendage regeneration with YAP inhibition by the horizon.", probability: 0.35, resolutionCriteria: "A peer-reviewed porcine full-thickness wound study reporting appendage counts with local YAP inhibition vs vehicle.", horizon: "2028-12-31", predictor: { type: "ai", name: "test-harness", model: "test-model-0" }, evidenceAccessed: ["hrm:claim/yap-inhibition-yields-mouse-wound-regeneration"], reasoning: "test" });
  ok(pred.structuredContent.ok && pred.structuredContent.id.startsWith("pr_") && /@/.test(pred.structuredContent.graphSnapshot), `prediction registered ${pred.structuredContent.id} at ${pred.structuredContent.graphSnapshot}`);
  const vague = await call("register_prediction", { subject: "hrm:goal/rejuvenation", statement: "Rejuvenation will happen soon.", probability: 0.9, resolutionCriteria: "it happens", horizon: "2030-01-01", predictor: { type: "human", name: "x" } });
  ok(vague.isError === true, "vague resolution criteria rejected");
  const lp = await call("list_predictions", { subject: "en1-inhibition-translates-to-human-skin" });
  ok(lp.structuredContent.count === 1, "list_predictions finds it by bare slug");
  const prop = await call("propose_change", { record_id: "hrm:capability/cutaneous-sensory-reinnervation", kind: "new-evidence", summary: "Sensory recovery in grafts is documented", rationale: "Attach a clinical series on sensory return in skin grafts; would raise the rung from L1.", source_url: "https://doi.org/10.0000/example", proposer: "test-harness" });
  ok(prop.structuredContent.ok && prop.structuredContent.knownRecord === true, "propose_change filed against a known record");
  const unk = await rpc("tools/call", { name: "nope", arguments: {} });
  ok(unk.body.error && unk.body.error.code === -32602, "unknown tool → JSON-RPC error");
}

console.log("REST");
{
  const idx = await get("/api");
  ok(idx.status === 200 && idx.body.endpoints.length > 20, "GET /api lists endpoints");
  const oa = await get("/api/openapi.json");
  ok(oa.body.openapi === "3.1.0" && oa.body.paths["/api/goals/{id}/critical-path"], "OpenAPI 3.1 with critical-path route");
  const man = await get("/api/graph/manifest");
  ok(man.body.contentHash.length === 64, "manifest has a sha256");
  const sch = await get("/api/schema/claim.schema.json");
  ok(sch.status === 200 && sch.body.title === "Claim", "schemas are served");
  const node = await get("/api/nodes/hrm:capability/dermal-architecture-regeneration-without-scar");
  ok(node.status === 200 && node.body.node.grade.rung === "L2" && node.body.caveat, "node by full hrm id, with caveat");
  const goal = await get("/api/goals/scarless-skin-repair/critical-path");
  ok(goal.status === 200 && goal.body.bindingConstraints.length, "critical path by plural route");
  const dep = await get("/api/capabilities/cutaneous-sensory-reinnervation/dependencies");
  ok(dep.body.enables.includes("hrm:goal/skin-structural-reconstruction"), "dependencies derive enables");
  const ev = await get("/api/claims/graftskin-raises-diabetic-ulcer-closure/evidence");
  ok(ev.body.claims[0].evidence[0].doi === "10.2337/diacare.24.2.290", "evidence exposes the DOI");
  const rk = await get("/api/questions/ranked?projection=universal-repair&limit=3");
  ok(rk.body.questions.length === 3, "ranked questions with projection + limit");
  const list = await get("/api/nodes?type=capability&basis=ungraded");
  ok(list.body.count === 5, "five ungraded capabilities (honest blanks)");
  const srch = await get("/api/search?q=avotermin");
  ok(srch.body.results.length >= 3, "search finds avotermin records");
  const miss = await get("/api/goals/nope");
  ok(miss.status === 404, "unknown node → 404");
  const p = await post("/api/predictions", { subject: "hrm:capability/safe-partial-epigenetic-reprogramming-in-vivo", statement: "ER-100 phase 1 will report no dose-limiting toxicity at the first dose level.", probability: 0.7, resolutionCriteria: "Sponsor or peer-reviewed report of the phase 1 dose-level 1 safety outcome.", horizon: "2027-12-31", predictor: { type: "human", name: "test" } });
  ok(p.status === 201 && p.body.id.startsWith("pr_"), "POST /api/predictions → 201");
  const bad = await post("/api/predictions", { subject: "hrm:goal/nope", statement: "x", probability: 2 });
  ok(bad.status === 400, "bad prediction → 400 with reason");
  const ver = await get("/api/verify");
  ok(ver.body.intact === true && ver.body.events === 3, `chain intact over ${ver.body.events} events`);
  // tamper and re-verify
  const before = env.DB._tables.events[0].payload;
  env.DB._tables.events[0].payload = before.replace('"probability":0.35', '"probability":0.99');
  ok(env.DB._tables.events[0].payload !== before, "negative control: the tamper actually changed the stored row");
  const ver2 = await get("/api/verify");
  ok(ver2.body.intact === false && ver2.body.brokenAt === 1, "altering a stored prediction breaks the chain at that event");
  const st = await get("/api/stats");
  ok(st.body.predictions.open === 2 && st.body.records === EXPECT.records, `stats: 2 open predictions, ${EXPECT.records} records`);
  const docs = await worker.fetch(new Request(BASE + "/mcp"), env);
  ok(docs.status === 200 && /structuredContent/.test(await docs.text()), "GET /mcp serves the docs page");
}

console.log(`\n${n - failed}/${n} passed`);
process.exit(failed ? 1 : 0);

/* REST API — the same graph the MCP tools see, addressable by URL.
   Read routes are pure; write routes go through store.js. */

import * as G from "./graph.js";
import { createStore } from "./store.js";
import { GRAPH } from "./generated.js";
import { openapi } from "./openapi.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};
const J = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...CORS, ...extra } });
const CACHE = { "Cache-Control": "public, max-age=300" };
const withCaveat = (obj, nodes) => ({ ...obj, caveat: G.caveatFor(nodes || []) });

export const ENDPOINTS = [
  "GET  /api                                — this index",
  "GET  /api/openapi.json                   — OpenAPI 3.1 description",
  "GET  /api/graph                          — the whole bundle (manifest, ontology, rubrics, nodes, analysis)",
  "GET  /api/graph/manifest                 — version, snapshot, content hash, counts",
  "GET  /api/graph/analysis                 — ranked questions, critical paths, contradictions, grade summary",
  "GET  /api/schema                         — list of JSON Schemas; GET /api/schema/{name}",
  "GET  /api/nodes?type=&projection=&class=&rung=&basis=&blocked=&state=&review=&derived=&q=&limit=",
  "GET  /api/nodes/{hrm-id}                 — any node; also /api/{goals|capabilities|questions|claims|experiments|sources|cells|routes}/{slug}",
  "GET  /api/goals/{slug}/critical-path     — binding constraints, AND/OR requirements, open questions",
  "GET  /api/{type}s/{slug}/dependencies    — requires/enables (direct and transitive), blockers, evidence links",
  "GET  /api/{type}s/{slug}/evidence        — claims and sources with resolution and human-opened state",
  "GET  /api/{type}s/{slug}/blockers        — open questions gating it",
  "GET  /api/{type}s/{slug}/subgraph?depth=2&relations=requires,enables",
  "GET  /api/{type}s/{slug}/would-move      — the missing demonstration",
  "GET  /api/{type}s/{slug}/predictions     — locked predictions on it",
  "GET  /api/questions/ranked?projection=&limit=",
  "GET  /api/contradictions[?id=]",
  "GET  /api/search?q=&limit=",
  "POST /api/predictions                    — lock a prediction (schema: /api/schema/prediction.schema.json)",
  "GET  /api/predictions[?subject=]",
  "POST /api/proposals                      — propose a change; GET /api/proposals[?record=]",
  "GET  /api/events[?record=]               — the append-only hash-chained log",
  "GET  /api/verify                         — walk the chain",
  "GET  /api/stats"
];

export async function handleApi(request, env, url) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const store = createStore(env && env.DB);
  const path = url.pathname.replace(/^\/api\/?/, "").replace(/\/+$/, "");
  const parts = path ? path.split("/").map((p) => decodeURIComponent(p)) : [];
  const q = Object.fromEntries(url.searchParams.entries());
  const GET = request.method === "GET";
  const POST = request.method === "POST";
  const body = async () => { try { return await request.json(); } catch { return null; } };
  const needDb = () => J({ error: "database not bound" }, 500);

  if (!path && GET) return J({ name: "Human Repair Graph API", version: G.MANIFEST.version, snapshot: G.MANIFEST.snapshot, contentHash: G.MANIFEST.contentHash, endpoints: ENDPOINTS, openapi: "/api/openapi.json", mcp: "https://humanrepairmap.com/mcp", bulk: G.MANIFEST.formats, caveat: G.MANIFEST.caveat }, 200, CACHE);
  if (path === "openapi.json" && GET) return J(openapi(), 200, CACHE);
  if (path === "graph" && GET) return J(GRAPH, 200, CACHE);
  if (path === "graph/manifest" && GET) return J(G.MANIFEST, 200, CACHE);
  if (path === "graph/analysis" && GET) return J(G.ANALYSIS, 200, CACHE);
  if (path === "schema" && GET) return J({ schemas: Object.keys(GRAPH.schemas || {}).map((n) => `/api/schema/${n}`) }, 200, CACHE);
  if (parts[0] === "schema" && parts[1] && GET) { const s = (GRAPH.schemas || {})[parts[1]]; return s ? J(s, 200, CACHE) : J({ error: "no such schema", available: Object.keys(GRAPH.schemas || {}) }, 404); }
  if (path === "search" && GET) return J(withCaveat({ query: q.q, results: G.search(q.q, Math.min(parseInt(q.limit || 20, 10) || 20, 100)) }, []), 200, CACHE);
  if (path === "contradictions" && GET) { const rows = G.contradictions(q.id ? G.normaliseId(q.id) : null); return J(withCaveat({ count: rows.length, contradictions: rows }, rows.map((c) => G.NODES.get(c.claim))), 200, CACHE); }
  if (path === "questions/ranked" && GET) return J({ method: G.ANALYSIS.method, projection: q.projection || "all", questions: G.rankedQuestions(q.projection, q.limit || 20) }, 200, CACHE);
  if (path === "nodes" && GET) { const rows = G.listNodes(q); return J(withCaveat({ count: rows.length, filter: q, nodes: rows }, rows.map((r) => G.NODES.get(r.id))), 200, CACHE); }

  // node-addressed routes: /api/nodes/hrm:type/slug/... or /api/<plural>/<slug>/...
  let node = null, rest = [];
  if (parts[0] === "nodes" && parts[1]) {
    if (parts[1].startsWith("hrm:") && parts[2]) { node = G.getNode(parts[1] + "/" + parts[2]); rest = parts.slice(3); }
    else { node = G.getNode(parts[1]); rest = parts.slice(2); }
  } else {
    const type = Object.keys(G.PLURAL).find((t) => G.PLURAL[t] === parts[0]);
    if (type && parts[1]) { node = G.getNode(parts[1], type); rest = parts.slice(2); }
  }
  if (node) {
    const sub = rest[0] || "";
    if (!GET) return J({ error: "method not allowed" }, 405);
    if (!sub) return J(withCaveat({ node }, [node]), 200, CACHE);
    if (sub === "critical-path") { const t = G.tracePath(node.id); return t ? J(t, 200, CACHE) : J({ error: "critical-path is defined for goals only" }, 400); }
    if (sub === "dependencies") return J(withCaveat(G.dependencies(node.id), [node]), 200, CACHE);
    if (sub === "evidence") return J(G.evidenceFor(node.id), 200, CACHE);
    if (sub === "blockers") return J(G.blockersOf(node.id), 200, CACHE);
    if (sub === "subgraph") return J(G.subgraph(node.id, Math.min(parseInt(q.depth || 2, 10) || 2, 4), q.relations ? q.relations.split(",") : undefined), 200, CACHE);
    if (sub === "would-move") return J(G.whatWouldMove(node.id), 200, CACHE);
    if (sub === "predictions") { if (!store) return needDb(); return J(await store.listPredictions(node.id, 100)); }
    return J({ error: "unknown sub-resource", available: ["critical-path", "dependencies", "evidence", "blockers", "subgraph", "would-move", "predictions"] }, 404);
  }
  if ((parts[0] === "nodes" || Object.values(G.PLURAL).includes(parts[0])) && parts[1] && GET) return J({ error: "not found", id: parts.slice(1).join("/") }, 404);

  // write side
  if (path === "predictions" && POST) { if (!store) return needDb(); const b = await body(); if (!b) return J({ error: "invalid JSON" }, 400); const r = await store.registerPrediction({ ...b, subject: G.normaliseId(b.subject) }); return r.error ? J(r, 400) : J(r, 201); }
  if (path === "predictions" && GET) { if (!store) return needDb(); return J(await store.listPredictions(q.subject ? G.normaliseId(q.subject) : null, Math.min(parseInt(q.limit || 100, 10) || 100, 200))); }
  if (path === "proposals" && POST) { if (!store) return needDb(); const b = await body(); if (!b) return J({ error: "invalid JSON" }, 400); const r = await store.submitProposal({ ...b, record_id: G.normaliseId(b.record_id) }); return r.error ? J(r, 400) : J(r, 201); }
  if (path === "proposals" && GET) { if (!store) return needDb(); return J(await store.listProposals(q.record ? G.normaliseId(q.record) : null)); }
  if (path === "events" && GET) { if (!store) return needDb(); return J(await store.events(q.record ? G.normaliseId(q.record) : null)); }
  if (path === "verify" && GET) { if (!store) return needDb(); return J(await store.verify()); }
  if (path === "stats" && GET) { if (!store) return needDb(); return J(await store.stats()); }

  return J({ error: "not found", endpoints: ENDPOINTS }, 404);
}

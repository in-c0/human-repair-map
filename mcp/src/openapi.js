/* A compact OpenAPI 3.1 description of the REST API, generated from the same
   constants the router uses so it cannot drift far. Node schemas are referenced
   by URL rather than inlined: /api/schema/<name>. */

import { MANIFEST, TYPES, PLURAL } from "./graph.js";

const idParam = { name: "id", in: "path", required: true, schema: { type: "string" }, description: "hrm id (hrm:goal/x), bare slug, or URL form" };
const json = (description, ref) => ({ description, content: { "application/json": { schema: ref ? { $ref: ref } : { type: "object" } } } });
const get = (summary, params, extra) => ({ get: { summary, ...(params ? { parameters: params } : {}), responses: { 200: json("OK") }, ...(extra || {}) } });

export function openapi() {
  const paths = {
    "/api": get("Index of endpoints"),
    "/api/graph": get("Whole graph bundle: manifest, ontology, rubrics, nodes, analysis"),
    "/api/graph/manifest": get("Version, snapshot date, content hash, counts"),
    "/api/graph/analysis": get("Ranked open questions, per-goal critical paths, contradictions, grade summary (structural only)"),
    "/api/schema": get("List JSON Schemas"),
    "/api/schema/{name}": get("One JSON Schema", [{ name: "name", in: "path", required: true, schema: { type: "string" } }]),
    "/api/nodes": get("Filter nodes", ["type", "projection", "class", "rung", "basis", "blocked", "state", "review", "derived", "q", "limit"].map((n) => ({ name: n, in: "query", schema: { type: "string" } }))),
    "/api/nodes/{id}": get("Any node with derived inverse relations", [idParam]),
    "/api/goals/{id}/critical-path": get("Binding constraints, AND/OR requirements, ungraded nodes, open questions on the path", [idParam]),
    "/api/questions/ranked": get("Open questions ranked by structural leverage", [{ name: "projection", in: "query", schema: { type: "string", enum: ["universal-repair", "rejuvenation"] } }, { name: "limit", in: "query", schema: { type: "integer" } }]),
    "/api/contradictions": get("Claims contradicting a node, or all", [{ name: "id", in: "query", schema: { type: "string" } }]),
    "/api/search": get("Free-text search", [{ name: "q", in: "query", required: true, schema: { type: "string" } }, { name: "limit", in: "query", schema: { type: "integer" } }]),
    "/api/predictions": {
      get: { summary: "Locked predictions", parameters: [{ name: "subject", in: "query", schema: { type: "string" } }], responses: { 200: json("OK") } },
      post: { summary: "Register a locked prediction (hash-chained, immutable)", requestBody: { required: true, content: { "application/json": { schema: { $ref: "https://humanrepairmap.com/api/schema/prediction.schema.json" } } } }, responses: { 201: json("Registered"), 400: json("Rejected with reason") } }
    },
    "/api/proposals": {
      get: { summary: "Proposals", parameters: [{ name: "record", in: "query", schema: { type: "string" } }], responses: { 200: json("OK") } },
      post: { summary: "Propose a change (correction, rung-challenge, new-evidence, new-node, new-dependency, question)", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["record_id", "kind", "summary", "rationale"], properties: { record_id: { type: "string" }, kind: { type: "string", enum: ["correction", "rung-challenge", "new-evidence", "new-node", "new-dependency", "question"] }, summary: { type: "string", maxLength: 300 }, rationale: { type: "string", maxLength: 4000 }, source_url: { type: "string" }, proposer: { type: "string" }, affil: { type: "string" }, proposed_record: { type: "object" } } } } } }, responses: { 201: json("Filed as submitted"), 400: json("Rejected with reason") } }
    },
    "/api/events": get("Append-only hash-chained event log", [{ name: "record", in: "query", schema: { type: "string" } }]),
    "/api/verify": get("Walk the chain and report the first break, if any"),
    "/api/stats": get("Counts")
  };
  for (const t of TYPES) {
    const p = PLURAL[t];
    paths[`/api/${p}/{id}`] = get(`One ${t}`, [idParam]);
    for (const sub of ["dependencies", "evidence", "blockers", "subgraph", "would-move"]) paths[`/api/${p}/{id}/${sub}`] = get(`${sub} of a ${t}`, [idParam]);
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "Human Repair Graph API",
      version: MANIFEST.version,
      description: `Read and act on the Human Repair Graph (snapshot ${MANIFEST.snapshot}, content hash ${MANIFEST.contentHash}). Every response that carries records carries their review state; unless a record says reviewed with a named human, no human has opened its sources. Not clinical advice. MCP endpoint: https://humanrepairmap.com/mcp. Bulk export: https://humanrepairmap.com/graph/`,
      license: { name: "CC BY 4.0 (graph data)" }
    },
    servers: [{ url: "https://humanrepairmap.com" }],
    paths
  };
}

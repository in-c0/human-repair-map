/* Human Repair Map — MCP server (Streamable HTTP, spec 2025-11-25) + REST API.
   Zero dependencies. Read-only graph; public, unauthenticated, hash-chained
   write side for proposals and predictions.

   Design note: the map's whole value is refusing to present a record as more
   settled than it is, so every tool result carries the review state of what it
   returned and repeats the non-clinical caveat. An API that drops those is a
   different, worse product. */

import { META } from "./data.js";
import { TOOLS } from "./tools.js";
import { dispatch } from "./tools-dispatch.js";
import { createStore } from "./store.js";
import { MANIFEST } from "./graph.js";
import { handleApi } from "./api.js";
import { DOCS } from "./docs.js";

const SUPPORTED = ["2025-11-25", "2025-06-18", "2025-03-26"];
const LATEST = "2025-11-25";
const SERVER = { name: "human-repair-map", title: "Human Repair Map", version: MANIFEST.version };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID, Authorization",
  "Access-Control-Expose-Headers": "MCP-Session-Id, MCP-Protocol-Version"
};

const CAVEAT =
  "\n\n---\n" +
  "REVIEW STATE: unless a record says `reviewed` with a named human, NO human has opened its sources. Records marked ai-proposed are sourced by an AI session and unchecked. Do not present them as validated.\n" +
  "NOT MEDICAL ADVICE: this maps research state, not clinical care. No diagnosis, treatment selection, prognosis, or patient-specific guidance.\n" +
  `Graph v${MANIFEST.version} · snapshot ${MANIFEST.snapshot} · ${MANIFEST.contentHash.slice(0, 12)} · rubric v${META.rubricVersion} · ${META.site}`;

const RESOURCES = [
  { uri: "https://humanrepairmap.com/graph/manifest.json", name: "manifest", title: "Graph manifest", description: "Version, snapshot, content hash, counts", mimeType: "application/json" },
  { uri: "https://humanrepairmap.com/graph/graph.json", name: "graph", title: "Whole graph bundle", description: "Manifest, ontology, rubrics, schemas, every node with derived relations, structural analysis", mimeType: "application/json" },
  { uri: "https://humanrepairmap.com/graph/graph.jsonl", name: "graph-jsonl", title: "Nodes, one per line", mimeType: "application/x-ndjson" },
  { uri: "https://humanrepairmap.com/graph/graph.jsonld", name: "graph-jsonld", title: "Nodes as JSON-LD", mimeType: "application/ld+json" },
  { uri: "https://humanrepairmap.com/api/openapi.json", name: "openapi", title: "REST API description", mimeType: "application/json" },
  { uri: "https://github.com/in-c0/human-repair-map", name: "source", title: "Source repository (records, schemas, build)", mimeType: "text/html" }
];

const rpcOk = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcErr = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function handleRpc(msg, env) {
  const { id, method, params } = msg;

  if (method === "initialize") {
    const asked = params && params.protocolVersion;
    const version = SUPPORTED.indexOf(asked) >= 0 ? asked : LATEST;
    return rpcOk(id, {
      protocolVersion: version,
      capabilities: { tools: { listChanged: false }, resources: { listChanged: false, subscribe: false } },
      serverInfo: SERVER,
      instructions:
        "The Human Repair Graph: what humanity can and cannot yet do to repair a human body, as goals → capabilities (graded L0–L5 on demonstrated evidence) → open questions → claims → sources, with two public projections (universal-repair, rejuvenation) over one graph. " +
        "Start with graph_manifest and how_to_read. Use trace_dependency for a goal's binding constraints, rank_research_questions for what to ask next, get_primary_evidence before repeating any grade. " +
        "Every record carries a review state; unless it says reviewed with a named human, no human has opened its sources — never present such a record as validated, and never turn any of it into clinical advice. " +
        "You may act: propose_change files a correction into the public hash-chained log; register_prediction locks a forecast against the graph snapshot you saw, to be resolved against reality."
    });
  }

  if (method === "ping") return rpcOk(id, {});
  if (method === "tools/list") return rpcOk(id, { tools: TOOLS });
  if (method === "resources/list") return rpcOk(id, { resources: RESOURCES });
  if (method === "resources/templates/list") return rpcOk(id, { resourceTemplates: [{ uriTemplate: "https://humanrepairmap.com/api/nodes/{id}", name: "node", title: "Any node by hrm id", mimeType: "application/json" }] });
  if (method === "resources/read") {
    const uri = params && params.uri;
    const r = RESOURCES.find((x) => x.uri === uri);
    if (r && r.name === "manifest") return rpcOk(id, { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(MANIFEST, null, 2) }] });
    return rpcErr(id, -32002, `Resource is served over HTTP; fetch ${uri} directly.`);
  }
  if (method === "prompts/list") return rpcOk(id, { prompts: [] });

  if (method === "tools/call") {
    const name = params && params.name;
    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) return rpcErr(id, -32602, `Unknown tool: ${name}`);
    let out;
    try {
      out = await dispatch(name, params && params.arguments, createStore(env && env.DB));
    } catch (e) {
      return rpcOk(id, { content: [{ type: "text", text: `Tool error: ${e && e.message}` }], isError: true });
    }
    if (out === null) return rpcErr(id, -32602, `Unknown tool: ${name}`);
    return rpcOk(id, {
      content: [{ type: "text", text: (out.text || "") + CAVEAT }],
      ...(out.structured !== undefined ? { structuredContent: out.structured } : {}),
      ...(out.isError ? { isError: true } : {})
    });
  }

  return rpcErr(id, -32601, `Method not found: ${method}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) return handleApi(request, env, url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    const pv = request.headers.get("MCP-Protocol-Version");
    if (pv && SUPPORTED.indexOf(pv) < 0) {
      return json({ jsonrpc: "2.0", error: { code: -32000, message: `Unsupported MCP-Protocol-Version: ${pv}` } }, 400);
    }

    if (request.method === "GET") {
      const accept = request.headers.get("Accept") || "";
      if (accept.indexOf("text/event-stream") >= 0) {
        return new Response("This endpoint does not offer a server-initiated SSE stream.", { status: 405, headers: CORS });
      }
      return new Response(DOCS(), { status: 200, headers: { ...CORS, "Content-Type": "text/html; charset=utf-8" } });
    }

    if (request.method === "DELETE") return new Response(null, { status: 405, headers: CORS });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

    let body;
    try { body = await request.json(); }
    catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } }, 400); }

    const messages = Array.isArray(body) ? body : [body];
    const responses = [];
    for (const m of messages) {
      if (!m || m.jsonrpc !== "2.0") return json({ jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" } }, 400);
      if (m.id === undefined || m.id === null) continue; // notifications
      responses.push(await handleRpc(m, env));
    }
    if (!responses.length) return new Response(null, { status: 202, headers: CORS });

    const payload = Array.isArray(body) ? responses : responses[0];
    const headers = { ...CORS, "MCP-Protocol-Version": pv || LATEST };
    if (messages.some((m) => m && m.method === "initialize")) headers["MCP-Session-Id"] = crypto.randomUUID();
    return json(payload, 200, headers);
  }
};

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...CORS, ...extra } });
}

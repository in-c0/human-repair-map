/* Human Repair Map — MCP server (Streamable HTTP, spec 2025-11-25).
   Zero dependencies. Read-only, public, unauthenticated.

   Design note: the map's whole value is refusing to present a record as more
   settled than it is, so every tool result carries the record's review state
   and grounding class, and every payload repeats the unverified + non-clinical
   caveats. An API that drops those is a different, worse product. */

import { META, LADDER, GROUNDING, MEASURED, CAPABILITIES, ROUTES, HEADLINE } from "./data.js";
import { handleApi } from "./api.js";

const SUPPORTED = ["2025-11-25", "2025-06-18", "2025-03-26"];
const LATEST = "2025-11-25";
const SERVER = { name: "human-repair-map", title: "Human Repair Map", version: "0.1.0" };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID, Authorization",
  "Access-Control-Expose-Headers": "MCP-Session-Id, MCP-Protocol-Version"
};

const CAVEAT =
  "\n\n---\n" +
  "REVIEW STATE: every delivery record below is AI-PROPOSED and UNREVIEWED — sourced by search agents, not yet hand-checked by a human. Do not present it as validated.\n" +
  "NOT MEDICAL ADVICE: this maps research state, not clinical care. No diagnosis, treatment selection, prognosis, or patient-specific guidance.\n" +
  `Last checked ${META.lastChecked} · rubric v${META.rubricVersion} · ${META.site}`;

/* ---------- tools ---------- */

const TOOLS = [
  {
    name: "evidence_state",
    title: "Evidence state of the field",
    description:
      "The headline state of CNS drug delivery: how many routes sit at each evidence rung, what is actually proven in humans, and the central contrast. Start here.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "how_to_read",
    title: "How to read the grading",
    description:
      "The rubrics: the evidence ladder (L0–L5), the grounding ladder (G0–G4), and what 'measured' means. Read this before interpreting any record.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "list_routes",
    title: "List delivery routes",
    description:
      "List the 16 graded routes for getting a therapeutic into the human brain. Filter by evidence rung, what was measured, route family, or status.",
    inputSchema: {
      type: "object",
      properties: {
        rung: { type: "string", enum: ["L0", "L1", "L2", "L3", "L4", "L5"], description: "evidence rung" },
        measured: { type: "string", enum: ["function", "biomarker", "opening", "none"], description: "what the route actually demonstrated" },
        family: { type: "string", enum: ["through barrier", "around barrier"], description: "cross the barrier, or bypass it" },
        status: { type: "string", description: "e.g. approved, in trials, preclinical, terminated" }
      },
      additionalProperties: false
    }
  },
  {
    name: "get_route",
    title: "Get one delivery route",
    description:
      "Full record for one route: claim, evidence rung, grounding class, what was measured, replication status, the drift between what was demonstrated and what is commonly claimed, and citations.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "route id, e.g. 'capsid', 'fus', 'nusinersen'" } },
      required: ["id"],
      additionalProperties: false
    }
  },
  {
    name: "list_capabilities",
    title: "List the five capabilities",
    description:
      "The five enabling capabilities a general repair system requires, each with a maturity score, uncertainty interval, and review state.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "get_capability",
    title: "Get one capability",
    description: "Full capability record including dependencies and what it blocks.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "capability id, e.g. 'delivery', 'sensing'" } },
      required: ["id"],
      additionalProperties: false
    }
  },
  {
    name: "what_would_move_this",
    title: "What evidence would move this rung",
    description:
      "For a given route or capability, what specific evidence would raise its rung. This is the map's most actionable output — it converts 'not proven' into 'here is the missing demonstration'.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "a route id or capability id" } },
      required: ["id"],
      additionalProperties: false
    }
  },
  {
    name: "search",
    title: "Search the map",
    description: "Free-text search across routes, capabilities, drift notes and citations.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "search text, e.g. 'barrier', 'biomarker', 'capsid'" } },
      required: ["query"],
      additionalProperties: false
    }
  }
];

/* ---------- formatting ---------- */

const routeLine = (r) =>
  `- **${r.subject}** — ${r.rung} · ${r.grounding} · measures: ${r.measured} · ${r.status} · review: ${r.review} (id: \`${r.id}\`)`;

function routeDetail(r) {
  const lines = [
    `# ${r.subject}`,
    ``,
    `- **Evidence rung:** ${r.rung} — ${(LADDER.find((l) => l.id === r.rung) || {}).blurb || ""}`,
    `- **Grounding:** ${r.grounding} — ${(GROUNDING.find((g) => g.id === r.grounding) || {}).label || ""}`,
    `- **What it measured:** ${r.measured} — ${MEASURED[r.measured] || ""}`,
    `- **Replication:** ${r.replication}`,
    `- **Status:** ${r.status}`,
    `- **Review state:** ${r.review}`,
    `- **Route family:** ${r.family}`,
    ``,
    `## Evidence`,
    r.note,
    ``,
    `## Drift — demonstrated vs claimed`,
    r.drift
  ];
  if (r.precision) lines.push(``, `## Precision note`, r.precision);
  lines.push(``, `## Citations`, ...r.citations.map((c) => `- ${c}`));
  if (r.wouldMove) lines.push(``, `## What would move this rung`, r.wouldMove);
  return lines.join("\n");
}

function capDetail(c) {
  return [
    `# ${c.title} (${c.code})`,
    ``,
    c.summary,
    ``,
    `- **Maturity:** ${c.score}/100 (interval ${c.interval[0]}–${c.interval[1]}, rubric v${META.rubricVersion})`,
    `- **Review state:** ${c.review}`,
    `- **Depends on:** ${c.depends.length ? c.depends.join(", ") : "none — foundational"}`,
    `- **Blocks:** ${c.blocks.join(", ")}`,
    c.deepModule ? `- **Deep module:** yes — 16 graded delivery routes` : ``
  ]
    .filter(Boolean)
    .join("\n");
}

/* ---------- tool dispatch ---------- */

function callTool(name, args) {
  args = args || {};
  switch (name) {
    case "evidence_state": {
      const byRung = {};
      ROUTES.forEach((r) => { byRung[r.rung] = (byRung[r.rung] || 0) + 1; });
      const dist = Object.keys(byRung).sort().reverse().map((k) => `- **${k}** — ${byRung[k]} route(s)`);
      return [
        `# Evidence state — getting a drug into the human brain`,
        ``,
        `**${HEADLINE.finding}**`,
        ``,
        HEADLINE.detail,
        ``,
        `## The central contrast`,
        HEADLINE.contrast,
        ``,
        `## Routes by evidence rung (${ROUTES.length} total)`,
        ...dist,
        ``,
        `Use \`list_routes\` to filter, \`get_route\` for a full record, \`how_to_read\` for the rubrics.`
      ].join("\n");
    }
    case "how_to_read": {
      return [
        `# How to read this map`,
        ``,
        `## Evidence ladder — how far a claim has been shown`,
        ...LADDER.map((l) => `- **${l.id} ${l.label}** — ${l.blurb}`),
        ``,
        `The two load-bearing jumps: **L2→L3** is where most things die (the mouse result that does not survive a primate), and **L4→L5** is the difference between "the group that invented it published a study" and "someone with nothing to gain saw the same thing".`,
        ``,
        `## Grounding ladder — how the claim is anchored`,
        ...GROUNDING.map((g) => `- **${g.id} ${g.label}** — ${g.blurb} · human review: ${g.review}`),
        ``,
        `Grounding is orthogonal to the rung. Verification is becoming cheap as grounding rises; judgment is not. A maturity score sits on top of any grounding class.`,
        ``,
        `## What was measured — the distinction that catches most people`,
        ...Object.keys(MEASURED).map((k) => `- **${k}** — ${MEASURED[k]}`),
        ``,
        `A drug can move a number in spinal fluid without changing how anyone feels. Regulators sometimes approve on that number.`
      ].join("\n");
    }
    case "list_routes": {
      let rs = ROUTES.slice();
      if (args.rung) rs = rs.filter((r) => r.rung === args.rung);
      if (args.measured) rs = rs.filter((r) => r.measured === args.measured);
      if (args.family) rs = rs.filter((r) => r.family === args.family);
      if (args.status) rs = rs.filter((r) => r.status.toLowerCase().indexOf(String(args.status).toLowerCase()) >= 0);
      if (!rs.length) return `No routes match those filters. ${ROUTES.length} routes exist; try \`list_routes\` with no arguments.`;
      const applied = Object.keys(args).filter((k) => args[k]).map((k) => `${k}=${args[k]}`).join(", ") || "none";
      return [`# Delivery routes (${rs.length} of ${ROUTES.length})`, `Filters: ${applied}`, ``, ...rs.map(routeLine)].join("\n");
    }
    case "get_route": {
      const r = ROUTES.find((x) => x.id === args.id);
      if (!r) return `No route with id "${args.id}". Available: ${ROUTES.map((x) => x.id).join(", ")}`;
      return routeDetail(r);
    }
    case "list_capabilities": {
      return [
        `# The five enabling capabilities`,
        ``,
        ...CAPABILITIES.map(
          (c) => `- **${c.title}** (${c.code}) — maturity ${c.score}/100 [${c.interval[0]}–${c.interval[1]}] · review: ${c.review} (id: \`${c.id}\`)${c.deepModule ? " · deep module" : ""}\n  ${c.summary}`
        )
      ].join("\n");
    }
    case "get_capability": {
      const c = CAPABILITIES.find((x) => x.id === args.id);
      if (!c) return `No capability with id "${args.id}". Available: ${CAPABILITIES.map((x) => x.id).join(", ")}`;
      return capDetail(c);
    }
    case "what_would_move_this": {
      const r = ROUTES.find((x) => x.id === args.id);
      if (r) {
        return [
          `# What would move: ${r.subject}`,
          ``,
          `Currently **${r.rung}** (${(LADDER.find((l) => l.id === r.rung) || {}).blurb || ""}), grounding ${r.grounding}, measuring **${r.measured}**.`,
          ``,
          `## The missing demonstration`,
          r.wouldMove || "Not yet specified for this record.",
          ``,
          `## Why it sits where it does`,
          r.drift
        ].join("\n");
      }
      const c = CAPABILITIES.find((x) => x.id === args.id);
      if (c) {
        return [
          `# What would move: ${c.title}`,
          ``,
          `Maturity ${c.score}/100 (interval ${c.interval[0]}–${c.interval[1]}), review state ${c.review}.`,
          ``,
          `This capability is gated by: ${c.depends.length ? c.depends.join(", ") : "nothing — it is foundational"}.`,
          `Moving it unblocks: ${c.blocks.join(", ")}.`,
          ``,
          `A maturity score is a human judgment, not an automated output — it changes only when a reviewer accepts new evidence under the published rubric.`
        ].join("\n");
      }
      return `No record with id "${args.id}". Routes: ${ROUTES.map((x) => x.id).join(", ")}. Capabilities: ${CAPABILITIES.map((x) => x.id).join(", ")}`;
    }
    case "search": {
      const q = String(args.query || "").toLowerCase();
      if (!q) return "Provide a query.";
      const rs = ROUTES.filter((r) => (r.subject + r.note + r.drift + r.citations.join(" ") + r.measured + r.status).toLowerCase().indexOf(q) >= 0);
      const cs = CAPABILITIES.filter((c) => (c.title + c.summary).toLowerCase().indexOf(q) >= 0);
      if (!rs.length && !cs.length) return `Nothing matched "${args.query}".`;
      const out = [`# Results for "${args.query}" — ${rs.length + cs.length} match(es)`];
      if (cs.length) out.push(``, `## Capabilities`, ...cs.map((c) => `- **${c.title}** (${c.code}) — maturity ${c.score}/100 (id: \`${c.id}\`)`));
      if (rs.length) out.push(``, `## Delivery routes`, ...rs.map(routeLine));
      return out.join("\n");
    }
    default:
      return null;
  }
}

/* ---------- JSON-RPC ---------- */

const rpcOk = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcErr = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

function handleRpc(msg) {
  const { id, method, params } = msg;

  if (method === "initialize") {
    const asked = params && params.protocolVersion;
    const version = SUPPORTED.indexOf(asked) >= 0 ? asked : LATEST;
    return rpcOk(id, {
      protocolVersion: version,
      capabilities: { tools: { listChanged: false } },
      serverInfo: SERVER,
      instructions:
        "The Human Repair Map grades how far each route into the human brain has actually been shown to work, and in whom. " +
        "Call how_to_read before interpreting records. Every delivery record is AI-proposed and unreviewed — never present one as validated, " +
        "and never turn any of it into clinical advice."
    });
  }

  if (method === "ping") return rpcOk(id, {});
  if (method === "tools/list") return rpcOk(id, { tools: TOOLS });

  if (method === "tools/call") {
    const name = params && params.name;
    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) return rpcErr(id, -32602, `Unknown tool: ${name}`);
    let text;
    try {
      text = callTool(name, params && params.arguments);
    } catch (e) {
      return rpcOk(id, { content: [{ type: "text", text: `Tool error: ${e && e.message}` }], isError: true });
    }
    if (text === null) return rpcErr(id, -32602, `Unknown tool: ${name}`);
    return rpcOk(id, { content: [{ type: "text", text: text + CAVEAT }] });
  }

  if (method === "resources/list") return rpcOk(id, { resources: [] });
  if (method === "prompts/list") return rpcOk(id, { prompts: [] });

  return rpcErr(id, -32601, `Method not found: ${method}`);
}

/* ---------- HTTP ---------- */

const DOCS = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Human Repair Map — MCP server</title>
<style>
:root{color-scheme:dark}
body{background:#050D1A;color:#F0EDE6;font:15px/1.65 ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;margin:0;padding:48px 24px}
main{max-width:720px;margin:0 auto}
h1{font-size:27px;letter-spacing:-.02em;margin:0 0 6px}
p{color:rgba(240,237,230,.72)}
code,pre{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
pre{background:#0C1D33;border:1px solid rgba(120,190,200,.18);border-radius:10px;padding:14px 16px;overflow-x:auto;font-size:12.5px}
.e{font:11px ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#00E5CC;margin-bottom:14px}
ul{padding-left:18px} li{margin:5px 0;color:rgba(240,237,230,.72)}
b{color:#F0EDE6;font-weight:500}
a{color:#00E5CC}
.warn{border-left:3px solid #E8A042;background:rgba(232,160,66,.10);padding:12px 15px;border-radius:0 9px 9px 0;margin:22px 0;font-size:13.5px}
</style></head><body><main>
<div class="e">Human Repair Map · MCP endpoint</div>
<h1>An evidence commons your AI can query</h1>
<p>This is a <a href="https://modelcontextprotocol.io">Model Context Protocol</a> server exposing the Human Repair Map — how far each route into the human brain has actually been shown to work, and in whom. Read-only, public, no auth.</p>
<p>Add it to any MCP client (Claude Desktop, Claude Code, or your own agent):</p>
<pre>claude mcp add --transport http human-repair-map https://humanrepairmap.com/mcp</pre>
<p>Or in a client config:</p>
<pre>{
  "mcpServers": {
    "human-repair-map": {
      "type": "http",
      "url": "https://humanrepairmap.com/mcp"
    }
  }
}</pre>
<p><b>Tools</b></p>
<ul>
<li><code>evidence_state</code> — the headline state of the field. Start here.</li>
<li><code>how_to_read</code> — the evidence ladder (L0–L5) and grounding ladder (G0–G4).</li>
<li><code>list_routes</code> — the 16 graded routes, filterable by rung, what was measured, family, status.</li>
<li><code>get_route</code> — a full record: claim, rung, grounding, replication, drift, citations.</li>
<li><code>list_capabilities</code> / <code>get_capability</code> — the five enabling capabilities.</li>
<li><code>what_would_move_this</code> — the specific missing demonstration for any record.</li>
<li><code>search</code> — free text across the map.</li>
</ul>
<div class="warn"><b>Every delivery record is AI-proposed and unreviewed</b> — sourced by search agents, not yet hand-checked by a human. The server says so in every response. This maps research state, not clinical care: no diagnosis, treatment selection, or patient-specific advice.</div>
<p style="font-size:13px">Spec 2025-11-25 · Streamable HTTP · <a href="https://humanrepairmap.com">humanrepairmap.com</a> · <a href="https://github.com/in-c0/human-repair-map">source</a></p>
</main></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) return handleApi(request, env, url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    // Reject unsupported negotiated protocol versions (spec: 400).
    const pv = request.headers.get("MCP-Protocol-Version");
    if (pv && SUPPORTED.indexOf(pv) < 0) {
      return json({ jsonrpc: "2.0", error: { code: -32000, message: `Unsupported MCP-Protocol-Version: ${pv}` } }, 400);
    }

    if (request.method === "GET") {
      const accept = request.headers.get("Accept") || "";
      // An MCP client asking for a server-initiated stream: we do not offer one.
      if (accept.indexOf("text/event-stream") >= 0) {
        return new Response("This endpoint does not offer a server-initiated SSE stream.", { status: 405, headers: CORS });
      }
      return new Response(DOCS, { status: 200, headers: { ...CORS, "Content-Type": "text/html; charset=utf-8" } });
    }

    // Sessions are not required by this server; nothing to terminate.
    if (request.method === "DELETE") return new Response(null, { status: 405, headers: CORS });

    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } }, 400);
    }

    const messages = Array.isArray(body) ? body : [body];
    const responses = [];
    for (const m of messages) {
      if (!m || m.jsonrpc !== "2.0") {
        return json({ jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" } }, 400);
      }
      // Notifications and responses carry no id: accept and return 202 with no body.
      if (m.id === undefined || m.id === null) continue;
      responses.push(handleRpc(m));
    }

    if (!responses.length) return new Response(null, { status: 202, headers: CORS });

    const payload = Array.isArray(body) ? responses : responses[0];
    const headers = { ...CORS, "MCP-Protocol-Version": pv || LATEST };
    // Issue a session id on initialize; this server is stateless and does not require it back.
    const isInit = messages.some((m) => m && m.method === "initialize");
    if (isInit) headers["MCP-Session-Id"] = crypto.randomUUID();
    return json(payload, 200, headers);
  }
};

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS, ...extra }
  });
}

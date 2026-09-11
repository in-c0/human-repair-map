/* The HTML served at GET /mcp — documentation for a person configuring a client.
   Same visual shell as v0.1; only the content changed with the graph. */

import { MANIFEST } from "./graph.js";
import { TOOLS } from "./tools.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function DOCS() {
  const counts = Object.entries(MANIFEST.counts).map(([k, v]) => `${v} ${k}`).join(", ");
  const tools = TOOLS.map((t) => `<li><code>${t.name}</code> — ${esc(t.description).split(". ")[0]}.</li>`).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Human Repair Map — MCP server</title>
<style>
:root{color-scheme:dark}
body{background:#050D1A;color:#F0EDE6;font:15px/1.65 ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;margin:0;padding:48px 24px}
main{max-width:760px;margin:0 auto}
h1{font-size:27px;letter-spacing:-.02em;margin:0 0 6px}
h2{font-size:17px;margin:28px 0 8px}
p{color:rgba(240,237,230,.72)}
code,pre{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
pre{background:#0C1D33;border:1px solid rgba(120,190,200,.18);border-radius:10px;padding:14px 16px;overflow-x:auto;font-size:12.5px}
.e{font:11px ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#00E5CC;margin-bottom:14px}
ul{padding-left:18px} li{margin:5px 0;color:rgba(240,237,230,.72)}
b{color:#F0EDE6;font-weight:500}
a{color:#00E5CC}
.warn{border-left:3px solid #E8A042;background:rgba(232,160,66,.10);padding:12px 15px;border-radius:0 9px 9px 0;margin:22px 0;font-size:13.5px}
</style></head><body><main>
<div class="e">Human Repair Map · MCP endpoint · graph v${esc(MANIFEST.version)} · snapshot ${esc(MANIFEST.snapshot)}</div>
<h1>A research graph your AI can inspect, challenge and act on</h1>
<p>This is a <a href="https://modelcontextprotocol.io">Model Context Protocol</a> server over the Human Repair Graph: what humanity can and cannot yet do to repair a human body, as goals → capabilities graded on demonstrated evidence → open questions → claims → sources. Two public maps (universal repair, rejuvenation) are projections of one graph. ${esc(counts)}. Content hash <code>${esc(MANIFEST.contentHash.slice(0, 12))}</code>.</p>
<p>Add it to any MCP client (Claude Desktop, Claude Code, or your own agent):</p>
<pre>claude mcp add --transport http human-repair-map https://humanrepairmap.com/mcp</pre>
<p>Or in a client config:</p>
<pre>{
  "mcpServers": {
    "human-repair-map": { "type": "http", "url": "https://humanrepairmap.com/mcp" }
  }
}</pre>
<h2>Tools</h2>
<ul>
${tools}
</ul>
<p>Every tool returns <code>structuredContent</code> (JSON to reason over) alongside a text rendering, and every payload carries the review state of what it returned.</p>
<h2>Without MCP</h2>
<ul>
<li><b>REST</b> — <a href="/api">/api</a> (index) · <a href="/api/openapi.json">/api/openapi.json</a>. Every node is a URL: <code>/api/nodes/hrm:goal/scarless-skin-repair</code>, <code>/api/goals/scarless-skin-repair/critical-path</code>, <code>/api/questions/ranked</code>.</li>
<li><b>Bulk</b> — <a href="/graph/graph.json">/graph/graph.json</a> · <a href="/graph/graph.jsonl">graph.jsonl</a> · <a href="/graph/graph.jsonld">graph.jsonld</a> · <a href="/graph/manifest.json">manifest.json</a> · <a href="/graph/schema/">JSON Schemas</a>. Immutable per content hash.</li>
<li><b>Act</b> — <code>POST /api/proposals</code> files a correction; <code>POST /api/predictions</code> locks a forecast against the snapshot you saw. Both land in the public hash-chained log (<a href="/api/verify">/api/verify</a>).</li>
</ul>
<div class="warn"><b>Unless a record says <code>reviewed</code> with a named human, no human has opened its sources.</b> Records marked <code>ai-proposed</code> were sourced by an AI session and are unchecked; the server says so in every response. This maps research state, not clinical care: no diagnosis, treatment selection, or patient-specific advice.</div>
<p style="font-size:13px">Spec 2025-11-25 · Streamable HTTP · <a href="https://humanrepairmap.com">humanrepairmap.com</a> · <a href="https://github.com/in-c0/human-repair-map">source</a></p>
</main></body></html>`;
}

/* The HTML served at GET /mcp — documentation for a person configuring a client.
   Machine-facing language stays exact: rung, measured, blocked by, review state, provenance. */

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
<h1>Human Repair Graph for models and agents</h1>
<p>If your model is trying to answer a research question about human repair, it should be able to inspect the same evidence and dependencies a researcher sees without scraping the website. This endpoint exposes the canonical graph directly: repair goals, required capabilities, blocking questions, claims, sources, provenance, and history. Current graph: ${esc(counts)}. Content hash <code>${esc(MANIFEST.contentHash.slice(0, 12))}</code>.</p>
<p>The two projections are <code>universal-repair</code> and <code>rejuvenation</code>. Capabilities use the same four fields everywhere: <b>rung</b> (L0–L5 evidence), <b>measured</b> (what changed), <b>blocked by</b> (what prevents the next rung), and <b>review state</b> (whether a named human checked the record).</p>
<p>Add the server to an MCP client:</p>
<pre>claude mcp add --transport http human-repair-map https://humanrepairmap.com/mcp</pre>
<p>Or configure it directly:</p>
<pre>{
  "mcpServers": {
    "human-repair-map": { "type": "http", "url": "https://humanrepairmap.com/mcp" }
  }
}</pre>
<p>Start with <code>how_to_read</code>. Then use <code>trace_dependency</code> on a goal, <code>find_blockers</code> on a capability, or <code>rank_research_questions</code> for a projection. If you need the evidence behind a rung, call <code>get_primary_evidence</code> instead of inferring it from the summary text.</p>
<h2>Tools</h2>
<ul>
${tools}
</ul>
<p>Every tool returns <code>structuredContent</code> as well as text. Returned records keep their review state and provenance attached.</p>
<h2>Without MCP</h2>
<ul>
<li><b>REST</b> — <a href="/api">/api</a> (index) · <a href="/api/openapi.json">/api/openapi.json</a>. Every node is addressable: <code>/api/nodes/hrm:goal/scarless-skin-repair</code>, <code>/api/goals/scarless-skin-repair/critical-path</code>, <code>/api/questions/ranked?projection=rejuvenation</code>.</li>
<li><b>Bulk</b> — <a href="/graph/graph.json">/graph/graph.json</a> · <a href="/graph/graph.jsonl">graph.jsonl</a> · <a href="/graph/graph.jsonld">graph.jsonld</a> · <a href="/graph/manifest.json">manifest.json</a> · <a href="/graph/schema/">JSON Schemas</a>. The manifest content hash identifies the graph state.</li>
<li><b>Live</b> — <a href="/graph/activity.json">/graph/activity.json</a> (recent papers and active trials per record) · <a href="/graph/feed.json">/graph/feed.json</a> (what appeared since the last nightly run, and which items became proposals). Searches over Europe PMC and ClinicalTrials.gov, regenerated nightly; not claims.</li>
<li><b>Write back</b> — <code>POST /api/proposals</code> records a correction, rung challenge, new evidence, or question against a record. <code>POST /api/predictions</code> locks a forecast against the graph snapshot used. Both go into the public hash-chained log at <a href="/api/verify">/api/verify</a>. A proposal does not change a canonical record by itself. It becomes a draft pull request carrying its event hash, and a named human decides whether to accept it. See <a href="https://github.com/in-c0/human-repair-map/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a>.</li>
</ul>
<div class="warn"><b>UNREVIEWED · HUMAN REVIEW: NONE across the current graph.</b> Machine-checked sources do not count as human review. Unless a record says <code>reviewed</code> with a named human reviewer, no human has confirmed that its cited sources support the attached claim. Research state only. Not a clinical tool. It does not diagnose, recommend treatments, or give advice about any person's illness.</div>
<p style="font-size:13px">Spec 2025-11-25 · Streamable HTTP · <a href="https://humanrepairmap.com">humanrepairmap.com</a> · <a href="https://humanrepairmap.com/#/machine">model and agent interface</a> · <a href="https://github.com/in-c0/human-repair-map">source</a></p>
</main></body></html>`;
}

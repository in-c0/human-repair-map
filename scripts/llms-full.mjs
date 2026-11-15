#!/usr/bin/env node
/* Write public/llms-full.txt: the whole graph as plain text for language models, one section
 * per record type, from public/graph/graph.json. Generated at assembly; not committed. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const g = JSON.parse(fs.readFileSync(path.join(root, "public/graph/graph.json"), "utf8"));
const by = (t) => g.nodes.filter((n) => n.type === t);
const name = (id) => { const n = g.nodes.find((x) => x.id === id); return n ? (n.name || n.question || n.title || n.statement || n.id) : id; };
const rev = (n) => n.review ? `${n.review.state}${n.review.state === "ai-proposed" ? " (unreviewed, human review: none)" : ""}` : "n/a";
const L = [];
L.push(`# Human Repair Map — full text of graph v${g.manifest.version}, snapshot ${g.manifest.snapshot}, content hash ${g.manifest.contentHash.slice(0, 12)}`);
L.push(``, g.manifest.caveat, ``, `Licence: ${g.manifest.license}. Source: https://humanrepairmap.com/graph/graph.json. Repository: https://github.com/in-c0/human-repair-map`, ``);
L.push(`## Goals (${by("goal").length})`, ``);
for (const n of by("goal")) {
  L.push(`### ${n.name}`, `id: ${n.id} · projections: ${(n.projections || []).join(", ")} · review: ${rev(n)}`, n.description || "");
  for (const r of n.requires || []) { if (r.all) L.push(`Requires all of: ${r.all.map(name).join("; ")}`); if (r.any) L.push(`Requires any of: ${r.any.map(name).join("; ")}`); if (typeof r === "string") L.push(`Requires: ${name(r)}`); }
  if (n.blockedBy && n.blockedBy.length) L.push(`Blocked by: ${n.blockedBy.map(name).join("; ")}`);
  L.push(``);
}
L.push(`## Ranked open questions (${(g.analysis.rankedQuestions || []).length})`, ``, `Ranked by how much of the graph each would unblock. ${g.analysis.method || ""}`, ``);
for (const q of g.analysis.rankedQuestions || []) {
  const n = g.nodes.find((x) => x.id === q.id) || {};
  L.push(`### ${q.question || n.question}`, `id: ${q.id} · state: ${n.state || q.state} · blocks directly: ${(q.blocksDirectly || []).length} · downstream: ${q.downstreamTotal ?? ""} · review: ${rev(n)}`);
  if (n.why) L.push(`Why it matters: ${n.why}`);
  if (n.whatWouldResolve) L.push(`What would resolve it: ${Array.isArray(n.whatWouldResolve) ? n.whatWouldResolve.join(" ") : n.whatWouldResolve}`);
  L.push(``);
}
L.push(`## Capabilities (${by("capability").length})`, ``, `Rung: L0 idea · L1 dish · L2 rodent · L3 large animal · L4 humans, one group · L5 humans, independently replicated.`, ``);
for (const n of by("capability")) {
  const gr = n.grade || {};
  L.push(`### ${n.name}`, `id: ${n.id} · rung: ${gr.rung || "?"} · measured: ${gr.measured || "?"} · blocked: ${gr.blocked || "?"} · basis: ${gr.basis || "?"} · projections: ${(n.projections || []).join(", ")} · review: ${rev(n)}`);
  if (n.description) L.push(n.description);
  if (gr.note) L.push(`Grade note: ${gr.note}`);
  const dr = n.derivedRelations || {};
  for (const k of Object.keys(dr)) if (Array.isArray(dr[k]) && dr[k].length) L.push(`${k}: ${dr[k].slice(0, 12).map(name).join("; ")}${dr[k].length > 12 ? " …" : ""}`);
  L.push(``);
}
L.push(`## Claims (${by("claim").length})`, ``);
for (const n of by("claim")) { L.push(`- ${n.statement} [${n.id}; rung ${n.rung || "?"}; ${n.status && n.status.peerReviewed ? "peer-reviewed" : "not peer-reviewed"}; independent groups: ${n.replication ? (n.replication.independentGroups ?? "?") : "?"}; review: ${rev(n)}]${n.replication && n.replication.note ? ` ${n.replication.note}` : ""}${Array.isArray(n.evidence) ? ` evidence: ${n.evidence.map((e) => `${name(e.source)} (${e.design || "design not stated"})`).join("; ")}` : ""}${Array.isArray(n.supports) ? ` supports: ${n.supports.map(name).join("; ")}` : ""}`); }
L.push(``, `## Contradictions (${(g.analysis.contradictions || []).length})`, ``);
for (const c of g.analysis.contradictions || []) L.push(`- ${c.statement || name(c.claim)} — contradicts: ${(c.contradicts || []).map(name).join("; ")}`);
L.push(``, `## Sources (${by("source").length})`, ``);
for (const n of by("source")) L.push(`- ${n.citation || n.title || n.id}${n.doi ? ` doi:${n.doi}` : ""}${n.pmid ? ` pmid:${n.pmid}` : ""}${n.url && !n.doi ? ` ${n.url}` : ""} [${n.id}; ${n.kind || "source"}${n.resolution ? `; ${n.resolution.resolved ? `resolved via ${n.resolution.via} on ${n.resolution.checkedOn}${n.resolution.metadataMatches === false ? ", metadata mismatch" : ""}` : "unresolved"}` : ""}]`);
L.push(``, `## Experiments (${by("experiment").length})`, ``);
for (const n of by("experiment")) L.push(`- ${n.name} [${n.id}; status ${n.status || "?"}; review: ${rev(n)}] tests: ${(n.tests || []).map(name).join("; ")}. ${n.design ? ` Design: ${Object.entries(n.design).map(([k, v]) => `${k}: ${v}`).join("; ")}.` : ""}${n.discriminates ? ` Discriminates: ${n.discriminates}` : ""}${n.feasibility ? ` Feasibility: ${n.feasibility.costClass || "?"} cost, ${n.feasibility.durationClass || "?"}${n.feasibility.requires ? `, requires ${n.feasibility.requires.join(", ")}` : ""}.` : ""}`);
L.push(``, `## Cells and tissues (${by("cell").length})`, ``);
for (const n of by("cell")) L.push(`- ${n.name} [${n.id}; system ${n.system || "?"}; ${n.kind || ""}; renewal: ${n.renewal || "?"}]${Array.isArray(n.failures) && n.failures.length ? ` Failure modes: ${n.failures.map((f) => typeof f === "string" ? f : (f.name || f.mode || JSON.stringify(f))).join("; ")}.` : ""}`);
L.push(``, `## Delivery routes to the brain (${by("route").length})`, ``);
for (const n of by("route")) L.push(`- ${n.name} [${n.id}; family ${n.family || "?"}; rung ${n.rung || "?"}; measured ${n.measured || "?"}; status ${n.status || "?"}; replication: ${n.replication || "?"}; review: ${rev(n)}]${n.note ? ` ${n.note}` : ""}${n.wouldMove ? ` Would move: ${n.wouldMove}` : ""}`);
L.push(``, `---`, `Propose a change: POST https://humanrepairmap.com/api/proposals (see https://humanrepairmap.com/llms.txt). Nothing changes a record without a named human's commit.`);
fs.writeFileSync(path.join(root, "public/llms-full.txt"), L.join("\n") + "\n");
console.log(`wrote public/llms-full.txt (${(L.join("\n").length / 1024).toFixed(0)} KB)`);

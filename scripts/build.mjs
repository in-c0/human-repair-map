/* Build: records/ -> every generated consumer.
   The ONLY writer of content/records.js, mcp/src/generated.js and public/graph/*.
   Validates first; refuses to emit anything if any record is invalid.

   v0.3: records/graph/ (goals, capabilities, questions, claims, experiments,
   sources) is validated against schema/*.json, checked for referential
   integrity and dependency cycles, merged with the v0.2 grid (each cell x class
   becomes a derived capability) and the v0.1 routes, and emitted as ONE graph
   with all inverse relations derived here — never hand-written twice. */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createValidator } from "./lib/schema-validate.mjs";
import { analyse } from "./lib/graph-analysis.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const R = (...p) => path.join(root, ...p);

const RUNGS = ["L0", "L1", "L2", "L3", "L4", "L5"];
const GROUNDINGS = ["G0", "G1", "G2", "G3", "G4"];
const MEASURED = ["function", "biomarker", "opening", "transduction", "access", "none"];
const REVIEW = ["ai-proposed", "submitted", "in-review", "reviewed", "disputed", "superseded"];
const FAMILY = ["through barrier", "around barrier"];
const CAPS = ["see", "model", "reach", "edit", "verify"];
const BLOCKED = ["none", "science", "framework"];
const KIND = ["cell", "non-cell"];
const GRAPH_VERSION = "0.3.0";

const errors = [];
const warnings = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function readDir(dir, sub) {
  const p = sub ? R("records", dir, sub) : R("records", dir);
  if (!fs.existsSync(p)) return [];
  const label = `${dir}/${sub ? sub + "/" : ""}`;
  return fs
    .readdirSync(p)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      const raw = fs.readFileSync(path.join(p, f), "utf8");
      let json;
      try { json = JSON.parse(raw); }
      catch (e) { fail(label + f, `invalid JSON — ${e.message}`); return null; }
      const expectId = f.replace(/\.json$/, "");
      const gotSlug = typeof json.id === "string" && json.id.includes("/") ? json.id.split("/")[1] : json.id;
      if (gotSlug !== expectId) fail(label + f, `id "${json.id}" does not match filename "${expectId}"`);
      Object.defineProperty(json, "__file", { value: label + f, enumerable: false });
      return json;
    })
    .filter(Boolean);
}

/* ---------------------------------------------------------- v0.1 / v0.2 */

function validateRoute(r, file) {
  const need = ["id", "subject", "family", "rung", "grounding", "measured", "replication", "status", "review", "note", "drift", "citations", "score"];
  need.forEach((k) => { if (r[k] === undefined || r[k] === null || r[k] === "") fail(file, `missing required field "${k}"`); });
  if (r.rung && !RUNGS.includes(r.rung)) fail(file, `rung "${r.rung}" is not one of ${RUNGS.join(", ")}`);
  if (r.grounding && !GROUNDINGS.includes(r.grounding)) fail(file, `grounding "${r.grounding}" is not one of ${GROUNDINGS.join(", ")}`);
  if (r.measured && !MEASURED.includes(r.measured)) fail(file, `measured "${r.measured}" is not one of ${MEASURED.join(", ")}`);
  if (r.review && !REVIEW.includes(r.review)) fail(file, `review "${r.review}" is not one of ${REVIEW.join(", ")}`);
  if (r.family && !FAMILY.includes(r.family)) fail(file, `family "${r.family}" is not one of ${FAMILY.join(", ")}`);
  if (Array.isArray(r.citations) && r.citations.length === 0) fail(file, "citations is empty — a record with no source cannot enter the map");
  if (typeof r.score === "number" && (r.score < 0 || r.score > 100)) fail(file, `score ${r.score} is outside 0–100`);
  if (r.review === "reviewed" && !r.reviewedBy) fail(file, 'review is "reviewed" but reviewedBy is absent — only a named human may set this');
}

function validateCapabilityV1(c, file) {
  ["id", "code", "title", "summary", "score", "interval", "review"].forEach((k) => {
    if (c[k] === undefined) fail(file, `missing required field "${k}"`);
  });
  if (c.review && !REVIEW.includes(c.review)) fail(file, `review "${c.review}" is not valid`);
  if (Array.isArray(c.interval) && c.interval.length !== 2) fail(file, "interval must be [low, high]");
}

function validateCell(c, file) {
  ["id", "name", "system", "kind", "renewal", "failures", "capabilities", "anchors", "review"].forEach((k) => {
    if (c[k] === undefined || c[k] === null || c[k] === "") fail(file, `missing required field "${k}"`);
  });
  if (c.kind && !KIND.includes(c.kind)) fail(file, `kind "${c.kind}" is not one of ${KIND.join(", ")}`);
  if (c.review && !REVIEW.includes(c.review)) fail(file, `review "${c.review}" is not valid`);
  if (c.review === "reviewed" && !c.reviewedBy) fail(file, 'review is "reviewed" but reviewedBy is absent — only a named human may set this');
  if (Array.isArray(c.anchors) && c.anchors.length === 0) fail(file, "anchors is empty — a graded node needs at least one named source");
  const caps = c.capabilities || {};
  CAPS.forEach((k) => {
    const v = caps[k];
    if (!v) { fail(file, `missing capability "${k}" — the grid must be complete`); return; }
    if (!RUNGS.includes(v.grade)) fail(file, `${k}.grade "${v.grade}" is not one of ${RUNGS.join(", ")}`);
    if (!BLOCKED.includes(v.blocked)) fail(file, `${k}.blocked "${v.blocked}" is not one of ${BLOCKED.join(", ")}`);
    if (!v.note) fail(file, `${k} has no note — a grade without a reason cannot be checked`);
  });
}

const rubrics = JSON.parse(fs.readFileSync(R("records", "rubrics.json"), "utf8"));
const routes = readDir("cns-delivery");
const capabilitiesV1 = readDir("capabilities");
const cells = readDir("cells");

routes.forEach((r) => validateRoute(r, r.__file));
capabilitiesV1.forEach((c) => validateCapabilityV1(c, c.__file));
cells.forEach((c) => validateCell(c, c.__file));
{
  const ids = routes.map((r) => r.id);
  ids.forEach((id, i) => { if (ids.indexOf(id) !== i) fail("cns-delivery", `duplicate id "${id}"`); });
}

/* ------------------------------------------------------------- v0.3 graph */

const schemaDir = R("schema");
const schemas = {};
for (const f of fs.readdirSync(schemaDir).filter((f) => f.endsWith(".schema.json"))) {
  schemas[f] = JSON.parse(fs.readFileSync(path.join(schemaDir, f), "utf8"));
}
const validate = createValidator(schemas);
const ontology = {
  relationships: JSON.parse(fs.readFileSync(R("ontology", "relationships.json"), "utf8")),
  primitives: JSON.parse(fs.readFileSync(R("ontology", "repair-primitives.json"), "utf8")),
  reviewStates: JSON.parse(fs.readFileSync(R("ontology", "review-states.json"), "utf8")),
  mappings: JSON.parse(fs.readFileSync(R("ontology", "mappings.json"), "utf8"))
};

const KINDS = [
  ["goals", "goal.schema.json"],
  ["capabilities", "capability.schema.json"],
  ["questions", "question.schema.json"],
  ["claims", "claim.schema.json"],
  ["experiments", "experiment.schema.json"],
  ["sources", "source.schema.json"]
];
const graphRecords = {};
for (const [dir, schema] of KINDS) {
  graphRecords[dir] = readDir("graph", dir);
  for (const rec of graphRecords[dir]) for (const e of validate(schema, rec)) fail(rec.__file, e);
}

/* ---- derived nodes: cells, routes, grid capabilities ---- */

const cellNodes = cells.map((c) => ({
  id: `hrm:cell/${c.id}`,
  type: "cell",
  name: c.name,
  system: c.system,
  kind: c.kind,
  renewal: c.renewal,
  failures: c.failures,
  anchors: c.anchors,
  order: c.order,
  projections: ["universal-repair", "rejuvenation"],
  review: { state: c.review, ...(c.reviewedBy ? { reviewedBy: c.reviewedBy } : {}) },
  lastChecked: c.lastChecked,
  capabilities: CAPS.map((k) => `hrm:capability/${c.id}--${k}`)
}));

const CLASS_QUESTION = Object.fromEntries(ontology.primitives.classes.map((c) => [c.id, c.question]));
const derivedCapabilities = [];
for (const c of cells) {
  for (const k of CAPS) {
    const v = c.capabilities[k];
    derivedCapabilities.push({
      id: `hrm:capability/${c.id}--${k}`,
      type: "capability",
      derived: true,
      name: `${c.name}: ${k}`,
      class: k,
      description: `${CLASS_QUESTION[k]} Target: ${c.name}${c.kind === "non-cell" ? " (not a cell)" : ""}.`,
      target: { node: `hrm:cell/${c.id}` },
      projections: ["universal-repair", "rejuvenation"],
      grade: { basis: "claims", rung: v.grade, measured: "unspecified", blocked: v.blocked, note: v.note },
      provenance: {
        proposedBy: { type: "import", name: "scripts/build.mjs" },
        method: `derived from records/cells/${c.id}.json (v0.2 grid, graded ${c.lastChecked || "n/a"}); the anchors on the cell record are the evidence`,
        date: c.lastChecked || "2026-07-28"
      },
      review: { state: c.review, ...(c.reviewedBy ? { reviewedBy: c.reviewedBy } : {}) }
    });
  }
}

const routeNodes = routes.map((r) => ({
  id: `hrm:route/${r.id}`,
  type: "route",
  name: r.subject,
  family: r.family,
  rung: r.rung,
  grounding: r.grounding,
  measured: r.measured,
  score: r.score,
  status: r.status,
  replication: r.replication,
  note: r.note,
  drift: r.drift,
  ...(r.precision ? { precision: r.precision } : {}),
  citations: r.citations,
  wouldMove: r.wouldMove,
  projections: ["universal-repair", "rejuvenation"],
  supports: ["hrm:capability/cns-neuron--reach"],
  review: { state: r.review, ...(r.reviewedBy ? { reviewedBy: r.reviewedBy } : {}) }
}));

/* ---- assemble the node index ---- */

const nodes = new Map();
const fileOf = new Map();
const add = (n) => {
  if (nodes.has(n.id)) { fail(n.__file || n.id, `duplicate id "${n.id}"`); return; }
  nodes.set(n.id, n);
  fileOf.set(n.id, n.__file || "(derived)");
};
for (const [dir] of KINDS) graphRecords[dir].forEach(add);
derivedCapabilities.forEach((c) => {
  if (nodes.has(c.id)) fail("build", `hand-authored record collides with derived grid id "${c.id}"`);
  else add(c);
});
cellNodes.forEach(add);
routeNodes.forEach(add);

/* ---- referential integrity ---- */

function* refsOf(n) {
  const list = (k) => (Array.isArray(n[k]) ? n[k] : []);
  if (n.parent) yield ["parent", n.parent];
  for (const g of n.requires || []) for (const id of g.all || g.any || []) yield ["requires", id];
  for (const id of list("blockedBy")) yield ["blockedBy", id];
  for (const id of list("blocks")) yield ["blocks", id];
  for (const id of list("resolvedBy")) yield ["resolvedBy", id];
  for (const id of list("supports")) yield ["supports", id];
  for (const id of list("contradicts")) yield ["contradicts", id];
  for (const id of list("replicates")) yield ["replicates", id];
  for (const id of list("tests")) yield ["tests", id];
  for (const id of list("results")) yield ["results", id];
  for (const e of n.evidence || []) yield ["evidence.source", e.source];
  for (const id of (n.provenance && n.provenance.evidenceAccessed) || []) yield ["provenance.evidenceAccessed", id];
  if (n.target && n.target.node) yield ["target.node", n.target.node];
  if (n.review && n.review.supersededBy) yield ["review.supersededBy", n.review.supersededBy];
}
const TYPE_OF = (id) => id.split(":")[1].split("/")[0];
const EXPECT = {
  parent: ["goal"], requires: ["goal", "capability"], blockedBy: ["question"], blocks: ["goal", "capability"],
  resolvedBy: ["claim"], supports: ["capability", "goal"], contradicts: ["claim", "capability"], replicates: ["claim"],
  tests: ["question"], results: ["claim"], "evidence.source": ["source"], "provenance.evidenceAccessed": ["source"],
  "target.node": ["cell"], "review.supersededBy": null
};
for (const n of nodes.values()) {
  for (const [field, id] of refsOf(n)) {
    if (!nodes.has(id)) { fail(fileOf.get(n.id), `${field} → "${id}" does not exist`); continue; }
    const want = EXPECT[field];
    if (want && !want.includes(TYPE_OF(id))) fail(fileOf.get(n.id), `${field} → "${id}" must be a ${want.join("|")}`);
    if (id === n.id) fail(fileOf.get(n.id), `${field} refers to itself`);
  }
}

/* ---- graph-level rules ---- */

const claimsByTarget = new Map();
for (const n of nodes.values()) {
  if (n.type !== "claim" && n.type !== "route") continue;
  for (const id of [...(n.supports || []), ...(n.contradicts || [])]) {
    if (!claimsByTarget.has(id)) claimsByTarget.set(id, []);
    claimsByTarget.get(id).push(n.id);
  }
}
for (const n of nodes.values()) {
  const f = fileOf.get(n.id);
  if (n.type === "capability" && !n.derived) {
    if (n.grade.basis === "claims" && !(claimsByTarget.get(n.id) || []).length)
      fail(f, `grade.basis is "claims" but no claim supports or contradicts ${n.id}`);
    if (n.grade.basis === "standard-of-care" && (n.grade.note || "").length < 40)
      fail(f, "standard-of-care grades need a note saying which practice (>= 40 chars)");
  }
  if (n.type === "question") {
    if (n.state === "resolved" && !(n.resolvedBy || []).length) fail(f, "state is resolved but resolvedBy is empty");
    if (n.state === "open" && (n.resolvedBy || []).length) fail(f, "state is open but resolvedBy is non-empty");
  }
  if (n.type === "claim") {
    if (!(n.supports || []).length && !(n.contradicts || []).length) warn(f, "claim supports and contradicts nothing — it is in the graph but attached to no capability");
    for (const e of n.evidence || []) {
      const s = nodes.get(e.source);
      if (s && !s.resolution.resolved) warn(f, `cites ${e.source}, which is not machine-resolved`);
    }
    if (n.review && n.review.state === "reviewed") {
      for (const e of n.evidence || []) {
        const s = nodes.get(e.source);
        if (s && !s.humanOpened) fail(f, `reviewed claim cites ${e.source} which no human has opened`);
        if (!e.locator) fail(f, `reviewed claim has an evidence item without a locator`);
      }
    }
  }
  if (n.type === "source" && n.resolution && n.resolution.resolved && !n.resolution.checkedOn) fail(f, "resolved source has no checkedOn date");
}

/* ---- requires must be acyclic (the analysis and the critical path depend on it) ---- */
{
  const adj = new Map();
  for (const n of nodes.values()) {
    if (!n.requires) continue;
    adj.set(n.id, (n.requires || []).flatMap((g) => g.all || g.any || []));
  }
  const state = new Map();
  const stack = [];
  const visit = (id) => {
    state.set(id, 1); stack.push(id);
    for (const d of adj.get(id) || []) {
      if (state.get(d) === 1) fail("graph", `dependency cycle: ${[...stack.slice(stack.indexOf(d)), d].join(" → ")}`);
      else if (!state.get(d)) visit(d);
    }
    stack.pop(); state.set(id, 2);
  };
  for (const id of adj.keys()) if (!state.get(id)) visit(id);
}

if (errors.length) {
  console.error(`\n  BUILD FAILED — ${errors.length} problem(s):\n`);
  errors.forEach((e) => console.error("   ✕ " + e));
  console.error("");
  process.exit(1);
}

/* ---- derive inverses (stored once, computed here) ---- */

const push = (id, key, val) => {
  const n = nodes.get(id);
  if (!n) return;
  if (!n.derivedRelations) n.derivedRelations = {};
  if (!n.derivedRelations[key]) n.derivedRelations[key] = [];
  if (!n.derivedRelations[key].includes(val)) n.derivedRelations[key].push(val);
};
for (const n of nodes.values()) {
  for (const g of n.requires || []) for (const id of g.all || g.any || []) push(id, "enables", n.id);
  for (const id of n.blockedBy || []) { push(id, "blocks", n.id); push(n.id, "blockedBy", id); }
  for (const id of n.blocks || []) { push(n.id, "blocks", id); push(id, "blockedBy", n.id); }
  for (const id of n.supports || []) push(id, "supportedBy", n.id);
  for (const id of n.contradicts || []) push(id, "contradictedBy", n.id);
  for (const id of n.replicates || []) push(id, "replicatedBy", n.id);
  for (const id of n.tests || []) push(id, "testedBy", n.id);
  for (const id of n.resolvedBy || []) push(id, "resolves", n.id);
  for (const e of n.evidence || []) push(e.source, "citedBy", n.id);
  if (n.parent) push(n.parent, "children", n.id);
  if (n.target && n.target.node) push(n.target.node, "capabilities", n.id);
}
// A question's blocks and a capability's blockedBy are the same relation stated from
// either side; from here on, both sides carry the union.
for (const n of nodes.values()) {
  const d = n.derivedRelations || {};
  if (n.type === "question" && d.blocks) n.blocks = [...new Set([...(n.blocks || []), ...d.blocks])].sort();
  if ((n.type === "capability" || n.type === "goal") && d.blockedBy) n.blockedBy = [...new Set([...(n.blockedBy || []), ...d.blockedBy])].sort();
}

/* ---- analysis: ranking and critical paths, computed from structure only ---- */

const analysis = analyse(nodes);

/* ---- emit ---- */

const banner = "/* GENERATED by scripts/build.mjs from records/. Do not edit by hand —\n   your changes will be overwritten and CI will fail. Edit records/ instead. */\n";

const all = [...nodes.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
const counts = {};
for (const n of all) counts[n.type] = (counts[n.type] || 0) + 1;
const reviewCounts = {};
for (const n of all) { const s = (n.review && n.review.state) || "n/a"; reviewCounts[s] = (reviewCounts[s] || 0) + 1; }
const snapshot = all.reduce((m, n) => { const d = (n.provenance && n.provenance.date) || n.lastChecked || ""; return d > m ? d : m; }, "");
const canonical = JSON.stringify(all);
const contentHash = crypto.createHash("sha256").update(canonical).digest("hex");

const manifest = {
  name: "Human Repair Graph",
  version: GRAPH_VERSION,
  snapshot,
  contentHash,
  counts,
  reviewStates: reviewCounts,
  humanReviewed: all.filter((n) => n.review && n.review.state === "reviewed").length,
  projections: ontology.relationships.projections,
  formats: {
    json: "/graph/graph.json",
    jsonl: "/graph/graph.jsonl",
    jsonld: "/graph/graph.jsonld",
    schemas: "/graph/schema/",
    api: "/api/graph",
    mcp: "/mcp"
  },
  license: "CC BY 4.0 for graph data; sources remain under their publishers' terms",
  caveat: "Every record carries its own review state. Unless it says reviewed with a named human, no human has opened its sources. This is a map of research state, not clinical advice."
};

const bundle = { manifest, ontology, rubrics, nodes: all, analysis };

fs.mkdirSync(R("public", "graph", "schema"), { recursive: true });
fs.writeFileSync(R("public", "graph", "graph.json"), JSON.stringify(bundle, null, 1) + "\n");
fs.writeFileSync(R("public", "graph", "graph.jsonl"), all.map((n) => JSON.stringify(n)).join("\n") + "\n");
fs.writeFileSync(R("public", "graph", "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const context = { ...ontology.mappings.prefixes, id: "@id", type: "@type", hrm: ontology.mappings.prefixes.hrm };
fs.writeFileSync(R("public", "graph", "graph.jsonld"), JSON.stringify({ "@context": context, "@graph": all.map((n) => ({ ...n, "@type": "hrm:" + n.type })) }, null, 1) + "\n");
for (const f of Object.keys(schemas)) fs.writeFileSync(R("public", "graph", "schema", f), JSON.stringify(schemas[f], null, 2) + "\n");
fs.writeFileSync(R("public", "graph", "README.md"), [
  "# Human Repair Graph — bulk export",
  "",
  "Generated by `scripts/build.mjs`; do not edit. Same content in three shapes:",
  "",
  "- `graph.json` — the whole bundle: manifest, ontology, rubrics, every node (with derived inverse relations under `derivedRelations`), and the structural analysis.",
  "- `graph.jsonl` — one node per line, for streaming and diffing.",
  "- `graph.jsonld` — the same nodes with a JSON-LD context mapping `hrm:` and the external prefixes to resolvable IRIs.",
  "- `schema/` — the JSON Schemas every record was validated against.",
  "- `manifest.json` — version, snapshot date, content hash and counts. The hash changes iff a record changed.",
  "",
  "Live copies: https://humanrepairmap.com/graph/ · API: https://humanrepairmap.com/api/graph · MCP: https://humanrepairmap.com/mcp",
  ""
].join("\n"));

// v0.1/v0.2 consumers keep their shape; the graph rides alongside.
const payload = { rubrics, capabilities: capabilitiesV1, routes, cells, graph: { manifest, nodes: all, analysis } };
fs.writeFileSync(R("content", "records.js"), banner + "window.HRM_RECORDS = " + JSON.stringify(payload, null, 2) + ";\n");

const esm =
  banner +
  "export const RUBRICS = " + JSON.stringify(rubrics, null, 2) + ";\n\n" +
  "export const CAPABILITIES = " + JSON.stringify(capabilitiesV1, null, 2) + ";\n\n" +
  "export const ROUTES = " + JSON.stringify(routes, null, 2) + ";\n\n" +
  "export const CELLS = " + JSON.stringify(cells, null, 2) + ";\n\n" +
  "export const GRAPH = " + JSON.stringify(bundle, null, 1) + ";\n";
fs.writeFileSync(R("mcp", "src", "generated.js"), esm);

const reviewed = routes.filter((r) => r.review === "reviewed").length;
console.log(`  ✓ ${cells.length} grid nodes (${cells.length * CAPS.length} derived capabilities), ${routes.length} routes, ${capabilitiesV1.length} v0.1 capabilities validated`);
console.log(`  ✓ graph v${GRAPH_VERSION} snapshot ${snapshot}: ${all.length} nodes — ` + Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", "));
console.log(`  ✓ wrote content/records.js, mcp/src/generated.js, public/graph/{graph.json,graph.jsonl,graph.jsonld,manifest.json,schema/}`);
console.log(`  · content hash ${contentHash.slice(0, 12)} · human-reviewed records: ${manifest.humanReviewed}/${all.length} (routes ${reviewed}/${routes.length})`);
if (warnings.length) { console.log(`  · ${warnings.length} warning(s):`); warnings.forEach((w) => console.log("    ! " + w)); }

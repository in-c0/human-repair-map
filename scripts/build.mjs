/* Build: records/ -> generated consumers.
   The ONLY writer of content/records.js and mcp/src/generated.js.
   Validates first; refuses to emit anything if a record is invalid. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

function readDir(dir) {
  const p = R("records", dir);
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      const raw = fs.readFileSync(path.join(p, f), "utf8");
      let json;
      try { json = JSON.parse(raw); }
      catch (e) { fail(`${dir}/${f}`, `invalid JSON — ${e.message}`); return null; }
      const expectId = f.replace(/\.json$/, "");
      if (json.id !== expectId) fail(`${dir}/${f}`, `id "${json.id}" does not match filename "${expectId}"`);
      return json;
    })
    .filter(Boolean);
}

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

function validateCapability(c, file) {
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
const capabilities = readDir("capabilities");
const cells = readDir("cells");

routes.forEach((r) => validateRoute(r, `cns-delivery/${r.id}.json`));
capabilities.forEach((c) => validateCapability(c, `capabilities/${c.id}.json`));
cells.forEach((c) => validateCell(c, `cells/${c.id}.json`));

const ids = routes.map((r) => r.id);
ids.forEach((id, i) => { if (ids.indexOf(id) !== i) fail("cns-delivery", `duplicate id "${id}"`); });

if (errors.length) {
  console.error(`\n  BUILD FAILED — ${errors.length} problem(s):\n`);
  errors.forEach((e) => console.error("   ✕ " + e));
  console.error("");
  process.exit(1);
}

/* ---------- emit ---------- */
const banner = "/* GENERATED by scripts/build.mjs from records/. Do not edit by hand —\n   your changes will be overwritten and CI will fail. Edit records/ instead. */\n";

const payload = { rubrics, capabilities, routes, cells };
fs.writeFileSync(R("content", "records.js"), banner + "window.HRM_RECORDS = " + JSON.stringify(payload, null, 2) + ";\n");

const esm =
  banner +
  "export const RUBRICS = " + JSON.stringify(rubrics, null, 2) + ";\n\n" +
  "export const CAPABILITIES = " + JSON.stringify(capabilities, null, 2) + ";\n\n" +
  "export const ROUTES = " + JSON.stringify(routes, null, 2) + ";\n\n" +
  "export const CELLS = " + JSON.stringify(cells, null, 2) + ";\n";
fs.writeFileSync(R("mcp", "src", "generated.js"), esm);

const reviewed = routes.filter((r) => r.review === "reviewed").length;
const claims = cells.length * CAPS.length;
console.log(`  ✓ ${cells.length} grid nodes (${claims} graded claims), ${routes.length} routes, ${capabilities.length} capabilities validated`);
console.log(`  ✓ wrote content/records.js and mcp/src/generated.js`);
console.log(`  · human-reviewed records: ${reviewed}/${routes.length}`);

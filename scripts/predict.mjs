#!/usr/bin/env node
/* Register one predictor's answers to the standing prediction sheet (data/prediction-sheet.json)
 * at POST /api/predictions. Each answer is locked in the public event log with the graph snapshot
 * it was made against; the registration can never be edited.
 *
 *   node scripts/predict.mjs answers.json            register
 *   node scripts/predict.mjs answers.json --dry-run  print the payloads
 *   node scripts/predict.mjs --prompt                print the prompt to give a model
 *
 * answers.json:
 *   { "predictor": { "type": "ai", "name": "…", "model": "…", "version": "…" },
 *     "answers": [ { "id": "ps-01", "probability": 0.35, "reasoning": "…" }, … ] }
 * Env: HRM_API (default https://humanrepairmap.com/api)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = process.env.HRM_API || "https://humanrepairmap.com/api";
const sheet = JSON.parse(fs.readFileSync(path.join(root, "data", "prediction-sheet.json"), "utf8"));
const args = process.argv.slice(2);

if (args.includes("--prompt")) {
  const graph = JSON.parse(fs.readFileSync(path.join(root, "public", "graph", "graph.json"), "utf8"));
  const node = (id) => graph.nodes.find((n) => n.id === id) || {};
  console.log(`You are being asked to forecast ${sheet.statements.filter((s) => !s.retired).length} statements about regenerative medicine for a public, dated prediction registry (Human Repair Map, https://humanrepairmap.com). Your answers will be locked with today's date and scored when each statement resolves. Give calibrated probabilities, not hopes. Use what you know as of your training data; say so if you cannot access anything newer.\n`);
  console.log(`For each statement, reply with exactly one line in this form:\n<id> | <probability between 0 and 1> | <one or two sentences of reasoning: the main consideration and the main uncertainty>\n\nThen one final line: MODEL | <your model name and version as precisely as you know it>\n`);
  console.log(`Today's date: ${new Date().toISOString().slice(0, 10)}. Graph snapshot: ${graph.manifest.version}@${graph.manifest.contentHash.slice(0, 12)}.\n`);
  sheet.statements.filter((s) => !s.retired).forEach((s, i) => {
    const n = node(s.subject);
    console.log(`${s.id}. ${s.statement}`);
    console.log(`   Resolves: ${s.resolutionCriteria}`);
    console.log(`   Context from the graph (${s.subject}): ${(n.why || n.description || n.question || "").slice(0, 400)}`);
    if (n.whatWouldResolve) console.log(`   What the graph says would resolve it: ${Array.isArray(n.whatWouldResolve) ? n.whatWouldResolve.join(" ") : n.whatWouldResolve}`.slice(0, 500));
    console.log("");
  });
  process.exit(0);
}

const file = args.find((a) => !a.startsWith("--"));
if (!file) { console.error("usage: node scripts/predict.mjs answers.json [--dry-run] | --prompt"); process.exit(1); }
const DRY = args.includes("--dry-run");
const A = JSON.parse(fs.readFileSync(file, "utf8"));
if (!A.predictor || !A.predictor.name) { console.error("predictor.name is required"); process.exit(1); }
const byId = new Map(sheet.statements.map((s) => [s.id, s]));
let ok = 0, failed = 0;
for (const a of A.answers || []) {
  const s = byId.get(a.id);
  if (!s) { console.error(`${a.id}: not on the sheet`); failed++; continue; }
  if (s.retired) { console.error(`${a.id}: retired (${s.retired.reason.slice(0, 80)}…); skipped`); continue; }
  const body = {
    subject: s.subject, statement: s.statement, resolutionCriteria: s.resolutionCriteria, horizon: s.horizon,
    probability: Number(a.probability), predictor: A.predictor, reasoning: `[${s.id}] ${a.reasoning || ""}`.trim(),
    evidenceAccessed: Array.isArray(a.evidenceAccessed) ? a.evidenceAccessed : (A.evidenceAccessed || [])
  };
  if (DRY) { console.log(`${a.id} ${body.probability} ${A.predictor.name}${A.predictor.model ? "/" + A.predictor.model : ""}: ${body.reasoning.slice(0, 100)}`); ok++; continue; }
  const r = await fetch(API + "/predictions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (r.ok) { ok++; console.log(`${a.id} -> ${j.id} (p=${body.probability})`); } else { failed++; console.error(`${a.id} failed: ${r.status} ${JSON.stringify(j).slice(0, 200)}`); }
  await new Promise((res) => setTimeout(res, 300));
}
console.log(`${ok} registered, ${failed} failed`);
process.exit(failed ? 1 : 0);

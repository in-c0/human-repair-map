#!/usr/bin/env node
/* The live feed. For every record with a curated query, find papers and trials that appeared
 * since the last run. Two outputs, deliberately different in weight:
 *
 *   public/graph/feed.json   everything that fits the record's own terms: a rolling 90-day digest
 *                            the site shows at #/changes ("what changed"). A search, not a claim.
 *   POST /api/proposals      only the strong items: a newly registered interventional trial, a
 *                            clinical trial or RCT paper, or a paper whose title carries two of the
 *                            record's terms. Each becomes a `new-evidence` proposal, and the bridge
 *                            turns it into a draft pull request for a human to judge.
 *
 * Keyword hits are cheap and a review queue is not, so the bar for a proposal is high and the
 * bar for the digest is low. Nothing here edits records/.
 *
 * State lives in feed.json itself (`seen`: keys already digested or filed, `lastRun`). The nightly
 * workflow fetches the live copy from the site before running, so nothing is committed: generated
 * data is deployed, records are committed. Flood control: FEED_PER_RECORD proposals per record (1)
 * and FEED_MAX per run (10).
 *
 *   node scripts/feed.mjs            update the digest and file proposals
 *   node scripts/feed.mjs --dry-run  print what would be filed; still writes nothing
 * Env: HRM_API (default https://humanrepairmap.com/api), FEED_PER_RECORD, FEED_MAX
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = process.env.HRM_API || "https://humanrepairmap.com/api";
const DRY = process.argv.includes("--dry-run");
const PER = Number(process.env.FEED_PER_RECORD || 1), MAX = Number(process.env.FEED_MAX || 10);
const DIGEST = path.join(root, "public", "graph", "feed.json");
const UA = { "User-Agent": "human-repair-map/0.3 feed (https://humanrepairmap.com; mailto:hello@ava.kim)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => String(s || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const queries = JSON.parse(fs.readFileSync(path.join(root, "data", "activity-queries.json"), "utf8"));
const graph = JSON.parse(fs.readFileSync(path.join(root, "public", "graph", "graph.json"), "utf8"));
const NODES = new Map(graph.nodes.map((n) => [n.id, n]));
const digest = fs.existsSync(DIGEST) ? JSON.parse(fs.readFileSync(DIGEST, "utf8")) : { lastRun: null, seen: {}, items: [] };
const state = digest;
const since = state.lastRun || (() => { const d = new Date(); d.setDate(d.getDate() - 14); return d.toISOString().slice(0, 10); })();
const today = new Date().toISOString().slice(0, 10);
const seen = state.seen || {};
/* sources already in the graph never get re-filed */
for (const n of graph.nodes) if (n.type === "source") { if (n.doi) seen["doi:" + n.doi.toLowerCase()] = "in-graph"; if (n.nct) seen["nct:" + n.nct] = "in-graph"; }

async function newPapers(q) {
  const query = `(${q}) AND FIRST_PDATE:[${since} TO ${today}] AND (SRC:MED OR SRC:PPR) AND NOT (PUB_TYPE:Review OR PUB_TYPE:"Systematic Review" OR PUB_TYPE:Editorial OR PUB_TYPE:Comment OR PUB_TYPE:"Case Reports")`;
  const r = await fetch("https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&pageSize=10&resultType=core&query=" + encodeURIComponent(query), { headers: UA });
  if (!r.ok) throw new Error("Europe PMC " + r.status);
  const j = await r.json();
  return (j.resultList && j.resultList.result || []).map((p) => ({ key: p.doi ? "doi:" + p.doi.toLowerCase() : "pmid:" + p.pmid, title: clean(p.title), year: p.pubYear, doi: p.doi || null, pmid: p.pmid || null, journal: clean(p.journalTitle || (p.journalInfo && p.journalInfo.journal && p.journalInfo.journal.title) || (p.bookOrReportDetails && p.bookOrReportDetails.publisher) || ""), authors: clean(p.authorString).slice(0, 100), date: p.firstPublicationDate, preprint: p.source === "PPR", pubTypes: ((p.pubTypeList && p.pubTypeList.pubType) || []).map(String), abstract: clean(p.abstractText).slice(0, 1500) }));
}
async function newTrials(cond, term) {
  if (!cond && !term) return [];
  const params = new URLSearchParams({ pageSize: "10", sort: "StudyFirstPostDate:desc", "filter.advanced": `AREA[StudyFirstPostDate]RANGE[${since},${today}] AND AREA[StudyType]INTERVENTIONAL` });
  if (cond) params.set("query.cond", cond); if (term) params.set("query.term", term);
  const r = await fetch("https://clinicaltrials.gov/api/v2/studies?" + params.toString(), { headers: UA });
  if (!r.ok) throw new Error("ClinicalTrials.gov " + r.status);
  const j = await r.json();
  return (j.studies || []).map((s) => { const P = s.protocolSection || {}, id = P.identificationModule || {}, st = P.statusModule || {}, sp = P.sponsorCollaboratorsModule || {}, d = P.designModule || {}; return { key: "nct:" + id.nctId, nct: id.nctId, title: clean(id.briefTitle), conditions: ((P.conditionsModule || {}).conditions || []).slice(0, 5), sponsor: sp.leadSponsor && sp.leadSponsor.name, phase: (d.phases || []).join("/"), posted: st.studyFirstPostDateStruct && st.studyFirstPostDateStruct.date, status: st.overallStatus }; });
}

/* a trial is only filed if its title carries one of the record's own search terms (or its conditions
 * carry a quoted phrase); ClinicalTrials.gov condition matching alone pulls in septic-shock and nursing trials
 * for "wound infection" */
const STOP = new Set(["clinical", "human", "humans", "patients", "randomized", "randomised", "treatment", "prevention", "study", "trial", "therapy", "surgical", "outcome", "outcomes", "phase", "adult", "adults"]);
function termsOf(pmc) {
  const phrases = [...String(pmc).matchAll(/"([^"]+)"/g)].map((m) => m[1].toLowerCase());
  const words = String(pmc).replace(/"[^"]+"/g, " ").split(/[^a-z0-9-]+/i).map((w) => w.toLowerCase()).filter((w) => w.length >= 5 && !STOP.has(w) && !/^(and|or|not)$/.test(w));
  return { phrases, words: [...new Set(words)] };
}
function fits(it, pmc) {
  const { phrases, words } = termsOf(pmc);
  const title = (it.title || "").toLowerCase();
  const second = (it.kind === "trial" ? (it.conditions || []).join(" | ") : (it.abstract || "")).toLowerCase();
  /* the title must carry one of the record's own terms, or a quoted phrase must appear in the conditions/abstract;
   * the boolean search alone lets in papers that mention the topic once in passing */
  return words.some((w) => title.includes(w)) || phrases.some((p) => title.includes(p) || second.includes(p));
}

/* strong enough for the review queue, as opposed to the digest */
function strong(it, pmc) {
  if (it.kind === "trial") return true;
  const { words, phrases } = termsOf(pmc), title = (it.title || "").toLowerCase();
  const inTitle = words.some((w) => title.includes(w)) || phrases.some((p) => title.includes(p));
  if (inTitle && (it.pubTypes || []).some((t) => /clinical trial|randomized|randomised/i.test(t))) return true;
  return words.filter((w) => title.includes(w)).length + phrases.filter((p) => title.includes(p)).length >= 2;
}
const cutoff = (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().slice(0, 10); })();
digest.items = (digest.items || []).filter((x) => x.seen >= cutoff);
const inDigest = new Set(digest.items.map((x) => x.key));

let filed = 0, byKey = {};
for (const id of Object.keys(queries).filter((k) => !k.startsWith("$"))) {
  const node = NODES.get(id); if (!node) continue;
  const q = queries[id]; let items = [];
  try { items = items.concat((await newPapers(q.pmc)).map((p) => ({ ...p, kind: "paper" }))); await sleep(250); } catch (e) { console.error(id, e.message); }
  try { items = items.concat((await newTrials(q.ct && q.ct.cond, q.ct && q.ct.term)).map((t) => ({ ...t, kind: "trial" }))); await sleep(250); } catch (e) { console.error(id, e.message); }
  for (const it of items) {
    if (seen[it.key] || !fits(it, q.pmc)) continue;
    if (it.kind === "paper" && /\b(review|meta-analysis|overview|protocol|erratum|correction|retraction)\b/i.test(it.title)) continue;
    if (byKey[it.key]) { byKey[it.key].also.push(id); continue; }
    if (inDigest.has(it.key)) continue;
    const paper = it.kind === "paper";
    byKey[it.key] = {
      key: it.key, kind: it.kind, strong: strong(it, q.pmc), record: id, also: [], seen: today, title: it.title,
      date: paper ? (it.date || String(it.year || "")) : it.posted,
      url: paper ? (it.doi ? "https://doi.org/" + it.doi : (it.pmid ? "https://pubmed.ncbi.nlm.nih.gov/" + it.pmid + "/" : null)) : "https://clinicaltrials.gov/study/" + it.nct,
      meta: paper ? [it.journal, it.preprint ? "preprint" : null].filter(Boolean).join(" · ") : [it.nct, it.phase, it.sponsor].filter(Boolean).join(" · "),
      detail: paper
        ? `Published ${it.date || it.year} in ${it.journal || "an unknown venue"}${it.preprint ? " (preprint, not peer-reviewed)" : ""} by ${it.authors}.`
        : `${it.nct}, ${it.phase || "phase not stated"}, sponsor ${it.sponsor || "unknown"}, first posted ${it.posted}, status ${it.status}.`
    };
    inDigest.add(it.key); digest.items.push(byKey[it.key]);
  }
}
digest.items.sort((a, b) => (b.seen + b.date).localeCompare(a.seen + a.date));
digest.updatedAt = new Date().toISOString(); digest.since = since; digest.window = "rolling 90 days";
digest.sources = { papers: "Europe PMC (MED + preprints), reviews/editorials/case reports excluded, title or quoted phrase must match the record's search", trials: "ClinicalTrials.gov v2, interventional, first posted in the window, title or condition must match" };
console.log(`[feed] digest: ${digest.items.length} item(s) in the rolling window (${digest.items.filter((x) => x.seen === today).length} new today)`);

/* proposals: strong items not yet filed, including ones deferred by an earlier night's cap */
const perRecord = {};
const candidates = digest.items.filter((d) => d.strong && !d.proposal && !seen[d.key]).filter((d) => (perRecord[d.record] = (perRecord[d.record] || 0) + 1) <= PER).slice(0, MAX);
console.log(`[feed] since ${since}: ${candidates.length} item(s) to file (cap ${MAX})`);
for (const d of candidates) {
  const node = NODES.get(d.record), name = node ? (node.name || node.question || d.record) : d.record;
  const alsoNote = d.also.length ? ` The same item also matched: ${d.also.join(", ")}.` : "";
  const body = d.kind === "paper"
    ? { record_id: d.record, kind: "new-evidence", summary: `New paper: ${d.title}`.slice(0, 300),
        rationale: `${d.detail} Found by the automated feed for the record "${name}" using its curated search; a human should read the abstract and decide whether it changes the rung, adds a claim, contradicts one, or is irrelevant. Filed automatically, not endorsed.${alsoNote}`,
        source_url: d.url || "", proposer: "ai:feed/europepmc", actorPrefix: "agent", affil: "automated feed, scripts/feed.mjs" }
    : { record_id: d.record, kind: "new-evidence", summary: `New trial registered: ${d.title}`.slice(0, 300),
        rationale: `${d.detail} Found by the automated feed for the record "${name}". A registered trial is a signal that a group is testing this in people; it is not evidence of a result. A human should decide whether to attach it as an experiment record.${alsoNote}`,
        source_url: d.url, proposer: "ai:feed/clinicaltrials", actorPrefix: "agent", affil: "automated feed, scripts/feed.mjs" };
  if (DRY) { console.log(`  would file on ${d.record}: ${body.summary}`); continue; }
  const r = await fetch(API + "/proposals", { method: "POST", headers: { "Content-Type": "application/json", ...UA }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (r.ok) { seen[d.key] = j.id || today; d.proposal = j.id; filed++; console.log(`  filed ${j.id} on ${d.record}: ${body.summary.slice(0, 80)}`); }
  else console.error(`  failed on ${d.record}: ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  await sleep(400);
}
if (!DRY) {
  /* weak items are done once digested; strong ones stay unseen until filed, so a capped night defers them */
  for (const x of digest.items) if (!seen[x.key] && !x.strong) seen[x.key] = "digest:" + today;
  for (const k of Object.keys(seen)) if (seen[k] === "in-graph") delete seen[k];
  digest.lastRun = today; digest.seen = seen;
  fs.writeFileSync(DIGEST, JSON.stringify(digest, null, 1) + "\n");
}
console.log(`[feed] ${filed} proposal(s) filed`);

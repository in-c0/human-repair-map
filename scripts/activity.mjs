#!/usr/bin/env node
/* Who is working on this?  For every record with a curated query in data/activity-queries.json,
 * fetch recent papers (Europe PMC) and active trials (ClinicalTrials.gov v2) and write
 * public/graph/activity.json. The site shows the result on record and journey pages; the
 * nightly workflow refreshes it. Nothing here is a claim about the science: it is a list of
 * who has published or registered work on the topic recently, with links, so a researcher or
 * a model can see the field rather than only our records of it.
 *
 *   node scripts/activity.mjs             refresh everything
 *   node scripts/activity.mjs --only <id> refresh one record
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "public", "graph", "activity.json");
const UA = { "User-Agent": "human-repair-map/0.3 (https://humanrepairmap.com; mailto:hello@ava.kim)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const only = (() => { const i = process.argv.indexOf("--only"); return i > 0 ? process.argv[i + 1] : null; })();
const SINCE = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 2); return d.toISOString().slice(0, 10); })();

const queries = JSON.parse(fs.readFileSync(path.join(root, "data", "activity-queries.json"), "utf8"));
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { records: {} };
const clean = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function europepmc(q) {
  const query = `(${q}) AND FIRST_PDATE:[${SINCE} TO 2100-12-31] AND (SRC:MED OR SRC:PPR) AND NOT (PUB_TYPE:Review OR PUB_TYPE:"Systematic Review" OR PUB_TYPE:Editorial)`;
  const url = "https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&pageSize=8&resultType=core&query=" + encodeURIComponent(query);
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error("Europe PMC HTTP " + r.status);
  const j = await r.json();
  const total = j.hitCount || 0;
  const papers = (j.resultList && j.resultList.result || []).map((p) => {
    const authors = (p.authorList && p.authorList.author) || [];
    const affs = [];
    for (const a of authors) for (const d of (a.authorAffiliationDetailsList && a.authorAffiliationDetailsList.authorAffiliation) || []) { const s = clean(d.affiliation).split(",").slice(-3).join(",").trim(); if (s && affs.indexOf(s) < 0) affs.push(s); }
    return {
      title: clean(p.title), year: p.pubYear ? Number(p.pubYear) : null, doi: p.doi || null, pmid: p.pmid || null, pmcid: p.pmcid || null,
      source: p.source || null, cited: p.citedByCount || 0, authors: clean(p.authorString).slice(0, 120), journal: clean(p.journalTitle || (p.journalInfo && p.journalInfo.journal && p.journalInfo.journal.title) || ""),
      affiliations: affs.slice(0, 3), preprint: p.source === "PPR"
    };
  });
  /* institutions: count affiliations across the top hits (a signal, not a census) */
  const inst = {};
  for (const p of papers) for (const a of p.affiliations) { const key = a.replace(/\b\d{4,}\b/g, "").replace(/\s+/g, " ").trim(); if (key) inst[key] = (inst[key] || 0) + 1; }
  const institutions = Object.entries(inst).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, n]) => ({ name, papers: n }));
  return { total, since: SINCE, papers, institutions };
}

async function ctgov(cond, term) {
  const params = new URLSearchParams({ pageSize: "8", countTotal: "true", "filter.overallStatus": "RECRUITING,ACTIVE_NOT_RECRUITING,NOT_YET_RECRUITING,ENROLLING_BY_INVITATION", sort: "LastUpdatePostDate:desc" });
  if (cond) params.set("query.cond", cond);
  if (term) params.set("query.term", term);
  if (!cond && !term) return { total: 0, trials: [] };
  const r = await fetch("https://clinicaltrials.gov/api/v2/studies?" + params.toString(), { headers: UA });
  if (!r.ok) throw new Error("ClinicalTrials.gov HTTP " + r.status);
  const j = await r.json();
  const trials = (j.studies || []).map((s) => {
    const P = s.protocolSection || {}, id = P.identificationModule || {}, st = P.statusModule || {}, sp = P.sponsorCollaboratorsModule || {}, d = P.designModule || {}, c = P.conditionsModule || {};
    return { nct: id.nctId, title: clean(id.briefTitle), status: st.overallStatus, phase: (d.phases || []).join("/") || null, sponsor: sp.leadSponsor && sp.leadSponsor.name || null, start: st.startDateStruct && st.startDateStruct.date || null, conditions: (c.conditions || []).slice(0, 3) };
  });
  return { total: j.totalCount || trials.length, trials };
}

const ids = Object.keys(queries).filter((k) => !k.startsWith("$") && (!only || k === only));
const out = { fetchedAt: new Date().toISOString(), since: SINCE, sources: { papers: "Europe PMC (MED + preprints), last two years, reviews excluded, relevance order", trials: "ClinicalTrials.gov v2, recruiting or active, sorted by last update" }, records: { ...(only ? prev.records : {}) } };
let ok = 0, failed = 0;
for (const id of ids) {
  const q = queries[id];
  const rec = { query: q };
  try { rec.papers = await europepmc(q.pmc); await sleep(250); } catch (e) { rec.papersError = String(e.message); }
  try { rec.trials = await ctgov(q.ct && q.ct.cond, q.ct && q.ct.term); await sleep(250); } catch (e) { rec.trialsError = String(e.message); }
  if (rec.papersError || rec.trialsError) failed++; else ok++;
  out.records[id] = rec;
  console.log(`${id}: ${rec.papers ? rec.papers.total + " papers" : "papers failed"}, ${rec.trials ? rec.trials.total + " trials" : "trials failed"}`);
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(`wrote ${OUT}: ${ok} ok, ${failed} with errors`);
if (failed && failed === ids.length) process.exit(1);

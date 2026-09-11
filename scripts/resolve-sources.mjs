/* Re-verify every source record against the registries it claims to come from.

   `resolved` on a source means: a machine found the record and its metadata
   matched. That is a claim about the world, so it decays — DOIs get corrected,
   titles change on version-of-record, PubMed ids appear. This script checks
   each source again and either confirms it or says exactly what no longer
   matches. It never touches humanOpened: only a named person may write that.

   node scripts/resolve-sources.mjs            report, write nothing
   node scripts/resolve-sources.mjs --write    update resolution blocks in place
   node scripts/resolve-sources.mjs --check    exit 1 if any DOI/NCT source fails
                                                (for CI; URL-only sources are reported, never fatal) */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "records", "graph", "sources");
const WRITE = process.argv.includes("--write");
const CHECK = process.argv.includes("--check");
const TODAY = new Date().toISOString().slice(0, 10);
const UA = { "User-Agent": "human-repair-map/0.3 (https://humanrepairmap.com; mailto:hello@ava.kim)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => String(s || "").toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, " ").trim();

async function crossref(doi) {
  const r = await fetch("https://api.crossref.org/works/" + encodeURIComponent(doi), { headers: UA });
  if (r.status === 404) return { missing: true };
  if (!r.ok) throw new Error(`Crossref HTTP ${r.status}`);
  const m = (await r.json()).message;
  return { title: (m.title || [])[0] || "", year: m.issued && m.issued["date-parts"] && m.issued["date-parts"][0] && m.issued["date-parts"][0][0], venue: (m["container-title"] || [])[0] || "" };
}
async function pubmedByDoi(doi) {
  const r = await fetch("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&term=" + encodeURIComponent(doi + "[AID]"));
  if (!r.ok) return null;
  const j = await r.json();
  return (j.esearchresult && j.esearchresult.idlist && j.esearchresult.idlist[0]) || null;
}
async function ctgov(nct) {
  const r = await fetch("https://clinicaltrials.gov/api/v2/studies/" + nct + "?fields=protocolSection.identificationModule", { headers: UA });
  if (r.status === 404) return { missing: true };
  if (!r.ok) throw new Error(`ClinicalTrials.gov HTTP ${r.status}`);
  const j = await r.json();
  return { title: (((j.protocolSection || {}).identificationModule || {}).briefTitle) || "" };
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
let failures = 0, changed = 0;
for (const f of files) {
  const p = path.join(dir, f);
  const s = JSON.parse(fs.readFileSync(p, "utf8"));
  const problems = [];
  const res = { ...(s.resolution || {}), checkedOn: TODAY };
  try {
    if (s.doi) {
      const c = await crossref(s.doi);
      if (c.missing) problems.push(`DOI ${s.doi} not found in Crossref`);
      else {
        const titleOk = norm(c.title) === norm(s.title) || norm(c.title).includes(norm(s.title).slice(0, 40)) || norm(s.title).includes(norm(c.title).slice(0, 40));
        if (!titleOk) problems.push(`title differs: record "${s.title}" vs Crossref "${c.title}"`);
        if (c.year && s.year && c.year !== s.year) problems.push(`year differs: record ${s.year} vs Crossref ${c.year}`);
        res.via = "crossref"; res.resolvedTitle = c.title.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        if (!s.pmid) { const pmid = await pubmedByDoi(s.doi); if (pmid) { s.pmid = pmid; res.note = `PubMed id ${pmid} located by DOI on ${TODAY}.`; } }
      }
      await sleep(300);
    } else if (s.nct && !s.url) {
      const c = await ctgov(s.nct);
      if (c.missing) problems.push(`${s.nct} not found on ClinicalTrials.gov`);
      else { res.via = "clinicaltrials"; res.resolvedTitle = c.title; }
    } else if (s.url) {
      // URL-only sources are loaded by a person; report the last manual check and move on.
      console.log(`  · ${f}: URL-only (${s.resolution && s.resolution.via || "unchecked"}, last ${s.resolution && s.resolution.checkedOn || "never"}) — manual`);
      continue;
    } else problems.push("no DOI, NCT or URL — cannot be resolved by anyone");
  } catch (e) {
    console.log(`  ! ${f}: ${e.message} (network) — left unchanged`);
    continue;
  }
  res.resolved = problems.length === 0;
  res.metadataMatches = problems.length === 0;
  if (problems.length) { failures++; res.note = problems.join("; "); console.log(`  ✕ ${f}: ${problems.join("; ")}`); }
  else console.log(`  ✓ ${f}${s.pmid ? " · PMID " + s.pmid : ""}`);
  if (WRITE) {
    const before = JSON.stringify(s.resolution) + (s.pmid || "");
    s.resolution = res;
    if (JSON.stringify(s.resolution) + (s.pmid || "") !== before) { fs.writeFileSync(p, JSON.stringify(s, null, 2) + "\n"); changed++; }
  }
}
console.log(`\n${files.length} sources · ${failures} failing${WRITE ? ` · ${changed} updated` : ""}`);
if (CHECK && failures) process.exit(1);

/* Shared helpers for seed scripts (scripts/seed/*.mjs). A seed is provenance, not a build
 * step: it shows exactly how a batch of records was produced. Source records are built from
 * live Crossref and PubMed responses, never typed by hand; everything else is authored by
 * the session named in ACTOR and enters the map as `ai-proposed`. write() refuses to
 * overwrite an existing record unless --force, so re-running can never undo a human edit. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const force = process.argv.includes("--force");
const UA = { "User-Agent": "human-repair-map/0.3 (https://humanrepairmap.com; mailto:hello@ava.kim)" };
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export const ids = {
  S: (slug) => "hrm:source/" + slug,
  G: (slug) => "hrm:goal/" + slug,
  C: (slug) => "hrm:capability/" + slug,
  Q: (slug) => "hrm:question/" + slug,
  CL: (slug) => "hrm:claim/" + slug,
  E: (slug) => "hrm:experiment/" + slug,
  CELL: (slug) => "hrm:cell/" + slug
};

export function makeSeed({ date, actor, authored, script }) {
  const REVIEW = { state: "ai-proposed", date };
  const prov = (method, evidenceAccessed) => ({ proposedBy: actor, method, date, ...(evidenceAccessed ? { evidenceAccessed } : {}) });
  const counts = { written: 0, skipped: 0 };

  function write(kind, rec) {
    const dir = path.join(root, "records", "graph", kind);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, rec.id.split("/")[1] + ".json");
    if (fs.existsSync(file) && !force) { counts.skipped++; return false; }
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + "\n");
    counts.written++; return true;
  }

  async function crossref(doi) {
    const r = await fetch("https://api.crossref.org/works/" + encodeURIComponent(doi), { headers: UA });
    if (!r.ok) throw new Error(`Crossref ${r.status} for ${doi}`);
    return (await r.json()).message;
  }
  async function pubmedIdFor(doi) {
    try {
      const r = await fetch("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&term=" + encodeURIComponent(doi + "[AID]"));
      if (!r.ok) return null;
      const j = await r.json();
      return (j.esearchresult && j.esearchresult.idlist && j.esearchresult.idlist[0]) || null;
    } catch { return null; }
  }

  /* Build source records. DOI sources come from Crossref (+ PubMed id); non-DOI sources carry
   * a `manual` note saying when and how the page was read. Returns the slugs that failed. */
  async function buildSources(SOURCES) {
    const failed = [];
    for (const s of SOURCES) {
      const id = ids.S(s.slug);
      if (fs.existsSync(path.join(root, "records", "graph", "sources", s.slug + ".json")) && !force) { counts.skipped++; continue; }
      if (s.doi) {
        let m;
        try { m = await crossref(s.doi); } catch (e) { console.error("  SOURCE FAILED", s.slug, e.message); failed.push(s.slug); continue; }
        const year = m.issued && m.issued["date-parts"] && m.issued["date-parts"][0] && m.issued["date-parts"][0][0];
        const authors = (m.author || []).map((a) => [a.family, a.given].filter(Boolean).join(" ")).join("; ");
        const first = (m.author && m.author[0] && m.author[0].family) || "Anon";
        const venue = (m["container-title"] || [])[0] || "";
        const title = strip((m.title || [])[0]);
        const pmid = await pubmedIdFor(s.doi);
        await sleep(350);
        const rec = {
          id, type: "source",
          citation: `${first} et al., ${venue}, ${year}`,
          title, authors, venue, year,
          kind: s.kind || "article",
          doi: m.DOI,
          ...(pmid ? { pmid } : {}),
          url: "https://doi.org/" + m.DOI,
          ...(m.license && m.license[0] ? { license: m.license[0].URL } : {}),
          resolution: { resolved: true, checkedOn: date, via: "crossref", metadataMatches: true, resolvedTitle: title, note: pmid ? `Crossref record found; PubMed id ${pmid} located by DOI.` : "Crossref record found; no PubMed id located by DOI." },
          ...(s.note ? { note: s.note } : {}),
          provenance: prov(`source record generated from the live Crossref work record and a PubMed id lookup by DOI (${script})`)
        };
        write("sources", rec);
        console.log("  source", s.slug, "←", year, first, "|", title.slice(0, 70));
      } else {
        const rec = {
          id, type: "source",
          citation: s.citation, title: s.title, venue: s.venue, year: s.year, kind: s.kind,
          url: s.url, ...(s.nct ? { nct: s.nct } : {}), ...(s.license ? { license: s.license } : {}),
          resolution: { resolved: true, checkedOn: date, via: "manual", metadataMatches: true, note: s.manual },
          provenance: prov(`URL loaded and read by the session on ${date}; metadata transcribed from the page`)
        };
        write("sources", rec);
        console.log("  source", s.slug, "← manual");
      }
    }
    return failed;
  }

  const goal = (o) => ({ type: "goal", ...o, provenance: prov(authored), review: REVIEW });
  const cap = (o) => { const { evidenceAccessed, ...rest } = o; return { type: "capability", ...rest, provenance: prov(authored, evidenceAccessed), review: REVIEW }; };
  const q = (o) => ({ type: "question", state: "open", ...o, provenance: prov(authored), review: REVIEW });
  const ex = (o) => ({ type: "experiment", ...o, provenance: prov(authored), review: REVIEW });
  const cl = (o) => ({ type: "claim", grounding: "G1", ...o, provenance: prov(authored, o.evidence.map((e) => e.source)), review: REVIEW });
  const ev = (source, design, extra) => ({ source, design, locator: "abstract", ...(extra || {}) });

  async function run({ SOURCES = [], GOALS = [], CAPABILITIES = [], QUESTIONS = [], CLAIMS = [], EXPERIMENTS = [] }) {
    console.log(`seeding records/graph from ${script} …`);
    const failed = await buildSources(SOURCES);
    if (failed.length) { console.error(`\n${failed.length} source(s) did not resolve: ${failed.join(", ")}\nFix or remove them before writing records that cite them.`); process.exit(2); }
    GOALS.forEach((x) => write("goals", x));
    CAPABILITIES.forEach((x) => write("capabilities", x));
    QUESTIONS.forEach((x) => write("questions", x));
    CLAIMS.forEach((x) => write("claims", x));
    EXPERIMENTS.forEach((x) => write("experiments", x));
    console.log(`  written ${counts.written}, skipped (already present) ${counts.skipped}`);
    console.log("now run: node scripts/build.mjs");
  }

  return { REVIEW, prov, write, buildSources, goal, cap, q, ex, cl, ev, run, counts };
}

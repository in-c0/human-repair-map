/* Seed: the v0.3 proving-ground graph — scarless functional repair of adult skin —
   plus the rejuvenation projection's first nodes.

   This script is kept in the repo as PROVENANCE, not as a build step. It shows
   exactly how the first graph records were produced: source records are built
   from live Crossref + PubMed responses (never typed by hand); everything else
   was authored by an AI session from the cited abstracts and enters the map as
   `ai-proposed`. It refuses to overwrite an existing record unless --force, so
   re-running it can never silently undo a human edit.

   Run:  node scripts/seed/2026-09-11-scarless-skin.mjs [--force]
   Then: node scripts/build.mjs */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const force = process.argv.includes("--force");
const DATE = "2026-09-11";
const UA = { "User-Agent": "human-repair-map/0.3 (https://humanrepairmap.com; mailto:hello@ava.kim)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ACTOR = {
  type: "ai",
  name: "Claude Code session e7dc5601 (Anthropic)",
  model: "claude-opus-5",
  session: "e7dc5601-1690-47c6-bf13-9ca150d31960"
};
const prov = (method, evidenceAccessed) => ({
  proposedBy: ACTOR,
  method,
  date: DATE,
  ...(evidenceAccessed ? { evidenceAccessed } : {})
});
const AUTHORED = "manual reasoning from the cited sources' abstracts (PubMed) and Crossref metadata, checked 2026-09-11; no source opened at figure level";
const REVIEW = { state: "ai-proposed", date: DATE };

let written = 0, skipped = 0;
function write(kind, rec) {
  const dir = path.join(root, "records", "graph", kind);
  fs.mkdirSync(dir, { recursive: true });
  const slug = rec.id.split("/")[1];
  const file = path.join(dir, slug + ".json");
  if (fs.existsSync(file) && !force) { skipped++; return; }
  fs.writeFileSync(file, JSON.stringify(rec, null, 2) + "\n");
  written++;
}

/* ------------------------------------------------------------------ sources */

const S = (slug) => "hrm:source/" + slug;

const SOURCES = [
  // scarless skin repair
  { slug: "seifert-2012-nature", doi: "10.1038/nature11499", kind: "article" },
  { slug: "brant-2016-wrr", doi: "10.1111/wrr.12385", kind: "article" },
  { slug: "maden-2018-burns", doi: "10.1016/j.burns.2018.05.018", kind: "article" },
  { slug: "gawriluk-2016-natcommun", doi: "10.1038/ncomms11164", kind: "article" },
  { slug: "matias-santos-2016-regeneration", doi: "10.1002/reg2.50", kind: "article" },
  { slug: "rinkevich-2015-science", doi: "10.1126/science.aaa2151", kind: "article" },
  { slug: "driskell-2013-nature", doi: "10.1038/nature12783", kind: "article" },
  { slug: "mascharak-2021-science", doi: "10.1126/science.aba2374", kind: "article" },
  { slug: "ito-2007-nature", doi: "10.1038/nature05766", kind: "article" },
  { slug: "plikus-2017-science", doi: "10.1126/science.aai8792", kind: "article" },
  { slug: "lee-2020-nature", doi: "10.1038/s41586-020-2352-3", kind: "article" },
  { slug: "gallico-1984-nejm", doi: "10.1056/nejm198408163110706", kind: "article" },
  { slug: "sood-2000-jbcr", doi: "10.1097/00004630-200001001-00061", kind: "article" },
  { slug: "sun-2014-science", doi: "10.1126/science.1253836", kind: "article", note: "Review." },
  { slug: "mavilio-2006-natmed", doi: "10.1038/nm1504", kind: "article" },
  { slug: "hirsch-2017-nature", doi: "10.1038/nature24487", kind: "article" },
  { slug: "guide-2022-nejm", doi: "10.1056/NEJMoa2206663", kind: "article" },
  { slug: "veves-2001-diabetescare", doi: "10.2337/diacare.24.2.290", kind: "article" },
  { slug: "marston-2003-diabetescare", doi: "10.2337/diacare.26.6.1701", kind: "article" },
  { slug: "ferguson-2009-lancet", doi: "10.1016/S0140-6736(09)60322-6", kind: "article" },
  { slug: "mccollum-2011-bjs", doi: "10.1002/bjs.7438", kind: "article" },
  { slug: "larson-2010-prs", doi: "10.1097/PRS.0b013e3181eae781", kind: "article", note: "Review." },
  { slug: "rouwkema-2016-trendsbiotech", doi: "10.1016/j.tibtech.2016.03.002", kind: "article", note: "Review." },
  { slug: "laschke-2016-biotechadv", doi: "10.1016/j.biotechadv.2015.12.004", kind: "article", note: "Review." },
  { slug: "henderson-2020-nature", doi: "10.1038/s41586-020-2938-9", kind: "article", note: "Review." },
  { slug: "blais-2013-tissueeng", doi: "10.1089/ten.tea.2012.0745", kind: "article" },
  { slug: "chan-2015-scitranslmed", doi: "10.1126/scitranslmed.3010383", kind: "article" },
  { slug: "gurtner-2008-nature", doi: "10.1038/nature07039", kind: "article", note: "Review." },
  { slug: "eming-2014-scitranslmed", doi: "10.1126/scitranslmed.3009337", kind: "article", note: "Review." },
  // rejuvenation + delivery
  { slug: "lu-2020-nature", doi: "10.1038/s41586-020-2975-4", kind: "article" },
  { slug: "ocampo-2016-cell", doi: "10.1016/j.cell.2016.11.052", kind: "article" },
  { slug: "thomsen-2021-natmed", doi: "10.1038/s41591-021-01483-7", kind: "article" },
  // non-DOI sources, loaded by hand on 2026-09-11
  {
    slug: "fda-2023-vyjuvek", kind: "regulatory", year: 2023,
    citation: "U.S. FDA press announcement, 19 May 2023 — FDA approves first topical gene therapy for treatment of wounds in patients with dystrophic epidermolysis bullosa",
    title: "FDA Approves First Topical Gene Therapy for Treatment of Wounds in Patients with Dystrophic Epidermolysis Bullosa",
    venue: "U.S. Food and Drug Administration",
    url: "https://www.fda.gov/news-events/press-announcements/fda-approves-first-topical-gene-therapy-treatment-wounds-patients-dystrophic-epidermolysis-bullosa",
    license: "US government work (public domain)",
    manual: "Page loaded and read on 2026-09-11 (fda.gov blocks plain automated fetch; loaded through a browser-class fetcher). Approval date, product, indication and the 65% vs 26% closure figures confirmed on the page."
  },
  {
    slug: "life-biosciences-2026-er100-first-dosed", kind: "web", year: 2026,
    citation: "Life Biosciences press release, 9 June 2026 — first patient dosed in Phase 1 trial of ER-100 for optic neuropathies (NCT07290244)",
    title: "Life Biosciences Announces First Patient Dosed in Phase 1 Trial of ER-100 for Optic Neuropathies",
    venue: "Life Biosciences, Inc. (sponsor press release)",
    url: "https://www.lifebiosciences.com/life-biosciences-announces-first-patient-dosed-in-phase-1-trial-of-er-100-for-optic-neuropathies/",
    nct: "NCT07290244",
    manual: "Sponsor communication, not peer-reviewed. Page loaded and read on 2026-09-11: Phase 1, open-angle glaucoma and NAION, OCT4/SOX2/KLF4 (OSK), safety and tolerability primary, visual-function endpoints secondary, NCT07290244. The page does not itself claim to be the first partial reprogramming therapy dosed in a human; that framing is from secondary press coverage."
  }
];

async function crossref(doi) {
  const r = await fetch("https://api.crossref.org/works/" + encodeURIComponent(doi), { headers: UA });
  if (!r.ok) throw new Error(`Crossref ${r.status} for ${doi}`);
  return (await r.json()).message;
}
async function pubmedIdFor(doi) {
  const r = await fetch("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&term=" + encodeURIComponent(doi + "[AID]"));
  if (!r.ok) return null;
  const j = await r.json();
  return (j.esearchresult && j.esearchresult.idlist && j.esearchresult.idlist[0]) || null;
}
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function buildSources() {
  for (const s of SOURCES) {
    const id = S(s.slug);
    if (fs.existsSync(path.join(root, "records", "graph", "sources", s.slug + ".json")) && !force) { skipped++; continue; }
    if (s.doi) {
      const m = await crossref(s.doi);
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
        kind: s.kind,
        doi: m.DOI,
        ...(pmid ? { pmid } : {}),
        url: "https://doi.org/" + m.DOI,
        ...(m.license && m.license[0] ? { license: m.license[0].URL } : {}),
        resolution: {
          resolved: true, checkedOn: DATE, via: "crossref", metadataMatches: true,
          resolvedTitle: title,
          note: pmid ? `Crossref record found; PubMed id ${pmid} located by DOI.` : "Crossref record found; no PubMed id located by DOI."
        },
        ...(s.note ? { note: s.note } : {}),
        provenance: prov("source record generated from the live Crossref work record and a PubMed id lookup by DOI (scripts/seed/2026-09-11-scarless-skin.mjs)")
      };
      write("sources", rec);
      console.log("  source", s.slug, "←", year, first, "|", title.slice(0, 70));
    } else {
      const rec = {
        id, type: "source",
        citation: s.citation, title: s.title, venue: s.venue, year: s.year, kind: s.kind,
        url: s.url, ...(s.nct ? { nct: s.nct } : {}), ...(s.license ? { license: s.license } : {}),
        resolution: { resolved: true, checkedOn: DATE, via: "manual", metadataMatches: true, note: s.manual },
        provenance: prov("URL loaded and read by the session on 2026-09-11; metadata transcribed from the page")
      };
      write("sources", rec);
      console.log("  source", s.slug, "← manual");
    }
  }
}

/* -------------------------------------------------------------------- goals */

const G = (slug) => "hrm:goal/" + slug;
const C = (slug) => "hrm:capability/" + slug;
const Q = (slug) => "hrm:question/" + slug;
const CL = (slug) => "hrm:claim/" + slug;
const E = (slug) => "hrm:experiment/" + slug;
const CELL = (slug) => "hrm:cell/" + slug;

const GOALS = [
  {
    id: G("universal-repair"), name: "Universal repair",
    description: "Restore a person from arbitrary biological damage — trauma, infection, cancer, genetic disease, autoimmunity, organ failure, neurological injury — to their healthy functional state, preserving who they are. The root of the Universal Repair projection. Rejuvenation is a specialised branch of it, not a separate universe.",
    projections: ["universal-repair"],
    requires: [{ all: [G("scarless-skin-repair"), G("established-scar-repair")], note: "First proving ground only. Peripheral nerve, fracture, myocardium, sepsis, cancer and systemic rejuvenation are the planned expansions and are not yet nodes." }],
    testSuite: [
      { scenario: "small skin wound", state: "routine" },
      { scenario: "superficial infection", state: "routine" },
      { scenario: "severe laceration with full function restored", state: "partial" },
      { scenario: "compound fracture", state: "partial" },
      { scenario: "internal haemorrhage", state: "partial" },
      { scenario: "myocardial infarction with muscle restored", state: "unsolved" },
      { scenario: "sepsis", state: "partial" },
      { scenario: "spinal cord transection", state: "unsolved" },
      { scenario: "metastatic cancer", state: "unsolved" },
      { scenario: "systemic aging", state: "unsolved" }
    ],
    informationLimited: false
  },
  {
    id: G("rejuvenation"), name: "Rejuvenation",
    description: "Return an aged person toward their healthiest attainable youthful physiology — function, resilience and regenerative capacity — while preserving identity, memory, learned ability and agency. Not 'the youngest possible state': a constrained optimisation whose target is a body that has never existed before (young molecular state, your memories).",
    projections: ["rejuvenation"],
    requires: [{ all: [G("systemic-rejuvenation")] }],
    informationLimited: false
  },
  {
    id: G("systemic-rejuvenation"), name: "Systemic rejuvenation",
    parent: G("rejuvenation"),
    description: "Rejuvenate many tissues of one person at once, safely and durably. Decomposes, per the owner's brief, into a safe rejuvenation mechanism AND multi-tissue delivery AND cancer control — with the delivery leg satisfiable by more than one route.",
    projections: ["rejuvenation"],
    requires: [
      { all: [C("safe-partial-epigenetic-reprogramming-in-vivo"), C("cell-identity-retention-under-partial-reprogramming"), C("cancer-risk-control-under-rejuvenation"), C("rejuvenated-state-persistence")] },
      { any: [C("systemic-cell-type-specific-delivery"), C("cns-neuron--reach")], note: "OR-group: one delivery route sufficing for the tissue in question; nobody knows which will succeed. cns-neuron--reach is the v0.2 grid cell backed by the 16 CNS routes." }
    ],
    blockedBy: [Q("partial-reprogramming-human-safety"), Q("rejuvenation-reach-beyond-eye-and-liver"), Q("rejuvenated-state-persistence-and-redosing"), Q("cancer-risk-of-repeated-partial-reprogramming"), Q("healthy-target-state-for-aged-tissue")]
  },
  {
    id: G("scarless-skin-repair"), name: "Scarless functional repair of adult human skin",
    parent: G("universal-repair"),
    description: "After a full-thickness skin injury in an adult human, restore the skin to its uninjured architecture and function: epidermis, dermis with native extracellular-matrix organisation, microvasculature, sensory innervation, hair follicles and glands, pigmentation, elasticity and barrier — without a persistent fibrotic scar. The first proving ground: it sits across both maps (wounds, burns and surgery above; fibrosis, matrix aging and immune aging below).",
    projections: ["universal-repair", "rejuvenation"],
    existenceProof: "Early-gestation fetal skin heals without scar (Larson 2010); adult spiny mice (Acomys) regenerate full-thickness skin with follicles and no scar (Seifert 2012; Matias Santos 2016, independent group); adult laboratory mice regenerate follicles in large wounds (Ito 2007) and, with mechanotransduction blocked, regenerate dermis with appendages and native ultrastructure (Mascharak 2021).",
    requires: [{ all: [G("skin-immediate-stabilisation"), G("skin-contamination-control"), G("skin-structural-reconstruction"), G("skin-biological-control"), G("skin-functional-restoration")] }],
    testSuite: [
      { scenario: "small acute wound closes", state: "routine" },
      { scenario: "chronic ulcer closes", state: "partial", note: "bioengineered skin substitutes raise closure rates (Veves 2001; Marston 2003) but do not regenerate appendages" },
      { scenario: "large burn covered permanently", state: "partial", note: "cultured epithelial autografts since 1984; dermis, appendages and sensation not restored" },
      { scenario: "inherited skin disease corrected in situ", state: "partial", note: "one approved topical gene therapy (B-VEC, 2023); one group's transgenic stem-cell grafts (n=2)" },
      { scenario: "full-thickness wound regenerates with follicles, glands, nerves and native matrix, no scar", state: "unsolved", note: "shown in mouse (Mascharak 2021) and spiny mouse; no human or large-animal evidence located" }
    ],
    blockedBy: [Q("en1-inhibition-translates-to-human-skin"), Q("what-limits-regeneration-in-mus-and-human")],
    informationLimited: false
  },
  {
    id: G("skin-immediate-stabilisation"), name: "Immediate stabilisation of a skin injury",
    parent: G("scarless-skin-repair"),
    description: "In the first minutes: stop bleeding and restore a barrier so that nothing irrecoverable is lost while repair is organised.",
    projections: ["universal-repair"],
    requires: [{ all: [C("skin-haemostasis"), C("temporary-barrier-restoration")] }]
  },
  {
    id: G("skin-contamination-control"), name: "Contamination control",
    parent: G("scarless-skin-repair"),
    description: "Remove foreign material and eliminate pathogens, including established biofilm, without damaging the tissue that must regenerate.",
    projections: ["universal-repair"],
    requires: [{ all: [C("acute-wound-infection-control"), C("chronic-wound-biofilm-eradication")] }],
    blockedBy: [Q("reliable-biofilm-eradication-in-chronic-wounds")]
  },
  {
    id: G("skin-structural-reconstruction"), name: "Structural reconstruction of skin",
    parent: G("scarless-skin-repair"),
    description: "Rebuild every layer and structure: epidermis, dermis, organised microvasculature, appendages (follicles, glands), innervation, pigmentation. Each is a capability that can fail independently.",
    projections: ["universal-repair", "rejuvenation"],
    requires: [
      { any: [C("epidermis-replacement-cultured-autograft"), C("epidermis-gene-corrected-stem-cell-replacement"), C("keratinocyte-in-vivo-topical-gene-delivery")], note: "Epidermal restoration: any of three demonstrated routes, chosen by cause." },
      { all: [C("dermal-architecture-regeneration-without-scar"), C("native-ecm-organisation-reconstruction"), C("organised-microvascular-network-in-regenerated-dermis"), C("cutaneous-sensory-reinnervation"), C("hair-follicle-neogenesis-after-wounding"), C("dermal-adipocyte-regeneration"), C("melanocyte--edit")] },
      { any: [C("appendage-bearing-skin-from-pluripotent-cells"), C("hair-follicle-neogenesis-after-wounding")], note: "Appendages: regenerate in place OR graft an appendage-bearing construct." }
    ]
  },
  {
    id: G("skin-biological-control"), name: "Biological control of the repair programme",
    parent: G("scarless-skin-repair"),
    description: "Steer inflammation, fibroblast fate, proliferation, matrix deposition and morphogenesis toward regeneration rather than fibrosis.",
    projections: ["universal-repair", "rejuvenation"],
    requires: [{ all: [C("fibrogenic-fibroblast-lineage-control"), C("inflammation-phase-control-for-regeneration"), C("pharmacological-scar-reduction-in-humans"), C("mammalian-scar-free-regeneration-target-state"), C("fetal-scarless-healing-target-state")] }],
    blockedBy: [Q("why-avotermin-phase-3-failed"), Q("what-limits-regeneration-in-mus-and-human")]
  },
  {
    id: G("skin-functional-restoration"), name: "Functional restoration and verification",
    parent: G("scarless-skin-repair"),
    description: "Confirm that regenerated skin has sensation, elasticity, pigmentation and barrier function, and that no fibrotic scar persists. (Remodelling a scar that already exists is a separate goal: established-scar-repair.)",
    projections: ["universal-repair", "rejuvenation"],
    requires: [{ all: [C("wound-bed-assessment-in-vivo"), C("fibroblast-state-sensing-in-living-wound"), C("regeneration-verification-histology-and-scar-scales")] }]
  },
  {
    id: G("established-scar-repair"), name: "Repair of an established scar",
    parent: G("universal-repair"),
    description: "Convert a mature fibrotic dermal scar — one that already exists — back into dermis with native matrix organisation, appendages and function. Distinct from preventing scar in a fresh injury: prevention helps the next wound, reversal helps everyone already scarred, and every fibrotic organ shares the problem.",
    projections: both,
    existenceProof: "None located for dermis. Spiny mice regenerate rather than scar, but no reversal of an already-formed mammalian scar is cited on this map.",
    requires: [{ all: [C("established-dermal-scar-reversal"), C("native-ecm-organisation-reconstruction"), C("organised-microvascular-network-in-regenerated-dermis"), C("cutaneous-sensory-reinnervation")] }, { any: [C("hair-follicle-neogenesis-after-wounding"), C("appendage-bearing-skin-from-pluripotent-cells")], note: "Appendages must come from somewhere: neogenesis in the remodelled tissue or a graft." }],
    blockedBy: [Q("established-scar-remodelling-to-native-architecture")],
    informationLimited: false
  }
];

/* ------------------------------------------------------------- capabilities */

const cap = (o) => ({
  type: "capability",
  ...o,
  provenance: prov(AUTHORED, o.evidenceAccessed),
  review: REVIEW
});
const both = ["universal-repair", "rejuvenation"];
const UR = ["universal-repair"];
const RJ = ["rejuvenation"];

const CAPABILITIES = [
  // --- immediate stabilisation
  cap({
    id: C("skin-haemostasis"), name: "Stop bleeding from a skin injury", class: "control", primitive: "stop", projections: UR,
    description: "Arrest haemorrhage from a cutaneous or subcutaneous wound within minutes so that perfusion and tissue are not lost before repair begins.",
    target: { node: CELL("endothelium") },
    grade: { basis: "standard-of-care", rung: "L5", measured: "function", blocked: "none", note: "Pressure, ligation, suture, electrocautery and topical haemostatic dressings are routine surgical practice worldwide; the demonstration predates the literature this map cites. Non-compressible internal haemorrhage is a different, unsolved capability and is not graded here." }
  }),
  cap({
    id: C("synthetic-haemostat-for-noncompressible-haemorrhage"), name: "Induce haemostasis with a synthetic injectable agent", class: "control", primitive: "stop", projections: UR,
    description: "Stop bleeding that cannot be compressed (internal, solid-organ) with an injectable synthetic agent rather than surgery or donor blood products.",
    grade: { basis: "claims", rung: "L2", measured: "function", blocked: "science", note: "A synthetic fibrin-cross-linking polymer improved haemostasis in rodent trauma models (Chan 2015). No human data cited here; large-animal translation and immunogenicity unknown.", drift: "Often described as 'a synthetic blood-clotting drug'; the evidence is rodent survival and blood-loss endpoints." },
    wouldMove: "A large-animal (porcine) non-compressible haemorrhage study by an independent group, then a first-in-human safety study.",
    evidenceAccessed: [S("chan-2015-scitranslmed")]
  }),
  cap({
    id: C("temporary-barrier-restoration"), name: "Restore a temporary barrier over a wound", class: "control", primitive: "replace", projections: UR,
    description: "Cover an open wound with a dressing, allograft or temporary substitute that limits fluid loss and contamination until definitive repair.",
    target: { node: CELL("keratinocyte") },
    grade: { basis: "standard-of-care", rung: "L5", measured: "function", blocked: "none", note: "Occlusive dressings, cadaveric allograft and synthetic temporary substitutes are routine burn and wound care. Temporary is the operative word: none of these regenerates the skin beneath them." }
  }),
  // --- contamination control
  cap({
    id: C("acute-wound-infection-control"), name: "Prevent and treat acute wound infection", class: "control", primitive: "remove", projections: UR,
    description: "Debride contaminated tissue and eliminate planktonic pathogens from an acute wound so healing can proceed.",
    target: { node: CELL("microbiome") },
    grade: { basis: "standard-of-care", rung: "L5", measured: "function", blocked: "none", note: "Surgical debridement, irrigation and systemic or topical antimicrobials are routine and effective for acute wounds. Antimicrobial resistance erodes this capability over time and is not graded here." }
  }),
  cap({
    id: C("chronic-wound-biofilm-eradication"), name: "Eradicate established biofilm in a chronic wound", class: "control", primitive: "remove", projections: UR,
    description: "Reliably clear a mature polymicrobial biofilm from a chronic wound bed so that a stalled wound can progress to closure.",
    target: { node: CELL("microbiome") },
    grade: { basis: "ungraded", note: "Placed so the gap is visible. The literature on biofilm-directed therapy in chronic wounds was not searched in this seed; grading it is the first open task on this node." },
    blockedBy: [Q("reliable-biofilm-eradication-in-chronic-wounds")]
  }),
  // --- structural reconstruction: epidermis
  cap({
    id: C("epidermis-replacement-cultured-autograft"), name: "Replace lost epidermis with cultured autologous keratinocytes", class: "edit", primitive: "replace", projections: UR,
    description: "Grow a patient's own keratinocytes into sheets and use them to permanently cover a large full-thickness skin loss.",
    target: { node: CELL("keratinocyte") },
    grade: { basis: "claims", rung: "L5", measured: "function", blocked: "none", note: "Permanent coverage of large burns with cultured epithelial autografts was reported in 1984 (Gallico) and has since been used and followed long-term at unaffiliated centres (Sood 2000; reviewed in Sun 2014). The graft is epidermis only: no dermis, appendages or normal sensation, and the result is fragile skin.", drift: "'Lab-grown skin' in headlines; what is grown is a thin epidermal sheet." },
    wouldMove: "This capability is at the top rung for what it does; the missing capabilities are the dermal ones below it.",
    evidenceAccessed: [S("gallico-1984-nejm"), S("sood-2000-jbcr"), S("sun-2014-science")]
  }),
  cap({
    id: C("epidermis-gene-corrected-stem-cell-replacement"), name: "Regenerate an entire epidermis from gene-corrected autologous stem cells", class: "edit", primitive: "repair", projections: UR,
    description: "Correct a causal mutation in a patient's epidermal stem cells ex vivo and regenerate a durable, self-renewing, functional epidermis from them.",
    target: { node: CELL("keratinocyte") },
    grade: { basis: "claims", rung: "L4", measured: "function", blocked: "framework", note: "Two patients with junctional epidermolysis bullosa (an adult, Mavilio 2006; a child with ~80% body surface regenerated, Hirsch 2017), both treated by the same group (De Luca, Modena). The biology has worked twice in one group; the rung stays L4 because no unaffiliated group has reproduced it. What stands between it and patients is manufacturing, regulatory path and disease rarity, with long-term integration-site safety an open scientific question.", drift: "Reported as 'entire skin regenerated'; the regenerated organ is the epidermis, on a patient whose dermis was intact." },
    blockedBy: [Q("gene-corrected-epidermal-graft-long-term-safety")],
    wouldMove: "An independent centre reproducing durable engraftment in a second inherited skin disease, with integration-site surveillance beyond five years.",
    evidenceAccessed: [S("mavilio-2006-natmed"), S("hirsch-2017-nature")]
  }),
  cap({
    id: C("keratinocyte-in-vivo-topical-gene-delivery"), name: "Deliver a therapeutic gene to keratinocytes in situ by topical application", class: "reach", primitive: "repair", projections: UR,
    description: "Get a functional gene into the keratinocytes of a living wound by applying a vector to the skin surface, repeatedly, without surgery or cell culture.",
    target: { node: CELL("keratinocyte") },
    grade: { basis: "claims", rung: "L4", measured: "function", blocked: "none", note: "Beremagene geperpavec (HSV-1 vector carrying COL7A1) closed 67% of treated versus 22% of placebo wounds at six months in a 31-patient intrapatient-randomised phase 3 (Guide 2022) and was approved by the FDA in May 2023. Single sponsor, one disease, one gene. Not blocked: the next rung is an independent trial, which nothing prevents.", drift: "'Topical gene therapy' reads as general; it is one gene in one rare disease, and the vector does not persist, so dosing is weekly for life." },
    blockedBy: [Q("topical-gene-delivery-generalises-beyond-eb")],
    wouldMove: "An unaffiliated group achieving durable expression with the same platform in a second indication or a second gene.",
    evidenceAccessed: [S("guide-2022-nejm"), S("fda-2023-vyjuvek")]
  }),
  // --- structural reconstruction: dermis and beyond
  cap({
    id: C("dermal-substitute-for-chronic-wound-closure"), name: "Close a chronic wound with a bioengineered skin substitute", class: "edit", primitive: "replace", projections: UR,
    description: "Apply a living, cell-containing bioengineered construct to a chronic ulcer and raise the rate of complete closure over standard care.",
    target: { node: CELL("fibroblast") },
    grade: { basis: "claims", rung: "L5", measured: "function", blocked: "none", note: "Two different living constructs from two unaffiliated sponsors each raised complete closure of diabetic foot ulcers at 12 weeks in randomised multicentre trials: Graftskin 56% vs 38% (n=208, Veves 2001) and Dermagraft 30% vs 18% (n=314, Marston 2003). The constructs act as temporary biologic dressings that stimulate closure; they do not persist as the patient's dermis and regenerate no appendages.", drift: "Marketed as 'skin equivalents'; what is proven is faster closure of ulcers, not equivalent skin." },
    blockedBy: [Q("skin-substitutes-improve-scar-quality-not-just-closure")],
    evidenceAccessed: [S("veves-2001-diabetescare"), S("marston-2003-diabetescare")]
  }),
  cap({
    id: C("dermal-architecture-regeneration-without-scar"), name: "Regenerate dermis with appendages and no scar after full-thickness injury", class: "edit", primitive: "regenerate", projections: both,
    description: "After a full-thickness wound, produce new dermis whose collagen organisation, appendages and mechanical strength match uninjured skin, instead of a fibrotic scar.",
    target: { node: CELL("fibroblast") },
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "In mice, blocking mechanotransduction (verteporfin, a YAP inhibitor, or fibroblast-specific YAP knockout) prevented Engrailed-1 activation and yielded wound regeneration with recovery of appendages, ultrastructure and mechanical strength (Mascharak 2021; one group). The default adult outcome in humans is scar (Gurtner 2008; Eming 2014). No large-animal or human evidence located.", drift: "Covered as 'scarless healing drug found'; the demonstration is mouse dorsal skin, splinted, one laboratory." },
    blockedBy: [Q("en1-inhibition-translates-to-human-skin")],
    wouldMove: "The same regenerative outcome (appendages plus native ultrastructure) in porcine or human skin, from an unaffiliated group.",
    evidenceAccessed: [S("mascharak-2021-science"), S("gurtner-2008-nature"), S("eming-2014-scitranslmed")]
  }),
  cap({
    id: C("native-ecm-organisation-reconstruction"), name: "Reconstruct native extracellular-matrix organisation", class: "edit", primitive: "regenerate", projections: both,
    description: "Lay down dermal collagen and elastin in the basket-weave organisation of uninjured skin rather than the parallel bundles of scar.",
    target: { node: CELL("extracellular-matrix") },
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "Mouse only: regeneration of dermal ultrastructure accompanied Engrailed-1 blockade (Mascharak 2021). No independent replication located; no human evidence." },
    blockedBy: [Q("en1-inhibition-translates-to-human-skin")],
    evidenceAccessed: [S("mascharak-2021-science")]
  }),
  cap({
    id: C("fibrogenic-fibroblast-lineage-control"), name: "Control the fibroblast lineage that produces scar", class: "edit", primitive: "recalibrate", projections: both,
    description: "Identify the fibroblast population responsible for fibrotic deposition and prevent its activation or convert it, so that the regenerative population heals the wound.",
    target: { node: CELL("fibroblast") },
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "Distinct dermal fibroblast lineages determine dermal architecture (Driskell 2013); the Engrailed-1 lineage carries intrinsic fibrogenic potential and produces the bulk of scar (Rinkevich 2015); tension drives Engrailed-1 activation and blocking it yields regeneration (Mascharak 2021). Three papers, two overlapping groups, all mouse. Human fibroblast heterogeneity is described but not controlled." },
    blockedBy: [Q("en1-inhibition-translates-to-human-skin"), Q("what-limits-regeneration-in-mus-and-human")],
    evidenceAccessed: [S("driskell-2013-nature"), S("rinkevich-2015-science"), S("mascharak-2021-science")]
  }),
  cap({
    id: C("organised-microvascular-network-in-regenerated-dermis"), name: "Grow an organised, perfused microvascular network in thick regenerated tissue", class: "edit", primitive: "regenerate", projections: both,
    description: "Induce a hierarchical, perfused capillary network throughout a regenerated or engineered dermis thicker than the diffusion limit, connected to the host circulation with normal geometry and long-term stability.",
    target: { node: CELL("endothelium") },
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "Reviews of vascularisation in tissue engineering describe the problem as unsolved beyond roughly the diffusion distance: prevascularisation and angiogenic strategies yield networks in rodents but not organised, stable, clinically usable vasculature in thick constructs (Rouwkema 2016; Laschke 2016). Thin split-thickness grafts revascularise routinely by inosculation; that is a different, solved capability and is what makes skin grafting work at all.", drift: "'Vascularised engineered tissue' usually means capillary sprouting in a small rodent construct." },
    blockedBy: [Q("organised-microvasculature-in-thick-regenerated-tissue")],
    evidenceAccessed: [S("rouwkema-2016-trendsbiotech"), S("laschke-2016-biotechadv")]
  }),
  cap({
    id: C("cutaneous-sensory-reinnervation"), name: "Restore sensory innervation of regenerated skin", class: "edit", primitive: "reconnect", projections: both,
    description: "Regenerated or grafted skin regains touch, temperature and pain sensation comparable to uninjured skin, with nerve fibres reaching Merkel cells and follicles.",
    target: { node: CELL("peripheral-neuron") },
    grade: { basis: "claims", rung: "L1", measured: "structure", blocked: "science", note: "In a human tissue-engineered skin model, neurotrophic factors enhanced angiogenesis, coupling innervation to vascular growth in vitro (Blais 2013). Skin organoids form sensory nerve bundles targeting Merkel cells in culture (Lee 2020). Clinical experience that sensation in grafted skin recovers partially and slowly is common knowledge but is not sourced here, so it does not raise the rung." },
    blockedBy: [Q("regenerated-skin-sensory-reinnervation")],
    evidenceAccessed: [S("blais-2013-tissueeng"), S("lee-2020-nature")]
  }),
  cap({
    id: C("hair-follicle-neogenesis-after-wounding"), name: "Regenerate new hair follicles in a healed wound", class: "edit", primitive: "regenerate", projections: both,
    description: "After a large full-thickness wound, new hair follicles form de novo in the healed skin, as in embryonic development.",
    target: { node: CELL("keratinocyte") },
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "Wound-induced hair neogenesis occurs in adult mice after large excisional wounds and is Wnt-dependent (Ito 2007); the neogenic follicles then drive myofibroblast-to-adipocyte conversion (Plikus 2017). No report of de novo follicle neogenesis in adult human wounds located.", drift: "'Mice regrow hair after wounding' is often generalised to humans; the human observation is absent." },
    blockedBy: [Q("wound-induced-hair-neogenesis-in-human-skin")],
    wouldMove: "Documented follicle neogenesis (not follicle survival) in an adult human wound, by any group.",
    evidenceAccessed: [S("ito-2007-nature"), S("plikus-2017-science")]
  }),
  cap({
    id: C("dermal-adipocyte-regeneration"), name: "Regenerate dermal adipocytes in a healing wound", class: "edit", primitive: "regenerate", projections: both,
    description: "Restore the dermal fat layer in a healed wound, including by converting scar-forming myofibroblasts back into adipocytes.",
    target: { node: CELL("adipocyte") },
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "Myofibroblasts convert to adipocytes during wound-induced hair neogenesis in mice, dependent on follicle-derived BMP signalling (Plikus 2017). One group, mouse." },
    blockedBy: [Q("dermal-adipocyte-regeneration-in-human-wounds")],
    evidenceAccessed: [S("plikus-2017-science")]
  }),
  cap({
    id: C("appendage-bearing-skin-from-pluripotent-cells"), name: "Build appendage-bearing human skin from pluripotent stem cells", class: "edit", primitive: "replace", projections: both,
    description: "Generate, from human pluripotent stem cells, a skin construct with stratified epidermis, dermis, pigmented hair follicles, sebaceous glands and sensory neurons that forms planar hair-bearing skin when grafted.",
    target: { node: CELL("tissue-architecture") },
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "Human pluripotent stem-cell skin organoids (4–5 months in culture) form epidermis, fat-rich dermis, pigmented hair follicles with sebaceous glands and Merkel-targeting sensory neurons, and form planar hair-bearing skin when grafted onto nude mice (Lee 2020). Human cells, mouse host, one group. Nothing grafted into a person." },
    blockedBy: [Q("pluripotent-derived-skin-engrafts-in-humans")],
    evidenceAccessed: [S("lee-2020-nature")]
  }),
  // --- biological control
  cap({
    id: C("inflammation-phase-control-for-regeneration"), name: "Steer the inflammatory phase toward regeneration", class: "edit", primitive: "recalibrate", projections: both,
    description: "Modulate the immune response to a wound so that it resolves into regeneration rather than fibrosis, as it does in regenerating mammals.",
    target: { node: CELL("immune-memory") },
    grade: { basis: "ungraded", note: "A real node with no grade yet. Spiny-mouse and salamander work implicates the immune response, but the seed did not grade the intervention literature; the comparative question below is where the evidence should be attached first." },
    blockedBy: [Q("what-limits-regeneration-in-mus-and-human")]
  }),
  cap({
    id: C("pharmacological-scar-reduction-in-humans"), name: "Reduce scarring pharmacologically in human wounds", class: "edit", primitive: "recalibrate", projections: UR,
    description: "Administer an agent around the time of wounding that measurably improves the appearance and structure of the resulting human scar.",
    target: { node: CELL("fibroblast") },
    grade: { basis: "claims", rung: "L4", measured: "structure", blocked: "science", note: "Intradermal avotermin (recombinant TGF-β3) improved scar scores in three double-blind placebo-controlled phase I/II studies in healthy volunteers (Ferguson 2009) and in a phase II surgical trial (McCollum 2011), all sponsor-run (Renovo). The sponsor reported in 2011 that the phase 3 programme failed to meet its endpoints; no peer-reviewed publication of that phase 3 was located as of 2026-09-11. The rung records what was published, the drift records what happened next.", drift: "The most-cited human anti-scarring result did not survive its phase 3, and the failure is barely visible in the literature because it was never published." },
    blockedBy: [Q("why-avotermin-phase-3-failed")],
    wouldMove: "Any agent improving a validated scar score in a phase 3 by an unaffiliated group, with the trial published whatever its outcome.",
    evidenceAccessed: [S("ferguson-2009-lancet"), S("mccollum-2011-bjs")]
  }),
  cap({
    id: C("mammalian-scar-free-regeneration-target-state"), name: "An adult mammal that regenerates skin without scar (existence proof)", class: "model", primitive: "regenerate", projections: both,
    description: "Know that scar-free regeneration of adult mammalian skin, with follicles, glands, dermis, nerves and vessels, is biologically possible — and have a living model in which to find out how.",
    target: { node: CELL("tissue-architecture") },
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "African spiny mice (Acomys) regenerate full-thickness dorsal skin and 4 mm ear punches with hair follicles, sebaceous glands, dermis, cartilage, muscle and nerve, where C57BL/6 mice scar (Seifert 2012; Brant 2016; Maden 2018; Gawriluk 2016 — overlapping authorship — and Matias Santos 2016, an unaffiliated group). Acomys is a rodent, so this is L2 by the ladder's letter; it is an existence proof, not an intervention." },
    blockedBy: [Q("what-limits-regeneration-in-mus-and-human")],
    evidenceAccessed: [S("seifert-2012-nature"), S("brant-2016-wrr"), S("maden-2018-burns"), S("gawriluk-2016-natcommun"), S("matias-santos-2016-regeneration")]
  }),
  cap({
    id: C("fetal-scarless-healing-target-state"), name: "Human skin that heals without scar exists (early-gestation fetus)", class: "model", primitive: "regenerate", projections: both,
    description: "Know a human skin state in which full-thickness wounds heal by regeneration rather than scar, and what distinguishes it from adult skin.",
    target: { node: CELL("fibroblast") },
    grade: { basis: "claims", rung: "L5", measured: "structure", blocked: "science", note: "Early-gestation fetal skin, human and animal, heals full-thickness wounds without scar; the transition to scarring healing occurs in late gestation, and the differences in inflammation, growth-factor profile and matrix are catalogued (Larson 2010, review). Review-level citation: primary human fetal-surgery series are not attached here. This is an observation about a state, not an intervention in adults." },
    blockedBy: [Q("fetal-conditions-reproducible-in-adult-skin")],
    evidenceAccessed: [S("larson-2010-prs")]
  }),
  cap({
    id: C("established-dermal-scar-reversal"), name: "Remodel an established scar into native dermis", class: "edit", primitive: "remove", projections: both,
    description: "Convert a mature fibrotic dermal scar back into dermis with native matrix organisation and appendages — reversal, not prevention.",
    target: { node: CELL("extracellular-matrix") },
    grade: { basis: "claims", rung: "L0", measured: "none", blocked: "science", note: "No therapy reverses established fibrosis in any organ; approved antifibrotics slow progression (Henderson 2020, review). For dermal scar specifically, no reversal demonstration was located. The rung is L0 on the strength of a contradicting review, not an absence of search." },
    blockedBy: [Q("established-scar-remodelling-to-native-architecture")],
    evidenceAccessed: [S("henderson-2020-nature")]
  }),
  // --- sensing and verification
  cap({
    id: C("wound-bed-assessment-in-vivo"), name: "Assess wound depth, perfusion and infection in a living patient", class: "see", projections: UR,
    description: "Determine, non-destructively, how deep a wound is, whether its bed is perfused, and whether it is infected, well enough to choose a repair strategy.",
    grade: { basis: "standard-of-care", rung: "L5", measured: "function", blocked: "none", note: "Clinical examination, laser Doppler and indocyanine-green perfusion imaging, and microbiological sampling are routine in burn and wound units. Resolution stops at tissue: the state of individual cells is not observed." }
  }),
  cap({
    id: C("fibroblast-state-sensing-in-living-wound"), name: "Measure fibroblast state in a living human wound", class: "see", projections: both,
    description: "Read, non-destructively and repeatedly, whether the fibroblasts in a human wound are on a fibrotic or regenerative trajectory, early enough to intervene.",
    target: { node: CELL("fibroblast") },
    grade: { basis: "ungraded", note: "Lineage tracing answers this in mice by construction (Rinkevich 2015; Mascharak 2021); nothing equivalent exists for a living human wound short of biopsy. Not graded because the seed did not search intravital or liquid-biopsy approaches." },
    blockedBy: [Q("nondestructive-fibroblast-state-readout-in-human-wounds")]
  }),
  cap({
    id: C("regeneration-verification-histology-and-scar-scales"), name: "Verify a repair outcome by histology and validated scar scales", class: "verify", projections: both,
    description: "Confirm after repair whether native architecture was restored, using biopsy histology and validated observer or patient scar scales, and detect late failure.",
    grade: { basis: "standard-of-care", rung: "L5", measured: "structure", blocked: "none", note: "Biopsy histology and validated scar scales (POSAS, Vancouver) are the accepted endpoints of the trials cited on this map (Ferguson 2009; McCollum 2011). Verification is destructive or observational and does not confirm cell-level state." }
  }),
  // --- rejuvenation projection
  cap({
    id: C("safe-partial-epigenetic-reprogramming-in-vivo"), name: "Reset a tissue's epigenetic age in vivo without loss of function", class: "edit", primitive: "repair", projections: RJ,
    description: "Express reprogramming factors transiently in a living tissue so that its DNA-methylation and transcriptional patterns return toward youthful ones and function improves, without dedifferentiation or tumours.",
    grade: { basis: "claims", rung: "L2", measured: "function", blocked: "science", note: "OSK expression in mouse retinal ganglion cells restored youthful methylation and transcriptomes, promoted axon regeneration and reversed vision loss in glaucoma and aged mice (Lu 2020). Cyclic OSKM extended lifespan in progeroid mice and improved injury recovery in aged wild-type mice without teratomas (Ocampo 2016). Two groups, mouse. A sponsor dosed the first human with an OSK therapy in one eye in June 2026 (phase 1, safety primary); that is a running experiment, not evidence.", drift: "Reported as 'age reversal in humans has begun'; what has begun is a phase 1 safety study of one eye." },
    blockedBy: [Q("partial-reprogramming-human-safety")],
    wouldMove: "A human tissue showing a measurable functional gain with retained cell identity and no proliferative signal, then the same from an unaffiliated group.",
    evidenceAccessed: [S("lu-2020-nature"), S("ocampo-2016-cell"), S("life-biosciences-2026-er100-first-dosed")]
  }),
  cap({
    id: C("cell-identity-retention-under-partial-reprogramming"), name: "Rejuvenate cells while they keep their identity", class: "model", primitive: "preserve", projections: RJ,
    description: "Drive a cell's epigenetic state younger without pushing it toward pluripotency: the cell stays a retinal ganglion cell, a hepatocyte, a neuron with its connections.",
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "Short cyclic OSKM in mice ameliorated aging hallmarks without teratoma formation, i.e. without full dedifferentiation (Ocampo 2016); OSK without c-Myc in retinal ganglion cells restored function with identity retained (Lu 2020). Mouse; the safe expression window in humans is unknown." },
    blockedBy: [Q("partial-reprogramming-human-safety")],
    evidenceAccessed: [S("ocampo-2016-cell"), S("lu-2020-nature")]
  }),
  cap({
    id: C("cancer-risk-control-under-rejuvenation"), name: "Keep cancer risk acceptable while rejuvenating tissue", class: "control", primitive: "preserve", projections: RJ,
    description: "Rejuvenation makes cells more plastic and proliferative — the territory cancer exploits. Bound that risk in aged humans, over repeated treatment, with a stopping rule.",
    grade: { basis: "ungraded", note: "No grade: the human evidence does not exist and the seed did not grade the mouse tumorigenicity literature. The node exists because the goal cannot be reached without it." },
    blockedBy: [Q("cancer-risk-of-repeated-partial-reprogramming")]
  }),
  cap({
    id: C("rejuvenated-state-persistence"), name: "Make a rejuvenated state persist, or re-dose safely", class: "verify", primitive: "preserve", projections: RJ,
    description: "After rejuvenation, the tissue stays young for a clinically meaningful time, or can be re-treated without cumulative harm — and the verification exists to know which.",
    grade: { basis: "ungraded", note: "Not graded. Persistence beyond the treatment window has not been characterised in any human tissue; mouse durations are reported per study and were not collated here." },
    blockedBy: [Q("rejuvenated-state-persistence-and-redosing")]
  }),
  cap({
    id: C("systemic-cell-type-specific-delivery"), name: "Deliver a payload to a chosen cell type throughout the body", class: "reach", projections: both,
    description: "Address a payload to one cell type across all its tissues from a systemic dose, at useful efficiency, repeatably, without off-target harm — the 'universal addressability' the black box needs.",
    grade: { basis: "claims", rung: "L4", measured: "transduction", blocked: "science", note: "The best systemic case on this map is intravenous AAV9 in spinal muscular atrophy: clinical benefit is real and replicated, but direct evidence of human CNS transduction rests on two autopsies with liver vector hundreds-fold higher than CNS (Thomsen 2021). Liver and blood are tractable; arbitrary cell-type-specific delivery is not. The 16 graded CNS routes in this map are the detailed picture for one organ.", drift: "'Systemic gene therapy reaches the brain' rests on n=2 post-mortem samples." },
    blockedBy: [Q("rejuvenation-reach-beyond-eye-and-liver")],
    evidenceAccessed: [S("thomsen-2021-natmed")]
  })
];

/* --------------------------------------------------------------- questions */

const q = (o) => ({ type: "question", state: "open", ...o, provenance: prov(AUTHORED), review: REVIEW });

const QUESTIONS = [
  q({ id: Q("en1-inhibition-translates-to-human-skin"), projections: both,
    question: "Does blocking Engrailed-1 activation (mechanotransduction/YAP inhibition) produce regeneration with appendages and native matrix in porcine or human skin, as it does in mouse?",
    why: "It is the only demonstrated route to scarless full-thickness regeneration in an adult mammal that is also a drug (verteporfin is approved for another use). If it translates, four capabilities move from L2 toward L3/L4 at once; if it does not, the mouse result is a mechanism, not a therapy.",
    blocks: [C("dermal-architecture-regeneration-without-scar"), C("native-ecm-organisation-reconstruction"), C("fibrogenic-fibroblast-lineage-control"), G("scarless-skin-repair")],
    hypotheses: ["The mechanism is conserved and translates with dose adjustment.", "Human skin's tension, thickness and slower healing make the fibrotic lineage dominant regardless of YAP inhibition.", "Regeneration occurs but appendage neogenesis does not, because human wounds lack the Wnt context of mouse large wounds."],
    knownUnknowns: ["dose and timing window in thick skin", "whether human fibroblast subpopulations map onto the mouse Engrailed-1 lineage", "effect on wound closure speed and tensile strength"],
    whatWouldResolve: "A splinted full-thickness wound study in pig skin, or a human scar-revision trial, with appendage counts and matrix ultrastructure as endpoints, from a group unaffiliated with the original." }),
  q({ id: Q("what-limits-regeneration-in-mus-and-human"), projections: both,
    question: "What, mechanistically, stops laboratory mice and humans from regenerating skin the way spiny mice do — the immune response, the matrix, the fibroblast lineage, or something else?",
    why: "The existence proof says the capability is within mammalian reach; the discriminating comparison says where to intervene. Every biological-control capability on this map depends on the answer.",
    blocks: [C("mammalian-scar-free-regeneration-target-state"), C("inflammation-phase-control-for-regeneration"), C("fibrogenic-fibroblast-lineage-control"), G("scarless-skin-repair")],
    hypotheses: ["A muted or differently timed inflammatory response permits regeneration.", "A different composition of the provisional matrix (less collagen I, more collagen III/tenascin) permits it.", "Acomys lacks or suppresses a fibrogenic fibroblast lineage.", "Several of these, and they are coupled."],
    whatWouldResolve: "Matched single-cell and spatial atlases of Acomys versus Mus wounds at the same timepoints, with lineage tracing, and a perturbation that converts one phenotype toward the other." }),
  q({ id: Q("wound-induced-hair-neogenesis-in-human-skin"), projections: both,
    question: "Can de novo hair follicle neogenesis occur in adult human wounds, or is it lost with development?",
    why: "Appendage regeneration is the visible difference between regeneration and scar. Mouse large wounds do it; if human skin cannot, appendages must come from a graft instead.",
    blocks: [C("hair-follicle-neogenesis-after-wounding")],
    hypotheses: ["Human skin retains the competence and lacks the trigger (wound size, Wnt).", "Competence is lost postnatally in humans."],
    whatWouldResolve: "Documented follicle neogenesis, distinguished from survival of pre-existing follicles, in a large adult human wound or a human skin xenograft." }),
  q({ id: Q("why-avotermin-phase-3-failed"), projections: UR,
    question: "Why did avotermin (TGF-β3) fail in phase 3 after positive double-blind phase I/II and phase II results — and where are the phase 3 data?",
    why: "It is the best-documented human anti-scarring effect ever published and it did not survive its confirmatory trial. Until the failure is understood, every pharmacological scar-reduction claim inherits the uncertainty.",
    blocks: [C("pharmacological-scar-reduction-in-humans")],
    hypotheses: ["The phase I/II effect was real but small and endpoint-sensitive; phase 3 used a different scar-assessment endpoint.", "Dose or timing differed between phases.", "The earlier effect was partly an artefact of within-participant design."],
    knownUnknowns: ["the phase 3 protocol and endpoints", "whether the data were ever released"],
    whatWouldResolve: "Publication or release of the phase 3 dataset (registered trials: NCT00847925, NCT00847795, NCT00629811 were the phase I/II)." }),
  q({ id: Q("organised-microvasculature-in-thick-regenerated-tissue"), projections: both,
    question: "Can an organised, hierarchical, perfused microvascular network be induced throughout regenerated or engineered dermis thicker than the diffusion limit, in humans, with normal geometry and long-term stability?",
    why: "Without it, any regenerated tissue thicker than a few hundred micrometres dies in the middle. It gates dermal regeneration, engineered grafts and every thick-tissue repair on the universal map.",
    blocks: [C("organised-microvascular-network-in-regenerated-dermis"), C("appendage-bearing-skin-from-pluripotent-cells")],
    hypotheses: ["Prevascularised constructs anastomose fast enough if the network is pre-patterned.", "Host angiogenesis can be driven to hierarchy by controlled growth-factor gradients.", "Only surgical microvascular connection (flaps) will work at clinical scale."],
    whatWouldResolve: "A thick (>2 mm) regenerated or engineered dermis in a large animal or human with perfusion measured throughout at six months and vessel hierarchy on histology." }),
  q({ id: Q("regenerated-skin-sensory-reinnervation"), projections: both,
    question: "Does regenerated or grafted skin regain sensory innervation comparable to uninjured skin, and what limits it?",
    why: "Skin without sensation is injured skin. Reinnervation is required for function and is rarely measured as an endpoint.",
    blocks: [C("cutaneous-sensory-reinnervation")],
    whatWouldResolve: "Quantitative sensory testing plus nerve-fibre density on biopsy in regenerated versus uninjured skin at one year." }),
  q({ id: Q("established-scar-remodelling-to-native-architecture"), projections: both,
    question: "Can a mature dermal scar be remodelled into dermis with native matrix organisation and appendages?",
    why: "Prevention helps the next wound; reversal helps everyone already scarred, and every fibrotic organ shares the problem.",
    blocks: [C("established-dermal-scar-reversal")],
    hypotheses: ["Scar matrix can be degraded and replaced if the fibroblasts are reprogrammed.", "Mature cross-linked matrix cannot be remodelled to native architecture without excision."],
    whatWouldResolve: "Histological conversion of an established scar to basket-weave dermis with appendages in any adult mammal." }),
  q({ id: Q("fetal-conditions-reproducible-in-adult-skin"), projections: both,
    question: "Which features of early-gestation fetal wound healing are causal for scarlessness, and can they be reproduced in adult skin?",
    why: "The fetal state is the only human state known to heal without scar. If its causal features can be imposed on adult wounds, scarless repair becomes an adult capability.",
    blocks: [C("fetal-scarless-healing-target-state")],
    whatWouldResolve: "An adult-skin wound that heals without scar after imposing a defined subset of fetal conditions (inflammation, growth-factor profile, matrix)." }),
  q({ id: Q("gene-corrected-epidermal-graft-long-term-safety"), projections: UR,
    question: "Do gene-corrected epidermal stem-cell grafts remain stable and free of clonal or malignant events beyond five years?",
    why: "Retroviral integration in long-lived stem cells is the safety question that decides whether the approach can be offered widely.",
    blocks: [C("epidermis-gene-corrected-stem-cell-replacement")],
    whatWouldResolve: "Integration-site analysis and clinical follow-up beyond five years in the treated patients, published." }),
  q({ id: Q("topical-gene-delivery-generalises-beyond-eb"), projections: UR,
    question: "Does topical HSV-vector gene delivery to keratinocytes generalise to other genes and non-EB indications, and by unaffiliated groups?",
    why: "One approved product proves the route; generality is what makes it a capability rather than a product.",
    blocks: [C("keratinocyte-in-vivo-topical-gene-delivery")],
    whatWouldResolve: "Durable expression of a second gene in a second indication in a randomised trial not run by the original sponsor." }),
  q({ id: Q("skin-substitutes-improve-scar-quality-not-just-closure"), projections: UR,
    question: "Do bioengineered skin substitutes improve the quality of the healed skin (scar scale, appendages, sensation) rather than only the rate of closure?",
    why: "Closure is the endpoint that got them approved; quality is what regeneration means. The trials on this map did not measure it.",
    blocks: [C("dermal-substitute-for-chronic-wound-closure")],
    whatWouldResolve: "A randomised trial with a validated scar-quality primary endpoint at 12 months." }),
  q({ id: Q("dermal-adipocyte-regeneration-in-human-wounds"), projections: both,
    question: "Can dermal adipocyte regeneration from myofibroblasts be induced in human wounds?",
    why: "Loss of the dermal fat layer is part of what makes scar stiff and depressed; mouse shows it can be regenerated.",
    blocks: [C("dermal-adipocyte-regeneration")],
    whatWouldResolve: "Adipocyte lineage conversion demonstrated in human wound tissue or xenograft." }),
  q({ id: Q("pluripotent-derived-skin-engrafts-in-humans"), projections: both,
    question: "Can pluripotent-stem-cell-derived, appendage-bearing skin engraft in a human, vascularise, and remain stable?",
    why: "It is the alternative to regenerating appendages in place, and the only current route to human skin with follicles built outside the body.",
    blocks: [C("appendage-bearing-skin-from-pluripotent-cells")],
    whatWouldResolve: "A first-in-human graft with survival, vascularisation and appendage persistence at one year." }),
  q({ id: Q("nondestructive-fibroblast-state-readout-in-human-wounds"), projections: both,
    question: "Can fibroblast state (fibrotic versus regenerative trajectory) be read non-destructively in a living human wound early enough to intervene?",
    why: "Without a readout there is no closed loop: every anti-fibrotic intervention is dosed blind and verified only by the scar.",
    blocks: [C("fibroblast-state-sensing-in-living-wound")],
    whatWouldResolve: "A non-invasive measurement in human wounds that predicts scar outcome at 12 months." }),
  q({ id: Q("reliable-biofilm-eradication-in-chronic-wounds"), projections: UR,
    question: "Can established polymicrobial biofilm be reliably eradicated from chronic human wounds?",
    why: "Biofilm is the commonest reason a wound that could heal does not; the map has no grade for the capability because the seed did not search it.",
    blocks: [C("chronic-wound-biofilm-eradication")],
    whatWouldResolve: "A randomised trial with microbiologically confirmed eradication and closure as endpoints." }),
  // rejuvenation
  q({ id: Q("partial-reprogramming-human-safety"), projections: RJ,
    question: "Can partial epigenetic reprogramming rejuvenate a human tissue without dedifferentiation, loss of cell identity or tumour formation?",
    why: "It is the first rejuvenation mechanism to reach a human; its safety window decides whether the rejuvenation map has a therapeutic root at all.",
    blocks: [C("safe-partial-epigenetic-reprogramming-in-vivo"), C("cell-identity-retention-under-partial-reprogramming"), G("systemic-rejuvenation")],
    hypotheses: ["A controlled expression window exists in humans as it does in mice.", "Human cells require longer exposure for effect, which overlaps the dedifferentiation window."],
    knownUnknowns: ["safe expression window", "delivery efficiency to the target cells", "long-term epigenetic stability"],
    whatWouldResolve: "Phase 1 safety data plus any functional signal from the first OSK trial (NCT07290244), then a functional endpoint in a controlled study." }),
  q({ id: Q("rejuvenation-reach-beyond-eye-and-liver"), projections: RJ,
    question: "Can a rejuvenation payload reach tissues beyond the eye and liver — heart, brain, muscle — at useful efficiency?",
    why: "Systemic rejuvenation is gated by delivery. The eye is chosen first because it is reachable; the tissues that matter for lifespan are not.",
    blocks: [C("systemic-cell-type-specific-delivery"), G("systemic-rejuvenation")],
    whatWouldResolve: "Cell-type-specific transduction quantified in a non-ocular human tissue from a systemic dose, by any group." }),
  q({ id: Q("rejuvenated-state-persistence-and-redosing"), projections: RJ,
    question: "Does a rejuvenated state persist after treatment stops, and can treatment be repeated without cumulative harm?",
    why: "A rejuvenation that lasts a month is a treatment; one that lasts a decade is the goal. The verification to tell them apart does not yet exist in humans.",
    blocks: [C("rejuvenated-state-persistence"), G("systemic-rejuvenation")],
    whatWouldResolve: "Longitudinal epigenetic-age and functional measurement in a treated human tissue over years, with and without re-dosing." }),
  q({ id: Q("cancer-risk-of-repeated-partial-reprogramming"), projections: RJ,
    question: "What is the cancer risk of repeated partial reprogramming in aged human tissue, and can it be bounded by a stopping rule?",
    why: "Rejuvenation and oncogenesis share machinery. Nobody will accept a rejuvenation treatment in healthy people without an answer, and the answer is only observable over years.",
    blocks: [C("cancer-risk-control-under-rejuvenation"), G("systemic-rejuvenation")],
    knownUnknowns: ["dose–response for transformation", "interaction with pre-existing clonal expansions in aged tissue", "whether a biomarker of proliferative drift exists"],
    whatWouldResolve: "Long-term cancer incidence in treated versus untreated aged animals and, eventually, humans; and a validated early biomarker of transformation risk." }),
  q({ id: Q("healthy-target-state-for-aged-tissue"), projections: RJ,
    question: "What counts as the healthy target state for an aged person's tissue — youthful architecture, age-appropriate function, or something the person defines?",
    why: "Target-state content is human-gated on this map (ai-collaboration.md §4). The question is recorded so the dependency is visible; it is not for a model to resolve.",
    blocks: [G("systemic-rejuvenation"), G("rejuvenation")],
    hypotheses: ["A population reference state at a younger age.", "The person's own earlier state, where records exist.", "A personalised optimum co-defined with the person, including what must not change."],
    whatWouldResolve: "A published, reviewed target-state framework adopted by a rejuvenation trial as its endpoint definition." })
];

/* ------------------------------------------------------------- experiments */

const ex = (o) => ({ type: "experiment", ...o, provenance: prov(AUTHORED), review: REVIEW });

const EXPERIMENTS = [
  ex({ id: E("verteporfin-porcine-full-thickness-wound"), name: "YAP inhibition (verteporfin) in a splinted porcine full-thickness wound model",
    tests: [Q("en1-inhibition-translates-to-human-skin")], status: "proposed",
    design: { species: "pig (NCBITaxon:9823)", model: "splinted full-thickness excisional dorsal wounds, paired within animal", intervention: "local verteporfin at wounding and during proliferation, dose-ranging", comparator: "vehicle, contralateral wound", readout: "appendage count per area, collagen ultrastructure (SEM), tensile strength, closure time at 8 and 16 weeks", duration: "4 months", n: "8–12 animals, paired wounds" },
    discriminates: "Appendages plus native ultrastructure in treated wounds favours conservation; closure without appendages favours the 'regeneration without neogenesis' hypothesis; no difference favours non-translation.",
    feasibility: { costClass: "medium", durationClass: "months", requires: ["large-animal surgical facility", "SEM histology", "the compound (approved for ophthalmic use)"], ethics: "animal ethics approval" } }),
  ex({ id: E("acomys-vs-mus-matched-wound-atlas"), name: "Matched single-cell and spatial atlas of Acomys versus Mus wound healing",
    tests: [Q("what-limits-regeneration-in-mus-and-human")], status: "proposed",
    design: { species: "Acomys cahirinus (NCBITaxon:10068) and Mus musculus (NCBITaxon:10090)", model: "identical full-thickness dorsal wounds", intervention: "none (comparative)", comparator: "species", readout: "single-cell RNA and spatial transcriptomics of immune and fibroblast compartments at days 1, 3, 7, 14, 28; lineage tracing where tools exist", duration: "6–9 months", n: "3–5 animals per species per timepoint" },
    discriminates: "Divergence appearing first in immune populations, in fibroblast lineage composition, or in matrix genes points at which hypothesis to perturb next.",
    feasibility: { costClass: "medium", durationClass: "months", requires: ["Acomys colony", "single-cell and spatial sequencing"], ethics: "animal ethics approval" } }),
  ex({ id: E("skin-substitute-scar-quality-rct"), name: "Randomised trial of a bioengineered skin substitute with scar quality as the primary endpoint",
    tests: [Q("skin-substitutes-improve-scar-quality-not-just-closure")], status: "proposed",
    design: { species: "human", model: "acute full-thickness surgical wounds or chronic ulcers", intervention: "living bioengineered skin substitute", comparator: "standard care", readout: "POSAS observer and patient scores at 12 months; appendage presence and nerve-fibre density on optional biopsy", duration: "18 months", n: "powered for a POSAS difference; to be calculated" },
    discriminates: "Improved scar quality means the constructs do more than accelerate closure; no difference means the capability is closure only.",
    feasibility: { costClass: "high", durationClass: "years", requires: ["multi-centre wound-care network", "an unaffiliated sponsor"], ethics: "human research ethics approval" } }),
  ex({ id: E("gene-corrected-epidermal-graft-long-term-registry"), name: "Long-term registry and integration-site surveillance of gene-corrected epidermal graft recipients",
    tests: [Q("gene-corrected-epidermal-graft-long-term-safety")], status: "proposed",
    design: { species: "human", model: "treated JEB patients and any future recipients", intervention: "none (observational)", comparator: "untreated skin of the same patients", readout: "integration-site analysis, clonal dominance, malignancy, graft stability at 5, 10, 15 years", duration: "10+ years", n: "all recipients" },
    discriminates: "Stable polyclonal maintenance without malignancy supports wider use; clonal dominance or transformation changes the risk calculus for every ex vivo integrating vector.",
    feasibility: { costClass: "low", durationClass: "years", requires: ["access to treated patients", "integration-site sequencing"], ethics: "consent for long-term follow-up" } }),
  ex({ id: E("wihn-human-xenograft-large-wound"), name: "Test wound-induced hair neogenesis in adult human skin xenografts after large excision",
    tests: [Q("wound-induced-hair-neogenesis-in-human-skin")], status: "proposed",
    design: { species: "human skin on immunodeficient mouse", model: "adult human skin xenografts with large full-thickness excisional wounds", intervention: "wound size series with and without Wnt agonism", comparator: "small wounds; untreated", readout: "de novo follicles distinguished from surviving follicles by lineage and position", duration: "6 months", n: "skin from 5+ donors" },
    discriminates: "Neogenesis in human skin with Wnt support shows competence is retained; none under any condition supports postnatal loss.",
    feasibility: { costClass: "medium", durationClass: "months", requires: ["human skin donors", "immunodeficient mice"], ethics: "human tissue and animal ethics" } }),
  ex({ id: E("er-100-phase-1-optic-neuropathies"), name: "ER-100 (OSK partial epigenetic reprogramming) Phase 1 in open-angle glaucoma and NAION",
    tests: [Q("partial-reprogramming-human-safety")], status: "running", registration: "NCT07290244",
    design: { species: "human", model: "open-angle glaucoma; non-arteritic anterior ischaemic optic neuropathy", intervention: "ER-100: controlled expression of OCT4, SOX2, KLF4 in one eye", comparator: "not stated in the sponsor announcement", readout: "safety and tolerability (primary); visual function (secondary)", duration: "not stated", n: "not stated" },
    discriminates: "A safety signal or a visual-function change in the treated eye is the first human data point for the rejuvenation map; absence of harm alone does not demonstrate rejuvenation.",
    feasibility: { costClass: "high", durationClass: "years", requires: ["sponsor-run trial"], ethics: "IND cleared (sponsor statement)" } })
];

/* ------------------------------------------------------------------- claims */

const cl = (o) => ({
  type: "claim",
  grounding: "G1",
  ...o,
  provenance: prov(AUTHORED, o.evidence.map((e) => e.source)),
  review: REVIEW
});
const ev = (source, design, extra) => ({ source, design, locator: "abstract", ...(extra || {}) });

const CLAIMS = [
  cl({ id: CL("acomys-regenerates-full-thickness-skin-without-scar"),
    statement: "Adult African spiny mice (Acomys) regenerate full-thickness dorsal skin wounds and ear punches with hair follicles, sebaceous glands, dermis and cartilage, where laboratory mice heal the same wounds by fibrotic scar.",
    context: { species: "Acomys (NCBITaxon:10068 and relatives)", model: "skin autotomy wounds; 4 mm ear punch", comparator: "Mus musculus C57BL/6" },
    measurement: { measured: "structure", assay: "histology; mechanical testing", endpoint: "appendage and dermal regeneration in the wound", effect: "complete regeneration of follicles, glands, dermis and cartilage in ear punches; hair follicle regeneration in dorsal wounds" },
    evidence: [ev(S("seifert-2012-nature"), "animal-observational"), ev(S("brant-2016-wrr"), "animal-observational"), ev(S("maden-2018-burns"), "animal-controlled", { note: "extends to full-thickness thermal burns" }), ev(S("gawriluk-2016-natcommun"), "animal-controlled", { note: "ear-hole closure as a discrete trait across species" })],
    rung: "L2",
    replication: { independentGroups: 1, note: "The four sources share authorship (Seifert, Maden, Brant). Independent replication is the Matias Santos claim below, which is why this claim's replication count is 1 and not 4." },
    status: { peerReviewed: true },
    supports: [C("mammalian-scar-free-regeneration-target-state")],
    limitations: ["a rodent, so L2 by the ladder even though the finding is a species trait rather than an intervention", "mechanism not established by these papers"] }),
  cl({ id: CL("acomys-ear-regeneration-independent-replication"),
    statement: "In an unaffiliated laboratory, Acomys cahirinus closed 4 mm ear punches completely within two months in 100% of wounds, regenerating cartilage, adipose, dermis, epidermis, hair follicles, vessels, muscle and nerve, while C57BL/6 mice scarred.",
    context: { species: "Acomys cahirinus (NCBITaxon:10068)", model: "4 mm full-thickness ear punch", comparator: "C57BL/6 mice" },
    measurement: { measured: "structure", assay: "histology", endpoint: "complete ear-punch closure with tissue regeneration", effect: "100% of punches closed by 2 months with regenerated tissues including muscle and nerve" },
    evidence: [ev(S("matias-santos-2016-regeneration"), "animal-controlled")],
    rung: "L2",
    replicates: [CL("acomys-regenerates-full-thickness-skin-without-scar")],
    replication: { independentGroups: 1, note: "Independent of the Seifert/Maden groups; confirms the ear-punch phenotype. Dorsal skin regeneration was not the readout here." },
    status: { peerReviewed: true },
    supports: [C("mammalian-scar-free-regeneration-target-state")] }),
  cl({ id: CL("en1-lineage-fibroblasts-produce-scar"),
    statement: "A distinct dermal fibroblast lineage marked by Engrailed-1 expression carries intrinsic fibrogenic potential and is responsible for the bulk of scar formation in mouse skin wounds.",
    context: { species: "mouse (NCBITaxon:10090)", model: "dorsal skin wounds; lineage tracing and transplantation", cellType: "dermal fibroblast" },
    measurement: { measured: "structure", assay: "lineage tracing; transplantation; ablation", endpoint: "contribution of the lineage to scar matrix", effect: "the Engrailed-1 lineage produces the majority of connective tissue in scar; its ablation reduces scarring" },
    evidence: [ev(S("rinkevich-2015-science"), "animal-controlled"), ev(S("driskell-2013-nature"), "animal-controlled", { note: "establishes distinct fibroblast lineages determining dermal architecture" })],
    rung: "L2",
    replication: { independentGroups: 2, note: "Two groups (Longaker/Weissman; Watt) describing lineage heterogeneity with different markers; the Engrailed-1 result itself is one group." },
    status: { peerReviewed: true },
    supports: [C("fibrogenic-fibroblast-lineage-control")] }),
  cl({ id: CL("yap-inhibition-yields-mouse-wound-regeneration"),
    statement: "Blocking mechanotransduction with verteporfin (a YAP inhibitor) or fibroblast-specific YAP knockout prevents Engrailed-1 activation in mouse wounds and produces regeneration with recovery of skin appendages, matrix ultrastructure and mechanical strength.",
    context: { species: "mouse (NCBITaxon:10090)", model: "full-thickness dorsal excisional wounds", intervention: "local verteporfin; fibroblast-specific YAP knockout", comparator: "vehicle; wild type" },
    measurement: { measured: "structure", assay: "histology; electron microscopy; tensile testing; lineage tracing", endpoint: "appendage recovery, ultrastructure, mechanical strength", effect: "regenerative rather than fibrotic outcome in treated wounds" },
    evidence: [ev(S("mascharak-2021-science"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 0, note: "One group (Longaker, Stanford). No independent replication located as of 2026-09-11." },
    status: { peerReviewed: true },
    supports: [C("dermal-architecture-regeneration-without-scar"), C("native-ecm-organisation-reconstruction"), C("fibrogenic-fibroblast-lineage-control")],
    drift: "'A drug that heals wounds without scars' — in mice, splinted, one laboratory; verteporfin's human anti-scarring effect is untested.",
    wouldMove: "Replication by an unaffiliated group, then a large-animal model." }),
  cl({ id: CL("adult-mammalian-wounds-heal-by-scar"),
    statement: "Adult mammalian and human skin wounds heal by a fibrotic scar that lacks the appendages and matrix organisation of uninjured skin; this is the default outcome of adult repair.",
    context: { species: "human and mammals generally", model: "full-thickness cutaneous wounds" },
    measurement: { measured: "structure", endpoint: "histological outcome of healed adult wounds", effect: "scar, not regeneration" },
    evidence: [ev(S("gurtner-2008-nature"), "review"), ev(S("eming-2014-scitranslmed"), "review")],
    rung: "L5",
    replication: { independentGroups: 2, note: "Review-level statement of a universal clinical observation." },
    status: { peerReviewed: true },
    contradicts: [C("dermal-architecture-regeneration-without-scar")],
    limitations: ["a statement of the problem, cited so that the default outcome is in the graph rather than assumed"] }),
  cl({ id: CL("wound-induced-hair-neogenesis-in-adult-mice"),
    statement: "Adult mice regenerate new hair follicles de novo in the centre of large full-thickness wounds through a Wnt-dependent process resembling embryonic follicle development.",
    context: { species: "mouse (NCBITaxon:10090)", model: "large (>1 cm) full-thickness excisional wounds", comparator: "small wounds; Wnt inhibition" },
    measurement: { measured: "structure", assay: "histology; lineage tracing; Wnt reporter", endpoint: "de novo follicle formation in healed wound", effect: "new follicles form in large wounds; blocked by Wnt inhibition, enhanced by Wnt" },
    evidence: [ev(S("ito-2007-nature"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 1, note: "Widely reproduced in mice since (not cited here); no human report located." },
    status: { peerReviewed: true },
    supports: [C("hair-follicle-neogenesis-after-wounding")] }),
  cl({ id: CL("myofibroblasts-regenerate-adipocytes-in-mouse-wounds"),
    statement: "During wound-induced hair neogenesis in mice, scar-forming myofibroblasts convert into adipocytes, dependent on BMP signalling from the new hair follicles.",
    context: { species: "mouse (NCBITaxon:10090)", model: "large full-thickness wounds with hair neogenesis", cellType: "myofibroblast" },
    measurement: { measured: "structure", assay: "lineage tracing; BMP pathway manipulation", endpoint: "adipocyte regeneration from myofibroblast lineage", effect: "myofibroblasts adopt adipocyte fate in regenerating wounds" },
    evidence: [ev(S("plikus-2017-science"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 0, note: "One collaboration (Plikus/Cotsarelis). No independent replication cited." },
    status: { peerReviewed: true },
    supports: [C("dermal-adipocyte-regeneration"), C("hair-follicle-neogenesis-after-wounding")] }),
  cl({ id: CL("hpsc-skin-organoids-form-hair-bearing-skin-in-mice"),
    statement: "Human pluripotent stem-cell-derived skin organoids develop stratified epidermis, fat-rich dermis, pigmented hair follicles with sebaceous glands and Merkel-targeting sensory neurons over 4–5 months, and form planar hair-bearing skin when grafted onto nude mice.",
    context: { species: "human cells; nude mouse host", model: "organoid culture; xenograft", intervention: "stepwise TGF-β and FGF modulation" },
    measurement: { measured: "structure", assay: "histology; single-cell RNA-seq versus fetal skin; grafting", endpoint: "appendage-bearing skin formation", effect: "organoids equivalent to second-trimester facial skin; hair-bearing planar skin after grafting" },
    evidence: [ev(S("lee-2020-nature"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 0, note: "One group (Koehler). Human cells, mouse host: nothing grafted into a person." },
    status: { peerReviewed: true },
    supports: [C("appendage-bearing-skin-from-pluripotent-cells"), C("cutaneous-sensory-reinnervation")] }),
  cl({ id: CL("cultured-epithelial-autografts-permanently-cover-large-burns"),
    statement: "Sheets of cultured autologous keratinocytes permanently cover large full-thickness burn wounds, and have been used and followed long-term at unaffiliated centres since the first report.",
    context: { species: "human", model: "large full-thickness burns", intervention: "cultured epithelial autograft" },
    measurement: { measured: "function", assay: "clinical follow-up", endpoint: "permanent wound coverage", effect: "permanent take of cultured epithelium on extensive burns (first report, two patients); long-term coverage in later series" },
    evidence: [ev(S("gallico-1984-nejm"), "case-series", { n: "2", note: "originating report (Green laboratory)" }), ev(S("sood-2000-jbcr"), "case-series", { note: "long-term follow-up at a separate centre" }), ev(S("sun-2014-science"), "review", { note: "surveys clinical use of cultured epithelium" })],
    rung: "L5",
    replication: { independentGroups: 2, note: "Founding report plus a separate centre's series and a review; fragility and absence of dermis are consistent across them." },
    status: { peerReviewed: true },
    supports: [C("epidermis-replacement-cultured-autograft")],
    limitations: ["epidermis only; no dermis, appendages or normal sensation", "fragile skin prone to blistering"] }),
  cl({ id: CL("transgenic-epidermal-stem-cells-regenerate-functional-epidermis-jeb"),
    statement: "Autologous epidermal stem cells corrected with a retroviral vector regenerated a durable, functional, self-renewing epidermis in patients with junctional epidermolysis bullosa: nine grafts on an adult's legs stable at one year (2006), and an entire epidermis on ~80% of a child's body surface (2017).",
    context: { species: "human", model: "junctional epidermolysis bullosa (LAMB3 mutations)", intervention: "ex vivo retroviral LAMB3 correction of epidermal stem cells; cultured grafts", comparator: "none (single patients)" },
    measurement: { measured: "function", assay: "clinical follow-up; integration-site analysis; clonal tracing", endpoint: "stable, blister-free, adherent epidermis", effect: "full functional correction of grafted areas; maintained by a defined repertoire of transduced stem cells" },
    evidence: [ev(S("mavilio-2006-natmed"), "case-report", { n: "1" }), ev(S("hirsch-2017-nature"), "case-report", { n: "1" })],
    rung: "L4",
    replication: { independentGroups: 0, note: "Both patients treated by the same group (De Luca). Two successes, no independent replication — L4, not L5." },
    status: { peerReviewed: true },
    supports: [C("epidermis-gene-corrected-stem-cell-replacement")],
    drift: "'Boy given new skin' — the regenerated organ is the epidermis; the dermis was his own.",
    wouldMove: "An unaffiliated centre reproducing durable engraftment, with integration-site surveillance beyond five years." }),
  cl({ id: CL("b-vec-topical-gene-therapy-closes-deb-wounds"),
    statement: "Weekly topical beremagene geperpavec (HSV-1 vector delivering COL7A1) achieved complete healing in 67% of treated versus 22% of placebo wounds at six months in a 31-patient, double-blind, intrapatient-randomised phase 3 in dystrophic epidermolysis bullosa.",
    context: { species: "human", model: "dystrophic epidermolysis bullosa (COL7A1 mutations)", intervention: "topical B-VEC, weekly for 26 weeks", comparator: "placebo, matched wound in the same patient", age: "6 months and older" },
    measurement: { measured: "function", assay: "clinical wound assessment", endpoint: "complete wound healing at 6 months (primary)", effect: "67% vs 22%, difference 46 percentage points (95% CI 24–68), P = 0.002", uncertainty: "95% CI 24 to 68 percentage points" },
    evidence: [ev(S("guide-2022-nejm"), "rct", { n: "31 patients, primary wound pairs", blinding: "double-blind", randomisation: "intrapatient 1:1" })],
    rung: "L4",
    replication: { independentGroups: 0, note: "Single sponsor (Krystal Biotech), multi-site. No unaffiliated trial." },
    status: { peerReviewed: true },
    supports: [C("keratinocyte-in-vivo-topical-gene-delivery")],
    limitations: ["vector does not persist; dosing is repeated", "one gene, one rare disease"] }),
  cl({ id: CL("fda-approved-b-vec-2023"),
    statement: "The U.S. FDA approved beremagene geperpavec (Vyjuvek) on 19 May 2023 for wounds in patients six months and older with dystrophic epidermolysis bullosa, citing 65% versus 26% complete wound closure at 24 weeks in a 31-patient randomised placebo-controlled trial.",
    context: { species: "human", model: "dystrophic epidermolysis bullosa", intervention: "topical B-VEC" },
    measurement: { measured: "function", endpoint: "complete wound closure at 24 weeks (FDA summary)", effect: "65% vs 26% (FDA summary; the NEJM primary analysis reports 67% vs 22% at 6 months — different analysis, same trial)" },
    evidence: [ev(S("fda-2023-vyjuvek"), "regulatory-decision", { locator: "press announcement, efficacy paragraph", quote: "Sixty-five percent of the Vyjuvek-treated wounds completely closed while only 26% of the placebo-treated wound completely closed" })],
    rung: "L4",
    grounding: "G2",
    replication: { independentGroups: 0, note: "A regulatory decision on the sponsor's trial; not a replication." },
    status: { peerReviewed: false },
    supports: [C("keratinocyte-in-vivo-topical-gene-delivery")] }),
  cl({ id: CL("graftskin-raises-diabetic-ulcer-closure"),
    statement: "Graftskin, a living bilayered skin equivalent, raised complete healing of neuropathic diabetic foot ulcers at 12 weeks to 56% versus 38% with saline-moistened gauze in a 24-centre randomised trial of 208 patients.",
    context: { species: "human", model: "noninfected, nonischaemic chronic plantar diabetic foot ulcer", intervention: "Graftskin applied weekly up to 5 times", comparator: "saline-moistened gauze with standard debridement and off-loading" },
    measurement: { measured: "function", endpoint: "complete wound healing at 12 weeks, intention to treat", effect: "56% (63/112) vs 38% (36/96), P = 0.0042; median time to closure 65 vs 90 days; odds ratio 2.14", uncertainty: "OR 95% CI 1.23–3.74" },
    evidence: [ev(S("veves-2001-diabetescare"), "rct", { n: "208", randomisation: "randomised, multicentre" })],
    rung: "L4",
    replication: { independentGroups: 0, note: "Sponsor-run (Organogenesis). The unaffiliated Dermagraft trial is a different product, so it corroborates the capability, not this claim." },
    status: { peerReviewed: true },
    supports: [C("dermal-substitute-for-chronic-wound-closure")],
    limitations: ["closure endpoint only; scar quality, appendages and sensation not measured"] }),
  cl({ id: CL("dermagraft-raises-diabetic-ulcer-closure"),
    statement: "Dermagraft, a human fibroblast-derived dermal substitute, raised complete closure of chronic diabetic foot ulcers by 12 weeks to 30.0% versus 18.3% with conventional therapy in a 35-centre randomised trial of 314 patients.",
    context: { species: "human", model: "chronic diabetic foot ulcer of >6 weeks", intervention: "Dermagraft", comparator: "conventional therapy with pressure-reducing footwear" },
    measurement: { measured: "function", endpoint: "complete wound closure by week 12", effect: "30.0% (39/130) vs 18.3% (21/115), P = 0.023" },
    evidence: [ev(S("marston-2003-diabetescare"), "rct", { n: "314", randomisation: "randomised, multicentre" })],
    rung: "L4",
    replication: { independentGroups: 0, note: "Sponsor-run (Advanced Tissue Sciences/Smith & Nephew). Together with the Graftskin trial it establishes the capability at L5: two unaffiliated sponsors, two living constructs, same direction of effect." },
    status: { peerReviewed: true },
    supports: [C("dermal-substitute-for-chronic-wound-closure")] }),
  cl({ id: CL("avotermin-improved-scar-appearance-phase-1-2"),
    statement: "Intradermal avotermin (recombinant human TGF-β3) given before and 24 h after wounding improved visual scar scores at 6 and 12 months versus placebo in three double-blind, placebo-controlled, within-participant phase I/II studies in healthy volunteers.",
    context: { species: "human", model: "1 cm full-thickness incisions in healthy volunteers", intervention: "avotermin 0.25–500 ng/100 µL per linear cm, two doses", comparator: "placebo or standard care, within participant" },
    measurement: { measured: "structure", assay: "blinded visual scar assessment (VAS); total scar score", endpoint: "scar appearance at 6 and 12 months", effect: "median VAS improvement 5 mm at 6 months and 8 mm at 12 months at 50 ng; dose-dependent total-score improvement in the third study" },
    evidence: [ev(S("ferguson-2009-lancet"), "rct", { blinding: "double-blind", randomisation: "within-participant", note: "NCT00847925, NCT00847795, NCT00629811" })],
    rung: "L4",
    replication: { independentGroups: 0, note: "Sponsor-run (Renovo). The later phase II (McCollum 2011) is the same sponsor." },
    status: { peerReviewed: true, contradicted: true },
    supports: [C("pharmacological-scar-reduction-in-humans")],
    drift: "The sponsor reported in 2011 that the phase 3 programme failed; no peer-reviewed publication of the phase 3 was located as of 2026-09-11, so the published record still reads as a success.",
    limitations: ["small effect sizes on a visual scale", "healthy-volunteer incisions, not clinical wounds"] }),
  cl({ id: CL("avotermin-phase-2-surgical-scar-improvement"),
    statement: "A single intradermal dose of avotermin 500 ng/100 µL per linear cm at wound closure improved lay-panel groin scar scores versus placebo in a 156-patient double-blind within-patient phase II trial after varicose-vein surgery.",
    context: { species: "human", model: "bilateral saphenofemoral ligation wounds", intervention: "avotermin, four doses tested, given once", comparator: "placebo, contralateral leg" },
    measurement: { measured: "structure", assay: "lay-panel total scar score from VAS, 6 weeks to 7 months", endpoint: "scar appearance", effect: "mean lay-panel score difference 16.49 mm at 500 ng, P = 0.036" },
    evidence: [ev(S("mccollum-2011-bjs"), "rct", { n: "156", blinding: "double-blind", randomisation: "within-patient" })],
    rung: "L4",
    replicates: [CL("avotermin-improved-scar-appearance-phase-1-2")],
    replication: { independentGroups: 0, note: "Same sponsor; not an independent replication." },
    status: { peerReviewed: true, contradicted: true },
    supports: [C("pharmacological-scar-reduction-in-humans")] }),
  cl({ id: CL("fetal-skin-heals-without-scar"),
    statement: "Early-gestation fetal skin, human and animal, heals full-thickness wounds without scar; the transition to scar-forming healing occurs in late gestation and is associated with differences in inflammation, growth-factor profile and extracellular matrix.",
    context: { species: "human and mammalian fetus", model: "fetal cutaneous wounds" },
    measurement: { measured: "structure", endpoint: "histological regeneration versus scar", effect: "scarless regeneration in early gestation; scar after the transition" },
    evidence: [ev(S("larson-2010-prs"), "review")],
    rung: "L5",
    replication: { independentGroups: 2, note: "Review-level synthesis of many groups' observations; primary fetal-surgery series are not attached here." },
    status: { peerReviewed: true },
    supports: [C("fetal-scarless-healing-target-state")],
    limitations: ["an observation of a developmental state, not an intervention"] }),
  cl({ id: CL("thick-engineered-tissue-vascularisation-unsolved"),
    statement: "Vascularisation of engineered tissue beyond the diffusion limit remains an unsolved problem: prevascularisation and angiogenic strategies yield capillary networks in rodent constructs but not organised, stable, clinically usable vasculature in thick human tissue.",
    context: { species: "multiple", model: "engineered and regenerated tissues" },
    measurement: { measured: "none", endpoint: "clinically usable perfused vasculature in thick constructs", effect: "not achieved" },
    evidence: [ev(S("rouwkema-2016-trendsbiotech"), "review"), ev(S("laschke-2016-biotechadv"), "review")],
    rung: "L2",
    replication: { independentGroups: 2, note: "Two independent reviews reaching the same assessment." },
    status: { peerReviewed: true },
    contradicts: [C("organised-microvascular-network-in-regenerated-dermis")],
    limitations: ["reviews; the rung L2 reflects the best demonstrations they survey (rodent)"] }),
  cl({ id: CL("neurotrophins-enhance-angiogenesis-in-engineered-skin"),
    statement: "In a human tissue-engineered skin model, nerve growth factor, BDNF, NT-3 and GDNF enhanced angiogenesis, coupling innervation signals to vascular growth in vitro.",
    context: { species: "human cells in vitro", model: "tissue-engineered skin with endothelial cells", intervention: "neurotrophic factors" },
    measurement: { measured: "structure", assay: "capillary-like network formation", endpoint: "angiogenesis in the construct", effect: "increased capillary-like network formation with neurotrophins" },
    evidence: [ev(S("blais-2013-tissueeng"), "in-vitro")],
    rung: "L1",
    replication: { independentGroups: 0 },
    status: { peerReviewed: true },
    supports: [C("cutaneous-sensory-reinnervation")] }),
  cl({ id: CL("no-therapy-reverses-established-fibrosis"),
    statement: "No approved therapy reverses established organ fibrosis; current antifibrotic drugs slow progression, and fibrosis remains a major cause of irreversible organ dysfunction.",
    context: { species: "human", model: "fibrotic disease across organs" },
    measurement: { measured: "none", endpoint: "reversal of established fibrosis", effect: "not achieved by any approved therapy" },
    evidence: [ev(S("henderson-2020-nature"), "review")],
    rung: "L0",
    replication: { independentGroups: 1, note: "Review-level statement of the field's position." },
    status: { peerReviewed: true },
    contradicts: [C("established-dermal-scar-reversal")] }),
  cl({ id: CL("synthetic-fibrin-crosslinker-induces-haemostasis-in-rodents"),
    statement: "A synthetic polymer that cross-links fibrin modulated clot properties and induced haemostasis in rodent models of bleeding.",
    context: { species: "rodent", model: "bleeding and trauma models", intervention: "intravenous synthetic fibrin cross-linking polymer" },
    measurement: { measured: "function", endpoint: "blood loss and survival", effect: "reduced blood loss / improved haemostasis versus control" },
    evidence: [ev(S("chan-2015-scitranslmed"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 0 },
    status: { peerReviewed: true },
    supports: [C("synthetic-haemostat-for-noncompressible-haemorrhage")] }),
  cl({ id: CL("osk-reprogramming-restores-vision-in-mice"),
    statement: "Ectopic expression of Oct4, Sox2 and Klf4 in mouse retinal ganglion cells restored youthful DNA-methylation patterns and transcriptomes, promoted axon regeneration after injury, and reversed vision loss in a glaucoma model and in aged mice, dependent on TET1/TET2.",
    context: { species: "mouse (NCBITaxon:10090)", model: "optic nerve crush; glaucoma model; aged mice", cellType: "retinal ganglion cell", intervention: "AAV-delivered inducible OSK" },
    measurement: { measured: "function", assay: "DNA methylation age; transcriptomics; axon regeneration; visual acuity", endpoint: "vision restoration", effect: "reversal of vision loss in glaucoma and aged mice" },
    evidence: [ev(S("lu-2020-nature"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 0, note: "One group (Sinclair). Independent replication not cited here." },
    status: { peerReviewed: true },
    supports: [C("safe-partial-epigenetic-reprogramming-in-vivo"), C("cell-identity-retention-under-partial-reprogramming")] }),
  cl({ id: CL("cyclic-partial-reprogramming-ameliorates-aging-in-mice"),
    statement: "Short-term cyclic expression of OSKM in vivo ameliorated cellular and physiological hallmarks of aging and prolonged lifespan in a progeroid mouse model, and improved recovery from metabolic disease and muscle injury in aged wild-type mice, without teratoma formation.",
    context: { species: "mouse (NCBITaxon:10090)", model: "LAKI progeria model; aged wild-type mice", intervention: "cyclic doxycycline-induced OSKM" },
    measurement: { measured: "function", assay: "aging hallmarks; lifespan; injury recovery", endpoint: "lifespan and recovery", effect: "prolonged lifespan in progeroid mice; improved recovery in aged mice" },
    evidence: [ev(S("ocampo-2016-cell"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 0, note: "One group (Izpisua Belmonte). Later partial-reprogramming studies by other groups exist but are not cited here." },
    status: { peerReviewed: true },
    supports: [C("safe-partial-epigenetic-reprogramming-in-vivo"), C("cell-identity-retention-under-partial-reprogramming")],
    limitations: ["progeroid model for the lifespan result", "safe expression window narrow; continuous expression is lethal in the same system"] }),
  cl({ id: CL("iv-aav9-human-cns-transduction-rests-on-two-autopsies"),
    statement: "Direct evidence that intravenous AAV9 (onasemnogene abeparvovec) transduces the human central nervous system rests on post-mortem tissue from two treated infants, with vector genomes in liver hundreds-fold higher than in CNS.",
    context: { species: "human", model: "spinal muscular atrophy, infants", intervention: "single intravenous AAV9 dose", route: "intravenous" },
    measurement: { measured: "transduction", assay: "vector DNA, mRNA and SMN protein in post-mortem tissue", endpoint: "CNS biodistribution", effect: "vector detected in CNS at levels far below liver; n=2" },
    evidence: [ev(S("thomsen-2021-natmed"), "case-series", { n: "2" })],
    rung: "L4",
    replication: { independentGroups: 0, note: "Sponsor-affiliated analysis; clinical benefit in SMA is replicated, CNS transduction evidence is not." },
    status: { peerReviewed: true },
    supports: [C("systemic-cell-type-specific-delivery")],
    drift: "'Proves IV AAV9 transduces human CNS' — two autopsies; clinical benefit is offered as transduction evidence, but it is not." })
];

/* -------------------------------------------------------------------- main */

(async () => {
  console.log("seeding records/graph …");
  await buildSources();
  GOALS.forEach((g) => write("goals", { type: "goal", ...g, provenance: prov(AUTHORED), review: REVIEW }));
  CAPABILITIES.forEach((c) => { const { evidenceAccessed, ...rest } = c; write("capabilities", rest); });
  QUESTIONS.forEach((x) => write("questions", x));
  CLAIMS.forEach((x) => write("claims", x));
  EXPERIMENTS.forEach((x) => write("experiments", x));
  console.log(`  written ${written}, skipped (already present) ${skipped}`);
  console.log("now run: node scripts/build.mjs");
})().catch((e) => { console.error(e); process.exit(1); });

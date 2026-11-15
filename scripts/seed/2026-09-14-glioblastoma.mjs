/* Seed: proving ground 6 — glioblastoma.
 *
 * Provenance, not a build step (see scripts/lib/seed.mjs). Sources come from live Crossref and
 * PubMed lookups; every other record was authored by the session below from those sources'
 * abstracts and enters the map as `ai-proposed`. Nothing here has been read at figure level.
 *
 * Why this ground: it is the honest stress test for "repair any damage". Median survival with
 * the standard of care has moved by months since 2005 and the disease is uniformly fatal.
 * Everything that fails here fails for reasons the rest of the map also has to solve — getting
 * a drug past the blood-brain barrier, acting on a cell population that is heterogeneous and
 * plastic, and removing damage that is wired into the tissue you must not remove. It also has
 * the field's most recent genuine signal: CAR T cells given intraventricularly produced rapid
 * tumour regression in 2024, and the regressions were not durable.
 *
 * Run:  node scripts/seed/2026-09-14-glioblastoma.mjs [--force]
 * Then: node scripts/build.mjs */

import { makeSeed, ids } from "../lib/seed.mjs";

const { S, G, C, Q, CL, E, CELL } = ids;
const DATE = "2026-09-14";
const seed = makeSeed({
  date: DATE,
  actor: { type: "ai", name: "Claude Code session b1762020 (Anthropic)", model: "claude-opus-5", session: "b1762020-2a53-4f0e-8cbd-18239bda19a3" },
  authored: "manual reasoning from the cited sources' abstracts (Crossref/Europe PMC), checked 2026-09-14; no source opened at figure level",
  script: "scripts/seed/2026-09-14-glioblastoma.mjs"
});
const { goal, cap, q, ex, cl, ev, run } = seed;
const UR = ["universal-repair"];

const SOURCES = [
  { slug: "stupp-2005-nejm", doi: "10.1056/NEJMoa043330", note: "The trial that set the standard of care." },
  { slug: "stupp-2017-jama", doi: "10.1001/jama.2017.18718", note: "Tumour-treating fields." },
  { slug: "brown-2016-nejm", doi: "10.1056/NEJMoa1610497", note: "IL13Ralpha2 CAR T, intraventricular, one patient with regression." },
  { slug: "orourke-2017-scitranslmed", doi: "10.1126/scitranslmed.aaa0984", note: "Intravenous EGFRvIII CAR T: trafficking shown, antigen loss shown, no clinical benefit." },
  { slug: "bagley-2024-natmed", doi: "10.1038/s41591-024-02893-z", note: "Intrathecal bivalent EGFR/IL13Ralpha2 CAR T." },
  { slug: "choi-2024-nejm", doi: "10.1056/NEJMoa2314390", note: "CARv3-TEAM-E, intraventricular; rapid regression, limited durability." },
  { slug: "weller-2017-lancetoncol", doi: "10.1016/S1470-2045(17)30517-X", note: "ACT IV: rindopepimut phase 3, negative." },
  { slug: "reardon-2020-jamaoncol", doi: "10.1001/jamaoncol.2020.1024", note: "CheckMate 143: nivolumab, negative." },
  { slug: "cloughesy-2019-natmed", doi: "10.1038/s41591-018-0337-7", note: "Neoadjuvant anti-PD-1: survival signal with immune correlates." },
  { slug: "desjardins-2018-nejm", doi: "10.1056/NEJMoa1716435", note: "Recombinant poliovirus: a tail of long survivors without an overall shift." },
  { slug: "patel-2014-science", doi: "10.1126/science.1254257" },
  { slug: "neftel-2019-cell", doi: "10.1016/j.cell.2019.06.024" },
  { slug: "sarkaria-2018-neurooncol", doi: "10.1093/neuonc/nox175", note: "Is the blood-brain barrier really disrupted in all glioblastomas?" },
  { slug: "carpentier-2016-scitranslmed", doi: "10.1126/scitranslmed.aaf6086", note: "Pulsed ultrasound barrier disruption in patients." },
  { slug: "venkataramani-2019-nature", doi: "10.1038/s41586-019-1564-x", note: "Glioma cells receive synaptic input from neurons." }
];

const GOALS = [
  goal({
    id: G("glioblastoma-control"), name: "Control of a glioblastoma",
    parent: G("universal-repair"),
    description: "Remove or permanently control a diffuse malignant glioma without removing the brain it is growing through, and restore the neurological function the tumour and its treatment took. The hardest case on the universal-repair map: the damage is made of the patient's own cells, it is wired into functioning tissue, and the tissue cannot be replaced.",
    projections: UR,
    existenceProof: "None. No treatment has produced durable remission in a substantial fraction of patients. There are long survivors in several trials, including after oncolytic poliovirus, but no intervention has shifted the survival curve as a whole beyond the months added by the 2005 standard of care.",
    requires: [
      { all: [C("gbm-tumour-cell-eradication"), C("gbm-infiltrative-margin-clearance"), C("cns-drug-delivery-past-the-barrier"), C("gbm-antigen-escape-prevention")] },
      { any: [C("gbm-immune-cell-therapy"), C("gbm-targeted-cytotoxic-therapy")], note: "OR-group: turn the immune system on it, or deliver something that kills it. Neither is currently sufficient; the map does not pick a winner." }
    ],
    blockedBy: [Q("gbm-response-durability"), Q("gbm-heterogeneity-defeats-single-target"), Q("bbb-really-the-delivery-limit")],
    testSuite: [
      { scenario: "resect the visible tumour", state: "routine", note: "maximal safe resection is standard; the tumour has already infiltrated beyond it" },
      { scenario: "extend median survival with chemoradiation", state: "partial", note: "months, established since 2005" },
      { scenario: "shrink a recurrent tumour with cell therapy", state: "partial", note: "rapid regression reported in 2024, not durable" },
      { scenario: "clear infiltrating cells from functioning brain", state: "unsolved" },
      { scenario: "durable remission", state: "unsolved" }
    ],
    informationLimited: false
  }),
  goal({
    id: G("gbm-bulk-and-margin"), name: "The tumour and everything it has spread into",
    parent: G("glioblastoma-control"),
    description: "Deal with both the visible mass and the cells that have already migrated along white matter tracts and blood vessels into brain that must be preserved.",
    projections: UR,
    requires: [{ all: [C("gbm-tumour-cell-eradication"), C("gbm-infiltrative-margin-clearance")] }],
    blockedBy: [Q("gbm-heterogeneity-defeats-single-target")]
  }),
  goal({
    id: G("gbm-reaching-the-tumour"), name: "Getting the therapy to the tumour",
    parent: G("glioblastoma-control"),
    description: "Deliver a drug, antibody or cell therapy to tumour cells throughout the brain, including the infiltrating cells behind an intact blood-brain barrier.",
    projections: UR,
    requires: [{ all: [C("cns-drug-delivery-past-the-barrier")] }],
    blockedBy: [Q("bbb-really-the-delivery-limit")]
  })
];

const CAPABILITIES = [
  cap({
    id: C("gbm-tumour-cell-eradication"), name: "Kill the tumour cells that are there", class: "control", primitive: "remove", projections: UR,
    description: "Eliminate the bulk glioblastoma population — surgically, with radiation and chemotherapy, or with a targeted agent — measured by radiographic response.",
    grade: { basis: "claims", rung: "L5", measured: "function", blocked: "science", note: "Radiotherapy with concomitant and adjuvant temozolomide extended median survival from 12.1 to 14.6 months and two-year survival from 10% to 26% in a randomised phase 3 trial (Stupp 2005), and alternating electric fields added a further increment (Stupp 2017). This is L5 for the intervention and a statement about the disease: two decades of standard care buys months. The tumour is not eradicated in anyone.", drift: "'Standard of care for glioblastoma' sounds like treatment with intent to cure. Median survival is under two years." },
    wouldMove: "Any intervention that shifts the whole survival curve rather than adding months to the median.",
    evidenceAccessed: [S("stupp-2005-nejm"), S("stupp-2017-jama")]
  }),
  cap({
    id: C("gbm-infiltrative-margin-clearance"), name: "Clear the cells that have already spread into working brain", class: "control", primitive: "remove", projections: UR,
    description: "Eliminate the individual tumour cells that have migrated along tracts and vessels into brain that must keep working, where surgery and focal radiation cannot go.",
    target: { node: CELL("glia") },
    grade: { basis: "no-evidence-located", rung: "L0", searchedOn: DATE, note: "Placed so the gap is visible. Recurrence at the margin is the near-universal pattern of failure, and no therapy is directed at the infiltrating population specifically. Glioma cells receiving synaptic input from neurons (Venkataramani 2019) suggests why they are hard to separate from the tissue: they are electrically integrated into it. Grading this node is one of the map's more consequential open tasks." },
    wouldMove: "Any therapy with a measured effect on the infiltrating population as distinct from the enhancing mass.",
    evidenceAccessed: [S("venkataramani-2019-nature")]
  }),
  cap({
    id: C("cns-drug-delivery-past-the-barrier"), name: "Get the therapy past the blood-brain barrier", class: "reach", primitive: "preserve", projections: UR,
    description: "Deliver a therapeutic agent or cell to tumour throughout the brain, including where the barrier is intact around infiltrating cells.",
    target: { node: CELL("cns-neuron") },
    grade: { basis: "claims", rung: "L4", measured: "access", blocked: "science", note: "Pulsed ultrasound with microbubbles opened the barrier repeatedly and safely in patients (Carpentier 2016) — access demonstrated in humans. Intraventricular and intrathecal routes bypass the barrier and reach tumour, as the CAR T studies show. What is not solved is reaching infiltrating cells behind an intact barrier across the whole brain, and Sarkaria's review argues the barrier is far less disrupted in glioblastoma than the enhancing-tumour picture suggests. See also the map's CNS delivery module for the 16 routes.", drift: "'The blood-brain barrier is broken in glioblastoma, so drugs get in' — it is disrupted where the tumour enhances on imaging and intact around the cells that cause recurrence." },
    wouldMove: "Measured drug concentration at the infiltrating margin, in patients, at a level shown to be cytotoxic.",
    evidenceAccessed: [S("carpentier-2016-scitranslmed"), S("sarkaria-2018-neurooncol")]
  }),
  cap({
    id: C("gbm-immune-cell-therapy"), name: "Turn engineered immune cells on the tumour", class: "control", primitive: "remove", projections: UR,
    description: "Direct CAR T cells or another engineered immune population against glioblastoma, delivered where they can reach it.",
    grade: { basis: "claims", rung: "L4", measured: "structure", blocked: "science", note: "Intraventricular IL13Ralpha2 CAR T produced regression of all intracranial and spinal tumours in one patient for 7.5 months (Brown 2016); intrathecal bivalent EGFR/IL13Ralpha2 CAR T produced early tumour reduction in three patients (Bagley 2024); intraventricular CARv3-TEAM-E produced dramatic regression within days in three patients, transient in two (Choi 2024). Human, radiographic, reproducible across three groups — and in almost every case the tumour came back. Intravenous EGFRvIII CAR T trafficked to tumour and drove antigen loss without clinical benefit (O'Rourke 2017).", drift: "The 2024 reports were covered as a breakthrough. They are the first reproducible rapid regressions in this disease and they are, so far, temporary." },
    wouldMove: "A response lasting beyond a year in a substantial fraction of treated patients, or a trial with a survival endpoint that succeeds.",
    evidenceAccessed: [S("brown-2016-nejm"), S("bagley-2024-natmed"), S("choi-2024-nejm"), S("orourke-2017-scitranslmed")]
  }),
  cap({
    id: C("gbm-targeted-cytotoxic-therapy"), name: "Kill it with something aimed at what makes it a tumour", class: "control", primitive: "remove", projections: UR,
    description: "Attack glioblastoma through a target specific to it — a mutated antigen, an oncolytic virus, a checkpoint — rather than with untargeted cytotoxicity.",
    grade: { basis: "claims", rung: "L5", measured: "none", blocked: "science", note: "This node is graded on failures, which is why measured is 'none'. The EGFRvIII vaccine rindopepimut failed a randomised phase 3 (Weller 2017); nivolumab failed against bevacizumab in recurrent disease (Reardon 2020). Neoadjuvant anti-PD-1 showed a survival signal with immune correlates in a small randomised study (Cloughesy 2019), and recombinant poliovirus produced a tail of long survivors without shifting the overall curve (Desjardins 2018). L5 records that this approach has been tested to phase 3 in humans; the blocked reason is that it did not work.", drift: "Long survivors in single-arm oncolytic trials are frequently presented as efficacy. A survival tail without a control arm is a selection observation." },
    wouldMove: "A randomised trial of a targeted or immunotherapeutic agent with an overall survival benefit.",
    evidenceAccessed: [S("weller-2017-lancetoncol"), S("reardon-2020-jamaoncol"), S("cloughesy-2019-natmed"), S("desjardins-2018-nejm")]
  }),
  cap({
    id: C("gbm-antigen-escape-prevention"), name: "Stop the tumour changing to escape the therapy", class: "control", primitive: "stop", projections: UR,
    description: "Prevent glioblastoma from losing the antigen or switching cell state under treatment pressure, which is how it defeats every single-target therapy tried so far.",
    grade: { basis: "claims", rung: "L2", measured: "biomarker", blocked: "science", note: "Antigen loss under therapy is documented in patients: EGFRvIII expression decreased in most tumours after CAR T infusion (O'Rourke 2017), and single-cell studies show glioblastoma cells occupy four interconvertible states with plasticity between them (Neftel 2019, Patel 2014). Multi-antigen targeting is the response and has reached patients (Bagley 2024), but no strategy has been shown to prevent escape.", drift: "Bivalent and multivalent constructs are described as solving antigen escape. They have been shown to be deliverable, not to prevent escape." },
    wouldMove: "A multi-target or state-agnostic therapy in which the recurrent tumour retains the target.",
    evidenceAccessed: [S("orourke-2017-scitranslmed"), S("neftel-2019-cell"), S("patel-2014-science"), S("bagley-2024-natmed")]
  })
];

const QUESTIONS = [
  q({
    id: Q("gbm-response-durability"), projections: UR,
    question: "Why do the rapid CAR T regressions in glioblastoma not last, and can they be made durable?",
    why: "Three independent groups have now shown that a glioblastoma can be made to shrink dramatically within days. That is new, and it is the first time the disease has been visibly moved by anything other than radiation. The whole question is why it comes back.",
    blocks: [C("gbm-immune-cell-therapy"), C("gbm-antigen-escape-prevention"), G("glioblastoma-control")],
    hypotheses: [
      "Antigen-negative subclones survive and regrow, so durability requires multi-antigen or antigen-agnostic targeting.",
      "CAR T cells do not persist in the CNS, and repeated or continuously supplied dosing would hold the response.",
      "The microenvironment exhausts the T cells within weeks regardless of antigen.",
      "The infiltrating population is never engaged at all, and the visible regression is only the bulk."
    ],
    knownUnknowns: ["whether recurrent tumours after CAR T are antigen-negative or antigen-positive", "CAR T persistence in CSF over months", "whether repeat dosing extends response"],
    whatWouldResolve: "Paired biopsies before treatment and at recurrence in the treated patients, with antigen expression and T cell persistence, from the existing trials."
  }),
  q({
    id: Q("gbm-heterogeneity-defeats-single-target"), projections: UR,
    question: "Is glioblastoma's cellular plasticity a hard barrier to any single-target therapy, or can a small number of targets cover the states a tumour can occupy?",
    why: "It determines whether the therapeutic strategy for this disease is 'find the right target' or 'stop looking for targets'. Every failed phase 3 on this ground was single-target.",
    blocks: [C("gbm-antigen-escape-prevention"), C("gbm-targeted-cytotoxic-therapy"), G("gbm-bulk-and-margin")],
    hypotheses: [
      "Four states with defined transitions means a four-target therapy is sufficient in principle.",
      "Plasticity is continuous and driven by the microenvironment, so any fixed target set is escapable.",
      "A lineage-defining dependency exists that all states share and has not been found."
    ],
    knownUnknowns: ["whether the four-state model holds under therapeutic pressure rather than at diagnosis", "whether state transitions are reversible in the timescale of treatment"],
    whatWouldResolve: "Single-cell profiling of paired pre-treatment and recurrent tumours across a treated cohort, testing whether recurrence occupies a state that was present and untargeted at baseline."
  }),
  q({
    id: Q("bbb-really-the-delivery-limit"), projections: UR,
    question: "How much of the failure of systemic therapy in glioblastoma is the blood-brain barrier, and how much is that the drugs would not work even at full concentration?",
    why: "An enormous amount of effort goes into opening the barrier. If the drugs delivered through it are ineffective anyway, that effort is misdirected, and the map should say which of the two problems is binding.",
    blocks: [C("cns-drug-delivery-past-the-barrier"), C("gbm-targeted-cytotoxic-therapy"), G("gbm-reaching-the-tumour")],
    hypotheses: [
      "The barrier is intact around infiltrating cells and is the binding constraint there, even where the enhancing core is exposed.",
      "Concentrations reached in the core are already adequate and the drugs simply are not active against the tumour.",
      "Efflux transporters, not the tight junctions, are the real limit."
    ],
    knownUnknowns: ["drug concentration at the infiltrating margin in patients, which few trials measure", "whether ultrasound opening reaches the margin or only the core"],
    whatWouldResolve: "Phase 0 trials with tissue sampling at the margin: give the drug, resect, and measure the concentration and its pharmacodynamic effect where recurrence starts."
  })
];

const CLAIMS = [
  cl({
    id: CL("temozolomide-chemoradiation-extends-gbm-survival-by-months"),
    statement: "Radiotherapy with concomitant and adjuvant temozolomide extended median survival in newly diagnosed glioblastoma from 12.1 to 14.6 months, and two-year survival from 10% to 26%, compared with radiotherapy alone.",
    context: { species: "human", model: "newly diagnosed glioblastoma", intervention: "radiotherapy plus temozolomide", comparator: "radiotherapy alone" },
    measurement: { measured: "function", assay: "overall survival", endpoint: "median and two-year survival", effect: "+2.5 months median; 10% to 26% at two years" },
    evidence: [ev(S("stupp-2005-nejm"), "rct")],
    rung: "L5",
    replication: { independentGroups: 2, note: "Adopted worldwide as the standard of care and confirmed in subsequent cohorts." },
    status: { peerReviewed: true },
    supports: [C("gbm-tumour-cell-eradication")],
    limitations: ["the benefit is measured in months and no patient is cured"]
  }),
  cl({
    id: CL("tumour-treating-fields-add-survival-in-gbm"),
    statement: "Adding alternating electric fields to maintenance temozolomide improved progression-free and overall survival in newly diagnosed glioblastoma in a randomised trial.",
    context: { species: "human", model: "newly diagnosed glioblastoma after chemoradiation", intervention: "tumour-treating fields plus temozolomide", comparator: "temozolomide alone" },
    measurement: { measured: "function", assay: "overall and progression-free survival", endpoint: "survival", effect: "improved with the addition of fields" },
    evidence: [ev(S("stupp-2017-jama"), "rct")],
    rung: "L5",
    replication: { independentGroups: 0, note: "One sponsor-run trial; the open-label design and device adherence have been debated." },
    status: { peerReviewed: true },
    supports: [C("gbm-tumour-cell-eradication")],
    limitations: ["open-label", "device worn continuously", "one trial"]
  }),
  cl({
    id: CL("intraventricular-car-t-produces-rapid-but-transient-gbm-regression"),
    statement: "CAR T cells delivered into the ventricles or intrathecally produced rapid, radiographically dramatic regression of recurrent glioblastoma in a small number of patients; in most, the tumour progressed again within months.",
    context: { species: "human", model: "recurrent glioblastoma", intervention: "intraventricular or intrathecal CAR T (IL13Ralpha2; bivalent EGFR/IL13Ralpha2; CARv3-TEAM-E)" },
    measurement: { measured: "structure", assay: "MRI response", endpoint: "radiographic tumour response and its duration", effect: "regression within days to weeks; durable in a minority" },
    evidence: [ev(S("brown-2016-nejm"), "case-report", { n: "1" }), ev(S("bagley-2024-natmed"), "case-series", { n: "3" }), ev(S("choi-2024-nejm"), "case-series", { n: "3" })],
    rung: "L4",
    replication: { independentGroups: 2, note: "Three groups (City of Hope; Penn; Mass General), three different constructs, the same pattern of rapid response and limited durability." },
    status: { peerReviewed: true },
    supports: [C("gbm-immune-cell-therapy")],
    drift: "'CAR T shrinks brain tumours' is accurate and is not the same as 'CAR T treats glioblastoma'. Seven patients across three reports, and the tumours came back in most of them.",
    limitations: ["single-digit patient numbers", "radiographic endpoints", "no survival comparison"]
  }),
  cl({
    id: CL("systemic-car-t-drives-antigen-loss-in-gbm"),
    statement: "A single intravenous dose of EGFRvIII-directed CAR T cells trafficked to glioblastoma and was followed by loss of EGFRvIII expression in most resected tumours, with no clinical benefit observed.",
    context: { species: "human", model: "recurrent EGFRvIII-positive glioblastoma", intervention: "intravenous EGFRvIII CAR T" },
    measurement: { measured: "biomarker", assay: "tumour histology and antigen expression after infusion", endpoint: "CAR T trafficking and antigen expression", effect: "trafficking confirmed; EGFRvIII decreased in most tumours; no clinical benefit" },
    evidence: [ev(S("orourke-2017-scitranslmed"), "case-series", { n: "10" })],
    rung: "L4",
    replication: { independentGroups: 0 },
    status: { peerReviewed: true },
    supports: [C("gbm-antigen-escape-prevention")],
    contradicts: [C("gbm-immune-cell-therapy")],
    limitations: ["ten patients", "antigen loss inferred from post-treatment resection specimens"]
  }),
  cl({
    id: CL("single-target-gbm-immunotherapies-failed-phase-3"),
    statement: "The EGFRvIII vaccine rindopepimut failed to improve survival in a randomised phase 3 trial of newly diagnosed glioblastoma, and nivolumab failed to improve survival against bevacizumab in recurrent glioblastoma.",
    context: { species: "human", model: "newly diagnosed and recurrent glioblastoma", intervention: "rindopepimut; nivolumab", comparator: "control vaccine; bevacizumab" },
    measurement: { measured: "function", assay: "overall survival", endpoint: "survival", effect: "no improvement in either trial" },
    evidence: [ev(S("weller-2017-lancetoncol"), "rct"), ev(S("reardon-2020-jamaoncol"), "rct")],
    rung: "L5",
    replication: { independentGroups: 2, note: "Two independent randomised phase 3 programmes, both negative." },
    status: { peerReviewed: true },
    contradicts: [C("gbm-targeted-cytotoxic-therapy")],
    limitations: ["both tested one target or one checkpoint at a time, which is the pattern the heterogeneity question is about"]
  }),
  cl({
    id: CL("neoadjuvant-pd1-shows-a-survival-signal-in-recurrent-gbm"),
    statement: "Giving anti-PD-1 before surgery, rather than only after, was associated with longer survival and with interferon and T cell changes in the tumour, in a small randomised study of recurrent glioblastoma.",
    context: { species: "human", model: "recurrent resectable glioblastoma", intervention: "neoadjuvant pembrolizumab", comparator: "adjuvant only" },
    measurement: { measured: "function", assay: "overall survival; tumour transcriptomics and T cell repertoire", endpoint: "survival with immune correlates", effect: "longer survival in the neoadjuvant arm" },
    evidence: [ev(S("cloughesy-2019-natmed"), "rct", { n: "35" })],
    rung: "L4",
    replication: { independentGroups: 0, note: "One small randomised study; not confirmed in a larger trial." },
    status: { peerReviewed: true },
    supports: [C("gbm-targeted-cytotoxic-therapy")],
    limitations: ["35 patients", "survival difference in a small trial with correlative endpoints"]
  }),
  cl({
    id: CL("oncolytic-poliovirus-produces-a-survival-tail-not-a-shift"),
    statement: "Intratumoral recombinant non-pathogenic poliovirus in recurrent glioblastoma produced a plateau of long-term survivors at 24 and 36 months, without improving median survival compared with a historical control group.",
    context: { species: "human", model: "recurrent glioblastoma", intervention: "intratumoral PVSRIPO", comparator: "historical controls" },
    measurement: { measured: "function", assay: "overall survival", endpoint: "survival distribution", effect: "survival plateau at 21% at 24 and 36 months; median unchanged" },
    evidence: [ev(S("desjardins-2018-nejm"), "case-series", { n: "61" })],
    rung: "L4",
    replication: { independentGroups: 0, note: "One centre, historical control comparison." },
    status: { peerReviewed: true },
    supports: [C("gbm-targeted-cytotoxic-therapy")],
    drift: "The survival tail was reported widely as a cure signal. Against historical controls, in a selected single-centre cohort, a tail is a hypothesis.",
    limitations: ["historical controls", "single centre", "selection of patients able to receive intratumoral infusion"]
  }),
  cl({
    id: CL("glioblastoma-cells-occupy-interconvertible-states"),
    statement: "Single-cell profiling shows that glioblastoma cells within one tumour occupy four main cellular states, influenced by genetics and the microenvironment, and can transition between them.",
    context: { species: "human", model: "primary glioblastoma tumours, single-cell RNA sequencing" },
    measurement: { measured: "structure", assay: "single-cell RNA sequencing; lineage and state analysis", endpoint: "intratumoral heterogeneity and plasticity", effect: "four interconvertible states within individual tumours" },
    evidence: [ev(S("neftel-2019-cell"), "observational-human"), ev(S("patel-2014-science"), "observational-human")],
    rung: "L5",
    replication: { independentGroups: 2, note: "Two independent studies, five years apart, in human tumours." },
    status: { peerReviewed: true },
    supports: [C("gbm-antigen-escape-prevention")],
    contradicts: [C("gbm-targeted-cytotoxic-therapy")]
  }),
  cl({
    id: CL("bbb-is-intact-in-much-of-a-glioblastoma"),
    statement: "The blood-brain barrier is substantially intact in much of a glioblastoma, particularly at the infiltrating margin where recurrence arises, despite contrast enhancement in the tumour core.",
    context: { species: "human", model: "glioblastoma imaging and tissue pharmacology" },
    measurement: { measured: "access", assay: "imaging and drug distribution studies reviewed", endpoint: "barrier integrity and drug penetration across the tumour", effect: "enhancement marks disruption in the core; the margin remains protected" },
    evidence: [ev(S("sarkaria-2018-neurooncol"), "review")],
    rung: "L4",
    replication: { independentGroups: 1, note: "A critical review synthesising imaging and pharmacological studies." },
    status: { peerReviewed: true },
    supports: [C("cns-drug-delivery-past-the-barrier")],
    drift: "The assumption that the barrier is broken in glioblastoma has justified systemic trials of drugs that never reached the cells that matter."
  }),
  cl({
    id: CL("pulsed-ultrasound-opens-the-barrier-in-patients"),
    statement: "Pulsed ultrasound with an implanted device and intravenous microbubbles repeatedly and safely opened the blood-brain barrier in patients with recurrent glioblastoma, demonstrated by contrast enhancement.",
    context: { species: "human", model: "recurrent glioblastoma", intervention: "implantable pulsed ultrasound plus microbubbles before chemotherapy" },
    measurement: { measured: "access", assay: "contrast-enhanced MRI; safety", endpoint: "barrier opening", effect: "repeated transient opening without significant toxicity" },
    evidence: [ev(S("carpentier-2016-scitranslmed"), "case-series", { n: "15" })],
    rung: "L4",
    replication: { independentGroups: 1, note: "Reproduced by other groups with focused ultrasound since; those reports are not cited here." },
    status: { peerReviewed: true },
    supports: [C("cns-drug-delivery-past-the-barrier")],
    limitations: ["access demonstrated, not a survival benefit", "opening is local and transient"]
  }),
  cl({
    id: CL("glioma-cells-receive-synaptic-input-from-neurons"),
    statement: "Glioma cells form functional glutamatergic synapses with neurons, and this synaptic input drives tumour progression and invasion.",
    context: { species: "human tissue and mouse xenograft", model: "glioma cells in brain", intervention: "none (mechanistic)" },
    measurement: { measured: "structure", assay: "electrophysiology, electron microscopy, calcium imaging", endpoint: "neuron-to-glioma synaptic transmission and its effect on growth", effect: "functional synapses that promote invasion and growth" },
    evidence: [ev(S("venkataramani-2019-nature"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 2, note: "Reported simultaneously by more than one group in 2019; the companion studies are not cited here." },
    status: { peerReviewed: true },
    supports: [C("gbm-infiltrative-margin-clearance")],
    limitations: ["mechanistic; no therapy follows from it yet"]
  })
];

const EXPERIMENTS = [
  ex({
    id: E("paired-biopsy-at-car-t-recurrence"), name: "Paired pre-treatment and recurrence biopsies in CAR T-treated glioblastoma",
    tests: [Q("gbm-response-durability"), Q("gbm-heterogeneity-defeats-single-target")], status: "proposed",
    design: { species: "human", model: "patients treated with intraventricular or intrathecal CAR T in existing trials", intervention: "none additional: tissue and CSF sampling at baseline and at progression", comparator: "the patient's own baseline tumour", readout: "antigen expression, single-cell state composition, CAR T persistence and phenotype in CSF over time", duration: "2 years within existing trials", n: "20-30 across centres" },
    discriminates: "Antigen-negative recurrence points at multi-target therapy; antigen-positive recurrence with absent CAR T points at persistence and exhaustion; a recurrence in a state that was present and untargeted at baseline supports the plasticity hypothesis.",
    feasibility: { costClass: "low", durationClass: "years", requires: ["consent for repeat sampling in existing trials", "single-cell sequencing", "a shared protocol across the three active centres"], ethics: "amendment to existing trial approvals" }
  }),
  ex({
    id: E("phase-0-margin-concentration-study"), name: "Phase 0 study measuring drug concentration at the infiltrating margin",
    tests: [Q("bbb-really-the-delivery-limit")], status: "proposed",
    design: { species: "human", model: "patients undergoing resection for glioblastoma", intervention: "the candidate drug given before surgery, with and without ultrasound barrier opening", comparator: "core versus margin tissue within each patient", readout: "drug concentration and a pharmacodynamic marker of target engagement in core and margin tissue", duration: "18 months", n: "20-30" },
    discriminates: "Adequate concentration at the margin with no pharmacodynamic effect would show the drug is the problem; inadequate concentration would show delivery is, and would tell the field whether barrier opening actually reaches the margin.",
    feasibility: { costClass: "low", durationClass: "months", requires: ["a neurosurgical centre with phase 0 infrastructure", "tissue pharmacokinetics", "image-guided margin sampling"], ethics: "human research ethics approval" }
  })
];

run({ SOURCES, GOALS, CAPABILITIES, QUESTIONS, CLAIMS, EXPERIMENTS });

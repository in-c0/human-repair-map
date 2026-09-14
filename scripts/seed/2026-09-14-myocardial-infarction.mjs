/* Seed: proving ground 4 — repair of the heart after a myocardial infarction.
 *
 * Provenance, not a build step (see scripts/lib/seed.mjs). Sources come from live Crossref and
 * PubMed lookups; every other record was authored by the session below from those sources'
 * abstracts and enters the map as `ai-proposed`. Nothing here has been read at figure level.
 *
 * Why this ground: the heart is where acute rescue has been solved and repair has not. Primary
 * angioplasty saves the patient within hours; the dead muscle is then replaced by scar, and the
 * human heart renews cardiomyocytes at well under one per cent a year, so the loss is permanent.
 * It is also the ground with the field's most instructive negative result — a decade of adult
 * stem cell trials with no effect on function in meta-analysis — and its clearest unresolved
 * safety problem: every remuscularisation that has worked in a primate has caused arrhythmia.
 *
 * Run:  node scripts/seed/2026-09-14-myocardial-infarction.mjs [--force]
 * Then: node scripts/build.mjs */

import { makeSeed, ids } from "../lib/seed.mjs";

const { S, G, C, Q, CL, E, CELL } = ids;
const DATE = "2026-09-14";
const seed = makeSeed({
  date: DATE,
  actor: { type: "ai", name: "Claude Code session b1762020 (Anthropic)", model: "claude-opus-5", session: "b1762020-2a53-4f0e-8cbd-18239bda19a3" },
  authored: "manual reasoning from the cited sources' abstracts (Crossref/Europe PMC), checked 2026-09-14; no source opened at figure level",
  script: "scripts/seed/2026-09-14-myocardial-infarction.mjs"
});
const { goal, cap, q, ex, cl, ev, run } = seed;
const UR = ["universal-repair"];
const both = ["universal-repair", "rejuvenation"];

const SOURCES = [
  { slug: "keeley-2003-lancet", doi: "10.1016/S0140-6736(03)12113-7", note: "Meta-analysis: primary angioplasty versus thrombolysis." },
  { slug: "bergmann-2009-science", doi: "10.1126/science.1164680", note: "Carbon-14 birth dating of human cardiomyocytes." },
  { slug: "porrello-2011-science", doi: "10.1126/science.1200708", note: "Neonatal mouse heart regeneration, lost within a week of birth." },
  { slug: "chong-2014-nature", doi: "10.1038/nature13233" },
  { slug: "liu-2018-natbiotech", doi: "10.1038/nbt.4162" },
  { slug: "romagnuolo-2019-scr", doi: "10.1016/j.stemcr.2019.04.005" },
  { slug: "gyongyosi-2015-circres", doi: "10.1161/CIRCRESAHA.116.304346", note: "ACCRUE: individual patient data meta-analysis of cell therapy after MI." },
  { slug: "menasche-2018-jacc", doi: "10.1016/j.jacc.2017.11.047", note: "ESCORT: first-in-human embryonic-stem-cell-derived cardiovascular progenitor patch." },
  { slug: "mohamed-2018-cell", doi: "10.1016/j.cell.2018.02.014", note: "Cell cycle regulators driving adult cardiomyocyte division." },
  { slug: "gabisonia-2019-nature", doi: "10.1038/s41586-019-1191-6", note: "miR-199a in pigs: cardiac repair, then uncontrolled proliferation and death." },
  { slug: "eschenhagen-2017-circulation", doi: "10.1161/CIRCULATIONAHA.117.029343", note: "Consensus review of cardiomyocyte regeneration." }
];

const GOALS = [
  goal({
    id: G("myocardial-infarction-repair"), name: "Repair of the heart after a myocardial infarction",
    parent: G("universal-repair"),
    description: "After part of the heart muscle dies from an interrupted blood supply, restore it: contractile muscle in place of scar, blood supply to that muscle, electrical continuity with the rest of the heart, and pump function back to where it was. Reperfusion, which saves the patient's life, is a separate and largely solved problem.",
    projections: UR,
    existenceProof: "Zebrafish regenerate resected ventricle; neonatal mice regenerate an infarct for about the first week of life and lose the ability after that. Adult humans do not: cardiomyocyte turnover is under one per cent a year and the infarct becomes permanent scar. New muscle has been made in a primate heart from pluripotent cells, so remuscularisation is possible in principle.",
    requires: [
      { all: [C("acute-reperfusion-of-the-infarct-artery"), C("infarct-remuscularisation"), C("graft-host-electrical-integration"), C("myocardial-graft-vascularisation")] },
      { any: [C("cardiomyocyte-proliferation-induction"), C("pluripotent-derived-cardiomyocyte-grafting")], note: "OR-group: make the surviving muscle divide, or add muscle from outside. The map does not assume which route arrives first." }
    ],
    blockedBy: [Q("remuscularisation-arrhythmia-controllable"), Q("controllable-cardiomyocyte-proliferation"), Q("why-adult-cell-therapy-failed-in-the-heart")],
    testSuite: [
      { scenario: "restore blood flow within hours of the infarct", state: "routine", note: "primary angioplasty; mortality benefit established" },
      { scenario: "prevent adverse remodelling with drugs", state: "partial", note: "slows the decline; does not replace muscle" },
      { scenario: "replace lost muscle with new contractile tissue", state: "unsolved", note: "shown in primates, not in people" },
      { scenario: "electrically integrate new muscle without arrhythmia", state: "unsolved", note: "the reproducible failure mode in every large-animal remuscularisation study" },
      { scenario: "reverse an established ischaemic scar", state: "unsolved" }
    ],
    informationLimited: false
  }),
  goal({
    id: G("myocardial-salvage"), name: "Salvage of the muscle at risk",
    parent: G("myocardial-infarction-repair"),
    description: "Reopen the occluded artery fast enough that muscle which has not yet died survives, and limit reperfusion injury.",
    projections: UR,
    requires: [{ all: [C("acute-reperfusion-of-the-infarct-artery")] }]
  }),
  goal({
    id: G("myocardial-remuscularisation"), name: "Replacement of the lost muscle",
    parent: G("myocardial-infarction-repair"),
    description: "Put contractile, perfused, electrically continuous muscle where the scar is — grown in place from surviving cardiomyocytes, or delivered as cells or a patch.",
    projections: both,
    requires: [{ any: [C("cardiomyocyte-proliferation-induction"), C("pluripotent-derived-cardiomyocyte-grafting")] }, { all: [C("infarct-remuscularisation"), C("graft-host-electrical-integration"), C("myocardial-graft-vascularisation")] }],
    blockedBy: [Q("remuscularisation-arrhythmia-controllable"), Q("controllable-cardiomyocyte-proliferation")]
  })
];

const CAPABILITIES = [
  cap({
    id: C("acute-reperfusion-of-the-infarct-artery"), name: "Reopen the blocked artery in time", class: "control", primitive: "reconnect", projections: UR,
    description: "Restore blood flow through the occluded coronary artery quickly enough to save myocardium that is ischaemic but not yet dead.",
    target: { node: CELL("endothelium") },
    grade: { basis: "claims", rung: "L5", measured: "function", blocked: "framework", note: "Primary angioplasty reduced death, reinfarction and stroke compared with thrombolysis across 23 randomised trials (Keeley 2003) and is standard care worldwide. What remains is a framework constraint — getting the patient to a catheter laboratory in time — not a scientific one. This is the only L5 on this ground, and it is why people survive infarcts and then live with heart failure.", drift: "'Heart attacks are treatable' — the patient is saved; the muscle is not." },
    evidenceAccessed: [S("keeley-2003-lancet")]
  }),
  cap({
    id: C("infarct-remuscularisation"), name: "Put working muscle where the scar is", class: "control", primitive: "regenerate", projections: both,
    description: "Replace infarct scar with contractile cardiomyocytes that are aligned with the host muscle and contribute to the pump.",
    target: { node: CELL("cardiomyocyte") },
    grade: { basis: "claims", rung: "L3", measured: "structure", blocked: "science", note: "Human pluripotent-derived cardiomyocytes remuscularised infarcted non-human primate hearts and improved contractile function (Chong 2014, Liu 2018, Romagnuolo 2019, three reports from overlapping Seattle groups). The grafts are real muscle and they beat with the host — and every one of these studies reports ventricular arrhythmia. Human evidence is limited to a small epicardial patch trial with no efficacy conclusion (Menasché 2018)." },
    wouldMove: "A large-animal remuscularisation study without sustained arrhythmia, then a first-in-human injection or patch trial with a contractile endpoint.",
    evidenceAccessed: [S("chong-2014-nature"), S("liu-2018-natbiotech"), S("romagnuolo-2019-scr"), S("menasche-2018-jacc")]
  }),
  cap({
    id: C("pluripotent-derived-cardiomyocyte-grafting"), name: "Grow the replacement muscle outside the body", class: "control", primitive: "replace", projections: both,
    description: "Differentiate pluripotent stem cells into cardiomyocytes at clinical scale and deliver them to the infarct as an injection or an engineered patch that survives and engrafts.",
    target: { node: CELL("cardiomyocyte") },
    grade: { basis: "claims", rung: "L4", measured: "structure", blocked: "science", note: "An epicardial fibrin patch carrying embryonic-stem-cell-derived cardiovascular progenitors was delivered to six patients and was feasible with no tumour and no sustained arrhythmia reported at the doses used (Menasché 2018) — a first-in-human safety result, with the authors attributing any benefit to paracrine effect rather than to new muscle. The L4 is for delivery to humans, not for remuscularising them.", drift: "A first-in-human feasibility study with six patients is regularly cited as 'stem cells repair the heart'." },
    wouldMove: "A trial delivering enough cells to change contractile function, with imaging evidence of graft muscle rather than paracrine effect.",
    evidenceAccessed: [S("menasche-2018-jacc"), S("chong-2014-nature")]
  }),
  cap({
    id: C("cardiomyocyte-proliferation-induction"), name: "Make the surviving heart muscle divide", class: "control", primitive: "regenerate", projections: both,
    description: "Induce existing adult cardiomyocytes to re-enter the cell cycle and divide, so that the heart repairs itself rather than receiving cells from outside.",
    target: { node: CELL("cardiomyocyte") },
    grade: { basis: "claims", rung: "L3", measured: "structure", blocked: "science", note: "A four-factor cell cycle combination drove adult cardiomyocyte division and improved function after infarction in mice (Mohamed 2018). In pigs, AAV-delivered miR-199a produced striking functional repair — and then uncontrolled proliferation and sudden death in most treated animals (Gabisonia 2019). The rung is L3 because the large-animal study is real; the note is the point of the record.", drift: "'The heart can be made to regenerate itself' — it can, and in the one large-animal test the animals died of it. Control, not induction, is the unsolved part." },
    wouldMove: "A large-animal study with dose-controlled, self-limiting proliferation and no arrhythmic or proliferative deaths.",
    evidenceAccessed: [S("mohamed-2018-cell"), S("gabisonia-2019-nature"), S("eschenhagen-2017-circulation")]
  }),
  cap({
    id: C("graft-host-electrical-integration"), name: "Wire new muscle into the heart's rhythm", class: "control", primitive: "reconnect", projections: both,
    description: "Have grafted or newly divided cardiomyocytes couple electrically with host muscle so they contract in time with it, without becoming an arrhythmic focus.",
    target: { node: CELL("cardiomyocyte") },
    grade: { basis: "claims", rung: "L3", measured: "function", blocked: "science", note: "Grafts do couple: the primate studies show host-synchronous contraction. They also cause ventricular arrhythmia in the weeks after grafting, consistently across three reports and two species (Chong 2014, Liu 2018, Romagnuolo 2019). Immature graft cardiomyocytes with automaticity are the leading explanation. This is the node that blocks the whole ground." },
    wouldMove: "Remuscularisation in a large animal with continuous telemetry showing no sustained ventricular arrhythmia, ideally with a mechanistic fix such as graft maturation or pacemaker-gene removal.",
    evidenceAccessed: [S("chong-2014-nature"), S("liu-2018-natbiotech"), S("romagnuolo-2019-scr")]
  }),
  cap({
    id: C("myocardial-graft-vascularisation"), name: "Get blood to the new muscle", class: "control", primitive: "reconnect", projections: both,
    description: "Perfuse grafted or regenerated myocardium: heart muscle is among the most oxygen-hungry tissue in the body, and a graft thicker than the diffusion limit dies without its own vessels.",
    target: { node: CELL("endothelium") },
    grade: { basis: "claims", rung: "L3", measured: "structure", blocked: "science", note: "Primate grafts are perfused by host vessels that grow into them, which is why they survive at the sizes reported. Whether that scales to a graft large enough to matter for human pump function is the same unsolved problem as thick-tissue vascularisation elsewhere on this map (see the dermal microvasculature question).", drift: "Graft survival at primate scale is often read as evidence that human-scale grafts will perfuse. The scaling is exactly what has not been shown." },
    wouldMove: "A perfused graft at a fraction of human left-ventricular mass that would be clinically meaningful, in a large animal, stable at three months.",
    evidenceAccessed: [S("chong-2014-nature"), S("romagnuolo-2019-scr")]
  }),
  cap({
    id: C("cardiac-scar-reversal"), name: "Turn cardiac scar back into muscle", class: "control", primitive: "repair", projections: both,
    description: "Convert established ischaemic scar — collagen and myofibroblasts, years after the event — back into working myocardium.",
    target: { node: CELL("cardiomyocyte") },
    grade: { basis: "no-evidence-located", rung: "L0", searchedOn: DATE, note: "Placed so the gap is visible. Direct reprogramming of cardiac fibroblasts to cardiomyocytes has rodent evidence not searched in this seed; nothing located addresses an established human scar. Grading it is the first open task on this node, and it is the same shape as established-dermal-scar-reversal on the skin ground." },
    wouldMove: "Any demonstration that an established (not acute) cardiac scar can be converted to contractile tissue in a large animal."
  })
];

const QUESTIONS = [
  q({
    id: Q("remuscularisation-arrhythmia-controllable"), projections: both,
    question: "Can new cardiomyocytes be added to an infarcted heart without causing ventricular arrhythmia — and if so, by maturing the graft, by removing its automaticity, or by grafting differently?",
    why: "It is the single blocker on this ground. Remuscularisation works in primates and the animals develop arrhythmia; until that is solved, no amount of improvement in cell manufacturing or delivery makes a human trial reasonable at a therapeutic dose.",
    blocks: [C("graft-host-electrical-integration"), C("infarct-remuscularisation"), C("pluripotent-derived-cardiomyocyte-grafting"), G("myocardial-infarction-repair")],
    hypotheses: [
      "Graft cardiomyocytes are immature and spontaneously active; maturing them before or after grafting removes the focus.",
      "The arrhythmia is a transient integration phenomenon that resolves once coupling is complete, and can be managed pharmacologically through the window.",
      "It is a boundary effect at the graft-host interface and depends on graft geometry, so patches behave differently from injections.",
      "It is intrinsic to adding autonomous contractile tissue to a heart, and remuscularisation by grafting will not be usable."
    ],
    knownUnknowns: ["whether the arrhythmia scales with graft size or is present at any size", "whether the same happens in a human heart, whose rate is much slower than a macaque's", "whether patch delivery avoids it"],
    whatWouldResolve: "A large-animal remuscularisation study with continuous telemetry in which a maturation or gene-editing intervention abolishes sustained ventricular arrhythmia while preserving contractile contribution."
  }),
  q({
    id: Q("controllable-cardiomyocyte-proliferation"), projections: both,
    question: "Can adult cardiomyocyte proliferation be switched on to repair an infarct and then switched off, or does the same signal that repairs the heart keep going until it kills the animal?",
    why: "The pig miR-199a result is the map's clearest case of a therapy that worked and was lethal. Control, not induction, is what is missing, and it is the same problem that appears in the rejuvenation branch as cancer risk under reprogramming.",
    blocks: [C("cardiomyocyte-proliferation-induction"), G("myocardial-remuscularisation")],
    hypotheses: [
      "Transient delivery — mRNA, a self-limiting vector, or a small molecule — gives the same repair without the persistence that caused the deaths.",
      "Proliferation requires a sustained signal to produce useful muscle, so the therapeutic window is narrow or absent.",
      "The deaths were arrhythmic rather than proliferative, making this the same problem as the graft integration question."
    ],
    knownUnknowns: ["whether transient delivery achieves the same functional repair", "what the treated pigs actually died of, mechanistically", "whether a dose exists that repairs without dysplasia"],
    whatWouldResolve: "A repeat of the pig experiment with a transient delivery vehicle and telemetry, reporting both function and cause of death for every animal."
  }),
  q({
    id: Q("why-adult-cell-therapy-failed-in-the-heart"), projections: UR,
    question: "Why did fifteen years of bone-marrow and adult stem cell trials after myocardial infarction produce no effect on function in individual-patient-data meta-analysis, when many individual trials were positive?",
    why: "It is the largest documented negative in regenerative medicine and it shaped the field's credibility. Any new cell therapy on this ground inherits the question: what made the earlier positives look real, and does the new approach avoid it?",
    blocks: [C("pluripotent-derived-cardiomyocyte-grafting"), C("infarct-remuscularisation")],
    hypotheses: [
      "The cells never became cardiomyocytes and the reported benefits were small-trial noise and unblinded endpoint assessment.",
      "There was a real paracrine effect too small to survive pooling.",
      "Heterogeneity of cell products and timing diluted a real effect in some subgroups.",
      "Publication and analytical practice in the early trials inflated the apparent effect."
    ],
    knownUnknowns: ["how much of the early literature would survive current standards", "whether any subgroup showed a consistent effect"],
    whatWouldResolve: "The ACCRUE analysis largely answers the empirical question; what is open is whether pluripotent-derived grafts differ mechanistically, which only a trial with an imaging readout of graft muscle can settle."
  })
];

const CLAIMS = [
  cl({
    id: CL("primary-angioplasty-beats-thrombolysis"),
    statement: "Across 23 randomised trials, primary angioplasty reduced short-term death, non-fatal reinfarction and stroke compared with thrombolytic therapy in acute myocardial infarction.",
    context: { species: "human", model: "acute ST-elevation myocardial infarction", intervention: "primary angioplasty", comparator: "thrombolysis" },
    measurement: { measured: "function", assay: "clinical outcomes", endpoint: "death, reinfarction, stroke", effect: "reduced with angioplasty" },
    evidence: [ev(S("keeley-2003-lancet"), "meta-analysis")],
    rung: "L5",
    replication: { independentGroups: 2, note: "A meta-analysis of 23 randomised trials from many groups." },
    status: { peerReviewed: true },
    supports: [C("acute-reperfusion-of-the-infarct-artery")]
  }),
  cl({
    id: CL("human-cardiomyocyte-turnover-is-under-one-percent-a-year"),
    statement: "Carbon-14 birth dating of human cardiomyocytes shows renewal at roughly one per cent a year at age 25, falling below half a per cent by age 75, so fewer than half of the cardiomyocytes in a heart are replaced over a lifetime.",
    context: { species: "human", model: "post-mortem myocardium across ages" },
    measurement: { measured: "biomarker", assay: "carbon-14 birth dating from atmospheric bomb-pulse", endpoint: "cardiomyocyte turnover rate", effect: "about 1% per year at 25, under 0.5% at 75" },
    evidence: [ev(S("bergmann-2009-science"), "observational-human")],
    rung: "L5",
    replication: { independentGroups: 1, note: "One group's method, later refined; the order of magnitude is not disputed." },
    status: { peerReviewed: true },
    supports: [C("cardiomyocyte-proliferation-induction")],
    contradicts: [C("infarct-remuscularisation")],
    limitations: ["turnover measured across the whole heart, not in an infarct border zone"]
  }),
  cl({
    id: CL("neonatal-mouse-heart-regenerates-then-loses-the-ability"),
    statement: "The neonatal mouse heart fully regenerates after resection of part of the ventricle, and loses that ability within about the first week of life.",
    context: { species: "mouse", model: "apical resection at day 1 versus day 7" },
    measurement: { measured: "structure", assay: "histology, function", endpoint: "restoration of ventricular myocardium", effect: "complete regeneration at day 1; scar at day 7" },
    evidence: [ev(S("porrello-2011-science"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 2, note: "Widely reproduced, with debate about resection versus infarction models." },
    status: { peerReviewed: true },
    supports: [C("cardiomyocyte-proliferation-induction")],
    limitations: ["a developmental window in a rodent; the adult human is the opposite end of that window"]
  }),
  cl({
    id: CL("psc-cardiomyocytes-remuscularise-primate-hearts-with-arrhythmia"),
    statement: "Human pluripotent-stem-cell-derived cardiomyocytes grafted into infarcted non-human primate hearts formed substantial, host-synchronised new myocardium and improved contractile function — and caused ventricular arrhythmias in the treated animals.",
    context: { species: "macaque and pig", model: "myocardial infarction with cell grafting", intervention: "human embryonic-stem-cell-derived cardiomyocytes" },
    measurement: { measured: "structure", assay: "histology, electrical mapping, echocardiography, telemetry", endpoint: "graft muscle, electromechanical coupling, contractile function, arrhythmia", effect: "extensive remuscularisation and improved function; non-fatal ventricular arrhythmias in treated animals" },
    evidence: [ev(S("chong-2014-nature"), "animal-controlled"), ev(S("liu-2018-natbiotech"), "animal-controlled"), ev(S("romagnuolo-2019-scr"), "animal-controlled", { note: "pig heart; the same arrhythmia signal" })],
    rung: "L3",
    replication: { independentGroups: 1, note: "Three reports from overlapping Seattle groups (Murry, Laflamme). The arrhythmia finding reproduces across species within that programme; independent replication is what is missing." },
    status: { peerReviewed: true },
    supports: [C("infarct-remuscularisation"), C("graft-host-electrical-integration"), C("myocardial-graft-vascularisation")],
    drift: "'Stem cells regenerate the primate heart' — they do, and the recipients develop ventricular arrhythmia. The second half is rarely carried with the first.",
    limitations: ["immunosuppressed animals", "short follow-up relative to a human therapy", "one research programme"]
  }),
  cl({
    id: CL("adult-cell-therapy-after-mi-shows-no-effect-in-ipd-meta-analysis"),
    statement: "An individual-patient-data meta-analysis of randomised trials of intracoronary adult cell therapy after acute myocardial infarction found no effect on left ventricular ejection fraction, ventricular volumes, or clinical events.",
    context: { species: "human", model: "acute myocardial infarction", intervention: "intracoronary bone-marrow or adult cell therapy", comparator: "control" },
    measurement: { measured: "function", assay: "imaging-derived LVEF and volumes; clinical events", endpoint: "cardiac function and outcomes", effect: "no significant effect" },
    evidence: [ev(S("gyongyosi-2015-circres"), "meta-analysis")],
    rung: "L5",
    replication: { independentGroups: 2, note: "Individual patient data pooled across many independent trials." },
    status: { peerReviewed: true },
    contradicts: [C("infarct-remuscularisation"), C("pluripotent-derived-cardiomyocyte-grafting")],
    drift: "Individual positive trials from this era are still cited as evidence that cell therapy repairs the heart. Pooled at patient level, the effect is not there.",
    limitations: ["heterogeneous cell products and protocols", "does not test pluripotent-derived cardiomyocytes, which are a different intervention"]
  }),
  cl({
    id: CL("esc-derived-progenitor-patch-feasible-in-six-patients"),
    statement: "An epicardial fibrin patch carrying embryonic-stem-cell-derived cardiovascular progenitors was delivered to six patients with ischaemic left ventricular dysfunction; the procedure was feasible with no tumour and no sustained arrhythmia reported, and the authors did not claim an efficacy conclusion.",
    context: { species: "human", model: "severe ischaemic left ventricular dysfunction", intervention: "ESC-derived cardiovascular progenitor patch during CABG" },
    measurement: { measured: "none", assay: "safety, feasibility, symptomatic and imaging follow-up", endpoint: "safety and feasibility at one year", effect: "feasible; no tumour or sustained arrhythmia reported in six patients" },
    evidence: [ev(S("menasche-2018-jacc"), "case-series", { n: "6" })],
    rung: "L4",
    replication: { independentGroups: 0, note: "One group (Menasché, Paris)." },
    status: { peerReviewed: true },
    supports: [C("pluripotent-derived-cardiomyocyte-grafting")],
    limitations: ["six patients, all undergoing concurrent bypass surgery, so any functional change is confounded", "progenitors, not mature cardiomyocytes"]
  }),
  cl({
    id: CL("cell-cycle-factors-drive-adult-cardiomyocyte-division-in-mice"),
    statement: "A combination of four cell cycle regulators drove adult mouse cardiomyocytes to divide and improved cardiac function after myocardial infarction.",
    context: { species: "mouse", model: "myocardial infarction", intervention: "combined CDK1, CDK4, cyclin B1 and cyclin D1 expression" },
    measurement: { measured: "function", assay: "cardiomyocyte division, echocardiography", endpoint: "division and cardiac function", effect: "efficient division of post-mitotic cardiomyocytes; improved function" },
    evidence: [ev(S("mohamed-2018-cell"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 0 },
    status: { peerReviewed: true },
    supports: [C("cardiomyocyte-proliferation-induction")],
    limitations: ["rodent", "four-factor delivery has no clinical vehicle"]
  }),
  cl({
    id: CL("mir199a-repairs-pig-hearts-then-kills-them"),
    statement: "AAV-delivered miR-199a produced near-complete recovery of cardiac function after myocardial infarction in pigs, and then caused uncontrolled cardiomyocyte proliferation and sudden death in most treated animals.",
    context: { species: "pig", model: "myocardial infarction", intervention: "AAV6-miR-199a" },
    measurement: { measured: "function", assay: "cardiac MRI, histology, survival", endpoint: "contractile function and survival", effect: "marked functional repair followed by sudden arrhythmic death in most treated animals" },
    evidence: [ev(S("gabisonia-2019-nature"), "animal-controlled")],
    rung: "L3",
    replication: { independentGroups: 0, note: "One group." },
    status: { peerReviewed: true },
    supports: [C("cardiomyocyte-proliferation-induction")],
    contradicts: [C("graft-host-electrical-integration")],
    drift: "Reported in secondary coverage as a breakthrough in heart regeneration. It is a breakthrough and a lethal one, and the map records both halves in the same claim.",
    limitations: ["constitutive expression from an AAV, with no off switch", "one study"]
  })
];

const EXPERIMENTS = [
  ex({
    id: E("matured-graft-arrhythmia-telemetry-primate"), name: "Remuscularisation with matured or pacemaker-silenced cardiomyocytes, under continuous telemetry",
    tests: [Q("remuscularisation-arrhythmia-controllable")], status: "proposed",
    design: { species: "non-human primate or pig", model: "myocardial infarction with cell grafting", intervention: "grafts of matured cardiomyocytes, or cardiomyocytes with HCN4/automaticity genes removed", comparator: "conventional immature graft; vehicle", readout: "continuous telemetry for sustained ventricular arrhythmia, graft size, electromechanical coupling, ejection fraction", duration: "12-18 months", n: "8-12 per arm" },
    discriminates: "If maturation or gene editing abolishes arrhythmia while keeping contractile contribution, the blocker is graft automaticity and remuscularisation becomes a clinical programme; if arrhythmia persists, adding autonomous muscle may be intrinsically unsafe.",
    feasibility: { costClass: "high", durationClass: "years", requires: ["large-animal cardiac facility", "implantable telemetry", "GMP-grade cardiomyocyte manufacture"], ethics: "animal ethics approval" }
  }),
  ex({
    id: E("transient-proliferation-pig-repeat"), name: "Repeat the pig cardiomyocyte-proliferation experiment with transient delivery and full cause-of-death reporting",
    tests: [Q("controllable-cardiomyocyte-proliferation")], status: "proposed",
    design: { species: "pig", model: "myocardial infarction", intervention: "miR-199a or an equivalent proliferative signal delivered as mRNA or from a self-limiting vector", comparator: "constitutive AAV delivery; vehicle", readout: "cardiac MRI function, cardiomyocyte proliferation index, telemetry, survival with necropsy-confirmed cause of death for every animal", duration: "18 months", n: "10-12 per arm" },
    discriminates: "Function recovered with survival under transient delivery would make controllable proliferation a live route; deaths under both delivery modes would indicate the proliferative state itself is the hazard.",
    feasibility: { costClass: "high", durationClass: "years", requires: ["large-animal cardiac facility", "mRNA or self-limiting vector manufacture", "telemetry and necropsy"], ethics: "animal ethics approval" }
  })
];

run({ SOURCES, GOALS, CAPABILITIES, QUESTIONS, CLAIMS, EXPERIMENTS });

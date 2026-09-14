/* Seed: proving ground 5 — systemic rejuvenation, beyond the reprogramming node already on the map.
 *
 * Provenance, not a build step (see scripts/lib/seed.mjs). Sources come from live Crossref and
 * PubMed lookups; every other record was authored by the session below from those sources'
 * abstracts and enters the map as `ai-proposed`. Nothing here has been read at figure level.
 *
 * Why this ground: the rejuvenation projection already has partial reprogramming and its safety
 * question. It lacks everything else people actually mean by rejuvenation — clearing senescent
 * cells, changing the systemic environment, slowing aging pharmacologically — and it lacks the
 * measurement problem underneath all of them: nobody can yet tell, in a living person and within
 * a trial's lifetime, whether an intervention made them biologically younger. Epigenetic clocks
 * are correlations that have not been shown to move causally with health outcomes, so the map
 * grades the measurement node low even though every trial in this area reports one.
 *
 * Run:  node scripts/seed/2026-09-14-systemic-rejuvenation.mjs [--force]
 * Then: node scripts/build.mjs */

import { makeSeed, ids } from "../lib/seed.mjs";

const { S, G, C, Q, CL, E, CELL } = ids;
const DATE = "2026-09-14";
const seed = makeSeed({
  date: DATE,
  actor: { type: "ai", name: "Claude Code session b1762020 (Anthropic)", model: "claude-opus-5", session: "b1762020-2a53-4f0e-8cbd-18239bda19a3" },
  authored: "manual reasoning from the cited sources' abstracts (Crossref/Europe PMC), checked 2026-09-14; no source opened at figure level",
  script: "scripts/seed/2026-09-14-systemic-rejuvenation.mjs"
});
const { goal, cap, q, ex, cl, ev, run } = seed;
const RJ = ["rejuvenation"];
const both = ["universal-repair", "rejuvenation"];

const SOURCES = [
  { slug: "xu-2018-natmed", doi: "10.1038/s41591-018-0092-9", note: "Senolytics improve physical function and increase lifespan in old mice." },
  { slug: "justice-2019-ebiomedicine", doi: "10.1016/j.ebiom.2018.12.052", note: "First-in-human senolytics, IPF, open-label, n=14." },
  { slug: "hickson-2019-ebiomedicine", doi: "10.1016/j.ebiom.2019.08.069", note: "Senescent cell reduction in humans, diabetic kidney disease, n=9." },
  { slug: "conboy-2005-nature", doi: "10.1038/nature03260", note: "Heterochronic parabiosis." },
  { slug: "villeda-2014-natmed", doi: "10.1038/nm.3569" },
  { slug: "mehdipour-2020-aging", doi: "10.18632/aging.103418", note: "Neutral blood exchange: dilution rather than young factors." },
  { slug: "horvath-2013-genomebiol", doi: "10.1186/gb-2013-14-10-r115", note: "The multi-tissue epigenetic clock." },
  { slug: "fahy-2019-agingcell", doi: "10.1111/acel.13028", note: "TRIIM: nine men, no control arm, epigenetic age reversal reported." },
  { slug: "harrison-2009-nature", doi: "10.1038/nature08221", note: "Rapamycin extends lifespan when started late in life." },
  { slug: "mannick-2014-scitranslmed", doi: "10.1126/scitranslmed.3009892", note: "mTOR inhibition and vaccine response in the elderly." },
  { slug: "barzilai-2016-cellmetab", doi: "10.1016/j.cmet.2016.05.011", note: "The TAME trial rationale." },
  { slug: "browder-2022-nataging", doi: "10.1038/s43587-022-00183-2", note: "Long-term partial reprogramming in mice." },
  { slug: "yang-2023-cell", doi: "10.1016/j.cell.2022.12.027", note: "Loss of epigenetic information as a cause of aging." }
];

const GOALS = [
  goal({
    id: G("senescent-cell-clearance-goal"), name: "Removal of the cells that make tissue old",
    parent: G("systemic-rejuvenation"),
    description: "Clear senescent cells — cells that have stopped dividing and secrete an inflammatory programme into the tissue around them — from an aged or damaged organ, and show that the tissue works better afterwards.",
    projections: RJ,
    existenceProof: "Genetic clearance of p16-positive cells extends healthspan in mice, and senolytic drugs improve physical function and lifespan in old mice. In humans, two small open-label studies report reduced senescent cell burden and, in one, improved walking distance; neither had a control arm.",
    requires: [{ all: [C("senescent-cell-clearance-in-humans"), C("senescent-cell-burden-measurement")] }],
    blockedBy: [Q("senolytics-improve-human-function")]
  }),
  goal({
    id: G("systemic-environment-rejuvenation"), name: "Changing the environment the cells live in",
    parent: G("systemic-rejuvenation"),
    description: "Rejuvenate tissue by changing what circulates around it — removing aged factors, diluting the plasma, or supplying young ones — rather than by editing the cells themselves.",
    projections: RJ,
    requires: [{ any: [C("aged-plasma-factor-removal"), C("young-systemic-factor-supplementation")] }],
    blockedBy: [Q("dilution-or-young-factors")]
  }),
  goal({
    id: G("aging-rate-modification"), name: "Slowing the rate of aging pharmacologically",
    parent: G("rejuvenation"),
    description: "Slow the accumulation of age-related dysfunction with a drug taken over years — distinct from reversing damage already accumulated, which is what the rest of this projection is about.",
    projections: RJ,
    requires: [{ all: [C("pharmacological-aging-rate-reduction"), C("biological-age-measurement-that-predicts-outcome")] }],
    blockedBy: [Q("geroprotector-benefit-in-humans"), Q("clocks-track-intervention-benefit")]
  })
];

const CAPABILITIES = [
  cap({
    id: C("senescent-cell-clearance-in-humans"), name: "Clear senescent cells from a living person", class: "control", primitive: "remove", projections: RJ,
    description: "Selectively kill senescent cells in human tissue, reducing the inflammatory secretory programme they impose on the tissue around them.",
    target: { node: CELL("fibroblast") },
    grade: { basis: "claims", rung: "L4", measured: "biomarker", blocked: "science", note: "Dasatinib plus quercetin reduced senescent cell markers in adipose tissue and skin in nine patients with diabetic kidney disease (Hickson 2019), and improved six-minute walk distance in fourteen patients with idiopathic pulmonary fibrosis (Justice 2019). Both are open-label, single-arm, and very small. The rodent evidence for function and lifespan is strong (Xu 2018). L4 records that the drugs have been given to people and moved a marker; it does not record a demonstrated clinical benefit.", drift: "'Senolytics reverse aging in humans' — two uncontrolled studies of nine and fourteen patients, with a marker endpoint and a walking-distance endpoint respectively." },
    wouldMove: "A randomised, placebo-controlled trial with a functional primary endpoint in an aged population.",
    evidenceAccessed: [S("xu-2018-natmed"), S("justice-2019-ebiomedicine"), S("hickson-2019-ebiomedicine")]
  }),
  cap({
    id: C("senescent-cell-burden-measurement"), name: "Measure how many senescent cells a person has", class: "see", primitive: "preserve", projections: RJ,
    description: "Quantify senescent cell burden in a living person's tissue, well enough to say whether a senolytic worked and in which organ.",
    target: { node: CELL("fibroblast") },
    grade: { basis: "claims", rung: "L4", measured: "biomarker", blocked: "science", note: "Burden has been measured in humans by biopsy — adipose and skin p16INK4a and SASP markers (Hickson 2019) — which requires taking tissue and does not generalise to organs you cannot biopsy. There is no validated circulating or imaging measure. Every senolytic trial therefore reports on the tissue it could reach, not the tissue it cared about.", drift: "Senescence markers are treated as a quantity; they are a panel with no agreed threshold and no agreed definition of a senescent cell." },
    wouldMove: "A circulating or imaging measure of senescent burden validated against tissue in humans.",
    evidenceAccessed: [S("hickson-2019-ebiomedicine")]
  }),
  cap({
    id: C("aged-plasma-factor-removal"), name: "Take the aged factors out of circulation", class: "control", primitive: "remove", projections: RJ,
    description: "Rejuvenate tissue by removing or diluting what accumulates in old blood — therapeutic plasma exchange, apheresis, or targeted removal of specific factors.",
    grade: { basis: "claims", rung: "L2", measured: "biomarker", blocked: "science", note: "Replacing half an old mouse's plasma with saline and albumin rejuvenated muscle, liver and brain measures as well as young blood did (Mehdipour 2020), which reframes the parabiosis literature: the effect may be dilution of old factors rather than transfer of young ones. Rodent only. Human plasma exchange exists as a procedure, so the translational path is unusually short if the biology holds.", drift: "Young-blood transfusion clinics cite the parabiosis literature. The dilution result argues the young half may not be the active ingredient." },
    wouldMove: "A randomised trial of plasma exchange in older adults with a functional endpoint, not a biomarker panel.",
    evidenceAccessed: [S("mehdipour-2020-aging"), S("conboy-2005-nature")]
  }),
  cap({
    id: C("young-systemic-factor-supplementation"), name: "Add young factors to old circulation", class: "control", primitive: "replace", projections: RJ,
    description: "Supply the circulating factors present in young blood and absent or reduced in old blood, and show that aged tissue responds.",
    grade: { basis: "claims", rung: "L2", measured: "function", blocked: "science", note: "Heterochronic parabiosis restored regenerative capacity in aged mouse muscle and liver (Conboy 2005), and young plasma improved hippocampal function and cognition in aged mice (Villeda 2014). Rodent, and the dilution result above puts the interpretation in question. No identified factor has produced a functional benefit in an older person." },
    wouldMove: "A single identified factor with a functional benefit in a randomised human trial.",
    evidenceAccessed: [S("conboy-2005-nature"), S("villeda-2014-natmed"), S("mehdipour-2020-aging")]
  }),
  cap({
    id: C("pharmacological-aging-rate-reduction"), name: "Slow aging with a drug", class: "control", primitive: "recalibrate", projections: RJ,
    description: "Take a drug over years that slows the accumulation of age-related disease and dysfunction, rather than treating each disease as it arrives.",
    grade: { basis: "claims", rung: "L4", measured: "biomarker", blocked: "framework", note: "Rapamycin extends lifespan in genetically heterogeneous mice even when started late in life (Harrison 2009), the strongest single result in the field. In humans, an mTOR inhibitor improved vaccine response in older adults (Mannick 2014) — an immune biomarker, and the only randomised human evidence cited here that a geroprotector does anything age-related. Metformin has a trial rationale and a design (Barzilai 2016) but no result. The blocker is partly framework: aging is not an approvable indication, which is what TAME was designed to change.", drift: "'Rapamycin extends human lifespan' — no human lifespan or healthspan trial has reported. The human data are immune-response biomarkers." },
    wouldMove: "A randomised human trial with a composite clinical endpoint — incident age-related disease or functional decline — that succeeds.",
    evidenceAccessed: [S("harrison-2009-nature"), S("mannick-2014-scitranslmed"), S("barzilai-2016-cellmetab")]
  }),
  cap({
    id: C("biological-age-measurement-that-predicts-outcome"), name: "Tell whether someone got biologically younger", class: "verify", primitive: "preserve", projections: RJ,
    description: "Measure a person's biological age well enough that a change in the measure, produced by an intervention, predicts a change in their health outcomes — so that a rejuvenation trial does not have to run for forty years.",
    grade: { basis: "claims", rung: "L2", measured: "biomarker", blocked: "science", note: "Epigenetic clocks predict chronological age accurately across tissues and predict mortality in cohorts (Horvath 2013). What has not been shown is that moving a clock with an intervention moves the outcome: the clock is a correlate of age, and no trial has demonstrated that lowering it lowers risk. Studies reporting epigenetic age reversal (Fahy 2019, nine men, no control arm) illustrate the problem rather than solving it. Graded L2 deliberately: as a surrogate endpoint, which is what the field uses it for, the causal evidence is preclinical.", drift: "Clocks are reported as measurements of how old someone biologically is, and used as endpoints. They are trained predictors of chronological age whose response to intervention has no validated meaning." },
    wouldMove: "An intervention trial in which a clock change measured early predicts the clinical outcome measured later, in an independent cohort.",
    evidenceAccessed: [S("horvath-2013-genomebiol"), S("fahy-2019-agingcell"), S("yang-2023-cell")]
  })
];

const QUESTIONS = [
  q({
    id: Q("clocks-track-intervention-benefit"), projections: RJ,
    question: "Does moving an epigenetic clock with an intervention predict a change in health outcome, or is the clock only a correlate of chronological age?",
    why: "Every intervention in this projection is measured against a clock because the alternative is a forty-year trial. If clocks do not respond meaningfully to intervention, the entire rejuvenation field is running on an unvalidated surrogate and the map's grades in this projection are built on sand.",
    blocks: [C("biological-age-measurement-that-predicts-outcome"), C("pharmacological-aging-rate-reduction"), C("senescent-cell-clearance-in-humans"), G("aging-rate-modification")],
    hypotheses: [
      "Clocks measure a causal driver — loss of epigenetic information — so moving them moves outcomes.",
      "Clocks are downstream readouts of cell composition and turnover, and can be moved without changing anything that matters.",
      "Different clocks differ: mortality-trained clocks may be responsive where age-trained clocks are not."
    ],
    knownUnknowns: ["whether any intervention has moved a clock and then been followed to a clinical outcome", "how much of a clock reading is cell-type composition in the sample"],
    whatWouldResolve: "A randomised intervention trial with clock measurement early and a pre-registered clinical endpoint years later, showing that the early clock change predicted the outcome."
  }),
  q({
    id: Q("senolytics-improve-human-function"), projections: RJ,
    question: "Do senolytics improve function in older people, or only reduce a marker in a biopsy?",
    why: "It is the nearest-term testable claim in the rejuvenation projection: the drugs exist, are off-patent, and have been given to patients. The published human studies are uncontrolled and tiny, so the answer is unknown rather than negative.",
    blocks: [C("senescent-cell-clearance-in-humans"), G("senescent-cell-clearance-goal")],
    hypotheses: [
      "Clearance produces functional benefit in tissues with high senescent burden (lung, kidney, joint) and little elsewhere.",
      "Intermittent clearance works in mice because mouse senescent burden is high relative to human, and the human effect is small.",
      "The benefit is real but confined to disease states rather than to healthy aging."
    ],
    knownUnknowns: ["dose and schedule in humans", "which tissue to measure", "whether removing senescent cells impairs wound healing or tumour suppression"],
    whatWouldResolve: "A randomised placebo-controlled trial in older adults with a functional primary endpoint — gait speed, six-minute walk, or incident frailty."
  }),
  q({
    id: Q("dilution-or-young-factors"), projections: RJ,
    question: "Is the rejuvenating effect of young blood the transfer of young factors, or the dilution of old ones?",
    why: "The two answers point at completely different therapies. Dilution means plasma exchange, an existing procedure, could be tested in people within a few years. Young factors means finding and manufacturing the factor first.",
    blocks: [C("aged-plasma-factor-removal"), C("young-systemic-factor-supplementation"), G("systemic-environment-rejuvenation")],
    hypotheses: [
      "Dilution of accumulated inhibitory factors accounts for most of the effect (the neutral blood exchange result).",
      "Specific young factors are required and dilution merely reduces inhibition of an endogenous programme.",
      "Both, tissue by tissue."
    ],
    knownUnknowns: ["whether the mouse dilution result reproduces in an independent laboratory", "what the accumulating inhibitory factors are", "how often exchange would need repeating"],
    whatWouldResolve: "An independent replication of neutral blood exchange in aged mice with functional endpoints, followed by a randomised plasma-exchange trial in older adults."
  }),
  q({
    id: Q("geroprotector-benefit-in-humans"), projections: RJ,
    question: "Does any geroprotector — rapamycin, metformin, or another — reduce incident age-related disease in humans?",
    why: "It is the question the whole pharmacological branch rests on, it has been askable for over a decade, and it remains unanswered largely because aging is not an approvable indication rather than because the trial is impossible.",
    blocks: [C("pharmacological-aging-rate-reduction"), G("aging-rate-modification")],
    hypotheses: [
      "mTOR inhibition produces a measurable reduction in age-related disease incidence at tolerable doses.",
      "Effects seen in mice do not transfer because human aging is less mTOR-driven.",
      "The effect exists but is too small to detect without a trial larger than anyone will fund."
    ],
    knownUnknowns: ["the dose and schedule that separates benefit from immunosuppression", "whether a composite endpoint would be accepted by a regulator"],
    whatWouldResolve: "TAME or an equivalent trial reporting a composite endpoint of incident age-related disease."
  })
];

const CLAIMS = [
  cl({
    id: CL("senolytics-improve-function-and-lifespan-in-old-mice"),
    statement: "Intermittent dasatinib plus quercetin reduced senescent cell burden, improved physical function and increased post-treatment survival in old mice, including when treatment began late in life.",
    context: { species: "mouse", model: "naturally aged and senescent-cell-transplanted mice", intervention: "intermittent dasatinib + quercetin" },
    measurement: { measured: "function", assay: "physical function battery, survival", endpoint: "function and remaining lifespan", effect: "improved function; increased post-treatment survival" },
    evidence: [ev(S("xu-2018-natmed"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 1, note: "The Mayo group; senolytic benefit in mice has been reproduced by others with different agents." },
    status: { peerReviewed: true },
    supports: [C("senescent-cell-clearance-in-humans")]
  }),
  cl({
    id: CL("senolytics-reduce-human-senescent-markers-uncontrolled"),
    statement: "In two small open-label human studies, dasatinib plus quercetin reduced senescent cell markers in adipose tissue and skin in patients with diabetic kidney disease, and improved six-minute walk distance in patients with idiopathic pulmonary fibrosis.",
    context: { species: "human", model: "diabetic kidney disease (n=9); idiopathic pulmonary fibrosis (n=14)", intervention: "dasatinib + quercetin, short course" },
    measurement: { measured: "biomarker", assay: "adipose and skin p16INK4a and SASP markers; six-minute walk", endpoint: "senescent burden; physical function", effect: "reduced senescent markers; improved walk distance" },
    evidence: [ev(S("hickson-2019-ebiomedicine"), "case-series", { n: "9" }), ev(S("justice-2019-ebiomedicine"), "case-series", { n: "14" })],
    rung: "L4",
    replication: { independentGroups: 1, note: "Two studies from overlapping Mayo-led groups." },
    status: { peerReviewed: true },
    supports: [C("senescent-cell-clearance-in-humans"), C("senescent-cell-burden-measurement")],
    drift: "Cited as evidence that senolytics work in people. Both studies are open-label with no control arm; a six-minute walk in fourteen unblinded patients cannot separate drug from expectation.",
    limitations: ["no control arm", "n=9 and n=14", "disease populations, not aged healthy adults"]
  }),
  cl({
    id: CL("young-systemic-environment-restores-aged-tissue-in-mice"),
    statement: "Exposing aged mice to a young systemic environment by parabiosis restored the regenerative capacity of aged muscle and liver progenitor cells, and young plasma improved hippocampal plasticity and cognitive function in aged mice.",
    context: { species: "mouse", model: "heterochronic parabiosis; young plasma infusion" },
    measurement: { measured: "function", assay: "progenitor regenerative capacity; hippocampal plasticity and behaviour", endpoint: "tissue regeneration and cognition", effect: "restored regenerative capacity; improved cognitive measures" },
    evidence: [ev(S("conboy-2005-nature"), "animal-controlled"), ev(S("villeda-2014-natmed"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 2, note: "Two independent groups (Conboy; Wyss-Coray)." },
    status: { peerReviewed: true },
    supports: [C("young-systemic-factor-supplementation")],
    limitations: ["parabiosis shares organs and physiology, not only plasma", "no human evidence"]
  }),
  cl({
    id: CL("plasma-dilution-rejuvenates-as-well-as-young-blood"),
    statement: "Replacing half of an old mouse's plasma with saline and albumin rejuvenated muscle, liver and brain measures as much as, or more than, exchange with young blood — indicating dilution of old factors rather than transfer of young ones.",
    context: { species: "mouse", model: "aged mice", intervention: "neutral blood exchange (plasma replaced with saline-albumin)", comparator: "heterochronic exchange with young blood" },
    measurement: { measured: "function", assay: "muscle repair, liver adiposity and fibrosis, neurogenesis", endpoint: "tissue rejuvenation markers", effect: "equal or greater rejuvenation with neutral exchange" },
    evidence: [ev(S("mehdipour-2020-aging"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 0, note: "One group (Conboy), reinterpreting their own earlier parabiosis work." },
    status: { peerReviewed: true },
    supports: [C("aged-plasma-factor-removal")],
    contradicts: [C("young-systemic-factor-supplementation")],
    limitations: ["single group", "mouse", "measures are tissue markers rather than function over time"]
  }),
  cl({
    id: CL("rapamycin-extends-mouse-lifespan-started-late"),
    statement: "Rapamycin fed to genetically heterogeneous mice beginning at 600 days of age extended median and maximal lifespan in both sexes.",
    context: { species: "mouse", model: "genetically heterogeneous mice, treatment started late in life", intervention: "dietary rapamycin" },
    measurement: { measured: "function", assay: "survival", endpoint: "median and maximal lifespan", effect: "extended in both sexes" },
    evidence: [ev(S("harrison-2009-nature"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 2, note: "Interventions Testing Program: three independent sites by design, and reproduced since." },
    status: { peerReviewed: true },
    supports: [C("pharmacological-aging-rate-reduction")],
    limitations: ["mouse lifespan, not human healthspan", "long-term immunosuppression is the obvious translational obstacle"]
  }),
  cl({
    id: CL("mtor-inhibition-improves-vaccine-response-in-the-elderly"),
    statement: "Six weeks of low-dose mTOR inhibition improved influenza vaccine response in adults over 65 in a randomised placebo-controlled trial, and reduced an age-associated immune phenotype.",
    context: { species: "human", model: "adults over 65", intervention: "RAD001 (everolimus) at low doses for 6 weeks", comparator: "placebo" },
    measurement: { measured: "biomarker", assay: "influenza antibody titres; immune phenotyping", endpoint: "vaccine response", effect: "improved response versus placebo" },
    evidence: [ev(S("mannick-2014-scitranslmed"), "rct")],
    rung: "L4",
    replication: { independentGroups: 0, note: "One sponsor-led programme; a later trial by the same group reported reduced respiratory infections." },
    status: { peerReviewed: true },
    supports: [C("pharmacological-aging-rate-reduction")],
    drift: "'Rapamycin analogues rejuvenate the immune system in people' — the endpoint is antibody titre after a vaccine, which is an immune biomarker, not restored immune function across the board.",
    limitations: ["biomarker endpoint", "six weeks", "industry-sponsored"]
  }),
  cl({
    id: CL("epigenetic-clocks-predict-age-and-mortality"),
    statement: "DNA methylation at a few hundred CpG sites predicts chronological age across most human tissues and cell types, and deviations of predicted from chronological age are associated with mortality in cohort studies.",
    context: { species: "human", model: "multi-tissue methylation datasets" },
    measurement: { measured: "biomarker", assay: "DNA methylation array; elastic net predictor", endpoint: "predicted age; association with mortality", effect: "high correlation with chronological age; age acceleration associated with mortality" },
    evidence: [ev(S("horvath-2013-genomebiol"), "observational-human")],
    rung: "L5",
    replication: { independentGroups: 2, note: "Reproduced in many independent cohorts; the association is not in dispute." },
    status: { peerReviewed: true },
    supports: [C("biological-age-measurement-that-predicts-outcome")],
    drift: "A validated predictor of age and an association with mortality are being used as an intervention endpoint. Predicting an outcome and responding usefully to treatment are different properties.",
    limitations: ["observational", "no evidence that intervention-induced clock change predicts outcome"]
  }),
  cl({
    id: CL("epigenetic-age-reversal-reported-without-a-control-arm"),
    statement: "In nine men given growth hormone, DHEA and metformin for a year, epigenetic age estimates decreased and thymic imaging suggested regeneration; the study had no control arm.",
    context: { species: "human", model: "nine healthy men aged 51-65", intervention: "growth hormone, DHEA, metformin for 12 months" },
    measurement: { measured: "biomarker", assay: "epigenetic clocks; thymic MRI", endpoint: "epigenetic age; thymic fat-free fraction", effect: "reported reduction in epigenetic age estimates" },
    evidence: [ev(S("fahy-2019-agingcell"), "case-series", { n: "9" })],
    rung: "L4",
    replication: { independentGroups: 0 },
    status: { peerReviewed: true },
    supports: [C("biological-age-measurement-that-predicts-outcome")],
    drift: "Reported widely as the first reversal of human aging. Nine men, no control arm, three concurrent drugs, and a surrogate endpoint whose response to intervention has no validated meaning — this claim is on the map as an example of the measurement problem, not as evidence of rejuvenation.",
    limitations: ["no control arm", "n=9", "three interventions at once", "unvalidated surrogate endpoint"]
  }),
  cl({
    id: CL("long-term-partial-reprogramming-is-tolerated-in-mice"),
    statement: "Long-term, intermittent in vivo partial reprogramming in middle-aged mice altered age-associated molecular changes without causing tumours or loss of cell identity over the treatment period.",
    context: { species: "mouse", model: "middle-aged and old mice", intervention: "long-term intermittent OSKM induction" },
    measurement: { measured: "biomarker", assay: "transcriptomic and epigenetic age-associated changes; histology", endpoint: "age-associated molecular profile; safety", effect: "age-associated changes altered; no tumours reported" },
    evidence: [ev(S("browder-2022-nataging"), "animal-controlled"), ev(S("yang-2023-cell"), "animal-controlled", { note: "epigenetic information loss as a driver, with reprogramming as a partial reversal" })],
    rung: "L2",
    replication: { independentGroups: 1, note: "Two groups (Izpisua Belmonte; Sinclair), both invested in the reprogramming hypothesis." },
    status: { peerReviewed: true },
    supports: [C("safe-partial-epigenetic-reprogramming-in-vivo"), C("cell-identity-retention-under-partial-reprogramming")],
    limitations: ["mouse", "molecular endpoints rather than function or lifespan in the wild-type animal"]
  })
];

const EXPERIMENTS = [
  ex({
    id: E("senolytic-rct-functional-endpoint"), name: "Randomised placebo-controlled senolytic trial with a functional primary endpoint",
    tests: [Q("senolytics-improve-human-function")], status: "proposed",
    design: { species: "human", model: "adults over 70 with reduced gait speed", intervention: "intermittent dasatinib + quercetin", comparator: "placebo", readout: "gait speed and six-minute walk at 6 and 12 months (primary); senescent markers in adipose biopsy (secondary); adverse events including delayed wound healing", duration: "2 years", n: "200-300" },
    discriminates: "A functional benefit under blinding would move the whole senescence branch from marker to therapy; a null result with confirmed marker reduction would show that clearing senescent cells is not sufficient.",
    feasibility: { costClass: "medium", durationClass: "years", requires: ["geriatric trial network", "off-patent drugs", "adipose biopsy capability"], ethics: "human research ethics approval" }
  }),
  ex({
    id: E("neutral-blood-exchange-independent-replication"), name: "Independent replication of neutral blood exchange in aged mice, then a plasma-exchange trial",
    tests: [Q("dilution-or-young-factors")], status: "proposed",
    design: { species: "mouse, then human", model: "aged mice; then adults over 70", intervention: "neutral blood exchange (saline-albumin); then therapeutic plasma exchange", comparator: "heterochronic exchange; sham apheresis in the human stage", readout: "muscle repair, cognition and frailty measures in mice; gait speed, cognition and inflammatory markers in humans", duration: "1 year (mouse) then 2 years (human)", n: "20 per arm; then 100-150" },
    discriminates: "Replication would make plasma exchange the fastest testable rejuvenation intervention, because the procedure already exists; failure to replicate would send the field back to identifying factors.",
    feasibility: { costClass: "medium", durationClass: "years", requires: ["an unaffiliated mouse aging laboratory", "apheresis service for the human stage"], ethics: "animal and human research ethics approval" }
  }),
  ex({
    id: E("clock-as-surrogate-validation"), name: "Validate epigenetic clocks as an intervention surrogate inside an existing trial",
    tests: [Q("clocks-track-intervention-benefit")], status: "proposed",
    design: { species: "human", model: "participants in an ongoing randomised trial with a clinical endpoint (any intervention plausibly age-related)", intervention: "none additional: methylation measured at baseline, 6 and 12 months", comparator: "the trial's own control arm", readout: "whether early clock change predicts the trial's pre-registered clinical endpoint, within and across arms", duration: "the host trial's duration", n: "whatever the host trial has" },
    discriminates: "If early clock movement predicts the clinical endpoint, clocks become a usable surrogate and every rejuvenation trial gets shorter; if it does not, the field's main endpoint is invalid and the map should regrade accordingly.",
    feasibility: { costClass: "low", durationClass: "years", requires: ["an existing trial willing to add methylation sampling", "pre-registration of the surrogate analysis"], ethics: "amendment to the host trial's approval" }
  })
];

run({ SOURCES, GOALS, CAPABILITIES, QUESTIONS, CLAIMS, EXPERIMENTS });

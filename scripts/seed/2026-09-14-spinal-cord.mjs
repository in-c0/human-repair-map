/* Seed: proving ground 3 — repair of a spinal cord injury.
 *
 * Provenance, not a build step (see scripts/lib/seed.mjs). Sources come from live Crossref and
 * PubMed lookups; every other record was authored by the session below from those sources'
 * abstracts and enters the map as `ai-proposed`. Nothing here has been read at figure level.
 *
 * Why this ground: spinal cord injury is where the map's distinction between restoring function
 * and repairing tissue is sharpest. Epidural stimulation and brain-spine interfaces have given
 * paralysed people voluntary stepping in humans (L4), while regrowing a severed corticospinal
 * tract across the lesion remains rodent-stage (L2). Two ways up the same wall, graded apart,
 * with the axon-regrowth route carrying the harder biology and the interface route carrying the
 * question of what it does when nothing below the lesion survived.
 *
 * Run:  node scripts/seed/2026-09-14-spinal-cord.mjs [--force]
 * Then: node scripts/build.mjs */

import { makeSeed, ids } from "../lib/seed.mjs";

const { S, G, C, Q, CL, E, CELL } = ids;
const DATE = "2026-09-14";
const seed = makeSeed({
  date: DATE,
  actor: { type: "ai", name: "Claude Code session b1762020 (Anthropic)", model: "claude-opus-5", session: "b1762020-2a53-4f0e-8cbd-18239bda19a3" },
  authored: "manual reasoning from the cited sources' abstracts (Crossref/Europe PMC), checked 2026-09-14; no source opened at figure level",
  script: "scripts/seed/2026-09-14-spinal-cord.mjs"
});
const { goal, cap, q, ex, cl, ev, run } = seed;
const UR = ["universal-repair"];

const SOURCES = [
  { slug: "fehlings-2012-plosone", doi: "10.1371/journal.pone.0032037", note: "STASCIS: early versus delayed decompression." },
  { slug: "bracken-1990-nejm", doi: "10.1056/NEJM199005173222001", note: "NASCIS 2. Included because the map should carry the negative and contested history, not only the wins." },
  { slug: "angeli-2018-nejm", doi: "10.1056/NEJMoa1803588" },
  { slug: "gill-2018-natmed", doi: "10.1038/s41591-018-0175-7" },
  { slug: "wagner-2018-nature", doi: "10.1038/s41586-018-0649-2" },
  { slug: "rowald-2022-natmed", doi: "10.1038/s41591-021-01663-5" },
  { slug: "lorach-2023-nature", doi: "10.1038/s41586-023-06094-5", note: "Brain-spine interface: digital bridge restoring natural walking." },
  { slug: "anderson-2018-nature", doi: "10.1038/s41586-018-0467-6", note: "Growth factors, substrate and activation together, across a complete transection in rodent." },
  { slug: "lu-2012-cell", doi: "10.1016/j.cell.2012.08.020" },
  { slug: "bradbury-2002-nature", doi: "10.1038/416636a", note: "Chondroitinase ABC." },
  { slug: "kucher-2018-nnr", doi: "10.1177/1545968318776371", note: "First-in-man anti-Nogo-A." },
  { slug: "rosenzweig-2018-natmed", doi: "10.1038/nm.4502", note: "Human neural stem cell grafts in the primate cord." }
];

const GOALS = [
  goal({
    id: G("spinal-cord-injury-repair"), name: "Repair of a spinal cord injury",
    parent: G("universal-repair"),
    description: "After the spinal cord is crushed or severed, restore what the person lost: voluntary movement below the lesion, sensation, and autonomic control of bladder, bowel, blood pressure and sexual function. Restoring the tract and restoring the function are different projects; the map keeps them apart because their evidence is decades apart.",
    projections: UR,
    existenceProof: "None for tract regeneration in a human. Function has been restored partially without repair: people with motor-complete injury have stepped over ground with epidural stimulation, and a brain-spine interface has restored volitional walking in one participant. Fish and amphibians regenerate the cord; mammals do not.",
    requires: [
      { all: [C("acute-cord-damage-limitation"), C("autonomic-function-restoration-after-sci")] },
      { any: [C("corticospinal-axon-regrowth-across-a-lesion"), C("spinal-circuit-reactivation-by-stimulation"), C("brain-spine-interface-volitional-control")], note: "OR-group: regrow the tract, drive the circuitry below it, or bridge the gap electronically. These are three different bets on the same deficit and the map does not assume one wins." }
    ],
    blockedBy: [Q("regrown-axons-form-useful-circuits"), Q("stimulation-benefit-without-spared-fibres"), Q("cord-repair-restores-autonomic-function")],
    testSuite: [
      { scenario: "incomplete injury, early surgical decompression", state: "partial", note: "earlier decompression is associated with better neurological improvement" },
      { scenario: "motor-complete injury, voluntary stepping with stimulation", state: "partial", note: "shown in small numbers of participants, in specialist centres, with training" },
      { scenario: "volitional natural walking through a brain-spine interface", state: "partial", note: "one participant, one group" },
      { scenario: "regrowth of a severed corticospinal tract to its original targets", state: "unsolved", note: "rodent-stage" },
      { scenario: "restored bladder and bowel control after complete injury", state: "unsolved", note: "the deficit patients rank highest is the least addressed" }
    ],
    informationLimited: false
  }),
  goal({
    id: G("sci-damage-limitation"), name: "Limiting the damage in the first hours",
    parent: G("spinal-cord-injury-repair"),
    description: "Prevent the secondary injury that follows the mechanical one — ischaemia, oedema, inflammation, excitotoxicity — so that less cord has to be repaired later.",
    projections: UR,
    requires: [{ all: [C("acute-cord-damage-limitation")] }]
  }),
  goal({
    id: G("sci-function-restoration"), name: "Restoring movement below the lesion",
    parent: G("spinal-cord-injury-repair"),
    description: "Return voluntary, useful movement below the injury by whichever route works: regrown connections, reactivated spinal circuitry, or an electronic bridge from the brain.",
    projections: UR,
    requires: [{ any: [C("corticospinal-axon-regrowth-across-a-lesion"), C("spinal-circuit-reactivation-by-stimulation"), C("brain-spine-interface-volitional-control")] }, { all: [C("glial-scar-permissiveness-for-regrowth")] }],
    blockedBy: [Q("regrown-axons-form-useful-circuits"), Q("stimulation-benefit-without-spared-fibres")]
  })
];

const CAPABILITIES = [
  cap({
    id: C("acute-cord-damage-limitation"), name: "Limit the damage in the hours after a cord injury", class: "control", primitive: "stop", projections: UR,
    description: "Reduce the secondary injury cascade after the initial trauma, so that more cord survives to be repaired or retrained.",
    target: { node: CELL("cns-neuron") },
    grade: { basis: "claims", rung: "L4", measured: "function", blocked: "science", note: "Surgical decompression within 24 hours is associated with better neurological improvement in a prospective cohort (Fehlings 2012), and is now common practice. Pharmacological neuroprotection is the opposite story: high-dose methylprednisolone (Bracken 1990) reported a benefit in a post-hoc subgroup, was adopted, and was then largely abandoned after the effect failed to hold up and the harms accumulated. The rung reflects decompression, not drugs.", drift: "'Steroids are given for spinal cord injury' — most guidelines no longer recommend them; the map keeps the history because it is the field's clearest example of a subgroup finding becoming standard care." },
    wouldMove: "A randomised trial of a neuroprotective intervention with a pre-specified primary neurological endpoint that succeeds.",
    evidenceAccessed: [S("fehlings-2012-plosone"), S("bracken-1990-nejm")]
  }),
  cap({
    id: C("corticospinal-axon-regrowth-across-a-lesion"), name: "Regrow severed axons across the injury", class: "control", primitive: "regenerate", projections: UR,
    description: "Have descending axons — corticospinal and other motor tracts — regrow through or around the lesion and reach the grey matter below it.",
    target: { node: CELL("cns-neuron") },
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "In rodents, combining a growth-permissive substrate, chemoattraction and neuron-intrinsic activation regrew propriospinal axons across a complete transection (Anderson 2018); neural stem cell grafts supported long-distance axon growth after severe injury (Lu 2012). Both are rodent. Human neural stem cell grafts have been placed in the primate cord with graft-derived axon extension (Rosenzweig 2018), which is the strongest large-animal evidence but still structure rather than function.", drift: "'Paralysis reversed in mice' — regrowth across a lesion has been achieved; what those axons then do is a separate and mostly unanswered question." },
    wouldMove: "Regrowth across a complete lesion in a non-human primate with a measured motor benefit, from a group unaffiliated with the original.",
    evidenceAccessed: [S("anderson-2018-nature"), S("lu-2012-cell"), S("rosenzweig-2018-natmed")]
  }),
  cap({
    id: C("glial-scar-permissiveness-for-regrowth"), name: "Make the scar a path rather than a wall", class: "control", primitive: "recalibrate", projections: UR,
    description: "Change the composition of the injury site — chondroitin sulphate proteoglycans, myelin inhibitors, astrocyte state — so that axons can grow through it.",
    target: { node: CELL("glia") },
    grade: { basis: "claims", rung: "L4", measured: "structure", blocked: "science", note: "Chondroitinase ABC degrades inhibitory proteoglycans and promoted functional recovery in rats (Bradbury 2002); anti-Nogo-A antibody, targeting a myelin inhibitor, has been given intrathecally to patients in a first-in-man study with acceptable tolerability (Kucher 2018) — a human safety readout, not a demonstrated functional benefit. The L4 records that the intervention has reached people, and the note records that it has not yet been shown to work in them.", drift: "The astrocytic scar was long described as purely inhibitory; later work argues it is also required for regrowth. The map treats 'remove the scar' as an unresolved framing, not a goal." },
    wouldMove: "A randomised trial of an anti-inhibitory agent with a motor endpoint that succeeds, or a large-animal study showing regrowth through a modified scar with function.",
    evidenceAccessed: [S("bradbury-2002-nature"), S("kucher-2018-nnr"), S("anderson-2018-nature")]
  }),
  cap({
    id: C("spinal-circuit-reactivation-by-stimulation"), name: "Wake up the circuitry below the injury", class: "control", primitive: "recalibrate", projections: UR,
    description: "Use epidural or transcutaneous stimulation of the lumbosacral cord, with training, to make spinal circuits below the lesion respond to whatever descending input remains.",
    target: { node: CELL("neural-connectivity") },
    grade: { basis: "claims", rung: "L4", measured: "function", blocked: "science", note: "Participants with motor-complete injury achieved over-ground walking with epidural stimulation and training (Angeli 2018, Gill 2018), and targeted spatiotemporal stimulation improved walking in participants with chronic injury (Wagner 2018, Rowald 2022). Human, functional, and replicated across at least three independent groups — but in single-digit numbers per study, in participants selected partly for spared fibres, and requiring implantation and months of training.", drift: "'Paralysed people walk again' — participants step in a specialised setting with a device on and training behind them; independent community walking is not what these papers report." },
    wouldMove: "A multi-centre trial in unselected participants with motor-complete injury reporting a functional benefit outside the laboratory.",
    evidenceAccessed: [S("angeli-2018-nejm"), S("gill-2018-natmed"), S("wagner-2018-nature"), S("rowald-2022-natmed")]
  }),
  cap({
    id: C("brain-spine-interface-volitional-control"), name: "Bridge the gap electronically, under the person's own control", class: "control", primitive: "reconnect", projections: UR,
    description: "Decode movement intention from cortex and deliver it as stimulation to the cord below the lesion, so that walking is willed rather than triggered.",
    target: { node: CELL("neural-connectivity") },
    grade: { basis: "claims", rung: "L4", measured: "function", blocked: "science", note: "A digital bridge between cortical recordings and epidural stimulation restored natural, volitional walking in a participant with chronic tetraplegia, with neurological improvement persisting when the bridge was off (Lorach 2023). One participant, one group, an implanted system: the strongest single human result on this ground and the least replicated.", drift: "The persistence of improvement with the bridge off is the most interesting part of the report and the part with n=1 behind it." },
    wouldMove: "A second participant in an unaffiliated centre, and a report of what happens over years rather than months.",
    evidenceAccessed: [S("lorach-2023-nature")]
  }),
  cap({
    id: C("autonomic-function-restoration-after-sci"), name: "Restore bladder, bowel and blood-pressure control", class: "control", primitive: "recalibrate", projections: UR,
    description: "Return autonomic function after a cord injury: continence, bowel control, stable blood pressure without autonomic dysreflexia, and sexual function.",
    target: { node: CELL("neural-connectivity") },
    grade: { basis: "no-evidence-located", rung: "L0", searchedOn: DATE, note: "Placed so the gap is visible. Autonomic recovery is consistently what people with spinal cord injury rank above walking, and this seed located no evidence base for restoring it; the stimulation literature cited here reports autonomic effects as secondary observations. Grading it is the first open task on this node." },
    wouldMove: "Any controlled human study with a primary autonomic endpoint — continence, cardiovascular stability — after a cord repair or stimulation intervention."
  })
];

const QUESTIONS = [
  q({
    id: Q("regrown-axons-form-useful-circuits"), projections: UR,
    question: "When axons are regrown across a spinal lesion, do they form connections that produce useful, controllable movement — or connections that produce spasticity, pain and nothing volitional?",
    why: "Every regeneration strategy on this ground is graded on structure because structure is what has been shown. If regrown axons do not wire usefully, the whole regeneration route is a mechanism with no therapy at the end of it, and the map should say so rather than implying that growth is the last step.",
    blocks: [C("corticospinal-axon-regrowth-across-a-lesion"), C("glial-scar-permissiveness-for-regrowth"), G("spinal-cord-injury-repair")],
    hypotheses: [
      "Regrown axons synapse promiscuously, and function requires guidance or activity-dependent refinement on top of growth.",
      "Rehabilitation and stimulation supply the refinement, so growth plus training is sufficient.",
      "Aberrant connections dominate and produce neuropathic pain, making incomplete regrowth worse than none."
    ],
    knownUnknowns: ["how much of rodent functional recovery after regrowth is the regrown tract rather than spared fibres or plasticity", "whether pain and spasticity scale with regrowth"],
    whatWouldResolve: "A large-animal study combining regrowth with selective silencing of the regrown population: if function disappears when the new axons are silenced, the circuit is doing the work."
  }),
  q({
    id: Q("stimulation-benefit-without-spared-fibres"), projections: UR,
    question: "Does epidural stimulation restore volitional movement in people with anatomically complete injury, or does it depend on spared descending fibres that clinical assessment cannot see?",
    why: "It decides who the therapy is for, and whether stimulation is a repair-free route to function or an amplifier for residual connection. It also decides whether stimulation and regeneration are alternatives or partners.",
    blocks: [C("spinal-circuit-reactivation-by-stimulation"), C("brain-spine-interface-volitional-control")],
    hypotheses: [
      "Discomplete injury is the rule: nearly all clinically complete injuries retain some fibres, and stimulation amplifies them.",
      "Lumbar circuits generate stepping patterns with no descending input, and volition is not required for the motor benefit.",
      "Both, in different participants, which is why the published series are small and selected."
    ],
    knownUnknowns: ["how to establish anatomical completeness in a living person", "whether participants in the published series were selected on residual connectivity"],
    whatWouldResolve: "Stimulation outcomes stratified by an objective measure of spared descending connectivity — high-resolution imaging or evoked potentials — in a multi-centre cohort."
  }),
  q({
    id: Q("cord-repair-restores-autonomic-function"), projections: UR,
    question: "Would any of the current repair or stimulation strategies restore bladder, bowel and cardiovascular control, or do those pathways need their own intervention?",
    why: "People with spinal cord injury rank autonomic function above walking. The field's endpoints are motor, so the map currently has an L0 node next to several L4 ones, and that mismatch is a statement about the field rather than about the biology.",
    blocks: [C("autonomic-function-restoration-after-sci"), G("spinal-cord-injury-repair")],
    hypotheses: [
      "Autonomic pathways are anatomically separate and will need separate targeting.",
      "Stimulation protocols already produce autonomic benefits that go unreported because the endpoints are motor.",
      "Autonomic circuits below the lesion degrade differently and are more recoverable."
    ],
    whatWouldResolve: "A trial of an existing stimulation protocol with continence or cardiovascular stability as the pre-registered primary endpoint."
  })
];

const CLAIMS = [
  cl({
    id: CL("early-decompression-improves-sci-outcome"),
    statement: "In a prospective multicentre cohort of acute cervical spinal cord injury, decompression within 24 hours was associated with a higher rate of two-grade or greater neurological improvement at six months than later surgery.",
    context: { species: "human", model: "acute cervical spinal cord injury", intervention: "surgical decompression within 24 h", comparator: "decompression after 24 h" },
    measurement: { measured: "function", assay: "ASIA impairment scale", endpoint: "neurological improvement at 6 months", effect: "higher odds of >=2 grade improvement with early surgery" },
    evidence: [ev(S("fehlings-2012-plosone"), "cohort")],
    rung: "L4",
    replication: { independentGroups: 1, note: "One prospective multicentre cohort; not randomised, and timing is confounded by injury severity and access to care." },
    status: { peerReviewed: true },
    supports: [C("acute-cord-damage-limitation")],
    limitations: ["observational: patients operated early may differ systematically", "no randomised trial of timing exists"]
  }),
  cl({
    id: CL("high-dose-steroids-sci-benefit-was-a-subgroup-finding"),
    statement: "The NASCIS 2 trial of methylprednisolone in acute spinal cord injury reported motor and sensory improvement only in a post-hoc subgroup treated within eight hours; the primary analysis of the whole cohort was not positive.",
    context: { species: "human", model: "acute spinal cord injury", intervention: "high-dose methylprednisolone or naloxone", comparator: "placebo" },
    measurement: { measured: "function", assay: "motor and sensory scores", endpoint: "neurological recovery at 6 months", effect: "no benefit overall; benefit reported in the within-8-hours subgroup" },
    evidence: [ev(S("bracken-1990-nejm"), "rct")],
    rung: "L5",
    replication: { independentGroups: 1, note: "The trial itself is high quality; the disputed part is the subgroup analysis, which later trials and guideline reviews did not sustain." },
    status: { peerReviewed: true },
    contradicts: [C("acute-cord-damage-limitation")],
    drift: "'Steroids improve spinal cord injury outcomes' — a post-hoc subgroup result entered practice for two decades and was then withdrawn from most guidelines. Kept on the map as a documented failure mode of evidence, not as support.",
    limitations: ["1990 trial with methods and endpoints of its era", "the subgroup was not pre-specified"]
  }),
  cl({
    id: CL("epidural-stimulation-enables-overground-walking"),
    statement: "Participants with chronic motor-complete spinal cord injury achieved voluntary over-ground walking with lumbosacral epidural stimulation combined with intensive locomotor training.",
    context: { species: "human", model: "chronic motor-complete spinal cord injury", intervention: "epidural stimulation plus locomotor training" },
    measurement: { measured: "function", assay: "over-ground walking, stepping kinematics", endpoint: "voluntary stepping and walking", effect: "over-ground walking achieved in some participants" },
    evidence: [ev(S("angeli-2018-nejm"), "case-series", { n: "4" }), ev(S("gill-2018-natmed"), "case-report", { n: "1" })],
    rung: "L4",
    replication: { independentGroups: 2, note: "Two unaffiliated groups (Louisville; Mayo) reported the same category of result in the same year." },
    status: { peerReviewed: true },
    supports: [C("spinal-circuit-reactivation-by-stimulation")],
    limitations: ["single-digit participant numbers", "months of training and a specialised setting", "spared descending fibres cannot be excluded"]
  }),
  cl({
    id: CL("targeted-stimulation-improves-walking-in-chronic-sci"),
    statement: "Spatiotemporally targeted epidural stimulation, timed to the intended movement, restored walking in participants with chronic spinal cord injury and produced improvements that persisted after training.",
    context: { species: "human", model: "chronic incomplete and complete spinal cord injury", intervention: "activity-dependent targeted epidural stimulation with rehabilitation" },
    measurement: { measured: "function", assay: "walking, trunk and leg motor function", endpoint: "restored locomotion", effect: "walking restored within a single day in some participants; improvement persisted with training" },
    evidence: [ev(S("wagner-2018-nature"), "case-series", { n: "3" }), ev(S("rowald-2022-natmed"), "case-series", { n: "3" })],
    rung: "L4",
    replication: { independentGroups: 1, note: "One group (Courtine/Bloch, Lausanne) across two reports; independent of the Louisville and Mayo work above, which is why the capability above counts three groups." },
    status: { peerReviewed: true },
    supports: [C("spinal-circuit-reactivation-by-stimulation")],
    limitations: ["three participants per report", "purpose-built implant and software"]
  }),
  cl({
    id: CL("brain-spine-interface-restores-volitional-walking"),
    statement: "A digital bridge decoding cortical activity and driving epidural stimulation restored natural, volitional walking in a participant with chronic tetraplegia, with neurological improvement that persisted when the bridge was switched off.",
    context: { species: "human", model: "chronic tetraplegia after cervical spinal cord injury", intervention: "brain-spine interface: cortical decoding driving spinal stimulation" },
    measurement: { measured: "function", assay: "walking on ground and stairs, volitional control", endpoint: "natural walking under volitional control", effect: "walking restored; improvement retained with stimulation off" },
    evidence: [ev(S("lorach-2023-nature"), "case-report", { n: "1" })],
    rung: "L4",
    replication: { independentGroups: 0, note: "One participant, one group." },
    status: { peerReviewed: true },
    supports: [C("brain-spine-interface-volitional-control")],
    limitations: ["n=1", "two implanted systems and continuous technical support", "the persistence effect has no replication"]
  }),
  cl({
    id: CL("combined-treatment-regrows-axons-across-complete-transection-in-rodents"),
    statement: "Combining neuron-intrinsic growth activation, a growth-supportive substrate and chemoattraction regrew propriospinal axons across a complete spinal cord transection in rodents, which no single component achieved.",
    context: { species: "rat and mouse", model: "complete spinal cord transection", intervention: "growth activation plus substrate plus chemoattractant" },
    measurement: { measured: "structure", assay: "anterograde tracing, histology", endpoint: "axon regrowth across the lesion", effect: "robust regrowth across the lesion with the combination only" },
    evidence: [ev(S("anderson-2018-nature"), "animal-controlled"), ev(S("lu-2012-cell"), "animal-controlled", { note: "neural stem cell grafts supporting long-distance growth after severe injury" })],
    rung: "L2",
    replication: { independentGroups: 1, note: "Two reports from overlapping Californian groups (Sofroniew; Tuszynski)." },
    status: { peerReviewed: true },
    supports: [C("corticospinal-axon-regrowth-across-a-lesion")],
    limitations: ["rodent", "regrowth demonstrated anatomically; functional benefit is the open question"]
  }),
  cl({
    id: CL("human-neural-stem-cell-grafts-extend-axons-in-primate-cord"),
    statement: "Human neural stem cells grafted into the injured primate spinal cord survived, differentiated and extended large numbers of axons over long distances into the host cord, with modest forelimb functional improvement.",
    context: { species: "rhesus monkey", model: "cervical hemisection", intervention: "human neural stem cell graft" },
    measurement: { measured: "structure", assay: "histology, tracing, forelimb function", endpoint: "graft survival and axon extension", effect: "extensive graft-derived axon growth; modest functional improvement" },
    evidence: [ev(S("rosenzweig-2018-natmed"), "animal-controlled")],
    rung: "L3",
    replication: { independentGroups: 0, note: "One group (Tuszynski)." },
    status: { peerReviewed: true },
    supports: [C("corticospinal-axon-regrowth-across-a-lesion")],
    limitations: ["hemisection, not complete transection", "functional improvement modest and secondary to the anatomical readout"]
  }),
  cl({
    id: CL("chondroitinase-promotes-recovery-in-rats"),
    statement: "Degrading chondroitin sulphate proteoglycans with chondroitinase ABC promoted axon regeneration and functional recovery after spinal cord injury in rats.",
    context: { species: "rat", model: "spinal cord injury", intervention: "intrathecal chondroitinase ABC" },
    measurement: { measured: "function", assay: "behavioural recovery, tracing", endpoint: "locomotor and proprioceptive recovery", effect: "improved recovery versus control" },
    evidence: [ev(S("bradbury-2002-nature"), "animal-controlled")],
    rung: "L2",
    replication: { independentGroups: 1, note: "Widely reproduced in rodents since; no human trial has followed, which is itself informative." },
    status: { peerReviewed: true },
    supports: [C("glial-scar-permissiveness-for-regrowth")],
    limitations: ["rodent", "enzyme stability and delivery are unsolved for human use"]
  }),
  cl({
    id: CL("anti-nogo-antibody-tolerated-in-first-in-man"),
    statement: "Intrathecal anti-Nogo-A antibody was delivered to patients with acute spinal cord injury in a first-in-man study and was tolerated, with no efficacy conclusion drawn.",
    context: { species: "human", model: "acute spinal cord injury", intervention: "intrathecal anti-Nogo-A antibody" },
    measurement: { measured: "none", assay: "safety and tolerability", endpoint: "adverse events, pharmacokinetics", effect: "acceptable tolerability; no efficacy endpoint" },
    evidence: [ev(S("kucher-2018-nnr"), "controlled-trial")],
    rung: "L4",
    replication: { independentGroups: 0, note: "One sponsor-led programme." },
    status: { peerReviewed: true },
    supports: [C("glial-scar-permissiveness-for-regrowth")],
    drift: "A first-in-man safety study is often cited as evidence that a mechanism works in humans. It is evidence that it can be given to humans.",
    limitations: ["no efficacy endpoint by design"]
  })
];

const EXPERIMENTS = [
  ex({
    id: E("silence-regrown-axons-large-animal"), name: "Regrow axons across a lesion, then silence them",
    tests: [Q("regrown-axons-form-useful-circuits")], status: "proposed",
    design: { species: "rodent first, then non-human primate", model: "complete transection with a combination regrowth protocol", intervention: "chemogenetic or optogenetic silencing of the regrown population after functional recovery", comparator: "sham silencing; non-regrown controls", readout: "locomotor function with and without silencing; pain and spasticity measures", duration: "12-18 months", n: "10-12 per arm in rodent" },
    discriminates: "If function collapses when the regrown axons are silenced, the new circuit is doing the work; if it does not, recovery came from spared fibres or plasticity and the regrowth literature is measuring the wrong thing.",
    feasibility: { costClass: "medium", durationClass: "years", requires: ["combination regrowth protocol", "chemogenetic tools", "primate facility for the second stage"], ethics: "animal ethics approval" }
  }),
  ex({
    id: E("stimulation-stratified-by-spared-connectivity"), name: "Epidural stimulation outcomes stratified by objectively measured spared connectivity",
    tests: [Q("stimulation-benefit-without-spared-fibres")], status: "proposed",
    design: { species: "human", model: "chronic clinically motor-complete spinal cord injury", intervention: "standard epidural stimulation and training protocol", comparator: "stratification, not randomisation: participants grouped by spared descending connectivity on high-resolution imaging and evoked potentials", readout: "volitional movement below the lesion, over-ground walking, autonomic measures", duration: "3 years", n: "40-60 across centres" },
    discriminates: "If benefit tracks spared connectivity, stimulation is an amplifier and regeneration remains necessary; if participants with no measurable sparing benefit equally, the spinal circuitry is doing more than the field assumes.",
    feasibility: { costClass: "high", durationClass: "years", requires: ["multi-centre implant programme", "high-resolution spinal imaging", "shared outcome protocol"], ethics: "human research ethics approval" }
  }),
  ex({
    id: E("autonomic-endpoint-stimulation-trial"), name: "Stimulation trial with continence and cardiovascular stability as the primary endpoint",
    tests: [Q("cord-repair-restores-autonomic-function")], status: "proposed",
    design: { species: "human", model: "chronic spinal cord injury with autonomic dysfunction", intervention: "an existing epidural or transcutaneous stimulation protocol", comparator: "sham stimulation", readout: "urodynamics, continence diary, blood pressure stability, dysreflexia episodes", duration: "2 years", n: "40-60" },
    discriminates: "A positive autonomic result would move a node the map currently grades L0 and would change what the field measures; a null result would establish that autonomic pathways need their own strategy.",
    feasibility: { costClass: "medium", durationClass: "years", requires: ["existing implanted cohorts", "urodynamics and autonomic testing"], ethics: "human research ethics approval" }
  })
];

run({ SOURCES, GOALS, CAPABILITIES, QUESTIONS, CLAIMS, EXPERIMENTS });

/* Seed: proving ground 2 — repair of a transected peripheral nerve.
 *
 * Provenance, not a build step (see scripts/lib/seed.mjs). Sources come from live Crossref
 * and PubMed lookups; every other record was authored by the session below from those sources'
 * abstracts and enters the map as `ai-proposed`. Nothing here has been read at figure level.
 *
 * Why this ground: peripheral nerve is the case where the body does regenerate — axons regrow
 * at about a millimetre a day — and the result is still poor. The limit is not "can an axon
 * grow" but time: the distal Schwann cell environment and the denervated muscle both decay
 * over months, so a proximal injury heals into a limb that does not work. It is the clearest
 * example on the map of a repair blocked by a clock rather than by a missing mechanism.
 *
 * Run:  node scripts/seed/2026-09-14-peripheral-nerve.mjs [--force]
 * Then: node scripts/build.mjs */

import { makeSeed, ids } from "../lib/seed.mjs";

const { S, G, C, Q, CL, E, CELL } = ids;
const DATE = "2026-09-14";
const seed = makeSeed({
  date: DATE,
  actor: { type: "ai", name: "Claude Code session b1762020 (Anthropic)", model: "claude-opus-5", session: "b1762020-2a53-4f0e-8cbd-18239bda19a3" },
  authored: "manual reasoning from the cited sources' abstracts (Crossref/Europe PMC), checked 2026-09-14; no source opened at figure level",
  script: "scripts/seed/2026-09-14-peripheral-nerve.mjs"
});
const { goal, cap, q, ex, cl, ev, run } = seed;
const UR = ["universal-repair"];
const both = ["universal-repair", "rejuvenation"];

const SOURCES = [
  { slug: "ruijs-2005-prs", doi: "10.1097/01.prs.0000172896.86594.07", note: "Meta-analysis of predictors of outcome after median and ulnar nerve repair." },
  { slug: "weber-2000-prs", doi: "10.1097/00006534-200010000-00013", note: "Randomised comparison of polyglycolic acid conduit against standard repair in digital nerves." },
  { slug: "mackinnon-1990-prs", doi: "10.1097/00006534-199003000-00015" },
  { slug: "safa-2020-microsurgery", doi: "10.1002/micr.30574", note: "RANGER registry: processed nerve allograft outcomes." },
  { slug: "oberlin-1994-jhs", doi: "10.1016/0363-5023(94)90011-6", note: "The nerve transfer that changed brachial plexus surgery." },
  { slug: "gordon-2010-expneurol", doi: "10.1016/j.expneurol.2009.09.020", note: "One hour of 20 Hz stimulation after carpal tunnel release; human reinnervation." },
  { slug: "gordon-2020-ijms", doi: "10.3390/ijms21228652", note: "Review of chronic denervation and Schwann cell decline." }
];

const GOALS = [
  goal({
    id: G("peripheral-nerve-repair"), name: "Repair of a transected peripheral nerve",
    parent: G("universal-repair"),
    description: "After a peripheral nerve is cut or crushed, restore motor and sensory function to the level the limb had before the injury: axons regrown to their original targets, myelination restored, muscle reinnervated before it is lost, and sensation returned with normal discrimination and no neuropathic pain.",
    projections: UR,
    existenceProof: "Partial and route-dependent. A clean digital nerve repaired immediately recovers useful sensation in most patients; a proximal ulnar or sciatic transection in an adult does not recover useful intrinsic muscle function by any current method. Axon regrowth itself is routine; what fails is arriving in time.",
    requires: [
      { all: [C("nerve-gap-bridging"), C("axon-regrowth-across-a-repair"), C("timely-muscle-reinnervation"), C("sensory-target-reinnervation-with-discrimination")] },
      { any: [C("distal-schwann-cell-support-maintenance"), C("regeneration-speed-increase")], note: "OR-group: keep the distal pathway alive long enough, or make the axons arrive sooner. Both address the same clock; nobody knows which is achievable in a human." }
    ],
    blockedBy: [Q("chronic-denervation-reversible-in-humans"), Q("human-axon-regeneration-rate-increase")],
    testSuite: [
      { scenario: "clean digital nerve laceration, repaired within days", state: "routine" },
      { scenario: "median nerve laceration at the wrist in a young adult", state: "partial", note: "sensation usually returns; two-point discrimination often does not" },
      { scenario: "3 cm gap in a sensory nerve", state: "partial", note: "conduits and processed allografts close short gaps; long gaps still need an autograft" },
      { scenario: "proximal ulnar nerve transection, intrinsic hand muscles", state: "unsolved", note: "regrowth distance times regrowth rate exceeds the muscle's survival window" },
      { scenario: "brachial plexus avulsion", state: "partial", note: "nerve transfers restore elbow flexion; the hand is not restored" }
    ],
    informationLimited: false
  }),
  goal({
    id: G("nerve-continuity-restoration"), name: "Restoration of nerve continuity",
    parent: G("peripheral-nerve-repair"),
    description: "Re-establish a physical path from the proximal stump to the distal nerve, with fascicles aligned and without tension, whether by direct repair, a graft or a conduit.",
    projections: UR,
    requires: [{ any: [C("nerve-gap-bridging"), C("nerve-transfer-from-a-donor-nerve")] }, { all: [C("axon-regrowth-across-a-repair")] }]
  }),
  goal({
    id: G("nerve-target-restoration"), name: "Restoration of the targets a nerve serves",
    parent: G("peripheral-nerve-repair"),
    description: "Get the regrowing axons to a muscle that can still be reinnervated and to sensory end organs that still work, and confirm that the connections are functional rather than merely present.",
    projections: UR,
    requires: [{ all: [C("timely-muscle-reinnervation"), C("sensory-target-reinnervation-with-discrimination"), C("reinnervation-verification-in-humans")] }],
    blockedBy: [Q("chronic-denervation-reversible-in-humans")]
  })
];

const CAPABILITIES = [
  cap({
    id: C("nerve-gap-bridging"), name: "Bridge a gap in a cut nerve", class: "control", primitive: "reconnect", projections: UR,
    description: "Span the distance between two nerve stumps so that axons have a path to grow along, without the tension that a direct suture would put on the repair.",
    target: { node: CELL("peripheral-neuron") },
    grade: { basis: "claims", rung: "L5", measured: "function", blocked: "framework", note: "Autograft is the clinical standard and works. Hollow conduits match it in randomised comparison for short digital-nerve gaps (Weber 2000, Mackinnon 1990); processed allografts report comparable meaningful recovery in a multicentre registry (Safa 2020, registry not randomised). The remaining limit is gap length and donor morbidity, not whether a gap can be bridged.", drift: "'Nerve gaps are solved' — short sensory gaps are; long motor gaps still depend on how fast the axons cross and what is waiting at the far end." },
    wouldMove: "A randomised comparison in long (>3 cm) motor gaps showing an off-the-shelf conduit or allograft matching autograft on muscle function, not just sensory recovery.",
    evidenceAccessed: [S("weber-2000-prs"), S("mackinnon-1990-prs"), S("safa-2020-microsurgery")]
  }),
  cap({
    id: C("nerve-transfer-from-a-donor-nerve"), name: "Rewire a nerve from a nearby healthy donor", class: "control", primitive: "reconnect", projections: UR,
    description: "Cut an expendable working nerve fascicle near the target muscle and suture it to the paralysed nerve, so that regrowth starts close to the muscle instead of at the original injury.",
    target: { node: CELL("peripheral-neuron") },
    grade: { basis: "claims", rung: "L5", measured: "function", blocked: "science", note: "The Oberlin transfer (ulnar fascicle to biceps branch) restored elbow flexion in patients with C5-C6 avulsion where no repair at the plexus was possible (Oberlin 1994), and nerve transfers are now standard for proximal injuries. It works because it shortens the distance, which is a workaround for the clock rather than a fix for it. Donor nerves for intrinsic hand muscles do not exist in the same way." },
    wouldMove: "A transfer strategy that restores intrinsic hand function after a proximal injury, which no donor currently provides.",
    evidenceAccessed: [S("oberlin-1994-jhs")]
  }),
  cap({
    id: C("axon-regrowth-across-a-repair"), name: "Get axons to grow across the repair", class: "control", primitive: "regenerate", projections: UR,
    description: "Have the cut axons sprout, cross the repair site and enter the distal nerve rather than forming a neuroma at the junction.",
    target: { node: CELL("peripheral-neuron") },
    grade: { basis: "standard-of-care", rung: "L5", measured: "structure", blocked: "none", note: "Axons regenerate across a coapted peripheral nerve repair routinely; this is why peripheral nerve differs from spinal cord. Sprouting is not the constraint, and grading it L5 makes the real constraint visible by contrast: what is graded low below is arrival in time and correct targeting, not growth." },
    evidenceAccessed: [S("ruijs-2005-prs")]
  }),
  cap({
    id: C("distal-schwann-cell-support-maintenance"), name: "Keep the distal nerve able to receive axons", class: "control", primitive: "preserve", projections: UR,
    description: "Maintain the denervated distal stump — Schwann cells in a growth-supportive state, bands of Bungner, trophic signalling — for the months an axon needs to reach it, instead of letting it atrophy into a path that no longer guides.",
    target: { node: CELL("peripheral-neuron") },
    grade: { basis: "claims", rung: "L2", measured: "structure", blocked: "science", note: "Chronic denervation degrades Schwann cell support and is a documented cause of poor outcome after proximal injury (Gordon 2020, review of rodent and human evidence). Interventions that maintain the distal environment are rodent-stage; no human therapy exists.", drift: "Described in clinical writing as 'the muscle atrophies', which is only half of it: the nerve pathway degrades as well, and it degrades whether or not the muscle is exercised." },
    wouldMove: "A large-animal study in which the distal stump is kept receptive for six months and delayed repair then yields function comparable to immediate repair.",
    evidenceAccessed: [S("gordon-2020-ijms")]
  }),
  cap({
    id: C("regeneration-speed-increase"), name: "Make axons regrow faster than a millimetre a day", class: "control", primitive: "recalibrate", projections: UR,
    description: "Raise the rate at which regenerating axons advance, or shorten the delay before they start, so that they reach the target while the target is still viable.",
    target: { node: CELL("peripheral-neuron") },
    grade: { basis: "claims", rung: "L4", measured: "function", blocked: "science", note: "One hour of 20 Hz electrical stimulation applied to the nerve at the time of surgery accelerated axon outgrowth and improved muscle reinnervation in patients after carpal tunnel release (Gordon 2010). That is human evidence for shortening the delay before regeneration starts, in a short-distance, low-stakes injury. Whether it helps over the distances that matter is untested.", drift: "'Electrical stimulation speeds nerve regeneration' — it shortens staggered regeneration onset in a distal compression injury; the millimetre-a-day rate itself has not been shown to change in humans." },
    wouldMove: "A randomised trial of conditioning stimulation in a proximal nerve injury with muscle function, not sensory latency, as the endpoint.",
    evidenceAccessed: [S("gordon-2010-expneurol"), S("gordon-2020-ijms")]
  }),
  cap({
    id: C("timely-muscle-reinnervation"), name: "Reinnervate a muscle before it is lost", class: "control", primitive: "reconnect", projections: UR,
    description: "Restore motor endplates on a denervated muscle while the muscle still has the fibres, endplates and satellite cells to respond — in practice, within roughly a year of denervation.",
    target: { node: CELL("skeletal-muscle") },
    grade: { basis: "claims", rung: "L2", measured: "function", blocked: "science", note: "Reinnervation within months restores function; after prolonged denervation the muscle does not recover even when axons arrive, and no clinical intervention changes that window. The evidence for the window itself is clinical and consistent (Ruijs 2005 identifies delay and proximal level as the strongest predictors of failure); interventions to extend it are rodent-stage." },
    wouldMove: "Any intervention that lets a muscle denervated for over a year recover useful force after reinnervation, shown in a large animal.",
    evidenceAccessed: [S("ruijs-2005-prs"), S("gordon-2020-ijms")]
  }),
  cap({
    id: C("sensory-target-reinnervation-with-discrimination"), name: "Restore sensation, not just feeling", class: "control", primitive: "reconnect", projections: UR,
    description: "Reinnervate sensory end organs so that the patient recovers two-point discrimination and localisation, rather than the diffuse protective sensation that a repaired nerve usually delivers.",
    target: { node: CELL("peripheral-neuron") },
    grade: { basis: "claims", rung: "L4", measured: "function", blocked: "science", note: "Protective sensation returns after most repairs; normal discrimination usually does not in adults, and age is one of the strongest predictors of the difference (Ruijs 2005). The gap between 'feels something' and 'can identify an object' is a cortical remapping problem as much as a peripheral one, which is why this is graded on function rather than structure." },
    wouldMove: "A repair method or rehabilitation protocol that restores adult two-point discrimination to normal in a randomised comparison.",
    evidenceAccessed: [S("ruijs-2005-prs")]
  }),
  cap({
    id: C("reinnervation-verification-in-humans"), name: "Tell whether reinnervation is actually happening", class: "verify", primitive: "preserve", projections: UR,
    description: "Determine, months before functional recovery would be visible, whether axons have reached the target and whether the muscle is being reinnervated — so a failed repair can be revised while revision still helps.",
    target: { node: CELL("peripheral-neuron") },
    grade: { basis: "standard-of-care", rung: "L4", measured: "biomarker", blocked: "science", note: "Electromyography and nerve conduction studies are routine clinical practice for this purpose. Electromyography and nerve conduction studies detect reinnervation in humans and are routine, but they report late and coarsely; ultrasound and MR neurography add anatomy, not function. The clinical consequence is that the decision to revise a repair is usually made after the window for revision has closed." },
    wouldMove: "An imaging or electrophysiological readout that predicts, within weeks of repair, whether a given repair will reinnervate its target.",
    evidenceAccessed: [S("ruijs-2005-prs")]
  })
];

const QUESTIONS = [
  q({
    id: Q("chronic-denervation-reversible-in-humans"), projections: UR,
    question: "Can a muscle and a distal nerve pathway that have been denervated for many months be made receptive again, so that a late repair works as well as an early one?",
    why: "It is the single question that decides whether proximal nerve injury is repairable at all. Every current strategy — nerve transfers, faster regrowth, shorter grafts — is an attempt to beat a clock. If the clock could be stopped, the surgery would stop being a race.",
    blocks: [C("distal-schwann-cell-support-maintenance"), C("timely-muscle-reinnervation"), G("peripheral-nerve-repair")],
    hypotheses: [
      "Schwann cell support can be maintained pharmacologically or by electrical activity, and the muscle follows.",
      "The muscle is the harder limit: endplates and satellite cells are lost irreversibly regardless of the pathway.",
      "Both decay, but a period of denervation can be tolerated if the muscle is kept active by stimulation."
    ],
    knownUnknowns: ["how long the human window actually is, as opposed to the rodent window", "whether chronic electrical stimulation of denervated muscle preserves reinnervation capacity or only bulk", "which cell population fails first in humans"],
    whatWouldResolve: "A large-animal study with denervation held for six to twelve months under an intervention, then repair, with force generation and endplate counts compared against immediate repair; then a trial in patients with delayed presentation."
  }),
  q({
    id: Q("human-axon-regeneration-rate-increase"), projections: UR,
    question: "Can the rate of human axon regeneration be raised above about one millimetre per day, or is that rate a hard property of the axon?",
    why: "Distance divided by rate is the whole problem in proximal injury. A doubling of rate would bring the intrinsic hand muscles inside the survival window; nothing else on this map would do that without new surgery.",
    blocks: [C("regeneration-speed-increase"), C("timely-muscle-reinnervation")],
    hypotheses: [
      "The observed rate is limited by staggered onset, not by transport, so removing the delay is most of the available gain — which is what conditioning stimulation does.",
      "Rate is set by slow axonal transport of cytoskeletal protein and cannot be raised much.",
      "Rate can be raised but at the cost of targeting accuracy."
    ],
    knownUnknowns: ["what fraction of the delay is onset rather than elongation in humans", "whether any intervention has ever been measured against elongation rate directly in a person"],
    whatWouldResolve: "A human study that separates onset delay from elongation rate — serial imaging or a Tinel-sign time series under an intervention — showing elongation faster than the historical rate."
  }),
  q({
    id: Q("motor-sensory-mistargeting-after-repair"), projections: UR,
    question: "How much of the functional loss after a repaired nerve is mistargeting — motor axons entering sensory pathways and the wrong muscles — and can regrowth be guided to the correct fascicle?",
    why: "If the axons arrive but arrive in the wrong place, then bridging and speed are solved problems and the map's attention belongs on guidance instead.",
    blocks: [C("axon-regrowth-across-a-repair"), C("sensory-target-reinnervation-with-discrimination")],
    hypotheses: [
      "Mistargeting dominates the residual deficit in mixed nerves, and fascicle-matched repair or selective guidance would recover most of it.",
      "Mistargeting is largely corrected centrally by cortical remapping in the young and not in adults.",
      "Mistargeting is minor next to the time-dependent loss of the target."
    ],
    whatWouldResolve: "Retrograde tracing in a large-animal mixed-nerve repair quantifying how many motor neurons reach motor targets, paired with human functional outcome under fascicle-matched versus conventional repair."
  })
];

const CLAIMS = [
  cl({
    id: CL("nerve-repair-outcome-worsens-with-delay-and-proximal-level"),
    statement: "After median or ulnar nerve repair, delay to repair, a more proximal injury level and older age are the strongest predictors of poor motor and sensory recovery; a substantial fraction of adults never regain useful function.",
    context: { species: "human", model: "median and ulnar nerve transection and repair" },
    measurement: { measured: "function", assay: "motor and sensory grading across pooled series", endpoint: "recovery of motor and sensory function", effect: "worse recovery with longer delay, more proximal level and higher age" },
    evidence: [ev(S("ruijs-2005-prs"), "meta-analysis")],
    rung: "L5",
    replication: { independentGroups: 2, note: "A meta-analysis pooling multiple independent series." },
    status: { peerReviewed: true },
    supports: [C("timely-muscle-reinnervation"), C("sensory-target-reinnervation-with-discrimination")],
    limitations: ["pooled retrospective series with heterogeneous outcome scales", "predictors are associations, not a demonstrated mechanism"]
  }),
  cl({
    id: CL("conduit-matches-suture-in-short-digital-nerve-gaps"),
    statement: "In a randomised prospective comparison, a polyglycolic acid conduit gave sensory recovery at least equal to standard direct repair or graft in digital nerve gaps, with an advantage in gaps of 4 mm or more.",
    context: { species: "human", model: "digital nerve transection", intervention: "polyglycolic acid conduit", comparator: "end-to-end repair or nerve graft" },
    measurement: { measured: "function", assay: "two-point discrimination", endpoint: "sensory recovery at one year", effect: "equal or better recovery with the conduit in short gaps" },
    evidence: [ev(S("weber-2000-prs"), "rct"), ev(S("mackinnon-1990-prs"), "case-series", { note: "earlier clinical series with the same conduit" })],
    rung: "L5",
    replication: { independentGroups: 1, note: "One randomised trial with a supporting earlier series from an overlapping group; widely adopted since." },
    status: { peerReviewed: true },
    supports: [C("nerve-gap-bridging")],
    limitations: ["sensory digital nerves only", "short gaps; conduits are not used this way for long motor gaps"]
  }),
  cl({
    id: CL("processed-allograft-recovers-function-in-registry"),
    statement: "In a multicentre registry of processed nerve allograft repairs across body sites, most repairs reported meaningful sensory or motor recovery, including in gaps longer than conduits are used for.",
    context: { species: "human", model: "peripheral nerve gaps repaired with processed allograft" },
    measurement: { measured: "function", assay: "meaningful recovery scales", endpoint: "sensory and motor recovery", effect: "meaningful recovery in the majority of reported repairs" },
    evidence: [ev(S("safa-2020-microsurgery"), "registry-entry")],
    rung: "L4",
    replication: { independentGroups: 0, note: "An industry-sponsored registry, not a randomised comparison against autograft; reporting is voluntary." },
    status: { peerReviewed: true },
    supports: [C("nerve-gap-bridging")],
    drift: "'Allografts equal autografts' — the registry has no randomised control arm and cannot support an equivalence claim.",
    limitations: ["selection and reporting bias inherent to a voluntary registry", "no control arm"]
  }),
  cl({
    id: CL("oberlin-transfer-restores-elbow-flexion"),
    statement: "Transferring a fascicle of the ulnar nerve to the biceps motor branch restored elbow flexion in patients with C5-C6 root avulsion, where repair at the level of the injury was not possible.",
    context: { species: "human", model: "C5-C6 brachial plexus avulsion", intervention: "ulnar fascicle to musculocutaneous biceps branch transfer" },
    measurement: { measured: "function", assay: "muscle grading", endpoint: "elbow flexion strength", effect: "useful elbow flexion recovered" },
    evidence: [ev(S("oberlin-1994-jhs"), "case-series", { n: "4" })],
    rung: "L4",
    replication: { independentGroups: 2, note: "The original series was small; the transfer has since been reproduced widely and is standard practice, though those series are not cited here." },
    status: { peerReviewed: true },
    supports: [C("nerve-transfer-from-a-donor-nerve")],
    limitations: ["four patients in the original report", "restores one movement, not the hand"]
  }),
  cl({
    id: CL("brief-electrical-stimulation-accelerates-human-reinnervation"),
    statement: "One hour of 20 Hz electrical stimulation of the median nerve at the time of carpal tunnel surgery accelerated axon outgrowth and improved muscle reinnervation in patients compared with surgery alone.",
    context: { species: "human", model: "chronic median nerve compression at the wrist", intervention: "1 h 20 Hz intraoperative stimulation", comparator: "surgery alone" },
    measurement: { measured: "function", assay: "motor unit number estimation and electrophysiology", endpoint: "muscle reinnervation", effect: "faster and more complete reinnervation with stimulation" },
    evidence: [ev(S("gordon-2010-expneurol"), "controlled-trial")],
    rung: "L4",
    replication: { independentGroups: 0, note: "One group (Gordon); the mechanism is supported by extensive rodent work from the same laboratory." },
    status: { peerReviewed: true },
    supports: [C("regeneration-speed-increase")],
    limitations: ["a compression injury over a short distance, not a transection over a long one", "electrophysiological endpoints rather than restored hand function"]
  }),
  cl({
    id: CL("chronic-denervation-degrades-the-distal-pathway"),
    statement: "Prolonged denervation degrades the distal nerve's capacity to support regeneration — Schwann cells lose their growth-supportive state — and this decline, alongside muscle atrophy, is a principal reason that proximal nerve injuries recover poorly.",
    context: { species: "rodent and human", model: "chronic denervation after proximal nerve injury" },
    measurement: { measured: "structure", endpoint: "Schwann cell support and reinnervation capacity over time", effect: "progressive loss of support with time since denervation" },
    evidence: [ev(S("gordon-2020-ijms"), "review")],
    rung: "L2",
    replication: { independentGroups: 1, note: "Review-level synthesis; the primary evidence is largely rodent." },
    status: { peerReviewed: true },
    supports: [C("distal-schwann-cell-support-maintenance")],
    contradicts: [C("timely-muscle-reinnervation")],
    limitations: ["human evidence is inferential, from outcome-versus-delay data rather than from tissue"]
  })
];

const EXPERIMENTS = [
  ex({
    id: E("delayed-repair-with-distal-support-large-animal"), name: "Six-month delayed nerve repair in a large animal, with and without distal-pathway support",
    tests: [Q("chronic-denervation-reversible-in-humans")], status: "proposed",
    design: { species: "pig or sheep", model: "proximal hindlimb nerve transection, repair delayed six months", intervention: "an intervention intended to maintain Schwann cell support (for example chronic low-frequency stimulation of the distal segment)", comparator: "immediate repair; delayed repair without intervention", readout: "muscle force, motor endplate counts, motor unit number estimation, Schwann cell phenotype at repair", duration: "12-15 months", n: "8-10 per arm" },
    discriminates: "If delayed-plus-intervention approaches immediate repair on force, the window is a pathway problem and can be extended; if it matches untreated delay, the muscle is the limit and the map should say so.",
    feasibility: { costClass: "high", durationClass: "years", requires: ["large-animal facility with long-term housing", "implantable stimulation", "endplate histology"], ethics: "animal ethics approval" }
  }),
  ex({
    id: E("conditioning-stimulation-proximal-injury-rct"), name: "Randomised trial of conditioning electrical stimulation in proximal nerve injury with a motor endpoint",
    tests: [Q("human-axon-regeneration-rate-increase"), Q("chronic-denervation-reversible-in-humans")], status: "proposed",
    design: { species: "human", model: "proximal ulnar or median transection repaired within two weeks", intervention: "1 h 20 Hz stimulation at repair", comparator: "sham stimulation", readout: "intrinsic muscle force and motor unit number at 12 and 24 months; Tinel advance as a rate proxy", duration: "3 years", n: "60-100" },
    discriminates: "A motor benefit at a proximal level would show the effect survives distance; Tinel-advance data would separate earlier onset from faster elongation.",
    feasibility: { costClass: "medium", durationClass: "years", requires: ["multi-centre hand surgery network", "blinded electrophysiology"], ethics: "human research ethics approval" }
  })
];

run({ SOURCES, GOALS, CAPABILITIES, QUESTIONS, CLAIMS, EXPERIMENTS });

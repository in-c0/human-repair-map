/* Leverage simulator — the map's central question made playable:
   which blocker, if solved, moves the most routes up a rung?

   INTEGRITY NOTE: this is an explicit MODEL, not a measurement. The blockers and
   their route mappings are editorial judgments derived from the graded records.
   Toggling one asserts a hypothetical. Every number the simulator shows is
   computed from the mapping below, not from sourced data — and the UI says so. */
window.HRM_LEVERAGE = {
  premise: "Every route below is stuck for specific, nameable reasons. Clear a route's blockers and it advances. The question this page asks is which blocker, cleared, moves the most, and what it would take before anything is <b>both broad and proven in humans</b>.",
  modelNote: "This is a model, not a measurement. The blockers and which routes they gate are editorial judgements derived from the graded records. The arithmetic is exact; the inputs are reasoned, not sourced. It is here so the structure can be argued with, not to predict anything.",

  blockers: [
    { id: "B1", name: "A targeting mechanism humans have", short: "human receptor",
      desc: "The engineered-capsid family works through LY6A, a receptor humans do not possess. Nothing crosses on a mechanism that isn't there." },
    { id: "B2", name: "Rodent results that survive a primate", short: "primate translation",
      desc: "The L2→L3 cliff. Most brain-delivery results are mouse results; the ones tested in primates by independent groups have mostly failed." },
    { id: "B3", name: "Measuring the drug in human brain tissue", short: "parenchymal measurement",
      desc: "Brain exposure is currently inferred from CSF ratios and animal models. CSF is a poor proxy for parenchyma — they decouple in both directions." },
    { id: "B4", name: "A surrogate that predicts benefit", short: "surrogate → function",
      desc: "Several approvals rest on a biomarker moving. No one has shown that those particular numbers translate into a person's life changing." },
    { id: "B5", name: "Verifying the drug reached the target volume", short: "coverage verification",
      desc: "A blinded audit of one failed trial found roughly half the catheters misplaced. Bypassing the barrier is solved; confirming coverage is not." },
    { id: "B6", name: "A systemic route that doesn't harm", short: "systemic safety",
      desc: "The two systemic attempts on this map produced the dose-limiting toxicity and the one death. Locoregional delivery works partly by avoiding the bloodstream." },
    { id: "B7", name: "Reaching beyond one compartment", short: "broad distribution",
      desc: "Every proven route is anatomically local — one nucleus, one cavity, the lumbar spine, a focused spot. Extending a local success to the whole CNS is its own unsolved problem." }
  ],

  /* broad = could this route, if it worked, reach the whole CNS?
     Structurally: crossing the barrier is potentially broad; bypassing it with a
     needle is inherently local. That asymmetry IS the map's headline. */
  routes: [
    { id: "cart",        subject: "Locoregional CAR-T",              rung: "L5", broad: false, blockers: ["B6", "B7"],       to: "L5", note: "proven route, but every response comes from injecting into the cavity" },
    { id: "fus",         subject: "Focused ultrasound opening",       rung: "L5", broad: false, blockers: ["B5", "B7"],       to: "L5", note: "L5 for opening the barrier; the delivery-outcome trial does not yet exist" },
    { id: "nusinersen",  subject: "Intrathecal ASO (nusinersen)",     rung: "L5", broad: false, blockers: ["B7"],             to: "L5", note: "real function — for a spinal-cord disease" },
    { id: "brineura",    subject: "ICV enzyme (Brineura)",            rung: "L5", broad: false, blockers: ["B7"],             to: "L5", note: "slows brain disease; the retinas degenerate untouched" },
    { id: "tofersen",    subject: "Intrathecal ASO (tofersen)",       rung: "L4", broad: false, blockers: ["B4", "B7"],       to: "L5", note: "approved on a biomarker; Phase 3 missed its endpoint" },
    { id: "kebilidi",    subject: "Intraparenchymal gene therapy",    rung: "L4", broad: false, blockers: ["B5", "B7"],       to: "L5", note: "one nucleus, one shot, no distal spread" },
    { id: "ced",         subject: "Convection-enhanced delivery",     rung: "L4", broad: false, blockers: ["B5", "B7"],       to: "L5", note: "both powered trials failed; coverage never verified" },
    { id: "aav9",        subject: "Systemic AAV9 (Zolgensma)",        rung: "L4", broad: true,  blockers: ["B3"],             to: "L5", note: "human CNS transduction rests on two autopsies" },
    { id: "denali",      subject: "TfR transcytosis (tividenofusp)",  rung: "L4", broad: true,  blockers: ["B3", "B4"],       to: "L5", note: "first BBB-crossing biologic approved — on a CSF sugar" },
    { id: "jcr",         subject: "TfR fusion (pabinafusp)",          rung: "L4", broad: true,  blockers: ["B3", "B4"],       to: "L5", note: "n=28, biomarker co-primary, Japan only" },
    { id: "roche",       subject: "Brainshuttle (trontinemab)",       rung: "L4", broad: true,  blockers: ["B3", "B4"],       to: "L5", note: "clears plaque; no evidence yet it slows decline" },
    { id: "intranasal",  subject: "Intranasal / nose-to-brain",       rung: "L4", broad: true,  blockers: ["B2", "B3", "B4"], to: "L5", note: "the large human functional trial was null" },
    { id: "capsid",      subject: "Engineered capsid, IV (PHP.B)",    rung: "L2", broad: true,  blockers: ["B1", "B2", "B6"], to: "L4", note: "a receptor humans lack; one human dosed, who died" },
    { id: "bihtfr1",     subject: "Human-TfR capsid (BI-hTFR1)",      rung: "L2", broad: true,  blockers: ["B2"],             to: "L4", note: "the engineering answer to the receptor problem — zero human data" },
    { id: "lnp",         subject: "Lipid nanoparticles, systemic",    rung: "L2", broad: true,  blockers: ["B2"],             to: "L4", note: "rodent only; no registered human brain-delivery trial" },
    { id: "exosomes",    subject: "Engineered exosomes",              rung: "L2", broad: true,  blockers: ["B2"],             to: "L4", note: "rodent evidence and a negative primate result" }
  ],

  rungOrder: ["L0", "L1", "L2", "L3", "L4", "L5"],

  insights: [
    { when: (s) => s.broadProven === 0 && s.cleared === 0,
      text: "<b>Zero</b> routes are both broad and proven in humans. Every proven route is anatomically local, and every potentially broad route is unproven. Mark blockers as solved to see what it would take to change that." },
    { when: (s) => s.cleared > 0 && s.broadProven === 0,
      text: "Still zero broad and proven. Clearing one blocker rarely unlocks a route on its own, because most routes are gated by <b>two or three</b> at once. The number of routes a blocker gates is not the same as how much clearing it would move." },
    { when: (s) => s.broadProven > 0 && s.broadProven < 3,
      text: "The headline changed. A route that crosses the barrier needed both <b>parenchymal measurement</b> and a <b>surrogate that predicts benefit</b>, which are the two things nobody currently has for any approved brain drug." },
    { when: (s) => s.broadProven >= 3,
      text: "Solving delivery alone never got here. It also took proof that what was delivered <b>changed a person's function</b> rather than a number." }
  ]
};

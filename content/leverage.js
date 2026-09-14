/* Leverage model — research-layer copy.

   The blocker definitions and route mappings are editorial judgements derived from the graded records.
   Toggling a blocker creates a hypothetical state; it does not change the evidence rung of any canonical record. */
window.HRM_LEVERAGE = {
  premise: "Suppose one delivery problem were solved. Which brain-delivery routes would actually move up a rung, and which would still be stuck for another reason? Clear a blocker below to inspect that question.",
  modelNote: "This is a model, not a measurement. The blocker definitions and route mappings are editorial judgements based on the graded records. The arithmetic follows those inputs exactly. Use it to challenge the dependency assumptions, not to treat a hypothetical as new evidence.",

  blockers: [
    { id: "B1", name: "A targeting mechanism that exists in humans", short: "human receptor",
      desc: "The engineered PHP.B capsid family depends on LY6A in mice. Humans do not have the same receptor, so that mechanism does not transfer directly." },
    { id: "B2", name: "A rodent result that still works in a primate", short: "primate translation",
      desc: "Many brain-delivery results are demonstrated in rodents. Several approaches have behaved differently in non-human primates." },
    { id: "B3", name: "Direct evidence of exposure inside human brain tissue", short: "parenchymal measurement",
      desc: "Human brain exposure is often inferred from cerebrospinal-fluid measurements and animal models. Those measures do not always match drug concentration in brain parenchyma." },
    { id: "B4", name: "A surrogate that predicts meaningful function", short: "surrogate → function",
      desc: "Several programmes change a biomarker. For this model, the blocker stays in place until the relevant surrogate is shown to predict a meaningful functional outcome." },
    { id: "B5", name: "Proof that the intended brain volume was reached", short: "coverage verification",
      desc: "Direct delivery can bypass the blood-brain barrier, but placement and distribution still need to be checked. In one audited failed trial, catheter placement was a material problem." },
    { id: "B6", name: "A systemic dose people can tolerate", short: "systemic safety",
      desc: "Systemic delivery exposes tissues outside the target. The records here include dose-limiting toxicity and a death, so systemic safety remains a separate blocker." },
    { id: "B7", name: "Distribution beyond one local compartment", short: "broad distribution",
      desc: "The strongest human evidence is concentrated in local routes: one nucleus, one cavity, the spinal fluid, or a focused region. Reaching a large part of the CNS requires another delivery capability." }
  ],

  /* broad = could this route, if it worked, reach the whole CNS?
     Crossing the barrier is potentially broad; bypassing it with a needle is anatomically local. */
  routes: [
    { id: "cart",        subject: "Locoregional CAR-T",              rung: "L5", broad: false, blockers: ["B6", "B7"],       to: "L5", note: "proven route; responses follow locoregional injection" },
    { id: "fus",         subject: "Focused ultrasound opening",       rung: "L5", broad: false, blockers: ["B5", "B7"],       to: "L5", note: "L5 for barrier opening; no delivery-to-functional-outcome trial is attached" },
    { id: "nusinersen",  subject: "Intrathecal ASO (nusinersen)",     rung: "L5", broad: false, blockers: ["B7"],             to: "L5", note: "functional benefit demonstrated for a spinal-cord disease" },
    { id: "brineura",    subject: "ICV enzyme (Brineura)",            rung: "L5", broad: false, blockers: ["B7"],             to: "L5", note: "slows the mapped brain disease; retinal disease remains outside the treated compartment" },
    { id: "tofersen",    subject: "Intrathecal ASO (tofersen)",       rung: "L4", broad: false, blockers: ["B4", "B7"],       to: "L5", note: "approved on a biomarker; the attached Phase 3 record did not meet its primary functional endpoint" },
    { id: "kebilidi",    subject: "Intraparenchymal gene therapy",    rung: "L4", broad: false, blockers: ["B5", "B7"],       to: "L5", note: "local delivery to one nucleus; broad distal distribution is not demonstrated" },
    { id: "ced",         subject: "Convection-enhanced delivery",     rung: "L4", broad: false, blockers: ["B5", "B7"],       to: "L5", note: "human trials exist; the mapped powered trials did not establish functional benefit" },
    { id: "aav9",        subject: "Systemic AAV9 (Zolgensma)",        rung: "L4", broad: true,  blockers: ["B3"],             to: "L5", note: "human CNS transduction evidence on this map includes two autopsies" },
    { id: "denali",      subject: "TfR transcytosis (tividenofusp)",  rung: "L4", broad: true,  blockers: ["B3", "B4"],       to: "L5", note: "human biomarker evidence is recorded; functional benefit is still the relevant open step" },
    { id: "jcr",         subject: "TfR fusion (pabinafusp)",          rung: "L4", broad: true,  blockers: ["B3", "B4"],       to: "L5", note: "small human study with biomarker endpoints; approval is limited geographically" },
    { id: "roche",       subject: "Brainshuttle (trontinemab)",       rung: "L4", broad: true,  blockers: ["B3", "B4"],       to: "L5", note: "plaque reduction is demonstrated; functional benefit is not established on the current record" },
    { id: "intranasal",  subject: "Intranasal / nose-to-brain",       rung: "L4", broad: true,  blockers: ["B2", "B3", "B4"], to: "L5", note: "human exposure evidence exists; the large mapped functional trial was null" },
    { id: "capsid",      subject: "Engineered capsid, IV (PHP.B)",    rung: "L2", broad: true,  blockers: ["B1", "B2", "B6"], to: "L4", note: "strong rodent result; the mouse receptor mechanism does not transfer directly to humans" },
    { id: "bihtfr1",     subject: "Human-TfR capsid (BI-hTFR1)",      rung: "L2", broad: true,  blockers: ["B2"],             to: "L4", note: "engineered around a human transferrin-receptor target; no human delivery evidence on the current record" },
    { id: "lnp",         subject: "Lipid nanoparticles, systemic",    rung: "L2", broad: true,  blockers: ["B2"],             to: "L4", note: "rodent evidence on the current record; no registered human brain-delivery trial attached" },
    { id: "exosomes",    subject: "Engineered exosomes",              rung: "L2", broad: true,  blockers: ["B2"],             to: "L4", note: "rodent evidence and a negative primate result are both recorded" }
  ],

  rungOrder: ["L0", "L1", "L2", "L3", "L4", "L5"],

  insights: [
    { when: (s) => s.broadProven === 0 && s.cleared === 0,
      text: "Right now, none of the potentially broad routes is at L5. The L5 routes reach local compartments. Clear a blocker to see whether that alone would be enough to move any broad route." },
    { when: (s) => s.cleared > 0 && s.broadProven === 0,
      text: "There is still no broad L5 route under these assumptions. Most broad routes have more than one unresolved blocker, so solving one problem does not necessarily move the rung." },
    { when: (s) => s.broadProven > 0 && s.broadProven < 3,
      text: "At least one broad route reaches L5 in this hypothetical. Check which blockers you cleared: for several routes, direct brain-tissue exposure and evidence of functional benefit are separate requirements." },
    { when: (s) => s.broadProven >= 3,
      text: "Several broad routes reach L5 in this hypothetical. That only follows because the selected assumptions supply both delivery evidence and evidence that the relevant intervention improves function." }
  ]
};

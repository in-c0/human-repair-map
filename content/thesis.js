/* "Why this map" — content. Rewritten 2026-09-11 against the writing rulebook
   (see writing-review-2026-09-11.md). Keeps the owner's frame: repair-only hook,
   consent in the first sentence, legibility as a hypothesis not a finding,
   conditional structure, no dates. */
window.HRM_THESIS = {
  hook: "Imagine a technology where a sick, injured, or disabled person walks in and, if they choose it, whatever happened to them can be repaired.",
  lede: "Nothing known in physics forbids this. For it to work, a system would have to be able to do a short list of things: keep what makes the person who they are; measure enough of their body; decide what a safe, healthy target state is for them; reach the right cells; change those cells' state precisely; rebuild tissue around them; and check that the change held. Every item on that list is a capability that can be graded on evidence. That is what this map does.",
  constraint: "The hard limit is information. If a system can still work out what must be kept and what must be changed, repair is possible in principle. Where that information is gone and cannot be recovered or inferred, it is not.",

  primitive: {
    title: "The unit this map grades",
    body: "The unit is a verified change in cell state: read a biological state, compare it with a target, change it, confirm the change held. Genes and molecules are too small to describe repair with; organs are too coarse. The cell is the smallest living thing that carries its own genome, reads signals, repairs itself, changes identity, builds tissue, and can go wrong into cancer.",
    loop: ["Read", "Diagnose", "Define target state", "Intervene", "Verify", "Adapt"]
  },

  whyCell: "So every capability on the map is something we have to be able to do to a target, and the body grid asks the same five questions of every cell type. A capability is graded L0 to L5 on what has actually been demonstrated, and says what would move it one rung.",

  infoLimits: [
    { t: "Destroyed brain tissue", d: "If memories, personality and neural structure are physically gone, exact restoration needs a backup, enough preserved structure to infer the rest, or acceptance that the result is a reconstruction rather than a continuation." },
    { t: "Long-term developmental conditions", d: "Some differences are not damage. They are how a person developed. The target state is not obvious, and it is not the map's to assume." },
    { t: "Death with severe decomposition", d: "When the organised information that made a person is gone, physics offers no recovery path. A new organism can be made. The same person cannot necessarily be restored." }
  ],

  layers: [
    ["Molecular", "DNA damage, toxic aggregates, metabolic defects", "Edit, remove, replace, refold, degrade"],
    ["Cellular", "Cancer, senescence, dead neurons, immune dysfunction", "Destroy, repair, reprogram, replace"],
    ["Tissue", "Fibrosis, cartilage loss, scar, muscle wasting", "Remodel, regenerate, scaffold"],
    ["Organ", "Heart, kidney, liver, pancreatic failure", "Repair, regrow, replace"],
    ["Systemic", "Autoimmunity, endocrine imbalance, chronic inflammation", "Recalibrate control loops"],
    ["Neural information", "Memory, identity, pain maps, motor control", "Preserve, reconnect, retrain, restore"],
    ["Body plan", "Missing structures, spinal injury, malformation", "Regenerate structure and function"]
  ],

  whyNotDna: "A severed spinal cord, a missing limb, protein aggregates, scar tissue, chronic immune memory, synaptic miswiring and epigenetic drift are not DNA-sequence problems. DNA is the blueprint; the body is also construction history, live signalling, spatial organisation, learned neural information and mechanical structure. Repair has to act on <b>state</b>, not only on genome.",

  primitives: [
    ["Stop", "bleeding, ischaemia, runaway inflammation, seizure"],
    ["Remove", "pathogens, toxins, cancer cells, senescent cells, scar"],
    ["Repair", "DNA, mitochondria, proteins, membranes, epigenetic state"],
    ["Replace", "cells, tissues, organs, microbiome communities"],
    ["Regenerate", "limbs, nerves, cartilage, muscle, vasculature"],
    ["Reconnect", "neural circuits, immune regulation, endocrine loops"],
    ["Recalibrate", "control loops that have drifted"],
    ["Preserve", "memories, identity, preferences, agency"]
  ],

  verdicts: [
    { p: "Sufficient sensing", v: "Possible in principle", d: "Biological state can be measured. The hard part is measuring enough of it, fast enough, without harming the person. Total sensing is not needed; enough to know what to keep, remove and rebuild is." },
    { p: "Target-state modelling", v: "Possible, and partly an ethical question", d: "\"Healthy\" is not one template. The target has to be set by biology, safety and the person's own choices together." },
    { p: "Cell-specific access", v: "Possible in principle", d: "Biology already does targeted delivery: immune cells find infected cells, embryos build organs, wounds recruit repair cells. Engineering that specificity is the open problem, and on this map it is the most common blocker." },
    { p: "Cell-state editing", v: "Possible, bounded by safety", d: "Development, regeneration in other animals and immune adaptation all show that cell states can be reprogrammed. Cancer shows they can be reprogrammed badly. The frontier is safe, constrained editing rather than more editing power." },
    { p: "Closed-loop verification", v: "Necessary, underdeveloped", d: "Simple loops exist: insulin pumps, pacemakers, neurostimulation. Verification that runs from molecule to behaviour and over decades does not, and no general repair is plausible without it." }
  ],

  whoTable: [
    ["Mapping human cell types and states", "Human Cell Atlas · NIH BRAIN/BICAN · Arc Institute"],
    ["AI models of cells / virtual cells", "CZI Biohub · Arc Institute · AI-biology labs"],
    ["Cell rejuvenation / epigenetic reprogramming", "Altos Labs · NewLimit · academic labs"],
    ["Gene and cell editing", "CRISPR and gene-therapy companies · academic labs"],
    ["Regenerative medicine / tissue engineering", "stem-cell, organoid and transplant groups"],
    ["Closed-loop medical systems", "diabetes devices · neurostimulation · adaptive oncology"],
    ["Goal-directed research infrastructure", "ARPA-H (IGoR) · Open Targets · NIH Bridge2AI"]
  ],

  whyNoOne: [
    ["Medicine is approved disease by disease", "No regulator approves \"cell-state editing for anything\". A general capability enters medicine one indication, one dose and one manufacturing process at a time, so it arrives in pieces."],
    ["The body is not fully observable yet", "Reference atlases are still being built, and virtual-cell models still struggle with data heterogeneity and reproducibility. Without enough sensing, a loop cannot be closed safely."],
    ["Delivery is still primitive", "We can reach the liver, the eye, blood stem cells and some tumours. General access would mean brain, pancreas, joints, marrow, retina, nerves and scarred tissue, reliably and repeatedly."],
    ["Editing power sits next to cancer", "Making cells younger, more plastic and more proliferative uses the same machinery cancer uses. A system has to tell \"regenerate this\" from \"grow without limit\"."],
    ["The right target state is often unknown", "For a broken enzyme it is obvious. For aging, chronic pain, neurodevelopmental difference or memory loss it is not, and it is partly the person's to decide."],
    ["Brain repair is different", "Replace a liver cell and the person is unchanged. Overwrite a circuit that encodes memory or personality and they may not be."],
    ["Verification is underdeveloped", "Monitoring from molecule to cell to organ to behaviour to long-term cancer risk is far beyond current clinical practice."]
  ],

  question: "What if the whole picture were visible at once: each component's progress, the bottlenecks named, and the evidence behind every claim open to inspection?",

  conviction: {
    lead: "Three explanations are usually offered for why this has not happened. The first two are certainly real. The third is a hypothesis, and it is the only one a map could do anything about, which is a reason to be suspicious of it.",
    items: [
      { t: "The science isn't ready", s: "almost certainly true", d: "We lack causal models good enough to move a cell from state X to state Y safely. A map does not create that knowledge; labs do, over decades. On the evidence this is probably the dominant constraint." },
      { t: "The rules are too slow", s: "partly true", d: "Approval pathways built for pills fit adaptive, multi-modality systems badly. But permissive jurisdictions have not produced faster repair; they have mostly produced unproven clinics. That suggests regulation limits how fast results translate rather than whether a capability exists." },
      { t: "Nobody can see the whole board", s: "the hypothesis here", d: "Every piece is worked on by people who can mostly see their own piece. So it is hard for anyone to say which constraint currently binds, and attention may go to whatever is most visible (the striking mouse result, the cleared biomarker) rather than to what is blocking. If that is true, a shared public accounting should help at the margin. <b>It is a hypothesis, not a finding.</b>" }
    ],
    close: "This map does not claim the field is doing it wrong. Specialists know their subfields far better than any survey does, and the deep constraints are probably scientific rather than organisational. The narrower claim is this: some things are hard to see from inside one subfield, the map is cheap to build, and it is falsifiable. If experts read these records and say the structure was already obvious to them, that is the answer.",
    standing: "Written by an independent builder, not a neuroscientist or clinician. No lab, no funding, no position in the field. That is a real limitation on everything above, and it is why every record carries its sources and review state on its face: so you can check the map rather than trust it."
  },

  isnt: [
    "diagnosis or prognosis",
    "treatment selection or advice about any person's illness",
    "drug, vaccine, or supplement recommendations",
    "clinical-trial eligibility certainty",
    "individual genomic interpretation",
    "a date for universal repair"
  ],
  is: [
    "goals decomposed into the capabilities they require, with AND/OR alternatives",
    "capabilities graded L0 to L5 on demonstrated evidence, with what would move each",
    "open questions ranked by how much sits downstream of what they block",
    "claims with context, measurement, sources, replication and contradiction",
    "a machine interface: MCP, REST, bulk export, proposals and locked predictions",
    "public review states, a hash-chained event log, and a corrections history"
  ]
};

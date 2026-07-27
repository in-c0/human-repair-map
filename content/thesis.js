/* Thesis-view content — follows the owner's draft layout, with the locked
   corrections: repair-only hook (consent qualifier in the first sentence),
   legibility as the binding constraint, conditional structure not date forecasts. */
window.HRM_THESIS = {
  hook: "Imagine a technology where a sick, injured, or disabled person walks in — and whatever happened to them, if they choose it, can be repaired.",
  pull: "This is possible in theory.",
  lede: "Universal repair is theoretically possible if a system can preserve identity-relevant information, sense the body sufficiently, define a safe personalised target state, reach the relevant cells, edit cell states precisely, rebuild tissue architecture, and verify the result in a closed loop. The irreducible enabling capability is <b>closed-loop programmable cell-state control</b>.",
  constraint: "The fundamental constraint is information. If a system can still determine what must be preserved and what must be changed, repair is theoretically possible. Where that information is destroyed and cannot be inferred or recovered, it is not.",

  primitive: {
    title: "The smallest sufficient unit",
    body: "Not a gene. Not a molecule. Not the cell itself. The primitive is a <b>programmable, verified change in cell state</b> — read a biological state, compare it to a target, rewrite it, confirm the rewrite held.",
    loop: ["Read", "Diagnose", "Define target state", "Intervene", "Verify", "Adapt"]
  },

  infoLimits: [
    { t: "Destroyed brain tissue", d: "If memories, personality, and neural structure are physically gone, exact restoration needs a backup, enough preserved structure to infer the rest, or acceptance that the result is a reconstruction rather than a continuation." },
    { t: "Long-term developmental conditions", d: "Some differences are not damage. They are how a person developed. The target state is not obvious, and it is not the map's to assume." },
    { t: "Death with severe decomposition", d: "When the organised information that made a person is gone, physics gives no free recovery path. You can make a new organism; not necessarily restore the same person." }
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

  whyCell: "Atoms are too fine to work with and organs too coarse. The cell is the smallest living unit that carries its own genome, interprets signals, repairs itself, divides or dies, changes identity, builds tissue — and malfunctions into cancer. It is the practical target.",
  whyNotDna: "A severed spinal cord, a missing limb, protein aggregates, scar tissue, chronic immune memory, synaptic miswiring, epigenetic drift — none of these are primarily DNA-sequence problems. DNA is the blueprint; the body is also construction history, live signalling, spatial organisation, learned neural information, and mechanical structure. The primitive must act on <b>state</b>, not only genome.",

  primitives: [
    ["Remove", "pathogens, toxins, cancer cells, senescent cells, scar"],
    ["Repair", "DNA, mitochondria, proteins, membranes, epigenetic state"],
    ["Replace", "cells, tissues, organs, microbiome communities"],
    ["Regenerate", "limbs, nerves, cartilage, muscle, vasculature"],
    ["Reconnect", "neural circuits, immune regulation, endocrine loops"],
    ["Preserve", "memories, identity, preferences, agency"]
  ],

  verdicts: [
    { p: "Sufficient sensing", v: "Possible in principle", d: "Biological state can be measured. The hard part is measuring it completely enough, fast enough, and without harming the person. \"Total\" is unnecessary; <i>sufficient</i> is the real requirement — enough to know what to preserve, remove, and rebuild." },
    { p: "Target-state modelling", v: "Possible, ethically hard", d: "\"Healthy\" is not one template. The target must be co-defined by biology, safety, and the person's own agency — which makes this a normative problem wearing a technical costume." },
    { p: "Cell-specific access", v: "Possible in principle", d: "Biology already proves targeted navigation: immune cells find infected cells, embryos build organs, wounds recruit repair cells. The challenge is engineering delivery with that specificity." },
    { p: "Cell-state editing", v: "Possible, safety-bound", d: "Development, regeneration in other animals, and immune adaptation all prove cell states are programmable. Cancer proves they can be reprogrammed catastrophically. Safe, constrained editing is the frontier — not raw editing power." },
    { p: "Closed-loop verification", v: "Necessary, underdeveloped", d: "Simple loops exist — insulin pumps, pacemakers, neurostimulation. Multiscale verification from molecule to behaviour to decades does not. No universal repair is plausible without it." }
  ],

  whoTable: [
    ["Mapping human cell types and states", "Human Cell Atlas · NIH BRAIN/BICAN · Arc Institute"],
    ["AI models of cells / virtual cells", "CZI Biohub · Arc Institute · AI-biology labs"],
    ["Cell rejuvenation / epigenetic reprogramming", "Altos Labs · NewLimit"],
    ["Gene and cell editing", "CRISPR and gene-therapy companies · academic labs"],
    ["Regenerative medicine / tissue engineering", "stem-cell, organoid and transplant groups"],
    ["Closed-loop medical systems", "diabetes devices · neurostimulation · adaptive oncology"],
    ["High-risk health moonshots", "ARPA-H and similar agencies"]
  ],

  whyNoOne: [
    ["Medicine is approved disease-by-disease", "No regulator approves \"cell-state editing to cure anything.\" A universal ambition must enter through narrow doors — one indication, one dose, one manufacturing process. That is why the future arrives as fragments."],
    ["The body is not fully observable yet", "Reference atlases are still being built; virtual-cell models still fight data heterogeneity and reproducibility. Without sufficient sensing, you cannot safely close a loop."],
    ["Delivery is still primitive", "We can reach liver, eye, blood stem cells, some tumours. Universal access would mean brain, pancreas, joints, marrow, retina, nerves, scarred tissue — reliably, repeatedly."],
    ["Editing power is cancer-adjacent", "Making cells younger, more plastic, more proliferative walks into the territory cancer exploits. The system must distinguish \"regenerate this\" from \"grow uncontrollably.\""],
    ["The correct target state is often unknown", "For a broken enzyme it is obvious. For ageing, chronic pain, neurodevelopmental difference, or memory loss it is not — and it is partly the person's to define."],
    ["Brain repair is uniquely hard", "Replace a liver cell and identity is preserved. Overwrite a circuit encoding memory or personality and the person may not be."],
    ["Verification is underdeveloped", "Multiscale monitoring — molecule to cell to organ to behaviour to long-term cancer risk — is far beyond current clinical practice."]
  ],

  question: "What if we tackled this as one — with every component's progress visible, the bottlenecks named, and the evidence behind each claim open to inspection?",

  conviction: {
    lead: "Three explanations get offered for why this has not happened. Two are true. Only one is binding.",
    items: [
      { t: "The science isn't ready", s: "true", d: "We lack causal models good enough to move a cell from state X to state Y safely. Real — and no map creates that knowledge. Labs do." },
      { t: "The rules are too slow", s: "true", d: "Approval pathways built for pills fit adaptive, multi-modality systems badly. Real — and no map accelerates a regulator." },
      { t: "Nobody can see the whole board", s: "binding", d: "Every piece is being worked on by someone who can only see their piece. So no one can tell which constraint actually binds, and attention flows to whatever is <i>legible</i> — the striking mouse result, the cleared biomarker — rather than to whatever is blocking. This is the one a public map directly attacks." }
    ],
    close: "The field is not short of brilliance or effort. It is short of a shared, honest picture of where the edge actually is."
  },

  isnt: [
    "diagnosis or prognosis",
    "treatment selection or patient-specific advice",
    "drug, vaccine, or supplement recommendations",
    "clinical-trial eligibility certainty",
    "individual genomic interpretation",
    "a date for \"universal repair\""
  ],
  is: [
    "capability maps with maturity and uncertainty",
    "an evidence registry with provenance",
    "bottleneck tracking and dependency structure",
    "conditional forecasts — what must happen before what",
    "open tasks anyone can pick up",
    "public review states and dispute history"
  ]
};

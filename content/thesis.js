/* "Why this map" — content. Rewritten 2026-09-11 against in-c0/writing-skill.
   Keeps the owner's frame: repair-only hook, consent in the first sentence,
   legibility as a hypothesis, conditional structure, no dates. */
window.HRM_THESIS = {
  hook: "Imagine a technology where a sick, injured, or disabled person walks in and, if they choose it, whatever happened to them can be repaired.",
  lede: "No known law of physics rules that out. A working system would have to preserve what makes the person who they are, measure enough of their biological state, define a safe target state, reach the right cells, change them precisely, rebuild the surrounding tissue, and verify that the result held. This map breaks that problem into capabilities and records how far each capability has been demonstrated.",
  constraint: "Repair depends on information. If the system can still determine what must be preserved and what must change, a repair path may exist. If essential information has been destroyed and cannot be recovered or inferred, exact restoration may be impossible.",

  primitive: {
    title: "The unit this map grades",
    body: "The working unit is a verified change in biological state: read the current state, compare it with a target, intervene, and check the result. Genes and molecules describe part of that process, while organs are too coarse to describe many repair operations. Cells sit between those scales. They carry genomes, respond to signals, maintain tissue, change state, and can become pathological.",
    loop: ["Read", "Diagnose", "Define target state", "Intervene", "Verify", "Adapt"]
  },

  whyCell: "Each capability describes something that has to be done to a target. The body grid asks the same five questions of every target: can we sense it, model the desired state, reach it, edit it, and verify the result? Each capability has an evidence rung from L0 to L5, plus what was measured, what blocks the next rung, and its review state.",

  infoLimits: [
    { t: "Destroyed brain tissue", d: "If memories, personality, or learned neural structure are physically gone, exact restoration would need a backup or enough preserved structure to infer what was lost. Otherwise the result may be a reconstruction rather than a continuation." },
    { t: "Long-term developmental conditions", d: "Some differences are part of how a person developed rather than damage with an obvious earlier state to restore. The target state therefore depends on the person's goals as well as biology and safety." },
    { t: "Death with severe decomposition", d: "If the organised information that made a person has been destroyed, current physics gives no known way to recover it exactly." }
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

  whyNotDna: "A severed spinal cord, missing tissue, protein aggregates, scar, chronic immune memory, synaptic miswiring, and epigenetic drift can remain even when the DNA sequence is intact. The state that matters also includes signalling, spatial organisation, learned neural information, and mechanical structure. A general repair system would therefore have to act across several biological layers.",

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
    { p: "Sufficient sensing", v: "Possible in principle", d: "Biological state can be measured, but a general repair system would need enough information at the required place and time without causing unacceptable harm. It may not need complete measurement of everything." },
    { p: "Target-state modelling", v: "Partly technical, partly a choice", d: "There is no single healthy template for every person. Biology and safety constrain the target state, and the person's own choices matter where more than one acceptable state is possible." },
    { p: "Cell-specific access", v: "Possible in principle", d: "Living systems already route cells and molecules selectively. Engineering comparable specificity across arbitrary human tissues is still an open problem, and delivery appears repeatedly as a blocker in this graph." },
    { p: "Cell-state editing", v: "Demonstrated in narrow settings", d: "Development, regeneration, immune adaptation, gene editing, and cellular reprogramming show that cell states can be changed. The unresolved problem is controlling those changes with enough specificity and safety for repeated use in a whole person." },
    { p: "Closed-loop verification", v: "Narrow systems exist", d: "Insulin pumps, pacemakers, and adaptive neurostimulation already measure and respond. A general repair system would need verification across more biological scales and over much longer periods." }
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
    ["Medicine is approved disease by disease", "A general capability still reaches patients through specific indications, doses, manufacturing processes, and evidence packages. This fragments progress across many programmes."],
    ["The body is not fully observable yet", "Reference atlases are still being built, and biological models still struggle with incomplete and heterogeneous data. A repair loop cannot verify what it cannot measure well enough."],
    ["Delivery is still limited", "Some tissues are comparatively tractable, while others remain difficult to reach precisely and repeatedly. A general system would need reliable access across many organs and cell types."],
    ["Powerful editing can create new risks", "Rejuvenation and regeneration can involve pathways that also support uncontrolled growth. Any broadly useful method needs ways to stop, localise, and verify the intervention."],
    ["The target state is sometimes uncertain", "A missing enzyme has a relatively clear target. Aging, chronic pain, neurodevelopmental differences, and memory loss can involve several acceptable outcomes, so the person's preferences become part of the specification."],
    ["Brain repair can carry unique information", "Replacing a generic liver cell does not usually threaten identity. Reconstructing neural circuits that encode memories or personality may require information that is not stored elsewhere."],
    ["Verification is still narrow", "Current clinical monitoring rarely follows an intervention from molecular state through tissue function to long-term risks such as malignancy. A general repair system would need that feedback across more scales."]
  ],

  question: "If the goal is human repair, which capabilities are required, how far has each one been demonstrated, and which unanswered questions currently block the most downstream work?",

  conviction: {
    lead: "There are several reasons a general repair system does not exist. Some are clearly scientific. This project tests a narrower possibility: whether making dependencies and evidence visible can help researchers find important gaps sooner.",
    items: [
      { t: "The science is not ready", s: "strongly supported", d: "We still lack causal models and interventions that can move many biological systems from a damaged state to a safe target state. A map cannot supply that missing biology. It can only record where the evidence currently stops." },
      { t: "Translation is slow", s: "supported", d: "Adaptive and multi-modality interventions do not fit every existing approval pathway cleanly, but regulatory flexibility alone has not produced general repair. Translation matters after a capability has enough evidence to translate." },
      { t: "Dependencies are hard to see across fields", s: "the hypothesis being tested", d: "Research is distributed across specialties, and the same enabling capability can matter to several apparently unrelated problems. The map tests whether a shared dependency view helps researchers notice a blocker, contradiction, or useful connection they would otherwise miss. This has not yet been demonstrated." }
    ],
    close: "Specialists know their own fields better than this survey does. The current test is practical: give the graph to domain researchers, record what they say is wrong or missing, and measure whether it changes what they would read or investigate next. If it does not help, the graph should change before coverage expands.",
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
    "goals decomposed into required capabilities, including AND/OR alternatives",
    "capabilities recorded with rung, measured, blocked by, and review state",
    "open questions ranked by how much downstream structure they block",
    "claims linked to context, measurements, sources, replication, and contradictions",
    "machine access through MCP, REST, bulk export, proposals, and locked predictions",
    "public review states, a hash-chained event log, and a corrections history"
  ]
};
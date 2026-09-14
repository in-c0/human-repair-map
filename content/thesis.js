/* "Why this map" — human-facing copy.
   Rules-first under in-c0/writing-skill. The page starts from the repair problem itself;
   exact grading and provenance language stays in the research layer. */
window.HRM_THESIS = {
  hook: "Imagine someone you care about is badly injured, sick, losing an organ, or growing frail with age. What would have to exist before we could repair the damage and give them back the healthiest body they can safely have, while keeping them themselves?",
  lede: "That is the problem I want to work backwards from. A complete repair system would need to find what went wrong, know what should be there instead, reach the right cells, change or replace what is damaged, rebuild the surrounding tissue and check that the repair actually worked. We can already do pieces of this in medicine. The interesting part is where those pieces stop.",
  constraint: "There is a hard limit underneath all of this: repair needs information. A broken bone has a shape we can infer and restore. If unique brain tissue carrying memories or learned structure is destroyed and no usable copy of that information survives, exact restoration may be impossible.",

  primitive: {
    title: "What repair has to do",
    body: "At the smallest useful scale, repair means changing a living cell or its surroundings in a controlled way and then checking the result. DNA matters, but DNA alone does not describe a scar, a dead neuron, a blocked artery or a damaged circuit. Whole organs are often too coarse. Cells are a useful middle scale because they carry genetic information, respond to signals, build tissue and change state when disease or injury changes them.",
    loop: ["Read", "Diagnose", "Define target state", "Intervene", "Verify", "Adapt"]
  },

  whyCell: "For any part of the body, I keep coming back to five practical questions. Can we tell what state it is in? Do we know what healthy should look like? Can we reach it? Can we change it? Can we check that the change worked? The research layer grades those questions separately so a strong result in one step cannot hide a missing step somewhere else.",

  infoLimits: [
    { t: "Destroyed brain tissue", d: "If memories, personality or learned neural structure are physically gone, exact restoration would need a backup or enough surviving structure to infer what was lost. Otherwise we may be able to build something functional without being able to recover the original information." },
    { t: "Long-term developmental conditions", d: "Some differences are part of how a person developed and do not have one obvious earlier state to restore. In those cases the person's own goals matter alongside biology and safety." },
    { t: "Death with severe decomposition", d: "If the organised information that made a person has been destroyed, current physics gives us no known way to recover it exactly." }
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

  whyNotDna: "Fixing DNA would solve some diseases and still leave many others untouched. A severed spinal cord, missing tissue, protein aggregates, a scar, chronic immune memory or damaged neural wiring can all remain when the DNA sequence is intact. A general repair system would have to work across several levels of the body at once.",

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
    { p: "Seeing enough of the damage", v: "Possible in narrow forms today", d: "We can image organs, sequence cells and measure many molecular signals. A general repair system would need the right information at the right place and time without harming the person. It probably would not need to measure everything." },
    { p: "Knowing what to restore", v: "Sometimes clear, sometimes a choice", d: "A broken bone has an obvious target. Ageing, chronic pain, neurodevelopmental differences and damaged neural circuits can have more than one acceptable outcome. Biology sets limits; the person still gets a say." },
    { p: "Reaching the right cells", v: "Works in some tissues", d: "Medicine can already deliver treatments selectively in some places. Reaching arbitrary cell types throughout a human body, repeatedly and without hitting the wrong cells, remains one of the recurring problems." },
    { p: "Changing the cell state", v: "Demonstrated in narrow settings", d: "Gene editing, immune engineering, regeneration and cellular reprogramming all show that living cells can be pushed into different states. Doing that safely, precisely and at the scale of a whole person is a much harder problem." },
    { p: "Checking the repair", v: "Works for narrow systems", d: "Insulin pumps, pacemakers and adaptive neurostimulation already measure a signal and respond. A general repair system would have to keep checking many more kinds of tissue and catch problems such as recurrence or cancer over much longer periods." }
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
    ["We still cannot see enough", "Reference atlases are still being built, and many measurements require removing tissue or averaging together very different cells. It is hard to repair a state you cannot observe well enough."],
    ["We cannot reach every cell we want", "The eye, liver, blood and some local tissues are comparatively tractable. Other organs, distributed cell populations and many parts of the nervous system are much harder to reach precisely."],
    ["Regrowing tissue is harder than closing an injury", "A wound can close while leaving scar, missing appendages, altered nerves and abnormal matrix behind. Complete repair means restoring organisation and function, not just sealing the surface."],
    ["Powerful repair can create new damage", "Regeneration and rejuvenation use pathways that can also support uncontrolled growth. A useful treatment needs ways to localise the effect, stop it and check what happened afterwards."],
    ["Sometimes the desired end state is uncertain", "Replacing a missing enzyme can have a clear target. Ageing, pain, neurological damage and developmental differences can involve several reasonable outcomes. The person's preferences become part of the problem."],
    ["Brain repair can lose information", "Replacing a liver cell usually does not threaten someone's identity. Reconstructing neural circuits that carry memories or personality may require information that is not stored anywhere else."],
    ["Medicine still develops and approves treatments one problem at a time", "Even a technology that could help several kinds of damage still reaches people through specific diseases, doses, manufacturing processes and trials. That keeps useful knowledge spread across many separate programmes."]
  ],

  question: "If we really want arbitrary human repair, what can we already do, what is still missing, and which unanswered research questions are holding up the most progress?",

  conviction: {
    lead: "I do not know whether anything like a universal repair machine is close. I do know that the work needed for it is scattered across many fields, and I want a way to see where the actual gaps are instead of guessing from headlines.",
    items: [
      { t: "Some biology is simply unsolved", s: "strongly supported", d: "We still cannot move many damaged human tissues back to a healthy state. No amount of better organisation can substitute for experiments that discover how to do that." },
      { t: "Useful results are spread across fields", s: "supported", d: "A delivery method, regenerative mechanism or verification technique can matter to several diseases at once, while the papers and teams working on them may sit in different specialties." },
      { t: "Making the shared gaps visible might help", s: "the hypothesis being tested", d: "The practical test is whether researchers find something they had missed, reject a bad dependency, avoid duplicated work or change what they investigate next. We have not shown that yet." }
    ],
    close: "The next step is to put this in front of domain researchers and ask them to break it. If a dependency is wrong, I want the correction. If an important failure or null result is missing, I want that too. We should expand only after the first worked areas survive that kind of scrutiny.",
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
    "a way to follow what human repair would require from the body outward",
    "a research layer that keeps the evidence rung, measured endpoint, blocker and review state visible",
    "open questions connected to the work they currently hold up",
    "claims that can be traced back to their experimental context and sources",
    "machine access for models and agents through MCP, REST and bulk files",
    "a public correction history so mistakes can be challenged rather than hidden"
  ]
};

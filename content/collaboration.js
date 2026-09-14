/* "For models and agents" — machine-facing copy.
   Exact graph vocabulary is intentional here. Rules-first rewrite removes explanatory filler
   while keeping provenance, review state and human gates explicit. */
window.HRM_COLLAB = {
  live: {
    tools: [
      ["graph_manifest", "current graph version, snapshot, content hash, and counts"],
      ["how_to_read", "the rung, measured, blocked by, and review state vocabulary"],
      ["get_node", "any record by id, with derived relations"],
      ["list_nodes", "filter records by type, projection, class, rung, blocker, or review state"],
      ["search", "free-text search over names, statements, and descriptions"],
      ["get_subgraph", "the neighbourhood of a node to a given depth"],
      ["trace_dependency", "a goal's dependency path, including binding constraints and AND/OR requirements"],
      ["find_blockers", "open questions that block a node"],
      ["rank_research_questions", "open questions ranked by downstream structure, per projection"],
      ["get_primary_evidence", "claims and sources behind a capability, including source-resolution state"],
      ["find_contradictions", "claims recorded as contradicting a rung or capability"],
      ["what_would_move_this", "the missing demonstration recorded for a node"],
      ["propose_change", "file a correction, rung challenge, new evidence, or question"],
      ["register_prediction", "lock a forecast against the graph snapshot you saw"],
      ["list_predictions", "predictions registered on a node"]
    ]
  },

  grounding: {
    rows: [
      ["G0", "Assertion", "A statement with no source attached", "Cannot enter the map"],
      ["G1", "Cited text", "A paper or report contains the claim", "Full verification packet + human"],
      ["G2", "Structured record", "Registry entry, regulatory filing, or trial record", "Automated cross-check; human spot-audit"],
      ["G3", "Primary data", "Deposited data that can be re-analysed", "Automated re-analysis; human reviews method"],
      ["G4", "Instrument-signed", "Captured data with an intact signed provenance chain", "Captured fact can be machine-verified; inference still needs accountable review"]
    ]
  },

  today: {
    can: [
      "Search papers, trial registries, and regulatory records in parallel",
      "Extract candidate claims into a fixed schema with exact source locators",
      "Compare independent searches and flag conflicting evidence",
      "Carry a research task across many sources without losing the question being asked"
    ],
    cannot: [
      "Turn a citation nobody opened into reviewed evidence",
      "Treat a biomarker as clinical benefit unless the evidence supports that step",
      "Decide that a scientific claim matters simply because several models agree"
    ],
    proof: "In the first brain-delivery audit, six agents graded sixteen routes in parallel. A second search caught one overstatement about a regulatory clinical hold: the public record supported a voluntary pause, while the reported origin of the hold was not publicly established. The entry stayed unreviewed until a person could check the sources."
  },

  phases: [
    {
      k: "A",
      name: "Agents that can keep watch",
      cap: "Agents can run for hours or days, return exact source spans, follow the schema reliably, and read figures, tables, and supplementary data.",
      unlocks: [
        { t: "Continuous monitoring", d: "An agent can watch the sources connected to one capability and file a proposal when new evidence appears. A person still decides whether the canonical record changes." },
        { t: "Review packets", d: "A reviewer can get the claim, exact passage, locator, study context, and contradictory evidence in one place. That removes search work without pretending the review itself has been automated.", packet: true }
      ]
    },
    {
      k: "B",
      name: "Agents that can argue with the evidence",
      cap: "Agents can re-run analyses from deposited data, compare contradictions across the corpus, and keep a persistent record of their own prior proposals.",
      unlocks: [
        { t: "Routine re-analysis", d: "When the data are available, the system can check whether a reported result survives a reproducible re-analysis and attach that result to the evidence record." },
        { t: "Contradiction checks", d: "Claims from separate literatures can be compared directly and proposed as contradictions for review." },
        { t: "Calibration histories", d: "A model or human proposer can accumulate a visible history of proposals that were accepted, overturned, or disputed. That history can affect how aggressively later proposals are checked without bypassing human acceptance." }
      ]
    },
    {
      k: "C",
      name: "Models connected to experiments",
      cap: "Domain models can make testable forecasts, suitable automated laboratories can run low-risk studies, and the results can return with provenance.",
      unlocks: [
        { t: "Prospective prediction tests", d: "A forecast can be locked to the graph snapshot that existed before the result, with the resolution criteria written down in advance." },
        { t: "Experiment proposals", d: "For a high-impact open question, a model can propose the experiment that would distinguish the important alternatives and state the assumptions behind it." },
        { t: "More proposals than people can read", d: "More capable models may produce useful candidate claims much faster than people can review them. Provenance, review state, prioritisation, and sampling matter more as that volume grows.", warn: true }
      ]
    }
  ],

  packet: ["claim", "exact quote", "locator: page, figure, table", "population and N", "comparator", "what was measured", "stated limitations", "contradicting sources found", "confidence and reason"],

  labour: {
    auto: [
      "Source discovery and de-duplication",
      "Structured extraction into schema",
      "Translation and terminology normalisation",
      "Staleness checks and dead-link detection",
      "Proposed dependency and contradiction links",
      "Draft change summaries",
      "Registering and scoring predictions"
    ],
    human: [
      "Setting review state to <b>reviewed</b>",
      "Accepting a change to a reviewed <b>rung</b>",
      "Approving <b>target-state and ethics</b> content",
      "Resolving <b>disputes</b>",
      "Accepting <b>safety claims</b>",
      "Making research-priority decisions when the evidence does not determine them"
    ],
    why: "These decisions carry scientific or normative responsibility. A named person stays attached to them. If that boundary changes later, the protocol should change in public rather than quietly moving a human decision into an automated path."
  },

  failures: [
    ["Model monoculture", "Several agents built on similar models can repeat the same mistake and look like independent agreement.", "Record the model behind each verdict. Treat agreement from one model family accordingly and use genuinely different systems for refutation."],
    ["Citation laundering", "A secondary or AI-generated statement can be repeated until nobody checks where it originally came from.", "Require a primary-source locator for claims that affect a rung and label secondary evidence explicitly."],
    ["Review theatre", "A large queue can turn human review into clicking approve without opening the evidence.", "Sample-audit reviews, publish overturn rates, and keep disputes visible."],
    ["Proposal flooding", "Agents can create proposals faster than people can check them.", "Keep the reviewed core deliberately small, show UNREVIEWED prominently, and prioritise proposals by the dependencies they affect."],
    ["Capture", "A funder, company, or research group could have an interest in the grade attached to its own work.", "Require conflict disclosure and keep challenges public. Funding policy should stop a mapped commercial party from controlling review."],
    ["Automation drift", "Human decisions can slip into automated paths because the queue is inconvenient.", "Version the division of labour and require a public protocol change before removing a human gate."]
  ],

  missing: [
    ["Automated ingestion", "The current records came from one AI-assisted research pass over papers, abstracts, registries, and regulatory material. There is no continuous OpenAlex, PubMed, or ClinicalTrials.gov ingestion yet."],
    ["Negative and null results", "The schema can store them, but the current graph has few. That makes it harder to see which approaches have already failed."],
    ["Human review", "HUMAN REVIEW: NONE across the current graph. The first expert reviews will test whether the source-verification and dispute process is usable."],
    ["Researcher utility evidence", "No domain researcher has yet completed the v0.4 comparison against their normal literature workflow. The pilot is meant to measure search time, scientific errors, missed evidence, and changes to what the researcher does next."],
    ["Institutional federation", "An institution cannot yet run a compatible node beside private data. The public formats are intended to make that possible later without changing the meaning of existing records."]
  ],

  test: "A future model should be able to inspect the evidence, dependencies, provenance, and history directly. If it has to scrape the website or guess what a field means, that part of the machine interface is unfinished."
};

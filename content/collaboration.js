/* "For models and agents" — content. What the machine interface is today, how AI
   and humans divide the work, and current failure modes. Rewritten 2026-09-11
   using in-c0/writing-skill. Full reasoning in ai-collaboration.md. */
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
      ["G4", "Instrument-signed", "Captured data with an intact signed provenance chain", "No human check for the captured fact; human review for the inference"]
    ]
  },

  today: {
    can: [
      "Search literature, trial registries, and regulatory records in parallel",
      "Extract candidate claims into a fixed schema with source locators",
      "Compare independent searches and surface conflicting evidence",
      "Carry a multi-step research task across many sources"
    ],
    cannot: [
      "Turn an unopened citation into reviewed evidence",
      "Infer clinical benefit from a surrogate endpoint without supporting evidence",
      "Set the scientific importance of a result without an accountable decision process"
    ],
    proof: "One example from this project: six agents graded the sixteen brain-delivery routes in parallel. A second search corrected one agent's statement about a regulatory clinical hold to the narrower public record: the pause was voluntary, while the origin of the reported hold was not publicly established. The record therefore stayed a proposal until its sources could be checked."
  },

  phases: [
    {
      k: "A",
      name: "Standing attention",
      cap: "Agents can run unattended for hours or days, return verifiable source spans, follow a schema reliably, and parse figures, tables, and supplementary data.",
      unlocks: [
        { t: "Continuous monitoring", d: "A standing agent can watch sources for a capability and file a proposal when something changes. A human still decides whether the canonical record changes." },
        { t: "Verification packets", d: "For a G1 claim, the reviewer can receive the claim, exact source passage, locator, study context, and contradictions together. This reduces search work while leaving the review decision with the named reviewer.", packet: true }
      ]
    },
    {
      k: "B",
      name: "Adversarial and reproducible",
      cap: "Agents can re-run analyses from deposited data, compare contradictions across the corpus, and keep persistent identities with a visible record of prior proposals.",
      unlocks: [
        { t: "Routine re-analysis", d: "When deposited data are available, the system can check whether a reported effect survives a reproducible re-analysis and attach that result to the evidence record." },
        { t: "Corpus-wide contradiction checks", d: "The system can compare claims that would otherwise remain in separate literatures and propose contradiction links for review." },
        { t: "Calibration records", d: "Human and model proposers can accumulate a public history of proposals that were accepted, overturned, or disputed. That history can guide how much checking a new proposal receives without bypassing human acceptance." }
      ]
    },
    {
      k: "C",
      name: "Closed loops",
      cap: "Domain models can make testable perturbation forecasts, automated laboratories can execute suitable low-risk studies, and results can return to the graph with provenance.",
      unlocks: [
        { t: "Prospective prediction evaluation", d: "A forecast can be locked to a graph snapshot with explicit resolution criteria, then scored when the relevant result becomes available." },
        { t: "Experiment specifications", d: "For a high-impact open question, the system can propose the experiment that would discriminate between the relevant alternatives and record the assumptions behind that proposal." },
        { t: "High-volume claim review", d: "More capable models could produce far more candidate claims than people can review. Provenance, review state, prioritisation, and sampling become more important as that volume rises.", warn: true }
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
      "Making decisions about <b>research priority</b> when the evidence does not determine them"
    ],
    why: "The items in the human-gated column carry scientific or normative responsibility. The protocol keeps a named person attached to those decisions. The division of labour is versioned so that any later change is visible."
  },

  failures: [
    ["Model monoculture", "Agents built on similar models can make correlated errors, so apparent agreement may add little independent evidence.", "Record the model behind each verdict and use genuinely different models for refutation; agreement from one model family counts accordingly."],
    ["Citation laundering", "A secondary or AI-generated statement can be repeated until its primary source is hard to find.", "Require a primary-source locator for claims that affect a rung; label secondary evidence explicitly."],
    ["Review theatre", "A large queue can encourage reviewers to approve packets without checking the underlying evidence.", "Sample-audit reviews, publish overturn rates, and keep disputes visible."],
    ["Proposal flooding", "Automated proposals can grow faster than review capacity.", "Keep the reviewed core deliberately small, show UNREVIEWED prominently, and prioritise proposals by the dependencies they affect."],
    ["Capture", "A funder, company, or research group could influence grades that affect its own work.", "Require conflict disclosure for reviewers and keep challenges public. Funding policy should prevent a mapped commercial party from controlling the review process."],
    ["Automation drift", "Human-gated decisions can gradually move into automated paths because the queue is large.", "Version the division of labour and require a public protocol change before a human gate is removed."]
  ],

  missing: [
    ["Automated ingestion", "The current records were assembled in one AI-assisted research pass from papers, abstracts, registries, and regulatory material. There is no continuous ingestion pipeline from OpenAlex, PubMed, or ClinicalTrials.gov yet. A future pipeline should create proposals with provenance."],
    ["Negative and null results", "The schema can record them, but the current graph contains few. This limits any attempt to judge which approaches have already failed."],
    ["Human review", "HUMAN REVIEW: NONE across the current graph. The first expert reviews will test whether the source-verification and dispute process works in practice."],
    ["Researcher utility evidence", "No domain researcher has yet completed the v0.4 comparison against their normal literature workflow. The pilot is meant to measure search time, scientific errors, missed evidence, and changes to the researcher's next step."],
    ["Institutional federation", "Institutions cannot yet run a compatible node beside private data. The public formats were chosen so that federation can be added without changing the meaning of existing records."]
  ],

  test: "For each interface decision, ask whether a more capable future model could inspect the same evidence, dependencies, provenance, and history without scraping or guessing at meaning. If important information exists only in the website presentation, expose it in the graph or machine interface."
};
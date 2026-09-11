/* "For models and agents" — content. What the machine interface is today, how AI
   and humans divide the work, and how it breaks. Rewritten 2026-09-11 against the
   writing rulebook. Full reasoning in ai-collaboration.md. */
window.HRM_COLLAB = {
  live: {
    tools: [
      ["graph_manifest", "what this graph is right now: version, snapshot, content hash, counts"],
      ["how_to_read", "the rung, measured, blocked and review vocabularies"],
      ["get_node", "any record by id, with its derived relations"],
      ["list_nodes", "filter by type, projection, class, rung, blocker, review state"],
      ["search", "free-text search over names, statements and descriptions"],
      ["get_subgraph", "the neighbourhood of a node to a given depth"],
      ["trace_dependency", "a goal's critical path: binding constraints and AND/OR requirements"],
      ["find_blockers", "the open questions gating a node"],
      ["rank_research_questions", "open questions ranked by what they block, per projection"],
      ["get_primary_evidence", "the claims and sources behind a capability, with resolution state"],
      ["find_contradictions", "claims that cut against a grade"],
      ["what_would_move_this", "the missing demonstration for a node"],
      ["propose_change", "file a correction, rung challenge, new evidence or question"],
      ["register_prediction", "lock a forecast against the snapshot hash you saw"],
      ["list_predictions", "predictions locked on a node"]
    ]
  },

  grounding: {
    rows: [
      ["G0", "Assertion", "Someone said it; no source attached", "Cannot enter the map"],
      ["G1", "Cited text", "A paper or report says it", "Full verification packet + human"],
      ["G2", "Structured record", "Registry entry, regulatory filing, trial record", "Automated cross-check; human spot-audit"],
      ["G3", "Primary data", "Deposited dataset that can be re-analysed", "Automated re-analysis; human reviews method"],
      ["G4", "Instrument-signed", "Signed at capture, provenance chain intact", "None for the fact; human only for the inference"]
    ]
  },

  today: {
    can: [
      "Search broadly and in parallel across literature, trial registries and regulatory records",
      "Extract structured claims into a fixed schema, reliably enough to be useful",
      "Attack the same claim from independent angles and surface different failure modes",
      "Hold a multi-step research task together over tens of minutes"
    ],
    cannot: [
      "Be trusted on a citation no human has opened. Confident paraphrase of a source that says something subtly different is the dominant failure mode",
      "Judge whether a surrogate endpoint means anything clinically",
      "Decide what matters"
    ],
    proof: "An example from this project. Six agents in parallel graded the sixteen brain-delivery routes, and they corrected each other. One agent's claim of a regulatory clinical hold was reduced by a second sweep to \"the pause was voluntary; the hold's origin is not publicly established.\" That correction is the reason every AI record here enters as a proposal that cannot promote itself."
  },

  phases: [
    {
      k: "A",
      name: "Standing attention",
      cap: "Agents that run unsupervised for hours to days · citations with verifiable quoted spans · schema-enforced output · reliable parsing of figures, tables and supplementary data rather than abstracts.",
      unlocks: [
        { t: "Continuous monitoring instead of one-off scans", d: "A standing agent per capability watches sources and files change proposals. It never edits. The \"what changed\" report is drafted by the agent and signed by a human." },
        { t: "The verification packet", d: "The reviewer's job changes from \"read this paper\" to \"does this quote support this claim: yes, no, or dispute\". For a G1 record that is most of the review cost. The packet stops being needed as records move to G3 and G4.", packet: true }
      ]
    },
    {
      k: "B",
      name: "Adversarial and reproducible",
      cap: "Agents that re-run analyses from deposited data · contradiction detection across the whole corpus · persistent agent identity, so a proposer builds a track record.",
      unlocks: [
        { t: "Reproducibility as a routine check", d: "\"Does the reported effect survive re-analysis of the deposited data?\" becomes a standing question, and a rung of its own." },
        { t: "Contradictions found automatically", d: "Disagreements no single reviewer would have noticed get surfaced across the corpus." },
        { t: "Calibration ledgers", d: "Every proposer, agent or human, carries a public record of proposals accepted, overturned and disputed. A better record buys a faster lane, never the right to skip human acceptance." }
      ]
    },
    {
      k: "C",
      name: "Closed loops",
      cap: "Domain models that predict perturbation outcomes well enough to be scored · automated labs that can run a cheap experiment end to end · systems proposing and executing their own studies.",
      unlocks: [
        { t: "A prediction registry that resolves", d: "Forecasts in the form \"X requires Y; Y is unproven beyond rodent; so X is at least one demonstration away\", with explicit resolution criteria. The map accumulates a public record of when it was right." },
        { t: "Specifying experiments, not only describing them", d: "Once the graph knows which question blocks the most downstream capability, its most useful output is a specification for the cheapest experiment that would move a rung." },
        { t: "The claim explosion", d: "This is where the risk peaks: AI-generated claims citing AI-generated claims at a volume no human corpus can absorb. A graph with years of provenance can be navigated; one without it cannot.", warn: true }
      ]
    }
  ],

  packet: ["claim", "exact quote", "locator: page, figure, table", "population and N", "comparator", "what was measured: function or surrogate", "stated limitations", "contradicting sources found", "confidence, and why"],

  labour: {
    auto: [
      "Source discovery and de-duplication",
      "Structured extraction into schema",
      "Translation and normalisation",
      "Staleness flagging and dead-link repair",
      "Proposed links and contradictions",
      "Drafting \"what changed\" reports",
      "Registering and scoring predictions"
    ],
    human: [
      "Accepting any record as <b>reviewed</b>",
      "Setting or changing a <b>rung</b>",
      "<b>Target-state and ethics</b> content: what counts as repair versus difference",
      "<b>Dispute resolution</b>",
      "Anything touching <b>safety claims</b>",
      "Deciding <b>what matters</b>"
    ],
    why: "Each item on the right is a value judgement or an act someone has to answer for. A rung is a claim about what humanity knows, and it needs a person who can be wrong in public. Automate that and there is nobody left to hold to it. The division is versioned and changes only by a public amendment to the protocol."
  },

  failures: [
    ["Model monoculture", "Every agent shares a base model, so errors correlate and adversarial review agrees with itself.", "Refutation uses diverse models; the model behind each verdict is logged; single-model consensus counts as one vote."],
    ["Citation laundering", "AI cites AI citing AI, and provenance dissolves.", "Every record needs a primary-source locator; secondary sources are labelled and cannot alone support a rung change."],
    ["Review theatre", "Humans approve packets to clear the queue.", "Reviewers are sample-audited; per-reviewer overturn rates are published; disputes are treated as a health metric."],
    ["Proposal flooding", "Agents outproduce review capacity and the backlog becomes the map.", "The reviewed core is kept deliberately small; unreviewed is visually dominant; the ratio is published."],
    ["Capture", "A funder or lab shapes the grades.", "No funding from any party with a product, trial or clinic on the map; per-reviewer conflict disclosure; disputes public."],
    ["Automation drift", "The human-gated column shrinks under load.", "The division of labour is versioned and changes only by public protocol amendment."]
  ],

  missing: [
    ["Ingestion is not automated", "Every record so far was reasoned by one AI session from abstracts and registry metadata. There is no pipeline from OpenAlex, PubMed or ClinicalTrials.gov yet. When there is, it will produce proposals, not records."],
    ["Few negative results", "Claims can record a null or negative result, and the schema treats them as first-class. Almost none are recorded yet."],
    ["No human reviewer", "Zero records have been reviewed. The first human review of even one record in one field is the next milestone, and it will show whether the review lane works at all."],
    ["No researcher has yet said it changed their next step", "The test for the graph is whether a domain researcher finds it more useful than their own literature search: whether it surfaced a missed paper, exposed an unsupported assumption, or changed which experiment they would run. That has not been tested."],
    ["No federation", "Institutions cannot yet run a node of their own beside private data. The formats (JSON-LD, JSON Schema, a content-hashed manifest) are chosen so that they could."]
  ],

  test: "The question asked of every design decision here: could a model we have not built yet use this dataset and this interface substantially better than we can? If the answer is no, the decision is probably wrong."
};

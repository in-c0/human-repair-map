/* Collaboration-view content — the AI-capability projection and the mechanisms
   that keep an AI-assisted commons trustworthy as capability grows.
   Full reasoning in ai-collaboration.md. */
window.HRM_COLLAB = {
  bet: {
    pull: "AI makes claims cheap. It does not make trust cheap.",
    body: "Every increment of AI capability increases the volume of scientific claims, syntheses, and confident-sounding summaries in the world. None of it increases the supply of <b>verified, attributed, disputable</b> knowledge. As generation gets cheaper, provenance becomes the scarce good — knowing which claim someone staked their name on, against which source, and who disagreed.",
    close: "So this commons becomes <i>more</i> valuable as AI improves, not less. The flood is the reason for the levee — and a commons earns authority through track record, which takes years to accumulate. That is the argument for starting now."
  },

  today: {
    can: [
      "Search broadly and in parallel across literature, trial registries, and regulatory records",
      "Extract structured claims into a fixed schema, reliably enough to be useful",
      "Attack the same claim from independent angles and surface different failure modes",
      "Hold a multi-step research task together over tens of minutes"
    ],
    cannot: [
      "Be trusted on a citation no human has opened — confident paraphrase of a source that says something subtly different is the dominant failure mode",
      "Judge whether a surrogate endpoint means anything clinically",
      "Decide what matters"
    ],
    proof: "Demonstrated in this project: six agents in parallel graded the sixteen delivery routes below, and — the important part — <b>corrected each other</b>. One agent's claim of a regulatory clinical hold was reduced by a second sweep to \"the pause was voluntary; the hold's origin is not publicly established.\" That correction is the system working, and it is why every AI record here enters as a proposal that cannot promote itself."
  },

  phases: [
    {
      k: "A",
      name: "Standing attention",
      cap: "Agents that run unsupervised for hours to days · grounded citation with verifiable spans · schema-enforced output · reliable parsing of figures, tables and supplementary data rather than abstracts.",
      unlocks: [
        { t: "Continuous monitoring, not episodic scans", d: "A standing agent per capability watches sources and files change-proposals — never edits. The \"what changed\" report becomes auto-drafted and human-signed." },
        { t: "The Verification Packet", d: "The single most important mechanism here. The reviewer's job stops being \"read this paper\" and becomes \"does this quote support this claim — yes, no, or dispute.\" That is roughly a 40× throughput gain on the binding constraint.", packet: true }
      ]
    },
    {
      k: "B",
      name: "Adversarial and reproducible",
      cap: "Agents that re-run analyses and statistics from deposited data · corpus-wide contradiction detection · persistent agent identity, so a proposer accrues a track record.",
      unlocks: [
        { t: "Reproducibility as a routine check", d: "\"Does the reported effect survive re-analysis of the deposited data?\" becomes a standing automatable question — and a rung on the ladder in its own right." },
        { t: "Conflicts populate themselves", d: "Corpus-wide contradiction detection surfaces disagreements no individual reviewer would have noticed." },
        { t: "Calibration ledgers", d: "Every proposer — agent or human — carries a public record of proposals accepted, overturned, and disputed. This buys <b>routing, not authority</b>: better track record means a faster lane, never the right to skip human acceptance." }
      ]
    },
    {
      k: "C",
      name: "Closed loops",
      cap: "Domain models that predict perturbation outcomes well enough to be scored · automated labs that can run a cheap experiment end to end · systems proposing and executing their own studies.",
      unlocks: [
        { t: "A prediction registry that resolves", d: "Conditional forecasts in the only durable form — \"X requires Y; Y is unproven beyond rodent; therefore X is at minimum one demonstration away\" — with explicit resolution criteria. The map accumulates public calibration for itself. A map that has been publicly right is the only kind worth consulting." },
        { t: "Commissioning, not just observing", d: "Once the graph knows which gate blocks the most downstream capability, the highest-value output stops being a report and becomes a specification for the cheapest experiment that would move a rung." },
        { t: "The claim explosion", d: "This is where the danger peaks: AI-generated claims citing AI-generated claims, at a volume no human corpus can absorb. A commons with years of provenance is the navigational instrument. One without it is noise.", warn: true }
      ]
    }
  ],

  packet: ["claim", "exact quote", "locator — page, figure, table", "population & N", "comparator", "what was measured — function vs surrogate", "stated limitations", "contradicting sources found", "confidence, and why"],

  labour: {
    auto: [
      "Source discovery and deduplication",
      "Structured extraction into schema",
      "Translation and normalisation",
      "Staleness flagging, dead-link repair",
      "Link and contradiction proposals",
      "Draft \"what changed\" reports"
    ],
    human: [
      "Accepting any record as <b>reviewed</b>",
      "Setting or changing a <b>maturity score</b>",
      "<b>Target-state and ethics</b> content — what counts as repair versus difference",
      "<b>Dispute resolution</b>",
      "Anything touching <b>safety claims</b>",
      "Deciding <b>what matters</b>"
    ],
    why: "Each item on the right is a value judgment or an accountability act. A maturity score is a claim about what humanity knows; it needs a human who can be <i>wrong in public</i>. Automate it and you remove the person who can be held to it — and an evidence commons with nobody accountable is just a confident website."
  },

  failures: [
    ["Model monoculture", "Every agent shares a base model, so errors correlate and adversarial review rubber-stamps itself.", "Refutation must use diverse models; log which model produced each verdict; single-model consensus counts as one vote."],
    ["Citation laundering", "AI cites AI citing AI, and provenance quietly dissolves.", "Every record requires a primary-source locator; secondary sources are labelled and cannot alone support a rung change."],
    ["Review theatre", "Humans rubber-stamp packets to clear the queue.", "Sample-audit the reviewers; publish per-reviewer overturn rates; treat disputes as a health metric."],
    ["Proposal flooding", "Agents outproduce review capacity and the backlog becomes the map.", "Keep the reviewed core deliberately small; make unreviewed visually dominant; publish the ratio."],
    ["Capture", "A funder or lab shapes the scores.", "No funding from any party with a product, trial, or clinic in the map; per-reviewer conflict disclosure; disputes public."],
    ["Automation drift", "The human-gated column quietly shrinks under load.", "The division of labour is versioned and changes only by public protocol amendment."]
  ],

  adoption: {
    lead: "An evidence commons dies if it is a website people are supposed to visit. It lives if it becomes infrastructure other systems reach for.",
    body: "The concrete move: expose the map as a <b>tool other agents call</b> — a stable machine-readable interface answering <i>what is the evidence state of X</i>, <i>what supports this claim and who disputes it</i>, and <i>what would move this rung</i>.",
    close: "Then any agent answering a question about biological repair can check the commons instead of guessing, and file a proposal back. The map becomes what an AI reaches for when it needs to know whether something is <i>actually proven</i> — precisely the question models are worst at and most confident about. It is also the answer to \"why would anyone contribute?\" They contribute because they are already querying it."
  },

  order: [
    { s: "done", t: "Provenance envelope + review states on every record", n: "v0.1" },
    { s: "next", t: "The Verification Packet format — and hand-verify the delivery module to prove the human lane works at all", n: "next" },
    { s: "then", t: "Adversarial pre-review: N diverse refuters before anything reaches the human queue", n: "" },
    { s: "then", t: "Calibration ledger for proposers; standing monitors per capability", n: "" },
    { s: "later", t: "Machine interface (MCP/API); prediction registry with resolution", n: "" },
    { s: "later", t: "Commissioning — the map specifying the cheapest decisive experiment", n: "" }
  ],
  orderNote: "Steps 1–3 are buildable with today's capability. Nothing here requires a breakthrough to start — it requires the discipline to keep the right-hand column human while everything left of it accelerates."
};

# Human Repair Map

**A public, AI-assisted map of humanity’s progress toward preventing, treating,
repairing, and eventually reversing major forms of biological damage.**

[Open the reconstructed v0.1 prototype](https://human-repair-map.wldud5192.chatgpt.site)

> **Prototype status:** This repository contains a reconstructed product
> prototype. Its records, maturity scores, counts, and change history are
> illustrative—not a validated scientific database.
>
> **Non-clinical boundary:** Human Repair Map does not diagnose, recommend
> treatments, select therapies, predict individual outcomes, determine trial
> eligibility, or provide patient-specific medical advice.

## The idea

Modern medicine advances through thousands of separate projects: cell atlases,
virtual cells, gene editing, cell therapy, regenerative medicine, rejuvenation,
targeted delivery, closed-loop devices, clinical trials, and many more.

Human Repair Map asks a top-down question:

> What if humanity shared one visible map of the capabilities required for
> biological repair—showing what works, what remains blocked, what evidence
> supports each claim, and what people can contribute today?

The project is intended to become a public knowledge commons: closer to
Wikipedia and GitHub than a conventional biotech landing page. Humans and AI
agents may propose additions, but accepted knowledge remains evidence-linked,
reviewed, attributable, disputable, and auditable.

## First-principles model

Every repair can be represented as a closed loop:

```text
Read → Diagnose → Define target state → Intervene → Verify → Adapt
```

Or more abstractly:

```text
current biological state → safe, desired biological state
```

The smallest powerful treatment primitive is not a gene, molecule, or cell by
itself. It is a **programmable, verified biological state change**.

A general repair system would need to operate across several layers:

| Layer | Example failures | Required repair operations |
| --- | --- | --- |
| Molecular | DNA damage, toxic aggregates, metabolic defects | Edit, remove, replace, refold, degrade |
| Cellular | Cancer, senescence, dead neurons, immune dysfunction | Destroy, repair, reprogram, replace |
| Tissue | Fibrosis, cartilage loss, scar tissue, muscle wasting | Remodel, regenerate, scaffold |
| Organ | Heart, kidney, liver, or pancreatic failure | Repair, regrow, replace |
| Systemic | Autoimmunity, endocrine imbalance, chronic inflammation | Recalibrate control loops |
| Neural information | Memory, identity, pain maps, motor control | Preserve, reconnect, retrain, restore |
| Body plan | Missing structures, spinal injury, malformation | Regenerate structure and function |

## Five enabling capabilities

### 1. Sufficient biological sensing

Measure the living system at the spatial, molecular, temporal, and functional
resolution required to decide and verify a safe intervention.

Potential inputs include:

- genome and epigenome;
- cell types and cell states;
- spatial tissue organisation;
- immune repertoire;
- proteomic and metabolic state;
- microbiome;
- tumour clones and pathogens;
- organ structure and mechanical injury;
- neural state and identity-relevant information;
- longitudinal and minimally invasive measurements.

The goal is not atom-level observation. It is **sufficient observation to know
what must be preserved, changed, removed, or rebuilt**.

### 2. Personal target-state modelling

Define what should change, what must be preserved, and what outcome counts as
safe, restored, healthy, supported, enhanced, or chosen by the person.

This combines:

- causal biological models;
- functional outcome models;
- individual goals and consent;
- disability and neurodiversity perspectives;
- identity and memory preservation;
- uncertainty and reversibility;
- explicit safety constraints.

“Better” cannot be inferred from biology alone.

### 3. Cell-specific access and delivery

Reach the right cell class, tissue, intracellular compartment, dose, location,
and time—ideally repeatedly and without harmful immune or off-target effects.

Important barriers include the blood–brain barrier, dense tumours, fibrotic
tissue, rare target cells, intracellular delivery, immune clearance, repeat
dosing, and cell-state-specific targeting.

### 4. Programmable cell-state editing

| Operation | Meaning |
| --- | --- |
| Repair | Fix DNA, mitochondria, proteins, membranes, or organelles |
| Reprogram | Change cell identity, behaviour, or regulatory state |
| Replace | Remove a failed cell and introduce a healthy replacement |
| Destroy | Eliminate cancerous, infected, senescent, or toxic cells |
| Regenerate | Trigger controlled rebuilding of tissue |
| Reconnect | Restore network function, particularly in nerves |
| Recalibrate | Change immune, endocrine, or metabolic control loops |

Powerful editing must be paired with delivery, safety control, and
verification. Regeneration without growth control can become cancer; immune
recalibration without monitoring can become autoimmunity or immunodeficiency.

### 5. Closed-loop verification

Observe outcomes, detect escape or overcorrection, adapt the intervention, and
verify both local repair and long-term whole-body stability.

```text
sense → intervene → sense again → adapt → verify → maintain
```

Verification may need to span:

```text
molecule → cell → tissue → organ → immune system → brain → behaviour → time
```

## Most realistic capability path

The map models the likely dependency path as:

1. more complete and representative cell atlases;
2. virtual cell and tissue models;
3. larger, cleaner perturbation datasets;
4. disease-specific state interventions;
5. safer cell- and tissue-specific delivery;
6. regenerative control in selected tissues;
7. closed-loop monitoring and adaptive treatment;
8. multi-disease repair platforms;
9. whole-body repair orchestration.

This is a dependency path, not a prediction of inevitable progress or a
“universal cure” date.

## Highest-leverage bottlenecks

1. **Causal biological models** — predicting how to move state X safely toward
   state Y, rather than merely recognising correlations.
2. **Cell-specific delivery** — reaching exact targets at the right dose and
   time without affecting other cells.
3. **Long-horizon safety control** — cancer, immune collapse, fibrosis,
   mispatterning, off-target effects, and delayed instability.
4. **Living whole-body sensing** — repeated, minimally invasive, multiscale
   measurement.
5. **Target-state definition** — deciding what “fixed,” “healthy,” “better,” and
   “still me” mean.
6. **Brain and identity preservation** — repairing function without erasing
   memory, personality, agency, or learned ability.
7. **Manufacturing and cost** — making interventions reliable and accessible.
8. **Regulatory pathways** — evaluating systems combining drugs, cells,
   devices, AI, manufacturing, and adaptive control.

## Product specification

### Primary users

- researchers and domain reviewers;
- funders, charities, foundations, and challenge organisers;
- engineers and data contributors;
- evidence curators and translators;
- patient and disability advocates;
- policymakers and public-interest institutions;
- governed AI agents;
- citizens exploring the state of biological repair.

### Information architecture

```text
Human Repair Map
├── Overview
│   ├── Five capabilities
│   ├── Most realistic path
│   ├── Highest-leverage bottlenecks
│   └── What changed?
├── Capability map
│   ├── Capability records
│   ├── Dependency graph
│   ├── Domain modules
│   └── Maturity history
├── Evidence registry
│   ├── Sources
│   ├── Claims
│   ├── Conflicts
│   ├── Review state
│   └── Provenance
├── Open tasks
│   ├── Evidence synthesis
│   ├── Claim audits
│   ├── Translation
│   ├── Data quality
│   └── Scientific review
└── Governance
    ├── Contribution protocol
    ├── Review protocol
    ├── Conflicts of interest
    ├── Dispute history
    └── Public snapshots
```

### Example capability record

```yaml
id: capability.delivery.cell-specific
title: Cell-specific in-vivo delivery
summary: >
  Reach the correct cell class, tissue, compartment, dose, and time.
parent_capability: universal-cellular-access
domain: delivery
maturity:
  score: 36
  interval: [30, 42]
  rubric_version: 0.1
  rationale_claim_ids: [claim-001, claim-014]
dependencies:
  - tissue-navigation
  - cell-state-recognition
  - repeat-dosing
blocked_capabilities:
  - programmable-cell-state-editing
review_state: reviewed
reviewer_ids: [reviewer-12, reviewer-41]
evidence_ids: [evidence-0197, evidence-0210]
dispute_ids: []
updated_at: 2026-06-11
```

### Example evidence record

```yaml
id: evidence-0197
source_type: systematic-review
citation: "<structured citation>"
source_url: "<canonical source URL>"
supports_claim_ids: [claim-001]
contradicts_claim_ids: []
extraction:
  method: human
  extracted_by: contributor-22
  excerpt_location: "<page, figure, section, or dataset row>"
population_or_system: "<scope>"
limitations: ["<known limitation>"]
review_state: reviewed
```

### Maturity rubric

A score must never appear without its evidence, uncertainty, rubric version,
review state, and dispute history.

| Range | Interpretation |
| --- | --- |
| 0–20 | Conceptual or foundational |
| 21–40 | Emerging or preclinical |
| 41–60 | Translational |
| 61–80 | Validated in bounded use |
| 81–100 | Reliable, scalable, and integrated |

Scores should consider evidence quality, reproducibility, causal support,
safety, generalisation, delivery, manufacturing, functional outcomes,
durability, dependent capabilities, reviewer agreement, and unresolved
disputes.

### Review states

| State | Meaning | Can affect official scores? |
| --- | --- | --- |
| AI proposal | Machine-generated and visible with provenance, but unassessed | No |
| Submitted | Human or agent contribution awaiting checks | No |
| In review | At least one qualified reviewer is assessing it | Provisional only |
| Reviewed | Accepted under the current protocol | Yes |
| Disputed | A material sourced disagreement is unresolved | Yes, with warning |
| Superseded | Preserved in history but replaced | No |
| Retracted | Invalidated while retained in the audit trail | No |

### Contribution workflow

```text
Propose
  ↓
Automated provenance and schema checks
  ↓
Public unreviewed record
  ↓
Human review and conflict disclosure
  ↓
Accept, revise, dispute, supersede, or reject
  ↓
Versioned public map and change report
```

AI agents may discover sources, extract structured claims, propose
relationships, identify contradictions, draft score changes, suggest open
tasks, translate, and normalise records.

AI agents may not silently accept their own proposals, alter official scores,
erase conflicting evidence, infer personal clinical advice, convert forecasts
into certainty, or hide provenance.

## Deep modules

The first release should map the five shared capabilities and go deeply into
one bounded module:

- **cell-specific delivery**, or
- **programmable cell-state editing**.

Future modules may cover ageing damage, spinal cord repair, glioblastoma, rare
genetic disease, organ regeneration, neurodegeneration, immune recalibration,
and fibrosis remodelling.

## v0.1 scope

- [x] Public interface demonstrating the five capabilities
- [x] Capability and bottleneck navigation
- [x] Illustrative maturity rubric and evidence registry
- [x] AI-proposal and human-review states
- [x] Open contributor-task interface
- [x] Search and capability-detail views
- [ ] Replace illustrative data with 50–100 reviewed capability records
- [ ] Publish the formal scoring rubric
- [ ] Connect claims to canonical sources
- [ ] Add persistent storage and version history
- [ ] Add reviewer identity and conflict-of-interest records
- [ ] Implement public proposals and dispute resolution
- [ ] Publish monthly “What changed?” reports
- [ ] Expose a stable machine-consumable interface
- [ ] Establish an independent governance charter

## Safety and ethics

### Explicit exclusions

Human Repair Map does not provide:

- diagnosis, prognosis, or treatment selection;
- patient-specific recommendations;
- drug, vaccine, or supplement recommendations;
- clinical trial eligibility certainty;
- individual genomic interpretation;
- neoantigen or personalised-vaccine design;
- unsafe biological experimentation instructions;
- a certain date for universal biological repair.

### Identity and consent

Not every disability or difference is “damage,” and not every person wants the
same target state. The map must distinguish pathology from identity, damage
from adaptation, disability from difference, repair from unwanted alteration,
and enhancement from coercion.

Consent, agency, reversibility, accessibility, and representation are system
requirements—not an ethics appendix.

### Information limits

Exact restoration may be impossible when identity-critical information has
been destroyed and cannot be inferred or recovered. The map must not imply
that all damage is reversible or that a reconstructed state necessarily
preserves personal continuity.

## Governance principles

1. Public-interest stewardship of the roadmap and evidence registry.
2. Open access to claims, sources, score rationales, disputes, and history.
3. Provenance for every human- or machine-generated contribution.
4. Human accountability for accepted scientific claims.
5. Clear conflicts-of-interest disclosure.
6. Domain review without excluding public source-finding and auditing.
7. Representation across geography, language, ancestry, disability, and lived
   experience.
8. No hidden deletion of conflicting or negative evidence.
9. Versioned protocols and reproducible public snapshots.
10. Strict separation between research mapping and individual medical advice.

## Potential sustainability model

The public roadmap, governance process, contribution protocol, and evidence
registry should remain part of the public-interest commons.

Separate paid services could support the commons through institutional
dashboards, continuous evidence monitoring, APIs, bulk data, forecasting,
capability reports, custom modules, and governed agent infrastructure.

Commercial services must not receive secret control over public scores,
evidence acceptance, disputes, or roadmap priorities.

## Current prototype

The reconstructed interface is a standalone HTML application:

```text
index.html
```

It includes:

- a Wikipedia-like public knowledge layout;
- full-text prototype search;
- overview, capability-map, evidence, and task views;
- an interactive dependency graph;
- capability and bottleneck detail dialogs;
- illustrative evidence and review states;
- responsive desktop and mobile styling;
- no backend, account, submission, or clinical functionality.

Open `index.html` directly in a browser. No build step is required.

## Project status

Human Repair Map is at the **foundational prototype** stage. The interface
demonstrates how the commons could work; it is not yet the scientific commons
it describes.

The next meaningful milestone is one credible, deeply reviewed module—most
likely cell-specific delivery—with real sources, explicit scoring, domain
review, public disputes, and a reproducible export.

## Licence

No licence has been selected yet. Until a licence file is added, standard
copyright applies. A future release should choose licences separately for
source code, structured data, written summaries, and contributor submissions.

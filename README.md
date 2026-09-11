# Human Repair Map

**A public, AI-assisted map of the capabilities required to repair a human — what
works, what is blocked, what evidence supports each claim, graded openly with its
review state.**

> **Prototype (v0.3).** Every record on this map carries its own review state. As of
> 2026-09-11, **0 of 326 records have been reviewed by a human**: the sources were
> located and their metadata machine-verified, and nothing more. This maps
> *research state*, not clinical care. It does **not** diagnose, recommend
> treatments, select therapies, predict individual outcomes, or give
> patient-specific medical advice.

## The idea

Medicine advances through thousands of separate projects — cell atlases, virtual
cells, gene editing, cell therapy, regenerative medicine, targeted delivery,
closed-loop devices. Human Repair Map asks the top-down question: *what if there
were one visible map of the capabilities repair requires, and every judgment on it
were graded openly with its evidence and its review state?*

Closer to Wikipedia and GitHub than a biotech landing page. Humans and AI agents
may propose; accepted knowledge stays evidence-linked, attributable, disputable,
and auditable.

## What's in v0.1

**Live: [humanrepairmap.com](https://humanrepairmap.com)** · **MCP endpoint: [humanrepairmap.com/mcp](https://humanrepairmap.com/mcp)**

## What's in v0.3 — the Human Repair Graph

The map is now **one graph with two public projections** — *Universal Repair*
(trauma, infection, cancer, organ failure) and *Rejuvenation* (aging) — built so
that a model, an agent or an institution can inspect, reason over, challenge,
extend and act through it without scraping a page. Six record types:

| type | what it is | count |
|---|---|---|
| **goal** | a repair outcome from the person's side, decomposed with AND/OR requirement groups | 10 |
| **capability** | something humanity must be able to DO to a target, graded L0–L5 on demonstrated evidence, with what blocks the next rung | 30 hand-authored + 155 derived from the v0.2 cell grid |
| **question** | an unresolved uncertainty whose answer moves a grade or a dependency — the unit of research prioritisation | 20 |
| **claim** | one statement + context + measurement + evidence + provenance; the unit of knowledge is not the paper | 24 |
| **experiment** | a candidate or running study that tests a question | 6 |
| **source** | where evidence lives, with a machine `resolution` record kept separate from whether a human has opened it | 34 |

First proving ground: **scarless functional repair of adult human skin** — it
sits across both maps. The 16 CNS-delivery routes and the 31-node repairability
grid from earlier versions are nodes in the same graph, not a separate dataset.

The build derives every inverse relation (a relation is stored once), rejects
dangling references and dependency cycles, and computes a **structural
analysis**: for each goal the binding constraints (AND-required capabilities at
the lowest rung), and open questions ranked by how much sits downstream of what
they block. No probabilities, costs or dates are invented anywhere.

### Use it from a model

```bash
claude mcp add --transport http human-repair-map https://humanrepairmap.com/mcp
```

22 tools. Orientation: `graph_manifest`, `how_to_read`. Retrieval: `get_node`,
`list_nodes`, `search`, `get_subgraph`. Reasoning: `trace_dependency` (a goal's
critical path), `find_blockers`, `rank_research_questions`, `get_primary_evidence`,
`find_contradictions`, `what_would_move_this`. Action: `propose_change` (files a
correction into the public hash-chained log) and `register_prediction` (locks a
forecast against the graph snapshot you saw, resolved later against reality —
the map as a prospective, contamination-free benchmark). Every result carries
`structuredContent` and the review state of what it returned.

### Use it without MCP

- **REST** — [`/api`](https://humanrepairmap.com/api) · [`/api/openapi.json`](https://humanrepairmap.com/api/openapi.json). Every node is a URL: `/api/goals/scarless-skin-repair/critical-path`, `/api/questions/ranked`, `/api/claims/<slug>/evidence`.
- **Bulk** — [`/graph/graph.json`](https://humanrepairmap.com/graph/graph.json) · `graph.jsonl` · `graph.jsonld` · `manifest.json` (content hash; immutable per hash) · `schema/` (the JSON Schemas every record is validated against).
- **Source** — [`records/graph/`](records/graph/) is the only source of truth; [`schema/`](schema/) and [`ontology/`](ontology/) define it; [`scripts/build.mjs`](scripts/build.mjs) is the only writer of everything generated.

Design record: [`brief-2026-09-11-map-cure-machine-progress.md`](brief-2026-09-11-map-cure-machine-progress.md) (the owner's words verbatim and the thread that reopened the project).

A no-backend prototype (`index.html` + `content/`) demonstrating:

- **The thesis** — the first-principles case that biological repair is possible
  in principle, what the irreducible enabling capability is, and where
  information loss makes repair impossible. Follows the project's founding draft.

- **The five enabling capabilities** — sensing, target-state modelling,
  cell-specific delivery, cell-state editing, closed-loop verification — each with
  a maturity score, uncertainty interval, and review state.
- **A dependency graph** of the repair loop (sense → target → deliver → edit →
  verify → adapt).
- **The deep module: cell-specific delivery**, seeded with **16 real CNS-delivery
  routes** graded on an evidence ladder (L2 rodent → L4 human, once → L5 human,
  independently), with what each route actually *measured* (a life vs a biomarker)
  and its drift. Data: [`data/cns-delivery.json`](data/cns-delivery.json).
- **An evidence registry, open-task interface, and governance model** with the
  full review-state ladder (AI proposal → submitted → in review → reviewed →
  disputed → superseded).
- **Full-text search** across capabilities, routes, evidence, and tasks.

Every delivery record enters as **AI-proposed and unreviewed** — sourced by search
agents, not yet hand-checked. That is the review-state system working as designed,
not a defect. The headline finding it surfaces: *nothing is both broad and proven
in humans* — opening the blood-brain barrier is independently proven, while
delivering a drug through it to a clinical outcome is proven nowhere.

## Run it

Open `index.html` directly in a browser, keeping the `content/` folder beside it
— no build, no server, no account.

Pushes to `main` auto-deploy to Cloudflare Pages via
`.github/workflows/deploy.yml` (requires the `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` repository secrets).

## The one hard gate

The commons' credibility rests on one line: **a record cannot reach the "reviewed"
state until a human opens its cited sources.** The v0.1 delivery module is entirely
AI-proposed; hand-verifying its citations is the first open task. See
[`design.md`](design.md) for the full design and the two-faces model (capability
map × damage atlas).

## Not a clinical tool

No diagnosis, prognosis, treatment selection, patient-specific recommendations,
trial-eligibility certainty, or a date for "universal repair." Pathology is
distinguished from identity, damage from adaptation, disability from difference.
Consent, agency, and reversibility are system requirements, not an appendix.

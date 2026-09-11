# Human Repair Map

**A public, AI-assisted map of the capabilities required to repair a human — what
works, what is blocked, what evidence supports each claim, graded openly with its
review state.**

> **Prototype (v0.3 → v0.4 validation).** Every record carries its own review
> state. As of 2026-09-11, **0 of 326 records have been reviewed by a human**:
> sources were located and their metadata machine-verified, and nothing more.
> v0.4 therefore prioritises **expert falsification and researcher utility** over
> adding more diseases or more nodes. This maps *research state*, not clinical
> care. It does **not** diagnose, recommend treatments, select therapies, predict
> individual outcomes, or give patient-specific medical advice.

## The idea

Medicine advances through thousands of separate projects — cell atlases, virtual
cells, gene editing, cell therapy, regenerative medicine, targeted delivery,
closed-loop devices. Human Repair Map asks the top-down question: *what if there
were one visible map of the capabilities repair requires, and every judgment on it
were graded openly with its evidence and its review state?*

Closer to Wikipedia and GitHub than a biotech landing page. Humans and AI agents
may propose; accepted knowledge stays evidence-linked, attributable, disputable,
and auditable.

**Live: [humanrepairmap.com](https://humanrepairmap.com)** · **MCP endpoint: [humanrepairmap.com/mcp](https://humanrepairmap.com/mcp)**

## v0.4 — prove that the map helps researchers

The immediate milestone is deliberately not broader coverage.

Human Repair Map must first answer a harder question:

> **Can a domain researcher use this graph to reach a defensible view of the
> evidence, blockers and next questions faster — without increasing scientific
> error — and does it ever change what they would investigate next?**

The first proving ground remains **scarless functional repair of adult human
skin**. The v0.4 pilot compares a researcher's normal literature workflow with
HRM on matched questions, measuring time-to-defensible-research-state, factual
errors, missed contradictions, decision changes and graph falsification yield.

- **Contribute / review:** [`CONTRIBUTING.md`](CONTRIBUTING.md)
- **Researcher pilot protocol:** [`docs/researcher-pilot-v0.4.md`](docs/researcher-pilot-v0.4.md)
- **Structured scientific challenge:** open a *Scientific review / challenge* issue

Do not turn hundreds of records green for appearance. Review the highest-leverage
branch first: claims that determine capability rungs, binding constraints,
contradictory/replication evidence, top-ranked questions, and experiments attached
to those questions.

## v0.3 — the Human Repair Graph

The map is **one graph with two public projections** — *Universal Repair*
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

The scarless-skin proving ground sits across both maps. The 16 CNS-delivery routes
and the 31-node repairability grid from earlier versions are nodes in the same
graph, not separate knowledge silos.

The build derives every inverse relation (a relation is stored once), rejects
dangling references and dependency cycles, and computes a **structural analysis**:
for each goal the binding constraints (AND-required capabilities at the lowest
rung), and open questions ranked by how much sits downstream of what they block.
No probabilities, costs or dates are invented anywhere.

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
the map as a prospective, contamination-resistant benchmark). Every result carries
`structuredContent` and the review state of what it returned.

### Use it without MCP

- **REST** — [`/api`](https://humanrepairmap.com/api) · [`/api/openapi.json`](https://humanrepairmap.com/api/openapi.json). Every node is a URL: `/api/goals/scarless-skin-repair/critical-path`, `/api/questions/ranked`, `/api/claims/<slug>/evidence`.
- **Bulk** — [`/graph/graph.json`](https://humanrepairmap.com/graph/graph.json) · `graph.jsonl` · `graph.jsonld` · `manifest.json` (content hash; immutable per hash) · `schema/` (the JSON Schemas every record is validated against).
- **Source** — [`records/graph/`](records/graph/) is the only source of truth; [`schema/`](schema/) and [`ontology/`](ontology/) define it; [`scripts/build.mjs`](scripts/build.mjs) is the only writer of everything generated.

Design record: [`brief-2026-09-11-map-cure-machine-progress.md`](brief-2026-09-11-map-cure-machine-progress.md) records the thread that reopened the project and the design decisions behind this graph.

## Earlier prototypes retained in the graph

The project began as a no-backend prototype (`index.html` + `content/`) with:

- the first-principles repair thesis;
- five enabling capabilities — sensing, target-state modelling, cell-specific
  delivery, cell-state editing, closed-loop verification;
- a dependency graph of the repair loop;
- a deep module grading 16 real CNS-delivery routes;
- an evidence registry, open-task interface and review-state ladder;
- a 31-node cell/tissue repairability grid.

These are retained as graph nodes and data rather than maintained as separate
sources of truth.

## Canonical data and validation

`records/graph/` is canonical. A relation is stored once; inverse relations are
derived. Generated website/API/export files must not be edited independently.

After changing records:

```bash
node scripts/build.mjs
node mcp/test.mjs
```

CI validates schemas, references, dependency cycles, grade evidence and the human
review gate, and fails if generated exports drift from canonical records.

## Deployment

Pushes to `main` assemble and deploy the static site to Cloudflare Pages via
`.github/workflows/deploy.yml`. Deployment requires repository secrets
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

The machine API/MCP worker has its own deployment/runtime configuration under
`mcp/`.

## The one hard gate

The commons' credibility rests on one line:

> **A record cannot reach `reviewed` until a named human opens its cited primary
> sources and verifies that they support the attached scientific claim.**

Machine source-resolution and cross-model agreement are recorded separately. They
never masquerade as human review.

## Not a clinical tool

No diagnosis, prognosis, treatment selection, patient-specific recommendations,
trial-eligibility certainty, or date for "universal repair." Pathology is
distinguished from identity, damage from adaptation, disability from difference.
Consent, agency, and reversibility are system requirements, not an appendix.

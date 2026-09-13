# Human Repair Map

**A public, machine-readable map of the capabilities needed to repair a human body: what has been demonstrated, what is still required, what blocks the next rung, and whether a human has checked the evidence.**

Live: [humanrepairmap.com](https://humanrepairmap.com) · MCP: [humanrepairmap.com/mcp](https://humanrepairmap.com/mcp) · API: [humanrepairmap.com/api](https://humanrepairmap.com/api)

> **Prototype (graph v0.3, snapshot 2026-09-11). HUMAN REVIEW: NONE.** As of this snapshot, **0 of 326 records** are human-reviewed. Sources have been located and their metadata machine-checked. Unless a record says `reviewed` with a named human reviewer, treat it as **UNREVIEWED**. Research state only. Not a clinical tool. It does not diagnose, recommend treatments, or give advice about any person's illness.

## What this maps

The long-term question is simple to state: if a person is injured, ill, disabled by biological damage, or affected by aging, what capabilities would be required to restore the healthiest attainable state they choose while preserving identity and agency?

Medicine works on many parts of that problem separately. Human Repair Map represents the dependencies between them. A goal is decomposed into required capabilities. Each capability records an evidence **rung**, what was **measured**, what it is **blocked by**, and its **review state**. Open questions are connected to the capabilities they currently block.

The first goal worked through in detail is **scarless functional repair of adult human skin**. It touches trauma and regeneration, and it depends on capabilities that recur elsewhere in the graph: vascularisation, matrix organisation, cell-state control, innervation, and verification.

## Two maps, one evidence graph

The public reader starts with two projections:

- **Universal Repair** — trauma, infection, cancer, organ failure, neurological damage, and other biological damage.
- **Rejuvenation** — biological aging, regenerative capacity, and restored youthful function.

The **Full research graph** contains both projections and their shared records. When one capability matters to both projections, it has one canonical record and one evidence state.

## The grading vocabulary

The website, API, MCP tools, and README use the same four fields:

- **Rung, L0–L5** — how far the capability has been demonstrated. L2 is rodent evidence. L4 is human evidence from one group. L5 is independent human replication.
- **Measured** — what changed in the evidence: function, biomarker, tissue structure, access, or another recorded endpoint.
- **Blocked by** — what prevents the next rung. The current graph distinguishes scientific blockers from framework constraints such as approval, ethics, manufacturing, or cost.
- **Review state** — `ai-proposed`, `submitted`, `in-review`, `reviewed`, `disputed`, or `superseded`. `ai-proposed` is **UNREVIEWED · HUMAN REVIEW: NONE**. Only a named human can set `reviewed`.

The evidence rung and review state are independent. A capability can have human evidence at L4 while the Human Repair Map record describing that evidence is still unreviewed.

## What is in graph v0.3

| type | what it records | count |
|---|---|---:|
| **goal** | a repair outcome and its AND/OR requirements | 10 |
| **capability** | something a repair system must be able to do, with rung, measured, blocked by, and review state | 30 hand-authored + 155 from the body grid |
| **question** | an unresolved uncertainty connected to what it blocks | 20 |
| **claim** | one evidence-linked statement with experimental context and provenance | 24 |
| **experiment** | a candidate or running study that tests a question | 6 |
| **source** | the primary location of evidence, with machine resolution kept separate from human review | 34 |
| **cell, route** | the 31-node body grid and 16 CNS-delivery routes retained from earlier versions | 47 |

The build stores each relation once, derives inverse relations, rejects dangling references and dependency cycles, and computes structural analysis for each goal. Binding constraints are the AND-required capabilities at the lowest rungs. Open questions are ranked by how much graph structure sits downstream of what they block. The ranking does not invent probability, cost, or completion dates.

## v0.4: test whether researchers find it useful

Coverage is paused as the main success metric. The next question is whether a domain researcher can use the graph to reach a defensible view of the evidence and blockers with less search work, without increasing scientific error.

The first pilot uses matched questions about scarless skin repair and records:

- time to a defensible research state;
- scientific errors and omitted contradictory evidence;
- information the researcher considers useful and had missed in their normal workflow;
- changes to what they would read, measure, model, collaborate on, or test next;
- errors and missing structure in Human Repair Map itself.

See [`docs/researcher-pilot-v0.4.md`](docs/researcher-pilot-v0.4.md), [`docs/reviewer-brief-v0.4.md`](docs/reviewer-brief-v0.4.md), and [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Use it from a model

```bash
claude mcp add --transport http human-repair-map https://humanrepairmap.com/mcp
```

Useful tools include `graph_manifest`, `how_to_read`, `get_node`, `list_nodes`, `search`, `get_subgraph`, `trace_dependency`, `find_blockers`, `rank_research_questions`, `get_primary_evidence`, `find_contradictions`, `what_would_move_this`, `propose_change`, and `register_prediction`.

Every result includes structured content and the review state of the returned records. `how_to_read` returns the same rung, measured, blocked by, and review state vocabulary used by the website.

### Propose a change

`POST /api/proposals` (or the MCP tool `propose_change`) files a change against any record. A scheduled workflow turns each one into a draft pull request carrying its event hash, so a proposal filed through the API and a pull request opened on GitHub reach the same human review queue. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

### Use it without MCP

- **REST** — [`/api`](https://humanrepairmap.com/api) · [`/api/openapi.json`](https://humanrepairmap.com/api/openapi.json). Examples: `/api/goals/scarless-skin-repair/critical-path`, `/api/questions/ranked?projection=rejuvenation`, `/api/claims/<slug>/evidence`.
- **Bulk** — [`/graph/graph.json`](https://humanrepairmap.com/graph/graph.json) · `graph.jsonl` · `graph.jsonld` · `manifest.json` · `schema/`.
- **Canonical source** — [`records/`](records/) contains the records; [`schema/`](schema/) and [`ontology/`](ontology/) define their structure and vocabulary; [`scripts/build.mjs`](scripts/build.mjs) generates the website/API exports.

The machine interface is intended to expose the same evidence, dependencies, provenance, history, and uncertainty that a person can inspect on the site. A future model should not need to scrape presentation text to recover the scientific structure.

## What is still missing

- **Human review:** 0 of 326 records are human-reviewed in the current snapshot.
- **Automated ingestion:** there is no continuous ingestion pipeline from OpenAlex, PubMed, or ClinicalTrials.gov.
- **Negative and null evidence:** the schema supports it, but little has been entered.
- **Researcher validation:** the v0.4 pilot has not yet established whether the graph improves a real researcher's workflow.
- **Institutional federation:** compatible private nodes are an intended interface direction; none is running today.

## Run it

Open `index.html` in a browser with `content/` and `public/graph/` beside it. No build step or account is required. The site fetches `graph/graph.json`, with `public/graph/graph.json` as the repository fallback.

Pushes to `main` deploy to Cloudflare Pages via `.github/workflows/deploy.yml` and require the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The worker in [`mcp/`](mcp/) serves `/mcp` and `/api`.

## Writing

Reader-facing copy follows [`in-c0/writing-skill`](https://github.com/in-c0/writing-skill): write for the reader, keep terminology stable, preserve the author's voice, and remove rhetoric that makes the writing more noticeable than the subject. The September 2026 review is in [`writing-review-2026-09-11.md`](writing-review-2026-09-11.md).

## Design record

[`brief-2026-09-11-map-cure-machine-progress.md`](brief-2026-09-11-map-cure-machine-progress.md) records the discussion that reopened the project. Earlier design records are [`vision-core-2026-07-28.md`](vision-core-2026-07-28.md) and [`design.md`](design.md). The current Dependency Survey direction is maintained under `design/`.

## Research use only

Research state only. Not a clinical tool. It does not diagnose, recommend treatments, or give advice about any person's illness. The graph does not provide patient-specific prognosis, trial-eligibility certainty, individual genomic interpretation, or a date for universal repair.
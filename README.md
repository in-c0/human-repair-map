# Human Repair Map

**A public, machine-readable map of the capabilities needed to repair a human body:
what has been shown to work, in whom, what blocks the next step, and whether a human
has checked the sources.**

Live: [humanrepairmap.com](https://humanrepairmap.com) · MCP: [humanrepairmap.com/mcp](https://humanrepairmap.com/mcp) · API: [humanrepairmap.com/api](https://humanrepairmap.com/api)

> **Prototype (graph v0.3, snapshot 2026-09-11).** Every record carries its own review
> state. Unless a record says *reviewed* with a named human, no human has opened its
> sources. As of the snapshot that is **0 of 326 records**: the sources were located and
> their metadata machine-checked, and nothing more. This maps research state, not
> clinical care. It does not diagnose, recommend treatments, or give advice about any
> person's illness.

## The idea

Medicine advances through thousands of separate projects: cell atlases, gene editing,
cell therapy, regenerative medicine, targeted delivery, closed-loop devices. Each group
can mostly see its own piece. This map asks the top-down question. If the goal is to
repair a person, what has to be true, what is true today, and which unanswered question
is holding up the most?

The internal north star is a universal repair machine: anyone, in whatever state, to
their healthiest attainable, identity-preserving state. The map does not promise that.
It tracks how far each capability such a machine would need has actually been
demonstrated, and what would move it.

## Two maps, one graph

The website opens with a choice:

- **Universal Repair** — from trauma and infection to cancer and organ failure.
- **Rejuvenation** — from biological aging to restored youthful function.
- **Full research graph** — everything, for readers and models that want it all.

Rejuvenation is a branch of universal repair, not a separate field. Both maps are
projections of one evidence graph; a capability that matters to both appears in both,
with one grade. The first goal worked through in detail is **scarless functional repair
of adult human skin**, chosen because it sits across both maps and decomposes into
capabilities other repair problems also need.

## v0.4: does the map help a researcher?

The next milestone is deliberately not more coverage. Before adding diseases or nodes,
the graph has to pass one test with a domain researcher: can they reach a defensible
view of the evidence, the blockers and the next questions faster than with their usual
literature workflow, without more scientific error, and does it ever change what they
would investigate next?

The pilot compares a researcher's normal workflow with the map on matched questions
about scarless skin repair, and measures time to a defensible research state, factual
errors, missed contradictions, decision changes, and how many errors the researcher
finds in the map itself.

- How to contribute or review: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Pilot protocol: [`docs/researcher-pilot-v0.4.md`](docs/researcher-pilot-v0.4.md)
- Brief for reviewers: [`docs/reviewer-brief-v0.4.md`](docs/reviewer-brief-v0.4.md)
- To challenge a record formally, open a *Scientific review / challenge* issue on GitHub

Review the highest-leverage records first: the claims that set capability rungs, the
binding constraints, contradicting and replicating evidence, the top-ranked questions,
and the experiments attached to them. Turning many records green for appearance would
defeat the purpose.

## What is in the graph

Six record types, plus the earlier cell-grid and delivery-route records projected in:

| type | what it is | count |
|---|---|---|
| **goal** | a repair outcome from the person's side, decomposed with AND/OR requirement groups | 10 |
| **capability** | something humanity must be able to do to a target, graded L0–L5 on demonstrated evidence, with what blocks the next rung and what would move it | 30 hand-authored + 155 from the body grid |
| **question** | an unresolved uncertainty whose answer moves a grade or a dependency; the unit of research prioritisation | 20 |
| **claim** | one statement with context, measurement, evidence and provenance; the unit of knowledge is the claim, not the paper | 24 |
| **experiment** | a candidate or running study that tests a question | 6 |
| **source** | where evidence lives, with a machine `resolution` record kept separate from whether a human has opened it | 34 |
| cell, route | the v0.2 body grid (31 nodes) and the v0.1 CNS delivery routes (16) | 47 |

The build derives every inverse relation (a relation is stored once), rejects dangling
references and dependency cycles, and computes a **structural analysis**: for each goal
the binding constraints (AND-required capabilities at the lowest rung), and open
questions ranked by how much sits downstream of what they block. No probabilities,
costs or dates are invented anywhere.

### Grading vocabulary

- **Rung, L0–L5** — how far it has been shown. L2: works in a mouse. L4: one group showed it in people. L5: a group with no stake in the claim saw the same thing.
- **Measured** — what the evidence changed: a person's function, a biomarker, tissue structure, or nothing yet.
- **Blocked by** — science (nobody knows how yet) or framework (approval, ethics, manufacturing, cost).
- **Review state** — ai-proposed · submitted · in review · reviewed · disputed · superseded. Only a named human can set *reviewed*.

## Use it from a model

```bash
claude mcp add --transport http human-repair-map https://humanrepairmap.com/mcp
```

Tools: `graph_manifest`, `how_to_read`, `get_node`, `list_nodes`, `search`,
`get_subgraph`, `trace_dependency` (a goal's critical path), `find_blockers`,
`rank_research_questions`, `get_primary_evidence`, `find_contradictions`,
`what_would_move_this`, `propose_change` (files a correction into the public
hash-chained log) and `register_prediction` (locks a forecast against the snapshot you
saw, scored later against what happened). Every result carries `structuredContent` and
the review state of what it returned.

### Use it without MCP

- **REST** — [`/api`](https://humanrepairmap.com/api) · [`/api/openapi.json`](https://humanrepairmap.com/api/openapi.json). Every node is a URL: `/api/goals/scarless-skin-repair/critical-path`, `/api/questions/ranked?projection=rejuvenation`, `/api/claims/<slug>/evidence`.
- **Bulk** — [`/graph/graph.json`](https://humanrepairmap.com/graph/graph.json) · `graph.jsonl` · `graph.jsonld` · `manifest.json` (content hash; immutable per hash) · `schema/` (the JSON Schemas every record is validated against).
- **Source** — [`records/`](records/) is the only source of truth; [`schema/`](schema/) and [`ontology/`](ontology/) define it; [`scripts/build.mjs`](scripts/build.mjs) is the only writer of everything generated.

The test applied to every design decision: could a model we have not built yet use this
dataset and this interface substantially better than we can?

## What is still missing

Said plainly so that nobody plugs in expecting more than is there.

- Ingestion is not automated. Every record so far was reasoned by one AI session from abstracts and registry metadata.
- Few negative results are recorded, though the schema treats them as first-class.
- No record has been reviewed by a human. The first human review of one record in one field is the next milestone.
- No researcher has yet said the graph changed what they would read or run next. That is the test for whether it is useful.
- No federation. The formats are chosen so that institutions could run a node beside private data; none does.

## Run it

Open `index.html` in a browser with `content/` and `public/graph/` beside it. No build,
no server, no account. (The site fetches `graph/graph.json`, falling back to
`public/graph/graph.json` when opened from the repository.)

Pushes to `main` deploy to Cloudflare Pages via `.github/workflows/deploy.yml`
(requires the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets).
The worker in [`mcp/`](mcp/) serves `/mcp` and `/api`.

## Writing

Site copy, docs and this README follow the writing rulebook at
[in-c0/writing-skill](https://github.com/in-c0/writing-skill). The review that produced
the current copy is in [`writing-review-2026-09-11.md`](writing-review-2026-09-11.md).

## Design record

[`brief-2026-09-11-map-cure-machine-progress.md`](brief-2026-09-11-map-cure-machine-progress.md)
holds the owner's words verbatim and the thread that reopened the project.
[`vision-core-2026-07-28.md`](vision-core-2026-07-28.md) and
[`design.md`](design.md) are the earlier design records.

## Not a clinical tool

This maps research state, not clinical care. It does not diagnose, recommend treatments,
or give advice about any person's illness. No prognosis, trial-eligibility certainty,
individual genomic interpretation, or a date for universal repair. Identity, consent and
reversibility are requirements on the system being mapped, not an ethics appendix.

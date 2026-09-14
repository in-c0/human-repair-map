# Human Repair Map

What would have to become possible before we could repair almost any biological damage in a person?

A severe wound, an infection, cancer, a failing organ, a damaged spinal cord and biological aging are very different problems. But some of the hard parts repeat. We need to know what changed, know what healthy should look like, reach the right cells, repair or replace what was lost, and check that the result really worked.

Human Repair Map is an attempt to keep score on those pieces of science and make the gaps useful to researchers and AI systems.

Live: [humanrepairmap.com](https://humanrepairmap.com) · MCP: [humanrepairmap.com/mcp](https://humanrepairmap.com/mcp) · API: [humanrepairmap.com/api](https://humanrepairmap.com/api)

> **Prototype (graph v0.3, snapshot 2026-09-14). HUMAN REVIEW: NONE.** As of this snapshot, **0 of 503 records** are human-reviewed. Sources have been located and their metadata machine-checked. Unless a record says `reviewed` with a named human reviewer, treat it as **UNREVIEWED**. Research state only. Not a clinical tool. It does not diagnose, recommend treatments, or give advice about any person's illness.

## What I am trying to work backwards from

The long-term idea is deliberately ambitious: someone is injured, ill, losing function or affected by aging, and we want to restore the healthiest attainable state they choose while preserving identity and agency.

That does not mean the technology exists, or that it is close. The useful question today is smaller: **what can we already do, what is still missing, and which unanswered questions are holding up the most downstream progress?**

The first worked example is **scarless functional repair of adult human skin**. Medicine can already stop bleeding, control infection, close wounds and replace some lost epidermis. We still cannot make a full-thickness adult human wound rebuild normal dermis, hair follicles, microvasculature, fat, matrix and sensation and leave no scar. That gap is concrete enough to test whether the project is useful.

## Human, research and machine layers

The site now separates three jobs that were previously mixed together.

- **Human layer** — starts with the body. What happened? What can medicine do now? Where does repair stop? What question would move it?
- **Research layer** — keeps the exact scientific accounting visible: **rung**, **measured**, **blocked by**, **review state**, dependencies, sources and provenance.
- **Machine layer** — exposes the same canonical structure through MCP, REST and bulk files so a model does not have to scrape the website or guess what a field means.

The two human journeys are:

- **Repair damage** — injuries, infection, cancer, organ failure, neurological damage and related biological damage.
- **Reverse biological aging** — tissue aging, lost regenerative capacity and restoration of younger function.

They share the same underlying evidence where the same science matters to both.

## The research vocabulary

The research layer, API, MCP tools and README use four fields consistently:

- **Rung, L0–L5** — how far a capability has been demonstrated. L0 is an idea; L1 is dish or ex-vivo evidence; L2 is rodent evidence; L3 is large-animal evidence; L4 is human evidence from one group; L5 is independent human replication.
- **Measured** — what changed in the evidence: function, biomarker, tissue structure, access, or another recorded endpoint.
- **Blocked by** — what prevents the next rung. The current graph separates scientific blockers from framework constraints such as approval, ethics, manufacturing or cost.
- **Review state** — `ai-proposed`, `submitted`, `in-review`, `reviewed`, `disputed`, or `superseded`. `ai-proposed` is **UNREVIEWED · HUMAN REVIEW: NONE**. Only a named human can set `reviewed`.

Rung and review state are independent. A capability can have human evidence at L4 while the Human Repair Map record describing that evidence is still unreviewed.

## What is in graph v0.3

| type | what it records | count |
|---|---|---:|
| **goal** | a repair outcome and its AND/OR requirements | 25 |
| **capability** | something repair requires, with rung, measured, blocked by, and review state | 63 hand-authored + 155 from the body grid |
| **question** | an unresolved uncertainty connected to what it blocks | 36 |
| **claim** | one evidence-linked statement with experimental context and provenance | 67 |
| **experiment** | a candidate or running study that tests a question | 18 |
| **source** | the primary location of evidence, with machine resolution kept separate from human review | 92 |
| **cell, route** | the 31-node body grid and 16 CNS-delivery routes retained from earlier versions | 47 |

Six grounds have been worked through: scarless repair of skin, reversal of an established scar, transected peripheral nerve, spinal cord injury, myocardial infarction, and glioblastoma, plus systemic rejuvenation on the other projection. Fracture, sepsis and organ failure are named as planned and are not yet nodes. The list is not a claim that six grounds are enough for universal repair; it is what has actually been worked through.

Relations are stored once and inverse relations are generated. The build rejects dangling references, dependency cycles and unsupported grade structure. For each goal it can identify the current binding constraints and rank open questions by how much downstream structure they block. That ranking does not invent probability, cost or completion dates.

## Why bother connecting the pieces?

The same hard problem can appear in several parts of medicine.

If we cannot deliver a payload to the right cells, that can limit gene therapy, brain repair, tissue regeneration and rejuvenation at the same time. If we learn how to rebuild organised microvasculature, that may matter to wounds, engineered tissues and organ repair. I want those shared dependencies to be visible enough that a researcher or model can challenge them directly.

The claim that this will accelerate research has **not** been demonstrated. v0.4 is meant to test it.

## v0.4: put it in front of researchers

The next question is whether a domain researcher can use this work to reach a defensible view of the evidence and blockers with less search work, without increasing scientific error.

The first pilot uses matched questions about scarless skin repair. We want to know:

- did the researcher find an important paper, contradiction or failure they had missed?
- did we get a rung or dependency wrong?
- did the work save time?
- did it change what they would read, measure, model, collaborate on or test next?

Negative answers matter. If the representation is not useful, it should change before coverage expands.

See [`docs/researcher-pilot-v0.4.md`](docs/researcher-pilot-v0.4.md), [`docs/reviewer-brief-v0.4.md`](docs/reviewer-brief-v0.4.md), and [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Use it from a model

```bash
claude mcp add --transport http human-repair-map https://humanrepairmap.com/mcp
```

Useful tools include `graph_manifest`, `how_to_read`, `get_node`, `list_nodes`, `search`, `get_subgraph`, `trace_dependency`, `find_blockers`, `rank_research_questions`, `get_primary_evidence`, `find_contradictions`, `what_would_move_this`, `propose_change`, and `register_prediction`.

Every result includes structured content plus review state and provenance. `how_to_read` returns the same rung, measured, blocked by, and review state vocabulary used by the research layer.

### Propose a change

`POST /api/proposals` or the MCP tool `propose_change` can file a correction, rung challenge, new evidence or question against a record. A scheduled workflow turns the proposal into a draft pull request carrying its event hash. A named human still decides whether the canonical record changes. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

### Use it without MCP

- **REST** — [`/api`](https://humanrepairmap.com/api) · [`/api/openapi.json`](https://humanrepairmap.com/api/openapi.json). Examples: `/api/goals/scarless-skin-repair/critical-path`, `/api/questions/ranked?projection=rejuvenation`, `/api/claims/<slug>/evidence`.
- **Bulk** — [`/graph/graph.json`](https://humanrepairmap.com/graph/graph.json) · `graph.jsonl` · `graph.jsonld` · `manifest.json` · `schema/`.
- **Live** — [`/graph/activity.json`](https://humanrepairmap.com/graph/activity.json): recent papers and active trials per record (who is working on this). [`/graph/feed.json`](https://humanrepairmap.com/graph/feed.json): what appeared since the last nightly run, and which items were filed as proposals. Both are searches over Europe PMC and ClinicalTrials.gov, regenerated nightly, and are not claims.
- **Canonical source** — [`records/`](records/) contains the records; [`schema/`](schema/) and [`ontology/`](ontology/) define their structure and vocabulary; [`scripts/build.mjs`](scripts/build.mjs) generates the website/API exports.

A more capable future model should be able to inspect the same evidence, dependencies, provenance and history without depending on presentation copy.

## Contributing

Everything on the map is unreviewed, which makes the most useful contribution the smallest one: open one record, read its sources, and say whether they support what it claims.

- [**Start here**](https://github.com/in-c0/human-repair-map/issues/33) — what is needed and how to give it.
- [`review: first read`](https://github.com/in-c0/human-repair-map/labels/review%3A%20first%20read) — one record, one sitting.
- [`grade this node`](https://github.com/in-c0/human-repair-map/labels/grade%20this%20node) — capabilities the map admits it has not graded.
- [`needs replication check`](https://github.com/in-c0/human-repair-map/labels/needs%20replication%20check) — claims resting on a single group.
- [`for a model`](https://github.com/in-c0/human-repair-map/labels/for%20a%20model) — work an agent can do end to end through the API.

Two doors, one queue: `POST /api/proposals` needs no account and becomes a draft pull request within six hours; a GitHub pull request goes to the same place. A named human decides either way, and declined proposals are merged as their own record so the reason stays visible. [CONTRIBUTING.md](CONTRIBUTING.md).

## What is still missing

- **Human review:** 0 of 503 records are human-reviewed in the current snapshot. This is the constraint on everything else.
- **Automated ingestion:** the nightly feed searches Europe PMC and ClinicalTrials.gov per record and files strong hits as proposals; it does not read papers, so relevance is a human's call at review. OpenAlex is not used.
- **Negative and null evidence:** the schema supports it, but little has been entered.
- **Researcher validation:** the v0.4 pilot has not yet established whether the graph improves a real researcher's workflow.
- **Institutional federation:** compatible private nodes are an intended direction; none is running today.

## Run it

Open `index.html` in a browser with `content/` and `public/graph/` beside it. No build step or account is required. The site fetches `graph/graph.json`, with `public/graph/graph.json` as the repository fallback.

Pushes to `main` deploy to Cloudflare Pages via `.github/workflows/deploy.yml` and require the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The worker in [`mcp/`](mcp/) serves `/mcp` and `/api`.

## Writing

Reader-facing copy follows [`in-c0/writing-skill`](https://github.com/in-c0/writing-skill) in rules-first mode. The human layer starts from the body and the reader's question; the exact scientific accounting sits behind it. The September 2026 review is in [`writing-review-2026-09-11.md`](writing-review-2026-09-11.md).

## Design record

[`brief-2026-09-11-map-cure-machine-progress.md`](brief-2026-09-11-map-cure-machine-progress.md) records the discussion that reopened the project. Earlier design records are [`vision-core-2026-07-28.md`](vision-core-2026-07-28.md) and [`design.md`](design.md). The research substrate and human-layer pivot are maintained under `design/`.

## Research use only

Research state only. Not a clinical tool. It does not diagnose, recommend treatments, or give advice about any person's illness. The graph does not provide patient-specific prognosis, trial-eligibility certainty, individual genomic interpretation, or a date for universal repair.

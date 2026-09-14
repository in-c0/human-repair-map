# Contributing to Human Repair Map

Human Repair Map is a public scientific commons. Its purpose is not to accumulate biomedical prose; it is to maintain an auditable graph of what humanity can currently do, what remains blocked, what evidence supports each judgment, and which unresolved questions matter most for repair.

The contribution rule is simple:

> **Humans and AI may propose. Evidence decides. Human review gates scientific acceptance.**

The canonical records live in `records/graph/`. The website, REST API, MCP server and bulk graph exports are generated from those records. Do not edit generated files by hand.

## Two doors, one queue

There are two ways to propose a change, and they end up in the same place.

**Through the site or the API.** Open any record and use *Propose a change*, call
`POST /api/proposals`, or use the MCP tool `propose_change`. No account is needed. The
proposal is written to the public hash-chained event log at once and shown as unreviewed.
A scheduled workflow (`.github/workflows/bridge-proposals.yml`) then opens a draft pull
request for it on branch `proposal/<id>`, adding `proposals/<id>.json` with the proposal,
the record it targets, who filed it, and the event hash. This is the door for a model or an
agent that does not have GitHub access, and for anyone who just wants to say what is wrong.

**Through GitHub.** Fork, edit the record under `records/`, run `node scripts/build.mjs`,
and open a pull request. Add a `proposals/<id>.json` file too (copy the shape of an existing
one; set `provenance.via` to `github-pr`) so the decision leaves the same trail as an API
proposal. Fill in `provenance.proposedBy` honestly: type (`human` or `ai`), name, and for a
model its version and the evidence it accessed. The validator checks the file's shape, not
its honesty; a steward does that.

Either way, the same things happen next: `validate` runs on the branch; a named human
(`.github/CODEOWNERS`) opens the cited sources, decides accept / dispute / decline, fills in
`resolution` in the proposal file, edits the record if accepting, and merges. `main` is
protected: nothing lands on it without a pull request and a green `validate`, and nothing is
force-pushed. A proposal that is declined is still merged, as its file alone, so the reason
stays on the record.

## The smallest useful contribution

If you only want to do one thing: open one record, read the sources it cites, and say whether they support what it says. That is a first read, and every record on the map is waiting for one. It is worth more than a general opinion about the project.

Issues are labelled by what they need:

- [`review: first read`](https://github.com/in-c0/human-repair-map/labels/review%3A%20first%20read) — one record, one sitting, three separate judgments (source fidelity, interpretation, capability implication).
- [`grade this node`](https://github.com/in-c0/human-repair-map/labels/grade%20this%20node) — a capability with no grade at all. The blank is deliberate; filling it needs a rung, what was measured, what blocks the next step, and a source.
- [`needs replication check`](https://github.com/in-c0/human-repair-map/labels/needs%20replication%20check) — claims recorded as resting on a single group. An independent failure to replicate is more valuable than a confirmation.
- [`for a model`](https://github.com/in-c0/human-repair-map/labels/for%20a%20model) — work an agent can finish through the API without a GitHub account.

"I searched for this and found nothing" is a result. A node recorded as searched-and-empty, with the date, is different from a node nobody has looked at, and the map distinguishes them.

## Ways to contribute

### 1. Scientific review

Review an existing claim, capability grade, dependency, question or experiment. This is the highest-priority contribution in v0.4.

A valid review should identify:

- the record ID;
- every primary source you actually opened;
- whether the cited locator supports the attached claim;
- whether the experimental context is represented correctly;
- whether the rung, grounding class, measured endpoint and replication status are justified;
- missing contradictory or replication evidence you know about;
- any dependency or blocker that is overstated, understated or incorrectly modeled.

A reviewer should separate three judgments:

1. **Source fidelity** — does the source say what the record says it says?
2. **Scientific interpretation** — is the inference warranted under the stated experimental context?
3. **Capability implication** — does this evidence justify the capability grade or dependency edge?

Do not collapse these into one yes/no verdict.

### 2. Correction or challenge

Open a Scientific review / challenge issue when a record is wrong, incomplete, misleading or missing important contradictory evidence. Disagreement is not deleted; it becomes visible state.

A challenge should point to the narrowest disputed object possible. Prefer:

- one claim rather than a whole paper;
- one dependency edge rather than a whole goal;
- one grade justification rather than a general objection.

### 3. New evidence

Add a primary source and the smallest set of claims it supports. The unit of knowledge is the claim plus its experimental context, not the publication.

Every new claim must preserve provenance to the exact source and, where possible, figure, table, supplement, trial registration or other locator.

### 4. New unresolved question

Questions are first-class objects because they drive research prioritisation. A useful question must state what uncertainty it resolves and which capability or dependency changes if it is answered.

Good:

> Does EN1-lineage inhibition reduce fibrosis in adult human skin without impairing closure or tensile strength?

Weak:

> How do we cure scars?

### 5. Candidate experiment

Candidate experiments should discriminate between meaningful alternatives. They are proposals, not prescriptions. Do not invent cost, duration, effect size, safety or feasibility numbers.

## Review states

The canonical states are defined in `ontology/review-states.json`.

- `ai-proposed` — proposed by a model/import process; no human source review.
- `submitted` — a named human has proposed or endorsed the record.
- `in-review` — a steward is actively reviewing it.
- `reviewed` — a named human opened every cited source and confirmed support.
- `disputed` — a public unresolved challenge exists.
- `superseded` — replaced while remaining addressable historically.

Only a named human reviewer may set `review.state = "reviewed"`. Automated source resolution, metadata checks, cross-model agreement and citation existence are useful machine checks but **do not count as scientific review**.

## What reviewers must not do

Do not:

- upgrade a record because a source is prestigious;
- infer human efficacy from animal mechanism data;
- treat a biomarker as a functional outcome unless the record says so explicitly;
- count the originating group as an independent replication;
- convert absence of evidence into evidence of absence;
- hide negative or null evidence because it weakens a narrative;
- use Human Repair Map to diagnose, recommend treatment, select therapy or make patient-specific predictions.

## Editing records

1. Edit the canonical file in `records/graph/`.
2. Run:

```bash
node scripts/build.mjs
node mcp/test.mjs
```

3. Commit both the canonical changes and all regenerated outputs.

The build rejects schema violations, dangling references, dependency cycles, unsupported capability grades and `reviewed` records without named human review.

## Reviewer identity and conflicts

Use a stable public identity when performing scientific review. ORCID is preferred when available.

Disclose material conflicts when reviewing a claim involving your own work, employer, funder, licensed technology or commercial interest. A conflicted expert may contribute valuable context, but conflict should remain visible to downstream users and models.

## v0.4 priority

The current proving ground is **scarless functional repair of adult human skin**. The immediate goal is not coverage expansion. It is to determine whether the graph survives expert scrutiny and whether it improves real research work.

Priority review order:

1. claims that determine a capability rung;
2. binding constraints on `scarless-skin-repair`;
3. contradictory / replication edges;
4. top-ranked unresolved questions;
5. candidate experiments attached to those questions.

See `docs/researcher-pilot-v0.4.md` for the first researcher-utility evaluation.

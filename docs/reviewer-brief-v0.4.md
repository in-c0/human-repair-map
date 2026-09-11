# Human Repair Map v0.4 — expert reviewer brief

**We are asking you to try to break the map, not endorse it.**

Human Repair Map is an open, machine-readable dependency and evidence graph for a long-term question:

> What capabilities would be required to diagnose and repair arbitrary human biological damage, and what scientific questions currently block those capabilities?

The first proving ground is deliberately narrow: **scarless, fully functional repair of adult human skin after injury**.

The graph is a prototype. As of 2026-09-11, its current records are AI-proposed / machine-checked and **have not yet been promoted to human-reviewed scientific knowledge**. That is why we are seeking domain experts now.

## What we need from you

You do **not** need to review the whole project.

Choose one capability, claim, dependency or unresolved question inside your expertise and tell us where it is wrong.

The most useful review separates three questions:

1. **Source fidelity** — does the cited primary evidence actually support the claim as written?
2. **Scientific interpretation** — is the inference justified for the organism, tissue, model, endpoint and experimental context?
3. **Capability implication** — does that evidence justify the graph's current maturity rung, blocker or dependency relationship?

Missing contradictory, null or replication evidence is especially valuable.

## Suggested first review packet

These records sit on or near the current scarless-skin critical path:

- `hrm:capability/dermal-architecture-regeneration-without-scar`
- `hrm:capability/fibrogenic-fibroblast-lineage-control`
- `hrm:capability/organised-microvascular-network-in-regenerated-dermis`
- `hrm:capability/hair-follicle-neogenesis-after-wounding`
- `hrm:capability/cutaneous-sensory-reinnervation`
- `hrm:capability/native-ecm-organisation-reconstruction`
- `hrm:question/what-limits-regeneration-in-mus-and-human`
- `hrm:question/en1-inhibition-translates-to-human-skin`
- `hrm:question/organised-microvasculature-in-thick-regenerated-tissue`
- `hrm:question/wound-induced-hair-neogenesis-in-human-skin`

If none are in your expertise, review any related record or tell us the graph is missing the capability that actually matters.

## 10-minute path

1. Open the Human Repair Map / scarless-skin graph.
2. Pick the node closest to your expertise.
3. Inspect its evidence and dependencies.
4. Submit one *Scientific review / challenge* issue identifying the narrowest thing you think is wrong, missing or overstated.

That alone is useful.

## 30–45 minute research-utility pilot

If you are willing to go further, we are testing whether the graph actually improves research work rather than merely visualising it.

We compare HRM with a researcher's normal literature workflow on matched questions and measure:

- time to a defensible research state;
- scientific error;
- important contradictory/null evidence found;
- novel useful information;
- whether the graph changes what the researcher would read, model, measure, collaborate on or test next;
- errors in the graph itself.

The protocol is in [`researcher-pilot-v0.4.md`](researcher-pilot-v0.4.md).

## What this is not

Human Repair Map is not a clinical decision system and does not provide patient-specific diagnosis, prognosis, treatment selection or medical advice.

It is also not asking reviewers to agree with a universal-repair thesis. A conclusion that a dependency is ill-defined, impossible, irrelevant or unsupported is useful evidence if you can explain why.

## Why the project is structured this way

A normal literature database answers *what has been published?*

Human Repair Map is trying to make a different object explicit:

```text
repair goal
    ↓
required capabilities
    ↓
blocking uncertainties
    ↓
claims + primary evidence
    ↓
experiments that could resolve the uncertainty
```

If that representation is scientifically wrong, we want to find out before expanding it across medicine.

## How to review

The easiest route is the repository's **Scientific review / challenge** issue template.

For direct record contributions, see [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

A record may only reach the project's `reviewed` state after a named human has opened its cited sources and verified their support. Automated source resolution and agreement between AI models do not count as human review.

## What success looks like for v0.4

Not more nodes.

Success means we can show at least one credible case where the map:

- reduces search/synthesis effort without increasing scientific error;
- exposes a meaningful missed contradiction, dependency or evidence item; or
- changes a real researcher's next research action for a defensible reason.

If expert reviewers repeatedly reject the same decomposition or evidence semantics, we change the system rather than scaling the mistake.

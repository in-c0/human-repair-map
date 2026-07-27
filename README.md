# Human Repair Map

**A public, AI-assisted map of the capabilities required to repair a human — what
works, what is blocked, what evidence supports each claim, graded openly with its
review state.**

> **Prototype (v0.1).** Records, scores, and counts are illustrative and mostly
> AI-proposed, awaiting human review. This maps *research state*, not clinical
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

## What's in v0.1

A standalone, no-backend prototype (`public/human-repair-map.html`) demonstrating:

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

`public/human-repair-map.html` is a single self-contained file. Open it directly
in a browser — no build, no server, no account.

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

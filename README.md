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

**Live: [humanrepairmap.com](https://humanrepairmap.com)** · **MCP endpoint: [humanrepairmap.com/mcp](https://humanrepairmap.com/mcp)**

## Query it from your AI

The map is exposed over the [Model Context Protocol](https://modelcontextprotocol.io)
— read-only, public, no auth — so any agent can check the evidence state instead
of guessing:

```bash
claude mcp add --transport http human-repair-map https://humanrepairmap.com/mcp
```

Eight tools: `evidence_state`, `how_to_read`, `list_routes`, `get_route`,
`list_capabilities`, `get_capability`, `what_would_move_this`, `search`.
Every response carries the record's review state and grounding class and repeats
the unverified + non-clinical caveats — an API that drops those is a different,
worse product. Source in [`mcp/`](mcp/) (Cloudflare Worker, zero dependencies,
spec 2025-11-25 Streamable HTTP).

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

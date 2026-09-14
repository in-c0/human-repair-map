# Physics-to-Life

**Learning the physical resolution required to predict and repair living systems.**

Physics-to-Life is a computational-science research programme asking one question:

> How much physical detail is actually necessary to predict and control a living system —
> and can a learned model decide, before it knows the answer, where that detail is worth
> computing?

The long-term target is a learned multiscale world model that spans electronic structure
to organismal behaviour *where useful*, queries explicit mechanistic simulation only where
uncertainty, causal relevance or out-of-distribution conditions require it, and can
eventually be inverted to search for repair policies for damaged or aged virtual organisms
(a computational precursor to the [Human Repair Map](../README.md)).

The programme is built to be **falsifiable**. Every hypothesis has a pre-registered
falsification criterion (`docs/hypotheses.md`), and the first milestone is deliberately a
small synthetic system with fully known hidden state, so that both prediction correctness
and *computation-selection* correctness can be scored.

## Status

See [`STATUS.md`](STATUS.md) — always current: objective, latest result, blocker, next
experiment, key risk, most important figure.

## Layout

```
physics-to-life/
├── README.md · STATUS.md · LICENSE · CITATION.cff · pyproject.toml
├── docs/
│   ├── vision.md                 the programme (what, why, what would make it wrong)
│   ├── scientific_questions.md   the questions, ordered by what unlocks what
│   ├── hypotheses.md             H0–H10 registry with falsification criteria (pre-registered)
│   ├── architecture.md           the platform architecture and the V0 realisation of it
│   ├── validation.md             validation ladder V0…V6, comparison conditions, metrics
│   ├── publication_roadmap.md    Paper 0–4 as outputs of validated milestones
│   ├── experiments/              pre-registered experiment specifications
│   ├── literature/               auditable literature map + novelty assessment
│   └── decisions/                architecture decision records
├── src/physics_to_life/
│   ├── state/        system specifications, interventions, structural scaffold utilities
│   ├── models/       fidelity hierarchy, mixed-fidelity simulator, independent reference solver
│   ├── inference/    learned routers (bootstrap ensembles)
│   ├── uncertainty/  calibration metrics
│   ├── routing/      features and refinement policies (all comparison conditions)
│   ├── constraints/  invariant / bound monitoring
│   ├── experiments/  episode generation with hidden-ground-truth labels
│   └── evaluation/   metrics, Pareto frontiers, figures, provenance, hypothesis verdicts
├── experiments/v0_toy/   config.yaml · run.py · results/<run_id>/{figures,tables,summary.json,provenance.json}
├── tests/
├── papers/paper0-perspective · papers/paper1-adaptive-fidelity
└── research-log/         dated entries; what actually happened, including failures
```

## Quick start

```bash
cd physics-to-life
uv venv .venv --python 3.11 && uv pip install --python .venv/bin/python -e ".[dev]"
.venv/bin/python -m pytest -q                      # unit tests (~30 s)
.venv/bin/python experiments/v0_toy/run.py --smoke # 2-minute pipeline check
.venv/bin/python experiments/v0_toy/run.py         # full V0 run (~1-2 h on 4 cores)
```

Every run writes `provenance.json` (git commit, config, seed, package versions, machine,
runtime) next to its tables and figures.

## The V0 experiment in one paragraph

A network of 12 slow variables, each hiding a fast bistable subsystem with a hidden
switching threshold. A cheap quasi-static closure is exact unless an intervention pushes a
node over its fold, after which the fast variable switches and may latch. Which nodes
switch, and whether a switch matters for the readout, depends on the intervention, the
hidden thresholds and the network. Policies must choose which nodes get the 3.3× more
expensive fine physics. Conditions: uniform coarse/medium/fine, random, spatial heuristic,
physics-aware heuristic, adjoint (goal-oriented) heuristic, learned ensemble router
(one-shot and sequential), and an oracle that knows the minimal refinement set. Output:
accuracy/compute Pareto frontiers, calibration, refinement-location maps, OOD families,
ablations — and pre-registered verdicts on H1–H4, H6, H7, H9.

**Result (run `v0_main`, 2026-09-14):** all seven supported under their pre-registered
criteria, with crossing frontiers between the learned router (selectivity) and the
physics-aware rule (coverage) and no contribution from the uncertainty bonus. Full
account: [`experiments/v0_toy/results/v0_main/RESULTS.md`](experiments/v0_toy/results/v0_main/RESULTS.md);
decision to proceed to V1: [`docs/decisions/ADR-0005-proceed-to-v1.md`](docs/decisions/ADR-0005-proceed-to-v1.md).

## Research discipline

For every result we ask whether we measured interpolation or causal prediction, simulator
imitation or transferable structure, genuine uncertainty or confidence-like output, and
whether leakage, circular validation or benchmark gaming could explain it. Negative results
are preserved. See `docs/vision.md` §22–23.

## Review packages

Each milestone ships a review package (objective, methodology, key code paths, figures,
metrics, failure cases, interpretation, open questions, next actions) in `research-log/`
so that an external reviewer — human or model — can audit the project without
conversational memory.

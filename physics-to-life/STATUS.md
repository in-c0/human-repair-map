# STATUS — Physics-to-Life

_Last updated: 2026-09-14 (programme initiation). Full V0 run in progress; this file is
updated when it completes._

## Current objective
Obtain the first trustworthy answer to: **can a learned system determine when additional
physical detail is worth computing?** — on the V0 synthetic slow-fast network with hidden
ground truth, against random, spatial, physics-aware and adjoint heuristics and an oracle.

## Latest result
Pipeline validated end to end (smoke run). Fine simulator matches the independent
reference to ~1e-3; quasi-static closure is exact unless a node switches; switching is
sparse (≈ half the episodes, ~1.2 of 12 nodes). Full run (1200 train / 400 test /
9 OOD families × 150) running.

## What changed
Repository, docs, hypothesis registry (pre-registered criteria), V0 implementation, tests,
four literature scans (see `docs/literature/README.md`).

## Current blocker
None technical. Literature verification is incomplete because the execution environment
cannot reach publisher/DOI hosts: most citations are "citation-only (unconfirmed)" and
need a verification pass from a session with web access.

## Next experiment
V0 full run → results entry in `research-log/` → decision on V1 (synthetic biochemical
system; adds H5 physics compilation and H8 neural closure).

## Key scientific risk
The physics-aware heuristic (which encodes the known closure-failure condition) may not be
dominated by the learned router. That would mean learning adds nothing where the failure
condition is known — a legitimate negative result that redirects the programme to systems
where no such condition is available (the biological rungs).

## Most important figure/result
`experiments/v0_toy/results/v0_main/figures/fig1_pareto_id.png` (accuracy vs compute) —
pending.

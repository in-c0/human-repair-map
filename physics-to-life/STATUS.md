# STATUS — Physics-to-Life

_Last updated: 2026-09-14, after the V0 run `v0_main`._

## Current objective
First trustworthy answer to: **can a learned system determine when additional physical
detail is worth computing?** Obtained at V0 (synthetic slow-fast network, hidden ground
truth). Next: V1 (synthetic biochemical system) with the four additions of ADR-0005.

## Latest result
All seven hypotheses testable at V0 are supported under their pre-registered criteria
(H1–H4, H6, H7, H9), with two substantive caveats. (1) **Crossing frontiers:** the learned
router reaches the 0.01 tolerance at 38 % of uniform-fine cost (physics rule 47 %,
spatial 65 %, random ≥ 91 %, oracle 31 %) and is an order of magnitude more accurate than
any heuristic below 1.6 × the cheap model's cost, but it saturates at 1.35 × the numerical
floor because it confidently misses ~4 % of necessary nodes (intermediate cascade members),
whereas the physics rule reaches the floor at 59 % of fine cost. (2) **Uncertainty did not
carry it:** the ensemble-disagreement bonus changes nothing, and on sustained-step
interventions the router fails with zero disagreement. Calibration is excellent (ECE
0.007), ranking near-perfect (AUROC 0.993), transfer to a different fast-subsystem
formulation, stochastic dynamics and a larger network holds.

## What changed
V0 run, post-hoc τ-grid extension (documented), failure analysis and two remedial
variants, seed check, results document, review package, registry statuses, ADR-0005.

## Current blocker
None technical. Literature citations remain largely unverified (publisher hosts blocked
from this environment) — a verification pass is needed before any manuscript use.

## Next experiment
V1: enzymatic cascade with QSSA closure (graded failure condition); conditions add a
hybrid router, a value-regression label, two OOD detectors beyond spread, compiled
surrogate with OOD gating (H5), learned closure (H8), ODE-vs-SSA cross-simulator test.
Background: V0 variants at cost ratio 13 and with the coarse default.

## Key scientific risk
Where the closure-failure condition is known, a written rule provides coverage that
learning does not; the programme's claim must be about selectivity *and* about systems
where no rule is available. If the hybrid does not dominate both parents at V1, "learned
routing" is demoted to "learned ranking inside a physics-derived candidate set".

## Most important figure/result
`experiments/v0_toy/results/v0_main/figures/fig1_pareto_id.png` (frontier) and §6 of
`experiments/v0_toy/results/v0_main/RESULTS.md` (the confident misses).

# ADR-0003 — Nominal compute cost = node-steps weighted by fidelity, validated by accuracy

Date: 2026-09-14 · Status: accepted

## Context
Wall-clock in pure Python is dominated by interpreter overhead and does not reflect the
physics; but an arbitrary cost model can be tuned to flatter adaptivity.

## Decision
Cost per node per slow step: coarse 1, medium 3 (warm-started Newton solve, 2–3
iterations), fine n_sub = 10 (the number of RK4 sub-steps required for the sub-cycled fine
integrator to match the independent Radau reference: 5 sub-steps fail, 10 and 20 match to
~1e-3). The fine cost is thus set by an accuracy requirement, not chosen. Wall-clock is
reported alongside and includes controller overhead.

## Consequences
- Fine/medium cost ratio = 10/3 ≈ 3.3; fine/coarse = 10.
- Sequential controllers pay for every intermediate simulation; adjoint heuristics are
  charged two base simulations (an adjoint solve), not the finite-difference shortcut used
  to implement them.

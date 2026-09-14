# ADR-0002 — V0 uses a slow-fast network with hidden bistable subsystems

Date: 2026-09-14 · Status: accepted

## Context
V0 must be analytically tractable, have an expensive fine model and a cheap coarse model,
have regime-dependent closure error that appears only under some interventions, have
regions where fine simulation is unnecessary, and make failures interpretable.

## Alternatives considered
- Linear slow-fast (QSSA exact up to O(ε)): closure error would be uniform, not
  intervention-specific. Rejected.
- Multi-compartment mass-action network with QSSA (Michaelis–Menten) closure: good, but
  the closure-failure condition is smoother and less crisp for a first debugging system;
  kept for V1.
- Spatial PDE with adaptive mesh: conflates spatial and causal refinement — the very
  distinction V0 is meant to expose. Rejected for V0.

## Decision
Each node carries a hidden fast variable with a fold bifurcation and hysteresis. The
cheap closure fails exactly when an intervention pushes the node over its fold; whether
that matters depends on causal position relative to the readout. Thresholds are hidden
and observed with noise so routing is genuinely probabilistic.

## Consequences
- Closure failure is analytically known, which favours the physics-aware heuristic; this
  is accepted as the honest bar for the learner at V0.
- The maximum adaptive saving is bounded by the fine/medium cost ratio (10/3).

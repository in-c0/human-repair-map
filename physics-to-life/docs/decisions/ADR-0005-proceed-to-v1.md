# ADR-0005 — Proceed from V0 to V1, with four required additions

Date: 2026-09-14 · Status: accepted; **amended by ADR-0006** (V1 is now the Drosophila ion-channel → membrane bridge; the synthetic biochemical system becomes supporting benchmark V1a)

## Context
V0 (`experiments/v0_toy/results/v0_main/RESULTS.md`) supports H1–H4, H6, H7 and H9 under
their pre-registered criteria, but with crossing frontiers (learned router: selectivity;
physics rule: coverage), no contribution from the uncertainty bonus, a confident OOD
failure on sustained-step interventions, and confident misses of intermediate cascade
members traceable to tolerance-defined hard labels.

## Decision
The machinery is validated and failures are interpretable, so the programme graduates to
V1. *Original text:* V1 = small synthetic biochemical system. *Amended (ADR-0006):* V1 =
Drosophila ion-channel → membrane bridge; the biochemical system is supporting benchmark
V1a (`docs/experiments/v1a_biochemical_supporting_benchmark.md`). V1 must add, as
pre-registered conditions:
1. a **hybrid router** (physics-derived candidate set, learned ranking within it);
2. a **value-regression label** (expected error reduction per node) alongside the hard
   necessity label;
3. at least two **OOD detectors beyond ensemble spread** (feature-range guard; conformal
   set size or a density estimate), scored on planted shifts including a sustained-input
   family;
4. **per-family re-validation of the fine simulator's numerical floor** before any oracle
   comparison;
5. *(amendment after `v0_base0`)* a **pre-registered sparsity check of the cheap model's
   error** — the fraction of the coarse-model error attributable to the causally relevant
   subset — because adaptivity failed completely when the cheap model was uniformly
   biased (constant closure): no router, not even the oracle, could reach the tolerance
   below uniform fine cost. Adaptivity is conditional on sparse, causally concentrated
   closure error, and V1 must measure that property before claiming anything.

## Consequences
- H5 (physics compilation) and H8 (neural closure) become testable at V1.
- The V0 robustness variants (`config_ratio13.yaml`, `config_base0.yaml`) are run as
  background checks, not gates.
- Paper 1's framing changes from "learned vs heuristic" to "selectivity vs coverage and
  when a learned router should defer to a known rule".

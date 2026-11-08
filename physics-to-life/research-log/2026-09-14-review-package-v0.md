# Review package — milestone V0 (adaptive fidelity on a synthetic slow-fast network)

For an external reviewer with no conversational memory. Everything cited is in the repo.

## 1. Objective
Test, on a system with fully known hidden state, whether a learned controller can decide
*where* fine physics is needed to predict an intervention while spending less compute
than uniform high fidelity, and score both its predictions and its computation choices.
Pre-registered criteria: `docs/hypotheses.md` (H1–H4, H6, H7, H9); specification:
`docs/experiments/v0_adaptive_fidelity_spec.md`.

## 2. Methodology
- System: 12-node slow network, each node with a hidden bistable fast variable (fold +
  hysteresis), thresholds hidden and observed with σ = 0.3 noise. Fidelity levels per
  node: constant closure (1), quasi-static closure (3), full fast ODE with 10 sub-steps
  (10). Ground truth: independent Radau integration (rtol 1e-8). Fine sub-cycled vs
  reference: 1.05e-3 mean error in-distribution.
- Interventions: pulses into one node (amplitude 0.5–3, duration 0.5–2). Target: mean of
  the readout node over the horizon (pure intervention effect; baseline is exactly zero).
- Labels: minimal refinement set (cheapest subset of switchers upstream of the readout
  whose mixed simulation matches the reference within 0.01), exhaustive search.
- Conditions: uniform coarse/medium/fine; random; random among readout ancestors;
  spatial heuristic; physics-aware heuristic (P(switch) × relevance), one-shot and
  sequential; adjoint/goal-oriented heuristic (charged an adjoint solve); learned
  bootstrap-MLP-ensemble router, one-shot and sequential; oracle and oracle-flips.
- Metrics: mean |Ŷ − Y*| with bootstrap CIs vs total nominal compute (and wall-clock);
  precision/recall/F1/waste/miss vs the minimal set; ECE; AUROC; paired-bootstrap frontier
  differences at five budgets; OOD families; ablations; three training seeds.
- Sizes: 1200 / 400 / 9 × 150 episodes. Runtime 89 min (4 cores) + ≈ 20 min post-hoc.

## 3. Key code paths
`src/physics_to_life/state/system.py` (system, closures, scaffold utilities) ·
`models/simulators.py` (mixed-fidelity integrator, reference, cost accounting) ·
`routing/features.py`, `routing/policies.py` (all conditions) · `inference/ensemble.py` ·
`experiments/v0_toy.py` (labels, condition runs) · `evaluation/analysis.py` (verdicts) ·
`experiments/v0_toy/run.py`, `extend_sweep.py`, `extra_variant.py`, `seed_check.py` ·
`scripts/failure_analysis.py`.

## 4. Figures (`experiments/v0_toy/results/v0_main/figures/`)
- fig0 example trajectories — the closure is exact until a node switches.
- fig1 accuracy vs compute — the frontier; fig1b wall-clock version.
- fig2 calibration and ensemble disagreement in/out of distribution.
- fig3 refinement-location maps — three episodes: cascade, single necessary node,
  switching irrelevant to the readout.
- fig4 OOD families at a matched budget.
- fig5 ablations. fig6 minimal-set sizes (H4). fig7 paired-bootstrap frontier
  differences (H9). fig8 selection correctness (miss and waste vs cost).

## 5. Metrics
`tables/pareto_id.csv`, `tables/pareto_ood_*.csv`, `tables/frontier_summary_id.csv`,
`tables/ablations_id.csv`, `tables/seed_check*.csv`, `summary.json` (verdicts).
Headline numbers in `RESULTS.md` §2–§3.

## 6. Failure cases
- Confident misses of intermediate cascade members (4/109 necessary nodes; p < 1e-4;
  no disagreement) — `RESULTS.md` §6.
- Confident OOD failure on sustained-step interventions (error = medium model's; zero
  disagreement) — §7.
- Oracle exploits numerical noise when the fine floor is high (amp_high, multi2) — §7.
- Non-monotone episodes (18.75 %) make hard necessity labels noisy.
- Bugs found and fixed before the run: lower-branch root solver converging to the wrong
  branch; fork-after-BLAS pool deadlock; kwargs dropped in the multiprocessing generator.

## 7. Interpretation
All seven testable hypotheses are supported under their pre-registered criteria, but the
substantive finding is the crossing frontier: the learned router buys selectivity (low
waste, order-of-magnitude gains at low budgets) while the physics rule buys coverage
(recall 1.0 at higher budgets). H9 is supported only under the registered
"max over one-shot and sequential" rule; the one-shot-only reading gives 1 of 5 budgets.
The uncertainty bonus does nothing; ensemble spread is not an OOD detector here.

## 8. Threats to validity
Known failure condition favours the rule; cost ratio 3.3 bounds savings; post-hoc τ-grid
extension (documented, symmetric, verdict-invariant); single system family and readout
definition; one world seed; oracle noise exploitation; label noise in non-monotone episodes.

## 9. Open questions
1. Does a hybrid (rule-derived candidates, learned ranking) dominate both parents?
2. Does a value-regression label remove the confident misses?
3. Which OOD signal detects the `step`-type failure (feature-range guard, conformal set
   size, density estimate)?
4. How do the verdicts change at fine/medium ratio 13 (`config_ratio13.yaml`) and with a
   coarse (constant-closure) default (`config_base0.yaml`)?
5. What happens when the closure-failure condition is graded rather than a fold (V1)?

## 10. Next proposed actions
Proceed to V1 (ADR-0005): synthetic biochemical cascade with QSSA closure, the hybrid
router, value labels, compiled-surrogate + OOD-detection conditions (H5), learned closure
(H8), cross-simulator (ODE vs SSA). Run the two V0 variant configs as robustness checks.
Decision requested from the owner: none required to proceed; flag if the V1 system choice
should differ from ADR-0002's V1 sketch.

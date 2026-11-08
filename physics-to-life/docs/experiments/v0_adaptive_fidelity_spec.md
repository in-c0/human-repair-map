# V0 experiment specification — adaptive fidelity on a slow-fast network (pre-registered)

Written 2026-09-14 before results. Run id: `v0_main` (`experiments/v0_toy/config.yaml`).

## Question

Can a learned controller determine *where* higher physical resolution is necessary to
predict an intervention, while spending less compute than fixed high-resolution
simulation — and can it do so before seeing the answer?

## System

A network of K = 12 slow variables x_k (the "coarse" level) each coupled to a hidden fast
bistable variable y_k (the "fine" level):

    dx_k/dt = −a x_k + Σ_j W_kj tanh(x_j) + c (y_k − y0_k)/2 + u_k(t)
    ε dy_k/dt = y_k − y_k³ + β (x_k − θ_k)                      ε = 0.01

The fast subsystem has a fold at x_k = θ_k + 2/(3√3): below it y_k tracks the lower branch
quasi-statically; above it y_k jumps to the upper branch (Δy ≈ 2) and may *latch*
(hysteresis) if the node's on-state is self-sustaining. The thresholds θ_k are hidden; the
controller sees θ̂_k = θ_k + N(0, 0.3²).

Fidelity hierarchy (per node, nominal cost per node-step):

| level | closure | cost |
|---|---|---|
| 0 coarse | y_k ≡ y0_k (fast subsystem invisible) | 1 |
| 1 medium | y_k = y_low(x_k), quasi-static lower branch, clamped at the fold | 3 |
| 2 fine | fast ODE integrated with 10 RK4 sub-steps per slow step | 10 |

Ground truth: the full fine model integrated with scipy Radau (rtol 1e-8), an independent
implementation. Fine sub-cycled RK4 vs Radau: mean |ΔY| ≈ 7e-4, max ≈ 4e-3 over 30
episodes (research-log 2026-09-14). That gap is the numerical floor.

Intervention: a current pulse of amplitude A ~ U(0.5, 3) and duration τ ~ U(0.5, 2) into
one random node starting at t = 0.5, horizon T = 8.
Target observable: intervention effect on the readout node, Y = (1/T) ∫ x_r dt (the
baseline is exactly zero at every fidelity, so Y is the pure intervention effect).
Readout r is a node with ≥ 3 ancestors so causal routing is non-trivial.

## Why this system

- Closure error is *regime-dependent*: zero unless an intervention pushes some node over
  its fold; which nodes that is depends on the intervention, the hidden thresholds and the
  network (cascades: a switched node can push its children over their folds).
- Importance is *causal, not spatial*: a switched node matters only if it is upstream of
  the readout; switched nodes downstream of r are irrelevant and refining them is waste.
- Hidden state is *fully known* to the evaluator, so both prediction correctness and
  computation-selection correctness can be scored.
- Failure is interpretable: every mistake can be traced to a specific node and threshold.

## Labels from hidden ground truth

For each episode, the *minimal refinement set* is the cheapest subset S of candidate nodes
(true switchers upstream of r) such that the mixed simulation (fine on S, medium elsewhere)
matches the reference within tol_ref = 0.01, found by exhaustive subset search (≤ 5
candidates) or greedy forward selection. `necessary_k` = k ∈ S.

## Conditions

| code | policy | sweep |
|---|---|---|
| A | uniform coarse | — |
| B | uniform medium | — |
| C | uniform fine | — |
| D | random refinement (also: random among ancestors of r) | m = 0..K |
| E1 | spatial heuristic: nodes nearest the intervention | m = 0..K |
| E2 | physics heuristic: Φ((max_t x̂_k − θ̂_k − fold)/σ_θ) × 1[k upstream of r] | τ |
| E2s | E2 applied sequentially (re-simulate, re-score) | τ |
| E3 | adjoint/goal-oriented: P(switch) × |∂Y/∂y_k| × 2, charged 2 base sims | τ |
| F | learned: bootstrap MLP ensemble on 24 per-node features, score = p̄ + κ·std, one-shot | τ |
| Fs | learned, sequential | τ |
| O | oracle: minimal set given ground truth | tol |
| O' | oracle-flips: all true switchers upstream of r | — |

Every adaptive policy is charged its base (medium) simulation and every intermediate
simulation. The learner is trained on 1200 in-distribution episodes (per-node rows from
the base state, from states along the oracle refinement path, and from one random partial
state), label = `necessary`.

## Outputs

1. Accuracy/compute Pareto plot (mean |Y − Y*| vs mean nominal cost, bootstrap CIs; also
   wall-clock).
2. Calibration plot (reliability diagram + ECE of the learned probability; ensemble
   disagreement in- vs out-of-distribution).
3. Refinement-location visualisation (network drawings: truth vs learned vs heuristic).
4. OOD intervention benchmark (families: higher amplitude, two-node, sustained step,
   negative pulse, K = 20, sigmoidal fast subsystem with ε = 0.03, stochastic fast
   subsystem, σ_θ = 0 and 0.6 information levels).
   *Post-run correction:* the sigmoidal family's folds are at ±0.127 (not ±0.385 as
   intended), so its quasi-static closure captures switch-on and only hysteresis needs
   fine physics; it is a weak cross-formulation test (14 necessary nodes in 150 episodes).
5. Ablations (no uncertainty bonus, no graph features, no trajectory features,
   intervention-only, GBM instead of MLP, switch label instead of necessity label,
   100/300 training episodes, no partial-state training rows).

## Pre-registered decision rules

See `docs/hypotheses.md` for the exact H1/H3/H4/H6/H7/H9 criteria. The decisive
comparison for H9 is learned vs the physics heuristic E2/E2s, *not* learned vs random.

## Known limitations declared in advance

- Fine/medium cost ratio is 10/3; absolute savings are bounded by it.
- The closure-failure condition is analytically known here, which favours E2. This is
  intentional: V0 asks whether learning can match a rule that a modeller could write down;
  the biological rungs ask what happens when no such rule is available.
- One seed for the main run; seed sensitivity is checked with 3 training seeds on the
  learned policy only (cheaper than regenerating the world).

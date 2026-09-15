# Hypothesis registry

Status vocabulary: `untested` · `Vn-passed` (passed the preregistered criteria at rung n, within that rung's model family) · `Vn-falsified` · `Vn-inconclusive`. "Supported" without a rung qualifier is never used.
A hypothesis is only ever supported *at a rung of the validation ladder* (see `validation.md`).
Nothing here is assumed true. Every entry states what result would count against it.

Pre-registration note: the V0 falsification criteria below were written on 2026-09-14
**before** the V0 results existed (commit history is the audit trail). Criteria may be
tightened for later rungs but not loosened after seeing data without a logged decision
record in `decisions/`.

---

## H0 (primary) — Adaptive physical computation

**Claim.** For a target biological observable and error tolerance there exists an adaptive
mixture of learned and mechanistic models that is substantially cheaper than uniform
high-fidelity simulation while preserving intervention-relevant predictive accuracy, *and*
a learned system can find that mixture without seeing the answer.

H0 is the conjunction of H1 (a cheap adaptive mixture exists) and H3/H9 (it can be found
before the answer is known). H1 can be true while H3/H9 are false: that would mean
adaptivity is possible in principle but not discoverable by learning, which is a
meaningful negative result.

---

## H1 — Adaptive efficiency

**Claim.** Adaptive fidelity reaches approximately the predictive accuracy of the best
tractable high-fidelity reference at substantially lower computational cost.

- **Measurable outcome.** Mean absolute error of the intervention-effect prediction versus
  hidden ground truth, as a function of total nominal compute (node-steps weighted by
  fidelity; wall-clock reported alongside).
- **Baselines.** Uniform coarse (A), uniform medium (B), uniform fine (C).
- **V0 support criterion.** Some adaptive policy (heuristic *or* learned, one-shot or
  sequential) achieves mean error ≤ 1.5 × the uniform-fine error at ≤ 50 % of the
  uniform-fine cost, on the in-distribution test set, with bootstrap 95 % CI excluding
  the uniform-fine cost. (The fine error is the numerical floor of the fine simulator
  against the reference; "1.5 ×" of a ~1e-3 floor is a strict bar.)
- **V0 falsification criterion.** No adaptive policy, including the *oracle* that knows the
  minimal refinement set, reaches ≤ 1.5 × fine error below 50 % of fine cost. If even the
  oracle fails, adaptivity cannot help in this system family and the family must be
  re-examined before any learned claim is made.
- **Confounders.** The fidelity cost ratio (fine/medium = 10/3 in V0) bounds the maximum
  saving; results must be reported in terms of that ratio. Base-simulation cost is charged
  to every adaptive policy. Interventions that never require refinement inflate apparent
  savings: the fraction of such episodes is reported.

## H2 — Causal fidelity

**Claim.** Increasing physical fidelity improves prediction of held-out *interventions*, not
merely interpolation of baseline trajectories.

- **Measurable outcome.** Error of coarse vs fine on intervention effects (the V0 target is
  the intervention effect itself; baseline is an exact fixed point of every fidelity level
  by construction, so any error is intervention-induced).
- **V0 support criterion.** Uniform-medium error on the intervention effect is > 10 × the
  fine numerical floor in episodes where any node switches, and ≤ 2 × the floor in episodes
  where none does.
- **V0 falsification criterion.** Fine and medium errors are statistically
  indistinguishable on held-out interventions, i.e. the extra physics carries no
  intervention-relevant information in this family.
- **Confounders.** Target choice (AUC vs final value); reported for both.

## H3 — Error-aware routing

**Claim.** The system can identify which subsystem or scale requires refinement *before*
observing the ground-truth answer.

- **Measurable outcome.** Selection precision/recall/F1 of the refined set against the
  minimal refinement set computed from hidden ground truth; area under ROC of the learned
  per-node score for predicting membership in that set.
- **Baselines.** Random refinement (D), random restricted to the readout's ancestors,
  spatial-proximity heuristic (E1), physics-aware heuristic P(switch)×relevance (E2),
  adjoint/goal-oriented heuristic (E3).
- **V0 support criterion.** Learned score AUROC ≥ 0.85 on the in-distribution test set and
  F1 at the operating point that matches the oracle's mean cost ≥ 0.6; ECE of the routing
  probability ≤ 0.1.
- **V0 falsification criterion.** AUROC ≤ 0.7 or F1 ≤ that of the physics heuristic at
  matched cost. Note that E2 encodes the known failure condition of the closure; a learned
  router that cannot beat it in-distribution has learned nothing beyond a rule a modeller
  could write down.
- **Confounders.** Label noise from non-monotone cases (refining a node that matters
  *increases* error because two errors cancelled); frequency reported.

## H4 — Sparse physical importance

**Claim.** For many predictions only a small subset of the system needs fine treatment at
any moment.

- **Measurable outcome.** Distribution of the minimal refinement set size.
- **V0 support criterion.** Median minimal set size ≤ 2 of 12 nodes and ≥ 40 % of episodes
  need no refinement at all at tol = 0.01.
- **V0 falsification criterion.** Median minimal set ≥ K/2.
- **Confounders.** This is partly a property of the generator (intervention amplitude
  distribution). It is reported for OOD families (multi-node, sustained step, K = 20) to
  show how sparsity degrades.

## H5 — Physics compilation

**Claim.** Repeated fine-scale calculations can be compressed into reusable effective models
without destroying intervention accuracy.

- **Status.** `untested` at V0. The V0 medium closure *is* a hand-derived compiled model of
  the fast subsystem (quasi-static branch). The learned-compilation version (fit a surrogate
  of the fast subsystem's effect from fine runs, use it in place of fine calls, detect OOD)
  is scheduled for V1.
- **Planned falsification.** A compiled surrogate that matches fine accuracy in-distribution
  but fails on held-out interventions *without* flagging them as OOD falsifies the
  "safely reusable" part of the claim.

## H6 — Cross-model generalisation

**Claim.** Learned abstractions survive changes in the underlying simulator, solver,
timestep, stochastic seed or model formulation.

- **Measurable outcome.** Routing quality (AUROC, F1, accuracy/cost frontier) of the router
  trained on family `id` (cubic fast subsystem, deterministic, ε = 0.01) when evaluated on
  `sigmoid` (different fast-subsystem functional form with the same fold thresholds,
  ε = 0.03) and `noisy` (stochastic fast subsystem).
- **V0 support criterion.** AUROC on `sigmoid` and `noisy` ≥ 0.8 and frontier still
  dominates random refinement.
- **V0 falsification criterion.** AUROC on `sigmoid` ≤ 0.7: the router learned the cubic's
  transient signature rather than the transferable switching structure.
- **Confounders.** The coarse closure is shared across families, so features derived from
  it are trivially transferable; the test is whether the *decision* transfers.

## H7 — Hidden-state inference

**Claim.** A probabilistic model can infer useful distributions over unobserved fine-scale
states from coarse observations.

- **Status.** `partially tested` at V0 through the routing probability: the router infers
  P(node k's hidden fast variable switches) from coarse trajectory + noisy threshold
  observations. Calibration of that probability is the V0 measurement. Full hidden-state
  posterior inference is scheduled for V1/V3 (SBI on mechanistic parameters).
- **V0 support criterion.** ECE ≤ 0.1 and reliability curve monotone.
- **V0 falsification criterion.** ECE ≥ 0.2 in-distribution.

## H8 — Neural closure

**Claim.** Learned correction terms represent unresolved multiscale influence better than
hand-designed coarse models alone.

- **Status.** `untested` at V0. V0 uses hand-derived closures deliberately so that closure
  failure is analytically known. A learned closure (neural residual on the medium model)
  is a V1 condition.

## H9 — Value of computation

**Claim.** A learned controller allocates computational effort more effectively than fixed,
random or heuristic refinement.

- **Measurable outcome.** Dominance of the learned accuracy/cost frontier over every
  heuristic frontier at matched cost (paired bootstrap over episodes).
- **Baselines.** D, E1, E2, E3, and the oracle upper bound.
- **V0 support criterion.** Learned (one-shot or sequential) has lower mean error than the
  best heuristic at ≥ 3 of 5 matched cost budgets spanning the range between uniform-medium
  and uniform-fine cost, with the paired-bootstrap 95 % CI of the difference excluding zero.
- **V0 falsification criterion.** The physics heuristic E2 (or adjoint E3) is not dominated
  at any budget. That outcome means: in a system whose closure-failure condition is known,
  learning adds nothing over writing the condition down. It would redirect the programme
  toward systems where the failure condition is *not* known analytically (the biological
  rungs), and would demote "learned" to "learned-or-derived" in the framing.
- **Confounders.** Uncertainty bonus κ (ablated); training-set size (ablated); the
  heuristics receive the same noisy threshold information as the learner.

## H10 — Inverse biological design

**Claim.** Once the forward model is sufficiently predictive it can discover intervention
policies that move a damaged or aged virtual system toward a target healthy state.

- **Status.** `untested`. Requires a virtual system with a defined health manifold
  (Level 0 "restore equilibrium" task is the first target; see `vision.md` §14).
  Not scheduled before V1 is reliable.

---

## Registry table

**How to read V0 statuses (owner review, 2026-09-14).** "V0-passed" means *passed the
preregistered V0 criteria within one synthetic model family, under sparse, causally
concentrated closure error*. It does not mean the hypothesis is established. The
constant-closure run (`v0_base0`) showed that adaptive fidelity has no value when the
cheap model's error is uniformly distributed; every V0 support statement is conditional
on that structure, and the 79 % "no refinement needed" figure is a property of the
episode generator, not of biology.


| ID | Short name | Status (2026-09-15; runs v0_main, v1_gunay_main) | First rung tested | Owner doc |
|----|------------|----------------------------------|-------------------|-----------|
| H0 | adaptive physical computation | V0-passed, conditional (H1 ∧ H3/H9 within the synthetic family; falsified when cheap-model error is not sparse) | V0 | this file |
| H1 | adaptive efficiency | **V1-falsified** (`v1_gunay_main`, `verdicts.md`, `fig1_pareto_pooled_id`): the learned VoC router at the 30 % point (err/tol 0.82) loses to the ensemble-uncertainty triggers (0.17 at 40 %; 0.42 at 32 % under the fixed-compute reading), parity with the V0-style classifier at 50 %; research log 2026-09-15 §2. V0-passed with the quasi-static cheap model (oracle 1.0× fine error at 32 % cost; learned 1.46× at 45 %, point estimate; at cost ratio 13: learned 16 %, oracle 10 %) — **V0-falsified with the constant-closure cheap model** (`v0_base0`: tolerance unreachable for any switcher subset in 78 % of episodes; only uniform refinement reaches the floor). Adaptivity requires sparse cheap-model error. | V0 | `experiments/v0_toy/results/v0_main/RESULTS.md` §10 |
| H2 | causal fidelity | V0-passed (0.091 vs 0.0009 medium error with/without switching) | V0 | same |
| H3 | error-aware routing | **V1-inconclusive** (`v1_gunay_main`): selection precision at equal recall 2.6× / 2.2× the written rules (clause holds) but the predicted frontier crossing did not occur — the router dominates the written rules at every budget; research log 2026-09-15 §3. V0-passed (AUROC 0.993, F1 0.66 at oracle cost, ECE 0.007) | V0, V1 | same; `results/v1_gunay_main/verdicts.md` |
| H4 | sparse importance | V0-passed (median 0, 79 % of episodes need no fine physics — a property of the generator, not evidence about biology; falsified for the constant-closure cheap model) | V0 | same |
| H5 | physics compilation | untested | V1 | this file |
| H6 | cross-model generalisation | V0-passed, weak (noise, size and information level: proper tests; the sigmoid formulation test is weak — its folds are at ±0.127 so the closure already tracks switch-on; fails on sustained-step shift) | V0 (partial) | same |
| H7 | hidden-state inference | V0-passed (partial: routing probability ECE 0.007) | V0 (partial) | same |
| H8 | neural closure | untested | V1 | this file |
| H9 | value of computation | V0-passed only under the registered "one-shot or sequential" rule (3 of 5 budgets vs physics via the sequential pair; 4 of 5 vs adjoint; 4 of 5 at cost ratio 13); crossing frontiers — physics rule better at high budgets. Not supported with the constant-closure cheap model (no policy differs when the cheap model's error is not sparse). | V0 | same |
| H10 | inverse design | untested | ≥ V1 | this file |

Statuses are updated only by a logged research-log entry that cites the run id and figure.

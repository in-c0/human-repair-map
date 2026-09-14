# V0 results — adaptive fidelity on the slow-fast network (run `v0_main`, 2026-09-14)

Pre-registered specification: `docs/experiments/v0_adaptive_fidelity_spec.md`.
Hypothesis criteria: `docs/hypotheses.md`. Provenance: `provenance.json` (git commit,
config, seed, versions, machine). Tables: `tables/`. Figures: `figures/`.

Sizes: 1200 training episodes, 400 in-distribution test episodes, 9 OOD families × 150.
Tolerance defining the minimal refinement set: 0.01 (absolute, on the intervention
effect Y = (1/T)∫x_r dt). Fine/medium/coarse nominal cost per node-step = 10/3/1.
Main run 89 min on 4 cores; post-hoc grid extension and extra variants ≈ 20 min more.

## 1. Headline

**A cheap adaptive mixture exists and a learned router finds most of it.** The oracle
that knows the minimal refinement set matches uniform-fine accuracy at 33 % of its cost.
The learned router (bootstrap MLP ensemble on 24 per-node features, one-shot) reaches the
0.01 tolerance at 38 % of fine cost, the physics-aware heuristic at 47 %, the spatial
heuristic at 65 %, structured random at 91 %, uniform random never below uniform fine.
The learned router's probabilities are calibrated (ECE 0.007) and rank necessary nodes
almost perfectly (AUROC 0.993).

**But the frontiers cross.** Below ≈ 1.6 × the medium cost the learned router is an order
of magnitude more accurate than any heuristic; above ≈ 2 × the medium cost the physics
heuristic reaches the numerical floor (1.05e-3) while the learned router saturates at
1.4e-3 because it *confidently* misses ~4 % of necessary nodes. Those misses are
intermediate members of multi-node cascades, a pattern that is rare in training (91 % of
necessary nodes are the intervened node or the readout) and whose individual contribution
to the target is below the labelling tolerance.

**Uncertainty did not carry the result.** The ensemble-disagreement bonus (κ) changes
nothing in-distribution, and on sustained-step interventions (far outside the training
duration range) the router fails with *zero* disagreement: a confident OOD failure that
ensemble spread does not flag. The physics heuristic handles that family without trouble.

## 2. Pre-registered verdicts

| H | criterion (V0) | outcome | verdict |
|---|---|---|---|
| H1 adaptive efficiency | some adaptive policy: err ≤ 1.5 × fine at ≤ 50 % fine cost | oracle: 1.0 × at 32 %; learned one-shot: 1.46 × at 45 % (CI on the ratio 1.15–1.9, overlapping the threshold); physics heuristic does not meet it (needs 59 % for the floor) | **supported** (oracle clearly; learned at the point estimate only) |
| H2 causal fidelity | medium error > 10 × floor when a node switches, ≤ 2 × floor when none does | 0.091 vs 0.00094 (floor 0.00105); 49 % of episodes switch | **supported** |
| H3 error-aware routing | AUROC ≥ 0.85, F1 at oracle cost ≥ 0.6, ECE ≤ 0.1 | AUROC 0.993, F1 0.66, ECE 0.007 (physics: 0.959 / 0.33 / 0.088) | **supported** |
| H4 sparse importance | median minimal set ≤ 2 of 12; ≥ 40 % need none | median 0, mean 0.27, 79 % need none | **supported** |
| H6 cross-model generalisation | AUROC ≥ 0.8 on `sigmoid` and `noisy`; dominates random | 0.997 and 0.992; learned 0.0015 vs random 0.0028 (sigmoid), 0.0051 vs 0.041 (noisy) at 2 × medium budget | **supported** |
| H7 hidden-state inference (partial) | ECE ≤ 0.1 | 0.007 | **supported** |
| H9 value of computation | learned beats the best heuristic at ≥ 3 of 5 budgets, paired-bootstrap CI excluding 0, for both heuristic families | vs physics: 3 of 5 (sequential pair: budgets 1.5, 2, 2.5 × medium); one-shot pair only at 1.5 ×; physics one-shot significantly *better* at 2–3 × medium by 0.0004 (CI 0.0001–0.0007). vs adjoint: 4 of 5 | **supported under the registered rule; crossing frontiers** — see §4 |

H5, H8, H10: untested at V0 (as planned).

## 3. Accuracy vs compute (Fig. 1, `tables/pareto_id.csv`)

Mean |Ŷ − Y*| over 400 test episodes, 95 % bootstrap CI; cost = total nominal compute
including base simulations and every intermediate run.

| policy (operating point) | error | cost | % of fine | fine nodes | precision / recall / F1 | within tol |
|---|---|---|---|---|---|---|
| A uniform coarse | 0.118 [0.099, 0.138] | 4,800 | 10 | 0 | – | 21 % |
| B uniform medium | 0.0452 [0.033, 0.059] | 14,400 | 30 | 0 | – | 79 % |
| C uniform fine | 0.00105 [0.0009, 0.0012] | 48,000 | 100 | 12 | 0.02 / 1 / 0.04 | 99.8 % |
| O oracle, tol 0.01 | 0.0017 | 15,163 | 32 | 0.27 | 1 / 1 / 1 | 99.8 % |
| O oracle, tol 0.002 | 0.00105 | 15,744 | 33 | 0.48 | 0.57 / 1 / 0.72 | 99.8 % |
| O′ oracle-flips | 0.00104 | 17,375 | 36 | 1.06 | 0.26 / 1 / 0.41 | 99.8 % |
| F learned, τ = 0.97 | 0.0068 [0.004, 0.010] | 18,118 | 38 | 0.23 | 0.71 / 0.61 / 0.66 | 90.7 % |
| F learned, τ = 0.1 | 0.0018 [0.0014, 0.0022] | 20,936 | 44 | 0.47 | 0.52 / 0.89 / 0.65 | 97.0 % |
| F learned, τ = 0.0003 | 0.00142 [0.0011, 0.0018] | 23,092 | 48 | 0.70 | 0.38 / 0.96 / 0.54 | 99.0 % |
| E2 physics, τ = 0.8 | 0.0080 [0.0045, 0.012] | 22,699 | 47 | 0.84 | 0.26 / 0.79 / 0.39 | 94.8 % |
| E2 physics, τ = 0.1 | 0.00105 | 28,155 | 59 | 1.76 | 0.15 / 1 / 0.27 | 99.8 % |
| E2s physics seq., τ = 0.4 | 0.0017 | 41,027 | 85 | 1.29 | 0.21 / 0.97 / 0.34 | 99.0 % |
| E3 adjoint, τ = 0.02 | 0.0011 | 57,677 | 120 | 1.92 | 0.14 / 0.99 / 0.25 | 99.5 % |
| E1 spatial, m = 6 | 0.0096 | 31,200 | 65 | 6 | 0.03 / 0.76 / 0.07 | 94.3 % |
| D random, m = 8 | 0.0198 | 36,800 | 77 | 8 | 0.02 / 0.66 / 0.04 | 91.7 % |
| D′ random (ancestors), m = 8 | 0.0146 | 36,317 | 76 | 7.8 | 0.02 / 0.71 / 0.05 | 92.7 % |

Cost to bring the *mean* error under the 0.01 tolerance: oracle 31 % of fine cost,
learned 38 %, learned-sequential 39 %, physics 47 %, spatial 65 %, physics-sequential
66 %, random-structured 91 %, random 100 %, adjoint 101 %.

Wall-clock (Python, includes controller overhead): medium 0.062 s, fine 0.199 s, learned
0.108–0.166 s, physics 0.151–0.193 s per episode (Fig. 1b). Nominal and wall-clock
orderings agree.

## 4. The crossing, and what it means (Figs. 1, 7, 8)

- **Low budget (≤ 1.6 × medium).** The learned router refines 0.2–0.5 nodes per episode
  with precision 0.5–0.7 and reaches 0.0018 at 44 % of fine cost; the physics heuristic
  at the same cost refines more (0.8) with precision 0.26 and sits at 0.008–0.019. Paired
  bootstrap: learned better by 0.016 (CI −0.044 to −0.007) at 1.5 × medium.
- **High budget (≥ 2 × medium).** The physics heuristic's recall is 1.0 at τ ≤ 0.1 because
  it refines every plausible switcher upstream of the readout; the learned router's recall
  saturates at 0.96, so its error floor is 1.35 × the numerical floor. Paired bootstrap:
  physics better by 0.0004 (CI 0.0001–0.0007) at 2, 2.5 and 3 × medium.
- **Sequential regime.** Re-simulating after each refinement penalises low precision: the
  physics heuristic needs 63–87 k units (1.3–1.8 × uniform fine) to reach the floor
  sequentially, the learned router 24–28 k. Learned-sequential beats physics-sequential at
  three budgets, which is what carries the registered H9 verdict. Under a one-shot-only
  reading H9 would *not* be supported (1 of 5 budgets). Both readings are reported.
- **Adjoint heuristic.** Charged two base simulations for its sensitivity solve, it cannot
  compete below 3 × medium cost at this fine/medium ratio (3.3); at higher ratios it would.
- **Selection correctness (Fig. 8).** At matched cost the learned router has the lowest
  waste of any non-oracle policy (0.06–0.30 vs 0.29–0.80 for physics, ≥ 0.86 for spatial
  and random); its miss rate reaches 0.01 but not 0.

**Interpretation.** In a system whose closure-failure condition is known analytically, a
learned router adds *selectivity* (which switchers matter for the readout) that a
margin-based rule lacks, and that selectivity is what buys the low-budget gains. It does
not add *coverage*: the rule's exhaustive recall is cheaper to obtain by writing the
condition down than by learning it. The natural next design is a hybrid — physics-derived
candidate set, learned ranking within it — which V1 will include as a condition.

## 5. Calibration and uncertainty (Fig. 2)

Reliability curve of the learned probability is close to the diagonal (ECE 0.007; physics
p_gauss is over-confident, ECE 0.088). Ensemble disagreement predicts point-prediction
mistakes with AUROC 0.985 *in-distribution*, i.e. borderline nodes are flagged. It does
not flag the confident misses (§6) and it does not rise under the `step` shift (§7):
mean disagreement 0.000 there vs 0.008 in-distribution. κ = 0 (no uncertainty bonus) is
indistinguishable from κ = 1 on every metric.

## 6. Failure analysis: the confident misses (`scripts/failure_analysis.py`)

At τ = 0.0003 the learned router misses 4 of 109 necessary nodes (3.7 %); the physics
heuristic misses none of them. All four have *positive* true margins (their coarse
trajectory is 0.1–2.7 above the switch-on threshold; none is a cascade-induced switch),
yet p ≤ 9e-5 with disagreement ≤ 4e-5. Three are intermediate nodes (neither intervened
nor readout) in necessary sets of size 2–4 in which each member's marginal contribution
to the target is ≈ 0.005, below the 0.01 labelling tolerance; the fourth is the readout
in a non-monotone episode. In training, 91 % of necessary nodes are the intervened node
or the readout, so intermediate members are rare (≈ 28 examples) and individually
marginal. Two remedies were tested post hoc:

| variant | recall at τ = 0.0003 | error | cost (% fine) |
|---|---|---|---|
| main router | 0.96 | 0.00142 | 48 |
| no intervention-site features | 0.97 | 0.00120 | 51 |
| intermediate positives oversampled × 6 | 0.94 | 0.00138 | 48 |

Neither closes the gap: the misses are a property of the *label* (hard membership in a
tolerance-defined minimal set) as much as of the learner. A value-regression target
(expected error reduction per node) is the obvious next step and is scheduled for V1.

Label diagnostics: tolerance unreachable in 0.25 % of episodes; **non-monotone in 18.75 %**
(refining some single node *increases* the error because two closure errors cancelled);
no bound violations in any reference trajectory.

## 7. Out-of-distribution families (Fig. 4, `tables/pareto_ood_*.csv`)

Error at a budget of 2 × the medium cost (best point of each policy's sweep at or below
the budget; medium fallback if none). Router trained on `id` only.

| family | learned | learned seq. | physics | random | oracle | uniform fine | uniform medium | AUROC learned / physics | disagreement |
|---|---|---|---|---|---|---|---|---|---|
| id | 0.0014 | 0.0014 | 0.0130 | 0.034 | 0.0011 | 0.0011 | 0.045 | 0.993 / 0.959 | 0.008 |
| amp_high (A 3–5) | 0.0156 | 0.0164 | 0.0208 | 0.082 | 0.0011 | **0.0078** | 0.113 | 0.987 / 0.950 | 0.026 |
| multi2 (two pulses) | 0.0096 | 0.0093 | 0.0133 | 0.065 | 0.0016 | **0.0074** | 0.079 | 0.979 / 0.940 | 0.020 |
| step (sustained) | **0.056** | **0.056** | 0.0019 | 0.038 | 0.0008 | 0.0007 | 0.065 | 0.967 / 0.926 | **0.000** |
| negative | 0.0010 | 0.0010 | 0.0009 | 0.0009 | 0.0009 | 0.0010 | 0.0010 | – | 0.001 |
| K20 (budget 48 k) | 0.0016 | 0.0016 | 0.0011 | 0.024 | 0.0008 | 0.0011 | 0.036 | 0.995 / 0.968 | 0.005 |
| sigmoid, ε = 0.03 | 0.0015 | 0.0015 | 0.0009 | 0.0028 | 0.0022 | 0.0009 | 0.0039 | 0.997 / 0.970 | 0.006 |
| noisy (SDE) | 0.0051 | 0.0012 | 0.0014 | 0.041 | 0.0008 | 0.0013 | 0.053 | 0.992 / 0.948 | 0.009 |
| σθ = 0 (exact thresholds) | 0.0020 | 0.0012 | 0.0017 | 0.030 | 0.0011 | 0.0011 | 0.036 | 0.996 / 0.948 | 0.004 |
| σθ = 0.6 | 0.0043 | 0.0049 | 0.0054 | 0.030 | 0.0009 | 0.0010 | 0.040 | 0.987 / 0.926 | 0.007 |

Observations.
- **Transfer that works:** different fast-subsystem formulation (`sigmoid`), stochastic
  fast subsystem (`noisy`, sequential), larger network (`K20`), exact and worse threshold
  information. Ranking quality (AUROC ≥ 0.98) survives every shift.
- **Transfer that fails:** `step`. The duration feature (7.5 vs 0.5–2 in training)
  pushes the MLP members into the same saturated regime: probabilities collapse to zero,
  nothing is refined, error equals the medium model's, and disagreement is exactly zero.
  This is the failure mode the literature scan warned about (biased, confident OOD error
  that spread-based detection misses). The physics heuristic, which uses the trajectory
  margin directly, is unaffected (0.0019).
- **Numerical floor moves.** For `amp_high` and `multi2` the sub-cycled fine simulator's
  own error against the Radau reference rises to 0.0074–0.0078 (faster transients), so
  every policy's floor rises with it. The *oracle* appears to beat uniform fine there
  because it selects the subset closest to the reference — it exploits numerical noise.
  The oracle is an upper bound only when the fine floor is well below the tolerance.
- **Negative pulses:** nothing can switch; every policy, including the learned router,
  refines nothing — the "avoid irrelevant computation" behaviour is present.
- Sparsity degrades as expected: 41 % of `amp_high` episodes need no refinement vs 79 %
  in-distribution (Fig. 6).

## 8. Ablations (Fig. 5, `tables/ablations_id.csv`; one-shot unless stated)

| variant | error at 1.5 × medium | error at 2 × medium | cost to tol (% fine) | AUROC | ECE |
|---|---|---|---|---|---|
| learned (main) | 0.0016 | 0.0014 | 38 | 0.993 | 0.007 |
| no uncertainty bonus (κ = 0) | 0.0017 | 0.0017 | 36 | 0.993 | 0.007 |
| no graph features | 0.0185 | 0.0011 | 52 | 0.970 | 0.008 |
| no trajectory features | 0.0128 | 0.0044 | 49 | 0.962 | 0.014 |
| intervention features only | 0.0228 | 0.0220 | never | 0.794 | 0.004 |
| GBM instead of MLP | 0.0018 | 0.0014 | 37 | 0.994 | 0.007 |
| switch label instead of necessity label | 0.0452 | 0.0010 | 51 | 0.961 | 0.077 |
| 100 training episodes | 0.0024 | 0.0011 | 39 | 0.980 | 0.009 |
| 300 training episodes | 0.0017 | 0.0014 | 36 | 0.993 | 0.006 |
| no partial-state training rows | 0.0014 | 0.0012 | 35 | 0.995 | 0.004 |
| no intervention-site features | 0.0020 | 0.0012 | 37 | 0.990 | 0.007 |
| intermediate positives oversampled | 0.0017 | 0.0014 | 37 | 0.993 | 0.008 |
| training seed 1 / 2 (`tables/seed_check_summary.csv`) | – | 0.0015 / 0.0014 | 37 / 36 | 0.993 / 0.993 | 0.006 / 0.008 |

What matters: the *causal-necessity label* (training on "switches" instead wastes compute
on irrelevant switchers: 51 % of fine cost to reach tolerance and ECE 0.077), the *graph*
features (causal relevance to the readout) and the *trajectory* features (margin to the
switch threshold). What does not: the uncertainty bonus, the learner class, partial-state
rows, and training-set size beyond 300 episodes. Three training seeds agree.

## 9. Threats to validity

- The closure-failure condition is analytically known, which is why a hand-written rule
  can reach recall 1.0. V0 answers "can learning match a rule a modeller could write?"
  (yes at low budgets, no at high budgets), not "can learning replace unavailable rules".
- Fine/medium cost ratio 3.3 bounds every saving; the adjoint heuristic's verdict in
  particular is ratio-dependent. A ratio-13 variant config is provided (`config_ratio13.yaml`).
- The τ grid was extended downward after seeing the truncated learned frontier; the
  extension used identical code and models on the same cached episodes for both the
  learned and the physics policies, and the H9 verdict is identical with and without it
  (the added points lie at higher cost than the decisive budgets except at 2 × medium).
- Single system family, single readout definition (AUC); one main seed for the world.
- The oracle exploits numerical noise when the fine floor is high (§7).
- 18.75 % of episodes are non-monotone: hard membership labels are noisy for those.

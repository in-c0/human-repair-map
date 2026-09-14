# STATUS — Physics-to-Life

_Last updated: 2026-09-14, after the owner review of the V0 handoff (PR #37)._

## Current objective
V0 passed its preregistered criteria **within one synthetic model family and only under
sparse, causally concentrated closure error**. The programme now crosses into
experimentally grounded biology: **V1 = Drosophila ion-channel → membrane bridge**
(Shaker-first), preregistered before its main run (ADR-0006). The synthetic enzymatic
cascade is demoted to a supporting benchmark (V1a).

## Latest result (V0, three runs)
- **Central finding, positive half:** with a quasi-static cheap model, an adaptive
  mixture exists (oracle: fine-floor accuracy at 33 % of fine cost) and a learned router
  finds most of it (tolerance at 38 % of fine cost; ECE 0.007; AUROC 0.993), reproduced at
  cost ratio 13. The frontiers cross: the router wins on selectivity at low budgets, a
  written physics rule wins on coverage at high budgets.
- **Central finding, negative half:** with a uniformly biased cheap model (constant
  closure) adaptivity fails completely — no policy, not even the oracle, beats uniform
  refinement. **Adaptive fidelity is useful only when approximation error has exploitable
  structure.** This is not a side result; it is the condition under which everything
  else holds.
- **Caveats that bound the claims:** the "79 % of interventions need no fine physics"
  figure is a property of the episode generator, not evidence that real biology is
  similarly sparse; the ensemble-disagreement bonus contributed nothing and failed
  confidently under a sustained-input shift; H9 passed only under the registered
  "one-shot or sequential" rule; the sigmoid formulation leg of H6 was a weak test.
- Do not describe H0 or the seven V0 hypotheses as broadly established. The correct
  phrase is "passed the preregistered V0 criteria within this synthetic model family".

## What changed
Owner review (2026-09-14) accepted V0 as a methodological scaffold and redirected V1 to
Drosophila channel/membrane biophysics; novelty claim narrowed to a six-part conjunction
(target-conditioned causal relevance, selection correctness, value of computation,
cross-scale intervention prediction, inverse design, and the validation progression);
a fresh adversarial novelty scan and a Drosophila channel-model resource scan are in
progress; ADR-0005 amended, ADR-0006 added.

## Current blocker
Publisher hosts are unreachable from this environment, so literature verification relies
on GitHub-mirrored code (ModelDB) and repository pages. Every citation must be verified
directly before manuscript use.

## Next experiment
V1 (Drosophila Shaker → HH → reduced current; embedded in a membrane/neuron model;
multiple targets; interventions with mechanistic interpretation; three adjudication
levels; value-of-computation and hybrid routers; five OOD detectors with
`false_safe_rate`; measured compute; H5 compiled surrogate; H8 neural closure; minimal
functional-restoration inverse task). Order: resources → reproduce one published result
→ hierarchy → numerical validation → **preregistration frozen** → routers/detectors →
pilot → audit → main run → falsification → review package.

## Key scientific risk
That the architecture does not survive contact with real biological parameterisations:
the cheap channel models' error may not be sparse or target-dependent, published
parameters may be inconsistent across preparations, and the learned router may again fail
confidently off-distribution. Any of these is a reportable result.

## Most important figure/result
`experiments/v0_toy/results/v0_main/figures/fig1_pareto_id.png` (crossing frontiers) and
`RESULTS.md` §10b (adaptivity fails when cheap-model error is not sparse).

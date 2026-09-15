# STATUS — Physics-to-Life

_Last updated: 2026-09-14, V1 system ported and reproduced; hierarchy built; preregistration draft v1._

## Current objective
V0 passed its preregistered criteria **within one synthetic model family and only under
sparse, causally concentrated closure error**. The programme has crossed into
experimentally grounded biology: **V1 = *Drosophila* ion-channel → membrane bridge on the
published Günay 2015 aCC/MN1-Ib motoneuron model** (ADR-0006, ADR-0007), to be
preregistered before its main run. The synthetic enzymatic cascade is a supporting
benchmark (V1a).

## V1 progress (2026-09-14)
- **Published model ported verbatim and reproduced** (`experiments/v1_channel/results/
  gunay2015_reproduction/`): the XPP settled state to 7e-8; CV(ISI) ≈ 0.002 and ~50 Hz
  (for a +12 pA step from the −12 pA hold; the paper's stimulus convention is ambiguous
  and recorded as such); hundreds-of-ms delays to first spike near rheobase; the
  independently reported rheobase hysteresis (silence→tonic between −1.91/−1.90 pA,
  tonic→silence between −2.72/−2.73 pA) **exactly**, with both the port and a re-integration
  by the authors' Euler method; the −10 mV prepulse inactivation of Kf.
- **Hierarchy** (ADR-0007): medium = the published HH model (never fitted); fine =
  constructed Markov levels with closed-state-coupled inactivation, concerted opening
  (Kf), open-state-coupled inactivation with closed-state recovery (NaT), fitted to the
  published currents on a declared family (normalised RMS: Kf 5.8 %, NaT 4.0 %; level B
  alternate topologies 2.9 % / 4.4 %); Ks/NaP exact chains as negative controls; coarse =
  reduced model. Every fine-level rate is CONSTRUCTED, not measured.
- **Machinery generalised** to real systems: interventions and instance variability act on
  the same physical rate at every level (two pilot-machinery bugs fixed; no claim affected);
  H5/H8 closure-comparison stage and the H10 functional-restoration script added.
- **Hierarchy validated and corrected twice** (research log §6–§9): objective dilution and
  unconstrained rest states (fixed by active-sample residuals and rest-hold protocols); a 50 %
  firing-rate discrepancy (fixed by an action-potential-clamp trace in the fit family and a
  Kuo–Bean coupling fixed by design for NaT, since a free coupling collapses onto the HH gate).
  The pilot hierarchy has the medium outside tolerance for ~half of the preview targets, split
  between Kf-fixable and NaT-fixable — the informative regime.
- **Pipeline smoke-tested end to end**; **pilot running** (120/60/4×30 episodes, launched
  2026-09-15 02:02 UTC). Then: audit → corrections → preregistration freeze → main run.
- **Preregistration draft v1** written (`docs/experiments/v1_preregistration.md`); frozen after
  the pilot audit.

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

## Novelty after the adversarial scan (2026-09-14)
Target-conditioned refinement is prior art (goal-oriented model adaptivity), as is
restoring wild-type electrophysiology by model search (Allam 2021; Moreno 2019; Pai/Levin
2018) and cost-aware learned simulator invocation (HyPER 2025). Residue: (1) set-level
scoring of whether the right physics was requested against hidden ground truth; (2)
refinement conditioned on a requested intervention outcome where no adjoint exists. The
V1 conditions now include the mandatory baselines the scan named (adjoint/finite-difference
sensitivity, novelty, uncertainty threshold, deviation trigger, HyPER-style full-state
causal-blind policy). See `docs/literature/README.md`.

## What changed
Owner review (2026-09-14) accepted V0 as a methodological scaffold and redirected V1 to
Drosophila channel/membrane biophysics; novelty claim narrowed to a six-part conjunction
(target-conditioned causal relevance, selection correctness, value of computation,
cross-scale intervention prediction, inverse design, and the validation progression);
a fresh adversarial novelty scan and a Drosophila channel-model resource scan are in
progress; ADR-0005 amended, ADR-0006 added.

## Current blocker
None. Literature: publisher hosts are unreachable from this environment; every citation
is marked verified-from-artefact or citation-only and must be re-checked before manuscript
use. The primary Shaker Markov rate tables (ZHA 1994; Schoppa–Sigworth 1998) could not be
read, which is why the fine levels are fitted constructions rather than published schemes.

## Next experiment
V1 pilot on the Günay system (`experiments/v1_channel/config_gunay.yaml`): hierarchy
validation → pilot (120/60/30) → audit (leakage, noise floor, label informativeness,
timing) → corrections recorded → preregistration frozen → main run (400/200/60 per OOD
family) → falsification, cross-formulation (level B) tests, functional restoration →
review package.

## Key scientific risk
That the architecture does not survive contact with real biological parameterisations:
the cheap channel models' error may not be sparse or target-dependent, published
parameters may be inconsistent across preparations, and the learned router may again fail
confidently off-distribution. Any of these is a reportable result.

## Most important figure/result
`experiments/v0_toy/results/v0_main/figures/fig1_pareto_id.png` (crossing frontiers) and
`RESULTS.md` §10b (adaptivity fails when cheap-model error is not sparse).

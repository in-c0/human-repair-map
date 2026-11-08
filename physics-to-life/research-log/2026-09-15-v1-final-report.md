# Physics-to-Life — V1 final report to the owner (2026-09-15)

**Scope.** The V1 rung: target-conditioned adaptive fidelity on the published Günay et al. 2015
*Drosophila* aCC/MN1-Ib motoneuron model, preregistered v1.1 (commit `32a39d1`), main run
`experiments/v1_channel/results/v1_gunay_main/` (400 / 200 / 4 × 60 / 100 reserved episodes, 6.9 h;
post-main analyses 4 h). Every verdict is the preregistered rule applied by the analysis code as
frozen; post-hoc items are labelled and listed in preregistration §16. Details and every number:
research log `2026-09-15-v1-main-run.md`; reviewer's package `2026-09-15-review-package-v1.md`.
Nothing here was optimised for a positive result; the headline is negative.

## Verdicts at a glance

| hypothesis | preregistered verdict | one line |
|---|---|---|
| H1-V1 target-conditioned VoC routing | **falsified** (both conditions; both readings of the operating-point rule) | at 30 % of uniform-fine cost the learned router (err/tol 0.82) loses to the ensemble-spread triggers (0.17 at 40 %; 0.42 at 32 % at fixed compute); parity with the V0-style classifier at 50 % |
| H3-V1 selectivity vs coverage | **not passed** | precision 2.2–2.6× the written rules at equal recall, but no frontier crossing: the router dominates the written rules at every budget |
| H5-V1 compiled surrogate with calibrated distrust | **falsified** | descriptor-only emulator within tolerance on 28 % of ID rows; the only calibrated gate never trusts |
| H8-V1 hybrid closure vs black box | **not passed** | medium + learned residual halves the black box's error on 4/4 OOD families, but detects its own invalidity worse (AUROC 0.59 vs 0.79) and violates constraints more (4–7 % vs 1–2 %) |
| H9-V1 cross-formulation transfer (precursor) | **passes** (VoC router); hybrids falsified | precision under the level-B truth 0.80 vs 0.65 under A, above every written rule under B (best 0.75); a narrow, base-rate-inflated pass — see below |
| H10-V1 functional restoration (precursor) | **not testable** as preregistered | the Kf-loss damage has no phenotype in the published model; exploratory NaT-loss variant reported separately, not a verdict |

## 1. What survived
- **The machinery, end to end.** A published cell model ported verbatim and reproduced against every
  readable anchor; a non-nested fidelity hierarchy validated before use, in which the negative
  controls (Ks, NaP) never enter a minimal set and every target is informative; hidden-truth labels
  over all refinement subsets; validation-only threshold selection, paired statistics, Holm
  correction; a reserved set evaluated once, which replicated the test-set picture at the
  preselected thresholds.
- **The router learns something real and transferable.** Permuting the labels collapses it
  (precision 0.67 → 0.07); leaving any intervention family out of training does not degrade it on
  that family; its selection precision at equal recall is 2.2–2.6× the written physics rules'; and
  its standing relative to those rules survives an independently formulated fine truth (H9).
- **A learned refinement signal beats written physics rules on this system at every budget** —
  current share, medium-vs-coarse discrepancy and sensitivity × discrepancy are dominated
  everywhere, and the discrepancy monitors cannot even reach the 15–30 % budgets.
- **Routed refinement as a search engine (exploratory, not a verdict).** For compensating a sodium
  conductance loss, refining only where the router says so reproduced the uniform-fine search on
  every check (8/11 instances restored on fine A, more on the held-out protocol) at 26 % of its
  cost, and every routed candidate survived the fine check, whereas the published-model-only
  search's "restorations" failed the fine check in 86 % of cases.
- **The negative-result discipline.** Four pilot corrections, a frozen preregistration, an
  audit, falsification controls, a post-hoc record — all in place before any main-run number.

## 2. What failed
- **The proposition of ADR-0006 as preregistered (H1-V1).** A target-conditioned, continuous
  value-of-computation estimate does not beat the natural baselines at fixed compute. It loses to
  a trigger built from the *disagreement* of the same ensemble, and it ties the V0-style
  hard-label classifier. Its mean error at the principal point is carried by one row — a
  silence-versus-firing flip of the published model under NaT inactivation × 2.76 that the
  router did not refine (48 % of the summed error); without that row it is at parity with the
  spread trigger. The reading is that the point estimate regresses rare, catastrophic gains toward
  zero while ensemble members disagree on exactly those rows.
- **The crossing-frontiers story (H3-V1).** Selectivity holds; "written rules win at high budgets
  by coverage" does not happen on this system.
- **Compilation with calibrated distrust (H5-V1).** No descriptor-only surrogate of the fine
  targets exists at this training size (within tolerance on 28 % of rows), and every distrust gate
  except "never trust" declares ~95 % of rows safe while being wrong on ~93 % of the rows that
  needed fine physics.
- **The hybrid's self-knowledge (H8-V1).** Keeping the published physics in the loop halves a
  learned closure's error on every OOD family, but the closure's mechanistic invalidity monitor is
  worse than the black box's ensemble spread, and the additive residual violates the physical
  constraints more often than the black box.
- **"Target-conditioned".** A target-blind router is nearly as good (precision 0.64 vs 0.67):
  the protocol group already determines which channel can matter; the target identity within a
  group adds little.
- **OOD detection from dynamics.** Only the descriptor range guard detects the planted shifts, and
  only when the shift is visible in the descriptors; every dynamics-based detector is at chance
  with false-safe rates 0.6–1.0 — the same as V0.

## 3. What was merely simulator-specific
- **The fine levels.** They are constructions fitted to the published currents (a richer scheme
  that nests the HH gate collapses onto it when fitted), so V1 tests *simulation* fidelity only.
  Whether the medium's "errors" are errors about the cell is unknown.
- **The labels.** The two constructed truths disagree on which channel needs refinement in 37 %
  of (group, target) labels, and they disagree about how far the published model is from the truth
  (within tolerance on 47 % of rows under A, 29 % under B). H9 passes as a *ranking* test; a
  router trained under one truth is not an error guarantee under another (its error at the 30 %
  point rises from 0.72 to 1.24, its false-safe rate doubles).
- **Restorations.** Compensations found under formulation A restore the formulation-B cell in
  1 of 11 cases, for every method including uniform fine. Two fine formulations that agree with
  the published currents to 2.5–10 % disagree about what compensates a sodium loss.
- **The metric's tail.** The preregistered mean error/tolerance is decided by single rows at the
  principal point (median 0.0; one row = 48 % of the sum). This is the preregistered metric and
  the verdict stands; a median- or success-rate criterion would read differently and was not
  preregistered.
- **The inert damage.** The published model's Kf carries ≈ 1 % of the sodium current at 10 pA;
  Kf loss and Kf kinetics have no current-clamp phenotype here. Nothing about "A-type loss" in
  this cell type can be concluded from this model.

## 4. What reproduced published biology
- The published model itself, to the precision of its own integrator: the XPP settled state
  (7e-8), CV(ISI) ≈ 0.002 at ~50 Hz, hundreds-of-ms first-spike delays near rheobase, the
  independently reported rheobase hysteresis (−1.91/−1.90 and −2.72/−2.73 pA) exactly, the
  −10 mV prepulse inactivation of Kf (`results/gunay2015_reproduction/RESULTS.md`).
- Nothing beyond the published model. No fine level was tested against a measurement the medium
  was not fitted to; that is the gap the next rung has to close before "fine" can mean "closer
  to the biology".

## 5. What changed relative to V0
- V0: the learned router won at low budgets by selectivity, the written physics rule won at high
  budgets by coverage, and ensemble disagreement contributed nothing. V1: written rules are
  dominated everywhere, ensemble disagreement is the best refinement signal, and the point-estimate
  VoC router does not beat it. The V0 story does not generalise to the first real-biology system.
- V0 and V1 agree that the hard-label classifier is as good as the VoC regressor, that OOD
  detection from dynamics fails, and that adaptive refinement is far better than uniform levels
  when the cheap model's error is sparse (here the oracle reaches 0.21 tolerances at 24 % of
  uniform-fine cost against 8.0 for the published model alone).
- New at V1: the metric's heavy tail (qualitative flips of the published model), an inert
  preregistered damage, and the non-transfer of restorations between formulations.

## 6. Does the evidence justify moving toward a *Drosophila* circuit / MaleCNS rung?
**No — not on the strength of adaptive routing, and not yet on the strength of the fine level.**
The proposition that motivated the programme — a learned controller that decides where explicit
physics is worth computing and beats the natural baselines — was falsified at the first
real-biology rung by a baseline that is simpler than the controller (calibrated ensemble
disagreement). What survived is machinery, a transferable ranking, and a search-engine use of
routed refinement whose value is bounded by the fine level's own arbitrariness (37 % label
disagreement, 1/11 restoration transfer between formulations). Adding scale (a circuit, the
MaleCNS connectome) to an unresolved single-cell question would multiply the arbitrary part.

Two next rungs are consistent with the evidence; the owner decides (preregistration §15):
1. **Make the fine level answer to data (the option consistent with the programme's purpose).**
   Take a channel whose Markov kinetics are actually measured — Shaker/Shal single-channel or
   gating-current data in *Drosophila* or a heterologous system — build the hierarchy so that
   "fine" is closer to the measurement than the published HH description, and re-run the same
   preregistered comparison with the ensemble-spread trigger as the incumbent. Then a router's
   decision is scored against biology, not against a construction, and "what reproduced published
   biology" can include something the medium was not fitted to.
2. **Re-centre the controller on the signal that worked.** Preregister calibrated
   ensemble-disagreement-per-cost (the V1 incumbent) against the V1 baselines and the VoC router
   on the same system, with the reserved set and the level-B truth as replication and transfer
   checks, and with a median/success-rate secondary metric registered alongside the mean. This is
   cheaper (no new biology) but does not move the programme toward biology.

Not recommended: a circuit rung, a MaleCNS rung, or any claim of "target-conditioned value of
computation" in a manuscript until one of the two rungs above has been run.

## 7. Where everything is
- Preregistration (frozen v1.1 + post-hoc record §16): `docs/experiments/v1_preregistration.md`.
- Main run: `experiments/v1_channel/results/v1_gunay_main/` — `verdicts.md` (H1, H3),
  `verdicts_supplement.md` (post-hoc fixed-compute reading), `verdicts_extended.md` (H5, H8, H9,
  H10, reserved set), `falsification.md`, `audit.md`, `cross_formulation/`, `restoration/`,
  `restoration_nat_loss/`, `figures/`, `tables/`, `summary.json`, `provenance.json`.
- Reproduction and hierarchy: `results/gunay2015_reproduction/`, `results/hierarchy_validation/`.
- Logs: `research-log/2026-09-14-v1-gunay2015-port-and-hierarchy.md` (port, hierarchy, pilot,
  §12 the inert damage), `2026-09-15-v1-main-run.md` (verdicts), `2026-09-15-review-package-v1.md`.
- Registry and ladder: `docs/hypotheses.md`, `docs/validation.md`; decisions: ADR-0005 … 0007.

# Review package — milestone V1 (target-conditioned adaptive fidelity on the published Günay 2015 *Drosophila* aCC motoneuron)

**Status: main run complete (2026-09-15 12:50 UTC); H1/H3 verdicts final; H5/H8/H9/H10 and the
final reading are filled in as the post-main chain completes.** Every number marked *(pilot)*
comes from the pilot/dress rehearsal and is not a result. For an external reviewer with no
conversational memory; everything cited is in the repository.

## 1. Objective
Can a target-conditioned learned controller determine when the published reduced (HH)
description of a *Drosophila* motoneuron's channels is insufficient for predicting an
intervention, selectively invoke richer channel kinetics, and outperform uniform high-fidelity
computation on the accuracy–cost frontier — with a distrust mechanism that does not silently
fail on unseen intervention families? Preregistered hypotheses, criteria, operating points,
statistics, seeds and falsification rules: `docs/experiments/v1_preregistration.md` (frozen
v1.1, commit `32a39d1`, before any main-run seed was simulated). Design decisions: ADR-0006,
ADR-0007 (+ amendments).

## 2. Methodology
- **System.** The Günay et al. 2015 isopotential aCC/MN1-Ib larval motoneuron model (XPP file
  and NeuroML2 port in the authors' repository, ModelDB 152028), ported verbatim
  (`src/physics_to_life/v1/systems/gunay2015.py`) and **reproduced** against every readable
  anchor: the XPP settled state to 7e-8; CV(ISI) ≈ 0.002 and ~50 Hz; hundreds-of-ms delays near
  rheobase; the independently reported rheobase hysteresis (−1.91/−1.90 and −2.72/−2.73 pA)
  exactly, with the port and with the authors' Euler integrator; −10 mV prepulse inactivation
  of Kf (`experiments/v1_channel/results/gunay2015_reproduction/RESULTS.md`). One ambiguity
  recorded (the paper's stimulus convention).
- **Hierarchy** (`hierarchy/gunay2015_fine.json`; `systems/gunay2015_fine.py`): medium = the
  published HH model, never fitted; fine = constructed, *non-nested* Markov levels with
  HH-anchored rates fitted on a declared family (activation steps, prepulse inactivation,
  recovery, rest-state holds, and the published model's own spike waveform as an AP clamp):
  Kf sequential two-step activation with allosterically coupled inactivation (floor 5.1 %,
  3.3 % under the spike waveform), NaT Kuo–Bean coupled chain with the coupling fixed by design
  (a = 3; 2.5 %); level B alternate topologies (ZHA Kf 9.7 %, open-state NaT 6.3 %); Ks/NaP
  exact chains (negative controls); coarse = reduced model (instantaneous activation). Every
  fine-level rate is constructed; a richer scheme that nests the HH gate collapses onto it when
  fitted to the HH outputs (research log §8), so the fine levels test *simulation* fidelity,
  never biological fidelity beyond the published model.
- **Ground truth.** Level A: all channels fine, LSODA rtol 1e-9 (agrees with Radau to 1e-4 mV
  at 7.5× lower cost). Level B: alternate formulation. Level C: the published/independent
  observations of the medium level (reporting only).
- **Episodes.** Instance jitter (conductances CV 0.2, kinetic keys CV 0.1, identical at every
  level); ID intervention families none / density / kf_loss / kf_inactivation / kf_recovery /
  nat_inactivation / temperature / k_out; OOD families block / opening_step / combo /
  activation_rate; four protocol groups per episode (Kf activation step, Kf twin-pulse
  recovery, NaT activation step, the Günay current step) with 12 targets; tolerance 5 %
  relative (peak_current 10 %) with absolute floors.
- **Labels.** Errors of every subset of {Kf, NaT} refined on top of the medium level (Ks/NaP
  charged their measured single-refinement increments; pilot showed 0 % of minimal sets contain
  them), marginal gains, interactions, minimal sets with the noise-floor rule.
- **Conditions** (§6 of the preregistration): uniform levels, random, current-share rule,
  medium-vs-coarse discrepancy trigger, sensitivity × discrepancy (adjoint surrogate),
  DynIm-style novelty, AdaLED-style ensemble-uncertainty trigger, uncertainty per cost,
  HyPER-style full-state (causal-blind) VoC, V0-style hard-label classifier, learned VoC
  (one-shot; sequential as a separate condition), hybrid physics-candidates + learned ranking,
  oracles. Operating points 15 / **30** / 50 % of uniform-fine cost; thresholds selected on the
  validation split only; paired bootstrap; Holm correction.
- **H5/H8.** Emulator (descriptors only) vs medium + learned residual vs coarse/medium/fine,
  with five distrust gates and `false_safe_rate`. **H9.** Level-B relabelling of the test set
  (`cross_formulation.py`). **H10.** Functional restoration with routed / medium / fine search
  (`restoration.py`): the preregistered Kf-loss damage, evaluated over *functionally damaged*
  instances, and — because that damage turned out to be inert in the published model
  (preregistration §16, research log §12) — a post-hoc exploratory NaT-loss variant reported
  separately. **Mechanical verdicts** for H5/H8/H9/H10 and the reserved-set replication
  (`verdicts_extended.py`). **Falsification attempts** (`falsification.py`): permuted labels,
  descriptors-only, simulation-only, target-blind, leave-one-family-out.
- **Sizes and compute.** Main run 400 / 200 / 4 × 60 / 100 reserved episodes, seeds offset
  100 000; pilot 120 / 60 / 4 × 30 at offset 0 (148 s per episode exhaustive on one process).

## 3. Key code paths
`src/physics_to_life/v1/channels.py` (rates, HH gates, Markov schemes, shared scale keys) ·
`membrane.py` (mixed-fidelity integrator) · `markov_fit.py` (analytic voltage-clamp solutions,
fitting) · `systems/gunay2015.py`, `gunay2015_fine.py`, `gunay2015_profile.py` ·
`episodes.py` (labels, noise floor, relabel) · `experiment.py` (exact-lookup policy
evaluation, frontiers) · `routing.py`, `ood.py`, `surrogate.py` ·
`experiments/v1_channel/{run.py, build_hierarchy.py, validate_hierarchy.py,
reproduce_gunay2015.py, audit_pilot.py, verdicts.py, verdicts_extended.py,
cross_formulation.py, restoration.py, falsification.py}`.

## 4. Figures
All under `experiments/v1_channel/results/v1_gunay_main/figures/` (regenerated from the run's
tables by `replot.py`; the numbers are the tables').
- `fig1_pareto_pooled_id` — accuracy vs compute pooled over targets, ID test set (2400 target
  rows): the learned VoC router (one-shot, sequential), the hybrids, the V0-style classifier,
  the written rules, the ensemble-uncertainty triggers and the oracles. Claim: no learned router
  beats the ensemble-spread triggers at ≤ 40 % of uniform-fine cost; the written rules are
  dominated at every budget; the router reaches the hard-label classifier's frontier at 50 %.
- `figS_pareto_pooled_reserve` — the same on the reserved 100 episodes at the validation-selected
  thresholds (replication line).
- `figS_pareto_pooled_{block, opening_step, combo, activation_rate}` — the same on the OOD
  families.
- `figT_pareto_<target>` — per-target frontiers (nine targets).
- `fig2_target_dependence` — fraction of episodes in which each channel's fine physics is
  necessary, per target and family: Ks/NaP never; Kf for recovery (80–90 %); NaT for spiking.
- `fig3_ood_detectors` — AUROC and false-safe rate of the five detectors per OOD family:
  descriptor range guard perfect on descriptor-visible shifts, everything else at chance.
- `fig4_closures_h5_h8` — median error of the five closures and the false-safe rate of the
  distrust gates (emulator and hybrid) per family.
Reproduction and hierarchy figures: `results/gunay2015_reproduction/figures/`,
`results/hierarchy_validation/figures/`.

## 5. Metrics
Main run `v1_gunay_main` (ID test set, 200 episodes, 2400 target rows; thresholds chosen on the
validation split; `verdicts.md`, `verdicts_supplement.md`, `summary.json`, `tables/`).

| quantity | value |
|---|---|
| uniform medium (published HH) err/tol, success | 8.03, 0.46 |
| oracle minimal set err/tol at cost | 0.21 at 23.6 % |
| learned VoC (one-shot) at the 15 / **30** / 50 % points: cost, err/tol | 0.146, 1.46 / **0.277, 0.82** / 0.516, 0.040 |
| — selection precision / recall at 30 % | 0.67 / 0.76 |
| best baseline at 30 % (coded rule): ensemble-uncertainty trigger, cost, err/tol | 0.399, 0.166 — ratio 4.96, Holm p < 0.001 (wrong direction) |
| best attaining baseline at 30 % (post-hoc fixed-compute reading): uncertainty-per-cost | 0.324, 0.418 — ratio 1.97, Δ +0.41 [−0.02, +1.22] |
| at 50 %: hard-label classifier | 0.506, 0.036 — Δ +0.004 [−0.017, +0.019] (parity) |
| cost to 95 % success: hard-label / VoC / VoC seq / uncertainty / unc-per-cost / discrepancy / share / oracle VoC | 0.31 / 0.35 / 0.38 / 0.41 / 0.55 / 0.79 / 1.06 / 0.27 |
| H3: precision at equal recall (0.755) — learned vs discrepancy vs sensitivity | 0.668 vs 0.256 (2.6×) vs 0.310 (2.2×) |
| H3 crossing: learned better at 15 % / written rule not worse at 50 % | yes / **no** (router dominates the written rules everywhere) |
| false-safe rate at 30 %: VoC (ID, reserve, OOD families) | 0.19, 0.19, 0.17–0.24 |
| reserved set at the same thresholds, 30 % / 50 %: VoC vs best attaining baseline | 0.365 vs 0.360 / 0.017 vs 0.046 |
| OOD detectors (AUROC): range guard on activation_rate, opening_step, block, combo | 1.00, 1.00, 0.61, 0.76; all dynamics-based detectors 0.2–0.7 |
| compute | 6.87 h on 4 processes (generation 6.52 h; 126 s per episode, 52 simulations) |

H5/H8 (`verdicts_extended.md`), H9 (`cross_formulation/`), H10 (`restoration/`,
`restoration_nat_loss/`) and the falsification attempts (`falsification.md`): filled in below as
the chain completes.

## 6. Failure cases and discarded results (so far)
- First hierarchy: the fits satisfied the step families while being degenerate at rest
  (Kf 97 % inactivated at every holding potential; NaT without steady-state inactivation) —
  objective dilution and no rest-state protocol. Discarded; families and objective corrected.
- Second hierarchy: 50 % higher firing rate than the published model at the same current —
  step families do not constrain a spike trajectory. AP-clamp trace added.
- Open-state-coupled NaT remained far too excitable (47 vs 17 spikes at −1 pA); a free-coupling
  Kuo–Bean chain collapsed onto the HH gate. Coupling fixed by design (a = 3), robustness
  variants a = 2 and a = 5 stored.
- Pilot audit: raw-gain VoC regression R² < 0 (zero-inflated, heavy-tailed labels); negative
  controls in 0.3 % of minimal sets under a too-strict floor; peak_current uninformative at 5 %;
  coarse threshold grids. All four corrected before the freeze and recorded in the
  preregistration; pre-correction outputs kept in `results/v1_gunay_pilot/before_corrections/`.
- Two pilot-machinery bugs on the provisional placeholder system (per-level independent
  jitter; block active without drug) — fixed before any real system was labelled.
- **The preregistered H10 damage has no phenotype.** Complete Kf removal leaves the published
  model's 10 pA response unchanged (authors' integrator: 45 spikes, first spike 23.20 ms with
  and without Kf; peak |I_Kf| ≈ 3.7 pA vs ≈ 430 pA NaT), at every hold and step tried and for
  the jittered instances. The pilot restoration check (4/4 damaged phenotypes within tolerance)
  had scored every method 1.0 on a trivial problem. Recorded post-hoc before any main-run
  result (preregistration §16 items 1–3); H10-V1 is reported as not testable if the main-run
  instances contain no functionally damaged case, and an exploratory NaT-loss variant is run.

## 7. Interpretation
**H1-V1: falsified, in both conditions and under both readings of the operating-point rule
(research log 2026-09-15 §2).** The target-conditioned VoC router does not beat the best
baseline at fixed compute at the principal point: the ensemble-spread triggers (AdaLED-style
uncertainty; uncertainty per cost) reach lower error at ≤ 40 % of uniform fine, and at 50 %
the router is at parity with the V0-style hard-label classifier. The learned *point estimate*
of the value of computation is a worse refinement signal than the *disagreement* of the same
ensemble — the reverse of V0, where ensemble disagreement contributed nothing. The written
physics rules (current share, medium-vs-coarse discrepancy, sensitivity × discrepancy) are
dominated at every budget on this system: the reduced level is far from the HH level for every
channel, so a discrepancy monitor cannot discriminate.

**H3-V1: not passed (research log §3).** The selectivity clause holds (precision 2.2–2.6× the
written rules at equal recall), the predicted frontier crossing does not: the router is
better than the written rules at high budgets too. The narrowed proposition of ADR-0006
("selectivity at low budgets, coverage at high budgets") is not what this system shows; what
it shows is that a learned signal of *any* kind (classifier, regressor, ensemble spread) beats
written rules here, and that among learned signals the calibrated-disagreement trigger is the
best.

*(H5, H8, H9, H10, the falsification controls and the final reading follow when the chain
completes.)*

## 8. Threats to validity
- Simulation fidelity only: the fine levels are constructions fitted to the published model;
  nothing here shows a fine level closer to the biology than the published HH.
- Detectors: shifts on the OOD families are visible in the intervention *descriptors* (range
  guard perfect on descriptor-only shifts), not in the dynamics; kNN density was worse than
  chance on them in the pilot — descriptor leakage into "OOD detection" must be read as such.
- The exact-lookup evaluation charges every policy its actual simulations; sequential policies
  cannot use budgets below their base cost (reported as unattained points).
- Tolerances and the peak_current exception were set by the pilot audit before the freeze.
- Level-B contrast is weaker for NaT than for Kf (both NaT forms converge to similar solutions).
- The published model's Kf current is small (≈ 1 % of the NaT peak at 10 pA), so Kf-loss and
  Kf-kinetic interventions have almost no current-clamp phenotype here; conclusions about
  "A-type loss" in this cell type cannot be drawn from this model (`kf_loss` ≈ `none` in current
  clamp on the training split, research log §12.1).
- Post-hoc items (preregistration §16): the H5 detector-choice statistic, the H8/H9 reading and
  the H10 validity filters were made explicit after the freeze; none changes a threshold, seed or
  H1/H3 criterion, and all were fixed before any main-run result existed.

## 9. Open questions
*(after the main run)*

## 10. Next proposed actions
*(after the main run; the owner decides on the V2 rung per preregistration §15)*

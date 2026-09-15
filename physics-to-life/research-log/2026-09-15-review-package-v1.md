# Review package — milestone V1 (target-conditioned adaptive fidelity on the published Günay 2015 *Drosophila* aCC motoneuron)

**Status: DRAFT written while the preregistered main run executes (launched 2026-09-15 05:57 UTC).**
Sections 5, 7 and parts of 6, 8 are completed from the main-run outputs when they exist; every
number marked *(pilot)* comes from the pilot/dress rehearsal and is not a result. For an external
reviewer with no conversational memory; everything cited is in the repository.

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
  (`cross_formulation.py`). **H10.** Kf-loss functional restoration with routed / medium / fine
  search (`restoration.py`). **Falsification attempts** (`falsification.py`): permuted labels,
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
reproduce_gunay2015.py, audit_pilot.py, verdicts.py, cross_formulation.py, restoration.py,
falsification.py}`.

## 4. Figures
*(main run; to be listed with one-sentence claims)*
Reproduction and hierarchy figures: `results/gunay2015_reproduction/figures/`,
`results/hierarchy_validation/figures/`.

## 5. Metrics
*(main run: `results/v1_gunay_main/{summary.json, verdicts.md, tables/}`; cross-formulation,
restoration and falsification outputs alongside)*

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

## 7. Interpretation
*(main run)* — The dress rehearsal on the pilot *(pilot; not a result)* had the learned router
behind the ensemble-uncertainty trigger at 15–30 % budgets and at parity with the V0-style
classifier at 50 %, with 2–2.5× the written rules' selection precision at equal recall.

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

## 9. Open questions
*(after the main run)*

## 10. Next proposed actions
*(after the main run; the owner decides on the V2 rung per preregistration §15)*

# V1 preregistration — target-conditioned adaptive fidelity on the Günay 2015 *Drosophila* aCC motoneuron

**Status: FROZEN v1.1 (2026-09-15 05:57 UTC, commit `32a39d1`) — see §16. Changes after this point are post-hoc and marked as such.**
Rules of this document: everything in §2–§15 is fixed at the freeze. After the freeze, the only
allowed changes are (a) the pilot-audit corrections listed in §14 *before* the main run, and
(b) changes marked **post-hoc** in the results. Thresholds, operating points, seeds, effect sizes
and falsification criteria are never changed after results are seen. Owner directives: ADR-0006
§11 and the review of 2026-09-14.

## 1. Questions and hypotheses as tested in V1

Primary question (ADR-0006 §2): can a target-conditioned learned controller determine when the
reduced *Drosophila* electrophysiology model (the published HH description) is insufficient for
predicting an intervention, selectively invoke richer channel physics (constructed Markov
kinetics), and outperform uniform high-fidelity computation on the accuracy–cost frontier?
Secondary: can the expensive channel dynamics be compiled into a reusable learned effective
model without silently failing on unseen interventions?

Each hypothesis below has a pass criterion and a falsification criterion; "pass" is always
"passed the preregistered V1 criteria on this system", never a general claim.

| id | hypothesis (V1 instantiation) | passes if | falsified if |
|---|---|---|---|
| **H1-V1** (target-conditioned VoC routing) | On in-distribution (ID) test episodes, the learned value-of-computation router attains lower target error at fixed compute than uniform medium, uniform fine and every written-rule / trigger baseline of §6, at the principal operating point (30 % of uniform-fine nominal cost), separately for the one-shot and the sequential condition | at the principal point the learned router's mean error is ≤ 0.8 × that of the best non-learned baseline **and** the paired bootstrap 95 % CI of the difference excludes 0 (Holm-corrected over the three operating points, §8); the other two operating points do not contradict (learned not significantly worse than the best baseline) | the learned router is not significantly better than the best non-learned baseline at the principal point, in either condition |
| **H3-V1** (selectivity vs coverage) | The learned router's advantage, where present, comes from selection precision (refining the channels whose fine physics changes the target) rather than from refining more; written rules win at high budgets by coverage | selection precision of the learned router ≥ 1.2 × that of the discrepancy and sensitivity×discrepancy baselines at equal recall (§7); frontiers cross (learned better at ≤ 30 %, written rule not worse at 50 %) | precision not higher at equal recall, or the learned router is dominated at every budget |
| **H5-V1** (compiled surrogate with calibrated distrust) | A learned effective model of the fine current-clamp targets, trained on fine simulations of ID episodes, is at least 10× cheaper amortised than one fine call, is within tolerance on ≥ 80 % of ID test episodes, and its distrust gate keeps `false_safe_rate` ≤ 0.05 ID and ≤ 0.20 on every OOD family with post-fallback error within tolerance | all four clauses hold for at least one of the five detectors of §9 chosen **on validation ID data only** | amortised speed-up < 3×, or ID within-tolerance rate < 60 %, or `false_safe_rate` > 0.20 on ≥ 2 OOD families for every detector |
| **H8-V1** (hybrid closure vs black box) | Medium + learned residual closure (per target) extrapolates to OOD families better than a fully learned surrogate of the same capacity, preserves the medium model's structural constraints, and detects its own invalidity better | lower error than the fully learned surrogate on ≥ 3 of 4 OOD families (paired CI excludes 0 on ≥ 2) and OOD AUROC of its discrepancy monitor ≥ that of the black box's ensemble spread | the fully learned surrogate matches or beats the hybrid on ≥ 3 of 4 OOD families |
| **H9-V1** (cross-formulation transfer, precursor) | Routing decisions learned under the Level-A hidden truth keep their selection quality under the independently formulated Level-B truth | selection precision under B ≥ 0.8 × precision under A, and still ≥ the physics baselines' under B | precision under B falls below the physics baselines' under B |
| **H10-V1** (functional restoration, precursor) | For instances damaged by Kf loss, a search over the intervention space using the routed simulator restores the wild-type spike count and latency within tolerance, and the restoration holds on the fine A, fine B and held-out protocols | ≥ 70 % of damaged instances restored within tolerance on all three checks; the routed search uses ≤ 50 % of the compute of the same search on uniform fine | < 50 % restored on the fine-A check, or restorations found on the routed simulator fail on fine A in > 30 % of cases |

Negative result that would be *central*, not a failure of the programme (owner directive): if
the constructed fine levels differ from the published medium level *everywhere* rather than in
a structured way, uniform fine wins and V1 confirms V0's conditional finding ("adaptive
fidelity is useful only when approximation error has exploitable structure") on a real
parameterisation.

## 2. System, hierarchy, adjudication (ADR-0007; fixed)
- Membrane: Günay 2015 isopotential aCC motoneuron, ported verbatim (`v1/systems/gunay2015.py`).
- Levels per channel: 2 = fine (constructed Markov, `hierarchy/gunay2015_fine.json`, level A);
  1 = medium (published HH, never fitted); 0 = coarse (instantaneous activation, Kf slow
  inactivation dropped). Ks and NaP have exact HH-equivalent chains: **negative-control
  channels** (refining them can never reduce error; their labelled gains are the noise floor).
- Q10 = 3 on every rate (all levels); E_K shifts with [K⁺]o by the Nernst term; both inert at
  25 °C / 5 mM.
- Fit family (declared, excluded from evaluation protocols): activation steps −30, −20, 0, +20,
  +40 mV from −90 mV (Kf; the −40 mV step carries < 0.01 pA and was dropped as pure noise);
  200-ms prepulses −80…−10 mV; twin-pulse recovery gaps 5, 20, 50, 150 ms;
  steady-state holds at −70, −60, −55, −50 mV followed by a test step (Kf: +20 mV; these pin the
  availability at rest-like potentials, without which a scheme can satisfy the −90 mV protocols
  while being inactivated at rest); NaT: steps −40…+20 mV, prepulses −90…−30 mV, gaps 1, 3, 10,
  30 ms, the same holds with a −10 mV test; and, for both channels, an **action-potential clamp**:
  the published model's own voltage trajectory under the 10 pA step (10–60 ms, 0.2-ms segments)
  applied as the command, weighted as four step protocols, so that the constructed schemes are
  constrained in the physiological regime (rest → spike → afterhyperpolarisation) that step
  families from −90 mV do not cover. Residuals are normalised per protocol by the peak
  current and by the number of samples where the target current is non-negligible (> 2 % of
  peak), so that short test pulses are not diluted by silent samples. Fit floors (RMS over
  active samples; `hierarchy/gunay2015_fine.json`): level A Kf 5.1 % (sequential two-step
  topology, coupled inactivation), NaT 5.9 % (coupled, closed-state recovery); level B Kf
  9.5 % (ZHA concerted-opening topology), NaT 6.0 % (open-state-only, slow state) — superseded
  by the AP-clamp-constrained set: **level A Kf 5.1 % (3.3 % under the spike waveform), NaT
  2.5 % (Kuo–Bean coupled chain, coupling fixed at 3 per activation step by design); level B
  Kf 9.7 % (3.5 % under the spike waveform), NaT 6.3 %.** The NaT coupling is a design choice
  (a free coupling collapses onto the HH gate); a = 2 and a = 5 variants are robustness checks
  reported with the results (ADR-0007 amendments).
- Level A truth: all channels fine at LSODA rtol 1e-9 / atol 1e-11 (Radau at the same tolerance
  agrees to 1e-4 mV and identical spike times on the 530-ms current-clamp protocol at 7.5× the
  cost; the working simulator at rtol 1e-6 differs from it by 0.03 mV). Level B truth: the
  alternate-topology fine levels (`Kf_B`, `NaT_B`) at the same tolerance. Level C: the
  published/independent anchors of the medium level (reproduction report), reporting only.
- Working simulator: LSODA rtol 1e-6 / atol 1e-8, max step 0.5 ms, for every level.

## 3. Episodes
- Instance variability: log-normal jitter of every conductance (CV 0.2) and of every kinetic
  scale key (CV 0.1), identical at every level; the router sees the nominal model plus the
  intervention, never the instance.
- ID intervention families (ranges in `gunay2015_profile.py`): none; density (one channel,
  ×0.3–×2); kf_loss (×0–×0.5); kf_inactivation (×0.2–×3); kf_recovery (×0.3–×3);
  nat_inactivation (×0.3–×3); temperature (15–30 °C); k_out (2–15 mM).
- OOD families (never in training): block (state-dependent open-channel block of Kf;
  concentration 0.2–3); opening_step (concerted step ×0.3–×3; cheap levels scale τ_m);
  combo (two perturbations); activation_rate (Kf activation ×0.5–×2).
- Protocol/target groups per episode: vclamp_Kf (step to −30/−10/+10/+30 mV from −90;
  targets peak_current, time_to_peak, charge of I_Kf); recovery_Kf (gap 10/30/100 ms;
  recovery_fraction); vclamp_NaT (step to −30/−20/0 mV; peak_current, time_to_peak, charge
  of I_NaT); cclamp (Günay protocol, I_pulse ∈ {−1, 0, 5, 10, 20, 40} pA absolute;
  spike_latency, spike_count, min_isi, mean_v, v_rmse). Protocol parameters are drawn per
  episode; every group is evaluated for every episode.
- Tolerance (per target): relative 0.05 of |truth|, with absolute floors spike_latency 0.5 ms,
  spike_count 0.5, min_isi 1 ms, mean_v 1 mV, v_rmse 1 mV, time_to_peak 0.1 ms,
  recovery_fraction 0.02.

## 4. Labels (hidden ground truth)
- For every (episode, group, target): error of the base (medium) run and of every refinement
  subset; marginal gains ΔE_c, pairwise interactions, minimal set at tolerance; all relative to
  the Level-A truth.
- **Noise-floor rule:** a gain smaller than 2 × the fine-vs-reference numerical error of that
  target counts as zero; a minimal set is "empty" when the base error is within tolerance.
- Subsets: the pilot labels all 2⁴ subsets. **Main-run rule (fixed now):** if the pilot shows
  that the Ks and NaP gains are within the noise floor for ≥ 99 % of labels, the main run
  labels the 2² subsets over {Kf, NaT}, assigns Ks/NaP refinement zero gain, and takes their
  refinement cost from one measured fine-Ks / fine-NaP run per group (a policy that refines
  them pays that cost). Otherwise the main run stays exhaustive.
- Sensitivity features (adjoint surrogate) use one extra medium run per channel (+5 %
  conductance) and are charged to the policies that use them.

## 5. Cost
- Principal axis: nominal cost = Σ over solver calls of (RHS evaluations × state dimension).
  Secondary (reported alongside): measured wall time, RHS evaluations, number of fine calls,
  router inference time per decision, memory (max RSS), and training cost (separately).
- Regimes: single-query (training cost included) and amortised (training cost excluded,
  reported with the number of queries at which the two regimes break even).
- Every policy's cost includes the runs it needs to decide (medium base run, coarse run for
  discrepancy monitors, sensitivity runs).

## 6. Policies (comparison conditions), evaluated by exact lookup of labelled subsets
uniform_coarse, uniform_medium, uniform_fine; random; share (current-share rule);
discrepancy (medium-vs-coarse per-channel discrepancy, FLARE-style trigger); sensitivity
(sensitivity × discrepancy, adjoint / goal-oriented surrogate — the principal written-rule
competitor); novelty (distance to training features, DynIm-style); uncertainty (ensemble
spread of the VoC regressor, AdaLED-style trigger); uncertainty_per_cost; fullstate_voc
(learned VoC with a trajectory-error objective, HyPER-style, causal-blind ablation); hardlabel
(V0-style minimal-set classifier); **voc** (learned target-conditioned VoC, one-shot);
**hybrid** (physics candidates ranked by the learned VoC); voc_seq, hybrid_seq (sequential:
refine one channel at a time, re-featurise, stop when predicted VoC < threshold); oracle and
oracle_voc (hidden-truth bounds). One-shot and sequential are **separate conditions**; no
claim of the form "one-shot or sequential wins" is made.

## 7. Operating points and threshold selection
- Operating points: 15 %, **30 % (principal)**, 50 % of the uniform-fine nominal cost.
- Each policy's threshold sweep is run on the validation split (last 20 % of the training
  seeds); the threshold attaining each budget on validation is applied unchanged to the test
  set. No threshold is chosen on test or OOD data.
- Selection metrics (per decision): precision, recall, waste (refined but not needed), miss
  (needed but not refined) against the minimal sets; reported at equal recall for H3-V1.

## 8. Statistics
- Test set: paired bootstrap over episodes (B = 2000), 95 % percentile intervals of paired
  differences in mean error/tolerance at each operating point.
- Multiplicity: three operating points per hypothesis and condition → Holm correction; a
  hypothesis passes only through its principal operating point after correction.
- Minimum effect size for H1-V1: ≥ 20 % relative error reduction at the principal point.
- A reserved evaluation set (§10) is evaluated once, after all analyses, and reported as a
  separate line; the main claims are made on the test set.

## 9. OOD handling (first-class experiment)
Detectors, all fitted on training/validation ID data only, thresholds fixed at 95 % ID
coverage: range guard (feature support); kNN density in feature space; conformal
nonconformity on VoC residuals (exchangeability assumed and stated); medium-vs-coarse
discrepancy monitor (mechanistic); ensemble standard deviation (expected failed baseline).
Reported per OOD family: AUROC vs ID test, `false_safe_rate` (confident use of the cheap
prediction when the minimal set was non-empty), coverage, error conditional on "safe",
fallback cost. A planted-shift table says which detector should and should not fire for each
family, written before the run: range guard fires for block (block_frac feature outside
range) and combo; density for opening_step and combo; discrepancy for block and
opening_step; ensemble spread predicted to fail on opening_step.

## 10. Seeds and sizes
- Pilot: seeds 10 000+ (train 120), 20 000+ (test 60), 30 000 + 1000·i (OOD 30 per family),
  run id `v1_gunay_pilot`.
- Main: seeds 110 000+ (train 400), 120 000+ (test 200), 130 000 + 1000·i (OOD 60 per family),
  reserved 140 000+ (100 ID episodes), run id `v1_gunay_main`. Sizes may be reduced only for
  compute reasons, before the main run, and the reduction is recorded in §16.
- Validation split: the last 20 % of training seeds.

## 11. Failed runs
An episode whose truth or base integration fails is dropped and counted per family; a failure
rate above 2 % in any family stops the run for investigation before results are read.

## 12. Cross-formulation tests (Level B)
Routers and surrogates trained under A are evaluated on the test seeds re-labelled under B
(same instances, interventions, protocols; B truth). Reported: selection precision/recall under
B, error at the principal operating point under B, H5 `false_safe_rate` under B.

## 13. Level C
Published/independent anchors of the medium level (reproduction report) are reported, not
used for training, thresholds or claims about the fine level.

## 14. Pilot → audit → corrections (before the freeze of v1.1)
Pilot audit checklist: (i) no feature uses fine-level runs; (ii) negative-control gains within
the noise floor (else the labels are numerically unsound); (iii) fraction of labels with a
non-empty minimal set per target and family (the experiment is uninformative if < 10 % or
> 90 %; the tolerance is then re-set *before* the main run and recorded here); (iv) timing per
episode and projected main-run cost; (v) detector sanity on planted shifts; (vi) seeds and
provenance. Corrections are appended here with the pilot commit hash.

### Pilot audit record (v1_gunay_pilot, 120 / 60 / 4×30 episodes, run 2026-09-15 02:02–05:35 UTC; pilot commit `973a19e`)
Audit outputs: `results/v1_gunay_pilot/before_corrections/` (audit.md, verdicts.md, summary.json,
figures as first computed) and `results/v1_gunay_pilot/` after the corrections below.
- (i) leakage: structural check passed (features come from cheap runs, descriptors and cost
  increments; partial-state rows use refined cheap runs the policy has paid for).
- (ii) negative controls: Ks/NaP refinement appeared in 0.3 % of minimal sets; 91.8 % of their
  gains were within 2× the numerical floor and 100 % within max(2× floor, 1 % of tolerance)
  (the numerical floor is ~1e-8 in target units, so "2× floor" alone is stricter than any
  meaningful noise level). **Correction 1:** the noise floor is max(2× numerical floor, 1 % of
  the tolerance); with it the §4 main-run rule applies: labels over the 2² subsets of
  {Kf, NaT}, Ks/NaP charged their single-refinement increments (`routable: [Kf, NaT]`).
- (iii) informativeness: non-empty minimal sets per ID target: time_to_peak 0.51, charge 0.62,
  recovery_fraction 0.83, spike_latency 0.45, spike_count 0.54, min_isi 0.29, mean_v 0.14,
  v_rmse 0.68 — informative; **peak_current 0.93 (flagged)**: the constructed fine levels'
  peak-current floors (Kf 5 %, NaT 2.5 % RMS; 10–15 % maxima) exceed a 5 % tolerance almost
  always. **Correction 2:** the relative tolerance for `peak_current` is 10 % (75 % non-empty at
  10 %, 45 % at 15 % in the pilot; 10 % is the smallest value inside the informative band).
  All other tolerances unchanged.
- (iv) timing: 148 s per episode (88 simulations; truth 29 s); main run projected 9.6 h
  exhaustive / ~6 h with the routable rule on 4 processes.
- (v) detectors vs planted shifts (per-row AUROC vs ID): range guard 1.00 on opening_step and
  activation_rate (their rate-scale descriptors are outside the training range — detection by
  descriptor, not by dynamics), 0.58 block, 0.66 combo; kNN density 0.23–0.30 on the
  descriptor-only shifts (*worse than chance*: the prediction that kNN would fire on
  opening_step/combo is not supported), 0.70 combo; ensemble spread 0.45–0.55 (fails, as
  predicted); discrepancy monitor ~0.5 (the medium-vs-coarse discrepancy does not respond to
  these shifts); conformal ~0.5. Recorded; no change to the detector set.
- Machinery defect found by the dress-rehearsal verdicts: the VoC regressor's raw-gain target
  (zero-inflated: 72 % zeros; heavy-tailed: 99th percentile 8 tolerance units, maximum 118) gave
  R² = −3.6 on test rows while its ranking was usable (AUROC 0.90 against the minimal-set
  label), and the V0-style hard-label classifier dominated it at every operating point.
  **Correction 3:** the regression label is log1p(max(gain, 0) / tolerance) — gains in
  tolerance units, log-compressed — and the tolerance is a router input; predictions are
  gains in tolerance units and the VoC rule is (gain / tolerance) / cost, applied identically
  to the oracle. Thresholds remain selected on the validation split only.
- **Correction 4 (threshold grids):** the dress rehearsal with corrections 1–3 showed the
  validation-selected operating points under-spending their budgets (e.g. cost 0.109 for the
  0.15 budget) because the VoC threshold grid had two points per decade; the grids are now
  49 log-spaced thresholds over 1e-8…1e-2 (plus 0) and 27 trigger fractions. Grid resolution
  only; selection remains on validation.
- Corrections 1–4 change labels/rules/grids only; the cached pilot simulations were relabelled
  under them (`run.py --relabel`, persisted, no new simulation) and the analysis stages re-run;
  the pre-correction outputs are kept. No main-run seed has been touched.

## 15. Advancement criteria (V2)
Move toward a *Drosophila* circuit rung (Augustin 2019 giant-fibre lineage / MaleCNS) only if
H1-V1 and H5-V1 pass and ID `false_safe_rate` ≤ 0.05; otherwise V1 is reported as a limiting
result and the next step is a second real parameterisation (Level-B-style) rather than a larger
system.

## 16. Freeze record
- **v1.1 freeze: 2026-09-15 05:57 UTC, freeze commit `32a39d1`** (on top of `36ed0c6`, the corrected
  pilot outputs). Clerical amendment after the freeze: the time stamp first written as 06:05 was
  corrected to the commit's actual time; no protocol content changed.
- Hierarchy: `experiments/v1_channel/hierarchy/gunay2015_fine.json` as committed at the freeze —
  level A Kf 5.1 % (3.3 % under the spike waveform), NaT 2.5 % (coupling a = 3 fixed by design);
  level B Kf 9.7 %, NaT 6.3 % (RMS over active samples on the fit family).
- Pilot corrections 1–4 (§14) are part of the frozen protocol. Tolerances: 5 % relative with the
  absolute floors of §3, except peak_current 10 %. Noise floor max(2× numerical floor, 1 % of
  tolerance). Main-run labelling over the {Kf, NaT} subsets with Ks/NaP charged their measured
  single-refinement increments. Reference integrator LSODA rtol 1e-9 / atol 1e-11.
- Main-run configuration: `experiments/v1_channel/config_gunay_main.yaml` — seeds offset 100 000
  (train 110 000+, test 120 000+, OOD 130 000 + 1000·i, reserved 140 000+), sizes 400 / 200 /
  4×60 / 100. **No main-run seed has been simulated before this freeze** (the pilot used offsets
  0; the smoke used the pilot streams at reduced sizes).
- Dress rehearsal on the pilot (not a result; 120 training episodes): the learned one-shot
  VoC router was at parity with the V0-style hard-label classifier at the 50 % budget and
  behind the AdaLED-style ensemble-uncertainty trigger at 15 % and 30 %; selection precision at
  equal recall was 2.0–2.5× the discrepancy and sensitivity baselines'. These numbers set no
  threshold and change no criterion; the main run decides H1-V1 and H3-V1 as written.
- Main run launched 2026-09-15 05:57:45 UTC (`config_gunay_main.yaml`, 4 processes).
- **Post-hoc changes** (all made 2026-09-15 08:45–09:30 UTC, while the main run was still in its
  generation stage and before any main-run result existed; none touches a seed, a threshold, an
  operating point or an H1/H3 criterion):
  1. *H10 damage is functionally inert in the published model.* A probe on the pilot machinery
     showed that removing Kf completely leaves the 10 pA current-clamp response of the published
     model unchanged (authors' Euler integrator: 45 spikes, first spike 23.20 ms with G_Kf = 24.1
     nS and with G_Kf = 0; peak |I_Kf| ≈ 3.7 pA against ≈ 34 pA for Ks and ≈ 430 pA for NaT), and
     that this holds at every hold (−12 … −50 pA) and step (−2 … +20 pA) tried and for the
     jittered cell instances of the main configuration. The pilot restoration check (4 instances)
     had 4/4 damaged phenotypes within tolerance. H10-V1 as preregistered is therefore reported
     as **not testable on this model** unless the main-run instances contain functionally damaged
     cases; the verdict rule is unchanged and is evaluated over *functionally damaged* instances
     (damaged phenotype outside tolerance), which is what "damaged instances" must mean.
     Consequently the ID intervention family `kf_loss` is expected to behave like `none` for the
     current-clamp groups (it still scales the Kf currents in the voltage-clamp groups); this is
     an observation about the published model, not a protocol change.
  2. *Exploratory H10 variant (not a preregistered verdict).* `restoration.py --damage nat_loss`:
     NaT conductance × f, f ~ U(0.75, 0.95) (a *para*-hypomorph-like loss of excitability; × 0.7
     already silences most instances at 10 pA), compensation searched over Ks, Kf, NaP density
     and the NaT inactivation rate (never NaT density, the trivial fix). The same rule as H10-V1
     is applied and reported separately, labelled post-hoc exploratory.
  3. *Restoration protocol clarifications (both variants):* instances whose wild type fires fewer
     than 3 spikes at the design protocol are skipped (nothing to restore); the search is skipped
     when the damaged phenotype is within tolerance (x = 0 is then trivially optimal); the routed
     search uses the one-shot router's parameter at the preregistered principal operating point
     (from `verdicts.json`, chosen on validation) instead of the script's earlier fixed 1e-6; the
     search also records whether the routed simulator itself believed the candidate restored, so
     the falsification clause "restorations found on the routed simulator fail on fine A" is
     computable; instances run in parallel; 16 instances for the exploratory variant.
  4. *H5-V1 detector choice "on validation ID data only" made explicit:* the surrogate is re-fitted
     deterministically on the same split and the gates are scored on the validation split; the
     chosen gate is the one with the highest validation coverage among those with validation
     `false_safe_rate` ≤ 0.05 (the hypothesis' own ID target), else the lowest validation
     `false_safe_rate`. (A gate that never trusts the surrogate satisfies the target trivially and
     is chosen only when nothing else does.) Clause 4 reads "post-fallback error within tolerance"
     as the mean post-fallback error ≤ 1 tolerance unit on every OOD family.
  5. *H8-V1 / H9-V1 computations made explicit* (`verdicts_extended.py`): H8 error = mean
     error/tolerance over paired (episode, group, target) rows per OOD family with the paired
     bootstrap of §8; "detects its own invalidity" = rank AUROC of the gate score for error >
     tolerance on the pooled OOD rows (hybrid discrepancy monitor vs emulator ensemble spread).
     H9 "falls below the physics baselines'" is read as below the best of share / discrepancy /
     sensitivity under B at their own 30 % points; precision at equal recall is reported alongside
     as a supplementary (not decisive) comparison, as in H3-V1.
  6. *Reserved set:* reported by `verdicts_extended.py` as a replication line at the operating
     points already selected on validation (no new selection).

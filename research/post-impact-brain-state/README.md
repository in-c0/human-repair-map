# Post-Impact Brain State Observatory — Research 01

Tracking issue: [#41](https://github.com/in-c0/human-repair-map/issues/41).
Status: **research design + one synthetic smoke test. No clinical, retrospective or
prospective validation has been done.** Nothing here supports a diagnosis,
sideline clearance or return-to-play decision.

## Objective
After an impact has already happened, identify and quantify the physical, cellular,
electrical, vascular, metabolic, inflammatory, structural and functional changes in the brain.
A clinical concussion label is not ground-truth tissue injury. Impact prevention is out of
scope for this workstream.

## Evidence base (checked 2026-11-15)
| Source | What it supports | Checked how |
|---|---|---|
| Patricios et al., *Consensus statement on concussion in sport: 6th International Conference, Amsterdam, Oct 2022*, BJSM, Jun 2023. [doi:10.1136/bjsports-2023-106898](https://doi.org/10.1136/bjsports-2023-106898) | SCAT6 is a multimodal clinical assessment. Advanced imaging and fluid biomarkers are research tools, not standalone diagnostic tests. | DOI resolved via Crossref |
| [NINDS TBI Common Data Elements](https://commondataelements.ninds.nih.gov/Traumatic%20Brain%20Injury) | Standard variables for acquisition, outcomes, provenance and clinical assessment | Page reachable (HTTP 200) |
| [FITBIR study page notice](https://fitbir.nih.gov/study_profile/220) | Archive availability is shrinking (see correction below) | Notice text read |

**Correction to the issue text.** The issue says that "FITBIR operations close 2026-12-31".
That date was not found. The FITBIR notice read on 2026-11-15 says three things: from
2026-08-24, FITBIR hosts data only from NIH-funded studies; data from other organisations is no
longer publicly available; and it no longer accepts new submissions, except for studies that
have programmatic approval. The repository is "under review for potential modification".
Practical rule: do not plan work that depends on long-term FITBIR access.

## Phenomenon → observable → limitation
| Phenomenon | Candidate observation | Critical ambiguity |
|---|---|---|
| Mechanical tissue strain | MR elastography / physics reconstruction | Real-time internal strain unobserved during field impact |
| Membrane / ionic dysregulation | EEG/ERP and molecular proxies | Scalp potentials do not identify membrane damage |
| Axonal microstructure | Diffusion MRI | Not injury-specific; not sideline deployable |
| Network dysfunction | EEG/ERP, evoked responses | Fatigue, motion artefacts, baseline variability |
| Metabolic dysfunction | MR spectroscopy / PET | Temporal and spatial constraints |
| Neurovascular coupling | EEG + fNIRS / Doppler | Exertion and systemic physiology confound |
| Blood-brain barrier | Contrast imaging / fluid proxies | Timing and specificity |
| Inflammation | Blood biomarkers / PET | Peripheral inflammation confounds |
| Cellular injury | GFAP, UCH-L1, NfL | Release/transport delays; a negative test does not exclude concussion |
| Functional impairment | Ocular, vestibular, balance, cognition | Non-brain injury confounders |

## Falsifiable hypotheses (may coexist)
H01 shared core pathophysiology · H02 heterogeneous mechanisms · H03 pre-symptomatic measurable
changes · H04 dynamic evoked responses outperform resting measures · H05 structure/function
dissociation · H06 independent modalities add information · H07 individual baselines improve
inference · H08 early trajectories predict outcome.

## Research design
1. Build a causal graph linking impact, latent tissue state, observed measurements,
   confounders and clinical outcomes. Keep the clinical label separate from biological
   ground truth.
2. Survey open EEG/ERP, fNIRS, neuroimaging and longitudinal mTBI datasets. Verify access,
   licence, cohort, time from injury and labels before selecting any of them.
3. Synthetic identifiability experiment (Experiment 01, below).
4. Compare resting with evoked responses, and population with within-person baselines.
   Use leakage-free, participant-held-out validation.
5. Report each of these separately: sensitivity, specificity, calibration, abstention,
   uncertainty, external validation, clinical reference limitations and outcome prediction.

## Dataset accessibility audit (in progress)
| Dataset | Modality / task | Cohort | Licence / access | Verified |
|---|---|---|---|---|
| [OpenNeuro ds003522 v1.1.0](https://openneuro.org/datasets/ds003522) "EEG: Three-Stim Auditory Oddball and Rest in Acute and Chronic TBI" (Cavanagh & Quinn), [doi:10.18112/openneuro.ds003522.v1.1.0](https://doi.org/10.18112/openneuro.ds003522.v1.1.0) | EEG; 3-stimulus auditory oddball + rest | 96 participants in `participants.tsv`: 44 mTBI, 27 control, 25 chronic TBI | CC0; open download, ~27 GB | OpenNeuro API + `participants.tsv`/`.json` read 2026-11-15 |
| FITBIR | Multi-modal TBI archive | — | Restricted; NIH-funded data only from 2026-08-24 | Notice read 2026-11-15 |

Still to check for ds003522 before use: time from injury per participant (the issue's
candidate literature describes subacute testing within ~2 weeks; not yet confirmed from the
files), repeated sessions, and whether the controls are matched. More candidates to audit:
fNIRS and diffusion-MRI mTBI sets.

ds003522 bears on H04 (evoked vs resting). It cannot bear on tissue-level ground truth:
its labels are clinical.

## Experiment 01 — synthetic identifiability smoke test
Script: [`identifiability_01.py`](identifiability_01.py) (NumPy, seed 42, n = 20,000:
14,000 train, 6,000 holdout). Two independent latents x1, x2 ~ N(0,1). Sensor A = x1 + x2 + noise
(SD 0.2), sensor B = x1 − x2 + noise (SD 0.2). OLS predicts x1.

| Inputs | Holdout R² |
|---|---|
| Sensor A only | **0.482** |
| Sensor A + B | **0.981** |

First run 2026-11-15 (issue comment); re-run 2026-11-15 on Python 3.13 / NumPy 2.5.3,
same numbers. Interpretation: under the *assumed* linear model, an independent observation
resolves an ambiguity that a single summed observation cannot. This does **not** show brain
injury, clinical sensitivity or specificity, or that such independent physical sensors exist.

Next gate: replace the synthetic mixing with independently supported sensor forward models and
realistic nuisance variables (fatigue, motion, exertion, peripheral inflammation).

## Safety and quality gates
- No standalone sideline clearance or return-to-play decision. A suspected concussion gets a
  clinical evaluation.
- Never claim that all concussion types are detected, or 99% accuracy, without prospective
  independent validation.
- No patient data collection without ethics approval, privacy protection and medical oversight.
- Always label which level a result is: hypothesis, simulation, retrospective evidence,
  prospective validation or clinical readiness.

## Checklist
- [x] Research scope and causal distinction documented
- [x] Phenomenon–observation matrix documented
- [x] Hypotheses and falsification protocol documented
- [x] Identifiability smoke test executed and reproducible (synthetic only)
- [ ] Full systematic evidence table with DOI, cohort, limitations and dates (3 sources checked)
- [ ] Dataset accessibility and licensing audit (1 open dataset verified; more to do)
- [ ] Identifiability with independently supported forward models
- [ ] Retrospective external validation
- [ ] Prospective clinical validation

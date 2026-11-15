# Nonlinear observability experiment 02 — nuisance distribution shift

**Status:** synthetic mathematical falsification experiment, locally executed on 2026-11-15. No clinical measurements and no medical diagnostic accuracy.

## Setup

Two independent latent variables `S1`, `S2` evolve with different exponential decay constants over synthetic times `t = 0, 2, 6`. The values are abstract state coordinates, **not** actual neuronal dynamics or concussion phenotypes. A shared nuisance variable `U` stands in for unmeasured exertion/temperature/physiological conditions.

Nonlinear sensor equations (per time point):
- `A_t = tanh(0.8*(S1_t + S2_t) + 0.65*U) + independent noise`
- `B_t = tanh(0.8*(S1_t - S2_t) + 0.65*U) + independent noise`
- `C_t = 2*A_t + extra noise` — redundant measurement
- `P = U + independent noise` — hypothetical separate measure of nuisance, **not a real sensor**

Training nuisance distribution: normal(mean 0, sd 0.4). IID test matches train. Out-of-distribution (OOD) nuisance is shifted to mean 2, sd 0.4. Test individuals are generated separately, with no subject leakage. Linear ridge regression predicts `S1, S2`. **No clinical labels.**

Run `python research/post-impact-brain/observability_shift.py` (NumPy >=1.22).

## Observed results, local run (three seeds, 5k train + 3k test each)

Values are held-out R² averaged across three seeds, shown as `(S1, S2)`. Negative R² means the model performs worse than using the test-set mean.

| Sensor observations | Same conditions (IID) | Changed nuisance (OOD) |
|---|---|---|
| A at t0 | (0.433, 0.425) | (-0.033, -0.031) |
| A + redundant C at t0 | (0.433, 0.425) | (-0.033, -0.032) |
| A + independent B at t0 | (0.819, 0.893) | (-0.673, 0.686) |
| A + B + nuisance proxy P at t0 | (0.889, 0.893) | (0.684, 0.686) |
| A at all 3 time points | (0.719, 0.705) | (-1.389, 0.323) |
| A + B at all time points | (0.861, 0.902) | (-0.206, 0.655) |
| A + B + P at all time points | (0.944, 0.902) | (0.481, 0.656) |

Sanity assertion passed: nuisance proxy increases S1 reconstruction R² under OOD shift for snapshot sensor A+B.

## Interpretation (bounded)

1. Redundant measurements contribute little independent information in this setup.
2. Even genuinely independent latent-state channels A and B are **not sufficient** to recover S1 reliably when a shared nuisance term shifts substantially outside the training distribution. Example: snapshot S1 R² shifts from +0.819 to -0.673.
3. Measuring the nuisance explicitly can improve robustness for S1, though it does not guarantee sufficient accuracy for any real use.
4. Adding more time points may improve IID state estimates but **does not automatically ensure OOD generalization**, especially with nonlinear saturation and shifts.
5. This experiment does **not** demonstrate anything about EEG, fNIRS, GFAP, eye tracking, or actual brain injury.

## What would refute the resulting research direction?

- Real sensors show no independent residual information after controlling for motion, fatigue, exercise, time since impact and patient baselines.
- External participant-held-out data show no calibration or discrimination improvement from additional modalities.
- A proposed perturbation changes signal strength but does not separate plausible latent states under physically constrained noise.
- Short-time measurements fail to predict independently adjudicated clinical outcomes beyond existing physician assessments.

## Next investigation

- Acquire small raw `on003522` subset and inspect BIDS participants + events to audit whether resting and ERP measurements are truly comparable.
- Derive candidate sensor forward models and their failure limits (EEG volume conduction, optical/ultrasound skull attenuation, blood marker transport delays).
- Quantify conditional mutual information and observability rank / Fisher information with realistic shared noise rather than fabricated 'concussion accuracy'.
- Collaborate with clinical investigators for any prospective post-impact measurements.

See [DATASET_AUDIT.md](DATASET_AUDIT.md) and [Issue #41](https://github.com/in-c0/human-repair-map/issues/41).

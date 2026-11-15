# Post-impact brain observability — experiment 01

## Intent
After a collision, identify which latent brain-state variables could in principle be reconstructed from measured signals. This is **not** a concussion classifier or clinical diagnostic test.

## Reproduction
Python 3 and NumPy. Run `python research/post-impact-brain/observability_experiment.py`.

Executed locally on 2026-11-15 with seed 20261115, 30,000 synthetic observations (21,000 training / 9,000 test):

| Measurements | Held-out R² |
|---|---:|
| A only (sum of two latent dimensions) | 0.4789 |
| A + redundant C | 0.4787 |
| A + independent B (difference) | 0.9561 |
| A + B + C | 0.9561 |

## Interpretation and caveats
The result illustrates *structural identifiability*: a second independent observation can resolve an ambiguity that a redundant measurement cannot. It does not establish that any real EEG, fNIRS, blood, ultrasound or other sensor can observe an independent brain-injury variable. R² is **not** sensitivity, specificity, or clinical diagnostic accuracy. Gaussian linear assumptions are intentionally simplistic. No patient data were used.

## Next falsification steps
1. Analyze a nonlinear, time-dependent forward model with correlated measurement noise and realistic nuisance variables.
2. Separate biological observability from clinical outcome prediction; test failure under domain shift.
3. Audit candidate datasets for real availability, license, time-since-impact, subject-level IDs, controls and reference standard; do not claim a dataset is usable before verification.
4. Only then evaluate whether any real modality provides independent information beyond exercise, fatigue, neck injury, vestibular dysfunction and baseline variability.

Related issue: #41.

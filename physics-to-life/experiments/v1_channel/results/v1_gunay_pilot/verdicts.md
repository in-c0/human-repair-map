# Preregistered verdicts — v1_gunay_pilot

Validation split: last 24 training episodes; test rows: 720; bootstrap B = 2000; Holm over 3 operating points.

## Condition: one_shot
### voc
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 7.5e-05 | 0.125 | 1.299 | 0.65 | 0.70 | 0.37 | uncertainty | 0.179 | 7.25 | +1.120 [+0.966, +1.282] | 0.000 |
| 0.3 | yes | 1.33e-05 | 0.310 | 0.306 | 0.90 | 0.63 | 0.83 | uncertainty | 0.179 | 1.71 | +0.127 [+0.074, +0.187] | 0.000 |
| 0.5 | yes | 2.37e-07 | 0.541 | 0.010 | 1.00 | 0.32 | 1.00 | hardlabel | 0.016 | 0.65 | -0.005 [-0.015, +0.005] | 0.278 |
H1-V1: **falsified** (principal ratio 1.7075032045014247, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.8258823529411765, "learned_precision": 0.6335740072202166, "baseline_precision_at_equal_recall": 0.2533040758676352, "ratio": 2.5012388965714574}, "sensitivity": {"recall_at_principal": 0.8258823529411765, "learned_precision": 0.6335740072202166, "baseline_precision_at_equal_recall": 0.315625, "ratio": 2.0073631911927654}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': False}

### hybrid
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 4.22e-05 | 0.134 | 1.076 | 0.62 | 0.66 | 0.35 | uncertainty | 0.179 | 6.00 | +0.896 [+0.781, +1.018] | 0.000 |
| 0.3 | yes | 1.33e-06 | 0.285 | 0.587 | 0.79 | 0.41 | 0.64 | uncertainty | 0.179 | 3.28 | +0.408 [+0.315, +0.516] | 0.000 |
| 0.5 | yes | 1.33e-06 | 0.285 | 0.587 | 0.79 | 0.41 | 0.64 | hardlabel | 0.016 | 37.20 | +0.571 [+0.468, +0.679] | 0.000 |
H1-V1: **falsified** (principal ratio 3.2760141617927907, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.6423529411764706, "learned_precision": 0.41363636363636364, "baseline_precision_at_equal_recall": 0.2763285024154589, "ratio": 1.496900826446281}, "sensitivity": {"recall_at_principal": 0.6423529411764706, "learned_precision": 0.41363636363636364, "baseline_precision_at_equal_recall": 0.3726437542075817, "ratio": 1.1100048208669209}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': True}

## Condition: sequential
### voc_seq
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 7.5e-05 | 0.125 | 1.299 | 0.65 | 0.70 | 0.37 | uncertainty | 0.179 | 7.25 | +1.120 [+0.966, +1.282] | 0.000 |
| 0.3 | yes | 1.33e-05 | 0.320 | 0.306 | 0.90 | 0.64 | 0.83 | uncertainty | 0.179 | 1.71 | +0.127 [+0.074, +0.187] | 0.000 |
| 0.5 | yes | 1.78e-06 | 0.526 | 0.061 | 0.98 | 0.45 | 0.96 | hardlabel | 0.016 | 3.89 | +0.046 [+0.020, +0.075] | 0.000 |
H1-V1: **falsified** (principal ratio 1.7075032046582816, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.8258823529411765, "learned_precision": 0.6370235934664247, "baseline_precision_at_equal_recall": 0.2533040758676352, "ratio": 2.51485725716985}, "sensitivity": {"recall_at_principal": 0.8258823529411765, "learned_precision": 0.6370235934664247, "baseline_precision_at_equal_recall": 0.315625, "ratio": 2.0182925733589694}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': False}

### hybrid_seq
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 4.22e-05 | 0.136 | 1.076 | 0.62 | 0.66 | 0.35 | uncertainty | 0.179 | 6.00 | +0.896 [+0.781, +1.018] | 0.000 |
| 0.3 | yes | 1.78e-06 | 0.305 | 0.588 | 0.79 | 0.43 | 0.64 | uncertainty | 0.179 | 3.28 | +0.408 [+0.315, +0.516] | 0.000 |
| 0.5 | yes | 4.22e-07 | 0.450 | 0.587 | 0.79 | 0.29 | 0.64 | hardlabel | 0.016 | 37.18 | +0.571 [+0.467, +0.679] | 0.000 |
H1-V1: **falsified** (principal ratio 3.2789220138032507, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.6423529411764706, "learned_precision": 0.4305993690851735, "baseline_precision_at_equal_recall": 0.2763285024154589, "ratio": 1.5582879265844567}, "sensitivity": {"recall_at_principal": 0.6423529411764706, "learned_precision": 0.4305993690851735, "baseline_precision_at_equal_recall": 0.3726437542075817, "ratio": 1.155525523299949}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': True}

## false_safe_rate at the principal operating point
| policy | activation_rate | block | combo | id | opening_step |
|---|---|---|---|---|---|
| voc | 0.12 | 0.12 | 0.07 | 0.12 | 0.08 |
| voc_seq | 0.12 | 0.12 | 0.07 | 0.12 | 0.08 |
| hybrid | 0.26 | 0.39 | 0.20 | 0.23 | 0.23 |
| hybrid_seq | 0.27 | 0.41 | 0.23 | 0.25 | 0.25 |
| hardlabel | 0.16 | 0.21 | 0.16 | 0.15 | 0.29 |
| discrepancy | 0.12 | 0.17 | 0.13 | 0.12 | 0.15 |
| sensitivity | 0.30 | 0.25 | 0.32 | 0.29 | 0.30 |
| novelty | 0.99 | 0.97 | 0.52 | 0.81 | 1.00 |
| uncertainty | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| fullstate_voc | 0.01 | 0.00 | 0.00 | 0.02 | 0.00 |

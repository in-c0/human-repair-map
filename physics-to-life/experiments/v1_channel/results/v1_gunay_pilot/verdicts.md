# Preregistered verdicts — v1_gunay_pilot

Validation split: last 24 training episodes; test rows: 720; bootstrap B = 2000; Holm over 3 operating points.

## Condition: one_shot
### voc
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 0.0001 | 0.109 | 1.543 | 0.62 | 0.71 | 0.31 | uncertainty | 0.174 | 8.86 | +1.369 [+1.190, +1.561] | 0.000 |
| 0.3 | yes | 3e-05 | 0.219 | 0.593 | 0.78 | 0.67 | 0.62 | uncertainty | 0.174 | 3.40 | +0.419 [+0.348, +0.498] | 0.000 |
| 0.5 | yes | 3e-07 | 0.522 | 0.016 | 0.99 | 0.33 | 0.99 | hardlabel | 0.016 | 1.01 | +0.000 [-0.011, +0.012] | 0.994 |
H1-V1: **falsified** (principal ratio 3.404332991248555, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.6211764705882353, "learned_precision": 0.6717557251908397, "baseline_precision_at_equal_recall": 0.276555023923445, "ratio": 2.4290129163475}, "sensitivity": {"recall_at_principal": 0.6211764705882353, "learned_precision": 0.6717557251908397, "baseline_precision_at_equal_recall": 0.4467005076142132, "ratio": 1.5038167938931297}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': False}

### hybrid
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 0.0001 | 0.092 | 1.707 | 0.56 | 0.73 | 0.21 | uncertainty | 0.174 | 9.80 | +1.533 [+1.341, +1.736] | 0.000 |
| 0.3 | yes | 1e-06 | 0.297 | 0.587 | 0.79 | 0.39 | 0.64 | uncertainty | 0.174 | 3.37 | +0.413 [+0.318, +0.519] | 0.000 |
| 0.5 | yes | 1e-06 | 0.297 | 0.587 | 0.79 | 0.39 | 0.64 | hardlabel | 0.016 | 37.18 | +0.571 [+0.467, +0.679] | 0.000 |
H1-V1: **falsified** (principal ratio 3.370108653511681, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.6423529411764706, "learned_precision": 0.3877840909090909, "baseline_precision_at_equal_recall": 0.276555023923445, "ratio": 1.402195069204152}, "sensitivity": {"recall_at_principal": 0.6423529411764706, "learned_precision": 0.3877840909090909, "baseline_precision_at_equal_recall": 0.37381300904552783, "ratio": 1.0373745202159657}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': True}

## Condition: sequential
### voc_seq
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 0.0001 | 0.109 | 1.543 | 0.62 | 0.71 | 0.31 | uncertainty | 0.174 | 8.86 | +1.369 [+1.190, +1.561] | 0.000 |
| 0.3 | yes | 3e-05 | 0.221 | 0.593 | 0.78 | 0.67 | 0.62 | uncertainty | 0.174 | 3.40 | +0.419 [+0.348, +0.498] | 0.000 |
| 0.5 | yes | 3e-06 | 0.435 | 0.097 | 0.97 | 0.52 | 0.95 | hardlabel | 0.016 | 6.14 | +0.081 [+0.043, +0.131] | 0.000 |
H1-V1: **falsified** (principal ratio 3.404332991248555, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.6211764705882353, "learned_precision": 0.6717557251908397, "baseline_precision_at_equal_recall": 0.276555023923445, "ratio": 2.4290129163475}, "sensitivity": {"recall_at_principal": 0.6211764705882353, "learned_precision": 0.6717557251908397, "baseline_precision_at_equal_recall": 0.4467005076142132, "ratio": 1.5038167938931297}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': False}

### hybrid_seq
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 0.0001 | 0.092 | 1.707 | 0.56 | 0.73 | 0.21 | uncertainty | 0.174 | 9.80 | +1.533 [+1.341, +1.736] | 0.000 |
| 0.3 | yes | 3e-06 | 0.278 | 0.592 | 0.79 | 0.49 | 0.64 | uncertainty | 0.174 | 3.40 | +0.417 [+0.324, +0.523] | 0.000 |
| 0.5 | yes | 1e-06 | 0.372 | 0.587 | 0.79 | 0.36 | 0.64 | hardlabel | 0.016 | 37.18 | +0.571 [+0.467, +0.679] | 0.000 |
H1-V1: **falsified** (principal ratio 3.3971199896786692, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.6423529411764706, "learned_precision": 0.4918918918918919, "baseline_precision_at_equal_recall": 0.276555023923445, "ratio": 1.778640231927429}, "sensitivity": {"recall_at_principal": 0.6423529411764706, "learned_precision": 0.4918918918918919, "baseline_precision_at_equal_recall": 0.37381300904552783, "ratio": 1.3158768688865585}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': True}

## false_safe_rate at the principal operating point
| policy | activation_rate | block | combo | id | opening_step |
|---|---|---|---|---|---|
| voc | 0.31 | 0.40 | 0.25 | 0.34 | 0.32 |
| voc_seq | 0.31 | 0.40 | 0.25 | 0.34 | 0.32 |
| hybrid | 0.25 | 0.34 | 0.17 | 0.22 | 0.22 |
| hybrid_seq | 0.29 | 0.44 | 0.26 | 0.28 | 0.27 |
| hardlabel | 0.16 | 0.21 | 0.16 | 0.15 | 0.29 |
| discrepancy | 0.11 | 0.17 | 0.12 | 0.11 | 0.15 |
| sensitivity | 0.30 | 0.25 | 0.32 | 0.29 | 0.30 |
| novelty | 0.99 | 0.97 | 0.52 | 0.81 | 1.00 |
| uncertainty | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| fullstate_voc | 0.01 | 0.00 | 0.05 | 0.03 | 0.05 |

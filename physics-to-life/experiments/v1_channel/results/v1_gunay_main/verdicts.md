# Preregistered verdicts — v1_gunay_main

Validation split: last 80 training episodes; test rows: 2400; bootstrap B = 2000; Holm over 3 operating points.

## Condition: one_shot
### voc
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 5.62e-05 | 0.146 | 1.461 | 0.70 | 0.72 | 0.45 | uncertainty | 0.166 | 8.81 | +1.295 [+0.844, +2.137] | 0.000 |
| 0.3 | yes | 1.78e-05 | 0.277 | 0.823 | 0.86 | 0.67 | 0.76 | uncertainty | 0.166 | 4.96 | +0.657 [+0.229, +1.479] | 0.000 |
| 0.5 | yes | 2.37e-07 | 0.516 | 0.040 | 0.99 | 0.29 | 0.99 | hardlabel | 0.036 | 1.10 | +0.004 [-0.017, +0.019] | 0.602 |
H1-V1: **falsified** (principal ratio 4.960755329476575, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.7550143266475645, "learned_precision": 0.6679340937896071, "baseline_precision_at_equal_recall": 0.2555673826706233, "ratio": 2.613534195208488}, "sensitivity": {"recall_at_principal": 0.7550143266475645, "learned_precision": 0.6679340937896071, "baseline_precision_at_equal_recall": 0.3097538173885946, "ratio": 2.1563385382000493}} crossing {'learned_better_at_0.15': True, 'written_not_worse_at_0.5': False}

### hybrid
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 4.22e-05 | 0.140 | 1.525 | 0.66 | 0.73 | 0.41 | uncertainty | 0.166 | 9.19 | +1.359 [+0.885, +2.222] | 0.000 |
| 0.3 | yes | 7.5e-07 | 0.312 | 0.581 | 0.83 | 0.35 | 0.72 | uncertainty | 0.166 | 3.50 | +0.415 [+0.328, +0.520] | 0.000 |
| 0.5 | yes | 4.22e-07 | 0.321 | 0.581 | 0.83 | 0.33 | 0.72 | hardlabel | 0.036 | 16.04 | +0.545 [+0.455, +0.650] | 0.000 |
H1-V1: **falsified** (principal ratio 3.502090758311788, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.7163323782234957, "learned_precision": 0.35161744022503516, "baseline_precision_at_equal_recall": 0.26038494514205845, "ratio": 1.3503754605828033}, "sensitivity": {"recall_at_principal": 0.7163323782234957, "learned_precision": 0.35161744022503516, "baseline_precision_at_equal_recall": 0.3097538173885946, "ratio": 1.13515127332207}} crossing {'learned_better_at_0.15': True, 'written_not_worse_at_0.5': True}

## Condition: sequential
### voc_seq
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 5.62e-05 | 0.147 | 1.461 | 0.70 | 0.72 | 0.45 | uncertainty | 0.166 | 8.81 | +1.295 [+0.844, +2.137] | 0.000 |
| 0.3 | yes | 1.78e-05 | 0.280 | 0.823 | 0.86 | 0.67 | 0.76 | uncertainty | 0.166 | 4.96 | +0.657 [+0.229, +1.479] | 0.000 |
| 0.5 | yes | 2.37e-06 | 0.489 | 0.118 | 0.97 | 0.46 | 0.94 | hardlabel | 0.036 | 3.25 | +0.082 [+0.052, +0.110] | 0.000 |
H1-V1: **falsified** (principal ratio 4.960755329476575, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.7550143266475645, "learned_precision": 0.6675110829639012, "baseline_precision_at_equal_recall": 0.2555673826706233, "ratio": 2.6118790120576274}, "sensitivity": {"recall_at_principal": 0.7550143266475645, "learned_precision": 0.6675110829639012, "baseline_precision_at_equal_recall": 0.3097538173885946, "ratio": 2.154972902647041}} crossing {'learned_better_at_0.15': True, 'written_not_worse_at_0.5': False}

### hybrid_seq
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 4.22e-05 | 0.140 | 1.525 | 0.66 | 0.73 | 0.41 | uncertainty | 0.166 | 9.19 | +1.359 [+0.885, +2.222] | 0.000 |
| 0.3 | yes | 2.37e-06 | 0.303 | 0.584 | 0.84 | 0.48 | 0.72 | uncertainty | 0.166 | 3.52 | +0.418 [+0.331, +0.523] | 0.000 |
| 0.5 | yes | 4.22e-07 | 0.441 | 0.579 | 0.84 | 0.32 | 0.72 | hardlabel | 0.036 | 15.98 | +0.543 [+0.453, +0.649] | 0.000 |
H1-V1: **falsified** (principal ratio 3.5181287404682835, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **passes** {"discrepancy": {"recall_at_principal": 0.7170487106017192, "learned_precision": 0.4782608695652174, "baseline_precision_at_equal_recall": 0.2604327524589316, "ratio": 1.8364083052135916}, "sensitivity": {"recall_at_principal": 0.7170487106017192, "learned_precision": 0.4782608695652174, "baseline_precision_at_equal_recall": 0.3097538173885946, "ratio": 1.544003149330767}} crossing {'learned_better_at_0.15': True, 'written_not_worse_at_0.5': True}

## false_safe_rate at the principal operating point
| policy | activation_rate | block | combo | id | opening_step | reserve |
|---|---|---|---|---|---|---|
| voc | 0.17 | 0.24 | 0.17 | 0.19 | 0.17 | 0.19 |
| voc_seq | 0.17 | 0.24 | 0.17 | 0.19 | 0.17 | 0.19 |
| hybrid | 0.13 | 0.27 | 0.14 | 0.11 | 0.10 | 0.12 |
| hybrid_seq | 0.23 | 0.42 | 0.25 | 0.20 | 0.19 | 0.18 |
| hardlabel | 0.12 | 0.15 | 0.19 | 0.14 | 0.19 | 0.13 |
| discrepancy | 0.13 | 0.13 | 0.19 | 0.14 | 0.13 | 0.13 |
| sensitivity | 0.29 | 0.25 | 0.29 | 0.29 | 0.30 | 0.31 |
| novelty | 1.00 | 1.00 | 0.63 | 0.81 | 0.99 | 0.77 |
| uncertainty | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| fullstate_voc | 0.00 | 0.01 | 0.04 | 0.03 | 0.02 | 0.04 |

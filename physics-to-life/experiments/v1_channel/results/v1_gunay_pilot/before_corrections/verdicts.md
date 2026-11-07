# Preregistered verdicts — v1_gunay_pilot

Validation split: last 24 training episodes; test rows: 720; bootstrap B = 2000; Holm over 3 operating points.

## Condition: one_shot
### voc
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 1e-05 | 0.137 | 1.423 | 0.63 | 0.48 | 0.39 | uncertainty | 0.418 | 3.40 | +1.004 [+0.804, +1.194] | 0.000 |
| 0.3 | yes | 3e-06 | 0.200 | 0.972 | 0.70 | 0.35 | 0.51 | hardlabel | 0.240 | 4.05 | +0.732 [+0.593, +0.881] | 0.000 |
| 0.5 | yes | 1e-06 | 0.449 | 0.260 | 0.90 | 0.33 | 0.84 | hardlabel | 0.013 | 19.94 | +0.247 [+0.184, +0.327] | 0.000 |
H1-V1: **falsified** (principal ratio 4.053138500815097, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.5114155251141552, "learned_precision": 0.34890965732087226, "baseline_precision_at_equal_recall": 0.2784688995215311, "ratio": 1.2529573604821702}, "sensitivity": {"recall_at_principal": 0.5114155251141552, "learned_precision": 0.34890965732087226, "baseline_precision_at_equal_recall": 0.5608247422680412, "ratio": 0.6221367051493494}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': False}

### hybrid
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 1e-05 | 0.121 | 1.570 | 0.57 | 0.45 | 0.30 | uncertainty | 0.418 | 3.75 | +1.152 [+0.964, +1.343] | 0.000 |
| 0.3 | yes | 1e-06 | 0.294 | 0.881 | 0.72 | 0.28 | 0.54 | hardlabel | 0.240 | 3.68 | +0.641 [+0.515, +0.782] | 0.000 |
| 0.5 | yes | 0 | 0.367 | 0.781 | 0.76 | 0.22 | 0.61 | hardlabel | 0.013 | 60.04 | +0.768 [+0.645, +0.902] | 0.000 |
H1-V1: **falsified** (principal ratio 3.67504512464955, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.5365296803652968, "learned_precision": 0.28211284513805523, "baseline_precision_at_equal_recall": 0.2784688995215311, "ratio": 1.013085646629786}, "sensitivity": {"recall_at_principal": 0.5365296803652968, "learned_precision": 0.28211284513805523, "baseline_precision_at_equal_recall": 0.5608247422680412, "ratio": 0.5030320951910175}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': True}

## Condition: sequential
### voc_seq
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 1e-05 | 0.153 | 1.422 | 0.63 | 0.46 | 0.39 | uncertainty | 0.418 | 3.40 | +1.003 [+0.803, +1.192] | 0.000 |
| 0.3 | yes | 3e-06 | 0.267 | 0.931 | 0.71 | 0.35 | 0.52 | hardlabel | 0.240 | 3.89 | +0.692 [+0.562, +0.834] | 0.000 |
| 0.5 | yes | 3e-06 | 0.267 | 0.931 | 0.71 | 0.35 | 0.52 | hardlabel | 0.013 | 71.57 | +0.918 [+0.793, +1.051] | 0.000 |
H1-V1: **falsified** (principal ratio 3.885177422894482, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.5228310502283106, "learned_precision": 0.3453996983408748, "baseline_precision_at_equal_recall": 0.2784688995215311, "ratio": 1.24035286861242}, "sensitivity": {"recall_at_principal": 0.5228310502283106, "learned_precision": 0.3453996983408748, "baseline_precision_at_equal_recall": 0.5608247422680412, "ratio": 0.615878138585751}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': True}

### hybrid_seq
| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | yes | 1e-05 | 0.134 | 1.569 | 0.57 | 0.43 | 0.30 | uncertainty | 0.418 | 3.75 | +1.151 [+0.961, +1.343] | 0.000 |
| 0.3 | yes | 3e-06 | 0.203 | 1.227 | 0.62 | 0.30 | 0.38 | hardlabel | 0.240 | 5.12 | +0.988 [+0.835, +1.146] | 0.000 |
| 0.5 | yes | 1e-06 | 0.411 | 0.881 | 0.72 | 0.27 | 0.54 | hardlabel | 0.013 | 67.70 | +0.868 [+0.740, +1.004] | 0.000 |
H1-V1: **falsified** (principal ratio 5.119739214219294, Holm p 0.00030000000000000003, contradicted elsewhere: True); H3-V1: **not passed** {"discrepancy": {"recall_at_principal": 0.3812785388127854, "learned_precision": 0.30363636363636365, "baseline_precision_at_equal_recall": 0.2784688995215311, "ratio": 1.0903780068728524}, "sensitivity": {"recall_at_principal": 0.3812785388127854, "learned_precision": 0.30363636363636365, "baseline_precision_at_equal_recall": 0.5608247422680412, "ratio": 0.5414104278074866}} crossing {'learned_better_at_0.15': False, 'written_not_worse_at_0.5': True}

## false_safe_rate at the principal operating point
| policy | activation_rate | block | combo | id | opening_step |
|---|---|---|---|---|---|
| voc | 0.41 | 0.35 | 0.27 | 0.34 | 0.32 |
| voc_seq | 0.41 | 0.35 | 0.27 | 0.34 | 0.32 |
| hybrid | 0.27 | 0.30 | 0.20 | 0.23 | 0.24 |
| hybrid_seq | 0.56 | 0.48 | 0.36 | 0.46 | 0.44 |
| hardlabel | 0.11 | 0.11 | 0.14 | 0.10 | 0.19 |
| discrepancy | 0.12 | 0.17 | 0.12 | 0.11 | 0.15 |
| sensitivity | 0.28 | 0.24 | 0.31 | 0.29 | 0.29 |
| novelty | 0.99 | 0.97 | 0.51 | 0.80 | 1.00 |
| uncertainty | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| fullstate_voc | 0.01 | 0.00 | 0.01 | 0.03 | 0.04 |

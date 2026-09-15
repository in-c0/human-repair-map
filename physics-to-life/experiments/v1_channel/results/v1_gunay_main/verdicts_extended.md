# Preregistered verdicts (H5, H8, H9, H10) — v1_gunay_main

## H5-V1 — compiled surrogate with calibrated distrust

Verdict: **falsified**. Clauses: 1_amortised_speedup_ge_10 = yes; 2_id_within_tol_ge_0.80 = no; 3_id_false_safe_le_0.05 = yes; 4_ood_false_safe_le_0.20_post_fallback_within_tol = yes.

- speed-up per query: inference 4835×, amortised over 800 ID queries 157× (fine 5.06 s, inference 1.05 ms, training 24.9 s)
- ID within-tolerance rate: emulator 0.281, hybrid 0.615, medium 0.470
- detector chosen on validation ID data only: **conformal** (highest validation coverage among gates with validation false_safe_rate <= 0.05 (the ID target of the hypothesis))

| gate | validation FSR | validation coverage | ID FSR | ID coverage | FSR block | FSR opening_step | FSR combo | FSR activation_rate | post-fallback err block | post-fallback err opening_step | post-fallback err combo | post-fallback err activation_rate |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ens_std | 0.930 | 0.950 | 0.920 | 0.943 | 0.936 | 0.924 | 0.905 | 0.952 | 16.902 | 13.828 | 15.305 | 12.557 |
| knn | 0.956 | 0.952 | 0.935 | 0.936 | 1.000 | 1.000 | 0.822 | 1.000 | 40.599 | 42.674 | 104.479 | 27.413 |
| range | 0.954 | 0.950 | 0.948 | 0.945 | 0.000 | 0.000 | 0.347 | 0.000 | 0.000 | 0.000 | 85.609 | 0.000 |
| conformal (chosen) | 0.006 | 0.008 | 0.002 | 0.003 | 0.005 | 0.007 | 0.004 | 0.000 | 0.005 | 0.012 | 0.005 | 0.001 |

## H8-V1 — hybrid closure (medium + learned residual) vs black-box emulator

Verdict: **not passed** — hybrid lower mean error on 4/4 OOD families (paired CI excludes 0 on 4); pooled-OOD invalidity AUROC: hybrid discrepancy monitor 0.587 vs emulator ensemble spread 0.786 (hybrid ensemble spread 0.863).

| family | pairs | hybrid mean | emulator mean | diff (emu − hyb) [95 % CI] | hybrid median | emulator median | hybrid within tol | emulator within tol | AUROC hyb-disc | AUROC emu-ens |
|---|---|---|---|---|---|---|---|---|---|---|
| block | 660 | 9.590 | 40.599 | +31.009 [+21.921, +41.112] | 0.792 | 1.792 | 0.532 | 0.339 | 0.567 | 0.800 |
| opening_step | 660 | 12.706 | 42.674 | +29.968 [+19.032, +42.629] | 1.623 | 1.945 | 0.433 | 0.323 | 0.595 | 0.791 |
| combo | 660 | 31.733 | 129.782 | +98.049 [+32.734, +180.316] | 1.462 | 2.956 | 0.448 | 0.253 | 0.578 | 0.802 |
| activation_rate | 660 | 5.094 | 27.413 | +22.318 [+15.406, +30.933] | 0.519 | 2.762 | 0.635 | 0.268 | 0.609 | 0.753 |

Constraint violations (spike_count ≥ 0, recovery_fraction ∈ [0, 1.05], min_isi > 0, time_to_peak > 0): id: hybrid 0.049, emulator 0.010; block: hybrid 0.047, emulator 0.017; opening_step: hybrid 0.040, emulator 0.013; combo: hybrid 0.070, emulator 0.020; activation_rate: hybrid 0.060, emulator 0.017

## H9-V1 — cross-formulation transfer (level-A-trained router under the level-B truth)

Verdict (one-shot VoC): **passes**. Minimal-set agreement A vs B 0.627; necessary-rate A 0.545, B 0.732.

| condition | precision A | precision B | B/A | recall A | recall B | err/tol A | err/tol B | best physics baseline precision under B (at its own 30 % point) | ≥ 0.8·A | ≥ physics baselines | verdict | supplementary: baselines' precision at equal recall under B (ratio) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| voc | 0.649 | 0.802 | 1.236 | 0.699 | 0.621 | 0.720 | 1.244 | 0.747 (share 0.321, discrepancy 0.294, sensitivity 0.747) | yes | yes | passes | share 0.400 (2.01×), discrepancy 0.304 (2.64×), sensitivity 0.714 (1.12×) |
| voc_seq | 0.651 | 0.803 | 1.233 | 0.699 | 0.621 | 0.720 | 1.244 | 0.747 (share 0.321, discrepancy 0.294, sensitivity 0.747) | yes | yes | passes | share 0.400 (2.01×), discrepancy 0.304 (2.64×), sensitivity 0.714 (1.12×) |
| hybrid | 0.423 | 0.586 | 1.385 | 0.802 | 0.825 | 0.581 | 0.835 | 0.747 (share 0.321, discrepancy 0.294, sensitivity 0.747) | yes | no | falsified | share 0.330 (1.77×), discrepancy 0.282 (2.08×), sensitivity 0.568 (1.03×) |
| hybrid_seq | 0.511 | 0.689 | 1.349 | 0.802 | 0.785 | 0.584 | 0.892 | 0.747 (share 0.321, discrepancy 0.294, sensitivity 0.747) | yes | no | falsified | share 0.344 (2.00×), discrepancy 0.299 (2.31×), sensitivity 0.568 (1.21×) |

## H10-V1 — functional restoration precursor (preregistered damage: Kf loss)

Verdict: **not testable (no functionally damaged instance: the damage leaves both targets within tolerance)**. Instances 12 (silent wild types skipped: 2); functionally damaged 0; damage within tolerance in 1.000 of evaluated instances; routed threshold 0.0000 (verdicts.json principal operating point).


## H10 post-hoc exploratory variant (NaT loss; not a preregistered verdict)

Verdict: **not passed**. Instances 16 (silent wild types skipped: 3); functionally damaged 11; damage within tolerance in 0.154 of evaluated instances; routed threshold 0.0000 (verdicts.json principal operating point).

| method | restored fine A | restored fine B | restored held-out | all three | claimed by the search | claimed but fails fine A | search cost (nominal) |
|---|---|---|---|---|---|---|---|
| routed | 0.727 | 0.091 | 0.818 | 0.091 | 0.727 | 0.000 | 13659961 |
| medium | 0.091 | 0.091 | 0.091 | 0.000 | 0.636 | 0.857 | 3724825 |
| fine | 0.727 | 0.091 | 0.727 | 0.091 | 0.727 | 0.000 | 52726240 |

Routed search cost / uniform-fine search cost: 0.259.

## Reserved ID set — replication at the operating points selected on validation (no new selection)

Reserved rows: 1200.

| condition | router | budget | reserve err/tol (test) | reserve cost | success | best baseline on test | reserve diff [95 % CI] (test diff) | ratio |
|---|---|---|---|---|---|---|---|---|
| one_shot | voc | 0.15 | 2.220 (1.461) | 0.145 | 0.69 | uncertainty | +2.079 [+0.824, +3.686] (+1.295) | 15.69 |
| one_shot | voc | 0.3 | 0.365 (0.823) | 0.278 | 0.87 | uncertainty | +0.224 [+0.174, +0.291] (+0.657) | 2.58 |
| one_shot | voc | 0.5 | 0.017 (0.040) | 0.503 | 0.99 | hardlabel | -0.029 [-0.073, +0.006] (+0.004) | 0.36 |
| one_shot | hybrid | 0.15 | 1.395 (1.525) | 0.143 | 0.67 | uncertainty | +1.254 [+0.763, +2.144] (+1.359) | 9.86 |
| one_shot | hybrid | 0.3 | 0.460 (0.581) | 0.311 | 0.84 | uncertainty | +0.318 [+0.245, +0.411] (+0.415) | 3.25 |
| one_shot | hybrid | 0.5 | 0.460 (0.581) | 0.318 | 0.84 | hardlabel | +0.414 [+0.319, +0.523] (+0.545) | 10.00 |
| sequential | voc_seq | 0.15 | 2.220 (1.461) | 0.145 | 0.69 | uncertainty | +2.079 [+0.824, +3.686] (+1.295) | 15.69 |
| sequential | voc_seq | 0.3 | 0.365 (0.823) | 0.281 | 0.87 | uncertainty | +0.224 [+0.174, +0.291] (+0.657) | 2.58 |
| sequential | voc_seq | 0.5 | 0.063 (0.118) | 0.495 | 0.98 | hardlabel | +0.017 [-0.030, +0.060] (+0.082) | 1.38 |
| sequential | hybrid_seq | 0.15 | 1.395 (1.525) | 0.143 | 0.67 | uncertainty | +1.254 [+0.763, +2.144] (+1.359) | 9.86 |
| sequential | hybrid_seq | 0.3 | 0.460 (0.584) | 0.310 | 0.84 | uncertainty | +0.319 [+0.246, +0.412] (+0.418) | 3.25 |
| sequential | hybrid_seq | 0.5 | 0.460 (0.579) | 0.431 | 0.84 | hardlabel | +0.414 [+0.319, +0.523] (+0.543) | 10.00 |

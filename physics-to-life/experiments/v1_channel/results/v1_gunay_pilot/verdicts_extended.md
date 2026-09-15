# Preregistered verdicts (H5, H8, H9, H10) — v1_gunay_pilot

## H5-V1 — compiled surrogate with calibrated distrust

Verdict: **falsified**. Clauses: 1_amortised_speedup_ge_10 = yes; 2_id_within_tol_ge_0.80 = no; 3_id_false_safe_le_0.05 = yes; 4_ood_false_safe_le_0.20_post_fallback_within_tol = yes.

- speed-up per query: inference 5525×, amortised over 240 ID queries 181× (fine 5.24 s, inference 0.95 ms, training 6.7 s)
- ID within-tolerance rate: emulator 0.136, hybrid 0.467, medium 0.453
- detector chosen on validation ID data only: **conformal** (highest validation coverage among gates with validation false_safe_rate <= 0.05 (the ID target of the hypothesis))

| gate | validation FSR | validation coverage | ID FSR | ID coverage | FSR block | FSR opening_step | FSR combo | FSR activation_rate | post-fallback err block | post-fallback err opening_step | post-fallback err combo | post-fallback err activation_rate |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ens_std | 0.937 | 0.947 | 0.932 | 0.941 | 0.905 | 0.939 | 0.934 | 0.931 | 22.988 | 29.310 | 27.300 | 25.628 |
| knn | 0.937 | 0.943 | 0.968 | 0.967 | 1.000 | 1.000 | 0.843 | 1.000 | 142.528 | 107.733 | 128.120 | 92.861 |
| range | 0.964 | 0.958 | 0.889 | 0.883 | 0.000 | 0.000 | 0.388 | 0.000 | 0.000 | 0.000 | 62.868 | 0.000 |
| conformal (chosen) | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |

## H8-V1 — hybrid closure (medium + learned residual) vs black-box emulator

Verdict: **not passed** — hybrid lower mean error on 4/4 OOD families (paired CI excludes 0 on 4); pooled-OOD invalidity AUROC: hybrid discrepancy monitor 0.543 vs emulator ensemble spread 0.740 (hybrid ensemble spread 0.865).

| family | pairs | hybrid mean | emulator mean | diff (emu − hyb) [95 % CI] | hybrid median | emulator median | hybrid within tol | emulator within tol | AUROC hyb-disc | AUROC emu-ens |
|---|---|---|---|---|---|---|---|---|---|---|
| block | 330 | 31.707 | 142.528 | +110.821 [+65.777, +166.406] | 1.858 | 4.408 | 0.400 | 0.173 | 0.530 | 0.750 |
| opening_step | 330 | 23.636 | 107.733 | +84.097 [+46.126, +124.716] | 2.482 | 4.078 | 0.352 | 0.161 | 0.526 | 0.740 |
| combo | 330 | 35.544 | 143.469 | +107.924 [+53.767, +159.420] | 2.067 | 5.152 | 0.385 | 0.133 | 0.569 | 0.753 |
| activation_rate | 330 | 24.393 | 92.861 | +68.468 [+39.094, +97.197] | 1.105 | 5.269 | 0.476 | 0.124 | 0.534 | 0.721 |

Constraint violations (spike_count ≥ 0, recovery_fraction ∈ [0, 1.05], min_isi > 0, time_to_peak > 0): id: hybrid 0.097, emulator 0.013; block: hybrid 0.073, emulator 0.013; opening_step: hybrid 0.113, emulator 0.027; combo: hybrid 0.100, emulator 0.000; activation_rate: hybrid 0.093, emulator 0.020

## H9-V1 — cross-formulation transfer (level-A-trained router under the level-B truth)

Verdict (one-shot VoC): **falsified**. Minimal-set agreement A vs B 0.657; necessary-rate A 0.557, B 0.728.

| condition | precision A | precision B | B/A | recall A | recall B | err/tol A | err/tol B | best physics baseline precision under B (at its own 30 % point) | ≥ 0.8·A | ≥ physics baselines | verdict | supplementary: baselines' precision at equal recall under B (ratio) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| voc | 0.572 | 0.702 | 1.226 | 0.692 | 0.687 | 0.306 | 0.553 | 0.744 (share 0.406, discrepancy 0.305, sensitivity 0.744) | yes | no | falsified | share 0.366 (1.92×), discrepancy 0.307 (2.28×), sensitivity 0.615 (1.14×) |
| voc_seq | 0.593 | 0.699 | 1.180 | 0.588 | 0.629 | 0.393 | 0.753 | 0.744 (share 0.406, discrepancy 0.305, sensitivity 0.744) | yes | no | falsified | share 0.387 (1.81×), discrepancy 0.305 (2.29×), sensitivity 0.678 (1.03×) |
| hybrid | 0.416 | 0.553 | 1.331 | 0.762 | 0.818 | 0.587 | 0.808 | 0.744 (share 0.406, discrepancy 0.305, sensitivity 0.744) | yes | no | falsified | share 0.320 (1.73×), discrepancy 0.276 (2.00×), sensitivity 0.571 (0.97×) |
| hybrid_seq | 0.450 | 0.634 | 1.408 | 0.762 | 0.805 | 0.588 | 0.827 | 0.744 (share 0.406, discrepancy 0.305, sensitivity 0.744) | yes | no | falsified | share 0.325 (1.95×), discrepancy 0.281 (2.26×), sensitivity 0.571 (1.11×) |

## H10-V1 — functional restoration precursor (preregistered damage: Kf loss)

Verdict: **not testable (no functionally damaged instance: the damage leaves both targets within tolerance)**. Instances 4 (silent wild types skipped: —); functionally damaged 0; damage within tolerance in 1.000 of evaluated instances; routed threshold — (None).


## H10 post-hoc exploratory variant (NaT loss; not a preregistered verdict)

Not evaluated (restoration outputs missing).

## Reserved ID set — replication at the operating points selected on validation (no new selection)

Not evaluated (no reserved family in the rows table).

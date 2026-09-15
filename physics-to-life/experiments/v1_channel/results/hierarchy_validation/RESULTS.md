# V1 hierarchy validation (Günay 2015 system)

Fit floors (normalised RMS on the fit family): Kf 0.051 (anchoredB), NaT 0.059 (anchored), Kf_B 0.095 (anchored), NaT_B 0.060 (anchoredB)

## Channel-level current errors (max |ΔI| / max |I_fine|)

| level | channel | protocols | medium vs fine, mean | max | coarse vs fine, mean |
|---|---|---|---|---|---|
| A | Kf | eval | 0.110 | 0.200 | 6.415 |
| A | Kf | fit | 0.104 | 0.383 | 6.552 |
| A | NaT | eval | 0.498 | 0.726 | 2.847 |
| A | NaT | fit | 0.157 | 0.704 | 2.836 |
| B | Kf | eval | 0.275 | 0.412 | 7.799 |
| B | Kf | fit | 0.322 | 0.422 | 8.357 |
| B | NaT | eval | 0.471 | 0.695 | 2.817 |
| B | NaT | fit | 0.157 | 0.650 | 2.860 |

## Current clamp (I_pulse −1 … 40 pA): worst-case target errors vs the Radau reference of fine A

| level | state dim | max Δspike count | max Δlatency (ms) | max V RMSE (mV) | mean nominal cost | mean wall (s) |
|---|---|---|---|---|---|---|
| coarse | 2 | 37 | 7.05 | 19.20 | 39050 | 1.37 |
| fine_A | 32 | 0 | 0.00 | 0.01 | 777856 | 12.30 |
| fine_B | 27 | 5 | 4.10 | 10.81 | 1837206 | 24.02 |
| fine_Kf_only | 24 | 40 | 65.40 | 15.57 | 473884 | 7.38 |
| fine_NaT_only | 10 | 1 | 0.00 | 5.46 | 236090 | 3.58 |
| medium | 7 | 40 | 65.40 | 15.39 | 80482 | 0.74 |

## Intervention-family preview (3 instances × 4 groups per family; medium vs fine A; error / tolerance)

| family | fraction of targets where medium is outside tolerance | median err/tol | fixed by refining Kf only | fixed by refining NaT only |
|---|---|---|---|---|
| activation_rate | 0.61 | 1.60 | 0.19 | 0.42 |
| block | 0.67 | 2.94 | 0.25 | 0.42 |
| combo | 0.69 | 2.12 | 0.25 | 0.44 |
| density | 0.64 | 2.07 | 0.25 | 0.39 |
| k_out | 0.67 | 2.07 | 0.25 | 0.42 |
| kf_inactivation | 0.67 | 2.80 | 0.25 | 0.42 |
| kf_loss | 0.67 | 1.97 | 0.25 | 0.42 |
| kf_recovery | 0.67 | 2.02 | 0.25 | 0.42 |
| nat_inactivation | 0.67 | 2.32 | 0.25 | 0.42 |
| none | 0.67 | 1.97 | 0.25 | 0.42 |
| opening_step | 0.72 | 3.11 | 0.31 | 0.42 |
| temperature | 0.67 | 2.12 | 0.25 | 0.42 |

State dimensions: fine A {'Ks': 5, 'Kf': 20, 'NaT': 5, 'NaP': 2}, fine B {'Ks': 5, 'Kf': 14, 'NaT': 6, 'NaP': 2}, medium {'Ks': 1, 'Kf': 3, 'NaT': 2, 'NaP': 1}, coarse {'Ks': 0, 'Kf': 1, 'NaT': 1, 'NaP': 0}.
Wall 1802 s.

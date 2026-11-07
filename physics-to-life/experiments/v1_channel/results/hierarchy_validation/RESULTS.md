# V1 hierarchy validation (Günay 2015 system)

Fit floors (normalised RMS on the fit family): Kf 0.051 (anchoredB), NaT 0.025 (coupledfixed), Kf_B 0.096 (anchored), NaT_B 0.063 (anchoredB)

## Channel-level current errors (max |ΔI| / max |I_fine|)

| level | channel | protocols | medium vs fine, mean | max | coarse vs fine, mean |
|---|---|---|---|---|---|
| A | Kf | eval | 0.150 | 0.264 | 6.441 |
| A | Kf | fit | 0.121 | 0.502 | 15.243 |
| A | NaT | eval | 0.143 | 0.267 | 2.696 |
| A | NaT | fit | 0.103 | 0.267 | 2.786 |
| B | Kf | eval | 0.302 | 0.391 | 8.080 |
| B | Kf | fit | 0.331 | 0.447 | 17.547 |
| B | NaT | eval | 0.529 | 0.851 | 2.916 |
| B | NaT | fit | 0.199 | 0.695 | 2.984 |

## Current clamp (I_pulse −1 … 40 pA): worst-case target errors vs the Radau reference of fine A

| level | state dim | max Δspike count | max Δlatency (ms) | max V RMSE (mV) | mean nominal cost | mean wall (s) |
|---|---|---|---|---|---|---|
| coarse | 2 | 53 | 40.90 | 14.62 | 39065 | 1.31 |
| fine_A | 35 | 0 | 0.00 | 0.02 | 1086038 | 15.83 |
| fine_B | 27 | 28 | 38.00 | 13.37 | 1524694 | 19.20 |
| fine_Kf_only | 24 | 7 | 26.20 | 13.75 | 530364 | 7.77 |
| fine_NaT_only | 13 | 0 | 0.00 | 3.01 | 193639 | 2.75 |
| medium | 7 | 7 | 26.20 | 13.66 | 80477 | 0.71 |

## Intervention-family preview (3 instances × 4 groups per family; medium vs fine A; error / tolerance)

| family | fraction of targets where medium is outside tolerance | median err/tol | fixed by refining Kf only | fixed by refining NaT only |
|---|---|---|---|---|
| activation_rate | 0.47 | 0.92 | 0.19 | 0.28 |
| block | 0.53 | 1.53 | 0.25 | 0.28 |
| combo | 0.47 | 0.76 | 0.22 | 0.25 |
| density | 0.56 | 1.80 | 0.25 | 0.31 |
| k_out | 0.56 | 1.42 | 0.28 | 0.31 |
| kf_inactivation | 0.56 | 1.53 | 0.28 | 0.28 |
| kf_loss | 0.53 | 1.69 | 0.25 | 0.28 |
| kf_recovery | 0.53 | 1.53 | 0.25 | 0.28 |
| nat_inactivation | 0.53 | 1.34 | 0.28 | 0.28 |
| none | 0.53 | 1.53 | 0.25 | 0.28 |
| opening_step | 0.64 | 1.86 | 0.36 | 0.31 |
| temperature | 0.53 | 1.20 | 0.25 | 0.28 |

State dimensions: fine A {'Ks': 5, 'Kf': 20, 'NaT': 8, 'NaP': 2}, fine B {'Ks': 5, 'Kf': 14, 'NaT': 6, 'NaP': 2}, medium {'Ks': 1, 'Kf': 3, 'NaT': 2, 'NaP': 1}, coarse {'Ks': 0, 'Kf': 1, 'NaT': 1, 'NaP': 0}.
Wall 976 s.

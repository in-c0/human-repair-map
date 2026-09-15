# Falsification attempts — v1_gunay_main

| control | voc err/tol @ validation-selected 30 % point | cost frac | precision | recall | cost to 95 % success |
|---|---|---|---|---|---|
| reference | 0.823 | 0.277 | 0.67 | 0.76 | 0.3466330877931706 |
| permuted_labels | 6.024 | 0.253 | 0.07 | 0.27 | 0.8717186783206324 |
| descriptors_only | 1.858 | 0.282 | 0.66 | 0.74 | 0.34392529278815176 |
| simulation_only | 0.429 | 0.275 | 0.68 | 0.76 | 0.34593110981444136 |
| target_blind | 0.864 | 0.291 | 0.64 | 0.74 | 0.35307228059067536 |

## Leave-one-family-out (voc, 30 % point)

| family | held-out err/tol | reference err/tol on the family | held-out precision | reference precision |
|---|---|---|---|---|
| density | 0.473 | 0.473 | 0.65 | 0.64 |
| k_out | 0.350 | 0.360 | 0.67 | 0.65 |
| kf_inactivation | 0.390 | 0.357 | 0.70 | 0.69 |
| kf_loss | 0.578 | 0.471 | 0.60 | 0.64 |
| kf_recovery | 0.544 | 0.521 | 0.62 | 0.65 |
| nat_inactivation | 0.626 | 4.149 | 0.62 | 0.64 |
| none | 0.417 | 0.410 | 0.70 | 0.71 |
| temperature | 0.386 | 0.349 | 0.62 | 0.70 |

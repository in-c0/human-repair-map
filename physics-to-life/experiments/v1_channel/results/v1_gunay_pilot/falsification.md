# Falsification attempts — v1_gunay_pilot

| control | voc err/tol @ validation-selected 30 % point | cost frac | precision | recall | cost to 95 % success |
|---|---|---|---|---|---|
| reference | 0.306 | 0.310 | 0.63 | 0.83 | 0.3534878422483887 |
| permuted_labels | 2.339 | 0.296 | 0.07 | 0.28 | 0.8878799418482761 |
| descriptors_only | 0.311 | 0.305 | 0.66 | 0.82 | 0.3451592778575285 |
| simulation_only | 0.297 | 0.317 | 0.64 | 0.84 | 0.35272881015826096 |
| target_blind | 0.339 | 0.312 | 0.63 | 0.80 | 0.3612001222560602 |

## Leave-one-family-out (voc, 30 % point)

| family | held-out err/tol | reference err/tol on the family | held-out precision | reference precision |
|---|---|---|---|---|
| density | 0.305 | 0.342 | 0.59 | 0.47 |
| k_out | 0.334 | 0.482 | 0.61 | 0.61 |
| kf_inactivation | 0.375 | 0.293 | 0.74 | 0.74 |
| kf_loss | 0.203 | 0.265 | 0.62 | 0.64 |
| kf_recovery | 0.172 | 0.172 | 0.67 | 0.67 |
| nat_inactivation | 0.303 | 0.394 | 0.51 | 0.56 |
| none | 0.219 | 0.257 | 0.60 | 0.59 |
| temperature | 0.288 | 0.274 | 0.63 | 0.65 |

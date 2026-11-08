# Supplement to the preregistered verdicts — baselines restricted to those attaining each budget on validation (POST-HOC reading; the preregistered verdict is verdicts.md)

Same validation-selected thresholds, same paired bootstrap and Holm correction as verdicts.py; the only change is that a baseline with no parameter within the budget on validation is listed as *unattainable* instead of being compared at its cheapest point.

## Evaluation family: id

### one_shot / voc

| budget | learned cost | learned err | best attaining baseline | its cost | its err | ratio | Δ mean [95 % CI] | Holm p | unattainable at this budget |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 0.146 | 1.461 | uncertainty_per_cost | 0.170 | 1.584 | 0.92 | -0.123 [-0.205, -0.041] | 0.018 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.3 | 0.277 | 0.823 | uncertainty_per_cost | 0.324 | 0.418 | 1.97 | +0.405 [-0.020, +1.219] | 0.384 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.5 | 0.516 | 0.040 | hardlabel | 0.506 | 0.036 | 1.10 | +0.004 [-0.017, +0.019] | 0.602 | discrepancy (0.60), sensitivity (0.54) |

H1-V1 under this reading: **falsified** (contradicted at another point: False).

### one_shot / hybrid

| budget | learned cost | learned err | best attaining baseline | its cost | its err | ratio | Δ mean [95 % CI] | Holm p | unattainable at this budget |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 0.140 | 1.525 | uncertainty_per_cost | 0.170 | 1.584 | 0.96 | -0.060 [-0.172, +0.057] | 0.287 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.3 | 0.312 | 0.581 | uncertainty_per_cost | 0.324 | 0.418 | 1.39 | +0.163 [+0.068, +0.273] | 0.000 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.5 | 0.321 | 0.581 | hardlabel | 0.506 | 0.036 | 16.04 | +0.545 [+0.455, +0.650] | 0.000 | discrepancy (0.60), sensitivity (0.54) |

H1-V1 under this reading: **falsified** (contradicted at another point: True).

### sequential / voc_seq

| budget | learned cost | learned err | best attaining baseline | its cost | its err | ratio | Δ mean [95 % CI] | Holm p | unattainable at this budget |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 0.147 | 1.461 | uncertainty_per_cost | 0.170 | 1.584 | 0.92 | -0.123 [-0.205, -0.041] | 0.012 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.3 | 0.280 | 0.823 | uncertainty_per_cost | 0.324 | 0.418 | 1.97 | +0.405 [-0.020, +1.219] | 0.192 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.5 | 0.489 | 0.118 | hardlabel | 0.506 | 0.036 | 3.25 | +0.082 [+0.052, +0.110] | 0.000 | discrepancy (0.60), sensitivity (0.54) |

H1-V1 under this reading: **falsified** (contradicted at another point: True).

### sequential / hybrid_seq

| budget | learned cost | learned err | best attaining baseline | its cost | its err | ratio | Δ mean [95 % CI] | Holm p | unattainable at this budget |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 0.140 | 1.525 | uncertainty_per_cost | 0.170 | 1.584 | 0.96 | -0.060 [-0.172, +0.057] | 0.287 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.3 | 0.303 | 0.584 | uncertainty_per_cost | 0.324 | 0.418 | 1.40 | +0.166 [+0.071, +0.276] | 0.000 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.5 | 0.441 | 0.579 | hardlabel | 0.506 | 0.036 | 15.98 | +0.543 [+0.453, +0.649] | 0.000 | discrepancy (0.60), sensitivity (0.54) |

H1-V1 under this reading: **falsified** (contradicted at another point: True).

## Evaluation family: reserve

### one_shot / voc

| budget | learned cost | learned err | best attaining baseline | its cost | its err | ratio | Δ mean [95 % CI] | Holm p | unattainable at this budget |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 0.145 | 2.220 | uncertainty_per_cost | 0.166 | 1.514 | 1.47 | +0.707 [-0.183, +1.987] | 0.582 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.3 | 0.278 | 0.365 | uncertainty_per_cost | 0.321 | 0.360 | 1.01 | +0.005 [-0.049, +0.076] | 0.890 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.5 | 0.503 | 0.017 | hardlabel | 0.507 | 0.046 | 0.36 | -0.029 [-0.073, +0.006] | 0.417 | discrepancy (0.60), sensitivity (0.54) |

H1-V1 under this reading: **falsified** (contradicted at another point: False).

### one_shot / hybrid

| budget | learned cost | learned err | best attaining baseline | its cost | its err | ratio | Δ mean [95 % CI] | Holm p | unattainable at this budget |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 0.143 | 1.395 | uncertainty_per_cost | 0.166 | 1.514 | 0.92 | -0.119 [-0.243, +0.003] | 0.053 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.3 | 0.311 | 0.460 | uncertainty_per_cost | 0.321 | 0.360 | 1.28 | +0.099 [+0.015, +0.201] | 0.042 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.5 | 0.318 | 0.460 | hardlabel | 0.507 | 0.046 | 10.00 | +0.414 [+0.319, +0.523] | 0.000 | discrepancy (0.60), sensitivity (0.54) |

H1-V1 under this reading: **falsified** (contradicted at another point: True).

### sequential / voc_seq

| budget | learned cost | learned err | best attaining baseline | its cost | its err | ratio | Δ mean [95 % CI] | Holm p | unattainable at this budget |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 0.145 | 2.220 | uncertainty_per_cost | 0.166 | 1.514 | 1.47 | +0.707 [-0.183, +1.987] | 0.873 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.3 | 0.281 | 0.365 | uncertainty_per_cost | 0.321 | 0.360 | 1.01 | +0.005 [-0.049, +0.076] | 0.890 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.5 | 0.495 | 0.063 | hardlabel | 0.507 | 0.046 | 1.38 | +0.017 [-0.030, +0.060] | 0.873 | discrepancy (0.60), sensitivity (0.54) |

H1-V1 under this reading: **falsified** (contradicted at another point: False).

### sequential / hybrid_seq

| budget | learned cost | learned err | best attaining baseline | its cost | its err | ratio | Δ mean [95 % CI] | Holm p | unattainable at this budget |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 0.143 | 1.395 | uncertainty_per_cost | 0.166 | 1.514 | 0.92 | -0.119 [-0.243, +0.003] | 0.053 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.3 | 0.310 | 0.460 | uncertainty_per_cost | 0.321 | 0.360 | 1.28 | +0.100 [+0.015, +0.202] | 0.038 | discrepancy (0.60), sensitivity (0.54), uncertainty (0.39) |
| 0.5 | 0.431 | 0.460 | hardlabel | 0.507 | 0.046 | 10.00 | +0.414 [+0.319, +0.523] | 0.000 | discrepancy (0.60), sensitivity (0.54) |

H1-V1 under this reading: **falsified** (contradicted at another point: True).


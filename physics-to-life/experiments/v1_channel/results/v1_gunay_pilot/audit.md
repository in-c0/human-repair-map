# Pilot audit — v1_gunay_pilot

- (ii) negative controls: 0.918 of Ks/NaP gains within 2× the numerical floor (max |gain| 7.16e-04; in minimal set 0.000); floor median 2.05e-08, p95 2.89e-04
- (ii) routable channels, fraction of gains above 2× floor: Kf 0.53, NaT 0.63
- (iii) ID non-empty minimal set by target: peak_current 0.78, time_to_peak 0.51, charge 0.62, recovery_fraction 0.83, spike_latency 0.45, spike_count 0.54, min_isi 0.29, mean_v 0.14, v_rmse 0.68; flagged: []
- (iv) wall/episode 148 s (truth 29 s, 88 sims); projected main-run generation 9.6 h on 4 processes
- (v) detectors vs planted shifts: block: range_guard:should_fire auroc=0.58, discrepancy:should_fire auroc=0.53; opening_step: knn_density:should_fire auroc=0.30, discrepancy:should_fire auroc=0.51, ensemble_std:predicted_to_fail auroc=0.46; combo: range_guard:should_fire auroc=0.66, knn_density:should_fire auroc=0.69; activation_rate: 
- (vi) seeds train [10000, 10119], test [20000, 20059], OOD {'activation_rate': [33000, 33029], 'block': [30000, 30029], 'combo': [32000, 32029], 'opening_step': [31000, 31029]}

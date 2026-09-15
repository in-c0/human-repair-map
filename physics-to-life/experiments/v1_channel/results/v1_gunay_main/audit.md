# Pilot audit — v1_gunay_main

- (ii) negative controls: 0.932 of Ks/NaP gains within 2× the numerical floor (max |gain| 9.18e-03; in minimal set 0.000); floor median 2.33e-08, p95 7.03e-04
- (ii) routable channels, fraction of gains above 2× floor: Kf 0.52, NaT 0.63
- (iii) ID non-empty minimal set by target: peak_current 0.69, time_to_peak 0.49, charge 0.65, recovery_fraction 0.81, spike_latency 0.46, spike_count 0.55, min_isi 0.25, mean_v 0.14, v_rmse 0.71; flagged: []
- (iv) wall/episode 126 s (truth 47 s, 52 sims); projected main-run generation 8.2 h on 4 processes
- (v) detectors vs planted shifts: block: range_guard:should_fire auroc=0.61, discrepancy:should_fire auroc=0.53; opening_step: knn_density:should_fire auroc=0.29, discrepancy:should_fire auroc=0.49, ensemble_std:predicted_to_fail auroc=0.47; combo: range_guard:should_fire auroc=0.76, knn_density:should_fire auroc=0.69; activation_rate: 
- (vi) seeds train [110000, 110399], test [120000, 120199], OOD {'activation_rate': [133000, 133059], 'block': [130000, 130059], 'combo': [132000, 132059], 'opening_step': [131000, 131059]}

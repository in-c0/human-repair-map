#!/usr/bin/env python
"""Failure analysis of the learned router: which necessary nodes does it miss, with what
probability and disagreement, and what information limit explains them?"""
import pickle, sys
from pathlib import Path
import numpy as np
HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE / "src"))
from physics_to_life.state.system import FOLD

run_id = sys.argv[1] if len(sys.argv) > 1 else "v0_main"
cache = HERE / "experiments/v0_toy/results" / run_id / "cache"
eps = {ep["seed"]: ep for ep in pickle.load(open(next(cache.glob("test_*.pkl")), "rb"))}
rows = pickle.load(open(cache / "rows_test_ext.pkl", "rb"))
tau = 0.0003
learned = {r["seed"]: r for r in rows if r["policy"] == "learned" and abs(r["param"] - tau) < 1e-12}
physics = {r["seed"]: r for r in rows if r["policy"] == "physics" and abs(r["param"] - tau) < 1e-12}
miss_p, miss_s, miss_margin_obs, miss_margin_true, hit_p, hit_s = [], [], [], [], [], []
miss_cascade, n_nec, n_miss, n_miss_phys = 0, 0, 0, 0
all_p, all_s, all_nec, all_mistake = [], [], [], []
for seed, r in learned.items():
    ep = eps[seed]; spec = ep["spec"]; nec = ep["necessary"]; p = r["prob"]; s = r["std"]; fid = r["fidelity"]
    # margins from the base (medium) trajectory are in features_base column 4 (margin, observed thresholds)
    F = ep["features_base"]; margin_obs = F[:, 4]; x_max = F[:, 0]
    margin_true = x_max - (spec.theta + FOLD / spec.beta)
    for k in np.where(nec)[0]:
        n_nec += 1
        if fid[k] != 2:
            n_miss += 1
            miss_p.append(p[k]); miss_s.append(s[k]); miss_margin_obs.append(margin_obs[k]); miss_margin_true.append(margin_true[k])
            # cascade: node k's medium-trajectory x never exceeded its true switch threshold (it only switches because
            # an upstream node switches in truth)
            if margin_true[k] < 0:
                miss_cascade += 1
            if physics[seed]["fidelity"][k] != 2:
                n_miss_phys += 1
        else:
            hit_p.append(p[k]); hit_s.append(s[k])
    all_p.append(p); all_s.append(s); all_nec.append(nec.astype(int)); all_mistake.append(((p > 0.5).astype(int) != nec.astype(int)).astype(int))
all_p = np.concatenate(all_p); all_s = np.concatenate(all_s); all_nec = np.concatenate(all_nec); all_mistake = np.concatenate(all_mistake)
from sklearn.metrics import roc_auc_score
print(f"necessary nodes in test set: {n_nec}; missed by learned at tau={tau}: {n_miss} ({n_miss/n_nec:.1%}); of those also missed by physics at same tau: {n_miss_phys}")
print(f"missed nodes: p mean {np.mean(miss_p):.2e} max {np.max(miss_p):.2e} | std mean {np.mean(miss_s):.2e} | observed margin mean {np.mean(miss_margin_obs):.2f} | true margin mean {np.mean(miss_margin_true):.2f}")
print(f"  cascade misses (true margin on base trajectory < 0, i.e. only switch because of an upstream switch): {miss_cascade}/{n_miss}")
print(f"  observed-threshold error for misses (theta_obs - theta), mean abs: {np.mean(np.abs(np.array(miss_margin_true) - np.array(miss_margin_obs))):.2f} (sigma_theta = 0.3)")
print(f"hit nodes: p mean {np.mean(hit_p):.3f} min {np.min(hit_p):.2e} | std mean {np.mean(hit_s):.3f}")
print(f"AUROC of ensemble std for predicting a point-prediction mistake: {roc_auc_score(all_mistake, all_s):.3f}; mean std overall {all_s.mean():.3f}")
print(f"fraction of all nodes with p < {tau}: {(all_p < tau).mean():.3f}; fraction of necessary nodes with p < {tau}: {(all_p[all_nec == 1] < tau).mean():.3f}")

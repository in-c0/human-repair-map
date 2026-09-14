"""Out-of-distribution detectors for the router's inputs, compared as a first-class experiment.

Every detector maps a feature vector to a score (higher = more suspicious) and is
calibrated on in-distribution training features so that a threshold corresponds to a
chosen in-distribution false-alarm rate.  The safety metric that matters is
`false_safe_rate`: how often the system declares "safe" (uses the cheap model) when fine
physics was actually necessary (§10 of the owner review).

Detectors:
    range_guard      fraction of features outside the training [min, max] (support guard)
    knn_density      distance to the k-th nearest training point in standardised feature space
    conformal        split-conformal nonconformity of the router's own predicted dE vs realised dE
                     (assumes exchangeability between calibration and test — stated, and expected
                     to fail under genuine shift)
    discrepancy      residual monitor: |medium - coarse| relative discrepancy of the channel's
                     current in the target window (available whenever a cheaper mechanistic
                     model can be sampled; costs one extra coarse run)
    ensemble_std     disagreement of the router's ensemble (the V0 failed baseline)
"""
from __future__ import annotations

import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler


class RangeGuard:
    def fit(self, X):
        X = np.asarray(X, float); self.lo = X.min(axis=0); self.hi = X.max(axis=0); self.span = np.maximum(self.hi - self.lo, 1e-9)
        return self

    def score(self, X):
        X = np.asarray(X, float)
        out = np.maximum(self.lo - X, 0) / self.span + np.maximum(X - self.hi, 0) / self.span
        return out.max(axis=1)


class KNNDensity:
    def __init__(self, k: int = 10):
        self.k = k

    def fit(self, X):
        X = np.asarray(X, float); self.scaler = StandardScaler().fit(X)
        self.nn = NearestNeighbors(n_neighbors=self.k).fit(self.scaler.transform(X)); return self

    def score(self, X):
        d, _ = self.nn.kneighbors(self.scaler.transform(np.asarray(X, float)))
        return d[:, -1]


class Conformal:
    """Split conformal on absolute residuals of the dE regressor (score = |pred - true| quantile
    exceedance is not observable at test time, so we use the *calibrated prediction interval
    width* relative to the predicted value as the suspicion score, and separately report the
    empirical coverage of the intervals on each family)."""

    def __init__(self, alpha: float = 0.1):
        self.alpha = alpha

    def fit(self, pred_cal, y_cal):
        r = np.abs(np.asarray(pred_cal) - np.asarray(y_cal)); n = len(r)
        q = np.ceil((n + 1) * (1 - self.alpha)) / n
        self.qhat = float(np.quantile(r, min(q, 1.0))); return self

    def interval(self, pred):
        return pred - self.qhat, pred + self.qhat

    def coverage(self, pred, y):
        lo, hi = self.interval(np.asarray(pred)); y = np.asarray(y)
        return float(np.mean((y >= lo) & (y <= hi)))


def detector_metrics(score_id: np.ndarray, score_ood: np.ndarray, necessary_ood: np.ndarray, fa_rate: float = 0.05) -> dict:
    """AUROC (ID vs OOD), threshold at the ID false-alarm rate, flagged fraction on OOD, and the
    false-safe rate: fraction of OOD cases where refinement was necessary but the detector
    said 'safe'."""
    from sklearn.metrics import roc_auc_score
    y = np.concatenate([np.zeros(len(score_id)), np.ones(len(score_ood))]); s = np.concatenate([score_id, score_ood])
    auroc = float(roc_auc_score(y, s)) if len(score_ood) and len(score_id) else np.nan
    thr = float(np.quantile(score_id, 1 - fa_rate))
    flagged = score_ood > thr
    nec = np.asarray(necessary_ood, bool)
    false_safe = float(np.mean(~flagged[nec])) if nec.any() else np.nan
    return {"auroc": auroc, "threshold": thr, "flag_rate_ood": float(flagged.mean()) if len(flagged) else np.nan,
            "false_safe_rate": false_safe, "n_necessary_ood": int(nec.sum())}

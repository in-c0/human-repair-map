from __future__ import annotations
import numpy as np


def reliability_curve(p: np.ndarray, y: np.ndarray, n_bins: int = 10):
    p = np.asarray(p, float); y = np.asarray(y, float)
    edges = np.linspace(0, 1, n_bins + 1)
    idx = np.clip(np.digitize(p, edges[1:-1]), 0, n_bins - 1)
    conf, acc, cnt = np.zeros(n_bins), np.zeros(n_bins), np.zeros(n_bins)
    for b in range(n_bins):
        m = idx == b
        cnt[b] = m.sum()
        if cnt[b]:
            conf[b] = p[m].mean(); acc[b] = y[m].mean()
    return conf, acc, cnt


def expected_calibration_error(p, y, n_bins: int = 10) -> float:
    conf, acc, cnt = reliability_curve(p, y, n_bins)
    n = cnt.sum()
    return float(np.sum(cnt / max(n, 1) * np.abs(acc - conf)))


def brier_score(p, y) -> float:
    p = np.asarray(p, float); y = np.asarray(y, float)
    return float(np.mean((p - y) ** 2))

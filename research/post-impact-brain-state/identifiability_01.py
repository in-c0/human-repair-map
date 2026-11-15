"""Experiment 01 - synthetic identifiability smoke test (human-repair-map#41).

Two independent latent dimensions; sensor A sees their sum, sensor B their
difference. Question: does an independent second observation resolve an
ambiguity a single summed observation cannot? Synthetic only - NOT evidence
of clinical accuracy or that such sensors exist.

Run: python3 identifiability_01.py   (requires numpy)
"""
import numpy as np

rng = np.random.default_rng(42)
n = 20000
s = rng.normal(size=(n, 2))
a = s[:, 0] + s[:, 1] + rng.normal(scale=0.2, size=n)
b = s[:, 0] - s[:, 1] + rng.normal(scale=0.2, size=n)
y = s[:, 0]


def r2(z):
    x = np.column_stack([np.ones(n), z])
    train = np.arange(n) < 14000
    w = np.linalg.lstsq(x[train], y[train], rcond=None)[0]
    p = x[~train] @ w
    return 1 - np.mean((y[~train] - p) ** 2) / np.var(y[~train])


print(f"sensor A only   holdout R2 = {r2(a[:, None]):.3f}")
print(f"sensor A + B    holdout R2 = {r2(np.column_stack([a, b])):.3f}")

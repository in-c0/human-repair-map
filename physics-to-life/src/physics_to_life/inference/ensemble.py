"""Bootstrap ensembles of small learners with predictive mean and disagreement.

The ensemble disagreement (std of member probabilities) is the model-uncertainty signal
used by the uncertainty-driven routing policy and by the OOD analysis.  We deliberately
use a simple, well-understood estimator (deep-ensemble style) rather than a bespoke
Bayesian architecture; whether that signal is *calibrated* and *useful for routing* is an
experimental question (H3, H9), not an assumption.
"""
from __future__ import annotations

import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler


class EnsembleClassifier:
    def __init__(self, kind: str = "mlp", n_members: int = 5, seed: int = 0, feature_idx=None,
                 hidden=(64, 64)):
        self.kind = kind
        self.n_members = n_members
        self.seed = seed
        self.feature_idx = None if feature_idx is None else np.asarray(feature_idx)
        self.hidden = hidden
        self.members = []
        self.scaler = None

    def _sel(self, X):
        return X if self.feature_idx is None else X[:, self.feature_idx]

    def fit(self, X: np.ndarray, y: np.ndarray, sample_weight=None):
        X = self._sel(np.asarray(X, dtype=float))
        y = np.asarray(y).astype(int)
        self.scaler = StandardScaler().fit(X)
        Xs = self.scaler.transform(X)
        rng = np.random.default_rng(self.seed)
        self.members = []
        n = len(y)
        for m in range(self.n_members):
            idx = rng.integers(0, n, size=n)  # bootstrap
            # guarantee both classes present
            if y[idx].min() == y[idx].max():
                idx = np.arange(n)
            if self.kind == "mlp":
                clf = MLPClassifier(hidden_layer_sizes=self.hidden, max_iter=400, early_stopping=True,
                                    random_state=self.seed * 1000 + m, alpha=1e-4, n_iter_no_change=20)
                clf.fit(Xs[idx], y[idx])
            elif self.kind == "gbm":
                clf = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, max_leaf_nodes=15,
                                                     random_state=self.seed * 1000 + m, early_stopping=True)
                clf.fit(Xs[idx], y[idx])
            else:
                raise ValueError(self.kind)
            self.members.append(clf)
        return self

    def predict_members(self, X: np.ndarray) -> np.ndarray:
        Xs = self.scaler.transform(self._sel(np.asarray(X, dtype=float)))
        return np.stack([m.predict_proba(Xs)[:, 1] for m in self.members], axis=0)  # (M, n)

    def predict(self, X: np.ndarray):
        P = self.predict_members(X)
        return P.mean(axis=0), P.std(axis=0)

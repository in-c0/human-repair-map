"""Target-conditioned value-of-computation routing for V1.

Feature vector per (episode, target group, target, channel): what the router may know
before the answer — the target identity, the cheap run's per-channel summaries in the
target window, the intervention descriptors, the nominal cost increment of refining the
channel.  Label: the marginal error reduction dE_c(target) from the hidden truth.

Policies (each returns a fidelity assignment per channel for a given target and a cost):
    uniform_{coarse,medium,fine}
    random_m                      refine m random channels
    share_heuristic               refine channels by current share in the window (modeller's rule)
    discrepancy_heuristic         refine channels whose medium and coarse currents disagree most
                                  (mechanistic residual monitor; charged its extra coarse run)
    voc_learned                   refine channels with predicted dE/cost above a threshold (one-shot)
    voc_learned_seq               greedy sequential re-simulate + re-score (separate condition)
    hybrid                        physics candidate set (share >= s_min) + learned ranking within it
    hardlabel_learned             V0-style classifier on 'in minimal set' (comparison only)
    oracle                        minimal set at tolerance (hidden truth)
    oracle_voc                    true dE ranking
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor, HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

from .targets import TARGET_NAMES

# feature schema (set per system by `set_schema`; defaults = provisional placeholder system)
GROUP_NAMES = ["vclamp_shaker", "recovery_shaker", "cclamp"]
RATE_KEYS = ["activation", "opening", "inactivation", "recovery", "c_inactivation", "k_activation", "na_activation", "na_inactivation", "na_recovery"]


def set_schema(group_names: list[str], rate_keys: list[str]) -> None:
    """Configure the one-hot group slots and the intervention rate keys the router sees."""
    GROUP_NAMES[:] = list(group_names)
    RATE_KEYS[:] = list(rate_keys)


def feature_names(channel_names: list[str]) -> list[str]:
    names = [f"target={t}" for t in TARGET_NAMES] + [f"group={g}" for g in GROUP_NAMES] + [f"channel={c}" for c in channel_names]
    names += ["share", "peak", "t_peak", "late_over_peak", "V_min", "V_max", "V_mean",
              "g_scale_self", "g_scale_other_max", "g_scale_other_min", "T_C", "K_out", "block_frac_self", "block_conc_self", "i_extra"]
    names += [f"rate:{k}" for k in RATE_KEYS]
    names += ["cost_base", "cost_increment", "share_rank"]
    return names


def episode_rows(ep: dict, channel_names: list[str], cost_increment: dict) -> tuple[np.ndarray, np.ndarray, list]:
    """Rows for every (group, target, channel). Returns X, y (dE), and keys."""
    X, y, keys = [], [], []
    interv = ep["interv"]
    for g in ep["groups"]:
        f = g["features"]
        shares = np.array([f[c]["share"] for c in channel_names]); rank = (-shares).argsort().argsort()
        for tgt in g["targets"]:
            for i, c in enumerate(channel_names):
                row = []
                row += [1.0 if tgt == t else 0.0 for t in TARGET_NAMES]
                row += [1.0 if g["name"] == gn else 0.0 for gn in GROUP_NAMES]
                row += [1.0 if c == cn else 0.0 for cn in channel_names]
                row += [f[c]["share"], f[c]["peak"], f[c]["t_peak"], f[c]["late_over_peak"], f["_V"]["min"], f["_V"]["max"], f["_V"]["mean"]]
                gs_self = interv.g_scales.get(c, 1.0)
                others = [interv.g_scales.get(o, 1.0) for o in channel_names if o != c]
                row += [gs_self, max(others), min(others), (interv.T_K or 295.15) - 273.15, interv.K_out or 5.0,
                        interv.block_frac.get(c, 0.0), interv.block_conc.get(c, 0.0), interv.i_extra]
                row += [interv.rate_scales.get(k, 1.0) for k in RATE_KEYS]
                row += [g["cost_base"], cost_increment.get(c, 1.0), float(rank[i])]
                X.append(row); y.append(g["gains"][tgt][c]); keys.append((ep["seed"], g["name"], tgt, c))
    return np.array(X, float), np.array(y, float), keys


class VoCRegressor:
    """Bootstrap ensemble of gradient-boosted regressors predicting dE (error reduction, in units
    of the target scale) for a candidate refinement; disagreement = std across members."""

    def __init__(self, n_members: int = 5, seed: int = 0, feature_idx=None):
        self.n_members, self.seed, self.feature_idx = n_members, seed, feature_idx
        self.members, self.scaler = [], None

    def _sel(self, X):
        return X if self.feature_idx is None else X[:, self.feature_idx]

    def fit(self, X, y):
        X = self._sel(np.asarray(X, float)); y = np.asarray(y, float)
        self.scaler = StandardScaler().fit(X); Xs = self.scaler.transform(X)
        rng = np.random.default_rng(self.seed); n = len(y)
        self.members = []
        for m in range(self.n_members):
            idx = rng.integers(0, n, size=n)
            reg = HistGradientBoostingRegressor(max_iter=400, learning_rate=0.05, max_leaf_nodes=31, random_state=self.seed * 100 + m,
                                                early_stopping=True, l2_regularization=1e-3)
            reg.fit(Xs[idx], y[idx]); self.members.append(reg)
        return self

    def predict(self, X):
        Xs = self.scaler.transform(self._sel(np.asarray(X, float)))
        P = np.stack([m.predict(Xs) for m in self.members])
        return P.mean(axis=0), P.std(axis=0)


class HardLabelClassifier:
    def __init__(self, n_members: int = 5, seed: int = 0):
        self.n_members, self.seed = n_members, seed; self.members = []; self.scaler = None

    def fit(self, X, y):
        X = np.asarray(X, float); y = np.asarray(y).astype(int)
        self.scaler = StandardScaler().fit(X); Xs = self.scaler.transform(X)
        rng = np.random.default_rng(self.seed); n = len(y); self.members = []
        for m in range(self.n_members):
            idx = rng.integers(0, n, size=n)
            if y[idx].min() == y[idx].max():
                idx = np.arange(n)
            clf = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, max_leaf_nodes=15, random_state=self.seed * 100 + m, early_stopping=True)
            clf.fit(Xs[idx], y[idx]); self.members.append(clf)
        return self

    def predict(self, X):
        Xs = self.scaler.transform(np.asarray(X, float))
        P = np.stack([m.predict_proba(Xs)[:, 1] for m in self.members])
        return P.mean(axis=0), P.std(axis=0)

"""H5 (compiled surrogate with calibrated distrust) and H8 (hybrid closure vs black box) for V1.

Rows are (episode, group): what a *compiled* model of the fine physics may know is the cell it
replaces (instance parameters), the intervention and the protocol.  The hybrid closure may in
addition see the medium run (its per-channel summaries and its own target values) and predicts
the residual truth - medium.  Five closures are compared on the same targets:
    coarse            the reduced model's target value           (cost: coarse run)
    medium            the published HH model's target value      (cost: medium run)
    hybrid            medium + learned residual                  (cost: medium run + inference)
    emulator          fully learned, descriptors only            (cost: inference)
    fine              the fine model                             (cost: fine run; error = numerical floor)
Distrust gates (calibrated on the validation split only, thresholds at 95 % coverage):
    ens_std  ensemble disagreement of the surrogate (relative to tolerance)
    knn      k-NN distance of the input row to the training rows
    range    support guard on the input row
    conformal  normalised split-conformal interval (std x calibrated quantile) vs tolerance
    discrepancy  medium-vs-coarse target discrepancy (mechanistic; hybrid only, costs a coarse run)
`false_safe_rate` = P(declared safe & error > tolerance) among cases with error > tolerance.
"""
from __future__ import annotations

import time
from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler

from .routing import RATE_KEYS, GROUP_NAMES
from .ood import RangeGuard, KNNDensity

GATES = ["ens_std", "knn", "range", "conformal"]
CLOSURES = ["coarse", "medium", "hybrid", "emulator", "fine"]


def _interv_vec(interv, names) -> list:
    v = [interv.g_scales.get(c, 1.0) for c in names]
    v += [interv.rate_scales.get(k, 1.0) for k in RATE_KEYS]
    v += [(interv.T_K or 298.15) - 273.15, interv.K_out or 5.0, interv.i_extra]
    v += [interv.block_frac.get(c, 0.0) for c in names] + [interv.block_conc.get(c, 0.0) for c in names]
    return v


def descriptor_keys(episodes) -> list[str]:
    keys = set()
    for ep in episodes:
        keys |= set(ep["instance"].keys())
    return sorted(keys)


def rows(episodes, names, inst_keys: list[str], targets_all: list[str]):
    """Per (episode, group): descriptor row X_d, medium-feature row X_m, and per-target values."""
    Xd, Xm, meta = [], [], []
    Y = {t: [] for t in targets_all}; YB = {t: [] for t in targets_all}; YC = {t: [] for t in targets_all}
    TOL = {t: [] for t in targets_all}; SC = {t: [] for t in targets_all}
    for ep in episodes:
        inst = ep["instance"]; iv = _interv_vec(ep["interv"], names)
        for g in ep["groups"]:
            pd_ = g["protocol_desc"]
            d = [inst.get(k, 1.0) for k in inst_keys] + iv + [1.0 if g["name"] == gn else 0.0 for gn in GROUP_NAMES]
            d += [pd_.get(f"t{i}", 0.0) for i in range(6)] + [pd_.get(f"v{i}", 0.0) for i in range(6)]
            f = g["features_by_subset"][()]
            m = []
            for c in names:
                m += [f[c]["share"], f[c]["peak"], f[c]["t_peak"], f[c]["late_over_peak"]]
            m += [f["_V"]["min"], f["_V"]["max"], f["_V"]["mean"]]
            m += [g["ybase"].get(t, 0.0) if t != "v_rmse" else 0.0 for t in targets_all]
            m += [g["discrepancy"][c] for c in names]
            Xd.append(d); Xm.append(m); meta.append((ep["seed"], ep["family"], g["name"]))
            for t in targets_all:
                present = t in g["targets"]
                Y[t].append(g["ystar"][t] if present else np.nan)
                YB[t].append(g["ybase"].get(t, np.nan) if present else np.nan)
                # coarse-level target values are not stored per target; the coarse error is (errs['coarse_all'])
                YC[t].append(g["errs"]["coarse_all"][t] * g["scale"][t] if present else np.nan)   # abs error of coarse
                TOL[t].append(g["tol"][t] * g["scale"][t] if present else np.nan)                  # abs tolerance
                SC[t].append(g["scale"][t] if present else np.nan)
    return (np.array(Xd, float), np.array(Xm, float), meta, {t: np.array(v) for t, v in Y.items()}, {t: np.array(v) for t, v in YB.items()},
            {t: np.array(v) for t, v in YC.items()}, {t: np.array(v) for t, v in TOL.items()}, {t: np.array(v) for t, v in SC.items()})


class Ensemble:
    def __init__(self, n_members=5, seed=0):
        self.n_members, self.seed = n_members, seed

    def fit(self, X, y):
        m = np.isfinite(y); X = np.asarray(X, float)[m]; y = np.asarray(y, float)[m]
        self.scaler = StandardScaler().fit(X); Xs = self.scaler.transform(X)
        rng = np.random.default_rng(self.seed); n = len(y); self.members = []
        for k in range(self.n_members):
            idx = rng.integers(0, n, size=n)
            r = HistGradientBoostingRegressor(max_iter=500, learning_rate=0.05, max_leaf_nodes=31, random_state=self.seed * 100 + k,
                                              early_stopping=True, l2_regularization=1e-3)
            r.fit(Xs[idx], y[idx]); self.members.append(r)
        return self

    def predict(self, X):
        Xs = self.scaler.transform(np.asarray(X, float))
        P = np.stack([m.predict(Xs) for m in self.members]); return P.mean(0), P.std(0)


def fit_and_evaluate(train, val, test, ood: dict, names: list[str], seed: int = 0, n_members: int = 5) -> dict:
    """Train emulator (H5) and hybrid closure (H8) on `train`, calibrate gates on `val`, evaluate on
    test (ID) and every OOD family.  Returns a JSON-serialisable report and a long table."""
    targets_all = sorted({t for ep in train for g in ep["groups"] for t in g["targets"]} - {"v_rmse"})
    inst_keys = descriptor_keys(train)
    R = {}
    t0 = time.time()
    Xd_tr, Xm_tr, _, Y_tr, YB_tr, _, _, _ = rows(train, names, inst_keys, targets_all)
    Xd_va, Xm_va, _, Y_va, YB_va, _, TOL_va, _ = rows(val, names, inst_keys, targets_all)
    Xh_tr = np.hstack([Xd_tr, Xm_tr]); Xh_va = np.hstack([Xd_va, Xm_va])
    emu, hyb = {}, {}
    for t in targets_all:
        emu[t] = Ensemble(n_members, seed).fit(Xd_tr, Y_tr[t])
        hyb[t] = Ensemble(n_members, seed + 1).fit(Xh_tr, Y_tr[t] - YB_tr[t])
    train_wall = time.time() - t0
    # gates fitted on training inputs; thresholds calibrated on validation
    rg_d = RangeGuard().fit(Xd_tr); knn_d = KNNDensity(k=10).fit(Xd_tr)
    rg_h = RangeGuard().fit(Xh_tr); knn_h = KNNDensity(k=10).fit(Xh_tr)

    def predict_all(Xd, Xm):
        Xh = np.hstack([Xd, Xm]); out = {}
        for t in targets_all:
            pe, se = emu[t].predict(Xd); ph, sh = hyb[t].predict(Xh)
            out[t] = (pe, se, ph, sh)
        return out
    # conformal normalisation on validation: q = quantile_{0.95} of |resid| / std
    pv = predict_all(Xd_va, Xm_va)
    q_emu, q_hyb = {}, {}
    for t in targets_all:
        m = np.isfinite(Y_va[t])
        pe, se, ph, sh = pv[t]
        r_e = np.abs(pe[m] - Y_va[t][m]) / np.maximum(se[m], 1e-9); r_h = np.abs(ph[m] + YB_va[t][m] - Y_va[t][m]) / np.maximum(sh[m], 1e-9)
        q_emu[t] = float(np.quantile(r_e, 0.95)) if m.sum() > 5 else 1.0; q_hyb[t] = float(np.quantile(r_h, 0.95)) if m.sum() > 5 else 1.0
    # gate thresholds at 95 % ID coverage on validation (per gate; per model family)
    thr = {}
    for kind, rg, knn, X in (("emulator", rg_d, knn_d, Xd_va), ("hybrid", rg_h, knn_h, Xh_va)):
        thr[kind] = {"range": float(np.quantile(rg.score(X), 0.95)), "knn": float(np.quantile(knn.score(X), 0.95))}
        std_rel = []
        for t in targets_all:
            m = np.isfinite(Y_va[t]); s = pv[t][1] if kind == "emulator" else pv[t][3]
            std_rel.append(s[m] / np.maximum(TOL_va[t][m], 1e-12))
        thr[kind]["ens_std"] = float(np.quantile(np.concatenate(std_rel), 0.95))
        thr[kind]["conformal"] = 1.0   # safe if the calibrated interval half-width <= tolerance
    rows_out = []
    fams = {"id": test, **ood}
    for fam, eps in fams.items():
        Xd, Xm, meta, Y, YB, YCerr, TOL, SC = rows(eps, names, inst_keys, targets_all)
        Xh = np.hstack([Xd, Xm])
        t1 = time.time(); P = predict_all(Xd, Xm); inf_wall = (time.time() - t1) / max(len(Xd), 1)
        g_scores = {"emulator": {"range": rg_d.score(Xd), "knn": knn_d.score(Xd)}, "hybrid": {"range": rg_h.score(Xh), "knn": knn_h.score(Xh)}}
        for i, (sd, fam_i, gname) in enumerate(meta):
            ep = eps[[k for k, e in enumerate(eps) if e["seed"] == sd][0]]
            g = [gg for gg in ep["groups"] if gg["name"] == gname][0]
            for t in targets_all:
                if not np.isfinite(Y[t][i]):
                    continue
                tol = TOL[t][i]; y = Y[t][i]
                pe, se, ph, sh = (P[t][0][i], P[t][1][i], P[t][2][i], P[t][3][i])
                preds = {"coarse": (np.nan, YCerr[t][i]), "medium": (YB[t][i], abs(YB[t][i] - y)), "hybrid": (YB[t][i] + ph, abs(YB[t][i] + ph - y)),
                         "emulator": (pe, abs(pe - y)), "fine": (y, g["err_fine_numerical"][t] * SC[t][i])}
                costs = {"coarse": g["costs"]["coarse_all"], "medium": g["cost_base"], "hybrid": g["cost_base"], "emulator": 0.0, "fine": g["cost_fine"]}
                walls = {"coarse": g["walls"]["coarse_all"], "medium": g["wall_base"], "hybrid": g["wall_base"] + inf_wall, "emulator": inf_wall, "fine": g["wall_fine"]}
                for cl in CLOSURES:
                    val, err = preds[cl]
                    row = {"family": fam, "seed": sd, "group": gname, "target": t, "closure": cl, "err_abs": float(err), "err_rel_tol": float(err / max(tol, 1e-12)),
                           "cost": float(costs[cl]), "wall": float(walls[cl]), "cost_fine": float(g["cost_fine"]), "wall_fine": float(g["wall_fine"]), "value": float(val) if np.isfinite(val) else np.nan}
                    if cl in ("emulator", "hybrid"):
                        kind = cl; std = se if cl == "emulator" else sh; q = q_emu[t] if cl == "emulator" else q_hyb[t]
                        row["gate_ens_std"] = float(std / max(tol, 1e-12)); row["gate_knn"] = float(g_scores[kind]["knn"][i]); row["gate_range"] = float(g_scores[kind]["range"][i])
                        row["gate_conformal"] = float(std * q / max(tol, 1e-12))
                        for gate in GATES:
                            row[f"safe_{gate}"] = bool(row[f"gate_{gate}"] <= thr[kind][gate])
                        if cl == "hybrid":
                            row["gate_discrepancy"] = float(max(g["discrepancy"].values())); row["safe_discrepancy"] = bool(row["gate_discrepancy"] <= 0.5)
                    rows_out.append(row)
    df = pd.DataFrame(rows_out)
    # summary
    summ = {"targets": targets_all, "n_descriptor_features": int(Xd_tr.shape[1]), "n_hybrid_features": int(Xh_tr.shape[1]), "train_wall_s": train_wall,
            "gate_thresholds": thr, "conformal_q_emulator": q_emu, "conformal_q_hybrid": q_hyb, "by_family": {}}
    for fam in fams:
        d = df[df.family == fam]; S = {}
        for cl in CLOSURES:
            dc = d[d.closure == cl]
            S[cl] = {"err_rel_tol_mean": float(dc.err_rel_tol.mean()), "err_rel_tol_median": float(dc.err_rel_tol.median()),
                     "within_tol_rate": float((dc.err_rel_tol <= 1.0).mean()), "cost_frac_fine": float((dc.cost / dc.cost_fine).mean()),
                     "wall_frac_fine": float((dc.wall / dc.wall_fine).mean()), "n": int(len(dc))}
            if cl in ("emulator", "hybrid"):
                bad = dc.err_rel_tol > 1.0
                gates = GATES + (["discrepancy"] if cl == "hybrid" else [])
                S[cl]["gates"] = {}
                for gate in gates:
                    safe = dc[f"safe_{gate}"].values.astype(bool)
                    S[cl]["gates"][gate] = {"coverage": float(safe.mean()), "false_safe_rate": float(np.mean(safe[bad.values])) if bad.any() else np.nan,
                                            "err_given_safe": float(dc.err_rel_tol.values[safe].mean()) if safe.any() else np.nan,
                                            "within_tol_given_safe": float((dc.err_rel_tol.values[safe] <= 1.0).mean()) if safe.any() else np.nan,
                                            "fallback_cost_frac_fine": float(np.mean(np.where(safe, dc.cost / dc.cost_fine, 1.0 + dc.cost / dc.cost_fine))),
                                            "post_fallback_err_rel_tol": float(np.mean(np.where(safe, dc.err_rel_tol, d[d.closure == "fine"].err_rel_tol.values)))}
        # constraint preservation: spike_count >= 0, recovery_fraction in [0, 1.05], min_isi > 0
        viol = {}
        for cl in ("hybrid", "emulator"):
            dc = d[d.closure == cl]
            v = 0; n = 0
            for t, lo_, hi_ in (("spike_count", -1e-9, np.inf), ("recovery_fraction", -1e-9, 1.05), ("min_isi", 0.0, np.inf), ("time_to_peak", 0.0, np.inf)):
                x = dc[dc.target == t].value.values; n += len(x); v += int(((x < lo_) | (x > hi_)).sum())
            viol[cl] = {"violations": v, "n": n, "rate": v / n if n else np.nan}
        S["constraint_violations"] = viol
        summ["by_family"][fam] = S
    # amortised speed-up of the emulator vs one fine call (wall), and break-even query count
    fine_wall = float(df[df.closure == "fine"].wall.mean()); inf = float(df[df.closure == "emulator"].wall.mean())
    summ["speedup_wall_fine_over_emulator"] = fine_wall / max(inf, 1e-9)
    summ["break_even_queries"] = train_wall / max(fine_wall - inf, 1e-9)
    return summ, df

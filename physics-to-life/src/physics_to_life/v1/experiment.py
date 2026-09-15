"""Policy evaluation for V1 by exact lookup over the labelled subset table.

Because `label_episode` simulates every subset of channels refined on top of the base
level, any one-shot or sequential policy can be scored exactly without re-simulation:
its error is errs[S][target] and its cost is the sum of the simulations it would have run
(base run for feature extraction, intermediate runs for sequential policies, an extra
coarse run for the discrepancy monitor).  Nothing is hidden in the cost.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import numpy as np
import pandas as pd

from .routing import TARGET_NAMES, GROUP_NAMES, RATE_KEYS


def row_features(ep: dict, g: dict, tgt: str, c: str, names: list[str], S: tuple, cost_increment: dict) -> list:
    """Feature row for candidate 'refine c' at partial-refinement state S."""
    f = g["features_by_subset"][S]; interv = ep["interv"]
    shares = np.array([f[n]["share"] for n in names]); rank = (-shares).argsort().argsort()
    i = names.index(c)
    row = [1.0 if tgt == t else 0.0 for t in TARGET_NAMES]
    row += [1.0 if g["name"] == gn else 0.0 for gn in GROUP_NAMES]
    row += [1.0 if c == cn else 0.0 for cn in names]
    row += [f[c]["share"], f[c]["peak"], f[c]["t_peak"], f[c]["late_over_peak"], f["_V"]["min"], f["_V"]["max"], f["_V"]["mean"]]
    gs_self = interv.g_scales.get(c, 1.0); others = [interv.g_scales.get(o, 1.0) for o in names if o != c]
    row += [gs_self, max(others), min(others), (interv.T_K or 295.15) - 273.15, interv.K_out or 5.0,
            interv.block_frac.get(c, 0.0), interv.block_conc.get(c, 0.0), interv.i_extra]
    row += [interv.rate_scales.get(k, 1.0) for k in RATE_KEYS]
    # tolerance of the requested target (the full-state policy asks for v_rmse rows on groups without that target: use the group's first target's tolerance)
    tol = g["tol"].get(tgt, g["tol"][g["targets"][0]])
    row += [g["cost_base"], cost_increment.get(c, 1.0), float(rank[i]), float(len(S)), 1.0 if c in S else 0.0, float(tol)]
    return row


def training_rows(episodes: list[dict], names: list[str], include_partial: bool = True):
    """Rows for (group, target, channel) at the base state and, optionally, at every partial state
    (for the sequential router). Labels: marginal gain of refining c from that state."""
    X, y_gain, y_hard, keys = [], [], [], []
    for ep in episodes:
        for g in ep["groups"]:
            inc = {c: g["costs"][(c,)] - g["costs"][()] for c in names}
            states = [()] + ([S for S in g["features_by_subset"] if S != () and len(S) < len(names)] if include_partial else [])
            for S in states:
                for tgt in g["targets"]:
                    for c in names:
                        if c in S:
                            continue
                        S2 = tuple(sorted(set(S) | {c}, key=names.index))
                        gain = g["errs"][S][tgt] - g["errs"][S2][tgt]
                        # label in tolerance units, log-compressed (pilot-audit correction: raw gains are zero-inflated and
                        # heavy-tailed; the regressor's job is the decision 'is the gain worth its cost', not the tail)
                        X.append(row_features(ep, g, tgt, c, names, S, inc)); y_gain.append(np.log1p(max(gain, 0.0) / g["tol"][tgt]))
                        y_hard.append(1 if c in g["minimal"][tgt] else 0); keys.append((ep["seed"], g["name"], tgt, c, S))
    return np.array(X, float), np.array(y_gain, float), np.array(y_hard, int), keys


@dataclass
class PolicyRow:
    policy: str
    param: float
    S: tuple
    err: float
    err_rel_tol: float
    cost: float
    wall: float
    n_sims: int
    n_refined: int
    tp: int
    fp: int
    fn: int
    necessary: bool
    safe_declared: bool
    scores: Optional[dict] = None


LAMBDAS = [0.0, 1e-7, 3e-7, 1e-6, 3e-6, 1e-5, 3e-5, 1e-4, 3e-4, 1e-3]
TAUS = [0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9]


def _sorted(S, names):
    return tuple(sorted(set(S), key=names.index))


def evaluate_policies(ep: dict, g: dict, tgt: str, names: list[str], models: dict, rng: np.random.Generator,
                      s_min: float = 0.05, lambdas=LAMBDAS, taus=TAUS) -> list[PolicyRow]:
    errs, costs, walls = g["errs"], g["costs"], g["walls"]
    tol = g["tol"][tgt]; minimal = set(g["minimal"][tgt]); necessary = len(minimal) > 0
    all_S = tuple(names)
    inc = {c: costs[(c,)] - costs[()] for c in names}
    base_cost, base_wall = costs[()], walls[()]

    def mk(name, param, S, cost, wall, n_sims, scores=None):
        S = _sorted(S, names) if S != "coarse_all" else S
        e = errs[S][tgt]
        refined = set(S) if S != "coarse_all" else set()
        tp = len(refined & minimal); fp = len(refined - minimal); fn = len(minimal - refined)
        return PolicyRow(name, float(param), S if S != "coarse_all" else ("coarse",), float(e), float(e / max(tol, 1e-12)),
                         float(cost), float(wall), n_sims, len(refined), tp, fp, fn, necessary, len(refined) == 0, scores)

    rows = []
    rows.append(mk("uniform_coarse", 0, "coarse_all", costs["coarse_all"], walls["coarse_all"], 1))
    rows.append(mk("uniform_medium", 1, (), base_cost, base_wall, 1))
    rows.append(mk("uniform_fine", 2, all_S, costs[all_S], walls[all_S], 1))
    # random
    order = list(rng.permutation(names))
    for m in range(len(names) + 1):
        S = tuple(order[:m]); rows.append(mk("random", m, S, costs[_sorted(S, names)], walls[_sorted(S, names)], 1))
    # share heuristic (needs the base run)
    f0 = g["features_by_subset"][()]
    share_order = sorted(names, key=lambda c: -f0[c]["share"])
    for m in range(len(names) + 1):
        S = _sorted(share_order[:m], names)
        rows.append(mk("share", m, S, base_cost + (costs[S] if m else 0.0), base_wall + (walls[S] if m else 0.0), 1 + (1 if m else 0)))
    # discrepancy heuristic (needs base + coarse runs)
    for tau in taus:
        S = _sorted([c for c in names if g["discrepancy"][c] >= tau], names)
        extra = base_cost + costs["coarse_all"]
        rows.append(mk("discrepancy", tau, S, extra + (costs[S] if S else 0.0), base_wall + walls["coarse_all"] + (walls[S] if S else 0.0), 2 + (1 if S else 0),
                       {c: g["discrepancy"][c] for c in names}))
    # adjoint / goal-oriented surrogate: sensitivity of the target to the channel x its closure discrepancy,
    # charged the base run, the coarse run and one base-level sensitivity run per channel
    sens_score = {c: g["sensitivity"][c][tgt] * g["discrepancy"][c] for c in names}
    sens_extra = base_cost + costs["coarse_all"] + g["sensitivity_cost"]; sens_wextra = base_wall + walls["coarse_all"] + g["sensitivity_wall"]
    smax = max(sens_score.values()) + 1e-12
    for tau in taus:
        S = _sorted([c for c in names if sens_score[c] / smax >= tau] if smax > 1e-9 else [], names)
        rows.append(mk("sensitivity", tau, S, sens_extra + (costs[S] if S else 0.0), sens_wextra + (walls[S] if S else 0.0), 2 + len(names) + (1 if S else 0),
                       {c: sens_score[c] for c in names}))
    # novelty (DynIm-style farthest-point distance of the candidate's feature row to the training set) and
    # uncertainty (AdaLED-style ensemble disagreement) triggers, both needing only the base run
    if models.get("voc") is not None:
        X = np.array([row_features(ep, g, tgt, c, names, (), inc) for c in names])
        pred, std = models["voc"].predict(X)
        if models.get("novelty") is not None:
            nov = models["novelty"].score(X)
            for q in (0.5, 0.75, 0.9, 0.95, 0.99):
                thr = models["novelty_quantiles"][q]
                S = _sorted([c for c, v in zip(names, nov) if v > thr], names)
                rows.append(mk("novelty", q, S, base_cost + (costs[S] if S else 0.0), base_wall + (walls[S] if S else 0.0), 1 + (1 if S else 0)))
        smax_u = max(std.max(), 1e-12)
        for tau in taus:
            S = _sorted([c for c, v in zip(names, std) if v / smax_u >= tau], names)
            rows.append(mk("uncertainty", tau, S, base_cost + (costs[S] if S else 0.0), base_wall + (walls[S] if S else 0.0), 1 + (1 if S else 0)))
        # uncertainty-per-cost allocation (misoKG-style proxy): rank by std / cost increment
        upc = std / np.array([inc[c] for c in names])
        for lam in lambdas:
            S = _sorted([c for c, v in zip(names, upc) if v > lam], names)
            rows.append(mk("uncertainty_per_cost", lam, S, base_cost + (costs[S] if S else 0.0), base_wall + (walls[S] if S else 0.0), 1 + (1 if S else 0)))
    # HyPER-style causal-blind policy: a learned VoC trained on the FULL-STATE (trajectory) error gain, applied to every target
    if models.get("voc_fullstate") is not None:
        X = np.array([row_features(ep, g, "v_rmse", c, names, (), inc) for c in names])
        pred_fs, _ = models["voc_fullstate"].predict(X)
        v_fs = pred_fs / np.array([inc[c] for c in names])
        for lam in lambdas:
            S = _sorted([c for c, v in zip(names, v_fs) if v > lam], names)
            rows.append(mk("fullstate_voc", lam, S, base_cost + (costs[S] if S else 0.0), base_wall + (walls[S] if S else 0.0), 1 + (1 if S else 0)))
    # learned one-shot policies
    for mname, model, kind in (("voc", models.get("voc"), "gain"), ("hardlabel", models.get("hard"), "prob")):
        if model is None:
            continue
        X = np.array([row_features(ep, g, tgt, c, names, (), inc) for c in names])
        pred, std = model.predict(X)
        if kind == "gain":
            voc = pred / np.array([inc[c] for c in names])
            for lam in lambdas:
                S = _sorted([c for c, v in zip(names, voc) if v > lam], names)
                rows.append(mk("voc", lam, S, base_cost + (costs[S] if S else 0.0), base_wall + (walls[S] if S else 0.0), 1 + (1 if S else 0),
                               {"pred": dict(zip(names, pred)), "std": dict(zip(names, std))}))
                # hybrid: physics candidate set by current share, learned ranking within it
                Sh = _sorted([c for c, v in zip(names, voc) if v > lam and f0[c]["share"] >= s_min], names)
                rows.append(mk("hybrid", lam, Sh, base_cost + (costs[Sh] if Sh else 0.0), base_wall + (walls[Sh] if Sh else 0.0), 1 + (1 if Sh else 0)))
        else:
            for tau in taus:
                S = _sorted([c for c, p in zip(names, pred) if p >= tau], names)
                rows.append(mk("hardlabel", tau, S, base_cost + (costs[S] if S else 0.0), base_wall + (walls[S] if S else 0.0), 1 + (1 if S else 0),
                               {"prob": dict(zip(names, pred)), "std": dict(zip(names, std))}))
    # learned sequential (separate condition): greedy by predicted VoC at the current state
    if models.get("voc") is not None:
        for variant, restrict in (("voc_seq", False), ("hybrid_seq", True)):
            path = []  # (S, cum_cost, cum_wall, n_sims, best_voc_next)
            S = (); cum_cost, cum_wall, n_sims = base_cost, base_wall, 1
            for it in range(len(names) + 1):
                cand = [c for c in names if c not in S and (not restrict or g["features_by_subset"][S][c]["share"] >= s_min)]
                if not cand:
                    path.append((S, cum_cost, cum_wall, n_sims, -np.inf)); break
                X = np.array([row_features(ep, g, tgt, c, names, S, inc) for c in cand])
                pred, _ = models["voc"].predict(X)
                voc = pred / np.array([inc[c] for c in cand])
                j = int(np.argmax(voc)); path.append((S, cum_cost, cum_wall, n_sims, float(voc[j])))
                if voc[j] <= min(lambdas) or it == len(names):
                    break
                S = _sorted(S + (cand[j],), names); cum_cost += costs[S]; cum_wall += walls[S]; n_sims += 1
            for lam in lambdas:
                chosen = path[-1]
                for st in path:
                    if st[4] <= lam:
                        chosen = st; break
                rows.append(mk(variant, lam, chosen[0], chosen[1], chosen[2], chosen[3]))
    # oracles
    rows.append(mk("oracle", 0, tuple(minimal), costs[_sorted(minimal, names)], walls[_sorted(minimal, names)], 1))
    true_voc = {c: (g["gains"][tgt][c] / tol) / inc[c] for c in names}
    for lam in lambdas:
        S = _sorted([c for c in names if true_voc[c] > lam], names)
        rows.append(mk("oracle_voc", lam, S, costs[S], walls[S], 1))
    return rows


def rows_to_frame(rows: list[dict]) -> pd.DataFrame:
    return pd.DataFrame(rows)


def evaluate_episodes(episodes: list[dict], names: list[str], models: dict, seed: int = 0) -> pd.DataFrame:
    out = []
    for ep in episodes:
        rng = np.random.default_rng(seed + 17 * ep["seed"])
        for g in ep["groups"]:
            for tgt in g["targets"]:
                for r in evaluate_policies(ep, g, tgt, names, models, rng):
                    out.append({"seed": ep["seed"], "family": ep["family"], "group": g["name"], "target": tgt,
                                "policy": r.policy, "param": r.param, "S": r.S, "err": r.err, "err_rel_tol": r.err_rel_tol,
                                "cost": r.cost, "wall": r.wall, "n_sims": r.n_sims, "n_refined": r.n_refined,
                                "tp": r.tp, "fp": r.fp, "fn": r.fn, "necessary": r.necessary, "safe_declared": r.safe_declared,
                                "cost_fine": g["cost_fine"], "cost_base": g["cost_base"], "cost_coarse": g["costs"]["coarse_all"],
                                "tol": g["tol"][tgt]})
    return pd.DataFrame(out)


def frontier_table(df: pd.DataFrame, n_boot: int = 300, seed: int = 0) -> pd.DataFrame:
    """Per (family, target, policy, param): mean err/tol, success rate, mean cost (nominal, wall),
    selection precision/recall, and the false-safe rate (safe declared while necessary)."""
    from ..evaluation.metrics import bootstrap_ci
    out = []
    for (fam, tgt, pol, par), g in df.groupby(["family", "target", "policy", "param"], sort=False):
        lo, hi = bootstrap_ci(g["err_rel_tol"].values, n_boot=n_boot, seed=seed)
        nec = g["necessary"].values.astype(bool)
        fs = float(np.mean(g["safe_declared"].values[nec])) if nec.any() else np.nan
        tp, fp, fn = g["tp"].sum(), g["fp"].sum(), g["fn"].sum()
        out.append({"family": fam, "target": tgt, "policy": pol, "param": par, "n": len(g),
                    "err_rel_tol_mean": g["err_rel_tol"].mean(), "err_lo": lo, "err_hi": hi, "err_median": g["err_rel_tol"].median(),
                    "success_rate": float((g["err_rel_tol"] <= 1.0).mean()), "cost_mean": g["cost"].mean(),
                    "cost_frac_fine": float((g["cost"] / g["cost_fine"]).mean()), "wall_mean": g["wall"].mean(),
                    "n_refined_mean": g["n_refined"].mean(), "precision": tp / (tp + fp) if tp + fp else 1.0,
                    "recall": tp / (tp + fn) if tp + fn else 1.0, "false_safe_rate": fs, "n_necessary": int(nec.sum())})
    return pd.DataFrame(out)


def pooled_frontier(df: pd.DataFrame, n_boot: int = 300, seed: int = 0) -> pd.DataFrame:
    """Pooled over targets (err/tol is dimensionless), per (family, policy, param)."""
    from ..evaluation.metrics import bootstrap_ci
    out = []
    for (fam, pol, par), g in df.groupby(["family", "policy", "param"], sort=False):
        lo, hi = bootstrap_ci(g["err_rel_tol"].values, n_boot=n_boot, seed=seed)
        nec = g["necessary"].values.astype(bool)
        out.append({"family": fam, "policy": pol, "param": par, "n": len(g), "err_rel_tol_mean": g["err_rel_tol"].mean(),
                    "err_lo": lo, "err_hi": hi, "success_rate": float((g["err_rel_tol"] <= 1.0).mean()),
                    "cost_frac_fine": float((g["cost"] / g["cost_fine"]).mean()), "wall_mean": g["wall"].mean(),
                    "false_safe_rate": float(np.mean(g["safe_declared"].values[nec])) if nec.any() else np.nan})
    return pd.DataFrame(out)

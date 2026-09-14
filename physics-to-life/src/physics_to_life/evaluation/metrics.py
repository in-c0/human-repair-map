"""Aggregation of condition runs into accuracy/compute frontiers and selection metrics."""
from __future__ import annotations

import numpy as np
import pandas as pd

SCALAR_COLS = ["seed", "family", "policy", "param", "abs_err", "cost", "wall", "n_fine", "fine_node_steps",
               "n_sims", "n_iter", "tp", "fp", "fn", "n_necessary"]


def rows_to_frame(rows: list[dict]) -> pd.DataFrame:
    return pd.DataFrame([{k: r[k] for k in SCALAR_COLS} for r in rows])


def bootstrap_ci(x: np.ndarray, n_boot: int = 1000, seed: int = 0, stat=np.mean, alpha: float = 0.05):
    x = np.asarray(x, float)
    if len(x) == 0:
        return np.nan, np.nan
    rng = np.random.default_rng(seed)
    idx = rng.integers(0, len(x), size=(n_boot, len(x)))
    vals = stat(x[idx], axis=1)
    return float(np.quantile(vals, alpha / 2)), float(np.quantile(vals, 1 - alpha / 2))


def selection_metrics(g: pd.DataFrame) -> dict:
    tp, fp, fn = g["tp"].sum(), g["fp"].sum(), g["fn"].sum()
    prec = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 1.0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0.0
    waste = float(np.mean(np.where(g["n_fine"] > 0, g["fp"] / np.maximum(g["n_fine"], 1), 0.0)))
    miss = float(np.mean(np.where(g["n_necessary"] > 0, g["fn"] / np.maximum(g["n_necessary"], 1), 0.0)))
    return {"precision": float(prec), "recall": float(rec), "f1": float(f1), "waste": waste, "miss": miss}


def pareto_table(df: pd.DataFrame, tol_ref: float, n_boot: int = 1000) -> pd.DataFrame:
    out = []
    for (fam, pol, par), g in df.groupby(["family", "policy", "param"], sort=False):
        lo, hi = bootstrap_ci(g["abs_err"].values, n_boot=n_boot)
        clo, chi = bootstrap_ci(g["cost"].values, n_boot=n_boot)
        row = {"family": fam, "policy": pol, "param": par, "n": len(g),
               "err_mean": g["abs_err"].mean(), "err_lo": lo, "err_hi": hi, "err_median": g["abs_err"].median(),
               "err_p90": g["abs_err"].quantile(0.9), "err_max": g["abs_err"].max(),
               "cost_mean": g["cost"].mean(), "cost_lo": clo, "cost_hi": chi, "wall_mean": g["wall"].mean(),
               "n_fine_mean": g["n_fine"].mean(), "n_sims_mean": g["n_sims"].mean(),
               "success_rate": float((g["abs_err"] <= tol_ref).mean())}
        row.update(selection_metrics(g))
        out.append(row)
    return pd.DataFrame(out)


def _curve(tab: pd.DataFrame, policy: str, family: str, fallback: bool = True):
    """(mean cost, mean error) points of a policy's sweep.  For adaptive policies the
    uniform-medium point is appended as an always-available fallback: with a budget below a
    policy's own minimum cost one simply runs the cheap model."""
    t = tab[(tab.policy == policy) & (tab.family == family)].sort_values("cost_mean")
    c, e = t["cost_mean"].values, t["err_mean"].values
    if fallback and not policy.startswith("uniform"):
        m = tab[(tab.policy == "uniform_medium") & (tab.family == family)]
        if not m.empty:
            c = np.append(c, m["cost_mean"].values[0]); e = np.append(e, m["err_mean"].values[0])
            o = np.argsort(c); c, e = c[o], e[o]
    return c, e


def interp_error_at_cost(cost, err, budget):
    """Best (lowest) error achievable at mean cost <= budget along a policy's sweep."""
    m = cost <= budget
    return float(err[m].min()) if m.any() else np.nan


def cost_to_reach(cost, err, tol):
    m = err <= tol
    return float(cost[m].min()) if m.any() else np.inf


def frontier_summary(tab: pd.DataFrame, family: str, tol_levels, budgets) -> pd.DataFrame:
    rows = []
    for pol in tab[tab.family == family].policy.unique():
        c, e = _curve(tab, pol, family)
        row = {"family": family, "policy": pol, "n_points": len(c)}
        for tol in tol_levels:
            row[f"cost_to_err<={tol}"] = cost_to_reach(c, e, tol)
        for b in budgets:
            row[f"err_at_cost<={int(b)}"] = interp_error_at_cost(c, e, b)
        rows.append(row)
    return pd.DataFrame(rows)


def bootstrap_curve_difference(df: pd.DataFrame, family: str, pol_a: str, pol_b: str, cost_grid,
                               n_boot: int = 300, seed: int = 0):
    """Paired bootstrap over episodes of err_a(c) - err_b(c) where err_p(c) is the lowest mean
    error the policy's sweep achieves at mean cost <= c.  Negative = a better than b."""
    d = df[df.family == family]
    seeds = np.array(sorted(d.seed.unique()))
    rng = np.random.default_rng(seed)
    A = d[d.policy == pol_a]; B = d[d.policy == pol_b]
    # the uniform-medium run is the always-available fallback point (param = -1) for both policies
    Mrows = d[d.policy == "uniform_medium"].copy(); Mrows["param"] = -1.0
    A = pd.concat([A, Mrows]); B = pd.concat([B, Mrows]) if not pol_b.startswith("uniform") else B
    pa = A.pivot_table(index="seed", columns="param", values="abs_err"); ca = A.pivot_table(index="seed", columns="param", values="cost")
    pb = B.pivot_table(index="seed", columns="param", values="abs_err"); cb = B.pivot_table(index="seed", columns="param", values="cost")
    pa, ca, pb, cb = (x.reindex(seeds) for x in (pa, ca, pb, cb))
    diffs = np.zeros((n_boot, len(cost_grid)))
    for b in range(n_boot):
        idx = rng.integers(0, len(seeds), size=len(seeds))
        ea, xa = pa.values[idx].mean(axis=0), ca.values[idx].mean(axis=0)
        eb, xb = pb.values[idx].mean(axis=0), cb.values[idx].mean(axis=0)
        for i, c in enumerate(cost_grid):
            diffs[b, i] = interp_error_at_cost(xa, ea, c) - interp_error_at_cost(xb, eb, c)
    return {"cost_grid": np.asarray(cost_grid), "mean": np.nanmean(diffs, axis=0),
            "lo": np.nanquantile(diffs, 0.025, axis=0), "hi": np.nanquantile(diffs, 0.975, axis=0)}

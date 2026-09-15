#!/usr/bin/env python
"""Preregistered verdicts for a finished V1 run (preregistration §1, §7, §8).

Operating points: 15 %, 30 % (principal), 50 % of the uniform-fine nominal cost.  For every
policy the parameter attaining a budget is chosen on the VALIDATION split (last 20 % of the
training seeds, evaluated here by exact lookup) and applied unchanged to the test set.  Paired
bootstrap (B = 2000) over test (episode, group, target) rows of the mean error/tolerance
difference learned - baseline; Holm correction over the three operating points per hypothesis
and condition.  One-shot (voc, hybrid) and sequential (voc_seq, hybrid_seq) are separate
conditions.  Writes <run_dir>/verdicts.json and verdicts.md.
"""
from __future__ import annotations
import argparse, json, pickle, sys
from pathlib import Path
import numpy as np
import pandas as pd
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.evaluation.provenance import write_json  # noqa: E402
from physics_to_life.v1.experiment import evaluate_episodes  # noqa: E402
from physics_to_life.v1.routing import set_schema  # noqa: E402
from physics_to_life.v1.systems import gunay2015_profile as GP  # noqa: E402

BUDGETS = [0.15, 0.30, 0.50]; PRINCIPAL = 0.30
CONDITIONS = {"one_shot": {"learned": ["voc", "hybrid"], "baselines": ["uniform_medium", "share", "discrepancy", "sensitivity", "novelty", "uncertainty", "uncertainty_per_cost", "fullstate_voc", "hardlabel", "random"]},
              "sequential": {"learned": ["voc_seq", "hybrid_seq"], "baselines": ["uniform_medium", "share", "discrepancy", "sensitivity", "novelty", "uncertainty", "uncertainty_per_cost", "fullstate_voc", "hardlabel", "random"]}}
MIN_EFFECT = 0.8   # learned error <= 0.8 x best baseline at the principal point


def select_params(val: pd.DataFrame, policy: str, budget: float):
    """Parameter with mean cost fraction <= budget and the lowest mean error on validation
    (if none is within budget, the cheapest parameter)."""
    g = val[val.policy == policy].groupby("param").agg(cost=("cost_frac", "mean"), err=("err_rel_tol", "mean")).reset_index()
    if not len(g):
        return None
    within = g[g.cost <= budget]
    row = within.sort_values("err").iloc[0] if len(within) else g.sort_values("cost").iloc[0]
    return float(row.param)


def attained(val: pd.DataFrame, policy: str, budget: float) -> bool:
    """Whether any parameter of the policy stays within the budget on validation."""
    g = val[val.policy == policy].groupby("param").cost_frac.mean()
    return bool(len(g) and (g <= budget).any())


def paired_bootstrap(a: np.ndarray, b: np.ndarray, n_boot: int = 2000, seed: int = 0):
    rng = np.random.default_rng(seed); n = len(a); d = a - b
    idx = rng.integers(0, n, size=(n_boot, n))
    means = d[idx].mean(axis=1)
    return float(d.mean()), float(np.quantile(means, 0.025)), float(np.quantile(means, 0.975))


def holm(pvals: list[float]) -> list[float]:
    m = len(pvals); order = np.argsort(pvals); adj = np.empty(m)
    prev = 0.0
    for rank, i in enumerate(order):
        adj[i] = max(prev, min(1.0, (m - rank) * pvals[i])); prev = adj[i]
    return list(adj)


def boot_pvalue(a, b, n_boot=2000, seed=0):
    """Two-sided bootstrap p-value for mean(a - b) = 0 (percentile inversion)."""
    rng = np.random.default_rng(seed); d = a - b; n = len(d)
    means = d[rng.integers(0, n, size=(n_boot, n))].mean(axis=1)
    p_low = float(np.mean(means >= 0)); p_high = float(np.mean(means <= 0))
    return max(1e-4, min(1.0, 2 * min(p_low, p_high)))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--run-dir", required=True); ap.add_argument("--n-boot", type=int, default=2000)
    args = ap.parse_args()
    rd = Path(args.run_dir); cache = rd / "cache"
    import yaml
    cfg = yaml.safe_load(open(rd / "config.yaml")); seed = int(cfg["seed"])
    set_schema(GP.GROUP_NAMES, GP.RATE_KEYS)
    rows = pd.read_pickle(cache / "rows.pkl"); rows["cost_frac"] = rows.cost / rows.cost_fine
    train = pickle.load(open(cache / "train.pkl", "rb")); models = pickle.load(open(cache / "models.pkl", "rb"))
    names = list(models["cost_increment"].keys())
    n_val = max(int(0.2 * len(train)), 5)
    val = evaluate_episodes(train[-n_val:], names, models, seed); val["cost_frac"] = val.cost / val.cost_fine
    test = rows[rows.family == "id"].copy()
    key = ["seed", "group", "target"]
    V = {"budgets": BUDGETS, "principal": PRINCIPAL, "n_validation_episodes": n_val, "n_test_rows": int(test[key].drop_duplicates().shape[0]), "conditions": {}}

    def rows_at(df, policy, param):
        d = df[(df.policy == policy) & (np.isclose(df.param, param))]
        return d.set_index(key)[["err_rel_tol", "cost_frac", "tp", "fp", "fn", "necessary", "safe_declared"]]

    for cond, spec in CONDITIONS.items():
        C = {}
        for learned in spec["learned"]:
            L = {"operating_points": {}, "holm": {}}
            pvals, labels = [], []
            for budget in BUDGETS:
                pl = select_params(val, learned, budget)
                rl = rows_at(test, learned, pl)
                point = {"param": pl, "attained": attained(val, learned, budget), "cost_frac_mean": float(rl.cost_frac.mean()), "err_mean": float(rl.err_rel_tol.mean()),
                         "success_rate": float((rl.err_rel_tol <= 1).mean()), "baselines": {}}
                tp, fp, fn = rl.tp.sum(), rl.fp.sum(), rl.fn.sum()
                point["precision"] = float(tp / (tp + fp)) if tp + fp else 1.0; point["recall"] = float(tp / (tp + fn)) if tp + fn else 1.0
                nec = rl.necessary.values.astype(bool); point["false_safe_rate"] = float(rl.safe_declared.values[nec].mean()) if nec.any() else None
                best_name, best_err = None, np.inf
                for base in spec["baselines"]:
                    pb = select_params(val, base, budget)
                    if pb is None:
                        continue
                    rb = rows_at(test, base, pb); j = rl.join(rb, lsuffix="_l", rsuffix="_b", how="inner")
                    if not len(j):
                        continue
                    diff, lo, hi = paired_bootstrap(j.err_rel_tol_l.values, j.err_rel_tol_b.values, args.n_boot, seed)
                    point["baselines"][base] = {"param": pb, "cost_frac_mean": float(rb.cost_frac.mean()), "err_mean": float(rb.err_rel_tol.mean()),
                                                "diff_mean": diff, "ci95": [lo, hi], "n_pairs": int(len(j))}
                    if rb.err_rel_tol.mean() < best_err:
                        best_err, best_name = float(rb.err_rel_tol.mean()), base
                point["best_baseline"] = best_name
                if best_name:
                    rb = rows_at(test, best_name, point["baselines"][best_name]["param"]); j = rl.join(rb, lsuffix="_l", rsuffix="_b", how="inner")
                    p = boot_pvalue(j.err_rel_tol_l.values, j.err_rel_tol_b.values, args.n_boot, seed)
                    point["p_vs_best_baseline"] = p; pvals.append(p); labels.append(budget)
                    point["ratio_vs_best_baseline"] = float(rl.err_rel_tol.mean() / max(best_err, 1e-12))
                L["operating_points"][str(budget)] = point
            adj = holm(pvals) if pvals else []
            L["holm"] = {str(b): a for b, a in zip(labels, adj)}
            # H1-V1 verdict
            pp = L["operating_points"].get(str(PRINCIPAL), {})
            passes = bool(pp and pp.get("attained") and pp.get("ratio_vs_best_baseline", np.inf) <= MIN_EFFECT and L["holm"].get(str(PRINCIPAL), 1.0) < 0.05
                          and pp["baselines"][pp["best_baseline"]]["ci95"][1] < 0)
            contradicted = any(op["baselines"].get(op["best_baseline"], {}).get("ci95", [0, 0])[0] > 0 for b, op in L["operating_points"].items() if op.get("best_baseline"))
            L["H1_V1"] = {"passes": passes and not contradicted, "principal_attained": pp.get("attained"), "principal_ratio": pp.get("ratio_vs_best_baseline"), "holm_p": L["holm"].get(str(PRINCIPAL)),
                          "contradicted_at_other_points": contradicted, "min_effect": MIN_EFFECT,
                          "falsified": bool(pp and not (pp.get("ratio_vs_best_baseline", np.inf) < 1.0 and L["holm"].get(str(PRINCIPAL), 1.0) < 0.05))}
            # H3-V1: precision at equal recall vs the discrepancy and sensitivity baselines (curves over params)
            def pr_curve(policy):
                g = test[test.policy == policy].groupby("param").agg(tp=("tp", "sum"), fp=("fp", "sum"), fn=("fn", "sum")).reset_index()
                g["precision"] = g.tp / (g.tp + g.fp).replace(0, np.nan); g["recall"] = g.tp / (g.tp + g.fn).replace(0, np.nan)
                return g.dropna().sort_values("recall")
            pl_curve = pr_curve(learned); h3 = {}
            for base in ("discrepancy", "sensitivity"):
                bc = pr_curve(base)
                if len(bc) and len(pl_curve) and pp.get("recall") is not None:
                    r0 = pp["recall"]
                    prec_base = float(np.interp(r0, bc.recall.values, bc.precision.values)) if len(bc) > 1 else float(bc.precision.iloc[0])
                    h3[base] = {"recall_at_principal": r0, "learned_precision": pp["precision"], "baseline_precision_at_equal_recall": prec_base,
                                "ratio": pp["precision"] / max(prec_base, 1e-9)}
            crossing = None
            if pp and "0.5" in L["operating_points"] and "0.15" in L["operating_points"]:
                lo_pt = L["operating_points"]["0.15"]; hi_pt = L["operating_points"]["0.5"]
                written = [b for b in ("share", "discrepancy", "sensitivity") if b in hi_pt["baselines"]]
                if written:
                    best_w_hi = min(hi_pt["baselines"][b]["err_mean"] for b in written); best_w_lo = min(lo_pt["baselines"][b]["err_mean"] for b in written if b in lo_pt["baselines"])
                    crossing = {"learned_better_at_0.15": lo_pt["err_mean"] < best_w_lo, "written_not_worse_at_0.5": best_w_hi <= hi_pt["err_mean"] * 1.05}
            L["H3_V1"] = {"precision_at_equal_recall": h3, "passes": bool(h3 and all(v["ratio"] >= 1.2 for v in h3.values())) and bool(crossing and crossing["learned_better_at_0.15"] and crossing["written_not_worse_at_0.5"]),
                          "crossing": crossing}
            C[learned] = L
        V["conditions"][cond] = C
    # false-safe rates at the principal operating point on every family (ID + OOD)
    fsr = {}
    for pol in ("voc", "voc_seq", "hybrid", "hybrid_seq", "hardlabel", "discrepancy", "sensitivity", "novelty", "uncertainty", "fullstate_voc"):
        p = select_params(val, pol, PRINCIPAL)
        if p is None:
            continue
        d = rows[(rows.policy == pol) & (np.isclose(rows.param, p))]
        fsr[pol] = {}
        for fam, g in d.groupby("family"):
            nec = g.necessary.values.astype(bool)
            fsr[pol][fam] = {"false_safe_rate": float(g.safe_declared.values[nec].mean()) if nec.any() else None, "err_mean": float(g.err_rel_tol.mean()), "cost_frac": float(g.cost_frac.mean()), "n_necessary": int(nec.sum())}
    V["false_safe_rate_at_principal"] = fsr
    write_json(rd / "verdicts.json", V)
    L = [f"# Preregistered verdicts — {rd.name}", "", f"Validation split: last {n_val} training episodes; test rows: {V['n_test_rows']}; bootstrap B = {args.n_boot}; Holm over 3 operating points.", ""]
    for cond, C in V["conditions"].items():
        L.append(f"## Condition: {cond}")
        for learned, Lr in C.items():
            L.append(f"### {learned}")
            L.append("| budget | attained | param | cost frac | err/tol | success | precision | recall | best baseline | its err | ratio | Δ mean [95 % CI] | Holm p |")
            L.append("|---|---|---|---|---|---|---|---|---|---|---|---|---|")
            for b, op in Lr["operating_points"].items():
                bb = op.get("best_baseline"); bo = op["baselines"].get(bb, {}) if bb else {}
                ci = bo.get("ci95", [np.nan, np.nan])
                L.append(f"| {b} | {'yes' if op['attained'] else 'no'} | {op['param']:.3g} | {op['cost_frac_mean']:.3f} | {op['err_mean']:.3f} | {op['success_rate']:.2f} | {op['precision']:.2f} | {op['recall']:.2f} | {bb} | {bo.get('err_mean', np.nan):.3f} | {op.get('ratio_vs_best_baseline', np.nan):.2f} | {bo.get('diff_mean', np.nan):+.3f} [{ci[0]:+.3f}, {ci[1]:+.3f}] | {Lr['holm'].get(b, np.nan):.3f} |")
            L.append(f"H1-V1: **{'passes' if Lr['H1_V1']['passes'] else ('falsified' if Lr['H1_V1']['falsified'] else 'not passed')}** (principal ratio {Lr['H1_V1']['principal_ratio']}, Holm p {Lr['H1_V1']['holm_p']}, contradicted elsewhere: {Lr['H1_V1']['contradicted_at_other_points']}); "
                     f"H3-V1: **{'passes' if Lr['H3_V1']['passes'] else 'not passed'}** {json.dumps(Lr['H3_V1']['precision_at_equal_recall'])} crossing {Lr['H3_V1']['crossing']}")
            L.append("")
    L.append("## false_safe_rate at the principal operating point")
    L.append("| policy | " + " | ".join(sorted({f for d in fsr.values() for f in d})) + " |")
    fams = sorted({f for d in fsr.values() for f in d})
    L.append("|---|" + "---|" * len(fams))
    for pol, d in fsr.items():
        L.append(f"| {pol} | " + " | ".join(f"{d[f]['false_safe_rate']:.2f}" if f in d and d[f]['false_safe_rate'] is not None else "–" for f in fams) + " |")
    (rd / "verdicts.md").write_text("\n".join(L) + "\n"); print("\n".join(L))


if __name__ == "__main__":
    main()

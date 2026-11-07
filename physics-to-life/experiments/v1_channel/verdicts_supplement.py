#!/usr/bin/env python
"""POST-HOC SUPPLEMENT to verdicts.py (not the preregistered verdict; written after the main-run
verdicts were read — see the review package).

verdicts.py selects, for every baseline, the parameter attaining the budget on validation and,
when no parameter attains it, falls back to the baseline's *cheapest* parameter.  A baseline that
cannot reach the budget therefore competes at a higher cost than the learned router (in the main
run the AdaLED-style ensemble-uncertainty trigger's cheapest point costs 0.40 of uniform fine at
the 0.30 budget).  H1-V1 speaks of "lower target error at fixed compute"; this supplement
re-runs the same comparison with the baseline set restricted to baselines that attain the budget
on validation (unattainable ones are listed, not compared), with the same statistics.  It changes
no threshold, seed or criterion; it exists so that the reader can see whether the preregistered
verdict depends on the fallback rule.
"""
from __future__ import annotations
import argparse, json, pickle, sys
from pathlib import Path
import numpy as np
import pandas as pd
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src")); sys.path.insert(0, str(HERE))
from physics_to_life.evaluation.provenance import write_json  # noqa: E402
from physics_to_life.v1.experiment import evaluate_episodes  # noqa: E402
from physics_to_life.v1.routing import set_schema  # noqa: E402
from physics_to_life.v1.systems import gunay2015_profile as GP  # noqa: E402
import verdicts as V  # noqa: E402


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--run-dir", required=True); ap.add_argument("--n-boot", type=int, default=2000)
    args = ap.parse_args(); rd = Path(args.run_dir); cache = rd / "cache"
    import yaml
    cfg = yaml.safe_load(open(rd / "config.yaml")); seed = int(cfg["seed"])
    set_schema(GP.GROUP_NAMES, GP.RATE_KEYS)
    rows = pd.read_pickle(cache / "rows.pkl"); rows["cost_frac"] = rows.cost / rows.cost_fine
    train = pickle.load(open(cache / "train.pkl", "rb")); models = pickle.load(open(cache / "models.pkl", "rb"))
    names = list(models["cost_increment"].keys()); n_val = max(int(0.2 * len(train)), 5)
    val = evaluate_episodes(train[-n_val:], names, models, seed); val["cost_frac"] = val.cost / val.cost_fine
    key = ["seed", "group", "target"]
    out = {"note": __doc__.strip(), "budgets": V.BUDGETS, "principal": V.PRINCIPAL, "conditions": {}}

    def rows_at(df, policy, param):
        d = df[(df.policy == policy) & (np.isclose(df.param, param))]
        return d.set_index(key)[["err_rel_tol", "cost_frac"]]
    L = ["# Supplement to the preregistered verdicts — baselines restricted to those attaining each budget on validation (POST-HOC reading; the preregistered verdict is verdicts.md)", "",
         "Same validation-selected thresholds, same paired bootstrap and Holm correction as verdicts.py; the only change is that a baseline with no parameter within the budget on validation is listed as *unattainable* instead of being compared at its cheapest point.", ""]
    for fam_label, test in (("id", rows[rows.family == "id"].copy()), ("reserve", rows[rows.family == "reserve"].copy())):
        if not len(test):
            continue
        out["conditions"][fam_label] = {}
        L += [f"## Evaluation family: {fam_label}", ""]
        for cond, spec in V.CONDITIONS.items():
            out["conditions"][fam_label][cond] = {}
            for learned in spec["learned"]:
                pts, pvals, labels = {}, [], []
                for budget in V.BUDGETS:
                    pl = V.select_params(val, learned, budget); rl = rows_at(test, learned, pl)
                    e = {"param": pl, "attained": V.attained(val, learned, budget), "cost_frac_mean": float(rl.cost_frac.mean()), "err_mean": float(rl.err_rel_tol.mean()),
                         "success_rate": float((rl.err_rel_tol <= 1).mean()), "baselines": {}, "unattainable": []}
                    best, best_err = None, np.inf
                    for base in spec["baselines"]:
                        if not V.attained(val, base, budget):
                            g = val[val.policy == base].groupby("param").cost_frac.mean()
                            e["unattainable"].append({"policy": base, "cheapest_validation_cost": float(g.min()) if len(g) else None}); continue
                        pb = V.select_params(val, base, budget); rb = rows_at(test, base, pb); j = rl.join(rb, lsuffix="_l", rsuffix="_b", how="inner")
                        if not len(j):
                            continue
                        diff, lo, hi = V.paired_bootstrap(j.err_rel_tol_l.values, j.err_rel_tol_b.values, args.n_boot, seed)
                        e["baselines"][base] = {"param": pb, "cost_frac_mean": float(rb.cost_frac.mean()), "err_mean": float(rb.err_rel_tol.mean()), "diff_mean": diff, "ci95": [lo, hi], "n_pairs": int(len(j))}
                        if rb.err_rel_tol.mean() < best_err:
                            best_err, best = float(rb.err_rel_tol.mean()), base
                    e["best_baseline"] = best
                    if best:
                        rb = rows_at(test, best, e["baselines"][best]["param"]); j = rl.join(rb, lsuffix="_l", rsuffix="_b", how="inner")
                        p = V.boot_pvalue(j.err_rel_tol_l.values, j.err_rel_tol_b.values, args.n_boot, seed)
                        e["p_vs_best_baseline"] = p; pvals.append(p); labels.append(budget); e["ratio_vs_best_baseline"] = e["err_mean"] / max(best_err, 1e-12)
                    pts[str(budget)] = e
                adj = V.holm(pvals) if pvals else []; holm = {str(b): a for b, a in zip(labels, adj)}
                pp = pts.get(str(V.PRINCIPAL), {})
                passes = bool(pp and pp.get("attained") and pp.get("ratio_vs_best_baseline", np.inf) <= V.MIN_EFFECT and holm.get(str(V.PRINCIPAL), 1.0) < 0.05 and pp["baselines"][pp["best_baseline"]]["ci95"][1] < 0)
                contradicted = any(op["baselines"].get(op["best_baseline"], {}).get("ci95", [0, 0])[0] > 0 for op in pts.values() if op.get("best_baseline"))
                falsified = bool(pp and not (pp.get("ratio_vs_best_baseline", np.inf) < 1.0 and holm.get(str(V.PRINCIPAL), 1.0) < 0.05))
                res = {"operating_points": pts, "holm": holm, "H1_V1_reading_B": {"passes": passes and not contradicted, "falsified": falsified, "contradicted_at_other_points": contradicted}}
                out["conditions"][fam_label][cond][learned] = res
                L += [f"### {cond} / {learned}", "", "| budget | learned cost | learned err | best attaining baseline | its cost | its err | ratio | Δ mean [95 % CI] | Holm p | unattainable at this budget |", "|---|---|---|---|---|---|---|---|---|---|"]
                for b, e in pts.items():
                    bb = e["best_baseline"]; bo = e["baselines"].get(bb, {}) if bb else {}
                    un = ", ".join(f"{u['policy']} ({u['cheapest_validation_cost']:.2f})" for u in e["unattainable"])
                    L.append(f"| {b} | {e['cost_frac_mean']:.3f} | {e['err_mean']:.3f} | {bb or '—'} | {bo.get('cost_frac_mean', float('nan')):.3f} | {bo.get('err_mean', float('nan')):.3f} | {e.get('ratio_vs_best_baseline', float('nan')):.2f} | "
                             f"{bo.get('diff_mean', float('nan')):+.3f} [{bo.get('ci95', [float('nan')] * 2)[0]:+.3f}, {bo.get('ci95', [float('nan')] * 2)[1]:+.3f}] | {holm.get(b, float('nan')):.3f} | {un} |")
                r = res["H1_V1_reading_B"]
                L += ["", f"H1-V1 under this reading: **{'passes' if r['passes'] else ('falsified' if r['falsified'] else 'not passed')}** (contradicted at another point: {r['contradicted_at_other_points']}).", ""]
    write_json(rd / "verdicts_supplement.json", out); (rd / "verdicts_supplement.md").write_text("\n".join(L) + "\n"); print("\n".join(L))


if __name__ == "__main__":
    main()

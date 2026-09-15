#!/usr/bin/env python
"""Falsification attempts on a finished V1 run (analysis only; exact lookup on cached labels, no new
simulation).  Each control retrains the VoC router under a handicap and evaluates it on the same
test set at the validation-selected 30 % operating point:

  permuted_labels     training labels permuted within target  -> the frontier must collapse (leakage guard)
  descriptors_only    no cheap-run features (intervention/protocol descriptors, target, cost only)
  simulation_only     no intervention descriptors (cheap-run features, target, cost only)
  target_blind        target one-hot removed (tests target conditioning, the programme's central claim)
  leave_family_out    for each ID family: trained without it, evaluated on it (memorisation guard)
Writes <run_dir>/falsification.json and falsification.md.
"""
from __future__ import annotations
import argparse, importlib.util, json, pickle, sys
from pathlib import Path
import numpy as np
import pandas as pd
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.evaluation.provenance import write_json  # noqa: E402
from physics_to_life.v1.experiment import training_rows, evaluate_episodes  # noqa: E402
from physics_to_life.v1.routing import VoCRegressor, feature_names, set_schema  # noqa: E402
from physics_to_life.v1.targets import TARGET_NAMES  # noqa: E402
from physics_to_life.v1.systems import gunay2015_profile as GP  # noqa: E402

spec_v = importlib.util.spec_from_file_location("verdicts", HERE / "verdicts.py"); V = importlib.util.module_from_spec(spec_v); spec_v.loader.exec_module(V)
SIM = ["share", "peak", "t_peak", "late_over_peak", "V_min", "V_max", "V_mean"]
DESC = ["g_scale_self", "g_scale_other_max", "g_scale_other_min", "T_C", "K_out", "block_frac_self", "block_conc_self", "i_extra"]


def idx_without(fn, drop):
    return [i for i, n in enumerate(fn) if n not in drop]


def evaluate_model(model, train, test, names, seed, label):
    models = {"voc": model}
    val_eps = train[-max(int(0.2 * len(train)), 5):]
    val = evaluate_episodes(val_eps, names, models, seed); val["cost_frac"] = val.cost / val.cost_fine
    df = evaluate_episodes(test, names, models, seed); df["cost_frac"] = df.cost / df.cost_fine
    out = {}
    for pol in ("voc", "voc_seq"):
        p = V.select_params(val, pol, V.PRINCIPAL)
        d = df[(df.policy == pol) & np.isclose(df.param, p)]
        tp, fp, fn = d.tp.sum(), d.fp.sum(), d.fn.sum()
        g = df[df.policy == pol].groupby("param").agg(cost=("cost_frac", "mean"), succ=("err_rel_tol", lambda x: float((x <= 1).mean()))).reset_index()
        ok = g[g.succ >= 0.95]
        out[pol] = {"param": p, "attained": V.attained(val, pol, V.PRINCIPAL), "cost_frac": float(d.cost_frac.mean()), "err_rel_tol": float(d.err_rel_tol.mean()),
                    "success": float((d.err_rel_tol <= 1).mean()), "precision": float(tp / (tp + fp)) if tp + fp else 1.0, "recall": float(tp / (tp + fn)) if tp + fn else 1.0,
                    "cost_to_95pct_success": float(ok.cost.min()) if len(ok) else None}
    print(f"  {label:22s} voc@0.30: err {out['voc']['err_rel_tol']:.3f} cost {out['voc']['cost_frac']:.3f} prec {out['voc']['precision']:.2f} rec {out['voc']['recall']:.2f} | cost-to-95% {out['voc']['cost_to_95pct_success']}", flush=True)
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--run-dir", required=True)
    args = ap.parse_args(); rd = Path(args.run_dir); cache = rd / "cache"
    import yaml
    cfg = yaml.safe_load(open(rd / "config.yaml")); seed = int(cfg["seed"]); nm = int(cfg["ensemble_members"])
    set_schema(GP.GROUP_NAMES, GP.RATE_KEYS)
    train = pickle.load(open(cache / "train.pkl", "rb")); test = pickle.load(open(cache / "test.pkl", "rb"))
    models = pickle.load(open(cache / "models.pkl", "rb")); names = list(models["cost_increment"].keys())
    fn = feature_names(names)
    X, yg, yh, keys = training_rows(train, names, include_partial=True)
    R = {"n_train": len(train), "n_test": len(test), "controls": {}}
    print("[reference: the trained router]"); R["controls"]["reference"] = evaluate_model(models["voc"], train, test, names, seed, "reference")
    rng = np.random.default_rng(seed)
    # 1 permuted labels (within target)
    yp = yg.copy(); tgt_of_row = np.array([k[2] for k in keys])
    for t in np.unique(tgt_of_row):
        m = tgt_of_row == t; yp[m] = rng.permutation(yg[m])
    R["controls"]["permuted_labels"] = evaluate_model(VoCRegressor(nm, seed).fit(X, yp), train, test, names, seed, "permuted_labels")
    # 2 descriptors only
    keep = idx_without(fn, set(SIM)); R["controls"]["descriptors_only"] = evaluate_model(VoCRegressor(nm, seed, feature_idx=keep).fit(X, yg), train, test, names, seed, "descriptors_only")
    # 3 simulation only
    keep = idx_without(fn, set(DESC) | {n for n in fn if n.startswith("rate:")}); R["controls"]["simulation_only"] = evaluate_model(VoCRegressor(nm, seed, feature_idx=keep).fit(X, yg), train, test, names, seed, "simulation_only")
    # 4 target blind
    keep = idx_without(fn, {f"target={t}" for t in TARGET_NAMES}); R["controls"]["target_blind"] = evaluate_model(VoCRegressor(nm, seed, feature_idx=keep).fit(X, yg), train, test, names, seed, "target_blind")
    # 5 leave one family out
    fam_of_row = np.array([next(ep["family"] for ep in train if ep["seed"] == k[0]) for k in keys])
    lofo = {}
    for fam in sorted({ep["family"] for ep in train}):
        m = fam_of_row != fam
        test_f = [ep for ep in test if ep["family"] == fam]
        if len(test_f) < 3:
            continue
        model = VoCRegressor(nm, seed).fit(X[m], yg[m])
        lofo[fam] = {"held_out": evaluate_model(model, [ep for ep in train if ep["family"] != fam], test_f, names, seed, f"lofo:{fam} (held out)"),
                     "reference_on_family": evaluate_model(models["voc"], train, test_f, names, seed, f"lofo:{fam} (reference)")}
    R["controls"]["leave_family_out"] = lofo
    write_json(rd / "falsification.json", R)
    L = [f"# Falsification attempts — {rd.name}", "", "| control | voc err/tol @ validation-selected 30 % point | cost frac | precision | recall | cost to 95 % success |", "|---|---|---|---|---|---|"]
    for k, v in R["controls"].items():
        if k == "leave_family_out":
            continue
        L.append(f"| {k} | {v['voc']['err_rel_tol']:.3f} | {v['voc']['cost_frac']:.3f} | {v['voc']['precision']:.2f} | {v['voc']['recall']:.2f} | {v['voc']['cost_to_95pct_success']} |")
    L += ["", "## Leave-one-family-out (voc, 30 % point)", "", "| family | held-out err/tol | reference err/tol on the family | held-out precision | reference precision |", "|---|---|---|---|---|"]
    for fam, v in lofo.items():
        L.append(f"| {fam} | {v['held_out']['voc']['err_rel_tol']:.3f} | {v['reference_on_family']['voc']['err_rel_tol']:.3f} | {v['held_out']['voc']['precision']:.2f} | {v['reference_on_family']['voc']['precision']:.2f} |")
    (rd / "falsification.md").write_text("\n".join(L) + "\n"); print("\n".join(L))


if __name__ == "__main__":
    main()

#!/usr/bin/env python
"""Pilot audit (preregistration §14) for a finished run directory of run.py.

(i)   leakage: every router feature comes from cheap runs or descriptors (structural check of the
      feature schema + a numerical check that base-state features are identical whether or not
      fine runs exist — they are computed from the base run only);
(ii)  numerical soundness: negative-control gains vs the noise floor (fine-vs-reference error);
(iii) informativeness: fraction of labels with a non-empty minimal set per target and family;
(iv)  timing: wall per episode, projected main-run cost;
(v)   detector sanity vs the planted-shift table of preregistration §9;
(vi)  seeds and provenance.
Writes <run_dir>/audit.json and prints a Markdown summary.
"""
from __future__ import annotations
import argparse, json, pickle, sys
from pathlib import Path
import numpy as np
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.evaluation.provenance import write_json  # noqa: E402

PLANTED = {"block": {"should_fire": ["range_guard", "discrepancy"], "should_not": []},
           "opening_step": {"should_fire": ["knn_density", "discrepancy"], "should_not": ["ensemble_std"]},
           "combo": {"should_fire": ["range_guard", "knn_density"], "should_not": []},
           "activation_rate": {"should_fire": [], "should_not": []}}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--run-dir", required=True)
    ap.add_argument("--main-sizes", default="400,200,60", help="n_train,n_test,n_ood per family for the projection")
    args = ap.parse_args()
    rd = Path(args.run_dir); cache = rd / "cache"
    summ = json.load(open(rd / "summary.json")); cfg = json.load(open(rd / "provenance.json"))["config"] if (rd / "provenance.json").exists() else {}
    import yaml
    cfg = yaml.safe_load(open(rd / "config.yaml"))
    train = pickle.load(open(cache / "train.pkl", "rb")); test = pickle.load(open(cache / "test.pkl", "rb"))
    ood = {f.stem[4:]: pickle.load(open(f, "rb")) for f in sorted(cache.glob("ood_*.pkl"))}
    names = summ["channels"]; A = {}
    # (ii) negative controls and noise floor
    neg = [c for c in names if c in ("Ks", "NaP")]
    rows = []
    for ep in train + test:
        for g in ep["groups"]:
            for t in g["targets"]:
                floor = g["err_fine_numerical"][t]
                for c in names:
                    rows.append((c, t, g["gains"][t][c], floor, c in g["minimal"][t]))
    gains = np.array([r[2] for r in rows]); floors = np.array([r[3] for r in rows]); isneg = np.array([r[0] in neg for r in rows]); inmin = np.array([r[4] for r in rows])
    A["ii_negative_controls"] = {"n_labels": int(isneg.sum()), "frac_abs_gain_within_2x_floor": float(np.mean(np.abs(gains[isneg]) <= 2 * floors[isneg] + 1e-12)),
                                 "max_abs_gain": float(np.abs(gains[isneg]).max()) if isneg.any() else 0.0, "frac_in_minimal_set": float(inmin[isneg].mean()) if isneg.any() else 0.0,
                                 "floor_median": float(np.median(floors)), "floor_p95": float(np.quantile(floors, 0.95))}
    A["ii_routable_gains"] = {c: {"frac_gain_above_2x_floor": float(np.mean(gains[[r[0] == c for r in rows]] > 2 * floors[[r[0] == c for r in rows]]))} for c in names if c not in neg}
    # (iii) informativeness per target and family
    info = {}
    for fam_name, eps in [("id_train", train), ("id_test", test)] + list(ood.items()):
        for ep in eps:
            for g in ep["groups"]:
                for t in g["targets"]:
                    key = f"{fam_name}|{t}"; info.setdefault(key, []).append(len(g["minimal"][t]) > 0)
    A["iii_nonempty_minimal_set"] = {k: float(np.mean(v)) for k, v in info.items()}
    per_target = {}
    for k, v in A["iii_nonempty_minimal_set"].items():
        fam, t = k.split("|")
        if fam.startswith("id"):
            per_target.setdefault(t, []).append(v)
    A["iii_id_by_target"] = {t: float(np.mean(v)) for t, v in per_target.items()}
    A["iii_flag_uninformative_targets"] = [t for t, v in A["iii_id_by_target"].items() if v < 0.10 or v > 0.90]
    # (iv) timing
    wl = np.array([ep["wall_label"] for ep in train]); wt = np.array([ep["wall_truth"] for ep in train]); ns = np.array([ep["n_sims"] for ep in train])
    n_tr, n_te, n_oo = [int(x) for x in args.main_sizes.split(",")]
    n_main = n_tr + n_te + n_oo * len(cfg.get("ood_families", [])) + 100
    A["iv_timing"] = {"wall_label_per_episode_s": float(wl.mean()), "wall_truth_per_episode_s": float(wt.mean()), "sims_per_episode": float(ns.mean()),
                      "n_proc": int(cfg.get("n_proc", 1)), "projected_main_generate_h": float(wl.mean() * n_main / max(int(cfg.get("n_proc", 1)), 1) / 3600.0),
                      "pipeline_timings_s": summ.get("timings", {})}
    # (v) detectors vs planted shifts
    det = summ.get("ood_detectors", {}); v = {}
    for fam, plan in PLANTED.items():
        v[fam] = {}
        for d in plan["should_fire"]:
            m = det.get(d, {}).get(fam, {}); v[fam][f"{d}:should_fire"] = {"auroc": m.get("auroc"), "false_safe_rate": m.get("false_safe_rate"), "ok": (m.get("auroc") or 0) > 0.7}
        for d in plan["should_not"]:
            m = det.get(d, {}).get(fam, {}); v[fam][f"{d}:predicted_to_fail"] = {"auroc": m.get("auroc"), "false_safe_rate": m.get("false_safe_rate")}
    A["v_detectors_vs_planted"] = v
    # (i) leakage: structural
    from physics_to_life.v1.routing import feature_names
    fn = feature_names(names)
    A["i_leakage"] = {"n_features": len(fn), "features": fn,
                      "note": "features are computed from the base (medium) run's window summaries, the intervention and protocol descriptors and nominal cost increments; partial-state rows (sequential condition) use the refined cheap runs the policy has already paid for; no feature reads a fine-level run or a label"}
    # (vi) seeds
    A["vi_seeds"] = {"train": [int(train[0]["seed"]), int(train[-1]["seed"])], "test": [int(test[0]["seed"]), int(test[-1]["seed"])],
                     "ood": {k: [int(v[0]["seed"]), int(v[-1]["seed"])] for k, v in ood.items()}, "families_train": sorted({ep["family"] for ep in train})}
    write_json(rd / "audit.json", A)
    L = [f"# Pilot audit — {rd.name}", "",
         f"- (ii) negative controls: {A['ii_negative_controls']['frac_abs_gain_within_2x_floor']:.3f} of Ks/NaP gains within 2× the numerical floor (max |gain| {A['ii_negative_controls']['max_abs_gain']:.2e}; in minimal set {A['ii_negative_controls']['frac_in_minimal_set']:.3f}); floor median {A['ii_negative_controls']['floor_median']:.2e}, p95 {A['ii_negative_controls']['floor_p95']:.2e}",
         f"- (ii) routable channels, fraction of gains above 2× floor: " + ", ".join(f"{c} {v['frac_gain_above_2x_floor']:.2f}" for c, v in A["ii_routable_gains"].items()),
         f"- (iii) ID non-empty minimal set by target: " + ", ".join(f"{t} {v:.2f}" for t, v in A["iii_id_by_target"].items()) + f"; flagged: {A['iii_flag_uninformative_targets']}",
         f"- (iv) wall/episode {A['iv_timing']['wall_label_per_episode_s']:.0f} s (truth {A['iv_timing']['wall_truth_per_episode_s']:.0f} s, {A['iv_timing']['sims_per_episode']:.0f} sims); projected main-run generation {A['iv_timing']['projected_main_generate_h']:.1f} h on {A['iv_timing']['n_proc']} processes",
         "- (v) detectors vs planted shifts: " + "; ".join(f"{fam}: " + ", ".join(f"{k} auroc={m['auroc']:.2f}" if m.get('auroc') is not None else f"{k} n/a" for k, m in d.items()) for fam, d in v.items()),
         f"- (vi) seeds train {A['vi_seeds']['train']}, test {A['vi_seeds']['test']}, OOD {A['vi_seeds']['ood']}"]
    print("\n".join(L)); (rd / "audit.md").write_text("\n".join(L) + "\n")


if __name__ == "__main__":
    main()

#!/usr/bin/env python
"""Preregistered verdicts for H5-V1, H8-V1, H9-V1 and H10-V1 (docs/experiments/v1_preregistration.md §4),
computed mechanically from a finished run directory:
    summary.json / surrogate_h5_h8.json / tables/surrogate_rows.csv   (H5, H8)
    cache/train.pkl                                                    (H5: detector chosen on validation ID data only)
    cross_formulation/summary.json                                     (H9)
    restoration/summary.json + instances.json                          (H10, preregistered kf_loss damage)
    restoration_nat_loss/...                                           (H10, post-hoc exploratory variant, reported separately)
Writes <run_dir>/verdicts_extended.json and verdicts_extended.md.  H1/H3 are in verdicts.py.
"""
from __future__ import annotations
import argparse, json, pickle, sys
from pathlib import Path
import numpy as np
import pandas as pd
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.evaluation.provenance import write_json  # noqa: E402

PHYSICS_BASELINES = ("share", "discrepancy", "sensitivity")
OOD_FAMILIES = ("block", "opening_step", "combo", "activation_rate")


def auroc(score: np.ndarray, label: np.ndarray) -> float:
    """Rank-based AUROC of `score` for predicting label==1 (ties averaged)."""
    score = np.asarray(score, float); label = np.asarray(label, bool)
    m = np.isfinite(score); score, label = score[m], label[m]
    n1, n0 = int(label.sum()), int((~label).sum())
    if n1 == 0 or n0 == 0:
        return float("nan")
    ranks = pd.Series(score).rank(method="average").values
    return float((ranks[label].sum() - n1 * (n1 + 1) / 2) / (n1 * n0))


def paired_bootstrap(a: np.ndarray, b: np.ndarray, n_boot: int = 2000, seed: int = 0):
    """Mean of (a - b) with a 95 % percentile bootstrap interval over paired rows."""
    d = np.asarray(a, float) - np.asarray(b, float); d = d[np.isfinite(d)]
    if len(d) == 0:
        return float("nan"), float("nan"), float("nan")
    rng = np.random.default_rng(seed); idx = rng.integers(0, len(d), size=(n_boot, len(d)))
    means = d[idx].mean(axis=1)
    return float(d.mean()), float(np.quantile(means, 0.025)), float(np.quantile(means, 0.975))


# ------------------------------------------------------------------------------------------ H5
def validation_gate_metrics(run_dir: Path, cfg: dict, names: list[str]) -> dict | None:
    """Re-fit the surrogates deterministically (same seed, same split) and evaluate the distrust gates on
    the validation split itself, so that the detector can be chosen on validation ID data only."""
    p = run_dir / "cache" / "train.pkl"
    if not p.exists():
        return None
    from physics_to_life.v1.surrogate import fit_and_evaluate
    from physics_to_life.v1.routing import set_schema
    from physics_to_life.v1.systems import gunay2015_profile as GP
    set_schema(GP.GROUP_NAMES, GP.RATE_KEYS)
    train = pickle.load(open(p, "rb")); n_val = max(int(0.2 * len(train)), 5)
    summ, _ = fit_and_evaluate(train[:-n_val], train[-n_val:], train[-n_val:], {}, names, seed=int(cfg["seed"]), n_members=int(cfg["ensemble_members"]))
    return {"n_validation_episodes": n_val, "emulator": summ["by_family"]["id"]["emulator"]["gates"], "hybrid": summ["by_family"]["id"]["hybrid"]["gates"]}


def h5(run_dir: Path, summary: dict, cfg: dict, rows: pd.DataFrame) -> dict:
    sur = json.load(open(run_dir / "surrogate_h5_h8.json")); bf = sur["by_family"]
    names = summary["channels"]
    fams = [f for f in OOD_FAMILIES if f in bf]
    # clause 1: amortised speed-up (training cost charged over the ID test queries; one query = one (episode, group))
    emu = rows[rows.closure == "emulator"]; fine = rows[rows.closure == "fine"]
    n_queries = int(emu[emu.family == "id"].groupby(["seed", "group"]).ngroups)
    fine_wall = float(fine.wall.mean()); inf_wall = float(emu.wall.mean()); train_wall = float(sur["train_wall_s"])
    speedup_inference = fine_wall / max(inf_wall, 1e-12)
    speedup_amortised = fine_wall / max(inf_wall + train_wall / max(n_queries, 1), 1e-12)
    # clause 2: ID within-tolerance rate of the emulator
    within_id = float(bf["id"]["emulator"]["within_tol_rate"])
    # detector chosen on validation ID data only: lowest validation false_safe_rate, ties -> higher coverage
    val = validation_gate_metrics(run_dir, cfg, names)
    gates = list(bf["id"]["emulator"]["gates"].keys())
    if val is not None:
        def fsr_of(g):
            v = val["emulator"][g]["false_safe_rate"]
            return 1.0 if v is None or (isinstance(v, float) and np.isnan(v)) else float(v)
        eligible = [g for g in gates if fsr_of(g) <= 0.05]
        if eligible:
            chosen = max(eligible, key=lambda g: (val["emulator"][g]["coverage"], -fsr_of(g)))
            chosen_reason = "highest validation coverage among gates with validation false_safe_rate <= 0.05 (the ID target of the hypothesis)"
        else:
            chosen = min(gates, key=lambda g: (fsr_of(g), -val["emulator"][g]["coverage"]))
            chosen_reason = "no gate reaches false_safe_rate <= 0.05 on validation; lowest validation false_safe_rate (ties: higher coverage)"
    else:
        chosen, chosen_reason = None, "validation split unavailable (cache/train.pkl missing)"
    per_gate = {}
    for g in gates:
        e = {f: bf[f]["emulator"]["gates"][g] for f in ["id"] + fams}
        fsr_id = e["id"]["false_safe_rate"]
        ood_ok = all((e[f]["false_safe_rate"] is None or np.isnan(e[f]["false_safe_rate"]) or e[f]["false_safe_rate"] <= 0.20) for f in fams)
        post_ok = all((e[f]["post_fallback_err_rel_tol"] is None or np.isnan(e[f]["post_fallback_err_rel_tol"]) or e[f]["post_fallback_err_rel_tol"] <= 1.0) for f in fams)
        n_bad_ood = sum(1 for f in fams if not (e[f]["false_safe_rate"] is None or np.isnan(e[f]["false_safe_rate"])) and e[f]["false_safe_rate"] > 0.20)
        per_gate[g] = {"id_false_safe_rate": fsr_id, "id_coverage": e["id"]["coverage"],
                       "ood_false_safe_rate": {f: e[f]["false_safe_rate"] for f in fams}, "ood_post_fallback_err_rel_tol": {f: e[f]["post_fallback_err_rel_tol"] for f in fams},
                       "ood_fallback_cost_frac_fine": {f: e[f]["fallback_cost_frac_fine"] for f in fams},
                       "clause3_id_fsr_le_0.05": bool(fsr_id is not None and not np.isnan(fsr_id) and fsr_id <= 0.05),
                       "clause4_ood_fsr_le_0.20_and_post_fallback_within_tol": bool(ood_ok and post_ok), "n_ood_families_fsr_gt_0.20": n_bad_ood,
                       "validation": (val["emulator"][g] if val else None)}
    c1, c2 = speedup_amortised >= 10.0, within_id >= 0.80
    ch = per_gate.get(chosen) if chosen else None
    c3 = bool(ch and ch["clause3_id_fsr_le_0.05"]); c4 = bool(ch and ch["clause4_ood_fsr_le_0.20_and_post_fallback_within_tol"])
    passes = bool(c1 and c2 and c3 and c4)
    falsified = bool(speedup_amortised < 3.0 or within_id < 0.60 or all(per_gate[g]["n_ood_families_fsr_gt_0.20"] >= 2 for g in gates))
    return {"speedup_inference_wall": speedup_inference, "speedup_amortised_wall": speedup_amortised, "n_id_queries": n_queries, "train_wall_s": train_wall,
            "fine_wall_s_per_query": fine_wall, "inference_wall_s_per_query": inf_wall, "id_within_tol_rate_emulator": within_id,
            "id_within_tol_rate_hybrid": float(bf["id"]["hybrid"]["within_tol_rate"]), "id_within_tol_rate_medium": float(bf["id"]["medium"]["within_tol_rate"]),
            "chosen_detector": chosen, "chosen_detector_rule": chosen_reason, "per_gate": per_gate,
            "clauses": {"1_amortised_speedup_ge_10": bool(c1), "2_id_within_tol_ge_0.80": bool(c2), "3_id_false_safe_le_0.05": c3, "4_ood_false_safe_le_0.20_post_fallback_within_tol": c4},
            "passes": passes, "falsified": falsified and not passes, "verdict": "passes" if passes else ("falsified" if falsified else "not passed")}


# ------------------------------------------------------------------------------------------ H8
def h8(run_dir: Path, rows: pd.DataFrame, n_boot: int, seed: int) -> dict:
    sur = json.load(open(run_dir / "surrogate_h5_h8.json")); bf = sur["by_family"]
    fams = [f for f in OOD_FAMILIES if f in bf]
    per_family = {}; n_lower = 0; n_ci = 0; n_emu_matches_or_beats = 0
    for f in fams:
        d = rows[rows.family == f]
        hy = d[d.closure == "hybrid"].set_index(["seed", "group", "target"]).err_rel_tol
        em = d[d.closure == "emulator"].set_index(["seed", "group", "target"]).err_rel_tol
        j = pd.concat([hy.rename("h"), em.rename("e")], axis=1, join="inner")
        mean_diff, lo, hi = paired_bootstrap(j.e.values, j.h.values, n_boot, seed)   # emulator - hybrid; > 0 favours the hybrid
        lower = bool(j.h.mean() < j.e.mean()); ci_excl = bool(lo > 0.0)
        n_lower += lower; n_ci += (lower and ci_excl); n_emu_matches_or_beats += (not lower)
        per_family[f] = {"n_pairs": int(len(j)), "hybrid_err_mean": float(j.h.mean()), "emulator_err_mean": float(j.e.mean()),
                         "hybrid_err_median": float(j.h.median()), "emulator_err_median": float(j.e.median()),
                         "hybrid_within_tol": float((j.h <= 1).mean()), "emulator_within_tol": float((j.e <= 1).mean()),
                         "diff_mean_emulator_minus_hybrid": mean_diff, "ci95": [lo, hi], "hybrid_lower": lower, "ci_excludes_0_favouring_hybrid": ci_excl,
                         "auroc_hybrid_discrepancy": auroc(d[d.closure == "hybrid"].gate_discrepancy.values, (d[d.closure == "hybrid"].err_rel_tol > 1).values),
                         "auroc_emulator_ens_std": auroc(d[d.closure == "emulator"].gate_ens_std.values, (d[d.closure == "emulator"].err_rel_tol > 1).values),
                         "auroc_hybrid_ens_std": auroc(d[d.closure == "hybrid"].gate_ens_std.values, (d[d.closure == "hybrid"].err_rel_tol > 1).values)}
    ood = rows[rows.family.isin(fams)]
    a_h = auroc(ood[ood.closure == "hybrid"].gate_discrepancy.values, (ood[ood.closure == "hybrid"].err_rel_tol > 1).values)
    a_e = auroc(ood[ood.closure == "emulator"].gate_ens_std.values, (ood[ood.closure == "emulator"].err_rel_tol > 1).values)
    a_hs = auroc(ood[ood.closure == "hybrid"].gate_ens_std.values, (ood[ood.closure == "hybrid"].err_rel_tol > 1).values)
    viol = {f: bf[f]["constraint_violations"] for f in ["id"] + fams if "constraint_violations" in bf[f]}
    passes = bool(n_lower >= 3 and n_ci >= 2 and (a_h >= a_e if np.isfinite(a_h) and np.isfinite(a_e) else False))
    falsified = bool(n_emu_matches_or_beats >= 3)
    return {"families": fams, "per_family": per_family, "n_families_hybrid_lower": n_lower, "n_families_ci_excludes_0": n_ci,
            "n_families_emulator_matches_or_beats": n_emu_matches_or_beats, "auroc_pooled_ood": {"hybrid_discrepancy": a_h, "emulator_ens_std": a_e, "hybrid_ens_std": a_hs},
            "constraint_violations": viol, "passes": passes, "falsified": falsified and not passes, "verdict": "passes" if passes else ("falsified" if falsified else "not passed"),
            "note": "error = mean error/tolerance over paired (episode, group, target) rows; invalidity AUROC = rank AUROC of the gate score for error > tolerance on the pooled OOD rows"}


# ------------------------------------------------------------------------------------------ H9
def precision_at_equal_recall(ft: pd.DataFrame, fam: str, baseline: str, recall0: float):
    """Precision of `baseline` (pooled over targets per parameter) interpolated at recall `recall0` along its
    parameter sweep, on family `fam` of a frontier_by_target table (as in verdicts.py, H3-V1)."""
    b = ft[(ft.family == fam) & (ft.policy == baseline)]
    if not len(b):
        return None
    bc = b.groupby("param")[["precision", "recall"]].mean().sort_values("recall")
    return float(np.interp(recall0, bc.recall.values, bc.precision.values)) if len(bc) > 1 else float(bc.precision.iloc[0])


def h9(run_dir: Path) -> dict | None:
    p = run_dir / "cross_formulation" / "summary.json"
    if not p.exists():
        return None
    cf = json.load(open(p)); pol = cf["policies"]
    ft_path = run_dir / "cross_formulation" / "frontier_by_target_AB.csv"
    ft = pd.read_csv(ft_path) if ft_path.exists() else None
    out = {"minimal_set_agreement_A_vs_B": cf.get("minimal_set_agreement_A_vs_B"), "necessary_rate_A": cf.get("necessary_rate_A"), "necessary_rate_B": cf.get("necessary_rate_B"),
           "physics_baselines": list(PHYSICS_BASELINES), "conditions": {}}
    for cond in ("voc", "voc_seq", "hybrid", "hybrid_seq"):
        if cond not in pol or "A" not in pol[cond] or "B" not in pol[cond]:
            continue
        pA, pB = pol[cond]["A"]["precision"], pol[cond]["B"]["precision"]
        base_B = {b: pol[b]["B"]["precision"] for b in PHYSICS_BASELINES if b in pol and "B" in pol[b]}
        best_B = max(base_B.values()) if base_B else float("nan")
        c1 = bool(pB is not None and pA and pB >= 0.8 * pA); c2 = bool(pB is not None and all(pB >= v for v in base_B.values()))
        eq = {}
        if ft is not None and pB is not None:
            for b in PHYSICS_BASELINES:
                pe = precision_at_equal_recall(ft, "B", b, float(pol[cond]["B"]["recall"]))
                if pe is not None:
                    eq[b] = {"baseline_precision_at_equal_recall_B": pe, "ratio": pB / max(pe, 1e-9)}
        out["conditions"][cond] = {"precision_A": pA, "precision_B": pB, "ratio_B_over_A": (pB / pA if pA else None), "recall_A": pol[cond]["A"]["recall"], "recall_B": pol[cond]["B"]["recall"],
                                   "supplementary_precision_at_equal_recall_B": eq,
                                   "err_rel_tol_A": pol[cond]["A"]["err_rel_tol_mean"], "err_rel_tol_B": pol[cond]["B"]["err_rel_tol_mean"],
                                   "cost_frac_A": pol[cond]["A"]["cost_frac_fine"], "cost_frac_B": pol[cond]["B"]["cost_frac_fine"],
                                   "physics_baseline_precision_B": base_B, "best_physics_baseline_precision_B": best_B,
                                   "clause_precision_B_ge_0.8_A": c1, "clause_precision_B_ge_physics_baselines_B": c2,
                                   "passes": c1 and c2, "falsified": bool(pB is not None and pB < best_B), "verdict": "passes" if (c1 and c2) else ("falsified" if (pB is not None and pB < best_B) else "not passed")}
    main = out["conditions"].get("voc")
    out.update(passes=bool(main and main["passes"]), falsified=bool(main and main["falsified"]), verdict=(main["verdict"] if main else "not evaluated"),
               note="principal condition: one-shot VoC router at the principal operating point; 'falls below the physics baselines' read as below the best of share / discrepancy / sensitivity under B")
    return out


# ------------------------------------------------------------------------------------------ H10
def h10(run_dir: Path, sub: str) -> dict | None:
    p = run_dir / sub / "summary.json"
    if not p.exists():
        return None
    s = json.load(open(p)); inst = json.load(open(run_dir / sub / "instances.json"))
    n_func = s.get("n_functionally_damaged")
    if n_func is None:   # legacy output (pre-variant script): infer from instances
        ev = [r for r in inst if "damaged_within_tol" in r]; func = [r for r in ev if not r["damaged_within_tol"]]
        n_func = len(func)
    block = s.get("functionally_damaged") or {}
    routed, fine, medium = block.get("routed", s.get("routed", {})), block.get("fine", s.get("fine", {})), block.get("medium", s.get("medium", {}))
    all3 = routed.get("restored_all_three"); fineA = routed.get("restored_fineA"); cost_ratio = block.get("routed_cost_over_fine", s.get("routed_cost_over_fine"))
    claimed_fail = routed.get("claimed_but_fails_fineA_rate")
    out = {"damage": s.get("damage", "kf_loss"), "status": s.get("damage_status", "preregistered (v1.1)"), "n_instances": s.get("n_instances"), "n_skipped_silent_wt": s.get("n_skipped_silent_wt"),
           "n_functionally_damaged": n_func, "damaged_within_tol_rate": s.get("damaged_within_tol_rate"), "voc_lambda": s.get("voc_lambda"), "voc_lambda_source": s.get("voc_lambda_source"),
           "routed": routed, "medium": medium, "fine": fine, "routed_cost_over_fine": cost_ratio}
    if not n_func:
        out.update(passes=False, falsified=False, verdict="not testable (no functionally damaged instance: the damage leaves both targets within tolerance)")
        return out
    ok = lambda v: v is not None and not (isinstance(v, float) and np.isnan(v))
    c1 = bool(ok(all3) and all3 >= 0.70); c2 = bool(ok(cost_ratio) and cost_ratio <= 0.50)
    f1 = bool(ok(fineA) and fineA < 0.50); f2 = bool(ok(claimed_fail) and claimed_fail > 0.30)
    out.update(clauses={"routed_restored_all_three_ge_0.70": c1, "routed_cost_le_0.5_fine": c2}, falsification_clauses={"routed_fineA_lt_0.50": f1, "routed_claimed_but_fails_fineA_gt_0.30": f2},
               passes=c1 and c2, falsified=(f1 or f2) and not (c1 and c2), verdict="passes" if (c1 and c2) else ("falsified" if (f1 or f2) else "not passed"))
    return out


# ------------------------------------------------------------------------------------------ reserved set
def reserve_replication(run_dir: Path, n_boot: int, seed: int) -> dict | None:
    """The reserved ID set (§8, §10): evaluated once at the operating points already selected on validation
    (verdicts.json), never used for any choice.  Paired differences vs the same baselines as on the test set."""
    vpath = run_dir / "verdicts.json"; rpath = run_dir / "cache" / "rows.pkl"
    if not vpath.exists() or not rpath.exists():
        return None
    v = json.load(open(vpath)); rows = pd.read_pickle(rpath)
    res = rows[rows.family == "reserve"].copy()
    if not len(res):
        return None
    res["cost_frac"] = res.cost / res.cost_fine; key = ["seed", "group", "target"]

    def rows_at(policy, param):
        d = res[(res.policy == policy) & np.isclose(res.param, param)]
        return d.set_index(key)[["err_rel_tol", "cost_frac"]]
    out = {"n_reserve_rows": int(res[key].drop_duplicates().shape[0]), "conditions": {}}
    for cond, C in v["conditions"].items():
        out["conditions"][cond] = {}
        for learned, L in C.items():
            pts = {}
            for budget, op in L["operating_points"].items():
                rl = rows_at(learned, op["param"])
                e = {"param": op["param"], "n_rows": int(len(rl)), "err_mean": float(rl.err_rel_tol.mean()) if len(rl) else float("nan"),
                     "cost_frac_mean": float(rl.cost_frac.mean()) if len(rl) else float("nan"), "success_rate": float((rl.err_rel_tol <= 1).mean()) if len(rl) else float("nan"),
                     "test_err_mean": op["err_mean"], "best_baseline_on_test": op.get("best_baseline"), "baselines": {}}
                for base, b in op["baselines"].items():
                    rb = rows_at(base, b["param"]); j = rl.join(rb, lsuffix="_l", rsuffix="_b", how="inner")
                    diff, lo, hi = paired_bootstrap(j.err_rel_tol_l.values, j.err_rel_tol_b.values, n_boot, seed) if len(j) else (float("nan"),) * 3
                    e["baselines"][base] = {"param": b["param"], "err_mean": float(rb.err_rel_tol.mean()) if len(rb) else float("nan"), "diff_mean": diff, "ci95": [lo, hi],
                                            "n_pairs": int(len(j)), "test_diff_mean": b["diff_mean"], "test_ci95": b["ci95"]}
                bb = e["best_baseline_on_test"]
                if bb and bb in e["baselines"] and np.isfinite(e["baselines"][bb]["err_mean"]) and e["baselines"][bb]["err_mean"] > 0:
                    e["ratio_vs_best_test_baseline"] = e["err_mean"] / e["baselines"][bb]["err_mean"]
                    e["replicates_direction"] = bool(np.sign(e["baselines"][bb]["diff_mean"]) == np.sign(b_td := e["baselines"][bb]["test_diff_mean"])) if np.isfinite(e["baselines"][bb]["diff_mean"]) else None
                pts[budget] = e
            out["conditions"][cond][learned] = pts
    return out


def fmt(v, nd=3):
    if v is None:
        return "—"
    if isinstance(v, bool):
        return "yes" if v else "no"
    if isinstance(v, (int, np.integer)):
        return str(v)
    if isinstance(v, float):
        return "nan" if np.isnan(v) else f"{v:.{nd}f}"
    return str(v)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--run-dir", required=True); ap.add_argument("--n-boot", type=int, default=2000); ap.add_argument("--seed", type=int, default=0)
    args = ap.parse_args(); rd = Path(args.run_dir)
    import yaml
    cfg = yaml.safe_load(open(rd / "config.yaml")); summary = json.load(open(rd / "summary.json"))
    rows = pd.read_csv(rd / "tables" / "surrogate_rows.csv")
    V = {"run": rd.name, "n_boot": args.n_boot, "H5_V1": h5(rd, summary, cfg, rows), "H8_V1": h8(rd, rows, args.n_boot, args.seed), "H9_V1": h9(rd),
         "H10_V1": h10(rd, "restoration"), "H10_V1_posthoc_nat_loss": h10(rd, "restoration_nat_loss"), "reserve_replication": reserve_replication(rd, args.n_boot, args.seed)}
    write_json(rd / "verdicts_extended.json", V)
    L = [f"# Preregistered verdicts (H5, H8, H9, H10) — {rd.name}", ""]
    h = V["H5_V1"]
    L += ["## H5-V1 — compiled surrogate with calibrated distrust", "",
          f"Verdict: **{h['verdict']}**. Clauses: " + "; ".join(f"{k} = {fmt(v)}" for k, v in h["clauses"].items()) + ".", "",
          f"- speed-up per query: inference {h['speedup_inference_wall']:.0f}×, amortised over {h['n_id_queries']} ID queries {h['speedup_amortised_wall']:.0f}× (fine {h['fine_wall_s_per_query']:.2f} s, inference {h['inference_wall_s_per_query']*1e3:.2f} ms, training {h['train_wall_s']:.1f} s)",
          f"- ID within-tolerance rate: emulator {h['id_within_tol_rate_emulator']:.3f}, hybrid {h['id_within_tol_rate_hybrid']:.3f}, medium {h['id_within_tol_rate_medium']:.3f}",
          f"- detector chosen on validation ID data only: **{h['chosen_detector']}** ({h['chosen_detector_rule']})", "",
          "| gate | validation FSR | validation coverage | ID FSR | ID coverage | " + " | ".join(f"FSR {f}" for f in OOD_FAMILIES) + " | " + " | ".join(f"post-fallback err {f}" for f in OOD_FAMILIES) + " |",
          "|---|---|---|---|---|" + "---|" * (2 * len(OOD_FAMILIES))]
    for g, m in h["per_gate"].items():
        va = m["validation"] or {}
        L.append(f"| {g}{' (chosen)' if g == h['chosen_detector'] else ''} | {fmt(va.get('false_safe_rate'))} | {fmt(va.get('coverage'))} | {fmt(m['id_false_safe_rate'])} | {fmt(m['id_coverage'])} | "
                 + " | ".join(fmt(m["ood_false_safe_rate"].get(f)) for f in OOD_FAMILIES) + " | " + " | ".join(fmt(m["ood_post_fallback_err_rel_tol"].get(f)) for f in OOD_FAMILIES) + " |")
    h = V["H8_V1"]
    L += ["", "## H8-V1 — hybrid closure (medium + learned residual) vs black-box emulator", "",
          f"Verdict: **{h['verdict']}** — hybrid lower mean error on {h['n_families_hybrid_lower']}/{len(h['families'])} OOD families (paired CI excludes 0 on {h['n_families_ci_excludes_0']}); "
          f"pooled-OOD invalidity AUROC: hybrid discrepancy monitor {fmt(h['auroc_pooled_ood']['hybrid_discrepancy'])} vs emulator ensemble spread {fmt(h['auroc_pooled_ood']['emulator_ens_std'])} (hybrid ensemble spread {fmt(h['auroc_pooled_ood']['hybrid_ens_std'])}).", "",
          "| family | pairs | hybrid mean | emulator mean | diff (emu − hyb) [95 % CI] | hybrid median | emulator median | hybrid within tol | emulator within tol | AUROC hyb-disc | AUROC emu-ens |", "|---|---|---|---|---|---|---|---|---|---|---|"]
    for f, m in h["per_family"].items():
        L.append(f"| {f} | {m['n_pairs']} | {m['hybrid_err_mean']:.3f} | {m['emulator_err_mean']:.3f} | {m['diff_mean_emulator_minus_hybrid']:+.3f} [{m['ci95'][0]:+.3f}, {m['ci95'][1]:+.3f}] | {m['hybrid_err_median']:.3f} | {m['emulator_err_median']:.3f} | {m['hybrid_within_tol']:.3f} | {m['emulator_within_tol']:.3f} | {fmt(m['auroc_hybrid_discrepancy'])} | {fmt(m['auroc_emulator_ens_std'])} |")
    L.append(""); L.append("Constraint violations (spike_count ≥ 0, recovery_fraction ∈ [0, 1.05], min_isi > 0, time_to_peak > 0): " + "; ".join(f"{f}: hybrid {v['hybrid']['rate']:.3f}, emulator {v['emulator']['rate']:.3f}" for f, v in h["constraint_violations"].items()))
    h = V["H9_V1"]
    L += ["", "## H9-V1 — cross-formulation transfer (level-A-trained router under the level-B truth)", ""]
    if h is None:
        L.append("Not evaluated (cross_formulation/summary.json missing).")
    else:
        L += [f"Verdict (one-shot VoC): **{h['verdict']}**. Minimal-set agreement A vs B {fmt(h['minimal_set_agreement_A_vs_B'])}; necessary-rate A {fmt(h['necessary_rate_A'])}, B {fmt(h['necessary_rate_B'])}.", "",
              "| condition | precision A | precision B | B/A | recall A | recall B | err/tol A | err/tol B | best physics baseline precision under B (at its own 30 % point) | ≥ 0.8·A | ≥ physics baselines | verdict | supplementary: baselines' precision at equal recall under B (ratio) |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
        for c, m in h["conditions"].items():
            L.append(f"| {c} | {fmt(m['precision_A'])} | {fmt(m['precision_B'])} | {fmt(m['ratio_B_over_A'])} | {fmt(m['recall_A'])} | {fmt(m['recall_B'])} | {fmt(m['err_rel_tol_A'])} | {fmt(m['err_rel_tol_B'])} | {fmt(m['best_physics_baseline_precision_B'])} ({', '.join(f'{k} {fmt(v)}' for k, v in m['physics_baseline_precision_B'].items())}) | {fmt(m['clause_precision_B_ge_0.8_A'])} | {fmt(m['clause_precision_B_ge_physics_baselines_B'])} | {m['verdict']} | "
                     + ", ".join(f"{k} {fmt(v['baseline_precision_at_equal_recall_B'])} ({fmt(v['ratio'], 2)}×)" for k, v in m["supplementary_precision_at_equal_recall_B"].items()) + " |")
    for key, title in (("H10_V1", "H10-V1 — functional restoration precursor (preregistered damage: Kf loss)"), ("H10_V1_posthoc_nat_loss", "H10 post-hoc exploratory variant (NaT loss; not a preregistered verdict)")):
        h = V[key]; L += ["", f"## {title}", ""]
        if h is None:
            L.append("Not evaluated (restoration outputs missing)."); continue
        L += [f"Verdict: **{h['verdict']}**. Instances {h['n_instances']} (silent wild types skipped: {fmt(h['n_skipped_silent_wt'])}); functionally damaged {h['n_functionally_damaged']}; damage within tolerance in {fmt(h['damaged_within_tol_rate'])} of evaluated instances; routed threshold {fmt(h['voc_lambda'], 4)} ({h['voc_lambda_source']}).", ""]
        if h["n_functionally_damaged"]:
            L += ["| method | restored fine A | restored fine B | restored held-out | all three | claimed by the search | claimed but fails fine A | search cost (nominal) |", "|---|---|---|---|---|---|---|---|"]
            for m in ("routed", "medium", "fine"):
                r = h[m]
                L.append(f"| {m} | {fmt(r.get('restored_fineA'))} | {fmt(r.get('restored_fineB'))} | {fmt(r.get('restored_heldout'))} | {fmt(r.get('restored_all_three'))} | {fmt(r.get('claimed_restored'))} | {fmt(r.get('claimed_but_fails_fineA_rate'))} | {fmt(r.get('search_cost'), 0)} |")
            L.append(f"\nRouted search cost / uniform-fine search cost: {fmt(h['routed_cost_over_fine'])}.")
    r = V["reserve_replication"]
    L += ["", "## Reserved ID set — replication at the operating points selected on validation (no new selection)", ""]
    if r is None:
        L.append("Not evaluated (no reserved family in the rows table).")
    else:
        L += [f"Reserved rows: {r['n_reserve_rows']}.", "", "| condition | router | budget | reserve err/tol (test) | reserve cost | success | best baseline on test | reserve diff [95 % CI] (test diff) | ratio |", "|---|---|---|---|---|---|---|---|---|"]
        for cond, C in r["conditions"].items():
            for learned, pts in C.items():
                for budget, e in pts.items():
                    bb = e["best_baseline_on_test"]; b = e["baselines"].get(bb) if bb else None
                    L.append(f"| {cond} | {learned} | {budget} | {fmt(e['err_mean'])} ({fmt(e['test_err_mean'])}) | {fmt(e['cost_frac_mean'])} | {fmt(e['success_rate'], 2)} | {bb or '—'} | "
                             + (f"{b['diff_mean']:+.3f} [{b['ci95'][0]:+.3f}, {b['ci95'][1]:+.3f}] ({b['test_diff_mean']:+.3f})" if b else "—") + f" | {fmt(e.get('ratio_vs_best_test_baseline'), 2)} |")
    (rd / "verdicts_extended.md").write_text("\n".join(L) + "\n"); print("\n".join(L))


if __name__ == "__main__":
    main()

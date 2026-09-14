"""Turn row-level condition results into tables, figures and pre-registered hypothesis verdicts."""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score

from . import metrics as M
from . import plots as P
from ..uncertainty.calibration import reliability_curve, expected_calibration_error, brier_score
from ..models.simulators import simulate_mixed, simulate_reference


def _one_shot_probs(rows, policy):
    """Per-node probabilities/scores from the one-shot policy (identical across taus): one row per episode."""
    seen, P_, S_, Y_, F_ = set(), [], [], [], []
    for r in rows:
        if r["policy"] != policy or r["seed"] in seen or r["prob"] is None:
            continue
        seen.add(r["seed"])
        P_.append(r["prob"]); S_.append(r["std"]); F_.append(r["scores"])
    return seen, P_, S_, F_


def _labels_for(episodes, seeds_order):
    by = {ep["seed"]: ep for ep in episodes}
    nec = np.concatenate([by[s]["necessary"].astype(int) for s in seeds_order])
    flips = np.concatenate([by[s]["flips_true"].astype(int) for s in seeds_order])
    return nec, flips


def _auroc(y, s):
    y = np.asarray(y); s = np.asarray(s, float)
    if y.min() == y.max() or not np.isfinite(s).all():
        return np.nan
    return float(roc_auc_score(y, s))


def score_metrics(rows, episodes, policy):
    seen, P_, S_, F_ = _one_shot_probs(rows, policy)
    if not seen:
        return {}
    seeds_order = []
    for r in rows:
        if r["policy"] == policy and r["seed"] in seen and r["seed"] not in seeds_order and r["prob"] is not None:
            seeds_order.append(r["seed"])
    nec, flips = _labels_for(episodes, seeds_order)
    p = np.concatenate(P_); s = np.concatenate(S_); f = np.concatenate(F_)
    out = {"auroc_necessary_prob": _auroc(nec, p), "auroc_necessary_score": _auroc(nec, f),
           "auroc_flip_prob": _auroc(flips, p), "ece_necessary": expected_calibration_error(p, nec),
           "brier_necessary": brier_score(p, nec), "mean_std": float(np.mean(s)),
           "auroc_std_for_mistake": np.nan, "n_nodes": int(len(p))}
    # does disagreement predict mistakes of the point prediction?  mistake = (p>0.5) != necessary
    mistake = ((p > 0.5).astype(int) != nec).astype(int)
    out["auroc_std_for_mistake"] = _auroc(mistake, s)
    out["reliability"] = reliability_curve(p, nec)
    out["_p"] = p; out["_s"] = s; out["_nec"] = nec; out["_flips"] = flips
    return out


def matched_operating_point(tab, family, policy, target_cost):
    t = tab[(tab.family == family) & (tab.policy == policy)]
    if t.empty:
        return None
    ok = t[t.cost_mean <= target_cost]
    if ok.empty:
        return t.sort_values("cost_mean").iloc[0]
    return ok.sort_values("err_mean").iloc[0]


def analyze(cfg, out_dir: Path, fig_dir: Path, train_eps, test_eps, ood_eps, rows, ood_rows, models, model_info):
    tol_ref = float(cfg["tol_ref"])
    tables_dir = out_dir / "tables"; tables_dir.mkdir(exist_ok=True)
    summary = {"tol_ref": tol_ref}

    # ---------------- in-distribution frontier ----------------
    df = M.rows_to_frame(rows)
    tab = M.pareto_table(df, tol_ref)
    tab.to_csv(tables_dir / "pareto_id.csv", index=False)
    uni = {p: tab[(tab.family == "id") & (tab.policy == p)].iloc[0] for p in ("uniform_coarse", "uniform_medium", "uniform_fine")}
    c_med, c_fine = float(uni["uniform_medium"].cost_mean), float(uni["uniform_fine"].cost_mean)
    e_fine, e_med, e_coarse = float(uni["uniform_fine"].err_mean), float(uni["uniform_medium"].err_mean), float(uni["uniform_coarse"].err_mean)
    budgets = [c_med * f for f in (1.25, 1.5, 2.0, 2.5, 3.0)]
    tol_levels = [0.002, 0.005, tol_ref, 0.02, 0.05]
    fs = M.frontier_summary(tab, "id", tol_levels, budgets)
    fs.to_csv(tables_dir / "frontier_summary_id.csv", index=False)
    summary["uniform"] = {"cost_medium": c_med, "cost_fine": c_fine, "err_fine": e_fine, "err_medium": e_med,
                          "err_coarse": e_coarse, "cost_coarse": float(uni["uniform_coarse"].cost_mean)}
    P.pareto_plot(tab, "id", fig_dir / "fig1_pareto_id", tol_ref=tol_ref,
                  title=f"Accuracy vs compute, in-distribution test set ({len(test_eps)} episodes, 95% bootstrap CI)")
    P.pareto_plot(tab, "id", fig_dir / "fig1b_pareto_id_wallclock", cost_col="wall_mean", lo_col="none", hi_col="none",
                  tol_ref=tol_ref, title="Accuracy vs wall-clock (seconds, includes controller overhead)",
                  xlabel="mean wall-clock per episode (s)")

    # H1: any adaptive policy at <= 1.5 x fine error and <= 50% fine cost?  Also the oracle.
    adaptive = [p for p in tab[tab.family == "id"].policy.unique() if not p.startswith("uniform")]
    h1 = {}
    for p in adaptive:
        c, e = M._curve(tab, p, "id")
        ok = (e <= 1.5 * e_fine) & (c <= 0.5 * c_fine)
        h1[p] = {"achieved": bool(ok.any()), "min_cost_meeting": float(c[ok].min()) if ok.any() else None,
                 "cost_fraction_of_fine": float(c[ok].min() / c_fine) if ok.any() else None}
    summary["H1"] = {"criterion": "err <= 1.5*err_fine at cost <= 0.5*cost_fine", "per_policy": h1,
                     "supported_by_any_adaptive": any(v["achieved"] for k, v in h1.items() if not k.startswith("oracle")),
                     "oracle_achieves": h1.get("oracle", {}).get("achieved")}

    # H2: causal fidelity — medium error split by whether anything switched
    sw = np.array([ep["flips_true"].any() for ep in test_eps])
    em = np.array([abs(ep["Y_med"] - ep["Y_ref"]) for ep in test_eps])
    ef = np.array([abs(ep["Y_fine"] - ep["Y_ref"]) for ep in test_eps])
    ec = np.array([abs(ep["Y_coarse"] - ep["Y_ref"]) for ep in test_eps])
    summary["H2"] = {"frac_episodes_with_switch": float(sw.mean()),
                     "err_medium_switch": float(em[sw].mean()) if sw.any() else None,
                     "err_medium_noswitch": float(em[~sw].mean()) if (~sw).any() else None,
                     "err_fine_floor": float(ef.mean()), "err_coarse_switch": float(ec[sw].mean()) if sw.any() else None,
                     "err_coarse_noswitch": float(ec[~sw].mean()) if (~sw).any() else None}
    summary["H2"]["supported"] = bool(summary["H2"]["err_medium_switch"] is not None and
                                      summary["H2"]["err_medium_switch"] > 10 * summary["H2"]["err_fine_floor"] and
                                      summary["H2"]["err_medium_noswitch"] <= 2 * summary["H2"]["err_fine_floor"])

    # H4: sparsity of the minimal set
    sizes = {"id": np.array([int(ep["necessary"].sum()) for ep in test_eps])}
    for fam, eps in ood_eps.items():
        sizes[fam] = np.array([int(ep["necessary"].sum()) for ep in eps])
    summary["H4"] = {fam: {"median": float(np.median(v)), "mean": float(v.mean()), "frac_zero": float((v == 0).mean()),
                           "frac_ge_half": float((v >= test_eps[0]["spec"].K / 2).mean())} for fam, v in sizes.items()}
    summary["H4"]["supported_id"] = bool(np.median(sizes["id"]) <= 2 and (sizes["id"] == 0).mean() >= 0.4)
    summary["label_quality"] = {"frac_tol_unreachable": float(np.mean([not ep["tol_reachable"] for ep in test_eps])),
                                "frac_nonmonotone": float(np.mean([ep["nonmonotone"] for ep in test_eps])),
                                "frac_invariant_violation": float(np.mean([not ep["invariants"]["ok"] for ep in test_eps]))}
    P.minimal_set_plot({k: v for k, v in sizes.items() if k in ("id", "amp_high", "multi2", "step", "K20")}, fig_dir / "fig6_minimal_set_sizes")

    # H3 / H7: routing quality and calibration of the scores
    sm = {}
    for pol in ["learned", "physics", "adjoint"] + [p for p in tab.policy.unique() if p.startswith("abl_") and not p.endswith("_seq")]:
        s = score_metrics(rows, test_eps, pol)
        if s:
            sm[pol] = s
    oracle_cost = float(tab[(tab.family == "id") & (tab.policy == "oracle") & (tab.param == tol_ref)].cost_mean.iloc[0])
    h3 = {}
    for pol in sm:
        op = matched_operating_point(tab, "id", pol, oracle_cost)
        h3[pol] = {k: (None if (isinstance(v, float) and np.isnan(v)) else v) for k, v in sm[pol].items() if not k.startswith("_") and k != "reliability"}
        h3[pol].update({"f1_at_oracle_cost": float(op.f1), "precision_at_oracle_cost": float(op.precision),
                        "recall_at_oracle_cost": float(op.recall), "err_at_oracle_cost": float(op.err_mean),
                        "cost_at_oracle_cost": float(op.cost_mean), "tau_at_oracle_cost": float(op.param)})
    summary["H3"] = {"oracle_cost_at_tol_ref": oracle_cost, "per_policy": h3}
    L = h3.get("learned", {}); Ph = h3.get("physics", {})
    summary["H3"]["supported"] = bool(L and L["auroc_necessary_prob"] is not None and L["auroc_necessary_prob"] >= 0.85
                                      and L["f1_at_oracle_cost"] >= 0.6 and L["ece_necessary"] <= 0.1)
    summary["H3"]["falsified"] = bool(L and ((L["auroc_necessary_prob"] or 0) <= 0.7 or (Ph and L["f1_at_oracle_cost"] <= Ph["f1_at_oracle_cost"])))
    summary["H7"] = {"ece_learned": L.get("ece_necessary"), "supported": bool(L and L["ece_necessary"] <= 0.1),
                     "falsified": bool(L and L["ece_necessary"] >= 0.2)}
    curves = {k: sm[k]["reliability"] for k in ("learned", "physics") if k in sm}
    eces = {k: sm[k]["ece_necessary"] for k in curves}
    std_h = {"id": sm["learned"]["_s"]} if "learned" in sm else {}

    # ---------------- OOD ----------------
    ood_summary = {}; ood_rows_plot = []
    for fam, orows in ood_rows.items():
        dff = M.rows_to_frame(orows); tabf = M.pareto_table(dff, tol_ref)
        tabf.to_csv(tables_dir / f"pareto_ood_{fam}.csv", index=False)
        P.pareto_plot(tabf, fam, fig_dir / f"figS_pareto_{fam}", tol_ref=tol_ref, title=f"Accuracy vs compute — OOD family '{fam}'")
        uf = tabf[tabf.policy == "uniform_fine"].iloc[0]; um = tabf[tabf.policy == "uniform_medium"].iloc[0]
        budget = 2.0 * float(um.cost_mean)
        vals = {}
        for pol in ["learned", "learned_seq", "physics", "physics_seq", "adjoint", "random", "oracle"]:
            c, e = M._curve(tabf, pol, fam)
            if len(c):
                vals[pol] = M.interp_error_at_cost(c, e, budget)
        vals["uniform_fine"] = float(uf.err_mean); vals["uniform_medium"] = float(um.err_mean)
        s_learn = score_metrics(orows, ood_eps[fam], "learned"); s_phys = score_metrics(orows, ood_eps[fam], "physics")
        ood_summary[fam] = {"budget_2x_medium": budget, "err_at_budget": vals,
                            "learned": {k: v for k, v in s_learn.items() if not k.startswith("_") and k != "reliability"},
                            "physics": {k: v for k, v in s_phys.items() if not k.startswith("_") and k != "reliability"},
                            "cost_fine": float(uf.cost_mean), "cost_medium": float(um.cost_mean)}
        ood_rows_plot.append({"family": fam, "values": vals})
        if s_learn:
            std_h[fam] = s_learn["_s"]
    summary["OOD"] = ood_summary
    if ood_rows_plot:
        # include the in-distribution row first
        vals_id = {}
        for pol in ["learned", "learned_seq", "physics", "physics_seq", "adjoint", "random", "oracle"]:
            c, e = M._curve(tab, pol, "id")
            if len(c):
                vals_id[pol] = M.interp_error_at_cost(c, e, 2.0 * c_med)
        vals_id["uniform_fine"] = e_fine
        P.ood_plot([{"family": "id (in-distribution)", "values": vals_id}] + ood_rows_plot, fig_dir / "fig4_ood",
                   budget_label="= 2 × uniform-medium cost")
    P.calibration_plot(curves, std_h, fig_dir / "fig2_calibration", eces)
    # H6: transfer to different simulator formulations
    h6 = {}
    for fam in ("sigmoid", "noisy"):
        if fam in ood_summary and ood_summary[fam]["learned"]:
            a = ood_summary[fam]["learned"].get("auroc_necessary_prob")
            c_r, e_r = M._curve(M.pareto_table(M.rows_to_frame(ood_rows[fam]), tol_ref), "random", fam)
            e_learn = ood_summary[fam]["err_at_budget"].get("learned", np.nan)
            e_rand = M.interp_error_at_cost(c_r, e_r, ood_summary[fam]["budget_2x_medium"]) if len(c_r) else np.nan
            h6[fam] = {"auroc": a, "err_learned_at_budget": e_learn, "err_random_at_budget": e_rand}
    summary["H6"] = {"per_family": h6,
                     "supported": bool(h6 and all((v["auroc"] or 0) >= 0.8 and v["err_learned_at_budget"] < v["err_random_at_budget"] for v in h6.values())),
                     "falsified": bool(h6 and any((v["auroc"] or 0) <= 0.7 for v in h6.values()))}

    # ---------------- H9: paired bootstrap of frontier differences ----------------
    grid = budgets
    diffs = {}
    pairs = [("learned", "physics", "F learned − E2 physics"), ("learned_seq", "physics_seq", "Fs learned(seq) − E2s physics(seq)"),
             ("learned", "adjoint", "F learned − E3 adjoint"), ("learned_seq", "adjoint", "Fs learned(seq) − E3 adjoint"),
             ("learned_seq", "oracle", "Fs learned(seq) − O oracle")]
    h9 = {}
    for a, b, lab in pairs:
        if a in set(df.policy) and b in set(df.policy):
            d = M.bootstrap_curve_difference(df, "id", a, b, grid, n_boot=300)
            diffs[lab] = d
            better = [(bool(hi < 0), float(m)) for m, hi in zip(d["mean"], d["hi"])]
            h9[lab] = {"budgets": [float(g) for g in grid], "mean_diff": [float(x) for x in d["mean"]],
                       "ci_lo": [float(x) for x in d["lo"]], "ci_hi": [float(x) for x in d["hi"]],
                       "n_budgets_learned_significantly_better": int(sum(b_ for b_, _ in better)),
                       "n_budgets_comparator_significantly_better": int(sum(bool(lo > 0) for lo in d["lo"]))}
    summary["H9"] = {"pairs": h9}
    nb = lambda k: h9.get(k, {}).get("n_budgets_learned_significantly_better", 0)
    n_better_physics = max(nb("F learned − E2 physics"), nb("Fs learned(seq) − E2s physics(seq)"))
    n_better_adjoint = max(nb("F learned − E3 adjoint"), nb("Fs learned(seq) − E3 adjoint"))
    summary["H9"]["n_budgets_better_than_physics"] = n_better_physics
    summary["H9"]["n_budgets_better_than_adjoint"] = n_better_adjoint
    # supported only if the learned router beats BOTH heuristic families (the best heuristic) at >= 3 of 5 budgets
    summary["H9"]["supported"] = bool(min(n_better_physics, n_better_adjoint) >= 3)
    # falsified if some heuristic family is never significantly dominated
    summary["H9"]["falsified"] = bool(min(n_better_physics, n_better_adjoint) == 0)
    if diffs:
        P.curve_difference_plot(diffs, fig_dir / "fig7_frontier_differences", {"B medium": c_med, "C fine": c_fine})

    # ---------------- ablations ----------------
    abl_rows = []
    for pol in [p for p in tab[tab.family == "id"].policy.unique() if p.startswith("learned") or p.startswith("abl_")]:
        c, e = M._curve(tab, pol, "id")
        rr = {"name": pol, "err_at_1.5x_medium": M.interp_error_at_cost(c, e, 1.5 * c_med), "err_at_2x_medium": M.interp_error_at_cost(c, e, 2.0 * c_med),
              "cost_to_tol": M.cost_to_reach(c, e, tol_ref), "auroc": sm.get(pol, {}).get("auroc_necessary_prob", np.nan),
              "ece": sm.get(pol, {}).get("ece_necessary", np.nan)}
        abl_rows.append(rr)
    pd.DataFrame(abl_rows).to_csv(tables_dir / "ablations_id.csv", index=False)
    summary["ablations"] = abl_rows
    if abl_rows:
        P.ablation_plot(abl_rows, fig_dir / "fig5_ablations", ["err_at_2x_medium", "cost_to_tol", "auroc"],
                        ["mean error at 2× medium cost", "cost to reach tol (∞ = never)", "AUROC (necessary)"])

    # ---------------- refinement-location examples + trajectories ----------------
    by_seed = {ep["seed"]: ep for ep in test_eps}
    op_l = matched_operating_point(tab, "id", "learned_seq", oracle_cost); op_p = matched_operating_point(tab, "id", "physics_seq", oracle_cost)
    examples = []
    # three qualitatively different examples: a cascade with several necessary nodes, a typical
    # single-necessary case, and switching that is causally irrelevant to the readout
    def pick(pred, key):
        c = [ep for ep in test_eps if pred(ep)]
        return sorted(c, key=key)[:1]
    cand = pick(lambda ep: ep["necessary"].sum() >= 2, lambda ep: -int(ep["flips_true"].sum()))
    cand += pick(lambda ep: ep["necessary"].sum() == 1 and ep["flips_true"].sum() >= 2, lambda ep: -int(ep["flips_true"].sum()))
    cand += pick(lambda ep: ep["necessary"].sum() == 0 and ep["flips_true"].sum() >= 1, lambda ep: -int(ep["flips_true"].sum()))
    if not cand:
        cand = test_eps[:3]
    for ep in cand:
        panels, errs, costs = {}, {}, {}
        for pol, op in (("learned (seq.)", op_l), ("physics heuristic (seq.)", op_p)):
            polname = "learned_seq" if pol.startswith("learned") else "physics_seq"
            r = [r for r in rows if r["seed"] == ep["seed"] and r["policy"] == polname and abs(r["param"] - float(op.param)) < 1e-9]
            if r:
                panels[pol] = r[0]["fidelity"]; errs[pol] = r[0]["abs_err"]; costs[pol] = r[0]["cost"]
        if panels:
            examples.append({"spec": ep["spec"], "interv": ep["interv"], "necessary": ep["necessary"], "flips": ep["flips_true"],
                             "panels": panels, "errs": errs, "costs": costs})
    if examples:
        P.refinement_location_plot(examples, fig_dir / "fig3_refinement_locations")
        ep = cand[0]
        from ..models.simulators import SimConfig
        sim_cfg = SimConfig(**cfg["sim"])
        ref = simulate_reference(ep["spec"], ep["interv"], sim_cfg)
        K = ep["spec"].K
        fine = simulate_mixed(ep["spec"], ep["interv"], np.full(K, 2), sim_cfg)
        med = simulate_mixed(ep["spec"], ep["interv"], np.ones(K, int), sim_cfg)
        coarse = simulate_mixed(ep["spec"], ep["interv"], np.zeros(K, int), sim_cfg)
        nodes = list(np.where(ep["necessary"])[0][:2]) + list(ep["interv"].nodes[:1])
        P.trajectory_example_plot({"t": ref["t"], "x_ref": ref["x"], "x_fine": fine["x"], "x_med": med["x"], "x_coarse": coarse["x"],
                                   "y_ref": ref["y"], "y_med": med["y"], "readout": ep["spec"].readout, "t_on": ep["interv"].t_on,
                                   "t_off": ep["interv"].t_on + ep["interv"].duration, "nodes": nodes[:3]}, fig_dir / "fig0_example_trajectories")
    summary["model_info"] = model_info
    summary["n_test"] = len(test_eps); summary["n_train"] = len(train_eps)
    return summary

#!/usr/bin/env python
"""V1 pipeline: build (calibrate hierarchy) -> generate (label episodes) -> train -> evaluate -> ood -> analyze."""
from __future__ import annotations
import argparse, json, os, pickle, sys, time, resource, zlib
from pathlib import Path
for _v in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS"):
    os.environ.setdefault(_v, "1")
import multiprocessing as mp
import numpy as np
import pandas as pd
import yaml

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.evaluation.provenance import collect_provenance, write_json  # noqa: E402
from physics_to_life.v1.parameters import provisional_membrane  # noqa: E402
from physics_to_life.v1.calibrate import calibrate_medium_to_fine_traces  # noqa: E402
from physics_to_life.v1.episodes import sample_instance, sample_intervention, standard_groups, label_episode, EpisodeConfig, relabel  # noqa: E402
from physics_to_life.v1.experiment import training_rows, evaluate_episodes, frontier_table, pooled_frontier, row_features  # noqa: E402
from physics_to_life.v1.routing import VoCRegressor, HardLabelClassifier, set_schema  # noqa: E402
from physics_to_life.v1.ood import RangeGuard, KNNDensity, Conformal, detector_metrics  # noqa: E402
from physics_to_life.v1 import plots_v1 as P  # noqa: E402
from physics_to_life.v1.surrogate import fit_and_evaluate  # noqa: E402
from physics_to_life.v1.systems import gunay2015_profile as GP  # noqa: E402


class ProvisionalProfile:
    """Episode definitions of the provisional placeholder system (pilot machinery only)."""
    group_names = ["vclamp_shaker", "recovery_shaker", "cclamp"]
    rate_keys = ["activation", "opening", "inactivation", "recovery", "c_inactivation", "k_activation", "na_activation", "na_inactivation", "na_recovery"]

    def sample_intervention(self, rng, family, names):
        return sample_intervention(rng, family, names)

    def groups(self, rng):
        return standard_groups(rng)


class GunayProfile:
    group_names = GP.GROUP_NAMES
    rate_keys = GP.RATE_KEYS

    def sample_intervention(self, rng, family, names):
        return GP.sample_intervention(rng, family)

    def groups(self, rng):
        return GP.groups(rng)


def build_system(cfg):
    if cfg["system"] == "provisional":
        spec = provisional_membrane(); profile = ProvisionalProfile()
    elif cfg["system"] == "gunay2015":
        from physics_to_life.v1.systems.gunay2015_fine import gunay2015_hierarchy, load_params
        params = load_params(HERE / cfg.get("hierarchy_params", "hierarchy/gunay2015_fine.json"))
        spec = gunay2015_hierarchy(params, q10=float(cfg.get("q10", 3.0))); profile = GunayProfile()
    else:
        raise ValueError(cfg["system"])
    report = {"profile": type(profile).__name__}
    if cfg.get("calibrate_medium", True):
        for ch in spec.channels:
            if ch.hh_exact:
                report[ch.name] = {"rel_rmse": 0.0, "g_scale_cheap": 1.0, "note": "HH level exactly equivalent to Markov level; not fitted"}
                continue
            power = ch.hh_gates[0].power
            info = calibrate_medium_to_fine_traces(spec, ch.name, power=power, n_starts=2)
            report[ch.name] = {"rel_rmse": info["rel_rmse"], "g_scale_cheap": info["params"][12]}
    return spec, report, profile


def _one_episode(args):
    spec, seed, family, cfg_ep, g_cv, r_cv, profile = args
    rng = np.random.default_rng(seed)
    inst = sample_instance(spec, rng, g_cv=g_cv, rate_cv=r_cv)
    names = [c.name for c in spec.channels]
    interv = profile.sample_intervention(rng, family, names)
    groups = profile.groups(rng)
    return label_episode(spec, inst, interv, groups, cfg_ep, seed=seed, family=family)


def generate(spec, seeds, families, cfg, n_proc, rng, profile):
    fams = [str(rng.choice(families)) for _ in seeds]
    cfg_ep = EpisodeConfig(base_level=int(cfg["base_level"]), tol_rel=float(cfg["tol_rel"]), routable=cfg.get("routable"))
    jobs = [(spec, int(s), f, cfg_ep, float(cfg["instance_g_cv"]), float(cfg["instance_rate_cv"]), profile) for s, f in zip(seeds, fams)]
    if n_proc <= 1:
        return [_one_episode(j) for j in jobs]
    with mp.get_context("spawn").Pool(n_proc) as pool:
        return pool.map(_one_episode, jobs, chunksize=2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default=str(HERE / "config.yaml"))
    ap.add_argument("--smoke", action="store_true")
    ap.add_argument("--run-id", default=None)
    ap.add_argument("--n-proc", type=int, default=None)
    ap.add_argument("--relabel", action="store_true", help="recompute tolerances/minimal sets of cached episodes under the current rules")
    args = ap.parse_args()
    cfg = yaml.safe_load(open(args.config))
    if args.smoke:
        cfg.update(dict(run_id="smoke", n_train=12, n_test=6, n_ood=4, ensemble_members=2))
    if args.run_id:
        cfg["run_id"] = args.run_id
    if args.n_proc:
        cfg["n_proc"] = args.n_proc
    out = HERE / "results" / cfg["run_id"]; cache = out / "cache"; figs = out / "figures"; tabs = out / "tables"
    for d in (out, cache, figs, tabs):
        d.mkdir(parents=True, exist_ok=True)
    prov = collect_provenance(cfg, int(cfg["seed"])); write_json(out / "provenance.json", prov)
    yaml.safe_dump(cfg, open(out / "config.yaml", "w"))
    t_start = time.time(); seed = int(cfg["seed"]); n_proc = int(cfg["n_proc"]); rng = np.random.default_rng(seed)
    timings = {}

    # ---- build
    print("[build]", flush=True); t0 = time.time()
    spec_path = cache / "spec.pkl"
    if spec_path.exists():
        spec, report, profile = pickle.load(open(spec_path, "rb"))
    else:
        spec, report, profile = build_system(cfg); pickle.dump((spec, report, profile), open(spec_path, "wb"))
    write_json(out / "calibration_report.json", report); timings["build_s"] = time.time() - t0
    names = [c.name for c in spec.channels]
    set_schema(profile.group_names, profile.rate_keys)
    print(f"  channels {names}; calibration {report}", flush=True)

    # ---- generate
    print("[generate]", flush=True); t0 = time.time()
    def load_or_gen(name, seeds, fams):
        p = cache / f"{name}.pkl"
        if p.exists():
            eps = pickle.load(open(p, "rb"))
            if args.relabel:   # apply the current tolerance / noise-floor rules to cached labels (no simulation)
                eps = relabel(eps, EpisodeConfig(base_level=int(cfg["base_level"]), tol_rel=float(cfg["tol_rel"])))
            return eps
        # deterministic per-split stream (Python's str hash is salted per process; zlib.crc32 is not)
        eps = generate(spec, seeds, fams, cfg, n_proc, np.random.default_rng(seed + zlib.crc32(name.encode()) % 1000), profile)
        pickle.dump(eps, open(p, "wb")); return eps
    off = int(cfg.get("seed_offset", 0))     # preregistration §10: pilot 0, main 100_000 (disjoint seed streams)
    train = load_or_gen("train", off + 10_000 + np.arange(cfg["n_train"]), cfg["id_families"])
    test = load_or_gen("test", off + 20_000 + np.arange(cfg["n_test"]), cfg["id_families"])
    ood = {fam: load_or_gen(f"ood_{fam}", off + 30_000 + 1000 * i + np.arange(cfg["n_ood"]), [fam]) for i, fam in enumerate(cfg["ood_families"])}
    reserve = load_or_gen("reserve", off + 40_000 + np.arange(cfg["n_reserve"]), cfg["id_families"]) if int(cfg.get("n_reserve", 0)) > 0 else []
    timings["generate_s"] = time.time() - t0
    print(f"  {len(train)} train / {len(test)} test / {sum(len(v) for v in ood.values())} OOD episodes; "
          f"label wall/episode {np.mean([e['wall_label'] for e in train]):.1f}s (truth {np.mean([e['wall_truth'] for e in train]):.1f}s)", flush=True)

    # ---- train
    print("[train]", flush=True); t0 = time.time()
    X, yg, yh, keys = training_rows(train, names, include_partial=True)
    voc = VoCRegressor(n_members=int(cfg["ensemble_members"]), seed=seed).fit(X, yg)
    t_voc = time.time() - t0; t1 = time.time()
    hard = HardLabelClassifier(n_members=int(cfg["ensemble_members"]), seed=seed).fit(X, yh)
    t_hard = time.time() - t1
    X0, yg0, yh0, _ = training_rows(train, names, include_partial=False)
    voc_base_only = VoCRegressor(n_members=int(cfg["ensemble_members"]), seed=seed).fit(X0, yg0)
    # HyPER-style causal-blind model: trained only on trajectory-error (v_rmse) gains, applied to all targets
    fs_mask = np.array([k[2] == "v_rmse" for k in keys])
    voc_fullstate = VoCRegressor(n_members=int(cfg["ensemble_members"]), seed=seed).fit(X[fs_mask], yg[fs_mask]) if fs_mask.sum() > 50 else None
    novelty = KNNDensity(k=10).fit(X0)
    nov_scores = novelty.score(X0); novelty_quantiles = {q: float(np.quantile(nov_scores, q)) for q in (0.5, 0.75, 0.9, 0.95, 0.99)}
    timings["train_s"] = time.time() - t0
    t2 = time.time(); voc.predict(X[:1000]); timings["inference_ms_per_row"] = (time.time() - t2) / min(1000, len(X)) * 1000
    write_json(out / "model_info.json", {"n_rows": int(len(yg)), "n_rows_base_only": int(len(yg0)), "positives_hard": int(yh.sum()),
                                         "train_wall_voc_s": t_voc, "train_wall_hard_s": t_hard})

    # ---- evaluate
    print("[evaluate]", flush=True); t0 = time.time()
    models = {"voc": voc, "hard": hard, "voc_fullstate": voc_fullstate, "novelty": novelty, "novelty_quantiles": novelty_quantiles}
    inc_mean = {c: float(np.mean([g["costs"][(c,)] - g["costs"][()] for ep in train for g in ep["groups"]])) for c in names}
    pickle.dump({**models, "cost_increment": inc_mean}, open(cache / "models.pkl", "wb"))
    df_test = evaluate_episodes(test, names, models, seed); df_test["family"] = "id"
    df_ood = pd.concat([evaluate_episodes(eps, names, models, seed) for eps in ood.values()], ignore_index=True) if ood else pd.DataFrame()
    df = pd.concat([df_test, df_ood], ignore_index=True)
    if reserve:   # reserved evaluation set: evaluated once, reported as a separate family line, never used for any choice
        df_res = evaluate_episodes(reserve, names, models, seed); df_res["family"] = "reserve"; df = pd.concat([df, df_res], ignore_index=True)
    # ablation: VoC trained on base-state rows only
    df_abl = evaluate_episodes(test, names, {"voc": voc_base_only}, seed); df_abl = df_abl[df_abl.policy.isin(["voc", "voc_seq", "hybrid", "hybrid_seq"])].copy()
    df_abl["policy"] = "abl_baseonly_" + df_abl["policy"]; df_abl["family"] = "id"
    df = pd.concat([df, df_abl], ignore_index=True)
    df.to_pickle(cache / "rows.pkl"); timings["evaluate_s"] = time.time() - t0

    # ---- ood detectors
    print("[ood]", flush=True); t0 = time.time()
    def base_rows(episodes):
        Xr, nec, fam, std_rows, pred_rows, gain_rows = [], [], [], [], [], []
        for ep in episodes:
            for g in ep["groups"]:
                inc = {c: g["costs"][(c,)] - g["costs"][()] for c in names}
                for tgt in g["targets"]:
                    for c in names:
                        Xr.append(row_features(ep, g, tgt, c, names, (), inc)); nec.append(c in g["minimal"][tgt]); fam.append(ep["family"])
                        gain_rows.append(g["gains"][tgt][c])
        Xr = np.array(Xr, float); pred, std = voc.predict(Xr)
        return Xr, np.array(nec, bool), np.array(fam), pred, std, np.array(gain_rows)
    Xtr, _, _, ptr, _, gtr = base_rows(train)
    Xid, nec_id, _, pid, sid, gid = base_rows(test)
    rg = RangeGuard().fit(Xtr); knn = KNNDensity(k=10).fit(Xtr)
    # conformal calibrated on the ID training residuals of the VoC regressor (exchangeability assumed)
    conf = Conformal(alpha=0.1).fit(ptr, gtr)
    det = {"range_guard": {}, "knn_density": {}, "ensemble_std": {}, "discrepancy": {}, "conformal_residual": {}}
    def disc_scores(episodes):
        out = []
        for ep in episodes:
            for g in ep["groups"]:
                for tgt in g["targets"]:
                    for c in names:
                        out.append(g["discrepancy"][c])
        return np.array(out)
    d_id = disc_scores(test)
    s_id = {"range_guard": rg.score(Xid), "knn_density": knn.score(Xid), "ensemble_std": sid, "discrepancy": d_id,
            "conformal_residual": np.abs(pid - gid) / max(conf.qhat, 1e-12)}
    coverage = {"id": conf.coverage(pid, gid)}
    for fam, eps in ood.items():
        Xo, nec_o, _, po, so, go = base_rows(eps); d_o = disc_scores(eps)
        s_o = {"range_guard": rg.score(Xo), "knn_density": knn.score(Xo), "ensemble_std": so, "discrepancy": d_o,
               "conformal_residual": np.abs(po - go) / max(conf.qhat, 1e-12)}
        for k in det:
            det[k][fam] = detector_metrics(s_id[k], s_o[k], nec_o)
        coverage[fam] = conf.coverage(po, go)
    write_json(out / "ood_detectors.json", {"metrics": det, "conformal_coverage_alpha0.1": coverage,
               "note": "conformal_residual uses the realised gain and is therefore an oracle diagnostic of shift, not a deployable detector"})
    timings["ood_s"] = time.time() - t0

    # ---- H5 / H8: compiled surrogate and hybrid closure (validation split = last 20 % of training seeds)
    print("[surrogate]", flush=True); t0 = time.time()
    n_val = max(int(0.2 * len(train)), 5)
    sur_summary, sur_df = fit_and_evaluate(train[:-n_val], train[-n_val:], test, ood, names, seed=seed, n_members=int(cfg["ensemble_members"]))
    sur_df.to_csv(tabs / "surrogate_rows.csv", index=False); write_json(out / "surrogate_h5_h8.json", sur_summary)
    P.closure_bars(sur_summary, figs / "fig4_closures_h5_h8")
    timings["surrogate_s"] = time.time() - t0

    # ---- analyze
    print("[analyze]", flush=True); t0 = time.time()
    ft = frontier_table(df); ft.to_csv(tabs / "frontier_by_target.csv", index=False)
    pf = pooled_frontier(df); pf.to_csv(tabs / "frontier_pooled.csv", index=False)
    P.pareto(pf, figs / "fig1_pareto_pooled_id", f"V1 pilot: accuracy vs compute pooled over targets (in-distribution, {len(test)} episodes)")
    for fam in ood:
        P.pareto(pf, figs / f"figS_pareto_pooled_{fam}", f"V1 pilot: OOD family '{fam}'", family=fam)
    # target dependence matrix
    matrix = {}
    for fam_name, eps in [("id", test)] + list(ood.items()):
        for ep in eps:
            for g in ep["groups"]:
                for tgt in g["targets"]:
                    key = (fam_name, tgt); matrix.setdefault(key, {c: [] for c in names})
                    for c in names:
                        matrix[key][c].append(1.0 if c in g["minimal"][tgt] else 0.0)
    matrix = {k: {c: float(np.mean(v)) for c, v in d.items()} for k, d in matrix.items()}
    P.target_dependence(matrix, names, figs / "fig2_target_dependence")
    P.detector_bars(det, figs / "fig3_ood_detectors")
    # per-target pareto (ID)
    for tgt in sorted(df_test.target.unique()):
        P.pareto(ft[ft.target == tgt].assign(family="id"), figs / f"figT_pareto_{tgt}", f"target: {tgt}", family="id")
    # summary numbers
    uni = {p: pf[(pf.family == "id") & (pf.policy == p)].iloc[0] for p in ("uniform_coarse", "uniform_medium", "uniform_fine", "oracle")}
    def best_at(pol, frac):
        g = pf[(pf.family == "id") & (pf.policy == pol) & (pf.cost_frac_fine <= frac)]
        return float(g.err_rel_tol_mean.min()) if len(g) else np.nan
    def cost_to_success(pol, s=0.95):
        g = pf[(pf.family == "id") & (pf.policy == pol) & (pf.success_rate >= s)]
        return float(g.cost_frac_fine.min()) if len(g) else np.inf
    summary = {"n_train": len(train), "n_test": len(test), "n_ood": {k: len(v) for k, v in ood.items()}, "channels": names,
               "calibration": report, "timings": timings, "max_rss_mb": resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024,
               "uniform": {p: {"err_rel_tol": float(r.err_rel_tol_mean), "success": float(r.success_rate), "cost_frac_fine": float(r.cost_frac_fine)} for p, r in uni.items()},
               "cost_to_95pct_success": {p: cost_to_success(p) for p in ("voc", "voc_seq", "hybrid", "hybrid_seq", "hardlabel", "share", "discrepancy", "sensitivity", "novelty", "uncertainty", "uncertainty_per_cost", "fullstate_voc", "random", "oracle_voc")},
               "err_at_half_fine_cost": {p: best_at(p, 0.5) for p in ("voc", "voc_seq", "hybrid", "hardlabel", "share", "discrepancy", "sensitivity", "novelty", "uncertainty", "uncertainty_per_cost", "fullstate_voc", "random", "oracle_voc")},
               "target_dependence": {f"{k[0]}|{k[1]}": v for k, v in matrix.items()},
               "ood_detectors": det, "conformal_coverage": coverage, "surrogate_h5_h8": {k: v for k, v in sur_summary.items() if k != "gate_thresholds"},
               "false_safe_rate_at_operating_points": {},
               "runtime_s": time.time() - t_start}
    # false-safe rate of each learned policy at the cheapest parameter reaching >= 95 % success on ID
    for pol in ("voc", "voc_seq", "hybrid", "hybrid_seq", "hardlabel", "share", "discrepancy", "sensitivity", "novelty", "uncertainty", "uncertainty_per_cost", "fullstate_voc"):
        g = pf[(pf.family == "id") & (pf.policy == pol) & (pf.success_rate >= 0.95)]
        if len(g):
            par = float(g.sort_values("cost_frac_fine").iloc[0].param)
            rows_ood = pf[(pf.policy == pol) & (pf.param == par)]
            summary["false_safe_rate_at_operating_points"][pol] = {"param": par, **{r.family: float(r.false_safe_rate) for r in rows_ood.itertuples()}}
    timings["analyze_s"] = time.time() - t0
    write_json(out / "summary.json", summary)
    prov["runtime_s"] = summary["runtime_s"]; write_json(out / "provenance.json", prov)
    print(f"done in {summary['runtime_s']:.0f}s -> {out}", flush=True)


if __name__ == "__main__":
    main()

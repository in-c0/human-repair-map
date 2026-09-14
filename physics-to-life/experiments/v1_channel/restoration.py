#!/usr/bin/env python
"""H10 precursor: functional restoration on the Günay 2015 system.

A cell instance is damaged by Kf loss (A-type conductance x f, f in [0, 0.5]).  We search for the
smallest compensatory intervention on the *other* channels (density of Ks, NaT, NaP; NaT
inactivation rate) that restores the wild-type spike count and first-spike latency of the same
instance under the design protocol (I_pulse = 10 pA), using three evaluation methods for the
search's simulations:
    routed      the learned VoC router (trained by run.py) decides per candidate which channels
                to refine on top of the medium level for the two targets
    medium      never refine
    fine        always refine everything
The candidate returned by each method is then verified on fine A, fine B and a held-out
protocol (I_pulse = 20 pA).  "Restored" = both targets within tolerance on the check.
This is functional restoration on a model, never a cure; the search is deliberately simple
(random search + coordinate refinement) so that the comparison is about the simulator, not
the optimiser.
"""
from __future__ import annotations
import argparse, json, pickle, sys, time, copy
from pathlib import Path
import numpy as np
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.evaluation.provenance import collect_provenance, write_json  # noqa: E402
from physics_to_life.v1.systems.gunay2015 import gunay_cclamp  # noqa: E402
from physics_to_life.v1.systems.gunay2015_fine import gunay2015_hierarchy, load_params  # noqa: E402
from physics_to_life.v1.systems import gunay2015_profile as GP  # noqa: E402
from physics_to_life.v1.membrane import simulate, Intervention, SimSettings  # noqa: E402
from physics_to_life.v1.episodes import sample_instance, base_features, TargetGroup, compute_targets  # noqa: E402
from physics_to_life.v1.experiment import row_features  # noqa: E402
from physics_to_life.v1.routing import set_schema  # noqa: E402

TARGETS = ["spike_count", "spike_latency"]
TOL_ABS = {"spike_count": 0.5, "spike_latency": 0.5}
TOL_REL = 0.05
SEARCH_KEYS = [("g", "Ks"), ("g", "NaT"), ("g", "NaP"), ("rate", "nat_inactivation")]
LOG_RANGE = np.log(3.0)


def merge(damage: Intervention, x: np.ndarray) -> Intervention:
    iv = copy.deepcopy(damage); iv.g_scales = dict(iv.g_scales); iv.rate_scales = dict(iv.rate_scales)
    for (kind, key), v in zip(SEARCH_KEYS, x):
        f = float(np.exp(v))
        if kind == "g":
            iv.g_scales[key] = iv.g_scales.get(key, 1.0) * f
        else:
            iv.rate_scales[key] = iv.rate_scales.get(key, 1.0) * f
    iv.name = "restore"; return iv


def evaluate(spec, inst, iv, protocol, method, models, names, settings, voc_lambda):
    """Targets under one method; returns (targets, cost, levels used)."""
    grp = TargetGroup("cclamp", protocol, (10.0, 510.0), TARGETS)
    if method == "fine":
        r = simulate(inst, protocol, {n: 2 for n in names}, iv, settings); return compute_targets(r, grp), r["cost"], tuple(names)
    base = simulate(inst, protocol, {n: 1 for n in names}, iv, settings); cost = base["cost"]
    if method == "medium":
        return compute_targets(base, grp), cost, ()
    # routed: one-shot VoC decision for the union of the two targets
    f = base_features(base, grp, names)
    g = {"features_by_subset": {(): f}, "name": "cclamp", "cost_base": base["cost"], "targets": TARGETS}
    ep = {"interv": iv}
    inc = models["cost_increment"]
    S = set()
    for tgt in TARGETS:
        X = np.array([row_features(ep, g, tgt, c, names, (), inc) for c in names])
        pred, _ = models["voc"].predict(X)
        for c, p in zip(names, pred):
            if p / inc[c] > voc_lambda:
                S.add(c)
    if not S:
        return compute_targets(base, grp), cost, ()
    fid = {n: (2 if n in S else 1) for n in names}
    r = simulate(inst, protocol, fid, iv, settings); cost += r["cost"]
    return compute_targets(r, grp), cost, tuple(sorted(S, key=names.index))


def objective(y, y_wt, x):
    err = 0.0
    for t in TARGETS:
        tol = max(TOL_REL * abs(y_wt[t]), TOL_ABS[t]); err += abs(y[t] - y_wt[t]) / tol
    return err + 0.05 * float(np.abs(x).sum())          # minimal-intervention penalty


def within(y, y_wt):
    return all(abs(y[t] - y_wt[t]) <= max(TOL_REL * abs(y_wt[t]), TOL_ABS[t]) for t in TARGETS)


def search(spec, inst, damage, y_wt, protocol, method, models, names, settings, rng, n_random=24, n_local=16, voc_lambda=1e-6):
    best_x, best_f, cost, n_eval = None, np.inf, 0.0, 0
    cands = [np.zeros(len(SEARCH_KEYS))] + [rng.uniform(-LOG_RANGE, LOG_RANGE, size=len(SEARCH_KEYS)) for _ in range(n_random - 1)]
    for x in cands:
        y, c, _ = evaluate(spec, inst, merge(damage, x), protocol, method, models, names, settings, voc_lambda); cost += c; n_eval += 1
        f = objective(y, y_wt, x)
        if f < best_f:
            best_x, best_f = x, f
    step = 0.4
    for it in range(n_local):
        k = it % len(SEARCH_KEYS); improved = False
        for sgn in (+1, -1):
            x = best_x.copy(); x[k] = np.clip(x[k] + sgn * step, -LOG_RANGE, LOG_RANGE)
            y, c, _ = evaluate(spec, inst, merge(damage, x), protocol, method, models, names, settings, voc_lambda); cost += c; n_eval += 1
            f = objective(y, y_wt, x)
            if f < best_f:
                best_x, best_f, improved = x, f, True
        if not improved and k == len(SEARCH_KEYS) - 1:
            step *= 0.5
    return best_x, best_f, cost, n_eval


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-dir", required=True, help="a finished run.py output directory (models + config)")
    ap.add_argument("--n-instances", type=int, default=12)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--out", default=None)
    args = ap.parse_args()
    run_dir = Path(args.run_dir); out = Path(args.out) if args.out else run_dir / "restoration"; out.mkdir(parents=True, exist_ok=True)
    import yaml
    cfg = yaml.safe_load(open(run_dir / "config.yaml"))
    params = load_params(HERE / cfg.get("hierarchy_params", "hierarchy/gunay2015_fine.json"))
    specA = gunay2015_hierarchy(params, q10=float(cfg.get("q10", 3.0)), level="A")
    specB = gunay2015_hierarchy(params, q10=float(cfg.get("q10", 3.0)), level="B")
    names = [c.name for c in specA.channels]
    set_schema(GP.GROUP_NAMES, GP.RATE_KEYS)
    models = pickle.load(open(run_dir / "cache" / "models.pkl", "rb"))
    settings = SimSettings()
    rng = np.random.default_rng(args.seed)
    design = gunay_cclamp(10.0); heldout = gunay_cclamp(20.0)
    grp_d = TargetGroup("cclamp", design, (10.0, 510.0), TARGETS); grp_h = TargetGroup("cclamp", heldout, (10.0, 510.0), TARGETS)
    results = []
    t_start = time.time()
    for i in range(args.n_instances):
        inst_seed = 50_000 + i
        instA = sample_instance(specA, np.random.default_rng(inst_seed), g_cv=float(cfg["instance_g_cv"]), rate_cv=float(cfg["instance_rate_cv"]))
        # the same instance under formulation B: same conductance/kinetic multipliers (deterministic draw)
        instB = sample_instance(specB, np.random.default_rng(inst_seed), g_cv=float(cfg["instance_g_cv"]), rate_cv=float(cfg["instance_rate_cv"]))
        f_loss = float(rng.uniform(0.0, 0.5))
        damage = Intervention(f"kf_loss:{f_loss:.2f}", g_scales={"Kf": f_loss}, family="kf_loss")
        wt = simulate(instA, design, {n: 2 for n in names}, Intervention(), settings); y_wt = compute_targets(wt, grp_d)
        wt_h = simulate(instA, heldout, {n: 2 for n in names}, Intervention(), settings); y_wt_h = compute_targets(wt_h, grp_h)
        dmg = simulate(instA, design, {n: 2 for n in names}, damage, settings); y_dmg = compute_targets(dmg, grp_d)
        rec = {"instance": i, "kf_loss": f_loss, "y_wt": y_wt, "y_damaged": y_dmg, "damaged_within_tol": within(y_dmg, y_wt), "methods": {}}
        for method in ("routed", "medium", "fine"):
            t0 = time.time()
            x, fbest, cost, n_eval = search(specA, instA, damage, y_wt, design, method, models, names, settings, np.random.default_rng(args.seed + 7 * i))
            iv = merge(damage, x)
            yA = compute_targets(simulate(instA, design, {n: 2 for n in names}, iv, settings), grp_d)
            yB = compute_targets(simulate(instB, design, {n: 2 for n in names}, iv, settings), grp_d)
            yH = compute_targets(simulate(instA, heldout, {n: 2 for n in names}, iv, settings), grp_h)
            rec["methods"][method] = {"x_log": [float(v) for v in x], "objective": float(fbest), "search_cost": float(cost), "n_eval": n_eval,
                                      "wall_s": time.time() - t0, "restored_fineA": within(yA, y_wt), "restored_fineB": within(yB, y_wt),
                                      "restored_heldout": within(yH, y_wt_h), "y_fineA": yA, "y_fineB": yB, "y_heldout": yH}
            print(f"inst {i} loss {f_loss:.2f} {method:7s}: obj {fbest:.2f} cost {cost:.0f} evals {n_eval} restoredA {within(yA, y_wt)} B {within(yB, y_wt)} heldout {within(yH, y_wt_h)}", flush=True)
        results.append(rec)
    summ = {"n_instances": len(results), "damaged_within_tol_rate": float(np.mean([r["damaged_within_tol"] for r in results]))}
    for method in ("routed", "medium", "fine"):
        summ[method] = {k: float(np.mean([r["methods"][method][k] for r in results])) for k in ("restored_fineA", "restored_fineB", "restored_heldout", "search_cost", "n_eval", "wall_s")}
    summ["routed_cost_over_fine"] = summ["routed"]["search_cost"] / max(summ["fine"]["search_cost"], 1e-9)
    summ["runtime_s"] = time.time() - t_start
    write_json(out / "summary.json", summ); write_json(out / "instances.json", results)
    write_json(out / "provenance.json", collect_provenance({"script": "restoration.py", "run_dir": str(run_dir)}, args.seed))
    print(json.dumps(summ, indent=1))


if __name__ == "__main__":
    main()

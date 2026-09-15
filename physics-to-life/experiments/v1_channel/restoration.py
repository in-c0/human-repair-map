#!/usr/bin/env python
"""H10 precursor: functional restoration on the Günay 2015 system.

A cell instance is damaged by a loss-of-function intervention on one channel population, and we
search for the smallest compensatory intervention on the *other* channels that restores the
wild-type spike count and first-spike latency of the same instance under the design protocol
(I_pulse = 10 pA), using three evaluation methods for the search's simulations:
    routed      the learned VoC router (trained by run.py) decides per candidate which channels
                to refine on top of the medium level for the two targets (one-shot; threshold =
                the preregistered principal operating point of verdicts.json when present)
    medium      never refine
    fine        always refine everything
The candidate returned by each method is then verified on fine A, fine B (against B's own wild
type) and a held-out protocol (I_pulse = 20 pA).  "Restored" = both targets within tolerance.

Damage variants (--damage):
    kf_loss     preregistered (v1.1): A-type (Kf) conductance x f, f ~ U(0, 0.5); compensation over
                Ks, NaT, NaP density and the NaT inactivation rate.  NOTE: in the published model a
                complete Kf removal leaves the 10 pA response unchanged (authors' Euler integrator:
                45 spikes, first spike 23.20 ms with and without Kf), so this damage is expected to
                be functionally inert; the summary reports how many instances were *functionally*
                damaged (damaged phenotype outside tolerance) and H10 is evaluated over those.
    nat_loss    post-hoc exploratory variant (preregistration §16): NaT conductance x f,
                f ~ U(0.75, 0.95) (para-hypomorph-like reduced excitability; x0.7 already silences most
                instances at 10 pA); compensation over Ks,
                Kf, NaP density and the NaT inactivation rate (not NaT density: restoring the lost
                expression is the trivial fix).
Validity filters (both variants, decided before any main-run restoration was run): instances whose
wild type fires < --min-wt-spikes at the design protocol are skipped (nothing to restore); the
restored fractions are reported over functionally damaged instances, with raw fractions alongside.
This is functional restoration on a model, never a cure; the search is deliberately simple
(random search + coordinate refinement) so that the comparison is about the simulator, not the
optimiser.  Instances are independent and run in parallel (--n-proc).
"""
from __future__ import annotations
import argparse, json, pickle, sys, time, copy
import multiprocessing as mp
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
LOG_RANGE = np.log(3.0)
DAMAGES = {
    "kf_loss": {"channel": "Kf", "f_range": (0.0, 0.5), "status": "preregistered (v1.1)",
                "search_keys": [("g", "Ks"), ("g", "NaT"), ("g", "NaP"), ("rate", "nat_inactivation")]},
    "nat_loss": {"channel": "NaT", "f_range": (0.75, 0.95), "status": "post-hoc exploratory (preregistration §16)",
                 "search_keys": [("g", "Ks"), ("g", "Kf"), ("g", "NaP"), ("rate", "nat_inactivation")]},
}


def merge(damage: Intervention, x: np.ndarray, search_keys) -> Intervention:
    iv = copy.deepcopy(damage); iv.g_scales = dict(iv.g_scales); iv.rate_scales = dict(iv.rate_scales)
    for (kind, key), v in zip(search_keys, x):
        f = float(np.exp(v))
        if kind == "g":
            iv.g_scales[key] = iv.g_scales.get(key, 1.0) * f
        else:
            iv.rate_scales[key] = iv.rate_scales.get(key, 1.0) * f
    iv.name = "restore"; return iv


def evaluate(spec, inst, iv, protocol, method, models, names, settings, voc_lambda, tol_map=None):
    """Targets under one method; returns (targets, cost, levels used)."""
    grp = TargetGroup("cclamp", protocol, (10.0, 510.0), TARGETS)
    tol_map = tol_map or {t: TOL_REL for t in TARGETS}
    if method == "fine":
        r = simulate(inst, protocol, {n: 2 for n in names}, iv, settings); return compute_targets(r, grp), r["cost"], tuple(names)
    base = simulate(inst, protocol, {n: 1 for n in names}, iv, settings); cost = base["cost"]
    if method == "medium":
        return compute_targets(base, grp), cost, ()
    # routed: one-shot VoC decision for the union of the two targets
    f = base_features(base, grp, names)
    g = {"features_by_subset": {(): f}, "name": "cclamp", "cost_base": base["cost"], "targets": TARGETS, "tol": tol_map}
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


def search(spec, inst, damage, y_wt, protocol, method, models, names, settings, rng, search_keys, n_random=24, n_local=16, voc_lambda=1e-6):
    """Random search + coordinate refinement.  Returns (x, f, cost, n_eval, y_claimed): y_claimed is the
    method's own evaluation of the returned candidate (what the searcher believes it achieved)."""
    best_x, best_f, best_y, cost, n_eval = None, np.inf, None, 0.0, 0
    # tolerance in target-scale units (as the router sees it): relative 5 % with the absolute floors
    tol_map = {t: max(TOL_REL, TOL_ABS[t] / max(abs(y_wt[t]), 1e-9)) for t in TARGETS}
    cands = [np.zeros(len(search_keys))] + [rng.uniform(-LOG_RANGE, LOG_RANGE, size=len(search_keys)) for _ in range(n_random - 1)]
    for x in cands:
        y, c, _ = evaluate(spec, inst, merge(damage, x, search_keys), protocol, method, models, names, settings, voc_lambda, tol_map); cost += c; n_eval += 1
        f = objective(y, y_wt, x)
        if f < best_f:
            best_x, best_f, best_y = x, f, y
    step = 0.4
    for it in range(n_local):
        k = it % len(search_keys); improved = False
        for sgn in (+1, -1):
            x = best_x.copy(); x[k] = np.clip(x[k] + sgn * step, -LOG_RANGE, LOG_RANGE)
            y, c, _ = evaluate(spec, inst, merge(damage, x, search_keys), protocol, method, models, names, settings, voc_lambda, tol_map); cost += c; n_eval += 1
            f = objective(y, y_wt, x)
            if f < best_f:
                best_x, best_f, best_y, improved = x, f, y, True
        if not improved and k == len(search_keys) - 1:
            step *= 0.5
    return best_x, best_f, cost, n_eval, best_y


# ---------------------------------------------------------------------------- per-instance worker
_G = {}


def _init(run_dir: str, damage_name: str, voc_lambda: float, n_random: int, n_local: int, min_wt_spikes: int, seed: int):
    import yaml
    run_dir = Path(run_dir); cfg = yaml.safe_load(open(run_dir / "config.yaml"))
    params = load_params(HERE / cfg.get("hierarchy_params", "hierarchy/gunay2015_fine.json"))
    _G["specA"] = gunay2015_hierarchy(params, q10=float(cfg.get("q10", 3.0)), level="A")
    _G["specB"] = gunay2015_hierarchy(params, q10=float(cfg.get("q10", 3.0)), level="B")
    _G["names"] = [c.name for c in _G["specA"].channels]
    set_schema(GP.GROUP_NAMES, GP.RATE_KEYS)
    _G["models"] = pickle.load(open(run_dir / "cache" / "models.pkl", "rb"))
    _G.update(cfg=cfg, damage=DAMAGES[damage_name], damage_name=damage_name, voc_lambda=voc_lambda, n_random=n_random, n_local=n_local,
              min_wt_spikes=min_wt_spikes, seed=seed, settings=SimSettings())


def _one_instance(i: int) -> dict:
    specA, specB, names, models, cfg, D = _G["specA"], _G["specB"], _G["names"], _G["models"], _G["cfg"], _G["damage"]
    settings, seed = _G["settings"], _G["seed"]
    inst_seed = 50_000 + i
    instA = sample_instance(specA, np.random.default_rng(inst_seed), g_cv=float(cfg["instance_g_cv"]), rate_cv=float(cfg["instance_rate_cv"]))
    # the same instance under formulation B: same conductance/kinetic multipliers (deterministic draw)
    instB = sample_instance(specB, np.random.default_rng(inst_seed), g_cv=float(cfg["instance_g_cv"]), rate_cv=float(cfg["instance_rate_cv"]))
    rng = np.random.default_rng(seed + 1000 * i + 17)
    f_loss = float(rng.uniform(*D["f_range"]))
    damage = Intervention(f"{_G['damage_name']}:{f_loss:.2f}", g_scales={D["channel"]: f_loss}, family=_G["damage_name"])
    design = gunay_cclamp(10.0); heldout = gunay_cclamp(20.0)
    grp_d = TargetGroup("cclamp", design, (10.0, 510.0), TARGETS); grp_h = TargetGroup("cclamp", heldout, (10.0, 510.0), TARGETS)
    wt = simulate(instA, design, {n: 2 for n in names}, Intervention(), settings); y_wt = compute_targets(wt, grp_d)
    rec = {"instance": i, "damage": _G["damage_name"], "loss_factor": f_loss, "kf_loss": f_loss if D["channel"] == "Kf" else None,
           "y_wt": y_wt, "wt_spikes": float(y_wt["spike_count"]), "skipped_silent": bool(y_wt["spike_count"] < _G["min_wt_spikes"]), "methods": {}}
    if rec["skipped_silent"]:
        print(f"inst {i} loss {f_loss:.2f}: wild type fires {y_wt['spike_count']:.0f} spikes at the design protocol -> skipped", flush=True)
        return rec
    wt_h = simulate(instA, heldout, {n: 2 for n in names}, Intervention(), settings); y_wt_h = compute_targets(wt_h, grp_h)
    # the level-B check compares against level B's own wild type (the formulations differ at baseline)
    wt_B = simulate(instB, design, {n: 2 for n in names}, Intervention(), settings); y_wt_B = compute_targets(wt_B, grp_d)
    dmg = simulate(instA, design, {n: 2 for n in names}, damage, settings); y_dmg = compute_targets(dmg, grp_d)
    rec.update(y_wt_B=y_wt_B, y_damaged=y_dmg, damaged_within_tol=within(y_dmg, y_wt), functionally_damaged=not within(y_dmg, y_wt))
    if not rec["functionally_damaged"]:
        print(f"inst {i} loss {f_loss:.2f}: damaged phenotype within tolerance (n {y_wt['spike_count']:.0f}->{y_dmg['spike_count']:.0f}, "
              f"latency {y_wt['spike_latency']:.1f}->{y_dmg['spike_latency']:.1f} ms) -> nothing to restore; search skipped", flush=True)
        return rec
    for method in ("routed", "medium", "fine"):
        t0 = time.time()
        x, fbest, cost, n_eval, y_claimed = search(specA, instA, damage, y_wt, design, method, models, names, settings,
                                                   np.random.default_rng(seed + 7 * i), D["search_keys"], _G["n_random"], _G["n_local"], _G["voc_lambda"])
        iv = merge(damage, x, D["search_keys"])
        yA = compute_targets(simulate(instA, design, {n: 2 for n in names}, iv, settings), grp_d)
        yB = compute_targets(simulate(instB, design, {n: 2 for n in names}, iv, settings), grp_d)
        yH = compute_targets(simulate(instA, heldout, {n: 2 for n in names}, iv, settings), grp_h)
        rec["methods"][method] = {"x_log": [float(v) for v in x], "objective": float(fbest), "search_cost": float(cost), "n_eval": n_eval,
                                  "wall_s": time.time() - t0, "claimed_restored": within(y_claimed, y_wt),
                                  "restored_fineA": within(yA, y_wt), "restored_fineB": within(yB, y_wt_B), "restored_heldout": within(yH, y_wt_h),
                                  "restored_all_three": within(yA, y_wt) and within(yB, y_wt_B) and within(yH, y_wt_h),
                                  "y_claimed": y_claimed, "y_fineA": yA, "y_fineB": yB, "y_heldout": yH}
        print(f"inst {i} loss {f_loss:.2f} dmg-out-of-tol {rec['functionally_damaged']} {method:7s}: obj {fbest:.2f} cost {cost:.0f} evals {n_eval} "
              f"claimed {within(y_claimed, y_wt)} restoredA {within(yA, y_wt)} B {within(yB, y_wt_B)} heldout {within(yH, y_wt_h)}", flush=True)
    return rec


def principal_lambda(run_dir: Path, principal: float = 0.30):
    """The one-shot VoC router's parameter at the preregistered principal operating point (verdicts.json)."""
    p = run_dir / "verdicts.json"
    if not p.exists():
        return None
    v = json.load(open(p))
    ops = v.get("conditions", {}).get("one_shot", {}).get("voc", {}).get("operating_points", {})
    if not ops:
        return None
    key = min(ops, key=lambda k: abs(float(k) - principal))
    return float(ops[key]["param"])


def summarise(results: list[dict]) -> dict:
    keys = ("claimed_restored", "restored_fineA", "restored_fineB", "restored_heldout", "restored_all_three", "search_cost", "n_eval", "wall_s")
    evaluated = [r for r in results if not r.get("skipped_silent")]
    func = [r for r in evaluated if r.get("functionally_damaged") and r.get("methods")]
    summ = {"n_instances": len(results), "n_skipped_silent_wt": len(results) - len(evaluated), "n_evaluated": len(evaluated),
            "n_functionally_damaged": len(func), "damaged_within_tol_rate": float(np.mean([r["damaged_within_tol"] for r in evaluated])) if evaluated else np.nan}
    for label, subset in (("functionally_damaged", func), ("all_evaluated", [r for r in evaluated if r.get("methods")])):
        block = {}
        for method in ("routed", "medium", "fine"):
            block[method] = {k: (float(np.mean([r["methods"][method][k] for r in subset])) if subset else np.nan) for k in keys}
            # routed candidates that the routed simulator believed restored but fine A rejects (H10 falsification clause)
            claimed = [r for r in subset if r["methods"][method]["claimed_restored"]]
            block[method]["claimed_but_fails_fineA_rate"] = float(np.mean([not r["methods"][method]["restored_fineA"] for r in claimed])) if claimed else np.nan
            block[method]["n_claimed"] = len(claimed)
        block["routed_cost_over_fine"] = (block["routed"]["search_cost"] / block["fine"]["search_cost"]) if subset and block["fine"]["search_cost"] else np.nan
        summ[label] = block
    # backwards-compatible top-level fields (over functionally damaged instances)
    for method in ("routed", "medium", "fine"):
        summ[method] = summ["functionally_damaged"][method]
    summ["routed_cost_over_fine"] = summ["functionally_damaged"]["routed_cost_over_fine"]
    return summ


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-dir", required=True, help="a finished run.py output directory (models + config)")
    ap.add_argument("--damage", choices=sorted(DAMAGES), default="kf_loss")
    ap.add_argument("--n-instances", type=int, default=12)
    ap.add_argument("--n-proc", type=int, default=1)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--voc-lambda", type=float, default=None, help="one-shot VoC threshold; default: the principal operating point of verdicts.json, else 1e-6")
    ap.add_argument("--n-random", type=int, default=24); ap.add_argument("--n-local", type=int, default=16)
    ap.add_argument("--min-wt-spikes", type=int, default=3)
    ap.add_argument("--out", default=None)
    args = ap.parse_args()
    run_dir = Path(args.run_dir)
    out = Path(args.out) if args.out else run_dir / ("restoration" if args.damage == "kf_loss" else f"restoration_{args.damage}")
    out.mkdir(parents=True, exist_ok=True)
    lam = args.voc_lambda if args.voc_lambda is not None else principal_lambda(run_dir)
    lam_source = "argument" if args.voc_lambda is not None else ("verdicts.json principal operating point" if lam is not None else "fallback 1e-6")
    lam = 1e-6 if lam is None else lam
    print(f"damage {args.damage} ({DAMAGES[args.damage]['status']}); routed threshold {lam:.3g} ({lam_source}); {args.n_instances} instances on {args.n_proc} processes", flush=True)
    t_start = time.time()
    init_args = (str(run_dir), args.damage, lam, args.n_random, args.n_local, args.min_wt_spikes, args.seed)
    if args.n_proc <= 1:
        _init(*init_args); results = [_one_instance(i) for i in range(args.n_instances)]
    else:
        with mp.get_context("spawn").Pool(args.n_proc, initializer=_init, initargs=init_args) as pool:
            results = pool.map(_one_instance, range(args.n_instances), chunksize=1)
    summ = summarise(results)
    summ.update(damage=args.damage, damage_status=DAMAGES[args.damage]["status"], damage_channel=DAMAGES[args.damage]["channel"],
                loss_factor_range=list(DAMAGES[args.damage]["f_range"]), search_keys=[list(k) for k in DAMAGES[args.damage]["search_keys"]],
                voc_lambda=lam, voc_lambda_source=lam_source, n_random=args.n_random, n_local=args.n_local, min_wt_spikes=args.min_wt_spikes,
                runtime_s=time.time() - t_start)
    write_json(out / "summary.json", summ); write_json(out / "instances.json", results)
    write_json(out / "provenance.json", collect_provenance({"script": "restoration.py", "run_dir": str(run_dir), "damage": args.damage}, args.seed))
    print(json.dumps({k: v for k, v in summ.items() if k not in ("functionally_damaged", "all_evaluated")}, indent=1))


if __name__ == "__main__":
    main()

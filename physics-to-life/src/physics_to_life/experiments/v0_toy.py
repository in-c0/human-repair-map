"""V0 experiment: episode generation, hidden-ground-truth labelling, and condition runs.

An *episode* is (system, intervention).  Labelling computes the reference solution and
the minimal refinement set (the smallest set of fine nodes whose mixed simulation matches
the reference within tol_ref), which is what a perfect router would choose.  Selection
correctness of every policy is scored against that set.
"""
from __future__ import annotations

import itertools
import time
from dataclasses import dataclass, field
import multiprocessing as mp
from typing import Optional

import numpy as np

from ..state.system import SystemSpec, Intervention, make_system, make_intervention, ancestors_of
from ..models.simulators import SimConfig, simulate_mixed, simulate_reference, flips_from_traj
from ..routing.features import node_features
from ..routing.policies import (SimCache, run_uniform, run_random, run_spatial_heuristic, run_physics_heuristic,
                                run_adjoint_heuristic, run_learned, run_oracle, run_oracle_flips, _fid)
from ..constraints.invariants import check_trajectory


FAMILIES = {
    # name: (system kwargs, intervention kwargs)
    "id":        (dict(), dict(kind="pulse")),
    "amp_high":  (dict(), dict(kind="pulse", amp_range=(3.0, 5.0))),
    "multi2":    (dict(), dict(kind="multi", n_nodes=2)),
    "step":      (dict(), dict(kind="step")),
    "negative":  (dict(), dict(kind="negative")),
    "K20":       (dict(K=20), dict(kind="pulse")),
    "sigmoid":   (dict(fast_model="sigmoid", eps=0.03), dict(kind="pulse")),
    "noisy":     (dict(noise=0.15), dict(kind="pulse")),
    "sigma0":    (dict(sigma_theta=0.0), dict(kind="pulse")),
    "sigma06":   (dict(sigma_theta=0.6), dict(kind="pulse")),
}


def make_episode(seed: int, family: str = "id", cfg: Optional[SimConfig] = None, base: int = 1,
                 tol_ref: float = 0.01, max_exhaustive: int = 5, with_gains: bool = False) -> dict:
    cfg = cfg or SimConfig()
    sys_kw, int_kw = FAMILIES[family]
    rng = np.random.default_rng(seed)
    spec = make_system(rng, family=family, seed=seed, **sys_kw)
    interv = make_intervention(rng, spec, horizon=cfg.horizon, **int_kw)
    K = spec.K
    t0 = time.perf_counter()
    sim_rng = np.random.default_rng(seed + 10_000)
    ref = simulate_reference(spec, interv, cfg) if spec.noise == 0 else None
    sim = SimCache(spec, interv, cfg, rng=sim_rng)
    fine = sim.run(np.full(K, 2))
    if ref is None:
        # stochastic family: the reference is the fine sub-cycled SDE integration itself
        ref = {"target": fine["target"], "x": fine["x"], "y": fine["y"], "wall": fine["wall"]}
    Y_ref = ref["target"]
    flips = flips_from_traj(ref["y"])
    inv = check_trajectory(spec, interv, ref["x"], ref["y"])
    med = sim.run(np.full(K, 1)); coarse = sim.run(np.full(K, 0))
    # candidate set for minimal-set search: switchers that can reach the readout
    anc = ancestors_of(spec.W, spec.readout)
    cand = [k for k in range(K) if flips[k] and (k in anc or k == spec.readout)]
    base_run = sim.run(np.full(K, base))
    table = [((), abs(base_run["target"] - Y_ref), base_run["cost"])]
    if len(cand) <= max_exhaustive:
        for m in range(1, len(cand) + 1):
            for S in itertools.combinations(cand, m):
                r = sim.run(_fid(K, base, S))
                table.append((tuple(S), abs(r["target"] - Y_ref), r["cost"]))
    else:  # greedy forward selection
        S = []
        remaining = list(cand)
        while remaining:
            best = None
            for k in remaining:
                r = sim.run(_fid(K, base, S + [k]))
                e = abs(r["target"] - Y_ref)
                if best is None or e < best[1]:
                    best = (k, e, r["cost"])
            S.append(best[0]); remaining.remove(best[0])
            table.append((tuple(S), best[1], best[2]))
    ok = [row for row in table if row[1] <= tol_ref]
    if ok:
        minimal = min(ok, key=lambda row: (row[2], row[1]))[0]; reachable = True
    else:
        minimal = min(table, key=lambda row: row[1])[0]; reachable = False
    necessary = np.zeros(K, bool)
    for k in minimal:
        necessary[k] = True
    gains = None
    if with_gains:
        e0 = abs(base_run["target"] - Y_ref)
        gains = np.zeros(K)
        for k in range(K):
            r = sim.run(_fid(K, base, [k]))
            gains[k] = e0 - abs(r["target"] - Y_ref)
    feats_base = node_features(spec, interv, base_run["x"], base_run["fidelity"])
    # states along the oracle path (for sequential training) + one random partial subset
    path_feats = []
    S = []
    for k in minimal:
        S.append(k)
        r = sim.run(_fid(K, base, S))
        path_feats.append((np.array(S), node_features(spec, interv, r["x"], r["fidelity"])))
    rnd = np.random.default_rng(seed + 1)
    m = int(rnd.integers(1, 3))
    Sr = list(rnd.choice(K, size=m, replace=False))
    r = sim.run(_fid(K, base, Sr))
    path_feats.append((np.array(Sr), node_features(spec, interv, r["x"], r["fidelity"])))
    return {
        "seed": seed, "family": family, "spec": spec, "interv": interv, "Y_ref": Y_ref,
        "Y_fine": fine["target"], "Y_med": med["target"], "Y_coarse": coarse["target"],
        "cost_fine": fine["cost"], "cost_med": med["cost"], "cost_coarse": coarse["cost"],
        "wall_fine": fine["wall"], "wall_med": med["wall"], "wall_coarse": coarse["wall"], "wall_ref": ref["wall"],
        "flips_true": flips, "candidates": cand, "subset_table": table, "necessary": necessary,
        "tol_reachable": reachable, "gains": gains, "features_base": feats_base, "path_feats": path_feats,
        "invariants": inv, "label_wall": time.perf_counter() - t0, "n_label_sims": sim.n_calls,
        "nonmonotone": any(row[1] > table[0][1] + 1e-9 for row in table if len(row[0]) == 1),
    }


def _make_episode_star(args):
    return make_episode(*args)


def generate_episodes(seeds, family="id", cfg=None, n_proc=4, **kw) -> list[dict]:
    args = [(int(s), family, cfg) for s in seeds]
    if n_proc <= 1:
        return [make_episode(*a, **kw) for a in args]
    # spawn (not fork): the parent may hold multithreaded BLAS state after model training
    with mp.get_context("spawn").Pool(n_proc) as pool:
        return pool.map(_make_episode_star, args, chunksize=4)


def build_training_set(episodes: list[dict], label: str = "necessary", include_path: bool = True):
    """Rows = (episode, node) pairs from the base state and (optionally) partial-refinement states."""
    Xs, ys, gs = [], [], []
    for ep in episodes:
        K = ep["spec"].K
        lab = ep["necessary"] if label == "necessary" else ep["flips_true"]
        Xs.append(ep["features_base"]); ys.append(lab.astype(int)); gs.append(np.full(K, ep["seed"]))
        if include_path:
            for S, F in ep["path_feats"]:
                keep = np.ones(K, bool); keep[S] = False
                Xs.append(F[keep]); ys.append(lab[keep].astype(int)); gs.append(np.full(keep.sum(), ep["seed"]))
    return np.concatenate(Xs), np.concatenate(ys), np.concatenate(gs)


# ---------------------------------------------------------------------------
# running the comparison conditions on labelled episodes
# ---------------------------------------------------------------------------

MAX_SEQ_REFINE = 6   # sequential policies refine at most half the nodes; beyond that uniform fine is cheaper
DEFAULT_TAUS = [0.02, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.97]
DEFAULT_TOLS = [0.002, 0.005, 0.01, 0.02, 0.05, 0.1]


def run_conditions(ep: dict, models: dict, cfg: SimConfig, base: int = 1, taus=None, tols=None,
                   kappa: float = 1.0, learned_variants: Optional[dict] = None, seed: int = 0) -> list[dict]:
    """Run every condition on one episode.  models: {name: EnsembleClassifier}.
    learned_variants: {name: dict(model_key, sequential, kappa)} for ablations."""
    taus = taus or DEFAULT_TAUS; tols = tols or DEFAULT_TOLS
    spec, interv = ep["spec"], ep["interv"]
    rng = np.random.default_rng(seed + 7 * ep["seed"])
    sim = SimCache(spec, interv, cfg, rng=np.random.default_rng(ep["seed"] + 10_000))
    results = []
    results += run_uniform(sim, 0) + run_uniform(sim, 1) + run_uniform(sim, 2)
    ms = sorted({m for m in (0, 1, 2, 3, 4, 6, 8, 12, spec.K) if m <= spec.K})
    results += run_random(sim, rng, base, ms=ms)
    results += run_random(sim, rng, base, ms=ms, structured=True)
    results += run_spatial_heuristic(sim, base, ms=ms)
    results += run_physics_heuristic(sim, taus, base, sequential=False)
    results += run_physics_heuristic(sim, taus, base, sequential=True)
    results += run_adjoint_heuristic(sim, taus, base, sequential=False)
    results += run_oracle(sim, ep["subset_table"], tols, base)
    results += run_oracle_flips(sim, ep["flips_true"], base)
    variants = learned_variants or {"learned": dict(model="main", sequential=False, kappa=kappa),
                                    "learned_seq": dict(model="main", sequential=True, kappa=kappa)}
    for name, v in variants.items():
        model = models[v["model"]]
        results += run_learned(sim, model, taus, base, sequential=v.get("sequential", False),
                               kappa=v.get("kappa", kappa), name=name.replace("_seq", ""),
                               max_refine=MAX_SEQ_REFINE if v.get("sequential", False) else None)
    Y_ref = ep["Y_ref"]; nec = ep["necessary"]
    rows = []
    for r in results:
        refined = r.fidelity == 2
        tp = int((refined & nec).sum()); fp = int((refined & ~nec).sum()); fn = int((~refined & nec).sum())
        rows.append({
            "seed": ep["seed"], "family": ep["family"], "policy": r.name, "param": float(r.param),
            "abs_err": abs(r.target - Y_ref), "cost": r.cost, "wall": r.wall, "n_fine": int(refined.sum()),
            "fine_node_steps": r.fine_node_steps, "n_sims": r.n_sims, "n_iter": r.n_iter,
            "tp": tp, "fp": fp, "fn": fn, "n_necessary": int(nec.sum()),
            "prob": None if r.prob is None else r.prob.copy(), "std": None if r.std is None else r.std.copy(),
            "scores": None if r.scores is None else r.scores.copy(), "fidelity": r.fidelity.copy(),
        })
    return rows


def _run_conditions_star(args):
    return run_conditions(*args)


def run_conditions_many(episodes, models, cfg, n_proc=4, **kw):
    args = [(ep, models, cfg) for ep in episodes]
    if n_proc <= 1:
        return [row for a in args for row in run_conditions(*a, **kw)]
    with mp.get_context("spawn").Pool(n_proc) as pool:
        out = pool.starmap(_run_conditions_kw, [(a, kw) for a in args], chunksize=2)
    return [row for rows in out for row in rows]


def _run_conditions_kw(a, kw):
    return run_conditions(*a, **kw)

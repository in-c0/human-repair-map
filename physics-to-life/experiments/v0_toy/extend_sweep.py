#!/usr/bin/env python
"""Post-hoc extension of the threshold sweep for the score-based policies.

The pre-registered tau grid started at 0.02; the learned router's scores are confidently
near zero for most nodes, so its frontier was truncated well below uniform-fine cost. This
script re-runs learned / learned_seq / physics / physics_seq with the same code and models
on the cached episodes with an extended grid (adding 0.0003, 0.001, 0.003, 0.005, 0.01) and
writes rows_<set>_ext.pkl; run.py merges these rows (replacing the four policies' rows) at
analysis time. Recorded as a post-hoc grid extension in the research log."""
from __future__ import annotations
import argparse, os, pickle, sys, time
from pathlib import Path
for _v in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS"):
    os.environ.setdefault(_v, "1")
import multiprocessing as mp
import numpy as np
import yaml

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.models.simulators import SimConfig  # noqa: E402
from physics_to_life.routing.policies import SimCache, run_physics_heuristic, run_learned  # noqa: E402
from physics_to_life.experiments.v0_toy import MAX_SEQ_REFINE  # noqa: E402

EXTRA_TAUS = [0.0003, 0.001, 0.003, 0.005, 0.01]


def _rows(ep, results, Y_ref, nec):
    out = []
    for r in results:
        refined = r.fidelity == 2
        tp = int((refined & nec).sum()); fp = int((refined & ~nec).sum()); fn = int((~refined & nec).sum())
        out.append({"seed": ep["seed"], "family": ep["family"], "policy": r.name, "param": float(r.param),
                    "abs_err": abs(r.target - Y_ref), "cost": r.cost, "wall": r.wall, "n_fine": int(refined.sum()),
                    "fine_node_steps": r.fine_node_steps, "n_sims": r.n_sims, "n_iter": r.n_iter,
                    "tp": tp, "fp": fp, "fn": fn, "n_necessary": int(nec.sum()),
                    "prob": None if r.prob is None else r.prob.copy(), "std": None if r.std is None else r.std.copy(),
                    "scores": None if r.scores is None else r.scores.copy(), "fidelity": r.fidelity.copy()})
    return out


def one(args):
    ep, model, cfg, base, taus, kappa = args
    sim = SimCache(ep["spec"], ep["interv"], cfg, rng=np.random.default_rng(ep["seed"] + 10_000))
    res = []
    res += run_physics_heuristic(sim, taus, base, sequential=False)
    res += run_physics_heuristic(sim, taus, base, sequential=True, max_refine=MAX_SEQ_REFINE)
    res += run_learned(sim, model, taus, base, sequential=False, kappa=kappa, name="learned")
    res += run_learned(sim, model, taus, base, sequential=True, kappa=kappa, name="learned", max_refine=MAX_SEQ_REFINE)
    return _rows(ep, res, ep["Y_ref"], ep["necessary"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-id", default="v0_main")
    ap.add_argument("--sets", default="test", help="comma list: test, ood_<family>, ...")
    ap.add_argument("--n-proc", type=int, default=4)
    args = ap.parse_args()
    out_dir = HERE / "results" / args.run_id
    cfg = yaml.safe_load(open(out_dir / "config.yaml"))
    cache = out_dir / "cache"
    models = pickle.load(open(cache / "models.pkl", "rb"))
    sim_cfg = SimConfig(**cfg["sim"])
    taus = sorted(set(cfg["taus"]) | set(EXTRA_TAUS))
    for name in args.sets.split(","):
        eps = pickle.load(open(next(cache.glob(f"{name}_*.pkl")), "rb"))
        t0 = time.time()
        jobs = [(ep, models["main"], sim_cfg, int(cfg["base_level"]), taus, float(cfg["kappa"])) for ep in eps]
        with mp.get_context("spawn").Pool(args.n_proc) as pool:
            out = pool.map(one, jobs, chunksize=2)
        rows = [r for rr in out for r in rr]
        pickle.dump(rows, open(cache / f"rows_{name}_ext.pkl", "wb"))
        print(f"{name}: {len(eps)} episodes, {len(rows)} rows in {time.time()-t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()

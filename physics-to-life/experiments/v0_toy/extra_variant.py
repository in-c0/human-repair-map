#!/usr/bin/env python
"""Train an extra learned-router variant on the cached training episodes and evaluate it
(one-shot + sequential) on the cached test episodes. Writes rows_test_ext_<name>.pkl, which
run.py merges at analysis time (policy names abl_<name> / abl_<name>_seq)."""
from __future__ import annotations
import argparse, json, os, pickle, sys, time
from pathlib import Path
for _v in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS"):
    os.environ.setdefault(_v, "1")
import multiprocessing as mp
import numpy as np
import yaml

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
sys.path.insert(0, str(HERE))
from physics_to_life.models.simulators import SimConfig  # noqa: E402
from physics_to_life.routing.policies import SimCache, run_learned  # noqa: E402
from physics_to_life.experiments.v0_toy import MAX_SEQ_REFINE  # noqa: E402
from extend_sweep import _rows, EXTRA_TAUS  # noqa: E402
from run import train_model  # noqa: E402


def one(args):
    ep, model, cfg, base, taus, kappa, name = args
    sim = SimCache(ep["spec"], ep["interv"], cfg, rng=np.random.default_rng(ep["seed"] + 10_000))
    res = run_learned(sim, model, taus, base, sequential=False, kappa=kappa, name=name)
    res += run_learned(sim, model, taus, base, sequential=True, kappa=kappa, name=name, max_refine=MAX_SEQ_REFINE)
    return _rows(ep, res, ep["Y_ref"], ep["necessary"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-id", default="v0_main")
    ap.add_argument("--name", required=True)
    ap.add_argument("--variant", required=True, help="JSON dict, e.g. '{\"drop_groups\": [\"intervention\"]}'")
    ap.add_argument("--n-proc", type=int, default=4)
    args = ap.parse_args()
    out_dir = HERE / "results" / args.run_id
    cfg = yaml.safe_load(open(out_dir / "config.yaml"))
    cache = out_dir / "cache"
    train = pickle.load(open(next(cache.glob("train_*.pkl")), "rb"))
    test = pickle.load(open(next(cache.glob("test_*.pkl")), "rb"))
    variant = json.loads(args.variant)
    kappa = float(variant.pop("kappa", cfg["kappa"]))
    t0 = time.time()
    model, info = train_model(train, cfg, variant, seed=int(cfg["seed"]))
    print(f"trained variant {args.name}: {info['n_rows']} rows, {info['n_pos']} positives in {time.time()-t0:.0f}s", flush=True)
    sim_cfg = SimConfig(**cfg["sim"])
    taus = sorted(set(cfg["taus"]) | set(EXTRA_TAUS))
    jobs = [(ep, model, sim_cfg, int(cfg["base_level"]), taus, kappa, f"abl_{args.name}") for ep in test]
    t0 = time.time()
    with mp.get_context("spawn").Pool(args.n_proc) as pool:
        out = pool.map(one, jobs, chunksize=2)
    rows = [r for rr in out for r in rr]
    pickle.dump(rows, open(cache / f"rows_test_ext_{args.name}.pkl", "wb"))
    mi = json.load(open(out_dir / "model_info.json")) if (out_dir / "model_info.json").exists() else {}
    mi[args.name] = info; json.dump(mi, open(out_dir / "model_info.json", "w"), indent=2)
    print(f"evaluated {args.name}: {len(rows)} rows in {time.time()-t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()

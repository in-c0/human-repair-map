#!/usr/bin/env python
"""Seed sensitivity of the learned router: retrain the main ensemble with extra seeds on the
cached training episodes and evaluate one-shot + sequential learned policies on the cached
test episodes. Appends rows to results/<run_id>/cache/rows_seed_check.pkl and writes a
small table. Run after run.py has finished."""
from __future__ import annotations
import argparse, os, pickle, sys, time
from pathlib import Path
for _v in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS"):
    os.environ.setdefault(_v, "1")
import numpy as np
import pandas as pd
import yaml

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.models.simulators import SimConfig  # noqa: E402
from physics_to_life.experiments.v0_toy import run_conditions_many  # noqa: E402
from physics_to_life.evaluation import metrics as M  # noqa: E402
from physics_to_life.evaluation.analysis import score_metrics  # noqa: E402
sys.path.insert(0, str(HERE))
from run import train_model  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-id", default="v0_main")
    ap.add_argument("--seeds", default="1,2")
    ap.add_argument("--n-proc", type=int, default=4)
    args = ap.parse_args()
    out_dir = HERE / "results" / args.run_id
    cfg = yaml.safe_load(open(out_dir / "config.yaml"))
    cache = out_dir / "cache"
    train = pickle.load(open(next(cache.glob("train_*.pkl")), "rb"))
    test = pickle.load(open(next(cache.glob("test_*.pkl")), "rb"))
    sim_cfg = SimConfig(**cfg["sim"])
    models, variants = {}, {}
    for s in [int(x) for x in args.seeds.split(",")]:
        t0 = time.time()
        models[f"seed{s}"], _ = train_model(train, cfg, None, seed=s)
        variants[f"learned_seed{s}"] = dict(model=f"seed{s}", sequential=False, kappa=float(cfg["kappa"]))
        variants[f"learned_seed{s}_seq"] = dict(model=f"seed{s}", sequential=True, kappa=float(cfg["kappa"]))
        print(f"trained seed {s} in {time.time()-t0:.0f}s", flush=True)
    rows = run_conditions_many(test, models, sim_cfg, n_proc=args.n_proc, base=int(cfg["base_level"]), taus=cfg["taus"],
                               tols=cfg["tols"], kappa=float(cfg["kappa"]), learned_variants=variants, seed=int(cfg["seed"]))
    rows = [r for r in rows if r["policy"].startswith("learned_seed")]
    pickle.dump(rows, open(cache / "rows_seed_check.pkl", "wb"))
    df = M.rows_to_frame(rows); tab = M.pareto_table(df, float(cfg["tol_ref"]))
    (out_dir / "tables").mkdir(exist_ok=True)
    tab.to_csv(out_dir / "tables" / "seed_check.csv", index=False)
    summ = []
    for pol in sorted(tab.policy.unique()):
        c, e = M._curve(tab, pol, "id")
        sm = score_metrics(rows, test, pol) if not pol.endswith("_seq") else {}
        summ.append({"policy": pol, "auroc": sm.get("auroc_necessary_prob"), "ece": sm.get("ece_necessary"),
                     "err_at_2x_medium": M.interp_error_at_cost(c, e, 2 * 400 * 36), "cost_to_tol": M.cost_to_reach(c, e, float(cfg["tol_ref"]))})
    pd.DataFrame(summ).to_csv(out_dir / "tables" / "seed_check_summary.csv", index=False)
    print(pd.DataFrame(summ).to_string())


if __name__ == "__main__":
    main()

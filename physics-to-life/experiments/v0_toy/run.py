#!/usr/bin/env python
"""Run the V0 adaptive-fidelity experiment end to end.

Stages: generate -> train -> evaluate -> analyze.  Episode caches and row-level results are
stored under results/<run_id>/cache (git-ignored); tables, figures, summary and provenance
under results/<run_id>/ (committed).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
for _v in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS"):
    os.environ.setdefault(_v, "1")  # one BLAS thread per worker process
import pickle
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd
import yaml

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))

from physics_to_life.models.simulators import SimConfig  # noqa: E402
from physics_to_life.experiments.v0_toy import (generate_episodes, build_training_set, run_conditions_many,  # noqa: E402
                                                 DEFAULT_TAUS, DEFAULT_TOLS)
from physics_to_life.inference.ensemble import EnsembleClassifier  # noqa: E402
from physics_to_life.routing.features import FEATURE_NAMES, feature_groups  # noqa: E402
from physics_to_life.evaluation.provenance import collect_provenance, write_json  # noqa: E402
from physics_to_life.evaluation import metrics as M  # noqa: E402
from physics_to_life.evaluation import plots as P  # noqa: E402
from physics_to_life.evaluation.analysis import analyze  # noqa: E402


def cfg_hash(d: dict) -> str:
    return hashlib.sha1(json.dumps(d, sort_keys=True, default=str).encode()).hexdigest()[:10]


def load_or_generate(cache_dir: Path, name: str, seeds, family, sim_cfg, n_proc, tol_ref, base, key):
    path = cache_dir / f"{name}_{key}.pkl"
    if path.exists():
        with open(path, "rb") as f:
            return pickle.load(f)
    t0 = time.time()
    eps = generate_episodes(seeds, family=family, cfg=sim_cfg, n_proc=n_proc, tol_ref=tol_ref, base=base)
    print(f"  generated {len(eps)} '{family}' episodes for {name} in {time.time()-t0:.0f}s", flush=True)
    with open(path, "wb") as f:
        pickle.dump(eps, f)
    return eps


def train_model(episodes, cfg, variant: dict | None = None, seed: int = 0):
    v = dict(variant or {})
    ens = dict(cfg["ensemble"]); ens.update({k: v[k] for k in ("kind", "n_members", "hidden") if k in v})
    label = v.get("label", cfg.get("label", "necessary"))
    include_path = v.get("include_path_states", cfg.get("include_path_states", True))
    n_train = v.get("n_train", len(episodes))
    eps = episodes[:n_train]
    X, y, groups = build_training_set(eps, label=label, include_path=include_path)
    feature_idx = None
    if "drop_groups" in v:
        drop = set()
        fg = feature_groups()
        for g in v["drop_groups"]:
            drop.update(fg[g])
        feature_idx = [i for i in range(len(FEATURE_NAMES)) if i not in drop]
    model = EnsembleClassifier(kind=ens["kind"], n_members=int(ens["n_members"]), seed=seed,
                               feature_idx=feature_idx, hidden=tuple(ens["hidden"]))
    model.fit(X, y)
    return model, {"n_rows": int(len(y)), "n_pos": int(y.sum()), "n_episodes": len(eps), "label": label,
                   "features": [FEATURE_NAMES[i] for i in (feature_idx or range(len(FEATURE_NAMES)))]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default=str(HERE / "config.yaml"))
    ap.add_argument("--stage", default="all", choices=["all", "generate", "train", "evaluate", "analyze"])
    ap.add_argument("--smoke", action="store_true", help="tiny sizes for a pipeline check")
    ap.add_argument("--run-id", default=None)
    ap.add_argument("--n-proc", type=int, default=None)
    args = ap.parse_args()

    with open(args.config) as f:
        cfg = yaml.safe_load(f)
    if args.smoke:
        cfg.update(dict(run_id="smoke", n_train=24, n_test=12, n_ood=6, ood_families=["amp_high", "negative"]))
        cfg["ensemble"]["n_members"] = 2
        cfg["ablations"] = {"no_uncertainty": {"kappa": 0.0}, "gbm": {"kind": "gbm"}}
    if args.run_id:
        cfg["run_id"] = args.run_id
    if args.n_proc:
        cfg["n_proc"] = args.n_proc
    out_dir = HERE / "results" / cfg["run_id"]
    cache_dir = out_dir / "cache"
    fig_dir = out_dir / "figures"
    for d in (out_dir, cache_dir, fig_dir):
        d.mkdir(parents=True, exist_ok=True)
    sim_cfg = SimConfig(**cfg["sim"])
    seed = int(cfg["seed"]); base = int(cfg["base_level"]); tol_ref = float(cfg["tol_ref"]); n_proc = int(cfg["n_proc"])
    key = cfg_hash({"sim": cfg["sim"], "base": base, "tol_ref": tol_ref})
    t_start = time.time()
    prov = collect_provenance(cfg, seed)
    write_json(out_dir / "provenance.json", prov)
    with open(out_dir / "config.yaml", "w") as f:
        yaml.safe_dump(cfg, f)

    # ---------------- generate ----------------
    print("[generate]", flush=True)
    rng = np.random.default_rng(seed)
    train_seeds = 100_000 + np.arange(cfg["n_train"])
    test_seeds = 200_000 + np.arange(cfg["n_test"])
    train_eps = load_or_generate(cache_dir, "train", train_seeds, "id", sim_cfg, n_proc, tol_ref, base, key)
    test_eps = load_or_generate(cache_dir, "test", test_seeds, "id", sim_cfg, n_proc, tol_ref, base, key)
    ood_eps = {}
    for i, fam in enumerate(cfg["ood_families"]):
        seeds_f = 300_000 + 1000 * i + np.arange(cfg["n_ood"])
        ood_eps[fam] = load_or_generate(cache_dir, f"ood_{fam}", seeds_f, fam, sim_cfg, n_proc, tol_ref, base, key)
    if args.stage == "generate":
        return

    # ---------------- train ----------------
    print("[train]", flush=True)
    models, model_info = {}, {}
    models["main"], model_info["main"] = train_model(train_eps, cfg, None, seed)
    for name, variant in cfg.get("ablations", {}).items():
        v = dict(variant); v.pop("kappa", None)
        if v:
            models[name], model_info[name] = train_model(train_eps, cfg, v, seed)
    write_json(out_dir / "model_info.json", model_info)
    with open(cache_dir / "models.pkl", "wb") as f:
        pickle.dump(models, f)
    if args.stage == "train":
        return

    # ---------------- evaluate ----------------
    print("[evaluate]", flush=True)
    kappa = float(cfg["kappa"])
    variants = {"learned": dict(model="main", sequential=False, kappa=kappa),
                "learned_seq": dict(model="main", sequential=True, kappa=kappa)}
    for name, variant in cfg.get("ablations", {}).items():
        mk = name if name in models else "main"
        k = float(variant.get("kappa", kappa))
        variants[f"abl_{name}"] = dict(model=mk, sequential=False, kappa=k)
        variants[f"abl_{name}_seq"] = dict(model=mk, sequential=True, kappa=k)
    rows_path = cache_dir / "rows_test.pkl"
    if rows_path.exists():
        rows = pickle.load(open(rows_path, "rb"))
    else:
        t0 = time.time()
        rows = run_conditions_many(test_eps, models, sim_cfg, n_proc=n_proc, base=base, taus=cfg["taus"],
                                   tols=cfg["tols"], kappa=kappa, learned_variants=variants, seed=seed)
        pickle.dump(rows, open(rows_path, "wb"))
        print(f"  evaluated test set in {time.time()-t0:.0f}s", flush=True)
    ood_rows = {}
    main_variants = {"learned": variants["learned"], "learned_seq": variants["learned_seq"]}
    for fam, eps in ood_eps.items():
        p = cache_dir / f"rows_ood_{fam}.pkl"
        if p.exists():
            ood_rows[fam] = pickle.load(open(p, "rb"))
        else:
            t0 = time.time()
            ood_rows[fam] = run_conditions_many(eps, {"main": models["main"]}, sim_cfg, n_proc=n_proc, base=base,
                                                taus=cfg["taus"], tols=cfg["tols"], kappa=kappa,
                                                learned_variants=main_variants, seed=seed)
            pickle.dump(ood_rows[fam], open(p, "wb"))
            print(f"  evaluated OOD family '{fam}' in {time.time()-t0:.0f}s", flush=True)
    if args.stage == "evaluate":
        return

    # ---------------- analyze ----------------
    print("[analyze]", flush=True)
    summary = analyze(cfg, out_dir, fig_dir, train_eps, test_eps, ood_eps, rows, ood_rows, models, model_info)
    summary["runtime_s"] = time.time() - t_start
    write_json(out_dir / "summary.json", summary)
    prov["runtime_s"] = summary["runtime_s"]
    write_json(out_dir / "provenance.json", prov)
    print(f"done in {summary['runtime_s']:.0f}s -> {out_dir}")


if __name__ == "__main__":
    main()

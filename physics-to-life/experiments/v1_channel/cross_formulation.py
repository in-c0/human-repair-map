#!/usr/bin/env python
"""Cross-formulation test (preregistration §12, H9-V1): the test episodes of a finished run are
re-labelled under the level-B hidden truth (alternate Markov topologies; same instances,
interventions and protocols, reproduced from the same seeds), and the routers trained under
level A are evaluated on them by exact lookup.  Reports selection precision/recall and the
frontier under B next to the same quantities under A, plus the H5/H8 closures evaluated on the
B-labelled test set with the A-trained surrogates.
Usage: cross_formulation.py --run-dir results/<run_id> [--n-proc 4]
"""
from __future__ import annotations
import argparse, json, os, pickle, sys, time
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
from physics_to_life.v1.systems.gunay2015_fine import gunay2015_hierarchy, load_params  # noqa: E402
from physics_to_life.v1.systems import gunay2015_profile as GP  # noqa: E402
from physics_to_life.v1.episodes import sample_instance, label_episode, EpisodeConfig  # noqa: E402
from physics_to_life.v1.experiment import evaluate_episodes, frontier_table, pooled_frontier  # noqa: E402
from physics_to_life.v1.routing import set_schema  # noqa: E402
from physics_to_life.v1.surrogate import fit_and_evaluate  # noqa: E402


def _relabel(args):
    specB, seed, family, cfg_ep, g_cv, r_cv = args
    rng = np.random.default_rng(seed)
    inst = sample_instance(specB, rng, g_cv=g_cv, rate_cv=r_cv)
    interv = GP.sample_intervention(rng, family)
    groups = GP.groups(rng)
    return label_episode(specB, inst, interv, groups, cfg_ep, seed=seed, family=family)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--run-dir", required=True); ap.add_argument("--n-proc", type=int, default=4)
    args = ap.parse_args()
    rd = Path(args.run_dir); cache = rd / "cache"; out = rd / "cross_formulation"; out.mkdir(exist_ok=True)
    cfg = yaml.safe_load(open(rd / "config.yaml")); seed = int(cfg["seed"])
    params = load_params(HERE / cfg.get("hierarchy_params", "hierarchy/gunay2015_fine.json"))
    specB = gunay2015_hierarchy(params, q10=float(cfg.get("q10", 3.0)), level="B")
    names = [c.name for c in specB.channels]
    set_schema(GP.GROUP_NAMES, GP.RATE_KEYS)
    models = pickle.load(open(cache / "models.pkl", "rb"))
    testA = pickle.load(open(cache / "test.pkl", "rb")); trainA = pickle.load(open(cache / "train.pkl", "rb"))
    t0 = time.time()
    pB = cache / "test_B.pkl"
    if pB.exists():
        testB = pickle.load(open(pB, "rb"))
    else:
        cfg_ep = EpisodeConfig(base_level=int(cfg["base_level"]), tol_rel=float(cfg["tol_rel"]), routable=cfg.get("routable"))
        jobs = [(specB, int(ep["seed"]), ep["family"], cfg_ep, float(cfg["instance_g_cv"]), float(cfg["instance_rate_cv"])) for ep in testA]
        with mp.get_context("spawn").Pool(args.n_proc) as pool:
            testB = pool.map(_relabel, jobs, chunksize=2)
        pickle.dump(testB, open(pB, "wb"))
    t_label = time.time() - t0
    # sanity: same interventions and protocols under A and B
    same = all(a["interv"].name == b["interv"].name and [g["name"] for g in a["groups"]] == [g["name"] for g in b["groups"]] for a, b in zip(testA, testB))
    dfA = evaluate_episodes(testA, names, models, seed); dfA["family"] = "A"
    dfB = evaluate_episodes(testB, names, models, seed); dfB["family"] = "B"
    df = pd.concat([dfA, dfB], ignore_index=True); df.to_pickle(out / "rows_AB.pkl")
    pf = pooled_frontier(df); pf.to_csv(out / "frontier_pooled_AB.csv", index=False)
    ft = frontier_table(df); ft.to_csv(out / "frontier_by_target_AB.csv", index=False)
    # label agreement between truths: minimal sets and 'necessary' per (group, target)
    agree, necA, necB = [], [], []
    for a, b in zip(testA, testB):
        for ga, gb in zip(a["groups"], b["groups"]):
            for t in ga["targets"]:
                agree.append(set(ga["minimal"][t]) == set(gb["minimal"][t])); necA.append(len(ga["minimal"][t]) > 0); necB.append(len(gb["minimal"][t]) > 0)
    summ = {"n_test": len(testA), "same_interventions_and_protocols": bool(same), "label_wall_s": t_label,
            "minimal_set_agreement_A_vs_B": float(np.mean(agree)), "necessary_rate_A": float(np.mean(necA)), "necessary_rate_B": float(np.mean(necB)),
            "policies": {}}
    for pol in ("voc", "voc_seq", "hybrid", "hybrid_seq", "hardlabel", "share", "discrepancy", "sensitivity", "novelty", "uncertainty", "fullstate_voc", "random", "oracle_voc", "uniform_medium", "uniform_fine"):
        rows = {}
        for fam in ("A", "B"):
            g = pf[(pf.family == fam) & (pf.policy == pol)]
            if len(g):
                # principal operating point: the parameter whose cost fraction is closest to 0.30 (or the single row)
                r = g.iloc[(g.cost_frac_fine - 0.30).abs().argsort().iloc[0]]
                gt = ft[(ft.family == fam) & (ft.policy == pol) & (ft.param == r.param)]
                rows[fam] = {"param": float(r.param), "cost_frac_fine": float(r.cost_frac_fine), "err_rel_tol_mean": float(r.err_rel_tol_mean), "success_rate": float(r.success_rate),
                             "precision": float(gt.precision.mean()) if len(gt) else None, "recall": float(gt.recall.mean()) if len(gt) else None,
                             "false_safe_rate": float(r.false_safe_rate) if r.false_safe_rate == r.false_safe_rate else None}
        summ["policies"][pol] = rows
    # H5/H8 under B: A-trained surrogates, B-labelled test
    n_val = max(int(0.2 * len(trainA)), 5)
    surB, _ = fit_and_evaluate(trainA[:-n_val], trainA[-n_val:], testB, {}, names, seed=seed, n_members=int(cfg["ensemble_members"]))
    summ["surrogate_under_B"] = surB["by_family"].get("id")
    summ["runtime_s"] = time.time() - t0
    write_json(out / "summary.json", summ); write_json(out / "provenance.json", collect_provenance({"script": "cross_formulation.py", "run_dir": str(rd)}, seed))
    print(json.dumps({k: v for k, v in summ.items() if k != "policies"}, indent=1))
    for pol, rows in summ["policies"].items():
        print(pol, {fam: (round(r["err_rel_tol_mean"], 2), round(r["cost_frac_fine"], 2), round(r["precision"], 2) if r["precision"] is not None else None) for fam, r in rows.items()})


if __name__ == "__main__":
    main()

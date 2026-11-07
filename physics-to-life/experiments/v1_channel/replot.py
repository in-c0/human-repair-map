#!/usr/bin/env python
"""Regenerate the accuracy-vs-compute figures of a finished run from its saved frontier tables
(tables/frontier_pooled.csv, tables/frontier_by_target.csv) with a run-specific title.  Purely
cosmetic: run.py titles every figure "V1 pilot"; the numbers are the tables' and are unchanged."""
from __future__ import annotations
import argparse, sys
from pathlib import Path
import pandas as pd
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.v1 import plots_v1 as P  # noqa: E402


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--run-dir", required=True); ap.add_argument("--label", default=None)
    args = ap.parse_args(); rd = Path(args.run_dir); figs = rd / "figures"; tabs = rd / "tables"
    label = args.label or f"V1 {rd.name}"
    pf = pd.read_csv(tabs / "frontier_pooled.csv"); ft = pd.read_csv(tabs / "frontier_by_target.csv")
    n_id = int(pf[(pf.family == "id") & (pf.policy == "uniform_fine")].n.iloc[0]) if len(pf[(pf.family == "id") & (pf.policy == "uniform_fine")]) else None
    P.pareto(pf, figs / "fig1_pareto_pooled_id", f"{label}: accuracy vs compute pooled over targets (in-distribution test set{'' if n_id is None else f', {n_id} target rows'})")
    for fam in sorted(set(pf.family) - {"id"}):
        P.pareto(pf, figs / f"figS_pareto_pooled_{fam}", f"{label}: {'reserved ID set' if fam == 'reserve' else f'OOD family {fam!r}'} (pooled over targets)", family=fam)
    for tgt in sorted(ft.target.unique()):
        P.pareto(ft[ft.target == tgt].assign(family="id"), figs / f"figT_pareto_{tgt}", f"{label}: target {tgt} (in-distribution)", family="id")
    print(f"replotted pooled + {len(set(pf.family)) - 1} family + {ft.target.nunique()} target figures in {figs}")


if __name__ == "__main__":
    main()

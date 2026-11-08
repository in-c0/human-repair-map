#!/usr/bin/env python
"""Quick current-clamp comparison of medium vs fine (all / Kf only / NaT only) for a hierarchy
parameter file: spike count and latency at a few pulse currents.  Usage: check_cclamp_levels.py PARAMS.json [currents]"""
from __future__ import annotations
import json, sys
from pathlib import Path
import numpy as np
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.v1.systems import gunay2015 as G  # noqa: E402
from physics_to_life.v1.systems import gunay2015_fine as F  # noqa: E402
from physics_to_life.v1.membrane import simulate  # noqa: E402
from physics_to_life.v1.episodes import TargetGroup, compute_targets  # noqa: E402


def main():
    params = json.load(open(sys.argv[1]))
    currents = [float(v) for v in sys.argv[2].split(",")] if len(sys.argv) > 2 else [-1.0, 0.0, 10.0, 40.0]
    spec = F.gunay2015_hierarchy(params, q10=3.0, level="A"); names = [c.name for c in spec.channels]
    print(f"{'I_pulse':>8s} {'level':>14s} {'spikes':>7s} {'latency':>8s} {'min_isi':>8s} {'wall':>6s}")
    for ip in currents:
        prot = G.gunay_cclamp(ip); grp = TargetGroup("cclamp", prot, (10.0, 510.0), ["spike_count", "spike_latency", "min_isi"])
        for label, fid in (("medium", {n: 1 for n in names}), ("fine_all", {n: 2 for n in names}),
                           ("fine_Kf_only", {n: (2 if n == "Kf" else 1) for n in names}), ("fine_NaT_only", {n: (2 if n == "NaT" else 1) for n in names})):
            r = simulate(spec, prot, fid); y = compute_targets(r, grp)
            print(f"{ip:8.1f} {label:>14s} {y['spike_count']:7.0f} {y['spike_latency']:8.2f} {y['min_isi']:8.2f} {r['wall']:6.1f}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python
"""Fit the constructed fine (Markov) levels of Kf and NaT to the published Günay 2015 HH
description on the declared fitting protocol families, and write the parameters with
diagnostics to hierarchy/gunay2015_fine.json.  Deterministic (seeded multi-start).
Entries: Kf, NaT (level A, primary hidden truth) and Kf_B, NaT_B (level B, alternate topology)."""
from __future__ import annotations
import argparse, json, sys, time
from pathlib import Path
import numpy as np
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.evaluation.provenance import collect_provenance  # noqa: E402
from physics_to_life.v1.systems import gunay2015 as G  # noqa: E402
from physics_to_life.v1.systems import gunay2015_fine as F  # noqa: E402
from physics_to_life.v1.markov_fit import fit_markov_to_hh  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--channel", choices=["Kf", "NaT"], required=True)
    ap.add_argument("--form", choices=["eyring", "sigmoid", "B", "coupled", "coupledB", "anchored", "anchoredB"], default="anchored")
    ap.add_argument("--entry", default=None, help="JSON key to write (default: channel, or channel_B for form B)")
    ap.add_argument("--n-starts", type=int, default=4)
    ap.add_argument("--max-nfev", type=int, default=400)
    ap.add_argument("--seed", type=int, default=2015)
    ap.add_argument("--out", default=str(HERE / "hierarchy" / "gunay2015_fine.json"))
    args = ap.parse_args()
    out = Path(args.out); out.parent.mkdir(parents=True, exist_ok=True)
    res = json.load(open(out)) if out.exists() else {}
    entry = args.entry or (args.channel + ("_B" if args.form in ("B", "coupledB", "anchoredB") else ""))
    rng = np.random.default_rng(args.seed)
    theta0_fn, builder, names = F.FORMS[args.channel][args.form]
    th0, lo, hi = theta0_fn()
    if args.channel == "Kf":
        target, fam, e_rev = G.channel_kf(), F.kf_fit_family(), G.E_K
        build = lambda th: builder(th, with_block=False)  # noqa: E731
    else:
        target, fam, e_rev = G.channel_nat(), F.nat_fit_family(), G.E_NA
        build = builder
    t0 = time.time()
    fit = fit_markov_to_hh(build, th0, lo, hi, target, fam, e_rev=e_rev, n_starts=args.n_starts, rng=rng, verbose=True, max_nfev=args.max_nfev)
    res[entry] = {"theta": [float(v) for v in fit["theta"]], "names": names, "form": args.form, "rms": fit["rms"],
                  "per_protocol": fit["per_protocol"], "history": fit["history"], "wall_s": time.time() - t0,
                  "theta0": [float(v) for v in th0], "family": fam.names, "seed": args.seed,
                  "status": "CONSTRUCTED: fitted to the published HH currents on the fit family; not measured"}
    res.setdefault("provenance", {})[entry] = collect_provenance({"script": "build_hierarchy.py", "channel": args.channel, "form": args.form,
                                                                   "n_starts": args.n_starts, "max_nfev": args.max_nfev}, args.seed)
    json.dump(res, open(out, "w"), indent=1)
    print(f"{entry} done: normalised rms {fit['rms']:.4f}", flush=True)


if __name__ == "__main__":
    main()

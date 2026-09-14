#!/usr/bin/env python
"""Numerical validation of the V1 hierarchy on the Günay 2015 system (ADR-0007 / preregistration §2).

For the assembled hierarchy (hierarchy/gunay2015_fine.json):
  1. fine (LSODA working tolerance) vs reference (Radau 1e-9): the numerical floor per level;
  2. fine-vs-medium and coarse-vs-medium current error per channel on the *fit family* (what the fit
     achieved) and on the *evaluation protocols* (off the fit family), for level A and level B;
  3. current-clamp: spike count / latency / ISI of the five level assignments at the pilot currents;
  4. per-intervention-family preview: medium-vs-fine-A target discrepancy for 5 samples per family
     (structure of the closure error the router will face; no labels are produced here);
  5. state dimensions and wall time per level.
Writes results/hierarchy_validation/{RESULTS.md, tables/*.csv, figures/*}.
"""
from __future__ import annotations
import json, sys, time
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "src"))
from physics_to_life.evaluation.provenance import collect_provenance, write_json  # noqa: E402
from physics_to_life.evaluation.plots import _style_axes, _save  # noqa: E402
from physics_to_life.v1.systems import gunay2015 as G  # noqa: E402
from physics_to_life.v1.systems import gunay2015_fine as F  # noqa: E402
from physics_to_life.v1.systems import gunay2015_profile as GP  # noqa: E402
from physics_to_life.v1.membrane import simulate, SimSettings, Protocol, Intervention  # noqa: E402
from physics_to_life.v1.markov_fit import hh_vclamp, markov_current  # noqa: E402
from physics_to_life.v1.targets import spikes  # noqa: E402
from physics_to_life.v1.episodes import TargetGroup, compute_targets, sample_instance  # noqa: E402

OUT = HERE / "results" / "hierarchy_validation"


def rel_err(a, b):
    return float(np.abs(a - b).max() / max(np.abs(b).max(), 1e-12))


def main():
    t_start = time.time()
    for d in (OUT / "tables", OUT / "figures"):
        d.mkdir(parents=True, exist_ok=True)
    params = F.load_params()
    specs = {"A": F.gunay2015_hierarchy(params, q10=3.0, level="A"), "B": F.gunay2015_hierarchy(params, q10=3.0, level="B")}
    names = [c.name for c in specs["A"].channels]
    entries = {k: v for k, v in params.items() if isinstance(v, dict) and "rms" in v}
    R = {"fit_rms": {k: v["rms"] for k, v in entries.items()},
         "fit_forms": {k: v.get("form") for k, v in entries.items()},
         "state_dims": {lvl: {c.name: c.n_state({"fine": 2, "medium": 1, "coarse": 0}[lvl]) for c in specs["A"].channels} for lvl in ("fine", "medium", "coarse")},
         "state_dims_B_fine": {c.name: c.n_state(2) for c in specs["B"].channels}}
    # 2. channel-level errors on fit family and evaluation protocols (analytic vclamp)
    rows = []
    eval_prots = {"Kf": [("eval_act_-30", Protocol("vclamp", [(0.0, -90.0), (20.0, -30.0), (80.0, -90.0)], 100.0, 0.05)),
                         ("eval_act_-10", Protocol("vclamp", [(0.0, -90.0), (20.0, -10.0), (80.0, -90.0)], 100.0, 0.05)),
                         ("eval_act_+10", Protocol("vclamp", [(0.0, -90.0), (20.0, 10.0), (80.0, -90.0)], 100.0, 0.05)),
                         ("eval_act_+30", Protocol("vclamp", [(0.0, -90.0), (20.0, 30.0), (80.0, -90.0)], 100.0, 0.05)),
                         ("eval_rec_10", Protocol("vclamp", [(0.0, -90.0), (20.0, 20.0), (60.0, -90.0), (70.0, 20.0), (110.0, -90.0)], 130.0, 0.05)),
                         ("eval_rec_30", Protocol("vclamp", [(0.0, -90.0), (20.0, 20.0), (60.0, -90.0), (90.0, 20.0), (130.0, -90.0)], 150.0, 0.05)),
                         ("eval_rec_100", Protocol("vclamp", [(0.0, -90.0), (20.0, 20.0), (60.0, -90.0), (160.0, 20.0), (200.0, -90.0)], 220.0, 0.05)),
                         ("eval_hold-55_step-20", Protocol("vclamp", [(0.0, -55.0), (20.0, -20.0), (80.0, -55.0)], 100.0, 0.05))],
                  "NaT": [("eval_act_-30", Protocol("vclamp", [(0.0, -90.0), (10.0, -30.0), (40.0, -90.0)], 50.0, 0.02)),
                          ("eval_act_-20", Protocol("vclamp", [(0.0, -90.0), (10.0, -20.0), (40.0, -90.0)], 50.0, 0.02)),
                          ("eval_act_0", Protocol("vclamp", [(0.0, -90.0), (10.0, 0.0), (40.0, -90.0)], 50.0, 0.02)),
                          ("eval_hold-55_step-20", Protocol("vclamp", [(0.0, -55.0), (10.0, -20.0), (40.0, -55.0)], 50.0, 0.02))]}
    fams = {"Kf": F.kf_fit_family(), "NaT": F.nat_fit_family()}
    for ch_name in ("Kf", "NaT"):
        e_rev = G.E_K if ch_name == "Kf" else G.E_NA
        med = specs["A"].channel(ch_name)
        prots = list(zip(fams[ch_name].names, fams[ch_name].protocols)) + eval_prots[ch_name]
        for pname, prot in prots:
            t, Im = hh_vclamp(med, prot, e_rev=e_rev)
            # coarse: instantaneous activation (and Kf single component) — from the ODE integrator
            spec1 = specs["A"]
            fid_c = {n: 1 for n in names}; fid_c[ch_name] = 0
            Ic = simulate(spec1, prot, fid_c)["I_ch"][ch_name]
            for lvl in ("A", "B"):
                _, If = markov_current(specs[lvl].channel(ch_name), prot, e_rev=e_rev)
                rows.append({"channel": ch_name, "protocol": pname, "in_fit_family": pname in fams[ch_name].names, "level": lvl,
                             "rel_err_medium_vs_fine": rel_err(Im, If), "rel_err_coarse_vs_fine": rel_err(Ic, If),
                             "rel_rmse_medium_vs_fine": float(np.sqrt(np.mean((Im - If) ** 2)) / max(np.abs(If).max(), 1e-12))})
    ch_df = pd.DataFrame(rows); ch_df.to_csv(OUT / "tables" / "channel_errors.csv", index=False)
    R["channel_errors_summary"] = {f"{lvl}|{c}|{'fit' if fit else 'eval'}": {"rel_err_medium_mean": float(g.rel_err_medium_vs_fine.mean()), "rel_err_medium_max": float(g.rel_err_medium_vs_fine.max()),
                                                                          "rel_err_coarse_mean": float(g.rel_err_coarse_vs_fine.mean())}
                                   for (lvl, c, fit), g in ch_df.groupby(["level", "channel", "in_fit_family"])}
    # 1 + 3. current clamp: numerical floor and level comparison
    cc = []
    st = SimSettings()
    for ip in (-1.0, 0.0, 5.0, 10.0, 20.0, 40.0):
        prot = G.gunay_cclamp(ip); grp = TargetGroup("cclamp", prot, (10.0, 510.0), ["spike_latency", "spike_count", "min_isi", "mean_v", "v_rmse"])
        ref = simulate(specs["A"], prot, {n: 2 for n in names}, settings=st, reference=True); ystar = compute_targets(ref, grp, ref_V=ref["V"])
        for label, spec, fid in (("fine_A", specs["A"], {n: 2 for n in names}), ("fine_B", specs["B"], {n: 2 for n in names}),
                                 ("medium", specs["A"], {n: 1 for n in names}), ("coarse", specs["A"], {n: 0 for n in names}),
                                 ("fine_Kf_only", specs["A"], {n: (2 if n == "Kf" else 1) for n in names}), ("fine_NaT_only", specs["A"], {n: (2 if n == "NaT" else 1) for n in names})):
            r = simulate(spec, prot, fid, settings=st); y = compute_targets(r, grp, ref_V=ref["V"])
            cc.append({"i_pulse": ip, "level": label, "state_dim": r["state_dim"], "cost": r["cost"], "wall": r["wall"],
                       **{f"{k}": y[k] for k in y}, **{f"err_{k}": abs(y[k] - ystar[k]) for k in ystar if k != "v_rmse"}, "ystar_spike_count": ystar["spike_count"], "ystar_spike_latency": ystar["spike_latency"]})
    cc_df = pd.DataFrame(cc); cc_df.to_csv(OUT / "tables" / "cclamp_levels.csv", index=False)
    R["cclamp"] = {lvl: {"max_err_spike_count": float(g.err_spike_count.max()), "max_err_latency_ms": float(g.err_spike_latency.max()),
                         "max_v_rmse": float(g.v_rmse.max()), "mean_cost": float(g.cost.mean()), "mean_wall": float(g.wall.mean()), "state_dim": int(g.state_dim.iloc[0])}
                   for lvl, g in cc_df.groupby("level")}
    # 4. intervention-family preview (5 samples per family; medium vs fine A; instance jitter on)
    rng = np.random.default_rng(7); prev = []
    for fam in GP.ID_FAMILIES + GP.OOD_FAMILIES:
        for k in range(3):
            inst = sample_instance(specs["A"], np.random.default_rng(1000 + 37 * k), g_cv=0.2, rate_cv=0.1)
            iv = GP.sample_intervention(rng, fam)
            for grp in GP.groups(np.random.default_rng(k)):
                truth = simulate(inst, grp.protocol, {n: 2 for n in names}, iv, st, reference=True); ystar = compute_targets(truth, grp, ref_V=truth["V"])
                base = simulate(inst, grp.protocol, {n: 1 for n in names}, iv, st); yb = compute_targets(base, grp, ref_V=truth["V"])
                kf = simulate(inst, grp.protocol, {n: (2 if n == "Kf" else 1) for n in names}, iv, st); ykf = compute_targets(kf, grp, ref_V=truth["V"])
                na = simulate(inst, grp.protocol, {n: (2 if n == "NaT" else 1) for n in names}, iv, st); yna = compute_targets(na, grp, ref_V=truth["V"])
                for t in grp.targets:
                    sc = max(abs(ystar[t]), 1e-9); tol = max(0.05, {"spike_latency": 0.5, "spike_count": 0.5, "min_isi": 1.0, "mean_v": 1.0, "v_rmse": 1.0, "time_to_peak": 0.1, "recovery_fraction": 0.02}.get(t, 0.0) / sc)
                    e = lambda y: (abs(y[t] - ystar[t]) / sc if t != "v_rmse" else y[t])  # noqa: E731
                    prev.append({"family": fam, "group": grp.name, "target": t, "err_medium_over_tol": e(yb) / tol, "err_fineKf_over_tol": e(ykf) / tol, "err_fineNaT_over_tol": e(yna) / tol})
    pv = pd.DataFrame(prev); pv.to_csv(OUT / "tables" / "family_preview.csv", index=False)
    R["family_preview"] = {fam: {"frac_medium_outside_tol": float((g.err_medium_over_tol > 1).mean()), "median_err_medium_over_tol": float(g.err_medium_over_tol.median()),
                                 "frac_fixed_by_Kf": float(((g.err_medium_over_tol > 1) & (g.err_fineKf_over_tol <= 1)).mean()),
                                 "frac_fixed_by_NaT": float(((g.err_medium_over_tol > 1) & (g.err_fineNaT_over_tol <= 1)).mean())} for fam, g in pv.groupby("family")}
    R["wall_total_s"] = time.time() - t_start
    write_json(OUT / "tables" / "summary.json", R); write_json(OUT / "provenance.json", collect_provenance({"script": "validate_hierarchy.py"}, 0))
    # figure: channel errors
    fig, axes = plt.subplots(1, 2, figsize=(11, 3.8))
    for ax, ch_name in zip(axes, ("Kf", "NaT")):
        _style_axes(ax); d = ch_df[ch_df.channel == ch_name]
        for lvl, col in (("A", "#2a78d6"), ("B", "#e34948")):
            dl = d[d.level == lvl]; ax.plot(range(len(dl)), dl.rel_err_medium_vs_fine, "o-", color=col, ms=4, label=f"medium vs fine {lvl}")
        dl = d[d.level == "A"]; ax.plot(range(len(dl)), dl.rel_err_coarse_vs_fine, "s--", color="#898781", ms=3, label="coarse vs fine A")
        ax.set_xticks(range(len(dl))); ax.set_xticklabels(dl.protocol, rotation=90, fontsize=6); ax.set_yscale("log"); ax.set_ylabel("max |ΔI| / max |I_fine|")
        ax.axvline(len(fams[ch_name].names) - 0.5, color="#898781", lw=0.8, ls=":"); ax.set_title(f"{ch_name}: fit family | evaluation protocols", fontsize=10); ax.legend(fontsize=7, frameon=False)
    _save(fig, OUT / "figures" / "channel_errors")
    # RESULTS.md
    L = ["# V1 hierarchy validation (Günay 2015 system)", "",
         f"Fit floors (normalised RMS on the fit family): " + ", ".join(f"{k} {v:.3f} ({R['fit_forms'][k]})" for k, v in R["fit_rms"].items()), "",
         "## Channel-level current errors (max |ΔI| / max |I_fine|)", "", "| level | channel | protocols | medium vs fine, mean | max | coarse vs fine, mean |", "|---|---|---|---|---|---|"]
    for k, v in R["channel_errors_summary"].items():
        lvl, c, fe = k.split("|"); L.append(f"| {lvl} | {c} | {fe} | {v['rel_err_medium_mean']:.3f} | {v['rel_err_medium_max']:.3f} | {v['rel_err_coarse_mean']:.3f} |")
    L += ["", "## Current clamp (I_pulse −1 … 40 pA): worst-case target errors vs the Radau reference of fine A", "", "| level | state dim | max Δspike count | max Δlatency (ms) | max V RMSE (mV) | mean nominal cost | mean wall (s) |", "|---|---|---|---|---|---|---|"]
    for lvl, v in R["cclamp"].items():
        L.append(f"| {lvl} | {v['state_dim']} | {v['max_err_spike_count']:.0f} | {v['max_err_latency_ms']:.2f} | {v['max_v_rmse']:.2f} | {v['mean_cost']:.0f} | {v['mean_wall']:.2f} |")
    L += ["", "## Intervention-family preview (3 instances × 4 groups per family; medium vs fine A; error / tolerance)", "", "| family | fraction of targets where medium is outside tolerance | median err/tol | fixed by refining Kf only | fixed by refining NaT only |", "|---|---|---|---|---|"]
    for fam, v in R["family_preview"].items():
        L.append(f"| {fam} | {v['frac_medium_outside_tol']:.2f} | {v['median_err_medium_over_tol']:.2f} | {v['frac_fixed_by_Kf']:.2f} | {v['frac_fixed_by_NaT']:.2f} |")
    L += ["", f"State dimensions: fine A {R['state_dims']['fine']}, fine B {R['state_dims_B_fine']}, medium {R['state_dims']['medium']}, coarse {R['state_dims']['coarse']}.", f"Wall {R['wall_total_s']:.0f} s."]
    (OUT / "RESULTS.md").write_text("\n".join(L) + "\n"); print("\n".join(L))


if __name__ == "__main__":
    main()

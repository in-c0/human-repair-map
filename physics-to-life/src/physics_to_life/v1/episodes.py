"""V1 episodes: (cell instance, intervention, protocol, targets) with hidden-ground-truth
value-of-computation labels.

An episode asks: for THIS intervention and THIS target, which channel populations need
fine (Markov) physics on top of the cheap base level?  Labels come from the hidden truth
(all channels fine, tight-tolerance reference):
    dE_c  = |Y_base - Y*| - |Y_{c fine} - Y*|        marginal error reduction of refining c
    dE_cd = pairwise version (interaction = dE_cd - dE_c - dE_d)
    minimal set at tolerance (V0-style hard label, for comparison only)
Every quantity is computed per target, so the same intervention yields different labels for
different targets — the target dependence the programme is about.
"""
from __future__ import annotations

import copy
import itertools
import time
from dataclasses import dataclass, field, asdict
from typing import Optional

import numpy as np

from .membrane import MembraneSpec, Protocol, Intervention, simulate, SimSettings
from .targets import vclamp_targets, cclamp_targets, recovery_targets
from .parameters import vclamp_activation, vclamp_recovery, cclamp_step


# ---------------------------------------------------------------------------
# instance sampling (inter-cell variability around the nominal parameter set)
# ---------------------------------------------------------------------------

def sample_instance(spec: MembraneSpec, rng: np.random.Generator, g_cv: float = 0.25, rate_cv: float = 0.15) -> MembraneSpec:
    """Log-normal jitter of conductances and of the kinetic rates (by scale key), applied
    identically at every fidelity level so that the levels remain descriptions of the same cell.
    The nominal spec is what the router 'knows'; the instance is what the simulators run.
    Block keys (drug concentration) are never jittered."""
    inst = copy.deepcopy(spec)
    for ch in inst.channels:
        ch.g_max *= float(np.exp(rng.normal(0.0, g_cv)))
        for key in sorted(k for k in ch.scale_keys() if not k.startswith("block")):
            ch.intrinsic_scales[key] = ch.intrinsic_scales.get(key, 1.0) * float(np.exp(rng.normal(0.0, rate_cv)))
    inst.g_leak *= float(np.exp(rng.normal(0.0, g_cv)))
    return inst


# ---------------------------------------------------------------------------
# intervention families (each maps to a real perturbation; see ADR-0006 §3)
# ---------------------------------------------------------------------------

def sample_intervention(rng: np.random.Generator, family: str, channel_names: list[str]) -> Intervention:
    if family == "none":
        return Intervention("none", family=family)
    if family == "density":            # channel-density change (expression level / genetic dosage)
        ch = str(rng.choice(channel_names)); f = float(np.exp(rng.uniform(np.log(0.3), np.log(2.0))))
        return Intervention(f"density:{ch}x{f:.2f}", g_scales={ch: f}, family=family)
    if family == "shaker_loss":        # Shaker loss-of-function (hypomorph to null)
        f = float(rng.uniform(0.0, 0.5))
        return Intervention(f"shaker_loss:{f:.2f}", g_scales={"shaker": f}, family=family)
    if family == "inactivation_rate":  # N-type inactivation rate (ball-and-chain mutants)
        f = float(np.exp(rng.uniform(np.log(0.2), np.log(3.0))))
        return Intervention(f"inact_rate:x{f:.2f}", rate_scales={"inactivation": f}, family=family)
    if family == "recovery_rate":      # recovery from inactivation
        f = float(np.exp(rng.uniform(np.log(0.3), np.log(3.0))))
        return Intervention(f"recovery_rate:x{f:.2f}", rate_scales={"recovery": f}, family=family)
    if family == "activation_rate":    # activation kinetics (voltage-sensor mutants, crude)
        f = float(np.exp(rng.uniform(np.log(0.5), np.log(2.0))))
        return Intervention(f"activation_rate:x{f:.2f}", rate_scales={"activation": f}, family=family)
    if family == "temperature":        # Q10 scaling of all rates
        T = float(rng.uniform(288.15, 303.15))
        return Intervention(f"T={T-273.15:.1f}C", T_K=T, family=family)
    if family == "k_out":              # extracellular potassium
        K = float(np.exp(rng.uniform(np.log(2.0), np.log(15.0))))
        return Intervention(f"Kout={K:.1f}mM", K_out=K, family=family)
    if family == "block":              # state-dependent open-channel block (fine) vs equilibrium block (cheap)
        conc = float(np.exp(rng.uniform(np.log(0.2), np.log(3.0))))
        frac = conc / (conc + 1.0)      # nominal equilibrium block fraction seen by HH/coarse
        return Intervention(f"block:{conc:.2f}", block_conc={"shaker": conc}, block_frac={"shaker": frac}, family=family)
    if family == "combo":              # two perturbations at once (OOD family)
        a = sample_intervention(rng, str(rng.choice(["density", "inactivation_rate", "temperature", "k_out"])), channel_names)
        b = sample_intervention(rng, str(rng.choice(["shaker_loss", "recovery_rate", "block"])), channel_names)
        return Intervention(f"combo[{a.name}+{b.name}]", rate_scales={**a.rate_scales, **b.rate_scales},
                            g_scales={**a.g_scales, **b.g_scales}, T_K=a.T_K or b.T_K, K_out=a.K_out or b.K_out,
                            block_frac={**a.block_frac, **b.block_frac}, block_conc={**a.block_conc, **b.block_conc}, family=family)
    raise ValueError(family)


# ---------------------------------------------------------------------------
# protocol/target groups
# ---------------------------------------------------------------------------

@dataclass
class TargetGroup:
    name: str
    protocol: Protocol
    window: tuple[float, float]
    targets: list[str]
    channel: Optional[str] = None      # for current targets: which channel's current (None = total)
    windows2: Optional[tuple] = None   # for recovery


def standard_groups(rng: np.random.Generator) -> list[TargetGroup]:
    step = float(rng.choice([-20.0, 0.0, 20.0, 40.0]))
    interval = float(rng.choice([5.0, 20.0, 60.0]))
    i_inj = float(rng.choice([60.0, 120.0, 200.0]))
    g = []
    p = vclamp_activation(step, t_pre=20.0, t_step=60.0)
    g.append(TargetGroup("vclamp_shaker", p, (20.0, 80.0), ["peak_current", "time_to_peak", "charge"], channel="shaker"))
    p = vclamp_recovery(interval, step_mV=20.0)
    g.append(TargetGroup("recovery_shaker", p, (20.0, 60.0), ["recovery_fraction"], channel="shaker",
                         windows2=((20.0, 60.0), (60.0 + interval, 100.0 + interval))))
    p = cclamp_step(i_inj, t_pre=30.0, t_step=150.0)
    g.append(TargetGroup("cclamp", p, (30.0, 180.0), ["spike_latency", "spike_count", "min_isi", "mean_v", "v_rmse"]))
    return g


def compute_targets(res: dict, grp: TargetGroup, ref_V: np.ndarray | None = None) -> dict:
    if grp.name.startswith("recovery"):
        return recovery_targets(res, grp.windows2, grp.channel)
    if grp.protocol.kind == "vclamp":
        return vclamp_targets(res, grp.window[0], grp.window[1], grp.channel)
    return cclamp_targets(res, grp.window[0], grp.window[1], ref_V)


# ---------------------------------------------------------------------------
# episode labelling
# ---------------------------------------------------------------------------

@dataclass
class EpisodeConfig:
    base_level: int = 1
    tol_rel: float = 0.05          # tolerance as a fraction of the target's typical scale
    tol_abs: dict = field(default_factory=lambda: {"spike_latency": 0.5, "spike_count": 0.5, "min_isi": 1.0, "mean_v": 1.0,
                                                   "v_rmse": 1.0, "peak_current": 0.0, "time_to_peak": 0.1,
                                                   "charge": 0.0, "recovery_fraction": 0.02})
    pairwise: bool = True
    settings: SimSettings = field(default_factory=SimSettings)
    routable: Optional[list] = None   # channels over which subsets are enumerated exhaustively (None = all);
                                      # the others (negative controls) get one single-refinement run each and are
                                      # never combined (preregistration §4 main-run rule)


def _err(y: dict, ystar: dict, key: str, scale: dict) -> float:
    a, b = y.get(key, np.nan), ystar.get(key, np.nan)
    if key == "v_rmse":
        return float(a)  # already an error
    return float(abs(a - b) / max(scale.get(key, 1.0), 1e-9))


def label_episode(spec_nominal: MembraneSpec, inst: MembraneSpec, interv: Intervention, groups: list[TargetGroup],
                  cfg: EpisodeConfig, seed: int, family: str = "id") -> dict:
    """Run truth, base and single/pairwise refinements for every target group.  Returns a
    dict with per-(group, target, channel) marginal gains, pairwise interactions, minimal
    sets, costs, and cheap-trajectory summaries for the router."""
    t0 = time.perf_counter()
    names = [ch.name for ch in inst.channels]
    out = {"seed": seed, "family": family, "interv": interv, "groups": [], "n_sims": 0, "wall_truth": 0.0,
           "instance": instance_descriptor(inst)}
    for grp in groups:
        fid_fine = {n: 2 for n in names}
        truth = simulate(inst, grp.protocol, fid_fine, interv, cfg.settings, reference=True)
        out["wall_truth"] += truth["wall"]
        ystar = compute_targets(truth, grp, ref_V=truth["V"])
        scale = {k: (abs(v) if abs(v) > 1e-9 else 1.0) for k, v in ystar.items()}
        fid_base = {n: cfg.base_level for n in names}
        base = simulate(inst, grp.protocol, fid_base, interv, cfg.settings)
        ybase = compute_targets(base, grp, ref_V=truth["V"])
        # every subset of channels refined to fine on top of the base level (exhaustive for K <= 5);
        # with cfg.routable, exhaustive over the routable channels only, plus single refinements of the others
        route = list(cfg.routable) if cfg.routable else list(names)
        sims = {(): base}
        for m in range(1, len(route) + 1):
            for S in itertools.combinations(route, m):
                if m > 1 and not cfg.pairwise and m < len(route):
                    continue
                f = dict(fid_base)
                for c in S:
                    f[c] = 2
                sims[tuple(sorted(S, key=names.index))] = simulate(inst, grp.protocol, f, interv, cfg.settings)
        for c in names:
            if c not in route:
                f = dict(fid_base); f[c] = 2
                sims[(c,)] = simulate(inst, grp.protocol, f, interv, cfg.settings)
        if tuple(names) not in sims:
            sims[tuple(names)] = simulate(inst, grp.protocol, {n: 2 for n in names}, interv, cfg.settings)
        fine_work = sims[tuple(names)]
        coarse_all = simulate(inst, grp.protocol, {n: 0 for n in names}, interv, cfg.settings)
        out["n_sims"] += len(sims) + 2
        errs = {S: {k: _err(compute_targets(r, grp, ref_V=truth["V"]), ystar, k, scale) for k in grp.targets} for S, r in sims.items()}
        costs = {S: r["cost"] for S, r in sims.items()}
        walls = {S: r["wall"] for S, r in sims.items()}
        feats_sim = {S: base_features(r, grp, names) for S, r in sims.items()}
        # subsets not simulated under cfg.routable are synthesised by the preregistered rule: a
        # negative-control channel's refinement changes nothing (exact chain) and costs its single-
        # refinement increment; the routable part carries the error and the features
        synthesized = []
        for m in range(1, len(names) + 1):
            for S in itertools.combinations(names, m):
                S = tuple(sorted(S, key=names.index))
                if S in errs:
                    continue
                R = tuple(c for c in S if c in route)
                extra = [c for c in S if c not in route]
                errs[S] = dict(errs[R]); costs[S] = costs[R] + sum(costs[(c,)] - costs[()] for c in extra)
                walls[S] = walls[R] + sum(walls[(c,)] - walls[()] for c in extra); feats_sim[S] = feats_sim[R]; synthesized.append(S)
        gains = {k: {c: errs[()][k] - errs[(c,)][k] for c in names} for k in grp.targets}
        inter = {}
        if cfg.pairwise:
            for k in grp.targets:
                inter[k] = {}
                for c, d in itertools.combinations(names, 2):
                    if (c, d) in errs:
                        inter[k][(c, d)] = (errs[()][k] - errs[(c, d)][k]) - gains[k][c] - gains[k][d]
        # minimal set at tolerance (per target), searched over the evaluated subsets
        minimal, tol_used = {}, {}
        for k in grp.targets:
            tol = max(cfg.tol_rel, cfg.tol_abs.get(k, 0.0) / max(scale.get(k, 1.0), 1e-9))
            tol_used[k] = tol
            ok = [S for S in sims if errs[S][k] <= tol]
            minimal[k] = min(ok, key=lambda S: (costs[S], errs[S][k])) if ok else min(sims, key=lambda S: errs[S][k])
        # cheap-trajectory summaries per channel for the router, for every simulated subset
        # (the base run's features are what a one-shot router sees; a sequential router sees
        # the features of the current partial-refinement state)
        feats = feats_sim
        # mechanistic discrepancy monitor: medium vs coarse per-channel current in the window
        t = base["t"]; mwin = (t >= grp.window[0]) & (t <= grp.window[1])
        discrepancy = {c: float(np.mean(np.abs(base["I_ch"][c][mwin] - coarse_all["I_ch"][c][mwin])) /
                               (np.mean(np.abs(base["I_ch"][c][mwin])) + 1e-9)) for c in names}
        ycoarse = compute_targets(coarse_all, grp, ref_V=truth["V"])
        errs["coarse_all"] = {k: _err(ycoarse, ystar, k, scale) for k in grp.targets}
        costs["coarse_all"] = coarse_all["cost"]; walls["coarse_all"] = coarse_all["wall"]
        # finite-difference sensitivity of every target to each channel's cheap-level conductance
        # (the adjoint / goal-oriented-adaptivity surrogate): one extra base-level run per channel
        sens, sens_cost, sens_wall = {}, 0.0, 0.0
        for c in names:
            iv = copy.deepcopy(interv); iv.g_scales = dict(iv.g_scales); iv.g_scales[c] = iv.g_scales.get(c, 1.0) * 1.05
            r = simulate(inst, grp.protocol, fid_base, iv, cfg.settings)
            yp = compute_targets(r, grp, ref_V=truth["V"])
            sens[c] = {k: abs(_err(yp, ybase, k, scale)) / 0.05 for k in grp.targets}  # |dY/d ln g| in target-scale units
            sens_cost += r["cost"]; sens_wall += r["wall"]
        out["n_sims"] += len(names)
        out["groups"].append({"name": grp.name, "targets": grp.targets, "ystar": ystar, "ybase": ybase, "scale": scale,
                              "errs": errs, "costs": costs, "walls": walls, "gains": gains, "interactions": inter,
                              "minimal": minimal, "tol": tol_used, "features": feats[()], "features_by_subset": feats,
                              "discrepancy": discrepancy, "sensitivity": sens, "sensitivity_cost": sens_cost, "sensitivity_wall": sens_wall,
                              "protocol_desc": protocol_descriptor(grp), "synthesized_subsets": synthesized,
                              "cost_fine": fine_work["cost"], "cost_base": base["cost"], "wall_fine": fine_work["wall"],
                              "wall_base": base["wall"], "protocol": grp.protocol, "window": grp.window,
                              "err_fine_numerical": {k: errs[tuple(names)][k] for k in grp.targets}})
    out["wall_label"] = time.perf_counter() - t0
    return out


def instance_descriptor(inst: MembraneSpec) -> dict:
    """What a compiled surrogate is allowed to know about the cell it replaces: the instance's
    parameters (conductances, leak, per-key kinetic multipliers)."""
    d = {"g_leak": float(inst.g_leak), "C": float(inst.C)}
    for ch in inst.channels:
        d[f"g:{ch.name}"] = float(ch.g_max)
        for k, v in ch.intrinsic_scales.items():
            d[f"k:{k}"] = float(v)
    return d


def protocol_descriptor(grp: TargetGroup) -> dict:
    """Scalar protocol descriptors: command levels and segment times."""
    segs = grp.protocol.segments
    d = {"kind": grp.protocol.kind, "t_end": float(grp.protocol.t_end)}
    for i, (t0, v) in enumerate(segs[:6]):
        d[f"t{i}"] = float(t0); d[f"v{i}"] = float(v)
    return d


def base_features(base: dict, grp: TargetGroup, names: list[str]) -> dict:
    """Per-channel summaries of the cheap run inside the target window: current share,
    peak, time of peak, late/peak ratio (inactivation engaged), voltage range."""
    t = base["t"]; m = (t >= grp.window[0]) & (t <= grp.window[1])
    tot = np.sum(np.abs(base["I"][m])) + 1e-9
    f = {}
    for n in names:
        I = base["I_ch"][n][m]
        k = int(np.argmax(np.abs(I))) if len(I) else 0
        late = np.mean(np.abs(I[-max(1, len(I) // 5):])) if len(I) else 0.0
        f[n] = {"share": float(np.sum(np.abs(I)) / tot), "peak": float(np.abs(I).max() if len(I) else 0.0),
                "t_peak": float(t[m][k] - grp.window[0]) if len(I) else 0.0,
                "late_over_peak": float(late / (np.abs(I).max() + 1e-9)) if len(I) else 0.0}
    f["_V"] = {"min": float(base["V"][m].min()), "max": float(base["V"][m].max()), "mean": float(base["V"][m].mean())}
    return f

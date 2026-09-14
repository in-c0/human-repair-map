"""Single-compartment membrane with per-channel fidelity, voltage- and current-clamp protocols.

State layout: [V] (current clamp only) followed by each channel's state block:
  level 2  Markov occupancies (n_states)
  level 1  HH gate variables (one per gate)
  level 0  only the dynamic coarse gates (instantaneous gates are evaluated at x_inf(V);
           dropped gates are absorbed by their mix partner)
Integration uses scipy's solve_ivp piecewise over protocol segments; the reference uses
Radau at tight tolerance, the working simulator LSODA at moderate tolerance.  Cost is
reported three ways: nominal (RHS evaluations x total state dimension), RHS evaluations,
and wall-clock.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Optional

import numpy as np
from scipy.integrate import solve_ivp

from .channels import ChannelPopulation, MarkovScheme, HHGate, f_rt

R_F = 1000.0 * 8.314462 / 96485.33  # mV/K


def nernst(T_K: float, c_out: float, c_in: float, z: int = 1) -> float:
    return R_F * T_K / z * np.log(c_out / c_in)


@dataclass
class MembraneSpec:
    C: float                                 # pF
    g_leak: float                            # nS
    e_leak: float                            # mV
    channels: list[ChannelPopulation]
    T_K: float = 298.15
    K_out: float = 5.0                       # mM
    K_in: float = 140.0
    Na_out: float = 120.0
    Na_in: float = 15.0
    v_rest_guess: float = -65.0
    e_rev_mode: str = "nernst"               # "nernst": E from concentrations; "fixed_shift": published E_rev, shifted by the Nernst term when K_out changes
    K_ref: float = 5.0                       # mM; reference extracellular K+ of the published E_K (fixed_shift mode)

    def e_rev(self, ch: ChannelPopulation, T_K=None, K_out=None) -> float:
        T = T_K or self.T_K
        if self.e_rev_mode == "fixed_shift":
            if ch.ion == "K":
                return ch.e_rev + R_F * T * np.log((K_out or self.K_out) / self.K_ref)
            return ch.e_rev
        if ch.ion == "K":
            return nernst(T, K_out or self.K_out, self.K_in)
        if ch.ion == "Na":
            return nernst(T, self.Na_out, self.Na_in)
        return ch.e_rev

    def channel(self, name: str) -> ChannelPopulation:
        return [c for c in self.channels if c.name == name][0]


@dataclass
class Protocol:
    kind: str                                # "vclamp" | "cclamp"
    segments: list[tuple[float, float]]      # (start time ms, command value: mV or pA)
    t_end: float
    dt_out: float = 0.05

    def command(self, t: float) -> float:
        v = self.segments[0][1]
        for t0, val in self.segments:
            if t >= t0:
                v = val
        return v

    def breakpoints(self) -> list[float]:
        return sorted({0.0, self.t_end} | {t0 for t0, _ in self.segments if 0.0 < t0 < self.t_end})


@dataclass
class Intervention:
    """Mechanistically interpretable perturbations. All multiplicative scales default to 1."""
    name: str = "none"
    rate_scales: dict = field(default_factory=dict)      # e.g. {"inactivation": 0.3, "recovery": 2.0}
    g_scales: dict = field(default_factory=dict)         # per channel name: density multiplier
    T_K: Optional[float] = None
    K_out: Optional[float] = None
    block_frac: dict = field(default_factory=dict)       # per channel: equilibrium fraction blocked (HH/coarse)
    block_conc: dict = field(default_factory=dict)       # per channel: drug concentration multiplier for state-dependent block (fine)
    i_extra: float = 0.0                                 # constant extra injected current (pA)
    family: str = "id"


@dataclass
class SimSettings:
    rtol: float = 1e-6
    atol: float = 1e-8
    method: str = "LSODA"
    ref_rtol: float = 1e-9
    ref_atol: float = 1e-11
    ref_method: str = "Radau"
    max_step: float = 0.5


def merged_scales(spec: MembraneSpec, interv: Intervention) -> dict:
    """Intrinsic (per-instance) kinetic multipliers composed with the intervention's."""
    scales: dict = {}
    for ch in spec.channels:
        for k, v in ch.intrinsic_scales.items():
            scales[k] = scales.get(k, 1.0) * v
    for k, v in interv.rate_scales.items():
        scales[k] = scales.get(k, 1.0) * v
    for ch in spec.channels:
        # drug concentration multiplier of the state-dependent block transition (0 = no drug)
        scales[f"block_on:{ch.name}"] = float(interv.block_conc.get(ch.name, 0.0))
    return scales


def _layout(spec: MembraneSpec, fidelity: dict, kind: str):
    """Return list of (channel, level, slice) and total dimension."""
    off = 1 if kind == "cclamp" else 0
    blocks = []
    for ch in spec.channels:
        lvl = int(fidelity.get(ch.name, 1))
        n = ch.n_state(lvl)
        blocks.append((ch, lvl, slice(off, off + n)))
        off += n
    return blocks, off


def _initial_state(spec: MembraneSpec, blocks, V0: float, T_K: float, scales: dict, kind: str, dim: int):
    y = np.zeros(dim)
    if kind == "cclamp":
        y[0] = V0
    for ch, lvl, sl in blocks:
        if lvl == 2:
            y[sl] = ch.markov.steady_state(V0, T_K, scales)
        elif lvl == 1:
            y[sl] = [g.x_inf(V0, T_K, scales) for g in ch.hh_gates]
        else:
            y[sl] = [ch.hh_gates[k].x_inf(V0, T_K, scales) for k in ch.coarse_dynamic()]
    return y


def _channel_current(ch: ChannelPopulation, lvl: int, ys: np.ndarray, V: float, T_K: float, scales: dict,
                     e_rev: float, g_scale: float, block: float) -> float:
    if lvl == 2:
        po = float(ys @ ch.markov.open)
    else:
        po = ch.po_from_values(ch.gate_values(lvl, ys, V, T_K, scales))
    g_eff = ch.g_max * (1.0 if lvl == 2 else ch.g_scale_cheap)
    return g_eff * g_scale * (1.0 - block) * po * (V - e_rev)


def simulate(spec: MembraneSpec, protocol: Protocol, fidelity: dict, interv: Intervention | None = None,
             settings: SimSettings | None = None, reference: bool = False) -> dict:
    """Integrate the membrane/channel system. Returns time grid, V, total and per-channel currents,
    state trajectories, and cost measures."""
    interv = interv or Intervention()
    settings = settings or SimSettings()
    t_wall = time.perf_counter()
    T_K = interv.T_K or spec.T_K
    K_out = interv.K_out or spec.K_out
    scales = merged_scales(spec, interv)
    kind = protocol.kind
    blocks, dim = _layout(spec, fidelity, kind)
    e_revs = {ch.name: spec.e_rev(ch, T_K, K_out) for ch in spec.channels}
    g_scales = {ch.name: interv.g_scales.get(ch.name, 1.0) for ch in spec.channels}
    # equilibrium block applies to HH/coarse levels; the fine level uses the state-dependent block
    blocks_frac = {ch.name: interv.block_frac.get(ch.name, 0.0) for ch in spec.channels}
    V0 = protocol.segments[0][1] if kind == "vclamp" else spec.v_rest_guess
    if kind == "cclamp":
        V0 = _find_rest(spec, blocks, T_K, scales, e_revs, g_scales, blocks_frac, interv.i_extra + protocol.segments[0][1])
    y0 = _initial_state(spec, blocks, V0, T_K, scales, kind, dim)
    coarse_idx = {ch.name: ch.coarse_dynamic() for ch in spec.channels}

    def rhs(t, y, cmd):
        dy = np.zeros_like(y)
        V = y[0] if kind == "cclamp" else cmd
        I_ion = 0.0
        for ch, lvl, sl in blocks:
            ys = y[sl]
            blk = blocks_frac[ch.name] if lvl < 2 else 0.0
            I_ion += _channel_current(ch, lvl, ys, V, T_K, scales, e_revs[ch.name], g_scales[ch.name], blk)
            if lvl == 2:
                Q = ch.markov.Q(V, T_K, scales)
                dy[sl] = ys @ Q
            elif lvl == 1:
                dy[sl] = [g.dxdt(x, V, T_K, scales) for g, x in zip(ch.hh_gates, ys)]
            else:
                dy[sl] = [ch.hh_gates[k].dxdt(ys[i], V, T_K, scales) for i, k in enumerate(coarse_idx[ch.name])]
        if kind == "cclamp":
            I_leak = spec.g_leak * (V - spec.e_leak)
            dy[0] = (cmd + interv.i_extra - I_ion - I_leak) / spec.C
        return dy

    t_grid = np.arange(0.0, protocol.t_end + 1e-9, protocol.dt_out)
    Y = np.zeros((len(t_grid), dim)); Y[0] = y0
    nfev = 0
    y = y0.copy()
    bps = protocol.breakpoints()
    method = settings.ref_method if reference else settings.method
    rtol = settings.ref_rtol if reference else settings.rtol
    atol = settings.ref_atol if reference else settings.atol
    for lo, hi in zip(bps[:-1], bps[1:]):
        cmd = protocol.command(lo + 1e-9)
        mask = (t_grid > lo + 1e-12) & (t_grid <= hi + 1e-12)
        t_eval = list(t_grid[mask])
        if not t_eval or abs(t_eval[-1] - hi) > 1e-9:
            t_eval.append(hi)
        sol = solve_ivp(rhs, (lo, hi), y, args=(cmd,), method=method, rtol=rtol, atol=atol,
                        t_eval=t_eval, max_step=settings.max_step)
        if not sol.success:
            raise RuntimeError(f"integration failed: {sol.message}")
        nfev += sol.nfev
        n_eval = int(mask.sum())
        if n_eval:
            Y[mask] = sol.y[:, :n_eval].T
        y = sol.y[:, -1]
    # outputs
    V_t = Y[:, 0] if kind == "cclamp" else np.array([protocol.command(t + 1e-9) for t in t_grid])
    I_ch = {}
    for ch, lvl, sl in blocks:
        blk = blocks_frac[ch.name] if lvl < 2 else 0.0
        I_ch[ch.name] = np.array([_channel_current(ch, lvl, Y[i, sl], V_t[i], T_K, scales, e_revs[ch.name],
                                                   g_scales[ch.name], blk) for i in range(len(t_grid))])
    I_total = sum(I_ch.values())
    state_dim = dim - (1 if kind == "cclamp" else 0)
    wall = time.perf_counter() - t_wall
    return {"t": t_grid, "V": V_t, "I": I_total, "I_ch": I_ch, "Y": Y, "blocks": [(ch.name, lvl) for ch, lvl, _ in blocks],
            "nfev": nfev, "state_dim": state_dim, "cost": float(nfev * state_dim), "wall": wall,
            "levels": {ch.name: lvl for ch, lvl, _ in blocks}, "V0": V0}


def steady_current(spec: MembraneSpec, V: float, levels: dict, T_K: float, scales: dict, e_revs: dict,
                   g_scales: dict, blocks_frac: dict) -> float:
    """Net steady-state membrane current (ionic + leak) at voltage V with every channel at its
    steady state; positive = outward."""
    I = spec.g_leak * (V - spec.e_leak)
    for ch in spec.channels:
        lvl = levels[ch.name]
        if lvl == 2:
            po = float(ch.markov.steady_state(V, T_K, scales) @ ch.markov.open); blk = 0.0
        else:
            po = ch.po_inf(V, T_K, scales); blk = blocks_frac[ch.name]
        g_eff = ch.g_max * (1.0 if lvl == 2 else ch.g_scale_cheap)
        I += g_eff * g_scales[ch.name] * (1 - blk) * po * (V - e_revs[ch.name])
    return I


def _find_rest(spec, blocks, T_K, scales, e_revs, g_scales, blocks_frac, i_hold: float, V_lo=-100.0, V_hi=0.0) -> float:
    """Resting potential by bisection on the steady-state current balance (all channels at steady state)."""
    levels = {ch.name: lvl for ch, lvl, _ in blocks}

    def net(V):
        return steady_current(spec, V, levels, T_K, scales, e_revs, g_scales, blocks_frac) - i_hold
    # scan upward from V_lo and take the most hyperpolarised stable root (a membrane with a
    # sodium window current can be bistable; the physiological rest is the lower state)
    grid = np.arange(V_lo, V_hi + 1e-9, 0.5)
    vals = np.array([net(v) for v in grid])
    idx = np.where((vals[:-1] < 0) & (vals[1:] >= 0))[0]
    if len(idx) == 0:
        return spec.v_rest_guess
    lo, hi = grid[idx[0]], grid[idx[0] + 1]
    flo = vals[idx[0]]
    for _ in range(60):
        mid = 0.5 * (lo + hi); fm = net(mid)
        if flo * fm <= 0:
            hi = mid
        else:
            lo, flo = mid, fm
    return 0.5 * (lo + hi)

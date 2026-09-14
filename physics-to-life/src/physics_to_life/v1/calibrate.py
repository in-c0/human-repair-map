"""Curve extraction and calibration of cheap levels to the fine level or to observations.

`extract_curves` runs standard voltage-clamp protocols at a given fidelity and returns
the quantities an electrophysiologist reports: steady-state activation (G/Gmax vs V),
activation time-to-peak / rise time constant, inactivation time constant at each step,
and recovery from inactivation.  `fit_hh_gates` fits Boltzmann + bell-shaped-tau gates to
those curves so that the medium level is a *calibrated* reduced model of the fine level
(or of published data), rather than an arbitrary one.
"""
from __future__ import annotations

import numpy as np
from scipy.optimize import least_squares

from .channels import HHGate, ChannelPopulation
from .membrane import MembraneSpec, simulate, SimSettings, Intervention
from .parameters import vclamp_activation, vclamp_recovery


def extract_curves(spec: MembraneSpec, ch_name: str, level: int, steps=None, hold=-80.0, t_step=60.0,
                   interv=None, settings=None, recovery_intervals=(2.0, 5.0, 10.0, 20.0, 40.0, 80.0)) -> dict:
    steps = np.arange(-60.0, 61.0, 10.0) if steps is None else np.asarray(steps, float)
    fid = {c.name: level for c in spec.channels}
    T = (interv.T_K if interv and interv.T_K else spec.T_K)
    ch = [c for c in spec.channels if c.name == ch_name][0]
    e_rev = spec.e_rev(ch, T, interv.K_out if interv and interv.K_out else None)
    g_peak, t_peak, tau_inact, tau_rise = [], [], [], []
    for V in steps:
        r = simulate(spec, vclamp_activation(V, hold=hold, t_pre=20.0, t_step=t_step), fid, interv, settings)
        t = r["t"]; I = r["I_ch"][ch_name]; m = (t >= 20.0) & (t <= 20.0 + t_step)
        Iw, tw = I[m], t[m] - 20.0
        drive = V - e_rev
        g = Iw / drive if abs(drive) > 1e-6 else np.zeros_like(Iw)
        k = int(np.argmax(np.abs(g)))
        g_peak.append(abs(g[k])); t_peak.append(tw[k])
        # rise: time to reach 1/2 of peak conductance
        half = np.where(np.abs(g[:k + 1]) >= 0.5 * abs(g[k]))[0]
        tau_rise.append(tw[half[0]] if len(half) else np.nan)
        # decay after the peak: single-exponential fit of g(t) - g(end)
        gd = np.abs(g[k:]) - abs(g[-1]); td = tw[k:] - tw[k]
        if len(gd) > 10 and gd[0] > 1e-6 * max(abs(g[k]), 1e-9):
            valid = gd > 0.05 * gd[0]
            if valid.sum() > 5:
                slope = np.polyfit(td[valid], np.log(gd[valid]), 1)[0]
                tau_inact.append(-1.0 / slope if slope < 0 else np.nan)
            else:
                tau_inact.append(np.nan)
        else:
            tau_inact.append(np.nan)
    g_peak = np.array(g_peak); gmax = g_peak.max() if g_peak.max() > 0 else 1.0
    rec = []
    for dt in recovery_intervals:
        r = simulate(spec, vclamp_recovery(dt, step_mV=20.0, hold=hold), fid, interv, settings)
        t = r["t"]; I = np.abs(r["I_ch"][ch_name])
        p1 = I[(t >= 20.0) & (t <= 60.0)].max(); p2 = I[(t >= 60.0 + dt) & (t <= 100.0 + dt)].max()
        rec.append(p2 / p1 if p1 > 1e-12 else np.nan)
    return {"steps": steps, "g_norm": g_peak / gmax, "gmax": gmax, "t_peak": np.array(t_peak), "t_half_rise": np.array(tau_rise),
            "tau_inact": np.array(tau_inact), "recovery_intervals": np.array(recovery_intervals), "recovery": np.array(rec)}


def boltzmann(V, v_half, slope):
    return 1.0 / (1.0 + np.exp(-(V - v_half) / slope))


def bell_tau(V, tau_min, tau_amp, v_c, width):
    return tau_min + tau_amp / (np.exp((V - v_c) / width) + np.exp(-(V - v_c) / width))


def fit_hh_gates(curves: dict, power: int = 4) -> tuple[HHGate, HHGate]:
    """Fit m-gate (Boltzmann^power steady state, bell tau) and h-gate (tau from decay, h_inf from
    steady state of a prepulse-style assumption) to extracted curves.  Returns (m, h)."""
    V = curves["steps"]; g = curves["g_norm"]
    # activation: g_norm ~ m_inf^power * (fraction not yet inactivated at peak ~ 1)
    def res_m(p):
        return boltzmann(V, p[0], p[1]) ** power - g
    pm = least_squares(res_m, x0=[-20.0, 8.0], bounds=([-90, 1.0], [60, 40.0])).x
    # activation tau from half-rise time: t_half ~ tau * ln(...)  -> use t_half / 0.7 as a proxy
    th = curves["t_half_rise"]; ok = np.isfinite(th) & (g > 0.05)
    def res_tau(p):
        return bell_tau(V[ok], *p) - th[ok] / 0.7
    pt = least_squares(res_tau, x0=[0.5, 5.0, -20.0, 20.0], bounds=([0.05, 0.0, -100, 3.0], [50.0, 200.0, 80, 100.0])).x
    m = HHGate(v_half=float(pm[0]), slope=float(pm[1]), tau_fn=(lambda V_, T, p=pt: bell_tau(np.asarray(V_, float), *p)), power=power, scale_key="activation")
    ti = curves["tau_inact"]; oki = np.isfinite(ti) & (g > 0.2)
    def res_ti(p):
        return bell_tau(V[oki], *p) - ti[oki]
    pi = least_squares(res_ti, x0=[2.0, 20.0, -30.0, 20.0], bounds=([0.1, 0.0, -100, 3.0], [200.0, 2000.0, 80, 100.0])).x if oki.sum() >= 3 else np.array([5.0, 20.0, -30.0, 20.0])
    # h_inf: assume inactivation midpoint ~ 20 mV hyperpolarised of activation midpoint with slope -6 (to be
    # refined from a prepulse protocol when available)
    h = HHGate(v_half=float(pm[0] - 25.0), slope=-6.0, tau_fn=(lambda V_, T, p=pi: bell_tau(np.asarray(V_, float), *p)), power=1, scale_key="inactivation")
    return m, h


def calibrate_medium_to_fine(spec: MembraneSpec, ch_name: str, power: int = 4, settings=None) -> ChannelPopulation:
    """Replace a channel's HH gates with gates fitted to its own fine (Markov) level."""
    curves = extract_curves(spec, ch_name, level=2, settings=settings)
    m, h = fit_hh_gates(curves, power=power)
    ch = [c for c in spec.channels if c.name == ch_name][0]
    ch.hh_gates = [m, h]
    ch.coarse_instant = [True, False]
    return ch

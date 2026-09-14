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

from .channels import HHGate, ChannelPopulation, BellTau
from .membrane import MembraneSpec, simulate, SimSettings, Intervention
from .parameters import vclamp_activation, vclamp_recovery, vclamp_inactivation


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
    # steady-state inactivation from a prepulse family
    prepulses = np.arange(-100.0, 21.0, 10.0)
    h_peaks = []
    for vp in prepulses:
        r = simulate(spec, vclamp_inactivation(vp, hold=-100.0), fid, interv, settings)
        t = r["t"]; I = np.abs(r["I_ch"][ch_name]); h_peaks.append(I[(t >= 220.0) & (t <= 280.0)].max())
    h_peaks = np.array(h_peaks); h_inf = h_peaks / (h_peaks.max() if h_peaks.max() > 0 else 1.0)
    return {"steps": steps, "g_norm": g_peak / gmax, "gmax": gmax, "t_peak": np.array(t_peak), "t_half_rise": np.array(tau_rise),
            "tau_inact": np.array(tau_inact), "recovery_intervals": np.array(recovery_intervals), "recovery": np.array(rec),
            "prepulses": prepulses, "h_inf": h_inf, "hold": hold}


def boltzmann(V, v_half, slope):
    return 1.0 / (1.0 + np.exp(-(V - v_half) / slope))


def bell_tau(V, tau_min, tau_amp, v_c, width):
    return tau_min + tau_amp / (np.exp((V - v_c) / width) + np.exp(-(V - v_c) / width))


def fit_hh_gates(curves: dict, power: int = 4) -> tuple[HHGate, HHGate]:
    """Fit an m-gate (Boltzmann^power steady state, bell-shaped tau) and an h-gate (Boltzmann
    steady state from the prepulse family, bell-shaped tau from the decay time constants and
    the recovery time constant at the holding potential) to extracted curves."""
    V = curves["steps"]; g = curves["g_norm"]
    # --- activation steady state: G/Gmax = (m_inf^p * h_at_peak) / max(...) ~ m_inf^p up to normalisation
    def res_m(p):
        return boltzmann(V, p[0], p[1]) ** power / max(boltzmann(V, p[0], p[1]).max() ** power, 1e-9) - g
    pm = least_squares(res_m, x0=[-20.0, 8.0], bounds=([-90, 1.0], [60, 40.0])).x
    # --- activation tau from the half-rise time of an m^p gate: t_half = -tau * ln(1 - 0.5^(1/p))
    factor = -np.log(1.0 - 0.5 ** (1.0 / power))
    th = curves["t_half_rise"]; ok = np.isfinite(th) & (th > 0) & (g > 0.05)
    def res_tau(p):
        return bell_tau(V[ok], *p) - th[ok] / factor
    pt = least_squares(res_tau, x0=[0.3, 3.0, -20.0, 20.0], bounds=([0.02, 0.0, -120, 3.0], [50.0, 200.0, 80, 150.0])).x
    m = HHGate(v_half=float(pm[0]), slope=float(pm[1]), tau_fn=BellTau(*[float(v) for v in pt]), power=power, scale_key="activation")
    # --- inactivation steady state from the prepulse family
    Vp = curves["prepulses"]; hi = curves["h_inf"]
    def res_h(p):
        return boltzmann(Vp, p[0], p[1]) - hi
    ph = least_squares(res_h, x0=[-50.0, -6.0], bounds=([-120, -40.0], [40, -0.5])).x
    # --- inactivation tau: decay tau at each step voltage + recovery tau at the holding potential
    ti = curves["tau_inact"]; oki = np.isfinite(ti) & (g > 0.2)
    Vt = list(V[oki]); Tt = list(ti[oki])
    rec, dts = curves["recovery"], curves["recovery_intervals"]
    okr = np.isfinite(rec) & (rec < 0.98)
    if okr.sum() >= 2:
        # recovery(dt) = 1 - (1 - r0) exp(-dt/tau): fit tau on log(1 - rec)
        y = np.log(np.clip(1.0 - rec[okr], 1e-6, None)); slope = np.polyfit(dts[okr], y, 1)[0]
        if slope < 0:
            Vt.append(curves["hold"]); Tt.append(-1.0 / slope)
    Vt, Tt = np.array(Vt), np.array(Tt)
    def res_ti(p):
        return (bell_tau(Vt, *p) - Tt) / np.maximum(Tt, 1e-3)
    pi = least_squares(res_ti, x0=[2.0, 20.0, -40.0, 20.0], bounds=([0.1, 0.0, -120, 3.0], [500.0, 5000.0, 80, 150.0])).x if len(Vt) >= 3 else np.array([5.0, 20.0, -40.0, 20.0])
    h = HHGate(v_half=float(ph[0]), slope=float(ph[1]), tau_fn=BellTau(*[float(v) for v in pi]), power=1, scale_key="inactivation")
    return m, h


def calibrate_medium_to_fine(spec: MembraneSpec, ch_name: str, power: int = 4, settings=None) -> ChannelPopulation:
    """Replace a channel's HH gates with gates fitted to its own fine (Markov) level."""
    curves = extract_curves(spec, ch_name, level=2, settings=settings)
    m, h = fit_hh_gates(curves, power=power)
    ch = [c for c in spec.channels if c.name == ch_name][0]
    ch.hh_gates = [m, h]
    ch.coarse_instant = [True, False]
    return ch


# ---------------------------------------------------------------------------
# direct trace fit (the standard way HH models are fitted to voltage-clamp data)
# ---------------------------------------------------------------------------

def _hh_vclamp_current(params, power, protocol, t, e_rev, g_max):
    """Analytic HH current under piecewise-constant voltage clamp.
    params = [m_vh, m_sl, m_tmin, m_tamp, m_vc, m_w, h_vh, h_sl, h_tmin, h_tamp, h_vc, h_w, g_scale]"""
    mv, ms, mt0, mta, mvc, mw, hv, hs, ht0, hta, hvc, hw, gsc = params
    V = np.array([protocol.command(tt + 1e-9) for tt in t])
    m = np.zeros_like(t); h = np.zeros_like(t)
    V0 = V[0]
    m_cur = boltzmann(V0, mv, ms); h_cur = boltzmann(V0, hv, hs)
    bps = protocol.breakpoints()
    for lo, hi in zip(bps[:-1], bps[1:]):
        Vs = protocol.command(lo + 1e-9)
        m_inf = boltzmann(Vs, mv, ms); h_inf = boltzmann(Vs, hv, hs)
        tau_m = bell_tau(Vs, mt0, mta, mvc, mw); tau_h = bell_tau(Vs, ht0, hta, hvc, hw)
        mask = (t >= lo - 1e-12) & (t <= hi + 1e-12)
        tt = t[mask] - lo
        m[mask] = m_inf + (m_cur - m_inf) * np.exp(-tt / tau_m)
        h[mask] = h_inf + (h_cur - h_inf) * np.exp(-tt / tau_h)
        m_cur = m_inf + (m_cur - m_inf) * np.exp(-(hi - lo) / tau_m)
        h_cur = h_inf + (h_cur - h_inf) * np.exp(-(hi - lo) / tau_h)
    return g_max * gsc * m ** power * h * (V - e_rev)


def fit_protocols(hold=-80.0):
    """Protocol family used for calibration: activation steps, prepulse inactivation, recovery."""
    prots = [vclamp_activation(V, hold=hold, t_pre=20.0, t_step=60.0, dt_out=0.1) for V in (-40.0, -20.0, 0.0, 20.0, 40.0, 60.0)]
    prots += [vclamp_inactivation(vp, hold=-100.0, dt_out=0.1) for vp in (-100.0, -80.0, -60.0, -40.0, -20.0)]
    prots += [vclamp_recovery(dt, step_mV=20.0, hold=hold, dt_out=0.1) for dt in (5.0, 20.0, 60.0)]
    # long holds near physiological rest: steady-state currents must match there too
    from .membrane import Protocol
    prots += [Protocol("vclamp", [(0.0, hold), (20.0, vh)], 220.0, 0.5) for vh in (-90.0, -70.0, -55.0)]
    return prots


def fit_hh_to_traces(spec: MembraneSpec, ch_name: str, power: int = 4, protocols=None, settings=None,
                     n_starts: int = 3, seed: int = 0, level_truth: int = 2) -> tuple[HHGate, HHGate, float, dict]:
    """Fit HH gates (and an effective conductance factor) of channel `ch_name` to the traces of
    its own fine level (or another level) across a family of protocols.  Returns (m, h, g_scale, info)."""
    ch = [c for c in spec.channels if c.name == ch_name][0]
    single = MembraneSpec(C=spec.C, g_leak=0.0, e_leak=spec.e_leak, channels=[ch], T_K=spec.T_K, K_out=spec.K_out, K_in=spec.K_in,
                          Na_out=spec.Na_out, Na_in=spec.Na_in)
    e_rev = spec.e_rev(ch)
    protocols = protocols or fit_protocols()
    truth = [simulate(single, pr, {ch_name: level_truth}, settings=settings) for pr in protocols]
    ts = [r["t"] for r in truth]; Is = [r["I_ch"][ch_name] for r in truth]
    scale = max(np.max(np.abs(I)) for I in Is) + 1e-12
    def resid(p):
        out = []
        for pr, t, I in zip(protocols, ts, Is):
            out.append((_hh_vclamp_current(p, power, pr, t, e_rev, ch.g_max) - I) / scale)
        return np.concatenate(out)
    lb = [-100, 1.0, 0.02, 0.0, -120, 3.0, -120, -40.0, 0.1, 0.0, -120, 3.0, 0.05]
    ub = [60, 40.0, 50.0, 200.0, 80, 150.0, 40, -0.5, 500.0, 5000.0, 80, 150.0, 10.0]
    rng = np.random.default_rng(seed)
    best = None
    for k in range(n_starts):
        x0 = [-20.0 + rng.normal(0, 10), 8.0 + rng.uniform(-3, 8), 0.3, 3.0, -20.0, 20.0, -50.0 + rng.normal(0, 10), -6.0, 3.0, 20.0, -40.0, 20.0, 1.0]
        x0 = np.clip(x0, lb, ub)
        sol = least_squares(resid, x0=x0, bounds=(lb, ub), loss="soft_l1", f_scale=0.05, max_nfev=400)
        if best is None or sol.cost < best.cost:
            best = sol
    pbest = best.x
    m = HHGate(v_half=float(pbest[0]), slope=float(pbest[1]), tau_fn=BellTau(*[float(v) for v in pbest[2:6]]), power=power, scale_key="activation")
    h = HHGate(v_half=float(pbest[6]), slope=float(pbest[7]), tau_fn=BellTau(*[float(v) for v in pbest[8:12]]), power=1, scale_key="inactivation")
    rel_rmse = float(np.sqrt(np.mean(resid(pbest) ** 2)))
    return m, h, float(pbest[12]), {"rel_rmse": rel_rmse, "params": pbest.tolist(), "n_protocols": len(protocols)}


def calibrate_medium_to_fine_traces(spec: MembraneSpec, ch_name: str, power: int = 4, settings=None, **kw) -> dict:
    """Replace a channel's HH gates (and cheap conductance factor) with a trace fit to its fine level."""
    m, h, gsc, info = fit_hh_to_traces(spec, ch_name, power=power, settings=settings, **kw)
    ch = [c for c in spec.channels if c.name == ch_name][0]
    ch.hh_gates = [m, h]; ch.coarse_instant = [True, False]; ch.g_scale_cheap = gsc
    return info

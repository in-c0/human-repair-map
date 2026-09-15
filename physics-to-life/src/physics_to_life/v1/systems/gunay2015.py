"""Günay et al. (2015) isopotential aCC/MN1-Ib larval motoneuron model, ported verbatim.

Source (verified, read locally after `git clone`):
  github.com/cengique/drosophila-aCC-L3-motoneuron-model (= ModelDB 152028),
  file xpp-models/isopotential.ode; cross-checked line by line against the NeuroML2 port in
  the same repository (NeuroML2/isopotential_NeuroML2/*.channel.nml) and against the Python
  reimplementation of the same channel set in Megwa et al. 2023 (ModelDB 267620,
  FlyMotoneuronWithPump_Megwa2023_version230129.PY).  Paper: Günay C, Sieling FH, Dharmar L,
  Lin W-H, Wolfram V, Marley R, Baines RA, Prinz AA (2015) PLoS Comput Biol 11(5):e1004189
  (Table 5 gating functions, Table 6 conductances; full text read from the JATS XML mirror).

Units: mV, ms, nS, pA, pF.  Published values (all from the XPP file):
  C = 4 pF; g_leak = 6.8 nS, E_leak = -55 mV; E_K = -80 mV; E_Na = +45 mV.
  Ks  (slow K, Shab-like)    g = 50 nS,  m^4
      m_inf = 1/(1+exp((V+12.85)/(-19.91)))       tau_m = 2.03 + 1.96/(1+exp((V-29.83)/3.32))
  Kf  (fast K, A-type)       g = 24.1 nS, m^4 (0.95 h1 + 0.05 h2)
      m_inf = 1/(1+exp((V+17.55)/(-7.27)))        tau_m = 1.94 + 2.66/(1+exp((V-8.12)/7.96))
      h1_inf = 1/(1+exp((V+45)/6))                tau_h1 = 1.79 + 515.8/(1+exp((V+147.4)/28.66))
      h2_inf = 1/(1+exp((V+44.2)/1.5))            tau_h2 = 116 ms
  NaT (O'Dowd & Aldrich 1988) g = 100 nS, m^3 h
      m_inf = 1/(1+exp((V+29.13)/(-8.922)))       tau_m = 3.861 - 3.434/(1+exp((V+51.35)/(-5.98)))
      h_inf = 1/(1+exp((V+40)/6.048))             tau_h = 2.834 - 2.371/(1+exp((V+21.9)/(-2.641)))
  NaP (DmNav10; Lin 2012)    g = 0.8 nS,  m
      m_inf = 1/(1+exp((V+48.77)/(-3.68)))        tau_m = 1 ms
  Stimulus: I = -12 pA holding; I = Ipulse from t = 10 ms to 510 ms; total 530 ms.
  Integrator used by the authors: forward Euler, dt = 0.001 ms.
  Settled state at I = -12 pA (XPP 'info' export, quoted in the file):
      V = -54.56137733296305, mKs = 0.10958410153422569, mKf = 0.0061144119486309977,
      hKf = 0.83111678624803209, hKf2 = 0.99900082893646969, mNa = 0.054660015811734484,
      hNa = 0.91740767131784051, mNaP = 0.17168333245095557.

The XPP file annotates h2_inf with "mistake; should be hinfK == hinfK2".  The NeuroML2 port
and Megwa 2023 keep h2_inf as written (midpoint -44.2 mV, slope 1.5 mV), so this port keeps
it by default (`h2_as_written=True`).  The published model has no temperature dependence
and fixed reversal potentials; the Q10 and Nernst-shift hooks used by the V1 intervention
families are additions (documented in ADR-0007) that leave the model unchanged at the
reference temperature and [K+]o.

The published model is the *medium* (HH) level of the V1 hierarchy.  In this module every
channel's fine (Markov) level is the chain exactly equivalent to its HH gates, so that
fine == medium by construction: this is the numerical anchor.  The kinetically richer fine
levels for Kf and NaT are constructed and fitted in `gunay2015_fine.py`.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

from ..channels import HHGate, SigmoidTau, ConstTau, ChannelPopulation, sequential_scheme_from_gate
from ..membrane import MembraneSpec, Protocol

# ---------------------------------------------------------------------------
# published constants
# ---------------------------------------------------------------------------
C_M = 4.0
G_LEAK, E_LEAK = 6.8, -55.0
E_K, E_NA = -80.0, 45.0
G_KS, G_KF, G_NAT, G_NAP = 50.0, 24.1, 100.0, 0.8
FH = 0.95
I_HOLD = -12.0
T_PULSE_ON, T_PULSE_OFF, T_TOTAL = 10.0, 510.0, 530.0
T_REF_K = 298.15            # reference temperature assigned to the published (room-temperature) kinetics
K_OUT_REF = 5.0             # mM; reference [K+]o assigned to the published E_K

XPP_SETTLED_STATE = {"V": -54.56137733296305, "mKs": 0.10958410153422569, "mKf": 0.0061144119486309977,
                     "hKf": 0.83111678624803209, "hKf2": 0.99900082893646969, "mNa": 0.054660015811734484,
                     "hNa": 0.91740767131784051, "mNaP": 0.17168333245095557}


# ---------------------------------------------------------------------------
# gates (published tables) with scale keys shared by every fidelity level
# ---------------------------------------------------------------------------

def ks_gate(q10: float = 1.0) -> HHGate:
    return HHGate(v_half=-12.85, slope=19.91, tau_fn=SigmoidTau(2.03, 1.96, 29.83, 3.32), power=4,
                  scale_key="ks_activation", q10=q10, t_ref=T_REF_K)


def kf_gates(q10: float = 1.0, h2_as_written: bool = True) -> list[HHGate]:
    m = HHGate(v_half=-17.55, slope=7.27, tau_fn=SigmoidTau(1.94, 2.66, 8.12, 7.96), power=4,
               scale_key="kf_activation", q10=q10, t_ref=T_REF_K)
    h1 = HHGate(v_half=-45.0, slope=-6.0, tau_fn=SigmoidTau(1.79, 515.8, -147.4, 28.66), power=1,
                scale_key_on="kf_recovery", scale_key_off="kf_inactivation", q10=q10, t_ref=T_REF_K)
    h2 = HHGate(v_half=-44.2 if h2_as_written else -45.0, slope=-1.5 if h2_as_written else -6.0,
                tau_fn=ConstTau(116.0), power=1, scale_key_on="kf_c_recovery", scale_key_off="kf_c_inactivation",
                q10=q10, t_ref=T_REF_K)
    return [m, h1, h2]


def nat_gates(q10: float = 1.0) -> list[HHGate]:
    m = HHGate(v_half=-29.13, slope=8.922, tau_fn=SigmoidTau(3.861, -3.434, -51.35, -5.98), power=3,
               scale_key="nat_activation", q10=q10, t_ref=T_REF_K)
    h = HHGate(v_half=-40.0, slope=-6.048, tau_fn=SigmoidTau(2.834, -2.371, -21.9, -2.641), power=1,
               scale_key_on="nat_recovery", scale_key_off="nat_inactivation", q10=q10, t_ref=T_REF_K)
    return [m, h]


def nap_gate(q10: float = 1.0) -> HHGate:
    return HHGate(v_half=-48.77, slope=3.68, tau_fn=ConstTau(1.0), power=1, scale_key="nap_activation",
                  q10=q10, t_ref=T_REF_K)


# ---------------------------------------------------------------------------
# channels and membrane (fine level = exact HH-equivalent chain)
# ---------------------------------------------------------------------------

def channel_ks(q10: float = 1.0) -> ChannelPopulation:
    n = ks_gate(q10)
    return ChannelPopulation("Ks", G_KS, E_K, sequential_scheme_from_gate(n, 4, "Ks_hh_equivalent"), [n],
                             coarse_instant=[True], ion="K", hh_exact=True)


def channel_kf(q10: float = 1.0, h2_as_written: bool = True) -> ChannelPopulation:
    """Fine level here: the chain equivalent to m^4 with the two-component inactivation carried
    as two independent gates — i.e. exactly the HH description (hh_exact)."""
    m, h1, h2 = kf_gates(q10, h2_as_written)
    # exact chain: product of an m^4 chain and two 2-state chains is a 5x2x2 = 20-state chain; we
    # keep the HH-equivalent bookkeeping simple by using the m^4 chain and treating h1, h2 as HH
    # gates inside a "mixed" Markov object is not possible in this representation, so the
    # exact-equivalent fine level for Kf is built as the full tensor-product chain.
    scheme = _tensor_product_chain([sequential_scheme_from_gate(m, 4, "Kf_m4"),
                                    sequential_scheme_from_gate(h1, 1, "Kf_h1"),
                                    sequential_scheme_from_gate(h2, 1, "Kf_h2")],
                                   open_fn=lambda idx: (1.0 if idx[0] == 4 else 0.0) * (FH * idx[1] + (1 - FH) * idx[2]),
                                   name="Kf_hh_equivalent")
    return ChannelPopulation("Kf", G_KF, E_K, scheme, [m, h1, h2], coarse_instant=[True, False, False], ion="K",
                             hh_exact=True, hh_mix=(1, 2, FH), coarse_drop=[False, False, True])


def channel_nat(q10: float = 1.0) -> ChannelPopulation:
    m, h = nat_gates(q10)
    scheme = _tensor_product_chain([sequential_scheme_from_gate(m, 3, "NaT_m3"), sequential_scheme_from_gate(h, 1, "NaT_h")],
                                   open_fn=lambda idx: 1.0 if (idx[0] == 3 and idx[1] == 1) else 0.0, name="NaT_hh_equivalent")
    return ChannelPopulation("NaT", G_NAT, E_NA, scheme, [m, h], coarse_instant=[True, False], ion="Na", hh_exact=True)


def channel_nap(q10: float = 1.0) -> ChannelPopulation:
    m = nap_gate(q10)
    return ChannelPopulation("NaP", G_NAP, E_NA, sequential_scheme_from_gate(m, 1, "NaP_hh_equivalent"), [m],
                             coarse_instant=[True], ion="Na", hh_exact=True)


def _tensor_product_chain(chains, open_fn, name: str):
    """Kronecker-product Markov chain of independent sub-chains (exact HH equivalence for a
    product of independent gates).  State index = tuple of sub-chain states."""
    from itertools import product
    from ..channels import MarkovScheme, Transition
    sizes = [c.n_states for c in chains]
    states = list(product(*[range(n) for n in sizes]))
    index = {s: i for i, s in enumerate(states)}
    trans = []
    for s in states:
        for k, c in enumerate(chains):
            for tr in c.transitions:
                if tr.src == s[k]:
                    t = list(s); t[k] = tr.dst
                    trans.append(Transition(index[s], index[tuple(t)], tr.rate, tr.scale_key))
    open_ = np.array([open_fn(s) for s in states])
    return MarkovScheme(name, len(states), trans, open_, initial_state=0)


def gunay2015_membrane(q10: float = 1.0, h2_as_written: bool = True) -> MembraneSpec:
    """The published isopotential model; every channel at its exact HH-equivalent fine level."""
    return MembraneSpec(C=C_M, g_leak=G_LEAK, e_leak=E_LEAK,
                        channels=[channel_ks(q10), channel_kf(q10, h2_as_written), channel_nat(q10), channel_nap(q10)],
                        T_K=T_REF_K, K_out=K_OUT_REF, v_rest_guess=-55.0, e_rev_mode="fixed_shift", K_ref=K_OUT_REF)


# ---------------------------------------------------------------------------
# published stimulus protocol
# ---------------------------------------------------------------------------

def gunay_cclamp(i_pulse: float, i_hold: float = I_HOLD, t_on: float = T_PULSE_ON, t_off: float = T_PULSE_OFF,
                 t_end: float = T_TOTAL, dt_out: float = 0.05) -> Protocol:
    """Günay 2015 current-clamp protocol: hold at i_hold, step to the absolute value i_pulse."""
    return Protocol("cclamp", [(0.0, i_hold), (t_on, i_pulse), (t_off, i_hold)], t_end, dt_out)


# ---------------------------------------------------------------------------
# the authors' integrator: forward Euler on the XPP equations (independent of the
# ChannelPopulation/simulate machinery; used only for cross-implementation checks)
# ---------------------------------------------------------------------------

def xpp_rhs(y, I, h2_as_written: bool = True):
    V, mKs, mKf, hKf, hKf2, mNa, hNa, mNaP = y
    e = math.exp
    minfKs = 1 / (1 + e((V + 12.85) / (-19.91))); mtauKs = 2.03 + 1.96 / (1 + e((V - 29.83) / 3.32))
    minfKf = 1 / (1 + e((V + 17.55) / (-7.27))); mtauKf = 1.94 + 2.66 / (1 + e((V - 8.12) / 7.96))
    hinfK = 1 / (1 + e((V + 45) / 6)); htauK = 1.79 + 515.8 / (1 + e((V + 147.4) / 28.66))
    hinfK2 = 1 / (1 + e((V + 44.2) / 1.5)) if h2_as_written else hinfK
    minfNa = 1 / (1 + e((V + 29.13) / (-8.922))); mtauNa = 3.861 - 3.434 / (1 + e((V + 51.35) / (-5.98)))
    hinfNa = 1 / (1 + e((V + 40) / 6.048)); htauNa = 2.834 - 2.371 / (1 + e((V + 21.9) / (-2.641)))
    minfNap = 1 / (1 + e((V + 48.77) / (-3.68)))
    Iks = G_KS * mKs ** 4 * (V - E_K)
    Ikf = G_KF * mKf ** 4 * (FH * hKf + (1 - FH) * hKf2) * (V - E_K)
    Ina = G_NAT * mNa ** 3 * hNa * (V - E_NA)
    Inap = G_NAP * mNaP * (V - E_NA)
    dV = -1 / C_M * (Iks + Ikf + Ina + Inap + G_LEAK * (V - E_LEAK) - I)
    return (dV, (minfKs - mKs) / mtauKs, (minfKf - mKf) / mtauKf, (hinfK - hKf) / htauK, (hinfK2 - hKf2) / 116.0,
            (minfNa - mNa) / mtauNa, (hinfNa - hNa) / htauNa, (minfNap - mNaP) / 1.0)


def xpp_euler(i_pulse: float, dt: float = 0.001, t_end: float = T_TOTAL, i_hold: float = I_HOLD, t_on: float = T_PULSE_ON,
              t_off: float = T_PULSE_OFF, y0=None, nout: int = 50, h2_as_written: bool = True):
    """Forward-Euler integration exactly as in the published XPP file (meth=euler, dt=.001,
    global events at t=10 and t=510).  Returns (t, V) sampled every `nout` steps."""
    y0 = y0 or [XPP_SETTLED_STATE[k] for k in ("V", "mKs", "mKf", "hKf", "hKf2", "mNa", "hNa", "mNaP")]
    y = list(y0)
    n = int(round(t_end / dt))
    ts, Vs = [0.0], [y[0]]
    for k in range(1, n + 1):
        t = k * dt
        I = i_pulse if (t_on <= t - dt < t_off) else i_hold
        d = xpp_rhs(y, I, h2_as_written)
        y = [yi + dt * di for yi, di in zip(y, d)]
        if k % nout == 0:
            ts.append(t); Vs.append(y[0])
    return np.array(ts), np.array(Vs)


def steady_state_at_current(i_hold: float, h2_as_written: bool = True, V_lo=-100.0, V_hi=0.0) -> dict:
    """Settled state at a holding current from the published equations (all gates at x_inf)."""
    def net(V):
        e = math.exp
        mKs = 1 / (1 + e((V + 12.85) / (-19.91))); mKf = 1 / (1 + e((V + 17.55) / (-7.27)))
        hKf = 1 / (1 + e((V + 45) / 6)); hKf2 = 1 / (1 + e((V + 44.2) / 1.5)) if h2_as_written else hKf
        mNa = 1 / (1 + e((V + 29.13) / (-8.922))); hNa = 1 / (1 + e((V + 40) / 6.048)); mNaP = 1 / (1 + e((V + 48.77) / (-3.68)))
        I = (G_KS * mKs ** 4 * (V - E_K) + G_KF * mKf ** 4 * (FH * hKf + (1 - FH) * hKf2) * (V - E_K)
             + G_NAT * mNa ** 3 * hNa * (V - E_NA) + G_NAP * mNaP * (V - E_NA) + G_LEAK * (V - E_LEAK) - i_hold)
        return I, dict(V=V, mKs=mKs, mKf=mKf, hKf=hKf, hKf2=hKf2, mNa=mNa, hNa=hNa, mNaP=mNaP)
    grid = np.arange(V_lo, V_hi, 0.25)
    vals = [net(v)[0] for v in grid]
    for i in range(len(grid) - 1):
        if vals[i] < 0 <= vals[i + 1]:
            lo, hi = grid[i], grid[i + 1]
            for _ in range(60):
                mid = 0.5 * (lo + hi)
                if net(mid)[0] < 0:
                    lo = mid
                else:
                    hi = mid
            return net(0.5 * (lo + hi))[1]
    raise RuntimeError("no resting state found")
